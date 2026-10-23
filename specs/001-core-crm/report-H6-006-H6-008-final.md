# Informe consolidado — H6-006 / H6-008 / preparación H6-015

Fecha local: 2026-10-22. Base verificada `971c55d5ce5770c71284d106d3c0deecca9514b5`. **H6-006 COMPLETED exclusivamente local/aislado. H6-008 candidato de aceptación y cierre local, con dictamen técnico e independiente PASS. H6-015 NOT STARTED.**

Este informe establece el estado final de esta continuación y sucede a los estados temporales de los informes anteriores, que se conservan. El registro operativo está en [final-operational-status.json](../../tests/fixtures/h6-auth-corrective/final-operational-status.json). No se han modificado las filas normativas congeladas de Tasks.

## 1. Dictamen H6-006

Se aplica la autorización condicionada expresa del director y se registra el [acta de aceptación y cierre local](acceptance-TSK-H6-006-local.md). Las once asignaciones normativas quedan contrastadas, sin requisito material local pendiente. El [revisor independiente](independent-review-TSK-H6-006.md), en contexto y worktree separados, reprodujo las 62 pruebas y realizó diez contrapruebas propias. Esta revisión es adicional a la auditoría instrumental previa.

La última regresión de 62/62 sobre el candidato Auth R2 vuelve a acreditar caída real del ejecutor, efecto simulado único, reserva e incertidumbre, conciliación, fencing, concurrencia y respuestas tardías. El proveedor externo de negocio es un doble durable autorizado: no se acredita envío o cobro real. Los expected y los FAIL históricos permanecen exactos.

## 2. Implementación H6-008 y matriz de aceptación

Se añaden proveedor Supabase Auth local, gestor de sesiones humanas y frontera HTTP. Se reutilizan adaptadores y contratos existentes; el cambio mínimo sobre producto versionado añade lectura de generación y su contraste al establecer sesión, más su exposición en la composición. No cambia SQL, normativa ni cadena de 68 migraciones Core.

Password, TOTP, refresh, logout y revocación usan funcionalidad auténtica de Supabase Auth v2.197.0. PostgreSQL y Storage también son reales locales. Las credenciales, identidades y datos son sintéticos. La frontera HTTP verifica identidad y autoridad efectiva; el cliente no selecciona una sesión Core ni importa un JWT como nueva autoridad.

La [matriz de 23 asignaciones](matrix-TSK-H6-008-r2.json) y el [mapa independiente de 111 entradas](../../tests/fixtures/h6-auth-independent-r2-custody/tests/fixtures/h6-auth-independent-review-r2/surface-coverage-r2.md) documentan la cobertura. Las 16 superficies iniciales se amplían a 105 entradas Core, cinco operaciones de ciclo de sesión y una lectura de metadatos. Cada entrada Core tiene control positivo y seis condiciones de denegación directa y HTTP: 1.260 rechazos sin cambios en tablas Core ni llamadas Storage durante la denegación. La cobertura es de admisión por método; no sustituye todas las pruebas funcionales de sus ramas.

El [dictamen independiente R2](../../tests/fixtures/h6-auth-independent-r2-custody/specs/001-core-crm/independent-review-TSK-H6-008-r2.md) es favorable, tras 32 casos propios sin fallos ni saltos. El [candidato de aceptación y cierre](candidate-acceptance-TSK-H6-008-local.md) está listo. Se mantiene pendiente su aceptación formal y no se registra H6-008 COMPLETED.

## 3. Fallos y correcciones conservados

| Hallazgo | Corrección y prueba |
|---|---|
| F01: login ya verificado podía adoptar una generación posterior a revoke-all cuando fallaba el cierre Auth | Captura de generación después de password y antes de TOTP; comparación transaccional y guardia SQL bajo bloqueo. La contraprueba original pasa de HTTP200 a 403; otra carrera con F2 ya firmada obtiene SQL42501 sin sesión nueva. |
| M02: 16 superficies no demostraban cobertura de todo Core | Inventario independiente, 105 controles positivos útiles y 630 rechazos directos + 630 HTTP. Se revisan guardias y delegaciones; las dos funciones Work tienen su límite de instrumentación explícito. |
| Fallos ordinarios de infraestructura y fixtures | Configuración del proveedor local y roles, entradas de negocio válidas, reloj/fixture temporal coherente e instrumentación de delegaciones corregidas. Todos los resultados FAIL permanecen en los historiales. |

R1 conserva su dictamen adverso; no se transforma en PASS por la corrección posterior. El expected de la contraprueba independiente original tampoco se modifica. El código R2 se congeló antes de la reproducción independiente y de las regresiones finales.

## 4. Pruebas y procedencia

| Grupo | Resultado final | Procedencia |
|---|---|---|
| H6-006 | 62 PASS | Principal y reproducción independiente; última regresión sobre R2 |
| H6-006 contrapruebas adicionales | 10 PASS | Revisor independiente |
| Auth/HTTP/PostgreSQL/Storage | 17 PASS | Principal; reproducidas por revisor |
| F01 | 3 PASS | Principal; reproducidas por revisor |
| M02 | 7 PASS; 105 positivos y 1.260 denegaciones | Principal; reproducidas por revisor |
| Contrapruebas Auth I01–I05 R2 | 5 PASS | Revisor independiente |
| Regresión histórica H6-008/H0/H1 | 60 PASS, 0 FAIL, 1 skip histórico S10 | Principal; recibos/logs/hashes contrastados por revisor |
| Unitarias | 210 PASS | Principal; recibo/log contrastado |
| Lint / typecheck / build | exit 0 / 0 / 0 | Principal; recibos contrastados |

Las reproducciones no se suman como escenarios diferentes. El skip S10 permanece en el test antiguo; la carencia Auth que señalaba se acredita en la suite nueva real de 17 pruebas sin saltos. Los detalles, directorios de ejecución y comandos de reproducción están en [evidence-TSK-H6-008-r2.md](evidence-TSK-H6-008-r2.md).

## 5. Identidad Git y custodia

Worktree de entrega: `/Users/andres/.codex/worktrees/h6-auth-corrective/crm-huescaventura-os`, HEAD detached en la base indicada; árbol base `8b43af1acc0d4be40321de1c5bc303129cdb47cd`. Hay dos archivos versionados modificados: `src/infrastructure/postgres/h0-005-adapter.ts` y `src/server/human-postgres-composition.ts`. El resto del candidato se conserva sin seguimiento hasta una autorización de publicación exacta. No hay staging, commit ni push.

- Original: inventario histórico de 14.954 archivos sin seguimiento y estado Git exacto, SHA-256 `ee2194dd057f7a860d55418c8c026a11a311590ced315768f4b4f16335c7c127`.
- Candidato previo: 291 payloads exactos; manifiesto `cea8c91910000d89a075401cbed60322ff71abccf5f7ba39569d188956bcd627`.
- Integración R1: 1.570 payloads preservados; manifiesto `9d64f3ca2f372706cbd7ad35fa6b5cefd0ae75c50d0d898ff8d20a5cc2cac478`.
- Revisión adversa R1: 323 payloads exactos; manifiesto `6429e85b95a1db241cce9d2dbf073dd0f2dea26166f17df7edf5b5f32078e066`.
- Checkpoint ejecutable R2: 13 archivos exactos; manifiesto `c71b34b195cb922b2b7e3945f176b78cb279063f2b0fbe50c5da08dceb02ee9e`.
- Revisión final independiente R2: 564 payloads exactos, copiados bajo `tests/fixtures/h6-auth-independent-r2-custody`; manifiesto `63fb482b12b44672db1abd948970a7ae2ec682788b9e02f3a59822baad086af9`.

La entrega completa se identifica en [delivery-manifest-r2.json](../../tests/fixtures/h6-auth-corrective/delivery-manifest-r2.json), incluyendo los dos archivos versionados modificados y excluyendo únicamente el propio manifiesto. Los manifiestos anteriores conservan su raíz de referencia original; no deben aplicarse a código sustituido de R2 como si describieran esa nueva versión. Las fuentes aprobadas y H6-014 r3 permanecen intactas. Los servicios de ensayo propios se han detenido; se conservan cachés públicas y evidencias.

## 6. H6-015, riesgos y siguiente bloque

El [expediente documental original](preparation-TSK-H6-015.md) conserva la definición literal, las 15 asignaciones, diez escenarios con expected propuestos y el diseño por bloques. La [adenda Auth](preparation-TSK-H6-015-addendum-auth.md) añade las carreras F01, las barreras separadas Auth/Core/Storage, el inventario ampliado y la protección de material de autoridad. No contiene observados de restauración: **H6-015 NOT STARTED, sin restauraciones ni recursos operativos preparados**.

Dependencias expresas: H5-019 aceptada local; H6-014 r3 aceptada y publicada; H6-006 cerrada local en este bloque; H6-008 con candidato PASS pendiente de aceptación formal. No se añaden H6-009/010/011 como dependencias directas. No queda un fallo técnico ordinario conocido abierto dentro del alcance revisado.

ARCH-PENDING-002 sigue OPEN: no hay decisión productiva de RPO/RTO/coste. DM-PENDING-005 sigue OPEN: no se fija retención ni tratamiento de datos reales. PLAN-PENDING-003 conserva sus condiciones de dispositivos físicos, recuperación real y acceso productivo. Los JWT pueden conservar firma válida tras logout; la denegación se prueba por verificación online y autoridad Core, sin afirmar invalidación criptográfica instantánea. Los handles son memoria del servidor; no se acredita continuidad multinodo ni UI completa. El control de comunicaciones es la configuración local de las rutas ensayadas, no una certificación universal del tráfico del sistema.

La propuesta concreta es aceptar H6-008 en alcance local mediante el candidato citado y, después, autorizar por separado un ensayo H6-015 exclusivamente sintético y en cuarentena. Antes de ejecutarlo: confirmar las cuatro dependencias y el candidato exacto, congelar expected e inventario, revisar cobertura Auth/roles/Storage/testigos externos y fijar controles por bloque. La restauración, reentrada y publicación no se deducen de esta entrega. Las cuentas/datos/backups/credenciales reales, autoridades reales, Hosted/Production, efectos externos, despliegue, commit, push y Drive continúan reservados.

**STOP: concluye el alcance autorizado de esta continuación.**
