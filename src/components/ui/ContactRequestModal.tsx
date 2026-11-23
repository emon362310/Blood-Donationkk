import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Donor } from '../../types';

interface Props {
  donor: Donor | null;
  onClose: () => void;
}

export const ContactRequestModal: React.FC<Props> = ({ donor, onClose }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('রোগীর জরুরি প্রয়োজনে আপনার রক্তের প্রয়োজন। অনুগ্রহ করে সম্মতি দিলে আমরা কৃতজ্ঞ থাকব।');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!donor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);
    const res = await apiRequest('/api/donor/contact-request', {
      method: 'POST',
      body: { donor_id: donor.donor_id, message }
    });
    setSubmitting(false);
    setStatusMsg({ ok: res.success, text: res.message });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-md bg-white border border-[#E7E1E3] rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="px-5 py-4 bg-gradient-to-r from-[#7F1023] to-[#B5122A] text-white flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold">ডোনারের সাথে যোগাযোগের অনুরোধ</h3>
              <p className="text-xs text-white/80">
                {donor.full_name} · রক্তের গ্রুপ {donor.blood_group}
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5">
            {!user ? (
              <div className="space-y-4 text-center py-2">
                <p className="text-sm text-[#75686C]">
                  ডোনারের গোপনীয়তা রক্ষার্থে ফোন নম্বর প্রাইভেট রাখা হয়েছে। যোগাযোগের অনুরোধ পাঠাতে অনুগ্রহ করে লগইন করুন।
                </p>
                <div className="flex gap-2 justify-center">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg"
                  >
                    লগইন করুন
                  </Link>
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-[#B5122A] border border-[#B5122A]/40 rounded-lg"
                  >
                    নিবন্ধন করুন
                  </Link>
                </div>
              </div>
            ) : statusMsg?.ok ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#B5122A] mx-auto" />
                <p className="text-sm font-semibold text-[#241A1D]">{statusMsg.text}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer"
                >
                  ঠিক আছে
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#241A1D] mb-1.5">
                    ডোনারের জন্য বার্তা
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2.5 text-sm focus:outline-none focus:border-[#B5122A]"
                  />
                </div>
                {statusMsg && !statusMsg.ok && (
                  <p className="text-xs text-[#B5122A] font-medium">{statusMsg.text}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-[#75686C] border border-[#E7E1E3] rounded-lg cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-lg disabled:opacity-60 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'পাঠানো হচ্ছে...' : 'অনুরোধ পাঠান'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
