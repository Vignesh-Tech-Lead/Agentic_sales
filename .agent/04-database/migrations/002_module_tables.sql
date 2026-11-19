-- Additive split of the legacy workspace_records table into one physical table
-- per application module. The original table is retained as a point-in-time
-- pre-cutover snapshot, not dual-written after cutover. Each module table has
-- a constrained envelope; module payload
-- fields remain JSONB until typed module-specific migrations are applied.
DO $$
DECLARE
  module_key text;
  table_key text;
BEGIN
  FOREACH module_key IN ARRAY ARRAY[
    'identity','identityRoles','leads','forms','companies','knowledge','agents',
    'executions','email','campaigns','inbox','willingness','funnel','tasks',
    'workflows','proposals','predictive','forecasting','recovery','calendar',
    'whatsapp','meeting-intel','referrals','multilingual','reports','admin','audit'
  ] LOOP
    table_key := 'module_' || replace(lower(module_key), '-', '_');
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS public.%I (
        id text NOT NULL,
        tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
        data jsonb NOT NULL CHECK (jsonb_typeof(data) = ''object'' AND data->>''id'' = id),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (tenant_id, id)
      )', table_key);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (tenant_id, (data->>''status''))', left(table_key || '_tenant_status_idx', 60), table_key);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (tenant_id, updated_at DESC)', left(table_key || '_tenant_updated_idx', 60), table_key);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_key);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', table_key);
    EXECUTE format('CREATE POLICY demo_tenant_all ON public.%I FOR ALL TO anon USING (tenant_id = ''00000000-0000-0000-0000-000000000001''::uuid) WITH CHECK (tenant_id = ''00000000-0000-0000-0000-000000000001''::uuid)', table_key);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon', table_key);
    EXECUTE format(
      'INSERT INTO public.%I (id, tenant_id, data, created_at, updated_at)
       SELECT id, tenant_id, data, created_at, updated_at
       FROM public.workspace_records WHERE module = $1
       ON CONFLICT (tenant_id, id) DO NOTHING', table_key
    ) USING module_key;
  END LOOP;
END
$$;
