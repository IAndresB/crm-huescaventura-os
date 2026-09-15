# Tasks — SPEC 001 Core CRM

Version: 0.1
Status: DRAFT
Approval: NOT APPROVED
Phase: 08 — Tasks SPEC 001
Progress: IN PROGRESS — pendiente de revisión humana
Implementation: NOT STARTED
H0–H6: NOT STARTED
Pruebas técnicas: NO EJECUTADAS
Last updated: 2026-09-15

## 1. Autoridad, base y alcance

Este borrador descompone trabajo futuro. La autorización de Andrés registrada en **D035** permite preparar, revisar y publicar exclusivamente este documento y la coordinación. **La publicación documental no equivale a aprobación de Tasks ni autoriza ejecutar una sola tarea.** ChatGPT y Andrés revisarán el borrador publicado en GitHub.

| Fuente/base | Referencia exacta |
|---|---|
| SPEC normativa | [SPEC 001 Core CRM](spec.md), v0.1 APPROVED por D022; aprobación histórica `91fc7527af9fd529e475116d1d212fd2328994d9`. D024 conserva la aprobación y corrige editorialmente AC-084. |
| Plan normativo | [Plan SPEC 001](plan.md), v0.3 APPROVED / COMPLETED por D034 el 2026-09-14; Ready for tasks.md: YES. |
| Aprobación del Plan / Last Approved Commit | `c2c908495afb8eacd39775f273585173533d6b51`. No se reemplaza por un commit del borrador. |
| Revisión previa al cierre del Plan | `e902220b96a7df36454a984531c27c2f14d14529`, conservada como antecedente D034. |
| Base local/remota de esta preparación | `6d00821ddfab50b241c4dea086af1eb79bfdad90`, main de IAndresB/crm-huescaventura-os, comprobada tras fetch. |
| Decisiones | [DECISIONS](../../docs/DECISIONS.md): D001–D034 conservadas; D035 solo registra esta autorización documental. |
| Coordinación vigente | [PROJECT-STATUS](../../docs/PROJECT-STATUS.md) y [NEXT-STEPS](../../docs/NEXT-STEPS.md). El SHA de publicación se registra separado de la aprobación. |

Jerarquía: [Constitution](../../docs/constitution.md) → [Product](../../docs/product.md) → [Business Rules](../../docs/business-rules.md) → [Domain Model](../../docs/domain-model.md) → [State Machines](../../docs/state-machines.md) → [Architecture](../../docs/architecture.md) → SPEC → Plan → Tasks → implementación autorizada. Las tablas normativas de State Machines prevalecen sobre los diagramas. Las decisiones aprobadas interpretan las fuentes sin borrar su cronología.

El alcance futuro es el Core del Plan §2, conservando el monolito modular y los límites de cada contrato. En esta fase solo se modifican los cuatro Markdown autorizados. No se escribe código ni scripts de aplicación/pruebas, SQL, migraciones o RLS; no se instalan dependencias, configuran servicios/dispositivos/proveedores/DNS, crean recursos, despliegan ni ejecutan ensayos técnicos. Las comprobaciones de este borrador son documentales.

Quedan fuera UI (incluido D030, reservado a futura SPEC de interfaz), conectores reales, motor fiscal, nuevas funciones o reglas, roles futuros y operaciones extraordinarias de división/fusión de expedientes. D033 conserva **crm.huescaventura.com** como dirección prevista, separada de la web pública, sin configurar. Un contrato externo probado con un doble no acredita proveedor, entrega o integración real.

## 2. Convenciones de ejecución futura y evidencia

### 2.1. Identificación, estado y áreas

- **TSK-Hn-nnn** identifica una tarea de este documento; el ID es estable y no indica por sí solo orden de ejecución. No es una unidad PLAN-T01–PLAN-T11 ni la entidad de negocio Task.
- Toda ficha tiene casilla vacía, **NOT STARTED** y evidencia **NO EJECUTADA**. El bloqueo se indica aparte. Una dependencia satisfecha no concede autorización de fase.
- Bnn, Cnn y Tnn en las fichas son abreviaturas inequívocas de PLAN-Bnn, PLAN-Cnn y PLAN-Tnn. Los rangos incluyen todos sus IDs; «—» significa que la ficha no define una unidad transaccional de negocio.
- Solo existen actualmente las rutas documentales `docs/` y `specs/001-core-crm/` y sus fuentes enlazadas. Los entregables de las fichas describen **áreas propuestas**, aún no creadas: dominio, aplicación servidor, persistencia/migraciones, acceso, objetos, adaptadores, verificaciones y evidencia. No se impone aquí una distribución física ni nombres definitivos de archivos.
- Los IDs normativos de cada ficha remiten a las filas de §6, que identifican archivo y sección exactos y asignan desarrollo y verificación. Plan §9 es además fuente de cada tarea de salida de hito.
- Las dependencias son condiciones para ejecutar/cerrar el alcance de la ficha. Las obligaciones de integración posteriores se enumeran aparte: no se convierten en un prerrequisito circular para producir el componente inicial.

### 2.2. Protocolos comunes que se concretan en cada ficha

Estos protocolos son instrucciones para las verificaciones futuras de las fichas; no son tareas adicionales ni pruebas realizadas.

| Protocolo | Aplicación y resultado exigido |
|---|---|
| V-DOM | Casos deterministas con datos sintéticos identificados, unidad/base/versiones explícitas, límites y desconocidos. Comparar resultado exacto con fuente normativa; no tomar salida del código como oráculo. |
| V-DAT | Integración real aislada con PostgreSQL y, donde corresponda, Auth/Storage. Probar actor autorizado, sin contexto, contexto falsificado, actor inhabilitado, rol ordinario y acceso directo fuera de UI; permisos mínimos, historia e inmutabilidad ante escritura directa. No propietario/service_role/BYPASSRLS como identidad ordinaria. |
| V-MIG | Cada cambio persistente entrega migración y su comprobación sobre base vacía y sobre la versión inmediatamente anterior, con fixtures anteriores al cambio. Conservar identificadores, relaciones, snapshots, historia, importes, porciones y permisos; error no se resuelve borrando evidencia. Separar rol de migración del rol ordinario. H6 integra la cadena completa. |
| V-AT | Unidad interna: efecto + historia + resultado + intención aplicable en un commit, o ninguno. Fallar antes/durante escrituras, perder respuesta después de commit y reintentar equivalente; contenido distinto con misma clave es conflicto. Dos actores concurrentes sobre raíz/porciones, también sin hijos previos, en ambos órdenes y solapamiento. Reautorizar el resultado previo. |
| V-SM | **Por cada una de las 148 filas de §6.4**, construir el estado/origen normativo y evento; satisfacer todas las guardas para obtener exactamente destino/efectos. Repetir retirando o invalidando cada guarda material de esa fila y G1–G6 aplicables: se rechaza o queda pendiente solo el alcance dependiente, sin efecto indebido ni historia perdida. Las alternativas normativas (p. ej., registrar un hecho real anómalo) se conservan; no convertir una guarda en permiso de ocultar hechos. |
| V-NEG | **Por cada SM-FORB de §6.5**, intentar la transición/inferencia prohibida con los AC relacionados y contexto aparentemente favorable. Debe mantenerse la independencia o denegarse el efecto, conservando hechos y revisión. «No ocurrió» sin haber intentado el caso no es evidencia negativa. |
| V-EVI | Evidencia por tarea: ID, commit probado, entorno y versiones reales, IDs y casos cubiertos, datos sintéticos, pasos/ejecución, esperado, observado, resultado y limitaciones. Incluir referencias recuperables; excluir secretos, TOTP/QR, credenciales, URLs temporales y cuerpos sensibles innecesarios. |

Las fichas de comprobación ejecutan casos positivos/negativos del componente y los IDs asignados. V-DAT/V-MIG/V-AT se aplican cuando la ficha persiste, protege o coordina datos; V-DOM al cálculo/decisión; V-SM/V-NEG a las filas asignadas. Los dobles sirven para canales externos; **no acreditan permisos, integridad, concurrencia, rollback ni recuperación reales**. Los E2E del Core invocan contratos de aplicación sin exigir UI.

### 2.3. Cierre sin falsos positivos

1. Una implementación requiere su ficha de comprobación vinculada y V-MIG cuando modifique persistencia. Código terminado sin esas pruebas no termina su bloque funcional.
2. Cada ficha cierra únicamente su alcance local con resultados observados satisfactorios. Un escenario que necesita una capacidad posterior queda expresamente asignado a la comprobación posterior en §6 y no se acredita mediante un mock.
3. La salida de H0–H5 exige las fichas locales del hito y sus criterios, conservando las obligaciones integradas futuras. H6 exige todas las verificaciones aplicables, limitaciones y puertas de §7. No marcar una fuente global como satisfecha hasta reunir **todas** sus verificaciones asignadas.
4. Los informes se pueden preparar parcialmente; cerrar una ficha de evidencia exige su criterio de salida. Un informe con faltantes identifica bloqueo y no acredita finalización, acceso real o Production.
5. Si aparece una cuestión material nueva, se conserva únicamente la parte afectada pendiente y se solicita decisión conforme a SDD; ningún valor, regla o resultado se inventa.

## 3. Resumen de hitos

Secuencia conservada: **H0 → H1 → H2 → H3 → H4 → H5 → H6**. Todos están NOT STARTED y sus pruebas técnicas NO EJECUTADAS. La siguiente tabla reproduce resultados y salidas del Plan §9 para poder contrastarlos con las fichas.

| Hito | Tareas | Resultado previsto por Plan §9 | Salida exigida por Plan §9 |
|---|---:|---|---|
| H0 — Base técnica y seguridad | 18 | B01/B08/B10: composición modular, contexto Auth/actor, contratos C01–C06, unidad transaccional, permisos, historia y registro de efectos; estrategia de migraciones y entorno aislado. | Acceso denegado por defecto incluso fuera de UI; rol ordinario sin privilegio global; commit/rollback con historia; identidad no filtrada por pool. Política D025 acordada; PLAN-AUTH-001–PLAN-AUTH-006 / PLAN-PENDING-003 pendientes únicamente de verificación técnica y ensayo. Las pruebas aisladas no habilitan acceso real ni Production. |
| H1 — Identidades, catálogo y cálculo base | 19 | B02/B05/B07: contexto, fusión humana, códigos; configuración/versiones, unidades, tarifas/packs y cálculo exacto con fuentes. | Casos de identidad/catálogo/cálculo de PT-01/PT-03/PT-07; los recorridos que requieren contratación/economía se completan en sus hitos posteriores. Histórico reproducible tras cambiar maestros; sin catálogo real inventado. D023 fija la cuantización de los casos acordados, comprobable con PM-01–PM-13 con D028/D029; PLAN-PENDING-004 resuelto. |
| H2 — Contratación y conversión | 12 | B03/B04: oportunidades, propuestas, Acceptance, reserva directa/normal y detalle inicial por servicio/noche. | PT-02 y cantidades de PT-03: una Booking íntegra bajo carrera/reintento; sin pago ni confirmación por Ganada. Precio final manual y total de modalidad respetan D023/PM-02; los repartos de D029 no cambian derechos ni permiten prorratear un precio grupal. |
| H3 — Economía operativa | 15 | B05: política/vencimientos, recepciones, conciliación/porciones, suplidos/documentos/pagos registrados, honorarios/costes y promoción. | Casos de recepciones/suplidos/cálculo de PT-04/PT-07 y T05/T07: fondos no duplicados, factura/pago separados y economía reservada. Fiscalidad/tipos/mandato y datos ausentes bloquean solo su efecto; emisión fiscal excluida. PM-03 comprueba anticipo/saldo y PM-08 los ajustes inversos; Refund/fianza completos se integran en H4. |
| H4 — Operación, cambios y cancelación | 24 | B04/B06/B05: disponibilidad/opciones/confirmación, preparación/ejecución, revalidación, modificación, D019/D020, Refund y fianza. | PT-03/PT-05/PT-06; confirma Booking con economía real integrada; cancelación parcial mantiene resto/historia; cobro/devolución externos solo registrados con prueba. Base incierta exige determinación humana por expediente; PM-04–PM-08 verifican derecho, retención, participaciones y devolución parcial sin recalcular porcentajes. |
| H5 — Coordinación y cierre integrado | 19 | B06/B07/B08/B09: seguimiento/avisos, timeline/calendario, supervisión/intenciones/jobs completos y tres cierres/reapertura. | PT-08/PT-09/PT-10/PT-12; causas/avisos y aprobación/ejecución separados; sin envío real por mocks. Parámetros de automatismo y tratamiento de comunicaciones bloquean exclusivamente lo dependiente. |
| H6 — Validación y preparación de entrega | 18 | B10 y todos los bloques: E2E-01–E2E-07 del Core, regresión, seguridad, migración, concurrencia, fallos y ensayo de recuperación aislado; informe de limitaciones. | Matrices §10, ninguna prueba obligatoria sin evidencia. Para declarar preparación de Production: PLAN-PENDING-003, ARCH-PENDING-002 y políticas/datos necesarios resueltos. UI/conectores y despliegue no quedan ejecutados ni acreditados. |

**Total: 125 tareas futuras.** Las 48 implementaciones tienen una comprobación local separada. Las demás tareas preparan, verifican integración o documentan evidencia.

## 4. Fichas por hito

### 4.1. H0 — Base técnica y seguridad

<a id="tsk-h0-001"></a>

#### TSK-H0-001 — Comprobar compatibilidad, recursos y coste de acceso

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: preparación.
- **Objetivo y alcance:** Compatibilidad de versiones servidor/SDK, conexión/pool, Auth/TOTP, límites y entrega de recuperación por entorno; capacidad publicada frente a real.
- **Fuentes exactas:** Plan §§3.2, 6.2–6.4, 11.1; AC-079, PLAN-AUTH-001. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-001.
- **Bloques, contratos y unidades:** B01/B10; C01–C06; —.
- **Entregable previsto:** Registro futuro de compatibilidad, versiones soportadas y recursos/costes; no presupone suscripción. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** Ninguna tarea previa. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** PLAN-AUTH-001: investigar está permitido en aislamiento; la contratación/configuración dependiente espera capacidad comprobada y coste concreto aceptado. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Consultar documentación y capacidades reales con autorización futura; proponer versiones y documentar coste total comprobable y aceptación previa a contratar/configurar.
- **Salida observable:** Capacidades necesarias identificadas con fuente/fecha y límites; ninguna configuración sustentada solo en una página pública.
- **Verificación y esperado:** Distinguir timeout nativo por refresh de uso humano; varios dispositivos permitidos; inventariar entrega de recuperación y recursos de cada entorno. Lo no verificable queda pendiente. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h0-002"></a>

#### TSK-H0-002 — Delimitar contratos, cambios y evidencia de H0

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: preparación.
- **Objetivo y alcance:** Composición modular, contratos semánticos C01–C06 y unidades internas; acordar el paquete físico acotado al empezar su implementación.
- **Fuentes exactas:** Plan §§3–7, 9–11; AC-079, AC-084, AC-089, D024, D030, D032, D033, D034, D035. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-002.
- **Bloques, contratos y unidades:** B01/B07/B08/B10; C01–C06; T01–T11.
- **Entregable previsto:** Mapa de módulos y propuestas de rutas, contratos y paquetes de migración; protocolo de verificación. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-001]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** Autorización futura de implementación; no exige resolver PLAN-PENDING-003 para diseñar sus ensayos. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Concretar interfaces estrechas, secuencia compatible de migraciones, datos sintéticos y puntos de fallo, sin cambiar los contratos aprobados.
- **Salida observable:** Diseño del paquete revisable, cada efecto y prueba con dueño, sin versiones ni estructura física fijadas por este borrador.
- **Verificación y esperado:** Separar dominio de framework/SDK; separar identidad humana/técnica; cada unidad incluye historia/resultado/intención cuando aplica; no espera a humano/proveedor/objeto dentro de transacción. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01–T11 conservan atomicidad y revisión conjunta.

<a id="tsk-h0-003"></a>

#### TSK-H0-003 — Componer servidor modular y resultados C01–C06

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: implementación.
- **Objetivo y alcance:** Frontera servidor, validación de entrada/origen, guardas G1–G6 y errores E1–E8; puertos sin lógica de negocio en transporte.
- **Fuentes exactas:** Plan §§3.2, 4, 6.5, 7.1; SPEC-FR-ERR-001, SPEC-FR-SEC-005, AC-072, AC-082, PLAN-AUTH-001, D032. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-003.
- **Bloques, contratos y unidades:** B01/B10; C01–C06; —.
- **Entregable previsto:** Áreas propuestas de dominio, aplicación y adaptadores; composición mínima sin pantallas. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-002]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** Versiones compatibles y ámbito aislado verificados; ningún acceso real. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Crear la base estricta del servidor y contratos con resultados explícitos, denegación inicial, configuración validada y diagnóstico mínimo.
- **Salida observable:** Contratos invocables en aislamiento y dominio independiente de Next.js; errores preservan parte pendiente y no filtran contexto.
- **Verificación y esperado:** Build y frontera de imports; solicitud inválida/replay/origen no permitido rechazada; casos E1–E8 distintos; E4 no se reduce a E5; ninguna salida sensible en error. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H0-004].
- **Integración adicional obligatoria:** [TSK-H6-017]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h0-004"></a>

#### TSK-H0-004 — Verificar: Componer servidor modular y resultados C01–C06

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: comprobación.
- **Objetivo y alcance:** Frontera servidor, validación de entrada/origen, guardas G1–G6 y errores E1–E8; puertos sin lógica de negocio en transporte.
- **Fuentes exactas:** Plan §§3.2, 4, 6.5, 7.1; SPEC-FR-ERR-001, SPEC-FR-SEC-005, AC-072, AC-082, D032. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-004.
- **Bloques, contratos y unidades:** B01/B10; C01–C06; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-003]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** Versiones compatibles y ámbito aislado verificados; ningún acceso real. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + comprobación de build/fronteras sobre TSK-H0-003; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Contratos invocables en aislamiento y dominio independiente de Next.js; errores preservan parte pendiente y no filtran contexto. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Build y frontera de imports; solicitud inválida/replay/origen no permitido rechazada; casos E1–E8 distintos; E4 no se reduce a E5; ninguna salida sensible en error. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h0-005"></a>

#### TSK-H0-005 — Identificar CRM Actor y aplicar límites por sesión

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: implementación.
- **Objetivo y alcance:** Único Administrador, múltiples sesiones, contraseña/TOTP, habilitación y control servidor previo a cada acceso; ámbito mínimo de enrolamiento/recuperación.
- **Fuentes exactas:** Plan §§6.1, 6.3–6.5; SPEC-FR-SEC-001, SPEC-FR-SEC-004, SPEC-FR-SEC-005, AC-064, AC-080, PLAN-AUTH-002, PLAN-AUTH-006, D025, D026, D032. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-005.
- **Bloques, contratos y unidades:** B01; C01/C02/C03; —.
- **Entregable previsto:** Áreas propuestas de acceso/sesiones y migraciones de contexto; sin UI de autenticación. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-004], [TSK-H0-001], [TSK-H0-010]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** PLAN-AUTH-002/006 pendientes: este cambio y su ensayo aislado producen evidencia; no requieren haberlos resuelto. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Implementar comprobación de sesión, identificación completa, actividad humana admitida por servidor y habilitación; comprobar límites antes de actualizar actividad.
- **Salida observable:** Ensayos aislados satisfacen política 30/7 por sesión y deniegan Core ante MFA/enrolamiento/recuperación incompletos o actor inhabilitado; no se declara aceptación del acceso real.
- **Verificación y esperado:** Dos dispositivos válidos coexisten; usar uno no prolonga otro; refresh/polling/jobs/pestaña abierta no cuentan; lectura interactiva validada sí. Probar antes/al alcanzar/después de 7 días y 30 días, y retorno que intenta actualizar actividad primero; contraseña sola/TOTP solo no bastan para nueva identificación. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H0-006].
- **Integración adicional obligatoria:** [TSK-H6-008], [TSK-H6-009], [TSK-H6-010], [TSK-H6-011]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h0-006"></a>

#### TSK-H0-006 — Verificar: Identificar CRM Actor y aplicar límites por sesión

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: comprobación.
- **Objetivo y alcance:** Único Administrador, múltiples sesiones, contraseña/TOTP, habilitación y control servidor previo a cada acceso; ámbito mínimo de enrolamiento/recuperación.
- **Fuentes exactas:** Plan §§6.1, 6.3–6.5; SPEC-FR-SEC-001, SPEC-FR-SEC-002, SPEC-FR-SEC-004, AC-064, AC-080, PLAN-AUTH-002, PLAN-AUTH-006, D025, D026, D032. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-006.
- **Bloques, contratos y unidades:** B01; C01/C02/C03; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-005]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** PLAN-AUTH-002/006 pendientes: este cambio y su ensayo aislado producen evidencia; no requieren haberlos resuelto. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H0-005; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Ensayos aislados satisfacen política 30/7 por sesión y deniegan Core ante MFA/enrolamiento/recuperación incompletos o actor inhabilitado; no se declara aceptación del acceso real. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Dos dispositivos válidos coexisten; usar uno no prolonga otro; refresh/polling/jobs/pestaña abierta no cuentan; lectura interactiva validada sí. Probar antes/al alcanzar/después de 7 días y 30 días, y retorno que intenta actualizar actividad primero; contraseña sola/TOTP solo no bastan para nueva identificación. Verificar también la unión identidad/habilitación/permisos/contexto transaccional, rechazando contexto declarado por cliente. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h0-007"></a>

#### TSK-H0-007 — Separar rol ordinario, migración y contexto transaccional

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: implementación.
- **Objetivo y alcance:** Permisos servidor/datos, rol no propietario sin BYPASSRLS y contexto confiable por transacción; ausencia de CRUD arbitrario Core. En este paquete el contexto de ensayo es técnico y confiable; su unión con sesión humana se verifica al completar acceso.
- **Fuentes exactas:** Plan §§3.2, 6.5, 7.2; SPEC-FR-SEC-001, SPEC-FR-SEC-002, SPEC-FR-SEC-005, SPEC-FR-INT-002, AC-064, AC-079, AC-082, PLAN-AUTH-006. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-007.
- **Bloques, contratos y unidades:** B01; C01/C03; —.
- **Entregable previsto:** Áreas propuestas de persistencia, contexto y migraciones de permisos; rutas finales por decidir. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-004], [TSK-H0-001]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** PLAN-AUTH-006: ensayo de permisos en aislamiento, no aceptación Production. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Crear por migración los permisos limitados y la transmisión de contexto verificado; preservar separación de rol de migración y rechazar contexto del cliente.
- **Salida observable:** Denegación efectiva fuera de UI y sin contexto; solo facultades previstas; sin filtración entre transacciones del pool.
- **Verificación y esperado:** Intentar lectura/DML/funciones/vistas por rol API genérico, sin identidad y por rol ordinario; RLS y grants conjuntos en lo expuesto. Reutilizar conexión tras commit, rollback y error con otro contexto: no queda identidad previa. Impedir administrar esquema y privilegios. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H0-008].
- **Integración adicional obligatoria:** [TSK-H6-008], [TSK-H6-017]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h0-008"></a>

#### TSK-H0-008 — Verificar: Separar rol ordinario, migración y contexto transaccional

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: comprobación.
- **Objetivo y alcance:** Permisos servidor/datos, rol no propietario sin BYPASSRLS y contexto confiable por transacción; ausencia de CRUD arbitrario Core.
- **Fuentes exactas:** Plan §§3.2, 6.5, 7.2; SPEC-FR-SEC-001, SPEC-FR-SEC-002, SPEC-FR-SEC-005, SPEC-FR-INT-002, AC-064, AC-079, PLAN-AUTH-006. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-008.
- **Bloques, contratos y unidades:** B01; C01/C03; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-007]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** PLAN-AUTH-006: ensayo de permisos en aislamiento, no aceptación Production. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H0-007; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Denegación efectiva fuera de UI y sin contexto; solo facultades previstas; sin filtración entre transacciones del pool. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Intentar lectura/DML/funciones/vistas por rol API genérico, sin identidad y por rol ordinario; RLS y grants conjuntos en lo expuesto. Reutilizar conexión tras commit, rollback y error con otro contexto: no queda identidad previa. Impedir administrar esquema y privilegios. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h0-009"></a>

#### TSK-H0-009 — Persistir historia y resultado de la unidad interna

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: implementación.
- **Objetivo y alcance:** Infraestructura mínima B07/B08: registro de cambios materiales, operación/efecto, resultado idempotente e intención asociada.
- **Fuentes exactas:** Plan §§5.1, 5.4, 7.1–7.2, 8; SPEC-FR-HIST-001, SPEC-FR-HIST-002, SPEC-FR-IDEMP-001, SPEC-FR-IDEMP-002, SPEC-FR-CONC-001, SPEC-FR-CONC-002, SPEC-FR-CONC-003, SPEC-FR-CONC-004, AC-015, AC-066, AC-067, AC-068, AC-073, AC-081, D032. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-009.
- **Bloques, contratos y unidades:** B01/B07/B08; C03/C04/C05; T01–T11.
- **Entregable previsto:** Áreas propuestas de unidad transaccional, historial, registro de operación e intenciones y sus migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-008]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** Ensayo aislado sin esperar al cierre de PLAN-PENDING-003. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Confirmar hecho, historia, resultado e intención de la misma unidad juntos; reconocer repetición equivalente y rechazar clave con contenido distinto; proteger versión/raíz compartida.
- **Salida observable:** Sin efecto parcial ni historia ausente; identidad de efecto independiente del intento, con actor, causa y momentos reconstruibles.
- **Verificación y esperado:** Fallo antes/entre escrituras revierte unidad; pérdida de respuesta después de commit recupera mismo resultado tras autorizar lectura. Conflicto/deadlock abortado reevalúa; no reintenta efectos externos inciertos. Escritura directa ordinaria no elimina historia ni altera resultados fijados. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H0-010].
- **Integración adicional obligatoria:** [TSK-H6-016], [TSK-H6-013], [TSK-H6-015]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01–T11 conservan atomicidad y revisión conjunta.

<a id="tsk-h0-010"></a>

#### TSK-H0-010 — Verificar: Persistir historia y resultado de la unidad interna

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: comprobación.
- **Objetivo y alcance:** Infraestructura mínima B07/B08: registro de cambios materiales, operación/efecto, resultado idempotente e intención asociada.
- **Fuentes exactas:** Plan §§5.1, 5.4, 7.1–7.2, 8; SPEC-FR-HIST-001, SPEC-FR-HIST-002, SPEC-FR-IDEMP-001, SPEC-FR-IDEMP-002, SPEC-FR-CONC-001, SPEC-FR-CONC-003, SPEC-FR-CONC-004, AC-068, D032. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-010.
- **Bloques, contratos y unidades:** B01/B07/B08; C03/C04/C05; T01–T11.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-009]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** Ensayo aislado sin esperar al cierre de PLAN-PENDING-003. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H0-009; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Sin efecto parcial ni historia ausente; identidad de efecto independiente del intento, con actor, causa y momentos reconstruibles. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Fallo antes/entre escrituras revierte unidad; pérdida de respuesta después de commit recupera mismo resultado tras autorizar lectura. Conflicto/deadlock abortado reevalúa; no reintenta efectos externos inciertos. Escritura directa ordinaria no elimina historia ni altera resultados fijados. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01–T11 conservan atomicidad y revisión conjunta.

<a id="tsk-h0-011"></a>

#### TSK-H0-011 — Autorizar y reservar un efecto exacto

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: implementación.
- **Objetivo y alcance:** Base mínima B08 de Human Approval: versión/contenido, destinatario, importe, condiciones, alcance, reserva/consumo e incertidumbre.
- **Fuentes exactas:** Plan §§7.2, 8; SPEC-FR-HA-001, SPEC-FR-HA-002, SPEC-FR-HA-003, SPEC-FR-HA-004, SPEC-FR-HA-005, SPEC-FR-CONC-002, AC-053, AC-054, AC-055, AC-056. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-011.
- **Bloques, contratos y unidades:** B01/B08; C02/C03/C05; T08.
- **Entregable previsto:** Áreas propuestas de supervisión y registro de efectos, con migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-010], [TSK-H0-006]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** Verificación aislada con efectos sintéticos; integración de trabajos y respuestas tardías en H5. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Conservar aprobación/rechazo humanos y reservar una parte autorizada al ejecutar tras comprobar correspondencia y guardas actuales.
- **Salida observable:** Aprobación, intento, resultado y actor separados; reserva única comprobada en persistencia real.
- **Verificación y esperado:** IA no se autoaprueba; plantilla sensible no exime; cambiar cualquier componente material invalida aplicabilidad; evidencia caducada se revalida. Dos reservas sobre la misma parte no prosperan; incertidumbre conserva reserva, parcial deja resto sin repetir ejecutado. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H0-012].
- **Integración adicional obligatoria:** [TSK-H5-008], [TSK-H6-006], [TSK-H6-016]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h0-012"></a>

#### TSK-H0-012 — Verificar: Autorizar y reservar un efecto exacto

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: comprobación.
- **Objetivo y alcance:** Base mínima B08 de Human Approval: versión/contenido, destinatario, importe, condiciones, alcance, reserva/consumo e incertidumbre.
- **Fuentes exactas:** Plan §§7.2, 8; SPEC-FR-HA-001, SPEC-FR-HA-002, SPEC-FR-HA-003, SPEC-FR-HA-004, SPEC-FR-HA-005, SPEC-FR-CONC-002, AC-053, AC-054, AC-055, AC-056. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-012.
- **Bloques, contratos y unidades:** B01/B08; C02/C03/C05; T08.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-011]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** Verificación aislada con efectos sintéticos; integración de trabajos y respuestas tardías en H5. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H0-011; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Aprobación, intento, resultado y actor separados; reserva única comprobada en persistencia real. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** IA no se autoaprueba; plantilla sensible no exime; cambiar cualquier componente material invalida aplicabilidad; evidencia caducada se revalida. Dos reservas sobre la misma parte no prosperan; incertidumbre conserva reserva, parcial deja resto sin repetir ejecutado. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h0-013"></a>

#### TSK-H0-013 — Revocar globalmente acceso al Core y renovaciones

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: implementación.
- **Objetivo y alcance:** Todas las sesiones previas, incluida emisora; persistencia del rechazo y coordinación con Auth, sin éxito ficticio ante fallo parcial.
- **Fuentes exactas:** Plan §§6.3–6.4; PLAN-AUTH-003, PLAN-AUTH-005, D025, D031. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-013.
- **Bloques, contratos y unidades:** B01/B08; C01/C03; —.
- **Entregable previsto:** Áreas propuestas de revocación y diagnóstico de fallos parciales. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-006], [TSK-H0-010]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** PLAN-AUTH-003: preparación/ensayo aislado; cobertura de objetos en H1 y superficies completas en H6. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Registrar revocación efectiva de sesiones previas del Core, coordinar Auth y reevaluar carreras sin confiar solo en expiración de JWT.
- **Salida observable:** Lecturas, mutaciones y resultados idempotentes disponibles en H0 deniegan sesiones revocadas; nuevas identificaciones se distinguen de las sesiones previas.
- **Verificación y esperado:** Otro dispositivo revoca con JWT vigente; emisora también denegada; refresh/respuesta tardíos no reactivan; carreras de mutación y nueva identificación conservan orden verificable; fallo parcial deja bloqueo explícito. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H0-014].
- **Integración adicional obligatoria:** [TSK-H1-016], [TSK-H6-008], [TSK-H6-011]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h0-014"></a>

#### TSK-H0-014 — Verificar: Revocar globalmente acceso al Core y renovaciones

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: comprobación.
- **Objetivo y alcance:** Todas las sesiones previas, incluida emisora; persistencia del rechazo y coordinación con Auth, sin éxito ficticio ante fallo parcial.
- **Fuentes exactas:** Plan §§6.3–6.4; PLAN-AUTH-003, D025. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-014.
- **Bloques, contratos y unidades:** B01/B08; C01/C03; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-013]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** PLAN-AUTH-003: preparación/ensayo aislado; cobertura de objetos en H1 y superficies completas en H6. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H0-013; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Lecturas, mutaciones y resultados idempotentes disponibles en H0 deniegan sesiones revocadas; nuevas identificaciones se distinguen de las sesiones previas. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Otro dispositivo revoca con JWT vigente; emisora también denegada; refresh/respuesta tardíos no reactivan; carreras de mutación y nueva identificación conservan orden verificable; fallo parcial deja bloqueo explícito. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h0-015"></a>

#### TSK-H0-015 — Preparar recuperación D027/D031 y ensayos de dispositivo

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: preparación.
- **Objetivo y alcance:** Canal de email de seguridad, factor desde otro dispositivo/papel y break-glass independiente del CRM; no conector de email comercial.
- **Fuentes exactas:** Plan §§6.1–6.4, 11.3; PLAN-AUTH-001, PLAN-AUTH-004, PLAN-AUTH-005, D025, D027, D031. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-015.
- **Bloques, contratos y unidades:** B01/B07/B10; C01/C04; —.
- **Entregable previsto:** Procedimientos propuestos de recuperación, inventario mínimo de autoridad y evidencias sin credenciales. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-001], [TSK-H0-014]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** PLAN-AUTH-004/005/006: planificar/ensayar en aislamiento no exige resultado previo; entrega real y acceso independiente se completan en H6. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Definir pasos, permisos mínimos, interrupciones y restablecimiento mínimo; identificar qué requiere participación humana y acceso independiente del propietario.
- **Salida observable:** Guiones aislados revisables, medios necesarios y limitaciones identificados sin secretos/QR/contraseñas ni garantía de recuperar la cuenta propietaria perdida.
- **Verificación y esperado:** D027 usa email previamente verificado y mantiene TOTP; papel restaura secreto de configuración vigente sin depender de iCloud. D031 verifica autoridad, revoca, registra incidente, enrola factor nuevo y verifica nueva copia; P13 rige intervención de datos. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h0-016"></a>

#### TSK-H0-016 — Aplicar ámbito mínimo de enrolamiento y recuperación

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: implementación.
- **Objetivo y alcance:** Restablecimiento/enrolamiento sin expedientes antes de identidad completa; revocación y actor estable sin cascada destructiva.
- **Fuentes exactas:** Plan §§5.3, 6.3–6.4; SPEC-FR-SEC-004, AC-080, PLAN-AUTH-005, PLAN-AUTH-006, D025, D027, D031. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-016.
- **Bloques, contratos y unidades:** B01/B07; C01/C03/C04; —.
- **Entregable previsto:** Áreas propuestas de acceso/recuperación y procedimientos; migraciones solo si el paquete las necesita. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-015], [TSK-H0-008]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** PLAN-AUTH-005/006; configuración dependiente espera capacidad/coste aceptados. Ensayos aislados no requieren dar por resuelto el pendiente. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Implementar controles de continuación segura de recuperación y conservación de CRM Actor; preparar entrega de seguridad en entorno aislado autorizado.
- **Salida observable:** Controles de denegación y continuidad ensayados en Auth aislado; dispositivos, papel, entrega e independencia real del propietario siguen pendientes de H6.
- **Verificación y esperado:** Interrumpir enrolamiento, enlace inválido/consumido y recuperación incompleta: sin Core. Restablecer contraseña no elude TOTP; eliminar/reinscribir identidad/factor no borra historia ni rehabilita sesiones. Dobles solo preparan contrato; entrega real no se acredita aquí. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H0-017].
- **Integración adicional obligatoria:** [TSK-H6-009], [TSK-H6-010], [TSK-H6-011]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h0-017"></a>

#### TSK-H0-017 — Verificar: Aplicar ámbito mínimo de enrolamiento y recuperación

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: comprobación.
- **Objetivo y alcance:** Restablecimiento/enrolamiento sin expedientes antes de identidad completa; revocación y actor estable sin cascada destructiva.
- **Fuentes exactas:** Plan §§5.3, 6.3–6.4; SPEC-FR-SEC-004, PLAN-AUTH-005, PLAN-AUTH-006, D025, D027, D031. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-017.
- **Bloques, contratos y unidades:** B01/B07; C01/C03/C04; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-016]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** PLAN-AUTH-005/006; configuración dependiente espera capacidad/coste aceptados. Ensayos aislados no requieren dar por resuelto el pendiente. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H0-016; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Controles de denegación y continuidad ensayados en Auth aislado; dispositivos, papel, entrega e independencia real del propietario siguen pendientes de H6. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Interrumpir enrolamiento, enlace inválido/consumido y recuperación incompleta: sin Core. Restablecer contraseña no elude TOTP; eliminar/reinscribir identidad/factor no borra historia ni rehabilita sesiones. Dobles solo preparan contrato; entrega real no se acredita aquí. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h0-018"></a>

#### TSK-H0-018 — Registrar salida técnica aislada de H0

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H0. Tipo: documentación/evidencia.
- **Objetivo y alcance:** Reunir evidencias de base/seguridad sin declarar acceso real aceptado.
- **Fuentes exactas:** Plan §§9–12; Plan §9 (resultado y salida del hito); correspondencias específicas de §6. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H0-018.
- **Bloques, contratos y unidades:** B01/B07/B08/B10; C01–C06; T08.
- **Entregable previsto:** Informe propuesto de hito con commit, versiones, pruebas y límites. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-001], [TSK-H0-002], [TSK-H0-003], [TSK-H0-004], [TSK-H0-005], [TSK-H0-006], [TSK-H0-007], [TSK-H0-008], [TSK-H0-009], [TSK-H0-010], [TSK-H0-011], [TSK-H0-012], [TSK-H0-013], [TSK-H0-014], [TSK-H0-015], [TSK-H0-016], [TSK-H0-017]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. Los controles previos a Auth se ensayan con contexto técnico confiable aislado; no habilitan sesiones humanas ni efectos de negocio.
- **Bloqueo localizado / condición para levantarlo:** PLAN-PENDING-003 no bloquea esta salida aislada; sí acceso real/H6 Production. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Revisar resultados obligatorios de H0 y documentar lo aportado a cada PLAN-AUTH; mantener abiertos los ensayos posteriores.
- **Salida observable:** Base aislada verificable, excepciones localizadas y pruebas futuras no disponibles claramente pendientes.
- **Verificación y esperado:** Sin evidencia satisfactoria de permisos/pool/atomicidad/sesiones no termina H0; ningún mock cuenta como permisos reales. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** La recopilación parcial puede acompañar trabajo independiente; el cierre espera todas sus dependencias. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T08 conservan atomicidad y revisión conjunta.

### 4.2. H1 — Identidades, catálogo y cálculo base

<a id="tsk-h1-001"></a>

#### TSK-H1-001 — Registrar identidades y responsables contextuales

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: implementación.
- **Objetivo y alcance:** Contact, Organization, Group, funciones y designaciones con procedencia/historia; datos incompletos admitidos.
- **Fuentes exactas:** Plan §§4, 5.1, 7.3; SPEC-FR-ID-001, SPEC-FR-ID-002, SPEC-FR-SEC-006, AC-001, AC-002. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-001.
- **Bloques, contratos y unidades:** B02/B07; C01/C02/C03; T11.
- **Entregable previsto:** Áreas propuestas de identidades/relaciones y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Datos personales reales sujetos a DM-PENDING-005; fixtures sintéticos permiten avanzar. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Implementar registro/consulta/actualización de identidades y facultad contextual con campos materiales e historia, sin equiparar pagador, participante y aceptante.
- **Salida observable:** Identidades y funciones conservadas con procedencia y rechazo de atribuciones no verificadas.
- **Verificación y esperado:** Organización cambia interlocutor; pagador no participa; no reatribuir Acceptance previa. Dato incompleto no bloquea acción independiente ni otorga permisos. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H1-002].
- **Integración adicional obligatoria:** [TSK-H2-008]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T11 conservan atomicidad y revisión conjunta.

<a id="tsk-h1-002"></a>

#### TSK-H1-002 — Verificar: Registrar identidades y responsables contextuales

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: comprobación.
- **Objetivo y alcance:** Contact, Organization, Group, funciones y designaciones con procedencia/historia; datos incompletos admitidos.
- **Fuentes exactas:** Plan §§4, 5.1, 7.3; SPEC-FR-ID-001, SPEC-FR-ID-002, SPEC-FR-SEC-006, AC-001, AC-002. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-002.
- **Bloques, contratos y unidades:** B02/B07; C01/C02/C03; T11.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-001]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Datos personales reales sujetos a DM-PENDING-005; fixtures sintéticos permiten avanzar. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H1-001; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Identidades y funciones conservadas con procedencia y rechazo de atribuciones no verificadas. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Organización cambia interlocutor; pagador no participa; no reatribuir Acceptance previa. Dato incompleto no bloquea acción independiente ni otorga permisos. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T11 conservan atomicidad y revisión conjunta.

<a id="tsk-h1-003"></a>

#### TSK-H1-003 — Fusionar y archivar identidades sin reutilizar códigos

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: implementación.
- **Objetivo y alcance:** Candidatos a duplicado, fusión humana de Contact/Organization, archivado recuperable y series de Opportunity/Proposal/Booking/Incident.
- **Fuentes exactas:** Plan §§5.1, 7.2; SPEC-FR-ID-003, SPEC-FR-ID-005, SPEC-FR-HIST-006, SPEC-FR-IDEMP-003, AC-003, AC-062. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-003.
- **Bloques, contratos y unidades:** B02/B07; C01/C02/C03; T11.
- **Entregable previsto:** Áreas propuestas de identidad, series y archivo con migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-002]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Convención de año de la serie debe documentarse al configurar; ningún split/merge extraordinario de expedientes. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Crear resolución humana de duplicados y asignación serializada por tipo/año; conservar orígenes, vínculos y códigos emitidos.
- **Salida observable:** Recuperación de ambos contextos y series no reutilizables comprobadas; no pérdida ni reasignación retrospectiva.
- **Verificación y esperado:** Email/teléfono iguales solo candidatos; fusión autorizada preserva ambas historias; concurrencia no duplica códigos y archivo/anulación no los libera; no fusionar Opportunities/Bookings. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H1-004].
- **Integración adicional obligatoria:** [TSK-H6-013]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T11 conservan atomicidad y revisión conjunta.

<a id="tsk-h1-004"></a>

#### TSK-H1-004 — Verificar: Fusionar y archivar identidades sin reutilizar códigos

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: comprobación.
- **Objetivo y alcance:** Candidatos a duplicado, fusión humana de Contact/Organization, archivado recuperable y series de Opportunity/Proposal/Booking/Incident.
- **Fuentes exactas:** Plan §§5.1, 7.2; SPEC-FR-ID-003, SPEC-FR-ID-005, SPEC-FR-HIST-006, SPEC-FR-IDEMP-003, AC-003, AC-062. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-004.
- **Bloques, contratos y unidades:** B02/B07; C01/C02/C03; T11.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-003]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Convención de año de la serie debe documentarse al configurar; ningún split/merge extraordinario de expedientes. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H1-003; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Recuperación de ambos contextos y series no reutilizables comprobadas; no pérdida ni reasignación retrospectiva. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Email/teléfono iguales solo candidatos; fusión autorizada preserva ambas historias; concurrencia no duplica códigos y archivo/anulación no los libera; no fusionar Opportunities/Bookings. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T11 conservan atomicidad y revisión conjunta.

<a id="tsk-h1-005"></a>

#### TSK-H1-005 — Versionar catálogo, proveedores y unidades

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: implementación.
- **Objetivo y alcance:** Service/Variant, clasificación, atributos/asignación, públicos, recomendaciones, unidades/formas de precio y Provider/Offering.
- **Fuentes exactas:** Plan §§4, 5.1; SPEC-FR-CAT-001, SPEC-FR-CAT-002, SPEC-FR-CAT-003, AC-085. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-005.
- **Bloques, contratos y unidades:** B02; C01/C02/C03; —.
- **Entregable previsto:** Áreas propuestas de catálogo/abastecimiento y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-002]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Tarifas/capacidades reales ausentes bloquean solo su uso; datos sintéticos identificados. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Mantener configuración y referencias a versiones aplicadas; separar función proveedor de identidad y capacidad estructural de disponibilidad temporal.
- **Salida observable:** Maestros versionables y unidades reconstruibles sin catálogo rígido ni datos comerciales inventados.
- **Verificación y esperado:** Cambiar categoría, atributo, público, unidad o forma no reinterpreta versión anterior; Offering no confirma servicio; recomendación alta no dispensa elegibilidad. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H1-006].
- **Integración adicional obligatoria:** [TSK-H2-011], [TSK-H4-012]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h1-006"></a>

#### TSK-H1-006 — Verificar: Versionar catálogo, proveedores y unidades

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: comprobación.
- **Objetivo y alcance:** Service/Variant, clasificación, atributos/asignación, públicos, recomendaciones, unidades/formas de precio y Provider/Offering.
- **Fuentes exactas:** Plan §§4, 5.1; SPEC-FR-CAT-001, SPEC-FR-CAT-002, SPEC-FR-CAT-003, AC-085. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-006.
- **Bloques, contratos y unidades:** B02; C01/C02/C03; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-005]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Tarifas/capacidades reales ausentes bloquean solo su uso; datos sintéticos identificados. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H1-005; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Maestros versionables y unidades reconstruibles sin catálogo rígido ni datos comerciales inventados. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Cambiar categoría, atributo, público, unidad o forma no reinterpreta versión anterior; Offering no confirma servicio; recomendación alta no dispensa elegibilidad. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h1-007"></a>

#### TSK-H1-007 — Versionar tarifas, packs y requisitos aplicables

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: implementación.
- **Objetivo y alcance:** Tariff, Pack, Promotion y reglas de capacidad/elegibilidad/documentación con fuentes y vigencia; personalización sin maestro obligatorio.
- **Fuentes exactas:** Plan §§5.1–5.2; SPEC-FR-CAT-004, SPEC-FR-CAT-005, SPEC-FR-CAT-006, SPEC-FR-CAT-007, SPEC-FR-HIST-002, AC-010, AC-038, AC-049, AC-085, D019. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-007.
- **Bloques, contratos y unidades:** B02/B05/B07; C01/C02/C03; —.
- **Entregable previsto:** Áreas propuestas de reglas y configuración versionada, con migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-006]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** BR-PENDING-022 y datos concretos: sin tipo/tarifa/capacidad supuestos; política D019/D023/D028/D029 resuelta. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Implementar versiones, conservación de las utilizadas y paso manual de personalización a maestro; mantener condición desconocida y requisitos mínimos por finalidad.
- **Salida observable:** Configuración mínima utilizable por contratación sin reinterpretar historia ni confirmar valores ausentes.
- **Verificación y esperado:** Maestro actual cambia sin alterar referencias previas; falta coste hotelero material bloquea precio definitivo; sin unidad no calcular por persona; requisito documental no implica documento recibido. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H1-008].
- **Integración adicional obligatoria:** [TSK-H2-004], [TSK-H4-014], [TSK-H3-014]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h1-008"></a>

#### TSK-H1-008 — Verificar: Versionar tarifas, packs y requisitos aplicables

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: comprobación.
- **Objetivo y alcance:** Tariff, Pack, Promotion y reglas de capacidad/elegibilidad/documentación con fuentes y vigencia; personalización sin maestro obligatorio.
- **Fuentes exactas:** Plan §§5.1–5.2; SPEC-FR-CAT-004, SPEC-FR-CAT-005, SPEC-FR-CAT-007, AC-010, AC-085, D019. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-008.
- **Bloques, contratos y unidades:** B02/B05/B07; C01/C02/C03; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-007]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** BR-PENDING-022 y datos concretos: sin tipo/tarifa/capacidad supuestos; política D019/D023/D028/D029 resuelta. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H1-007; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Configuración mínima utilizable por contratación sin reinterpretar historia ni confirmar valores ausentes. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Maestro actual cambia sin alterar referencias previas; falta coste hotelero material bloquea precio definitivo; sin unidad no calcular por persona; requisito documental no implica documento recibido. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h1-009"></a>

#### TSK-H1-009 — Calcular importes exactos y materialización monetaria

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: implementación.
- **Objetivo y alcance:** Decimal exacto, precio final manual, componentes, diferencias y reglas D023/D028/D029; PM-01–PM-13 como oráculos.
- **Fuentes exactas:** Plan §§3.2, 5.2, 10.8; SPEC-FR-CAT-002, SPEC-FR-PROP-005, SPEC-FR-ECON-013, SPEC-FR-ECON-014, AC-011, AC-047, AC-049, AC-085, PM-01, PM-02, PM-03, PM-04, PM-05, PM-06, PM-07, PM-08, PM-09, PM-10, PM-11, PM-12, PM-13, D023, D028, D029, D032. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-009.
- **Bloques, contratos y unidades:** B05; C02; —.
- **Entregable previsto:** Área propuesta de cálculo de dominio; pruebas deterministas y snapshots de resultado previstos. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-008]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** PLAN-PENDING-002/004 resueltos en su alcance; bases/datos fiscales ausentes mantienen su bloqueo material. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Implementar aritmética y materialización reproducible con base/versiones, redondeos y reparto por orden/restos aprobados; conservar desconocidos.
- **Salida observable:** Todos los oráculos coinciden; sin coma flotante binaria definitiva, media/prorrateo no aprobado, ajuste silencioso de costes o redondeo comercial automático.
- **Verificación y esperado:** PM-01/10: ±10,005 → ±10,01; PM-02: 1.000,10; PM-03: 500,01 + 500,00; PM-04/05: derechos de 50,01 y 150,03; PM-06: 30,01 pendientes; PM-07: fijo 900 intacto; PM-08/09 reversión exacta/historia; PM-11/12/13 reparto exacto con orden registrado y signo. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H1-010].
- **Integración adicional obligatoria:** [TSK-H2-004], [TSK-H3-002], [TSK-H3-006], [TSK-H4-014], [TSK-H4-016], [TSK-H3-014]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h1-010"></a>

#### TSK-H1-010 — Verificar: Calcular importes exactos y materialización monetaria

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: comprobación.
- **Objetivo y alcance:** Decimal exacto, precio final manual, componentes, diferencias y reglas D023/D028/D029; PM-01–PM-13 como oráculos.
- **Fuentes exactas:** Plan §§3.2, 5.2, 10.8; SPEC-FR-CAT-002, SPEC-FR-PROP-005, SPEC-FR-ECON-013, SPEC-FR-ECON-014, AC-049, PM-01, PM-02, PM-03, PM-04, PM-05, PM-06, PM-07, PM-08, PM-09, PM-10, PM-11, PM-12, PM-13, D023, D028, D029, D032. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-010.
- **Bloques, contratos y unidades:** B05; C02; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-009]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** PLAN-PENDING-002/004 resueltos en su alcance; bases/datos fiscales ausentes mantienen su bloqueo material. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM; integración monetaria persistida en H2–H4 sobre TSK-H1-009; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Todos los oráculos coinciden; sin coma flotante binaria definitiva, media/prorrateo no aprobado, ajuste silencioso de costes o redondeo comercial automático. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** PM-01/10: ±10,005 → ±10,01; PM-02: 1.000,10; PM-03: 500,01 + 500,00; PM-04/05: derechos de 50,01 y 150,03; PM-06: 30,01 pendientes; PM-07: fijo 900 intacto; PM-08/09 reversión exacta/historia; PM-11/12/13 reparto exacto con orden registrado y signo. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h1-011"></a>

#### TSK-H1-011 — Calcular fechas civiles y referencias por alcance

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: implementación.
- **Objetivo y alcance:** D020: fechas locales separadas de instantes, días límite completos, ancla global/de modalidad/servicio/noche y revaluación.
- **Fuentes exactas:** Plan §§5.2, 8, 10.8; SPEC-FR-CHG-009, SPEC-FR-ECON-002, SPEC-FR-COORD-003, AC-033, AC-039, AC-041, AC-042, AC-043, AC-076, D020. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-011.
- **Bloques, contratos y unidades:** B04/B05/B06/B07; C02/C06; —.
- **Entregable previsto:** Área propuesta de cálculo temporal de dominio y guiones de límites. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H0-004]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Zona y referencia contractual requieren procedencia real; no usar la zona del Mac como universal. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Implementar funciones de referencia y diferencia entre fechas con política conservada; distinguir vencimiento horario externo explícito de D020.
- **Salida observable:** Resultados por alcance sin 168/72 horas ni corte ficticio; no aplica D020 al control de sesión 30/7.
- **Verificación y esperado:** Días 13/17 respecto a servicio 20 completos en ≥7 y ≥3; saldo vencido solo desde 14; modalidad22/noche23 conservan sus referencias; cambio de hora no cambia intervalo y fecha22 sí reevalúa; cifra específica no se propaga. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H1-012].
- **Integración adicional obligatoria:** [TSK-H3-002], [TSK-H4-014], [TSK-H5-012]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h1-012"></a>

#### TSK-H1-012 — Verificar: Calcular fechas civiles y referencias por alcance

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: comprobación.
- **Objetivo y alcance:** D020: fechas locales separadas de instantes, días límite completos, ancla global/de modalidad/servicio/noche y revaluación.
- **Fuentes exactas:** Plan §§5.2, 8, 10.8; SPEC-FR-CHG-009, SPEC-FR-COORD-003, AC-033, AC-041, AC-042, AC-043, D020. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-012.
- **Bloques, contratos y unidades:** B04/B05/B06/B07; C02/C06; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-011]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Zona y referencia contractual requieren procedencia real; no usar la zona del Mac como universal. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM sobre TSK-H1-011; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Resultados por alcance sin 168/72 horas ni corte ficticio; no aplica D020 al control de sesión 30/7. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Días 13/17 respecto a servicio 20 completos en ≥7 y ≥3; saldo vencido solo desde 14; modalidad22/noche23 conservan sus referencias; cambio de hora no cambia intervalo y fecha22 sí reevalúa; cifra específica no se propaga. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h1-013"></a>

#### TSK-H1-013 — Registrar evidencia y comunicaciones acreditadas mínimas

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: implementación.
- **Objetivo y alcance:** Base B07/C04 antes de contratación/economía: Document/Evidence, registro manual, original/derivado y hechos de envío/recepción/respuesta sin borradores ficticios.
- **Fuentes exactas:** Plan §§5.1, 5.3, 7.1, 8; SPEC-FR-PROP-006, SPEC-FR-HIST-001, SPEC-FR-HIST-003, SPEC-FR-COORD-007, SPEC-FR-INT-001, SPEC-FR-INT-004, AC-009, AC-075, AC-087, AC-088. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-013.
- **Bloques, contratos y unidades:** B07/B09; C01/C03/C04; —.
- **Entregable previsto:** Áreas propuestas de evidencia, documentos y registro de comunicación con migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-002], [TSK-H0-010]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** DM-PENDING-005: datos sintéticos u original expresamente autorizado; no audio por defecto. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Conservar fuente, finalidad, momentos, autor/registrador, cobertura y vínculos múltiples; registrar únicamente hechos de comunicación acreditados.
- **Salida observable:** Evidencia disponible para H2/H3 con integridad y permisos; composición saliente y extracción/revisión completas se integran en H5.
- **Verificación y esperado:** Llamada manual válida no requiere audio/escrito posterior; adjunto no confirma aceptación/pago. Entrada comienza recibida sin borrador; aprobación no prueba envío/recepción; un original enlazado a dos contextos no se duplica ni amplía acceso. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H1-014].
- **Integración adicional obligatoria:** [TSK-H2-008], [TSK-H3-004], [TSK-H3-008], [TSK-H4-010], [TSK-H5-006], [TSK-H6-015]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h1-014"></a>

#### TSK-H1-014 — Verificar: Registrar evidencia y comunicaciones acreditadas mínimas

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: comprobación.
- **Objetivo y alcance:** Base B07/C04 antes de contratación/economía: Document/Evidence, registro manual, original/derivado y hechos de envío/recepción/respuesta sin borradores ficticios.
- **Fuentes exactas:** Plan §§5.1, 5.3, 7.1, 8; SPEC-FR-PROP-006, SPEC-FR-HIST-001, SPEC-FR-HIST-003, SPEC-FR-COORD-007, SPEC-FR-INT-001, SPEC-FR-INT-004, AC-087. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-014.
- **Bloques, contratos y unidades:** B07/B09; C01/C03/C04; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-013]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** DM-PENDING-005: datos sintéticos u original expresamente autorizado; no audio por defecto. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H1-013; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Evidencia disponible para H2/H3 con integridad y permisos; composición saliente y extracción/revisión completas se integran en H5. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Llamada manual válida no requiere audio/escrito posterior; adjunto no confirma aceptación/pago. Entrada comienza recibida sin borrador; aprobación no prueba envío/recepción; un original enlazado a dos contextos no se duplica ni amplía acceso. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h1-015"></a>

#### TSK-H1-015 — Conservar objetos privados y reparar cargas incompletas

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: implementación.
- **Objetivo y alcance:** Objeto, metadatos, versiones y autorización de acceso; coherencia recuperable sin transacción distribuida.
- **Fuentes exactas:** Plan §§5.3–5.4, 6.3, 6.5; SPEC-FR-HIST-003, SPEC-FR-HIST-004, SPEC-FR-CONC-004, SPEC-FR-SEC-005, AC-073, AC-074, AC-082, PLAN-AUTH-003. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-015.
- **Bloques, contratos y unidades:** B01/B07; C01/C03/C04; —.
- **Entregable previsto:** Áreas propuestas de adaptador de objetos, estado de conservación y migraciones de metadatos. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-014], [TSK-H0-014]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** PLAN-AUTH-003 en objetos; límites de adjuntos y privacidad requieren valores verificados antes del uso dependiente. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Implementar preparación/carga/acreditación/vínculo y reparación idempotente; acceso reautorizable o equivalente verificable frente a revocación.
- **Salida observable:** Estado real de conservación visible, reparación sin duplicar/borrar historia, permisos y revocación probados con Storage aislado.
- **Verificación y esperado:** Binario sin metadatos; referencia sin objeto; fallo en vínculo y repetición; sustitución conserva original. Tercero con ID/URL y sesión revocada con JWT/URL emitida no acceden indebidamente. No limpieza de huérfanos sin política. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H1-016].
- **Integración adicional obligatoria:** [TSK-H6-008], [TSK-H6-015]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h1-016"></a>

#### TSK-H1-016 — Verificar: Conservar objetos privados y reparar cargas incompletas

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: comprobación.
- **Objetivo y alcance:** Objeto, metadatos, versiones y autorización de acceso; coherencia recuperable sin transacción distribuida.
- **Fuentes exactas:** Plan §§5.3–5.4, 6.3, 6.5; SPEC-FR-HIST-003, SPEC-FR-HIST-004, SPEC-FR-CONC-004, SPEC-FR-SEC-005, AC-074, AC-082, PLAN-AUTH-003. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-016.
- **Bloques, contratos y unidades:** B01/B07; C01/C03/C04; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-015]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** PLAN-AUTH-003 en objetos; límites de adjuntos y privacidad requieren valores verificados antes del uso dependiente. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H1-015; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Estado real de conservación visible, reparación sin duplicar/borrar historia, permisos y revocación probados con Storage aislado. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Binario sin metadatos; referencia sin objeto; fallo en vínculo y repetición; sustitución conserva original. Tercero con ID/URL y sesión revocada con JWT/URL emitida no acceden indebidamente. No limpieza de huérfanos sin política. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h1-017"></a>

#### TSK-H1-017 — Persistir necesidades mínimas de seguimiento B07

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: implementación.
- **Objetivo y alcance:** Task Pendiente por causa/contexto para revisión, documento, importe o dato pendiente antes de H5; responsable único y plazo conocido/pendiente.
- **Fuentes exactas:** Plan §§4, 8–9; SPEC-FR-COORD-001, SPEC-FR-COORD-002, SPEC-FR-IDEMP-002, AC-024, AC-050. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-017.
- **Bloques, contratos y unidades:** B07/B08; C01/C03/C06; T09.
- **Entregable previsto:** Áreas propuestas de seguimiento mínimo y migraciones; no scheduler. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-014], [TSK-H0-010]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Fecha/parametrización ausente conserva necesidad sin vencimiento inventado. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Registrar/actualizar la misma necesidad a petición de módulos con identidad de causa; preservar origen/versionado.
- **Salida observable:** B07 puede recibir pendientes de H2–H4 sin depender de integración H5; cierre/reapertura y todos los disparadores se completan después.
- **Verificación y esperado:** Misma causa concurrente no duplica Task; fecha desconocida no está vencida; registrar necesidad no confirma pago/proveedor ni revalida dato. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H1-018].
- **Integración adicional obligatoria:** [TSK-H4-002], [TSK-H5-002], [TSK-H5-004]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T09 conservan atomicidad y revisión conjunta.

<a id="tsk-h1-018"></a>

#### TSK-H1-018 — Verificar: Persistir necesidades mínimas de seguimiento B07

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: comprobación.
- **Objetivo y alcance:** Task Pendiente por causa/contexto para revisión, documento, importe o dato pendiente antes de H5; responsable único y plazo conocido/pendiente.
- **Fuentes exactas:** Plan §§4, 8–9; SPEC-FR-COORD-001, SPEC-FR-COORD-002, SPEC-FR-IDEMP-002, AC-050. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-018.
- **Bloques, contratos y unidades:** B07/B08; C01/C03/C06; T09.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-017]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Fecha/parametrización ausente conserva necesidad sin vencimiento inventado. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H1-017; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** B07 puede recibir pendientes de H2–H4 sin depender de integración H5; cierre/reapertura y todos los disparadores se completan después. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Misma causa concurrente no duplica Task; fecha desconocida no está vencida; registrar necesidad no confirma pago/proveedor ni revalida dato. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T09 conservan atomicidad y revisión conjunta.

<a id="tsk-h1-019"></a>

#### TSK-H1-019 — Registrar salida de identidades, catálogo y cálculo

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H1. Tipo: documentación/evidencia.
- **Objetivo y alcance:** Resultados de H1 y capacidades B07 tempranas disponibles.
- **Fuentes exactas:** Plan §§9–10; Plan §9 (resultado y salida del hito); correspondencias específicas de §6. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H1-019.
- **Bloques, contratos y unidades:** B02/B05/B07/B10; C01–C04/C06; T11.
- **Entregable previsto:** Informe propuesto de hito y matriz de evidencia. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H0-018], [TSK-H1-001], [TSK-H1-002], [TSK-H1-003], [TSK-H1-004], [TSK-H1-005], [TSK-H1-006], [TSK-H1-007], [TSK-H1-008], [TSK-H1-009], [TSK-H1-010], [TSK-H1-011], [TSK-H1-012], [TSK-H1-013], [TSK-H1-014], [TSK-H1-015], [TSK-H1-016], [TSK-H1-017], [TSK-H1-018]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H0 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** No acredita acceso real ni catálogo real completo. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Consolidar pruebas H1, oráculos PM, referencias y migraciones; anotar verificaciones que se completan al integrar contratación/economía.
- **Salida observable:** Capacidades H1 comprobadas en aislamiento, historia reconstruible y dependencias tempranas de H3/H4 satisfechas documentalmente para ejecución futura.
- **Verificación y esperado:** Faltan versiones/códigos, permisos de evidencia o un PM falla: no cerrar bloque afectado. Cálculo de dominio no acredita todavía una Refund real. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** La recopilación parcial puede acompañar trabajo independiente; el cierre espera todas sus dependencias. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T11 conservan atomicidad y revisión conjunta.

### 4.3. H2 — Contratación y conversión

<a id="tsk-h2-001"></a>

#### TSK-H2-001 — Registrar captación y progreso comercial

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H2. Tipo: implementación.
- **Objetivo y alcance:** Lead/Opportunity, mínimos, contexto, estados, pausa/pérdida/reactivación con pruebas; Ganada delega en Acceptance verificada.
- **Fuentes exactas:** Plan §§4, 7.3; SPEC-FR-COM-001, SPEC-FR-COM-002, SPEC-FR-COM-003, SPEC-FR-COM-004, SPEC-FR-COM-005, AC-001, AC-004, AC-005, AC-006. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H2-001.
- **Bloques, contratos y unidades:** B03/B07; C01/C02/C03/C04; T02.
- **Entregable previsto:** Áreas propuestas de comercial y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H1-019], [TSK-H1-018], [TSK-H1-004]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H1 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Datos finales ausentes bloquean únicamente el compromiso dependiente. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Implementar avance por actuaciones acreditadas, motivo de pérdida y reactivación sustentada; reutilizar identidades para vía directa sin Lead ficticio.
- **Salida observable:** Progreso comercial y motivos verificables sin estados operativos ni económicos por arrastre.
- **Verificación y esperado:** Tres mínimos permiten Opportunity sin scoring/fecha final; falta cada mínimo impide convertir; pérdida sin motivo rechazada, desconocido admitido; reactivación conserva historia y no revalida tarifa ni salta a Ganada. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H2-002].
- **Integración adicional obligatoria:** [TSK-H2-008], [TSK-H6-001]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T02 conservan atomicidad y revisión conjunta.

<a id="tsk-h2-002"></a>

#### TSK-H2-002 — Verificar: Registrar captación y progreso comercial

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H2. Tipo: comprobación.
- **Objetivo y alcance:** Lead/Opportunity, mínimos, contexto, estados, pausa/pérdida/reactivación con pruebas; Ganada delega en Acceptance verificada.
- **Fuentes exactas:** Plan §§4, 7.3; SPEC-FR-COM-001, SPEC-FR-COM-002, SPEC-FR-COM-003, SPEC-FR-COM-004, SPEC-FR-COM-005, AC-001, AC-004, AC-005, AC-006. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H2-002.
- **Bloques, contratos y unidades:** B03/B07; C01/C02/C03/C04; T02.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H1-019], [TSK-H2-001]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H1 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Datos finales ausentes bloquean únicamente el compromiso dependiente. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H2-001; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Progreso comercial y motivos verificables sin estados operativos ni económicos por arrastre. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Tres mínimos permiten Opportunity sin scoring/fecha final; falta cada mínimo impide convertir; pérdida sin motivo rechazada, desconocido admitido; reactivación conserva historia y no revalida tarifa ni salta a Ganada. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T02 conservan atomicidad y revisión conjunta.

<a id="tsk-h2-003"></a>

#### TSK-H2-003 — Preparar y fijar versiones con modalidades y precio manual

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H2. Tipo: implementación.
- **Objetivo y alcance:** Alternativas, composición seleccionable, términos y fijación inmutable; precio calculado/final conservado con desglose reservado.
- **Fuentes exactas:** Plan §§5.1–5.2, 6.5, 7.2–7.3; SPEC-FR-CAT-005, SPEC-FR-PROP-001, SPEC-FR-PROP-002, SPEC-FR-PROP-003, SPEC-FR-PROP-005, SPEC-FR-PROP-007, SPEC-FR-ACC-003, SPEC-FR-HIST-002, SPEC-FR-SEC-003, AC-001, AC-007, AC-010, AC-011, AC-013, AC-017, AC-065, AC-067, AC-085, PM-09, D023. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H2-003.
- **Bloques, contratos y unidades:** B03/B05/B07; C01/C02/C03/C04; T01.
- **Entregable previsto:** Áreas propuestas de propuestas/versiones/cálculo aplicado y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H1-019], [TSK-H2-002], [TSK-H1-010], [TSK-H1-008]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H1 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Dato económico material incierto impide compromiso definitivo; mandato inexistente no se añade como aceptado. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Implementar preparación, fijación y sustitución; conservar contribución de modalidades y versiones de catálogo/términos/precio utilizadas.
- **Salida observable:** T01 atómico con contenido y origen completos; versiones históricas idénticas tras cambios maestros/precio y proyección comercial mínima.
- **Verificación y esperado:** Editar v1 fijada crea v2; escritura directa ordinaria no altera v1; carrera sobre numeración/preparación no fija dos contenidos incompatibles. Modalidad100,01×10=1.000,10; pack comercial solo precio/persona, participantes e incluidos; unidad fija interna intacta. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H2-004].
- **Integración adicional obligatoria:** [TSK-H2-008], [TSK-H2-010], [TSK-H6-001]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01 conservan atomicidad y revisión conjunta.

<a id="tsk-h2-004"></a>

#### TSK-H2-004 — Verificar: Preparar y fijar versiones con modalidades y precio manual

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H2. Tipo: comprobación.
- **Objetivo y alcance:** Alternativas, composición seleccionable, términos y fijación inmutable; precio calculado/final conservado con desglose reservado.
- **Fuentes exactas:** Plan §§5.1–5.2, 6.5, 7.2–7.3; SPEC-FR-CAT-001, SPEC-FR-CAT-004, SPEC-FR-CAT-005, SPEC-FR-PROP-001, SPEC-FR-PROP-002, SPEC-FR-PROP-003, SPEC-FR-PROP-005, SPEC-FR-PROP-007, SPEC-FR-ECON-013, SPEC-FR-HIST-002, SPEC-FR-CONC-001, SPEC-FR-SEC-003, AC-001, AC-007, AC-010, AC-011, AC-065, AC-067, AC-085, PM-09, D023. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H2-004.
- **Bloques, contratos y unidades:** B03/B05/B07; C01/C02/C03/C04; T01.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H1-019], [TSK-H2-003]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H1 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Dato económico material incierto impide compromiso definitivo; mandato inexistente no se añade como aceptado. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H2-003; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** T01 atómico con contenido y origen completos; versiones históricas idénticas tras cambios maestros/precio y proyección comercial mínima. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Editar v1 fijada crea v2; escritura directa ordinaria no altera v1; carrera sobre numeración/preparación no fija dos contenidos incompatibles. Modalidad100,01×10=1.000,10; pack comercial solo precio/persona, participantes e incluidos; unidad fija interna intacta. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01 conservan atomicidad y revisión conjunta.

<a id="tsk-h2-005"></a>

#### TSK-H2-005 — Evaluar vigencia, envío y rechazo de la oferta

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H2. Tipo: implementación.
- **Objetivo y alcance:** Vigencia efectiva y revalidación del acto, envío acreditado y rechazo/sustitución por alcance.
- **Fuentes exactas:** Plan §§5.1–5.2, 7.3, 8; SPEC-FR-COM-003, SPEC-FR-PROP-004, SPEC-FR-PROP-006, SPEC-FR-PROP-007, AC-005, AC-008, AC-086, AC-087. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H2-005.
- **Bloques, contratos y unidades:** B03/B07/B08; C02/C03/C04/C05; T01/T08.
- **Entregable previsto:** Áreas propuestas de oferta/revisión y hechos de comunicación. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H1-019], [TSK-H2-004], [TSK-H1-014], [TSK-H1-018]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H1 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Canal externo sin conector conserva intención; dato/vigencia no acreditados dejan compromiso pendiente. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Aplicar límite más restrictivo y revisión sin prórroga histórica; registrar envío/rechazo solo con hechos/autorizaciones suficientes.
- **Salida observable:** Oferta y hechos separados; envío manual probado conserva versión/destinatario; intención sola nunca se declara enviada.
- **Verificación y esperado:** Caducidad no rechaza ni desacepta; ratificar para un acto no modifica fecha emitida; nueva vigencia ofrecida exige versión. Silencio/leído no decisivos; retomar versión rechazada/sustituida exige comprobar contenido/cobertura; coste material ausente impide envío definitivo. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H2-006].
- **Integración adicional obligatoria:** [TSK-H2-008], [TSK-H5-006]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h2-006"></a>

#### TSK-H2-006 — Verificar: Evaluar vigencia, envío y rechazo de la oferta

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H2. Tipo: comprobación.
- **Objetivo y alcance:** Vigencia efectiva y revalidación del acto, envío acreditado y rechazo/sustitución por alcance.
- **Fuentes exactas:** Plan §§5.1–5.2, 7.3, 8; SPEC-FR-COM-003, SPEC-FR-PROP-004, SPEC-FR-PROP-006, SPEC-FR-PROP-007, AC-005, AC-008, AC-086, AC-087. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H2-006.
- **Bloques, contratos y unidades:** B03/B07/B08; C02/C03/C04/C05; T01/T08.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H1-019], [TSK-H2-005]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H1 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Canal externo sin conector conserva intención; dato/vigencia no acreditados dejan compromiso pendiente. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H2-005; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Oferta y hechos separados; envío manual probado conserva versión/destinatario; intención sola nunca se declara enviada. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Caducidad no rechaza ni desacepta; ratificar para un acto no modifica fecha emitida; nueva vigencia ofrecida exige versión. Silencio/leído no decisivos; retomar versión rechazada/sustituida exige comprobar contenido/cobertura; coste material ausente impide envío definitivo. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h2-007"></a>

#### TSK-H2-007 — Registrar, verificar y rectificar Acceptance exacta

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H2. Tipo: implementación.
- **Objetivo y alcance:** Identidad material, facultad, versión/términos/alcance, vigencia al acto, selección D018 y verificación que habilita Ganada.
- **Fuentes exactas:** Plan §§5.1, 7.2–7.3; SPEC-FR-COM-003, SPEC-FR-ACC-001, SPEC-FR-ACC-002, SPEC-FR-ACC-003, SPEC-FR-ACC-004, SPEC-FR-ACC-005, AC-002, AC-008, AC-009, AC-012, AC-013, AC-014, AC-016, AC-044, AC-056, AC-067, AC-075, AC-086, D018. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H2-007.
- **Bloques, contratos y unidades:** B03/B07; C02/C03/C04; T02.
- **Entregable previsto:** Áreas propuestas de aceptación y verificación con migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H1-019], [TSK-H2-006]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H1 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** D018 resuelto; selección no prevista requiere nueva versión; ausencia de evidencia conserva candidato. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Conservar Acceptance inmutable, registrar verificación explícita y cambio comercial solicitado en T02; rectificar error mediante hecho enlazado.
- **Salida observable:** Ganada solo sobre aceptación verificada; ni Administrador ni Human Approval sustituyen al cliente, fondos o mandato real.
- **Verificación y esperado:** Selección A expresamente prevista no contrata/rechaza B; no seleccionable exige v2 antes de aceptar. Llamada/anticipo admitidos con pruebas propias; registro tardío distingue vigencia acreditada de ficticia; escritura directa no altera Acceptance; error conserva original y reevaluación. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H2-008].
- **Integración adicional obligatoria:** [TSK-H2-010], [TSK-H6-002]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T02 conservan atomicidad y revisión conjunta.

<a id="tsk-h2-008"></a>

#### TSK-H2-008 — Verificar: Registrar, verificar y rectificar Acceptance exacta

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H2. Tipo: comprobación.
- **Objetivo y alcance:** Identidad material, facultad, versión/términos/alcance, vigencia al acto, selección D018 y verificación que habilita Ganada.
- **Fuentes exactas:** Plan §§5.1, 7.2–7.3; SPEC-FR-ID-002, SPEC-FR-COM-003, SPEC-FR-PROP-004, SPEC-FR-ACC-001, SPEC-FR-ACC-002, SPEC-FR-ACC-003, SPEC-FR-ACC-004, SPEC-FR-ACC-005, SPEC-FR-HIST-001, SPEC-FR-HA-005, AC-002, AC-008, AC-009, AC-012, AC-013, AC-016, AC-044, AC-056, AC-067, AC-075, AC-086, D018. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H2-008.
- **Bloques, contratos y unidades:** B03/B07; C02/C03/C04; T02.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H1-019], [TSK-H2-007]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H1 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** D018 resuelto; selección no prevista requiere nueva versión; ausencia de evidencia conserva candidato. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H2-007; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Ganada solo sobre aceptación verificada; ni Administrador ni Human Approval sustituyen al cliente, fondos o mandato real. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Selección A expresamente prevista no contrata/rechaza B; no seleccionable exige v2 antes de aceptar. Llamada/anticipo admitidos con pruebas propias; registro tardío distingue vigencia acreditada de ficticia; escritura directa no altera Acceptance; error conserva original y reevaluación. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T02 conservan atomicidad y revisión conjunta.

<a id="tsk-h2-009"></a>

#### TSK-H2-009 — Convertir cadena normal/directa en Booking íntegra

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H2. Tipo: implementación.
- **Objetivo y alcance:** Una Booking por Opportunity aceptada; prestaciones, modalidades, contribuciones, cantidades, noches y asignación nominal opcional inicial.
- **Fuentes exactas:** Plan §§5.1, 7.2–7.3, 9; SPEC-FR-ID-004, SPEC-FR-COM-002, SPEC-FR-PROP-003, SPEC-FR-BOOK-001, SPEC-FR-BOOK-002, SPEC-FR-BOOK-003, SPEC-FR-SVC-001, SPEC-FR-SVC-002, SPEC-FR-SVC-003, SPEC-FR-SVC-004, SPEC-FR-CONC-002, AC-014, AC-015, AC-016, AC-017, AC-019, AC-068, D018. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H2-009.
- **Bloques, contratos y unidades:** B03/B04/B07/B08; C01/C02/C03/C04; T01/T02/T03.
- **Entregable previsto:** Áreas propuestas de conversión, expediente, detalle inicial y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H1-019], [TSK-H2-008], [TSK-H1-006], [TSK-H0-012]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H1 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Cadena material incompleta permite preparación, no Booking aceptada; sin split/merge extraordinario. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Componer/reutilizar la cadena válida en una unidad T03; mantener unicidad/raíz Opportunity y certeza de cada alcance; no unir prestaciones incompatibles por compartir catálogo.
- **Salida observable:** Booking Pendiente de preparación con cadena, términos y detalle obligatorio íntegros; sin fondos ni confirmación operacional implícitos.
- **Verificación y esperado:** Dos altas simultáneas y reintento tras respuesta perdida devuelven una Booking completa; clave distinta sobre misma Opportunity tampoco crea segunda. Fallos intermedios hacen rollback de unidad; preparaciones previas válidas siguen preparaciones. Sin Lead/envíos/factores aceptados ficticios. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H2-010].
- **Integración adicional obligatoria:** [TSK-H2-011], [TSK-H4-021], [TSK-H6-001], [TSK-H6-002], [TSK-H6-003], [TSK-H6-016]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01/T02/T03 conservan atomicidad y revisión conjunta.

<a id="tsk-h2-010"></a>

#### TSK-H2-010 — Verificar: Convertir cadena normal/directa en Booking íntegra

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H2. Tipo: comprobación.
- **Objetivo y alcance:** Una Booking por Opportunity aceptada; prestaciones, modalidades, contribuciones, cantidades, noches y asignación nominal opcional inicial.
- **Fuentes exactas:** Plan §§5.1, 7.2–7.3, 9; SPEC-FR-ID-005, SPEC-FR-COM-002, SPEC-FR-BOOK-001, SPEC-FR-BOOK-002, SPEC-FR-BOOK-003, SPEC-FR-SVC-001, SPEC-FR-IDEMP-001, SPEC-FR-IDEMP-002, SPEC-FR-CONC-002, SPEC-FR-CONC-003, AC-014, AC-015, AC-016, AC-068, D018. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H2-010.
- **Bloques, contratos y unidades:** B03/B04/B07/B08; C01/C02/C03/C04; T01/T02/T03.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H1-019], [TSK-H2-009]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H1 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Cadena material incompleta permite preparación, no Booking aceptada; sin split/merge extraordinario. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H2-009; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Booking Pendiente de preparación con cadena, términos y detalle obligatorio íntegros; sin fondos ni confirmación operacional implícitos. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Dos altas simultáneas y reintento tras respuesta perdida devuelven una Booking completa; clave distinta sobre misma Opportunity tampoco crea segunda. Fallos intermedios hacen rollback de unidad; preparaciones previas válidas siguen preparaciones. Sin Lead/envíos/factores aceptados ficticios. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01/T02/T03 conservan atomicidad y revisión conjunta.

<a id="tsk-h2-011"></a>

#### TSK-H2-011 — Verificar cantidades iniciales y lista nominal por alcance

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H2. Tipo: comprobación.
- **Objetivo y alcance:** Detalle de conversión por servicio/noche, unidades y personas nominales necesarias sin doble cómputo.
- **Fuentes exactas:** Plan §§5.1, 7.3, 9–10; SPEC-FR-ID-004, SPEC-FR-CAT-002, SPEC-FR-PROP-003, SPEC-FR-BOOK-003, SPEC-FR-SVC-001, SPEC-FR-SVC-002, SPEC-FR-SVC-003, SPEC-FR-SVC-004, AC-017, AC-019. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H2-011.
- **Bloques, contratos y unidades:** B02/B03/B04/B07; C01/C02/C03; T03.
- **Entregable previsto:** Casos/evidencias propuestos de cantidades y privacidad. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H1-019], [TSK-H2-010]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H1 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Datos personales reales esperan finalidad/autorización; fixtures sintéticos bastan. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar dominio y persistencia real de cantidades originadas por conversión; contrastar listas parciales y proyecciones.
- **Salida observable:** Detalle inicial y origen de cada contribución reconstruibles; edición material posterior se verifica en H4 sin dar por confirmada capacidad en H2.
- **Verificación y esperado:** 10 con rafting/2 noches + 2 sin rafting/1 noche → rafting10/cena12/noches12 y10; 4 nombres en12 no suman16 ni crean8 personas ficticias. Casa completa sin reparto de habitaciones; dos prestaciones de catálogo igual mantienen identidad si horario/proveedor difieren. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T03 conservan atomicidad y revisión conjunta.

<a id="tsk-h2-012"></a>

#### TSK-H2-012 — Registrar salida de contratación y conversión

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H2. Tipo: documentación/evidencia.
- **Objetivo y alcance:** Consolidar inmutabilidad y conversión única con cantidades iniciales.
- **Fuentes exactas:** Plan §§9–10; Plan §9 (resultado y salida del hito); correspondencias específicas de §6. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H2-012.
- **Bloques, contratos y unidades:** B03/B04/B07/B10; C01–C05; T01/T02/T03.
- **Entregable previsto:** Informe propuesto de hito y matriz de transacciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H1-019], [TSK-H2-001], [TSK-H2-002], [TSK-H2-003], [TSK-H2-004], [TSK-H2-005], [TSK-H2-006], [TSK-H2-007], [TSK-H2-008], [TSK-H2-009], [TSK-H2-010], [TSK-H2-011]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H1 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Confirmación completa de Booking aún corresponde a H4 con economía H3. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Revisar pruebas T01/T02/T03, escritura directa, selecciones y matrices de cantidades, incluidos fallos y carreras.
- **Salida observable:** H2 completo únicamente con evidencia requerida; confirmación, fondos y cierres se conservan sin acreditar.
- **Verificación y esperado:** Ninguna unidad visible incompleta ni criterio de conversión satisfecho solo por fixture de estado; todas las referencias de aceptación comprobadas. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** La recopilación parcial puede acompañar trabajo independiente; el cierre espera todas sus dependencias. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01/T02/T03 conservan atomicidad y revisión conjunta.

### 4.4. H3 — Economía operativa

<a id="tsk-h3-001"></a>

#### TSK-H3-001 — Determinar vencimientos y cobertura de obligaciones

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: implementación.
- **Objetivo y alcance:** Payment Policy/Schedule/Expected Payment, 50/50 y excepción, 100 % a menos de 7 días, cobertura desde porciones verificadas.
- **Fuentes exactas:** Plan §§5.2, 7.3, 9; SPEC-FR-ECON-001, SPEC-FR-ECON-002, AC-023, AC-025, AC-041, AC-042, PM-03, D020, D023. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-001.
- **Bloques, contratos y unidades:** B05; C02/C03/C06; T05/T06.
- **Entregable previsto:** Áreas propuestas de obligaciones y políticas aplicadas con migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H1-012], [TSK-H1-010]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Referencia/importe/política ausentes detienen obligación afectada; no plazo inventado. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Registrar vencimientos, base/versiones y modificaciones justificadas; calcular anticipo redondeado y saldo por diferencia; exponer evaluación de cobertura para integrar fondos.
- **Salida observable:** Obligaciones y vencimiento reproducibles; cobertura solo cambia mediante hechos verificados, integrada en la tarea de fondos.
- **Verificación y esperado:** PM-03 500,01+500,00; día límite completo; previsión no crea recepción; excepción necesita actor/motivo. Ajuste conserva deuda original y causa, sin deuda nueva por simple devolución. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H3-002].
- **Integración adicional obligatoria:** [TSK-H3-006], [TSK-H4-021], [TSK-H6-005]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05/T06 conservan atomicidad y revisión conjunta.

<a id="tsk-h3-002"></a>

#### TSK-H3-002 — Verificar: Determinar vencimientos y cobertura de obligaciones

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: comprobación.
- **Objetivo y alcance:** Payment Policy/Schedule/Expected Payment, 50/50 y excepción, 100 % a menos de 7 días, cobertura desde porciones verificadas.
- **Fuentes exactas:** Plan §§5.2, 7.3, 9; SPEC-FR-ECON-001, SPEC-FR-ECON-002, AC-025, AC-041, AC-042, PM-03, D020, D023. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-002.
- **Bloques, contratos y unidades:** B05; C02/C03/C06; T05/T06.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H3-001]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Referencia/importe/política ausentes detienen obligación afectada; no plazo inventado. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H3-001; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Obligaciones y vencimiento reproducibles; cobertura solo cambia mediante hechos verificados, integrada en la tarea de fondos. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** PM-03 500,01+500,00; día límite completo; previsión no crea recepción; excepción necesita actor/motivo. Ajuste conserva deuda original y causa, sin deuda nueva por simple devolución. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05/T06 conservan atomicidad y revisión conjunta.

<a id="tsk-h3-003"></a>

#### TSK-H3-003 — Distinguir detección, recepción y conciliación de cobros

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: implementación.
- **Objetivo y alcance:** Customer Payment, propuesta/verificación de Reconciliation y discrepancias; parciales y dos transferencias similares.
- **Fuentes exactas:** Plan §§5.1, 7.2–7.3; SPEC-FR-ECON-003, SPEC-FR-ECON-004, SPEC-FR-ECON-006, SPEC-FR-IDEMP-003, AC-025, AC-026, AC-028. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-003.
- **Bloques, contratos y unidades:** B05/B07; C01/C02/C03/C04/C06; T05.
- **Entregable previsto:** Áreas propuestas de cobros y conciliación con migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H3-002], [TSK-H1-014], [TSK-H1-018]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Correspondencia/fuente dudosa suspende solo porción afectada. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Registrar movimiento e identificación fiable, verificar recepción separadamente, resolver dudas humanamente y conservar correcciones; preparar asignaciones comprobables.
- **Salida observable:** Recepción y correspondencia acreditadas con original/corrección; la validez de las porciones se completa con fondos.
- **Verificación y esperado:** Esperado/aviso no dinero; recibido500 y solo200 identificados deja300 sin conciliar; aviso duplicado no suma y segunda transferencia real igual se conserva; error posterior enlaza ajuste sin reversión bancaria. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H3-004].
- **Integración adicional obligatoria:** [TSK-H3-006], [TSK-H4-019], [TSK-H6-005]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05 conservan atomicidad y revisión conjunta.

<a id="tsk-h3-004"></a>

#### TSK-H3-004 — Verificar: Distinguir detección, recepción y conciliación de cobros

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: comprobación.
- **Objetivo y alcance:** Customer Payment, propuesta/verificación de Reconciliation y discrepancias; parciales y dos transferencias similares.
- **Fuentes exactas:** Plan §§5.1, 7.2–7.3; SPEC-FR-ACC-005, SPEC-FR-ECON-003, SPEC-FR-ECON-004, SPEC-FR-ECON-006, SPEC-FR-IDEMP-003, AC-025, AC-026, AC-028. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-004.
- **Bloques, contratos y unidades:** B05/B07; C01/C02/C03/C04/C06; T05.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H3-003]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Correspondencia/fuente dudosa suspende solo porción afectada. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H3-003; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Recepción y correspondencia acreditadas con original/corrección; la validez de las porciones se completa con fondos. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Esperado/aviso no dinero; recibido500 y solo200 identificados deja300 sin conciliar; aviso duplicado no suma y segunda transferencia real igual se conserva; error posterior enlaza ajuste sin reversión bancaria. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05 conservan atomicidad y revisión conjunta.

<a id="tsk-h3-005"></a>

#### TSK-H3-005 — Asignar y consumir porciones sin sobreasignación

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: implementación.
- **Objetivo y alcance:** Movimiento/fondos compartidos, finalidad, destinos dentro del expediente, cobertura de obligaciones y ajustes reversibles por historia.
- **Fuentes exactas:** Plan §§5.1–5.2, 7.2–7.3; SPEC-FR-CHG-008, SPEC-FR-ECON-002, SPEC-FR-ECON-004, SPEC-FR-ECON-005, SPEC-FR-ECON-006, SPEC-FR-IDEMP-002, SPEC-FR-CONC-002, AC-023, AC-026, AC-027, AC-028, AC-040, AC-044, AC-068, PM-08, PM-11, PM-12, PM-13, D029. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-005.
- **Bloques, contratos y unidades:** B05/B08; C02/C03/C06; T05/T07.
- **Entregable previsto:** Áreas propuestas de porciones/asignaciones y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H3-004]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Derecho D019 previo para ajustes dependientes; fondos no determinan derecho ni autorizan financiación/compensación entre clientes. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Serializar raíz compartida y conservar recibido/previsto/asignado/consumido/devuelto/disponible; actualizar cobertura en la misma unidad material.
- **Salida observable:** Suma por finalidad coherente y evidencia de rollback/reintento; carrera real con Refund/fianza se añade obligatoriamente en H4.
- **Verificación y esperado:** 100 disponibles y dos consumos80: no160; ambos órdenes/solapamiento y ausencia inicial de hijos. Varios pagos cubren obligación y un pago destinos sin duplicar; PM-11/12/13 conserva total, pesos/restos/orden legítimos; PM-08 invierte original exacto. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H3-006].
- **Integración adicional obligatoria:** [TSK-H4-019], [TSK-H6-005], [TSK-H6-016]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05/T07 conservan atomicidad y revisión conjunta.

<a id="tsk-h3-006"></a>

#### TSK-H3-006 — Verificar: Asignar y consumir porciones sin sobreasignación

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: comprobación.
- **Objetivo y alcance:** Movimiento/fondos compartidos, finalidad, destinos dentro del expediente, cobertura de obligaciones y ajustes reversibles por historia.
- **Fuentes exactas:** Plan §§5.1–5.2, 7.2–7.3; SPEC-FR-ECON-002, SPEC-FR-ECON-004, SPEC-FR-ECON-005, SPEC-FR-ECON-006, SPEC-FR-IDEMP-001, SPEC-FR-CONC-003, AC-026, AC-027, AC-028, AC-044, AC-068, PM-08, PM-11, PM-12, PM-13, D029. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-006.
- **Bloques, contratos y unidades:** B05/B08; C02/C03/C06; T05/T07.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H3-005]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Derecho D019 previo para ajustes dependientes; fondos no determinan derecho ni autorizan financiación/compensación entre clientes. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H3-005; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Suma por finalidad coherente y evidencia de rollback/reintento; carrera real con Refund/fianza se añade obligatoriamente en H4. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** 100 disponibles y dos consumos80: no160; ambos órdenes/solapamiento y ausencia inicial de hijos. Varios pagos cubren obligación y un pago destinos sin duplicar; PM-11/12/13 conserva total, pesos/restos/orden legítimos; PM-08 invierte original exacto. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05/T07 conservan atomicidad y revisión conjunta.

<a id="tsk-h3-007"></a>

#### TSK-H3-007 — Recibir, revisar y vincular factura externa al cliente

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: implementación.
- **Objetivo y alcance:** Exigencia documental, original, emisor/destinatario/importe/alcance y corrección; porciones por servicio.
- **Fuentes exactas:** Plan §§5.3, 7.3; SPEC-FR-ECON-010, AC-045, AC-046. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-007.
- **Bloques, contratos y unidades:** B05/B07; C02/C03/C04/C06; —.
- **Entregable previsto:** Áreas propuestas de documento externo y correspondencia, con migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H1-014], [TSK-H3-006]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** DM-PENDING-002 / BR-PENDING-021/022/033: revisión operativa no valida fiscalidad ni crea mandato. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Registrar necesidad, recepción, revisión y vinculación comprobada; discrepancia abre revisión conservando original y vínculos.
- **Salida observable:** Cada estado documental sustentado; ninguna factura o enlace acredita pago ni legitimidad fiscal del modelo.
- **Verificación y esperado:** Recibida no Revisada/Vinculada; destinatario o importe distintos producen incidencia; un documento cubre varios servicios solo con porciones verificables; no documento ficticio de Tararí. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H3-008].
- **Integración adicional obligatoria:** [TSK-H3-012], [TSK-H5-014], [TSK-H5-016], [TSK-H6-007]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h3-008"></a>

#### TSK-H3-008 — Verificar: Recibir, revisar y vincular factura externa al cliente

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: comprobación.
- **Objetivo y alcance:** Exigencia documental, original, emisor/destinatario/importe/alcance y corrección; porciones por servicio.
- **Fuentes exactas:** Plan §§5.3, 7.3; SPEC-FR-ECON-010, AC-045. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-008.
- **Bloques, contratos y unidades:** B05/B07; C02/C03/C04/C06; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H3-007]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** DM-PENDING-002 / BR-PENDING-021/022/033: revisión operativa no valida fiscalidad ni crea mandato. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H3-007; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Cada estado documental sustentado; ninguna factura o enlace acredita pago ni legitimidad fiscal del modelo. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Recibida no Revisada/Vinculada; destinatario o importe distintos producen incidencia; un documento cubre varios servicios solo con porciones verificables; no documento ficticio de Tararí. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h3-009"></a>

#### TSK-H3-009 — Separar gestión de fondos y cierre documental de suplido

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: implementación.
- **Objetivo y alcance:** Suplido con cliente/proveedor/servicio, fondos, factura, pago y conciliación como componentes separados.
- **Fuentes exactas:** Plan §§5.1, 7.3; SPEC-FR-ACC-005, SPEC-FR-ECON-009, SPEC-FR-SEC-007, AC-044, AC-046, AC-078. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-009.
- **Bloques, contratos y unidades:** B05/B07; C01/C02/C03/C06; T05/T07.
- **Entregable previsto:** Áreas propuestas de gestión externa y evaluación documental con migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H3-008]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Mandato solo real y aceptado; validación profesional sigue DM-PENDING-002. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Registrar gestión, estado de cada componente y evaluación/reapertura de cierre documental; dejar pendiente componente ausente.
- **Salida observable:** Criterios documentales independientes; no cierre de Booking por cerrar suplido ni cobro/pago inferidos.
- **Verificación y esperado:** Fondos ajenos no ingreso/coste propio; recibir fondos no crea mandato; pago sin factura deja seguimiento y evaluación abierta; nueva diferencia reabre solo fundamento afectado. Integrar pago ejecutado con tarea de salidas proveedor. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H3-010].
- **Integración adicional obligatoria:** [TSK-H3-012], [TSK-H5-014], [TSK-H6-005]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05/T07 conservan atomicidad y revisión conjunta.

<a id="tsk-h3-010"></a>

#### TSK-H3-010 — Verificar: Separar gestión de fondos y cierre documental de suplido

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: comprobación.
- **Objetivo y alcance:** Suplido con cliente/proveedor/servicio, fondos, factura, pago y conciliación como componentes separados.
- **Fuentes exactas:** Plan §§5.1, 7.3; SPEC-FR-ACC-005, SPEC-FR-ECON-009, SPEC-FR-SEC-007, AC-044. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-010.
- **Bloques, contratos y unidades:** B05/B07; C01/C02/C03/C06; T05/T07.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H3-009]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Mandato solo real y aceptado; validación profesional sigue DM-PENDING-002. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H3-009; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Criterios documentales independientes; no cierre de Booking por cerrar suplido ni cobro/pago inferidos. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Fondos ajenos no ingreso/coste propio; recibir fondos no crea mandato; pago sin factura deja seguimiento y evaluación abierta; nueva diferencia reabre solo fundamento afectado. Integrar pago ejecutado con tarea de salidas proveedor. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05/T07 conservan atomicidad y revisión conjunta.

<a id="tsk-h3-011"></a>

#### TSK-H3-011 — Registrar programación y pago acreditado al proveedor

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: implementación.
- **Objetivo y alcance:** Provider Payment, intención/ejecución parcial e incidencia; movimiento real y porciones T07 sin transferencia externa.
- **Fuentes exactas:** Plan §§7.2–7.3, 8; SPEC-FR-ECON-011, AC-045, AC-046, AC-063. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-011.
- **Bloques, contratos y unidades:** B05/B07/B08; C02/C03/C04/C05/C06; T07/T08.
- **Entregable previsto:** Áreas propuestas de pagos a proveedor y registro de salidas con migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H3-010], [TSK-H3-006]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Falta de fondos bloquea ejecución dependiente; falta de factura no impide registrar una salida real acreditada. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Programar con datos conocidos, registrar pagos verificados y correspondencia de fondos; retirar programación solo cuando no hay ejecución incierta; integrar cierre documental.
- **Salida observable:** Salida, historia y porciones se confirman juntas; no movimiento duplicado ni falsa entrega externa.
- **Verificación y esperado:** Programado no Pagado; salida parcial deja saldo; anomalía real se registra con incidencia sin aprobación retroactiva. Factura ausente deja suplido abierto; documento correcto/conciliación posteriores permiten resolver; PM-08 ajuste exacto. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H3-012].
- **Integración adicional obligatoria:** [TSK-H4-019], [TSK-H5-014], [TSK-H6-005]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T07/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h3-012"></a>

#### TSK-H3-012 — Verificar: Registrar programación y pago acreditado al proveedor

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: comprobación.
- **Objetivo y alcance:** Provider Payment, intención/ejecución parcial e incidencia; movimiento real y porciones T07 sin transferencia externa.
- **Fuentes exactas:** Plan §§7.2–7.3, 8; SPEC-FR-ECON-009, SPEC-FR-ECON-011, AC-045, AC-046, AC-063. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-012.
- **Bloques, contratos y unidades:** B05/B07/B08; C02/C03/C04/C05/C06; T07/T08.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H3-011]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Falta de fondos bloquea ejecución dependiente; falta de factura no impide registrar una salida real acreditada. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H3-011; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Salida, historia y porciones se confirman juntas; no movimiento duplicado ni falsa entrega externa. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Programado no Pagado; salida parcial deja saldo; anomalía real se registra con incidencia sin aprobación retroactiva. Factura ausente deja suplido abierto; documento correcto/conciliación posteriores permiten resolver; PM-08 ajuste exacto. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T07/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h3-013"></a>

#### TSK-H3-013 — Aplicar honorarios, costes, promoción y Tararí

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: implementación.
- **Objetivo y alcance:** Snapshot económico por alcance, previsto/confirmado/real, remuneración/costes propios separados de fondos; promoción con modalidad concreta.
- **Fuentes exactas:** Plan §§5.1–5.2, 6.5, 7.3; SPEC-FR-CAT-006, SPEC-FR-SVC-009, SPEC-FR-ECON-012, SPEC-FR-ECON-013, SPEC-FR-ECON-014, SPEC-FR-HIST-002, SPEC-FR-SEC-007, AC-038, AC-044, AC-047, AC-048, AC-049, AC-056, AC-078, AC-085, PM-09, D019. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-013.
- **Bloques, contratos y unidades:** B02/B05; C01/C02/C03; —.
- **Entregable previsto:** Áreas propuestas de economía propia, aplicación promocional y snapshots con migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H1-010], [TSK-H3-006]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Costes de upsells/tipos no verificados impiden solo cálculo definitivo dependiente; D019 resuelto. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Persistir componentes y cálculo aplicado; usar versión/modalidad legítima para promoción y configuración histórica aprobada de Tararí.
- **Salida observable:** Importes internos reconstruibles con certeza y privacidad; no motor fiscal, factura interna ni promedio/prorrateo inventado.
- **Verificación y esperado:** Novio en A150 y 15 asistentes elegibles: gratuidad150, asistentes/deuda proveedor intactos; sin modalidad no efecto definitivo. Tararí2 copas15/3,80, extras175/325 sin coste extrapolado. Rentabilidad=honorarios−costes propios; desconocido no cero; PM-09 historia tras cambio de tarifa. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H3-014].
- **Integración adicional obligatoria:** [TSK-H6-017], [TSK-H6-005]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h3-014"></a>

#### TSK-H3-014 — Verificar: Aplicar honorarios, costes, promoción y Tararí

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: comprobación.
- **Objetivo y alcance:** Snapshot económico por alcance, previsto/confirmado/real, remuneración/costes propios separados de fondos; promoción con modalidad concreta.
- **Fuentes exactas:** Plan §§5.1–5.2, 6.5, 7.3; SPEC-FR-CAT-004, SPEC-FR-CAT-006, SPEC-FR-SVC-009, SPEC-FR-ECON-012, SPEC-FR-ECON-013, SPEC-FR-ECON-014, SPEC-FR-HIST-002, SPEC-FR-SEC-007, AC-038, AC-044, AC-047, AC-048, AC-049, AC-085, PM-09, D019. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-014.
- **Bloques, contratos y unidades:** B02/B05; C01/C02/C03; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H3-013]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Costes de upsells/tipos no verificados impiden solo cálculo definitivo dependiente; D019 resuelto. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H3-013; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Importes internos reconstruibles con certeza y privacidad; no motor fiscal, factura interna ni promedio/prorrateo inventado. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Novio en A150 y 15 asistentes elegibles: gratuidad150, asistentes/deuda proveedor intactos; sin modalidad no efecto definitivo. Tararí2 copas15/3,80, extras175/325 sin coste extrapolado. Rentabilidad=honorarios−costes propios; desconocido no cero; PM-09 historia tras cambio de tarifa. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h3-015"></a>

#### TSK-H3-015 — Registrar salida de economía operativa

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H3. Tipo: documentación/evidencia.
- **Objetivo y alcance:** Conservar evidencias T05/T07 y dependencias abiertas de Refund/fianza.
- **Fuentes exactas:** Plan §§9–10; Plan §9 (resultado y salida del hito); correspondencias específicas de §6. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H3-015.
- **Bloques, contratos y unidades:** B05/B07/B08/B10; C01–C06; T05/T07.
- **Entregable previsto:** Informe propuesto de economía con porciones y resultados de migración. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H2-012], [TSK-H3-001], [TSK-H3-002], [TSK-H3-003], [TSK-H3-004], [TSK-H3-005], [TSK-H3-006], [TSK-H3-007], [TSK-H3-008], [TSK-H3-009], [TSK-H3-010], [TSK-H3-011], [TSK-H3-012], [TSK-H3-013], [TSK-H3-014]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H2 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Fiscalidad/datos ausentes localizados; Refund/fianza completos y su carrera con fondos en H4. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Revisar cobertura, conservación de fondos, permisos y separación factura/pago/suplido; comprobar seguimiento disponible sin H5.
- **Salida observable:** Economía base verificable y lista para confirmación H4; ninguna evidencia monetaria ficticia.
- **Verificación y esperado:** No cerrar si sobreasignación, falta de evidencia o historia; pruebas de cobros reales son registros sintéticos en entorno aislado, sin transferencia ejecutada. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** La recopilación parcial puede acompañar trabajo independiente; el cierre espera todas sus dependencias. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05/T07 conservan atomicidad y revisión conjunta.

### 4.5. H4 — Operación, cambios y cancelación

<a id="tsk-h4-001"></a>

#### TSK-H4-001 — Aplicar requisitos personales y Required Document

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: implementación.
- **Objetivo y alcance:** B07 mínimo para preparación: necesidad/versiones por servicio/noche, revisión/no aplicabilidad e incidencia documental.
- **Fuentes exactas:** Plan §§4, 8–9; SPEC-FR-ID-004, SPEC-FR-CAT-007, SPEC-FR-SVC-004, SPEC-FR-COORD-005, SPEC-FR-SEC-006, AC-019, AC-051. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-001.
- **Bloques, contratos y unidades:** B04/B07; C01/C02/C03/C04/C06; —.
- **Entregable previsto:** Áreas propuestas de requisitos aplicados y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H1-008], [TSK-H1-014], [TSK-H1-018]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** DM-PENDING-005 y necesidad/finalidad real; sintéticos permiten ensayo sin política definitiva de retención. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Aplicar exigencias materiales, comprobar cumplimiento y reabrir solo alcance afectado; mantener nominales y habitaciones opcionales salvo necesidad real.
- **Salida observable:** Requisitos mínimos B07 disponibles antes de confirmar/prestar; estados y bloqueos materiales acreditados.
- **Verificación y esperado:** Documento S1 recibido sin revisión no satisface; S2 independiente continúa; No aplica motivado no dispensa requisito; nueva versión/alcance reabre exigencia y preserva revisión anterior. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H4-002].
- **Integración adicional obligatoria:** [TSK-H4-021], [TSK-H4-023], [TSK-H5-014]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h4-002"></a>

#### TSK-H4-002 — Verificar: Aplicar requisitos personales y Required Document

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: comprobación.
- **Objetivo y alcance:** B07 mínimo para preparación: necesidad/versiones por servicio/noche, revisión/no aplicabilidad e incidencia documental.
- **Fuentes exactas:** Plan §§4, 8–9; SPEC-FR-ID-004, SPEC-FR-CAT-007, SPEC-FR-SVC-004, SPEC-FR-COORD-005, SPEC-FR-SEC-006, AC-019, AC-051. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-002.
- **Bloques, contratos y unidades:** B04/B07; C01/C02/C03/C04/C06; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-001]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** DM-PENDING-005 y necesidad/finalidad real; sintéticos permiten ensayo sin política definitiva de retención. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H4-001; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Requisitos mínimos B07 disponibles antes de confirmar/prestar; estados y bloqueos materiales acreditados. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Documento S1 recibido sin revisión no satisface; S2 independiente continúa; No aplica motivado no dispensa requisito; nueva versión/alcance reabre exigencia y preserva revisión anterior. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h4-003"></a>

#### TSK-H4-003 — Gestionar Incident y su impacto mínimo

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: implementación.
- **Objetivo y alcance:** B07 mínimo: gravedad separada, detección/hipótesis/causa, gestión, resolución, cierre y reapertura con evidencia.
- **Fuentes exactas:** Plan §§4, 8–9; SPEC-FR-COORD-006, AC-052, AC-060. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-003.
- **Bloques, contratos y unidades:** B04/B06/B07; C02/C03/C04/C06; —.
- **Entregable previsto:** Áreas propuestas de incidencias/impactos y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-002], [TSK-H1-004]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Datos personales/evidencia autorizados; ninguna excepción crítica inventada. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Implementar ciclo e impacto por alcance sin sustituir fase de Booking/servicio; conservar gravedad y comprobación de solución.
- **Salida observable:** Impacto y ciclo verificables; listo para preparación y cierre posterior sin dependencia de H5.
- **Verificación y esperado:** En gestión sigue crítica no resuelta; revisar gravedad exige fuente/motivo; reapertura conserva cierre/solución anteriores; resolver Incident no ejecuta Refund ni cierra economía. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H4-004].
- **Integración adicional obligatoria:** [TSK-H4-021], [TSK-H4-023], [TSK-H5-016], [TSK-H6-007]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h4-004"></a>

#### TSK-H4-004 — Verificar: Gestionar Incident y su impacto mínimo

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: comprobación.
- **Objetivo y alcance:** B07 mínimo: gravedad separada, detección/hipótesis/causa, gestión, resolución, cierre y reapertura con evidencia.
- **Fuentes exactas:** Plan §§4, 8–9; SPEC-FR-ID-005, SPEC-FR-COORD-006, AC-052, AC-060. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-004.
- **Bloques, contratos y unidades:** B04/B06/B07; C02/C03/C04/C06; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-003]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Datos personales/evidencia autorizados; ninguna excepción crítica inventada. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H4-003; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Impacto y ciclo verificables; listo para preparación y cierre posterior sin dependencia de H5. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** En gestión sigue crítica no resuelta; revisar gravedad exige fuente/motivo; reapertura conserva cierre/solución anteriores; resolver Incident no ejecuta Refund ni cierra economía. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h4-005"></a>

#### TSK-H4-005 — Registrar y verificar disponibilidad por alcance

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: implementación.
- **Objetivo y alcance:** Consulta/respuesta espontánea, fuente, certeza, vigencia y revisión mínima; autoridad externa diferenciada.
- **Fuentes exactas:** Plan §§5.1, 7.3; SPEC-FR-SVC-006, SPEC-FR-SVC-010, AC-020. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-005.
- **Bloques, contratos y unidades:** B04/B07/B09; C02/C03/C04/C06; T04.
- **Entregable previsto:** Áreas propuestas de disponibilidad y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-002]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Fuente/capacidad ausentes bloquean compromiso afectado; no conector real. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Conservar evidencias y cobertura sin tratarlas como confirmación; abrir revisión/seguimiento ante vencimiento o discrepancia.
- **Salida observable:** Cobertura actual y prueba histórica diferenciadas; ninguna consulta confirma prestación.
- **Verificación y esperado:** Sin respuesta no disponible; respuesta para12 no cubre16 ni otra noche; más reciente verificada conserva anterior y no cambia acuerdo aceptado; noticia ambigua sigue candidata. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H4-006].
- **Integración adicional obligatoria:** [TSK-H4-021]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T04 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-006"></a>

#### TSK-H4-006 — Verificar: Registrar y verificar disponibilidad por alcance

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: comprobación.
- **Objetivo y alcance:** Consulta/respuesta espontánea, fuente, certeza, vigencia y revisión mínima; autoridad externa diferenciada.
- **Fuentes exactas:** Plan §§5.1, 7.3; SPEC-FR-CAT-003, SPEC-FR-SVC-006, SPEC-FR-SVC-010, AC-020. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-006.
- **Bloques, contratos y unidades:** B04/B07/B09; C02/C03/C04/C06; T04.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-005]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Fuente/capacidad ausentes bloquean compromiso afectado; no conector real. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H4-005; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Cobertura actual y prueba histórica diferenciadas; ninguna consulta confirma prestación. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Sin respuesta no disponible; respuesta para12 no cubre16 ni otra noche; más reciente verificada conserva anterior y no cambia acuerdo aceptado; noticia ambigua sigue candidata. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T04 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-007"></a>

#### TSK-H4-007 — Registrar opciones, vigencia y liberación

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: implementación.
- **Objetivo y alcance:** Capacity Hold anterior o posterior a Booking, vencimiento/prórroga expresos, liberación solicitada/real parcial.
- **Fuentes exactas:** Plan §§5.1, 7.3, 8; SPEC-FR-SVC-007, AC-021. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-007.
- **Bloques, contratos y unidades:** B04/B07/B08; C02/C03/C04/C05/C06; T04/T08.
- **Entregable previsto:** Áreas propuestas de opciones y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-006]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Vencimiento/adelanto ausentes mantienen revalidación; no fecha inventada. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Registrar compromiso temporal real y sus dimensiones de vigencia/liberación, preservar vínculo y condiciones.
- **Salida observable:** Opción nunca acredita reserva firme; historial y cantidad restante verificables sin parámetros ficticios.
- **Verificación y esperado:** Sin vencimiento crea necesidad de revalidar; solicitud de liberación requiere envío acreditado y no libera; paso del tiempo no libera; respuesta/prórroga parcial modifica solo alcance cubierto; conversión conserva opción de origen. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H4-008].
- **Integración adicional obligatoria:** [TSK-H4-021]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T04/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-008"></a>

#### TSK-H4-008 — Verificar: Registrar opciones, vigencia y liberación

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: comprobación.
- **Objetivo y alcance:** Capacity Hold anterior o posterior a Booking, vencimiento/prórroga expresos, liberación solicitada/real parcial.
- **Fuentes exactas:** Plan §§5.1, 7.3, 8; SPEC-FR-SVC-007, AC-021. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-008.
- **Bloques, contratos y unidades:** B04/B07/B08; C02/C03/C04/C05/C06; T04/T08.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-007]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Vencimiento/adelanto ausentes mantienen revalidación; no fecha inventada. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H4-007; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Opción nunca acredita reserva firme; historial y cantidad restante verificables sin parámetros ficticios. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Sin vencimiento crea necesidad de revalidar; solicitud de liberación requiere envío acreditado y no libera; paso del tiempo no libera; respuesta/prórroga parcial modifica solo alcance cubierto; conversión conserva opción de origen. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T04/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-009"></a>

#### TSK-H4-009 — Confirmar prestación externa o interna con cobertura

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: implementación.
- **Objetivo y alcance:** Provider Confirmation inmutable y confirmación interna, capacidad, fecha/hora/cantidad/condiciones y requisitos pertinentes.
- **Fuentes exactas:** Plan §§5.1, 7.2–7.3; SPEC-FR-CAT-007, SPEC-FR-SVC-008, SPEC-FR-SVC-009, AC-020, AC-022, AC-048, AC-092. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-009.
- **Bloques, contratos y unidades:** B04/B07/B08; C02/C03/C04/C06; T04/T08.
- **Entregable previsto:** Áreas propuestas de confirmaciones/servicios y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-008], [TSK-H4-004]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Capacidad/condición imprescindible ausente bloquea solo confirmación afectada. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Registrar hecho válido o rectificación enlazada y evaluar Confirmado solo en alcance cubierto; distinguir propio de externo.
- **Salida observable:** Confirmación por servicio comprobada, sin estado heredado de Booking ni cobertura tácita.
- **Verificación y esperado:** Llamada inequívoca autorizada sin escrito posterior; S1 cubierto no confirma S2; Tararí exige evidencia interna sin Provider ficticio; permiso/guarda faltante rechaza; escritura directa no edita confirmación histórica. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H4-010].
- **Integración adicional obligatoria:** [TSK-H4-021], [TSK-H6-001]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T04/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-010"></a>

#### TSK-H4-010 — Verificar: Confirmar prestación externa o interna con cobertura

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: comprobación.
- **Objetivo y alcance:** Provider Confirmation inmutable y confirmación interna, capacidad, fecha/hora/cantidad/condiciones y requisitos pertinentes.
- **Fuentes exactas:** Plan §§5.1, 7.2–7.3; SPEC-FR-CAT-007, SPEC-FR-SVC-008, SPEC-FR-SVC-009, AC-020, AC-022, AC-048, AC-092. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-010.
- **Bloques, contratos y unidades:** B04/B07/B08; C02/C03/C04/C06; T04/T08.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-009]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Capacidad/condición imprescindible ausente bloquea solo confirmación afectada. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H4-009; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Confirmación por servicio comprobada, sin estado heredado de Booking ni cobertura tácita. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Llamada inequívoca autorizada sin escrito posterior; S1 cubierto no confirma S2; Tararí exige evidencia interna sin Provider ficticio; permiso/guarda faltante rechaza; escritura directa no edita confirmación histórica. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T04/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-011"></a>

#### TSK-H4-011 — Evaluar y aplicar modificación operativa y revalidación

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: implementación.
- **Objetivo y alcance:** Solicitud/evaluación/proveedor/aprobación/aplicación parcial/rechazo/retirada; cantidades/noches/horario/lugar y Review solo materiales.
- **Fuentes exactas:** Plan §§5.1–5.2, 7.2–7.3, 8; SPEC-FR-SVC-002, SPEC-FR-SVC-003, SPEC-FR-SVC-005, SPEC-FR-SVC-010, SPEC-FR-SVC-011, SPEC-FR-CHG-001, SPEC-FR-CHG-002, SPEC-FR-CHG-003, SPEC-FR-CHG-004, SPEC-FR-CHG-005, SPEC-FR-CHG-009, SPEC-FR-HIST-005, AC-018, AC-024, AC-029, AC-030, AC-031, AC-040, AC-043, AC-067, AC-092. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-011.
- **Bloques, contratos y unidades:** B03/B04/B06/B07/B08; C01–C06; T04/T06/T08.
- **Entregable previsto:** Áreas propuestas de cambios y revalidación, con migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-010], [TSK-H1-012], [TSK-H4-004]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Importe indeterminado D019 bloquea únicamente efectos económicos; operación independiente puede avanzar. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Conservar antes/después, petición y cobertura previa; aplicar conjunto operativo autorizado sin ampliar Approval; reevaluar dependencias materiales y necesidades.
- **Salida observable:** T04/T06 preservan unidades atómicas acotadas, operación/resto y solicitudes; efectos económicos esperan determinación/aplicación propia.
- **Verificación y esperado:** 18 confirmados frente a quizá16: no sobrescribir; respuesta de horario no ratifica cantidad/precio; cambio de una noche no altera otra. Alternativas11:00→10/12:30/16 se conservan; conflicto agenda avisa, excepción no dispensa capacidad. Aplicación parcial/retirada/cambio nuevo no oculta efectos ni restaura cobertura inválida. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H4-012].
- **Integración adicional obligatoria:** [TSK-H4-014], [TSK-H4-023], [TSK-H5-016], [TSK-H6-003], [TSK-H6-004]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T04/T06/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-012"></a>

#### TSK-H4-012 — Verificar: Evaluar y aplicar modificación operativa y revalidación

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: comprobación.
- **Objetivo y alcance:** Solicitud/evaluación/proveedor/aprobación/aplicación parcial/rechazo/retirada; cantidades/noches/horario/lugar y Review solo materiales.
- **Fuentes exactas:** Plan §§5.1–5.2, 7.2–7.3, 8; SPEC-FR-SVC-002, SPEC-FR-SVC-003, SPEC-FR-SVC-005, SPEC-FR-SVC-010, SPEC-FR-SVC-011, SPEC-FR-CHG-001, SPEC-FR-CHG-002, SPEC-FR-CHG-003, SPEC-FR-CHG-004, SPEC-FR-CHG-005, SPEC-FR-CHG-009, SPEC-FR-HIST-005, SPEC-FR-CONC-001, AC-018, AC-024, AC-029, AC-030, AC-031, AC-043, AC-067, AC-092. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-012.
- **Bloques, contratos y unidades:** B03/B04/B06/B07/B08; C01–C06; T04/T06/T08.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-011]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Importe indeterminado D019 bloquea únicamente efectos económicos; operación independiente puede avanzar. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H4-011; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** T04/T06 preservan unidades atómicas acotadas, operación/resto y solicitudes; efectos económicos esperan determinación/aplicación propia. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** 18 confirmados frente a quizá16: no sobrescribir; respuesta de horario no ratifica cantidad/precio; cambio de una noche no altera otra. Alternativas11:00→10/12:30/16 se conservan; conflicto agenda avisa, excepción no dispensa capacidad. Aplicación parcial/retirada/cambio nuevo no oculta efectos ni restaura cobertura inválida. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T04/T06/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-013"></a>

#### TSK-H4-013 — Determinar derecho de cancelación antes de ajustar fondos

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: implementación.
- **Objetivo y alcance:** Causa/política, valor atribuible, modalidad individual, fijo/grupal y D019/D020; materialización por participación.
- **Fuentes exactas:** Plan §§5.2, 7.2–7.3, 10.8; SPEC-FR-CHG-003, SPEC-FR-CHG-006, SPEC-FR-CHG-007, SPEC-FR-CHG-008, SPEC-FR-CHG-009, SPEC-FR-ECON-007, AC-032, AC-033, AC-034, AC-037, AC-039, AC-040, AC-041, AC-042, PM-04, PM-05, PM-06, PM-07, D019, D020, D023. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-013.
- **Bloques, contratos y unidades:** B05/B06; C02/C03/C06; T06.
- **Entregable previsto:** Áreas propuestas de determinación económica y snapshots, con migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-012], [TSK-H1-010], [TSK-H1-012]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Base parcial no atribuible espera determinación explícita del Administrador por expediente, sin nuevo pendiente de política. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Calcular/documentar derecho, retención y nueva obligación legítimos por alcance antes de ajustar Reconciliation/Allocation/Refund.
- **Salida observable:** Derecho y fundamento reproducibles independientes de fondos cobrados/asignados/pagados; sin recargos ni nuevas bases fiscales.
- **Verificación y esperado:** Causa proveedor devuelve100% pese a no reembolsable; voluntaria base200 a7/3/2 días conserva intervalos; no reembolsable solo aceptado; no-show demás supuestos acreditados sin devolución. ModalidadB120 a4 días retiene60; fijo900 no se divide; sin base operación continúa e importe espera. PM-04/05:50,01 y150,03; días completos y referencias correctas. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H4-014].
- **Integración adicional obligatoria:** [TSK-H4-016], [TSK-H4-018], [TSK-H6-004]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T06 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-014"></a>

#### TSK-H4-014 — Verificar: Determinar derecho de cancelación antes de ajustar fondos

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: comprobación.
- **Objetivo y alcance:** Causa/política, valor atribuible, modalidad individual, fijo/grupal y D019/D020; materialización por participación.
- **Fuentes exactas:** Plan §§5.2, 7.2–7.3, 10.8; SPEC-FR-CHG-003, SPEC-FR-CHG-006, SPEC-FR-CHG-007, SPEC-FR-CHG-008, SPEC-FR-CHG-009, SPEC-FR-ECON-007, AC-032, AC-033, AC-034, AC-037, AC-039, AC-040, AC-041, AC-042, PM-04, PM-05, PM-06, PM-07, D019, D020, D023. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-014.
- **Bloques, contratos y unidades:** B05/B06; C02/C03/C06; T06.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-013]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Base parcial no atribuible espera determinación explícita del Administrador por expediente, sin nuevo pendiente de política. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H4-013; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Derecho y fundamento reproducibles independientes de fondos cobrados/asignados/pagados; sin recargos ni nuevas bases fiscales. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Causa proveedor devuelve100% pese a no reembolsable; voluntaria base200 a7/3/2 días conserva intervalos; no reembolsable solo aceptado; no-show demás supuestos acreditados sin devolución. ModalidadB120 a4 días retiene60; fijo900 no se divide; sin base operación continúa e importe espera. PM-04/05:50,01 y150,03; días completos y referencias correctas. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T06 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-015"></a>

#### TSK-H4-015 — Autorizar y registrar Refund parcial sin repetir porciones

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: implementación.
- **Objetivo y alcance:** Derecho, autorización, ejecución real, discrepancia/retiro; integración con Customer Payment/Allocation/Expected Payment y supervisión.
- **Fuentes exactas:** Plan §§5.2, 7.2–7.3, 8; SPEC-FR-CHG-008, SPEC-FR-ECON-006, SPEC-FR-ECON-007, SPEC-FR-IDEMP-002, AC-027, AC-035, AC-040, AC-057, AC-063, PM-04, PM-05, PM-06, PM-08, PM-11, PM-12, PM-13, D019, D029. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-015.
- **Bloques, contratos y unidades:** B05/B06/B07/B08; C02/C03/C04/C05/C06; T05/T06/T07/T08.
- **Entregable previsto:** Áreas propuestas de devoluciones/ajustes y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-014], [TSK-H3-006], [TSK-H3-012]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Sin derecho/porción/evidencia no efecto económico dependiente; resultado incierto conserva reserva hasta conciliar. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Registrar solicitud o derecho sin solicitud, autorización exacta y salidas acreditadas; actualizar porciones y obligaciones según causa, no por resta sin política.
- **Salida observable:** T07 integra salida y porciones, devolución parcial completa solo lo acreditado; prohibido reenviar por timeout o considerar ejecutado al resolver Incident.
- **Verificación y esperado:** Refund200 con salida80 deja120; PM-06 derecho50,01 menos20 deja30,01 sin recalcular50%; retiro no extingue obligación. Misma referencia/reintento no duplica; medio normalmente del cobro; movimiento sobrevenido sin aprobación se conserva con incidente sin aprobación ficticia; error posterior conserva bruto/historia. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H4-016].
- **Integración adicional obligatoria:** [TSK-H4-019], [TSK-H5-014], [TSK-H6-004], [TSK-H6-016]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05/T06/T07/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-016"></a>

#### TSK-H4-016 — Verificar: Autorizar y registrar Refund parcial sin repetir porciones

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: comprobación.
- **Objetivo y alcance:** Derecho, autorización, ejecución real, discrepancia/retiro; integración con Customer Payment/Allocation/Expected Payment y supervisión.
- **Fuentes exactas:** Plan §§5.2, 7.2–7.3, 8; SPEC-FR-CHG-008, SPEC-FR-ECON-006, SPEC-FR-ECON-007, AC-035, AC-040, AC-057, AC-063, PM-04, PM-05, PM-06, PM-08, PM-11, PM-12, PM-13, D019, D029. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-016.
- **Bloques, contratos y unidades:** B05/B06/B07/B08; C02/C03/C04/C05/C06; T05/T06/T07/T08.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-015]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Sin derecho/porción/evidencia no efecto económico dependiente; resultado incierto conserva reserva hasta conciliar. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H4-015; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** T07 integra salida y porciones, devolución parcial completa solo lo acreditado; prohibido reenviar por timeout o considerar ejecutado al resolver Incident. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Refund200 con salida80 deja120; PM-06 derecho50,01 menos20 deja30,01 sin recalcular50%; retiro no extingue obligación. Misma referencia/reintento no duplica; medio normalmente del cobro; movimiento sobrevenido sin aprobación se conserva con incidente sin aprobación ficticia; error posterior conserva bruto/historia. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05/T06/T07/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-017"></a>

#### TSK-H4-017 — Resolver fianza por entrega, retención y devolución

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: implementación.
- **Objetivo y alcance:** Aplicabilidad/condiciones, custodia real, entrega parcial, resolución y vínculo al mismo Refund sin movimiento doble.
- **Fuentes exactas:** Plan §§5.1–5.2, 7.2–7.3; SPEC-FR-ECON-008, SPEC-FR-IDEMP-002, AC-036. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-017.
- **Bloques, contratos y unidades:** B05/B06/B07/B08; C02/C03/C04/C06; T05/T07/T08.
- **Entregable previsto:** Áreas propuestas de garantías y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-016]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Condiciones/importe ausentes impiden determinación afectada; desconocido no es sin fianza. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Registrar No aplica justificado o obligación, entrega/receptor, derecho de resolución y evidencia por cada porción.
- **Salida observable:** Toda fianza entregada se explica por devuelto/retenido/restante sin duplicación, preservando discrepancias e historia.
- **Verificación y esperado:** Fianza100 al proveedor, retención20 y sin devolución:80 pendientes; no anticipo comercial ni custodia supuesta. Refund asociado refiere una salida única; retención requiere motivo/evidencia; servicio finalizado no resuelve garantía requerida/no entregada. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H4-018].
- **Integración adicional obligatoria:** [TSK-H4-019], [TSK-H5-014], [TSK-H6-005]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05/T07/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-018"></a>

#### TSK-H4-018 — Verificar: Resolver fianza por entrega, retención y devolución

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: comprobación.
- **Objetivo y alcance:** Aplicabilidad/condiciones, custodia real, entrega parcial, resolución y vínculo al mismo Refund sin movimiento doble.
- **Fuentes exactas:** Plan §§5.1–5.2, 7.2–7.3; SPEC-FR-ECON-008, AC-036. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-018.
- **Bloques, contratos y unidades:** B05/B06/B07/B08; C02/C03/C04/C06; T05/T07/T08.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-017]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Condiciones/importe ausentes impiden determinación afectada; desconocido no es sin fianza. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H4-017; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Toda fianza entregada se explica por devuelto/retenido/restante sin duplicación, preservando discrepancias e historia. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Fianza100 al proveedor, retención20 y sin devolución:80 pendientes; no anticipo comercial ni custodia supuesta. Refund asociado refiere una salida única; retención requiere motivo/evidencia; servicio finalizado no resuelve garantía requerida/no entregada. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05/T07/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-019"></a>

#### TSK-H4-019 — Verificar carreras conjuntas de fondos, Refund y fianza

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: comprobación.
- **Objetivo y alcance:** Raíces comunes de T05/T07/T08; asignación, pago proveedor, devolución y garantía compiten por las mismas porciones.
- **Fuentes exactas:** Plan §§7.2, 10.1, 10.8; SPEC-FR-CHG-008, SPEC-FR-ECON-005, SPEC-FR-ECON-007, SPEC-FR-ECON-008, SPEC-FR-HA-004, SPEC-FR-IDEMP-002, SPEC-FR-CONC-002, AC-027, AC-040. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-019.
- **Bloques, contratos y unidades:** B05/B06/B08; C03/C06; T05/T07/T08.
- **Entregable previsto:** Casos y evidencia propuestos de intercalaciones en PostgreSQL. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-018], [TSK-H4-016], [TSK-H3-012], [TSK-H3-006]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Ensayo real aislado no necesita movimientos bancarios ni conector. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar ambos órdenes y solapamientos, incluyendo inexistencia inicial de asignaciones hijas, pérdida de respuesta y rollback.
- **Salida observable:** Ninguna carrera sobreasigna, duplica ni libera reserva incierta; cada perdedor devuelve conflicto/insuficiencia o resultado previo real.
- **Verificación y esperado:** 100 disponibles y consumos80+80 incluyendo Allocation frente a Refund; Refund frente a devolución de Deposit y pago de proveedor; repetir referencia compartida no duplica salida. Repartos PM-11/12/13 y ajustes PM-08 preservan suma y derecho. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05/T07/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-020"></a>

#### TSK-H4-020 — Evaluar preparación y confirmación completa de Booking

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: implementación.
- **Objetivo y alcance:** SM-BK-02–05 integrado con servicios críticos, requisitos, economía H3, excepciones y cobertura actual.
- **Fuentes exactas:** Plan §§7.3, 9; SPEC-FR-BOOK-004, AC-022, AC-023. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-020.
- **Bloques, contratos y unidades:** B04/B05/B06/B07/B08; C02/C03/C06; T04/T08.
- **Entregable previsto:** Áreas propuestas de evaluación de Booking y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-010], [TSK-H4-012], [TSK-H4-019], [TSK-H4-002]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Dato/cobertura crítica ausente impide confirmación concreta; excepción económica no dispensa operación. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Evaluar parcial/completa y pérdida de cobertura sobre evidencia/porciones actuales, sin crear confirmaciones/cobros por arrastre.
- **Salida observable:** Confirmación completa comprobada con economía real aislada H3; confirmación histórica conservada al perder cobertura.
- **Verificación y esperado:** A10días con críticos y50% verificado/asignado permite guarda inicial; crítico pendiente o justificante no verificado rechaza. A6días exige100% salvo excepción documentada; nunca salva capacidad/crítico. Cambio concurrente de insumo reevalúa; no usa proyección obsoleta. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H4-021].
- **Integración adicional obligatoria:** [TSK-H4-023], [TSK-H6-001], [TSK-H6-016]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T04/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-021"></a>

#### TSK-H4-021 — Verificar: Evaluar preparación y confirmación completa de Booking

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: comprobación.
- **Objetivo y alcance:** SM-BK-02–05 integrado con servicios críticos, requisitos, economía H3, excepciones y cobertura actual.
- **Fuentes exactas:** Plan §§7.3, 9; SPEC-FR-BOOK-004, SPEC-FR-ECON-001, SPEC-FR-ECON-002, AC-016, AC-022, AC-023. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-021.
- **Bloques, contratos y unidades:** B04/B05/B06/B07/B08; C02/C03/C06; T04/T08.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-020]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Dato/cobertura crítica ausente impide confirmación concreta; excepción económica no dispensa operación. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H4-020; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Confirmación completa comprobada con economía real aislada H3; confirmación histórica conservada al perder cobertura. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** A10días con críticos y50% verificado/asignado permite guarda inicial; crítico pendiente o justificante no verificado rechaza. A6días exige100% salvo excepción documentada; nunca salva capacidad/crítico. Cambio concurrente de insumo reevalúa; no usa proyección obsoleta. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T04/T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-022"></a>

#### TSK-H4-022 — Registrar prestación, cancelación y realidad sobrevenida

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: implementación.
- **Objetivo y alcance:** Inicio/ejecución parcial/finalización de Booking y servicios; cancelación conserva lo prestado y lo no afectado; Incident superpuesta.
- **Fuentes exactas:** Plan §§7.2–7.3, 9; SPEC-FR-BOOK-005, SPEC-FR-SVC-009, SPEC-FR-SVC-011, SPEC-FR-CHG-005, AC-031, AC-058, AC-063, AC-091. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-022.
- **Bloques, contratos y unidades:** B04/B06/B07; C02/C03/C04/C06; T04/T06.
- **Entregable previsto:** Áreas propuestas de prestación y reevaluación con migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-021]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Hechos solo acreditados; la evidencia de incumplimiento se registra sin autorizarlo. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Aplicar progreso sustentado por evidencias de responsable/proveedor; preservar partes prestadas/canceladas e impactos de incidentes.
- **Salida observable:** Estados y condiciones reflejan realidad por alcance, sin movimientos/cierres por inferencia.
- **Verificación y esperado:** Fecha prevista sola no inicia/finaliza; evidencia parcial deja resto. S1 cancelado de3 no cancela demás; parte prestada no desaparece ni se etiqueta toda Booking Cancelada; inicio excepcional se conserva con revisión/incidencia sin fingir confirmación previa; resolver impacto no restaura confirmación inválida. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H4-023].
- **Integración adicional obligatoria:** [TSK-H5-014], [TSK-H6-001]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T04/T06 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-023"></a>

#### TSK-H4-023 — Verificar: Registrar prestación, cancelación y realidad sobrevenida

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: comprobación.
- **Objetivo y alcance:** Inicio/ejecución parcial/finalización de Booking y servicios; cancelación conserva lo prestado y lo no afectado; Incident superpuesta.
- **Fuentes exactas:** Plan §§7.2–7.3, 9; SPEC-FR-BOOK-005, SPEC-FR-SVC-009, SPEC-FR-SVC-011, SPEC-FR-CHG-005, SPEC-FR-HIST-001, AC-031, AC-063, AC-091. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-023.
- **Bloques, contratos y unidades:** B04/B06/B07; C02/C03/C04/C06; T04/T06.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-022]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Hechos solo acreditados; la evidencia de incumplimiento se registra sin autorizarlo. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H4-022; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Estados y condiciones reflejan realidad por alcance, sin movimientos/cierres por inferencia. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Fecha prevista sola no inicia/finaliza; evidencia parcial deja resto. S1 cancelado de3 no cancela demás; parte prestada no desaparece ni se etiqueta toda Booking Cancelada; inicio excepcional se conserva con revisión/incidencia sin fingir confirmación previa; resolver impacto no restaura confirmación inválida. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T04/T06 conservan atomicidad y revisión conjunta.

<a id="tsk-h4-024"></a>

#### TSK-H4-024 — Registrar salida de operación y cambios integrados

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H4. Tipo: documentación/evidencia.
- **Objetivo y alcance:** Confirmación con economía, cancelación, garantías y revisión de unidades T04/T06/T07.
- **Fuentes exactas:** Plan §§9–10; Plan §9 (resultado y salida del hito); correspondencias específicas de §6. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H4-024.
- **Bloques, contratos y unidades:** B04/B05/B06/B07/B08/B10; C01–C06; T04/T05/T06/T07/T08.
- **Entregable previsto:** Informe propuesto de hito y evidencia económica/operativa. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H3-015], [TSK-H4-001], [TSK-H4-002], [TSK-H4-003], [TSK-H4-004], [TSK-H4-005], [TSK-H4-006], [TSK-H4-007], [TSK-H4-008], [TSK-H4-009], [TSK-H4-010], [TSK-H4-011], [TSK-H4-012], [TSK-H4-013], [TSK-H4-014], [TSK-H4-015], [TSK-H4-016], [TSK-H4-017], [TSK-H4-018], [TSK-H4-019], [TSK-H4-020], [TSK-H4-021], [TSK-H4-022], [TSK-H4-023]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H3 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Determinaciones particulares ausentes conservadas; cierres conjuntos se integran H5. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Consolidar casos PT-03/PT-05/PT-06, PM y pruebas conjuntas de porciones; comprobar B07 mínimo sin dependencia H5.
- **Salida observable:** H4 acreditado por casos y límites precisos; ningún cierre conjunto ni acceso real aceptados por arrastre.
- **Verificación y esperado:** No cerrar si una cancelación modifica resto, se usa falso pago/confirmación o falta verificación concurrente de fondos/Refund/fianza. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** La recopilación parcial puede acompañar trabajo independiente; el cierre espera todas sus dependencias. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T04/T05/T06/T07/T08 conservan atomicidad y revisión conjunta.

### 4.6. H5 — Coordinación y cierre integrado

<a id="tsk-h5-001"></a>

#### TSK-H5-001 — Completar ciclo y disparadores de Task del negocio

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: implementación.
- **Objetivo y alcance:** Task mínimo ampliado con resultado/cancelación/reapertura, plazos y todos los disparadores aprobados.
- **Fuentes exactas:** Plan §§8–10; SPEC-FR-ECON-002, SPEC-FR-COORD-001, SPEC-FR-COORD-002, SPEC-FR-COORD-003, AC-041, AC-043, AC-050, AC-083. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-001.
- **Bloques, contratos y unidades:** B07/B08; C01/C02/C03/C06; T09.
- **Entregable previsto:** Áreas propuestas de coordinación/seguimiento y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H1-018], [TSK-H1-012]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Adelanto, fecha dentro2–3días o parámetros ausentes bloquean programación concreta; ninguna regla nueva. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Aplicar causas de BR-TASK-005, deduplicación por necesidad, cierre motivado y reapertura explícita; conservar origen/versionado.
- **Salida observable:** Ciclo aprobado sin estado En curso añadido; necesidades y tiempos explicables con parámetros versionados.
- **Verificación y esperado:** Disparadores de bloqueo, anticipo/saldo, proveedor/factura/suplido/documento/lista, revisión/cambio/cancelación/propuesta/cifra final generan su necesidad sin duplicación; Task cerrada no acredita hecho; deadline desconocido no vencido; día límite completo; cifra específica no se propaga. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H5-002].
- **Integración adicional obligatoria:** [TSK-H5-004], [TSK-H6-006]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T09 conservan atomicidad y revisión conjunta.

<a id="tsk-h5-002"></a>

#### TSK-H5-002 — Verificar: Completar ciclo y disparadores de Task del negocio

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: comprobación.
- **Objetivo y alcance:** Task mínimo ampliado con resultado/cancelación/reapertura, plazos y todos los disparadores aprobados.
- **Fuentes exactas:** Plan §§8–10; SPEC-FR-ECON-002, SPEC-FR-COORD-001, SPEC-FR-COORD-002, SPEC-FR-COORD-003, AC-041, AC-043, AC-050, AC-083. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-002.
- **Bloques, contratos y unidades:** B07/B08; C01/C02/C03/C06; T09.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-001]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Adelanto, fecha dentro2–3días o parámetros ausentes bloquean programación concreta; ninguna regla nueva. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H5-001; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Ciclo aprobado sin estado En curso añadido; necesidades y tiempos explicables con parámetros versionados. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Disparadores de bloqueo, anticipo/saldo, proveedor/factura/suplido/documento/lista, revisión/cambio/cancelación/propuesta/cifra final generan su necesidad sin duplicación; Task cerrada no acredita hecho; deadline desconocido no vencido; día límite completo; cifra específica no se propaga. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T09 conservan atomicidad y revisión conjunta.

<a id="tsk-h5-003"></a>

#### TSK-H5-003 — Registrar alertas y notificaciones según D016

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: implementación.
- **Objetivo y alcance:** Causa/riesgo, destinatario único, CRM para todas y WhatsApp Crítica/Importante como intención; fallo sin bucle.
- **Fuentes exactas:** Plan §§8, 11.2; SPEC-FR-COORD-004, SPEC-FR-IDEMP-002, SPEC-FR-CONC-006, AC-070, AC-083. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-003.
- **Bloques, contratos y unidades:** B07/B08; C01/C03/C05/C06; T09.
- **Entregable previsto:** Áreas propuestas de avisos/intenciones y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-002]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Sin conector WhatsApp entrega pendiente; parámetros no verificados mantienen acción dependiente inactiva. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Registrar alerta por causa y Notification por canal/resultado, manteniendo visibilidad interna y deduplicación ante fallo del aviso.
- **Salida observable:** Intenciones y entregas distinguidas; D027 email de seguridad permanece separado de notificaciones internas.
- **Verificación y esperado:** Crítica/Importante generan intención WhatsApp, Informativa solo CRM; ninguna por email. Fallo persistente y fallo de WhatsApp visibles en CRM sin recursión; aviso no resuelve causa ni reintenta ilimitadamente. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H5-004].
- **Integración adicional obligatoria:** [TSK-H5-008], [TSK-H5-010]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T09 conservan atomicidad y revisión conjunta.

<a id="tsk-h5-004"></a>

#### TSK-H5-004 — Verificar: Registrar alertas y notificaciones según D016

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: comprobación.
- **Objetivo y alcance:** Causa/riesgo, destinatario único, CRM para todas y WhatsApp Crítica/Importante como intención; fallo sin bucle.
- **Fuentes exactas:** Plan §§8, 11.2; SPEC-FR-COORD-004, SPEC-FR-IDEMP-002, SPEC-FR-CONC-006, AC-070, AC-083. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-004.
- **Bloques, contratos y unidades:** B07/B08; C01/C03/C05/C06; T09.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-003]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Sin conector WhatsApp entrega pendiente; parámetros no verificados mantienen acción dependiente inactiva. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H5-003; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Intenciones y entregas distinguidas; D027 email de seguridad permanece separado de notificaciones internas. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Crítica/Importante generan intención WhatsApp, Informativa solo CRM; ninguna por email. Fallo persistente y fallo de WhatsApp visibles en CRM sin recursión; aviso no resuelve causa ni reintenta ilimitadamente. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T09 conservan atomicidad y revisión conjunta.

<a id="tsk-h5-005"></a>

#### TSK-H5-005 — Preparar comunicaciones y registrar derivados con Review

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: implementación.
- **Objetivo y alcance:** Ciclo Borrador/Preparada/aprobación, original/transcripción/resumen/nota y extracción candidata sin motor IA real.
- **Fuentes exactas:** Plan §§6.5, 8; SPEC-FR-PROP-006, SPEC-FR-HIST-003, SPEC-FR-HIST-005, SPEC-FR-COORD-007, SPEC-FR-SEC-006, SPEC-FR-INT-004, AC-024, AC-087, AC-088. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-005.
- **Bloques, contratos y unidades:** B07/B08/B09; C01/C02/C03/C04/C05; T08.
- **Entregable previsto:** Áreas propuestas de comunicaciones/revisión y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H1-014], [TSK-H1-016], [TSK-H5-002]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** DM-PENDING-005: tratamiento real autorizado; no audio por defecto ni conector PLAUD/IA. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Completar preparación/versiones y vínculo a Approval; incorporar transcripción original autorizada y derivados con fuente; conservar dato confirmado ante candidato discrepante.
- **Salida observable:** Ciclo y derivados con procedencia/permisos; evidencia temprana mantiene identidad y hechos sin migración destructiva.
- **Verificación y esperado:** Aprobada sin envío sigue sin envío; entrante no necesita borrador. Original PLAUD y resumen coexisten; quizá16 no sobrescribe18 confirmados, genera revisión/Task. Plantilla sensible exige aprobación y cambio material invalida la previa. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H5-006].
- **Integración adicional obligatoria:** [TSK-H5-010], [TSK-H6-006], [TSK-H6-017]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h5-006"></a>

#### TSK-H5-006 — Verificar: Preparar comunicaciones y registrar derivados con Review

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: comprobación.
- **Objetivo y alcance:** Ciclo Borrador/Preparada/aprobación, original/transcripción/resumen/nota y extracción candidata sin motor IA real.
- **Fuentes exactas:** Plan §§6.5, 8; SPEC-FR-PROP-006, SPEC-FR-HIST-003, SPEC-FR-HIST-005, SPEC-FR-COORD-007, SPEC-FR-SEC-006, SPEC-FR-INT-004, AC-024, AC-087, AC-088. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-006.
- **Bloques, contratos y unidades:** B07/B08/B09; C01/C02/C03/C04/C05; T08.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-005]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** DM-PENDING-005: tratamiento real autorizado; no audio por defecto ni conector PLAUD/IA. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H5-005; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Ciclo y derivados con procedencia/permisos; evidencia temprana mantiene identidad y hechos sin migración destructiva. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Aprobada sin envío sigue sin envío; entrante no necesita borrador. Original PLAUD y resumen coexisten; quizá16 no sobrescribe18 confirmados, genera revisión/Task. Plantilla sensible exige aprobación y cambio material invalida la previa. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h5-007"></a>

#### TSK-H5-007 — Reclamar y recuperar trabajo persistido

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: implementación.
- **Objetivo y alcance:** Definition/version, Execution Record, generaciones de intento, reclamación exclusiva, pausa/detención y resultados tardíos.
- **Fuentes exactas:** Plan §§7.2, 8, 11.2; SPEC-FR-HA-002, SPEC-FR-HA-003, SPEC-FR-HA-004, SPEC-FR-IDEMP-002, SPEC-FR-IDEMP-004, SPEC-FR-CONC-005, SPEC-FR-CONC-006, SPEC-FR-ERR-002, SPEC-FR-INT-003, AC-054, AC-055, AC-057, AC-069, AC-070, AC-073, AC-083. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-007.
- **Bloques, contratos y unidades:** B08; C02/C03/C05/C06; T08/T09.
- **Entregable previsto:** Áreas propuestas de trabajos/intenciones/ejecución y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H0-012], [TSK-H5-004]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Límites/pausas/capacidad de scheduler deben verificarse; sin ejecutor de conector real. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Completar reclamación duradera, unidades acotadas y reanudación segura; revalidar Approval/estado antes de efecto y conciliar respuesta tardía con intento original.
- **Salida observable:** Trabajo recuperable tras caída de proceso, sin exactly once externo prometido ni permiso nuevo por cada intento.
- **Verificación y esperado:** Dos ejecutores reclaman: una reserva/efecto; caída antes/contacto/después distingue abortado e incierto. Concesión vencida no autoriza reenviar; ejecutor viejo no sobrescribe resultado nuevo; parcial consume solo acreditado; detener/revisar conserva historia. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H5-008].
- **Integración adicional obligatoria:** [TSK-H5-010], [TSK-H6-006], [TSK-H6-015], [TSK-H6-016]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T08/T09 conservan atomicidad y revisión conjunta.

<a id="tsk-h5-008"></a>

#### TSK-H5-008 — Verificar: Reclamar y recuperar trabajo persistido

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: comprobación.
- **Objetivo y alcance:** Definition/version, Execution Record, generaciones de intento, reclamación exclusiva, pausa/detención y resultados tardíos.
- **Fuentes exactas:** Plan §§7.2, 8, 11.2; SPEC-FR-HA-002, SPEC-FR-HA-003, SPEC-FR-HA-004, SPEC-FR-IDEMP-002, SPEC-FR-IDEMP-004, SPEC-FR-CONC-005, SPEC-FR-CONC-006, SPEC-FR-ERR-002, SPEC-FR-INT-003, AC-054, AC-055, AC-057, AC-069, AC-070, AC-083. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-008.
- **Bloques, contratos y unidades:** B08; C02/C03/C05/C06; T08/T09.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-007]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Límites/pausas/capacidad de scheduler deben verificarse; sin ejecutor de conector real. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H5-007; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Trabajo recuperable tras caída de proceso, sin exactly once externo prometido ni permiso nuevo por cada intento. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Dos ejecutores reclaman: una reserva/efecto; caída antes/contacto/después distingue abortado e incierto. Concesión vencida no autoriza reenviar; ejecutor viejo no sobrescribe resultado nuevo; parcial consume solo acreditado; detener/revisar conserva historia. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T08/T09 conservan atomicidad y revisión conjunta.

<a id="tsk-h5-009"></a>

#### TSK-H5-009 — Normalizar eventos y resultados de fronteras con dobles

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: implementación.
- **Objetivo y alcance:** Source/Reference/Event, origen/alcance, deduplicación, intención/resultado, sustitución y límites por canal.
- **Fuentes exactas:** Plan §§7.1–7.2, 8, 10.1; SPEC-FR-COORD-008, SPEC-FR-IDEMP-003, SPEC-FR-IDEMP-004, SPEC-FR-CONC-004, SPEC-FR-ERR-002, SPEC-FR-INT-001, SPEC-FR-INT-002, SPEC-FR-INT-003, SPEC-FR-INT-004, SPEC-FR-INT-005, SPEC-FR-INT-006, AC-057, AC-066, AC-071, AC-076, AC-077, AC-082. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-009.
- **Bloques, contratos y unidades:** B09/B07/B08; C01/C03/C04/C05/C06; T09.
- **Entregable previsto:** Áreas propuestas de puertos/adaptadores manuales y dobles con estado propio; migraciones de referencias/eventos. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-008], [TSK-H5-006]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** ARCH-PENDING-001, BR-PENDING-034/035: no bloquean contratos/dobles; sí conectores reales excluidos. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Implementar recepción normalizada y salida semántica de prueba mediante registro manual/dobles, verificando autoridad y manteniendo pendiente la capacidad ausente.
- **Salida observable:** Contratos Core verificados con límites visibles; ningún resultado se presenta como conector, webhook, pago o envío real.
- **Verificación y esperado:** Evento equivalente repetido/antiguo/eco no duplica ni retrocede; clave con importe distinto E2; sin ID fiable revisar. Fuente caída S1 no bloquea S2. Dobles de envío que ya ejecutaron antes de timeout impiden repetir. Avaibook rechaza crear/modificar/cancelar; calendario externo solo revisión; web separada. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H5-010].
- **Integración adicional obligatoria:** [TSK-H6-006], [TSK-H6-015]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T09 conservan atomicidad y revisión conjunta.

<a id="tsk-h5-010"></a>

#### TSK-H5-010 — Verificar: Normalizar eventos y resultados de fronteras con dobles

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: comprobación.
- **Objetivo y alcance:** Source/Reference/Event, origen/alcance, deduplicación, intención/resultado, sustitución y límites por canal.
- **Fuentes exactas:** Plan §§7.1–7.2, 8, 10.1; SPEC-FR-COORD-008, SPEC-FR-IDEMP-001, SPEC-FR-IDEMP-003, SPEC-FR-IDEMP-004, SPEC-FR-CONC-004, SPEC-FR-ERR-002, SPEC-FR-INT-001, SPEC-FR-INT-002, SPEC-FR-INT-003, SPEC-FR-INT-004, SPEC-FR-INT-005, SPEC-FR-INT-006, AC-057, AC-066, AC-071, AC-076, AC-077, AC-082. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-010.
- **Bloques, contratos y unidades:** B09/B07/B08; C01/C03/C04/C05/C06; T09.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-009]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** ARCH-PENDING-001, BR-PENDING-034/035: no bloquean contratos/dobles; sí conectores reales excluidos. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H5-009; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Contratos Core verificados con límites visibles; ningún resultado se presenta como conector, webhook, pago o envío real. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Evento equivalente repetido/antiguo/eco no duplica ni retrocede; clave con importe distinto E2; sin ID fiable revisar. Fuente caída S1 no bloquea S2. Dobles de envío que ya ejecutaron antes de timeout impiden repetir. Avaibook rechaza crear/modificar/cancelar; calendario externo solo revisión; web separada. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T09 conservan atomicidad y revisión conjunta.

<a id="tsk-h5-011"></a>

#### TSK-H5-011 — Consultar timeline, calendario y salidas por finalidad

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: implementación.
- **Objetivo y alcance:** Proyecciones reconstruibles con permisos de originales y alcance, sin caché compartida de expedientes/sesiones.
- **Fuentes exactas:** Plan §§6.5, 8, 11.2; SPEC-FR-HIST-006, SPEC-FR-COORD-008, SPEC-FR-SEC-003, SPEC-FR-SEC-006, SPEC-FR-SEC-007, SPEC-FR-INT-005, AC-062, AC-065, AC-075, AC-076, AC-081, D020. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-011.
- **Bloques, contratos y unidades:** B01/B07/B09; C01/C06; —.
- **Entregable previsto:** Áreas propuestas de consultas/proyecciones y documentación de finalidad. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-010]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** DM-PENDING-005: ninguna retención/plazo o divulgación no autorizados. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Componer lecturas mínimas, búsquedas/exportaciones/contexto IA previstos por Core; enlazar originales y calendario canónico sin autoridad de escritura.
- **Salida observable:** Consultas reproducibles y aisladas por finalidad; archivos/objetos/historia no filtran por vínculos compartidos.
- **Verificación y esperado:** Tercero no recibe costes/márgenes/beneficios/comisiones/honorarios ni personales innecesarios; pack comercial respeta BR-PACK-003. Timeline conserva referencias y permisos; proyección atrasada no autoriza mutación; evento Google no cambia Booking por sí. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H5-012].
- **Integración adicional obligatoria:** [TSK-H6-017], [TSK-H6-007]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h5-012"></a>

#### TSK-H5-012 — Verificar: Consultar timeline, calendario y salidas por finalidad

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: comprobación.
- **Objetivo y alcance:** Proyecciones reconstruibles con permisos de originales y alcance, sin caché compartida de expedientes/sesiones.
- **Fuentes exactas:** Plan §§6.5, 8, 11.2; SPEC-FR-HIST-006, SPEC-FR-COORD-008, SPEC-FR-SEC-003, SPEC-FR-SEC-006, SPEC-FR-INT-005, AC-062, AC-065, AC-075, AC-076, D020. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-012.
- **Bloques, contratos y unidades:** B01/B07/B09; C01/C06; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-011]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** DM-PENDING-005: ninguna retención/plazo o divulgación no autorizados. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H5-011; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Consultas reproducibles y aisladas por finalidad; archivos/objetos/historia no filtran por vínculos compartidos. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Tercero no recibe costes/márgenes/beneficios/comisiones/honorarios ni personales innecesarios; pack comercial respeta BR-PACK-003. Timeline conserva referencias y permisos; proyección atrasada no autoriza mutación; evento Google no cambia Booking por sí. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h5-013"></a>

#### TSK-H5-013 — Evaluar los tres cierres con fundamentos actuales

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: implementación.
- **Objetivo y alcance:** Commercial/Operational/Economic Closure dentro de Booking, cada una Pendiente/Resuelto y criterio No aplica justificado.
- **Fuentes exactas:** Plan §§7.2–7.3, 9; SPEC-FR-CLOSE-001, SPEC-FR-CLOSE-002, AC-058, AC-059, AC-060. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-013.
- **Bloques, contratos y unidades:** B06/B04/B05/B07; C02/C03/C06; T10.
- **Entregable previsto:** Áreas propuestas de evaluación de cierre y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H4-023], [TSK-H4-018], [TSK-H3-012], [TSK-H4-004], [TSK-H4-002]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Cada obligación/documento/reembolso/fianza/condición ausente bloquea únicamente su evaluación dependiente. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Evaluar cada dimensión sobre hechos vigentes y conservar criterios/evidencias/actor/momento; proteger raíz Booking también en comandos que alteran fundamentos.
- **Salida observable:** Tres evaluaciones independientes comprobables con fondos, documentos, cambios e incidencias integrados.
- **Verificación y esperado:** Ganada/Finalizada no cierran; pago sin factura, Refund/fianza pendiente e incidencia económica mantienen economía abierta; no factura externa Tararí; ninguna dimensión se resuelve por omisión ni por cerrar Task/Incident. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H5-014].
- **Integración adicional obligatoria:** [TSK-H5-016], [TSK-H6-007], [TSK-H6-016]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T10 conservan atomicidad y revisión conjunta.

<a id="tsk-h5-014"></a>

#### TSK-H5-014 — Verificar: Evaluar los tres cierres con fundamentos actuales

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: comprobación.
- **Objetivo y alcance:** Commercial/Operational/Economic Closure dentro de Booking, cada una Pendiente/Resuelto y criterio No aplica justificado.
- **Fuentes exactas:** Plan §§7.2–7.3, 9; SPEC-FR-CLOSE-001, SPEC-FR-CLOSE-002, AC-058, AC-059. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-014.
- **Bloques, contratos y unidades:** B06/B04/B05/B07; C02/C03/C06; T10.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-013]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Cada obligación/documento/reembolso/fianza/condición ausente bloquea únicamente su evaluación dependiente. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H5-013; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Tres evaluaciones independientes comprobables con fondos, documentos, cambios e incidencias integrados. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Ganada/Finalizada no cierran; pago sin factura, Refund/fianza pendiente e incidencia económica mantienen economía abierta; no factura externa Tararí; ninguna dimensión se resuelve por omisión ni por cerrar Task/Incident. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T10 conservan atomicidad y revisión conjunta.

<a id="tsk-h5-015"></a>

#### TSK-H5-015 — Cerrar conjuntamente y reabrir bajo concurrencia

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: implementación.
- **Objetivo y alcance:** Condición Cerrada/Histórico y reapertura fundada de dimensión; raíz común entre cierre y hechos que invalidan fundamentos.
- **Fuentes exactas:** Plan §§7.2–7.3, 9–10; SPEC-FR-CLOSE-003, SPEC-FR-CLOSE-004, SPEC-FR-CONC-002, AC-046, AC-059, AC-060, AC-061, AC-062. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-015.
- **Bloques, contratos y unidades:** B06/B04/B05/B07; C01/C02/C03/C06; T10.
- **Entregable previsto:** Áreas propuestas de cierre/reapertura, integración de cambios de fundamentos y migraciones. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-014], [TSK-H5-012]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Crítica sin justificación admisible o criterio económico pendiente bloquea cierre conjunto. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Aplicar cierre solo con tres dimensiones resueltas; invalidar evaluación afectada por evidencia posterior sin borrar cierre previo; sincronizar comandos que modifican insumos.
- **Salida observable:** Cierre actual y pasado distinguibles; reapertura no altera ejecución ni aceptación ni crea contrato nuevo, con pruebas de raíz compartida.
- **Verificación y esperado:** Crítica Abierta/En gestión bloquea sin justificación; excepción no suple factura/pago/devolución. Carreras cierre frente a factura corregida/Refund nuevo/Incident/obligación/cambio de servicio, ambos órdenes y solapamiento: no cierre vigente con fundamento inválido. Archivado no cierre; cancelada totalmente puede cerrar si cumple criterios. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H5-016].
- **Integración adicional obligatoria:** [TSK-H6-007], [TSK-H6-016]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T10 conservan atomicidad y revisión conjunta.

<a id="tsk-h5-016"></a>

#### TSK-H5-016 — Verificar: Cerrar conjuntamente y reabrir bajo concurrencia

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: comprobación.
- **Objetivo y alcance:** Condición Cerrada/Histórico y reapertura fundada de dimensión; raíz común entre cierre y hechos que invalidan fundamentos.
- **Fuentes exactas:** Plan §§7.2–7.3, 9–10; SPEC-FR-CLOSE-002, SPEC-FR-CLOSE-003, SPEC-FR-CLOSE-004, SPEC-FR-HIST-006, SPEC-FR-CONC-002, AC-046, AC-059, AC-060, AC-061, AC-062. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-016.
- **Bloques, contratos y unidades:** B06/B04/B05/B07; C01/C02/C03/C06; T10.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-015]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Crítica sin justificación admisible o criterio económico pendiente bloquea cierre conjunto. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H5-015; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Cierre actual y pasado distinguibles; reapertura no altera ejecución ni aceptación ni crea contrato nuevo, con pruebas de raíz compartida. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Crítica Abierta/En gestión bloquea sin justificación; excepción no suple factura/pago/devolución. Carreras cierre frente a factura corregida/Refund nuevo/Incident/obligación/cambio de servicio, ambos órdenes y solapamiento: no cierre vigente con fundamento inválido. Archivado no cierre; cancelada totalmente puede cerrar si cumple criterios. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T10 conservan atomicidad y revisión conjunta.

<a id="tsk-h5-017"></a>

#### TSK-H5-017 — Relacionar fallos con historia y proteger diagnóstico

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: implementación.
- **Objetivo y alcance:** Referencias de petición/operación/ejecución/evento, estados de trabajo y conservación mínima de logs.
- **Fuentes exactas:** Plan §§7.1, 8, 11.2; SPEC-FR-ERR-001, AC-072, AC-081. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-017.
- **Bloques, contratos y unidades:** B01/B07/B08/B10; C01/C04; —.
- **Entregable previsto:** Áreas propuestas de diagnóstico y documentación de operación. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-008], [TSK-H5-012], [TSK-H5-016]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Umbrales y retención no verificados no se inventan; política de privacidad conserva bloqueo en su uso real. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Completar consulta autorizada de fallos persistentes, incertidumbre y objetos/trabajo incompletos, enlazando hechos sin copiarlos al log.
- **Salida observable:** Investigación puede seguir referencias hasta evidencia autorizada; errores/intentos y limitaciones visibles sin filtrar contenido.
- **Verificación y esperado:** Ocho causas E1–E8 localizables; excepción técnica con efecto desconocido sigue E4; no secretos, URLs temporales, cuerpos completos ni economía interna innecesaria. Log de éxito nunca sustituye pago/Acceptance/entrega. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes. Comprobación local obligatoria: [TSK-H5-018].
- **Integración adicional obligatoria:** [TSK-H6-017], [TSK-H6-015]. Se ejecuta cuando sus dependencias estén disponibles; no sustituye el ensayo local ni permite acreditar antes ese recorrido.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h5-018"></a>

#### TSK-H5-018 — Verificar: Relacionar fallos con historia y proteger diagnóstico

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: comprobación.
- **Objetivo y alcance:** Referencias de petición/operación/ejecución/evento, estados de trabajo y conservación mínima de logs.
- **Fuentes exactas:** Plan §§7.1, 8, 11.2; SPEC-FR-HIST-001, SPEC-FR-ERR-001, AC-070, AC-072, AC-081. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-018.
- **Bloques, contratos y unidades:** B01/B07/B08/B10; C01/C04; —.
- **Entregable previsto:** Casos y evidencias del alcance; rutas propuestas según §2.3. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-017]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Umbrales y retención no verificados no se inventan; política de privacidad conserva bloqueo en su uso real. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar V-DOM + V-DAT + V-MIG sobre TSK-H5-017; contrastar los casos siguientes con sus fuentes, sin usar la implementación como oráculo.
- **Salida observable:** Investigación puede seguir referencias hasta evidencia autorizada; errores/intentos y limitaciones visibles sin filtrar contenido. Deben pasar todos los casos asignados, incluidos rechazos sin efecto colateral.
- **Verificación y esperado:** Ocho causas E1–E8 localizables; excepción técnica con efecto desconocido sigue E4; no secretos, URLs temporales, cuerpos completos ni economía interna innecesaria. Log de éxito nunca sustituye pago/Acceptance/entrega. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h5-019"></a>

#### TSK-H5-019 — Registrar cierre integrado de capacidades Core

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H5. Tipo: documentación/evidencia.
- **Objetivo y alcance:** Evidencia integrada de seguimiento, supervisión, fronteras, proyecciones y cierres.
- **Fuentes exactas:** Plan §§9–12; Plan §9 (resultado y salida del hito); correspondencias específicas de §6. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H5-019.
- **Bloques, contratos y unidades:** B06/B07/B08/B09/B10; C01–C06; T08/T09/T10.
- **Entregable previsto:** Informe propuesto de hito y limitaciones de contratos. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H4-024], [TSK-H5-001], [TSK-H5-002], [TSK-H5-003], [TSK-H5-004], [TSK-H5-005], [TSK-H5-006], [TSK-H5-007], [TSK-H5-008], [TSK-H5-009], [TSK-H5-010], [TSK-H5-011], [TSK-H5-012], [TSK-H5-013], [TSK-H5-014], [TSK-H5-015], [TSK-H5-016], [TSK-H5-017], [TSK-H5-018]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H4 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** No aceptación de acceso real/Production; conectores permanecen excluidos. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Consolidar pruebas PT-08/PT-09/PT-10/PT-12 y revisar referencias cruzadas a capacidades incorporadas antes de H5.
- **Salida observable:** H0–H5 acreditados en su alcance verificable, pendientes localizados y candidato preparado para validación H6.
- **Verificación y esperado:** No admitir fuente cubierta solo por mención o mock de integridad; historial/idempotencia deben existir desde primer efecto. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** La recopilación parcial puede acompañar trabajo independiente; el cierre espera todas sus dependencias. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T08/T09/T10 conservan atomicidad y revisión conjunta.

### 4.7. H6 — Validación y preparación de entrega

<a id="tsk-h6-001"></a>

#### TSK-H6-001 — Verificar E2E-01: Venta y prestación completa

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** Contexto → Lead/Opportunity → modalidades/versiones/Acceptance → Booking/cantidades → fondos y críticos → ejecución/documentos → tres cierres.
- **Fuentes exactas:** Plan §§9–10.1; SPEC §9; AC-089. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-001.
- **Bloques, contratos y unidades:** B01–B10; C01–C06; T01/T02/T03/T04/T05/T07/T10.
- **Entregable previsto:** Casos y evidencia propuestos de recorrido Core. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Datos sintéticos y dobles externos; no requiere UI ni conector; acceso real permanece bloqueado. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Recorrer contratos de aplicación y PostgreSQL aislado desde entradas válidas; verificar vínculos, historia y pendientes en cada frontera.
- **Salida observable:** Una Booking cerrada reconstruye necesidad, versiones, aceptación, cantidades/noches, confirmaciones, movimientos/porciones y fundamentos de los tres cierres.
- **Verificación y esperado:** Una Booking cerrada reconstruye necesidad, versiones, aceptación, cantidades/noches, confirmaciones, movimientos/porciones y fundamentos de los tres cierres. En cada efecto comprobar guardas, permisos, historia y repetición aplicables. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01/T02/T03/T04/T05/T07/T10 conservan atomicidad y revisión conjunta.

<a id="tsk-h6-002"></a>

#### TSK-H6-002 — Verificar E2E-02: Reserva directa

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** Cadena mínima reutilizada con acuerdo real y sin Lead/envío ficticios.
- **Fuentes exactas:** Plan §§9–10.1; SPEC §9; SPEC-FR-ACC-004, SPEC-FR-BOOK-002, AC-075, D018. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-002.
- **Bloques, contratos y unidades:** B01–B10; C01–C06; T01/T02/T03.
- **Entregable previsto:** Casos y evidencia propuestos de recorrido Core. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Datos sintéticos y dobles externos; no requiere UI ni conector; acceso real permanece bloqueado. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Crear directa por aplicación con evidencia sintética válida; repetir y perder respuesta; segundo caso sin Acceptance suficiente.
- **Salida observable:** Una Booking completa y una sola por Opportunity; petición incompleta solo preparación; historia sin pasos fabricados.
- **Verificación y esperado:** Una Booking completa y una sola por Opportunity; petición incompleta solo preparación; historia sin pasos fabricados. En cada efecto comprobar guardas, permisos, historia y repetición aplicables. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01/T02/T03 conservan atomicidad y revisión conjunta.

<a id="tsk-h6-003"></a>

#### TSK-H6-003 — Verificar E2E-03: Modalidades y noches distintas

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** Composición 10+2, rafting10/cena12/noches12 y10, listas opcionales y cambio localizado.
- **Fuentes exactas:** Plan §§9–10.1; SPEC §9; Plan §9 (resultado y salida del hito); correspondencias específicas de §6. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-003.
- **Bloques, contratos y unidades:** B01–B10; C01–C06; T03/T04.
- **Entregable previsto:** Casos y evidencia propuestos de recorrido Core. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Datos sintéticos y dobles externos; no requiere UI ni conector; acceso real permanece bloqueado. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Convertir modalidades, asociar4 nombres de12 y modificar una noche con proceso autorizado; comparar demás alcances.
- **Salida observable:** Una Booking, cantidades exactas, sin duplicación nominal/agregada ni propagación; promoción no reduce asistentes ni deudas.
- **Verificación y esperado:** Una Booking, cantidades exactas, sin duplicación nominal/agregada ni propagación; promoción no reduce asistentes ni deudas. En cada efecto comprobar guardas, permisos, historia y repetición aplicables. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T03/T04 conservan atomicidad y revisión conjunta.

<a id="tsk-h6-004"></a>

#### TSK-H6-004 — Verificar E2E-04: Modificación y cancelación parcial

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** Proceso completo de petición/proveedor/aprobación/operación, determinación D019/D020, Refund y cierre afectado.
- **Fuentes exactas:** Plan §§9–10.1; SPEC §9; Plan §9 (resultado y salida del hito); correspondencias específicas de §6. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-004.
- **Bloques, contratos y unidades:** B01–B10; C01–C06; T04/T06/T07/T10.
- **Entregable previsto:** Casos y evidencia propuestos de recorrido Core. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Datos sintéticos y dobles externos; no requiere UI ni conector; acceso real permanece bloqueado. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Cancelar una parte y mantener otra ejecutada; variante sin base atribuible deja economía pendiente; completar con determinación explícita y salida acreditada.
- **Salida observable:** Parte restante e historia intactas, derecho antes de fondos, salida parcial con pendiente y cierres reevaluados; no aprobación retroactiva.
- **Verificación y esperado:** Parte restante e historia intactas, derecho antes de fondos, salida parcial con pendiente y cierres reevaluados; no aprobación retroactiva. En cada efecto comprobar guardas, permisos, historia y repetición aplicables. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T04/T06/T07/T10 conservan atomicidad y revisión conjunta.

<a id="tsk-h6-005"></a>

#### TSK-H6-005 — Verificar E2E-05: Fondos ajenos y servicio propio

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** Recepción/conciliación, asignaciones, factura/pago externo, honorarios/costes, Tararí y garantía.
- **Fuentes exactas:** Plan §§9–10.1; SPEC §9; Plan §9 (resultado y salida del hito); correspondencias específicas de §6. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-005.
- **Bloques, contratos y unidades:** B01–B10; C01–C06; T05/T07.
- **Entregable previsto:** Casos y evidencia propuestos de recorrido Core. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Datos sintéticos y dobles externos; no requiere UI ni conector; acceso real permanece bloqueado. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Registrar transferencia y porciones, pago sin factura, documento posterior y resolución de fianza; conservar naturaleza propia/ajena.
- **Salida observable:** Cierre documental solo con todos sus hechos; no costes/ingresos propios por fondos ajenos, sin factura Tararí ficticia, cantidades/saldos reproducibles.
- **Verificación y esperado:** Cierre documental solo con todos sus hechos; no costes/ingresos propios por fondos ajenos, sin factura Tararí ficticia, cantidades/saldos reproducibles. En cada efecto comprobar guardas, permisos, historia y repetición aplicables. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05/T07 conservan atomicidad y revisión conjunta.

<a id="tsk-h6-006"></a>

#### TSK-H6-006 — Verificar E2E-06: Efecto sensible incierto

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** Approval exacta → intención/intento → timeout/caída → conciliación → continuación segura.
- **Fuentes exactas:** Plan §§9–10.1; SPEC §9; SPEC-FR-HA-003, SPEC-FR-CONC-005, SPEC-FR-ERR-002, AC-057. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-006.
- **Bloques, contratos y unidades:** B01–B10; C01–C06; T08/T09.
- **Entregable previsto:** Casos y evidencia propuestos de recorrido Core. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Datos sintéticos y dobles externos; no requiere UI ni conector; acceso real permanece bloqueado. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Usar doble con estado propio que ejecuta antes de perder respuesta; reiniciar ejecutor y recibir respuesta tardía, con persistencia real aislada.
- **Salida observable:** Incertidumbre conserva reserva, no reenvío ciego ni doble efecto; respuesta pertenece a su intento y ejecutor obsoleto no sobrescribe resultado nuevo.
- **Verificación y esperado:** Incertidumbre conserva reserva, no reenvío ciego ni doble efecto; respuesta pertenece a su intento y ejecutor obsoleto no sobrescribe resultado nuevo. En cada efecto comprobar guardas, permisos, historia y repetición aplicables. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T08/T09 conservan atomicidad y revisión conjunta.

<a id="tsk-h6-007"></a>

#### TSK-H6-007 — Verificar E2E-07: Evidencia posterior al cierre

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** Cierre conjunto seguido por discrepancia y reapertura fundada.
- **Fuentes exactas:** Plan §§9–10.1; SPEC §9; SPEC-FR-CLOSE-004, AC-061. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-007.
- **Bloques, contratos y unidades:** B01–B10; C01–C06; T09/T10.
- **Entregable previsto:** Casos y evidencia propuestos de recorrido Core. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Datos sintéticos y dobles externos; no requiere UI ni conector; acceso real permanece bloqueado. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Cerrar con todos los hechos, registrar nueva evidencia económica contradictoria y consultar historia/condición vigente.
- **Salida observable:** Solo dimensión afectada vuelve a pendiente y se retira cierre actual; conserva cierre pasado/causa, ejecución y aceptación sin contrato nuevo.
- **Verificación y esperado:** Solo dimensión afectada vuelve a pendiente y se retira cierre actual; conserva cierre pasado/causa, ejecución y aceptación sin contrato nuevo. En cada efecto comprobar guardas, permisos, historia y repetición aplicables. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T09/T10 conservan atomicidad y revisión conjunta.

<a id="tsk-h6-008"></a>

#### TSK-H6-008 — Verificar sesiones y revocación en superficies Core completas

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** PLAN-AUTH-002/003/006 sobre lecturas, mutaciones, resultado idempotente, proyecciones, acceso directo y objetos integrados.
- **Fuentes exactas:** Plan §§6.3–6.5, 9–10; SPEC-FR-SEC-001, SPEC-FR-SEC-002, SPEC-FR-SEC-004, SPEC-FR-SEC-005, AC-064, AC-080, PLAN-AUTH-002, PLAN-AUTH-003, PLAN-AUTH-006, D025, D026. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-008.
- **Bloques, contratos y unidades:** B01/B07/B08/B10; C01–C06; T08.
- **Entregable previsto:** Evidencia propuesta por superficie/dispositivo/versión. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019], [TSK-H0-006], [TSK-H0-014], [TSK-H1-016], [TSK-H5-012]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** PLAN-PENDING-003 no impide este ensayo aislado; el ensayo aporta evidencia para levantar bloqueo de acceso real. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Repetir matriz de límites y revocación con aplicación completa, conexiones reales y reloj controlado; comprobar origen e interacción humana en servidor.
- **Salida observable:** Todas las superficies rechazan sesiones previas inválidas sin filtración; no se acredita solo con SDK o mock.
- **Verificación y esperado:** 7días por sesión independiente y30 absoluto; refresh/polling/jobs no cuentan; límites antes de actividad; contraseña+TOTP cuando corresponde. Revocar desde otro dispositivo incluye emisora, JWT/URL vigentes, peticiones concurrentes y respuesta tardía; recuperación incompleta/actor inhabilitado siempre denegados. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T08 conservan atomicidad y revisión conjunta.

<a id="tsk-h6-009"></a>

#### TSK-H6-009 — Ensayar otro dispositivo y copia TOTP en papel

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** PLAN-AUTH-004: acceso del Administrador en dispositivos previstos y restauración del factor vigente mediante copia protegida fuera de iCloud.
- **Fuentes exactas:** Plan §§6.1, 6.4, 10.8; SPEC-FR-SEC-004, AC-080, PLAN-AUTH-004, D025, D031. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-009.
- **Bloques, contratos y unidades:** B01/B10; C01/C04; —.
- **Entregable previsto:** Acta propuesta sin secretos, QR, contraseña, clave TOTP ni dirección personal. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019], [TSK-H0-017], [TSK-H6-008]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Participación de Andrés y medios protegidos necesarios; pendiente hasta evidencia, sin requerir acceso real al CRM productivo para el ensayo. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Probar en entorno aislado representativo contraseña+TOTP desde otro dispositivo y factor desde papel sin apoyarse en copia sincronizada; verificar copia vigente si se reinscribe.
- **Salida observable:** Resultado observado trazable con autoridad/entorno y limitaciones, sin secretos; no prometer recuperación de cuenta propietaria perdida.
- **Verificación y esperado:** Contraseña sola o código sin identificación completa no bastan; papel debe permitir restaurar factor válido; varios dispositivos no activan single-session. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h6-010"></a>

#### TSK-H6-010 — Ensayar entrega y retorno de recuperación D027

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** Parte email de PLAN-AUTH-001/005: enlace al email previamente verificado y TOTP posterior obligatorio.
- **Fuentes exactas:** Plan §§6.2, 6.4; SPEC-FR-SEC-004, PLAN-AUTH-001, PLAN-AUTH-005, D027. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-010.
- **Bloques, contratos y unidades:** B01/B10; C01/C04; —.
- **Entregable previsto:** Evidencia propuesta de entrega/retorno y guardas sin dirección, enlace secreto ni contenido sensible. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019], [TSK-H0-017], [TSK-H6-008]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Capacidad/coste/configuración de entrega verificados y aceptados antes de configurar/contratar; ensayo no requiere declarar resuelto PLAN-PENDING-003. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Con participación autorizada, ensayar contraseña no disponible en gestor, entrega real al destinatario previamente verificado y retorno seguro en entorno aislado representativo.
- **Salida observable:** Entrega y retorno acreditados y TOTP exigido; mocks de correo no satisfacen esta tarea.
- **Verificación y esperado:** Sin entrega comprobada no cerrar; enlace inválido/consumido o recuperación incompleta sin Core; restablecimiento no omite TOTP. No se habilitan avisos internos por email ni conector comercial. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h6-011"></a>

#### TSK-H6-011 — Ensayar recuperación extrema D031 con propietario independiente

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** Parte de PLAN-AUTH-005/006: autoridad/acceso propietario independiente, mínimos privilegios, revocación, incidente, recuperación mínima y TOTP nuevo/papel.
- **Fuentes exactas:** Plan §§6.4, 11.3; SPEC-FR-SEC-004, PLAN-AUTH-005, PLAN-AUTH-006, D031. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-011.
- **Bloques, contratos y unidades:** B01/B07/B10; C01/C03/C04; —.
- **Entregable previsto:** Acta/procedimiento propuestos de ensayo aislado; migración equivalente si la intervención cae en P13. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019], [TSK-H0-015], [TSK-H6-008], [TSK-H6-009], [TSK-H6-010]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Acceso independiente/autoridad del propietario y participación humana necesarios; no autodeclarar independencia ni exigir que pendiente ya esté resuelto. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Simular pérdida de contraseña/dispositivos/papel en el CRM aislado; comprobar acceso propietario por vía independiente y ejecutar solo pasos de recuperación autorizados.
- **Salida observable:** Procedimiento observado y trazable, sin bypass MFA ordinario ni garantía de recuperar la cuenta propietaria también perdida.
- **Verificación y esperado:** Verificar autoridad, revocar todas incluidas emisora, registrar incidente/acciones sin secretos, restablecer mínimo, enrolar TOTP nuevo y verificar nueva copia fuera de iCloud. Core denegado hasta completar; privilegios no pasan a rol ordinario/IA; respetar P13. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h6-012"></a>

#### TSK-H6-012 — Contrastar capacidad y coste finales antes de acceso real

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: documentación/evidencia.
- **Objetivo y alcance:** PLAN-AUTH-001: entorno/versiones/configuración realmente comprobados frente al registro inicial y alcance de ensayos.
- **Fuentes exactas:** Plan §§6.2–6.4, 11.1; PLAN-AUTH-001. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-012.
- **Bloques, contratos y unidades:** B01/B10; C01/C04; —.
- **Entregable previsto:** Informe propuesto de capacidad/coste, diferencias y evidencia de aceptación. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019], [TSK-H0-001], [TSK-H6-010], [TSK-H6-011]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Aceptación humana de coste concreto antes de contratación/configuración dependiente; esta tarea no hace ninguna contratación. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Revisar cambios de versiones/servicios/coste desde H0 y correspondencia con ensayos; pedir decisión solo para costes/capacidades dependientes aún no aceptados.
- **Salida observable:** PLAN-AUTH-001 tiene evidencia vigente suficiente o bloqueo preciso; ninguna aceptación se presume por silencio.
- **Verificación y esperado:** No reutilizar tarifas publicadas históricas como contrato; ningún recurso/configuración habilitado por una página de docs; independencia de entornos y varios dispositivos comprobadas. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** La recopilación parcial puede acompañar trabajo independiente; el cierre espera todas sus dependencias. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h6-013"></a>

#### TSK-H6-013 — Verificar cadena completa de migraciones vacía y actualización

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** Compatibilidad aplicación/esquema y conservación de identidades, snapshots, porciones, historia y permisos de todos los paquetes.
- **Fuentes exactas:** Plan §§5.4, 10.1, 11.4; SPEC-FR-HIST-002, AC-079. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-013.
- **Bloques, contratos y unidades:** B01–B10; C03; T01–T11.
- **Entregable previsto:** Evidencia propuesta por paquete/versiones y diagnóstico de discrepancias. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** No exige datos productivos; entorno aislado con fixtures y versiones anteriores verificables. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Aplicar secuencia en base vacía y actualizar desde versión anterior con hechos sintéticos; verificar expansión/transformación/compatibilidad y recuperación de paquete.
- **Salida observable:** Cadena versionada repetible y evidenciada, sin deriva ni datos eliminados para forzar validación.
- **Verificación y esperado:** Permisos/contexto, historias/snapshots, identificadores y porciones conservados; restricciones fallidas no se corrigen borrando datos. Aplicación anterior solo se recupera si compatible con esquema; nuevos hechos se protegen mediante reparación hacia delante cuando proceda. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01–T11 conservan atomicidad y revisión conjunta.

<a id="tsk-h6-014"></a>

#### TSK-H6-014 — Preparar inventario y procedimiento de restauración aislada

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: preparación.
- **Objetivo y alcance:** Datos, objetos, historia, Auth/actor, configuración, credenciales protegidas, referencias, idempotencia, aprobaciones y ejecuciones.
- **Fuentes exactas:** Plan §§5.4, 11.3; AC-073. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-014.
- **Bloques, contratos y unidades:** B01/B07/B08/B10; C03/C04/C05; T08/T09.
- **Entregable previsto:** Inventario y procedimiento propuestos con responsable y puntos de conciliación; sin secretos. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019], [TSK-H6-013]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** ARCH-PENDING-002 solo bloquea aceptación/configuración definitiva Production; no impide diseñar ni ensayar restauración aislada. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Identificar copias/capacidades realmente disponibles, cubrir objetos por separado y planificar medición de pérdida/tiempo observados y suspensión de efectos.
- **Salida observable:** Procedimiento ejecutable en entorno aislado con alcance/restauración/conciliación explícitos, sin RPO/RTO/frecuencia/coste inventados.
- **Verificación y esperado:** Backup de base no acredita objetos ni credenciales de roles recuperados; no asumir backups/PITR existentes. Inventario incluye sesiones revocadas para impedir reactivación tras restauración. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T08/T09 conservan atomicidad y revisión conjunta.

<a id="tsk-h6-015"></a>

#### TSK-H6-015 — Restaurar en aislamiento y conciliar antes de reanudar

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** Restauración coherente de inventario y efectos posteriores al punto recuperado, sin reactivar sesiones ni repetir efectos externos.
- **Fuentes exactas:** Plan §§10.1, 11.3; SPEC-FR-HIST-004, SPEC-FR-IDEMP-002, SPEC-FR-ERR-002, AC-073, AC-074. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-015.
- **Bloques, contratos y unidades:** B01/B05/B07/B08/B09/B10; C01/C03/C04/C05; T05/T07/T08/T09.
- **Entregable previsto:** Acta propuesta de restauración, mediciones observadas y conciliación con dobles. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019], [TSK-H6-014], [TSK-H6-006], [TSK-H6-008]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Puede aportar evidencia con ARCH-PENDING-002 pendiente; no acredita objetivos Production aún no acordados. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Restaurar copias de prueba en recurso aislado, verificar objetos/metadatos/historia/porciones y conciliar estado externo simulado antes de reanudar trabajos.
- **Salida observable:** Integridad y conciliación verificadas, pérdidas/tiempos observados y límites documentados; ninguna garantía Production deducida de mediciones.
- **Verificación y esperado:** Pago/envío ocurrido tras punto restaurado no se repite; objeto ausente no consta recuperado; reservas/aprobaciones pendientes no se liberan por restaurar. Sesión previamente revocada no revive; recuperación protegida de configuración/credenciales sin volcar secretos. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T05/T07/T08/T09 conservan atomicidad y revisión conjunta.

<a id="tsk-h6-016"></a>

#### TSK-H6-016 — Verificar intercalaciones y fallos de T01–T11 integradas

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** Unidades materiales sobre versión, raíz Opportunity, fondos, Approval, trabajo, Booking/cierre e identidades con aplicación completa.
- **Fuentes exactas:** Plan §§7.2, 10.1; SPEC-FR-CONC-001, SPEC-FR-CONC-002, SPEC-FR-CONC-003, AC-067, AC-068. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-016.
- **Bloques, contratos y unidades:** B01–B10; C02/C03/C06; T01–T11.
- **Entregable previsto:** Evidencia propuesta por unidad, puntos de fallo y órdenes. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019], [TSK-H6-013], [TSK-H6-001], [TSK-H6-004], [TSK-H6-006], [TSK-H6-007]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Solo PostgreSQL aislado real; dobles no acreditan atomicidad/concurrencia. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Ejecutar matriz §6.5 por cada unidad e intercalaciones integradas; comparar resultado y ausencia de efectos colaterales con los guiones específicos de sus tareas.
- **Salida observable:** Todos los límites transaccionales tienen evidencia integrada, sin Booking/fondos/Approval/cierre incompatibles ni historia perdida.
- **Verificación y esperado:** Ambos órdenes/solapamiento, ausencia inicial de hijos, fallo antes/durante commit y respuesta perdida; raíz compartida en cierre vs factura/Refund/Incident, reserva/consumo y contexto pool. No retry ciego de negocio ni transición extra por éxito técnico. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01–T11 conservan atomicidad y revisión conjunta.

<a id="tsk-h6-017"></a>

#### TSK-H6-017 — Verificar exposición, privacidad y prohibición fiscal integradas

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.
- **Objetivo y alcance:** Salidas por finalidad, documentos/objetos, búsquedas/exportaciones/timeline/IA, logs y permisos reales fuera de UI.
- **Fuentes exactas:** Plan §§6.5, 10.1, 11.1–11.2, 12.2; SPEC-FR-ID-004, SPEC-FR-PROP-003, SPEC-FR-ECON-014, SPEC-FR-HA-005, SPEC-FR-SEC-002, SPEC-FR-SEC-003, SPEC-FR-SEC-005, SPEC-FR-SEC-006, SPEC-FR-SEC-007, SPEC-FR-INT-002, AC-011, AC-056, AC-065, AC-078, AC-079, AC-082, AC-088. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-017.
- **Bloques, contratos y unidades:** B01/B05/B07/B09/B10; C01/C04/C05; —.
- **Entregable previsto:** Evidencia propuesta de permisos/proyecciones por destinatario y revisión de artefactos/logs. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019], [TSK-H6-008], [TSK-H5-012], [TSK-H5-018]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** DM-PENDING-002/005 conservan límites de tratamiento/fiscalidad; fixtures sintéticos para probar denegación. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Intentar acceso directo y serialización no autorizados en todas las finalidades declaradas; revisar objetos, logs/configuración y aislamiento.
- **Salida observable:** Permisos y minimización demostrados con datos reales aislados sintéticos; no filtraciones ni capacidades fiscales por atajo.
- **Verificación y esperado:** Terceros/roles futuros/job sin facultad denegados; ningún coste/margen/beneficio/honorario ni personal innecesario/secretos/URL temporal en salida/log. Documento externo/aprobación no emite ni numera factura; sin audio, borrado importante o retención indefinida por defecto. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** Solo con tareas independientes cuyas dependencias estén satisfechas, según §5. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades internas aplicables conservan atomicidad y revisión conjunta.

<a id="tsk-h6-018"></a>

#### TSK-H6-018 — Revisar evidencia y puertas de aceptación del candidato

- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: documentación/evidencia.
- **Objetivo y alcance:** Matriz completa, criterios de tareas/bloques/hitos, limitaciones y preparación de entrega; acceso real y Production con puertas separadas.
- **Fuentes exactas:** Plan §§9–13; AC-084, AC-089, AC-090, D024, D030, D032, D033, D034, D035. §6 identifica archivo/sección y detalla también invariantes, transiciones, prohibiciones y demás obligaciones asignadas a TSK-H6-018.
- **Bloques, contratos y unidades:** B01–B10; C01–C06; T01–T11.
- **Entregable previsto:** Informe propuesto del candidato con commit/versiones, migraciones, evidencia, limitaciones y plan de recuperación; no despliegue. Áreas propuestas, no creadas; véase §2.1.
- **Dependencias y precondiciones:** [TSK-H5-019], [TSK-H6-001], [TSK-H6-002], [TSK-H6-003], [TSK-H6-004], [TSK-H6-005], [TSK-H6-006], [TSK-H6-007], [TSK-H6-008], [TSK-H6-009], [TSK-H6-010], [TSK-H6-011], [TSK-H6-012], [TSK-H6-013], [TSK-H6-014], [TSK-H6-015], [TSK-H6-016], [TSK-H6-017]. Requiere aprobación de Tasks y autorización posterior de implementación; entorno/datos autorizados y compatibles para el alcance. La salida de H5 está incluida expresamente.
- **Bloqueo localizado / condición para levantarlo:** Acceso real: PLAN-AUTH-001–006 satisfactorias y decisiones/datos necesarios. Production: además ARCH-PENDING-002 y políticas/capacidades de continuidad aceptadas; no bloquean redactar el informe parcial. El detalle de evidencia/decisión y puerta está en §7; no cambia el estado NOT STARTED.
- **Acción futura:** Contrastar todas las asignaciones con pruebas observadas; separar informe técnico aislado, aceptación de acceso real y preparación Production; registrar decisión humana faltante en su puerta.
- **Salida observable:** Informe revisable; solo evidencia satisfactoria permite cierre del alcance; aprobación Tasks, autorización de implementación y autorización de uso/despliegue conservan actos propios.
- **Verificación y esperado:** AC-084/089/090: publicar no aprueba, desviación requiere Spec aprobada y pendientes históricos resueltos no se reabren. Evidencia ausente/fallida impide declarar terminado su bloque. RPO/RTO/coste/periodicidad Production requieren decisión y comprobación. Aplicar protocolos §2.2 y cada fila normativa asignada, incluidas guardas y prohibiciones pertinentes.
- **Evidencia necesaria:** V-EVI, con el resultado esperado anterior y la comparación observada por caso/ID; migración y pruebas reales aplicables de §2.2. **NO EJECUTADA**: observado y resultado aún sin producir.
- **Paralelismo y restricciones:** La recopilación parcial puede acompañar trabajo independiente; el cierre espera todas sus dependencias. No compartir escrituras sobre contrato, migración, archivo, raíz, objetos o recurso de ensayo; las unidades T01–T11 conservan atomicidad y revisión conjunta.

## 5. Dependencias, bloques pequeños y paralelismo

### 5.1. Capacidades tempranas y alcance de integración

| Necesidad | Provisión previa y comprobación | Integración posterior obligatoria |
|---|---|---|
| Autorización, historia, idempotencia y mínimo B08 desde el primer efecto | [TSK-H0-007], [TSK-H0-008], [TSK-H0-009], [TSK-H0-010], [TSK-H0-005], [TSK-H0-006], [TSK-H0-011], [TSK-H0-012]. Primero contexto técnico aislado y persistencia; después sesión humana y Approval. Ningún efecto de negocio se habilita antes de disponer de autorización/historia/idempotencia. | [TSK-H5-007], [TSK-H5-008], [TSK-H6-008], [TSK-H6-016]; nuevas superficies reusan controles ya comprobados. |
| B07 mínimo: originales, Document/Evidence, hechos manuales de Communication y objetos | [TSK-H1-013], [TSK-H1-014], [TSK-H1-015], [TSK-H1-016], H1. Está disponible antes de Acceptance, recepciones, factura y pagos de H3. | [TSK-H5-005], [TSK-H5-006], [TSK-H5-011], [TSK-H5-012], [TSK-H6-015]. H1 no afirma que composición, derivados o envío externo estén implementados. |
| B07 mínimo: necesidad persistida y causa sin duplicación | [TSK-H1-017], [TSK-H1-018], H1; lo consumen H2–H4. | [TSK-H5-001], [TSK-H5-002], [TSK-H5-003], [TSK-H5-004], [TSK-H5-007], [TSK-H5-008] completan ciclo, disparadores y avisos en H5. |
| H4 necesita requisitos/documentos/incidencias materiales | [TSK-H4-001], [TSK-H4-002], [TSK-H4-003], [TSK-H4-004] sobre evidencia H1; preceden confirmación/prestación. | [TSK-H4-020], [TSK-H4-021], [TSK-H4-022], [TSK-H4-023], [TSK-H5-013], [TSK-H5-014], [TSK-H5-015], [TSK-H5-016]. |
| Confirmación completa de Booking con economía H3 | [TSK-H4-020], [TSK-H4-021] en H4; servicios, requisitos, fondos/porciones y cambios disponibles. | [TSK-H6-001], [TSK-H6-016]; Ganada o servicio confirmado no sustituyen las otras guardas. |
| Tres cierres y reapertura conjunta | [TSK-H5-013], [TSK-H5-014], [TSK-H5-015], [TSK-H5-016] en H5 con economía/operación/documentos reales aislados. | [TSK-H6-007], [TSK-H6-016]. No exigir cierre integrado para construir sus insumos anteriores. |

H3 no exige servicios confirmados: usa servicios identificados por H2 y evidencia H1. H3 prueba componentes económicos y H4 integra Refund/fianza y sus carreras reales. H1 prueba identidades/cálculo con contexto sintético; la preservación frente a Acceptance real del Core se completa en H2. En H3, el componente documental del suplido se prueba antes del pago proveedor y [TSK-H3-012] completa el recorrido positivo conjunto antes de la salida H3.

El grafo incluye explícitamente la salida del hito anterior en **cada** tarea de H1–H6. El orden numérico es estable, pero la dependencia manda: por ejemplo, en H0 permisos/atomicidad se verifican antes de integrar Auth, aunque sus IDs numéricos sean posteriores.

### 5.2. Orden propuesto de cambios revisables

Cada fila es un bloque pequeño futuro: cambio y comprobación local, sin separar su unidad atómica. Se respetan además las preparaciones, comprobaciones integradas y salidas de hito de las fichas. Este orden no inicia ejecución.

| Orden | Hito | Cambio acotado | Comprobación local obligatoria |
|---|---|---|---|
| 1 | H0 | [TSK-H0-003] — Componer servidor modular y resultados C01–C06 | [TSK-H0-004]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 2 | H0 | [TSK-H0-007] — Separar rol ordinario, migración y contexto transaccional | [TSK-H0-008]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 3 | H0 | [TSK-H0-009] — Persistir historia y resultado de la unidad interna | [TSK-H0-010]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 4 | H0 | [TSK-H0-005] — Identificar CRM Actor y aplicar límites por sesión | [TSK-H0-006]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 5 | H0 | [TSK-H0-011] — Autorizar y reservar un efecto exacto | [TSK-H0-012]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 6 | H0 | [TSK-H0-013] — Revocar globalmente acceso al Core y renovaciones | [TSK-H0-014]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 7 | H0 | [TSK-H0-016] — Aplicar ámbito mínimo de enrolamiento y recuperación | [TSK-H0-017]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 8 | H1 | [TSK-H1-001] — Registrar identidades y responsables contextuales | [TSK-H1-002]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 9 | H1 | [TSK-H1-003] — Fusionar y archivar identidades sin reutilizar códigos | [TSK-H1-004]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 10 | H1 | [TSK-H1-005] — Versionar catálogo, proveedores y unidades | [TSK-H1-006]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 11 | H1 | [TSK-H1-007] — Versionar tarifas, packs y requisitos aplicables | [TSK-H1-008]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 12 | H1 | [TSK-H1-009] — Calcular importes exactos y materialización monetaria | [TSK-H1-010]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 13 | H1 | [TSK-H1-011] — Calcular fechas civiles y referencias por alcance | [TSK-H1-012]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 14 | H1 | [TSK-H1-013] — Registrar evidencia y comunicaciones acreditadas mínimas | [TSK-H1-014]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 15 | H1 | [TSK-H1-015] — Conservar objetos privados y reparar cargas incompletas | [TSK-H1-016]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 16 | H1 | [TSK-H1-017] — Persistir necesidades mínimas de seguimiento B07 | [TSK-H1-018]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 17 | H2 | [TSK-H2-001] — Registrar captación y progreso comercial | [TSK-H2-002]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 18 | H2 | [TSK-H2-003] — Preparar y fijar versiones con modalidades y precio manual | [TSK-H2-004]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 19 | H2 | [TSK-H2-005] — Evaluar vigencia, envío y rechazo de la oferta | [TSK-H2-006]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 20 | H2 | [TSK-H2-007] — Registrar, verificar y rectificar Acceptance exacta | [TSK-H2-008]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 21 | H2 | [TSK-H2-009] — Convertir cadena normal/directa en Booking íntegra | [TSK-H2-010]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 22 | H3 | [TSK-H3-001] — Determinar vencimientos y cobertura de obligaciones | [TSK-H3-002]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 23 | H3 | [TSK-H3-003] — Distinguir detección, recepción y conciliación de cobros | [TSK-H3-004]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 24 | H3 | [TSK-H3-005] — Asignar y consumir porciones sin sobreasignación | [TSK-H3-006]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 25 | H3 | [TSK-H3-007] — Recibir, revisar y vincular factura externa al cliente | [TSK-H3-008]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 26 | H3 | [TSK-H3-009] — Separar gestión de fondos y cierre documental de suplido | [TSK-H3-010]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 27 | H3 | [TSK-H3-011] — Registrar programación y pago acreditado al proveedor | [TSK-H3-012]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 28 | H3 | [TSK-H3-013] — Aplicar honorarios, costes, promoción y Tararí | [TSK-H3-014]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 29 | H4 | [TSK-H4-001] — Aplicar requisitos personales y Required Document | [TSK-H4-002]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 30 | H4 | [TSK-H4-003] — Gestionar Incident y su impacto mínimo | [TSK-H4-004]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 31 | H4 | [TSK-H4-005] — Registrar y verificar disponibilidad por alcance | [TSK-H4-006]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 32 | H4 | [TSK-H4-007] — Registrar opciones, vigencia y liberación | [TSK-H4-008]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 33 | H4 | [TSK-H4-009] — Confirmar prestación externa o interna con cobertura | [TSK-H4-010]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 34 | H4 | [TSK-H4-011] — Evaluar y aplicar modificación operativa y revalidación | [TSK-H4-012]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 35 | H4 | [TSK-H4-013] — Determinar derecho de cancelación antes de ajustar fondos | [TSK-H4-014]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 36 | H4 | [TSK-H4-015] — Autorizar y registrar Refund parcial sin repetir porciones | [TSK-H4-016]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 37 | H4 | [TSK-H4-017] — Resolver fianza por entrega, retención y devolución | [TSK-H4-018]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 38 | H4 | [TSK-H4-020] — Evaluar preparación y confirmación completa de Booking | [TSK-H4-021]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 39 | H4 | [TSK-H4-022] — Registrar prestación, cancelación y realidad sobrevenida | [TSK-H4-023]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 40 | H5 | [TSK-H5-001] — Completar ciclo y disparadores de Task del negocio | [TSK-H5-002]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 41 | H5 | [TSK-H5-003] — Registrar alertas y notificaciones según D016 | [TSK-H5-004]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 42 | H5 | [TSK-H5-005] — Preparar comunicaciones y registrar derivados con Review | [TSK-H5-006]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 43 | H5 | [TSK-H5-007] — Reclamar y recuperar trabajo persistido | [TSK-H5-008]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 44 | H5 | [TSK-H5-009] — Normalizar eventos y resultados de fronteras con dobles | [TSK-H5-010]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 45 | H5 | [TSK-H5-011] — Consultar timeline, calendario y salidas por finalidad | [TSK-H5-012]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 46 | H5 | [TSK-H5-013] — Evaluar los tres cierres con fundamentos actuales | [TSK-H5-014]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 47 | H5 | [TSK-H5-015] — Cerrar conjuntamente y reabrir bajo concurrencia | [TSK-H5-016]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |
| 48 | H5 | [TSK-H5-017] — Relacionar fallos con historia y proteger diagnóstico | [TSK-H5-018]; V-MIG si hay persistencia, y las integraciones indicadas en la ficha. |

Antes del primer bloque: [TSK-H0-001], [TSK-H0-002]. Recuperación usa además [TSK-H0-015]. Entre hitos se cierran [TSK-H0-018], [TSK-H1-019], [TSK-H2-012], [TSK-H3-015], [TSK-H4-024], [TSK-H5-019]. Tras H5, ejecutar las siete fichas E2E, verificaciones de acceso/dispositivos/recuperación, migración, restauración, concurrencia y privacidad conforme a sus dependencias; cerrar documentalmente con [TSK-H6-018]. La preparación de restauración [TSK-H6-014] precede su ensayo. Ningún bloque se declara completo con comprobaciones obligatorias pendientes.

### 5.3. Paralelismo condicionado

| Trabajo que puede avanzar en paralelo | Precondición concreta | Restricción |
|---|---|---|
| [TSK-H1-003], [TSK-H1-005], [TSK-H1-013], [TSK-H1-011] | H0 terminado; las tres primeras requieren [TSK-H1-002]; cada una mantiene las demás dependencias de su ficha. | Contrato de identidad estable; serializar migraciones/archivos comunes. Cálculo civil usa fixtures propios. |
| [TSK-H1-015], [TSK-H1-017] | [TSK-H1-014] y las dependencias de cada ficha satisfechas. | No escribir los mismos metadatos o recursos de ensayo; controles de acceso ya disponibles. |
| [TSK-H3-007], [TSK-H3-013] | H2 y [TSK-H3-006], más requisitos propios. | Separar hechos/documentos de costes y proyecciones; preservar unidades monetarias comunes. |
| [TSK-H4-003], [TSK-H4-005] | H3 y [TSK-H4-002]. | Contratos de alcance/revisión estables y expedientes sintéticos separados. |
| [TSK-H5-003], [TSK-H5-005] | H4 y [TSK-H5-002]; evidencia/objetos H1 verificados. | No compartir contrato de intención sin revisión; todavía sin envío real. |
| [TSK-H5-001], [TSK-H5-013] | H4 y dependencias individuales satisfechas. | Las evaluaciones no deben inferir hechos de Task; raíz/contratos compartidos se revisan conjuntamente. |
| E2E H6 independientes y [TSK-H6-013] | H5 completo en su alcance verificable. | Bases/fixtures/recursos separados. Migrar una base en uso o revocar sesiones compartidas invalida independencia. |
| Revisión de evidencia | Evidencia parcial disponible. | No equivale a cerrar tarea/hito ni a superar puertas de acceso real/Production. |

Los ensayos de revocación, dispositivos, email y break-glass se serializan si comparten cuenta, sesiones o factores. No paralelizar cambios a la misma migración, archivo, contrato o unidad PLAN-T. Identificar este paralelismo no autoriza ejecutarlo ni exige agentes.

## 6. Matrices de trazabilidad

Cada fila es una correspondencia normativa, no una marca de prueba pasada. **Desarrollo** puede ser implementación, preparación o documentación de límites; **verificación** identifica fichas de comprobación/evidencia concretas. Para P02/P03/P04/P18/P19, D030/D033–D035 y criterios documentales, desarrollar significa conservar disciplina y límites, nunca crear capacidades fuera de alcance.

Los archivos enlazados son fuentes existentes. La sección y el ID localizan inequívocamente la fila; no se inventan IDs ni se atribuye cobertura a un hito genérico. Las matrices relacionan un mismo componente con distintas verificaciones cuando sus criterios necesitan integración posterior. La fila no queda satisfecha por terminar solo una de ellas.

### 6.1. Requisitos funcionales (116 FR)

| Origen y localización | Desarrollo | Verificación | Alcance del contraste / resultado esperado |
|---|---|---|---|
| **SPEC-FR-ID-001** — [spec.md](spec.md), § 10.1. Identidad y relaciones | [TSK-H1-001] | [TSK-H1-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ID-002** — [spec.md](spec.md), § 10.1. Identidad y relaciones | [TSK-H1-001] | [TSK-H1-002], [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ID-003** — [spec.md](spec.md), § 10.1. Identidad y relaciones | [TSK-H1-003] | [TSK-H1-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ID-004** — [spec.md](spec.md), § 10.1. Identidad y relaciones | [TSK-H2-009], [TSK-H4-001] | [TSK-H2-011], [TSK-H4-002], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ID-005** — [spec.md](spec.md), § 10.1. Identidad y relaciones | [TSK-H1-003] | [TSK-H1-004], [TSK-H2-010], [TSK-H4-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-COM-001** — [spec.md](spec.md), § 10.2. Comercial | [TSK-H2-001] | [TSK-H2-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-COM-002** — [spec.md](spec.md), § 10.2. Comercial | [TSK-H2-001], [TSK-H2-009] | [TSK-H2-002], [TSK-H2-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-COM-003** — [spec.md](spec.md), § 10.2. Comercial | [TSK-H2-001], [TSK-H2-007], [TSK-H2-005] | [TSK-H2-002], [TSK-H2-008], [TSK-H2-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-COM-004** — [spec.md](spec.md), § 10.2. Comercial | [TSK-H2-001] | [TSK-H2-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-COM-005** — [spec.md](spec.md), § 10.2. Comercial | [TSK-H2-001] | [TSK-H2-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CAT-001** — [spec.md](spec.md), § 10.3. Catálogo mínimo del expediente | [TSK-H1-005] | [TSK-H1-006], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CAT-002** — [spec.md](spec.md), § 10.3. Catálogo mínimo del expediente | [TSK-H1-005], [TSK-H1-009] | [TSK-H1-006], [TSK-H1-010], [TSK-H2-011] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CAT-003** — [spec.md](spec.md), § 10.3. Catálogo mínimo del expediente | [TSK-H1-005] | [TSK-H1-006], [TSK-H4-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CAT-004** — [spec.md](spec.md), § 10.3. Catálogo mínimo del expediente | [TSK-H1-007] | [TSK-H1-008], [TSK-H2-004], [TSK-H3-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CAT-005** — [spec.md](spec.md), § 10.3. Catálogo mínimo del expediente | [TSK-H1-007], [TSK-H2-003] | [TSK-H1-008], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CAT-006** — [spec.md](spec.md), § 10.3. Catálogo mínimo del expediente | [TSK-H1-007], [TSK-H3-013] | [TSK-H3-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CAT-007** — [spec.md](spec.md), § 10.3. Catálogo mínimo del expediente | [TSK-H1-007], [TSK-H4-001], [TSK-H4-009] | [TSK-H1-008], [TSK-H4-002], [TSK-H4-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-001** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-003] | [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-002** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-003] | [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-003** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-003], [TSK-H2-009] | [TSK-H2-004], [TSK-H2-011], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-004** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-005] | [TSK-H2-006], [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-005** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-003], [TSK-H1-009] | [TSK-H2-004], [TSK-H1-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-006** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-005], [TSK-H1-013], [TSK-H5-005] | [TSK-H2-006], [TSK-H1-014], [TSK-H5-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-007** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-003], [TSK-H2-005] | [TSK-H2-004], [TSK-H2-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ACC-001** — [spec.md](spec.md), § 10.5. Acceptance | [TSK-H2-007] | [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ACC-002** — [spec.md](spec.md), § 10.5. Acceptance | [TSK-H2-007] | [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ACC-003** — [spec.md](spec.md), § 10.5. Acceptance | [TSK-H2-007], [TSK-H2-003] | [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ACC-004** — [spec.md](spec.md), § 10.5. Acceptance | [TSK-H2-007] | [TSK-H2-008], [TSK-H6-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ACC-005** — [spec.md](spec.md), § 10.5. Acceptance | [TSK-H2-007], [TSK-H3-009] | [TSK-H2-008], [TSK-H3-010], [TSK-H3-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-BOOK-001** — [spec.md](spec.md), § 10.6. Conversión y Booking | [TSK-H2-009] | [TSK-H2-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-BOOK-002** — [spec.md](spec.md), § 10.6. Conversión y Booking | [TSK-H2-009] | [TSK-H2-010], [TSK-H6-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-BOOK-003** — [spec.md](spec.md), § 10.6. Conversión y Booking | [TSK-H2-009] | [TSK-H2-010], [TSK-H2-011] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-BOOK-004** — [spec.md](spec.md), § 10.6. Conversión y Booking | [TSK-H4-020] | [TSK-H4-021] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-BOOK-005** — [spec.md](spec.md), § 10.6. Conversión y Booking | [TSK-H4-022] | [TSK-H4-023] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-001** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H2-009] | [TSK-H2-010], [TSK-H2-011] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-002** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H2-009], [TSK-H4-011] | [TSK-H2-011], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-003** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H2-009], [TSK-H4-011] | [TSK-H2-011], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-004** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H2-009], [TSK-H4-001] | [TSK-H2-011], [TSK-H4-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-005** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-006** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H4-005] | [TSK-H4-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-007** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H4-007] | [TSK-H4-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-008** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H4-009] | [TSK-H4-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-009** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H4-009], [TSK-H4-022], [TSK-H3-013] | [TSK-H4-010], [TSK-H4-023], [TSK-H3-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-010** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H4-011], [TSK-H4-005] | [TSK-H4-012], [TSK-H4-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SVC-011** — [spec.md](spec.md), § 10.7. Prestaciones, cantidades y operación | [TSK-H4-022], [TSK-H4-011] | [TSK-H4-023], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-001** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-002** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-003** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H4-011], [TSK-H4-013] | [TSK-H4-012], [TSK-H4-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-004** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-005** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H4-011], [TSK-H4-022] | [TSK-H4-012], [TSK-H4-023] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-006** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H4-013] | [TSK-H4-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-007** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H4-013] | [TSK-H4-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-008** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H4-013], [TSK-H3-005], [TSK-H4-015] | [TSK-H4-014], [TSK-H4-016], [TSK-H4-019] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CHG-009** — [spec.md](spec.md), § 10.8. Modificaciones y cancelaciones | [TSK-H1-011], [TSK-H4-013], [TSK-H4-011] | [TSK-H1-012], [TSK-H4-014], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-001** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H3-001] | [TSK-H3-002], [TSK-H4-021] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-002** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H3-001], [TSK-H3-005], [TSK-H1-011], [TSK-H5-001] | [TSK-H3-002], [TSK-H3-006], [TSK-H5-002], [TSK-H4-021] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-003** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H3-003] | [TSK-H3-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-004** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H3-003], [TSK-H3-005] | [TSK-H3-004], [TSK-H3-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-005** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H3-005] | [TSK-H3-006], [TSK-H4-019] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-006** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H3-003], [TSK-H3-005], [TSK-H4-015] | [TSK-H3-004], [TSK-H3-006], [TSK-H4-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-007** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H4-013], [TSK-H4-015] | [TSK-H4-014], [TSK-H4-016], [TSK-H4-019] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-008** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H4-017] | [TSK-H4-018], [TSK-H4-019] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-009** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H3-009] | [TSK-H3-010], [TSK-H3-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-010** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H3-007] | [TSK-H3-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-011** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H3-011] | [TSK-H3-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-012** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H3-013] | [TSK-H3-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-013** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H1-009], [TSK-H3-013] | [TSK-H1-010], [TSK-H3-014], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-014** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H1-009], [TSK-H3-013] | [TSK-H1-010], [TSK-H3-014], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CLOSE-001** — [spec.md](spec.md), § 10.10. Cierres | [TSK-H5-013] | [TSK-H5-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CLOSE-002** — [spec.md](spec.md), § 10.10. Cierres | [TSK-H5-013] | [TSK-H5-014], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CLOSE-003** — [spec.md](spec.md), § 10.10. Cierres | [TSK-H5-015] | [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CLOSE-004** — [spec.md](spec.md), § 10.10. Cierres | [TSK-H5-015] | [TSK-H5-016], [TSK-H6-007] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-HIST-001** — [spec.md](spec.md), § 14. Versions, Snapshots, History and Evidence | [TSK-H0-009], [TSK-H1-013] | [TSK-H0-010], [TSK-H1-014], [TSK-H2-008], [TSK-H4-023], [TSK-H5-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-HIST-002** — [spec.md](spec.md), § 14. Versions, Snapshots, History and Evidence | [TSK-H0-009], [TSK-H2-003], [TSK-H1-007], [TSK-H3-013] | [TSK-H0-010], [TSK-H2-004], [TSK-H3-014], [TSK-H6-013] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-HIST-003** — [spec.md](spec.md), § 14. Versions, Snapshots, History and Evidence | [TSK-H1-013], [TSK-H1-015], [TSK-H5-005] | [TSK-H1-014], [TSK-H1-016], [TSK-H5-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-HIST-004** — [spec.md](spec.md), § 14. Versions, Snapshots, History and Evidence | [TSK-H1-015] | [TSK-H1-016], [TSK-H6-015] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-HIST-005** — [spec.md](spec.md), § 14. Versions, Snapshots, History and Evidence | [TSK-H5-005], [TSK-H4-011] | [TSK-H5-006], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-HIST-006** — [spec.md](spec.md), § 14. Versions, Snapshots, History and Evidence | [TSK-H1-003], [TSK-H5-011] | [TSK-H1-004], [TSK-H5-012], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-COORD-001** — [spec.md](spec.md), § 15. Tasks, Alerts, Incidents and Operational Calendar | [TSK-H1-017], [TSK-H5-001] | [TSK-H1-018], [TSK-H5-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-COORD-002** — [spec.md](spec.md), § 15. Tasks, Alerts, Incidents and Operational Calendar | [TSK-H1-017], [TSK-H5-001] | [TSK-H1-018], [TSK-H5-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-COORD-003** — [spec.md](spec.md), § 15. Tasks, Alerts, Incidents and Operational Calendar | [TSK-H1-011], [TSK-H5-001] | [TSK-H1-012], [TSK-H5-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-COORD-004** — [spec.md](spec.md), § 15. Tasks, Alerts, Incidents and Operational Calendar | [TSK-H5-003] | [TSK-H5-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-COORD-005** — [spec.md](spec.md), § 15. Tasks, Alerts, Incidents and Operational Calendar | [TSK-H4-001] | [TSK-H4-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-COORD-006** — [spec.md](spec.md), § 15. Tasks, Alerts, Incidents and Operational Calendar | [TSK-H4-003] | [TSK-H4-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-COORD-007** — [spec.md](spec.md), § 15. Tasks, Alerts, Incidents and Operational Calendar | [TSK-H1-013], [TSK-H5-005] | [TSK-H1-014], [TSK-H5-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-COORD-008** — [spec.md](spec.md), § 15. Tasks, Alerts, Incidents and Operational Calendar | [TSK-H5-011], [TSK-H5-009] | [TSK-H5-012], [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-HA-001** — [spec.md](spec.md), § 16. Human Approval | [TSK-H0-011] | [TSK-H0-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-HA-002** — [spec.md](spec.md), § 16. Human Approval | [TSK-H0-011], [TSK-H5-007] | [TSK-H0-012], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-HA-003** — [spec.md](spec.md), § 16. Human Approval | [TSK-H0-011], [TSK-H5-007] | [TSK-H0-012], [TSK-H5-008], [TSK-H6-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-HA-004** — [spec.md](spec.md), § 16. Human Approval | [TSK-H0-011], [TSK-H5-007] | [TSK-H0-012], [TSK-H5-008], [TSK-H4-019] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-HA-005** — [spec.md](spec.md), § 16. Human Approval | [TSK-H0-011] | [TSK-H0-012], [TSK-H2-008], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-IDEMP-001** — [spec.md](spec.md), § 17. Idempotency and Duplicate Prevention | [TSK-H0-009] | [TSK-H0-010], [TSK-H2-010], [TSK-H3-006], [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-IDEMP-002** — [spec.md](spec.md), § 17. Idempotency and Duplicate Prevention | [TSK-H0-009], [TSK-H1-017], [TSK-H3-005], [TSK-H4-015], [TSK-H4-017], [TSK-H5-007], [TSK-H5-003] | [TSK-H0-010], [TSK-H1-018], [TSK-H2-010], [TSK-H4-019], [TSK-H5-008], [TSK-H5-004], [TSK-H6-015] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-IDEMP-003** — [spec.md](spec.md), § 17. Idempotency and Duplicate Prevention | [TSK-H1-003], [TSK-H3-003], [TSK-H5-009] | [TSK-H1-004], [TSK-H3-004], [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-IDEMP-004** — [spec.md](spec.md), § 17. Idempotency and Duplicate Prevention | [TSK-H5-009], [TSK-H5-007] | [TSK-H5-010], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CONC-001** — [spec.md](spec.md), § 18. Concurrency and Consistency | [TSK-H0-009] | [TSK-H0-010], [TSK-H2-004], [TSK-H4-012], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CONC-002** — [spec.md](spec.md), § 18. Concurrency and Consistency | [TSK-H0-009], [TSK-H2-009], [TSK-H3-005], [TSK-H0-011], [TSK-H5-015] | [TSK-H2-010], [TSK-H4-019], [TSK-H0-012], [TSK-H5-016], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CONC-003** — [spec.md](spec.md), § 18. Concurrency and Consistency | [TSK-H0-009] | [TSK-H0-010], [TSK-H2-010], [TSK-H3-006], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CONC-004** — [spec.md](spec.md), § 18. Concurrency and Consistency | [TSK-H0-009], [TSK-H1-015], [TSK-H5-009] | [TSK-H0-010], [TSK-H1-016], [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CONC-005** — [spec.md](spec.md), § 18. Concurrency and Consistency | [TSK-H5-007] | [TSK-H5-008], [TSK-H6-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CONC-006** — [spec.md](spec.md), § 18. Concurrency and Consistency | [TSK-H5-007], [TSK-H5-003] | [TSK-H5-008], [TSK-H5-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ERR-001** — [spec.md](spec.md), § 19. Errors, Revalidation and Uncertainty | [TSK-H0-003], [TSK-H5-017] | [TSK-H0-004], [TSK-H5-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ERR-002** — [spec.md](spec.md), § 19. Errors, Revalidation and Uncertainty | [TSK-H5-007], [TSK-H5-009] | [TSK-H5-008], [TSK-H5-010], [TSK-H6-006], [TSK-H6-015] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SEC-001** — [spec.md](spec.md), § 20. Security, Privacy and Authorization | [TSK-H0-005], [TSK-H0-007] | [TSK-H0-006], [TSK-H0-008], [TSK-H6-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SEC-002** — [spec.md](spec.md), § 20. Security, Privacy and Authorization | [TSK-H0-007] | [TSK-H0-008], [TSK-H0-006], [TSK-H6-008], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SEC-003** — [spec.md](spec.md), § 20. Security, Privacy and Authorization | [TSK-H2-003], [TSK-H5-011] | [TSK-H2-004], [TSK-H5-012], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SEC-004** — [spec.md](spec.md), § 20. Security, Privacy and Authorization | [TSK-H0-005], [TSK-H0-016] | [TSK-H0-006], [TSK-H0-017], [TSK-H6-008], [TSK-H6-009], [TSK-H6-010], [TSK-H6-011] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SEC-005** — [spec.md](spec.md), § 20. Security, Privacy and Authorization | [TSK-H0-003], [TSK-H0-005], [TSK-H0-007], [TSK-H1-015] | [TSK-H0-004], [TSK-H0-008], [TSK-H1-016], [TSK-H6-008], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SEC-006** — [spec.md](spec.md), § 20. Security, Privacy and Authorization | [TSK-H1-001], [TSK-H4-001], [TSK-H5-005], [TSK-H5-011] | [TSK-H1-002], [TSK-H4-002], [TSK-H5-006], [TSK-H5-012], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SEC-007** — [spec.md](spec.md), § 20. Security, Privacy and Authorization | [TSK-H3-013], [TSK-H3-009], [TSK-H5-011] | [TSK-H3-014], [TSK-H3-010], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-INT-001** — [spec.md](spec.md), § 22. Core Integration Boundaries | [TSK-H5-009], [TSK-H1-013] | [TSK-H5-010], [TSK-H1-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-INT-002** — [spec.md](spec.md), § 22. Core Integration Boundaries | [TSK-H5-009], [TSK-H0-007] | [TSK-H5-010], [TSK-H0-008], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-INT-003** — [spec.md](spec.md), § 22. Core Integration Boundaries | [TSK-H5-009], [TSK-H5-007] | [TSK-H5-010], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-INT-004** — [spec.md](spec.md), § 22. Core Integration Boundaries | [TSK-H1-013], [TSK-H5-005], [TSK-H5-009] | [TSK-H1-014], [TSK-H5-006], [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-INT-005** — [spec.md](spec.md), § 22. Core Integration Boundaries | [TSK-H5-009], [TSK-H5-011] | [TSK-H5-010], [TSK-H5-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-INT-006** — [spec.md](spec.md), § 22. Core Integration Boundaries | [TSK-H5-009] | [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |

### 6.2. Requisitos no funcionales (15 NFR) y aceptación (92 AC)

| Origen y localización | Desarrollo | Verificación | Alcance del contraste / resultado esperado |
|---|---|---|---|
| **AC-001** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H1-001], [TSK-H2-001], [TSK-H2-003] | [TSK-H1-002], [TSK-H2-002], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-002** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H1-001], [TSK-H2-007] | [TSK-H1-002], [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-003** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H1-003] | [TSK-H1-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-004** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-001] | [TSK-H2-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-005** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-001], [TSK-H2-005] | [TSK-H2-002], [TSK-H2-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-006** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-001] | [TSK-H2-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-007** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-003] | [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-008** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-005], [TSK-H2-007] | [TSK-H2-006], [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-009** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-007], [TSK-H1-013] | [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-010** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H1-007], [TSK-H2-003] | [TSK-H1-008], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-011** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-003], [TSK-H1-009] | [TSK-H2-004], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-012** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-007] | [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-013** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-003], [TSK-H2-007] | [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-014** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-009], [TSK-H2-007] | [TSK-H2-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-015** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-009], [TSK-H0-009] | [TSK-H2-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-016** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-007], [TSK-H2-009] | [TSK-H2-008], [TSK-H2-010], [TSK-H4-021] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-017** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H2-009], [TSK-H2-003] | [TSK-H2-011] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-018** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-019** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H2-009], [TSK-H4-001] | [TSK-H2-011], [TSK-H4-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-020** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-005], [TSK-H4-009] | [TSK-H4-006], [TSK-H4-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-021** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-007] | [TSK-H4-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-022** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-009], [TSK-H4-020] | [TSK-H4-010], [TSK-H4-021] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-023** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H3-001], [TSK-H3-005], [TSK-H4-020] | [TSK-H4-021] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-024** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-011], [TSK-H5-005], [TSK-H1-017] | [TSK-H4-012], [TSK-H5-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-025** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H3-001], [TSK-H3-003] | [TSK-H3-002], [TSK-H3-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-026** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H3-003], [TSK-H3-005] | [TSK-H3-004], [TSK-H3-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-027** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H3-005], [TSK-H4-015] | [TSK-H3-006], [TSK-H4-019] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-028** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H3-003], [TSK-H3-005] | [TSK-H3-004], [TSK-H3-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-029** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-030** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-031** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-011], [TSK-H4-022] | [TSK-H4-012], [TSK-H4-023] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-032** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-013] | [TSK-H4-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-033** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-013], [TSK-H1-011] | [TSK-H4-014], [TSK-H1-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-034** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-013] | [TSK-H4-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-035** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-015] | [TSK-H4-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-036** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-017] | [TSK-H4-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-037** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-013] | [TSK-H4-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-038** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H3-013], [TSK-H1-007] | [TSK-H3-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-039** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-013], [TSK-H1-011] | [TSK-H4-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-040** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H4-013], [TSK-H4-011], [TSK-H4-015], [TSK-H3-005] | [TSK-H4-014], [TSK-H4-016], [TSK-H4-019] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-041** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H1-011], [TSK-H3-001], [TSK-H4-013], [TSK-H5-001] | [TSK-H1-012], [TSK-H3-002], [TSK-H4-014], [TSK-H5-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-042** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H1-011], [TSK-H3-001], [TSK-H4-013] | [TSK-H1-012], [TSK-H3-002], [TSK-H4-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-043** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H1-011], [TSK-H4-011], [TSK-H5-001] | [TSK-H1-012], [TSK-H4-012], [TSK-H5-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-044** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H3-009], [TSK-H3-013], [TSK-H3-005], [TSK-H2-007] | [TSK-H3-010], [TSK-H3-014], [TSK-H3-006], [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-045** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H3-007], [TSK-H3-011] | [TSK-H3-008], [TSK-H3-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-046** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H3-009], [TSK-H3-007], [TSK-H3-011], [TSK-H5-015] | [TSK-H3-012], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-047** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H3-013], [TSK-H1-009] | [TSK-H3-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-048** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H3-013], [TSK-H4-009] | [TSK-H3-014], [TSK-H4-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-049** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H1-009], [TSK-H1-007], [TSK-H3-013] | [TSK-H1-010], [TSK-H3-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-050** — [spec.md](spec.md), § 24.3. Coordinación, supervisión y cierres | [TSK-H1-017], [TSK-H5-001] | [TSK-H1-018], [TSK-H5-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-051** — [spec.md](spec.md), § 24.3. Coordinación, supervisión y cierres | [TSK-H4-001] | [TSK-H4-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-052** — [spec.md](spec.md), § 24.3. Coordinación, supervisión y cierres | [TSK-H4-003] | [TSK-H4-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-053** — [spec.md](spec.md), § 24.3. Coordinación, supervisión y cierres | [TSK-H0-011] | [TSK-H0-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-054** — [spec.md](spec.md), § 24.3. Coordinación, supervisión y cierres | [TSK-H0-011], [TSK-H5-007] | [TSK-H0-012], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-055** — [spec.md](spec.md), § 24.3. Coordinación, supervisión y cierres | [TSK-H0-011], [TSK-H5-007] | [TSK-H0-012], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-056** — [spec.md](spec.md), § 24.3. Coordinación, supervisión y cierres | [TSK-H0-011], [TSK-H2-007], [TSK-H3-013] | [TSK-H0-012], [TSK-H2-008], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-057** — [spec.md](spec.md), § 24.3. Coordinación, supervisión y cierres | [TSK-H5-007], [TSK-H5-009], [TSK-H4-015] | [TSK-H5-008], [TSK-H5-010], [TSK-H4-016], [TSK-H6-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-058** — [spec.md](spec.md), § 24.3. Coordinación, supervisión y cierres | [TSK-H5-013], [TSK-H4-022] | [TSK-H5-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-059** — [spec.md](spec.md), § 24.3. Coordinación, supervisión y cierres | [TSK-H5-013], [TSK-H5-015] | [TSK-H5-014], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-060** — [spec.md](spec.md), § 24.3. Coordinación, supervisión y cierres | [TSK-H4-003], [TSK-H5-013], [TSK-H5-015] | [TSK-H4-004], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-061** — [spec.md](spec.md), § 24.3. Coordinación, supervisión y cierres | [TSK-H5-015] | [TSK-H5-016], [TSK-H6-007] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-062** — [spec.md](spec.md), § 24.3. Coordinación, supervisión y cierres | [TSK-H1-003], [TSK-H5-011], [TSK-H5-015] | [TSK-H1-004], [TSK-H5-012], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-063** — [spec.md](spec.md), § 24.3. Coordinación, supervisión y cierres | [TSK-H4-022], [TSK-H4-015], [TSK-H3-011] | [TSK-H4-023], [TSK-H4-016], [TSK-H3-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-064** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H0-005], [TSK-H0-007] | [TSK-H0-006], [TSK-H0-008], [TSK-H6-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-065** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H5-011], [TSK-H2-003] | [TSK-H5-012], [TSK-H2-004], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-066** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H5-009], [TSK-H0-009] | [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-067** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H0-009], [TSK-H2-003], [TSK-H2-007], [TSK-H4-011] | [TSK-H2-004], [TSK-H2-008], [TSK-H4-012], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-068** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H0-009], [TSK-H2-009], [TSK-H3-005] | [TSK-H0-010], [TSK-H2-010], [TSK-H3-006], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-069** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H5-007] | [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-070** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H5-007], [TSK-H5-003] | [TSK-H5-008], [TSK-H5-004], [TSK-H5-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-071** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H5-009] | [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-072** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H0-003], [TSK-H5-017] | [TSK-H0-004], [TSK-H5-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-073** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H6-014], [TSK-H0-009], [TSK-H1-015], [TSK-H5-007] | [TSK-H6-015] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-074** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H1-015] | [TSK-H1-016], [TSK-H6-015] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-075** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H2-007], [TSK-H1-013], [TSK-H5-011] | [TSK-H2-008], [TSK-H5-012], [TSK-H6-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-076** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H5-009], [TSK-H5-011], [TSK-H1-011] | [TSK-H5-010], [TSK-H5-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-077** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H5-009] | [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-078** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H3-013], [TSK-H3-009] | [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-079** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H0-001], [TSK-H0-002], [TSK-H0-007] | [TSK-H0-008], [TSK-H6-013], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-080** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H0-005], [TSK-H0-016] | [TSK-H0-006], [TSK-H6-008], [TSK-H6-009] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-081** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H0-009], [TSK-H5-017], [TSK-H5-011] | [TSK-H5-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-082** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H0-003], [TSK-H5-009], [TSK-H1-015], [TSK-H0-007] | [TSK-H0-004], [TSK-H5-010], [TSK-H1-016], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-083** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H5-001], [TSK-H5-003], [TSK-H5-007] | [TSK-H5-002], [TSK-H5-004], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-084** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-085** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H1-005], [TSK-H1-007], [TSK-H1-009], [TSK-H2-003], [TSK-H3-013] | [TSK-H1-006], [TSK-H1-008], [TSK-H2-004], [TSK-H3-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-086** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H2-005], [TSK-H2-007] | [TSK-H2-006], [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-087** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H1-013], [TSK-H5-005], [TSK-H2-005] | [TSK-H1-014], [TSK-H5-006], [TSK-H2-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-088** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H1-013], [TSK-H5-005] | [TSK-H5-006], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-089** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018], [TSK-H6-001] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-090** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H6-018] | [TSK-H6-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-091** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H4-022] | [TSK-H4-023] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-092** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H4-011], [TSK-H4-009] | [TSK-H4-012], [TSK-H4-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-001** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H0-009], [TSK-H1-013], [TSK-H5-011] | [TSK-H2-008], [TSK-H5-012], [TSK-H6-001], [TSK-H6-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-002** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H0-005], [TSK-H0-007], [TSK-H1-015] | [TSK-H0-008], [TSK-H6-008], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-003** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H1-001], [TSK-H4-001], [TSK-H5-005], [TSK-H5-011] | [TSK-H2-011], [TSK-H4-002], [TSK-H5-006], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-004** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H0-001], [TSK-H0-002], [TSK-H0-007] | [TSK-H0-008], [TSK-H6-013], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-005** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H6-014] | [TSK-H6-013], [TSK-H6-015], [TSK-H6-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-006** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H0-009], [TSK-H2-009], [TSK-H3-005], [TSK-H0-011], [TSK-H5-009] | [TSK-H2-010], [TSK-H4-019], [TSK-H0-012], [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-007** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H0-009], [TSK-H2-009], [TSK-H3-005], [TSK-H0-011], [TSK-H5-007], [TSK-H5-015] | [TSK-H6-016], [TSK-H2-010], [TSK-H4-019], [TSK-H5-008], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-008** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H0-009], [TSK-H1-015], [TSK-H4-011], [TSK-H5-009] | [TSK-H0-010], [TSK-H1-016], [TSK-H4-012], [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-009** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H0-009], [TSK-H1-013], [TSK-H5-017] | [TSK-H2-008], [TSK-H4-023], [TSK-H5-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-010** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H5-017], [TSK-H5-003] | [TSK-H5-018], [TSK-H5-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-011** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H5-009] | [TSK-H5-010], [TSK-H5-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-012** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H0-009], [TSK-H1-003], [TSK-H2-003], [TSK-H5-015] | [TSK-H1-004], [TSK-H2-004], [TSK-H5-016], [TSK-H6-013] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-013** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H1-009], [TSK-H1-011], [TSK-H3-013], [TSK-H4-013] | [TSK-H1-010], [TSK-H1-012], [TSK-H3-014], [TSK-H4-014], [TSK-H4-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-014** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H0-003], [TSK-H5-007], [TSK-H5-009], [TSK-H5-017] | [TSK-H0-004], [TSK-H5-008], [TSK-H5-010], [TSK-H5-018], [TSK-H6-015] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-015** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018], [TSK-H6-013] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |

### 6.3. Invariantes del dominio (52 DM-INV)

| Origen y localización | Desarrollo | Verificación | Alcance del contraste / resultado esperado |
|---|---|---|---|
| **DM-INV-001** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H0-003], [TSK-H1-001], [TSK-H2-003] | [TSK-H0-004], [TSK-H1-002], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-002** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-001] | [TSK-H1-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-003** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-001], [TSK-H1-003], [TSK-H2-007] | [TSK-H1-002], [TSK-H1-004], [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-004** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-001], [TSK-H2-007] | [TSK-H1-002], [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-005** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-001] | [TSK-H2-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-006** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-001], [TSK-H2-009], [TSK-H4-020] | [TSK-H2-002], [TSK-H2-010], [TSK-H4-021] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-007** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-001] | [TSK-H2-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-008** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-003] | [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-009** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-007] | [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-010** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-007] | [TSK-H2-008], [TSK-H3-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-011** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-005], [TSK-H2-007] | [TSK-H2-006], [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-012** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-009] | [TSK-H2-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-013** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-009], [TSK-H4-009] | [TSK-H2-011], [TSK-H4-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-014** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-009], [TSK-H4-011] | [TSK-H2-011], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-015** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-009], [TSK-H4-001] | [TSK-H2-011], [TSK-H4-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-016** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-009], [TSK-H4-011] | [TSK-H2-011], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-017** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-018** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-007], [TSK-H4-009] | [TSK-H1-008], [TSK-H4-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-019** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-020** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-005] | [TSK-H4-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-021** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-007] | [TSK-H4-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-022** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-009] | [TSK-H4-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-023** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-020] | [TSK-H4-021] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-024** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-007], [TSK-H2-003] | [TSK-H1-008], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-025** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-003], [TSK-H5-011] | [TSK-H2-004], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-026** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-009], [TSK-H2-003] | [TSK-H1-010], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-027** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H3-013] | [TSK-H3-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-028** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-005], [TSK-H1-007], [TSK-H2-003], [TSK-H3-013] | [TSK-H1-006], [TSK-H1-008], [TSK-H2-004], [TSK-H3-014], [TSK-H6-013] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-029** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-009], [TSK-H1-007] | [TSK-H1-010], [TSK-H3-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-030** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H3-003], [TSK-H3-005] | [TSK-H3-004], [TSK-H3-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-031** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H3-001], [TSK-H4-020] | [TSK-H3-002], [TSK-H4-021] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-032** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H3-009], [TSK-H3-005], [TSK-H3-011] | [TSK-H3-006], [TSK-H3-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-033** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H3-009] | [TSK-H3-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-034** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H3-007], [TSK-H3-009], [TSK-H3-011] | [TSK-H3-008], [TSK-H3-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-035** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H3-013] | [TSK-H3-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-036** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H3-013], [TSK-H4-009] | [TSK-H3-014], [TSK-H4-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-037** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-017] | [TSK-H4-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-038** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-011] | [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-039** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-013] | [TSK-H4-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-040** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-015] | [TSK-H4-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-041** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H5-013], [TSK-H5-015] | [TSK-H5-014], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-042** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-003], [TSK-H5-015] | [TSK-H4-004], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-043** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H4-001], [TSK-H1-013] | [TSK-H4-002], [TSK-H1-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-044** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-017], [TSK-H5-001], [TSK-H5-003] | [TSK-H1-018], [TSK-H5-002], [TSK-H5-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-045** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-013], [TSK-H5-005] | [TSK-H1-014], [TSK-H5-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-046** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H0-011], [TSK-H5-005], [TSK-H4-011] | [TSK-H0-012], [TSK-H5-006], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-047** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H0-009], [TSK-H1-013], [TSK-H5-017], [TSK-H5-011] | [TSK-H0-010], [TSK-H1-014], [TSK-H5-018], [TSK-H5-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-048** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H5-009], [TSK-H0-009] | [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-049** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H5-009], [TSK-H5-011] | [TSK-H5-010], [TSK-H5-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-050** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H0-005], [TSK-H0-007], [TSK-H5-011] | [TSK-H6-008], [TSK-H0-008], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-051** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-003], [TSK-H5-011] | [TSK-H1-004], [TSK-H5-012], [TSK-H6-013] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-052** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H3-009], [TSK-H3-013] | [TSK-H3-010], [TSK-H3-014], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |

### 6.4. Transiciones normativas (148)

| Origen y localización | Desarrollo | Verificación | Alcance del contraste / resultado esperado |
|---|---|---|---|
| **SM-RV-01** — [state-machines.md](../../docs/state-machines.md), § 2.3. Pendiente de revalidación | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-RV-01 · Sin revisión en ese alcance; evento «Cambio material, caducidad explícita, dato incierto o discrepancia» → Pendiente de revalidación para ese alcance. Efectos exigidos: Conservar último hecho confirmado; abrir revisión/tarea. Impedir comprometer el alcance dudoso usando evidencia anterior.. Negativo: retirar/incumplir cada guarda material «Identificar fuente, causa y dependencias afectadas; una noticia ambigua se registra como tal», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RV-02** — [state-machines.md](../../docs/state-machines.md), § 2.3. Pendiente de revalidación | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-RV-02 · Pendiente; evento «Ratificar lo anterior» → Revisión satisfecha en el alcance comprobado. Efectos exigidos: Añadir resultado/evidencia; mantener el hecho original. Otras partes pendientes siguen pendientes.. Negativo: retirar/incumplir cada guarda material «Nueva comprobación válida de todos los aspectos afectados; vigencia suficiente para la acción concreta», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RV-03** — [state-machines.md](../../docs/state-machines.md), § 2.3. Pendiente de revalidación | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-RV-03 · Pendiente; evento «Confirmar contenido material distinto» → Nuevo alcance acreditado; señal resuelta solo en lo cubierto. Efectos exigidos: Enlazar antes/después; nueva versión o confirmación según corresponda. No cambiar silenciosamente el acuerdo aceptado.. Negativo: retirar/incumplir cada guarda material «Evidencia nueva y proceso de modificación/versión y aprobación aplicables», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RV-04** — [state-machines.md](../../docs/state-machines.md), § 2.3. Pendiente de revalidación | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-RV-04 · Pendiente; evento «Revisión negativa o inconclusa» → Sigue pendiente para el compromiso no acreditado, o cambio rechazado. Efectos exigidos: No presentar como actual el hecho histórico que perdió cobertura. Si se descarta la petición, retirar su señal solo tras comprobar que el alcance anterior sigue siendo utilizable.. Negativo: retirar/incumplir cada guarda material «Registrar respuesta o falta de prueba y motivo», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-OP-01** — [state-machines.md](../../docs/state-machines.md), § 4. Opportunity / Commercial State | [TSK-H2-001] | [TSK-H2-002] | V-SM positivo: SM-OP-01 · Sin Opportunity; evento «Conversión de Lead o registro de Opportunity para reserva directa por el Administrador (D018)» → Nueva. Efectos exigidos: Crear proceso comercial y conservar origen, responsable y datos conocidos; Lead cuando exista, sin fabricar uno para el alta directa. Sin scoring ni aceptación implícita.. Negativo: retirar/incumplir cada guarda material «Método válido de contacto, necesidad/evento identificable y posibilidad comercial real; procedencia y actor», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-OP-02** — [state-machines.md](../../docs/state-machines.md), § 4. Opportunity / Commercial State | [TSK-H2-001] | [TSK-H2-002] | V-SM positivo: SM-OP-02 · Nueva; evento «Iniciar contacto comercial» → En contacto. Efectos exigidos: Conservar comunicaciones; intento de contacto no acredita respuesta.. Negativo: retirar/incumplir cada guarda material «Actuación/contacto registrado con canal, destinatario y resultado conocido», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-OP-03** — [state-machines.md](../../docs/state-machines.md), § 4. Opportunity / Commercial State | [TSK-H2-001] | [TSK-H2-002] | V-SM positivo: SM-OP-03 · Nueva / En contacto; evento «Concretar necesidad» → Necesidad definida. Efectos exigidos: No exigir fecha, personas, servicios o presupuesto finales si aún no son materiales.. Negativo: retirar/incumplir cada guarda material «Necesidad trabajada y alcance comercial identificable; fuente y pendientes visibles», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-OP-04** — [state-machines.md](../../docs/state-machines.md), § 4. Opportunity / Commercial State | [TSK-H2-001], [TSK-H2-003] | [TSK-H2-002], [TSK-H2-004] | V-SM positivo: SM-OP-04 · Nueva / En contacto / Necesidad definida / Propuesta enviada / Negociación / cambios; evento «Preparar propuesta o revisión» → Propuesta en preparación. Efectos exigidos: Trabajar Proposal; conservar envíos/versiones anteriores.. Negativo: retirar/incumplir cada guarda material «Opportunity válida y alcance suficiente para preparar; vincular alternativa y pendientes», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-OP-05** — [state-machines.md](../../docs/state-machines.md), § 4. Opportunity / Commercial State | [TSK-H2-001], [TSK-H2-005] | [TSK-H2-002], [TSK-H2-006] | V-SM positivo: SM-OP-05 · Activa; evento «Registrar envío de propuesta exacta» → Propuesta enviada. Efectos exigidos: Vincular Communication y versión enviada; no aceptación. Puede omitir etapas de preparación no registradas, sin inventarlas.. Negativo: retirar/incumplir cada guarda material «Versión fijada, guardas de §5 y evidencia real del envío», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-OP-06** — [state-machines.md](../../docs/state-machines.md), § 4. Opportunity / Commercial State | [TSK-H2-001] | [TSK-H2-002] | V-SM positivo: SM-OP-06 · Propuesta enviada / Propuesta en preparación / Necesidad definida; evento «Cliente plantea negociación/cambios» → Negociación / cambios. Efectos exigidos: Evaluar alternativas/versiones; petición no modifica lo ofrecido ni confirma proveedor.. Negativo: retirar/incumplir cada guarda material «Petición o intercambio identificable y alcance afectado», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-OP-07** — [state-machines.md](../../docs/state-machines.md), § 4. Opportunity / Commercial State | [TSK-H2-007] | [TSK-H2-008] | V-SM positivo: SM-OP-07 · Activa; evento «Verificar aceptación comercial» → Aceptada / Ganada. Efectos exigidos: Acreditar acuerdo únicamente sobre el alcance aceptado y habilitar SM-BK-01; no contratar partes no seleccionadas ni crear/confirmar Booking por el mero estado.. Negativo: retirar/incumplir cada guarda material «Acceptance válida según §§5/14 y D018, versión y alcance exactos, vigencia/revalidación resuelta para ese acto», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-OP-08** — [state-machines.md](../../docs/state-machines.md), § 4. Opportunity / Commercial State | [TSK-H2-001] | [TSK-H2-002] | V-SM positivo: SM-OP-08 · Activa / En pausa; evento «Declarar pérdida» → Perdida. Efectos exigidos: Conservar causa y alternativas; rechazar una alternativa no pierde necesariamente toda la Opportunity.. Negativo: retirar/incumplir cada guarda material «Motivo obligatorio y comunicaciones/contexto; usar «desconocido» si no se conoce», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-OP-09** — [state-machines.md](../../docs/state-machines.md), § 4. Opportunity / Commercial State | [TSK-H2-001] | [TSK-H2-002] | V-SM positivo: SM-OP-09 · Activa; evento «Pausar venta» → En pausa. Efectos exigidos: Conservar estado previo; vigencias externas continúan sujetas a sus límites.. Negativo: retirar/incumplir cada guarda material «Decisión de pausa, motivo y contexto de seguimiento», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-OP-10** — [state-machines.md](../../docs/state-machines.md), § 4. Opportunity / Commercial State | [TSK-H2-001] | [TSK-H2-002] | V-SM positivo: SM-OP-10 · Perdida / En pausa; evento «Reactivar» → En contacto / Necesidad definida / Propuesta en preparación. Efectos exigidos: Elegir destino sustentado en datos actuales; conservar pérdida/pausa previa y revalidar precios/disponibilidad necesarios. No saltar directamente a Ganada por una aceptación antigua.. Negativo: retirar/incumplir cada guarda material «Nuevo interés o decisión de seguimiento documentada; revisar situación comercial actual», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-OP-11** — [state-machines.md](../../docs/state-machines.md), § 4. Opportunity / Commercial State | [TSK-H2-001] | [TSK-H2-002] | V-SM positivo: SM-OP-11 · Activa; evento «Revisar necesidad anterior» → En contacto / Necesidad definida. Efectos exigidos: Retroceso trazable; no retirar envíos, rechazos o versiones históricas.. Negativo: retirar/incumplir cada guarda material «Cambio de necesidad documentado y evaluación humana del progreso actual», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-01** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-003] | [TSK-H2-004] | V-SM positivo: SM-PV-01 · Proposal sin preparación / con versiones; evento «Preparar alternativa/revisión» → Preparación editable. Efectos exigidos: Crear contenido de trabajo sin editar versiones fijadas.. Negativo: retirar/incumplir cada guarda material «Opportunity y alcance conocidos; fuentes y pendientes», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-02** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-003] | [TSK-H2-004] | V-SM positivo: SM-PV-02 · Preparación editable; evento «Fijar edición» → Nueva Proposal Version fijada. Efectos exigidos: Conservar snapshot exacto e identidad/versionado. Fijar no acredita verificación ni envío.. Negativo: retirar/incumplir cada guarda material «Alcance, composición, cantidades por servicio/noche, fuentes y condiciones reproducibles; distinguir estimaciones autorizadas», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-03** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-005] | [TSK-H2-006] | V-SM positivo: SM-PV-03 · Versión fijada; evento «Enviar propuesta» → Hecho Enviada de esa versión. Efectos exigidos: Evidencia de envío/destinatario; presentación comercial respeta BR-PACK-003 y economía reservada.. Negativo: retirar/incumplir cada guarda material «Datos materiales del compromiso verificados; coste final relevante confirmado si afecta al precio definitivo; vigencia utilizable o revisión previa; G3 si sensible IA», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-04** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-005] | [TSK-H2-006] | V-SM positivo: SM-PV-04 · Alcance ofrecido vigente, aún no aceptado; evento «Alcanzar vencimiento efectivo o detectar incertidumbre material» → Caducada y/o Pendiente de revalidación. Efectos exigidos: Impedir aceptación sin revisión; no registrar rechazo.. Negativo: retirar/incumplir cada guarda material «Fecha realmente aplicada o evidencia de la incertidumbre; alcance», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-05** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-005] | [TSK-H2-006] | V-SM positivo: SM-PV-05 · Pendiente de revalidación; evento «Ratificar contenido para aceptación concreta» → Revalidación acreditada para el acto revisado. Efectos exigidos: Conservar emisión/vencimiento originales. No «extender» silenciosamente la versión. Si cambia el contenido, incluida una nueva vigencia ofrecida como condición, usar SM-PV-06.. Negativo: retirar/incumplir cada guarda material «Nueva evidencia de precios, disponibilidad, condiciones/capacidad materiales; revisión y momento aplicables», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-06** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-003] | [TSK-H2-004] | V-SM positivo: SM-PV-06 · Cualquier versión fijada; evento «Ofrecer cambio material» → Nueva preparación → nueva versión fijada. Efectos exigidos: Relacionar sustitución cuando corresponda; conservar versiones, alternativas y términos anteriores.. Negativo: retirar/incumplir cada guarda material «Antes/después y motivo; datos materiales revisados», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-07** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-007] | [TSK-H2-008] | V-SM positivo: SM-PV-07 · Versión fijada sin aceptación válida ya registrada del mismo hecho; evento «Registrar/verificar aceptación total o selección parcial válida» → Hecho Aceptada en el alcance acreditado. Efectos exigidos: Acceptance inmutable y términos exactos; permite SM-OP-07. No incluye partes no seleccionadas ni exige envío digital si otro canal acredita presentación y aceptación del contenido exacto.. Negativo: retirar/incumplir cada guarda material «Aceptante facultado, versión/términos y alcance exactos según §5.1 y D018; canal/momento/evidencia inequívocos; vigente en el momento del acto o revalidación previa acreditada», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-08** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-005] | [TSK-H2-006] | V-SM positivo: SM-PV-08 · Alcance no aceptado de versión fijada; evento «Registrar rechazo» → Hecho Rechazada en ese alcance. Efectos exigidos: Mantener alternativas y partes aceptadas. No seleccionar una parte no prueba rechazo. Nueva negociación conserva el rechazo y revalida antes de nuevo compromiso.. Negativo: retirar/incumplir cada guarda material «Respuesta atribuible, versión/alternativa y alcance afectados, motivo conocido», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-AC-01** — [state-machines.md](../../docs/state-machines.md), § 14.2. Acceptance: hecho inmutable | [TSK-H2-007] | [TSK-H2-008] | V-SM positivo: SM-AC-01 · Evidencia candidata; evento «Registrar hecho de aceptación identificado» → Acceptance registrada inmutable; verificación explícita. Efectos exigidos: Si falta identificación material o la selección exige nueva versión aún no fijada, conservar petición/candidato en revisión. Registrada no autoriza Ganada hasta SM-AC-02; no corregir luego el alcance editando Acceptance.. Negativo: retirar/incumplir cada guarda material «Versión exacta de Proposal y términos, aceptante y facultad/contexto, canal y momento; alcance total o parte/modalidad/alcance expresamente seleccionable identificado exactamente (§5.1; D018); registrador si manual», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-AC-02** — [state-machines.md](../../docs/state-machines.md), § 14.2. Acceptance: hecho inmutable | [TSK-H2-007] | [TSK-H2-008] | V-SM positivo: SM-AC-02 · Acceptance registrada; evento «Verificar suficiencia total o parcial» → Verificación válida vinculada al hecho y alcance exactos. Efectos exigidos: Puede registrarse junto a SM-AC-01 si todas las guardas están comprobadas. Habilita evaluación comercial y SM-BK-01 por vía normal o directa con la misma cadena/evidencia; no presume aceptación del resto ni sustituye al cliente por el Administrador.. Negativo: retirar/incumplir cada guarda material «Evidencia inequívoca y atribuible; versión/términos y vigencia en el acto o revalidación previa; selección parcial solo si estaba expresamente prevista en esa versión y queda exactamente identificada; nueva versión previa a Acceptance si la parte no era independiente/seleccionable (§5.1; D018)», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-AC-03** — [state-machines.md](../../docs/state-machines.md), § 14.2. Acceptance: hecho inmutable | [TSK-H2-007] | [TSK-H2-008] | V-SM positivo: SM-AC-03 · Acceptance registrada/verificada; evento «Acreditar error de registro/atribución» → Rectificación o anulación por error enlazada. Efectos exigidos: Conservar original y verificación previa; reevaluar efectos dependientes de forma explícita, sin fingir cancelación de proveedor ni reversión bancaria.. Negativo: retirar/incumplir cada guarda material «Revisión humana, evidencia del error y motivo; identificar efectos dependientes», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BK-01** — [state-machines.md](../../docs/state-machines.md), § 6. Booking Operational State | [TSK-H2-009] | [TSK-H2-010] | V-SM positivo: SM-BK-01 · Sin Booking para esa Opportunity aceptada; evento «Convertir venta aceptada por vía normal o reserva directa del Administrador (D018; §6.1)» → Pendiente de preparación. Efectos exigidos: Crear una Booking para esa Opportunity y únicamente el alcance aceptado, conservando modalidades, servicios/noches/cantidades y su certeza real. No duplicar Booking por repetir el alta, la evidencia o por coexistir modalidades.. Negativo: retirar/incumplir cada guarda material «Opportunity, Proposal/Proposal Version y condiciones exactas, Acceptance verificada y alcance total o parcial seleccionable según §5.1; cadena comercial completa con evidencia real; G3 para creación IA», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BK-02** — [state-machines.md](../../docs/state-machines.md), § 6. Booking Operational State | [TSK-H4-020] | [TSK-H4-021] | V-SM positivo: SM-BK-02 · Pendiente de preparación; evento «Iniciar coordinación» → En confirmación con proveedores. Efectos exigidos: Abrir trabajo de confirmación; el nombre base también admite coordinación de servicios internos sin inventar proveedor externo.. Negativo: retirar/incumplir cada guarda material «Servicios/dependencias identificados y actuaciones de preparación/confirmación registradas», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BK-03** — [state-machines.md](../../docs/state-machines.md), § 6. Booking Operational State | [TSK-H4-020] | [TSK-H4-021] | V-SM positivo: SM-BK-03 · Pendiente / En confirmación; evento «Evaluar cobertura parcial» → Parcialmente confirmada. Efectos exigidos: Identificar lo cubierto y lo pendiente, incluidas condiciones económicas; no prometer confirmación completa.. Negativo: retirar/incumplir cada guarda material «Algún alcance de servicio confirmado válidamente; aún no se cumple toda la guarda de confirmación de Booking», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BK-04** — [state-machines.md](../../docs/state-machines.md), § 6. Booking Operational State | [TSK-H4-020] | [TSK-H4-021] | V-SM positivo: SM-BK-04 · Cualquier fase de preparación anterior a En curso; evento «Evaluar confirmación completa» → Confirmada operativamente. Efectos exigidos: Registrar fecha de referencia, política, resultado y evidencia; no cambia Opportunity, no concilia movimientos ni confirma servicios por arrastre. Dentro de menos de 7 días exige 100 % antes de confirmar salvo excepción autorizada.. Negativo: retirar/incumplir cada guarda material «Guarda conjunta anterior; exigencia económica evaluada por días naturales conforme a SM-EP-01 y §2.4/D020, por defecto desde la fecha del primer servicio contratado; revisiones materiales resueltas y requisitos imprescindibles satisfechos; G3», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BK-05** — [state-machines.md](../../docs/state-machines.md), § 6. Booking Operational State | [TSK-H4-020] | [TSK-H4-021] | V-SM positivo: SM-BK-05 · Confirmada operativamente / Parcialmente confirmada, antes de iniciar; evento «Cambio/discrepancia invalida cobertura actual» → Parcialmente confirmada si queda cobertura válida; En confirmación si no. Efectos exigidos: Reevaluar preparación actual y señalar alcance pendiente; no cancelar compromisos externos por esta reevaluación.. Negativo: retirar/incumplir cada guarda material «Revisión material documentada de servicios/economía; conservar confirmación histórica», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BK-06** — [state-machines.md](../../docs/state-machines.md), § 6. Booking Operational State | [TSK-H4-022] | [TSK-H4-023] | V-SM positivo: SM-BK-06 · Confirmada operativamente; evento «Inicio real de prestación» → En curso. Efectos exigidos: Registrar progreso real; fecha prevista por sí sola no inicia.. Negativo: retirar/incumplir cada guarda material «Hecho de inicio, alcance, momento y evidencia del responsable/fuente pertinente», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BK-07** — [state-machines.md](../../docs/state-machines.md), § 6. Booking Operational State | [TSK-H4-022] | [TSK-H4-023] | V-SM positivo: SM-BK-07 · Fase de preparación sin confirmación completa; evento «Conocer un inicio real excepcional» → En curso + Incidencia cuando corresponda. Efectos exigidos: Registrar lo ocurrido sin fingir confirmación previa ni autorizar ejecución insegura; mantener pendientes y responsables.. Negativo: retirar/incumplir cada guarda material «Evidencia de ejecución sobrevenida y revisión humana de pendientes/incumplimientos», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BK-08** — [state-machines.md](../../docs/state-machines.md), § 6. Booking Operational State | [TSK-H4-022] | [TSK-H4-023] | V-SM positivo: SM-BK-08 · En curso; evento «Constatar finalización de la prestación» → Finalizada. Efectos exigidos: Conservar incidencias y evaluar Operational Closure por separado. Una fecha de fin no prueba ejecución.. Negativo: retirar/incumplir cada guarda material «Alcance efectivamente ejecutado documentado y restantes partes ejecutadas/canceladas con evidencia; al menos una parte prestada», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BK-09** — [state-machines.md](../../docs/state-machines.md), § 6. Booking Operational State | [TSK-H4-011], [TSK-H4-022] | [TSK-H4-012], [TSK-H4-023] | V-SM positivo: SM-BK-09 · Fases previas / En curso; evento «Aplicar cancelación del alcance total» → Cancelada solo si no queda prestación ejecutada/activa incompatible con esa etiqueta. Efectos exigidos: Si hubo ejecución parcial, conservarla y seguir curso/finalización del conjunto con cancelación parcial; no ejecutar Refund por inferencia.. Negativo: retirar/incumplir cada guarda material «Booking Modification aprobada/aplicada y evidencia de cancelación de todo el alcance; no ocultar partes ejecutadas», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BK-10** — [state-machines.md](../../docs/state-machines.md), § 6. Booking Operational State | [TSK-H4-022], [TSK-H4-003] | [TSK-H4-023], [TSK-H4-004] | V-SM positivo: SM-BK-10 · Cualquier fase; evento «Abrir/gestionar incidencia con impacto operativo» → Misma fase + Incidencia. Efectos exigidos: Conservar progreso previo y partes independientes; bloqueos según necesidad material y §15.. Negativo: retirar/incumplir cada guarda material «Incident y alcance/efecto identificados, gravedad separada», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BK-11** — [state-machines.md](../../docs/state-machines.md), § 6. Booking Operational State | [TSK-H4-022], [TSK-H4-003] | [TSK-H4-023], [TSK-H4-004] | V-SM positivo: SM-BK-11 · Fase + Incidencia; evento «Verificar resolución del impacto» → Fase reevaluada, sin esa condición si procede. Efectos exigidos: No restituir confirmaciones que hayan perdido cobertura ni cerrar economía automáticamente.. Negativo: retirar/incumplir cada guarda material «Evidencia de solución y revisión de todas las incidencias que sostienen la condición», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-01** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H2-009] | [TSK-H2-010], [TSK-H2-011] | V-SM positivo: SM-BS-01 · Sin prestación; evento «Incorporar alcance a Booking» → Pendiente. Efectos exigidos: Mantener proveedor solo si externo, configuración/versiones y datos pendientes. No copiar un total global por defecto.. Negativo: retirar/incumplir cada guarda material «Procedencia aceptada/conversión o modificación válida; servicio, cantidades/unidades y noches propias», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-02** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H4-005] | [TSK-H4-006] | V-SM positivo: SM-BS-02 · Pendiente; evento «Consultar disponibilidad» → Disponibilidad consultada. Efectos exigidos: Vincular Availability Evidence; ausencia de respuesta no acredita capacidad.. Negativo: retirar/incumplir cada guarda material «Petición con fuente, momento y alcance; registrar respuesta si existe», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-03** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H4-007] | [TSK-H4-008] | V-SM positivo: SM-BS-03 · Pendiente / Disponibilidad consultada / Modificado; evento «Registrar opción» → Opcionado / bloqueado. Efectos exigidos: Vincular opción; no confirmación final. Sin vencimiento, señal/tarea de revalidación, sin fecha ficticia.. Negativo: retirar/incumplir cada guarda material «Capacity Hold acreditado para el alcance, condiciones y situación conocidas», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-04** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H4-009] | [TSK-H4-010] | V-SM positivo: SM-BS-04 · Pendiente / Disponibilidad consultada / Opcionado / Modificado; evento «Verificar confirmación» → Confirmado. Efectos exigidos: Registrar cobertura exacta. Se permite Pendiente → Confirmado con evidencia completa, sin simular una consulta/opción anterior.. Negativo: retirar/incumplir cada guarda material «Provider Confirmation válida para alcance externo, o confirmación interna documentada; fecha/hora, proveedor, cantidad, capacidad, precio/condiciones materiales cubiertos y requisitos imprescindibles pertinentes; G3», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-05** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-BS-05 · Cualquier estado; evento «Cambio solicitado o dato material discrepante» → Mismo estado + Pendiente de revalidación en lo afectado. Efectos exigidos: Revisar únicamente fecha, hora, cantidad, proveedor, precio, capacidad, condiciones y dependencias materiales afectadas; no aplicar todavía el cambio.. Negativo: retirar/incumplir cada guarda material «Fuente, causa y alcance identificados; distinguir petición de hecho aceptado», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-06** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-BS-06 · Estado no terminal; evento «Aplicar modificación válida» → Modificado. Efectos exigidos: Conservar alcance previo confirmado y nuevo aplicado. Si este aún requiere confirmación, señal pendiente; si ya existe evidencia completa, evaluar separadamente SM-BS-04.. Negativo: retirar/incumplir cada guarda material «Booking Modification aprobada; acuerdo comercial/evidencias operativas necesarios para cada efecto; antes/después», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-07** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H4-022] | [TSK-H4-023] | V-SM positivo: SM-BS-07 · Confirmado, con ejecución parcial o aún sin iniciar; evento «Constatar prestación completa del alcance efectivo» → Ejecutado para el alcance efectivo prestado. Efectos exigidos: Conservar resultados, partes canceladas e incidencias. Si queda parte por prestar o cancelar, registrar parte/resto sin declarar todo Ejecutado.. Negativo: retirar/incumplir cada guarda material «Evidencia del hecho ejecutado, momento, alcance/personas/noches pertinente y cancelación acreditada de partes excluidas cuando corresponda», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-08** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H4-022] | [TSK-H4-023] | V-SM positivo: SM-BS-08 · Estado previo sin confirmación acreditada / Modificado; evento «Conocer ejecución real sobrevenida» → Ejecutado si completa; conservar progreso parcial si no, con Incidencia cuando proceda. Efectos exigidos: No fabricar confirmación previa ni legitimar restricciones incumplidas.. Negativo: retirar/incumplir cada guarda material «Evidencia verificada de realización y revisión humana de la falta de confirmación o discrepancia», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-09** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H4-011], [TSK-H4-022] | [TSK-H4-012], [TSK-H4-023] | V-SM positivo: SM-BS-09 · Estado previo no ejecutado ni cancelado; evento «Aplicar cancelación» → Cancelado si cubre toda la prestación. Efectos exigidos: Cancelación parcial deja prestación restante en su situación y conserva el detalle cancelado; no borra noches/participantes/historia ni paga devolución.. Negativo: retirar/incumplir cada guarda material «Modificación aplicable y evidencia inequívoca del proveedor externo o responsable interno sobre alcance cancelado; G3», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-10** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H4-011] | [TSK-H4-012] | V-SM positivo: SM-BS-10 · Estado + revisión; evento «Ratificar alcance o resolver cambio» → Estado sustentado en los hechos, señal resuelta solo allí. Efectos exigidos: Una revisión de horario no ratifica precio/capacidad no comprobados. Una respuesta negativa no restaura una confirmación inválida.. Negativo: retirar/incumplir cada guarda material «SM-RV-02/03/04, cobertura completa en la parte revisada», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-BS-11** — [state-machines.md](../../docs/state-machines.md), § 7. Booking Service State | [TSK-H4-003], [TSK-H4-022] | [TSK-H4-004], [TSK-H4-023] | V-SM positivo: SM-BS-11 · Cualquier estado; evento «Abrir/resolver impacto de Incident» → Misma fase + Incidencia, o retirada de condición pertinente. Efectos exigidos: La fase de prestación y Incident conservan ciclos distintos.. Negativo: retirar/incumplir cada guarda material «Evidencia de incidencia o solución y reevaluación de cobertura vigente», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-AV-01** — [state-machines.md](../../docs/state-machines.md), § 8.1. Availability Evidence | [TSK-H4-005] | [TSK-H4-006] | V-SM positivo: SM-AV-01 · Sin consulta registrada; evento «Consultar fuente» → Consulta registrada; respuesta pendiente si no existe. Efectos exigidos: No acreditar disponibilidad.. Negativo: retirar/incumplir cada guarda material «Servicio, fechas, cantidad/unidad, fuente y momento identificables», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-AV-02** — [state-machines.md](../../docs/state-machines.md), § 8.1. Availability Evidence | [TSK-H4-005] | [TSK-H4-006] | V-SM positivo: SM-AV-02 · Consulta o nueva comunicación espontánea; evento «Recibir respuesta» → Disponibilidad comunicada, negativa o incierta según contenido. Efectos exigidos: Conservar respuesta real, también si no hay consulta previa registrada.. Negativo: retirar/incumplir cada guarda material «Original/registro y alcance de lo manifestado», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-AV-03** — [state-machines.md](../../docs/state-machines.md), § 8.1. Availability Evidence | [TSK-H4-005] | [TSK-H4-006] | V-SM positivo: SM-AV-03 · Información comunicada; evento «Verificar disponibilidad» → Disponibilidad confirmada en ese alcance. Efectos exigidos: No confirmar Booking Service salvo evidencia adicional de aceptación operativa.. Negativo: retirar/incumplir cada guarda material «Fuente autorizada y evidencia inequívoca para el alcance material requerido», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-AV-04** — [state-machines.md](../../docs/state-machines.md), § 8.1. Availability Evidence | [TSK-H4-005] | [TSK-H4-006] | V-SM positivo: SM-AV-04 · Evidencia existente; evento «Vencimiento, cambio o discrepancia» → Pendiente de revalidación. Efectos exigidos: Aplicar §2.3; conservar evidencia anterior y más reciente verificada sin editar acuerdos aceptados.. Negativo: retirar/incumplir cada guarda material «Límite explícito o motivo de incertidumbre», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-HO-01** — [state-machines.md](../../docs/state-machines.md), § 8.2. Capacity Hold / Option | [TSK-H4-007] | [TSK-H4-008] | V-SM positivo: SM-HO-01 · Sin opción; evento «Registrar bloqueo concedido» → Creado. Efectos exigidos: Mantener identidad incluso antes de Booking y relacionar alcance propuesto.. Negativo: retirar/incumplir cada guarda material «Evidencia del proveedor, servicio/fechas/capacidad, creación y condiciones; vencimiento solo si informado», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-HO-02** — [state-machines.md](../../docs/state-machines.md), § 8.2. Capacity Hold / Option | [TSK-H4-007] | [TSK-H4-008] | V-SM positivo: SM-HO-02 · Creado / No verificado; evento «Comprobar vigencia para una acción» → Vigente para alcance comprobado. Efectos exigidos: Sin vencimiento explícito conservar revalidación necesaria para posteriores compromisos; no asumir vigencia indefinida.. Negativo: retirar/incumplir cada guarda material «Fuente actual verificable y condiciones cumplidas; no vencimiento superado», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-HO-03** — [state-machines.md](../../docs/state-machines.md), § 8.2. Capacity Hold / Option | [TSK-H4-007] | [TSK-H4-008] | V-SM positivo: SM-HO-03 · Vigente; evento «Acercarse a vencimiento conocido» → Vigente + Próximo a vencer. Efectos exigidos: Aviso/tarea conceptual; no extensión, confirmación ni liberación.. Negativo: retirar/incumplir cada guarda material «Fecha explícita y adelanto configurado», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-HO-04** — [state-machines.md](../../docs/state-machines.md), § 8.2. Capacity Hold / Option | [TSK-H4-007] | [TSK-H4-008] | V-SM positivo: SM-HO-04 · Creado / Vigente; evento «Vencer explícitamente o perder certeza» → Vencido / No verificado, según el hecho. Efectos exigidos: Revisar propuestas y servicios dependientes; no dar capacidad por liberada.. Negativo: retirar/incumplir cada guarda material «Evidencia/fecha real o causa de incertidumbre», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-HO-05** — [state-machines.md](../../docs/state-machines.md), § 8.2. Capacity Hold / Option | [TSK-H4-007] | [TSK-H4-008] | V-SM positivo: SM-HO-05 · Creado / Vigente / Vencido / No verificado; evento «Solicitar liberación» → Liberación solicitada. Efectos exigidos: Conservar última vigencia conocida; petición preparada/aprobada sin envío no llega aquí.. Negativo: retirar/incumplir cada guarda material «Decisión y alcance identificados; evidencia de petición efectivamente enviada; G3 si sensible IA», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-HO-06** — [state-machines.md](../../docs/state-machines.md), § 8.2. Capacity Hold / Option | [TSK-H4-007] | [TSK-H4-008] | V-SM positivo: SM-HO-06 · Cualquier situación sin liberación acreditada; evento «Verificar liberación/cancelación» → Liberado/cancelado en lo acreditado. Efectos exigidos: Conservar petición si hubo, momento real y registro. Parcial deja visible capacidad/fechas restantes.. Negativo: retirar/incumplir cada guarda material «Evidencia inequívoca del proveedor para el alcance exacto, incluso espontánea», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-HO-07** — [state-machines.md](../../docs/state-machines.md), § 8.2. Capacity Hold / Option | [TSK-H4-007] | [TSK-H4-008] | V-SM positivo: SM-HO-07 · Vencido / No verificado / Vigente; evento «Acreditar prórroga/cambio del bloqueo» → Vigencia reevaluada con historial. Efectos exigidos: No inventar prórroga ni sobrescribir término anterior; si el proveedor identifica otro compromiso, conservar vínculo de sustitución.. Negativo: retirar/incumplir cada guarda material «Respuesta verificada y condiciones/fechas nuevas expresas», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PC-01** — [state-machines.md](../../docs/state-machines.md), § 8.3. Provider Confirmation | [TSK-H4-009] | [TSK-H4-010] | V-SM positivo: SM-PC-01 · Sin hecho confirmado; evento «Verificar respuesta inequívoca» → Provider Confirmation registrada válida. Efectos exigidos: Puede fundamentar SM-BS-04 únicamente en su cobertura.. Negativo: retirar/incumplir cada guarda material «Proveedor/persona, servicio, fecha/hora/cantidad/condiciones materiales y canal autorizado; llamada con registrador/momento si aplica», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PC-02** — [state-machines.md](../../docs/state-machines.md), § 8.3. Provider Confirmation | [TSK-H4-009] | [TSK-H4-010] | V-SM positivo: SM-PC-02 · Confirmación existente; evento «Detectar cambio o error» → Revisión pendiente de cobertura o rectificación enlazada. Efectos exigidos: Conservar hecho anterior; ningún mensaje amplía su alcance.. Negativo: retirar/incumplir cada guarda material «Nueva fuente, causa y alcance afectado», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PC-03** — [state-machines.md](../../docs/state-machines.md), § 8.3. Provider Confirmation | [TSK-H4-009] | [TSK-H4-010] | V-SM positivo: SM-PC-03 · Revisión pendiente; evento «Verificar nuevo compromiso/corrección» → Nuevo hecho o rectificación, con relación al original. Efectos exigidos: Revalidar solo partes cubiertas; no reescribir aceptación del cliente.. Negativo: retirar/incumplir cada guarda material «Evidencia nueva y autorizaciones aplicables», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-EP-01** — [state-machines.md](../../docs/state-machines.md), § 9.1. Expected Payment / Payment Due | [TSK-H3-001] | [TSK-H3-002] | V-SM positivo: SM-EP-01 · Sin vencimiento; evento «Determinar cobro aplicable» → Esperado; cobertura pendiente. Efectos exigidos: Incorporar a Payment Schedule con fecha de referencia y día límite. El saldo a 7 días puede satisfacerse durante todo ese día; no crear Customer Payment ni disponer de fondos.. Negativo: retirar/incumplir cada guarda material «Acuerdo, Payment Policy Version y alcance identificados; base/importe; por defecto, fecha del primer servicio contratado de la Booking como referencia, o referencia contractual distinta válida; cálculo por días naturales según §2.4/D020», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-EP-02** — [state-machines.md](../../docs/state-machines.md), § 9.1. Expected Payment / Payment Due | [TSK-H3-005] | [TSK-H3-006] | V-SM positivo: SM-EP-02 · Esperado con cualquier cobertura; evento «Validar asignación/conciliación» → Cobertura reevaluada: pendiente/parcial/cubierta. Efectos exigidos: Conservar pagos y asignaciones independientes; solo cobertura válida satisface obligación.. Negativo: retirar/incumplir cada guarda material «Movimiento real y porción comprobada, destino inequívoco, sin doble cómputo», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-EP-03** — [state-machines.md](../../docs/state-machines.md), § 9.1. Expected Payment / Payment Due | [TSK-H3-001], [TSK-H5-001] | [TSK-H3-002], [TSK-H5-002] | V-SM positivo: SM-EP-03 · Esperado con saldo debido; evento «Superar el día límite completo» → Condición Vencida. Efectos exigidos: Tarea/alerta pertinente desde el día natural siguiente; conservar cálculo. No cargo, cancelación o conciliación automática.. Negativo: retirar/incumplir cada guarda material «Fecha local de referencia, política y saldo verificados; el día límite aplicable ha finalizado según calendario local, sin corte por la hora del servicio; para el saldo general, ha finalizado el día situado 7 días antes», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-EP-04** — [state-machines.md](../../docs/state-machines.md), § 9.1. Expected Payment / Payment Due | [TSK-H3-001], [TSK-H4-013], [TSK-H4-015] | [TSK-H3-002], [TSK-H4-014], [TSK-H4-016] | V-SM positivo: SM-EP-04 · Obligación existente; evento «Aplicar modificación, devolución o corrección» → Obligación y cobertura ajustadas con historial. Efectos exigidos: No borrar importe anterior; devolver dinero no genera automáticamente nueva deuda si la política resolvió esa obligación.. Negativo: retirar/incumplir cada guarda material «Política/acuerdo/ajuste autorizado con importe y causa verificables», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CP-01** — [state-machines.md](../../docs/state-machines.md), § 9.2. Customer Payment | [TSK-H3-003] | [TSK-H3-004] | V-SM positivo: SM-CP-01 · Sin movimiento identificado; evento «Detectar posible entrada» → Detectado. Efectos exigidos: Registrar el mismo movimiento una sola vez; datos faltantes pendientes, sin certificar recepción.. Negativo: retirar/incumplir cada guarda material «Fuente, importe/referencia/fecha y pagador/contexto según se conozcan; revisar duplicidad», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CP-02** — [state-machines.md](../../docs/state-machines.md), § 9.2. Customer Payment | [TSK-H3-003] | [TSK-H3-004] | V-SM positivo: SM-CP-02 · Detectado; evento «Abrir comprobación de correspondencia» → Pendiente de conciliar. Efectos exigidos: Propuesta de Reconciliation; referencia coincidente no basta.. Negativo: retirar/incumplir cada guarda material «Identificar movimiento y obligaciones/destinos candidatos», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CP-03** — [state-machines.md](../../docs/state-machines.md), § 9.2. Customer Payment | [TSK-H3-003] | [TSK-H3-004] | V-SM positivo: SM-CP-03 · Detectado / Pendiente de conciliar / Incidencia; evento «Verificar recepción» → Hecho Recibido verificado, manteniendo situación de conciliación pertinente. Efectos exigidos: Justificante/aviso aislado no resuelve diferencias ni asigna fondos por sí solo.. Negativo: retirar/incumplir cada guarda material «Contraste con fuente autorizada del movimiento; documentar discrepancias», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CP-04** — [state-machines.md](../../docs/state-machines.md), § 9.2. Customer Payment | [TSK-H3-003], [TSK-H3-005] | [TSK-H3-004], [TSK-H3-006] | V-SM positivo: SM-CP-04 · Pendiente de conciliar / Incidencia; evento «Validar conciliación» → Conciliado en alcance completo comprobado. Efectos exigidos: Registrar Reconciliation y asignaciones. Si solo se verificó una parte, mantener resto pendiente y no declarar todo conciliado.. Negativo: retirar/incumplir cada guarda material «Recepción verificada, correspondencia comprobada de importe, identidad/contexto, referencias, obligaciones/asignaciones y ausencia de doble cómputo; dudas resueltas humanamente», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CP-05** — [state-machines.md](../../docs/state-machines.md), § 9.2. Customer Payment | [TSK-H3-003] | [TSK-H3-004] | V-SM positivo: SM-CP-05 · Detectado / Pendiente de conciliar / Conciliado; evento «Detectar duplicado o diferencia» → Incidencia sobre situación base. Efectos exigidos: Suspender uso de la porción dudosa y reevaluar cobertura; conservar lo verificado fuera de ese alcance.. Negativo: retirar/incumplir cada guarda material «Fuente y parte afectada: importe incorrecto, identidad dudosa, recepción/distribución discrepante», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CP-06** — [state-machines.md](../../docs/state-machines.md), § 9.2. Customer Payment | [TSK-H3-003] | [TSK-H3-004] | V-SM positivo: SM-CP-06 · Incidencia; evento «Resolver discrepancia» → Pendiente de conciliar o Conciliado según cobertura real. Efectos exigidos: Si era registro repetido del mismo movimiento, enlazar corrección sin sumar otro ingreso; dos transferencias reales no son un solo movimiento por coincidir sus datos.. Negativo: retirar/incumplir cada guarda material «Evidencia y ajuste identificados, verificación humana cuando hay duda», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CP-07** — [state-machines.md](../../docs/state-machines.md), § 9.2. Customer Payment | [TSK-H4-015] | [TSK-H4-016] | V-SM positivo: SM-CP-07 · Movimiento con recepción verificada, conciliado o en revisión; evento «Registrar devolución efectivamente ejecutada» → Devuelto si cubre todo el movimiento; devolución parcial como hecho si no. Efectos exigidos: Conservar importe recibido bruto, devuelto, saldo y asignaciones/ajustes; reevaluar obligaciones según causa, no por simple resta sin política.. Negativo: retirar/incumplir cada guarda material «Refund ejecutado vinculado a cobro y porción; autorización/ejecución verificadas y sin doble devolución», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CP-08** — [state-machines.md](../../docs/state-machines.md), § 9.2. Customer Payment | [TSK-H3-003], [TSK-H4-015] | [TSK-H3-004], [TSK-H4-016] | V-SM positivo: SM-CP-08 · Conciliado / Devuelto / con devolución parcial; evento «Descubrir error posterior» → Situación de verificación reevaluada con Incidencia si corresponde. Efectos exigidos: Conservar conciliaciones y devoluciones históricas; no «deshacer» movimiento bancario cambiando estado.. Negativo: retirar/incumplir cada guarda material «Fuente y justificación del error, verificación y rectificación autorizadas», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RC-01** — [state-machines.md](../../docs/state-machines.md), § 9.3. Payment Allocation / Reconciliation | [TSK-H3-003] | [TSK-H3-004] | V-SM positivo: SM-RC-01 · Sin correspondencia / con diferencia; evento «Proponer correspondencia» → Propuesta pendiente de validar. Efectos exigidos: IA puede proponer; no mueve fondos ni alcanza Conciliado.. Negativo: retirar/incumplir cada guarda material «Fuente, pagos, obligaciones, importes/destinos candidatos», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RC-02** — [state-machines.md](../../docs/state-machines.md), § 9.3. Payment Allocation / Reconciliation | [TSK-H3-003], [TSK-H3-005], [TSK-H4-013] | [TSK-H3-006], [TSK-H4-014], [TSK-H4-019] | V-SM positivo: SM-RC-02 · Propuesta; evento «Verificar correspondencia/asignaciones» → Comprobación válida en alcance identificado. Efectos exigidos: Permitir reevaluar cobertura y SM-CP-04. Cobro, conciliación, asignación o pago a proveedor no determinan por sí solos el derecho económico del cliente; primero se determina este y después se ajustan porciones y obligaciones. Una propuesta y su validación son hechos distintos incluso si se registran consecutivamente.. Negativo: retirar/incumplir cada guarda material «Fuente autorizada, porciones y destinos reconstruibles, sin sobreasignación ni doble cómputo; derecho e importe determinados previamente conforme a D019 cuando la asignación ajusta una cancelación, devolución o nueva obligación; validación humana si duda», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RC-03** — [state-machines.md](../../docs/state-machines.md), § 9.3. Payment Allocation / Reconciliation | [TSK-H3-003], [TSK-H3-005] | [TSK-H3-004], [TSK-H3-006] | V-SM positivo: SM-RC-03 · Propuesta / comprobación válida; evento «Encontrar discrepancia» → Revisión pendiente. Efectos exigidos: Preservar correspondencia anterior; no ajustar silenciosamente importes para cuadrar.. Negativo: retirar/incumplir cada guarda material «Evidencia de diferencia y porciones afectadas», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RC-04** — [state-machines.md](../../docs/state-machines.md), § 9.3. Payment Allocation / Reconciliation | [TSK-H3-005] | [TSK-H3-006], [TSK-H4-016] | V-SM positivo: SM-RC-04 · Revisión pendiente; evento «Rectificar» → Nuevo resultado verificado enlazado. Efectos exigidos: Reevaluar obligaciones, fondos disponibles/consumidos/devueltos y cierres afectados.. Negativo: retirar/incumplir cada guarda material «Actor, motivo, fuente, antes/después y destinos justificados», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PI-01** — [state-machines.md](../../docs/state-machines.md), § 10.1. Provider Invoice addressed to client | [TSK-H3-007] | [TSK-H3-008] | V-SM positivo: SM-PI-01 · Sin exigencia concreta; evento «Identificar factura externa necesaria» → Pendiente. Efectos exigidos: Abrir necesidad documental; no fabricar factura para Tararí.. Negativo: retirar/incumplir cada guarda material «Servicio externo, proveedor y cliente pertinente», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PI-02** — [state-machines.md](../../docs/state-machines.md), § 10.1. Provider Invoice addressed to client | [TSK-H3-007] | [TSK-H3-008] | V-SM positivo: SM-PI-02 · Pendiente; evento «Recibir documento» → Recibida. Efectos exigidos: Conservar recurso y procedencia; no revisión ni pago.. Negativo: retirar/incumplir cada guarda material «Original/fuente, emisor, destinatario, importe y vínculos candidatos conocidos», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PI-03** — [state-machines.md](../../docs/state-machines.md), § 10.1. Provider Invoice addressed to client | [TSK-H3-007] | [TSK-H3-008] | V-SM positivo: SM-PI-03 · Recibida / Incidencia; evento «Revisar documento» → Revisada si satisfactoria; Incidencia si no. Efectos exigidos: Revisión operativa/documental no equivale a validación fiscal definitiva del modelo.. Negativo: retirar/incumplir cada guarda material «Comprobar proveedor, cliente destinatario, importe y alcance; documentar resultado/diferencias», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PI-04** — [state-machines.md](../../docs/state-machines.md), § 10.1. Provider Invoice addressed to client | [TSK-H3-007] | [TSK-H3-008] | V-SM positivo: SM-PI-04 · Revisada; evento «Verificar correspondencia» → Vinculada. Efectos exigidos: Si cubre varios servicios, conservar porciones verificables; no imponer un archivo = un pago.. Negativo: retirar/incumplir cada guarda material «Suplido, servicio/reserva e importes atribuibles comprobados», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PI-05** — [state-machines.md](../../docs/state-machines.md), § 10.1. Provider Invoice addressed to client | [TSK-H3-007] | [TSK-H3-008] | V-SM positivo: SM-PI-05 · Recibida / Revisada / Vinculada; evento «Diferencia/corrección posterior» → Incidencia + revisión correspondiente. Efectos exigidos: Conservar original, corrección y vínculos anteriores; reevaluar cierre documental.. Negativo: retirar/incumplir cada guarda material «Fuente y causa, importe/cliente/servicio afectados», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PP-01** — [state-machines.md](../../docs/state-machines.md), § 10.2. Provider Payment | [TSK-H3-011] | [TSK-H3-012] | V-SM positivo: SM-PP-01 · Sin pago previsto; evento «Determinar pago al proveedor» → Pendiente. Efectos exigidos: No acreditar salida de dinero ni coste propio por defecto.. Negativo: retirar/incumplir cada guarda material «Proveedor, obligación/importe y servicio; distinguir confirmado de previsto, fondos y asignaciones», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PP-02** — [state-machines.md](../../docs/state-machines.md), § 10.2. Provider Payment | [TSK-H3-011] | [TSK-H3-012] | V-SM positivo: SM-PP-02 · Pendiente / Incidencia; evento «Programar pago» → Programado. Efectos exigidos: Guardar intención/programación; no acredita fondos disponibles ni ejecución. Antes de ejecutar se verifican los fondos y condiciones materiales aplicables.. Negativo: retirar/incumplir cada guarda material «Importe, destinatario y medio/fecha de programación conocidos; fondos/asignaciones previstos o verificados diferenciados y autorización concreta aplicable», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PP-03** — [state-machines.md](../../docs/state-machines.md), § 10.2. Provider Payment | [TSK-H3-011] | [TSK-H3-012] | V-SM positivo: SM-PP-03 · Pendiente / Programado / Incidencia; evento «Verificar pago real» → Pagado en importe efectivamente acreditado. Efectos exigidos: Si la obligación es mayor, conservar saldo pendiente y pagos parciales; un pago real menor no etiqueta toda obligación Pagada.. Negativo: retirar/incumplir cada guarda material «Movimiento de salida, proveedor/importe/fecha/medio/referencia y correspondencia con fondos/servicio; G3 en ejecución IA», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PP-04** — [state-machines.md](../../docs/state-machines.md), § 10.2. Provider Payment | [TSK-H3-011] | [TSK-H3-012] | V-SM positivo: SM-PP-04 · Cualquier situación; evento «Fallo, falta de fondos o discrepancia» → Incidencia sobre fase base. Efectos exigidos: Resultado incierto no es Pagado; verificar antes de repetir. Pago real con anomalía se registra sin fingir cumplimiento previo.. Negativo: retirar/incumplir cada guarda material «Fuente, intento/resultado y alcance conocido», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PP-05** — [state-machines.md](../../docs/state-machines.md), § 10.2. Provider Payment | [TSK-H3-011] | [TSK-H3-012] | V-SM positivo: SM-PP-05 · Incidencia; evento «Resolver o corregir» → Pendiente / Programado / Pagado según hecho. Efectos exigidos: Conservar original/rectificación; documento o aprobación no prueban pago.. Negativo: retirar/incumplir cada guarda material «Evidencia y ajuste autorizados; comprobación del efecto previo», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PP-06** — [state-machines.md](../../docs/state-machines.md), § 10.2. Provider Payment | [TSK-H3-011] | [TSK-H3-012] | V-SM positivo: SM-PP-06 · Programado sin ejecución; evento «Dejar programación sin efecto» → Pendiente si obligación sigue debida. Efectos exigidos: Registrar retirada de programación; si cambia obligación, documentar ajuste sin inventar un pago cancelado ni borrar historia.. Negativo: retirar/incumplir cada guarda material «Motivo y verificación de que no hay ejecución pendiente/real desconocida», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-SU-01** — [state-machines.md](../../docs/state-machines.md), § 10.3. Progreso de Suplido / Managed Client Funds | [TSK-H3-009], [TSK-H3-011] | [TSK-H3-010], [TSK-H3-012] | V-SM positivo: SM-SU-01 · Servicio externo identificado; evento «Registrar gestión por cuenta del cliente» → Gestión abierta, pendientes explícitos. Efectos exigidos: Separar honorarios/costes propios; no inferir mandato ni calificación fiscal definitiva.. Negativo: retirar/incumplir cada guarda material «Cliente/proveedor/servicio e importe previsto o confirmado con fuente; mandato solo si existe y fue aceptado», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-SU-02** — [state-machines.md](../../docs/state-machines.md), § 10.3. Progreso de Suplido / Managed Client Funds | [TSK-H3-009], [TSK-H3-011] | [TSK-H3-010], [TSK-H3-012] | V-SM positivo: SM-SU-02 · Abierto; evento «Acreditar fondos, factura, pago o conciliación» → Actualizar solo ese componente. Efectos exigidos: Registrar fondos insuficientes/excedentes sin reasignaciones arbitrarias; tarea si factura/pago pendiente.. Negativo: retirar/incumplir cada guarda material «Evidencias de la máquina correspondiente y porciones verificadas», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-SU-03** — [state-machines.md](../../docs/state-machines.md), § 10.3. Progreso de Suplido / Managed Client Funds | [TSK-H3-009], [TSK-H3-011] | [TSK-H3-010], [TSK-H3-012] | V-SM positivo: SM-SU-03 · Componentes registrados; evento «Evaluar cierre documental» → Documentalmente resuelto. Efectos exigidos: Conservar fundamento; no implica cierre total de Booking ni convierte suplido en coste propio.. Negativo: retirar/incumplir cada guarda material «Factura del proveedor dirigida al cliente, importe identificado, pago realizado, conciliación y vínculo servicio/reserva, sin diferencia material sin resolver», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-SU-04** — [state-machines.md](../../docs/state-machines.md), § 10.3. Progreso de Suplido / Managed Client Funds | [TSK-H3-009], [TSK-H3-011] | [TSK-H3-010], [TSK-H3-012] | V-SM positivo: SM-SU-04 · Resuelto / abierto; evento «Nueva discrepancia material» → Revisión; documentalmente pendiente si falla requisito. Efectos exigidos: Conservar evaluación anterior; ajustar solo con fuente/motivo y reevaluar Economic Closure.. Negativo: retirar/incumplir cada guarda material «Evidencia de diferencia entre obligación, factura, fondos o pago», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RF-01** — [state-machines.md](../../docs/state-machines.md), § 11.1. Refund | [TSK-H4-015] | [TSK-H4-016] | V-SM positivo: SM-RF-01 · Sin devolución; evento «Registrar solicitud» → Solicitada. Efectos exigidos: No reconocer importe debido ni ejecución por la petición.. Negativo: retirar/incumplir cada guarda material «Solicitante, cobro(s), causa y parte afectada identificados», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RF-02** — [state-machines.md](../../docs/state-machines.md), § 11.1. Refund | [TSK-H4-013], [TSK-H4-015] | [TSK-H4-014], [TSK-H4-016] | V-SM positivo: SM-RF-02 · Solicitada / sin solicitud previa; evento «Determinar derecho/importe» → Determinada/debida si corresponde. Efectos exigidos: Determinar primero el derecho contractual y después ajustar fondos, conciliación, asignaciones, Refund u obligaciones. Conservar alcance, fecha de referencia, política, componentes, importes anteriores/nuevos, cálculo, regla, actor y evidencia. Si no procede devolución, registrar resultado motivado; no inventar hora, importe cero, media ni prorrateo.. Negativo: retirar/incumplir cada guarda material «Causa, política/versiones aceptadas, parte cancelada y base económica conforme a D019; fecha de referencia del alcance según §12.2, diferencia por días naturales y día límite completo según §2.4/D020; importe atribuible verificable o decisión explícita del Administrador cuando D019 la exige», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RF-03** — [state-machines.md](../../docs/state-machines.md), § 11.1. Refund | [TSK-H4-015] | [TSK-H4-016] | V-SM positivo: SM-RF-03 · Determinada/debida; evento «Autorizar devolución» → Autorizada. Efectos exigidos: No alterar saldo bancario ni declarar ejecutada. Cambio material requiere nueva autorización.. Negativo: retirar/incumplir cada guarda material «Administrador, importe, destinatario, origen/porción, método y efecto concretos; G3 si propuesta IA», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RF-04** — [state-machines.md](../../docs/state-machines.md), § 11.1. Refund | [TSK-H4-015] | [TSK-H4-016] | V-SM positivo: SM-RF-04 · Autorizada; evento «Verificar devolución real» → Ejecutada si se completó todo el alcance autorizado. Efectos exigidos: Ejecución parcial conserva importe devuelto y resto autorizado pendiente. Vincular cobro(s)/asignaciones; normalmente mismo medio.. Negativo: retirar/incumplir cada guarda material «Evidencia del movimiento de salida por importe y destinatario autorizados, fecha/medio/referencia, sin duplicidad», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RF-05** — [state-machines.md](../../docs/state-machines.md), § 11.1. Refund | [TSK-H4-015] | [TSK-H4-016] | V-SM positivo: SM-RF-05 · Cualquier progreso; evento «Fallo, discrepancia o resultado incierto» → Incidencia sobre último progreso acreditado. Efectos exigidos: Verificar antes de repetir; conservar importe ya ejecutado si existe.. Negativo: retirar/incumplir cada guarda material «Intento, fuente y porción afectada», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RF-06** — [state-machines.md](../../docs/state-machines.md), § 11.1. Refund | [TSK-H4-015] | [TSK-H4-016] | V-SM positivo: SM-RF-06 · Incidencia; evento «Resolver diferencia» → Determinada / Autorizada / Ejecutada según hechos. Efectos exigidos: No considerar ejecutado por resolver Incident. Rectificar movimiento/evidencia conserva original.. Negativo: retirar/incumplir cada guarda material «Evidencia nueva y ajuste/autorización concreta cuando cambia alcance», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-RF-07** — [state-machines.md](../../docs/state-machines.md), § 11.1. Refund | [TSK-H4-015] | [TSK-H4-016] | V-SM positivo: SM-RF-07 · Solicitada / evaluada sin ejecución; evento «Retirada o evaluación «no procede»» → Solicitud sin efecto o evaluación no debida registrada. Efectos exigidos: Es resultado de evaluación, no «Ejecutada». Retirar solicitud no extingue una obligación acreditada.. Negativo: retirar/incumplir cada guarda material «Motivo y política/evidencia; comprobar que no queda derecho debido oculto», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-DE-01** — [state-machines.md](../../docs/state-machines.md), § 11.2. Deposit / Fianza | [TSK-H4-017] | [TSK-H4-018] | V-SM positivo: SM-DE-01 · Aplicabilidad por determinar; evento «Verificar condiciones» → No aplica o Requerida. Efectos exigidos: Sin fianza no añade importe cero; con fianza, conservar regla/importe verificados y pendientes materiales.. Negativo: retirar/incumplir cada guarda material «Fuente y condiciones del servicio/alojamiento aplicables», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-DE-02** — [state-machines.md](../../docs/state-machines.md), § 11.2. Deposit / Fianza | [TSK-H4-017] | [TSK-H4-018] | V-SM positivo: SM-DE-02 · Requerida; evento «Concretar exigencia de entrega» → Pendiente de entrega. Efectos exigidos: Distinguir garantía de anticipo comercial; no sumar cobertura de ambos sin asignación específica.. Negativo: retirar/incumplir cada guarda material «Importe, condición, destinatario y momento conocidos», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-DE-03** — [state-machines.md](../../docs/state-machines.md), § 11.2. Deposit / Fianza | [TSK-H4-017] | [TSK-H4-018] | V-SM positivo: SM-DE-03 · Requerida / Pendiente de entrega; evento «Verificar entrega» → Entregada si completa. Efectos exigidos: Entrega parcial conserva entregado/resto y pendiente; no presumir custodia de Huescaventura si recibió el proveedor.. Negativo: retirar/incumplir cada guarda material «Evidencia de entrega, importe, receptor, fecha y medio pertinentes», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-DE-04** — [state-machines.md](../../docs/state-machines.md), § 11.2. Deposit / Fianza | [TSK-H4-017] | [TSK-H4-018] | V-SM positivo: SM-DE-04 · Entregada; evento «Evaluar resolución al cumplirse condición» → Pendiente de resolución. Efectos exigidos: Servicio finalizado no decide devolución/retención.. Negativo: retirar/incumplir cada guarda material «Condición aplicable y hechos de fin/revisión conocidos», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-DE-05** — [state-machines.md](../../docs/state-machines.md), § 11.2. Deposit / Fianza | [TSK-H4-017] | [TSK-H4-018] | V-SM positivo: SM-DE-05 · Pendiente de resolución; evento «Determinar devolución/retención» → Resolución determinada: devolver, retener parcialmente o retener totalmente. Efectos exigidos: Conservar porción a retener/devolver y motivo; todavía no acreditar devolución real.. Negativo: retirar/incumplir cada guarda material «Condiciones aceptadas, motivo, importe y evidencia; autorización concreta pertinente», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-DE-06** — [state-machines.md](../../docs/state-machines.md), § 11.2. Deposit / Fianza | [TSK-H4-017] | [TSK-H4-018] | V-SM positivo: SM-DE-06 · Resolución determinada con importe a devolver; evento «Verificar devolución» → Devolución ejecutada en la porción comprobada. Efectos exigidos: Si existe retención parcial, conservar ambas porciones y sus evidencias. Refund se vincula cuando representa esa devolución, sin duplicar movimiento.. Negativo: retirar/incumplir cada guarda material «Movimiento/entrega de restitución efectivamente acreditado; autorización aplicable», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-DE-07** — [state-machines.md](../../docs/state-machines.md), § 11.2. Deposit / Fianza | [TSK-H4-017] | [TSK-H4-018] | V-SM positivo: SM-DE-07 · Resolución determinada con retención; evento «Acreditar retención aplicada» → Retención parcial / Retención total. Efectos exigidos: Resolución completa solo si toda la fianza entregada está justificada como devuelta o retenida, sin diferencias abiertas.. Negativo: retirar/incumplir cada guarda material «Importe realmente retenido, causa/condición, actor y evidencia; no basta intención», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-DE-08** — [state-machines.md](../../docs/state-machines.md), § 11.2. Deposit / Fianza | [TSK-H4-017] | [TSK-H4-018] | V-SM positivo: SM-DE-08 · Cualquier progreso; evento «Detectar/resolver discrepancia» → Incidencia sobre progreso, retirada solo tras verificar. Efectos exigidos: Conservar entrega y resolución anteriores; reevaluar Economic Closure si corresponde.. Negativo: retirar/incumplir cada guarda material «Fuente, alcance, revisión y evidencia de solución», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
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
| **SM-DO-01** — [state-machines.md](../../docs/state-machines.md), § 13.1. Document Requirement / Required Document | [TSK-H4-001] | [TSK-H4-002] | V-SM positivo: SM-DO-01 · Sin exigencia aplicada; evento «Evaluar necesidad» → Pendiente o No aplica con motivo. Efectos exigidos: No crear documentos ficticios ni exigir nombres/habitaciones indiscriminadamente.. Negativo: retirar/incumplir cada guarda material «Regla/fuente y servicio/noche/persona/acción pertinente; minimización», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-DO-02** — [state-machines.md](../../docs/state-machines.md), § 13.1. Document Requirement / Required Document | [TSK-H4-001] | [TSK-H4-002] | V-SM positivo: SM-DO-02 · Pendiente; evento «Recibir documento» → Recibido. Efectos exigidos: Recepción no acredita revisión ni cumplimiento material.. Negativo: retirar/incumplir cada guarda material «Recurso/registro con procedencia y alcance candidato», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-DO-03** — [state-machines.md](../../docs/state-machines.md), § 13.1. Document Requirement / Required Document | [TSK-H4-001] | [TSK-H4-002] | V-SM positivo: SM-DO-03 · Recibido / Incidencia; evento «Revisar cumplimiento» → Revisado si satisface; Incidencia si no. Efectos exigidos: Solo revisión suficiente puede satisfacer requisito dependiente; conservar rechazo/diferencias y original.. Negativo: retirar/incumplir cada guarda material «Comprobación del contenido, versión y alcance exigido; actor/resultado», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-DO-04** — [state-machines.md](../../docs/state-machines.md), § 13.1. Document Requirement / Required Document | [TSK-H4-001] | [TSK-H4-002] | V-SM positivo: SM-DO-04 · Pendiente / Recibido / Revisado / Incidencia; evento «Comprobar no aplicabilidad» → No aplica. Efectos exigidos: Conservar historia y evidencia; no usar como dispensa inventada de un requisito imprescindible.. Negativo: retirar/incumplir cada guarda material «Decisión justificada desde regla y alcance real», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-DO-05** — [state-machines.md](../../docs/state-machines.md), § 13.1. Document Requirement / Required Document | [TSK-H4-001] | [TSK-H4-002] | V-SM positivo: SM-DO-05 · No aplica / Revisado; evento «Cambio de necesidad/alcance o documento corregido» → Pendiente si falta documento; Recibido si nueva evidencia aún sin revisar; Incidencia si discrepancia. Efectos exigidos: Conservar revisión anterior y reabrir solo requisito afectado.. Negativo: retirar/incumplir cada guarda material «Fuente y causa material», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-TA-01** — [state-machines.md](../../docs/state-machines.md), § 13.2. Task | [TSK-H1-017], [TSK-H5-001] | [TSK-H1-018], [TSK-H5-002] | V-SM positivo: SM-TA-01 · Sin tarea equivalente pendiente; evento «Necesidad manual o disparador aprobado» → Pendiente. Efectos exigidos: Crear/actualizar seguimiento sin duplicar mismo efecto; conservar política y resultado del cálculo cuando determine el aviso.. Negativo: retirar/incumplir cada guarda material «Causa, contexto, prioridad, responsable V1 y fecha conocida o necesidad de concretarla; para umbrales de este ámbito, fecha de referencia y alcance según §2.4/D020», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-TA-02** — [state-machines.md](../../docs/state-machines.md), § 13.2. Task | [TSK-H5-001] | [TSK-H5-002] | V-SM positivo: SM-TA-02 · Pendiente; evento «Registrar terminación de trabajo» → Completada. Efectos exigidos: Cerrar trabajo, sin acreditar el hecho de negocio que motivó la tarea.. Negativo: retirar/incumplir cada guarda material «Resultado, actor y momento, con referencias a lo realizado», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-TA-03** — [state-machines.md](../../docs/state-machines.md), § 13.2. Task | [TSK-H5-001] | [TSK-H5-002] | V-SM positivo: SM-TA-03 · Pendiente; evento «Dejar sin efecto» → Cancelada/sin efecto. Efectos exigidos: Conservar antecedentes, sin cancelar Booking o proveedor.. Negativo: retirar/incumplir cada guarda material «Motivo y actor», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-TA-04** — [state-machines.md](../../docs/state-machines.md), § 13.2. Task | [TSK-H1-011], [TSK-H5-001] | [TSK-H5-002] | V-SM positivo: SM-TA-04 · Pendiente; evento «Superar deadline real» → Pendiente + Vencida. Efectos exigidos: Aviso desde el día natural siguiente; sin fecha conocida no se inventa vencimiento ni hora de corte.. Negativo: retirar/incumplir cada guarda material «Fecha/política conocida; si depende de estos umbrales, día límite completo ya transcurrido por calendario local según §2.4/D020; sin cierre acreditado», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-TA-05** — [state-machines.md](../../docs/state-machines.md), § 13.2. Task | [TSK-H5-001] | [TSK-H5-002] | V-SM positivo: SM-TA-05 · Completada / Cancelada; evento «Corregir cierre erróneo o verificar que el mismo trabajo sigue pendiente» → Pendiente mediante reapertura explícita. Efectos exigidos: No borrar cierre previo ni duplicar tarea de la misma causa. Si es otra necesidad, registrar otra tarea vinculada.. Negativo: retirar/incumplir cada guarda material «Motivo y evidencia de revisión, resultado anterior conservado», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-IN-01** — [state-machines.md](../../docs/state-machines.md), § 13.3. Incident | [TSK-H4-003] | [TSK-H4-004] | V-SM positivo: SM-IN-01 · Sin incidencia; evento «Registrar detección» → Abierta. Efectos exigidos: Vincular Booking/servicio/proveedor/cliente pertinente; evaluar impacto, sin alterar su progreso por inferencia.. Negativo: retirar/incumplir cada guarda material «Contexto, detector, fecha/hora, descripción, gravedad y evidencia conocida; distinguir hipótesis/causa», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-IN-02** — [state-machines.md](../../docs/state-machines.md), § 13.3. Incident | [TSK-H4-003] | [TSK-H4-004] | V-SM positivo: SM-IN-02 · Abierta; evento «Iniciar gestión» → En gestión. Efectos exigidos: Añadir actuaciones y evidencias, no declarar resuelta la causa.. Negativo: retirar/incumplir cada guarda material «Responsable y acción registrada», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-IN-03** — [state-machines.md](../../docs/state-machines.md), § 13.3. Incident | [TSK-H4-003] | [TSK-H4-004] | V-SM positivo: SM-IN-03 · Abierta / En gestión; evento «Verificar solución» → Resuelta. Efectos exigidos: Conservar vínculos a efectos económicos pendientes; no marcar pagos o devoluciones realizados. No declarar resuelta una incertidumbre que invalide la solución.. Negativo: retirar/incumplir cada guarda material «Resultado comprobado, causa final verificada o incertidumbre explícita, acciones y alcance resueltos», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-IN-04** — [state-machines.md](../../docs/state-machines.md), § 13.3. Incident | [TSK-H4-003] | [TSK-H4-004] | V-SM positivo: SM-IN-04 · Resuelta; evento «Revisar cierre de incidencia» → Cerrada. Efectos exigidos: Cierra seguimiento de Incident, no los cierres de Booking. Obligaciones económicas pendientes siguen abiertas aunque termine este seguimiento.. Negativo: retirar/incumplir cada guarda material «Administrador verifica solución y registro suficiente; efectos derivados quedan identificados en sus entidades», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-IN-05** — [state-machines.md](../../docs/state-machines.md), § 13.3. Incident | [TSK-H4-003] | [TSK-H4-004] | V-SM positivo: SM-IN-05 · Resuelta / Cerrada; evento «Detectar resolución incorrecta o recurrencia del mismo problema» → Abierta / En gestión según actuación registrada. Efectos exigidos: Conservar solución/cierre previos; reevaluar bloqueos y Closure Assessment afectado.. Negativo: retirar/incumplir cada guarda material «Evidencia y motivo de reapertura», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-IN-06** — [state-machines.md](../../docs/state-machines.md), § 13.3. Incident | [TSK-H4-003] | [TSK-H4-004] | V-SM positivo: SM-IN-06 · Cualquier estado; evento «Revisar gravedad» → Mismo estado, gravedad revisada. Efectos exigidos: No reducir gravedad sin fundamento para eludir bloqueo; conservar clasificación anterior.. Negativo: retirar/incumplir cada guarda material «Evidencia y motivo del cambio», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CO-01** — [state-machines.md](../../docs/state-machines.md), § 14.1. Communication sin máquina artificial | [TSK-H5-005] | [TSK-H5-006] | V-SM positivo: SM-CO-01 · Sin contenido saliente / revisión; evento «Redactar» → Borrador. Efectos exigidos: Conservar elaboración; no enviar.. Negativo: retirar/incumplir cada guarda material «Contexto, destinatarios previstos, fuente y naturaleza informativa/sensible», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CO-02** — [state-machines.md](../../docs/state-machines.md), § 14.1. Communication sin máquina artificial | [TSK-H5-005] | [TSK-H5-006] | V-SM positivo: SM-CO-02 · Borrador; evento «Terminar preparación» → Preparada. Efectos exigidos: Habilitar revisión humana; no aprobar implícitamente.. Negativo: retirar/incumplir cada guarda material «Contenido/alcance concreto listo para revisión, pendientes materiales visibles», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CO-03** — [state-machines.md](../../docs/state-machines.md), § 14.1. Communication sin máquina artificial | [TSK-H5-005], [TSK-H0-011] | [TSK-H5-006], [TSK-H0-012] | V-SM positivo: SM-CO-03 · Preparada; evento «Autorizar contenido» → Hecho Aprobada. Efectos exigidos: Mantener contenido revisado; un cambio material vuelve a preparación y requiere nueva aprobación.. Negativo: retirar/incumplir cada guarda material «Human Approval concreta cuando requerida; actor y momento», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CO-04** — [state-machines.md](../../docs/state-machines.md), § 14.1. Communication sin máquina artificial | [TSK-H1-013], [TSK-H5-005], [TSK-H2-005] | [TSK-H1-014], [TSK-H5-006], [TSK-H2-006] | V-SM positivo: SM-CO-04 · Contenido listo y autorización aplicable; evento «Enviar y registrar resultado» → Hecho Enviada. Efectos exigidos: Aprobación no es envío. Incertidumbre/fallo conserva intento y revisión, sin presentarse como éxito.. Negativo: retirar/incumplir cada guarda material «Destinatario/contenido concretos, permisos, guardas de la acción y G3; evidencia de envío real», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CO-05** — [state-machines.md](../../docs/state-machines.md), § 14.1. Communication sin máquina artificial | [TSK-H1-013], [TSK-H5-005] | [TSK-H1-014], [TSK-H5-006] | V-SM positivo: SM-CO-05 · Interacción con evidencia de recepción; evento «Registrar recepción/lectura» → Hecho Recibida o lectura acreditada. Efectos exigidos: Enviada no es Recibida; leído no es aceptación. No presumir capacidades del conector.. Negativo: retirar/incumplir cada guarda material «Fuente que acredite el hecho específico, destinatario y momento conocidos», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CO-06** — [state-machines.md](../../docs/state-machines.md), § 14.1. Communication sin máquina artificial | [TSK-H1-013], [TSK-H5-005] | [TSK-H1-014], [TSK-H5-006] | V-SM positivo: SM-CO-06 · Comunicación existente / nueva entrante; evento «Registrar respuesta» → Respuesta vinculada. Efectos exigidos: Interpretar bajo guardas de Acceptance/Provider Confirmation/modificación; ambigüedad queda pendiente.. Negativo: retirar/incumplir cada guarda material «Autor, momento, original/registro y alcance de lo contestado», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-HA-01** — [state-machines.md](../../docs/state-machines.md), § 14.3. Human Approval | [TSK-H0-011] | [TSK-H0-012] | V-SM positivo: SM-HA-01 · Propuesta sensible IA; evento «Revisión humana» → Aprobación o rechazo documentados. Efectos exigidos: IA puede proponer; autorización cubre solo lo revisado. Rechazo no ejecuta acción.. Negativo: retirar/incumplir cada guarda material «Administrador autorizado y efecto concreto revisable con datos materiales conocidos», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-HA-02** — [state-machines.md](../../docs/state-machines.md), § 14.3. Human Approval | [TSK-H0-011] | [TSK-H0-012] | V-SM positivo: SM-HA-02 · Aprobación existente; evento «Cambio material antes de ejecutar» → Aprobación anterior no aplicable a la nueva propuesta. Efectos exigidos: Conservarla; solicitar nueva aprobación para efecto nuevo.. Negativo: retirar/incumplir cada guarda material «Comparación de contenido, alcance, importe, destinatario o condiciones», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-HA-03** — [state-machines.md](../../docs/state-machines.md), § 14.3. Human Approval | [TSK-H0-011], [TSK-H5-007] | [TSK-H0-012], [TSK-H5-008], [TSK-H6-006] | V-SM positivo: SM-HA-03 · Aprobación aplicable; evento «Ejecutar/validar hecho» → Ejecución/resultado vinculado, o fallo/incertidumbre. Efectos exigidos: Solo el hecho acreditado produce transición. No fabricar éxito ni repetir efectos dudosos.. Negativo: retirar/incumplir cada guarda material «Todas las guardas de la máquina pertinente y evidencia del resultado real», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CL-01** — [state-machines.md](../../docs/state-machines.md), § 15. Closures — Tres evaluaciones independientes | [TSK-H5-013] | [TSK-H5-014] | V-SM positivo: SM-CL-01 · Sin evaluación; evento «Abrir evaluación de una dimensión» → Pendiente en esa dimensión. Efectos exigidos: Registrar qué falta; no convertir otra dimensión en pendiente/resuelta sin evaluación.. Negativo: retirar/incumplir cada guarda material «Expediente y criterios aplicables identificados», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CL-02** — [state-machines.md](../../docs/state-machines.md), § 15. Closures — Tres evaluaciones independientes | [TSK-H5-013] | [TSK-H5-014] | V-SM positivo: SM-CL-02 · Pendiente; evento «Revisar suficiencia» → Resuelto en esa dimensión. Efectos exigidos: Conservar fundamento, actor y momento; otras dimensiones siguen independientes.. Negativo: retirar/incumplir cada guarda material «Todas las guardas de esa dimensión satisfechas con evidencia actual y excepciones solo donde aprobadas», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CL-03** — [state-machines.md](../../docs/state-machines.md), § 15. Closures — Tres evaluaciones independientes | [TSK-H5-015] | [TSK-H5-016] | V-SM positivo: SM-CL-03 · Resuelto; evento «Nueva obligación, corrección o incidencia invalida criterio» → Pendiente en esa dimensión. Efectos exigidos: Conservar evaluación anterior; retirar condición conjunta actual de cierre si ya no se cumple. No reescribir ejecución ni aceptación.. Negativo: retirar/incumplir cada guarda material «Hecho material y alcance del requisito que dejó de cumplirse», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CL-04** — [state-machines.md](../../docs/state-machines.md), § 15. Closures — Tres evaluaciones independientes | [TSK-H5-015] | [TSK-H5-016] | V-SM positivo: SM-CL-04 · Booking sin cierre completo actual; evento «Evaluar cierre conjunto» → Closed / Historical — Cerrada / Histórico. Efectos exigidos: Conservar todas las máquinas, vínculos e historial; no generar movimientos ni cerrar tareas como prueba sustitutiva.. Negativo: retirar/incumplir cada guarda material «Commercial Closure = Resuelto AND Operational Closure = Resuelto AND Economic Closure = Resuelto, según aplicabilidad; crítica abierta solo con justificación explícita auditada admisible», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CL-05** — [state-machines.md](../../docs/state-machines.md), § 15. Closures — Tres evaluaciones independientes | [TSK-H5-015] | [TSK-H5-016] | V-SM positivo: SM-CL-05 · Closed / Historical; evento «Evidencia posterior invalida cierre» → Cierre completo actual no satisfecho; evaluación afectada Pendiente. Efectos exigidos: Preservar que se cerró y por qué se reabrió la evaluación; no activar por ello un nuevo contrato o servicio.. Negativo: retirar/incumplir cada guarda material «Reevaluación fundada de uno o más criterios», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |

### 6.5. Prohibiciones (33 SM-FORB)

| Origen y localización | Desarrollo | Verificación | Alcance del contraste / resultado esperado |
|---|---|---|---|
| **SM-FORB-01** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H2-005], [TSK-H2-007] | [TSK-H2-006], [TSK-H2-008] | V-NEG: intentar «Caducada → Aceptada sin revalidación previa material, o prorrogar silenciosamente vencimiento»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-008, AC-009. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-02** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H2-003], [TSK-H2-007] | [TSK-H2-004], [TSK-H2-008] | V-NEG: intentar «Editar Proposal Version fijada/aceptada o Acceptance válida para cambiar el acuerdo histórico»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-007, AC-013, AC-075. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-03** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-005], [TSK-H2-005], [TSK-H2-007], [TSK-H5-005] | [TSK-H4-006], [TSK-H2-006], [TSK-H2-008], [TSK-H5-006] | V-NEG: intentar «Silencio, leído, visto, envío o mensaje ambiguo → aceptación/rechazo/confirmación»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-020, AC-086, AC-087. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-04** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H2-009], [TSK-H4-020], [TSK-H3-003] | [TSK-H2-010], [TSK-H4-021], [TSK-H3-004] | V-NEG: intentar «Ganada → Booking Confirmada operativamente o pago Conciliado»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-016, AC-023, AC-025, AC-026. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-05** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-005], [TSK-H4-009] | [TSK-H4-006], [TSK-H4-010] | V-NEG: intentar «Booking Service → Confirmado sin evidencia válida, o confirmar el conjunto desde otro servicio»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-020, AC-022. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-06** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-020] | [TSK-H4-021] | V-NEG: intentar «Confirmar Booking con crítico necesario sin confirmar o usando una excepción económica como dispensa operacional»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-023. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-07** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-005], [TSK-H4-007], [TSK-H4-022] | [TSK-H4-006], [TSK-H4-008], [TSK-H4-023] | V-NEG: intentar «Consulta/disponibilidad/opción → reserva firme, o Confirmado → Ejecutado por fecha prevista»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-020, AC-021, AC-063, AC-091. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-08** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-011] | [TSK-H4-012] | V-NEG: intentar «Pendiente de revalidación → borrar último hecho confirmado o extenderlo a alcance nuevo»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-018, AC-024, AC-030. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-09** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-011], [TSK-H5-005] | [TSK-H4-012], [TSK-H5-006] | V-NEG: intentar «Mensaje tentativo o extracción IA → sobrescribir confirmación manual»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-024, AC-088. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-10** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H2-009], [TSK-H4-011], [TSK-H3-013] | [TSK-H2-011], [TSK-H4-012], [TSK-H3-014] | V-NEG: intentar «Cantidad global/gratuidad → sobrescribir servicios/noches, reducir asistentes reales o deuda de proveedor; promoción multimodal → media, modalidad elegida automáticamente o efecto definitivo sin identificar la modalidad del/de la novi@»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-017, AC-018, AC-019, AC-038. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-11** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-011], [TSK-H1-007], [TSK-H4-009] | [TSK-H4-012], [TSK-H1-008], [TSK-H4-010] | V-NEG: intentar «Hora alternativa → hora definitiva sin acuerdo; aviso de agenda justificado → dispensa de seguridad/capacidad»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-029, AC-085, AC-092. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-12** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-007] | [TSK-H4-008] | V-NEG: intentar «Opción sin vencimiento → caducidad inventada; paso del tiempo/petición/aviso → liberación acreditada»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-021. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-13** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-011], [TSK-H4-022] | [TSK-H4-012], [TSK-H4-023] | V-NEG: intentar «Solicitud cliente → cancelación/aceptación del proveedor; cancelación parcial → cancelar resto no afectado»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-029, AC-030, AC-031. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-14** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H3-001], [TSK-H3-003] | [TSK-H3-002], [TSK-H3-004] | V-NEG: intentar «Pago Esperado/solicitado/prometido → dinero recibido; Detectado/justificante → Conciliado»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-025, AC-026. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-15** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H3-003], [TSK-H3-005], [TSK-H4-015] | [TSK-H3-004], [TSK-H3-006], [TSK-H4-019] | V-NEG: intentar «Pago parcial → toda obligación/reserva pagada; doble detección/asignación → contar fondos dos veces»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-027, AC-028. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-16** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H3-007], [TSK-H3-009], [TSK-H3-011] | [TSK-H3-008], [TSK-H3-012] | V-NEG: intentar «Factura recibida/vinculada o pago Programado → Provider Payment Pagado»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-045, AC-046. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-17** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H3-009], [TSK-H3-011] | [TSK-H3-010], [TSK-H3-012] | V-NEG: intentar «Suplido pagado sin factura → cierre documental; fondos ajenos → ingreso/coste propio por defecto»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-044, AC-046. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-18** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-011], [TSK-H4-015], [TSK-H4-003] | [TSK-H4-012], [TSK-H4-016], [TSK-H4-004] | V-NEG: intentar «Cancelación, autorización de Refund o Incident Resuelta → devolución ejecutada»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-031, AC-035, AC-052. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-19** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-017] | [TSK-H4-018] | V-NEG: intentar «Fianza sin aplicar/desconocida → importe cero; fianza entregada → anticipo; retención parcial → devolución automática del resto»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-036. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-20** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H5-001], [TSK-H4-001] | [TSK-H5-002], [TSK-H4-002] | V-NEG: intentar «Documento Recibido → Revisado por adjuntarlo; Task Completada → hecho originario cumplido»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-050, AC-051. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-21** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H1-013], [TSK-H5-005] | [TSK-H1-014], [TSK-H5-006] | V-NEG: intentar «Communication Aprobada → Enviada → Recibida por inferencia»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-087. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-22** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H0-011], [TSK-H5-007], [TSK-H3-013] | [TSK-H0-012], [TSK-H5-008], [TSK-H6-017] | V-NEG: intentar «Human Approval → ejecución, nueva aprobación implícita tras cambio, o facultad de eludir P16»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-053, AC-054, AC-055, AC-056, AC-078. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-23** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H5-013], [TSK-H5-015], [TSK-H1-003] | [TSK-H5-014], [TSK-H5-016], [TSK-H1-004] | V-NEG: intentar «Finalizada → Cerrada / Histórico sin tres cierres; archivar → cierre completo»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-058, AC-059, AC-062. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-24** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-003], [TSK-H5-015] | [TSK-H4-004], [TSK-H5-016] | V-NEG: intentar «Crítica Abierta/En gestión → cierre completo sin justificación; justificación → pago/documento/devolución inexistentes»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-052, AC-060. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-25** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H3-013], [TSK-H4-009] | [TSK-H3-014], [TSK-H4-010] | V-NEG: intentar «Tararí → proveedor externo/suplido/factura interna por defecto; costes desconocidos → rentabilidad definitiva»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-047, AC-048. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-26** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-013], [TSK-H3-013], [TSK-H3-009], [TSK-H3-005] | [TSK-H4-014], [TSK-H3-014], [TSK-H3-010], [TSK-H4-019] | V-NEG: intentar «No reembolsable → denegar devolución por causa Huescaventura/proveedor; usar media o prorrateo implícito para cancelación/promoción/precio fijo; tomar fondos cobrados, asignados o pagados a proveedor como sustituto del derecho contractual»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-032, AC-033, AC-034, AC-035, AC-036, AC-037, AC-038, AC-039, AC-040, AC-044. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-27** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H0-009], [TSK-H3-005], [TSK-H0-011], [TSK-H5-007], [TSK-H5-009] | [TSK-H4-019], [TSK-H0-012], [TSK-H5-008], [TSK-H5-010], [TSK-H5-018], [TSK-H6-015] | V-NEG: intentar «Fallo/resultado incierto → éxito o reintento sensible sin comprobar efecto previo; repetición → duplicado económico»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-027, AC-055, AC-057, AC-066, AC-069, AC-070, AC-071, AC-072, AC-073. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-28** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H5-009], [TSK-H5-011] | [TSK-H5-010], [TSK-H5-012] | V-NEG: intentar «Dato externo/calendario → cambio silencioso; consulta Avaibook → crear/modificar/cancelar allí»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-076, AC-077. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-29** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H0-005], [TSK-H0-007], [TSK-H5-011], [TSK-H1-015] | [TSK-H0-008], [TSK-H6-008], [TSK-H6-017] | V-NEG: intentar «Rol previsto/relación comercial → permiso activo; timeline → divulgación de economía/datos personales no autorizados»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-064, AC-065, AC-082. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-30** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H2-001] | [TSK-H2-002] | V-NEG: intentar «Pérdida sin motivo; reactivar → borrar pérdida o renovar tarifas/disponibilidad»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-005, AC-006. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-31** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H2-007], [TSK-H2-009], [TSK-H0-002] | [TSK-H2-008], [TSK-H2-010], [TSK-H2-011], [TSK-H6-018] | V-NEG: intentar «Aceptar parte no independiente/seleccionable sin nueva versión previa; reserva directa sin cadena comercial/Acceptance real; división/agrupación automática V1 o varias Bookings por modalidades; habilitar una división extraordinaria sin especificación posterior y acción explícita trazable del Administrador»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-012, AC-013, AC-014, AC-015, AC-016, AC-017, AC-084. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-32** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H1-003], [TSK-H2-007] | [TSK-H1-004], [TSK-H2-008], [TSK-H5-012] | V-NEG: intentar «Anular/fusionar/archivar → borrar historia o reutilizar identificadores»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-003, AC-062, AC-075. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-33** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H1-011], [TSK-H4-013], [TSK-H3-001], [TSK-H5-001], [TSK-H5-009] | [TSK-H1-012], [TSK-H4-014], [TSK-H3-002], [TSK-H5-002], [TSK-H5-010] | V-NEG: intentar «Usar 168/72 horas, 00:00, hora de servicio/check-in/actividad u otra hora ficticia para cambiar durante un día los intervalos de 7/3 días; propagar la cifra final de un alcance a otro»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-039, AC-041, AC-042, AC-043, AC-076. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |

### 6.6. Decisiones arquitectónicas (18) y principios P01–P20

| Origen y localización | Desarrollo | Verificación | Alcance del contraste / resultado esperado |
|---|---|---|---|
| **ARCH-DEC-001** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H0-002], [TSK-H0-003], [TSK-H5-009] | [TSK-H0-004], [TSK-H5-010], [TSK-H6-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-002** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H0-007], [TSK-H0-009], [TSK-H1-015], [TSK-H5-007] | [TSK-H0-008], [TSK-H0-010], [TSK-H1-016], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-003** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H1-013], [TSK-H5-009], [TSK-H5-005] | [TSK-H1-014], [TSK-H5-010], [TSK-H5-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-004** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H0-005], [TSK-H0-007], [TSK-H0-013] | [TSK-H0-006], [TSK-H0-008], [TSK-H0-014], [TSK-H6-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-005** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H0-003], [TSK-H0-007], [TSK-H5-009] | [TSK-H0-004], [TSK-H0-008], [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-006** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H5-009] | [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-007** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H5-011] | [TSK-H5-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-008** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H5-009], [TSK-H5-011], [TSK-H0-007] | [TSK-H5-010], [TSK-H5-012], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-009** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H5-009] | [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-010** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H1-015] | [TSK-H1-016], [TSK-H6-015], [TSK-H6-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-011** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H1-017], [TSK-H5-001], [TSK-H5-003], [TSK-H5-007] | [TSK-H1-018], [TSK-H5-002], [TSK-H5-004], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-012** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H0-011], [TSK-H5-007] | [TSK-H0-012], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-013** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H0-009], [TSK-H2-009], [TSK-H3-005], [TSK-H5-007], [TSK-H5-009] | [TSK-H0-010], [TSK-H2-010], [TSK-H3-006], [TSK-H5-008], [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-014** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H0-009], [TSK-H2-009], [TSK-H3-005], [TSK-H5-015] | [TSK-H0-010], [TSK-H2-010], [TSK-H3-006], [TSK-H5-016], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-015** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H0-009], [TSK-H5-007] | [TSK-H0-010], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-016** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H0-009], [TSK-H1-013], [TSK-H1-003], [TSK-H5-011] | [TSK-H0-010], [TSK-H1-014], [TSK-H1-004], [TSK-H5-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-017** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H0-001], [TSK-H0-003], [TSK-H0-002], [TSK-H6-014] | [TSK-H0-004], [TSK-H6-013], [TSK-H6-015], [TSK-H6-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-018** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H0-003], [TSK-H0-002] | [TSK-H0-004], [TSK-H6-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P01** — [constitution.md](../../docs/constitution.md), § P01. Supabase como fuente de verdad de los datos | [TSK-H0-009], [TSK-H1-013], [TSK-H5-009] | [TSK-H0-010], [TSK-H1-014], [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P02** — [constitution.md](../../docs/constitution.md), § P02. GitHub como fuente de verdad del código y la documentación | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P03** — [constitution.md](../../docs/constitution.md), § P03. SDD obligatorio para cambios importantes | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P04** — [constitution.md](../../docs/constitution.md), § P04. Especificación antes de implementación | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P05** — [constitution.md](../../docs/constitution.md), § P05. Datos de negocio verificables | [TSK-H1-013], [TSK-H2-007], [TSK-H3-003], [TSK-H4-009] | [TSK-H1-014], [TSK-H2-008], [TSK-H3-004], [TSK-H4-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P06** — [constitution.md](../../docs/constitution.md), § P06. Trazabilidad de cambios importantes | [TSK-H0-009], [TSK-H1-003], [TSK-H4-011] | [TSK-H0-010], [TSK-H1-004], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P07** — [constitution.md](../../docs/constitution.md), § P07. Conservación del historial comercial y operativo | [TSK-H2-003], [TSK-H2-007], [TSK-H2-009], [TSK-H4-011], [TSK-H5-015] | [TSK-H2-004], [TSK-H2-008], [TSK-H2-010], [TSK-H4-012], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P08** — [constitution.md](../../docs/constitution.md), § P08. Separación de estados comerciales y operativos | [TSK-H2-001], [TSK-H2-009], [TSK-H4-020], [TSK-H4-022], [TSK-H5-013] | [TSK-H2-002], [TSK-H2-010], [TSK-H4-021], [TSK-H4-023], [TSK-H5-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P09** — [constitution.md](../../docs/constitution.md), § P09. Participantes por servicio y por noche | [TSK-H2-009], [TSK-H4-011], [TSK-H1-005] | [TSK-H2-011], [TSK-H4-012], [TSK-H1-006], [TSK-H6-003] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P10** — [constitution.md](../../docs/constitution.md), § P10. Seguridad y privacidad desde el diseño | [TSK-H0-005], [TSK-H0-007], [TSK-H1-015], [TSK-H5-011] | [TSK-H6-008], [TSK-H0-008], [TSK-H1-016], [TSK-H5-012], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P11** — [constitution.md](../../docs/constitution.md), § P11. Información económica interna reservada | [TSK-H3-013], [TSK-H5-011], [TSK-H0-007] | [TSK-H3-014], [TSK-H5-012], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P12** — [constitution.md](../../docs/constitution.md), § P12. Secretos fuera de Git | [TSK-H0-003], [TSK-H5-017], [TSK-H0-015] | [TSK-H0-004], [TSK-H5-018], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P13** — [constitution.md](../../docs/constitution.md), § P13. Evolución de base de datos mediante migraciones | [TSK-H0-002], [TSK-H0-009], [TSK-H6-014] | [TSK-H6-013], [TSK-H6-015] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P14** — [constitution.md](../../docs/constitution.md), § P14. Automatizaciones auditables | [TSK-H0-009], [TSK-H1-017], [TSK-H5-007] | [TSK-H0-010], [TSK-H1-018], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P15** — [constitution.md](../../docs/constitution.md), § P15. IA supervisada en la primera fase | [TSK-H0-011], [TSK-H5-005], [TSK-H5-007] | [TSK-H0-012], [TSK-H5-006], [TSK-H5-008], [TSK-H6-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P16** — [constitution.md](../../docs/constitution.md), § P16. Facturación legal condicionada a validación | [TSK-H3-007], [TSK-H3-009], [TSK-H5-009] | [TSK-H3-008], [TSK-H3-010], [TSK-H5-010], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P17** — [constitution.md](../../docs/constitution.md), § P17. Integraciones modulares | [TSK-H0-002], [TSK-H5-009] | [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P18** — [constitution.md](../../docs/constitution.md), § P18. Aceptación y pruebas como condición de finalización | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P19** — [constitution.md](../../docs/constitution.md), § P19. Documentación coherente con el comportamiento | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P20** — [constitution.md](../../docs/constitution.md), § P20. Cálculos económicos reproducibles | [TSK-H1-009], [TSK-H4-013], [TSK-H3-013] | [TSK-H1-010], [TSK-H4-014], [TSK-H3-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |

### 6.7. Decisiones, bloques, contratos y unidades del Plan

| Origen y localización | Desarrollo | Verificación | Alcance del contraste / resultado esperado |
|---|---|---|---|
| **PLAN-DEC-001** — [plan.md](plan.md), § 3.2. PLAN-DEC — decisiones técnicas APPROVED | [TSK-H0-001], [TSK-H0-002], [TSK-H0-003] | [TSK-H0-004], [TSK-H6-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-DEC-002** — [plan.md](plan.md), § 3.2. PLAN-DEC — decisiones técnicas APPROVED | [TSK-H0-007], [TSK-H0-009] | [TSK-H0-008], [TSK-H0-010], [TSK-H6-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-DEC-003** — [plan.md](plan.md), § 3.2. PLAN-DEC — decisiones técnicas APPROVED | [TSK-H1-001], [TSK-H2-003], [TSK-H0-009], [TSK-H3-005] | [TSK-H1-002], [TSK-H2-004], [TSK-H0-010], [TSK-H3-006], [TSK-H6-013] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-DEC-004** — [plan.md](plan.md), § 3.2. PLAN-DEC — decisiones técnicas APPROVED | [TSK-H0-009], [TSK-H2-009], [TSK-H0-011], [TSK-H3-005], [TSK-H5-015] | [TSK-H0-010], [TSK-H2-010], [TSK-H0-012], [TSK-H3-006], [TSK-H5-016], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-DEC-005** — [plan.md](plan.md), § 3.2. PLAN-DEC — decisiones técnicas APPROVED | [TSK-H0-011], [TSK-H5-007], [TSK-H5-005] | [TSK-H0-012], [TSK-H5-008], [TSK-H5-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-DEC-006** — [plan.md](plan.md), § 3.2. PLAN-DEC — decisiones técnicas APPROVED | [TSK-H1-009] | [TSK-H1-010], [TSK-H3-002], [TSK-H4-014], [TSK-H3-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-DEC-007** — [plan.md](plan.md), § 3.2. PLAN-DEC — decisiones técnicas APPROVED | [TSK-H0-005], [TSK-H0-007], [TSK-H0-013], [TSK-H0-015], [TSK-H0-016] | [TSK-H0-006], [TSK-H0-008], [TSK-H0-014], [TSK-H0-017], [TSK-H6-008], [TSK-H6-009], [TSK-H6-010], [TSK-H6-011] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-DEC-008** — [plan.md](plan.md), § 3.2. PLAN-DEC — decisiones técnicas APPROVED | [TSK-H0-002] | [TSK-H1-010], [TSK-H0-008], [TSK-H6-016], [TSK-H6-015], [TSK-H5-010], [TSK-H6-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-DEC-009** — [plan.md](plan.md), § 3.2. PLAN-DEC — decisiones técnicas APPROVED | [TSK-H5-011], [TSK-H1-017], [TSK-H5-007], [TSK-H5-009] | [TSK-H5-012], [TSK-H1-018], [TSK-H5-008], [TSK-H5-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-B01** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H0-003], [TSK-H0-005], [TSK-H0-007], [TSK-H0-013], [TSK-H0-016] | [TSK-H0-004], [TSK-H0-006], [TSK-H0-008], [TSK-H0-014], [TSK-H0-017], [TSK-H6-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-B02** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H1-001], [TSK-H1-003], [TSK-H1-005], [TSK-H1-007], [TSK-H1-009], [TSK-H1-011] | [TSK-H1-002], [TSK-H1-004], [TSK-H1-006], [TSK-H1-008], [TSK-H1-010], [TSK-H1-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-B03** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H2-001], [TSK-H2-003], [TSK-H2-005], [TSK-H2-007], [TSK-H2-009] | [TSK-H2-002], [TSK-H2-004], [TSK-H2-006], [TSK-H2-008], [TSK-H2-010], [TSK-H2-011] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-B04** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H4-001], [TSK-H4-003], [TSK-H4-005], [TSK-H4-007], [TSK-H4-009], [TSK-H4-020], [TSK-H4-022] | [TSK-H4-002], [TSK-H4-004], [TSK-H4-006], [TSK-H4-008], [TSK-H4-010], [TSK-H4-021], [TSK-H4-023] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-B05** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H3-001], [TSK-H3-003], [TSK-H3-005], [TSK-H3-007], [TSK-H3-009], [TSK-H3-011], [TSK-H3-013], [TSK-H4-015], [TSK-H4-017] | [TSK-H3-002], [TSK-H3-004], [TSK-H3-006], [TSK-H3-008], [TSK-H3-010], [TSK-H3-012], [TSK-H3-014], [TSK-H4-016], [TSK-H4-018], [TSK-H4-019] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-B06** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H4-011], [TSK-H4-013], [TSK-H5-013], [TSK-H5-015] | [TSK-H4-012], [TSK-H4-014], [TSK-H5-014], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-B07** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H1-013], [TSK-H1-015], [TSK-H1-017], [TSK-H5-001], [TSK-H5-003], [TSK-H5-005], [TSK-H5-011] | [TSK-H1-014], [TSK-H1-016], [TSK-H1-018], [TSK-H5-002], [TSK-H5-004], [TSK-H5-006], [TSK-H5-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-B08** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H0-009], [TSK-H0-011], [TSK-H5-007], [TSK-H5-017] | [TSK-H0-010], [TSK-H0-012], [TSK-H5-008], [TSK-H5-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-B09** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H5-009] | [TSK-H5-010], [TSK-H6-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-B10** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H0-001], [TSK-H0-002], [TSK-H6-014], [TSK-H6-018] | [TSK-H6-012], [TSK-H6-013], [TSK-H6-015], [TSK-H6-016], [TSK-H6-017], [TSK-H6-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-C01** — [plan.md](plan.md), § 7.1. Contrato común de aplicación | [TSK-H0-005], [TSK-H0-007], [TSK-H1-015], [TSK-H5-011] | [TSK-H0-006], [TSK-H0-008], [TSK-H1-016], [TSK-H5-012], [TSK-H6-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-C02** — [plan.md](plan.md), § 7.1. Contrato común de aplicación | [TSK-H1-009], [TSK-H1-011], [TSK-H2-001], [TSK-H2-003], [TSK-H2-007], [TSK-H2-009], [TSK-H4-013], [TSK-H4-020], [TSK-H5-015] | [TSK-H1-010], [TSK-H1-012], [TSK-H2-002], [TSK-H2-004], [TSK-H2-008], [TSK-H2-010], [TSK-H4-014], [TSK-H4-021], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-C03** — [plan.md](plan.md), § 7.1. Contrato común de aplicación | [TSK-H0-009], [TSK-H2-009], [TSK-H3-003], [TSK-H3-005], [TSK-H0-011], [TSK-H5-015] | [TSK-H0-010], [TSK-H2-010], [TSK-H3-004], [TSK-H3-006], [TSK-H0-012], [TSK-H5-016], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-C04** — [plan.md](plan.md), § 7.1. Contrato común de aplicación | [TSK-H1-013], [TSK-H1-015], [TSK-H3-003], [TSK-H3-007], [TSK-H4-009], [TSK-H5-005] | [TSK-H1-014], [TSK-H1-016], [TSK-H3-004], [TSK-H3-008], [TSK-H4-010], [TSK-H5-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-C05** — [plan.md](plan.md), § 7.1. Contrato común de aplicación | [TSK-H0-011], [TSK-H5-007], [TSK-H5-009], [TSK-H5-005] | [TSK-H0-012], [TSK-H5-008], [TSK-H5-010], [TSK-H5-006], [TSK-H6-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-C06** — [plan.md](plan.md), § 7.1. Contrato común de aplicación | [TSK-H1-017], [TSK-H4-001], [TSK-H4-011], [TSK-H3-005], [TSK-H4-020], [TSK-H5-013], [TSK-H5-015] | [TSK-H1-018], [TSK-H4-002], [TSK-H4-012], [TSK-H3-006], [TSK-H4-021], [TSK-H5-014], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T01** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H2-003], [TSK-H2-005] | [TSK-H2-004], [TSK-H2-006], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T02** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H2-007], [TSK-H2-001] | [TSK-H2-008], [TSK-H2-002], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T03** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H2-009] | [TSK-H2-010], [TSK-H2-011], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T04** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H2-009], [TSK-H4-011], [TSK-H4-020], [TSK-H4-022] | [TSK-H2-010], [TSK-H2-011], [TSK-H4-012], [TSK-H4-021], [TSK-H4-023], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T05** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H3-003], [TSK-H3-005] | [TSK-H3-004], [TSK-H3-006], [TSK-H4-019], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T06** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H4-011], [TSK-H4-013] | [TSK-H4-012], [TSK-H4-014], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T07** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H3-011], [TSK-H4-015], [TSK-H4-017] | [TSK-H3-012], [TSK-H4-016], [TSK-H4-018], [TSK-H4-019], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T08** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H0-011], [TSK-H5-007] | [TSK-H0-012], [TSK-H5-008], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T09** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H1-013], [TSK-H5-007], [TSK-H5-009] | [TSK-H1-014], [TSK-H5-008], [TSK-H5-010], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T10** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H5-013], [TSK-H5-015] | [TSK-H5-014], [TSK-H5-016], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T11** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H1-003], [TSK-H2-007], [TSK-H1-013] | [TSK-H1-004], [TSK-H2-008], [TSK-H1-014], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |

### 6.8. Paquetes PT, recorridos E2E y oráculos PM

| Origen y localización | Desarrollo | Verificación | Alcance del contraste / resultado esperado |
|---|---|---|---|
| **PT-01** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H1-001], [TSK-H1-003], [TSK-H2-001] | [TSK-H1-002], [TSK-H1-004], [TSK-H2-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-02** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H2-003], [TSK-H2-005], [TSK-H2-007], [TSK-H2-009] | [TSK-H2-004], [TSK-H2-006], [TSK-H2-008], [TSK-H2-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-03** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H1-005], [TSK-H1-007], [TSK-H2-009], [TSK-H4-005], [TSK-H4-009], [TSK-H4-020], [TSK-H4-022], [TSK-H4-011] | [TSK-H1-006], [TSK-H1-008], [TSK-H2-011], [TSK-H4-006], [TSK-H4-010], [TSK-H4-021], [TSK-H4-023], [TSK-H4-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-04** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H3-001], [TSK-H3-003], [TSK-H3-005] | [TSK-H3-002], [TSK-H3-004], [TSK-H3-006], [TSK-H4-019] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-05** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H4-011], [TSK-H4-013], [TSK-H1-011], [TSK-H5-011] | [TSK-H4-012], [TSK-H4-014], [TSK-H1-012], [TSK-H5-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-06** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H4-015], [TSK-H4-017], [TSK-H5-015] | [TSK-H4-016], [TSK-H4-018], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-07** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H1-009], [TSK-H3-013], [TSK-H3-007], [TSK-H3-009], [TSK-H3-011], [TSK-H1-007], [TSK-H4-013] | [TSK-H1-010], [TSK-H3-014], [TSK-H3-008], [TSK-H3-010], [TSK-H3-012], [TSK-H1-008], [TSK-H4-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-08** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H1-017], [TSK-H5-001], [TSK-H4-001], [TSK-H4-003], [TSK-H5-003], [TSK-H5-005], [TSK-H5-011], [TSK-H5-007] | [TSK-H1-018], [TSK-H5-002], [TSK-H4-002], [TSK-H4-004], [TSK-H5-004], [TSK-H5-006], [TSK-H5-012], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-09** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H0-011], [TSK-H5-007] | [TSK-H0-012], [TSK-H5-008], [TSK-H6-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-10** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H5-013], [TSK-H5-015] | [TSK-H5-014], [TSK-H5-016], [TSK-H6-007] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-11** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H0-003], [TSK-H0-005], [TSK-H0-007], [TSK-H0-013], [TSK-H0-016], [TSK-H1-015], [TSK-H5-017], [TSK-H3-007] | [TSK-H0-004], [TSK-H6-008], [TSK-H6-009], [TSK-H6-010], [TSK-H6-011], [TSK-H0-008], [TSK-H1-016], [TSK-H5-018], [TSK-H3-008], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-12** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H0-009], [TSK-H2-009], [TSK-H3-005], [TSK-H1-015], [TSK-H5-007], [TSK-H5-009], [TSK-H6-014] | [TSK-H0-010], [TSK-H2-010], [TSK-H3-006], [TSK-H1-016], [TSK-H5-008], [TSK-H5-010], [TSK-H6-015], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-13** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E2E-01** — [spec.md](spec.md), § 9. Core End-to-End Scenarios | [TSK-H1-001], [TSK-H2-001], [TSK-H2-003], [TSK-H2-007], [TSK-H2-009], [TSK-H4-020], [TSK-H4-022], [TSK-H5-013], [TSK-H5-015] | [TSK-H6-001] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E2E-02** — [spec.md](spec.md), § 9. Core End-to-End Scenarios | [TSK-H2-003], [TSK-H2-007], [TSK-H2-009] | [TSK-H6-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E2E-03** — [spec.md](spec.md), § 9. Core End-to-End Scenarios | [TSK-H2-009], [TSK-H4-011] | [TSK-H6-003] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E2E-04** — [spec.md](spec.md), § 9. Core End-to-End Scenarios | [TSK-H4-011], [TSK-H4-013], [TSK-H4-015], [TSK-H5-015] | [TSK-H6-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E2E-05** — [spec.md](spec.md), § 9. Core End-to-End Scenarios | [TSK-H3-003], [TSK-H3-005], [TSK-H3-007], [TSK-H3-009], [TSK-H3-011], [TSK-H3-013], [TSK-H4-017] | [TSK-H6-005] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E2E-06** — [spec.md](spec.md), § 9. Core End-to-End Scenarios | [TSK-H0-011], [TSK-H5-007], [TSK-H5-005], [TSK-H5-009] | [TSK-H6-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E2E-07** — [spec.md](spec.md), § 9. Core End-to-End Scenarios | [TSK-H1-013], [TSK-H4-003], [TSK-H5-013], [TSK-H5-015] | [TSK-H6-007] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PM-01** — [plan.md](plan.md), § 5.2.2. Ejemplos y oráculos documentales | [TSK-H1-009] | [TSK-H1-010] | Oráculo de Plan §5.2.2: Positivo 10,005 a dos decimales. — 10,01; preservar 10,005 y diferencia de materialización +0,005. Verificar valores, unidades, materialización e historia; NO EJECUTADA. |
| **PM-02** — [plan.md](plan.md), § 5.2.2. Ejemplos y oráculos documentales | [TSK-H1-009] | [TSK-H1-010] | Oráculo de Plan §5.2.2: Modalidad: precio final por persona ya fijado 100,01 × 10 participaciones. — 1.000,10; no redondear un precio interno distinto después de multiplicarlo. Verificar valores, unidades, materialización e historia; NO EJECUTADA. |
| **PM-03** — [plan.md](plan.md), § 5.2.2. Ejemplos y oráculos documentales | [TSK-H1-009], [TSK-H3-001] | [TSK-H1-010], [TSK-H3-002] | Oráculo de Plan §5.2.2: Total 1.000,01; anticipo 50 %. — Interno 500,005 → anticipo 500,01; saldo 1.000,01 − 500,01 = 500,00. Verificar valores, unidades, materialización e historia; NO EJECUTADA. |
| **PM-04** — [plan.md](plan.md), § 5.2.2. Ejemplos y oráculos documentales | [TSK-H1-009], [TSK-H4-013], [TSK-H4-015] | [TSK-H1-010], [TSK-H4-014], [TSK-H4-016] | Oráculo de Plan §5.2.2: Base contractual 100,01; devolución 50 %. — Derecho interno 50,005 → devolución 50,01; retención 100,01 − 50,01 = 50,00. Verificar valores, unidades, materialización e historia; NO EJECUTADA. |
| **PM-05** — [plan.md](plan.md), § 5.2.2. Ejemplos y oráculos documentales | [TSK-H1-009], [TSK-H4-013], [TSK-H4-015] | [TSK-H1-010], [TSK-H4-014], [TSK-H4-016] | Oráculo de Plan §5.2.2: Tres participaciones de 100,01; devolución 50 % por participación, sin identidad nominal obligatoria. — 3 × 50,01 = 150,03; no 150,02 por redondear el agregado. Bases 300,03; retenciones 3 × 50,00 = 150,00. Verificar valores, unidades, materialización e historia; NO EJECUTADA. |
| **PM-06** — [plan.md](plan.md), § 5.2.2. Ejemplos y oráculos documentales | [TSK-H1-009], [TSK-H4-013], [TSK-H4-015] | [TSK-H1-010], [TSK-H4-014], [TSK-H4-016] | Oráculo de Plan §5.2.2: Derecho fijado en PM-04: 50,01; devolución efectiva parcial 20,00. — Pendiente 30,01; otra salida acreditada de 30,01 lo agota. No vuelve a aplicarse 50 % a la base ni al pendiente. Verificar valores, unidades, materialización e historia; NO EJECUTADA. |
| **PM-07** — [plan.md](plan.md), § 5.2.2. Ejemplos y oráculos documentales | [TSK-H1-009], [TSK-H4-013] | [TSK-H1-010], [TSK-H4-014] | Oráculo de Plan §5.2.2: Servicio fijo/grupal de 900,00; cambian las participaciones. — El cambio de cantidad o redondeo por persona no altera 900,00 ni crea prorrateo o derecho nuevo; rige D019 para un ajuste autorizado por otro fundamento. Verificar valores, unidades, materialización e historia; NO EJECUTADA. |
| **PM-08** — [plan.md](plan.md), § 5.2.2. Ejemplos y oráculos documentales | [TSK-H1-009], [TSK-H3-005], [TSK-H4-015] | [TSK-H1-010], [TSK-H3-006], [TSK-H4-016] | Oráculo de Plan §5.2.2: Anulación de anticipo registrado por +500,01; reversión de una salida registrada por −20,00. — Ajustes exactos de −500,01 y +20,00 respectivamente, enlazados al original y con motivo; sin volver a redondear. Verificar valores, unidades, materialización e historia; NO EJECUTADA. |
| **PM-09** — [plan.md](plan.md), § 5.2.2. Ejemplos y oráculos documentales | [TSK-H1-009], [TSK-H2-003], [TSK-H3-013] | [TSK-H1-010], [TSK-H2-004], [TSK-H3-014] | Oráculo de Plan §5.2.2: Cambian tarifas/regla o faltan costes; se reconstruye PM-02–PM-08. — Mismas bases/versiones e importes históricos; no ajustar costes, suplidos o derechos para compensar diferencias ni sustituir desconocido por cero. Verificar valores, unidades, materialización e historia; NO EJECUTADA. |
| **PM-10** — [plan.md](plan.md), § 5.2.2. Ejemplos y oráculos documentales | [TSK-H1-009] | [TSK-H1-010] | Oráculo de Plan §5.2.2: Nuevo importe negativo −10,005 EUR. — −10,01 EUR; diferencia de materialización −0,005 EUR. Una reversión sigue PM-08. Verificar valores, unidades, materialización e historia; NO EJECUTADA. |
| **PM-11** — [plan.md](plan.md), § 5.2.2. Ejemplos y oráculos documentales | [TSK-H1-009], [TSK-H3-005], [TSK-H4-015] | [TSK-H1-010], [TSK-H3-006], [TSK-H4-016] | Oráculo de Plan §5.2.2: 100,00 EUR entre tres destinos iguales en orden A/B/C. — 33,34 + 33,33 + 33,33 = 100,00 EUR; primer céntimo residual a A por empate. Verificar valores, unidades, materialización e historia; NO EJECUTADA. |
| **PM-12** — [plan.md](plan.md), § 5.2.2. Ejemplos y oráculos documentales | [TSK-H1-009], [TSK-H3-005], [TSK-H4-015] | [TSK-H1-010], [TSK-H3-006], [TSK-H4-016] | Oráculo de Plan §5.2.2: 0,05 EUR con pesos 1/1/2 en orden A/B/C. — Internos 0,0125 / 0,0125 / 0,025; céntimos completos 0,01 / 0,01 / 0,02; restos 0,0025 / 0,0025 / 0,005. Residuo 0,01 a C: 0,01 + 0,01 + 0,03 = 0,05 EUR. Verificar valores, unidades, materialización e historia; NO EJECUTADA. |
| **PM-13** — [plan.md](plan.md), § 5.2.2. Ejemplos y oráculos documentales | [TSK-H1-009], [TSK-H3-005], [TSK-H4-015] | [TSK-H1-010], [TSK-H3-006], [TSK-H4-016] | Oráculo de Plan §5.2.2: Repartos negativos de PM-11 y PM-12. — −33,34 −33,33 −33,33 = −100,00 EUR; −0,01 −0,01 −0,03 = −0,05 EUR. Mismo orden/restos sobre magnitud, después signo. Verificar valores, unidades, materialización e historia; NO EJECUTADA. |

### 6.9. Verificaciones de acceso PLAN-AUTH-001–006

| Origen y localización | Desarrollo | Verificación | Alcance del contraste / resultado esperado |
|---|---|---|---|
| **PLAN-AUTH-001** — [plan.md](plan.md), § 6.4. Recuperación y comprobaciones antes del acceso real | [TSK-H0-001], [TSK-H0-003], [TSK-H0-015] | [TSK-H6-012], [TSK-H6-010] | Plan Supabase, compatibilidad de SDK/servidor, capacidad/coste de límites, entrega de recuperación y recursos por entorno. — Capacidad verificada, coste concreto aceptado antes de contratar/configurar y ausencia de mecanismos configurados solo por documentación. |
| **PLAN-AUTH-002** — [plan.md](plan.md), § 6.4. Recuperación y comprobaciones antes del acceso real | [TSK-H0-005] | [TSK-H0-006], [TSK-H6-008] | Aplicación de D026 por sesión/dispositivo, señales humanas y medición fiable en servidor. — Pruebas con refresh/polling sin uso, uso en iPhone sin prolongar la sesión inactiva de Mac/iPad, retorno tras 7 días y máximo de 30 días, todos con contraseña + TOTP cuando corresponda. |
| **PLAN-AUTH-003** — [plan.md](plan.md), § 6.4. Recuperación y comprobaciones antes del acceso real | [TSK-H0-013], [TSK-H1-015] | [TSK-H0-014], [TSK-H1-016], [TSK-H6-008] | Revocación de todas las sesiones desde otro dispositivo, JWT aún no expirado, concurrencia y accesos a objetos/directos. — Sesiones previas denegadas efectivamente en Core, incluida la emisora, y nueva identificación; sin éxito ficticio ante fallo parcial. |
| **PLAN-AUTH-004** — [plan.md](plan.md), § 6.4. Recuperación y comprobaciones antes del acceso real | [TSK-H0-015] | [TSK-H6-009] | Contraseña/TOTP desde otro dispositivo y recuperación real de la clave en papel. — Evidencia sin secretos del acceso y restauración del factor vigente antes del uso real; copia protegida fuera de iCloud. |
| **PLAN-AUTH-005** — [plan.md](plan.md), § 6.4. Recuperación y comprobaciones antes del acceso real | [TSK-H0-015], [TSK-H0-016], [TSK-H0-013] | [TSK-H0-017], [TSK-H6-010], [TSK-H6-011] | Recuperación de contraseña cuando no esté disponible en el gestor y pérdida de todos los medios del segundo factor. — D027: entrega del enlace al email previamente verificado, retorno seguro y TOTP obligatorio tras restablecer. D031: ensayo de autoridad/acceso independiente del propietario, permisos mínimos, revocación efectiva, incidente auditado sin secretos, recuperación mínima, nuevo TOTP y nueva copia en papel verificada; Core denegado hasta completar. Procedimiento definido y probado antes de Production. |
| **PLAN-AUTH-006** — [plan.md](plan.md), § 6.4. Recuperación y comprobaciones antes del acceso real | [TSK-H0-005], [TSK-H0-007], [TSK-H0-016] | [TSK-H0-006], [TSK-H0-008], [TSK-H0-017], [TSK-H6-008], [TSK-H6-011] | Enrolamiento/recuperación incompletos, actor inhabilitado, ausencia de registro público y permisos/MFA en servidor/datos. — Sin acceso a expedientes antes de cumplir los requisitos; recuperación o nueva clave no omiten TOTP ni reactivan sesiones revocadas. |

### 6.10. Guardas G1–G6 y errores E1–E8

| Origen y localización | Desarrollo | Verificación | Alcance del contraste / resultado esperado |
|---|---|---|---|
| **G1** — [state-machines.md](../../docs/state-machines.md), § 2.1. Semántica de la transición | [TSK-H0-005], [TSK-H0-007], [TSK-H5-011] | [TSK-H0-006], [TSK-H0-008], [TSK-H5-012], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **G2** — [state-machines.md](../../docs/state-machines.md), § 2.1. Semántica de la transición | [TSK-H1-013], [TSK-H2-007], [TSK-H3-003], [TSK-H4-009], [TSK-H4-013] | [TSK-H1-014], [TSK-H2-008], [TSK-H3-004], [TSK-H4-010], [TSK-H4-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **G3** — [state-machines.md](../../docs/state-machines.md), § 2.1. Semántica de la transición | [TSK-H0-011], [TSK-H5-005], [TSK-H5-007] | [TSK-H0-012], [TSK-H5-006], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **G4** — [state-machines.md](../../docs/state-machines.md), § 2.1. Semántica de la transición | [TSK-H0-009], [TSK-H2-003], [TSK-H2-007], [TSK-H4-009] | [TSK-H0-010], [TSK-H2-004], [TSK-H2-008], [TSK-H4-010], [TSK-H6-013] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **G5** — [state-machines.md](../../docs/state-machines.md), § 2.1. Semántica de la transición | [TSK-H4-020], [TSK-H5-013], [TSK-H5-015] | [TSK-H4-021], [TSK-H5-014], [TSK-H5-016], [TSK-H6-007] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **G6** — [state-machines.md](../../docs/state-machines.md), § 2.1. Semántica de la transición | [TSK-H0-009], [TSK-H2-009], [TSK-H3-005], [TSK-H5-007] | [TSK-H0-010], [TSK-H2-010], [TSK-H3-006], [TSK-H5-008], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E1** — [spec.md](spec.md), § 19. Errors, Revalidation and Uncertainty | [TSK-H0-003], [TSK-H0-005], [TSK-H0-007] | [TSK-H0-004], [TSK-H0-006], [TSK-H0-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E2** — [spec.md](spec.md), § 19. Errors, Revalidation and Uncertainty | [TSK-H0-009], [TSK-H2-009], [TSK-H3-005], [TSK-H0-011], [TSK-H5-015] | [TSK-H0-010], [TSK-H2-010], [TSK-H3-006], [TSK-H0-012], [TSK-H5-016], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E3** — [spec.md](spec.md), § 19. Errors, Revalidation and Uncertainty | [TSK-H1-013], [TSK-H4-001], [TSK-H4-013] | [TSK-H1-014], [TSK-H4-002], [TSK-H4-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E4** — [spec.md](spec.md), § 19. Errors, Revalidation and Uncertainty | [TSK-H5-007], [TSK-H5-009] | [TSK-H5-008], [TSK-H5-010], [TSK-H6-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E5** — [spec.md](spec.md), § 19. Errors, Revalidation and Uncertainty | [TSK-H0-003], [TSK-H0-009], [TSK-H5-007] | [TSK-H0-004], [TSK-H0-010], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E6** — [spec.md](spec.md), § 19. Errors, Revalidation and Uncertainty | [TSK-H5-009], [TSK-H5-007] | [TSK-H5-010], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E7** — [spec.md](spec.md), § 19. Errors, Revalidation and Uncertainty | [TSK-H3-003], [TSK-H5-005], [TSK-H2-007] | [TSK-H3-004], [TSK-H5-006], [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E8** — [spec.md](spec.md), § 19. Errors, Revalidation and Uncertainty | [TSK-H3-007], [TSK-H4-005], [TSK-H4-009] | [TSK-H3-008], [TSK-H4-006], [TSK-H4-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |

### 6.11. Decisiones humanas D001–D035

| Origen y localización | Desarrollo | Verificación | Alcance del contraste / resultado esperado |
|---|---|---|---|
| **D001** — [DECISIONS.md](../../docs/DECISIONS.md), § D001 — Nombre oficial del proyecto | [TSK-H0-002] | [TSK-H6-018] | Nombre y contexto documental; no comportamiento nuevo. |
| **D002** — [DECISIONS.md](../../docs/DECISIONS.md), § D002 — Arquitectura de desarrollo | [TSK-H0-002], [TSK-H0-003], [TSK-H5-009] | [TSK-H0-004], [TSK-H5-010] | Arquitectura aprobada; sin ampliar stack. |
| **D003** — [DECISIONS.md](../../docs/DECISIONS.md), § D003 — Repositorio | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | Repositorio canónico y publicación documental. |
| **D004** — [DECISIONS.md](../../docs/DECISIONS.md), § D004 — Datos | [TSK-H0-009], [TSK-H1-013] | [TSK-H0-010], [TSK-H1-014] | Datos canónicos. |
| **D005** — [DECISIONS.md](../../docs/DECISIONS.md), § D005 — Despliegue | [TSK-H0-003], [TSK-H0-002] | [TSK-H0-004], [TSK-H6-018] | Preparación servidor; no despliegue. |
| **D006** — [DECISIONS.md](../../docs/DECISIONS.md), § D006 — Metodología | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | Secuencia SDD y aprobación humana. |
| **D007** — [DECISIONS.md](../../docs/DECISIONS.md), § D007 — Aplicaciones separadas | [TSK-H5-009], [TSK-H0-007] | [TSK-H5-010], [TSK-H6-017] | Separación web pública/CRM; sin UI. |
| **D008** — [DECISIONS.md](../../docs/DECISIONS.md), § D008 — Facturación | [TSK-H3-007], [TSK-H3-009], [TSK-H5-009] | [TSK-H3-008], [TSK-H3-010], [TSK-H6-017] | Validación fiscal pendiente; emisión excluida. |
| **D009** — [DECISIONS.md](../../docs/DECISIONS.md), § D009 — Supervisión humana inicial | [TSK-H0-011], [TSK-H5-007], [TSK-H5-005] | [TSK-H0-012], [TSK-H5-008], [TSK-H5-006] | Supervisión humana inicial. |
| **D010** — [DECISIONS.md](../../docs/DECISIONS.md), § D010 — Catálogo, cantidades y packs configurables | [TSK-H1-005], [TSK-H1-007], [TSK-H2-009] | [TSK-H1-006], [TSK-H1-008], [TSK-H2-011] | Configuración, packs y cantidades. |
| **D011** — [DECISIONS.md](../../docs/DECISIONS.md), § D011 — Política comercial, aceptación, cobros y cancelaciones | [TSK-H2-003], [TSK-H2-007], [TSK-H3-001], [TSK-H4-013], [TSK-H4-015] | [TSK-H2-004], [TSK-H2-008], [TSK-H3-002], [TSK-H4-014], [TSK-H4-016] | Política comercial y económica. |
| **D012** — [DECISIONS.md](../../docs/DECISIONS.md), § D012 — Operación por servicio y cierres independientes | [TSK-H4-009], [TSK-H4-022], [TSK-H5-013], [TSK-H5-015] | [TSK-H4-010], [TSK-H4-023], [TSK-H5-014], [TSK-H5-016] | Operación por servicio y cierres independientes. |
| **D013** — [DECISIONS.md](../../docs/DECISIONS.md), § D013 — Fondos de clientes, honorarios y Tararí con validación fiscal pendiente | [TSK-H3-005], [TSK-H3-009], [TSK-H3-013] | [TSK-H3-006], [TSK-H3-010], [TSK-H3-014] | Fondos ajenos, honorarios, Tararí; sin fiscalidad asumida. |
| **D014** — [DECISIONS.md](../../docs/DECISIONS.md), § D014 — Prioridad y límites de integraciones | [TSK-H5-009] | [TSK-H5-010] | Fronteras por canal y Avaibook; proveedores reales pendientes. |
| **D015** — [DECISIONS.md](../../docs/DECISIONS.md), § D015 — Un único usuario operativo en V1 y roles futuros | [TSK-H0-005], [TSK-H0-007] | [TSK-H0-006], [TSK-H0-008], [TSK-H6-008] | Único Administrador; roles futuros excluidos. |
| **D016** — [DECISIONS.md](../../docs/DECISIONS.md), § D016 — Comunicaciones, IA supervisada y automatizaciones auditables | [TSK-H1-013], [TSK-H5-005], [TSK-H0-011], [TSK-H5-007] | [TSK-H1-014], [TSK-H5-006], [TSK-H0-012], [TSK-H5-008] | Originales, supervisión y automatismos auditables. |
| **D017** — [DECISIONS.md](../../docs/DECISIONS.md), § D017 — Identidades, documentación e historial recuperable | [TSK-H1-001], [TSK-H1-003], [TSK-H1-013], [TSK-H1-015] | [TSK-H1-002], [TSK-H1-004], [TSK-H1-014], [TSK-H1-016], [TSK-H6-015] | Contexto, archivo e historia recuperable. |
| **D018** — [DECISIONS.md](../../docs/DECISIONS.md), § D018 — Aceptación parcial, reserva directa y unidad del expediente V1 | [TSK-H2-007], [TSK-H2-009] | [TSK-H2-008], [TSK-H2-010], [TSK-H6-002] | Selección explícita o nueva versión; cadena directa real; una Booking por Opportunity. |
| **D019** — [DECISIONS.md](../../docs/DECISIONS.md), § D019 — Bases económicas reproducibles para promociones y cancelaciones | [TSK-H1-007], [TSK-H4-013], [TSK-H4-015], [TSK-H3-013] | [TSK-H1-008], [TSK-H4-014], [TSK-H4-016], [TSK-H3-014] | Base individual/fija/parcial reproducible; derecho antes de pago. |
| **D020** — [DECISIONS.md](../../docs/DECISIONS.md), § D020 — Cómputo temporal por días naturales y alcance | [TSK-H1-011], [TSK-H4-013], [TSK-H3-001], [TSK-H5-011] | [TSK-H1-012], [TSK-H4-014], [TSK-H3-002], [TSK-H5-012] | Días civiles completos y referencia por alcance. |
| **D021** — [DECISIONS.md](../../docs/DECISIONS.md), § D021 — Architecture v0.1 aprobada | [TSK-H0-002], [TSK-H0-003], [TSK-H5-009] | [TSK-H0-004], [TSK-H5-010], [TSK-H6-018] | Architecture aprobada como fuente; no nueva aprobación. |
| **D022** — [DECISIONS.md](../../docs/DECISIONS.md), § D022 — SPEC 001 Core CRM v0.1 aprobada | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | SPEC aprobada como fuente; no nueva aprobación. |
| **D023** — [DECISIONS.md](../../docs/DECISIONS.md), § D023 — Precisión y materialización monetaria en los casos acordados | [TSK-H1-009], [TSK-H2-003], [TSK-H3-001], [TSK-H4-013] | [TSK-H1-010], [TSK-H2-004], [TSK-H3-002], [TSK-H4-014] | PM-01–PM-09; materialización acordada. |
| **D024** — [DECISIONS.md](../../docs/DECISIONS.md), § D024 — Corrección editorial permanente de AC-084 | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | AC-084 editorial y disciplina documental. |
| **D025** — [DECISIONS.md](../../docs/DECISIONS.md), § D025 — Acceso del Administrador y recuperación | [TSK-H0-005], [TSK-H0-013], [TSK-H0-015], [TSK-H0-016] | [TSK-H0-006], [TSK-H0-014], [TSK-H0-017], [TSK-H6-008], [TSK-H6-009] | Política de acceso aprobada; capacidad no acreditada. |
| **D026** — [DECISIONS.md](../../docs/DECISIONS.md), § D026 — Inactividad independiente por sesión/dispositivo | [TSK-H0-005] | [TSK-H0-006], [TSK-H6-008] | 30 días absolutos y 7 de inactividad por sesión; uso humano validado antes de renovar actividad. |
| **D027** — [DECISIONS.md](../../docs/DECISIONS.md), § D027 — Recuperación de contraseña por email verificado | [TSK-H0-015], [TSK-H0-016] | [TSK-H0-017], [TSK-H6-010] | Email de seguridad previamente verificado, retorno seguro y TOTP obligatorio; sin email comercial. |
| **D028** — [DECISIONS.md](../../docs/DECISIONS.md), § D028 — Redondeo simétrico de nuevos importes negativos | [TSK-H1-009] | [TSK-H1-010] | PM-10 y signo simétrico. |
| **D029** — [DECISIONS.md](../../docs/DECISIONS.md), § D029 — Repartos deterministas de céntimos | [TSK-H1-009], [TSK-H3-005], [TSK-H4-015] | [TSK-H1-010], [TSK-H3-006], [TSK-H4-016] | PM-11–PM-13; céntimos deterministas; no recalcula derechos. |
| **D030** — [DECISIONS.md](../../docs/DECISIONS.md), § D030 — Semántica visual para futura Spec de interfaz | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | Solo límite de alcance: futura SPEC de interfaz, sin tarea de UI. |
| **D031** — [DECISIONS.md](../../docs/DECISIONS.md), § D031 — Recuperación extrema desde la cuenta propietaria de Supabase | [TSK-H0-015], [TSK-H0-016], [TSK-H0-013] | [TSK-H0-017], [TSK-H6-011], [TSK-H6-009] | Autoridad independiente del propietario; revocar, incidente, nuevo TOTP y papel sin secretos. |
| **D032** — [DECISIONS.md](../../docs/DECISIONS.md), § D032 — Aprobación técnica de PLAN-DEC-001 a PLAN-DEC-009 | [TSK-H0-002], [TSK-H0-003], [TSK-H0-009], [TSK-H0-005], [TSK-H1-009] | [TSK-H0-004], [TSK-H0-010], [TSK-H0-006], [TSK-H1-010], [TSK-H6-018] | Nueve PLAN-DEC APPROVED; implementación pendiente. |
| **D033** — [DECISIONS.md](../../docs/DECISIONS.md), § D033 — Dirección web prevista del CRM | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | Solo dirección prevista crm.huescaventura.com; sin configurar. |
| **D034** — [DECISIONS.md](../../docs/DECISIONS.md), § D034 — Plan SPEC 001 Core CRM v0.3 aprobado | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | Plan v0.3 APPROVED/COMPLETED; Last Approved Commit preservado. |
| **D035** — [DECISIONS.md](../../docs/DECISIONS.md), § D035 — Autorización de preparación y publicación de Tasks SPEC 001 v0.1 DRAFT | [TSK-H0-002], [TSK-H6-018] | [TSK-H6-018] | Autorización para preparar/publicar este DRAFT y coordinación; no aprobación de Tasks ni ejecución técnica. |

## 7. Pendientes y bloqueos localizados

Los estados siguientes se conservan del Plan §12. Una ficha sigue **NOT STARTED** aunque su bloqueo pueda levantarse mediante su propia futura verificación. Ninguna prueba aislada exige declarar resuelto antes el pendiente que comprueba.

### 7.1. PLAN-PENDING y PLAN-AUTH

| Pendiente / estado conservado | Tareas afectadas y trabajo que continúa | Evidencia o decisión necesaria | Puerta que bloquea |
|---|---|---|---|
| PLAN-PENDING-001 — RESOLVED | [TSK-H0-002], [TSK-H6-018]; AC-084 conserva D024/D022. Continúa descomposición desde Plan aprobado. | Ninguna nueva decisión editorial; no reabrir PLAN-OBS-001. | Ninguna por este antecedente. |
| PLAN-PENDING-002 — RESOLVED en alcance D023 | [TSK-H1-009], [TSK-H1-010], [TSK-H2-004], [TSK-H3-002], [TSK-H4-014], [TSK-H4-016]; PM-01–PM-09 quedan definidos. | Implementación/prueba futura, no una elección de redondeo nueva. | Ninguna de política en casos resueltos; dato/fiscalidad dependiente conserva su bloqueo propio. |
| PLAN-PENDING-004 — RESOLVED por D028/D029 | [TSK-H1-009], [TSK-H1-010], [TSK-H3-006], [TSK-H4-016]; PM-10–PM-13. | Evidencia futura de negativos/repartos exactos. No convertir reparto de céntimos en nueva base/derecho. | Ninguna de política monetaria en su alcance. |
| PLAN-PENDING-003 — PARTIALLY RESOLVED, solo verificaciones técnicas | [TSK-H0-001], [TSK-H0-006], [TSK-H0-014], [TSK-H0-017], [TSK-H1-016], [TSK-H6-008], [TSK-H6-009], [TSK-H6-010], [TSK-H6-011], [TSK-H6-012], [TSK-H6-018]. Preparación e integración aislada autorizadas en una fase futura pueden avanzar. | PLAN-AUTH-001–006 satisfactorias. D025/D026/D027/D031 ya completan la política; no hay elección de política pendiente dentro de 003. | Aceptación de cualquier acceso real y preparación de Production H6. No bloquea preparar/publicar este DRAFT. |
| PLAN-AUTH-001 — PENDING / NO EJECUTADA | [TSK-H0-001], [TSK-H0-003], [TSK-H0-015], [TSK-H6-010], [TSK-H6-012]. Continúan análisis documentado y contratos independientes; una parte no comprobada no invalida lo independiente. | Compatibilidad real, recursos por entorno, plan/capacidad y entrega comprobados; coste concreto aceptado **antes** de contratar/configurar lo dependiente. Conciliar versiones/coste al final. No usar precios históricos como capacidad actual. | Configuración/contratación dependiente, acceso real y aceptación H6. |
| PLAN-AUTH-002 — PENDING / NO EJECUTADA | [TSK-H0-005], [TSK-H0-006], [TSK-H6-008]; ensayo inicial de sesiones en H0 y superficies completas tras H5. | Evidencia de máximo absoluto 30 días; 7 días de inactividad independientes por sesión/dispositivo. Uso humano validado por servidor; refresh, polling, jobs o pestaña abierta no cuentan. Comprobar límites antes de actualizar actividad. Contraseña y TOTP cuando corresponda. | Acceso real; ensayo aislado puede producir la evidencia que lo levanta. |
| PLAN-AUTH-003 — PENDING / NO EJECUTADA | [TSK-H0-013], [TSK-H0-014], [TSK-H1-015], [TSK-H1-016], [TSK-H6-008], [TSK-H6-011]. H0 cubre accesos disponibles; H1 añade objetos; H6 todas las superficies y carreras. | Revocación de todas las sesiones previas, incluida emisora, con JWT vigente; lecturas, mutaciones, resultados previos y objetos denegados efectivamente. Concurrencia/fallo parcial/respuesta tardía no reactivan sesión. | Acceso real; ninguna URL/JWT vigente demuestra revocación por sí sola. |
| PLAN-AUTH-004 — PENDING / NO EJECUTADA | [TSK-H0-015], [TSK-H6-009]; preparar guion en H0, comprobar dispositivo/papel en H6. Continúan datos sintéticos/contratos. | Andrés participa: contraseña/TOTP desde otro dispositivo y restauración comprobada del factor vigente desde copia en papel protegida fuera de iCloud. Evidencia sin secretos. | Acceso real; no requiere habilitar primero el CRM productivo para ensayar. |
| PLAN-AUTH-005 — PENDING / NO EJECUTADA | [TSK-H0-015], [TSK-H0-016], [TSK-H0-017], [TSK-H6-010], [TSK-H6-011]. Controles aislados H0; entrega real de seguridad y autoridad independiente cuando puedan comprobarse, H6. | D027: email previamente verificado, entrega/retorno seguros y TOTP tras restablecer. D031: autoridad y acceso del propietario independientes del CRM/medios perdidos; revocación, incidente, permisos mínimos, nuevo TOTP y nueva copia en papel verificada. Procedimiento definido/probado; no prometer recuperar también una cuenta propietaria perdida. | Acceso real y Production. Dobles de email no levantan entrega real; no abre conector comercial ni notificaciones internas por email. |
| PLAN-AUTH-006 — PENDING / NO EJECUTADA | [TSK-H0-007], [TSK-H0-008], [TSK-H0-006], [TSK-H0-017], [TSK-H6-008], [TSK-H6-011]. Ensayo aislado no exige pendiente previamente resuelto. | Sin registro público/acceso a expedientes con enrolamiento o recuperación incompletos, actor inhabilitado, permiso/contexto/MFA insuficientes. Nueva clave o recuperación no rehabilitan sesiones revocadas ni omiten TOTP. | Acceso real; repetir en todas las superficies disponibles antes de aceptar H6. |

### 7.2. Pendientes heredados, datos y límites de ámbito

| Pendiente / origen | Tareas afectadas | Trabajo independiente que continúa | Evidencia/decisión y puerta |
|---|---|---|---|
| ARCH-PENDING-001; BR-PENDING-001/035 — PENDING | [TSK-H5-009], [TSK-H5-010], [TSK-H6-018] conservan frontera. | B07/B08/B09, originales autorizados, registro manual, contratos/dobles e intenciones. | Selección/implementación dependiente de Telefonía IA/WhatsApp, fuera de estos hitos. Comparar ElevenLabs y al menos una alternativa real para telefonía; analizar WhatsApp por separado; proveedores comunes o distintos. Comparación/selección no realizadas. |
| ARCH-PENDING-002 — PENDING | [TSK-H6-014], [TSK-H6-015], [TSK-H6-012], [TSK-H6-018]. | Diseñar/ensayar copia/restauración aislada, inventariar recursos y medir resultados sin prometer garantías. | Andrés debe aceptar objetivos RPO/RTO, coste/complejidad, periodicidad y capacidad real de recuperación/continuidad de Production. Bloquea su aceptación/configuración definitiva; **no** el ensayo aislado que aporta evidencia. |
| DM-PENDING-002; BR-PENDING-021/022/033 | [TSK-H1-007], [TSK-H1-009], [TSK-H3-007], [TSK-H3-009], [TSK-H3-011], [TSK-H3-013], [TSK-H4-013], [TSK-H6-017], [TSK-H6-018]. | Modelo operativo con bases sintéticas/legítimas, documentos externos, honorarios/costes y términos efectivamente existentes. | Validación profesional fiscal/suplidos/Tararí, tipos comprobados y mandato real aceptado. Bloquea solo tratamiento/cálculo dependiente. Recibir fondos no crea mandato; emisión fiscal sigue excluida. |
| DM-PENDING-005; BR-PENDING-014/015/019/020 | [TSK-H1-001], [TSK-H1-013], [TSK-H1-015], [TSK-H4-001], [TSK-H4-003], [TSK-H5-005], [TSK-H5-011], [TSK-H5-017], [TSK-H6-017], [TSK-H6-018]. | Datos sintéticos, minimización, permisos, original expresamente autorizado, archivo recuperable y diseño compatible con política posterior. | Política/tratamiento permitido, conservación, anonimización/eliminación y eventual audio según finalidad. Bloquea partes dependientes y uso real; no audio, plazo ni borrado supuesto. |
| DM-PENDING-006; BR-PENDING-012/013 | [TSK-H0-005], [TSK-H0-007], [TSK-H6-017], [TSK-H6-018]. | Seguridad V1 completa con único Administrador y múltiples dispositivos, economía protegida. | Roles/permisos adicionales son futuros y están fuera de V1; no bloquean estas tareas ni conceden acceso interno a cliente/proveedor. |
| BR-PENDING-034 | [TSK-H3-003], [TSK-H3-005], [TSK-H4-015], [TSK-H5-009], [TSK-H5-010]. | Transferencias acreditadas y economía genérica. | Tarjeta/otros cobros dependientes fuera de SPEC 001; ningún conector ni cobro real acreditado por contrato. |
| BR-PENDING-035, restantes conectores | [TSK-H5-009], [TSK-H5-010], [TSK-H5-008], [TSK-H6-018]. | Dobles/manual, respuestas repetidas/ambiguas, incertidumbre y fallo localizado. | Verificar API, lectura/importación/envío/consulta de resultado y sincronización antes de implementación externa autorizada; fuera del Core actual. |
| Tarifas/capacidades/restricciones/vigencias/fianzas/costes de extras ausentes | [TSK-H1-005], [TSK-H1-007], [TSK-H2-003], [TSK-H3-013], [TSK-H4-005], [TSK-H4-007], [TSK-H4-013], [TSK-H4-017], con sus comprobaciones locales. | Fixtures identificados y regla conocida; incertidumbre preservada. | Administrador aporta/verifica datos con fuente/vigencia antes de decisión/compromiso dependiente. No inventar costes upsell ni tratar desconocido como cero. |
| Parámetros de avisos, reintentos y scheduler ausentes | [TSK-H1-017], [TSK-H5-001], [TSK-H5-003], [TSK-H5-007], [TSK-H5-017], con sus comprobaciones. | Necesidad/intención persistida, fallos visibles, contratos probados con parámetros sintéticos declarados. | Verificar valores/capacidad y aceptar configuración operativa antes de programar efecto dependiente. No asumir frecuencia, adelanto ni reintentos ilimitados. |
| Zona/fecha contractual pertinente y convención de año de códigos | [TSK-H1-003], [TSK-H1-011], [TSK-H3-001], [TSK-H4-013], [TSK-H5-011], con sus comprobaciones. | Cómputos deterministas con referencia explícita sintética; historia por unidad/alcance. | Administrador aporta referencia legítima y configuración trazable. No usar zona del Mac por defecto universal, ni cambiar D020 o política de sesión para resolver dato ausente. |
| Base parcial no atribuible bajo D019 | [TSK-H4-013], [TSK-H4-014], [TSK-H4-015], [TSK-H4-016]. | Registrar/gestionar cambio operativo independiente y conservar fundamento. | Determinación explícita del Administrador por expediente antes del importe/efecto económico afectado; no abre política global nueva ni autoriza prorrateo de precio fijo. |
| D030 / D033 — APPROVED, límites futuros | [TSK-H0-002], [TSK-H6-018]. | Todo el Core dentro de Plan. | D030 solo futura SPEC de interfaz; D033 dirección prevista. Ninguna tarea de UI, DNS, dominio, proyecto o despliegue iniciada. |

D018–D020 conservan resoluciones históricas de SM-PENDING-001/002/003; **no queda ningún SM-PENDING activo**. BR-PENDING-027 / DM-PENDING-001 se interpretan en D018; BR-PENDING-023 / DM-PENDING-003 en D019; BR-PENDING-036 / DM-PENDING-004 en D020. No se reabren selección/reserva directa/unidad de expediente, bases aprobadas ni cómputo civil. Las operaciones extraordinarias permanecen fuera de V1.

### 7.3. Puertas separadas y responsables

- **Puerta documental actual:** revisión del DRAFT en GitHub por ChatGPT y Andrés. Únicamente Andrés puede aprobar Tasks y autorizar el siguiente alcance de implementación; D035 no lo hace.
- **Ensayo técnico aislado futuro:** exige aprobación/instrucción de fase, dependencias de la ficha, capacidad/ámbito verificados y autorización de recursos/acciones correspondiente. Puede investigar/producir evidencia sobre un pendiente abierto. Sus resultados no conceden acceso real.
- **Acceso real:** todas las PLAN-AUTH satisfactorias y decisiones/datos/políticas materiales de ese uso acreditados; sin convertir disponibilidad parcial o un mock en aceptación.
- **Preparación de Production H6:** lo anterior más ARCH-PENDING-002 y políticas/capacidades de continuidad aceptadas y comprobadas; informe con limitaciones. El despliegue/uso sigue requiriendo su autorización propia.
- **Responsabilidad:** Andrés aporta decisiones/datos humanos y participa en ensayos de sus medios; el trabajo técnico autorizado aporta evidencia real y límites, sin asumir capacidades ni resolver políticas pendientes por código.

## 8. Resultado de revisión documental y siguiente paso

### 8.1. Revisión de este DRAFT

| Comprobación documental | Resultado / límite |
|---|---|
| Inventario de tareas | 125 IDs únicos: H0 18, H1 19, H2 12, H3 15, H4 24, H5 19, H6 18. Tipos: 4 preparación, 48 implementación, 65 comprobación, 8 documentación/evidencia. |
| Inventario normativo contrastado | 116 FR, 15 NFR, 92 AC, 52 DM-INV, 148 transiciones, 33 SM-FORB, 18 ARCH-DEC, 20 principios, 9 PLAN-DEC, 10 PLAN-B, 6 PLAN-C, 11 PLAN-T, 13 PT, 7 E2E, 13 PM, 6 PLAN-AUTH, 6 guardas, 8 errores y 35 decisiones humanas. **618 filas individuales**, sin huecos ni IDs inventados frente a las fuentes. D035 solo autorización documental. |
| Cobertura | Cada ID tiene desarrollo y verificación concretos. Se contrastó además el contenido de las fichas con alcance, casos y salidas de sus fuentes; las 148 transiciones incluyen recorrido positivo y cada guarda material, y las 33 prohibiciones intento negativo. La asignación documental no demuestra que el futuro software cumpla. |
| Dependencias | IDs existentes, grafo sin ciclos y sin dependencias de hito posterior. H0→H6 explícito; autorización/historia/idempotencia tempranas, evidencia H1 antes de H3, requisitos/incidencias al inicio de H4, confirmación completa H4 y cierre integrado H5. |
| Granularidad y salida | 48 cambios de implementación vinculados a comprobación local y obligaciones de integración adicionales. Migración/prueba del cambio persistente forman su bloque; H6 comprueba cadena completa. |
| Bloqueos y paralelismo | Estados/políticas aprobados preservados; bloqueos por tarea/uso; ensayos aislados capaces de producir evidencia sin circularidad. Paralelismo sujeto a dependencias y recursos/contratos separados. |
| Estados y alcance | Todas las tareas vacías, NOT STARTED; evidencia NO EJECUTADA. Tasks v0.1 DRAFT / NOT APPROVED. Fase 08 IN PROGRESS; fase 07 COMPLETED. Ningún trabajo técnico ejecutado. |
| Protección documental | Publicación restringida a tasks.md, PROJECT-STATUS.md, NEXT-STEPS.md y apéndice D035 en DECISIONS.md. Comparación exacta de las fuentes aprobadas y del prefijo D001–D034 respecto a la base; Last Approved Commit conserva c2c908495afb8eacd39775f273585173533d6b51. |
| Publicación | Commit del borrador y, después, commit exclusivo de coordinación para registrar su SHA. Verificar main local, origin/main, remoto y árbol limpio; constancia final en PROJECT-STATUS y entrega de sesión. No confundir el commit publicado con aprobación. |

Los recuentos se contrastan mediante conjuntos de IDs extraídos de las tablas/epígrafes fuente y asignaciones por fila, además de revisión de casos/dependencias. No son una declaración de pruebas satisfactorias. **No se han ejecutado pruebas de aplicación, datos, Auth, integración, migración ni recuperación del CRM.**

### 8.2. Siguiente paso humano y puntos de revisión

ChatGPT y Andrés revisarán en GitHub la granularidad, las correspondencias normativas, los alcances locales frente a integraciones posteriores, los criterios de salida y las puertas de acceso/Production. Si la revisión pide cambios, se corrige el DRAFT dentro de una instrucción autorizada. Aprobar Tasks y autorizar implementación son actos posteriores; no se deducen de publicación, estado limpio ni aprobación del Plan.

La revisión debe prestar atención a la secuencia de controles aislados H0, los complementos B07/B08 anteriores a H5, las matrices de guardas/prohibiciones, los ensayos AUTH repartidos por disponibilidad y las decisiones/datos localizados de §7. No se solicita decidir de nuevo políticas D018–D020 o D023–D033 ya aprobadas.

**Punto de parada de esta autorización:** borrador y coordinación publicados. **Tasks NOT APPROVED; implementación y H0–H6 NOT STARTED; pruebas técnicas NO EJECUTADAS.**

[TSK-H0-001]: #tsk-h0-001
[TSK-H0-002]: #tsk-h0-002
[TSK-H0-003]: #tsk-h0-003
[TSK-H0-004]: #tsk-h0-004
[TSK-H0-005]: #tsk-h0-005
[TSK-H0-006]: #tsk-h0-006
[TSK-H0-007]: #tsk-h0-007
[TSK-H0-008]: #tsk-h0-008
[TSK-H0-009]: #tsk-h0-009
[TSK-H0-010]: #tsk-h0-010
[TSK-H0-011]: #tsk-h0-011
[TSK-H0-012]: #tsk-h0-012
[TSK-H0-013]: #tsk-h0-013
[TSK-H0-014]: #tsk-h0-014
[TSK-H0-015]: #tsk-h0-015
[TSK-H0-016]: #tsk-h0-016
[TSK-H0-017]: #tsk-h0-017
[TSK-H0-018]: #tsk-h0-018
[TSK-H1-001]: #tsk-h1-001
[TSK-H1-002]: #tsk-h1-002
[TSK-H1-003]: #tsk-h1-003
[TSK-H1-004]: #tsk-h1-004
[TSK-H1-005]: #tsk-h1-005
[TSK-H1-006]: #tsk-h1-006
[TSK-H1-007]: #tsk-h1-007
[TSK-H1-008]: #tsk-h1-008
[TSK-H1-009]: #tsk-h1-009
[TSK-H1-010]: #tsk-h1-010
[TSK-H1-011]: #tsk-h1-011
[TSK-H1-012]: #tsk-h1-012
[TSK-H1-013]: #tsk-h1-013
[TSK-H1-014]: #tsk-h1-014
[TSK-H1-015]: #tsk-h1-015
[TSK-H1-016]: #tsk-h1-016
[TSK-H1-017]: #tsk-h1-017
[TSK-H1-018]: #tsk-h1-018
[TSK-H1-019]: #tsk-h1-019
[TSK-H2-001]: #tsk-h2-001
[TSK-H2-002]: #tsk-h2-002
[TSK-H2-003]: #tsk-h2-003
[TSK-H2-004]: #tsk-h2-004
[TSK-H2-005]: #tsk-h2-005
[TSK-H2-006]: #tsk-h2-006
[TSK-H2-007]: #tsk-h2-007
[TSK-H2-008]: #tsk-h2-008
[TSK-H2-009]: #tsk-h2-009
[TSK-H2-010]: #tsk-h2-010
[TSK-H2-011]: #tsk-h2-011
[TSK-H2-012]: #tsk-h2-012
[TSK-H3-001]: #tsk-h3-001
[TSK-H3-002]: #tsk-h3-002
[TSK-H3-003]: #tsk-h3-003
[TSK-H3-004]: #tsk-h3-004
[TSK-H3-005]: #tsk-h3-005
[TSK-H3-006]: #tsk-h3-006
[TSK-H3-007]: #tsk-h3-007
[TSK-H3-008]: #tsk-h3-008
[TSK-H3-009]: #tsk-h3-009
[TSK-H3-010]: #tsk-h3-010
[TSK-H3-011]: #tsk-h3-011
[TSK-H3-012]: #tsk-h3-012
[TSK-H3-013]: #tsk-h3-013
[TSK-H3-014]: #tsk-h3-014
[TSK-H3-015]: #tsk-h3-015
[TSK-H4-001]: #tsk-h4-001
[TSK-H4-002]: #tsk-h4-002
[TSK-H4-003]: #tsk-h4-003
[TSK-H4-004]: #tsk-h4-004
[TSK-H4-005]: #tsk-h4-005
[TSK-H4-006]: #tsk-h4-006
[TSK-H4-007]: #tsk-h4-007
[TSK-H4-008]: #tsk-h4-008
[TSK-H4-009]: #tsk-h4-009
[TSK-H4-010]: #tsk-h4-010
[TSK-H4-011]: #tsk-h4-011
[TSK-H4-012]: #tsk-h4-012
[TSK-H4-013]: #tsk-h4-013
[TSK-H4-014]: #tsk-h4-014
[TSK-H4-015]: #tsk-h4-015
[TSK-H4-016]: #tsk-h4-016
[TSK-H4-017]: #tsk-h4-017
[TSK-H4-018]: #tsk-h4-018
[TSK-H4-019]: #tsk-h4-019
[TSK-H4-020]: #tsk-h4-020
[TSK-H4-021]: #tsk-h4-021
[TSK-H4-022]: #tsk-h4-022
[TSK-H4-023]: #tsk-h4-023
[TSK-H4-024]: #tsk-h4-024
[TSK-H5-001]: #tsk-h5-001
[TSK-H5-002]: #tsk-h5-002
[TSK-H5-003]: #tsk-h5-003
[TSK-H5-004]: #tsk-h5-004
[TSK-H5-005]: #tsk-h5-005
[TSK-H5-006]: #tsk-h5-006
[TSK-H5-007]: #tsk-h5-007
[TSK-H5-008]: #tsk-h5-008
[TSK-H5-009]: #tsk-h5-009
[TSK-H5-010]: #tsk-h5-010
[TSK-H5-011]: #tsk-h5-011
[TSK-H5-012]: #tsk-h5-012
[TSK-H5-013]: #tsk-h5-013
[TSK-H5-014]: #tsk-h5-014
[TSK-H5-015]: #tsk-h5-015
[TSK-H5-016]: #tsk-h5-016
[TSK-H5-017]: #tsk-h5-017
[TSK-H5-018]: #tsk-h5-018
[TSK-H5-019]: #tsk-h5-019
[TSK-H6-001]: #tsk-h6-001
[TSK-H6-002]: #tsk-h6-002
[TSK-H6-003]: #tsk-h6-003
[TSK-H6-004]: #tsk-h6-004
[TSK-H6-005]: #tsk-h6-005
[TSK-H6-006]: #tsk-h6-006
[TSK-H6-007]: #tsk-h6-007
[TSK-H6-008]: #tsk-h6-008
[TSK-H6-009]: #tsk-h6-009
[TSK-H6-010]: #tsk-h6-010
[TSK-H6-011]: #tsk-h6-011
[TSK-H6-012]: #tsk-h6-012
[TSK-H6-013]: #tsk-h6-013
[TSK-H6-014]: #tsk-h6-014
[TSK-H6-015]: #tsk-h6-015
[TSK-H6-016]: #tsk-h6-016
[TSK-H6-017]: #tsk-h6-017
[TSK-H6-018]: #tsk-h6-018
