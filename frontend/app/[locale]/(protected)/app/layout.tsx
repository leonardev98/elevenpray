"use client";

import { useEffect, useState } from "react";
import { CheckInProvider } from "./components/check-in-context";
import { GamificationProvider } from "./gamification/gamification-context";
import { LevelUpOverlay } from "./gamification/components/LevelUpOverlay";
import { EmotionalCheckInGate } from "./components/EmotionalCheckInGate";
import { StudentSidebar } from "./components/StudentSidebar";
import { RedirectToStudentOnboarding } from "./components/redirect-to-student-onboarding";
import { StudentShellProvider } from "./components/student-shell-context";

export default function StudentAppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <RedirectToStudentOnboarding>
      <CheckInProvider>
        <GamificationProvider>
          <div className="flex h-full min-h-0 flex-1 bg-[var(--app-bg)]">
            {mobileNavOpen && (
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setMobileNavOpen(false)}
              />
            )}
            <div className="fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto">
              <StudentSidebar
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
                mobileOpen={mobileNavOpen}
                onCloseMobile={() => setMobileNavOpen(false)}
              />
            </div>
            <StudentShellProvider openMobileMenu={() => setMobileNavOpen(true)}>
              <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">{children}</div>
            </StudentShellProvider>
          </div>
          <LevelUpOverlay />
          <EmotionalCheckInGate />
        </GamificationProvider>
      </CheckInProvider>
    </RedirectToStudentOnboarding>
  );
}
