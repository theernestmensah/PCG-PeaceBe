-- Peace Be ChMS: membership, ministry, care, governance, finance and communications.
-- Public content stays separate from private congregation operations.

create type public.member_status as enum ('visitor', 'member', 'communicant', 'inactive', 'transferred', 'deceased');
create type public.household_role as enum ('head', 'spouse', 'child', 'dependent', 'other');
create type public.attendance_state as enum ('present', 'absent', 'excused');
create type public.followup_status as enum ('open', 'in_progress', 'complete');
create type public.meeting_status as enum ('draft', 'scheduled', 'completed', 'cancelled');
create type public.action_status as enum ('open', 'in_progress', 'complete', 'deferred');
create type public.transaction_status as enum ('pending', 'confirmed', 'reversed');
create type public.delivery_status as enum ('queued', 'sent', 'failed', 'cancelled');

create table public.people (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  member_number text unique,
  first_name text not null,
  middle_name text,
  last_name text not null,
  preferred_name text,
  date_of_birth date,
  gender text,
  phone text,
  email text,
  address text,
  status public.member_status not null default 'visitor',
  joined_on date,
  transferred_on date,
  directory_visible boolean not null default false,
  notes text,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint people_has_contact check (phone is not null or email is not null or status <> 'visitor')
);

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  primary_phone text,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.household_members (
  household_id uuid not null references public.households (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  role public.household_role not null default 'other',
  is_primary_contact boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (household_id, person_id)
);

create table public.ministry_memberships (
  group_id uuid not null references public.groups (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  joined_on date,
  left_on date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (group_id, person_id),
  constraint ministry_membership_dates check (left_on is null or joined_on is null or left_on >= joined_on)
);

create table public.leadership_terms (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people (id) on delete restrict,
  group_id uuid references public.groups (id) on delete set null,
  office_title text not null,
  starts_on date not null,
  ends_on date,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  constraint leadership_term_dates check (ends_on is null or ends_on >= starts_on)
);

create table public.worship_services (
  id uuid primary key default gen_random_uuid(),
  service_time_id uuid references public.service_times (id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text,
  preacher text,
  bible_passage text,
  notes text,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint worship_service_dates check (ends_at is null or ends_at >= starts_at)
);

create table public.attendance_records (
  service_id uuid not null references public.worship_services (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  state public.attendance_state not null default 'present',
  checked_in_at timestamptz,
  recorded_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (service_id, person_id)
);

create table public.shepherding_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  leader_person_id uuid references public.people (id) on delete set null,
  meeting_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.shepherd_assignments (
  shepherding_group_id uuid not null references public.shepherding_groups (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  assigned_on date not null default current_date,
  ended_on date,
  primary key (shepherding_group_id, household_id),
  constraint shepherd_assignment_dates check (ended_on is null or ended_on >= assigned_on)
);

create table public.pastoral_followups (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.people (id) on delete set null,
  household_id uuid references public.households (id) on delete set null,
  subject text not null,
  detail text,
  assigned_to uuid references public.people (id) on delete set null,
  due_on date,
  status public.followup_status not null default 'open',
  sensitivity text not null default 'pastoral',
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pastoral_followup_subject check (person_id is not null or household_id is not null)
);

create table public.funds (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.giving_transactions (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.funds (id) on delete restrict,
  person_id uuid references public.people (id) on delete set null,
  household_id uuid references public.households (id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  status public.transaction_status not null default 'pending',
  payment_method text,
  payment_reference text,
  received_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users (id) on delete set null,
  reversal_reason text,
  recorded_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint giving_confirmed_audit check (status <> 'confirmed' or (confirmed_at is not null and confirmed_by is not null)),
  constraint giving_reversal_reason check (status <> 'reversed' or reversal_reason is not null)
);

create table public.session_meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  scheduled_at timestamptz not null,
  venue text,
  status public.meeting_status not null default 'draft',
  agenda text,
  minutes text,
  chaired_by uuid references public.people (id) on delete set null,
  clerk_person_id uuid references public.people (id) on delete set null,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.session_decisions (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.session_meetings (id) on delete cascade,
  decision_number text,
  title text not null,
  detail text,
  is_confidential boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.action_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references public.session_meetings (id) on delete set null,
  decision_id uuid references public.session_decisions (id) on delete set null,
  title text not null,
  assigned_to uuid references public.people (id) on delete set null,
  due_on date,
  status public.action_status not null default 'open',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  object_key text not null,
  mime_type text,
  is_public boolean not null default false,
  uploaded_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.notification_preferences (
  person_id uuid primary key references public.people (id) on delete cascade,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  whatsapp_enabled boolean not null default false,
  consented_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.message_deliveries (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.people (id) on delete set null,
  channel text not null,
  subject text,
  body text not null,
  status public.delivery_status not null default 'queued',
  provider_reference text,
  sent_at timestamptz,
  error_message text,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text,
  body text not null,
  cover_image_key text,
  published_at timestamptz not null default now(),
  status public.content_status not null default 'draft',
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'General',
  object_key text,
  external_url text check (external_url is null or external_url ~ '^https://'),
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint downloads_has_file check (object_key is not null or external_url is not null)
);

create trigger people_set_updated_at before update on public.people for each row execute function public.set_updated_at();
create trigger households_set_updated_at before update on public.households for each row execute function public.set_updated_at();
create trigger pastoral_followups_set_updated_at before update on public.pastoral_followups for each row execute function public.set_updated_at();
create trigger session_meetings_set_updated_at before update on public.session_meetings for each row execute function public.set_updated_at();
create trigger notification_preferences_set_updated_at before update on public.notification_preferences for each row execute function public.set_updated_at();
create trigger stories_set_updated_at before update on public.stories for each row execute function public.set_updated_at();

create function public.protect_giving_ledger()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' then raise exception 'Giving transactions cannot be deleted; reverse the entry instead'; end if;
  if old.status = 'reversed' and new is distinct from old then raise exception 'Reversed transactions are immutable'; end if;
  if old.status = 'confirmed' and (
    new.fund_id is distinct from old.fund_id or new.person_id is distinct from old.person_id
    or new.household_id is distinct from old.household_id or new.amount is distinct from old.amount
    or new.payment_method is distinct from old.payment_method or new.payment_reference is distinct from old.payment_reference
    or new.received_at is distinct from old.received_at or new.status not in ('confirmed', 'reversed')
  ) then raise exception 'Confirmed transaction details are immutable; reverse the entry instead'; end if;
  return new;
end;
$$;
revoke execute on function public.protect_giving_ledger() from public;
create trigger giving_transactions_protect before update or delete on public.giving_transactions for each row execute function public.protect_giving_ledger();

create index people_name_idx on public.people (last_name, first_name);
create index people_status_idx on public.people (status);
create index people_auth_user_idx on public.people (auth_user_id);
create index household_members_person_idx on public.household_members (person_id);
create index ministry_memberships_person_idx on public.ministry_memberships (person_id);
create index attendance_records_person_idx on public.attendance_records (person_id);
create index pastoral_followups_status_due_idx on public.pastoral_followups (status, due_on);
create index giving_transactions_fund_status_idx on public.giving_transactions (fund_id, status);
create index session_meetings_scheduled_idx on public.session_meetings (scheduled_at desc);
create index action_items_status_due_idx on public.action_items (status, due_on);
create index audit_events_entity_idx on public.audit_events (entity_type, entity_id, created_at desc);

do $$
declare t text;
begin
  foreach t in array array[
    'people','households','household_members','ministry_memberships','leadership_terms',
    'worship_services','attendance_records','shepherding_groups','shepherd_assignments',
    'pastoral_followups','funds','giving_transactions','session_meetings','session_decisions',
    'action_items','documents','notification_preferences','message_deliveries','audit_events','stories','downloads'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy "%1$s: admin all" on public.%1$I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  end loop;
end;
$$;

grant usage, select on sequence public.audit_events_id_seq to authenticated;
revoke update, delete on public.audit_events from authenticated;

-- Members can read their own profile, preferences, memberships and attendance.
create policy "people: member read self" on public.people for select to authenticated
  using (auth_user_id = (select auth.uid()));
create policy "notification_preferences: member read self" on public.notification_preferences for select to authenticated
  using (person_id in (select id from public.people where auth_user_id = (select auth.uid())));
create policy "notification_preferences: member update self" on public.notification_preferences for update to authenticated
  using (person_id in (select id from public.people where auth_user_id = (select auth.uid())))
  with check (person_id in (select id from public.people where auth_user_id = (select auth.uid())));
create policy "ministry_memberships: member read self" on public.ministry_memberships for select to authenticated
  using (person_id in (select id from public.people where auth_user_id = (select auth.uid())));
create policy "attendance_records: member read self" on public.attendance_records for select to authenticated
  using (person_id in (select id from public.people where auth_user_id = (select auth.uid())));
create policy "giving_transactions: member read self" on public.giving_transactions for select to authenticated
  using (person_id in (select id from public.people where auth_user_id = (select auth.uid())) and status <> 'pending');

-- Public documents are deliberately curated; private documents remain admin-only.
grant select on public.documents to anon;
create policy "documents: public read" on public.documents for select to anon, authenticated
  using (is_public or (select public.is_admin()));

grant select on public.stories, public.downloads to anon;
create policy "stories: public read published" on public.stories for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));
create policy "downloads: public read published" on public.downloads for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

