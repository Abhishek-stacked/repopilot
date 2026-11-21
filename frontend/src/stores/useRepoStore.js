import { create } from 'zustand';
import { repoApi } from '../services/api';

// Repositories come from the signed-in user's own records on the API
// (GET /api/repos is scoped by userId), not from a shared mock list.
export const useRepoStore = create((set, get) => ({
  repositories: [],
  selectedRepo: null,
  // The file browser is still unpopulated: the server has no file index yet
  // (RepositoryFile is empty), so there is nothing honest to show here.
  fileTree: [],
  isLoading: false,
  isIndexing: false,
  error: null,
  searchQuery: '',
  filterLanguage: 'All',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterLanguage: (lang) => set({ filterLanguage: lang }),

  selectRepo: (repoId) => {
    const repo = get().repositories.find((r) => r.id === repoId) || get().repositories[0] || null;
    set({ selectedRepo: repo });
  },

  loadRepositories: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await repoApi.list();
      const repositories = res.data?.repositories ?? [];
      set((state) => ({
        repositories,
        isLoading: false,
        selectedRepo:
          repositories.find((r) => r.id === state.selectedRepo?.id) ?? repositories[0] ?? null,
      }));
      return { success: true };
    } catch (err) {
      set({
        isLoading: false,
        error: err.response?.data?.error || 'Unable to load your repositories.',
      });
      return { success: false };
    }
  },

  connectRepository: async (fullName, isPrivate = false) => {
    set({ isLoading: true, error: null });
    try {
      const res = await repoApi.connect({ fullName, isPrivate });
      const connected = res.data?.repository;
      set((state) => ({
        isLoading: false,
        repositories: state.repositories.some((r) => r.id === connected?.id)
          ? state.repositories
          : [connected, ...state.repositories],
        selectedRepo: connected ?? state.selectedRepo,
      }));
      return { success: true, repository: connected };
    } catch (err) {
      const error = err.response?.data?.error || 'Unable to connect that repository.';
      set({ isLoading: false, error });
      return { success: false, error };
    }
  },

  triggerReindex: async (repoId) => {
    set({ isIndexing: true, error: null });
    try {
      const res = await repoApi.triggerIndex(repoId);
      const updated = res.data?.repository;
      set((state) => ({
        isIndexing: false,
        repositories: state.repositories.map((r) => (r.id === repoId ? { ...r, ...updated } : r)),
        selectedRepo:
          state.selectedRepo?.id === repoId ? { ...state.selectedRepo, ...updated } : state.selectedRepo,
      }));
      // The server finishes indexing in the background; refresh once so the
      // status shown is the server's, not a local guess.
      setTimeout(() => get().loadRepositories(), 3000);
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Unable to re-index that repository.';
      set({ isIndexing: false, error });
      return { success: false, error };
    }
  },
}));
