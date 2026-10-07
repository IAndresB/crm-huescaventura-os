import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {isolatedReality,read,write} from '../support/h4-reality-isolated.ts';
import {H5001TaskAdapter} from '../../src/infrastructure/postgres/h5-task-adapter.ts';
import type {TaskCommand} from '../../src/infrastructure/postgres/h1-task-adapter.ts';

const file='supabase/migrations/20261007180001_h5_task_lifecycle.sql';
const task=():TaskCommand=>({action:'receive',operationId:uid(),taskId:uid(),expectedRevision:0,
 identity:{causeKind:'review',causeId:uid(),contextKind:'other',contextId:uid(),scopeRef:'synthetic-scope',
  relatedKind:null,relatedId:null,effect:'review-only'},
 material:{title:'Task previa a H5',deadline:{kind:'unknown',reason:'Sin fecha verificada'},
  priority:{kind:'pending',reason:'Sin prioridad verificada'},sourceRef:'synthetic-H1',sourceVersion:'1',
  triggerRef:'manual',triggerVersion:'1'},reason:'Necesidad anterior sintética'});

test('H5-R02 fresh 53 migrations installs extended Task with permissions',async()=>{
 const h=await isolatedReality('crm_h5002_fresh',58702);
 try{
  await h.migration.unsafe(await readFile(file,'utf8'));
  const row=(await h.observer`select relrowsecurity,relforcerowsecurity,
   pg_get_userbyid(relowner) owner from pg_class where oid='crm_private.b07_pending_tasks'::regclass`)[0]!;
  assert.equal(row.relrowsecurity,true);assert.equal(row.relforcerowsecurity,true);
  assert.equal(row.owner,'crm_h0_f2_owner');
  assert.equal((await h.observer`select count(*)::int n from information_schema.columns where table_schema='crm_private' and table_name='b07_pending_tasks' and column_name='last_closure'`)[0]!.n,1);
 }finally{await h.close();}
});

test('H5-R02 populated 52→53 upgrade, failed DDL rollback and retry preserve prior Task',async()=>{
 const h=await isolatedReality('crm_h5002_upgrade',58703);
 try{
  const p=task();await h.tasks.apply(await h.auth(),write,p);
  const before=(await h.observer`select to_jsonb(x) body from crm_private.b07_pending_tasks x where task_id=${p.taskId}::uuid`)[0]!.body;
  const priorHistory=(await h.observer`select to_jsonb(x) body from crm_private.b07_history x where subject_id=${p.taskId}::uuid`)[0]!.body;
  const functionBefore=(await h.observer`select oid,proowner,proacl,prosecdef,proconfig from pg_proc where oid='crm_api.b07_task_apply(bytea,bytea,bytea,bytea,bytea)'::regprocedure`)[0]!;
  const sql=await readFile(file,'utf8');
  await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0; commit;')));
  await h.migration.unsafe('rollback');
  assert.equal((await h.observer`select count(*)::int n from information_schema.columns where table_schema='crm_private' and table_name='b07_pending_tasks' and column_name='last_closure'`)[0]!.n,0);
  assert.deepEqual((await h.observer`select to_jsonb(x) body from crm_private.b07_pending_tasks x where task_id=${p.taskId}::uuid`)[0]!.body,before);
  await h.migration.unsafe(sql);
  const after=(await h.observer`select to_jsonb(x) body from crm_private.b07_pending_tasks x where task_id=${p.taskId}::uuid`)[0]!.body;
  assert.deepEqual(Object.fromEntries(Object.entries(after).filter(([key])=>key!=='last_closure')),before);
  assert.equal(after.last_closure,null);
  assert.deepEqual((await h.observer`select to_jsonb(x) body from crm_private.b07_history x where subject_id=${p.taskId}::uuid`)[0]!.body,priorHistory);
  const functionAfter=(await h.observer`select oid,proowner,proacl,prosecdef,proconfig from pg_proc where oid='crm_api.b07_task_apply(bytea,bytea,bytea,bytea,bytea)'::regprocedure`)[0]!;
  assert.deepEqual(functionAfter,functionBefore);
  const adapter=new H5001TaskAdapter(h.runtime,h.f1,h.f2);
  await adapter.transition(await h.auth(),write,{action:'complete',operationId:uid(),taskId:p.taskId,
   expectedRevision:1,reason:'Terminación sintética',result:'Revisado',references:['synthetic-prior-record']});
  assert.equal((await adapter.read(await h.auth(),read,p.taskId,'other',p.identity.contextId))?.state,'completed');
 }finally{await h.close();}
});

test('H5-R02 official Supabase advisors on fresh 53 isolated migrations',async()=>{
 const label='crm_h5002_advisors',port=58704,h=await isolatedReality(label,port);
 try{
  await h.migration.unsafe(await readFile(file,'utf8'));
  const args=['--yes','supabase@2.119.0','db','advisors','--db-url',
   `postgresql://crm_h0_migration@127.0.0.1:${port}/${label}?sslmode=disable`,
   '--type','all','--fail-on','error'];
  const result=spawnSync('npx',args,{encoding:'utf8',timeout:45000});
  if(process.env.H5002_CAPTURE_DIR){
   await writeFile(`${process.env.H5002_CAPTURE_DIR}/advisors.stdout.log`,result.stdout??'');
   await writeFile(`${process.env.H5002_CAPTURE_DIR}/advisors.stderr.log`,result.stderr??'');
   await writeFile(`${process.env.H5002_CAPTURE_DIR}/advisors.status.json`,JSON.stringify({status:result.status,
    signal:result.signal,error:result.error?.message??null},null,2)+'\n');
  }
  assert.equal(result.status,0,(result.stdout??'')+(result.stderr??''));
  assert.deepEqual(JSON.parse(result.stdout).results,[]);
 }finally{await h.close();}
});
