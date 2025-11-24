import { useState, useRef, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: any;
  status: "pending" | "paid" | "in_delivery" | "completed" | "cancelled";
  customerPhone?: string;
  deliveryAddress?: string;
}

export default function OrdersTracking() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedPhone, setEditedPhone] = useState("");
  const [editedAddress, setEditedAddress] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [phoneFilter, setPhoneFilter] = useState<string>("");
  const [addressFilter, setAddressFilter] = useState<string>("");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadOrders();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadOrders = async () => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      if (!isMountedRef.current) return;

      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error("Error loading orders:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: "pending" | "paid" | "in_delivery" | "completed" | "cancelled") => {
    if (!isMountedRef.current) return;

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      if (isMountedRef.current) {
        await loadOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Error updating order status:", error);
      }
    }
  };

  const handleEditOrder = () => {
    if (selectedOrder) {
      setEditedPhone(selectedOrder.customerPhone || "");
      setEditedAddress(selectedOrder.deliveryAddress || "");
      setIsEditMode(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder || !isMountedRef.current) return;

    setIsUpdating(true);
    try {
      const orderRef = doc(db, "orders", selectedOrder.id);
      await updateDoc(orderRef, {
        customerPhone: editedPhone,
        deliveryAddress: editedAddress,
      });

      if (isMountedRef.current) {
        await loadOrders();
        setSelectedOrder(null);
        setIsModalOpen(false);
        setIsEditMode(false);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Error updating order:", error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsUpdating(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <div className="badge badge-warning gap-2 px-3 py-2">⏳ قيد الانتظار</div>;
      case "paid":
        return <div className="badge badge-info gap-2 px-3 py-2">✓ تم الدفع</div>;
      case "in_delivery":
        return <div className="badge badge-accent gap-2 px-3 py-2">🚚 قيد التوصيل</div>;
      case "completed":
        return <div className="badge badge-success gap-2 px-3 py-2">✓✓ مكتمل</div>;
      case "cancelled":
        return <div className="badge badge-error gap-2 px-3 py-2">✕ ملغى</div>;
      default:
        return <div className="badge gap-2 px-3 py-2">غير معروف</div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-l-warning";
      case "paid":
        return "border-l-info";
      case "in_delivery":
        return "border-l-accent";
      case "completed":
        return "border-l-success";
      case "cancelled":
        return "border-l-error";
      default:
        return "border-l-base-300";
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "غير معروف";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFilteredOrders = () => {
    let filtered = [...orders];

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (phoneFilter.trim()) {
      filtered = filtered.filter((order) =>
        order.customerPhone?.includes(phoneFilter.trim())
      );
    }

    if (addressFilter.trim()) {
      filtered = filtered.filter((order) =>
        order.deliveryAddress?.toLowerCase().includes(addressFilter.toLowerCase())
      );
    }

    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((order) => {
        const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        return orderDate >= fromDate;
      });
    }

    if (dateToFilter) {
      const toDate = new Date(dateToFilter);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((order) => {
        const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        return orderDate <= toDate;
      });
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    paid: orders.filter((o) => o.status === "paid").length,
    inDelivery: orders.filter((o) => o.status === "in_delivery").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="orders-tracking">
      <div className="mb-8">
        <h2 className="text-4xl flex gap-4 font-bold text-accent mb-2">
          <span className="flex text-primary">📋</span>
          <span>تتبع الطلبات</span>
        </h2>
        <p className="text-base-content opacity-60">إدارة شاملة لجميع طلبات العملاء</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="stat-card bg-gradient-to-br from-secondary to-primary-focus rounded-lg p-4 text-primary-content text-center">
          <p className="text-sm opacity-80">إجمالي</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="stat-card bg-gradient-to-br from-warning to-orange-500 rounded-lg p-4 text-white text-center">
          <p className="text-sm opacity-80">قيد الانتظار</p>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </div>
        <div className="stat-card bg-gradient-to-br from-info to-blue-500 rounded-lg p-4 text-white text-center">
          <p className="text-sm opacity-80">تم الدفع</p>
          <p className="text-3xl font-bold">{stats.paid}</p>
        </div>
        <div className="stat-card bg-gradient-to-br from-accent to-pink-500 rounded-lg p-4 text-white text-center">
          <p className="text-sm opacity-80">قيد التوصيل</p>
          <p className="text-3xl font-bold">{stats.inDelivery}</p>
        </div>
        <div className="stat-card bg-gradient-to-br from-success to-green-500 rounded-lg p-4 text-white text-center">
          <p className="text-sm opacity-80">مكتمل</p>
          <p className="text-3xl font-bold">{stats.completed}</p>
        </div>
        <div className="stat-card bg-gradient-to-br from-error to-red-600 rounded-lg p-4 text-white text-center">
          <p className="text-sm opacity-80">ملغى</p>
          <p className="text-3xl font-bold">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section bg-base-200 rounded-xl p-6 mb-8 shadow-sm">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          🔍 البحث والفلترة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="filter-group">
            <label className="label-text block text-sm font-semibold mb-2">الحالة</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange();
              }}
              className="select select-bordered w-full select-sm"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="paid">تم الدفع</option>
              <option value="in_delivery">قيد التوصيل</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغى</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="label-text block text-sm font-semibold mb-2">رقم الهاتف</label>
            <input
              type="text"
              value={phoneFilter}
              onChange={(e) => {
                setPhoneFilter(e.target.value);
                handleFilterChange();
              }}
              placeholder="ابحث برقم هاتف"
              className="input input-bordered w-full input-sm"
              dir="ltr"
            />
          </div>

          <div className="filter-group">
            <label className="label-text block text-sm font-semibold mb-2">من التاريخ</label>
            <input
              type="date"
              value={dateFromFilter}
              onChange={(e) => {
                setDateFromFilter(e.target.value);
                handleFilterChange();
              }}
              className="input input-bordered w-full input-sm"
            />
          </div>

          <div className="filter-group">
            <label className="label-text block text-sm font-semibold mb-2">إلى التاريخ</label>
            <input
              type="date"
              value={dateToFilter}
              onChange={(e) => {
                setDateToFilter(e.target.value);
                handleFilterChange();
              }}
              className="input input-bordered w-full input-sm"
            />
          </div>

          <div className="filter-group">
            <label className="label-text block text-sm font-semibold mb-2">عنوان التوصيل</label>
            <input
              type="text"
              value={addressFilter}
              onChange={(e) => {
                setAddressFilter(e.target.value);
                handleFilterChange();
              }}
              placeholder="ابحث بالعنوان"
              className="input input-bordered w-full input-sm"
              dir="rtl"
            />
          </div>
        </div>

        {(statusFilter !== "all" || phoneFilter || addressFilter || dateFromFilter || dateToFilter) && (
          <button
            onClick={() => {
              setStatusFilter("all");
              setPhoneFilter("");
              setAddressFilter("");
              setDateFromFilter("");
              setDateToFilter("");
              setCurrentPage(1);
            }}
            className="btn btn-sm btn-outline mt-4"
          >
            ✕ إعادة تعيين الفلاتر
          </button>
        )}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="mt-4 text-base-content opacity-60">جاري تحميل الطلبات...</p>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="alert alert-info bg-blue-50 border-blue-200 text-blue-900">
          <span>
            {orders.length === 0 ? "🎯 لا توجد طلبات حالياً" : "🔍 لا توجد طلبات تطابق معايير البحث"}
          </span>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedOrders.map((order) => (
              <div
                key={order.id}
                className={`order-card bg-base-100 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-r-4 ${getStatusColor(order.status)}`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-primary">
                        الطلب #{order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-base-content opacity-60">
                      📅 {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsEditMode(false);
                      setIsModalOpen(true);
                    }}
                    className="btn btn-accent  btn-sm rounded-lg"
                  >
                     عرض التفاصيل
                  </button>
                </div>

                <div className="divider my-3" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="info-item">
                    <p className="text-xs text-base-content opacity-60 mb-1">المجموع</p>
                    <p className="text-lg font-bold text-primary">
                      {order.totalAmount} ج.م
                    </p>
                  </div>
                  <div className="info-item">
                    <p className="text-xs text-base-content opacity-60 mb-1">عدد المنتجات</p>
                    <p className="text-lg font-bold">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} 🛍️
                    </p>
                  </div>
                  <div className="info-item">
                    <p className="text-xs text-base-content opacity-60 mb-1">رقم الهاتف</p>
                    <p className="text-lg font-bold" dir="ltr">
                      {order.customerPhone || "—"}
                    </p>
                  </div>
                  <div className="info-item">
                    <p className="text-xs text-base-content opacity-60 mb-1">عدد الأصناف</p>
                    <p className="text-lg font-bold">{order.items.length}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn btn-sm btn-outline"
              >
                ← السابق
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`btn btn-sm ${
                      currentPage === page ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-sm btn-outline"
              >
                التالي →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {isModalOpen && selectedOrder && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <div className="sticky top-0 bg-base-100 pb-4 border-b border-base-300">
              <h3 className="font-bold text-2xl mb-1">
                📦 تفاصيل الطلب #{selectedOrder.id.slice(0, 8).toUpperCase()}
              </h3>
              <p className="text-sm text-base-content opacity-60">{formatDate(selectedOrder.createdAt)}</p>
            </div>

            {!isEditMode ? (
              <>
                {/* Order Info Display */}
                <div className="my-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="info-box bg-base-200 rounded-lg p-4">
                      <p className="text-sm opacity-70 mb-1">�� رقم الهاتف</p>
                      <p className="font-semibold text-lg" dir="ltr">{selectedOrder.customerPhone || "لم يتم إدخاله"}</p>
                    </div>
                    <div className="info-box bg-base-200 rounded-lg p-4">
                      <p className="text-sm opacity-70 mb-1">💰 المجموع</p>
                      <p className="font-semibold text-lg text-primary">{selectedOrder.totalAmount} ج.م</p>
                    </div>
                  </div>

                  <div className="info-box bg-base-200 rounded-lg p-4">
                    <p className="text-sm opacity-70 mb-1">📍 عنوان التوصيل</p>
                    <p className="font-semibold text-lg leading-relaxed">{selectedOrder.deliveryAddress || "لم يتم إدخاله"}</p>
                  </div>

                  <div className="info-box bg-base-200 rounded-lg p-4">
                    <p className="text-sm opacity-70 mb-2">حالة الطلب</p>
                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="my-6">
                  <h4 className="font-bold text-lg mb-4">🛍️ المنتجات</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="product-item bg-base-200 p-4 rounded-lg flex items-center justify-between gap-4 hover:bg-base-300 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm opacity-70">
                              {item.price} ج.م × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{item.price * item.quantity} ج.م</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div className="my-6">
                  <label className="block text-sm font-bold mb-3">🔄 تحديث حالة الطلب</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedOrder.id,
                        e.target.value as "pending" | "paid" | "in_delivery" | "completed" | "cancelled"
                      )
                    }
                    className="select select-bordered w-full select-sm"
                  >
                    <option value="pending">⏳ قيد الانتظار</option>
                    <option value="paid">✓ تم الدفع</option>
                    <option value="in_delivery">🚚 قيد التوصيل</option>
                    <option value="completed">✓✓ مكتمل</option>
                    <option value="cancelled">✕ ملغى</option>
                  </select>
                </div>

                <div className="modal-action gap-2">
                  <button
                    type="button"
                    onClick={handleEditOrder}
                    className="btn btn-secondary rounded-lg"
                  >
                    ✏️ تعديل البيانات
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedOrder(null);
                    }}
                    className="btn btn-outline rounded-lg"
                  >
                    إغلاق
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <div className="my-6 space-y-4">
                  <div className="form-group">
                    <label className="label-text block text-sm font-semibold mb-2">📞 رقم الهاتف</label>
                    <input
                      type="tel"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      className="input input-bordered w-full"
                      dir="ltr"
                    />
                  </div>

                  <div className="form-group">
                    <label className="label-text block text-sm font-semibold mb-2">📍 عنوان التوصيل</label>
                    <textarea
                      value={editedAddress}
                      onChange={(e) => setEditedAddress(e.target.value)}
                      className="textarea textarea-bordered w-full"
                      dir="rtl"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="modal-action gap-2">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                    className="btn btn-primary rounded-lg"
                  >
                    {isUpdating ? (
                      <>
                        <span className="loading loading-spinner loading-sm" />
                        جاري الحفظ...
                      </>
                    ) : (
                      "💾 حفظ التعديلات"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    disabled={isUpdating}
                    className="btn btn-outline rounded-lg"
                  >
                    إلغاء
                  </button>
                </div>
              </>
            )}
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              if (!isEditMode) {
                setIsModalOpen(false);
                setSelectedOrder(null);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
