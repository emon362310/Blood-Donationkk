import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, ArrowRight, ArrowLeft, UserPlus, Home } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_GROUPS, BD_LOCATIONS } from '../../data/bdLocations';
import { PageTransition } from '../../components/ui/MotionPrimitives';
import { ProfileImagePicker } from '../../components/ui/ProfileImagePicker';
import type { User, BloodGroup } from '../../types';

export const RegisterPage: React.FC = () => {
  const { loginWithToken, dashboardPathForRole, siteSettings } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialBg = searchParams.get('blood_group');
  const validInitialBg = BLOOD_GROUPS.includes(initialBg as BloodGroup) ? (initialBg as string) : 'O+';

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'donor' | 'recipient' | 'volunteer'>('donor');

  // Step 1: Personal
  const [fullName, setFullName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  // Step 2: Blood / Role Info
  const [bloodGroup, setBloodGroup] = useState(validInitialBg);
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [donatedBefore, setDonatedBefore] = useState('no');
  const [availability, setAvailability] = useState('available');
  const [skills, setSkills] = useState('');

  // Step 3: Location
  const [division, setDivision] = useState('ঢাকা');
  const [district, setDistrict] = useState('ঢাকা');
  const [upazila, setUpazila] = useState('ধানমন্ডি');
  const [unionName, setUnionName] = useState('');
  const [ward, setWard] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');

  // Step 4: Additional & Privacy
  const [bio, setBio] = useState('');
  const [phoneVisibility, setPhoneVisibility] = useState<'private' | 'public'>('private');
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [doneUser, setDoneUser] = useState<User | null>(null);

  const districts = BD_LOCATIONS.find((d) => d.division === division)?.districts || [];
  const upazilas = districts.find((d) => d.district === district)?.upazilas || [];

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!fullName.trim()) return setError('পূর্ণ নাম লিখুন।');
      if (!phone.trim() && !email.trim()) return setError('মোবাইল নম্বর অথবা ইমেইল—যেকোনো একটি দিন।');
      if (password.length < 6) return setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      if (password !== confirmPassword) return setError('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মেলেনি।');
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!agreedTerms) return setError('শর্তাবলি ও গোপনীয়তা নীতিমালায় সম্মতি দিন।');
    setSubmitting(true);
    const res = await apiRequest<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: {
        role,
        full_name: fullName,
        profile_image: profileImage,
        phone,
        email,
        password,
        date_of_birth: dob,
        gender,
        blood_group: role === 'donor' ? bloodGroup : undefined,
        last_donation_date: donatedBefore === 'yes' ? lastDonationDate : '',
        availability,
        skills,
        division,
        district,
        upazila,
        union_name: unionName,
        ward,
        area,
        address,
        bio,
        phone_visibility: phoneVisibility
      }
    });
    setSubmitting(false);
    if (!res.success || !res.data) {
      setError(res.message);
      return;
    }
    await loginWithToken(res.data.token, res.data.user);
    setDoneUser(res.data.user);
  };

  if (doneUser) {
    return (
      <PageTransition className="min-h-[78vh] bg-[#FFF1F3] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white border border-[#B5122A]/25 rounded-2xl p-7 text-center shadow-lg space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#FCE4E8] text-[#B5122A] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#171316]">নিবন্ধন সফল হয়েছে!</h1>
          <p className="text-sm text-[#75686C] leading-relaxed">
            {doneUser.role === 'donor'
              ? 'আপনার ডোনার প্রোফাইল বর্তমানে "Pending Verification" অবস্থায় রয়েছে। অ্যাডমিন যাচাই ও অনুমোদনের পর আপনার প্রোফাইল পাবলিক ডিরেক্টরিতে যুক্ত হবে।'
              : `${siteSettings.site_name} প্ল্যাটফর্মে আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।`}
          </p>
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>হোম পেজে কার্ড দেখুন</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(dashboardPathForRole(doneUser.role))}
              className="w-full py-2.5 px-4 text-sm font-semibold text-[#B5122A] bg-[#FFF1F3] border border-[#B5122A]/30 rounded-xl cursor-pointer"
            >
              ড্যাশবোর্ডে প্রবেশ করুন
            </button>
          </div>
        </motion.div>
      </PageTransition>
    );
  }

  if (siteSettings.registration_enabled === 'false') {
    return (
      <PageTransition className="min-h-[75vh] bg-[#FFF1F3] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#B5122A]/25 rounded-2xl p-7 text-center shadow-md space-y-4">
          <img
            src={siteSettings.site_logo}
            alt={siteSettings.site_name}
            className="w-12 h-12 rounded-xl object-contain bg-white border border-[#E7E1E3] p-1 mx-auto"
          />
          <h1 className="font-display text-xl font-bold text-[#7F1023]">নতুন নিবন্ধন সাময়িকভাবে বন্ধ</h1>
          <p className="text-xs text-[#75686C]">
            অ্যাডমিন প্যানেল থেকে বর্তমানে নতুন সদস্য নিবন্ধন সাময়িকভাবে বন্ধ রাখা হয়েছে।
          </p>
          <Link
            to="/login"
            className="inline-block px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl"
          >
            লগইন পেজে যান
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-[85vh] bg-gradient-to-br from-[#FFF1F3] via-white to-[#FCE4E8] py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-[#E7E1E3] rounded-2xl shadow-lg overflow-hidden">
        {/* Header & Animated Progress */}
        <div className="bg-gradient-to-r from-[#171316] via-[#7F1023] to-[#B5122A] p-6 text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img
                src={siteSettings.site_logo}
                alt={siteSettings.site_name}
                className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shrink-0"
              />
              <div>
                <h1 className="font-display text-xl font-bold">{siteSettings.site_name} নিবন্ধন</h1>
                <p className="text-xs text-white/80">OTP ছাড়া সরাসরি ও নিরাপদ নিবন্ধন · ধাপ {step}/৪</p>
              </div>
            </div>
            <span className="font-mono-num text-sm font-bold text-[#FCE4E8]">{step * 25}%</span>
          </div>

          <div className="w-full h-1.5 bg-white/20 rounded-full mt-4 overflow-hidden">
            <motion.div
              className="h-full bg-[#F0445E]"
              initial={false}
              animate={{ width: `${step * 25}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Role selector */}
          {step === 1 && (
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#FFF1F3] rounded-xl border border-[#E7E1E3]">
              {[
                { id: 'donor', label: 'রক্তদাতা (Donor)' },
                { id: 'recipient', label: 'রক্তের প্রাপক' },
                { id: 'volunteer', label: 'স্বেচ্ছাসেবক' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as any)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    role === r.id
                      ? 'bg-[#B5122A] text-white shadow-xs'
                      : 'text-[#241A1D] hover:text-[#B5122A]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.18 }}
                className="space-y-3.5"
              >
                <h2 className="font-display text-base font-bold text-[#7F1023]">ধাপ ১: ব্যক্তিগত তথ্য ও ছবি</h2>
                <ProfileImagePicker
                  value={profileImage}
                  onChange={setProfileImage}
                  label="আপনার ছবি আপলোড করুন (ঐচ্ছিক — প্রোফাইল কার্ডে দেখা যাবে)"
                />
                <div>
                  <label className="block text-xs font-semibold mb-1">পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="আপনার সম্পূর্ণ নাম"
                    className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">মোবাইল নম্বর (অথবা ইমেইল)</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">ইমেইল</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">জন্মতারিখ</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">লিঙ্গ (ঐচ্ছিক)</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                    >
                      <option value="">নির্বাচন করুন</option>
                      <option value="পুরুষ">পুরুষ</option>
                      <option value="নারী">নারী</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">পাসওয়ার্ড নিশ্চিত করুন *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <h2 className="font-display text-base font-bold text-[#7F1023]">
                  {role === 'donor' ? 'ধাপ ২: রক্ত সংক্রান্ত তথ্য' : 'ধাপ ২: ভূমিকা সংক্রান্ত তথ্য'}
                </h2>

                {role === 'donor' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold mb-2">আপনার রক্তের গ্রুপ *</label>
                      <div className="grid grid-cols-4 gap-2">
                        {BLOOD_GROUPS.map((bg) => (
                          <button
                            key={bg}
                            type="button"
                            onClick={() => setBloodGroup(bg)}
                            className={`py-2.5 rounded-xl font-mono-num text-sm font-bold border transition-all cursor-pointer ${
                              bloodGroup === bg
                                ? 'bg-[#B5122A] text-white border-[#B5122A]'
                                : 'bg-[#FFF8F9] text-[#241A1D] border-[#E7E1E3] hover:border-[#B5122A]/50'
                            }`}
                          >
                            {bg}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">আগে রক্তদান করেছেন?</label>
                        <select
                          value={donatedBefore}
                          onChange={(e) => setDonatedBefore(e.target.value)}
                          className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                        >
                          <option value="no">না, এবারই প্রথম</option>
                          <option value="yes">হ্যাঁ, আগে রক্তদান করেছি</option>
                        </select>
                      </div>
                      {donatedBefore === 'yes' && (
                        <div>
                          <label className="block text-xs font-semibold mb-1">সর্বশেষ রক্তদানের তারিখ</label>
                          <input
                            type="date"
                            value={lastDonationDate}
                            onChange={(e) => setLastDonationDate(e.target.value)}
                            className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">বর্তমানে রক্তদান করতে আগ্রহী?</label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                      >
                        <option value="available">হ্যাঁ, জরুরি প্রয়োজনে প্রস্তুত</option>
                        <option value="unavailable">না, সাময়িক বিরতিতে আছি</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      {role === 'volunteer' ? 'দক্ষতা ও অভিজ্ঞতা' : 'রোগীর সাথে সম্পর্ক'}
                    </label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder={role === 'volunteer' ? 'যেমন: ক্যাম্পেইন সমন্বয়, রোগী সহায়তা' : 'যেমন: পরিবার / আত্মীয়'}
                      className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.18 }}
                className="space-y-3.5"
              >
                <h2 className="font-display text-base font-bold text-[#7F1023]">ধাপ ৩: অবস্থান ও ঠিকানা</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                    >
                      {BD_LOCATIONS.map((d) => (
                        <option key={d.division} value={d.division}>{d.division}</option>
                      ))}
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
                      className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                    >
                      {districts.map((dist) => (
                        <option key={dist.district} value={dist.district}>{dist.district}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">উপজেলা / থানা</label>
                    <select
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                    >
                      {upazilas.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={unionName}
                    onChange={(e) => setUnionName(e.target.value)}
                    placeholder="ইউনিয়ন (ঐচ্ছিক)"
                    className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
                  />
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="ওয়ার্ড (ঐচ্ছিক)"
                    className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
                  />
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="এলাকা / মহল্লা"
                    className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
                  />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বিস্তারিত ঠিকানা"
                  className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <h2 className="font-display text-base font-bold text-[#7F1023]">ধাপ ৪: গোপনীয়তা ও সম্মতি</h2>
                <div>
                  <label className="block text-xs font-semibold mb-1">নিজের সম্পর্কে সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="রক্তদান সংক্রান্ত কোনো তথ্য বা পছন্দের সময় লিখুন"
                    className="w-full rounded-xl border border-[#E7E1E3] px-3.5 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
                  />
                </div>

                {role === 'donor' && (
                  <div className="bg-[#FFF1F3] border border-[#B5122A]/25 rounded-xl p-3.5 space-y-2">
                    <p className="text-xs font-bold text-[#7F1023]">ফোন নম্বর গোপনীয়তা সেটিং</p>
                    <label className="flex items-center gap-2 text-xs text-[#241A1D] cursor-pointer">
                      <input
                        type="radio"
                        name="pv"
                        checked={phoneVisibility === 'private'}
                        onChange={() => setPhoneVisibility('private')}
                        className="accent-[#B5122A]"
                      />
                      <span>ফোন নম্বর গোপন রাখুন (শুধু অনুরোধে সম্মতি দিলে দেখা যাবে — প্রস্তাবিত)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[#241A1D] cursor-pointer">
                      <input
                        type="radio"
                        name="pv"
                        checked={phoneVisibility === 'public'}
                        onChange={() => setPhoneVisibility('public')}
                        className="accent-[#B5122A]"
                      />
                      <span>পাবলিক ডিরেক্টরিতে ফোন নম্বর দেখানোর অনুমতি দিন</span>
                    </label>
                  </div>
                )}

                <label className="flex items-start gap-2.5 text-xs text-[#241A1D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 accent-[#B5122A]"
                  />
                  <span>
                    আমি {siteSettings.site_name}-এর{' '}
                    <Link to="/terms" className="text-[#B5122A] underline">ব্যবহারের শর্তাবলি</Link> ও{' '}
                    <Link to="/privacy" className="text-[#B5122A] underline">গোপনীয়তা নীতিমালা</Link>-তে সম্মতি দিচ্ছি এবং নিশ্চিত করছি যে প্রদত্ত তথ্য সঠিক।
                  </span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p className="text-xs font-medium text-[#B5122A] bg-[#FFF1F3] border border-[#B5122A]/25 rounded-lg p-2.5">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#F5F5F6]">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#241A1D] border border-[#E7E1E3] rounded-xl hover:bg-[#F5F5F6] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>পূর্ববর্তী ধাপ</span>
              </button>
            ) : (
              <Link to="/login" className="text-xs font-semibold text-[#B5122A] hover:underline">
                ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন
              </Link>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl cursor-pointer"
              >
                <span>পরবর্তী ধাপ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] via-[#B5122A] to-[#D61F3C] rounded-xl shadow-sm cursor-pointer disabled:opacity-60"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{submitting ? 'জমা হচ্ছে...' : 'নিবন্ধন সম্পন্ন করুন'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </PageTransition>
  );
};
