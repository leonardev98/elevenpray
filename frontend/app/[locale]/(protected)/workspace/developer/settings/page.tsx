"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  FolderHeart,
  Lock,
  Palette,
  Bell,
  Shield,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSection } from "./components/sections/profile-section";
import { AccountSection } from "./components/sections/account-section";
import { SecuritySection } from "./components/sections/security-section";
import { AppearanceSection } from "./components/sections/appearance-section";
import { NotificationsSection } from "./components/sections/notifications-section";
import { PrivacySection } from "./components/sections/privacy-section";

export type SettingsTabId =
  | "profile"
  | "account"
  | "security"
  | "appearance"
  | "notifications"
  | "privacy";

const TAB_CONFIG: { id: SettingsTabId; icon: React.ComponentType<{ className?: string }>; labelKey: string }[] = [
  { id: "profile", icon: User, labelKey: "profile" },
  { id: "account", icon: FolderHeart, labelKey: "account" },
  { id: "security", icon: Lock, labelKey: "security" },
  { id: "appearance", icon: Palette, labelKey: "appearance" },
  { id: "notifications", icon: Bell, labelKey: "notifications" },
  { id: "privacy", icon: Shield, labelKey: "privacy" },
];

const contentVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

export default function SettingsPage() {
  const t = useTranslations("developerWorkspace.settingsPage");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--app-fg)]">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-[var(--app-fg)]/60">{t("subtitle")}</p>
      </header>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start border-b border-[var(--app-border)] bg-transparent p-0 h-auto min-h-10 overflow-x-auto">
          {TAB_CONFIG.map(({ id, icon: Icon, labelKey }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="shrink-0 rounded-t-lg border-b-2 border-transparent data-[state=active]:border-[var(--app-navy)] data-[state=active]:text-[var(--app-navy)]"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t(labelKey)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="profile"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <ProfileSection />
            </motion.div>
          </AnimatePresence>
        </TabsContent>
        <TabsContent value="account" className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="account"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <AccountSection />
            </motion.div>
          </AnimatePresence>
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="security"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <SecuritySection />
            </motion.div>
          </AnimatePresence>
        </TabsContent>
        <TabsContent value="appearance" className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="appearance"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <AppearanceSection />
            </motion.div>
          </AnimatePresence>
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="notifications"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <NotificationsSection />
            </motion.div>
          </AnimatePresence>
        </TabsContent>
        <TabsContent value="privacy" className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="privacy"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <PrivacySection />
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
