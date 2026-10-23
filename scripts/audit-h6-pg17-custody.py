"""Read-only, independent custody and diagnostic identity verification. No payload output."""
import pathlib, json, hashlib, os, stat, subprocess, re, datetime

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'tests/fixtures/h6-pg17-independent'
EXEC=pathlib.Path('/Users/andres/.codex/worktrees/h6-pg17-corrective/crm-huescaventura-os')
CUSTODY=pathlib.Path('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-pg17')
os.umask(0o077)
def sha(p):
    h=hashlib.sha256()
    with p.open('rb')as f:
        for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
    return h.hexdigest()
expected={'custodyInventorySHA256':'7cd26c6f47df84ec41aac22171c2a502ff0a404e428fd204f7481b627719bdc9',
          'files':32754,'bytes':1172113768,'fileMode':0o600,'directoryMode':0o700,
          'sourceAndCopyEqual':True,'allowACLs':False,'symlinks':False,
          'diagnosticExpectedSHA256':'6901d4027685963fdd2e93eac2d009c64b2e44bac07dd366e0062f488aeec83f',
          'diagnosticScope':'PASS_DIAGNOSIS_BLOCK_CONFIRMED_NOT_RESTORE','S11':'NOT_EXECUTED'}
ep=OUT/'custody-expected-v1.json'
assert not ep.exists()
ep.write_text(json.dumps(expected,indent=2)+'\n')
report={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'expectedSHA256':sha(ep),
        'scriptSHA256':sha(pathlib.Path(__file__)),'checks':[],'scope':'Read-only full custody and executor diagnosis identity; no acceptance of restore'}
def check(name,value,facts=None):
    report['checks'].append({'name':name,'pass':bool(value),'facts':facts})
    assert value,name
try:
    inventory=CUSTODY/'private-inventory.json'
    check('private_inventory_hash',sha(inventory)==expected['custodyInventorySHA256'])
    entries=json.loads(inventory.read_text())
    check('inventory_count',len(entries)==expected['files'])
    paths=set(); total=0; allbytes=True; modes=True; owners=True; noLinks=True; sourceroots=set()
    for e in entries:
        source,dest=pathlib.Path(e['source']),pathlib.Path(e['destination'])
        assert source.is_absolute() and dest.is_relative_to(CUSTODY)
        assert str(source).startswith('/tmp/h6015-')
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
    r=EXEC/'tests/fixtures/h6-015-pg17-corrective/diagnosis-1792678004452660000.json'
    d=json.loads(r.read_text());x=EXEC/'tests/fixtures/h6-015-pg17-corrective/expected-v1.json'
    check('executor_expected_lock',sha(x)==expected['diagnosticExpectedSHA256']==d['expectedSHA256'])
    check('executor_script_lock',sha(EXEC/'scripts/h6-015-pg17-diagnosis.py')==d['scriptSHA256'])
    check('executor_report_scope_and_42_checks',d['state']==expected['diagnosticScope'] and len(d['checks'])==42 and all(x['status']=='PASS'for x in d['checks']) and d['S11']=='NOT_EXECUTED' and not d['taskCompleted'])
    for kind,digest in d['inputHashes'].items():
        check(kind+'_historic_globals_hash',sha(pathlib.Path('/tmp/h6015-KbfYWL')/(kind+'-globals.sql'))==digest)
    report['diagnosisReportSHA256']=sha(r)
    report['privateInventorySHA256']=sha(inventory)
    report['state']='PASS_INDEPENDENT_CUSTODY_AND_DIAGNOSIS_SCOPE'
except Exception as e:
    report['state']='FAIL_PRESERVED';report['failureClass']=type(e).__name__
finally:
    (OUT/'custody-and-diagnosis-review-v1.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'state':report['state'],'checks':len(report['checks']),'pass':sum(x['pass']for x in report['checks'])}))
