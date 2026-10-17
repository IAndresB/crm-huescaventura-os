"""Append-only sixth-audit inventory; candidate and audit count families stay separate."""
from pathlib import Path
import gzip,hashlib,json,stat,subprocess,sys
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h5-018-sixth';sha=lambda b:hashlib.sha256(b).hexdigest()
def meta(path):
 p=r/path;s=p.lstat();assert stat.S_ISREG(s.st_mode)and not p.is_symlink(),path
 return {'type':'file','mode':oct(stat.S_IMODE(s.st_mode)),'bytes':s.st_size,'sha256':sha(p.read_bytes())}
def names():return set(subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z'],cwd=r).decode().strip('\0').split('\0'))
def dump(path,obj):
 with path.open('x')as f:json.dump(obj,f,indent=2,sort_keys=True);f.write('\n')
baseline=json.loads(gzip.decompress((o/'received-inventory.json.gz').read_bytes()))['files'];assert len(baseline)==38388
for n,m in baseline.items():assert meta(n)==m,('RECEIVED_CHANGED',n)
assert sha((r/'tests/fixtures/h5-017-g/candidate-seal.json').read_bytes())=='6774c3335650a5adfbf32228a220cc9051b4def0715167866ff94a7893af4df6'
invpath=o/'audit-inventory.json';sealpath=o/'audit-seal.json';excluded=[str(p.relative_to(r))for p in [invpath,sealpath]]
new=names()-set(baseline);assert all('h5-018-sixth'in n or'TSK-H5-018-sixth'in n for n in new)
if '--verify' in sys.argv:
 s=json.loads(sealpath.read_bytes());inv=json.loads(invpath.read_bytes());assert sha(invpath.read_bytes())==s['inventorySha256']
 assert set(inv['files'])|set(excluded)==new
 for n,m in inv['files'].items():assert meta(n)==m,('AUDIT_CHANGED',n)
 assert len(new)==s['auditFiles']and len(names())==s['resultingFiles'];assert s['result']=='PASS'and s['state']=='STOP'and not s['publicationAuthorized']and not s['acceptedByDirector']
 subprocess.run([sys.executable,'scripts/verify-h5-018-sixth-preservation.py'],cwd=r,check=True)
 print(json.dumps({'result':'PASS exact candidate and sixth audit verified','candidateFiles':38388,'auditFiles':len(new),'resultingFiles':len(names()),'auditInventorySha256':sha(invpath.read_bytes()),'auditSealSha256':sha(sealpath.read_bytes()),'state':'STOP'}));sys.exit()
assert not invpath.exists()and not sealpath.exists()
c=json.loads((o/'coverage.json').read_bytes());assert c['materialDefectsOpen']==0 and c['candidatePostgres']=={'tests':2945,'pass':2945,'fail':0,'cancelled':0,'skipped':0}
inv={'scope':'sixth audit additions only; candidate G is separate and fully bound','candidateFiles':38388,'candidateInventoryContentSha256':'fba4398a24834213c2fe08d2033663c08f5b26488ddfc49c5fd205a265d4f53b','candidateSealSha256':'6774c3335650a5adfbf32228a220cc9051b4def0715167866ff94a7893af4df6','selfMetadataExcluded':excluded,'files':{n:meta(n)for n in sorted(new)}};dump(invpath,inv)
s={'result':'PASS','scope':'independent technical local isolated synthetic audit','base':'9649a2773530ea8a43237b4e1f2034f80e34136f','candidate':'H5-017-G product F plus instrumentation G','candidateInventoryContentSha256':inv['candidateInventoryContentSha256'],'candidateSealSha256':inv['candidateSealSha256'],'candidateFiles':38388,'receivedFandFifth':38271,'Gadditions':117,'auditFiles':len(new)+2,'resultingFiles':38388+len(new)+2,'inventorySha256':sha(invpath.read_bytes()),'coverageSha256':sha((o/'coverage.json').read_bytes()),'candidatePostgres':c['candidatePostgres'],'ownIndependentCases':c['ownIndependentCases'],'extraHistoricalMigration66':2,'recovered303':303,'eightSpecial':8,'unit':208,'health':1,'productionVulnerabilities':0,'materialDefectsOpen':0,'candidateFilesChanged':0,'recommendation':'Accept this exact candidate in local isolated scope subject to explicit project director decision; publication remains unauthorized','acceptedByDirector':False,'publicationAuthorized':False,'commit':False,'push':False,'deploy':False,'fivePreviousAudits':'FAIL preserved','DM-PENDING-005':'OPEN','H5-017':'IN PROGRESS','H5-018':'IN PROGRESS','H5-019':'NOT STARTED','H6':'NOT STARTED','state':'STOP'};dump(sealpath,s)
print(json.dumps({'result':'SEALED','auditFiles':s['auditFiles'],'resultingFiles':s['resultingFiles'],'auditInventorySha256':s['inventorySha256'],'auditSealSha256':sha(sealpath.read_bytes())}))
