import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Link2,
  Shield,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Links', path: '/dashboard/links', icon: Link2 },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: Shield });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen gradient-bg text-gray-900 dark:text-dark-text flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-panel m-4 mr-0 rounded-card shadow-premium border-r border-gray-200 dark:border-dark-border p-6 z-10">
        <div className="flex items-center gap-2 mb-8 px-2">
          <Heart className="h-8 w-8 text-brand-pink fill-brand-pink animate-pulse" />
          <span className="font-extrabold text-2xl bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent">
            CrushLink
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-brand-pink to-brand-purple text-white shadow-premium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-gray-100 dark:border-dark-border space-y-4">
          {/* User Details */}
          <div className="flex items-center gap-3 px-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-10 w-10 rounded-full border-2 border-brand-pink"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-pink to-brand-purple text-white flex items-center justify-center font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="truncate max-w-[130px]">
              <p className="font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center p-2 rounded-xl border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border transition"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-brand-purple" />}
            </button>
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center p-2 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 glass-panel m-4 mb-0 rounded-xl shadow-premium">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-brand-pink fill-brand-pink" />
            <span className="font-extrabold text-xl bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent">
              CrushLink
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Content Panel */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="w-72 max-w-[80vw] bg-white dark:bg-dark-card h-full p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-extrabold text-xl bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent">
                  Navigation
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-brand-pink to-brand-purple text-white shadow-premium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-gray-100 dark:border-dark-border space-y-4">
                <div className="flex items-center gap-3">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-10 w-10 rounded-full border-2 border-brand-pink"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-pink to-brand-purple text-white flex items-center justify-center font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm truncate max-w-[150px]">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={toggleTheme}
                    className="flex-1 flex items-center justify-center p-2 rounded-xl border border-gray-200 dark:border-dark-border"
                  >
                    {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-brand-purple" />}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 flex items-center justify-center p-2 rounded-xl border border-red-200 text-red-500"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
