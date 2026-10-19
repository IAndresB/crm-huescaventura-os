"""Read-only final verifier; --seal writes only two new self-excluding metadata files."""
from pathlib import Path
from collections import Counter
import gzip,hashlib,json,re,stat,subprocess,sys
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h5-019'
def sha(b):return hashlib.sha256(b).hexdigest()
def obj(p):
 p=r/p if not Path(p).is_absolute()else Path(p);b=p.read_bytes();return json.loads(gzip.decompress(b)if p.suffix=='.gz'else b)
def meta(n):
 p=r/n;s=p.lstat();assert stat.S_ISREG(s.st_mode)and not p.is_symlink(),n
 return {'sha256':sha(p.read_bytes()),'bytes':s.st_size,'mode':s.st_mode&0o777}
def git(*args):return subprocess.check_output(['git',*args],cwd=r).decode().strip()
def capturecounts(n):
 s=gzip.decompress((o/n).read_bytes()).decode()
 return {k:int(v[-1])for k in ['tests','pass','fail','cancelled','skipped']if(v:=re.findall(r'(?:ℹ|#) '+k+r' (\d+)',s))}
base=obj(o/'received-inventory.json.gz');assert base['base']=='1e7822c11be817e4f2d4791338284aa825ad1a24'
assert all(git('rev-parse',n)==base['base']for n in ['HEAD','main','origin/main'])
assert git('rev-parse','HEAD^{tree}')==base['tree']=='bbc8b1f1219201a8425e55a5cde6ce873cdc4006'
assert not git('diff','--cached','--name-only')and not git('diff','--name-only')and git('branch','--show-current')=='main'
assert git('rev-list','--left-right','--count','main...origin/main').split()==['0','0']
for n,m in base['files'].items():assert meta(n)==m,('PUBLISHED_BYTES_CHANGED',n)
assert len(base['files'])==38524
names=set(subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z'],cwd=r).decode().strip('\0').split('\0'))
new=names-set(base['files']);assert all(n.startswith('tests/fixtures/h5-019/')or n=='tests/integration/postgres-h5-019-integrated.test.ts'or n in ['scripts/capture-h5-019.py','scripts/test-h5-019-complete.mjs','scripts/test-h5-019-gates.py','scripts/consolidate-h5-019.py','scripts/verify-h5-019.py']or(n.startswith('specs/001-core-crm/')and'TSK-H5-019'in n)for n in new),sorted(new)
expected=obj(o/'expected-seal.json');assert sha((r/expected['path']).read_bytes())==expected['sha256']=='6644aebbbf32ef44824deac68b0748413c18fe51a76fb5ce0edf816fbbe82cdc'
sources=obj(o/'normative-sources.json');assert len(sources['criteria'])==26 and len(sources['assignedRows'])==187
for n,m in sources['files'].items():assert meta(n)==m
for x in obj(o/'dependencies.json')['dependencies']:
 for n,m in x['originalHashes'].items():assert meta(n)==m
assert len(obj(o/'dependencies.json')['dependencies'])==19
ph=obj(o/'01-phases.json');assert len(ph['phases'])==15 and len(set(n for p in ph['phases']for n in p['files']))==196
assert ph['total']=={'tests':2945,'pass':2945,'fail':0,'cancelled':0,'skipped':0}
for p in ph['phases']:assert p['exit']==0 and capturecounts(p['stdout'])==p['counts']
rp=obj(o/'01-replica-preservation.json');assert rp['exit']==0 and rp['verificationComplete']and not rp['verificationErrors']and rp['replicaRemoved']and rp['workspaceProtectedOutputsNeverOverwritten']
# Exact snapshots before and after each replica execution, with old own script bytes retained.
archive={sha(p.read_bytes()):str(p.relative_to(r))for p in(o/'instrument-originals').iterdir()if p.is_file()}
for filename,key in [('01-copied-inputs.json.gz','files'),('g04-gates.json','copiedInputs')]:
 d=obj(o/filename)
 for n,m in d[key].items():
  h=m['sha256']if isinstance(m,dict)else m
  assert meta(n)['sha256']==h or h in archive,(filename,n)
for tag in ['01-complete','02-gates','03-integrated','04-gates-repeat']:
 d=obj(o/(tag+'.status.json'));assert not d['protectedChanged'];assert d['exit']==(1 if tag=='02-gates'else 0)
 for n,h in d['inputs'].items():assert meta(n)['sha256']==h or h in archive,(tag,n)
g=obj(o/'g04-gates.json');assert g['removed']and g['freshNodeModules']and not g['workspaceChanged']and not g['replicaChanged']and len(g['results'])==9 and all(x['exit']==0 for x in g['results'])
for name,n in [('unit',208),('health',1),('migration',2),('temporal',14)]:assert capturecounts('g04-'+name+'.stdout.log.gz')=={'tests':n,'pass':n,'fail':0,'cancelled':0,'skipped':0}
a=json.loads(gzip.decompress((o/'g04-audit.stdout.log.gz').read_bytes()));assert all(v==0 for v in a['metadata']['vulnerabilities'].values())
assert capturecounts('03-integrated.stdout.log.gz')=={'tests':3,'pass':3,'fail':0,'cancelled':0,'skipped':0}
case=obj(o/'current-case-inventory.json.gz')['cases'];assert len(case)==2945 and all(c['result']=='SATISFACTORIA'for c in case)
old=obj('tests/fixtures/h5-018-sixth/current-case-inventory.json.gz')['cases'];assert Counter(x['name']for x in old)==Counter(x['name']for x in case)
cr=obj(o/'criteria-results.json');assert (cr['reviewed'],cr['satisfactory'],cr['failed'],cr['blocked'],cr['outsideScopeNotExecuted'])==(26,25,0,0,1)
assert cr['outsideScopeIds']==['AC-073']and next(x for x in cr['criteria']if x['id']=='AC-073')['localEvidenceState']=='NO EJECUTADA'
res=obj(o/'results.json');assert res['proposedVerdict']=='PASS'and res['materialDefectsOpen']==0 and not res['commit']and not res['push']and not res['deploy']and res['H6']=='NOT STARTED'and res['DM-PENDING-005']=='OPEN'
for suffix in ['', '-second','-third','-fourth','-fifth']:
 folder='tests/fixtures/h5-018'+suffix;seal=obj(folder+'/audit-seal.json');assert seal['result']=='FAIL'and sha((r/folder/'audit-inventory.json').read_bytes())==seal['inventorySha256']
sixth=obj('tests/fixtures/h5-018-sixth/audit-inventory.json')
for n,m in sixth['files'].items():assert meta(n)=={'sha256':m['sha256'],'bytes':m['bytes'],'mode':int(m['mode'],8)}
# All repository-local Markdown targets from this delivery must resolve; no Internet access.
links=0
for n in new:
 if not n.startswith('specs/')or not n.endswith('.md'):continue
 for target in re.findall(r'\]\(([^)]+)\)',(r/n).read_text()):
  if target.startswith(('http:','https:','#')):continue
  p=((r/n).parent/target.split('#')[0]).resolve();assert p.exists(),(n,target);links+=1
# Format only new human-editable source/documents. Original evidence is never normalized.
textpaths=[n for n in new if n.startswith(('scripts/','specs/','tests/integration/'))]
formatChecks=[]
for n in sorted(textpaths):
 p=subprocess.run(['git','diff','--no-index','--check','--','/dev/null',n],cwd=r,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 assert p.returncode in [0,1]and not p.stdout and not p.stderr,(n,p.stdout.decode(),p.stderr.decode());formatChecks.append(n)
if '--precheck'in sys.argv:
 print(json.dumps({'result':'PASS before seal','protectedFiles':len(base['files']),'originalsChanged':0,'localCriteriaSatisfactory':25,'reservedH6NotExecuted':1,'postgres':2945,'integration':3,'unit':208,'health':1,'linksChecked':links,'formatFilesChecked':len(formatChecks),'base':base['base'],'tree':base['tree'],'indexEmpty':True,'state':'pending sealing'}));sys.exit()
inv=o/'candidate-inventory.json';seal=o/'candidate-seal.json';excluded={str(p.relative_to(r))for p in [inv,seal]}
if '--seal'in sys.argv:
 assert not inv.exists()and not seal.exists()
 d={'base':base['base'],'tree':base['tree'],'receivedInventoryGzipSha256':sha((o/'received-inventory.json.gz').read_bytes()),'protectedFiles':len(base['files']),'scope':'H5-019 additions only; protected published baseline separate','selfMetadataExcluded':sorted(excluded),'files':{n:meta(n)for n in sorted(new-excluded)}}
 with inv.open('x')as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n')
 s={'result':'PASS proposed technical local candidate','base':base['base'],'tree':base['tree'],'inventorySha256':sha(inv.read_bytes()),'resultsSha256':sha((o/'results.json').read_bytes()),'receivedInventoryGzipSha256':d['receivedInventoryGzipSha256'],'protectedFiles':len(base['files']),'newFilesIncludingSelfMetadata':len(new-excluded)+2,'resultingFiles':len(base['files'])+len(new-excluded)+2,'postgres':2945,'newIntegration':3,'unit':208,'health':1,'newMigrationRerun':2,'newTemporalRerun':14,'criteria':{'reviewed':26,'localSatisfactory':25,'failed':0,'blocked':0,'reservedH6NotExecuted':1},'materialOpen':0,'DM-PENDING-005':'OPEN','H5-019':'IN PROGRESS pending independent audit and director acceptance','H5':'IN PROGRESS','H6':'NOT STARTED','accepted':False,'commit':False,'push':False,'deploy':False,'state':'STOP'}
 with seal.open('x')as f:json.dump(s,f,sort_keys=True,indent=2);f.write('\n')
 # Recompute universe after the two deliberate additions.
 new|=excluded
assert inv.exists()and seal.exists(),'FINAL_SEAL_REQUIRED'
s=obj(seal);iv=obj(inv);assert sha(inv.read_bytes())==s['inventorySha256']and sha((o/'results.json').read_bytes())==s['resultsSha256']
assert set(iv['files'])|excluded==new
for n,m in iv['files'].items():assert meta(n)==m,('DELIVERY_BYTES_CHANGED',n)
assert len(new)==s['newFilesIncludingSelfMetadata']and len(new)+len(base['files'])==s['resultingFiles']
print(json.dumps({'result':'PASS','base':base['base'],'tree':base['tree'],'protectedFiles':len(base['files']),'newFiles':len(new),'resultingFiles':s['resultingFiles'],'originalsChanged':0,'indexEmpty':True,'divergence':'0/0','linksChecked':links,'sourceFormatFilesChecked':len(formatChecks),'candidateInventorySha256':sha(inv.read_bytes()),'candidateSealSha256':sha(seal.read_bytes()),'functionalCommit':'published base intact plus exact captured test inputs; no new commit','state':'STOP'}))
