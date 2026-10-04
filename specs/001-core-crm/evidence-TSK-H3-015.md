# Evidencia TSK-H3-015 — Salida de economía operativa

**H3 COMPLETED local/aislado. TSK-H3-001–015 COMPLETED local/aislado. H4–H6 siguen NOT STARTED.**

## A. Base, autoridad y alcance

Base inicial `0727948b5e0ec7725034c09447d495c298ccbe77` tras `git fetch origin`:main,árbol limpio,HEAD==origin/main exactos. Estado previo:H0 COMPLETED técnico/local/aislado;H1/H2 COMPLETED local/aislado;H3 IN PROGRESS;001–014 completadas y015 NOT STARTED;H4–H6 NOT STARTED;H3-014-F01–F12 CLOSED;0 materiales abiertos;37 migraciones. Health-check independiente conservado;hosted H2/H3 no acreditados;Production no autorizada.

Ficha H3-015 completa,Tasks§2.2/2.3/6/7,Plan§§9–10 y fila H3 autoritativos. [Expected independiente](expected-TSK-H3-015.md):E01–E26 y138 filas únicas de Tasks§6, congelado antes de auditoría/regresión en `f7c44abbf1e47b3aea14b7bf8a3d3988d1259dba`,SHA256`d2506ea16ffd1b35050b0c70ff3069f0429aa297964eae1ab5246aaf21d15098`. Ninguna fila nominativa H3-015 en§6; se consolidan las asignaciones de sus dependencias. Los siete expected previos siguen intactos;540 casos normativos se corresponden uno a uno con540 filas observed individuales. [Correspondencia](../../tests/fixtures/h3-015/normative-correspondence.json) conserva ID/archivo/asignación/hash de cada fila; no marca globalmente satisfechas comprobaciones compartidas futuras.

**SHA exacto probado de la regresión de salida:`f7c44abbf1e47b3aea14b7bf8a3d3988d1259dba`.** Producto/verificadores/migraciones son byteidénticos a la base0727948; el primer commit solo congela expected. El SHA final publicado pertenece al commit documental sucesor y se identifica después del push en el informe Git final. No se confunden SHA probado y SHA documental.

Node24.21.0/pnpm11.19.0/PostgreSQL17.11 nativo; runtime ordinario F1/F2 con roles owner/migración/observador separados. Storage oficialH1 fuente`5def1dfc15ab7f08fe271c7d1e70542424524e4e`,backend file privado/loopback/credenciales efímeras. Fixtures y todos los movimientos monetarios de prueba exclusivamente sintéticos y aislados. No transferencia,contacto a proveedor ni fondos/datos reales procesados. Registro acreditado local representa el contrato del hecho externo; el fixture nunca se presenta como actividad financiera real.

## B. Inventario por tarea H3-001–015

Cada fila conserva prueba y publicación de su bloque; la regresión actual revalida todas desde f7c44ab. Los Fxx son por bloque compartido por implementación/verificación:52 encontrados/52CLOSED/0 materiales abiertos, sin contarlos dos veces. [Inventario completo](../../tests/fixtures/h3-015/task-inventory.json) añade commit congelado/hash de expected,rutas exactas y familias. Para007/008 publicación final2471d04 incluye cierre inicialc56bdc2 y normalización4abdf6c; producto39a31c0 intacto.

|Tarea|Estado|SHA exacto probado histórico|SHA final publicado del bloque|Expected / evidencia|Focal / matriz / defectos|Migración y límites|
|---|---|---|---|---|---|---|
|H3-001|COMPLETED local/aislado|`a2bbcd0cf85ebd3f0ecdf9d0383d7d54df3ae9a0`|`47e7c81eacf3bd9c97cb729b3edf1e482ec0d158`|[Expected 001/002](expected-TSK-H3-001-002.md); [evidencia 001](evidence-TSK-H3-001.md)|[Focal 001](../../tests/integration/postgres-h3-001.test.ts), [matriz 002](../../tests/integration/postgres-h3-002.test.ts); 60 casos; [Fxx](../../tests/fixtures/h3-002/defects.md);4/4/0 por bloque, no sumar por tarea|`20261002233922_h3_expected_obligations.sql`; frontera histórica según evidencia; integraciones posteriores H3 detalladas abajo, H4–H6/global pendientes|
|H3-002|COMPLETED local/aislado|`a2bbcd0cf85ebd3f0ecdf9d0383d7d54df3ae9a0`|`47e7c81eacf3bd9c97cb729b3edf1e482ec0d158`|[Expected 001/002](expected-TSK-H3-001-002.md); [evidencia 002](evidence-TSK-H3-002.md)|[Focal 001](../../tests/integration/postgres-h3-001.test.ts), [matriz 002](../../tests/integration/postgres-h3-002.test.ts); 60 casos; [Fxx](../../tests/fixtures/h3-002/defects.md);4/4/0 por bloque, no sumar por tarea|`20261002233922_h3_expected_obligations.sql`; frontera histórica según evidencia; integraciones posteriores H3 detalladas abajo, H4–H6/global pendientes|
|H3-003|COMPLETED local/aislado|`b4f26877a3be3877852129471719cd6dfb512c15`|`db37469a901d7543ae10e2ce42a95824b33d24ce`|[Expected 003/004](expected-TSK-H3-003-004.md); [evidencia 003](evidence-TSK-H3-003.md)|[Focal 003](../../tests/integration/postgres-h3-003.test.ts), [matriz 004](../../tests/integration/postgres-h3-004.test.ts); 78 casos; [Fxx](../../tests/fixtures/h3-004/defects.md);8/8/0 por bloque, no sumar por tarea|`20261003093202_h3_customer_payment_reconciliation.sql`; frontera histórica según evidencia; integraciones posteriores H3 detalladas abajo, H4–H6/global pendientes|
|H3-004|COMPLETED local/aislado|`b4f26877a3be3877852129471719cd6dfb512c15`|`db37469a901d7543ae10e2ce42a95824b33d24ce`|[Expected 003/004](expected-TSK-H3-003-004.md); [evidencia 004](evidence-TSK-H3-004.md)|[Focal 003](../../tests/integration/postgres-h3-003.test.ts), [matriz 004](../../tests/integration/postgres-h3-004.test.ts); 78 casos; [Fxx](../../tests/fixtures/h3-004/defects.md);8/8/0 por bloque, no sumar por tarea|`20261003093202_h3_customer_payment_reconciliation.sql`; frontera histórica según evidencia; integraciones posteriores H3 detalladas abajo, H4–H6/global pendientes|
|H3-005|COMPLETED local/aislado|`3113028f26a906f2b4f6935ae0bb59877c59d74d`|`ac10866027f08d43a708a22f3238d684a1ffc100`|[Expected 005/006](expected-TSK-H3-005-006.md); [evidencia 005](evidence-TSK-H3-005.md)|[Focal 005](../../tests/integration/postgres-h3-005.test.ts), [matriz 006](../../tests/integration/postgres-h3-006.test.ts); 75 casos; [Fxx](../../tests/fixtures/h3-006/defects.md);8/8/0 por bloque, no sumar por tarea|`20261003110048_h3_payment_allocation_funds.sql`; frontera histórica según evidencia; integraciones posteriores H3 detalladas abajo, H4–H6/global pendientes|
|H3-006|COMPLETED local/aislado|`3113028f26a906f2b4f6935ae0bb59877c59d74d`|`ac10866027f08d43a708a22f3238d684a1ffc100`|[Expected 005/006](expected-TSK-H3-005-006.md); [evidencia 006](evidence-TSK-H3-006.md)|[Focal 005](../../tests/integration/postgres-h3-005.test.ts), [matriz 006](../../tests/integration/postgres-h3-006.test.ts); 75 casos; [Fxx](../../tests/fixtures/h3-006/defects.md);8/8/0 por bloque, no sumar por tarea|`20261003110048_h3_payment_allocation_funds.sql`; frontera histórica según evidencia; integraciones posteriores H3 detalladas abajo, H4–H6/global pendientes|
|H3-007|COMPLETED local/aislado|`39a31c03bdd091e6b659952193b75493ded06f4f`|`2471d044662026d52bf63b7d5064fb924d4f8127`|[Expected 007/008](expected-TSK-H3-007-008.md); [evidencia 007](evidence-TSK-H3-007.md)|[Focal 007](../../tests/integration/postgres-h3-007.test.ts), [matriz 008](../../tests/integration/postgres-h3-008.test.ts); 65 casos; [Fxx](../../tests/fixtures/h3-008/defects.md);8/8/0 por bloque, no sumar por tarea|`20261004161012_h3_provider_invoice_documentary.sql`; frontera histórica según evidencia; integraciones posteriores H3 detalladas abajo, H4–H6/global pendientes|
|H3-008|COMPLETED local/aislado|`39a31c03bdd091e6b659952193b75493ded06f4f`|`2471d044662026d52bf63b7d5064fb924d4f8127`|[Expected 007/008](expected-TSK-H3-007-008.md); [evidencia 008](evidence-TSK-H3-008.md)|[Focal 007](../../tests/integration/postgres-h3-007.test.ts), [matriz 008](../../tests/integration/postgres-h3-008.test.ts); 65 casos; [Fxx](../../tests/fixtures/h3-008/defects.md);8/8/0 por bloque, no sumar por tarea|`20261004161012_h3_provider_invoice_documentary.sql`; frontera histórica según evidencia; integraciones posteriores H3 detalladas abajo, H4–H6/global pendientes|
|H3-009|COMPLETED local/aislado|`30314215efd170eef3a8a3eb038aa5c9a28358e5`|`028cbaef887acf68a23bffd2069b91c477ac7e0c`|[Expected 009/010](expected-TSK-H3-009-010.md); [evidencia 009](evidence-TSK-H3-009.md)|[Focal 009](../../tests/integration/postgres-h3-009.test.ts), [matriz 010](../../tests/integration/postgres-h3-010.test.ts); 69 casos; [Fxx](../../tests/fixtures/h3-010/defects.md);5/5/0 por bloque, no sumar por tarea|`20261004175435_h3_managed_client_funds_documentary.sql`; frontera histórica según evidencia; integraciones posteriores H3 detalladas abajo, H4–H6/global pendientes|
|H3-010|COMPLETED local/aislado|`30314215efd170eef3a8a3eb038aa5c9a28358e5`|`028cbaef887acf68a23bffd2069b91c477ac7e0c`|[Expected 009/010](expected-TSK-H3-009-010.md); [evidencia 010](evidence-TSK-H3-010.md)|[Focal 009](../../tests/integration/postgres-h3-009.test.ts), [matriz 010](../../tests/integration/postgres-h3-010.test.ts); 69 casos; [Fxx](../../tests/fixtures/h3-010/defects.md);5/5/0 por bloque, no sumar por tarea|`20261004175435_h3_managed_client_funds_documentary.sql`; frontera histórica según evidencia; integraciones posteriores H3 detalladas abajo, H4–H6/global pendientes|
|H3-011|COMPLETED local/aislado|`aaa1ce94ebae591225a1f64054d1001372ae6f7b`|`287392bf932567a8c7e0ad6f44fcf0eed8252644`|[Expected 011/012](expected-TSK-H3-011-012.md); [evidencia 011](evidence-TSK-H3-011.md)|[Focal 011](../../tests/integration/postgres-h3-011.test.ts), [matriz 012](../../tests/integration/postgres-h3-012.test.ts); 100 casos; [Fxx](../../tests/fixtures/h3-012/defects.md);7/7/0 por bloque, no sumar por tarea|`20261004185628_h3_provider_payment_accredited_outgoing.sql`; frontera histórica según evidencia; integraciones posteriores H3 detalladas abajo, H4–H6/global pendientes|
|H3-012|COMPLETED local/aislado|`aaa1ce94ebae591225a1f64054d1001372ae6f7b`|`287392bf932567a8c7e0ad6f44fcf0eed8252644`|[Expected 011/012](expected-TSK-H3-011-012.md); [evidencia 012](evidence-TSK-H3-012.md)|[Focal 011](../../tests/integration/postgres-h3-011.test.ts), [matriz 012](../../tests/integration/postgres-h3-012.test.ts); 100 casos; [Fxx](../../tests/fixtures/h3-012/defects.md);7/7/0 por bloque, no sumar por tarea|`20261004185628_h3_provider_payment_accredited_outgoing.sql`; frontera histórica según evidencia; integraciones posteriores H3 detalladas abajo, H4–H6/global pendientes|
|H3-013|COMPLETED local/aislado|`fee9d9b0a35ee2b2dbbb57592a728014fb11c218`|`0727948b5e0ec7725034c09447d495c298ccbe77`|[Expected 013/014](expected-TSK-H3-013-014.md); [evidencia 013](evidence-TSK-H3-013.md)|[Focal 013](../../tests/integration/postgres-h3-013.test.ts), [matriz 014](../../tests/integration/postgres-h3-014.test.ts); 93 casos; [Fxx](../../tests/fixtures/h3-014/defects.md);12/12/0 por bloque, no sumar por tarea|`20261004201022_h3_own_economics_fee_cost_promotion_tarari.sql`; frontera histórica según evidencia; integraciones posteriores H3 detalladas abajo, H4–H6/global pendientes|
|H3-014|COMPLETED local/aislado|`fee9d9b0a35ee2b2dbbb57592a728014fb11c218`|`0727948b5e0ec7725034c09447d495c298ccbe77`|[Expected 013/014](expected-TSK-H3-013-014.md); [evidencia 014](evidence-TSK-H3-014.md)|[Focal 013](../../tests/integration/postgres-h3-013.test.ts), [matriz 014](../../tests/integration/postgres-h3-014.test.ts); 93 casos; [Fxx](../../tests/fixtures/h3-014/defects.md);12/12/0 por bloque, no sumar por tarea|`20261004201022_h3_own_economics_fee_cost_promotion_tarari.sql`; frontera histórica según evidencia; integraciones posteriores H3 detalladas abajo, H4–H6/global pendientes|
|H3-015|COMPLETED local/aislado|`f7c44abbf1e47b3aea14b7bf8a3d3988d1259dba`|Commit documental sucesor; SHA exacto en informe final Git|[Expected](expected-TSK-H3-015.md); esta evidencia|E01–E26:26/26;F01 auditor documental CLOSED; runner completo actual|Ninguna nueva;37 íntegras;STOP H4–H6|

Las limitaciones de las evidencias originales describen su momento: cobertura pendiente001/002 se integró en006; Allocation pendiente003/004 se integró005/006; cierre documental/factura/pago pendiente007–010 se integró localmente011/012; Fee pendiente se acreditó013/014. No se reescriben esos históricos. H3-010 conserva pruebas antiguas con frontera sintética segura; el positivo actual H3-012 R050 usa Provider Payment productivo local, sin doble de pago acreditativo. Ninguna de estas integraciones acredita H4/H5/H6 completo ni E2E-05 integral.

## C. Criterio de salida Plan §9, comparación individual

|Fundamento esperado|Observado vigente en la regresión actual|Referencia de comprobación|Resultado|
|---|---|---|---|
|B05 políticas/vencimientos|Policy/Schedule/Expected y obligación histórica;50/50/D020/excepciones/fail-closed|H3-002 R01–R24/R28–R32|PASS|
|Recepciones/conciliación|Detectado≠recibido≠propuesta≠validación;500/200/300, duplicados vs dos movimientos y rectificaciones|H3-004 R01–R41|PASS|
|Porciones y fondos no duplicados|Asignación/consumo/disponible/cobertura válida; varios pagos/destinos,80/80 nunca160|H3-006 R01–R55; H3-012 R046|PASS|
|Suplidos/documentos/pagos separados|B07 original/revisión/vínculos y Suplido por componentes; T07 integra Provider Payment local, no transferencia|H3-008;H3-010;H3-012 R039–R053|PASS|
|Honorarios/costes/promoción|Fee/Cost propios, estados, unknown, snapshots, novi@ modalidad concreta y Tararí interno|H3-014 R001–R070|PASS|
|Economía reservada|Denegación de scope ajeno y mínimo C01/C02/C03/C04/C06; cliente sin desglose reservado|H3 matrices privacidad;H3-014 R088/R089 y adicionales|PASS|
|Fiscalidad/tipos/mandato/datos ausentes|Bloqueo localizado; unknown y mandato ausente conservados, P16 no levantado|H3-002 guardas;H3-010 R10–R12;H3-014 R015/R030/R059–R065|PASS|
|Emisión fiscal excluida|Sin factura legal/numeración/motor fiscal ni autorización implícita|H3-012 R099;H3-014 R061–R065|PASS|
|PM-03|1000.01 =500.01+500.00, sin float/doble redondeo|H3-002 R01/R02|PASS|
|PM-08|+500.01→−500.01;−20.00→+20.00 enlazados, sin recalcular ni revertir banco|H3-006 R34/R35;H3-012 R062/R063|PASS|
|Refund/fianza completos para H4|Frontera y carrera completa pendientes H4-019; no cierre Booking/EconomicClosure|H3-006 R74;límites H3-011–014 y este bloque|PASS|

### Expected de salida E01–E26 frente a observado

|ID|Observado|Resultado|
|---|---|---|
|E01|H2-012 publicado y catorce fichas H3 completadas; inventario individual con commits reales, expected y evidencias recuperables.|PASS|
|E02|52 Fxx históricos:52 CLOSED,0 materiales abiertos; archivos originales/históricos entre757 archivos protegidos íntegros. H3-015-F01 del auditor temporal:CLOSED,0 materiales abiertos.|PASS|
|E03|37/37 hashes coinciden con publicaciones de cierre; sin ediciones posteriores. V-MIG actual reejecutó fresh37, upgrades poblados30→31→32→33→34→35→36→37 y rollback.|PASS|
|E04|H3-004 recepción/correspondencia parcial y H3-006 porciones/consumo/cobertura, replay y raíz compartida PASS en ejecución actual.|PASS|
|E05|H3-012 movimiento saliente, correspondencia, consumo, reevaluación Suplido, ajustes y AC063 PASS; sin transferencia externa.|PASS|
|E06|H3-006 R47–R55 y H3-012 R046: ambos órdenes y concurrencia80/80 sobre100 dejan80 consumidos/20 disponibles, nunca160; Expected no fondos/cobertura.|PASS|
|E07|H3-008/010/012 actuales: factura sin pago y pago sin factura abiertos; Programado paga0; conjunto completo resuelve Suplido sin cerrar Booking.|PASS|
|E08|H3-010 R19 y H3-014 R020:300 Suplido/200 Fee separados; snapshot propio solo Fee explícito, sin ingreso/coste inferido de fondos/pago.|PASS|
|E09|H3-002 R01 vigente:1000.01→500.01+500.00; interno500.005 preservado; sumas exactas y límites con céntimo impar.|PASS|
|E10|H3-006 R34/R35 y H3-012 R062/R063 vigentes:+500.01→−500.01 y−20→+20; original conservado; reversión bancaria no inferida.|PASS|
|E11|Privacidad H3 y F1/F2 actuales PASS: scope/actor ajenos no enumeran, proyección cliente sin Fee/costes/margen/historia interna.|PASS|
|E12|H3-014 R059–R065 y H3-012 R099 vigentes: IVA desconocido permanece desconocido, P16 no levantado, emisión/numeración excluidas.|PASS|
|E13|H3-010 R10–R12 y H3-014 R065 vigentes: mandato no inferido; null si ausente. Mandato positivo de prueba solo sintético/no legal.|PASS|
|E14|No comandos ni cambios de Refund/fianza; H4-019/carrera completa pendientes explícitos; H4 sin iniciar/preparar.|PASS|
|E15|Runner PostgreSQL nativo/Storage loopback con credenciales efímeras; todos los importes/movimientos/evidencias de ensayo sintéticos, no actividad financiera real.|PASS|
|E16|No banco/PSD2/conector/datos/fondos reales acreditados; ningún contacto a proveedor ni transferencia en este bloque.|PASS|
|E17|No ejecución hosted; cuatro artefactos health-check protegidos y byteidénticos. Health-check separado, no prueba hosted H2/H3.|PASS|
|E18|Production no autorizada; puertas PLAN-AUTH/PENDING/ARCH/DM/BR conservadas en su alcance.|PASS|
|E19|H4–H6 conservan sus fichas NOT STARTED; H4-001 no iniciado ni preparado. STOP y nueva autorización humana requerida.|PASS|
|E20|Fila Plan§9 H3 comparada por fundamento en sección C; los componentes B05 y sus pruebas actuales cumplen salida únicamente local/aislada.|PASS|
|E21|F1/F2/D039/TTE incluidos literalmente: R01–R25 H0-012 actual, final checks y COMMIT privado; RLS/FORCE RLS/ACL/owners/search_path/API/runtime/append-only PASS.|PASS|
|E22|H3-014 R001/R015–R024/R066–R067: unknown≠0, fases separadas, Fee−costes conocidos, PM09/histórico inmutable tras nuevas versiones.|PASS|
|E23|H3-014 R025–R058:novi@A150, modalidad ausente pending,15/16/17 asistentes intactos, Tararí interno15/3.80 y extras175/325 costeunknown.|PASS|
|E24|SHA f7c44ab:1215/1215 PostgreSQL,117/117 unitarias; siete familias H3 literalmente incluidas con540 casos normativos y reproducers/focales; gates PASS,0 FAIL/skipped/cancelled/todo.|PASS|
|E25|Diff con base limitado a expected/evidencia/logs/manifiestos de cierre y tres documentos de coordinación;0 src/producto/tests lógicos/migraciones modificados.|PASS|
|E26|757 archivos protegidos comparados byte a byte: fuentes, siete expected previos/14 evidencias/FAIL/históricos/health-check/producto/migraciones intactos;138 filas Tasks§6 copiadas exactas en expected individuales.|PASS|

[Resultado estructurado](../../tests/fixtures/h3-015/exit-matrix.json):26/26 PASS. Este es un contraste documental de salida, separado del cómputo Node de regresión; no sustituye los casos individuales ni agrega dos veces sus tests.

## D. T05 — Conciliar/asignar/ajustar

[H3-003](evidence-TSK-H3-003.md)/[004](evidence-TSK-H3-004.md) acreditan Customer Payment, contraste autorizado y Reconciliation separada:500 recibidos/200 comprobados/300 pendientes, propuestas sin uso, identidad/replay,dos transferencias reales similares, incidencias localizadas y rectificación enlazada. [H3-005](evidence-TSK-H3-005.md)/[006](evidence-TSK-H3-006.md) añaden porciones reconstruibles por origen/intervalo/destino/finalidad y revisión de fuente; fondos válidos habilitan cobertura parcial/completa de obligación.

Received≠Reconciled≠Allocated≠Consumed≠Available. R01–R09 impiden cobertura desde Expected/detección/recepción sin correspondencia/propuesta/porción suspendida. Varios pagos pueden cubrir una obligación y un pago varios destinos; saldo no asignado conserva ausencia de destino. Raíz `payment-root:<UUID>` serializa antes de hijos: R47/R48/R49 prueban A→B/B→A/solapamiento80+80 sobre100, sin hijos previos, mismo/distinto destino/clave; solo80durables y20disponibles. R52 integra varias raíces en obligación sin sobrecobertura; R55 serializa contra incidencia/rectificación. Replay autorizado no vuelve a consumir/cubrir; revisión obsoleta y material distinto rechazan. Fallos e historia/coverage/consumo/reparto/COMMIT revierten conjuntamente; ajustes R34/R35 conservan original e inverso exacto PM08. PM11/12/13 y D019 permanecen acreditados sin alterar derechos. **T05 PASS local/aislado; sin transferencia real.** Carrera completa Refund/fianza pendiente H4-019.

## E. T07 — Registrar salida económica real

[H3-011](evidence-TSK-H3-011.md)/[012](evidence-TSK-H3-012.md):Provider Payment guarda obligación prevista/confirmada,intención Programada, movimiento individual de salida acreditado, porciones utilizadas, correspondencia saliente, parciales/saldo,incidencia,corrección y retiro de programación. T07 registra hecho/historia/resultado/consumo/reevaluación material en unidad común. Obligación500,pago200,saldo300; segundo movimiento300 completa sin duplicar primero. Programado/Approval/Invoice/Allocation no son Pagado.

Pago sin factura se conserva con Suplido abierto; factura posterior no duplica salida. R050 integra fondos/factura vinculada/pago productivo local/correspondencia/servicio/sin discrepancia y resuelve documentalmente Suplido, sin cierre Booking/fiscalidad/mandato. R046 conserva80/80 sobre100; porciones dudosas/Fee/Booking ajena no financian Suplido. AC063 registra realidad anómala con revisión y momento real, nunca aprobación retroactiva. Resultado incierto no es Pagado ni fallo definitivo; no retry ciego. PM08 no finge reversión bancaria ni disponibilidad liberada por cambiar un campo.

T08/D039 donde aplica: fachada TTE estrecha,login/pool exclusivo,material aprobado exacto,final check después de esperas/trabajos y COMMIT/ROLLBACK sin SQL/control intercalado del solicitante. H0-012 R01–R25 y H3-012 R020–R024/R077 actuales conservan controles y concurrencia de reserva. **T07 PASS local/aislado.** La ejecución externa precede al registro; este bloque solo verifica el modelo con hechos sintéticos y no provoca transferencias.

## F. Regresión de salida, migraciones, seguridad y preservación

Comandos ejecutados nuevamente en f7c44ab:`pnpm install --frozen-lockfile`;`pnpm run typecheck`;`pnpm run lint`(incluye check:boundaries/imports);`pnpm test`;`pnpm run build`;`pnpm audit --prod`;`POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres`;`git diff --check` y comprobación staged antes de commit. [Manifiesto](../../tests/fixtures/h3-015/closure-verification.json),[PostgreSQL](../../tests/fixtures/h3-015/closure-postgres.log),[unitarias](../../tests/fixtures/h3-015/closure-unit.log),[gates](../../tests/fixtures/h3-015/gate-results.json).

**PostgreSQL1215/1215 PASS;unitarias117/117 PASS;total1332 tests Node ejecutados,0 FAIL/0skipped/0cancelled/0todo.** Los focales/matrices/reproducers H3 siguientes están literalmente incluidos por el runner:lee todos los `tests/integration/*.test.ts` y pasa las rutas a Node sin selección; no se ejecutan otra vez ni se suman de nuevo. Los540 casos normativos y las agrupaciones complementarias se identifican dentro de1215. E01–E26 son26 comparaciones documentales adicionales, no otra suite funcional.

|Familia H3|Casos normativos|Archivos ejecutados dentro de runner completo|Resultado/cómputo|
|---|---|---|---|
|001/002|60|`postgres-h3-001.test.ts`; `postgres-h3-002-defects.test.ts`; `postgres-h3-002.test.ts`|PASS; incluidos en1215, no sumar de nuevo|
|003/004|78|`postgres-h3-003.test.ts`; `postgres-h3-004-defects.test.ts`; `postgres-h3-004.test.ts`|PASS; incluidos en1215, no sumar de nuevo|
|005/006|75|`postgres-h3-005.test.ts`; `postgres-h3-006-defects.test.ts`; `postgres-h3-006.test.ts`|PASS; incluidos en1215, no sumar de nuevo|
|007/008|65|`postgres-h3-007.test.ts`; `postgres-h3-008-defects.test.ts`; `postgres-h3-008-provider-identity.test.ts`; `postgres-h3-008.test.ts`|PASS; incluidos en1215, no sumar de nuevo|
|009/010|69|`postgres-h3-009.test.ts`; `postgres-h3-010-defects.test.ts`; `postgres-h3-010.test.ts`|PASS; incluidos en1215, no sumar de nuevo|
|011/012|100|`postgres-h3-011.test.ts`; `postgres-h3-012-defects.test.ts`; `postgres-h3-012.test.ts`|PASS; incluidos en1215, no sumar de nuevo|
|013/014|93|`postgres-h3-013.test.ts`; `postgres-h3-014-defects.test.ts`; `postgres-h3-014.test.ts`|PASS; incluidos en1215, no sumar de nuevo|

V-MIG PASS vigente: fresh37 enH3-014 R090;upgrade poblado36→37 R091 con Booking/B07/Allocation/Invoice/Suplido/ProviderPayment500 anteriores;rollback R092;upgrades históricos H3-002 R50,H3-004 R71,H3-006 R69,H3-008 R61,H3-010 R67,H3-012 R096 reejecutados con su cadena congelada. Los IDs/snapshots/importes/historia/bytes y owners/ACL/RLS/FORCE RLS/policies/functions/triggers/roles se contrastan antes/después. [Integridad](../../tests/fixtures/h3-015/migration-integrity.json):37/37 coinciden con publicación de su hito y cero commits que las alteren después;orden íntegro. **0 migraciones nuevas/0 editadas.**

Seguridad de salida actual:F1/F2 binding/firmas/contexto/actor/expiry,generaciones,D039/TTE,roles mínimos NOLOGIN/NOBYPASSRLS con owners separados,FORCE RLS,search_path explícito,APIs estrechas y append-only. Runtime no obtiene DML económico general;replay se reautoriza. Privacidad por scope y finalidad:denegación sin enumeración de clientes/Bookings/documentos/movimientos ajenos;cliente/Provider/Contact/contexto externo no obtienen economía reservada. No seguridad hosted acreditada.

[Baseline](../../tests/fixtures/h3-015/protected-baseline.json):757 archivos protegidos byteidénticos al SHA probado, incluyendo src,tests/scripts lógicos,37 migraciones,fuentes aprobadas,7expected,14evidencias yFAIL originales,artefactos health-check. El runner regenera únicamente dos logs corregidos H2-011:se guardaron antes fuera del repo y se restauraron byte a byte tras comprobar ejecución; no sustituyen FAIL originales. Transcripciones actuales crudas se conservan íntegramente en `closure-*-raw.json` con SHA256 y exitCode; los `.log` de presentación solo normalizan blancos al final para diff-check, sin alterar resultados. Ninguna evidencia histórica se edita.

## G. Informe consolidado y pendientes

|Modelo|Hecho propio y frontera preservada|
|---|---|
|Expected Payment / Policy / Schedule|Obligación/vencimiento con bases/versiones civiles históricas; no dinero. D020:referencia20,antes12 y todo13 ordinario;desde14 proximidad100%;día límite completo.|
|Customer Payment|Movimiento detectado individual y recepción contrastada separada; desconocidos no inventados.|
|Reconciliation|Propuesta y validación humanas/evidenciadas distintas; parcial200 no concilia los300 restantes.|
|Payment Allocation|Porción/origen/destino/finalidad/asignación/consumo/disponible/cobertura;sin segundo ledger/doble uso.|
|Provider Invoice|Necesidad sin archivo;original B07,Recibida/Revisada/Vinculada/Incidencia;porciones documentales y corrección,no pago/fiscalidad.|
|Suplido|Fondos ajenos por cliente/proveedor/servicio;componentes independientes y cierre documental evaluado,no Booking.|
|Provider Payment|Programación y salida acreditada/saldo/incidencia separados;modelo productivo local,no transferencia iniciada por CRM.|
|Fee/Honorarium|Ingreso propio solo por regla/base/fuente/version explícitas;no total gestionado.|
|Internal Cost|Coste propio atribuible,previsto/confirmado/real;unknown≠zero,no Provider Payment automático.|
|Snapshot|Componentes/unidades/tarifas/precio calculado/final/bases/fases/versions intactos;PM09/AC085 tras cambios de maestros.|
|Promotion|Única automática novio/a gratis,>=15/pack completo/modalidad concreta;A150/B120 novioA→150,sin media,asistentes/deudas intactos;sin modalidad pending.|
|Tararí|Interno2copas,total comercial15/coste estándar total3.80;Extra25=175/Extra50=325,costes/rentabilidad definitivos unknown;sin proveedor/Suplido/factura interna.|

Siguen pendientes en sus ámbitos:Refund completo,fianza completa,carrera Refund/fianza con fondos e integraciónH4-019;confirmación/operaciónH4 e integraciónH4-021;cierres Booking/Commercial/Operational/EconomicClosureH5,H5-014/H5-016;H6 integrado,H6-005/H6-007/H6-016/H6-017;E2E-05 completo;costes reales upsellsTararí,tipos fiscales no verificados/fiscalidad profesional,mandato real,facturación legal;conectores/banco/PSD2/fondos/datos reales;hosted H2/H3 yProduction.

PLAN-AUTH-001–006 PENDING globalmente;PLAN-PENDING-003 PARTIALLY RESOLVED;ARCH-PENDING/DM-PENDING/BR-PENDING vigentes conservados, incluidos recuperación/continuidad/privacidad/retención y DM-PENDING-002/005/006,BR-PENDING-021/022/033/034/035. Resoluciones D018–D020/PLAN-PENDING-001/002/004 conservadas en sus ámbitos. Catálogo/tarifas/costes/capacidades/prioridades/plazos/referencias/zona reales no acreditados. Health-check independiente intacto,fuera deH0–H6,sin equivalencia con pruebas funcionales hosted. Production no autorizada.

## H. Conclusión y STOP

H3-015:1 defecto encontrado/1CLOSED/0 materiales abiertos;histórico H3:52/52CLOSED,0 materiales abiertos. [Registro](../../tests/fixtures/h3-015/defects.md):F01 del auditor temporal de coordinación,parser de encabezados###/####. FAIL original transcrito y reproducer capturado conservados;comparación corregida125 fichas,solo015 cambia y124 intactas. Sin defecto de producto/migración ni cambio de verificador funcional. No hubo defecto material que requiriese reparar producto ni cambio de verifier/negocio. El cambio normal de estado/coordinación refleja la evidencia actual;se conserva el estado anterior en Git y registros históricos.

**H3 COMPLETED local/aislado. H4–H6 siguen NOT STARTED.** H3-001–015 COMPLETED local/aislado. Siguiente fase documentalmente identificada:H4 — Operación,cambios y cancelación. H4-001/H4-002 y todas sus tareas siguen NOT STARTED;no iniciadas ni preparadas. Continuidad exige nueva autorización humana. STOP obligatorio tras publicar este cierre.
