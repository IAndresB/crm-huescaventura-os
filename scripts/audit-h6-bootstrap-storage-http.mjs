// Focused independent Storage denial classification; no application or original writes.
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,cp,readFile,writeFile,stat} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
const auditor='/Users/andres/.codex/worktrees/h6-bootstrap-audit/crm-huescaventura-os',exec='/Users/andres/.codex/worktrees/h6-bootstrap-variant/crm-huescaventura-os',out=auditor+'/tests/fixtures/h6-bootstrap-independent/';
process.umask(0o077);const sha=b=>createHash('sha256').update(b).digest('hex');
const expected={version:1,expected:['service_role reads same existing object with 200','valid signed unexpired authenticated JWT receives provider not_found 404 semantics, legacy HTTP400 permitted by storage-error.ts','same privileged object read still200 after denial','ordinary role policy checked separately from Auth identity proof; no claim of new Auth provider execution'],source:'Storage upstream5def1df codes.ts NoSuchKey and storage-error.ts userStatusCode'};
await writeFile(out+'storage-http-expected-v1.json',JSON.stringify(expected,null,2)+'\n',{flag:'wx',mode:0o600});
const {command,storageService,jwtSigner}=await import(exec+'/tests/support/h6-015-runtime.ts');
const postgres=createRequire(exec+'/package.json')('postgres');
const original='/tmp/h6boot-0o5cEb',run=JSON.parse(await readFile(exec+'/tests/fixtures/h6-bootstrap-variant/runs/2026-10-22T14-52-59-084Z/report.json','utf8'));
assert.equal(run.resourcesStopped,true);await assert.rejects(stat(run.resources.destStorage+'/data/postmaster.pid'));
const root=await mkdtemp('/tmp/h6ba-storage-http-');await cp(run.resources.destStorage+'/data',root+'/data',{recursive:true,errorOnExist:true,force:false});await cp(original+'/restored-objects',root+'/objects',{recursive:true,errorOnExist:true,force:false});await mkdir(root+'/socket',{mode:0o700});
const config=Object.fromEntries((await readFile(original+'/storage-source.env','utf8')).split('\n').filter(Boolean).map(x=>{const i=x.indexOf('=');return[x.slice(0,i),x.slice(i+1)];}));
const c={dir:root,socket:root+'/socket',port:59958,bootstrap:'postgres',maintenance:'postgres',connect:(database,user='postgres')=>postgres({host:root+'/socket',port:59958,database,user,max:1,prepare:false,onnotice:()=>{}})};
const report={utc:new Date().toISOString(),privateRoot:root,expectedSHA256:sha(await readFile(out+'storage-http-expected-v1.json')),checks:[],failures:[]};let service,db;
const check=(id,value,facts)=>{assert.ok(value,id);report.checks.push({id,status:'PASS',facts});};
try{
 command('pg_ctl',['-D',root+'/data','-l','/dev/null','-o',`-k '${root}/socket' -h '' -p 59958`,'-w','start']);
 db=c.connect('postgres');service=await storageService(c,config.AUTH_JWT_SECRET,59959,root+'/objects',config.AUTH_ENCRYPTION_KEY);await service.start();
 const object=(await db`select bucket_id,name from storage.objects order by name limit 1`)[0];assert.ok(object);
 const url=service.endpoint+'/object/authenticated/'+encodeURIComponent(object.bucket_id)+'/'+object.name.split('/').map(encodeURIComponent).join('/');
 const token=jwtSigner(config.AUTH_JWT_SECRET,'http://127.0.0.1:59712'),ordinary=token({role:'authenticated',sub:randomUUID()});
 const read=async jwt=>{const r=await fetch(url,{headers:{Authorization:'Bearer '+jwt},redirect:'error'});return{status:r.status,bytes:Buffer.from(await r.arrayBuffer())};};
 const a=await read(token({role:'service_role'}));check('same_object_positive_before',a.status===200,{http:a.status,bytes:a.bytes.length});
 const b=await read(ordinary),body=JSON.parse(b.bytes.toString());check('ordinary_storage_authority_not_transport_denial',[400,404].includes(b.status)&&String(body.statusCode)==='404'&&body.error==='not_found'&&body.message==='Object not found',{http:b.status,providerStatus:'404',providerError:'not_found'});
 const d=await read(token({role:'service_role'}));check('same_object_positive_after',d.status===200&&a.bytes.equals(d.bytes),{http:d.status,bytes:d.bytes.length});
 check('direct_postgresql_live',(await db`select 1 as live`)[0].live===1);report.state='PASS_FOCUSED_STORAGE_HTTP_AUTHORITY';
}catch(e){report.state='FAIL_PRESERVED';report.failures.push({name:e.name,code:e.code??null,message:/^[A-Za-z0-9_]+$/.test(e.message)?e.message:'INSTRUMENT_FAILURE'});}
finally{await service?.stop();await db?.end({timeout:1});command('pg_ctl',['-D',root+'/data','-m','fast','-w','stop']);report.resourcesStopped=true;const dest=out+'storage-http-result-v1.json';await writeFile(dest,JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});console.log(JSON.stringify({state:report.state,checks:report.checks.length,report:dest,privateRoot:root,failures:report.failures}));}
