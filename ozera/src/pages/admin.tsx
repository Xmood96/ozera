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
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: "info" | "warning" | "success" }>>([]);

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

      if (pendingCount > 0) {
        addNotification(`لديك ${pendingCount} طلب قيد الانتظار`, "warning");
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Error loading stats:", error);
        addNotification("خطأ في تحميل الإحصائيات", "info");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingStats(false);
      }
    }
  };

  const addNotification = (message: string, type: "info" | "warning" | "success" = "info") => {
    const id = Math.random().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
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
    <div className={`admin-dashboard min-h-screen transition-colors duration-300 ${isDarkMode ? "dark bg-slate-950" : "bg-gradient-to-br from-slate-50 to-slate-100"} flex`} dir="rtl">
      {/* Sidebar */}
      <aside className={`admin-sidebar w-72 ${isDarkMode ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-b from-primary via-secondary to-primary-focus"} text-base-100 p-6 hidden lg:flex lg:flex-col sticky top-0 h-screen overflow-y-auto shadow-2xl border-l-2 ${isDarkMode ? "border-slate-700" : "border-accent/20"}`}>
        {/* Logo */}
        <div className="sidebar-header mb-12">
          <div className={`${isDarkMode ? "bg-slate-700/50" : "bg-base-100/10"} backdrop-blur-sm rounded-2xl p-5 mb-4 text-center border ${isDarkMode ? "border-slate-600/30" : "border-base-100/20"}`}>
            <h1 className="text-4xl font-black">OZERA</h1>
            <p className="text-xs opacity-70 mt-1 font-semibold">إدارة شاملة</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav flex-1 space-y-3">
          <NavButton
            icon="📊"
            label="لوحة التحكم"
            isActive={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
            isDark={isDarkMode}
          />
          <NavButton
            icon="📦"
            label="إدارة المنتجات"
            isActive={activeTab === "products"}
            onClick={() => setActiveTab("products")}
            isDark={isDarkMode}
          />
          <NavButton
            icon="📂"
            label="إدارة الفئات"
            isActive={activeTab === "categories"}
            onClick={() => setActiveTab("categories")}
            isDark={isDarkMode}
          />
          <NavButton
            icon="📋"
            label="تتبع الطلبات"
            isActive={activeTab === "orders"}
            onClick={() => setActiveTab("orders")}
            isDark={isDarkMode}
          />
        </nav>

        {/* Sidebar Footer */}
        <div className={`sidebar-footer pt-6 border-t ${isDarkMode ? "border-slate-700/50" : "border-base-100/20"} space-y-3`}>
          <button
            onClick={toggleDarkMode}
            className={`w-full py-2 px-4 rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2 ${
              isDarkMode
                ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                : "bg-base-100/10 text-base-100 hover:bg-base-100/20"
            }`}
          >
            {isDarkMode ? "☀️ المظهر الفاتح" : "🌙 المظهر المظلم"}
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`btn btn-sm w-full font-semibold transition-all rounded-xl ${
              isDarkMode
                ? "btn-outline border-red-500 text-red-400 hover:bg-red-500/20"
                : "btn-outline border-error text-error hover:bg-error/10"
            }`}
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
        <div className={`lg:hidden sticky top-0 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gradient-to-r from-primary to-secondary"} text-base-100 p-4 flex items-center justify-between z-10 shadow-lg border-b`}>
          <h1 className="text-xl font-bold">🎛️ OZERA</h1>
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-sm btn-ghost text-base-100">
              ☰
            </button>
            <ul tabIndex={0} className={`dropdown-content z-1 menu p-3 shadow ${isDarkMode ? "bg-slate-800" : "bg-base-100"} rounded-box w-56`}>
              <li>
                <a onClick={() => setActiveTab("dashboard")} className="font-semibold">📊 لوحة التحكم</a>
              </li>
              <li>
                <a onClick={() => setActiveTab("products")} className="font-semibold">📦 إدارة المنتجات</a>
              </li>
              <li>
                <a onClick={() => setActiveTab("categories")} className="font-semibold">📂 إدارة الفئات</a>
              </li>
              <li>
                <a onClick={() => setActiveTab("orders")} className="font-semibold">📋 تتبع الطلبات</a>
              </li>
              <li className={`border-t ${isDarkMode ? "border-slate-700" : "border-base-300"} mt-2`}>
                <a onClick={toggleDarkMode} className="font-semibold">
                  {isDarkMode ? "☀️" : "🌙"} {isDarkMode ? "المظهر الفاتح" : "المظهر المظلم"}
                </a>
              </li>
              <li>
                <a onClick={handleLogout} className="font-semibold text-error">🚪 تسجيل خروج</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-20 left-4 right-4 space-y-2 z-50">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`alert alert-${notif.type} shadow-lg rounded-xl animate-slideIn`}
              >
                <span>{notif.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className={`admin-content p-6 lg:p-8 space-y-8`}>
          {/* Search Bar */}
          {activeTab !== "dashboard" && (
            <div className={`search-container ${isDarkMode ? "bg-slate-800/50" : "bg-base-100"} rounded-2xl p-4 shadow-sm border ${isDarkMode ? "border-slate-700" : "border-base-200"}`}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 بحث في المنتجات والطلبات..."
                  className={`input input-bordered w-full ${isDarkMode ? "bg-slate-700/50 border-slate-600" : ""}`}
                />
              </div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <DashboardContent stats={stats} isLoading={isLoadingStats} isDarkMode={isDarkMode} />
          )}

          {/* Other Tabs */}
          {activeTab === "products" && <ProductsManagement />}
          {activeTab === "categories" && <CategoriesManagement />}
          {activeTab === "orders" && <OrdersTracking />}
        </div>
      </main>
    </div>
  );
}

function NavButton({
  icon,
  label,
  isActive,
  onClick,
  isDark,
}: {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isDark: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex gap-3 items-center text-right px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-base ${
        isActive
          ? isDark
            ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg"
            : "bg-gradient-to-r from-accent to-accent/80 shadow-lg"
          : isDark
          ? "hover:bg-slate-700/50 text-slate-200"
          : "hover:bg-base-100/10 text-base-100"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function DashboardContent({
  stats,
  isLoading,
  isDarkMode,
}: {
  stats: DashboardStats;
  isLoading: boolean;
  isDarkMode: boolean;
}) {
  return (
    <>
      {/* Welcome Section */}
      <div className={`welcome-banner rounded-3xl p-8 ${isDarkMode ? "bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/30" : "bg-gradient-to-r from-primary/20 to-secondary/20 border border-accent/30"}`}>
        <h1 className="text-4xl font-black mb-2">مرح��اً بك في لوحة التحكم 👋</h1>
        <p className={`text-lg ${isDarkMode ? "text-slate-300" : "text-base-content/70"}`}>
          إدارة شاملة ومركزة لمتجرك
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon="📦"
              label="إجمالي المنتجات"
              value={stats.totalProducts}
              color="from-blue-500 to-blue-600"
              isDark={isDarkMode}
            />
            <StatCard
              icon="📂"
              label="الفئات"
              value={stats.totalCategories}
              color="from-green-500 to-green-600"
              isDark={isDarkMode}
            />
            <StatCard
              icon="💰"
              label="إجمالي الإيرادات"
              value={`${stats.totalRevenue} ج.م`}
              color="from-amber-500 to-amber-600"
              isDark={isDarkMode}
            />
            <StatCard
              icon="📋"
              label="إجمالي الطلبات"
              value={stats.totalOrders}
              color="from-purple-500 to-purple-600"
              isDark={isDarkMode}
            />
            <StatCard
              icon="⏳"
              label="طلبات قيد الانتظار"
              value={stats.pendingOrders}
              color="from-orange-500 to-orange-600"
              isDark={isDarkMode}
            />
            <StatCard
              icon="✅"
              label="الطلبات المكتملة"
              value={stats.completedOrders}
              color="from-emerald-500 to-emerald-600"
              isDark={isDarkMode}
            />
          </div>

          {/* Quick Actions */}
          <div className={`quick-actions rounded-2xl p-8 ${isDarkMode ? "bg-slate-800/50 border border-slate-700" : "bg-base-100 border border-base-200"} shadow-lg`}>
            <h2 className="text-2xl font-bold mb-6 flex gap-2 items-center">
              ⚡ إجراءات سريعة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickActionButton icon="📦" label="إضافة منتج جديد" isDark={isDarkMode} />
              <QuickActionButton icon="📂" label="إضافة فئة جديدة" isDark={isDarkMode} />
              <QuickActionButton icon="👥" label="عرض الطلبات المعلقة" isDark={isDarkMode} />
              <QuickActionButton icon="📊" label="تصدير التقارير" isDark={isDarkMode} />
            </div>
          </div>

          {/* Performance Chart */}
          <div className={`performance-chart rounded-2xl p-8 ${isDarkMode ? "bg-slate-800/50 border border-slate-700" : "bg-base-100 border border-base-200"} shadow-lg`}>
            <h2 className="text-2xl font-bold mb-6 flex gap-2 items-center">
              📈 أداء المبيعات
            </h2>
            <PerformanceChart stats={stats} isDark={isDarkMode} />
          </div>

          {/* Recent Activity */}
          <div className={`recent-activity rounded-2xl p-8 ${isDarkMode ? "bg-slate-800/50 border border-slate-700" : "bg-base-100 border border-base-200"} shadow-lg`}>
            <h2 className="text-2xl font-bold mb-6 flex gap-2 items-center">
              🔔 آخر النشاطات
            </h2>
            <ActivityFeed isDark={isDarkMode} />
          </div>
        </>
      )}
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  isDark,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`stat-card bg-gradient-to-br ${color} rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/10`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-80 font-semibold mb-2">{label}</p>
          <p className="text-4xl font-black">{value}</p>
        </div>
        <span className="text-5xl opacity-20">{icon}</span>
      </div>
    </div>
  );
}

function QuickActionButton({
  icon,
  label,
  isDark,
}: {
  icon: string;
  label: string;
  isDark: boolean;
}) {
  return (
    <button
      className={`quick-action-btn flex items-center gap-3 p-4 rounded-xl font-semibold transition-all duration-300 ${
        isDark
          ? "bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-slate-100"
          : "bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-primary/20 text-primary"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function PerformanceChart({
  stats,
  isDark,
}: {
  stats: DashboardStats;
  isDark: boolean;
}) {
  const maxValue = Math.max(stats.totalOrders, stats.completedOrders, stats.pendingOrders, 1);
  const charts = [
    { label: "إجمالي الطلبات", value: stats.totalOrders, color: "bg-blue-500" },
    { label: "مكتملة", value: stats.completedOrders, color: "bg-green-500" },
    { label: "قيد الانتظار", value: stats.pendingOrders, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {charts.map((chart) => (
        <div key={chart.label}>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">{chart.label}</span>
            <span className={`font-bold ${isDark ? "text-slate-300" : "text-primary"}`}>{chart.value}</span>
          </div>
          <div className={`h-3 rounded-full ${isDark ? "bg-slate-700/50" : "bg-base-200"} overflow-hidden`}>
            <div
              className={`${chart.color} h-full rounded-full transition-all duration-500`}
              style={{ width: `${(chart.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityFeed({ isDark }: { isDark: boolean }) {
  const activities = [
    { icon: "📦", text: "تم إضافة منتج جديد", time: "قبل دقيق��" },
    { icon: "✅", text: "تم إكمال الطلب #12345", time: "قبل ساعة" },
    { icon: "⏳", text: "طلب جديد قيد الانتظار", time: "قبل ساعتين" },
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => (
        <div
          key={idx}
          className={`flex items-center gap-4 p-4 rounded-xl ${
            isDark ? "bg-slate-700/30 border border-slate-600/30" : "bg-base-200/30 border border-base-300"
          }`}
        >
          <span className="text-2xl">{activity.icon}</span>
          <div className="flex-1">
            <p className="font-semibold">{activity.text}</p>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-base-content/60"}`}>{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
