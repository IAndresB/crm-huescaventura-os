# TSK-H1-004 — matriz normativa independiente

Matriz fijada antes de escribir la suite formal. Oráculo: Plan §§5.1/7.2; FR-ID-003/005, HIST-006, IDEMP-003; AC-003/062; BR-ID-001/002; D040; controles H0 F1/F2. Cada fila parte del expected aprobado, no del resultado de las focales H1-003.

| Fila | Expected que se intentará falsar |
| --- | --- |
| R01 | Dos contactos con email/teléfono iguales permanecen independientes antes de revisión humana; la búsqueda solo propone candidatos. |
| R02 | Un merge humano documentado conserva origen, destino, vínculos, procedencia e historias, visibles desde conexión independiente. |
| R03 | No se fusionan tipos distintos, ámbitos distintos, grupos, Opportunity ni Booking; no hay efecto parcial. |
| R04 | Archivo y restauración conservan ID, vínculos e historia; archivo no representa cierre. |
| R05 | OP/PR/RES/INC tienen contadores separados, únicos, correlativos por año. El corte exacto de D040 funciona independientemente de la zona de sesión. |
| R06 | Código emitido no se reutiliza tras archivo/fusión/anulación; petición competidora sobre mismo ID no obtiene segundo código. |
| R07 | Replay idéntico reproduce resultado; replay alterado falla; concurrencia no crea doble emisión ni saltos entre transacciones confirmadas. |
| R08 | Actor/sesión/generación/época revocados, interacción incorrecta y acceso directo runtime/PUBLIC no producen cambios. |
| R09 | Fallo al registrar historia revierte el estado y el correlativo; no se declara éxito parcial. |
| R10 | Migración forward-only, owner, RLS/FORCE, grants y ausencia de acceso Data API respetan el aislamiento local. |

Datos y autoridades del ensayo: PostgreSQL efímero nuevo, identificadores y correo sintéticos, claves efímeras. No se usan Auth, email, dispositivos ni hosted reales.

## Histórico F01 y reverificación

**H1-004-F01 — CLOSED localmente.** Fuente: FR-ID-005/BR-ID-001 y R05. Expected: el código emitido se puede buscar por código humano y por ID técnico bajo C01/F1/F2. Observado en la primera corrida formal: los tres contenedores de prueba pasaron, pero la revisión de cobertura mostró que solo existían asignación y lectura directa privilegiada del ledger; faltaba una consulta autorizada de búsqueda. Reproducer: después de asignar OP, intentar consultar desde el adaptador runtime por `OP-YYYY-NNNN`; no había operación. Materialidad: el requisito `buscable` no estaba satisfecho pese al PASS inicial incompleto. Corrección: `crm_api.identity_code_lookup` con ámbito, F1/F2 y proyección mínima; `findCode` en el adaptador; assertions formales por código e ID, ausencia en tipo distinto. Se conservaron los primeros resultados como antecedente y se repitió **la matriz R01–R10 completa desde cero** en clúster nuevo: **3/3 contenedores PASS**.

**H1-004-F02 — CLOSED localmente.** Fuente: FR-ID-003/HIST-006/AC-062 y T11. Expected: tras archivar/fusionar, ningún vínculo nuevo se puede crear con la identidad archivada; los antiguos permanecen. Observado en revisión adversarial de la primera corrección: el trigger consultaba `archived_at` sin bloquear la fila, por lo que una inserción podía leer estado activo mientras el archivo concurrente aún no confirmaba. Reproducer: transacción A bloquea la identidad y la archiva; transacción B intenta una designación en paralelo. Sin lock de lectura, B podría ver la versión anterior e insertar después del archivo. Materialidad: referencia nueva a un origen archivado. Corrección: el trigger adquiere `FOR SHARE` en orden estable antes de comprobar el estado; la prueba formal retiene el lock en A, confirma el archivo y verifica que B falla sin designación. Se repitió de nuevo **R01–R10 desde cero**, 3/3 PASS.

| Filas | Observado tras corrección |
| --- | --- |
| R01–R04 | Candidatos pasivos; dos contactos independientes; merge de tipos/ámbitos distintos rechazado sin cambiar versión; origen/destino, vínculo e historias visibles desde conexión aparte. Archivo/restauración dejan historia; vínculo nuevo a archivado rechazado, también en carrera con el archivo; Opportunity no fusionable. |
| R05–R07 | Instantes 2026-12-31 22:59:59.999Z y 23:00:00Z producen años 2026/2027 con sesiones UTC y Los Ángeles. Tres OP concurrentes obtienen 1,2,3; PR/RES/INC empiezan en 1; RES sin contexto Booking se rechaza. Búsqueda C01 por código e ID exactos. Replay idéntico conserva código; alterado y competidores de un mismo ID fallan. |
| R06 adicional | Un OP conserva su código buscable tras fusionar y archivar Contact vinculados; quedan dos identidades y el vínculo histórico. Segunda asignación al mismo OP rechazada. DST de marzo salta 01:59→03:00 local sin cambiar año. |
| R08–R10 | Fallo inyectado en historia revierte operación, ledger y contador; siguiente OP obtiene 5. Una identidad H1-001 creada antes de la migración conserva nombre, versión e ID. Runtime/anon/authenticated/PUBLIC sin acceso directo; owner separado y FORCE RLS. Generación vieja, época cerrada y sesión revocada sintéticamente deniegan C01/C03 sin nuevas filas. |

La revocación final y la carrera de archivado se inyectaron en el clúster de prueba mediante el rol de migración: verifican rechazo F2 y bloqueo concurrente, sin acreditar el procedimiento Auth real. No se usa un dispositivo ni cuenta reales. Ningún F03+ material detectado.

Un intento intermedio del fixture de época falló por la restricción existente `current_epoch=false ⇒ closed_at` obligatorio; se corrigió la preparación sintética para cerrar/restaurar ambos campos y se ejecutó otra vez la matriz completa 3/3 PASS. No fue un defecto productivo ni se modificó el expected.

La ampliación adversarial final de R06/DST y de autoridad F2 se ejecutó desde otro clúster efímero: **4/4 contenedores PASS, R01–R10 PASS**. No se congeló ni alteró el reloj real del servidor; el corte anual y DST se comprobaron en la función exacta que utiliza el asignador, y las emisiones reales tomaron `clock_timestamp()`. No hay en H1 fechas futuras de servicio ni mutaciones de esos registros comerciales: su integración y comprobación de inmutabilidad frente a cambios de tales fechas quedan para los hitos donde existan esas entidades.

## Regresión final y límites

| Comprobación | Resultado |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm audit --prod` | PASS; sin vulnerabilidades conocidas |
| `pnpm run typecheck`, `pnpm run lint` | PASS |
| `pnpm test` | 31/31 PASS |
| `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres` | **285/285 PASS**, cero fallos/omitidos/cancelados, 399561 ms; incluye H0 completo, H1-001/002, tres focales H1-003 y cuatro contenedores formales H1-004 |
| `pnpm run build`, `git diff --check` | PASS |
| Búsqueda razonable de patrones de secretos en archivos nuevos | Sin hallazgos |

Alcance **local/aislado**, con PostgreSQL 17.11 y referencias, emails y claves sintéticas efímeras. Ningún secreto real, Auth real, Booking real, dispositivo, email real, Supabase hosted ni Production. H1-005 no iniciado. PLAN-AUTH-001–006 siguen PENDING globalmente. H1 sigue IN PROGRESS.
