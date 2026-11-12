import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Brand
    brandName: 'هاتلي',
    brandTagline: 'اطلب هاتلي، هيجيلك وقتي • كل خدمات التوصيل في مكان واحد',
    egyptMarket: 'جمهورية مصر العربية',
    currency: 'ج.م',

    // Roles & Portal
    roleCustomer: 'تطبيق العميل',
    roleDriver: 'تطبيق الكابتن والمندوب',
    roleStore: 'لوحة التاجر والمطعم',
    roleAdmin: 'لوحة الإدارة المركزية',

    // Services
    serviceFood: 'هاتلي فود',
    serviceFoodDesc: 'أشهى المأكولات من أشهر المطاعم المصرية والعالمية',
    serviceExpress: 'هاتلي إكسبريس',
    serviceExpressDesc: 'توصيل طرود، مستندات وأغراض فورية في كل مصر',
    serviceMarket: 'هاتلي ماركت',
    serviceMarketDesc: 'بقالة، ألبان، خضار وفاكهة طازجة توصلك في ٣٠ دقيقة',
    serviceShopping: 'هاتلي شوبينج',
    serviceShoppingDesc: 'صيدليات ومستلزمات ومتاجر التجزئة المفضلة',

    // Actions & Common
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب جديد',
    logout: 'تسجيل الخروج',
    bookNow: 'اطلب الآن',
    confirmOrder: 'تأكيد الطلب',
    cancel: 'إلغاء',
    save: 'حفظ',
    search: 'بحث...',
    pickupLocation: 'مكان الاستلام / الانطلاق',
    dropoffLocation: 'مكان التوصيل / الوصول',
    distance: 'المسافة',
    duration: 'الوقت التقريبي',
    baseFare: 'التعريفة الأساسية',
    deliveryFee: 'رسوم التوصيل',
    serviceFee: 'رسوم الخدمة',
    discount: 'الخصم',
    total: 'الإجمالي',
    paymentMethod: 'طريقة الدفع',
    cash: 'كاش عند الاستلام',
    card: 'بطاقة بنكية (تجريبي)',
    wallet: 'محفظة هاتلي',
    walletBalance: 'رصيد المحفظة',
    topUp: 'شحن المحفظة',
    promoCode: 'كود الخصم',
    apply: 'تطبيق',
    rating: 'التقييم',
    activeOrder: 'الطلب النشط حالياً',
    orderHistory: 'سجل الطلبات',
    loading: 'جاري التحميل...',

    // Statuses
    PENDING_DRIVER: 'جاري البحث عن كابتن قريب...',
    STORE_PENDING: 'في انتظار موافقة المطعم...',
    STORE_PREPARING: 'المطبخ يقوم بتجهيز وجبتك...',
    STORE_READY: 'الطلب جاهز، بانتظار استلام الكابتن...',
    DRIVER_ASSIGNED: 'تم تعيين كابتن للطلب',
    DRIVER_ARRIVED: 'وصل الكابتن إلى مكان الاستلام',
    IN_PROGRESS: 'في الطريق إلى وجهة التوصيل',
    COMPLETED: 'تم التوصيل بنجاح',
    CANCELLED: 'تم إلغاء الطلب',
  },
  en: {
    // Brand
    brandName: 'Hatly',
    brandTagline: 'Otlob Hatly, Haygelak Waqty • All delivery services in one place',
    egyptMarket: 'Egypt',
    currency: 'EGP',

    // Roles & Portal
    roleCustomer: 'Customer App',
    roleDriver: 'Courier & Driver App',
    roleStore: 'Store & Restaurant Portal',
    roleAdmin: 'Admin Command Center',

    // Services
    serviceFood: 'Hatly Food',
    serviceFoodDesc: 'Delicious food from top local and international restaurants',
    serviceExpress: 'Hatly Express',
    serviceExpressDesc: 'On-demand parcel, documents & gift nationwide courier',
    serviceMarket: 'Hatly Market',
    serviceMarketDesc: 'Groceries, dairy, and fresh produce delivered in 30 mins',
    serviceShopping: 'Hatly Shopping',
    serviceShoppingDesc: 'Pharmacies and retail items from your favorite shops',

    // Actions & Common
    login: 'Login',
    register: 'Create Account',
    logout: 'Logout',
    bookNow: 'Book Now',
    confirmOrder: 'Confirm Order',
    cancel: 'Cancel',
    save: 'Save',
    search: 'Search...',
    pickupLocation: 'Pickup Location',
    dropoffLocation: 'Drop-off Destination',
    distance: 'Distance',
    duration: 'Estimated Time',
    baseFare: 'Base Fare',
    deliveryFee: 'Delivery Fee',
    serviceFee: 'Service Fee',
    discount: 'Discount',
    total: 'Total',
    paymentMethod: 'Payment Method',
    cash: 'Cash on Delivery',
    card: 'Credit Card (Sandbox)',
    wallet: 'Hatly Wallet',
    walletBalance: 'Wallet Balance',
    topUp: 'Top-up Wallet',
    promoCode: 'Promo Code',
    apply: 'Apply',
    rating: 'Rating',
    activeOrder: 'Active Order',
    orderHistory: 'Order History',
    loading: 'Loading...',

    // Statuses
    PENDING_DRIVER: 'Searching for nearby driver...',
    STORE_PENDING: 'Awaiting restaurant confirmation...',
    STORE_PREPARING: 'Kitchen is preparing your order...',
    STORE_READY: 'Order ready for driver pickup...',
    DRIVER_ASSIGNED: 'Driver assigned to order',
    DRIVER_ARRIVED: 'Driver arrived at pickup',
    IN_PROGRESS: 'On the way to destination',
    COMPLETED: 'Delivered / Trip Completed',
    CANCELLED: 'Order Cancelled',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('hatly_lang') as Language) || 'ar';
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('hatly_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
