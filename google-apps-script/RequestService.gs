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
