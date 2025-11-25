import { useEffect, useState, useRef } from "react";
import type { Product, CartItem, Category } from "../types";
import { getCategories, getProducts, saveOrder, type OrderItem } from "../lib/firestore";
import { sendOrderToWhatsApp } from "../lib/whatsapp";
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
  const [theme, setTheme] = useState<"oliva-light" | "oliva-dark">("oliva-light");

  const productsRef = useRef<HTMLDivElement>(null);

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("ozera-theme") as "oliva-light" | "oliva-dark" | null;
    const initialTheme = savedTheme || "oliva-light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  // Load categories and products on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [categoriesData, productsData] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);
        setCategories(categoriesData);
        setProducts(productsData);
      } catch (error) {
        // Handle AbortError gracefully - occurs when component unmounts during query
        if (error instanceof Error && error.name === "AbortError") {
          console.debug("Home page data query was aborted (expected on unmount)");
          return;
        }
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // Load cart from localStorage
    const savedCart = localStorage.getItem("ozera-cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("ozera-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Handle category selection
  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsLoading(true);

    try {
      const productsData = await getProducts(categoryId === "all" ? undefined : categoryId);
      setProducts(productsData);
    } catch (error) {
      // Handle AbortError gracefully - occurs when component unmounts during query
      if (error instanceof Error && error.name === "AbortError") {
        console.debug("Products filter query was aborted (expected on unmount)");
        return;
      }
      console.error("Error loading products:", error);
    } finally {
      setIsLoading(false);
    }

    // Scroll to products section
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Handle add to cart
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        return prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
            : item
        );
      }

      return [
        ...prevItems,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          imageUrl: product.imageUrl,
          total: product.price * quantity,
        },
      ];
    });

    // Show brief feedback
    const quantityText = quantity > 1 ? `${quantity} عناصر` : "عنصر واحد";
    setSuccessMessage(`تمت إضافة ${quantityText} من ${product.name} إلى السلة`);
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
  const handleCheckout = async (customerPhone: string, deliveryAddress: string) => {
    if (cartItems.length === 0) return;

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
        deliveryAddress,
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
      // Handle AbortError gracefully
      if (error instanceof Error && error.name === "AbortError") {
        console.debug("Order save was aborted (expected on unmount)");
        return;
      }
      console.error("Error saving order:", error);
      setSuccessMessage("حدث خطأ في حفظ الطلب. يرجى المحاولة مجددًا.");
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

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = theme === "oliva-light" ? "oliva-dark" : "oliva-light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("ozera-theme", newTheme);
  };

  return (
    <div className="ozera-home min-h-screen bg-base-100" dir="rtl" lang="ar">
      {/* Theme Toggle Button */}
      <button
        onClick={handleThemeToggle}
        className="theme-toggle fixed top-6 left-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-content shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="تبديل المظهر"
        title={theme === "oliva-light" ? "المظهر الداكن" : "المظهر الفاتح"}
      >
        {theme === "oliva-light" ? (
          <svg
            className="w-7 h-7"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg
            className="w-7 h-7"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM7 11a1 1 0 100-2H6a1 1 0 100 2h1zm-2.464-7.464a1 1 0 011.414 0l.707.707A1 1 0 006.243 5.05l-.707-.707a1 1 0 010-1.414zM19 11a1 1 0 100-2h-1a1 1 0 100 2h1zm0 4a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM2 14a1 1 0 001 1h1a1 1 0 100-2H3a1 1 0 00-1 1zm8 5a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM5.757 5.757a1 1 0 000-1.414L5.05 3.636a1 1 0 00-1.414 1.414l.707.707zm9.899 9.899l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 101.414-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

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
              اختر من مجموعتنا الفاخرة من منتجا�� العناية بالبشرة الطبيعية
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="categories-filter mb-12">
              <div className="categories-scroll overflow-x-auto pb-2 sm:pr-10 pr-40 flex gap-3 justify-center">
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
                  onRemoveFromCart={handleRemoveItem}
                  cartItems={cartItems}
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
        aria-label={`السلة (${cartItems.reduce((sum, item) => sum + item.quantity, 0)} ��نصر)`}
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
