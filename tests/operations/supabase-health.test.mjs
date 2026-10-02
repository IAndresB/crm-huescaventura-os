// Isolated verification of the exact job SQL, not a mock of the hosted scheduler.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('health SQL bounds only its own logs, denies writes and fails closed', () => {
  const bin = process.env.POSTGRES_H0_BIN;
  assert.ok(bin, 'POSTGRES_H0_BIN_REQUIRED');
  const root = mkdtempSync(join(tmpdir(), 'crm-health-'));
  const socket = join(root, 'socket');
  mkdirSync(socket);
  const run = (name, args, input) => spawnSync(join(bin, name), args, {
    input, encoding: 'utf8', env: process.env,
  });
  const checked = (result) => {
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  const sql = (query) => run('psql', ['-X', '-h', socket, '-p', '55491', '-U',
    'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'], query);
  let started = false;
  try {
    checked(run('initdb', ['-D', join(root, 'data'), '--username=postgres',
      '--auth-local=trust', '--no-locale', '--encoding=UTF8']));
    checked(run('pg_ctl', ['-D', join(root, 'data'), '-l', join(root, 'postgres.log'),
      '-o', `-k '${socket}' -h '' -p 55491`, '-w', 'start']));
    started = true;
    const migration = readFileSync(new URL(
      '../../supabase/operations/20261002225221_crm_supabase_daily_health.sql', import.meta.url), 'utf8');
    const command = migration.match(/\$job\$([\s\S]*?)\$job\$/)[1];
    // Fixture only: no extension emulation or CRM functional entities.
    checked(sql(`
      CREATE ROLE crm_supabase_health NOLOGIN NOINHERIT NOSUPERUSER
        NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
      CREATE SCHEMA cron;
      CREATE TABLE cron.job (jobid bigint PRIMARY KEY, jobname text UNIQUE);
      CREATE TABLE cron.job_run_details (jobid bigint, runid bigint PRIMARY KEY);
      INSERT INTO cron.job VALUES (1, 'crm-huescaventura-os-daily-health'), (2, 'unrelated');
      INSERT INTO cron.job_run_details SELECT 1, n FROM generate_series(1,40) n;
      INSERT INTO cron.job_run_details SELECT 2, n FROM generate_series(101,140) n;
    `));
    checked(sql(command));
    assert.equal(checked(sql('SELECT count(*) FROM cron.job_run_details WHERE jobid=1;')), '30');
    assert.equal(checked(sql('SELECT min(runid) FROM cron.job_run_details WHERE jobid=1;')), '11');
    assert.equal(checked(sql('SELECT count(*) FROM cron.job_run_details WHERE jobid=2;')), '40');
    checked(sql(command)); // Idempotent; no new fixture rows.
    assert.equal(checked(sql('SELECT count(*) FROM cron.job_run_details;')), '70');
    const wrongRole = sql(command.slice(command.indexOf('BEGIN READ ONLY;'))
      .replace('SET LOCAL ROLE crm_supabase_health;', ''));
    assert.notEqual(wrongRole.status, 0);
    assert.match(wrongRole.stderr, /CRM_HEALTH_CHECK_FAILED/);
    const write = sql('BEGIN READ ONLY; DELETE FROM cron.job_run_details; COMMIT;');
    assert.notEqual(write.status, 0);
    assert.match(write.stderr, /read-only transaction/);
    const denied = sql('BEGIN; SET LOCAL ROLE crm_supabase_health; SELECT 1 FROM cron.job; ROLLBACK;');
    assert.notEqual(denied.status, 0);
    assert.match(denied.stderr, /permission denied for schema cron/);
    assert.equal(checked(sql('SELECT count(*) FROM cron.job_run_details;')), '70');
  } finally {
    if (started) checked(run('pg_ctl', ['-D', join(root, 'data'), '-m', 'fast', '-w', 'stop']));
    rmSync(root, { recursive: true, force: true });
  }
});
