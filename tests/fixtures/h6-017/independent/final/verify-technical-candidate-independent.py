from pathlib import Path
import hashlib,json,copy,re,datetime
root=Path('/Users/andres/.codex/worktrees/h6-017-local-isolated/crm-huescaventura-os');out=Path('audit/h6-017');mp=root/'tests/fixtures/h6-017/technical-manifest.json';raw=mp.read_bytes();expected='93d8bece86fd8ba8a6e6fa6bb0d3d33f850c6ae47dc583c55018515437c44d7b';manifest=json.loads(raw)
def validate(m):
 errors=[];paths=[]
 if len(m['files'])!=145:errors.append('payload-count')
 for row in m['files']:
  name=row['path'];p=Path(name)
  if p.is_absolute() or '..' in p.parts:errors.append('unsafe-path');continue
  if name in paths:errors.append('duplicate-path')
  paths.append(name)
  data=(root/p).read_bytes()
  if len(data)!=row['bytes'] or hashlib.sha256(data).hexdigest()!=row['sha256']:errors.append('payload:'+name)
 if sum(r['bytes']for r in m['files'])!=22790337:errors.append('total-bytes')
 return errors
issues=validate(manifest)
if hashlib.sha256(raw).hexdigest()!=expected:issues.append('external-manifest-hash')
expectedRows=json.loads((out/'expected.json').read_text())['normativeAssignments'];matrix=json.loads((root/'tests/fixtures/h6-017/normative/matrix-observed-v1.json').read_text())
if len(matrix['rows'])!=35 or {r['id']for r in matrix['rows']}!={r['id']for r in expectedRows}:issues.append('35-assignment-set')
for r in matrix['rows']:
 e=next(x for x in expectedRows if x['id']==r['id'])
 if r['assignment']['text']!=e['assignment'] or r['assignment']['line']!=e['tasksLine']:issues.append('normative-assignment:'+r['id'])
 source=root/r['source']['path'];lines=source.read_text().splitlines()
 if '\n'.join(lines[r['source']['line']-1:r['source']['line']-1+len(r['source']['criterion'].splitlines())])!=r['source']['criterion'] or hashlib.sha256(source.read_bytes()).hexdigest()!=r['source']['sha256']:issues.append('normative-source:'+r['id'])
 required=['preconditions','actorAndScope','syntheticData','positiveScenario','negativeScenario']
 for field in required:
  if not r.get(field):issues.append('matrix-missing:'+r['id']+':'+field)
fo=json.loads((root/'tests/fixtures/h6-017/functional-observed.json').read_text())
logs={}
for kind,expectedCounts in [('focal',{'tests':24,'pass':24,'fail':0,'skipped':0,'cancelled':0}),('regression',{'tests':75,'pass':74,'fail':0,'skipped':1,'cancelled':0})]:
 p=root/'tests/fixtures/h6-017'/fo[kind]['path']/'stdout.log';text=p.read_text();counts={}
 for k,v in expectedCounts.items():
  found=re.findall(r'(?:ℹ |# )'+k+r' (\d+)',text);counts[k]=int(found[-1]) if found else None
  if counts[k]!=v:issues.append('log-count:'+kind+':'+k)
 logs[kind]={'path':str(p.relative_to(root)),'counts':counts,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
if 'S10' not in (root/'tests/fixtures/h6-017'/fo['regression']['path']/'stdout.log').read_text():issues.append('skip-identity')
quality=[]
for name in ['units','lint-final','typecheck-stable24','build']:
 p=root/f'tests/fixtures/h6-017/quality/{name}.json';r=json.loads(p.read_text())
 if r['exitCode']!=0 or r['status']!='PASS':issues.append('quality:'+name)
 for log,digest in r.get('logs',{}).items():
  if hashlib.sha256((p.parent/log).read_bytes()).hexdigest()!=digest:issues.append('quality-log:'+log)
 if name=='typecheck-stable24' and hashlib.sha256((root/'tests/integration/postgres-h6-017-integrated.test.ts').read_bytes()).hexdigest()!=r['sourceSHA256']:issues.append('final-source-typecheck')
 quality.append({'name':name,'exitCode':r['exitCode']})
# Original adversarial verifier controls: modify in-memory manifest only, never candidate.
corrupt=copy.deepcopy(manifest);corrupt['files'][0]['sha256']='0'*64
omitted=copy.deepcopy(manifest);omitted['files'].pop()
traversal=copy.deepcopy(manifest);traversal['files'][0]['path']='../../runtime.env'
controls={'corruptDigestRejected':bool(validate(corrupt)),'omissionRejected':bool(validate(omitted)),'traversalRejected':bool(validate(traversal))}
if not all(controls.values()):issues.append('adversarial-verifier-controls')
scan=[]
for row in manifest['files']:
 p=root/row['path']
 if p.suffix not in ['.log','.json','.txt','.md']:continue
 text=p.read_text(errors='ignore')
 for key,pat in [('actualJWT',r'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}'),('passwordURI',r'postgres(?:ql)?://[^\s:/]+:[^\s@]+@'),('actualBearer',r'Bearer [A-Za-z0-9_-]{30,}')]:
  if re.search(pat,text):scan.append({'path':row['path'],'type':key})
if scan:issues.append('candidate-sensitive-patterns')
report={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'manifestSHA256':expected,'payloads':145,'payloadBytes':22790337,'normativeAssignments':35,'sourceAndIOReviewed':True,'logs':logs,'quality':quality,'adversarialControls':controls,'sensitiveFindings':scan,'issues':issues,'PASS':not issues,'historicalSkip':'H6-008 S10 remains SKIP; own actual Auth password/TOTP and R2 cover applicable local authorization obligations; no Hosted/Production claim'}
(out/'technical-candidate-independent-readback.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
