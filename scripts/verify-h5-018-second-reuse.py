"""Independent applicability review; only writes second-audit evidence."""
from pathlib import Path
import json,gzip,hashlib,re,difflib
r=Path(__file__).resolve().parents[1];c=r/'tests/fixtures/h5-017-c';out=r/'tests/fixtures/h5-018-second';sha=lambda b:hashlib.sha256(b).hexdigest()
def counts(b):
 s=b.decode(errors='replace');return {k:int(v[-1]) for k in ['tests','pass','fail','cancelled','skipped'] if (v:=re.findall(r'(?:ℹ|#) '+k+r' (\d+)',s))}
reuse={}
for label in ['24-complete','18-unit','17-dependencies','26-frozen-final','19-build','20-audit']:
 p=c/(label+'.status.json');d=json.loads(p.read_bytes());assert d['exit']==0 and not d['changedDuringRun'],label
 for n,h in d['inputs'].items():assert (r/n).is_file()and sha((r/n).read_bytes())==h,(label,n)
 b=gzip.decompress((c/(label+'.stdout.log.gz')).read_bytes());cnt=counts(b)
 if cnt:assert cnt['fail']==cnt['cancelled']==cnt['skipped']==0
 reuse[label]={'statusSha256':sha(p.read_bytes()),'command':d['command'],'inputsVerified':len(d['inputs']),'inputsExact':True,'counts':cnt,'stdoutContentSha256':sha(b),'exit':d['exit'],'scope':'sealed candidate inputs only; does not cover second-audit new tests'}
selection=json.loads((c/'24-selection.json').read_text());assert len(selection['selected'])==len(set(selection['selected']))==170
for old,new in selection['replacements'].items():assert old not in selection['selected'] and new in selection['selected']
for n in selection['selected']:assert 'tests/integration/'+n in json.loads((c/'24-complete.status.json').read_text())['inputs'],n
assert reuse['24-complete']['counts']=={'tests':2834,'pass':2834,'fail':0,'cancelled':0,'skipped':0}
assert reuse['18-unit']['counts']['pass']==208
# Source-independent assertions retained in successors; compare actual bytes.
derivatives=[]
for row in json.loads((c/'derived-tests.json').read_text()):
 a=(r/row['source']).read_bytes();b=(r/row['derived']).read_bytes();assert sha(a)==row['sourceSha256'] and sha(b)==row['derivedSha256'];
 needle=b'../support/h5-018-audit-isolated.ts' if b'../support/h5-018-audit-isolated.ts' in a else b'../support/h5-diagnostic-isolated.ts'
 assert a.count(needle)==1 and a.replace(needle,b'../support/h5-diagnostic-corrected-isolated.ts',1)==b
 derivatives.append({'source':row['source'],'derived':row['derived'],'assertionsUnchanged':True})
# Preserve and identify actual historical failures, not an implementer summary.
history={}
for folder,label in [('h5-017','16-postgres-complete'),('h5-018','01-independent'),('h5-018','05-causes'),('h5-018','04-migrations-corrected'),('h5-018','14-controls')]:
 p=r/'tests/fixtures'/folder/(label+'.stdout.log.gz');b=gzip.decompress(p.read_bytes());history[folder+'/'+label]={'counts':counts(b),'compressedSha256':sha(p.read_bytes())}
assert history['h5-017/16-postgres-complete']['counts']['fail']==25 and history['h5-017/16-postgres-complete']['counts']['pass']==2762
assert sum(history['h5-018/'+s]['counts']['pass'] for s in ['01-independent','05-causes','04-migrations-corrected','14-controls'])==29
assert sum(history['h5-018/'+s]['counts']['fail'] for s in ['01-independent','05-causes','04-migrations-corrected','14-controls'])==3
pres=json.loads((c/'preservation-derivatives.json').read_text());diffs=[]
for row in pres['files']+[pres['chainSuccessor']]:
 a=(r/row['source']).read_bytes();b=(r/row['derived']).read_bytes();assert sha(a)==row['sourceSha256'] and sha(b)==row['derivedSha256'];diffs.append({'source':row['source'],'derived':row['derived'],'diff':list(difflib.unified_diff(a.decode().splitlines(),b.decode().splitlines(),n=1))})
assert sha((r/pres['originalHelper']).read_bytes())==pres['originalSha256'];assert sha((r/pres['successorHelper']).read_bytes())==pres['successorSha256']
(out/'historical-reuse.json').write_text(json.dumps({'reused':reuse,'completeSelection':{'uniqueFiles':170,'substitutions':15,'selectionSha256':sha((c/'24-selection.json').read_bytes()),'overlapNotAdded':True},'originalAssertionsVerified':derivatives,'preservationDerivativesReviewed':diffs,'historicalFailures':history,'applicability':'PASS exact sealed inputs; broad historical PASS cannot cover new temporal counterexamples'},indent=2)+'\n')
print(json.dumps({k:{'counts':v['counts'],'inputsVerified':v['inputsVerified']} for k,v in reuse.items()},indent=2))
