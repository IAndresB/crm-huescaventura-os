# Cierre consolidado H6-006 / H6-008 y siguiente puerta H6-015

22 de octubre de 2026. **H6-006 y H6-008 COMPLETED exclusivamente local/aislado. H6-015 NOT STARTED.**

## Decisión y comprobación

El director confirma H6-006 y acepta técnicamente H6-008 R2, autorizando cerrar esta última si mantiene íntegros candidato y evidencia. La [verificación](../../tests/fixtures/h6-local-closure/verification.json) es PASS y el [acta H6-008](acceptance-TSK-H6-008-local.md) registra el cierre. El [acta H6-006](acceptance-TSK-H6-006-local.md) permanece sin cambios.

Se verificaron los **4.055 archivos** del manifiesto R2 SHA-256 `23419baa5d5ddb985ce4ac42d1d408d510ffad89959b1154fb0e6f147e30f14f`, el checkpoint ejecutable, las diez fuentes normativas, las 23 asignaciones, expected, FAIL y revisiones independientes. F01 y M02 siguen cerrados; no hubo drift ni discrepancia material. Se contrastaron recibos y logs originales; **no se repitieron las pruebas completas**.

Los resultados conservados son 62 PASS H6-006, diez contrapruebas independientes H6-006, 17 integrados Auth, tres F01, siete M02, 32 ejecuciones propias del revisor Auth, 60 PASS + un skip histórico en regresión H6-008/H0/H1, 210 unitarias y lint/typecheck/build correctos. Los 32 del revisor incluyen reproducciones, no 32 escenarios nuevos. M02 acredita 105 entradas Core y 1.260 denegaciones; los cinco métodos de sesión y la lectura de metadatos completan el mapa de 111.

Auth y Core no se confunden: firma JWT válida no equivale a sesión vigente; se verifica eliminación en proveedor, rechazo de `/user`/refresh y cierre Core durable, incluido Auth503 sin éxito ficticio. Tampoco se confunde access_generation con las generaciones criptográficas F1/F2.

## Dependencias y procedimiento H6-015

| Dependencia directa | Estado y evidencia |
|---|---|
| H5-019 | COMPLETED local/aislado; aceptación y cierre en la base aprobada. |
| H6-006 | COMPLETED local/aislado; acta previa y confirmación del director. |
| H6-008 | COMPLETED local/aislado; condición de integridad PASS y acta de este paquete. |
| H6-014 | COMPLETED local/aislado como preparación r3; 20 payloads y manifiesto exactos. La publicación previa comunicada no se reejecuta ni se confunde con restauración. |

Se satisfacen las cuatro dependencias directas en ese alcance. No se añaden H6-009/010/011. Falta la autorización independiente para ejecutar H6-015; ninguna restauración ni recurso operativo se ha iniciado.

R3 conserva coherencia para Core, Storage, cuarentena y conciliación. Su ejemplo S07 simulado debe sustituirse en el futuro harness por Auth real R2, manteniendo generación anterior al TOTP. Hace falta la variante técnica Auth, comparación completa de su catálogo y adaptar el transporte del fixture loopback a sockets privados r3. El subcomando Auth serve evita la migración automática del comando raíz, pero sus escritores internos requieren control. Son puntos de preparación y preflight futuro explícitos; no se certifica una restauración que todavía no existe. R3 y su verificador se conservan sin cambios.

El [candidato documental v1](execution-candidate-TSK-H6-015-v1.md) concreta topología, corte t0, Auth/testigo/doble t1 fuera del rollback, variantes de recuperación, rotación de F1/F2, revocación coordinada, integridad/objetos/permisos, conciliación, medición y contrapruebas. También identifica la puerta S11: si no hay autorización de reentrada, el informe puede medir fases anteriores, pero no declarar completada la cadena ni forzar explicit_reentry=true.

## Paquete y custodia

Se añaden únicamente documentos y registros de cierre. Los 4.055 archivos R2 y todos los candidatos/revisiones históricos conservan sus bytes; las dos modificaciones de código versionado son las ya auditadas, sin nuevas ediciones. La base sigue `971c55d5ce5770c71284d106d3c0deecca9514b5`, detached HEAD en el worktree de entrega y sin staging.

La [propuesta de publicación](publication-H6-006-H6-008.md) y su [inventario exacto](../../tests/fixtures/h6-local-closure/publication-inventory.json) separan payload, envolturas y exclusiones. Los 14.954 archivos históricos del checkout original quedan fuera. Se preparan siete sobres locales separados y un recibo exterior en `/Users/andres/Developer/crm-huescaventura-os-custody-h6-006-h6-008-20261022`, sin subirlos.

Se verificó en lectura la estructura empresarial **info@huescaventura.com → HUESCAVENTURA/07_TECNOLOGIA_Y_SISTEMAS/CRM_HUESCAVENTURA_OS/02_AUDITORIAS**. La futura custodia propone una sola subcarpeta consolidada de tarea dentro de ese padre. No hay carpetas nuevas ni publicaciones en Drive; no se afirma permiso de escritura comprobado.

## Riesgos y decisión siguiente

ARCH-PENDING-002 y DM-PENDING-005 permanecen OPEN. No se fijan RPO/RTO/coste productivos, retención ni tratamiento de datos reales. Auth recuperado puede contener sesiones/tokens/factores anteriores: debe permanecer en cuarentena hasta su comparación, revocación y readback. Core y Auth no constituyen una transacción distribuida. Los backups y claves sintéticas también son sensibles y quedarán fuera de Git/Drive.

Propuesta: autorizar posteriormente la implementación y ejecución **exclusivamente sintética** del candidato H6-015 v1, con recursos exclusivos, copias protegidas, renovación de autoridades sintéticas, controles independientes y expected congelados. La autorización debe distinguir esa ejecución de S11/reentrada y de publicación Git/Drive. No se necesita una decisión normativa nueva para cerrar H6-008; una variante técnica incompatible o un contrato ausente bloquearía solo la parte futura afectada.

**STOP: cierre local y preparación documental terminados; no ejecutar H6-015 ni publicar resultados.**
