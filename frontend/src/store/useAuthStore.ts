import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'director' | 'user';
  department?: any;
  level?: number;
  designation?: string;
  accessibleDepartments?: any[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      updateUser: (user) => {
        set({ user });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      initialize: () => {
        const state = get();
        // If we have a token, mark as authenticated
        if (state.token && state.user) {
          set({ isAuthenticated: true, isLoading: false });
        } else {
          set({ isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Called when the state is hydrated from storage
        if (state) {
          state.initialize();
        }
      },
    }
  )
);
