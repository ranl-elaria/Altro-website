-- Per-step CMO notes + per-channel brand template mapping.

alter table marketing_campaigns
  add column if not exists step_notes jsonb default '{}'::jsonb,
  add column if not exists brand_template_map jsonb default '{}'::jsonb;

comment on column marketing_campaigns.step_notes is 'CMO refinement notes per step: { "<STEP>": "free text" }';
comment on column marketing_campaigns.brand_template_map is 'Per-channel Canva brand template assignment: { "meta": "tpl_id", "linkedin": "tpl_id", ... }';
