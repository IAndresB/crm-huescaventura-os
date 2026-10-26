from pathlib import Path
import hashlib,json,tarfile,stat,datetime
root=Path('.').resolve();d=root/'audit/h6-003';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();exclude={'manifest.json','seal.json','custody-receipt.json'};files=[]
for p in sorted(d.rglob('*')):
 if not p.is_file()or p.parent==d and p.name in exclude:continue
 files.append({'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p),'mode':stat.S_IMODE(p.stat().st_mode)})
m={'task':'H6-003 independent audit','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':files,'payloads':len(files),'bytes':sum(x['bytes']for x in files),'base':'0cd5f06d2efec9741906d4927318734451b01d4a','targetManifestSHA256':'3c3e1e3f78df762e2a52d5a04a5d181cb0e9b9d31b0c5b88f4c24e4a06715f83'};(d/'manifest.json').write_text(json.dumps(m,indent=2)+'\n')
c=root.parent/'receipts/h6-003-independent';c.mkdir(parents=True,exist_ok=True);archive=c/('audit-'+sha(d/'manifest.json')[:16]+'.tar.gz');assert not archive.exists()
with tarfile.open(archive,'w:gz')as tar:
 for f in files:tar.add(root/f['path'],arcname=f['path'],recursive=False)
 tar.add(d/'manifest.json',arcname='audit/h6-003/manifest.json',recursive=False)
bad=[]
with tarfile.open(archive,'r:gz')as tar:
 members=tar.getmembers();expected={x['path']:x for x in files};expected['audit/h6-003/manifest.json']={'bytes':(d/'manifest.json').stat().st_size,'sha256':sha(d/'manifest.json'),'mode':stat.S_IMODE((d/'manifest.json').stat().st_mode)}
 assert len(members)==len(expected)
 for member in members:
  f=expected[member.name];data=tar.extractfile(member).read()
  if hashlib.sha256(data).hexdigest()!=f['sha256']or len(data)!=f['bytes']or member.mode!=f['mode']:bad.append(member.name)
assert not bad
receipt={'task':'H6-003 independent audit','status':'PASS','payloads':len(files),'archiveMembers':len(members),'manifestSHA256':sha(d/'manifest.json'),'archive':str(archive),'archiveSHA256':sha(archive),'archiveBytes':archive.stat().st_size,'fullStreamReadback':True,'extracted':False,'mismatches':bad};(d/'custody-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');seal={'task':'H6-003 independent audit','verdict':'PASS_LOCAL_ISOLATED','targetManifestSHA256':m['targetManifestSHA256'],'manifestSHA256':sha(d/'manifest.json'),'verdictSHA256':sha(d/'verdict.json'),'custodyReceiptSHA256':sha(d/'custody-receipt.json'),'archiveSHA256':sha(archive),'notHumanDigitalSignature':True,'H6':'IN PROGRESS'};(d/'seal.json').write_text(json.dumps(seal,indent=2)+'\n');print(json.dumps({'sealSHA256':sha(d/'seal.json'),**receipt}))
