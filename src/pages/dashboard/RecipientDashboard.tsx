import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, MessageSquare, Plus, CheckCircle, XCircle, KeyRound } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout, SidebarItem } from '../../components/layout/DashboardLayout';
import { BloodDropLoader } from '../../components/ui/MotionPrimitives';
import type { BloodRequest } from '../../types';

const ITEMS: SidebarItem[] = [
  { id: 'requests', label: 'আমার রক্তের অনুরোধ', icon: <Activity className="w-4 h-4" /> },
  { id: 'contacts', label: 'ডোনার যোগাযোগ অনুরোধ', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'security', label: 'পাসওয়ার্ড পরিবর্তন', icon: <KeyRound className="w-4 h-4" /> }
];

export const RecipientDashboard: React.FC = () => {
  useAuth();
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [reqRes, crRes] = await Promise.all([
      apiRequest<{ requests: BloodRequest[] }>('/api/requests?mine=true'),
      apiRequest<{ outgoing: any[] }>('/api/donor/contact-requests')
    ]);
    if (reqRes.success && reqRes.data) setRequests(reqRes.data.requests);
    if (crRes.success && crRes.data) setOutgoing(crRes.data.outgoing);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id: string, action: 'complete' | 'cancel') => {
    const res = await apiRequest(`/api/requests/${id}/action`, { method: 'POST', body: { action } });
    setToast(res.message);
    await loadData();
  };

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: { current_password: currPass, new_password: newPass }
    });
    setToast(res.message);
    if (res.success) {
      setCurrPass('');
      setNewPass('');
    }
  };

  return (
    <DashboardLayout
      title="রক্তের প্রাপক ড্যাশবোর্ড"
      roleLabel="রক্তের প্রাপক (Recipient)"
      items={ITEMS}
      activeTab={tab}
      onTabChange={setTab}
    >
      {toast && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#FFF1F3] border border-[#B5122A]/30 text-xs font-semibold text-[#7F1023]">
          {toast}
        </div>
      )}

      {loading ? (
        <BloodDropLoader />
      ) : (
        <>
          {tab === 'requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#171316]">আমার রক্তের আবেদনসমূহ</h2>
                <Link
                  to="/request-blood"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন অনুরোধ</span>
                </Link>
              </div>
              {requests.length === 0 ? (
                <div className="bg-white border border-[#E7E1E3] rounded-xl p-6 text-center text-xs text-[#75686C]">
                  আপনি এখনো কোনো রক্তের অনুরোধ করেননি।
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requests.map((r) => (
                    <div key={r.request_id} className="bg-white border border-[#E7E1E3] rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-[#241A1D]">{r.patient_name}</span>
                        <span className="px-2 py-0.5 rounded bg-[#B5122A] text-white font-mono-num text-xs font-bold">{r.blood_group}</span>
                      </div>
                      <p className="text-xs text-[#75686C]">{r.hospital_name} · {r.units_required} ব্যাগ</p>
                      <p className="text-xs font-semibold text-[#7F1023]">অবস্থা: {r.admin_status}</p>
                      {['Pending', 'Approved', 'Donor Matching'].includes(r.admin_status) && (
                        <div className="flex gap-2 pt-2">
                          <button type="button" onClick={() => handleAction(r.request_id, 'complete')} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer">
                            <CheckCircle className="w-3.5 h-3.5" /> সম্পন্ন
                          </button>
                          <button type="button" onClick={() => handleAction(r.request_id, 'cancel')} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#75686C] border border-[#E7E1E3] rounded-lg cursor-pointer">
                            <XCircle className="w-3.5 h-3.5" /> বাতিল
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'contacts' && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#171316]">পাঠানো ডোনার যোগাযোগ অনুরোধ</h2>
              {outgoing.length === 0 ? (
                <div className="bg-white border border-[#E7E1E3] rounded-xl p-6 text-xs text-[#75686C]">কোনো অনুরোধ পাঠানো হয়নি।</div>
              ) : (
                outgoing.map((c) => (
                  <div key={c.contact_request_id} className="bg-white border border-[#E7E1E3] rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#241A1D]">{c.donor_name} ({c.donor_blood_group})</p>
                      <p className="text-xs text-[#75686C]">সম্মতি অবস্থা: {c.contact_status}</p>
                    </div>
                    {c.donor_phone ? (
                      <a href={`tel:${c.donor_phone}`} className="px-3 py-1.5 text-xs font-semibold text-white bg-[#B5122A] rounded-lg tabular-nums">
                        {c.donor_phone}
                      </a>
                    ) : (
                      <span className="text-xs text-[#75686C]">অনুমতির অপেক্ষায়</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'security' && (
            <form onSubmit={handleChangePass} className="bg-white border border-[#E7E1E3] rounded-2xl p-6 space-y-4 max-w-md">
              <h2 className="font-display text-base font-bold text-[#7F1023]">পাসওয়ার্ড পরিবর্তন</h2>
              <input type="password" required value={currPass} onChange={(e) => setCurrPass(e.target.value)} placeholder="বর্তমান পাসওয়ার্ড" className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm" />
              <input type="password" required minLength={8} value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="নতুন পাসওয়ার্ড" className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm" />
              <button type="submit" className="px-5 py-2.5 text-xs font-semibold text-white bg-[#B5122A] rounded-xl cursor-pointer">আপডেট করুন</button>
            </form>
          )}
        </>
      )}
    </DashboardLayout>
  );
};
