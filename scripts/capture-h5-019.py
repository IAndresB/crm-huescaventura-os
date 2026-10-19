"""Append-only H5-019 captures; protected published bytes are never regenerated."""
from pathlib import Path
import gzip,hashlib,json,os,re,subprocess,sys,time
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h5-019'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def protected():
 b=json.loads(gzip.decompress((o/'received-inventory.json.gz').read_bytes()))
 return [n for n,m in b['files'].items()if not (r/n).is_file() or sha(r/n)!=m['sha256'] or (r/n).stat().st_size!=m['bytes'] or ((r/n).stat().st_mode&0o777)!=m['mode']]
label=sys.argv[1];command=sys.argv[2:];assert re.fullmatch('[a-z0-9-]+',label)
assert not any((o/(label+x)).exists()for x in ['.status.json','.stdout.log.gz','.stderr.log.gz'])
assert not protected(),'PROTECTED_CHANGED_BEFORE'
e=json.loads((o/'expected-seal.json').read_bytes());assert sha(r/e['path'])==e['sha256']
paths=subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z'],cwd=r).decode().strip('\0').split('\0')
inputs={n:sha(r/n)for n in paths if n.startswith(('src/','supabase/','scripts/','tests/integration/','tests/support/'))or n in ['package.json','pnpm-lock.yaml','tsconfig.json',e['path']]}
env=os.environ.copy();env['POSTGRES_H0_BIN']='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin'
started=time.time();p=subprocess.run(command,cwd=r,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
changed=protected();counts={k:int(v[-1])for k in ['tests','pass','fail','cancelled','skipped']if(v:=re.findall(r'(?:ℹ|#) '+k+r' (\d+)',p.stdout.decode(errors='replace')))}
d={'base':subprocess.check_output(['git','rev-parse','HEAD'],cwd=r).decode().strip(),'command':command,'started':started,'finished':time.time(),'exit':p.returncode,'counts':counts,'protectedChanged':changed,'inputs':inputs,'environment':{'node':subprocess.check_output(['node','-v']).decode().strip(),'pnpm':subprocess.check_output(['pnpm','-v']).decode().strip(),'postgresBin':env['POSTGRES_H0_BIN'],'scope':'local isolated synthetic','businessServices':False}}
for name,b in [('stdout',p.stdout),('stderr',p.stderr)]:
 with(o/(label+'.'+name+'.log.gz')).open('xb')as f:f.write(gzip.compress(b,mtime=0))
with(o/(label+'.status.json')).open('x')as f:json.dump(d,f,indent=2);f.write('\n')
print(json.dumps({k:v for k,v in d.items()if k!='inputs'}));print(p.stdout.decode(errors='replace')[-1800:]);print(p.stderr.decode(errors='replace')[-1200:])
sys.exit(98 if changed else p.returncode)
