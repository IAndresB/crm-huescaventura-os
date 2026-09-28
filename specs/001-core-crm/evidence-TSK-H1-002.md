# TSK-H1-002 — matriz normativa previa a la comprobación

Fecha: 2026-09-29. Base a falsar: `bb259a9278727a60f14f1f22bfc1a1c85872a631` (H1-001 publicado). Estado: **VERIFICACIÓN FORMAL LOCAL SATISFACTORIA**. Este expected se fijó desde las fuentes APPROVED y la ficha H1-002 antes de escribir las assertions formales; ningún PASS focal de H1-001 se heredó.

Fuentes asignadas: Tasks §4.2 y §6 (SPEC-FR-ID-001/002, SPEC-FR-SEC-006, AC-001/002, DM-INV-001–004, PLAN-DEC-003, PLAN-B02, PT-01, D017), Plan §§4, 5.1, 7.3, B02/B07, C01/C02/C03/T11; además Constitution P05/P06/P07/P10/P13/P18, BR-CON-001–006/BR-SEC-003, Domain Model §§4.1/7/14, State Machines G1/G4 y SM-FORB-02/29/32. H2-008 es la integración posterior de Acceptance real. DM-PENDING-005 sigue abierto; todos los datos de esta matriz son sintéticos.

Estado inicial común R01–R18: PostgreSQL 17 efímero, cadena H0 completa seguida de H1-001, un Administrador/Propietario sintético con sesión/MFA/epoch F2 válidos, clave F1 limitada al propósito H1, tablas H1 vacías, dos conexiones SQL separadas (runtime y observadora bootstrap). IDs UUID nuevos por fila, sujetos/fuentes `fixture-*`, contacto `example.invalid`, ningún dato personal real. Una fila pasa solo si coincide el resultado de la operación **y** el estado persistido leído por la conexión observadora; en negativos, resultado denegado y ausencia de residuos. Las comprobaciones de ACL no usan privilegios del bootstrap como oráculo de runtime.

| ID | Fuente / supuesto inicial sintético | Expected fijado / criterio PASS |
|---|---|
| R01 | ID-001, DM-INV-002; contexto O, Contact C, Organization A y Group G nuevos | Tres identidades y tipos distintos, G ligado solo a O; A admite varios C verificados; email/teléfono no son claves de identidad. |
| R02 | ID-001, AC-001, DM-INV-001; C sin nombre/canal y G sin tamaño | Alta permitida con fuente, campos desconocidos `null` y no cero; registrar después tamaño estimado y confirmado sin sobrescribir el primero. |
| R03 | ID-002, DM-INV-003/004, AC-002; O con C1 principal, luego C2 | Cambio crea nueva designación; C1 permanece identificable y cerrado, C2 vigente; hechos/historia anteriores no se atribuyen a C2. |
| R04 | ID-001, DM-INV-002, AC-002; A pagadora, G participante | Solo dos funciones explícitas y separadas; ni pagador implica participante ni participante implica aceptante; ninguna Acceptance se fabrica. |
| R05 | ID-001/002, D017; dato con fuente, evidencia, motivo, actor y fecha de hecho | Historia conserva quién, fuente, antes/después, momento registrado y momento del hecho si consta; la fecha del hecho no se inventa cuando falta. |
| R06 | BR-CON-002/004, DM-INV-003, SEC-006; C candidato sin evidencia suficiente | Puede conservarse el dato incompleto; no se permite convertirlo en interlocutor principal ni crear facultad verificada o permiso interno. |
| R07 | BR-CON-001, DM-INV-001, AC-001; falta dato de una acción dependiente | Se rechaza solo la atribución dependiente, sin impedir alta/actualización independiente de Contact/Group. |
| R08 | DM-INV-003, BR-CON-002; mismo email en dos C, relación A-C sin prueba | Ninguna fusión/relación se infiere por coincidencia; el vínculo no verificado se rechaza sin escritura. |
| R09 | PLAN-C01, SEC-006; lectura humana vigente y otra sin sesión/MFA | Proyección autorizada con procedencia/certidumbre y paginación; lectura no autorizada rechazada, sin exponer datos. |
| R10 | PLAN-C02, DM-INV-001–004; comando inválido por tipo/rol/evidencia | Decisión previa no escribe; C03 vuelve a validar estado actual y no convierte el candidato en verificado. |
| R11 | PLAN-C03/T11, PLAN-DEC-003; dos cambios sobre misma versión de contexto | Solo un ganador; otro recibe conflicto; versión, designación, operación e historia de un único éxito, vistos desde conexión separada. |
| R12 | PLAN-C03/T11; dos actualizaciones de entidad con expected version 0 | Solo una persiste; conflicto no deja segunda historia ni operación. |
| R13 | PLAN-C03/T11; falla inserción de historia antes de COMMIT | Entidad/designación, operación, versión e historia revierten juntas; no éxito parcial. |
| R14 | PLAN-C03/T11; reenvío de misma operación/material tras respuesta perdida | Replay devuelve resultado durable sin duplicar; misma clave con material cambiado da conflicto y no mutación. |
| R15 | SEC-006, SM-FORB-29, D037–D039; runtime/anon/authenticated/PUBLIC | Sin SELECT/DML directo en tablas privadas ni ejecución pública; owner, RLS/FORCE y funciones estrechas; relación comercial no da acceso interno. |
| R16 | P13, PLAN-DEC-003, V-MIG; base H0 fresca | Migración H1 forward-only se aplica al final de H0, sin editar H0, en transacción y sin abrir acceso hosted/Production. |
| R17 | G4, SM-FORB-02/32, D017; C1 anterior y actualización posterior | Historia anterior permanece inmutable/consultable; no se reescribe Acceptance (todavía inexistente en H1); IDs no se reutilizan. |
| R18 | PT-01, V-DOM/V-DAT/V-AT, regresión H0 | Focales formales independientes y regresión acumulada pasan; datos sintéticos; DM-PENDING-005 y H2-008 siguen pendientes sin atribuirles PASS. |

Un FAIL material se registrará como H1-002-Fxx con reproducer y estado histórico; después de la corrección se repetirá la matriz completa. Ningún expected se reducirá para conseguir PASS.

## Observado frente a matriz fijada

La suite separada `tests/integration/postgres-h1-002.test.ts` crea su propio clúster/DB, aplica la cadena H0→H1 desde cero, usa un actor y claves nuevas y consulta el estado persistido por la conexión bootstrap separada después de cada operación material. **4/4 pruebas formales PASS; R01–R18 satisfechas en su alcance local.**

| Filas | Observado |
|---|---|
| R01–R02 | Cuatro IDs: Organization, dos Contact con el mismo email sintético, Group con contexto. Contact sin nombre y tamaño confirmado de Group quedan `null`; estimado 12 conserva su fuente. |
| R03–R05 | Dos designaciones principales con IDs distintos: anterior cerrada, nueva vigente. Cliente/pagador Organization y participante Group son filas explícitas e independientes; no se crea aceptante ni Acceptance. Historia de vínculo, persona y contexto conserva actor, fuente, evidencia, motivo, `happened_at` y `recorded_at` separados. |
| R06–R08 | Contact candidato se registra pero falla la designación principal. Vínculo A-C sin verificación se rechaza sin persistir; dos contactos con el mismo email siguen separados. Las altas independientes continúan. |
| R09–R10 | C01 devuelve procedencia/certidumbre, páginas de una fila y deniega lectura sin sesión; C02/C03 rechazan atributo de Contact en Organization antes de escritura. |
| R11–R14 | Carreras de designación y actualización: un ganador por versión. Replay equivalente devuelve el resultado previo; material distinto con mismo ID da conflicto. Fallo inyectado en historia deja cero entidad, operación e historia. Estado comprobado por conexión independiente. |
| R15–R17 | `crm_h0_runtime`, `anon`, `authenticated` y PUBLIC sin acceso directo; owner separado y FORCE RLS. Migración H1 única, aplicada al final de H0. Designación anterior e historia conservadas. Acceptance real aún no existe: su vinculación inmutable queda asignada a H2-008. |
| R18 | Fixtures completamente sintéticos. La regresión acumulada y gates se consignan debajo. |

**Defectos H1-002-Fxx:** ninguno detectado; no hay Fxx material abierto. El contraste no cambia D037/D038/D039 ni DM-PENDING-005. Los contextos H1 son referencias técnicas; no acreditan Opportunity, Booking, Acceptance, datos reales, Auth real ni hosted. La verificación de integración con Acceptance histórica y escenarios completos corresponde a H2-008/H6.

## Regresión y límites

| Comprobación | Resultado |
|---|---|
| Suite formal PostgreSQL local | 4/4 PASS, 0 fallos/omitidos/cancelados; clúster separado |
| Suite focal H1-001 | 9/9 PASS, no usada como oráculo de H1-002 |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm audit --prod` | PASS, sin vulnerabilidades conocidas |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` | PASS |
| `pnpm test` | PASS, 31/31 |
| `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres` | 278/278 PASS, 0 fallos/omitidos/cancelados, 396207 ms; 265 H0 + 9 H1-001 + 4 H1-002 |
| `pnpm run build` | PASS |
| `git diff --check` | PASS |

Alcance exclusivamente local/aislado. Supabase hosted/Production no tocados. H0-M01/F1/M02 mantienen solo su acreditación Staging previa; H0-M03/M04/M05/M06 y H1 no acreditados hosted. PLAN-AUTH-001–006 PENDING globalmente. DM-PENDING-005 abierto; ninguna PII real fue usada. H1 permanece IN PROGRESS y H1-003 NOT STARTED.

Una ejecución de regresión previa falló por tres servidores PostgreSQL efímeros que habían quedado activos al cancelar una ejecución anterior y ocuparon puertos de H0. Se detuvieron exclusivamente esos tres clústeres temporales de prueba; la repetición completa desde entorno limpio produjo 278/278 PASS. Ese incidente fue de infraestructura de ensayo, sin defecto H1-002-Fxx del producto ni modificación del expected.
