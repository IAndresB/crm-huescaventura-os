# Cronología correctiva H4-016-F23

F23 MATERIAL OPEN: observación estática independiente de dirección sobre ejecución parcial acreditada dentro de intento incierto. Base32e85d1. Aún no FAIL PostgreSQL ejecutado. Se conserva final3 y F13 sin reinterpretación. Expected correctivo congelado antes del producto.

F23 reproducción ejecutada sobre46/base32e85d1: ruta ordinaria REFUND_PORTIONS_REQUIRED; resolución parcial REFUND_UNCERTAIN_PORTION_MISMATCH. FAIL del expected C01, sin mutación: ejecutado0/pendientes200/reserva80. Inputs y snapshots completos en repro-original/F23-original-state.json; stdout/stderr/status completos. Causa: guarda de igualdad completa y reserva indivisible.

F24 MATERIAL OPEN: recorrido ordinario record con attemptId elude reserva sin resolverla. Reproducción ejecutada repro-bypass y repro-bypass-state: Missing expected rejection; estado/input guardados. Incidencia inequívoca C02; se exige ruta vinculada resolve para excluir reserva. No ampliación normativa ni de permisos.

F25 TECHNICAL CLOSED: dev1 invoca archivo de verificación antes de crearlo; ISOLATED_TEST_NAME_INVALID, cobertura no ejecutada. Archivo creado antes del siguiente run.
F26 TECHNICAL OPEN: dev2 ALTER OWNER nuevo helper requiere CREATE temporal del owner en esquema; 42501, conservado. Wrapper fallido dejó conexiones abiertas: SIGTERM solo hijo del verificador y apagado pg_ctl de dos clusters propios, estados reales conservados. Añadido catch/close y GRANT temporal/REVOKE final conforme patrón46; sin permiso final ampliado.
F27 TECHNICAL OPEN: dev3 typecheck readonly de fixtures negativos y await en callback no async. Tipado any exclusivo de inyección negativa y async corregidos; logs intactos.

F28 TECHNICAL OPEN: dev4 SQL 42702 acción ambigua en consulta de revisión histórica y replay; alias explícito añadido, sin modificar expected.
F29 TECHNICAL OPEN: dev4 race Allocation primero no espera raíz comercial31, falla observación de overlap; bloqueo técnico movido a raíz payment compartida para ese caso, manteniendo ambas órdenes y aserciones.

Dev5 PASS40/40: F23/F24 retest focal satisfactorio, cierre exige regresión final. F25–F29 CLOSED técnico con dev5/typecheck y mismos40casos completos; expected intacto. Los errores 42702 no acreditaron negocio ni se etiquetan como defecto normativo adicional.

F30 MATERIAL OPEN externo al fix Refund: final1 auditoría producción status1, vulnerabilidad alta source-map-js1.2.1 GHSA-68fv-2mgg-jv7q, parche1.2.2 indicado. Sin cambio de dependencia automático: autorización humana solicitada. Frozen/typecheck/lint/unit/build previos PASS; PG aún no ejecutado por stop del runner.

Reclasificación conservando cronología: F26 y F28 son MATERIALES del SQL correctivo (DDL de migración y ramas funcionales legacy/replay), no meros errores del verificador. La clasificación técnica inicial se conserva arriba como antecedente; quedan retest focal CLOSED, sujetos a regresión final. F25/F27/F29 son técnicos de orden/tipado/fixture de espera.

Regresión definitiva sobre5425761:1831/1831 PostgreSQL=1788previos+43correctivos;138/138unitarias;health1/1 separado; frozen/typecheck/lint/build/V-MIG/advisors/diff-rango PASS; auditoría F30 FAIL. F23/F24 RETEST PASS funcional, cierre global PENDING porF30; no declarar CLOSED completo. F26/F28 CLOSED material SQL con upgrade/fresh/replay; F25/F27/F29 CLOSED técnico con regresión.
F31 TECHNICAL CLOSED: git diff de árbol tras regresión detecta whitespace en artefactos históricos regenerados H2, no producto; FAILcapturado generated-diff.*. Versiones de ejecución archivadas bajo generated-historical-artifacts; bytes publicados restaurados sin modificar verificadores ni resultados históricos. Retestdiff debe PASS antes de checkpoint.
