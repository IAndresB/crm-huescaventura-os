-- Operational hosted migration, independent of the H0-H6 migration chain.
-- Apply ONLY to CRM technical Staging wrcrhbdbydkchxxlcacb through Supabase MCP.
-- The migration service supplies the outer transaction.
DO $preflight$
BEGIN
  IF current_database() <> 'postgres'
     OR current_setting('cron.timezone', true) NOT IN ('GMT', 'UTC')
     OR current_setting('cron.launch_active_jobs', true) IS DISTINCT FROM 'on'
     OR current_setting('cron.log_run', true) IS DISTINCT FROM 'on'
     OR NOT EXISTS (SELECT 1 FROM pg_catalog.pg_namespace WHERE nspname = 'crm_private')
  THEN
    RAISE EXCEPTION 'CRM_HEALTH_PLATFORM_PRECONDITION_FAILED';
  END IF;
END
$preflight$;

CREATE EXTENSION pg_cron WITH SCHEMA pg_catalog;
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;
-- This newly installed administrative module is not a public API.
REVOKE ALL ON SCHEMA cron FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cron FROM PUBLIC, anon, authenticated;

CREATE ROLE crm_supabase_health NOLOGIN NOINHERIT NOSUPERUSER
  NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
GRANT crm_supabase_health TO postgres WITH INHERIT FALSE, SET TRUE;

SELECT cron.schedule(
  'crm-huescaventura-os-daily-health',
  '17 3 * * *', -- 03:17 UTC; preflight requires UTC-equivalent Cron timezone.
  $job$
-- Bounded native technical history only; never touches CRM data.
-- Commit retention first so a subsequent failed check does not undo it.
BEGIN;
SET LOCAL statement_timeout = '5s';
SET LOCAL lock_timeout = '1s';
DELETE FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job
               WHERE jobname = 'crm-huescaventura-os-daily-health')
  AND runid IN (
    SELECT runid FROM cron.job_run_details
    WHERE jobid = (SELECT jobid FROM cron.job
                   WHERE jobname = 'crm-huescaventura-os-daily-health')
    ORDER BY runid DESC OFFSET 30
  );
COMMIT;

BEGIN READ ONLY;
SET LOCAL ROLE crm_supabase_health;
SET LOCAL search_path = pg_catalog;
SET LOCAL statement_timeout = '5s';
SET LOCAL lock_timeout = '1s';
SET LOCAL TIME ZONE 'UTC';
DO $health$
DECLARE
  started timestamptz := clock_timestamp();
BEGIN
  IF current_database() <> 'postgres'
     OR current_user <> 'crm_supabase_health'
     OR current_setting('transaction_read_only') <> 'on'
     OR pg_is_in_recovery()
     OR EXISTS (SELECT 1 FROM pg_roles
                WHERE rolname = current_user AND (rolsuper OR rolbypassrls))
  THEN
    RAISE EXCEPTION 'CRM_HEALTH_CHECK_FAILED';
  END IF;
  PERFORM 1 FROM pg_database
  WHERE datname = current_database() AND datallowconn;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'CRM_HEALTH_DATABASE_UNAVAILABLE';
  END IF;
  RAISE LOG 'crm-huescaventura-os health ok project=wrcrhbdbydkchxxlcacb database=% role=% readonly=on elapsed_ms=%',
    current_database(), current_user,
    extract(epoch FROM clock_timestamp() - started) * 1000;
END
$health$;
COMMIT;
  $job$
);
