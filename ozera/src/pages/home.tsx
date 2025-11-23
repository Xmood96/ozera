import { useEffect, useState, useRef } from "react";
import type { Product, CartItem, Category } from "../types";
import { getCategories, getProducts, saveOrder, type OrderItem } from "../lib/firestore";
import HeroSection from "../components/HeroSection";
import ProductCard from "../components/ProductCard";
import CategoryChip from "../components/CategoryChip";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";

export default function HomePage() {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const productsRef = useRef<HTMLDivElement>(null);

  // Load categories and products on mount
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        const [categoriesData, productsData] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);
        if (!isMounted) return;
        setCategories(categoriesData);
        setProducts(productsData);
      } catch (error) {
        if (isMounted) {
          console.error("Error loading data:", error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    // Load cart from localStorage
    const savedCart = localStorage.getItem("ozera-cart");
    if (savedCart && isMounted) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("ozera-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Handle category selection
  const handleCategorySelect = async (categoryId: string) => {
    let isMounted = true;
    setSelectedCategory(categoryId);
    setIsLoading(true);

    try {
      const productsData = await getProducts(categoryId === "all" ? undefined : categoryId);
      if (isMounted) {
        setProducts(productsData);
      }
    } catch (error) {
      if (isMounted) {
        console.error("Error loading products:", error);
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }

    // Scroll to products section
    setTimeout(() => {
      if (isMounted) {
        productsRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);

    return () => {
      isMounted = false;
    };
  };

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, total: item.price * (item.quantity + 1) }
            : item
        );
      }

      return [
        ...prevItems,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl,
          total: product.price,
        },
      ];
    });

    // Show brief feedback
    setSuccessMessage(`تمت إضافة ${product.name} إلى السلة`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  // Handle quantity update
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity, total: item.price * quantity }
          : item
      )
    );
  };

  // Handle remove item
  const handleRemoveItem = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    // Get phone from cart drawer (we'll collect it during checkout)
    const phoneInput = document.querySelector(
      ".checkout-form input[type='tel']"
    ) as HTMLInputElement | null;
    const customerPhone = phoneInput?.value || "";

    const totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);

    const orderItems: OrderItem[] = cartItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.imageUrl,
    }));

    try {
      await saveOrder({
        items: orderItems,
        totalAmount,
        createdAt: new Date() as any,
        status: "pending",
        customerPhone,
      });

      // Clear cart and close drawer
      setCartItems([]);
      setIsCartOpen(false);
      localStorage.removeItem("ozera-cart");

      // Show success message
      setSuccessMessage(
        `تم استلام طلبك بنجاح! سيتواصل معك فريقنا على الرقم ${customerPhone}`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error saving order:", error);
      setSuccessMessage("حدث خطأ في حفظ ا��طلب. يرجى المحاولة مجددًا.");
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // Handle WhatsApp button in hero
  const handleWhatsAppClick = () => {
    window.open(
      "https://wa.me/201271772724?text=مرحباً، أود الاستفسار عن منتجات OZERA",
      "_blank"
    );
  };

  // Handle Shop button in hero
  const handleShopClick = () => {
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="ozera-home min-h-screen bg-base-100" dir="rtl" lang="ar">
      {/* Success Toast */}
      {successMessage && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-info bg-primary text-primary-content rounded-xl">
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection
        onShopClick={handleShopClick}
        onWhatsAppClick={handleWhatsAppClick}
      />

      {/* Products Section */}
      <section className="products-section bg-base-100 py-12 lg:py-20">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <div className="section-header text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              منتجاتنا
            </h2>
            <p className="text-base-content opacity-75">
              اختر من مجموعتنا الفاخرة من منتجات العناية بالبشرة الطبيعية
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="categories-filter mb-12">
              <div className="categories-scroll overflow-x-auto pb-2 flex gap-3 justify-center">
                <CategoryChip
                  name="جميع المنتجات"
                  isActive={selectedCategory === "all"}
                  onClick={() => handleCategorySelect("all")}
                />
                {categories.map((category) => (
                  <CategoryChip
                    key={category.id}
                    name={category.name}
                    isActive={selectedCategory === category.id}
                    onClick={() => handleCategorySelect(category.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="products-loading flex items-center justify-center min-h-64">
              <div className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="products-empty text-center py-12">
              <p className="text-2xl mb-2">📦</p>
              <p className="text-lg text-base-content opacity-75">
                لا توجد منتجات في هذه الفئة
              </p>
            </div>
          ) : (
            <div
              ref={productsRef}
              className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cart Button (Floating) */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 left-6 btn btn-circle btn-primary btn-lg shadow-2xl z-20 flex items-center justify-center"
        aria-label={`السلة (${cartItems.reduce((sum, item) => sum + item.quantity, 0)} عنصر)`}
      >
        <span className="text-2xl">🛒</span>
        {cartItems.length > 0 && (
          <div className="badge badge-secondary absolute -top-2 -right-2">
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          </div>
        )}
      </button>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
