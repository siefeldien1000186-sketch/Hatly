import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { ServiceType, Store as StoreType, Product, Order } from '../../types';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import { MapPicker } from '../../components/common/MapPicker';
import { ChatModal } from '../../components/common/ChatModal';
import { ReviewModal } from '../../components/common/ReviewModal';
import {
  UtensilsCrossed,
  Package,
  ShoppingCart,
  Store,
  MapPin,
  Clock,
  Tag,
  ChevronRight,
  Plus,
  Minus,
  CheckCircle,
  Phone,
  MessageCircle,
  Search,
  Star,
  Compass,
  Crosshair,
  Map as MapIcon,
  Filter,
} from 'lucide-react';
import {
  EGYPT_GOVERNORATES,
  POPULAR_EGYPT_LOCATIONS,
  searchEgyptLocations,
  getCurrentBrowserLocation,
  EgyptLocation,
} from '../../services/egyptGeo';

export const CustomerApp: React.FC = () => {
  const { language, t } = useLanguage();
  const { user, refreshUser } = useAuth();
  const socket = getSocket();

  // Active Service Tab (Default: FOOD - Ride has been removed)
  const [selectedService, setSelectedService] = useState<ServiceType>('FOOD');
  const [activeSubTab, setActiveSubTab] = useState<'SERVICES' | 'ACTIVE_ORDER' | 'HISTORY'>('SERVICES');

  // Egypt-wide Location State (Alexandria Primary Launch Hub)
  const [selectedGovId, setSelectedGovId] = useState<string>('alexandria');
  const [deliveryLocation, setDeliveryLocation] = useState<EgyptLocation>(POPULAR_EGYPT_LOCATIONS[0]);
  const [customAddressText, setCustomAddressText] = useState<string>('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [showLocationPickerModal, setShowLocationPickerModal] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  // Express Courier Pickup & Dropoff State
  const [expressPickup, setExpressPickup] = useState<EgyptLocation>(POPULAR_EGYPT_LOCATIONS[0]);
  const [expressDropoff, setExpressDropoff] = useState<EgyptLocation>(POPULAR_EGYPT_LOCATIONS[1]);
  const [packageRecipient, setPackageRecipient] = useState('');
  const [packagePhone, setPackagePhone] = useState('');
  const [packageNote, setPackageNote] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'WALLET'>('CASH');
  const [isBooking, setIsBooking] = useState(false);

  // Food / Market / Shopping State
  const [stores, setStores] = useState<StoreType[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [customerNotes, setCustomerNotes] = useState('');

  // Active Order & Realtime Tracking State
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  // Modals
  const [showChat, setShowChat] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // 1. Fetch initial stores and past orders
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await api.getStores();
        if (res.success && res.stores) {
          setStores(res.stores);
        }
      } catch (err) {
        console.error('Error fetching stores:', err);
      }
    };

    const fetchMyOrders = async () => {
      try {
        const res = await api.getMyOrders();
        if (res.success && res.orders) {
          setOrderHistory(res.orders);
          const ongoing = res.orders.find((o: Order) =>
            !['COMPLETED', 'CANCELLED'].includes(o.status)
          );
          if (ongoing) {
            setActiveOrder(ongoing);
            setActiveSubTab('ACTIVE_ORDER');
          }
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };

    fetchStores();
    fetchMyOrders();
  }, []);

  // 2. Realtime Socket listeners for active order
  useEffect(() => {
    if (!activeOrder) return;

    socket.emit('join:order', activeOrder.id);

    const handleStatusUpdate = (updatedOrder: Order) => {
      if (updatedOrder.id === activeOrder.id) {
        setActiveOrder(updatedOrder);
        refreshUser();
        if (updatedOrder.status === 'COMPLETED') {
          setShowReview(true);
        }
      }
    };

    const handleDriverLocation = (data: { driverId: string; lat: number; lng: number }) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    };

    socket.on('order:status_update', handleStatusUpdate);
    socket.on('driver:location:update', (data) => {
      handleDriverLocation(data);
    });

    return () => {
      socket.off('order:status_update', handleStatusUpdate);
      socket.off('driver:location:update');
    };
  }, [activeOrder?.id]);

  // GPS Current Location Detection
  const handleDetectLocation = async () => {
    setIsDetectingGps(true);
    try {
      const gps = await getCurrentBrowserLocation();
      const detectedLocation: EgyptLocation = {
        id: 'current_gps',
        nameAr: `موقعي الحالي (${gps.lat.toFixed(3)}, ${gps.lng.toFixed(3)})`,
        nameEn: `My Location (${gps.lat.toFixed(3)}, ${gps.lng.toFixed(3)})`,
        governorateAr: 'مصر',
        governorateEn: 'Egypt',
        lat: gps.lat,
        lng: gps.lng,
      };
      setDeliveryLocation(detectedLocation);
      setCustomAddressText(detectedLocation.nameAr);
    } catch (err: any) {
      alert(
        language === 'ar'
          ? 'تعذر الوصول لموقعك الجغرافي. يرجى تفعيل إذن الموقع في المتصفح.'
          : 'Could not access GPS. Please allow location permissions in your browser.'
      );
    } finally {
      setIsDetectingGps(false);
    }
  };

  // 3. Handle Cart for Food / Market / Shopping
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.product.id !== productId);
    });
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // 4. Handle Food/Store Checkout
  const handleCheckoutStore = async () => {
    if (!selectedStore || cart.length === 0) return;
    setIsBooking(true);
    try {
      const orderItems = cart.map((i) => ({
        productId: i.product.id,
        nameAr: i.product.nameAr,
        nameEn: i.product.nameEn,
        price: i.product.price,
        quantity: i.quantity,
      }));

      const finalDropoffAddress = customAddressText.trim()
        ? customAddressText
        : language === 'ar'
        ? deliveryLocation.nameAr
        : deliveryLocation.nameEn;

      const res = await api.createOrder({
        serviceType: selectedService,
        storeId: selectedStore.id,
        pickupAddress: selectedStore.address,
        pickupLat: selectedStore.latitude,
        pickupLng: selectedStore.longitude,
        dropoffAddress: finalDropoffAddress,
        dropoffLat: deliveryLocation.lat,
        dropoffLng: deliveryLocation.lng,
        items: orderItems,
        paymentMethod,
        promoCode: promoApplied || undefined,
        customerNotes,
      });

      if (res.success && res.order) {
        setCart([]);
        setSelectedStore(null);
        setActiveOrder(res.order);
        setActiveSubTab('ACTIVE_ORDER');
        await refreshUser();
      }
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsBooking(false);
    }
  };

  // 5. Handle Express Parcel Booking
  const handleBookExpress = async () => {
    if (!packageRecipient || !packagePhone) {
      alert(language === 'ar' ? 'من فضلك أدخل اسم المستلم ورقم هاتفه' : 'Please enter recipient name and phone');
      return;
    }
    setIsBooking(true);
    try {
      const res = await api.createOrder({
        serviceType: 'EXPRESS',
        pickupAddress: language === 'ar' ? expressPickup.nameAr : expressPickup.nameEn,
        pickupLat: expressPickup.lat,
        pickupLng: expressPickup.lng,
        dropoffAddress: language === 'ar' ? expressDropoff.nameAr : expressDropoff.nameEn,
        dropoffLat: expressDropoff.lat,
        dropoffLng: expressDropoff.lng,
        packageRecipient,
        packagePhone,
        packageNote,
        paymentMethod,
        promoCode: promoApplied || undefined,
      });

      if (res.success && res.order) {
        setActiveOrder(res.order);
        setActiveSubTab('ACTIVE_ORDER');
        await refreshUser();
      }
    } catch (err: any) {
      alert(err.message || 'Express booking failed');
    } finally {
      setIsBooking(false);
    }
  };

  // 6. Cancel Order
  const handleCancelActiveOrder = async () => {
    if (!activeOrder) return;
    const confirmCancel = window.confirm(
      language === 'ar' ? 'هل أنت متأكد من رغبتك في إلغاء الطلب؟' : 'Are you sure you want to cancel this order?'
    );
    if (!confirmCancel) return;

    try {
      const res = await api.cancelOrder(activeOrder.id, 'User cancelled');
      if (res.success) {
        setActiveOrder(null);
        setActiveSubTab('SERVICES');
        await refreshUser();
      }
    } catch (err: any) {
      alert(err.message || 'Cancellation failed');
    }
  };

  // Filtered stores
  const filteredStores = stores.filter((s) => {
    const matchService =
      selectedService === 'FOOD'
        ? s.type === 'RESTAURANT'
        : selectedService === 'MARKET'
        ? s.type === 'SUPERMARKET'
        : s.type === 'PHARMACY' || s.type === 'SHOP';

    if (!matchService) return false;
    if (!storeSearchQuery.trim()) return true;

    const q = storeSearchQuery.toLowerCase();
    return (
      s.nameAr.toLowerCase().includes(q) ||
      s.nameEn.toLowerCase().includes(q) ||
      Boolean(s.descriptionAr && s.descriptionAr.toLowerCase().includes(q)) ||
      Boolean(s.descriptionEn && s.descriptionEn.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Customer Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('SERVICES')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition ${
              activeSubTab === 'SERVICES'
                ? 'bg-[#E70209] text-white shadow-lg shadow-red-600/25'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {language === 'ar' ? 'خدمات التوصيل' : 'Delivery Services'}
          </button>

          {activeOrder && (
            <button
              onClick={() => setActiveSubTab('ACTIVE_ORDER')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 ${
                activeSubTab === 'ACTIVE_ORDER'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('activeOrder')}</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('HISTORY')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'HISTORY'
                ? 'bg-[#1B1464] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {t('orderHistory')}
          </button>
        </div>

        {/* Egypt Live Delivery Area Pill & GPS Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDetectLocation}
            disabled={isDetectingGps}
            title={language === 'ar' ? 'تحديد موقعي التلقائي عبر الـ GPS' : 'Detect My GPS Location'}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-[#E70209] border border-red-200 rounded-xl text-xs font-bold transition"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
            <span>{isDetectingGps ? (language === 'ar' ? 'تحديد...' : 'Locating...') : (language === 'ar' ? 'موقعي' : 'GPS')}</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700">
            <MapPin className="w-3.5 h-3.5 text-[#E70209]" />
            <span className="max-w-[140px] sm:max-w-[200px] truncate">
              {customAddressText || (language === 'ar' ? deliveryLocation.nameAr : deliveryLocation.nameEn)}
            </span>
          </div>

          <button
            onClick={() => setShowLocationPickerModal(true)}
            className="px-3 py-2 bg-[#1B1464] hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تغيير الخريطة' : 'Change Map'}</span>
          </button>
        </div>
      </div>

      {/* Alexandria Launch Banner */}
      <div className="mb-6 p-3 bg-gradient-to-r from-red-50 via-slate-50 to-indigo-50 border border-red-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-black text-gray-900">
            {language === 'ar'
              ? 'منطقة الإطلاق الأولى: الإسكندرية • كينج مريوط • برج العرب'
              : 'Primary Launch Region: Alexandria • King Mariout • Borg El Arab'}
          </span>
        </div>
        <span className="text-[#1B1464] font-bold">
          {language === 'ar' ? 'اطلب هاتلي، هيجيلك وقتي ⚡' : 'Hatly: Order Now, Arrive Fast ⚡'}
        </span>
      </div>

      {/* SUBVIEW 1: SERVICES & ORDERING */}
      {activeSubTab === 'SERVICES' && (
        <div className="space-y-6">
          {/* 4 Core Delivery Service Category Cards (Food, Express, Market, Shopping) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                type: 'FOOD' as ServiceType,
                titleAr: 'هاتلي فود',
                titleEn: 'Hatly Food',
                subAr: 'مطاعم وأكلات ساخنة',
                subEn: 'Food Delivery',
                icon: UtensilsCrossed,
                color: 'from-[#E70209] to-red-600',
                badgeAr: 'الأسرع',
                badgeEn: 'Fastest',
              },
              {
                type: 'EXPRESS' as ServiceType,
                titleAr: 'هاتلي إكسبريس',
                titleEn: 'Hatly Express',
                subAr: 'توصيل طرود من باب للباب',
                subEn: 'Door to Door Courier',
                icon: Package,
                color: 'from-[#1B1464] to-indigo-700',
                badgeAr: 'الإسكندرية والمحيط',
                badgeEn: 'Alex Hub',
              },
              {
                type: 'MARKET' as ServiceType,
                titleAr: 'هاتلي ماركت',
                titleEn: 'Hatly Market',
                subAr: 'سوبرماركت وبقالة فورية',
                subEn: 'Groceries in 30m',
                icon: ShoppingCart,
                color: 'from-emerald-600 to-teal-700',
                badgeAr: 'طازة',
                badgeEn: 'Fresh',
              },
              {
                type: 'SHOPPING' as ServiceType,
                titleAr: 'هاتلي شوبينج',
                titleEn: 'Hatly Shopping',
                subAr: 'صيدليات ومتاجر ومستلزمات',
                subEn: 'Pharmacies & Retail',
                icon: Store,
                color: 'from-purple-700 to-indigo-900',
                badgeAr: '٢٤ ساعة',
                badgeEn: '24/7',
              },
            ].map((service) => {
              const Icon = service.icon;
              const isSelected = selectedService === service.type;
              return (
                <button
                  key={service.type}
                  onClick={() => {
                    setSelectedService(service.type);
                    setSelectedStore(null);
                  }}
                  className={`relative overflow-hidden p-4 rounded-3xl border text-start transition-all duration-200 transform ${
                    isSelected
                      ? 'border-[#E70209] ring-4 ring-red-500/15 bg-white shadow-xl scale-[1.02]'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${service.color} text-white flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      {language === 'ar' ? service.badgeAr : service.badgeEn}
                    </span>
                  </div>
                  <h4 className="font-black text-sm sm:text-base text-gray-900 leading-tight">
                    {language === 'ar' ? service.titleAr : service.titleEn}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {language === 'ar' ? service.subAr : service.subEn}
                  </p>
                  {isSelected && (
                    <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 w-2 h-2 rounded-full bg-[#E70209]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* SERVICE CONTENT: HATLY FOOD, MARKET, SHOPPING */}
          {(selectedService === 'FOOD' || selectedService === 'MARKET' || selectedService === 'SHOPPING') && (
            <div className="space-y-6">
              {/* Store Catalog or Menu */}
              {!selectedStore ? (
                <div>
                  {/* Search and Filters Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div>
                      <h3 className="font-black text-xl text-gray-900">
                        {selectedService === 'FOOD'
                          ? (language === 'ar' ? 'أشهر المطاعم المتاحة للتوصيل السريع' : 'Top Restaurants in Egypt')
                          : selectedService === 'MARKET'
                          ? (language === 'ar' ? 'السوبرماركت ومحلات البقالة' : 'Supermarkets & Grocery')
                          : (language === 'ar' ? 'الصيدليات والمتاجر الشريكة' : 'Pharmacies & Retail Stores')}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {language === 'ar'
                          ? `التوصيل متاح إلى ${deliveryLocation.nameAr}`
                          : `Delivering to ${deliveryLocation.nameEn}`}
                      </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-gray-400 absolute top-3.5 right-3 rtl:right-3 rtl:left-auto" />
                      <input
                        type="text"
                        value={storeSearchQuery}
                        onChange={(e) => setStoreSearchQuery(e.target.value)}
                        placeholder={language === 'ar' ? 'ابحث عن مطعم أو متجر...' : 'Search stores...'}
                        className="w-full pr-9 pl-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredStores.map((store) => (
                      <div
                        key={store.id}
                        onClick={() => setSelectedStore(store)}
                        className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition cursor-pointer group"
                      >
                        <div className="h-44 w-full relative overflow-hidden bg-gray-100">
                          <img
                            src={store.coverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'}
                            alt={store.nameAr}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-white/95 px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1 shadow">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{store.rating}</span>
                          </div>
                          <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 bg-[#151515]/90 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{store.deliveryTimeMin} دقيقة</span>
                          </div>
                        </div>

                        <div className="p-5">
                          <h4 className="font-black text-base text-gray-900">
                            {language === 'ar' ? store.nameAr : store.nameEn}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {language === 'ar' ? store.descriptionAr : store.descriptionEn}
                          </p>
                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-600">
                            <span>التوصيل: {store.deliveryFee} {t('currency')}</span>
                            <span className="text-[#E70209] font-bold flex items-center gap-1">
                              <span>{language === 'ar' ? 'عرض القائمة' : 'View Menu'}</span>
                              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredStores.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-3xl border border-gray-200">
                      <p className="text-sm font-bold text-gray-500">
                        {language === 'ar' ? 'لا توجد نتائج مطابقة لبحثك' : 'No stores matching your search'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Single Store Menu & Cart */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-8 space-y-6">
                    {/* Back Button & Store Header */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                      <div>
                        <button
                          onClick={() => setSelectedStore(null)}
                          className="text-xs font-bold text-gray-500 hover:text-gray-800 mb-2 flex items-center gap-1"
                        >
                          <ChevronRight className="w-4 h-4 rtl:rotate-0 rotate-180" />
                          <span>{language === 'ar' ? 'الرجوع للمتاجر' : 'Back to stores'}</span>
                        </button>
                        <h3 className="font-black text-xl text-gray-900">
                          {language === 'ar' ? selectedStore.nameAr : selectedStore.nameEn}
                        </h3>
                        <p className="text-xs text-gray-500">{selectedStore.address}</p>
                      </div>

                      <div className="text-end">
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                          مفتوح الآن
                        </span>
                      </div>
                    </div>

                    {/* Products Grid */}
                    {selectedStore.categories?.map((cat) => (
                      <div key={cat.id} className="space-y-3">
                        <h4 className="font-black text-base text-gray-900 border-b border-gray-200 pb-2">
                          {language === 'ar' ? cat.nameAr : cat.nameEn}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {cat.products?.map((prod) => {
                            const inCart = cart.find((i) => i.product.id === prod.id);
                            return (
                              <div
                                key={prod.id}
                                className="bg-white p-4 rounded-2xl border border-gray-200 flex justify-between gap-3 shadow-sm hover:shadow-md transition"
                              >
                                <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                    <h5 className="font-bold text-sm text-gray-900">
                                      {language === 'ar' ? prod.nameAr : prod.nameEn}
                                    </h5>
                                    {prod.descriptionAr && (
                                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                                        {language === 'ar' ? prod.descriptionAr : prod.descriptionEn}
                                      </p>
                                    )}
                                  </div>
                                  <div className="mt-3 flex items-center gap-2">
                                    <span className="font-black text-sm text-[#E70209]">
                                      {prod.price} {t('currency')}
                                    </span>
                                  </div>
                                </div>

                                <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden relative flex-shrink-0">
                                  <img
                                    src={prod.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                                    alt={prod.nameAr}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute bottom-1.5 right-1.5 rtl:right-auto rtl:left-1.5">
                                    {inCart ? (
                                      <div className="flex items-center gap-1 bg-white shadow-md rounded-xl p-1 text-xs font-bold">
                                        <button
                                          onClick={() => removeFromCart(prod.id)}
                                          className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-gray-700"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="px-1 text-xs font-bold text-gray-900">
                                          {inCart.quantity}
                                        </span>
                                        <button
                                          onClick={() => addToCart(prod)}
                                          className="w-5 h-5 rounded-md bg-[#E70209] text-white flex items-center justify-center"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => addToCart(prod)}
                                        className="w-7 h-7 rounded-xl bg-[#E70209] text-white flex items-center justify-center shadow-md shadow-red-600/30 hover:scale-105 transition"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Cart Drawer */}
                  <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm sticky top-24 space-y-4">
                    <h4 className="font-black text-base text-gray-900 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-[#E70209]" />
                      <span>{language === 'ar' ? 'سلة الطلب' : 'Your Basket'}</span>
                    </h4>

                    {cart.length === 0 ? (
                      <div className="py-12 text-center text-gray-400 text-xs">
                        {language === 'ar' ? 'السلة فارغة، اختر أصناف لإضافتها' : 'Basket is empty'}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {cart.map((item) => (
                            <div key={item.product.id} className="flex justify-between items-center text-xs py-1 border-b border-gray-100">
                              <div>
                                <p className="font-bold text-gray-900">
                                  {item.quantity}x {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                                </p>
                              </div>
                              <span className="font-bold text-gray-700">
                                {(item.product.price * item.quantity).toFixed(2)} {t('currency')}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            {language === 'ar' ? 'ملاحظات للمطعم / الكابتن' : 'Order Notes'}
                          </label>
                          <input
                            type="text"
                            value={customerNotes}
                            onChange={(e) => setCustomerNotes(e.target.value)}
                            placeholder={language === 'ar' ? 'مثال: بدون بصل / الشطة برة' : 'e.g. Extra spicy'}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                          />
                        </div>

                        {/* Delivery Address Review */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-gray-700">
                              {t('dropoffLocation')}
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowLocationPickerModal(true)}
                              className="text-[11px] text-[#E70209] font-bold hover:underline"
                            >
                              {language === 'ar' ? 'تعديل العنوان' : 'Edit'}
                            </button>
                          </div>
                          <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#E70209] flex-shrink-0" />
                            <span className="truncate">
                              {customAddressText || (language === 'ar' ? deliveryLocation.nameAr : deliveryLocation.nameEn)}
                            </span>
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1.5">
                            {t('paymentMethod')}
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['CASH', 'WALLET', 'CARD'] as const).map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setPaymentMethod(method)}
                                className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition ${
                                  paymentMethod === method
                                    ? 'bg-[#E70209] text-white border-[#E70209]'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                {method === 'CASH'
                                  ? t('cash')
                                  : method === 'WALLET'
                                  ? t('wallet')
                                  : t('card')}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Bill breakdown */}
                        <div className="p-3 bg-gray-50 rounded-2xl text-xs space-y-1.5 border border-gray-100">
                          <div className="flex justify-between text-gray-500">
                            <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                            <span>{cartSubtotal.toFixed(2)} {t('currency')}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>{language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                            <span>{selectedStore.deliveryFee} {t('currency')}</span>
                          </div>
                          <div className="flex justify-between font-black text-sm text-gray-900 border-t border-gray-200 pt-1.5">
                            <span>{t('total')}</span>
                            <span className="text-[#E70209]">
                              {(cartSubtotal + selectedStore.deliveryFee).toFixed(2)} {t('currency')}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleCheckoutStore}
                          disabled={isBooking}
                          className="w-full py-3.5 bg-[#E70209] hover:bg-[#CC0006] text-white font-black rounded-2xl text-sm shadow-lg shadow-red-600/25 transition disabled:opacity-50"
                        >
                          {isBooking
                            ? (language === 'ar' ? 'جاري إرسال الطلب...' : 'Sending Order...')
                            : (language === 'ar' ? 'تأكيد طلب التوصيل الآن' : 'Place Order Now')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SERVICE CONTENT: HATLY EXPRESS (DOOR TO DOOR DELIVERY ACROSS EGYPT) */}
          {selectedService === 'EXPRESS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Interactive Egypt Map for Courier Route */}
              <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#E70209]" />
                    <span>{language === 'ar' ? 'مسار استلام وتسليم الطرد' : 'Courier Route on Egypt Map'}</span>
                  </h3>
                  <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-full">
                    {language === 'ar' ? 'الإسكندرية والمناطق المحيطة' : 'Alexandria & Metro'}
                  </span>
                </div>

                <MapPicker
                  pickupLat={expressPickup.lat}
                  pickupLng={expressPickup.lng}
                  dropoffLat={expressDropoff.lat}
                  dropoffLng={expressDropoff.lng}
                  selectedGovernorate={selectedGovId}
                  className="h-80 w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100"
                />

                {/* Pickup & Dropoff Governorate & City Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>{t('pickupLocation')} (مكان الاستلام)</span>
                    </label>
                    <select
                      value={expressPickup.id}
                      onChange={(e) => {
                        const loc = POPULAR_EGYPT_LOCATIONS.find((l) => l.id === e.target.value);
                        if (loc) setExpressPickup(loc);
                      }}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                    >
                      {POPULAR_EGYPT_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.governorateAr} - {language === 'ar' ? loc.nameAr : loc.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E70209]" />
                      <span>{t('dropoffLocation')} (مكان التسليم)</span>
                    </label>
                    <select
                      value={expressDropoff.id}
                      onChange={(e) => {
                        const loc = POPULAR_EGYPT_LOCATIONS.find((l) => l.id === e.target.value);
                        if (loc) setExpressDropoff(loc);
                      }}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                    >
                      {POPULAR_EGYPT_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.governorateAr} - {language === 'ar' ? loc.nameAr : loc.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Express Booking Form */}
              <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-[#1B1464] flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-gray-900">
                      {language === 'ar' ? 'هاتلي إكسبريس - طرود ومستندات فورية' : 'Hatly Express Courier'}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      {language === 'ar' ? 'مندوب خاص ينقل طردك من باب البيت' : 'Dedicated door-to-door courier'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {language === 'ar' ? 'اسم المستلم' : 'Recipient Name'}
                    </label>
                    <input
                      type="text"
                      value={packageRecipient}
                      onChange={(e) => setPackageRecipient(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: مروان أحمد' : 'e.g. Ahmed Ali'}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {language === 'ar' ? 'رقم هاتف المستلم' : 'Recipient Phone'}
                    </label>
                    <input
                      type="tel"
                      value={packagePhone}
                      onChange={(e) => setPackagePhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {language === 'ar' ? 'محتويات الطرد وملاحظات التوصيل' : 'Parcel Notes'}
                    </label>
                    <input
                      type="text"
                      value={packageNote}
                      onChange={(e) => setPackageNote(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: مستندات عقد عمل في مظروف مغلق' : 'e.g. Legal documents'}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                      {t('paymentMethod')}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['CASH', 'WALLET', 'CARD'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition ${
                            paymentMethod === method
                              ? 'bg-[#E70209] text-white border-[#E70209]'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {method === 'CASH'
                            ? t('cash')
                            : method === 'WALLET'
                            ? t('wallet')
                            : t('card')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleBookExpress}
                    disabled={isBooking}
                    className="w-full py-3.5 bg-[#E70209] hover:bg-[#CC0006] text-white font-black rounded-2xl text-sm shadow-lg shadow-red-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    <span>
                      {isBooking
                        ? (language === 'ar' ? 'جاري طلب المندوب...' : 'Dispatching Courier...')
                        : (language === 'ar' ? 'طلب مندوب هاتلي إكسبريس الآن' : 'Request Courier Now')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBVIEW 2: ACTIVE ORDER REALTIME TRACKING */}
      {activeSubTab === 'ACTIVE_ORDER' && activeOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Realtime Live Tracking Map */}
          <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  طلب #{activeOrder.orderNumber}
                </span>
                <h3 className="font-black text-lg text-gray-900">
                  {language === 'ar' ? 'تتبع مندوب التوصيل المباشر' : 'Live Delivery Tracking'}
                </h3>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full animate-pulse">
                {activeOrder.status}
              </span>
            </div>

            <MapPicker
              pickupLat={activeOrder.pickupLat}
              pickupLng={activeOrder.pickupLng}
              dropoffLat={activeOrder.dropoffLat}
              dropoffLng={activeOrder.dropoffLng}
              driverLat={driverLocation?.lat || activeOrder.driver?.currentLat || activeOrder.pickupLat + 0.005}
              driverLng={driverLocation?.lng || activeOrder.driver?.currentLng || activeOrder.pickupLng + 0.005}
              interactive={false}
              className="h-96 w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100"
            />

            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <div>
                <p className="text-gray-400">{t('pickupLocation')}</p>
                <p className="font-bold text-gray-800 line-clamp-1">{activeOrder.pickupAddress}</p>
              </div>
              <div>
                <p className="text-gray-400">{t('dropoffLocation')}</p>
                <p className="font-bold text-gray-800 line-clamp-1">{activeOrder.dropoffAddress}</p>
              </div>
            </div>
          </div>

          {/* Order Details & Driver Action Card */}
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            {/* Status Stepper */}
            <div className="bg-red-50/70 p-4 rounded-2xl border border-red-200/60">
              <p className="text-xs font-bold text-red-950 mb-1">
                {t(activeOrder.status)}
              </p>
              <div className="w-full bg-red-200 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#E70209] h-full transition-all duration-500 rounded-full"
                  style={{
                    width:
                      activeOrder.status === 'PENDING_DRIVER' || activeOrder.status === 'STORE_PENDING'
                        ? '20%'
                        : activeOrder.status === 'STORE_PREPARING'
                        ? '40%'
                        : activeOrder.status === 'DRIVER_ASSIGNED'
                        ? '55%'
                        : activeOrder.status === 'DRIVER_ARRIVED'
                        ? '75%'
                        : activeOrder.status === 'IN_PROGRESS'
                        ? '90%'
                        : '100%',
                  }}
                />
              </div>
            </div>

            {/* Assigned Driver Details */}
            {activeOrder.driver ? (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeOrder.driver.user?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100'}
                    alt="Driver"
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-red-400/40"
                  />
                  <div>
                    <h4 className="font-black text-sm text-gray-900">
                      {activeOrder.driver.user?.name}
                    </h4>
                    <p className="text-xs text-gray-500 font-semibold">
                      {activeOrder.driver.vehicleModel} • {activeOrder.driver.vehiclePlate}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold mt-0.5">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{activeOrder.driver.rating || '4.9'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowChat(true)}
                    className="w-10 h-10 rounded-2xl bg-[#E70209] hover:bg-[#CC0006] text-white flex items-center justify-center transition shadow-md shadow-red-600/20"
                    title="Live Chat"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>

                  <a
                    href={`tel:${activeOrder.driver.user?.phone || '01022223333'}`}
                    className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition shadow-md shadow-emerald-600/20"
                    title="Call Driver"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span>جاري إرسال الطلب لأقرب مندوب هاتلي حولك...</span>
              </div>
            )}

            {/* Price Receipt */}
            <div className="space-y-2 border-t border-gray-100 pt-3 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>طريقة الدفع</span>
                <span className="font-bold text-gray-800">{activeOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>إجمالي المبلغ</span>
                <span className="font-black text-base text-[#E70209]">
                  {activeOrder.totalAmount} {t('currency')}
                </span>
              </div>
            </div>

            {/* Cancel Button */}
            {!['COMPLETED', 'CANCELLED'].includes(activeOrder.status) && (
              <button
                onClick={handleCancelActiveOrder}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition"
              >
                {language === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* SUBVIEW 3: ORDER HISTORY */}
      {activeSubTab === 'HISTORY' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-black text-lg text-gray-900 mb-4">{t('orderHistory')}</h3>
          {orderHistory.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">لا توجد طلبات سابقة</p>
          ) : (
            <div className="space-y-3">
              {orderHistory.map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900">#{o.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-[#E70209] font-bold">
                        {o.serviceType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold ${
                          o.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : o.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <p className="text-gray-500">
                      {o.pickupAddress} ➔ {o.dropoffAddress}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-end">
                    <p className="font-black text-base text-[#151515]">
                      {o.totalAmount} {t('currency')}
                    </p>
                    <p className="text-[11px] text-gray-400 capitalize">{o.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Egypt Interactive Map & Location Selector Modal */}
      {showLocationPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-gray-900">
                  {language === 'ar' ? 'حدد موقع التوصيل في مصر' : 'Select Delivery Location in Egypt'}
                </h3>
                <p className="text-xs text-gray-500">
                  {language === 'ar' ? 'منطقة التشغيل الحالية: الإسكندرية والمناطق المجاورة' : 'Current Operational Zone: Alexandria Hub'}
                </p>
              </div>
              <button
                onClick={() => setShowLocationPickerModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Governorate & Search Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {language === 'ar' ? 'المحافظة' : 'Governorate'}
                </label>
                <select
                  value={selectedGovId}
                  onChange={(e) => {
                    const gId = e.target.value;
                    setSelectedGovId(gId);
                    const popularInGov = POPULAR_EGYPT_LOCATIONS.find((l) =>
                      l.id.includes(gId) || l.governorateAr.includes(e.target.value)
                    );
                    if (popularInGov) {
                      setDeliveryLocation(popularInGov);
                    }
                  }}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                >
                  {EGYPT_GOVERNORATES.map((gov: any) => (
                    <option key={gov.id} value={gov.id}>
                      {language === 'ar' ? gov.nameAr : gov.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {language === 'ar' ? 'البحث عن منطقة أو حي' : 'Search Area'}
                </label>
                <input
                  type="text"
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: سموحة، كينج مريوط، برج العرب...' : 'e.g. Smouha, King Mariout, Borg El Arab...'}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
                />
              </div>
            </div>

            {/* Interactive Map */}
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              <MapPicker
                pickupLat={deliveryLocation.lat}
                pickupLng={deliveryLocation.lng}
                selectedGovernorate={selectedGovId}
                onPickupChange={(lat, lng, address) => {
                  setDeliveryLocation({
                    id: 'custom_pin',
                    nameAr: address || `موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
                    nameEn: address || `Pinned (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
                    governorateAr: 'الإسكندرية',
                    governorateEn: 'Alexandria',
                    zone: 'ALEXANDRIA',
                    lat,
                    lng,
                  });
                  setCustomAddressText(address || `موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                }}
                className="h-64 w-full"
              />
            </div>

            {/* Quick Popular Egyptian Locations */}
            <div>
              <p className="text-xs font-bold text-gray-600 mb-2">
                {language === 'ar' ? 'أماكن ومناطق رئيسية سريعة:' : 'Quick popular locations:'}
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                {searchEgyptLocations(locationSearchQuery).map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setDeliveryLocation(loc);
                      setCustomAddressText(loc.nameAr);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      deliveryLocation.id === loc.id
                        ? 'bg-[#E70209] text-white border-[#E70209]'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {language === 'ar' ? loc.nameAr : loc.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Street Address Input */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {language === 'ar' ? 'تفاصيل العنوان الدقيقة (اسم الشارع / رقم العمارة / الشقة)' : 'Detailed Address'}
              </label>
              <input
                type="text"
                value={customAddressText}
                onChange={(e) => setCustomAddressText(e.target.value)}
                placeholder={language === 'ar' ? 'مثال: سموحة، أبراج جرين بلازا، الدور الرابع' : 'Building, floor, apt...'}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E70209]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowLocationPickerModal(false)}
                className="px-5 py-2.5 bg-[#E70209] hover:bg-[#CC0006] text-white rounded-xl text-xs font-black shadow-md transition"
              >
                {language === 'ar' ? 'تأكيد الموقع' : 'Confirm Location'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && activeOrder && (
        <ChatModal
          orderId={activeOrder.id}
          recipientName={activeOrder.driver?.user?.name || 'كابتن هاتلي'}
          recipientRole="Driver"
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Rating & Review Modal */}
      {showReview && activeOrder && (
        <ReviewModal
          orderId={activeOrder.id}
          targetType={activeOrder.driverId ? 'DRIVER' : 'STORE'}
          targetId={activeOrder.driverId || activeOrder.storeId || ''}
          targetName={activeOrder.driver?.user?.name || activeOrder.store?.nameAr || 'هاتلي'}
          onClose={() => setShowReview(false)}
          onReviewed={() => {
            setActiveOrder(null);
            setActiveSubTab('SERVICES');
          }}
        />
      )}
    </div>
  );
};
