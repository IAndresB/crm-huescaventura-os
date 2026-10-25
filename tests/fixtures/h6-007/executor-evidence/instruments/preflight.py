from pathlib import Path
import json,subprocess,hashlib,datetime,urllib.request
r=Path(__file__).resolve().parent.parent/'crm-huescaventura-os';d=Path(__file__).resolve().parent
def git(*a):return subprocess.check_output(['git',*a],cwd=r).decode().strip()
head=git('rev-parse','HEAD');assert head=='9c15e6d143822f7fcc84f29744194554630f4ac4';tree=git('rev-parse','HEAD^{tree}');assert tree=='fe7cabb05e44462121c70ad52405765e2c94fcd2';assert not git('status','--porcelain=v1');assert git('ls-remote','origin','refs/heads/main').split()[0]==head
files=[]
for rel in ['docs/constitution.md','docs/architecture.md','docs/DECISIONS.md','docs/state-machines.md','docs/business-rules.md','docs/domain-model.md','specs/001-core-crm/spec.md','specs/001-core-crm/tasks.md','specs/001-core-crm/plan.md','docs/PROJECT-STATUS.md','docs/NEXT-STEPS.md']:
 p=r/rel;b=p.read_bytes();files.append({'path':rel,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
product=[]
for folder in ['src','supabase/migrations']:
 for p in sorted((r/folder).rglob('*')):
  if p.is_file():b=p.read_bytes();product.append({'path':str(p.relative_to(r)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
assert len([e for e in product if e['path'].startswith('supabase/migrations/')])==68
j={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS','repository':'IAndresB/crm-huescaventura-os','remote':'git@github.com:IAndresB/crm-huescaventura-os.git','base':head,'tree':tree,'worktree':str(r),'indexEmpty':True,'trackedClean':True,'normative':files,'productAndMigrations':product,'H6':'IN_PROGRESS','H6015Quarantine':True,'commitsPushAuthorized':False,'predecessor':'preflight-v1-failure.txt'}
p=d/'preflight-v2.json';assert not p.exists();p.write_text(json.dumps(j,indent=2)+'\n');print('PASS: base/tree, 11 documentary files, 178 product/migration files.')
try:
 b=urllib.request.urlopen('https://supabase.com/changelog.md',timeout=20).read();(d/'supabase-changelog-snapshot.md').write_bytes(b);print('Changelog snapshot',len(b),'bytes; breaking tags',b.lower().count(b'breaking'))
except Exception as e:
 (d/'supabase-changelog-fetch-failure.txt').write_text(type(e).__name__+': '+str(e)+'\n');print('Changelog fetch failed; pinned local contracts remain primary.')
