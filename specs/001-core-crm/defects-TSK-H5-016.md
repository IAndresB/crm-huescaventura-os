# H5-016 — Hallazgos independientes y correctivos

## F01 — Suficiencia indebidamente aceptada ante fundamentos incompletos

**Candidato original: FAIL. Correctivo local verificado.** Fuentes: P05/P18, SM-CL-02/04, SPEC-FR-CLOSE-001/002/003 y los contratos de términos H2, modificación H4 y fianza H4. Un dato ausente no acredita cumplimiento.

Se encontraron tres predicados incompletos en el evaluador compartido:

1. **Condiciones finales:** `terms IS NOT NULL` acepta JSON null, objetos vacíos y escalares. La reproducción de extremo a extremo11 aplica la migración63 original archivada, inyecta exclusivamente datos sintéticos dañados con el rol de ensayo y llama a los adapters ordinarios: las tres dimensiones llegan a Resuelto y se persiste `Cerrada / Histórico` tanto con JSON null como con `{}`. El log registra ambos cierres incorrectos. No se afirma que el usuario ordinario pueda modificar los términos históricos: esa vía está denegada; el defecto es la suficiencia ante material incompleto.
2. **Fianza:** la combinación de `<>` y OR deja pasar ausencia/null de applicability y ausencia de resolution con cantidades aparentemente resueltas. Tres contrapruebas del kernel devuelven `satisfied` en el original, cuando el criterio debe seguir pendiente.
3. **Modificación:** el recorrido por partes acepta vacíamente una modificación solicitada con `parts=[]`. No acredita la resolución de las condiciones finales.

Correctivo mínimo en la **migración63 no publicada**: modifica el cuerpo del mismo `closure_assess(jsonb,jsonb)` mediante anclas verificadas. Términos con objeto y versión/texto/fuente no vacíos según H2; partes identificadas y no vacías; aplicabilidad de fianza explícita y resolución estructurada cuando se exige. No añade evaluador, no modifica migración62, ni redefine cálculo, Refund, cancelación o fianza.

El inventario de funciones modificadas en el test de upgrade H5-015 pasa explícitamente de dos a tres, añadiendo `closure_assess`. Es una actualización de la comprobación de catálogo al correctivo autorizado, no una alteración de expected congelados. El original de dicho test está en el snapshot completo58.

Evidencias: 01-original-audit (12/19), 02-original-confirmed (13/19, seis rechazos indebidamente ausentes/resultados satisfechos), 11-original-e2e-fail (dos cierres incorrectos en una contraprueba); SQL63 y tests de cada reproducción archivados. Correctivo04:19/19; focal final12:78/78, incluidas las37 contrapruebas de H5-016. Los logs intermedios no se atribuyen al candidato final.

## F02 de H5-014 — Control de inventario contrastado

El defecto histórico de inventario autorreferente de H5-014 se usa como negativo documental: el manifiesto original453 coincide con su SHA declarado; el inventario58 excluye su propio hash. Los manifiestos sucesores mantendrán esa separación. No se reproduce aquel defecto en el candidato H5-015 recibido.

## Incidencias del verificador — conservadas, sin ocultar FAIL

- **I01:** el primer fixture envió SQL NULL en lugar de JSON null; además utilizó gravedad/impacto ajenos al enum aprobado. Se corrigieron el literal y los valores a `Leve`/`preparation`, conservando log01 y fuente. La reproducción11 despeja la distinción SQL NULL/JSON null y prueba el cierre completo incorrecto.
- **I02:** reactivar un actor no revive su sesión revocada. El primer ensayo posterior usó una sesión antigua y falló en preparación. La contraprueba final establece una sesión nueva legítima, y deja la revocación al final de su suite para no reutilizar closures de fixtures con la sesión anterior. No se rebajan controles de autenticación.
- **I03:** una inspección de secuencia de instrumentación se hizo con el observador sin SELECT. Se consulta con el rol de ensayo. La sonda final fuerza el fallo de F2 solo después de insertar el cierre y prueba ese punto con una secuencia; evita confundir rechazo de admisión con revalidación final. La secuencia no es producto ni evidencia de negocio.
- **I04:** el contrato vigente prohíbe que un mismo pago tenga correspondencias de Bookings distintas. El intento inicial fue rechazado correctamente con PAYMENT_CONTEXT_REQUIRED. Se conserva como negativo; la prueba de identidad compartida usa dos modificaciones concurrentes del mismo pago autorizado y comprueba rechazo de reasignación y ausencia de invalidación en otra Booking. No se inventa reparto entre reservas.
- **I05:** typecheck detectó la serialización tipada del comando; la primera adaptación lo codificó dos veces y cuatro tests fallaron antes del criterio objetivo. Se corrigió la preparación JSON, conservando logs08/09. No cambió el oráculo ni producto. La focal12 y typecheck14 utilizan los inputs definitivos.

Los FAIL instrumentales de07/09 son anteriores a la congelación del manifiesto456. No se computan como PASS; solo las ejecuciones finales identificadas por ese manifiesto acreditan el candidato corregido.

## Los16 FAIL heredados de H5-015

Ver `tests/fixtures/h5-016/legacy16-analysis.json`. Se verificaron los hashes contra `13-executed-inputs.json`, sin confiar únicamente en la explicación anterior:

- Dos carreras de obligación tenían una orden sin `scope`, `scopeId` ni `due`; fallaban antes de la espera prevista. El original comprimido coincide exactamente con el input de aquella ejecución.
- Catorce casos funcionales fallaron al preparar PostgreSQL. El fichero original reconstruido con puerto59525 coincide exactamente con el hash ejecutado; H5-014-races también utiliza59525. El candidato final utiliza59545.
- La focal final78 vuelve a ejecutar ambos órdenes de obligación y todos los casos funcionales. La regresión completa final se informa por separado; no se convierte retrospectivamente el2700/2716 anterior en un completo limpio.

El completo final20 termina con2756/2756 PASS, cero fallos/cancelados/omitidos y exit0, sobre el manifiesto456. Incluye todos los casos afectados por los16 fallos anteriores; sus logs originales se conservan sin modificación.
