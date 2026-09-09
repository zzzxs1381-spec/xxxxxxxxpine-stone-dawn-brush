alter table xf_diagnostics add column if not exists source text not null default 'BROWSER';
alter table xf_diagnostics add column if not exists agent_id text;
alter table xf_diagnostics add column if not exists platform text;

create table if not exists xf_agent_tokens (
  id text primary key,
  user_id text not null,
  token_hash text not null unique,
  token_prefix text not null,
  label text not null default 'probe',
  status text not null default 'ACTIVE',
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists xf_agent_tokens_user_id_idx on xf_agent_tokens (user_id);
create index if not exists xf_agent_tokens_hash_idx on xf_agent_tokens (token_hash);
