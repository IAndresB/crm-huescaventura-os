"""Append-only reproducible inventory for product F + protected audit5 + G instrumentation/evidence."""
from pathlib import Path
import gzip,hashlib,json,stat,subprocess,sys
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h5-017-g'
def sha(b):return hashlib.sha256(b).hexdigest()
def save(p,v,compressed=False):
 raw=(json.dumps(v,sort_keys=True,indent=2)+'\n').encode();data=gzip.compress(raw,mtime=0)if compressed else raw
 with p.open('xb')as f:f.write(data)
 return sha(raw),sha(data)
subprocess.run([sys.executable,str(r/'scripts/verify-h5-017-g-preservation.py')],cwd=r,check=True)
c=json.loads((o/'current-coverage.json').read_bytes());assert c['complete']=={'tests':2945,'pass':2945,'fail':0,'cancelled':0,'skipped':0}and c['materialDefectsOpen']==0
received=json.loads(gzip.decompress((o/'received-inventory.json.gz').read_bytes()))['files'];assert len(received)==38271
names=set(subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z'],cwd=r).decode().strip('\0').split('\0'))
excluded=['tests/fixtures/h5-017-g/candidate-inventory.json.gz','tests/fixtures/h5-017-g/candidate-seal.json'];assert not any((r/n).exists()for n in excluded)
def metadata(n):
 p=r/n;s=p.lstat();assert stat.S_ISREG(s.st_mode)and not p.is_symlink();return {'type':'file','mode':oct(stat.S_IMODE(s.st_mode)),'bytes':s.st_size,'sha256':sha(p.read_bytes())}
new=sorted(names-set(received));assert all('h5-017-g'in n or 'TSK-H5-017-G'in n for n in new)
delta={n:metadata(n)for n in new}
deltaSha,_=save(o/'delta-inventory.json',{'kind':'G newly added only','files':delta,'receivedUnchanged':38271,'receivedModified':0,'receivedDeleted':0,'finalMetadataExcluded':excluded,'selfExcluded':'tests/fixtures/h5-017-g/delta-inventory.json'})
names.add('tests/fixtures/h5-017-g/delta-inventory.json');files={n:metadata(n)for n in sorted(names)}
contentSha,gzipSha=save(o/'candidate-inventory.json.gz',{'base':'9649a2773530ea8a43237b4e1f2034f80e34136f','files':files,'selfMetadataExcluded':excluded,'totalIncludingSelfMetadata':len(files)+2,'classification':{'productF':38118,'protectedFifthAudit':153,'GNewIncludingMetadata':len(files)+2-38271}},True)
seal={'candidate':'H5-017-G: product F unchanged + separate temporal instrumentation','result':'PASS internal local isolated','base':'9649a2773530ea8a43237b4e1f2034f80e34136f','Ffiles':38118,'fifthAuditFiles':153,'protectedReceived':38271,'GnewFiles':len(files)+2-38271,'totalFiles':len(files)+2,'modifiedReceived':0,'deletedReceived':0,'candidateInventoryContentSha256':contentSha,'candidateInventoryGzipSha256':gzipSha,'deltaInventorySha256':deltaSha,'FSealSha256':'da14b2ba3cf0767b9b807c2cf12c8edbca0b0a221bc7c2f70e11d3f7a42dd9dd','fifthAuditSealSha256':'dcd6a2ad70c72b6e22c52c95230155df76e775a47bb3b2a88d9fe3d025887dea','coverageSha256':sha((o/'current-coverage.json').read_bytes()),'caseInventoryContentSha256':c['caseInventoryContentSha256'],'postgres':c['complete'],'postgresFiles':196,'disjointPhases':15,'candidateFRegression':2920,'fifthCases':15,'newGCases':10,'eightIndividuallyClassified':8,'unit':208,'health':1,'productionVulnerabilities':0,'materialDefectsOpen':0,'H5-018-5-F01':'RESOLVED IN G INSTRUMENTATION; independent audit required','fifthAuditResultPreserved':'FAIL','acceptanceRecommendation':'new independent H5-018 audit only; no acceptance/publication recommendation','accepted':False,'publicationAuthorized':False,'commit':False,'push':False,'deploy':False,'H5017':'IN PROGRESS','H5018':'IN PROGRESS','DM-PENDING-005':'OPEN','H5019':'NOT STARTED','H6':'NOT STARTED','state':'STOP'}
sealSha,_=save(o/'candidate-seal.json',seal)
print(json.dumps({'result':'PASS G sealed','inventoryContentSha256':contentSha,'inventoryGzipSha256':gzipSha,'sealSha256':sealSha,'GnewFiles':seal['GnewFiles'],'totalFiles':seal['totalFiles'],'state':'STOP'}))
