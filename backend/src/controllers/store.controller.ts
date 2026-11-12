import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { notifyOrderStatusUpdated, notifyOrderCreated } from '../services/socket.service';

export const getAllStoresController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, search } = req.query;

    const stores = await prisma.store.findMany({
      where: {
        verificationStatus: 'APPROVED',
        isOpen: true,
        ...(type ? { type: String(type) } : {}),
        ...(search
          ? {
              OR: [
                { nameAr: { contains: String(search) } },
                { nameEn: { contains: String(search) } },
              ],
            }
          : {}),
      },
      include: {
        categories: {
          include: {
            products: {
              where: { isAvailable: true },
            },
          },
        },
      },
    });

    res.json({ success: true, stores });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStoreByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            products: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!store) {
      res.status(404).json({ success: false, message: 'Store not found' });
      return;
    }

    res.json({ success: true, store });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyStoreController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const store = await prisma.store.findUnique({
      where: { ownerId: userId },
      include: {
        categories: {
          include: { products: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!store) {
      res.status(404).json({ success: false, message: 'Store profile not found for this user' });
      return;
    }

    // Active incoming orders
    const orders = await prisma.order.findMany({
      where: { storeId: store.id },
      include: {
        customer: { select: { name: true, phone: true } },
        driver: { include: { user: { select: { name: true, phone: true } } } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, store, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleStoreOpenController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const store = await prisma.store.findUnique({ where: { ownerId: userId } });

    if (!store) {
      res.status(404).json({ success: false, message: 'Store not found' });
      return;
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: { isOpen: !store.isOpen },
    });

    res.json({
      success: true,
      isOpen: updated.isOpen,
      message: updated.isOpen ? 'المتجر متاح لاستقبال الطلبات الآن' : 'المتجر مغلق حالياً',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCategoryController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { nameAr, nameEn } = req.body;

    const store = await prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      res.status(404).json({ success: false, message: 'Store not found' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        storeId: store.id,
        nameAr,
        nameEn,
      },
    });

    res.status(201).json({ success: true, category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addProductController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { categoryId, nameAr, nameEn, descriptionAr, descriptionEn, price, originalPrice, image } = req.body;

    const store = await prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      res.status(404).json({ success: false, message: 'Store not found' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId,
        nameAr,
        nameEn,
        descriptionAr,
        descriptionEn,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        isAvailable: true,
      },
    });

    res.status(201).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProductController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { nameAr, nameEn, descriptionAr, descriptionEn, price, originalPrice, image, isAvailable } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(nameAr ? { nameAr } : {}),
        ...(nameEn ? { nameEn } : {}),
        ...(descriptionAr !== undefined ? { descriptionAr } : {}),
        ...(descriptionEn !== undefined ? { descriptionEn } : {}),
        ...(price !== undefined ? { price: parseFloat(price) } : {}),
        ...(originalPrice !== undefined ? { originalPrice: parseFloat(originalPrice) } : {}),
        ...(image ? { image } : {}),
        ...(isAvailable !== undefined ? { isAvailable: Boolean(isAvailable) } : {}),
      },
    });

    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProductController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStoreOrderStatusController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { orderId, status } = req.body;

    // Allowed store status transitions: STORE_PREPARING, STORE_READY, CANCELLED
    if (!['STORE_PREPARING', 'STORE_READY', 'CANCELLED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid store status' });
      return;
    }

    const store = await prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      res.status(404).json({ success: false, message: 'Store not found' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.storeId !== store.id) {
      res.status(403).json({ success: false, message: 'Unauthorized for this order' });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        driver: { include: { user: { select: { name: true, phone: true } } } },
        store: true,
        items: true,
      },
    });

    notifyOrderStatusUpdated(updatedOrder);

    // If STORE_READY, notify drivers on radar that food is ready for delivery
    if (status === 'STORE_READY') {
      notifyOrderCreated(updatedOrder);
    }

    res.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
