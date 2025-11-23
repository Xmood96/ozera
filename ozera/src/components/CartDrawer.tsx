import { useState } from "react";
import type { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (phone: string, deliveryAddress: string) => void;
}

export default function CartDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const totalPrice = items.reduce((sum, item) => sum + item.total, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (phone.trim() && deliveryAddress.trim()) {
      onCheckout(phone, deliveryAddress);
      setIsCheckoutMode(false);
      setPhone("");
      setDeliveryAddress("");
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 backdrop-blur-xl  bg-opacity-50 z-30 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`cart-drawer fixed right-0 top-0 h-screen w-full max-w-md bg-base-100 shadow-2xl z-40 transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="cart-header sticky top-0 bg-primary text-primary-content p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">السلة ({itemCount})</h2>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost text-primary-content"
            aria-label="إغلاق السلة"
          >
            ✕
          </button>
        </div>

        {/* Items or Empty State */}
        {items.length === 0 ? (
          <div className="cart-empty flex-1 flex items-center justify-center text-center p-4">
            <div>
              <p className="text-2xl mb-2">🛒</p>
              <p className="text-base-content opacity-75">سلتك فارغة</p>
              <p className="text-sm text-base-content opacity-50 mt-1">
                أضف المنتجات لبدء التسوق
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="cart-items flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="cart-item bg-base-200 rounded-xl p-3 flex gap-3"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <h4 className="font-semibold text-sm line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-primary font-bold mt-1">
                      {item.price} ج.م
                    </p>

                    <div className="quantity-controls flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            item.productId,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="btn btn-xs btn-outline"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.productId, item.quantity + 1)
                        }
                        className="btn btn-xs btn-outline"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.productId)}
                    className="btn btn-sm btn-ghost text-error"
                    aria-label={`حذف ${item.name}`}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="divider my-0" />

            {/* Total and Checkout */}
            {!isCheckoutMode ? (
              <>
                <div className="cart-total p-4 space-y-3">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>الإجمالي:</span>
                    <span className="text-primary text-2xl">
                      {totalPrice.toFixed(2)} ج.م
                    </span>
                  </div>

                  <button
                    onClick={() => setIsCheckoutMode(true)}
                    className="btn btn-primary w-full rounded-lg"
                  >
                    ��لدفع والتأكيد
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="checkout-form p-4 space-y-3">
                  <div className="form-group">
                    <label className="block text-sm font-semibold mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01234567890"
                      className="input input-bordered w-full rounded-lg"
                      dir="ltr"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-semibold mb-2">
                      عنوان التوصيل
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="أدخل عنوانك الكامل للتوصيل"
                      className="textarea textarea-bordered w-full rounded-lg"
                      dir="rtl"
                      rows={3}
                    />
                  </div>

                  <div className="checkout-summary bg-base-200 rounded-lg p-3">
                    <p className="text-sm opacity-75 mb-1">الإجمالي:</p>
                    <p className="text-2xl font-bold text-primary">
                      {totalPrice.toFixed(2)} ج.م
                    </p>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={!phone.trim() || !deliveryAddress.trim()}
                    className="btn btn-primary w-full rounded-lg"
                  >
                    تأكيد الطلب
                  </button>

                  <button
                    onClick={() => setIsCheckoutMode(false)}
                    className="btn btn-outline w-full rounded-lg"
                  >
                    العودة
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
