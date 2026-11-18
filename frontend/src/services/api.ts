const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:5000/api/v1`;
  }
  return 'http://localhost:5000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export const getAuthToken = (): string | null => {
  return localStorage.getItem('hatly_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('hatly_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('hatly_token');
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// Concrete API helpers
export const api = {
  // Auth
  requestOtp: (phone: string) =>
    apiRequest('/auth/otp/request', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, code: string) =>
    apiRequest('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone, code }) }),
  login: (identifier: string, password: string, rememberMe: boolean = false) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password, rememberMe }) }),
  register: (payload: any) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (identifier: string) =>
    apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ identifier }) }),
  resetPassword: (payload: { identifier: string; resetCode: string; newPassword: string; confirmPassword?: string }) =>
    apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/auth/me'),

  // Orders & Pricing
  estimateFare: (payload: any) =>
    apiRequest('/orders/estimate', { method: 'POST', body: JSON.stringify(payload) }),
  createOrder: (payload: any) =>
    apiRequest('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: (id: string) => apiRequest(`/orders/${id}`),
  getMyOrders: () => apiRequest('/orders/my'),
  cancelOrder: (id: string, reason?: string) =>
    apiRequest(`/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),

  // Driver
  toggleDriverOnline: () => apiRequest('/driver/toggle-online', { method: 'POST' }),
  updateDriverLocation: (lat: number, lng: number) =>
    apiRequest('/driver/location', { method: 'POST', body: JSON.stringify({ lat, lng }) }),
  getDriverRadar: () => apiRequest('/driver/radar'),
  acceptOrder: (orderId: string) =>
    apiRequest('/driver/accept-order', { method: 'POST', body: JSON.stringify({ orderId }) }),
  updateTripStatus: (orderId: string, status: string) =>
    apiRequest('/driver/trip-status', { method: 'POST', body: JSON.stringify({ orderId, status }) }),
  getDriverStats: () => apiRequest('/driver/stats'),
  withdrawEarnings: (amount: number, method: string, accountDetails: string) =>
    apiRequest('/driver/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, method, accountDetails }),
    }),

  // Stores
  getStores: (type?: string, search?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (search) params.append('search', search);
    return apiRequest(`/stores?${params.toString()}`);
  },
  getStore: (id: string) => apiRequest(`/stores/${id}`),
  getMyStore: () => apiRequest('/store/my'),
  toggleStoreOpen: () => apiRequest('/store/toggle-open', { method: 'POST' }),
  addCategory: (nameAr: string, nameEn: string) =>
    apiRequest('/store/category', { method: 'POST', body: JSON.stringify({ nameAr, nameEn }) }),
  addProduct: (product: any) =>
    apiRequest('/store/product', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id: string, product: any) =>
    apiRequest(`/store/product/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id: string) =>
    apiRequest(`/store/product/${id}`, { method: 'DELETE' }),
  updateStoreOrderStatus: (orderId: string, status: string) =>
    apiRequest('/store/order-status', { method: 'POST', body: JSON.stringify({ orderId, status }) }),

  // Wallet
  getWallet: () => apiRequest('/wallet'),
  topUpWallet: (amount: number, paymentMethod?: string) =>
    apiRequest('/wallet/top-up', { method: 'POST', body: JSON.stringify({ amount, paymentMethod }) }),

  // Reviews
  createReview: (payload: { orderId: string; targetType: string; targetId: string; rating: number; comment?: string }) =>
    apiRequest('/reviews', { method: 'POST', body: JSON.stringify(payload) }),

  // Admin
  getAdminAnalytics: () => apiRequest('/admin/analytics'),
  getAdminOrders: (status?: string, serviceType?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (serviceType) params.append('serviceType', serviceType);
    return apiRequest(`/admin/orders?${params.toString()}`);
  },
  getAdminDrivers: (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return apiRequest(`/admin/drivers?${params.toString()}`);
  },
  verifyDriver: (id: string, verificationStatus: string) =>
    apiRequest(`/admin/drivers/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verificationStatus }),
    }),
  getAdminUsers: () => apiRequest('/admin/users'),
  toggleBlockUser: (id: string) => apiRequest(`/admin/users/${id}/block`, { method: 'PATCH' }),
  getPricingRules: () => apiRequest('/admin/pricing-rules'),
  updatePricingRule: (id: string, rule: any) =>
    apiRequest(`/admin/pricing-rules/${id}`, { method: 'PUT', body: JSON.stringify(rule) }),
  getPromoCodes: () => apiRequest('/admin/promos'),
  createPromoCode: (promo: any) =>
    apiRequest('/admin/promos', { method: 'POST', body: JSON.stringify(promo) }),
  getAdminZones: () => apiRequest('/admin/zones'),
  toggleAdminZone: (id: string) => apiRequest(`/admin/zones/${id}/toggle`, { method: 'POST' }),
  getAdminApplications: () => apiRequest('/admin/applications'),
  reviewAdminApplication: (payload: { type: string; id: string; status: string; rejectionReason?: string }) =>
    apiRequest('/admin/applications/review', { method: 'POST', body: JSON.stringify(payload) }),
  updateAdminOrderStatus: (id: string, status: string, cancellationReason?: string) =>
    apiRequest(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, cancellationReason }) }),
  deletePromoCode: (id: string) => apiRequest(`/admin/promos/${id}`, { method: 'DELETE' }),
  getAdminStores: () => apiRequest('/admin/stores'),
  toggleAdminStore: (id: string) => apiRequest(`/admin/stores/${id}/toggle`, { method: 'POST' }),
  getAdminSupportTickets: () => apiRequest('/admin/support-tickets'),
  resolveAdminSupportTicket: (id: string, status?: string, adminNotes?: string) =>
    apiRequest(`/admin/support-tickets/${id}/resolve`, { method: 'PUT', body: JSON.stringify({ status, adminNotes }) }),
};
