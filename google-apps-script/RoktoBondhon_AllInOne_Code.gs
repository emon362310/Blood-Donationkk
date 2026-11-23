// ===== Config.gs =====
/**
 * Config.gs — RoktoBondhon Global Configuration & 23+ Sheet Schemas
 */
const RB_CONFIG = {
  SPREADSHEET_NAME: 'RoktoBondhon_Database',
  PROP_SPREADSHEET_ID: 'ROKTOBONDHON_SPREADSHEET_ID',
  PROP_SUPER_ADMIN_EMAIL: 'ADMIN_INIT_EMAIL',
  PROP_SUPER_ADMIN_PHONE: 'ADMIN_INIT_PHONE',
  PROP_SUPER_ADMIN_PASS: 'ADMIN_INIT_PASSWORD',
  SESSION_TTL_HOURS: 24,
  SESSION_REMEMBER_HOURS: 168,
  PBKDF2_ITERATIONS: 10000,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 15,
  HEADER_BG_COLOR: '#B5122A',
  HEADER_TEXT_COLOR: '#FFFFFF',
  DATE_FORMAT: 'yyyy-MM-dd HH:mm:ss',
  BLOOD_GROUPS: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
};

const RB_SHEETS = {
  Users: [
    'user_id', 'full_name', 'email', 'phone', 'password_hash', 'password_salt',
    'role', 'account_status', 'email_verified', 'phone_verified', 'profile_image',
    'created_at', 'updated_at', 'last_login', 'deleted_at'
  ],
  Donors: [
    'donor_id', 'user_id', 'blood_group', 'date_of_birth', 'gender',
    'division', 'district', 'upazila', 'union_name', 'ward', 'area', 'address',
    'last_donation_date', 'availability', 'verification_status', 'phone_visibility',
    'bio', 'created_at', 'updated_at'
  ],
  Recipients: [
    'recipient_id', 'user_id', 'full_name', 'phone', 'relationship_to_patient',
    'division', 'district', 'upazila', 'address', 'created_at', 'updated_at'
  ],
  Blood_Requests: [
    'request_id', 'requester_user_id', 'patient_name', 'requester_name', 'blood_group',
    'units_required', 'hospital_name', 'hospital_address', 'division', 'district', 'upazila',
    'required_date', 'required_time', 'urgency_level', 'contact_phone', 'patient_condition',
    'additional_notes', 'admin_status', 'donor_found_count', 'completed_units',
    'assigned_representative_id', 'created_at', 'updated_at', 'completed_at'
  ],
  Donations: [
    'donation_id', 'donor_id', 'request_id', 'recipient_user_id', 'donation_date',
    'hospital_name', 'blood_group', 'verification_status', 'verified_by',
    'verified_at', 'notes', 'created_at'
  ],
  Verifications: [
    'verification_id', 'donor_id', 'admin_id', 'representative_id', 'verification_type',
    'verification_result', 'verification_notes', 'verified_phone', 'verified_blood_group',
    'verification_date', 'previous_status', 'new_status'
  ],
  Volunteers: [
    'volunteer_id', 'user_id', 'skills', 'division', 'district', 'upazila',
    'availability', 'approval_status', 'joined_at'
  ],
  Campaigns: [
    'campaign_id', 'campaign_title', 'campaign_description', 'banner_url', 'event_date',
    'start_time', 'end_time', 'venue', 'division', 'district', 'upazila',
    'organizer', 'registration_limit', 'campaign_status', 'created_at'
  ],
  Campaign_Registrations: [
    'registration_id', 'campaign_id', 'user_id', 'participant_type',
    'registration_status', 'attendance_status', 'registered_at'
  ],
  Contact_Requests: [
    'contact_request_id', 'request_id', 'donor_id', 'requester_user_id',
    'donor_consent', 'contact_status', 'message', 'created_at', 'responded_at'
  ],
  Notifications: [
    'notification_id', 'user_id', 'title', 'message', 'notification_type',
    'reference_id', 'is_read', 'created_at'
  ],
  Messages: [
    'message_id', 'sender_user_id', 'receiver_user_id', 'request_id',
    'message_text', 'read_status', 'created_at'
  ],
  Locations: [
    'location_id', 'division_name', 'district_name', 'upazila_name',
    'union_name', 'ward_name', 'is_active', 'sort_order'
  ],
  Blogs: [
    'blog_id', 'title', 'slug', 'category', 'thumbnail_url', 'content',
    'author_id', 'publish_status', 'published_at', 'created_at'
  ],
  Admins: [
    'admin_id', 'full_name', 'email', 'phone', 'role', 'permissions',
    'account_status', 'created_at', 'last_login'
  ],
  Activity_Logs: [
    'log_id', 'actor_id', 'actor_role', 'action', 'module',
    'record_id', 'description', 'timestamp'
  ],
  Settings: [
    'setting_key', 'setting_value', 'setting_group', 'description',
    'updated_by', 'updated_at'
  ],
  System_Logs: [
    'system_log_id', 'event_type', 'api_action', 'error_code',
    'error_message', 'timestamp', 'request_id'
  ],
  Representatives: [
    'representative_id', 'user_id', 'representative_code', 'full_name',
    'phone', 'email', 'profile_image', 'appointment_date', 'status',
    'assigned_by', 'created_at', 'updated_at'
  ],
  Representative_Assignments: [
    'assignment_id', 'representative_id', 'assignment_level', 'division', 'district',
    'upazila', 'union_name', 'ward_name', 'area', 'assigned_by', 'assigned_at',
    'status', 'permission_level', 'notes'
  ],
  Representative_Tasks: [
    'task_id', 'representative_id', 'task_type', 'reference_id', 'title',
    'description', 'priority', 'task_status', 'assigned_by', 'assigned_at',
    'due_date', 'completed_at', 'notes'
  ],
  Representative_Reports: [
    'report_id', 'representative_id', 'report_title', 'report_content',
    'report_type', 'related_area', 'submitted_at', 'reviewed_by',
    'review_status', 'admin_notes'
  ],
  Representative_Permissions: [
    'permission_id', 'representative_id', 'can_view_donors', 'can_verify_donors',
    'can_recommend_approval', 'can_recommend_rejection', 'can_view_requests',
    'can_manage_local_requests', 'can_manage_campaigns', 'can_view_reports',
    'granted_by', 'updated_at'
  ],
  Sessions: [
    'session_id', 'user_id', 'token_hash', 'role', 'expires_at', 'revoked', 'created_at'
  ],
  Password_Resets: [
    'reset_id', 'user_id', 'identifier', 'reference_code', 'reason',
    'status', 'resolved_by', 'created_at', 'resolved_at'
  ],
  Donor_Posters: [
    'poster_id', 'title', 'subtitle', 'blood_group', 'image_url',
    'sort_order', 'is_active', 'created_by', 'created_at', 'deleted_at'
  ]
};


// ===== Utility.gs =====
/**
 * Utility.gs — Standard JSON Responses, IDs, Sanitization & Validation
 */
function jsonResponse(success, message, data, error) {
  var payload = {
    success: Boolean(success),
    message: message || '',
    data: data === undefined ? null : data,
    error: error || null
  };
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function generateId(prefix) {
  var rand = Utilities.getUuid().replace(/-/g, '').substring(0, 10).toUpperCase();
  var ts = new Date().getTime().toString(36).toUpperCase();
  return (prefix || 'RB') + '_' + ts + '_' + rand;
}

function nowIso() {
  return Utilities.formatDate(new Date(), 'Asia/Dhaka', 'yyyy-MM-dd HH:mm:ss');
}

function sanitizeText(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

function normalizePhone(phone) {
  var cleaned = sanitizeText(phone).replace(/[\s\-()]/g, '');
  if (cleaned.indexOf('+880') === 0) {
    cleaned = '0' + cleaned.substring(4);
  } else if (cleaned.indexOf('880') === 0 && cleaned.length === 13) {
    cleaned = '0' + cleaned.substring(3);
  }
  return cleaned;
}

function isValidBdPhone(phone) {
  return /^01[3-9]\d{8}$/.test(normalizePhone(phone));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizeText(email).toLowerCase());
}

function isValidBloodGroup(bg) {
  return RB_CONFIG.BLOOD_GROUPS.indexOf(String(bg || '').toUpperCase()) !== -1;
}

function parseBody(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    return {};
  }
}

function maskPhone(phone) {
  var p = normalizePhone(phone);
  if (!p || p.length < 7) return '***';
  return p.substring(0, 3) + '****' + p.substring(p.length - 3);
}


// ===== Security.gs =====
/**
 * Security.gs — Salted PBKDF2 Password Hashing, Session Tokens, Rate Limiting, RBAC & Area ACL
 */
function generateSalt() {
  var bytes = [];
  for (var i = 0; i < 16; i++) {
    bytes.push(Math.floor(Math.random() * 256));
  }
  return Utilities.base64Encode(bytes);
}

function pbkdf2Hash(password, salt, iterations) {
  var iter = iterations || RB_CONFIG.PBKDF2_ITERATIONS;
  var key = String(password);
  var block = Utilities.computeHmacSha256Signature(salt + ':1', key);
  var result = block.slice();
  // Iterative HMAC-SHA256 stretching (note: GAS V8 execution limit is 6m; 10,000 iter takes ~180ms)
  for (var i = 1; i < iter; i++) {
    block = Utilities.computeHmacSha256Signature(Utilities.base64Encode(block), key);
    for (var j = 0; j < result.length; j++) {
      result[j] = result[j] ^ block[j];
    }
  }
  return Utilities.base64Encode(result);
}

function verifyPassword(password, storedHash, salt) {
  var computed = pbkdf2Hash(password, salt, RB_CONFIG.PBKDF2_ITERATIONS);
  if (computed.length !== storedHash.length) return false;
  var diff = 0;
  for (var i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return diff === 0;
}

function hashToken(rawToken) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, rawToken);
  return Utilities.base64Encode(digest);
}

function generateSessionToken() {
  return Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
}

function checkLoginRateLimit(identifier) {
  var cache = CacheService.getScriptCache();
  var key = 'RL_' + Utilities.base64Encode(String(identifier).toLowerCase());
  var raw = cache.get(key);
  if (!raw) return { allowed: true, attempts: 0 };
  var data = JSON.parse(raw);
  if (data.attempts >= RB_CONFIG.MAX_LOGIN_ATTEMPTS) {
    return { allowed: false, attempts: data.attempts };
  }
  return { allowed: true, attempts: data.attempts };
}

function recordFailedLogin(identifier) {
  var cache = CacheService.getScriptCache();
  var key = 'RL_' + Utilities.base64Encode(String(identifier).toLowerCase());
  var raw = cache.get(key);
  var attempts = raw ? JSON.parse(raw).attempts + 1 : 1;
  cache.put(key, JSON.stringify({ attempts: attempts }), RB_CONFIG.LOCKOUT_MINUTES * 60);
}

function clearLoginRateLimit(identifier) {
  var cache = CacheService.getScriptCache();
  var key = 'RL_' + Utilities.base64Encode(String(identifier).toLowerCase());
  cache.remove(key);
}

function authenticateRequest(payload, e) {
  var token = (payload && payload.token) || (e && e.parameter && e.parameter.token) || '';
  if (!token) return null;
  var tokenHash = hashToken(token);
  var sessions = readSheetRecords('Sessions');
  var now = new Date().getTime();
  for (var i = 0; i < sessions.length; i++) {
    var s = sessions[i];
    if (s.token_hash === tokenHash && String(s.revoked) !== 'true') {
      var exp = new Date(s.expires_at).getTime();
      if (exp > now) {
        var user = findRecordByField('Users', 'user_id', s.user_id);
        if (user && user.account_status === 'active' && !user.deleted_at) {
          return { session: s, user: user };
        }
      }
    }
  }
  return null;
}

function requireRole(auth, allowedRoles) {
  if (!auth || !auth.user) {
    throw new Error('UNAUTHORIZED: অনুগ্রহ করে প্রথমে লগইন করুন।');
  }
  if (allowedRoles && allowedRoles.length > 0) {
    if (allowedRoles.indexOf(auth.user.role) === -1) {
      throw new Error('FORBIDDEN: এই কাজটি করার অনুমতি আপনার নেই।');
    }
  }
  return auth.user;
}

function getRepresentativeScope(userId) {
  var rep = findRecordByField('Representatives', 'user_id', userId);
  if (!rep || rep.status !== 'active') return null;
  var assignments = readSheetRecords('Representative_Assignments').filter(function(a) {
    return a.representative_id === rep.representative_id && a.status === 'active';
  });
  var perms = findRecordByField('Representative_Permissions', 'representative_id', rep.representative_id);
  return { rep: rep, assignments: assignments, permissions: perms };
}

function isRecordInRepresentativeArea(record, assignments) {
  if (!assignments || assignments.length === 0) return false;
  for (var i = 0; i < assignments.length; i++) {
    var a = assignments[i];
    if (a.division && record.division !== a.division) continue;
    if (a.district && record.district !== a.district) continue;
    if (a.upazila && record.upazila !== a.upazila) continue;
    if (a.union_name && record.union_name !== a.union_name) continue;
    if (a.ward_name && record.ward !== a.ward_name) continue;
    if (a.area && record.area !== a.area) continue;
    return true;
  }
  return false;
}

function withScriptLock(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function logActivity(actorId, actorRole, action, moduleName, recordId, description) {
  appendRecord('Activity_Logs', {
    log_id: generateId('LOG'),
    actor_id: actorId || 'SYSTEM',
    actor_role: actorRole || 'system',
    action: action,
    module: moduleName,
    record_id: recordId || '',
    description: sanitizeText(description),
    timestamp: nowIso()
  });
}

function logSystemEvent(eventType, apiAction, errorCode, errorMessage, requestId) {
  try {
    appendRecord('System_Logs', {
      system_log_id: generateId('SYS'),
      event_type: eventType,
      api_action: apiAction || '',
      error_code: errorCode || '',
      error_message: sanitizeText(errorMessage),
      timestamp: nowIso(),
      request_id: requestId || ''
    });
  } catch (ignore) {}
}


// ===== Database.gs =====
/**
 * Database.gs — Idempotent Spreadsheet Auto-Setup & Batch Read/Write Engine
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('🩸 রক্তবন্ধন ডাটাবেজ')
      .addItem('সব টেবিল স্বয়ংক্রিয় তৈরি / আপডেট করুন', 'runDatabaseSetupFromMenu')
      .addItem('টেবিল ও কলাম যাচাই করুন', 'runDatabaseValidationFromMenu')
      .addToUi();
  } catch (ignore) {}
}

function runDatabaseSetupFromMenu() {
  var result = setupRoktoBondhonDatabase();
  SpreadsheetApp.getUi().alert(
    'রক্তবন্ধন ডাটাবেজ সেটআপ সম্পন্ন!\nমোট টেবিল: ' +
      result.validation.totalRequiredSheets +
      'টি\nঅবস্থা: ' +
      (result.validation.valid ? 'সবগুলো টেবিল ও কলাম সঠিকভাবে তৈরি হয়েছে।' : 'কিছু কলাম/টেবিল অনুপস্থিত।')
  );
}

function runDatabaseValidationFromMenu() {
  var v = validateRoktoBondhonDatabase();
  SpreadsheetApp.getUi().alert(
    'ডাটাবেজ যাচাই ফলাফল:\nপ্রয়োজনীয় টেবিল: ' +
      v.totalRequiredSheets +
      'টি\nসঠিক: ' +
      (v.valid ? 'হ্যাঁ (১০০% প্রস্তুত)' : 'না — অনুপস্থিত: ' + JSON.stringify(v.missingSheets))
  );
}

function getSpreadsheet() {
  var active = SpreadsheetApp.getActiveSpreadsheet();
  var props = PropertiesService.getScriptProperties();
  if (active) {
    if (!props.getProperty(RB_CONFIG.PROP_SPREADSHEET_ID)) {
      props.setProperty(RB_CONFIG.PROP_SPREADSHEET_ID, active.getId());
    }
    return active;
  }
  var ssId = props.getProperty(RB_CONFIG.PROP_SPREADSHEET_ID);
  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (e) {
      throw new Error('স্প্রেডশিট ওপেন করা যায়নি: ' + e.message);
    }
  }
  throw new Error('ডাটাবেজ সেটআপ করা হয়নি। অনুগ্রহ করে প্রথমে setupRoktoBondhonDatabase() চালান।');
}

const RB_TEXT_COLUMNS = [
  'phone',
  'contact_phone',
  'last_donation_date',
  'required_date',
  'donation_date',
  'date_of_birth',
  'event_date',
  'identifier'
];

function applyTextColumnFormats_(sheet, headers) {
  var maxRows = Math.max(sheet.getMaxRows(), 200);
  for (var c = 0; c < headers.length; c++) {
    if (RB_TEXT_COLUMNS.indexOf(headers[c]) !== -1) {
      sheet.getRange(2, c + 1, maxRows - 1, 1).setNumberFormat('@');
    }
  }
}

function ensureSheetForSync_(ss, sheetName, fallbackHeaders) {
  var expectedHeaders = RB_SHEETS[sheetName] || fallbackHeaders || [];
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  var lastCol = sheet.getLastColumn();
  var existingHeaders = lastCol > 0
    ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim(); })
    : [];

  if (existingHeaders.length === 0 && expectedHeaders.length > 0) {
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    existingHeaders = expectedHeaders.slice();
  } else if (expectedHeaders.length > 0) {
    var missingHeaders = expectedHeaders.filter(function(h) { return existingHeaders.indexOf(h) === -1; });
    if (missingHeaders.length > 0) {
      sheet.getRange(1, existingHeaders.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
      existingHeaders = existingHeaders.concat(missingHeaders);
    }
  }

  sheet.setFrozenRows(1);
  if (existingHeaders.length > 0) {
    var headerRange = sheet.getRange(1, 1, 1, existingHeaders.length);
    headerRange
      .setBackground(RB_CONFIG.HEADER_BG_COLOR)
      .setFontColor(RB_CONFIG.HEADER_TEXT_COLOR)
      .setFontWeight('bold')
      .setVerticalAlignment('middle');
    applyTextColumnFormats_(sheet, existingHeaders);
  }
  return { sheet: sheet, headers: existingHeaders };
}

function formatCellForSheet_(header, value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'boolean') return String(value);
  var s = String(value);
  if (s.length > 48000) s = s.substring(0, 48000);
  if (RB_TEXT_COLUMNS.indexOf(header) !== -1) {
    return s;
  }
  return value;
}

function normalizePhoneCompare_(val) {
  var p = normalizePhone(val || '');
  if (/^1[3-9]\d{8}$/.test(p)) return '0' + p;
  return p;
}

function setupRoktoBondhonDatabase() {
  return withScriptLock(function() {
    var props = PropertiesService.getScriptProperties();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      var ssId = props.getProperty(RB_CONFIG.PROP_SPREADSHEET_ID);
      if (ssId) {
        try {
          ss = SpreadsheetApp.openById(ssId);
        } catch (e) {
          ss = null;
        }
      }
    }
    if (!ss) {
      ss = SpreadsheetApp.create(RB_CONFIG.SPREADSHEET_NAME);
    }
    props.setProperty(RB_CONFIG.PROP_SPREADSHEET_ID, ss.getId());

    var sheetNames = Object.keys(RB_SHEETS);
    for (var i = 0; i < sheetNames.length; i++) {
      var name = sheetNames[i];
      var headers = RB_SHEETS[name];
      var sheet = ss.getSheetByName(name);
      if (!sheet) {
        sheet = ss.insertSheet(name);
      }
      var lastCol = sheet.getLastColumn();
      var existingHeaders = lastCol > 0
        ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim(); })
        : [];

      if (existingHeaders.length === 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        existingHeaders = headers.slice();
      } else {
        var missingHeaders = headers.filter(function(h) { return existingHeaders.indexOf(h) === -1; });
        if (missingHeaders.length > 0) {
          sheet.getRange(1, existingHeaders.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
          existingHeaders = existingHeaders.concat(missingHeaders);
        }
      }

      sheet.setFrozenRows(1);
      var totalCols = Math.max(sheet.getLastColumn(), headers.length);
      var headerRange = sheet.getRange(1, 1, 1, totalCols);
      headerRange
        .setBackground(RB_CONFIG.HEADER_BG_COLOR)
        .setFontColor(RB_CONFIG.HEADER_TEXT_COLOR)
        .setFontWeight('bold')
        .setVerticalAlignment('middle');
      sheet.setRowHeight(1, 34);

      for (var c = 1; c <= totalCols; c++) {
        sheet.setColumnWidth(c, 165);
      }
      applyTextColumnFormats_(sheet, existingHeaders);

      if (!sheet.getFilter()) {
        sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), totalCols).createFilter();
      }
    }

    // Remove default empty 'Sheet1' if safe
    var defaultSheet = ss.getSheetByName('Sheet1');
    if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() <= 1) {
      ss.deleteSheet(defaultSheet);
    }

    seedInitialData();
    var validation = validateRoktoBondhonDatabase();
    return {
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      validation: validation
    };
  });
}

function validateRoktoBondhonDatabase() {
  var ss = getSpreadsheet();
  var missingSheets = [];
  var missingColumns = {};
  var sheetNames = Object.keys(RB_SHEETS);

  for (var i = 0; i < sheetNames.length; i++) {
    var name = sheetNames[i];
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      missingSheets.push(name);
      continue;
    }
    var lastCol = sheet.getLastColumn();
    var existingHeaders = lastCol > 0
      ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim(); })
      : [];
    var missing = RB_SHEETS[name].filter(function(h) { return existingHeaders.indexOf(h) === -1; });
    if (missing.length > 0) {
      missingColumns[name] = missing;
    }
  }

  return {
    valid: missingSheets.length === 0 && Object.keys(missingColumns).length === 0,
    totalRequiredSheets: sheetNames.length,
    missingSheets: missingSheets,
    missingColumns: missingColumns
  };
}

function seedInitialData() {
  var existingSettings = readSheetRecords('Settings');
  if (existingSettings.length === 0) {
    var defaults = [
      ['site_name', 'BLOODIX', 'general', 'ওয়েবসাইটের নাম'],
      ['site_tagline', 'Donate Blood • Save Lives', 'general', 'প্রধান স্লোগান'],
      ['site_logo', '/assets/aistudio/image-removebg-preview__1__4794faaf.png', 'general', 'ওয়েবসাইটের লোগো'],
      ['contact_email', 'support@bloodix.org', 'general', 'যোগাযোগের ইমেইল'],
      ['contact_phone', '+880 1700-000000', 'general', 'জরুরি হেল্পলাইন'],
      ['contact_address', 'ঢাকা, বাংলাদেশ', 'general', 'ঠিকানা'],
      ['hero_title', 'রক্তের অভাবে যেন থেমে না যায় কোনো প্রাণ', 'general', 'হিরো শিরোনাম'],
      ['hero_subtitle', 'আপনার এক ব্যাগ রক্ত বাঁচাতে পারে একটি জীবন। রক্তদাতা খুঁজুন, রক্তদান করুন, মানুষের পাশে দাঁড়ান।', 'general', 'হিরো উপ-শিরোনাম'],
      ['poster_slider_title', 'সফল রক্তদাতাদের সম্মাননা পোস্টার', 'general', 'স্লাইডার শিরোনাম'],
      ['show_poster_slider', 'true', 'general', 'হোমপেজে পোস্টার স্লাইডার প্রদর্শন'],
      ['registration_enabled', 'true', 'registration', 'রেজিস্ট্রেশন চালু'],
      ['donor_manual_approval', 'true', 'donor', 'অ্যাডমিন অনুমোদন বাধ্যতামূলক'],
      ['phone_public_default', 'false', 'donor', 'ডিফল্ট ফোন নম্বর প্রাইভেসি'],
      ['request_approval_required', 'true', 'request', 'রক্তের অনুরোধ যাচাই'],
      ['multiple_rep_per_area', 'true', 'representative', 'একই এলাকায় একাধিক প্রতিনিধি'],
      ['session_ttl_hours', '24', 'security', 'সেশন মেয়াদ (ঘণ্টা)'],
      ['login_rate_limit', '5', 'security', 'সর্বোচ্চ লগইন চেষ্টা'],
      ['maintenance_mode', 'false', 'system', 'মেইনটেন্যান্স মোড']
    ];
    for (var i = 0; i < defaults.length; i++) {
      appendRecord('Settings', {
        setting_key: defaults[i][0],
        setting_value: defaults[i][1],
        setting_group: defaults[i][2],
        description: defaults[i][3],
        updated_by: 'SYSTEM',
        updated_at: nowIso()
      });
    }
  }
}

/**
 * Creates initial Super Admin ONLY from Script Properties (never hardcoded passwords).
 */
function createInitialSuperAdmin() {
  var props = PropertiesService.getScriptProperties();
  var email = props.getProperty(RB_CONFIG.PROP_SUPER_ADMIN_EMAIL);
  var phone = props.getProperty(RB_CONFIG.PROP_SUPER_ADMIN_PHONE);
  var password = props.getProperty(RB_CONFIG.PROP_SUPER_ADMIN_PASS);

  if (!email || !password) {
    throw new Error('Script Properties-এ ADMIN_INIT_EMAIL এবং ADMIN_INIT_PASSWORD সেট করুন।');
  }

  var existing = readSheetRecords('Users').filter(function(u) { return u.role === 'super_admin'; });
  if (existing.length > 0) {
    return { created: false, message: 'সুপার অ্যাডমিন ইতিমধ্যেই বিদ্যমান।' };
  }

  var salt = generateSalt();
  var hash = pbkdf2Hash(password, salt, RB_CONFIG.PBKDF2_ITERATIONS);
  var userId = generateId('USR');
  var ts = nowIso();

  appendRecord('Users', {
    user_id: userId,
    full_name: 'সুপার অ্যাডমিন',
    email: email.toLowerCase().trim(),
    phone: normalizePhone(phone || ''),
    password_hash: hash,
    password_salt: salt,
    role: 'super_admin',
    account_status: 'active',
    email_verified: 'true',
    phone_verified: 'true',
    profile_image: '',
    created_at: ts,
    updated_at: ts,
    last_login: '',
    deleted_at: ''
  });

  appendRecord('Admins', {
    admin_id: generateId('ADM'),
    full_name: 'সুপার অ্যাডমিন',
    email: email.toLowerCase().trim(),
    phone: normalizePhone(phone || ''),
    role: 'super_admin',
    permissions: 'ALL',
    account_status: 'active',
    created_at: ts,
    last_login: ''
  });

  props.deleteProperty(RB_CONFIG.PROP_SUPER_ADMIN_PASS);
  return { created: true, user_id: userId };
}

function readSheetRecords(sheetName) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  var headers = values[0].map(function(h) { return String(h).trim(); });
  var records = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (row.join('') === '') continue;
    var obj = { _rowIndex: r + 1 };
    for (var c = 0; c < headers.length; c++) {
      var h = headers[c];
      var val = row[c] === undefined || row[c] === null ? '' : String(row[c]);
      if ((h === 'phone' || h === 'contact_phone') && val) {
        val = normalizePhoneCompare_(val);
      }
      obj[h] = val;
    }
    records.push(obj);
  }
  return records;
}

function findRecordByField(sheetName, field, value) {
  var rows = readSheetRecords(sheetName);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][field]) === String(value)) return rows[i];
  }
  return null;
}

function appendRecord(sheetName, dataObj) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet not found: ' + sheetName);
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim(); });
  var row = headers.map(function(h) {
    return formatCellForSheet_(h, dataObj[h]);
  });
  var nextRow = sheet.getLastRow() + 1;
  var range = sheet.getRange(nextRow, 1, 1, headers.length);
  for (var c = 0; c < headers.length; c++) {
    if (RB_TEXT_COLUMNS.indexOf(headers[c]) !== -1) {
      sheet.getRange(nextRow, c + 1).setNumberFormat('@');
    }
  }
  range.setValues([row]);
  return dataObj;
}

function updateRecordByField(sheetName, keyField, keyValue, updates) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet not found: ' + sheetName);
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return null;
  var headers = values[0].map(function(h) { return String(h).trim(); });
  var keyIdx = headers.indexOf(keyField);
  if (keyIdx === -1) return null;

  for (var r = 1; r < values.length; r++) {
    if (String(values[r][keyIdx]) === String(keyValue)) {
      var updatedRow = values[r].slice();
      var obj = {};
      for (var c = 0; c < headers.length; c++) {
        var h = headers[c];
        if (updates[h] !== undefined) {
          updatedRow[c] = formatCellForSheet_(h, updates[h]);
        }
        obj[h] = String(updatedRow[c] === undefined ? '' : updatedRow[c]);
      }
      sheet.getRange(r + 1, 1, 1, headers.length).setValues([updatedRow]);
      return obj;
    }
  }
  return null;
}

function handlePullAllTables() {
  var ss;
  try {
    ss = getSpreadsheet();
  } catch (e) {
    setupRoktoBondhonDatabase();
    ss = getSpreadsheet();
  }
  if (!ss.getSheetByName('Users')) {
    setupRoktoBondhonDatabase();
  }
  var sheetNames = Object.keys(RB_SHEETS);
  var tables = {};
  for (var i = 0; i < sheetNames.length; i++) {
    tables[sheetNames[i]] = readSheetRecords(sheetNames[i]);
  }
  return jsonResponse(true, 'সকল ডাটাবেজ টেবিল লোড হয়েছে।', { tables: tables }, null);
}

function handleFindUserForLogin(payload) {
  var ss;
  try {
    ss = getSpreadsheet();
  } catch (e) {
    setupRoktoBondhonDatabase();
    ss = getSpreadsheet();
  }
  if (!ss.getSheetByName('Users')) {
    setupRoktoBondhonDatabase();
  }

  var rawIdentifier = sanitizeText((payload && (payload.identifier || payload.email || payload.phone)) || '');
  if (!rawIdentifier) {
    return jsonResponse(false, 'ইমেইল বা মোবাইল নম্বর প্রয়োজন।', null, 'VALIDATION_ERROR');
  }

  var isEmail = rawIdentifier.indexOf('@') !== -1;
  var normEmail = rawIdentifier.toLowerCase().trim();
  var normPhone = normalizePhoneCompare_(rawIdentifier);
  var users = readSheetRecords('Users');
  var matched = null;

  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    if (u.deleted_at) continue;
    if (isEmail) {
      if (String(u.email || '').toLowerCase().trim() === normEmail) {
        matched = u;
        break;
      }
    } else {
      if (normalizePhoneCompare_(u.phone || '') === normPhone) {
        matched = u;
        break;
      }
    }
  }

  if (!matched) {
    return jsonResponse(false, 'Google Sheet-এ এই অ্যাকাউন্ট পাওয়া যায়নি।', null, 'USER_NOT_FOUND');
  }

  var donor = findRecordByField('Donors', 'user_id', matched.user_id);
  var volunteer = findRecordByField('Volunteers', 'user_id', matched.user_id);
  var recipient = findRecordByField('Recipients', 'user_id', matched.user_id);
  var representative = findRecordByField('Representatives', 'user_id', matched.user_id);
  var assignments = [];
  var permissions = null;
  if (representative) {
    assignments = readSheetRecords('Representative_Assignments').filter(function(a) {
      return a.representative_id === representative.representative_id;
    });
    permissions = findRecordByField('Representative_Permissions', 'representative_id', representative.representative_id);
  }
  var admin = null;
  if (matched.role === 'admin' || matched.role === 'super_admin') {
    admin = findRecordByField('Admins', 'email', matched.email) || findRecordByField('Admins', 'phone', matched.phone);
  }

  return jsonResponse(true, 'ব্যবহারকারীর তথ্য Google Sheet থেকে পাওয়া গেছে।', {
    user: matched,
    donor: donor,
    volunteer: volunteer,
    recipient: recipient,
    representative: representative,
    assignments: assignments,
    permissions: permissions,
    admin: admin
  }, null);
}

function handleUpsertBatch(payload) {
  return withScriptLock(function() {
    var ss;
    try {
      ss = getSpreadsheet();
    } catch (e) {
      setupRoktoBondhonDatabase();
      ss = getSpreadsheet();
    }
    if (!ss.getSheetByName('Users')) {
      setupRoktoBondhonDatabase();
    }

    var incomingTables = (payload && payload.tables) || {};
    var tableNames = Object.keys(incomingTables);
    var synced = [];

    for (var t = 0; t < tableNames.length; t++) {
      var tableName = tableNames[t];
      var tableSpec = incomingTables[tableName];
      if (!tableSpec || !tableSpec.rows || !tableSpec.rows.length) continue;

      var keyField = tableSpec.keyField;
      var rows = tableSpec.rows;
      var fallbackHeaders = RB_SHEETS[tableName] || Object.keys(rows[0]);
      var info = ensureSheetForSync_(ss, tableName, fallbackHeaders);
      var sheet = info.sheet;
      var headers = info.headers;
      var keyIdx = headers.indexOf(keyField);
      if (keyIdx === -1) continue;

      var existingValues = sheet.getDataRange().getValues();
      var rowIndexMap = {};
      for (var r = 1; r < existingValues.length; r++) {
        var existingKey = String(existingValues[r][keyIdx] || '');
        if (existingKey) rowIndexMap[existingKey] = r;
      }

      var newRows = [];
      var dirtyExisting = false;

      for (var i = 0; i < rows.length; i++) {
        var rowObj = rows[i];
        var keyVal = String(rowObj[keyField] || '');
        if (!keyVal) continue;

        var formattedRow = headers.map(function(h) {
          return formatCellForSheet_(h, rowObj[h]);
        });

        if (rowIndexMap[keyVal] !== undefined) {
          existingValues[rowIndexMap[keyVal]] = formattedRow;
          dirtyExisting = true;
        } else {
          newRows.push(formattedRow);
          rowIndexMap[keyVal] = existingValues.length + newRows.length - 1;
        }
      }

      if (dirtyExisting && existingValues.length > 1) {
        var existingDataRows = existingValues.slice(1);
        sheet.getRange(2, 1, existingDataRows.length, headers.length).setValues(existingDataRows);
      }

      if (newRows.length > 0) {
        var startRow = existingValues.length + 1;
        sheet.getRange(startRow, 1, newRows.length, headers.length).setValues(newRows);
      }

      applyTextColumnFormats_(sheet, headers);
      synced.push(tableName);
    }

    return jsonResponse(true, 'সব তথ্য Google Sheet-এ সফলভাবে সংরক্ষিত হয়েছে।', {
      syncedTables: synced
    }, null);
  });
}


// ===== Auth.gs =====
/**
 * Auth.gs — Password-based Registration, Login, Session & Admin-Assisted Reset (NO OTP)
 */
function handleRegisterUser(payload) {
  return withScriptLock(function() {
    var fullName = sanitizeText(payload.full_name);
    var email = sanitizeText(payload.email || '').toLowerCase();
    var phone = normalizePhone(payload.phone || '');
    var password = String(payload.password || '');
    var role = ['donor', 'recipient', 'volunteer', 'user'].indexOf(payload.role) !== -1 ? payload.role : 'donor';

    if (!fullName || fullName.length < 2) {
      return jsonResponse(false, 'সঠিক পূর্ণ নাম লিখুন।', null, 'VALIDATION_ERROR');
    }
    if (!email && !phone) {
      return jsonResponse(false, 'মোবাইল নম্বর অথবা ইমেইল—যেকোনো একটি অবশ্যই দিতে হবে।', null, 'VALIDATION_ERROR');
    }
    if (email && !isValidEmail(email)) {
      return jsonResponse(false, 'সঠিক ইমেইল ঠিকানা লিখুন।', null, 'VALIDATION_ERROR');
    }
    if (phone && !isValidBdPhone(phone)) {
      return jsonResponse(false, 'সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)।', null, 'VALIDATION_ERROR');
    }
    if (password.length < 8) {
      return jsonResponse(false, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।', null, 'VALIDATION_ERROR');
    }

    var users = readSheetRecords('Users');
    for (var i = 0; i < users.length; i++) {
      if (email && users[i].email === email) {
        return jsonResponse(false, 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে।', null, 'DUPLICATE_EMAIL');
      }
      if (phone && users[i].phone === phone) {
        return jsonResponse(false, 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে।', null, 'DUPLICATE_PHONE');
      }
    }

    var salt = generateSalt();
    var hash = pbkdf2Hash(password, salt, RB_CONFIG.PBKDF2_ITERATIONS);
    var userId = generateId('USR');
    var ts = nowIso();

    appendRecord('Users', {
      user_id: userId,
      full_name: fullName,
      email: email,
      phone: phone,
      password_hash: hash,
      password_salt: salt,
      role: role,
      account_status: 'active',
      email_verified: 'false',
      phone_verified: 'false',
      profile_image: String(payload.profile_image || '').slice(0, 48000),
      created_at: ts,
      updated_at: ts,
      last_login: ts,
      deleted_at: ''
    });

    if (role === 'donor' && payload.blood_group) {
      appendRecord('Donors', {
        donor_id: generateId('DNR'),
        user_id: userId,
        blood_group: String(payload.blood_group).toUpperCase(),
        date_of_birth: sanitizeText(payload.date_of_birth || ''),
        gender: sanitizeText(payload.gender || ''),
        division: sanitizeText(payload.division || ''),
        district: sanitizeText(payload.district || ''),
        upazila: sanitizeText(payload.upazila || ''),
        union_name: sanitizeText(payload.union_name || ''),
        ward: sanitizeText(payload.ward || ''),
        area: sanitizeText(payload.area || ''),
        address: sanitizeText(payload.address || ''),
        last_donation_date: sanitizeText(payload.last_donation_date || ''),
        availability: payload.availability === 'false' ? 'unavailable' : 'available',
        verification_status: 'Pending Verification',
        phone_visibility: payload.phone_visibility === 'public' ? 'public' : 'private',
        bio: sanitizeText(payload.bio || ''),
        created_at: ts,
        updated_at: ts
      });
    } else if (role === 'volunteer') {
      appendRecord('Volunteers', {
        volunteer_id: generateId('VOL'),
        user_id: userId,
        skills: sanitizeText(payload.skills || ''),
        division: sanitizeText(payload.division || ''),
        district: sanitizeText(payload.district || ''),
        upazila: sanitizeText(payload.upazila || ''),
        availability: 'available',
        approval_status: 'Pending',
        joined_at: ts
      });
    }

    var rawToken = generateSessionToken();
    var ttlHours = RB_CONFIG.SESSION_TTL_HOURS;
    var expiresAt = Utilities.formatDate(new Date(Date.now() + ttlHours * 3600000), 'Asia/Dhaka', 'yyyy-MM-dd HH:mm:ss');
    appendRecord('Sessions', {
      session_id: generateId('SES'),
      user_id: userId,
      token_hash: hashToken(rawToken),
      role: role,
      expires_at: expiresAt,
      revoked: 'false',
      created_at: ts
    });

    createNotification(
      userId,
      'রেজিস্ট্রেশন সফল হয়েছে',
      'রক্তবন্ধন প্ল্যাটফর্মে স্বাগতম! আপনার প্রোফাইল অ্যাডমিন যাচাইকরণের জন্য জমা হয়েছে।',
      'registration_success',
      userId
    );
    logActivity(userId, role, 'REGISTER', 'Auth', userId, 'নতুন ব্যবহারকারী নিবন্ধন সম্পন্ন');

    return jsonResponse(true, 'রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে।', {
      token: rawToken,
      user: {
        user_id: userId,
        full_name: fullName,
        email: email,
        phone: phone,
        role: role,
        account_status: 'active',
        profile_image: String(payload.profile_image || '').slice(0, 48000)
      }
    }, null);
  });
}

function handleLoginUser(payload) {
  var identifierRaw = sanitizeText(payload.identifier || payload.email || payload.phone || '');
  var password = String(payload.password || '');
  if (!identifierRaw || !password) {
    return jsonResponse(false, 'মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড দিন।', null, 'VALIDATION_ERROR');
  }

  var rl = checkLoginRateLimit(identifierRaw);
  if (!rl.allowed) {
    return jsonResponse(false, 'অতিরিক্ত ভুল চেষ্টার কারণে ১৫ মিনিটের জন্য লগইন সাময়িকভাবে বন্ধ আছে।', null, 'RATE_LIMITED');
  }

  var isEmail = identifierRaw.indexOf('@') !== -1;
  var normalized = isEmail ? identifierRaw.toLowerCase() : normalizePhone(identifierRaw);
  var users = readSheetRecords('Users');
  var user = null;
  for (var i = 0; i < users.length; i++) {
    if (isEmail && users[i].email === normalized) { user = users[i]; break; }
    if (!isEmail && users[i].phone === normalized) { user = users[i]; break; }
  }

  if (!user || !verifyPassword(password, user.password_hash, user.password_salt)) {
    recordFailedLogin(identifierRaw);
    return jsonResponse(false, 'মোবাইল/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।', null, 'INVALID_CREDENTIALS');
  }

  if (user.account_status !== 'active') {
    return jsonResponse(false, 'আপনার অ্যাকাউন্টটি বর্তমানে স্থগিত বা নিষ্ক্রিয় আছে।', null, 'ACCOUNT_INACTIVE');
  }

  clearLoginRateLimit(identifierRaw);
  var rawToken = generateSessionToken();
  var ttlHours = payload.remember_me ? RB_CONFIG.SESSION_REMEMBER_HOURS : RB_CONFIG.SESSION_TTL_HOURS;
  var expiresAt = Utilities.formatDate(new Date(Date.now() + ttlHours * 3600000), 'Asia/Dhaka', 'yyyy-MM-dd HH:mm:ss');
  var ts = nowIso();

  appendRecord('Sessions', {
    session_id: generateId('SES'),
    user_id: user.user_id,
    token_hash: hashToken(rawToken),
    role: user.role,
    expires_at: expiresAt,
    revoked: 'false',
    created_at: ts
  });
  updateRecordByField('Users', 'user_id', user.user_id, { last_login: ts });
  logActivity(user.user_id, user.role, 'LOGIN', 'Auth', user.user_id, 'লগইন সম্পন্ন');

  return jsonResponse(true, 'সফলভাবে লগইন হয়েছে।', {
    token: rawToken,
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      account_status: user.account_status
    }
  }, null);
}

function handleLogoutUser(auth) {
  if (auth && auth.session) {
    updateRecordByField('Sessions', 'session_id', auth.session.session_id, { revoked: 'true' });
  }
  return jsonResponse(true, 'সফলভাবে লগআউট হয়েছে।', null, null);
}

function handleGetCurrentUser(auth) {
  var user = requireRole(auth);
  return jsonResponse(true, 'ব্যবহারকারীর তথ্য লোড হয়েছে।', {
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      account_status: user.account_status
    }
  }, null);
}

function handleChangePassword(auth, payload) {
  var user = requireRole(auth);
  if (!verifyPassword(String(payload.current_password || ''), user.password_hash, user.password_salt)) {
    return jsonResponse(false, 'বর্তমান পাসওয়ার্ড সঠিক নয়।', null, 'INVALID_PASSWORD');
  }
  var newPass = String(payload.new_password || '');
  if (newPass.length < 8) {
    return jsonResponse(false, 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।', null, 'VALIDATION_ERROR');
  }
  var salt = generateSalt();
  var hash = pbkdf2Hash(newPass, salt, RB_CONFIG.PBKDF2_ITERATIONS);
  updateRecordByField('Users', 'user_id', user.user_id, {
    password_hash: hash,
    password_salt: salt,
    updated_at: nowIso()
  });
  logActivity(user.user_id, user.role, 'CHANGE_PASSWORD', 'Auth', user.user_id, 'পাসওয়ার্ড পরিবর্তন করা হয়েছে');
  return jsonResponse(true, 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে।', null, null);
}

function handleRequestPasswordReset(payload) {
  var identifier = sanitizeText(payload.identifier || '');
  if (!identifier) {
    return jsonResponse(false, 'আপনার নিবন্ধিত মোবাইল নম্বর বা ইমেইল দিন।', null, 'VALIDATION_ERROR');
  }
  var refCode = 'RST-' + generateId('PW').slice(-6);
  appendRecord('Password_Resets', {
    reset_id: generateId('PRQ'),
    user_id: '',
    identifier: identifier,
    reference_code: refCode,
    reason: sanitizeText(payload.reason || 'অ্যাডমিন সহায়তায় পাসওয়ার্ড রিসেট আবেদন'),
    status: 'Pending Admin Review',
    resolved_by: '',
    created_at: nowIso(),
    resolved_at: ''
  });
  return jsonResponse(true, 'পাসওয়ার্ড রিসেট অনুরোধ জমা হয়েছে। অ্যাডমিন যাচাই করে রিসেট সম্পন্ন করবেন।', {
    reference_code: refCode
  }, null);
}

function handleCompleteAdminPasswordReset(auth, payload) {
  var admin = requireRole(auth, ['admin', 'super_admin']);
  var resetReq = findRecordByField('Password_Resets', 'reset_id', payload.reset_id);
  if (!resetReq) {
    return jsonResponse(false, 'রিসেট অনুরোধ পাওয়া যায়নি।', null, 'NOT_FOUND');
  }
  var newPass = String(payload.temporary_password || '');
  if (newPass.length < 8) {
    return jsonResponse(false, 'অস্থায়ী পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।', null, 'VALIDATION_ERROR');
  }
  var users = readSheetRecords('Users');
  var ident = resetReq.identifier.toLowerCase();
  var target = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === ident || users[i].phone === normalizePhone(ident)) {
      target = users[i];
      break;
    }
  }
  if (!target) {
    return jsonResponse(false, 'সংশ্লিষ্ট ব্যবহারকারী খুঁজে পাওয়া যায়নি।', null, 'USER_NOT_FOUND');
  }
  var salt = generateSalt();
  var hash = pbkdf2Hash(newPass, salt, RB_CONFIG.PBKDF2_ITERATIONS);
  updateRecordByField('Users', 'user_id', target.user_id, {
    password_hash: hash,
    password_salt: salt,
    updated_at: nowIso()
  });
  updateRecordByField('Password_Resets', 'reset_id', resetReq.reset_id, {
    user_id: target.user_id,
    status: 'Completed',
    resolved_by: admin.user_id,
    resolved_at: nowIso()
  });
  logActivity(admin.user_id, admin.role, 'ADMIN_PASSWORD_RESET', 'Auth', target.user_id, 'অ্যাডমিন দ্বারা পাসওয়ার্ড রিসেট সম্পন্ন');
  return jsonResponse(true, 'ব্যবহারকারীর পাসওয়ার্ড রিসেট করা হয়েছে।', null, null);
}


// ===== DonorService.gs =====
/**
 * DonorService.gs — Donor Registration, Privacy-Safe Search & Availability
 */
function handleCreateDonor(auth, payload) {
  var user = requireRole(auth);
  var existing = findRecordByField('Donors', 'user_id', user.user_id);
  if (existing) {
    return jsonResponse(false, 'আপনার ডোনার প্রোফাইল ইতিমধ্যে বিদ্যমান।', null, 'DUPLICATE_DONOR');
  }
  var bg = String(payload.blood_group || '').toUpperCase();
  if (!isValidBloodGroup(bg)) {
    return jsonResponse(false, 'সঠিক রক্তের গ্রুপ নির্বাচন করুন।', null, 'VALIDATION_ERROR');
  }
  var ts = nowIso();
  var donorId = generateId('DNR');
  var donor = appendRecord('Donors', {
    donor_id: donorId,
    user_id: user.user_id,
    blood_group: bg,
    date_of_birth: sanitizeText(payload.date_of_birth || ''),
    gender: sanitizeText(payload.gender || ''),
    division: sanitizeText(payload.division || ''),
    district: sanitizeText(payload.district || ''),
    upazila: sanitizeText(payload.upazila || ''),
    union_name: sanitizeText(payload.union_name || ''),
    ward: sanitizeText(payload.ward || ''),
    area: sanitizeText(payload.area || ''),
    address: sanitizeText(payload.address || ''),
    last_donation_date: sanitizeText(payload.last_donation_date || ''),
    availability: payload.availability === 'unavailable' ? 'unavailable' : 'available',
    verification_status: 'Pending Verification',
    phone_visibility: payload.phone_visibility === 'public' ? 'public' : 'private',
    bio: sanitizeText(payload.bio || ''),
    created_at: ts,
    updated_at: ts
  });
  logActivity(user.user_id, user.role, 'CREATE_DONOR', 'Donors', donorId, 'ডোনার প্রোফাইল জমা');
  return jsonResponse(true, 'ডোনার প্রোফাইল যাচাইকরণের জন্য জমা হয়েছে।', { donor: donor }, null);
}

function handleGetDonorProfile(auth) {
  var user = requireRole(auth);
  var donor = findRecordByField('Donors', 'user_id', user.user_id);
  if (!donor) return jsonResponse(false, 'ডোনার প্রোফাইল পাওয়া যায়নি।', null, 'NOT_FOUND');
  return jsonResponse(true, 'ডোনার প্রোফাইল লোড হয়েছে।', { donor: donor }, null);
}

function handleUpdateDonorProfile(auth, payload) {
  var user = requireRole(auth);
  var donor = findRecordByField('Donors', 'user_id', user.user_id);
  if (!donor) return jsonResponse(false, 'ডোনার প্রোফাইল পাওয়া যায়নি।', null, 'NOT_FOUND');
  var updates = { updated_at: nowIso() };
  var allowed = ['division', 'district', 'upazila', 'union_name', 'ward', 'area', 'address', 'last_donation_date', 'availability', 'phone_visibility', 'bio'];
  for (var i = 0; i < allowed.length; i++) {
    var k = allowed[i];
    if (payload[k] !== undefined) updates[k] = sanitizeText(payload[k]);
  }
  var updated = updateRecordByField('Donors', 'donor_id', donor.donor_id, updates);
  if (payload.profile_image !== undefined) {
    updateRecordByField('Users', 'user_id', user.user_id, {
      profile_image: String(payload.profile_image || '').slice(0, 48000),
      updated_at: nowIso()
    });
  }
  return jsonResponse(true, 'ডোনার প্রোফাইল হালনাগাদ হয়েছে।', { donor: updated }, null);
}

function handleUpdateAvailability(auth, payload) {
  var user = requireRole(auth);
  var donor = findRecordByField('Donors', 'user_id', user.user_id);
  if (!donor) return jsonResponse(false, 'ডোনার প্রোফাইল পাওয়া যায়নি।', null, 'NOT_FOUND');
  var status = payload.availability === 'unavailable' ? 'unavailable' : 'available';
  var updated = updateRecordByField('Donors', 'donor_id', donor.donor_id, {
    availability: status,
    updated_at: nowIso()
  });
  return jsonResponse(true, 'রক্তদানের প্রাপ্যতা হালনাগাদ হয়েছে।', { donor: updated }, null);
}

function handleSearchDonors(payload, e) {
  var params = payload || (e && e.parameter) || {};
  var donors = readSheetRecords('Donors');
  var users = readSheetRecords('Users');
  var userMap = {};
  for (var i = 0; i < users.length; i++) {
    userMap[users[i].user_id] = users[i];
  }

  var filtered = donors.filter(function(d) {
    // CRITICAL RULE: Only Approved & Active donors can be public
    if (d.verification_status !== 'Approved') return false;
    var u = userMap[d.user_id];
    if (!u || u.account_status !== 'active' || u.deleted_at) return false;
    if (params.blood_group && d.blood_group !== params.blood_group) return false;
    if (params.division && d.division !== params.division) return false;
    if (params.district && d.district !== params.district) return false;
    if (params.upazila && d.upazila !== params.upazila) return false;
    if (params.union_name && d.union_name !== params.union_name) return false;
    if (params.ward && d.ward !== params.ward) return false;
    if (params.area && d.area !== params.area) return false;
    if (params.availability && d.availability !== params.availability) return false;
    return true;
  }).map(function(d) {
    var u = userMap[d.user_id];
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

  return jsonResponse(true, 'অনুমোদিত রক্তদাতাদের তালিকা লোড হয়েছে।', { donors: filtered }, null);
}

function handleGetDonorById(payload, e) {
  var donorId = (payload && payload.donor_id) || (e && e.parameter && e.parameter.donor_id);
  var donor = findRecordByField('Donors', 'donor_id', donorId);
  if (!donor || donor.verification_status !== 'Approved') {
    return jsonResponse(false, 'অনুমোদিত রক্তদাতা পাওয়া যায়নি।', null, 'NOT_FOUND');
  }
  var u = findRecordByField('Users', 'user_id', donor.user_id);
  if (!u || u.account_status !== 'active') {
    return jsonResponse(false, 'রক্তদাতা বর্তমানে সক্রিয় নন।', null, 'NOT_FOUND');
  }
  return jsonResponse(true, 'ডোনারের তথ্য লোড হয়েছে।', {
    donor: {
      donor_id: donor.donor_id,
      full_name: u.full_name,
      profile_image: u.profile_image,
      blood_group: donor.blood_group,
      division: donor.division,
      district: donor.district,
      upazila: donor.upazila,
      area: donor.area,
      last_donation_date: donor.last_donation_date,
      availability: donor.availability,
      verification_status: donor.verification_status,
      phone_visibility: donor.phone_visibility,
      phone: donor.phone_visibility === 'public' ? u.phone : null,
      bio: donor.bio
    }
  }, null);
}

function handleGetDonorHistory(auth) {
  var user = requireRole(auth);
  var donor = findRecordByField('Donors', 'user_id', user.user_id);
  if (!donor) return jsonResponse(true, 'ইতিহাস খালি।', { donations: [] }, null);
  var donations = readSheetRecords('Donations').filter(function(d) {
    return d.donor_id === donor.donor_id;
  });
  return jsonResponse(true, 'রক্তদানের ইতিহাস লোড হয়েছে।', { donations: donations }, null);
}

function handleRequestDonorContact(auth, payload) {
  var user = requireRole(auth);
  var donor = findRecordByField('Donors', 'donor_id', payload.donor_id);
  if (!donor || donor.verification_status !== 'Approved') {
    return jsonResponse(false, 'অনুমোদিত ডোনার পাওয়া যায়নি।', null, 'NOT_FOUND');
  }
  var crId = generateId('CRQ');
  var cr = appendRecord('Contact_Requests', {
    contact_request_id: crId,
    request_id: sanitizeText(payload.request_id || ''),
    donor_id: donor.donor_id,
    requester_user_id: user.user_id,
    donor_consent: 'pending',
    contact_status: 'Pending',
    message: sanitizeText(payload.message || 'জরুরি রক্তের প্রয়োজনে যোগাযোগের অনুরোধ।'),
    created_at: nowIso(),
    responded_at: ''
  });
  createNotification(
    donor.user_id,
    'নতুন যোগাযোগের অনুরোধ',
    user.full_name + ' আপনার সাথে রক্তদানের জন্য যোগাযোগের অনুরোধ পাঠিয়েছেন।',
    'donor_contact_request',
    crId
  );
  return jsonResponse(true, 'ডোনারের কাছে যোগাযোগের অনুরোধ পাঠানো হয়েছে।', { contact_request: cr }, null);
}


// ===== RequestService.gs =====
/**
 * RequestService.gs — Blood Request & Emergency Workflow
 */
function handleCreateBloodRequest(auth, payload) {
  var userId = auth && auth.user ? auth.user.user_id : 'GUEST';
  var bg = String(payload.blood_group || '').toUpperCase();
  if (!isValidBloodGroup(bg)) {
    return jsonResponse(false, 'সঠিক রক্তের গ্রুপ নির্বাচন করুন।', null, 'VALIDATION_ERROR');
  }
  var patientName = sanitizeText(payload.patient_name);
  var requesterName = sanitizeText(payload.requester_name);
  var contactPhone = normalizePhone(payload.contact_phone);
  var hospitalName = sanitizeText(payload.hospital_name);
  if (!patientName || !requesterName || !isValidBdPhone(contactPhone) || !hospitalName) {
    return jsonResponse(false, 'রোগী, আবেদনকারী, হাসপাতাল এবং সঠিক মোবাইল নম্বর দিন।', null, 'VALIDATION_ERROR');
  }

  var ts = nowIso();
  var reqId = generateId('REQ');
  var req = appendRecord('Blood_Requests', {
    request_id: reqId,
    requester_user_id: userId,
    patient_name: patientName,
    requester_name: requesterName,
    blood_group: bg,
    units_required: String(Number(payload.units_required) || 1),
    hospital_name: hospitalName,
    hospital_address: sanitizeText(payload.hospital_address || ''),
    division: sanitizeText(payload.division || ''),
    district: sanitizeText(payload.district || ''),
    upazila: sanitizeText(payload.upazila || ''),
    required_date: sanitizeText(payload.required_date || ''),
    required_time: sanitizeText(payload.required_time || ''),
    urgency_level: ['Normal', 'Urgent', 'Emergency'].indexOf(payload.urgency_level) !== -1 ? payload.urgency_level : 'Urgent',
    contact_phone: contactPhone,
    patient_condition: sanitizeText(payload.patient_condition || ''),
    additional_notes: sanitizeText(payload.additional_notes || ''),
    admin_status: 'Pending',
    donor_found_count: '0',
    completed_units: '0',
    assigned_representative_id: '',
    created_at: ts,
    updated_at: ts,
    completed_at: ''
  });

  if (userId !== 'GUEST') {
    createNotification(userId, 'রক্তের অনুরোধ জমা হয়েছে', patientName + '-এর জন্য রক্তের অনুরোধ পর্যালোচনার জন্য জমা হয়েছে।', 'blood_request_submitted', reqId);
  }
  logActivity(userId, auth && auth.user ? auth.user.role : 'guest', 'CREATE_BLOOD_REQUEST', 'Blood_Requests', reqId, 'রক্তের অনুরোধ জমা');
  return jsonResponse(true, 'রক্তের অনুরোধ সফলভাবে জমা হয়েছে।', { request: req }, null);
}

function handleGetBloodRequests(auth, payload, e) {
  var params = payload || (e && e.parameter) || {};
  var list = readSheetRecords('Blood_Requests');
  var isStaff = auth && auth.user && ['admin', 'super_admin'].indexOf(auth.user.role) !== -1;

  var filtered = list.filter(function(r) {
    if (!isStaff && params.mine !== 'true') {
      var pubStatuses = ['Approved', 'Donor Matching', 'Donor Found', 'Partially Fulfilled'];
      if (pubStatuses.indexOf(r.admin_status) === -1) return false;
    }
    if (params.mine === 'true' && auth && auth.user && r.requester_user_id !== auth.user.user_id) return false;
    if (params.blood_group && r.blood_group !== params.blood_group) return false;
    if (params.urgency_level && r.urgency_level !== params.urgency_level) return false;
    if (params.division && r.division !== params.division) return false;
    if (params.district && r.district !== params.district) return false;
    return true;
  }).reverse();

  return jsonResponse(true, 'রক্তের অনুরোধের তালিকা লোড হয়েছে।', { requests: filtered }, null);
}

function handleGetBloodRequestDetails(payload, e) {
  var reqId = (payload && payload.request_id) || (e && e.parameter && e.parameter.request_id);
  var req = findRecordByField('Blood_Requests', 'request_id', reqId);
  if (!req) return jsonResponse(false, 'অনুরোধ খুঁজে পাওয়া যায়নি।', null, 'NOT_FOUND');
  return jsonResponse(true, 'রক্তের অনুরোধের বিস্তারিত লোড হয়েছে।', { request: req }, null);
}

function handleApproveBloodRequest(auth, payload) {
  var admin = requireRole(auth, ['admin', 'super_admin']);
  var updated = updateRecordByField('Blood_Requests', 'request_id', payload.request_id, {
    admin_status: 'Approved',
    updated_at: nowIso()
  });
  if (!updated) return jsonResponse(false, 'অনুরোধ পাওয়া যায়নি।', null, 'NOT_FOUND');
  if (updated.requester_user_id && updated.requester_user_id !== 'GUEST') {
    createNotification(updated.requester_user_id, 'রক্তের অনুরোধ অনুমোদিত', 'আপনার রক্তের অনুরোধটি অনুমোদিত ও প্রকাশিত হয়েছে।', 'blood_request_approved', updated.request_id);
  }
  logActivity(admin.user_id, admin.role, 'APPROVE_BLOOD_REQUEST', 'Blood_Requests', updated.request_id, 'রক্তের অনুরোধ অনুমোদন');
  return jsonResponse(true, 'রক্তের অনুরোধ অনুমোদন করা হয়েছে।', { request: updated }, null);
}

function handleRejectBloodRequest(auth, payload) {
  var admin = requireRole(auth, ['admin', 'super_admin']);
  var updated = updateRecordByField('Blood_Requests', 'request_id', payload.request_id, {
    admin_status: 'Rejected',
    updated_at: nowIso()
  });
  if (!updated) return jsonResponse(false, 'অনুরোধ পাওয়া যায়নি।', null, 'NOT_FOUND');
  logActivity(admin.user_id, admin.role, 'REJECT_BLOOD_REQUEST', 'Blood_Requests', updated.request_id, 'রক্তের অনুরোধ বাতিল');
  return jsonResponse(true, 'রক্তের অনুরোধ প্রত্যাখ্যান করা হয়েছে।', { request: updated }, null);
}

function handleUpdateBloodRequest(auth, payload) {
  var actor = requireRole(auth);
  var req = findRecordByField('Blood_Requests', 'request_id', payload.request_id);
  if (!req) return jsonResponse(false, 'অনুরোধ পাওয়া যায়নি।', null, 'NOT_FOUND');
  var isStaff = ['admin', 'super_admin'].indexOf(actor.role) !== -1;
  if (!isStaff && req.requester_user_id !== actor.user_id) {
    return jsonResponse(false, 'এই অনুরোধ পরিবর্তনের অনুমতি নেই।', null, 'FORBIDDEN');
  }
  var updates = { updated_at: nowIso() };
  if (payload.admin_status && isStaff) updates.admin_status = sanitizeText(payload.admin_status);
  if (payload.donor_found_count !== undefined && isStaff) updates.donor_found_count = String(payload.donor_found_count);
  if (payload.completed_units !== undefined && isStaff) updates.completed_units = String(payload.completed_units);
  var updated = updateRecordByField('Blood_Requests', 'request_id', req.request_id, updates);
  return jsonResponse(true, 'অনুরোধের অবস্থা হালনাগাদ হয়েছে।', { request: updated }, null);
}

function handleMatchDonors(auth, payload) {
  var actor = requireRole(auth, ['admin', 'super_admin', 'representative']);
  var req = findRecordByField('Blood_Requests', 'request_id', payload.request_id);
  if (!req) return jsonResponse(false, 'অনুরোধ পাওয়া যায়নি।', null, 'NOT_FOUND');
  if (actor.role === 'representative') {
    var scope = getRepresentativeScope(actor.user_id);
    if (!scope || !isRecordInRepresentativeArea(req, scope.assignments)) {
      return jsonResponse(false, 'আপনার নির্ধারিত এলাকার বাইরের অনুরোধে অ্যাক্সেস নেই।', null, 'AREA_FORBIDDEN');
    }
  }
  var updated = updateRecordByField('Blood_Requests', 'request_id', req.request_id, {
    admin_status: 'Donor Matching',
    donor_found_count: String((Number(req.donor_found_count) || 0) + 1),
    updated_at: nowIso()
  });
  return jsonResponse(true, 'ডোনার ম্যাচিং অবস্থা হালনাগাদ হয়েছে।', { request: updated }, null);
}

function handleCompleteBloodRequest(auth, payload) {
  var actor = requireRole(auth);
  var req = findRecordByField('Blood_Requests', 'request_id', payload.request_id);
  if (!req) return jsonResponse(false, 'অনুরোধ পাওয়া যায়নি।', null, 'NOT_FOUND');
  if (['admin', 'super_admin'].indexOf(actor.role) === -1 && req.requester_user_id !== actor.user_id) {
    return jsonResponse(false, 'অনুমতি নেই।', null, 'FORBIDDEN');
  }
  var updated = updateRecordByField('Blood_Requests', 'request_id', req.request_id, {
    admin_status: 'Completed',
    completed_at: nowIso(),
    updated_at: nowIso()
  });
  return jsonResponse(true, 'রক্তের অনুরোধ সম্পন্ন হিসেবে চিহ্নিত হয়েছে।', { request: updated }, null);
}

function handleCancelBloodRequest(auth, payload) {
  var actor = requireRole(auth);
  var req = findRecordByField('Blood_Requests', 'request_id', payload.request_id);
  if (!req) return jsonResponse(false, 'অনুরোধ পাওয়া যায়নি।', null, 'NOT_FOUND');
  if (['admin', 'super_admin'].indexOf(actor.role) === -1 && req.requester_user_id !== actor.user_id) {
    return jsonResponse(false, 'অনুমতি নেই।', null, 'FORBIDDEN');
  }
  var updated = updateRecordByField('Blood_Requests', 'request_id', req.request_id, {
    admin_status: 'Cancelled',
    updated_at: nowIso()
  });
  return jsonResponse(true, 'রক্তের অনুরোধ বাতিল করা হয়েছে।', { request: updated }, null);
}


// ===== DonationService.gs =====
/**
 * DonationService.gs — Donation History & Verification
 */
function handleCreateDonationRecord(auth, payload) {
  var user = requireRole(auth);
  var donor = findRecordByField('Donors', 'user_id', user.user_id);
  if (!donor) return jsonResponse(false, 'শুধুমাত্র নিবন্ধিত ডোনার রক্তদানের তথ্য জমা দিতে পারবেন।', null, 'NOT_DONOR');
  var donId = generateId('DON');
  var donation = appendRecord('Donations', {
    donation_id: donId,
    donor_id: donor.donor_id,
    request_id: sanitizeText(payload.request_id || ''),
    recipient_user_id: sanitizeText(payload.recipient_user_id || ''),
    donation_date: sanitizeText(payload.donation_date),
    hospital_name: sanitizeText(payload.hospital_name),
    blood_group: donor.blood_group,
    verification_status: 'Pending Verification',
    verified_by: '',
    verified_at: '',
    notes: sanitizeText(payload.notes || ''),
    created_at: nowIso()
  });
  return jsonResponse(true, 'রক্তদানের রেকর্ড যাচাইয়ের জন্য জমা হয়েছে।', { donation: donation }, null);
}

function handleVerifyDonationRecord(auth, payload) {
  var admin = requireRole(auth, ['admin', 'super_admin']);
  var status = payload.status === 'Rejected' ? 'Rejected' : 'Verified';
  var updated = updateRecordByField('Donations', 'donation_id', payload.donation_id, {
    verification_status: status,
    verified_by: admin.user_id,
    verified_at: nowIso()
  });
  if (!updated) return jsonResponse(false, 'রেকর্ড পাওয়া যায়নি।', null, 'NOT_FOUND');
  if (status === 'Verified') {
    updateRecordByField('Donors', 'donor_id', updated.donor_id, {
      last_donation_date: updated.donation_date,
      updated_at: nowIso()
    });
  }
  logActivity(admin.user_id, admin.role, 'VERIFY_DONATION', 'Donations', updated.donation_id, 'রক্তদান যাচাই: ' + status);
  return jsonResponse(true, 'রক্তদানের রেকর্ড হালনাগাদ হয়েছে।', { donation: updated }, null);
}

function handleGetDonationHistory(auth, payload) {
  var user = requireRole(auth);
  var all = readSheetRecords('Donations');
  if (['admin', 'super_admin'].indexOf(user.role) !== -1) {
    return jsonResponse(true, 'সকল রক্তদানের ইতিহাস লোড হয়েছে।', { donations: all.reverse() }, null);
  }
  var donor = findRecordByField('Donors', 'user_id', user.user_id);
  var mine = donor ? all.filter(function(d) { return d.donor_id === donor.donor_id; }) : [];
  return jsonResponse(true, 'আপনার রক্তদানের ইতিহাস লোড হয়েছে।', { donations: mine.reverse() }, null);
}


// ===== AdminService.gs =====
/**
 * AdminService.gs — Donor Verification, Analytics, Settings & Logs
 */
function handleGetAdminDashboard(auth) {
  requireRole(auth, ['admin', 'super_admin']);
  var donors = readSheetRecords('Donors');
  var requests = readSheetRecords('Blood_Requests');
  var donations = readSheetRecords('Donations');
  var campaigns = readSheetRecords('Campaigns');
  var volunteers = readSheetRecords('Volunteers');
  var reps = readSheetRecords('Representatives');

  return jsonResponse(true, 'অ্যাডমিন ড্যাশবোর্ড লোড হয়েছে।', {
    stats: {
      total_donors: donors.length,
      approved_donors: donors.filter(function(d) { return d.verification_status === 'Approved'; }).length,
      pending_donors: donors.filter(function(d) { return d.verification_status === 'Pending Verification'; }).length,
      rejected_donors: donors.filter(function(d) { return d.verification_status === 'Rejected'; }).length,
      total_requests: requests.length,
      emergency_requests: requests.filter(function(r) { return r.urgency_level === 'Emergency'; }).length,
      completed_requests: requests.filter(function(r) { return r.admin_status === 'Completed'; }).length,
      total_donations: donations.length,
      total_campaigns: campaigns.length,
      total_volunteers: volunteers.length,
      total_representatives: reps.length
    }
  }, null);
}

function handleGetPendingDonors(auth) {
  requireRole(auth, ['admin', 'super_admin']);
  var users = readSheetRecords('Users');
  var userMap = {};
  for (var i = 0; i < users.length; i++) userMap[users[i].user_id] = users[i];
  var donors = readSheetRecords('Donors').map(function(d) {
    var u = userMap[d.user_id] || {};
    return Object.assign({}, d, { full_name: u.full_name || '', phone: u.phone || '', email: u.email || '' });
  });
  return jsonResponse(true, 'ডোনারদের যাচাই তালিকা লোড হয়েছে।', { donors: donors }, null);
}

function setDonorVerificationDecision(auth, donorId, newStatus, resultLabel, notes) {
  var admin = requireRole(auth, ['admin', 'super_admin']);
  var donor = findRecordByField('Donors', 'donor_id', donorId);
  if (!donor) return jsonResponse(false, 'ডোনার পাওয়া যায়নি।', null, 'NOT_FOUND');

  appendRecord('Verifications', {
    verification_id: generateId('VRF'),
    donor_id: donor.donor_id,
    admin_id: admin.user_id,
    representative_id: '',
    verification_type: 'admin_decision',
    verification_result: resultLabel,
    verification_notes: sanitizeText(notes || ''),
    verified_phone: 'true',
    verified_blood_group: 'true',
    verification_date: nowIso(),
    previous_status: donor.verification_status,
    new_status: newStatus
  });

  var updated = updateRecordByField('Donors', 'donor_id', donor.donor_id, {
    verification_status: newStatus,
    updated_at: nowIso()
  });

  var notifMap = {
    'Approved': ['অ্যাকাউন্ট অনুমোদিত হয়েছে', 'অভিনন্দন! আপনার ডোনার প্রোফাইল অনুমোদিত হয়েছে এবং এখন ডিরেক্টরিতে দৃশ্যমান।', 'account_approved'],
    'Rejected': ['আবেদন প্রত্যাখ্যাত হয়েছে', 'দুঃখিত, যাচাইকরণের পর আপনার ডোনার আবেদনটি গৃহীত হয়নি।', 'account_rejected'],
    'Correction Required': ['তথ্য সংশোধন প্রয়োজন', 'অনুগ্রহ করে আপনার ডোনার প্রোফাইলের তথ্য সংশোধন করুন: ' + sanitizeText(notes || ''), 'correction_required'],
    'Suspended': ['প্রোফাইল স্থগিত', 'প্রশাসনিক কারণে আপনার ডোনার প্রোফাইল স্থগিত করা হয়েছে।', 'account_suspended']
  };
  var n = notifMap[newStatus];
  if (n) createNotification(donor.user_id, n[0], n[1], n[2], donor.donor_id);
  logActivity(admin.user_id, admin.role, 'DONOR_VERIFICATION_' + newStatus.toUpperCase(), 'Donors', donor.donor_id, resultLabel);
  return jsonResponse(true, 'ডোনারের যাচাই অবস্থা "' + newStatus + '" হিসেবে সংরক্ষিত হয়েছে।', { donor: updated }, null);
}

function handleApproveDonor(auth, payload) {
  return setDonorVerificationDecision(auth, payload.donor_id, 'Approved', 'অনুমোদিত', payload.notes);
}

function handleRejectDonor(auth, payload) {
  return setDonorVerificationDecision(auth, payload.donor_id, 'Rejected', 'প্রত্যাখ্যাত', payload.notes);
}

function handleRequestDonorCorrection(auth, payload) {
  return setDonorVerificationDecision(auth, payload.donor_id, 'Correction Required', 'সংশোধন প্রয়োজন', payload.notes);
}

function handleSuspendDonor(auth, payload) {
  return setDonorVerificationDecision(auth, payload.donor_id, 'Suspended', 'স্থগিত', payload.notes);
}

function handleGetPublicSettings() {
  var rows = readSheetRecords('Settings');
  var out = {};
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].setting_group !== 'security') {
      out[rows[i].setting_key] = rows[i].setting_value;
    }
  }
  return jsonResponse(true, 'পাবলিক সেটিংস লোড হয়েছে।', { settings: out }, null);
}

function handleGetSystemSettings(auth) {
  requireRole(auth, ['admin', 'super_admin']);
  return jsonResponse(true, 'সিস্টেম সেটিংস লোড হয়েছে।', { settings: readSheetRecords('Settings') }, null);
}

function handleUpdateWebsiteSettings(auth, payload) {
  var admin = requireRole(auth, ['admin', 'super_admin']);
  var updates = payload.settings || {};
  var keys = Object.keys(updates);
  for (var i = 0; i < keys.length; i++) {
    updateRecordByField('Settings', 'setting_key', keys[i], {
      setting_value: sanitizeText(updates[keys[i]]),
      updated_by: admin.user_id,
      updated_at: nowIso()
    });
  }
  logActivity(admin.user_id, admin.role, 'UPDATE_SETTINGS', 'Settings', 'website', 'সেটিংস পরিবর্তন');
  return jsonResponse(true, 'ওয়েবসাইট সেটিংস সংরক্ষিত হয়েছে।', null, null);
}


// ===== RepresentativeService.gs =====
/**
 * RepresentativeService.gs — Area Representative Management & Strict Backend Area ACL
 */
function handleCreateRepresentative(auth, payload) {
  var admin = requireRole(auth, ['admin', 'super_admin']);
  var user = findRecordByField('Users', 'user_id', payload.user_id);
  if (!user) return jsonResponse(false, 'ব্যবহারকারী পাওয়া যায়নি।', null, 'NOT_FOUND');
  var ts = nowIso();
  var repId = generateId('REP');
  var rep = appendRecord('Representatives', {
    representative_id: repId,
    user_id: user.user_id,
    representative_code: 'RB-REP-' + repId.slice(-5),
    full_name: user.full_name,
    phone: user.phone,
    email: user.email,
    profile_image: user.profile_image,
    appointment_date: ts,
    status: 'active',
    assigned_by: admin.user_id,
    created_at: ts,
    updated_at: ts
  });
  updateRecordByField('Users', 'user_id', user.user_id, { role: 'representative', updated_at: ts });
  appendRecord('Representative_Permissions', {
    permission_id: generateId('PRM'),
    representative_id: repId,
    can_view_donors: 'true',
    can_verify_donors: 'true',
    can_recommend_approval: 'true',
    can_recommend_rejection: 'true',
    can_view_requests: 'true',
    can_manage_local_requests: 'true',
    can_manage_campaigns: 'false',
    can_view_reports: 'true',
    granted_by: admin.user_id,
    updated_at: ts
  });
  createNotification(user.user_id, 'এলাকা প্রতিনিধি হিসেবে নিয়োগ', 'আপনাকে রক্তবন্ধন-এর এলাকা প্রতিনিধি হিসেবে নিয়োগ দেওয়া হয়েছে।', 'representative_assigned', repId);
  logActivity(admin.user_id, admin.role, 'CREATE_REPRESENTATIVE', 'Representatives', repId, 'নতুন প্রতিনিধি নিয়োগ');
  return jsonResponse(true, 'এলাকা প্রতিনিধি নিয়োগ সম্পন্ন হয়েছে।', { representative: rep }, null);
}

function handleUpdateRepresentative(auth, payload) {
  var admin = requireRole(auth, ['admin', 'super_admin']);
  var updated = updateRecordByField('Representatives', 'representative_id', payload.representative_id, {
    status: sanitizeText(payload.status || 'active'),
    updated_at: nowIso()
  });
  if (!updated) return jsonResponse(false, 'প্রতিনিধি পাওয়া যায়নি।', null, 'NOT_FOUND');
  logActivity(admin.user_id, admin.role, 'UPDATE_REPRESENTATIVE', 'Representatives', updated.representative_id, 'প্রতিনিধির অবস্থা পরিবর্তন');
  return jsonResponse(true, 'প্রতিনিধির তথ্য হালনাগাদ হয়েছে।', { representative: updated }, null);
}

function handleAssignRepresentativeArea(auth, payload) {
  var admin = requireRole(auth, ['admin', 'super_admin']);
  var rep = findRecordByField('Representatives', 'representative_id', payload.representative_id);
  if (!rep) return jsonResponse(false, 'প্রতিনিধি পাওয়া যায়নি।', null, 'NOT_FOUND');
  var assignmentId = generateId('ASN');
  var assignment = appendRecord('Representative_Assignments', {
    assignment_id: assignmentId,
    representative_id: rep.representative_id,
    assignment_level: sanitizeText(payload.assignment_level || 'district'),
    division: sanitizeText(payload.division || ''),
    district: sanitizeText(payload.district || ''),
    upazila: sanitizeText(payload.upazila || ''),
    union_name: sanitizeText(payload.union_name || ''),
    ward_name: sanitizeText(payload.ward_name || ''),
    area: sanitizeText(payload.area || ''),
    assigned_by: admin.user_id,
    assigned_at: nowIso(),
    status: 'active',
    permission_level: sanitizeText(payload.permission_level || 'standard'),
    notes: sanitizeText(payload.notes || '')
  });
  logActivity(admin.user_id, admin.role, 'ASSIGN_AREA', 'Representative_Assignments', assignmentId, 'প্রতিনিধিকে এলাকা বরাদ্দ');
  return jsonResponse(true, 'প্রতিনিধিকে এলাকা বরাদ্দ দেওয়া হয়েছে।', { assignment: assignment }, null);
}

function handleRemoveRepresentativeAssignment(auth, payload) {
  var admin = requireRole(auth, ['admin', 'super_admin']);
  var updated = updateRecordByField('Representative_Assignments', 'assignment_id', payload.assignment_id, {
    status: 'removed'
  });
  if (!updated) return jsonResponse(false, 'অ্যাসাইনমেন্ট পাওয়া যায়নি।', null, 'NOT_FOUND');
  logActivity(admin.user_id, admin.role, 'REMOVE_AREA', 'Representative_Assignments', payload.assignment_id, 'এলাকা বরাদ্দ বাতিল');
  return jsonResponse(true, 'এলাকা বরাদ্দ বাতিল করা হয়েছে।', null, null);
}

function handleUpdateRepresentativePermissions(auth, payload) {
  var admin = requireRole(auth, ['super_admin']);
  var updated = updateRecordByField('Representative_Permissions', 'representative_id', payload.representative_id, {
    can_view_donors: String(payload.can_view_donors !== false),
    can_verify_donors: String(payload.can_verify_donors !== false),
    can_recommend_approval: String(payload.can_recommend_approval !== false),
    can_recommend_rejection: String(payload.can_recommend_rejection !== false),
    can_view_requests: String(payload.can_view_requests !== false),
    can_manage_local_requests: String(payload.can_manage_local_requests !== false),
    can_manage_campaigns: String(payload.can_manage_campaigns === true),
    can_view_reports: String(payload.can_view_reports !== false),
    granted_by: admin.user_id,
    updated_at: nowIso()
  });
  logActivity(admin.user_id, admin.role, 'UPDATE_REP_PERMISSIONS', 'Representative_Permissions', payload.representative_id, 'প্রতিনিধির অনুমতি হালনাগাদ');
  return jsonResponse(true, 'প্রতিনিধির অনুমতি হালনাগাদ হয়েছে।', { permissions: updated }, null);
}

function handleGetRepresentativeDashboard(auth) {
  var user = requireRole(auth, ['representative']);
  var scope = getRepresentativeScope(user.user_id);
  if (!scope) return jsonResponse(false, 'সক্রিয় প্রতিনিধি প্রোফাইল পাওয়া যায়নি।', null, 'FORBIDDEN');
  var donors = readSheetRecords('Donors').filter(function(d) {
    return isRecordInRepresentativeArea(d, scope.assignments);
  });
  var requests = readSheetRecords('Blood_Requests').filter(function(r) {
    return isRecordInRepresentativeArea(r, scope.assignments);
  });
  var tasks = readSheetRecords('Representative_Tasks').filter(function(t) {
    return t.representative_id === scope.rep.representative_id;
  });
  return jsonResponse(true, 'প্রতিনিধি ড্যাশবোর্ড লোড হয়েছে।', {
    representative: scope.rep,
    assignments: scope.assignments,
    permissions: scope.permissions,
    stats: {
      total_assigned_areas: scope.assignments.length,
      pending_donors: donors.filter(function(d) { return d.verification_status === 'Pending Verification'; }).length,
      verified_donors: donors.filter(function(d) { return d.verification_status === 'Approved'; }).length,
      pending_requests: requests.filter(function(r) { return r.admin_status === 'Pending'; }).length,
      emergency_requests: requests.filter(function(r) { return r.urgency_level === 'Emergency'; }).length,
      completed_tasks: tasks.filter(function(t) { return t.task_status === 'Completed'; }).length
    }
  }, null);
}

function handleGetAssignedAreaDonors(auth) {
  var user = requireRole(auth, ['representative']);
  var scope = getRepresentativeScope(user.user_id);
  if (!scope) return jsonResponse(false, 'প্রতিনিধি অ্যাক্সেস নেই।', null, 'FORBIDDEN');
  var users = readSheetRecords('Users');
  var userMap = {};
  for (var i = 0; i < users.length; i++) userMap[users[i].user_id] = users[i];
  var donors = readSheetRecords('Donors').filter(function(d) {
    return isRecordInRepresentativeArea(d, scope.assignments);
  }).map(function(d) {
    var u = userMap[d.user_id] || {};
    return Object.assign({}, d, { full_name: u.full_name || '', phone: u.phone || '', email: u.email || '' });
  });
  return jsonResponse(true, 'নির্ধারিত এলাকার ডোনার তালিকা লোড হয়েছে।', { donors: donors }, null);
}

function handleGetAssignedAreaRequests(auth) {
  var user = requireRole(auth, ['representative']);
  var scope = getRepresentativeScope(user.user_id);
  if (!scope) return jsonResponse(false, 'প্রতিনিধি অ্যাক্সেস নেই।', null, 'FORBIDDEN');
  var requests = readSheetRecords('Blood_Requests').filter(function(r) {
    return isRecordInRepresentativeArea(r, scope.assignments);
  });
  return jsonResponse(true, 'নির্ধারিত এলাকার রক্তের অনুরোধ লোড হয়েছে।', { requests: requests }, null);
}

function handleSubmitVerification(auth, payload) {
  var user = requireRole(auth, ['representative']);
  var scope = getRepresentativeScope(user.user_id);
  if (!scope) return jsonResponse(false, 'প্রতিনিধি অ্যাক্সেস নেই।', null, 'FORBIDDEN');
  var donor = findRecordByField('Donors', 'donor_id', payload.donor_id);
  if (!donor) return jsonResponse(false, 'ডোনার পাওয়া যায়নি।', null, 'NOT_FOUND');
  if (!isRecordInRepresentativeArea(donor, scope.assignments)) {
    return jsonResponse(false, 'আপনার নির্ধারিত এলাকার বাইরের ডোনার যাচাই করার অনুমতি নেই।', null, 'AREA_FORBIDDEN');
  }
  // Strict rule: Representatives only submit recommendations (Phone Contacted / Under Review), NOT final Approved
  var newStatus = payload.recommendation === 'reject' ? 'Under Review' : 'Phone Contacted';
  appendRecord('Verifications', {
    verification_id: generateId('VRF'),
    donor_id: donor.donor_id,
    admin_id: '',
    representative_id: scope.rep.representative_id,
    verification_type: sanitizeText(payload.verification_type || 'phone_verification'),
    verification_result: sanitizeText(payload.verification_result || 'তথ্য সঠিক'),
    verification_notes: sanitizeText(payload.verification_notes || ''),
    verified_phone: String(payload.verified_phone === true),
    verified_blood_group: String(payload.verified_blood_group === true),
    verification_date: nowIso(),
    previous_status: donor.verification_status,
    new_status: newStatus
  });
  updateRecordByField('Donors', 'donor_id', donor.donor_id, {
    verification_status: newStatus,
    updated_at: nowIso()
  });
  logActivity(user.user_id, 'representative', 'REP_VERIFY_RECOMMENDATION', 'Verifications', donor.donor_id, 'প্রতিনিধি যাচাই সুপারিশ জমা');
  return jsonResponse(true, 'যাচাইকরণ নোট ও সুপারিশ অ্যাডমিনের কাছে পাঠানো হয়েছে।', null, null);
}

function handleSubmitRepresentativeReport(auth, payload) {
  var user = requireRole(auth, ['representative']);
  var scope = getRepresentativeScope(user.user_id);
  if (!scope) return jsonResponse(false, 'প্রতিনিধি অ্যাক্সেস নেই।', null, 'FORBIDDEN');
  var reportId = generateId('RPT');
  var report = appendRecord('Representative_Reports', {
    report_id: reportId,
    representative_id: scope.rep.representative_id,
    report_title: sanitizeText(payload.report_title),
    report_content: sanitizeText(payload.report_content),
    report_type: sanitizeText(payload.report_type || 'activity'),
    related_area: sanitizeText(payload.related_area || ''),
    submitted_at: nowIso(),
    reviewed_by: '',
    review_status: 'Pending',
    admin_notes: ''
  });
  return jsonResponse(true, 'প্রতিবেদন সফলভাবে জমা হয়েছে।', { report: report }, null);
}

function handleGetRepresentativeTasks(auth) {
  var user = requireRole(auth, ['representative']);
  var scope = getRepresentativeScope(user.user_id);
  if (!scope) return jsonResponse(false, 'প্রতিনিধি অ্যাক্সেস নেই।', null, 'FORBIDDEN');
  var tasks = readSheetRecords('Representative_Tasks').filter(function(t) {
    return t.representative_id === scope.rep.representative_id;
  });
  return jsonResponse(true, 'দায়িত্বসমূহ লোড হয়েছে।', { tasks: tasks }, null);
}


// ===== CampaignService.gs =====
/**
 * CampaignService.gs — Blood Donation Campaign Management
 */
function handleCreateCampaign(auth, payload) {
  var admin = requireRole(auth, ['admin', 'super_admin', 'representative']);
  var cid = generateId('CMP');
  var campaign = appendRecord('Campaigns', {
    campaign_id: cid,
    campaign_title: sanitizeText(payload.campaign_title),
    campaign_description: sanitizeText(payload.campaign_description || ''),
    banner_url: sanitizeText(payload.banner_url || ''),
    event_date: sanitizeText(payload.event_date || ''),
    start_time: sanitizeText(payload.start_time || ''),
    end_time: sanitizeText(payload.end_time || ''),
    venue: sanitizeText(payload.venue || ''),
    division: sanitizeText(payload.division || ''),
    district: sanitizeText(payload.district || ''),
    upazila: sanitizeText(payload.upazila || ''),
    organizer: sanitizeText(payload.organizer || 'রক্তবন্ধন'),
    registration_limit: String(Number(payload.registration_limit) || 100),
    campaign_status: sanitizeText(payload.campaign_status || 'Upcoming'),
    created_at: nowIso()
  });
  logActivity(admin.user_id, admin.role, 'CREATE_CAMPAIGN', 'Campaigns', cid, 'নতুন ক্যাম্পেইন তৈরি');
  return jsonResponse(true, 'ক্যাম্পেইন সফলভাবে তৈরি হয়েছে।', { campaign: campaign }, null);
}

function handleUpdateCampaign(auth, payload) {
  var admin = requireRole(auth, ['admin', 'super_admin', 'representative']);
  var updated = updateRecordByField('Campaigns', 'campaign_id', payload.campaign_id, {
    campaign_title: sanitizeText(payload.campaign_title),
    campaign_description: sanitizeText(payload.campaign_description),
    venue: sanitizeText(payload.venue),
    event_date: sanitizeText(payload.event_date),
    campaign_status: sanitizeText(payload.campaign_status)
  });
  if (!updated) return jsonResponse(false, 'ক্যাম্পেইন পাওয়া যায়নি।', null, 'NOT_FOUND');
  logActivity(admin.user_id, admin.role, 'UPDATE_CAMPAIGN', 'Campaigns', payload.campaign_id, 'ক্যাম্পেইন হালনাগাদ');
  return jsonResponse(true, 'ক্যাম্পেইন হালনাগাদ হয়েছে।', { campaign: updated }, null);
}

function handleGetCampaigns() {
  var campaigns = readSheetRecords('Campaigns').reverse();
  var regs = readSheetRecords('Campaign_Registrations');
  var enriched = campaigns.map(function(c) {
    var count = regs.filter(function(r) { return r.campaign_id === c.campaign_id; }).length;
    return Object.assign({}, c, { registered_count: count });
  });
  return jsonResponse(true, 'ক্যাম্পেইন তালিকা লোড হয়েছে।', { campaigns: enriched }, null);
}

function handleRegisterCampaign(auth, payload) {
  var user = requireRole(auth);
  var campaign = findRecordByField('Campaigns', 'campaign_id', payload.campaign_id);
  if (!campaign) return jsonResponse(false, 'ক্যাম্পেইন পাওয়া যায়নি।', null, 'NOT_FOUND');
  var regs = readSheetRecords('Campaign_Registrations');
  var dup = regs.filter(function(r) { return r.campaign_id === campaign.campaign_id && r.user_id === user.user_id; });
  if (dup.length > 0) return jsonResponse(false, 'আপনি ইতিমধ্যেই এই ক্যাম্পেইনে নিবন্ধন করেছেন।', null, 'DUPLICATE');
  var regId = generateId('CRG');
  var reg = appendRecord('Campaign_Registrations', {
    registration_id: regId,
    campaign_id: campaign.campaign_id,
    user_id: user.user_id,
    participant_type: sanitizeText(payload.participant_type || user.role),
    registration_status: 'Confirmed',
    attendance_status: 'Pending',
    registered_at: nowIso()
  });
  return jsonResponse(true, 'ক্যাম্পেইনে নিবন্ধন সফল হয়েছে।', { registration: reg }, null);
}

function handleUpdateCampaignStatus(auth, payload) {
  var admin = requireRole(auth, ['admin', 'super_admin']);
  var updated = updateRecordByField('Campaigns', 'campaign_id', payload.campaign_id, {
    campaign_status: sanitizeText(payload.campaign_status)
  });
  return jsonResponse(true, 'ক্যাম্পেইনের অবস্থা হালনাগাদ হয়েছে।', { campaign: updated }, null);
}


// ===== NotificationService.gs =====
/**
 * NotificationService.gs — Notification Management (No OTP)
 */
function createNotification(userId, title, message, type, referenceId) {
  return appendRecord('Notifications', {
    notification_id: generateId('NTF'),
    user_id: userId,
    title: sanitizeText(title),
    message: sanitizeText(message),
    notification_type: type || 'system',
    reference_id: referenceId || '',
    is_read: 'false',
    created_at: nowIso()
  });
}

function handleGetNotifications(auth) {
  var user = requireRole(auth);
  var list = readSheetRecords('Notifications').filter(function(n) {
    return n.user_id === user.user_id;
  }).reverse();
  return jsonResponse(true, 'নোটিফিকেশন লোড হয়েছে।', { notifications: list }, null);
}

function handleMarkNotificationRead(auth, payload) {
  var user = requireRole(auth);
  var ntf = findRecordByField('Notifications', 'notification_id', payload.notification_id);
  if (!ntf || ntf.user_id !== user.user_id) {
    return jsonResponse(false, 'নোটিফিকেশন পাওয়া যায়নি।', null, 'NOT_FOUND');
  }
  updateRecordByField('Notifications', 'notification_id', ntf.notification_id, { is_read: 'true' });
  return jsonResponse(true, 'নোটিফিকেশন পড়া হয়েছে হিসেবে চিহ্নিত।', null, null);
}

function handleMarkAllNotificationsRead(auth) {
  var user = requireRole(auth);
  var list = readSheetRecords('Notifications').filter(function(n) {
    return n.user_id === user.user_id && n.is_read !== 'true';
  });
  for (var i = 0; i < list.length; i++) {
    updateRecordByField('Notifications', 'notification_id', list[i].notification_id, { is_read: 'true' });
  }
  return jsonResponse(true, 'সব নোটিফিকেশন পড়া হয়েছে হিসেবে চিহ্নিত করা হয়েছে।', null, null);
}


// ===== UserService.gs =====
/**
 * UserService.gs — User Management for Admins & Super Admins
 */
function handleGetAllUsers(auth) {
  requireRole(auth, ['admin', 'super_admin']);
  var users = readSheetRecords('Users').map(function(u) {
    return {
      user_id: u.user_id,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      account_status: u.account_status,
      created_at: u.created_at,
      last_login: u.last_login
    };
  });
  return jsonResponse(true, 'ব্যবহারকারীদের তালিকা লোড হয়েছে।', { users: users }, null);
}

function handleUpdateUser(auth, payload) {
  var admin = requireRole(auth, ['admin', 'super_admin']);
  var target = findRecordByField('Users', 'user_id', payload.user_id);
  if (!target) {
    return jsonResponse(false, 'ব্যবহারকারী পাওয়া যায়নি।', null, 'NOT_FOUND');
  }
  if (payload.role === 'super_admin' && admin.role !== 'super_admin') {
    return jsonResponse(false, 'শুধুমাত্র সুপার অ্যাডমিন এই রোল পরিবর্তন করতে পারবেন।', null, 'FORBIDDEN');
  }
  var updates = { updated_at: nowIso() };
  if (payload.account_status) updates.account_status = sanitizeText(payload.account_status);
  if (payload.role && admin.role === 'super_admin') updates.role = sanitizeText(payload.role);
  if (payload.full_name) updates.full_name = sanitizeText(payload.full_name);

  var updated = updateRecordByField('Users', 'user_id', target.user_id, updates);
  logActivity(admin.user_id, admin.role, 'UPDATE_USER', 'Users', target.user_id, 'ব্যবহারকারীর তথ্য/অবস্থা হালনাগাদ');
  return jsonResponse(true, 'ব্যবহারকারীর তথ্য হালনাগাদ হয়েছে।', { user: updated }, null);
}


// ===== Code.gs =====
/**
 * Code.gs — Unified Google Apps Script API Router (doGet / doPost)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'health';
  try {
    if (action === 'health') {
      return jsonResponse(true, 'রক্তবন্ধন API সক্রিয় আছে।', { version: '1.1.0' }, null);
    }
    if (action === 'pullAll') {
      return handlePullAllTables();
    }
    if (action === 'setupDatabase') {
      return jsonResponse(true, 'ডাটাবেজ প্রস্তুত।', setupRoktoBondhonDatabase(), null);
    }
    var auth = authenticateRequest(null, e);
    switch (action) {
      case 'searchDonors':
        return handleSearchDonors(null, e);
      case 'getDonorById':
        return handleGetDonorById(null, e);
      case 'getBloodRequests':
        return handleGetBloodRequests(auth, null, e);
      case 'getBloodRequestDetails':
        return handleGetBloodRequestDetails(null, e);
      case 'getCampaigns':
        return handleGetCampaigns();
      case 'getPublicSettings':
        return handleGetPublicSettings();
      case 'getCurrentUser':
        return handleGetCurrentUser(auth);
      case 'getDonorProfile':
        return handleGetDonorProfile(auth);
      case 'getDonorHistory':
        return handleGetDonorHistory(auth);
      case 'getAdminDashboard':
        return handleGetAdminDashboard(auth);
      case 'getPendingDonors':
        return handleGetPendingDonors(auth);
      case 'getAllUsers':
        return handleGetAllUsers(auth);
      case 'getRepresentativeDashboard':
        return handleGetRepresentativeDashboard(auth);
      case 'getAssignedAreaDonors':
        return handleGetAssignedAreaDonors(auth);
      case 'getAssignedAreaRequests':
        return handleGetAssignedAreaRequests(auth);
      case 'getRepresentativeTasks':
        return handleGetRepresentativeTasks(auth);
      case 'getDonationHistory':
        return handleGetDonationHistory(auth, null);
      case 'getNotifications':
        return handleGetNotifications(auth);
      case 'getSystemSettings':
        return handleGetSystemSettings(auth);
      default:
        return jsonResponse(false, 'অজানা API অ্যাকশন: ' + action, null, 'UNKNOWN_ACTION');
    }
  } catch (err) {
    logSystemEvent('ERROR', action, 'API_GET_ERROR', err.message, '');
    return jsonResponse(false, err.message || 'সার্ভার ত্রুটি ঘটেছে।', null, 'SERVER_ERROR');
  }
}

function doPost(e) {
  var payload = parseBody(e);
  var action = payload.action || (e && e.parameter && e.parameter.action) || '';
  try {
    // SERVER-TO-SHEET SYNC ENGINE ACTIONS
    if (action === 'health') {
      return jsonResponse(true, 'রক্তবন্ধন API সক্রিয় আছে।', { version: '1.1.0' }, null);
    }
    if (action === 'pullAll') {
      return handlePullAllTables();
    }
    if (action === 'findUser') {
      return handleFindUserForLogin(payload);
    }
    if (action === 'upsertBatch') {
      return handleUpsertBatch(payload);
    }
    if (action === 'setupDatabase') {
      return jsonResponse(true, 'ডাটাবেজ প্রস্তুত।', setupRoktoBondhonDatabase(), null);
    }

    var auth = authenticateRequest(payload, e);
    switch (action) {
      // AUTH
      case 'registerUser': return handleRegisterUser(payload);
      case 'loginUser': return handleLoginUser(payload);
      case 'logoutUser': return handleLogoutUser(auth);
      case 'getCurrentUser': return handleGetCurrentUser(auth);
      case 'changePassword': return handleChangePassword(auth, payload);
      case 'requestPasswordReset': return handleRequestPasswordReset(payload);
      case 'completeAdminPasswordReset': return handleCompleteAdminPasswordReset(auth, payload);
      // DONOR
      case 'createDonor': return handleCreateDonor(auth, payload);
      case 'getDonorProfile': return handleGetDonorProfile(auth);
      case 'updateDonorProfile': return handleUpdateDonorProfile(auth, payload);
      case 'searchDonors': return handleSearchDonors(payload, e);
      case 'getDonorById': return handleGetDonorById(payload, e);
      case 'updateAvailability': return handleUpdateAvailability(auth, payload);
      case 'getDonorHistory': return handleGetDonorHistory(auth);
      case 'requestDonorContact': return handleRequestDonorContact(auth, payload);
      // ADMIN
      case 'getAdminDashboard': return handleGetAdminDashboard(auth);
      case 'getPendingDonors': return handleGetPendingDonors(auth);
      case 'approveDonor': return handleApproveDonor(auth, payload);
      case 'rejectDonor': return handleRejectDonor(auth, payload);
      case 'requestDonorCorrection': return handleRequestDonorCorrection(auth, payload);
      case 'suspendDonor': return handleSuspendDonor(auth, payload);
      case 'getAllUsers': return handleGetAllUsers(auth);
      case 'updateUser': return handleUpdateUser(auth, payload);
      // REPRESENTATIVE
      case 'createRepresentative': return handleCreateRepresentative(auth, payload);
      case 'updateRepresentative': return handleUpdateRepresentative(auth, payload);
      case 'assignRepresentativeArea': return handleAssignRepresentativeArea(auth, payload);
      case 'removeRepresentativeAssignment': return handleRemoveRepresentativeAssignment(auth, payload);
      case 'updateRepresentativePermissions': return handleUpdateRepresentativePermissions(auth, payload);
      case 'getRepresentativeDashboard': return handleGetRepresentativeDashboard(auth);
      case 'getAssignedAreaDonors': return handleGetAssignedAreaDonors(auth);
      case 'getAssignedAreaRequests': return handleGetAssignedAreaRequests(auth);
      case 'submitVerification': return handleSubmitVerification(auth, payload);
      case 'submitRepresentativeReport': return handleSubmitRepresentativeReport(auth, payload);
      case 'getRepresentativeTasks': return handleGetRepresentativeTasks(auth);
      // BLOOD REQUEST
      case 'createBloodRequest': return handleCreateBloodRequest(auth, payload);
      case 'getBloodRequests': return handleGetBloodRequests(auth, payload, e);
      case 'getBloodRequestDetails': return handleGetBloodRequestDetails(payload, e);
      case 'approveBloodRequest': return handleApproveBloodRequest(auth, payload);
      case 'rejectBloodRequest': return handleRejectBloodRequest(auth, payload);
      case 'updateBloodRequest': return handleUpdateBloodRequest(auth, payload);
      case 'matchDonors': return handleMatchDonors(auth, payload);
      case 'completeBloodRequest': return handleCompleteBloodRequest(auth, payload);
      case 'cancelBloodRequest': return handleCancelBloodRequest(auth, payload);
      // DONATION
      case 'createDonationRecord': return handleCreateDonationRecord(auth, payload);
      case 'verifyDonationRecord': return handleVerifyDonationRecord(auth, payload);
      case 'getDonationHistory': return handleGetDonationHistory(auth, payload);
      // NOTIFICATION
      case 'getNotifications': return handleGetNotifications(auth);
      case 'markNotificationRead': return handleMarkNotificationRead(auth, payload);
      case 'markAllNotificationsRead': return handleMarkAllNotificationsRead(auth);
      // CAMPAIGN
      case 'createCampaign': return handleCreateCampaign(auth, payload);
      case 'updateCampaign': return handleUpdateCampaign(auth, payload);
      case 'getCampaigns': return handleGetCampaigns();
      case 'registerCampaign': return handleRegisterCampaign(auth, payload);
      case 'updateCampaignStatus': return handleUpdateCampaignStatus(auth, payload);
      // SETTINGS
      case 'getPublicSettings': return handleGetPublicSettings();
      case 'updateWebsiteSettings': return handleUpdateWebsiteSettings(auth, payload);
      case 'getSystemSettings': return handleGetSystemSettings(auth);
      default:
        return jsonResponse(false, 'অজানা API অ্যাকশন: ' + action, null, 'UNKNOWN_ACTION');
    }
  } catch (err) {
    logSystemEvent('ERROR', action, 'API_POST_ERROR', err.message, '');
    return jsonResponse(false, err.message || 'সার্ভার ত্রুটি ঘটেছে।', null, 'SERVER_ERROR');
  }
}
