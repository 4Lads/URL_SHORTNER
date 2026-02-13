import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';

/**
 * Custom hook for authentication
 * Provides auth state and methods, automatically checks auth on mount
 */
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    _hasHydrated,
    setUser,
    setToken,
    setLoading,
    setError,
    logout,
    clearError,
    checkAuth,
  } = useAuthStore();

  // Check authentication on mount - only after hydration completes
  useEffect(() => {
    // Wait for Zustand persist to rehydrate before checking auth
    if (!_hasHydrated) {
      console.log('⏳ Waiting for store to rehydrate...');
      return;
    }

    // If user is already authenticated (from rehydration), skip check
    if (isAuthenticated && user) {
      console.log('✅ User already authenticated from storage:', user.email);
      return;
    }

    // If no user after rehydration, don't trigger unnecessary auth check
    console.log('ℹ️ No stored user after rehydration');
  }, [_hasHydrated, isAuthenticated, user]); // Re-run when hydration completes

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();

      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        return response.data;
      }

      throw new Error('Login failed');
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();

      const response = await authService.register({ email, password });

      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        return response.data;
      }

      throw new Error('Registration failed');
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    logout();
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout: handleLogout,
    clearError,
  };
};
