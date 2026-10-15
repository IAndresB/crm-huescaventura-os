# TSK-H5-013 — Candidato técnico local/aislado

2026-10-15. **Implementación e integración verificadas; pendiente de aceptación y publicación.** H5 global IN PROGRESS. H5-014 no ejecutada; H5-015 y posteriores no iniciadas. Sin commits, push, despliegue, Hosted/Production ni datos reales.

## Identificación y precondiciones

Base publicada y limpia comprobada tras fetch: `HEAD = main = origin/main = b8f4fc9db033de54bcdc01c5f7554647d02f11aa`, divergencia0/0. Se contrastó el cierre autorizado H5-012, incluidas sus limitaciones. Dependencias H4-024/H4-023/H4-018/H3-012/H4-004/H4-002 COMPLETED en sus alcances locales según sus tarjetas y evidencias actuales. No se reutiliza la excepción de formato H5-012.

Identificador del producto probado: SHA256 **`bf47eaa914f1093a2403a29db4c28496dd9b1023ce8713b904f2d05b8565a32a`**, calculado sobre el mapa canónico ordenado de rutas/hashes de los 173 inputs de producto, migraciones, scripts y configuración. Base Git más trabajo local sin commit; no se atribuyen las pruebas al SHA base solo.

Manifiesto final de producto y verificadores: SHA256 **`7e5ae6a7df16d71ac7e9a8702bec8e51c04d7d9f5cb6225a076fb1c283005f06`**, [inputs finales](../../tests/fixtures/h5-013/strict-candidate-inputs.json). Oráculo local anterior al producto: 10865 bytes, SHA256 `d4437ce800a9abd9a9ac41586baece3996ff4d8831b996b6ad1b720d45b8da64`, 18 filas normativas literales y22 casos conceptuales; intacto. No implica aprobación del oráculo ni comprobación independiente H5-014.

## Comportamiento y contratos

Closure Assessment permanece dentro de Booking: dos tablas append-only de operación/evaluación, identificadas por Booking/revisión y dimensión; ninguna entidad comercial paralela ni sustitución de estados. `open` registra Pendiente exclusivamente en la dimensión pedida; `evaluate` exige apertura previa y evalúa criterios/evidencias actuales. Cada criterio conserva conclusión, razón y hechos; No aplica requiere justificación explícita y suficiencia canónica. Las condiciones finales y la dependencia documental por expediente son actos explícitos del Administrador, vinculados a evidencia B07 y al material vigente; no se deducen por palabras del texto libre.

Se reutilizan realidad/cancelación B04/B06, Requirements e Incidents B07, fund_coverage y suplido/provider_payment_documentary B05, economías propias, Refund y fianza. Un servicio externo sin definición/documentación, una economía propia sin honorarios/costes reales, Refund/fianza pendientes o una incidencia económica bloquean la economía dependiente. Las necesidades documentales clasificadas bloquean solo sus dimensiones. Un requisito nuevo sin clasificación obliga a revisar su aplicabilidad, sin inventar qué dimensión satisface. Los criterios ausentes no se resuelven por omisión.

Ganada/Finalizada y cierre de Task/Incident no crean ni resuelven evaluaciones. La crítica operativa admite únicamente la justificación canónica autorizada; nunca dispensa prestaciones, facturas, fondos, devoluciones o incidencias económicas. Tararí conserva naturaleza interna y no genera Provider, Suplido ni factura externa.

La lectura canónica de Booking incluye `closureAssessments`. La lectura específica expone `status` histórico, `currentStatus`, `applicable`, fundamento histórico y actual e historial. Una variación material impide presentar la resolución histórica como vigente; no se escribe una reapertura ni se implementa la condición conjunta. Una operación repetida devuelve su recibo histórico idempotente; la vigencia se consulta mediante la lectura actual. Un nuevo comando revalida material y revisión bajo la raíz Booking existente. Reabrir una dimensión ya resuelta y cerrar conjuntamente siguen reservados a H5-015.

T10 reutiliza `booking-preparation` como raíz compartida. Se añaden triggers únicamente a fuentes antes no cubiertas: factura, suplido, economía propia y determinación/aplicación de cancelación. El evaluador no adquiere raíces privadas de escritores después de esa raíz, evitando inversión de locks. F1/F2 se comprueban antes y al final; historia/evaluación/resultado se confirman juntos o revierten, incluso al fallar COMMIT. Sin efectos bancarios, fiscales ni externos.

## Verificación ejecutada

| Comprobación | Resultado | Recibo |
|---|---|---|
| PostgreSQL completo | **2628/2628 PASS**: 2600 históricos +28 H5-013 incluidos una vez; cero fail/skipped/cancelled | [postgres.json](../../tests/fixtures/h5-013/postgres.json) |
| Focal final estricta | **28/28 PASS**, incluidos factura corregida y códigos negativos exactos; no se suma de nuevo al total | [strict-focal.json](../../tests/fixtures/h5-013/strict-focal.json) |
| Unitarias | **197/197 PASS** | [unit.json](../../tests/fixtures/h5-013/unit.json) |
| Health independiente | **1/1 PASS**, separado del producto y de PostgreSQL funcional | [health.json](../../tests/fixtures/h5-013/health.json) |
| V-MIG / V-DAT | Fresh62 y upgrade61→62 poblado; rollback/reintento;170 tablas previas preservadas;283 funciones previas sin cambios y únicamente el cuerpo de booking_read adaptado conservando atributos | Log focal y [test V-MIG](../../tests/integration/postgres-h5-013-migration.test.ts) |
| Permisos / advisors | RLS/FORCE RLS, ningún CRUD directo de runtime/HA/anon/authenticated, funciones sin PUBLIC EXECUTE, executor NOLOGIN/no BYPASSRLS; advisors loopback `results=[]` | Log focal final |
| Concurrencia | Cinco ensayos reales: Incident/evaluación e Invoice/evaluación en ambos órdenes, más replay simultáneo; sesiones separadas, locks observados, Booking independiente | [pruebas concurrentes](../../tests/integration/postgres-h5-013-concurrency.test.ts) |
| Atomicidad | Fallo de inserción en cada tabla y fallo diferido en COMMIT; estado íntegro, reintento y replay únicos | Log focal final |
| Frozen install / lint / typecheck / build | **PASS** | install.json, lint.json, strict-typecheck.json, strict-build.json |
| Auditoría dependencias producción | **PASS**, cero vulnerabilidades reportadas | [audit.json](../../tests/fixtures/h5-013/audit.json) |
| Preservación y diff | **PASS**: 36.514 archivos previos comprobados; 36.510 idénticos y cuatro cambios autorizados de configuración/coordinación; cero originales/expected alterados. Control completo en índice temporal exit0, sin excepciones. | preservation.json y diff-check.json |
| H5-014 / H5-015 / Hosted / Production | **NOT RUN** | Límites de esta misión |

Las reproducciones históricas deliberadamente fallidas que aparecen dentro del log integral conservan su contexto y no son FAIL actuales del resumen2628. Los FAIL de desarrollo nuevos tampoco se reclasifican: se conservan gzip, incluido el primer build fallido por symlink y la focal de factura cuyo pago no tenía aprobación previa. [Defectos y soluciones](defects-TSK-H5-013.md).

## Correspondencia exacta entre ejecuciones

La regresión integral, unitarias, lint, instalación y health usan el manifiesto inicial `f457d2c673c5fb333cb4cae361919d476faf2b5a23d00b2cdf48b36933721891`. Después se refuerzan exclusivamente dos archivos nuevos de verificación: la prueba principal y su generador de evidencia. Se exige código de rechazo preciso y se amplía la prueba de factura al ciclo vigente→corregida. No cambia ni un byte de los 173 inputs de producto, migraciones, dependencias o configuración. La focal final28/28 y el typecheck se ejecutan sobre el manifiesto final `7e5ae6a7df16d71ac7e9a8702bec8e51c04d7d9f5cb6225a076fb1c283005f06`. El build PASS corresponde al mismo producto, antes de ese último ajuste exclusivo de pruebas.

La [transición de verificadores](../../tests/fixtures/h5-013/verification-transition.json) conserva ambos hashes por archivo; sus versiones iniciales están archivadas gzip. No se repite la regresión histórica porque el producto y sus verificadores históricos no han cambiado; los dos verificadores nuevos afectados sí se reejecutan completos. No se presenta el manifiesto inicial como si fuera el final.

## Reproducción y entrega

Entorno: Node24.21.0, pnpm11.19.0, PostgreSQL17.11/Postgres.app, CLI Supabase2.119.0 y Storage oficial del runner en loopback. Solo sintéticos. [Entorno](../../tests/fixtures/h5-013/environment.json).

```sh
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node scripts/test-postgres.mjs postgres-h5-013.test.ts postgres-h5-013-concurrency.test.ts postgres-h5-013-migration.test.ts
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm test:postgres
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm audit --prod
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test tests/operations/supabase-health.test.mjs
```

Las pruebas históricas pueden regenerar archivos de evidencia: reproducir la batería completa en una copia aislada, con los inputs sellados y dependencias físicas instaladas mediante frozen lockfile. La ejecución realizada preservó todos los originales del checkout compartido. Los recibos incluyen comando, directorio, duración, salida y hashes; los logs gzip se descomprimen sin pérdida.

Cambios ejecutables: dominio `closure-assessment.ts`, adapter `h5-closure-adapter.ts`, migración62 `20261015204955_h5_booking_closure_assessments.sql`, seis archivos nuevos de integración/support y exclusión de archivos archivados en tsconfig. Además, oráculo local, esta evidencia/matriz/defectos, coordinación y recibos nuevos. [Inventario de entrega](../../tests/fixtures/h5-013/inventory.json).

Riesgos/límites: no se acredita integración Hosted/Production, interfaz, datos reales ni rendimiento de grandes históricos. Las decisiones manuales de suficiencia y aplicabilidad requieren las evidencias del expediente; no son inferencias automáticas. Cierre conjunto y reapertura persistida siguen fuera de alcance. No se solicita ninguna excepción nueva de preservación/formato.

**Recomendación:** candidato preparado para iniciar la comprobación independiente H5-014 sobre estos inputs, bajo autorización correspondiente. H5-013 continúa IN PROGRESS, pendiente de aceptación/publicación; no se ha iniciado H5-014. STOP tras esta entrega.
