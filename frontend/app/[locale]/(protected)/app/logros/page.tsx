"use client";

import { StudentPageShell } from "../components/StudentPageShell";
import { SectionLabel } from "../wellbeing/components/SectionLabel";
import { BadgeGrid } from "../gamification/components/BadgeGrid";
import { CycleShieldCard } from "../gamification/components/CycleShieldCard";
import { DemoControls } from "../gamification/components/DemoControls";
import { GamificationHero } from "../gamification/components/GamificationHero";
import { MissionsPanel } from "../gamification/components/MissionsPanel";
import { RankingList } from "../gamification/components/RankingList";
import { ReferralSection } from "../gamification/components/ReferralSection";
import { SharedStreakCard } from "../gamification/components/SharedStreakCard";
import { StreakCard } from "../gamification/components/StreakCard";
import { StreakHistoryGrid } from "../gamification/components/StreakHistoryGrid";
import { WeeklyLeagueCard } from "../gamification/components/WeeklyLeagueCard";
import { XpEconomyCard } from "../gamification/components/XpEconomyCard";
import { XpWeekChart } from "../gamification/components/XpWeekChart";
import { useGamification } from "../gamification/gamification-context";

export default function LogrosPage() {
  const { data } = useGamification();

  return (
    <StudentPageShell title="Logros" maxWidth="max-w-4xl">
      <div className="space-y-10 pb-8">
        <GamificationHero />

        <section>
          <SectionLabel>REFERIDOS</SectionLabel>
          <p className="mt-1 text-xs text-[var(--app-fg-muted)]">
            Invita compañeros — tú y ellos ganan al activar con tu código
          </p>
          <div className="mt-4">
            <ReferralSection />
          </div>
        </section>

        <section>
          <SectionLabel>MISIONES Y ECONOMÍA XP</SectionLabel>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <MissionsPanel />
            <XpEconomyCard />
          </div>
        </section>

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
          <SectionLabel>RETENCIÓN Y COMPETENCIA</SectionLabel>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <CycleShieldCard />
            <div className="lg:col-span-2">
              <WeeklyLeagueCard />
            </div>
          </div>
          <div className="mt-4">
            <SharedStreakCard />
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
          <p className="mt-1 text-xs text-[var(--app-fg-muted)]">
            Señales de identidad visibles en tu perfil de comunidad
          </p>
          <div className="mt-4">
            <BadgeGrid />
          </div>
        </section>

        <section>
          <SectionLabel>RANKING SEMANAL</SectionLabel>
          <p className="mt-1 text-xs text-[var(--app-fg-muted)]">
            {data.extras.liga.carrera} · {data.extras.liga.universidad} — se actualiza cada lunes
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
