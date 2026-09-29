# TSK-H1-003 — contrato de preparación y evidencia local

Base: `8049c2f367c6f87c3df080267bea8fa985ac0525`; D040: `285026b25c97b69ccfbe3e7e756c961c3c62fa38`.
Entorno autorizado: PostgreSQL efímero local, actores y referencias sintéticos. Estado de esta sección: **expected definido antes de la implementación**.

| ID | Fuente aprobada | Expected local |
| --- | --- | --- |
| I01 | FR-ID-003, AC-003, BR-CON-005 | Nombre, email o teléfono coincidentes ofrecen candidatos sin fusión ni eliminación automática. |
| I02 | FR-ID-003, AC-003, HIST-006 | Solo acción humana identificada con evidencia fusiona Contact/Organization del mismo tipo y ámbito; origen, destino, relaciones, procedencia e historias siguen recuperables. |
| I03 | FR-ID-003, AC-062 | Archivo de identidad es recuperable y no acredita cierre; restauración deja un nuevo hecho histórico. Opportunity y Booking no se fusionan. |
| I04 | FR-ID-005, BR-ID-001/002, DM §8.1, D040 | OP/PR/RES/INC tienen serie propia correlativa por año, código único e inmutable; año determinado exclusivamente por instante de asignación del servidor en Europe/Madrid, con corte local del 1 de enero. |
| I05 | FR-ID-005, AC-062 | Archivo, fusión o anulación no liberan códigos; concurrencia y replay no crean códigos competidores. |
| I06 | IDEMP-003, H0 F1/F2 | Mismo ID de operación y contenido reproduce el resultado; contenido distinto falla. Sesión/generación/época caducadas o revocadas fallan sin cambio. |
| I07 | Plan §7.2, H0 C01/C03/T11 | Rechazos y fallos de historia son atómicos; runtime sin DML directo, funciones sin PUBLIC, owners y RLS/FORCE correctos. |

## Observado local de implementación

Migración forward-only `202609290002_h1_merge_archive_codes.sql`; adaptador `h1-resolution-adapter.ts`; focales `postgres-h1-003.test.ts`: **3/3 PASS** en PostgreSQL 17.11 efímero. Los comandos exigen sesión/época F2 y F1 en la misma transacción. El estado final se leyó desde conexión bootstrap separada.

| IDs | Observado |
| --- | --- |
| I01 | Dos Contact con email/teléfono sintéticos iguales subsisten; consulta de candidatos devuelve una señal, sin escribir merge. |
| I02–I03 | Merge humano con fuente, evidencia y razón conserva IDs, vínculo previo, ambas historias y puntero al destino. Archivo/restauración aumenta versión y deja hechos históricos; referencia nueva al origen archivado se deniega. |
| I04–I05 | OP/PR/RES/INC tienen contadores propios; OP requiere contexto Opportunity sintético, RES contexto Booking sintético. Año `Europe/Madrid` se comprueba en frontera UTC 2026/2027; asignación ocurre tras adquirir el lock de serie. Código/ID se consultan en ambos sentidos con C01; replay y concurrencia no duplican. |
| I06–I07 | Replay alterado, destino inválido, interacción de lectura para escritura y acceso SQL directo se deniegan. Owners, RLS/FORCE y ausencia de EXECUTE público comprobados; la suite formal añade rollback inyectado. |

El primer intento de la focal temporal esperaba equivocadamente 2027 para junio de 2026; el oráculo del test se corrigió a 2026 sin tocar el código productivo. Antes de la verificación formal se corrigieron dos riesgos de implementación: anchura de correlativo superior a 9999 y espera de serialización junto al corte anual.

PR/INC quedan como registro local de asignación para identificadores estables sintéticos; OP/RES se vinculan a los contextos técnicos H1. La creación real de Opportunity, Proposal, Booking e Incident y sus transiciones pertenecen a hitos posteriores. Para RES, la integración futura debe asignar el código en el nacimiento de Booking de SM-BK-01, nunca al preparar una fecha de servicio. Ningún contexto H1 acredita que exista una Booking real. No se acredita proveedor, hosted ni Production.
