import fs from 'fs';
import path from 'path';
import { generateId } from './security';

export interface StoredUser {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
  password_salt: string;
  role: 'user' | 'donor' | 'recipient' | 'volunteer' | 'representative' | 'admin' | 'super_admin';
  account_status: 'active' | 'suspended' | 'inactive';
  email_verified: boolean;
  phone_verified: boolean;
  profile_image: string;
  created_at: string;
  updated_at: string;
  last_login: string;
  deleted_at: string;
}

export interface StoredSession {
  session_id: string;
  user_id: string;
  token_hash: string;
  role: string;
  expires_at: string;
  revoked: boolean;
  created_at: string;
}

export interface DatabaseSchema {
  Users: StoredUser[];
  Donors: any[];
  Recipients: any[];
  Blood_Requests: any[];
  Donations: any[];
  Verifications: any[];
  Volunteers: any[];
  Campaigns: any[];
  Campaign_Registrations: any[];
  Contact_Requests: any[];
  Notifications: any[];
  Messages: any[];
  Locations: any[];
  Blogs: any[];
  Admins: any[];
  Activity_Logs: any[];
  Settings: any[];
  System_Logs: any[];
  Representatives: any[];
  Representative_Assignments: any[];
  Representative_Tasks: any[];
  Representative_Reports: any[];
  Representative_Permissions: any[];
  Sessions: StoredSession[];
  Password_Resets: any[];
  Donor_Posters: any[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'roktobondhon_db.json');

function nowDhaka(): string {
  return new Date().toISOString();
}

function createInitialDatabase(): DatabaseSchema {
  const ts = nowDhaka();
  return {
    Users: [],
    Donors: [], // Strict requirement: Never auto-seed fake donors
    Recipients: [],
    Blood_Requests: [],
    Donations: [],
    Verifications: [],
    Volunteers: [],
    Campaigns: [
      {
        campaign_id: 'CMP_INIT_01',
        campaign_title: 'ঢাকা মেডিকেল কলেজ স্বেচ্ছাসেবী রক্তদান ক্যাম্পেইন ২০২৬',
        campaign_description: 'নিরাপদ রক্ত সঞ্চালন নিশ্চিত করতে ও থ্যালাসেমিয়া রোগীদের সহায়তায় আমাদের বিশেষ এক দিনের স্বেচ্ছাসেবী রক্তদান কর্মসূচি।',
        banner_url: '/src/assets/images/campaign_community_drive_1795424733186.jpg',
        event_date: '2026-12-10',
        start_time: '09:00',
        end_time: '16:00',
        venue: 'কেন্দ্রীয় মিলনায়তন, ঢাকা মেডিকেল কলেজ এলাকা',
        division: 'ঢাকা',
        district: 'ঢাকা',
        upazila: 'ধানমন্ডি',
        organizer: 'BLOODIX কেন্দ্রীয় কমিটি',
        registration_limit: 200,
        campaign_status: 'Upcoming',
        created_at: ts
      },
      {
        campaign_id: 'CMP_INIT_02',
        campaign_title: 'চট্টগ্রাম বিভাগীয় জরুরি রক্তদাতা নিবন্ধন ও গ্রুপিং ক্যাম্প',
        campaign_description: 'বিনামূল্যে রক্তের গ্রুপ নির্ণয়, নতুন ডোনার নিবন্ধন ও সচেতনতামূলক সেমিনার।',
        banner_url: '/src/assets/images/hero_blood_donation_1795424733544.jpg',
        event_date: '2026-12-18',
        start_time: '10:00',
        end_time: '17:00',
        venue: 'চট্টগ্রাম জেলা শিল্পকলা একাডেমি প্রাঙ্গণ',
        division: 'চট্টগ্রাম',
        district: 'চট্টগ্রাম',
        upazila: 'চট্টগ্রাম সদর',
        organizer: 'BLOODIX চট্টগ্রাম টিম',
        registration_limit: 150,
        campaign_status: 'Upcoming',
        created_at: ts
      }
    ],
    Campaign_Registrations: [],
    Contact_Requests: [],
    Notifications: [],
    Messages: [],
    Locations: [
      { location_id: 'LOC_1', division_name: 'ঢাকা', district_name: 'ঢাকা', upazila_name: 'ধানমন্ডি', union_name: '', ward_name: '', is_active: true, sort_order: 1 },
      { location_id: 'LOC_2', division_name: 'চট্টগ্রাম', district_name: 'চট্টগ্রাম', upazila_name: 'হাটহাজারী', union_name: '', ward_name: '', is_active: true, sort_order: 2 },
      { location_id: 'LOC_3', division_name: 'রাজশাহী', district_name: 'রাজশাহী', upazila_name: 'বোয়ালিয়া', union_name: '', ward_name: '', is_active: true, sort_order: 3 },
      { location_id: 'LOC_4', division_name: 'সিলেট', district_name: 'সিলেট', upazila_name: 'সিলেট সদর', union_name: '', ward_name: '', is_active: true, sort_order: 4 }
    ],
    Blogs: [
      {
        blog_id: 'BLG_01',
        title: 'রক্তদান কেন জরুরি? শরীরের ওপর এর বৈজ্ঞানিক উপকারিতা',
        slug: 'why-blood-donation-matters',
        category: 'স্বাস্থ্য সচেতনতা',
        thumbnail_url: '/src/assets/images/blog_blood_science_1795424733543.jpg',
        content: 'একজন সুস্থ প্রাপ্তবয়স্ক মানুষ প্রতি ৪ মাস (১২০ দিন) পরপর নিরাপদে রক্তদান করতে পারেন। এক ব্যাগ রক্ত থেকে লোহিত রক্তকণিকা, প্লাজমা এবং প্লাটিলেট আলাদা করে সর্বোচ্চ তিনজন মুমূর্ষু রোগীর জীবন বাঁচানো সম্ভব।\n\nনিয়মিত রক্তদান শরীরের অতিরিক্ত আয়রনের ভারসাম্য বজায় রাখে, হৃদরোগের ঝুঁকি কমাতে সহায়তা করে এবং অস্থিমজ্জায় নতুন রক্তকণিকা তৈরিতে উদ্দীপনা জোগায়। রক্তদানের আগে রক্তচাপ, হিমোগ্লোবিন এবং ওজন পরীক্ষা করা হয় বলে রক্তদাতা নিজেও নিজের স্বাস্থ্য সম্পর্কে অবগত থাকতে পারেন।',
        author_id: 'SYSTEM',
        publish_status: 'Published',
        published_at: ts,
        created_at: ts
      },
      {
        blog_id: 'BLG_02',
        title: 'রক্তদানের আগে ও পরে কী করবেন: সম্পূর্ণ নির্দেশিকা',
        slug: 'before-and-after-blood-donation',
        category: 'প্রস্তুতি ও যত্ন',
        thumbnail_url: '/src/assets/images/hero_blood_donation_1795424733544.jpg',
        content: 'রক্তদানের পূর্বে পর্যাপ্ত বিশ্রাম এবং সুষম খাবার গ্রহণ অত্যন্ত গুরুত্বপূর্ণ। রক্তদানের কমপক্ষে ২-৩ ঘণ্টা আগে হালকা পুষ্টিকর খাবার খান এবং প্রচুর বিশুদ্ধ পানি পান করুন।\n\nরক্তদানের পর অন্তত ১৫-২০ মিনিট বিশ্রাম নিন, তরল পানীয় ও ফলের রস পান করুন এবং পরবর্তী ২৪ ঘণ্টা ভারী ব্যায়াম বা ধূমপান এড়িয়ে চলুন। সূঁচ ফোটানোর স্থানে ব্যান্ডেজ অন্তত ৪-৫ ঘণ্টা রাখুন।',
        author_id: 'SYSTEM',
        publish_status: 'Published',
        published_at: ts,
        created_at: ts
      },
      {
        blog_id: 'BLG_03',
        title: 'রক্তের গ্রুপ ও Rh ফ্যাক্টর বোঝার সহজ উপায়',
        slug: 'understanding-blood-groups-and-rh',
        category: 'রক্তের বিজ্ঞান',
        thumbnail_url: '/src/assets/images/about_humanity_care_1795424733401.jpg',
        content: 'মানুষের রক্তে ABO এবং Rh (রিসাস) পদ্ধতিতে মোট ৮টি প্রধান গ্রুপ রয়েছে: A+, A-, B+, B-, AB+, AB-, O+ এবং O-। জরুরি অবস্থায় সঠিক গ্রুপের রক্ত ও ক্রস-ম্যাচিং ছাড়া রক্ত সঞ্চালন মারাত্মক জটিলতা সৃষ্টি করতে পারে।\n\nO- গ্রুপের লোহিত রক্তকণিকা জরুরি অবস্থায় সব গ্রুপের রোগীকে দেওয়া যায়, তাই একে সর্বজনীন দাতা বলা হয়। অন্যদিকে AB+ গ্রুপের মানুষ যেকোনো গ্রুপের রক্ত গ্রহণ করতে পারেন।',
        author_id: 'SYSTEM',
        publish_status: 'Published',
        published_at: ts,
        created_at: ts
      }
    ],
    Admins: [],
    Activity_Logs: [],
    Settings: [
      { setting_key: 'site_name', setting_value: 'BLOODIX', setting_group: 'general', description: 'ওয়েবসাইটের নাম', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'site_tagline', setting_value: 'Donate Blood • Save Lives', setting_group: 'general', description: 'প্রধান স্লোগান', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'site_logo', setting_value: '/assets/aistudio/image-removebg-preview__1__4794faaf.png', setting_group: 'general', description: 'ওয়েবসাইট লোগো', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'contact_email', setting_value: 'support@bloodix.org', setting_group: 'general', description: 'যোগাযোগের ইমেইল', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'contact_phone', setting_value: '01700-000000', setting_group: 'general', description: 'জরুরি হেল্পলাইন', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'contact_address', setting_value: 'ঢাকা, বাংলাদেশ', setting_group: 'general', description: 'অফিসের ঠিকানা', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'hero_title', setting_value: 'রক্তের অভাবে যেন থেমে না যায় কোনো প্রাণ', setting_group: 'homepage', description: 'হোমপেজ হিরো শিরোনাম', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'hero_subtitle', setting_value: 'আপনার এক ব্যাগ রক্ত বাঁচাতে পারে একটি জীবন। রক্তদাতা খুঁজুন, রক্তদান করুন, মানুষের পাশে দাঁড়ান।', setting_group: 'homepage', description: 'হোমপেজ হিরো বিবরণ', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'poster_slider_title', setting_value: 'সফল রক্তদাতাদের সম্মাননা পোস্টার', setting_group: 'homepage', description: 'পোস্টার স্লাইডার শিরোনাম', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'show_poster_slider', setting_value: 'true', setting_group: 'homepage', description: 'হোমপেজে পোস্টার স্লাইডার চালু', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'registration_enabled', setting_value: 'true', setting_group: 'registration', description: 'ব্যবহারকারী নিবন্ধন চালু', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'donor_manual_approval', setting_value: 'true', setting_group: 'donor', description: 'অ্যাডমিন অনুমোদন বাধ্যতামূলক', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'phone_public_default', setting_value: 'false', setting_group: 'donor', description: 'ডিফল্ট ফোন প্রাইভেসি', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'request_approval_required', setting_value: 'true', setting_group: 'request', description: 'অনুরোধ অনুমোদন বাধ্যতামূলক', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'multiple_rep_per_area', setting_value: 'true', setting_group: 'representative', description: 'একই এলাকায় একাধিক প্রতিনিধি অনুমোদিত', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'session_ttl_hours', setting_value: '24', setting_group: 'security', description: 'সেশন মেয়াদ (ঘণ্টা)', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'login_rate_limit', setting_value: '5', setting_group: 'security', description: 'সর্বোচ্চ ব্যর্থ লগইন চেষ্টা', updated_by: 'SYSTEM', updated_at: ts },
      { setting_key: 'maintenance_mode', setting_value: 'false', setting_group: 'system', description: 'মেইনটেন্যান্স মোড', updated_by: 'SYSTEM', updated_at: ts }
    ],
    System_Logs: [],
    Representatives: [],
    Representative_Assignments: [],
    Representative_Tasks: [],
    Representative_Reports: [],
    Representative_Permissions: [],
    Sessions: [],
    Password_Resets: [],
    Donor_Posters: []
  };
}

let cachedDb: DatabaseSchema | null = null;

function ensureBrandAndSettings(db: DatabaseSchema, base: DatabaseSchema): boolean {
  let dirty = false;
  if (!Array.isArray(db.Donor_Posters)) {
    db.Donor_Posters = [];
    dirty = true;
  }
  const siteNameItem = db.Settings.find((s) => s.setting_key === 'site_name');
  if (siteNameItem && siteNameItem.setting_value === 'রক্তবন্ধন (RoktoBondhon)') {
    siteNameItem.setting_value = 'BLOODIX';
    dirty = true;
  }
  const taglineItem = db.Settings.find((s) => s.setting_key === 'site_tagline');
  if (taglineItem && taglineItem.setting_value === 'রক্তের অভাবে যেন থেমে না যায় কোনো প্রাণ') {
    taglineItem.setting_value = 'Donate Blood • Save Lives';
    dirty = true;
  }
  const emailItem = db.Settings.find((s) => s.setting_key === 'contact_email');
  if (emailItem && emailItem.setting_value === 'support@roktobondhon.org') {
    emailItem.setting_value = 'support@bloodix.org';
    dirty = true;
  }
  base.Settings.forEach((def) => {
    if (!db.Settings.some((s) => s.setting_key === def.setting_key)) {
      db.Settings.push(def);
      dirty = true;
    }
  });
  return dirty;
}

export function getDb(): DatabaseSchema {
  if (cachedDb) return cachedDb;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    cachedDb = createInitialDatabase();
    saveDb(cachedDb);
    return cachedDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const base = createInitialDatabase();
    cachedDb = { ...base, ...parsed };
    if (ensureBrandAndSettings(cachedDb!, base)) {
      saveDb(cachedDb!);
    }
    return cachedDb!;
  } catch {
    cachedDb = createInitialDatabase();
    saveDb(cachedDb);
    return cachedDb;
  }
}

export function saveDb(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
  cachedDb = db;
}

export function addNotification(
  db: DatabaseSchema,
  userId: string,
  title: string,
  message: string,
  notificationType: string,
  referenceId = ''
): void {
  db.Notifications.unshift({
    notification_id: generateId('NTF'),
    user_id: userId,
    title,
    message,
    notification_type: notificationType,
    reference_id: referenceId,
    is_read: false,
    created_at: nowDhaka()
  });
}

export function addActivityLog(
  db: DatabaseSchema,
  actorId: string,
  actorRole: string,
  action: string,
  moduleName: string,
  recordId: string,
  description: string
): void {
  db.Activity_Logs.unshift({
    log_id: generateId('LOG'),
    actor_id: actorId,
    actor_role: actorRole,
    action,
    module: moduleName,
    record_id: recordId,
    description,
    timestamp: nowDhaka()
  });
}

export function addSystemLog(
  db: DatabaseSchema,
  eventType: string,
  apiAction: string,
  errorCode: string,
  errorMessage: string,
  requestId = ''
): void {
  db.System_Logs.unshift({
    system_log_id: generateId('SYS'),
    event_type: eventType,
    api_action: apiAction,
    error_code: errorCode,
    error_message: errorMessage,
    timestamp: nowDhaka(),
    request_id: requestId
  });
}
