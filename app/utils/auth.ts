import { useState, useEffect } from 'react';
import { authAPI } from '../lib/api';
import type { User } from './types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (token) {
      authAPI.me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('auth_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.access_token);
    }
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore errors on logout
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    setUser(null);
  };

  return { user, loading, login, logout };
}