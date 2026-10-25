from pathlib import Path
import hashlib,json,subprocess,stat,datetime
base='0cd5f06d2efec9741906d4927318734451b01d4a'
candidate=Path('/Users/andres/.codex/worktrees/h6-017-local-isolated/crm-huescaventura-os')
out=Path('audit/h6-017');rows=[];issues=[];total=0
records=subprocess.check_output(['git','ls-tree','-rz','--full-tree',base]).split(b'\0')
for record in records:
 if not record:continue
 meta,raw=record.split(b'\t',1);mode,kind,oid=meta.decode().split();name=raw.decode();p=candidate/name
 try:
  payload=p.read_bytes() if mode!='120000' else str(p.readlink()).encode();actual=hashlib.sha1(b'blob '+str(len(payload)).encode()+b'\0'+payload).hexdigest()
  valid=actual==oid;permitted=mode!='100755' or bool(p.stat().st_mode&0o111)
  if not valid or not permitted:issues.append({'path':name,'base':oid,'observedGitBlob':actual,'modeCorrect':permitted})
  rows.append({'path':name,'gitBlob':actual,'sha256':hashlib.sha256(payload).hexdigest(),'bytes':len(payload),'mode':mode});total+=len(payload)
 except Exception as e:issues.append({'path':name,'error':str(e)})
raw=('\n'.join(json.dumps(r,sort_keys=True) for r in rows)+'\n').encode();(out/'base-independent-inventory.jsonl').write_bytes(raw)
result={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base':base,'candidate':str(candidate),'method':'Independent SHA1 Git blob reconstruction against immutable base ls-tree plus own SHA256 readback; no implementer manifest oracle','files':len(rows),'bytes':total,'issues':issues,'inventorySha256':hashlib.sha256(raw).hexdigest(),'PASS':not issues}
(out/'base-independent-readback.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
