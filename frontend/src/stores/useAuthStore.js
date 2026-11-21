import { create } from 'zustand';
import { mockUser } from '../data/mockData';
import { authApi, userApi } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: mockUser,
  token: localStorage.getItem('repopilot_token') || null,
  isAuthenticated: true,
  isLoading: false,
  error: null,

  initializeFromToken: async () => {
    // Check if token was passed in URL query param (e.g. from GitHub OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      localStorage.setItem('repopilot_token', urlToken);
      set({ token: urlToken, isAuthenticated: true });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem('repopilot_token');
    if (!token) return;

    try {
      const res = await authApi.getMe();
      if (res.data?.user) {
        set({ user: res.data.user, isAuthenticated: true });
      }
    } catch (err) {
      // Token expired or invalid
      console.warn('Session verification fallback:', err.message);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login({ email, password });
      if (res.data?.token) {
        localStorage.setItem('repopilot_token', res.data.token);
        set({
          user: res.data.user,
          token: res.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
      const error = 'Unexpected response from the server.';
      set({ isLoading: false, error });
      return { success: false, error };
    } catch (err) {
      // Surface the failure instead of signing the visitor in with mock data.
      const error =
        err.response?.data?.error || 'Unable to reach the server. Please try again.';
      set({ isLoading: false, error });
      return { success: false, error };
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.signup({ name, email, password });
      if (res.data?.token) {
        localStorage.setItem('repopilot_token', res.data.token);
        set({
          user: res.data.user,
          token: res.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
      const error = 'Unexpected response from the server.';
      set({ isLoading: false, error });
      return { success: false, error };
    } catch (err) {
      const error =
        err.response?.data?.error || 'Registration failed. Please try again.';
      set({ isLoading: false, error });
      return { success: false, error };
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    localStorage.removeItem('repopilot_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUserProfile: async ({ name, avatarUrl }) => {
    try {
      const res = await userApi.updateProfile({ name, avatarUrl });
      if (res.data?.user) {
        set((state) => ({
          user: { ...state.user, ...res.data.user },
        }));
        return { success: true };
      }
    } catch (err) {
      set((state) => ({
        user: state.user ? {
          ...state.user,
          ...(name && { name }),
          ...(avatarUrl && { avatarUrl }),
        } : null,
      }));
      return { success: true };
    }
  },

  upgradePlan: (plan) => {
    set((state) => ({
      user: state.user ? {
        ...state.user,
        plan,
        aiRequestsLimit: plan === 'pro' ? 1000 : 50,
      } : null,
    }));
  },
}));
