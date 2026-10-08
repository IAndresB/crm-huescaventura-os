// Independent read-only final auditor, scoped strictly to H5-007/008.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim(),root='tests/fixtures/h5-008/definitive/';
const report=JSON.parse(readFileSync(root+'verification.json','utf8'));
const preclosure=process.argv.includes('--preclosure');
const frozen=readFileSync('specs/001-core-crm/expected-TSK-H5-007-008.md');
assert.equal(frozen.length,26621);assert.equal(createHash('sha256').update(frozen).digest('hex'),'39eb753f8a2fc57a33d827a7980640256fd16d96ec7f2b70a27bf49a6841c40d');
assert.equal(frozen.toString(),execFileSync('git',['show','ae7f3b02745f3011bf3b324f2a5b3420f22a0a79:specs/001-core-crm/expected-TSK-H5-007-008.md'],{encoding:'utf8'}));
assert.equal(report.expectedPublication,'ae7f3b02745f3011bf3b324f2a5b3420f22a0a79');assert.equal(report.status,preclosure?'READY_FOR_FINAL_AUDIT':'PASS');
assert.equal(report.newPostgres,54);assert.equal(report.newUnit,4);assert.deepEqual(report.migrations,{before:55,after:56});assert.equal(report.sourceRows.length,45);
for(const gate of ['frozen','typecheck','lint','unit','build','audit','historical','historical-negative','focal','postgres','health','diff']){
 const status=JSON.parse(readFileSync(root+gate+'-final.status.json','utf8'));assert.equal(status.sha,report.testedSha);assert.equal(status.exit,0,gate);
}
for(const [gate,count]of [['focal',54],['postgres',2462],['unit',154],['health',1]]){
 const log=gunzipSync(readFileSync(root+gate+'-final.log.gz')).toString();for(const [label,n]of [['tests',count],['pass',count],['fail',0],['cancelled',0],['skipped',0]]){const found=[...log.matchAll(new RegExp('ℹ '+label+' (\\d+)','g'))];assert.equal(Number(found.at(-1)?.[1]),n,gate+':'+label);}
}
const rows=frozen.toString().split('\n').filter(x=>/^\| W\d\d \|/.test(x));assert.equal(report.cases.length,56);
const matrix=readFileSync('specs/001-core-crm/matrix-TSK-H5-008.md','utf8');
for(const line of rows){const cols=line.split('|').map(x=>x.trim()),id=cols[1],observed=report.cases.find(x=>x.id===id);assert.ok(observed,id);assert.equal(observed.source,cols[3]);assert.equal(observed.expected,cols[4]);assert.equal(observed.status,preclosure&&id==='W55'?'PENDING':'PASS');assert.ok(observed.evidence.length);for(const p of observed.evidence)assert.ok(existsSync(p),p);assert.ok(matrix.includes('| '+id+' |'));}
const inventory=frozen.toString().split('\n').filter(x=>x.startsWith('| **')).map(x=>x.match(/\*\*(.*?)\*\*/)[1]);assert.deepEqual(report.sourceRows,inventory);
for(const id of report.sourceRows){assert.ok(matrix.includes(id),id);const trace=report.normativeCoverage.find(x=>x.id===id);assert.ok(trace?.cases.length,id);assert.ok(trace.cases.every(c=>report.cases.some(x=>x.id===c)),id);}
for(const item of JSON.parse(readFileSync(root+'generated-historical/archive.json','utf8'))){const raw=gunzipSync(readFileSync(root+'generated-historical/'+item.file+'.gz'));assert.equal(raw.length,item.generatedBytes);assert.equal(createHash('sha256').update(raw).digest('hex'),item.generatedSha256);assert.equal(createHash('sha256').update(readFileSync(item.file)).digest('hex'),item.baselineSha256);}
const delta=git('diff','--name-only',report.testedSha,'HEAD').split('\n').filter(Boolean);assert.ok(delta.every(p=>/^(docs\/|specs\/001-core-crm\/|tests\/fixtures\/h5-008\/)/.test(p)),delta.join('\n'));
const base='ff109036e3bb08a1d61e948693bc622bb10f240e';
for(const file of git('ls-tree','-r','--name-only',base,'src','scripts','tests/integration','tests/support','tests/operations','package.json','pnpm-lock.yaml').split('\n')){
 if(file==='tests/integration/postgres-h5-006-migration.test.ts')continue;
 assert.deepEqual(readFileSync(file),execFileSync('git',['show',base+':'+file]),file);
}
const guard='tests/integration/postgres-h5-006-migration.test.ts';assert.deepEqual(readFileSync(guard),execFileSync('git',['show','4da05b0f2e25ea13094e1ef06153a7aaed1d0aab:'+guard]));
execFileSync(process.execPath,['--experimental-strip-types','tests/fixtures/h5-006/f12/chain-counterexamples.mjs'],{stdio:'pipe'});
const tasks=readFileSync('specs/001-core-crm/tasks.md','utf8');for(const id of ['007','008']){const block=tasks.split('<a id="tsk-h5-'+id+'"></a>')[1].split('<a id=')[0];assert.ok(block.includes('Ejecución: '+(preclosure?'IN PROGRESS':'COMPLETED')));}
const baseTasks=execFileSync('git',['show',base+':specs/001-core-crm/tasks.md'],{encoding:'utf8'});assert.equal(tasks.slice(tasks.indexOf('<a id="tsk-h5-009">')),baseTasks.slice(baseTasks.indexOf('<a id="tsk-h5-009">')));
console.log(JSON.stringify({audit:'PASS',mode:preclosure?'preclosure':'final',testedSha:report.testedSha,head:git('rev-parse','HEAD'),rows:45,cases:56,postgres:2462,unit:154,health:1,migrations:56,documentaryDelta:delta},null,2));
