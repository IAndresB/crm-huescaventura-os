"""Fourth audit read-only identity, historical seal and namespace verification."""
from pathlib import Path
import gzip, hashlib, json, stat, subprocess, sys, tarfile
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'tests/fixtures/h5-018-fourth'
sha=lambda data:hashlib.sha256(data).hexdigest()
def data(name): return (ROOT/name).read_bytes()
def obj(name):
    value=data(name)
    return json.loads(gzip.decompress(value) if name.endswith('.gz') else value)
def metadata(path):
    info=path.lstat();assert stat.S_ISREG(info.st_mode) and not path.is_symlink(),str(path)
    return {'type':'file','mode':oct(stat.S_IMODE(info.st_mode)),'bytes':info.st_size,'sha256':sha(path.read_bytes())}
pre=obj('tests/fixtures/h5-018-fourth/preflight.json.gz')
assert len(pre['files'])==37758
for name,expected in pre['files'].items(): assert metadata(ROOT/name)==expected,('CANDIDATE_CHANGED',name)
e=obj('tests/fixtures/h5-017-e/candidate-seal.json')
assert e['candidateInventoryContentSha256']==pre['candidateInventorySha256']=='0e0c08b8b70da6d12c2480eb8217cdf1e5df9b640c6dd1244f153b76a3be8191'
inventories=[];seal_checks=[]
def sealed(path,filename,key,unzip=False):
    seal=obj(path);folder=str(Path(path).parent);value=data(folder+'/'+filename)
    assert sha(gzip.decompress(value) if unzip else value)==seal[key],(path,filename,key)
    seal_checks.append({'seal':path,'file':folder+'/'+filename,'key':key})
for generation in ['c','d','e']:
    path=f'tests/fixtures/h5-017-{generation}/candidate-seal.json'
    for filename,key,unzip in [('candidate-inventory.json.gz','candidateInventoryContentSha256',True),('candidate-inventory.json.gz','candidateInventoryGzipSha256',False),('delta-inventory.json','deltaInventorySha256',False)]: sealed(path,filename,key,unzip)
    if generation!='e': sealed(path,'corrected-overlay.tar.gz','correctedOverlaySha256')
    inventories.append(str(Path(path).parent/'candidate-inventory.json.gz'))
for generation in ['h5-018','h5-018-second','h5-018-third']:
    path='tests/fixtures/'+generation+'/audit-seal.json';assert obj(path)['result']=='FAIL'
    sealed(path,'audit-inventory.json','inventorySha256');inventories.append(str(Path(path).parent/'audit-inventory.json'))
sealed('tests/fixtures/h5-017/final-seal.json','candidate-inventory.json','inventorySha256');inventories.append('tests/fixtures/h5-017/candidate-inventory.json')
for filename,key,unzip in [('candidate-manifest.json.gz','completeManifestSha256',True),('candidate-manifest.json.gz','compressedManifestSha256',False),('candidate-overlay.tar.gz','overlaySha256',False)]: sealed('tests/fixtures/h5-018/candidate-seal.json',filename,key,unzip)
inventories.append('tests/fixtures/h5-018/candidate-manifest.json.gz')
archives=[tarfile.open(ROOT/path) for path in ['tests/fixtures/h5-017-d/before-d-overlay.tar.gz','tests/fixtures/h5-017-c/before-c-overlay.tar.gz','tests/fixtures/h5-018/candidate-overlay.tar.gz']]
allowed={'docs/NEXT-STEPS.md','docs/PROJECT-STATUS.md','specs/001-core-crm/tasks.md','src/server/composition.ts'}
history=[]
for path in inventories:
    recovered=[];files=obj(path)['files']
    for name,m in files.items():
        current=pre['files'][name]
        if all(current[k]==value for k,value in m.items() if k in current):continue
        assert name in allowed,(path,name)
        found=False
        for archive in archives:
            try:
                member=archive.getmember(name);value=archive.extractfile(member).read()
                if sha(value)==m['sha256'] and len(value)==m['bytes'] and oct(member.mode)==m['mode']:
                    recovered.append({'path':name,'archive':str(Path(archive.name).relative_to(ROOT)),'sha256':sha(value)});found=True;break
            except KeyError:pass
        if not found and name=='src/server/composition.ts':
            value=subprocess.check_output(['git','show',pre['base']+':'+name],cwd=ROOT)
            if sha(value)==m['sha256'] and len(value)==m['bytes']:found=True;recovered.append({'path':name,'gitBase':pre['base'],'sha256':sha(value)})
        assert found,('UNRECOVERED_HISTORICAL_CONTENT',path,name)
    history.append({'inventory':path,'files':len(files),'currentExact':len(files)-len(recovered),'recoveredPriorVersions':recovered})
for archive in archives:archive.close()
h16=obj('tests/fixtures/h5-016/final-inputs.json')['inputs'];assert len(h16)==456
changed=[name for name,digest in h16.items() if pre['files'][name]['sha256']!=digest];assert changed==['src/server/composition.ts']
assert h16[changed[0]]=='fd86f3f2246ce0988eb0393f256b7d5b25024f9a7ff58791210225850d1fc879'
assert pre['files'][changed[0]]['sha256']=='31d18d77cbbbe85d1e9ece965c6cdf098802fd114795095315d08f586716bd1d'
frozen=obj('tests/fixtures/h5-018-fourth/expected-seal.json');assert sha(data(frozen['path']))==frozen['sha256']
norm=obj('tests/fixtures/h5-018-fourth/normative-sources.json');assert len(norm['tasksAssignments'])==13
assert all(sha(data(name))==digest for name,digest in norm['sources'].items())
for ref in ['HEAD','main','origin/main']:assert subprocess.check_output(['git','rev-parse',ref],cwd=ROOT).decode().strip()==pre['base']
assert subprocess.check_output(['git','rev-list','--left-right','--count','main...origin/main'],cwd=ROOT).decode().split()==['0','0']
assert not subprocess.check_output(['git','diff','--cached','--name-only'],cwd=ROOT)
subprocess.run(['git','diff','--check'],cwd=ROOT,check=True)
names=set(subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z'],cwd=ROOT).decode().strip('\0').split('\0'))
assert set(pre['files'])<=names
new=sorted(names-set(pre['files']))
for name in new:assert 'h5-018-fourth' in name or 'TSK-H5-018-fourth' in name,('UNAUTHORIZED_NEW_FILE',name)
result={'result':'PASS preservation','candidateEFilesUnchanged':37758,'newAuditFiles':new,'newAuditFileCount':len(new),'modifiedCandidateFiles':[],'deletedCandidateFiles':[],'historicalInventories':history,'sealChecks':seal_checks,'migrations1to67Preserved':True,'h5016Inputs':456,'h5016Identical':455,'authorizedCompositionTransition':changed,'historicalAuditsRemainFAIL':3,'base':pre['base'],'divergence':'0/0','indexEmpty':True}
if len(sys.argv)>1:
    path=OUT/(sys.argv[1]+'.json');assert not path.exists();path.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({key:value for key,value in result.items() if key not in ['newAuditFiles','historicalInventories','sealChecks']}))
