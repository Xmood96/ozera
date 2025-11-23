import { useEffect, useState } from "react";
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

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [phoneFilter, setPhoneFilter] = useState<string>("");
  const [addressFilter, setAddressFilter] = useState<string>("");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: "pending" | "completed" | "cancelled") => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <div className="badge badge-warning">قيد الانتظار</div>;
      case "completed":
        return <div className="badge badge-success">مكتمل</div>;
      case "cancelled":
        return <div className="badge badge-error">ملغى</div>;
      default:
        return <div className="badge">غير معروف</div>;
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

  return (
    <div className="orders-tracking">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary">تتبع الطلبات</h2>
        <p className="text-base-content opacity-75 mt-2">
          إجمالي الطلبات: <span className="font-bold">{orders.length}</span>
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="alert alert-info">
          <span>لا توجد طلبات حالياً</span>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-base-100 rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">
                    الطلب #{order.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <p className="text-sm opacity-75 mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(order.status)}
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsModalOpen(true);
                    }}
                    className="link link-primary text-sm"
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>

              <div className="divider my-3" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs opacity-75">الإجمالي</p>
                  <p className="text-lg font-bold text-primary">
                    {order.totalAmount} ج.م
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-75">عدد المنتجات</p>
                  <p className="text-lg font-bold">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-75">الهاتف</p>
                  <p className="text-lg font-bold">
                    {order.customerPhone || "لم يتم إدخاله"}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-75">عدد الأصناف</p>
                  <p className="text-lg font-bold">{order.items.length}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedOrder && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">
              تفاصيل الطلب #{selectedOrder.id.slice(0, 8).toUpperCase()}
            </h3>

            {/* Order Info */}
            <div className="mb-4 p-4 bg-base-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm opacity-75">رقم الهاتف</p>
                  <p className="font-semibold">{selectedOrder.customerPhone || "لم يتم إدخاله"}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">التاريخ</p>
                  <p className="font-semibold">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">المجموع</p>
                  <p className="font-bold text-primary text-lg">
                    {selectedOrder.totalAmount} ج.م
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-75">الحالة</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mb-4">
              <h4 className="font-bold mb-3">المنتجات</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-base-200 p-3 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs opacity-75">{item.price} ج.م × {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold">{item.price * item.quantity} ج.م</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                ��حديث الحالة
              </label>
              <select
                value={selectedOrder.status}
                onChange={(e) =>
                  handleStatusChange(
                    selectedOrder.id,
                    e.target.value as "pending" | "completed" | "cancelled"
                  )
                }
                className="select select-bordered w-full"
              >
                <option value="pending">قيد الانتظار</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغى</option>
              </select>
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedOrder(null);
                }}
                className="btn btn-outline"
              >
                إغلاق
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              setIsModalOpen(false);
              setSelectedOrder(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
