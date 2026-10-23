from pathlib import Path
import json,hashlib,re
root=Path(__file__).resolve().parent.parent;folder=root/'tests/fixtures/h6-auth-independent-review'
d=json.loads((folder/'public-human-adapter-inventory.json').read_text());live=json.loads((folder/'live-sql-functions.json').read_text());byname={}
for f in live['functions']:byname.setdefault(f['name'],[]).append(f)
prefix={
'H1001IdentityAdapter':'identity','H1003ResolutionAdapter':'identity','H1005CatalogAdapter':'catalog','H1007CommercialAdapter':'commercial','H1013EvidenceAdapter':'b07','H1017TaskAdapter':'b07_task',
'H2001CommercialAdapter':'b03','H2003ProposalAdapter':'proposal','H2005OfferAdapter':'offer','H2007AcceptanceAdapter':'acceptance','H2009BookingAdapter':'booking',
'H3001ObligationAdapter':'obligation','H3003PaymentAdapter':'payment','H3005AllocationAdapter':'allocation','H3007InvoiceAdapter':'invoice','H3009SuplidoAdapter':'suplido','H3011ProviderPaymentAdapter':'provider_payment','H3013OwnEconomicsAdapter':'own_economics',
'H4001RequirementAdapter':'requirement','H4003IncidentAdapter':'incident','H4005AvailabilityAdapter':'availability','H4007HoldAdapter':'hold','H4009ConfirmationAdapter':'confirmation','H4011ModificationAdapter':'modification','H4013CancellationAdapter':'cancellation','H4015RefundAdapter':'refund','H4017DepositAdapter':'deposit','H4020BookingPreparationAdapter':'booking_preparation','H4022OperationalRealityAdapter':'reality',
'H5003AlertAdapter':'b07_alert','H5005CommunicationAdapter':'b07_communication','H5011ProjectionAdapter':'h5_projection','H5013ClosureAdapter':'closure','H5017DiagnosticAdapter':'h5_diagnostic','H5009ExternalEventAdapter':'b09_external_event'}
exceptions={
'H0005PostgresAdapter.establish':['establish_session'],'H0005PostgresAdapter.reidentify':['reidentify_session'],'H0005PostgresAdapter.revokeOne':['revoke_session'],'H0005PostgresAdapter.revokeAll':['revoke_all_sessions'],'H0005PostgresAdapter.readCoreProbe':['human_read_probe'],'H0005PostgresAdapter.applyCoreProbe':['human_apply_probe_batch'],
'H0013GlobalAccessRevocationAdapter.revokeAll':['start_global_access_revocation','record_global_auth_revocation_outcome'],
'H1003ResolutionAdapter.apply':['identity_resolve'],'H1003ResolutionAdapter.candidates':['identity_candidates'],'H1003ResolutionAdapter.findCode':['identity_code_lookup'],
'H2001CommercialAdapter.apply':['b03_apply','identity_resolve'],'H2003ProposalAdapter.apply':['proposal_sources','proposal_apply','identity_resolve'],'H2009BookingAdapter.apply':['booking_apply','identity_resolve'],'H2009BookingAdapter.direct':['b03_apply','proposal_sources','proposal_apply','offer_apply','acceptance_apply','booking_apply','identity_resolve'],
'H3013OwnEconomicsAdapter.apply':['own_economics_sources','own_economics_apply'],
'H4003IncidentAdapter.apply':['incident_apply','identity_resolve'],'H4005AvailabilityAdapter.apply':['availability_apply','b07_task_apply'],'H4007HoldAdapter.apply':['hold_apply','b07_task_apply'],'H4009ConfirmationAdapter.apply':['confirmation_apply','b07_task_apply'],'H4011ModificationAdapter.apply':['modification_apply','b07_task_apply'],
'H4015RefundAdapter.applyGuarantee':['refund_apply'],
'H5001TaskAdapter.apply':['b07_task_apply'],'H5001TaskAdapter.read':['b07_task_read'],'H5001TaskAdapter.transition':['b07_task_apply'],'H5001TaskAdapter.balanceNeeds':['obligation_read'],
'H5013ClosureAdapter.close':['closure_joint_apply'],'H5017DiagnosticAdapter.record':['h5_diagnostic_record'],
'createPersistedWorkExecutor.apply':['b08_work_probe','b08_work_probe_material','b08_work_lock','b08_work_apply','b08_work_finalize','b08_ha_finalize','h0_m04_command','h0_m04_revalidate_evidence','h0_m04_finalize_evidence','commit_internal_unit'],'createPersistedWorkExecutor.read':['b08_work_read']}
for method in ['prepare','metadata','upload','reconcile','link','download','diagnoseOrphan']:
 exceptions['H1015ObjectAdapter.'+method]=['b07_object_apply'] if method=='prepare' else ['b07_object_read'] if method in ['metadata','download'] else ['b07_object_read','b07_object_apply']
sensitive={'scheduleProviderPayment':['provider_payment_sensitive_schedule','provider_payment_finalize'],'authorizeRefund':['refund_sensitive_authorize','refund_finalize'],'determineDeposit':['deposit_sensitive_determine','deposit_finalize'],'evaluateBookingPreparation':['booking_preparation_sensitive','booking_preparation_finalize'],'recordReality':['reality_sensitive','reality_finalize']}
for method in ['propose','decide','reserve',*sensitive]:
 exceptions['H0011PostgresAdapter.'+method]=['h0_m04_command','commit_internal_unit','h0_m04_finalize_evidence']+([]if method in ['propose','decide'] else ['h0_m04_evidence_replay','h0_m04_revalidate_evidence'])+sensitive.get(method,[])
exceptions['H0011PostgresAdapter.readProposal']=['h0_m04_read_proposal']
rows=[]
for r in d['rows']:
 e=r['entrypoint'];c,m=e.split('.');category='core-single-transaction'
 functions=exceptions.get(e)
 if functions is None:
  functions=[prefix[c]+'_'+('read' if m in ['read','evaluate','assess','basis','byCode']else'apply')]
 if c=='H0005PostgresAdapter'and m in ['establish','reidentify','revokeOne','revokeAll']or c=='H0013GlobalAccessRevocationAdapter':category='session-management-not-ordinary-core-matrix'
 elif c=='H0011PostgresAdapter':category='tte-human-approval-read'if m=='readProposal'else'tte-human-approval-command'
 elif c=='createPersistedWorkExecutor':category='tte-persisted-work'
 elif c=='H1015ObjectAdapter'and m not in ['prepare','metadata']:category='storage-multiunit'
 elif e=='H2009BookingAdapter.direct':category='composed-same-transaction'
 elif r.get('verifiedDelegation') or e=='H3001ObligationAdapter.evaluate':category='exact-delegation'
 reviewed=[]
 for f in functions:
  assert f in byname,(e,f)
  records=byname[f];proof=[]
  for v in records:
   body=v['definition'];at=body.find('crm_f2.admit');proof.append({'arguments':v['arguments'],'runtimeExecute':v['runtime_execute'],'definitionSha256':hashlib.sha256(body.encode()).hexdigest(),'directAdmit':at>=0,'admitDefinitionLine':body[:at].count('\n')+1 if at>=0 else None,'condition':'Only propose/decide/reserve branch is human; its admit precedes command receipt replay'if f=='h0_m04_command'else'Human 6-argument overload only; 3-argument overload is technical'if f=='commit_internal_unit'else'Calls b08_work_probe first'if f=='b08_work_probe_material'else'First protected read/effect occurs after admission; input validation may precede it'if at>=0 else'Special authority path; do not infer ordinary admission equivalence'})
  reviewed.append({'name':f,'variants':proof})
 note='The listed SQL path is protected before business branch/replay; equivalent methods sharing this exact path can share admission coverage, not business-semantic coverage.'
 if category=='storage-multiunit':note='Require stage-specific assertions: invalid prior proof prevents first storage access; concurrent closure after read/put prevents final Core transition; download must not release bytes after closure. DB snapshot alone misses external Storage effects.'
 if category=='tte-human-approval-command':note='Require human action tag propose/decide/reserve, 6-argument commit overload, issuer login crm_h0_ha_tx and existing finalization invariants. Replay probe is technical and does not itself authorize a result; command+ledger re-admit the old proof before replay can return.'
 if category=='tte-persisted-work':note='Apply always probes under F2 before replay, result verifier/evidence access; the execution transaction and finalize re-admit. Cover fresh work and previously committed result/replay, plus delayed verifier and concurrency. Technical transitions retain their separate authority.'
 if category=='composed-same-transaction':note='All ordered stages execute through existing adapters over one scoped transaction; no caller connection is exposed. Cover direct path and rollback with invalid authority; keep identity code resolution within same unit.'
 if category=='session-management-not-ordinary-core-matrix':note='Use specific lifecycle expectations; do not require all management functions to behave like data reads at idle/expiry. F01 generation race belongs here. Recovery/actor administration use separately approved authorities.'
 rows.append({'entrypoint':e,'file':r['file'],'line':r['line'],'category':category,'reviewedSqlPaths':reviewed,'equivalenceNote':note,'matrixCoverage':r['integratedCoverageKind']})
result={'count':len(rows),'distinctSqlNames':len(set(f['name']for r in rows for f in r['reviewedSqlPaths'])),'sourceInventory':'public-human-adapter-inventory.json','liveSqlSnapshot':'live-sql-functions.json','reviewScope':'Source-read mapping of every human public entrypoint; SQL lists include conditional auxiliary paths, not assertion that every input executes all paths. All dynamic observations remain separately identified.','rows':rows}
(folder/'resolved-surface-guards.json').write_text(json.dumps(result,indent=2)+'\n')
md=['# M02 — Mapa independiente de superficies y guardias','',f"{len(rows)} entrypoints; {result['distinctSqlNames']} nombres SQL distintos incluidos caminos auxiliares. Gestión de sesión, probes y TTE están clasificados aparte. La equivalencia es de admisión; no acredita todas las reglas de negocio ni acciones del dispatcher.",'','| Entrada | Fuente | Grupo | Ruta SQL revisada |','|---|---|---|---|']
for r in rows:md.append('| '+r['entrypoint']+' | '+r['file']+':'+str(r['line'])+' | '+r['category']+' | '+', '.join(f['name'] for f in r['reviewedSqlPaths'])+' |')
(folder/'surface-guards.md').write_text('\n'.join(md)+'\n')
print(json.dumps({'entries':len(rows),'sqlNames':result['distinctSqlNames'],'groups':{c:sum(r['category']==c for r in rows)for c in sorted(set(r['category']for r in rows))}},indent=2))
