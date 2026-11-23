import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Footer: React.FC = () => {
  const { siteSettings } = useAuth();

  return (
    <footer className="bg-gradient-to-b from-[#171316] to-[#100D0F] text-white border-t border-[#7F1023]/40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <img
              src={siteSettings.site_logo}
              alt={siteSettings.site_name}
              className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shrink-0"
            />
            <div>
              <p className="font-display text-lg font-extrabold leading-tight tracking-tight">
                {siteSettings.site_name}
              </p>
              <p className="text-xs text-[#F0445E]">{siteSettings.site_tagline}</p>
            </div>
          </div>
          <p className="text-sm text-white/75 leading-relaxed">
            রক্তের অভাবে যেন থেমে না যায় কোনো প্রাণ। যাচাইকৃত রক্তদাতা ও রোগীর পরিবারের মধ্যে দ্রুত ও নিরাপদ সেতুবন্ধন।
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-display text-sm font-semibold text-white mb-3">দ্রুত লিংক</h3>
          <ul className="space-y-2 text-sm text-white/75">
            <li><Link to="/donors" className="hover:text-[#F0445E] transition-colors">রক্তদাতা খুঁজুন</Link></li>
            <li><Link to="/request-blood" className="hover:text-[#F0445E] transition-colors">রক্তের অনুরোধ করুন</Link></li>
            <li><Link to="/emergency" className="hover:text-[#F0445E] transition-colors">জরুরি রক্তের প্রয়োজন</Link></li>
            <li><Link to="/campaigns" className="hover:text-[#F0445E] transition-colors">রক্তদান ক্যাম্পেইন</Link></li>
            <li><Link to="/compatibility" className="hover:text-[#F0445E] transition-colors">রক্তের গ্রুপ নির্দেশিকা</Link></li>
          </ul>
        </div>

        {/* Resources & Legal */}
        <div>
          <h3 className="font-display text-sm font-semibold text-white mb-3">তথ্য ও নীতিমালা</h3>
          <ul className="space-y-2 text-sm text-white/75">
            <li><Link to="/about" className="hover:text-[#F0445E] transition-colors">আমাদের সম্পর্কে</Link></li>
            <li><Link to="/blog" className="hover:text-[#F0445E] transition-colors">সচেতনতা ব্লগ</Link></li>
            <li><Link to="/faq" className="hover:text-[#F0445E] transition-colors">সচরাচর জিজ্ঞাসা</Link></li>
            <li><Link to="/privacy" className="hover:text-[#F0445E] transition-colors">গোপনীয়তা নীতিমালা</Link></li>
            <li><Link to="/terms" className="hover:text-[#F0445E] transition-colors">ব্যবহারের শর্তাবলি</Link></li>
          </ul>
        </div>

        {/* Helpline */}
        <div className="bg-[#7F1023]/30 border border-[#B5122A]/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-[#F0445E] text-sm font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>নিরাপত্তা ও সহায়তা</span>
          </div>
          <div className="space-y-1.5 text-sm text-white/85">
            <p className="flex items-center gap-2 tabular-nums">
              <Phone className="w-4 h-4 text-[#F0445E] shrink-0" />
              <span>{siteSettings.contact_phone}</span>
            </p>
            <p className="flex items-center gap-2 break-all">
              <Mail className="w-4 h-4 text-[#F0445E] shrink-0" />
              <span>{siteSettings.contact_email}</span>
            </p>
            {siteSettings.contact_address && (
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F0445E] shrink-0" />
                <span>{siteSettings.contact_address}</span>
              </p>
            )}
          </div>
          <Link
            to="/contact"
            className="inline-block w-full text-center py-2 px-3 text-xs font-semibold bg-[#B5122A] hover:bg-[#D61F3C] text-white rounded-lg transition-colors"
          >
            যোগাযোগ করুন
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/60">
          <p>© ২০২৬ {siteSettings.site_name}। সর্বস্বত্ব সংরক্ষিত।</p>
          <p>{siteSettings.site_tagline} · নিরাপদ ও স্বেচ্ছাসেবী রক্তদান নেটওয়ার্ক</p>
        </div>
      </div>
    </footer>
  );
};
