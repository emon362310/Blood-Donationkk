import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  getDb,
  saveDb,
  addNotification,
  addActivityLog,
  addSystemLog,
  StoredUser
} from './server/db';
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashSessionToken,
  sanitizeText,
  normalizePhone,
  isValidBdPhone,
  isValidEmail,
  generateId,
  checkRateLimit,
  recordFailedLogin,
  clearRateLimit
} from './server/security';
import {
  hydrateDbFromGoogleSheet,
  findUserInGoogleSheet,
  pushTablesToGoogleSheet,
  checkGasHealth,
  getSheetSyncStatus
} from './server/gasSync';

const PORT = 3000;
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function ok(res: Response, message: string, data: unknown = null) {
  return res.json({ success: true, message, data, error: null });
}

function fail(res: Response, status: number, message: string, errorCode: string) {
  return res.status(status).json({ success: false, message, data: null, error: errorCode });
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const k = pair.slice(0, idx).trim();
      const v = decodeURIComponent(pair.slice(idx + 1).trim());
      out[k] = v;
    }
  });
  return out;
}

function setSessionCookie(res: Response, rawToken: string, maxAgeSeconds: number) {
  const cookieParts = [
    `roktobondhon_sid=${encodeURIComponent(rawToken)}`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'HttpOnly',
    'Secure',
    'SameSite=None',
    'Partitioned'
  ];
  res.setHeader('Set-Cookie', cookieParts.join('; '));
}

function clearSessionCookie(res: Response) {
  res.setHeader(
    'Set-Cookie',
    'roktobondhon_sid=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None; Partitioned'
  );
}

interface AuthedRequest extends Request {
  authUser?: StoredUser;
  authSessionId?: string;
}

function extractToken(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies.roktobondhon_sid || '';
}

function authenticate(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();
  const db = getDb();
  const tokenHash = hashSessionToken(token);
  const now = Date.now();
  const session = db.Sessions.find(
    (s) => s.token_hash === tokenHash && !s.revoked && new Date(s.expires_at).getTime() > now
  );
  if (session) {
    const user = db.Users.find(
      (u) => u.user_id === session.user_id && u.account_status === 'active' && !u.deleted_at
    );
    if (user) {
      req.authUser = user;
      req.authSessionId = session.session_id;
    }
  }
  next();
}

function requireAuth(req: AuthedRequest, res: Response, roles?: string[]): StoredUser | null {
  if (!req.authUser) {
    fail(res, 401, 'অনুগ্রহ করে প্রথমে লগইন করুন।', 'UNAUTHORIZED');
    return null;
  }
  if (roles && roles.length > 0 && !roles.includes(req.authUser.role)) {
    fail(res, 403, 'এই কাজটি করার অনুমতি আপনার নেই।', 'FORBIDDEN');
    return null;
  }
  return req.authUser;
}

function csrfGuard(req: Request, res: Response, next: NextFunction) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.headers.origin;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const xrw = req.headers['x-requested-with'];
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host && xrw !== 'XMLHttpRequest') {
          return fail(res, 403, 'নিরাপত্তা যাচাইকরণ ব্যর্থ হয়েছে।', 'CSRF_BLOCKED');
        }
      } catch {
        return fail(res, 403, 'অবৈধ রিকোয়েস্ট অরিজিন।', 'CSRF_BLOCKED');
      }
    }
  }
  next();
}

function getRepScope(userId: string) {
  const db = getDb();
  const rep = db.Representatives.find((r) => r.user_id === userId && r.status === 'active');
  if (!rep) return null;
  const assignments = db.Representative_Assignments.filter(
    (a) => a.representative_id === rep.representative_id && a.status === 'active'
  );
  const permissions = db.Representative_Permissions.find(
    (p) => p.representative_id === rep.representative_id
  );
  return { rep, assignments, permissions };
}

function isRecordInArea(record: any, assignments: any[]): boolean {
  if (!assignments || assignments.length === 0) return false;
  return assignments.some((a) => {
    if (a.division && record.division !== a.division) return false;
    if (a.district && record.district !== a.district) return false;
    if (a.upazila && record.upazila !== a.upazila) return false;
    if (a.union_name && record.union_name !== a.union_name) return false;
    if (a.ward_name && record.ward !== a.ward_name) return false;
    if (a.area && record.area !== a.area) return false;
    return true;
  });
}

function publicUserShape(u: StoredUser) {
  return {
    user_id: u.user_id,
    full_name: u.full_name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    account_status: u.account_status,
    email_verified: u.email_verified,
    phone_verified: u.phone_verified,
    profile_image: u.profile_image,
    created_at: u.created_at,
    updated_at: u.updated_at,
    last_login: u.last_login
  };
}

function sanitizeProfileImage(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(trimmed) && trimmed.length <= 350000) {
    return trimmed;
  }
  if (/^https:\/\/[^\s"'<>]+$/i.test(trimmed) && trimmed.length <= 500) {
    return trimmed;
  }
  return '';
}

function sanitizeImageAsset(raw: unknown, maxLen = 450000): string {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed) && trimmed.length <= maxLen) {
    return trimmed;
  }
  if (/^https:\/\/[^\s"'<>]+$/i.test(trimmed) && trimmed.length <= 1000) {
    return trimmed;
  }
  if (/^\/(assets|src\/assets)\/[A-Za-z0-9_./-]+$/i.test(trimmed) && trimmed.length <= 300) {
    return trimmed;
  }
  return '';
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '3mb' }));
  app.use('/api', csrfGuard);
  app.use('/api', authenticate);

  // ================= PUBLIC STATS & SETTINGS =================
  app.get('/api/public/overview', async (_req, res) => {
    const db = getDb();
    await hydrateDbFromGoogleSheet(db);
    const activeDonors = db.Donors.filter((d) => !d.deleted_at);
    const approvedDonors = activeDonors.filter((d) => {
      const u = db.Users.find((usr) => usr.user_id === d.user_id && !usr.deleted_at);
      return d.verification_status === 'Approved' && u && u.account_status === 'active';
    });
    const publicRequests = db.Blood_Requests.filter(
      (r) =>
        !r.deleted_at &&
        ['Approved', 'Donor Matching', 'Donor Found', 'Partially Fulfilled'].includes(r.admin_status)
    );
    const completedDonations = db.Donations.filter((d) => d.verification_status === 'Verified').length;

    const mappedDonors = [...approvedDonors]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 120)
      .map((d) => {
        const u = db.Users.find((usr) => usr.user_id === d.user_id)!;
        return {
          donor_id: d.donor_id,
          user_id: d.user_id,
          full_name: u.full_name,
          profile_image: u.profile_image,
          blood_group: d.blood_group,
          division: d.division,
          district: d.district,
          upazila: d.upazila,
          area: d.area,
          last_donation_date: d.last_donation_date,
          availability: d.availability,
          verification_status: d.verification_status,
          phone_visibility: d.phone_visibility,
          phone: d.phone_visibility === 'public' ? u.phone : null
        };
      });

    const groupCounts: Record<string, number> = {};
    BLOOD_GROUPS.forEach((bg) => {
      groupCounts[bg] = approvedDonors.filter((d) => d.blood_group === bg).length;
    });

    const emergencyRequests = publicRequests
      .filter((r) => r.urgency_level === 'Emergency' || r.urgency_level === 'Urgent')
      .slice(0, 4);

    const activePosters = (db.Donor_Posters || [])
      .filter((p) => !p.deleted_at && p.is_active !== false)
      .sort(
        (a, b) =>
          (Number(a.sort_order) || 1) - (Number(b.sort_order) || 1) ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    const publicSettings: Record<string, string> = {};
    db.Settings.filter((s) => s.setting_group !== 'security').forEach((s) => {
      publicSettings[s.setting_key] = s.setting_value;
    });

    return ok(res, 'হোমপেজ তথ্য লোড হয়েছে।', {
      stats: {
        total_donors: activeDonors.length,
        approved_donors: approvedDonors.length,
        completed_donations: completedDonations,
        active_requests: publicRequests.length
      },
      approved_donors: mappedDonors,
      recent_donors: mappedDonors.slice(0, 6),
      group_counts: groupCounts,
      emergency_requests: emergencyRequests,
      posters: activePosters,
      settings: publicSettings,
      campaigns: db.Campaigns.filter((c) => !c.deleted_at)
        .slice(0, 3)
        .map((c) => ({
          ...c,
          registered_count: db.Campaign_Registrations.filter((r) => r.campaign_id === c.campaign_id).length
        })),
      blogs: db.Blogs.filter((b) => !b.deleted_at && b.publish_status === 'Published').slice(0, 3)
    });
  });

  app.get('/api/settings/public', async (_req, res) => {
    const db = getDb();
    await hydrateDbFromGoogleSheet(db);
    const out: Record<string, string> = {};
    db.Settings.filter((s) => s.setting_group !== 'security').forEach((s) => {
      out[s.setting_key] = s.setting_value;
    });
    return ok(res, 'সেটিংস লোড হয়েছে।', { settings: out });
  });

  // ================= AUTH & BOOTSTRAP (NO OTP) =================
  app.get('/api/auth/bootstrap-status', async (_req, res) => {
    const db = getDb();
    await hydrateDbFromGoogleSheet(db);
    const hasSuperAdmin = db.Users.some((u) => u.role === 'super_admin' && !u.deleted_at);
    return ok(res, 'স্ট্যাটাস লোড হয়েছে।', {
      needs_super_admin_setup: !hasSuperAdmin,
      passcode_configured: Boolean(process.env.SUPER_ADMIN_PASSCODE)
    });
  });

  app.post('/api/auth/bootstrap-super-admin', async (req, res) => {
    const db = getDb();
    await hydrateDbFromGoogleSheet(db);
    const hasSuperAdmin = db.Users.some((u) => u.role === 'super_admin' && !u.deleted_at);
    if (hasSuperAdmin) {
      return fail(res, 409, 'সুপার অ্যাডমিন অ্যাকাউন্ট ইতিমধ্যেই তৈরি করা হয়েছে।', 'ALREADY_INITIALIZED');
    }
    const envPasscode = process.env.SUPER_ADMIN_PASSCODE;
    if (envPasscode && req.body.passcode !== envPasscode) {
      return fail(res, 403, 'পরিবেশ পাসকোড সঠিক নয়।', 'INVALID_PASSCODE');
    }

    const fullName = sanitizeText(req.body.full_name || 'সুপার অ্যাডমিন');
    const email = sanitizeText(req.body.email || '').toLowerCase();
    const phone = normalizePhone(req.body.phone || '');
    const password = String(req.body.password || '');

    if (!email && !phone) {
      return fail(res, 400, 'ইমেইল অথবা মোবাইল নম্বর দিন।', 'VALIDATION_ERROR');
    }
    if (email && !isValidEmail(email)) {
      return fail(res, 400, 'সঠিক ইমেইল ঠিকানা দিন।', 'VALIDATION_ERROR');
    }
    if (phone && !isValidBdPhone(phone)) {
      return fail(res, 400, 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।', 'VALIDATION_ERROR');
    }
    if (password.length < 6) {
      return fail(res, 400, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', 'VALIDATION_ERROR');
    }

    const salt = generateSalt();
    const hash = hashPassword(password, salt);
    const userId = generateId('USR');
    const ts = new Date().toISOString();

    const newUser: StoredUser = {
      user_id: userId,
      full_name: fullName,
      email,
      phone,
      password_hash: hash,
      password_salt: salt,
      role: 'super_admin',
      account_status: 'active',
      email_verified: true,
      phone_verified: true,
      profile_image: '',
      created_at: ts,
      updated_at: ts,
      last_login: ts,
      deleted_at: ''
    };
    db.Users.push(newUser);
    db.Admins.push({
      admin_id: generateId('ADM'),
      full_name: fullName,
      email,
      phone,
      role: 'super_admin',
      permissions: 'ALL',
      account_status: 'active',
      created_at: ts,
      last_login: ts
    });

    const rawToken = generateSessionToken();
    const ttlHours = 24;
    db.Sessions.push({
      session_id: generateId('SES'),
      user_id: userId,
      token_hash: hashSessionToken(rawToken),
      role: 'super_admin',
      expires_at: new Date(Date.now() + ttlHours * 3600000).toISOString(),
      revoked: false,
      created_at: ts
    });
    addActivityLog(db, userId, 'super_admin', 'BOOTSTRAP_SUPER_ADMIN', 'Auth', userId, 'প্রথম সুপার অ্যাডমিন অ্যাকাউন্ট তৈরি');
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Users', 'Admins', 'Sessions', 'Activity_Logs']);
    setSessionCookie(res, rawToken, ttlHours * 3600);
    return ok(res, 'সুপার অ্যাডমিন অ্যাকাউন্ট সফলভাবে তৈরি ও লগইন হয়েছে।', {
      token: rawToken,
      user: publicUserShape(newUser)
    });
  });

  app.post('/api/auth/register', async (req, res) => {
    const db = getDb();
    const regEnabled = db.Settings.find((s) => s.setting_key === 'registration_enabled')?.setting_value;
    if (regEnabled === 'false') {
      return fail(res, 403, 'বর্তমানে নতুন নিবন্ধন সাময়িকভাবে বন্ধ রাখা হয়েছে।', 'REGISTRATION_DISABLED');
    }
    const fullName = sanitizeText(req.body.full_name);
    const email = sanitizeText(req.body.email || '').toLowerCase();
    const phone = normalizePhone(req.body.phone || '');
    const password = String(req.body.password || '');
    const role = ['donor', 'recipient', 'volunteer', 'user'].includes(req.body.role)
      ? req.body.role
      : 'donor';

    if (!fullName || fullName.length < 2) {
      return fail(res, 400, 'সঠিক পূর্ণ নাম লিখুন।', 'VALIDATION_ERROR');
    }
    if (!email && !phone) {
      return fail(res, 400, 'মোবাইল নম্বর অথবা ইমেইল—যেকোনো একটি অবশ্যই দিতে হবে।', 'VALIDATION_ERROR');
    }
    if (email && !isValidEmail(email)) {
      return fail(res, 400, 'সঠিক ইমেইল ঠিকানা লিখুন।', 'VALIDATION_ERROR');
    }
    if (phone && !isValidBdPhone(phone)) {
      return fail(res, 400, 'সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)।', 'VALIDATION_ERROR');
    }
    if (password.length < 6) {
      return fail(res, 400, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', 'VALIDATION_ERROR');
    }

    if (email) {
      await findUserInGoogleSheet(db, email);
    }
    if (phone) {
      await findUserInGoogleSheet(db, phone);
    }

    const dup = db.Users.find(
      (u) => !u.deleted_at && ((email && u.email === email) || (phone && u.phone === phone))
    );
    if (dup) {
      return fail(res, 409, 'এই মোবাইল নম্বর অথবা ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে।', 'DUPLICATE_ACCOUNT');
    }

    const salt = generateSalt();
    const hash = hashPassword(password, salt);
    const userId = generateId('USR');
    const ts = new Date().toISOString();

    const user: StoredUser = {
      user_id: userId,
      full_name: fullName,
      email,
      phone,
      password_hash: hash,
      password_salt: salt,
      role,
      account_status: 'active',
      email_verified: false,
      phone_verified: false,
      profile_image: sanitizeProfileImage(req.body.profile_image),
      created_at: ts,
      updated_at: ts,
      last_login: ts,
      deleted_at: ''
    };
    db.Users.push(user);

    let donorProfile = null;
    if (role === 'donor' && req.body.blood_group) {
      const bg = String(req.body.blood_group).toUpperCase();
      if (!BLOOD_GROUPS.includes(bg)) {
        return fail(res, 400, 'সঠিক রক্তের গ্রুপ নির্বাচন করুন।', 'VALIDATION_ERROR');
      }
      const manualApproval =
        db.Settings.find((s) => s.setting_key === 'donor_manual_approval')?.setting_value !== 'false';
      donorProfile = {
        donor_id: generateId('DNR'),
        user_id: userId,
        blood_group: bg,
        date_of_birth: sanitizeText(req.body.date_of_birth || ''),
        gender: sanitizeText(req.body.gender || ''),
        division: sanitizeText(req.body.division || ''),
        district: sanitizeText(req.body.district || ''),
        upazila: sanitizeText(req.body.upazila || ''),
        union_name: sanitizeText(req.body.union_name || ''),
        ward: sanitizeText(req.body.ward || ''),
        area: sanitizeText(req.body.area || ''),
        address: sanitizeText(req.body.address || ''),
        last_donation_date: sanitizeText(req.body.last_donation_date || ''),
        availability: req.body.availability === 'unavailable' ? 'unavailable' : 'available',
        verification_status: manualApproval ? 'Pending Verification' : 'Approved',
        phone_visibility: req.body.phone_visibility === 'public' ? 'public' : 'private',
        bio: sanitizeText(req.body.bio || ''),
        created_at: ts,
        updated_at: ts
      };
      db.Donors.push(donorProfile);
    } else if (role === 'volunteer') {
      db.Volunteers.push({
        volunteer_id: generateId('VOL'),
        user_id: userId,
        skills: sanitizeText(req.body.skills || ''),
        division: sanitizeText(req.body.division || ''),
        district: sanitizeText(req.body.district || ''),
        upazila: sanitizeText(req.body.upazila || ''),
        availability: 'available',
        approval_status: 'Pending',
        joined_at: ts
      });
    } else if (role === 'recipient') {
      db.Recipients.push({
        recipient_id: generateId('RCP'),
        user_id: userId,
        full_name: fullName,
        phone,
        relationship_to_patient: sanitizeText(req.body.relationship_to_patient || 'নিজে/পরিবার'),
        division: sanitizeText(req.body.division || ''),
        district: sanitizeText(req.body.district || ''),
        upazila: sanitizeText(req.body.upazila || ''),
        address: sanitizeText(req.body.address || ''),
        created_at: ts,
        updated_at: ts
      });
    }

    const rawToken = generateSessionToken();
    const ttlHours = 24;
    db.Sessions.push({
      session_id: generateId('SES'),
      user_id: userId,
      token_hash: hashSessionToken(rawToken),
      role,
      expires_at: new Date(Date.now() + ttlHours * 3600000).toISOString(),
      revoked: false,
      created_at: ts
    });

    addNotification(
      db,
      userId,
      'রেজিস্ট্রেশন সফল হয়েছে',
      role === 'donor'
        ? 'BLOODIX-এ স্বাগতম! আপনার ডোনার প্রোফাইল অ্যাডমিন যাচাইকরণের জন্য জমা হয়েছে। অনুমোদনের পর ডিরেক্টরিতে যুক্ত হবে।'
        : 'BLOODIX প্ল্যাটফর্মে আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।',
      'registration_success',
      userId
    );
    addActivityLog(db, userId, role, 'REGISTER', 'Auth', userId, `${fullName} (${role}) নিবন্ধন করেছেন`);
    saveDb(db);
    await pushTablesToGoogleSheet(db, [
      'Users',
      'Donors',
      'Volunteers',
      'Recipients',
      'Sessions',
      'Notifications',
      'Activity_Logs'
    ]);

    setSessionCookie(res, rawToken, ttlHours * 3600);
    return ok(res, 'রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে।', {
      token: rawToken,
      user: publicUserShape(user),
      donor: donorProfile
    });
  });

  app.post('/api/auth/login', async (req, res) => {
    const db = getDb();
    const identifier = sanitizeText(req.body.identifier || req.body.email || req.body.phone || '');
    const password = String(req.body.password || '');
    const rememberMe = Boolean(req.body.remember_me);

    if (!identifier || !password) {
      return fail(res, 400, 'মোবাইল নম্বর অথবা ইমেইল এবং পাসওয়ার্ড দিন।', 'VALIDATION_ERROR');
    }

    const rl = checkRateLimit(identifier);
    if (!rl.allowed) {
      return fail(
        res,
        429,
        `অতিরিক্ত ভুল চেষ্টার কারণে ${rl.remainingMinutes} মিনিটের জন্য লগইন বন্ধ রয়েছে।`,
        'RATE_LIMITED'
      );
    }

    const isEmail = identifier.includes('@');
    const normalized = isEmail ? identifier.toLowerCase() : normalizePhone(identifier);

    // Check Google Sheet directly first so previously registered Sheet users can always log in
    await findUserInGoogleSheet(db, normalized);

    const user = db.Users.find(
      (u) => !u.deleted_at && (isEmail ? u.email === normalized : u.phone === normalized)
    );

    if (!user || !verifyPassword(password, user.password_hash, user.password_salt)) {
      recordFailedLogin(identifier);
      return fail(res, 401, 'মোবাইল/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।', 'INVALID_CREDENTIALS');
    }

    if (user.account_status !== 'active') {
      return fail(res, 403, 'আপনার অ্যাকাউন্টটি বর্তমানে স্থগিত বা নিষ্ক্রিয় রয়েছে।', 'ACCOUNT_SUSPENDED');
    }

    clearRateLimit(identifier);
    const rawToken = generateSessionToken();
    const ttlHours = rememberMe ? 168 : 24;
    const ts = new Date().toISOString();

    user.last_login = ts;
    db.Sessions.push({
      session_id: generateId('SES'),
      user_id: user.user_id,
      token_hash: hashSessionToken(rawToken),
      role: user.role,
      expires_at: new Date(Date.now() + ttlHours * 3600000).toISOString(),
      revoked: false,
      created_at: ts
    });
    addActivityLog(db, user.user_id, user.role, 'LOGIN', 'Auth', user.user_id, 'ব্যবহারকারী লগইন করেছেন');
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Users', 'Sessions', 'Activity_Logs']);

    setSessionCookie(res, rawToken, ttlHours * 3600);
    return ok(res, 'সফলভাবে লগইন হয়েছে।', {
      token: rawToken,
      user: publicUserShape(user)
    });
  });

  app.post('/api/auth/logout', async (req: AuthedRequest, res) => {
    if (req.authSessionId) {
      const db = getDb();
      const ses = db.Sessions.find((s) => s.session_id === req.authSessionId);
      if (ses) ses.revoked = true;
      saveDb(db);
      await pushTablesToGoogleSheet(db, ['Sessions']);
    }
    clearSessionCookie(res);
    return ok(res, 'সফলভাবে লগআউট হয়েছে।');
  });

  app.get('/api/auth/me', (req: AuthedRequest, res) => {
    const user = requireAuth(req, res);
    if (!user) return;
    const db = getDb();
    const donor = db.Donors.find((d) => d.user_id === user.user_id) || null;
    const repScope = user.role === 'representative' ? getRepScope(user.user_id) : null;
    const volunteer = db.Volunteers.find((v) => v.user_id === user.user_id) || null;
    const notifications = db.Notifications.filter((n) => n.user_id === user.user_id);

    return ok(res, 'প্রোফাইল লোড হয়েছে।', {
      user: publicUserShape(user),
      donor,
      volunteer,
      representative: repScope,
      notifications
    });
  });

  app.post('/api/auth/change-password', async (req: AuthedRequest, res) => {
    const user = requireAuth(req, res);
    if (!user) return;
    const currentPassword = String(req.body.current_password || '');
    const newPassword = String(req.body.new_password || '');
    if (!verifyPassword(currentPassword, user.password_hash, user.password_salt)) {
      return fail(res, 400, 'বর্তমান পাসওয়ার্ড সঠিক নয়।', 'INVALID_PASSWORD');
    }
    if (newPassword.length < 6) {
      return fail(res, 400, 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', 'VALIDATION_ERROR');
    }
    const db = getDb();
    const stored = db.Users.find((u) => u.user_id === user.user_id)!;
    const salt = generateSalt();
    stored.password_salt = salt;
    stored.password_hash = hashPassword(newPassword, salt);
    stored.updated_at = new Date().toISOString();
    addActivityLog(db, user.user_id, user.role, 'CHANGE_PASSWORD', 'Auth', user.user_id, 'পাসওয়ার্ড পরিবর্তন');
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Users', 'Activity_Logs']);
    return ok(res, 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে।');
  });

  app.post('/api/auth/request-password-reset', async (req, res) => {
    const identifier = sanitizeText(req.body.identifier || '');
    const reason = sanitizeText(req.body.reason || 'পাসওয়ার্ড ভুলে যাওয়ার কারণে রিসেট আবেদন');
    if (!identifier) {
      return fail(res, 400, 'আপনার নিবন্ধিত মোবাইল নম্বর অথবা ইমেইল দিন।', 'VALIDATION_ERROR');
    }
    const db = getDb();
    const refCode = 'RST-' + generateId('PW').slice(-6);
    db.Password_Resets.unshift({
      reset_id: generateId('PRQ'),
      user_id: '',
      identifier,
      reference_code: refCode,
      reason,
      status: 'Pending Admin Review',
      resolved_by: '',
      created_at: new Date().toISOString(),
      resolved_at: ''
    });
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Password_Resets']);
    return ok(
      res,
      'অ্যাডমিন-সহায়তাপ্রাপ্ত পাসওয়ার্ড রিসেট আবেদন জমা হয়েছে (OTP ছাড়া)। নিচের রেফারেন্স কোডটি সংরক্ষণ করুন।',
      { reference_code: refCode }
    );
  });

  // ================= DONORS =================
  app.get('/api/donors/search', async (req, res) => {
    const db = getDb();
    await hydrateDbFromGoogleSheet(db);
    const q = req.query as Record<string, string>;
    const list = db.Donors.filter((d) => {
      // Strict rule: Only Approved & Active donors appear in public search
      if (d.deleted_at || d.verification_status !== 'Approved') return false;
      const u = db.Users.find((usr) => usr.user_id === d.user_id);
      if (!u || u.account_status !== 'active' || u.deleted_at) return false;
      if (q.blood_group && d.blood_group !== q.blood_group) return false;
      if (q.division && d.division !== q.division) return false;
      if (q.district && d.district !== q.district) return false;
      if (q.upazila && d.upazila !== q.upazila) return false;
      if (q.union_name && !d.union_name.includes(q.union_name)) return false;
      if (q.ward && !d.ward.includes(q.ward)) return false;
      if (q.area && !d.area.toLowerCase().includes(q.area.toLowerCase())) return false;
      if (q.availability && d.availability !== q.availability) return false;
      return true;
    }).map((d) => {
      const u = db.Users.find((usr) => usr.user_id === d.user_id)!;
      return {
        donor_id: d.donor_id,
        full_name: u.full_name,
        profile_image: u.profile_image,
        blood_group: d.blood_group,
        division: d.division,
        district: d.district,
        upazila: d.upazila,
        union_name: d.union_name,
        ward: d.ward,
        area: d.area,
        last_donation_date: d.last_donation_date,
        availability: d.availability,
        verification_status: d.verification_status,
        phone_visibility: d.phone_visibility,
        phone: d.phone_visibility === 'public' ? u.phone : null,
        bio: d.bio
      };
    });
    return ok(res, 'অনুমোদিত ডোনারদের তালিকা লোড হয়েছে।', { donors: list });
  });

  app.get('/api/donors/:id', async (req, res) => {
    const db = getDb();
    await hydrateDbFromGoogleSheet(db);
    const donor = db.Donors.find(
      (d) => !d.deleted_at && d.donor_id === req.params.id && d.verification_status === 'Approved'
    );
    if (!donor) return fail(res, 404, 'অনুমোদিত রক্তদাতা পাওয়া যায়নি।', 'NOT_FOUND');
    const u = db.Users.find((usr) => usr.user_id === donor.user_id && !usr.deleted_at);
    if (!u || u.account_status !== 'active') return fail(res, 404, 'রক্তদাতা সক্রিয় নন।', 'NOT_FOUND');

    const verifiedDonations = db.Donations.filter(
      (don) => don.donor_id === donor.donor_id && don.verification_status === 'Verified'
    ).length;

    return ok(res, 'ডোনারের তথ্য লোড হয়েছে।', {
      donor: {
        donor_id: donor.donor_id,
        full_name: u.full_name,
        profile_image: u.profile_image,
        blood_group: donor.blood_group,
        division: donor.division,
        district: donor.district,
        upazila: donor.upazila,
        union_name: donor.union_name,
        ward: donor.ward,
        area: donor.area,
        last_donation_date: donor.last_donation_date,
        availability: donor.availability,
        verification_status: donor.verification_status,
        phone_visibility: donor.phone_visibility,
        phone: donor.phone_visibility === 'public' ? u.phone : null,
        bio: donor.bio,
        verified_donations_count: verifiedDonations
      }
    });
  });

  app.post('/api/donor/profile', async (req: AuthedRequest, res) => {
    const user = requireAuth(req, res);
    if (!user) return;
    const db = getDb();
    let donor = db.Donors.find((d) => d.user_id === user.user_id);
    const ts = new Date().toISOString();

    if (!donor) {
      const bg = String(req.body.blood_group || '').toUpperCase();
      if (!BLOOD_GROUPS.includes(bg)) return fail(res, 400, 'সঠিক রক্তের গ্রুপ দিন।', 'VALIDATION_ERROR');
      donor = {
        donor_id: generateId('DNR'),
        user_id: user.user_id,
        blood_group: bg,
        date_of_birth: sanitizeText(req.body.date_of_birth || ''),
        gender: sanitizeText(req.body.gender || ''),
        division: sanitizeText(req.body.division || ''),
        district: sanitizeText(req.body.district || ''),
        upazila: sanitizeText(req.body.upazila || ''),
        union_name: sanitizeText(req.body.union_name || ''),
        ward: sanitizeText(req.body.ward || ''),
        area: sanitizeText(req.body.area || ''),
        address: sanitizeText(req.body.address || ''),
        last_donation_date: sanitizeText(req.body.last_donation_date || ''),
        availability: req.body.availability === 'unavailable' ? 'unavailable' : 'available',
        verification_status: 'Pending Verification',
        phone_visibility: req.body.phone_visibility === 'public' ? 'public' : 'private',
        bio: sanitizeText(req.body.bio || ''),
        created_at: ts,
        updated_at: ts
      };
      db.Donors.push(donor);
    } else {
      const fields = [
        'division', 'district', 'upazila', 'union_name', 'ward', 'area',
        'address', 'last_donation_date', 'availability', 'phone_visibility', 'bio'
      ];
      fields.forEach((f) => {
        if (req.body[f] !== undefined) donor[f] = sanitizeText(req.body[f]);
      });
      donor.updated_at = ts;
    }
    if (req.body.profile_image !== undefined) {
      const storedUser = db.Users.find((u) => u.user_id === user.user_id);
      if (storedUser) {
        storedUser.profile_image = sanitizeProfileImage(req.body.profile_image);
        storedUser.updated_at = ts;
      }
    }
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Donors', 'Users']);
    return ok(res, 'ডোনার প্রোফাইল সংরক্ষিত হয়েছে।', { donor });
  });

  app.post('/api/donor/contact-request', async (req: AuthedRequest, res) => {
    const user = requireAuth(req, res);
    if (!user) return;
    const db = getDb();
    const donor = db.Donors.find(
      (d) => d.donor_id === req.body.donor_id && d.verification_status === 'Approved'
    );
    if (!donor) return fail(res, 404, 'অনুমোদিত ডোনার পাওয়া যায়নি।', 'NOT_FOUND');

    const cr = {
      contact_request_id: generateId('CRQ'),
      request_id: sanitizeText(req.body.request_id || ''),
      donor_id: donor.donor_id,
      requester_user_id: user.user_id,
      requester_name: user.full_name,
      donor_consent: 'pending',
      contact_status: 'Pending',
      message: sanitizeText(req.body.message || 'জরুরি রক্তের প্রয়োজনে যোগাযোগ করতে চাই।'),
      created_at: new Date().toISOString(),
      responded_at: ''
    };
    db.Contact_Requests.unshift(cr);
    addNotification(
      db,
      donor.user_id,
      'নতুন যোগাযোগের অনুরোধ',
      `${user.full_name} আপনার সাথে রক্তদানের বিষয়ে যোগাযোগের অনুরোধ করেছেন।`,
      'donor_contact_request',
      cr.contact_request_id
    );
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Contact_Requests', 'Notifications']);
    return ok(res, 'ডোনারের কাছে যোগাযোগের অনুরোধ পাঠানো হয়েছে।', { contact_request: cr });
  });

  app.get('/api/donor/contact-requests', (req: AuthedRequest, res) => {
    const user = requireAuth(req, res);
    if (!user) return;
    const db = getDb();
    const donor = db.Donors.find((d) => d.user_id === user.user_id);
    const incoming = donor
      ? db.Contact_Requests.filter((c) => c.donor_id === donor.donor_id)
      : [];
    const outgoing = db.Contact_Requests.filter((c) => c.requester_user_id === user.user_id).map((c) => {
      const d = db.Donors.find((dn) => dn.donor_id === c.donor_id);
      const du = d ? db.Users.find((u) => u.user_id === d.user_id) : null;
      return {
        ...c,
        donor_name: du?.full_name || 'ডোনার',
        donor_blood_group: d?.blood_group || '',
        donor_phone: c.donor_consent === 'approved' ? du?.phone || null : null
      };
    });
    return ok(res, 'যোগাযোগ অনুরোধ লোড হয়েছে।', { incoming, outgoing });
  });

  app.post('/api/donor/contact-request/respond', async (req: AuthedRequest, res) => {
    const user = requireAuth(req, res);
    if (!user) return;
    const db = getDb();
    const donor = db.Donors.find((d) => d.user_id === user.user_id);
    if (!donor) return fail(res, 403, 'ডোনার প্রোফাইল নেই।', 'FORBIDDEN');
    const cr = db.Contact_Requests.find(
      (c) => c.contact_request_id === req.body.contact_request_id && c.donor_id === donor.donor_id
    );
    if (!cr) return fail(res, 404, 'অনুরোধ পাওয়া যায়নি।', 'NOT_FOUND');

    const consent = req.body.consent === 'approved' ? 'approved' : 'declined';
    cr.donor_consent = consent;
    cr.contact_status = consent === 'approved' ? 'Approved' : 'Declined';
    cr.responded_at = new Date().toISOString();

    addNotification(
      db,
      cr.requester_user_id,
      consent === 'approved' ? 'ডোনার যোগাযোগে সম্মতি দিয়েছেন' : 'যোগাযোগ অনুরোধ প্রত্যাখ্যাত হয়েছে',
      consent === 'approved'
        ? `${user.full_name} আপনার যোগাযোগ অনুরোধে সম্মতি দিয়েছেন। ড্যাশবোর্ড থেকে নম্বর দেখতে পারবেন।`
        : `${user.full_name} এই মুহূর্তে অনুরোধটি গ্রহণ করতে পারেননি।`,
      'contact_response',
      cr.contact_request_id
    );
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Contact_Requests', 'Notifications']);
    return ok(res, 'আপনার সিদ্ধান্ত সংরক্ষিত হয়েছে।', { contact_request: cr });
  });

  // ================= BLOOD REQUESTS =================
  app.post('/api/requests', async (req: AuthedRequest, res) => {
    const db = getDb();
    const bg = String(req.body.blood_group || '').toUpperCase();
    if (!BLOOD_GROUPS.includes(bg)) return fail(res, 400, 'সঠিক রক্তের গ্রুপ দিন।', 'VALIDATION_ERROR');
    const patientName = sanitizeText(req.body.patient_name);
    const requesterName = sanitizeText(req.body.requester_name);
    const contactPhone = normalizePhone(req.body.contact_phone);
    const hospitalName = sanitizeText(req.body.hospital_name);
    if (!patientName || !requesterName || !isValidBdPhone(contactPhone) || !hospitalName) {
      return fail(res, 400, 'রোগীর নাম, আবেদনকারী, হাসপাতাল এবং সঠিক মোবাইল নম্বর দিন।', 'VALIDATION_ERROR');
    }

    const reqApprovalRequired =
      db.Settings.find((s) => s.setting_key === 'request_approval_required')?.setting_value !== 'false';

    const ts = new Date().toISOString();
    const userId = req.authUser ? req.authUser.user_id : 'GUEST';
    const record = {
      request_id: generateId('REQ'),
      requester_user_id: userId,
      patient_name: patientName,
      requester_name: requesterName,
      blood_group: bg,
      units_required: Math.max(1, Number(req.body.units_required) || 1),
      hospital_name: hospitalName,
      hospital_address: sanitizeText(req.body.hospital_address || ''),
      division: sanitizeText(req.body.division || ''),
      district: sanitizeText(req.body.district || ''),
      upazila: sanitizeText(req.body.upazila || ''),
      required_date: sanitizeText(req.body.required_date || ''),
      required_time: sanitizeText(req.body.required_time || ''),
      urgency_level: ['Normal', 'Urgent', 'Emergency'].includes(req.body.urgency_level)
        ? req.body.urgency_level
        : 'Urgent',
      contact_phone: contactPhone,
      patient_condition: sanitizeText(req.body.patient_condition || ''),
      additional_notes: sanitizeText(req.body.additional_notes || ''),
      admin_status: reqApprovalRequired ? 'Pending' : 'Approved',
      donor_found_count: 0,
      completed_units: 0,
      assigned_representative_id: '',
      created_at: ts,
      updated_at: ts,
      completed_at: ''
    };
    db.Blood_Requests.unshift(record);
    if (userId !== 'GUEST') {
      addNotification(
        db,
        userId,
        'রক্তের অনুরোধ জমা হয়েছে',
        `${patientName}-এর জন্য রক্তের অনুরোধটি যাচাইয়ের জন্য জমা হয়েছে।`,
        'blood_request_submitted',
        record.request_id
      );
    }
    addActivityLog(db, userId, req.authUser?.role || 'guest', 'CREATE_BLOOD_REQUEST', 'Blood_Requests', record.request_id, 'নতুন রক্তের অনুরোধ');
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Blood_Requests', 'Notifications', 'Activity_Logs']);
    return ok(
      res,
      reqApprovalRequired
        ? 'রক্তের অনুরোধ সফলভাবে জমা হয়েছে। অ্যাডমিন যাচাইয়ের পর প্রকাশিত হবে।'
        : 'রক্তের অনুরোধ সফলভাবে প্রকাশিত হয়েছে।',
      { request: record }
    );
  });

  app.get('/api/requests', async (req: AuthedRequest, res) => {
    const db = getDb();
    await hydrateDbFromGoogleSheet(db);
    const q = req.query as Record<string, string>;
    const isStaff = req.authUser && ['admin', 'super_admin'].includes(req.authUser.role);

    const list = db.Blood_Requests.filter((r) => {
      if (r.deleted_at) return false;
      if (q.mine === 'true') {
        return req.authUser && r.requester_user_id === req.authUser.user_id;
      }
      if (!isStaff) {
        const visible = ['Approved', 'Donor Matching', 'Donor Found', 'Partially Fulfilled'];
        if (!visible.includes(r.admin_status)) return false;
      }
      if (q.blood_group && r.blood_group !== q.blood_group) return false;
      if (q.urgency_level && r.urgency_level !== q.urgency_level) return false;
      if (q.division && r.division !== q.division) return false;
      if (q.district && r.district !== q.district) return false;
      if (q.status && r.admin_status !== q.status) return false;
      return true;
    });

    return ok(res, 'রক্তের অনুরোধ লোড হয়েছে।', { requests: list });
  });

  app.post('/api/requests/:id/action', async (req: AuthedRequest, res) => {
    const user = requireAuth(req, res);
    if (!user) return;
    const db = getDb();
    const item = db.Blood_Requests.find((r) => r.request_id === req.params.id);
    if (!item) return fail(res, 404, 'অনুরোধ পাওয়া যায়নি।', 'NOT_FOUND');

    const isStaff = ['admin', 'super_admin'].includes(user.role);
    const isOwner = item.requester_user_id === user.user_id;
    const action = req.body.action;

    if (['approve', 'reject', 'match'].includes(action)) {
      if (!isStaff && !(action === 'match' && user.role === 'representative')) {
        return fail(res, 403, 'অনুমতি নেই।', 'FORBIDDEN');
      }
      if (user.role === 'representative') {
        const scope = getRepScope(user.user_id);
        if (!scope || !isRecordInArea(item, scope.assignments)) {
          return fail(res, 403, 'আপনার এলাকার বাইরের অনুরোধে অ্যাক্সেস নেই।', 'AREA_FORBIDDEN');
        }
      }
    } else if (!isStaff && !isOwner) {
      return fail(res, 403, 'অনুমতি নেই।', 'FORBIDDEN');
    }

    if (action === 'approve') {
      item.admin_status = 'Approved';
      if (item.requester_user_id !== 'GUEST') {
        addNotification(db, item.requester_user_id, 'রক্তের অনুরোধ অনুমোদিত', 'আপনার রক্তের অনুরোধটি অনুমোদিত ও প্রকাশিত হয়েছে।', 'blood_request_approved', item.request_id);
      }
    } else if (action === 'reject') {
      item.admin_status = 'Rejected';
    } else if (action === 'match') {
      item.admin_status = 'Donor Matching';
      item.donor_found_count += 1;
    } else if (action === 'complete') {
      item.admin_status = 'Completed';
      item.completed_units = item.units_required;
      item.completed_at = new Date().toISOString();
    } else if (action === 'cancel') {
      item.admin_status = 'Cancelled';
    }
    item.updated_at = new Date().toISOString();
    addActivityLog(db, user.user_id, user.role, `REQUEST_${action.toUpperCase()}`, 'Blood_Requests', item.request_id, `রক্তের অনুরোধ ${action}`);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Blood_Requests', 'Notifications', 'Activity_Logs']);
    return ok(res, 'অনুরোধের অবস্থা হালনাগাদ হয়েছে।', { request: item });
  });

  // ================= DONATIONS =================
  app.get('/api/donations', (req: AuthedRequest, res) => {
    const user = requireAuth(req, res);
    if (!user) return;
    const db = getDb();
    if (['admin', 'super_admin'].includes(user.role)) {
      const enriched = db.Donations.map((don) => {
        const d = db.Donors.find((dn) => dn.donor_id === don.donor_id);
        const du = d ? db.Users.find((u) => u.user_id === d.user_id) : null;
        return { ...don, donor_name: du?.full_name || 'ডোনার' };
      });
      return ok(res, 'সকল রক্তদান রেকর্ড লোড হয়েছে।', { donations: enriched });
    }
    const donor = db.Donors.find((d) => d.user_id === user.user_id);
    const mine = donor ? db.Donations.filter((d) => d.donor_id === donor.donor_id) : [];
    return ok(res, 'রক্তদানের ইতিহাস লোড হয়েছে।', { donations: mine });
  });

  app.post('/api/donations', async (req: AuthedRequest, res) => {
    const user = requireAuth(req, res);
    if (!user) return;
    const db = getDb();
    const donor = db.Donors.find((d) => d.user_id === user.user_id);
    if (!donor) return fail(res, 400, 'রক্তদান রেকর্ড জমা দিতে ডোনার প্রোফাইল থাকতে হবে।', 'NOT_DONOR');

    const record = {
      donation_id: generateId('DON'),
      donor_id: donor.donor_id,
      request_id: sanitizeText(req.body.request_id || ''),
      recipient_user_id: sanitizeText(req.body.recipient_user_id || ''),
      donation_date: sanitizeText(req.body.donation_date),
      hospital_name: sanitizeText(req.body.hospital_name),
      blood_group: donor.blood_group,
      verification_status: 'Pending Verification',
      verified_by: '',
      verified_at: '',
      notes: sanitizeText(req.body.notes || ''),
      created_at: new Date().toISOString()
    };
    db.Donations.unshift(record);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Donations']);
    return ok(res, 'রক্তদানের তথ্য যাচাইকরণের জন্য জমা হয়েছে।', { donation: record });
  });

  app.post('/api/donations/:id/verify', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const don = db.Donations.find((d) => d.donation_id === req.params.id);
    if (!don) return fail(res, 404, 'রেকর্ড পাওয়া যায়নি।', 'NOT_FOUND');
    const status = req.body.status === 'Rejected' ? 'Rejected' : 'Verified';
    don.verification_status = status;
    don.verified_by = admin.user_id;
    don.verified_at = new Date().toISOString();
    if (status === 'Verified') {
      const donor = db.Donors.find((d) => d.donor_id === don.donor_id);
      if (donor) donor.last_donation_date = don.donation_date;
    }
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Donations', 'Donors']);
    return ok(res, 'রক্তদানের রেকর্ড যাচাই সম্পন্ন হয়েছে।', { donation: don });
  });

  // ================= CAMPAIGNS & BLOGS & CONTACT =================
  app.get('/api/campaigns', async (req: AuthedRequest, res) => {
    const db = getDb();
    await hydrateDbFromGoogleSheet(db);
    const list = db.Campaigns.filter((c) => !c.deleted_at).map((c) => ({
      ...c,
      registered_count: db.Campaign_Registrations.filter((r) => r.campaign_id === c.campaign_id).length,
      is_registered: req.authUser
        ? db.Campaign_Registrations.some(
            (r) => r.campaign_id === c.campaign_id && r.user_id === req.authUser!.user_id
          )
        : false
    }));
    return ok(res, 'ক্যাম্পেইন তালিকা লোড হয়েছে।', { campaigns: list });
  });

  app.post('/api/campaigns', async (req: AuthedRequest, res) => {
    const actor = requireAuth(req, res, ['admin', 'super_admin', 'representative']);
    if (!actor) return;
    if (actor.role === 'representative') {
      const scope = getRepScope(actor.user_id);
      if (!scope?.permissions?.can_manage_campaigns) {
        return fail(res, 403, 'ক্যাম্পেইন তৈরির অনুমতি আপনার নেই।', 'FORBIDDEN');
      }
    }
    const db = getDb();
    const bannerImg =
      sanitizeImageAsset(req.body.banner_url) || '/src/assets/images/campaign_community_drive_1795424733186.jpg';
    const c = {
      campaign_id: generateId('CMP'),
      campaign_title: sanitizeText(req.body.campaign_title),
      campaign_description: sanitizeText(req.body.campaign_description || ''),
      banner_url: bannerImg,
      event_date: sanitizeText(req.body.event_date),
      start_time: sanitizeText(req.body.start_time || '09:00'),
      end_time: sanitizeText(req.body.end_time || '16:00'),
      venue: sanitizeText(req.body.venue),
      division: sanitizeText(req.body.division || ''),
      district: sanitizeText(req.body.district || ''),
      upazila: sanitizeText(req.body.upazila || ''),
      organizer: sanitizeText(req.body.organizer || 'BLOODIX'),
      registration_limit: Number(req.body.registration_limit) || 100,
      campaign_status: sanitizeText(req.body.campaign_status || 'Upcoming'),
      created_at: new Date().toISOString()
    };
    db.Campaigns.unshift(c);
    addActivityLog(db, actor.user_id, actor.role, 'CREATE_CAMPAIGN', 'Campaigns', c.campaign_id, c.campaign_title);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Campaigns', 'Activity_Logs']);
    return ok(res, 'নতুন ক্যাম্পেইন তৈরি হয়েছে।', { campaign: c });
  });

  app.post('/api/campaigns/:id/register', async (req: AuthedRequest, res) => {
    const user = requireAuth(req, res);
    if (!user) return;
    const db = getDb();
    const campaign = db.Campaigns.find((c) => !c.deleted_at && c.campaign_id === req.params.id);
    if (!campaign) return fail(res, 404, 'ক্যাম্পেইন পাওয়া যায়নি।', 'NOT_FOUND');
    const exists = db.Campaign_Registrations.some(
      (r) => r.campaign_id === campaign.campaign_id && r.user_id === user.user_id
    );
    if (exists) return fail(res, 409, 'আপনি ইতিমধ্যেই নিবন্ধন করেছেন।', 'DUPLICATE');
    const reg = {
      registration_id: generateId('CRG'),
      campaign_id: campaign.campaign_id,
      user_id: user.user_id,
      participant_type: user.role,
      registration_status: 'Confirmed',
      attendance_status: 'Pending',
      registered_at: new Date().toISOString()
    };
    db.Campaign_Registrations.unshift(reg);
    addNotification(db, user.user_id, 'ক্যাম্পেইনে নিবন্ধন সফল', `${campaign.campaign_title}-এ আপনার আসন নিশ্চিত হয়েছে।`, 'campaign_registered', campaign.campaign_id);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Campaign_Registrations', 'Notifications']);
    return ok(res, 'ক্যাম্পেইনে নিবন্ধন সম্পন্ন হয়েছে।', { registration: reg });
  });

  app.get('/api/blogs', async (_req, res) => {
    const db = getDb();
    await hydrateDbFromGoogleSheet(db);
    return ok(res, 'ব্লগ লোড হয়েছে।', {
      blogs: db.Blogs.filter((b) => !b.deleted_at && b.publish_status === 'Published')
    });
  });

  app.post('/api/blogs', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const title = sanitizeText(req.body.title);
    const thumbImg =
      sanitizeImageAsset(req.body.thumbnail_url) || '/src/assets/images/blog_blood_science_1795424733543.jpg';
    const blog = {
      blog_id: generateId('BLG'),
      title,
      slug: sanitizeText(req.body.slug || `blog-${Date.now()}`),
      category: sanitizeText(req.body.category || 'স্বাস্থ্য সচেতনতা'),
      thumbnail_url: thumbImg,
      content: sanitizeText(req.body.content),
      author_id: admin.user_id,
      publish_status: 'Published',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    db.Blogs.unshift(blog);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Blogs']);
    return ok(res, 'ব্লগ প্রকাশিত হয়েছে।', { blog });
  });

  app.post('/api/contact', async (req, res) => {
    const db = getDb();
    const msg = {
      message_id: generateId('MSG'),
      sender_user_id: sanitizeText(req.body.name || 'অতিথি'),
      receiver_user_id: 'ADMIN',
      request_id: sanitizeText(req.body.email || req.body.phone || ''),
      message_text: `${sanitizeText(req.body.subject || 'সাধারণ বার্তা')}: ${sanitizeText(req.body.message || '')}`,
      read_status: false,
      created_at: new Date().toISOString()
    };
    db.Messages.unshift(msg);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Messages']);
    return ok(res, 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।');
  });

  // ================= NOTIFICATIONS =================
  app.get('/api/notifications', (req: AuthedRequest, res) => {
    const user = requireAuth(req, res);
    if (!user) return;
    const db = getDb();
    return ok(res, 'নোটিফিকেশন লোড হয়েছে।', {
      notifications: db.Notifications.filter((n) => n.user_id === user.user_id)
    });
  });

  app.post('/api/notifications/read-all', async (req: AuthedRequest, res) => {
    const user = requireAuth(req, res);
    if (!user) return;
    const db = getDb();
    db.Notifications.forEach((n) => {
      if (n.user_id === user.user_id) n.is_read = true;
    });
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Notifications']);
    return ok(res, 'সব নোটিফিকেশন পড়া হয়েছে।');
  });

  // ================= REPRESENTATIVE DASHBOARD & AREA ACL =================
  app.get('/api/representative/dashboard', (req: AuthedRequest, res) => {
    const user = requireAuth(req, res, ['representative']);
    if (!user) return;
    const scope = getRepScope(user.user_id);
    if (!scope) return fail(res, 403, 'সক্রিয় প্রতিনিধি প্রোফাইল নেই।', 'FORBIDDEN');
    const db = getDb();

    const donors = db.Donors.filter((d) => isRecordInArea(d, scope.assignments)).map((d) => {
      const u = db.Users.find((usr) => usr.user_id === d.user_id);
      return {
        ...d,
        full_name: u?.full_name || '',
        phone: u?.phone || '',
        email: u?.email || ''
      };
    });
    const requests = db.Blood_Requests.filter((r) => isRecordInArea(r, scope.assignments));
    const tasks = db.Representative_Tasks.filter((t) => t.representative_id === scope.rep.representative_id);
    const reports = db.Representative_Reports.filter((r) => r.representative_id === scope.rep.representative_id);

    return ok(res, 'প্রতিনিধি ড্যাশবোর্ড লোড হয়েছে।', {
      representative: scope.rep,
      assignments: scope.assignments,
      permissions: scope.permissions,
      stats: {
        total_assigned_areas: scope.assignments.length,
        pending_donors: donors.filter((d) => ['Pending Verification', 'Under Review', 'Phone Contacted'].includes(d.verification_status)).length,
        verified_donors: donors.filter((d) => d.verification_status === 'Approved').length,
        pending_requests: requests.filter((r) => r.admin_status === 'Pending').length,
        emergency_requests: requests.filter((r) => r.urgency_level === 'Emergency').length,
        completed_tasks: tasks.filter((t) => t.task_status === 'Completed').length
      },
      donors,
      requests,
      tasks,
      reports
    });
  });

  app.post('/api/representative/verify-donor', async (req: AuthedRequest, res) => {
    const user = requireAuth(req, res, ['representative']);
    if (!user) return;
    const scope = getRepScope(user.user_id);
    if (!scope) return fail(res, 403, 'প্রতিনিধি অ্যাক্সেস নেই।', 'FORBIDDEN');
    const db = getDb();
    const donor = db.Donors.find((d) => d.donor_id === req.body.donor_id);
    if (!donor) return fail(res, 404, 'ডোনার পাওয়া যায়নি।', 'NOT_FOUND');

    // STRICT BACKEND AREA CHECK
    if (!isRecordInArea(donor, scope.assignments)) {
      addSystemLog(db, 'SECURITY', 'representative/verify-donor', 'AREA_FORBIDDEN', `Rep ${user.user_id} tried accessing outside-area donor ${donor.donor_id}`);
      saveDb(db);
      return fail(res, 403, 'নিরাপত্তা নীতি: আপনার নির্ধারিত এলাকার বাইরের ডোনার যাচাই করা নিষিদ্ধ।', 'AREA_FORBIDDEN');
    }

    const canDirectApprove = scope.assignments.some((a) => a.permission_level === 'special_approval');
    let nextStatus = req.body.recommendation === 'reject' ? 'Under Review' : 'Phone Contacted';
    if (canDirectApprove && req.body.recommendation === 'approve') {
      nextStatus = 'Approved';
    }

    const verif = {
      verification_id: generateId('VRF'),
      donor_id: donor.donor_id,
      admin_id: '',
      representative_id: scope.rep.representative_id,
      verification_type: 'representative_phone_check',
      verification_result: sanitizeText(req.body.verification_result || 'ফোনে যোগাযোগ হয়েছে'),
      verification_notes: sanitizeText(req.body.verification_notes || ''),
      verified_phone: Boolean(req.body.verified_phone),
      verified_blood_group: Boolean(req.body.verified_blood_group),
      verification_date: new Date().toISOString(),
      previous_status: donor.verification_status,
      new_status: nextStatus
    };
    db.Verifications.unshift(verif);
    donor.verification_status = nextStatus;
    donor.updated_at = new Date().toISOString();
    addActivityLog(db, user.user_id, 'representative', 'REP_VERIFICATION', 'Verifications', donor.donor_id, `${verif.verification_result} — ${verif.verification_notes}`);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Verifications', 'Donors', 'Activity_Logs']);
    return ok(res, 'যাচাই নোট ও সুপারিশ সংরক্ষিত হয়েছে।', { donor, verification: verif });
  });

  app.post('/api/representative/reports', async (req: AuthedRequest, res) => {
    const user = requireAuth(req, res, ['representative']);
    if (!user) return;
    const scope = getRepScope(user.user_id);
    if (!scope) return fail(res, 403, 'প্রতিনিধি অ্যাক্সেস নেই।', 'FORBIDDEN');
    const db = getDb();
    const report = {
      report_id: generateId('RPT'),
      representative_id: scope.rep.representative_id,
      report_title: sanitizeText(req.body.report_title),
      report_content: sanitizeText(req.body.report_content),
      report_type: sanitizeText(req.body.report_type || 'activity'),
      related_area: sanitizeText(req.body.related_area || ''),
      submitted_at: new Date().toISOString(),
      reviewed_by: '',
      review_status: 'Pending',
      admin_notes: ''
    };
    db.Representative_Reports.unshift(report);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Representative_Reports']);
    return ok(res, 'কার্যক্রমের প্রতিবেদন জমা হয়েছে।', { report });
  });

  app.post('/api/representative/tasks/:id/complete', async (req: AuthedRequest, res) => {
    const user = requireAuth(req, res, ['representative']);
    if (!user) return;
    const scope = getRepScope(user.user_id);
    if (!scope) return fail(res, 403, 'প্রতিনিধি অ্যাক্সেস নেই।', 'FORBIDDEN');
    const db = getDb();
    const task = db.Representative_Tasks.find(
      (t) => t.task_id === req.params.id && t.representative_id === scope.rep.representative_id
    );
    if (!task) return fail(res, 404, 'টাস্ক পাওয়া যায়নি।', 'NOT_FOUND');
    task.task_status = 'Completed';
    task.completed_at = new Date().toISOString();
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Representative_Tasks']);
    return ok(res, 'টাস্ক সম্পন্ন হিসেবে চিহ্নিত হয়েছে।', { task });
  });

  // ================= ADMIN & SUPER ADMIN =================
  app.get('/api/admin/overview', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    await hydrateDbFromGoogleSheet(db);

    const activeDonors = db.Donors.filter((d) => !d.deleted_at);
    const activeRequests = db.Blood_Requests.filter((r) => !r.deleted_at);
    const activeCampaigns = db.Campaigns.filter((c) => !c.deleted_at);
    const activeBlogs = db.Blogs.filter((b) => !b.deleted_at);
    const activePosters = (db.Donor_Posters || [])
      .filter((p) => !p.deleted_at)
      .sort(
        (a, b) =>
          (Number(a.sort_order) || 1) - (Number(b.sort_order) || 1) ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    const bloodGroupDist = BLOOD_GROUPS.map((bg) => ({
      name: bg,
      total: activeDonors.filter((d) => d.blood_group === bg).length,
      approved: activeDonors.filter((d) => d.blood_group === bg && d.verification_status === 'Approved').length
    }));

    const districtMap: Record<string, number> = {};
    activeDonors.forEach((d) => {
      if (d.district) districtMap[d.district] = (districtMap[d.district] || 0) + 1;
    });
    const districtDist = Object.entries(districtMap).map(([district, count]) => ({ district, count }));

    const donors = activeDonors.map((d) => {
      const u = db.Users.find((usr) => usr.user_id === d.user_id);
      const verifs = db.Verifications.filter((v) => v.donor_id === d.donor_id);
      return {
        ...d,
        full_name: u?.full_name || '',
        phone: u?.phone || '',
        email: u?.email || '',
        profile_image: u?.profile_image || '',
        account_status: u?.account_status || 'active',
        verification_logs: verifs
      };
    });

    const reps = db.Representatives.map((r) => ({
      ...r,
      assignments: db.Representative_Assignments.filter(
        (a) => a.representative_id === r.representative_id && a.status === 'active'
      ),
      permissions: db.Representative_Permissions.find((p) => p.representative_id === r.representative_id)
    }));

    return ok(res, 'অ্যাডমিন ওভারভিউ লোড হয়েছে।', {
      stats: {
        total_donors: activeDonors.length,
        approved_donors: activeDonors.filter((d) => d.verification_status === 'Approved').length,
        pending_donors: activeDonors.filter((d) => ['Pending Verification', 'Under Review', 'Phone Contacted'].includes(d.verification_status)).length,
        rejected_donors: activeDonors.filter((d) => d.verification_status === 'Rejected').length,
        total_requests: activeRequests.length,
        emergency_requests: activeRequests.filter((r) => r.urgency_level === 'Emergency').length,
        completed_requests: activeRequests.filter((r) => r.admin_status === 'Completed').length,
        total_donations: db.Donations.length,
        total_campaigns: activeCampaigns.length,
        total_volunteers: db.Volunteers.length,
        total_representatives: db.Representatives.length,
        total_posters: activePosters.length
      },
      analytics: {
        blood_group_distribution: bloodGroupDist,
        district_distribution: districtDist
      },
      donors,
      requests: activeRequests,
      campaigns: activeCampaigns,
      blogs: activeBlogs,
      posters: activePosters,
      messages: db.Messages.slice(0, 100),
      sheet_status: getSheetSyncStatus(db),
      users: db.Users.filter((u) => !u.deleted_at).map(publicUserShape),
      representatives: reps,
      volunteers: db.Volunteers.map((v) => {
        const u = db.Users.find((usr) => usr.user_id === v.user_id);
        return { ...v, full_name: u?.full_name || '', phone: u?.phone || '' };
      }),
      donations: db.Donations.map((don) => {
        const d = db.Donors.find((dn) => dn.donor_id === don.donor_id);
        const du = d ? db.Users.find((u) => u.user_id === d.user_id) : null;
        return { ...don, donor_name: du?.full_name || 'ডোনার' };
      }),
      password_resets: db.Password_Resets,
      settings: db.Settings,
      activity_logs: db.Activity_Logs.slice(0, 100),
      system_logs: db.System_Logs.slice(0, 100),
      rep_reports: db.Representative_Reports
    });
  });

  app.post('/api/admin/donors/:id/verify', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const donor = db.Donors.find((d) => d.donor_id === req.params.id);
    if (!donor) return fail(res, 404, 'ডোনার পাওয়া যায়নি।', 'NOT_FOUND');

    const status = sanitizeText(req.body.status);
    const allowed = [
      'Under Review', 'Phone Contacted', 'Verified', 'Approved',
      'Rejected', 'Correction Required', 'Suspended'
    ];
    if (!allowed.includes(status)) {
      return fail(res, 400, 'অবৈধ স্ট্যাটাস।', 'VALIDATION_ERROR');
    }

    const prev = donor.verification_status;
    donor.verification_status = status;
    donor.updated_at = new Date().toISOString();

    db.Verifications.unshift({
      verification_id: generateId('VRF'),
      donor_id: donor.donor_id,
      admin_id: admin.user_id,
      representative_id: '',
      verification_type: 'admin_verification',
      verification_result: sanitizeText(req.body.verification_result || status),
      verification_notes: sanitizeText(req.body.notes || ''),
      verified_phone: Boolean(req.body.verified_phone ?? true),
      verified_blood_group: Boolean(req.body.verified_blood_group ?? true),
      verification_date: new Date().toISOString(),
      previous_status: prev,
      new_status: status
    });

    const notifTitles: Record<string, [string, string]> = {
      Approved: ['ডোনার প্রোফাইল অনুমোদিত', 'অভিনন্দন! আপনার ডোনার প্রোফাইল অনুমোদিত হয়েছে এবং এখন ডিরেক্টরিতে দৃশ্যমান।'],
      Rejected: ['ডোনার আবেদন প্রত্যাখ্যাত', 'দুঃখিত, যাচাইয়ের পর আপনার আবেদনটি অনুমোদিত হয়নি।'],
      'Correction Required': ['প্রোফাইল সংশোধন প্রয়োজন', `অ্যাডমিন নোট: ${sanitizeText(req.body.notes || 'তথ্য পুনরায় যাচাই করুন।')}`],
      Suspended: ['ডোনার প্রোফাইল স্থগিত', 'প্রশাসনিক কারণে আপনার ডোনার প্রোফাইল স্থগিত করা হয়েছে।']
    };
    if (notifTitles[status]) {
      addNotification(db, donor.user_id, notifTitles[status][0], notifTitles[status][1], `donor_${status.toLowerCase()}`, donor.donor_id);
    }

    addActivityLog(db, admin.user_id, admin.role, 'VERIFY_DONOR', 'Donors', donor.donor_id, `${prev} -> ${status}`);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Donors', 'Verifications', 'Notifications', 'Activity_Logs']);
    return ok(res, `ডোনার স্ট্যাটাস "${status}" হিসেবে সংরক্ষিত হয়েছে।`, { donor });
  });

  app.post('/api/admin/users/:id', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const target = db.Users.find((u) => u.user_id === req.params.id);
    if (!target) return fail(res, 404, 'ব্যবহারকারী পাওয়া যায়নি।', 'NOT_FOUND');

    if (req.body.role && req.body.role !== target.role) {
      if (admin.role !== 'super_admin' && ['admin', 'super_admin'].includes(req.body.role)) {
        return fail(res, 403, 'শুধুমাত্র সুপার অ্যাডমিন অ্যাডমিন রোল প্রদান করতে পারবেন।', 'FORBIDDEN');
      }
      target.role = req.body.role;
    }
    if (req.body.account_status) target.account_status = req.body.account_status;
    target.updated_at = new Date().toISOString();
    addActivityLog(db, admin.user_id, admin.role, 'UPDATE_USER', 'Users', target.user_id, `রোল/অবস্থা হালনাগাদ`);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Users', 'Activity_Logs']);
    return ok(res, 'ব্যবহারকারীর তথ্য হালনাগাদ হয়েছে।', { user: publicUserShape(target) });
  });

  app.post('/api/admin/password-reset/complete', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const resetReq = db.Password_Resets.find((p) => p.reset_id === req.body.reset_id);
    if (!resetReq) return fail(res, 404, 'রিসেট আবেদন পাওয়া যায়নি।', 'NOT_FOUND');
    const tempPassword = String(req.body.temporary_password || '');
    if (tempPassword.length < 6) return fail(res, 400, 'অস্থায়ী পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', 'VALIDATION_ERROR');

    const ident = resetReq.identifier.toLowerCase();
    const target = db.Users.find((u) => u.email === ident || u.phone === normalizePhone(ident));
    if (!target) return fail(res, 404, 'সংশ্লিষ্ট ব্যবহারকারী খুঁজে পাওয়া যায়নি।', 'USER_NOT_FOUND');

    const salt = generateSalt();
    target.password_salt = salt;
    target.password_hash = hashPassword(tempPassword, salt);
    target.updated_at = new Date().toISOString();
    resetReq.user_id = target.user_id;
    resetReq.status = 'Completed';
    resetReq.resolved_by = admin.user_id;
    resetReq.resolved_at = new Date().toISOString();
    addActivityLog(db, admin.user_id, admin.role, 'ADMIN_PASSWORD_RESET', 'Auth', target.user_id, 'অ্যাডমিন সহায়তায় পাসওয়ার্ড রিসেট');
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Users', 'Password_Resets', 'Activity_Logs']);
    return ok(res, 'ব্যবহারকারীর পাসওয়ার্ড রিসেট সম্পন্ন হয়েছে।');
  });

  app.post('/api/admin/representatives', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const targetUser = db.Users.find((u) => u.user_id === req.body.user_id);
    if (!targetUser) return fail(res, 404, 'ব্যবহারকারী পাওয়া যায়নি।', 'NOT_FOUND');

    let rep = db.Representatives.find((r) => r.user_id === targetUser.user_id);
    const ts = new Date().toISOString();
    if (!rep) {
      const repId = generateId('REP');
      rep = {
        representative_id: repId,
        user_id: targetUser.user_id,
        representative_code: 'RB-REP-' + repId.slice(-5),
        full_name: targetUser.full_name,
        phone: targetUser.phone,
        email: targetUser.email,
        profile_image: targetUser.profile_image,
        appointment_date: ts,
        status: 'active',
        assigned_by: admin.user_id,
        created_at: ts,
        updated_at: ts
      };
      db.Representatives.push(rep);
      db.Representative_Permissions.push({
        permission_id: generateId('PRM'),
        representative_id: repId,
        can_view_donors: true,
        can_verify_donors: true,
        can_recommend_approval: true,
        can_recommend_rejection: true,
        can_view_requests: true,
        can_manage_local_requests: true,
        can_manage_campaigns: false,
        can_view_reports: true,
        granted_by: admin.user_id,
        updated_at: ts
      });
    } else {
      rep.status = 'active';
      rep.updated_at = ts;
    }
    targetUser.role = 'representative';
    addNotification(db, targetUser.user_id, 'এলাকা প্রতিনিধি নিয়োগ', 'আপনাকে BLOODIX-এর এলাকা প্রতিনিধি হিসেবে নিয়োগ দেওয়া হয়েছে।', 'representative_assigned', rep.representative_id);
    addActivityLog(db, admin.user_id, admin.role, 'CREATE_REPRESENTATIVE', 'Representatives', rep.representative_id, `${targetUser.full_name} প্রতিনিধি নিয়োগ`);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Representatives', 'Representative_Permissions', 'Users', 'Notifications', 'Activity_Logs']);
    return ok(res, 'প্রতিনিধি নিয়োগ সম্পন্ন হয়েছে।', { representative: rep });
  });

  app.post('/api/admin/representatives/:id/assign-area', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const rep = db.Representatives.find((r) => r.representative_id === req.params.id);
    if (!rep) return fail(res, 404, 'প্রতিনিধি পাওয়া যায়নি।', 'NOT_FOUND');

    const assignment = {
      assignment_id: generateId('ASN'),
      representative_id: rep.representative_id,
      assignment_level: sanitizeText(req.body.assignment_level || 'district'),
      division: sanitizeText(req.body.division || ''),
      district: sanitizeText(req.body.district || ''),
      upazila: sanitizeText(req.body.upazila || ''),
      union_name: sanitizeText(req.body.union_name || ''),
      ward_name: sanitizeText(req.body.ward_name || ''),
      area: sanitizeText(req.body.area || ''),
      assigned_by: admin.user_id,
      assigned_at: new Date().toISOString(),
      status: 'active',
      permission_level:
        admin.role === 'super_admin' && req.body.permission_level === 'special_approval'
          ? 'special_approval'
          : 'standard',
      notes: sanitizeText(req.body.notes || '')
    };
    db.Representative_Assignments.push(assignment);
    addActivityLog(db, admin.user_id, admin.role, 'ASSIGN_REP_AREA', 'Representative_Assignments', assignment.assignment_id, `${rep.full_name} — ${assignment.district || assignment.division}`);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Representative_Assignments', 'Activity_Logs']);
    return ok(res, 'এলাকা বরাদ্দ সফলভাবে যুক্ত হয়েছে।', { assignment });
  });

  app.post('/api/admin/representatives/assignments/:assignmentId/remove', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const asn = db.Representative_Assignments.find((a) => a.assignment_id === req.params.assignmentId);
    if (!asn) return fail(res, 404, 'বরাদ্দ পাওয়া যায়নি।', 'NOT_FOUND');
    asn.status = 'removed';
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Representative_Assignments']);
    return ok(res, 'এলাকা বরাদ্দ অপসারণ করা হয়েছে।');
  });

  app.post('/api/admin/representatives/:id/permissions', async (req: AuthedRequest, res) => {
    const superAdmin = requireAuth(req, res, ['super_admin']);
    if (!superAdmin) return;
    const db = getDb();
    const perm = db.Representative_Permissions.find((p) => p.representative_id === req.params.id);
    if (!perm) return fail(res, 404, 'অনুমতি রেকর্ড পাওয়া যায়নি।', 'NOT_FOUND');
    Object.assign(perm, {
      can_view_donors: Boolean(req.body.can_view_donors),
      can_verify_donors: Boolean(req.body.can_verify_donors),
      can_recommend_approval: Boolean(req.body.can_recommend_approval),
      can_recommend_rejection: Boolean(req.body.can_recommend_rejection),
      can_view_requests: Boolean(req.body.can_view_requests),
      can_manage_local_requests: Boolean(req.body.can_manage_local_requests),
      can_manage_campaigns: Boolean(req.body.can_manage_campaigns),
      can_view_reports: Boolean(req.body.can_view_reports),
      granted_by: superAdmin.user_id,
      updated_at: new Date().toISOString()
    });
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Representative_Permissions']);
    return ok(res, 'প্রতিনিধির অনুমতি হালনাগাদ হয়েছে।', { permissions: perm });
  });

  app.post('/api/admin/representatives/:id/task', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const rep = db.Representatives.find((r) => r.representative_id === req.params.id);
    if (!rep) return fail(res, 404, 'প্রতিনিধি পাওয়া যায়নি।', 'NOT_FOUND');
    const task = {
      task_id: generateId('TSK'),
      representative_id: rep.representative_id,
      task_type: sanitizeText(req.body.task_type || 'donor_verification'),
      reference_id: sanitizeText(req.body.reference_id || ''),
      title: sanitizeText(req.body.title),
      description: sanitizeText(req.body.description || ''),
      priority: sanitizeText(req.body.priority || 'High'),
      task_status: 'Pending',
      assigned_by: admin.user_id,
      assigned_at: new Date().toISOString(),
      due_date: sanitizeText(req.body.due_date || ''),
      completed_at: '',
      notes: ''
    };
    db.Representative_Tasks.unshift(task);
    addNotification(db, rep.user_id, 'নতুন টাস্ক নির্ধারিত হয়েছে', task.title, 'new_task_assigned', task.task_id);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Representative_Tasks', 'Notifications']);
    return ok(res, 'টাস্ক পাঠানো হয়েছে।', { task });
  });

  app.post('/api/admin/volunteers/:id/status', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const vol = db.Volunteers.find((v) => v.volunteer_id === req.params.id);
    if (!vol) return fail(res, 404, 'স্বেচ্ছাসেবক পাওয়া যায়নি।', 'NOT_FOUND');
    vol.approval_status = sanitizeText(req.body.approval_status || 'Approved');
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Volunteers']);
    return ok(res, 'স্বেচ্ছাসেবক স্ট্যাটাস হালনাগাদ হয়েছে।', { volunteer: vol });
  });

  // ================= ADMIN POSTERS & FULL WEBSITE CONTROL =================
  app.get('/api/admin/posters', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const posters = (db.Donor_Posters || [])
      .filter((p) => !p.deleted_at)
      .sort(
        (a, b) =>
          (Number(a.sort_order) || 1) - (Number(b.sort_order) || 1) ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    return ok(res, 'পোস্টার তালিকা লোড হয়েছে।', { posters });
  });

  app.post('/api/admin/posters', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const imageUrl = sanitizeImageAsset(req.body.image_url, 450000);
    if (!imageUrl) {
      return fail(res, 400, 'অনুগ্রহ করে পোস্টারের সঠিক ছবি আপলোড করুন অথবা ছবির URL দিন।', 'VALIDATION_ERROR');
    }
    const db = getDb();
    if (!Array.isArray(db.Donor_Posters)) db.Donor_Posters = [];

    const title = sanitizeText(req.body.title || 'সফল রক্তদান সম্মাননা');
    const bgRaw = sanitizeText(req.body.blood_group || '').toUpperCase();
    const bloodGroup = BLOOD_GROUPS.includes(bgRaw) ? bgRaw : '';
    const poster = {
      poster_id: generateId('PST'),
      title,
      subtitle: sanitizeText(req.body.subtitle || ''),
      blood_group: bloodGroup,
      image_url: imageUrl,
      sort_order: Math.max(1, Number(req.body.sort_order) || db.Donor_Posters.filter((p) => !p.deleted_at).length + 1),
      is_active: req.body.is_active !== false,
      created_by: admin.user_id,
      created_at: new Date().toISOString(),
      deleted_at: ''
    };

    db.Donor_Posters.unshift(poster);
    addActivityLog(db, admin.user_id, admin.role, 'CREATE_POSTER', 'Donor_Posters', poster.poster_id, `পোস্টার যুক্ত: ${poster.title}`);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Donor_Posters', 'Activity_Logs']);
    return ok(res, 'সম্মাননা পোস্টার সফলভাবে সেভ ও স্লাইডারে যুক্ত হয়েছে।', { poster });
  });

  app.post('/api/admin/posters/:id/toggle', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const poster = (db.Donor_Posters || []).find((p) => !p.deleted_at && p.poster_id === req.params.id);
    if (!poster) return fail(res, 404, 'পোস্টার খুঁজে পাওয়া যায়নি।', 'NOT_FOUND');
    poster.is_active = !Boolean(poster.is_active);
    addActivityLog(db, admin.user_id, admin.role, 'TOGGLE_POSTER', 'Donor_Posters', poster.poster_id, `${poster.is_active ? 'সক্রিয়' : 'গোপন'}: ${poster.title}`);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Donor_Posters', 'Activity_Logs']);
    return ok(res, poster.is_active ? 'পোস্টারটি স্লাইডারে প্রদর্শিত হচ্ছে।' : 'পোস্টারটি সাময়িকভাবে লুকানো হয়েছে।', { poster });
  });

  const handleDeletePoster = async (req: AuthedRequest, res: Response) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const poster = (db.Donor_Posters || []).find((p) => !p.deleted_at && p.poster_id === req.params.id);
    if (!poster) return fail(res, 404, 'পোস্টার খুঁজে পাওয়া যায়নি।', 'NOT_FOUND');
    poster.deleted_at = new Date().toISOString();
    poster.is_active = false;
    addActivityLog(db, admin.user_id, admin.role, 'DELETE_POSTER', 'Donor_Posters', poster.poster_id, `পোস্টার মুছে ফেলা হয়েছে: ${poster.title}`);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Donor_Posters', 'Activity_Logs']);
    return ok(res, 'পোস্টার সফলভাবে মুছে ফেলা হয়েছে।');
  };

  app.delete('/api/admin/posters/:id', handleDeletePoster);
  app.post('/api/admin/posters/:id/delete', handleDeletePoster);

  app.post('/api/admin/campaigns/:id/delete', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const item = db.Campaigns.find((c) => !c.deleted_at && c.campaign_id === req.params.id);
    if (!item) return fail(res, 404, 'ক্যাম্পেইন পাওয়া যায়নি।', 'NOT_FOUND');
    item.deleted_at = new Date().toISOString();
    item.campaign_status = 'Cancelled';
    addActivityLog(db, admin.user_id, admin.role, 'DELETE_CAMPAIGN', 'Campaigns', item.campaign_id, item.campaign_title);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Campaigns', 'Activity_Logs']);
    return ok(res, 'ক্যাম্পেইন মুছে ফেলা হয়েছে।');
  });

  app.post('/api/admin/blogs/:id/delete', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const item = db.Blogs.find((b) => !b.deleted_at && b.blog_id === req.params.id);
    if (!item) return fail(res, 404, 'ব্লগ পাওয়া যায়নি।', 'NOT_FOUND');
    item.deleted_at = new Date().toISOString();
    item.publish_status = 'Draft';
    addActivityLog(db, admin.user_id, admin.role, 'DELETE_BLOG', 'Blogs', item.blog_id, item.title);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Blogs', 'Activity_Logs']);
    return ok(res, 'ব্লগ মুছে ফেলা হয়েছে।');
  });

  app.post('/api/admin/requests/:id/delete', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const item = db.Blood_Requests.find((r) => !r.deleted_at && r.request_id === req.params.id);
    if (!item) return fail(res, 404, 'অনুরোধ পাওয়া যায়নি।', 'NOT_FOUND');
    item.deleted_at = new Date().toISOString();
    item.admin_status = 'Cancelled';
    addActivityLog(db, admin.user_id, admin.role, 'DELETE_REQUEST', 'Blood_Requests', item.request_id, item.patient_name);
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Blood_Requests', 'Activity_Logs']);
    return ok(res, 'রক্তের অনুরোধ মুছে ফেলা হয়েছে।');
  });

  app.post('/api/admin/donors/:id/delete', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const donor = db.Donors.find((d) => !d.deleted_at && d.donor_id === req.params.id);
    if (!donor) return fail(res, 404, 'ডোনার পাওয়া যায়নি।', 'NOT_FOUND');
    donor.deleted_at = new Date().toISOString();
    donor.verification_status = 'Suspended';
    addActivityLog(db, admin.user_id, admin.role, 'DELETE_DONOR', 'Donors', donor.donor_id, 'ডোনার তালিকা থেকে সরানো হয়েছে');
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Donors', 'Activity_Logs']);
    return ok(res, 'ডোনার প্রোফাইল ডিরেক্টরি থেকে মুছে ফেলা হয়েছে।');
  });

  app.post('/api/admin/settings', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const updates = req.body.settings || {};
    const ts = new Date().toISOString();

    Object.entries(updates).forEach(([k, v]) => {
      let cleanVal = '';
      if (k === 'site_logo') {
        cleanVal =
          sanitizeImageAsset(v, 350000) || '/assets/aistudio/image-removebg-preview__1__4794faaf.png';
      } else {
        cleanVal = sanitizeText(v);
      }
      const existing = db.Settings.find((s) => s.setting_key === k);
      if (existing) {
        existing.setting_value = cleanVal;
        existing.updated_by = admin.user_id;
        existing.updated_at = ts;
      } else {
        db.Settings.push({
          setting_key: sanitizeText(k),
          setting_value: cleanVal,
          setting_group: k === 'maintenance_mode' ? 'system' : 'general',
          description: sanitizeText(k),
          updated_by: admin.user_id,
          updated_at: ts
        });
      }
    });

    addActivityLog(db, admin.user_id, admin.role, 'UPDATE_SETTINGS', 'Settings', 'website', 'ওয়েবসাইট সেটিংস পরিবর্তন');
    saveDb(db);
    await pushTablesToGoogleSheet(db, ['Settings', 'Activity_Logs']);
    return ok(res, 'ওয়েবসাইটের সকল সেটিংস সফলভাবে সংরক্ষিত হয়েছে।');
  });

  app.get('/api/admin/sheet-status', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const health = await checkGasHealth(db);
    return ok(res, 'Google Sheet সংযোগ স্ট্যাটাস লোড হয়েছে।', {
      ...getSheetSyncStatus(db),
      ...health
    });
  });

  app.post('/api/admin/sheet-sync', async (req: AuthedRequest, res) => {
    const admin = requireAuth(req, res, ['admin', 'super_admin']);
    if (!admin) return;
    const db = getDb();
    const pulled = await hydrateDbFromGoogleSheet(db, true);
    const pushed = await pushTablesToGoogleSheet(db, [
      'Users',
      'Donors',
      'Donor_Posters',
      'Recipients',
      'Volunteers',
      'Blood_Requests',
      'Donations',
      'Verifications',
      'Campaigns',
      'Campaign_Registrations',
      'Contact_Requests',
      'Notifications',
      'Messages',
      'Blogs',
      'Admins',
      'Settings',
      'Representatives',
      'Representative_Assignments',
      'Representative_Tasks',
      'Representative_Reports',
      'Representative_Permissions',
      'Password_Resets',
      'Activity_Logs'
    ]);
    return ok(res, pulled || pushed ? 'Google Sheet সিঙ্ক সম্পন্ন হয়েছে।' : 'Google Sheet-এর সাথে সংযোগ পাওয়া যায়নি।', {
      pulled,
      pushed,
      status: getSheetSyncStatus(db)
    });
  });

  app.get('/api/super-admin/backup', (req: AuthedRequest, res) => {
    const superAdmin = requireAuth(req, res, ['super_admin']);
    if (!superAdmin) return;
    const db = getDb();
    const safeBackup = {
      ...db,
      Users: db.Users.map(publicUserShape),
      Sessions: []
    };
    return ok(res, 'ডাটাবেজ ব্যাকআপ প্রস্তুত।', { backup: safeBackup });
  });

  // ================= VITE / STATIC SERVING =================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build not found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BLOODIX server listening on http://0.0.0.0:${PORT}`);
    hydrateDbFromGoogleSheet(getDb()).catch(() => {});
  });
}

startServer();
