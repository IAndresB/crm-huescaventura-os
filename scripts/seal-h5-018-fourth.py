"""Append-only deterministic audit inventory. E is referenced, never resealed."""
from pathlib import Path
import gzip,hashlib,json,stat,subprocess
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h5-018-fourth'
sha=lambda value:hashlib.sha256(value).hexdigest()
def encode(value):return(json.dumps(value,indent=2,sort_keys=True)+'\n').encode()
def metadata(path):
    info=path.lstat();assert stat.S_ISREG(info.st_mode)and not path.is_symlink()
    return {'type':'file','mode':oct(stat.S_IMODE(info.st_mode)),'bytes':info.st_size,'sha256':sha(path.read_bytes())}
for name in ['audit-inventory.json','audit-seal.json']:assert not (OUT/name).exists(),name
subprocess.run(['python3','scripts/verify-h5-018-fourth-preservation.py'],cwd=ROOT,check=True)
pre=json.loads(gzip.decompress((OUT/'preflight.json.gz').read_bytes()))
coverage=json.loads((OUT/'current-coverage.json').read_bytes())
assert coverage['result']=='FAIL'and coverage['combinedDisjoint']=={'tests':2901,'pass':2894,'fail':7}
assert coverage['newIndependent']=={'tests':17,'pass':10,'fail':7,'cancelled':0,'skipped':0}
assert coverage['materialDefects']==['H5-018-4-F01','H5-018-4-F02']
names=set(subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z'],cwd=ROOT).decode().strip('\0').split('\0'))
files={name:metadata(ROOT/name)for name in sorted(names-set(pre['files']))}
inventory={'audit':'TSK-H5-018 fourth','auditedCandidate':'H5-017-E','base':pre['base'],'candidateContentSha256':pre['candidateInventorySha256'],'candidateFilesUnchanged':37758,'files':files,'modifiedCandidateFiles':[],'deletedCandidateFiles':[],'selfMetadataExcluded':['tests/fixtures/h5-018-fourth/audit-inventory.json','tests/fixtures/h5-018-fourth/audit-seal.json']}
raw=encode(inventory)
with(OUT/'audit-inventory.json').open('xb')as stream:stream.write(raw)
seal={'audit':'TSK-H5-018 fourth','result':'FAIL','dateEuropeMadrid':'2026-10-17','base':pre['base'],'auditedCandidate':'H5-017-E','candidateContentSha256':pre['candidateInventorySha256'],'candidateSealFileSha256':pre['files']['tests/fixtures/h5-017-e/candidate-seal.json']['sha256'],'candidateFilesPreserved':37758,'inventorySha256':sha(raw),'auditInventoriedFiles':len(files),'auditTotalFiles':len(files)+2,'workspaceTotalFiles':37758+len(files)+2,'modifiedCandidateFiles':0,'deletedCandidateFiles':0,'migration67Sha256':'45ee62b013979f09b1145b6fa3ad096f88f676bc2170f48e245b7df2ca8c28a5','previousSelectionFreshRun':{'tests':2884,'pass':2884,'fail':0},'newIndependentCases':coverage['newIndependent'],'combinedDisjointCases':coverage['combinedDisjoint'],'originalFocalPass':44,'focalOverlapsFull':True,'retestDoesNotAddCases':True,'historicalOutcomesReused':0,'unitPass':208,'healthPass':1,'materialDefects':coverage['materialDefects'],'candidateAccepted':False,'recommendation':'Correct F01/F02 only under a new explicit authorization, then independent verification','productModified':False,'H5017':'IN PROGRESS','H5018':'IN PROGRESS','DM-PENDING-005':'OPEN','committed':False,'pushed':False,'deployed':False,'state':'STOP; await project director authorization','verificationCommand':'python3 scripts/verify-h5-018-fourth-seal.py','serialization':'Sorted UTF-8 JSON, indent2, final newline; self-metadata excluded explicitly'}
with(OUT/'audit-seal.json').open('xb')as stream:stream.write(encode(seal))
print(json.dumps({'auditSealCreated':True,'result':'FAIL','auditFiles':len(files)+2,'inventorySha256':sha(raw),'verificationRequired':True}))
