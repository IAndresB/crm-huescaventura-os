# TSK-H6-001 — Expected independiente previo al candidato

Estado: CONGELADO; ningún resultado del candidato atribuido. Auditor independiente `/root/h6_001_auditor`.
Fecha de congelación: 2026-10-22. Base documental Git local: `971c55d5ce5770c71284d106d3c0deecca9514b5`.
Lectura directa de Tasks, SPEC, Architecture y Plan; README contiene solo entrada general DRAFT. No AGENTS.md encontrado en repositorio ni sus ancestros consultados. La autorización vigente es la del director en este encargo.

## 1. Alcance y tres asignaciones exactas

- Tasks §4.7, ficha TSK-H6-001, líneas 2222–2238: comprobar «Contexto → Lead/Opportunity → modalidades/versiones/Acceptance → Booking/cantidades → fondos y críticos → ejecución/documentos → tres cierres» mediante contratos de aplicación y PostgreSQL aislado. B01–B10; C01–C06; T01/T02/T03/T04/T05/T07/T10.
- Tasks §6, AC-089 (línea 2840): cada efecto importante tiene fuente, guarda y criterio; validación futura no presentada como ejecutada; cualquier desviación de comportamiento requiere aprobación normativa previa.
- Tasks §6, SPEC-NFR-001 (línea 2844): desde Booking se reconstruyen necesidad, versiones, Acceptance, operación, economía, decisiones y validación pertinente, sin sustituir hechos por resúmenes.
- Tasks §6, E2E-01 (línea 3209) / SPEC §9: Contact/Organization/Group según contexto → Lead con mínimos → Opportunity → versión con modalidades → Acceptance verificable → una Booking → servicios/cantidades/noches → confirmación y condiciones económicas → ejecución → obligaciones/documentos resueltos → tres cierres. Reconstruir cada vínculo y todo pendiente.
- SPEC §9 vincula criterios principales AC-001–019, AC-023–028, AC-044–046 y AC-058–063 (34 IDs). Estos requieren mapa explícito del tramo integrado y sus límites; no acreditación global por mención. Escenarios especializados E2E-02–07 conservan sus tareas propias. H6-001 no adquiere las 148 transiciones ni todas las prohibiciones de H6 por arrastre.
- Salida: una Booking cerrada reconstructible por las fuentes durables anteriores; cada efecto tiene guardas, permisos, historia y repetición aplicables.

## 2. Dependencia H5-019 verificada documentalmente

- Tasks ficha H5-019 y cabecera: COMPLETED exclusivamente local/aislado por D01–D03; H5 local completo. Su dependencia H4-024 + H5-001–018 está contrastada en 19 filas, 26 AC: 25 satisfactorios locales y AC-073 reservada a H6-015.
- `acceptance-TSK-H5-019.md` y `closure-TSK-H5-019.md` explicitan aceptación humana y auditoría distinta; no aceptar solo casilla COMPLETED.
- Recibo D01 referencia `tests/fixtures/h5-019-corrective/candidate-seal.json`, SHA-256 esperado `31fd4ac89aea684f2155a4365cb5870a0c0163838cbfd543d2ad98d0db1ea619`. Hash recalculado en este pase: coincide.
- Publicación histórica `8a5f1408777b81b760a02646fa414a34dc17983e` es ancestro de HEAD mediante `git merge-base --is-ancestor`, exit 0. Se comprobó únicamente Git local, sin red.
- Originales conservan 2945 PostgreSQL/208 unitarias y otras verificaciones heredadas; este pase NO las reejecutó ni traslada sus PASS al candidato H6-001.
- Dictamen de dependencia: SATISFECHA para ejecutar verificación local/aislada con la autorización actual; no acredita Hosted, Production ni efectos externos. Los límites históricos H6 NOT STARTED no sustituyen la nueva autorización del director ni cierran H6 global.

## 3. Reglas del instrumento y del conjunto de datos

1. Expected derivado de normas, independiente del código. Conservar archivo/hash original incluso si aparecen hallazgos.
2. Base PostgreSQL real exclusiva con prefijo/directorio/puerto identificables y sintéticos explícitos. No conectar/alterar H6-015 ni sus cuatro trabajos suspendidos. No credenciales/datos reales.
3. Se permite preparar actor técnico, roles, fixtures de catálogo/configuración/identidad y hechos externos sintéticos de origen cuando el contrato requiera recibirlos. No sembrar una Opportunity ganada, Acceptance verificada, Booking, confirmación, asignación/pago, ejecución o cierre que deba producir el recorrido. Plan §10.1 exige no sustituir guardas por estado sembrado arbitrariamente.
4. No usar escrituras SQL administrativas como sustituto de contratos de aplicación en el recorrido. Lectura SQL de corroboración y preparación controlada de precondiciones técnicas son admisibles y deben distinguirse.
5. Actor ordinario sin superuser/BYPASSRLS/service_role para efectos; rol de migración separado. Los dobles externos no prueban RLS, permisos, atomicidad, concurrencia o rollback.
6. Probar en estado intermedio que lo aún no sucedido sigue pendiente; comprobar estado final no basta para demostrar independencia.
7. Cada observación tiene ID de caso, comando/entrada, fuente, esperado, observado, resultado, referencia durable y versión del candidato. Capturar límites y skips como tales, nunca PASS.
8. Ningún cambio de contrato/norma, UI, conector, despliegue, publicación o reentrada S11. H6-001 no se declara COMPLETED y H6 global continúa IN PROGRESS.

## 4. Matriz mínima independiente

Los IDs IA01–IA30 son identificadores instrumentales de auditoría, no normas nuevas. Pueden agruparse en una prueba si cada esperado se observa separadamente. Las ramas no alcanzables sin ampliar contrato se informan como límite/bloqueo, no se inventan.

| ID | Fuente | Esperado previo a ejecución | Evidencia mínima |
|---|---|---|---|
| IA01 | Tasks ficha; Plan §10.1; SPEC E2E-01 | El recorrido parte de entradas válidas y atraviesa aplicación/persistencia hasta cierre. Ningún estado de éxito material se siembra para saltar sus guardas. | Inspección del instrumento + trazas/SQL readback de estados antes/después y raíz única. |
| IA02 | AC-004; E2E-01 | Contexto sintético y Lead con contacto/necesidad/posibilidad producen Opportunity Nueva ligada al origen; faltar mínimo material impide conversión y preserva lo independiente. | Positivo y negativo con fuente del contacto y necesidad. |
| IA03 | AC-001/010; G2 | Dato/coste necesario desconocido no se convierte en cero ni compromiso; otro alcance suficientemente conocido puede continuar. | Intento negativo real o evidencia reejecutada exacta, sin atribuir cobertura nominal. |
| IA04 | AC-007/011/012; T01 | Preparación y fijación de versión conservan composición/modalidades, precio final/términos/unidades y alternativas. Fijación no envía ni acepta. Nueva versión no sobrescribe la fijada. | Snapshot/versiones y presentación autorizada; antes/después e historia. |
| IA05 | AC-008/009/013; T02 | Acceptance registrada no es verificada por adjuntar prueba; identidad/versión/términos/selección/vigencia deben cubrir el acto. Ausencia/caducidad/ambigüedad impide conversión sin destruir el candidato. | Positivo y al menos cada guarda material realmente atravesada, incluyendo intento incompleto. |
| IA06 | AC-012/016; T02/T03 | Verificar Acceptance y Ganada no recibe dinero ni confirma proveedor/operación. La conversión es acto separado y conserva únicamente alcance aceptado. | Readback intermedio sin pagos/confirmaciones; vínculos exactos. |
| IA07 | AC-015/017; T03 | Una sola Booking por Opportunity; servicio y noche mantienen procedencia/cantidades de modalidad. Repetición equivalente y pérdida de respuesta no duplican Booking. | Conteos, vínculos, ID resultado estable, reejecución tras commit simulado como respuesta perdida. |
| IA08 | AC-017–019 | Al menos composición con modalidades y noches distintas demuestra cantidades no inferidas del total de grupo y ningún servicio/noche inventado; cambio acotado no sobrescribe resto. | Cantidades esperadas explícitas y contribuciones por origen; mapa del límite con E2E-03. |
| IA09 | AC-023/025/026; T05 | Previsión/aviso sin recepción verificada no acreditan fondos; recepción y conciliación/asignación son actos distintos. Porción no verificada sigue pendiente. | Readbacks intermedios y rechazo de confirmación con fondos insuficientes/no verificados. |
| IA10 | AC-027/028; T05/T07 | Mismos fondos no se consumen dos veces; asignaciones y pago/saldo son coherentes. Duplicado técnico no suma, otra transferencia real no se fusiona por importe. | Movimientos/porciones/consumos, suma independiente y repetición/conflicto. Concurrencia real heredada/repetida identificada. |
| IA11 | AC-023; SM-BK-04; G2 | Confirmar Booking exige crítico, capacidad, revisiones/requisitos y exigencia económica vigentes. Fondos sin crítico y crítico sin fondos no confirman conjunto. | Intentos negativos aislando guardas y posterior positivo por contrato actual. |
| IA12 | AC-024; G4/G5 | Confirmación tiene fuente/alcance/cantidad/noches/precio y conserva historia. Evidencia parcial no ratifica aspectos no cubiertos; total del grupo no cambia confirmación. | Fuente y readbacks exactos; límite de modificaciones especializadas declarado. |
| IA13 | AC-044; T05/T07 | Fondos de terceros, Fee y coste propio no se confunden. Asignación no acredita salida; mandato/condición ausente no se acepta implícitamente. | Fuentes y obligaciones separadas; intento dependiente negativo y trazabilidad de pago. |
| IA14 | AC-045/046; C04/T07 | Factura recibida no se considera revisada/vinculada/pagada. Pago acreditado sin factura mantiene pendiente documental/económico; documento correcto revisado/vinculado permite resolver su parte. | Readbacks de estados intermedios, movimiento/porción y factura con destinatario/importe sintéticos. |
| IA15 | AC-058/063/091; E2E-01 | Fecha prevista/confirmación no ejecuta servicio. Registro de ejecución identifica hecho/momento/alcance; parcial no finaliza resto; realidad anómala preserva incidencia, sin aprobación ficticia. | Negativo por fecha y ejecución real sintética por contrato; historia de prestación. |
| IA16 | AC-058/059; T10 | Booking Finalizada conserva pendientes económicos/documentales; evaluación Comercial, Operacional y Económica son independientes; dimensión vacía requiere fundamento explícito. | Cierre denegado antes de resolver obligaciones y tres evaluaciones con sus fundamentos. |
| IA17 | AC-060; T10 | Crítica pendiente o devolución/documento debido bloquea lo dependiente. Justificación admisible solo salva su bloqueo y no resuelve otras obligaciones. | Intentos negativos vigentes; si no rama crítica en venta elegida, regresión exacta y alcance declarado. |
| IA18 | AC-059; E2E-01 | Solo con tres dimensiones satisfechas actuales se obtiene Closed/Historical; una Booking cerrada enlaza cada fundamento persistido, sin bypass de evaluación. | Salida contractual y readback independiente de dimensiones/condición conjunta. |
| IA19 | AC-061/062/063; T10 | Nueva evidencia material invalida solo dimensión afectada y cierre actual, sin borrar cierre histórico/ejecución. Archivar no es cerrar. | Regresión exacta o caso integrado; distinguir E2E-07 reservado y no afirmar su cierre global. |
| IA20 | NFR-001; AC-089; ARCH §13 | Partiendo solo del identificador Booking puede reconstruirse necesidad/contacto/Lead/Opportunity/versión/Acceptance/servicios/noches/confirmaciones/movimientos/porciones/documentos/decisiones/cierres. Timeline es proyección; los hechos originales siguen recuperables. | Consulta autorizada por raíz + referencias persistentes y evidencia íntegra, no texto resumido suelto. |
| IA21 | Tasks V-DAT; G1; ARCH §6 | Sin contexto, contexto falsificado, actor deshabilitado y rol ordinario no facultado se deniegan efectos/lecturas; actor habilitado solo opera tras guardas. Acceso directo no evade control. | Ejecución PostgreSQL real con roles ordinarios, matriz de rechazos sin contenido sensible y conteos invariantes. |
| IA22 | Tasks V-DAT; G4 | Escritura directa sobre versiones/Acceptance/confirmaciones/historia no modifica hechos protegidos. Rol técnico de bootstrap no es actor de negocio. | Contrapruebas de permisos/inmutabilidad reales, incluidas las reejecutadas si aplica. |
| IA23 | Tasks V-AT; G6; ARCH §12 | Cada efecto equivalente repite resultado durable sin nuevos hechos/history/intención; misma clave y material distinto produce conflicto; lectura del replay reautoriza. | Casos de repetición y conflicto en cada unidad material atravesada; conteo antes/después. |
| IA24 | Tasks V-AT; T01/T02/T03/T04/T05/T07/T10 | Hecho+historia+resultado+intención aplicables atómicos; fallo no deja estado parcial. Pérdida de respuesta posterior a commit recupera resultado. | Rollback/commit-uncertain aplicables, sin mocks de persistencia; regresiones exactas identificadas. |
| IA25 | Plan §10.1; T03/T05/T10 | Dos operaciones concurrentes no duplican Booking/fondos ni cierran sobre insumo obsoleto. Cubrir ambos órdenes/solapamiento en fronteras con carrera material. | Sesiones PostgreSQL reales o regresión ejecutada del producto idéntico; no acreditar con Promise.all sobre dobles. |
| IA26 | AC-089; Tasks §6 | Mapa de tres asignaciones propias y 34 AC principales distingue cobertura integrada, regresión y futura; cada efecto importante refiere fuente/guarda/criterio. | Matriz de IDs contra prueba y observado. No añadir reglas o cambiar esperado para que pase. |
| IA27 | Tasks V-EVI; ARCH §16 | Identidad exacta del candidato no publicado, base Git, diff/manifiesto hashes, runtime/PostgreSQL y comandos/resultados recuperables. Conteos únicos sin sumar repeticiones. FAIL iniciales conservados. | Manifiesto autoconsistente + logs/hashes separados del manifiesto, sin autorreferencia. |
| IA28 | Director; Tasks §2.3 | H6-015, evidencias y cuatro trabajos suspendidos permanecen intactos/en cuarentena. H6-001 pendiente de aceptación y H6 global IN PROGRESS. | Inventario/hash antes/después y lectura de suspensión sin ejecutar/activar. |
| IA29 | Director; ARCH §16 | Todas las pruebas locales/sintéticas; sin secretos reales, red de negocio, S11, Hosted/Production, commit/push/GitHub ni Drive. | Configuración efectiva/scope guard y revisión de acciones, no solamente declaración. |
| IA30 | Director fase 4 | Inventario de publicación pendiente distingue base, candidatos previos, H6-001 y H6-015; manifiestos/dependencias/solapamientos/conflictos conocidos. No mezclar ni publicar. | Inventario de rutas/hash y observaciones de intersección, ninguna mutación Git. |

## 5. Puerta y límites del dictamen

- PASS técnico local requiere todos los eslabones materiales integrados y evidencia real de las guardas aplicables; un fallo en un eslabón impide PASS del recorrido completo, aunque otros casos sigan válidos.
- Un título E2E, unitarias verdes o 34 referencias no acreditan un recorrido continuo. Los fixtures no pueden hacer desaparecer obligaciones ni reemplazar estados que exige crear el recorrido.
- Regresiones de componentes previos pueden cubrir combinaciones especializadas sin afirmar nueva ejecución del E2E correspondiente. Deben indicar SHA/manifiesto/entorno y continuidad de bytes cuando se reutilicen.
- No exigir UI, envío real, Auth/Storage remoto ni conectores: la ficha los excluye. El modelo local de sesión no se presenta como acceso real. V-MIG de producto solo obligatorio si hay cambio persistente; inicializar cadena aprobada para pruebas no requiere inventar migración.
- Fallos materiales se conservan y se reaudita sucesor. Una corrección técnica dentro de contrato no requiere cambio normativo. Una cuestión normativa nueva bloquea exclusivamente esa operación.
- Auditoría independiente no es aceptación del director. Dictamen final no marcará TSK-H6-001 COMPLETED, no cerrará H6 y no autorizará publicación.

## 6. Hashes de fuentes leídas al congelar

| Ruta | SHA-256 |
|---|---|
| specs/001-core-crm/tasks.md | bb73b357c3ff5de5b14952166580c1a6c3f8212407123f5ef148bee97cfff9d6 |
| specs/001-core-crm/spec.md | b6f581058c00b440dfb896404f9d6de6514c780d04f551e9acb365c905fdc747 |
| docs/architecture.md | 61a04ca2a7d151f5fb07e713e5f3cfda439b91837f48d547ec99ce82d6e33117 |
| specs/001-core-crm/plan.md | 6e40e4fec9e8f3f99aa9d11215bbafcbf046189ef561b3591bcdf2c69f3f479e |
| specs/001-core-crm/acceptance-TSK-H5-019.md | a89e492241bb5ddc5c1cde95ba5f62831877caf00566c0835a73eeb67b77a63a |
| specs/001-core-crm/closure-TSK-H5-019.md | 60e68b49caf707c9592f3fd3a92967d2f72fc079cc3377323aa782375954d4bd |
| tests/fixtures/h5-019-corrective/candidate-seal.json | 31fd4ac89aea684f2155a4365cb5870a0c0163838cbfd543d2ad98d0db1ea619 |
| tests/fixtures/h5-019-acceptance/decision-receipt.json | 1a50515e310a6ddf728aa400682a327bb374b4a28ce83dfafa60c0b7f5ced9ab |

Memoria usada solo como índice de cautelas históricas (MEMORY.md líneas 1276–1283); todas las conclusiones normativas y de dependencia anteriores se verificaron en fuentes actuales. Ningún estado de memoria sustituye este repositorio ni la instrucción actual del director.
