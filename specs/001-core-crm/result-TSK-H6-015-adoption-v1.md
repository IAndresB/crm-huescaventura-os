# H6-015 — Acta propuesta de adopción y resolución de pendientes

2026-10-22. **CANDIDATO DOCUMENTAL PARA EL DIRECTOR. H6-015 IN PROGRESS. No acta de cierre.**

El [expediente](adoption-TSK-H6-015-PG17-v1.md) presenta las decisiones N01/N02 y el [sucesor r4 propuesto](procedure-TSK-H6-014-r4-proposed.md), con trazabilidad exacta y conservación del r3 histórico. La aceptación técnica PG17 v2 no se convierte en aprobación normativa por este documento.

## Resultados del bloque

| Comprobación | Resultado y límite |
|---|---|
| Expected previo | Congelado con fuentes y SHA antes de ejecutar el observado. |
| Verificadores de aplicación | 12/12 PASS; [resultado focal](../../tests/fixtures/h6-adoption-reconciliation/runs/2026-10-22T15-26-11.170Z/report.json). Ninguna ejecución SQL, Auth o Storage nueva. |
| C04/B07 y B08/HA | Lectura contractual: conservar evidencia/revisión es legítimo; resultado B08 exige intento/reserva y prueba correspondiente. Integración persistente C04→B07 no ejercitada en este bloque. |
| t1 ausente | Evidencia histórica preservada, no intento ni resultado reconstruido. Resultado B08 pendiente. |
| Efecto incierto | Se mantiene incierto y suspendido; no nuevo contacto ni resultado supuesto. |
| r4 | Diff y lista de cambios reconstruyen exactamente el sucesor. No se altera normativa vigente. |
| Regresión pertinente | TypeScript sin emisión, límites de importación y git diff --check PASS. No se repite batería completa histórica. |
| Histórico | 4.254 payloads y 6 manifiestos/sellos heredados íntegros: 4.260 archivos. Las seis diferencias tracked heredadas frente a base son idénticas al predecesor, sin cambios nuevos de producto. |
| Repositorio original | 14.954 untracked, mismo hash del status NUL histórico; sin staging, commit ni modificación ajena. |
| Custodia | 47.276 archivos / 1.801.849.702 bytes rehasheados contra inventario; propietario comprobado, archivos 0600, directorios 0700, cero ACL allow. Sin borrar originales ni exportar secretos. |

[Integridad final](../../tests/fixtures/h6-adoption-reconciliation/final-integrity-v1.json). [Custodia comprobada](../../tests/fixtures/h6-adoption-reconciliation/custody-recheck-v1.json).

## Incidencias y conservación

Se conserva un FAIL instrumental: comparación de status delimitado por LF con el hash histórico delimitado por NUL. Corregido el formato de captura, el hash histórico coincide exactamente; no se alteraron archivos para lograrlo. La revisión independiente señaló enlace, prefijo de derivación documental y precisión ACL; corregidos antes del sello. [Registro](../../tests/fixtures/h6-adoption-reconciliation/findings-v1.json). Los FAIL previos de restauración y las evidencias v2 se conservan sin reescritura.

## Aceptación y continuidad

AC-073 conserva cobertura local parcial con incidencias protegidas, no conciliación integral. AC-074 conserva cobertura local v2 aceptada, sin nueva prueba Storage. Las 12 comprobaciones focales no sustituyen los criterios completos ni las asignaciones normativas de Tasks.

Decisiones reservadas: adopción N01/N02 y alineaciones E01/E02 de r4; si se desea aplicar en B08 un resultado cuyo intento se perdió, decisión separada N03 y especificación antes de implementación. Para documentar evidencia/revisión vigente no hace falta N03, pero su integración persistente y autorización efectiva deberán verificarse antes de afirmar ese registro realizado. La evidencia adicional del incierto debe proceder de fuente independiente, sin repetir el efecto.

El siguiente bloque dependiente es la revisión del director de este expediente. Una futura composición focal C04/B07 puede probarse localmente conservando B08/HA y finanzas, pero no elimina por sí sola las decisiones anteriores. H6-015 no está lista para aceptación integral ni reentrada. ARCH-PENDING-002 y DM-PENDING-005 OPEN.

## Inventario de versionado y custodia

El manifiesto de este bloque enumera exclusivamente los archivos nuevos de documentación, instrumento y evidencia redactada. Ese inventario es candidato de versionado, no staging ni autorización de publicación. Los 4.260 archivos heredados se referencian por sus manifiestos anteriores y no se vuelven a incorporar como delta.

Fuera de Git y Drive: node_modules y su enlace, clústeres, dumps, globals originales/derivados, configuración privada, factores y credenciales sintéticas, claves F1/F2, tokens, testigo privado y logs crudos. Custodia local histórica intacta. No se crean archivos privados nuevos en este bloque.

La auditoría independiente permanece en su propio worktree y manifiesto; se referencia desde el sello del ejecutor. Ninguna evidencia del auditor se mezcla con el observado del ejecutor.

**STOP: no adopción definitiva, ampliación contractual, S11, cierre, commit, push, publicación, Drive ni despliegue.**
