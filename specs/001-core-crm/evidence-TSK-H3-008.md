# Evidencia TSK-H3-008 — Verificación normativa independiente

**Resultado: COMPLETED local/aislado.**

Base inicial `ac10866027f08d43a708a22f3238d684a1ffc100`: fetch, main, árbol limpio y HEAD==origin/main exactos antes de modificar. Commit exacto de producto/verificación probado `39a31c03bdd091e6b659952193b75493ded06f4f`; incluye las correcciones. El commit documental de cierre y su SHA publicado son posteriores y no cambian ese producto. Expected independiente `0052f09`,65 casos/18 filas Tasks §6, hash `5ecb8c721b88c0404daa43be42e1bb0ec6ac5d26b56c8a43316a89faa3755b18`; byte idéntico al congelado.

Entorno exclusivamente local/aislado y fixtures sintéticos: Node24.21.0, pnpm11.19.0, PostgreSQL17.11 (Postgres.app), CLI Supabase2.118.0 para migration new; Storage oficial `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, backend file privado en loopback y credenciales efímeras. No hosted ni datos reales. [Manifiesto y hashes](../../tests/fixtures/h3-008/closure-verification.json).

Regresión sobre el SHA citado: **927/927 PostgreSQL;104/104 unitarias;65/65 matriz independiente;1/1 focal;8/8 reproducciones**.75 tests Node en el bloque incluyen el agrupador de la matriz;74 casos lógicos (65+1+8).0 FAIL,0 skipped,0 cancelled,0 defectos materiales abiertos. Instalación congelada, typecheck, lint/boundaries/imports, build, auditoría producción (0 vulnerabilidades conocidas), diff-check, V-MIG y preservación PASS. [Log PostgreSQL](../../tests/fixtures/h3-008/closure-postgres.log), [unitarias](../../tests/fixtures/h3-008/closure-unit.log) y demás closure-*.log referenciados en el manifiesto.

## Método y comparación

El oráculo es el expected normativo congelado antes del producto; las aserciones usan resultados literales, sin invocar la implementación de decisión como expected. V-DOM + V-DAT + V-MIG, V-AT/V-SM/V-NEG/V-EVI y PT07/PT11 en este alcance. G1–G6 y guardas materiales se retiran individualmente. SM-PI01–05 y FORB16 se intentan realmente; no basta ausencia pasiva de pagos.

Las18 filas Tasks §6 (ECON010, AC045/046, INV034, PI01–05, FORB16, P16, B05, C04, PT07/PT11, E2E05, E8 yD008) están copiadas en expected; se contrasta cada obligación en el fragmento autorizado. Suplido/pago/cierre integral y recorridos E2E futuros siguen pendientes expresamente, sin impedir el PASS documental local.

|ID|Observado en el SHA probado|Resultado|
|---|---|---|
|R01|Pendiente, document/review/link null; importe inicial desconocido permanece null y revisión espera base comprobada posterior.|PASS|
|R02|Sin servicio afectado: rechazo, estado previo intacto.|PASS|
|R03|Proveedor ausente: rechazo sin factura.|PASS|
|R04|Cliente ausente: rechazo sin factura.|PASS|
|R05|Booking Tararí íntegra de catálogo interno; necesidad externa rechazada, sin nuevo proveedor/factura/fondos.|PASS|
|R06|Recibida; original/versión B07 y segunda revisión histórica preservados.|PASS|
|R07|Versión original inexistente/no conservada rechazada.|PASS|
|R08|Fuente null rechazada.|PASS|
|R09|Emisor null rechazado.|PASS|
|R10|Destinatario null rechazado.|PASS|
|R11|Importes ausentes/tipos indebidos/precisión inválida rechazados; no convertir desconocido en cero.|PASS|
|R12|Candidatos ausentes/vacíos/ajenos rechazados.|PASS|
|R13|Recibida con review/link null.|PASS|
|R14|Revisada; diferencias vacías, actor real y link null. F07 acredita identidad estable con nueva versión.|PASS|
|R15|Incidencia recipient; original destinatario distinto conservado y link rechazado.|PASS|
|R16|Incidencia amount; original101.00/base100.01 conservados; zero/-20 identificados permanecen documentos, no fondos.|PASS|
|R17|Incidencia provider ante identidad distinta.|PASS|
|R18|Incidencia scope; candidatos originales preservados.|PASS|
|R19|Cada check false, checks/razón/evidencia retirados: rechazo sin cambio.|PASS|
|R20|Vinculada, documentaryOnly, dos porciones y revisión enlazada.|PASS|
|R21|Link desde Recibida rechazado.|PASS|
|R22|Correspondencia sin fuente rechazada; permanece Revisada.|PASS|
|R23|Un original, dos servicios/porciones; total100.01.|PASS|
|R24|Porciones null/vacías/fuentes ausentes rechazadas.|PASS|
|R25|Suma excesiva o servicio duplicado rechazados.|PASS|
|R26|Booking/destino ajenos rechazados.|PASS|
|R27|Corrección conserva vínculo anterior; Incidencia actual sin review/link vigente.|PASS|
|R28|Corrects_id al original; siete revisiones y nuevo vínculo vigente reconstruibles.|PASS|
|R29|Fuente/causa/cliente/importe/servicios afectados retirados individualmente: rechazo.|PASS|
|R30|Incidencia sin archivo ficticio; original intacto y link requiere revisión.|PASS|
|R31|Intento mark_provider_paid rechazado.|PASS|
|R32|Intento execute_programmed_payment rechazado; Programado no prueba Pagado.|PASS|
|R33|Noticia/payload de pago no resuelve necesidad documental.|PASS|
|R34|Recepción posterior correcta revisada/vinculada; Booking Pendiente de preparación.|PASS|
|R35|Emitir, numerar o validar IVA rechazados.|PASS|
|R36|Aceptar mandato desde factura rechazado.|PASS|
|R37|Todos los hechos económicos/Booking previos byte equivalentes; intentos recibir fondos/asignar/consumir/cubrir rechazados.|PASS|
|R38|Replay de recepción, revisión, vínculo y corrección devuelve previo sin nueva historia.|PASS|
|R39|Misma operación/material distinto: conflicto sin overwrite.|PASS|
|R40|Nueva clave/mismo original: replay, sin original/revisión extra.|PASS|
|R41|Resultado durable tras perder respuesta recuperado sin duplicación.|PASS|
|R42|Actor desconocido/scope no autorizado: rechazo de replay.|PASS|
|R43|Dos sesiones misma recepción, claves iguales/distintas y necesidad sin hijos: un hecho/raíz; ganador reutilizado o stale rechazado.|PASS|
|R44|Dos revisiones concurrentes: una nueva válida, otra conflicto.|PASS|
|R45|Dos vínculos concurrentes: uno válido, otro conflicto.|PASS|
|R46|Dos correcciones concurrentes: una válida, otra conflicto.|PASS|
|R47|Revisión obsoleta rechazada en review/link/correct.|PASS|
|R48|Tras INSERT aún no committed, otra sesión ve snapshot previo íntegro; después ve Revisada.|PASS|
|R49|Fallo antes INSERT raíz: rollback.|PASS|
|R50|Fallo entre raíz/historia: cuatro tablas sin cambios.|PASS|
|R51|Fallo durante review: rollback.|PASS|
|R52|Fallo durante link/resultado: rollback.|PASS|
|R53|Fallo durante corrección: original/revisiones/relaciones intactos.|PASS|
|R54|Trigger diferido al COMMIT: rollback de todas las tablas dependientes.|PASS|
|R55|Ausencia/forja F1/F2/scope, actor deshabilitado y roles ordinarios: denegación.|PASS|
|R56|INSERT/UPDATE/DELETE runtime y overwrite de migración ordinaria negados.|PASS|
|R57|Lectura ID con Booking/scope ajeno no entrega datos; filtros referencia/importe/proveedor/filename rechazados.|PASS|
|R58|Cuatro tablas FORCE RLS, owner separado, ocho policies, cuatro triggers; seis funciones con search_path explícito y sin EXECUTE PUBLIC; executor NOLOGIN/NOBYPASSRLS.|PASS|
|R59|Bytes originales descargables solo por B07 autorizado; un Object Version, sin private_ref en DTO.|PASS|
|R60|Fresh34;33 anteriores y expected/evidencias protegidos iguales.|PASS|
|R61|Upgrade poblado conserva datos/catálogo/roles anteriores y bytes reales B07; consumo80 permanece80.|PASS|
|R62|Migración fallida +rollback conserva catálogo íntegro, sin tablas nuevas.|PASS|
|R63|Expected65/18 congelado; regresión completa PASS y límites posteriores explícitos.|PASS|
|R64|IA/candidate no puede autoacreditar revisión.|PASS|
|R65|Actor/evidencia/fuente/motivo/momentos en cada revisión; vínculo histórico intacto.|PASS|

## Defectos, FAIL retenidos y regresión

F01 (autoridad del harness Tararí), F02 (helper reinsertaba evidencia), F03 (espera circular del harness frente al actor F2), F04 (validador de cobro positivo aplicado a documento), F05 (importe comparativo indebidamente obligatorio para necesidad), F06 (conteos históricos globales), F07 (versión confundida con identidad del proveedor) y F08 (socket temporal demasiado largo): **8 encontrados,8 CLOSED,0 abiertos materiales**.

El registro enlaza fuente normativa, commit histórico, reproducer y corrección: [defects.md](../../tests/fixtures/h3-008/defects.md). Logs first-matrix-original/terminated, F04/F05 originales, primera regresión921/923 y F06 affected, F07 product y F08 native conservados; ningún FAIL se sustituye. La terminación inicial y dependientes no acreditados se declaran. La regresión925/925 anterior a F07 tampoco se usa como cierre; el cierre es927/927 sobre39a31c0, con ocho reproducciones actuales PASS. Expected permanece idéntico a0052f09.

## V-MIG y seguridad

R58/R60/R61/R62: fresh install34, upgrade poblado desde las33 migraciones H3-006, fallo transaccional, owners/ACL/FORCE RLS/policies/functions/triggers/roles y preservación de todos los objetos previos, datos y bytes B07 PASS. F1/F2 actuales, firmas forjadas, actor deshabilitado, replay fuera de scope, roles ordinarios y DML directo verificados. Dos conteos históricos H3-006 se acotan a allocationMigration, sin alterar producto, expected ni33 migraciones anteriores. Manifiesto enumera54 archivos byte idénticos protegidos.

La política de conservación/datos reales/retención/fiscalidad no se inventa. Revisión operacional separada de validación fiscal; ningún Payment Allocation, consumo, cobertura, Provider Payment o cierre se infiere de documentos. AC045 pasa en su frontera documental; AC046 conserva pendiente la falta documental y permite revisión/vinculación posterior sin ejecutar su pago/cierre futuros.

## Pendiente posterior / no acreditado

**H3 IN PROGRESS; H3-001–008 COMPLETED local/aislado; H3-009+ y H4–H6 NOT STARTED. STOP obligatorio tras H3-008; continuidad requiere nueva autorización humana.** No se ha iniciado ni preparado ninguna tarea posterior.

Integración adicional de H3-012, H5-014, H5-016 y H6-007 pendiente hasta sus dependencias. AC-046, DM-INV-034 y E2E-05 se verifican solo en su fragmento documental local; pago, conciliación con salida y cierre completo Suplido/Booking siguen sin acreditarse. Provider Payment completo, cierre completo Suplido, fiscalidad, mandato, facturación, numeración fiscal, conectores y datos/fondos reales pendientes. DM-PENDING-002 / BR-PENDING-021/022/033 y todos los pendientes globales siguen abiertos; no se inventan IVA ni conclusiones profesionales. Hosted H2/H3 no acreditados; Production no autorizada. Health-check Supabase independiente byte idéntico, fuera de H0–H6. Se conservan además los pendientes anteriores H4-019/H4-021/H6-005/H6-016, Refund/fianza/salidas reales y todas las puertas PLAN-AUTH/ARCH/DM/BR aplicables.
