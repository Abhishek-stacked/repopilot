import { create } from 'zustand';
import { authApi, userApi } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('repopilot_token') || null,
  isAuthenticated: false,
  // True until the stored token has been checked against the server, so the
  // route guard does not bounce a signed-in user to /login mid-verification.
  isBootstrapping: true,
  isLoading: false,
  error: null,

  initializeFromToken: async () => {
    // A token can also arrive as a query param from the GitHub OAuth redirect.
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      localStorage.setItem('repopilot_token', urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (!localStorage.getItem('repopilot_token')) {
      set({ isBootstrapping: false });
      return;
    }

    try {
      const res = await authApi.getMe();
      if (!res.data?.user) throw new Error('Session response contained no user.');
      set({
        user: res.data.user,
        token: localStorage.getItem('repopilot_token'),
        isAuthenticated: true,
      });
    } catch (err) {
      // Expired, forged or unrecognised token: stay signed out.
      localStorage.removeItem('repopilot_token');
      set({ user: null, token: null, isAuthenticated: false });
    } finally {
      set({ isBootstrapping: false });
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
      return { success: false, error: 'Unexpected response from the server.' };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Unable to save your profile.',
      };
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
