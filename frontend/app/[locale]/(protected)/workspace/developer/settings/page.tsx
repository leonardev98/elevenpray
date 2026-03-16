"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { User, Palette, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSection } from "./components/sections/profile-section";
import { AppearanceSection } from "./components/sections/appearance-section";
import { NotificationsSection } from "./components/sections/notifications-section";
import { cn } from "@/lib/utils";

export type SettingsTabId =
  | "profile"
  | "appearance"
  | "notifications";

const TAB_CONFIG: { id: SettingsTabId; icon: React.ComponentType<{ className?: string }>; labelKey: string }[] = [
  { id: "profile", icon: User, labelKey: "profile" },
  { id: "appearance", icon: Palette, labelKey: "appearance" },
  { id: "notifications", icon: Bell, labelKey: "notifications" },
];

const contentVariants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -2 },
};

export default function SettingsPage() {
  const t = useTranslations("developerWorkspace.settingsPage");

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--app-fg)]">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-[var(--app-fg-muted)]">
          {t("subtitle")}
        </p>
      </header>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex w-full justify-start gap-6 border-b border-neutral-200 bg-transparent p-0 h-auto min-h-0 overflow-x-auto rounded-none dark:border-[var(--app-border)]">
          {TAB_CONFIG.map(({ id, icon: Icon, labelKey }) => (
            <TabsTrigger
              key={id}
              value={id}
              className={cn(
                "shrink-0 gap-2 rounded-none border-b-2 border-transparent pb-3 pt-0.5 text-sm font-medium text-neutral-500 transition-colors dark:text-[var(--app-fg-muted)]",
                "hover:text-black focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:hover:text-[var(--app-fg)]",
                "data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:font-medium dark:data-[state=active]:border-[var(--app-navy)] dark:data-[state=active]:text-[var(--app-navy)]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t(labelKey)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="mt-8 focus-visible:outline-none">
          <AnimatePresence mode="wait">
            <motion.div
              key="profile"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.15 }}
            >
              <ProfileSection />
            </motion.div>
          </AnimatePresence>
        </TabsContent>
        <TabsContent value="appearance" className="mt-8 focus-visible:outline-none">
          <AnimatePresence mode="wait">
            <motion.div
              key="appearance"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.15 }}
            >
              <AppearanceSection />
            </motion.div>
          </AnimatePresence>
        </TabsContent>
        <TabsContent value="notifications" className="mt-8 focus-visible:outline-none">
          <AnimatePresence mode="wait">
            <motion.div
              key="notifications"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.15 }}
            >
              <NotificationsSection />
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
