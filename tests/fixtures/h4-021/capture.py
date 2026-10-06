import subprocess,os,sys,json,time,pathlib
folder=pathlib.Path(sys.argv[1])
sha_start=subprocess.check_output(['git','rev-parse','HEAD']).decode().strip()
tree_start=subprocess.check_output(['git','status','--porcelain']).decode()
if (folder/'status.json').exists():raise RuntimeError('CAPTURE_ID_ALREADY_EXISTS')
folder.mkdir(parents=True,exist_ok=True)
cmd=sys.argv[2:];env=os.environ.copy();env['POSTGRES_H0_BIN']='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin';env['H4014_CAPTURE_DIR']=str(folder.resolve())
start=time.time()
with (folder/'stdout.log').open('w')as out,(folder/'stderr.log').open('w')as err:
 p=subprocess.run(cmd,stdout=out,stderr=err,env=env)
(folder/'status.json').write_text(json.dumps({'command':cmd,'shaStart':sha_start,'treeStart':tree_start,'sha':subprocess.check_output(['git','rev-parse','HEAD']).decode().strip(),'tree':subprocess.check_output(['git','status','--porcelain']).decode(),'startedUnix':start,'endedUnix':time.time(),'status':p.returncode if p.returncode>=0 else None,'signal':-p.returncode if p.returncode<0 else None},indent=2)+'\n')
print(folder,'status',p.returncode)
print('\n'.join((folder/'stdout.log').read_text().splitlines()[-35:]))
sys.exit(p.returncode)
