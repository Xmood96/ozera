import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../lib/auth";
import { getProducts, getCategories } from "../lib/firestore";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import ProductsManagement from "../components/admin/ProductsManagement";
import CategoriesManagement from "../components/admin/CategoriesManagement";
import OrdersTracking from "../components/admin/OrdersTracking";

type AdminTab = "dashboard" | "products" | "categories" | "orders";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  completedOrders: number;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadDashboardStats();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadDashboardStats = async () => {
    if (!isMountedRef.current) return;

    setIsLoadingStats(true);
    try {
      const [productsData, categoriesData, ordersSnapshot] = await Promise.all([
        getProducts(),
        getCategories(),
        getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
      ]);

      if (!isMountedRef.current) return;

      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const completedCount = ordersData.filter((order) => order.status === "completed").length;
      const pendingCount = ordersData.filter((order) => order.status === "pending").length;

      setStats({
        totalProducts: productsData.length,
        totalCategories: categoriesData.length,
        totalOrders: ordersData.length,
        pendingOrders: pendingCount,
        totalRevenue,
        completedOrders: completedCount,
      });
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Error loading stats:", error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingStats(false);
      }
    }
  };

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`admin-dashboard min-h-screen transition-colors ${isDarkMode ? "dark bg-slate-950" : "bg-slate-50"} flex`} dir="rtl">
      {/* Sidebar */}
      <aside className={`admin-sidebar w-64 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} p-6 hidden lg:flex lg:flex-col sticky top-0 h-screen overflow-y-auto shadow-sm border-l`}>
        {/* Logo */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? "text-slate-100" : "text-primary"}`}>OZERA</h1>
          <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>لوحة التحكم</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <NavButton
            label="لوحة التحكم"
            isActive={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
            isDark={isDarkMode}
          />
          <NavButton
            label="المنتجات"
            isActive={activeTab === "products"}
            onClick={() => setActiveTab("products")}
            isDark={isDarkMode}
          />
          <NavButton
            label="الفئات"
            isActive={activeTab === "categories"}
            onClick={() => setActiveTab("categories")}
            isDark={isDarkMode}
          />
          <NavButton
            label="الطلبات"
            isActive={activeTab === "orders"}
            onClick={() => setActiveTab("orders")}
            isDark={isDarkMode}
          />
        </nav>

        {/* Footer */}
        <div className={`space-y-2 pt-4 border-t ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
          <button
            onClick={toggleDarkMode}
            className={`w-full py-2 px-3 rounded-lg text-sm transition ${
              isDarkMode
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {isDarkMode ? "☀️ فاتح" : "🌙 مظلم"}
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn btn-sm w-full btn-outline rounded-lg text-error border-error"
          >
            {isLoggingOut ? (
              <>
                <span className="loading loading-spinner loading-xs" />
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
        <div className={`lg:hidden sticky top-0 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} p-4 flex items-center justify-between z-10 border-b shadow-sm`}>
          <h1 className={`text-xl font-bold ${isDarkMode ? "text-slate-100" : "text-primary"}`}>OZERA</h1>
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-sm btn-ghost">
              ☰
            </button>
            <ul tabIndex={0} className={`dropdown-content z-1 menu p-2 shadow ${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-box w-52`}>
              <li>
                <a onClick={() => setActiveTab("dashboard")}>📊 لوحة التحكم</a>
              </li>
              <li>
                <a onClick={() => setActiveTab("products")}>📦 المنتجات</a>
              </li>
              <li>
                <a onClick={() => setActiveTab("categories")}>📂 الفئات</a>
              </li>
              <li>
                <a onClick={() => setActiveTab("orders")}>📋 الطلبات</a>
              </li>
              <li>
                <a onClick={toggleDarkMode}>{isDarkMode ? "☀️ فاتح" : "🌙 مظلم"}</a>
              </li>
              <li>
                <a onClick={handleLogout} className="text-error">تسجيل خروج</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Content */}
        <div className={`admin-content p-6 lg:p-8 ${isDarkMode ? "bg-slate-950" : "bg-slate-50"}`}>
          {activeTab === "dashboard" && (
            <DashboardContent stats={stats} isLoading={isLoadingStats} isDarkMode={isDarkMode} onTabChange={setActiveTab} />
          )}
          {activeTab === "products" && <ProductsManagement />}
          {activeTab === "categories" && <CategoriesManagement />}
          {activeTab === "orders" && <OrdersTracking />}
        </div>
      </main>
    </div>
  );
}

function NavButton({
  label,
  isActive,
  onClick,
  isDark,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  isDark: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-right px-4 py-2 rounded-lg transition ${
        isActive
          ? isDark
            ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-500"
            : "bg-primary/10 text-primary border-l-2 border-primary"
          : isDark
          ? "text-slate-400 hover:bg-slate-800/50"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}

function DashboardContent({
  stats,
  isLoading,
  isDarkMode,
  onTabChange,
}: {
  stats: DashboardStats;
  isLoading: boolean;
  isDarkMode: boolean;
  onTabChange: (tab: AdminTab) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
          مرحباً بك في لوحة التحكم
        </h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
          إدارة شاملة لمتجرك وطلباتك
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label="المنتجات"
              value={stats.totalProducts}
              icon="📦"
              bgColor="bg-blue-50"
              textColor="text-blue-600"
              isDark={isDarkMode}
            />
            <StatCard
              label="الفئات"
              value={stats.totalCategories}
              icon="📂"
              bgColor="bg-green-50"
              textColor="text-green-600"
              isDark={isDarkMode}
            />
            <StatCard
              label="الإيرادات"
              value={`${stats.totalRevenue} ج.م`}
              icon="💰"
              bgColor="bg-amber-50"
              textColor="text-amber-600"
              isDark={isDarkMode}
            />
            <StatCard
              label="إجمالي الطلبات"
              value={stats.totalOrders}
              icon="📋"
              bgColor="bg-purple-50"
              textColor="text-purple-600"
              isDark={isDarkMode}
            />
            <StatCard
              label="قيد الانتظار"
              value={stats.pendingOrders}
              icon="⏳"
              bgColor="bg-orange-50"
              textColor="text-orange-600"
              isDark={isDarkMode}
            />
            <StatCard
              label="مكتملة"
              value={stats.completedOrders}
              icon="✅"
              bgColor="bg-emerald-50"
              textColor="text-emerald-600"
              isDark={isDarkMode}
            />
          </div>

          {/* Quick Actions */}
          <div className={`rounded-xl p-6 ${isDarkMode ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200"}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
              ⚡ إجراءات سريعة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <QuickActionButton
                label="إضافة منتج جديد"
                onClick={() => onTabChange("products")}
                isDark={isDarkMode}
                color="blue"
              />
              <QuickActionButton
                label="إضافة فئة جديدة"
                onClick={() => onTabChange("categories")}
                isDark={isDarkMode}
                color="green"
              />
              <QuickActionButton
                label="عرض الطلبات المعلقة"
                onClick={() => onTabChange("orders")}
                isDark={isDarkMode}
                color="orange"
              />
              <QuickActionButton
                label="إدارة المنتجات"
                onClick={() => onTabChange("products")}
                isDark={isDarkMode}
                color="purple"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  bgColor,
  textColor,
  isDark,
}: {
  label: string;
  value: number | string;
  icon: string;
  bgColor: string;
  textColor: string;
  isDark: boolean;
}) {
  const darkBgColor = isDark ? "bg-slate-800" : bgColor;
  const darkTextColor = isDark ? "text-slate-300" : textColor;

  return (
    <div className={`rounded-lg p-5 border ${isDark ? "border-slate-700" : "border-slate-200"} ${darkBgColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {label}
          </p>
          <p className={`text-3xl font-bold mt-2 ${darkTextColor}`}>{value}</p>
        </div>
        <span className="text-4xl opacity-50">{icon}</span>
      </div>
    </div>
  );
}

function QuickActionButton({
  label,
  onClick,
  isDark,
  color,
}: {
  label: string;
  onClick: () => void;
  isDark: boolean;
  color: "blue" | "green" | "orange" | "purple";
}) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 hover:bg-blue-100",
    green: "text-green-600 bg-green-50 hover:bg-green-100",
    orange: "text-orange-600 bg-orange-50 hover:bg-orange-100",
    purple: "text-purple-600 bg-purple-50 hover:bg-purple-100",
  };

  const darkColorMap = {
    blue: "text-blue-400 bg-slate-800 hover:bg-slate-700",
    green: "text-green-400 bg-slate-800 hover:bg-slate-700",
    orange: "text-orange-400 bg-slate-800 hover:bg-slate-700",
    purple: "text-purple-400 bg-slate-800 hover:bg-slate-700",
  };

  const baseClass = isDark ? darkColorMap[color] : colorMap[color];

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg transition font-semibold text-left ${baseClass}`}
    >
      {label}
    </button>
  );
}

type AdminTab = "dashboard" | "products" | "categories" | "orders";
