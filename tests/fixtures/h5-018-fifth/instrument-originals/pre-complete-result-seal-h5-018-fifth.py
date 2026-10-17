"""Append-only independent audit seal; never changes candidate F."""
from pathlib import Path
import gzip,hashlib,json,stat,subprocess,sys
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h5-018-fifth'
def sha(b):return hashlib.sha256(b).hexdigest()
def save(p,v):
 b=(json.dumps(v,sort_keys=True,indent=2)+'\n').encode()
 with p.open('xb')as f:f.write(b)
 return sha(b)
subprocess.run([sys.executable,str(r/'scripts/verify-h5-018-fifth-preservation.py')],cwd=r,check=True)
c=json.loads((o/'current-coverage.json').read_bytes());assert c['result']=='PASS independent local/isolated'and c['complete']['pass']==2933 and c['materialDefectsOpen']==0
received=json.loads(gzip.decompress((o/'received-inventory.json.gz').read_bytes()))['files']
names=set(subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z'],cwd=r).decode().strip('\0').split('\0'))
excluded=['tests/fixtures/h5-018-fifth/audit-inventory.json','tests/fixtures/h5-018-fifth/audit-seal.json'];assert not any((r/n).exists()for n in excluded)
new=sorted(names-set(received));files={}
for n in new:
 p=r/n;s=p.lstat();assert stat.S_ISREG(s.st_mode)and not p.is_symlink();files[n]={'type':'file','mode':oct(stat.S_IMODE(s.st_mode)),'bytes':s.st_size,'sha256':sha(p.read_bytes())}
digest=save(o/'audit-inventory.json',{'audit':'H5-018 fifth','candidate':'H5-017-F','files':files,'selfMetadataExcluded':excluded,'newFilesIncludingSelfMetadata':len(files)+2,'candidateFilesPreserved':38118})
seal={'audit':'H5-018 fifth independent','result':'PASS','scope':'local isolated synthetic only','base':'9649a2773530ea8a43237b4e1f2034f80e34136f','candidate':'H5-017-F','candidateInventoryContentSha256':'67a024e11fc7dc9c1336f463f372ccd5c90b4aebcca1fb14ba8c94340dbf7a9e','candidateSealSha256':'da14b2ba3cf0767b9b807c2cf12c8edbca0b0a221bc7c2f70e11d3f7a42dd9dd','candidateFilesPreserved':38118,'modifiedCandidateFiles':0,'deletedCandidateFiles':0,'inventorySha256':digest,'auditFiles':len(files)+2,'totalWorkspaceFiles':38118+len(files)+2,'receivedInventoryGzipSha256':sha((o/'received-inventory.json.gz').read_bytes()),'coverageSha256':sha((o/'current-coverage.json').read_bytes()),'caseInventoryContentSha256':c['caseInventoryContentSha256'],'postgres':2933,'candidateRegression':2920,'newCases':13,'postgresFiles':194,'disjointPhases':15,'unit':208,'health':1,'materialDefectsOpen':0,'historicalAuditsRemainFAIL':4,'H5017':'IN PROGRESS','H5018':'IN PROGRESS','DM-PENDING-005':'OPEN','acceptanceRecommendation':'Candidate F exactly identified; director approval required before acceptance/publication','publicationAuthorized':False,'commit':False,'push':False,'deploy':False,'H5019':'NOT STARTED','H6':'NOT STARTED','state':'STOP'}
sealhash=save(o/'audit-seal.json',seal);print(json.dumps({'result':'PASS audit sealed','inventorySha256':digest,'sealSha256':sealhash,'auditFiles':len(files)+2,'totalFiles':seal['totalWorkspaceFiles']}))
