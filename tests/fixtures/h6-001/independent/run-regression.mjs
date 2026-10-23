import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const audit='/tmp/h6-001-audit',root=join(audit,'replica'),out=join(audit,'regression-01');
await mkdir(out);
const sha=b=>createHash('sha256').update(b).digest('hex');
const expected='/tmp/h6-001-independent-expected.md',expectedSHA='ecaf8a7ffc942493c5d7fc7606f0c15a6af8d85aba766e1117d0cb901d544eb2';
if(sha(await readFile(expected))!==expectedSHA)throw Error('EXPECTED_CHANGED');
const prior=JSON.parse(await readFile(join(root,'tests/fixtures/h5-017-f/25-selection.json')));
const selected=[...prior.selected,'postgres-h5-018-fifth-sequences.test.ts','postgres-h5-018-fifth-migration.test.ts','postgres-h5-018-fifth-chronology.test.ts','postgres-h5-017-g-temporal.test.ts'];
if(selected.length!==196||new Set(selected).size!==196)throw Error('SELECTION_INVALID');
const isolated=selected.filter(n=>/postgres-h2-.*(?:-f0[0-9]|-defects)\.test\.ts$/.test(n)||n==='postgres-h2-011.test.ts'||n==='h5017c-preservation-postgres-h5-008-migration.test.ts'||n==='h5017d-dependency-postgres-h5-008.test.ts'||n==='postgres-h4-023-concurrency.test.ts');
const isolatedSet=new Set([...isolated,'postgres-h2-008.test.ts']);
const phases=[...isolated.map(n=>[n]),['postgres-h2-008.test.ts'],selected.filter(n=>!isolatedSet.has(n))];
await writeFile(join(out,'selection.json'),JSON.stringify({selected,phases,replacements:prior.replacements,hook:'tests/support/h5-017-g-hook.mjs',reason:'Exact accepted H5-019 complete196 selection repeated against inherited H6 product bytes; historical pinned migration boundaries retained; assertions unchanged',expectedSHA},null,2)+'\n');
const bin='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin';
const env={PATH:process.env.PATH,TMPDIR:join(audit,'runtime'),LANG:'C',LC_ALL:'C',POSTGRES_H0_BIN:bin,CI:'1',NODE_NO_WARNINGS:'1',NODE_OPTIONS:'--import='+pathToFileURL(join(root,'tests/support/h5-017-g-hook.mjs')).href};
const summaries=[],total={tests:0,pass:0,fail:0,cancelled:0,skipped:0};let failed=false;
for(let i=0;i<phases.length;i++){
 const args=['scripts/test-postgres.mjs',...phases[i]],started=new Date().toISOString();
 const child=spawn(process.execPath,args,{cwd:root,env,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';
 child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
 const[code,signal]=await once(child,'exit');
 const prefix='phase-'+String(i+1).padStart(2,'0');
 await writeFile(join(out,prefix+'.stdout.log.gz'),gzipSync(stdout));await writeFile(join(out,prefix+'.stderr.log.gz'),gzipSync(stderr));
 const counts={};for(const k of Object.keys(total)){const a=[...stdout.matchAll(new RegExp('(?:ℹ|#) '+k+' (\\d+)','g'))];counts[k]=a.length?Number(a.at(-1)[1]):null;if(counts[k]!==null)total[k]+=counts[k];}
 const run={index:i+1,files:phases[i],command:[process.execPath,...args],started,finished:new Date().toISOString(),code,signal,counts,stdoutSHA:sha(stdout),stderrSHA:sha(stderr)};summaries.push(run);if(code!==0||Object.values(counts).includes(null))failed=true;
 await writeFile(join(out,'progress.json'),JSON.stringify({phases:summaries,total,failed},null,2)+'\n');
 console.log(JSON.stringify({phase:i+1,of:phases.length,code,counts,failed}));
}
const received=JSON.parse(await readFile(join(audit,'received-product.json'))),drift=[];
for(const f of received.functional){const actual=sha(await readFile(join(root,f.path)));if(actual!==f.sha256)drift.push({path:f.path,expected:f.sha256,actual});}
const report={completed:true,started:summaries[0].started,finished:new Date().toISOString(),base:received.base,node:process.version,postgres:spawnSync(join(bin,'postgres'),['--version'],{encoding:'utf8'}).stdout.trim(),expectedSHA,phases:summaries,total,functionalInputDrift:drift,status:failed||drift.length?'FAIL':'PASS',scope:'local isolated synthetic component regressions; no H6 E2E global claim'};
await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,total,functionalInputDrift:drift}));process.exitCode=report.status==='PASS'?0:1;
