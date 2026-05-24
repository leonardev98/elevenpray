"use client";

import { StudentPageShell } from "../components/StudentPageShell";
import { SectionLabel } from "../wellbeing/components/SectionLabel";
import { BadgeGrid } from "../gamification/components/BadgeGrid";
import { DemoControls } from "../gamification/components/DemoControls";
import { GamificationHero } from "../gamification/components/GamificationHero";
import { RankingList } from "../gamification/components/RankingList";
import { StreakCard } from "../gamification/components/StreakCard";
import { StreakHistoryGrid } from "../gamification/components/StreakHistoryGrid";
import { XpWeekChart } from "../gamification/components/XpWeekChart";
import { useGamification } from "../gamification/gamification-context";

export default function LogrosPage() {
  const { data } = useGamification();

  return (
    <StudentPageShell title="Logros" maxWidth="max-w-4xl">
      <div className="space-y-10 pb-8">
        <GamificationHero />

        <section>
          <SectionLabel>TUS RACHAS</SectionLabel>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <StreakCard variant="estudio" staggerOnMount />
              <StreakHistoryGrid
                semanas={data.historialSemanas.estudio}
                variant="estudio"
              />
            </div>
            <div>
              <StreakCard variant="tareas" staggerOnMount />
              <StreakHistoryGrid
                semanas={data.historialSemanas.tareas}
                variant="tareas"
              />
            </div>
          </div>
        </section>

        <section>
          <SectionLabel>ACTIVIDAD ESTA SEMANA</SectionLabel>
          <div className="mt-4">
            <XpWeekChart />
          </div>
        </section>

        <section>
          <SectionLabel>LOGROS E INSIGNIAS</SectionLabel>
          <div className="mt-4">
            <BadgeGrid />
          </div>
        </section>

        <section>
          <SectionLabel>RANKING SEMANAL</SectionLabel>
          <p className="mt-1 text-xs text-[var(--app-fg-muted)]">
            Estudiantes de tu universidad esta semana
          </p>
          <div className="mt-4">
            <RankingList />
          </div>
        </section>

        <DemoControls />
      </div>
    </StudentPageShell>
  );
}
