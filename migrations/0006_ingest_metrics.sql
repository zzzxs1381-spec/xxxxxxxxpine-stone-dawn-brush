create table if not exists xf_ingest_events (
  id text primary key,
  user_id text not null,
  agent_id text,
  outcome text not null,
  status_code integer not null,
  platform text,
  classification text,
  probe_latency_ms integer,
  handle_ms integer,
  payload_bytes integer,
  diagnostic_id text,
  ipv4_ok boolean,
  ipv6_ok boolean,
  https_ok boolean,
  udp_ok boolean,
  tls_ok boolean,
  dns_ok boolean,
  created_at timestamptz not null default now()
);
create index if not exists xf_ingest_events_user_created_idx on xf_ingest_events (user_id, created_at desc);
create index if not exists xf_ingest_events_user_outcome_idx on xf_ingest_events (user_id, outcome);
