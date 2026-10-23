"""Read-only documentary verification; writes only the explicitly requested new receipt."""
import argparse, hashlib, json, re, subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
E = ROOT / 'tests/fixtures/h6-015-formal-closure'
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def check(value, label):
    if not value: raise AssertionError(label)
    checks.append(label)
def git(*args, cwd=ROOT): return subprocess.check_output(['git', *args], cwd=cwd)
checks=[]
parser=argparse.ArgumentParser(); parser.add_argument('--output',required=True); args=parser.parse_args()
expected=json.loads((E/'expected-v1.json').read_text())
check(digest(E/'expected-v1.json')==(E/'expected-v1.sha256').read_text().strip(),'expected_frozen')
check(git('rev-parse','HEAD').decode().strip()==expected['baseCommit'],'base_commit')
package_rows=[]
for p in expected['packages']:
    root=Path(p['worktree']); m=root/p['manifest']
    check(digest(m)==p['sha256'],'manifest:'+str(m))
    j=json.loads(m.read_text()); files=j.get('files',j.get('entries'))
    for f in files:
        q=root/f['path']; check(q.is_file() and q.stat().st_size==f['bytes'] and digest(q)==f['sha256'],'payload:'+str(q))
    package_rows.append({'manifest':str(m),'sha256':digest(m),'payloads':len(files)})
s=Path(expected['source'])
for f in json.loads(Path(expected['protectedBaseline']).read_text()):
    p=s/f['path']; check(p.is_file() and p.stat().st_size==f['bytes'] and digest(p)==f['sha256'],'protected:'+f['path'])
# Only additive tracking annotations; inverse must match approved base byte-for-byte.
for n in expected['trackingFiles']:
    before=git('show',expected['baseCommit']+':'+n).decode(); after=(ROOT/n).read_text()
    check(hashlib.sha256(before.encode()).hexdigest()==expected['priorTracking'][n],'tracking_base:'+n)
    first=after.index('\n')+1
    historical=after.index('\n## Estado vigente H6-014',first)
    inverse=after[:first]+after[historical:]
    if n.endswith('tasks.md'):
        marker='#### TSK-H6-015 — Restaurar en aislamiento y conciliar antes de reanudar\n'
        start=inverse.index(marker)+len(marker)
        stop=inverse.index('\n- [ ] **Ejecución: NOT STARTED.',start)
        inserted=inverse[start:stop]
        check('Estado vigente: COMPLETED — exclusivamente local/aislado y en cuarentena' in inserted,'H6015_checked_current_state')
        inverse=inverse[:start]+inverse[stop:]
    check(inverse==before,'tracking_inverse_exact:'+n)
    check('AC-073 y AC-074 satisfechos solo dentro del alcance local acreditado' in after,'AC_scope:'+n)
    check('ARCH-PENDING-002 y DM-PENDING-005 OPEN' in after,'pending_open:'+n)
    check('H6 global IN PROGRESS, no COMPLETED' in after,'global_not_completed:'+n)
changes=git('diff','--name-only').decode().splitlines()
check(set(changes)==set(expected['trackingFiles']),'only_three_tracking_files_modified')
check(not git('diff','--cached','--name-only'),'nothing_staged')
subprocess.run(['git','diff','--check'],cwd=ROOT,check=True)
check(True,'git_diff_check')
t=(ROOT/'specs/001-core-crm/tasks.md').read_text()
for task in ['TSK-H6-001','TSK-H6-004','TSK-H6-007','TSK-H6-016']:
    part=t.split('#### '+task+' — ',1)[1].split('\n<a id=',1)[0]
    check('Ejecución: NOT STARTED.' in part and '[x]' not in part,'not_started:'+task)
prep=json.loads((E/'next-H6-preparation-v1.json').read_text())
check(len(prep['tasks']['TSK-H6-016']['assignedRows'])==25,'H6016_25_assignments')
check(len(prep['tasks']['TSK-H6-001']['assignedRows'])==3,'H6001_3_assignments')
check(len(prep['transactionUnits'])==11,'11_transaction_units')
for task,v in prep['tasks'].items():
    start=t.index('#### '+task+' — '); end=t.index('\n<a id=',start)
    check(v['definition']==t[start:end],'next_definition_exact:'+task)
    current=[l for l in t.splitlines() if l.startswith('| **') and '['+task+']' in l]
    check(current==[x['literal'] for x in v['assignedRows']],'next_rows_exact:'+task)
for x in json.loads((E/'accepted-evidence-index-v1.json').read_text()):
    p=Path(x['path']); check(p.stat().st_size==x['bytes'] and digest(p)==x['sha256'],'evidence_index:'+str(p))
# New document links, excluding historical links that are not changed by this act.
for n in ['specs/001-core-crm/closure-TSK-H6-015-local.md','specs/001-core-crm/preparation-next-H6-after-H6-015.md']:
    p=ROOT/n
    for target in re.findall(r'\]\(([^)]+)\)',p.read_text()):
        q=Path(target) if target.startswith('/') else p.parent/target
        check(q.exists(),'document_link:'+target)
orig=Path('/Users/andres/Developer/crm-huescaventura-os')
ost=git('status','--porcelain=v1','-z','--untracked-files=all',cwd=orig)
check(hashlib.sha256(ost).hexdigest()=='ee2194dd057f7a860d55418c8c026a11a311590ced315768f4b4f16335c7c127','original_checkout_unchanged')
receipt={'status':'PASS','baseCommit':expected['baseCommit'],'taskState':'COMPLETED_LOCAL_ISOLATED_QUARANTINE','H6Global':'IN_PROGRESS','controls':len(checks),'packages':package_rows,'payloadEntries':sum(x['payloads'] for x in package_rows),'protectedBaselineFiles':44293,'originalUntracked':sum(x.startswith(b'?? ') for x in ost.split(b'\0')),'trackingFiles':changes,'trackingInverseExact':True,'nextTasksNotStarted':True,'functionalTestsRepeated':False,'SQLExecuted':False,'S11':False,'N03':False,'commit':False,'push':False,'Drive':False,'runtimeStateClaim':'Preserved accepted quarantine evidence; no new runtime observation','checks':checks}
out=ROOT/args.output
check(not out.exists(),'new_receipt_only')
out.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k not in ['checks','packages']},indent=2))
