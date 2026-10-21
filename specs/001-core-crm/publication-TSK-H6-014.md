# TSK-H6-014 — propuesta exacta de custodia y publicación

**Propuesta preparada; custodia y publicación NO AUTORIZADAS. Cierre COMPLETED exclusivamente local/aislado.**

## 1. Conjunto Git propuesto

El [inventario exacto](../../tests/fixtures/h6-014-closure/delivery-inventory.json) enumera 33 rutas: 21 del candidato r3 sin cambios, nueve incorporaciones de cierre y tres documentos de coordinación modificados. Descriptores: tipo, modo, bytes, SHA-256, motivo y disposición. El payload enumera 30 rutas y separa tres envolturas —delivery-inventory.json, closure-verification.json y closure-seal.json— para impedir autorreferencias. El recibo externo final identifica las 33; su ruta y huella se entregan al director fuera de este conjunto.

Las únicas modificaciones versionadas son docs/NEXT-STEPS.md, docs/PROJECT-STATUS.md y specs/001-core-crm/tasks.md. El estado inicial del candidato ya era no versionado; el cierre no crea cambios técnicos. No hay nuevos TAR en Git. El TAR original pequeño, existente en r3, se incluye para preservar el instrumento exacto. Los tres TAR de revisiones y las auditorías permanecen en custodia externa identificada.

Las 14.954 evidencias históricas excluidas siguen fuera de esta publicación y se conservan intactas. Cachés, dependencias, clústeres y archivos ignorados ajenos no se incluyen. Esta propuesta no autoriza git add, commit, push, rama o tag.

## 2. Propuesta Drive por tarea

Cuenta oficial prevista: **info@huescaventura.com**. Padre: **HUESCAVENTURA/07_TECNOLOGIA_Y_SISTEMAS/CRM_HUESCAVENTURA_OS/02_AUDITORIAS**, ID **14xSnNfE7K4hUrMopJaPEab2ccxD_8Rrr**. Subcarpeta propia propuesta: **TSK-H6-014**. No está creada ni se ha comprobado acceso actual a la cuenta.

| Área lógica | Archivos propuestos | Finalidad |
|---|---:|---|
| auditoria/ | 8 | Sobre sellado existente: manifest.json, audit-cycle.json, independent-audit-r1/r2/r3.md y candidate-r1/r2/r3.tar.gz. |
| cierre/repositorio/ | 12 | Nueve archivos de cierre y tres snapshots exactos de coordinación, conservando rutas relativas. |
| cierre/delivery-receipt.json | 1 | Recibo final exterior: identifica los veinte anteriores, el conjunto Git completo y las tres envolturas del cierre. |
| Total | 21 | Sin duplicar en Drive los veintiún archivos sueltos r3, recuperables desde candidate-r3.tar.gz. |

Cada fuente local, destino lógico, hash, tamaño y relación con el cierre consta en el inventario y en el recibo exterior. Las tres envolturas del repositorio se resuelven por closure-seal.json y el recibo; este último se excluye de su propio hash y su identidad completa se entrega por el informe final. No se inventan IDs de carpeta/archivo ni enlaces de Drive. BAILO OS no es el repositorio de evidencia técnica.

## 3. Verificación posterior, solo tras nueva autorización

1. Confirmar la cuenta y el padre oficiales y crear exclusivamente la subcarpeta aprobada de esta tarea. Subir exactamente los 21 archivos inventariados, sin conversiones ni alteración de bytes; registrar ID real, destino lógico y fecha. Este paso no se ejecuta ahora.
2. Leer o descargar cada archivo desde su destino remoto y comparar tamaño y SHA-256 con el recibo local. Un nombre/toast/metadata sin lectura de bytes no acredita identidad. Si se requiere export para algún formato, preservar además el archivo original y no presentarlo como bytes idénticos sin cotejo.
3. Leer el sobre de auditoría y contrastar sus siete payloads; comprobar los 20 miembros payload y el manifiesto del candidato r3. Abrir los TAR solo en memoria o recuperar posteriormente en destino nuevo autorizado; nunca sobre el repositorio ni las custodias originales. Verificar r1/r2, informes STOP y original de once archivos anidado.
4. Cotejar las 33 rutas Git propuestas y las tres envolturas del cierre. Los TAR conservan modos Git; Drive conserva bytes, no se presume que reproduzca metadatos POSIX.
5. Registrar un recibo NUEVO de custodia con IDs/enlaces reales y resultados por archivo, preservando inventarios y recibos anteriores. Ese recibo habilitaría la evaluación posterior de publicación, sin autorizarla por sí mismo.

## 4. Secuencia propuesta para Git, no ejecutada

Con custodia accesible y verificada, el director podrá autorizar exactamente las 33 rutas y sus hashes finales. Revalidar base/main/remoto e índice y comprobar ausencia de drift antes de staging literal por lista; no usar adición global de todo el árbol. Revisar diff y sus límites. Crear un único commit documental/técnico del paquete aprobado y un único push normal solo si la autorización posterior lo dispone. Verificar después el commit, árbol, rutas y bytes en main remoto y conservar un recibo nuevo; el SHA de ese commit todavía no existe.

La aceptación normativa no se sustituye por el SHA de publicación. Hasta la custodia comprobada, los enlaces locales externos no hacen autónomo al expediente desde GitHub. La publicación futura incorporará los IDs reales en un registro sucesor de custodia si se autoriza, sin reescribir este inventario congelado.

H6 global IN PROGRESS. Restauración integrada NO EJECUTADA; AC-073 global, Hosted y Production NO ACREDITADOS; ARCH-PENDING-002 y DM-PENDING-005 OPEN. No ejecutar H6-015. **STOP antes de GitHub, Drive o H6-015.**
