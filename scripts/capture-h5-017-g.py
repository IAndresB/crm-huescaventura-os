"""Append-only audit capture. Candidate hashes and exact own instrument inputs."""
from pathlib import Path
import gzip,hashlib,json,os,re,subprocess,sys,time
root=Path(__file__).resolve().parents[1];out=root/'tests/fixtures/h5-017-g'
label=sys.argv[1];command=sys.argv[2:]
assert re.fullmatch('[a-z0-9-]+',label) and not (out/(label+'.status.json')).exists()
baseline=json.loads(gzip.decompress((out/'received-inventory.json.gz').read_bytes()))['files']
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def check():
 return [n for n,v in baseline.items() if not (root/n).is_file() or digest(root/n)!=v['sha256'] or (root/n).stat().st_size!=v['bytes'] or oct((root/n).stat().st_mode&0o777)!=v['mode']]
assert not check(),'CANDIDATE_CHANGED_BEFORE_RUN'
inputs={str(p.relative_to(root)):digest(p) for folder in ['src','supabase/migrations','tests/integration','tests/support','scripts'] for p in (root/folder).rglob('*') if p.is_file()}
env=os.environ.copy();env['POSTGRES_H0_BIN']='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin'
started=time.time();p=subprocess.run(command,cwd=root,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
counts={k:int(m[-1])for k in ['tests','pass','fail','cancelled','skipped']if(m:=re.findall(r'(?:ℹ|#) '+k+r' (\d+)',p.stdout.decode(errors='replace')))}
changed=check();data={'command':command,'started':started,'finished':time.time(),'exit':p.returncode,'counts':counts,'candidateChanged':changed,'inputs':inputs}
for name,value in [('stdout',p.stdout),('stderr',p.stderr)]:
 with (out/(label+'.'+name+'.log.gz')).open('xb') as f:f.write(gzip.compress(value,mtime=0))
with (out/(label+'.status.json')).open('x') as f:json.dump(data,f,indent=2);f.write('\n')
print(json.dumps({k:v for k,v in data.items()if k!='inputs'}));print(p.stdout.decode(errors='replace')[-2500:]);print(p.stderr.decode(errors='replace')[-1500:])
sys.exit(98 if changed else p.returncode)
