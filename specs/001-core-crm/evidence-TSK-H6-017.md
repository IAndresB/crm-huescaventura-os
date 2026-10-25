# Evidencia integrada — TSK-H6-017 local/aislado

## Estado vigente tras dictamen y custodia, 2026-10-25T23:01:39.624724+01:00

**H6-017 COMPLETED exclusivamente local/aislado; H6 global IN PROGRESS.** [Acta de aceptación](acceptance-TSK-H6-017-local.md), [matriz aceptada35/35](matrix-TSK-H6-017-accepted.md) y [dictamen independiente final](../../tests/fixtures/h6-017/independent/final/independent-review-TSK-H6-017.md). La custodia técnica quedó sellada y releída antes de formalizar esta aceptación.

Adenda posterior al core congelado: el auditor añadió un grupo original Human Approval PASS, por lo que el total final es **10+1 grupos PASS**, y conserva **17 FAIL Node previos**, más dos fallos de verificadores corregidos. Los párrafos inferiores que mencionan10/10 o16 FAIL describen el corte anterior al suplemento y se conservan íntegros. El candidato técnico y la matriz observada v1 no cambian; la matriz aceptada v2 incorpora el dictamen final. El SKIP histórico de regresión se conserva como SKIP.


Base publicada verificada mediante fetch antes de actuar: `0cd5f06d2efec9741906d4927318734451b01d4a`, árbol `8b184d1d470a3bf190dee14499369fe9c665ab3d`. Worktree nuevo `h6-017-local-isolated/crm-huescaventura-os`, HEAD separado sin rama, sin commits ni modificaciones del checkout principal. Este expediente acredita el ámbito sintético local; el estado formal definitivo se recoge en el acta de aceptación. H6 global permanece **IN PROGRESS**.

## Alcance y fuentes

Se consultaron Tasks §2.2, ficha H6-017 y sus 35 filas de §6; SPEC, Architecture, Plan, Constitución, Business Rules, Domain Model, State Machines y decisiones aprobadas. Las fuentes del repositorio prevalecen sobre antecedentes y memoria. El mandato y la matriz de continuidad suministrados solo orientaron la investigación. Las 35 filas, su texto literal y SHA de fuentes están congeladas en [expected](expected-TSK-H6-017.md); la [matriz completa](matrix-TSK-H6-017.md) y su JSON contienen escenarios, precondiciones, actor/ámbito, datos sintéticos, acción, expected, observed, instrumentos y prueba independiente por asignación.

Las cuatro dependencias H5-019, H6-008 R2, H5-012 y H5-018 están autenticadas mediante 17 controles de sellos, inventarios y logs originales: [readback](../../tests/fixtures/h6-017/preservation/dependencies-readback-v2.json). No se acepta una marca de estado como prueba ni se convierte el histórico en una ejecución nueva. H5-012 conserva sus excepciones formales; H6-008 se toma en su sucesor R2 vigente.

## Ejecución funcional observada

Node 24.21.0, pnpm 11.19.0, PostgreSQL17.11 real nuevo y las 68 migraciones existentes. Storage oficial local propio anclado al commit `5def1dfc15ab7f08fe271c7d1e70542424524e4e`; Auth oficial v2.197.0 real en la auditoría, con contraseña/TOTP y recursos propios. Los ensayos no utilizan configuración, identidades, datos ni integraciones de producción. Las fuentes cacheadas se copiaron sin compartir bases, procesos ni objetos con los antecedentes.

| Evidencia | Resultado observado | Identidad recuperable |
|---|---|---|
| Nueva focal integrada |24/24 PASS,0 FAIL,0 SKIP,0 canceladas;18 familias |[Corrida final](../../tests/fixtures/h6-017/functional-runs/2026-10-25T21-53-36.671Z/result.json) y stdout original del mismo directorio |
| Regresión dirigida |74 PASS,0 FAIL,1 SKIP histórico de 75 |[Corrida dirigida](../../tests/fixtures/h6-017/functional-regression/2026-10-25T21-53-08.956Z/result.json) |
| Unitarias existentes |212/212 PASS |[Registro](../../tests/fixtures/h6-017/quality/units.json) |
| Typecheck de fuente 24 estable |PASS |[Registro](../../tests/fixtures/h6-017/quality/typecheck-stable24.json) |
| Lint/boundaries y build |PASS |[Lint](../../tests/fixtures/h6-017/quality/lint-final.json), [build](../../tests/fixtures/h6-017/quality/build.json) |
| Formato, JSON, sintaxis e integridad |PASS |[Readback](../../tests/fixtures/h6-017/format-integrity-readback.json) |
| Nuevas contrapruebas independientes |10/10 PASS,0 FAIL/SKIP/canceladas |[Log original auditor](../../tests/fixtures/h6-017/independent/core/functional-successor-3.stdout.log) |
| Verificador de candidato, negativos propios |2/2 entradas inválidas rechazadas: SHA incorrecto y ruta fuera de raíz |[Resultado](../../tests/fixtures/h6-017/integrity-negative/result.json) |

El SKIP de regresión es el placeholder histórico H6-008 S10 sobre Auth/ingress real: sigue siendo SKIP, no PASS. H5-012 se repite en su bootstrap 60 original; H5-018 sexta y H6-008 se ejecutan con 68 migraciones. La auditoría añade proveedor Auth real propio y conserva R2 como antecedente; no se afirma regresión global limpia histórica ni acceso real/Hosted/Production. Ningún requisito funcional local necesario se sustituye por la mera inspección de un documento.

## Resultados positivos y negativos

La proyección de las siete superficies —timeline, calendario, consulta, búsqueda, exportación, documento y contexto IA— hacia cliente, proveedor e IA contiene exactamente los cuatro campos comerciales autorizados y los tres campos de cada incluido. Los controles internos autorizados conservan desglose, cálculo y unidad fija; búsquedas por sentinelas reservados, importes internos, identificadores ajenos u originales privados no producen coincidencias externas. Las paginaciones y cursores conservan raíz, finalidad, búsqueda y superficie; una referencia compartida autorizada muestra únicamente el vínculo pertinente de cada expediente.

Conocer un Contact, Provider, identificador, URL o rol futuro no concede autoridad. Las pruebas rechazan pruebas copiadas/falsificadas, señales pasivas y jobs sin facultad, escalada de rol y cambios de atributos protegidos. El implementador observa 1.388 intentos denegados sobre 172 tablas y 4 roles; el auditor observa 1.980 acciones SQL denegadas con SQLSTATE42501 sobre 165 tablas y 3 roles, en instrumentos separados. No se crea una política multiusuario/organización: V1 sigue con un único Administrador y los ámbitos reales del Core.

Los objetos se prueban contra Storage oficial real: acceso directo con locator conocido sin credencial o JWT ordinario no entrega bytes; propósito/raíz ajenos y sesión revocada no liberan binarios. Una revocación confirmada mientras la descarga está pausada impide su devolución final. Un fallo controlado de metadatos después de cargar binario conserva el estado incompleto; conciliación/vínculo explícitos recuperan la conservación. La corrupción controlada rechaza entrega por integridad y se restaura únicamente el objeto sintético propio.

La transcripción PLAUD sintética autorizada, resumen y dato tentativo quedan separados, con fuente, actor, momentos, revisión y original intactos; no sobrescriben la confirmación manual. La necesidad nominal se valida por servicio/noche, la asociación a Contact exige identidad verificada y cuatro nombres no convierten 12/10 ocupantes en fichas ficticias. Archivado, audio, consentimiento y conservación no reciben una política nueva. Las guardas existentes rechazan las capacidades no autorizadas y los efectos pendientes permanecen pendientes.

Los logs y diagnósticos excluyen los sentinelas de secretos, URL temporal, cuerpo completo y economía innecesaria aun cuando el original autorizado los contiene como control positivo sintético. Las referencias indirectas a otro expediente no devuelven sus nodos. Un fallo mantiene E4 pendiente y no dispara reintento ciego del efecto. Las entradas externas no verificadas se rechazan o aíslan, mientras una recepción válida conserva evidencia/historia separadas de Booking/pago/cierre: recibido no significa aplicado.

Las contrapruebas fiscales intentan emisión/numeración/motor fiscal desde documento externo, economía propia, aprobación humana y Booking con pago conciliado y cierre conjunto real. Se rechazan los atajos y se preservan estado, historia y emisor externo. Human Approval no ejecuta ni crea Acceptance/Provider Confirmation por sí sola; una IA no decide como humano. Tararí conserva EUR, IVA explícito y cifras aprobadas/versionadas 15/175/325 comerciales y 3,80 coste del conjunto incluido; el coste de extras desconocido permanece desconocido. No se inventa tipo fiscal, mandato, factura propia ni tratamiento profesional de suplidos/Tararí. DM-PENDING-002/005 siguen abiertos en sus ámbitos.

## Hallazgos, correcciones e independencia

No se ha demostrado ningún defecto material de producto y no se ha cambiado producto, normativa, seguridad ni migraciones. Los hallazgos funcionales I01–I09 son errores de instrumento/setup y están detallados en [registro original](../../tests/fixtures/h6-017/functional-findings.json). Se conservan 9 FAIL Node del implementador y sus fuentes por intento; sucesores 23/23 y 24/24 identificados. La auditoría conserva 16 FAIL Node previos (5 de instrumento,8 por setup Auth ausente,3 de oráculo/instrumento) y su sucesor 10/10. También se preservan los STOP de setup y FAIL de resolución de custodia. No se reescribe un oráculo congelado: aclaraciones y ampliaciones son suplementos separados, justificados desde las fuentes.

El auditor reconstruyó 35 filas por su cuenta, congeló expected antes de resultados, empleó un worktree y PostgreSQL/Auth/Storage propios e instrumentos y contrapruebas originales. Releyó entradas y salidas, refutó permisos, revisó secretos y reconstruyó los 45.783 blobs de la base independientemente. La independencia es técnica entre agentes del mismo modelo; **no es auditoría humana externa**. El dictamen final debe vincular el manifiesto técnico exacto, sin heredar el PASS del implementador.

## Integridad, custodia y fronteras

El [readback de antecedentes](../../tests/fixtures/h6-017/preservation/readback-v3.json) verifica 45.783 archivos/1.040.864.923 bytes contra la base,110 archivos de producto y 68 migraciones, incluidos los candidatos H0–H5,H6-001/004/007/016 y H6-008. H6-015 conserva 16 manifiestos/4.568 entradas verificadas mediante bytes documentales y snapshots Git, sin restaurar ni acceder a runtime, SQL, S11, reentrada o cuatro trabajos suspendidos. Los estados y FAIL históricos se conservan con su identidad original.

[Manifiesto técnico](../../tests/fixtures/h6-017/technical-manifest.json) congelado:145 payloads/22.790.337 bytes, SHA-256 `93d8bece86fd8ba8a6e6fa6bb0d3d33f850c6ae47dc583c55018515437c44d7b`. La aceptación, dictamen final, variantes documentales y custodia final son añadidos posteriores separados; no alteran ese candidato. El checkout principal tiene el mismo HEAD y hashes de status/diff que antes de pruebas. El worktree permanece sin cambios de archivos protegidos ni commit/push/merge; no se sube a Drive ni se despliega.

La [recomendación de continuidad](continuity-after-H6-017.md) identifica H6-002 y H6-005 como candidatos paralelos en recursos separados; H6-003 conviene después de fijar T03. Las tres dependen formalmente de H5-019. Esta recomendación no inicia ninguna tarea ni declara H6 COMPLETED.
