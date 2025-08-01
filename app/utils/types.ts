// ========== AUTH TYPES ==========
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  user_type: string;
}

export interface RegisterStep1Data {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterStep1Response {
  message: string;
  user_id: string;
}

export interface RegisterStep2Data {
  // User info (repeated for API)
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  otp_code: string;
  
  // Company info
  company_name: string;
  company_description?: string;
  industry_sector?: string;
  number_of_employees?: number;
  
  // Financial data
  annual_revenue?: number;
  founding_date?: string;
  company_registration_number?: string;
  
  // Funding info
  has_raised_funds?: boolean;
  amount_raised?: number;
  wants_to_raise_funds?: boolean;
  desired_funding_amount?: number;
  
  // Maturity level (only one should be true)
  company_not_created: boolean;
  company_recently_created: boolean;
  company_established: boolean;
}

export interface RegisterStep2Response {
  message: string;
  user_id: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetVerify {
  email: string;
  otp_code: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// ========== USER TYPES ==========
export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'entrepreneur' | 'expert' | 'admin';
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  phone?: string;
  last_login?: string;
  profile_picture_url?: string;
}

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

// ========== ENTREPRENEUR TYPES ==========
export interface EntrepreneurProfile {
  entrepreneur_id: string;
  user_id: string;
  user: User;
  company_name: string;
  company_registration_number?: string;
  company_description?: string;
  industry_sector?: string;
  founding_date?: string;
  number_of_employees?: number;
  annual_revenue?: number;
  
  // Funding
  has_raised_funds?: boolean;
  amount_raised?: number;
  wants_to_raise_funds?: boolean;
  desired_funding_amount?: number;
  
  // Documents
  identity_card_url?: string;
  company_logo_url?: string;
  registration_document_url?: string;
  professional_card_url?: string;
  
  // Maturity
  company_maturity: 'not_created' | 'recently_created' | 'established';
  
  // Validation
  validation_status: 'pending' | 'approved' | 'rejected';
  validation_date?: string;
  validated_by?: string;
  rejection_reason?: string;
}

export type CompanyMaturityLevel = 'not_created' | 'recently_created' | 'established';

export interface CompanyMaturityOption {
  value: CompanyMaturityLevel;
  label: string;
  description: string;
  icon: string;
  required_fields: string[];
}

export const COMPANY_MATURITY_OPTIONS: CompanyMaturityOption[] = [
  {
    value: 'not_created',
    label: 'Idée / Projet en développement',
    description: 'Vous avez une idée d\'entreprise mais elle n\'est pas encore créée juridiquement',
    icon: '💡',
    required_fields: []
  },
  {
    value: 'recently_created',
    label: 'Startup récente (moins d\'1 an)',
    description: 'Votre entreprise est créée récemment et vous développez votre activité',
    icon: '🚀',
    required_fields: ['founding_date', 'company_registration_number']
  },
  {
    value: 'established',
    label: 'Entreprise établie (plus d\'1 an)',
    description: 'Votre entreprise existe depuis plus d\'un an et génère du chiffre d\'affaires',
    icon: '🏢',
    required_fields: ['founding_date', 'company_registration_number', 'annual_revenue']
  }
];

// ========== EXPERT TYPES ==========
export interface ExpertProfile {
  expert_id: string;
  user_id: string;
  user: User;
  specialization: string;
  years_of_experience?: number;
  linkedin_profile?: string;
  cv_url?: string;
  bio?: string;
  hourly_rate?: number;
  is_active: boolean;
  areas_of_expertise: string[];
  languages: string[];
  availability_status: 'available' | 'limited' | 'unavailable';
}

// ========== PROGRAM TYPES ==========
export interface Program {
  program_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  max_participants?: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants_count?: number; // Ajouté côté frontend
  available_spots?: number; // Calculé côté frontend
}

export interface ProgramParticipant {
  participant_id: string;
  program_id: string;
  entrepreneur_id: string;
  enrollment_date: string;
  completion_status: 'in_progress' | 'completed' | 'dropped';
  completion_date?: string;
  entrepreneur?: {
    user?: {
      first_name: string;
      last_name: string;
    };
    company_name: string;
  };
}

export interface ProgramStats {
  total_participants: number;
  active_participants: number;
  completed_participants: number;
  dropped_participants: number;
  completion_rate: number;
}

// ========== MODULE TYPES ==========
export interface Module {
  module_id: string;
  title: string;
  description?: string;
  module_type: 'lesson' | 'workshop' | 'assessment';
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_minutes?: number;
  status: 'draft' | 'published';
  created_by: string;
  program_id?: string;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  program_name?: string;
  total_content_count?: number;
}

export interface ModuleContent {
  content_id: string;
  module_id: string;
  title: string;
  description?: string;
  content_type: 'text' | 'video' | 'audio' | 'document';
  file_url?: string;
  duration_seconds?: number;
  order_index: number;
  created_at: string;
}

export interface ModuleProgress {
  progress_id: string;
  module_id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  completion_percentage: number;
  is_completed: boolean;
}

// ========== ASSIGNMENT TYPES ==========
export interface Assignment {
  assignment_id: string;
  module_id: string;
  title: string;
  description: string;
  assignment_type: 'quiz' | 'essay' | 'project' | 'presentation';
  max_score: number;
  due_date?: string;
  instructions?: string;
  resources?: string[];
}

export interface AssignmentSubmission {
  submission_id: string;
  assignment_id: string;
  user_id: string;
  submission_text?: string;
  submission_files?: string[];
  status: 'draft' | 'submitted' | 'graded';
  submitted_at?: string;
  score?: number;
  feedback?: string;
  graded_at?: string;
  grader_id?: string;
}

// ========== MESSAGE TYPES ==========
export interface Message {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  is_read: boolean;
  attachments: MessageAttachment[];
}

export interface MessageAttachment {
  attachment_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  content_type: string;
}

export interface Conversation {
  conversation_id: string;
  title?: string;
  participants: ConversationParticipant[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  user_id: string;
  name: string;
  user_type: string;
  profile_picture_url?: string;
  last_read_at?: string;
}

// ========== CALL TYPES ==========
export interface Call {
  call_id: string;
  title: string;
  description?: string;
  call_type: 'one_on_one' | 'group_session' | 'webinar' | 'workshop';
  scheduled_start: string;
  scheduled_end: string;
  meeting_url?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  expert_id: string;
  expert_name: string;
  participant_count: number;
  max_participants?: number;
  agenda?: string;
}

export interface CallParticipant {
  user_id: string;
  call_id: string;
  name: string;
  user_type: string;
  role: 'host' | 'participant' | 'observer';
  status: 'invited' | 'confirmed' | 'attended';
  joined_at?: string;
  left_at?: string;
}

export interface CallAvailabilitySlot {
  slot_id: string;
  expert_id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

// ========== NOTIFICATION TYPES ==========
export interface Notification {
  notification_id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'system' | 'message' | 'call' | 'assignment' | 'program';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_label?: string;
  related_entity_id?: string;
  related_entity_type?: string;
}

// ========== INDUSTRY SECTORS ==========
export interface IndustrySector {
  value: string;
  label: string;
}

export const INDUSTRY_SECTORS: IndustrySector[] = [
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'technology', label: 'Technologie' },
  { value: 'healthcare', label: 'Santé' },
  { value: 'education', label: 'Éducation' },
  { value: 'finance', label: 'Finance' },
  { value: 'manufacturing', label: 'Manufacture' },
  { value: 'retail', label: 'Commerce de détail' },
  { value: 'services', label: 'Services' },
  { value: 'construction', label: 'Construction' },
  { value: 'transportation', label: 'Transport' },
  { value: 'energy', label: 'Énergie' },
  { value: 'food', label: 'Agroalimentaire' },
  { value: 'tourism', label: 'Tourisme' },
  { value: 'arts', label: 'Arts et Culture' },
  { value: 'sports', label: 'Sports et Loisirs' }
];

// ========== REPORT TYPES ==========
export interface UserActivityReport {
  user_id: string;
  last_login: string;
  login_count_7d: number;
  completed_modules: number;
  upcoming_calls: number;
  unread_messages: number;
  pending_assignments: number;
}

export interface ProgramReport {
  program_id: string;
  name: string;
  total_participants: number;
  completion_rate: number;
  average_score: number;
  module_completion: {
    module_id: string;
    title: string;
    completion_rate: number;
  }[];
}

export interface PlatformMetrics {
  total_users: number;
  active_users_7d: number;
  new_users_7d: number;
  total_programs: number;
  active_programs: number;
  upcoming_calls: number;
  messages_sent_7d: number;
}