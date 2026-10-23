# H6-015 — Dictamen del correctivo PostgreSQL 17, v1

Fecha: 2026-10-22. Estado operativo: **IN PROGRESS; S05 BLOQUEADO**. No cierre automático. Solo recursos locales aislados y datos sintéticos.

## Resultado

Se acredita la causa raíz y se preserva el material sensible en custodia local persistente. **No se ha encontrado una solución compatible con todas las restricciones vigentes de r3.** La variante preferida requiere una decisión sobre dos condiciones de S05 y queda documentada, sin implementar, en [propuesta de bootstrap v1](proposal-TSK-H6-015-PG17-bootstrap-v1.md).

No se afirma que PostgreSQL sea incapaz de restaurar estos permisos en cualquier configuración: el conflicto se produce entre el mecanismo del motor y la combinación concreta exigida por r3.

## Identidad, fuentes y separación

Base `971c55d5ce5770c71284d106d3c0deecca9514b5`. Nuevo worktree ejecutor: `/Users/andres/.codex/worktrees/h6-pg17-corrective/crm-huescaventura-os`. Se copiaron y verificaron los 4.136 payloads del manifiesto histórico SHA-256 `3b928abaf8fb1ae44a195c00a9c95af61899e502efbe6cf838c0bcc78feac088`, más ese manifiesto y su sello. No se sobrescribieron los worktrees históricos.

Auditor nuevo separado: `/Users/andres/.codex/worktrees/h6-pg17-audit/crm-huescaventura-os`; instrumento y expected propios. Constitución, Spec, Plan, Tasks, Architecture, Decisions y r3 quedan fijados por hash en el [expected correctivo](../../tests/fixtures/h6-015-pg17-corrective/expected-v1.json), congelado antes del observado, SHA-256 `6901d4027685963fdd2e93eac2d009c64b2e44bac07dd366e0062f488aeec83f`.

## Causa raíz acreditada

En r3, S05 líneas 431/433/443 exige bootstrap destino distinto de los roles fuente; la carga de globals debe ser íntegra, con ON_ERROR_STOP y una transacción. La equivalencia administrativa de OID 10 de la línea 609 se limita a miembros C de pgcrypto no SECURITY DEFINER y con ACL inicial: no cubre memberships, grantors ni otros objetos.

En PostgreSQL 17, el nombre del rol no transporta su OID. La fuente Core registra seis membresías con grantor `h2_bootstrap`; Storage registra cuatro con grantor `postgres`. Ningún grafo capturado aporta una arista ADMIN al grantor fuente. Al importar esos nombres en un clúster cuyo bootstrap tiene otro nombre, los roles importados tienen OID distinto de 10 aunque sean SUPERUSER.

`check_role_grantor` exige que el grantor explícito sea el bootstrap builtin o sostenga ADMIN OPTION. Es una condición de integridad del grafo, además del permiso del ejecutor, y no desaparece usando un superusuario. La carga real de cada globals histórico falla **42501** y la transacción revierte los roles importados. Todos los roles ya creados en otro destino diagnóstico permiten reproducir el mismo fallo en el GRANT original: no lo arregla simplemente el orden.

La identidad física del origen histórico no se releyó arrancando su clúster preservado. La atribución original está en el catálogo t0; el vínculo initdb/bootstrap/OID10 está en el harness fuente y se contrastó con una reproducción independiente del motor. Se diferencia esa evidencia de una nueva consulta viva al origen histórico.

Fuentes primarias: [GRANT PG17](https://www.postgresql.org/docs/17/sql-grant.html), [REVOKE PG17](https://www.postgresql.org/docs/17/sql-revoke.html), [pg_dumpall PG17](https://www.postgresql.org/docs/17/app-pg-dumpall.html), [implementación PG17.11](https://raw.githubusercontent.com/postgres/postgres/REL_17_11/src/backend/commands/user.c).

## Alternativas

| Alternativa | Viabilidad técnica | Seguridad y grantor | Procedimiento / privilegios adicionales | Clúster nuevo y compatibilidad |
|---|---|---|---|---|
| Mismo r3, otro superusuario / SET ROLE / SESSION AUTH | 42501 reproducido | El grantor importado no obtiene la raíz OID10 | Sin cambio normativo, pero no resuelve | Reproducido; afecta Core/Storage; Auth dedicado conserva su PASS separado |
| Reordenar CREATE/GRANT | Falla aunque todos los roles existan | El orden no crea ADMIN ni identidad builtin | No basta un ajuste del harness | Reproducido en destinos nuevos; mismo límite por grafo |
| ADMIN temporal y retirada | GRANT funciona; RESTRICT falla 2BP01, CASCADE elimina descendientes | Cambia dependencias del grafo | Dejar ADMIN añade una membresía/dependencia que altera revocación o democión futura; quitarla pierde concesiones | Reproducido independientemente; no equivalente para Core/Storage ni generalizable a Auth |
| Omitir/sustituir GRANTED BY | GRANT implícito funciona | Cambia grantor a bootstrap destino | Cambia globals y equivalencia prohibida; no seleccionado | Reproducido en mínimo independiente; no acredita integración |
| Bootstrap fuente OID10 y nombre original | Propuesta fundamentada, no implementada | Conserva raíz; aún exige cotejo completo | Revisar bootstrap distinto y CREATE ROLE ya satisfecho; no añadir ADMIN | Candidato futuro por clúster Core/Auth y Storage, sin garantía previa |
| Copia física / otra herramienta | No ensayada; requiere artefactos y compatibilidad propios | Puede conservar identidades, pero también configuración/autoridad que debe aislarse | Sustituye receta lógica aprobada | No deducir compatibilidad Auth, datos ni bytes Storage |
| Forzar catálogos/OIDs o tolerar errores | No ejecutado | Riesgo de incoherencia o permisos no acreditados | Fuera de las garantías y límites actuales | Rechazado como correctivo |

## Cambios exactos realizados

Solo se añadieron instrumentos de diagnóstico/custodia, expected y documentación/evidencia del correctivo en este nuevo worktree. No se modificó el motor, el proveedor, el código de aplicación, r3 ni el harness histórico de restauración. Los seis diffs tracked frente a la base son heredados del candidato anterior, no cambios de este correctivo. Los archivos nuevos se enumeran exactamente en el manifiesto correctivo.

`scripts/h6-015-pg17-diagnosis.py` crea cuatro destinos exclusivos: dos reciben los globals históricos íntegros; otros dos reciben únicamente el prefijo anterior al primer GRANT para inspeccionar roles/OIDs y repetir el GRANT rechazado. Este segundo uso es diagnóstico incompleto, **nunca una restauración aceptada ni un recurso para S06–S10**. Los errores se reducen a código, función y ubicación; no se registran SQL, configuración ni payloads.

`scripts/h6-015-pg17-custody.py` copia únicamente raíces sintéticas referenciadas por recibos históricos, rechaza symlinks/recursos activos, verifica cada archivo antes/después, restringe modos y revisa ACL. El material privado nunca se incorpora a Git.

## Pruebas, permisos y límites

[Diagnóstico ejecutor](../../tests/fixtures/h6-015-pg17-corrective/diagnosis-1792678004452660000.json): **42 comprobaciones PASS** del diagnóstico, no del restore. Se desglosan en 18 controles de motor, grafos, rollback e integridad y 24 mutaciones instrumentales de comparación. Estas últimas detectan cambios en rol, miembro, grantor, ADMIN/INHERIT/SET, aristas omitidas/añadidas y atributos SUPERUSER/BYPASSRLS/CREATEROLE/LOGIN. No sustituyen pruebas reales de privilegios de aplicación.

El auditor produjo **26/26** comprobaciones independientes con dos clústeres y globals propios: 17 controles del motor/grafo, ocho contrapruebas instrumentales y una comprobación agregada del grupo. Verificó SET ROLE, SESSION AUTH, atribución del GRANT implícito y las dependencias efectivas de ADMIN/REVOKE. Su dictamen no concede aceptación a Core o Storage. La membresía ADMIN adicional no se presenta como mayor acceso inmediato de quien ya es SUPERUSER: modifica el grafo persistente y sus consecuencias ante revocación o democión.

**Core y Storage: restauración no completada.** Tras el fallo de globals no se cargaron sus archivos de base. Por tanto no se declaran PASS de owners/ACL de objetos, extensiones, datos/relaciones/versiones, aislamiento de actores o ausencia de escalada en recursos restaurados. Esos requisitos están pendientes, no sustituidos por pruebas mínimas. Los clusters nuevos quedaron detenidos, con datos conservados y red limitada a sockets Unix bajo el perfil de aislamiento heredado.

La evidencia Auth anterior, su código congelado, manifiestos y dictámenes siguen intactos. No se repitió la batería completa ni se dedujo compatibilidad Auth R2 sobre una restauración Core que no existe. Los 210 tests y build/lint/typecheck del candidato anterior son evidencia histórica, no nuevas ejecuciones de este correctivo.

## Custodia

[Recibo histórico persistente](../../tests/fixtures/h6-015-pg17-corrective/custody-receipt-v1.json): **32.754 archivos / 1.172.113.768 bytes**, inventario privado SHA-256 `7cd26c6f47df84ec41aac22171c2a502ff0a404e428fd204f7481b627719bdc9`, raíz `/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-pg17`. Incluye dumps, configuración, secretos exclusivamente sintéticos y recursos históricos de ejecutor/auditor referenciados por recibos.

Directorios 0700, archivos 0600, propietario local comprobado, sin ACL allow adicional; destinos fuera de Git y carpetas sincronizadas de Drive. Igualdad por archivo de fuente y copia, revisada de nuevo tras copiar. No se borró ningún original temporal. La protección acreditada es por permisos locales; no se afirma cifrado ni una política de retención Production.

Una [adenda de custodia](../../tests/fixtures/h6-015-pg17-corrective/custody-addendum-v1.json) incorpora de forma separada los recursos nuevos de este diagnóstico y del auditor, sin alterar el inventario histórico. Las revisiones independientes se identifican en su propio manifiesto, separado del ejecutor.

## Fases posteriores y decisión pendiente

S06–S10 integrados permanecen pendientes de una restauración válida; no se ejecuta renovación F1/F2, conciliación o acceso sobre destinos incompletos. AC-073 y AC-074 no tienen aceptación integral. S11 no autorizado; mediciones parciales no equivalen a RTO/RPO. ARCH-PENDING-002 y DM-PENDING-005 OPEN. H6-015 mantiene IN PROGRESS por la decisión vigente del director; se conserva la ficha histórica sin cambios normativos.

La decisión pendiente está concretada en la propuesta v1: revisar la restricción de bootstrap distinto y el tratamiento explícito del único CREATE ROLE bootstrap ya satisfecho por initdb. Solo después de aprobación y expected propios podrá implementarse esa variante y ensayarse en nuevos destinos.

**STOP en la frontera normativa; investigación, diagnóstico independiente y custodia autorizados completados. Sin cierre, S11, commit, push, publicación, Drive, Hosted/Production ni efectos externos.**
