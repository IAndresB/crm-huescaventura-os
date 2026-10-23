import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url)),out=root+'tests/fixtures/h6-bootstrap-independent/';
const code='/Users/andres/.codex/worktrees/h6-bootstrap-variant/crm-huescaventura-os/tests/support/';
const sha=b=>createHash('sha256').update(b).digest('hex');process.umask(0o077);
const expected={version:1,expected:['DO rejects OID10 wrong logical name with SQLSTATE42501','DO rejects expected name present under nonbootstrap OID with SQLSTATE42501','globals preflight rejects additional nonbuilt-in role before import','globals preflight rejects source/destination bootstrap mismatch','correct OID10 and name satisfy one preexisting CREATE without omitting remaining ALTER/GRANT','no unsupported catalog mutation, only initdb and CREATE ROLE']};
await writeFile(out+'preconditions-expected-v1.json',JSON.stringify(expected,null,2)+'\n',{flag:'wx',mode:0o600});
const {bootstrapGlobals,globalsSnapshot,restoreBootstrapGlobals}=await import(code+'h6-bootstrap-variant.ts');
const {cluster}=await import(code+'h6-015-runtime.ts');
const privateRoot=await mkdtemp('/tmp/h6ba-preconditions-'),clusters=[],report={utc:new Date().toISOString(),expectedSHA256:sha(await readFile(out+'preconditions-expected-v1.json')),testedHelperSHA256:sha(await readFile(code+'h6-bootstrap-variant.ts')),privateRoot,checks:[],failures:[]};
const check=(name,ok)=>{assert.ok(ok,name);report.checks.push({name,status:'PASS'});};
const raw='-- independent synthetic globals\nCREATE ROLE h2_bootstrap;\nALTER ROLE h2_bootstrap WITH SUPERUSER;\nCREATE ROLE imported_sentinel;\n';
const sql=bootstrapGlobals(raw,'h2_bootstrap').derived,assertion=sql.match(/DO \$h6015_bootstrap\$[\s\S]*?END \$h6015_bootstrap\$;/)[0];
const file=privateRoot+'/globals.sql';await writeFile(file,raw,{mode:0o600,flag:'wx'});
try{
 const wrong=await cluster(privateRoot,'wrong','audit_bootstrap',59954);clusters.push(wrong);const db=wrong.connect('postgres');let e;
 try{await db.unsafe(assertion);}catch(x){e=x;}check('wrong_bootstrap_name_sql42501',e?.code==='42501');
 await db.unsafe('CREATE ROLE h2_bootstrap SUPERUSER');const row=(await db`select oid::text from pg_roles where rolname='h2_bootstrap'`)[0];check('same_name_has_nonbootstrap_oid',row.oid!=='10');e=undefined;
 try{await db.unsafe(assertion);}catch(x){e=x;}check('nonbootstrap_oid_sql42501',e?.code==='42501');
 const correct=await cluster(privateRoot,'correct','h2_bootstrap',59955);clusters.push(correct);const admin=correct.connect('postgres'),baseline=await globalsSnapshot(admin);
 await admin.unsafe(assertion);check('correct_oid10_name_assertion_passes',true);
 await admin.unsafe('CREATE ROLE preexisting_extra');e=undefined;
 try{await restoreBootstrapGlobals(correct,file,baseline,privateRoot,'extra');}catch(x){e=x;}check('extra_preexisting_role_rejected',!!e&&e.code==='ERR_ASSERTION');
 check('rejected_before_remaining_globals',Number((await admin`select count(*) from pg_roles where rolname='imported_sentinel'`)[0].count)===0);
 e=undefined;try{await restoreBootstrapGlobals(wrong,file,baseline,privateRoot,'wrong');}catch(x){e=x;}check('bootstrap_identity_preflight_rejected',e?.code==='ERR_ASSERTION');
 check('wrong_identity_no_globals_import',Number((await db`select count(*) from pg_roles where rolname='imported_sentinel'`)[0].count)===0);
 report.state='PASS_REAL_PRECONDITION_NEGATIVES';
}catch(e){report.state='FAIL_PRESERVED';report.failures.push({name:e.name,code:e.code??null});}
finally{for(const c of clusters.reverse())await c.close();report.resourcesStopped=true;const destination=out+'preconditions-result-v1.json';await writeFile(destination,JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});console.log(JSON.stringify({state:report.state,checks:report.checks.length,report:destination,privateRoot}));}
