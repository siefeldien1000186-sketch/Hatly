import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'hatly_super_app_ultra_secure_jwt_secret_egypt_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  defaultCity: process.env.DEFAULT_CITY || 'Alexandria',
  defaultLat: parseFloat(process.env.DEFAULT_LAT || '31.2001'),
  defaultLng: parseFloat(process.env.DEFAULT_LNG || '29.9187'),
  smsProvider: process.env.SMS_PROVIDER || 'SANDBOX',
  mockOtpCode: process.env.MOCK_OTP_CODE || '1234',
  paymentProvider: process.env.PAYMENT_GATEWAY_PROVIDER || 'SANDBOX',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@hatly.eg',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@Hatly2026Secure!',
  adminPhone: process.env.ADMIN_PHONE || '01000000001',
};
