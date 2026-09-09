create table if not exists xf_profiles (
  user_id text primary key,
  display_name text,
  plan_code text not null default 'none',
  subscription_status text not null default 'NONE',
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  telemetry_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists xf_devices (
  id text primary key,
  user_id text not null,
  label text not null,
  platform text not null,
  status text not null default 'REGISTERED',
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists xf_devices_user_id_idx on xf_devices (user_id);

create table if not exists xf_diagnostics (
  id text primary key,
  user_id text not null,
  network_type text,
  online boolean,
  ipv4_ok boolean,
  ipv6_ok boolean,
  https_ok boolean,
  udp_hint text,
  latency_ms integer,
  classification text not null,
  evidence jsonb not null default '[]'::jsonb,
  fingerprint_bucket text,
  created_at timestamptz not null default now()
);
create index if not exists xf_diagnostics_user_id_idx on xf_diagnostics (user_id, created_at desc);

create table if not exists xf_tickets (
  id text primary key,
  user_id text not null,
  subject text not null,
  body text not null,
  status text not null default 'OPEN',
  created_at timestamptz not null default now()
);
create index if not exists xf_tickets_user_id_idx on xf_tickets (user_id);

create table if not exists xf_aima_notes (
  id text primary key,
  user_id text not null,
  source_diagnostic_id text,
  summary text not null,
  created_at timestamptz not null default now()
);
create index if not exists xf_aima_notes_user_id_idx on xf_aima_notes (user_id);
