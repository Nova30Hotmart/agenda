# Paddock · Titanium × NOVA 30

App del encuentro Titanium × NOVA 30 (CDMX, 29 oct – 1 nov 2026): Quién es quién, cronograma, evaluación, slides y fotos.

Producción: https://agenda.hotmartcomunidades.com · Vercel: proyecto `agenda` (deploy automático desde `main`).

## Cómo se edita
- **Agenda, speakers, links de Drive:** en `index.html`, objetos `CONFIG`, `SPEAKERS` y `DAYS`.
- **Probar otra hora:** agrega `?now=2026-10-29T14:20` a la URL.
- **Botón de ayuda:** WhatsApp al +52 55 6787 0465 (enlace `wa.me` en `index.html`).
- **App:** `manifest.webmanifest` + `icons/` para guardarla en la pantalla de inicio.

## Backend (carpeta `api/`, Vercel Blob)
- `GET /api/profiles` · perfiles públicos.
- `POST /api/login` · entra con el @ de Instagram: regresa el perfil o lo crea con los datos públicos de Instagram.
- `POST /api/profile` · actualiza un perfil (la llave es el @ de Instagram). Copia la foto al Blob.
- `POST /api/eval` · guarda una evaluación (NPS, ponencias, comentarios).
- `GET /api/instagram?u=usuario` · Business Discovery de Meta. Requiere `IG_USER_ID` e `IG_TOKEN` en Vercel.
- Panel privado en `/panel` (contraseña = `EXPORT_KEY`).
- `GET /api/export?key=EXPORT_KEY&t=profiles|evals` · descarga CSV (agrega `&f=json` para JSON).
- `GET /api/admin?key=EXPORT_KEY&profile=<id>` o `&eval=<file>` · borra un perfil o una evaluación.

Variables en Vercel: `BLOB_READ_WRITE_TOKEN` (automática), `EXPORT_KEY`, `IG_USER_ID`, `IG_TOKEN`.
