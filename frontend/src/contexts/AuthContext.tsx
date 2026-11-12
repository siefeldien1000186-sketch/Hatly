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
  quickLogin: (role: Role) => Promise<void>;
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

  const quickLogin = async (role: Role) => {
    setIsLoading(true);
    try {
      let phone = '01011112222';
      let pass = 'hatly123';

      if (role === 'CUSTOMER') {
        phone = '01011112222';
        pass = 'hatly123';
      } else if (role === 'DRIVER') {
        phone = '01022223333';
        pass = 'hatly123';
      } else if (role === 'STORE_OWNER') {
        phone = '01055556666';
        pass = 'hatly123';
      } else if (role === 'ADMIN') {
        phone = '01000000001';
        pass = 'admin123';
      }

      const res = await api.login(phone, pass);
      if (res.success && res.token && res.user) {
        setAuthToken(res.token);
        setToken(res.token);
        setUser(res.user);
        setActiveRole(role);
      }
    } catch (err: any) {
      console.error('Quick login error:', err);
    } finally {
      setIsLoading(false);
    }
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
        quickLogin,
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
