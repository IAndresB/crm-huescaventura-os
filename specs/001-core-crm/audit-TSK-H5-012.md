# TSK-H5-012 — Dictamen técnico independiente del delta

2026-10-15. **FAIL: defecto material H5-012-F03 reproducido. No se recomienda cierre ni publicación del candidato.** Alcance exclusivamente local, aislado y sintético. Auditoría posterior a la entrega READY FOR REVIEW; sus documentos y resultados originales se conservan sin reescribirlos.

## Base, método e inventario exacto

Base publicada solicitada: `f063879d203330adb57d7e8fef3607ae796f52d5`, árbol `104b4ecba9dd72aa166410470b362a956ed866e2`. Al comenzar, HEAD, main y la referencia local origin/main coinciden con esa base; divergencia 0/0 e índice vacío. La comparación es contra ese commit explícito. No se consultó ni alteró el servidor remoto durante esta auditoría.

Se inventariaron 36.240 archivos tracked y 146 untracked. **Delta sometido a auditoría: 147 archivos**, uno tracked modificado y 146 nuevos sin seguimiento; sin eliminaciones ni cambios de modo en los archivos previos. Este inventario se tomó antes de añadir los documentos de la auditoría.

| Grupo | Archivos | Cambio |
|---|---:|---|
| Producto | 3 | Un compositor modificado y dos migraciones nuevas |
| Pruebas | 10 | Dos unitarias y ocho integraciones nuevas respecto a la base |
| Documentación H5-012 | 7 | Defectos, matrices, evidencia e informes locales |
| Evidencia original independiente | 9 | `tests/fixtures/h5-012/independent-20261015/` |
| Evidencia correctiva F01 | 50 | `tests/fixtures/h5-012/f01-corrective-20261015/` |
| Evidencia de reanudación F02/verificación | 68 | `tests/fixtures/h5-012/resumed-20261015/` |
| **Total** | **147** | Inventario previo a esta auditoría |

[Inventario exacto JSON](../../tests/fixtures/h5-012/audit-20261015/delta-inventory.json) y [TSV](../../tests/fixtures/h5-012/audit-20261015/delta-inventory.tsv): una fila por archivo con ruta, estado, bytes, modo y SHA-256. [Snapshot completo inicial](../../tests/fixtures/h5-012/audit-20261015/baseline.json).

Los veinte archivos fuera de las carpetas de evidencias son:

- `src/domain/coordinated-projection.ts`.
- `supabase/migrations/20261015172843_h5_calendar_current_nights.sql`.
- `supabase/migrations/20261015180420_h5_projection_canonical_revisions.sql`.
- `tests/coordinated-projection-h5-012-f01.test.ts` y `tests/coordinated-projection-h5-012-f02.test.ts`.
- `tests/integration/postgres-h5-012-complete.test.ts`.
- `tests/integration/postgres-h5-012-independent.test.ts`.
- `tests/integration/postgres-h5-012-f01-corrective.test.ts` y `tests/integration/postgres-h5-012-f01-security.test.ts`.
- `tests/integration/postgres-h5-012-f02.test.ts`.
- `tests/integration/postgres-h5-012-final-migration.test.ts` y `tests/integration/postgres-h5-012-final-security.test.ts`.
- `tests/integration/postgres-h5-012-reference-chain.test.ts`.
- `specs/001-core-crm/corrective-H5-012-F01.md`.
- `specs/001-core-crm/defects-TSK-H5-012.md` y `specs/001-core-crm/defects-TSK-H5-012-resumed.md`.
- `specs/001-core-crm/evidence-TSK-H5-012.md`.
- `specs/001-core-crm/matrix-TSK-H5-012.md` y `specs/001-core-crm/matrix-TSK-H5-012-resumed.md`.
- `specs/001-core-crm/review-TSK-H5-012.md`.

La auditoría añadió únicamente este dictamen, su [matriz](audit-matrix-TSK-H5-012.md) y `tests/fixtures/h5-012/audit-20261015/`. La prueba adicional se ejecutó en una copia desechable y se conserva como `.ts.txt`; no se cambió ningún archivo de producto ni prueba preexistente.

## Resultado de los diez controles

| Control solicitado | Resultado | Fundamento |
|---|---|---|
| 1. Git y delta exacto | PASS | 147 archivos identificados y sellados frente a la base; índice vacío. |
| 2. Migraciones59/60 y compositor | PASS de los correctivos específicos; hallazgo adicional | F01 cambia solo la fuente de fechas de noches; F02 añade revisiones canónicas. El estado de cancelación de noche sigue sin llegar al calendario: F03. |
| 3. Fuentes operacionales vigentes | **FAIL** | Fecha vigente F01 y últimas revisiones F02 correctas, pero una cancelación aprobada vigente no se representa en la entrada de noche. |
| 4. Historia, snapshots y procedencia | PASS en lo comprobado | Sin DML de negocio en59/60; fechas aceptadas e historial de revisiones conservados. La contraprueba F03 confirma cancelación recuperable en timeline y noche hermana intacta. |
| 5. Permisos, exposición y normativa | PASS en el delta | Rama externa y verificación final F1/F2/owner/ACL idénticas a58; joins nuevos acotados por admin_scope y raíz. V-MIG y seguridad60 verificables. Normativa inalterada. |
| 6. Casos, aserciones y evidencia | **FAIL** de suficiencia global | Los 41 PASS ejecutados son auténticos y sus hashes coinciden; C01/C02 omiten el escenario que reproduce F03. C03/C05/C06 tienen cobertura parcial detallada abajo. |
| 7. 34 filas normativas | PASS de asignación; aceptación global no acreditada | 28 propias y seis límites locales exactos. Las obligaciones afectadas por F03 no pueden darse por satisfechas; ver matriz de auditoría. |
| 8. FAIL originales F01/F02 | PASS | Logs originales y fuentes conservados; aserciones F01 iguales salvo carga de migraciones, F02 exactamente igual al red; resultados posteriores vinculados al producto actual. |
| 9. Matriz, defectos, informe y código | **FAIL** de conclusión | Conteos y archivos coinciden, pero «sin defectos materiales abiertos» y la recomendación de aceptación quedan superados por esta contraprueba. No se modifica su registro histórico. |
| 10. Expected y elementos protegidos | PASS | Expected67.346 bytes/hash congelado; diez fuentes normativas y todos los tracked salvo compositor idénticos a la base. Evidencias previas intactas durante la auditoría. |

## Revisión de F01, F02 y seguridad

El [diff58→59](../../tests/fixtures/h5-012/audit-20261015/58-to59.diff) conserva la función anterior y cambia el catálogo de noches para calendario a `b04_current_nights`. Esa vista ya existía desde H4 y resuelve `modification_scope`, que selecciona la versión operacional de mayor revisión en Booking/scope autorizados. Timeline mantiene `b04_nights` y las versiones operacionales. F01 queda acreditado para fecha23/10 frente a historia20/10, hermana21/10 e independencia de Booking.

El [diff59→60](../../tests/fixtures/h5-012/audit-20261015/59-to60.diff) añade únicamente las lecturas de `b04_hold_revisions` y `b07_requirement_revisions`. Sus identidades y revisiones se filtran por `admin_scope` y Opportunity/Booking ya autorizados; calendario toma `max(revision)` por identidad y las demás consultas internas conservan historia. El compositor mantiene estado y procedencia, y requiere revisión para acreditar requisitos o bloqueos pendientes. F02 queda acreditado para vencimientos/revisiones y estados documentales Pendiente→Recibido sin elevarlos a Revisado.

La rama para terceros conserva byte a byte la lista comercial mínima de58. La reautorización final F1/F2, owner, search_path, revocación pública y grant al runtime también son idénticos. El SQL nuevo no añade roles, tablas, políticas, fuentes, reglas económicas ni DML de negocio. La vista de noches mantiene `security_invoker` y denegación de SELECT ordinario. Los cuerpos previos y actuales se contrastaron directamente, además de validar las evidencias de seguridad y migración.

V-MIG59→60 acredita conservación de datos de170 tablas y metadatos de284 funciones salvo el cuerpo objetivo; rollback, retry y reaplicación pasan. La transición58→59 tiene su prueba conservada. Seguridad60 verifica executor NOLOGIN/sin SUPERUSER/BYPASSRLS, ausencia de EXECUTE público, FORCE RLS, denegaciones ordinarias y advisors sin hallazgos. No hay evidencia de ampliación de permisos en el delta.

## H5-012-F03 — Cancelación de noche ausente de su proyección operacional

**Estado OPEN. Defecto material; bloquea la recomendación de cierre y publicación. Producto sin corregir por esta auditoría.**

Escenario sintético reproducido mediante los contratos existentes:

1. Crear Booking con una noche20/10/2026 y una hermana21/10/2026; consultar calendario.
2. Solicitar, evaluar, aprobar y aplicar `desired: {cancelled: true}` exclusivamente a la primera noche.
3. Corroborar en PostgreSQL la versión operacional2: `material.cancelled = true`, con `before_data.cancelled = false` y fecha20/10 preservada.
4. Releer calendario y timeline con autoridad legítima.

**Observado:** la entrada de la noche en calendario es exactamente igual antes/después, con `certainty: verified`, mismo fingerprint y fecha20/10. No expone revisión2 ni cancelación. Aparece una Task genérica de revisión de modificación, que no identifica la noche ni comunica su cancelación. El servicio conserva `cancelled: false`, correctamente para la cancelación parcial; no suple el estado de esa noche. Timeline sí conserva la versión cancelada y la fecha aceptada. La noche hermana permanece idéntica.

**Esperado normativo:** C01 exige que cada categoría pertinente derive del hecho canónico con estado/alcance/certeza, y C02 que un cambio canónico sea reconstruible en la proyección. No se impone ocultar la noche ni un formato visual: puede conservarse marcada como cancelada. Lo incompatible es una entrada operacional indistinguible de la previa y sin acceso al estado vigente dentro de ese calendario. La proyección histórica recuperable no resuelve la omisión de estado operacional.

**Causa comprobada:** `b04_current_nights` aplica `jsonb_populate_record(null::crm_private.b04_nights, ...)` y reemplaza solamente `night_date`; ese tipo no incluye `cancelled` ni revisión operacional ([vista histórica](../../supabase/migrations/20261005202444_h4_operational_modification.sql), línea290). La migración60 utiliza esa vista en línea81. El compositor, línea106, admite sus filas pero excluye `b04_operational_versions` de las entradas de calendario; las entradas con `modification_scope` se generan solo para servicios, no para noches. Así se conserva la corrección de fecha F01 sin representar otro cambio operacional válido del mismo scope.

La omisión del estado no fue introducida por F02; persistía en la composición previa y sigue presente en el candidato completo. Esta auditoría no atribuye falsamente a F01 una regresión que solo ha demostrado persistente en el candidato.

Prueba final nueva: **0/1 PASS, 1 FAIL**, exit1, sin skipped/cancelled, PostgreSQL17 y Storage oficial loopback. [Fuente exacta](../../tests/fixtures/h5-012/audit-20261015/probe-v2.ts.txt), [log íntegro](../../tests/fixtures/h5-012/audit-20261015/probe-v2.log), [recibo](../../tests/fixtures/h5-012/audit-20261015/probe-v2-receipt.json), [observación completa](../../tests/fixtures/h5-012/audit-20261015/night-cancellation-observation.json) y [ficha estructurada](../../tests/fixtures/h5-012/audit-20261015/defect-F03.json).

La primera sonda de auditoría comparó todo el calendario y pasó porque se añadió la Task genérica. Se conservan su [fuente](../../tests/fixtures/h5-012/audit-20261015/probe-v1.ts.txt), [log](../../tests/fixtures/h5-012/audit-20261015/probe.log) y [recibo](../../tests/fixtures/h5-012/audit-20261015/probe-receipt.json). Se corrigió exclusivamente esa aserción de la auditoría para comparar la noche afectada; no se cambió preparación, producto ni tests anteriores. El primer PASS no se presenta como acreditación de la cancelación. Ambas observaciones muestran el mismo defecto.

Reproducción: `python3 tests/fixtures/h5-012/audit-20261015/reproduce.py`. Verifica los 13 inputs del candidato, crea una copia nueva, ejecuta únicamente esta sonda y guarda salidas nuevas bajo `/tmp`. El código y las evidencias principales no se sobrescriben. El helper de reproducción se entrega sin ejecutar una tercera corrida redundante.

## Cobertura y coherencia documental

La [matriz de auditoría](audit-matrix-TSK-H5-012.md) contrasta los 41 casos y las 34 filas individualmente. Los 41 resultados originales aparecen una vez cada uno en `final-full.log` y el inventario de 419 archivos fuente coincide con el checkout actual. Los manifests de 12 inputs principales y 13 con suplemento también coinciden.

Además de C01/C02 afectados por F03, hay tres límites de evidencia:

- **C03:** saldo y días13/14 acreditados; el test no prepara ni proyecta la cifra final configurada a siete días que anuncia su título y exige su escenario.
- **C05:** se comprueban servicios nativos20/22, pero las cuatro referencias civil global/modalidad/servicio/noche se construyen dentro del test y se pasan a un helper. No se acredita con esas aserciones la asociación de cada referencia proyectada con su scope real ni la cifra final específica sin propagación. F01 sí acredita la fecha de una noche modificada.
- **C06:** el contrato válido se proyecta; el negativo usa una referencia null en un helper. No reproduce un registro sugerido/no verificado que compita con la referencia canónica válida.

Son lagunas de cobertura, no defectos económicos demostrados ni motivos para modificar D020. Se marcan BLOCKED parcial para su acreditación posterior. No se amplió la investigación ni se ejecutó una batería completa después de confirmar el defecto material: no habría subsanado esa omisión de escenarios.

Los estados históricos de PROJECT-STATUS/NEXT-STEPS/Tasks y los informes originales se mantienen íntegros. Su conservación está explicada en los documentos previos; no se confunde con una actualización de cierre. La conclusión READY FOR REVIEW anterior queda contradicha como recomendación de aceptación por el hallazgo posterior, no por falsificación de sus resultados.

## Evidencias revisadas y preservación

Se verificaron hashes de logs/manifests, comandos, resultados y correspondencia con las fuentes, sin ejecutar los scripts históricos que reescriben recibos. [Comprobaciones independientes](../../tests/fixtures/h5-012/audit-20261015/evidence-checks.json).

| Evidencia anterior comprobada | Resultado conservado |
|---|---|
| Regresión PostgreSQL completa | 2545/2545 PASS |
| Focal | 52/52 PASS, incluida una vez en2545 |
| Suplemento H04/S11 | 1/1 PASS separado |
| Unitarias | 197/197 PASS |
| Health independiente | 1/1 PASS separado |
| Typecheck, lint y build | PASS |
| Auditoría de producción | 0 vulnerabilidades registradas |
| V-MIG y seguridad60 | PASS en el alcance descrito |
| FAIL original F01 | Log y fuente original íntegros; correctivo posterior acreditado |
| FAIL original F02 | 0/2 PASS y 2 FAIL íntegros; aserciones idénticas al test posterior2/2 |
| Sonda nueva de esta auditoría | **0/1 PASS y 1 FAIL: F03** |

Los dos FAIL deliberados R56/R57 del producto histórico `15dbf11` permanecen dentro del log de regresión; la metaprueba que exige reproducirlos pasa. No son fallos actuales ni fueron ocultados. Los fallos de preparación de run1/run2/run3 se conservan y están separados del red F02.

Expected: **67.346 bytes**, SHA-256 `669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b`. Diez fuentes normativas coinciden con sus sellos y con la base publicada. Se contrastaron los 36.308 archivos del preflight anterior: únicamente las dos transiciones autorizadas ya declaradas (compositor y setup del verificador F01); sus fuentes anteriores siguen archivadas exactamente. Los 13 originales previos al correctivo F01 también se comprobaron, con el único cambio de setup previsto. Aserciones F01 sin modificaciones y test F02 exacto respecto a su manifest red.

La [preservación final de auditoría](../../tests/fixtures/h5-012/audit-20261015/preservation-audit.json) contrasta todos los 36.386 archivos presentes al inicio de esta auditoría. Producto, pruebas previas, contratos, expected, evidencias, sellos y guardas no se modificaron. No se ejecutó el auditor histórico V3 con referencias simuladas ni se reabrieron los antecedentes de dos logs ORIGINAL NO RECUPERADO, 69 diferencias históricas o R67/R030.

## Riesgos residuales, Git y recomendación

Riesgo material actual: quien consulte el calendario puede tratar como vigente una noche ya cancelada al no poder distinguirla por su entrada operacional. No se demostró pérdida histórica, cambio económico, envío, exposición a terceros ni ampliación de permisos en la reproducción.

Límites persistentes: revisión humana, cobertura parcial C03/C05/C06, DM-PENDING-005 y capacidades Hosted/Production/conectores reales fuera de este alcance. Los resultados sintéticos no acreditan esos entornos ni operaciones.

HEAD/main/origin/main permanecen en la base; índice vacío, sin commit/push/deploy. El candidato conserva sus 147 archivos de delta; los archivos nuevos de auditoría se enumeran separadamente en su inventario final. No se cambió el estado formal de la tarea ni se modificaron documentos protegidos para simular un cierre.

**Recomendación: rechazar por ahora el cierre y publicación del candidato.** Corregir posteriormente F03 mediante autorización de implementación, acreditar el escenario de noche cancelada y completar las tres lagunas de cobertura; después revalidar las pruebas afectadas, regresiones pertinentes y preservación sobre el nuevo delta, y someterlo a revisión. Esta auditoría no prescribe cambiar contratos, la vista histórica ni expected; la solución deberá conservarlos.

**Punto de parada: dictamen FAIL emitido. H5-012 no se declara COMPLETED. No se inicia ni prepara H5-013.**
