import React, { useEffect, useState } from 'react';
import {
  LayoutGrid, MapPin, Users, PhoneCall, Activity, CheckSquare, FileText
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { DashboardLayout, SidebarItem } from '../../components/layout/DashboardLayout';
import { BloodDropLoader, StaggerGrid, StaggerCard } from '../../components/ui/MotionPrimitives';
import type { Donor, BloodRequest, RepresentativeAssignment, RepresentativeTask, RepresentativeReport } from '../../types';

const ITEMS: SidebarItem[] = [
  { id: 'overview', label: 'ওভারভিউ ও এলাকা', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'donors', label: 'এলাকার ডোনার যাচাই', icon: <PhoneCall className="w-4 h-4" /> },
  { id: 'requests', label: 'এলাকার রক্তের অনুরোধ', icon: <Activity className="w-4 h-4" /> },
  { id: 'tasks', label: 'নির্ধারিত টাস্ক', icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'reports', label: 'প্রতিবেদন জমা', icon: <FileText className="w-4 h-4" /> }
];

export const RepresentativeDashboard: React.FC = () => {
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [data, setData] = useState<{
    representative: any;
    assignments: RepresentativeAssignment[];
    permissions: any;
    stats: any;
    donors: Donor[];
    requests: BloodRequest[];
    tasks: RepresentativeTask[];
    reports: RepresentativeReport[];
  } | null>(null);

  // Verification modal/inline state
  const [verifyingDonorId, setVerifyingDonorId] = useState('');
  const [verifyResult, setVerifyResult] = useState('ফোনে যোগাযোগ হয়েছে — তথ্য সঠিক');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyRec, setVerifyRec] = useState<'approve' | 'reject'>('approve');

  // Report state
  const [repTitle, setRepTitle] = useState('');
  const [repArea, setRepArea] = useState('');
  const [repContent, setRepContent] = useState('');

  const loadData = async () => {
    setLoading(true);
    const res = await apiRequest<any>('/api/representative/dashboard');
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/representative/verify-donor', {
      method: 'POST',
      body: {
        donor_id: verifyingDonorId,
        verification_result: verifyResult,
        verification_notes: verifyNotes,
        recommendation: verifyRec,
        verified_phone: true,
        verified_blood_group: true
      }
    });
    setToast(res.message);
    if (res.success) {
      setVerifyingDonorId('');
      setVerifyNotes('');
      await loadData();
    }
  };

  const handleMatchRequest = async (id: string) => {
    const res = await apiRequest(`/api/requests/${id}/action`, { method: 'POST', body: { action: 'match' } });
    setToast(res.message);
    await loadData();
  };

  const handleCompleteTask = async (id: string) => {
    const res = await apiRequest(`/api/representative/tasks/${id}/complete`, { method: 'POST', body: {} });
    setToast(res.message);
    await loadData();
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/representative/reports', {
      method: 'POST',
      body: { report_title: repTitle, related_area: repArea, report_content: repContent }
    });
    setToast(res.message);
    if (res.success) {
      setRepTitle('');
      setRepArea('');
      setRepContent('');
      await loadData();
    }
  };

  return (
    <DashboardLayout
      title="এলাকা প্রতিনিধি ড্যাশবোর্ড"
      roleLabel="এলাকা প্রতিনিধি"
      items={ITEMS}
      activeTab={tab}
      onTabChange={setTab}
    >
      {toast && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#FFF1F3] border border-[#B5122A]/30 text-xs font-semibold text-[#7F1023] flex items-center justify-between">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')} className="cursor-pointer">✕</button>
        </div>
      )}

      {loading ? (
        <BloodDropLoader />
      ) : !data ? (
        <div className="bg-white border border-[#E7E1E3] rounded-xl p-6 text-sm text-[#B5122A]">
          প্রতিনিধি ডেটা লোড করা যায়নি। সুপার অ্যাডমিন কর্তৃক আপনার এলাকা বরাদ্দ নিশ্চিত করুন।
        </div>
      ) : (
        <>
          {tab === 'overview' && (
            <div className="space-y-6">
              <StaggerGrid className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                {[
                  { label: 'বরাদ্দকৃত এলাকা', val: data.stats.total_assigned_areas },
                  { label: 'অপেক্ষমান ডোনার', val: data.stats.pending_donors },
                  { label: 'অনুমোদিত ডোনার', val: data.stats.verified_donors },
                  { label: 'চলমান অনুরোধ', val: data.stats.pending_requests },
                  { label: 'জরুরি অনুরোধ', val: data.stats.emergency_requests },
                  { label: 'সম্পন্ন টাস্ক', val: data.stats.completed_tasks }
                ].map((s) => (
                  <StaggerCard key={s.label} className="bg-white border border-[#E7E1E3] rounded-xl p-4">
                    <p className="text-[11px] text-[#75686C]">{s.label}</p>
                    <p className="font-mono-num text-2xl font-bold text-[#B5122A] mt-1">{s.val}</p>
                  </StaggerCard>
                ))}
              </StaggerGrid>

              <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3">
                <h2 className="font-display text-base font-bold text-[#7F1023] flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> আপনার নির্ধারিত এলাকাসমূহ (Strict Area Access)
                </h2>
                <p className="text-xs text-[#75686C]">
                  নিরাপত্তা নীতি অনুযায়ী ব্যাকএন্ড API থেকে শুধুমাত্র নিচের নির্ধারিত এলাকার ডোনার ও রক্তের অনুরোধ আপনাকে দেখানো হচ্ছে।
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.assignments.map((a) => (
                    <div key={a.assignment_id} className="bg-[#FFF1F3] border border-[#B5122A]/25 rounded-xl p-3.5 text-xs space-y-1">
                      <p className="font-bold text-[#7F1023]">
                        {[a.area, a.upazila, a.district, a.division].filter(Boolean).join(', ')}
                      </p>
                      <p className="text-[#75686C]">স্তর: {a.assignment_level} · অনুমতি: {a.permission_level}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'donors' && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-[#171316] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#B5122A]" /> নির্ধারিত এলাকার ডোনার আবেদন ও ফোনে যাচাই
              </h2>

              {verifyingDonorId && (
                <form onSubmit={handleSubmitVerification} className="bg-[#FFF1F3] border border-[#B5122A]/35 rounded-2xl p-5 space-y-3">
                  <h3 className="font-display text-sm font-bold text-[#7F1023]">ফোন যাচাইকরণ নোট ও সুপারিশ</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select value={verifyResult} onChange={(e) => setVerifyResult(e.target.value)} className="rounded-xl border border-[#E7E1E3] bg-white px-3 py-2 text-xs">
                      <option value="ফোনে যোগাযোগ হয়েছে — তথ্য সঠিক">ফোনে যোগাযোগ করেছেন — তথ্য সঠিক</option>
                      <option value="যোগাযোগ করা যায়নি">যোগাযোগ করা যায়নি</option>
                      <option value="রক্তের গ্রুপ নিশ্চিত">রক্তের গ্রুপ নিশ্চিত</option>
                      <option value="তথ্য ভুল / সংশোধন প্রয়োজন">তথ্য ভুল / সংশোধন প্রয়োজন</option>
                    </select>
                    <select value={verifyRec} onChange={(e) => setVerifyRec(e.target.value as any)} className="rounded-xl border border-[#E7E1E3] bg-white px-3 py-2 text-xs">
                      <option value="approve">অনুমোদনের সুপারিশ (Approval Recommendation)</option>
                      <option value="reject">প্রত্যাখ্যানের সুপারিশ (Rejection Recommendation)</option>
                    </select>
                  </div>
                  <textarea rows={2} required value={verifyNotes} onChange={(e) => setVerifyNotes(e.target.value)} placeholder="যাচাইয়ের বিস্তারিত নোট লিখুন *" className="w-full rounded-xl border border-[#E7E1E3] bg-white px-3 py-2 text-xs" />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer">সুপারিশ জমা দিন</button>
                    <button type="button" onClick={() => setVerifyingDonorId('')} className="px-4 py-2 text-xs text-[#75686C] bg-white border border-[#E7E1E3] rounded-lg cursor-pointer">বাতিল</button>
                  </div>
                </form>
              )}

              <div className="bg-white border border-[#E7E1E3] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF1F3] text-[#7F1023]">
                    <tr>
                      <th className="p-3">নাম</th>
                      <th className="p-3">গ্রুপ</th>
                      <th className="p-3">মোবাইল</th>
                      <th className="p-3">অবস্থান</th>
                      <th className="p-3">অবস্থা</th>
                      <th className="p-3">কার্যক্রম</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F5F6]">
                    {data.donors.length === 0 ? (
                      <tr><td colSpan={6} className="p-5 text-center text-[#75686C]">আপনার নির্ধারিত এলাকায় কোনো ডোনার নেই।</td></tr>
                    ) : (
                      data.donors.map((d) => (
                        <tr key={d.donor_id}>
                          <td className="p-3 font-semibold">{d.full_name}</td>
                          <td className="p-3 font-mono-num font-bold text-[#B5122A]">{d.blood_group}</td>
                          <td className="p-3 tabular-nums">{d.phone}</td>
                          <td className="p-3">{[d.upazila, d.district].filter(Boolean).join(', ')}</td>
                          <td className="p-3 font-semibold">{d.verification_status}</td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => setVerifyingDonorId(d.donor_id)}
                              className="px-3 py-1 text-[11px] font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer"
                            >
                              ফোনে যাচাই ও নোট
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'requests' && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-[#171316]">এলাকার রক্তের অনুরোধসমূহ</h2>
              {data.requests.length === 0 ? (
                <div className="bg-white border border-[#E7E1E3] rounded-xl p-6 text-xs text-[#75686C]">আপনার এলাকায় কোনো রক্তের অনুরোধ নেই।</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.requests.map((r) => (
                    <div key={r.request_id} className="bg-white border border-[#E7E1E3] rounded-xl p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-sm">{r.patient_name}</span>
                        <span className="px-2 py-0.5 rounded bg-[#B5122A] text-white font-mono-num text-xs font-bold">{r.blood_group}</span>
                      </div>
                      <p className="text-xs text-[#75686C]">{r.hospital_name} · {r.urgency_level}</p>
                      <p className="text-xs font-semibold text-[#7F1023]">অবস্থা: {r.admin_status} · ম্যাচিং: {r.donor_found_count}</p>
                      <button
                        type="button"
                        onClick={() => handleMatchRequest(r.request_id)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer"
                      >
                        ডোনার ম্যাচিং সহায়তা যুক্ত করুন
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'tasks' && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#171316]">নির্ধারিত টাস্কসমূহ</h2>
              {data.tasks.length === 0 ? (
                <div className="bg-white border border-[#E7E1E3] rounded-xl p-6 text-xs text-[#75686C]">কোনো টাস্ক নির্ধারিত হয়নি।</div>
              ) : (
                data.tasks.map((t) => (
                  <div key={t.task_id} className="bg-white border border-[#E7E1E3] rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#241A1D]">{t.title}</p>
                      <p className="text-xs text-[#75686C]">{t.description}</p>
                      <p className="text-[11px] text-[#B5122A] font-semibold mt-1">অগ্রাধিকার: {t.priority} · অবস্থা: {t.task_status}</p>
                    </div>
                    {t.task_status !== 'Completed' && (
                      <button type="button" onClick={() => handleCompleteTask(t.task_id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer">
                        সম্পন্ন করুন
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'reports' && (
            <div className="space-y-6">
              <form onSubmit={handleReportSubmit} className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3 max-w-2xl">
                <h2 className="font-display text-base font-bold text-[#7F1023]">এলাকা কার্যক্রম প্রতিবেদন জমা</h2>
                <input type="text" required value={repTitle} onChange={(e) => setRepTitle(e.target.value)} placeholder="প্রতিবেদনের শিরোনাম *" className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm" />
                <input type="text" required value={repArea} onChange={(e) => setRepArea(e.target.value)} placeholder="সংশ্লিষ্ট এলাকা *" className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm" />
                <textarea rows={3} required value={repContent} onChange={(e) => setRepContent(e.target.value)} placeholder="কার্যক্রমের বিস্তারিত *" className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm" />
                <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer">প্রতিবেদন জমা দিন</button>
              </form>

              <div className="space-y-2">
                {data.reports.map((rp) => (
                  <div key={rp.report_id} className="bg-white border border-[#E7E1E3] rounded-xl p-4">
                    <p className="text-sm font-bold">{rp.report_title}</p>
                    <p className="text-xs text-[#75686C] mt-1">{rp.report_content}</p>
                    <p className="text-[11px] text-[#B5122A] mt-1">{rp.related_area} · {rp.review_status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};
