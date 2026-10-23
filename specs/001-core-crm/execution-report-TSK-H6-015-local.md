# TSK-H6-015 — Informe de ejecución local y frontera de autorización

Fecha: 22 de octubre de 2026. Estado: **PARTIALLY_EXECUTED_LOCAL_BLOCKED; no COMPLETED**.

## Dictamen

La variante dedicada de Auth alcanza PASS técnico y PASS independiente. Core y Storage permanecen bloqueados en S05 por H6015-S05-GRANTOR. AC-073 y AC-074 siguen pendientes de verificación integral. S11 no está ejecutado ni autorizado.

## Identidad y protección

Base Git: `971c55d5ce5770c71284d106d3c0deecca9514b5`; tree `8b43af1acc0d4be40321de1c5bc303129cdb47cd`. Worktree ejecutor separado: `/Users/andres/.codex/worktrees/h6-restore-execution/crm-huescaventura-os`. Se copiaron y verificaron 4.070 archivos heredados. Se conservan los candidatos históricos H6-006/H6-008 y el manifiesto R2 de 4.055 archivos, SHA-256 `23419baa5d5ddb985ce4ac42d1d408d510ffad89959b1154fb0e6f147e30f14f`. El repositorio original conserva su inventario de 14.954 archivos sin seguimiento y su estado Git verificado. No hay staging, commit, push, publicación ni subida a Drive.

## Recursos y evidencia real

PostgreSQL 17.11, Supabase Auth v2.197.0 y Storage local del commit `5def1dfc15ab7f08fe271c7d1e70542424524e4e`. Recursos privados, identidades sintéticas y red restringida a localhost/sockets Unix. Se comprobó el bloqueo de salida externa. Todos los servicios propios finalizaron; archivos preservados.

Captura principal t0: 11:43:28.172–11:43:29.012 UTC, duración 840,196 ms. Core: 175 tablas/529 filas; Auth: 27/120; Storage: 10/81; objetos: 5 archivos/110 bytes. Se conservaron dumps completos y sus hashes. El testigo t1 registra cuatro escenarios de trabajo y tres efectos simulados, pero no acredita conciliación ni ausencia de duplicación después de restaurar Core.

Variante Auth final: 34/34 verificaciones, 27 tablas/100 filas restauradas. Identidad lógica, esquema, datos, permisos ordinarios, password/TOTP auténtico, refresh y revocación comprobados. Un JWT puede conservar firma y expiración válidas y, aun así, ser rechazado por el proveedor porque su sesión fue revocada; no se confunden ambas garantías. Restauración Auth: 800,255 ms; duración de esa fase concreta, no RTO integral. No hay pérdida observada en los datos Auth comparados; no se declara RPO integral.

El auditor reprodujo exactamente 34/34 y efectuó otra restauración con instrumentos y HTTP propios: nueve grupos PASS, esquema SQL completo idéntico y datos recanonizados independientemente. Sus contrapruebas propias fueron 28/28 y la batería instrumental general 62/62. La revisión offline de captura tiene seis grupos PASS; la identidad posterior a t0 del intento tardío conserva el límite de no haberse consultado el origen vivo por el auditor.

## Fallos, reparaciones y bloqueo

Se preservan el fallo inicial de orden de arranque Storage, el primer FAIL Auth por comparar posiciones físicas de columnas eliminadas y nombres FK con OIDs, los fallos instrumentales del auditor y los dos fallos materiales de globals. Las correcciones mantienen identidad lógica, definiciones y multiplicidad; no relajan owners, ACL ni grantors. La adenda corrige la confusión entre operación de definición e inicio y la selección de épocas t0, sin reescribir el testigo original. Los expected permanecen congelados.

Core y Storage fallan reproduciblemente con SQLSTATE 42501, `check_role_grantor`. El bootstrap importado conserva el nombre pero no el OID 10 del bootstrap original. Los grants explícitos del archivo requieren una autoridad que el nuevo grafo no satisface. El procedimiento r3 exige un bootstrap distinto y la preservación exacta de esos grants. No se han omitido grants, cambiado grantors, escrito catálogos ni añadido privilegios para forzar PASS. El gate de ejecución principal permanece OPEN y bloquea nuevos ensayos hasta una revisión autorizada del procedimiento.

Referencia técnica: https://www.postgresql.org/docs/17/sql-grant.html y código PG17.11 `src/backend/commands/user.c`.

## Regresión y límites

210 pruebas unitarias PASS, lint PASS, TypeScript PASS y build PASS. No se atribuye a esas comprobaciones cobertura integrada de Core/Storage restaurados. S06–S10, renovación F1/F2 sobre Core restaurado y conciliación integral permanecen pendientes. ARCH-PENDING-002 y DM-PENDING-005 siguen abiertos. No se modificó normativa ni se utilizaron datos reales, Hosted/Production o comunicaciones de negocio.

## Publicación, custodia y siguiente decisión

El manifiesto local enumera las rutas exactas propuestas para versionado, con tamaño y SHA-256; el seal fija su identidad. Incluye material heredado identificado y nueva evidencia, sin incorporar el inventario ajeno del repositorio original. El paquete auditor tiene su manifiesto separado de 60 archivos, SHA-256 `7a016d76363a4ee6db364a149d570f3977ace44f9558481ff9dc1e3d87b8e550`.

Dumps, secretos efímeros, factores, tokens y configuraciones privadas permanecen fuera de Git, en ubicaciones privadas bajo `/tmp`; **su custodia persistente fuera de `/tmp` está pendiente**. No deben publicarse con el código. No se ha realizado custodia en Drive. La custodia futura deberá utilizar la estructura empresarial existente.

Propuesta: admitir únicamente el resultado parcial Auth; revisar y autorizar una estrategia compatible de bootstrap/grantor del procedimiento, preservando r3 e históricos. Tras esa decisión podrá ensayarse Core/Storage en nuevos destinos y completar S06–S10. S11 requiere su propia autorización. H6-015 no se cierra con este expediente.

Evidencias: `tests/fixtures/h6-015-execution/operational-status.json`, `acceptance-matrix.json`, `quality-readback.json`, `blocked-operations.json`, `auth-runs/2026-10-22T11-57-53-698Z/report.json`, `capture-audit-1792670472228/report.json`. Auditoría separada: `/Users/andres/.codex/worktrees/h6-restore-audit/crm-huescaventura-os/specs/001-core-crm/independent-audit-TSK-H6-015-auth-and-boundary-v1.md`.

**STOP: frontera de revisión del procedimiento y reentrada no autorizada.**
