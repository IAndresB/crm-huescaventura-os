"""Read-only preservation and dependency readback. Never imports historical instruments."""
from pathlib import Path
import hashlib,json,gzip,subprocess,stat
root=Path(__file__).resolve().parents[1]
out=root/'tests/fixtures/h6-003'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def check(p,e):
 assert p.is_file() and not p.is_symlink(),str(p)
 assert sha(p)==e,str(p)
def dump(name,d):
 p=out/name
 assert not p.exists(),str(p)
 p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
base=json.loads(gzip.decompress((out/'baseline.json.gz').read_bytes()))
for item in base['files']:
 p=root/item['path'];check(p,item['sha256']);assert p.stat().st_size==item['bytes'] and stat.S_IMODE(p.stat().st_mode)==item['mode'],str(p)
assert len(list((root/'supabase/migrations').glob('*.sql')))==68
assert not subprocess.check_output(['git','diff','--name-only'],cwd=root).strip()
assert not subprocess.check_output(['git','diff','--cached','--name-only'],cwd=root).strip()
acceptance=json.loads((root/'tests/fixtures/h5-019-acceptance/decision-receipt.json').read_text())
seal=root/'tests/fixtures/h5-019-corrective/candidate-seal.json';check(seal,acceptance['D01']['acceptedCandidateSealSha256'])
s=json.loads(seal.read_text());check(root/'tests/fixtures/h5-019-corrective/candidate-inventory.json.gz',s['inventorySha256'])
a=Path('/Users/andres/Developer/crm-h5-019-corrective-independent-audit-20261018')
check(a/'AUDIT-SEAL.json',acceptance['independentAudit']['sealSha256']);check(a/'AUDIT-INVENTORY.json',acceptance['independentAudit']['inventorySha256'])
for relative,item in json.loads((a/'AUDIT-INVENTORY.json').read_text())['files'].items():
 p=a/relative;check(p,item['sha256']);assert p.stat().st_size==item['bytes'] and stat.S_IMODE(p.stat().st_mode)==item['mode']
audited=len(json.loads((a/'AUDIT-INVENTORY.json').read_text())['files'])
h17=Path('/Users/andres/.codex/worktrees/h6-017-local-isolated/crm-huescaventura-os');d17=h17/'tests/fixtures/h6-017';dseal=json.loads((d17/'delivery-seal.json').read_text());check(d17/'delivery-manifest.json',dseal['manifestSHA256'])
dmanifest=json.loads((d17/'delivery-manifest.json').read_text())
for item in dmanifest['files']:
 p=h17/item['path'];check(p,item['sha256']);assert p.stat().st_size==item['bytes'] and oct(stat.S_IMODE(p.stat().st_mode))==item['mode']
deliveries=[]
for number in ['002','005']:
 origin=Path('/Users/andres/.codex/worktrees/h6-'+number+'-local-isolated/crm-huescaventura-os')
 folder=origin/'tests/fixtures'/('h6-'+number)
 ds=json.loads((folder/'delivery-seal.json').read_text())
 check(folder/'delivery-manifest.json',ds['metadata']['delivery-manifest.json']['sha256'])
 dm=json.loads((folder/'delivery-manifest.json').read_text())
 for item in dm['files']:
  p=origin/item['path'];check(p,item['sha256']);assert p.stat().st_size==item['bytes'] and oct(stat.S_IMODE(p.stat().st_mode))==item['mode']
 deliveries.append({'task':'H6-'+number,'sealSHA256':sha(folder/'delivery-seal.json'),'manifestSHA256':sha(folder/'delivery-manifest.json'),'payloads':len(dm['files']),'state':ds['state']})
# H6-015 read-only documentary reconstruction, no runtime or historical instrument execution.
indexFile=h17/'tests/fixtures/h6-017/preservation/readback-v3.json'
check(indexFile,'02f2b46d1c5f5dc7cb8c4610a24d6f98700cf074b91e42f5dc4539a493fd485b')
index=json.loads(indexFile.read_text())['H6015'];entries=[];cache={}
for package in index['packages']:
 check(root/package['manifest'],package['manifestSHA256'])
 for row in package['resolutions']:
  locator=row['resolved']
  if locator not in cache:
   if locator.startswith('/'):
    p=Path(locator);assert '/crm-huescaventura-os/' in str(p) and (row['path'].startswith(('tests/','scripts/','docs/','specs/','supabase/','src/')) or row['path'] in ['README.md','package.json','pnpm-lock.yaml','tsconfig.json','next-env.d.ts','.gitignore','next.config.ts','eslint.config.mjs']);data=p.read_bytes()
   elif locator.startswith('published-canonical-identical:'):data=(root/row['path']).read_bytes()
   elif locator.startswith(('snapshot:','snapshot-identical:')):
    _,ref,path=locator.split(':',2);data=subprocess.check_output(['git','show',ref+':'+path],cwd=root)
   else:raise RuntimeError(locator)
   cache[locator]=hashlib.sha256(data).hexdigest()
  assert cache[locator]==row['sha256'],row['path']
  entries.append({'path':row['path'],'sha256':cache[locator]})
assert len(index['packages'])==16 and len(entries)==4568
product=sum(x['path'].startswith('src/') for x in base['files'])
dump('preservation-final.json',{'status':'PASS','trackedFiles':len(base['files']),'productFiles':product,'migrations':68,'base':base['base'],'tree':base['tree'],'dependency':'H5-019 documentary local/synthetic accepted; no new business execution inferred','H5-019AcceptedCandidateSeal':sha(seal),'H5-019AuditSeal':sha(a/'AUDIT-SEAL.json'),'H5-019AuditPayloads':audited,'H6-017DeliverySeal':sha(d17/'delivery-seal.json'),'H6-017Payloads':len(dmanifest['files']),'deliveries':deliveries,'H6-015':{'manifestCount':16,'entriesChecked':4568,'runtimeAccess':False,'SQL':False,'S11':False,'suspendedJobsAccess':False},'productChanges':0,'canonicalChanges':0,'H6':'IN PROGRESS'})
print(json.dumps({'status':'PASS','tracked':len(base['files']),'product':product,'H5019AuditPayloads':audited,'H6017Payloads':len(dmanifest['files']),'H6002':269,'H6005':524,'H6015':'16/4568'}))
