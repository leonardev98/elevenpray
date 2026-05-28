"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import type { PublicUser } from "../lib/auth-api";
import {
  login as apiLogin,
  register as apiRegister,
  me,
  AuthError,
  normalizePublicUser,
} from "../lib/auth-api";
import {
  saveStudentProfile,
  clearAllStudentProfiles,
  clearStudentProfileForUser,
} from "../[locale]/(protected)/app/lib/student-storage";

const TOKEN_KEY = "elevenpray_token";
const USER_KEY = "elevenpray_user";

// 7 días. Debe estar alineado con backend JWT_EXPIRES_IN.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type CookieOptions = Parameters<typeof setCookie>[2];

function getCookieOptions(): CookieOptions {
  return {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  };
}

function readStoredUser(): PublicUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return normalizePublicUser(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return null;
  }
}

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  const fromCookie = getCookie(TOKEN_KEY) as string | undefined | null;
  if (fromCookie) return fromCookie;
  return localStorage.getItem(TOKEN_KEY);
}

function syncStudentProfileCache(u: PublicUser): void {
  if (!u.studentProfile) return;
  saveStudentProfile(
    {
      name: u.name,
      university: u.studentProfile.university,
      career: u.studentProfile.career,
      cycle: u.studentProfile.cycle,
    },
    u.id,
  );
}

function persistSession(token: string, user: PublicUser) {
  syncStudentProfileCache(user);
  setCookie(TOKEN_KEY, token, getCookieOptions());
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Solo token y usuario en storage; no borra perfil estudiantil (vive en servidor). */
function clearAuthCredentials() {
  deleteCookie(TOKEN_KEY, { path: "/" });
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

function clearUserScopedLocalData(previousUserId?: string) {
  if (typeof window === "undefined") return;
  if (previousUserId) {
    clearStudentProfileForUser(previousUserId);
  } else {
    clearAllStudentProfiles();
  }
}

interface AuthContextValue {
  user: PublicUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  setSession: (token: string, user: PublicUser) => void;
  logout: () => void;
  updateUser: (user: PublicUser) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateAndValidate = useCallback(async () => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    const storedToken = readStoredToken();
    const storedUser = readStoredUser();

    if (!storedToken || !storedUser) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    setUser(storedUser);
    setCookie(TOKEN_KEY, storedToken, getCookieOptions());

    try {
      const fresh = await me(storedToken);
      const withRole: PublicUser = { ...fresh, role: fresh.role ?? "user" };
      setUser(withRole);
      syncStudentProfileCache(withRole);
      localStorage.setItem(USER_KEY, JSON.stringify(withRole));
    } catch (err) {
      if (err instanceof AuthError) {
        clearAuthCredentials();
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateAndValidate();
  }, [hydrateAndValidate]);

  function applySessionAndCleanup(accessToken: string, rawUser: PublicUser) {
    const u = normalizePublicUser(rawUser as unknown as Record<string, unknown>);
    const previous = readStoredUser();
    if (previous && previous.id !== u.id) {
      clearUserScopedLocalData(previous.id);
    }
    persistSession(accessToken, u);
    setToken(accessToken);
    setUser(u);
  }

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: u } = await apiLogin(email, password);
    applySessionAndCleanup(accessToken, u);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const { accessToken, user: u } = await apiRegister(email, password, name);
      applySessionAndCleanup(accessToken, u);
    },
    [],
  );

  const setSession = useCallback((accessToken: string, u: PublicUser) => {
    applySessionAndCleanup(accessToken, u);
  }, []);

  const logout = useCallback(() => {
    const previousId = readStoredUser()?.id;
    clearAuthCredentials();
    clearUserScopedLocalData(previousId);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((u: PublicUser) => {
    const normalized = normalizePublicUser(u as unknown as Record<string, unknown>);
    syncStudentProfileCache(normalized);
    setUser(normalized);
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const t = readStoredToken();
    if (!t) return;
    try {
      const fresh = await me(t);
      const withRole: PublicUser = { ...fresh, role: fresh.role ?? "user" };
      setUser(withRole);
      syncStudentProfileCache(withRole);
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY, JSON.stringify(withRole));
      }
    } catch (err) {
      if (err instanceof AuthError) {
        clearAuthCredentials();
        setToken(null);
        setUser(null);
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      setSession,
      logout,
      updateUser,
      refreshUser,
    }),
    [
      user,
      token,
      isLoading,
      login,
      register,
      setSession,
      logout,
      updateUser,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
