# H5-017/H5-018 — Bloque C: esperado del correctivo

Estado: congelado antes del correctivo. Base9649a2773530ea8a43237b4e1f2034f80e34136f. Autorización: encargo expreso Bloque C F01–F03, sin publicación. Preflight37027 archivos:36.952 del candidato y75 de auditoría,456 inputs H5-016 verificados. Originales completos en before-c-overlay.tar.gz y sellos anteriores intactos.

Fuentes: Tasks H5-017/018, §2.2/6/7, SPEC HIST-001/ERR-001/ERR-002, AC-070/072/081, Plan B01/B07/B08/B10, C01/C04, §§7.1/8/11.2, P06/P07/P10/P11/P12/P13/P18/P19 y SM-FORB-27. Se mantienen las10 asignaciones H5-017 y13 de H5-018. No cambia ninguna decisión ni esperado anterior.

| ID | Resultado exigido antes de implementar |
|---|---|
| C01 | Reproducir los3 FAIL de H5-018 sobre el candidato rechazado; no modificar sus fuentes ni logs. |
| C02 | contact/X y booking/X con UUID compartido conservan sus registros/operaciones separados; las referencias y páginas vacías no delatan el contexto ajeno. |
| C03 | B07, B08, Task/Alert y B09 conservan tipo+UUID en toda selección; enlaces canónicos booking→opportunity/proposal/booking_service siguen disponibles. |
| C04 | Operación existente de otro expediente/ámbito se rechaza, con error constante y sin observación persistida ni cambio del original. |
| C05 | Operación canónica propia válida se acepta; ID de intento aún inexistente puede conservarse expresamente como referencia no verificada, sin crear un hecho. |
| C06 | Si un intento inicialmente desconocido después resulta ser operación ajena, la consulta no presenta un vínculo falso; no se reescribe ni borra la observación original. Concurrencia/replay no permiten eludir la revisión vigente. |
| C07 | No identidad/evidencia/actor/session introducidos por cliente sustituyen F1/F2; runtime/API/TTE siguen sin CRUD/helpers, RLS/FORCE RLS sin ampliaciones. |
| C08 | composeServer conserva E4/pending tras excepción del contrato de efecto desconocido, tanto directamente como al envolverla en diagnóstico; una invocación, sin éxito ni unchanged ni retry automático. |
| C09 | Fallo conocido antes del contrato conserva E5; rechazo explícito E5 del contrato conserva su evidencia de efecto conocido. Replays previous/conflict/uncertain no invocan el contrato. |
| C10 | Contratos heredados técnicos directos conservan sus pruebas y expected; composeServer es el punto de composición de negocio corregido. Se revisan todos sus consumidores reales antes del cambio. |
| C11 | Canarios de secretos/cuerpo/URLs/economía no salen en errores/sink/diagnóstico; accepted técnico no cambia hechos de negocio. |
| C12 | Migración nueva65: clean, upgrade64 poblada (incluso observación incorrecta heredada), rollback/reintento, funciones/ACL/RLS anteriores preservados salvo2 cuerpos diagnósticos declarados. No migraciones1–64 editadas. |
| C13 | Repetir originales F01/F02/F03 con solo harness sucesor identificado; aserciones intactas. Controles de reproducción histórica no se cuentan como aceptación del correctivo. |
| C14 | Regresión de consumidores y diagnóstico sobre65, batería PostgreSQL íntegra con sustituciones explícitas de escenarios históricos fijados a64, unitarias, health, frozen install/tipos/lint/build/audit. No suma de solapamientos. |
| C15 | Sellos/inventarios/expected/FAIL anteriores intactos. Nuevo inventario exacto y transición autorizada del único componente histórico de producto, composition.ts; coordinación actualizada sin cambiar filas normativas. |
| C16 | No políticas de privacidad/retención/borrado nuevas; DM-PENDING-005 abierto; H5-017/018 IN PROGRESS, nueva auditoría pendiente, H5-019/H6 no iniciadas. |

Diseño técnico compatible: migración65 mantiene la autorización admitida F1/F2 y proyección mínima; compone el mismo predicado B07 scope/tipo/UUID en un ámbito tipado común. Las operaciones se contrastan con las tablas canónicas, sin registro paralelo. Las referencias de intento se revalidan al leer para no depender de que una escritura concurrente sea visible antes. No se añaden estados de negocio. composeServer envuelve su callback antes del catch técnico de H0; fallos previos y resultados explícitos siguen diferenciados. El código técnico H0 directo no es la composición de operaciones de negocio.
