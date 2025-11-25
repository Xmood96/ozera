import { useState, useEffect } from "react";
import type { Product, CartItem } from "../types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onRemoveFromCart?: (productId: string) => void;
  cartItems?: CartItem[];
}

export default function ProductCard({ product, onAddToCart, onRemoveFromCart, cartItems = [] }: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Get the current cart item if it exists
  const cartItem = cartItems.find((item) => item.productId === product.id);
  const isInCart = !!cartItem;

  // Update quantity when card is expanded and item is in cart
  useEffect(() => {
    if (isExpanded && cartItem) {
      setQuantity(cartItem.quantity);
    } else if (isExpanded && !cartItem) {
      setQuantity(1);
    }
  }, [isExpanded, cartItem]);

  const handleAddToCart = () => {
    if (isInCart && cartItem) {
      // If item is already in cart, only add the difference
      const quantityToAdd = quantity - cartItem.quantity;
      if (quantityToAdd !== 0) {
        onAddToCart(product, quantityToAdd);
      }
    } else {
      // If new item, add the full quantity
      onAddToCart(product, quantity);
    }
    setQuantity(1);
    setIsExpanded(false);
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <>
      {/* Overlay for expanded state */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div
        className={`product-card bg-base-100 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer ${
          isExpanded
            ? "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 w-11/12 max-w-sm"
            : "relative"
        }`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <div className="product-image relative h-64 bg-base-300 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isExpanded ? "scale-105" : "hover:scale-105"
            }`}
          />
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
                setQuantity(1);
              }}
              className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost text-base-content hover:bg-base-200"
              aria-label="إغلاق"
            >
              ✕
            </button>
          )}
        </div>

        <div className={`product-content transition-all duration-300 ${isExpanded ? "p-6" : "p-5"}`}>
          <h3 className={`product-name font-bold text-base-content mb-2 transition-all duration-300 ${
            isExpanded ? "text-xl line-clamp-none" : "text-lg line-clamp-2"
          }`}>
            {product.name}
          </h3>

          <p className={`product-description text-base-content opacity-75 mb-4 transition-all duration-300 ${
            isExpanded ? "text-sm line-clamp-none" : "text-sm line-clamp-2"
          }`}>
            {product.description}
          </p>

          {isExpanded && (
            <div className="expanded-content space-y-4 animate-fadeIn">
              <div className="divider my-3" />

              <div className="quantity-section">
                <label className="block text-sm font-semibold text-base-content mb-3">
                  الكمية
                </label>
                <div className="quantity-counter flex items-center gap-3 bg-base-200 rounded-xl p-2 w-fit">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      decrementQuantity();
                    }}
                    className="btn btn-ghost btn-sm btn-square text-lg"
                    aria-label="تقليل الكمية"
                  >
                    −
                  </button>
                  <span className="text-lg font-bold text-primary w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      incrementQuantity();
                    }}
                    className="btn btn-ghost btn-sm btn-square text-lg"
                    aria-label="زيادة الكمية"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="product-footer flex justify-between items-center gap-3 mt-4 pt-4 border-t border-base-200">
            <div className="product-price-section flex-1 flex flex-col gap-1.5">
              {product.discount && product.discount > 0 ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg line-through text-slate-400 font-medium">
                      {product.basePrice} ج.م
                    </span>
                    <span className="badge badge-error text-white font-bold px-2 py-1 text-xs">
                      -{product.discount}%
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-success">
                    {product.price} ج.م
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {product.price} ج.م
                </span>
              )}
            </div>
            {isExpanded ? (
              <div className="expanded-actions flex items-center gap-2">
                {isInCart && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromCart?.(product.id);
                      setIsExpanded(false);
                      setQuantity(1);
                    }}
                    className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                    title="إزالة من السلة"
                  >
                    🗑️
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                  className="btn-add-to-cart btn btn-primary btn-sm rounded-lg transition-all duration-300 hover:scale-105"
                  aria-label={isInCart ? `تحديث ${product.name}` : `إضافة ${product.name} إلى السلة`}
                >
                  {isInCart ? "تحديث" : "إضافة"} × {quantity}
                </button>
              </div>
            ) : isInCart ? (
              <div className="in-cart-badge flex items-center gap-2 bg-success/10 text-success px-3 py-1 rounded-lg font-semibold text-sm">
                <span>✓</span>
                <span>{cartItem.quantity}</span>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="btn-add-to-cart btn btn-sm btn-primary rounded-lg transition-all duration-300 hover:scale-105"
                aria-label={`عرض تفاصيل ${product.name}`}
              >
                إضافة
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
