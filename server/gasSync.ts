import type { DatabaseSchema, StoredUser } from './db';
import { saveDb } from './db';
import { normalizePhone } from './security';

const USER_GAS_URL =
  'https://script.google.com/macros/s/AKfycbyAHAcfT_4Suvxn3z1h-VRcnHkMXP9dhBU_6v-E8ZI_goZPFO1rQWR-Ay7c6Ltz-D8Bdg/exec';

export function getGasWebAppUrl(db?: DatabaseSchema): string {
  const fromSetting = db?.Settings?.find((s) => s.setting_key === 'gas_web_app_url')?.setting_value;
  return (fromSetting || process.env.GAS_WEB_APP_URL || USER_GAS_URL).trim();
}

const TABLE_KEYS: Record<keyof DatabaseSchema, string> = {
  Users: 'user_id',
  Donors: 'donor_id',
  Recipients: 'recipient_id',
  Blood_Requests: 'request_id',
  Donations: 'donation_id',
  Verifications: 'verification_id',
  Volunteers: 'volunteer_id',
  Campaigns: 'campaign_id',
  Campaign_Registrations: 'registration_id',
  Contact_Requests: 'contact_request_id',
  Notifications: 'notification_id',
  Messages: 'message_id',
  Locations: 'location_id',
  Blogs: 'blog_id',
  Admins: 'admin_id',
  Activity_Logs: 'log_id',
  Settings: 'setting_key',
  System_Logs: 'system_log_id',
  Representatives: 'representative_id',
  Representative_Assignments: 'assignment_id',
  Representative_Tasks: 'task_id',
  Representative_Reports: 'report_id',
  Representative_Permissions: 'permission_id',
  Sessions: 'session_id',
  Password_Resets: 'reset_id',
  Donor_Posters: 'poster_id'
};

function toBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  return String(v).toLowerCase() === 'true';
}

function toNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeSheetRow(table: keyof DatabaseSchema, raw: Record<string, any>): any {
  const row = { ...raw };
  delete row._rowIndex;

  if (table === 'Users') {
    row.phone = row.phone ? normalizePhone(String(row.phone)) : '';
    row.email = row.email ? String(row.email).toLowerCase().trim() : '';
    row.email_verified = toBool(row.email_verified);
    row.phone_verified = toBool(row.phone_verified);
    return row as StoredUser;
  }
  if (table === 'Blood_Requests') {
    row.contact_phone = row.contact_phone ? normalizePhone(String(row.contact_phone)) : '';
    row.units_required = Math.max(1, toNum(row.units_required, 1));
    row.donor_found_count = toNum(row.donor_found_count, 0);
    row.completed_units = toNum(row.completed_units, 0);
  }
  if (table === 'Campaigns') {
    row.registration_limit = toNum(row.registration_limit, 100);
  }
  if (table === 'Notifications') {
    row.is_read = toBool(row.is_read);
  }
  if (table === 'Sessions') {
    row.revoked = toBool(row.revoked);
  }
  if (table === 'Verifications') {
    row.verified_phone = toBool(row.verified_phone);
    row.verified_blood_group = toBool(row.verified_blood_group);
  }
  if (table === 'Representative_Permissions') {
    [
      'can_view_donors',
      'can_verify_donors',
      'can_recommend_approval',
      'can_recommend_rejection',
      'can_view_requests',
      'can_manage_local_requests',
      'can_manage_campaigns',
      'can_view_reports'
    ].forEach((k) => {
      row[k] = toBool(row[k]);
    });
  }
  if (table === 'Admins' || table === 'Representatives' || table === 'Recipients') {
    if (row.phone) row.phone = normalizePhone(String(row.phone));
  }
  if (table === 'Donor_Posters') {
    row.is_active = toBool(row.is_active);
    row.sort_order = toNum(row.sort_order, 1);
  }
  return row;
}

async function callGasEndpoint<T = any>(
  url: string,
  payload: Record<string, unknown>,
  timeoutMs = 12000
): Promise<{ ok: boolean; data?: T; message?: string; htmlError?: boolean }> {
  if (!url) return { ok: false, message: 'GAS URL missing' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const text = await res.text();
    const trimmed = text.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return {
        ok: false,
        htmlError: true,
        message: 'Google Apps Script Web App-এ এখনো API হ্যান্ডলার (doGet/doPost) আপডেট করা হয়নি।'
      };
    }
    const parsed = JSON.parse(trimmed);
    return {
      ok: Boolean(parsed.success),
      data: parsed.data as T,
      message: parsed.message
    };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'GAS network error' };
  } finally {
    clearTimeout(timer);
  }
}

let hydratedOnce = false;
let lastSyncStatus = {
  connected: false,
  lastHydratedAt: '',
  lastPushAt: '',
  lastError: ''
};

export function getSheetSyncStatus(db?: DatabaseSchema) {
  return {
    web_app_url: getGasWebAppUrl(db),
    ...lastSyncStatus
  };
}

export async function checkGasHealth(db?: DatabaseSchema) {
  const url = getGasWebAppUrl(db);
  const res = await callGasEndpoint(url, { action: 'health' }, 8000);
  lastSyncStatus.connected = res.ok;
  lastSyncStatus.lastError = res.ok ? '' : res.message || 'Unreachable';
  return { connected: res.ok, message: res.message || '', url };
}

export async function hydrateDbFromGoogleSheet(
  db: DatabaseSchema,
  force = false
): Promise<boolean> {
  if (hydratedOnce && !force) return lastSyncStatus.connected;
  const url = getGasWebAppUrl(db);
  const res = await callGasEndpoint<{ tables: Record<string, any[]> }>(
    url,
    { action: 'pullAll' },
    25000
  );
  if (!res.ok || !res.data?.tables) {
    lastSyncStatus.connected = false;
    lastSyncStatus.lastError = res.message || 'pullAll failed';
    return false;
  }

  const tables = res.data.tables;
  const seedPushTables: (keyof DatabaseSchema)[] = [];

  (Object.keys(TABLE_KEYS) as (keyof DatabaseSchema)[]).forEach((table) => {
    const incoming = tables[table];
    if (Array.isArray(incoming) && incoming.length > 0) {
      const normalizedRows = incoming.map((r) => normalizeSheetRow(table, r));
      const keyField = TABLE_KEYS[table];
      const map = new Map<string, any>();
      (db[table] as any[]).forEach((localItem) => {
        if (localItem[keyField]) map.set(String(localItem[keyField]), localItem);
      });
      normalizedRows.forEach((sheetItem) => {
        if (table === 'Settings') {
          if (sheetItem.setting_key === 'site_name' && sheetItem.setting_value === 'রক্তবন্ধন (RoktoBondhon)') {
            sheetItem.setting_value = 'BLOODIX';
            seedPushTables.push('Settings');
          }
          if (sheetItem.setting_key === 'site_tagline' && sheetItem.setting_value === 'রক্তের অভাবে যেন থেমে না যায় কোনো প্রাণ') {
            sheetItem.setting_value = 'Donate Blood • Save Lives';
            seedPushTables.push('Settings');
          }
          if (sheetItem.setting_key === 'contact_email' && sheetItem.setting_value === 'support@roktobondhon.org') {
            sheetItem.setting_value = 'support@bloodix.org';
            seedPushTables.push('Settings');
          }
        }
        if (sheetItem[keyField]) map.set(String(sheetItem[keyField]), sheetItem);
      });
      (db[table] as any[]) = Array.from(map.values());
    } else if (
      ['Settings', 'Campaigns', 'Blogs', 'Locations'].includes(table) &&
      (db[table] as any[]).length > 0
    ) {
      seedPushTables.push(table);
    }
  });

  if (seedPushTables.length === 0) {
    // Ensure new BLOODIX settings keys exist in Sheet if missing
    const sheetSettings = Array.isArray(tables.Settings) ? tables.Settings : [];
    const hasLogoInSheet = sheetSettings.some((s: any) => s.setting_key === 'site_logo');
    if (!hasLogoInSheet && db.Settings.length > 0) {
      seedPushTables.push('Settings');
    }
  }

  saveDb(db);
  hydratedOnce = true;
  lastSyncStatus.connected = true;
  lastSyncStatus.lastHydratedAt = new Date().toISOString();
  lastSyncStatus.lastError = '';

  if (seedPushTables.length > 0) {
    await pushTablesToGoogleSheet(db, seedPushTables);
  }
  return true;
}

export async function findUserInGoogleSheet(
  db: DatabaseSchema,
  identifier: string
): Promise<StoredUser | null> {
  const url = getGasWebAppUrl(db);
  const res = await callGasEndpoint<{
    user?: any;
    donor?: any;
    volunteer?: any;
    recipient?: any;
    representative?: any;
    assignments?: any[];
    permissions?: any;
    admin?: any;
  }>(url, { action: 'findUser', identifier }, 10000);

  if (!res.ok || !res.data?.user) {
    return null;
  }

  lastSyncStatus.connected = true;
  lastSyncStatus.lastError = '';

  const u = normalizeSheetRow('Users', res.data.user) as StoredUser;
  const existingIdx = db.Users.findIndex((x) => x.user_id === u.user_id);
  if (existingIdx >= 0) {
    db.Users[existingIdx] = u;
  } else {
    db.Users.push(u);
  }

  const upsertSingle = (table: keyof DatabaseSchema, rawRow: any) => {
    if (!rawRow) return;
    const keyField = TABLE_KEYS[table];
    const row = normalizeSheetRow(table, rawRow);
    const arr = db[table] as any[];
    const idx = arr.findIndex((x) => x[keyField] === row[keyField]);
    if (idx >= 0) arr[idx] = row;
    else arr.push(row);
  };

  if (res.data.donor) upsertSingle('Donors', res.data.donor);
  if (res.data.volunteer) upsertSingle('Volunteers', res.data.volunteer);
  if (res.data.recipient) upsertSingle('Recipients', res.data.recipient);
  if (res.data.representative) upsertSingle('Representatives', res.data.representative);
  if (res.data.permissions) upsertSingle('Representative_Permissions', res.data.permissions);
  if (res.data.admin) upsertSingle('Admins', res.data.admin);
  if (Array.isArray(res.data.assignments)) {
    res.data.assignments.forEach((a) => upsertSingle('Representative_Assignments', a));
  }

  saveDb(db);
  return u;
}

const APPEND_AT_END_TABLES = new Set<keyof DatabaseSchema>([
  'Users',
  'Donors',
  'Recipients',
  'Volunteers',
  'Admins',
  'Sessions',
  'Representatives',
  'Representative_Assignments',
  'Representative_Permissions',
  'Locations',
  'Settings',
  'Donor_Posters'
]);

export async function pushTablesToGoogleSheet(
  db: DatabaseSchema,
  tables: (keyof DatabaseSchema)[]
): Promise<boolean> {
  const url = getGasWebAppUrl(db);
  if (!url || tables.length === 0) return false;

  const payloadTables: Record<string, { keyField: string; rows: any[] }> = {};
  tables.forEach((table) => {
    const keyField = TABLE_KEYS[table];
    const allRows = (db[table] as any[]) || [];
    const selected =
      allRows.length <= 400
        ? allRows
        : APPEND_AT_END_TABLES.has(table)
          ? allRows.slice(-400)
          : allRows.slice(0, 400);
    const rows = selected.map((row) => {
      const copy: Record<string, any> = {};
      Object.entries(row).forEach(([k, v]) => {
        let strVal = typeof v === 'boolean' ? String(v) : v ?? '';
        if (typeof strVal === 'string' && strVal.length > 48000) {
          strVal = strVal.slice(0, 48000);
        }
        copy[k] = strVal;
      });
      return copy;
    });
    if (rows.length > 0) {
      payloadTables[table] = { keyField, rows };
    }
  });

  if (Object.keys(payloadTables).length === 0) return true;

  const res = await callGasEndpoint(
    url,
    {
      action: 'upsertBatch',
      tables: payloadTables
    },
    20000
  );

  if (res.ok) {
    lastSyncStatus.connected = true;
    lastSyncStatus.lastPushAt = new Date().toISOString();
    lastSyncStatus.lastError = '';
    return true;
  } else {
    lastSyncStatus.lastError = res.message || 'upsertBatch failed';
    return false;
  }
}
