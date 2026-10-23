from pathlib import Path
import json,hashlib,gzip,re,datetime
root=Path('/tmp/h6-001-audit');base=Path('/Users/andres/.codex/worktrees/h6-001-local/crm-huescaventura-os');sha=lambda b:hashlib.sha256(b).hexdigest()
acs=json.loads((root/'ac-matrix.json').read_text());caseindex=json.loads((root/'regression-01/case-index.json').read_text())
def exact(prefix,phase='phase-15'):
 found=[x for x in caseindex if x['phase']==phase and x['result']=='PASS' and x['title'].startswith(prefix)]
 assert found,prefix
 return [{'test':x['title'],'log':x['log'],'logLine':x['line'],'result':'PASS'} for x in found]
controls={
 'T01':exact('R26 prewrite')+exact('R27 late history')+exact('R28 lost response'),
 'T02':exact('R30 lost response','phase-14')+exact('R31 changed replay','phase-14')+exact('R32 concurrent','phase-14')+exact('R34 pre-write','phase-14')+exact('R35 late history','phase-14'),
 'T03':exact('R35 fault')+exact('R63 actual nights')+exact('R64 direct')+exact('R65 distinct'),
 'T04':exact('H4-010 R19 first')+exact('H4-010 R24 every')+exact('H4-010 R24b')+exact('H4-010 R25 real'),
 'T05':exact('R49 real concurrent')+exact('R52 two movement')+exact('R65 receipt')+exact('R69 deferred COMMIT')+exact('R63 deferred COMMIT'),
 'T07': [{'test':'A01, A02, A03, A04','log':'independent-02/stdout.log.gz','result':'PASS'}]+exact('J04 Refund vs Provider Payment'),
 'T10':exact('H5-015 J08')+exact('H5-015 J07 payment,')+exact('H5-015 J07 document,')+exact('H5-015 J07 refund,')+exact('H5-015 J07 incompatible')
}
(root/'atomicity-replay-concurrency.json').write_text(json.dumps(controls,indent=2,ensure_ascii=False)+'\n')
rows=[]
def add(n,result,refs,observation,limit='Local/synthetic cited scope only; no general completion of H6.'):
 rows.append({'id':f'IA{n:02}','result':result,'refs':refs,'observed':observation,'limits':limit})
add(1,'PASS',['focal-independent-01/source/postgres-h6-001.test.ts','focal-independent-01/observed.json'],'Continuous ordinary-contract path with 139 recorded commands and one closed Booking; administrative SQL only technical setup/actor denial and observational reads. No successful business state is SQL-seeded in this path.')
add(2,'PASS',['ac-matrix.json:AC-004','focal-independent-01: P01/P02/N01'],'Lead minima individually guarded; explicit source and linked opportunity; context technical identities distinguished from business conversion.')
add(3,'PASS',['ac-matrix.json:AC-001/010'],'Unknown dependent costs remain null and block definitive fixation; known independent scope proceeds.')
add(4,'PASS',['ac-matrix.json:AC-007/011/012','focal-independent-01: P02'],'Immutable versions, component provenance, modalities, selection, final pricing and commercial privacy checked.')
add(5,'PASS',['ac-matrix.json:AC-008/009/013','regression-01/phase-14.stdout.log.gz: R01–R62'],'Actual acceptance authority/material/time/scope guards; late valid act versus missing act-time proof, no retrospective revalidation.')
add(6,'PASS',['ac-matrix.json:AC-016','focal-independent-01: P02/N02'],'Acceptance/Ganada does not create cash, confirmation or performed work; conversion leaves preparation pending.')
add(7,'PASS',['ac-matrix.json:AC-015/017','focal-independent-01: P03'],'Booking unique and immutable accepted snapshot, correct quantities/night contributions and replay.')
add(8,'PASS',['ac-matrix.json:AC-017/018/019'],'Rafting10/cena12/night12/10 plus component change-locality and four partial names; no invented participants.','Integrated positive quantities; localized modifications/whole-house variants are separate component regressions, not E2E-03.')
add(9,'PASS',['ac-matrix.json:AC-025/026','focal-independent-01: P04/P05'],'Expected, notice, receipt, proposed/verified reconciliation and allocation distinct; unverified portion unusable.')
add(10,'PASS',['ac-matrix.json:AC-027/028','atomicity-replay-concurrency.json:T05/T07','independent-02: A01'],'No duplicate money/portion; same amount transfers remain distinct; allocation/refund/provider shared-root races serialized.')
add(11,'PASS',['ac-matrix.json:AC-023','focal-independent-01: P05–P09'],'Critical scopes/funds/document review jointly required; six/seven-day and economic-exception guards component-checked.')
add(12,'PASS',['ac-matrix.json:AC-024','focal-independent-01: P06/P14'],'Four confirmation roots tied to original responsible records; partial ratification does not expand scope.')
add(13,'PASS',['ac-matrix.json:AC-044','independent-02: A01'],'Third-party funds/Fee/mandate/payment independent; internal own-economy route has explicit components, not inferred total receipt income.','External branch separate from one internal E2E-01; no external supplier mandate or E2E-05 claimed for the focal.')
add(14,'PASS',['ac-matrix.json:AC-045/046','independent-02: A04'],'Supplier500 paid, invoice absent→received→reviewed/linked→documentarily resolved; receipt alone not enough; discrepancies retained/reopened.','External invoice/provider controls separate; no fiscal validation or external effect.')
add(15,'PASS',['ac-matrix.json:AC-058/063','focal-independent-01: N04/P10'],'Normal start/performed quantities/finish, distinct actual original; dates/confirmation do not perform; abnormal reality covered separately.')
add(16,'PASS',['ac-matrix.json:AC-058/059','focal-independent-01: N05/P12'],'Finalizada retains economic/documentary pending; three explicit assessments with criteria and founded nonapplicability.')
add(17,'PASS',['ac-matrix.json:AC-060','focal-independent-01: P07/P08'],'Critical pending/required document/refund block dependent preparation or closure; explicit exception does not waive other economic issue.')
add(18,'PASS',['ac-matrix.json:AC-059','focal-independent-01: P12/P13/P14'],'Closed/Historical only after three current resolved dimensions and explicit joint act with persisted criterion evidence.')
add(19,'PASS',['ac-matrix.json:AC-061/062','integrated-68: I02'],'New material economic incident invalidates economic and current joint state only; old closure/other dimensions/other root preserved; archive is not closure.','Component/current-chain regression; E2E-07 remains its own pending task.')
add(20,'PASS',['focal-independent-01/observed.json: TRACE/P14','integrated-68: I03'],'Booking-root traversal reaches Lead/contact/opportunity/version/Acceptance, original payment/evidence/portion, four confirmations, reviewed requirement, storage metadata/digest, reality and closure criteria. Projections do not mutate canonical facts.')
add(21,'PASS',['focal-independent-01: N01/N06/N07','independent-02: A02/A05','regression-01/phase-14.stdout.log.gz: R38/R39'],'Actual local Auth session plus ordinary runtime; missing/forged/stale/disabled/unprovisioned contexts deny reads/writes/replays; direct anon/authenticated/runtime SQL cannot bypass.')
add(22,'PASS',['ac-matrix.json:AC-007','regression-01/phase-15.stdout.log.gz: R21 direct SQL runtime/API roles denied and private FORCE RLS','independent-02: A05'],'Protected version/history ordinary DML denied, original records immutable; bootstrap role kept distinct.')
add(23,'PASS',['atomicity-replay-concurrency.json','freplay-isolated-01/stdout.log.gz','focal-independent-01: P03/N03/P13/N07'],'Durable equal replay, changed-key material conflict and reauthorization checked by exact executed cases across T01/T02/T03/T04/T05/T07/T10.','Checks apply to traversed and cited component units; not every possible contract transition in H6.')
add(24,'PASS',['atomicity-replay-concurrency.json','independent-02: A03'],'Real PostgreSQL fault/late-history/deferred COMMIT rollback and successful-COMMIT response-loss recovery; independent trigger witness proves deferred commit reached with no durable payment/history/result.')
add(25,'PASS',['atomicity-replay-concurrency.json','reconciliation.json: FIXED_PORT_COLLISION'],'Real sessions and lock/wait barriers cover Booking uniqueness, shared funds and stale closure input in both relevant orders; failed setup port collision repeated separately without changing source.','Concurrency regression is component scoped; focal continuous sale runs serially.')
add(26,'PASS',['ac-matrix.json','atomicity-replay-concurrency.json','expected.md'],'Exactly three direct assignments and 34 principal AC mapped to 105 executed source/log references; no normative contract edits.')
add(27,'PASS',['received-product.json','final-integrity.json','reconciliation.json','focal-independent-01/inputs.json'],'822 independent byte/identity checks pass; base fixed,613 original functional inputs unchanged,14 inherited exact,178 product/migration paths match candidate, final focal source unchanged. Raw failures retained.','Final outer candidate delivery manifest is assembled by executor and independently read by custody; this verdict pins functional sources and audit evidence, not a future unobserved package.')
add(28,'PASS_DOCUMENTAL',['custody-reference.json','final-integrity.json'],'Custodian v2 rechecks16 manifests/4568 payload entries, archived snapshot refs and sealed four-suspended-job receipt; no H6-015 runtime touched.','Four suspended jobs known from immutable accepted receipt, not fresh SQL; primary historical untracked inventory compared paths/sizes, sealed H6-015 content rehashed.')
add(29,'PASS_LOCAL_SCOPE',['focal-independent-01/inputs.json','run-focal.py','run-regression.mjs','final-integrity.json','custody-reference.json'],'Own ephemeral PG/Auth/Storage loopback and synthetic identities, allowlisted environment without real credentials; no business connector, Git publication, Drive, S11 or H6-015 execution.','No packet-level network audit. Pinned CLI/tools may emit version notices; PostgreSQL target and Auth/Storage endpoints are explicitly loopback. No Hosted/Production or real-world effect claimed.')
add(30,'PASS_PREPARED_ONLY',['custody-reference.json','reviewed-document-hashes.json'],'Pending publication inventory separates base,14 antecedents and own H6-001; A/B/C/D/E lots, R1/R2 variants and documentary conflicts recorded; publication not performed.','No remote ref refresh, staging/commit/push, merge, Drive or combined H6-001/H6-015 publication authorized.')
assert len(rows)==30
(root/'ia-matrix.json').write_text(json.dumps({'frozenExpectedSHA':'ecaf8a7ffc942493c5d7fc7606f0c15a6af8d85aba766e1117d0cb901d544eb2','rows':rows,'interpretation':'Expected not changed. PASS scopes and limits explicit; does not declare H6-001 COMPLETED.'},indent=2,ensure_ascii=False)+'\n')
# Verify custodian package as received; do not reproduce its runtime/custody claims beyond its limits.
cust=Path('/tmp/h6-001-custody-audit');seal=cust/'audit-delivery-v2.json';meta=json.loads(seal.read_text());checks=[]
for x in meta['files']:
 p=cust/x['path'];checks.append({'path':x['path'],'pass':p.stat().st_size==x['bytes'] and sha(p.read_bytes())==x['sha256'],'sha256':sha(p.read_bytes())})
assert all(x['pass'] for x in checks)
(root/'custody-reference.json').write_text(json.dumps({'sealPath':str(seal),'sealSHA256':sha(seal.read_bytes()),'sealScope':meta['scope'],'status':meta['status'],'verification':checks,'claims':'Report v2:16 sealed manifests4568payload entries;252 context controls; four suspended jobs by sealed receipt only; archived refs preserved; no runtime queried. Final executor manifest pending separate custodial readback.'},indent=2)+'\n')
paths=['specs/001-core-crm/evidence-TSK-H6-001.md','specs/001-core-crm/publication-TSK-H6-001.md','specs/001-core-crm/tasks.md','docs/PROJECT-STATUS.md','docs/NEXT-STEPS.md','tests/fixtures/h6-001/quality-r1/results.json','tests/fixtures/h6-001/attempt-ledger.json']
(root/'reviewed-document-hashes.json').write_text(json.dumps({'reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Documents reviewed during assembly, later append-only consolidation may supersede these reads; functional source freeze separately verified.','files':[{'path':p,'bytes':(base/p).stat().st_size,'sha256':sha((base/p).read_bytes())} for p in paths]},indent=2)+'\n')
# Capture only bounded setup failure context, not private runtime files.
pg=Path('/tmp/h6-001-audit/runtime/crm-freplay-TMMrdy/postgres.log');txt=pg.read_text();excerpt='\n'.join(l for l in txt.splitlines() if any(s in l for s in ['could not bind','60202','could not create']))
(root/'instrument-failure-context.json').write_text(json.dumps({'originalRuntimeLogSHA':sha(pg.read_bytes()),'excerpt':excerpt,'scope':'Explicit excerpt corroborates test setup collision; original runtime is excluded from delivery.'},indent=2)+'\n')
print('IA30 and supplementary evidence prepared')
