#!/usr/bin/env python3
"""Custody readback; never rebase, rewrite, stage, publish or access a database."""
from pathlib import Path
import json,hashlib,subprocess,sys
R=Path(__file__).resolve().parent.parent;D=R/'tests/fixtures/h6-004';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();load=lambda p:json.loads(p.read_text());checks=[]
def check(name,ok,details=None):checks.append({'control':name,'status':'PASS' if ok else 'FAIL','details':details})
m=load(D/'delivery-manifest-v1.json');s=load(D/'delivery-seal-v1.json')
check('manifest_seal',sha(D/'delivery-manifest-v1.json')==s['manifestSHA256'])
check('unique_payloads',len(m['files'])==len({x['path'] for x in m['files']})==m['payloads'])
bad=[]
for x in m['files']:
 p=R/x['path']
 if not p.is_file() or p.is_symlink() or sha(p)!=x['sha256'] or p.stat().st_size!=x['bytes']:bad.append(x['path'])
check('all_payload_bytes',not bad,bad);check('total_size',sum(x['bytes'] for x in m['files'])==m['payloadBytes'])
check('base',subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip()==m['base'])
for args in [['git','diff','--cached','--exit-code'],['git','diff','--exit-code'],['git','diff','--check']]:check(' '.join(args),subprocess.run(args,cwd=R,capture_output=True).returncode==0)
actual=set(subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=R).decode().rstrip('\0').split('\0'))
expected={x['path'] for x in m['files']}|{'tests/fixtures/h6-004/delivery-manifest-v1.json','tests/fixtures/h6-004/delivery-seal-v1.json'}
# Future external readback is a separate, self-manifested namespace, never silently appended to this candidate.
extra=actual-expected;allowed={p for p in extra if p.startswith('tests/fixtures/h6-004-delivery-readback/')}
check('exact_candidate_delta',not (extra-allowed) and not(expected-actual),{'expectedCandidatePaths':len(expected),'actualPaths':len(actual),'separateReceiptPaths':len(allowed),'unknown':sorted(extra-allowed),'missing':sorted(expected-actual)})
frozen=load(D/'preflight-v1.json');mismatches=[]
for root,files in [(R,frozen['normativeInputs']),(R,frozen['migrations']),(Path(frozen['protectedH6001Root']),frozen['protectedH6001'])]:
 for x in files:
  if sha(root/x['path'])!=x['sha256']:mismatches.append(str(root/x['path']))
check('protected_norms_68_376',not mismatches,mismatches)
o=load(D/'documentary-overlay-v1.json');checksOverlay=[]
for x in o['files']:checksOverlay.append({'path':x['path'],'preimage':sha(Path(x['source']))==x['beforeSHA256'],'postimage':sha(R/x['postimage'])==x['afterSHA256']})
check('overlay_preimages_postimages',all(x['preimage'] and x['postimage'] for x in checksOverlay),checksOverlay)
check('overlay_patch',sha(R/o['patch'])==o['patchSHA256'])
g=load(D/'closure-gate-v1.json');check('closure_exact_independent_verdict',g['status']=='PASS' and g['independentVerdictSHA256']==sha(D/'independent/independent-verdict.md'))
result={'schema':'h6004-final-custody-readback-v1','status':'PASS' if all(x['status']=='PASS' for x in checks) else 'FAIL','manifestSHA256':sha(D/'delivery-manifest-v1.json'),'sealSHA256':sha(D/'delivery-seal-v1.json'),'payloads':m['payloads'],'payloadBytes':m['payloadBytes'],'checks':checks,'stageCommitPushMerge':False,'runtimeAccess':False,'publication':False}
print(json.dumps(result,indent=2,ensure_ascii=False));sys.exit(result['status']!='PASS')
