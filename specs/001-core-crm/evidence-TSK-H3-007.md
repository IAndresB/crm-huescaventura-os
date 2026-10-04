# Evidencia TSK-H3-007 — Provider Invoice addressed to client

**Resultado: COMPLETED local/aislado.**

Base inicial `ac10866027f08d43a708a22f3238d684a1ffc100`: fetch, main, árbol limpio y HEAD==origin/main exactos antes de modificar. Commit exacto de producto/verificación probado `39a31c03bdd091e6b659952193b75493ded06f4f`; incluye las correcciones. El commit documental de cierre y su SHA publicado son posteriores y no cambian ese producto. Expected independiente `0052f09`,65 casos/18 filas Tasks §6, hash `5ecb8c721b88c0404daa43be42e1bb0ec6ac5d26b56c8a43316a89faa3755b18`; byte idéntico al congelado.

Entorno exclusivamente local/aislado y fixtures sintéticos: Node24.21.0, pnpm11.19.0, PostgreSQL17.11 (Postgres.app), CLI Supabase2.118.0 para migration new; Storage oficial `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, backend file privado en loopback y credenciales efímeras. No hosted ni datos reales. [Manifiesto y hashes](../../tests/fixtures/h3-008/closure-verification.json).

Regresión sobre el SHA citado: **927/927 PostgreSQL;104/104 unitarias;65/65 matriz independiente;1/1 focal;8/8 reproducciones**.75 tests Node en el bloque incluyen el agrupador de la matriz;74 casos lógicos (65+1+8).0 FAIL,0 skipped,0 cancelled,0 defectos materiales abiertos. Instalación congelada, typecheck, lint/boundaries/imports, build, auditoría producción (0 vulnerabilidades conocidas), diff-check, V-MIG y preservación PASS. [Log PostgreSQL](../../tests/fixtures/h3-008/closure-postgres.log), [unitarias](../../tests/fixtures/h3-008/closure-unit.log) y demás closure-*.log referenciados en el manifiesto.

## Implementado

Una única entidad/exigencia Provider Invoice. Identificar la necesidad real externa produce Pendiente sin archivo; Tararí interno se rechaza y no genera proveedor externo, suplido ni factura interna. La necesidad puede conservar importe comparativo desconocido (null explícito), sin inventar cero. Recibir requiere original B07 privado conservado, procedencia, emisor, destinatario, importe identificado y servicios candidatos; deja Recibida, sin revisión ni pago.

La revisión compara identidad estable del proveedor, destinatario, importe y alcance. Conserva basisApplied y issuerApplied con sus versiones originales; no recalcula desde configuración vigente. La base comparativa conocida no se modifica para cuadrar. Si estaba desconocida, una base posteriormente comprobada es un nuevo hecho de revisión con fuente/versiones, conservando null en la base inicial. Falta de base bloquea solo la revisión. Datos documentales exactos con signo/cero se conservan: si difieren de la base generan Incidencia, sin crear deuda/fondos ni validación fiscal.

Revisada no es Vinculada. El vínculo exige correspondencia documental comprobada y porciones identificadas por Booking Service con fuente; suma exacta igual al total. Un documento original sirve varios servicios sin duplicar bytes. Sin atribución verificable, sumas incorrectas, destino ajeno o ausencia de revisión previa se rechaza. La estructura es el contexto documental mínimo de gestión externa cliente/proveedor/Booking Service/base para SM-PI-04; no es un nuevo ciclo de Suplido, Payment Allocation ni pago.

Una corrección/incidencia posterior añade revisión enlazada: original → documento corrector B07 (corrects_id) → nueva revisión → vínculo vigente. El estado pasa a Incidencia y exige revisar/vincular; los vínculos originales y snapshots anteriores permanecen en historia. Una diferencia puede registrarse sin fabricar otro archivo. Ninguna etapa crea Customer Payment, fondos, Allocation, consumo/cobertura, salida, Provider Payment, mandato, factura fiscal ni cierre Booking/Suplido.

Dominio: provider-invoice.ts, validación de dinero materializado y comparación C02 sobre el núcleo monetario H1 existente; sin floats ni otro cuantizador. Persistencia/adaptador: h3-invoice-adapter.ts y una sola migración nueva `20261004161012_h3_provider_invoice_documentary.sql`. Cuatro tablas privadas append-only (raíces, operaciones, revisiones y relaciones de originales); revisiones con antes/después, actor, momento, razón, fuente/evidencia y acto separado. No segundo almacén de archivos: H1013EvidenceAdapter/H1015ObjectAdapter y Document/Object Version B07 acreditados; preparación/upload/contraste/vínculo recuperables, sin promesa ACID entre Storage y SQL.

## Seguridad, atomicidad y reproducción verificadas

Reutiliza el patrón estrecho F1/F2 acreditado; APIs invoice_apply/read con SECURITY DEFINER propiedad del executor NOLOGIN/NOBYPASSRLS, tablas del owner separado y FORCE RLS. Sin CRUD ordinario runtime/anon/authenticated, sin EXECUTE PUBLIC, search_path pg_catalog,pg_temp y referencias cualificadas. Pruebas retiran contexto, falsifican ambas firmas/scope, deshabilitan actor e intentan escritura/enumeración ajena. C02/C03/C04/C06 exponen solo contexto autorizado exacto; DTO de factura sin private_ref ni URL pública.

Identidad/operación/need_key/original serializadas en raíces compartidas aun sin hijos. Mismo original y replay no duplican factura, revisión, vínculo, incidencia ni corrección. Misma identidad/material diferente produce E2. Sesiones reales simultáneas para necesidad/recepción/revisión/vínculo/corrección; revisión obsoleta rechazada. FK diferidas enlazan raíz/resultado/revisión/original; fallos antes/escritura/historia/revisión/vínculo/corrección/COMMIT hacen rollback completo. Probe MVCC independiente tras escritura no committed no ve parcial; respuesta perdida se recupera mediante replay autorizado. No exactly-once externo.

## V-MIG y preservación

Fresh install34 migraciones,33 previas byte idénticas; upgrade H3-006 poblado con fondos recibidos/conciliados, Allocation/consumo80 sobre100, Booking íntegra y original B07 realmente almacenado. Comparación antes/después de todos los datos anteriores, IDs, snapshots, dinero/historia, objetos/bytes y catálogo previo de owners/ACL/RLS/policies/functions/triggers/roles: PASS. Fallo dentro de migración y ROLLBACK conserva catálogo anterior completo. R58/R60–62 y regresión completa lo acreditan.54 archivos protegidos (incluidas las33 migraciones, normas, expected/evidencias anteriores y health-check) byte idénticos.

Se corrigieron únicamente dos conteos de inventario del verificador histórico H3-006 para limitarlo a sus33 migraciones; se conserva el FAIL original y expected anterior. Los logs históricos H2 que el runner regenera se restauraron byte a byte; no se sobrescribió evidencia anterior. [Registro F01–F08](../../tests/fixtures/h3-008/defects.md): ocho CLOSED local/aislado, con reproducciones y originales separados.

Consulta técnica del changelog [PostgreSQL15.19/17.11](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) y [Storage privado](https://supabase.com/docs/guides/storage/security/access-control). La validación efectiva de permisos/objetos procede de las pruebas locales; ninguna consulta/despliegue hosted.

## Pendiente posterior / no acreditado

**H3 IN PROGRESS; H3-001–008 COMPLETED local/aislado; H3-009+ y H4–H6 NOT STARTED. STOP obligatorio tras H3-008; continuidad requiere nueva autorización humana.** No se ha iniciado ni preparado ninguna tarea posterior.

Integración adicional de H3-012, H5-014, H5-016 y H6-007 pendiente hasta sus dependencias. AC-046, DM-INV-034 y E2E-05 se verifican solo en su fragmento documental local; pago, conciliación con salida y cierre completo Suplido/Booking siguen sin acreditarse. Provider Payment completo, cierre completo Suplido, fiscalidad, mandato, facturación, numeración fiscal, conectores y datos/fondos reales pendientes. DM-PENDING-002 / BR-PENDING-021/022/033 y todos los pendientes globales siguen abiertos; no se inventan IVA ni conclusiones profesionales. Hosted H2/H3 no acreditados; Production no autorizada. Health-check Supabase independiente byte idéntico, fuera de H0–H6. Se conservan además los pendientes anteriores H4-019/H4-021/H6-005/H6-016, Refund/fianza/salidas reales y todas las puertas PLAN-AUTH/ARCH/DM/BR aplicables.
