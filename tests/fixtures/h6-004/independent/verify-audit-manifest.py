from pathlib import Path
import sys,json,hashlib
p=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).with_name('audit-manifest-v1.json')
d=json.loads(p.read_text());errors=[];seen=set()
for entry in d['entries']:
 rel=Path(entry['path']);f=p.parent/rel
 if rel.is_absolute() or '..' in rel.parts or str(rel) in seen:errors.append({'path':str(rel),'error':'unsafe or duplicate path'});continue
 seen.add(str(rel))
 if not f.is_file() or f.is_symlink():errors.append({'path':str(rel),'error':'missing or symlink'});continue
 b=f.read_bytes()
 if len(b)!=entry['bytes'] or hashlib.sha256(b).hexdigest()!=entry['sha256']:errors.append({'path':str(rel),'error':'size/hash mismatch'})
print(json.dumps({'status':'FAIL' if errors else 'PASS','manifest':str(p),'manifestSHA256':hashlib.sha256(p.read_bytes()).hexdigest(),'entries':len(d['entries']),'bytes':sum(x['bytes'] for x in d['entries']),'errors':errors},indent=2))
sys.exit(bool(errors))
