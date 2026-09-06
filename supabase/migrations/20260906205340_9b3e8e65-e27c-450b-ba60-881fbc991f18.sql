revoke execute on function public.handle_new_user() from public, anon, authenticated;

create or replace function public.curve_target() returns numeric language sql immutable as $$ select 5000::numeric $$;
create or replace function public.curve_supply() returns numeric language sql immutable as $$ select 800000000::numeric $$;

create or replace function public.curve_cost(s0 numeric, s1 numeric)
returns numeric language sql immutable as $$
  select (public.curve_target()/(10*public.curve_supply()))*(s1-s0)
       + (1.8*public.curve_target()/(public.curve_supply()^2))/2*(s1^2-s0^2)
$$;

create or replace function public.curve_price(s numeric)
returns numeric language sql immutable as $$
  select (public.curve_target()/(10*public.curve_supply()))
       + (1.8*public.curve_target()/(public.curve_supply()^2))*s
$$;

create or replace function public.execute_trade(p_token_id uuid, p_side text, p_amount numeric)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  t public.tokens%rowtype;
  a numeric; b numeric;
  s0 numeric; s1 numeric;
  gross numeric; net numeric; fee_total numeric; fee_creator numeric;
  creator_bps int; protocol_bps int := 40;
  tokens_out numeric; k numeric;
  v_balance numeric; v_holding numeric;
begin
  if v_uid is null then raise exception 'Not signed in'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Enter an amount greater than zero'; end if;
  if p_side not in ('buy','sell') then raise exception 'Invalid side'; end if;

  select * into t from public.tokens where id = p_token_id for update;
  if not found then raise exception 'Coin not found'; end if;

  a := public.curve_target()/(10*public.curve_supply());
  b := 1.8*public.curve_target()/(public.curve_supply()^2);
  s0 := t.tokens_sold;
  creator_bps := 60 + t.creator_tax_bps;

  insert into public.balances (user_id, currency, amount)
  values (v_uid, t.pair, 10000)
  on conflict (user_id, currency) do nothing;
  select amount into v_balance from public.balances where user_id = v_uid and currency = t.pair for update;

  insert into public.holdings (token_id, user_id, amount)
  values (p_token_id, v_uid, 0) on conflict do nothing;
  select amount into v_holding from public.holdings where token_id = p_token_id and user_id = v_uid for update;

  if p_side = 'buy' then
    gross := p_amount;
    if gross > v_balance then raise exception 'Not enough funds in your % account', t.pair; end if;
    fee_total := gross * (creator_bps + protocol_bps) / 10000.0;
    fee_creator := gross * creator_bps / 10000.0;
    net := gross - fee_total;
    k := a*s0 + b/2*s0^2 + net;
    s1 := ((-a) + sqrt((a*a + 2*b*k)::double precision)::numeric) / b;
    tokens_out := s1 - s0;
    update public.balances set amount = amount - gross where user_id = v_uid and currency = t.pair;
    update public.holdings set amount = amount + tokens_out where token_id = p_token_id and user_id = v_uid;
    update public.tokens set
      tokens_sold = s1,
      reserve = reserve + net,
      fees_accrued = fees_accrued + fee_creator,
      graduated = (reserve + net) >= public.curve_target()
    where id = p_token_id;
    insert into public.trades (token_id, user_id, side, currency_amount, token_amount, price)
    values (p_token_id, v_uid, 'buy', gross, tokens_out, public.curve_price(s1));
    return json_build_object('tokens', tokens_out, 'currency', gross, 'price', public.curve_price(s1));
  else
    if p_amount > v_holding then raise exception 'You do not hold that many tokens'; end if;
    s1 := s0 - p_amount;
    gross := public.curve_cost(s1, s0);
    fee_total := gross * (creator_bps + protocol_bps) / 10000.0;
    fee_creator := gross * creator_bps / 10000.0;
    net := gross - fee_total;
    update public.balances set amount = amount + net where user_id = v_uid and currency = t.pair;
    update public.holdings set amount = amount - p_amount where token_id = p_token_id and user_id = v_uid;
    update public.tokens set
      tokens_sold = s1,
      reserve = greatest(reserve - gross, 0),
      fees_accrued = fees_accrued + fee_creator
    where id = p_token_id;
    insert into public.trades (token_id, user_id, side, currency_amount, token_amount, price)
    values (p_token_id, v_uid, 'sell', net, p_amount, public.curve_price(s1));
    return json_build_object('tokens', p_amount, 'currency', net, 'price', public.curve_price(s1));
  end if;
end;
$$;

revoke execute on function public.execute_trade(uuid, text, numeric) from public, anon;
grant execute on function public.execute_trade(uuid, text, numeric) to authenticated;

create or replace function public.claim_creator_fees(p_token_id uuid)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  t public.tokens%rowtype;
  v_claimable numeric;
begin
  if v_uid is null then raise exception 'Not signed in'; end if;
  select * into t from public.tokens where id = p_token_id for update;
  if not found then raise exception 'Coin not found'; end if;
  if t.creator_id <> v_uid then raise exception 'Only the creator can claim these fees'; end if;
  v_claimable := t.fees_accrued - t.fees_claimed;
  if v_claimable <= 0 then raise exception 'Nothing to claim yet'; end if;
  update public.tokens set fees_claimed = fees_accrued where id = p_token_id;
  insert into public.balances (user_id, currency, amount)
  values (v_uid, t.pair, v_claimable)
  on conflict (user_id, currency) do update set amount = public.balances.amount + excluded.amount;
  return v_claimable;
end;
$$;

revoke execute on function public.claim_creator_fees(uuid) from public, anon;
grant execute on function public.claim_creator_fees(uuid) to authenticated;