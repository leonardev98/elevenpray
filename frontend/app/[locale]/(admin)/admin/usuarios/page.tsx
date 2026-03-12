"use client";

import { Link } from "@/i18n/navigation";

const MOCK_USERS = [
  { id: "1", name: "Admin Maestro", email: "admin@ejemplo.com", role: "platform_admin", categories: "Todas" },
  { id: "2", name: "Editor Skincare", email: "editor.skincare@ejemplo.com", role: "category_editor", categories: "Skincare" },
] as const;

export default function AdminUsuariosPage() {
  return (
    <>
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--app-fg)]">
          Usuarios del panel
        </h1>
        <p className="mt-2 text-[var(--app-fg)]/70 leading-relaxed">
          Solo el admin maestro puede crear usuarios y asignarles categorías. Los
          editores solo verán las categorías que se les asigne. (Mock: datos de
          ejemplo.)
        </p>
      </div>

      <div className="mb-8 flex justify-end">
        <button
          type="button"
          className="rounded-xl bg-[var(--app-navy)] px-5 py-2.5 text-sm font-semibold text-[var(--app-white)] transition hover:opacity-90"
        >
          Crear usuario (mock)
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm dark:border-[var(--app-border)] dark:bg-[var(--app-surface)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--app-border)] bg-[var(--app-surface-soft)]">
              <th className="px-6 py-4 font-semibold text-[var(--app-fg)]">
                Nombre
              </th>
              <th className="px-6 py-4 font-semibold text-[var(--app-fg)]">
                Email
              </th>
              <th className="px-6 py-4 font-semibold text-[var(--app-fg)]">
                Rol
              </th>
              <th className="px-6 py-4 font-semibold text-[var(--app-fg)]">
                Categorías
              </th>
              <th className="px-6 py-4 font-semibold text-[var(--app-fg)]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map((u) => (
              <tr
                key={u.id}
                className="border-b border-[var(--app-border)] last:border-0 transition hover:bg-[var(--app-surface-soft)]/50"
              >
                <td className="px-6 py-4 font-medium text-[var(--app-fg)]">{u.name}</td>
                <td className="px-6 py-4 text-[var(--app-fg)]/80">{u.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      u.role === "platform_admin"
                        ? "bg-[var(--app-navy)]/20 text-[var(--app-navy)]"
                        : "bg-[var(--app-navy)]/10 text-[var(--app-navy)] dark:bg-[var(--app-navy)]/30 dark:text-[var(--app-navy)]"
                    }`}
                  >
                    {u.role === "platform_admin" ? "Admin maestro" : "Editor"}
                  </span>
                </td>
                <td className="px-6 py-4 text-[var(--app-fg)]/70">
                  {u.categories}
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    className="font-medium text-[var(--app-navy)] hover:underline"
                  >
                    Editar (mock)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-sm text-[var(--app-fg)]/50">
        Cuando se conecte el backend, aquí se listarán los usuarios con rol
        admin o editor y se podrá crear/asignar desde esta pantalla.
      </p>
    </>
  );
}
