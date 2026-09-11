-- OnTime v1 schema
-- Apply in the Supabase SQL editor (or via CLI) as a single script.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid,
  logo_url text,
  primary_color text,
  accent_color text,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique references auth.users (id) on delete cascade,
  email text,
  full_name text,
  company_id uuid references public.companies (id) on delete set null,
  role_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.companies
  add constraint companies_owner_id_fkey
  foreign key (owner_id) references public.users (id) on delete set null;

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null check (name in ('manager', 'employee')),
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (company_id, name)
);

alter table public.users
  add constraint users_role_id_fkey
  foreign key (role_id) references public.roles (id) on delete set null;

create table public.company_settings (
  company_id uuid primary key references public.companies (id) on delete cascade,
  opening_minutes integer not null default 360,
  closing_minutes integer not null default 1800,
  created_at timestamptz not null default now()
);

-- day_of_week: JS Date.getDay() — 0 Sunday … 6 Saturday
-- minutes: from local midnight. Overnight windows may exceed 1440 (max 1800 = 6 AM next day).
create table public.availability (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_minutes integer not null check (start_minutes >= 0),
  end_minutes integer not null check (end_minutes > start_minutes),
  created_at timestamptz not null default now()
);

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.users (id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  position_label text,
  notes text,
  created_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  author_id uuid not null references public.users (id) on delete cascade,
  type text not null check (type in ('shift_swap', 'time_off', 'issue')),
  title text not null,
  body text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table public.shift_swap_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  shift_id uuid not null references public.shifts (id) on delete cascade,
  requester_id uuid not null references public.users (id) on delete cascade,
  target_employee_id uuid references public.users (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  message text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index users_company_id_idx on public.users (company_id);
create index availability_employee_day_idx on public.availability (employee_id, day_of_week);
create index availability_company_day_idx on public.availability (company_id, day_of_week);
create index shifts_company_time_idx on public.shifts (company_id, start_time);
create index shifts_employee_time_idx on public.shifts (employee_id, start_time);
create index tickets_company_status_idx on public.tickets (company_id, status);

-- ---------------------------------------------------------------------------
-- Profile trigger (auth.users → public.users)
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (auth_id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'user'), '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS helpers — SECURITY DEFINER so policies never recurse on public.users
-- ---------------------------------------------------------------------------

create or replace function public.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.users where auth_id = auth.uid() limit 1;
$$;

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.users where auth_id = auth.uid() limit 1;
$$;

create or replace function public.current_role_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.name
  from public.users u
  join public.roles r on r.id = u.role_id
  where u.auth_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role_name() = 'manager', false);
$$;

-- ---------------------------------------------------------------------------
-- Company RPCs
-- ---------------------------------------------------------------------------

create or replace function public.create_company(p_name text)
returns public.companies
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users;
  v_company public.companies;
  v_slug text;
  v_manager_role_id uuid;
begin
  if p_name is null or length(trim(p_name)) < 2 then
    raise exception 'Le nom du commerce est trop court';
  end if;

  select * into v_user from public.users where auth_id = auth.uid();
  if v_user.id is null then
    raise exception 'Profil introuvable';
  end if;
  if v_user.company_id is not null then
    raise exception 'Déjà rattaché à un commerce';
  end if;

  v_slug := lower(regexp_replace(trim(p_name), '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then
    v_slug := 'commerce';
  end if;
  v_slug := v_slug || '-' || substr(encode(gen_random_bytes(4), 'hex'), 1, 6);

  insert into public.companies (name, slug, owner_id)
  values (trim(p_name), v_slug, v_user.id)
  returning * into v_company;

  insert into public.roles (company_id, name, permissions)
  values (
    v_company.id,
    'manager',
    '{"manage_shifts": true, "manage_employees": true, "manage_tickets": true}'::jsonb
  )
  returning id into v_manager_role_id;

  insert into public.roles (company_id, name, permissions)
  values (
    v_company.id,
    'employee',
    '{"view_own_shifts": true, "manage_own_availability": true, "create_tickets": true}'::jsonb
  );

  insert into public.company_settings (company_id) values (v_company.id);

  update public.users
  set company_id = v_company.id, role_id = v_manager_role_id
  where id = v_user.id;

  return v_company;
end;
$$;

create or replace function public.join_company(p_slug text)
returns public.companies
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users;
  v_company public.companies;
  v_employee_role_id uuid;
begin
  select * into v_user from public.users where auth_id = auth.uid();
  if v_user.id is null then
    raise exception 'Profil introuvable';
  end if;
  if v_user.company_id is not null then
    raise exception 'Déjà rattaché à un commerce';
  end if;

  select * into v_company
  from public.companies
  where lower(slug) = lower(trim(p_slug));

  if v_company.id is null then
    raise exception 'Code commerce introuvable';
  end if;

  select id into v_employee_role_id
  from public.roles
  where company_id = v_company.id and name = 'employee';

  if v_employee_role_id is null then
    raise exception 'Rôle employé introuvable pour ce commerce';
  end if;

  update public.users
  set company_id = v_company.id, role_id = v_employee_role_id, is_active = true
  where id = v_user.id;

  return v_company;
end;
$$;

-- Block identity changes even for table owners calling from odd paths.
create or replace function public.guard_user_updates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.auth_id is distinct from old.auth_id then
    raise exception 'auth_id immuable';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_user_updates on public.users;
create trigger guard_user_updates
  before update on public.users
  for each row execute function public.guard_user_updates();

-- ---------------------------------------------------------------------------
-- Grants & RLS
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated, public;
revoke all on all functions in schema public from anon, authenticated, public;
grant usage on schema public to authenticated;

grant select on public.companies to authenticated;
grant update (name, logo_url, primary_color, accent_color) on public.companies to authenticated;

grant select on public.users to authenticated;
grant update (full_name, is_active) on public.users to authenticated;
grant select on public.roles to authenticated;
grant select on public.company_settings to authenticated;
grant select, insert, update, delete on public.availability to authenticated;
grant select, insert, update, delete on public.shifts to authenticated;
grant select, insert, update on public.tickets to authenticated;
grant select, insert, update on public.shift_swap_requests to authenticated;
grant select, insert, update on public.notifications to authenticated;

grant execute on function public.current_user_id() to authenticated;
grant execute on function public.current_company_id() to authenticated;
grant execute on function public.current_role_name() to authenticated;
grant execute on function public.is_manager() to authenticated;
grant execute on function public.create_company(text) to authenticated;
grant execute on function public.join_company(text) to authenticated;

alter table public.companies enable row level security;
alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.company_settings enable row level security;
alter table public.availability enable row level security;
alter table public.shifts enable row level security;
alter table public.tickets enable row level security;
alter table public.shift_swap_requests enable row level security;
alter table public.notifications enable row level security;

create policy companies_select on public.companies
  for select to authenticated
  using (id = public.current_company_id());

create policy companies_update on public.companies
  for update to authenticated
  using (id = public.current_company_id() and public.is_manager())
  with check (id = public.current_company_id() and public.is_manager());

create policy users_select on public.users
  for select to authenticated
  using (
    auth_id = auth.uid()
    or (company_id is not null and company_id = public.current_company_id())
  );

create policy users_update on public.users
  for update to authenticated
  using (
    auth_id = auth.uid()
    or (public.is_manager() and company_id = public.current_company_id())
  )
  with check (
    auth_id = auth.uid()
    or (public.is_manager() and company_id = public.current_company_id())
  );

create policy roles_select on public.roles
  for select to authenticated
  using (company_id = public.current_company_id());

create policy company_settings_select on public.company_settings
  for select to authenticated
  using (company_id = public.current_company_id());

create policy availability_select on public.availability
  for select to authenticated
  using (company_id = public.current_company_id());

create policy availability_write on public.availability
  for all to authenticated
  using (
    company_id = public.current_company_id()
    and (employee_id = public.current_user_id() or public.is_manager())
  )
  with check (
    company_id = public.current_company_id()
    and (employee_id = public.current_user_id() or public.is_manager())
  );

create policy shifts_select on public.shifts
  for select to authenticated
  using (company_id = public.current_company_id());

create policy shifts_write on public.shifts
  for all to authenticated
  using (company_id = public.current_company_id() and public.is_manager())
  with check (company_id = public.current_company_id() and public.is_manager());

create policy tickets_select on public.tickets
  for select to authenticated
  using (
    company_id = public.current_company_id()
    and (author_id = public.current_user_id() or public.is_manager())
  );

create policy tickets_insert on public.tickets
  for insert to authenticated
  with check (
    company_id = public.current_company_id()
    and author_id = public.current_user_id()
  );

create policy tickets_update on public.tickets
  for update to authenticated
  using (company_id = public.current_company_id() and public.is_manager())
  with check (company_id = public.current_company_id() and public.is_manager());

create policy swap_select on public.shift_swap_requests
  for select to authenticated
  using (company_id = public.current_company_id());

create policy swap_insert on public.shift_swap_requests
  for insert to authenticated
  with check (
    company_id = public.current_company_id()
    and requester_id = public.current_user_id()
  );

create policy swap_update on public.shift_swap_requests
  for update to authenticated
  using (company_id = public.current_company_id() and public.is_manager())
  with check (company_id = public.current_company_id() and public.is_manager());

create policy notifications_select on public.notifications
  for select to authenticated
  using (user_id = public.current_user_id());

create policy notifications_insert on public.notifications
  for insert to authenticated
  with check (company_id = public.current_company_id() and public.is_manager());

create policy notifications_update on public.notifications
  for update to authenticated
  using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());
