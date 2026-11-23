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
