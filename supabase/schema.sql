-- Pólizas RC: esquema de base de datos (ejecutar en Supabase > SQL Editor)

create table if not exists asegurados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha_nacimiento date,
  email text,
  telefono text,
  notas text,
  created_at timestamptz not null default now()
);

create table if not exists polizas (
  id uuid primary key default gen_random_uuid(),
  asegurado_id uuid not null references asegurados(id) on delete cascade,
  ramo text not null,               -- Gastos Médicos Mayores, Gastos Médicos Menores, Vida, Autos, Daños...
  aseguradora text not null,        -- AXA, Allianz, GNP...
  numero_poliza text not null,
  certificado text,
  inicio_vigencia date not null,
  fin_vigencia date not null,
  prima numeric(12,2),
  moneda text not null default 'MXN',
  notas text,
  created_at timestamptz not null default now()
);
create index if not exists polizas_fin_idx on polizas(fin_vigencia);
create index if not exists polizas_asegurado_idx on polizas(asegurado_id);

create table if not exists documentos (
  id uuid primary key default gen_random_uuid(),
  poliza_id uuid references polizas(id) on delete cascade,
  asegurado_id uuid references asegurados(id) on delete cascade,
  tipo text not null default 'otro', -- poliza | tarjeta | excel | otro
  nombre text not null,
  storage_path text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists configuracion (
  clave text primary key,
  valor text not null
);
insert into configuracion (clave, valor) values ('dias_aviso', '30') on conflict do nothing;

-- Seguridad: solo usuarios con sesión iniciada
alter table asegurados enable row level security;
alter table polizas enable row level security;
alter table documentos enable row level security;
alter table configuracion enable row level security;

do $$
declare t text;
begin
  foreach t in array array['asegurados','polizas','documentos','configuracion'] loop
    execute format('drop policy if exists "auth_all" on %I', t);
    execute format('create policy "auth_all" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- Almacenamiento privado de PDFs y Excel
insert into storage.buckets (id, name, public) values ('documentos', 'documentos', false)
on conflict (id) do nothing;

drop policy if exists "docs_auth_all" on storage.objects;
create policy "docs_auth_all" on storage.objects for all to authenticated
  using (bucket_id = 'documentos') with check (bucket_id = 'documentos');
