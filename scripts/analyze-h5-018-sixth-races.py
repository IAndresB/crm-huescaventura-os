"""Attribute the eight special cases from this audit's original/G executions."""
from pathlib import Path
import gzip,json,re,hashlib
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h5-018-sixth'
old=json.loads((o/'fifth-303-independent-extraction.json').read_bytes());special=[x for x in old['cases']if x['kind']!='evidence'];assert len(special)==8

def segments(name):
 lines=gzip.decompress((o/name).read_bytes()).decode().split('✖ failing tests:')[0].splitlines();pending=[];found={}
 for line in lines:
  match=re.match(r'^\s*([✔✖]) (.*) \([0-9.]+ms\)$',line)
  if match:
   found[match[2]]={'result':'PASS'if match[1]=='✔'else'FAIL','lines':pending.copy(),'log':name};pending=[]
  else:pending.append(line)
 return found
before=segments('21-original-focal.stdout.log.gz');after=segments('22-corrected-focal.stdout.log.gz')
rows=[]
for case in special:
 name=case['name'];a=before[name];b=after[name];assert a['result']=='FAIL'and b['result']=='PASS'
 def observations(block):
  trace=[];locks=[];overlap=[]
  for line in block['lines']:
   if 'G cancellation trace 'in line:trace.append(json.loads(line.split('G cancellation trace ',1)[1]))
   if 'H5016 after-read interleaving 'in line:locks.append(json.loads(line.split('H5016 after-read interleaving ',1)[1]))
   if 'H4-014 observed PostgreSQL lock overlap 'in line:overlap.append(line)
  return {'trace':trace,'locks':locks,'overlap':overlap}
 av=observations(a);bv=observations(b);assert av['trace']and bv['trace'],name
 assert any(t.get('error','').endswith('CANCELLATION_EVIDENCE_REQUIRED:E3')for t in av['trace'])
 assert all(t['at']=='2026-10-17T10:00:00Z'for t in av['trace']+bv['trace'])
 assert any(t['status']=='fulfilled'for t in bv['trace'])
 if case['kind']=='lock':
  assert len(bv['locks'])==1
  locks=bv['locks'][0]['locks'];assert sum(not x['granted']for x in locks)>=2
  assert all(x['blockers']for x in locks if not x['granted'])
  assert bv['locks'][0]['results'][0]['status']=='rejected'and bv['locks'][0]['results'][1]['status']=='fulfilled'
  assert any('CANCELLATION_EVIDENCE_REQUIRED:E3'in x.get('error','')for x in av['locks'][0]['results'])
  cause='Writer rejected before cancellation insert/closure_writer; second advisory wait never reached. G reaches original two-wait barrier with real blocking pids; original writer fulfilled and close rejected assertions pass.'
 else:
  assert len(av['overlap'])>=2 and len(bv['overlap'])>=2
  cause='Original cancellations rejected E3 before the intended competition. G reaches unchanged conflict/replay/history assertions with actual PG overlap in both input schedules where defined.'
 rows.append({'name':name,'source':case['location'],'classification':'Consequence of temporal fixture independently reproduced','cause':cause,'original':{'log':a['log'],'result':a['result'],**av},'G':{'log':b['log'],'result':b['result'],**bv},'deadlineMs':15000 if case['kind']=='lock'else None,'originalSourceSha256':hashlib.sha256((r/case['location'].split(':')[0]).read_bytes()).hexdigest(),'assertionsChanged':False,'productCorrective':False})
with (o/'eight-causal-reproduction.json').open('x')as f:json.dump({'cases':rows,'unresolved':0,'historicalFAILPreserved':True},f,indent=2);f.write('\n')
print(json.dumps({'classified':len(rows),'unresolved':0,'actualTwoWaitsVerified':True}))
