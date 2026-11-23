import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Award, ChevronLeft, ChevronRight, Maximize2, X, PlusCircle, Droplet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { DonorPoster } from '../../types';

interface DonorPosterSliderProps {
  posters: DonorPoster[];
  title?: string;
}

export const DonorPosterSlider: React.FC<DonorPosterSliderProps> = ({ posters, title }) => {
  const { user, siteSettings, dashboardPathForRole } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightboxPoster, setLightboxPoster] = useState<DonorPoster | null>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const count = posters.length;

  useEffect(() => {
    if (activeIndex >= count && count > 0) {
      setActiveIndex(0);
    }
  }, [count, activeIndex]);

  useEffect(() => {
    if (count <= 1 || paused || lightboxPoster) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 5000);
    return () => clearInterval(timer);
  }, [count, paused, lightboxPoster]);

  const handlePrev = () => {
    if (count <= 1) return;
    setActiveIndex((prev) => (prev - 1 + count) % count);
  };

  const handleNext = () => {
    if (count <= 1) return;
    setActiveIndex((prev) => (prev + 1) % count);
  };

  // Compute visible 3-poster window on desktop when >= 2 posters
  const visiblePosters =
    count === 0
      ? []
      : count <= 3
        ? posters
        : [0, 1, 2].map((offset) => posters[(activeIndex + offset) % count]);

  return (
    <section
      className="bg-gradient-to-b from-[#FFF1F3]/80 via-[#FFF8F9] to-white border-b border-[#E7E1E3] py-7 sm:py-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7F1023] to-[#D61F3C] text-white flex items-center justify-center shadow-xs shrink-0">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-display text-lg sm:text-2xl font-extrabold text-[#171316] leading-tight">
                {title || siteSettings.poster_slider_title || 'সফল রক্তদাতাদের সম্মাননা পোস্টার'}
              </h2>
              <p className="text-xs text-[#75686C] mt-0.5">
                মানবতার সেবায় সফলভাবে রক্তদানকারী বীর ডোনারদের পূর্ণ সম্মাননা পোস্টার (বড় করে দেখতে পোস্টারে ক্লিক করুন)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                to={`${dashboardPathForRole(user?.role)}?tab=posters`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#B5122A] hover:bg-[#D61F3C] rounded-xl shadow-xs transition-colors whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>পোস্টার ম্যানেজ</span>
              </Link>
            )}
            {count > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="পূর্ববর্তী পোস্টার"
                  className="w-9 h-9 rounded-xl bg-white border border-[#E7E1E3] hover:border-[#B5122A] text-[#241A1D] hover:text-[#B5122A] flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="পরবর্তী পোস্টার"
                  className="w-9 h-9 rounded-xl bg-white border border-[#E7E1E3] hover:border-[#B5122A] text-[#241A1D] hover:text-[#B5122A] flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Empty State Placeholder (When Admin hasn't uploaded posters yet) */}
        {count === 0 ? (
          <div className="bg-white border border-[#B5122A]/20 rounded-2xl p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-20 h-24 rounded-xl bg-gradient-to-b from-[#7F1023] to-[#B5122A] p-2 flex flex-col items-center justify-center text-white shadow-md shrink-0">
                <img
                  src={siteSettings.site_logo}
                  alt={siteSettings.site_name}
                  className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                />
                <span className="text-[9px] font-bold mt-1.5 tracking-wider">{siteSettings.site_name}</span>
              </div>
              <div className="space-y-1">
                <p className="font-display text-base sm:text-lg font-bold text-[#7F1023]">
                  সফল রক্তদাতাদের সম্মাননা পোস্টার স্লাইডার
                </p>
                <p className="text-xs text-[#75686C] max-w-xl leading-relaxed">
                  যারা সফলভাবে রক্তদান সম্পন্ন করবেন, অ্যাডমিন প্যানেল থেকে তাদের পোস্টার কার্ড যুক্ত করলে সকল ব্যবহারকারী এখানে সম্পূর্ণ পোস্টার দেখতে পাবেন।
                </p>
              </div>
            </div>
            {isAdmin && (
              <Link
                to={`${dashboardPathForRole(user?.role)}?tab=posters`}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl shadow-sm whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>প্রথম পোস্টার যোগ করুন</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile Single Active Poster Card (Full Uncropped View) */}
            <div className="md:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={posters[activeIndex].poster_id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-md mx-auto"
                >
                  <PosterCardItem
                    poster={posters[activeIndex]}
                    onZoom={() => setLightboxPoster(posters[activeIndex])}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Tablet & Desktop Poster Showcase Grid (Full Uncropped Posters) */}
            <div
              className={`hidden md:grid gap-5 items-start ${
                visiblePosters.length === 1
                  ? 'grid-cols-1 max-w-md mx-auto'
                  : visiblePosters.length === 2
                    ? 'grid-cols-2 max-w-4xl mx-auto'
                    : 'grid-cols-3 max-w-6xl mx-auto'
              }`}
            >
              {visiblePosters.map((poster) => (
                <PosterCardItem
                  key={`${poster.poster_id}-${activeIndex}`}
                  poster={poster}
                  onZoom={() => setLightboxPoster(poster)}
                />
              ))}
            </div>

            {/* Indicator Dots */}
            {count > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {posters.map((p, idx) => (
                  <button
                    key={p.poster_id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`পোস্টার ${idx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === activeIndex ? 'w-7 bg-[#B5122A]' : 'w-2 bg-[#E7E1E3] hover:bg-[#B5122A]/45'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Poster Lightbox Modal */}
      <AnimatePresence>
        {lightboxPoster && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
            onClick={() => setLightboxPoster(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-[#B5122A]/30 flex flex-col max-h-[92vh]"
            >
              <button
                type="button"
                onClick={() => setLightboxPoster(null)}
                aria-label="বন্ধ করুন"
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 text-white hover:bg-[#B5122A] flex items-center justify-center shadow-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="bg-[#171316] w-full flex items-center justify-center overflow-hidden p-2">
                <img
                  src={lightboxPoster.image_url}
                  alt={lightboxPoster.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
                />
              </div>
              <div className="p-4 bg-gradient-to-r from-[#7F1023] to-[#B5122A] text-white flex items-center justify-between gap-3 shrink-0">
                <div className="min-w-0">
                  <h3 className="font-display text-base font-bold truncate">{lightboxPoster.title}</h3>
                  {lightboxPoster.subtitle && (
                    <p className="text-xs text-white/85 truncate">{lightboxPoster.subtitle}</p>
                  )}
                </div>
                {lightboxPoster.blood_group && (
                  <span className="px-3 py-1 rounded-xl bg-white text-[#B5122A] font-mono-num text-sm font-extrabold shrink-0">
                    {lightboxPoster.blood_group}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const PosterCardItem: React.FC<{ poster: DonorPoster; onZoom: () => void }> = ({ poster, onZoom }) => (
  <motion.div
    whileHover={{ y: -3 }}
    onClick={onZoom}
    className="group bg-white rounded-2xl overflow-hidden border border-[#B5122A]/25 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col"
  >
    {/* Full Uncropped Poster Showcase Frame (Zero Overlays on Poster Artwork) */}
    <div className="bg-gradient-to-b from-[#FFF8F9] to-white p-2 sm:p-2.5 flex items-center justify-center">
      <img
        src={poster.image_url}
        alt={poster.title}
        referrerPolicy="no-referrer"
        className="w-full h-auto max-h-[500px] object-contain rounded-xl group-hover:scale-[1.015] transition-transform duration-300"
      />
    </div>

    {/* Clean Caption & Blood Group Strip Below Poster */}
    <div className="px-3.5 py-3 bg-white border-t border-[#F2ECEE] flex items-center justify-between gap-2.5">
      <div className="min-w-0">
        <p className="font-display text-sm font-bold text-[#171316] leading-snug truncate">
          {poster.title}
        </p>
        {poster.subtitle && (
          <p className="text-[11px] text-[#75686C] mt-0.5 truncate">{poster.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {poster.blood_group && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF1F3] border border-[#B5122A]/25 text-[#B5122A] font-mono-num text-xs font-extrabold">
            <Droplet className="w-3 h-3 fill-[#B5122A]" />
            <span>{poster.blood_group}</span>
          </span>
        )}
        <span
          title="বড় করে দেখুন"
          className="w-8 h-8 rounded-lg bg-[#FFF8F9] border border-[#E7E1E3] text-[#75686C] group-hover:bg-[#B5122A] group-hover:text-white group-hover:border-[#B5122A] flex items-center justify-center transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  </motion.div>
);
