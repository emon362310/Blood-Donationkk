import React from 'react';
import { WifiOff, Wrench } from 'lucide-react';
import { Navbar } from '../ui/Navbar';
import { Footer } from '../ui/Footer';
import { BottomNav } from '../ui/BottomNav';
import { useOnlineStatus } from '../../hooks/usePWAInstall';
import { useAuth } from '../../context/AuthContext';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isOnline = useOnlineStatus();
  const { siteSettings } = useAuth();
  const isMaintenance = siteSettings.maintenance_mode === 'true';

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F9] text-[#241A1D] pb-[72px] md:pb-24">
      <Navbar />
      {isMaintenance && (
        <div
          role="status"
          className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2"
        >
          <Wrench className="w-3.5 h-3.5 shrink-0" />
          <span>ওয়েবসাইটে বর্তমানে রক্ষণাবেক্ষণ (Maintenance) চলছে। অ্যাডমিন প্যানেল থেকে এটি নিয়ন্ত্রণ করা হচ্ছে।</span>
        </div>
      )}
      {!isOnline && (
        <div
          role="status"
          className="bg-[#171316] text-white px-4 py-2 text-xs flex items-center justify-center gap-2 border-b border-[#B5122A]"
        >
          <WifiOff className="w-3.5 h-3.5 text-[#F0445E]" />
          <span>আপনার ইন্টারনেট সংযোগ বিচ্ছিন্ন। সংযোগ ফিরে এলে নতুন তথ্য লোড হবে।</span>
        </div>
      )}
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
};
