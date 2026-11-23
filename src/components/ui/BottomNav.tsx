import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Home, Search, Droplet, LayoutDashboard, LayoutGrid, LogIn,
  AlertTriangle, Calendar, BookOpen, GitCompare, Info, HelpCircle,
  Phone, Shield, FileText, X, UserPlus, ClipboardList, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, dashboardPathForRole, logout, siteSettings } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  const accountPath = user ? dashboardPathForRole(user.role) : '/login';
  const accountLabel = user ? 'ড্যাশবোর্ড' : 'লগইন';

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { to: '/', label: 'হোম', icon: Home },
    { to: '/donors', label: 'রক্তদাতা', icon: Search },
    { to: '/request-blood', label: 'রক্ত চান', icon: Droplet, isCenterCta: true },
    { to: accountPath, label: accountLabel, icon: user ? LayoutDashboard : LogIn }
  ];

  const appMenuLinks = [
    { to: '/emergency', label: 'জরুরি অনুরোধ', icon: AlertTriangle, highlight: true },
    { to: '/requests', label: 'অনুরোধ তালিকা', icon: ClipboardList },
    { to: '/campaigns', label: 'ক্যাম্পেইন', icon: Calendar },
    { to: '/compatibility', label: 'গ্রুপ নির্দেশিকা', icon: GitCompare },
    { to: '/blog', label: 'সচেতনতা ব্লগ', icon: BookOpen },
    { to: '/about', label: 'আমাদের সম্পর্কে', icon: Info },
    { to: '/faq', label: 'সচরাচর জিজ্ঞাসা', icon: HelpCircle },
    { to: '/contact', label: 'যোগাযোগ', icon: Phone },
    { to: '/privacy', label: 'গোপনীয়তা নীতি', icon: Shield },
    { to: '/terms', label: 'শর্তাবলি', icon: FileText }
  ];

  const handleGo = (to: string) => {
    setSheetOpen(false);
    navigate(to);
  };

  return (
    <>
      {/* Fixed Web App Bottom Navigation Bar (Mobile edge-to-edge, Desktop floating Blood Red/Charcoal Dock) */}
      <nav
        aria-label="অ্যাপ নেভিগেশন"
        className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:w-[540px] md:max-w-[calc(100vw-2rem)] z-40 no-print"
      >
        <div className="bg-white/95 md:bg-[#171316]/95 backdrop-blur-md border-t border-[#E7E1E3] md:border md:border-[#7F1023]/50 md:rounded-2xl shadow-[0_-6px_24px_rgba(127,16,35,0.10)] md:shadow-[0_14px_40px_rgba(16,13,15,0.35)] px-2 pb-[env(safe-area-inset-bottom)]">
          <div className="grid grid-cols-5 items-center h-[60px]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);

              if (item.isCenterCta) {
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex flex-col items-center justify-center min-h-[44px] -mt-4 group"
                  >
                    <motion.span
                      whileTap={{ scale: 0.92 }}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                        active
                          ? 'bg-gradient-to-br from-[#F0445E] to-[#B5122A] ring-4 ring-[#FCE4E8] md:ring-[#7F1023]/60'
                          : 'bg-gradient-to-br from-[#7F1023] via-[#B5122A] to-[#D61F3C] group-hover:brightness-110 ring-4 ring-white md:ring-[#171316]'
                      } text-white`}
                    >
                      <Icon className="w-5 h-5 fill-white" />
                    </motion.span>
                    <span
                      className={`text-[10px] font-semibold mt-1 tracking-tight whitespace-nowrap ${
                        active ? 'text-[#B5122A] md:text-[#F0445E]' : 'text-[#241A1D] md:text-white/85'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="relative flex flex-col items-center justify-center min-h-[44px] py-1 rounded-xl transition-colors"
                >
                  {active && (
                    <motion.span
                      layoutId="rb-bottom-active"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-x-2 inset-y-1 rounded-xl bg-[#FFF1F3] md:bg-[#B5122A]/25"
                    />
                  )}
                  <Icon
                    className={`relative z-10 w-5 h-5 transition-colors ${
                      active
                        ? 'text-[#B5122A] md:text-[#F0445E]'
                        : 'text-[#75686C] md:text-white/70'
                    }`}
                  />
                  <span
                    className={`relative z-10 text-[10px] font-semibold mt-0.5 tracking-tight whitespace-nowrap ${
                      active
                        ? 'text-[#B5122A] md:text-white'
                        : 'text-[#75686C] md:text-white/70'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* 5th Button: More / App Menu Sheet */}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="relative flex flex-col items-center justify-center min-h-[44px] py-1 rounded-xl cursor-pointer transition-colors"
            >
              <LayoutGrid
                className={`w-5 h-5 ${
                  sheetOpen ? 'text-[#B5122A] md:text-[#F0445E]' : 'text-[#75686C] md:text-white/70'
                }`}
              />
              <span
                className={`text-[10px] font-semibold mt-0.5 tracking-tight whitespace-nowrap ${
                  sheetOpen ? 'text-[#B5122A] md:text-white' : 'text-[#75686C] md:text-white/70'
                }`}
              >
                আরও মেনু
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-Up Web App Menu Bottom Sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center no-print">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 bg-black/55 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative z-10 w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl border border-[#E7E1E3] shadow-2xl overflow-hidden max-h-[82vh] flex flex-col"
            >
              {/* Drag Handle */}
              <div className="pt-3 pb-1 flex justify-center md:hidden">
                <span className="w-10 h-1.5 rounded-full bg-[#E7E1E3]" />
              </div>

              <div className="px-5 py-3.5 border-b border-[#E7E1E3] flex items-center justify-between bg-gradient-to-r from-[#FFF1F3] to-white">
                <div className="flex items-center gap-2.5">
                  <img
                    src={siteSettings.site_logo}
                    alt={siteSettings.site_name}
                    className="w-9 h-9 rounded-xl object-contain bg-white border border-[#E7E1E3] p-0.5 shrink-0"
                  />
                  <div>
                    <p className="font-display text-base font-extrabold text-[#171316]">
                      {siteSettings.site_name} অ্যাপ মেনু
                    </p>
                    <p className="text-[11px] text-[#75686C]">সব সেবা ও পেজে দ্রুত যান</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="মেনু বন্ধ করুন"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-[#E7E1E3] text-[#241A1D] hover:bg-[#FFF1F3] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-4">
                {/* Auth Quick Strip */}
                {user ? (
                  <div className="bg-gradient-to-r from-[#171316] to-[#7F1023] text-white rounded-2xl p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{user.full_name}</p>
                      <p className="text-[11px] text-[#FCE4E8]">{user.role}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleGo(dashboardPathForRole(user.role))}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#B5122A] hover:bg-[#D61F3C] rounded-lg cursor-pointer"
                      >
                        ড্যাশবোর্ড
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await logout();
                          setSheetOpen(false);
                          navigate('/');
                        }}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
                        aria-label="লগআউট"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleGo('/login')}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-[#B5122A] bg-[#FFF1F3] border border-[#B5122A]/30 rounded-xl cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>লগইন করুন</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGo('/register')}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>ডোনার নিবন্ধন</span>
                    </button>
                  </div>
                )}

                {/* App Grid Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {appMenuLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.to);
                    return (
                      <button
                        key={link.to}
                        type="button"
                        onClick={() => handleGo(link.to)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[48px] ${
                          link.highlight
                            ? 'bg-[#FFF1F3] border-[#B5122A]/40 text-[#B5122A] font-semibold'
                            : active
                            ? 'bg-[#FCE4E8] border-[#B5122A]/40 text-[#7F1023] font-semibold'
                            : 'bg-white border-[#E7E1E3] text-[#241A1D] hover:border-[#B5122A]/35'
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            link.highlight || active
                              ? 'bg-[#B5122A] text-white'
                              : 'bg-[#FFF1F3] text-[#B5122A]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="text-xs font-medium leading-tight">{link.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
