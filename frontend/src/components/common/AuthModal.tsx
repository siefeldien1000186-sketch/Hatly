import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { HatlyLogo } from './HatlyLogo';
import { Role } from '../../types';
import {
  X,
  Mail,
  Lock,
  Phone,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Car,
  Store,
  Smartphone,
  Gift,
  ArrowRight,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'LOGIN' | 'REGISTER';
  defaultRole?: Role;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'LOGIN',
  defaultRole = 'CUSTOMER',
}) => {
  const { login, register, forgotPassword, resetPassword, quickLogin } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>(defaultTab);
  const [selectedRole, setSelectedRole] = useState<Role>(defaultRole);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Driver extra fields
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleType, setVehicleType] = useState<'CAR' | 'SCOOTER' | 'VAN'>('CAR');

  // Store extra fields
  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState<'RESTAURANT' | 'SUPERMARKET' | 'PHARMACY'>('RESTAURANT');

  // Forgot password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [devCodeNotice, setDevCodeNotice] = useState<string | null>(null);

  // Status & loading
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const resetAllFields = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setDevCodeNotice(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

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
      setSuccessMsg(language === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Logged in successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || (language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
      setErrorMsg(
        language === 'ar'
          ? 'جميع الحقول الأساسية مطلوبة'
          : 'All main fields are required'
      );
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg(
        language === 'ar'
          ? 'كلمتا المرور غير متطابقتين'
          : 'Passwords do not match'
      );
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg(
        language === 'ar'
          ? 'كلمة المرور يجب ألا تقل عن ٦ أحرف'
          : 'Password must be at least 6 characters'
      );
      return;
    }

    if (!agreeTerms) {
      setErrorMsg(
        language === 'ar'
          ? 'يرجى الموافقة على الشروط والأحكام للاستمرار'
          : 'Please agree to terms and conditions'
      );
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        confirmPassword: regConfirmPassword,
        role: selectedRole,
        vehicleType: selectedRole === 'DRIVER' ? vehicleType : undefined,
        vehicleModel: selectedRole === 'DRIVER' ? vehicleModel : undefined,
        vehiclePlate: selectedRole === 'DRIVER' ? vehiclePlate : undefined,
        storeNameAr: selectedRole === 'STORE_OWNER' ? storeName : undefined,
        storeType: selectedRole === 'STORE_OWNER' ? storeType : undefined,
      };

      const res = await register(payload);
      setSuccessMsg(res.message || (language === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Registered successfully!'));
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || (language === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!forgotIdentifier.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال الهاتف أو البريد' : 'Please enter email or phone');
      return;
    }

    setIsLoading(true);
    try {
      const res = await forgotPassword(forgotIdentifier.trim());
      setSuccessMsg(res.message || (language === 'ar' ? 'تم إرسال كود التحقق بنجاح' : 'Reset code sent'));
      if (res.devCode) {
        setDevCodeNotice(res.devCode);
        setResetCode(res.devCode);
      }
      setForgotStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || (language === 'ar' ? 'تعذر إرسال الكود' : 'Failed to send code'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

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
      setSuccessMsg(res.message || (language === 'ar' ? 'تم تغيير كلمة المرور بنجاح!' : 'Password reset successfully!'));
      setTimeout(() => {
        setActiveTab('LOGIN');
        setForgotStep(1);
        setLoginIdentifier(forgotIdentifier);
        setLoginPassword(newPassword);
        setErrorMsg(null);
        setSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || (language === 'ar' ? 'فشل إعادة التعيين' : 'Reset failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Modal Top Header */}
        <div className="p-5 pb-3 border-b border-gray-100 flex items-center justify-between">
          <HatlyLogo size="sm" />
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3">
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl text-xs font-black">
            <button
              onClick={() => {
                setActiveTab('LOGIN');
                resetAllFields();
              }}
              className={`py-2.5 rounded-xl transition ${
                activeTab === 'LOGIN' || activeTab === 'FORGOT'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <button
              onClick={() => {
                setActiveTab('REGISTER');
                resetAllFields();
              }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'REGISTER'
                  ? 'bg-[#E70209] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>{language === 'ar' ? 'إنشاء حساب جديد' : 'Register'}</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
                +٥٠ ج.م
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'LOGIN' && (
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
                    placeholder={language === 'ar' ? 'مثال: 01011112222 أو name@example.com' : 'phone or email'}
                    className="w-full pr-9 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
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
                      setActiveTab('FORGOT');
                      resetAllFields();
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
                    className="w-full pr-9 pl-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
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
                className="w-full py-3.5 bg-[#E70209] hover:bg-[#CC0006] text-white font-black rounded-2xl text-sm shadow-lg shadow-red-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{isLoading ? (language === 'ar' ? 'جاري الدخول...' : 'Signing in...') : (language === 'ar' ? 'دخول لحسابي' : 'Sign In')}</span>
              </button>

            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  {language === 'ar' ? 'نوع الحساب المراد تسجيله:' : 'Account Type:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { role: 'CUSTOMER' as Role, label: 'عميل', icon: Smartphone },
                    { role: 'DRIVER' as Role, label: 'كابتن توصيل', icon: Car },
                    { role: 'STORE_OWNER' as Role, label: 'متجر / مطعم', icon: Store },
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = selectedRole === r.role;
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => setSelectedRole(r.role)}
                        className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'border-[#E70209] bg-red-50 text-[#E70209] font-black shadow-sm ring-2 ring-red-500/15'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 font-bold'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Welcome Gift Banner */}
              {selectedRole === 'CUSTOMER' && (
                <div className="p-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-red-950 font-semibold">
                  <Gift className="w-5 h-5 text-[#E70209] flex-shrink-0" />
                  <span>
                    {language === 'ar'
                      ? 'هدية فورية: ٥٠ جنيه مصري تُضاف إلى محفظتك بمجرد إتمام التسجيل!'
                      : 'Welcome gift: 50 EGP added to your wallet upon registration!'}
                  </span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute top-3.5 right-3 rtl:right-3 rtl:left-auto" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: محمد أحمد علي' : 'e.g. Mohamed Ali'}
                    className="w-full pr-9 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                  />
                </div>
              </div>

              {/* Email & Phone in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute top-3.5 right-3 rtl:right-3 rtl:left-auto" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full pr-9 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {language === 'ar' ? 'رقم الهاتف (مصر 🇪🇬)' : 'Mobile Phone (Egypt)'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute top-3.5 right-3 rtl:right-3 rtl:left-auto" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full pr-9 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                    />
                  </div>
                </div>
              </div>

              {/* Passwords in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute top-3.5 right-3 rtl:right-3 rtl:left-auto" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="٦ أحرف على الأقل"
                      className="w-full pr-9 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute top-3.5 right-3 rtl:right-3 rtl:left-auto" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="أعد إدخال كلمة المرور"
                      className="w-full pr-9 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                    />
                  </div>
                </div>
              </div>

              {/* Role-Specific fields */}
              {selectedRole === 'DRIVER' && (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <p className="text-xs font-black text-gray-900">
                    {language === 'ar' ? 'بيانات مركبة الكابتن:' : 'Vehicle Details:'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">نوع المركبة</label>
                      <select
                        value={vehicleType}
                        onChange={(e: any) => setVehicleType(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="CAR">سيارة (سيدان)</option>
                        <option value="SCOOTER">موتوسيكل / سكوتر</option>
                        <option value="VAN">سيارة عائلية (فان)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">موديل المركبة</label>
                      <input
                        type="text"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        placeholder="مثال: تويوتا كورولا 2023"
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">رقم اللوحة المرورية</label>
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      placeholder="مثال: أ ب ج - 1234"
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>
              )}

              {selectedRole === 'STORE_OWNER' && (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <p className="text-xs font-black text-gray-900">
                    {language === 'ar' ? 'بيانات المتجر / المطعم:' : 'Store Details:'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">اسم المتجر</label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="مثال: بيتزا روما"
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">نشاط المتجر</label>
                      <select
                        value={storeType}
                        onChange={(e: any) => setStoreType(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="RESTAURANT">مطعم ومأكولات</option>
                        <option value="SUPERMARKET">سوبرماركت وبقالة</option>
                        <option value="PHARMACY">صيدلية ومستحضرات</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms and conditions */}
              <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded mt-0.5 text-[#E70209] focus:ring-[#E70209]"
                />
                <span>
                  {language === 'ar'
                    ? 'أوافق على شروط الاستخدام وسياسة الخصوصية لمنصة هاتلي مصر 🇪🇬'
                    : 'I agree to the Terms of Service & Privacy Policy of Hatly Egypt'}
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#E70209] hover:bg-[#CC0006] text-white font-black rounded-2xl text-sm shadow-lg shadow-red-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{isLoading ? (language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating...') : (language === 'ar' ? 'إنشاء حساب هاتلي الآن' : 'Create Account')}</span>
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {activeTab === 'FORGOT' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('LOGIN');
                    resetAllFields();
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1"
                >
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
                  <span>{language === 'ar' ? 'الرجوع لتسجيل الدخول' : 'Back to login'}</span>
                </button>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="text-center py-2">
                    <div className="w-12 h-12 bg-red-100 text-[#E70209] rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-sm text-gray-900">
                      {language === 'ar' ? 'استعادة كلمة المرور' : 'Reset Password'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ar'
                        ? 'أدخل رقم هاتفك أو بريدك الإلكتروني لإرسال كود التحقق السري'
                        : 'Enter your phone or email to receive a reset code'}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {language === 'ar' ? 'رقم الهاتف أو البريد الإلكتروني' : 'Phone or Email'}
                    </label>
                    <input
                      type="text"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="010XXXXXXXX or name@domain.com"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-[#E70209] hover:bg-[#CC0006] text-white font-black rounded-2xl text-sm shadow-md transition disabled:opacity-50"
                  >
                    {isLoading ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (language === 'ar' ? 'إرسال كود التحقق (OTP)' : 'Send Reset Code')}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="text-center py-2">
                    <h4 className="font-black text-sm text-gray-900">
                      {language === 'ar' ? 'أدخل كود التحقق وكلمة المرور الجديدة' : 'Enter Verification Code & New Password'}
                    </h4>
                    {devCodeNotice && (
                      <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-bold">
                        كود التحقق الخاص بك هو: <span className="text-sm font-black text-blue-900">{devCodeNotice}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {language === 'ar' ? 'كود التحقق المكون من ٦ أرقام' : '6-digit Reset Code'}
                    </label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="123456"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-center tracking-widest font-black text-base focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                      </label>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm shadow-md transition disabled:opacity-50"
                  >
                    {isLoading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'تأكيد كلمة المرور وحفظها' : 'Reset & Save Password')}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
