# Expected independiente — TSK-H4-011/012

Base exacta `060c74c453c03f417bbb9aea889b6650332dc1a0`. Derivado exclusivamente de fuentes aprobadas, antes de producto o migración. Bytes congelados en commit independiente. Solo datos sintéticos y ejecución local/aislada. Las tablas prevalecen sobre diagramas.

Autoridad: Constitution → Product → Business Rules → Domain Model → State Machines → Architecture → SPEC → Plan → Tasks. Fichas completas y protocolos Tasks §§2.2–2.3/6/7. Fuentes adicionales: BR-CHANGE-001–007,BR-SUP-004,BR-SVC-007–009,BR-PAX/BR-NIGHT/BR-HIST/BR-AI-004/005; D018/D019/D020/D039; SPEC §11.2; SM §2.3/12.1/16; G1–G6.

Cada caso de transición contiene un positivo y un negativo independiente por CADA guarda material de su fila, sin combinar retiradas que oculten una guarda. G1–G6 aplicables se ensayan adicionalmente. Precondiciones se construyen por contratos reales H2/H3/H4, no por escritura privilegiada de estados de negocio. Inyecciones técnicas de fallo/seguridad se identifican expresamente. Rechazo conserva todo el estado anterior; pendiente conserva el hecho verdadero y solo restringe el efecto dependiente. Evidencia necesaria por ejecución: fixture e IDs, comando, versiones, SQL independiente antes/después, esperado/observado, stdout/stderr/exit/status/error/signal, SHA y ruta íntegra recuperable.

## Unión exacta de filas asignadas en Tasks §6

Las siguientes filas se transcriben como inventario normativo, sin afirmar su cumplimiento global. E2E-03/04 solo tienen integración local de sus partes asignadas; H6-003/004 y demás verificaciones futuras NO ACREDITADAS.

| Obligación/fuente exacta | Implementación | Verificación | Exigencia |
|---|---|---|---|
| **SPEC-FR-SVC-002** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H2-009], [TSK-H4-011] | [TSK-H2-011], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-003** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H2-009], [TSK-H4-011] | [TSK-H2-011], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-005** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-010** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H4-011], [TSK-H4-005] | [TSK-H4-012], [TSK-H4-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-011** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H4-022], [TSK-H4-011] | [TSK-H4-023], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-001** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-002** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-003** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H4-011], [TSK-H4-013] | [TSK-H4-012], [TSK-H4-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-004** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-005** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H4-011], [TSK-H4-022] | [TSK-H4-012], [TSK-H4-023] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-009** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H1-011], [TSK-H4-013], [TSK-H4-011] | [TSK-H1-012], [TSK-H4-014], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-HIST-005** — [spec.md](spec.md), § 14. Versions, Snapshots, History and Evidence | [TSK-H5-005], [TSK-H4-011] | [TSK-H5-006], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CONC-001** — [spec.md](spec.md), § 18. Concurrency and Consistency | [TSK-H0-009] | [TSK-H0-010], [TSK-H2-004], [TSK-H4-012], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-018** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-024** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-011], [TSK-H5-005], [TSK-H1-017] | [TSK-H4-012], [TSK-H5-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-029** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-030** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-031** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-011], [TSK-H4-022] | [TSK-H4-012], [TSK-H4-023] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-040** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-013], [TSK-H4-011], [TSK-H4-015], [TSK-H3-005] | [TSK-H4-014], [TSK-H4-016], [TSK-H4-019] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-043** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H1-011], [TSK-H4-011], [TSK-H5-001] | [TSK-H1-012], [TSK-H4-012], [TSK-H5-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-067** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H0-009], [TSK-H2-003], [TSK-H2-007], [TSK-H4-011] | [TSK-H2-004], [TSK-H2-008], [TSK-H4-012], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-092** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H4-011], [TSK-H4-009] | [TSK-H4-012], [TSK-H4-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-008** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H0-009], [TSK-H1-015], [TSK-H4-011], [TSK-H5-009] | [TSK-H0-010], [TSK-H1-016], [TSK-H4-012], [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-014** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-009], [TSK-H4-011] | [TSK-H2-011], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-016** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-009], [TSK-H4-011] | [TSK-H2-011], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-017** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-019** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-038** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-046** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H0-011], [TSK-H5-005], [TSK-H4-011] | [TSK-H0-012], [TSK-H5-006], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SM-RV-01** — [state-machines.md](../../docs/state-machines.md), § 2.3. Pendiente de revalidación | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-RV-01 · Sin revisión en ese alcance; evento «Cambio material, caducidad explícita, dato incierto o discrepancia» → Pendiente de revalidación para ese alcance. Efectos exigidos: Conservar último hecho confirmado; abrir revisión/tarea. Impedir comprometer el alcance dudoso usando evidencia anterior.. Negativo: retirar/incumplir cada guarda material «Identificar fuente, causa y dependencias afectadas; una noticia ambigua se registra como tal», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RV-02** — [state-machines.md](../../docs/state-machines.md), § 2.3. Pendiente de revalidación | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-RV-02 · Pendiente; evento «Ratificar lo anterior» → Revisión satisfecha en el alcance comprobado. Efectos exigidos: Añadir resultado/evidencia; mantener el hecho original. Otras partes pendientes siguen pendientes.. Negativo: retirar/incumplir cada guarda material «Nueva comprobación válida de todos los aspectos afectados; vigencia suficiente para la acción concreta», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RV-03** — [state-machines.md](../../docs/state-machines.md), § 2.3. Pendiente de revalidación | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-RV-03 · Pendiente; evento «Confirmar contenido material distinto» → Nuevo alcance acreditado; señal resuelta solo en lo cubierto. Efectos exigidos: Enlazar antes/después; nueva versión o confirmación según corresponda. No cambiar silenciosamente el acuerdo aceptado.. Negativo: retirar/incumplir cada guarda material «Evidencia nueva y proceso de modificación/versión y aprobación aplicables», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RV-04** — [state-machines.md](../../docs/state-machines.md), § 2.3. Pendiente de revalidación | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-RV-04 · Pendiente; evento «Revisión negativa o inconclusa» → Sigue pendiente para el compromiso no acreditado, o cambio rechazado. Efectos exigidos: No presentar como actual el hecho histórico que perdió cobertura. Si se descarta la petición, retirar su señal solo tras comprobar que el alcance anterior sigue siendo utilizable.. Negativo: retirar/incumplir cada guarda material «Registrar respuesta o falta de prueba y motivo», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BK-09** — [state-machines.md](../../docs/state-machines.md), § 6. Booking Operational State | [TSK-H4-011], [TSK-H4-022] | [TSK-H4-012], [TSK-H4-023] | V-SM positivo: SM-BK-09 · Fases previas / En curso; evento «Aplicar cancelación del alcance total» → Cancelada solo si no queda prestación ejecutada/activa incompatible con esa etiqueta. Efectos exigidos: Si hubo ejecución parcial, conservarla y seguir curso/finalización del conjunto con cancelación parcial; no ejecutar Refund por inferencia.. Negativo: retirar/incumplir cada guarda material «Booking Modification aprobada/aplicada y evidencia de cancelación de todo el alcance; no ocultar partes ejecutadas», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-05** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-BS-05 · Cualquier estado; evento «Cambio solicitado o dato material discrepante» → Mismo estado + Pendiente de revalidación en lo afectado. Efectos exigidos: Revisar únicamente fecha, hora, cantidad, proveedor, precio, capacidad, condiciones y dependencias materiales afectadas; no aplicar todavía el cambio.. Negativo: retirar/incumplir cada guarda material «Fuente, causa y alcance identificados; distinguir petición de hecho aceptado», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-06** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-BS-06 · Estado no terminal; evento «Aplicar modificación válida» → Modificado. Efectos exigidos: Conservar alcance previo confirmado y nuevo aplicado. Si este aún requiere confirmación, señal pendiente; si ya existe evidencia completa, evaluar separadamente SM-BS-04.. Negativo: retirar/incumplir cada guarda material «Booking Modification aprobada; acuerdo comercial/evidencias operativas necesarios para cada efecto; antes/después», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-09** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H4-011], [TSK-H4-022] | [TSK-H4-012], [TSK-H4-023] | V-SM positivo: SM-BS-09 · Estado previo no ejecutado ni cancelado; evento «Aplicar cancelación» → Cancelado si cubre toda la prestación. Efectos exigidos: Cancelación parcial deja prestación restante en su situación y conserva el detalle cancelado; no borra noches/participantes/historia ni paga devolución.. Negativo: retirar/incumplir cada guarda material «Modificación aplicable y evidencia inequívoca del proveedor externo o responsable interno sobre alcance cancelado; G3», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-10** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-BS-10 · Estado + revisión; evento «Ratificar alcance o resolver cambio» → Estado sustentado en los hechos, señal resuelta solo allí. Efectos exigidos: Una revisión de horario no ratifica precio/capacidad no comprobados. Una respuesta negativa no restaura una confirmación inválida.. Negativo: retirar/incumplir cada guarda material «SM-RV-02/03/04, cobertura completa en la parte revisada», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-MO-01** — [state-machines.md](../../docs/state-machines.md), § 12.1. Ciclo y efectos separados | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-MO-01 · Sin modificación; evento «Registrar petición cliente/proveedor/interna» → Solicitada. Efectos exigidos: Conservar petición; no aplicar cifras ni cancelar servicios.. Negativo: retirar/incumplir cada guarda material «Solicitante identificado, facultad/contexto, causa y parte afectada», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-MO-02** — [state-machines.md](../../docs/state-machines.md), § 12.1. Ciclo y efectos separados | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-MO-02 · Solicitada; evento «Evaluar impactos» → En evaluación. Efectos exigidos: Abrir revalidaciones solo materiales: servicios/noches/personas, horario, precio, capacidad, proveedor y condiciones afectados.. Negativo: retirar/incumplir cada guarda material «Situación anterior, alcance deseado, política/versión, efectos comerciales, operativos y económicos distinguibles», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-MO-03** — [state-machines.md](../../docs/state-machines.md), § 12.1. Ciclo y efectos separados | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-MO-03 · En evaluación; evento «Requerir respuesta de proveedor» → Pendiente de proveedor. Efectos exigidos: Conservar última confirmación; ni solicitud cliente ni envío acredita aceptación del proveedor.. Negativo: retirar/incumplir cada guarda material «Qué compromiso externo debe confirmar/cambiar/cancelar y evidencia de petición si enviada», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-MO-04** — [state-machines.md](../../docs/state-machines.md), § 12.1. Ciclo y efectos separados | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-MO-04 · Pendiente de proveedor; evento «Revisar respuesta» → En evaluación si respuesta suficiente; sigue pendiente si ambigua. Efectos exigidos: Registrar lo aceptado/rechazado/ofrecido; nueva alternativa se somete a revisión comercial pertinente.. Negativo: retirar/incumplir cada guarda material «Fuente y alcance inequívocos, o discrepancia/alternativas explícitas», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-MO-05** — [state-machines.md](../../docs/state-machines.md), § 12.1. Ciclo y efectos separados | [TSK-H4-011], [TSK-H4-013] | [TSK-H4-012], [TSK-H4-014] | V-SM positivo: SM-MO-05 · En evaluación; evento «Aprobar aplicación concreta» → Aprobada. Efectos exigidos: La aprobación puede delimitar solo la parte evaluada. Aprobar un efecto operativo no autoriza por sí solo devolución, retención, nueva obligación o ajuste cuyo importe siga pendiente; la determinación económica exige decisión explícita del Administrador cuando no existe distribución aprobada/verificable.. Negativo: retirar/incumplir cada guarda material «Administrador, antes/después, impactos conocidos y evidencia; acuerdo del cliente cuando cambia compromiso y confirmación del proveedor para efectos que la necesiten; base económica conforme a D019 o determinación económica todavía separada; G3», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-MO-06** — [state-machines.md](../../docs/state-machines.md), § 12.1. Ciclo y efectos separados | [TSK-H4-011], [TSK-H4-013], [TSK-H4-015] | [TSK-H4-012], [TSK-H4-014], [TSK-H4-016] | V-SM positivo: SM-MO-06 · Aprobada; evento «Aplicar cambio» → Aplicada cuando se completó todo el alcance aprobado. Efectos exigidos: Conservar partes aplicadas/pendientes si incompleta y permitir que efectos operativos independientes avancen. Actualizar solo datos/estados cubiertos; registrar obligación económica determinada sin fingir pago/devolución ni usar la situación física de los fondos como política contractual.. Negativo: retirar/incumplir cada guarda material «Alcance sin cambio material, guardas específicas de cada efecto satisfechas y hechos de aplicación acreditados; para efectos económicos, importe y regla determinados según D019», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-MO-07** — [state-machines.md](../../docs/state-machines.md), § 12.1. Ciclo y efectos separados | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-MO-07 · Solicitada / En evaluación / Pendiente de proveedor; evento «Rechazar modificación» → Rechazada. Efectos exigidos: Mantener acuerdo anterior y comprobar que no haya perdido cobertura; rechazo no revalida automáticamente condiciones anteriores.. Negativo: retirar/incumplir cada guarda material «Decisión/respuesta y motivo conocidos», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-MO-08** — [state-machines.md](../../docs/state-machines.md), § 12.1. Ciclo y efectos separados | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-MO-08 · Solicitada / En evaluación / Pendiente de proveedor / Aprobada sin aplicación; evento «Retirar/dejar sin efecto» → Cancelada/sin efecto. Efectos exigidos: Conservar solicitud y aprobación; si hubo aplicación parcial, resolver esa parte con ajuste/modificación vinculada, sin ocultarla.. Negativo: retirar/incumplir cada guarda material «Actor, motivo y verificación de que no quedan compromisos/efectos externos sin resolver», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-MO-09** — [state-machines.md](../../docs/state-machines.md), § 12.1. Ciclo y efectos separados | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-MO-09 · Aprobada sin completar aplicación; evento «Cambiar materialmente alcance» → En evaluación para nuevo alcance. Efectos exigidos: La aprobación previa permanece histórica y no autoriza contenido nuevo; partes ya aplicadas permanecen registradas.. Negativo: retirar/incumplir cada guarda material «Nueva petición/evidencia y comparación», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-MO-10** — [state-machines.md](../../docs/state-machines.md), § 12.1. Ciclo y efectos separados | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-MO-10 · Cualquier progreso; evento «Fallo o discrepancia de aplicación» → Incidencia sobre progreso base. Efectos exigidos: Resolver con evidencia, volver a evaluación/aplicación según corresponda y comprobar efecto previo antes de repetir.. Negativo: retirar/incumplir cada guarda material «Intento, efectos realmente conocidos y parte incierta», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-FORB-08** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-011] | [TSK-H4-012] | V-NEG: intentar «Pendiente de revalidación → borrar último hecho confirmado o extenderlo a alcance nuevo»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-018, AC-024, AC-030. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-09** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-011], [TSK-H5-005] | [TSK-H4-012], [TSK-H5-006] | V-NEG: intentar «Mensaje tentativo o extracción IA → sobrescribir confirmación manual»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-024, AC-088. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-10** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H2-009], [TSK-H4-011], [TSK-H3-013] | [TSK-H2-011], [TSK-H4-012], [TSK-H3-014] | V-NEG: intentar «Cantidad global/gratuidad → sobrescribir servicios/noches, reducir asistentes reales o deuda de proveedor; promoción multimodal → media, modalidad elegida automáticamente o efecto definitivo sin identificar la modalidad del/de la novi@»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-017, AC-018, AC-019, AC-038. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-11** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-011], [TSK-H1-007], [TSK-H4-009] | [TSK-H4-012], [TSK-H1-008], [TSK-H4-010] | V-NEG: intentar «Hora alternativa → hora definitiva sin acuerdo; aviso de agenda justificado → dispensa de seguridad/capacidad»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-029, AC-085, AC-092. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-13** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-011], [TSK-H4-022] | [TSK-H4-012], [TSK-H4-023] | V-NEG: intentar «Solicitud cliente → cancelación/aceptación del proveedor; cancelación parcial → cancelar resto no afectado»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-029, AC-030, AC-031. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-18** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-011], [TSK-H4-015], [TSK-H4-003] | [TSK-H4-012], [TSK-H4-016], [TSK-H4-004] | V-NEG: intentar «Cancelación, autorización de Refund o Incident Resuelta → devolución ejecutada»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-031, AC-035, AC-052. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **P06** — [constitution.md](../../docs/constitution.md), § P06. Trazabilidad de cambios importantes | [TSK-H0-009], [TSK-H1-003], [TSK-H4-011] | [TSK-H0-010], [TSK-H1-004], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P07** — [constitution.md](../../docs/constitution.md), § P07. Conservación del historial comercial y operativo | [TSK-H2-003], [TSK-H2-007], [TSK-H2-009], [TSK-H4-011], [TSK-H5-015] | [TSK-H2-004], [TSK-H2-008], [TSK-H2-010], [TSK-H4-012], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P09** — [constitution.md](../../docs/constitution.md), § P09. Participantes por servicio y por noche | [TSK-H2-009], [TSK-H4-011], [TSK-H1-005] | [TSK-H2-011], [TSK-H4-012], [TSK-H1-006], [TSK-H6-003] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-B06** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H4-011], [TSK-H4-013], [TSK-H5-013], [TSK-H5-015] | [TSK-H4-012], [TSK-H4-014], [TSK-H5-014], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-C06** — [plan.md](plan.md), § 7.1. Contrato común de aplicación | [TSK-H1-017], [TSK-H4-001], [TSK-H4-011], [TSK-H3-005], [TSK-H4-020], [TSK-H5-013], [TSK-H5-015] | [TSK-H1-018], [TSK-H4-002], [TSK-H4-012], [TSK-H3-006], [TSK-H4-021], [TSK-H5-014], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T04** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H2-009], [TSK-H4-011], [TSK-H4-020], [TSK-H4-022] | [TSK-H2-010], [TSK-H2-011], [TSK-H4-012], [TSK-H4-021], [TSK-H4-023], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T06** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H4-011], [TSK-H4-013] | [TSK-H4-012], [TSK-H4-014], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-03** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H1-005], [TSK-H1-007], [TSK-H2-009], [TSK-H4-005], [TSK-H4-009], [TSK-H4-020], [TSK-H4-022], [TSK-H4-011] | [TSK-H1-006], [TSK-H1-008], [TSK-H2-011], [TSK-H4-006], [TSK-H4-010], [TSK-H4-021], [TSK-H4-023], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-05** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H4-011], [TSK-H4-013], [TSK-H1-011], [TSK-H5-011] | [TSK-H4-012], [TSK-H4-014], [TSK-H1-012], [TSK-H5-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E2E-03** — [spec.md](spec.md), § 9. Core End-to-End Scenarios | [TSK-H2-009], [TSK-H4-011] | [TSK-H6-003] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E2E-04** — [spec.md](spec.md), § 9. Core End-to-End Scenarios | [TSK-H4-011], [TSK-H4-013], [TSK-H4-015], [TSK-H5-015] | [TSK-H6-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |

## SM-MO-01

- Fuente: State Machines tabla normativa SM-MO-01; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-MO-01 · Sin modificación; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Registrar petición cliente/proveedor/interna.
- Guardas positivas y retirada individual: Solicitante identificado, facultad/contexto, causa y parte afectada. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Solicitada. Conservar petición; no aplicar cifras ni cancelar servicios.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-MO-02

- Fuente: State Machines tabla normativa SM-MO-02; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-MO-02 · Solicitada; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Evaluar impactos.
- Guardas positivas y retirada individual: Situación anterior, alcance deseado, política/versión, efectos comerciales, operativos y económicos distinguibles. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: En evaluación. Abrir revalidaciones solo materiales: servicios/noches/personas, horario, precio, capacidad, proveedor y condiciones afectados.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-MO-03

- Fuente: State Machines tabla normativa SM-MO-03; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-MO-03 · En evaluación; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Requerir respuesta de proveedor.
- Guardas positivas y retirada individual: Qué compromiso externo debe confirmar/cambiar/cancelar y evidencia de petición si enviada. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Pendiente de proveedor. Conservar última confirmación; ni solicitud cliente ni envío acredita aceptación del proveedor.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-MO-04

- Fuente: State Machines tabla normativa SM-MO-04; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-MO-04 · Pendiente de proveedor; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Revisar respuesta.
- Guardas positivas y retirada individual: Fuente y alcance inequívocos, o discrepancia/alternativas explícitas. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: En evaluación si respuesta suficiente; sigue pendiente si ambigua. Registrar lo aceptado/rechazado/ofrecido; nueva alternativa se somete a revisión comercial pertinente.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-MO-05

- Fuente: State Machines tabla normativa SM-MO-05; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-MO-05 · En evaluación; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Aprobar aplicación concreta.
- Guardas positivas y retirada individual: Administrador, antes/después, impactos conocidos y evidencia; acuerdo del cliente cuando cambia compromiso y confirmación del proveedor para efectos que la necesiten; base económica conforme a D019 o determinación económica todavía separada; G3. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Aprobada. La aprobación puede delimitar solo la parte evaluada. Aprobar un efecto operativo no autoriza por sí solo devolución, retención, nueva obligación o ajuste cuyo importe siga pendiente; la determinación económica exige decisión explícita del Administrador cuando no existe distribución aprobada/verificable.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-MO-06

- Fuente: State Machines tabla normativa SM-MO-06; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-MO-06 · Aprobada; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Aplicar cambio.
- Guardas positivas y retirada individual: Alcance sin cambio material, guardas específicas de cada efecto satisfechas y hechos de aplicación acreditados; para efectos económicos, importe y regla determinados según D019. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Aplicada cuando se completó todo el alcance aprobado. Conservar partes aplicadas/pendientes si incompleta y permitir que efectos operativos independientes avancen. Actualizar solo datos/estados cubiertos; registrar obligación económica determinada sin fingir pago/devolución ni usar la situación física de los fondos como política contractual.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-MO-07

- Fuente: State Machines tabla normativa SM-MO-07; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-MO-07 · Solicitada / En evaluación / Pendiente de proveedor; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Rechazar modificación.
- Guardas positivas y retirada individual: Decisión/respuesta y motivo conocidos. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Rechazada. Mantener acuerdo anterior y comprobar que no haya perdido cobertura; rechazo no revalida automáticamente condiciones anteriores.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-MO-08

- Fuente: State Machines tabla normativa SM-MO-08; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-MO-08 · Solicitada / En evaluación / Pendiente de proveedor / Aprobada sin aplicación; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Retirar/dejar sin efecto.
- Guardas positivas y retirada individual: Actor, motivo y verificación de que no quedan compromisos/efectos externos sin resolver. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Cancelada/sin efecto. Conservar solicitud y aprobación; si hubo aplicación parcial, resolver esa parte con ajuste/modificación vinculada, sin ocultarla.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-MO-09

- Fuente: State Machines tabla normativa SM-MO-09; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-MO-09 · Aprobada sin completar aplicación; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Cambiar materialmente alcance.
- Guardas positivas y retirada individual: Nueva petición/evidencia y comparación. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: En evaluación para nuevo alcance. La aprobación previa permanece histórica y no autoriza contenido nuevo; partes ya aplicadas permanecen registradas.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-MO-10

- Fuente: State Machines tabla normativa SM-MO-10; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-MO-10 · Cualquier progreso; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Fallo o discrepancia de aplicación.
- Guardas positivas y retirada individual: Intento, efectos realmente conocidos y parte incierta. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Incidencia sobre progreso base. Resolver con evidencia, volver a evaluación/aplicación según corresponda y comprobar efecto previo antes de repetir.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-RV-01

- Fuente: State Machines tabla normativa SM-RV-01; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-RV-01 · Sin revisión en ese alcance; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Cambio material, caducidad explícita, dato incierto o discrepancia.
- Guardas positivas y retirada individual: Identificar fuente, causa y dependencias afectadas; una noticia ambigua se registra como tal. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Pendiente de revalidación para ese alcance. Conservar último hecho confirmado; abrir revisión/tarea. Impedir comprometer el alcance dudoso usando evidencia anterior.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-RV-02

- Fuente: State Machines tabla normativa SM-RV-02; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-RV-02 · Pendiente; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Ratificar lo anterior.
- Guardas positivas y retirada individual: Nueva comprobación válida de todos los aspectos afectados; vigencia suficiente para la acción concreta. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Revisión satisfecha en el alcance comprobado. Añadir resultado/evidencia; mantener el hecho original. Otras partes pendientes siguen pendientes.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-RV-03

- Fuente: State Machines tabla normativa SM-RV-03; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-RV-03 · Pendiente; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Confirmar contenido material distinto.
- Guardas positivas y retirada individual: Evidencia nueva y proceso de modificación/versión y aprobación aplicables. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Nuevo alcance acreditado; señal resuelta solo en lo cubierto. Enlazar antes/después; nueva versión o confirmación según corresponda. No cambiar silenciosamente el acuerdo aceptado.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-RV-04

- Fuente: State Machines tabla normativa SM-RV-04; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-RV-04 · Pendiente; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Revisión negativa o inconclusa.
- Guardas positivas y retirada individual: Registrar respuesta o falta de prueba y motivo. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Sigue pendiente para el compromiso no acreditado, o cambio rechazado. No presentar como actual el hecho histórico que perdió cobertura. Si se descarta la petición, retirar su señal solo tras comprobar que el alcance anterior sigue siendo utilizable.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-BS-05

- Fuente: State Machines tabla normativa SM-BS-05; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-BS-05 · Cualquier estado; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Cambio solicitado o dato material discrepante.
- Guardas positivas y retirada individual: Fuente, causa y alcance identificados; distinguir petición de hecho aceptado. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Mismo estado + Pendiente de revalidación en lo afectado. Revisar únicamente fecha, hora, cantidad, proveedor, precio, capacidad, condiciones y dependencias materiales afectadas; no aplicar todavía el cambio.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-BS-06

- Fuente: State Machines tabla normativa SM-BS-06; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-BS-06 · Estado no terminal; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Aplicar modificación válida.
- Guardas positivas y retirada individual: Booking Modification aprobada; acuerdo comercial/evidencias operativas necesarios para cada efecto; antes/después. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Modificado. Conservar alcance previo confirmado y nuevo aplicado. Si este aún requiere confirmación, señal pendiente; si ya existe evidencia completa, evaluar separadamente SM-BS-04.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-BS-09

- Fuente: State Machines tabla normativa SM-BS-09; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-BS-09 · Estado previo no ejecutado ni cancelado; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Aplicar cancelación.
- Guardas positivas y retirada individual: Modificación aplicable y evidencia inequívoca del proveedor externo o responsable interno sobre alcance cancelado; G3. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Cancelado si cubre toda la prestación. Cancelación parcial deja prestación restante en su situación y conserva el detalle cancelado; no borra noches/participantes/historia ni paga devolución.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-BS-10

- Fuente: State Machines tabla normativa SM-BS-10; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-BS-10 · Estado + revisión; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Ratificar alcance o resolver cambio.
- Guardas positivas y retirada individual: SM-RV-02/03/04, cobertura completa en la parte revisada. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Estado sustentado en los hechos, señal resuelta solo allí. Una revisión de horario no ratifica precio/capacidad no comprobados. Una respuesta negativa no restaura una confirmación inválida.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## SM-BK-09

- Fuente: State Machines tabla normativa SM-BK-09; fila asignada Tasks §6 y FR/AC de inventario.
- Fixture/precondición: SM-BK-09 · Fases previas / En curso; Booking real con partes independientes y originales privados; progreso previo alcanzado por contrato.
- Acción positiva: Aplicar cancelación del alcance total.
- Guardas positivas y retirada individual: Booking Modification aprobada/aplicada y evidencia de cancelación de todo el alcance; no ocultar partes ejecutadas. Retirar cada elemento material en una ejecución separada; contexto/actor inválido rechaza, falta de prueba conserva pendiente localizada.
- Expected: Cancelada solo si no queda prestación ejecutada/activa incompatible con esa etiqueta. Si hubo ejecución parcial, conservarla y seguir curso/finalización del conjunto con cancelación parcial; no ejecutar Refund por inferencia.
- Conservación: petición, acuerdo aceptado, aprobación concreta histórica, hechos previos, partes aplicadas y restantes, actor/momentos/causa/evidencia/linaje.
- Efectos prohibidos: ninguna propagación a alcance independiente; aprobación/recepción no aplica; ningún pago/Refund/liberación/cierre/confirmación futura por inferencia.
- Evidencia necesaria: contrato real y SQL independiente, guardas retiradas identificadas individualmente, resultado/material vigente y snapshot histórico, log completo.

## R01

- Fuente: AC-018;DM-INV-014;P09.
- Fixture/precondición: Grupo12→14, rafting10 confirmado y petición cena.
- Acción/retirada individual: Registrar y evaluar petición; aplicar solo partes concretas aprobadas.
- Expected: Grupo no sobrescribe rafting/noches; petición no aplica; antes/después y dependencias cena visibles.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R02

- Fuente: AC-024;BR-AI-004/005;FORB-09.
- Fixture/precondición: 18 confirmado; noticia quizá16; respuesta solo horario.
- Acción/retirada individual: Abrir Review y ratificar solo horario con nueva prueba.
- Expected: 18 conservado; cantidad/precio/capacidad siguen pendientes; IA candidata conserva procedencia y no sobrescribe manual.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R03

- Fuente: AC-029/092;DM-INV-019;FORB-11.
- Fixture/precondición: Petición11:00; alternativas10/12:30/16.
- Acción/retirada individual: Respuesta ambigua, alternativa, acuerdo verificable; aviso agenda y excepción.
- Expected: Solo acuerdo autorizado fija final; petición/alternativas conservadas; excepción no dispensa capacidad/seguridad.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R04

- Fuente: AC-030;MO-05/06/08/09.
- Fixture/precondición: Dos partes aprobadas; una aplicada.
- Acción/retirada individual: Cambiar restante, intentar aplicar aprobación anterior y retirar aplicado.
- Expected: Aplicado conservado; aprobación histórica inaplicable a contenido nuevo; retirada no borra aplicado ni resultado incierto.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R05

- Fuente: AC-031/040;D019;FORB-13/18.
- Fixture/precondición: Tres servicios;S1 cancelable;componente sin valor atribuible.
- Acción/retirada individual: Cancelar operativamente S1 con prueba; intentar Refund/cancelación resto.
- Expected: Resto y ejecución previa preservados; no BookingCancelada; economía indeterminada pendiente; ningún movimiento/obligación/ajuste.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R06

- Fuente: AC-043;D020;CHG-009;SPEC11.2.
- Fixture/precondición: Servicio20;hora cambia mismo día;fecha cambia22;otra modalidad/noche.
- Acción/retirada individual: Evaluar días naturales y referencias por Booking/modalidad/servicio/noche y condición contractual expresa.
- Expected: Hora no cambia intervalo; fecha reevalúa solo dependientes; exactamente7/3 incluyen día completo; decisiones ejecutadas históricas intactas.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R07

- Fuente: P09;AC-019;DM-INV-016.
- Fixture/precondición: N1=12/N2=10;cuatro nominales N1.
- Acción/retirada individual: Aplicar cambio N2;leer Booking/cantidades/confirmaciones.
- Expected: N1=12,cuatro siguen N1,no16,no8ficticios;N2 vigente actualizado;sin habitaciones universales.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R08

- Fuente: RV01–04;SVC010;G5.
- Fixture/precondición: Material cambio cantidad/lugar/duración o fuente externa.
- Acción/retirada individual: Ratificación parcial, negativa, rechazo/retirada y tardía.
- Expected: Solo dependencias demostradas; horario no ratificaotros; no restaura cobertura inválida; hecho antiguo tardío no manda llegada.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R09

- Fuente: PLAN-B06/C06;T04;DMINV017.
- Fixture/precondición: H2 scope aceptado,AV/Hold/Confirmation/Requirement reales.
- Acción/retirada individual: Aplicar nueva cantidad/fecha por una parte; leer capacidades existentes.
- Expected: Lectores observan alcance vigente y linaje; original aceptado inmutable; evidencia antigua no cubre nuevo;Requirement afectado reabierto únicamente si su fundamento cambió.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R10

- Fuente: SVC005;BR-SVC009.
- Fixture/precondición: Horarios/duración/lugar y desplazamiento conocidos o desconocidos.
- Acción/retirada individual: Evaluar incompatibilidad obvia, excepción justificada, datos incompletos.
- Expected: Aviso local,no bloqueo automático; desconocido por revisar sin duración/desplazamiento inventados; no avisos entregados/jobs/calendario.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R11

- Fuente: SM-BK09/BS09;G4.
- Fixture/precondición: Prueba inequívoca de cancelación externa/interna,servicios/partes.
- Acción/retirada individual: Cancelar parcial,total y existencia de prestación previa acreditada.
- Expected: Solo cancelado cubierto;BookingCancelada exige todo alcance y ausenciaejecución incompatible;registro de hecho previo no implementa inicio/ejecuciónH4-022.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R12

- Fuente: G1;F1/F2;D039/TTE.
- Fixture/precondición: Actor runtime scoped y pruebas exactas.
- Acción/retirada individual: Retirar contexto,F1/F2,actor habilitado,sesión,scope;replay revocado;CRUD/update/delete histórico.
- Expected: Deniega sin enumerar;roles noowner/BYPASSRLS;finalcheck existente no eludido;IA sensible sinHA exacta rechazada.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R13

- Fuente: D016/D017;DM-PENDING005.
- Fixture/precondición: Original B07/corrección;historia y salida por finalidad.
- Acción/retirada individual: Leer distintos contextos yproyecciones.
- Expected: Privado/minimizado,noeconomíareservada/personas/secretosinnecesarios;sin audio/retención/borrado/consentimiento supuesto.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R14

- Fuente: G6;E2;CONC001.
- Fixture/precondición: Operación/hecho durable fiable.
- Acción/retirada individual: Replaymisma clave/material,cambio material,nuevaclavehechoigual,hechos parecidos distintos.
- Expected: Sin duplicar efecto/cancelación/Review/Task/historia;E2conflicto;reautoriza resultados;no dedup débil.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R15

- Fuente: AC067;T04/T06/T08.
- Fixture/precondición: SesionesPG independientes misma base y scopes distintos.
- Acción/retirada individual: Ambosórdenes/overlap:alta,aprobaciónvscontenido,aplicarvsretirar,parcialvsreevaluar,cancelacióncompetidora,RVvsprueba/documento/modificaciónvsAV/Hold/Confirmation.
- Expected: Nooverwrite/lostupdate,versiónporparte no revisiónBookingglobal;independientes continúan;locks estables padre/porciones.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R16

- Fuente: V-AT;G4/G6;T04/T06/T08.
- Fixture/precondición: Cada transición y unidad dependiente.
- Acción/retirada individual: Fallar cada escritura yCOMMIT real;comparar todo estado incluidos lectores previos;reintentar.
- Expected: Todos o ninguno alcance/historia/revisión/aprobación/Task/resultado;economía/fondos intactos;no transaccióndistribuida.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R17

- Fuente: V-AT;Architecture12.
- Fixture/precondición: COMMIT real durable,respuesta perdida después.
- Acción/retirada individual: Recuperar operación idempotente.
- Expected: Resultado durable sin reaplicar/reducir/cancelar dosveces;incierto no autoriza efecto externo ciego.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R18

- Fuente: V-MIG;Plan5.1.
- Fixture/precondición: Base42 poblada conNeed/INC/AV/Hold/Confirmation y privado.
- Acción/retirada individual: Fresh,upgrade,fallaDDLrollbackretry;compararcatálogo/data.
- Expected: 42migracionesbytes intactos;owners/ACL/funciones/policies/triggersrolespreservados salvo funcionesintegración explícitas firma/ACL/owner;ningúnhealth/source editado.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R19

- Fuente: V-EVI;PT03/05;NFR008.
- Fixture/precondición: Producto/verificador frozenexactSHA.
- Acción/retirada individual: Gates/fullPG/unit/health/advisors/diffcheck,matriz/Fxx/hash.
- Expected: Preserva1488PG/118unit,conteoreal,sindobleconteo;logs completos,errorstatus;Fxxcerradossolo evidencia,noFAIL/skipped/cancelledmaterial.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## R20

- Fuente: FORB08/09/10/11/13/18;P06/P07.
- Fixture/precondición: Contexto aparentemente favorable.
- Acción/retirada individual: Intentar borraroriginal,IAoverwrite,globalcantidad/gratuidad,alternativafinal,solicitudcancelación,Refundporcancelación/Incident.
- Expected: Rechazo/independencia yconservación;no capacidades posteriores simuladas por mocks.
- Conservación/prohibiciones: G4/G5;cada negativo conserva antes/después e historia;solo efecto dependiente pendiente.
- Evidencia: fixtures sintéticos por contratos,assertions SQL independientes ylog completo/SHA/protocolo V-EVI.

## Límites congelados

H4-014/H4-023/H5-016/H6-003/H6-004 NO ACREDITADAS. No H4-013+ ni H5/H6 preparados. No motor económicoD019,Refund/fianza,inicio/ejecución/confirmaciónBookingcompletos,cierres,conectores. DM-PENDING005 abierto;hostedH2/H3 noacreditados,Production noautorizada. STOPtrasH4-012.
