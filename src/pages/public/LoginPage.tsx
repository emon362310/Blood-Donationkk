import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, LogIn, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageTransition } from '../../components/ui/MotionPrimitives';
import type { User } from '../../types';

export const LoginPage: React.FC = () => {
  const { loginWithToken, dashboardPathForRole, needsSuperAdminSetup, refreshAuth, siteSettings } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successAnim, setSuccessAnim] = useState(false);

  // First-run Super Admin Setup form state
  const [saName, setSaName] = useState('সুপার অ্যাডমিন');
  const [saEmail, setSaEmail] = useState('');
  const [saPhone, setSaPhone] = useState('');
  const [saPass, setSaPass] = useState('');
  const [saPasscode, setSaPasscode] = useState('');
  const [saMsg, setSaMsg] = useState('');
  const [saLoading, setSaLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await apiRequest<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: { identifier, password, remember_me: rememberMe }
    });
    setLoading(false);
    if (!res.success || !res.data) {
      setError(res.message);
      return;
    }
    setSuccessAnim(true);
    await loginWithToken(res.data.token, res.data.user);
    setTimeout(() => {
      navigate(dashboardPathForRole(res.data!.user.role));
    }, 350);
  };

  const handleBootstrapSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaMsg('');
    setSaLoading(true);
    const res = await apiRequest<{ token: string; user: User }>('/api/auth/bootstrap-super-admin', {
      method: 'POST',
      body: {
        full_name: saName,
        email: saEmail,
        phone: saPhone,
        password: saPass,
        passcode: saPasscode
      }
    });
    setSaLoading(false);
    if (!res.success || !res.data) {
      setSaMsg(res.message);
      return;
    }
    await loginWithToken(res.data.token, res.data.user);
    await refreshAuth();
    navigate('/dashboard/super-admin');
  };

  return (
    <PageTransition className="min-h-[82vh] bg-gradient-to-br from-[#FFF1F3] via-white to-[#FCE4E8] py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${needsSuperAdminSetup ? 'lg:col-span-6' : 'lg:col-span-12 max-w-md mx-auto w-full'} bg-white border border-[#E7E1E3] rounded-2xl shadow-lg overflow-hidden`}
        >
          <div className="bg-gradient-to-r from-[#171316] via-[#7F1023] to-[#B5122A] p-6 text-white">
            <img
              src={siteSettings.site_logo}
              alt={siteSettings.site_name}
              className="w-12 h-12 rounded-xl object-contain bg-white p-1 mb-3 shadow-sm"
            />
            <h1 className="font-display text-2xl font-bold">{siteSettings.site_name} লগইন</h1>
            <p className="text-xs text-white/80 mt-1">
              আপনার নিবন্ধিত মোবাইল নম্বর অথবা ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#241A1D] mb-1.5">
                মোবাইল নম্বর অথবা ইমেইল
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="01XXXXXXXXX অথবা email@example.com"
                className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A1D] mb-1.5">পাসওয়ার্ড</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="আপনার পাসওয়ার্ড"
                  className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:border-[#B5122A] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75686C] hover:text-[#B5122A] cursor-pointer"
                  aria-label="পাসওয়ার্ড দেখুন বা লুকান"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-[#241A1D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#B5122A] rounded"
                />
                <span>আমাকে মনে রাখুন</span>
              </label>
              <Link to="/forgot-password" className="font-semibold text-[#B5122A] hover:underline">
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-medium text-[#B5122A] bg-[#FFF1F3] border border-[#B5122A]/25 rounded-lg p-2.5"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || successAnim}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-gradient-to-r from-[#7F1023] via-[#B5122A] to-[#D61F3C] rounded-xl shadow-sm hover:brightness-110 transition-all disabled:opacity-70 cursor-pointer"
            >
              {successAnim ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>সফল! ড্যাশবোর্ডে নেওয়া হচ্ছে...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-[#75686C] pt-2">
              নতুন ব্যবহারকারী?{' '}
              <Link to="/register" className="font-semibold text-[#B5122A] hover:underline">
                নিবন্ধন করুন
              </Link>
            </p>
          </form>
        </motion.div>

        {/* First-Run Super Admin Setup (Only shown when zero Super Admins exist) */}
        {needsSuperAdminSetup && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-6 bg-white border border-[#B5122A]/35 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="bg-[#FFF1F3] border-b border-[#B5122A]/20 p-5 flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#B5122A] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-[#7F1023]">
                  প্রথমবার সুপার অ্যাডমিন সেটআপ
                </h2>
                <p className="text-xs text-[#75686C]">
                  প্ল্যাটফর্মের প্রধান অ্যাডমিন অ্যাকাউন্ট তৈরি করুন (পাসওয়ার্ড হার্ডকোড করা নেই)
                </p>
              </div>
            </div>

            <form onSubmit={handleBootstrapSuperAdmin} className="p-5 space-y-3">
              <input
                type="text"
                required
                value={saName}
                onChange={(e) => setSaName(e.target.value)}
                placeholder="সুপার অ্যাডমিনের নাম"
                className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  required
                  value={saEmail}
                  onChange={(e) => setSaEmail(e.target.value)}
                  placeholder="অ্যাডমিন ইমেইল"
                  className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
                />
                <input
                  type="text"
                  required
                  value={saPhone}
                  onChange={(e) => setSaPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
                />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={saPass}
                onChange={(e) => setSaPass(e.target.value)}
                placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
              />
              <input
                type="password"
                value={saPasscode}
                onChange={(e) => setSaPasscode(e.target.value)}
                placeholder="পরিবেশ পাসকোড (যদি সেট করা থাকে, নতুবা ফাঁকা রাখুন)"
                className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
              />
              {saMsg && <p className="text-xs text-[#B5122A] font-medium">{saMsg}</p>}
              <button
                type="submit"
                disabled={saLoading}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#171316] hover:bg-[#7F1023] rounded-xl transition-colors cursor-pointer"
              >
                {saLoading ? 'তৈরি হচ্ছে...' : 'সুপার অ্যাডমিন অ্যাকাউন্ট তৈরি করুন'}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};
