import React, { useEffect, useState } from 'react';
import {
  User as UserIcon, Droplet, History, MessageSquare, Bell, ShieldCheck, KeyRound
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout, SidebarItem } from '../../components/layout/DashboardLayout';
import { BloodDropLoader, StaggerGrid, StaggerCard } from '../../components/ui/MotionPrimitives';
import { BLOOD_GROUPS } from '../../data/bdLocations';
import { ProfileImagePicker } from '../../components/ui/ProfileImagePicker';
import type { DonationRecord, ContactRequest } from '../../types';

const ITEMS: SidebarItem[] = [
  { id: 'overview', label: 'ড্যাশবোর্ড ও অবস্থা', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'profile', label: 'প্রোফাইল ও প্রাপ্যতা', icon: <UserIcon className="w-4 h-4" /> },
  { id: 'donations', label: 'রক্তদানের ইতিহাস', icon: <History className="w-4 h-4" /> },
  { id: 'contacts', label: 'যোগাযোগ অনুরোধ', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'security', label: 'পাসওয়ার্ড পরিবর্তন', icon: <KeyRound className="w-4 h-4" /> }
];

export const DonorDashboard: React.FC = () => {
  const { user, donor, notifications, refreshAuth } = useAuth();
  const [tab, setTab] = useState('overview');
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [incoming, setIncoming] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Profile form
  const [bloodGroup, setBloodGroup] = useState(donor?.blood_group || 'O+');
  const [availability, setAvailability] = useState<'available' | 'unavailable'>(donor?.availability || 'available');
  const [phoneVisibility, setPhoneVisibility] = useState<'private' | 'public'>(donor?.phone_visibility || 'private');
  const [division, setDivision] = useState(donor?.division || 'ঢাকা');
  const [district, setDistrict] = useState(donor?.district || 'ঢাকা');
  const [upazila, setUpazila] = useState(donor?.upazila || 'ধানমন্ডি');
  const [area, setArea] = useState(donor?.area || '');
  const [bio, setBio] = useState(donor?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');

  // Self donation log form
  const [donDate, setDonDate] = useState('');
  const [donHospital, setDonHospital] = useState('');
  const [donNotes, setDonNotes] = useState('');

  // Password form
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [donRes, crRes] = await Promise.all([
      apiRequest<{ donations: DonationRecord[] }>('/api/donations'),
      apiRequest<{ incoming: ContactRequest[] }>('/api/donor/contact-requests')
    ]);
    if (donRes.success && donRes.data) setDonations(donRes.data.donations);
    if (crRes.success && crRes.data) setIncoming(crRes.data.incoming);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (donor) {
      setBloodGroup(donor.blood_group);
      setAvailability(donor.availability);
      setPhoneVisibility(donor.phone_visibility);
      setDivision(donor.division);
      setDistrict(donor.district);
      setUpazila(donor.upazila);
      setArea(donor.area);
      setBio(donor.bio);
    }
    if (user?.profile_image !== undefined) {
      setProfileImage(user.profile_image || '');
    }
  }, [donor, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/donor/profile', {
      method: 'POST',
      body: {
        blood_group: bloodGroup,
        availability,
        phone_visibility: phoneVisibility,
        division,
        district,
        upazila,
        area,
        bio,
        profile_image: profileImage
      }
    });
    setToast(res.message);
    if (res.success) await refreshAuth();
  };

  const handleToggleAvailability = async () => {
    const next = availability === 'available' ? 'unavailable' : 'available';
    setAvailability(next);
    const res = await apiRequest('/api/donor/profile', {
      method: 'POST',
      body: { availability: next }
    });
    setToast(res.message);
    if (res.success) await refreshAuth();
  };

  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/donations', {
      method: 'POST',
      body: { donation_date: donDate, hospital_name: donHospital, notes: donNotes }
    });
    setToast(res.message);
    if (res.success) {
      setDonDate('');
      setDonHospital('');
      setDonNotes('');
      await loadData();
    }
  };

  const handleContactRespond = async (id: string, consent: 'approved' | 'declined') => {
    const res = await apiRequest('/api/donor/contact-request/respond', {
      method: 'POST',
      body: { contact_request_id: id, consent }
    });
    setToast(res.message);
    await loadData();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
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
      title="ডোনার ড্যাশবোর্ড"
      roleLabel="রক্তদাতা (Donor)"
      items={ITEMS}
      activeTab={tab}
      onTabChange={setTab}
    >
      {toast && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#FFF1F3] border border-[#B5122A]/30 text-xs font-semibold text-[#7F1023] flex items-center justify-between">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')} className="text-[#B5122A] cursor-pointer">✕</button>
        </div>
      )}

      {loading ? (
        <BloodDropLoader />
      ) : (
        <>
          {tab === 'overview' && (
            <div className="space-y-6">
              <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StaggerCard className="bg-white border border-[#E7E1E3] rounded-xl p-4">
                  <p className="text-xs text-[#75686C]">রক্তের গ্রুপ</p>
                  <p className="font-mono-num text-2xl font-bold text-[#B5122A] mt-1">{donor?.blood_group || 'নির্ধারিত নয়'}</p>
                </StaggerCard>
                <StaggerCard className="bg-white border border-[#E7E1E3] rounded-xl p-4">
                  <p className="text-xs text-[#75686C]">যাচাইকরণ অবস্থা</p>
                  <p className="font-display text-base font-bold text-[#171316] mt-1">
                    {donor?.verification_status || 'প্রোফাইল অসম্পূর্ণ'}
                  </p>
                </StaggerCard>
                <StaggerCard className="bg-white border border-[#E7E1E3] rounded-xl p-4">
                  <p className="text-xs text-[#75686C]">মোট রক্তদান</p>
                  <p className="font-mono-num text-2xl font-bold text-[#171316] mt-1">
                    {donations.filter((d) => d.verification_status === 'Verified').length}
                  </p>
                </StaggerCard>
                <StaggerCard className="bg-white border border-[#E7E1E3] rounded-xl p-4">
                  <p className="text-xs text-[#75686C]">যোগাযোগ অনুরোধ</p>
                  <p className="font-mono-num text-2xl font-bold text-[#B5122A] mt-1">
                    {incoming.filter((c) => c.donor_consent === 'pending').length}
                  </p>
                </StaggerCard>
              </StaggerGrid>

              <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-base font-bold text-[#171316]">
                    বর্তমান প্রাপ্যতা: {availability === 'available' ? 'রক্তদানে প্রস্তুত' : 'সাময়িক বিরতিতে'}
                  </h2>
                  <p className="text-xs text-[#75686C] mt-0.5">
                    {donor?.verification_status === 'Approved'
                      ? 'আপনার প্রোফাইল অনুমোদিত এবং পাবলিক ডিরেক্টরিতে দৃশ্যমান।'
                      : 'অ্যাডমিন অনুমোদনের পরই আপনার প্রোফাইল পাবলিক ডিরেক্টরিতে প্রদর্শিত হবে।'}
                  </p>
                </div>
                {donor && (
                  <button
                    type="button"
                    onClick={handleToggleAvailability}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer transition-colors ${
                      availability === 'available'
                        ? 'bg-[#B5122A] text-white'
                        : 'bg-[#FFF1F3] text-[#B5122A] border border-[#B5122A]/30'
                    }`}
                  >
                    {availability === 'available' ? 'বিরতিতে যান' : 'প্রস্তুত হিসেবে চিহ্নিত করুন'}
                  </button>
                )}
              </div>

              <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3">
                <h3 className="font-display text-sm font-bold text-[#7F1023] flex items-center gap-2">
                  <Bell className="w-4 h-4" /> সাম্প্রতিক নোটিফিকেশন
                </h3>
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#75686C]">কোনো নোটিফিকেশন নেই।</p>
                ) : (
                  <div className="divide-y divide-[#F5F5F6]">
                    {notifications.slice(0, 5).map((n) => (
                      <div key={n.notification_id} className="py-2.5">
                        <p className="text-xs font-semibold text-[#241A1D]">{n.title}</p>
                        <p className="text-xs text-[#75686C]">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="bg-white border border-[#E7E1E3] rounded-2xl p-6 space-y-4 max-w-2xl">
              <h2 className="font-display text-lg font-bold text-[#7F1023]">ডোনার প্রোফাইল ও প্রাইভেসি হালনাগাদ</h2>
              <ProfileImagePicker
                value={profileImage}
                onChange={setProfileImage}
                label="ডোনার প্রোফাইল ছবি"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">পূর্ণ নাম</label>
                  <input type="text" disabled value={user?.full_name || ''} className="w-full rounded-xl border border-[#E7E1E3] bg-[#F5F5F6] px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">রক্তের গ্রুপ</label>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value as any)} disabled={Boolean(donor)} className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm disabled:bg-[#F5F5F6]">
                    {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" value={division} onChange={(e) => setDivision(e.target.value)} placeholder="বিভাগ" className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm" />
                <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="জেলা" className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm" />
                <input type="text" value={upazila} onChange={(e) => setUpazila(e.target.value)} placeholder="উপজেলা" className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm" />
              </div>
              <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="এলাকা / মহল্লা" className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm" />
              <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="সংক্ষিপ্ত বিবরণ" className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm" />
              <div className="bg-[#FFF1F3] border border-[#B5122A]/20 rounded-xl p-3 space-y-1.5 text-xs">
                <p className="font-bold text-[#7F1023]">ফোন নম্বর দৃশ্যমানতা</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={phoneVisibility === 'private'} onChange={() => setPhoneVisibility('private')} className="accent-[#B5122A]" />
                  <span>গোপন রাখুন (অনুরোধের মাধ্যমে যোগাযোগ)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={phoneVisibility === 'public'} onChange={() => setPhoneVisibility('public')} className="accent-[#B5122A]" />
                  <span>পাবলিক ডিরেক্টরিতে দেখান</span>
                </label>
              </div>
              <button type="submit" className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl cursor-pointer">
                পরিবর্তন সংরক্ষণ করুন
              </button>
            </form>
          )}

          {tab === 'donations' && (
            <div className="space-y-6">
              <form onSubmit={handleAddDonation} className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3 max-w-2xl">
                <h2 className="font-display text-base font-bold text-[#7F1023] flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-[#B5122A]" /> নতুন রক্তদানের তথ্য জমা দিন
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="date" required value={donDate} onChange={(e) => setDonDate(e.target.value)} className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm" />
                  <input type="text" required value={donHospital} onChange={(e) => setDonHospital(e.target.value)} placeholder="হাসপাতালের নাম *" className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm" />
                </div>
                <input type="text" value={donNotes} onChange={(e) => setDonNotes(e.target.value)} placeholder="অতিরিক্ত নোট (ঐচ্ছিক)" className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm" />
                <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer">
                  রেকর্ড জমা দিন
                </button>
              </form>

              <div className="bg-white border border-[#E7E1E3] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF1F3] text-[#7F1023]">
                    <tr>
                      <th className="p-3">তারিখ</th>
                      <th className="p-3">হাসপাতাল</th>
                      <th className="p-3">গ্রুপ</th>
                      <th className="p-3">যাচাই অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F5F6]">
                    {donations.length === 0 ? (
                      <tr><td colSpan={4} className="p-4 text-center text-[#75686C]">কোনো রক্তদান রেকর্ড নেই</td></tr>
                    ) : (
                      donations.map((d) => (
                        <tr key={d.donation_id}>
                          <td className="p-3 tabular-nums">{d.donation_date}</td>
                          <td className="p-3">{d.hospital_name}</td>
                          <td className="p-3 font-mono-num font-bold text-[#B5122A]">{d.blood_group}</td>
                          <td className="p-3 font-semibold">{d.verification_status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'contacts' && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#7F1023]">আগত যোগাযোগের অনুরোধ</h2>
              {incoming.length === 0 ? (
                <div className="bg-white border border-[#E7E1E3] rounded-xl p-6 text-xs text-[#75686C]">কোনো যোগাযোগের অনুরোধ আসেনি।</div>
              ) : (
                incoming.map((cr) => (
                  <div key={cr.contact_request_id} className="bg-white border border-[#E7E1E3] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#241A1D]">{cr.requester_name}</p>
                      <p className="text-xs text-[#75686C] mt-0.5">{cr.message}</p>
                      <p className="text-[11px] text-[#B5122A] mt-1 font-semibold">অবস্থা: {cr.contact_status}</p>
                    </div>
                    {cr.donor_consent === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleContactRespond(cr.contact_request_id, 'approved')}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer"
                        >
                          সম্মতি দিন
                        </button>
                        <button
                          type="button"
                          onClick={() => handleContactRespond(cr.contact_request_id, 'declined')}
                          className="px-3.5 py-1.5 text-xs font-semibold text-[#75686C] border border-[#E7E1E3] rounded-lg cursor-pointer"
                        >
                          প্রত্যাখ্যান
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'security' && (
            <form onSubmit={handleChangePassword} className="bg-white border border-[#E7E1E3] rounded-2xl p-6 space-y-4 max-w-md">
              <h2 className="font-display text-base font-bold text-[#7F1023]">পাসওয়ার্ড পরিবর্তন</h2>
              <input type="password" required value={currPass} onChange={(e) => setCurrPass(e.target.value)} placeholder="বর্তমান পাসওয়ার্ড" className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm" />
              <input type="password" required minLength={8} value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)" className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm" />
              <button type="submit" className="px-5 py-2.5 text-xs font-semibold text-white bg-[#B5122A] rounded-xl cursor-pointer">
                পাসওয়ার্ড আপডেট করুন
              </button>
            </form>
          )}
        </>
      )}
    </DashboardLayout>
  );
};
