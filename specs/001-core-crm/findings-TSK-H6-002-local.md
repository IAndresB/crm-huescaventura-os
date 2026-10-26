# TSK-H6-002 — Hallazgos, FAIL y sucesores

Sin cambios de producto, migraciones, permisos ni contratos. Cero defectos materiales de producto observados. La aceptación final exige auditoría independiente y custodia.

| Hallazgo | Original conservado | Causa y correctivo instrumental | Sucesor |
|---|---|---|---|
| H6002-I01 | Intento2026-10-25T22-11-14.775Z, F04 FAIL | Comparación de replay incluía `last_human_activity_at`, que debe avanzar con actividad humana válida. Comparación de datos/historia/resultado separa exclusivamente tabla de épocas de identificación; no se alteró expected de negocio. | Intento22-12-02.036Z F04 PASS y sucesores; se conservan épocas/fechas originales en logs del FAIL. |
| H6002-I02 | Mismo intento, F11 FAIL | Fixture intentaba provisionar segundo Administrador, correctamente rechazado por singleton normativo. Se usa único actor sintético cambiando temporalmente su ámbito con rol migración, nueva sesión y restauración; no se modifica política ni singleton. | F11 PASS desde22-12-02.036Z. |
| H6002-I03 | Intento22-12-34.990Z, F13 FAIL;141PASS/1FAIL | Monitor consultaba `pg_stat_activity` con rol migración, sin visibilidad de espera ajena. Se cambia solo monitor a conexión bootstrap de observación, manteniendo operaciones de aplicación en runtime. | Intento22-13-30.154Z14/14PASS: dos sesiones esperando Lock en ambos órdenes, una ganadora y Booking=1. |

El primer intento conserva10PASS/2FAIL. El segundo12PASS sin F13/F14 aún. El tercero conserva141PASS/1FAIL, incluidas128 regresiones PASS. Los sucesores focales14/14 no convierten el FAIL histórico en PASS ni duplican128 casos. No hay SKIP en las baterías focal/regresión de este candidato. Una prueba unitaria histórica SKIP, si existiese en la salida, debe informarse literalmente; los logs unitarios de este candidato muestran212PASS y0SKIP.

Los fallos controlados de F06/F14 son escenarios negativos deliberados: se espera el error inyectado y se verifica rollback o recuperación según si COMMIT ocurrió. No son fallos del runner. DM-PENDING-005 permanece OPEN; H6 IN PROGRESS; no se acredita UI, integración real, efecto externo ni Hosted/Production.
