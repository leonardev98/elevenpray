"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Sparkles, Users } from "lucide-react";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "../../../providers/auth-provider";
import { ThemeToggle } from "../../../components/theme-toggle";
import { toast } from "../../../lib/toast";
import { LocaleSwitcher } from "../../../components/locale-switcher";
import { MitsyyLogo } from "../../../components/mitsyy-logo";
import { GoogleIcon } from "../../../components/auth/google-icon";
import { PasswordField } from "../../../components/auth/password-field";

const MIN_PASSWORD_LENGTH = 4;

function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (password.length === 0) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length < MIN_PASSWORD_LENGTH) return 1;
  if (score <= 1) return 1;
  if (score === 2) return 2;
  return 3;
}

const strengthBarClass: Record<0 | 1 | 2 | 3, string> = {
  0: "bg-transparent",
  1: "bg-red-500",
  2: "bg-amber-500",
  3: "bg-emerald-500",
};

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tLanding = useTranslations("landing");

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  async function handleGoogleSignUp() {
    setError("");
    setGoogleLoading(true);
    try {
      const bridgeUrl = `/auth/bridge?next=${encodeURIComponent("/onboarding")}`;
      await signIn("google", { callbackUrl: bridgeUrl });
    } catch (err) {
      setGoogleLoading(false);
      const msg = err instanceof Error ? err.message : t("errorGoogleSignIn");
      setError(msg);
      toast.error(t("errorSignUp"), msg);
    }
  }

  function validateForm(): string | null {
    const trimmedName = name.trim();
    if (!trimmedName) return t("nameRequired");
    if (password.length < MIN_PASSWORD_LENGTH) return t("passwordTooShort");
    if (password !== confirmPassword) return t("passwordsDoNotMatch");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
      toast.success(t("accountCreatedTitle"), t("accountCreatedSubtitle"));
      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("errorSignUp");
      setError(msg);
      toast.error(t("errorSignUp"), msg);
    } finally {
      setLoading(false);
    }
  }

  const features = [
    { Icon: Sparkles, key: "featureNotes" as const },
    { Icon: BookOpen, key: "featureCourses" as const },
    { Icon: Users, key: "featureCommunity" as const },
  ];

  const inputClassName =
    "mt-1.5 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]/70 px-3.5 py-2.5 text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/40 transition focus:border-[var(--app-navy)] focus:bg-[var(--app-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/25 min-h-[48px]";

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.15fr_1fr]">
        <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12 xl:px-16">
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-[var(--app-primary-soft)] via-[var(--app-surface)] to-[var(--app-bg)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 22%, var(--app-navy) 0, transparent 38%), radial-gradient(circle at 82% 78%, var(--app-navy-muted) 0, transparent 42%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(var(--app-fg) 1px, transparent 1px), linear-gradient(90deg, var(--app-fg) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          <div className="relative">
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label={tCommon("backToHome")}
            >
              <MitsyyLogo size="lg" priority />
            </Link>
          </div>

          <div className="relative max-w-md">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--app-fg)] xl:text-4xl">
              {t("brandTagline")}
            </h2>
            <ul className="mt-8 space-y-4">
              {features.map(({ Icon, key }) => (
                <li key={key} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-surface)] text-[var(--app-navy)] ring-1 ring-[var(--app-border)]">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  </span>
                  <span className="text-sm leading-relaxed text-[var(--app-fg)]/80">
                    {t(key)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-center gap-3 text-xs text-[var(--app-fg)]/55">
            <span>© {new Date().getFullYear()} Mitsyy</span>
            <span aria-hidden>·</span>
            <span>{tLanding("title")}</span>
          </div>
        </aside>

        <main className="relative flex min-h-screen flex-col">
          <div className="flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-6 lg:px-10">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--app-fg)] transition hover:bg-[var(--app-surface)]"
              aria-label={tCommon("backToHome")}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
            <div className="w-full max-w-[420px]">
              <div className="lg:hidden">
                <MitsyyLogo size="lg" />
              </div>

              <header className="mt-6 lg:mt-0">
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--app-fg)]">
                  {t("createAccount")}
                </h1>
                <p className="mt-2 text-sm text-[var(--app-fg)]/60">
                  {t("createAccountSubtitle")}
                </p>
              </header>

              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={googleLoading || loading}
                className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm font-medium text-[var(--app-fg)] shadow-sm transition hover:border-[var(--app-navy)]/40 hover:bg-[var(--app-surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/30 focus:ring-offset-2 focus:ring-offset-[var(--app-bg)] disabled:cursor-not-allowed disabled:opacity-60 min-h-[48px]"
              >
                {googleLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-navy)]" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{t("continueWithGoogle")}</span>
              </button>

              <div className="relative my-6 flex items-center">
                <div className="flex-1 border-t border-[var(--app-border)]" />
                <span className="px-3 text-xs uppercase tracking-wider text-[var(--app-fg)]/50">
                  {t("orContinueWithEmail")}
                </span>
                <div className="flex-1 border-t border-[var(--app-border)]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400"
                  >
                    {error}
                  </p>
                )}

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[var(--app-fg)]/90"
                  >
                    {tCommon("name")}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder={t("namePlaceholder")}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--app-fg)]/90"
                  >
                    {tCommon("email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <PasswordField
                    id="password"
                    label={tCommon("password")}
                    value={password}
                    onChange={setPassword}
                    showPassword={showPassword}
                    onToggleVisibility={() => setShowPassword((v) => !v)}
                    showPasswordLabel={t("showPassword")}
                    hidePasswordLabel={t("hidePassword")}
                    autoComplete="new-password"
                    minLength={MIN_PASSWORD_LENGTH}
                  />
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1" aria-hidden>
                        {[1, 2, 3].map((segment) => (
                          <span
                            key={segment}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              passwordStrength >= segment
                                ? strengthBarClass[passwordStrength]
                                : "bg-[var(--app-border)]"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[var(--app-fg)]/50">{t("passwordHint")}</p>
                    </div>
                  )}
                </div>

                <div>
                  <PasswordField
                    id="confirmPassword"
                    label={t("confirmPassword")}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    showPassword={showConfirmPassword}
                    onToggleVisibility={() => setShowConfirmPassword((v) => !v)}
                    showPasswordLabel={t("showPassword")}
                    hidePasswordLabel={t("hidePassword")}
                    autoComplete="new-password"
                  />
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                      {t("passwordsDoNotMatch")}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading || !passwordsMatch}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[var(--app-navy)] py-3 text-sm font-semibold text-[var(--app-white)] shadow-sm transition hover:bg-[var(--app-navy-muted)] hover:shadow disabled:cursor-not-allowed disabled:opacity-60 min-h-[48px]"
                >
                  {loading ? t("creating") : t("register")}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-[var(--app-fg)]/60">
                {t("hasAccount")}{" "}
                <Link
                  href="/login"
                  className="font-medium text-[var(--app-navy)] underline-offset-4 hover:underline"
                >
                  {t("signInLink")}
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
