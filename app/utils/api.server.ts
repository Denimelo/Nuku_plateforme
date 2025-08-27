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

// ========== UPLOAD ==========
async function apiUpload(endpoint: string, formData: FormData, token: string) {
  const config: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Ne pas définir Content-Type - le navigateur gère automatiquement pour FormData
    },
    body: formData,
  };

  console.log(`Making upload to: ${API_BASE_URL}${endpoint}`);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText || `HTTP ${response.status}` };
      }
      
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('Upload success response:', data);
    return data;
  } catch (error) {
    console.error('Upload error:', error);
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
  // Profil expert
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

  // Dashboard expert
  getDashboard: async (token: string) => {
    return apiCall('/expert/me/dashboard', { token });
  },

  getStats: async (token: string) => {
    return apiCall('/expert/me/stats', { token });
  },

  // Programmes de l'expert
  getMyPrograms: async (token: string) => {
    return apiCall('/expert/me/programs', { token });
  },

  // Entrepreneurs accompagnés
  getMyEntrepreneurs: async (token: string) => {
    return apiCall('/expert/me/entrepreneurs', { token });
  },

  // Annuaire public
  getDirectory: async (token: string, specialization?: string, skip: number = 0, limit: number = 20) => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (specialization) params.append('specialization', specialization);
    return apiCall(`/expert/directory?${params.toString()}`, { token });
  },

  // Classement
  getLeaderboard: async (token: string, limit: number = 10) => {
    return apiCall(`/expert/leaderboard?limit=${limit}`, { token });
  },

  // Upload CV
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

  // Disponibilités et planning
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

  // Anciens endpoints conservés pour compatibilité
  getExperts: async (token: string) => {
    return apiCall('/experts/', { token });
  },

  getExpert: async (token: string, expertId: string) => {
    return apiCall(`/experts/${expertId}`, { token });
  },

  // Gestion des modules par les experts
  getMyModules: async (token: string) => {
    return apiCall('/modules/expert/my-modules', { token });
  },

  createModule: async (token: string, moduleData: any) => {
    return apiCall('/modules/', {
      method: 'POST',
      body: moduleData,
      token,
    });
  },

  updateModule: async (token: string, moduleId: string, moduleData: any) => {
    return apiCall(`/modules/${moduleId}`, {
      method: 'PUT',
      body: moduleData,
      token,
    });
  },

  deleteModule: async (token: string, moduleId: string) => {
    return apiCall(`/modules/${moduleId}`, {
      method: 'DELETE',
      token,
    });
  },

  publishModule: async (token: string, moduleId: string) => {
    return apiCall(`/modules/${moduleId}/publish`, {
      method: 'POST',
      token,
    });
  },

  getModuleContents: async (token: string, moduleId: string) => {
    return apiCall(`/modules/${moduleId}/contents`, { token });
  },

  updateModuleContent: async (token: string, contentId: string, contentData: any) => {
    return apiCall(`/modules/contents/${contentId}`, {
      method: 'PUT',
      body: contentData,
      token,
    });
  },

  deleteModuleContent: async (token: string, contentId: string) => {
    return apiCall(`/modules/contents/${contentId}`, {
      method: 'DELETE',
      token,
    });
  },

  reorderModuleContents: async (token: string, moduleId: string, contentOrders: any[]) => {
    return apiCall(`/modules/${moduleId}/contents/reorder`, {
      method: 'PUT',
      body: contentOrders,
      token,
    });
  },

  // Statistiques des modules
  getModuleStats: async (token: string, moduleId: string) => {
    return apiCall(`/modules/${moduleId}/stats`, { token });
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

  // Gestion des experts assignés
  assignExpertToProgram: async (token: string, programId: string, expertId: string, role: string = "mentor") => {
    return apiCall(`/programs/${programId}/experts`, {
      method: 'POST',
      body: { expert_id: expertId, role },
      token,
    });
  },

  removeExpertFromProgram: async (token: string, programId: string, expertId: string) => {
    return apiCall(`/programs/${programId}/experts/${expertId}`, {
      method: 'DELETE',
      token,
    });
  },

  getProgramExperts: async (token: string, programId: string) => {
    return apiCall(`/programs/${programId}/experts`, { token });
  },

  updateExpertRole: async (token: string, programId: string, expertId: string, role: string) => {
    return apiCall(`/programs/${programId}/experts/${expertId}`, {
      method: 'PUT',
      body: { role },
      token,
    });
  },

  // Gestion des participants/inscriptions
  removeParticipantFromProgram: async (token: string, programId: string, entrepreneurId: string) => {
    return apiCall(`/programs/${programId}/participants/${entrepreneurId}`, {
      method: 'DELETE',
      token,
    });
  },

  updateParticipantStatus: async (token: string, programId: string, entrepreneurId: string, status: string) => {
    return apiCall(`/programs/${programId}/participants/${entrepreneurId}/status`, {
      method: 'PUT',
      body: { completion_status: status },
      token,
    });
  },

  // Inscriptions en attente (si vous gérez un processus d'approbation)
  getPendingEnrollments: async (token: string, programId: string) => {
    return apiCall(`/programs/${programId}/enrollments/pending`, { token });
  },

  approveEnrollment: async (token: string, programId: string, entrepreneurId: string) => {
    return apiCall(`/programs/${programId}/enrollments/${entrepreneurId}/approve`, {
      method: 'PUT',
      token,
    });
  },

  rejectEnrollment: async (token: string, programId: string, entrepreneurId: string, reason?: string) => {
    return apiCall(`/programs/${programId}/enrollments/${entrepreneurId}/reject`, {
      method: 'PUT',
      body: { reason },
      token,
    });
  },

  // Statistiques avancées
  getProgramDetailedStats: async (token: string, programId: string) => {
    return apiCall(`/programs/${programId}/stats/detailed`, { token });
  },

  getProgramProgressReport: async (token: string, programId: string) => {
    return apiCall(`/programs/${programId}/progress-report`, { token });
  },
};



// ========== MODULES API SERVER ==========
export const modulesServerAPI = {
  // Récupération générale
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
  
  addModuleContent: async (token: string, moduleId: string, contentData: FormData) => {
    const config: RequestInit = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Ne pas définir Content-Type pour FormData
      },
      body: contentData,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/modules/${moduleId}/contents`, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || `HTTP ${response.status}` };
        }
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  updateModuleContent: async (token: string, contentId: string, contentData: any) => {
    return apiCall(`/modules/contents/${contentId}`, {
      method: 'PUT',
      body: contentData,
      token,
    });
  },

  deleteModuleContent: async (token: string, contentId: string) => {
    return apiCall(`/modules/contents/${contentId}`, {
      method: 'DELETE',
      token,
    });
  },

  reorderModuleContents: async (token: string, moduleId: string, contentOrders: any[]) => {
    return apiCall(`/modules/${moduleId}/contents/reorder`, {
      method: 'PUT',
      body: contentOrders,
      token,
    });
  },

  // Expert - récupérer ses modules
  getMyModules: async (token: string) => {
    return apiCall('/modules/expert/my-modules', { token });
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

  publishModule: async (token: string, moduleId: string) => {
    return apiCall(`/modules/${moduleId}/publish`, {
      method: "POST",
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

  updateContent: async (token: string, contentId: string, contentData: any) => {
    return apiCall(`/modules/contents/${contentId}`, {
      method: "PUT",
      body: contentData,
      token,
    });
  },

  deleteContent: async (token: string, contentId: string) => {
    return apiCall(`/modules/contents/${contentId}`, {
      method: "DELETE",
      token,
    });
  },

  reorderContents: async (token: string, moduleId: string, contentOrders: any[]) => {
    return apiCall(`/modules/${moduleId}/contents/reorder`, {
      method: "PUT",
      body: contentOrders,
      token,
    });
  },

  // Recherche et stats
  searchModules: async (token: string, query: string, filters?: any) => {
    const params = new URLSearchParams({ query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    return apiCall(`/modules/search?${params.toString()}`, { token });
  },

  getModuleStats: async (token: string, moduleId: string) => {
    return apiCall(`/modules/${moduleId}/stats`, { token });
  },

  // Progression (pour entrepreneurs)
  startModule: async (token: string, moduleId: string) => {
    return apiCall(`/modules/${moduleId}/progress/start`, {
      method: "POST",
      token,
    });
  },

  markContentCompleted: async (token: string, moduleId: string, contentId: string, timeSpent?: number) => {
    const params = timeSpent ? `?time_spent=${timeSpent}` : '';
    return apiCall(`/modules/${moduleId}/progress/content/${contentId}${params}`, {
      method: "POST",
      token,
    });
  },

  getModuleProgress: async (token: string, moduleId: string) => {
    return apiCall(`/modules/${moduleId}/progress`, { token });
  },

  getMyProgress: async (token: string, programId?: string) => {
    const params = programId ? `?program_id=${programId}` : '';
    return apiCall(`/modules/my-progress${params}`, { token });
  },

};

// ========== MESSAGES API SERVER ==========
export const messagesServerAPI = {
  // ========== ENVOI ET GESTION DES MESSAGES ==========
  sendMessage: async (token: string, messageData: any) => {
    return apiCall('/messages/', {
      method: 'POST',
      body: messageData,
      token,
    });
  },

  sendMessageWithAttachment: async (token: string, formData: FormData) => {
    return apiUpload('/messages/with-attachment', formData, token);
  },

  getMessage: async (token: string, messageId: string) => {
    return apiCall(`/messages/${messageId}`, { token });
  },

  updateMessage: async (token: string, messageId: string, updateData: any) => {
    return apiCall(`/messages/${messageId}`, {
      method: 'PUT',
      body: updateData,
      token,
    });
  },

  deleteMessage: async (token: string, messageId: string, deleteForAll: boolean = false) => {
    return apiCall(`/messages/${messageId}?delete_for_all=${deleteForAll}`, {
      method: 'DELETE',
      token,
    });
  },

  // ========== CONVERSATIONS ==========
  getConversations: async (token: string, includeArchived: boolean = false, limit: number = 20) => {
    const params = new URLSearchParams({
      include_archived: includeArchived.toString(),
      limit: limit.toString(),
    });
    return apiCall(`/messages/conversations/?${params.toString()}`, { token });
  },

  getConversationMessages: async (token: string, conversationId: string, skip: number = 0, limit: number = 50) => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    return apiCall(`/messages/conversations/${conversationId}?${params.toString()}`, { token });
  },

  markConversationAsRead: async (token: string, conversationId: string) => {
    return apiCall(`/messages/conversations/${conversationId}/read`, {
      method: 'PUT',
      token,
    });
  },

  // ========== RÉACTIONS ==========
  addReaction: async (token: string, messageId: string, emoji: string, reactionType: string) => {
    return apiCall(`/messages/${messageId}/reactions`, {
      method: 'POST',
      body: { emoji, reaction_type: reactionType },
      token,
    });
  },

  removeReaction: async (token: string, messageId: string) => {
    return apiCall(`/messages/${messageId}/reactions`, {
      method: 'DELETE',
      token,
    });
  },

  // ========== RECHERCHE ==========
  searchMessages: async (token: string, filters: any, skip: number = 0, limit: number = 20) => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    return apiCall(`/messages/search?${params.toString()}`, {
      method: 'POST',
      body: filters,
      token,
    });
  },

  // ========== STATISTIQUES - ROUTES CORRIGÉES ==========
  getMessageStats: async (token: string) => {
    return apiCall('/messages/stats', { token });
  },

  // CORRECTION: L'endpoint correct selon votre backend
  getUnreadCount: async (token: string) => {
    return apiCall('/messages/unread-count', { token });
  },

  // CORRECTION: L'endpoint correct selon votre backend  
  getMessagingSummary: async (token: string) => {
    return apiCall('/messages/summary', { token });
  },

  // ========== THREADS ==========
  getMessageThread: async (token: string, messageId: string) => {
    return apiCall(`/messages/${messageId}/thread`, { token });
  },

  // ========== UTILITAIRES ==========
  markAsDelivered: async (token: string, messageId: string) => {
    return apiCall(`/messages/mark-delivered/${messageId}`, {
      method: 'POST',
      token,
    });
  },

  // ========== SIMPLIFIED FUNCTIONS FOR EXPERTS ==========
  startConversationWithEntrepreneur: async (token: string, entrepreneurId: string, initialMessage: string, subject?: string) => {
    return apiCall('/messages/', {
      method: 'POST',
      body: {
        receiver_id: entrepreneurId,
        message_text: initialMessage,
        subject: subject,
        message_type: 'direct'
      },
      token,
    });
  },

  // Messages de groupe/programme
  sendProgramMessage: async (token: string, programId: string, messageText: string, subject?: string) => {
    return apiCall('/messages/', {
      method: 'POST',
      body: {
        program_id: programId,
        message_text: messageText,
        subject: subject,
        message_type: 'group'
      },
      token,
    });
  },

  // Répondre à un message
  replyToMessage: async (token: string, parentMessageId: string, messageText: string, receiverId?: string) => {
    return apiCall('/messages/', {
      method: 'POST',
      body: {
        parent_message_id: parentMessageId,
        receiver_id: receiverId,
        message_text: messageText,
        message_type: 'direct'
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

// ========== SETTINGS API SERVER ==========
export const settingsServerAPI = {
  // Récupérer les paramètres système
  getSystemSettings: async (token: string) => {
    return apiCall('/admin/settings/system', { token });
  },

  // Mettre à jour les paramètres système
  updateSystemSettings: async (token: string, settings: any) => {
    return apiCall('/admin/settings/system', {
      method: 'PUT',
      body: settings,
      token,
    });
  },

  // Récupérer les paramètres de plateforme
  getPlatformSettings: async (token: string) => {
    return apiCall('/admin/settings/platform', { token });
  },

  // Mettre à jour les paramètres de plateforme
  updatePlatformSettings: async (token: string, settings: any) => {
    return apiCall('/admin/settings/platform', {
      method: 'PUT',
      body: settings,
      token,
    });
  },

  // Récupérer les paramètres d'email
  getEmailSettings: async (token: string) => {
    return apiCall('/admin/settings/email', { token });
  },

  // Mettre à jour les paramètres d'email
  updateEmailSettings: async (token: string, settings: any) => {
    return apiCall('/admin/settings/email', {
      method: 'PUT',
      body: settings,
      token,
    });
  },

  // Tester la configuration email
  testEmailConfiguration: async (token: string, testEmail: string) => {
    return apiCall('/admin/settings/email/test', {
      method: 'POST',
      body: { test_email: testEmail },
      token,
    });
  },

  // Récupérer les logs système
  getSystemLogs: async (token: string, level?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    
    return apiCall(`/admin/settings/logs${query}`, { token });
  },

  // Backup de la base de données
  createBackup: async (token: string) => {
    return apiCall('/admin/settings/backup', {
      method: 'POST',
      token,
    });
  },

  // Récupérer les statistiques de stockage
  getStorageStats: async (token: string) => {
    return apiCall('/admin/settings/storage/stats', { token });
  },

  // Nettoyer le cache
  clearCache: async (token: string, cacheType?: string) => {
    const params = cacheType ? `?cache_type=${cacheType}` : '';
    return apiCall(`/admin/settings/cache/clear${params}`, {
      method: 'POST',
      token,
    });
  },
};

// Mise à jour de l'export existant reportsServerAPI pour inclure les nouvelles routes
export const reportsServerAPI = {
  // Métriques de la plateforme
  getPlatformMetrics: async (token: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    
    return apiCall(`/admin/reports/platform-metrics${query}`, { token });
  },

  // Activité des utilisateurs
  getUserActivity: async (token: string, userId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    
    return apiCall(`/admin/reports/user-activity${query}`, { token });
  },

  // Statistiques par programme
  getProgramStats: async (token: string, programId: string) => {
    return apiCall(`/admin/reports/programs/${programId}/stats`, { token });
  },

  // Export de rapport
  exportReport: async (token: string, reportType: string, format: string, startDate?: string, endDate?: string) => {
    const formData = new FormData();
    formData.append('report_type', reportType);
    formData.append('format', format);
    if (startDate) formData.append('start_date', startDate);
    if (endDate) formData.append('end_date', endDate);

    const response = await fetch(`${API_BASE_URL}/admin/reports/export`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  },
};

// ========== MENTORING API SERVER ==========
export const mentoringServerAPI = {
  // Assigner mentor à entrepreneur
  assignMentor: async (token: string, expertId: string, entrepreneurId: string) => {
    return apiCall('/admin/mentoring/assign', {
      method: 'POST',
      body: { expert_id: expertId, entrepreneur_id: entrepreneurId },
      token,
    });
  },

  // Terminer relation de mentorat
  completeMentoring: async (token: string, mentoringId: string) => {
    return apiCall(`/admin/mentoring/${mentoringId}/complete`, {
      method: 'PUT',
      token,
    });
  },

  // Statistiques de mentorat
  getStats: async (token: string) => {
    return apiCall('/admin/mentoring/stats', { token });
  },

  // Liste des mentorés d'un expert
  getExpertMentees: async (token: string, expertId: string) => {
    return apiCall(`/admin/mentoring/expert/${expertId}/mentees`, { token });
  },
};