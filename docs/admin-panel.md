# Panel de administración

Panel para gestionar contenido curado por categoría (workspace type). Los admins pueden añadir enlaces, textos, productos destacados y contenido de YouTube que luego verán los usuarios en la app.

## Cómo entrar

- **URL:** `/{locale}/admin`  
  Ejemplos:
  - Local: `http://localhost:3000/es/admin` o `http://localhost:3000/en/admin`
  - Producción: `https://tudominio.com/es/admin`

- **Login:** Obligatorio (mismo login que la app, por email). Si no estás logueado, se redirige a `/login?next=/admin`; tras iniciar sesión vuelves al panel. Solo los usuarios con rol **`platform_admin`** pueden acceder; el resto es redirigido al dashboard.
- **Usuario admin por defecto (seed):** Email **`admin@localhost`**, contraseña **`admin`**. Si ya tenías el usuario con email `admin`, ejecuta `docs/migrations/002-admin-email-to-localhost.sql` para pasarlo a `admin@localhost` y poder iniciar sesión desde el formulario.

## Estructura actual (mock)

- **`/admin`** — Selector de categorías (Skincare, Universidad, Trabajo, Fitness, General). Cada una enlaza a `/admin/[category]`.
- **`/admin/[category]`** — Por categoría: secciones para Enlaces, Texto/Entradas, Productos destacados, YouTube. Botones y campos son mock; sin backend aún.
- **`/admin/usuarios`** — Lista de usuarios del panel (mock). Solo el admin maestro podrá crear editores y asignar categorías cuando esté conectado el backend.

## Próximos pasos

1. Backend: tablas de contenido curado por `workspace_type`, roles (`platform_admin`, `category_editor`), asignación usuario–categoría.
2. Conectar cada sección del panel con los endpoints correspondientes.
3. En la app de usuarios, mostrar el contenido curado en cada workspace según su tipo (p. ej. en Skincare, un bloque o página con el feed curado).
