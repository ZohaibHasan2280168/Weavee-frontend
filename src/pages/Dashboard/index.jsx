"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/reqInterceptor";
import RolePieChart from "../../components/charts/RolePieChart";
import { useAuth } from "../../components/context/AuthContext";
import DashboardLoader from "../../components/ui/Loader";
import MustChangePasswordModal from "../../components/modals/MustChangePasswordModal";

// Move initial stats outside component to avoid recreating on each render
const initialUserStats = [
  { name: "Admin", value: 0, backendKey: "ADMIN", color: "rgb(0, 136, 254)" },
  { name: "Client", value: 0, backendKey: "CLIENT", color: "rgb(0, 196, 159)" },
  { name: "QC Member", value: 0, backendKey: "QC_MEMBER", color: "rgb(255, 187, 40)" },
  { name: "Department Head", value: 0, backendKey: "DEPT_HEAD", color: "rgb(168, 85, 247)" },
];

const initialOrderStats = [
  { name: "Draft", value: 0, color: "rgb(148, 163, 184)" },
  { name: "Docs Pending", value: 0, color: "rgb(245, 158, 11)" },
  { name: "Ready to Start", value: 0, color: "rgb(16, 185, 129)" },
  { name: "In Progress", value: 0, color: "rgb(59, 130, 246)" },
  { name: "Completed", value: 0, color: "rgb(139, 92, 246)" },
];

export default function Dashboard() {
  const { user, mustChangePassword } = useAuth();
  const navigate = useNavigate();

  // Initial states for all charts
  const initialUserStats = [
    { name: "Admin", value: 0, backendKey: "ADMIN", color: "rgb(0, 136, 254)" },
    { name: "Client", value: 0, backendKey: "CLIENT", color: "rgb(0, 196, 159)" },
    { name: "QC Member", value: 0, backendKey: "QC_MEMBER", color: "rgb(255, 187, 40)" },
    { name: "Department Head", value: 0, backendKey: "DEPT_HEAD", color: "rgb(168, 85, 247)" },
  ];

  const initialOrderStats = [
    { name: "Draft", value: 0, color: "rgb(148, 163, 184)" },
    { name: "Docs Pending", value: 0, color: "rgb(245, 158, 11)" },
    { name: "Ready to Start", value: 0, color: "rgb(16, 185, 129)" },
    { name: "In Progress", value: 0, color: "rgb(59, 130, 246)" },
    { name: "Completed", value: 0, color: "rgb(139, 92, 246)" },
  ];

  const [userStats, setUserStats] = useState(initialUserStats);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [orderStats, setOrderStats] = useState(initialOrderStats);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch users data
        const usersRes = await api.get("/users");
        const { stats: userData } = usersRes.data;

        const newUserStats = initialUserStats.map(stat => ({
          ...stat,
          value: userData?.roles?.[stat.backendKey] || 0,
        }));
        setUserStats(newUserStats);

        // Fetch departments data
        const deptRes = await api.get("/departments");
        const departments = deptRes.data || [];
        
        // Calculate department stats by role
        const deptRoleCounts = departments.reduce((acc, dept) => {
          if (dept.head) {
            if (Array.isArray(dept.head)) {
              dept.head.forEach(head => {
                acc.DEPT_HEAD = (acc.DEPT_HEAD || 0) + 1;
              });
            } else {
              acc.DEPT_HEAD = (acc.DEPT_HEAD || 0) + 1;
            }
          }
          return acc;
        }, {});

        const deptStats = [
          { name: "Active Departments", value: departments.length, color: "rgb(59, 130, 246)" },
          { name: "With Department Head", value: deptRoleCounts.DEPT_HEAD || 0, color: "rgb(16, 185, 129)" },
        ];
        setDepartmentStats(deptStats);
        setDepartmentCount(departments.length);

        // Fetch orders data
        const ordersRes = await api.get("/order");
        const orders = ordersRes.data?.orders || [];

        // Calculate order status counts
        const orderCounts = orders.reduce((acc, order) => {
          const status = order.overallStatus || 'DRAFT';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        const newOrderStats = initialOrderStats.map(stat => ({
          ...stat,
          value: orderCounts[stat.name.toUpperCase().replace(/\s+/g, '_')] || 0,
        }));
        setOrderStats(newOrderStats);
        setTotalOrders(orders.length);

      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch dashboard data");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleUserRoleClick = (roleDisplayName) => {
    const urlRoleSlug = roleDisplayName.toLowerCase().replace(/\s+/g, '_');
    navigate(`/users/role/${urlRoleSlug}`);
  };

  const totalUsers = userStats.reduce((sum, s) => sum + s.value, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--main-bg)] text-theme-text">
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 relative">
          <DashboardLoader label="Loading dashboard data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--main-bg)] text-theme-text">
      {mustChangePassword && (
        <MustChangePasswordModal onContinue={() => navigate("/profile")} />
      )}

      <div className="max-w-[1400px] mx-auto p-4 md:p-8 relative">
        <div className="boxed-pattern" />
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold m-0 text-theme-text">Welcome back, {user.name || user.email}!</h1>
          <p className="text-lg text-theme-text-secondary mt-2">Here's what's happening with your production today</p>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-theme-card border border-theme-border-light rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 transition-all duration-300 cursor-pointer shadow-md hover:-translate-y-1 hover:bg-theme-card-hover hover:border-brand-primary/40 hover:shadow-xl">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-[#0088FE]/20 to-[#0088FE]/10 text-[#0088FE]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-theme-text-secondary mb-2 uppercase tracking-wide">Total Users</h3>
              <p className="text-4xl font-bold m-0 text-theme-text">{totalUsers}</p>
              <p className="text-sm text-theme-text-muted mt-1">Across all roles</p>
            </div>
          </div>

          <div className="bg-theme-card border border-theme-border-light rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 transition-all duration-300 cursor-pointer shadow-md hover:-translate-y-1 hover:bg-theme-card-hover hover:border-brand-primary/40 hover:shadow-xl">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 text-brand-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-theme-text-secondary mb-2 uppercase tracking-wide">Active Departments</h3>
              <p className="text-4xl font-bold m-0 text-theme-text">{departmentCount}</p>
              <p className="text-sm text-theme-text-muted mt-1">Production workflow</p>
            </div>
          </div>

          <div className="bg-theme-card border border-theme-border-light rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 transition-all duration-300 cursor-pointer shadow-md hover:-translate-y-1 hover:bg-theme-card-hover hover:border-brand-primary/40 hover:shadow-xl">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-accent-emerald/20 to-accent-emerald/10 text-accent-emerald">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-theme-text-secondary mb-2 uppercase tracking-wide">Active Orders</h3>
              <p className="text-4xl font-bold m-0 text-theme-text">{totalOrders}</p>
              <p className="text-sm text-theme-text-muted mt-1">In production</p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-10">
          {/* Users Chart */}
          <div className="bg-theme-card border border-theme-border-light rounded-2xl p-5 md:p-6 transition-all duration-300 shadow-md hover:border-brand-primary/20 hover:shadow-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-theme-border-light">
              <h2 className="text-xl font-semibold m-0 text-theme-text">User Roles Distribution</h2>
            </div>
            
            {error && <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red py-3 px-4 rounded-lg my-4 text-sm">{error}</div>}
            
            <div className="h-[220px] mb-6">
              <RolePieChart data={userStats} />
            </div>
            
            <div className="flex flex-col gap-3 mt-6">
              {userStats.map((stat, idx) => (
                <div key={stat.name} className="flex items-center gap-3 py-2 px-3 rounded-lg transition-colors cursor-pointer hover:bg-theme-card-hover" onClick={() => handleUserRoleClick(stat.name)}>
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: stat.color || "#888" }}></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-1 gap-1 sm:gap-0 items-start">
                    <span className="text-sm text-theme-text">{stat.name}</span>
                    <span className="text-sm text-theme-text-muted font-medium"></span>
                  </div>
                </div>
              ))}
            </div>

            {user.role === "ADMIN" && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button className="flex-1 py-3 px-5 rounded-xl font-medium text-sm cursor-pointer transition-all flex items-center justify-center gap-2 bg-brand-primary text-white hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]" onClick={() => navigate("/users")}>
                  View All Users
                </button>
              </div>
            )}
          </div>

          {/* Orders Chart */}
          <div className="bg-theme-card border border-theme-border-light rounded-2xl p-5 md:p-6 transition-all duration-300 shadow-md hover:border-brand-primary/20 hover:shadow-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-theme-border-light">
              <h2 className="text-xl font-semibold m-0 text-theme-text">Orders Status</h2>
            </div>
            
            <div className="h-[220px] mb-6">
              <RolePieChart data={orderStats} />
            </div>
            
            <div className="flex flex-col gap-3 mt-6">
              {orderStats.map((stat, idx) => (
                <div key={stat.name} className="flex items-center gap-3 py-2 px-3 rounded-lg transition-colors cursor-pointer hover:bg-theme-card-hover">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: stat.color || "#888" }}></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-1 gap-1 sm:gap-0 items-start">
                    <span className="text-sm text-theme-text">{stat.name}</span>
                    <span className="text-sm text-theme-text-muted font-medium">
                      {stat.value} ({totalOrders > 0 ? Math.round((stat.value / totalOrders) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button className="flex-1 py-3 px-5 rounded-xl font-medium text-sm cursor-pointer transition-all flex items-center justify-center gap-2 bg-brand-primary text-white hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]" onClick={() => navigate("/orderlist")}>
                View All Orders
              </button>
            </div>
          </div>

          {/* Departments Chart */}
          <div className="bg-theme-card border border-theme-border-light rounded-2xl p-5 md:p-6 transition-all duration-300 shadow-md hover:border-brand-primary/20 hover:shadow-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-theme-border-light">
              <h2 className="text-xl font-semibold m-0 text-theme-text">Departments Overview</h2>
            </div>
            
            <div className="h-[220px] mb-6">
              <RolePieChart data={departmentStats} />
            </div>
            
            <div className="flex flex-col gap-3 mt-6">
              {departmentStats.map((stat, idx) => (
                <div key={stat.name} className="flex items-center gap-3 py-2 px-3 rounded-lg transition-colors cursor-pointer hover:bg-theme-card-hover">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: stat.color || "#888" }}></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-1 gap-1 sm:gap-0 items-start">
                    <span className="text-sm text-theme-text">{stat.name}</span>
                    <span className="text-sm text-theme-text-muted font-medium">
                      {stat.value} ({departmentCount > 0 ? Math.round((stat.value / departmentCount) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {user.role === "ADMIN" && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button className="flex-1 py-3 px-5 rounded-xl font-medium text-sm cursor-pointer transition-all flex items-center justify-center gap-2 bg-brand-primary text-white hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]" onClick={() => navigate("/departments")}>
                  View All Departments
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
