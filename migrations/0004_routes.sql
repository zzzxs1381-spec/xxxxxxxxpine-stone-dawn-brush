alter table xf_diagnostics add column if not exists route_json jsonb not null default '[]'::jsonb;
