"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/auth-provider";
import { ThemeToggle } from "./theme-toggle";

export function Landing() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (token && user) router.replace("/dashboard");
  }, [isLoading, token, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <p className="text-[var(--app-fg)]/60">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--app-bg)] px-4 py-8 sm:gap-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-[var(--app-fg)] sm:text-4xl">
        ElevenPray
      </h1>
      <p className="max-w-md text-center text-[var(--app-fg)]/70 text-sm sm:text-base">
        Crea y organiza tus rutinas semanales.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:gap-4">
        <Link
          href="/login"
          className="flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--app-navy)] px-6 py-3 font-medium text-[var(--app-white)] transition hover:opacity-90"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="flex min-h-[48px] items-center justify-center rounded-lg border-2 border-[var(--app-gold)] px-6 py-3 font-medium text-[var(--app-fg)] transition hover:bg-[var(--app-gold)]/10"
        >
          Registrarse
        </Link>
      </div>
    </div>
  );
}
