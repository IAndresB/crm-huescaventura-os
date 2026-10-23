"""Independent re-verification of both immutable custody packages, without payload output."""
import pathlib, json, hashlib, os, stat, subprocess, re, datetime
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'tests/fixtures/h6-bootstrap-independent'
os.umask(0o077)
def sha(p):
 h=hashlib.sha256()
 with p.open('rb')as f:
  for b in iter(lambda:f.read(1048576),b''):h.update(b)
 return h.hexdigest()
expected=json.loads((OUT/'expected-v1.json').read_text())
report={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'expectedSHA256':sha(OUT/'expected-v1.json'),'scriptSHA256':sha(pathlib.Path(__file__)),'checks':[],'packages':[]}
def check(name,value,facts=None):
 report['checks'].append({'name':str(CUSTODY.name)+':'+name,'pass':bool(value),'facts':facts})
 assert value,name
try:
 for package in expected['custody']:
      CUSTODY=pathlib.Path('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015')/package['folder']
      expected=package
      inventory=CUSTODY/'private-inventory.json'
      check('private_inventory_hash',sha(inventory)==expected['inventorySHA256'])
      entries=json.loads(inventory.read_text())
      check('inventory_count',len(entries)==expected['files'])
      paths=set(); total=0; allbytes=True; modes=True; owners=True; noLinks=True; sourceroots=set()
      for e in entries:
          source,dest=pathlib.Path(e['source']),pathlib.Path(e['destination'])
          assert source.is_absolute() and dest.is_relative_to(CUSTODY)
          assert str(source).startswith(('/tmp/h6015-','/tmp/h6pg-'))
          noLinks &= not source.is_symlink() and not dest.is_symlink()
          sm,dm=source.stat(),dest.stat()
          allbytes &= sm.st_size==dm.st_size==e['bytes'] and sha(source)==sha(dest)==e['sha256']
          modes &= stat.S_IMODE(dm.st_mode)==0o600
          owners &= dm.st_uid==os.getuid()
          total+=dm.st_size;paths.add(dest)
          sourceroots.add(pathlib.Path(*source.parts[:3]))
      check('every_source_copy_size_hash_equal',allbytes,{'files':len(entries),'bytes':total})
      check('total_bytes',total==expected['bytes'])
      check('all_payload_file_modes_0600',modes)
      check('all_payload_owned_by_current_user',owners)
      check('no_payload_symlink',noLinks)
      allpaths=[CUSTODY];walkfiles=set();dirmodes=True;allowned=True;walklinks=False
      for here,dirs,files in os.walk(CUSTODY,followlinks=False):
          p=pathlib.Path(here);dirmodes &= stat.S_IMODE(p.stat().st_mode)==0o700
          allowned &= p.stat().st_uid==os.getuid()
          for n in dirs+files:
              q=p/n;allpaths.append(q);walklinks |= q.is_symlink()
          walkfiles.update(p/n for n in files)
      check('inventory_exhaustive_for_original_package',walkfiles==paths|{inventory})
      check('all_directories_0700_and_owner',dirmodes and allowned)
      check('no_tree_symlinks',not walklinks)
      check('inventory_mode_0600',stat.S_IMODE(inventory.stat().st_mode)==0o600)
      # Native ACL listing is kept only in memory; no path or ACL line is exported.
      noAllow=True
      for i in range(0,len(allpaths),100):
          q=subprocess.run(['/bin/ls','-lde',*[str(x)for x in allpaths[i:i+100]]],capture_output=True,text=True)
          assert q.returncode==0,'ACL_READ_FAILED'
          noAllow &= not bool(re.search(r'^\s*\d+:.*\ballow\b',q.stdout,re.MULTILINE))
      check('native_acl_no_allow_entry',noAllow,{'inspectedNodes':len(allpaths)})
      report['packages'].append({'folder':CUSTODY.name,'files':len(entries),'bytes':total,'inventorySHA256':sha(inventory)})
 report['state']='PASS_INDEPENDENT_PRIOR_CUSTODY'
except Exception as e:
 report['state']='FAIL_PRESERVED';report['exceptionClass']=type(e).__name__
finally:
 (OUT/'custody-preflight-v1.json').write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps({'state':report['state'],'checks':len(report['checks']),'pass':sum(x['pass']for x in report['checks']),'packages':report['packages']}))
