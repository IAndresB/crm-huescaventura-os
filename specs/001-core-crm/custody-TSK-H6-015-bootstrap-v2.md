# H6-015 — Inventario de versionado y custodia de la variante

Estado: preparación local; **sin staging, commit, push, publicación o Drive**. H6-015 IN PROGRESS. Candidatos históricos separados.

## Material propuesto para versionado posterior

El inventario exacto por archivo, tamaño y SHA-256 se encuentra en [delivery-manifest-v2.json](../../tests/fixtures/h6-bootstrap-variant/delivery-manifest-v2.json). Su [sello](../../tests/fixtures/h6-bootstrap-variant/delivery-seal-v2.json) se conserva separado para evitar auto-referencia. No se propone `git add .` ni incorporación masiva del repositorio original.

La selección comprende solamente los instrumentos nuevos de esta variante, sus dos helpers, los documentos de propuesta/resultado/custodia y la evidencia saneada: expected y adendas, informes de cada intento, copias de fuentes por ejecución, gates, FAIL históricos, regresión, matriz de 15 asignaciones, referencias de auditoría e integridad. Las fuentes copiadas por intento permiten reproducir el fallo histórico; no son versiones alternativas del código de producto que deban sustituirlo.

Los 4.148 payloads heredados conservan sus manifiestos anteriores. No se duplican como nuevo trabajo dentro del manifiesto aditivo. Los seis diffs tracked frente a la base son heredados y se han comparado con esa cadena; no hubo nuevas modificaciones de aplicación ni de documentos normativos aceptados. El estado del repositorio principal y sus 14.954 archivos sin seguimiento permanecen intactos.

El paquete del auditor tiene worktree, instrumentos y sello propios. La [referencia independiente](../../tests/fixtures/h6-bootstrap-variant/independent-review-reference-v2.json) enlaza sus comprobantes exactos; no se funden sus expected con los del ejecutor.

## Material excluido expresamente

- Dumps, globals originales/derivados privados, directorios PostgreSQL, backend Storage, claves, tokens, factores TOTP, contraseñas y configuración del ensayo.
- Inventarios privados detallados, logs privados de servicios y cualquier representación de sus secretos, aunque sean sintéticos.
- Directorios temporales y todas las raíces de custodia privada; dependencias y salidas de build.
- Material ajeno del repositorio principal y candidatos aceptados anteriores.

La comprobación de publicación examina localmente los valores sintéticos sensibles contra los payloads nuevos y solo emite el resultado agregado. No exporta valores ni hashes individuales de secretos. No sustituye la revisión de acceso/alcance necesaria antes de una publicación futura.

## Custodia local persistente

Preflight de custodia anterior: 38.583 archivos / 1.415.326.681 bytes comprobados contra los dos inventarios históricos. Nuevos materiales del ejecutor: `/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-bootstrap-variant`, 47.276 archivos / 1.801.849.702 bytes. Recibo público con integridad y modos: [custody-receipt-v1.json](../../tests/fixtures/h6-bootstrap-variant/custody-receipt-v1.json).

Todos los directorios de la copia son 0700 y sus archivos 0600, propietario local verificado, sin enlaces simbólicos ni ACL allow. Fuente y copia se rehashean después del traslado. Los originales temporales no se borran. Los clústeres y servicios se detienen antes de custodiar. La protección acreditada es local por permisos; no se afirma cifrado adicional, inmutabilidad WORM ni plan Production de retención.

El auditor custodia sus recursos en raíces propias, separadas y descritas por su manifiesto. No se sobrescribe ningún inventario anterior.

## Publicación futura y decisión pendiente

Una autorización futura deberá identificar los manifiestos exactos y el destino. Para Drive se utilizará la estructura empresarial existente de Huescaventura; no se han creado carpetas paralelas ni subido archivos. Antes de cualquier publicación deberán releerse archivos/sellos y excluir nuevamente material privado. Aprobar la variante técnica no autoriza publicación, S11 ni cierre de H6-015.

**STOP: expediente preparado; custodia local verificada; publicación y reentrada reservadas.**
