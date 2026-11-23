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
