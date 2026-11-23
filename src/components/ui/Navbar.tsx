import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Droplet, ArrowLeft, LogOut, LayoutDashboard, UserPlus, LogIn, Download, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const NAV_LINKS = [
  { to: '/', label: 'হোম' },
  { to: '/donors', label: 'রক্তদাতা খুঁজুন' },
  { to: '/requests', label: 'রক্তের অনুরোধ' },
  { to: '/campaigns', label: 'ক্যাম্পেইন' },
  { to: '/about', label: 'আমাদের সম্পর্কে' },
  { to: '/contact', label: 'যোগাযোগ' }
];

export const Navbar: React.FC = () => {
  const { user, logout, dashboardPathForRole, siteSettings } = useAuth();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7E1E3] no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-3">
        {/* Zone 1: Back Button (on inner pages) + Brand App Wordmark */}
        <div className="flex items-center gap-2 min-w-0">
          {!isHome && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="পিছনে যান"
              className="w-9 h-9 rounded-xl border border-[#E7E1E3] bg-[#FFF8F9] text-[#241A1D] hover:text-[#B5122A] hover:border-[#B5122A]/40 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Link
            to="/"
            className="flex items-center gap-2 text-[#171316] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B5122A] rounded-lg"
          >
            <img
              src={siteSettings.site_logo}
              alt={siteSettings.site_name}
              className="w-9 h-9 rounded-xl object-contain bg-white border border-[#E7E1E3] p-0.5 shadow-xs shrink-0"
            />
            <div className="leading-none">
              <span className="font-display text-base sm:text-lg font-extrabold tracking-tight text-[#171316] block">
                {siteSettings.site_name}
              </span>
              <span className="text-[10px] font-medium text-[#B5122A] hidden sm:block">
                {siteSettings.site_tagline}
              </span>
            </div>
          </Link>
        </div>

        {/* Zone 2: Clean Single-Line Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-5" aria-label="প্রধান মেনু">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative py-4 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive ? 'text-[#B5122A]' : 'text-[#241A1D] hover:text-[#B5122A]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="rb-nav-underline"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#B5122A] rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Quick App Actions (Install + Emergency + Auth/Dashboard) */}
        <div className="flex items-center gap-2 shrink-0">
          {isInstallable && !isInstalled && (
            <button
              type="button"
              onClick={install}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#7F1023] bg-[#FFF1F3] border border-[#B5122A]/30 hover:bg-[#FCE4E8] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">অ্যাপ ইনস্টল</span>
              <span className="sm:hidden">ইনস্টল</span>
            </button>
          )}

          <Link
            to="/emergency"
            className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#B5122A] bg-[#FFF1F3] border border-[#B5122A]/25 rounded-xl whitespace-nowrap shrink-0"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>জরুরি</span>
          </Link>

          {user ? (
            <>
              <Link
                to={dashboardPathForRole(user.role)}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] via-[#B5122A] to-[#D61F3C] rounded-xl shadow-sm hover:brightness-110 transition-all whitespace-nowrap shrink-0"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>ড্যাশবোর্ড</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="লগআউট"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#75686C] hover:text-[#B5122A] border border-[#E7E1E3] rounded-xl hover:border-[#B5122A]/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>লগআউট</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold text-[#B5122A] border border-[#B5122A]/35 bg-[#FFF1F3] hover:bg-[#FCE4E8] rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>লগইন</span>
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] via-[#B5122A] to-[#D61F3C] rounded-xl shadow-sm hover:brightness-110 transition-all whitespace-nowrap shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>নিবন্ধন</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
