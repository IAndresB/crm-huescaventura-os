# Revisión independiente — propuesta PG17 y conciliación H6-015

Fecha: 2026-10-22. Base: `971c55d5ce5770c71284d106d3c0deecca9514b5`. Worktree del auditor: `h6-adoption-audit`. **PASS de revisión documental y de los puertos ensayados, con límites expresos. Este documento no aprueba una modificación normativa, no acepta H6-015 y no autoriza S11.**

## Separación y expected

El auditor conserva intacto el paquete anterior `h6-bootstrap-independent`: manifiesto SHA-256 `609fa29b83a71308a47689b99729c2183c7024fbaa5386043665d38bc295b433`, 48 archivos verificados individualmente por tamaño y hash en esta revisión. No se han abierto ni alterado sus recursos PostgreSQL ni sus copias privadas.

Los 20 criterios propios de esta revisión se congelaron antes de observar la nueva propuesta del ejecutor en `tests/fixtures/h6-adoption-independent/expected-v1.json`, SHA-256 `261c7c4769bc6dcd0a4fd88ebafe3b5d948e253b3371805ca0e96f4839659dcb`. El recibo `preflight-source-seal-v1.json` fija la base Git y 21 fuentes normativas y técnicas. El estado NOT STARTED presente en Tasks de esa base es histórico; la autorización actual mantiene H6-015 IN PROGRESS y no modifica ese archivo histórico.

## Lectura contractual independiente

| Tema | Fuente vigente | Conclusión y límite |
|---|---|---|
| Intento t1 ausente | `procedure-TSK-H6-014.md`, S10; SPEC-FR-HIST-004, IDEMP-002 y ERR-002 | Conservar evidencia/revisión mediante C04 y mantener suspendido el efecto. R3 prohíbe fabricar un intento o transición aplicada. Esta regla ya existe y no requiere alterarse para documentar la ausencia. |
| Registro semántico C04 | `src/application/contracts.ts:82` | Admite original o registro manual autorizado; devuelve candidate/verified conforme a revisión. `EvidencePort.register` es inyectado. No hay una composición persistente C04 concreta en `src`; sus usos encontrados son pruebas. No es resultado B08 ni prueba de integración C04 con base restaurada. |
| Persistencia B07 | `src/infrastructure/postgres/h1-evidence-adapter.ts:57`; migración `202609300001_h1_evidence_communications.sql:123` | Existe persistencia protegida mediante C03/F1/F2 de evidencia con claim, coverage, certainty y source_kind; conserva source_ref, occurred_at, recorded_at y actor, con vínculo tipado al contexto. Integrar la conservación t1 exige usar esta composición legítima y verificarla; no se ha ejecutado aquí. |
| Hecho de comunicación | misma migración:152, 215–265; `20261007230734_h5_communication_review.sql:54` | Exige comunicación original y evidencia en el ámbito y contexto. Los borradores H5 tienen además revisión manual, versión, destinatario, preparación y aprobación cuando procede. Un resultado de trabajo genérico no puede renombrarse como envío o cobro. |
| Diagnóstico técnico | `h5-diagnostic-adapter.ts:11`; migraciones `20261016174248...:140` y `20261017004525...:144` | No aplica resultados de negocio. executionId/eventId deben existir con titularidad/contexto autorizados. operationId ausente se proyecta como unverified_attempt; no se convierte en intento canónico. No admite attemptId ni payload arbitrario. |
| Resultado B08 sin intento | `20261008143617_h5_persisted_work_recovery.sql:211` | `SELECT INTO STRICT` exige el intento original de la ejecución y una reserva no nula con estado admitido. Una prueba válida del proveedor no sustituye estas filas. La ausencia queda bloqueada; no hay acción de importar/reconstruir intento en `WorkCommand`. |
| Intento incierto existente | misma migración:211–226; `202609270000_h0_m04_human_approval.sql:278` | Existe transición reconcile si B08 conserva el intento y HA la reserva incierta y evento attempted del mismo intento. Requiere resultado fiable exacto. Puede registrar realidad sin crear otro contacto; no implica resume. La posibilidad está acreditada por lectura, no por una nueva ejecución SQL. |
| Prueba de resultado y efecto | `src/application/work-result-verification.ts`; `persisted-work-executor.ts:82` | La composición confiable verifica identidades y resultado antes de SQL. Start verifica disponibilidad y ausencia de efecto previo. SQL vuelve a autorizar y verifica pertenencia/reserva dentro de su transacción. Puertos, SQL y proveedor son capas distintas. |
| Adopción propuesta | Constitución P02–P04, P06–P07, P10, P12–P13, P18–P19 | Un sucesor DRAFT no modifica r3 ni autoriza su aplicación. La excepción técnica de ensayo no se convierte en cambio normativo definitivo por pasar una auditoría. |

La conservación de evidencia del testigo y la aplicación de un resultado a B08 son entregables distintos. Un registro B07 leído como `verified` significa que el registro se obtuvo mediante el contrato; no demuestra por sí solo que un proveedor ejecutó el efecto. Un outcome técnico `accepted` tampoco sustituye evidencia de negocio. Los campos de certeza deben corresponder al alcance exacto revisado.

## Contrapruebas propias de puertos

27/27 PASS, cero FAIL, ejecutadas con Node local y datos sintéticos en este worktree. Los vectores propios (`port-vectors-v1.json`, SHA-256 `46bf25d80ff06d60ea4831510780410bbe5e601c151532b3ac7b6fdcf7a45d35`) y el instrumento se congelaron en `port-freeze-v1.json` antes del observado. Freeze SHA-256 `ccb80fd8eba59f12c025e92fd1237cfaa2282d1c1f32587bccaa5c7733c0ee42`.

Resultado: `ports-result-1792682765856.json`, SHA-256 `c22993052da295611d3f9e87dc8ae35dbdfec7e88064aa31f02ae11771bff0f8`. Casos positivos: resultado succeeded o failed exacto; efecto disponible sin efecto previo. Negativos: ausencia de proveedor u observación, identidades de ejecución/intento/propuesta/parte/resultado/material distintas, origen no simulado, identidad del verificador inválida, falta de referencia, indisponibilidad, incertidumbre y efecto previo acreditado. Se verifica que los fallos del proveedor se propagan, que la solicitud entregada está congelada y es distinta de la del llamante, que el llamante no se modifica y que el resultado aceptado se congela.

**Estos 27 casos no prueban SQL, Auth, Storage, persistencia, conciliación integrada ni nuevos efectos.** El puerto de prueba devuelve observaciones controladas por el auditor; permite probar su validación, no acreditar un proveedor externo real. No se ha levantado ningún servicio ni clúster nuevo en este bloque.

## Revisión final del candidato del ejecutor

El sucesor `procedure-TSK-H6-014-r4-proposed.md`, SHA-256 `f593e25d9749b8e2a49a0e254a028153b334645536c00920af651edfec0ba1ae`, es una propuesta separada. La lista JSON, incluido su prefijo de borrador, reproduce exactamente sus bytes a partir de r3. El diff completo coincide con una comparación calculada de forma independiente. R3 mantiene SHA-256 `906cf7a451d0c85f6d5bc0ff91ce776ef9cec786d896a3620b7019cfc667ba70`. Las fuentes normativas consultadas siguen idénticas a las congeladas.

Las dos decisiones N01/N02 están acotadas a conservar la identidad bootstrap mediante initdb soportado y satisfacer de forma explícita su único CREATE ROLE, sin omitir ALTER, configuraciones, membresías ni grants. Las aclaraciones E01/E02 preservan la semántica de ACL y describen la composición Auth R2 ya aceptada. Se contrastó `HumanAuthSessions.login`: captura la generación después de contraseña y antes de completar TOTP; `establish` recibe esa generación. La revocación coordinada cambia Core antes de llamar al proveedor. Esta lectura no representa un nuevo ensayo Auth.

El expediente distingue correctamente las decisiones normativas, la vía contractual actual de evidencia, la falta de integración persistente nueva y una eventual especificación N03. N03 no se presenta como API existente, no se implementa y no es requisito para conservar evidencia separada. El acta `result-TSK-H6-015-adoption-v1.md` es una propuesta de decisión, expresamente sin cierre; revisada por separado al completar el paquete.

52/52 verificaciones de paquete PASS en `candidate-final-review-v1.json`, SHA-256 `dfd528b063f1114f8ce572a24e6b0fa40fb9bceafb9779b414c0fa4f350d1940`. Incluyen reconstrucción exacta, hashes normativos, expected/instrumento/12 resultados focales del ejecutor y ausencia de nuevos archivos de producto. La adquisición independiente previa verificó 4.254 payloads heredados y comparó 39.970 archivos versionados contra el candidato PG17 v2, sin diferencias. Las seis modificaciones frente al commit base son heredadas y coinciden con v2; no son cambios de este bloque. Los manifiestos/sellos se conservan por separado de los payloads.

Se revisó el instrumento del ejecutor: sus 12 resultados PASS corresponden únicamente a `verifyWorkEffect` y `verifyWorkResult`. El auditor ejecutó sus propios 27 vectores y mantuvo resultados separados. No suma ambas series como cobertura SQL ni como conciliación de negocio. Typecheck y límites de importación constan como verificaciones del ejecutor; el auditor comprobó sintaxis de su instrumento y `git diff --check` en su worktree.

## Hallazgos corregidos y cobertura

| Hallazgo | Resolución |
|---|---|
| D01: nombre inexistente del JSON citado en la cabecera r4 | Corregido al nombre exacto. |
| D02: prefijo HTML de borrador no declarado en la lista de sustituciones | Prefijo explícito; reconstrucción íntegra independiente PASS. |
| D03: expediente anunciaba aclaración relacl ausente del diff | Aclaración añadida a r4, conservando grantor/grantee/privilegio/opción y distinguiendo NULL/default de ACL vacía. El SQL histórico datacl no se reescribe. |

El recibo inicial conserva los hallazgos de la primera lectura. Su adquisición de hashes terminó después de las correcciones del ejecutor, por lo que ya identifica el sucesor corregido. El recibo final declara esta diferencia temporal y verifica el cierre; el recibo inicial no se sobrescribe ni se presenta como foto de los bytes anteriores a la corrección. El FAIL de serialización Git LF/NUL del ejecutor permanece en su registro histórico y no se atribuye a corrupción del repositorio.

El cotejo final del manifiesto del ejecutor `3706b515db4671f5f1fdeda47d2c8d6564e90a94deba62dbebff118b871bce78` verifica sus 13 payloads, el acta y los 15 archivos revisados sin variación. Se conserva también `finding-receipt-timing-v1.json`: una comprobación instrumental esperaba dos recibos modificados a partir del orden de mensajes, pero los hashes acreditaron que la adquisición final ya contenía sus campos añadidos. La contraprueba usa los hashes congelados y los valores reales; no modifica archivos del ejecutor ni reescribe el FAIL.

La matriz `acceptance-review-v1.json` distingue los 20 criterios propios: revisión documental, prueba de puerto y operación no ejecutada. A08 (rechazo SQL del resultado sin intento), A09/A10 (diagnóstico/hecho manual persistentes), A12 (conciliación HA/B08) y A15 (replay/conflicto SQL) están sustentados por lectura contractual, **sin prueba nueva de ejecución**. A16 no es aplicable a una mutación de datos nueva porque este bloque no realiza ninguna. A14 cubre las negativas de puerto; no vuelve a probar identidad real ni permisos en servidor.

AC-073 continúa parcial: evidencia histórica conservada y guardas focales verificadas, pero el intento ausente no está aplicado a B08 y la incertidumbre no se ha resuelto. AC-074 conserva únicamente la cobertura local v2 previamente auditada; este bloque no añade una prueba de Storage. El siguiente trabajo seguro posible es una composición focal de evidencia C04/B07 con integración y denegaciones reales locales; no necesita fabricar un intento ni promulgar N03.

## Custodia y cambios del auditor

No se ha creado ni iniciado ningún clúster, proveedor, servidor, credencial o fichero privado nuevo. No se han leído payloads privados ni copiado secretos. La custodia del ejecutor de 47.276 archivos se documenta mediante su recibo de rehash; **el auditor no repite aquí ese rehash privado**. La verificación propia nueva comprende los manifiestos públicos y archivos de evidencia indicados, junto con el paquete auditor anterior de 48 archivos intacto.

Este worktree contiene exclusivamente instrumentos, expected, recibos y este dictamen nuevos. No se modifica ningún archivo versionado, no hay staging y no se realiza commit ni publicación. El manifiesto auditor de entrega enumera solo estos archivos nuevos y excluye su propio hash.

## Decisiones reservadas

H6-015 permanece IN PROGRESS. La adopción normativa PG17, cualquier vía nueva que aplique resultado sin el intento original, S11, cierre, publicación, datos/autoridades reales y Hosted/Production siguen fuera del alcance de esta revisión. ARCH-PENDING-002 y DM-PENDING-005 continúan OPEN. La incertidumbre no se convierte en fracaso por esperar, y la evidencia t1 conservada no se declara reaplicada a B08.
