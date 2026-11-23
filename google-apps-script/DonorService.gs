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
