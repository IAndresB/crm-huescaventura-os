# H6-006 / H6-008 — Inventario y propuesta de custodia/publicación

22 de octubre de 2026. **Preparación local exclusivamente. Sin staging, commit, push, subida a Drive ni publicación.** H6-006 y H6-008 COMPLETED solo local/aislado; H6-015 NOT STARTED.

## Conjunto Git propuesto

El [inventario exacto](../../tests/fixtures/h6-local-closure/publication-inventory.json) identifica por ruta, bytes, SHA-256, modo y motivo los 4.055 payloads R2 aceptados, su manifiesto congelado y las incorporaciones documentales de este cierre. Las únicas modificaciones de archivos ya versionados siguen siendo `src/infrastructure/postgres/h0-005-adapter.ts` y `src/server/human-postgres-composition.ts`; este bloque no cambia código.

Se propone versionar el conjunto saneado completo, incluidas evidencias positivas y adversas, expected, recibos y snapshots de fuentes utilizados por cada ejecución. Es una elección explícita de trazabilidad: permite recuperar desde la publicación los 4.055 miembros del manifiesto aceptado sin elegir solo el último PASS. Las copias históricas conservan sus rutas y significado; no se mezclan para construir una supuesta versión única. Esta propuesta no autoriza añadir todos los archivos de un directorio ni incorporar material no enumerado.

El inventario distingue payload y tres envolturas: `publication-inventory.json`, `closure-verification.json` y `closure-seal.json`. La primera enumera el payload y los nombres de las envolturas; la verificación comprueba el contenido; el sello identifica inventario y verificación. El recibo exterior identifica el conjunto completo, incluidas las envolturas, evitando un hash autorreferente.

Los documentos históricos que todavía dicen «pendiente» se conservan como antecedentes; [el cierre consolidado](closure-H6-006-H6-008.md) y `operational-status.json` son el estado vigente. No se modifica normativa ni se altera Tasks para cambiar un hash aprobado.

## Fuera de Git

1. Los 14.954 archivos históricos sin seguimiento del checkout original, enumerados exactamente en [excluded-root-untracked.json](../../tests/fixtures/h6-local-closure/excluded-root-untracked.json). Se conservan allí; no pertenecen a este commit ni al paquete remoto propuesto.
2. Los siete archivos TAR de custodia y su recibo exterior, dentro de `/Users/andres/Developer/crm-huescaventura-os-custody-h6-006-h6-008-20261022`. Son sobres de documentos/código/evidencias, no backups de bases. Sus nombres, miembros y hashes figuran en el recibo exterior; no se duplicarán como binarios Git.
3. Dependencias, `.next`, caches, binarios y fuentes públicas descargadas, clústeres/PGDATA, dumps, globals sensibles, configuración de servicio, `.env`, claves F1/F2, passwords, TOTP/QR, tokens, JWT y enlaces temporales. Ninguno se incorpora a esta propuesta. `.gitignore` no es el mecanismo de seguridad: la publicación futura empleará exclusivamente la lista literal aprobada.

Los worktrees históricos permanecen en su sitio sin limpieza ni cambios. Los sobres permiten recuperación en destino nuevo: original de 291 payloads; revisión independiente H6-006; integración R1 adversa; revisión independiente Auth R1; revisión independiente Auth R2; candidato final R2; y documentación sucesora de cierre. Cada sobre contiene su manifiesto correspondiente. El nombre «R1 adverso» no cambia su resultado a PASS.

## Destino de Drive verificado en lectura

Cuenta **info@huescaventura.com**. Estructura existente comprobada por metadata y listado:

`HUESCAVENTURA / 07_TECNOLOGIA_Y_SISTEMAS / CRM_HUESCAVENTURA_OS / 02_AUDITORIAS`

Padre: [02_AUDITORIAS](https://drive.google.com/drive/folders/14xSnNfE7K4hUrMopJaPEab2ccxD_8Rrr). Se han observado las subcarpetas H5-019, H6-013 y TSK-H6-014. No existe en ese listado una carpeta para este cierre. Se propone **una sola subcarpeta de paquete `TSK-H6-006_H6-008` bajo el mismo padre**, no otra raíz CRM ni BAILO OS. Es un nombre propuesto; no está creada ni tiene ID. [Recibo de lectura](../../tests/fixtures/h6-local-closure/drive-location-readback.json).

La futura custodia transferirá exactamente los siete TAR y `delivery-receipt.json` a esa subcarpeta, preservando bytes. El recibo permite asociar la auditoría H6-006, los dos candidatos/revisiones Auth y el cierre sin duplicar los miles de archivos sueltos en Drive. Las actas son recuperables dentro de sus sobres; no se crea ahora un documento remoto ni enlace de entrega ficticio.

## Secuencia futura sujeta a autorización

Primero, revalidar la cuenta, padre, ausencia de duplicado y permiso de escritura; luego crear/reutilizar únicamente la subcarpeta aprobada y subir los ocho archivos exteriores exactos. Descargar cada uno y comparar bytes/SHA-256; leer todos los miembros de los TAR en memoria o recuperarlos en un destino nuevo autorizado, verificando cada manifiesto. Registrar IDs, enlaces reales y un recibo sucesor de custodia. Metadata, un toast o el nombre del archivo no prueban igualdad de contenido.

Después, si el director autoriza publicación Git, revalidar base, remoto, índice vacío y lista exacta contra el recibo. Cualquier cambio posterior exige un inventario sucesor antes de staging. No staging global, ni clean/reset, ni unión de los 14.954 históricos. La autorización posterior deberá fijar commit y push permitidos; verificar rutas, árbol y lectura remota al terminar. El SHA del futuro commit no existe hoy.

Los archivos de este cierre local y los sobres quedan preparados, pero su custodia remota y publicación siguen **NO EJECUTADAS**. H6-015 tampoco se ejecuta. **STOP.**
