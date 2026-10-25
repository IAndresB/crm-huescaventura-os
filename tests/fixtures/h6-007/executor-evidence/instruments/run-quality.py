from pathlib import Path
import subprocess,json,hashlib,os,sys,datetime
r=Path(__file__).resolve().parent.parent/'crm-huescaventura-os';d=Path(__file__).resolve().parent/(sys.argv[1]+'-quality');d.mkdir(exist_ok=False);env={k:os.environ[k] for k in ['PATH','HOME','TMPDIR'] if k in os.environ};env.update({'LANG':'C','CI':'1','NEXT_TELEMETRY_DISABLED':'1'});results=[]
for name in ['test','typecheck','lint','build']:
 with (d/(name+'.stdout.log')).open('wb') as out,(d/(name+'.stderr.log')).open('wb') as err:q=subprocess.run(['pnpm',name],cwd=r,env=env,stdout=out,stderr=err)
 item={'command':['pnpm',name],'exitCode':q.returncode,'status':'PASS' if q.returncode==0 else 'FAIL','stdoutSHA256':hashlib.sha256((d/(name+'.stdout.log')).read_bytes()).hexdigest(),'stderrSHA256':hashlib.sha256((d/(name+'.stderr.log')).read_bytes()).hexdigest()};results.append(item);print(json.dumps(item),flush=True)
 if q.returncode:break
(d/'result.json').write_text(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'results':results,'status':'PASS' if len(results)==4 and all(x['exitCode']==0 for x in results) else 'FAIL'},indent=2)+'\n');sys.exit(0 if len(results)==4 and all(x['exitCode']==0 for x in results) else 1)
