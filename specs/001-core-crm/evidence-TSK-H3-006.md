# Evidencia — TSK-H3-006: Verificación normativa independiente de porciones

**COMPLETED local/aislado.** Autorización humana exclusiva TSK-H3-005/006; STOP al publicar006, sin preparar posteriores.

Base inicial `db37469a901d7543ae10e2ce42a95824b33d24ce`, comprobada tras git fetch origin: main, árbol limpio, HEAD==origin/main y SHA exacto. H0 técnico/local/aislado, H1/H2 local/aislado COMPLETED; H3 IN PROGRESS; H3-001–004 COMPLETED,005+ NOT STARTED antes de este bloque; H4–H6 NOT STARTED. F01–F08 H3-004 CLOSED, anteriores cerrados, cero materiales abiertos. Health-check independiente intacto; hosted H2/H3 no acreditados y Production no autorizada. Sin reset, sobrescritura ni cambio normativo.

Expected [expected-TSK-H3-005-006.md](expected-TSK-H3-005-006.md): **75 casos y 48 filas Tasks §6**, derivados exclusivamente de fichas y fuentes aprobadas, congelados antes del producto en `034ddc00acc582a288653e174c09c049334c473e`. SHA256 `a1ef3d39bbeaf78db6eb437338e9ba38a321608bd0ce97fd73d0eb2735f835a8`, idéntico tras todos los fixes. Las fichas completas005/006 y todas sus filas/guardas referenciadas se contrastaron; Plan5.1–5.2/7.1–7.3, B05/B08/T05/T07/C02/C03/C06/PT04/PT12, SPEC CHG008/ECON002004005006/IDEMP001002/CONC002003, AC023026027028040044068, DM11/INV030032, SM-EP0204/CP04/RC020304/FORB152627/G1–G6/E2, Architecture12.1–12.3, D019/D023/D029 y restantes decisiones asignadas, PM08111213. E2E05 solo segmento local autorizado; integraciones posteriores no acreditadas.

**Commit exacto de producto/verificación probado: `3113028f26a906f2b4f6935ae0bb59877c59d74d`.** Producto/dominio/migración idénticos a `4cb0bd8fe6d2bf7fcc86b1a03f9f9168881c8269`; los commits siguientes refinan verificadores y el inventario histórico. El commit documental final y SHA publicado se distinguen en Git/informe final. Node24.21.0, pnpm11.19.0, PostgreSQL17.11, SupabaseCLI2.118.0; clusters efímeros y sesiones independientes, evidencias/fuentes/actores/datos exclusivamente sintéticos. Sin fondos ni efectos externos reales.

## Implementado

[Dominio](../../src/domain/payment-allocation.ts), [API/adaptador](../../src/infrastructure/postgres/h3-allocation-adapter.ts) y [migración forward](../../supabase/migrations/20261003110048_h3_payment_allocation_funds.sql). Reutilizan Customer Payment/recepción/Reconciliation de H3-003 y Policy/Schedule/Expected/obligaciones de H3-001. No duplican modelos ni recalculan deuda desde cobros.

Payment Allocation relaciona raíz Customer Payment, porción por inicio/importe, Reconciliation y revisión aplicada, Booking, destino/finalidad, Schedule/slot/servicio cuando corresponde, fuente/evidencia humana revisada, actor, momento y revisiones. Plan, asignación verificada, validación de plan, consumo interno, rectificación y reversión son actos separados. La IA puede proponer plan y no validar/consumir/rectificar. Toda modificación material necesita autoridad concreta B07/F1/F2; un payload no la concede.

Ocho tablas nuevas append-only: b05_allocations, b05_allocation_revisions, b05_allocation_acts, b05_fund_operations, b05_fund_revisions, b05_fund_history, b05_coverage_evaluations y b05_fund_distributions. Relaciones originales, actos firmados e historial conservan fuente/antes/después/actor/motivo. Reversión exacta enlazada y única; no borrar o reescribir originales, ni revertir el banco.

Dimensiones reconstruibles separadas: recibido bruto verificado; correspondencia utilizable; plan; asignado histórico activo; asignado utilizable; no asignado; no asignado utilizable; consumo interno histórico/utilizable/suspendido; disponibilidad por finalidad; cobertura. `received = assigned + unassigned`; `verifiedCorrespondence = usableAssigned + available`; cada finalidad conserva `usableAssigned = usableConsumed + availableForPurpose`. Consumo es subconjunto de asignación; no se suman dimensiones solapadas como si fueran nuevos fondos. Una incidencia posterior conserva consumo histórico y suspende su parte utilizable: no convierte porciones dudosas en disponibles ni elimina independientes. Resolverla no duplica importes. Sin hecho de Refund previo representable, `representedReturned=0.00` y `externalReturned=null` (banco desconocido), nunca devolución real inferida.

Cobertura H3-001 integrada: pendiente/parcial/completa deriva exclusivamente de porciones verificadas y asignadas a la obligación pertinente, múltiples pagos por una obligación y destinos disjuntos por movimiento. Expected/detección/recepción sola/propuesta/plan no cubren. La actualización se conserva con Allocation/consumo/operación/historia, y los triggers de revisión de Customer Payment/Schedule reevaluan incidencias/rectificaciones/cambios de obligación en la misma unidad. C01 obligation_read añade cobertura derivada autenticada; original/snapshot/ajustes anteriores intactos. Ajuste conserva original; exceso posterior visible no se redistribuye implícitamente.

PLAN-T05 usa la misma raíz `payment-root:<UUID>` que H3-003, aun sin hijos; además operación/idempotencia, lock Booking52 para agregado de obligación y locks F2 acreditados. Revisión obsoleta y misma identidad/material distinto dan conflicto sin dinero adicional. Replay autorizado recupera resultado durable; lectura no consume. Atomicidad de todos los hechos dependientes, incluida cobertura/historia y COMMIT.

D019: efecto dependiente de cancelación/devolución/nueva obligación/modificación exige base económica humana previamente determinada, original/fuente/importe/versión y evidencia revisada ligada a raíz y contenido. Ausencia/null/tipo erróneo/material distinto bloquea solo ese efecto. Fondos no crean derecho, porcentajes ni compensación entre clientes; no se implementa H4 ni Refund real para resolverlo.

Único motor monetario H1 exact-money: captura/reconstrucción de CalculationRecord, algoritmo/versiones H1, importes definitivos strings y numeric decimal relacional; sin floats ni number como autoridad. SQL valida igualdades racionales/céntimos y la captura H1, no introduce otra política de cuantización. Pesos/orden/internos/céntimos/restos/residuo/versión quedan persistidos. Reversión usa el original, sin recalcular ni redondear otra vez.

RLS/FORCE RLS y ACL mínimas; owner/executor NOLOGIN/NOBYPASSRLS, runtime sin SELECT/DML/TRUNCATE ordinario, sin acceso PUBLIC/anon/authenticated. SECURITY DEFINER únicamente APIs estrechas bajo patrón previo F1/F2, executor sin bypass y search_path pg_catalog,pg_temp; admisión/comprobación final también en replay. Helpers privados y triggers invoker no abiertos a runtime. C01 exige ID exacto y finalidad/actor internos; búsqueda por referencia/importe, scope forjado y proyección a terceros denegados. Sin costes/márgenes/comisiones/evidencias ajenas o datos bancarios no necesarios; sin políticas reales de retención inventadas.

## Verificado

**83/83 del bloque:** matriz independiente75/75 +7/7 reproducers +1/1 focal. **Regresión final852/852 PostgreSQL y100/100 unitarias =952/952 pruebas**, sin volver a sumar los83 ya incluidos. 0 FAIL/skipped/cancelled; V-DOM/V-DAT/V-MIG/V-SM/V-NEG/V-AT/V-EVI y familias asignadas PASS. Revalidación afectadaF08 91/91; upgrade poblado adicional1/1 PASS.

100/80/80: ambos órdenes, claves iguales/distintas, asignación y consumo concurrentes, porciones solapadas, destinos iguales/distintos y ausencia inicial de hijos. Un80 y20 restantes; segundo conflicto/insuficiencia o replay autorizado, jamás160 ni saldo negativo. Sesiones PostgreSQL independientes y solapamiento real observado en pg_stat_activity; el bloqueador controla raíz de movimiento, no hijo. Carrera sobre destinos/obligaciones distintas no permite mudar una porción que su Reconciliation solo vincula al destino comprobado. Dos movimientos compiten por una obligación500: agregado serializado, no sobrecubrir. Modificación/reversión y Allocation contra incidencia/rectificación Customer Payment sin overwrite ni suspensión incoherente.

Varios pagos200+300 cubren obligación500 mediante dos porciones, sin relación artificial1:1. Un movimiento500 distribuye200 a initial y300 a balance con correspondencias disjuntas; conserva fuente/destino.500 recibidos/200 comprobados y asignados dejan300 no asignados/sin destino, sin cobertura automática. Una finalidad interna sin obligación enlazada no cubre el Schedule por su mera existencia.100 dudosos de200 asignados dejan100 de cobertura y bloquean consumo del alcance dudoso;100 independientes siguen utilizables.

PM-08: +500.01→−500.01 y acto interno−20.00→+20.00; original/causa/enlace intactos, bruto recibido histórico conservado, ninguna salida bancaria acreditada. PM-11:100→33.34/33.33/33.33, residuoA por empate/orden. PM-12:0.05 con1/1/2 conserva internos0.0125/0.0125/0.025, céntimos1/1/2 y restos0.0025/0.0025/0.005; finales0.01/0.01/0.03, residuoC. PM-13: negativos−33.34/−33.33/−33.33 y−0.01/−0.01/−0.03, magnitud primero/signo después. Capturas relacionales reproducidas por H1 y conservadas al cambiar política vigente.

Fallos antes de primera escritura, después Allocation/revisión/actos/cobertura, consumo/ajuste/reversión, mitad de reparto, historia/resultado y trigger diferido en COMMIT: rollback conjunto comprobado por snapshots completos. Respuesta perdida/timeout después de COMMIT devuelve resultado previo; ninguna nueva Allocation/consumo/cobertura/ajuste. Durante escritura no confirmada una conexión inspectora ve estado anterior íntegro; C01 puede esperar el lock de actor F2 y devuelve el estado completo al confirmar. Singleton humano previo intacto, sin inventar otro Administrador.

**V-MIG PASS:** nueva migración oficial por `pnpm dlx supabase@2.118.0 migration new h3_payment_allocation_funds`, tras help. Fresh33; upgrade H3-004 poblado con Booking/Expected/detección/recepción/Reconciliation/discrepancia/rectificación y primera asignación posterior de fondos anteriores; rollback de fallo y roles opcionales ausentes.32 migraciones byte a byte preservadas. Datos/IDs/importes/porciones/historia y owners/ACL/RLS/policies/roles/objetos previos intactos. Única definición previa ampliada: obligation_read añade cobertura autenticada; dos triggers nuevos en revisiones previas, sin sustituir hechos ni APIs de escritura anteriores. Sin despliegue hosted ni cambio de health-check independiente.

Instalación congelada/typecheck/lint y boundaries/build/auditoría production (sin vulnerabilidades conocidas)/diff-check PASS. [Resumen](../../tests/fixtures/h3-006/regression-summary.json), [casos](../../tests/fixtures/h3-006/verification-results.json), [manifest raw](../../tests/fixtures/h3-006/raw-log-manifest.json). Logs gzip byte a byte, hashes de archivo y raw; logs H2 regenerados por harness restaurados byte a byte, sin sustituir su evidencia original. Expected no cambiado.

Comandos: pnpm install --frozen-lockfile; pnpm run typecheck; pnpm run lint; pnpm test; pnpm run build; pnpm audit --prod; POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres. Matriz/focal/reproducers: misma variable y node --test --experimental-strip-types tests/integration/postgres-h3-005.test.ts tests/integration/postgres-h3-006.test.ts tests/integration/postgres-h3-006-defects.test.ts.

## Defectos y límites

**H3-006-F01–F08 CLOSED**, 4 producto/4 verificador, cero materiales abiertos. [Registro append-only](../../tests/fixtures/h3-006/defects.md) y [reproducciones](../../tests/integration/postgres-h3-006-defects.test.ts). F01 palabraSQL reservada; F02 revisiónSQL ambigua; F03 identidad de plan reutilizada/literal no normativo; F04 baseD019 materialmente nula; F05 label efímero mayúsculo y setup interrumpido; F06 revisiónSchedule nula; F07 verificador retiraba contexto Reconciliation exigido; F08 inventarios históricos contaban migración futura.73/75 primer independiente, FAIL nulos conservados, ejecución interrumpida conservada, revalidación82/82, primera regresión848/850 por inventario histórico, afectada91/91 y final852/852. Ningún expected adaptado, FAIL borrado o historia reescrita.

**Pendiente posterior / no acreditado:** H3-007+, H4-019, H6-005, H6-016; carrera completa Refund/fianza; Provider Payment completo/salidas externas; Refund/fianza/suplido/facturación/confirmaciones de proveedor/operación; conectores/banco/fondos reales; hosted/Production. T07 aquí solo contrato de porción/consumo interno, ninguna ejecución de salida. Integración previa H4-021 también pendiente. H3-006 completa solo la integración local de cobertura dejada por001/002 y porciones003/004. Todos los pendientes globales PLAN-AUTH001–006, PLAN-PENDING003 en parte abierta, ARCH/DM/BR-PENDING vigentes, datos reales/catálogo/tarifas/costes/capacidades/plazos/prioridades, retención y puertas reales se conservan.

Estado final: H3 IN PROGRESS; H3-001–006 COMPLETED local/aislado; **H3-007+ y H4–H6 NOT STARTED. STOP obligatorio tras H3-006; continuidad exige nueva autorización humana.**

## Comparación por caso congelado

Precondición/acción/expected/prohibiciones/estado esperado en matriz inmutable; el test de igual ID compara efectos, negativas e historia con snapshots y lecturas reales. Todos los subcasos materiales ejecutados; no producto como oráculo. Observado en raw final y aserciones de tests/integration/postgres-h3-006.test.ts.

| ID | Fuente | Resultado observado |
|---|---|---|
| R01 | ECON002/SM-EP02 | PASS — Expected cannot create funds or coverage |
| R02 | DM-INV030 | PASS — detected cannot allocate verified funds |
| R03 | ECON004/SM-RC02 | PASS — receipt without correspondence cannot cover |
| R04 | SM-RC02 | PASS — proposed Reconciliation cannot cover |
| R05 | ECON005/SM9.3 | PASS — planned Allocation no reservation consumption or coverage |
| R06 | SM-EP02/ECON002 | PASS — partial coverage200 of obligation500 |
| R07 | SM-EP02 | PASS — complete coverage preserves Booking and provider independence |
| R08 | AC028/ECON005 | PASS — multiple real payments cover one obligation without1to1 |
| R09 | ECON005/D029 | PASS — one payment multiple disjoint obligation destinations |
| R10 | SM9.2/ECON005 | PASS — unassigned unresolved300 cannot fund another purpose automatically |
| R11 | AC044/D013/DM-INV032 | PASS — managed funds and Fee distinct no output mandate own income |
| R12 | SM-RC02/G1 | PASS — cross Booking client or service destinations denied |
| R13 | SM-RC02/G2 | PASS — each destination portion amount purpose source evidence guard fails without side effect |
| R14 | SM-RC02/G2 | PASS — no reviewed authorized assertion no checked Allocation |
| R15 | AC026/SM-CP04 | PASS — only200 of500 reconciled does not allow other300 |
| R16 | SM-RC02/G6 | PASS — overlap second allocation cannot count twice |
| R17 | ECON005 | PASS — overlapping forecasts do not consume verified funds |
| R18 | SM-RC02 | PASS — verifying forecast adds linked act once and atomic coverage |
| R19 | SM-RC02/G3 | PASS — AI may plan cannot verify consume correct without human authority |
| R20 | ECON005/T05 | PASS — internal80 consumed assigned100 leaves20 for its purpose no bank output |
| R21 | ECON005 | PASS — no consumption without checked Allocation |
| R22 | ECON005 | PASS — second80 on consumed80 out100 fails no negative |
| R23 | ECON005/G1 | PASS — consumption for another purpose rejected |
| R24 | ECON006 | PASS — read and replay never consume again |
| R25 | SM-CP05/SM-RC03 | PASS — discrepancy100 of assigned200 leaves100 current coverage original200 |
| R26 | SM-RC03 | PASS — doubts over unrelated300 do not invalidate checked200 |
| R27 | SM-RC04 | PASS — human resolution restores scope only once |
| R28 | SM-RC03/G2 | PASS — discrepancy material evidence cause portion guards preserved |
| R29 | SM-RC04/G4 | PASS — linked Allocation rectification preserves original before after |
| R30 | CHG008/D019/AC040 | PASS — missingD019 blocks dependent cancellation only independent valid can continue |
| R31 | D019/SM-RC02 | PASS — prior reviewed reproducibleD019 authorizes exactly determined effect |
| R32 | D019/G2 | PASS — D019 each basis field wrong scope unreviewed and mismatched amount rejects |
| R33 | SM-EP04/ECON006 | PASS — reversal reduces coverage keeps original obligation no new debt |
| R34 | PM08/D023 | PASS — PM08 advance500.01 reversal exact-500.01 historical bank remains |
| R35 | PM08/D023 | PASS — PM08 internal signed-20 reversal+20 without external output |
| R36 | PM11/D029 | PASS — PM11 persisted33.34/33.33/33.33 residualA sum100 |
| R37 | PM12/D029 | PASS — PM12 exact internals remainders and final0.01/0.01/0.03 |
| R38 | PM13/D029 | PASS — PM13 persisted negative inversions preserve magnitude order |
| R39 | D029/G2 | PASS — missing legitimate total bases weights order fail closed |
| R40 | D029 | PASS — historical split survives current policy changes odd cents |
| R41 | D023/PLAN-DEC006 | PASS — definitive number float negative or bad scale rejected raw too |
| R42 | IDEMP001/002/G6 | PASS — same operation equivalent keyorder replay no duplicate Allocation consume coverage adjustment |
| R43 | IDEMP001/E2 | PASS — same key changed material E2 original remains |
| R44 | IDEMP001/ARCH12.1 | PASS — lost committed response timeout retry recognizes durable effect |
| R45 | G1/IDEMP001 | PASS — replay unauthorized actor scope denied |
| R46 | PLAN-DEC004/E2 | PASS — stale funds payment schedule revisions never overwrite |
| R47 | AC027/T05 | PASS — A→B80 then80 shared100 with no initial child |
| R48 | AC027/T05 | PASS — B→A80 then80 shared100 with no initial child |
| R49 | CONC002/T05 | PASS — real concurrent80/80 same and different destinations no existing child |
| R50 | CONC002/IDEMP001 | PASS — same key concurrent one effect plus replay |
| R51 | CONC002/T05 | PASS — competing different obligations cannot move shared portion arbitrarily |
| R52 | CONC002/T05 | PASS — two movement roots concurrent same obligation do not overcover500 |
| R53 | CONC002/T05 | PASS — competing linked modifications both orders one revision wins |
| R54 | CONC002/T05 | PASS — concurrent reversal once preserves original exact opposite |
| R55 | T05/SM-RC04 | PASS — Allocation vs Customer Payment discrepancy and rectification serialized same root |
| R56 | CONC003/C03 | PASS — independent reader before COMMIT sees complete preceding state |
| R57 | CONC003/AC068 | PASS — failure before first Allocation write rolls unit back |
| R58 | CONC003/AC068 | PASS — failure between Allocation revision history and operation rolls all back |
| R59 | CONC003/T05 | PASS — failure after derived coverage rolls all dependencies back |
| R60 | CONC003/T05 | PASS — consume failure no isolated consumed portion |
| R61 | CONC003/T05 | PASS — correction reversal failure preserves original and coverage |
| R62 | CONC003/T05/D029 | PASS — failure middle of distribution no first destination durable |
| R63 | CONC003 | PASS — deferred COMMIT failure no durable result retry succeeds |
| R64 | G1/F1/F2 | PASS — absent forged disabled MFA-less contexts fail closed |
| R65 | V-DAT | PASS — direct DML append-only ownership no runtime economic CRUD |
| R66 | V-DAT/C02/C03/C06 | PASS — exact scoped read no economic enumeration or third-party projection |
| R67 | V-DAT | PASS — owners ACL RLS FORCE RLS explicit search_path checked |
| R68 | V-MIG | PASS — fresh install33 migrations coherent all8 allocation tables present |
| R69 | V-MIG | PASS — populatedH3-004 upgrade preserves all old data objects and ACL |
| R70 | V-MIG | PASS — failed migration rollback restores preceding schema grants roles |
| R71 | V-MIG | PASS — optional roles absent installs without PUBLIC grant |
| R72 | V-NEG/FORB15/26/27/G5 | PASS — forbidden paid implicit funding and rights from funds rejected |
| R73 | DM-INV032/AC044 | PASS — allocation consumption not invoice ProviderPayment mandate Booking |
| R74 | T07/AC027/Tasks005 | PASS — full Refund deposit Provider Payment commands unavailable |
| R75 | V-EVI | PASS — exact32 prior migrations expected health-check preserved future absent |
