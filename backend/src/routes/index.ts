import { Router } from 'express';
import {
  requestOtpController,
  verifyOtpController,
  loginController,
  registerController,
  forgotPasswordController,
  resetPasswordController,
  getMeController,
} from '../controllers/auth.controller';
import {
  estimateFareController,
  createOrderController,
  getOrderByIdController,
  getCustomerOrdersController,
  cancelOrderController,
} from '../controllers/order.controller';
import {
  toggleOnlineController,
  updateLocationController,
  getRadarRequestsController,
  acceptOrderController,
  updateTripStatusController,
  getDriverStatsController,
  requestWithdrawalController,
} from '../controllers/driver.controller';
import {
  getAllStoresController,
  getStoreByIdController,
  getMyStoreController,
  toggleStoreOpenController,
  addCategoryController,
  addProductController,
  updateProductController,
  deleteProductController,
  updateStoreOrderStatusController,
} from '../controllers/store.controller';
import {
  getDashboardAnalyticsController,
  getAllOrdersAdminController,
  getAllDriversAdminController,
  verifyDriverAdminController,
  getAllUsersAdminController,
  toggleBlockUserAdminController,
  getPricingRulesAdminController,
  updatePricingRuleAdminController,
  getPromoCodesAdminController,
  createPromoCodeAdminController,
  getServiceZonesAdminController,
  toggleServiceZoneAdminController,
  getPendingApplicationsAdminController,
  reviewApplicationAdminController,
  updateOrderStatusAdminController,
  deletePromoCodeAdminController,
  getAllStoresAdminController,
  toggleStoreStatusAdminController,
  getAllSupportTicketsAdminController,
  resolveSupportTicketAdminController,
} from '../controllers/admin.controller';
import {
  getWalletController,
  topUpWalletSandboxController,
} from '../controllers/wallet.controller';
import { createReviewController } from '../controllers/review.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// --- AUTH & PROFILE ---
router.post('/auth/otp/request', requestOtpController);
router.post('/auth/otp/verify', verifyOtpController);
router.post('/auth/login', loginController);
router.post('/auth/register', registerController);
router.post('/auth/forgot-password', forgotPasswordController);
router.post('/auth/reset-password', resetPasswordController);
router.get('/auth/me', authenticate, getMeController);

// --- ORDERS & PRICING ---
router.post('/orders/estimate', estimateFareController);
router.post('/orders', authenticate, createOrderController);
router.get('/orders/my', authenticate, getCustomerOrdersController);
router.get('/orders/:id', authenticate, getOrderByIdController);
router.post('/orders/:id/cancel', authenticate, cancelOrderController);

// --- DRIVER ROUTES ---
router.post('/driver/toggle-online', authenticate, authorize('DRIVER', 'ADMIN'), toggleOnlineController);
router.post('/driver/location', authenticate, authorize('DRIVER', 'ADMIN'), updateLocationController);
router.get('/driver/radar', authenticate, authorize('DRIVER', 'ADMIN'), getRadarRequestsController);
router.post('/driver/accept-order', authenticate, authorize('DRIVER', 'ADMIN'), acceptOrderController);
router.post('/driver/trip-status', authenticate, authorize('DRIVER', 'ADMIN'), updateTripStatusController);
router.get('/driver/stats', authenticate, authorize('DRIVER', 'ADMIN'), getDriverStatsController);
router.post('/driver/withdraw', authenticate, authorize('DRIVER', 'ADMIN'), requestWithdrawalController);

// --- STORES & RESTAURANTS ---
router.get('/stores', getAllStoresController);
router.get('/stores/:id', getStoreByIdController);
router.get('/store/my', authenticate, authorize('STORE_OWNER', 'ADMIN'), getMyStoreController);
router.post('/store/toggle-open', authenticate, authorize('STORE_OWNER', 'ADMIN'), toggleStoreOpenController);
router.post('/store/category', authenticate, authorize('STORE_OWNER', 'ADMIN'), addCategoryController);
router.post('/store/product', authenticate, authorize('STORE_OWNER', 'ADMIN'), addProductController);
router.put('/store/product/:id', authenticate, authorize('STORE_OWNER', 'ADMIN'), updateProductController);
router.delete('/store/product/:id', authenticate, authorize('STORE_OWNER', 'ADMIN'), deleteProductController);
router.post('/store/order-status', authenticate, authorize('STORE_OWNER', 'ADMIN'), updateStoreOrderStatusController);

// --- WALLET & PAYMENTS ---
router.get('/wallet', authenticate, getWalletController);
router.post('/wallet/top-up', authenticate, topUpWalletSandboxController);

// --- REVIEWS ---
router.post('/reviews', authenticate, createReviewController);

// --- ADMIN CONTROL PANEL ---
router.get('/admin/analytics', authenticate, authorize('ADMIN'), getDashboardAnalyticsController);
router.get('/admin/orders', authenticate, authorize('ADMIN'), getAllOrdersAdminController);
router.get('/admin/drivers', authenticate, authorize('ADMIN'), getAllDriversAdminController);
router.patch('/admin/drivers/:id/verify', authenticate, authorize('ADMIN'), verifyDriverAdminController);
router.get('/admin/users', authenticate, authorize('ADMIN'), getAllUsersAdminController);
router.patch('/admin/users/:id/block', authenticate, authorize('ADMIN'), toggleBlockUserAdminController);
router.get('/admin/pricing-rules', authenticate, authorize('ADMIN'), getPricingRulesAdminController);
router.put('/admin/pricing-rules/:id', authenticate, authorize('ADMIN'), updatePricingRuleAdminController);
router.get('/admin/promos', authenticate, authorize('ADMIN'), getPromoCodesAdminController);
router.post('/admin/promos', authenticate, authorize('ADMIN'), createPromoCodeAdminController);
router.get('/admin/zones', authenticate, authorize('ADMIN'), getServiceZonesAdminController);
router.post('/admin/zones/:id/toggle', authenticate, authorize('ADMIN'), toggleServiceZoneAdminController);
router.get('/admin/applications', authenticate, authorize('ADMIN'), getPendingApplicationsAdminController);
router.post('/admin/applications/review', authenticate, authorize('ADMIN'), reviewApplicationAdminController);
router.put('/admin/orders/:id/status', authenticate, authorize('ADMIN'), updateOrderStatusAdminController);
router.delete('/admin/promos/:id', authenticate, authorize('ADMIN'), deletePromoCodeAdminController);
router.get('/admin/stores', authenticate, authorize('ADMIN'), getAllStoresAdminController);
router.post('/admin/stores/:id/toggle', authenticate, authorize('ADMIN'), toggleStoreStatusAdminController);
router.get('/admin/support-tickets', authenticate, authorize('ADMIN'), getAllSupportTicketsAdminController);
router.put('/admin/support-tickets/:id/resolve', authenticate, authorize('ADMIN'), resolveSupportTicketAdminController);

export default router;
