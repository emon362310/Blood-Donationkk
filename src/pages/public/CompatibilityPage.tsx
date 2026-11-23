import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplet } from 'lucide-react';
import { BLOOD_GROUPS, BLOOD_COMPATIBILITY } from '../../data/bdLocations';
import { PageTransition } from '../../components/ui/MotionPrimitives';
import type { BloodGroup } from '../../types';

export const CompatibilityPage: React.FC = () => {
  const [selected, setSelected] = useState<BloodGroup>('O+');
  const info = BLOOD_COMPATIBILITY[selected];

  return (
    <PageTransition className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-gradient-to-r from-[#171316] via-[#7F1023] to-[#B5122A] rounded-2xl p-6 text-white">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">রক্তের গ্রুপ সামঞ্জস্যতা নির্দেশিকা</h1>
        <p className="text-xs sm:text-sm text-white/80 mt-1">
          যেকোনো একটি রক্তের গ্রুপ নির্বাচন করে দেখুন কাকে রক্ত দিতে পারবেন এবং কার থেকে নিতে পারবেন
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {BLOOD_GROUPS.map((bg) => (
          <button
            key={bg}
            type="button"
            onClick={() => setSelected(bg)}
            className={`py-3 rounded-xl font-mono-num text-sm font-bold border transition-all cursor-pointer ${
              selected === bg
                ? 'bg-[#B5122A] text-white border-[#B5122A] shadow-sm'
                : 'bg-white text-[#241A1D] border-[#E7E1E3] hover:border-[#B5122A]/50'
            }`}
          >
            {bg}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-[#75686C]">{info.frequencyNote}</p>
          <h2 className="font-display text-lg font-bold text-[#7F1023]">
            {selected} গ্রুপ যাদের রক্ত দিতে পারবেন (Can Donate To)
          </h2>
          <div className="flex flex-wrap gap-2">
            {info.canDonateTo.map((bg) => (
              <span
                key={bg}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFF1F3] border border-[#B5122A]/30 font-mono-num text-sm font-bold text-[#B5122A]"
              >
                <Droplet className="w-3.5 h-3.5 fill-[#B5122A]" />
                {bg}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-[#75686C]">ক্রস-ম্যাচিং আবশ্যক</p>
          <h2 className="font-display text-lg font-bold text-[#171316]">
            {selected} গ্রুপ যাদের থেকে রক্ত নিতে পারবেন (Can Receive From)
          </h2>
          <div className="flex flex-wrap gap-2">
            {info.canReceiveFrom.map((bg) => (
              <span
                key={bg}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#171316] font-mono-num text-sm font-bold text-white"
              >
                <Droplet className="w-3.5 h-3.5 fill-[#F0445E] text-[#F0445E]" />
                {bg}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link
          to={`/donors?blood_group=${encodeURIComponent(selected)}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl"
        >
          {selected} গ্রুপের ডোনার খুঁজুন
        </Link>
      </div>
    </PageTransition>
  );
};
