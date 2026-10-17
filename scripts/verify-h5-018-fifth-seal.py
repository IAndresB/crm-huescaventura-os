"""Read-only audit and candidate verification after sealing."""
from pathlib import Path
import gzip,hashlib,json,stat,subprocess,sys
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h5-018-fifth'
sha=lambda b:hashlib.sha256(b).hexdigest()
seal=json.loads((o/'audit-seal.json').read_bytes());raw=(o/'audit-inventory.json').read_bytes();inv=json.loads(raw)
assert sha(raw)==seal['inventorySha256']
assert sha((o/'received-inventory.json.gz').read_bytes())==seal['receivedInventoryGzipSha256']
assert sha((o/'current-coverage.json').read_bytes())==seal['coverageSha256']
assert sha(gzip.decompress((o/'current-case-inventory.json.gz').read_bytes()))==seal['caseInventoryContentSha256']
for n,v in inv['files'].items():
 p=r/n;s=p.lstat();assert stat.S_ISREG(s.st_mode)and not p.is_symlink();assert {'type':'file','mode':oct(stat.S_IMODE(s.st_mode)),'bytes':s.st_size,'sha256':sha(p.read_bytes())}==v,('AUDIT_CHANGED',n)
received=json.loads(gzip.decompress((o/'received-inventory.json.gz').read_bytes()))['files']
names=set(subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z'],cwd=r).decode().strip('\0').split('\0'))
assert names==set(received)|set(inv['files'])|set(inv['selfMetadataExcluded'])
assert len(names)==seal['totalWorkspaceFiles'];assert len(inv['files'])+2==seal['auditFiles']
assert seal['result']=='FAIL'and seal['materialDefectsOpen']==1 and seal['state']=='STOP'and not seal['publicationAuthorized']
subprocess.run([sys.executable,str(r/'scripts/verify-h5-018-fifth-preservation.py')],cwd=r,check=True)
print(json.dumps({'result':'PASS seal verified; audit FAIL','candidateFiles':38118,'auditFiles':seal['auditFiles'],'totalFiles':len(names),'inventorySha256':sha(raw),'sealSha256':sha((o/'audit-seal.json').read_bytes()),'state':'STOP'}))
