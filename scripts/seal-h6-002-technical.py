from pathlib import Path
import hashlib,json,subprocess,re,stat
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h6-002'
runs=sorted(x for x in (o/'runs').iterdir() if x.is_dir());final=runs[-1];res=json.loads((final/'result.json').read_text());assert res['status']==0
s=(final/'stdout.log').read_text();assert 'ℹ pass 14' in s and 'ℹ fail 0' in s and 'ℹ skipped 0' in s
reg=o/'runs/2026-10-25T22-12-34.990Z/stdout.log';rs=reg.read_text();assert 'ℹ pass 141' in rs and 'ℹ fail 1' in rs
assert len(re.findall(r'^✔ R',rs,re.M))==128
q=sorted(x for x in (o/'quality').iterdir() if x.is_dir())[-1]
for n in ['unit','typecheck','lint','build','format']:assert json.loads((q/(n+'.status.json')).read_text())['status']==0
assert 'tsc --noEmit' in (o/'quality/typecheck-final.stderr.log').read_text()
assert 'error TS' not in (o/'quality/typecheck-final.stdout.log').read_text()
summary={'task':'TSK-H6-002','formalState':'IN PROGRESS pending independent verdict/custody','technicalVerdict':'PASS','assignments':5,'functional':{'pass':14,'fail':0,'skip':0,'originalLog':str((final/'stdout.log').relative_to(r))},'regression':{'pass':128,'fail':0,'skip':0,'originalCombinedRunStatus':1,'combinedRun':str(reg.relative_to(r)),'combinedFail':'F13 monitoring visibility only; independently corrected/retested focal; original retained'},'quality':{'unit':212,'typecheck':'PASS','lint':'PASS','build':'PASS','format':'PASS'},'historicalInstrumentTestFailures':3,'preparationFailureReceipts':1,'productChanges':0,'H6':'IN PROGRESS'}
p=o/'technical-results.json';assert not p.exists();p.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
paths=subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=r).decode().split('\0')[:-1]
rows=[]
for relative in sorted(paths):
 p=r/relative;assert p.is_file() and not p.is_symlink();b=p.read_bytes()
 if p.suffix in ['.md','.json','.mjs','.ts','.py','.patch','.sha256']:
  s=p.read_text();assert s.endswith('\n') and all(x.rstrip(' \t')==x for x in s.splitlines()),relative
 rows.append({'path':relative,'type':'regular','mode':stat.S_IMODE(p.stat().st_mode),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
manifest={'task':'TSK-H6-002','schema':'h6002-technical-candidate-v1','state':'technical PASS; formal IN PROGRESS pending audit/custody','base':'0cd5f06d2efec9741906d4927318734451b01d4a','tree':'8b184d1d470a3bf190dee14499369fe9c665ab3d','files':rows,'exclusions':['tests/fixtures/h6-002/technical-manifest.json','tests/fixtures/h6-002/technical-seal.json'],'publishedChanges':0,'H6':'IN PROGRESS'}
p=o/'technical-manifest.json';assert not p.exists();p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');h=hashlib.sha256(p.read_bytes()).hexdigest()
seal={'task':'TSK-H6-002','manifestSHA256':h,'payloads':len(rows),'payloadBytes':sum(x['bytes'] for x in rows),'expectedSHA256':'54259b995151c96054c80a03ee1df10bcf2233ef3ba4af1e8ede2ce4b81e4526','formalState':'IN PROGRESS pending independent audit and custody','H6':'IN PROGRESS'}
p=o/'technical-seal.json';assert not p.exists();p.write_text(json.dumps(seal,indent=2)+'\n');print(json.dumps({'manifest':h,'seal':hashlib.sha256(p.read_bytes()).hexdigest(),'payloads':len(rows)}))
