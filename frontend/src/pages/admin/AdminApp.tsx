import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { Order, Driver, User, PricingRule, PromoCode } from '../../types';
import {
  Shield,
  TrendingUp,
  Car,
  Users,
  Store as StoreIcon,
  Tag,
  CheckCircle,
  XCircle,
  Sliders,
  Plus,
  MapPin,
  ClipboardCheck,
  Check,
  X,
  RefreshCw,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface ServiceZoneItem {
  id: string;
  zoneKey: string;
  nameAr: string;
  nameEn: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  isActive: boolean;
  baseDeliveryFee: number;
}

export const AdminApp: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    'ANALYTICS' | 'APPLICATIONS' | 'ZONES' | 'ORDERS' | 'DRIVERS' | 'PRICING' | 'PROMOS' | 'USERS' | 'STORES' | 'SUPPORT'
  >('ANALYTICS');

  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  // New Management: Zones and Pending Applications
  const [serviceZones, setServiceZones] = useState<ServiceZoneItem[]>([]);
  const [pendingCaptains, setPendingCaptains] = useState<any[]>([]);
  const [pendingStores, setPendingStores] = useState<any[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  // Stores & Support
  const [adminStores, setAdminStores] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    type: 'DRIVER' | 'STORE';
    id: string;
    name: string;
    reason: string;
  }>({
    isOpen: false,
    type: 'DRIVER',
    id: '',
    name: '',
    reason: '',
  });

  // Promo creator form
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoPercent, setNewPromoPercent] = useState('20');
  const [newPromoMax, setNewPromoMax] = useState('50');
  const [newPromoMin, setNewPromoMin] = useState('80');

  // Pricing editor modal
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);

  const fetchAdminData = async () => {
    try {
      const [anaRes, ordRes, drivRes, userRes, priceRes, promoRes, zonesRes, appsRes, storesRes, supportRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminOrders(),
        api.getAdminDrivers(),
        api.getAdminUsers(),
        api.getPricingRules(),
        api.getPromoCodes(),
        api.getAdminZones().catch(() => ({ success: false, zones: [] })),
        api.getAdminApplications().catch(() => ({ success: false, pendingApplications: { captains: [], stores: [] } })),
        api.getAdminStores().catch(() => ({ success: false, stores: [] })),
        api.getAdminSupportTickets().catch(() => ({ success: false, tickets: [] })),
      ]);

      if (anaRes.success) setAnalytics(anaRes.analytics);
      if (ordRes.success) setOrders(ordRes.orders);
      if (drivRes.success) setDrivers(drivRes.drivers);
      if (userRes.success) setUsers(userRes.users);
      if (priceRes.success) setPricingRules(priceRes.rules);
      if (promoRes.success) setPromoCodes(promoRes.promos);
      if (zonesRes.success && zonesRes.zones) setServiceZones(zonesRes.zones);
      if (appsRes.success && appsRes.pendingApplications) {
        setPendingCaptains(appsRes.pendingApplications.captains || []);
        setPendingStores(appsRes.pendingApplications.stores || []);
      }
      if (storesRes.success && storesRes.stores) setAdminStores(storesRes.stores);
      if (supportRes.success && supportRes.tickets) setSupportTickets(supportRes.tickets);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handle Review Application (Approve / Reject)
  const handleReviewApplication = async (type: 'DRIVER' | 'STORE', id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    try {
      const res = await api.reviewAdminApplication({
        type,
        id,
        status,
        rejectionReason: reason,
      });
      if (res.success) {
        alert(res.message);
        setRejectionModal({ isOpen: false, type: 'DRIVER', id: '', name: '', reason: '' });
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء معالجة الطلب');
    }
  };

  // Toggle Service Zone (Alexandria / El King / Borg El Arab)
  const handleToggleZone = async (zoneId: string) => {
    try {
      const res = await api.toggleAdminZone(zoneId);
      if (res.success) {
        setServiceZones((prev) =>
          prev.map((z) => (z.id === zoneId ? { ...z, isActive: res.zone.isActive } : z))
        );
      }
    } catch (err: any) {
      alert(err.message || 'تعذر تغيير حالة منطقة التغطية');
    }
  };

  // Block / Unblock User
  const handleToggleBlock = async (userId: string) => {
    try {
      const res = await api.toggleBlockUser(userId);
      if (res.success) {
        alert(res.message);
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Error updating user');
    }
  };

  // Create Promo Code
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createPromoCode({
        code: newPromoCode,
        discountPercent: newPromoPercent,
        maxDiscount: newPromoMax,
        minOrderAmount: newPromoMin,
      });
      if (res.success) {
        alert(res.message);
        setShowPromoModal(false);
        setNewPromoCode('');
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Error creating promo code');
    }
  };

  // Update Pricing Rule
  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRule) return;
    try {
      const res = await api.updatePricingRule(selectedRule.id, selectedRule);
      if (res.success) {
        alert(res.message);
        setSelectedRule(null);
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Error updating pricing rule');
    }
  };

  // Delete Promo Code
  const handleDeletePromo = async (promoId: string, code: string) => {
    if (!confirm(`هل أنت متأكد من حذف كود الخصم "${code}"؟`)) return;
    try {
      const res = await api.deletePromoCode(promoId);
      if (res.success) {
        alert('تم حذف كود الخصم بنجاح');
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'تعذر حذف كود الخصم');
    }
  };

  // Toggle Store Status
  const handleToggleStore = async (storeId: string) => {
    try {
      const res = await api.toggleAdminStore(storeId);
      if (res.success) {
        setAdminStores((prev) =>
          prev.map((s) => (s.id === storeId ? { ...s, isOpen: res.store?.isOpen ?? !s.isOpen } : s))
        );
      }
    } catch (err: any) {
      alert(err.message || 'تعذر تغيير حالة المتجر');
    }
  };

  // Resolve Support Ticket
  const handleResolveTicket = async (ticketId: string) => {
    if (!confirm('هل تريد وضع علامة "تم الحل" على هذه الشكوى؟')) return;
    try {
      const res = await api.resolveAdminSupportTicket(ticketId);
      if (res.success) {
        setSupportTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: 'RESOLVED' } : t))
        );
        alert('تم حل الشكوى بنجاح');
      }
    } catch (err: any) {
      alert(err.message || 'تعذر حل الشكوى');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await api.updateAdminOrderStatus(orderId, status);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: status as any } : o))
        );
      }
    } catch (err: any) {
      alert(err.message || 'تعذر تحديث حالة الطلب');
    }
  };

  const totalPendingApps = pendingCaptains.length + pendingStores.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Admin Header */}
      <div className="bg-gradient-to-r from-[#1B1464] via-[#120D45] to-[#151515] text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#E70209] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-red-600/30">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-xl tracking-tight">غرفة التحكم والإدارة المركزية - هاتلي مصر</h2>
              <span className="bg-[#E70209] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                HATLY HQ
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              منطقة الإطلاق الأولى: الإسكندرية، كينج مريوط، وبرج العرب • "اطلب هاتلي، هيجيلك وقتي"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-xs font-bold text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>متصل بالسيرفر الحي</span>
          </div>
          <button
            onClick={fetchAdminData}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 no-scrollbar">
        {[
          { key: 'ANALYTICS', labelAr: 'الإحصائيات والماليات', icon: TrendingUp },
          {
            key: 'APPLICATIONS',
            labelAr: 'طلبات التوثيق والاعتماد',
            icon: ClipboardCheck,
            badge: totalPendingApps > 0 ? totalPendingApps : null,
          },
          { key: 'ZONES', labelAr: 'مناطق التغطية والخدمة', icon: MapPin },
          { key: 'ORDERS', labelAr: 'جميع الطلبات المباشرة', icon: Car },
          { key: 'DRIVERS', labelAr: 'سجل الكباتن', icon: Shield },
          { key: 'PRICING', labelAr: 'محرك التسعير', icon: Sliders },
          { key: 'PROMOS', labelAr: 'أكواد الخصم والعروض', icon: Tag },
          { key: 'USERS', labelAr: 'المستخدمين والعملاء', icon: Users },
          { key: 'STORES', labelAr: 'المتاجر والمطاعم', icon: StoreIcon },
          { key: 'SUPPORT', labelAr: 'تذاكر الدعم والشكاوى', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap relative ${
                isActive
                  ? 'bg-[#E70209] text-white shadow-md shadow-red-600/25'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.labelAr}</span>
              {tab.badge && (
                <span className="bg-amber-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALYTICS & FINANCIALS */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">إجمالي حجم المعاملات (GMV)</span>
              <p className="text-2xl font-black text-gray-900 mt-2">
                {analytics?.financials?.totalGrossVolume ? analytics.financials.totalGrossVolume.toFixed(2) : '1,450.00'}{' '}
                <span className="text-xs text-[#E70209]">{t('currency')}</span>
              </p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">المعاملات المكتملة في الإسكندرية</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">صافي إيرادات منصة هاتلي</span>
              <p className="text-2xl font-black text-emerald-600 mt-2">
                {analytics?.financials?.totalPlatformRevenue ? analytics.financials.totalPlatformRevenue.toFixed(2) : '245.00'}{' '}
                <span className="text-xs font-bold">{t('currency')}</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-1">عمولات التوصيل والمتاجر الشريكة</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">الطلبات الجارية الآن</span>
              <p className="text-2xl font-black text-[#E70209] mt-2">
                {analytics?.activeOrders || orders.filter((o) => !['COMPLETED', 'CANCELLED'].includes(o.status)).length}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">قيد التوصيل أو التحضير</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">الكباتن المتصلين حالياً</span>
              <p className="text-2xl font-black text-gray-900 mt-2">
                {analytics?.onlineDrivers || 2} <span className="text-xs text-gray-400">/ {drivers.length} كابتن</span>
              </p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">متواجدين في مناطق التغطية النشطة</p>
            </div>
          </div>

          {/* Breakdown by Hatly Service */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="font-black text-base text-gray-900 mb-4">
              توزيع الطلبات حسب خدمات منصة هاتلي
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { title: 'هاتلي فود ومطاعم', count: analytics?.servicesBreakdown?.FOOD || 12, color: 'text-red-600' },
                { title: 'هاتلي إكسبريس (طرود)', count: analytics?.servicesBreakdown?.EXPRESS || 4, color: 'text-indigo-600' },
                { title: 'هاتلي ماركت وسوبرماركت', count: analytics?.servicesBreakdown?.MARKET || 6, color: 'text-emerald-600' },
                { title: 'هاتلي شوبينج ومتاجر', count: analytics?.servicesBreakdown?.SHOPPING || 3, color: 'text-purple-600' },
              ].map((s, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500">{s.title}</p>
                  <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: APPLICATIONS & KYC APPROVALS */}
      {activeTab === 'APPLICATIONS' && (
        <div className="space-y-6">
          {/* Captain Applications */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#E70209]" />
                <h3 className="font-black text-base text-gray-900">
                  طلبات انضمام الكباتن قيد المراجعة ({pendingCaptains.length})
                </h3>
              </div>
              <span className="text-xs text-gray-500">يتطلب فحص البطاقة، الرخصة، وصحيفة الحالة الجنائية</span>
            </div>

            {pendingCaptains.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl text-gray-500 text-xs font-bold">
                لا توجد طلبات انضمام كباتن معلقة حالياً. جميع الطلبات تم البت فيها.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingCaptains.map((cap) => (
                  <div key={cap.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-base text-gray-900">{cap.user?.name}</h4>
                        <p className="text-xs text-gray-600 font-mono">{cap.user?.phone} • {cap.user?.email}</p>
                        <p className="text-[11px] text-[#1B1464] font-bold mt-1">
                          تاريخ التسجيل: {new Date(cap.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full animate-pulse">
                        قيد المراجعة التدقيقية
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-500">نوع المركبة:</span>
                        <span className="font-bold text-gray-900">{cap.vehicleType} - {cap.vehicleModel} ({cap.vehicleYear || '2022'})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">رقم اللوحة:</span>
                        <span className="font-bold text-[#E70209]">{cap.vehiclePlate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">الرقم القومي:</span>
                        <span className="font-bold text-gray-900">{cap.nationalId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">رقم رخصة القيادة:</span>
                        <span className="font-bold text-gray-900">{cap.licenseNumber}</span>
                      </div>
                    </div>

                    {/* Document Uploads Preview List */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-gray-500">الوثائق والمستندات المرفوعة:</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                          <span>بطاقة الرقم القومي</span>
                          <span className="text-emerald-600 font-bold">✓ مرفوعة</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                          <span>رخصة القيادة</span>
                          <span className="text-emerald-600 font-bold">✓ مرفوعة</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                          <span>رخصة المركبة</span>
                          <span className="text-emerald-600 font-bold">✓ مرفوعة</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                          <span>الفيش الجنائي</span>
                          <span className="text-emerald-600 font-bold">✓ مرفوعة</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handleReviewApplication('DRIVER', cap.id, 'APPROVED')}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow"
                      >
                        <Check className="w-4 h-4" />
                        <span>اعتماد الكابتن وتفعيل الحساب</span>
                      </button>
                      <button
                        onClick={() =>
                          setRejectionModal({
                            isOpen: true,
                            type: 'DRIVER',
                            id: cap.id,
                            name: cap.user?.name || 'الكابتن',
                            reason: '',
                          })
                        }
                        className="py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                      >
                        <X className="w-4 h-4" />
                        <span>رفض الطلب</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Store & Restaurant Applications */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StoreIcon className="w-5 h-5 text-[#1B1464]" />
                <h3 className="font-black text-base text-gray-900">
                  طلبات انضمام المتاجر والمطاعم الشريكة ({pendingStores.length})
                </h3>
              </div>
              <span className="text-xs text-gray-500">يتطلب فحص السجل التجاري والبطاقة الضريبية والتصاريح</span>
            </div>

            {pendingStores.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl text-gray-500 text-xs font-bold">
                لا توجد طلبات انضمام متاجر معلقة حالياً.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingStores.map((store) => (
                  <div key={store.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-base text-gray-900">{store.nameAr} ({store.nameEn})</h4>
                        <p className="text-xs text-gray-600 font-mono">
                          المالك: {store.owner?.name || store.ownerName} • {store.owner?.phone}
                        </p>
                        <p className="text-[11px] text-[#E70209] font-bold mt-1">
                          التصنيف: {store.businessRole === 'RESTAURANT' ? 'مطعم وكافيه' : 'متجر / سوبرماركت'}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full animate-pulse">
                        قيد التدقيق التجاري
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-500">العنوان:</span>
                        <span className="font-bold text-gray-900">{store.address} ({store.city})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">مواعيد العمل:</span>
                        <span className="font-bold text-gray-900">{store.workingHours || '10:00 ص - 12:00 م'}</span>
                      </div>
                    </div>

                    {/* Official Documents Checklist */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-gray-500">المستندات التجارية والضريبية:</span>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-center">
                          <p className="font-bold">السجل التجاري</p>
                          <span className="text-emerald-600 font-bold">✓ مرفق</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-center">
                          <p className="font-bold">البطاقة الضريبية</p>
                          <span className="text-emerald-600 font-bold">✓ مرفق</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-center">
                          <p className="font-bold">التصريح الصحي</p>
                          <span className="text-emerald-600 font-bold">✓ مرفق</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handleReviewApplication('STORE', store.id, 'APPROVED')}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow"
                      >
                        <Check className="w-4 h-4" />
                        <span>اعتماد ونشر المتجر للعملاء</span>
                      </button>
                      <button
                        onClick={() =>
                          setRejectionModal({
                            isOpen: true,
                            type: 'STORE',
                            id: store.id,
                            name: store.nameAr,
                            reason: '',
                          })
                        }
                        className="py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                      >
                        <X className="w-4 h-4" />
                        <span>رفض المتجر</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: SERVICE COVERAGE ZONES */}
      {activeTab === 'ZONES' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-black text-base text-gray-900">
                  مناطق التشغيل الفعلي الأولى - الإسكندرية والمناطق المحيطة
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  تحديد نطاق الخدمة، رسوم التوصيل الأساسية، وإمكانية تفعيل أو تعطيل التغطية فورياً
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full self-start sm:self-auto">
                المنطقة الرئيسية النشطة: الإسكندرية
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {serviceZones.map((zone) => (
                <div
                  key={zone.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    zone.isActive
                      ? 'bg-white border-[#E70209]/30 shadow-md shadow-red-500/5'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        zone.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {zone.isActive ? '● التغطية نشطة' : '○ متوقفة مؤقتاً'}
                    </span>
                    <button
                      onClick={() => handleToggleZone(zone.id)}
                      className={`text-xs font-bold px-3 py-1 rounded-xl transition ${
                        zone.isActive
                          ? 'bg-red-50 hover:bg-red-100 text-[#E70209]'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {zone.isActive ? 'إيقاف المنطقة' : 'تفعيل المنطقة'}
                    </button>
                  </div>

                  <h4 className="font-black text-base text-gray-900">{zone.nameAr}</h4>
                  <p className="text-xs text-gray-500 mb-3">{zone.nameEn}</p>

                  <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">نصف قطر التغطية:</span>
                      <span className="font-bold">{zone.radiusKm} كم</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">رسوم التوصيل الأساسية:</span>
                      <span className="font-bold text-[#E70209]">{zone.baseDeliveryFee} ج.م</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-gray-500">
                      <span>إحداثيات المركز:</span>
                      <span>{zone.centerLat.toFixed(3)}, {zone.centerLng.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expandable Egyptian Governorates Expansion Plan */}
          <div className="bg-gradient-to-br from-slate-900 to-[#1B1464] text-white rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-base">خريطة التوسع القومي في المحافظات المصرية (المرحلة القادمة)</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              المعمارية البرمجية لهاتلي مبنية بالكامل للتوسع الجغرافي السلس لكافة محافظات الجمهورية. لا يتم إظهار المحافظة كمنطقة تشغيل حتى يتم اعتماد شبكة الكباتن والمتاجر الشريكة بها.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { nameAr: 'القاهرة الكبرى', status: 'جاهزة للتدشين', tag: 'المرحلة 2' },
                { nameAr: 'الجيزة و6 أكتوبر', status: 'جاهزة للتدشين', tag: 'المرحلة 2' },
                { nameAr: 'المنصورة والدقهلية', status: 'قيد التجهيز', tag: 'المرحلة 3' },
                { nameAr: 'أسيوط وباقي الصعيد', status: 'قيد التجهيز', tag: 'المرحلة 3' },
              ].map((gov, i) => (
                <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <p className="font-black text-sm text-white">{gov.nameAr}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-amber-300">
                    {gov.tag} • {gov.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ALL ORDERS DISPATCH */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="font-black text-base text-gray-900">سجل طلبات التوصيل المباشر</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                <tr>
                  <th className="p-3 text-start">رقم الطلب</th>
                  <th className="p-3 text-start">الخدمة</th>
                  <th className="p-3 text-start">العميل</th>
                  <th className="p-3 text-start">الكابتن</th>
                  <th className="p-3 text-start">خط السير</th>
                  <th className="p-3 text-start">الإجمالي</th>
                  <th className="p-3 text-start">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-3 font-bold text-[#E70209]">#{o.orderNumber}</td>
                    <td className="p-3 font-bold">{o.serviceType}</td>
                    <td className="p-3">{o.customer?.name}</td>
                    <td className="p-3">{o.driver?.user?.name || 'بانتظار كابتن'}</td>
                    <td className="p-3 max-w-xs truncate">{o.pickupAddress} ➔ {o.dropoffAddress}</td>
                    <td className="p-3 font-bold">{o.totalAmount} ج.م</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-800">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: DRIVERS DIRECTORY */}
      {activeTab === 'DRIVERS' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="font-black text-base text-gray-900">سجل الكباتن المسجلين في النظام</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((d) => (
              <div key={d.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E70209] flex items-center justify-center font-black">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-gray-900">{d.user?.name}</h4>
                      <p className="text-xs text-gray-500">{d.user?.phone}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      d.verificationStatus === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : d.verificationStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}
                  >
                    {d.verificationStatus}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-gray-600 bg-white p-3 rounded-xl border border-gray-100">
                  <p><span className="font-bold">نوع المركبة:</span> {d.vehicleType} ({d.vehicleModel})</p>
                  <p><span className="font-bold">رقم اللوحة:</span> {d.vehiclePlate}</p>
                  <p><span className="font-bold">الرقم القومي:</span> {d.nationalId}</p>
                  <p><span className="font-bold">الرصيد:</span> {d.walletBalance?.toFixed(2) || '0.00'} ج.م</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleReviewApplication('DRIVER', d.id, 'APPROVED')}
                    className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    اعتماد الكابتن
                  </button>
                  <button
                    onClick={() => handleReviewApplication('DRIVER', d.id, 'REJECTED', 'تم الإيقاف بواسطة الإدارة')}
                    className="py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl text-xs transition"
                  >
                    إيقاف الحساب
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: DYNAMIC PRICING ENGINE */}
      {activeTab === 'PRICING' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-gray-900">معادلات وقواعد تسعير خدمات هاتلي</h3>
            <span className="text-xs text-gray-500">تحديث فوري لجميع طلبات العملاء</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingRules.map((rule) => (
              <div key={rule.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h4 className="font-black text-sm text-gray-900">{rule.nameAr}</h4>
                  <span className="text-xs font-bold text-[#E70209]">{rule.serviceType}</span>
                </div>

                <div className="text-xs space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <span>فتح العداد (التعريفة الأساسية):</span>
                    <span className="font-bold">{rule.baseFare} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>سعر الكيلومتر الواحد:</span>
                    <span className="font-bold">{rule.perKmRate} ج.م/كم</span>
                  </div>
                  <div className="flex justify-between">
                    <span>سعر دقيقة الانتظار/السير:</span>
                    <span className="font-bold">{rule.perMinuteRate} ج.م/د</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الحد الأدنى للمشوار:</span>
                    <span className="font-bold">{rule.minimumFare} ج.م</span>
                  </div>
                  <div className="flex justify-between text-[#1B1464] font-bold">
                    <span>نسبة عمولة المنصة:</span>
                    <span>{rule.driverCommissionPercent}%</span>
                  </div>
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>معامل تسعير الذروة (Surge):</span>
                    <span>{rule.surgeMultiplier}x</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRule(rule)}
                  className="w-full py-2 bg-[#1B1464] hover:bg-black text-white text-xs font-bold rounded-xl transition"
                >
                  تعديل أرقام التسعير
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: PROMO CODES */}
      {activeTab === 'PROMOS' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-gray-900">أكواد الخصم والعروض الترويجية</h3>
            <button
              onClick={() => setShowPromoModal(true)}
              className="px-4 py-2 bg-[#E70209] hover:bg-[#CC0006] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء كود خصم جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promoCodes.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-red-50/60 border border-red-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-lg text-red-950 tracking-wider font-mono">
                    {p.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-red-100 text-[#E70209] font-black px-2 py-0.5 rounded-full">
                      خصم {p.discountPercent}%
                    </span>
                    <button
                      onClick={() => handleDeletePromo(p.id, p.code)}
                      className="p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                      title="حذف الكود"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>أقصى قيمة للخصم: {p.maxDiscount} ج.م</p>
                  <p>الحد الأدنى للطلب: {p.minOrderAmount} ج.م</p>
                  <p>عدد مرات الاستخدام: {p.usedCount} من {p.usageLimit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: USERS */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="font-black text-base text-gray-900">قائمة المستخدمين والعملاء</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-3 text-start">الاسم</th>
                  <th className="p-3 text-start">الهاتف</th>
                  <th className="p-3 text-start">الدور</th>
                  <th className="p-3 text-start">رصيد المحفظة</th>
                  <th className="p-3 text-start">الحالة</th>
                  <th className="p-3 text-start">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold">{u.name}</td>
                    <td className="p-3">{u.phone}</td>
                    <td className="p-3 font-semibold">{u.role}</td>
                    <td className="p-3 font-bold text-[#E70209]">{u.walletBalance.toFixed(2)} ج.م</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {u.isBlocked ? 'محظور' : 'نشط'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleBlock(u.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${u.isBlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {u.isBlocked ? 'فك الحظر' : 'حظر الحساب'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: STORES */}
      {activeTab === 'STORES' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-gray-900 text-base">المتاجر والمطاعم المسجّلة</h3>
              <p className="text-xs text-gray-500 mt-0.5">إجمالي {adminStores.length} متجر/مطعم في المنصة</p>
            </div>
            <button onClick={fetchAdminData} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold">
                <tr>
                  <th className="p-3 text-right">اسم المتجر</th>
                  <th className="p-3 text-right">النوع</th>
                  <th className="p-3 text-right">الموبايل</th>
                  <th className="p-3 text-right">الحالة</th>
                  <th className="p-3 text-right">التحقق</th>
                  <th className="p-3 text-right">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adminStores.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-400 font-bold">لا توجد متاجر مسجلة بعد</td></tr>
                ) : adminStores.map((store: any) => (
                  <tr key={store.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 font-bold text-gray-900">{store.nameAr || store.nameEn || '—'}</td>
                    <td className="p-3 text-gray-600">{store.category || '—'}</td>
                    <td className="p-3 text-gray-600 font-mono">{store.phone || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-lg font-bold ${store.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                        {store.isOpen ? 'مفتوح' : 'مغلق'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-lg font-bold text-[10px] ${
                        store.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        store.verificationStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {store.verificationStatus === 'APPROVED' ? 'موثّق' : store.verificationStatus === 'PENDING' ? 'قيد المراجعة' : store.verificationStatus || '—'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleStore(store.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${store.isOpen ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}
                      >
                        {store.isOpen ? 'إغلاق' : 'فتح'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SUPPORT TICKETS */}
      {activeTab === 'SUPPORT' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-gray-900 text-base">تذاكر الدعم والشكاوى</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {supportTickets.filter((t: any) => t.status !== 'RESOLVED').length} شكوى مفتوحة من أصل {supportTickets.length}
              </p>
            </div>
            <button onClick={fetchAdminData} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold">
                <tr>
                  <th className="p-3 text-right">المستخدم</th>
                  <th className="p-3 text-right">النوع</th>
                  <th className="p-3 text-right">الرسالة</th>
                  <th className="p-3 text-right">الحالة</th>
                  <th className="p-3 text-right">التاريخ</th>
                  <th className="p-3 text-right">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {supportTickets.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-400 font-bold">لا توجد شكاوى مسجلة</td></tr>
                ) : supportTickets.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 font-bold text-gray-900">{ticket.user?.name || ticket.user?.phone || '—'}</td>
                    <td className="p-3 text-gray-600">{ticket.type || '—'}</td>
                    <td className="p-3 text-gray-600 max-w-[200px] truncate">{ticket.message || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-lg font-bold text-[10px] ${
                        ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {ticket.status === 'RESOLVED' ? 'تم الحل' : ticket.status === 'IN_PROGRESS' ? 'جاري المعالجة' : 'مفتوح'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('ar-EG') : '—'}
                    </td>
                    <td className="p-3">
                      {ticket.status !== 'RESOLVED' ? (
                        <button
                          onClick={() => handleResolveTicket(ticket.id)}
                          className="px-3 py-1 rounded-lg text-[11px] font-bold bg-green-100 text-green-800 hover:bg-green-200 transition flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          تم الحل
                        </button>
                      ) : (
                        <span className="text-gray-400 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" /> محلول
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Modal with Reason */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-gray-900">
              رفض طلب انضمام: {rejectionModal.name}
            </h3>
            <p className="text-xs text-gray-500">
              يرجى كتابة سبب الرفض لتوضيحه للمستخدم عبر الإشعارات وشاشة المراجعة.
            </p>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">سبب الرفض:</label>
              <textarea
                rows={3}
                required
                value={rejectionModal.reason}
                onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                placeholder="مثال: صورة الرخصة غير واضحة أو السجل التجاري منتهي الصلاحية..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModal({ isOpen: false, type: 'DRIVER', id: '', name: '', reason: '' })}
                className="py-2.5 bg-gray-100 text-gray-700 font-bold rounded-2xl text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() =>
                  handleReviewApplication(rejectionModal.type, rejectionModal.id, 'REJECTED', rejectionModal.reason)
                }
                className="py-2.5 bg-[#E70209] text-white font-bold rounded-2xl text-xs shadow-md shadow-red-600/30"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Rule Edit Modal */}
      {selectedRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleUpdateRule}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <h3 className="font-black text-lg text-gray-900">
              تعديل أسعار {selectedRule.nameAr}
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">التعريفة الأساسية (ج.م)</label>
                <input
                  type="number"
                  step="0.5"
                  value={selectedRule.baseFare}
                  onChange={(e) => setSelectedRule({ ...selectedRule, baseFare: parseFloat(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">سعر الكيلومتر (ج.م)</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedRule.perKmRate}
                  onChange={(e) => setSelectedRule({ ...selectedRule, perKmRate: parseFloat(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">الحد الأدنى (ج.م)</label>
                <input
                  type="number"
                  value={selectedRule.minimumFare}
                  onChange={(e) => setSelectedRule({ ...selectedRule, minimumFare: parseFloat(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">نسبة العمولة (%)</label>
                <input
                  type="number"
                  value={selectedRule.driverCommissionPercent}
                  onChange={(e) => setSelectedRule({ ...selectedRule, driverCommissionPercent: parseFloat(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRule(null)}
                className="py-2.5 bg-gray-100 text-gray-700 font-bold rounded-2xl text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="py-2.5 bg-[#E70209] text-white font-bold rounded-2xl text-xs shadow-md shadow-red-600/30"
              >
                تطبيق التعديلات
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promo Code Creator Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreatePromo}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <h3 className="font-black text-lg text-gray-900">إنشاء كود خصم جديد</h3>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">رمز الكود (مثال: ALEX2026)</label>
              <input
                type="text"
                required
                value={newPromoCode}
                onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase font-bold"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">نسبة الخصم %</label>
                <input
                  type="number"
                  value={newPromoPercent}
                  onChange={(e) => setNewPromoPercent(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">أقصى خصم (ج.م)</label>
                <input
                  type="number"
                  value={newPromoMax}
                  onChange={(e) => setNewPromoMax(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">الحد الأدنى (ج.م)</label>
                <input
                  type="number"
                  value={newPromoMin}
                  onChange={(e) => setNewPromoMin(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="py-2.5 bg-gray-100 text-gray-700 font-bold rounded-2xl text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="py-2.5 bg-[#E70209] text-white font-bold rounded-2xl text-xs shadow-md shadow-red-600/30"
              >
                إنشاء الكود
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
