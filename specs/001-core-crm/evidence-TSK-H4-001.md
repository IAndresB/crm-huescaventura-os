# Evidencia — TSK-H4-001

Base inicial `bcb69fcb4fd508a34bde1a3fbc40b4dc653291c3` tras fetch, main limpio == origin/main y SHA exigido exacto. H0 COMPLETED técnico/local/aislado; H1/H2/H3 COMPLETED local/aislado; H3-001–015 COMPLETED; H4–H6 NOT STARTED antes del bloque. H3-015-F01 y 52 Fxx históricos CLOSED; cero materiales abiertos heredados;37 migraciones; health-check independiente intacto. Hosted H2/H3 no acreditados; Production no autorizada. Autorización humana limitada a H4-001/002.

Expected independiente congelado en `88bf5f4fed4d02ac30a6c9be6946861137079cf6` antes de producto:68 casos y20 filas literales Tasks §6 asignadas. Contenido byte-identical al cierre, SHA256 `c96ba6bbf95cc3c7b32f09548268cdd9a69179b3332c00d4f6ef45dc856374bd`. Fuentes aprobadas, fichas completas y Plan §§4/8–9/C01–C04/C06/PT-08, SPEC/BR/DM/SM/D016/D017/P09/P10; ningún expected derivado de producto.

**SHA exacto de producto/verificador probado: `9c26bd6ca0b0a3b23e5f1a4a8310089393c0166b`.** Inicio autorizado 2026-10-04; cierre documental 2026-10-05. Node24.21.0/pnpm11.19.0/PostgreSQL17.11 nativo; CLI Supabase2.118.0 `migration new`. Storage B07 oficial fuente `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, file loopback privado y credenciales efímeras. Exclusivamente fixtures sintéticos y sesiones PostgreSQL independientes. El commit documental final es posterior y se identifica en Git/informe publicado; no se confunde con el SHA probado.

## Modelo y contratos

`Document Requirement` es una regla configurable inmutable por ID/versión y fuente, finalidad, tipo, alcance, condición material y campos mínimos. La evaluación documentada conserva la condición vigente con procedencia/versión y exige evidencia C04 manual revisada que vincula todo el material exacto con actor/alcance/momento. No se instala una lista universal ni requisitos reales inventados.

`Required Document` tiene identidad propia y Booking real; su base inicial, revisiones antes/después, regla aplicada, finalidad y alcance `Booking / Booking Service / Booking Night / Participant + acción` son reconstruibles. Participant solo es admisible con asignación nominal real al servicio/noche: no crea Contact, nombres, habitaciones ni participantes ficticios. Las cantidades y la lista nominal siguen usando H2 sin sumarse. Cada nueva regla/versión queda fijada; reutilizar la misma versión con material distinto produce conflicto.

Cinco tablas append-only: `b07_document_rules`, `b07_requirements`, `b07_requirement_operations`, `b07_requirement_revisions`, `b07_requirement_documents`. Cada Requirement tiene historia/operación durable por FKs diferidas. Se reutiliza el trigger vigente de inmutabilidad. No se añade storage, segundo sistema de archivos, URL pública, conector o efecto externo.

Un requisito Pendiente existe con documento/revisión nulos. Si hay archivo, referencia el `b07_records` original y su `b07_object_versions` privado almacenado. También admite registro documental manual real B07 sin archivo ficticio. Los originales/derivados permanecen separados; solo original autorizado cubre el requisito. Una corrección conserva el padre B07 y las revisiones anteriores; su linaje sigue válido al hacer replay o aplicar una versión futura. No se extrae automáticamente información personal del original a campos estructurados.

SM-DO-01 evalúa necesidad con regla/fuente/finalidad/alcance; produce Pendiente o No aplica motivado por condición real. SM-DO-02 recibe recurso real sin revisión ni cumplimiento implícitos. SM-DO-03 exige acto C04 con comprobación explícita de contenido/versión/alcance/finalidad y resultado: Revisado o Incidencia con diferencias, causa, actor, momento y evidencia. SM-DO-04 exige fundamento de no aplicabilidad desde regla/alcance; si la condición obligatoria sigue vigente, ni Administrador ni Human Approval dispensan el requisito. SM-DO-05 reabre solo el Requirement afectado: Pendiente, Recibido o Incidencia según nuevo hecho; V1 y revisión anterior siguen recuperables. Volver a adjuntar idéntico original sin cambio material no permite reabrir.

SM-FORB-20 se intenta expresamente: adjunto con estado Revisado impuesto se rechaza; comprobaciones o nombres de archivo no sustituyen evidencia de revisión. La Task H1 relacionada puede registrar seguimiento Pendiente; intentar completarla se rechaza por la frontera H1 vigente y nunca satisface el Requirement. No se implementa la máquina Task H5 ni Incident general.

C06 evalúa exclusivamente finalidad/acción/servicio/noche/persona indicada. Solo requisitos imprescindibles y realmente aplicables generan falta localizada (`document`, `review`, `compliance`) y pendiente E3; no existe `bookingBlocked`. En AC-051 S1 Recibido queda pendiente de revisión y S2 independiente continúa. En AC-019 se conserva N1=12, N2=10 y cuatro nominales exclusivamente de N1 al reevaluar la base documental de N2 por cambio material declarado con evidencia; no 16, no ocho ficticios ni habitaciones. La edición general de Booking/noches corresponde a tareas posteriores y no se implementa en este bloque.

C01 devuelve consulta autorizada; C02 mantiene decisiones separadas de hechos; C03 confirma efecto/historia/resultado juntos; C04 conserva original/procedencia y acto de revisión; C06 no inventa satisfacción, elegibilidad, confirmación ni cierre. Recomendación comercial Alta no aporta revisión/elegibilidad: intentar usarla como sustituto se rechaza.

F1/F2, actor/sesión/epoch, mínimo privilegio y APIs estrechas vigentes. Todas las tablas tienen RLS/FORCE RLS, owners NOLOGIN heredados y sin BYPASSRLS; runtime/anon/authenticated sin CRUD directo. Helpers privados sin PUBLIC execute; APIs con `search_path=pg_catalog,pg_temp`, entradas exactas y error externo saneado. Lectura de UUID ajeno devuelve null o denegación, sin enumeración. La proyección C06 contiene exclusivamente Requirement, alcance afectado y qué falta; excluye documentos de otro alcance, otros participantes, economía y metadatos de autorización.

DM-PENDING-005 sigue pendiente: no política RGPD definitiva, consentimiento supuesto, audio, plazo de conservación ni borrado automático importante. Archivado recuperable permanece separado de eliminación/anonimización. El diseño conserva la frontera para una futura política autorizada.

## Verificación vinculada

79/79 H4:68/68 matriz independiente +8/8 reproducciones/guardas Fxx +2/2 complementos +1/1 focal. Están incluidos en1294/1294 PostgreSQL; no sumar doble.118/118 unitarias completas; health-check independiente1/1 aparte.0 FAIL/skipped/cancelled materiales en ejecución definitiva.

V-DAT/V-AT: equivalencia y replay de aplicación/recepción/revisión/No aplica sin doble historia; misma clave con material distinto E2; primer efecto `replayed=false` y replay `true`; respuesta perdida tras COMMIT recupera resultado durable. UUID/identidad B07 fiable, sin fusión por filename/tamaño/tipo. Dos sesiones independientes prueban misma necesidad, recepción, dos revisiones/base, revisión vs cambio, No aplica vs cambio y correcciones concurrentes; stale revision no sobrescribe. Lock de Booking serializa la unidad documental, sin bloquear semánticamente efectos independientes.

Rollback inyectado antes de Requirement, después de raíz antes de historia, después de enlace antes de revisión vigente, durante revisión/Incidencia/No aplica/reapertura y en COMMIT mediante trigger diferido. No quedan raíz sin historia, enlace parcial, revisión sin actor/resultado ni reapertura sin causa. Se comparan snapshots completos de las cinco tablas ante cada rechazo/fallo.

V-MIG PASS: única forward `20261004213420_h4_document_requirements.sql`, creada con CLI oficial;38 migraciones en total. Instalación vacía real y upgrade H3 poblado con Booking/original privado/Invoice revisada, preservando todas las filas/tablas antiguas y catálogo de owners, ACL, RLS, functions/search_path, policies, triggers y roles. Fallo DDL hace rollback sin esquema parcial; reintento íntegro. Runtime no puede aplicar migración. Las37 previas y los tres artefactos de health-check son byte-identical a base; [hashes](../../tests/fixtures/h4-002/protected-baseline.json). B07 conserva los bytes anteriores; regresión completa H0–H3 PASS. Los dos contadores heredados H3 se acotan a la misma frontera histórica, sin cambiar expected/producto H3.

Gates PASS: instalación congelada, typecheck, lint/import boundaries, unitarias, PostgreSQL completo, focal/matriz/reproducers/complementos, build, auditoría de producción sin vulnerabilidades conocidas y diff-check final. [Resumen recuperable](../../tests/fixtures/h4-002/regression-summary.json) y logs `final-*` de la misma carpeta.

Comandos: `pnpm install --frozen-lockfile`; `pnpm run typecheck`; `pnpm run lint`; `pnpm test`; `pnpm run build`; `pnpm audit --prod`; `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres`; mismo entorno con `node --test tests/operations/supabase-health.test.mjs`. El runner PostgreSQL instala Storage oficial local y selecciona las cuatro suites H4 para la ejecución focal mediante nombres explícitos.

[Verificación independiente y defectos](evidence-TSK-H4-002.md).

Pendientes expresos: H4-003+; H4-021; H4-023; H5-014; Incident completo; confirmación/prestación completa; Refund/fianza; coordinación/avisos/jobs H5; política definitiva de retención/anonimización/eliminación; audio; datos reales; conectores; hosted; Production. PLAN-AUTH-001–006 y todos los pendientes globales vigentes conservados; hosted H2/H3 no acreditados, ningún despliegue hosted ni autorización de Production. Obligaciones de integración H4-021/H4-023/H5-014 no se acreditan con dobles ni se preparan.

**H4 IN PROGRESS; TSK-H4-001/002 COMPLETED local/aislado; H4-003+ y H5–H6 NOT STARTED. H3 COMPLETED local/aislado conservado. STOP obligatorio tras publicar H4-002; esperar nueva autorización humana.**

Los logs con espacios finales se conservan comprimidos byte a byte; [manifest de originales](../../tests/fixtures/h4-002/log-originals.json) registra SHA256 y tamaño sin alterar el FAIL.
