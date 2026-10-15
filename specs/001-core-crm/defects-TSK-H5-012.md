# Defectos — TSK-H5-012, revisión independiente

## H5-012-F01 — OPEN / MATERIAL — calendario de noches conserva una fecha sustituida

**Resultado: FAIL reproducido sobre producto publicado `f063879d203330adb57d7e8fef3607ae796f52d5`, árbol `104b4ecba9dd72aa166410470b362a956ed866e2`. STOP de H5-012. Correctivo NO APLICADO.** No se modifica el cierre histórico de H5-011; esta revisión aporta evidencia material nueva que bloquea su aceptación independiente.

### Contrato independiente

- Expected congelado [C01, C02, C05 y C07](expected-TSK-H5-011-012.md): calendario desde hechos canónicos vigentes, reconstrucción tras cambios autorizados, referencia propia de cada noche y conservación de la historia anterior. Un cambio de fecha afecta al alcance correspondiente; una lectura no crea cambios.
- [SPEC-FR-COORD-008](spec.md): calendario operacional derivado de servicios/reservas/horarios/opciones/pagos/tareas/documentos/vencimientos canónicos, con fuente y certeza. ARCH-DEC-007 conserva Supabase como autoridad de agenda.
- [D020](../../docs/DECISIONS.md): noche referida al inicio de su alcance y cambio de fecha con reevaluación de dependientes e historia. No se afirma un error del algoritmo civil ni se han ejecutado sus intervalos completos en esta revisión.

### Reproducción real aislada

[Prueba independiente](../../tests/integration/postgres-h5-012-independent.test.ts), tercer test; [log completo original](../../tests/fixtures/h5-012/independent-20261015/independent-postgres.log), [recibo](../../tests/fixtures/h5-012/independent-20261015/independent-postgres.status.json), [observación estructurada](../../tests/fixtures/h5-012/independent-20261015/night-observation.json).

1. Crear cadena sintética real de contratación y Booking con noches, mediante soportes existentes. La noche escogida tiene fecha aceptada `2026-10-20`.
2. Leer el calendario autorizado y comprobar que esa noche es recuperable.
3. Solicitar, evaluar, aprobar y aplicar una Modification de esa noche a `2026-10-23`, por los contratos reales con pruebas sintéticas, F1/F2 y rol ordinario. No actualizar tablas de negocio mediante SQL de ensayo.
4. Corroborar con SQL observador que `b04_current_nights` devuelve `2026-10-23` y que existe la versión operacional 2 con esa fecha. El expected `2026-10-23` es el literal elegido antes de ejecutar el producto, no se deduce de su salida.
5. Volver a consultar H5-011 con `surface: calendar`, mismo Booking y destinatario Administrador.

| Hecho | Resultado observado |
|---|---|
| Fecha aceptada original | `2026-10-20`, conservada |
| Fecha canónica vigente después del cambio aprobado | `2026-10-23` |
| Versión operacional de la noche | 2, fecha `2026-10-23` |
| Única entrada del calendario que representa esa noche | `data.night_date = 2026-10-20` |
| Fuente y certeza declaradas de esa entrada | `crm_private.b04_nights`, `verified` |
| Resultado de la aserción independiente | `2026-10-20 !== 2026-10-23`, FAIL |

IDs exclusivamente sintéticos: Booking `0a1eb6d7-d91e-41a0-a949-eb79a365a48f`, servicio `c6eeab41-c9f1-46a6-b32e-d376d600b8ab`, noche `49b1007f-ab1a-4e6a-8c12-9e61961fa633`. La prueba y el log conservan la secuencia completa; los procesos se cerraron mediante los hooks y el runner oficial.

### Causa y alcance

La migración H5-011 incluye `b04_nights` del snapshot aceptado en el catálogo de hechos; no resuelve para esas entradas la versión operacional vigente. `composeProjection`, rama de calendario, añade esos hechos directamente mediante `entry`. En cambio, las entradas de servicio usan `modification_scope`. El dominio marca la noche original como `verified`, sin marcarla como histórica ni aportar una entrada vigente de esa noche.

La fuente canónica para la fecha vigente ya existe: `b04_current_nights`, definida en la migración histórica de Modification a partir de `modification_scope` de cada noche. La prueba demuestra que la modificación se aplicó y que el fallo está en la composición del calendario, no en la autorización o en un fixture cuya mutación quedó pendiente.

Impacto: una consulta nueva del calendario puede mostrar una noche en una fecha superada, incluso tras una modificación aprobada y confirmada, con certeza verificada. Esto impide acreditar C01/C02/C05/C07 en ese recorrido. No se atribuye divulgación de datos, escritura silenciosa, efecto sobre un proveedor ni un defecto de cancelación/servicio distinto de la noche probada.

### Correctivo mínimo propuesto y puerta de salida

En una tarea de implementación expresamente autorizada, componer las entradas de noche del calendario desde el estado canónico vigente (`b04_current_nights` o el contrato existente `modification_scope` para noche), preservando por separado el snapshot aceptado como historia. No cambiar D020, permisos, F1/F2, expected o migraciones históricas publicadas. Cualquier cambio persistente requiere la evolución versionada y las comprobaciones proporcionales que apruebe esa tarea.

Conservar este FAIL y la prueba independiente. Después del correctivo autorizado, verificar fecha inicial, fecha cambiada, aislamiento de noches hermanas y conservación de historia; completar entonces los casos y controles pendientes de H5-012 con resultados nuevos sobre el árbol corregido. No se han preparado ni ejecutado esas pruebas posteriores a este hallazgo.

**STOP: no correctivo de producto, staging, commit, push, despliegue ni inicio de otra tarea.**
