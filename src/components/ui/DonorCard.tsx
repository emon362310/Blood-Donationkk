import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, User as UserIcon, CheckCircle2, Clock } from 'lucide-react';
import { StaggerCard } from './MotionPrimitives';
import type { Donor } from '../../types';

interface DonorCardProps {
  donor: Donor;
  onRequestContact?: (donor: Donor) => void;
  isPendingPreview?: boolean;
}

const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBengaliDigits(numStr: string): string {
  return numStr.replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

export function formatBengaliDate(dateStr?: string): string {
  if (!dateStr) return 'এখনো রক্তদান করেননি';
  const trimmed = dateStr.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (!match) return toBengaliDigits(trimmed);
  const year = toBengaliDigits(match[1]);
  const monthIdx = Number(match[2]) - 1;
  const day = toBengaliDigits(String(Number(match[3])));
  const monthName = BN_MONTHS[monthIdx] || match[2];
  return `${day} ${monthName} ${year}`;
}

export const DonorCard: React.FC<DonorCardProps> = ({
  donor,
  onRequestContact,
  isPendingPreview = false
}) => {
  const navigate = useNavigate();
  const isAvailable = donor.availability === 'available';
  const locationText =
    [donor.upazila, donor.district].filter(Boolean).join(', ') || donor.division || 'বাংলাদেশ';

  const handleMessageClick = () => {
    if (isPendingPreview) {
      navigate('/dashboard/donor');
      return;
    }
    if (onRequestContact) {
      onRequestContact(donor);
    } else {
      navigate(`/donors/${donor.donor_id}`);
    }
  };

  const handleContactClick = () => {
    if (isPendingPreview) {
      navigate('/dashboard/donor');
      return;
    }
    if (onRequestContact) {
      onRequestContact(donor);
    } else {
      navigate(`/donors/${donor.donor_id}`);
    }
  };

  return (
    <StaggerCard className="bg-gradient-to-br from-[#8F0E22] via-[#B5122A] to-[#D61F3C] text-white border border-[#F0445E]/40 rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
      {/* Top Row: Circular Photo + Name/Location/Availability + Blood Group */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {isPendingPreview ? (
            <div className="w-14 h-14 rounded-full border-2 border-white/80 bg-white/15 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {donor.profile_image ? (
                <img
                  src={donor.profile_image}
                  alt={donor.full_name || 'রক্তদাতা'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-6 h-6 text-white" />
              )}
            </div>
          ) : (
            <Link
              to={`/donors/${donor.donor_id}`}
              className="w-14 h-14 rounded-full border-2 border-white/80 bg-white/15 flex items-center justify-center overflow-hidden shrink-0 shadow-sm hover:scale-105 transition-transform"
            >
              {donor.profile_image ? (
                <img
                  src={donor.profile_image}
                  alt={donor.full_name || 'রক্তদাতা'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-6 h-6 text-white" />
              )}
            </Link>
          )}

          <div className="min-w-0">
            {isPendingPreview ? (
              <h3 className="font-display text-base sm:text-lg font-bold text-white truncate leading-snug">
                {donor.full_name || 'নিবন্ধিত রক্তদাতা'}
              </h3>
            ) : (
              <Link to={`/donors/${donor.donor_id}`} className="block group">
                <h3 className="font-display text-base sm:text-lg font-bold text-white truncate leading-snug group-hover:underline">
                  {donor.full_name || 'নিবন্ধিত রক্তদাতা'}
                </h3>
              </Link>
            )}
            <p className="text-xs text-white/85 truncate mt-0.5">{locationText}</p>
            <p
              className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${
                isAvailable ? 'text-[#BBF7D0]' : 'text-white/75'
              }`}
            >
              {isAvailable ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{isAvailable ? 'রক্তদানে আগ্রহী' : 'সাময়িক বিরতিতে'}</span>
            </p>
          </div>
        </div>

        <span className="font-mono-num text-2xl sm:text-3xl font-extrabold text-white tracking-tight shrink-0 leading-none pt-0.5">
          {donor.blood_group}
        </span>
      </div>

      {/* Hairline Divider & Last Donation Row */}
      <div className="border-t border-white/20 my-3.5 pt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-white/80 font-medium">সর্বশেষ রক্তদান</span>
        <span className="font-display text-sm font-bold text-white tabular-nums text-right">
          {formatBengaliDate(donor.last_donation_date)}
        </span>
      </div>

      {/* 2 Side-by-Side Action Buttons: যোগাযোগ + মেসেজ */}
      <div className="grid grid-cols-2 gap-2.5">
        {!isPendingPreview && donor.phone ? (
          <a
            href={`tel:${donor.phone}`}
            title={donor.phone}
            className="flex flex-col items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-white text-[#9E1028] hover:bg-[#FFF1F3] font-semibold text-xs transition-all min-h-[54px] shadow-xs"
          >
            <Phone className="w-4 h-4" />
            <span>যোগাযোগ</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={handleContactClick}
            className="flex flex-col items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-white text-[#9E1028] hover:bg-[#FFF1F3] font-semibold text-xs transition-all min-h-[54px] shadow-xs cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>যোগাযোগ</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleMessageClick}
          className="flex flex-col items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold text-xs transition-all min-h-[54px] cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>মেসেজ</span>
        </button>
      </div>

      {/* Footer note */}
      {isPendingPreview ? (
        <p className="mt-2.5 pt-2 border-t border-white/15 text-[11px] text-white/85 text-center">
          আপনার প্রোফাইল (অ্যাডমিন অনুমোদনের পর সবার কাছে দৃশ্যমান হবে)
        </p>
      ) : (
        <Link
          to={`/donors/${donor.donor_id}`}
          className="mt-2.5 pt-2 border-t border-white/15 text-[11px] text-white/85 hover:text-white text-center block transition-colors"
        >
          প্রোফাইল বিস্তারিত দেখুন →
        </Link>
      )}
    </StaggerCard>
  );
};
