"""Read-only independent audit and candidate integrity verification."""
from pathlib import Path
import gzip,hashlib,json,stat,subprocess
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h5-018-fourth'
sha=lambda value:hashlib.sha256(value).hexdigest()
seal=json.loads((OUT/'audit-seal.json').read_bytes());raw=(OUT/'audit-inventory.json').read_bytes();inventory=json.loads(raw)
assert sha(raw)==seal['inventorySha256']
pre=json.loads(gzip.decompress((OUT/'preflight.json.gz').read_bytes()))
assert seal['result']=='FAIL'and seal['candidateAccepted']is False and not seal['productModified']
assert seal['candidateFilesPreserved']==len(pre['files'])==37758
assert seal['candidateContentSha256']==pre['candidateInventorySha256']=='0e0c08b8b70da6d12c2480eb8217cdf1e5df9b640c6dd1244f153b76a3be8191'
assert seal['auditInventoriedFiles']==len(inventory['files'])
assert seal['auditTotalFiles']==len(inventory['files'])+2
assert seal['workspaceTotalFiles']==37758+seal['auditTotalFiles']
assert seal['materialDefects']==['H5-018-4-F01','H5-018-4-F02']
assert seal['H5017']==seal['H5018']=='IN PROGRESS'and seal['DM-PENDING-005']=='OPEN'
for name,expected in {**pre['files'],**inventory['files']}.items():
    path=ROOT/name;info=path.lstat();assert stat.S_ISREG(info.st_mode)and not path.is_symlink(),name
    assert {'type':'file','mode':oct(stat.S_IMODE(info.st_mode)),'bytes':info.st_size,'sha256':sha(path.read_bytes())}==expected,name
names=set(subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z'],cwd=ROOT).decode().strip('\0').split('\0'))
assert names==set(pre['files'])|set(inventory['files'])|set(inventory['selfMetadataExcluded'])
assert not set(pre['files'])&set(inventory['files'])
assert inventory['modifiedCandidateFiles']==inventory['deletedCandidateFiles']==[]
coverage=json.loads((OUT/'current-coverage.json').read_bytes());assert coverage['combinedDisjoint']==seal['combinedDisjointCases']=={'tests':2901,'pass':2894,'fail':7}
assert sha((ROOT/'tests/fixtures/h5-017-e/candidate-seal.json').read_bytes())==seal['candidateSealFileSha256']
subprocess.run(['python3','scripts/verify-h5-018-fourth-preservation.py'],cwd=ROOT,check=True)
print(json.dumps({'verification':'PASS audit seal and unchanged candidate','dictamen':'FAIL','candidateFilesPreserved':37758,'auditFiles':seal['auditTotalFiles'],'inventorySha256':seal['inventorySha256'],'materialDefects':seal['materialDefects'],'state':'STOP'}))
