from pathlib import Path
import subprocess,json,datetime
R=Path(__file__).resolve().parent.parent/'crm-huescaventura-os';D=Path(__file__).resolve().parent
paths=[p.decode() for p in subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=R).split(b'\0') if p]
bad=[]
for rel in paths:
 q=subprocess.run(['git','diff','--no-index','--check','--','/dev/null',str(R/rel)],cwd=R,capture_output=True)
 if q.returncode:bad.append({'path':rel,'exitCode':q.returncode,'stdout':q.stdout.decode(errors='replace'),'stderr':q.stderr.decode(errors='replace')})
q=subprocess.run(['git','diff','--check'],cwd=R,capture_output=True);assert q.returncode==0
j={'status':'PASS' if not bad else 'FAIL','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'newPathsChecked':len(paths),'literalExceptions':[],'trackedDiffCheck':q.returncode,'bad':bad}
p=D/'format-check-v1.json';assert not p.exists();p.write_text(json.dumps(j,indent=2)+'\n');print(json.dumps(j));raise SystemExit(1 if bad else 0)
