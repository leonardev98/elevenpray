"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { modalBackdrop, modalPanel } from "@/lib/animations";
import { changePassword } from "@/app/lib/auth-api";
import { toast } from "@/app/lib/toast";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20 transition-all duration-200";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  token,
}: ChangePasswordModalProps) {
  const t = useTranslations("developerWorkspace.settingsPage");
  const tCommon = useTranslations("common");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setRepeatPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!currentPassword.trim()) {
      toast.error(t("errorChangingPassword"), t("currentPasswordRequired"));
      return;
    }
    if (!newPassword.trim()) {
      toast.error(t("errorChangingPassword"), t("newPasswordRequired"));
      return;
    }
    if (newPassword.length < 4) {
      toast.error(t("errorChangingPassword"), t("passwordMinLength"));
      return;
    }
    if (newPassword !== repeatPassword) {
      toast.error(t("errorChangingPassword"), t("passwordsDoNotMatch"));
      return;
    }
    setSaving(true);
    try {
      await changePassword(token, currentPassword.trim(), newPassword);
      toast.success(t("passwordChanged"), "");
      resetForm();
      onClose();
    } catch (err) {
      toast.error(
        t("errorChangingPassword"),
        err instanceof Error ? err.message : "",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (!saving) {
      resetForm();
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
          {...modalBackdrop}
        >
          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
            {...modalPanel}
          >
            <div className="flex items-center justify-between border-b border-[var(--app-border)] px-6 py-4">
              <h2
                id="change-password-title"
                className="text-lg font-semibold text-[var(--app-fg)]"
              >
                {t("changePassword")}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className={cn(
                  "rounded-lg p-2 text-[var(--app-fg)]/70 transition-colors hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-navy)]/30 disabled:opacity-50",
                )}
                aria-label={tCommon("close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="current-password"
                  className="mb-1.5 block text-sm font-medium text-[var(--app-fg)]"
                >
                  {t("currentPassword")}
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                  placeholder={t("currentPassword")}
                  autoComplete="current-password"
                  disabled={saving}
                />
              </div>
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1.5 block text-sm font-medium text-[var(--app-fg)]"
                >
                  {t("newPassword")}
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder={t("newPassword")}
                  autoComplete="new-password"
                  disabled={saving}
                />
              </div>
              <div>
                <label
                  htmlFor="repeat-password"
                  className="mb-1.5 block text-sm font-medium text-[var(--app-fg)]"
                >
                  {t("repeatPassword")}
                </label>
                <input
                  id="repeat-password"
                  type="password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className={inputClass}
                  placeholder={t("repeatPassword")}
                  autoComplete="new-password"
                  disabled={saving}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-sm font-medium text-[var(--app-fg)] transition-all duration-200 hover:bg-[var(--app-bg)] disabled:opacity-50"
                >
                  {tCommon("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl border border-[var(--app-navy)] bg-[var(--app-navy)] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? t("saving") : t("save")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
