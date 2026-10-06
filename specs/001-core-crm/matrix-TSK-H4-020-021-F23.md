# Matriz correctiva H4-020/021-F23 esperado / observado

Expected20casos lógicos congelados enbea403745b836fdca909211a46bdb2f58602fd13; SHA256ffc1441af9355121832aba56ed9237a513b46080e03f8ec4188967e9221cc511. No se modifica expected original/correctivo ni la matriz original69/23. Observado correctivo agrupado en29nuevos testsNode:9focales+9concurrencia(incl.parent)+8atomicidad(incl.parent)+3V-MIG/seguridad/advisors/preservación. Total2105=2076anteriores+29incluidos una vez;138unitarias/health1 separados. Los20casos no equivalen a20tests ni se suman otra vez. Retest final PASS sobre SHA exacto publicado `742b1e76c705519c467a77d18063248c12e02ff9`. F23 baseline3PASS/5FAIL material antesfix (8tests),originalconservado; direction finding static, no PostgreSQL de dirección.

Prefijo de archivos `tests/integration/postgres-h4-021-`. Fuentes y efectos exactos por fila están en expected correctivo y se mantienen independientes. Todo negocio por contratos ordinarios; SQL privilegiado instala/observa/inyecta exclusivamente fallos técnicos identificados.

|Caso|Fixture/acción|Observado|Ejecución/ref|
|---|---|---|---|
|C01|A: servicios y Booking cancelados por Modification; Booking reader Cancelada|read actual Cancelada;history[];applicablefalse|f23.test.ts A|
|C02|B: Confirmada previa y cancelación total aplicada|currentCancelada,historicalConfirmada,historyidéntica|f23.test.ts B|
|C03|C: material/revisión actual cancelada, manifest sin alcances activos|ORIGIN_REQUIRED:E3; snapshot10tablas idéntico|f23.test.ts C|
|C04|D:start Cancelada|rechazo sin efecto; baseline rechazo CRITICAL_SCOPE no refuta F23|f23.test.ts D|
|C05|E: exactHA/TTE+economicException después de cancelación|rechazo/rollback;reservation0,businesssnapshotidéntico|f23.test.ts E|
|C06|F: S2cancelado/S1usable y N2cancelada/N1vigente por Modification|Booking no Cancelada; independent service usable; N1coverage presente,N2excluida|f23.test.ts F + night|
|C07|G: resultado anterior durable y cancelación total|replayresultidéntico,historia1,currentCancelada,snapshotidéntico|f23.test.ts G|
|C08|scope crítico cancelado antiguo|rechazo upstream; no efecto; no refutación global por ese rechazo|f23.test.ts C08|
|C09|evaluate frente a apply total legítimo,2órdenes/2sesiones|cancelprimero rechazo; evalprimero historia; actualCancelada|f23-concurrency.test.ts evaluate|
|C10|start frente a applytotal,2órdenes|cancelprimero no start; startprimero historiapreparación,actualCancelada|f23-concurrency.test.ts start|
|C11|HA/TTE exacta frente a applytotal,2órdenes|cancelprimero origen/material obsoleto rechazado,reservation0; HAprimero historia,actualCancelada|f23-concurrency.test.ts HA|
|C12|replay anterior frente a applytotal,2órdenes|ambos autorizados mismarespuesta durable;sin duplicado;actualCancelada|f23-concurrency.test.ts replay|
|C13|fallos writeevaluation/op yCOMMIT ordinario/TTE|23514real;rollbacksnapshotigual,reservation0,retryConfirmada|f23-atomicity.test.ts evaluation/operation/commit/tte-commit|
|C14|cancelación total aprobada, versionBooking después servicios yCOMMIT|23514real;rollbacktotal incl.servicios, retrylegítimoCancelada|f23-atomicity.test.ts cancel-version/cancel-commit|
|C15|COMMITreal respuesta descartada→cancelación→replay|históricoConfirmada recuperado único,currentCancelada; disabledactor denegado sin reactivar sesión|f23-atomicity.test.ts lostresponse|
|C16|vacío51;50poblado Confirmada histórica/Canceladas yoriginalStorage|readCancelada,historyoriginal,originalbytesiguales,datosiguales,catalogatributos/OIDiguales|f23-migration.test.ts upgrade/fresh|
|C17|DDLfallo22012/retry50→51|rollbackcatálogo/datosidénticos;retryíntegro;2cuerposdeclarados|f23-migration.test.ts upgrade|
|C18|fresh51runtime/disabled/readprivacy másguardas heredadas63casos funcionales51|CRUD/helper42501,readactorDisableddenied,epochs sinactividad;F1/F2/F06/HA/TTE/D039 yalcancesajenos preservados|f23-migration.test.ts fresh + originalconcrete/test/security regressed|
|C19|50 migraciones/fuentes/expectedoriginal/correctivo/matriz69/norm23|hashesexactos;regresiónbase2076 incluida sin reinterpretarcomoF23|f23-migration.test.ts preservation + fullPG|
|C20|SHA742b1e76 clean publicado|Todos gatesPASS exactSHA publicado;status0 enfinal/manifest.json|final/gates|

Concurrencia:8ensayos=4escenarios×2órdenes; no8escenarios cada uno probado dos veces. Ambas admisiones F2 compatibles antes de raízBooking, dosPID/xid/sesiones/advisory/granted/blockingpids completos. Modification request/evaluation/approval altera material/revisiones antes del apply; comandos nuevos construidos después. No se atribuye confirmación completa durante esos pendientes upstream. Eval primero conserva lo registrado; cancelación legítima posterior domina currentPhase.

ReproducciónD/C08: rechazos upstream correctos no refutan los5fallosmaterialesA/B/C/E/G. G: replay ya preservaba resultado durable; el defecto era readactual falso. F24–F28: técnicos del verificador, originales conservados y retestdesarrolloPASS, no defectosmateriales de producto adicionales. F23 CLOSED; gates definitivos PASS.

STOP F23; H4 INPROGRESS;022+/H5/H6 NOTSTARTED;hosted/Production no;DM-PENDING005 abierto.
