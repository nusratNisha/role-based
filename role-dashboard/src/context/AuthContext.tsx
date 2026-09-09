import React, { createContext, useState, useEffect, useCallback } from 'react';
import { AuthState, LoginCredentials, RegisterData } from '@/types';
import { api } from '@/api/client';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const user = await api.getCurrentUser();
          setState({ user, token, isAuthenticated: true });
        } catch {
          api.clearToken();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { user, token } = await api.login(credentials);
    api.setToken(token);
    setState({ user, token, isAuthenticated: true });
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const { user, token } = await api.register(data);
    api.setToken(token);
    setState({ user, token, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    setState({ user: null, token: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};