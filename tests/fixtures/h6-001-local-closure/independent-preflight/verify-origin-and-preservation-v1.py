import datetime,hashlib,json,os,subprocess
from pathlib import Path
OUT=Path('/tmp/h6-001-local-closure-audit');ROOT=Path('/Users/andres/.codex/worktrees/h6-001-local/crm-huescaventura-os');PRIMARY=Path('/Users/andres/Developer/crm-huescaventura-os');BASE='971c55d5ce5770c71284d106d3c0deecca9514b5';H5COMMIT='8a5f1408777b81b760a02646fa414a34dc17983e';ENV={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def sha(b):return hashlib.sha256(b).hexdigest()
def canon(v):return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def read(p):return (ROOT/p).read_bytes()
def js(p):return json.loads(read(p))
def git(*args):return subprocess.check_output(['git',*args],cwd=PRIMARY,env=ENV)
checks=[]
def ck(name,ok,detail):checks.append({'id':name,'status':'PASS' if ok else 'FAIL','detail':detail})
manifest=js('tests/fixtures/h6-001/delivery-manifest-v1.json');inherited=js('tests/fixtures/h6-001/inherited-inputs.json')['files'];rbase='tests/fixtures/h6-001-delivery-readback/';rm=js(rbase+'receipt-manifest-v1.json');rs=js(rbase+'receipt-seal-v1.json')
ck('readback-wrapper-manifest-binding',sha(read(rbase+'receipt-manifest-v1.json'))==rs['manifestSHA256']=='3a9fc70491879377f9fa4d49674db32d5fc88f086552d187babec0956a98ef63' and rm['payloads']==8 and rs['payloads']==8 and rm['payloadBytes']==88355,{'manifestSHA256':rs['manifestSHA256'],'payloads':8,'bytes':88355,'sealSHA256':sha(read(rbase+'receipt-seal-v1.json'))})
for f in rm['files']:
 b=read(rbase+f['path']);ck('readback-wrapper-payload:'+f['path'],sha(b)==f['sha256'] and len(b)==f['bytes'],f['sha256'])
originals={f['path']:'H6001 own sealed payload' for f in manifest['files']}
originals.update({f['path']:'H6001 exact inherited source' for f in inherited})
originals.update({'tests/fixtures/h6-001/delivery-manifest-v1.json':'H6001 outer manifest','tests/fixtures/h6-001/delivery-seal-v1.json':'H6001 outer seal'})
originals.update({rbase+f['path']:'Exterior readback wrapper payload' for f in rm['files']})
originals.update({rbase+'receipt-manifest-v1.json':'Readback receipt manifest',rbase+'receipt-seal-v1.json':'Readback receipt seal'})
files=[]
for p,kind in sorted(originals.items()):
 path=ROOT/p;b=read(p);files.append({'path':p,'bytes':len(b),'sha256':sha(b),'classification':kind,'regularNotSymlink':path.is_file() and not path.is_symlink()})
ck('331-original-protection-set',len(files)==331 and all(f['regularNotSymlink'] for f in files),{'paths':len(files),'bytes':sum(f['bytes'] for f in files),'identityTableSHA256':sha(canon(files))})
coord=['specs/001-core-crm/tasks.md','docs/PROJECT-STATUS.md','docs/NEXT-STEPS.md'];own={f['path']:f for f in manifest['files']};h5paths=[]
for p in coord:
 current=read(p);archived=git('show','8ec91602a3bf813cf01ffbc6b2ac1a2862fe10d0:'+p);base=git('show',BASE+':'+p)
 h5paths.append({'path':p,'currentH6001SHA256':sha(current),'currentH6001Bytes':len(current),'outerManifestSHA256':own[p]['sha256'],'baseSHA256':sha(base),'archivedH6015ClosureSHA256':sha(archived),'inOwn305':p in own,'preservationRequired':True,'conflict':'Same three coordination paths are already sealed H6-001 payloads and historical H6-015 closure candidates. In-place editing invalidates the accepted original; use additive documentary variants plus exact unapplied patch.'})
ck('three-sealed-documentary-overlaps',len(h5paths)==3 and all(x['currentH6001SHA256']==x['outerManifestSHA256'] for x in h5paths),h5paths)
# H5-019 provenance is checked against its published local Git object, not against later coordination headers.
ancestor=subprocess.run(['git','merge-base','--is-ancestor',H5COMMIT,BASE],cwd=PRIMARY,env=ENV).returncode==0
ck('H5019-local-published-ancestor',ancestor,H5COMMIT)
h5decision=js('tests/fixtures/h5-019-acceptance/decision-receipt.json');h5seal=read('tests/fixtures/h5-019-corrective/candidate-seal.json');h5m=js('tests/fixtures/h5-019-acceptance/publication-manifest.json')
ck('H5019-D01-accepted-exact-seal',sha(h5seal)==h5decision['D01']['acceptedCandidateSealSha256']==h5m['acceptedTechnicalCandidateSealSha256']=='31fd4ac89aea684f2155a4365cb5870a0c0163838cbfd543d2ad98d0db1ea619',h5decision['D01'])
ck('H5019-D02-D03-local-closure',h5decision['D02']['scope']=='COMPLETED exclusivamente local/aislado' and h5decision['D02']['tasks']==['TSK-H5-019','H5 global'] and h5decision['D03']['preserveHistoricalFacts'] and h5decision['accreditation']['materialDefectsOpen']==0,{'D02':h5decision['D02'],'D03':h5decision['D03'],'accreditation':h5decision['accreditation']})
h5manifestpath='tests/fixtures/h5-019-acceptance/publication-manifest.json';publishedManifest=git('show',H5COMMIT+':'+h5manifestpath);ck('H5019-manifest-current-equals-published',publishedManifest==read(h5manifestpath),{'sha256':sha(publishedManifest),'entries':len(h5m['files']),'publishedPathsDeclared':h5m['publicationPathsTotal']})
publishedBad=[];currentBad=[];currentCount=0
for p,entry in h5m['files'].items():
 expected=entry['after'];b=git('show',H5COMMIT+':'+p)
 if sha(b)!=expected['sha256'] or len(b)!=expected['bytes']:publishedBad.append(p)
 if p not in coord:
  currentCount+=1;b=read(p)
  if sha(b)!=expected['sha256'] or len(b)!=expected['bytes']:currentBad.append(p)
ck('H5019-180-published-manifest-members',len(h5m['files'])==180 and not publishedBad,{'verified':180-len(publishedBad),'mismatches':publishedBad,'scope':'Exact H5-019 commit blobs; no current global coordination state inferred from old headers.'})
ck('H5019-177-current-origin-members',currentCount==177 and not currentBad,{'verified':currentCount-len(currentBad),'mismatches':currentBad,'excludedLaterCoordinationPaths':coord})
for p in ['specs/001-core-crm/acceptance-TSK-H5-019.md','specs/001-core-crm/closure-TSK-H5-019.md','tests/fixtures/h5-019-acceptance/decision-receipt.json','tests/fixtures/h5-019-corrective/candidate-seal.json']:
 ck('H5019-origin-current-published:'+p,read(p)==git('show',H5COMMIT+':'+p),sha(read(p)))
result={'schema':'h6-001-local-closure-origin-preservation-v1','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS' if all(c['status']=='PASS' for c in checks) else 'FAIL','checks':checks,'count':len(checks),'failures':[c for c in checks if c['status']=='FAIL'],'sourceH5019':{'localAncestor':H5COMMIT,'acceptedTechnicalCandidateSealSHA256':sha(h5seal),'publicationManifestSHA256':sha(publishedManifest),'publishedMembersVerified':180-len(publishedBad),'currentNonCoordinationMembersVerified':currentCount-len(currentBad),'dependencyVerdict':'SATISFIED_LOCAL_ISOLATED' if ancestor and not publishedBad and not currentBad else 'FAIL','limits':'No external remote or Drive check; historical states before their decisions remain unchanged.'},'documentaryOverlaps':h5paths,'protectedOriginalPaths':331,'runtime':False,'SQL':False,'publication':False,'newProductOrNormativeChanges':False}
(OUT/'origin-and-overlaps-v1.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
(OUT/'protected-original-inventory-v1.json').write_text(json.dumps({'schema':'h6-001-local-closure-originals-protected-v1','capturedAt':result['at'],'base':BASE,'files':files,'count':len(files),'bytes':sum(f['bytes'] for f in files),'identityTableSHA256':sha(canon(files)),'scope':'Frozen original H6-001 candidate, 14 inherited sources and exterior readback. Future closure package is additive and excluded.'},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'count':result['count'],'failures':result['failures'],'H5019':result['sourceH5019'],'protectedOriginals':331,'overlaps':coord},ensure_ascii=False,indent=2))
