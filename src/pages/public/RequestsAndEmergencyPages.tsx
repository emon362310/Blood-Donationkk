import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Plus } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { BLOOD_GROUPS } from '../../data/bdLocations';
import { PageTransition, StaggerGrid, BloodDropLoader } from '../../components/ui/MotionPrimitives';
import { RequestCard } from '../../components/ui/RequestCard';
import type { BloodRequest } from '../../types';

export const BloodRequestListPage: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [bgFilter, setBgFilter] = useState('');

  useEffect(() => {
    const q = bgFilter ? `?blood_group=${encodeURIComponent(bgFilter)}` : '';
    apiRequest<{ requests: BloodRequest[] }>(`/api/requests${q}`).then((res) => {
      if (res.success && res.data) setRequests(res.data.requests);
      setLoading(false);
    });
  }, [bgFilter]);

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-gradient-to-r from-[#171316] via-[#7F1023] to-[#B5122A] rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">রক্তের অনুরোধের তালিকা</h1>
          <p className="text-xs sm:text-sm text-white/80 mt-1">
            অ্যাডমিন অনুমোদিত ও চলমান রক্তের আবেদনসমূহ
          </p>
        </div>
        <Link
          to="/request-blood"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#7F1023] bg-white rounded-xl hover:bg-[#FFF1F3] whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন অনুরোধ করুন</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setBgFilter('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            !bgFilter ? 'bg-[#B5122A] text-white' : 'bg-white border border-[#E7E1E3] text-[#241A1D]'
          }`}
        >
          সকল গ্রুপ
        </button>
        {BLOOD_GROUPS.map((bg) => (
          <button
            key={bg}
            type="button"
            onClick={() => setBgFilter(bg)}
            className={`px-3 py-1.5 rounded-lg font-mono-num text-xs font-bold cursor-pointer ${
              bgFilter === bg ? 'bg-[#B5122A] text-white' : 'bg-white border border-[#E7E1E3] text-[#241A1D]'
            }`}
          >
            {bg}
          </button>
        ))}
      </div>

      {loading ? (
        <BloodDropLoader />
      ) : requests.length === 0 ? (
        <div className="bg-white border border-[#E7E1E3] rounded-2xl p-8 text-center space-y-3">
          <p className="font-display text-lg font-bold text-[#241A1D]">কোনো সক্রিয় অনুরোধ পাওয়া যায়নি</p>
          <p className="text-xs text-[#75686C]">রক্তের প্রয়োজন হলে উপরের বাটনে ক্লিক করে আবেদন করুন।</p>
        </div>
      ) : (
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((r) => (
            <RequestCard key={r.request_id} request={r} />
          ))}
        </StaggerGrid>
      )}
    </PageTransition>
  );
};

export const EmergencyRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ requests: BloodRequest[] }>('/api/requests?urgency_level=Emergency').then((res) => {
      if (res.success && res.data) setRequests(res.data.requests);
      setLoading(false);
    });
  }, []);

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-7 h-7 text-[#FCE4E8] shrink-0 mt-0.5" />
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">অতি জরুরি রক্তের অনুরোধ</h1>
            <p className="text-xs sm:text-sm text-white/85 mt-1">
              মুমূর্ষু রোগীদের জীবন বাঁচাতে দ্রুত নিকটস্থ রক্তদাতা এগিয়ে আসুন
            </p>
          </div>
        </div>
        <Link
          to="/request-blood"
          className="px-4 py-2.5 text-xs font-semibold text-[#7F1023] bg-white rounded-xl whitespace-nowrap self-start sm:self-auto"
        >
          জরুরি আবেদন জমা দিন
        </Link>
      </div>

      {loading ? (
        <BloodDropLoader />
      ) : requests.length === 0 ? (
        <div className="bg-[#FFF1F3] border border-[#B5122A]/25 rounded-2xl p-8 text-center space-y-2">
          <p className="font-display text-base font-bold text-[#7F1023]">বর্তমানে কোনো জরুরি অনুরোধ নেই</p>
          <p className="text-xs text-[#75686C]">সব সাধারণ রক্তের অনুরোধ দেখতে মূল তালিকায় যান।</p>
        </div>
      ) : (
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((r) => (
            <RequestCard key={r.request_id} request={r} />
          ))}
        </StaggerGrid>
      )}
    </PageTransition>
  );
};
