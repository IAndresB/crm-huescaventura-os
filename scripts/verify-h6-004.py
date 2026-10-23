#!/usr/bin/env python3
"""Read-only verification of raw local runs, successors and protected preflight inputs."""
from pathlib import Path
import json,hashlib,re,subprocess,sys
R=Path(__file__).resolve().parent.parent
E=R/'tests/fixtures/h6-004'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
rel=lambda p:str(p.relative_to(R))
def counts(text):
 return {k:int(v) for k,v in re.findall(r'^ℹ (tests|pass|fail|cancelled|skipped) (\d+)$',text,re.M)}
def cases(p,mark):
 out={}
 for n,line in enumerate(p.read_text().splitlines(),1):
  if line.startswith('ℹ tests'):break
  m=re.match(r'^\s*'+mark+r' (.+) \([0-9.]+ms\)$',line)
  if m:out[m[1]]={'path':rel(p),'line':n,'sha256':sha(p),'name':m[1]}
 return out
phases=[];errors=[]
for folder in sorted(E.iterdir()):
 if not folder.is_dir() or not (folder/'run.json').exists():continue
 j=json.loads((folder/'run.json').read_text())
 for i,phase in enumerate(j.get('phases',[]),1):
  log=folder/f'phase-{i:02}.stdout.log';err=folder/f'phase-{i:02}.stderr.log'
  if sha(log)!=phase['stdoutSHA256'] or sha(err)!=phase['stderrSHA256']:errors.append('log hash '+str(log))
  c=counts(log.read_text())
  if not c or c['tests']!=c['pass']+c['fail']+c['cancelled']+c['skipped']:errors.append('counts '+str(log))
  if phase['status']=='PASS' and (c.get('fail') or c.get('cancelled') or c.get('skipped')):errors.append('false PASS '+str(log))
  phases.append({'group':j['group'],'file':phase['file'],'directory':rel(folder),'status':phase['status'],'counts':c,'metadata':rel(folder/f'phase-{i:02}.json'),'inputManifest':rel(folder/'inputs.json'),'inputSHA256':sha(folder/'inputs.json'),'stdout':rel(log),'stdoutSHA256':sha(log),'passCases':cases(log,'✔'),'failCases':cases(log,'✖')})
# Select the last passing run of each exact test identity. Two explicit CLI-format successors retain original assertions.
canonical=lambda s:s.replace('h6004compat-','').replace('postgres-h6-004-ac032-temporal.test.ts','postgres-h6-004-ac032.test.ts')
latest={}
for x in phases:
 if x['status']=='PASS':latest[canonical(x['file'])]=x
reconciled=[]
for x in phases:
 if x['counts']['fail']!=len(x['failCases']):errors.append('FAIL enumeration '+x['directory'])
 for name,origin in x['failCases'].items():
  successor=latest.get(canonical(x['file']),{}).get('passCases',{}).get(name)
  if not successor:errors.append('missing successor '+name)
  reconciled.append({'historicalFAIL':origin,'historicalInputManifest':x['inputManifest'],'successorPASS':successor,'successorInputManifest':latest.get(canonical(x['file']),{}).get('inputManifest'),'classification':'instrumentation/fixture correction; exact reason in corrective-register.md'})
p=json.loads((E/'preflight-v1.json').read_text());protected=[]
for kind,root,entries in [('normative',R,p['normativeInputs']),('migration',R,p['migrations']),('H6-001',Path(p['protectedH6001Root']),p['protectedH6001'])]:
 for f in entries:
  path=root/f['path'];actual=sha(path) if path.exists() else None
  if actual!=f['sha256']:errors.append('protected mismatch '+str(path))
  protected.append({'kind':kind,'path':str(path),'expectedSHA256':f['sha256'],'actualSHA256':actual})
functional=[]
for path in subprocess.check_output(['git','ls-files','src','supabase/migrations'],cwd=R,text=True).splitlines():
 original=subprocess.check_output(['git','show','HEAD:'+path],cwd=R)
 if hashlib.sha256(original).hexdigest()!=sha(R/path):errors.append('product changed '+path)
 functional.append({'path':path,'sha256':sha(R/path)})
for command in [['git','diff','--check'],['git','diff','--cached','--exit-code'],['git','diff','--exit-code']]:
 check=subprocess.run(command,cwd=R,capture_output=True,text=True)
 if check.returncode:errors.append(' '.join(command)+': '+check.stdout+check.stderr)
selected=[{k:v for k,v in x.items() if k not in ['passCases','failCases']} for x in latest.values()]
quality=[]
for folder in sorted(E.glob('quality-*')):
 j=json.loads((folder/'run.json').read_text())
 for phase in j['results']:
  for stream in ['stdout','stderr']:
   if sha(folder/(phase['name']+'.'+stream+'.log'))!=phase[stream+'SHA256']:errors.append('quality hash')
 quality.append({'directory':rel(folder),'status':j['status'],'unitCounts':counts((folder/'test.stdout.log').read_text())})
result={'schema':'h6004-verification-v1','status':'PASS' if not errors else 'FAIL','errors':errors,'base':subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip(),'selected':selected,'selectedTotal':sum(x['counts']['tests'] for x in selected),'allAttemptsTotals':{k:sum(x['counts'][k] for x in phases) for k in ['tests','pass','fail','cancelled','skipped']},'reconciledFAILCount':len(reconciled),'completeCleanRegressionClaim':False,'failToSuccessor':reconciled,'quality':quality,'protected':protected,'functional':functional,'allExecutedCases':phases}
print(json.dumps(result,indent=2,ensure_ascii=False))
sys.exit(bool(errors))
