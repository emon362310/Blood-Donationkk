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
