const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  token?: string;
  headers?: Record<string, string>;
}

async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, token, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  console.log(`Making API call to: ${API_BASE_URL}${endpoint}`);
  console.log('Config:', config);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText || `HTTP ${response.status}` };
      }
      
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('API Success response:', data);
    return data;
  } catch (error) {
    console.error('API Call error:', error);
    throw error;
  }
}

// ========== TYPES ==========
interface UserRegistrationData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
}

interface EntrepreneurRegistrationData extends UserRegistrationData {
  company_name: string;
  company_description?: string;
  industry_sector?: string;
  number_of_employees?: number;
  annual_revenue?: number;
  founding_date?: string;
  company_registration_number?: string;
  has_raised_funds?: boolean;
  amount_raised?: number;
  wants_to_raise_funds?: boolean;
  desired_funding_amount?: number;
  company_not_created: boolean;
  company_recently_created: boolean;
  company_established: boolean;
  otp_code: string;
}

interface ExpertData {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  specialization: string;
  experience_years?: number;
  linkedin_url?: string;
  bio?: string;
  hourly_rate?: number;
}

interface ProgramApplicationData {
  motivation: string;
  business_plan_url?: string;
  additional_documents?: string[];
}

interface ModuleContent {
  title: string;
  content_type: 'video' | 'article' | 'quiz';
  url?: string;
  content?: string;
  duration_minutes?: number;
}

interface Message {
  sender_id: string;
  content: string;
  timestamp: string;
}

// ========== AUTH API SERVER ==========
export const authServerAPI = {
  login: async (email: string, password: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  register: async (data: UserRegistrationData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: data,
    });
  },

  verifyRegistration: async (data: EntrepreneurRegistrationData) => {
    return apiCall('/auth/register/verify', {
      method: 'POST',
      body: data,
    });
  },

  resendOTP: async (email: string) => {
    return apiCall('/otp/send', {
      method: 'POST',
      body: { email },
    });
  },

  verifyOTP: async (email: string) => {
    return apiCall('/otp/verify', {
      method: 'POST',
      body: { email },
    });
  },

  resetPassword: async (email: string) => {
    return apiCall('/auth/reset-password', {
      method: 'POST',
      body: { email },
    });
  },

  verifyPasswordReset: async (email: string, otp_code: string, new_password: string) => {
    return apiCall('/auth/reset-password/verify', {
      method: 'POST',
      body: { email, otp_code, new_password },
    });
  },

  changePassword: async (token: string, current_password: string, new_password: string) => {
    return apiCall('/auth/change-password', {
      method: 'POST',
      body: { current_password, new_password },
      token,
    });
  },

  me: async (token: string) => {
    return apiCall('/auth/me', { token });
  },
};

// ========== USERS API SERVER ==========
export const usersServerAPI = {
  getProfile: async (token: string) => {
    return apiCall('/users/me', { token });
  },

  updateProfile: async (token: string, data: any) => {
    return apiCall('/users/me', {
      method: 'PUT',
      body: data,
      token,
    });
  },

  uploadAvatar: async (token: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiCall('/users/me/avatar', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
      token,
    });
  },
};

// ========== ADMIN API SERVER ==========
export const adminServerAPI = {
  // Users
  getUsers: async (token: string, filters?: { status?: string; user_type?: string }) => {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return apiCall(`/admin/users${query}`, { token });
  },

  getUser: async (token: string, userId: string) => {
    return apiCall(`/admin/users/${userId}`, { token });
  },

  activateUser: async (token: string, userId: string) => {
    return apiCall(`/admin/users/${userId}/activate`, {
      method: 'PUT',
      token,
    });
  },

  deactivateUser: async (token: string, userId: string) => {
    return apiCall(`/admin/users/${userId}/deactivate`, {
      method: 'PUT',
      token,
    });
  },

  updateUser: async (token: string, userId: string, userData: any) => {
    return apiCall(`/admin/users/${userId}`, {
      method: 'PUT',
      body: userData,
      token,
    });
  },

  deleteUser: async (token: string, userId: string) => {
    return apiCall(`/admin/users/${userId}`, {
      method: 'DELETE',
      token,
    });
  },

  // Experts
  getExperts: async (token: string, filters?: { is_active?: boolean }) => {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return apiCall(`/admin/experts${query}`, { token });
  },

  getExpert: async (token: string, expertId: string) => {
    return apiCall(`/admin/experts/${expertId}`, { token });
  },

  createExpert: async (token: string, expertData: ExpertData) => {
    const backendData = {
      user: {
        ...expertData.user,
        user_type: 'expert',
        password: 'TemporaryPassword123!'
      },
      specialization: expertData.specialization,
      years_of_experience: expertData.experience_years || 0,
      linkedin_profile: expertData.linkedin_url || null,
      cv_url: null,
      bio: expertData.bio || null,
      hourly_rate: expertData.hourly_rate || null,
      is_active: true
    };

    return apiCall('/admin/experts', {
      method: 'POST',
      body: backendData,
      token,
    });
  },

  updateExpert: async (token: string, expertId: string, data: Partial<ExpertData>) => {
    return apiCall(`/admin/experts/${expertId}`, {
      method: 'PUT',
      body: data,
      token,
    });
  },

  deleteExpert: async (token: string, expertId: string) => {
    return apiCall(`/admin/experts/${expertId}`, {
      method: 'DELETE',
      token,
    });
  },

  // Entrepreneurs
  getEntrepreneurs: async (token: string, filters?: { validation_status?: string }) => {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return apiCall(`/admin/entrepreneurs${query}`, { token });
  },

  getEntrepreneur: async (token: string, entrepreneurId: string) => {
    return apiCall(`/admin/entrepreneurs/${entrepreneurId}`, { token });
  },

  validateEntrepreneur: async (token: string, entrepreneurId: string) => {
    return apiCall(`/admin/entrepreneurs/${entrepreneurId}/validate`, {
      method: 'PUT',
      token,
    });
  },

  rejectEntrepreneur: async (token: string, entrepreneurId: string, reason?: string) => {
    return apiCall(`/admin/entrepreneurs/${entrepreneurId}/reject`, {
      method: 'PUT',
      body: { reason },
      token,
    });
  },

  // Programs
  createProgram: async (token: string, programData: any) => {
    return apiCall('/admin/programs', {
      method: 'POST',
      body: programData,
      token,
    });
  },

  updateProgram: async (token: string, programId: string, programData: any) => {
    return apiCall(`/admin/programs/${programId}`, {
      method: 'PUT',
      body: programData,
      token,
    });
  },

  deleteProgram: async (token: string, programId: string) => {
    return apiCall(`/admin/programs/${programId}`, {
      method: 'DELETE',
      token,
    });
  },

  // Modules
  createModule: async (token: string, programId: string, moduleData: any) => {
    return apiCall(`/admin/programs/${programId}/modules`, {
      method: 'POST',
      body: moduleData,
      token,
    });
  },

  updateModule: async (token: string, moduleId: string, moduleData: any) => {
    return apiCall(`/admin/modules/${moduleId}`, {
      method: 'PUT',
      body: moduleData,
      token,
    });
  },

  deleteModule: async (token: string, moduleId: string) => {
    return apiCall(`/admin/modules/${moduleId}`, {
      method: 'DELETE',
      token,
    });
  },
};

// ========== ENTREPRENEURS API SERVER ==========
export const entrepreneursServerAPI = {
  getProfile: async (token: string) => {
    return apiCall('/entrepreneur/me', { token });
  },

  updateProfile: async (token: string, data: any) => {
    return apiCall('/entrepreneur/me', {
      method: 'PUT',
      body: data,
      token,
    });
  },

  updateDocuments: async (token: string, documents: any) => {
    return apiCall('/entrepreneur/me/documents', {
      method: 'PUT',
      body: documents,
      token,
    });
  },

  getEntrepreneurs: async (token: string) => {
    return apiCall('/entrepreneurs/', { token });
  },

  getEntrepreneur: async (token: string, entrepreneurId: string) => {
    return apiCall(`/entrepreneurs/${entrepreneurId}`, { token });
  },

  getMyApplications: async (token: string) => {
    return apiCall('/entrepreneur/me/applications', { token });
  },

  getMyAssignments: async (token: string) => {
    return apiCall('/entrepreneur/me/assignments', { token });
  },
};

// ========== EXPERTS API SERVER ==========
export const expertsServerAPI = {
  getProfile: async (token: string) => {
    return apiCall('/expert/me', { token });
  },

  updateProfile: async (token: string, data: any) => {
    return apiCall('/expert/me', {
      method: 'PUT',
      body: data,
      token,
    });
  },

  uploadCV: async (token: string, file: File) => {
    const formData = new FormData();
    formData.append('cv', file);
    
    return apiCall('/expert/me/cv', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
      token,
    });
  },

  getExperts: async (token: string) => {
    return apiCall('/experts/', { token });
  },

  getExpert: async (token: string, expertId: string) => {
    return apiCall(`/experts/${expertId}`, { token });
  },

  getMySchedule: async (token: string) => {
    return apiCall('/expert/me/schedule', { token });
  },

  updateAvailability: async (token: string, availability: any) => {
    return apiCall('/expert/me/availability', {
      method: 'PUT',
      body: availability,
      token,
    });
  },
};

// ========== PROGRAMS API SERVER ==========
export const programsServerAPI = {
  // Récupération
  getPrograms: async (token: string, activeOnly: boolean = true) => {
    return apiCall(`/programs/?active_only=${activeOnly}`, { token });
  },

  getProgram: async (token: string, programId: string) => {
    return apiCall(`/programs/${programId}`, { token });
  },

  getProgramParticipants: async (token: string, programId: string) => {
    return apiCall(`/programs/${programId}/participants`, { token });
  },

  getProgramStats: async (token: string, programId: string) => {
    return apiCall(`/programs/${programId}/stats`, { token });
  },

  // Création et modification (Admin)
  createProgram: async (token: string, programData: any) => {
    return apiCall("/programs/", {
      method: "POST",
      body: programData,
      token,
    });
  },

  updateProgram: async (token: string, programId: string, programData: any) => {
    return apiCall(`/programs/${programId}`, {
      method: "PUT",
      body: programData,
      token,
    });
  },

  deleteProgram: async (token: string, programId: string) => {
    return apiCall(`/programs/${programId}`, {
      method: "DELETE",
      token,
    });
  },

  // Gestion des participants
  enrollEntrepreneur: async (token: string, programId: string) => {
    return apiCall(`/programs/${programId}/enroll`, {
      method: "POST",
      token,
    });
  },

  leaveProgram: async (token: string, programId: string) => {
    return apiCall(`/programs/${programId}/leave`, {
      method: "DELETE",
      token,
    });
  },
};

// ========== MODULES API SERVER ==========
export const modulesServerAPI = {
  // Récupération
  getModules: async (token: string, programId?: string) => {
    const endpoint = programId ? `/modules/program/${programId}` : '/modules/';
    return apiCall(endpoint, { token });
  },

  getModule: async (token: string, moduleId: string) => {
    return apiCall(`/modules/${moduleId}`, { token });
  },

  getModuleContents: async (token: string, moduleId: string) => {
    return apiCall(`/modules/${moduleId}/contents`, { token });
  },

  // Création et modification
  createModule: async (token: string, moduleData: any) => {
    return apiCall("/modules/", {
      method: "POST",
      body: moduleData,
      token,
    });
  },

  updateModule: async (token: string, moduleId: string, moduleData: any) => {
    return apiCall(`/modules/${moduleId}`, {
      method: "PUT",
      body: moduleData,
      token,
    });
  },

  deleteModule: async (token: string, moduleId: string) => {
    return apiCall(`/modules/${moduleId}`, {
      method: "DELETE",
      token,
    });
  },

  // Gestion du contenu
  addContent: async (token: string, moduleId: string, contentData: any) => {
    return apiCall(`/modules/${moduleId}/contents`, {
      method: "POST",
      body: contentData,
      token,
    });
  },
};

// ========== MESSAGES API SERVER ==========
export const messagesServerAPI = {
  getConversations: async (token: string) => {
    return apiCall('/messages/conversations/', { token });
  },

  getMessages: async (token: string, conversationId: string) => {
    return apiCall(`/messages/conversations/${conversationId}`, { token });
  },

  sendMessage: async (token: string, conversationId: string, content: string) => {
    return apiCall(`/messages/conversations/${conversationId}`, {
      method: 'POST',
      body: { content },
      token,
    });
  },

  startConversation: async (token: string, recipientId: string, initialMessage: string) => {
    return apiCall('/messages/conversations', {
      method: 'POST',
      body: {
        recipient_id: recipientId,
        initial_message: initialMessage,
      },
      token,
    });
  },
};

// ========== NOTIFICATIONS API SERVER ==========
export const notificationsServerAPI = {
  getNotifications: async (token: string, filters?: { is_read?: boolean }) => {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return apiCall(`/notifications/${query}`, { token });
  },

  getNotificationCounts: async (token: string) => {
    return apiCall('/notifications/counts', { token });
  },

  markAsRead: async (token: string, notificationId: string) => {
    return apiCall(`/notifications/${notificationId}/read`, {
      method: 'PUT',
      token,
    });
  },

  markAllAsRead: async (token: string) => {
    return apiCall('/notifications/mark-all-read', {
      method: 'PUT',
      token,
    });
  },
};

// ========== CALLS API SERVER ==========
export const callsServerAPI = {
  getUpcomingCalls: async (token: string) => {
    return apiCall('/calls/upcoming', { token });
  },

  getCall: async (token: string, callId: string) => {
    return apiCall(`/calls/${callId}`, { token });
  },

  scheduleCall: async (token: string, expertId: string, slotId: string, agenda: string) => {
    return apiCall('/calls/schedule', {
      method: 'POST',
      body: {
        expert_id: expertId,
        slot_id: slotId,
        agenda,
      },
      token,
    });
  },

  cancelCall: async (token: string, callId: string) => {
    return apiCall(`/calls/${callId}/cancel`, {
      method: 'PUT',
      token,
    });
  },

  getAvailableSlots: async (token: string, expertId: string) => {
    return apiCall(`/calls/experts/${expertId}/availability`, { token });
  },
};

// ========== ASSIGNMENTS API SERVER ==========
export const assignmentsServerAPI = {
  getAssignments: async (token: string) => {
    return apiCall('/assignments/entrepreneur/available', { token });
  },

  getAssignment: async (token: string, assignmentId: string) => {
    return apiCall(`/assignments/${assignmentId}`, { token });
  },

  getMySubmissions: async (token: string) => {
    return apiCall('/assignments/entrepreneur/submissions', { token });
  },

  submitAssignment: async (token: string, assignmentId: string, submissionData: any) => {
    return apiCall(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: submissionData,
      token,
    });
  },

  getFeedback: async (token: string, submissionId: string) => {
    return apiCall(`/assignments/submissions/${submissionId}/feedback`, { token });
  },
};

// ========== REPORTS API SERVER ==========
export const reportsServerAPI = {
  getUserActivity: async (token: string, userId?: string) => {
    const endpoint = userId ? `/reports/users/${userId}/activity` : '/reports/my-activity';
    return apiCall(endpoint, { token });
  },

  getProgramStats: async (token: string, programId: string) => {
    return apiCall(`/reports/programs/${programId}/stats`, { token });
  },

  getPlatformMetrics: async (token: string) => {
    return apiCall('/reports/platform-metrics', { token });
  },
};