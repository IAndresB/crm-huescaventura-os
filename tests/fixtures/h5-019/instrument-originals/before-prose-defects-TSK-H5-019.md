# TSK-H5-019 — Defectos, limitaciones y pendientes

## Materiales de producto abiertos

**0 detectados en el alcance autorizado**, tras regresión2945/2945,3suplementos68y puertasg04. Los defectos históricos mantienen sus dictámenes originales;la situación vigente procede de los candidatos corregidos/auditados identificados,no de reetiquetarFAIL. No se modifica producto.

## Incidencias técnicas propias

|ID|Diagnóstico/resultado original|Acción y estado|Evidencia|
|---|---|---|---|
|H5019-I01|Postcheckg02 FALLIDAexit1:los9gatesexit0,pero snapshotincluyó01-phases.json que la regresión paralela actualizaba. Cero inputs funcionales/históricos cambiados.|CLOSED local:excluir solo outputs actualesH5-019 del snapshotgates;script anterior íntegro;g04 repite9gates y postcheckPASS.|02-gates.status/stdout/stderr,g02-gates.json,g02-postcheck-diagnosis.json;instrument-originals/test-h5-019-gates-before-postcheck.py;04-gates-repeat y g04-*|
|H5019-I02|Generador documental no ejecutó por SyntaxErroren expresión redundante de enlaces;sin efecto sobre producto/pruebas.|CLOSED local:se elimina expresión redundante;se conserva fuente anterior;dependencies/results/report se ejecutan válidamente.|consolidation-syntax-original.json;instrument-originals/consolidate-before-link-syntax.py|
|H5019-O01|preflight.json capturado después de crear inventario propio muestra árbol no limpio en ese instante posterior;el primerGitread-only era limpio.|Aclaración documental;original no sobrescrito. No cambio ajeno ni discrepancia deSHA.|preflight-timing-note.json;preflight.json;received-inventory.json.gz|
|H5019-O02|FichasH5-011NOTSTARTED,H5-013/015INPROGRESS desfasadas frente a baseCOMPLETED del director y sucesores publicados.|Observación documental abierta para revisión de coordinación;capacidad contrastada por pruebas/manifiestos/auditorías. No cambiarTasksni aceptación histórica para obtenerPASS.|dependencies-TSK-H5-019.md;dependencies.json con literal de cada ficha|

## Limitaciones conocidas

|ID|Alcance conservado|Consecuencia|
|---|---|---|
|L01|Solo sintético,PostgreSQL/Storage local ydoblesAuth/canales.|NoHosted/Production,pagos/envíos reales ni disponibilidad de proveedor.|
|L02|27exclusiones heredadas de selecciónsexta:24derivadas,2instrumentos históricamente excesivos aclarados,1V-MIG66extra.|2945es la selección acreditada,no todo archivo existente. Los2instrumentos no se declaranPASS.|
|L03|H5-009:dos logs originales no recuperados,sustitución documental autorizada;69diferencias históricas tablas yR67/R030.|Historia explícita,no ocultada;regresión actual aporta recibos nuevos, sin recuperar retroactivamente aquellos originales.|
|L04|AuxiliaresG ligados al acto fijo17oct10:00Z.|Otros actos exigen evidencia auxiliar explícita cronológicamente coherente;sin ajuste universal del reloj.|
|L05|Las suites históricas instalan versiones fijadas;casosI01–I03yV-MIG68 comprueban composición actual.|No afirmar que2945casos se ejecutan todos sobre68;la compatibilidad conserva identidad de cada input.|
|L06|Matrices26AC/187asignaciones Tasks§6.|187es inventario documental,no187pruebas;25ACsolo satisfacen tramo local;AC073restauraciónNOEJECUTADA.|
|L07|Algunas pruebas adversariales siembran corrupción sintética con rol técnico de ensayo.|No se presenta esa preparación como facultad del usuario ordinario;RLS/permisos se ensayan separadamente.|

## Decisiones y configuración pendientes

DM-PENDING-005 **OPEN**,conBR-PENDING014/015/019/020:retención,anonimización,eliminación,audio,tratamiento yuso real pendientes. PLAN-PENDING003solo conserva verificaciones técnicasPLAN-AUTH001–006globales,no nuevas elecciones de política. ARCH-PENDING001/BR-PENDING001/035conectores;ARCH-PENDING002continuidadProduction;DM-PENDING002/BR-PENDING021/022/033fiscalidad/suplidos/Tararí;DM-PENDING006/BR-PENDING012/013rolesfueraV1;BR-PENDING034tarjetaotrosfueraSPEC. Datos/configuración ausentes conservan bloqueo localizado,sinvaloresficticios. PLAN-PENDING001/002/004ySM-PENDINGresueltos no se reabren.

## Verificaciones reservadas

AC-073 **NO EJECUTADA**:H6-014/015deberán inventariar/restaurar/conciliar antes de reanudar;controles locales de incertidumbre/objetos no sustituyen ese escenario. AC056/088mantienenH6-017;AC057H6-006;AC061H6-007;AC067/068H6-016;AC074H6-015. Todos los recorridosH6yPLAN-AUTHantes de acceso real conservan sus estados globales. Hosted,Production,E2E,migraciones/recuperaciónintegradas,dispositivos/papel/entregarecuperación yprivacidadfinales no se ejecutan aquí.

No hay autorización indispensable ausente para el candidato documental local. Aceptación finalH5-019/H5yauditoríaindependiente pendientes. Commit/push/deploy quedan expresamente excluidos. **STOP.**
