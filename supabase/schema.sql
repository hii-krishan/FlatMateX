create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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

alter table public.profiles enable row level security;
alter table public.expenses enable row level security;
alter table public.notes enable row level security;
alter table public.groceries enable row level security;

create policy "Users can manage their profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can manage their expenses" on public.expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their notes" on public.notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their groceries" on public.groceries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
