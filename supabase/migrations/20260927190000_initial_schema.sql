-- Phase 1 schema for the public website.
-- Conventions:
--   * Every timestamptz is stored in UTC.
--   * meeting_time and start_time are wall-clock times (Ghana is UTC+0 all year).
--   * day_of_week / meeting_day: 0 = Sunday ... 6 = Saturday.
--   * Media columns (*_key) hold R2 object keys, never full URLs.
--   * Public (anon) can read published, current rows. Only admins can write.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.app_role as enum ('admin');
create type public.leader_category as enum ('minister', 'session', 'group_leader');
create type public.event_status as enum ('draft', 'published', 'cancelled');
create type public.content_status as enum ('draft', 'published');
create type public.contact_type as enum ('contact', 'visitor');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null default 'admin',
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  meeting_day smallint check (meeting_day between 0 and 6),
  meeting_time time,
  meeting_venue text,
  cover_image_key text,
  sort_order integer not null default 0
);

create table public.leaders (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text,
  photo_key text,
  bio text,
  category public.leader_category not null,
  group_id uuid references public.groups (id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  -- Future link to the members table (later phase). No foreign key yet.
  member_id uuid
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  venue text,
  -- null = whole church
  group_id uuid references public.groups (id) on delete set null,
  flyer_key text,
  -- Public website content publishes immediately by default.
  status public.event_status not null default 'published',
  is_featured boolean not null default false,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_ends_after_starts check (ends_at >= starts_at)
);

create table public.sermon_series (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  cover_key text
);

create table public.sermons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  preacher_name text not null,
  preacher_leader_id uuid references public.leaders (id) on delete set null,
  preached_on date not null,
  bible_passage text,
  series_id uuid references public.sermon_series (id) on delete set null,
  audio_key text,
  youtube_url text check (youtube_url ~ '^https://(www\.)?(youtube\.com|youtu\.be)/'),
  summary text,
  -- Public website content publishes immediately by default.
  status public.content_status not null default 'published',
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  -- A published sermon needs YouTube, audio, or both.
  constraint sermons_published_has_media check (
    status <> 'published' or youtube_url is not null or audio_key is not null
  )
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  publish_at timestamptz not null default now(),
  expires_at timestamptz,
  is_pinned boolean not null default false,
  -- Public website content publishes immediately by default.
  status public.content_status not null default 'published',
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint announcements_expires_after_publish check (
    expires_at is null or expires_at > publish_at
  )
);

create table public.service_times (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  language text,
  notes text,
  sort_order integer not null default 0
);

-- Single row, enforced by a boolean primary key that must be true.
create table public.site_settings (
  id boolean primary key default true check (id),
  address text,
  phone text,
  email text,
  office_hours text,
  map_embed_url text,
  momo_number text,
  momo_name text,
  -- One account: { "bank", "branch", "account_name", "account_number" }
  bank_details jsonb check (bank_details is null or jsonb_typeof(bank_details) = 'object'),
  -- e.g. { "facebook": "https://...", "youtube": "https://..." }
  social_links jsonb not null default '{}'::jsonb check (jsonb_typeof(social_links) = 'object')
);

create table public.page_content (
  key text primary key check (key ~ '^[a-z0-9]+([_.-][a-z0-9]+)*$'),
  title text,
  body text,
  updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  type public.contact_type not null default 'contact',
  name text not null check (char_length(name) between 1 and 200),
  phone text check (char_length(phone) <= 40),
  email text check (char_length(email) <= 320),
  message text check (char_length(message) <= 5000),
  is_handled boolean not null default false,
  created_at timestamptz not null default now(),
  constraint contact_messages_has_reply_route check (phone is not null or email is not null)
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create trigger page_content_set_updated_at
  before update on public.page_content
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index leaders_group_id_idx on public.leaders (group_id);
create index leaders_category_sort_idx on public.leaders (category, sort_order);

create index events_starts_at_idx on public.events (starts_at);
create index events_ends_at_idx on public.events (ends_at);
create index events_group_id_idx on public.events (group_id);
create index events_created_by_idx on public.events (created_by);

create index sermons_preached_on_idx on public.sermons (preached_on desc);
create index sermons_series_id_idx on public.sermons (series_id);
create index sermons_preacher_leader_id_idx on public.sermons (preacher_leader_id);
create index sermons_created_by_idx on public.sermons (created_by);

create index announcements_publish_at_idx on public.announcements (publish_at desc);
create index announcements_created_by_idx on public.announcements (created_by);

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

-- ---------------------------------------------------------------------------
-- Admin check
-- ---------------------------------------------------------------------------

-- security definer so policies can read user_roles without recursing into its RLS.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.user_roles enable row level security;
alter table public.groups enable row level security;
alter table public.leaders enable row level security;
alter table public.events enable row level security;
alter table public.sermon_series enable row level security;
alter table public.sermons enable row level security;
alter table public.announcements enable row level security;
alter table public.service_times enable row level security;
alter table public.site_settings enable row level security;
alter table public.page_content enable row level security;
alter table public.contact_messages enable row level security;

-- Start from nothing, then grant only what each role needs. RLS filters rows on top.
revoke all on all tables in schema public from anon, authenticated;

grant select on
  public.groups, public.leaders, public.events, public.sermon_series, public.sermons,
  public.announcements, public.service_times, public.site_settings, public.page_content
to anon, authenticated;

grant insert, update, delete on
  public.groups, public.leaders, public.events, public.sermon_series, public.sermons,
  public.announcements, public.service_times, public.site_settings, public.page_content
to authenticated;

grant select, insert, update, delete on public.user_roles to authenticated;

-- Visitors may only supply these columns. is_handled and created_at take their defaults.
grant insert (type, name, phone, email, message) on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;

-- user_roles: see your own role; admins see and manage all.
create policy "user_roles: read own or admin" on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "user_roles: admin insert" on public.user_roles
  for insert to authenticated with check ((select public.is_admin()));
create policy "user_roles: admin update" on public.user_roles
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "user_roles: admin delete" on public.user_roles
  for delete to authenticated using ((select public.is_admin()));

-- Public-read tables: one select policy (public rule OR admin), plus admin writes.
create policy "groups: public read" on public.groups
  for select to anon, authenticated using (true);

create policy "leaders: public read active" on public.leaders
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));

-- Cancelled events stay visible so people who planned to attend see the notice.
create policy "events: public read published or cancelled" on public.events
  for select to anon, authenticated
  using (status in ('published', 'cancelled') or (select public.is_admin()));

create policy "sermon_series: public read" on public.sermon_series
  for select to anon, authenticated using (true);

create policy "sermons: public read published" on public.sermons
  for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

create policy "announcements: public read current" on public.announcements
  for select to anon, authenticated
  using (
    (
      status = 'published'
      and publish_at <= now()
      and (expires_at is null or expires_at > now())
    )
    or (select public.is_admin())
  );

create policy "service_times: public read" on public.service_times
  for select to anon, authenticated using (true);

create policy "site_settings: public read" on public.site_settings
  for select to anon, authenticated using (true);

create policy "page_content: public read" on public.page_content
  for select to anon, authenticated using (true);

-- Admin writes on every public-read table.
do $$
declare
  t text;
begin
  foreach t in array array[
    'groups', 'leaders', 'events', 'sermon_series', 'sermons',
    'announcements', 'service_times', 'site_settings', 'page_content'
  ]
  loop
    execute format(
      'create policy "%1$s: admin insert" on public.%1$I for insert to authenticated with check ((select public.is_admin()))',
      t
    );
    execute format(
      'create policy "%1$s: admin update" on public.%1$I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',
      t
    );
    execute format(
      'create policy "%1$s: admin delete" on public.%1$I for delete to authenticated using ((select public.is_admin()))',
      t
    );
  end loop;
end;
$$;

-- contact_messages: anyone may send; only admins may read, mark handled or delete.
create policy "contact_messages: public insert" on public.contact_messages
  for insert to anon, authenticated
  with check (is_handled = false);
create policy "contact_messages: admin read" on public.contact_messages
  for select to authenticated using ((select public.is_admin()));
create policy "contact_messages: admin update" on public.contact_messages
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "contact_messages: admin delete" on public.contact_messages
  for delete to authenticated using ((select public.is_admin()));
