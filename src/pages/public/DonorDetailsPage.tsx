import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Phone, MessageSquare, ShieldCheck, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { PageTransition, BloodDropLoader } from '../../components/ui/MotionPrimitives';
import { ContactRequestModal } from '../../components/ui/ContactRequestModal';
import type { Donor } from '../../types';

export const DonorDetailsPage: React.FC = () => {
  const { id } = useParams();
  const [donor, setDonor] = useState<(Donor & { verified_donations_count?: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    apiRequest<{ donor: Donor & { verified_donations_count?: number } }>(`/api/donors/${id}`).then((res) => {
      if (res.success && res.data) setDonor(res.data.donor);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <BloodDropLoader />;

  if (!donor) {
    return (
      <PageTransition className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#B5122A]">অনুমোদিত ডোনার পাওয়া যায়নি</h1>
        <p className="text-sm text-[#75686C]">এই প্রোফাইলটি অনুমোদিত নয় অথবা বর্তমানে সক্রিয় নেই।</p>
        <Link to="/donors" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>ডোনার তালিকায় ফিরুন</span>
        </Link>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-5">
      <Link to="/donors" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B5122A] hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>সকল রক্তদাতা</span>
      </Link>

      <div className="bg-white border border-[#E7E1E3] rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#171316] via-[#7F1023] to-[#B5122A] p-6 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/60 flex items-center justify-center font-display text-2xl font-bold overflow-hidden shrink-0">
              {donor.profile_image ? (
                <img
                  src={donor.profile_image}
                  alt={donor.full_name || 'রক্তদাতা'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                donor.full_name?.charAt(0) || 'র'
              )}
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold">{donor.full_name}</h1>
              <p className="text-xs text-white/85 flex items-center gap-1 mt-1">
                <ShieldCheck className="w-4 h-4 text-[#F0445E]" />
                <span>অ্যাডমিন যাচাইকৃত রক্তদাতা</span>
              </p>
            </div>
          </div>

          <span className="px-4 py-2 rounded-xl bg-white text-[#B5122A] font-mono-num text-xl font-bold">
            {donor.blood_group}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FFF8F9] border border-[#E7E1E3] rounded-xl p-3.5">
              <p className="text-xs text-[#75686C] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#B5122A]" /> অবস্থান
              </p>
              <p className="text-sm font-semibold text-[#241A1D] mt-1">
                {[donor.area, donor.upazila, donor.district, donor.division].filter(Boolean).join(', ')}
              </p>
            </div>
            <div className="bg-[#FFF8F9] border border-[#E7E1E3] rounded-xl p-3.5">
              <p className="text-xs text-[#75686C] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#B5122A]" /> সর্বশেষ রক্তদান
              </p>
              <p className="text-sm font-semibold text-[#241A1D] mt-1 tabular-nums">
                {donor.last_donation_date || 'উল্লেখ নেই'}
              </p>
            </div>
            <div className="bg-[#FFF8F9] border border-[#E7E1E3] rounded-xl p-3.5">
              <p className="text-xs text-[#75686C]">যাচাইকৃত রক্তদান</p>
              <p className="text-sm font-semibold text-[#B5122A] mt-1 tabular-nums">
                {donor.verified_donations_count || 0} বার
              </p>
            </div>
          </div>

          {donor.bio && (
            <div className="border-t border-[#F5F5F6] pt-3">
              <p className="text-xs font-semibold text-[#75686C] mb-1">সংক্ষিপ্ত বিবরণ</p>
              <p className="text-sm text-[#241A1D]">{donor.bio}</p>
            </div>
          )}

          <div className="pt-2">
            {donor.phone ? (
              <a
                href={`tel:${donor.phone}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl tabular-nums shadow-sm hover:brightness-110 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>সরাসরি কল করুন: {donor.phone}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>যোগাযোগের অনুরোধ পাঠান</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <ContactRequestModal donor={modalOpen ? donor : null} onClose={() => setModalOpen(false)} />
    </PageTransition>
  );
};
