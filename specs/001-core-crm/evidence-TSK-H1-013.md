# TSK-H1-013 — expected previo de evidencia y comunicación

Fecha: 2026-09-30. Base `fb9dfcea0b770345dd49c7b2fd91ab71b70191f3`, `main` limpio. Expected fijado antes de escribir la migración o assertions. Estado inicial: NOT STARTED.

Fuentes APPROVED: Constitution P01/P05–P07/P10–P15; BR-DOC-001–005, BR-COMM-001–006, BR-HIST, BR-INT; DM §7/§12/§13, DM-INV-043/045/047 y DM-PENDING-005; SM-CO-01–06, SM-FORB-20/21; Architecture B07/B09, ARCH-DEC-003/016; SPEC-FR-PROP-006, HIST-001/003, COORD-007, INT-001/004, AC-009/075/087/088; Plan §§5.1/5.3/7.1/8, C01/C03/C04, T09/T11; Tasks H1-013/014 y §6–7.

| ID | Expected local/aislado |
|---|---|
| E01 | Document, Evidence y Communication tienen identidad y significado distintos; adjuntar documento no acredita pago, aceptación, revisión, recepción ni negocio. |
| E02 | Original y derivado coexisten; derivado conserva vínculo, fuente/finalidad/revisión y no reemplaza ni obtiene autoridad superior. Referencia sintética de objeto no acredita conservación física. |
| E03 | Un original tiene una identidad y varios vínculos de contexto, cada uno con cobertura y permisos propios; otro vínculo no duplica original ni concede acceso global. |
| E04 | Llamada manual autorizada puede registrar hecho concreto con canal, actor registrador, fuente, contexto y momentos del hecho/registro distintos, sin audio ni escrito posterior. No es Acceptance por inferencia. |
| E05 | Entrada acreditada comienza Recibida sin borrador ficticio. Salida: aprobación, envío, recepción y respuesta son hechos separados; cada hecho exige su evidencia propia. Envío de Proposal requiere versión exacta, destinatario y autorización aplicable. |
| E06 | Original, emisor/autor externo, destinatario, CRM Actor, solicitante, aprobador y ejecutor no se atribuyen unos a otros. External Reference/Event no se convierten en identidad canónica ni confirmación. |
| E07 | Fuente, finalidad, cobertura, certeza, momentos, ámbito y contexto quedan retenidos. Hechos fijados son inmutables; corrección enlazada añade historia, no reescritura. |
| E08 | C03: efecto, historia y resultado idempotente atómicos. Replay idéntico devuelve resultado; material distinto con misma operación entra en conflicto. Carrera no duplica original/vínculo; fallo de historia revierte todo. |
| E09 | C01/C03: F1/F2, sesión/generación/ámbito vigente y roles mínimos; runtime directo, PUBLIC/anon/authenticated y otro scope denegados. Lectura desde otra conexión ve solo commit válido. |
| E10 | Migración forward-only desde cadena previa, RLS/FORCE, ownership y grants mínimos. Fixtures completamente sintéticos; DM-PENDING-005, Storage, conectores y uso real permanecen pendientes. |

Se implementará el registro mínimo, no la composición/envío externo de H5 ni el almacenamiento de objetos H1-015. Ninguna prueba local acredita Supabase hosted o Production.

## Observado local

Migración forward-only `202609300001_h1_evidence_communications.sql` sobre la cadena vigente H0/H1: `b07_records`, `b07_links`, `b07_operations`, `b07_history`; owner F2 separado, RLS/FORCE, grants mínimos, RPC C01/C03 firmadas por F1/F2. No se alteraron migraciones H0. `H1013EvidenceAdapter` expone alta/enlace inmutables y lectura limitada al contexto enlazado; cada vínculo conserva cobertura propia. La única referencia de objeto admitida es `reference_only`, sin atribuir conservación física.

E01/E02: original y derivado distintos, evidencia documental y llamada manual con canal, actor, fuente y tiempos separados PASS. E03: segundo vínculo mantiene una sola identidad, cobertura propia y lectura contextual PASS. E05: entrada `received` sin borrador; salida sin hecho de envío inicial, hechos separados con prueba referenciada PASS. E06: external reference/event pendientes, sin identidad canónica ni confirmación PASS. E07/E08: corrección enlazada con antes/después, replay, conflicto, carrera y rollback provocado por fallo en historia PASS. E09/E10: runtime directo denegado, migración y RLS/FORCE comprobados PASS. Focales de implementación: **6/6 PASS** con PostgreSQL efímero y datos sintéticos.

La referencia a versión/autorización de propuesta es estructural en este núcleo: no acredita una propuesta real, una aprobación humana real ni un envío externo. La integración y verificación de esas autoridades quedan asignadas a H2/H5. DM-PENDING-005 continúa abierto; no se usaron PII reales, audio, Storage, conectores, hosted ni Production. PLAN-AUTH-001–006 conservan su estado global.
