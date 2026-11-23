import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, CheckCircle2, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { PageTransition, StaggerGrid, StaggerCard, BloodDropLoader } from '../../components/ui/MotionPrimitives';
import { useAuth } from '../../context/AuthContext';
import type { Campaign } from '../../types';

export const CampaignsPage: React.FC = () => {
  const { siteSettings } = useAuth();
  const [campaigns, setCampaigns] = useState<(Campaign & { is_registered?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ campaigns: (Campaign & { is_registered?: boolean })[] }>('/api/campaigns').then((res) => {
      if (res.success && res.data) setCampaigns(res.data.campaigns);
      setLoading(false);
    });
  }, []);

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-gradient-to-r from-[#171316] via-[#7F1023] to-[#B5122A] rounded-2xl p-6 text-white">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">রক্তদান ক্যাম্পেইনসমূহ</h1>
        <p className="text-xs sm:text-sm text-white/80 mt-1">
          সারাদেশে {siteSettings.site_name}-এর আয়োজিত রক্তদান ও সচেতনতা ক্যাম্পেইনে অংশ নিন
        </p>
      </div>

      {loading ? (
        <BloodDropLoader />
      ) : (
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((c) => (
            <StaggerCard key={c.campaign_id} className="bg-white border border-[#E7E1E3] rounded-2xl overflow-hidden shadow-xs flex flex-col">
              <img
                src={c.banner_url}
                alt={c.campaign_title}
                referrerPolicy="no-referrer"
                className="w-full h-44 object-cover bg-[#FCE4E8]"
              />
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-xs text-[#B5122A] font-semibold tabular-nums">
                    {c.campaign_status} · {c.event_date}
                  </p>
                  <h2 className="font-display text-base font-bold text-[#241A1D]">{c.campaign_title}</h2>
                  <p className="text-xs text-[#75686C] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B5122A] shrink-0" />
                    <span className="truncate">{c.venue}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#F5F5F6]">
                  <span className="text-xs text-[#75686C] tabular-nums inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#B5122A]" />
                    {c.registered_count || 0}/{c.registration_limit}
                  </span>
                  <Link
                    to={`/campaigns/${c.campaign_id}`}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#B5122A] hover:bg-[#D61F3C] rounded-lg"
                  >
                    বিস্তারিত ও নিবন্ধন
                  </Link>
                </div>
              </div>
            </StaggerCard>
          ))}
        </StaggerGrid>
      )}
    </PageTransition>
  );
};

export const CampaignDetailsPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<(Campaign & { is_registered?: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    apiRequest<{ campaigns: (Campaign & { is_registered?: boolean })[] }>('/api/campaigns').then((res) => {
      if (res.success && res.data) {
        const found = res.data.campaigns.find((c) => c.campaign_id === id) || null;
        setCampaign(found);
      }
      setLoading(false);
    });
  }, [id]);

  const handleRegister = async () => {
    if (!campaign) return;
    const res = await apiRequest(`/api/campaigns/${campaign.campaign_id}/register`, { method: 'POST', body: {} });
    setMsg(res.message);
    if (res.success) {
      setCampaign({
        ...campaign,
        is_registered: true,
        registered_count: (campaign.registered_count || 0) + 1
      });
    }
  };

  if (loading) return <BloodDropLoader />;
  if (!campaign) return <div className="p-12 text-center text-sm">ক্যাম্পেইন পাওয়া যায়নি।</div>;

  return (
    <PageTransition className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <Link to="/campaigns" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B5122A] hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>সব ক্যাম্পেইনে ফিরুন</span>
      </Link>

      <div className="bg-white border border-[#E7E1E3] rounded-2xl overflow-hidden shadow-sm">
        <img
          src={campaign.banner_url}
          alt={campaign.campaign_title}
          referrerPolicy="no-referrer"
          className="w-full h-64 object-cover bg-[#FCE4E8]"
        />
        <div className="p-6 space-y-4">
          <div className="text-xs font-semibold text-[#B5122A] flex flex-wrap gap-3 tabular-nums">
            <span>{campaign.campaign_status}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {campaign.event_date} ({campaign.start_time} - {campaign.end_time})</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#171316]">{campaign.campaign_title}</h1>
          <p className="text-sm text-[#241A1D] leading-relaxed">{campaign.campaign_description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-[#FFF8F9] border border-[#E7E1E3] rounded-xl p-3">
              <p className="text-xs text-[#75686C]">স্থান</p>
              <p className="text-xs font-semibold text-[#241A1D] mt-1">{campaign.venue}</p>
            </div>
            <div className="bg-[#FFF8F9] border border-[#E7E1E3] rounded-xl p-3">
              <p className="text-xs text-[#75686C]">আয়োজক</p>
              <p className="text-xs font-semibold text-[#241A1D] mt-1">{campaign.organizer}</p>
            </div>
            <div className="bg-[#FFF8F9] border border-[#E7E1E3] rounded-xl p-3">
              <p className="text-xs text-[#75686C]">নিবন্ধিত অংশগ্রহণকারী</p>
              <p className="text-xs font-semibold text-[#B5122A] mt-1 tabular-nums">
                {campaign.registered_count || 0} / {campaign.registration_limit}
              </p>
            </div>
          </div>

          {msg && <p className="text-xs font-semibold text-[#B5122A] bg-[#FFF1F3] p-2.5 rounded-lg">{msg}</p>}

          <div className="pt-2">
            {!user ? (
              <Link to="/login" className="inline-block px-5 py-2.5 text-xs font-semibold text-white bg-[#B5122A] rounded-xl">
                নিবন্ধন করতে লগইন করুন
              </Link>
            ) : campaign.is_registered ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#B5122A] bg-[#FCE4E8] rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                <span>আপনি এই ক্যাম্পেইনে নিবন্ধিত</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRegister}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl cursor-pointer"
              >
                ক্যাম্পেইনে নিবন্ধন করুন
              </button>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
