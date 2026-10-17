"""Read-only verification of every G inventory entry and all received historical bytes."""
from pathlib import Path
import gzip,hashlib,json,stat,subprocess,sys
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h5-017-g';sha=lambda b:hashlib.sha256(b).hexdigest()
s=json.loads((o/'candidate-seal.json').read_bytes());compressed=(o/'candidate-inventory.json.gz').read_bytes();raw=gzip.decompress(compressed);inv=json.loads(raw)
assert sha(compressed)==s['candidateInventoryGzipSha256']and sha(raw)==s['candidateInventoryContentSha256']
for n,v in inv['files'].items():
 p=r/n;x=p.lstat();assert stat.S_ISREG(x.st_mode)and not p.is_symlink();assert {'type':'file','mode':oct(stat.S_IMODE(x.st_mode)),'bytes':x.st_size,'sha256':sha(p.read_bytes())}==v,('G_INVENTORY_CHANGED',n)
assert sha((o/'delta-inventory.json').read_bytes())==s['deltaInventorySha256']
assert sha((o/'current-coverage.json').read_bytes())==s['coverageSha256']
assert sha(gzip.decompress((o/'current-case-inventory.json.gz').read_bytes()))==s['caseInventoryContentSha256']
names=set(subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z'],cwd=r).decode().strip('\0').split('\0'))
assert names==set(inv['files'])|set(inv['selfMetadataExcluded'])and len(names)==s['totalFiles']
assert s['result']=='PASS internal local isolated'and s['postgres']['pass']==2945 and s['materialDefectsOpen']==0
assert not s['accepted']and not s['publicationAuthorized']and s['state']=='STOP'
subprocess.run([sys.executable,str(r/'scripts/verify-h5-017-g-preservation.py')],cwd=r,check=True)
print(json.dumps({'result':'PASS G inventory and seal verified','protected':38271,'F':38118,'fifthAudit':153,'Gnew':s['GnewFiles'],'total':len(names),'inventoryContentSha256':sha(raw),'inventoryGzipSha256':sha(compressed),'sealSha256':sha((o/'candidate-seal.json').read_bytes()),'state':'STOP'}))
