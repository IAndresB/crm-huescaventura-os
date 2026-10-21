# H6-014 — Correctivo M1/m1, revisión r3

Estado: PASS técnico interno de preparación; auditoría independiente de r3 PENDIENTE. No aceptación formal ni H6-014 COMPLETED.

## A. Resultado y linaje conservado

La identidad inicial f17b39cb3e0b3e6fd357659866910ee9e7971fdf9b3b3830a458488351e578ef fue comprobada: 22/22 controles, 18/18 contrapruebas originales, 31/31 focales y 18/18 payloads PASS. La auditoría independiente r1, creada con fork_turns=none, obtuvo STOP por A01 generación de entorno F1/F2, A02 owner de pgcrypto y A03 debilitamiento posterior de guardas Bash. El informe íntegro independent-audit-r1.md (SHA 54e928860abc441b66b449627486d9d442de9151bd8afeb56851f98aa6b7ae17) y los 19 archivos exactos están en el sobre externo indicado abajo. candidate-r1.tar.gz: 135089 bytes, SHA b511dd18c5ac18c813aabcf240dff63cef5231804a2a310a0b4a29605551b703.

La identidad r2 0e003f9fe982ac7065d111d32add53c8aceb7d4aa852461e3eb5004d9cadd8ac recibió otro STOP independiente por R2-A04, aplicación de receta Core a Storage, y R2-A05, guardas de nombre acreditadas aunque se colocasen después de restore. Informe íntegro independent-audit-r2.md: 17338 bytes, SHA dccb950cf45a8d96d0af2be8a12c05ffd8086886d4edd5863ee78c1621aecc3f. Sus 20 archivos exactos se conservaron ANTES de r3 en candidate-r2.tar.gz: 142415 bytes, SHA b35d6ae7448b9ae5ef2f1032b10e3bc0952484569942f74cf3054dda7eed5c50. Ambos TAR se cotejaron por lectura de todos sus miembros, contenido y modo; sin extracción sobre originales.

Sobre externo de coordinación: /Users/andres/Developer/crm-huescaventura-os-audit-h6-014-autonomous-20261021. Los dictámenes STOP no se sustituyen por PASS internos posteriores. R3 agrega un criterio técnico previamente sellado, revision-r3.json, SHA 9cf7d7e0017e7031be2f8660b1d89060082d68d2a398b5b1facb9007cc915cad. Expected, criteria.json, sus sellos y revision-r2.json permanecen intactos.

## B. Identidad y alcance

Base HEAD/main/origin/main/remoto verificada durante el ciclo: 07808f7d441452a8a2f251306824de3f8520b490; árbol f2482423116e9d09313edbc7d63bd397a92bddc8. Índice/árbol versionado sin cambios. Expected original aaab43534e34e4256406ef413167e409784d307253a3cf22be2708c7037554f1. Manifiesto original 5dea28d050d8c8fb194cdc03929baaf3a3196a058204d26c8025520ae7990db4 y original-candidate.tar.gz c598b992fc1017f1770111c61542bb1fdb3f79c390092a73499a772ecdbf3c30 conservan los 11 originales.

Normativa: Tasks H6-014 2437–2450 y seis asignaciones §6; AC-073, SPEC-NFR-005, ARCH-DEC-017, P13, PLAN-B10 y PT-12. H6-014 prepara inventario/procedimiento; H6-015 conserva la ejecución posterior y sus dependencias. D037.5 y D038.6 exigen renovación del entorno, distinta de access_generation del actor. No se modifica ninguna de estas fuentes.

## C. Correcciones retenidas de r2

S06 exige renovar administrativamente generaciones/keyId y claves F1/F2, deshabilitando sin borrar todas las activas restauradas, transacción parametrizada y readback antes de nuevos emisores o servicios. No se reaplican migraciones. Los modelos puros comprueban metadatos; aleatoriedad, custodia y denegación real quedan para H6-015.

SOLO Core divide la TOC íntegra en base/propiedades, schema crm_crypto y resto, con cada entrada literal exactamente una vez. Provisiona pgcrypto 1.3 bajo crm_h0_migration antes del resto. Owner extensión/schema/CRM exactos; correspondencia builtin OID10 únicamente para miembros pgcrypto C no SECURITY DEFINER, ACL por defecto y pertenencia acreditada, derivada del comentario de migración F1 y PostgreSQL17. Los demás casos paran; no se generaliza la equivalencia. La creación usa --create sin -1; fases posteriores sin --create, con -1. Globals propios, cuarentena y comparación privada de owner/ACL/GUC y privilegios efectivos siguen siendo obligatorios.

## D. Corrección r3 de R2-A04 y R2-A05

Se separa la carga común de globals (una vez por cluster) de DOS variantes alternativas. Core conserva sus fases. Storage, fijado por scripts/test-postgres.mjs al upstream 5def1dfc15ab7f08fe271c7d1e70542424524e4e, dispone de carga íntegra de su propio archivo custom con --create, sin listas, -1 ni provisión de objetos CRM. Conserva base postgres, roles, owner/ACL/GUC propios y el mantenimiento reservado para evitar colisión. El catálogo real y TOC deben confirmar antes de cargar la variante conocida sin extensiones añadidas; un recurso distinto detiene esta receta y requiere preparación revisada. No se asume ese catálogo ya observado. Los objetos initdb no volcados son plataforma nueva compatible, no datos/owners CRM remapeados.

partition_restore_toc(..., resource_kind="storage") acepta la TOC representativa Storage sin crm_crypto/pgcrypto y conserva todas sus entradas. Rechaza identidad incorrecta y extensiones no revisadas. Esto no sustituye el archivo/catálogo real independiente. El inventario y los controles distinguen las dos variantes. No se crea una nueva regla del producto.

El parser acredita las cinco guardas de nombre ANTES de cada pg_restore y la guarda de mantenimiento ANTES de initdb; no concede crédito por presencia posterior. Conserva rechazo de set +e/+u/-x, desactivación de pipefail y umask distinto de 077. El modelo sigue acotado; no pretende probar toda la semántica de prosa/Bash.

## E. Archivos y resultados internos

| Archivo técnico | SHA-256 r3 |
|---|---|
| `scripts/verify-h6-014-preparation.py` | `cb05fcb127c5738bafb3f1ed30137c03c9cb250d0f7b153aeb77e5b6ce8fc6dd` |
| `specs/001-core-crm/procedure-TSK-H6-014.md` | `906cf7a451d0c85f6d5bc0ff91ce776ef9cec786d896a3620b7019cfc667ba70` |
| `specs/001-core-crm/inventory-TSK-H6-014.json` | `01bfab40b8c6c7a1244ed8e3d58dbf91cab821ca87f16f0868bb1cbf48693907` |

También se actualizan este informe, results.json append-only y el manifiesto correctivo vivo, tras archivar las revisiones previas. Solo se añade revision-r3.json. La entrada r1 y la r2 permanecen idénticas como prefijo del historial; la nueva entrada registra hash del informe anterior, verificador e inputs exactos.

Comando: python3 -B scripts/verify-h6-014-preparation.py --output. Resultado observado de r3: **22/22 preparación, 18/18 contrapruebas originales, 63/63 focales PASS**, cero errores, preservación true. Conserva los 47 casos r2 y añade 16: cobertura Storage positiva, rechazo cruzado de variantes, extensión/owner/nombre no soportados, --create/-1/listas de Storage, cinco guardas de nombre tardías, mantenimiento tardío y conflicto del control Storage. Son comprobaciones puras y análisis Bash -n, no restore.

La comprobación posterior --check-manifest será solo lectura. El manifiesto propio se excluye de su payload; su hash se fija fuera de él. Se mantienen 21 rutas del candidato contando manifiesto, 20 payloads. Un PASS independiente futuro se conservará en el sobre externo sin editar esta identidad congelada; este informe aún no lo atribuye.

## F. Integridad y límites

39940 versionados / 731158616 bytes, descriptor dd16c5b99a7e1de7b4834c8d834fdca015b54957e65b6153479a4fdb1db58e46; 14954 históricos excluidos / 172003534 bytes, descriptor c87051517945709193252ae22a82c5dc599748304241523317b91f1fc4c33ca1. Índice f7b9958b53c78a669678bdad47dbfe8a24b768dc337e3063b75aa4d92ba8633b y 68 migraciones intactos. Las auditorías r1/r2 también recalcularon la preservación de forma independiente.

No se han iniciado PostgreSQL/Storage, ejecutado SQL, restaurado bases, aplicado migraciones, ejecutado H6-015, usado datos reales, operado Hosted/Production, hecho commit/push/deploy ni subido a Drive. No se acredita recuperación integrada ni RPO/RTO/cadencia/costes. ARCH-PENDING-002 y DM-PENDING-005 permanecen abiertos; los modelos puros no los cierran. Los parsers soportan únicamente la variante e identificadores simples documentados; un formato desconocido falla cerrado.

## G. Siguiente puerta

Nueva auditoría en contexto separado sin historial del implementador, reconstruyendo las fuentes y examinando la identidad r3 sellada, los hallazgos anteriores y variantes Core/Storage. Si detecta defectos, se conserva esta revisión y continúa el ciclo autorizado. Un PASS permitiría recomendar aceptación local de la preparación, sin declarar H6-014 COMPLETED, publicar ni ejecutar H6-015.
