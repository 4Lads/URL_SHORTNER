import api from './api';
import { RegisterData, LoginData, User } from '../store/authStore';

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return api.post('/auth/register', data);
  },

  /**
   * Login user
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    return api.post('/auth/login', data);
  },

  /**
   * Get current user
   */
  me: async (): Promise<MeResponse> => {
    return api.get('/auth/me');
  },

  /**
   * Logout (client-side only, clear token)
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth-storage');
  },
};
