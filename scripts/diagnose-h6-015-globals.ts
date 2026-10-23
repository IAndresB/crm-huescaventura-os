import {mkdtemp,writeFile,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {cluster,pgArgs,bin,hash} from '../tests/support/h6-015-runtime.ts';
process.umask(0o077);
const root=await mkdtemp('/tmp/h6015-diag-'),src=process.argv[2];
if(!src?.startsWith('/tmp/h6015-'))throw new Error('SYNTHETIC_ONLY');
const c=await cluster(root,'globals','h6015_diagnostic',59790),evidence:any={privateRoot:root,source:src,sourceSHA256:hash(await readFile(src))};
try{
 const p=spawnSync(join(bin,'psql'),['-X',...pgArgs(c),'--dbname=postgres','--set=ON_ERROR_STOP=1','--set=VERBOSITY=verbose','--single-transaction','--file='+src],{encoding:'utf8',env:{PATH:process.env.PATH,LC_ALL:'C',NODE_ENV:'test'}});
 const err=p.stderr??'';evidence.status=p.status;evidence.sqlstate=err.match(/ERROR:\s+([A-Z0-9]{5}):/)?.[1]??null;evidence.line=Number(err.match(/\.sql:(\d+):/)?.[1]??0);evidence.sourceLocation=err.match(/LOCATION:\s+(\w+),\s+(\w+\.c):(\d+)/)?.slice(1)??null;
 // Explicit whitelisted classifications; never expose original server text.
 evidence.classification=err.includes('permission denied to grant role')?'ROLE_GRANT_PERMISSION':err.includes('must have admin option')?'GRANTOR_NO_ADMIN_OPTION':err.includes('grantor must be current user')?'GRANTOR_NOT_CURRENT_USER':err.includes('does not exist')?'OBJECT_ABSENT':err.includes('already exists')?'OBJECT_EXISTS':err.includes('parameter')?'PARAMETER_ERROR':'UNCLASSIFIED';
}catch(e){evidence.error='DIAGNOSTIC_INSTRUMENT_ERROR';}finally{await c.close();await writeFile('tests/fixtures/h6-015-execution/globals-diagnostic-'+Date.now()+'.json',JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence));}
