alter table xf_diagnostics add column if not exists device_id text;
alter table xf_diagnostics add column if not exists advice_json jsonb not null default '{}'::jsonb;
alter table xf_agent_tokens add column if not exists device_id text;
create index if not exists xf_diagnostics_device_id_idx on xf_diagnostics (device_id);
