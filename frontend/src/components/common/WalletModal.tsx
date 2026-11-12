import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { WalletTransaction } from '../../types';
import {
  Wallet,
  X,
  CreditCard,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Phone,
  QrCode,
} from 'lucide-react';

interface WalletModalProps {
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ onClose }) => {
  const { language, t } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [balance, setBalance] = useState<number>(user?.walletBalance || 0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [topUpAmount, setTopUpAmount] = useState<number>(100);
  const [selectedMethod, setSelectedMethod] = useState<'VODAFONE_CASH' | 'INSTAPAY' | 'CARD' | 'FAWRY'>('INSTAPAY');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.getWallet();
        if (res.success) {
          setBalance(res.balance);
          setTransactions(res.transactions || []);
        }
      } catch (err) {
        console.error('Wallet fetch error:', err);
      }
    };
    fetchWallet();
  }, []);

  const handleTopUp = async () => {
    if (!topUpAmount || topUpAmount <= 0) return;
    setIsLoading(true);
    try {
      const res = await api.topUpWallet(topUpAmount, selectedMethod);
      if (res.success) {
        setBalance(res.balance);
        if (res.transaction) {
          setTransactions((prev) => [res.transaction, ...prev]);
        }
        await refreshUser();
        setSuccessMsg(
          language === 'ar'
            ? `تم شحن ${topUpAmount} ج.م بنجاح إلى محفظتك!`
            : `Successfully added ${topUpAmount} EGP to your wallet!`
        );
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Top-up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1B1464] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E70209] flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {language === 'ar' ? 'محفظة هاتلي الإلكترونية' : 'Hatly Digital Wallet'}
              </h3>
              <p className="text-xs text-gray-300">
                {language === 'ar' ? 'سريعة وآمنة بدون كاش' : 'Instant and cashless payments'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-[#1B1464] to-[#120D45] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#E70209]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold tracking-wider text-gray-300 uppercase">
                {language === 'ar' ? 'الرصيد المتاح' : 'Available Balance'}
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                EGP 🇪🇬
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1">
              {balance.toFixed(2)}{' '}
              <span className="text-lg font-medium text-red-400">{t('currency')}</span>
            </div>
            <p className="text-[11px] text-gray-300">
              {language === 'ar'
                ? 'استخدم رصيدك لدفع طلبات الطعام والطرود والبقالة فوراً'
                : 'Use your balance for food delivery, parcels, and supermarket orders'}
            </p>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Top-Up Section */}
          <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
            <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#E70209]" />
              <span>{language === 'ar' ? 'شحن رصيد المحفظة (Sandbox)' : 'Top-Up Wallet (Sandbox)'}</span>
            </h4>

            {/* Quick Amount Pills */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[50, 100, 200, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    topUpAmount === amt
                      ? 'bg-[#E70209] text-white border-[#E70209] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-red-300'
                  }`}
                >
                  +{amt} {t('currency')}
                </button>
              ))}
            </div>

            {/* Payment Gateway Method Choice */}
            <p className="text-xs font-semibold text-gray-600 mb-2">
              {language === 'ar' ? 'طريقة الدفع في مصر:' : 'Egypt Payment Provider:'}
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedMethod('INSTAPAY')}
                className={`p-3 rounded-2xl border text-start flex items-center gap-2.5 transition ${
                  selectedMethod === 'INSTAPAY'
                    ? 'border-[#E70209] bg-red-50/60 font-bold text-red-950'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs">
                  IP
                </div>
                <div>
                  <p className="font-bold">انستاباي / InstaPay</p>
                  <p className="text-[10px] text-gray-500">تحويل فوري لحظي</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('VODAFONE_CASH')}
                className={`p-3 rounded-2xl border text-start flex items-center gap-2.5 transition ${
                  selectedMethod === 'VODAFONE_CASH'
                    ? 'border-[#E70209] bg-red-50/60 font-bold text-red-950'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-black text-xs">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">فودافون كاش ومحافظ</p>
                  <p className="text-[10px] text-gray-500">Vodafone / Orange</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('CARD')}
                className={`p-3 rounded-2xl border text-start flex items-center gap-2.5 transition ${
                  selectedMethod === 'CARD'
                    ? 'border-[#E70209] bg-red-50/60 font-bold text-red-950'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">بطاقة بنكية / ميزة</p>
                  <p className="text-[10px] text-gray-500">Visa, Meeza, MC</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('FAWRY')}
                className={`p-3 rounded-2xl border text-start flex items-center gap-2.5 transition ${
                  selectedMethod === 'FAWRY'
                    ? 'border-[#E70209] bg-red-50/60 font-bold text-red-950'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">فوري / Fawry Pay</p>
                  <p className="text-[10px] text-gray-500">كود دفع فوري</p>
                </div>
              </button>
            </div>

            <button
              onClick={handleTopUp}
              disabled={isLoading}
              className="w-full py-3 bg-[#E70209] hover:bg-[#CC0006] text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-md shadow-red-600/20"
            >
              {isLoading
                ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                : (language === 'ar' ? `تأكيد شحن ${topUpAmount} ج.م` : `Confirm Top-Up ${topUpAmount} EGP`)}
            </button>
          </div>

          {/* Transactions Ledger */}
          <div>
            <h4 className="font-bold text-sm text-gray-900 mb-3">
              {language === 'ar' ? 'سجل العمليات الأخير' : 'Recent Transactions'}
            </h4>
            {transactions.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">
                {language === 'ar' ? 'لا توجد حركات سابقة' : 'No recent transactions'}
              </p>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 8).map((tx) => {
                  const isCredit = tx.type === 'CREDIT';
                  return (
                    <div
                      key={tx.id}
                      className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between text-xs border border-gray-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                            isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{tx.reason}</p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-black text-sm ${
                          isCredit ? 'text-emerald-600' : 'text-gray-900'
                        }`}
                      >
                        {isCredit ? '+' : '-'}{tx.amount.toFixed(2)} {t('currency')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
