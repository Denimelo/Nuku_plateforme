const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
  headers?: Record<string, string>;
}

async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = "GET", body, token, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  console.log(`Making API call to: ${API_BASE_URL}${endpoint}`); // Debug
  console.log("Config:", config); // Debug

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    console.log("Response status:", response.status); // Debug
    console.log("Response headers:", response.headers); // Debug

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error response:", errorText); // Debug
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText || `HTTP ${response.status}` };
      }
      
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("API Success response:", data); // Debug
    return data;
  } catch (error) {
    console.error("API Call error:", error);
    throw error;
  }
}

// ========== AUTH API SERVER ==========
export const authServerAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiCall("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      
      console.log("API Login response:", response); // Debug
      return response;
    } catch (error) {
      console.error("API Login error:", error);
      throw error;
    }
  },

  register: async (data: any) => {
    return apiCall("/auth/register", {
      method: "POST",
      body: data,
    });
  },

  verifyRegistration: async (data: any) => {
    return apiCall("/auth/register/verify", {
      method: "POST",
      body: data,
    });
  },

  resetPassword: async (email: string) => {
    return apiCall("/auth/reset-password", {
      method: "POST",
      body: { email },
    });
  },

  verifyPasswordReset: async (email: string, otp_code: string, new_password: string) => {
    return apiCall("/auth/reset-password/verify", {
      method: "POST",
      body: { email, otp_code, new_password },
    });
  },

  changePassword: async (token: string, current_password: string, new_password: string) => {
    return apiCall("/auth/change-password", {
      method: "POST",
      body: { current_password, new_password },
      token,
    });
  },

  me: async (token: string) => {
    return apiCall("/auth/me", { token });
  },
};

// ========== USERS API SERVER ==========
export const usersServerAPI = {
  getProfile: async (token: string) => {
    return apiCall("/users/me", { token });
  },

  updateProfile: async (token: string, data: any) => {
    return apiCall("/users/me", {
      method: "PUT",
      body: data,
      token,
    });
  },
};

// ========== ADMIN API SERVER ==========
export const adminServerAPI = {
  // Gestion des utilisateurs
  getUsers: async (token: string) => {
    return apiCall("/admin/users", { token });
  },

  getUser: async (token: string, userId: string) => {
    return apiCall(`/admin/users/${userId}`, { token });
  },

  activateUser: async (token: string, userId: string) => {
    return apiCall(`/admin/users/${userId}/activate`, {
      method: "PUT",
      token,
    });
  },

  deactivateUser: async (token: string, userId: string) => {
    return apiCall(`/admin/users/${userId}/deactivate`, {
      method: "PUT",
      token,
    });
  },

  updateUser: async (token: string, userId: string, userData: any) => {
    return apiCall(`/admin/users/${userId}`, {
      method: "PUT",
      body: userData,
      token,
    });
  },

  deleteUser: async (token: string, userId: string) => {
    return apiCall(`/admin/users/${userId}`, {
      method: "DELETE",
      token,
    });
  },

  // Gestion des experts
  getExperts: async (token: string) => {
    return apiCall("/admin/experts", { token });
  },

  getExpert: async (token: string, expertId: string) => {
    return apiCall(`/admin/experts/${expertId}`, { token });
  },


  createExpert: async (token: string, expertData: any) => {
    // Restructurer les données pour correspondre au schéma backend
    const backendData = {
      user: {
        first_name: expertData.user.first_name,
        last_name: expertData.user.last_name,
        email: expertData.user.email,
        phone: expertData.user.phone || null,
        user_type: "expert", // Obligatoire
        password: "TemporaryPassword123!" // Mot de passe temporaire généré côté frontend
      },
      specialization: expertData.specialization,
      years_of_experience: expertData.experience_years || 0,
      linkedin_profile: expertData.linkedin_url || null,
      cv_url: null,
      bio: expertData.bio || null,
      hourly_rate: expertData.hourly_rate || null,
      is_active: true
    };

    console.log("Données envoyées au backend:", JSON.stringify(backendData, null, 2)); // Debug amélioré

    return apiCall("/admin/experts", {
      method: "POST",
      body: backendData,
      token,
    });
  },

  deleteExpert: async (token: string, expertId: string) => {
    return apiCall(`/admin/experts/${expertId}`, {
      method: "DELETE",
      token,
    });
  },

  // Gestion des entrepreneurs
  getEntrepreneurs: async (token: string) => {
    return apiCall("/admin/entrepreneurs", { token });
  },

  getEntrepreneur: async (token: string, entrepreneurId: string) => {
    return apiCall(`/admin/entrepreneurs/${entrepreneurId}`, { token });
  },

  validateEntrepreneur: async (token: string, entrepreneurId: string) => {
    return apiCall(`/admin/entrepreneurs/${entrepreneurId}/validate`, {
      method: "PUT",
      token,
    });
  },

  rejectEntrepreneur: async (token: string, entrepreneurId: string) => {
    return apiCall(`/admin/entrepreneurs/${entrepreneurId}/reject`, {
      method: "PUT",
      token,
    });
  },
};

// ========== ENTREPRENEURS API SERVER ==========
export const entrepreneursServerAPI = {
  getProfile: async (token: string) => {
    return apiCall("/entrepreneur/me", { token });
  },

  updateProfile: async (token: string, data: any) => {
    return apiCall("/entrepreneur/me", {
      method: "PUT",
      body: data,
      token,
    });
  },

  updateDocuments: async (token: string, documents: any) => {
    return apiCall("/entrepreneur/me/documents", {
      method: "PUT",
      body: documents,
      token,
    });
  },

  getEntrepreneurs: async (token: string) => {
    return apiCall("/entrepreneurs/", { token });
  },

  getEntrepreneur: async (token: string, entrepreneurId: string) => {
    return apiCall(`/entrepreneurs/${entrepreneurId}`, { token });
  },
};

// ========== EXPERTS API SERVER ==========
export const expertsServerAPI = {
  getProfile: async (token: string) => {
    return apiCall("/expert/me", { token });
  },

  updateProfile: async (token: string, data: any) => {
    return apiCall("/expert/me", {
      method: "PUT",
      body: data,
      token,
    });
  },

  getExperts: async (token: string) => {
    return apiCall("/experts/", { token });
  },

  getExpert: async (token: string, expertId: string) => {
    return apiCall(`/experts/${expertId}`, { token });
  },
};

// ========== PROGRAMS API SERVER ==========
export const programsServerAPI = {
  getPrograms: async (token: string) => {
    return apiCall("/programs/", { token });
  },

  getProgram: async (token: string, programId: string) => {
    return apiCall(`/programs/${programId}`, { token });
  },

  applyToProgram: async (token: string, programId: string, data: any) => {
    return apiCall(`/programs/${programId}/apply`, {
      method: "POST",
      body: data,
      token,
    });
  },
};

// ========== MODULES API SERVER ==========
export const modulesServerAPI = {
  getModules: async (token: string, programId?: string) => {
    const endpoint = programId ? `/modules/program/${programId}` : "/modules/my-progress";
    return apiCall(endpoint, { token });
  },

  getModule: async (token: string, moduleId: string) => {
    return apiCall(`/modules/${moduleId}`, { token });
  },

  getModuleContents: async (token: string, moduleId: string) => {
    return apiCall(`/modules/${moduleId}/contents`, { token });
  },
};

// ========== MESSAGES API SERVER ==========
export const messagesServerAPI = {
  getConversations: async (token: string) => {
    return apiCall("/messages/conversations/", { token });
  },

  getMessages: async (token: string, conversationId: string) => {
    return apiCall(`/messages/conversations/${conversationId}`, { token });
  },
};

// ========== NOTIFICATIONS API SERVER ==========
export const notificationsServerAPI = {
  getNotifications: async (token: string) => {
    return apiCall("/notifications/", { token });
  },

  getNotificationCounts: async (token: string) => {
    return apiCall("/notifications/counts", { token });
  },
};

// ========== CALLS API SERVER ==========
export const callsServerAPI = {
  getUpcomingCalls: async (token: string) => {
    return apiCall("/calls/upcoming", { token });
  },

  getCall: async (token: string, callId: string) => {
    return apiCall(`/calls/${callId}`, { token });
  },
};

// ========== ASSIGNMENTS API SERVER ==========
export const assignmentsServerAPI = {
  getAssignments: async (token: string) => {
    return apiCall("/assignments/entrepreneur/available", { token });
  },

  getAssignment: async (token: string, assignmentId: string) => {
    return apiCall(`/assignments/${assignmentId}`, { token });
  },

  getMySubmissions: async (token: string) => {
    return apiCall("/assignments/entrepreneur/submissions", { token });
  },
};