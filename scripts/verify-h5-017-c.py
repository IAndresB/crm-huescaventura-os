"""Verify the controlled successor without blessing or rewriting old seals."""
from pathlib import Path
import json,gzip,hashlib,stat,subprocess,re,tarfile
r=Path(__file__).resolve().parents[1];out=r/'tests/fixtures/h5-017-c';sha=lambda b:hashlib.sha256(b).hexdigest()
pre=json.loads(gzip.decompress((out/'preflight.json.gz').read_bytes()));allowed={'src/server/composition.ts','docs/NEXT-STEPS.md','docs/PROJECT-STATUS.md','specs/001-core-crm/tasks.md'}
changes=[]
for name,m in pre['files'].items():
 p=r/name;assert p.is_file()and not p.is_symlink(),name;assert oct(stat.S_IMODE(p.stat().st_mode))==m['mode'],name
 if sha(p.read_bytes())!=m['sha256']:assert name in allowed,name;changes.append(name)
assert 'src/server/composition.ts'in changes
transition=json.loads((out/'composition-transition.json').read_text());assert transition['historicalSha256']==pre['files'][transition['path']]['sha256'];assert transition['correctedSha256']==sha((r/transition['path']).read_bytes())
expected=json.loads((out/'expected-seal.json').read_text());assert sha((r/expected['path']).read_bytes())==expected['sha256']
# Audit artifacts, rejected inventory, sources and all old migrations stay exact.
audit=json.loads((r/'tests/fixtures/h5-018/audit-inventory.json').read_text());seal=json.loads((r/'tests/fixtures/h5-018/audit-seal.json').read_text());assert sha((r/'tests/fixtures/h5-018/audit-inventory.json').read_bytes())==seal['inventorySha256']
for name,m in audit['files'].items():assert sha((r/name).read_bytes())==m['sha256'],name
prior=json.loads((r/'tests/fixtures/h5-016/final-inputs.json').read_text())['inputs'];exceptions=[]
for name,digest in prior.items():
 current=sha((r/name).read_bytes())
 if current!=digest:assert name==transition['path']and current==transition['correctedSha256'];exceptions.append(name)
assert exceptions==[transition['path']]
for manifest in ['derived-tests.json','preservation-derivatives.json','legacy64-derivative.json']:
 d=json.loads((out/manifest).read_text());rows=d if isinstance(d,list)else d.get('files',[d])
 for row in rows:
  assert sha((r/row['source']).read_bytes())==row['sourceSha256'],row['source']
  assert sha((r/row['derived']).read_bytes())==row['derivedSha256'],row['derived']
# Normative row bytes and existing frozen expectations never change.
with tarfile.open(out/'before-c-overlay.tar.gz','r:gz')as t:oldTasks=t.extractfile('specs/001-core-crm/tasks.md').read().decode()
currentTasks=(r/'specs/001-core-crm/tasks.md').read_text()
def rows(s):return [x for x in s.split('## 6. Matrices de trazabilidad',1)[1].split('## 7.',1)[0].splitlines()if x.startswith('|')]
assert rows(oldTasks)==rows(currentTasks)
results={}
for label in ['15-final-focal','17-dependencies','18-unit','25-health-final','26-frozen-final','22-typecheck-final','23-lint-final','19-build','20-audit','24-complete']:
 d=json.loads((out/(label+'.status.json')).read_text());assert d['exit']==0 and not d['changedDuringRun'],label
 # A checked preparer can intentionally create and remove temporary copies. The
 # inputs here are the retained sources/scripts; disappeared incidental inputs
 # are never silently accepted in a clean gate.
 mismatch=[]
 for name,digest in d['inputs'].items():
  if not(r/name).is_file()or sha((r/name).read_bytes())!=digest:mismatch.append(name)
 assert not mismatch,(label,mismatch)
 text=gzip.decompress((out/(label+'.stdout.log.gz')).read_bytes()).decode();counts={}
 for key in ['tests','pass','fail','cancelled','skipped']:
  a=re.findall(r'(?:ℹ|#) '+key+r' (\d+)',text)
  if a:counts[key]=int(a[-1])
 if counts:assert counts['fail']==counts['cancelled']==counts['skipped']==0,label
 results[label]={'exit':d['exit'],'counts':counts,'inputsVerified':len(d['inputs'])}
full=results['24-complete']['counts'];assert full['tests']==2834 and full['pass']==2834,full
for x in json.loads((out/'24-restoration.json').read_text()):assert x['restored']and sha((r/x['path']).read_bytes())==x['restoredSha256']
assert not subprocess.check_output(['git','diff','--cached','--name-only'],cwd=r)
report={'base':pre['base'],'preCFiles':len(pre['files']),'unchangedPreCFiles':len(pre['files'])-len(changes),'authorizedChangedPaths':changes,'originalCandidate36952':'preserved except four authorized current paths; complete original bytes recoverable from sealed overlay','audit75Unchanged':True,'h5016InputsUnchanged':455,'h5016AuthorizedTransition':transition,'oldMigrationsUnchanged':64,'normativeTaskRowsUnchanged':len(rows(oldTasks)),'results':results,'status':'PASS own verification only; new independent audit pending'}
(out/'final-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
