import { createContext } from "react";

export interface AuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: string | null;
  getAccessToken: () => Promise<string | null>;
  handleCallback: (code: string) => Promise<void>;
  login: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);
