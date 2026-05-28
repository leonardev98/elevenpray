"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { CommunityFilters, CommunityTab } from "./community-types";
import { DEFAULT_FILTERS } from "./community-constants";
import { StudentPageShell } from "../components/StudentPageShell";
import { CommunityTabs } from "./components/CommunityTabs";
import { CommunitySidebar } from "./components/CommunitySidebar";
import { UploadTemplateModal } from "./components/UploadTemplateModal";
import { TemplatesTab } from "./components/templates/TemplatesTab";

export default function StudentCommunityPage() {
  const t = useTranslations("studentCommunity");
  const [activeTab, setActiveTab] = useState<CommunityTab>("templates");
  const [filters, setFilters] = useState<CommunityFilters>(DEFAULT_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const openModal = useCallback(() => setModalOpen(true), []);

  const handleSubmitted = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setActiveTab("my-contributions");
  }, []);

  const handleFiltersChange = useCallback((patch: Partial<CommunityFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleBrowseTemplates = useCallback(() => {
    setActiveTab("templates");
  }, []);

  return (
    <StudentPageShell title={t("title")} maxWidth="max-w-7xl">
      <CommunityTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[65] lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${refreshKey}-${filters.career}-${filters.types.join(",")}-${filters.universityFirst}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <TemplatesTab
                activeTab={activeTab}
                filters={filters}
                refreshKey={refreshKey}
                onOpenUpload={openModal}
                onBrowseTemplates={handleBrowseTemplates}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="min-w-0 flex-[35] shrink-0 lg:sticky lg:top-20">
          <CommunitySidebar filters={filters} onFiltersChange={handleFiltersChange} />
        </div>
      </div>

      <UploadTemplateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={handleSubmitted}
      />
    </StudentPageShell>
  );
}
