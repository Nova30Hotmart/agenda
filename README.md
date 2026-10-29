# Paddock · Titanium × NOVA 30

App del encuentro Titanium × NOVA 30 (CDMX, 29 oct – 1 nov 2026): Quién es quién, cronograma, evaluación, slides y fotos.

Producción: https://agenda.hotmartcomunidades.com · Vercel: proyecto `agenda` (deploy automático desde `main`).

## Cómo se edita
- **Agenda, speakers, links de Drive:** en `index.html`, objetos `CONFIG`, `SPEAKERS` y `DAYS`.
- **Probar otra hora:** agrega `?now=2026-10-29T14:20` a la URL.

## Backend (carpeta `api/`, Vercel Blob)
- `GET /api/profiles` · perfiles públicos (sin correo).
- `POST /api/profile` · crea o actualiza un perfil (la llave es el correo). Copia la foto al Blob.
- `POST /api/eval` · guarda una evaluación (NPS, ponencias, comentarios).
- `GET /api/instagram?u=usuario` · Business Discovery de Meta. Requiere `IG_USER_ID` e `IG_TOKEN` en Vercel.
- `GET /api/export?key=EXPORT_KEY&t=profiles|evals` · descarga CSV.

Variables en Vercel: `BLOB_READ_WRITE_TOKEN` (automática), `EXPORT_KEY`, `IG_USER_ID`, `IG_TOKEN`.
