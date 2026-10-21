import pathlib,json,hashlib,stat,subprocess,datetime,shutil
R=pathlib.Path('/Users/andres/Developer/crm-huescaventura-os');O=pathlib.Path(__file__).parent;P='tests/fixtures/h6-013/';C=pathlib.Path('/Users/andres/Documents/CRM_HUESCAVENTURA_AUDIT_CUSTODY/H6-013-pre-v2-20261020T162705Z');A=pathlib.Path('/Users/andres/Documents/CRM_HUESCAVENTURA_AUDITS/H6-013-second-independent-20261020T113726Z');T=pathlib.Path('/Users/andres/Documents/CRM_HUESCAVENTURA_AUDIT_CUSTODY/H6-013-auditor-archive-recovery-20261020T003459Z');C0=T.parent/'H6-013-precorrectivo-20261019T233427Z'
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
 return h.hexdigest()
def desc(p):
 s=p.lstat();assert stat.S_ISREG(s.st_mode),p
 return dict(type='file',mode=oct(stat.S_IMODE(s.st_mode)),bytes=s.st_size,sha256=sha(p))
def save(p,d):
 with p.open('x') as f:json.dump(d,f,indent=2,sort_keys=True);f.write('\n')
prior=json.loads((C/'v1-inventory.json').read_text());paths=set(filter(None,subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=R).decode().split('\0')))
exclusions={P+'candidate-manifest-corrective-v2.json':'Manifest cannot hash itself',P+'candidate-seal-corrective-v2.json':'Seal binds manifest after creation',P+'final-readback-corrective-v2.json':'Readback binds manifest and seal; its hash is delivered outside itself'}
assert not(paths & set(exclusions))
current={p:desc(R/p) for p in sorted(paths)};assert set(prior)<=set(current)
modified={p:{'before':prior[p],'after':d} for p,d in current.items() if p in prior and d!=prior[p]};assert set(modified)=={'tests/support/h6-013-security.ts','tests/support/h6-013-preservation.ts','tests/integration/postgres-h6-013-migration.test.ts'}
added={p:d for p,d in current.items() if p not in prior}
external=[C/'v1-inventory.json',C/'candidate-v1.tar',C/'receipt.json',C/'seal.json',A/'findings.json',A/'candidate-inventory.json',A/'fixture-numeric-precision.json',A/'results-reconstruction.json',A.parent/(A.name+'-evidence.tar'),A/'auxiliary-archive-receipt.json',T/'auditor-original.tar',T/'recovery-receipt.json',T/'recovery-seal.json',C0/'candidate-original-inventory.json',C0/'auditor-original-inventory.json',C0/'custody-receipt.json',C0/'custody-seal.json']
tracked=json.loads((O/'tracked-before.json').read_text())
manifest={'candidate':'TSK-H6-013-corrective-v2','status':'PASS_TECHNICAL_PROPOSED_LOCAL_ISOLATED_PENDING_FOCUSED_INDEPENDENT_AUDIT','createdUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base':{'commit':'8a5f1408777b81b760a02646fa414a34dc17983e','tree':'758e871c7ad621dcbdb69516cccd175e529dbd6e','branch':'main','tracked':38702,'indexSha256':sha(R/'.git/index'),'modeExceptions':{p:d['mode'] for p,d in tracked.items() if d['mode']!='0o644'}},'previous':{'candidate':'corrective-v1','manifestPath':P+'candidate-manifest-corrective-v1.json','manifestSha256':'6995c237e5e484cd1b2eabf1f2d8089ca620f7549f61e881973c1c140ea183e0','inventoryPath':str(C/'v1-inventory.json'),'inventorySha256':sha(C/'v1-inventory.json'),'custody':str(C),'originalManifestSha256':'64bd0caf4f307404f325d9351c9545a60473cf24827b3cbda1d31aad1ff8f0fa','reconstruction':'V1 full descriptors from immutable-by-convention local inventory; current state is that set replaced by modified.after plus added. Prior bytes recoverable from TAR. No WORM claim.'},'correctives':['AUD2-H6013-01','AUD2-H6013-02','AUD2-H6013-03'],'historicalObservationUnchanged':'AUD2-H6013-04','modified':modified,'added':added,'payload':{'files':len(current),'bytes':sum(d['bytes'] for d in current.values()),'inventorySha256':hashlib.sha256(json.dumps(current,sort_keys=True,separators=(',',':')).encode()).hexdigest()},'exclusions':exclusions,'externalDependencies':[{'path':str(p),'descriptor':desc(p)} for p in external],'expected':P+'corrective-v2/expected.json','results':P+'corrective-v2/results.json','custodyReconciliation':P+'corrective-v2/custody-reconciliation-v2.json','scope':'No product/base/normative changes, no commits/push/deploy. Local candidate is not an authorized publication set. Ignored node_modules and private temporary execution resources are not candidate payload.'}
mp=R/(P+'candidate-manifest-corrective-v2.json');save(mp,manifest)
sp=R/(P+'candidate-seal-corrective-v2.json');save(sp,{'candidate':manifest['candidate'],'sealedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'manifestPath':str(mp.relative_to(R)),'manifestSha256':sha(mp),'previousManifestSha256':manifest['previous']['manifestSha256'],'expectedSha256':sha(R/manifest['expected'])})
print(json.dumps({'manifestSha256':sha(mp),'sealSha256':sha(sp),'payload':manifest['payload'],'addedPayloadFiles':len(added),'modified':list(modified)}),flush=True)
