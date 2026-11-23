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
