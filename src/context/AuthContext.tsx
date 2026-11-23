import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiRequest, setMemoryToken } from '../services/api';
import type { User, Donor, NotificationItem, SiteSettings } from '../types';

export const DEFAULT_LOGO_PATH = '/assets/aistudio/image-removebg-preview__1__4794faaf.png';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: 'BLOODIX',
  site_tagline: 'Donate Blood • Save Lives',
  site_logo: DEFAULT_LOGO_PATH,
  contact_email: 'support@bloodix.org',
  contact_phone: '+880 1700-000000',
  contact_address: 'ঢাকা, বাংলাদেশ',
  hero_title: 'রক্তের অভাবে যেন থেমে না যায় কোনো প্রাণ',
  hero_subtitle: 'আপনার এক ব্যাগ রক্ত বাঁচাতে পারে একটি জীবন। রক্তদাতা খুঁজুন, রক্তদান করুন, মানুষের পাশে দাঁড়ান।',
  poster_slider_title: 'সফল রক্তদাতাদের সম্মাননা পোস্টার',
  show_poster_slider: 'true',
  registration_enabled: 'true',
  donor_manual_approval: 'true',
  request_approval_required: 'true',
  maintenance_mode: 'false'
};

interface AuthContextValue {
  user: User | null;
  donor: Donor | null;
  volunteer: any | null;
  representative: any | null;
  notifications: NotificationItem[];
  siteSettings: SiteSettings;
  loading: boolean;
  needsSuperAdminSetup: boolean;
  refreshAuth: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  loginWithToken: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  dashboardPathForRole: (role?: string) => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function dashboardPathForRole(role?: string): string {
  switch (role) {
    case 'super_admin':
      return '/dashboard/super-admin';
    case 'admin':
      return '/dashboard/admin';
    case 'representative':
      return '/dashboard/representative';
    case 'volunteer':
      return '/dashboard/volunteer';
    case 'recipient':
      return '/dashboard/recipient';
    case 'donor':
    default:
      return '/dashboard/donor';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [volunteer, setVolunteer] = useState<any | null>(null);
  const [representative, setRepresentative] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [needsSuperAdminSetup, setNeedsSuperAdminSetup] = useState(false);

  const applySettingsToDom = useCallback((merged: SiteSettings) => {
    if (merged.site_name) {
      document.title = `${merged.site_name} — ${merged.site_tagline || 'Donate Blood • Save Lives'}`;
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    const res = await apiRequest<{ settings: Record<string, string> }>('/api/settings/public');
    if (res.success && res.data?.settings) {
      const merged: SiteSettings = {
        ...DEFAULT_SITE_SETTINGS,
        ...res.data.settings,
        site_logo: res.data.settings.site_logo || DEFAULT_LOGO_PATH,
        site_name: res.data.settings.site_name || 'BLOODIX'
      };
      setSiteSettings(merged);
      applySettingsToDom(merged);
    }
  }, [applySettingsToDom]);

  const refreshAuth = useCallback(async () => {
    try {
      const [bootRes, meRes, settingsRes] = await Promise.all([
        apiRequest<{ needs_super_admin_setup: boolean }>('/api/auth/bootstrap-status'),
        apiRequest<{
          user: User;
          donor: Donor | null;
          volunteer: any | null;
          representative: any | null;
          notifications: NotificationItem[];
        }>('/api/auth/me'),
        apiRequest<{ settings: Record<string, string> }>('/api/settings/public')
      ]);

      if (bootRes.success && bootRes.data) {
        setNeedsSuperAdminSetup(bootRes.data.needs_super_admin_setup);
      }

      if (settingsRes.success && settingsRes.data?.settings) {
        const merged: SiteSettings = {
          ...DEFAULT_SITE_SETTINGS,
          ...settingsRes.data.settings,
          site_logo: settingsRes.data.settings.site_logo || DEFAULT_LOGO_PATH,
          site_name: settingsRes.data.settings.site_name || 'BLOODIX'
        };
        setSiteSettings(merged);
        applySettingsToDom(merged);
      }

      if (meRes.success && meRes.data?.user) {
        setUser(meRes.data.user);
        setDonor(meRes.data.donor);
        setVolunteer(meRes.data.volunteer);
        setRepresentative(meRes.data.representative);
        setNotifications(meRes.data.notifications || []);
      } else {
        setUser(null);
        setDonor(null);
        setVolunteer(null);
        setRepresentative(null);
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  }, [applySettingsToDom]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const loginWithToken = useCallback(
    async (token: string, loggedUser: User) => {
      setMemoryToken(token);
      setUser(loggedUser);
      await refreshAuth();
    },
    [refreshAuth]
  );

  const logout = useCallback(async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    setMemoryToken(null);
    setUser(null);
    setDonor(null);
    setVolunteer(null);
    setRepresentative(null);
    setNotifications([]);
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await apiRequest('/api/notifications/read-all', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        donor,
        volunteer,
        representative,
        notifications,
        siteSettings,
        loading,
        needsSuperAdminSetup,
        refreshAuth,
        refreshSettings,
        loginWithToken,
        logout,
        markAllNotificationsRead,
        dashboardPathForRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
