-- Target normalized CRM schema (additive; not yet applied to production).
-- Requires Supabase Auth. Apply only after tenant claim/RLS policy design is wired
-- into the server API. Source records remain in public.workspace_records until cutover.

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  slug text NOT NULL UNIQUE CHECK (slug = lower(slug) AND slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tenant_memberships (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  record_number text NOT NULL,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  website text,
  industry text,
  country_code char(2),
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, record_number),
  CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$')
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  record_number text NOT NULL,
  company_id uuid,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  email extensions.citext,
  phone text,
  job_title text,
  consent_status text NOT NULL DEFAULT 'unknown'
    CHECK (consent_status IN ('unknown', 'pending', 'opted_in', 'opted_out', 'suppressed')),
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, record_number),
  FOREIGN KEY (tenant_id, company_id) REFERENCES public.companies(tenant_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  record_number text NOT NULL,
  contact_id uuid,
  company_id uuid,
  owner_id uuid,
  source text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'qualified', 'nurturing', 'converted', 'lost', 'disqualified')),
  requirement text,
  budget_amount numeric(15,2) CHECK (budget_amount IS NULL OR budget_amount >= 0),
  currency char(3) CHECK (currency IS NULL OR currency ~ '^[A-Z]{3}$'),
  qualified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, record_number),
  FOREIGN KEY (tenant_id, contact_id) REFERENCES public.contacts(tenant_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, company_id) REFERENCES public.companies(tenant_id, id) ON DELETE RESTRICT,
  CHECK ((budget_amount IS NULL) = (currency IS NULL))
);

CREATE TABLE IF NOT EXISTS public.pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  pipeline_id uuid NOT NULL,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  position integer NOT NULL CHECK (position >= 0),
  probability numeric(5,2) NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  is_won boolean NOT NULL DEFAULT false,
  is_lost boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, pipeline_id, id),
  UNIQUE (tenant_id, pipeline_id, position),
  UNIQUE (tenant_id, pipeline_id, name),
  FOREIGN KEY (tenant_id, pipeline_id) REFERENCES public.pipelines(tenant_id, id) ON DELETE CASCADE,
  CHECK (NOT (is_won AND is_lost))
);

CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  record_number text NOT NULL,
  lead_id uuid,
  company_id uuid,
  pipeline_id uuid NOT NULL,
  stage_id uuid NOT NULL,
  owner_id uuid,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  amount numeric(15,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  currency char(3) NOT NULL DEFAULT 'INR' CHECK (currency ~ '^[A-Z]{3}$'),
  probability numeric(5,2) NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  expected_close_date date,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, record_number),
  FOREIGN KEY (tenant_id, lead_id) REFERENCES public.leads(tenant_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, company_id) REFERENCES public.companies(tenant_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, pipeline_id) REFERENCES public.pipelines(tenant_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, pipeline_id, stage_id) REFERENCES public.pipeline_stages(tenant_id, pipeline_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  record_number text NOT NULL,
  title text NOT NULL CHECK (length(btrim(title)) > 0),
  description text,
  owner_id uuid,
  lead_id uuid,
  opportunity_id uuid,
  due_at timestamptz,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, record_number),
  FOREIGN KEY (tenant_id, lead_id) REFERENCES public.leads(tenant_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, opportunity_id) REFERENCES public.opportunities(tenant_id, id) ON DELETE RESTRICT,
  CHECK (lead_id IS NOT NULL OR opportunity_id IS NOT NULL OR owner_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.stage_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  opportunity_id uuid NOT NULL,
  from_stage_id uuid,
  to_stage_id uuid NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  changed_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, opportunity_id) REFERENCES public.opportunities(tenant_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, from_stage_id) REFERENCES public.pipeline_stages(tenant_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, to_stage_id) REFERENCES public.pipeline_stages(tenant_id, id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS companies_tenant_name_idx ON public.companies (tenant_id, name);
CREATE INDEX IF NOT EXISTS contacts_tenant_company_idx ON public.contacts (tenant_id, company_id);
CREATE INDEX IF NOT EXISTS contacts_tenant_email_idx ON public.contacts (tenant_id, email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS leads_tenant_status_created_idx ON public.leads (tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS leads_tenant_owner_status_idx ON public.leads (tenant_id, owner_id, status);
CREATE INDEX IF NOT EXISTS opportunities_tenant_stage_idx ON public.opportunities (tenant_id, pipeline_id, stage_id);
CREATE INDEX IF NOT EXISTS opportunities_tenant_close_date_idx ON public.opportunities (tenant_id, expected_close_date) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS tasks_tenant_owner_due_idx ON public.tasks (tenant_id, owner_id, due_at) WHERE status IN ('open', 'in_progress');
CREATE INDEX IF NOT EXISTS stage_transitions_opportunity_time_idx ON public.stage_transitions (tenant_id, opportunity_id, changed_at DESC);

-- Fail closed until the application supplies trusted tenant membership and
-- policies are added. Existing frontend access to workspace_records is unchanged.
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies FORCE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines FORCE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.stage_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_transitions FORCE ROW LEVEL SECURITY;
