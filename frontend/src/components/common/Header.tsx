import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { HatlyLogo } from './HatlyLogo';
import { AuthModal } from './AuthModal';
import { Role } from '../../types';
import {
  Car,
  Smartphone,
  Store,
  Shield,
  Wallet,
  Globe,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface HeaderProps {
  onOpenWalletModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWalletModal }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, activeRole, setActiveRole, quickLogin, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const roleNavItems: { role: Role; labelAr: string; labelEn: string; icon: any }[] = [
    { role: 'CUSTOMER', labelAr: 'العميل', labelEn: 'Customer', icon: Smartphone },
    { role: 'DRIVER', labelAr: 'الكابتن', labelEn: 'Driver', icon: Car },
    { role: 'STORE_OWNER', labelAr: 'المتجر والمطعم', labelEn: 'Store', icon: Store },
    { role: 'ADMIN', labelAr: 'الإدارة المركزية', labelEn: 'Admin', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      {/* Top Banner / Role Portal Switcher */}
      <div className="bg-[#151515] text-white px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400">
              {language === 'ar' ? 'سوبر آب مصر 🇪🇬 نشط بالكامل' : 'Egypt Super App 🇪🇬 Live & Operational'}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-gray-400 hidden sm:inline">
              {language === 'ar' ? 'تبديل الواجهة:' : 'Switch Role App:'}
            </span>
            <div className="flex items-center gap-1 bg-[#222] p-0.5 rounded-lg border border-gray-700/60">
              {roleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeRole === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => {
                      setActiveRole(item.role);
                      quickLogin(item.role);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium text-xs whitespace-nowrap ${
                      isActive
                        ? 'bg-[#E70209] text-white shadow-sm font-bold'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with New Hatly Mark & Slogan */}
        <div className="flex items-center">
          <HatlyLogo size="md" />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Wallet Balance Pill */}
          <button
            onClick={onOpenWalletModal}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200/60 rounded-xl transition text-red-950 font-semibold text-xs sm:text-sm"
          >
            <Wallet className="w-4 h-4 text-[#E70209]" />
            <span>
              {user?.walletBalance !== undefined ? user.walletBalance.toFixed(2) : '500.00'}{' '}
              <span className="text-xs font-normal text-gray-600">{t('currency')}</span>
            </span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs sm:text-sm font-medium transition text-gray-700"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="font-bold">{language === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* User Quick Menu / Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-red-500/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {user?.name || (language === 'ar' ? 'أحمد مصطفى' : 'Ahmed Moustafa')}
                </p>
                <p className="text-[10px] text-gray-500 capitalize">
                  {user?.role ? user.role.toLowerCase() : activeRole.toLowerCase()}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* Quick Demo Switcher Dropdown */}
            {showRoleMenu && (
              <div className="absolute left-0 rtl:left-auto rtl:right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{user?.name || 'مستخدم هاتلي'}</p>
                    <p className="text-[11px] text-gray-500">{user?.email || user?.phone || '01011112222'}</p>
                  </div>
                </div>

                {/* Real Authentication Actions */}
                <div className="p-2 border-b border-gray-100 space-y-1">
                  <button
                    onClick={() => {
                      setAuthModalTab('LOGIN');
                      setShowAuthModal(true);
                      setShowRoleMenu(false);
                    }}
                    className="w-full px-3 py-2 text-start rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-[#E70209] flex items-center gap-2 transition"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تسجيل الدخول لحسابك' : 'Sign In to Account'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setAuthModalTab('REGISTER');
                      setShowAuthModal(true);
                      setShowRoleMenu(false);
                    }}
                    className="w-full px-3 py-2 text-start rounded-xl text-xs font-bold bg-[#1B1464] hover:bg-black text-white flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-red-400" />
                      <span>{language === 'ar' ? 'إنشاء حساب جديد' : 'Register New Account'}</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">+٥٠ ج.م</span>
                  </button>
                </div>

                <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {language === 'ar' ? 'أو دخول سريع لحسابات العرض (Demo):' : 'Or Switch Demo Role:'}
                </div>

                <button
                  onClick={() => {
                    quickLogin('CUSTOMER');
                    setShowRoleMenu(false);
                  }}
                  className="w-full px-4 py-2 text-start flex items-center justify-between text-xs hover:bg-red-50 hover:text-[#E70209] transition"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    <span>{language === 'ar' ? 'أحمد (عميل كاش ومحفظة)' : 'Customer (Ahmed)'}</span>
                  </div>
                  {activeRole === 'CUSTOMER' && <span className="text-[10px] bg-red-100 text-[#E70209] px-1.5 py-0.5 rounded">نشط</span>}
                </button>

                <button
                  onClick={() => {
                    quickLogin('DRIVER');
                    setShowRoleMenu(false);
                  }}
                  className="w-full px-4 py-2 text-start flex items-center justify-between text-xs hover:bg-red-50 hover:text-[#E70209] transition"
                >
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-500" />
                    <span>{language === 'ar' ? 'محمود (كابتن إلنترا 2023)' : 'Driver (Mahmoud)'}</span>
                  </div>
                  {activeRole === 'DRIVER' && <span className="text-[10px] bg-red-100 text-[#E70209] px-1.5 py-0.5 rounded">نشط</span>}
                </button>

                <button
                  onClick={() => {
                    quickLogin('STORE_OWNER');
                    setShowRoleMenu(false);
                  }}
                  className="w-full px-4 py-2 text-start flex items-center justify-between text-xs hover:bg-red-50 hover:text-[#E70209] transition"
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-blue-500" />
                    <span>{language === 'ar' ? 'كشري أبو طارق (مطعم)' : 'Store (Abou Tarek)'}</span>
                  </div>
                  {activeRole === 'STORE_OWNER' && <span className="text-[10px] bg-red-100 text-[#E70209] px-1.5 py-0.5 rounded">نشط</span>}
                </button>

                <button
                  onClick={() => {
                    quickLogin('ADMIN');
                    setShowRoleMenu(false);
                  }}
                  className="w-full px-4 py-2 text-start flex items-center justify-between text-xs hover:bg-red-50 hover:text-[#E70209] transition"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span>{language === 'ar' ? 'إدارة هاتلي المركزية' : 'Admin (Command Center)'}</span>
                  </div>
                  {activeRole === 'ADMIN' && <span className="text-[10px] bg-red-100 text-[#E70209] px-1.5 py-0.5 rounded">نشط</span>}
                </button>

                <div className="border-t border-gray-100 mt-2 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowRoleMenu(false);
                    }}
                    className="w-full px-4 py-2 text-start text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Authentication Modal (Login / Register / Forgot Password) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
        defaultRole={activeRole}
      />
    </header>
  );
};
