import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getWalletController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });

    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({
      success: true,
      balance: user?.walletBalance || 0,
      transactions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const topUpWalletSandboxController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { amount, paymentMethod = 'CARD_SANDBOX' } = req.body;

    const creditAmount = parseFloat(amount);
    if (!creditAmount || creditAmount <= 0) {
      res.status(400).json({ success: false, message: 'Invalid top-up amount' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: creditAmount } },
    });

    const transaction = await prisma.walletTransaction.create({
      data: {
        userId: userId!,
        amount: creditAmount,
        type: 'CREDIT',
        reason: `TOPUP_${paymentMethod}`,
      },
    });

    res.json({
      success: true,
      message: `تم شحن المحفظة بمبلغ ${creditAmount} جنيه مصري بنجاح (Sandbox)`,
      balance: updatedUser.walletBalance,
      transaction,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
