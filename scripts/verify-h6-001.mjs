// Read-only local custody checks. No database, network or Git mutations.
import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve,join} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const base='971c55d5ce5770c71284d106d3c0deecca9514b5';
const dir='tests/fixtures/h6-001';
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=p=>readFile(join(root,p));
const json=async p=>JSON.parse(await read(p));
const git=(...args)=>execFileSync('git',args,{cwd:root});
const checks=[];
const check=(id,ok,detail)=>{checks.push({id,status:ok?'PASS':'FAIL',detail});};
check('base-and-index',git('rev-parse','HEAD').toString().trim()===base&&git('diff','--cached','--name-only').length===0,'Detached local candidate; no staged paths');
const expected=await json(dir+'/expected-freeze.json');
check('independent-expected',sha(await read(expected.path))===expected.sha256,expected);
const inherited=(await json(dir+'/inherited-inputs.json')).files;
for(const f of inherited)check('inherited:'+f.path,sha(await read(f.path))===f.sha256,'Exact accepted local antecedent; not new H6-001 product');
const oldStatus='- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.';
const newStatus='- [ ] **Ejecución: IN PROGRESS local/aislado. Evidencia: ejecución y auditoría H6-001; aceptación pendiente del director.** Hito: H6. Tipo: comprobación.';
const strip=s=>s.replace(/\n<!-- H6001-LOCAL-STATUS-BEGIN -->[\s\S]*?<!-- H6001-LOCAL-STATUS-END -->\n/,'').replace(newStatus,oldStatus);
for(const f of await json(dir+'/normative-lock.json')){
 const bytes=await read(f.path),value=f.path.endsWith('/tasks.md')?Buffer.from(strip(bytes.toString())):bytes;
 check('normative:'+f.path,sha(value)===f.sha256,'Only explicit H6-001 status annotation may differ in Tasks; normative body must match');
}
for(const p of ['docs/PROJECT-STATUS.md','docs/NEXT-STEPS.md'])check('historical-body:'+p,strip((await read(p)).toString())===git('show',base+':'+p).toString(),'Prepend current status; keep historical body byte-identical');
const baseline=git('ls-tree','-r','--name-only',base,'src','supabase/migrations').toString().trim().split('\n');
const actual=[];
async function walk(p){for(const n of await readdir(join(root,p))){const x=p+'/'+n;if((await stat(join(root,x))).isDirectory())await walk(x);else actual.push(x);}}
await walk('src');await walk('supabase/migrations');
for(const p of new Set([...baseline,...actual])){
 const f=inherited.find(f=>f.path===p),expectedHash=f?.sha256??sha(git('show',base+':'+p));
 check('product:'+p,actual.includes(p)&&sha(await read(p))===expectedHash,f?'Declared inherited input':'Base immutable');
}
const attempts=[];
for(const name of (await readdir(join(root,dir))).filter(x=>x.startsWith('focal-')).sort()){
 const path=dir+'/'+name,run=await json(path+'/run.json'),inputs=await json(path+'/inputs.json');
 for(const stream of ['stdout','stderr'])check(name+':'+stream,sha(await read(path+'/'+stream+'.log'))===run[stream+'SHA256'],'Preserved original execution output');
 for(const file of ['tests/integration/postgres-h6-001.test.ts','scripts/run-h6-001.mjs'])check(name+':source:'+file,sha(await read(path+'/source/'+file.split('/').pop()))===inputs.files.find(x=>x.path===file)?.sha256,'Exact source at run, including failed attempts');
 attempts.push({path,status:run.status,exitCode:run.exitCode,summary:run.summary});
}
const successful=attempts.filter(x=>x.status==='PASS');
check('focal-pass-present',successful.length>0,successful);
if(successful.length){const last=successful.at(-1),inputs=await json(last.path+'/inputs.json');for(const p of ['tests/integration/postgres-h6-001.test.ts','scripts/run-h6-001.mjs'])check('current-focal:'+p,sha(await read(p))===inputs.files.find(x=>x.path===p).sha256,'Current executable equals PASS candidate');}
const custody=await json(dir+'/custody-initial/audit-delivery-v1.json');
for(const f of custody.files)check('custody-copy:'+f.path,sha(await read(dir+'/custody-initial/'+f.path))===f.sha256,'Independent initial custody bytes preserved');
const formal='8ec91602a3bf813cf01ffbc6b2ac1a2862fe10d0';
check('H6015-formal-snapshot',sha(git('show',formal+':tests/fixtures/h6-015-formal-closure/delivery-manifest-v1.json'))==='991d14013efd0f2527dea48bdc50dd426747a6089d15fc54745eac8140b15ada','Read archived snapshot only; no restore or runtime re-entry');
if(process.argv.includes('--delivery')){
 const m=await json(dir+'/delivery-manifest-v1.json'),seal=await json(dir+'/delivery-seal-v1.json');
 check('delivery-seal',sha(await read(dir+'/delivery-manifest-v1.json'))===seal.manifestSHA256,'Envelope excludes its own bytes and seal');
 for(const f of m.files)check('delivery:'+f.path,sha(await read(f.path))===f.sha256&&(await stat(join(root,f.path))).size===f.bytes,f.classification);
}
const failures=checks.filter(x=>x.status==='FAIL');
console.log(JSON.stringify({at:new Date().toISOString(),base,scope:'local synthetic H6-001 only; no acceptance decision',status:failures.length?'FAIL':'PASS',checks:checks.length,failures,attempts,migrations:actual.filter(x=>x.startsWith('supabase/migrations/')).length,inherited:inherited.length,network:false,database:false,mutations:false},null,2));
process.exitCode=failures.length?1:0;
