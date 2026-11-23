/**
 * NotificationService.gs — Notification Management (No OTP)
 */
function createNotification(userId, title, message, type, referenceId) {
  return appendRecord('Notifications', {
    notification_id: generateId('NTF'),
    user_id: userId,
    title: sanitizeText(title),
    message: sanitizeText(message),
    notification_type: type || 'system',
    reference_id: referenceId || '',
    is_read: 'false',
    created_at: nowIso()
  });
}

function handleGetNotifications(auth) {
  var user = requireRole(auth);
  var list = readSheetRecords('Notifications').filter(function(n) {
    return n.user_id === user.user_id;
  }).reverse();
  return jsonResponse(true, 'নোটিফিকেশন লোড হয়েছে।', { notifications: list }, null);
}

function handleMarkNotificationRead(auth, payload) {
  var user = requireRole(auth);
  var ntf = findRecordByField('Notifications', 'notification_id', payload.notification_id);
  if (!ntf || ntf.user_id !== user.user_id) {
    return jsonResponse(false, 'নোটিফিকেশন পাওয়া যায়নি।', null, 'NOT_FOUND');
  }
  updateRecordByField('Notifications', 'notification_id', ntf.notification_id, { is_read: 'true' });
  return jsonResponse(true, 'নোটিফিকেশন পড়া হয়েছে হিসেবে চিহ্নিত।', null, null);
}

function handleMarkAllNotificationsRead(auth) {
  var user = requireRole(auth);
  var list = readSheetRecords('Notifications').filter(function(n) {
    return n.user_id === user.user_id && n.is_read !== 'true';
  });
  for (var i = 0; i < list.length; i++) {
    updateRecordByField('Notifications', 'notification_id', list[i].notification_id, { is_read: 'true' });
  }
  return jsonResponse(true, 'সব নোটিফিকেশন পড়া হয়েছে হিসেবে চিহ্নিত করা হয়েছে।', null, null);
}
