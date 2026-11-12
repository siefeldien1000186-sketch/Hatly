import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/common/Header';
import { HatlyLogo } from './components/common/HatlyLogo';
import { WalletModal } from './components/common/WalletModal';
import { WelcomeAuthScreen } from './components/auth/WelcomeAuthScreen';
import { PendingReviewScreen } from './components/auth/PendingReviewScreen';
import { CustomerApp } from './pages/customer/CustomerApp';
import { DriverApp } from './pages/driver/DriverApp';
import { StoreApp } from './pages/store/StoreApp';
import { AdminApp } from './pages/admin/AdminApp';

const MainContent: React.FC = () => {
  const { user, activeRole, isLoading } = useAuth();
  const { language } = useLanguage();
  const [showWalletModal, setShowWalletModal] = useState(false);

  // 1. Animated Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#110D40] via-[#1B1464] to-[#0D1117] flex items-center justify-center p-4">
        <div className="text-center space-y-5 animate-in fade-in duration-500">
          <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-red-600/30 ring-4 ring-red-600/40 animate-pulse">
            <img src="/hatly-app-icon.png" alt="Hatly" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">هاتلي • HATLY</h1>
            <p className="text-sm font-bold text-[#E70209] mt-1">اطلب هاتلي، هيجيلك وقتي</p>
          </div>
          <div className="w-36 h-1.5 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E70209] to-red-400 rounded-full animate-[progress_1.5s_ease-in-out_infinite]"
              style={{ width: '60%' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 2. Requirement 4: Authentication First (Do not open homepage directly to unauthenticated visitors)
  if (!user) {
    return <WelcomeAuthScreen />;
  }

  // 3. Requirement 6, 7, 8, 10: If account is pending review, show PendingReviewScreen
  if (user.role === 'DRIVER' && user.driverProfile && user.driverProfile.verificationStatus === 'PENDING') {
    return <PendingReviewScreen />;
  }

  if (user.role === 'STORE_OWNER' && user.storeProfile && user.storeProfile.verificationStatus === 'PENDING') {
    return <PendingReviewScreen />;
  }

  // 4. Role-Based Protected Dashboard Redirection
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-[#E70209] selection:text-white">
      {/* Unified Super App Header */}
      <Header onOpenWalletModal={() => setShowWalletModal(true)} />

      {/* Main Role App Surface */}
      <main className="flex-1">
        {user.role === 'CUSTOMER' && <CustomerApp />}
        {user.role === 'DRIVER' && <DriverApp />}
        {user.role === 'STORE_OWNER' && <StoreApp />}
        {user.role === 'ADMIN' && <AdminApp />}
      </main>

      {/* Global Wallet Modal */}
      {showWalletModal && <WalletModal onClose={() => setShowWalletModal(false)} />}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HatlyLogo size="sm" withText={false} />
            <div>
              <p className="font-bold text-gray-900 text-sm">هاتلي (Hatly) Super App Egypt 🇪🇬</p>
              <p className="text-gray-500 text-[11px]">اطلب هاتلي، هيجيلك وقتي • كل خدمات التوصيل في مكان واحد</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-500 font-medium">
            <span>منطقة الإطلاق الأولى: الإسكندرية • كينج مريوط • برج العرب 🚀</span>
            <span>•</span>
            <span className="text-[#E70209] font-bold">نسخة الإنتاج v2.5 Red Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
