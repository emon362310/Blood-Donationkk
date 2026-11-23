import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Droplet, Search, Users, ShieldCheck, Activity, Calendar,
  ArrowRight, HeartHandshake, ClipboardCheck, PhoneCall, ChevronDown
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_GROUPS, BD_LOCATIONS } from '../../data/bdLocations';
import {
  PageTransition, StaggerGrid, StaggerCard, AnimatedCounter, HeartbeatEmblem
} from '../../components/ui/MotionPrimitives';
import { DonorPosterSlider } from '../../components/ui/DonorPosterSlider';
import { DonorCard } from '../../components/ui/DonorCard';
import { RequestCard } from '../../components/ui/RequestCard';
import { ContactRequestModal } from '../../components/ui/ContactRequestModal';
import type { Donor, BloodRequest, Campaign, BlogPost, DonorPoster } from '../../types';

interface OverviewData {
  stats: {
    total_donors: number;
    approved_donors: number;
    completed_donations: number;
    active_requests: number;
  };
  approved_donors?: Donor[];
  recent_donors: Donor[];
  group_counts?: Record<string, number>;
  emergency_requests: BloodRequest[];
  posters?: DonorPoster[];
  campaigns: Campaign[];
  blogs: BlogPost[];
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, donor: myDonorProfile, siteSettings } = useAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeGroupTab, setActiveGroupTab] = useState<string>('ALL');

  // Quick Search State
  const [searchBg, setSearchBg] = useState('');
  const [searchDiv, setSearchDiv] = useState('');
  const [searchDist, setSearchDist] = useState('');

  useEffect(() => {
    apiRequest<OverviewData>('/api/public/overview').then((res) => {
      if (res.success && res.data) setData(res.data);
    });
  }, []);

  const districts = BD_LOCATIONS.find((d) => d.division === searchDiv)?.districts || [];

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchBg) params.set('blood_group', searchBg);
    if (searchDiv) params.set('division', searchDiv);
    if (searchDist) params.set('district', searchDist);
    navigate(`/donors?${params.toString()}`);
  };

  const faqs = [
    {
      q: `${siteSettings.site_name}-এ নিবন্ধিত ডোনারদের তথ্য কি যাচাই করা হয়?`,
      a: 'হ্যাঁ। প্রতিটি নতুন ডোনার প্রোফাইল অ্যাডমিন ও এলাকা প্রতিনিধির মাধ্যমে ফোনে যোগাযোগ করে যাচাই করার পরই পাবলিক ডিরেক্টরিতে অনুমোদিত হয়।'
    },
    {
      q: 'আমার মোবাইল নম্বর কি সবার কাছে উন্মুক্ত থাকবে?',
      a: 'না, আপনার অনুমতি ছাড়া মোবাইল নম্বর কখনোই পাবলিক করা হয় না। আপনি চাইলে নম্বর প্রাইভেট রেখে শুধুমাত্র যোগাযোগ অনুরোধের মাধ্যমে সম্মতি দিতে পারেন।'
    },
    {
      q: 'কত দিন পরপর রক্তদান করা নিরাপদ?',
      a: 'একজন সুস্থ প্রাপ্তবয়স্ক মানুষ প্রতি ১২০ দিন (৪ মাস) পরপর নিরাপদে এক ব্যাগ রক্তদান করতে পারেন।'
    }
  ];

  return (
    <PageTransition>
      {/* 1. HERO SECTION — Deep Blood Red & Crimson Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#100D0F] via-[#7F1023] to-[#B5122A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FCE4E8]">
              <HeartbeatEmblem className="text-[#F0445E]" />
              <span>{siteSettings.site_name} · {siteSettings.site_tagline}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-balance">
              {siteSettings.hero_title || 'রক্তের অভাবে যেন থেমে না যায় কোনো প্রাণ'}
            </h1>

            <p className="text-sm sm:text-base text-white/85 max-w-2xl leading-relaxed">
              {siteSettings.hero_subtitle ||
                'আপনার এক ব্যাগ রক্ত বাঁচাতে পারে একটি জীবন। রক্তদাতা খুঁজুন, রক্তদান করুন, মানুষের পাশে দাঁড়ান।'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/donors"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#7F1023] bg-white hover:bg-[#FFF1F3] rounded-xl shadow-md transition-all whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>রক্তদাতা খুঁজুন</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#D61F3C] to-[#F0445E] hover:brightness-110 border border-white/20 rounded-xl shadow-md transition-all whitespace-nowrap"
              >
                <Droplet className="w-4 h-4 fill-white" />
                <span>ডোনার হিসেবে যুক্ত হোন</span>
              </Link>
              <Link
                to="/request-blood"
                className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-white/95 hover:text-white border border-white/25 hover:bg-white/10 rounded-xl transition-all whitespace-nowrap"
              >
                <span>রক্তের অনুরোধ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[340px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#171316]">
            <img
              src="/src/assets/images/hero_blood_donation_1795424733544.jpg"
              alt={`${siteSettings.site_name} স্বেচ্ছাসেবী রক্তদান কেন্দ্র`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#100D0F]/85 via-[#100D0F]/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90">
              <span>যাচাইকৃত ডোনার · সরাসরি সমন্বয়</span>
              <span className="font-mono-num font-semibold text-[#F0445E]">২৪/৭ জরুরি সহায়তা</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DONOR ACHIEVEMENT POSTER SLIDER (DIRECTLY BELOW MAIN HERO SECTION) */}
      {siteSettings.show_poster_slider !== 'false' && (
        <DonorPosterSlider
          posters={data?.posters || []}
          title={siteSettings.poster_slider_title}
        />
      )}

      {/* 3. COMPACT 4-COLUMN STATISTICS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-7">
        <StaggerGrid className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'মোট ডোনার', value: data?.stats.total_donors || 0, icon: <Users className="w-4 h-4" />, sub: 'নিবন্ধিত সদস্য' },
            { label: 'অনুমোদিত ডোনার', value: data?.stats.approved_donors || 0, icon: <ShieldCheck className="w-4 h-4" />, sub: 'যাচাইকৃত ও সক্রিয়' },
            { label: 'সম্পন্ন রক্তদান', value: data?.stats.completed_donations || 0, icon: <Droplet className="w-4 h-4" />, sub: 'সফল জীবনরক্ষা' },
            { label: 'চলমান রক্তের অনুরোধ', value: data?.stats.active_requests || 0, icon: <Activity className="w-4 h-4" />, sub: 'সক্রিয় আবেদন' }
          ].map((stat) => (
            <StaggerCard
              key={stat.label}
              className="bg-white border border-[#E7E1E3] rounded-xl p-4 shadow-sm flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-xs font-medium text-[#75686C]">{stat.label}</p>
                <p className="font-display text-2xl sm:text-3xl font-bold text-[#171316] mt-1">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-[11px] text-[#B5122A] font-medium mt-0.5">{stat.sub}</p>
              </div>
              <span className="w-9 h-9 rounded-lg bg-[#FFF1F3] border border-[#B5122A]/20 flex items-center justify-center text-[#B5122A] shrink-0">
                {stat.icon}
              </span>
            </StaggerCard>
          ))}
        </StaggerGrid>
      </section>

      {/* 2.5 WEB APP QUICK ACTION BUTTONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <Link
            to="/donors"
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#E7E1E3] hover:border-[#B5122A]/45 shadow-2xs transition-all group"
          >
            <span className="w-9 h-9 rounded-xl bg-[#FFF1F3] text-[#B5122A] group-hover:bg-[#B5122A] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <Search className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#171316] truncate">ডোনার খুঁজুন</p>
              <p className="text-[11px] text-[#75686C] truncate">এলাকা ও গ্রুপ</p>
            </div>
          </Link>

          <Link
            to="/emergency"
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FFF1F3] border border-[#B5122A]/30 hover:border-[#B5122A] shadow-2xs transition-all group"
          >
            <span className="w-9 h-9 rounded-xl bg-[#B5122A] text-white flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#7F1023] truncate">জরুরি অনুরোধ</p>
              <p className="text-[11px] text-[#B5122A] truncate">তাৎক্ষণিক প্রয়োজন</p>
            </div>
          </Link>

          <Link
            to="/compatibility"
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#E7E1E3] hover:border-[#B5122A]/45 shadow-2xs transition-all group"
          >
            <span className="w-9 h-9 rounded-xl bg-[#FFF1F3] text-[#B5122A] group-hover:bg-[#B5122A] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <Droplet className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#171316] truncate">গ্রুপ গাইড</p>
              <p className="text-[11px] text-[#75686C] truncate">রক্তের সামঞ্জস্যতা</p>
            </div>
          </Link>

          <Link
            to="/campaigns"
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#E7E1E3] hover:border-[#B5122A]/45 shadow-2xs transition-all group"
          >
            <span className="w-9 h-9 rounded-xl bg-[#FFF1F3] text-[#B5122A] group-hover:bg-[#B5122A] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <Calendar className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#171316] truncate">ক্যাম্পেইন</p>
              <p className="text-[11px] text-[#75686C] truncate">আসন্ন কর্মসূচি</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. QUICK DONOR SEARCH BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#171316]">
                দ্রুত রক্তদাতা অনুসন্ধান
              </h2>
              <p className="text-xs text-[#75686C]">রক্তের গ্রুপ ও আপনার এলাকা অনুযায়ী অনুমোদিত ডোনার খুঁজুন</p>
            </div>
            <Link to="/compatibility" className="text-xs font-semibold text-[#B5122A] hover:underline">
              রক্তের গ্রুপ সামঞ্জস্যতা দেখুন
            </Link>
          </div>

          <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={searchBg}
              onChange={(e) => setSearchBg(e.target.value)}
              className="w-full rounded-xl border border-[#E7E1E3] bg-[#FFF8F9] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
            >
              <option value="">সকল রক্তের গ্রুপ</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>

            <select
              value={searchDiv}
              onChange={(e) => {
                setSearchDiv(e.target.value);
                setSearchDist('');
              }}
              className="w-full rounded-xl border border-[#E7E1E3] bg-[#FFF8F9] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
            >
              <option value="">সকল বিভাগ</option>
              {BD_LOCATIONS.map((d) => (
                <option key={d.division} value={d.division}>{d.division}</option>
              ))}
            </select>

            <select
              value={searchDist}
              onChange={(e) => setSearchDist(e.target.value)}
              disabled={!searchDiv}
              className="w-full rounded-xl border border-[#E7E1E3] bg-[#FFF8F9] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A] disabled:opacity-60"
            >
              <option value="">সকল জেলা</option>
              {districts.map((dist) => (
                <option key={dist.district} value={dist.district}>{dist.district}</option>
              ))}
            </select>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl hover:brightness-110 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>খুঁজুন</span>
            </button>
          </form>
        </div>
      </section>

      {/* 4. EMERGENCY BLOOD REQUESTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#171316]">
              জরুরি রক্তের অনুরোধ
            </h2>
            <p className="text-xs text-[#75686C]">যাচাইকৃত চলমান জরুরি ও অতি-জরুরি আবেদনসমূহ</p>
          </div>
          <Link to="/emergency" className="text-xs font-semibold text-[#B5122A] hover:underline whitespace-nowrap">
            সকল জরুরি অনুরোধ →
          </Link>
        </div>

        {data?.emergency_requests && data.emergency_requests.length > 0 ? (
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.emergency_requests.map((req) => (
              <RequestCard key={req.request_id} request={req} />
            ))}
          </StaggerGrid>
        ) : (
          <div className="bg-[#FFF1F3] border border-[#B5122A]/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-display text-base font-bold text-[#7F1023]">
                বর্তমানে কোনো অমীমাংসিত জরুরি অনুরোধ প্রকাশিত নেই
              </p>
              <p className="text-xs text-[#75686C] mt-0.5">
                আপনার বা আপনার পরিচিত কারো জরুরি রক্তের প্রয়োজন হলে এখনই আবেদন করুন।
              </p>
            </div>
            <Link
              to="/request-blood"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg hover:bg-[#D61F3C] whitespace-nowrap"
            >
              জরুরি আবেদন করুন
            </Link>
          </div>
        )}
      </section>

      {/* 5. BLOOD GROUP-WISE DONOR SECTIONS (RED CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#171316]">
              রক্তের গ্রুপ অনুযায়ী রক্তদাতা
            </h2>
            <p className="text-xs text-[#75686C] mt-0.5">
              গ্রুপ অনুযায়ী আলাদা সেকশনে নিবন্ধিত ও যাচাইকৃত রক্তদাতাদের তালিকা
            </p>
          </div>
          <Link to="/donors" className="text-xs font-semibold text-[#B5122A] hover:underline whitespace-nowrap">
            বিস্তারিত ডোনার খুঁজুন →
          </Link>
        </div>

        {(() => {
          const publicDonors = data?.approved_donors || data?.recent_donors || [];
          const hasOwnPending =
            user &&
            myDonorProfile &&
            myDonorProfile.verification_status !== 'Approved' &&
            !publicDonors.some((d) => d.donor_id === myDonorProfile.donor_id);

          const ownPendingDonor: (Donor & { _isPendingPreview?: boolean }) | null = hasOwnPending
            ? {
                ...myDonorProfile,
                full_name: user.full_name,
                profile_image: user.profile_image,
                phone: user.phone,
                _isPendingPreview: true
              }
            : null;

          const combinedDonors: Array<Donor & { _isPendingPreview?: boolean }> = ownPendingDonor
            ? [ownPendingDonor, ...publicDonors]
            : publicDonors;

          const donorsByGroup: Record<string, Array<Donor & { _isPendingPreview?: boolean }>> = {};
          BLOOD_GROUPS.forEach((bg) => {
            donorsByGroup[bg] = combinedDonors.filter((d) => d.blood_group === bg);
          });

          const groupsToRender =
            activeGroupTab === 'ALL'
              ? BLOOD_GROUPS.filter((bg) => donorsByGroup[bg].length > 0)
              : [activeGroupTab];

          const emptyGroups = BLOOD_GROUPS.filter((bg) => donorsByGroup[bg].length === 0);

          return (
            <div className="space-y-6">
              {/* Group Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setActiveGroupTab('ALL')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    activeGroupTab === 'ALL'
                      ? 'bg-[#B5122A] text-white shadow-xs'
                      : 'bg-white border border-[#E7E1E3] text-[#241A1D] hover:border-[#B5122A]/45'
                  }`}
                >
                  সকল গ্রুপ ({combinedDonors.length})
                </button>
                {BLOOD_GROUPS.map((bg) => {
                  const count = donorsByGroup[bg].length;
                  const active = activeGroupTab === bg;
                  return (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setActiveGroupTab(bg)}
                      className={`px-3.5 py-2 rounded-xl font-mono-num text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                        active
                          ? 'bg-[#B5122A] text-white shadow-xs'
                          : 'bg-white border border-[#E7E1E3] text-[#7F1023] hover:border-[#B5122A]/45'
                      }`}
                    >
                      {bg} <span className="font-sans font-medium opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Group Sections */}
              {groupsToRender.length > 0 ? (
                <div className="space-y-8">
                  {groupsToRender.map((bg) => {
                    const list = donorsByGroup[bg] || [];
                    return (
                      <div
                        key={bg}
                        className="bg-white border border-[#E7E1E3] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4"
                      >
                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#F5F5F6]">
                          <div className="flex items-center gap-3">
                            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7F1023] to-[#D61F3C] text-white font-mono-num text-base font-extrabold flex items-center justify-center shadow-xs shrink-0">
                              {bg}
                            </span>
                            <div>
                              <h3 className="font-display text-base sm:text-lg font-bold text-[#171316]">
                                {bg} রক্তের গ্রুপ
                              </h3>
                              <p className="text-xs text-[#75686C] tabular-nums">
                                {list.length} জন রক্তদাতা তালিকাভুক্ত
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              to={`/donors?blood_group=${encodeURIComponent(bg)}`}
                              className="text-xs font-semibold text-[#B5122A] hover:underline whitespace-nowrap"
                            >
                              সব দেখুন →
                            </Link>
                          </div>
                        </div>

                        {list.length > 0 ? (
                          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {list.map((d) => (
                              <DonorCard
                                key={d.donor_id}
                                donor={d}
                                isPendingPreview={Boolean(d._isPendingPreview)}
                                onRequestContact={setSelectedDonor}
                              />
                            ))}
                          </StaggerGrid>
                        ) : (
                          <div className="py-6 text-center space-y-3">
                            <p className="text-sm font-semibold text-[#241A1D]">
                              {bg} গ্রুপে এখনো কোনো অনুমোদিত ডোনার যুক্ত হননি
                            </p>
                            <Link
                              to={`/register?blood_group=${encodeURIComponent(bg)}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl"
                            >
                              {bg} ডোনার হিসেবে নিবন্ধন করুন
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-[#E7E1E3] rounded-2xl p-6 text-center space-y-3">
                  <p className="font-display text-base font-bold text-[#241A1D]">
                    এখনো কোনো অনুমোদিত ডোনার ডিরেক্টরিতে যুক্ত হননি
                  </p>
                  <p className="text-xs text-[#75686C] max-w-md mx-auto">
                    নিরাপত্তা নীতি অনুযায়ী ডোনার নিবন্ধন ও অ্যাডমিন অনুমোদনের পরই প্রোফাইল কার্ড এখানে গ্রুপ অনুযায়ী প্রদর্শিত হয়।
                  </p>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl"
                  >
                    ছবিসহ ডোনার নিবন্ধন করুন
                  </Link>
                </div>
              )}

              {/* Quick Invite for Remaining Empty Blood Groups when viewing ALL */}
              {activeGroupTab === 'ALL' && emptyGroups.length > 0 && (
                <div className="bg-[#FFF1F3] border border-[#B5122A]/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-sm font-bold text-[#7F1023]">
                      অন্যান্য রক্তের গ্রুপে প্রথম ডোনার হিসেবে যুক্ত হোন
                    </p>
                    <p className="text-xs text-[#75686C]">
                      গ্রুপ নির্বাচন করে সরাসরি ছবিসহ ডোনার নিবন্ধন সম্পন্ন করুন
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {emptyGroups.map((bg) => (
                      <Link
                        key={bg}
                        to={`/register?blood_group=${encodeURIComponent(bg)}`}
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#B5122A]/30 hover:bg-[#B5122A] hover:text-white font-mono-num text-xs font-bold text-[#B5122A] transition-colors"
                      >
                        {bg}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </section>

      {/* 6. HOW IT WORKS — 4 COMPACT STEP CARDS */}
      <section className="bg-[#FFF1F3] border-y border-[#E7E1E3] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#171316]">
              কীভাবে {siteSettings.site_name} কাজ করে
            </h2>
            <p className="text-xs text-[#75686C]">নিরাপদ যাচাইকরণ ও দ্রুত সমন্বয়ের চারটি ধাপ</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '০১', title: 'সহজ নিবন্ধন', desc: 'মোবাইল বা ইমেইল দিয়ে OTP ছাড়াই নিরাপদ অ্যাকাউন্ট তৈরি করুন।', icon: <Users className="w-4 h-4" /> },
              { step: '০২', title: 'ফোনে তথ্য যাচাই', desc: 'এলাকা প্রতিনিধি ও অ্যাডমিন ফোনে কথা বলে ডোনারের তথ্য নিশ্চিত করেন।', icon: <PhoneCall className="w-4 h-4" /> },
              { step: '০৩', title: 'গোপনীয়তা সুরক্ষা', desc: 'সম্মতি ছাড়া ফোন নম্বর গোপন থাকে; প্রয়োজনে যোগাযোগ অনুরোধ পাঠানো যায়।', icon: <ClipboardCheck className="w-4 h-4" /> },
              { step: '০৪', title: 'দ্রুত জীবনরক্ষা', desc: 'সঠিক রক্তের গ্রুপ ও এলাকায় রক্তদাতা ও রোগীর মধ্যে সেতুবন্ধন তৈরি হয়।', icon: <HeartHandshake className="w-4 h-4" /> }
            ].map((item) => (
              <div key={item.step} className="bg-white border border-[#E7E1E3] rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono-num text-xs font-bold text-[#B5122A]">{item.step}</span>
                  <span className="w-8 h-8 rounded-lg bg-[#FCE4E8] text-[#B5122A] flex items-center justify-center">
                    {item.icon}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-[#241A1D]">{item.title}</h3>
                <p className="text-xs text-[#75686C] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CAMPAIGNS & AWARENESS BLOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-[#171316]">আসন্ন রক্তদান ক্যাম্পেইন</h2>
            <Link to="/campaigns" className="text-xs font-semibold text-[#B5122A] hover:underline">সব ক্যাম্পেইন →</Link>
          </div>
          <div className="space-y-3">
            {(data?.campaigns || []).map((cmp) => (
              <Link
                key={cmp.campaign_id}
                to={`/campaigns/${cmp.campaign_id}`}
                className="flex gap-4 bg-white border border-[#E7E1E3] hover:border-[#B5122A]/45 rounded-xl p-3 transition-all"
              >
                <img
                  src={cmp.banner_url}
                  alt={cmp.campaign_title}
                  referrerPolicy="no-referrer"
                  className="w-24 h-20 rounded-lg object-cover shrink-0 bg-[#FCE4E8]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#B5122A] font-semibold flex items-center gap-1 tabular-nums">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{cmp.event_date} · {cmp.district}</span>
                  </p>
                  <h3 className="font-display text-sm font-bold text-[#241A1D] mt-1 line-clamp-2">
                    {cmp.campaign_title}
                  </h3>
                  <p className="text-xs text-[#75686C] mt-1 truncate">{cmp.venue}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-[#171316]">সচেতনতা ব্লগ</h2>
            <Link to="/blog" className="text-xs font-semibold text-[#B5122A] hover:underline">সব প্রবন্ধ →</Link>
          </div>
          <div className="space-y-3">
            {(data?.blogs || []).map((b) => (
              <Link
                key={b.blog_id}
                to={`/blog/${b.slug}`}
                className="flex gap-4 bg-white border border-[#E7E1E3] hover:border-[#B5122A]/45 rounded-xl p-3 transition-all"
              >
                <img
                  src={b.thumbnail_url}
                  alt={b.title}
                  referrerPolicy="no-referrer"
                  className="w-24 h-20 rounded-lg object-cover shrink-0 bg-[#FCE4E8]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#75686C]">{b.category}</p>
                  <h3 className="font-display text-sm font-bold text-[#241A1D] mt-1 line-clamp-2">
                    {b.title}
                  </h3>
                  <span className="inline-block text-xs font-semibold text-[#B5122A] mt-1">পড়ুন →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ PREVIEW */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-14">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-[#171316]">সচরাচর জিজ্ঞাসিত প্রশ্ন</h2>
          <Link to="/faq" className="text-xs font-semibold text-[#B5122A] hover:underline">সব প্রশ্ন দেখুন</Link>
        </div>
        <div className="space-y-2.5">
          {faqs.map((item, idx) => (
            <div key={item.q} className="bg-white border border-[#E7E1E3] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-[#241A1D] hover:text-[#B5122A] cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180 text-[#B5122A]' : ''}`}
                />
              </button>
              {openFaq === idx && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 pb-3.5 text-xs text-[#75686C] leading-relaxed border-t border-[#F5F5F6] pt-2.5"
                >
                  {item.a}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </section>

      <ContactRequestModal donor={selectedDonor} onClose={() => setSelectedDonor(null)} />
    </PageTransition>
  );
};
