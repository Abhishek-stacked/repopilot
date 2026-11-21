import { create } from 'zustand';
import { mockRepositories, mockFileTree } from '../data/mockData';

export const useRepoStore = create((set, get) => ({
  repositories: mockRepositories,
  selectedRepo: mockRepositories[0],
  fileTree: mockFileTree,
  searchQuery: '',
  filterLanguage: 'All',
  isIndexing: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterLanguage: (lang) => set({ filterLanguage: lang }),
  
  selectRepo: (repoId) => {
    const repo = get().repositories.find((r) => r.id === repoId) || get().repositories[0];
    set({ selectedRepo: repo });
  },

  triggerReindex: (repoId) => {
    set((state) => ({
      repositories: state.repositories.map((r) => 
        r.id === repoId ? { ...r, indexStatus: 'indexing', indexedAt: 'Indexing now...' } : r
      ),
      selectedRepo: state.selectedRepo?.id === repoId 
        ? { ...state.selectedRepo, indexStatus: 'indexing', indexedAt: 'Indexing now...' }
        : state.selectedRepo
    }));

    // Simulate indexing completing
    setTimeout(() => {
      set((state) => ({
        repositories: state.repositories.map((r) => 
          r.id === repoId ? { ...r, indexStatus: 'ready', indexedAt: 'Just now' } : r
        ),
        selectedRepo: state.selectedRepo?.id === repoId 
          ? { ...state.selectedRepo, indexStatus: 'ready', indexedAt: 'Just now' }
          : state.selectedRepo
      }));
    }, 3500);
  },

  connectNewRepo: (newRepo) => {
    set((state) => ({
      repositories: [newRepo, ...state.repositories],
      selectedRepo: newRepo
    }));
  }
}));
