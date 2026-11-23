import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Droplet } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { BLOOD_GROUPS, BD_LOCATIONS } from '../../data/bdLocations';
import { PageTransition } from '../../components/ui/MotionPrimitives';
import { useAuth } from '../../context/AuthContext';

export const BloodRequestPage: React.FC = () => {
  const { user } = useAuth();
  const [patientName, setPatientName] = useState('');
  const [requesterName, setRequesterName] = useState(user?.full_name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [division, setDivision] = useState('ঢাকা');
  const [district, setDistrict] = useState('ঢাকা');
  const [upazila, setUpazila] = useState('ধানমন্ডি');
  const [requiredDate, setRequiredDate] = useState('');
  const [requiredTime, setRequiredTime] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'Normal' | 'Urgent' | 'Emergency'>('Urgent');
  const [patientCondition, setPatientCondition] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState('');

  const districts = BD_LOCATIONS.find((d) => d.division === division)?.districts || [];
  const upazilas = districts.find((d) => d.district === district)?.upazilas || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await apiRequest<{ request: { request_id: string } }>('/api/requests', {
      method: 'POST',
      body: {
        patient_name: patientName,
        requester_name: requesterName,
        contact_phone: contactPhone,
        blood_group: bloodGroup,
        units_required: unitsRequired,
        hospital_name: hospitalName,
        hospital_address: hospitalAddress,
        division,
        district,
        upazila,
        required_date: requiredDate,
        required_time: requiredTime,
        urgency_level: urgencyLevel,
        patient_condition: patientCondition,
        additional_notes: additionalNotes
      }
    });
    setSubmitting(false);
    if (!res.success || !res.data) {
      setError(res.message);
      return;
    }
    setCreatedId(res.data.request.request_id);
  };

  if (createdId) {
    return (
      <PageTransition className="max-w-lg mx-auto px-4 py-14">
        <div className="bg-white border border-[#B5122A]/25 rounded-2xl p-7 text-center shadow-lg space-y-4">
          <CheckCircle2 className="w-12 h-12 text-[#B5122A] mx-auto" />
          <h1 className="font-display text-2xl font-bold text-[#171316]">রক্তের অনুরোধ জমা হয়েছে</h1>
          <p className="text-sm text-[#75686C]">
            অনুরোধ নম্বর <span className="font-mono-num font-bold text-[#B5122A]">{createdId}</span>। অ্যাডমিন যাচাই ও অনুমোদনের পর এটি পাবলিক ও জরুরি তালিকায় প্রকাশিত হবে।
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Link to="/requests" className="px-4 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg">
              অনুরোধ তালিকা দেখুন
            </Link>
            <button
              type="button"
              onClick={() => setCreatedId('')}
              className="px-4 py-2 text-xs font-semibold text-[#B5122A] border border-[#B5122A]/30 rounded-lg cursor-pointer"
            >
              আরেকটি অনুরোধ করুন
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white border border-[#E7E1E3] rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#171316] via-[#7F1023] to-[#B5122A] p-6 text-white">
          <div className="flex items-center gap-2.5">
            <Droplet className="w-5 h-5 fill-white" />
            <h1 className="font-display text-2xl font-bold">রক্তের জন্য আবেদন ফর্ম</h1>
          </div>
          <p className="text-xs text-white/80 mt-1">
            রোগীর সঠিক তথ্য ও হাসপাতালের ঠিকানা দিন; অ্যাডমিন যাচাই করে অনুমোদন দেবেন
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold mb-1">রোগীর নাম *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">আবেদনকারীর নাম *</label>
              <input
                type="text"
                required
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold mb-1">যোগাযোগের মোবাইল নম্বর *</label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">রক্তের গ্রুপ *</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">কত ব্যাগ প্রয়োজন *</label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={unitsRequired}
                onChange={(e) => setUnitsRequired(Number(e.target.value))}
                className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold mb-1">হাসপাতালের নাম *</label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">হাসপাতালের ঠিকানা</label>
              <input
                type="text"
                value={hospitalAddress}
                onChange={(e) => setHospitalAddress(e.target.value)}
                className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold mb-1">বিভাগ</label>
              <select
                value={division}
                onChange={(e) => {
                  const div = e.target.value;
                  setDivision(div);
                  const dList = BD_LOCATIONS.find((x) => x.division === div)?.districts || [];
                  setDistrict(dList[0]?.district || '');
                  setUpazila(dList[0]?.upazilas[0] || '');
                }}
                className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm"
              >
                {BD_LOCATIONS.map((d) => <option key={d.division} value={d.division}>{d.division}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">জেলা</label>
              <select
                value={district}
                onChange={(e) => {
                  const dist = e.target.value;
                  setDistrict(dist);
                  const uList = districts.find((x) => x.district === dist)?.upazilas || [];
                  setUpazila(uList[0] || '');
                }}
                className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm"
              >
                {districts.map((dist) => <option key={dist.district} value={dist.district}>{dist.district}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">উপজেলা</label>
              <select value={upazila} onChange={(e) => setUpazila(e.target.value)} className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm">
                {upazilas.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold mb-1">প্রয়োজনের তারিখ</label>
              <input type="date" value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)} className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">সময়</label>
              <input type="time" value={requiredTime} onChange={(e) => setRequiredTime(e.target.value)} className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">জরুরিতার মাত্রা</label>
              <select value={urgencyLevel} onChange={(e) => setUrgencyLevel(e.target.value as any)} className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm">
                <option value="Emergency">অতি জরুরি (Emergency)</option>
                <option value="Urgent">জরুরি (Urgent)</option>
                <option value="Normal">সাধারণ (Normal)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold mb-1">রোগীর অবস্থা / রোগের ধরন</label>
              <input
                type="text"
                value={patientCondition}
                onChange={(e) => setPatientCondition(e.target.value)}
                placeholder="যেমন: থ্যালাসেমিয়া, অপারেশন, দুর্ঘটনা"
                className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">অতিরিক্ত তথ্য</label>
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="ওয়ার্ড বা বেড নম্বর ইত্যাদি"
                className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-[#B5122A] bg-[#FFF1F3] border border-[#B5122A]/25 rounded-lg p-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#7F1023] via-[#B5122A] to-[#D61F3C] rounded-xl shadow-sm hover:brightness-110 cursor-pointer disabled:opacity-60"
          >
            {submitting ? 'অনুরোধ জমা হচ্ছে...' : 'রক্তের অনুরোধ জমা দিন'}
          </button>
        </form>
      </div>
    </PageTransition>
  );
};
