"""Create one new corrective manifest and seal. Refuses replacement; no Git mutations.
Run only after the selected checks and supplemental report have been completed.
"""
import pathlib,os,stat,subprocess,json,hashlib,datetime
R=pathlib.Path(__file__).resolve().parents[1];F=R/'tests/fixtures/h6-013';C=F/'corrective-v1'
M=F/'candidate-manifest-corrective-v1.json';S=F/'candidate-seal-corrective-v1.json';B=F/'final-readback-corrective-v1.json'
assert not any(p.exists() for p in [M,S,B])
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def info(p):
 st=p.lstat();assert stat.S_ISREG(st.st_mode),str(p)
 return {'type':'file','mode':oct(stat.S_IMODE(st.st_mode)),'bytes':st.st_size,'sha256':sha(p)}
def read(p):return json.loads(p.read_text())
def save(p,data):p.open('x').write(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def git(*a):return subprocess.check_output(['git',*a],cwd=R,env=env)
base='8a5f1408777b81b760a02646fa414a34dc17983e';tree='758e871c7ad621dcbdb69516cccd175e529dbd6e'
assert git('rev-parse','HEAD').decode().strip()==base and git('rev-parse','HEAD^{tree}').decode().strip()==tree
custody=pathlib.Path(read(C/'expected.json')['custodyReceipt']['path']).parent
prior=read(custody/'candidate-original-inventory.json');assert len(prior)==9658
for p,v in prior.items():assert info(custody/'candidate-original'/p)==v,p
modified={p:{'previous':v,'current':info(R/p),'reason':'AUD-H6013-01/02 instrument correction; original retained in custody'} for p,v in prior.items() if info(R/p)!=v}
assert set(modified)=={'tests/integration/postgres-h6-013-negatives.test.ts'}
selection={'security':'attempt-12','H1':'attempt-12','chain':'attempt-03','cross':'attempt-03','quality':'attempt-13','temporal':'attempt-15','regressionPhases':{str(i):('attempt-16' if i==15 else 'attempt-10' if i==1 else 'attempt-03') for i in range(1,16)}}
checks=[(selection['security'],'negatives'),(selection['H1'],'h1-preservation'),(selection['chain'],'chain'),(selection['cross'],'cross-s6'),(selection['temporal'],'temporal-fixture')]+[(selection['quality'],n) for n in ['frozen','typecheck','lint','unit','build']]+[(label,f'regression-phase-{int(i):02}') for i,label in selection['regressionPhases'].items()]
for label,name in checks:assert read(C/'runs'/label/(name+'.status.json'))['exit']==0,(label,name)
# Logs are hashed in the complete file map and attributed by per-attempt provenance and executed-source copies.
files=sorted(p.decode() for p in git('ls-files','--others','--exclude-standard','-z').split(b'\0') if p)
exclusions={str(M.relative_to(R)):'Manifest cannot hash itself',str(S.relative_to(R)):'Final acyclic envelope hashes manifest; not included by manifest',str(B.relative_to(R)):'Readback is produced after sealing and binds both manifest and seal'}
assert not(set(files)&set(exclusions))
added=[p for p in files if p not in prior]
for p in added:
 assert (p.startswith('tests/fixtures/h6-013/') or (p.startswith('scripts/') and 'h6-013' in p and p.endswith('.py')) or (p.startswith('tests/integration/postgres-h6-013-') and p.endswith('.ts')) or (p.startswith('tests/support/h6-013-') and p.endswith(('.ts','.mjs'))) or (p.startswith('specs/001-core-crm/') and 'TSK-H6-013-corrective-v1.md' in p)),p
mapping={p:info(R/p) for p in files}
manifest={'candidate':'TSK-H6-013-corrective-v1','status':'PASS_TECHNICAL_PROPOSED_LOCAL_ISOLATED_PENDING_SECOND_INDEPENDENT_AUDIT','generatedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base':base,'tree':tree,'previousCandidate':{'manifestSha256':'64bd0caf4f307404f325d9351c9545a60473cf24827b3cbda1d31aad1ff8f0fa','independentInventorySha256':'0133a88529999eaada20798d088ecefc2b849875184d94c0a263189a23db9182','custody':str(custody),'receiptSha256':sha(custody/'custody-receipt.json'),'sealSha256':sha(custody/'custody-seal.json'),'restoredFiles':9658,'originalManifestValidationContext':'custody/candidate-original; one current instrument intentionally differs'},'correctives':['AUD-H6013-01','AUD-H6013-02','AUD-H6013-03'],'documentaryObservation':'AUD-H6013-04','changedFromPrevious':modified,'addedFromPrevious':added,'previousPathsPreservedInWorkspace':len(prior)-len(modified),'versionedBasePathsPreserved':38702,'files':mapping,'exclusions':exclusions,'totals':{'files':len(mapping),'bytes':sum(v['bytes'] for v in mapping.values()),'newPathsIncludingThreeFinalEnvelopeFiles':len(mapping)+3},'verificationSelection':selection,'verificationProvenance':'Each selected component points to its original stdout/stderr/status and attempt instrument snapshots. Historical failed attempts remain included, never relabelled. Phase-level combination is explicit.','nonGoals':['H6-013 completion','H6 closure','H6-014','DM-PENDING-005 changes','Hosted/Production','publication','commit/push/deploy']}
recovery=read(C/'custody-mode-recovery.json')
assert sha(pathlib.Path(recovery['path'])/'recovery-receipt.json')==recovery['receiptSha256']
manifest['previousCandidate']['auditorModeRecovery']={k:recovery[k] for k in ['path','receiptSha256']}
fullRecovery=read(C/'custody-full-auditor-recovery.json')
assert sha(pathlib.Path(fullRecovery['path'])/'recovery-receipt.json')==fullRecovery['receiptSha256']
manifest['previousCandidate']['auditorFullRecovery']={k:fullRecovery[k] for k in ['path','receiptSha256']}
save(M,manifest);save(S,{'candidate':manifest['candidate'],'manifest':{'path':str(M.relative_to(R)),**info(M)},'generatedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'trust':'Local integrity envelope only; no WORM/external guarantee','readback':str(B.relative_to(R)),'status':'PENDING_INTERNAL_READBACK_AND_SECOND_INDEPENDENT_AUDIT'})
print(json.dumps({'manifest':str(M),'manifestSha256':sha(M),'seal':str(S),'sealSha256':sha(S),'files':len(mapping),'totalNewPaths':len(mapping)+3},indent=2))
