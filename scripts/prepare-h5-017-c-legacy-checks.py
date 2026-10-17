from pathlib import Path
import json,hashlib
r=Path(__file__).resolve().parents[1];folder=r/'tests/fixtures/h5-017-c';manifest=json.loads((folder/'preservation-derivatives.json').read_text());rows=manifest['files'];digest=lambda b:hashlib.sha256(b).hexdigest()
# The historic preservation counterexamples run under a successor guard with the
# exact composition transition. Their original assertions and source stay frozen.
p=r/'tests/fixtures/h5-006/f12/chain-counterexamples.mjs';b=p.read_bytes();needle=b"../../../support/h5-006-dependency-preservation.ts";assert b.count(needle)==1
chain=r/'tests/support/h5-017-c-chain-counterexamples.mjs';chain.write_bytes(b.replace(needle,b'./h5-017-c-dependency-preservation.ts'))
chainMeta={'source':str(p.relative_to(r)),'sourceSha256':digest(b),'derived':str(chain.relative_to(r)),'derivedSha256':digest(chain.read_bytes()),'change':'successor preservation guard import; assertions unchanged'}
for name,old,new in [
 ('postgres-h5-004-migration.test.ts',"for(const file of prior)assert.equal(await readFile(file,'utf8'),git(['show',base+':'+file]),file);","for(const file of prior){const current=await readFile(file,'utf8'),historical=git(['show',base+':'+file]);if(file==='src/server/composition.ts')assertCProductBytes(file,Buffer.from(current),Buffer.from(historical));else assert.equal(current,historical,file);}"),
 ('postgres-h5-006-migration.test.ts',"for(const f of protectedFiles)assert.equal(await readFile(f,'utf8'),git('show',base+':'+f),f);","for(const f of protectedFiles){const current=await readFile(f,'utf8'),historical=git('show',base+':'+f);if(f==='src/server/composition.ts')assertCProductBytes(f,Buffer.from(current),Buffer.from(historical));else assert.equal(current,historical,f);}"),
 ('postgres-h5-008-migration.test.ts',"for(const file of baseline)assert.equal(await readFile(file,'utf8'),git('show','ff109036e3bb08a1d61e948693bc622bb10f240e:'+file),file);","for(const file of baseline){const current=await readFile(file,'utf8'),historical=git('show','ff109036e3bb08a1d61e948693bc622bb10f240e:'+file);if(file==='src/server/composition.ts')assertCProductBytes(file,Buffer.from(current),Buffer.from(historical));else assert.equal(current,historical,file);}"),
]:
 p=r/'tests/integration'/name;b=p.read_text();assert b.count(old)==1
 s="import {assertHistoricalBytes as assertCProductBytes} from '../support/h5-017-c-dependency-preservation.ts';\n"+b.replace(old,new)
 if name=='postgres-h5-008-migration.test.ts':s=s.replace('tests/fixtures/h5-006/f12/chain-counterexamples.mjs','tests/support/h5-017-c-chain-counterexamples.mjs')
 q=p.with_name('h5017c-preservation-'+p.name);q.write_text(s);rows.append({'source':str(p.relative_to(r)),'sourceSha256':digest(b.encode()),'derived':str(q.relative_to(r)),'derivedSha256':digest(s.encode()),'change':'only composition byte equality uses exact authorized transition; all other comparisons unchanged; H5-008 counterexamples use identified successor guard'})
manifest['files']=rows;manifest['chainSuccessor']=chainMeta;(folder/'preservation-derivatives.json').write_text(json.dumps(manifest,indent=2)+'\n');print('total preservation successor suites',len(rows))
