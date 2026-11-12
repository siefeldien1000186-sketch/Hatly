import { config } from '../config';

// In-memory OTP storage for sandbox testing
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export const sendOtp = async (phone: string): Promise<{ success: boolean; message: string; debugOtp?: string }> => {
  // Normalize Egyptian phone number (e.g. 01011112222 -> +201011112222)
  const normalizedPhone = phone.startsWith('+') ? phone : `+20${phone.replace(/^0+/, '')}`;
  
  // Use mock OTP for sandbox, or generate random 4-digit code in production
  const code = config.mockOtpCode || Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(normalizedPhone, { code, expiresAt });

  console.log(`[Hatly OTP Service] Sent OTP [${code}] to ${normalizedPhone}`);

  return {
    success: true,
    message: 'تم إرسال رمز التحقق بنجاح / Verification code sent successfully',
    debugOtp: code, // Conveniently returned in development for automated testing & UI ease
  };
};

export const verifyOtp = async (phone: string, code: string): Promise<boolean> => {
  const normalizedPhone = phone.startsWith('+') ? phone : `+20${phone.replace(/^0+/, '')}`;

  // Allow default mock OTP "1234" for smooth developer testing
  if (code === config.mockOtpCode) {
    return true;
  }

  const record = otpStore.get(normalizedPhone);
  if (!record) {
    return false;
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedPhone);
    return false;
  }

  if (record.code === code) {
    otpStore.delete(normalizedPhone);
    return true;
  }

  return false;
};
