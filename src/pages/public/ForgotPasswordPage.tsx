import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { PageTransition } from '../../components/ui/MotionPrimitives';

export const ForgotPasswordPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [reason, setReason] = useState('');
  const [refCode, setRefCode] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await apiRequest<{ reference_code: string }>('/api/auth/request-password-reset', {
      method: 'POST',
      body: { identifier, reason }
    });
    setLoading(false);
    setMsg(res.message);
    if (res.success && res.data?.reference_code) {
      setRefCode(res.data.reference_code);
    }
  };

  return (
    <PageTransition className="min-h-[75vh] bg-[#FFF1F3] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E7E1E3] rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#7F1023] to-[#B5122A] p-6 text-white">
          <KeyRound className="w-7 h-7 mb-2" />
          <h1 className="font-display text-xl font-bold">নিরাপদ পাসওয়ার্ড পুনরুদ্ধার</h1>
          <p className="text-xs text-white/85 mt-1">
            OTP ছাড়াই অ্যাডমিন-সহায়তাপ্রাপ্ত যাচাইয়ের মাধ্যমে পাসওয়ার্ড রিসেটের আবেদন করুন
          </p>
        </div>

        <div className="p-6">
          {refCode ? (
            <div className="text-center space-y-3 py-2">
              <CheckCircle2 className="w-10 h-10 text-[#B5122A] mx-auto" />
              <p className="text-sm font-semibold text-[#241A1D]">{msg}</p>
              <div className="bg-[#FFF1F3] border border-[#B5122A]/30 rounded-xl p-3">
                <p className="text-xs text-[#75686C]">আপনার রেফারেন্স কোড</p>
                <p className="font-mono-num text-lg font-bold text-[#B5122A] mt-0.5">{refCode}</p>
              </div>
              <Link
                to="/login"
                className="inline-block px-5 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg"
              >
                লগইন পেজে ফিরুন
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">নিবন্ধিত মোবাইল নম্বর অথবা ইমেইল *</label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="01XXXXXXXXX অথবা email@example.com"
                  className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">অতিরিক্ত যাচাই তথ্য (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="আপনার জেলা বা সর্বশেষ রক্তদানের তথ্য উল্লেখ করতে পারেন"
                  className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
                />
              </div>
              {msg && <p className="text-xs text-[#B5122A]">{msg}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl cursor-pointer"
              >
                {loading ? 'জমা হচ্ছে...' : 'পাসওয়ার্ড রিসেট আবেদন পাঠান'}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
