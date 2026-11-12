import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { notifyOrderStatusUpdated } from '../services/socket.service';

export const toggleOnlineController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const driver = await prisma.driver.findUnique({ where: { userId } });

    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver profile not found' });
      return;
    }

    if (driver.verificationStatus !== 'APPROVED') {
      res.status(403).json({
        success: false,
        message: 'الحساب قيد المراجعة والتوثيق من إدارة هاتلي / Driver account pending admin verification',
      });
      return;
    }

    const updated = await prisma.driver.update({
      where: { id: driver.id },
      data: { isOnline: !driver.isOnline },
    });

    res.json({
      success: true,
      isOnline: updated.isOnline,
      message: updated.isOnline
        ? 'أنت الآن متاح لتلقي الطلبات / You are now Online'
        : 'أنت الآن غير متاح / You are now Offline',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLocationController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { lat, lng } = req.body;

    if (lat == null || lng == null) {
      res.status(400).json({ success: false, message: 'Latitude and Longitude required' });
      return;
    }

    const driver = await prisma.driver.findUnique({ where: { userId } });
    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver profile not found' });
      return;
    }

    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        currentLat: parseFloat(lat),
        currentLng: parseFloat(lng),
        lastLocationUpdate: new Date(),
      },
    });

    res.json({ success: true, message: 'Location updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRadarRequestsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const driver = await prisma.driver.findUnique({ where: { userId } });

    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver profile not found' });
      return;
    }

    // Orders available:
    // 1) Rides / Express where status == PENDING_DRIVER
    // 2) Food / Market / Shopping where status == STORE_READY (or PENDING_DRIVER)
    const availableOrders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING_DRIVER', 'STORE_READY'] },
        driverId: null,
      },
      include: {
        customer: { select: { name: true, phone: true } },
        store: { select: { nameAr: true, nameEn: true, address: true, phone: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ success: true, orders: availableOrders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptOrderController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({ success: false, message: 'orderId is required' });
      return;
    }

    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: { user: { select: { name: true, phone: true, avatar: true } } },
    });

    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver not found' });
      return;
    }

    // Check if driver is approved
    if (driver.verificationStatus !== 'APPROVED') {
      res.status(403).json({ success: false, message: 'Driver must be verified to accept trips' });
      return;
    }

    // Ensure order is still available
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.driverId || !['PENDING_DRIVER', 'STORE_READY'].includes(order.status)) {
      res.status(409).json({ success: false, message: 'عفواً، تم قبول هذا الطلب من كابتن آخر / Order already taken by another driver' });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        driverId: driver.id,
        status: 'DRIVER_ASSIGNED',
      },
      include: {
        customer: { select: { id: true, name: true, phone: true, avatar: true } },
        driver: {
          include: {
            user: { select: { name: true, phone: true, avatar: true } },
          },
        },
        store: true,
        items: true,
      },
    });

    notifyOrderStatusUpdated(updatedOrder);

    res.json({
      success: true,
      message: 'تم قبول الطلب بنجاح / Order accepted successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTripStatusController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const { orderId, status } = req.body;

    // Allowed driver status transitions: DRIVER_ARRIVED, IN_PROGRESS, COMPLETED
    if (!['DRIVER_ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status transition' });
      return;
    }

    const driver = await prisma.driver.findUnique({ where: { userId } });
    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver not found' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order || order.driverId !== driver.id) {
      res.status(403).json({ success: false, message: 'Not authorized for this order' });
      return;
    }

    let paymentStatus = order.paymentStatus;
    if (status === 'COMPLETED') {
      paymentStatus = 'PAID';

      // 1. Credit driver earnings & update stats
      await prisma.driver.update({
        where: { id: driver.id },
        data: {
          totalTrips: { increment: 1 },
          totalEarnings: { increment: order.driverEarnings },
          commissionOwed: { increment: order.platformFee },
        },
      });

      // 2. Add driver transaction
      await prisma.walletTransaction.create({
        data: {
          userId,
          amount: order.driverEarnings,
          type: 'CREDIT',
          reason: `EARNINGS_ORDER_${order.orderNumber}`,
          referenceId: order.id,
        },
      });

      // 3. Credit driver wallet
      await prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: order.driverEarnings } },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        paymentStatus,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true, avatar: true } },
        driver: {
          include: {
            user: { select: { name: true, phone: true, avatar: true } },
          },
        },
        store: true,
        items: true,
      },
    });

    notifyOrderStatusUpdated(updatedOrder);

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDriverStatsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver not found' });
      return;
    }

    // Active order if any
    const activeOrder = await prisma.order.findFirst({
      where: {
        driverId: driver.id,
        status: { in: ['DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS'] },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true, avatar: true } },
        store: true,
        items: true,
      },
    });

    // Completed trips today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayOrders = await prisma.order.findMany({
      where: {
        driverId: driver.id,
        status: 'COMPLETED',
        updatedAt: { gte: startOfDay },
      },
    });

    const todayEarnings = todayOrders.reduce((acc, o) => acc + o.driverEarnings, 0);

    res.json({
      success: true,
      stats: {
        driverId: driver.id,
        isOnline: driver.isOnline,
        verificationStatus: driver.verificationStatus,
        rating: driver.rating,
        totalTrips: driver.totalTrips,
        totalEarnings: driver.totalEarnings,
        todayEarnings,
        todayTripsCount: todayOrders.length,
        commissionOwed: driver.commissionOwed,
        walletBalance: driver.user.walletBalance,
        vehicle: {
          type: driver.vehicleType,
          model: driver.vehicleModel,
          plate: driver.vehiclePlate,
          color: driver.vehicleColor,
          year: driver.vehicleYear,
        },
        activeOrder,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestWithdrawalController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const { amount, method, accountDetails } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0 || withdrawAmount > user.walletBalance) {
      res.status(400).json({
        success: false,
        message: 'رصيد المحفظة غير كافٍ لهذا السحب / Insufficient balance for withdrawal',
      });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { decrement: withdrawAmount } },
    });

    await prisma.walletTransaction.create({
      data: {
        userId,
        amount: withdrawAmount,
        type: 'DEBIT',
        reason: `WITHDRAWAL_${method || 'INSTAPAY'}_${accountDetails || ''}`,
      },
    });

    res.json({
      success: true,
      message: 'تم تقديم طلب السحب بنجاح، سيصلك التحويل خلال ساعتين / Withdrawal request submitted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
