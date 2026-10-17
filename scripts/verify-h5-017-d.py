"""Read-only checks of all predecessors; new D report is append-only until sealed."""
from pathlib import Path
import json,gzip,hashlib,stat,subprocess,tarfile,re
r=Path(__file__).resolve().parents[1];out=r/'tests/fixtures/h5-017-d';sha=lambda b:hashlib.sha256(b).hexdigest();pre=json.loads(gzip.decompress((out/'preflight.json.gz').read_bytes()));allowed={'docs/NEXT-STEPS.md','docs/PROJECT-STATUS.md','specs/001-core-crm/tasks.md'};modified=[];modes={}
with tarfile.open(out/'before-d-overlay.tar.gz')as archive:
 for n,m in pre['files'].items():
  p=r/n;s=p.lstat();assert stat.S_ISREG(s.st_mode)and not p.is_symlink(),n;assert oct(stat.S_IMODE(s.st_mode))==m['mode'],n;b=p.read_bytes();h=sha(b);modes[n]=h
  if h!=m['sha256']:
   assert n in allowed,n;old=archive.extractfile(n).read();assert sha(old)==m['sha256'];assert b.split(b'\n',1)[0]==old.split(b'\n',1)[0]and b.endswith(old.split(b'\n',1)[1]),n;modified.append(n)
 # All641 normative table rows and the complete old Tasks body stay exact.
 old=archive.extractfile('specs/001-core-crm/tasks.md').read().decode();current=(r/'specs/001-core-crm/tasks.md').read_text()
 def rows(s):return[l for l in s.split('## 6. Matrices de trazabilidad',1)[1].split('## 7.',1)[0].splitlines()if l.startswith('|')]
 assert rows(old)==rows(current)and len(rows(current))==641
assert len(pre['files'])==37229 and len(modified)==3
for p in ['src/server/composition.ts','supabase/migrations/20261016142812_h5_protected_diagnostics.sql','supabase/migrations/20261016174248_h5_diagnostic_context_reference_fix.sql']:assert modes[p]==pre['files'][p]['sha256']
assert modes['src/server/composition.ts']=='31d18d77cbbbe85d1e9ece965c6cdf098802fd114795095315d08f586716bd1d'
expected=json.loads((out/'expected-seal.json').read_text());assert sha((r/expected['path']).read_bytes())==expected['sha256']
for row in json.loads((out/'derived-tests.json').read_text()):assert sha((r/row['source']).read_bytes())==row['sourceSha256']and sha((r/row['derived']).read_bytes())==row['derivedSha256']
# Old C and both auditors' evidence/expected/seals are protected by the full pre-D map.
for n in ['tests/fixtures/h5-017-c/candidate-seal.json','tests/fixtures/h5-018/audit-seal.json','tests/fixtures/h5-018-second/audit-seal.json']:assert modes[n]==pre['files'][n]['sha256']
prior=json.loads((r/'tests/fixtures/h5-016/final-inputs.json').read_text())['inputs'];assert sum(modes[n]==h for n,h in prior.items())==455
assert list(n for n,h in prior.items()if modes[n]!=h)==['src/server/composition.ts']
# Recover only identified old versions of our own instruments, never product/tests of predecessors.
recovered={}
for p in out.glob('*-before-*.gz'):
 b=gzip.decompress(p.read_bytes());recovered[sha(b)]=str(p.relative_to(r))
results={}
for p in sorted(out.glob('*.status.json')):
 d=json.loads(p.read_text());dif=[]
 for n,h in d.get('inputs',{}).items():
  actual=sha((r/n).read_bytes())
  if actual!=h:
   assert h in recovered,(p.name,n);assert n in ['tests/integration/postgres-h5-017-d-temporal.test.ts','tests/integration/postgres-h5-017-d-migration.test.ts','scripts/test-h5-017-d-complete.mjs','scripts/verify-h5-017-d.py','supabase/migrations/20261016192425_h5_diagnostic_temporal_trace.sql'],(p.name,n);dif.append({'path':n,'recordedSha256':h,'recoveredFrom':recovered[h]})
 assert not d.get('changedDuringRun'),p.name
 b=gzip.decompress(p.with_name(p.name.replace('.status.json','.stdout.log.gz')).read_bytes());counts={k:int(v[-1])for k in ['tests','pass','fail','cancelled','skipped']if(v:=re.findall(r'(?:ℹ|#) '+k+r' (\d+)',b.decode(errors='replace')))}
 results[p.name]={'exit':d['exit'],'counts':counts,'inputsVerified':len(d.get('inputs',{})),'historicalOwnInputsRecovered':dif}
gates=json.loads((out/'accepted-gates.json').read_text())
for label in gates['labels']:
 d=results[label+'.status.json'];assert d['exit']==0,label
 if d['counts']:assert d['counts']['fail']==d['counts']['cancelled']==d['counts']['skipped']==0,label
full=gates['full']
assert results[full+'-complete.status.json']['counts']['pass']==2847
coverage=json.loads((out/'complete-coverage.json').read_text());assert coverage['uniqueTests']==coverage['pass']==2848 and coverage['fail']==0 and coverage['disjointFiles'];assert coverage['currentAffectedExit']==0
assert results['10-unit.status.json']['counts']['pass']==208
assert results['01-original-reproducer.status.json']['counts']=={'tests':2,'pass':1,'fail':1,'cancelled':0,'skipped':0}
types=json.loads((out/'type-only-transition.json').read_text());assert types['runtimeEquivalent']and types['beforeExecutableSha256']==types['afterExecutableSha256'];assert sha((r/types['path']).read_bytes())==types['afterSha256']
replica=json.loads((out/(full+'-replica-preservation.json')).read_text());assert replica['workspaceProtectedOutputsNeverOverwritten']and replica['replicaRemoved']and replica['exit']==0
copy=json.loads(gzip.decompress((out/(full+'-copied-inputs.json.gz')).read_bytes()));assert copy['allBytesVerified'];selection=json.loads((out/(full+'-selection.json')).read_text());assert len(selection['selected'])==len(set(selection['selected']))==175
for n in selection['selected']:
 path='tests/integration/'+n;h=sha((r/path).read_bytes());assert h==copy['files'][path]['sha256']or(path==types['path']and copy['files'][path]['sha256']==types['beforeSha256'])
assert selection['originalReproducerSha256']==modes['tests/integration/postgres-h5-018-second-correlation.test.ts']
assert subprocess.check_output(['git','rev-parse','HEAD']).decode().strip()==pre['base'];assert subprocess.check_output(['git','rev-parse','main']).decode().strip()==pre['base'];assert subprocess.check_output(['git','rev-parse','origin/main']).decode().strip()==pre['base'];assert subprocess.check_output(['git','rev-list','--left-right','--count','main...origin/main']).decode().strip()=='0\t0';assert not subprocess.check_output(['git','diff','--cached','--name-only']);assert subprocess.run(['git','diff','--check'],capture_output=True).returncode==0
names=set(subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z']).decode().strip('\0').split('\0'));assert not set(pre['files'])-names;new=sorted(names-set(pre['files'])-{'tests/fixtures/h5-017-d/delta-inventory.json','tests/fixtures/h5-017-d/corrected-overlay.tar.gz','tests/fixtures/h5-017-d/candidate-inventory.json.gz','tests/fixtures/h5-017-d/candidate-seal.json'})
for n in new:assert n.startswith('tests/fixtures/h5-017-d/')or n.startswith('tests/integration/postgres-h5-017-d-')or n.startswith('tests/integration/h5017d-dependency-')or n.startswith('tests/support/h5-diagnostic-d-')or n in ['scripts/capture-h5-017-d.py','scripts/test-h5-017-d-complete.mjs','scripts/verify-h5-017-d.py']or re.match(r'specs/001-core-crm/(?:expected|evidence|matrix|defects)-TSK-H5-017-D\.md$',n)or n=='supabase/migrations/20261016192425_h5_diagnostic_temporal_trace.sql',n
report={'base':pre['base'],'preDFiles':37229,'unchangedPreDFiles':37229-len(modified),'modifiedMetadataOnly':sorted(modified),'deleted':0,'newDAtVerification':len(new),'newDPaths':new,'plannedNewDIncludingSelfMetadata':len(new)+4,'protectedSecondAuditFilesUnchanged':62,'protectedFirstAuditFilesUnchanged':75,'all65MigrationsUnchanged':True,'h5016Identical':455,'h5016ExactCompositionCTransitionRetained':True,'normativeTableRowsIdentical':641,'results':results,'completeSelectionFiles':175,'completePostgres':2848,'completeMethod':coverage,'completeRuntimeEquivalenceJustified':types,'replica':replica,'materialOpen':[],'result':'PASS internal D only; third independent audit pending','indexEmpty':True,'published':False,'next':'STOP'}
encoded=json.dumps(report,indent=2)+'\n';p=out/'final-verification.json'
if(out/'candidate-seal.json').exists():assert p.read_text()==encoded,'sealed verification would change'
else:p.write_text(encoded)
print(json.dumps({k:v for k,v in report.items()if k not in ['newDPaths','results','completeRuntimeEquivalenceJustified','replica']},indent=2))
