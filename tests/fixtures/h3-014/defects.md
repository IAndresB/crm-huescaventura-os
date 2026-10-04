# Defectos H3-014 — originales conservados

Expected independiente 14a1aa8 permanece intacto. Ningún ajuste del oráculo para acomodar producto. Fixtures sintéticos; correcciones dentro H3-013/014.

|ID|Fuente|FAIL original / reproducer mínimo|Causa y corrección|Verificación|Estado|
|---|---|---|---|---|---|
|H3-014-F01|F1/Plan C03/P20|F01-original-focal.log; postgres-h3-013.test.ts|JSON completo >16KiB por campo F1. Fragmentos UTF-8 completos firmados; límites originales por campo/total intactos; ensamblado validado SQL.|Focal completo y matriz|CLOSED|
|H3-014-F02|B07/ECON013/G2|F02-original-focal.log; fixture proof|Fixture usaba enlace Booking donde payment_evidence exige other/economyId. Corregido exclusivamente enlace sintético; autoridad no relajada.|Focal+R004/R014|CLOSED|
|H3-014-F03|C03/V-DAT|F03-original-focal.log; aprobación de regla|Precedencia SQL JSONB ambigua al excluir approvalEvidenceId. Paréntesis explícitos; hash material exacto.|Focal+R001/R004|CLOSED|
|H3-014-F04|V-EVI/H1 núcleo monetario|F04-original-typecheck.log y F04-verifier-typecheck.log|Verificador inicial usaba firma H1/orden de Allocation y ruta fixture incorrectas. Tipos/firma/rutas corregidos, literales económicos intactos.|Typecheck+R020/R023/R024/R070/R080|CLOSED|
|H3-014-F05|AC044/revisión E2|F05-F07-original-matrix.log R020|Fixture preparaba segunda Allocation antes del primer COMMIT; revisión obsoleta correctamente rechazada. Segundo comando sintético obtiene revisión actual.|R020|CLOSED|
|H3-014-F06|CONC/EVI|F05-F07-original-matrix.log R079|Verificador compartía referencia de input entre dos comandos; mutación invalidaba la primera evidencia. Copia independiente antes de carrera; matriz literal intacta.|R079|CLOSED|
|H3-014-F07|V-MIG|F05-F07-original-matrix.log R092 + F07-original-server.log|Nombre temporal demasiado largo para socket Unix PostgreSQL103bytes. Etiqueta corta del ensayo; infraestructura histórica intacta.|R092|CLOSED|
|H3-014-F08|PROMO001002/D019/FORB10/ECON012|F08-original-reproducer.log; postgres-h3-014-defects.test.ts|Dos scopes de Booking podían aplicar gratuidad dos veces. Serialización Booking y revisión de aplicación vigente en otras raíces; nuevas versiones en la misma raíz conservan historia.|Reproducer F08|CLOSED|
|H3-014-F09|IDEMP/E2/HIST002|F09-original-reproducer.log; postgres-h3-014-defects.test.ts|Nueva clave técnica con mismo material creaba revisión material duplicada. Reutiliza snapshot equivalente autorizado y registra solo resultado técnico durable para replay.|Reproducer F09|CLOSED|

|H3-014-F10|F1 límites originales/V-EVI|F10-original-extended.log y F10-second-extended.log; Unicode bounded test|Fixture extendido de80 repeticiones superaba64KiB y esperaba admisión incorrecta. Conserva ese input como rechazo sin escritura y comprueba texto Unicode dentro del límite. Fuentes autoritativas viajan una vez; SQL restaura idéntica proyección histórica sin recalcular dinero ni ampliar F1.|Ensayo Unicode y matriz101/101|CLOSED|
|H3-014-F11|V-MIG/preservación histórica|F11-original-full-postgres.log R095; reproducer frontera|Verificador H3-012 contaba toda migración futura como histórica. Congela su límite hasta providerPaymentMigration:36; H3-014 comprueba37. Expected/producto/migraciones H3-012 intactos.|R095 histórico + reproducer frontera; regresión final pendiente|CLOSED|

Cero defectos materiales abiertos. Los FAIL originales no se sobrescriben. F02/F04/F05/F06/F07/F10/F11 son defectos de verificador/fixture; F01/F03/F08/F09 de implementación. Resultado focal+matriz+reproducers extendidos: pendiente de regresión final, cero FAIL/skipped/cancelled.
