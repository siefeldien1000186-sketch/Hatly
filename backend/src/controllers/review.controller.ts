import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createReviewController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviewerId = req.user?.id;
    const { orderId, targetType, targetId, rating, comment } = req.body;

    if (!orderId || !targetType || !targetId || !rating) {
      res.status(400).json({ success: false, message: 'Missing review parameters' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        reviewerId: reviewerId!,
        targetType,
        targetId,
        rating: parseInt(rating, 10),
        comment: comment || null,
      },
    });

    // Update driver or store average rating
    if (targetType === 'DRIVER') {
      const allDriverReviews = await prisma.review.findMany({
        where: { targetType: 'DRIVER', targetId },
      });
      const avg = allDriverReviews.reduce((sum, r) => sum + r.rating, 0) / allDriverReviews.length;
      await prisma.driver.update({
        where: { id: targetId },
        data: { rating: Math.round(avg * 10) / 10 },
      });
    } else if (targetType === 'STORE') {
      const allStoreReviews = await prisma.review.findMany({
        where: { targetType: 'STORE', targetId },
      });
      const avg = allStoreReviews.reduce((sum, r) => sum + r.rating, 0) / allStoreReviews.length;
      await prisma.store.update({
        where: { id: targetId },
        data: { rating: Math.round(avg * 10) / 10 },
      });
    }

    res.status(201).json({
      success: true,
      message: 'شكراً لتقييمك! / Thank you for your review',
      review,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
