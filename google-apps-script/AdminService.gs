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
