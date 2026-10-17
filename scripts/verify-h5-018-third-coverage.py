"""Audit prior coverage from captured executions, source identity and disjoint sets."""
from pathlib import Path
import json,gzip,re,hashlib,collections
R=Path(__file__).resolve().parents[1];D=R/'tests/fixtures/h5-017-d';O=R/'tests/fixtures/h5-018-third';sha=lambda b:hashlib.sha256(b).hexdigest()
def j(p):return json.loads(p.read_text())
def raw(p):return gzip.decompress(p.read_bytes()).decode()
phases=j(D/'20-phases.json');selected=j(D/'20-selection.json')['selected'];old=j(D/'20-complete.status.json');recent=j(D/'22-final-affected.status.json');declared=j(D/'complete-coverage.json');reuse=j(D/'scope-reuse-analysis.json')
assert len(selected)==len(set(selected))==175
phasefiles=[n for p in phases['phases']for n in p['files']];assert len(phasefiles)==len(set(phasefiles))and set(phasefiles)==set(selected)
oldcases=[];embedded=[]
for number,p in enumerate(phases['phases'],1):
 log=raw(D/p['stdout']);counts={k:int(re.findall(r'(?:ℹ|#) '+k+r' (\d+)',log)[-1])for k in ['tests','pass','fail','cancelled','skipped']};assert counts==p['counts']and p['exit']==0
 assert counts['tests']==counts['pass']and counts['fail']==counts['cancelled']==counts['skipped']==0
 cases=re.findall(r'^\s*✔ (.*) \([0-9.]+ms\)$',log,re.M)
 if len(cases)!=counts['tests']:
  # Historical child output is deliberately printed by this single parent test.
  assert p['files']==['postgres-h2-008-defects.test.ts']and counts['tests']==1
  assert cases[-1]=='H2-008 F01/F02 original15dbf11 reproduces normative FAIL without weakening expected'
  assert cases[-1] in(R/'tests/integration'/p['files'][0]).read_text()
  embedded.append({'phase':number,'childResultLinesExcluded':len(cases)-1,'outerCase':cases[-1]});cases=cases[-1:]
 for ordinal,name in enumerate(cases,1):oldcases.append({'id':f'20/{number:02d}/{ordinal:04d}','name':name,'phaseFiles':p['files'],'stdout':p['stdout']})
assert len(oldcases)==2847
recentcases=re.findall(r'^\s*✔ (.*) \([0-9.]+ms\)$',raw(D/'22-final-affected.stdout.log.gz'),re.M);assert len(recentcases)==207 and recent['exit']==0
oldcounter=collections.Counter(c['name']for c in oldcases);newcounter=collections.Counter(recentcases);overlap=oldcounter&newcounter
assert sum(overlap.values())==206
assert list((newcounter-oldcounter).elements())==['D10 operation UUID alias must not substitute the actual execution subject in historical recovery']
remaining=overlap.copy();kept=[];replaced=[]
for c in oldcases:
 if remaining[c['name']]>0:remaining[c['name']]-=1;replaced.append(c)
 else:kept.append(c)
assert len(kept)==2641
affected=recent['command'][recent['command'].index('scripts/test-postgres.mjs')+1:];unaffected=reuse['unaffectedFiles']
assert len(affected)==len(set(affected))==20 and len(unaffected)==len(set(unaffected))==156 and not set(affected)&set(unaffected)
assert set(selected)==set(unaffected)|(set(affected)-{'postgres-h5-017-d-reference-alias.test.ts'})
assert set(affected)==set(declared['currentAffected']['files'])and set(unaffected)==set(declared['unaffectedReused']['files'])
copied=json.loads(gzip.decompress((D/'20-copied-inputs.json.gz').read_bytes()))['files']
for name in unaffected:
 path='tests/integration/'+name;assert sha((R/path).read_bytes())==copied[path]['sha256']==old['inputs'][path],path
# Independently derive local import closure; import edges do not prove dynamic SQL
# ceilings, which are separately enumerated. Full new execution supersedes reuse.
def closure(paths):
 seen=set();todo=list(paths)
 while todo:
  p=todo.pop()
  if p in seen:continue
  seen.add(p);s=(R/p).read_text()
  for m in re.finditer(r'(?:from\s*|import\s*\(|import\s*)[\'\"](\.[^\'\"]+)[\'\"]',s):
   q=(R/p).parent/m[1];q=q.resolve()
   if q.is_file()and q.is_relative_to(R):todo.append(str(q.relative_to(R)))
 return sorted(seen)
deps=closure(['tests/integration/'+n for n in unaffected]);loaders=[]
for path in deps:
 assert path in copied and sha((R/path).read_bytes())==copied[path]['sha256'],path
 if path in old['inputs']:assert copied[path]['sha256']==old['inputs'][path],path
 s=(R/path).read_text()
 assert '20261016192425_h5_diagnostic_temporal_trace.sql'not in s and 'h5-diagnostic-d-isolated'not in s,path
 if 'readdir' in s and 'migration' in s:loaders.append(path)
for path,meta in copied.items():
 if path.startswith(('src/','supabase/migrations/'))and not path.endswith('20261016192425_h5_diagnostic_temporal_trace.sql'):
  assert sha((R/path).read_bytes())==meta['sha256'],path
for path,h in recent['inputs'].items():
 if path.startswith(('src/','supabase/migrations/','tests/support/','tests/integration/')):assert sha((R/path).read_bytes())==h,path
newcases=[{'id':f'22/{i:04d}','name':n,'selectedFiles':affected,'stdout':'22-final-affected.stdout.log.gz'}for i,n in enumerate(recentcases,1)]
caseinventory={'prior':oldcases,'superseded':replaced,'reused':kept,'finalAffected':newcases,'uniqueConsolidatedCount':len(kept)+len(newcases),'identity':'execution/phase/ordinal plus exact title and selected source set; repeated titles are not globally unique','embeddedHistoricalRunsExcluded':embedded}
b=(json.dumps(caseinventory,sort_keys=True,indent=2)+'\n').encode();(O/'prior-case-inventory.json.gz').write_bytes(gzip.compress(b,mtime=0))
report={'priorFull':2847,'supersededAffected':206,'finalAffected':207,'reused':2641,'consolidated':2848,'priorFiles':175,'currentFiles':176,'unaffectedFiles':unaffected,'affectedFiles':affected,'uniqueFilesNoOverlap':True,'actualCountsReconstructed':True,'caseInventorySha256':sha(b),'localDependencyClosure':deps,'dynamicMigrationLoaders':loaders,'closureInputsIdentical':True,'onlyChangedProductInput':'migration66','originalOutcomeReuse':'internally consistent partition and source hashes; dynamic loader ceilings are not inferred solely from imports','newAuditPolicy':'rerun the complete176-file selection on final66; no predecessor outcome is credited as a current execution','embeddedHistoricalRunsExcluded':embedded}
(O/'prior-coverage-review.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items()if k not in ['localDependencyClosure','dynamicMigrationLoaders','unaffectedFiles','affectedFiles']}))
