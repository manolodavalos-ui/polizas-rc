# Pólizas RC

App web (PC y móvil) para administrar pólizas de seguros: tablero de vigentes / próximas a vencer / vencidas, pólizas por ramo, asegurados, documentos PDF y gráficas.

**Stack:** Next.js 16 + Tailwind · Supabase (Postgres, Auth, Storage) · Vercel. Se puede instalar en el celular como app (PWA).

## Puesta en marcha

1. **Supabase:** crea un proyecto en https://supabase.com, abre *SQL Editor* y ejecuta `supabase/schema.sql`.
2. **Usuario:** en *Authentication → Users → Add user* crea el usuario principal (correo y contraseña). En *Authentication → Sign In / Providers* desactiva "Allow new users to sign up".
3. **Variables:** copia `.env.example` a `.env.local` y llena la URL y la *anon key* (Project Settings → API).
4. **Local:** `npm install && npm run dev` → http://localhost:3000
5. **Carga inicial** (opcional): con la *service role key* en `.env.local`:
   ```
   node --env-file=.env.local scripts/importar.mjs datos.json "<carpeta del ZIP>" "<relación.xlsx>"
   ```
   `datos.json` es la relación del Excel ya limpia (fechas corregidas). No se versiona porque tiene datos personales.
6. **Vercel:** importa el repo en https://vercel.com, agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, y despliega.

## Estructura

- `src/app/(app)/` pantallas: tablero, pólizas, asegurados (alta, detalle), gráficas, configuración
- `src/lib/polizas.ts` cálculo de estado (vigente / próxima a vencer / vencida)
- `supabase/schema.sql` tablas, seguridad (RLS) y bucket privado de documentos
