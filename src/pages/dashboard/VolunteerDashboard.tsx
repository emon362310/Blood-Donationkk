import React, { useEffect, useState } from 'react';
import { Calendar, ShieldCheck, User as UserIcon } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout, SidebarItem } from '../../components/layout/DashboardLayout';
import type { Campaign } from '../../types';

const ITEMS: SidebarItem[] = [
  { id: 'overview', label: 'প্রোফাইল ও অবস্থা', icon: <UserIcon className="w-4 h-4" /> },
  { id: 'campaigns', label: 'ক্যাম্পেইনসমূহ', icon: <Calendar className="w-4 h-4" /> }
];

export const VolunteerDashboard: React.FC = () => {
  const { user, volunteer } = useAuth();
  const [tab, setTab] = useState('overview');
  const [campaigns, setCampaigns] = useState<(Campaign & { is_registered?: boolean })[]>([]);
  const [toast, setToast] = useState('');

  const loadCampaigns = async () => {
    const res = await apiRequest<{ campaigns: (Campaign & { is_registered?: boolean })[] }>('/api/campaigns');
    if (res.success && res.data) setCampaigns(res.data.campaigns);
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleJoin = async (id: string) => {
    const res = await apiRequest(`/api/campaigns/${id}/register`, { method: 'POST', body: {} });
    setToast(res.message);
    await loadCampaigns();
  };

  return (
    <DashboardLayout
      title="স্বেচ্ছাসেবক ড্যাশবোর্ড"
      roleLabel="স্বেচ্ছাসেবক (Volunteer)"
      items={ITEMS}
      activeTab={tab}
      onTabChange={setTab}
    >
      {toast && <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#FFF1F3] border border-[#B5122A]/30 text-xs font-semibold text-[#7F1023]">{toast}</div>}

      {tab === 'overview' && (
        <div className="bg-white border border-[#E7E1E3] rounded-2xl p-6 space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-[#B5122A] font-semibold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>অনুমোদন অবস্থা: {volunteer?.approval_status || 'Pending'}</span>
          </div>
          <h2 className="font-display text-xl font-bold text-[#171316]">{user?.full_name}</h2>
          <p className="text-xs text-[#75686C]">দক্ষতা: {volunteer?.skills || 'স্বেচ্ছাসেবী সহায়তা'}</p>
          <p className="text-xs text-[#75686C]">
            এলাকা: {[volunteer?.upazila, volunteer?.district, volunteer?.division].filter(Boolean).join(', ') || 'নির্ধারিত নয়'}
          </p>
        </div>
      )}

      {tab === 'campaigns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <div key={c.campaign_id} className="bg-white border border-[#E7E1E3] rounded-xl p-4 flex flex-col justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#B5122A] tabular-nums">{c.event_date} · {c.district}</p>
                <h3 className="font-display text-base font-bold text-[#241A1D] mt-1">{c.campaign_title}</h3>
                <p className="text-xs text-[#75686C] mt-1">{c.venue}</p>
              </div>
              {c.is_registered ? (
                <span className="text-xs font-semibold text-[#B5122A]">নিবন্ধিত</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleJoin(c.campaign_id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg self-start cursor-pointer"
                >
                  স্বেচ্ছাসেবক হিসেবে যুক্ত হোন
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
