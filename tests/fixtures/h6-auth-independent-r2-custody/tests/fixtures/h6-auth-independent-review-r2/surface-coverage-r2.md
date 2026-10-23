# Mapa independiente de guardias y observación R2

105 entradas Core + 5 lifecycle + 1 metadato de identificación. Las líneas de guardia completas y variantes SQL están en surface-coverage-r2.json. Los 105 controles positivos y sus 630 denegaciones directas/630 HTTP fueron reproducidos en la copia independiente.

| Entrada | Fuente | Grupo | Guardia SQL | Evidencia |
|---|---|---|---|---|
| `H0005PostgresAdapter.establish` | `src/infrastructure/postgres/h0-005-adapter.ts:83` | session-management-not-ordinary-core-matrix | establish_session | Lifecycle/F01; no matriz ordinaria |
| `H0005PostgresAdapter.reidentify` | `src/infrastructure/postgres/h0-005-adapter.ts:109` | session-management-not-ordinary-core-matrix | reidentify_session | Lifecycle/F01; no matriz ordinaria |
| `H0005PostgresAdapter.revokeOne` | `src/infrastructure/postgres/h0-005-adapter.ts:130` | session-management-not-ordinary-core-matrix | revoke_session | Lifecycle/F01; no matriz ordinaria |
| `H0005PostgresAdapter.revokeAll` | `src/infrastructure/postgres/h0-005-adapter.ts:144` | session-management-not-ordinary-core-matrix | revoke_all_sessions | Lifecycle/F01; no matriz ordinaria |
| `H0005PostgresAdapter.readCoreProbe` | `src/infrastructure/postgres/h0-005-adapter.ts:177` | core-single-transaction | human_read_probe | 6 estados: 42501/lookup0 + HTTP403 |
| `H0005PostgresAdapter.applyCoreProbe` | `src/infrastructure/postgres/h0-005-adapter.ts:204` | core-single-transaction | human_apply_probe_batch | 6 estados: 42501/lookup0 + HTTP403 |
| `H0011PostgresAdapter.propose` | `src/infrastructure/postgres/h0-011-adapter.ts:292` | tte-human-approval-command | h0_m04_command, commit_internal_unit, h0_m04_finalize_evidence | 6 estados: 42501/lookup0 + HTTP403 |
| `H0011PostgresAdapter.decide` | `src/infrastructure/postgres/h0-011-adapter.ts:299` | tte-human-approval-command | h0_m04_command, commit_internal_unit, h0_m04_finalize_evidence | 6 estados: 42501/lookup0 + HTTP403 |
| `H0011PostgresAdapter.reserve` | `src/infrastructure/postgres/h0-011-adapter.ts:328` | tte-human-approval-command | h0_m04_command, commit_internal_unit, h0_m04_finalize_evidence, h0_m04_evidence_replay, h0_m04_revalidate_evidence | 6 estados: 42501/lookup0 + HTTP403 |
| `H0011PostgresAdapter.scheduleProviderPayment` | `src/infrastructure/postgres/h0-011-adapter.ts:334` | tte-human-approval-command | h0_m04_command, commit_internal_unit, h0_m04_finalize_evidence, h0_m04_evidence_replay, h0_m04_revalidate_evidence, provider_payment_sensitive_schedule, provider_payment_finalize | 6 estados: 42501/lookup0 + HTTP403 |
| `H0011PostgresAdapter.authorizeRefund` | `src/infrastructure/postgres/h0-011-adapter.ts:342` | tte-human-approval-command | h0_m04_command, commit_internal_unit, h0_m04_finalize_evidence, h0_m04_evidence_replay, h0_m04_revalidate_evidence, refund_sensitive_authorize, refund_finalize | 6 estados: 42501/lookup0 + HTTP403 |
| `H0011PostgresAdapter.evaluateBookingPreparation` | `src/infrastructure/postgres/h0-011-adapter.ts:347` | tte-human-approval-command | h0_m04_command, commit_internal_unit, h0_m04_finalize_evidence, h0_m04_evidence_replay, h0_m04_revalidate_evidence, booking_preparation_sensitive, booking_preparation_finalize | 6 estados: 42501/lookup0 + HTTP403 |
| `H0011PostgresAdapter.recordReality` | `src/infrastructure/postgres/h0-011-adapter.ts:351` | tte-human-approval-command | h0_m04_command, commit_internal_unit, h0_m04_finalize_evidence, h0_m04_evidence_replay, h0_m04_revalidate_evidence, reality_sensitive, reality_finalize | 6 estados: 42501/lookup0 + HTTP403 |
| `H0011PostgresAdapter.determineDeposit` | `src/infrastructure/postgres/h0-011-adapter.ts:356` | tte-human-approval-command | h0_m04_command, commit_internal_unit, h0_m04_finalize_evidence, h0_m04_evidence_replay, h0_m04_revalidate_evidence, deposit_sensitive_determine, deposit_finalize | 6 estados: 42501/lookup0 + HTTP403 |
| `H0011PostgresAdapter.readProposal` | `src/infrastructure/postgres/h0-011-adapter.ts:385` | tte-human-approval-read | h0_m04_read_proposal | 6 estados: 42501/lookup0 + HTTP403 |
| `H0013GlobalAccessRevocationAdapter.revokeAll` | `src/infrastructure/postgres/h0-013-adapter.ts:142` | session-management-not-ordinary-core-matrix | start_global_access_revocation, record_global_auth_revocation_outcome | Lifecycle/F01; no matriz ordinaria |
| `H1005CatalogAdapter.apply` | `src/infrastructure/postgres/h1-catalog-adapter.ts:76` | core-single-transaction | catalog_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H1005CatalogAdapter.read` | `src/infrastructure/postgres/h1-catalog-adapter.ts:106` | core-single-transaction | catalog_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H1007CommercialAdapter.apply` | `src/infrastructure/postgres/h1-commercial-adapter.ts:75` | core-single-transaction | commercial_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H1007CommercialAdapter.read` | `src/infrastructure/postgres/h1-commercial-adapter.ts:106` | core-single-transaction | commercial_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H1013EvidenceAdapter.apply` | `src/infrastructure/postgres/h1-evidence-adapter.ts:79` | core-single-transaction | b07_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H1013EvidenceAdapter.read` | `src/infrastructure/postgres/h1-evidence-adapter.ts:107` | core-single-transaction | b07_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H1001IdentityAdapter.apply` | `src/infrastructure/postgres/h1-identity-adapter.ts:105` | core-single-transaction | identity_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H1001IdentityAdapter.read` | `src/infrastructure/postgres/h1-identity-adapter.ts:142` | core-single-transaction | identity_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H1015ObjectAdapter.prepare` | `src/infrastructure/postgres/h1-object-adapter.ts:68` | core-single-transaction | b07_object_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H1015ObjectAdapter.metadata` | `src/infrastructure/postgres/h1-object-adapter.ts:74` | core-single-transaction | b07_object_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H1015ObjectAdapter.upload` | `src/infrastructure/postgres/h1-object-adapter.ts:81` | storage-multiunit | b07_object_read, b07_object_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H1015ObjectAdapter.reconcile` | `src/infrastructure/postgres/h1-object-adapter.ts:89` | storage-multiunit | b07_object_read, b07_object_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H1015ObjectAdapter.link` | `src/infrastructure/postgres/h1-object-adapter.ts:98` | storage-multiunit | b07_object_read, b07_object_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H1015ObjectAdapter.download` | `src/infrastructure/postgres/h1-object-adapter.ts:107` | storage-multiunit | b07_object_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H1015ObjectAdapter.diagnoseOrphan` | `src/infrastructure/postgres/h1-object-adapter.ts:117` | storage-multiunit | b07_object_read, b07_object_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H1003ResolutionAdapter.apply` | `src/infrastructure/postgres/h1-resolution-adapter.ts:85` | core-single-transaction | identity_resolve | 6 estados: 42501/lookup0 + HTTP403 |
| `H1003ResolutionAdapter.candidates` | `src/infrastructure/postgres/h1-resolution-adapter.ts:114` | core-single-transaction | identity_candidates | 6 estados: 42501/lookup0 + HTTP403 |
| `H1003ResolutionAdapter.findCode` | `src/infrastructure/postgres/h1-resolution-adapter.ts:134` | core-single-transaction | identity_code_lookup | 6 estados: 42501/lookup0 + HTTP403 |
| `H1017TaskAdapter.apply` | `src/infrastructure/postgres/h1-task-adapter.ts:59` | core-single-transaction | b07_task_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H1017TaskAdapter.read` | `src/infrastructure/postgres/h1-task-adapter.ts:66` | core-single-transaction | b07_task_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H2007AcceptanceAdapter.apply` | `src/infrastructure/postgres/h2-acceptance-adapter.ts:33` | core-single-transaction | acceptance_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H2007AcceptanceAdapter.read` | `src/infrastructure/postgres/h2-acceptance-adapter.ts:34` | core-single-transaction | acceptance_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H2009BookingAdapter.apply` | `src/infrastructure/postgres/h2-booking-adapter.ts:40` | core-single-transaction | booking_apply, identity_resolve | 6 estados: 42501/lookup0 + HTTP403 |
| `H2009BookingAdapter.direct` | `src/infrastructure/postgres/h2-booking-adapter.ts:42` | composed-same-transaction | b03_apply, proposal_sources, proposal_apply, offer_apply, acceptance_apply, booking_apply, identity_resolve | 6 estados: 42501/lookup0 + HTTP403 |
| `H2009BookingAdapter.read` | `src/infrastructure/postgres/h2-booking-adapter.ts:57` | core-single-transaction | booking_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H2001CommercialAdapter.apply` | `src/infrastructure/postgres/h2-commercial-adapter.ts:48` | core-single-transaction | b03_apply, identity_resolve | 6 estados: 42501/lookup0 + HTTP403 |
| `H2001CommercialAdapter.read` | `src/infrastructure/postgres/h2-commercial-adapter.ts:56` | core-single-transaction | b03_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H2005OfferAdapter.apply` | `src/infrastructure/postgres/h2-offer-adapter.ts:34` | core-single-transaction | offer_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H2005OfferAdapter.read` | `src/infrastructure/postgres/h2-offer-adapter.ts:35` | core-single-transaction | offer_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H2003ProposalAdapter.apply` | `src/infrastructure/postgres/h2-proposal-adapter.ts:43` | core-single-transaction | proposal_sources, proposal_apply, identity_resolve | 6 estados: 42501/lookup0 + HTTP403 |
| `H2003ProposalAdapter.read` | `src/infrastructure/postgres/h2-proposal-adapter.ts:47` | core-single-transaction | proposal_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H3005AllocationAdapter.apply` | `src/infrastructure/postgres/h3-allocation-adapter.ts:36` | core-single-transaction | allocation_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H3005AllocationAdapter.read` | `src/infrastructure/postgres/h3-allocation-adapter.ts:49` | core-single-transaction | allocation_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H3007InvoiceAdapter.apply` | `src/infrastructure/postgres/h3-invoice-adapter.ts:41` | core-single-transaction | invoice_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H3007InvoiceAdapter.read` | `src/infrastructure/postgres/h3-invoice-adapter.ts:44` | core-single-transaction | invoice_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H3001ObligationAdapter.apply` | `src/infrastructure/postgres/h3-obligation-adapter.ts:34` | core-single-transaction | obligation_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H3001ObligationAdapter.read` | `src/infrastructure/postgres/h3-obligation-adapter.ts:39` | core-single-transaction | obligation_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H3001ObligationAdapter.evaluate` | `src/infrastructure/postgres/h3-obligation-adapter.ts:43` | exact-delegation | obligation_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H3013OwnEconomicsAdapter.apply` | `src/infrastructure/postgres/h3-own-economics-adapter.ts:29` | core-single-transaction | own_economics_sources, own_economics_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H3013OwnEconomicsAdapter.read` | `src/infrastructure/postgres/h3-own-economics-adapter.ts:33` | core-single-transaction | own_economics_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H3003PaymentAdapter.apply` | `src/infrastructure/postgres/h3-payment-adapter.ts:33` | core-single-transaction | payment_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H3003PaymentAdapter.read` | `src/infrastructure/postgres/h3-payment-adapter.ts:37` | core-single-transaction | payment_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H3011ProviderPaymentAdapter.apply` | `src/infrastructure/postgres/h3-provider-payment-adapter.ts:26` | core-single-transaction | provider_payment_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H3011ProviderPaymentAdapter.read` | `src/infrastructure/postgres/h3-provider-payment-adapter.ts:29` | core-single-transaction | provider_payment_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H3009SuplidoAdapter.apply` | `src/infrastructure/postgres/h3-suplido-adapter.ts:39` | core-single-transaction | suplido_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H3009SuplidoAdapter.read` | `src/infrastructure/postgres/h3-suplido-adapter.ts:42` | core-single-transaction | suplido_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4005AvailabilityAdapter.apply` | `src/infrastructure/postgres/h4-availability-adapter.ts:30` | core-single-transaction | availability_apply, b07_task_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H4005AvailabilityAdapter.read` | `src/infrastructure/postgres/h4-availability-adapter.ts:33` | core-single-transaction | availability_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4005AvailabilityAdapter.evaluate` | `src/infrastructure/postgres/h4-availability-adapter.ts:36` | core-single-transaction | availability_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4020BookingPreparationAdapter.apply` | `src/infrastructure/postgres/h4-booking-preparation-adapter.ts:24` | core-single-transaction | booking_preparation_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H4020BookingPreparationAdapter.read` | `src/infrastructure/postgres/h4-booking-preparation-adapter.ts:25` | core-single-transaction | booking_preparation_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4013CancellationAdapter.apply` | `src/infrastructure/postgres/h4-cancellation-adapter.ts:25` | core-single-transaction | cancellation_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H4013CancellationAdapter.basis` | `src/infrastructure/postgres/h4-cancellation-adapter.ts:26` | core-single-transaction | cancellation_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4013CancellationAdapter.read` | `src/infrastructure/postgres/h4-cancellation-adapter.ts:27` | core-single-transaction | cancellation_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4009ConfirmationAdapter.apply` | `src/infrastructure/postgres/h4-confirmation-adapter.ts:30` | core-single-transaction | confirmation_apply, b07_task_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H4009ConfirmationAdapter.read` | `src/infrastructure/postgres/h4-confirmation-adapter.ts:33` | core-single-transaction | confirmation_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4009ConfirmationAdapter.assess` | `src/infrastructure/postgres/h4-confirmation-adapter.ts:34` | core-single-transaction | confirmation_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4017DepositAdapter.apply` | `src/infrastructure/postgres/h4-deposit-adapter.ts:24` | core-single-transaction | deposit_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H4017DepositAdapter.read` | `src/infrastructure/postgres/h4-deposit-adapter.ts:25` | core-single-transaction | deposit_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4007HoldAdapter.apply` | `src/infrastructure/postgres/h4-hold-adapter.ts:30` | core-single-transaction | hold_apply, b07_task_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H4007HoldAdapter.read` | `src/infrastructure/postgres/h4-hold-adapter.ts:33` | core-single-transaction | hold_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4007HoldAdapter.evaluate` | `src/infrastructure/postgres/h4-hold-adapter.ts:34` | core-single-transaction | hold_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4003IncidentAdapter.apply` | `src/infrastructure/postgres/h4-incident-adapter.ts:31` | core-single-transaction | incident_apply, identity_resolve | 6 estados: 42501/lookup0 + HTTP403 |
| `H4003IncidentAdapter.read` | `src/infrastructure/postgres/h4-incident-adapter.ts:34` | core-single-transaction | incident_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4003IncidentAdapter.byCode` | `src/infrastructure/postgres/h4-incident-adapter.ts:37` | core-single-transaction | incident_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4003IncidentAdapter.evaluate` | `src/infrastructure/postgres/h4-incident-adapter.ts:38` | core-single-transaction | incident_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4011ModificationAdapter.apply` | `src/infrastructure/postgres/h4-modification-adapter.ts:32` | core-single-transaction | modification_apply, b07_task_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H4011ModificationAdapter.read` | `src/infrastructure/postgres/h4-modification-adapter.ts:35` | core-single-transaction | modification_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4011ModificationAdapter.assess` | `src/infrastructure/postgres/h4-modification-adapter.ts:36` | core-single-transaction | modification_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4022OperationalRealityAdapter.apply` | `src/infrastructure/postgres/h4-operational-reality-adapter.ts:24` | core-single-transaction | reality_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H4022OperationalRealityAdapter.read` | `src/infrastructure/postgres/h4-operational-reality-adapter.ts:25` | core-single-transaction | reality_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4015RefundAdapter.apply` | `src/infrastructure/postgres/h4-refund-adapter.ts:25` | core-single-transaction | refund_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H4015RefundAdapter.applyGuarantee` | `src/infrastructure/postgres/h4-refund-adapter.ts:26` | core-single-transaction | refund_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H4015RefundAdapter.read` | `src/infrastructure/postgres/h4-refund-adapter.ts:27` | core-single-transaction | refund_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4001RequirementAdapter.apply` | `src/infrastructure/postgres/h4-requirement-adapter.ts:26` | core-single-transaction | requirement_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H4001RequirementAdapter.read` | `src/infrastructure/postgres/h4-requirement-adapter.ts:29` | core-single-transaction | requirement_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H4001RequirementAdapter.evaluate` | `src/infrastructure/postgres/h4-requirement-adapter.ts:32` | core-single-transaction | requirement_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H5003AlertAdapter.apply` | `src/infrastructure/postgres/h5-alert-adapter.ts:58` | core-single-transaction | b07_alert_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H5003AlertAdapter.read` | `src/infrastructure/postgres/h5-alert-adapter.ts:61` | core-single-transaction | b07_alert_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H5013ClosureAdapter.apply` | `src/infrastructure/postgres/h5-closure-adapter.ts:24` | core-single-transaction | closure_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H5013ClosureAdapter.close` | `src/infrastructure/postgres/h5-closure-adapter.ts:25` | core-single-transaction | closure_joint_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H5013ClosureAdapter.read` | `src/infrastructure/postgres/h5-closure-adapter.ts:26` | core-single-transaction | closure_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H5005CommunicationAdapter.apply` | `src/infrastructure/postgres/h5-communication-adapter.ts:32` | core-single-transaction | b07_communication_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H5005CommunicationAdapter.read` | `src/infrastructure/postgres/h5-communication-adapter.ts:33` | core-single-transaction | b07_communication_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H5017DiagnosticAdapter.record` | `src/infrastructure/postgres/h5-diagnostic-adapter.ts:26` | core-single-transaction | h5_diagnostic_record | 6 estados: 42501/lookup0 + HTTP403 |
| `H5017DiagnosticAdapter.read` | `src/infrastructure/postgres/h5-diagnostic-adapter.ts:34` | core-single-transaction | h5_diagnostic_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H5009ExternalEventAdapter.receive` | `src/infrastructure/postgres/h5-external-event-adapter.ts:40` | core-single-transaction | b09_external_event_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H5011ProjectionAdapter.read` | `src/infrastructure/postgres/h5-projection-adapter.ts:18` | core-single-transaction | h5_projection_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H5001TaskAdapter.apply` | `src/infrastructure/postgres/h5-task-adapter.ts:37` | exact-delegation | b07_task_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `H5001TaskAdapter.balanceNeeds` | `src/infrastructure/postgres/h5-task-adapter.ts:41` | exact-delegation | obligation_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H5001TaskAdapter.read` | `src/infrastructure/postgres/h5-task-adapter.ts:55` | exact-delegation | b07_task_read | 6 estados: 42501/lookup0 + HTTP403 |
| `H5001TaskAdapter.transition` | `src/infrastructure/postgres/h5-task-adapter.ts:59` | core-single-transaction | b07_task_apply | 6 estados: 42501/lookup0 + HTTP403 |
| `createPersistedWorkExecutor.apply` | `src/infrastructure/postgres/persisted-work-executor.ts:78` | tte-persisted-work | b08_work_probe, b08_work_probe_material, b08_work_lock, b08_work_apply, b08_work_finalize, b08_ha_finalize, h0_m04_command, h0_m04_revalidate_evidence, h0_m04_finalize_evidence, commit_internal_unit | 6 estados denegados + HTTP403; SQL privado, fuente y suite integrada |
| `createPersistedWorkExecutor.read` | `src/infrastructure/postgres/persisted-work-executor.ts:47` | tte-persisted-work | b08_work_read | 6 estados denegados + HTTP403; SQL privado, fuente y suite integrada |
| `H0005PostgresAdapter.identificationGeneration` | `src/infrastructure/postgres/h0-005-adapter.ts:75` | identification-metadata | VerifiedAuthEvidence + password + no client Core session + authorized f2_lookup; returned generation is not access authority | Lifecycle/F01; no matriz ordinaria |
