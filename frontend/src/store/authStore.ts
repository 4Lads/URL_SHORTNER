import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  plan: string;
  createdAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isCheckingAuth: boolean;
  _hasHydrated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isCheckingAuth: false,
      _hasHydrated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),

      clearError: () => set({ error: null }),

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          // This will be replaced with actual API call in services
          // Placeholder for now
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Login failed');
          }

          const data = await response.json();

          if (data.success && data.data) {
            get().setToken(data.data.token);
            get().setUser(data.data.user);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Registration failed');
          }

          const responseData = await response.json();

          if (responseData.success && responseData.data) {
            get().setToken(responseData.data.token);
            get().setUser(responseData.data.user);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed';
          set({ error: message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        localStorage.removeItem('token');
      },

      checkAuth: async () => {
        // Prevent concurrent auth checks
        if (get().isCheckingAuth) {
          console.log('Auth check already in progress, skipping...');
          return;
        }

        const token = localStorage.getItem('token');
        const storedUser = get().user;

        // If no token, logout
        if (!token) {
          if (storedUser) {
            console.log('No token found, logging out...');
            get().logout();
          }
          return;
        }

        // If user already set and authenticated, skip check
        if (storedUser && get().isAuthenticated) {
          console.log('User already authenticated, skipping auth check');
          return;
        }

        try {
          set({ isCheckingAuth: true });
          console.log('Starting auth check...');

          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          console.log('Auth check response:', response.status);

          if (!response.ok) {
            // Only logout if token is actually invalid (401)
            // Don't logout on network errors or server errors
            if (response.status === 401) {
              console.log('Token invalid (401), logging out...');
              get().logout();
            } else {
              console.log('Auth check failed with status:', response.status);
            }
            return;
          }

          const data = await response.json();
          console.log('Auth check data:', data);

          if (data.success && data.data && data.data.user) {
            get().setUser(data.data.user);
            get().setToken(token);
            console.log('Auth check successful, user set');
          } else {
            console.log('Auth check failed: invalid data structure');
            get().logout();
          }
        } catch (error) {
          console.error('Auth check failed with error:', error);
          // Don't logout on network errors, only on actual auth failures
          // The user might just have a temporary network issue
        } finally {
          set({ isCheckingAuth: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydrating from localStorage, update isAuthenticated and mark as hydrated
        if (state) {
          if (state.user && state.token) {
            state.isAuthenticated = true;
            console.log('✅ Auth rehydrated: user authenticated', state.user.email);
          } else {
            console.log('✅ Auth rehydrated: no user found');
          }
          state._hasHydrated = true;
        }
      },
    }
  )
);
