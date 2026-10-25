from pathlib import Path
import json,hashlib,tarfile,datetime
root=Path('/Users/andres/.codex/worktrees/h6-017-local-isolated/crm-huescaventura-os');a=Path('/Users/andres/.codex/worktrees/h6-017-local-isolated/receipts/h6-017-custody/technical-93d8bece86fd8ba8.tar.gz');expected='105834592356543bfdfac2cedc0a5d6d442a6598ba065a713615163735db7dcf';m=json.loads((root/'tests/fixtures/h6-017/technical-manifest.json').read_text());rows={r['path']:r for r in m['files']};errors=[];seen=[]
if hashlib.sha256(a.read_bytes()).hexdigest()!=expected:errors.append('archive-hash')
with tarfile.open(a)as archive:
 for member in archive.getmembers():
  name=member.name
  if member.isdir():continue
  if not member.isfile()or Path(name).is_absolute()or '..'in Path(name).parts:errors.append('unsafe-member:'+name);continue
  b=archive.extractfile(member).read();seen.append(name)
  if name in rows:
   r=rows[name]
   if len(b)!=r['bytes']or hashlib.sha256(b).hexdigest()!=r['sha256']:errors.append('payload:'+name)
  elif name=='tests/fixtures/h6-017/technical-manifest.json':
   if hashlib.sha256(b).hexdigest()!='93d8bece86fd8ba8a6e6fa6bb0d3d33f850c6ae47dc583c55018515437c44d7b':errors.append('embedded-manifest')
  elif name=='tests/fixtures/h6-017/technical-manifest.sha256':
   if b.decode().split()[0]!='93d8bece86fd8ba8a6e6fa6bb0d3d33f850c6ae47dc583c55018515437c44d7b':errors.append('embedded-seal')
  else:errors.append('unexpected:'+name)
 if len(seen)!=147 or len(set(seen))!=147 or not set(rows).issubset(seen):errors.append('inventory')
r={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'Independent whole archive hash and safe streaming of every member; no extraction or receipt PASS oracle','archive':str(a),'sha256':expected,'bytes':a.stat().st_size,'members':len(seen),'payloadsVerified':len(rows),'issues':errors,'PASS':not errors};Path('audit/h6-017/archive-independent-readback.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
