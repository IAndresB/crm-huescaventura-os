// Complete current candidate once, with identified successors of frozen tests.
// Original tests and their protected expected/evidence are never edited.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const folder='tests/fixtures/h5-017-c/',tag=process.argv[2];if(!tag||!/^[a-z0-9-]+$/.test(tag))throw new Error('C_COMPLETE_TAG_REQUIRED');
const baseline=JSON.parse(gunzipSync(await readFile(folder+'preflight.json.gz')));
const paths=['tests/fixtures/h2-011/reproducer-F01-corrected.log','tests/fixtures/h2-011/reproducer-F02-corrected.log','tests/fixtures/h4-012-f16/preservation.json','supabase/.temp/cli-latest'];
const hash=x=>createHash('sha256').update(x).digest('hex'),saved=new Map();
for(const path of paths){const bytes=await readFile(path);if(hash(bytes)!==baseline.files[path].sha256)throw new Error('C_HISTORICAL_OUTPUT_CHANGED:'+path);saved.set(path,bytes);}
const replacements={
 'postgres-h5-017.test.ts':'postgres-h5-017-c-017.test.ts',
 'postgres-h5-017-security.test.ts':'postgres-h5-017-c-regression-security.test.ts',
 'postgres-h5-018-audit.test.ts':'postgres-h5-017-c-independent-audit.test.ts',
 'postgres-h5-018-causes.test.ts':'postgres-h5-017-c-independent-causes.test.ts',
 'postgres-h5-018-migration.test.ts':'postgres-h5-017-c-legacy64-migration.test.ts',
};
const preservation=JSON.parse(await readFile(folder+'preservation-derivatives.json','utf8'));
for(const x of preservation.files)replacements[x.source.split('/').at(-1)]=x.derived.split('/').at(-1);
const all=(await readdir('tests/integration')).filter(x=>x.endsWith('.test.ts')).sort();
for(const successor of Object.values(replacements))if(!all.includes(successor))throw new Error('C_SUCCESSOR_MISSING');
if(all.some(x=>x.startsWith('h5017c-dependency-')))throw new Error('C_TEMPORARY_TESTS_REMAIN');
const selected=all.filter(x=>!(x in replacements));await writeFile(folder+tag+'-selection.json',JSON.stringify({replacements,selected,reason:'same original assertions on65; legacy64 migration census remains64; no duplicate originals'},null,2)+'\n',{flag:'wx'});
const captures=[];let code=1;
try{const child=spawn(process.execPath,['scripts/test-postgres.mjs',...selected],{stdio:'inherit',env:process.env});[code]=await once(child,'exit');}
finally{for(const[path,bytes]of saved){const generated=await readFile(path);if(hash(generated)!==hash(bytes)){const capture=folder+tag+'-generated-'+path.replaceAll('/','_')+'.gz';await writeFile(capture,gzipSync(generated),{flag:'wx'});await writeFile(path,bytes);captures.push({path,capture,generatedSha256:hash(generated),restoredSha256:hash(bytes),restored:(await readFile(path)).equals(bytes)});}}await writeFile(folder+tag+'-restoration.json',JSON.stringify(captures,null,2)+'\n',{flag:'wx'});console.log('C preserved regenerated historical outputs',JSON.stringify(captures));}
process.exitCode=code??1;
