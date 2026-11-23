/**
 * UserService.gs — User Management for Admins & Super Admins
 */
function handleGetAllUsers(auth) {
  requireRole(auth, ['admin', 'super_admin']);
  var users = readSheetRecords('Users').map(function(u) {
    return {
      user_id: u.user_id,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      account_status: u.account_status,
      created_at: u.created_at,
      last_login: u.last_login
    };
  });
  return jsonResponse(true, 'ব্যবহারকারীদের তালিকা লোড হয়েছে।', { users: users }, null);
}

function handleUpdateUser(auth, payload) {
  var admin = requireRole(auth, ['admin', 'super_admin']);
  var target = findRecordByField('Users', 'user_id', payload.user_id);
  if (!target) {
    return jsonResponse(false, 'ব্যবহারকারী পাওয়া যায়নি।', null, 'NOT_FOUND');
  }
  if (payload.role === 'super_admin' && admin.role !== 'super_admin') {
    return jsonResponse(false, 'শুধুমাত্র সুপার অ্যাডমিন এই রোল পরিবর্তন করতে পারবেন।', null, 'FORBIDDEN');
  }
  var updates = { updated_at: nowIso() };
  if (payload.account_status) updates.account_status = sanitizeText(payload.account_status);
  if (payload.role && admin.role === 'super_admin') updates.role = sanitizeText(payload.role);
  if (payload.full_name) updates.full_name = sanitizeText(payload.full_name);

  var updated = updateRecordByField('Users', 'user_id', target.user_id, updates);
  logActivity(admin.user_id, admin.role, 'UPDATE_USER', 'Users', target.user_id, 'ব্যবহারকারীর তথ্য/অবস্থা হালনাগাদ');
  return jsonResponse(true, 'ব্যবহারকারীর তথ্য হালনাগাদ হয়েছে।', { user: updated }, null);
}
