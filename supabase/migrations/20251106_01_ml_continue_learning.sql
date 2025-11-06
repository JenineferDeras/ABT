-- Continue Learning ML Framework - Prediction tracking and feedback loop

-- Predictions table for tracking all ML model outputs
create table if not exists ml_predictions (
  id uuid primary key default gen_random_uuid(),
  model_id text not null,
  customer_id uuid not null,
  metric text not null,
  predicted_value numeric not null,
  confidence numeric check (confidence between 0 and 1),
  reasoning text,
  created_at timestamptz default now(),
  actual_outcome numeric,
  was_correct boolean,
  error_magnitude numeric,
  error_type text check (error_type in ('underestimate','overestimate','correct')),
  user_feedback text,
  feedback_at timestamptz,
  status text default 'awaiting_feedback'
);

-- Model performance metrics aggregation table
create table if not exists ml_model_metrics (
  model_id text primary key,
  total_predictions int default 0,
  correct_predictions int default 0,
  accuracy numeric default 0,
  last_updated timestamptz default now()
);

-- Indexes for performance
create index idx_ml_predictions_customer on ml_predictions(customer_id);
create index idx_ml_predictions_status on ml_predictions(status);
create index idx_ml_predictions_model on ml_predictions(model_id);
create index idx_ml_predictions_created on ml_predictions(created_at desc);

-- RLS policies (adjust based on your auth setup)
alter table ml_predictions enable row level security;
alter table ml_model_metrics enable row level security;

-- Allow authenticated users to read their own predictions
create policy "Users can view their predictions"
  on ml_predictions for select
  using (auth.uid() is not null);

-- Allow service role to insert predictions
create policy "Service can insert predictions"
  on ml_predictions for insert
  with check (auth.uid() is not null);

-- Allow authenticated users to update their predictions (feedback)
create policy "Users can update predictions"
  on ml_predictions for update
  using (auth.uid() is not null);

-- Allow authenticated users to read model metrics
create policy "Users can view model metrics"
  on ml_model_metrics for select
  using (auth.uid() is not null);

comment on table ml_predictions is 'Tracks all ML predictions for continue learning feedback loop';
comment on table ml_model_metrics is 'Aggregated model performance metrics';
