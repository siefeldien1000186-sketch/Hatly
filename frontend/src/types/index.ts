export type Role = 'CUSTOMER' | 'DRIVER' | 'STORE_OWNER' | 'ADMIN';

export type ServiceType = 'FOOD' | 'EXPRESS' | 'MARKET' | 'SHOPPING';

export type OrderStatus =
  | 'PENDING_DRIVER'
  | 'STORE_PENDING'
  | 'STORE_PREPARING'
  | 'STORE_READY'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  avatar?: string;
  language: string;
  walletBalance: number;
  isBlocked?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  driverProfile?: Driver;
  storeProfile?: Store;
}

export interface Driver {
  id: string;
  userId: string;
  user?: User;
  vehicleType: 'CAR' | 'SCOOTER' | 'VAN';
  vehicleModel: string;
  vehiclePlate: string;
  vehicleYear: number;
  vehicleColor: string;
  licenseNumber: string;
  nationalId: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  walletBalance?: number;
  isOnline: boolean;
  currentLat?: number;
  currentLng?: number;
  rating: number;
  totalTrips: number;
  totalEarnings: number;
  commissionOwed: number;
  drivingLicenseDoc?: string;
  vehicleRegDoc?: string;
  criminalRecordDoc?: string;
}

export interface Store {
  id: string;
  ownerId: string;
  businessRole?: 'RESTAURANT' | 'BUSINESS_OWNER';
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  ownerName?: string;
  type: 'RESTAURANT' | 'SUPERMARKET' | 'PHARMACY' | 'SHOP';
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  logo?: string;
  coverImage?: string;
  address: string;
  city?: string;
  workingHours?: string;
  latitude: number;
  longitude: number;
  phone: string;
  rating: number;
  deliveryTimeMin: number;
  deliveryFee: number;
  minimumOrder: number;
  isOpen: boolean;
  commissionRate: number;
  categories?: Category[];
}

export interface Category {
  id: string;
  storeId: string;
  nameAr: string;
  nameEn: string;
  sortOrder: number;
  products?: Product[];
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  isAvailable: boolean;
}

export interface OrderItem {
  id?: string;
  productId: string;
  nameAr: string;
  nameEn: string;
  price: number;
  quantity: number;
  options?: any;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: User;
  driverId?: string;
  driver?: Driver;
  storeId?: string;
  store?: Store;
  serviceType: ServiceType;
  status: OrderStatus;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm: number;
  durationMinutes: number;
  packageRecipient?: string;
  packagePhone?: string;
  packageNote?: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  driverEarnings: number;
  platformFee: number;
  paymentMethod: 'CASH' | 'CARD' | 'WALLET';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  promoCodeApplied?: string;
  customerNotes?: string;
  cancellationReason?: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PricingRule {
  id: string;
  serviceType: string;
  nameAr: string;
  nameEn: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  serviceFee: number;
  surgeMultiplier: number;
  driverCommissionPercent: number;
  isActive: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minOrderAmount: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  reason: string;
  referenceId?: string;
  createdAt: string;
}
