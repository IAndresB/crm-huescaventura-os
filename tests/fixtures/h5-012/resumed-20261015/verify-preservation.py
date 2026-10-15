from pathlib import Path
import hashlib,json,subprocess,datetime
r=Path(__file__).resolve().parents[4];e=Path(__file__).resolve().parent
baseline=json.loads((e/'preflight.json').read_text());allowed={'src/domain/coordinated-projection.ts','tests/integration/postgres-h5-012-independent.test.ts'}
hash_file=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
changed=[];missing=[];mode_changed=[]
for x in baseline['files']:
 p=r/x['path']
 if not p.is_file():missing.append(x['path']);continue
 if hash_file(p)!=x['sha256']:changed.append(x['path'])
 if oct(p.stat().st_mode&0o777)!=x['mode']:mode_changed.append(x['path'])
assert not missing and not mode_changed
assert set(changed)==allowed,changed
old=(e/'independent-before60.ts.txt').read_text();current=(r/'tests/integration/postgres-h5-012-independent.test.ts').read_text()
assert current==old.replace(' reader=new H5011ProjectionAdapter',' await h.migration.unsafe(await readFile("supabase/migrations/20261015180420_h5_projection_canonical_revisions.sql","utf8"));\n reader=new H5011ProjectionAdapter')
for p,archive in [('src/domain/coordinated-projection.ts','domain-before-f02.ts.txt'),('tests/integration/postgres-h5-012-independent.test.ts','independent-before60.ts.txt')]:
 assert hash_file(e/archive)==next(x['sha256'] for x in baseline['files'] if x['path']==p)
manifest=json.loads((e/'inputs-supplement.json').read_text())
for x in manifest['inputs']:assert hash_file(r/x['path'])==x['sha256'],x['path']
expected=r/'specs/001-core-crm/expected-TSK-H5-011-012.md'
assert expected.stat().st_size==67346 and hash_file(expected)=='669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b'
refs=subprocess.check_output(['git','rev-parse','HEAD','main','origin/main'],cwd=r).decode().splitlines();assert refs==[baseline['head']]*3
assert not subprocess.check_output(['git','diff','--cached','--name-only'],cwd=r)
subprocess.run(['git','diff','--check'],cwd=r,check=True)
result={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseline_files':len(baseline['files']),'unchanged_files':len(baseline['files'])-len(changed),'authorized_changes':changed,'unexpected_changes':[],'mode_changes':[],'missing':[],'old_sources_archived_exactly':True,'independent_assertions_unchanged':True,'final_inputs_exact':True,'frozen_expected':{'bytes':67346,'sha256':hash_file(expected)},'refs':refs,'index_empty':True,'diff_check':'PASS','status':subprocess.check_output(['git','status','--short','--branch'],cwd=r).decode()}
(e/'preservation-final.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='status'},indent=2))
