# TSK-H1-001 — identidades y responsables contextuales

Fecha: 2026-09-29. Base local/remota previa a la implementación: `f9eed55a4331e9e0f9ba28aa74e20639006883a8`, rama `main`, árbol limpio. Implementación publicada en `bb259a9278727a60f14f1f22bfc1a1c85872a631`; **COMPLETED en alcance local/aislado** tras [TSK-H1-002](evidence-TSK-H1-002.md), R01–R18 PASS. No sustituye al Last Approved Commit `3e3f47a1692290412a03cf14087c2c470b8cab90`.

## Fuentes y expected fijado

Fuentes APPROVED: Constitution → Product → Business Rules BR-CON-001–006/BR-SEC-001–005/BR-ID-001–002 → Domain Model §§4.1/7/14 (DM-INV-001–004) → State Machines G1/G3 y SM-FORB-02/29/32 → Architecture §§3–6/14 → SPEC-FR-ID-001/002, SPEC-FR-SEC-006, AC-001/002, SPEC-NFR-003 → Plan §§4, 5.1, 7.1–7.3 (B02/B07, C01/C02/C03, T11) → Tasks §§2.2–2.3/4.2/6. D017 y DM-PENDING-005 conservan sus límites. No se cambiaron las fuentes superiores aprobadas.

| Expected local H1-001 | Observado en implementación/focal |
|---|---|
| Contact, Organization y Group mantienen identidad técnica y semántica separada, con datos desconocidos nulos y procedencia. | `identity_entities` usa tipo restringido, campos de contacto y tamaños de Group separados; la creación exige fuente y no exige nombre, email, teléfono ni tamaño. La identidad no se deriva de coincidencia de canal. |
| Organización y contacto se relacionan solo con evidencia; Group conserva contexto y tamaño estimado/confirmado separados. | Relación estructurada `identity_organization_contacts`; Group referencia contexto verificado y almacena tipo/tamaños/fuente sin convertir desconocido en cero. |
| Funciones cliente, pagador, participante e interlocutor principal no se infieren entre sí. | Designaciones estructuradas por contexto, parte, función, procedencia y estado verificado/candidato. Pagador no crea participante ni aceptante. El interlocutor principal exige Contact verificado y evidencia. |
| Cambiar interlocutor preserva designación anterior y no reatribuye hechos históricos. | El cambio cierra la vigencia anterior, crea una designación con nuevo ID y conserva ambas; la historia registra antes/después y la antigua sigue referenciable. Acceptance será implementada por H2 y su vínculo exacto se verifica en H2-008. |
| Datos incompletos permiten acciones independientes pero no conceden autoridad. | Contact y Group incompletos se registran; candidato no se vuelve Primary Contact ni adquiere permisos CRM. CRM Actor y Contact son tablas/autoridades separadas. |
| Consulta C01, decisión C02, persistencia C03, concurrencia y replay preservan alcance. | C01 exige F1/F2, devuelve procedencia/certidumbre y páginas de hasta 100 filas; C02 valida reglas estáticas sin escritura; C03 vuelve a comprobar estado/versiones bajo transacción, conserva operación/historia/resultado o rollback y reconoce replay equivalente. |

## Cambios y límites

Migración forward-only: `supabase/migrations/202609290001_h1_contextual_identities.sql`, aplicada tras H0-M06. No se editó ninguna migración H0. Añade contextos técnicos de identidad para las futuras referencias de Opportunity/Booking, entidades tipadas, vínculos de organización, designaciones, operaciones e historia. Contexto H1 es una referencia local acreditada con fuente; no declara creada una Opportunity, Booking ni Acceptance de H2. Las claves técnicas son UUID; email/teléfono no son claves de identidad ni habilitan fusión. La fusión y el archivado completos siguen en H1-003/004; H1-001 cubre actualización/corrección de datos y cambio de designación en la porción T11 que le corresponde.

La migración extiende solamente el objetivo `identities` de F1 para `crm_h0_runtime` y `human_identities` de F2 para C01/C03, conservando las restricciones de D037/D038/D039 y el login exclusivo TTE. Reutiliza los roles owner/executor humanos de H0, RLS/FORCE en las seis tablas privadas y funciones SECURITY DEFINER estrechas en `crm_api`; `PUBLIC`, `anon`, `authenticated` y runtime no reciben DML directo. La API de identidad exige sesión humana F2 y capacidad técnica F1 en la misma transacción. No se añadió permiso por relación comercial ni Human Approval a estas operaciones ordinarias. Si la migración falla, su transacción completa revierte; una corrección posterior requiere otra migración forward y protección/restauración de datos según P13, no editar H0 ni borrar historia.

La historia registra actor CRM, fuente, evidencia, momento de registro, fecha del hecho cuando consta, motivo, antes/después y referencias a entidad, contexto y parte relacionada. La designación conserva por separado `effective_at` y `recorded_at`; la fecha del hecho nunca se deduce del registro. Un fallo inyectado en la escritura de historia revierte también la entidad y el resultado. La respuesta perdida después de COMMIT se recupera con la misma identidad/material de operación; contenido distinto con la misma clave produce conflicto. La actualización usa versión esperada y conserva los campos no modificados.

Los datos y sujetos de prueba son completamente sintéticos (`example.invalid`, nombres y fuentes ficticias). **DM-PENDING-005 sigue abierto**: no se usó PII real ni se fijó política de conservación, anonimización, eliminación o audio. Sin conexión a Supabase hosted, Production, Auth real, proveedor, destinatario o efecto externo. H0-M01/F1/M02 conservan su acreditación hosted previa; H0-M03/M04/M05/M06 y esta migración H1 no están acreditadas hosted. PLAN-AUTH-001–006 siguen PENDING globalmente.

## Verificación de implementación

Focal `tests/integration/postgres-h1-001.test.ts`: 9/9 PASS con PostgreSQL 17.11 local efímero, actor/sesión/claves sintéticos, migración desde cadena H0, conexión bootstrap independiente, runtime ordinario y roles sin autoridad. Cubre entidad/contexto, incompletitud, designación cambiante, pagador/participante, historia por persona/contexto, procedencia, versión, carrera, replay, rollback inyectado, ACL/RLS/FORCE/SET ROLE/Data API y paginación. Estos focales no sustituyen la verificación formal independiente TSK-H1-002.

| Comprobación | Resultado local |
|---|---|
| `pnpm install --frozen-lockfile` | PASS, lockfile sin cambios |
| `pnpm audit --prod` | PASS, sin vulnerabilidades conocidas |
| `pnpm run typecheck` | PASS, Next typegen y TypeScript |
| `pnpm run lint` | PASS, fronteras de imports |
| `pnpm test` | 31/31 PASS |
| `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres` | 274/274 PASS, 0 fallos/omitidos/cancelados, 396109 ms; incluye 265 H0 y 9 H1, sobre la versión final de la migración |
| `pnpm run build` | PASS, Next.js 16.3.5 |
| `git diff --check` | PASS |

La integración H2-008 verificará la relación con Acceptance real; H6 integrará escenarios E2E, privacidad autorizada y despliegue. TSK-H1-002 concluyó después de esta implementación y permite declarar H1-001 COMPLETED solo en su alcance técnico/local/aislado.
