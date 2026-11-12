import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { calculateFare } from '../services/pricing.service';
import { notifyOrderCreated, notifyOrderStatusUpdated } from '../services/socket.service';

export const estimateFareController = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      serviceType,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      promoCode,
      subtotal,
    } = req.body;

    if (!serviceType || pickupLat == null || pickupLng == null || dropoffLat == null || dropoffLng == null) {
      res.status(400).json({
        success: false,
        message: 'serviceType, pickupLat, pickupLng, dropoffLat, and dropoffLng are required',
      });
      return;
    }

    const fare = await calculateFare({
      serviceType,
      pickupLat: parseFloat(pickupLat),
      pickupLng: parseFloat(pickupLng),
      dropoffLat: parseFloat(dropoffLat),
      dropoffLng: parseFloat(dropoffLng),
      promoCode,
      subtotal: subtotal ? parseFloat(subtotal) : 0,
    });

    res.json({ success: true, fare });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrderController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      serviceType,
      storeId,
      pickupAddress,
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffLat,
      dropoffLng,
      packageRecipient,
      packagePhone,
      packageNote,
      items, // array of { productId, nameAr, nameEn, price, quantity, options }
      paymentMethod = 'CASH',
      promoCode,
      customerNotes,
    } = req.body;

    if (!serviceType || !pickupAddress || !dropoffAddress || pickupLat == null || pickupLng == null || dropoffLat == null || dropoffLng == null) {
      res.status(400).json({ success: false, message: 'Missing required order details' });
      return;
    }

    // Calculate subtotal for items if provided
    let calculatedSubtotal = 0;
    if (items && Array.isArray(items) && items.length > 0) {
      calculatedSubtotal = items.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
    }

    const fare = await calculateFare({
      serviceType,
      pickupLat: parseFloat(pickupLat),
      pickupLng: parseFloat(pickupLng),
      dropoffLat: parseFloat(dropoffLat),
      dropoffLng: parseFloat(dropoffLng),
      promoCode,
      subtotal: calculatedSubtotal,
    });

    // Check customer wallet if payment method is WALLET
    const customer = await prisma.user.findUnique({ where: { id: customerId } });
    if (paymentMethod === 'WALLET') {
      if (!customer || customer.walletBalance < fare.totalAmount) {
        res.status(400).json({
          success: false,
          message: 'رصيد المحفظة غير كافٍ لإتمام الطلب / Insufficient wallet balance',
        });
        return;
      }
    }

    const orderNumber = `HAT-${Math.floor(10000 + Math.random() * 90000)}`;

    // Initial status:
    // If Food/Market/Shopping with storeId -> STORE_PENDING (restaurant accepts first)
    // If Ride or Express -> PENDING_DRIVER (radar directly)
    const initialStatus = storeId ? 'STORE_PENDING' : 'PENDING_DRIVER';

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        storeId: storeId || null,
        serviceType,
        status: initialStatus,
        pickupAddress,
        pickupLat: parseFloat(pickupLat),
        pickupLng: parseFloat(pickupLng),
        dropoffAddress,
        dropoffLat: parseFloat(dropoffLat),
        dropoffLng: parseFloat(dropoffLng),
        distanceKm: fare.distanceKm,
        durationMinutes: fare.durationMinutes,
        packageRecipient: packageRecipient || null,
        packagePhone: packagePhone || null,
        packageNote: packageNote || null,
        subtotal: calculatedSubtotal,
        deliveryFee: fare.deliveryFee,
        serviceFee: fare.serviceFee,
        tax: 0.0,
        discount: fare.discount,
        totalAmount: fare.totalAmount,
        driverEarnings: fare.driverEarnings,
        platformFee: fare.platformFee,
        paymentMethod,
        paymentStatus: paymentMethod === 'WALLET' ? 'PAID' : 'PENDING',
        promoCodeApplied: promoCode || null,
        customerNotes: customerNotes || null,
        items: items && items.length > 0 ? {
          create: items.map((item: any) => ({
            productId: item.productId,
            nameAr: item.nameAr || 'منتج',
            nameEn: item.nameEn || 'Item',
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity || '1', 10),
            options: item.options ? JSON.stringify(item.options) : null,
          })),
        } : undefined,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true, avatar: true } },
        store: { select: { id: true, nameAr: true, nameEn: true, phone: true, logo: true } },
        driver: { include: { user: { select: { name: true, phone: true, avatar: true } } } },
        items: true,
      },
    });

    // If paid by wallet, deduct balance and record transaction
    if (paymentMethod === 'WALLET') {
      await prisma.user.update({
        where: { id: customerId },
        data: { walletBalance: { decrement: fare.totalAmount } },
      });
      await prisma.walletTransaction.create({
        data: {
          userId: customerId,
          amount: fare.totalAmount,
          type: 'DEBIT',
          reason: `PAYMENT_ORDER_${order.orderNumber}`,
          referenceId: order.id,
        },
      });
    }

    // Increment promo usage if used
    if (promoCode) {
      await prisma.promoCode.update({
        where: { code: promoCode.toUpperCase() },
        data: { usedCount: { increment: 1 } },
      }).catch(() => {});
    }

    // Broadcast realtime event
    notifyOrderCreated(order);

    res.status(201).json({
      success: true,
      order,
      message: 'تم إنشاء الطلب بنجاح / Order created successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderByIdController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, phone: true, avatar: true } },
        driver: {
          include: {
            user: { select: { name: true, phone: true, avatar: true } },
          },
        },
        store: true,
        items: true,
        reviews: true,
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerOrdersController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        store: { select: { nameAr: true, nameEn: true, logo: true } },
        driver: { include: { user: { select: { name: true, phone: true } } } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelOrderController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const userId = req.user?.id;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      res.status(400).json({ success: false, message: 'Cannot cancel an order that is already completed or cancelled' });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason || 'Cancelled by user',
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        driver: { include: { user: { select: { name: true, phone: true } } } },
      },
    });

    // Refund if paid by wallet
    if (order.paymentMethod === 'WALLET' && order.paymentStatus === 'PAID') {
      await prisma.user.update({
        where: { id: order.customerId },
        data: { walletBalance: { increment: order.totalAmount } },
      });
      await prisma.walletTransaction.create({
        data: {
          userId: order.customerId,
          amount: order.totalAmount,
          type: 'CREDIT',
          reason: `REFUND_ORDER_${order.orderNumber}`,
          referenceId: order.id,
        },
      });
      await prisma.order.update({
        where: { id },
        data: { paymentStatus: 'REFUNDED' },
      });
    }

    notifyOrderStatusUpdated(updatedOrder);

    res.json({
      success: true,
      message: 'تم إلغاء الطلب بنجاح / Order cancelled successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
