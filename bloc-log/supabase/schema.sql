create table if not exists programs (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists user_meta (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_program_id text,
  last_trained_program_id text,
  current_week integer not null default 1,
  settings jsonb not null default '{}'::jsonb,
  custom_templates jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table programs enable row level security;
alter table user_meta enable row level security;

create policy "own_programs" on programs
  for all using (auth.uid() = user_id);

create policy "own_meta" on user_meta
  for all using (auth.uid() = user_id);
