/**
 * Config.gs — RoktoBondhon Global Configuration & 23+ Sheet Schemas
 */
const RB_CONFIG = {
  SPREADSHEET_NAME: 'RoktoBondhon_Database',
  PROP_SPREADSHEET_ID: 'ROKTOBONDHON_SPREADSHEET_ID',
  PROP_SUPER_ADMIN_EMAIL: 'ADMIN_INIT_EMAIL',
  PROP_SUPER_ADMIN_PHONE: 'ADMIN_INIT_PHONE',
  PROP_SUPER_ADMIN_PASS: 'ADMIN_INIT_PASSWORD',
  SESSION_TTL_HOURS: 24,
  SESSION_REMEMBER_HOURS: 168,
  PBKDF2_ITERATIONS: 10000,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 15,
  HEADER_BG_COLOR: '#B5122A',
  HEADER_TEXT_COLOR: '#FFFFFF',
  DATE_FORMAT: 'yyyy-MM-dd HH:mm:ss',
  BLOOD_GROUPS: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
};

const RB_SHEETS = {
  Users: [
    'user_id', 'full_name', 'email', 'phone', 'password_hash', 'password_salt',
    'role', 'account_status', 'email_verified', 'phone_verified', 'profile_image',
    'created_at', 'updated_at', 'last_login', 'deleted_at'
  ],
  Donors: [
    'donor_id', 'user_id', 'blood_group', 'date_of_birth', 'gender',
    'division', 'district', 'upazila', 'union_name', 'ward', 'area', 'address',
    'last_donation_date', 'availability', 'verification_status', 'phone_visibility',
    'bio', 'created_at', 'updated_at'
  ],
  Recipients: [
    'recipient_id', 'user_id', 'full_name', 'phone', 'relationship_to_patient',
    'division', 'district', 'upazila', 'address', 'created_at', 'updated_at'
  ],
  Blood_Requests: [
    'request_id', 'requester_user_id', 'patient_name', 'requester_name', 'blood_group',
    'units_required', 'hospital_name', 'hospital_address', 'division', 'district', 'upazila',
    'required_date', 'required_time', 'urgency_level', 'contact_phone', 'patient_condition',
    'additional_notes', 'admin_status', 'donor_found_count', 'completed_units',
    'assigned_representative_id', 'created_at', 'updated_at', 'completed_at'
  ],
  Donations: [
    'donation_id', 'donor_id', 'request_id', 'recipient_user_id', 'donation_date',
    'hospital_name', 'blood_group', 'verification_status', 'verified_by',
    'verified_at', 'notes', 'created_at'
  ],
  Verifications: [
    'verification_id', 'donor_id', 'admin_id', 'representative_id', 'verification_type',
    'verification_result', 'verification_notes', 'verified_phone', 'verified_blood_group',
    'verification_date', 'previous_status', 'new_status'
  ],
  Volunteers: [
    'volunteer_id', 'user_id', 'skills', 'division', 'district', 'upazila',
    'availability', 'approval_status', 'joined_at'
  ],
  Campaigns: [
    'campaign_id', 'campaign_title', 'campaign_description', 'banner_url', 'event_date',
    'start_time', 'end_time', 'venue', 'division', 'district', 'upazila',
    'organizer', 'registration_limit', 'campaign_status', 'created_at'
  ],
  Campaign_Registrations: [
    'registration_id', 'campaign_id', 'user_id', 'participant_type',
    'registration_status', 'attendance_status', 'registered_at'
  ],
  Contact_Requests: [
    'contact_request_id', 'request_id', 'donor_id', 'requester_user_id',
    'donor_consent', 'contact_status', 'message', 'created_at', 'responded_at'
  ],
  Notifications: [
    'notification_id', 'user_id', 'title', 'message', 'notification_type',
    'reference_id', 'is_read', 'created_at'
  ],
  Messages: [
    'message_id', 'sender_user_id', 'receiver_user_id', 'request_id',
    'message_text', 'read_status', 'created_at'
  ],
  Locations: [
    'location_id', 'division_name', 'district_name', 'upazila_name',
    'union_name', 'ward_name', 'is_active', 'sort_order'
  ],
  Blogs: [
    'blog_id', 'title', 'slug', 'category', 'thumbnail_url', 'content',
    'author_id', 'publish_status', 'published_at', 'created_at'
  ],
  Admins: [
    'admin_id', 'full_name', 'email', 'phone', 'role', 'permissions',
    'account_status', 'created_at', 'last_login'
  ],
  Activity_Logs: [
    'log_id', 'actor_id', 'actor_role', 'action', 'module',
    'record_id', 'description', 'timestamp'
  ],
  Settings: [
    'setting_key', 'setting_value', 'setting_group', 'description',
    'updated_by', 'updated_at'
  ],
  System_Logs: [
    'system_log_id', 'event_type', 'api_action', 'error_code',
    'error_message', 'timestamp', 'request_id'
  ],
  Representatives: [
    'representative_id', 'user_id', 'representative_code', 'full_name',
    'phone', 'email', 'profile_image', 'appointment_date', 'status',
    'assigned_by', 'created_at', 'updated_at'
  ],
  Representative_Assignments: [
    'assignment_id', 'representative_id', 'assignment_level', 'division', 'district',
    'upazila', 'union_name', 'ward_name', 'area', 'assigned_by', 'assigned_at',
    'status', 'permission_level', 'notes'
  ],
  Representative_Tasks: [
    'task_id', 'representative_id', 'task_type', 'reference_id', 'title',
    'description', 'priority', 'task_status', 'assigned_by', 'assigned_at',
    'due_date', 'completed_at', 'notes'
  ],
  Representative_Reports: [
    'report_id', 'representative_id', 'report_title', 'report_content',
    'report_type', 'related_area', 'submitted_at', 'reviewed_by',
    'review_status', 'admin_notes'
  ],
  Representative_Permissions: [
    'permission_id', 'representative_id', 'can_view_donors', 'can_verify_donors',
    'can_recommend_approval', 'can_recommend_rejection', 'can_view_requests',
    'can_manage_local_requests', 'can_manage_campaigns', 'can_view_reports',
    'granted_by', 'updated_at'
  ],
  Sessions: [
    'session_id', 'user_id', 'token_hash', 'role', 'expires_at', 'revoked', 'created_at'
  ],
  Password_Resets: [
    'reset_id', 'user_id', 'identifier', 'reference_code', 'reason',
    'status', 'resolved_by', 'created_at', 'resolved_at'
  ],
  Donor_Posters: [
    'poster_id', 'title', 'subtitle', 'blood_group', 'image_url',
    'sort_order', 'is_active', 'created_by', 'created_at', 'deleted_at'
  ]
};
