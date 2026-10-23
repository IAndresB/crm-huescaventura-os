# H6 — Inventario de publicación pendiente desde 971c55d5

**PREPARADO, NO EJECUTADO.** La autorización vigente permite inventariar y verificar localmente. No permite staging, commit, push, GitHub, Drive ni mezclar la publicación de H6-001 con H6-015. H6-001 IN PROGRESS, decisión de aceptación pendiente; H6 global IN PROGRESS.

Base local `971c55d5ce5770c71284d106d3c0deecca9514b5`. Main y origin/main son refs locales observados, sin nueva comprobación remota. Principal intacto; checkout de implementación `h6-001-local`. El inventario exhaustivo inicial del auditor está en [custody-initial/inventory-v1.json](../../tests/fixtures/h6-001/custody-initial/inventory-v1.json), con hashes, tamaños, estado Git, worktree y procedencia. Los deltas de worktrees se solapan: **no sumar copias** como una entrega única.

| Lote propuesto | Contenido / dependencia | Estado y separación |
|---|---|---|
| A — H6-006/H6-008 | Inventario ya preparado de 4.067 payloads + 3 envolturas = 4.070 paths; Auth R2 aceptado. | Publicación propia pendiente. Manifiesto `8d0f443747cdb1d66f9cd9af0945fc5df12e81bf16cf25cf9f4e2060fdbb7982`; sello `e62cfae414588446a14c95767d0b2c0d3b7b7950286618c23eb8967c4afeb923`. |
| B — H6-015 técnico | Ejecución, PG17, bootstrap, adopción r4, C04/B07, AC073 y aceptación integral, con auditorías. Hereda A. | Mantener cada manifiesto y dictamen. Aceptación ejecutor `542321de105ab58d2ba662c4e4936ce0a057e6c83beb7aca2d3a8c1eb550e499`, auditor `047bf131fb54945409d03ed260eec3f0b754e8b866af3ead4f58db3ac5a3097e`. Sin mezclar con H6-001. |
| C — H6-015 cierre formal | 18 paths de snapshot `8ec91602a3bf813cf01ffbc6b2ac1a2862fe10d0`, auditoría de adopción snapshot `fc68a90cd555a83388d5b166ff86adeda70110b8` y auditoría formal separada. | Recuperable local, no restaurado ni publicado. Manifiesto de cierre `991d14013efd0f2527dea48bdc50dd426747a6089d15fc54745eac8140b15ada`. |
| D — H6-001 propio | Prueba E2E-01, runner, verificador, expected, matriz, informes, salidas y documentación de estado. Antecedentes exactos: 14 archivos, ocho de producto y seis de soporte/tests. | Paquete propio separado. No publicar el delta bruto del worktree: incluye antecedentes A/B pendientes. Requiere autorización posterior sobre lista literal. |
| E — Históricos y FAIL | Intentos anteriores, evidencia de R1, worktrees auditores y 14.954 untracked históricos del principal. | Custodia/preservación; no inclusión masiva por defecto. Los FAIL propios de H6-001 sí quedan en su paquete de evidencia sin convertirlos en PASS. |

Los 14 antecedentes están enumerados en [inherited-inputs.json](../../tests/fixtures/h6-001/inherited-inputs.json). H6-001 no introduce un nuevo cambio de producto ni SQL. La composición probada requiere esos antecedentes: publicar únicamente el nuevo test sobre la base sin resolver su dependencia técnica no reproduce el candidato. Copiarlos localmente no autoriza publicarlos ni altera los manifiestos de sus trabajos de origen.

Conflictos concretos para una futura revisión autorizada:

1. `src/infrastructure/auth/supabase-auth-provider.ts` y `src/server/human-auth-session.ts` tienen variantes históricas R1/R2. Conservar R1 como evidencia; usar la identidad R2 aceptada al seleccionar el producto. No aplanar worktrees.
2. `tasks.md`, `PROJECT-STATUS.md` y `NEXT-STEPS.md` reciben cabeceras distintas de H6-015 y H6-001. El cierre formal archivado describía H6-001 NOT STARTED en su momento. Integrar cronología y conservar ambos hechos; no reemplazar archivos enteros ni descartar el cierre formal.
3. Los manifiestos contienen rutas coincidentes heredadas. Una publicación futura debe deduplicar por path+hash y detectar diferencias, conservando qué manifiesto y versión originaron cada candidato. Los manifiestos sellados históricos no se recalculan sobre el futuro merge.
4. Los metadatos `git-before.bin` y `preservation-baseline.json` de H6-015 están marcados `localOnlyPreservationMetadata`. Los inventarios locales pueden enumerarlos; eso no los convierte en publicables. También se excluyen `node_modules`, `.next`, `.DS_Store`, cachés, logs privados de runtime, bases/dumps/claves efímeras y credenciales.
5. No hay migraciones nuevas en el delta de H6-001 ni en los antecedentes pendientes observados. No se inventa orden de despliegue ni un plan Production.

El [inventario literal de H6-001](../../tests/fixtures/h6-001/publication-candidate-inventory.json) separa el payload propio de los 14 antecedentes y de las envolturas. El [manifiesto propio](../../tests/fixtures/h6-001/delivery-manifest-v1.json) enumera bytes, SHA-256 y clasificación; el [sello](../../tests/fixtures/h6-001/delivery-seal-v1.json) identifica el manifiesto. El [readback exterior](../../tests/fixtures/h6-001-delivery-readback/README.md) se conserva como envoltura separada y no modifica el paquete verificado. Los recuentos exactos y la identidad de cada miembro están en esos inventarios, sin sumar los intentos o copias como cobertura nueva.

Es identidad para revisión/custodia local, **no una autorización de publicación**. No se propone cambiar ramas, hacer merge ni ejecutar operaciones remotas. Los datos de inventario de worktrees y metadatos de custodia son locales y requieren revisión expresa si se seleccionan para una futura publicación. H6-015 mantiene sus cuatro trabajos suspendidos y su cuarentena.
