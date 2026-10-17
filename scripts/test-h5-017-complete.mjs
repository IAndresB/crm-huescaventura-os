// Official complete runner with lossless preservation of the three known legacy
// fixture outputs that historical verifiers regenerate unconditionally.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const root='tests/fixtures/h5-017/';
const baseline=JSON.parse(gunzipSync(await readFile(root+'preflight.json.gz')));
const paths=['tests/fixtures/h2-011/reproducer-F01-corrected.log','tests/fixtures/h2-011/reproducer-F02-corrected.log','tests/fixtures/h4-012-f16/preservation.json','supabase/.temp/cli-latest'];
const hash=x=>createHash('sha256').update(x).digest('hex'),originals=new Map();
for(const p of paths){const data=await readFile(p);if(hash(data)!==baseline.files[p].sha256)throw new Error('H5017_NONBASE_OUTPUT_AT_START:'+p);originals.set(p,data);}
let code=1;const records=[];
try{const child=spawn(process.execPath,['scripts/test-postgres.mjs'],{stdio:'inherit',env:process.env});[code]=await once(child,'exit');}
finally{
 for(const[p,original]of originals){const generated=await readFile(p);if(hash(generated)!==hash(original)){
  const path=root+'36-generated-'+p.replaceAll('/','_')+'.gz';await writeFile(path,gzipSync(generated),{flag:'wx'});await writeFile(p,original);
  records.push({path:p,capture:path,generatedSha256:hash(generated),originalSha256:hash(original),restored:(await readFile(p)).equals(original)});
 }}
 await writeFile(root+'36-historical-output-restoration.json',JSON.stringify(records,null,2)+'\n',{flag:'wx'});console.log('H5017 restored legacy outputs',JSON.stringify(records));
}
process.exitCode=code??1;
