import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { HatlyLogo } from '../common/HatlyLogo';
import { Clock, ShieldCheck, FileText, CheckCircle, RefreshCw, LogOut, PhoneCall } from 'lucide-react';

export const PendingReviewScreen: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { language } = useLanguage();

  const isDriver = user?.role === 'DRIVER';
  const roleName = isDriver
    ? (language === 'ar' ? 'كابتن توصيل' : 'Captain / Courier')
    : (language === 'ar' ? 'شريك تجاري (مطعم / متجر)' : 'Merchant Partner');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-2xl mx-auto w-full pt-8 pb-12">
        {/* Header / Brand */}
        <div className="flex justify-center mb-8">
          <HatlyLogo size="lg" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6 text-center">
          {/* Animated Status Icon */}
          <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-md">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>

          <div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full uppercase tracking-wider">
              {language === 'ar' ? 'قيد المراجعة والتدقيق' : 'Application Under Review'}
            </span>
            <h2 className="text-2xl font-black text-gray-900 mt-3">
              {language === 'ar' ? `مرحباً بك يا كابتن ${user?.name || ''}` : `Welcome ${user?.name || ''}`}
            </h2>
            <p className="text-sm font-semibold text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
              {language === 'ar'
                ? `تم استلام أوراق وطلب انضمامك كـ (${roleName}) بنجاح. يقوم فريق إدارة هاتلي الإسكندرية بمراجعة المستندات والتحقق من صحتها لاعتماد حسابك.`
                : `Your application as (${roleName}) has been received. Our Alexandria team is reviewing and verifying your documents.`}
            </p>
          </div>

          {/* Verification Steps Progress */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-start space-y-3">
            <h4 className="font-black text-xs text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E70209]" />
              <span>{language === 'ar' ? 'مراحل اعتماد الحساب:' : 'Verification Steps:'}</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-600 font-bold">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{language === 'ar' ? '١. تم تسجيل الحساب والبيانات الشخصية' : '1. Profile data completed'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-emerald-600 font-bold">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  {isDriver
                    ? (language === 'ar' ? '٢. تم رفع الرقم القومي ورخصة القيادة وتسيير المركبة' : '2. Licenses and National ID uploaded')
                    : (language === 'ar' ? '٢. تم رفع السجل التجاري والبطاقة الضريبية وتراخيص النشاط' : '2. Commercial registration & permits uploaded')}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-amber-700 font-black">
                <span className="w-4 h-4 rounded-full border-2 border-amber-600 flex items-center justify-center text-[10px] animate-spin">
                  ⏳
                </span>
                <span>{language === 'ar' ? '٣. تدقيق الوثائق من إدارة العمليات (جاري الفحص)' : '3. Operations audit (In Progress)'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-400 font-semibold">
                <span className="w-4 h-4 rounded-full border border-gray-300" />
                <span>{language === 'ar' ? '٤. تفعيل الحساب وبدء تلقي الطلبات وتحقيق الأرباح' : '4. Account activation & receiving orders'}</span>
              </div>
            </div>
          </div>

          {/* Details Summary */}
          <div className="grid grid-cols-2 gap-3 text-xs text-start">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-gray-400 font-bold">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</p>
              <p className="font-black text-gray-800 mt-0.5">{user?.phone}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-gray-400 font-bold">{language === 'ar' ? 'منطقة الانطلاق' : 'Primary Zone'}</p>
              <p className="font-black text-gray-800 mt-0.5">الإسكندرية والكينج وبرج العرب</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => refreshUser()}
              className="flex-1 py-3 px-4 bg-[#E70209] hover:bg-[#CC0006] text-white rounded-2xl text-xs font-black shadow-lg shadow-red-600/25 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{language === 'ar' ? 'تحديث حالة الطلب' : 'Check Approval Status'}</span>
            </button>

            <button
              onClick={() => logout()}
              className="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
            </button>
          </div>

          {/* Support line */}
          <div className="pt-2 text-xs text-gray-500 flex items-center justify-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-[#E70209]" />
            <span>{language === 'ar' ? 'للاستفسار السريع أو تسريع الاعتماد: 01000000001' : 'Quick support: 01000000001'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
