-- Daily worship and Harvest foundations.
-- Almanac content must come from an authorised PCG source.
-- Public Harvest totals expose confirmed aggregates only, never donor records.

create type public.group_kind as enum (
  'generational',
  'intergenerational',
  'ministry',
  'committee',
  'shepherding'
);

create type public.almanac_status as enum ('draft', 'published');
create type public.campaign_status as enum ('draft', 'active', 'closed');
create type public.contribution_status as enum ('pending', 'confirmed', 'reversed');

alter table public.groups
  add column group_kind public.group_kind not null default 'ministry',
  add column is_public boolean not null default true,
  add column parent_group_id uuid references public.groups (id) on delete set null;

drop policy "groups: public read" on public.groups;
create policy "groups: public read visible" on public.groups
  for select to anon, authenticated
  using (is_public or (select public.is_admin()));

update public.groups
set group_kind = case
  when slug in (
    'childrens-service', 'junior-youth', 'young-peoples-guild',
    'young-adults-fellowship', 'womens-fellowship', 'mens-fellowship'
  ) then 'generational'::public.group_kind
  when slug in ('church-choir', 'singing-band') then 'intergenerational'::public.group_kind
  else group_kind
end;

create table public.almanac_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null unique,
  day_label text,
  theme text,
  liturgical_season text,
  liturgical_color text,
  readings jsonb not null default '[]'::jsonb check (jsonb_typeof(readings) = 'array'),
  memory_verse_reference text,
  memory_verse_text text,
  hymn_number text,
  hymn_title text,
  hymn_language text,
  prayer_focus text,
  observance text,
  reflection text,
  source_note text,
  status public.almanac_status not null default 'draft',
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  theme text,
  scripture_reference text,
  purpose text,
  target_amount numeric(14,2) not null check (target_amount > 0),
  confirmed_amount numeric(14,2) not null default 0 check (confirmed_amount >= 0),
  starts_on date not null,
  ends_on date,
  status public.campaign_status not null default 'draft',
  show_progress boolean not null default true,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaigns_end_after_start check (ends_on is null or ends_on >= starts_on)
);

create table public.pledges (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete restrict,
  member_id uuid,
  household_id uuid,
  amount numeric(14,2) not null check (amount > 0),
  is_anonymous boolean not null default false,
  note text,
  recorded_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete restrict,
  pledge_id uuid references public.pledges (id) on delete set null,
  member_id uuid,
  household_id uuid,
  amount numeric(14,2) not null check (amount > 0),
  status public.contribution_status not null default 'pending',
  payment_reference text,
  received_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users (id) on delete set null,
  reversal_reason text,
  recorded_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint confirmed_contribution_has_audit check (
    status <> 'confirmed' or (confirmed_at is not null and confirmed_by is not null)
  ),
  constraint reversed_contribution_has_reason check (
    status <> 'reversed' or reversal_reason is not null
  )
);

create function public.protect_contribution_ledger()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Contribution records cannot be deleted; reverse the entry instead';
  end if;

  if old.status = 'reversed' and new is distinct from old then
    raise exception 'Reversed contribution records are immutable';
  end if;

  if old.status = 'confirmed' then
    if new.campaign_id is distinct from old.campaign_id
      or new.pledge_id is distinct from old.pledge_id
      or new.member_id is distinct from old.member_id
      or new.household_id is distinct from old.household_id
      or new.amount is distinct from old.amount
      or new.payment_reference is distinct from old.payment_reference
      or new.received_at is distinct from old.received_at
      or new.status not in ('confirmed', 'reversed') then
      raise exception 'Confirmed contribution details are immutable; reverse the entry instead';
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.protect_contribution_ledger() from public;

create trigger contributions_protect_ledger
  before update or delete on public.contributions
  for each row execute function public.protect_contribution_ledger();

create trigger almanac_entries_set_updated_at
  before update on public.almanac_entries
  for each row execute function public.set_updated_at();

create trigger campaigns_set_updated_at
  before update on public.campaigns
  for each row execute function public.set_updated_at();

create function public.refresh_campaign_total()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_campaign uuid;
begin
  if tg_op = 'DELETE' then
    affected_campaign := old.campaign_id;
  else
    affected_campaign := new.campaign_id;
  end if;
  update public.campaigns
  set confirmed_amount = coalesce((
    select sum(amount)
    from public.contributions
    where campaign_id = affected_campaign and status = 'confirmed'
  ), 0)
  where id = affected_campaign;

  if tg_op = 'UPDATE' and old.campaign_id is distinct from new.campaign_id then
    update public.campaigns
    set confirmed_amount = coalesce((
      select sum(amount)
      from public.contributions
      where campaign_id = old.campaign_id and status = 'confirmed'
    ), 0)
    where id = old.campaign_id;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke execute on function public.refresh_campaign_total() from public;

create trigger contributions_refresh_campaign_total
  after insert or update or delete on public.contributions
  for each row execute function public.refresh_campaign_total();

create index groups_kind_sort_idx on public.groups (group_kind, sort_order);
create index almanac_entries_date_idx on public.almanac_entries (entry_date desc);
create index campaigns_status_dates_idx on public.campaigns (status, starts_on, ends_on);
create index pledges_campaign_id_idx on public.pledges (campaign_id);
create index contributions_campaign_status_idx on public.contributions (campaign_id, status);

alter table public.almanac_entries enable row level security;
alter table public.campaigns enable row level security;
alter table public.pledges enable row level security;
alter table public.contributions enable row level security;

revoke all on public.almanac_entries, public.campaigns, public.pledges, public.contributions from anon, authenticated;

grant select on public.almanac_entries, public.campaigns to anon, authenticated;
grant insert, update, delete on public.almanac_entries, public.pledges to authenticated;
grant insert, delete on public.campaigns to authenticated;
grant update (name, slug, theme, scripture_reference, purpose, target_amount, starts_on, ends_on, status, show_progress) on public.campaigns to authenticated;
grant insert, update on public.contributions to authenticated;
grant select on public.pledges, public.contributions to authenticated;

create policy "almanac_entries: public read published" on public.almanac_entries
  for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

create policy "campaigns: public read active" on public.campaigns
  for select to anon, authenticated
  using (status in ('active', 'closed') or (select public.is_admin()));

do $$
declare
  t text;
begin
  foreach t in array array['almanac_entries', 'pledges']
  loop
    execute format(
      'create policy "%1$s: admin select" on public.%1$I for select to authenticated using ((select public.is_admin()))',
      t
    );
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

create policy "campaigns: admin insert" on public.campaigns
  for insert to authenticated with check ((select public.is_admin()));
create policy "campaigns: admin update" on public.campaigns
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "campaigns: admin delete" on public.campaigns
  for delete to authenticated using ((select public.is_admin()));

create policy "contributions: admin select" on public.contributions
  for select to authenticated using ((select public.is_admin()));
create policy "contributions: admin insert" on public.contributions
  for insert to authenticated with check ((select public.is_admin()));
create policy "contributions: admin update" on public.contributions
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

alter publication supabase_realtime add table public.campaigns;

