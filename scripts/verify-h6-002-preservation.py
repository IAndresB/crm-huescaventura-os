"""Read-only preservation and dependency readback. Never imports historical instruments."""
from pathlib import Path
import hashlib,json,gzip,subprocess,stat
root=Path(__file__).resolve().parents[1]
out=root/'tests/fixtures/h6-002'
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
dump('preservation-final.json',{'status':'PASS','trackedFiles':len(base['files']),'migrations':68,'base':base['base'],'tree':base['tree'],'dependency':'H5-019 documentary local/synthetic accepted; no new business execution inferred','H5-019AcceptedCandidateSeal':sha(seal),'H5-019AuditSeal':sha(a/'AUDIT-SEAL.json'),'H5-019AuditPayloads':audited,'H6-017DeliverySeal':sha(d17/'delivery-seal.json'),'H6-017Payloads':len(dmanifest['files']),'H6-015':'preserved as historical files only; runtime/SQL/S11/reentry not accessed','productChanges':0,'canonicalChanges':0,'H6':'IN PROGRESS'})
print(json.dumps({'status':'PASS','tracked':len(base['files']),'H5019AuditPayloads':audited,'H6017Payloads':len(dmanifest['files'])}))
