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
