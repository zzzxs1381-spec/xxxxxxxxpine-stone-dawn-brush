create table if not exists xf_tunnel_sessions (
  id text primary key,
  user_id text not null,
  device_id text,
  stage text not null,
  transport text,
  sni text,
  endpoint text,
  handshake_ms integer,
  rx_bytes bigint not null default 0,
  tx_bytes bigint not null default 0,
  last_error text,
  internet_ok boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists xf_tunnel_sessions_user_idx on xf_tunnel_sessions (user_id, updated_at desc);
