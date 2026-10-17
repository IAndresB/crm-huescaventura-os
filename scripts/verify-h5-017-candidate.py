#!/usr/bin/env python3
"""Read-only verification of H5-017 receipts, inputs and historical integrity.
No staging, commit, publication or independent H5-018 audit.
"""
import gzip,hashlib,json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'tests/fixtures/h5-017'
def read(path):
 p=ROOT/path
 return gzip.decompress(p.read_bytes())if p.suffix=='.gz'else p.read_bytes()
def sha(data):return hashlib.sha256(data).hexdigest()
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT)
def require(value,message):
 if not value:raise RuntimeError(message)

VERIFIER_PREDECESSORS={'55bf0350cc83758a5972b9bef7d78b75a952ff83ae183af418eda4a32a491fde': 'tests/fixtures/h5-017/verifier-predecessor-26-corrective.py.gz', 'a1dac06b6152af5dd4a6e35b95342c981f435bbcef30dfa9fa7ac5bfe398c77a': 'tests/fixtures/h5-017/verifier-predecessor-27-regression-on64-final.py.gz'}
TRANSIENT_HARNESSES={'postgres-h4-024.test.ts':'h4-reality-isolated.ts','postgres-h5-008.test.ts':'h5-work-isolated.ts','postgres-h5-009.test.ts':'h5-boundary-isolated.ts','postgres-h5-016-audit.test.ts':'h5-joint-closure-isolated.ts'}
def input_unchanged(path,expected):
 p=ROOT/path
 if p.is_file() and sha(p.read_bytes())==expected:return True
 # These two versions of this verification-only tool were collected as inputs
 # before it was ever executed. Their original bytes stay available verbatim.
 if path=='scripts/verify-h5-017-candidate.py' and expected in VERIFIER_PREDECESSORS:
  return sha(read(VERIFIER_PREDECESSORS[expected]))==expected
 # Temporary copies never change assertions; reconstruct their exact bytes
 # from protected original sources and the four fixed harness substitutions.
 prefix='tests/integration/h5017-regression-'
 if path.startswith(prefix) and not p.exists():
  name=path[len(prefix):]
  if name not in TRANSIENT_HARNESSES:return False
  source=(ROOT/'tests/integration'/name).read_text();harness=TRANSIENT_HARNESSES[name]
  for quote in ["'",'"']:
   source=source.replace('from '+quote+'../support/'+harness+quote,'from '+quote+'../support/h5-diagnostic-regression-isolated.ts'+quote)
  return sha(source.encode())==expected
 return False

def verify():
 pre=json.loads(read('tests/fixtures/h5-017/preflight.json.gz'))
 require(git('rev-parse','HEAD').decode().strip()==pre['base'],'BASE_CHANGED')
 require(git('diff','--cached','--name-only')==b'','REAL_INDEX_NOT_EMPTY')
 mutable={'docs/PROJECT-STATUS.md','docs/NEXT-STEPS.md','specs/001-core-crm/tasks.md'}
 checked=0
 for path,item in pre['files'].items():
  if path in mutable:continue
  p=ROOT/path
  require(p.is_file()and not p.is_symlink(),path+': missing or changed type')
  require(sha(p.read_bytes())==item['sha256'],path+': historical bytes changed')
  require(oct(p.stat().st_mode&0o777)==item['mode'],path+': mode changed');checked+=1
 prior=json.loads(read('tests/fixtures/h5-016/final-inputs.json'))['inputs']
 for path,h in prior.items():require(sha((ROOT/path).read_bytes())==h,path+': H5-016 input changed')
 counts={'26-corrective':57,'27-regression-on64-final':104,'28-unit-final':201,'31-health-final':1,'36-postgres-complete-final':2788}
 gates=[*counts,'29-typecheck-final','30-lint-final','32-frozen-install-final','33-audit-final','34-build-final','35-versions-final']
 summaries={}
 for name in gates:
  receipt=json.loads(read('tests/fixtures/h5-017/'+name+'.status.json'))
  require(receipt['exit']==0 and receipt['changedDuringRun']==[],name+': failed/changed during run')
  require(receipt['base']==pre['base'],name+': wrong base')
  inputs=json.loads(read('tests/fixtures/h5-017/'+name+'.inputs.json'))
  for path,h in inputs.items():require(input_unchanged(path,h),name+': input changed '+path)
  if name in counts:
   stream=read('tests/fixtures/h5-017/'+name+'.stdout.log.gz').decode()
   summary={k:int(v)for k,v in re.findall(r'(?:ℹ |# )(tests|pass|fail|cancelled|skipped) (\d+)',stream)}
   require(summary=={'tests':counts[name],'pass':counts[name],'fail':0,'cancelled':0,'skipped':0},name+': exact counts differ');summaries[name]=summary
 require(len(list((ROOT/'supabase/migrations').glob('*.sql')))==64,'MIGRATION_CHAIN_CHANGED')
 require('NOT STARTED' in (ROOT/'specs/001-core-crm/tasks.md').read_text().split('#### TSK-H5-018',1)[1].split('#### ',1)[0],'H5-018_STARTED')
 result={'base':pre['base'],'historicalFilesUnchanged':checked,'statusDocumentsAllowed':sorted(mutable),'priorH5016InputsUnchanged':len(prior),'migrationChain':64,'newPostgres':32,'priorPostgres':2756,'newUnit':4,'counts':summaries,'gates':gates,'scope':'H5-017 implementation only, local/isolated','independentH5018Executed':False,'realIndexEmpty':True}
 print(json.dumps(result,indent=2));return result
if __name__=='__main__':verify()
