from pathlib import Path
import subprocess,json,datetime,hashlib
R=Path(__file__).resolve().parent.parent/'crm-huescaventura-os';D=Path(__file__).resolve().parent
C=D/'format-calibration';C.mkdir(exist_ok=False);(C/'good.txt').write_text('clean\n');(C/'bad.txt').write_text('trailing \n')
def check(p):return subprocess.run(['git','diff','--no-index','--check','--','/dev/null',str(p)],cwd=R,capture_output=True)
good,bad=check(C/'good.txt'),check(C/'bad.txt');assert good.returncode in [0,1] and not good.stdout and not good.stderr;assert bad.stdout or bad.stderr;assert b'trailing whitespace' in bad.stdout+bad.stderr
calibration={'good':{'exitCode':good.returncode,'stdout':good.stdout.decode(),'stderr':good.stderr.decode()},'bad':{'exitCode':bad.returncode,'stdout':bad.stdout.decode(),'stderr':bad.stderr.decode()},'explanation':'--no-index implies --exit-code: status1 with no diagnostics records a difference, not a whitespace error. Positive and negative controls distinguish this from actual Git diagnostics.'}
paths=[p.decode() for p in subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=R).split(b'\0') if p];errors=[]
for rel in paths:
 q=check(R/rel)
 if q.returncode not in [0,1] or q.stdout or q.stderr:errors.append({'path':rel,'exitCode':q.returncode,'stdout':q.stdout.decode(errors='replace'),'stderr':q.stderr.decode(errors='replace')})
q=subprocess.run(['git','diff','--check'],cwd=R,capture_output=True);assert q.returncode==0
j={'status':'PASS' if not errors else 'FAIL','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'newPathsChecked':len(paths),'calibration':calibration,'literalExceptions':[],'trackedDiffCheck':0,'bad':errors,'predecessor':'format-check-v1.json retained: false positives from status1 interpretation; no candidate changes.'};p=D/'format-check-v2.json';assert not p.exists();p.write_text(json.dumps(j,indent=2)+'\n');print(json.dumps({k:v for k,v in j.items() if k!='calibration'}));raise SystemExit(1 if errors else 0)
