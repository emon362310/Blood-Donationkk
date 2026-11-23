/**
 * Code.gs — Unified Google Apps Script API Router (doGet / doPost)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'health';
  try {
    if (action === 'health') {
      return jsonResponse(true, 'রক্তবন্ধন API সক্রিয় আছে।', { version: '1.1.0' }, null);
    }
    if (action === 'pullAll') {
      return handlePullAllTables();
    }
    if (action === 'setupDatabase') {
      return jsonResponse(true, 'ডাটাবেজ প্রস্তুত।', setupRoktoBondhonDatabase(), null);
    }
    var auth = authenticateRequest(null, e);
    switch (action) {
      case 'searchDonors':
        return handleSearchDonors(null, e);
      case 'getDonorById':
        return handleGetDonorById(null, e);
      case 'getBloodRequests':
        return handleGetBloodRequests(auth, null, e);
      case 'getBloodRequestDetails':
        return handleGetBloodRequestDetails(null, e);
      case 'getCampaigns':
        return handleGetCampaigns();
      case 'getPublicSettings':
        return handleGetPublicSettings();
      case 'getCurrentUser':
        return handleGetCurrentUser(auth);
      case 'getDonorProfile':
        return handleGetDonorProfile(auth);
      case 'getDonorHistory':
        return handleGetDonorHistory(auth);
      case 'getAdminDashboard':
        return handleGetAdminDashboard(auth);
      case 'getPendingDonors':
        return handleGetPendingDonors(auth);
      case 'getAllUsers':
        return handleGetAllUsers(auth);
      case 'getRepresentativeDashboard':
        return handleGetRepresentativeDashboard(auth);
      case 'getAssignedAreaDonors':
        return handleGetAssignedAreaDonors(auth);
      case 'getAssignedAreaRequests':
        return handleGetAssignedAreaRequests(auth);
      case 'getRepresentativeTasks':
        return handleGetRepresentativeTasks(auth);
      case 'getDonationHistory':
        return handleGetDonationHistory(auth, null);
      case 'getNotifications':
        return handleGetNotifications(auth);
      case 'getSystemSettings':
        return handleGetSystemSettings(auth);
      default:
        return jsonResponse(false, 'অজানা API অ্যাকশন: ' + action, null, 'UNKNOWN_ACTION');
    }
  } catch (err) {
    logSystemEvent('ERROR', action, 'API_GET_ERROR', err.message, '');
    return jsonResponse(false, err.message || 'সার্ভার ত্রুটি ঘটেছে।', null, 'SERVER_ERROR');
  }
}

function doPost(e) {
  var payload = parseBody(e);
  var action = payload.action || (e && e.parameter && e.parameter.action) || '';
  try {
    // SERVER-TO-SHEET SYNC ENGINE ACTIONS
    if (action === 'health') {
      return jsonResponse(true, 'রক্তবন্ধন API সক্রিয় আছে।', { version: '1.1.0' }, null);
    }
    if (action === 'pullAll') {
      return handlePullAllTables();
    }
    if (action === 'findUser') {
      return handleFindUserForLogin(payload);
    }
    if (action === 'upsertBatch') {
      return handleUpsertBatch(payload);
    }
    if (action === 'setupDatabase') {
      return jsonResponse(true, 'ডাটাবেজ প্রস্তুত।', setupRoktoBondhonDatabase(), null);
    }

    var auth = authenticateRequest(payload, e);
    switch (action) {
      // AUTH
      case 'registerUser': return handleRegisterUser(payload);
      case 'loginUser': return handleLoginUser(payload);
      case 'logoutUser': return handleLogoutUser(auth);
      case 'getCurrentUser': return handleGetCurrentUser(auth);
      case 'changePassword': return handleChangePassword(auth, payload);
      case 'requestPasswordReset': return handleRequestPasswordReset(payload);
      case 'completeAdminPasswordReset': return handleCompleteAdminPasswordReset(auth, payload);
      // DONOR
      case 'createDonor': return handleCreateDonor(auth, payload);
      case 'getDonorProfile': return handleGetDonorProfile(auth);
      case 'updateDonorProfile': return handleUpdateDonorProfile(auth, payload);
      case 'searchDonors': return handleSearchDonors(payload, e);
      case 'getDonorById': return handleGetDonorById(payload, e);
      case 'updateAvailability': return handleUpdateAvailability(auth, payload);
      case 'getDonorHistory': return handleGetDonorHistory(auth);
      case 'requestDonorContact': return handleRequestDonorContact(auth, payload);
      // ADMIN
      case 'getAdminDashboard': return handleGetAdminDashboard(auth);
      case 'getPendingDonors': return handleGetPendingDonors(auth);
      case 'approveDonor': return handleApproveDonor(auth, payload);
      case 'rejectDonor': return handleRejectDonor(auth, payload);
      case 'requestDonorCorrection': return handleRequestDonorCorrection(auth, payload);
      case 'suspendDonor': return handleSuspendDonor(auth, payload);
      case 'getAllUsers': return handleGetAllUsers(auth);
      case 'updateUser': return handleUpdateUser(auth, payload);
      // REPRESENTATIVE
      case 'createRepresentative': return handleCreateRepresentative(auth, payload);
      case 'updateRepresentative': return handleUpdateRepresentative(auth, payload);
      case 'assignRepresentativeArea': return handleAssignRepresentativeArea(auth, payload);
      case 'removeRepresentativeAssignment': return handleRemoveRepresentativeAssignment(auth, payload);
      case 'updateRepresentativePermissions': return handleUpdateRepresentativePermissions(auth, payload);
      case 'getRepresentativeDashboard': return handleGetRepresentativeDashboard(auth);
      case 'getAssignedAreaDonors': return handleGetAssignedAreaDonors(auth);
      case 'getAssignedAreaRequests': return handleGetAssignedAreaRequests(auth);
      case 'submitVerification': return handleSubmitVerification(auth, payload);
      case 'submitRepresentativeReport': return handleSubmitRepresentativeReport(auth, payload);
      case 'getRepresentativeTasks': return handleGetRepresentativeTasks(auth);
      // BLOOD REQUEST
      case 'createBloodRequest': return handleCreateBloodRequest(auth, payload);
      case 'getBloodRequests': return handleGetBloodRequests(auth, payload, e);
      case 'getBloodRequestDetails': return handleGetBloodRequestDetails(payload, e);
      case 'approveBloodRequest': return handleApproveBloodRequest(auth, payload);
      case 'rejectBloodRequest': return handleRejectBloodRequest(auth, payload);
      case 'updateBloodRequest': return handleUpdateBloodRequest(auth, payload);
      case 'matchDonors': return handleMatchDonors(auth, payload);
      case 'completeBloodRequest': return handleCompleteBloodRequest(auth, payload);
      case 'cancelBloodRequest': return handleCancelBloodRequest(auth, payload);
      // DONATION
      case 'createDonationRecord': return handleCreateDonationRecord(auth, payload);
      case 'verifyDonationRecord': return handleVerifyDonationRecord(auth, payload);
      case 'getDonationHistory': return handleGetDonationHistory(auth, payload);
      // NOTIFICATION
      case 'getNotifications': return handleGetNotifications(auth);
      case 'markNotificationRead': return handleMarkNotificationRead(auth, payload);
      case 'markAllNotificationsRead': return handleMarkAllNotificationsRead(auth);
      // CAMPAIGN
      case 'createCampaign': return handleCreateCampaign(auth, payload);
      case 'updateCampaign': return handleUpdateCampaign(auth, payload);
      case 'getCampaigns': return handleGetCampaigns();
      case 'registerCampaign': return handleRegisterCampaign(auth, payload);
      case 'updateCampaignStatus': return handleUpdateCampaignStatus(auth, payload);
      // SETTINGS
      case 'getPublicSettings': return handleGetPublicSettings();
      case 'updateWebsiteSettings': return handleUpdateWebsiteSettings(auth, payload);
      case 'getSystemSettings': return handleGetSystemSettings(auth);
      default:
        return jsonResponse(false, 'অজানা API অ্যাকশন: ' + action, null, 'UNKNOWN_ACTION');
    }
  } catch (err) {
    logSystemEvent('ERROR', action, 'API_POST_ERROR', err.message, '');
    return jsonResponse(false, err.message || 'সার্ভার ত্রুটি ঘটেছে।', null, 'SERVER_ERROR');
  }
}
