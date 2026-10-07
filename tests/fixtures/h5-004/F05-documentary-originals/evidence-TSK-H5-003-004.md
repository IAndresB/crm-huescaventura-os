# TSK-H5-003/004 — Alert y Notification según D016

**PASS exclusivamente Mac Local / entorno aislado / datos sintéticos.** H5-003 y H5-004 COMPLETED local/aislado; H5 continúa IN PROGRESS. H5-005 en adelante y H6 NOT STARTED. STOP al terminar este bloque.

## Cadena Git y autoridad

- Base autorizada `e54331e41d5da154379542d0a08578288a57f01a`. Preflight: `git fetch origin`; main = HEAD = origin/main; divergencia0/0; árbol limpio.
- Expected independiente `7cfa0ee6e03662e3be645c0da3168a6bfd9c79ed` publicado mediante push normal antes de producto; origin/main comprobado idéntico. SHA256 `0c9e2fb001a575e585d17a4e82f9ac61371b1474e63f23c2cbc57ea80fb1e708` intacto.
- Producto inicial `be2fd05` (recuperable con defecto F01), corrección producto/verificador `072a05ac0a3cef5e276035f57ebc1c16973958c5`, corrección técnica de fixture `4ac610910c43bb80e8ead4a6fbdba10f9cf647cb`.
- **SHA definitivamente probado: `4ac610910c43bb80e8ead4a6fbdba10f9cf647cb`.** Foco30/30 y toda la regresión/gates se ejecutaron sobre estos bytes. El cierre sucesor solo incorpora documentos/evidencia/coordinación: no se atribuyen pruebas al sucesor ni cambia producto/tests/migración/permisos/verificador.
- Constitution1.0, Product0.1, Business Rules0.2, Domain Model0.1, State Machines0.1, Architecture0.1, SPEC0010.1, Plan0.3, Tasks0.1 siguen APPROVED. Ninguna decisión reabierta.

## Implementación mínima y límites

Migración54 `20261007193441_h5_alert_notifications.sql`, creada por CLI: añade `b07_alerts`, `b07_notifications`, `b07_notification_attempts`. Alert y Notification no existían como persistencia compatible; B07 records admite otros tipos y Task no representa entrega. Se reutilizan `b07_operations`, `b07_history`, F1/F2, admisión/finalcheck C01/C03 y transacción T09; Task H5-001/002 permanece byte a byte igual.

Alert conserva identidad de fuente/causa/contexto/alcance/efecto, causa/riesgo/acción/urgencia, origen/versionado y responsable. Notification conserva intención, destinatario/canal y estado de entrega separados. Todos los avisos tienen CRM visible; Importante/Crítica añaden una intención WhatsApp `unavailable`. No existe envío externo. `simulated_delivered` es exclusivamente resultado de doble local: persiste `simulated=true`, mientras la entrega WhatsApp continúa `unavailable`.

La visibilidad CRM es lectura autorizada del Core por ID, conforme Tasks §2.2; no se anticipa UI. El fallo de WhatsApp se registra en la misma intención con intentos/versiones correlacionados; no invoca generación recursiva. El origen materialmente distinto conserva otra identidad. Replays equivalentes reutilizan un resultado reautorizado; contenido distinto entra en conflicto.

La metadata de automatización es una referencia registrada al fallo (definición/ejecución/trigger/entradas/permisos/efectos/registros/versión), no un motor ni ejecutor. El Administrador puede detener/revisar el estado dependiente y registrar resultados del doble. La recepción del primer resultado sintético registra un hecho, no ejecuta un envío. Un siguiente intento sintético requiere revisión explícita, límite/pausa configurados y ningún parámetro requerido ausente. No se inventan defaults, frecuencias o fechas. No hay cron, worker periódico, polling, n8n, Meta/Evolution/Twilio, email interno ni integración real.

## Verificación y contadores

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Focal PostgreSQL | **30/30 PASS**, 27 funcionales y 3 V-MIG/advisors/preservación | `focal-4ac6109.log.gz` |
| PostgreSQL completo | **2340 baseline + 30 nuevos = 2370/2370 PASS**, fail/cancelled/skipped0 | `postgres-4ac6109.log.gz` y status |
| Unitarias | **142 baseline + 4 nuevas = 146/146 PASS** | `unit-4ac6109.log.gz` |
| Health independiente | **1/1 PASS**, posterior a PostgreSQL, fuera de ambos totales | `health-4ac6109.log.gz` |
| Frozen install, typecheck, lint/import-boundaries, build, audit producción, diff-check | Todos exit0; auditoría sin vulnerabilidades conocidas | logs y status con SHA por gate |
| V-MIG | Fresh54; upgrade poblado53→54; error DDL rollback/retry; catálogos previos y Task/historia intactos | `final-regression/vmig.json.gz` |
| Advisors oficiales | Supabase CLI2.119.0, loopback, exit0 y `results=[]` | `final-regression/advisors.json` |

No se suman reejecuciones, subcasos, matriz ni health a PostgreSQL. Runtime: Node24.21.0, pnpm11.19.0, PostgreSQL17.11 Postgres.app. PostgreSQL y Storage aislados del runner; no hosted ni datos reales.

**Idempotencia/concurrencia:** cuatro intercalaciones, dos PID/bloqueos reales cada una: recepción sobre identidad ausente en ambos órdenes y resultados competidores en ambos órdenes. Dos recepciones equivalentes convergen en un Alert, dos Notifications y una historia efectiva; dos resultados competidores conservan un intento y rechazan el obsoleto. Respuesta perdida/replay exacto y equivalencia con distinta operación no duplican. Una identidad con material distinto rechaza; causas/alcances/efectos distintos no se colapsan.

**Seguridad/atomicidad:** auth/interacción falsas o ausentes, sujeto ajeno, actor deshabilitado y firma F1 inválida denegados, incluyendo lectura/replay. Runtime/anon/authenticated no acceden directamente; RLS/FORCE RLS y owner no privilegiado intactos. Ocho fallos inyectados en recepción, intentos/resultado/historia, entre CRM y WhatsApp y COMMIT diferido revierten la unidad completa; retry válido solo una vez. No se espera a proveedor en transacción ni se promete exactly-once externo.

**Independencia:** fixture poblado con Booking, proveedor/factura, Incident, Requirement, pago y Task; hashes de todas las tablas de negocio antes/después iguales. Solo actividad F2 queda fuera de esa comparación. Alert no resuelve causa y Notification no acredita hechos originarios. D027 y todo producto previo se verificaron byte a byte sin alteración.

## Trazabilidad, defectos y preservación

[Expected](expected-TSK-H5-003-004.md), [matriz32/32](matrix-TSK-H5-004.md), [registro F01–F04](defects-TSK-H5-004.md). El inventario contiene **10 filas literales Tasks §6**, más el pendiente transversal literal de §7: SPEC-FR-COORD-004, SPEC-FR-IDEMP-002, SPEC-FR-CONC-006, AC-070, AC-083, SPEC-NFR-010, DM-INV-044, ARCH-DEC-011, PLAN-B07 y PT-08. La matriz relaciona cada caso con fuente, contrato, expected, observación real, PASS, SHA y líneas recuperables.

F01 material corregido en producto posterior y reprobado definitivamente; F02/F03/F04 técnicos del verificador CLOSED. Originales FAIL conservados, cero material abierto. Las 53 migraciones anteriores, producto previo, dependencias, health y fuentes APPROVED están preservados; solo cambia el estado de ejecución de las dos fichas y las cabeceras de coordinación. Los logs históricos regenerados por el runner se archivan y restauran desde el SHA probado; listado en `historical-restoration.json`. El CLI cache creado por esta ejecución se conserva dentro de evidencia. Manifiesto de archivos/hash y lista exacta de cambios adjuntos.

## Estado y STOP

H0 COMPLETED técnico/local/aislado; H1–H4 y H4-001–024 COMPLETED local/aislado; H5-001/002 conservan COMPLETED; H5-003/004 COMPLETED local/aislado. **H5-005+ y H6 NOT STARTED; H5 no completo.** DM-PENDING-005 y pendientes dependientes permanecen.

NO ACREDITADOS: H5-005/006, H5-007/008, H5-010, H5-014/AC-058 integral, H6-006, E2E-01 integral, scheduler, WhatsApp real, email interno, conectores externos y Production. Hosted H2/H3 no acreditados; Hosted H4 y Production no autorizados. La infraestructura histórica de health no se altera ni se convierte en scheduler de avisos.

STOP inequívoco tras H5-003/004. No se prepara H5-005/006 ni ninguna tarea posterior. Continuidad exclusivamente al hilo de dirección CRM HUESCAVENTURA OS.
