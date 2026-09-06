create view public.token_market with (security_invoker = on) as
select
  t.id,
  t.address,
  t.name,
  t.ticker,
  t.emoji,
  t.pair,
  t.description,
  t.website,
  t.twitter,
  t.telegram,
  t.creator_id,
  t.creator_tax_bps,
  t.reserve,
  t.tokens_sold,
  t.fees_accrued,
  t.fees_claimed,
  t.graduated,
  t.created_at,
  p.display_name as creator_name,
  public.curve_price(t.tokens_sold) as price,
  (select count(*) from public.holdings h where h.token_id = t.id and h.amount > 0) as holders,
  coalesce((select sum(tr.currency_amount) from public.trades tr where tr.token_id = t.id and tr.created_at > now() - interval '24 hours'), 0) as volume_24h,
  (select tr.price from public.trades tr where tr.token_id = t.id and tr.created_at <= now() - interval '24 hours' order by tr.created_at desc limit 1) as price_24h_ago,
  least(t.reserve / public.curve_target() * 100, 100) as progress
from public.tokens t
left join public.profiles p on p.id = t.creator_id;

grant select on public.token_market to anon, authenticated;