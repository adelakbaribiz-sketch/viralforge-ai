-- =============================================================================
-- PostgreSQL Row-Level Security (RLS) for ViralForge AI
-- =============================================================================
-- Defense-in-depth: enforces organization isolation at the DB level, in
-- addition to Prisma middleware (packages/db/src/index.ts) and API auth.
--
-- Enable RLS on every tenant-scoped table. The API worker connects as a
-- role that has a `current_setting('app.organization_id')` set per
-- transaction; policies compare against that setting.
-- =============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_usage ENABLE ROW LEVEL SECURITY;

-- Example policy for projects (apply similar to all tenant-scoped tables):
CREATE POLICY tenant_isolation_projects
  ON projects
  USING (organization_id = current_setting('app.organization_id', true)::text);

CREATE POLICY tenant_isolation_assets
  ON assets
  USING (organization_id = current_setting('app.organization_id', true)::text);

CREATE POLICY tenant_isolation_render_jobs
  ON render_jobs
  USING (organization_id = current_setting('app.organization_id', true)::text);

CREATE POLICY tenant_isolation_credit_ledger
  ON credit_ledger
  USING (organization_id = current_setting('app.organization_id', true)::text);

-- Stripe events table is NOT tenant-scoped (one global table for idempotency).
-- The webhook handler runs as a service role with RLS bypass.
