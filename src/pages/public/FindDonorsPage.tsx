import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { BLOOD_GROUPS, BD_LOCATIONS } from '../../data/bdLocations';
import { PageTransition, StaggerGrid, BloodDropLoader } from '../../components/ui/MotionPrimitives';
import { DonorCard } from '../../components/ui/DonorCard';
import { ContactRequestModal } from '../../components/ui/ContactRequestModal';
import type { Donor } from '../../types';

export const FindDonorsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [bloodGroup, setBloodGroup] = useState(searchParams.get('blood_group') || '');
  const [division, setDivision] = useState(searchParams.get('division') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [upazila, setUpazila] = useState('');
  const [area, setArea] = useState('');
  const [availability, setAvailability] = useState('');

  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 9;

  const districts = BD_LOCATIONS.find((d) => d.division === division)?.districts || [];
  const upazilas = districts.find((d) => d.district === district)?.upazilas || [];

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const q = new URLSearchParams();
      if (bloodGroup) q.set('blood_group', bloodGroup);
      if (division) q.set('division', division);
      if (district) q.set('district', district);
      if (upazila) q.set('upazila', upazila);
      if (area) q.set('area', area);
      if (availability) q.set('availability', availability);
      const res = await apiRequest<{ donors: Donor[] }>(`/api/donors/search?${q.toString()}`);
      if (res.success && res.data) {
        setDonors(res.data.donors);
        setPage(1);
      }
      setLoading(false);
    }, 220);
    return () => clearTimeout(timer);
  }, [bloodGroup, division, district, upazila, area, availability]);

  const resetFilters = () => {
    setBloodGroup('');
    setDivision('');
    setDistrict('');
    setUpazila('');
    setArea('');
    setAvailability('');
  };

  const pagedDonors = donors.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(donors.length / perPage));

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-gradient-to-r from-[#171316] via-[#7F1023] to-[#B5122A] rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">অনুমোদিত রক্তদাতা খুঁজুন</h1>
          <p className="text-xs sm:text-sm text-white/80 mt-1">
            শুধুমাত্র অ্যাডমিন-যাচাইকৃত ও সক্রিয় ডোনারদের প্রোফাইল এখানে প্রদর্শিত হয়
          </p>
        </div>
        <Link
          to="/request-blood"
          className="px-4 py-2.5 text-xs font-semibold text-[#7F1023] bg-white rounded-xl hover:bg-[#FFF1F3] whitespace-nowrap self-start sm:self-auto"
        >
          রক্তের অনুরোধ করুন
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E7E1E3] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7F1023]">
            <Filter className="w-3.5 h-3.5" />
            <span>ফিল্টার অপশন</span>
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#75686C] hover:text-[#B5122A] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
          >
            <option value="">সকল রক্তের গ্রুপ</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          <select
            value={division}
            onChange={(e) => {
              setDivision(e.target.value);
              setDistrict('');
              setUpazila('');
            }}
            className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
          >
            <option value="">সকল বিভাগ</option>
            {BD_LOCATIONS.map((d) => (
              <option key={d.division} value={d.division}>{d.division}</option>
            ))}
          </select>

          <select
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              setUpazila('');
            }}
            disabled={!division}
            className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm focus:outline-none focus:border-[#B5122A] disabled:opacity-60"
          >
            <option value="">সকল জেলা</option>
            {districts.map((dist) => (
              <option key={dist.district} value={dist.district}>{dist.district}</option>
            ))}
          </select>

          <select
            value={upazila}
            onChange={(e) => setUpazila(e.target.value)}
            disabled={!district}
            className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm focus:outline-none focus:border-[#B5122A] disabled:opacity-60"
          >
            <option value="">সকল উপজেলা</option>
            {upazilas.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#75686C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="এলাকা লিখুন..."
              className="w-full rounded-xl border border-[#E7E1E3] pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
            />
          </div>

          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-sm focus:outline-none focus:border-[#B5122A]"
          >
            <option value="">সব অবস্থা</option>
            <option value="available">রক্তদানে প্রস্তুত</option>
            <option value="unavailable">সাময়িক বিরতিতে</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <BloodDropLoader label="অনুমোদিত ডোনার খোঁজা হচ্ছে..." />
      ) : pagedDonors.length === 0 ? (
        <div className="bg-white border border-[#E7E1E3] rounded-2xl p-8 text-center space-y-3">
          <p className="font-display text-lg font-bold text-[#241A1D]">
            এই মুহূর্তে অনুসন্ধান অনুযায়ী কোনো অনুমোদিত ডোনার পাওয়া যায়নি
          </p>
          <p className="text-xs text-[#75686C] max-w-md mx-auto">
            ফিল্টার পরিবর্তন করে দেখতে পারেন অথবা জরুরি প্রয়োজনে সরাসরি রক্তের অনুরোধ জমা দিন।
          </p>
          <div className="flex justify-center gap-2">
            <Link to="/request-blood" className="px-4 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg">
              রক্তের অনুরোধ করুন
            </Link>
            <Link to="/register" className="px-4 py-2 text-xs font-semibold text-[#B5122A] border border-[#B5122A]/40 rounded-lg">
              ডোনার হিসেবে নিবন্ধন করুন
            </Link>
          </div>
        </div>
      ) : (
        <>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedDonors.map((d) => (
              <DonorCard key={d.donor_id} donor={d} onRequestContact={setSelectedDonor} />
            ))}
          </StaggerGrid>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tabular-nums cursor-pointer ${
                    page === p ? 'bg-[#B5122A] text-white' : 'bg-white border border-[#E7E1E3] text-[#241A1D]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <ContactRequestModal donor={selectedDonor} onClose={() => setSelectedDonor(null)} />
    </PageTransition>
  );
};
