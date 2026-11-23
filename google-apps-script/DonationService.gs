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
