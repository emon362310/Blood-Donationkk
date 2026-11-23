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
