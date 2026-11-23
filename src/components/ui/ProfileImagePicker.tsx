import React, { useRef, useState } from 'react';
import { Camera, Trash2, User } from 'lucide-react';

interface ProfileImagePickerProps {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
}

function resizeImageToJpeg(file: File, maxSize = 220): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ছবি পড়া যায়নি।'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('সঠিক ছবির ফাইল নির্বাচন করুন।'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        const target = Math.min(maxSize, size);
        canvas.width = target;
        canvas.height = target;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('ছবি প্রক্রিয়াকরণ করা যায়নি।'));
          return;
        }
        ctx.drawImage(img, sx, sy, size, size, 0, 0, target, target);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({
  value,
  onChange,
  label = 'প্রোফাইল ছবি (কার্ডে প্রদর্শিত হবে)'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('অনুগ্রহ করে শুধুমাত্র JPG, PNG অথবা WebP ছবি নির্বাচন করুন।');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('ছবির সাইজ ৮ মেগাবাইটের কম হতে হবে।');
      return;
    }
    try {
      setProcessing(true);
      const dataUrl = await resizeImageToJpeg(file, 220);
      onChange(dataUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ছবি আপলোড করা যায়নি।');
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="bg-[#FFF8F9] border border-[#E7E1E3] rounded-xl p-3.5 space-y-2">
      <label className="block text-xs font-semibold text-[#7F1023]">{label}</label>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#FCE4E8] border-2 border-[#B5122A]/30 flex items-center justify-center overflow-hidden shrink-0">
          {value ? (
            <img
              src={value}
              alt="প্রোফাইল ছবি প্রিভিউ"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-7 h-7 text-[#B5122A]" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={processing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#B5122A] hover:bg-[#D61F3C] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{processing ? 'প্রক্রিয়াকরণ হচ্ছে...' : value ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#75686C] hover:text-[#B5122A] border border-[#E7E1E3] bg-white rounded-lg cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>সরান</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-[#75686C]">
            স্বয়ংক্রিয়ভাবে বর্গাকার করে অপ্টিমাইজ করা হবে (JPG/PNG/WebP)।
          </p>
        </div>
      </div>
      {error && <p className="text-xs font-medium text-[#B5122A]">{error}</p>}
    </div>
  );
};
