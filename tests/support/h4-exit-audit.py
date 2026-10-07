"""Verify real exit captures and preservation; never changes the expected."""
import hashlib,json,re,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[2];out=Path(sys.argv[1]).resolve()
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
gates=['frozen','typecheck','lint','build','audit','postgres','unit','health','versions','diff']
statuses={}
for gate in gates:
 value=json.loads((out/gate/'status.json').read_text());assert value['status']==0 and value['signal']is None and value['error']is None,(gate,value)
 assert value['shaStart']==head and value['sha']==head,(gate,'code changed during execution')
 statuses[gate]=value['status']
counts={}
for gate,n in [('postgres',2321),('unit',138),('health',1)]:
 text=(out/gate/'stdout.log').read_text()
 summary={k:int(v)for k,v in re.findall(r'(?:ℹ |# )(tests|pass|fail|cancelled|skipped) (\d+)',text)}
 assert summary=={'tests':n,'pass':n,'fail':0,'cancelled':0,'skipped':0},(gate,summary)
 counts[gate]=summary
protected=json.loads((root/'tests/fixtures/h4-024/protected-base.json').read_text())
for path,sha in protected.items():assert hashlib.sha256((root/path).read_bytes()).hexdigest()==sha,path
migrations=list((root/'supabase/migrations').glob('*.sql'));assert len(migrations)==52
base='cfa635f87354bea7fd090a6890995b05130ad671'
changed=subprocess.check_output(['git','diff','--name-only',base,head],cwd=root,text=True).splitlines()
assert not any(p.startswith(('src/','supabase/'))or p in ['package.json','pnpm-lock.yaml'] for p in changed),changed
health='supabase/operations/20261002225221_crm_supabase_daily_health.sql'
assert subprocess.check_output(['git','show',base+':'+health],cwd=root)==(root/health).read_bytes()
result={'base':base,'expected':subprocess.check_output(['git','rev-parse','ba9b9f7'],cwd=root,text=True).strip(),'testedSha':head,'gates':statuses,'counts':counts,'priorPostgres':2240,'newPostgresIncludedOnce':81,'protectedFiles':len(protected),'migrations':len(migrations),'productDependencyMigrationChanges':0,'healthSeparate':True,'hosted':False,'productionAuthorized':False}
(out/'closure-verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
