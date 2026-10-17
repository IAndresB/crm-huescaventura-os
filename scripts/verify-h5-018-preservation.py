"""Independent frozen-candidate and historical-byte audit. No product writes."""
from pathlib import Path
import hashlib,json,gzip,subprocess,stat,re
r=Path(__file__).resolve().parents[1];out=r/'tests/fixtures/h5-018'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p):return json.loads(gzip.decompress(p.read_bytes()) if p.suffix=='.gz' else p.read_bytes())
freeze=load(out/'candidate-manifest.json.gz');changes=[]
for name,meta in freeze['files'].items():
 p=r/name
 if not p.is_file() or sha(p)!=meta['sha256'] or p.stat().st_size!=meta['bytes'] or oct(stat.S_IMODE(p.stat().st_mode))!=meta['mode']:changes.append(name)
assert not changes,changes
old=load(r/'tests/fixtures/h5-017/preflight.json.gz')['files'];allowed=set(freeze['modified']);historical=0
for name,meta in old.items():
 if name not in allowed:
  assert freeze['files'][name]['sha256']==meta['sha256'],name;historical+=1
assert historical==36775
# Git itself independently confirms no tracked change outside the three status documents.
changed=set(subprocess.check_output(['git','diff','--name-only'],cwd=r,text=True).splitlines());assert changed==allowed
assert not subprocess.check_output(['git','diff','--cached','--name-only'],cwd=r)
previous=load(r/'tests/fixtures/h5-016/final-inputs.json')['inputs'];assert len(previous)==456
for name,digest in previous.items():assert sha(r/name)==digest,name
failed=gzip.decompress((r/'tests/fixtures/h5-017/16-postgres-complete.stdout.log.gz').read_bytes()).decode()
passed=gzip.decompress((r/'tests/fixtures/h5-017/36-postgres-complete-final.stdout.log.gz').read_bytes()).decode()
def counters(s):
 return {k:int(re.findall(r'(?:ℹ|#) '+k+r' (\d+)',s)[-1]) for k in ['tests','pass','fail','cancelled','skipped']}
fc,pc=counters(failed),counters(passed);assert fc=={'tests':2787,'pass':2762,'fail':25,'cancelled':0,'skipped':0};assert pc=={'tests':2788,'pass':2788,'fail':0,'cancelled':0,'skipped':0}
prior=gzip.decompress((r/'tests/fixtures/h5-017/25-before-api-role-fix.sql.gz').read_bytes());current=(r/'supabase/migrations/20261016142812_h5_protected_diagnostics.sql').read_bytes();assert prior!=current
report={'frozenCandidateFilesUnchanged':len(freeze['files']),'historicalFilesUnchanged':historical,'h5016InputsUnchanged':len(previous),'previousMigrationHashesUnchanged':63,'originalFail':fc,'historicalCorrectedComplete':pc,'previousMigration64Sha256':hashlib.sha256(prior).hexdigest(),'currentMigration64Sha256':hashlib.sha256(current).hexdigest(),'indexEmpty':True,'base':freeze['base'],'trackedChangesOnlyOriginalThree':True}
(out/'preservation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
