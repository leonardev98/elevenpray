import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--app-fg)]">
        Dashboard
      </h1>
      <p className="mt-2 text-[var(--app-fg)]/70">
        Gestiona tus rutinas semanales y tópicos.
      </p>
      <Link
        href="/dashboard/routines"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--app-navy)] px-4 py-2.5 text-sm font-medium text-[var(--app-white)] transition hover:opacity-90"
      >
        Ver mis rutinas
      </Link>
    </div>
  );
}
