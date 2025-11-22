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
    <div className="admin-dashboard min-h-screen bg-base-200 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="admin-sidebar w-64 bg-primary text-primary-content p-6 hidden lg:block sticky top-0 h-screen overflow-y-auto">
        <div className="sidebar-header mb-8">
          <h1 className="text-2xl font-bold">OZERA</h1>
          <p className="text-sm opacity-80">لوحة التحكم</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav space-y-2">
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full text-right px-4 py-3 rounded-lg transition-all ${
              activeTab === "products"
                ? "bg-primary-focus shadow-lg"
                : "hover:bg-primary-focus hover:bg-opacity-50"
            }`}
          >
            📦 إدارة المنتجات
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`w-full text-right px-4 py-3 rounded-lg transition-all ${
              activeTab === "categories"
                ? "bg-primary-focus shadow-lg"
                : "hover:bg-primary-focus hover:bg-opacity-50"
            }`}
          >
            📂 إدارة الفئات
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-right px-4 py-3 rounded-lg transition-all ${
              activeTab === "orders"
                ? "bg-primary-focus shadow-lg"
                : "hover:bg-primary-focus hover:bg-opacity-50"
            }`}
          >
            📋 تتبع الطلبات
          </button>
        </nav>

        {/* Logout */}
        <div className="sidebar-footer mt-auto pt-8 border-t border-primary-focus">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn btn-outline btn-sm w-full text-primary-content border-primary-content hover:bg-primary-content hover:text-primary"
          >
            {isLoggingOut ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                جاري...
              </>
            ) : (
              "تسجيل خروج"
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 bg-primary text-primary-content p-4 flex items-center justify-between z-10">
          <h1 className="text-xl font-bold">OZERA - لوحة التحكم</h1>
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-sm btn-ghost text-primary-content">
              ☰
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <a onClick={() => setActiveTab("products")}>📦 إدارة المنتجات</a>
              </li>
              <li>
                <a onClick={() => setActiveTab("categories")}>📂 إدارة الفئات</a>
              </li>
              <li>
                <a onClick={() => setActiveTab("orders")}>📋 تتبع الطلبات</a>
              </li>
              <li>
                <a onClick={handleLogout}>تسجيل خروج</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content p-6">
          {activeTab === "products" && <ProductsManagement />}
          {activeTab === "categories" && <CategoriesManagement />}
          {activeTab === "orders" && <OrdersTracking />}
        </div>
      </main>
    </div>
  );
}
