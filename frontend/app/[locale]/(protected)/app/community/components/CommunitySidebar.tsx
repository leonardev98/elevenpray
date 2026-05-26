"use client";

import { useState } from "react";
import { Award, GraduationCap, Search, TrendingUp } from "lucide-react";
import { SectionLabel } from "../../wellbeing/components/SectionLabel";
import {
  FREQUENT_COURSES,
  MOCK_TOP_CONTRIBUTORS,
  MOCK_TRENDS,
  UNIVERSITY_FILTERS,
  USER_UNIVERSITY,
} from "../community-mock-data";
import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/utils";

export function CommunitySidebar() {
  const [activeUniversity, setActiveUniversity] = useState<string>("Todas");

  return (
    <aside className="space-y-6">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-fg-muted)]"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Buscar en la comunidad..."
          className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] py-2.5 pl-10 pr-3 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)] focus:outline-none"
          readOnly
        />
      </div>

      <section>
        <SectionLabel>TU UNIVERSIDAD</SectionLabel>
        <div className="student-card flex flex-col items-center gap-2 p-5 text-center">
          <div className="flex items-center gap-2 rounded-full bg-[var(--app-primary-soft)] px-4 py-2">
            <GraduationCap className="h-5 w-5 text-[var(--app-primary)]" aria-hidden />
            <span className="text-lg font-bold text-[var(--app-primary)]">{USER_UNIVERSITY.code}</span>
          </div>
          <p className="text-sm text-[var(--app-fg)]">{USER_UNIVERSITY.fullName}</p>
          <p className="text-xs text-[var(--app-fg-muted)]">Ves contenido de tu universidad primero</p>
        </div>
      </section>

      <section>
        <SectionLabel>FILTRAR</SectionLabel>
        <div className="mb-3 flex flex-wrap gap-2">
          {UNIVERSITY_FILTERS.map((uni) => (
            <button
              key={uni}
              type="button"
              onClick={() => setActiveUniversity(uni)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                activeUniversity === uni
                  ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                  : "bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              )}
            >
              {uni}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {FREQUENT_COURSES.map((course) => (
            <span
              key={course}
              className="rounded-full border border-[var(--app-border)] px-3 py-1 text-xs text-[var(--app-fg-muted)]"
            >
              {course}
            </span>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>TENDENCIAS ESTA SEMANA</SectionLabel>
        <ul className="student-card divide-y divide-[var(--app-border)]">
          {MOCK_TRENDS.map((item) => (
            <li key={item.id} className="flex items-start gap-3 px-4 py-3">
              <span className="text-xs text-[var(--app-fg-muted)]">{item.rank}</span>
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[var(--app-primary)]" aria-hidden />
              <span className="text-sm text-[var(--app-fg-secondary)]">
                {item.topic} · {item.postCount} posts
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionLabel>TOP APORTES DEL MES</SectionLabel>
        <ul className="space-y-2">
          {MOCK_TOP_CONTRIBUTORS.map((user, index) => (
            <li key={user.id} className="student-card flex items-center gap-3 p-3">
              <UserAvatar initial={user.initial} colorClass={user.color} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--app-fg)]">{user.name}</p>
                <p className="text-xs text-[var(--app-fg-muted)]">{user.university}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {index === 0 && (
                  <Award className="h-4 w-4 text-[var(--xp)]" aria-label="Primer lugar" />
                )}
                <span className="rounded-[var(--radius-sm)] bg-[var(--bg-input)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                  {user.contributions} aportes
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
