import {readFile,writeFile,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const sources=[['postgres-h4-024.test.ts','h4-reality-isolated.ts'],['postgres-h5-008.test.ts','h5-work-isolated.ts'],['postgres-h5-009.test.ts','h5-boundary-isolated.ts'],['postgres-h5-016-audit.test.ts','h5-joint-closure-isolated.ts']];
const generated=[];
try{
 for(const[name,harness]of sources){const original=await readFile('tests/integration/'+name,'utf8');let changed=original.replace(`from '../support/${harness}'`,`from '../support/h5-diagnostic-corrected-regression.ts'`);if(changed===original)changed=original.replace(`from "../support/${harness}"`,`from "../support/h5-diagnostic-corrected-regression.ts"`);if(changed===original)throw new Error('C_REGRESSION_HARNESS_MISSING');changed=changed.replace('../support/h5-006-dependency-preservation.ts','../support/h5-017-c-dependency-preservation.ts');const target='h5017c-dependency-'+name;await writeFile('tests/integration/'+target,changed,{flag:'wx'});generated.push(target);const sha=x=>createHash('sha256').update(x).digest('hex');console.log(JSON.stringify({source:name,sourceSha256:sha(original),derived:target,derivedSha256:sha(changed),change:'harness import only;65 migrations'}));}
 const p=spawn(process.execPath,['scripts/test-postgres.mjs',...generated,'postgres-h5-012-f02.test.ts','postgres-h5-012-coverage61.test.ts','postgres-h5-012-reference-chain.test.ts'],{stdio:'inherit',env:process.env});const[code]=await once(p,'exit');process.exitCode=code??1;
}finally{await Promise.all(generated.map(p=>unlink('tests/integration/'+p)));}
