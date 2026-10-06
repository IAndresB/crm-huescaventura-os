# Expected correctivo independiente H4-015/016-F23

Base publicada exacta `32e85d1bc6631771f15c0a3817861a1ef3bef1e9`. Observación estática independiente de dirección: ejecución parcial acreditada dentro de intento incierto. No es todavía FAIL ejecutado. Expected original y antecedentes inmutables; final3 acredita sus casos, no F23.

Autoridad: Tasks H4-015/016, §§2.1–2.3/6/7; SPEC-FR-ECON-007 (§10.9), AC-035 (§24.2), AC-057 (§24.3); SM-RF-04/05/06 (§11.1), SM-FORB-18 (§17), DM-INV-040, G1–G6, Plan T05/T07/T08 (§7.2), D039/TTE. Unión de filas asignadas conservada íntegramente en expected-TSK-H4-015-016.md; se reejecuta su matriz completa, sin reducir guardas. D019/D020/D023 y derecho persistido siguen separados de fondos.

Fixture ordinario real local: contratación/conversión H2, cobro y conciliación H3, determinación H4-013 de causa proveedor y derecho200, Refund, aprobación exacta Administrador mediante HA/TTE, Incident existente e intento incierto identificado I sobre [0,80),80. Datos y pruebas B07 sintéticos revisados. Privilegios solo instalación/observación/inyección técnica. Cada nueva evidencia identifica hecho, origen, contraparte, medio, fecha, referencia y porción; el vínculo a I es explícito en la actuación verificada. No inferencia por mera inclusión numérica.

|ID|Fuente|Precondición/acción|Expected, conservación y prohibiciones|Evidencia necesaria|
|---|---|---|---|---|
|C01|RF04/05/06; AC035/057|Intento I80; salida inequívoca20 [0,20) del mismo intento|Una salida; ejecutado20; pendientes derecho/autorizado180; reserva60 [20,80); I no completamente resuelto; original80/identidad y autorización conservados|Input, anterior/posterior, SQL y proyección fondos|
|C02|RF05; T05|Registrar ordinariamente esa20 antes de resolver su pertenencia a I|Rechazo; reserva80 intacta; no doble consumo ni omisión del vínculo|Error original y snapshot|
|C03|RF06|Después C01, prueba nueva no ocurrió resto60|Solo reserva restante retirada; ejecutado20/pendiente180; historia; sin extinguir derecho ni nueva autorización/reintento inferido|Hechos/revisiones/fondos|
|C04|RF04/06|Después C01, salida nueva60 [20,80) del mismo I|Ejecutado80, reserva0, pendientes120; dos hechos únicos, I original80 recuperable|SQL/historia|
|C05|RF04/05/06; F13|Porción ajena [100,120), otro pago/conciliación/asignación/intento, importe inconsistente, destinatario o medio distinto|Rechazo o pendiente sin liberar ninguna reserva; mera inclusión no sustituye prueba pertinente|Retirada individual de cada guarda y snapshot|
|C06|G2/G3/G6|Prueba ausente/candidata/antigua/cruzada; autorización material inválida; cierre Incident|Sin ejecución inferida ni liberación del resto; guardas originales exactas conservadas|Contratos ordinarios y errores|
|C07|G5; IDEMP002|Replay, mismo hecho nueva operación/evidencia, revisión técnica de fondos; identidad conflictiva|Una salida/consumo/historia material; reautorizar replay; E2 material distinto; hecho no enlaza otro intento por replay|Resultados durables y recuentos SQL|
|C08|RF04/06; T05/T07|Parciales disjuntas e interiores del mismo I|Solo intervalos acreditados dejan incertidumbre, restantes visibles; nunca salida+reserva en misma porción|Intervalos y suma exacta|
|C09|G4/G5; T05/T07|Dos parciales solapadas/disjuntas, registro parcial vs resolución resto, consumo ajeno vs reserva restante; ambos órdenes|Overlap PG observado, locks/versiones; sin overwrite, doble salida o consumo de reserva; partes independientes continúan|Sesiones PG independientes y waiting observado|
|C10|T07; V-AT|Fallos en movimiento/revisión/historia/resultado/fondos y COMMIT, retry; respuesta perdida tras COMMIT real|Todo interno o nada, retry válido; recuperación durable sin duplicar; ningún rollback externo prometido|Snapshots íntegros, streams/status|
|C11|G1–G6; D039/TTE; V-DAT|F1/F2/contexto falso/ausente, revocación/inhabilitación/replay; CRUD; scope ajeno|Denegación/no enumeración; permisos mínimos privados/FORCE RLS/search_path/owners/ACL sin ampliación; finalcheck previo conservado|SQL y pruebas anteriores más focales correctivas|
|C12|V-MIG|Fresh, upgrade46 poblada (Refund parcialmente ejecutada e intento incierto), falloDDL/rollback/retry|46 migraciones y fuentes/expected/health byte intactos; datos/historia originales intactos; cuerpos cambiados declarados, atributos anteriores conservados|Hashes, catálogo/SQL, logs/advisors loopback|
|C13|V-EVI/regresión|SHA congelado definitivo|Matriz anterior completa+correctiva+fullPG/unit/health separado/gates; base1788/138/health1; cero materialFAIL/skipped/cancelled, cómputo único|SHA, logs completos, matriz/hashes|

Guardas retiradas individualmente: identidad I existente y vigente; vínculo acreditado; nueva evidencia revisada y scope; cantidad/suma exacta; contención y no solapamiento ejecutado; pago/conciliación/asignación; destinatario/método; autorización exacta/derecho vigente; revisión actual/actor/sesión/contexto. Cada retirada conserva estado previo y resto protegido. F13 se reejecuta sin alterar su test.

Integración mínima previa: Refund consume derecho H4-013 existente sin recalcular. Resolución registra hecho B07 dentro de identidad I y conserva porción original/historia; T07 actualiza progreso y protección común de fondos H3 juntos. No ledger, autorización ni Incident paralelos. La prueba del resto es independiente del hecho parcial. Cambios persistidos solo forward; atributos/cuerpos modificados se declaran según inspección real.

H4 IN PROGRESS; cierre H4-015/016 pendiente de F23 hasta retest completo; H4-017+/H5/H6 NOT STARTED. H4-019/H5-014/H6-004/H6-016 NO ACREDITADAS. DM-PENDING-005 intacto. Sin datos reales/audio/retención inventada/hosted/Production/efectos externos. STOP tras cierre correctivo.
