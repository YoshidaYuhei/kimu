// Store types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface UserActions {
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export type UserStore = UserState & UserActions;
