import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDashboardAnalyticsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalDrivers = await prisma.driver.count();
    const approvedDrivers = await prisma.driver.count({ where: { verificationStatus: 'APPROVED' } });
    const onlineDrivers = await prisma.driver.count({ where: { isOnline: true } });
    const totalStores = await prisma.store.count();
    const totalOrders = await prisma.order.count();
    const completedOrders = await prisma.order.count({ where: { status: 'COMPLETED' } });
    const activeOrders = await prisma.order.count({
      where: {
        status: { in: ['PENDING_DRIVER', 'STORE_PENDING', 'STORE_PREPARING', 'STORE_READY', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS'] },
      },
    });

    const ordersSum = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
        platformFee: true,
        driverEarnings: true,
      },
      where: { status: 'COMPLETED' },
    });

    // Breakdown by service
    const foodOrdersCount = await prisma.order.count({ where: { serviceType: 'FOOD' } });
    const expressOrdersCount = await prisma.order.count({ where: { serviceType: 'EXPRESS' } });
    const marketOrdersCount = await prisma.order.count({ where: { serviceType: 'MARKET' } });
    const shoppingOrdersCount = await prisma.order.count({ where: { serviceType: 'SHOPPING' } });

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalDrivers,
        approvedDrivers,
        onlineDrivers,
        totalStores,
        totalOrders,
        completedOrders,
        activeOrders,
        financials: {
          totalGrossVolume: ordersSum._sum.totalAmount || 0,
          totalPlatformRevenue: ordersSum._sum.platformFee || 0,
          totalDriverEarnings: ordersSum._sum.driverEarnings || 0,
        },
        servicesBreakdown: {
          FOOD: foodOrdersCount,
          EXPRESS: expressOrdersCount,
          MARKET: marketOrdersCount,
          SHOPPING: shoppingOrdersCount,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrdersAdminController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, serviceType, search } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        ...(status ? { status: String(status) } : {}),
        ...(serviceType ? { serviceType: String(serviceType) } : {}),
        ...(search ? { orderNumber: { contains: String(search) } } : {}),
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        driver: { include: { user: { select: { name: true, phone: true } } } },
        store: { select: { nameAr: true, nameEn: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllDriversAdminController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const drivers = await prisma.driver.findMany({
      where: {
        ...(status ? { verificationStatus: String(status) } : {}),
      },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, isBlocked: true, walletBalance: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, drivers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyDriverAdminController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { verificationStatus } = req.body; // APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(verificationStatus)) {
      res.status(400).json({ success: false, message: 'Invalid verification status' });
      return;
    }

    const driver = await prisma.driver.update({
      where: { id },
      data: { verificationStatus },
      include: { user: true },
    });

    res.json({
      success: true,
      message: `تم تحديث حالة السائق إلى ${verificationStatus} بنجاح`,
      driver,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsersAdminController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        driverProfile: true,
        storeProfile: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBlockUserAdminController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked },
    });

    res.json({
      success: true,
      isBlocked: updated.isBlocked,
      message: updated.isBlocked ? 'تم حظر المستخدم بنجاح' : 'تم فك حظر المستخدم بنجاح',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPricingRulesAdminController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rules = await prisma.pricingRule.findMany();
    res.json({ success: true, rules });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePricingRuleAdminController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const {
      baseFare,
      perKmRate,
      perMinuteRate,
      minimumFare,
      serviceFee,
      surgeMultiplier,
      driverCommissionPercent,
      isActive,
    } = req.body;

    const rule = await prisma.pricingRule.update({
      where: { id },
      data: {
        ...(baseFare !== undefined ? { baseFare: parseFloat(baseFare) } : {}),
        ...(perKmRate !== undefined ? { perKmRate: parseFloat(perKmRate) } : {}),
        ...(perMinuteRate !== undefined ? { perMinuteRate: parseFloat(perMinuteRate) } : {}),
        ...(minimumFare !== undefined ? { minimumFare: parseFloat(minimumFare) } : {}),
        ...(serviceFee !== undefined ? { serviceFee: parseFloat(serviceFee) } : {}),
        ...(surgeMultiplier !== undefined ? { surgeMultiplier: parseFloat(surgeMultiplier) } : {}),
        ...(driverCommissionPercent !== undefined ? { driverCommissionPercent: parseFloat(driverCommissionPercent) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    res.json({ success: true, rule, message: 'تم تحديث معادلة التسعير بنجاح' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPromoCodesAdminController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, promos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPromoCodeAdminController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, discountPercent, maxDiscount, minOrderAmount, expiryDays, usageLimit } = req.body;

    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase().trim(),
        discountPercent: parseFloat(discountPercent),
        maxDiscount: parseFloat(maxDiscount),
        minOrderAmount: parseFloat(minOrderAmount || '0'),
        expiryDate: new Date(Date.now() + (parseInt(expiryDays || '30', 10) * 24 * 60 * 60 * 1000)),
        usageLimit: parseInt(usageLimit || '1000', 10),
      },
    });

    res.status(201).json({ success: true, promo, message: 'كود الخصم أُنشئ بنجاح' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- SERVICE ZONES (Alexandria, El King, Borg El Arab) ---
export const getServiceZonesAdminController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let zones = await prisma.serviceZone.findMany({ orderBy: { createdAt: 'asc' } });
    if (zones.length === 0) {
      // Seed default Alexandria operational zones
      await prisma.serviceZone.createMany({
        data: [
          {
            zoneKey: 'alexandria_central',
            nameAr: 'الإسكندرية الكبرى (وسط وشرق والعجمي)',
            nameEn: 'Greater Alexandria (Central, East & Agami)',
            centerLat: 31.2001,
            centerLng: 29.9187,
            radiusKm: 25.0,
            isActive: true,
            baseDeliveryFee: 20.0,
          },
          {
            zoneKey: 'el_king_mariout',
            nameAr: 'منطقة كينج مريوط (الكينج والواحات والفلل)',
            nameEn: 'King Mariout & El King Area',
            centerLat: 31.0125,
            centerLng: 29.7610,
            radiusKm: 15.0,
            isActive: true,
            baseDeliveryFee: 25.0,
          },
          {
            zoneKey: 'borg_el_arab',
            nameAr: 'برج العرب والمدينة الجديدة والمطار',
            nameEn: 'Borg El Arab & New City',
            centerLat: 30.9167,
            centerLng: 29.6167,
            radiusKm: 20.0,
            isActive: true,
            baseDeliveryFee: 30.0,
          },
        ],
      });
      zones = await prisma.serviceZone.findMany({ orderBy: { createdAt: 'asc' } });
    }
    res.json({ success: true, zones });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleServiceZoneAdminController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const zone = await prisma.serviceZone.findUnique({ where: { id } });
    if (!zone) {
      res.status(404).json({ success: false, message: 'Service zone not found' });
      return;
    }

    const updated = await prisma.serviceZone.update({
      where: { id },
      data: { isActive: !zone.isActive },
    });

    res.json({
      success: true,
      zone: updated,
      message: updated.isActive ? 'تم تفعيل منطقة التغطية بنجاح' : 'تم تعطيل منطقة التغطية مؤقتاً',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- PENDING ONBOARDING APPLICATIONS (Captains, Restaurants, Business Owners) ---
export const getPendingApplicationsAdminController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pendingDrivers = await prisma.driver.findMany({
      where: { verificationStatus: 'PENDING' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const pendingStores = await prisma.store.findMany({
      where: { verificationStatus: 'PENDING' },
      include: { owner: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      pendingApplications: {
        captains: pendingDrivers,
        stores: pendingStores,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewApplicationAdminController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, id, status, rejectionReason } = req.body;
    if (!type || !id || !['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Type, ID, and valid status required' });
      return;
    }

    if (type === 'DRIVER') {
      const driver = await prisma.driver.update({
        where: { id },
        data: {
          verificationStatus: status,
          rejectionReason: status === 'REJECTED' ? rejectionReason || 'وثائق غير مكتملة' : null,
        },
        include: { user: true },
      });

      // Create notification for driver
      await prisma.notification.create({
        data: {
          userId: driver.userId,
          titleAr: status === 'APPROVED' ? 'تهانينا! تم اعتماد حساب الكابتن' : 'تحديث بخصوص طلب انضمام الكابتن',
          titleEn: status === 'APPROVED' ? 'Congratulations! Captain Approved' : 'Captain Application Update',
          bodyAr: status === 'APPROVED'
            ? 'تمت مراجعة أوراقك واعتماد حسابك ككابتن معتمد في هاتلي الإسكندرية. يمكنك الآن تفعيل الحالة لتلقي الطلبات!'
            : `تم رفض الطلب للسبب التالي: ${rejectionReason || 'يرجى إعادة رفع الوثائق المطلوبة بصورة واضحة'}.`,
          bodyEn: status === 'APPROVED' ? 'Your captain profile has been verified and approved.' : 'Application rejected.',
          type: 'SYSTEM',
        },
      });

      res.json({ success: true, message: `تم تحديث حالة الكابتن إلى ${status} بنجاح`, data: driver });
    } else {
      const store = await prisma.store.update({
        where: { id },
        data: {
          verificationStatus: status,
          rejectionReason: status === 'REJECTED' ? rejectionReason || 'وثائق تجارية غير مكتملة' : null,
        },
        include: { owner: true },
      });

      // Create notification for store owner
      await prisma.notification.create({
        data: {
          userId: store.ownerId,
          titleAr: status === 'APPROVED' ? 'تهانينا! تم اعتماد المتجر/المطعم' : 'تحديث بخصوص طلب الشراكة',
          titleEn: status === 'APPROVED' ? 'Partner Store Approved' : 'Partner Store Application Update',
          bodyAr: status === 'APPROVED'
            ? 'تمت مراجعة السجل التجاري والبيانات واعتماد متجرك رسمياً على منصة هاتلي. أصبح متاحاً للزبائن الآن!'
            : `تم رفض الطلب: ${rejectionReason || 'يرجى مراجعة إدارة المنصة'}.`,
          bodyEn: status === 'APPROVED' ? 'Your store is now active and approved.' : 'Store application rejected.',
          type: 'SYSTEM',
        },
      });

      res.json({ success: true, message: `تم تحديث حالة الشريك التجاري إلى ${status} بنجاح`, data: store });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
