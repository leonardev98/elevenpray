"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { CommunityTab, PostType } from "./community-types";
import { StudentPageShell } from "../components/StudentPageShell";
import { CommunityTabs } from "./components/CommunityTabs";
import { CommunitySidebar } from "./components/CommunitySidebar";
import { NewPostModal } from "./components/NewPostModal";
import { FeedTab } from "./components/feed/FeedTab";
import { QuestionsTab } from "./components/questions/QuestionsTab";
import { TemplatesTab } from "./components/templates/TemplatesTab";

export default function StudentCommunityPage() {
  const t = useTranslations("studentCommunity");
  const [activeTab, setActiveTab] = useState<CommunityTab>("feed");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<PostType>("apunte");

  function openModal(type: PostType = "apunte") {
    setModalDefaultType(type);
    setModalOpen(true);
  }

  return (
    <StudentPageShell title={t("title")} maxWidth="max-w-7xl">
      <CommunityTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[7] lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "feed" && <FeedTab onOpenModal={() => openModal("apunte")} />}
              {activeTab === "questions" && (
                <QuestionsTab onOpenModal={(type) => openModal(type)} />
              )}
              {activeTab === "templates" && <TemplatesTab />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="min-w-0 flex-[3] shrink-0 lg:sticky lg:top-20">
          <CommunitySidebar />
        </div>
      </div>

      <NewPostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={modalDefaultType}
      />
    </StudentPageShell>
  );
}
