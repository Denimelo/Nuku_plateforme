// ========== AUTH TYPES ==========
export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'entrepreneur' | 'expert' | 'admin';
  status: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ========== MESSAGE TYPES ==========
export interface Message {
  message_id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  receiver_name: string;
  subject?: string;
  message_text: string;
  sent_at: string;
  is_read: boolean;
  attachments: MessageAttachment[];
  conversation_id: string;
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
  title: string;
  participants: Participant[];
  unread_count: number;
  last_message?: Message;
  last_activity_at: string;
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
  expert_name: string;
  participant_count: number;
  can_join: boolean;
  is_upcoming: boolean;
  is_live: boolean;
}

export interface Participant {
  user_id: string;
  name: string;
  user_type: string;
  role: 'host' | 'participant' | 'observer';
  status: 'invited' | 'confirmed' | 'attended';
}

// ========== MODULE TYPES ==========
export interface Module {
  module_id: string;
  title: string;
  description?: string;
  module_type: 'lesson' | 'workshop' | 'assessment';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_minutes?: number;
  status: 'draft' | 'published';
  creator_name: string;
  total_content_count: number;
  completion_percentage: number;
  is_completed: boolean;
}

export interface ModuleContent {
  content_id: string;
  title: string;
  description?: string;
  content_type: 'text' | 'video' | 'audio' | 'document';
  file_url?: string;
  duration_seconds?: number;
  order_index: number;
}

// ========== ASSIGNMENT TYPES ==========
export interface Assignment {
  assignment_id: string;
  title: string;
  description: string;
  assignment_type: 'quiz' | 'essay' | 'project' | 'presentation';
  max_score: number;
  due_date?: string;
  is_available: boolean;
  is_overdue: boolean;
  user_submitted: boolean;
  user_score?: number;
}

export interface AssignmentSubmission {
  submission_id: string;
  assignment_id: string;
  submission_text?: string;
  submission_files: string[];
  status: 'draft' | 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  submitted_at?: string;
  graded_at?: string;
}

// ========== NOTIFICATION TYPES ==========
export interface Notification {
  notification_id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_label?: string;
}

// ========== PROGRAM TYPES ==========
export interface Program {
  program_id: string;
  name: string;
  description: string;
  duration_weeks: number;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
  participant_count: number;
  max_participants: number;
}

export interface Expert {
  expert_id: string;
  user: User;
  specialization: string;
  years_of_experience?: number;  // Pas experience_years
  linkedin_profile?: string;
  cv_url?: string;
  bio?: string;
  hourly_rate?: number;
  is_active: boolean;
}