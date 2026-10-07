// Read-only final evidence audit for the exclusively local H5-005/006 block.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root='tests/fixtures/h5-006/',git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim();
const report=JSON.parse(readFileSync(root+'verification.json','utf8'));
const expected=readFileSync('specs/001-core-crm/expected-TSK-H5-005-006.md');
assert.equal(expected.length,22889);assert.equal(createHash('sha256').update(expected).digest('hex'),'ff777aa0a490e0293f9a12a462fcbab389253edbd2925c1a1e2bdf2ac5f092a4');
assert.equal(report.base,'7eac0d27b6b74331868a14bbc4ca967f8d2f6bb9');assert.equal(report.expected,'b14396627cbadfc4a99dd3b158b47c3562d3f08f');
for(const name of ['focal','postgres','unit','health','frozen','typecheck','lint','build','audit','diff']){
 const status=JSON.parse(readFileSync(root+name+'-final.status.json','utf8'));assert.equal(status.sha,report.testedSha);assert.equal(status.exit,0,name);
}
for(const [name,n]of [['focal',report.newPostgres],['postgres',2370+report.newPostgres],['unit',150],['health',1]]){
 const text=readFileSync(root+name+'-final.log','utf8');for(const [key,value]of [['tests',n],['pass',n],['fail',0],['cancelled',0],['skipped',0]]){
 const matches=[...text.matchAll(new RegExp('ℹ '+key+' (\\d+)','g'))];assert.equal(Number(matches.at(-1)?.[1]),value,name+':'+key);
 }
}
const changed=git('diff','--name-only',report.testedSha,'HEAD').split('\n').filter(Boolean);
assert.ok(changed.every(p=>/^(docs\/|specs\/001-core-crm\/|tests\/fixtures\/h5-006\/)/.test(p)),changed.join('\n'));
const matrix=readFileSync('specs/001-core-crm/matrix-TSK-H5-006.md','utf8');
for(const line of expected.toString().split('\n').filter(x=>x.startsWith('| H5-C'))){const id=line.split('|')[1].trim();assert.ok(matrix.includes('| '+id+' |'));}
assert.equal(report.sourceRows.length,33);for(const id of report.sourceRows)assert.ok(matrix.includes('| '+id+' |'),id);
assert.ok(matrix.includes('DM-PENDING-005'));assert.equal(report.newUnit,4);assert.equal(report.migrations.before,54);assert.equal(report.migrations.after,55);
console.log(JSON.stringify({audit:'PASS',testedSha:report.testedSha,head:git('rev-parse','HEAD'),rows:33,cases:57,postgres:2370+report.newPostgres,unit:150,health:1,documentaryChanges:changed},null,2));
