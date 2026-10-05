# Expected independiente — TSK-H4-009/010

Base normativa/Git: `d28ef5badc2fafcd53c69bb969fa8e94abe26fa3`. Derivado antes de producto/migración. Solo local/aislado; fixtures íntegramente sintéticos. Inmutable incluidos bytes después del commit; no implementación como oráculo.

Autoridad: Constitution → Product → Business Rules → Domain Model → State Machines → Architecture → SPEC → Plan → Tasks. Fichas Tasks H4-009/010 completas y protocolos §2.2/§2.3; todas las filas asignadas §6 y bloqueos §7. Fuentes exactas por ID abajo; SPEC §§10.3/10.7/19/24.2/24.4; SM §§2/7/8.3/17/18; DM §§5.1/8/10/14; Plan §§4/5.1/7.1–7.3; Architecture §§5/6/9/12/14; D012/D016/D017/D039.

Las guardas se retiran individualmente, sin eludir contratos de negocio mediante seeds privilegiados. Se permiten inyecciones técnicas identificadas de fallo/seguridad. Evidencia necesaria en cada caso: fixture/IDs y acciones del contrato real, resultado observado frente a este expected, SQL de inspección independiente de raíces/relaciones/historia/efectos, stdout/stderr/exit completos, referencia recuperable y SHA probado. Rechazo conserva estado anterior y no crea hechos de éxito. Pendiente conserva hecho real y solo retira cobertura dependiente.

## R01

- Fuente: SM-PC-01; FR-SVC-008; AC-022; BR-SUP-003.
- Fixture/precondición: External S1 Pending, actual provider/offering and reviewed manual B07 record.
- Acción/guardas retiradas: Record unequivocal phone confirmation.
- Expected/estado posterior: Identified immutable fact valid for exact provider/person/service/date/time/quantity/unit/conditions; registrar and both moments retained; no written follow-up required.
- Efectos prohibidos: No fabricated query/Hold/send/audio; no S2 or Booking confirmation.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R02

- Fuente: SM-PC-01; G1/G2; PLAN-C04.
- Fixture/precondición: Same R01, independently remove each material guard.
- Acción/guardas retiradas: Remove source, counterpart, channel, service, date, time, quantity, capacity unit, conditions, price coverage, happenedAt, record, reviewed evidence or actor.
- Expected/estado posterior: Reject affected registration; existing facts unchanged. WhatsApp/email/platform and phone admissible only with unequivocal retained proof.
- Efectos prohibidos: Offering, probably/silence/read/attachment/Task/HA are not confirmation.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R03

- Fuente: SM-BS-04; FR-CAT-007; DM-INV-018; P05.
- Fixture/precondición: Valid fact retained; actual service/catalog versions and current requirements.
- Acción/guardas retiradas: Evaluate exact scope with source-backed capacity and objective eligibility.
- Expected/estado posterior: Confirm only covered service/portion if all pertinent guards pass; record applied sources/versions and evaluation.
- Efectos prohibidos: Client booleans/recommendation cannot replace facts/rules/review.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R04

- Fuente: SM-BS-04; DM-INV-013/022; BR-SVC-003.
- Fixture/precondición: Confirmed fact12; requested16 or different scope.
- Acción/guardas retiradas: Independently vary Booking/service/contribution/night/date/time/provider/variant/quantity/unit/price/conditions and scope versions.
- Expected/estado posterior: Rejected or dependent pending; fact12 remains retrievable; no cross-scope extrapolation.
- Efectos prohibidos: No other service/night/Booking or agreed terms changed.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R05

- Fuente: SM-BS-04; AC-051; BR-DOC-004; SM-DO.
- Fixture/precondición: S1 essential Requirement Pendiente/Recibido/Incidencia; S2 no need.
- Acción/guardas retiradas: Register valid fact then evaluate S1; review document via real H4 API then reevaluate.
- Expected/estado posterior: Fact registration succeeds while S1 pending until real explicit review; S2 independent; motivated No aplica only existing normative basis.
- Efectos prohibidos: No waiver, universal names/rooms or satisfaction from file/Task.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R06

- Fuente: FR-SVC-009; AC-022; DM-INV-036.
- Fixture/precondición: S3 internal Pending, actual internal service.
- Acción/guardas retiradas: Record/evaluate internal responsible capacity/date/time/quantity/conditions proof; individually remove responsible/evidence.
- Expected/estado posterior: Positive exact scope only; missing proof/responsible rejects; no Provider required.
- Efectos prohibidos: No fictional Provider/Invoice/Suplido/external payment; no preparation/execution.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R07

- Fuente: AC-048; SM-FORB-25; BR-TAR-001–003.
- Fixture/precondición: Tarari real H2 and H3 snapshots synthetic.
- Acción/guardas retiradas: Confirm internal service and attempt fiscal/external/cost inference.
- Expected/estado posterior: 15 commercial/3.80 ensemble cost; extras25/50 commercial175/325 retain unknown costs; economy untouched.
- Efectos prohibidos: No zero unknown, extrapolation/profit/fiscality/Internal invoice.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R08

- Fuente: AC-020; SM-FORB-05; BR-AVAIL-001–006.
- Fixture/precondición: Availability hay sitio12 current verified.
- Acción/guardas retiradas: Attempt availability/Offering/query/Hold reference as sole confirmation; then real valid independent fact.
- Expected/estado posterior: Availability remains availability, no16/firm commitment; own guards required.
- Efectos prohibidos: No hold auto release/substitution.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R09

- Fuente: SM-PC-02; G4; E8.
- Fixture/precondición: Historical valid fact/current confirmed evaluation.
- Acción/guardas retiradas: Open localized review using new source,cause,affected aspects,before/after and dependencies; remove each individually.
- Expected/estado posterior: Retain immutable fact and previous evaluation; withdraw only dependent current coverage; existing B07 Review/history/Task linked.
- Efectos prohibidos: No editing original or wholesale propagation.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R10

- Fuente: SM-PC-03; G2/G4; BR-SUP-004.
- Fixture/precondición: Pending localized Review.
- Acción/guardas retiradas: Verify new evidence/corrected fact linked original; remove new proof,original/review,authority,source,reason,scope individually.
- Expected/estado posterior: New identity linked old, correction and prior Review remain; ratify only covered aspects; client agreement unchanged.
- Efectos prohibidos: No in-place correction or implicit total ratification.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R11

- Fuente: BR-AVAIL-005; E8; SM-PC-02/03.
- Fixture/precondición: Later verified source fact and older received late/ambiguous recent communication.
- Acción/guardas retiradas: Attempt overwrite by receipt order/equal conflicting moment; register uncertainty Review.
- Expected/estado posterior: Historical facts preserved; no arbitrary precedence, old/ambiguous cannot replace currently applicable coverage; E8 dependent pending.
- Efectos prohibidos: No accepted price/terms rewrite.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R12

- Fuente: AC-092; SM-FORB-11; BR-SVC-007/009.
- Fixture/precondición: Request11:00 alternatives10:00/12:30/16:00; capacity restriction material.
- Acción/guardas retiradas: Attempt alternative as final, then actual verified agreement12:30; agenda justification while objective guard fails.
- Expected/estado posterior: Only explicit agreement fixes final commitment; request/alternatives retained; objective capacity still blocks.
- Efectos prohibidos: No agenda engine H4-011/012; no security waiver.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R13

- Fuente: DM-INV-013; AC-019; BR-PAX-004–007.
- Fixture/precondición: Real H2 nights12/10 and4 named linked night1.
- Acción/guardas retiradas: Confirm only night1; test night2/unit/quantity; inspect aggregates and nominal rows.
- Expected/estado posterior: 12 remains12, night2 stays10 and independent;4 not added; no8 fictional people or rooms required.
- Efectos prohibidos: No contact creation/global operational block.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R14

- Fuente: SM-FORB-05/11/25; G5; D012.
- Fixture/precondición: Apparently favorable context/valid fact.
- Acción/guardas retiradas: Explicit unsupported command or data attempts confirmBooking,execute,prepare,Refund,payment,close,autoRelease,waiveRestriction.
- Expected/estado posterior: Reject unsupported effects; compare all economy/Hold/Booking histories and rows.
- Efectos prohibidos: No later task capability accredited by mock/seed.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R15

- Fuente: G1; F1/F2; Architecture §§5/14.
- Fixture/precondición: Ordinary runtime and scoped actor.
- Acción/guardas retiradas: Absent/fake/invalid envelopes; wrong purpose/context/session; direct runtime/anon/authenticated CRUD.
- Expected/estado posterior: Denied fail closed with no existence leak; roles nonowner/nonBYPASSRLS; existing D039 partition preserved.
- Efectos prohibidos: No alternate authorization/TTE bypass/AI executor.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R16

- Fuente: G1/G6; PLAN-C01/C03.
- Fixture/precondición: Recorded fact/operation, then actor disabled/session revoked/scope lost.
- Acción/guardas retiradas: Read/apply/replay/cross Booking/service/provider/B07 record/unknown UUID.
- Expected/estado posterior: Reauthorize before previous results; unknown/alien uniform not found/denied; no enumeration.
- Efectos prohibidos: No private history/content/economy disclosure.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R17

- Fuente: C04; D016/D017; DM-PENDING-005.
- Fixture/precondición: Private original actual official Storage and correction lineage.
- Acción/guardas retiradas: Confirm with original/manual record; read purpose projection, inspect objects/history.
- Expected/estado posterior: Reuse B07 private original/derived distinction, originals retrievable; projection minimum per purpose.
- Efectos prohibidos: No audio/real data/extraction/consent/retention/deletion policy.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R18

- Fuente: G6; V-AT; C03.
- Fixture/precondición: Same reliable fact/operation material.
- Acción/guardas retiradas: Equivalent operation replay; new technical key same reliable fact; same key changed material; distinct similar facts.
- Expected/estado posterior: Same result/no duplicate fact/history/review/Task; E2 changed key; distinct reliable identities separate.
- Efectos prohibidos: No weak text/filename dedup.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R19

- Fuente: T04; G6.
- Fixture/precondición: Independent PG sessions first root no children.
- Acción/guardas retiradas: Equivalent and conflicting same operation registrations both orders with observed overlap.
- Expected/estado posterior: One durable equivalent fact/result; E2 conflict all-or-none.
- Efectos prohibidos: No double root/partial history.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R20

- Fuente: T04; SM-BS-04; G2.
- Fixture/precondición: Two independent confirmations same service evaluation base.
- Acción/guardas retiradas: Concurrent distinct fact registration and evaluations, both orders.
- Expected/estado posterior: Facts separate; coverage evaluation root version protects same base; stale loser conflict; no silent overwrite.
- Efectos prohibidos: No child-only locking/shared coverage gap.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R21

- Fuente: T04; SM-PC-02/03.
- Fixture/precondición: Fact and review shared base.
- Acción/guardas retiradas: Concurrent confirmation vs Review/correction, two corrections; both orders.
- Expected/estado posterior: History complete; stale revisions conflict; linked correction only applicable verified latest.
- Efectos prohibidos: No overwritten original or discarded review.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R22

- Fuente: T04; AC-051.
- Fixture/precondición: Satisfied documentary basis required for evaluation.
- Acción/guardas retiradas: Concurrent requirement change vs confirmation evaluation both orders/overlap.
- Expected/estado posterior: Current result never asserts stale satisfaction; evaluated material versions preserved; localized pending on changed input.
- Efectos prohibidos: No requirement reviewV1 appliedV2.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R23

- Fuente: T04; BR-AVAIL-005; G5.
- Fixture/precondición: Evaluation with explicit material Availability/Hold dependency and independent no dependency.
- Acción/guardas retiradas: Concurrent dependency review/change vs evaluate both orders; independent scope.
- Expected/estado posterior: Only demonstrated dependency affects usability; relevant locks/current versions checked; independent continues.
- Efectos prohibidos: No global expiry/availability assumptions.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R24

- Fuente: V-AT; T04/T08; G4/G6.
- Fixture/precondición: Each registration/evaluation/review/correction path.
- Acción/guardas retiradas: Inject before/during each pertinent root/fact/history/result/Task write and deferred COMMIT failure; retry.
- Expected/estado posterior: Exact rollback whole dependent unit, no orphan/codes/history/effect; retry valid.
- Efectos prohibidos: No external effects/funds reservation; no isolated commit callback.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R25

- Fuente: V-AT; G6; Architecture §12.
- Fixture/precondición: Real successful PostgreSQL COMMIT, response subsequently lost.
- Acción/guardas retiradas: Recover same operation identity.
- Expected/estado posterior: Durable authorized result recovered with no second confirmation/review/evaluation/effect.
- Efectos prohibidos: No assume rollback/retry sensitive blindly.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R26

- Fuente: V-MIG; Plan §5.1.
- Fixture/precondición: 41 migration populated baseline including reviewed Requirement, INC/history, Availability, Hold/private originals.
- Acción/guardas retiradas: Fresh42; upgrade41; inject DDL failure rollback/retry; compare rows/catalog/hash.
- Expected/estado posterior: All41 previous bytes unchanged; IDs/terms/quantities/funds/economy/history/objects/owners/ACL/functions/policies/triggers/roles preserved.
- Efectos prohibidos: No hosted/new tool version/dependency mutation.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R27

- Fuente: V-DAT; Architecture; F1/F2.
- Fixture/precondición: Fresh42 isolated PostgreSQL.
- Acción/guardas retiradas: Audit RLS/FORCE RLS owners ACL helpers safe search_path; local CLI advisors stdout/stderr/exit.
- Expected/estado posterior: Private tables denied direct CRUD; PUBLIC helper EXECUTE absent; narrow authorized APIs; advisors passes.
- Efectos prohibidos: No service_role/owner ordinary actor/hosted access.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R28

- Fuente: V-EVI; PT-03; Plan §§4/7; D012.
- Fixture/precondición: Frozen exact product/verifier commit.
- Acción/guardas retiradas: Run complete regressions/gates/health/V-MIG; trace all sources/cases/logs/Fxx.
- Expected/estado posterior: Real counts no double count, no material FAIL/skipped/cancelled; SHAs, captures/hashes and limitations recoverable.
- Efectos prohibidos: No global source acceptance/H4-021/H6-001 integrated claim.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

## R29

- Fuente: G3; T08; D039.
- Fixture/precondición: Manual approved actor and existing sensitive capabilities.
- Acción/guardas retiradas: Attempt AI origin or approval-only fact registration without exact execution fact.
- Expected/estado posterior: Deny unsupported sensitive AI flow; approval never replaces fact proof; existing TTE regression intact.
- Efectos prohibidos: No sensitive executor/new approval subsystem.
- Evidencia: contrato y SQL independientes, antes/después, resultado completo recuperable conforme a V-EVI.

Integraciones futuras expresamente NO ACREDITADAS: H4-021 y H6-001. H4-011+ y H5/H6 siguen NOT STARTED. Sin agenda completa, confirmación conjunta Booking, preparación/ejecución completas, modificación/revalidación completas D019/D020, Refund/fianza, cierres/Closure Assessment, conectores ni efecto externo real. Hosted H2/H3 no acreditados; Production no autorizada. DM-PENDING-005 y pendientes globales conservados.
