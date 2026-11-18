import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { HatlyLogo } from '../common/HatlyLogo';
import { Role } from '../../types';
import { POPULAR_EGYPT_LOCATIONS } from '../../services/egyptGeo';
import {
  Smartphone,
  Car,
  Store,
  Building2,
  Mail,
  Lock,
  Phone,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Gift,
  Upload,
  Globe,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

export const WelcomeAuthScreen: React.FC = () => {
  const { login, register, forgotPassword, resetPassword, quickLogin } = useAuth();
  const { language, toggleLanguage } = useLanguage();

  // Screen View States: 'WELCOME' | 'LOGIN' | 'ROLE_SELECT' | 'REGISTER_CUSTOMER' | 'REGISTER_CAPTAIN' | 'REGISTER_RESTAURANT' | 'REGISTER_BUSINESS' | 'FORGOT'
  const [view, setView] = useState<
    'WELCOME' | 'LOGIN' | 'ROLE_SELECT' | 'REGISTER_CUSTOMER' | 'REGISTER_CAPTAIN' | 'REGISTER_RESTAURANT' | 'REGISTER_BUSINESS' | 'FORGOT'
  >('WELCOME');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Common Registration State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Customer Location State
  const [customerArea, setCustomerArea] = useState('smouha_victor');

  // Captain / Courier State
  const [nationalId, setNationalId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [vehicleType, setVehicleType] = useState<'CAR' | 'SCOOTER' | 'VAN'>('CAR');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: boolean }>({
    nationalIdFront: true,
    nationalIdBack: true,
    drivingLicense: true,
    vehicleReg: true,
  });

  // Restaurant State
  const [restaurantNameAr, setRestaurantNameAr] = useState('');
  const [restaurantNameEn, setRestaurantNameEn] = useState('');
  const [restaurantOwnerName, setRestaurantOwnerName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('سموحة، الإسكندرية');
  const [restaurantWorkingHours, setRestaurantWorkingHours] = useState('11:00 AM - 02:00 AM');

  // Business Owner State
  const [businessNameAr, setBusinessNameAr] = useState('');
  const [businessNameEn, setBusinessNameEn] = useState('');
  const [businessOwnerName, setBusinessOwnerName] = useState('');
  const [businessType, setBusinessType] = useState<'SUPERMARKET' | 'PHARMACY' | 'SHOP'>('SUPERMARKET');
  const [businessAddress, setBusinessAddress] = useState('كينج مريوط، الإسكندرية');

  // Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [devCodeNotice, setDevCodeNotice] = useState<string | null>(null);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetFeedback = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setDevCodeNotice(null);
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMsg(
        language === 'ar'
          ? 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور'
          : 'Please enter your email or phone and password'
      );
      return;
    }

    setIsLoading(true);
    try {
      await login(loginIdentifier.trim(), loginPassword, rememberMe);
    } catch (err: any) {
      setErrorMsg(err.message || (language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Customer Registration
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg(language === 'ar' ? 'جميع الحقول الأساسية مطلوبة' : 'All fields required');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setErrorMsg(language === 'ar' ? 'كلمة المرور يجب ألا تقل عن ٦ أحرف' : 'Password min 6 chars');
      return;
    }

    setIsLoading(true);
    try {
      const selectedLoc = POPULAR_EGYPT_LOCATIONS.find((l) => l.id === customerArea);
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role: 'CUSTOMER',
        address: selectedLoc?.nameAr || 'الإسكندرية، مصر',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Captain / Courier Registration
  const handleCaptainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!name.trim() || !email.trim() || !phone.trim() || !password || !nationalId.trim() || !vehiclePlate.trim()) {
      setErrorMsg(
        language === 'ar'
          ? 'يرجى استكمال البيانات الشخصية وبيانات المركبة والرقم القومي'
          : 'Please complete all personal, vehicle, and national ID fields'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role: 'DRIVER',
        nationalId: nationalId.trim(),
        dateOfBirth,
        vehicleType,
        vehicleModel: vehicleModel.trim() || 'Hyundai Elantra',
        vehiclePlate: vehiclePlate.trim(),
        profilePhotoDoc: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400',
        nationalIdFrontDoc: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
        nationalIdBackDoc: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
        drivingLicenseDoc: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
        vehicleRegDoc: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Captain registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Restaurant Registration
  const handleRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!restaurantNameAr.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال اسم المطعم، البريد، الهاتف، وكلمة المرور' : 'All main fields required');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: restaurantOwnerName.trim() || restaurantNameAr.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role: 'RESTAURANT',
        storeNameAr: restaurantNameAr.trim(),
        storeNameEn: restaurantNameEn.trim() || restaurantNameAr.trim(),
        ownerName: restaurantOwnerName.trim(),
        storeAddress: restaurantAddress,
        workingHours: restaurantWorkingHours,
        commercialRegDoc: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
        taxCardDoc: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
        permitDoc: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Restaurant registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Handle Business Owner Registration
  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!businessNameAr.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال اسم المتجر، البريد، الهاتف، وكلمة المرور' : 'All main fields required');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: businessOwnerName.trim() || businessNameAr.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role: 'BUSINESS_OWNER',
        storeNameAr: businessNameAr.trim(),
        storeNameEn: businessNameEn.trim() || businessNameAr.trim(),
        ownerName: businessOwnerName.trim(),
        storeType: businessType,
        storeAddress: businessAddress,
        commercialRegDoc: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
        taxCardDoc: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Business registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!forgotIdentifier.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال الهاتف أو البريد' : 'Please enter email or phone');
      return;
    }

    setIsLoading(true);
    try {
      const res = await forgotPassword(forgotIdentifier.trim());
      setSuccessMsg(res.message);
      if (res.devCode) {
        setDevCodeNotice(res.devCode);
        setResetCode(res.devCode);
      }
      setForgotStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!resetCode.trim() || !newPassword || !confirmNewPassword) {
      setErrorMsg(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword({
        identifier: forgotIdentifier.trim(),
        resetCode: resetCode.trim(),
        newPassword,
        confirmPassword: confirmNewPassword,
      });
      setSuccessMsg(res.message);
      setTimeout(() => {
        setView('LOGIN');
        setLoginIdentifier(forgotIdentifier);
        setLoginPassword(newPassword);
        resetFeedback();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#110D40] via-[#1B1464] to-[#0D1117] flex flex-col justify-between p-4 sm:p-6 text-white selection:bg-[#E70209] selection:text-white">
      {/* Top Navbar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E70209] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E70209]"></span>
          </span>
          <span className="text-xs font-bold text-red-200">
            {language === 'ar' ? 'الإسكندرية • كينج مريوط • برج العرب 🇪🇬' : 'Alexandria • El King • Borg El Arab 🇪🇬'}
          </span>
        </div>

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'English' : 'عربي'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-xl mx-auto w-full my-auto py-6">
        {/* VIEW 1: WELCOME SCREEN (Initial First-Open) */}
        {view === 'WELCOME' && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-gray-900 text-center space-y-6 animate-in fade-in duration-300">
            {/* Logo & Slogans */}
            <div className="flex justify-center">
              <HatlyLogo size="lg" />
            </div>

            {/* Launch Banner */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-[#E70209]">
              <Sparkles className="w-4 h-4 text-[#E70209] animate-pulse" />
              <span>متاح الآن في الإسكندرية، كينج مريوط، وبرج العرب 🚀</span>
            </div>

            <p className="text-sm font-semibold text-gray-600 leading-relaxed max-w-md mx-auto">
              سوبر آب التوصيل المصري المتكامل. اطلب أشهى المأكولات، مستلزمات البقالة، الطرود والمستندات بضغطة زر واحدة.
            </p>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  resetFeedback();
                  setView('LOGIN');
                }}
                className="w-full py-4 bg-[#E70209] hover:bg-[#CC0006] text-white font-black rounded-2xl text-base shadow-xl shadow-red-600/30 transition transform active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <button
                onClick={() => {
                  resetFeedback();
                  setView('ROLE_SELECT');
                }}
                className="w-full py-4 bg-[#1B1464] hover:bg-[#140E4B] text-white font-black rounded-2xl text-base shadow-lg shadow-indigo-950/20 transition flex items-center justify-center gap-2"
              >
                <span>{language === 'ar' ? 'إنشاء حساب جديد' : 'Create an Account'}</span>
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">+٥٠ ج.م</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: LOGIN SCREEN */}
        {view === 'LOGIN' && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-gray-900 space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <HatlyLogo size="sm" />
              <button
                onClick={() => setView('WELCOME')}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
                <span>{language === 'ar' ? 'الرجوع' : 'Back'}</span>
              </button>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-black text-gray-900">
                {language === 'ar' ? 'تسجيل الدخول إلى هاتلي' : 'Sign in to Hatly'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'ar' ? 'أدخل رقم هاتفك أو بريدك الإلكتروني وكلمة المرور' : 'Enter your credentials'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {language === 'ar' ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email or Mobile Phone'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute top-3.5 right-3 rtl:right-3 rtl:left-auto" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="010XXXXXXXX or name@domain.com"
                    className="w-full pr-9 pl-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      resetFeedback();
                      setView('FORGOT');
                    }}
                    className="text-[11px] text-[#E70209] font-bold hover:underline"
                  >
                    {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute top-3.5 right-3 rtl:right-3 rtl:left-auto" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-9 pl-9 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute top-3 left-3 rtl:left-3 rtl:right-auto text-gray-400 hover:text-gray-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#E70209] focus:ring-[#E70209]"
                  />
                  <span>{language === 'ar' ? 'تذكر تسجيل الدخول' : 'Remember me'}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#E70209] hover:bg-[#CC0006] text-white font-black rounded-2xl text-base shadow-lg shadow-red-600/30 transition disabled:opacity-50"
              >
                {isLoading ? (language === 'ar' ? 'جاري التحقق...' : 'Signing in...') : (language === 'ar' ? 'تسجيل الدخول الآن' : 'Sign In')}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetFeedback();
                    setView('ROLE_SELECT');
                  }}
                  className="text-xs font-bold text-gray-600 hover:text-gray-900"
                >
                  {language === 'ar' ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
                  <span className="text-[#E70209] font-black underline">إنشاء حساب جديد</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 3: MULTI-ROLE SELECTION (Requirement 4) */}
        {view === 'ROLE_SELECT' && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-gray-900 space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <HatlyLogo size="sm" />
              <button
                onClick={() => setView('WELCOME')}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
                <span>{language === 'ar' ? 'الرجوع' : 'Back'}</span>
              </button>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-black text-gray-900">
                {language === 'ar' ? 'اختر نوع الحساب للانضمام' : 'Select Account Type'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'ar' ? 'لكل فئة نموذج تسجيل وإجراءات توثيق ولوحة تحكم مخصصة' : 'Dedicated workflow for each role'}
              </p>
            </div>

            {/* 4 Roles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Role 1: Customer */}
              <button
                type="button"
                onClick={() => {
                  resetFeedback();
                  setView('REGISTER_CUSTOMER');
                }}
                className="p-5 rounded-2xl border-2 border-gray-200 hover:border-[#E70209] hover:bg-red-50/40 text-start transition flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#E70209] flex items-center justify-center font-bold">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded-full">
                    هدية ٥٠ ج.م
                  </span>
                </div>
                <div>
                  <h4 className="font-black text-base text-gray-900 group-hover:text-[#E70209]">
                    {language === 'ar' ? 'عميل (Customer)' : 'Customer'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' ? 'طلب الوجبات، السوبرماركت، الطرود، والتتبع المباشر' : 'Order food, groceries, parcels & live tracking'}
                  </p>
                </div>
              </button>

              {/* Role 2: Captain */}
              <button
                type="button"
                onClick={() => {
                  resetFeedback();
                  setView('REGISTER_CAPTAIN');
                }}
                className="p-5 rounded-2xl border-2 border-gray-200 hover:border-[#1B1464] hover:bg-indigo-50/40 text-start transition flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-[#1B1464] flex items-center justify-center font-bold">
                    <Car className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded-full">
                    توثيق كابتن
                  </span>
                </div>
                <div>
                  <h4 className="font-black text-base text-gray-900 group-hover:text-[#1B1464]">
                    {language === 'ar' ? 'كابتن توصيل (Captain)' : 'Captain / Courier'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' ? 'توصيل الطلبات والطرود بسيارة أو سكوتر بأعلى عائد يومي' : 'Deliver orders with car/scooter with daily earnings'}
                  </p>
                </div>
              </button>

              {/* Role 3: Restaurant Partner */}
              <button
                type="button"
                onClick={() => {
                  resetFeedback();
                  setView('REGISTER_RESTAURANT');
                }}
                className="p-5 rounded-2xl border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50/40 text-start transition flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Store className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    شريك مطعم
                  </span>
                </div>
                <div>
                  <h4 className="font-black text-base text-gray-900 group-hover:text-amber-600">
                    {language === 'ar' ? 'مطعم شريك (Restaurant)' : 'Restaurant Partner'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' ? 'إضافة المنيو واستقبال طلبات الزبائن في الإسكندرية والكينج' : 'Manage menu and receive customer food orders'}
                  </p>
                </div>
              </button>

              {/* Role 4: Business Owner */}
              <button
                type="button"
                onClick={() => {
                  resetFeedback();
                  setView('REGISTER_BUSINESS');
                }}
                className="p-5 rounded-2xl border-2 border-gray-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-start transition flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                    أونر متجر
                  </span>
                </div>
                <div>
                  <h4 className="font-black text-base text-gray-900 group-hover:text-emerald-700">
                    {language === 'ar' ? 'صاحب متجر (Business)' : 'Business / Store Owner'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' ? 'سوبرماركت، صيدلية، بقالة، أو متجر تجزئة مع التوصيل' : 'Supermarkets, pharmacies and retail merchants'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: CUSTOMER REGISTRATION */}
        {view === 'REGISTER_CUSTOMER' && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-gray-900 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-gray-900">تسجيل حساب عميل جديد 📱</h3>
                <p className="text-xs text-gray-500">تمتع بـ ٥٠ ج.م هدية ترحيبية في محفظتك</p>
              </div>
              <button onClick={() => setView('ROLE_SELECT')} className="text-xs font-bold text-gray-500 hover:text-gray-900">
                تغيير
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCustomerSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">الاسم بالكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد مصطفى"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ahmed@domain.com"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">رقم الهاتف (مصر 🇪🇬)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">منطقة السكن الرئيسية (الإسكندرية والكينج وبرج العرب)</label>
                <select
                  value={customerArea}
                  onChange={(e) => setCustomerArea(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                >
                  {POPULAR_EGYPT_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">كلمة المرور</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#E70209] hover:bg-[#CC0006] text-white font-black rounded-2xl text-sm shadow-lg shadow-red-600/30 transition disabled:opacity-50 mt-2"
              >
                {isLoading ? 'جاري إنشاء الحساب...' : 'تأكيد إنشاء حساب العميل والحصول على ٥٠ ج.م 🎁'}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 5: CAPTAIN REGISTRATION */}
        {view === 'REGISTER_CAPTAIN' && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-gray-900 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-gray-900">تسجيل كابتن ومندوب توصيل 🚗</h3>
                <p className="text-xs text-gray-500">يتطلب مراجعة واعتماد الوثائق من إدارة هاتلي</p>
              </div>
              <button onClick={() => setView('ROLE_SELECT')} className="text-xs font-bold text-gray-500 hover:text-gray-900">
                تغيير
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCaptainSubmit} className="space-y-3.5 max-h-[65vh] overflow-y-auto px-1">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">الاسم القانوني الرباعي</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مطابق لبطاقة الرقم القومي"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">رقم الهاتف المصري</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="captain@domain.com"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">الرقم القومي (١٤ رقم)</label>
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="2950XXXXXXXXXX"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
                <p className="text-xs font-black text-gray-900">بيانات وسيلة التوصيل:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'CAR' as const, label: 'سيارة ملاكي' },
                    { type: 'SCOOTER' as const, label: 'سكوتر / موتوسيكل' },
                    { type: 'VAN' as const, label: 'فان بضائع' },
                  ].map((v) => (
                    <button
                      key={v.type}
                      type="button"
                      onClick={() => setVehicleType(v.type)}
                      className={`p-2 rounded-xl text-xs font-bold border transition ${
                        vehicleType === v.type ? 'bg-[#1B1464] text-white border-[#1B1464]' : 'bg-white text-gray-700'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="موديل المركبة (مثال: إلنترا 2023)"
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="رقم اللوحة (س ق ص 1234)"
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Document Upload Simulator */}
              <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                <p className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#1B1464]" />
                  <span>الوثائق القانونية المطلوبة للتدقيق:</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                  <span className="p-2 bg-white rounded-lg border border-indigo-200 text-emerald-700 flex items-center gap-1">
                    ✓ صورة الرقم القومي
                  </span>
                  <span className="p-2 bg-white rounded-lg border border-indigo-200 text-emerald-700 flex items-center gap-1">
                    ✓ رخصة القيادة السارية
                  </span>
                  <span className="p-2 bg-white rounded-lg border border-indigo-200 text-emerald-700 flex items-center gap-1">
                    ✓ رخصة تسيير المركبة
                  </span>
                  <span className="p-2 bg-white rounded-lg border border-indigo-200 text-emerald-700 flex items-center gap-1">
                    ✓ صورة شخصية حديثة
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تأكيد كلمة المرور"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#1B1464] hover:bg-[#140E4B] text-white font-black rounded-2xl text-sm shadow-md transition disabled:opacity-50"
              >
                {isLoading ? 'جاري إرسال الطلب...' : 'تقديم طلب انضمام الكابتن للمراجعة 📋'}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 6: RESTAURANT REGISTRATION */}
        {view === 'REGISTER_RESTAURANT' && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-gray-900 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-gray-900">تسجيل مطعم شريك 🍔</h3>
                <p className="text-xs text-gray-500">انضم لشبكة مطاعم هاتلي في الإسكندرية والكينج</p>
              </div>
              <button onClick={() => setView('ROLE_SELECT')} className="text-xs font-bold text-gray-500 hover:text-gray-900">
                تغيير
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRestaurantSubmit} className="space-y-3.5 max-h-[65vh] overflow-y-auto px-1">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">اسم المطعم التجاري (بالعربية)</label>
                <input
                  type="text"
                  value={restaurantNameAr}
                  onChange={(e) => setRestaurantNameAr(e.target.value)}
                  placeholder="مثال: أسماك قدورة الإسكندرية / واحة خطاب"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={restaurantOwnerName}
                  onChange={(e) => setRestaurantOwnerName(e.target.value)}
                  placeholder="اسم المالك أو المفوض"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الهاتف للتواصل"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">البريد الإلكتروني للفرع</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="restaurant@domain.com"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">عنوان الفرع أو المطبخ السحابي</label>
                <input
                  type="text"
                  value={restaurantAddress}
                  onChange={(e) => setRestaurantAddress(e.target.value)}
                  placeholder="مثال: شارع فوزي معاذ، سموحة / طريق الكينج مريوط"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>

              {/* Business Documents */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1.5 text-xs">
                <p className="font-black text-amber-950">المستندات التجارية المطلوبة للاعتماد:</p>
                <p className="text-[11px] text-amber-800">✓ السجل التجاري والبطاقة الضريبية وتراخيص النشاط</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تأكيد كلمة المرور"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl text-sm shadow-md transition disabled:opacity-50"
              >
                {isLoading ? 'جاري تقديم الطلب...' : 'تقديم طلب شراكة المطعم للمراجعة 🍽️'}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 7: BUSINESS OWNER REGISTRATION */}
        {view === 'REGISTER_BUSINESS' && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-gray-900 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-gray-900">تسجيل متجر أو تاجر شريك 🏪</h3>
                <p className="text-xs text-gray-500">سوبرماركت، صيدلية، بقالة، أو متجر تجزئة</p>
              </div>
              <button onClick={() => setView('ROLE_SELECT')} className="text-xs font-bold text-gray-500 hover:text-gray-900">
                تغيير
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleBusinessSubmit} className="space-y-3.5 max-h-[65vh] overflow-y-auto px-1">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">اسم المتجر أو المنشأة التجارية</label>
                <input
                  type="text"
                  value={businessNameAr}
                  onChange={(e) => setBusinessNameAr(e.target.value)}
                  placeholder="مثال: فتح الله ماركت / صيدلية د. أحمد"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">نشاط المتجر</label>
                  <select
                    value={businessType}
                    onChange={(e: any) => setBusinessType(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="SUPERMARKET">سوبرماركت وبقالة</option>
                    <option value="PHARMACY">صيدلية ومستحضرات</option>
                    <option value="SHOP">متجر تجزئة وإلكترونيات</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">اسم المالك</label>
                  <input
                    type="text"
                    value={businessOwnerName}
                    onChange={(e) => setBusinessOwnerName(e.target.value)}
                    placeholder="اسم المسؤول"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد الإلكتروني"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الهاتف"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">العنوان بالتفصيل (الإسكندرية / كينج مريوط / برج العرب)</label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="الشارع والحي"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تأكيد كلمة المرور"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm shadow-md transition disabled:opacity-50"
              >
                {isLoading ? 'جاري تقديم الطلب...' : 'تقديم طلب اعتماد المتجر 🏪'}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 8: FORGOT PASSWORD */}
        {view === 'FORGOT' && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-gray-900 space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <HatlyLogo size="sm" />
              <button onClick={() => setView('LOGIN')} className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
                <span>الرجوع لتسجيل الدخول</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="text-center">
                  <h4 className="font-black text-lg text-gray-900">استعادة كلمة المرور</h4>
                  <p className="text-xs text-gray-500 mt-1">أدخل بريدك أو رقم هاتفك لاستلام كود التحقق السري</p>
                </div>

                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="010XXXXXXXX or name@domain.com"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#E70209] hover:bg-[#CC0006] text-white font-black rounded-2xl text-sm shadow-md transition disabled:opacity-50"
                >
                  {isLoading ? 'جاري الإرسال...' : 'إرسال كود التحقق (OTP)'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                {devCodeNotice && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-bold text-center">
                    كود التحقق الخاص بك هو: <span className="font-black text-sm">{devCodeNotice}</span>
                  </div>
                )}

                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="كود التحقق من ٦ أرقام"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-center font-black tracking-widest text-base"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="كلمة المرور الجديدة"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="تأكيد كلمة المرور"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm shadow-md transition disabled:opacity-50"
                >
                  {isLoading ? 'جاري التعيين...' : 'تأكيد كلمة المرور الجديدة'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl mx-auto w-full text-center py-4 text-xs text-white/50">
        <p>منصة هاتلي (Hatly Egypt) • اطلب هاتلي، هيجيلك وقتي • جميع الحقوق محفوظة ٢٠٢٦</p>
      </div>
    </div>
  );
};
