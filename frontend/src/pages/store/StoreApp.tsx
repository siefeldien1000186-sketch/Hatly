import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Store as StoreType, Order, Product, Category } from '../../types';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import {
  Store,
  Power,
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';

export const StoreApp: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const socket = getSocket();

  const [store, setStore] = useState<StoreType | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'MENU' | 'EARNINGS'>('ORDERS');

  // New Category / Product Form state
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdNameEn, setNewProdNameEn] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDescAr, setNewProdDescAr] = useState('');
  const [newProdImage, setNewProdImage] = useState('');

  // 1. Fetch Store Profile & Orders
  const fetchMyStore = async () => {
    try {
      const res = await api.getMyStore();
      if (res.success && res.store) {
        setStore(res.store);
        setOrders(res.orders || []);
        if (res.store.categories?.[0]) {
          setSelectedCatId(res.store.categories[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching store:', err);
    }
  };

  useEffect(() => {
    fetchMyStore();
  }, []);

  // 2. Realtime listener for incoming store orders
  useEffect(() => {
    if (!store?.id) return;
    socket.emit('join:store', store.id);

    const handleNewOrder = (order: Order) => {
      setOrders((prev) => [order, ...prev]);
    };

    const handleStatusUpdate = (updatedOrder: Order) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    };

    socket.on('store:new_order', handleNewOrder);
    socket.on('order:status_update', handleStatusUpdate);

    return () => {
      socket.off('store:new_order', handleNewOrder);
      socket.off('order:status_update', handleStatusUpdate);
    };
  }, [store?.id]);

  // 3. Toggle Open/Close Store
  const handleToggleOpen = async () => {
    try {
      const res = await api.toggleStoreOpen();
      if (res.success) {
        setStore((prev: any) => ({ ...prev, isOpen: res.isOpen }));
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  // 4. Update Kitchen / Store Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await api.updateStoreOrderStatus(orderId, status);
      if (res.success && res.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? res.order : o))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Error updating order status');
    }
  };

  // 5. Toggle Product Availability
  const handleToggleProduct = async (product: Product) => {
    try {
      const res = await api.updateProduct(product.id, {
        isAvailable: !product.isAvailable,
      });
      if (res.success) {
        fetchMyStore();
      }
    } catch (err: any) {
      alert(err.message || 'Error updating product');
    }
  };

  // 6. Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الصنف من القائمة؟')) return;
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        fetchMyStore();
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting product');
    }
  };

  // 7. Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !newProdNameAr || !newProdPrice) return;
    try {
      const res = await api.addProduct({
        categoryId: selectedCatId,
        nameAr: newProdNameAr,
        nameEn: newProdNameEn || newProdNameAr,
        descriptionAr: newProdDescAr,
        descriptionEn: newProdDescAr,
        price: parseFloat(newProdPrice),
        image: newProdImage || undefined,
      });

      if (res.success) {
        setShowProductModal(false);
        setNewProdNameAr('');
        setNewProdNameEn('');
        setNewProdPrice('');
        setNewProdDescAr('');
        setNewProdImage('');
        fetchMyStore();
      }
    } catch (err: any) {
      alert(err.message || 'Error adding product');
    }
  };

  // Financial calculations
  const totalSales = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.subtotal, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Store Header */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <img
            src={store?.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120'}
            alt="Logo"
            className="w-14 h-14 rounded-2xl object-cover ring-4 ring-red-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-lg text-gray-900">
                {language === 'ar' ? store?.nameAr : store?.nameEn}
              </h2>
              <span className="text-xs bg-red-100 text-[#E70209] font-black px-2 py-0.5 rounded-full">
                {store?.type}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">{store?.address}</p>
          </div>
        </div>

        {/* Operating Status Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleToggleOpen}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
              store?.isOpen
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-gray-800 hover:bg-black text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{store?.isOpen ? 'المتجر يستقبل طلبات (Open)' : 'المتجر مغلق حالياً (Closed)'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'ORDERS'
              ? 'bg-[#E70209] text-white shadow-md shadow-red-600/20'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>الطلبات الواردة للمطبخ</span>
          {orders.filter((o) => ['STORE_PENDING', 'STORE_PREPARING'].includes(o.status)).length > 0 && (
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('MENU')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'MENU'
              ? 'bg-[#151515] text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>إدارة القائمة والأصناف</span>
        </button>

        <button
          onClick={() => setActiveTab('EARNINGS')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'EARNINGS'
              ? 'bg-[#151515] text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>المبيعات والأرباح</span>
        </button>
      </div>

      {/* TAB 1: INCOMING ORDERS */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-gray-900">
              طابور تحضير الطلبات في المطبخ
            </h3>
            <span className="text-xs text-gray-500 font-semibold">
              إجمالي {orders.length} طلب
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-400 text-xs">
              لا توجد طلبات واردة حالياً للمطعم
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => {
                const isPending = order.status === 'STORE_PENDING';
                const isPreparing = order.status === 'STORE_PREPARING';
                const isReady = order.status === 'STORE_READY';
                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-3xl border p-5 shadow-sm space-y-4 transition ${
                      isPending
                        ? 'border-red-400 ring-2 ring-red-400/20'
                        : isPreparing
                        ? 'border-blue-400'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <span className="font-black text-sm text-gray-900">
                          #{order.orderNumber}
                        </span>
                        <p className="text-[11px] text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          isPending
                            ? 'bg-amber-100 text-amber-900 animate-pulse'
                            : isPreparing
                            ? 'bg-blue-100 text-blue-900'
                            : isReady
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="space-y-1.5 text-xs bg-gray-50 p-3 rounded-2xl">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between font-semibold text-gray-800">
                          <span>
                            {item.quantity}x {item.nameAr}
                          </span>
                          <span className="font-bold">{(item.price * item.quantity).toFixed(2)} ج.م</span>
                        </div>
                      ))}
                    </div>

                    {/* Customer Notes */}
                    {order.customerNotes && (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900">
                        <span className="font-bold">ملاحظة العميل:</span> {order.customerNotes}
                      </div>
                    )}

                    {/* Action Flow */}
                    <div className="pt-2">
                      {isPending && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'STORE_PREPARING')}
                          className="w-full py-2.5 bg-[#E70209] hover:bg-[#CC0006] text-white font-black rounded-xl text-xs shadow-md shadow-red-600/20 transition"
                        >
                          قبول الطلب والبدء في التجهيز
                        </button>
                      )}

                      {isPreparing && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'STORE_READY')}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-600/20 transition"
                        >
                          الطلب جاهز للتسليم للكابتن (Ready)
                        </button>
                      )}

                      {isReady && (
                        <div className="text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl">
                          في انتظار وصول الكابتن للاستلام...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MENU & PRODUCTS */}
      {activeTab === 'MENU' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-gray-900">أصناف وقائمة المتجر</h3>
            <button
              onClick={() => setShowProductModal(true)}
              className="px-4 py-2 bg-[#E70209] hover:bg-[#CC0006] text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 transition shadow-md shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف جديد للقائمة</span>
            </button>
          </div>

          {store?.categories?.map((cat) => (
            <div key={cat.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h4 className="font-black text-sm text-gray-800 border-b border-gray-100 pb-2">
                {cat.nameAr} ({cat.products?.length || 0} صنف)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.products?.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                        alt={prod.nameAr}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h5 className="font-bold text-gray-900">{prod.nameAr}</h5>
                        <p className="font-black text-[#E70209]">{prod.price} {t('currency')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleProduct(prod)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition ${
                          prod.isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {prod.isAvailable ? 'متاح' : 'غير متوفر'}
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: EARNINGS & REVENUE */}
      {activeTab === 'EARNINGS' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">إجمالي مبيعات المتجر</p>
            <p className="text-3xl font-black text-gray-900 mt-2">
              {totalSales.toFixed(2)}{' '}
              <span className="text-sm text-[#E70209] font-bold">{t('currency')}</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">نسبة عمولة هاتلي</p>
            <p className="text-3xl font-black text-emerald-600 mt-2">{store?.commissionRate || 15}%</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">الطلبات المكتملة</p>
            <p className="text-3xl font-black text-gray-900 mt-2">
              {orders.filter((o) => o.status === 'COMPLETED').length}
            </p>
          </div>
        </div>
      )}

      {/* Product Add Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddProduct}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <h3 className="font-black text-lg text-gray-900">إضافة صنف جديد للقائمة</h3>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">القسم</label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              >
                {store?.categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">اسم الوجبة / الصنف بالعربي</label>
              <input
                type="text"
                required
                value={newProdNameAr}
                onChange={(e) => setNewProdNameAr(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">السعر (ج.م)</label>
              <input
                type="number"
                required
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">الوصف والمكونات</label>
              <input
                type="text"
                value={newProdDescAr}
                onChange={(e) => setNewProdDescAr(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">رابط صورة الوجبة (اختياري)</label>
              <input
                type="url"
                value={newProdImage}
                onChange={(e) => setNewProdImage(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="py-2.5 bg-gray-100 text-gray-700 font-bold rounded-2xl text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="py-2.5 bg-[#E70209] text-white font-bold rounded-2xl text-xs shadow-md shadow-red-600/20"
              >
                حفظ الصنف
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
