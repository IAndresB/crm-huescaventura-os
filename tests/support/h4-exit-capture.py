"""Capture a real local command without reconstructing streams or statuses."""
import json,os,subprocess,sys,time
from pathlib import Path
root=Path(__file__).resolve().parents[2]
out=Path(sys.argv[1]).resolve();out.mkdir(parents=True,exist_ok=True)
command=sys.argv[2:]
def git(*args):return subprocess.check_output(['git',*args],cwd=root,text=True)
record={'command':command,'shaStart':git('rev-parse','HEAD').strip(),'treeStart':git('status','--porcelain=v1'),'startedUnix':time.time(),'error':None}
try:
 with (out/'stdout.log').open('wb')as stdout,(out/'stderr.log').open('wb')as stderr:
  process=subprocess.run(command,cwd=root,stdout=stdout,stderr=stderr,env=os.environ.copy())
 record.update(status=process.returncode if process.returncode>=0 else None,signal=-process.returncode if process.returncode<0 else None)
except Exception as error:record.update(status=None,signal=None,error=repr(error))
record.update(endedUnix=time.time(),sha=git('rev-parse','HEAD').strip(),tree=git('status','--porcelain=v1'))
(out/'status.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps({'output':str(out),'status':record['status'],'signal':record['signal'],'error':record['error']}),flush=True)
sys.exit(record['status'] if isinstance(record['status'],int) else 1)
