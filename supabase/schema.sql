-- =====================================================
-- MENTA - Esquema de base de datos (Supabase / Postgres)
-- =====================================================
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================
create type practice_type as enum ('fp', 'university', 'internal');
create type student_status as enum ('active', 'completed', 'paused', 'cancelled');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
create type document_type as enum (
  'convenio', 'pfi', 'seguro', 'anexo',
  'evaluacion', 'informe_final', 'cv', 'otro'
);
create type evaluation_type as enum ('inicial', 'intermedia', 'final');
create type user_role as enum ('owner', 'admin', 'member');

-- =====================================================
-- ORGANIZATIONS (Empresas)
-- =====================================================
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  nif text,
  email text,
  phone text,
  address text,
  city text,
  postal_code text,

  -- Suscripción
  subscription_status subscription_status default 'trialing',
  trial_ends_at timestamptz default (now() + interval '30 days'),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  extra_students_count integer default 0,
  current_period_end timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_organizations_stripe_customer on public.organizations(stripe_customer_id);

-- =====================================================
-- PROFILES (Usuarios vinculados a auth.users)
-- =====================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  full_name text,
  email text,
  role user_role default 'owner',
  avatar_url text,
  created_at timestamptz default now()
);

create index idx_profiles_organization on public.profiles(organization_id);

-- =====================================================
-- STUDENTS (Alumnos)
-- =====================================================
create table public.students (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,

  -- Datos personales
  full_name text not null,
  dni text,
  email text,
  phone text,
  birth_date date,

  -- Tipo de práctica
  practice_type practice_type not null default 'fp',
  institution_name text,        -- Centro educativo / Universidad / Departamento interno
  program_name text,            -- Ciclo / Grado / Programa formativo

  -- Tutores
  tutor_academic_name text,
  tutor_academic_email text,
  tutor_academic_phone text,
  tutor_company_name text,
  tutor_company_email text,

  -- Período
  start_date date,
  end_date date,
  total_hours integer default 0,
  weekly_hours integer,

  status student_status default 'active',
  notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_students_organization on public.students(organization_id);
create index idx_students_status on public.students(status);

-- =====================================================
-- DOCUMENTS (Documentos)
-- =====================================================
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,

  type document_type not null,
  name text not null,
  description text,

  storage_path text not null,    -- path en Supabase Storage
  file_size bigint,
  mime_type text,

  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamptz default now()
);

create index idx_documents_organization on public.documents(organization_id);
create index idx_documents_student on public.documents(student_id);
create index idx_documents_type on public.documents(type);

-- =====================================================
-- EVALUATIONS (Evaluaciones)
-- =====================================================
create table public.evaluations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,

  type evaluation_type not null,
  evaluation_date date not null default current_date,
  score numeric(3,1) check (score >= 0 and score <= 10),
  competencies jsonb,           -- { "tecnica": 8, "comunicacion": 7, ... }
  strengths text,
  improvements text,
  notes text,

  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create index idx_evaluations_student on public.evaluations(student_id);

-- =====================================================
-- HOUR LOGS (Registro de horas)
-- =====================================================
create table public.hour_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,

  log_date date not null,
  hours numeric(4,2) not null check (hours > 0 and hours <= 24),
  description text,
  approved boolean default false,

  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create index idx_hour_logs_student on public.hour_logs(student_id);
create index idx_hour_logs_date on public.hour_logs(log_date);

-- =====================================================
-- TRIGGERS para updated_at
-- =====================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.handle_updated_at();

create trigger students_updated_at
  before update on public.students
  for each row execute function public.handle_updated_at();

-- =====================================================
-- TRIGGER: crear profile + organization al registrarse
-- =====================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_org_id uuid;
begin
  -- Crear organización
  insert into public.organizations (name, email)
  values (
    coalesce(new.raw_user_meta_data->>'company_name', 'Mi empresa'),
    new.email
  )
  returning id into new_org_id;

  -- Crear profile
  insert into public.profiles (id, organization_id, full_name, email, role)
  values (
    new.id,
    new_org_id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    'owner'
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.documents enable row level security;
alter table public.evaluations enable row level security;
alter table public.hour_logs enable row level security;

-- Helper: obtener organization_id del usuario actual
create or replace function public.user_organization_id()
returns uuid as $$
  select organization_id from public.profiles where id = auth.uid()
$$ language sql stable security definer;

-- Organizations
create policy "Users can view their own organization"
  on public.organizations for select
  using (id = public.user_organization_id());

create policy "Owners can update their organization"
  on public.organizations for update
  using (
    id = public.user_organization_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('owner','admin'))
  );

-- Profiles
create policy "Users can view profiles in their org"
  on public.profiles for select
  using (organization_id = public.user_organization_id());

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());

-- Students
create policy "Users can manage students in their org"
  on public.students for all
  using (organization_id = public.user_organization_id())
  with check (organization_id = public.user_organization_id());

-- Documents
create policy "Users can manage documents in their org"
  on public.documents for all
  using (organization_id = public.user_organization_id())
  with check (organization_id = public.user_organization_id());

-- Evaluations
create policy "Users can manage evaluations in their org"
  on public.evaluations for all
  using (organization_id = public.user_organization_id())
  with check (organization_id = public.user_organization_id());

-- Hour logs
create policy "Users can manage hour logs in their org"
  on public.hour_logs for all
  using (organization_id = public.user_organization_id())
  with check (organization_id = public.user_organization_id());

-- =====================================================
-- STORAGE BUCKET para documentos
-- =====================================================
-- Crear desde la UI de Supabase o ejecutar:
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
-- Política de storage:
-- Permitir acceso a archivos cuyo path empiece por <organization_id>/

-- =====================================================
-- VIEW: vista resumen por alumno (horas acumuladas)
-- =====================================================
create or replace view public.students_summary as
select
  s.*,
  coalesce(sum(h.hours), 0) as logged_hours,
  count(distinct d.id) as documents_count,
  count(distinct e.id) as evaluations_count
from public.students s
left join public.hour_logs h on h.student_id = s.id and h.approved = true
left join public.documents d on d.student_id = s.id
left join public.evaluations e on e.student_id = s.id
group by s.id;
