-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Anonymous',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles are viewable by everyone" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Anonymous'))
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- balances (test funds per currency)
create table public.balances (
  user_id uuid not null references auth.users(id) on delete cascade,
  currency text not null,
  amount numeric(24,6) not null default 0,
  primary key (user_id, currency)
);
grant select on public.balances to authenticated;
grant all on public.balances to service_role;
alter table public.balances enable row level security;
create policy "users read own balances" on public.balances for select to authenticated using (auth.uid() = user_id);

-- tokens
create table public.tokens (
  id uuid primary key default gen_random_uuid(),
  address text not null unique,
  name text not null,
  ticker text not null,
  emoji text not null default '🏦',
  pair text not null,
  description text not null default '',
  website text,
  twitter text,
  telegram text,
  creator_id uuid not null references auth.users(id) on delete cascade,
  creator_tax_bps int not null default 0 check (creator_tax_bps between 0 and 500),
  reserve numeric(24,6) not null default 0,
  tokens_sold numeric(30,6) not null default 0,
  fees_accrued numeric(24,6) not null default 0,
  fees_claimed numeric(24,6) not null default 0,
  graduated boolean not null default false,
  created_at timestamptz not null default now()
);
create index tokens_created_at_idx on public.tokens (created_at desc);
grant select on public.tokens to anon, authenticated;
grant insert on public.tokens to authenticated;
grant all on public.tokens to service_role;
alter table public.tokens enable row level security;
create policy "tokens are public" on public.tokens for select using (true);
create policy "creators launch tokens" on public.tokens for insert to authenticated with check (auth.uid() = creator_id);

-- trades
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.tokens(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  side text not null check (side in ('buy','sell')),
  currency_amount numeric(24,6) not null,
  token_amount numeric(30,6) not null,
  price numeric(30,12) not null,
  created_at timestamptz not null default now()
);
create index trades_token_created_idx on public.trades (token_id, created_at desc);
grant select on public.trades to anon, authenticated;
grant all on public.trades to service_role;
alter table public.trades enable row level security;
create policy "trades are public" on public.trades for select using (true);

-- holdings
create table public.holdings (
  token_id uuid not null references public.tokens(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(30,6) not null default 0,
  primary key (token_id, user_id)
);
grant select on public.holdings to anon, authenticated;
grant all on public.holdings to service_role;
alter table public.holdings enable row level security;
create policy "holdings are public" on public.holdings for select using (true);