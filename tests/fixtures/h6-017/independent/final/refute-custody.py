from pathlib import Path
import json,hashlib,subprocess,datetime
root=Path('/Users/andres/.codex/worktrees/h6-017-local-isolated/crm-huescaventura-os');out=Path('audit/h6-017')
claimed=json.loads((root/'tests/fixtures/h6-017/preservation/readback-v3.json').read_text())
anchor=json.loads((root/'tests/fixtures/h6-007-local-acceptance/core-custody-v1.json').read_text());expected=next(r['detail']['manifests'] for r in anchor['checks'] if r['id']=='C10_H6015_16_4568')
issues=[];seen=0;entries=0;resolutions=[]
for original in expected:
 mpath=original['manifest'];data=(root/mpath).read_bytes();sha=hashlib.sha256(data).hexdigest()
 if sha!=original['sha256']:issues.append({'manifest':mpath,'issue':'original-manifest-identity'})
 body=json.loads(data);rows=body.get('files',body.get('inputs',[]))
 if isinstance(rows,dict):rows=[{'path':k,**v} for k,v in rows.items()]
 # Custodian provides locators only; expected hashes/counts come from preserved original manifests.
 locator=next(r for r in claimed['H6015']['packages'] if r['manifest']==mpath);locations={r['path']:r['resolved'] for r in locator['resolutions']}
 if len(rows)!=original['entries']:issues.append({'manifest':mpath,'issue':'original-count'})
 for r in rows:
  name=r['path'];location=locations.get(name,'')
  try:
   if Path(name).is_absolute() or '..' in Path(name).parts:raise ValueError('unsafe-manifest-path')
   if location.startswith('snapshot-identical:'):
    revision,path=location[len('snapshot-identical:'):].split(':',1);b=subprocess.check_output(['git','show',revision+':'+path]);source='Git snapshot '+revision
   elif location.startswith('snapshot:'):
    revision,path=location[len('snapshot:'):].split(':',1);b=subprocess.check_output(['git','show',revision+':'+path]);source='Git snapshot '+revision
   elif location.startswith('published-canonical-identical:'):
    p=root/location.split(':',1)[1];b=p.read_bytes();source='immutable published path'
   else:
    p=Path(location)
    if not p.is_absolute() or not str(p).startswith('/Users/andres/.codex/worktrees/'):raise ValueError('outside documentary worktree roots')
    if '/runtime/' in str(p) or p.name in ['runtime.env','config.env']:raise ValueError('runtime-prohibited')
    b=p.read_bytes();source='documentary worktree path'
   actual=hashlib.sha256(b).hexdigest()
   if r.get('sha256') and actual!=r['sha256']:issues.append({'manifest':mpath,'path':name,'issue':'payload-sha256'})
   if isinstance(r.get('bytes'),int) and len(b)!=r['bytes']:issues.append({'manifest':mpath,'path':name,'issue':'payload-bytes'})
   entries+=1
  except Exception as e:issues.append({'manifest':mpath,'path':name,'issue':str(e)})
 resolutions.append({'manifest':mpath,'sha256':sha,'entries':len(rows)});seen+=1
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'Read original accepted H6-007 anchor and H6-015 manifest payload hashes; independently fetch actual bytes at documentary locators or Git snapshot; custodian status/summary not oracle','manifests':seen,'payloads':entries,'issues':issues,'noRuntime':True,'noSQL':True,'S11':False,'reentry':False,'PASS':not issues,'manifestReadback':resolutions}
(out/'custody-independent-refutation.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items()if k!='manifestReadback'}))
