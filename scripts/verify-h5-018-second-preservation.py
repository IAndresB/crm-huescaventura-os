"""Verify sealed candidate without changing any of its files or old evidence."""
from pathlib import Path
import json,gzip,hashlib,stat,subprocess,re
r=Path(__file__).resolve().parents[1];out=r/'tests/fixtures/h5-018-second';c=r/'tests/fixtures/h5-017-c';sha=lambda b:hashlib.sha256(b).hexdigest();raw=gzip.decompress((c/'candidate-inventory.json.gz').read_bytes());assert sha(raw)=='b44d4adadcb907340094b617ad8445c162daef4df21ae2d8b05c300b543e2602';candidate=json.loads(raw);cache={}
for n,m in candidate['files'].items():
 p=r/n;s=p.lstat();actual={'bytes':s.st_size,'mode':oct(stat.S_IMODE(s.st_mode)),'type':'file'if stat.S_ISREG(s.st_mode)else'other','sha256':sha(p.read_bytes())};assert actual==m,n;cache[n]=actual
seal=json.loads((c/'candidate-seal.json').read_bytes());assert sha((c/'candidate-inventory.json.gz').read_bytes())==seal['candidateInventoryGzipSha256'];assert sha((c/'delta-inventory.json').read_bytes())==seal['deltaInventorySha256'];assert sha((c/'corrected-overlay.tar.gz').read_bytes())==seal['correctedOverlaySha256']
# Seal bytes themselves were part of the independently checked audit identity.
assert seal['base']==subprocess.check_output(['git','rev-parse','HEAD']).decode().strip()
assert subprocess.check_output(['git','rev-parse','main']).decode().strip()==seal['base'];assert subprocess.check_output(['git','rev-parse','origin/main']).decode().strip()==seal['base'];assert subprocess.check_output(['git','rev-list','--left-right','--count','main...origin/main']).decode().strip()=='0\t0';assert not subprocess.check_output(['git','diff','--cached','--name-only'])
modified=set(subprocess.check_output(['git','diff','--name-only']).decode().splitlines());assert modified=={'src/server/composition.ts','docs/NEXT-STEPS.md','docs/PROJECT-STATUS.md','specs/001-core-crm/tasks.md'}
allNames=set(subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z']).decode().strip('\0').split('\0'));original=set(candidate['files'])|set(candidate['excludedSelfMetadata']);new=sorted(allNames-original-{'tests/fixtures/h5-018-second/audit-inventory.json','tests/fixtures/h5-018-second/audit-seal.json'})
for n in new:assert n.startswith('tests/fixtures/h5-018-second/')or n.startswith('tests/integration/postgres-h5-018-second-')or n.startswith('scripts/verify-h5-018-second-')or n=='scripts/capture-h5-018-second.py'or re.match(r'specs/001-core-crm/(?:expected|evidence|matrix|defects)-TSK-H5-018-second(?:-temporal-clarification)?\.md$',n),n
for p in ['normative.json','normative-clarification.json']:
 d=json.loads((out/p).read_text());n=d.get('expectedPath',d.get('path'));assert sha((r/n).read_bytes())==d.get('expectedSha256',d.get('sha256'))
prior=json.loads((r/'tests/fixtures/h5-016/final-inputs.json').read_text())['inputs'];diff=[n for n,h in prior.items()if cache[n]['sha256']!=h];assert diff==['src/server/composition.ts'];assert prior[diff[0]]=='fd86f3f2246ce0988eb0393f256b7d5b25024f9a7ff58791210225850d1fc879';assert cache[diff[0]]['sha256']=='31d18d77cbbbe85d1e9ece965c6cdf098802fd114795095315d08f586716bd1d'
results={}
for p in out.glob('*.status.json'):
 d=json.loads(p.read_text());assert not d['changedDuringRun'],p.name
 exceptions=[]
 for n,h in d['inputs'].items():
  actual=cache[n]['sha256']if n in cache else sha((r/n).read_bytes())
  if actual!=h:
   assert p.stem=='09-correlation.status'and n=='tests/integration/postgres-h5-018-second-correlation.test.ts',(p.name,n)
   assert sha(gzip.decompress((out/'09-instrument-before-socket-fix.ts.gz').read_bytes()))==h;exceptions.append(n)
 b=gzip.decompress(p.with_name(p.name.replace('.status.json','.stdout.log.gz')).read_bytes());counts={k:int(v[-1])for k in ['tests','pass','fail','cancelled','skipped']if(v:=re.findall(r'(?:ℹ|#) '+k+r' (\d+)',b.decode(errors='replace')))}
 results[p.name]={'exit':d['exit'],'counts':counts,'inputsVerified':len(d['inputs']),'instrumentSourceRecoveredOnly':exceptions}
for label in ['10-correlation-socket-fixed.status.json','11-correlation-repeat.status.json']:assert results[label]['counts']=={'tests':2,'pass':1,'fail':1,'cancelled':0,'skipped':0}
for label in ['02-originals-regression-migration.status.json','04-migration-independent.status.json','07-health.status.json','12-typecheck-final.status.json','13-lint-final.status.json']:assert results[label]['exit']==0
# Preserve the historical bases and independent audit entries, not only their names.
ai=json.loads((r/'tests/fixtures/h5-018/audit-inventory.json').read_text())
for n,m in ai['files'].items():assert all(cache[n][k]==v for k,v in m.items())
assert subprocess.run(['git','diff','--check'],cwd=r,capture_output=True).returncode==0
report={'candidateInventorySha256':sha(raw),'candidateInventoryFilesVerified':len(cache),'candidateFilesIncludingSelfMetadata':len(original),'candidateUnchanged':True,'base':seal['base'],'divergence':'0/0','indexEmpty':True,'newAuditPaths':new,'newAuditFilesAtVerification':len(new),'candidateTrackedModifiedPathsRemainExactly':sorted(modified),'h5016InputsUnchanged':455,'h5016AuthorizedTransition':diff,'historicalMigrations1to64Unchanged':True,'firstAudit75Preserved':True,'expectedFilesUnchanged':True,'results':results,'materialOpen':['H5-018-2-F01'],'auditResult':'FAIL','productModifiedByAuditor':False,'committed':False,'published':False,'next':'STOP; director authorization required'}
encoded=json.dumps(report,indent=2)+'\n'
if(out/'audit-seal.json').exists():assert(out/'final-preservation.json').read_text()==encoded,'sealed final verification changed'
else:(out/'final-preservation.json').write_text(encoded)
print(json.dumps({k:v for k,v in report.items()if k not in ['newAuditPaths','results']},indent=2))
