-- Data integration staging schema for Google Drive ingestion

-- Staging tables -----------------------------------------------------------

create table if not exists raw_portfolios (
  id uuid primary key default gen_random_uuid(),
  workbook_name text not null,
  refresh_date timestamptz default now(),
  portfolio_code text,
  portfolio_name text,
  aum numeric,
  active_facilities int,
  default_rate numeric,
  sector text,
  created_at timestamptz default now()
);

create table if not exists raw_facilities (
  id uuid primary key default gen_random_uuid(),
  workbook_name text not null,
  refresh_date timestamptz default now(),
  portfolio_code text,
  facility_code text,
  facility_type text,
  amount numeric,
  term_months int,
  apr numeric,
  ltv numeric,
  created_at timestamptz default now()
);

create table if not exists raw_customers (
  id uuid primary key default gen_random_uuid(),
  workbook_name text not null,
  refresh_date timestamptz default now(),
  facility_code text,
  customer_code text,
  name text,
  nit text,
  sector text,
  credit_score numeric,
  created_at timestamptz default now()
);

create table if not exists raw_payments (
  id uuid primary key default gen_random_uuid(),
  workbook_name text not null,
  refresh_date timestamptz default now(),
  customer_code text,
  payment_code text,
  payment_date timestamptz,
  amount numeric,
  days_late int,
  status text,
  created_at timestamptz default now()
);

create table if not exists raw_risk_events (
  id uuid primary key default gen_random_uuid(),
  workbook_name text not null,
  refresh_date timestamptz default now(),
  customer_code text,
  event_date timestamptz,
  event_type text,
  severity text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_raw_facilities_facility_code
  on raw_facilities (facility_code);

create index if not exists idx_raw_customers_customer_code
  on raw_customers (customer_code);

create index if not exists idx_raw_payments_customer_code
  on raw_payments (customer_code);

create index if not exists idx_raw_risk_events_customer_code
  on raw_risk_events (customer_code);

-- Materialized view for ML feature snapshots --------------------------------

create materialized view if not exists ml_feature_snapshots as
select
  c.id as raw_customer_id,
  c.customer_code,
  c.name,
  c.sector,
  avg(p.days_late) as avg_dpd,
  max(p.days_late) as max_dpd,
  count(p.payment_code) as payment_count,
  sum(p.amount) as total_paid,
  coalesce(
    sum(case when p.status ilike 'paid' then p.amount else 0 end)
      / nullif(sum(p.amount), 0),
    0
  ) as collection_rate,
  f.apr,
  f.ltv,
  f.amount as facility_amount,
  avg(
    case
      when r.severity ilike 'high' then 1.0
      when r.severity ilike 'medium' then 0.7
      when r.severity ilike 'low' then 0.3
      else null
    end
  ) as avg_risk_severity,
  max(p.payment_date) as last_payment_at,
  row_number() over (
    partition by c.customer_code
    order by max(p.payment_date) desc nulls last
  ) as recency_rank
from raw_customers c
left join raw_facilities f on c.facility_code = f.facility_code
left join raw_payments p on c.customer_code = p.customer_code
left join raw_risk_events r on c.customer_code = r.customer_code
group by c.id, c.customer_code, c.name, c.sector, f.apr, f.ltv, f.amount;

-- Refresh helper -----------------------------------------------------------

create or replace function refresh_ml_features() returns void as $$
begin
  refresh materialized view ml_feature_snapshots;
end;
$$ language plpgsql;

-- Cron helper example:
-- select cron.schedule('daily-refresh-ml-features', '0 6 * * *', 'select refresh_ml_features();');

-- ML table linkage ---------------------------------------------------------

alter table ml_predictions
  add column if not exists raw_customer_id uuid references raw_customers(id);

alter table ml_model_metrics
  add column if not exists last_feature_refresh timestamptz default now();
