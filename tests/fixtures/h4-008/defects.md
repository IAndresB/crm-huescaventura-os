# H4-008 defectos y cronología

F01 MATERIAL: primer focal falla al instalar migración, SQL42601 position14377. Fuente V-MIG/C03. CASE en condición PL/pgSQL sin paréntesis; corrección local de sintaxis. FAIL completo initial-focal.log preservado. Retest pendiente.

F01 Retest: instalación ya pasa, ejecución alcanza guarda E3; CLOSED sintaxis, regresión final pendiente.

F02 TÉCNICO VERIFICADOR: focal-retest1.log EVIDENCE_REQUIRED; fixture contrastaba con payment_evidence pero ligaba prueba a Opportunity en vez del contexto other/Hold contractual. Corregida solo emisión de prueba, no guarda producto/expected. Retest pendiente.

F02 CLOSED: grant y prueba B07 pasan en focal-retest2/matrix-initial.

F03 MATERIAL: focal-retest2/focal-diagnostic/matrix-initial conservados; proyección y near fallan por precedencia SQL de operadores JSON resta. Fuente C06/SM-HO-03/V-DOM. Paréntesis explícitos en extracción JSON antes de restar claves. Retest pendiente.

F03 CLOSED: matrix-retest1.log 21/21 focal/matriz PASS; guards mismos y expected intacto.

F04 MATERIAL: reproducers-initial.log check equivalente bajo nueva operationId añadía revisión (3 en lugar2). Fuente G6/V-AT/R22. Reproducer permanente; detectar material exacto de check/near/invalidate/request/link en historia después de reautorizar y verificar prueba; recuperar estado actual sin historia material nueva.

F05 MATERIAL: reproducers-initial.log respuesta incompatible mismo instante reemplazaba términos sin precedencia (Missing expected rejection). Fuente BR-SUP-004/G2/R16. Exigir instante posterior al último hecho para nuevas respuestas; mismo hecho fiable recupera replay antes. Fixture positivo ahora expresa secuencia temporal real explícita; no cambio expected.

F06 TÉCNICO VERIFICADOR: supplement-initial.log R25a snapshot nombraba b07_task_history inexistente; H1 reutiliza b07_history/operations. Corregir nombres exactos preservando comparación completa.

F07 TÉCNICO FIXTURE: supplement-initial.log R17 requisito ligado a Booking de noches pero uploader de invoiceFixture retenía original Booking anterior (E3 correcto). Prueba Requirement por fixture H3 real original y noches por su Booking H2 real, sin falsear vínculos de originales. Guardas producto intactas.

F04/F05/F06/F07 CLOSED por block-retest2.log: replay y E8 reproducers PASS, rollback completo PASS, Requirement original correcto PASS; R17 avanza y detecta F08.

F08 TÉCNICO VERIFICADOR: block-retest2.log R17 usa String(Date) esperando ISO para emparejar noche; postgres devuelve Date para date. SQL service_date::text conserva valor civil y evita coerción de zona en fixture. Expected AC-019 intacto. Retest pendiente.

F08 CLOSED: supplement-retest3.log R17 y14/14 complementos PASS.

F09 MATERIAL: reproducers-second.log (PASS2 FAIL2) link desconocido/sin vencimiento permitía acción posterior usando comprobación vieja. Fuente SM-HO-02/SM-BS-03/R03/R12; exigir igualdad de acción evaluada antes de vincular. Reproducer permanente, retest pendiente.

F10 MATERIAL: mismo log permitía dos prórrogas parciales distintas con un mismo newPartId. Fuente G1/G4/T04/R10/R23; validar identidad única de porciones del estado completo antes de persistir, rollback sin parciales. Retest pendiente.

F09/F10 CLOSED: block-retest4.log39/39 PASS, incluidos reproducers permanentes.

F11 MATERIAL: reproducers-third.log PASS4 FAIL1, cambio expreso de fecha externa rechazado como PORTION_REQUIRED. Fuente SM-HO-07/BR-SUP-004/R10. Registrar newDate expresamente verificada en términos del Hold, conservar scope anterior en historia, retirar vínculo cuya cobertura cambió; no modificar Proposal/Acceptance/Booking. Guardas de relink comprueban fecha y variante contra alcance H2 vigente. Retest pendiente.

F11 CLOSED: block-retest5.log40/40 PASS, external date change reproducer and full affected matrix.

F12 TÉCNICO VERIFICADOR: supplement-final-typecheck.log attempt Task completed supplied field purpose not in current TaskCommand. Remove extraneous field, add required identity argument; unsupported complete remains explicit rejected attempt, no Task machine expanded.

F13 TÉCNICO ENTORNO/ADVISOR: block-retest6.log43PASS1FAIL CLI2.119 advisor returns1 (stderr “remote database” exclusively loopback). Initial test logged only process status/stderr; stdout was not emitted and is not claimed recovered. Diagnostic retry now records complete stdout/stderr, classify after cause.

F12 CLOSED: final-candidate-typecheck.log PASS y advisor-diagnostic.log Task forbidden attempt PASS.

F13 diagnóstico completo advisor-diagnostic.log: CLI2.119 exige TLS por defecto y clúster aislado nativo no SSL (DbConnectError antes de linter). Parámetro sslmode=disable solo en URL127.0.0.1 sintética/efímera, conforme a suggestion del propio CLI; sin hosted ni cambio de seguridad/roles producto. Retest pendiente.

F13 CLOSED: block-candidate-pass.log CLI status0 y results[] completos.

F14 TÉCNICO VERIFICADOR: mismo log43PASS1FAIL, esperaba espacios literales en JSON `"results": []`; CLI devuelve JSON compacto. Parsear JSON y comparar results array vacío, sin cambiar salida/criterio de linter. Retest final requerido.

F15 EXCLUSIVAMENTE DOCUMENTAL: final-diff-check.log detecta una línea vacía extra al final del expected congelado. No cambia ninguna fuente, fixture, guarda, resultado ni prohibición. Corrección localizada exclusivamente EOF (un salto de línea final en lugar de dos); texto normativo byte-identical al excluir saltos EOF y commit original preservado íntegro. No acomodación de expected al producto; log FAIL conservado y retest diff-check exigido. Producto/migración/verificador no cambian.

Cierre acreditado sobre SHA producto/verificador8849b0fa86d9efbc2fb09e6a05b9362438b1af9d: final-postgres.log1443/1443 PASS,44 grupos del bloque incluidos; final-unit.log118/118 PASS; final-health.log1/1 separado; install/typecheck/lint/build/audit y V-MIG/advisors PASS. F01–F15 CLOSED, cero material abierto. F14 results[] parseado PASS en suite completa; F15 diff-check de rango completo PASS tras ajuste exclusivo EOF y restauración de outputs históricos generados.7 materiales (F01,F03,F04,F05,F09,F10,F11);7 técnicos/entorno (F02,F06,F07,F08,F12,F13,F14);1 documental F15.

Los logs completos de cada ejecución del runner están conservados sin modificar bytes mediante gzip y manifest SHA256. initial-typecheck/supplement-final-typecheck son salidas completas de comandos indicados. F13 primera ejecución no emitió stdout interno CLI: no se declara recuperado; su diagnóstico posterior sí emitió stdout/stderr completos. El runner regeneró dos outputs históricos H2-011; se archivó salida nueva bajo historical-run-generated-* y se recuperaron exclusivamente esos originales conocidos desde Git, sin cambiar verificador/producto histórico.
