import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Home, LogOut, Menu, X, CheckCheck, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  title: string;
  roleLabel: string;
  items: SidebarItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  roleLabel,
  items,
  activeTab,
  onTabChange,
  children
}) => {
  const { user, notifications, markAllNotificationsRead, logout, siteSettings } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuSheet, setMobileMenuSheet] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const primaryMobileTabs = items.slice(0, 4);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#171316] text-white">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={siteSettings.site_logo}
            alt={siteSettings.site_name}
            className="w-9 h-9 rounded-xl object-contain bg-white p-0.5 shrink-0"
          />
          <div>
            <p className="font-display text-base font-extrabold leading-tight tracking-tight">
              {siteSettings.site_name}
            </p>
            <p className="text-[11px] text-[#F0445E]">{roleLabel}</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 text-white/70 hover:text-white cursor-pointer"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => {
          const active = item.id === activeTab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onTabChange(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-[#B5122A] to-[#D61F3C] text-white shadow-sm'
                  : 'text-white/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1.5">
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs text-white/75 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>মূল ওয়েবসাইটে ফিরুন</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs text-[#F0445E] hover:bg-[#B5122A]/20 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>লগআউট</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF8F9] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen no-print">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.2 }}
              className="relative w-64 max-w-[80vw] h-full z-10"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-[#E7E1E3] px-3 sm:px-6 flex items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[#E7E1E3] text-[#241A1D] hover:text-[#B5122A] cursor-pointer"
              aria-label="সাইডবার খুলুন"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-sm sm:text-lg font-bold text-[#171316] truncate">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#7F1023] bg-[#FFF1F3] border border-[#B5122A]/25 rounded-xl hover:bg-[#FCE4E8] transition-colors whitespace-nowrap"
            >
              <Home className="w-3.5 h-3.5" />
              <span>হোম</span>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-2 rounded-xl border border-[#E7E1E3] text-[#241A1D] hover:bg-[#FFF1F3] hover:text-[#B5122A] transition-colors cursor-pointer"
                aria-label="নোটিফিকেশন"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] rounded-full bg-[#B5122A] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-[#E7E1E3] rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-[#E7E1E3] flex items-center justify-between bg-[#FFF1F3]">
                      <span className="text-xs font-bold text-[#7F1023]">নোটিফিকেশন</span>
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B5122A] hover:underline cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>সব পড়া হয়েছে</span>
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-[#F5F5F6]">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-xs text-center text-[#75686C]">কোনো নতুন নোটিফিকেশন নেই</p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div key={n.notification_id} className={`p-3 ${!n.is_read ? 'bg-[#FFF8F9]' : ''}`}>
                            <p className="text-xs font-semibold text-[#241A1D]">{n.title}</p>
                            <p className="text-xs text-[#75686C] mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E7E1E3]">
              <div className="w-8 h-8 rounded-lg bg-[#FCE4E8] text-[#B5122A] font-bold text-xs flex items-center justify-center">
                {user?.full_name?.charAt(0) || 'ব'}
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-[#241A1D] max-w-[140px] truncate">{user?.full_name}</p>
                <p className="text-[11px] text-[#75686C]">{roleLabel}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile & Tablet Bottom Tab Bar for Dashboards */}
      <nav
        aria-label="ড্যাশবোর্ড নিচের মেনু"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E1E3] shadow-[0_-6px_24px_rgba(127,16,35,0.10)] px-1.5 pb-[env(safe-area-inset-bottom)] no-print"
      >
        <div
          className="grid items-center h-[60px]"
          style={{ gridTemplateColumns: `repeat(${primaryMobileTabs.length + 1}, minmax(0, 1fr))` }}
        >
          {primaryMobileTabs.map((item) => {
            const active = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className="relative flex flex-col items-center justify-center min-h-[44px] py-1 px-1 rounded-xl cursor-pointer transition-colors"
              >
                {active && (
                  <motion.span
                    layoutId="rb-dash-bottom-active"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-x-1.5 inset-y-1 rounded-xl bg-[#FFF1F3]"
                  />
                )}
                <span className={`relative z-10 ${active ? 'text-[#B5122A]' : 'text-[#75686C]'}`}>
                  {item.icon}
                </span>
                <span
                  className={`relative z-10 text-[10px] font-semibold mt-0.5 truncate max-w-full px-1 ${
                    active ? 'text-[#B5122A]' : 'text-[#75686C]'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setMobileMenuSheet(true)}
            className="flex flex-col items-center justify-center min-h-[44px] py-1 px-1 rounded-xl cursor-pointer text-[#75686C] hover:text-[#B5122A]"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">আরও</span>
          </button>
        </div>
      </nav>

      {/* Dashboard Mobile Bottom Sheet */}
      <AnimatePresence>
        {mobileMenuSheet && (
          <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center no-print">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuSheet(false)}
              className="fixed inset-0 bg-black/55 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative z-10 w-full bg-white rounded-t-3xl border-t border-[#E7E1E3] shadow-2xl max-h-[82vh] flex flex-col overflow-hidden"
            >
              <div className="pt-3 pb-1 flex justify-center">
                <span className="w-10 h-1.5 rounded-full bg-[#E7E1E3]" />
              </div>
              <div className="px-5 py-3 border-b border-[#E7E1E3] flex items-center justify-between bg-[#FFF1F3]">
                <div>
                  <p className="font-display text-base font-bold text-[#171316]">{roleLabel}</p>
                  <p className="text-[11px] text-[#75686C]">{user?.full_name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuSheet(false)}
                  aria-label="মেনু বন্ধ করুন"
                  className="min-h-[40px] min-w-[40px] rounded-xl bg-white border border-[#E7E1E3] flex items-center justify-center text-[#241A1D]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {items.map((item) => {
                    const active = item.id === activeTab;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onTabChange(item.id);
                          setMobileMenuSheet(false);
                        }}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left min-h-[48px] cursor-pointer ${
                          active
                            ? 'bg-[#FFF1F3] border-[#B5122A] text-[#B5122A] font-semibold'
                            : 'bg-white border-[#E7E1E3] text-[#241A1D]'
                        }`}
                      >
                        <span className="shrink-0 text-[#B5122A]">{item.icon}</span>
                        <span className="text-xs leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-[#E7E1E3] grid grid-cols-2 gap-2.5">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuSheet(false)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#E7E1E3] text-xs font-semibold text-[#241A1D]"
                  >
                    <Home className="w-4 h-4 text-[#B5122A]" />
                    <span>মূল ওয়েবসাইট</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#B5122A] text-white text-xs font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>লগআউট</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
