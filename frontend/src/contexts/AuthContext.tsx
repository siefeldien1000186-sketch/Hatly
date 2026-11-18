import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeRole: Role;
  isLoading: boolean;
  setActiveRole: (role: Role) => void;
  login: (identifier: string, pass: string, rememberMe?: boolean) => Promise<any>;
  register: (payload: any) => Promise<any>;
  forgotPassword: (identifier: string) => Promise<any>;
  resetPassword: (payload: any) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [activeRole, setActiveRole] = useState<Role>('CUSTOMER');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auto-fetch profile on initial load if token exists
  useEffect(() => {
    const initAuth = async () => {
      const existingToken = getAuthToken();
      if (existingToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            setActiveRole(res.user.role);
          }
        } catch (error) {
          console.warn('Session expired or invalid token', error);
          removeAuthToken();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier: string, pass: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const res = await api.login(identifier, pass, rememberMe);
      if (res.success && res.token && res.user) {
        setAuthToken(res.token);
        setToken(res.token);
        setUser(res.user);
        setActiveRole(res.user.role);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      if (res.success && res.token && res.user) {
        setAuthToken(res.token);
        setToken(res.token);
        setUser(res.user);
        setActiveRole(res.user.role);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (identifier: string) => {
    return await api.forgotPassword(identifier);
  };

  const resetPassword = async (payload: any) => {
    return await api.resetPassword(payload);
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
    setActiveRole('CUSTOMER');
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (e) {
      // silently ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeRole,
        isLoading,
        setActiveRole,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
