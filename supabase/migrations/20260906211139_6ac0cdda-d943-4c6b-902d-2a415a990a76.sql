create table public.wallet_challenges (
  address text primary key,
  nonce text not null,
  created_at timestamptz not null default now()
);

grant all on public.wallet_challenges to service_role;

alter table public.wallet_challenges enable row level security;

create policy "service role only" on public.wallet_challenges
  for all to service_role using (true) with check (true);

alter table public.profiles add column if not exists wallet_address text unique;