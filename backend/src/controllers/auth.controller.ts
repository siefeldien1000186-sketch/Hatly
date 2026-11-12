import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { config } from '../config';
import { sendOtp, verifyOtp } from '../services/otp.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const requestOtpController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ success: false, message: 'Phone number is required' });
      return;
    }

    const result = await sendOtp(phone);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtpController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      res.status(400).json({ success: false, message: 'Phone and code are required' });
      return;
    }

    const isValid = await verifyOtp(phone, code);
    if (!isValid) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      return;
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { phone },
      include: { driverProfile: true, storeProfile: true },
    });

    if (!user) {
      // Return flag that user needs to complete registration
      res.json({
        success: true,
        isNewUser: true,
        phone,
        message: 'OTP verified. Please complete your registration.',
      });
      return;
    }

    // Mark phone as verified
    if (!user.isPhoneVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isPhoneVerified: true },
        include: { driverProfile: true, storeProfile: true },
      });
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      isNewUser: false,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        walletBalance: user.walletBalance,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        driverProfile: user.driverProfile,
        storeProfile: user.storeProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login with either Email OR Mobile Phone + Password
export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const identifier = (req.body.identifier || req.body.phone || req.body.email || '').trim();
    const { password, rememberMe } = req.body;

    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور / Identifier and password required',
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: identifier }, { email: identifier }],
      },
      include: { driverProfile: true, storeProfile: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة، تأكد من رقم الهاتف أو البريد / Invalid credentials',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'كلمة المرور غير صحيحة / Incorrect password',
      });
      return;
    }

    if (user.isBlocked) {
      res.status(403).json({
        success: false,
        message: 'تم تعليق هذا الحساب. يرجى التواصل مع دعم تطبيق هاتلي / Account suspended',
      });
      return;
    }

    const expiresIn = rememberMe ? '30d' : '7d';
    const token = jwt.sign(
      { id: user.id, phone: user.phone, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        walletBalance: user.walletBalance,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        driverProfile: user.driverProfile,
        storeProfile: user.storeProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete Registration with Name, Email, Phone, Password, and Role
export const registerController = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      phone,
      email,
      password,
      confirmPassword,
      role = 'CUSTOMER', // CUSTOMER, DRIVER, RESTAURANT, BUSINESS_OWNER
      language = 'ar',
      // Captain / Driver extra fields
      vehicleType = 'CAR',
      vehicleModel,
      vehiclePlate,
      vehicleYear,
      vehicleColor,
      licenseNumber,
      nationalId,
      dateOfBirth,
      profilePhotoDoc,
      nationalIdFrontDoc,
      nationalIdBackDoc,
      drivingLicenseDoc,
      vehicleRegDoc,
      // Restaurant & Business Owner extra fields
      businessRole, // RESTAURANT or BUSINESS_OWNER
      storeNameAr,
      storeNameEn,
      storeType = 'RESTAURANT', // RESTAURANT, SUPERMARKET, PHARMACY, SHOP
      ownerName,
      storeAddress,
      storeLat,
      storeLng,
      workingHours,
      commercialRegDoc,
      taxCardDoc,
      permitDoc,
    } = req.body;

    // Security: Super Admin cannot be created publicly
    if (role === 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'حسابات الإدارة المركزية غير متاحة للتسجيل العام / Super Admin accounts cannot be created publicly',
      });
      return;
    }

    if (!name || !phone || !password || !email) {
      res.status(400).json({
        success: false,
        message: 'الاسم، البريد الإلكتروني، رقم الهاتف، وكلمة المرور مطلوبة / Name, email, phone, and password required',
      });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'كلمتا المرور غير متطابقتين / Passwords do not match',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'يجب أن تتكون كلمة المرور من ٦ أحرف على الأقل / Password must be at least 6 characters',
      });
      return;
    }

    // Check Phone uniqueness
    const existingPhone = await prisma.user.findUnique({ where: { phone: phone.trim() } });
    if (existingPhone) {
      res.status(400).json({
        success: false,
        message: 'رقم الهاتف مسجل بالفعل في هاتلي / Phone number already registered',
      });
      return;
    }

    // Check Email uniqueness
    const existingEmail = await prisma.user.findFirst({ where: { email: email.trim().toLowerCase() } });
    if (existingEmail) {
      res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مسجل بالفعل في هاتلي / Email already registered',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedUserRole = (role === 'RESTAURANT' || role === 'BUSINESS_OWNER') ? 'STORE_OWNER' : role;

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: assignedUserRole,
        language,
        isEmailVerified: true,
        isPhoneVerified: true,
        walletBalance: role === 'CUSTOMER' ? 50.0 : 0.0, // 50 EGP Egyptian Pound welcome credit
      },
    });

    let driverProfile = null;
    let storeProfile = null;
    let successMessage = 'تم إنشاء الحساب بنجاح!';

    if (role === 'DRIVER') {
      const generatedPlate = vehiclePlate ? vehiclePlate.trim() : `س ق ص ${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedLic = licenseNumber ? licenseNumber.trim() : `DL-ALEX-${Date.now()}`;
      const generatedNid = nationalId ? nationalId.trim() : `2950${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      driverProfile = await prisma.driver.create({
        data: {
          userId: user.id,
          vehicleType: vehicleType || 'CAR',
          vehicleModel: vehicleModel || 'Hyundai Elantra 2023',
          vehiclePlate: generatedPlate,
          vehicleYear: vehicleYear ? parseInt(vehicleYear, 10) : 2023,
          vehicleColor: vehicleColor || 'أبيض / White',
          licenseNumber: generatedLic,
          nationalId: generatedNid,
          dateOfBirth: dateOfBirth || null,
          verificationStatus: 'PENDING',
          isOnline: false,
          currentLat: 31.2001, // Alexandria default
          currentLng: 29.9187,
          profilePhotoDoc: profilePhotoDoc || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
          nationalIdFrontDoc: nationalIdFrontDoc || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
          nationalIdBackDoc: nationalIdBackDoc || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
          drivingLicenseDoc: drivingLicenseDoc || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
          vehicleRegDoc: vehicleRegDoc || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
        },
      });

      successMessage = 'تم تقديم طلب انضمام الكابتن بنجاح! حسابك قيد المراجعة والتدقيق وسيتواصل معك فريق هاتلي الإسكندرية فور اعتماده.';
    } else if (role === 'RESTAURANT' || role === 'BUSINESS_OWNER' || role === 'STORE_OWNER') {
      const bRole = role === 'RESTAURANT' ? 'RESTAURANT' : 'BUSINESS_OWNER';
      const actualType = role === 'RESTAURANT' ? 'RESTAURANT' : (storeType || 'SUPERMARKET');

      storeProfile = await prisma.store.create({
        data: {
          ownerId: user.id,
          businessRole: bRole,
          type: actualType,
          nameAr: storeNameAr || name,
          nameEn: storeNameEn || name,
          ownerName: ownerName || name,
          address: storeAddress || 'سموحة، الإسكندرية، مصر',
          latitude: storeLat ? parseFloat(storeLat) : config.defaultLat,
          longitude: storeLng ? parseFloat(storeLng) : config.defaultLng,
          phone: phone.trim(),
          workingHours: workingHours || '10:00 AM - 02:00 AM',
          verificationStatus: 'PENDING',
          commercialRegDoc: commercialRegDoc || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
          taxCardDoc: taxCardDoc || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
          permitDoc: permitDoc || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
        },
      });

      successMessage = bRole === 'RESTAURANT'
        ? 'تم تقديم طلب شراكة المطعم بنجاح! طلبك قيد المراجعة من إدارة هاتلي وسيتم تفعيل متجرك فور التدقيق.'
        : 'تم تقديم طلب تسجيل الشريك التجاري بنجاح! طلبك قيد المراجعة والاعتماد.';
    } else {
      successMessage = 'تم إنشاء الحساب بنجاح! تم إضافة ٥٠ ج.م هدية ترحيبية في محفظتك 🎁';
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      message: successMessage,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        walletBalance: user.walletBalance,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        driverProfile,
        storeProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Password Recovery: Request Reset OTP
export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const identifier = (req.body.identifier || req.body.email || req.body.phone || '').trim();
    if (!identifier) {
      res.status(400).json({
        success: false,
        message: 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني / Identifier is required',
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: identifier }, { email: identifier }],
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'لم يتم العثور على حساب مرتبط بهذه البيانات / Account not found',
      });
      return;
    }

    // Generate 6-digit OTP code valid for 15 minutes
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetCode,
        resetPasswordExpires: expiresAt,
      },
    });

    res.json({
      success: true,
      message: `تم إرسال كود استعادة كلمة المرور إلى هاتفك وبريدك بنجاح`,
      devCode: resetCode, // Displayed in sandbox/testing
      expiresInMinutes: 15,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Password Recovery: Reset with Code
export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, resetCode, newPassword, confirmPassword } = req.body;

    if (!identifier || !resetCode || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة لإعادة تعيين كلمة المرور / All fields required',
      });
      return;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'كلمتا المرور الجديدتان غير متطابقتين / Passwords do not match',
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'يجب ألا تقل كلمة المرور عن ٦ أحرف / Password must be at least 6 characters',
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: identifier }, { email: identifier }],
        resetPasswordToken: resetCode.trim(),
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'كود التحقق غير صالح أو انتهت صلاحيته / Invalid or expired reset code',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة / Password reset successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMeController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        driverProfile: true,
        storeProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        walletBalance: user.walletBalance,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        driverProfile: user.driverProfile,
        storeProfile: user.storeProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
