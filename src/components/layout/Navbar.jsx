import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/reqInterceptor";
import authService from "../../services/authService";
import { useAuth } from "../../components/context/AuthContext";
import { useTheme } from "../../components/context/ThemeContext";
import NotificationBell from '../ui/NotificationBell';

import {
  FiClock,
  FiUsers,
  FiGrid,
  FiShoppingCart,
  FiHome,
  FiLogOut,
  FiSun,
  FiMoon,
  FiMessageSquare,
  FiImage,
  FiFileText
} from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  const { logout, user: authUser } = useAuth();
  const { theme, toggleTheme } = useTheme();


  // Handle responsive behavior efficiently using matchMedia
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);



  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close side drawer with ESC
  useEffect(() => {
    if (!sideOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") setSideOpen(false);
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [sideOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err?.response?.data || err.message || err);
    } finally {
      navigate("/login");
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setSideOpen(false);
  };

  return (
    <>
      <nav className="w-full h-16 flex items-center justify-between px-4 md:px-6 bg-theme-body text-theme-text border-b border-theme-border shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            className="flex flex-col justify-center items-center gap-1 w-10 h-10 rounded-lg hover:bg-theme-card-hover transition-colors shrink-0"
            aria-label="Toggle navigation"
            onClick={() => setSideOpen((prev) => !prev)}
          >
            <span className="block w-5 h-0.5 bg-theme-text rounded-sm" />
            <span className="block w-5 h-0.5 bg-theme-text rounded-sm" />
            <span className="block w-5 h-0.5 bg-theme-text rounded-sm" />
          </button>

          <div
            className="flex items-center"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            <h2 className="font-bold text-2xl tracking-tight text-brand-primary">DarziFlow</h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex items-center shrink-0">
            <NotificationBell />
          </div>
          <button
            className="p-2 rounded-lg hover:bg-theme-card-hover text-theme-text transition-colors flex items-center justify-center shrink-0 w-10 h-10"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>
          <div className="relative flex items-center shrink-0" ref={dropdownRef}>
            <div
              className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-theme-border-light hover:border-theme-border transition-colors flex justify-center items-center bg-theme-card text-theme-text font-medium text-sm"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
            >
              {authUser?.avatar?.url ? (
                <img className="w-full h-full object-cover" src={authUser.avatar.url} alt="Profile" />
              ) : (
                <span>{authUser?.name ? authUser.name.charAt(0).toUpperCase() : "U"}</span>
              )}
            </div>

            {profileDropdownOpen && (
              <div className="absolute top-[calc(100%+8px)] right-0 bg-theme-dropdown backdrop-blur-md border border-theme-border-light rounded-xl shadow-lg flex flex-col min-w-[160px] z-[100] p-1.5 overflow-hidden">
                <button className="text-left px-4 py-2 text-sm font-medium text-theme-text hover:bg-theme-card-hover rounded-lg transition-colors w-full" onClick={() => navigate("/profile")}>Profile</button>
                <button className="text-left px-4 py-2 text-sm font-medium text-theme-text hover:bg-theme-card-hover rounded-lg transition-colors w-full" onClick={() => navigate("/settings")}>Settings</button>
                <button className="text-left px-4 py-2 text-sm font-medium text-accent-red hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full mt-1 border-t border-theme-border-light pt-2" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {sideOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[40]"
            onClick={() => setSideOpen(false)}
          />

          <aside className={`fixed top-16 left-0 w-20 h-[calc(100vh-4rem)] bg-theme-card border-r border-theme-border-light z-[45] flex pt-4 transition-transform duration-300 ease-in-out ${sideOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="w-full flex flex-col items-center gap-2 px-2 pb-4 h-full overflow-y-auto hide-scrollbar">
              <div className="flex flex-col items-center gap-2 w-full">
                <button
                  className="relative group w-12 h-12 inline-flex flex-col items-center justify-center rounded-xl transition-colors text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover"
                  title="Dashboard"
                  onClick={() => handleNavigation("/dashboard")}
                >
                  <FiHome size={20} />
                </button>

                <button
                  className="relative group w-12 h-12 inline-flex flex-col items-center justify-center rounded-xl transition-colors text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover"
                  title="Users"
                  onClick={() => handleNavigation("/users")}
                >
                  <FiUsers size={20} />
                </button>

                <button
                  className="relative group w-12 h-12 inline-flex flex-col items-center justify-center rounded-xl transition-colors text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover"
                  title="Departments"
                  onClick={() => handleNavigation("/departments")}
                >
                  <FiGrid size={20} />
                </button>

                <button
                  className="relative group w-12 h-12 inline-flex flex-col items-center justify-center rounded-xl transition-colors text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover"
                  title="Orders"
                  onClick={() => handleNavigation("/orderlist")}
                >
                  <FiShoppingCart size={20} />
                </button>

                <button
                  className="relative group w-12 h-12 inline-flex flex-col items-center justify-center rounded-xl transition-colors text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover"
                  title="Order Requests"
                  onClick={() => handleNavigation("/order-requests")}
                >
                  <FiFileText size={20} />
                </button>

                <button
                  className="relative group w-12 h-12 inline-flex flex-col items-center justify-center rounded-xl transition-colors text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover"
                  title="Audit Logs"
                  onClick={() => handleNavigation("/audit-logs")}
                >
                  <FiClock size={20} />
                </button>

                <button
                  className="relative group w-12 h-12 inline-flex flex-col items-center justify-center rounded-xl transition-colors text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover"
                  title="Messages"
                  onClick={() => handleNavigation("/chat")}
                >
                  <FiMessageSquare size={20} />
                </button>

                {authUser?.role === "ADMIN" && (
                  <button
                    className="relative group w-12 h-12 inline-flex flex-col items-center justify-center rounded-xl transition-colors text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover"
                    title="Carousel Management"
                    onClick={() => handleNavigation("/carousel")}
                  >
                    <FiImage size={20} />
                  </button>
                )}

                <button
                  className="relative group w-12 h-12 inline-flex flex-col items-center justify-center rounded-xl transition-colors text-accent-red hover:bg-red-50 dark:hover:bg-red-900/20 mt-auto"
                  title="Logout"
                  onClick={handleLogout}
                >
                  <FiLogOut size={20} />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Navbar;
