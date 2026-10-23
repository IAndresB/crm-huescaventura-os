"""Emit the independent source/document review and acceptance matrix."""
import datetime,hashlib,json,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h6-c04-independent';EX=pathlib.Path('/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os');sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
report=json.loads((EX/'tests/fixtures/h6-c04-integration/runs/2026-10-22T16-46-33.825Z/report.json').read_text());reg=json.loads((EX/'tests/fixtures/h6-c04-integration/regression-receipt-r2.json').read_text());checks=[]
def ck(n,v):checks.append({'id':n,'status':'PASS' if v else 'FAIL'})
for p,d in report['sourceHashes'].items():ck('integrated-source-'+p,sha(EX/p)==d)
for p,d in reg['sources'].items():ck('regression-source-'+p,sha(EX/p)==d)
ck('r3-historical-intact',sha(EX/'specs/001-core-crm/procedure-TSK-H6-014.md')=='906cf7a451d0c85f6d5bc0ff91ce776ef9cec786d896a3620b7019cfc667ba70')
a=(EX/'specs/001-core-crm/procedure-TSK-H6-014-r4-proposed.md').read_text().splitlines();b=(EX/'specs/001-core-crm/procedure-TSK-H6-014-r4.md').read_text().splitlines();ck('r4-operative-body-identical-to-approved-proposal',a[4:]==b[4:]);ck('r4-explicit-local-adoption',all(x in '\n'.join(b[:4]) for x in ['N01/N02','ADOPTADO','LOCAL/AISLADO']))
ck('integrated-27-status-and-boundaries',report['status']=='PASS' and len(report['checks'])==27 and not report['failures'] and report['resourcesStopped'] and not report['S11'] and not report['N03'] and not report['externalBusinessEffects'])
ck('regression-22-no-skips',reg['checks']['contractRegression']['passed']==22 and reg['checks']['contractRegression']['failed']==reg['checks']['contractRegression']['skipped']==0)
ck('expected25-original-freeze',sha(EX/'tests/fixtures/h6-c04-integration/expected-v1.json')=='0ac1bdd28dd4792fdbdc865e36fd3da739f364111a97c92e2ece99c7b735cab9')
ck('expected2-mutation-freeze',sha(EX/'tests/fixtures/h6-c04-integration/expected-mutation-v1.json')=='dc90e847de1da11942e6326a48710ebf21c76220153fa380dafa3dccfb516028')
ck('auditor-base-git',subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()=='971c55d5ce5770c71284d106d3c0deecca9514b5');ck('auditor-no-tracked-modifications',subprocess.check_output(['git','diff','--name-only'],cwd=ROOT,text=True)=='');ck('auditor-no-staging',subprocess.check_output(['git','diff','--cached','--name-only'],cwd=ROOT,text=True)=='')
result={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'status':'PASS' if all(x['status']=='PASS' for x in checks) else 'FAIL','reviewMethod':'Separate auditor agent, independently frozen policy and Python SQL readers; same host, not external human certification. Provider HTTP evidence source-reviewed, not independently replayed. No executor files modified.','sourceReview':{'C04':'Immutable input and nested verification before await; one captured registration determines stored and returned state. Six own mutation vectors PASS after original C07 FAIL.','port':'Existing EvidencePort composes B07 adapter with verified identity/MFA, exact bound context/source and explicit manual preservation. C04 metadata serializes inside permitted claim, no schema or contract extension.','authority':'B07/C03/F1/F2 recheck server and durable authority; returned verified is a reviewed registration, not recognized B08 success. Global logout scoped to subject; generation revocation invalidates prior Core sessions.','runtime':'Parent integration uses actual local SQL locks and local Auth/TOTP, two revocation orders, replay/conflict, revoked-session and false-identity guards; no new HTTP route or Storage run.','normative':'N01/N02 approved and controlled r4 adopted; N03 still reserved; previous STOP not a new block.'}}
(OUT/'source-review-v1.json').write_text(json.dumps(result,indent=2)+'\n')
notes=[
('C01','Prior auditor14 manifest and all payload hashes verified; current executor35 rehashed.'),
('C02','r3 exact; r4 operative body equals approved proposed body, with adoption header only.'),
('C03','Existing C04 EvidencePort and B07 adapter; no new SQL schema/migration/contract.'),
('C04','Seven observed records preserve exact ledger observation identity, source digest and occurrence.'),
('C05','receivedAt, preservation and review metadata recovered from allowed claim serialization.'),
('C06','Independent readback distinguishes occurred, received, reviewed and recorded times.'),
('C07','Original independent FAIL preserved; immutable captured registration now passes six independent vectors and two integrated SQL-lock cases.'),
('C08','Actual local Auth/password/TOTP and F1/F2 in executor27 reviewed; independent key/session/readback, no separate provider HTTP replay.'),
('C09','175 tables reacquired from two auditor cold copies, exact typed rows/SQL-null flags; final snapshot agrees with executor.'),
('C10','Seven record/link/operation/history sets with 1:1 identities; executor replay/concurrent replay/conflict reviewed.'),
('C11','Specific negative guard/source/preservation/review/context cases in executor; no extra persisted record.'),
('C12','Read without authorized typed link denies; legitimate administrator cross-context association is not prohibited by invented policy.'),
('C13','Both revocation orders use actual SQL locks; final Core generation rejects all prior sessions; provider sessions of target zero.'),
('C14','Roles/grantors/options/schema/catalog and 255510 effective privilege cells identical; no broader authority.'),
('C15','All B08/HA/financial rows exact; missing attempt remains absent; no reconstructed attempt/result.'),
('C16','164 of 175 Core tables exact; other11 match declared evidence/security mutations; original rows preserved.'),
('C17','External ledger bytes exact; uncertain observation remains unknown; four work items paused.'),
('C18','Global roles/options/grantors plus Core schema/catalog/effective rights exact. Auth current subject readback only, no claim of new independent full Auth catalog or Storage audit.'),
('C19','10437 executor custody files and originals rehashed;5222 own resources copied/rehashed700/600/no ACL allow; resources stopped.'),
('C20','Own expected22, clarification, data policy and freezes preserved; original C07 and both instrumental FAILs intact.'),
('C21','AC073 evidence conservation advances only; missing-attempt result and unknown effect unresolved. AC074 prior local coverage retained, no new Storage assertion.'),
('C22','H6-015 IN PROGRESS; N03/S11/real/publication reserved; no closure/commit/push/Drive; resources stopped.')]
m={'scope':'PASS_WITHIN_AUTHORIZED_LOCAL_C04_B07_SCOPE_ONLY','notTaskAcceptance':True,'criteria':[{'id':i,'status':'PASS_LIMITED_TO_STATED_EVIDENCE','evidenceAndLimits':n} for i,n in notes]};(OUT/'acceptance-matrix-v1.json').write_text(json.dumps(m,indent=2)+'\n')
print(json.dumps({'sourceChecks':len(checks),'sourceStatus':result['status'],'criteria':len(notes),'matrixSHA256':sha(OUT/'acceptance-matrix-v1.json')}))
