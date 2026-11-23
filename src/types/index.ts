export type UserRole =
  | 'user'
  | 'donor'
  | 'recipient'
  | 'volunteer'
  | 'representative'
  | 'admin'
  | 'super_admin';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type VerificationStatus =
  | 'Pending Verification'
  | 'Under Review'
  | 'Phone Contacted'
  | 'Verified'
  | 'Approved'
  | 'Rejected'
  | 'Correction Required'
  | 'Suspended';

export type RequestAdminStatus =
  | 'Pending'
  | 'Under Review'
  | 'Approved'
  | 'Donor Matching'
  | 'Donor Found'
  | 'Partially Fulfilled'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled'
  | 'Expired';

export type UrgencyLevel = 'Normal' | 'Urgent' | 'Emergency';

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  account_status: 'active' | 'suspended' | 'inactive';
  email_verified: boolean;
  phone_verified: boolean;
  profile_image: string;
  created_at: string;
  updated_at: string;
  last_login: string;
}

export interface Donor {
  donor_id: string;
  user_id: string;
  full_name?: string;
  phone?: string | null;
  email?: string;
  profile_image?: string;
  blood_group: BloodGroup;
  date_of_birth: string;
  gender: string;
  division: string;
  district: string;
  upazila: string;
  union_name: string;
  ward: string;
  area: string;
  address: string;
  last_donation_date: string;
  availability: 'available' | 'unavailable';
  verification_status: VerificationStatus;
  phone_visibility: 'public' | 'private';
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface BloodRequest {
  request_id: string;
  requester_user_id: string;
  patient_name: string;
  requester_name: string;
  blood_group: BloodGroup;
  units_required: number;
  hospital_name: string;
  hospital_address: string;
  division: string;
  district: string;
  upazila: string;
  required_date: string;
  required_time: string;
  urgency_level: UrgencyLevel;
  contact_phone: string;
  patient_condition: string;
  additional_notes: string;
  admin_status: RequestAdminStatus;
  donor_found_count: number;
  completed_units: number;
  assigned_representative_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string;
}

export interface DonationRecord {
  donation_id: string;
  donor_id: string;
  request_id: string;
  recipient_user_id: string;
  donation_date: string;
  hospital_name: string;
  blood_group: BloodGroup;
  verification_status: 'Pending Verification' | 'Verified' | 'Rejected';
  verified_by: string;
  verified_at: string;
  notes: string;
  created_at: string;
}

export interface VerificationLog {
  verification_id: string;
  donor_id: string;
  admin_id: string;
  representative_id: string;
  verification_type: string;
  verification_result: string;
  verification_notes: string;
  verified_phone: boolean;
  verified_blood_group: boolean;
  verification_date: string;
  previous_status: string;
  new_status: string;
}

export interface Campaign {
  campaign_id: string;
  campaign_title: string;
  campaign_description: string;
  banner_url: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  division: string;
  district: string;
  upazila: string;
  organizer: string;
  registration_limit: number;
  campaign_status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  registered_count?: number;
  created_at: string;
}

export interface BlogPost {
  blog_id: string;
  title: string;
  slug: string;
  category: string;
  thumbnail_url: string;
  content: string;
  author_id: string;
  publish_status: 'Published' | 'Draft';
  published_at: string;
  created_at: string;
}

export interface NotificationItem {
  notification_id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  reference_id: string;
  is_read: boolean;
  created_at: string;
}

export interface Representative {
  representative_id: string;
  user_id: string;
  representative_code: string;
  full_name: string;
  phone: string;
  email: string;
  profile_image: string;
  appointment_date: string;
  status: 'active' | 'suspended' | 'inactive';
  assigned_by: string;
  created_at: string;
  updated_at: string;
}

export interface RepresentativeAssignment {
  assignment_id: string;
  representative_id: string;
  assignment_level: 'division' | 'district' | 'upazila' | 'union' | 'ward' | 'area';
  division: string;
  district: string;
  upazila: string;
  union_name: string;
  ward_name: string;
  area: string;
  assigned_by: string;
  assigned_at: string;
  status: 'active' | 'removed';
  permission_level: 'standard' | 'special_approval';
  notes: string;
}

export interface RepresentativePermissions {
  permission_id: string;
  representative_id: string;
  can_view_donors: boolean;
  can_verify_donors: boolean;
  can_recommend_approval: boolean;
  can_recommend_rejection: boolean;
  can_view_requests: boolean;
  can_manage_local_requests: boolean;
  can_manage_campaigns: boolean;
  can_view_reports: boolean;
  granted_by: string;
  updated_at: string;
}

export interface RepresentativeTask {
  task_id: string;
  representative_id: string;
  task_type: string;
  reference_id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  task_status: 'Pending' | 'In Progress' | 'Completed';
  assigned_by: string;
  assigned_at: string;
  due_date: string;
  completed_at: string;
  notes: string;
}

export interface RepresentativeReport {
  report_id: string;
  representative_id: string;
  report_title: string;
  report_content: string;
  report_type: string;
  related_area: string;
  submitted_at: string;
  reviewed_by: string;
  review_status: 'Pending' | 'Reviewed';
  admin_notes: string;
}

export interface ContactRequest {
  contact_request_id: string;
  request_id: string;
  donor_id: string;
  requester_user_id: string;
  requester_name?: string;
  donor_consent: 'pending' | 'approved' | 'declined';
  contact_status: string;
  message: string;
  created_at: string;
  responded_at: string;
}

export interface DonorPoster {
  poster_id: string;
  title: string;
  subtitle: string;
  blood_group: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  deleted_at?: string;
}

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  site_logo: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  hero_title: string;
  hero_subtitle: string;
  poster_slider_title: string;
  show_poster_slider: string;
  registration_enabled: string;
  donor_manual_approval: string;
  request_approval_required: string;
  maintenance_mode: string;
  [key: string]: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error: string | null;
}
