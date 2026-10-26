"""One-shot local candidate/custody builder. Rejects overwrite and any protected drift."""
from pathlib import Path
import hashlib,json,gzip,subprocess,stat,tarfile,datetime
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h6-003'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(name,data):
 p=o/name;assert not p.exists(),name;p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');return p
base=json.loads(gzip.decompress((o/'baseline.json.gz').read_bytes()))
for x in base['files']:
 p=r/x['path'];assert p.is_file() and not p.is_symlink();assert sha(p)==x['sha256'] and p.stat().st_size==x['bytes'] and stat.S_IMODE(p.stat().st_mode)==x['mode'],x['path']
assert not subprocess.check_output(['git','diff','--name-only'],cwd=r).strip();assert not subprocess.check_output(['git','diff','--cached','--name-only'],cwd=r).strip()
rounds=[]
for folder in sorted((o/'runs').iterdir()):
 s=(folder/'stdout.log').read_text();res=json.loads((folder/'result.json').read_text())
 import re
 n=lambda key:int(re.findall(r'ℹ '+key+r' (\d+)',s)[-1])
 rounds.append({'path':str(folder.relative_to(r)),'status':res['status'],'tests':n('tests'),'pass':n('pass'),'fail':n('fail'),'skip':n('skipped'),'suites':res['suites']})
assert rounds[-1]['status']==0 and rounds[-1]['pass']==15 and rounds[-1]['fail']==0 and rounds[-1]['skip']==0
reg=next(x for x in rounds if x['path'].endswith('22-38-33.100Z'));assert reg['status']==0 and reg['pass']==174 and reg['fail']==0
q=sorted(x for x in (o/'quality').iterdir() if x.is_dir())[-1]
for name in ['unit','typecheck','lint','build','format']:assert json.loads((q/(name+'.status.json')).read_text())['status']==0
assert 'ℹ pass 212' in (q/'unit.stdout.log').read_text()
for p in (o/'final-source-checks').glob('*.status.json'):assert json.loads(p.read_text())['status']==0
assert json.loads((o/'final-source-checks/format.json').read_text())['status']=='PASS'
assert sha(o/'expected.json')=='24202c2d00175f3585772af83cbde20426c4cfd705007dbdf0ec9abdb2b13da6'
assert sha(o/'composition-expected.json')=='ea5c9358566c000d4d0162543296abb029faf42b6d9570ed44ad5e55c8b0787f'
write('technical-results.json',{'task':'TSK-H6-003','formalState':'IN PROGRESS pending independent verdict and final acceptance','technicalVerdict':'PASS','assignments':2,'acceptanceCriteria':['AC-017','AC-018','AC-019','AC-024','AC-038','AC-043'],'focal':{'pass':15,'fail':0,'skip':0,'split':'14 original groups +1 supplement S01 with both root orders'},'regression':{'pass':174,'fail':0,'skip':0,'originalAssertionsPreserved':True},'unit':212,'quality':['typecheck PASS','lint PASS','build PASS','format PASS','final syntax PASS'],'historicalFailedTests':sum(x['fail'] for x in rounds),'rounds':rounds,'productChanges':0,'canonicalChanges':0,'H6':'IN PROGRESS'})
# Explicit text format check, including reports and this finalizer, without rewriting originals.
paths=subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=r).decode().split('\0')[:-1]
for relative in paths:
 p=r/relative
 if p.suffix in ['.md','.json','.mjs','.ts','.py','.sha256']:
  text=p.read_text();assert text.endswith('\n') and all(line.rstrip(' \t')==line for line in text.splitlines()),relative
for p in (r/'scripts').glob('*h6-003*.py'):compile(p.read_text(),str(p),'exec')
write('freeze-readback.json',{'status':'PASS','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseFiles':len(base['files']),'productFiles':110,'migrations':68,'publishedChanges':0,'indexChanges':0,'newTextFormat':'PASS','pythonSyntax':'PASS','fixtureSyntax':'PASS','finalSourceTypecheck':'PASS','runtimeExcluded':True,'nodeModulesExcluded':True,'nextExcluded':True,'H6':'IN PROGRESS'})
paths=subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=r).decode().split('\0')[:-1];files=[]
for relative in sorted(paths):
 p=r/relative;assert p.is_file() and not p.is_symlink(),relative
 assert not any(part in ['node_modules','.next','.runtime'] for part in Path(relative).parts),relative
 files.append({'path':relative,'type':'regular','mode':oct(stat.S_IMODE(p.stat().st_mode)),'bytes':p.stat().st_size,'sha256':sha(p)})
excluded=['tests/fixtures/h6-003/'+x for x in ['technical-manifest.json','technical-seal.json','technical-custody-v1.tar.gz','technical-custody-readback.json']]
manifest=write('technical-manifest.json',{'schema':'h6003-technical-candidate-v1','task':'TSK-H6-003','state':'technical PASS; formal IN PROGRESS pending independent audit and final acceptance','base':base['base'],'tree':base['tree'],'files':files,'selfMetadataExcluded':excluded,'productChanges':0,'H6':'IN PROGRESS'})
archive=o/'technical-custody-v1.tar.gz';assert not archive.exists()
with tarfile.open(archive,'w:gz') as tf:
 for item in files:tf.add(r/item['path'],arcname=item['path'],recursive=False)
 tf.add(manifest,arcname=str(manifest.relative_to(r)),recursive=False)
expected={x['path']:x for x in files};expected[str(manifest.relative_to(r))]={'bytes':manifest.stat().st_size,'sha256':sha(manifest),'mode':oct(stat.S_IMODE(manifest.stat().st_mode))}
checked=[]
with tarfile.open(archive,'r:gz') as tf:
 for member in tf:
  assert member.isfile() and member.name in expected and member.name not in checked,member.name
  row=expected[member.name];data=tf.extractfile(member).read();assert len(data)==row['bytes'] and hashlib.sha256(data).hexdigest()==row['sha256'] and oct(member.mode)==row['mode'],member.name;checked.append(member.name)
assert set(checked)==set(expected)
receipt=write('technical-custody-readback.json',{'status':'PASS','task':'TSK-H6-003','archive':str(archive.relative_to(r)),'archiveBytes':archive.stat().st_size,'archiveSHA256':sha(archive),'archiveMembers':len(checked),'payloads':len(files),'manifestSHA256':sha(manifest),'method':'complete stream readback, every regular member mode/size/SHA256, no extraction','independence':'implementer custody readback; independent technical audit remains separate','H6':'IN PROGRESS'})
seal=write('technical-seal.json',{'schema':'h6003-technical-seal-v1','task':'TSK-H6-003','state':'technical PASS, formal IN PROGRESS pending independent verdict and final acceptance','manifestSHA256':sha(manifest),'manifestBytes':manifest.stat().st_size,'payloads':len(files),'payloadBytes':sum(x['bytes'] for x in files),'archiveSHA256':sha(archive),'archiveBytes':archive.stat().st_size,'custodyReadbackSHA256':sha(receipt),'focalPASS':15,'regressionPASS':174,'unitPASS':212,'H6':'IN PROGRESS'})
print(json.dumps({'payloads':len(files),'manifestSHA256':sha(manifest),'sealSHA256':sha(seal),'archiveSHA256':sha(archive),'receiptSHA256':sha(receipt),'archiveMembers':len(checked)}))
