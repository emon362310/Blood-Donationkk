import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  LayoutGrid, ShieldCheck, Activity, Users, Calendar, FileText, Settings,
  History, KeyRound, MapPin, Download, Printer, Database, UserCog, BookOpen,
  Image as ImageIcon, Trash2, Eye, EyeOff, RefreshCw, MessageSquare, Upload, PlusCircle
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth, DEFAULT_LOGO_PATH } from '../../context/AuthContext';
import { DashboardLayout, SidebarItem } from '../../components/layout/DashboardLayout';
import { BloodDropLoader, StaggerGrid, StaggerCard } from '../../components/ui/MotionPrimitives';
import { BLOOD_GROUPS, BD_LOCATIONS } from '../../data/bdLocations';

interface AdminDashboardProps {
  isSuperAdmin?: boolean;
}

/**
 * Compresses an uploaded image file so that its base64 dataUrl fits comfortably
 * inside a single Google Sheets cell (<= 44,000 characters) while maintaining crisp quality.
 */
function compressImageForSheet(
  file: File,
  maxWidth: number,
  maxHeight: number,
  maxChars = 44000
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ছবি পড়া যায়নি।'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('সঠিক ছবির ফাইল নির্বাচন করুন।'));
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        const w = Math.max(120, Math.round(img.width * ratio));
        const h = Math.max(120, Math.round(img.height * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('ছবি প্রক্রিয়াকরণ করা যায়নি।'));
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        let quality = 0.82;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length > maxChars && quality > 0.35) {
          quality -= 0.08;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        if (dataUrl.length > maxChars) {
          // Final downscale pass to guarantee Sheet compatibility
          canvas.width = Math.round(w * 0.72);
          canvas.height = Math.round(h * 0.72);
          const ctx2 = canvas.getContext('2d');
          if (ctx2) {
            ctx2.fillStyle = '#FFFFFF';
            ctx2.fillRect(0, 0, canvas.width, canvas.height);
            ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
            dataUrl = canvas.toDataURL('image/jpeg', 0.65);
          }
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isSuperAdmin = false }) => {
  const { refreshSettings } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [overview, setOverview] = useState<any>(null);

  // Donor verification state
  const [selectedDonorId, setSelectedDonorId] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyResult, setVerifyResult] = useState('তথ্য সঠিক');

  // Poster Slider creation
  const posterInputRef = useRef<HTMLInputElement>(null);
  const [posterTitle, setPosterTitle] = useState('');
  const [posterSubtitle, setPosterSubtitle] = useState('');
  const [posterBg, setPosterBg] = useState('');
  const [posterOrder, setPosterOrder] = useState(1);
  const [posterImage, setPosterImage] = useState('');
  const [posterBusy, setPosterBusy] = useState(false);

  // Campaign creation
  const [cmpTitle, setCmpTitle] = useState('');
  const [cmpDate, setCmpDate] = useState('');
  const [cmpVenue, setCmpVenue] = useState('');
  const [cmpDistrict, setCmpDistrict] = useState('ঢাকা');
  const [cmpDesc, setCmpDesc] = useState('');

  // Blog creation
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCat, setBlogCat] = useState('স্বাস্থ্য সচেতনতা');
  const [blogContent, setBlogContent] = useState('');

  // Password reset fulfillment
  const [resetId, setResetId] = useState('');
  const [tempPass, setTempPass] = useState('');

  // Representative & Area Assignment (Super Admin / Admin)
  const [repUserId, setRepUserId] = useState('');
  const [assignRepId, setAssignRepId] = useState('');
  const [assignLevel, setAssignLevel] = useState('district');
  const [assignDiv, setAssignDiv] = useState('চট্টগ্রাম');
  const [assignDist, setAssignDist] = useState('চট্টগ্রাম');
  const [assignUpazila, setAssignUpazila] = useState('হাটহাজারী');
  const [assignArea, setAssignArea] = useState('');
  const [assignPermLevel, setAssignPermLevel] = useState('standard');

  // Task assignment
  const [taskRepId, setTaskRepId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');

  // Website Settings state
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [syncingSheet, setSyncingSheet] = useState(false);

  // Analytics Filters
  const [areaFilter, setAreaFilter] = useState('');

  const ITEMS: SidebarItem[] = [
    { id: 'overview', label: 'ওভারভিউ ও রিপোর্ট', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'posters', label: 'পোস্টার স্লাইডার', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'verify_donors', label: 'ডোনার যাচাইকরণ', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'requests', label: 'রক্তের অনুরোধ', icon: <Activity className="w-4 h-4" /> },
    { id: 'representatives', label: 'এলাকা প্রতিনিধি', icon: <MapPin className="w-4 h-4" /> },
    { id: 'users', label: 'ব্যবহারকারী', icon: <Users className="w-4 h-4" /> },
    { id: 'campaigns', label: 'ক্যাম্পেইন ও ব্লগ', icon: <Calendar className="w-4 h-4" /> },
    { id: 'donations', label: 'রক্তদান ও স্বেচ্ছাসেবক', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'messages', label: 'যোগাযোগ বার্তা', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'settings', label: 'ওয়েবসাইট নিয়ন্ত্রণ', icon: <Settings className="w-4 h-4" /> },
    ...(isSuperAdmin
      ? [{ id: 'super_system', label: 'সুপার অ্যাডমিন ও ব্যাকআপ', icon: <Database className="w-4 h-4" /> }]
      : [])
  ];

  const loadData = async () => {
    setLoading(true);
    const res = await apiRequest<any>('/api/admin/overview');
    if (res.success && res.data) {
      setOverview(res.data);
      const map: Record<string, string> = {};
      (res.data.settings || []).forEach((s: any) => {
        map[s.setting_key] = s.setting_value;
      });
      setSettingsMap(map);
      setPosterOrder((res.data.posters?.length || 0) + 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const qTab = searchParams.get('tab');
    if (qTab) setTab(qTab);
  }, [searchParams]);

  // ========== POSTER HANDLERS ==========
  const handlePosterFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPosterBusy(true);
      const compressed = await compressImageForSheet(file, 720, 720, 44000);
      setPosterImage(compressed);
      setToast('পোস্টারের ছবি প্রস্তুত হয়েছে! এখন "পোস্টার সেভ ও প্রকাশ করুন" চাপুন।');
    } catch (err: any) {
      setToast(err?.message || 'ছবি প্রক্রিয়াকরণ করা যায়নি।');
    } finally {
      setPosterBusy(false);
      if (posterInputRef.current) posterInputRef.current.value = '';
    }
  };

  const handleCreatePoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posterImage) {
      setToast('অনুগ্রহ করে প্রথমে একটি পোস্টারের ছবি আপলোড করুন অথবা ছবির লিংক দিন।');
      return;
    }
    setPosterBusy(true);
    const res = await apiRequest('/api/admin/posters', {
      method: 'POST',
      body: {
        title: posterTitle.trim() || 'সফল রক্তদান সম্মাননা',
        subtitle: posterSubtitle.trim(),
        blood_group: posterBg,
        sort_order: Number(posterOrder) || 1,
        image_url: posterImage
      }
    });
    setPosterBusy(false);
    setToast(res.message);
    if (res.success) {
      setPosterTitle('');
      setPosterSubtitle('');
      setPosterBg('');
      setPosterImage('');
      await loadData();
    }
  };

  const handleTogglePoster = async (posterId: string) => {
    const res = await apiRequest(`/api/admin/posters/${posterId}/toggle`, { method: 'POST', body: {} });
    setToast(res.message);
    await loadData();
  };

  const handleDeletePoster = async (posterId: string) => {
    const res = await apiRequest(`/api/admin/posters/${posterId}/delete`, { method: 'POST', body: {} });
    setToast(res.message);
    await loadData();
  };

  // ========== LOGO & WEBSITE CONTROL HANDLERS ==========
  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageForSheet(file, 260, 260, 40000);
      setSettingsMap((prev) => ({ ...prev, site_logo: compressed }));
      setToast('নতুন লোগো প্রস্তুত। সংরক্ষণ করতে "সকল সেটিংস সংরক্ষণ করুন" বাটনে ক্লিক করুন।');
    } catch (err: any) {
      setToast(err?.message || 'লোগো আপলোড করা যায়নি।');
    } finally {
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/admin/settings', {
      method: 'POST',
      body: { settings: settingsMap }
    });
    setToast(res.message);
    if (res.success) {
      await refreshSettings();
      await loadData();
    }
  };

  const handleManualSheetSync = async () => {
    setSyncingSheet(true);
    const res = await apiRequest('/api/admin/sheet-sync', { method: 'POST', body: {} });
    setSyncingSheet(false);
    setToast(res.message);
    await loadData();
    await refreshSettings();
  };

  // ========== DONOR, REQUEST, CAMPAIGN, BLOG HANDLERS ==========
  const handleVerifyDonor = async (donorId: string, status: string) => {
    const res = await apiRequest(`/api/admin/donors/${donorId}/verify`, {
      method: 'POST',
      body: {
        status,
        verification_result: verifyResult,
        notes: verifyNotes,
        verified_phone: true,
        verified_blood_group: true
      }
    });
    setToast(res.message);
    if (res.success) {
      setSelectedDonorId('');
      setVerifyNotes('');
      await loadData();
    }
  };

  const handleDeleteDonor = async (donorId: string) => {
    const res = await apiRequest(`/api/admin/donors/${donorId}/delete`, { method: 'POST', body: {} });
    setToast(res.message);
    await loadData();
  };

  const handleRequestAction = async (id: string, action: string) => {
    const res = await apiRequest(`/api/requests/${id}/action`, { method: 'POST', body: { action } });
    setToast(res.message);
    await loadData();
  };

  const handleDeleteRequest = async (id: string) => {
    const res = await apiRequest(`/api/admin/requests/${id}/delete`, { method: 'POST', body: {} });
    setToast(res.message);
    await loadData();
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/campaigns', {
      method: 'POST',
      body: {
        campaign_title: cmpTitle,
        event_date: cmpDate,
        venue: cmpVenue,
        district: cmpDistrict,
        campaign_description: cmpDesc
      }
    });
    setToast(res.message);
    if (res.success) {
      setCmpTitle('');
      setCmpDate('');
      setCmpVenue('');
      setCmpDesc('');
      await loadData();
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    const res = await apiRequest(`/api/admin/campaigns/${id}/delete`, { method: 'POST', body: {} });
    setToast(res.message);
    await loadData();
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/blogs', {
      method: 'POST',
      body: { title: blogTitle, category: blogCat, content: blogContent }
    });
    setToast(res.message);
    if (res.success) {
      setBlogTitle('');
      setBlogContent('');
      await loadData();
    }
  };

  const handleDeleteBlog = async (id: string) => {
    const res = await apiRequest(`/api/admin/blogs/${id}/delete`, { method: 'POST', body: {} });
    setToast(res.message);
    await loadData();
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/admin/password-reset/complete', {
      method: 'POST',
      body: { reset_id: resetId, temporary_password: tempPass }
    });
    setToast(res.message);
    if (res.success) {
      setResetId('');
      setTempPass('');
      await loadData();
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    const res = await apiRequest(`/api/admin/users/${userId}`, { method: 'POST', body: updates });
    setToast(res.message);
    await loadData();
  };

  const handleCreateRep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repUserId) return;
    const res = await apiRequest('/api/admin/representatives', { method: 'POST', body: { user_id: repUserId } });
    setToast(res.message);
    await loadData();
  };

  const handleAssignArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignRepId) return;
    const res = await apiRequest(`/api/admin/representatives/${assignRepId}/assign-area`, {
      method: 'POST',
      body: {
        assignment_level: assignLevel,
        division: assignDiv,
        district: assignLevel === 'division' ? '' : assignDist,
        upazila: ['upazila', 'area'].includes(assignLevel) ? assignUpazila : '',
        area: assignLevel === 'area' ? assignArea : '',
        permission_level: assignPermLevel
      }
    });
    setToast(res.message);
    await loadData();
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    const res = await apiRequest(`/api/admin/representatives/assignments/${assignmentId}/remove`, {
      method: 'POST',
      body: {}
    });
    setToast(res.message);
    await loadData();
  };

  const handleToggleRepPerm = async (repId: string, perms: any, key: string) => {
    const updated = { ...perms, [key]: !perms[key] };
    const res = await apiRequest(`/api/admin/representatives/${repId}/permissions`, {
      method: 'POST',
      body: updated
    });
    setToast(res.message);
    await loadData();
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskRepId) return;
    const res = await apiRequest(`/api/admin/representatives/${taskRepId}/task`, {
      method: 'POST',
      body: { title: taskTitle, description: taskDesc, priority: 'High' }
    });
    setToast(res.message);
    if (res.success) {
      setTaskTitle('');
      setTaskDesc('');
    }
  };

  const handleExportCsv = () => {
    if (!overview?.donors) return;
    const headers = ['donor_id', 'full_name', 'blood_group', 'phone', 'division', 'district', 'upazila', 'verification_status'];
    const rows = overview.donors.map((d: any) => headers.map((h) => `"${String(d[h] || '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloodix_donors_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadBackup = async () => {
    const res = await apiRequest<{ backup: any }>('/api/super-admin/backup');
    if (!res.success || !res.data) {
      setToast(res.message);
      return;
    }
    const blob = new Blob([JSON.stringify(res.data.backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BLOODIX_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const districts = BD_LOCATIONS.find((d) => d.division === assignDiv)?.districts || [];
  const upazilas = districts.find((d) => d.district === assignDist)?.upazilas || [];

  return (
    <DashboardLayout
      title={isSuperAdmin ? 'BLOODIX সুপার অ্যাডমিন কন্ট্রোল প্যানেল' : 'BLOODIX অ্যাডমিন ড্যাশবোর্ড'}
      roleLabel={isSuperAdmin ? 'সুপার অ্যাডমিন' : 'অ্যাডমিন'}
      items={ITEMS}
      activeTab={tab}
      onTabChange={setTab}
    >
      {toast && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#FFF1F3] border border-[#B5122A]/30 text-xs font-semibold text-[#7F1023] flex items-center justify-between gap-3 no-print">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')} className="cursor-pointer shrink-0">✕</button>
        </div>
      )}

      {loading ? (
        <BloodDropLoader />
      ) : !overview ? null : (
        <>
          {/* OVERVIEW & ANALYTICS */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 no-print">
                <div className="flex items-center gap-2">
                  <select
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    className="rounded-xl border border-[#E7E1E3] bg-white px-3 py-1.5 text-xs"
                  >
                    <option value="">সকল জেলা (রিপোর্ট ফিল্টার)</option>
                    {BD_LOCATIONS.flatMap((d) => d.districts).map((dist) => (
                      <option key={dist.district} value={dist.district}>{dist.district}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTab('posters')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> পোস্টার যুক্ত করুন ({overview.stats.total_posters || 0})
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#B5122A] bg-[#FFF1F3] border border-[#B5122A]/30 rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV এক্সপোর্ট
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#171316] rounded-lg cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> প্রিন্ট রিপোর্ট
                  </button>
                </div>
              </div>

              <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'মোট ডোনার', val: overview.stats.total_donors },
                  { label: 'অনুমোদিত ডোনার', val: overview.stats.approved_donors },
                  { label: 'যাচাই বাকি', val: overview.stats.pending_donors },
                  { label: 'মোট অনুরোধ', val: overview.stats.total_requests },
                  { label: 'সম্মাননা পোস্টার', val: overview.stats.total_posters || 0 },
                  { label: 'এলাকা প্রতিনিধি', val: overview.stats.total_representatives }
                ].map((k) => (
                  <StaggerCard key={k.label} className="bg-white border border-[#E7E1E3] rounded-xl p-4">
                    <p className="text-[11px] text-[#75686C]">{k.label}</p>
                    <p className="font-mono-num text-2xl font-bold text-[#B5122A] mt-1">{k.val}</p>
                  </StaggerCard>
                ))}
              </StaggerGrid>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5">
                  <h2 className="font-display text-sm font-bold text-[#7F1023] mb-4">রক্তের গ্রুপ অনুযায়ী ডোনার</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overview.analytics.blood_group_distribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E7E1E3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="total" name="মোট ডোনার" fill="#7F1023" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="approved" name="অনুমোদিত" fill="#D61F3C" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5">
                  <h2 className="font-display text-sm font-bold text-[#7F1023] mb-4">জেলা ভিত্তিক ডোনার পরিসংখ্যান</h2>
                  {overview.analytics.district_distribution.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-xs text-[#75686C]">
                      ডোনার নিবন্ধিত হলে এখানে জেলা ভিত্তিক চার্ট দেখা যাবে।
                    </div>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={
                            areaFilter
                              ? overview.analytics.district_distribution.filter((d: any) => d.district === areaFilter)
                              : overview.analytics.district_distribution
                          }
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E7E1E3" />
                          <XAxis dataKey="district" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="count" name="ডোনার সংখ্যা" fill="#B5122A" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* POSTER SLIDER MANAGEMENT */}
          {tab === 'posters' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Create Poster Form */}
                <form
                  onSubmit={handleCreatePoster}
                  className="lg:col-span-5 bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-4 shadow-2xs"
                >
                  <div>
                    <h2 className="font-display text-base font-bold text-[#7F1023] flex items-center gap-2">
                      <PlusCircle className="w-4 h-4" /> সফল রক্তদান সম্মাননা পোস্টার যুক্ত করুন
                    </h2>
                    <p className="text-[11px] text-[#75686C] mt-0.5">
                      এখান থেকে সেভ করা প্রতিটি পোস্টার হোমপেজের মেইন সেকশনের নিচে সম্মাননা পোস্টার স্লাইডারে সম্পূর্ণ আকারে প্রদর্শিত হবে।
                    </p>
                  </div>

                  {/* Poster Upload Box */}
                  <div className="bg-[#FFF8F9] border border-dashed border-[#B5122A]/40 rounded-xl p-4 space-y-3">
                    <input
                      ref={posterInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePosterFile}
                      className="hidden"
                    />
                    <div className="flex items-start gap-4">
                      <div className="w-28 min-h-[112px] max-h-36 rounded-xl bg-white border border-[#E7E1E3] p-1 overflow-hidden flex items-center justify-center shrink-0">
                        {posterImage ? (
                          <img src={posterImage} alt="পোস্টার প্রিভিউ" className="w-full h-auto max-h-32 object-contain rounded-lg" />
                        ) : (
                          <ImageIcon className="w-7 h-7 text-[#B5122A]/30" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <button
                          type="button"
                          onClick={() => posterInputRef.current?.click()}
                          disabled={posterBusy}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#B5122A] hover:bg-[#D61F3C] rounded-xl cursor-pointer disabled:opacity-60"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{posterBusy ? 'প্রক্রিয়াকরণ হচ্ছে...' : 'পোস্টার ছবি আপলোড করুন'}</span>
                        </button>
                        <input
                          type="url"
                          value={posterImage.startsWith('data:') ? '' : posterImage}
                          onChange={(e) => setPosterImage(e.target.value)}
                          placeholder="অথবা ছবির HTTPS লিংক দিন"
                          className="w-full rounded-lg border border-[#E7E1E3] bg-white px-2.5 py-1.5 text-xs"
                        />
                        <p className="text-[10px] text-[#75686C]">
                          স্বয়ংক্রিয়ভাবে Google Sheet উপযোগী পোস্টার সাইজে অপ্টিমাইজ হবে।
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">পোস্টার শিরোনাম / ডোনারের নাম *</label>
                    <input
                      type="text"
                      required
                      value={posterTitle}
                      onChange={(e) => setPosterTitle(e.target.value)}
                      placeholder="যেমন: মো: রাকিবুল ইসলাম — সফল রক্তদান"
                      className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs focus:outline-none focus:border-[#B5122A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">রক্তের গ্রুপ</label>
                      <select
                        value={posterBg}
                        onChange={(e) => setPosterBg(e.target.value)}
                        className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs bg-white"
                      >
                        <option value="">নির্বাচন (ঐচ্ছিক)</option>
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">প্রদর্শনের ক্রম</label>
                      <input
                        type="number"
                        min={1}
                        value={posterOrder}
                        onChange={(e) => setPosterOrder(Number(e.target.value) || 1)}
                        className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">উপ-শিরোনাম / তারিখ ও স্থান (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={posterSubtitle}
                      onChange={(e) => setPosterSubtitle(e.target.value)}
                      placeholder="যেমন: ঢাকা মেডিকেল · ২০ নভেম্বর ২০২৬"
                      className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs focus:outline-none focus:border-[#B5122A]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={posterBusy}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl shadow-sm hover:brightness-110 cursor-pointer disabled:opacity-60"
                  >
                    পোস্টার সেভ ও প্রকাশ করুন
                  </button>
                </form>

                {/* Saved Posters Grid */}
                <div className="lg:col-span-7 bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-base font-bold text-[#171316]">
                      সংরক্ষিত পোস্টারসমূহ ({(overview.posters || []).length}টি)
                    </h2>
                    <span className="text-[11px] text-[#75686C]">হোমপেজ স্লাইডারে প্রদর্শিত</span>
                  </div>

                  {(overview.posters || []).length === 0 ? (
                    <div className="py-12 text-center bg-[#FFF8F9] rounded-xl border border-[#E7E1E3]">
                      <ImageIcon className="w-8 h-8 text-[#B5122A]/40 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-[#241A1D]">এখনো কোনো পোস্টার যুক্ত করা হয়নি</p>
                      <p className="text-[11px] text-[#75686C] mt-0.5">
                        বাম পাশের ফর্ম থেকে সফল রক্তদাতাদের সম্মাননা পোস্টার আপলোড করুন।
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                      {overview.posters.map((p: any) => (
                        <div
                          key={p.poster_id}
                          className="border border-[#E7E1E3] rounded-xl overflow-hidden bg-white flex flex-col shadow-2xs"
                        >
                          <div className="bg-[#FFF8F9] p-2 flex items-center justify-center border-b border-[#F2ECEE]">
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className={`w-full h-auto max-h-64 object-contain rounded-lg ${p.is_active === false ? 'opacity-45 grayscale' : ''}`}
                            />
                          </div>
                          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between bg-white">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-1.5">
                                {p.blood_group ? (
                                  <span className="px-2 py-0.5 rounded bg-[#FFF1F3] border border-[#B5122A]/25 text-[#B5122A] font-mono-num text-[11px] font-bold">
                                    {p.blood_group}
                                  </span>
                                ) : (
                                  <span />
                                )}
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    p.is_active !== false ? 'bg-emerald-600 text-white' : 'bg-[#171316] text-white'
                                  }`}
                                >
                                  {p.is_active !== false ? 'দৃশ্যমান' : 'লুকানো'}
                                </span>
                              </div>
                              <p className="font-display text-xs font-bold text-[#171316] line-clamp-1">{p.title}</p>
                              {p.subtitle && <p className="text-[11px] text-[#75686C] line-clamp-1">{p.subtitle}</p>}
                            </div>
                            <div className="flex items-center gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => handleTogglePoster(p.poster_id)}
                                className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-semibold border border-[#E7E1E3] hover:border-[#B5122A] rounded-lg cursor-pointer"
                              >
                                {p.is_active !== false ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                <span>{p.is_active !== false ? 'লুকান' : 'দেখান'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePoster(p.poster_id)}
                                className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 text-[11px] font-semibold text-white bg-[#171316] hover:bg-[#B5122A] rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>মুছুন</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DONOR VERIFICATION QUEUE */}
          {tab === 'verify_donors' && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-[#171316]">ডোনার তথ্য যাচাই, অনুমোদন ও নিয়ন্ত্রণ</h2>
              {selectedDonorId && (
                <div className="bg-[#FFF1F3] border border-[#B5122A]/35 rounded-2xl p-5 space-y-3">
                  <h3 className="font-display text-sm font-bold text-[#7F1023]">ফোন যাচাই নোট ও সিদ্ধান্ত ({selectedDonorId})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select value={verifyResult} onChange={(e) => setVerifyResult(e.target.value)} className="rounded-xl border border-[#E7E1E3] bg-white px-3 py-2 text-xs">
                      <option value="ফোনে যোগাযোগ করেছেন">ফোনে যোগাযোগ করেছেন</option>
                      <option value="যোগাযোগ করা যায়নি">যোগাযোগ করা যায়নি</option>
                      <option value="তথ্য সঠিক">তথ্য সঠিক</option>
                      <option value="তথ্য ভুল">তথ্য ভুল</option>
                      <option value="রক্তের গ্রুপ নিশ্চিত">রক্তের গ্রুপ নিশ্চিত</option>
                    </select>
                    <input type="text" value={verifyNotes} onChange={(e) => setVerifyNotes(e.target.value)} placeholder="যাচাইয়ের নোট লিখুন" className="rounded-xl border border-[#E7E1E3] bg-white px-3 py-2 text-xs" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => handleVerifyDonor(selectedDonorId, 'Phone Contacted')} className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#E7E1E3] rounded-lg cursor-pointer">ফোনে যোগাযোগ হয়েছে</button>
                    <button type="button" onClick={() => handleVerifyDonor(selectedDonorId, 'Approved')} className="px-3 py-1.5 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer">অনুমোদন (Approve)</button>
                    <button type="button" onClick={() => handleVerifyDonor(selectedDonorId, 'Correction Required')} className="px-3 py-1.5 text-xs font-semibold text-[#7F1023] bg-[#FCE4E8] rounded-lg cursor-pointer">সংশোধন প্রয়োজন</button>
                    <button type="button" onClick={() => handleVerifyDonor(selectedDonorId, 'Rejected')} className="px-3 py-1.5 text-xs font-semibold text-white bg-[#171316] rounded-lg cursor-pointer">প্রত্যাখ্যান (Reject)</button>
                    <button type="button" onClick={() => handleVerifyDonor(selectedDonorId, 'Suspended')} className="px-3 py-1.5 text-xs font-semibold text-[#75686C] bg-white border border-[#E7E1E3] rounded-lg cursor-pointer">স্থগিত (Suspend)</button>
                    <button type="button" onClick={() => setSelectedDonorId('')} className="px-3 py-1.5 text-xs text-[#75686C] cursor-pointer">বন্ধ করুন</button>
                  </div>
                </div>
              )}

              <div className="bg-white border border-[#E7E1E3] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF1F3] text-[#7F1023]">
                    <tr>
                      <th className="p-3">ডোনার</th>
                      <th className="p-3">গ্রুপ</th>
                      <th className="p-3">মোবাইল</th>
                      <th className="p-3">এলাকা</th>
                      <th className="p-3">যাচাই অবস্থা</th>
                      <th className="p-3">সিদ্ধান্ত</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F5F6]">
                    {overview.donors.length === 0 ? (
                      <tr><td colSpan={6} className="p-5 text-center text-[#75686C]">কোনো নিবন্ধিত ডোনার নেই।</td></tr>
                    ) : (
                      overview.donors.map((d: any) => (
                        <tr key={d.donor_id}>
                          <td className="p-3 font-semibold">
                            <div className="flex items-center gap-2">
                              {d.profile_image ? (
                                <img src={d.profile_image} alt={d.full_name} className="w-7 h-7 rounded-full object-cover border border-[#E7E1E3]" />
                              ) : (
                                <span className="w-7 h-7 rounded-full bg-[#FCE4E8] text-[#B5122A] flex items-center justify-center font-bold text-[11px]">
                                  {d.full_name?.charAt(0) || 'D'}
                                </span>
                              )}
                              <span>{d.full_name}</span>
                            </div>
                          </td>
                          <td className="p-3 font-mono-num font-bold text-[#B5122A]">{d.blood_group}</td>
                          <td className="p-3 tabular-nums">{d.phone}</td>
                          <td className="p-3">{[d.upazila, d.district].filter(Boolean).join(', ')}</td>
                          <td className="p-3 font-semibold text-[#7F1023]">{d.verification_status}</td>
                          <td className="p-3 flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedDonorId(d.donor_id)}
                              className="px-3 py-1 text-[11px] font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer"
                            >
                              যাচাই করুন
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDonor(d.donor_id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-[#75686C] hover:text-[#B5122A] border border-[#E7E1E3] rounded-lg cursor-pointer"
                            >
                              মুছুন
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BLOOD REQUEST MANAGEMENT */}
          {tab === 'requests' && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-[#171316]">রক্তের অনুরোধ ব্যবস্থাপনা</h2>
              <div className="bg-white border border-[#E7E1E3] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF1F3] text-[#7F1023]">
                    <tr>
                      <th className="p-3">রোগী</th>
                      <th className="p-3">গ্রুপ</th>
                      <th className="p-3">হাসপাতাল</th>
                      <th className="p-3">জরুরিতা</th>
                      <th className="p-3">অবস্থা</th>
                      <th className="p-3">কার্যক্রম</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F5F6]">
                    {overview.requests.length === 0 ? (
                      <tr><td colSpan={6} className="p-5 text-center text-[#75686C]">কোনো রক্তের অনুরোধ নেই।</td></tr>
                    ) : (
                      overview.requests.map((r: any) => (
                        <tr key={r.request_id}>
                          <td className="p-3 font-semibold">{r.patient_name}<br /><span className="text-[11px] text-[#75686C] tabular-nums">{r.contact_phone}</span></td>
                          <td className="p-3 font-mono-num font-bold text-[#B5122A]">{r.blood_group} ({r.units_required})</td>
                          <td className="p-3">{r.hospital_name}, {r.district}</td>
                          <td className="p-3 font-semibold">{r.urgency_level}</td>
                          <td className="p-3 font-semibold">{r.admin_status}</td>
                          <td className="p-3 flex flex-wrap gap-1.5">
                            <button type="button" onClick={() => handleRequestAction(r.request_id, 'approve')} className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#B5122A] rounded cursor-pointer">অনুমোদন</button>
                            <button type="button" onClick={() => handleRequestAction(r.request_id, 'match')} className="px-2.5 py-1 text-[11px] font-semibold text-[#B5122A] bg-[#FFF1F3] rounded cursor-pointer">ম্যাচিং</button>
                            <button type="button" onClick={() => handleRequestAction(r.request_id, 'complete')} className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#171316] rounded cursor-pointer">সম্পন্ন</button>
                            <button type="button" onClick={() => handleRequestAction(r.request_id, 'reject')} className="px-2.5 py-1 text-[11px] text-[#75686C] border border-[#E7E1E3] rounded cursor-pointer">বাতিল</button>
                            <button type="button" onClick={() => handleDeleteRequest(r.request_id)} className="px-2 py-1 text-[11px] text-[#B5122A] border border-[#B5122A]/30 rounded cursor-pointer">মুছুন</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AREA REPRESENTATIVES & MULTI-ASSIGNMENTS */}
          {tab === 'representatives' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <form onSubmit={handleCreateRep} className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3">
                  <h2 className="font-display text-base font-bold text-[#7F1023]">নতুন এলাকা প্রতিনিধি নিয়োগ</h2>
                  <select value={repUserId} onChange={(e) => setRepUserId(e.target.value)} required className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs">
                    <option value="">ব্যবহারকারী নির্বাচন করুন</option>
                    {overview.users.map((u: any) => (
                      <option key={u.user_id} value={u.user_id}>{u.full_name} ({u.phone || u.email}) — {u.role}</option>
                    ))}
                  </select>
                  <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer">প্রতিনিধি হিসেবে নিয়োগ দিন</button>
                </form>

                <form onSubmit={handleAssignArea} className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3">
                  <h2 className="font-display text-base font-bold text-[#7F1023]">এলাকা বরাদ্দ (একই এলাকায় একাধিক প্রতিনিধি অনুমোদিত)</h2>
                  <select value={assignRepId} onChange={(e) => setAssignRepId(e.target.value)} required className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs">
                    <option value="">প্রতিনিধি নির্বাচন করুন</option>
                    {overview.representatives.map((r: any) => (
                      <option key={r.representative_id} value={r.representative_id}>{r.full_name} ({r.representative_code})</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <select value={assignLevel} onChange={(e) => setAssignLevel(e.target.value)} className="rounded-xl border border-[#E7E1E3] px-2.5 py-2 text-xs">
                      <option value="division">বিভাগ</option>
                      <option value="district">জেলা</option>
                      <option value="upazila">উপজেলা</option>
                      <option value="area">নির্দিষ্ট এলাকা</option>
                    </select>
                    <select value={assignDiv} onChange={(e) => {
                      setAssignDiv(e.target.value);
                      const dList = BD_LOCATIONS.find((x) => x.division === e.target.value)?.districts || [];
                      setAssignDist(dList[0]?.district || '');
                      setAssignUpazila(dList[0]?.upazilas[0] || '');
                    }} className="rounded-xl border border-[#E7E1E3] px-2.5 py-2 text-xs">
                      {BD_LOCATIONS.map((d) => <option key={d.division} value={d.division}>{d.division}</option>)}
                    </select>
                    <select value={assignDist} onChange={(e) => {
                      setAssignDist(e.target.value);
                      const uList = districts.find((x) => x.district === e.target.value)?.upazilas || [];
                      setAssignUpazila(uList[0] || '');
                    }} className="rounded-xl border border-[#E7E1E3] px-2.5 py-2 text-xs">
                      {districts.map((dist) => <option key={dist.district} value={dist.district}>{dist.district}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={assignUpazila} onChange={(e) => setAssignUpazila(e.target.value)} className="rounded-xl border border-[#E7E1E3] px-2.5 py-2 text-xs">
                      {upazilas.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    {isSuperAdmin && (
                      <select value={assignPermLevel} onChange={(e) => setAssignPermLevel(e.target.value)} className="rounded-xl border border-[#E7E1E3] px-2.5 py-2 text-xs">
                        <option value="standard">সাধারণ সুপারিশ ক্ষমতা</option>
                        <option value="special_approval">বিশেষ অনুমোদন ক্ষমতা</option>
                      </select>
                    )}
                  </div>
                  {assignLevel === 'area' && (
                    <input type="text" value={assignArea} onChange={(e) => setAssignArea(e.target.value)} placeholder="এলাকার নাম লিখুন" className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  )}
                  <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#171316] rounded-lg cursor-pointer">এলাকা বরাদ্দ যুক্ত করুন</button>
                </form>
              </div>

              <form onSubmit={handleAssignTask} className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3">
                <h2 className="font-display text-base font-bold text-[#7F1023]">প্রতিনিধিকে টাস্ক পাঠান</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select value={taskRepId} onChange={(e) => setTaskRepId(e.target.value)} required className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs">
                    <option value="">প্রতিনিধি নির্বাচন</option>
                    {overview.representatives.map((r: any) => <option key={r.representative_id} value={r.representative_id}>{r.full_name}</option>)}
                  </select>
                  <input type="text" required value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="টাস্ক শিরোনাম" className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  <input type="text" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="বিস্তারিত নির্দেশনা" className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                </div>
                <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer">টাস্ক বরাদ্দ করুন</button>
              </form>

              <div className="space-y-3">
                <h3 className="font-display text-base font-bold text-[#171316]">নিয়োগপ্রাপ্ত প্রতিনিধিবৃন্দ ও বরাদ্দকৃত এলাকা</h3>
                {overview.representatives.length === 0 ? (
                  <p className="text-xs text-[#75686C]">কোনো প্রতিনিধি নিয়োগ করা হয়নি।</p>
                ) : (
                  overview.representatives.map((r: any) => (
                    <div key={r.representative_id} className="bg-white border border-[#E7E1E3] rounded-2xl p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-display text-sm font-bold">{r.full_name} <span className="font-mono-num text-xs text-[#B5122A]">({r.representative_code})</span></p>
                          <p className="text-xs text-[#75686C] tabular-nums">{r.phone} · {r.email}</p>
                        </div>
                        <span className="text-xs font-semibold text-[#7F1023]">{r.status}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(r.assignments || []).map((a: any) => (
                          <div key={a.assignment_id} className="inline-flex items-center gap-2 bg-[#FFF1F3] border border-[#B5122A]/25 rounded-lg px-2.5 py-1 text-xs">
                            <span>{[a.area, a.upazila, a.district, a.division].filter(Boolean).join(', ')} ({a.permission_level})</span>
                            <button type="button" onClick={() => handleRemoveAssignment(a.assignment_id)} className="text-[#B5122A] font-bold cursor-pointer">✕</button>
                          </div>
                        ))}
                      </div>

                      {isSuperAdmin && r.permissions && (
                        <div className="pt-2 border-t border-[#F5F5F6] flex flex-wrap gap-3 text-xs">
                          {[
                            ['can_view_donors', 'ডোনার যাচাই'],
                            ['can_recommend_approval', 'অনুমোদন সুপারিশ'],
                            ['can_manage_local_requests', 'স্থানীয় অনুরোধ'],
                            ['can_manage_campaigns', 'ক্যাম্পেইন পরিচালনা']
                          ].map(([k, label]) => (
                            <label key={k} className="inline-flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(r.permissions[k])}
                                onChange={() => handleToggleRepPerm(r.representative_id, r.permissions, k)}
                                className="accent-[#B5122A]"
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* USERS & PASSWORD RESETS */}
          {tab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-4">
                <h2 className="font-display text-base font-bold text-[#7F1023] flex items-center gap-2">
                  <KeyRound className="w-4 h-4" /> অ্যাডমিন-সহায়তাপ্রাপ্ত পাসওয়ার্ড রিসেট আবেদন (OTP ছাড়া)
                </h2>
                {resetId && (
                  <form onSubmit={handleCompleteReset} className="bg-[#FFF1F3] p-4 rounded-xl flex flex-wrap gap-2 items-center">
                    <input type="password" required minLength={6} value={tempPass} onChange={(e) => setTempPass(e.target.value)} placeholder="নতুন অস্থায়ী পাসওয়ার্ড দিন (৬+ অক্ষর)" className="flex-1 min-w-[200px] rounded-lg border border-[#E7E1E3] bg-white px-3 py-2 text-xs" />
                    <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer">রিসেট সম্পন্ন করুন</button>
                    <button type="button" onClick={() => setResetId('')} className="px-3 py-2 text-xs text-[#75686C] cursor-pointer">বাতিল</button>
                  </form>
                )}
                <div className="space-y-2">
                  {(overview.password_resets || []).length === 0 ? (
                    <p className="text-xs text-[#75686C]">কোনো পাসওয়ার্ড রিসেট আবেদন নেই।</p>
                  ) : (
                    overview.password_resets.map((pr: any) => (
                      <div key={pr.reset_id} className="flex flex-wrap items-center justify-between gap-2 border border-[#F5F5F6] rounded-xl p-3 text-xs">
                        <div>
                          <p className="font-bold">{pr.identifier} · <span className="font-mono-num text-[#B5122A]">{pr.reference_code}</span></p>
                          <p className="text-[#75686C]">{pr.reason} · অবস্থা: {pr.status}</p>
                        </div>
                        {pr.status !== 'Completed' && (
                          <button type="button" onClick={() => setResetId(pr.reset_id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer">
                            পাসওয়ার্ড রিসেট দিন
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white border border-[#E7E1E3] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF1F3] text-[#7F1023]">
                    <tr>
                      <th className="p-3">নাম</th>
                      <th className="p-3">ইমেইল / মোবাইল</th>
                      <th className="p-3">রোল</th>
                      <th className="p-3">অবস্থা</th>
                      <th className="p-3">নিয়ন্ত্রণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F5F6]">
                    {overview.users.map((u: any) => (
                      <tr key={u.user_id}>
                        <td className="p-3 font-semibold">{u.full_name}</td>
                        <td className="p-3 tabular-nums">{u.phone || u.email}</td>
                        <td className="p-3 font-semibold text-[#B5122A]">{u.role}</td>
                        <td className="p-3">{u.account_status}</td>
                        <td className="p-3 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateUser(u.user_id, { account_status: u.account_status === 'active' ? 'suspended' : 'active' })}
                            className="px-2.5 py-1 text-[11px] border border-[#E7E1E3] rounded cursor-pointer"
                          >
                            {u.account_status === 'active' ? 'স্থগিত করুন' : 'সক্রিয় করুন'}
                          </button>
                          {isSuperAdmin && u.role !== 'super_admin' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateUser(u.user_id, { role: u.role === 'admin' ? 'donor' : 'admin' })}
                              className="px-2.5 py-1 text-[11px] text-white bg-[#171316] rounded cursor-pointer"
                            >
                              {u.role === 'admin' ? 'অ্যাডমিন সরান' : 'অ্যাডমিন বানান'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CAMPAIGNS & BLOGS (CREATE + DELETE) */}
          {tab === 'campaigns' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form onSubmit={handleCreateCampaign} className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3">
                  <h2 className="font-display text-base font-bold text-[#7F1023]">নতুন রক্তদান ক্যাম্পেইন তৈরি</h2>
                  <input type="text" required value={cmpTitle} onChange={(e) => setCmpTitle(e.target.value)} placeholder="ক্যাম্পেইনের শিরোনাম *" className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" required value={cmpDate} onChange={(e) => setCmpDate(e.target.value)} className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                    <input type="text" required value={cmpDistrict} onChange={(e) => setCmpDistrict(e.target.value)} placeholder="জেলা" className="rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  </div>
                  <input type="text" required value={cmpVenue} onChange={(e) => setCmpVenue(e.target.value)} placeholder="ভেন্যু / স্থান *" className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  <textarea rows={3} value={cmpDesc} onChange={(e) => setCmpDesc(e.target.value)} placeholder="বিস্তারিত বিবরণ" className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer">ক্যাম্পেইন প্রকাশ করুন</button>
                </form>

                <form onSubmit={handleCreateBlog} className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3">
                  <h2 className="font-display text-base font-bold text-[#7F1023]">নতুন সচেতনতা ব্লগ প্রকাশ</h2>
                  <input type="text" required value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="প্রবন্ধের শিরোনাম *" className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  <input type="text" required value={blogCat} onChange={(e) => setBlogCat(e.target.value)} placeholder="বিভাগ *" className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  <textarea rows={4} required value={blogContent} onChange={(e) => setBlogContent(e.target.value)} placeholder="প্রবন্ধের মূল লেখা *" className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#171316] rounded-lg cursor-pointer">ব্লগ প্রকাশ করুন</button>
                </form>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3">
                  <h3 className="font-display text-sm font-bold text-[#171316]">সকল ক্যাম্পেইন ({(overview.campaigns || []).length})</h3>
                  {(overview.campaigns || []).map((c: any) => (
                    <div key={c.campaign_id} className="flex items-center justify-between gap-3 border-b border-[#F5F5F6] pb-2.5 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-[#171316] truncate">{c.campaign_title}</p>
                        <p className="text-[#75686C] tabular-nums">{c.event_date} · {c.venue}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCampaign(c.campaign_id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#B5122A] bg-[#FFF1F3] rounded-lg cursor-pointer shrink-0"
                      >
                        মুছুন
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3">
                  <h3 className="font-display text-sm font-bold text-[#171316]">সকল ব্লগ প্রবন্ধ ({(overview.blogs || []).length})</h3>
                  {(overview.blogs || []).map((b: any) => (
                    <div key={b.blog_id} className="flex items-center justify-between gap-3 border-b border-[#F5F5F6] pb-2.5 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-[#171316] truncate">{b.title}</p>
                        <p className="text-[#75686C]">{b.category}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlog(b.blog_id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#B5122A] bg-[#FFF1F3] rounded-lg cursor-pointer shrink-0"
                      >
                        মুছুন
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DONATIONS & VOLUNTEERS */}
          {tab === 'donations' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3">
                <h2 className="font-display text-base font-bold text-[#7F1023]">রক্তদান রেকর্ড যাচাইকরণ</h2>
                {(overview.donations || []).length === 0 ? (
                  <p className="text-xs text-[#75686C]">কোনো রক্তদান রেকর্ড জমা পড়েনি।</p>
                ) : (
                  overview.donations.map((don: any) => (
                    <div key={don.donation_id} className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F5F5F6] pb-2 text-xs">
                      <div>
                        <p className="font-bold">{don.donor_name} ({don.blood_group}) — {don.hospital_name}</p>
                        <p className="text-[#75686C] tabular-nums">{don.donation_date} · {don.verification_status}</p>
                      </div>
                      {don.verification_status === 'Pending Verification' && (
                        <div className="flex gap-2">
                          <button type="button" onClick={async () => { await apiRequest(`/api/donations/${don.donation_id}/verify`, { method: 'POST', body: { status: 'Verified' } }); loadData(); }} className="px-3 py-1 bg-[#B5122A] text-white rounded cursor-pointer">যাচাই নিশ্চিত</button>
                          <button type="button" onClick={async () => { await apiRequest(`/api/donations/${don.donation_id}/verify`, { method: 'POST', body: { status: 'Rejected' } }); loadData(); }} className="px-3 py-1 border border-[#E7E1E3] rounded cursor-pointer">বাতিল</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-3">
                <h2 className="font-display text-base font-bold text-[#7F1023]">স্বেচ্ছাসেবক ব্যবস্থাপনা</h2>
                {(overview.volunteers || []).length === 0 ? (
                  <p className="text-xs text-[#75686C]">কোনো স্বেচ্ছাসেবক আবেদন নেই।</p>
                ) : (
                  overview.volunteers.map((v: any) => (
                    <div key={v.volunteer_id} className="flex items-center justify-between border-b border-[#F5F5F6] pb-2 text-xs">
                      <div>
                        <p className="font-bold">{v.full_name} ({v.district})</p>
                        <p className="text-[#75686C]">{v.skills} · অবস্থা: {v.approval_status}</p>
                      </div>
                      {v.approval_status !== 'Approved' && (
                        <button type="button" onClick={async () => { await apiRequest(`/api/admin/volunteers/${v.volunteer_id}/status`, { method: 'POST', body: { approval_status: 'Approved' } }); loadData(); }} className="px-3 py-1 bg-[#B5122A] text-white rounded cursor-pointer">অনুমোদন</button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CONTACT MESSAGES INBOX */}
          {tab === 'messages' && (
            <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-4">
              <h2 className="font-display text-base font-bold text-[#7F1023] flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> ব্যবহারকারীদের পাঠানো বার্তা
              </h2>
              {(overview.messages || []).length === 0 ? (
                <p className="text-xs text-[#75686C]">এখনো কোনো যোগাযোগ বার্তা জমা পড়েনি।</p>
              ) : (
                <div className="divide-y divide-[#F5F5F6]">
                  {overview.messages.map((m: any) => (
                    <div key={m.message_id} className="py-3 space-y-1 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-[#171316]">
                          {m.sender_user_id} {m.request_id ? `(${m.request_id})` : ''}
                        </span>
                        <span className="text-[#75686C] tabular-nums">{String(m.created_at || '').slice(0, 19)}</span>
                      </div>
                      <p className="text-[#241A1D]">{m.message_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FULL WEBSITE CONTROL & LOGS */}
          {tab === 'settings' && (
            <div className="space-y-6">
              <form onSubmit={handleSaveSettings} className="bg-white border border-[#E7E1E3] rounded-2xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F5F5F6] pb-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#7F1023]">সম্পূর্ণ ওয়েবসাইট নিয়ন্ত্রণ (BLOODIX Control Center)</h2>
                    <p className="text-xs text-[#75686C]">
                      এখান থেকে ওয়েবসাইটের লোগো, নাম, হিরো টেক্সট, পোস্টার স্লাইডার, নিবন্ধন ও সকল কার্যক্রম সরাসরি পরিবর্তন করুন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualSheetSync}
                    disabled={syncingSheet}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#7F1023] bg-[#FFF1F3] border border-[#B5122A]/30 rounded-xl cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingSheet ? 'animate-spin' : ''}`} />
                    <span>{syncingSheet ? 'সিঙ্ক হচ্ছে...' : 'Google Sheet সিঙ্ক করুন'}</span>
                  </button>
                </div>

                {/* Logo Control */}
                <div className="bg-[#FFF8F9] border border-[#E7E1E3] rounded-xl p-4 flex flex-wrap items-center gap-4">
                  <img
                    src={settingsMap.site_logo || DEFAULT_LOGO_PATH}
                    alt="Website Logo"
                    className="w-16 h-16 rounded-xl object-contain bg-white border border-[#E7E1E3] p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-[220px] space-y-2">
                    <label className="block text-xs font-bold text-[#7F1023]">ওয়েবসাইটের লোগো পরিবর্তন</label>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoFile}
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#B5122A] rounded-lg cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" /> নতুন লোগো আপলোড
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettingsMap({ ...settingsMap, site_logo: DEFAULT_LOGO_PATH })}
                        className="px-3 py-1.5 text-xs font-semibold text-[#241A1D] bg-white border border-[#E7E1E3] rounded-lg cursor-pointer"
                      >
                        ডিফল্ট BLOODIX লোগো বসান
                      </button>
                    </div>
                  </div>
                </div>

                {/* Brand & Hero Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">ওয়েবসাইটের নাম</label>
                    <input type="text" value={settingsMap.site_name || ''} onChange={(e) => setSettingsMap({ ...settingsMap, site_name: e.target.value })} className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">ট্যাগলাইন / স্লোগান</label>
                    <input type="text" value={settingsMap.site_tagline || ''} onChange={(e) => setSettingsMap({ ...settingsMap, site_tagline: e.target.value })} className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">হোমপেজ প্রধান শিরোনাম (Hero Title)</label>
                    <input type="text" value={settingsMap.hero_title || ''} onChange={(e) => setSettingsMap({ ...settingsMap, hero_title: e.target.value })} className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">পোস্টার স্লাইডার শিরোনাম</label>
                    <input type="text" value={settingsMap.poster_slider_title || ''} onChange={(e) => setSettingsMap({ ...settingsMap, poster_slider_title: e.target.value })} className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">হোমপেজ বিবরণ (Hero Subtitle)</label>
                  <textarea rows={2} value={settingsMap.hero_subtitle || ''} onChange={(e) => setSettingsMap({ ...settingsMap, hero_subtitle: e.target.value })} className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">যোগাযোগের ফোন</label>
                    <input type="text" value={settingsMap.contact_phone || ''} onChange={(e) => setSettingsMap({ ...settingsMap, contact_phone: e.target.value })} className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">যোগাযোগের ইমেইল</label>
                    <input type="email" value={settingsMap.contact_email || ''} onChange={(e) => setSettingsMap({ ...settingsMap, contact_email: e.target.value })} className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">ঠিকানা</label>
                    <input type="text" value={settingsMap.contact_address || ''} onChange={(e) => setSettingsMap({ ...settingsMap, contact_address: e.target.value })} className="w-full rounded-xl border border-[#E7E1E3] px-3 py-2 text-xs" />
                  </div>
                </div>

                {/* Operational Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#F5F5F6]">
                  {[
                    ['show_poster_slider', 'হোমপেজে পোস্টার স্লাইডার'],
                    ['registration_enabled', 'নতুন নিবন্ধন (Registration)'],
                    ['donor_manual_approval', 'ডোনার অনুমোদন বাধ্যতামূলক'],
                    ['request_approval_required', 'রক্তের অনুরোধ যাচাই']
                  ].map(([key, label]) => (
                    <div key={key} className="bg-[#FFF8F9] border border-[#E7E1E3] rounded-xl p-3 space-y-1.5">
                      <label className="block text-[11px] font-bold text-[#171316]">{label}</label>
                      <select
                        value={settingsMap[key] ?? 'true'}
                        onChange={(e) => setSettingsMap({ ...settingsMap, [key]: e.target.value })}
                        className="w-full rounded-lg border border-[#E7E1E3] bg-white px-2.5 py-1.5 text-xs font-semibold"
                      >
                        <option value="true">চালু (Active)</option>
                        <option value="false">বন্ধ (Off)</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div className="bg-[#FFF1F3] border border-[#B5122A]/20 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#7F1023]">মেইনটেন্যান্স মোড (Maintenance Banner)</p>
                    <p className="text-[11px] text-[#75686C]">চালু করলে সাইটের উপরের দিকে রক্ষণাবেক্ষণ বার্তা দেখা যাবে।</p>
                  </div>
                  <select
                    value={settingsMap.maintenance_mode || 'false'}
                    onChange={(e) => setSettingsMap({ ...settingsMap, maintenance_mode: e.target.value })}
                    className="rounded-lg border border-[#E7E1E3] bg-white px-3 py-1.5 text-xs font-semibold"
                  >
                    <option value="false">বন্ধ (স্বাভাবিক চলবে)</option>
                    <option value="true">চালু (Maintenance)</option>
                  </select>
                </div>

                <button type="submit" className="px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl shadow-sm cursor-pointer">
                  সকল সেটিংস সংরক্ষণ করুন
                </button>
              </form>

              <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-2">
                <h3 className="font-display text-sm font-bold text-[#171316] flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#B5122A]" /> অ্যাক্টিভিটি লগ (Activity Logs)
                </h3>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#F5F5F6] text-xs">
                  {(overview.activity_logs || []).map((l: any) => (
                    <div key={l.log_id} className="py-2 flex justify-between gap-2">
                      <span><strong>{l.action}</strong> ({l.actor_role}) — {l.description}</span>
                      <span className="text-[#75686C] tabular-nums shrink-0">{String(l.timestamp || '').slice(0, 19)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUPER ADMIN SYSTEM & BACKUP */}
          {tab === 'super_system' && isSuperAdmin && (
            <div className="space-y-5">
              <div className="bg-white border border-[#B5122A]/30 rounded-2xl p-6 space-y-3">
                <h2 className="font-display text-lg font-bold text-[#7F1023] flex items-center gap-2">
                  <UserCog className="w-5 h-5" /> Google Sheets ডাটাবেজ ও ব্যাকআপ ম্যানেজমেন্ট
                </h2>
                <p className="text-xs text-[#241A1D] leading-relaxed">
                  Google Apps Script-এর মাধ্যমে সকল টেবিল স্বয়ংক্রিয়ভাবে সংরক্ষিত ও সিঙ্ক হচ্ছে। প্রয়োজনে ম্যানুয়াল সিঙ্ক বা সম্পূর্ণ JSON ব্যাকআপ ডাউনলোড করতে পারেন।
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleManualSheetSync}
                    disabled={syncingSheet}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#7F1023] bg-[#FFF1F3] border border-[#B5122A]/30 rounded-xl cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncingSheet ? 'animate-spin' : ''}`} /> এখনই Google Sheet সিঙ্ক করুন
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-xl cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> সম্পূর্ণ ডাটাবেজ ব্যাকআপ ডাউনলোড করুন (JSON)
                  </button>
                </div>
              </div>

              <div className="bg-white border border-[#E7E1E3] rounded-2xl p-5 space-y-2">
                <h3 className="font-display text-sm font-bold text-[#171316] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#B5122A]" /> প্রতিনিধি প্রতিবেদনসমূহ
                </h3>
                {(overview.rep_reports || []).length === 0 ? (
                  <p className="text-xs text-[#75686C]">কোনো প্রতিবেদন জমা পড়েনি।</p>
                ) : (
                  overview.rep_reports.map((rp: any) => (
                    <div key={rp.report_id} className="border-b border-[#F5F5F6] py-2 text-xs">
                      <p className="font-bold">{rp.report_title} ({rp.related_area})</p>
                      <p className="text-[#75686C]">{rp.report_content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};
