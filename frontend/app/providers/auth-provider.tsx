"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import type { PublicUser } from "../lib/auth-api";
import { login as apiLogin, register as apiRegister, me, googleLogin as apiGoogleLogin } from "../lib/auth-api";

const TOKEN_KEY = "elevenpray_token";
const USER_KEY = "elevenpray_user";

interface AuthContextValue {
  user: PublicUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: PublicUser) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStored = useCallback(async () => {
    if (typeof window === "undefined") return;
    
    // Try to get token from cookie first (more secure)
    const t = getCookie(TOKEN_KEY) as string | null;
    
    // Fallback to localStorage for migration purposes
    const localStorageToken = localStorage.getItem(TOKEN_KEY);
    const finalToken = t || localStorageToken;
    
    const u = localStorage.getItem(USER_KEY);
    if (finalToken && u) {
      try {
        const valid = await me(finalToken);
        const userWithRole: PublicUser = { ...valid, role: valid.role ?? "user" };
        setUser(userWithRole);
        setToken(finalToken);
        
        // Migrate to cookie if token was in localStorage
        if (localStorageToken && !t) {
          setCookie(TOKEN_KEY, finalToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/"
          });
          localStorage.removeItem(TOKEN_KEY);
        }
        
        localStorage.setItem(USER_KEY, JSON.stringify(userWithRole));
      } catch {
        deleteCookie(TOKEN_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadStored();
    const safety = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(safety);
  }, [loadStored]);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: u } = await apiLogin(email, password);
    
    // Store in HttpOnly cookie (more secure)
    setCookie(TOKEN_KEY, accessToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });
    
    // Keep user data in localStorage (non-sensitive)
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(accessToken);
    setUser(u);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const { accessToken, user: u } = await apiRegister(email, password, name);
      
      // Store in HttpOnly cookie
      setCookie(TOKEN_KEY, accessToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
      });
      
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      setToken(accessToken);
      setUser(u);
    },
    [],
  );

  const googleLogin = useCallback(async (idToken: string) => {
    const { accessToken, user: u } = await apiGoogleLogin(idToken);
    
    // Store in HttpOnly cookie
    setCookie(TOKEN_KEY, accessToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });
    
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(accessToken);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    deleteCookie(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((u: PublicUser) => {
    setUser(u);
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const t = getCookie(TOKEN_KEY) as string | null;
    // Fallback to localStorage for migration
    const localStorageToken = localStorage.getItem(TOKEN_KEY);
    const finalToken = t || localStorageToken;
    
    if (!finalToken) return;
    try {
      const valid = await me(finalToken);
      const userWithRole: PublicUser = { ...valid, role: valid.role ?? "user" };
      setUser(userWithRole);
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY, JSON.stringify(userWithRole));
      }
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(() => ({
    user, token, isLoading, login, register, googleLogin, logout, updateUser, refreshUser
  }), [user, token, isLoading, login, register, googleLogin, logout, updateUser, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
