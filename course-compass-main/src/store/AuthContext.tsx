import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/api/auth.api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ pending?: boolean; message?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("lms_token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("lms_token");
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data.data);
          setToken(savedToken);
        } catch {
          localStorage.removeItem("lms_token");
          localStorage.removeItem("lms_user");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("lms_token", newToken);
    localStorage.setItem("lms_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (name: string, email: string, password: string, role = "user") => {
    const res = await authApi.register({ name, email, password, role: role as "user" | "admin" });
    
    // If user is pending approval, don't store a token — just return pending info
    if (res.data.pending) {
      return { pending: true, message: res.data.message };
    }

    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("lms_token", newToken);
    localStorage.setItem("lms_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return {};
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("lms_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
