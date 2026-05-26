"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import type { PublicUser } from "../lib/auth-api";
import {
  login as apiLogin,
  register as apiRegister,
  me,
  AuthError,
} from "../lib/auth-api";

const TOKEN_KEY = "elevenpray_token";
const USER_KEY = "elevenpray_user";

// 7 días. Debe estar alineado con backend JWT_EXPIRES_IN.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type CookieOptions = Parameters<typeof setCookie>[2];

/**
 * Opciones consistentes para la cookie de sesión.
 *
 * Notas:
 * - `httpOnly` NO se setea aquí: el navegador rechaza/ignora cookies
 *   `HttpOnly` asignadas vía document.cookie, lo que rompía la persistencia.
 *   Si en el futuro queremos HttpOnly real, hay que setearla desde una Route
 *   Handler del servidor (Set-Cookie response header), no desde el cliente.
 * - `sameSite: "lax"` es el estándar para auth en navegación normal y soporta
 *   correctamente redirecciones OAuth de top-level GET.
 * - `secure` solo en producción (HTTPS). En dev local sobre http:// debe
 *   estar en false o el navegador rechaza la cookie.
 */
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
    return JSON.parse(raw) as PublicUser;
  } catch {
    return null;
  }
}

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  const fromCookie = getCookie(TOKEN_KEY) as string | undefined | null;
  if (fromCookie) return fromCookie;
  // Fallback / migración desde versiones anteriores que solo usaban localStorage.
  return localStorage.getItem(TOKEN_KEY);
}

function persistSession(token: string, user: PublicUser) {
  setCookie(TOKEN_KEY, token, getCookieOptions());
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  deleteCookie(TOKEN_KEY, { path: "/" });
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

interface AuthContextValue {
  user: PublicUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  /**
   * Persiste una sesión ya obtenida (por ejemplo tras intercambiar un
   * id_token de Google contra el backend) sin volver a llamar al API.
   */
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

  /**
   * Estrategia de carga:
   * 1. Hidratar el estado inmediatamente desde cookie + localStorage para
   *    evitar el flash de "no autenticado" al volver a la página.
   * 2. Validar contra el backend en segundo plano. Solo si el backend
   *    confirma 401/403 limpiamos la sesión; ante errores de red, 5xx o cold
   *    starts mantenemos al usuario logueado y reintentamos en la próxima carga.
   */
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
    setIsLoading(false);

    // Renueva la cookie en cada visita para extender la ventana (rolling session).
    setCookie(TOKEN_KEY, storedToken, getCookieOptions());

    try {
      const fresh = await me(storedToken);
      const withRole: PublicUser = { ...fresh, role: fresh.role ?? "user" };
      setUser(withRole);
      localStorage.setItem(USER_KEY, JSON.stringify(withRole));
    } catch (err) {
      if (err instanceof AuthError) {
        clearSession();
        setToken(null);
        setUser(null);
      }
      // Cualquier otro error (red, 5xx, cold start) se ignora; el usuario
      // sigue logueado con los datos cacheados.
    }
  }, []);

  useEffect(() => {
    hydrateAndValidate();
  }, [hydrateAndValidate]);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: u } = await apiLogin(email, password);
    persistSession(accessToken, u);
    setToken(accessToken);
    setUser(u);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const { accessToken, user: u } = await apiRegister(email, password, name);
      persistSession(accessToken, u);
      setToken(accessToken);
      setUser(u);
    },
    [],
  );

  const setSession = useCallback((accessToken: string, u: PublicUser) => {
    persistSession(accessToken, u);
    setToken(accessToken);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    clearSession();
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
    const t = readStoredToken();
    if (!t) return;
    try {
      const fresh = await me(t);
      const withRole: PublicUser = { ...fresh, role: fresh.role ?? "user" };
      setUser(withRole);
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY, JSON.stringify(withRole));
      }
    } catch (err) {
      if (err instanceof AuthError) {
        clearSession();
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
