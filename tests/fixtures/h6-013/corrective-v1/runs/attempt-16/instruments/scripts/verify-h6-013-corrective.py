"""Read-only independent readback of the corrected local candidate. Not a second technical audit.
Usage: python3 scripts/verify-h6-013-corrective.py (prints JSON; never rewrites evidence).
"""
import pathlib,os,stat,json,hashlib,subprocess,re
ROOT=pathlib.Path(__file__).resolve().parents[1];FIX=ROOT/'tests/fixtures/h6-013';C=FIX/'corrective-v1';BASE='8a5f1408777b81b760a02646fa414a34dc17983e';TREE='758e871c7ad621dcbdb69516cccd175e529dbd6e'
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT,env=env)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def unique(pairs):
 result={}
 for k,v in pairs:
  assert k not in result,'Duplicate JSON key '+k
  result[k]=v
 return result
def read(p):return json.loads(p.read_text(),object_pairs_hook=unique)
def descriptor(p):
 s=p.lstat();assert stat.S_ISREG(s.st_mode),'Nonregular candidate path '+str(p)
 return {'type':'file','mode':oct(stat.S_IMODE(s.st_mode)),'bytes':s.st_size,'sha256':sha(p)}
assert git('rev-parse','HEAD').decode().strip()==BASE and git('rev-parse','HEAD^{tree}').decode().strip()==TREE
assert git('branch','--show-current').decode().strip()=='main'
manifestPath=FIX/'candidate-manifest-corrective-v1.json';sealPath=FIX/'candidate-seal-corrective-v1.json';m=read(manifestPath);seal=read(sealPath)
assert seal['manifest']=={'path':str(manifestPath.relative_to(ROOT)),**descriptor(manifestPath)}
assert m['base']==BASE and m['tree']==TREE
new=sorted(p.decode() for p in git('ls-files','--others','--exclude-standard','-z').split(b'\0') if p)
exclusions=m['exclusions'];assert set(exclusions)=={str(p.relative_to(ROOT)) for p in [manifestPath,sealPath,FIX/'final-readback-corrective-v1.json']}
assert set(new)-set(exclusions)==set(m['files'])
for p,v in m['files'].items():
 assert pathlib.PurePosixPath(p).as_posix()==p and '..' not in pathlib.PurePosixPath(p).parts and not p.startswith('/')
 assert descriptor(ROOT/p)==v,p
# Prior manifest remains a historical object, verified in its restored original context.
custody=pathlib.Path(m['previousCandidate']['custody']);prior=read(custody/'candidate-original-inventory.json');assert len(prior)==9658
priorSeal=read(custody/'custody-seal.json')
for p,v in priorSeal['files'].items():assert descriptor(custody/p)==v,p
for p,v in prior.items():assert descriptor(custody/'candidate-original'/p)==v,p
assert sha(custody/'auditor-original/auditor-candidate-inventory.json')=='0133a88529999eaada20798d088ecefc2b849875184d94c0a263189a23db9182'
oldManifest=read(custody/'candidate-original/tests/fixtures/h6-013/candidate-manifest.json')
assert sha(custody/'candidate-original/tests/fixtures/h6-013/candidate-manifest.json')=='64bd0caf4f307404f325d9351c9545a60473cf24827b3cbda1d31aad1ff8f0fa'
for p,v in oldManifest['files'].items():
 actual=descriptor(custody/'candidate-original'/p);assert actual['sha256']==v['sha256'] and actual['bytes']==v['bytes']
auditor=read(custody/'auditor-original-inventory.json')
for p,v in auditor.items():assert descriptor(custody/'auditor-original'/p)==v,p
modified=[p for p,v in prior.items() if descriptor(ROOT/p)!=v]
assert modified==['tests/integration/postgres-h6-013-negatives.test.ts'],modified
assert set(m['changedFromPrevious'])==set(modified) and set(m['addedFromPrevious'])==set(new)-set(prior)-set(exclusions)
# Reconstruct Git contents/modes and index independently of the new manifest.
tracked={}
for row in git('ls-tree','-rz',BASE).split(b'\0'):
 if not row:continue
 header,p=row.split(b'\t',1);mode,kind,oid=header.decode().split();p=p.decode();f=ROOT/p;b=os.readlink(f).encode() if f.is_symlink() else f.read_bytes()
 actualmode='120000' if f.is_symlink() else '100755' if f.stat().st_mode&0o111 else '100644'
 assert actualmode==mode and hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==oid,p
 tracked[p]=(mode,oid)
index={}
for row in git('ls-files','--stage','-z').split(b'\0'):
 if row:
  h,p=row.split(b'\t',1);mode,oid,stage=h.decode().split();assert stage=='0';index[p.decode()]=(mode,oid)
assert index==tracked and len(tracked)==38702
assert sha(ROOT/'.git/index')==read(custody/'custody-receipt.json')['indexSha256']
for p,h in read(C/'expected-seal.json')['files'].items():assert sha(ROOT/p)==h,p
# Ignored dependencies/build files and every original local path must remain unchanged except the declared instrument.
originalFrozen=read(custody/'auditor-original/freeze-files.json');frozenChanges=[]
for path,old in originalFrozen.items():
 f=ROOT/path;st=f.lstat();kind='symlink' if f.is_symlink() else 'file';raw=os.readlink(f).encode() if kind=='symlink' else f.read_bytes()
 actual={'type':kind,'mode':oct(stat.S_IMODE(st.st_mode)),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
 if actual!={k:old[k] for k in actual}:frozenChanges.append(path)
assert frozenChanges==['tests/integration/postgres-h6-013-negatives.test.ts']
ignored=sorted(p.decode() for p in git('ls-files','--others','--ignored','--exclude-standard','-z').split(b'\0') if p)
assert ignored==sorted(read(custody/'auditor-original/ignored-paths.json'))
# Results are reconstructed from actual individual artifacts and raw log footers.
selection=m['verificationSelection'];security=C/'runs'/selection['security'];h1root=C/'runs'/selection['H1'];chainroot=C/'runs'/selection['chain'];crossroot=C/'runs'/selection['cross'];quality=C/'runs'/selection['quality'];temporal=C/'runs'/selection['temporal'];phaseRoots={int(i):C/'runs'/label for i,label in selection['regressionPhases'].items()}
for area in {security,h1root,chainroot,crossroot,quality,temporal,*phaseRoots.values()}:
 provenance=read(area/'provenance.json');assert provenance['expectedSealSha256']==sha(C/'expected-seal.json')
 for path,h in provenance['instruments'].items():assert sha(area/'instruments'/path)==h,path
 for path,h in provenance.get('oracleInputs',{}).items():assert sha(area/'oracle-inputs'/path)==h
 result=read(area/'result.json');assert not result['originalBaseErrors'] and not result['unexpectedReplicaChanges'] and not result['activePostgresPidFiles']
for name,area in [('negatives',security),('h1-preservation',h1root),('chain',chainroot),('cross-s6',crossroot),('temporal-fixture',temporal),*[(n,quality) for n in ['frozen','typecheck','lint','unit','build']]]:assert read(area/(name+'.status.json'))['exit']==0,name
n=read(security/'negatives/all-tables-security.json');attempts=n['outcomes'];assert len(attempts)==len({(a['user'],a['table'],a['verb']) for a in attempts})==2800 and all(a['code']=='42501' for a in attempts)
expected=read(C/'inputs/expected-definers.json');assert {f['signature'] for f in n['owners']}=={f['signature'] for f in expected['functions']}
functions=list((security/'negatives/definers').glob('*.json'));assert len(functions)==len(expected['functions']) and all(read(p)['pass'] for p in functions)
controls=list((security/'negatives').glob('control-*.json'));assert len(controls)==7 and all(read(p)['pass'] and read(p)['restored'] for p in controls)
for f in n['owners']:
 assert not any(f[k] for k in ['super','bypass','login','createRole','createDb'])
 assert [x.strip() for x in f['config'][0].split('=',1)[1].split(',')]==['pg_catalog','pg_temp'] and len(f['config'])==1
 assert f['ordinaryExecute']==next(x['ordinaryExecute'] for x in expected['functions'] if x['signature']==f['signature'])
assert read(h1root/'h1/seed-values-24.json')['metadata']['state']=='prepared'
assert read(h1root/'h1/seed-values-25.json')['task']['state']=='pending'
h1=read(h1root/'h1/summary.json');assert [(x['from'],x['to']) for x in h1['edges']]==[(i,i+1) for i in range(18,26)]
for to in range(19,27):
 b=read(h1root/f'h1/edge-{to}-before.json');a=read(h1root/f'h1/edge-{to}-after.json');assert a['after']==b['rows'] and a['equal'] and a['controlsRestored'] and a['oldConstraintsPreserved'];assert b['businessValuesAndRelations']==a['businessValuesAndRelations']
 for p in (h1root/'h1').glob(f'edge-{to}-control-*.json'):assert read(p)['detected'] and read(p)['before']!=read(p)['changed']
chain=read(chainroot/'chain/chain-result.json');assert len({r['case'] for r in chain['results']})==410 and all(r['pass'] for r in chain['results']) and chain['completeFreshInstalls']==2
edges=0
for p in (crossroot/'cross').glob('*-summary.json'):
 d=read(p);assert [(e['from'],e['to']) for e in d['edges']]==[(i,i+1) for i in range(d['origin'],68)]
 for e in d['edges']:
  x=read(p.parent/(d['caseId']+'-edge-'+str(e['to'])+'.json'));assert x['before']==x['after']
 edges+=len(d['edges'])
assert edges==136
phases=[]
for i in range(1,16):
 reg=phaseRoots[i];name=f'regression-phase-{i:02}';assert read(reg/(name+'.status.json'))['exit']==0
 text=(reg/(name+'.stdout.log')).read_text();counts={}
 for k in ['tests','pass','fail','cancelled','skipped','todo']:
  found=re.findall(r'(?:ℹ|#) '+k+r' (\d+)',text);assert found;counts[k]=int(found[-1])
 assert counts['tests']==counts['pass'] and all(counts[k]==0 for k in ['fail','cancelled','skipped','todo']);phases.append(counts)
total={k:sum(p[k] for p in phases) for k in phases[0]};assert total['pass']==2950
assert read(quality/'unit.status.json')['counts']['pass']==208
for path,h in read(C/'expected-temporal-seal.json')['files'].items():assert sha(ROOT/path)==h
assert read(temporal/'temporal/before.json')['error']=='AVAILABILITY_CHRONOLOGY_REQUIRED:E3'
assert read(temporal/'temporal/after.json')['pass']
last=phaseRoots[15];assert (last/'regression-phase-15.stdout.log').read_text().count('H6013 F12 explicit domain timestamp')==1
assert read(last/'provenance.json')['oracleInputs']['expected-temporal.json']==sha(C/'expected-temporal.json')
assert sha(last/'instruments/tests/support/h6-013-regression-hook.mjs')==sha(ROOT/'tests/support/h6-013-regression-hook.mjs')
# Exact source preservation and old normative expected must remain independently recoverable.
print(json.dumps({'status':'PASS_INTERNAL_READBACK_PENDING_SECOND_INDEPENDENT_AUDIT','base':BASE,'tree':TREE,'branch':'main','indexSha256':sha(ROOT/'.git/index'),'preservedBaseFiles':len(tracked),'originalFrozenPathsChecked':len(originalFrozen),'preservedIgnoredPaths':len(ignored),'previousCandidateRecoveredFiles':len(prior),'auditorRecoveredFiles':len(auditor),'currentNewPaths':len(new),'manifestFiles':len(m['files']),'manifestSha256':sha(manifestPath),'sealSha256':sha(sealPath),'modifiedPreviousCandidatePaths':modified,'definers':len(functions),'securityControls':len(controls),'directCrudDenied':len(attempts),'H1AdjacentEdges':len(h1['edges']),'H1DeliberateControls':len(list((h1root/'h1').glob('edge-*-control-*.json'))),'chainAssertions':410,'crossUpgradeEdges':edges,'postgresRegression':total,'unitRegression':208,'publicationAuthorized':False,'taskCompleted':False},indent=2))
