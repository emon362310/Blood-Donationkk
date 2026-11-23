import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, Mail, MapPin, Send, ChevronDown } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { PageTransition } from '../../components/ui/MotionPrimitives';
import { useAuth } from '../../context/AuthContext';

export const AboutPage: React.FC = () => {
  const { siteSettings } = useAuth();
  return (
    <PageTransition className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="rounded-2xl overflow-hidden border border-[#E7E1E3] bg-white shadow-sm">
        <div className="relative h-56 sm:h-72 bg-[#171316]">
          <img
            src="/src/assets/images/about_humanity_care_1795424733401.jpg"
            alt={`${siteSettings.site_name} মিশন`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#100D0F]/90 via-[#7F1023]/40 to-transparent flex items-end p-6">
            <div className="text-white">
              <h1 className="font-display text-2xl sm:text-3xl font-bold">{siteSettings.site_name} সম্পর্কে</h1>
              <p className="text-xs sm:text-sm text-white/85 mt-1">
                স্বচ্ছতা, গোপনীয়তা ও যাচাইকৃত স্বেচ্ছাসেবী নেটওয়ার্কের মাধ্যমে জীবনরক্ষা
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4 text-sm text-[#241A1D] leading-relaxed">
          <p>
            <strong>{siteSettings.site_name}</strong> ({siteSettings.site_tagline}) বাংলাদেশের জেলা, উপজেলা ও ইউনিয়ন পর্যায়ে যাচাইকৃত স্বেচ্ছাসেবী রক্তদাতাদের সাথে জরুরি রক্তের প্রয়োজন থাকা রোগীর পরিবারের নিরাপদ সেতুবন্ধন তৈরির একটি পূর্ণাঙ্গ প্ল্যাটফর্ম।
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {[
              { t: 'অ্যাডমিন ও প্রতিনিধি যাচাই', d: 'ফোনে কথা বলে তথ্য নিশ্চিত না করে কোনো ডোনার প্রোফাইল পাবলিক করা হয় না।' },
              { t: 'গোপনীয়তা সুরক্ষা', d: 'ডোনারের সম্মতি ছাড়া ফোন নম্বর প্রদর্শিত হয় না; যোগাযোগ অনুরোধ ব্যবস্থা সক্রিয় থাকে।' },
              { t: 'এলাকাভিত্তিক সমন্বয়', d: 'প্রতিটি জেলা ও উপজেলায় নির্ধারিত প্রতিনিধি দ্রুত স্থানীয় রক্তের অনুরোধে সহায়তা করেন।' }
            ].map((c) => (
              <div key={c.t} className="bg-[#FFF1F3] border border-[#B5122A]/20 rounded-xl p-4 space-y-1.5">
                <ShieldCheck className="w-5 h-5 text-[#B5122A]" />
                <h2 className="font-display text-base font-bold text-[#7F1023]">{c.t}</h2>
                <p className="text-xs text-[#75686C]">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export const FaqPage: React.FC = () => {
  const { siteSettings } = useAuth();
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    { q: `${siteSettings.site_name}-এ নিবন্ধন করতে কি OTP লাগে?`, a: 'না, আমাদের সিস্টেমে কোনো OTP ব্যবহার করা হয় না। আপনি আপনার মোবাইল নম্বর বা ইমেইল এবং পাসওয়ার্ড দিয়ে সরাসরি নিবন্ধন ও লগইন করতে পারবেন।' },
    { q: 'ডোনার হিসেবে অনুমোদন পেতে কত সময় লাগে?', a: 'নিবন্ধনের পর আপনার এলাকার প্রতিনিধি বা অ্যাডমিন ফোনে যোগাযোগ করে তথ্য যাচাই করেন এবং অনুমোদন প্রদান করেন।' },
    { q: 'পাসওয়ার্ড ভুলে গেলে কী করব?', a: 'পাসওয়ার্ড ভুলে গেলে Forgot Password পেজ থেকে আবেদন করলে একটি রেফারেন্স কোড পাবেন এবং অ্যাডমিন-সহায়তায় পাসওয়ার্ড রিসেট করা হবে।' },
    { q: 'একটি এলাকায় কি একাধিক প্রতিনিধি থাকতে পারেন?', a: 'হ্যাঁ, সুপার অ্যাডমিন একই জেলা বা উপজেলায় একাধিক প্রতিনিধি নিয়োগ ও দায়িত্ব বণ্টন করতে পারেন।' }
  ];
  return (
    <PageTransition className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <div className="bg-gradient-to-r from-[#7F1023] to-[#B5122A] rounded-2xl p-6 text-white">
        <h1 className="font-display text-2xl font-bold">সচরাচর জিজ্ঞাসা (FAQ)</h1>
      </div>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={it.q} className="bg-white border border-[#E7E1E3] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-semibold text-[#241A1D] cursor-pointer"
            >
              <span>{it.q}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${open === i ? 'rotate-180 text-[#B5122A]' : ''}`} />
            </button>
            {open === i && <p className="px-5 pb-4 text-xs text-[#75686C] border-t border-[#F5F5F6] pt-3">{it.a}</p>}
          </div>
        ))}
      </div>
    </PageTransition>
  );
};

export const ContactPage: React.FC = () => {
  const { siteSettings } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/contact', {
      method: 'POST',
      body: { name, email, subject, message }
    });
    setStatus(res.message);
    if (res.success) {
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }
  };

  return (
    <PageTransition className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-5 bg-gradient-to-br from-[#171316] to-[#7F1023] text-white rounded-2xl p-6 space-y-5">
        <h1 className="font-display text-2xl font-bold">যোগাযোগ করুন</h1>
        <p className="text-xs text-white/80">জরুরি রক্তের সমন্বয়, প্রতিনিধি আবেদন বা যেকোনো সহায়তার জন্য বার্তা পাঠান।</p>
        <div className="space-y-3 text-sm">
          <p className="flex items-center gap-2.5 tabular-nums"><Phone className="w-4 h-4 text-[#F0445E]" /> {siteSettings.contact_phone}</p>
          <p className="flex items-center gap-2.5 break-all"><Mail className="w-4 h-4 text-[#F0445E]" /> {siteSettings.contact_email}</p>
          <p className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-[#F0445E]" /> {siteSettings.contact_address || 'ঢাকা, বাংলাদেশ'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="md:col-span-7 bg-white border border-[#E7E1E3] rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম *" className="rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]" />
          <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="মোবাইল বা ইমেইল *" className="rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]" />
        </div>
        <input type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="বিষয় *" className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]" />
        <textarea rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="আপনার বার্তা লিখুন *" className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]" />
        {status && <p className="text-xs font-semibold text-[#B5122A] bg-[#FFF1F3] p-2.5 rounded-lg">{status}</p>}
        <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl cursor-pointer">
          <Send className="w-3.5 h-3.5" />
          <span>বার্তা পাঠান</span>
        </button>
      </form>
    </PageTransition>
  );
};

export const PrivacyPage: React.FC = () => {
  const { siteSettings } = useAuth();
  return (
    <PageTransition className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white border border-[#E7E1E3] rounded-2xl p-6 space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#7F1023]">গোপনীয়তা নীতিমালা</h1>
        <p className="text-sm text-[#241A1D] leading-relaxed">
          {siteSettings.site_name} ব্যবহারকারীদের ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা নিশ্চিত করে। পাসওয়ার্ডসমূহ সল্টেড ক্রিপ্টোগ্রাফিক হ্যাশিং পদ্ধতিতে সংরক্ষিত হয়। ডোনারের সুস্পষ্ট সম্মতি ছাড়া মোবাইল নম্বর পাবলিক ডিরেক্টরিতে প্রকাশ করা হয় না।
        </p>
        <p className="text-sm text-[#241A1D] leading-relaxed">
          এলাকা প্রতিনিধিরা শুধুমাত্র তাদের নির্ধারিত ভৌগোলিক এলাকার ডেটা যাচাইয়ের কাজে ব্যবহার করতে পারেন এবং কোনো ব্যক্তিগত তথ্য বাণিজ্যিক উদ্দেশ্যে ব্যবহার সম্পূর্ণ নিষিদ্ধ।
        </p>
      </div>
    </PageTransition>
  );
};

export const TermsPage: React.FC = () => {
  const { siteSettings } = useAuth();
  return (
    <PageTransition className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white border border-[#E7E1E3] rounded-2xl p-6 space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#7F1023]">ব্যবহারের শর্তাবলি</h1>
        <p className="text-sm text-[#241A1D] leading-relaxed">
          {siteSettings.site_name} একটি সম্পূর্ণ স্বেচ্ছাসেবী ও অলাভজনক রক্তদান সমন্বয় প্ল্যাটফর্ম। রক্তের বিনিময়ে কোনো ধরনের আর্থিক লেনদেন সম্পূর্ণ নিষিদ্ধ। ভুয়া তথ্য বা অপব্যবহারের প্রমাণ পাওয়া গেলে অ্যাকাউন্ট স্থায়ীভাবে স্থগিত করা হবে।
        </p>
      </div>
    </PageTransition>
  );
};

export const NotFoundPage: React.FC = () => (
  <PageTransition className="min-h-[70vh] flex items-center justify-center p-6 text-center">
    <div className="max-w-md space-y-4">
      <p className="font-mono-num text-5xl font-bold text-[#B5122A]">৪০৪</p>
      <h1 className="font-display text-2xl font-bold text-[#171316]">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</h1>
      <p className="text-xs text-[#75686C]">আপনি যে লিংকটি খুঁজছেন তা সরানো হয়েছে বা সঠিক নয়।</p>
      <Link to="/" className="inline-block px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl">
        হোমপেজে ফিরে যান
      </Link>
    </div>
  </PageTransition>
);
