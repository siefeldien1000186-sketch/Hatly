import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import { MapPicker } from '../../components/common/MapPicker';
import { ChatModal } from '../../components/common/ChatModal';
import {
  Car,
  Power,
  Radar,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Wallet,
  Star,
  TrendingUp,
  AlertCircle,
  Navigation,
  Play,
  Pause,
} from 'lucide-react';

export const DriverApp: React.FC = () => {
  const { language, t } = useLanguage();
  const { user, refreshUser } = useAuth();
  const socket = getSocket();

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [stats, setStats] = useState<any>(null);
  const [radarOrders, setRadarOrders] = useState<Order[]>([]);
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [countdown, setCountdown] = useState<number>(30);
  const [activeTrip, setActiveTrip] = useState<Order | null>(null);
  const [driverCoord, setDriverCoord] = useState<{ lat: number; lng: number }>({
    lat: 30.0571,
    lng: 31.2223,
  });

  // Simulator
  const [isSimulatingDriving, setIsSimulatingDriving] = useState(false);
  const simIntervalRef = useRef<any>(null);

  // Modals
  const [showChat, setShowChat] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('500');
  const [withdrawMethod, setWithdrawMethod] = useState('INSTAPAY');
  const [withdrawAccount, setWithdrawAccount] = useState('01022223333@instapay');

  // 1. Fetch initial driver stats
  const fetchStats = async () => {
    try {
      const res = await api.getDriverStats();
      if (res.success && res.stats) {
        setStats(res.stats);
        setIsOnline(res.stats.isOnline);
        if (res.stats.activeOrder) {
          setActiveTrip(res.stats.activeOrder);
        }
      }
    } catch (err) {
      console.error('Driver stats error:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 2. Radar polling & Socket listeners
  useEffect(() => {
    if (stats?.driverId) {
      if (isOnline) {
        socket.emit('join:driver:radar', stats.driverId);
      } else {
        socket.emit('leave:driver:radar', stats.driverId);
      }
    }

    const handleRadarNewOrder = (order: Order) => {
      if (isOnline && !activeTrip) {
        setIncomingOrder(order);
        setCountdown(30);
      }
    };

    socket.on('radar:new_order', handleRadarNewOrder);

    // Also poll radar orders
    const interval = setInterval(async () => {
      if (isOnline && !activeTrip) {
        try {
          const res = await api.getDriverRadar();
          if (res.success && res.orders && res.orders.length > 0) {
            setRadarOrders(res.orders);
            if (!incomingOrder) {
              setIncomingOrder(res.orders[0]);
              setCountdown(30);
            }
          }
        } catch (e) {}
      }
    }, 5000);

    return () => {
      socket.off('radar:new_order', handleRadarNewOrder);
      clearInterval(interval);
    };
  }, [isOnline, activeTrip, stats?.driverId, incomingOrder]);

  // 3. Countdown timer for incoming request
  useEffect(() => {
    let timer: any;
    if (incomingOrder && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (countdown === 0 && incomingOrder) {
      setIncomingOrder(null);
    }
    return () => clearInterval(timer);
  }, [incomingOrder, countdown]);

  // 4. Toggle Online/Offline
  const handleToggleOnline = async () => {
    try {
      const res = await api.toggleDriverOnline();
      if (res.success) {
        setIsOnline(res.isOnline);
        await fetchStats();
      }
    } catch (err: any) {
      alert(err.message || 'Error toggling availability');
    }
  };

  // 5. Accept Order
  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await api.acceptOrder(orderId);
      if (res.success && res.order) {
        setActiveTrip(res.order);
        setIncomingOrder(null);
        await fetchStats();
      }
    } catch (err: any) {
      alert(err.message || 'Error accepting order');
      setIncomingOrder(null);
    }
  };

  // 6. Advance Trip Status
  const handleUpdateTripStatus = async (status: string) => {
    if (!activeTrip) return;
    try {
      const res = await api.updateTripStatus(activeTrip.id, status);
      if (res.success && res.order) {
        if (status === 'COMPLETED') {
          setActiveTrip(null);
          setIsSimulatingDriving(false);
          clearInterval(simIntervalRef.current);
          alert(language === 'ar' ? 'ألف مبروك! تم إنهاء الرحلة وإضافة الأرباح إلى محفظتك بنجاح' : 'Trip completed! Earnings credited to wallet');
        } else {
          setActiveTrip(res.order);
        }
        await fetchStats();
        await refreshUser();
      }
    } catch (err: any) {
      alert(err.message || 'Error updating trip status');
    }
  };

  // 7. Live GPS Simulator
  const toggleGPSSimulator = () => {
    if (isSimulatingDriving) {
      clearInterval(simIntervalRef.current);
      setIsSimulatingDriving(false);
    } else {
      setIsSimulatingDriving(true);
      if (!activeTrip) return;

      const targetLat = activeTrip.status === 'DRIVER_ASSIGNED' ? activeTrip.pickupLat : activeTrip.dropoffLat;
      const targetLng = activeTrip.status === 'DRIVER_ASSIGNED' ? activeTrip.pickupLng : activeTrip.dropoffLng;

      simIntervalRef.current = setInterval(() => {
        setDriverCoord((prev) => {
          const stepLat = (targetLat - prev.lat) * 0.15;
          const stepLng = (targetLng - prev.lng) * 0.15;
          const nextLat = prev.lat + stepLat;
          const nextLng = prev.lng + stepLng;

          // Emit to server
          socket.emit('driver:location', {
            driverId: stats?.driverId,
            orderId: activeTrip.id,
            lat: nextLat,
            lng: nextLng,
          });

          return { lat: nextLat, lng: nextLng };
        });
      }, 2000);
    }
  };

  // 8. Driver Withdrawal
  const handleWithdrawal = async () => {
    try {
      const res = await api.withdrawEarnings(parseFloat(withdrawAmount), withdrawMethod, withdrawAccount);
      if (res.success) {
        alert(res.message);
        setShowWithdrawModal(false);
        await fetchStats();
        await refreshUser();
      }
    } catch (err: any) {
      alert(err.message || 'Withdrawal error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Driver Status Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120'}
              alt="Driver"
              className="w-14 h-14 rounded-2xl object-cover ring-4 ring-red-500/20"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                isOnline ? 'bg-emerald-500' : 'bg-gray-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-lg text-gray-900">{user?.name}</h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                موثق (Verified)
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {stats?.vehicle?.model} • {stats?.vehicle?.plate} • {stats?.vehicle?.color}
            </p>
          </div>
        </div>

        {/* Online / Offline Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleToggleOnline}
            className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2.5 transition shadow-lg ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-gray-800 hover:bg-black text-white shadow-gray-900/20'
            }`}
          >
            <Power className="w-5 h-5" />
            <span>{isOnline ? 'أنت متصل (Online)' : 'أنت غير متصل (Offline)'}</span>
          </button>
        </div>
      </div>

      {/* Driver KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">أرباح اليوم</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {stats?.todayEarnings ? stats.todayEarnings.toFixed(2) : '0.00'}{' '}
            <span className="text-xs text-[#E70209] font-bold">{t('currency')}</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">{stats?.todayTripsCount || 0} مشاوير اليوم</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">رصيد المحفظة الساحب</span>
            <Wallet className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {stats?.walletBalance ? stats.walletBalance.toFixed(2) : '0.00'}{' '}
            <span className="text-xs text-[#E70209] font-bold">{t('currency')}</span>
          </p>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="text-[11px] text-[#E70209] font-bold hover:underline mt-1 block"
          >
            طلب سحب رصيد (انستاباي / كاش) ➔
          </button>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">تقييم الكابتن</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-gray-900">{stats?.rating || '4.95'}</p>
          <p className="text-[11px] text-gray-400 mt-1">إجمالي {stats?.totalTrips || 214} مشوار مكتمل</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">عمولة هاتلي المستحقة</span>
            <AlertCircle className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {stats?.commissionOwed ? stats.commissionOwed.toFixed(2) : '0.00'}{' '}
            <span className="text-xs text-gray-500 font-bold">{t('currency')}</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">نسبة ثابتة ١٥٪ فقط</p>
        </div>
      </div>

      {/* ACTIVE TRIP IN PROGRESS */}
      {activeTrip ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#E70209] uppercase tracking-wider">
                  رحلة نشطة #{activeTrip.orderNumber}
                </span>
                <h3 className="font-black text-lg text-gray-900">
                  {activeTrip.serviceType} • {activeTrip.paymentMethod}
                </h3>
              </div>

              {/* GPS Simulator Toggle */}
              <button
                onClick={toggleGPSSimulator}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  isSimulatingDriving
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isSimulatingDriving ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulatingDriving ? 'إيقاف محاكي القيادة' : 'تشغيل محاكي GPS للتحرك'}</span>
              </button>
            </div>

            <MapPicker
              pickupLat={activeTrip.pickupLat}
              pickupLng={activeTrip.pickupLng}
              dropoffLat={activeTrip.dropoffLat}
              dropoffLng={activeTrip.dropoffLng}
              driverLat={driverCoord.lat}
              driverLng={driverCoord.lng}
              driverVehicleType={stats?.vehicle?.type || 'CAR'}
              interactive={false}
              className="h-96 w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100"
            />
          </div>

          {/* Action & Status Progression Panel */}
          <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            {/* Customer Contact */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase">العميل</p>
                <h4 className="font-black text-sm text-gray-900">
                  {activeTrip.customer?.name || 'أحمد حسن'}
                </h4>
                <p className="text-xs text-gray-500 font-semibold">
                  {activeTrip.customer?.phone || '01011112222'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowChat(true)}
                  className="w-10 h-10 rounded-2xl bg-[#E70209] text-white flex items-center justify-center shadow-md shadow-red-600/20"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <a
                  href={`tel:${activeTrip.customer?.phone || '01011112222'}`}
                  className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Financial summary */}
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200/60 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-gray-700">
                <span>إجمالي الفاتورة المطلوب تحصيلها</span>
                <span className="text-sm font-black text-gray-900">
                  {activeTrip.totalAmount} {t('currency')}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>صافي أرباحك بعد العمولة</span>
                <span className="text-base font-black">
                  {activeTrip.driverEarnings} {t('currency')}
                </span>
              </div>
            </div>

            {/* Next Action Button depending on Status */}
            <div className="space-y-2">
              {activeTrip.status === 'DRIVER_ASSIGNED' && (
                <button
                  onClick={() => handleUpdateTripStatus('DRIVER_ARRIVED')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-base shadow-lg shadow-blue-600/20 transition"
                >
                  وصلت لمكان الاستلام (Arrived)
                </button>
              )}

              {activeTrip.status === 'DRIVER_ARRIVED' && (
                <button
                  onClick={() => handleUpdateTripStatus('IN_PROGRESS')}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-base shadow-lg shadow-emerald-600/20 transition"
                >
                  بدء الرحلة مع العميل (Start Trip)
                </button>
              )}

              {activeTrip.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleUpdateTripStatus('COMPLETED')}
                  className="w-full py-4 bg-[#E70209] hover:bg-[#CC0006] text-white font-black rounded-2xl text-base shadow-xl shadow-red-600/25 transition animate-pulse"
                >
                  إنهاء المشوار وتحصيل المبلغ (Complete)
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* RADAR SCANNING SCREEN */
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center relative overflow-hidden">
          {/* Incoming Order Modal Alert with Countdown */}
          {incomingOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in zoom-in-95">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-start border-4 border-[#E70209]">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="font-black text-base text-gray-900">
                      طلب جديد وارد! ({incomingOrder.serviceType})
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-red-100 text-[#E70209] font-black text-sm flex items-center justify-center">
                    {countdown}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    <p className="text-gray-400 font-bold mb-0.5">مكان الاستلام:</p>
                    <p className="font-bold text-gray-800">{incomingOrder.pickupAddress}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    <p className="text-gray-400 font-bold mb-0.5">مكان التوصيل:</p>
                    <p className="font-bold text-gray-800">{incomingOrder.dropoffAddress}</p>
                  </div>
                </div>

                {/* Earnings Highlight */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-800 font-bold">أرباحك الصافية من الرحلة:</p>
                    <p className="text-2xl font-black text-emerald-600">
                      {incomingOrder.driverEarnings} {t('currency')}
                    </p>
                  </div>
                  <span className="text-xs bg-emerald-200/80 text-emerald-900 font-bold px-2.5 py-1 rounded-full">
                    مسافة {incomingOrder.distanceKm} كم
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setIncomingOrder(null)}
                    className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs transition"
                  >
                    تخطي (رفض)
                  </button>
                  <button
                    onClick={() => handleAcceptOrder(incomingOrder.id)}
                    className="py-3 bg-[#E70209] hover:bg-[#CC0006] text-white font-black rounded-2xl text-sm transition shadow-lg shadow-red-600/30"
                  >
                    قبول الطلب الآن
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Radar Scanning Visual */}
          <div className="max-w-md mx-auto py-12 flex flex-col items-center">
            <div className="relative w-44 h-44 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-red-500/20 radar-ping" />
              <div className="absolute inset-4 rounded-full border-2 border-red-500/30 animate-pulse" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#1B1464] to-[#120D45] text-[#E70209] flex items-center justify-center shadow-2xl relative z-10">
                <Radar className="w-12 h-12 animate-spin duration-3000" />
              </div>
            </div>

            <h3 className="font-black text-xl text-gray-900 mb-1">
              {isOnline ? 'الرادار يبحث عن طلبات قريبة منك...' : 'أنت غير متصل حالياً'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm">
              {isOnline
                ? 'ابق في هذه الشاشة، ستظهر لك إشعارات الطلبات فور طلب أي عميل في منطقتك'
                : 'اضغط على زر "أنت متصل" في الأعلى لبدء استقبال المشاوير'}
            </p>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-gray-900">سحب أرباح الكابتن</h3>
            <p className="text-xs text-gray-500">
              رصيدك المتاح: {stats?.walletBalance ? stats.walletBalance.toFixed(2) : '0.00'} ج.م
            </p>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">المبلغ المطلوب سحبه (ج.م)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">طريقة السحب في مصر</label>
              <select
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              >
                <option value="INSTAPAY">انستاباي (InstaPay - فوري ولحظي)</option>
                <option value="VODAFONE_CASH">فودافون كاش / محفظة هاتف</option>
                <option value="BANK_TRANSFER">تحويل بنكي مصري (IBAN)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">بيانات الحساب / المحفظة</label>
              <input
                type="text"
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
                placeholder="عنوان انستاباي أو رقم الكاش"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleWithdrawal}
                className="py-3 bg-[#E70209] text-white font-bold rounded-2xl text-xs shadow-md shadow-red-600/20"
              >
                تأكيد طلب السحب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && activeTrip && (
        <ChatModal
          orderId={activeTrip.id}
          recipientName={activeTrip.customer?.name || 'العميل'}
          recipientRole="Customer"
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};
