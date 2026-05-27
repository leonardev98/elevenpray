"use client";

import { DailyQuoteSection } from "../(protected)/app/wellbeing/components/DailyQuoteSection";
import { MoodCheckInSection } from "../(protected)/app/wellbeing/components/MoodCheckInSection";
import { BreathingSection } from "../(protected)/app/wellbeing/components/BreathingSection";
import { PomodoroSection } from "../(protected)/app/wellbeing/components/PomodoroSection";
import { ConsistencyHeatmap } from "../(protected)/app/wellbeing/components/ConsistencyHeatmap";
import { EmotionalWeekSection } from "../(protected)/app/wellbeing/components/EmotionalWeekSection";
import { ResourcesSection } from "../(protected)/app/wellbeing/components/ResourcesSection";
import { Sparkles, Heart, Target } from "lucide-react";

export default function WellbeingPreviewPage() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-elevated)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-[var(--app-primary)]" />
              <div>
                <h1 className="text-xl font-bold text-[var(--app-fg)]">Vista Previa - Bienestar</h1>
                <p className="text-sm text-[var(--app-fg-muted)]">Versión temporal para revisión de diseño</p>
              </div>
            </div>
            <div className="rounded-xl bg-[var(--app-primary)]/10 px-4 py-2">
              <p className="text-xs font-semibold text-[var(--app-primary)]">PREVIEW MODE</p>
            </div>
          </div>
        </div>

        {/* Hero Section - Welcome & Quick Actions */}
        <section className="mb-8 rounded-2xl bg-gradient-to-br from-[var(--app-primary)]/10 via-[var(--app-surface-elevated)] to-[var(--app-surface-soft)] p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--app-primary)]" />
                <h1 className="text-2xl font-bold text-[var(--app-fg)]">
                  Bienvenido a tu espacio de calma
                </h1>
              </div>
              <p className="text-sm text-[var(--app-fg-secondary)] leading-relaxed">
                Tómate un momento para conectar contigo mismo. Aquí encontrarás herramientas para manejar el estrés, mejorar tu concentración y cuidar tu bienestar mental mientras estudias.
              </p>
            </div>
            <div className="flex gap-3 md:shrink-0">
              <div className="flex items-center gap-2 rounded-xl bg-[var(--app-surface)] px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md">
                <Heart className="h-5 w-5 text-[var(--app-primary)]" />
                <div>
                  <p className="text-xs text-[var(--app-fg-muted)]">Hoy</p>
                  <p className="text-sm font-semibold text-[var(--app-fg)]">Check-in</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-[var(--app-surface)] px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md">
                <Target className="h-5 w-5 text-[var(--app-primary)]" />
                <div>
                  <p className="text-xs text-[var(--app-fg-muted)]">Meta</p>
                  <p className="text-sm font-semibold text-[var(--app-fg)]">5 min</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Primary Tools */}
          <div className="lg:col-span-2 space-y-8">
            <DailyQuoteSection />
            <MoodCheckInSection />
            
            {/* Interactive Tools Section */}
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--app-fg-muted)]">
                <span className="h-1 w-8 rounded-full bg-[var(--app-primary)]" />
                Herramientas Interactivas
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <BreathingSection />
                <PomodoroSection />
              </div>
            </section>

            <ResourcesSection />
          </div>

          {/* Right Column - Progress & Stats */}
          <div className="space-y-6">
            <div className="sticky top-4 space-y-6">
              <ConsistencyHeatmap />
              <EmotionalWeekSection />
              
              {/* Quick Tips Card */}
              <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-elevated)] p-5 shadow-[var(--app-shadow-card)] transition-all duration-300 hover:shadow-lg">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--app-fg)]">
                  <Sparkles className="h-4 w-4 text-[var(--app-primary)]" />
                  Tip del día
                </h3>
                <p className="text-sm text-[var(--app-fg-secondary)] leading-relaxed">
                  Pequeñas pausas de 5 minutos cada hora pueden mejorar tu concentración hasta en un 40%.
                </p>
              </section>
            </div>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-[var(--app-fg-muted)]/70">
          Esta es una vista previa temporal para revisión de diseño. No incluye funcionalidad de autenticación.
        </p>
      </div>
    </div>
  );
}
