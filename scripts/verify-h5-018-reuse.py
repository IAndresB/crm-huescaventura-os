"""Check applicability of historical execution evidence without rerunning it."""
from pathlib import Path
import hashlib,json,gzip,re
r=Path(__file__).resolve().parents[1];prior=r/'tests/fixtures/h5-017';out=r/'tests/fixtures/h5-018'
def digest(b):return hashlib.sha256(b).hexdigest()
report={}
for name in ['36-postgres-complete-final','27-regression-on64-final','32-frozen-install-final']:
 manifest=json.loads((prior/(name+'.inputs.json')).read_text());status=json.loads((prior/(name+'.status.json')).read_text());assert status['exit']==0 and not status['changedDuringRun']
 compared=0;recovered=[]
 for path,expected in manifest.items():
  p=r/path
  if p.exists() and digest(p.read_bytes())==expected:compared+=1;continue
  if path=='scripts/verify-h5-017-candidate.py':
   originals=[p for p in prior.glob('verifier-predecessor-*.py.gz') if digest(gzip.decompress(p.read_bytes()))==expected];assert originals,(name,path);recovered.append({'path':path,'kind':'preparatory-integrity-tool-not-product','source':str(originals[0].relative_to(r)),'sha256':expected});continue
  assert path.startswith('tests/integration/h5017-regression-'),(name,path)
  source=path.replace('h5017-regression-','');text=(r/source).read_text();harness={'postgres-h4-024.test.ts':'h4-reality-isolated.ts','postgres-h5-008.test.ts':'h5-work-isolated.ts','postgres-h5-009.test.ts':'h5-boundary-isolated.ts','postgres-h5-016-audit.test.ts':'h5-joint-closure-isolated.ts'}[Path(source).name]
  changed=text.replace('../support/'+harness,'../support/h5-diagnostic-regression-isolated.ts',1);assert digest(changed.encode())==expected;recovered.append({'path':path,'kind':'identical-assertions-harness-substitution','source':source,'sha256':expected})
 log=gzip.decompress((prior/(name+'.stdout.log.gz')).read_bytes()).decode();counts={}
 for key in ['tests','pass','fail','cancelled','skipped']:
  matches=re.findall(r'(?:ℹ|#) '+key+r' (\d+)',log)
  if matches:counts[key]=int(matches[-1])
 report[name]={'statusExit':status['exit'],'inputs':len(manifest),'exactCurrentInputs':compared,'recoveredOnly':recovered,'counts':counts,'stdoutSha256':digest(log.encode()),'applicability':'same frozen product and historical test inputs; new audit scenarios are additional, not covered by this run'}
# Source and temporary copy hashes independently recorded in the 104-case stream.
stream=gzip.decompress((prior/'27-regression-on64-final.stdout.log.gz').read_bytes()).decode();copies=[]
for line in stream.splitlines():
 if line.startswith('{"source":'):
  x=json.loads(line);source=(r/'tests/integration'/x['source']).read_bytes();assert digest(source)==x['sourceSha256'];copies.append(x)
assert len(copies)==4;report['temporaryCopiesRecorded']=copies
(out/'historical-reuse.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:{a:b for a,b in v.items() if a in ['inputs','exactCurrentInputs','counts']} for k,v in report.items() if isinstance(v,dict)},indent=2))
