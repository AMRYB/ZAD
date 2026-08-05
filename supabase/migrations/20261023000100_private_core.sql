-- Supabase Auth owns identities. Quran media are never copied into this database.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  alias text not null default '' check (char_length(alias) <= 40),
  locale text not null default 'ar' check (locale in ('ar','en')),
  theme text not null default 'system' check (theme in ('system','light','dark')),
  leaderboard_opt_in boolean not null default false,
  adult_consent boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy profiles_own_read on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_own_create on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_own_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
grant select, insert on public.profiles to authenticated;
grant update(alias,locale,theme,leaderboard_opt_in,adult_consent) on public.profiles to authenticated;

create table public.user_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null check (revision > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.user_snapshots enable row level security;
create policy snapshots_own_read on public.user_snapshots for select to authenticated using (user_id = auth.uid());
grant select on public.user_snapshots to authenticated;

-- Full-document compare-and-swap: conflicts must be resolved explicitly by the client.
-- Direct writes are intentionally unavailable, preventing revision spoofing.
create or replace function public.sync_state(p_expected_revision bigint, p_payload jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); previous bigint; next_revision bigint;
begin
  if actor is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if p_expected_revision is null or p_expected_revision < 0 or p_payload is null
    or jsonb_typeof(p_payload) <> 'object' or p_payload->>'version' is distinct from '1'
    or octet_length(p_payload::text) > 2097152 then
    raise exception 'INVALID_SNAPSHOT' using errcode = '22023';
  end if;
  -- A per-user row serializes first writes as well as updates.
  insert into public.profiles(id) values(actor) on conflict(id) do nothing;
  perform id from public.profiles where id = actor for update;
  select revision into previous from public.user_snapshots where user_id = actor;
  if coalesce(previous,0) <> p_expected_revision then raise exception 'SYNC_CONFLICT' using errcode = '40001'; end if;
  next_revision := coalesce(previous,0)+1;
  insert into public.user_snapshots(user_id,revision,payload) values(actor,next_revision,p_payload)
    on conflict(user_id) do update set revision=excluded.revision,payload=excluded.payload,updated_at=now();
  return next_revision;
end $$;
revoke all on function public.sync_state(bigint,jsonb) from public;
grant execute on function public.sync_state(bigint,jsonb) to authenticated;

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid not null,
  kind text not null check (kind in ('daily_checkin','reading_session','weekly_review')),
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique(user_id,source_id)
);
create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null,
  source_id text not null,
  rule_version integer not null default 1,
  amount integer not null check (amount >= 0 and amount <= 100),
  award_day date not null default (now() at time zone 'UTC')::date,
  created_at timestamptz not null default now(),
  unique(user_id,source_type,source_id,rule_version)
);
create index xp_user_day on public.xp_events(user_id,award_day);
alter table public.activity_events enable row level security;
alter table public.xp_events enable row level security;
create policy activities_own on public.activity_events for select to authenticated using (user_id = auth.uid());
create policy xp_own on public.xp_events for select to authenticated using (user_id = auth.uid());
grant select on public.activity_events,public.xp_events to authenticated;

-- XP represents self-reported app participation, never proof of worship.
-- The server controls award time, rules, per-user locking, caps and deduplication.
create or replace function public.record_activity(p_source_id uuid,p_kind text,p_payload jsonb default '{}')
returns integer language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); requested integer; awarded integer; previous_total integer;
  source text; today date := (now() at time zone 'UTC')::date;
begin
  if actor is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if p_source_id is null or p_kind is null or p_kind not in ('daily_checkin','reading_session','weekly_review')
    or p_payload is null or jsonb_typeof(p_payload) <> 'object' then raise exception 'INVALID_ACTIVITY' using errcode = '22023'; end if;
  if p_kind = 'reading_session' and (p_payload->>'page' is null or p_payload->>'page' !~ '^[0-9]{1,3}$'
    or (p_payload->>'page')::integer not between 1 and 604 or p_payload->>'completed' is distinct from 'true') then
    raise exception 'INVALID_READING_SESSION' using errcode = '22023';
  end if;
  insert into public.profiles(id) values(actor) on conflict(id) do nothing;
  perform id from public.profiles where id=actor for update;
  if exists(select 1 from public.activity_events where user_id=actor and source_id=p_source_id) then return 0; end if;
  -- Keep sensitive notes and reasons out of the trusted participation ledger.
  insert into public.activity_events(user_id,source_id,kind,payload)
    values(actor,p_source_id,p_kind,case when p_kind='reading_session' then jsonb_build_object('page',(p_payload->>'page')::integer) else '{}'::jsonb end);
  requested := case p_kind when 'daily_checkin' then 5 when 'reading_session' then 10 else 15 end;
  source := case p_kind when 'daily_checkin' then today::text when 'weekly_review' then to_char(today,'IYYY-IW') else p_source_id::text end;
  if exists(select 1 from public.xp_events where user_id=actor and source_type=p_kind and source_id=source and rule_version=1) then return 0; end if;
  select coalesce(sum(amount),0) into previous_total from public.xp_events where user_id=actor and award_day=today;
  awarded := greatest(0,least(requested,100-previous_total));
  insert into public.xp_events(user_id,source_type,source_id,amount,award_day) values(actor,p_kind,source,awarded,today);
  return awarded;
end $$;
revoke all on function public.record_activity(uuid,text,jsonb) from public;
grant execute on function public.record_activity(uuid,text,jsonb) to authenticated;

create table public.blocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  primary key(user_id,blocked_user_id),check(user_id<>blocked_user_id)
);
alter table public.blocks enable row level security;
create policy blocks_own on public.blocks for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,delete on public.blocks to authenticated;

-- Only this bounded projection is public to signed-in participants.
create or replace function public.get_leaderboard(p_limit integer default 20,p_offset integer default 0)
returns table(user_id uuid,alias text,xp bigint)
language sql stable security definer set search_path = '' as $$
  select p.id,p.alias,coalesce(sum(x.amount),0)::bigint
  from public.profiles p left join public.xp_events x on x.user_id=p.id
  where auth.uid() is not null and p.leaderboard_opt_in and p.adult_consent and p.alias<>''
    and not exists(select 1 from public.blocks b where
      (b.user_id=auth.uid() and b.blocked_user_id=p.id) or (b.blocked_user_id=auth.uid() and b.user_id=p.id))
  group by p.id,p.alias order by coalesce(sum(x.amount),0) desc,p.id
  limit greatest(1,least(coalesce(p_limit,20),100)) offset greatest(0,least(coalesce(p_offset,0),10000));
$$;
revoke all on function public.get_leaderboard(integer,integer) from public;
grant execute on function public.get_leaderboard(integer,integer) to authenticated;

create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  delete from auth.users where id=auth.uid();
end $$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
