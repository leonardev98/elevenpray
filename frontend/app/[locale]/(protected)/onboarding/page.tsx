"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  School,
  Sparkles,
  User,
  Wrench,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "../../../providers/auth-provider";
import {
  isStudentOnboardingComplete,
  upsertStudentProfile,
  type StudentProgramType,
} from "@/app/lib/auth-api";
import { getStudentProfile, saveStudentProfile } from "../app/lib/student-storage";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentSearchableField } from "@/components/student/StudentSearchableField";
import {
  findUniversityOption,
  getCareersForUniversity,
  isCareerInUniversityCatalog,
  PERUVIAN_CAREERS,
  PERUVIAN_UNIVERSITIES,
} from "@/data/peru-student-onboarding";
import {
  findTechnicalInstituteOption,
  getInstitutionBannerStyle,
  PERUVIAN_TECHNICAL_INSTITUTES,
} from "@/data/peru-technical-institutes";
import { getUniversityPreviewMeta } from "@/data/peru-university-preview";
import { CreatingAccountScreen } from "./components/CreatingAccountScreen";
import { Card as HeroCard } from "@heroui/react";

const CYCLE_YEARS = [2024, 2025, 2026, 2027, 2028] as const;
const CYCLE_PERIOD_VALUES = ["I", "II", "Verano"] as const;
type CyclePeriod = (typeof CYCLE_PERIOD_VALUES)[number];

const MIN_CREATING_MS = 700;
/** Prueba UX: fondo institucional a pantalla completa + formulario centrado. Ocultar panel lateral, no borrarlo. */
const ONBOARDING_INSTITUTION_FULLSCREEN_BG = true;
const ONBOARDING_BTN_PRIMARY =
  "inline-flex h-10 min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--app-navy)] px-6 text-sm font-semibold text-[var(--app-white)] shadow-[var(--app-shadow-button)] transition hover:bg-[var(--app-navy-muted)] disabled:cursor-not-allowed disabled:opacity-60";
const ONBOARDING_BTN_SECONDARY =
  "inline-flex h-9 min-h-9 items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-sm font-medium text-[var(--app-fg)] transition hover:bg-[var(--app-surface-elevated)]";
/** Campos glass sobre foto oscurecida (texto claro) */
const ONBOARDING_GLASS_FIELD_ON_PHOTO =
  "rounded-2xl border border-white/35 bg-white/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-md";
const ONBOARDING_GLASS_FIELD_FOCUS_ON_PHOTO =
  "focus-within:border-white/55 focus-within:ring-2 focus-within:ring-white/20";
/** Campos glass sin foto (fondo claro, texto oscuro) */
const ONBOARDING_GLASS_FIELD_LIGHT =
  "rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]/80 text-[var(--app-fg)] shadow-[var(--app-shadow-input)] backdrop-blur-md";
const ONBOARDING_GLASS_FIELD_FOCUS_LIGHT =
  "focus-within:border-[var(--app-primary)]/50 focus-within:ring-2 focus-within:ring-[var(--app-primary)]/20";
const ONBOARDING_GLASS_BTN_SECONDARY =
  "inline-flex h-10 min-h-10 items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20";

function glassFieldClasses(onPhoto: boolean, invalid?: boolean) {
  if (invalid) return "rounded-2xl border-[var(--error)]/60";
  return onPhoto
    ? cn(ONBOARDING_GLASS_FIELD_ON_PHOTO, ONBOARDING_GLASS_FIELD_FOCUS_ON_PHOTO)
    : cn(ONBOARDING_GLASS_FIELD_LIGHT, ONBOARDING_GLASS_FIELD_FOCUS_LIGHT);
}

type WizardStep = "programType" | "institution" | "creating";

function parseCycle(cycle: string): { year: string; period: CyclePeriod } | null {
  const match = /^(\d{4})-(I|II|Verano)$/.exec(cycle.trim());
  if (!match) return null;
  return { year: match[1], period: match[2] as CyclePeriod };
}

function resolveInstitutionId(
  programType: StudentProgramType,
  institutionName: string,
): string | null {
  if (!institutionName.trim()) return null;
  if (programType === "tecnico") {
    return findTechnicalInstituteOption(institutionName)?.id ?? null;
  }
  return findUniversityOption(institutionName)?.id ?? null;
}

function OnboardingHeader({
  title,
  subtitle,
  step,
  emphasis = "default",
  onDark = false,
}: {
  title: string;
  subtitle?: string;
  step: WizardStep;
  emphasis?: "default" | "hero";
  /** Texto legible sobre fondo fotográfico oscurecido */
  onDark?: boolean;
}) {
  return (
    <header
      className={cn(
        "shrink-0 text-center",
        emphasis === "default" && "mb-3",
        onDark && !subtitle && "mb-2",
      )}
    >
      <div
        className={cn(
          "mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl shadow-[var(--app-shadow-card)]",
          onDark
            ? "bg-white/15 text-white backdrop-blur-sm"
            : "bg-[var(--app-primary)] text-[var(--app-white)]",
        )}
      >
        <GraduationCap className="size-5" aria-hidden />
      </div>
      <h1
        className={cn(
          "font-bold tracking-tight",
          onDark ? "text-white" : "text-[var(--app-fg)]",
          emphasis === "hero" ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl",
        )}
      >
        {title}
      </h1>
      {subtitle ? (
        <p
          className={cn(
            "mx-auto mt-2 max-w-md",
            onDark ? "text-white/80" : "text-[var(--app-fg-secondary)]",
            emphasis === "hero" ? "text-sm sm:text-base" : "text-xs sm:text-sm",
          )}
        >
          {subtitle}
        </p>
      ) : null}
      <div className="mx-auto mt-4 flex w-44 justify-center gap-1.5" aria-hidden>
        <div
          className={cn(
            "h-1 flex-1 rounded-full",
            onDark ? "bg-white" : "bg-[var(--app-primary)]",
          )}
        />
        <div
          className={cn(
            "h-1 flex-1 rounded-full transition-colors duration-300",
            step === "institution"
              ? onDark
                ? "bg-white"
                : "bg-[var(--app-primary)]"
              : onDark
                ? "bg-white/35"
                : "bg-[var(--app-border)]",
          )}
        />
      </div>
    </header>
  );
}

function InstitutionFullscreenBackdrop({
  imageUrl,
  gradientBackground,
  alt,
  showGradient,
}: {
  imageUrl: string | null;
  gradientBackground: string;
  alt: string;
  showGradient: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {imageUrl ? (
        <img
          key={imageUrl}
          src={imageUrl}
          alt={alt}
          className="absolute inset-0 h-full w-full scale-105 object-cover transition-opacity duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : showGradient ? (
        <div
          key={gradientBackground}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ background: gradientBackground }}
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--app-bg)]" />
      )}
      {imageUrl || showGradient ? (
        <>
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/55" />
        </>
      ) : null}
    </div>
  );
}

function FormSectionTitle({
  icon,
  title,
  compact = false,
  glassOnPhoto = false,
}: {
  icon: ReactNode;
  title: string;
  compact?: boolean;
  /** Texto claro solo cuando hay foto de universidad detrás */
  glassOnPhoto?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl",
          compact ? "size-6" : "size-7",
          glassOnPhoto
            ? "bg-white/15 text-white"
            : "bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
        )}
      >
        {icon}
      </span>
      <h2
        className={cn(
          "font-semibold uppercase tracking-wide",
          compact ? "text-[10px]" : "text-xs",
          glassOnPhoto ? "text-white/75" : "text-[var(--app-fg-secondary)]",
        )}
      >
        {title}
      </h2>
    </div>
  );
}

function OnboardingFormCard({
  glass,
  glassOnPhoto,
  className,
  children,
}: {
  glass: boolean;
  glassOnPhoto: boolean;
  className?: string;
  children: ReactNode;
}) {
  const cls = cn("flex min-h-0 flex-col overflow-hidden", className);
  if (glass) {
    return (
      <div className={cn(cls, "relative isolate rounded-[1.75rem]")}>
        <div
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-[28px] backdrop-saturate-[1.65]",
            glassOnPhoto
              ? "border border-white/40 bg-white/[0.12]"
              : "border border-[var(--app-border)] bg-[var(--app-surface)]/70",
          )}
          aria-hidden
        />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[inherit]">
          {children}
        </div>
      </div>
    );
  }
  return (
    <HeroCard
      className={cn(
        cls,
        "border border-[var(--app-border)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-card)]",
      )}
    >
      {children}
    </HeroCard>
  );
}

function FormSectionDivider({ glassOnPhoto = false }: { glassOnPhoto?: boolean }) {
  return (
    <div
      className={cn(
        "h-px bg-gradient-to-r from-transparent to-transparent",
        glassOnPhoto ? "via-white/25" : "via-[var(--app-border)]",
      )}
      aria-hidden
    />
  );
}

function ProgramTypeOptionCard({
  selected,
  onSelect,
  icon,
  iconTone,
  title,
  description,
  ariaLabel,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  iconTone: "tecnico" | "universidad";
  title: string;
  description: string;
  ariaLabel: string;
}) {
  const iconToneClass =
    iconTone === "tecnico"
      ? "bg-[var(--course-1-bg)] text-[var(--course-1-fg)]"
      : "bg-[var(--course-4-bg)] text-[var(--course-4-fg)]";

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onSelect}
      className={cn(
        "group flex min-h-[168px] w-full flex-col items-center justify-center gap-4 rounded-[var(--app-radius-card)] border px-5 py-7 text-center transition-all duration-200 ease-out",
        "bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]",
        selected
          ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] ring-2 ring-[var(--app-primary)]/25"
          : "border-[var(--app-border)] hover:border-[var(--app-primary)]/45 hover:bg-[var(--app-surface-elevated)]",
      )}
    >
      <span
        className={cn(
          "flex size-16 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-[1.02]",
          iconToneClass,
          selected && "scale-[1.02]",
        )}
      >
        {icon}
      </span>
      <span className="space-y-1">
        <span className="block text-base font-bold text-[var(--app-fg)]">{title}</span>
        <span className="block text-sm text-[var(--app-fg-secondary)]">{description}</span>
      </span>
    </button>
  );
}

function InstitutionPreviewPanel({
  hasSelection,
  imageUrl,
  gradientBackground,
  placeholderTitle,
  alt,
}: {
  hasSelection: boolean;
  imageUrl: string | null;
  gradientBackground: string;
  placeholderTitle: string;
  alt: string;
}) {
  return (
    <div className="relative h-full min-h-[200px] w-full overflow-hidden rounded-2xl lg:min-h-0">
      {hasSelection && imageUrl ? (
        <div key={imageUrl} className="absolute inset-0 animate-in fade-in-0 duration-300">
          <img
            src={imageUrl}
            alt={alt}
            className="h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </div>
      ) : hasSelection ? (
        <div
          className="absolute inset-0 animate-in fade-in-0 duration-300"
          style={{ background: gradientBackground }}
          aria-hidden
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--app-surface-soft)] px-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            <GraduationCap className="size-7" aria-hidden />
          </div>
          <p className="max-w-[220px] text-sm font-medium text-[var(--app-fg-secondary)]">
            {placeholderTitle}
          </p>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const { user, token, refreshUser, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations("onboardingStudent");
  const defaultYear = useMemo(() => String(new Date().getFullYear()), []);

  const [step, setStep] = useState<WizardStep>("programType");
  const [programType, setProgramType] = useState<StudentProgramType | null>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [institution, setInstitution] = useState("");
  const [career, setCareer] = useState("");
  const [prefillInstitution, setPrefillInstitution] = useState("");
  const [prefillCareer, setPrefillCareer] = useState("");
  const [cycleYear, setCycleYear] = useState(defaultYear);
  const [cyclePeriod, setCyclePeriod] = useState<CyclePeriod>("I");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user && isStudentOnboardingComplete(user)) {
      router.replace("/app");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const fromLocal = user?.id ? getStudentProfile(user.id) : null;
    const fromServer = user?.studentProfile;

    if (fromLocal?.name) setName(fromLocal.name);
    else if (user?.name) setName(user.name);

    const institutionVal = fromServer?.university ?? fromLocal?.university;
    const careerVal = fromServer?.career ?? fromLocal?.career;
    const cycleVal = fromServer?.cycle ?? fromLocal?.cycle;
    const typeVal = fromServer?.institutionType;

    if (typeVal === "tecnico" || typeVal === "universidad") {
      setProgramType(typeVal);
      if (institutionVal) setStep("institution");
    }
    if (institutionVal) {
      setInstitution(institutionVal);
      setPrefillInstitution((prev) => prev || institutionVal);
    }
    if (careerVal) {
      setCareer(careerVal);
      setPrefillCareer((prev) => prev || careerVal);
    }
    if (cycleVal) {
      const parsed = parseCycle(cycleVal);
      if (parsed) {
        setCycleYear(parsed.year);
        setCyclePeriod(parsed.period);
      }
    }
  }, [user?.id, user?.name, user?.studentProfile]);

  const institutionOptions =
    programType === "tecnico" ? PERUVIAN_TECHNICAL_INSTITUTES : PERUVIAN_UNIVERSITIES;

  const selectedInstitutionId = useMemo(
    () => (programType ? resolveInstitutionId(programType, institution) : null),
    [programType, institution],
  );

  const bannerStyle = useMemo(
    () =>
      programType
        ? getInstitutionBannerStyle(selectedInstitutionId, programType)
        : getInstitutionBannerStyle(null, "universidad"),
    [programType, selectedInstitutionId],
  );

  const selectedUniversity =
    programType === "universidad" ? findUniversityOption(institution) : undefined;
  const selectedUniversityPreview = useMemo(
    () => getUniversityPreviewMeta(selectedUniversity),
    [selectedUniversity],
  );

  const careerOptions = useMemo(() => {
    if (programType !== "universidad" || !institution.trim()) {
      return programType === "tecnico" ? PERUVIAN_CAREERS : [];
    }
    if (selectedUniversity) return getCareersForUniversity(selectedUniversity.id);
    return PERUVIAN_CAREERS;
  }, [programType, institution, selectedUniversity]);

  const careerFieldKey =
    programType === "universidad"
      ? selectedUniversity?.id ?? (institution.trim() ? "custom-uni" : "no-uni")
      : "tecnico-career";

  useEffect(() => {
    if (programType !== "universidad" || !career.trim() || !institution.trim()) return;
    if (!selectedUniversity) return;
    if (!isCareerInUniversityCatalog(career, institution)) {
      setCareer("");
      setPrefillCareer("");
    }
  }, [programType, institution, selectedUniversity, career]);

  const cycle = `${cycleYear}-${cyclePeriod}`;

  function periodLabel(p: CyclePeriod): string {
    if (p === "I") return t("periodSemester1");
    if (p === "II") return t("periodSemester2");
    return t("periodSummer");
  }

  const handleFinish = useCallback(async () => {
    setSubmitAttempted(true);
    setSubmitError(null);
    if (
      !programType ||
      !name.trim() ||
      !institution.trim() ||
      !career.trim() ||
      !cycleYear ||
      !cyclePeriod
    ) {
      return;
    }
    if (!token || !user?.id) {
      setSubmitError(t("submitError"));
      return;
    }

    const profile = {
      name: name.trim(),
      university: institution.trim(),
      career: career.trim(),
      cycle: cycle.trim(),
      institutionType: programType,
    };

    setStep("creating");
    const startedAt = Date.now();

    try {
      await upsertStudentProfile(token, profile);
      saveStudentProfile(profile, user.id);
      await refreshUser();
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_CREATING_MS) {
        await new Promise((r) => setTimeout(r, MIN_CREATING_MS - elapsed));
      }
      router.push("/app");
      router.refresh();
    } catch (err) {
      setStep("institution");
      setSubmitError(err instanceof Error ? err.message : t("submitError"));
    }
  }, [
    programType,
    name,
    institution,
    career,
    cycleYear,
    cyclePeriod,
    cycle,
    token,
    user?.id,
    refreshUser,
    router,
    t,
  ]);

  const invalidName = submitAttempted && !name.trim();
  const invalidInstitution = submitAttempted && !institution.trim();
  const invalidCareer = submitAttempted && !career.trim();

  const hasInstitutionSelection = Boolean(institution.trim());
  const previewImageUrl = useMemo(() => {
    if (!hasInstitutionSelection) return null;
    if (programType === "universidad") {
      if (selectedUniversityPreview?.imageUrl) return selectedUniversityPreview.imageUrl;
      return `https://picsum.photos/seed/${encodeURIComponent(institution.trim())}/900/1200`;
    }
    return null;
  }, [hasInstitutionSelection, programType, selectedUniversityPreview, institution]);

  const previewAlt =
    selectedUniversityPreview?.name ??
    (institution.trim() || t("institutionPreviewPlaceholder"));

  const displayFirstName =
    name.trim().split(/\s+/)[0] || user?.name?.trim().split(/\s+/)[0] || "";

  const academicSectionTitle =
    programType === "tecnico" ? t("sectionInstitute") : t("sectionAcademic");

  if (step === "creating") {
    return <CreatingAccountScreen />;
  }

  const institutionFullscreenBg = Boolean(
    step === "institution" && programType && ONBOARDING_INSTITUTION_FULLSCREEN_BG,
  );
  const showFullscreenBackdrop =
    institutionFullscreenBg &&
    (Boolean(previewImageUrl) || (hasInstitutionSelection && programType === "tecnico"));
  /** Texto blanco en formulario solo cuando hay foto/gradiente de institución */
  const formGlassOnPhoto = institutionFullscreenBg && showFullscreenBackdrop;

  return (
    <div
      className={cn(
        "flex h-[100dvh] flex-col overflow-hidden",
        institutionFullscreenBg ? "relative" : "bg-[var(--app-bg)] px-4 py-4 sm:px-6 sm:py-6",
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-full w-full flex-col",
          step === "programType"
            ? "max-w-2xl px-4 py-4 sm:px-6 sm:py-6"
            : institutionFullscreenBg
              ? "max-w-none"
              : "max-w-6xl",
        )}
      >
        {!institutionFullscreenBg && (
          <OnboardingHeader
            title={step === "programType" ? t("stepTypeTitle") : t("stepInstitutionTitle")}
            subtitle={
              step === "programType" ? t("stepTypeSubtitle") : t("stepInstitutionSubtitle")
            }
            step={step}
            emphasis={step === "programType" ? "hero" : "default"}
          />
        )}

        {step === "programType" && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-1 flex-col items-center justify-center py-6">
              <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <ProgramTypeOptionCard
                  selected={programType === "tecnico"}
                  onSelect={() => setProgramType("tecnico")}
                  iconTone="tecnico"
                  title={t("programTecnico")}
                  description={t("programTecnicoDesc")}
                  ariaLabel={t("programTecnico")}
                  icon={<Wrench className="size-8" aria-hidden />}
                />
                <ProgramTypeOptionCard
                  selected={programType === "universidad"}
                  onSelect={() => setProgramType("universidad")}
                  iconTone="universidad"
                  title={t("programUniversidad")}
                  description={t("programUniversidadDesc")}
                  ariaLabel={t("programUniversidad")}
                  icon={<School className="size-8" aria-hidden />}
                />
              </div>

              {submitAttempted && !programType && (
                <p className="mt-4 text-center text-xs font-medium text-[var(--error)]" role="alert">
                  {t("programTypeError")}
                </p>
              )}
            </div>

            <div className="flex shrink-0 justify-center pb-2 pt-2">
              <button
                type="button"
                className={ONBOARDING_BTN_PRIMARY}
                onClick={() => {
                  if (!programType) {
                    setSubmitAttempted(true);
                    return;
                  }
                  setSubmitAttempted(false);
                  setInstitution("");
                  setPrefillInstitution("");
                  setCareer("");
                  setPrefillCareer("");
                  setStep("institution");
                }}
              >
                {t("continue")}
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        )}

        {step === "institution" && programType && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleFinish();
            }}
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              institutionFullscreenBg && "relative overflow-hidden",
            )}
            noValidate
          >
            {institutionFullscreenBg ? (
              <InstitutionFullscreenBackdrop
                imageUrl={previewImageUrl}
                gradientBackground={bannerStyle.background}
                alt={previewAlt}
                showGradient={hasInstitutionSelection && programType === "tecnico"}
              />
            ) : null}

            <div
              className={cn(
                institutionFullscreenBg
                  ? "relative z-10 flex min-h-0 flex-1 flex-col px-4 py-3 sm:px-6 sm:py-4"
                  : "grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:grid-rows-1",
              )}
            >
              {institutionFullscreenBg ? (
                <OnboardingHeader
                  title={t("stepInstitutionTitle")}
                  step={step}
                  onDark={showFullscreenBackdrop}
                />
              ) : null}

              <div
                className={cn(
                  institutionFullscreenBg &&
                    "flex min-h-0 flex-1 flex-col items-center justify-start pb-5 pt-1 sm:pt-2",
                )}
              >
              <OnboardingFormCard
                glass={institutionFullscreenBg}
                glassOnPhoto={formGlassOnPhoto}
                className={cn(
                  "lg:order-1",
                  institutionFullscreenBg
                    ? "w-full max-w-md min-h-[min(560px,78dvh)] max-h-[min(760px,90dvh)]"
                    : "order-2 overflow-visible",
                )}
              >
                <div
                  className={cn(
                    "min-h-0 flex-1 overflow-hidden overflow-x-visible",
                    institutionFullscreenBg ? "px-4 py-4" : "px-4 py-4 sm:px-5 sm:py-5",
                  )}
                >
                  <div
                    className={cn(
                      institutionFullscreenBg ? "space-y-3.5" : "space-y-6",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      {displayFirstName ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            formGlassOnPhoto
                              ? "border border-white/25 bg-white/15 text-white/90"
                              : "border border-[var(--app-border)] bg-[var(--app-surface-soft)] text-[var(--app-fg-secondary)]",
                          )}
                        >
                          <Sparkles
                            className={cn(
                              "size-3",
                              formGlassOnPhoto
                                ? "text-white/80"
                                : "text-[var(--app-primary)]",
                            )}
                            aria-hidden
                          />
                          {t("welcomeBack", { name: displayFirstName })}
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          formGlassOnPhoto
                            ? "bg-white/20 text-white"
                            : "bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
                        )}
                      >
                        {programType === "tecnico" ? (
                          <Wrench className="size-3" aria-hidden />
                        ) : (
                          <School className="size-3" aria-hidden />
                        )}
                        {programType === "tecnico" ? t("programTecnico") : t("programUniversidad")}
                      </span>
                    </div>

                    <section
                      className={cn(institutionFullscreenBg ? "space-y-2.5" : "space-y-4")}
                    >
                      <FormSectionTitle
                        compact={institutionFullscreenBg}
                        glassOnPhoto={formGlassOnPhoto}
                        icon={<User className="size-3.5" aria-hidden />}
                        title={t("sectionPersonal")}
                      />
                      <FormTextField
                        id="name"
                        label={t("name")}
                        icon={<User className="size-3.5" aria-hidden />}
                        value={name}
                        onChange={setName}
                        placeholder={t("namePlaceholder")}
                        invalid={invalidName}
                        error={t("nameError")}
                        glass={institutionFullscreenBg}
                        glassOnPhoto={formGlassOnPhoto}
                        compact={institutionFullscreenBg}
                      />
                    </section>

                    <FormSectionDivider glassOnPhoto={formGlassOnPhoto} />

                    <section
                      className={cn(institutionFullscreenBg ? "space-y-2.5" : "space-y-5")}
                    >
                      <FormSectionTitle
                        compact={institutionFullscreenBg}
                        glassOnPhoto={formGlassOnPhoto}
                        icon={<GraduationCap className="size-3.5" aria-hidden />}
                        title={academicSectionTitle}
                      />

                      <StudentSearchableField
                        compact={institutionFullscreenBg}
                        glass={institutionFullscreenBg}
                        glassOnPhoto={formGlassOnPhoto}
                        id="institution"
                        label={programType === "tecnico" ? t("instituteLabel") : t("university")}
                        options={institutionOptions}
                        defaultValue={prefillInstitution}
                        otherItemLabel={
                          programType === "tecnico" ? t("otherInstitute") : t("otherUniversity")
                        }
                        otherInputPlaceholder={
                          programType === "tecnico"
                            ? t("otherInstitutePlaceholder")
                            : t("otherUniversityPlaceholder")
                        }
                        inputPlaceholder={
                          programType === "tecnico"
                            ? t("institutePlaceholder")
                            : t("universityPlaceholder")
                        }
                        onValueChange={setInstitution}
                        isInvalid={invalidInstitution}
                        errorMessage={
                          programType === "tecnico" ? t("instituteError") : t("universityError")
                        }
                        icon={<Building2 className="size-4" aria-hidden />}
                      />

                      <StudentSearchableField
                        compact={institutionFullscreenBg}
                        glass={institutionFullscreenBg}
                        glassOnPhoto={formGlassOnPhoto}
                        key={careerFieldKey}
                        id="career"
                        label={t("career")}
                        options={careerOptions}
                        defaultValue={prefillCareer}
                        otherItemLabel={t("otherCareer")}
                        otherInputPlaceholder={t("otherCareerPlaceholder")}
                        inputPlaceholder={t("careerPlaceholder")}
                        disabledPlaceholder={
                          programType === "universidad"
                            ? t("careerDisabledPlaceholder")
                            : undefined
                        }
                        disabled={programType === "universidad" && !institution.trim()}
                        hint={
                          !institutionFullscreenBg &&
                          programType === "universidad" &&
                          institution.trim()
                            ? t("careerDependsOnUniversity")
                            : undefined
                        }
                        onValueChange={setCareer}
                        isInvalid={invalidCareer}
                        errorMessage={t("careerError")}
                        icon={<BookOpen className="size-3.5" aria-hidden />}
                      />

                      <fieldset
                        className={cn(
                          "border-0 p-0",
                          institutionFullscreenBg ? "space-y-1.5" : "space-y-3",
                        )}
                      >
                        <legend
                          className={cn(
                            "flex w-full flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium",
                            formGlassOnPhoto ? "text-white/90" : "text-[var(--app-fg)]",
                          )}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays
                              className={cn(
                                "size-3.5",
                                formGlassOnPhoto
                                  ? "text-white/60"
                                  : "text-[var(--app-fg-muted)]",
                              )}
                              aria-hidden
                            />
                            {t("cycle")}
                          </span>
                          {institutionFullscreenBg ? (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm",
                                formGlassOnPhoto
                                  ? "border border-white/35 bg-white/15 text-white"
                                  : "border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
                              )}
                              aria-live="polite"
                            >
                              {cycle}
                            </span>
                          ) : null}
                        </legend>
                        {!institutionFullscreenBg ? (
                          <p className="text-xs leading-relaxed text-[var(--app-fg-secondary)]">
                            {t("cycleHint")}
                          </p>
                        ) : null}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span
                              className={cn(
                                "mb-1 block text-[10px] font-medium",
                                formGlassOnPhoto
                                  ? "text-white/65"
                                  : "text-[var(--app-fg-secondary)]",
                              )}
                            >
                              {t("cycleYear")}
                            </span>
                            <Select value={cycleYear} onValueChange={setCycleYear}>
                              <SelectTrigger
                                className={cn(
                                  "h-10 w-full text-sm",
                                  institutionFullscreenBg
                                    ? cn(
                                        glassFieldClasses(formGlassOnPhoto),
                                        formGlassOnPhoto && "[&_svg]:text-white/70",
                                      )
                                    : "rounded-xl border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-fg)] focus:border-[var(--app-primary)]/50 focus:ring-[var(--app-primary)]/20",
                                )}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CYCLE_YEARS.map((y) => (
                                  <SelectItem key={y} value={String(y)}>
                                    {y}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <span
                              className={cn(
                                "mb-1 block text-[10px] font-medium",
                                formGlassOnPhoto
                                  ? "text-white/65"
                                  : "text-[var(--app-fg-secondary)]",
                              )}
                            >
                              {t("cyclePeriod")}
                            </span>
                            <Select
                              value={cyclePeriod}
                              onValueChange={(v) => setCyclePeriod(v as CyclePeriod)}
                            >
                              <SelectTrigger
                                className={cn(
                                  "h-10 w-full text-sm",
                                  institutionFullscreenBg
                                    ? cn(
                                        glassFieldClasses(formGlassOnPhoto),
                                        formGlassOnPhoto && "[&_svg]:text-white/70",
                                      )
                                    : "rounded-xl border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-fg)] focus:border-[var(--app-primary)]/50 focus:ring-[var(--app-primary)]/20",
                                )}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CYCLE_PERIOD_VALUES.map((p) => (
                                  <SelectItem key={p} value={p}>
                                    {periodLabel(p)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {!institutionFullscreenBg ? (
                          <div
                            className="flex items-center gap-2 rounded-2xl bg-[var(--app-surface-soft)] px-3 py-2 text-xs text-[var(--app-fg-secondary)]"
                            aria-live="polite"
                          >
                            <span className="font-medium text-[var(--app-fg-muted)]">
                              {t("cycleCurrent")}
                            </span>
                            <span className="rounded-lg bg-[var(--app-primary-soft)] px-2 py-0.5 font-semibold text-[var(--app-primary)]">
                              {cycle}
                            </span>
                          </div>
                        ) : null}
                      </fieldset>
                    </section>
                  </div>
                </div>

                <div
                  className={cn(
                    "shrink-0 space-y-2.5 border-t px-4 py-3",
                    formGlassOnPhoto
                      ? "border-white/25 bg-white/[0.06] backdrop-blur-md"
                      : "border-[var(--app-border)] bg-[var(--app-surface)]/50 sm:px-5",
                  )}
                >
                  {submitError && (
                    <p
                      className={cn(
                        "text-center text-xs font-medium",
                        formGlassOnPhoto ? "text-red-200" : "text-[var(--error)]",
                      )}
                      role="alert"
                    >
                      {submitError}
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className={
                        formGlassOnPhoto ? ONBOARDING_GLASS_BTN_SECONDARY : ONBOARDING_BTN_SECONDARY
                      }
                      onClick={() => {
                        setSubmitAttempted(false);
                        setSubmitError(null);
                        setInstitution("");
                        setPrefillInstitution("");
                        setCareer("");
                        setPrefillCareer("");
                        setStep("programType");
                      }}
                    >
                      <ArrowLeft className="size-3.5" aria-hidden />
                      {t("back")}
                    </button>
                    <button type="submit" className={ONBOARDING_BTN_PRIMARY}>
                      {t("submit")}
                      <ArrowRight className="size-3.5" aria-hidden />
                    </button>
                  </div>
                  {!institutionFullscreenBg ? (
                    <p className="text-center text-[11px] leading-relaxed text-[var(--app-fg-muted)]">
                      {t("editLater")}
                    </p>
                  ) : null}
                </div>
              </OnboardingFormCard>
              </div>

              {institutionFullscreenBg ? (
                <div className="hidden" aria-hidden>
                  <HeroCard className="order-1 min-h-[180px] overflow-hidden border border-[var(--app-border)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-card)] lg:order-2 lg:min-h-0">
                    <InstitutionPreviewPanel
                      hasSelection={hasInstitutionSelection}
                      imageUrl={previewImageUrl}
                      gradientBackground={bannerStyle.background}
                      placeholderTitle={t("previewPlaceholderTitle")}
                      alt={previewAlt}
                    />
                  </HeroCard>
                </div>
              ) : (
                <HeroCard className="order-1 min-h-[180px] overflow-hidden border border-[var(--app-border)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-card)] lg:order-2 lg:min-h-0">
                  <InstitutionPreviewPanel
                    hasSelection={hasInstitutionSelection}
                    imageUrl={previewImageUrl}
                    gradientBackground={bannerStyle.background}
                    placeholderTitle={t("previewPlaceholderTitle")}
                    alt={previewAlt}
                  />
                </HeroCard>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function FormTextField({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
  invalid,
  error,
  glass = false,
  glassOnPhoto = false,
  compact = false,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  invalid: boolean;
  error: string;
  glass?: boolean;
  glassOnPhoto?: boolean;
  compact?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "block font-medium text-[var(--app-fg)]",
          compact ? "mb-1 text-xs" : "mb-1.5 text-sm",
          glass && glassOnPhoto && "text-white/85",
        )}
      >
        {label}
      </label>
      <div
        className={cn(
          "flex items-center overflow-hidden border transition-colors",
          compact ? "rounded-2xl" : "rounded-xl",
          glass
            ? glassFieldClasses(glassOnPhoto, invalid)
            : "bg-[var(--app-surface)] shadow-[var(--app-shadow-input)]",
          !glass &&
            (invalid
              ? "border-[var(--error)]/60 focus-within:ring-2 focus-within:ring-[var(--error)]/20"
              : "border-[var(--app-border)] focus-within:border-[var(--app-primary)]/50 focus-within:ring-2 focus-within:ring-[var(--app-primary)]/20"),
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center",
            compact ? "pl-2.5" : "pl-3",
            glass && glassOnPhoto ? "text-white/55" : "text-[var(--app-fg-muted)]",
          )}
        >
          {icon}
        </div>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={80}
          className={cn(
            "w-full bg-transparent text-sm outline-none text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)]",
            glass &&
              glassOnPhoto &&
              "text-white placeholder:text-white/45",
            compact ? "h-10 px-2.5" : "px-3 py-3",
          )}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
        />
      </div>
      {invalid && (
        <p
          className={cn(
            "font-medium text-[var(--error)]",
            compact ? "mt-1 text-[10px]" : "mt-1.5 text-xs",
          )}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
