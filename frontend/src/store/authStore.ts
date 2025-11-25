import { create } from 'zustand';

interface Profile {
  id: number;
  name: string;
  description?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  profile?: Profile;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const loadAuthFromStorage = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user,
        token: parsed.token,
        isAuthenticated: !!parsed.token,
      };
    }
  } catch (error) {
    console.error('Error loading auth from storage:', error);
  }
  return { user: null, token: null, isAuthenticated: false };
};

const initialState = loadAuthFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  login: (token, user) => {
    const state = { token, user, isAuthenticated: true };
    localStorage.setItem('auth-storage', JSON.stringify(state));
    set(state);
  },
  logout: () => {
    localStorage.removeItem('auth-storage');
    set({ token: null, user: null, isAuthenticated: false });
  },
  setUser: (user) => {
    const currentState = useAuthStore.getState();
    const newState = { ...currentState, user };
    localStorage.setItem('auth-storage', JSON.stringify(newState));
    set(newState);
  },
}));

