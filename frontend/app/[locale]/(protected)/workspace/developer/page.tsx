"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PromptEditorCard } from "./components/widgets/PromptEditorCard";
import { PromptOfTheDayCard } from "./components/widgets/PromptOfTheDayCard";
import { SnippetsQuickCard } from "./components/widgets/SnippetsQuickCard";
import { DevScratchpadCard } from "./components/widgets/DevScratchpadCard";
import { DevChallengeCard } from "./components/widgets/DevChallengeCard";
import { TipsDevCard } from "./components/widgets/TipsDevCard";
import { PromptHistoryCard } from "./components/widgets/PromptHistoryCard";
import { DashboardGrid, DashboardGridCol } from "./components/dashboard/DashboardGrid";

export default function DeveloperWorkspaceDashboardPage() {
  const [composerValue, setComposerValue] = useState("");

  return (
    <div className="developer-dashboard mx-auto max-w-[1400px] space-y-6 overflow-y-auto pb-8">
      {/* Prompt Editor — full width */}
      <PromptEditorCard
        value={composerValue}
        onChange={setComposerValue}
      />

      {/* Grid: col1 = Prompt del día + Snippets | col2 = Scratchpad | col3 = Challenge + Tips */}
      <DashboardGrid>
        <DashboardGridCol>
          <PromptOfTheDayCard />
          <SnippetsQuickCard />
        </DashboardGridCol>
        <DashboardGridCol>
          <DevScratchpadCard />
        </DashboardGridCol>
        <DashboardGridCol>
          <DevChallengeCard />
          <TipsDevCard />
        </DashboardGridCol>
      </DashboardGrid>

      {/* Historial de prompts — full width */}
      <PromptHistoryCard onContentLoad={setComposerValue} />
    </div>
  );
}
