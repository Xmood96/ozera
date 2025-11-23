import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../lib/auth";
import ProductsManagement from "../components/admin/ProductsManagement";
import CategoriesManagement from "../components/admin/CategoriesManagement";
import OrdersTracking from "../components/admin/OrdersTracking";

type AdminTab = "products" | "categories" | "orders";

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="admin-dashboard min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="admin-sidebar w-64 bg-gradient-to-b from-primary to-primary-focus text-primary-content p-6 hidden lg:flex lg:flex-col sticky top-0 h-screen overflow-y-auto shadow-2xl">
        <div className="sidebar-header mb-10">
          <div className="bg-primary-content bg-opacity-20 rounded-lg p-4 mb-4 text-center">
            <h1 className="text-3xl font-bold">OZERA</h1>
          </div>
          <p className="text-sm opacity-90 text-center font-semibold">🎛️ لوحة التحكم الرئيسية</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav flex-1 space-y-2">
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full text-right px-4 py-4 rounded-xl transition-all duration-300 font-semibold ${
              activeTab === "products"
                ? "bg-primary-content bg-opacity-20 shadow-lg border-l-4 border-primary-content"
                : "hover:bg-primary-content hover:bg-opacity-10"
            }`}
          >
            📦 إدارة المنتجات
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`w-full text-right px-4 py-4 rounded-xl transition-all duration-300 font-semibold ${
              activeTab === "categories"
                ? "bg-primary-content bg-opacity-20 shadow-lg border-l-4 border-primary-content"
                : "hover:bg-primary-content hover:bg-opacity-10"
            }`}
          >
            📂 إدارة الفئات
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-right px-4 py-4 rounded-xl transition-all duration-300 font-semibold ${
              activeTab === "orders"
                ? "bg-primary-content bg-opacity-20 shadow-lg border-l-4 border-primary-content"
                : "hover:bg-primary-content hover:bg-opacity-10"
            }`}
          >
            📋 تتبع الطلبات
          </button>
        </nav>

        {/* Logout */}
        <div className="sidebar-footer pt-8 border-t border-primary-content border-opacity-30">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn btn-outline btn-sm w-full text-primary-content border-primary-content hover:bg-primary-content hover:text-primary rounded-lg font-semibold transition-all"
          >
            {isLoggingOut ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                جاري...
              </>
            ) : (
              "🚪 تسجيل خروج"
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 bg-gradient-to-r from-primary to-primary-focus text-primary-content p-4 flex items-center justify-between z-10 shadow-lg">
          <h1 className="text-lg font-bold">🎛️ OZERA</h1>
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-sm btn-ghost text-primary-content">
              ☰
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-3 shadow bg-base-100 rounded-box w-56">
              <li>
                <a onClick={() => setActiveTab("products")} className="font-semibold">📦 إدارة المنتجات</a>
              </li>
              <li>
                <a onClick={() => setActiveTab("categories")} className="font-semibold">📂 إدارة الفئات</a>
              </li>
              <li>
                <a onClick={() => setActiveTab("orders")} className="font-semibold">📋 تتبع الطلبات</a>
              </li>
              <li className="border-t border-base-300 mt-2">
                <a onClick={handleLogout} className="font-semibold text-error">🚪 تسجيل خروج</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content p-8">
          {activeTab === "products" && <ProductsManagement />}
          {activeTab === "categories" && <CategoriesManagement />}
          {activeTab === "orders" && <OrdersTracking />}
        </div>
      </main>
    </div>
  );
}
