from pathlib import Path
import json,hashlib,subprocess,tarfile,datetime,os
r=Path(__file__).resolve().parent.parent;o=r/'tests/fixtures/h6-005';sha=lambda b:hashlib.sha256(b).hexdigest();excluded={'tests/fixtures/h6-005/technical-manifest.json','tests/fixtures/h6-005/technical-seal.json','tests/fixtures/h6-005/technical-custody-readback.json'}
rows=[]
for b in subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=r).split(b'\0'):
 if not b:continue
 p=b.decode()
 if p in excluded or p.startswith('tests/fixtures/h6-005/custody/'):continue
 f=r/p
 assert f.is_file() and not f.is_symlink();rows.append({'path':p,'bytes':f.stat().st_size,'mode':oct(f.stat().st_mode&0o777),'sha256':sha(f.read_bytes())})
manifest={'schema':'H6005-technical-candidate-v1','task':'TSK-H6-005','base':subprocess.check_output(['git','rev-parse','HEAD'],cwd=r,text=True).strip(),'files':sorted(rows,key=lambda x:x['path']),'excludedSelfAndCustody':sorted(excluded),'formalState':'IN PROGRESS pending independent audit,acceptance and final custody','productChanges':False};mp=o/'technical-manifest.json';mp.write_text(json.dumps(manifest,indent=2)+'\n')
c=o/'custody';c.mkdir(exist_ok=True);archive=c/'h6-005-technical-v1.tar.gz'
with tarfile.open(archive,'w:gz') as tf:
 for x in manifest['files']:tf.add(r/x['path'],arcname=x['path'],recursive=False)
 tf.add(mp,arcname=str(mp.relative_to(r)),recursive=False)
errors=[]
with tarfile.open(archive,'r:gz') as tf:
 members=tf.getmembers();assert len(members)==len(rows)+1
 for x in manifest['files']:
  m=tf.getmember(x['path']);data=tf.extractfile(m).read()
  if len(data)!=x['bytes'] or sha(data)!=x['sha256'] or oct(m.mode&0o777)!=x['mode']:errors.append(x['path'])
 assert tf.extractfile(str(mp.relative_to(r))).read()==mp.read_bytes()
seal={'schema':'H6005-technical-seal-v1','task':'TSK-H6-005','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'candidateManifestSHA256':sha(mp.read_bytes()),'candidateFiles':len(rows),'archive':str(archive.relative_to(r)),'archiveSHA256':sha(archive.read_bytes()),'archiveBytes':archive.stat().st_size,'archiveMembers':len(rows)+1,'allMembersReadback':'PASS' if not errors else 'FAIL','audit':'PENDING independent61400–61449','complete':False,'GitCommitPushMerge':False};(o/'technical-seal.json').write_text(json.dumps(seal,indent=2)+'\n');(o/'technical-custody-readback.json').write_text(json.dumps({'status':'PASS' if not errors else 'FAIL','errors':errors,'members':len(rows)+1,'manifestSHA256':seal['candidateManifestSHA256'],'archiveSHA256':seal['archiveSHA256']},indent=2)+'\n');print(json.dumps(seal,indent=2));assert not errors
