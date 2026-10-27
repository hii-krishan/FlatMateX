create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid,
  name text not null,
  assigned_to text not null default 'Unassigned',
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  category text not null,
  paid_by text,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.groceries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  quantity integer not null default 1 check (quantity > 0),
  purchased boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  event_date date not null,
  type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.timetable (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  day text not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  mood text not null,
  sleep_hours numeric(4, 1) not null check (sleep_hours >= 0 and sleep_hours <= 24),
  productivity_level text not null,
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create table if not exists public.flatmates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'Invited',
  created_at timestamptz not null default now()
);

alter table public.expenses add column if not exists split_details jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists email text;
update public.profiles set email = auth_users.email
from auth.users as auth_users
where public.profiles.id = auth_users.id and public.profiles.email is null;

alter table public.profiles enable row level security;
alter table public.expenses enable row level security;
alter table public.notes enable row level security;
alter table public.groceries enable row level security;
alter table public.events enable row level security;
alter table public.tasks enable row level security;
alter table public.timetable enable row level security;
alter table public.chores enable row level security;
alter table public.mood_entries enable row level security;
alter table public.flatmates enable row level security;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, new.raw_user_meta_data ->> 'display_name', new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My flat',
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.group_invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  email text,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  invited_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.expenses add column if not exists group_id uuid references public.groups(id) on delete cascade;
alter table public.notes add column if not exists group_id uuid references public.groups(id) on delete cascade;
alter table public.groceries add column if not exists group_id uuid references public.groups(id) on delete cascade;
alter table public.events add column if not exists group_id uuid references public.groups(id) on delete cascade;
alter table public.tasks add column if not exists group_id uuid references public.groups(id) on delete cascade;
alter table public.timetable add column if not exists group_id uuid references public.groups(id) on delete cascade;
alter table public.chores add column if not exists group_id uuid references public.groups(id) on delete cascade;
alter table public.flatmates add column if not exists group_id uuid references public.groups(id) on delete cascade;

do $$
declare account record;
declare default_group uuid;
begin
  for account in select id from auth.users loop
    select id into default_group from public.groups where owner_id = account.id order by created_at limit 1;
    if default_group is null then
      insert into public.groups (owner_id) values (account.id) returning id into default_group;
    end if;
    insert into public.group_members (group_id, user_id, role)
    values (default_group, account.id, 'owner')
    on conflict (group_id, user_id) do nothing;
    update public.expenses set group_id = default_group where user_id = account.id and group_id is null;
    update public.notes set group_id = default_group where user_id = account.id and group_id is null;
    update public.groceries set group_id = default_group where user_id = account.id and group_id is null;
    update public.events set group_id = default_group where user_id = account.id and group_id is null;
    update public.tasks set group_id = default_group where user_id = account.id and group_id is null;
    update public.timetable set group_id = default_group where user_id = account.id and group_id is null;
    update public.chores set group_id = default_group where user_id = account.id and group_id is null;
    update public.flatmates set group_id = default_group where owner_id = account.id and group_id is null;
  end loop;
end $$;

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_invitations enable row level security;

create or replace function public.is_group_member(target_group uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (
  select 1 from public.group_members
  where group_id = target_group and user_id = auth.uid()
); $$;

create or replace function public.accept_group_invitation(invite_token text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  invitation public.group_invitations;
  current_email text;
begin
  select * into invitation
  from public.group_invitations
  where token = invite_token and accepted_at is null and expires_at > now()
  for update;
  if not found then raise exception 'Invitation is invalid or expired'; end if;
  select email into current_email from auth.users where id = auth.uid();
  if invitation.email is not null and lower(current_email) <> lower(invitation.email) then
    raise exception 'Sign in with the invited email address';
  end if;
  insert into public.group_members (group_id, user_id, role)
  values (invitation.group_id, auth.uid(), 'member')
  on conflict (group_id, user_id) do nothing;
  update public.group_invitations set accepted_at = now() where id = invitation.id;
  return invitation.group_id;
end;
$$;

create or replace function public.ensure_default_group()
returns uuid language plpgsql security definer set search_path = public
as $$
declare existing_group uuid;
begin
  select group_id into existing_group from public.group_members where user_id = auth.uid() order by created_at limit 1;
  if existing_group is null then
    insert into public.groups (owner_id) values (auth.uid()) returning id into existing_group;
    insert into public.group_members (group_id, user_id, role) values (existing_group, auth.uid(), 'owner');
  end if;
  return existing_group;
end;
$$;

-- Automatically claims all pending invitations for the authenticated user by email
create or replace function public.claim_user_invitations()
returns table (group_id uuid, group_name text, role text)
language plpgsql security definer set search_path = public
as $$
declare
  current_user_email text;
  inv record;
begin
  select lower(email) into current_user_email from auth.users where id = auth.uid();
  if current_user_email is null or current_user_email = '' then
    return;
  end if;

  -- 1. Accept from group_invitations
  for inv in
    select gi.id, gi.group_id
    from public.group_invitations gi
    where lower(gi.email) = current_user_email
  loop
    insert into public.group_members (group_id, user_id, role)
    values (inv.group_id, auth.uid(), 'member')
    on conflict (group_id, user_id) do nothing;

    update public.group_invitations
    set accepted_at = now()
    where id = inv.id;
  end loop;

  -- 2. Accept from flatmates table where email matches
  for inv in
    select distinct coalesce(fm.group_id, (select gm.group_id from public.group_members gm where gm.user_id = fm.owner_id order by gm.created_at limit 1)) as target_group
    from public.flatmates fm
    where lower(fm.email) = current_user_email
  loop
    if inv.target_group is not null then
      insert into public.group_members (group_id, user_id, role)
      values (inv.target_group, auth.uid(), 'member')
      on conflict (group_id, user_id) do nothing;
    end if;
  end loop;

  -- Return user's groups with shared groups prioritized
  return query
  select gm.group_id, g.name as group_name, gm.role
  from public.group_members gm
  join public.groups g on g.id = gm.group_id
  where gm.user_id = auth.uid()
  order by (case when gm.role = 'member' then 0 else 1 end), gm.created_at;
end;
$$;

-- Returns all registered members for a specific group (or active group if null)
create or replace function public.get_group_members(target_group_id uuid default null)
returns table (user_id uuid, display_name text, email text, role text)
language plpgsql security definer set search_path = public
as $$
declare
  resolved_group uuid := target_group_id;
begin
  if resolved_group is null then
    select membership.group_id into resolved_group
    from public.group_members membership
    where membership.user_id = auth.uid()
    order by (case when membership.role = 'member' then 0 else 1 end), membership.created_at
    limit 1;
  end if;

  if resolved_group is null then
    return;
  end if;

  return query
  select profiles.id, profiles.display_name, profiles.email, group_members.role
  from public.group_members
  join public.profiles on profiles.id = group_members.user_id
  where group_members.group_id = resolved_group
  order by (case when group_members.role = 'owner' then 0 else 1 end), group_members.created_at;
end;
$$;

create or replace function public.get_current_group_members()
returns table (user_id uuid, display_name text, email text, role text)
language plpgsql security definer set search_path = public
as $$
begin
  return query select * from public.get_group_members(null);
end;
$$;

-- Adds a member by email: if user already has an account, adds directly to group_members; otherwise creates invitation
create or replace function public.add_group_member_by_email(
  target_group_id uuid,
  member_email text,
  member_name text default null
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  existing_user_id uuid;
  new_token text;
begin
  if not exists (select 1 from public.group_members where group_id = target_group_id and user_id = auth.uid()) then
    raise exception 'Not authorized to add members to this group';
  end if;

  select id into existing_user_id
  from auth.users
  where lower(email) = lower(member_email)
  limit 1;

  if existing_user_id is not null then
    insert into public.group_members (group_id, user_id, role)
    values (target_group_id, existing_user_id, 'member')
    on conflict (group_id, user_id) do nothing;

    return jsonb_build_object('success', true, 'status', 'joined', 'user_id', existing_user_id);
  else
    insert into public.group_invitations (group_id, email, invited_by)
    values (target_group_id, lower(member_email), auth.uid())
    returning token into new_token;

    return jsonb_build_object('success', true, 'status', 'invited', 'token', new_token);
  end if;
end;
$$;

grant execute on function public.accept_group_invitation(text) to authenticated;
grant execute on function public.ensure_default_group() to authenticated;
grant execute on function public.get_current_group_members() to authenticated;
grant execute on function public.get_group_members(uuid) to authenticated;
grant execute on function public.claim_user_invitations() to authenticated;
grant execute on function public.add_group_member_by_email(uuid, text, text) to authenticated;

drop policy if exists "Users can manage their profile" on public.profiles;
drop policy if exists "Users can manage their expenses" on public.expenses;
drop policy if exists "Users can manage their notes" on public.notes;
drop policy if exists "Users can manage their groceries" on public.groceries;
drop policy if exists "Users can manage their events" on public.events;
drop policy if exists "Users can manage their tasks" on public.tasks;
drop policy if exists "Users can manage their timetable" on public.timetable;
drop policy if exists "Users can manage their mood entries" on public.mood_entries;
drop policy if exists "Users can manage their flatmates" on public.flatmates;
drop policy if exists "Group members can view groups" on public.groups;
drop policy if exists "Users can create groups" on public.groups;
drop policy if exists "Group owners can update groups" on public.groups;
drop policy if exists "Members can view memberships" on public.group_members;
drop policy if exists "Members can view invitations" on public.group_invitations;
drop policy if exists "Members can create invitations" on public.group_invitations;
drop policy if exists "Users can view group member profiles" on public.profiles;
drop policy if exists "Users can update their profile" on public.profiles;
drop policy if exists "Group members can manage expenses" on public.expenses;
drop policy if exists "Group members can manage notes" on public.notes;
drop policy if exists "Group members can manage groceries" on public.groceries;
drop policy if exists "Group members can manage events" on public.events;
drop policy if exists "Group members can manage tasks" on public.tasks;
drop policy if exists "Group members can manage timetable" on public.timetable;
drop policy if exists "Group members can manage chores" on public.chores;

create policy "Group members can view groups" on public.groups for select using (public.is_group_member(id));
create policy "Users can create groups" on public.groups for insert with check (auth.uid() = owner_id);
create policy "Group owners can update groups" on public.groups for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Members can view memberships" on public.group_members for select using (public.is_group_member(group_id));
drop policy if exists "Users can join groups" on public.group_members;

-- Invitations can be seen by members of the group, or by the invited recipient
create policy "Members can view invitations" on public.group_invitations
  for select using (
    public.is_group_member(group_id) or
    lower(email) = lower(auth.jwt() ->> 'email')
  );

create policy "Members can create invitations" on public.group_invitations
  for insert with check (public.is_group_member(group_id) and auth.uid() = invited_by);

create policy "Users can view group member profiles" on public.profiles for select using (
  id = auth.uid() or exists (
    select 1 from public.group_members mine
    join public.group_members theirs on theirs.group_id = mine.group_id
    where mine.user_id = auth.uid() and theirs.user_id = profiles.id
  )
);
create policy "Users can update their profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Group members can manage expenses" on public.expenses for all using (public.is_group_member(group_id)) with check (public.is_group_member(group_id) and auth.uid() = user_id);
create policy "Group members can manage notes" on public.notes for all using (public.is_group_member(group_id)) with check (public.is_group_member(group_id) and auth.uid() = user_id);
create policy "Group members can manage groceries" on public.groceries for all using (public.is_group_member(group_id)) with check (public.is_group_member(group_id) and auth.uid() = user_id);
create policy "Group members can manage events" on public.events for all using (public.is_group_member(group_id)) with check (public.is_group_member(group_id) and auth.uid() = user_id);
create policy "Group members can manage tasks" on public.tasks for all using (public.is_group_member(group_id)) with check (public.is_group_member(group_id) and auth.uid() = user_id);
create policy "Group members can manage timetable" on public.timetable for all using (public.is_group_member(group_id)) with check (public.is_group_member(group_id) and auth.uid() = user_id);
create policy "Group members can manage chores" on public.chores for all using (public.is_group_member(group_id)) with check (public.is_group_member(group_id) and auth.uid() = user_id);
drop policy if exists "Users can manage mood entries" on public.mood_entries;
create policy "Users can manage mood entries" on public.mood_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Flatmates can be viewed and managed by all members of the flat group or the invited recipient
create policy "Users can manage their flatmates" on public.flatmates
  for all using (
    auth.uid() = owner_id or
    (group_id is not null and public.is_group_member(group_id)) or
    lower(email) = lower(auth.jwt() ->> 'email')
  )
  with check (
    auth.uid() = owner_id or
    (group_id is not null and public.is_group_member(group_id))
  );

-- On user signup, auto-connect to invited group if an invitation exists for that email
create or replace function public.create_default_group()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  new_group uuid;
  invited_group uuid;
begin
  -- Check if user was invited via group_invitations
  select group_id into invited_group
  from public.group_invitations
  where lower(email) = lower(new.email)
  order by created_at desc
  limit 1;

  if invited_group is null then
    -- Check if user was added via flatmates table
    select group_id into invited_group
    from public.flatmates
    where lower(email) = lower(new.email) and group_id is not null
    order by created_at desc
    limit 1;
  end if;

  if invited_group is not null then
    insert into public.group_members (group_id, user_id, role)
    values (invited_group, new.id, 'member')
    on conflict (group_id, user_id) do nothing;

    update public.group_invitations
    set accepted_at = now()
    where lower(email) = lower(new.email) and group_id = invited_group;
  else
    insert into public.groups (owner_id) values (new.id) returning id into new_group;
    insert into public.group_members (group_id, user_id, role) values (new_group, new.id, 'owner');
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_group_created on auth.users;
create trigger on_auth_user_group_created after insert on auth.users
for each row execute procedure public.create_default_group();

create or replace function public.leave_current_group()
returns void language plpgsql security definer set search_path = public
as $$
declare
  current_membership public.group_members;
  remaining_count int;
  new_owner uuid;
begin
  select * into current_membership
  from public.group_members
  where user_id = auth.uid()
  order by created_at limit 1;

  if current_membership.group_id is null then
    return;
  end if;

  delete from public.group_members
  where group_id = current_membership.group_id and user_id = auth.uid();

  select count(*) into remaining_count from public.group_members where group_id = current_membership.group_id;
  if remaining_count > 0 then
    select user_id into new_owner from public.group_members where group_id = current_membership.group_id order by created_at limit 1;
    update public.group_members set role = 'owner' where group_id = current_membership.group_id and user_id = new_owner;
    update public.groups set owner_id = new_owner where id = current_membership.group_id;
  end if;

  perform public.ensure_default_group();
end;
$$;

create or replace function public.remove_group_member(target_user_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  caller_role text;
  caller_group uuid;
begin
  select group_id, role into caller_group, caller_role
  from public.group_members
  where user_id = auth.uid()
  order by created_at limit 1;

  if caller_role <> 'owner' then
    raise exception 'Only the group owner can remove members';
  end if;

  delete from public.group_members
  where group_id = caller_group and user_id = target_user_id;
end;
$$;

grant execute on function public.leave_current_group() to authenticated;
grant execute on function public.remove_group_member(uuid) to authenticated;

drop policy if exists "Members can leave or be removed" on public.group_members;
create policy "Members can leave or be removed" on public.group_members
  for delete using (auth.uid() = user_id or exists (
    select 1 from public.groups where groups.id = group_members.group_id and groups.owner_id = auth.uid()
  ));

notify pgrst, 'reload schema';


