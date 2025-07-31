import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../lib/api';
import type { User, AuthResponse } from './types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Initialisation de l'authentification
  useEffect(() => {
    if (typeof window === 'undefined') {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (token) {
      authAPI
        .me()
        .then(user => setState({ user, loading: false, error: null }))
        .catch(error => {
          localStorage.removeItem('auth_token');
          setState({ user: null, loading: false, error: error.message });
        });
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authAPI.login(email, password);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.access_token);
      }
      
      setState({ user: response.user, loading: false, error: null });
      return response;
    } catch (error: any) {
      setState({ user: null, loading: false, error: error.message });
      throw error;
    }
  }, []);

  const register = useCallback(async (data: any): Promise<any> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authAPI.register(data);
      setState(prev => ({ ...prev, loading: false }));
      return response;
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore errors on logout
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    
    setState({ user: null, loading: false, error: null });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.user_type === 'admin',
    isExpert: state.user?.user_type === 'expert',
    isEntrepreneur: state.user?.user_type === 'entrepreneur',
  };
}