# CRM HUESCAVENTURA OS — SPEC 001 Core CRM

## 1. Status / Metadata / Approval

Status: DRAFT
Version: 0.1
Created: 2026-09-10
Last updated: 2026-09-10
Phase: 6 — SPEC 001 Core CRM
Progress: IN PROGRESS — borrador completo pendiente de revisión humana
Approval: NOT APPROVED — sin aprobación humana de esta Spec
Ready for plan.md: NO — requiere revisión y aprobación humana posterior
Implementation: NOT STARTED

Repositorio: IAndresB/crm-huescaventura-os. Base documental contrastada: `70921fa7a2407043bc7f4e3099cfeebe5590fc3f`, coincidente en main y origin/main antes de redactar. Última aprobación documental: Architecture v0.1, commit `7d3a63ff47f841fc288cce63f1d5263d6a9975ac`, registrada por D021. Publicar este DRAFT no constituye aprobación ni inicio de otra fase.

Los DEBE/NO DEBE expresan el comportamiento propuesto para verificación y posterior aprobación de SPEC 001; no afirman funcionalidades implementadas. Las obligaciones de las fuentes APPROVED siguen vigentes. Las Task del negocio son distintas de [tasks.md](tasks.md), que continúa como placeholder no iniciado, igual que [plan.md](plan.md).

## 2. Purpose

Convertir los documentos aprobados en requisitos verificables para llevar una oportunidad real hasta una Booking cerrada, conservando sus servicios, modalidades, cantidades, noches, operación, economía, evidencias y controles. Debe poder explicarse qué se ofreció, quién aceptó qué, qué está confirmado, qué ocurrió, qué sigue pendiente y por qué puede o no cerrarse cada dimensión.

Esta Spec define comportamiento interno y resultados observables conceptualmente. No diseña la interfaz física ni una aplicación completa de gestión de todos los ámbitos del producto.

## 3. Authority, Sources and Precedence

Fuentes leídas íntegramente y contrastadas antes de redactar:

| Referencia abreviada | Fuente y estado verificado | Autoridad utilizada |
|---|---|---|
| C | [Constitution](../../docs/constitution.md), APPROVED v1.0 | P01–P20; prevalece sobre cualquier documento inferior. |
| Product | [Product](../../docs/product.md), APPROVED v0.1 | Propósito y alcance del producto, concretados por las decisiones aprobadas. |
| BR | [Business Rules](../../docs/business-rules.md), APPROVED v0.2 | Políticas, datos conocidos y familias de reglas de negocio. |
| DM | [Domain Model](../../docs/domain-model.md), APPROVED v0.1 | Identidades, conceptos, relaciones e invariantes DM-INV-001–052. |
| SM | [State Machines](../../docs/state-machines.md), APPROVED v0.1 | Guardas G1–G6, tablas de transición, dependencias, SM-FORB-01–33 y resoluciones históricas. |
| ARCH | [Architecture](../../docs/architecture.md), APPROVED v0.1 el 2026-09-10 | Responsabilidades y ARCH-DEC-001–018, todas APPROVED; sus dos ARCH-PENDING siguen PENDING. |
| D | [DECISIONS](../../docs/DECISIONS.md), D001–D021 APPROVED y vigentes | Concreciones humanas y alcance exacto de sus resoluciones. |
| Coordinación | [PROJECT-STATUS](../../docs/PROJECT-STATUS.md), [NEXT-STEPS](../../docs/NEXT-STEPS.md), [README](../../README.md), Spec y placeholders previos | Fase y estado del trabajo; no crean reglas de negocio ni aprobaciones. |

Se respeta BR-GOV-001: Constitución → decisiones aprobadas / producto → reglas de negocio → documentos posteriores. DM, SM y ARCH desarrollan sus ámbitos; una Spec DRAFT no modifica ninguna fuente APPROVED. Las tablas normativas de SM prevalecen sobre sus diagramas resumidos. Una contradicción real no resuelta requiere decisión humana y detiene solo su parte material.

D018 concreta aceptación parcial seleccionable, reserva directa trazable y unidad normal V1. D019 concreta bases económicas reproducibles y determinación explícita cuando falta atribución verificable. D020 concreta días naturales y referencias por alcance. Se aplican junto con SM §19.2 a los antecedentes BR-PENDING-027/023/036 y DM-PENDING-001/003/004. SM-PENDING-001/002/003 son históricos resueltos; no queda ninguno activo. Los textos de fin de fase y los Impact históricos de decisiones anteriores no describen la fase actual ni reabren decisiones. D021 aprueba Architecture; esta ejecución solo redacta y publica SPEC 001 DRAFT.

## 4. SPEC 001 Boundary / Definition of Core

**SPEC 001 define todo el comportamiento interno necesario para que una oportunidad real pueda llegar de forma íntegra y trazable hasta una Booking cerrada, incluyendo sus servicios, cantidades, operación, economía, evidencias y controles transversales; las interfaces físicas y los proveedores que alimentan o consumen ese Core quedan fuera.**

La frontera de entrada recibe solicitudes internas autorizadas y hechos/evidencias identificados, incluso registros manuales de comunicaciones externas. La frontera de salida proporciona resultados internos, contexto autorizado e intenciones trazables pendientes de ejecución externa cuando corresponda. Preparar esa frontera no acredita que exista un conector ni que el proveedor haya recibido o realizado algo.

El Core puede registrar y verificar un hecho externo aportado por el Administrador sin integración física. Puede avanzar las partes independientes con un proveedor no disponible, manteniendo pendientes las que necesitan su evidencia. Las obligaciones de catálogo, coordinación e integración se incluyen únicamente en cuanto sustentan el expediente y su trazabilidad; no habilitan un gestor avanzado de catálogo, campañas, atención omnicanal ni conectores completos.

## 5. In Scope

- Identidad: Contact, Organization, Group / Party, responsable contextual, participantes nominales necesarios y fusión humana trazable.
- Comercial: Lead, Opportunity, propuestas/alternativas/versiones/modalidades, términos, Acceptance, conversión normal y reserva directa D018.
- Catálogo mínimo: servicios/variantes, clasificación, recomendaciones, unidades, formas de precio, ofertas/proveedores, tarifas/packs/promociones versionados y requisitos necesarios para contratar/prestar.
- Operación: Booking, prestaciones, cantidades y asignaciones por servicio/noche, horarios/localizaciones, disponibilidad, opciones, confirmación externa o interna, preparación, ejecución, incidencias, modificación y cancelación.
- Economía operativa: política y vencimientos, movimientos, asignaciones/conciliación, fondos ajenos, facturas externas al cliente, pagos a proveedores, honorarios, costes propios, devoluciones, fianzas y cálculos reproducibles reservados.
- Coordinación: Task, Alert/Notification, Required Document, Incident, Communication, originales/derivados, timeline y calendario operacional conceptuales.
- Controles: Human Approval, identidad/autorización, privacidad, idempotencia, concurrencia, consistencia, trabajo persistido, errores, observabilidad e historia.
- Cierres comercial, operativo y económico, cierre conjunto y reevaluación ante evidencia posterior.

## 6. Explicitly Out of Scope

| Área | Exclusiones de SPEC 001 |
|---|---|
| Proveedores e interfaces externas | Selección/configuración de proveedores concretos de Telefonía IA o WhatsApp; integración real de email, Google Calendar, tarjeta, Avaibook o PLAUD; comparativas técnicas; web pública y sus formularios/pantallas; portal cliente y portal proveedor. |
| Usuarios y autonomía | Usuarios operativos adicionales, matriz granular de roles futuros, autonomía sensible de IA y autorización genérica de envíos comerciales automáticos. |
| Jurídico y fiscal | Facturación legal, numeración y motor fiscal; conclusiones jurídicas/fiscales nuevas de suplidos o Tararí; texto jurídico del mandato; política definitiva RGPD de retención/anonimización/eliminación; audio por defecto. |
| Producto ampliado | Split/merge extraordinario de Opportunities/Bookings, ERP/contabilidad general, RRHH/nóminas, analítica avanzada, gestión avanzada de catálogo/campañas, aplicación móvil nativa. |
| Diseño físico | UI, pantallas, estilos, componentes, SQL, tablas, columnas, índices, funciones, triggers, migraciones, políticas RLS concretas, endpoints definitivos, API schemas definitivos, buckets y rutas físicas. Los cuadros documentales no son tablas de base de datos. |
| Ejecución técnica | Configuración de Supabase, Vercel o proveedores; scheduler concreto, frecuencias universales, brokers o infraestructura adicional; deployment/despliegues; código e implementación. |
| Fases SDD | Redacción o inicio de plan.md, tasks.md e implementación; aprobación de SPEC 001 en esta ejecución. |

Mantener un requisito conceptual de seguridad, recuperación o interfaz no autoriza su diseño físico. Una futura integración debe especificar y verificar sus capacidades y controles antes de activarse; tampoco una aprobación interna permite las operaciones expresamente excluidas.

## 7. Actors and Trust Boundaries

| Actor / frontera | Facultad o información admitida | Guarda |
|---|---|---|
| Administrador / Propietario | Único usuario operativo V1, CRM Actor estable, gestiona el Core y revisa decisiones sensibles. | Identidad autenticada por Supabase Auth y habilitación comprobadas en servidor; no puede eludir P16 ni fabricar evidencias. |
| Contact / cliente / responsable / pagador / participante | Personas y funciones de negocio; pueden originar peticiones, aceptación, datos o movimientos. | No son usuarios internos por relación comercial; facultad contextual y atribución verificadas. |
| Organization / Provider y contactos | Contrapartes con condiciones, documentos y respuestas. | Autoridad solo sobre lo que acreditan; no acceden al expediente o economía interna por existir un vínculo. |
| IA / automatización / ejecutor | Extrae datos claros, propone o aplica únicamente efectos autorizados y limitados. | Identidad/versionado propios, permisos de efecto y Human Approval cuando corresponde; no se autoaprueba. |
| Canal / futuro adaptador | Traduce entrada o intención/salida y conserva origen, alcance y resultado. | Dato externo no confiable hasta verificar; no puede escribir estados arbitrarios ni otorgar permisos. |
| Proyecciones / documentos / contexto IA | Presentan información autorizada derivada del registro canónico. | Misma restricción por finalidad y destinatario; una referencia conocida no concede acceso. |

La autenticación, el CRM Actor, su autorización y las identidades comerciales son conceptos separados. Los roles Comercial, Operaciones, Administración y Colaborador limitado permanecen conceptualmente preparados e inactivos. Administración no se equipara a Administrador.

## 8. Domain Vocabulary

Se conserva el vocabulario de DM §§4–13; los nombres no prescriben almacenamiento.

| Conceptos | Distinción relevante para verificar el Core |
|---|---|
| Contact / Organization / Group / Primary Contact | Persona, organización, grupo de experiencia y designación contextual con historia; ninguna sustituye a las otras. |
| Lead / Opportunity | Señal de interés y venta con continuidad, contexto y estado comercial. |
| Proposal / Proposal Version / Modality | Alternativa estable, edición fijada y composición para parte del grupo; preparación editable separada. |
| Acceptance / Accepted Terms Snapshot | Hecho del cliente y condiciones exactas aceptadas; distintas de Human Approval y confirmación del proveedor. |
| Service / Variant / Provider Offering | Servicio de catálogo, variante y oferta de contraparte; no son prestaciones confirmadas. |
| Unit Definition / Pricing Form / Tariff Version | Significado de cantidad, base de precio y valores/reglas aplicados; no se presupone precio por persona. |
| Pack / Promotion y sus versiones | Configuración reusable y regla promocional aprobada; modalidad personalizada no exige maestro. |
| Booking / Booking Service | Expediente y prestación concreta con identidad y alcance propios, incluso repitiendo catálogo. |
| Booking Participant Allocation / Booking Night / Night Occupancy | Cantidad/asignación por prestación y detalle por noche; Night Occupancy no es otro total competidor. |
| Availability Evidence / Capacity Hold / Provider Confirmation | Disponibilidad acreditada, compromiso temporal y aceptación operativa inequívoca; no son equivalentes. |
| Booking Modification / Cancellation | Petición evaluada y aplicada por alcance; cancelación es tipo/alcance, no nueva Booking. |
| Payment Policy Version / Schedule / Expected Payment | Política, vencimientos aplicados y obligación; no dinero disponible. |
| Customer Payment / Payment Allocation / Reconciliation | Movimiento, destino de porciones y comprobación de correspondencia; recepción y conciliación son distintas. |
| Suplido / Managed Client Funds / Provider Invoice / Provider Payment | Gestión de fondos ajenos, documento externo al cliente y pago real; no ingreso/coste propio por defecto. |
| Fee / Internal Cost / Economic Calculation Snapshot | Remuneración y coste propios, con cálculo histórico reproducible y reservado. |
| Refund / Deposit | Devolución y garantía/fianza; autorización, entrega, retención y ejecución son hechos separados. |
| Task / Alert / Notification / Incident / Required Document | Trabajo, riesgo, aviso, problema y exigencia documental con ciclos independientes. |
| Communication / Document / Evidence / Provenance / Review | Interacción, recurso, sustento de un hecho, procedencia y revisión; original y derivado distintos. |
| Human Approval / Execution Record | Autorización interna concreta y evidencia de intento/resultado; aprobación no es ejecución. |
| Change Record / Domain Event / timeline / calendario | Historia y proyecciones referidas a hechos; sin event sourcing ni segunda autoridad. |
| Closure Assessment / Closed-Historical | Tres evaluaciones dentro de Booking y condición conjunta; archivado es conservación recuperable. |
| Integration Source / External Reference / External Event | Fuente, vínculo externo y noticia recibida; identidad y efecto internos se conservan. |

## 9. Core End-to-End Scenarios

Estos recorridos son guiones de revisión, no pruebas ejecutadas. §24 establece entradas y resultados comprobables.

| Escenario | Recorrido y evidencia final esperada | Criterios principales |
|---|---|---|
| E2E-01 — Venta y prestación completa | Contact/Organization/Group según contexto → Lead con mínimos → Opportunity → versión con modalidades → Acceptance verificable → una Booking → servicios/cantidades/noches → confirmación y condiciones económicas → ejecución → obligaciones/documentos resueltos → tres cierres. Se reconstruye cada vínculo y todo pendiente. | AC-001–019, AC-023–028, AC-044–046, AC-058–063. |
| E2E-02 — Reserva directa | Administrador registra/reutiliza Opportunity, Proposal/Version y términos, Acceptance real y Booking; sin Lead ni envíos ficticios. Un reintento reconoce la misma Booking. | AC-014–016, AC-075. |
| E2E-03 — Grupo con modalidades y noches distintas | 10 personas con rafting y dos noches; 2 sin rafting y una noche; cena común: rafting 10, cena 12, primera noche 12 y segunda 10 en una Booking. Un cambio de servicio o noche no se propaga. | AC-017–019, AC-024, AC-038. |
| E2E-04 — Modificación/cancelación parcial | Solicitud → evaluación por alcance → proveedor cuando necesario → acuerdo/autorización → aplicación parcial registrada; determinación D019/D020 → obligaciones y Refund diferenciados → reevaluación de cierres. | AC-029–043, AC-060–063. |
| E2E-05 — Fondos ajenos y servicio propio | Transferencia → recepción → conciliación/asignación; pago a proveedor y factura dirigida al cliente contrastados; honorarios/costes propios separados; Tararí interno; fianza resuelta si aplica. | AC-023, AC-025–028, AC-035–036, AC-044–049. |
| E2E-06 — Efecto sensible incierto | Propuesta IA → revisión humana → aprobación exacta → intento → timeout; resultado incierto y trabajo persistido; comprobación del efecto previo antes de recuperar/reintentar. | AC-053–057, AC-068–073. |
| E2E-07 — Evidencia posterior al cierre | Nuevo documento o discrepancia invalida criterio; evaluación afectada vuelve a pendiente y se retira cierre conjunto actual, conservando el cierre histórico y la operación realizada. | AC-046, AC-061–063. |

## 10. Functional Requirements

### 10.0. Convención de lectura y verificación

Cada fila SPEC-FR es un requisito estable. La columna central expresa precondición, comportamiento y resultado. La siguiente recoge fallo o incertidumbre relevante; se aplican además G1–G6 de §11, idempotencia/concurrencia de §§17–18 y clases E1–E8 de §19 a **todos** los efectos materiales, aunque no se repitan en cada fila. E1: guarda/permiso; E2: conflicto; E3: evidencia insuficiente; E4: resultado incierto; E5: error técnico confirmado; E6: dependencia externa no disponible; E7: ambigüedad; E8: discrepancia externa. Los identificadores de fuente se localizan en §3 y la matriz de §28.

Un dato desconocido se mantiene pendiente. Un permiso denegado no expone información protegida al explicar el rechazo. Registrar realidad acreditada con anomalía conserva el hecho y abre revisión; nunca fabrica el cumplimiento previo de una guarda.

### 10.1. Identidad y relaciones

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-ID-001 | Con procedencia conocida, registrar Contact incompleto, Organization opcional y Group contextual diferenciados; conservar cliente, pagador y participante según evidencia, sin equipararlos. | E3/E7 bloquean solo atribución/acción dependiente. | BR-CON-001–003; DM-INV-001–002. |
| SPEC-FR-ID-002 | Ante designación verificable, asociar Primary Contact al expediente y momento; un cambio conserva el responsable anterior y las aceptaciones que realizó. | Sin facultad/identidad comprobada, E3; no reatribuir historia ni conceder acceso. | BR-CON-004; DM-INV-003–004. |
| SPEC-FR-ID-003 | Detectar candidatos a duplicado por señales de nombre/teléfono/email; solo fusión humana revisada, con ambas identidades, relaciones, procedencia e historiales recuperables. | Coincidencia exacta no prueba identidad; E7; sin fusión automática. | BR-CON-005–006; DM-INV-003/051; D017. |
| SPEC-FR-ID-004 | Solicitar/asociar nombres y datos adicionales solo por necesidad justificada del servicio/noche; vincular Participant con Contact solo si identidad verificada; admitir cantidades sin fichas ficticias. | Necesidad no acreditada impide tratamiento; lista incompleta no impone bloqueo global. | BR-PAX-004/007; DM-INV-015; C P10. |
| SPEC-FR-ID-005 | Generar identidades estables y códigos humanos únicos, correlativos anuales, buscables y no reutilizables para Opportunity, Proposal, Booking e Incident; conservarlos al archivar/fusionar/anular. | Repetición/conflicto no produce código competidor; no exigir códigos humanos a todos los conceptos. | BR-ID-001–002; DM §8.1. |

### 10.2. Comercial

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-COM-001 | Registrar Lead con origen/contexto y convertirlo cuando haya método válido de contacto, necesidad/evento identificable y posibilidad comercial real; conservar vínculo y responsable. | Sin un mínimo, E3; sin scoring ni fecha/personas/presupuesto definitivos obligatorios. | BR-LEAD-001–004; SM-OP-01; DM-INV-005. |
| SPEC-FR-COM-002 | Registrar Opportunity para reserva directa por Administrador con los mismos mínimos, reutilizando identidades/contexto conocidos; no fabricar Lead. | Falta de mínimos impide Opportunity válida o compromiso dependiente. | D018; SM-OP-01 y §6.1. |
| SPEC-FR-COM-003 | Cambiar estado comercial solo con origen, actuación y evidencia de SM-OP-02–07/11; registrar envío y negociación exactos; Ganada exige Acceptance verificada del alcance. | E1/E3; no simular etapas, pago ni confirmación operativa. | BR-DIM-001/003; SM §4; DM-INV-006. |
| SPEC-FR-COM-004 | Al perder, exigir motivo aprobado o desconocido explícito y conservar comunicaciones/alternativas; rechazar una alternativa no pierde toda la Opportunity por inferencia. | Sin motivo, E1; no inventar causa a partir del silencio. | BR-LEAD-005; SM-OP-08. |
| SPEC-FR-COM-005 | Pausar con motivo/contexto y estado previo; reactivar por nuevo interés o decisión documentada hacia progreso sustentado actualmente, conservando pérdida/pausa y revisando vigencias materiales. | No salto directo a Ganada por aceptación antigua ni renovación automática. | SM-OP-09–11; DM-INV-007. |

### 10.3. Catálogo mínimo del expediente

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-CAT-001 | Mantener Service/Variant y categorías/atributos/asignaciones configurables y versionados cuando materiales; distinguir propio/externo y conservar versiones utilizadas en propuestas/prestaciones. | Cambiar catálogo no reclasifica una prestación histórica; datos sin fuente quedan pendientes. | D010; BR-SVC-001; DM-INV-028. |
| SPEC-FR-CAT-002 | Expresar cada cantidad con Unit Definition y Pricing Form/Basis aplicadas; preservar unidades de personas, vehículos, alojamiento completo, grupo/servicio fijo o combinaciones verificadas. | Sin unidad/regla material, E3; no aplicar personas × precio/persona por defecto. | BR-SVC-006; DM §5.1; DM-INV-029. |
| SPEC-FR-CAT-003 | Mantener Provider, contactos y Provider Offering con servicio/variante, condiciones, lugar, fuente y vigencia pertinentes, sin duplicar persona/organización por su función. | Offering no acredita capacidad, opción ni confirmación; E3/E8. | BR-SUP-001–004; DM §5.1. |
| SPEC-FR-CAT-004 | Mantener Tariff/Tariff Version con fuente, vigencia, variantes, tramos, importes y reglas; fijar versión utilizada y distinguir previsto/confirmado/real. | Tabla maestra incompleta, tarifa vencida o coste material incierto: verificar antes del cálculo/compromiso dependiente. | BR-ECON-001/006–007; DM-INV-028. |
| SPEC-FR-CAT-005 | Componer Pack/Pack Version reusable o modalidad personalizada; paso de personalización a maestro solo manual y trazable; conservar composición/versiones usadas. | No modificar histórico ni exigir maestro para preparar una venta. | BR-PACK-001–002; DM-INV-024. |
| SPEC-FR-CAT-006 | Con regla aprobada, aplicar Promotion Version conservando elegibilidad, alcance y cálculo; solo novio/a gratis es promoción automática actualmente aprobada y se somete a SPEC-FR-ECON-012. | Sin condición o modalidad necesarias, E3; no crear promociones automáticas nuevas. | BR-PROMO-001–002; D019; DM-INV-027. |
| SPEC-FR-CAT-007 | Aplicar reglas versionadas de capacidad/elegibilidad/documentación pertinentes; recomendación por público/prioridad es comercial y no sustituye restricciones objetivas. | Falta/incumplimiento material bloquea solo compromiso afectado; no umbrales inventados. | BR-SVC-005–006; BR-PAX-005/007; BR-DOC-004; DM-INV-018/043. |

### 10.4. Propuestas

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-PROP-001 | Con Opportunity identificada, preparar Proposal/alternativas y revisiones conservando origen, alcance y pendientes; ninguna alternativa elimina las otras. | Datos insuficientes bloquean fijación/compromiso dependiente, no toda preparación. | BR-PROP-001–002; SM-PV-01. |
| SPEC-FR-PROP-002 | Fijar Proposal Version con modalidades, composición, cantidades por servicio/noche, precios/fuentes, términos, emisión y vencimiento reproducibles; lo fijado es inmutable incluso antes de aceptar. | Cambio material requiere nueva versión; fijar no certifica datos ni envío. | SM-PV-02/06; DM-INV-008/028. |
| SPEC-FR-PROP-003 | Obtener cantidades exactas desde inclusiones/exclusiones de modalidades y conservar su contribución al alcance; presentación comercial de packs: precio final por persona, participantes e incluidos por modalidad. | No revelar descomposición interna ni convertir componente fijo en tarifa por persona. | BR-PACK-002–003; DM-INV-024–025. |
| SPEC-FR-PROP-004 | Aplicar validez configurable de 7 días por defecto y límite más restrictivo de precio/disponibilidad/opción material; al caducar abrir revisión; revalidación ratifica solo el acto comprobado. | No prorrogar fecha histórica; nueva vigencia ofrecida como condición exige nueva versión. | BR-PROP-004; SM-PV-04–06; DM-INV-011. |
| SPEC-FR-PROP-005 | Para propuesta definitiva exigir datos materiales verificables y coste final relevante confirmado si afecta al precio; conservar precio calculado y final manual con actor/momento/motivo. | Estimación solo con regla aprobada/etiqueta; sin redondeo comercial automático ni ajuste silencioso de costes. | BR-PROP-003; BR-PACK-004; BR-ECON-001/003. |
| SPEC-FR-PROP-006 | Registrar envío solo con evidencia de versión/destinatario y autorización aplicable; preservar envío, recepción y respuesta como hechos separados. | E3/E4/E6 no acreditan envío/aceptación; no exige envío digital si otro canal acredita acuerdo exacto. | SM-PV-03/07; SM-CO-04–06. |
| SPEC-FR-PROP-007 | Vincular sustitución, rechazo y motivo conocido por alcance; antes de retomar versión sustituida/rechazada verificar qué se vuelve a ofrecer y su vigencia; cambios materiales crean versión. | No seleccionar no significa rechazar; sustitución/caducidad no anulan Acceptance histórica. | SM-PV-06/08 y §5; DM-INV-008. |

### 10.5. Acceptance

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-ACC-001 | Registrar Acceptance identificada e inmutable con aceptante/facultad, Proposal/Version, términos exactos, alcance, canal, momento del acto y registrador/momento de registro; verificación explícita habilita Ganada. | Candidato ambiguo o sin identificación material permanece Communication/Review, sin Acceptance válida. | SM-AC-01–02; DM-INV-009–010. |
| SPEC-FR-ACC-002 | Verificar evidencia inequívoca de WhatsApp del responsable, email, formulario/web, anticipo ligado o llamada registrada por autorizado; comprobar vigencia al acto o revalidación previa. | Silencio/leído/justificante aislado no bastan; no escrito posterior obligatorio a llamada válida ni revalidación retroactiva ficticia. | BR-PROP-005/008; SM §§5/14.2. |
| SPEC-FR-ACC-003 | Aceptación total o parcial identifica exactamente partes/modalidades/alcances; parcial solo si expresamente seleccionables en esa versión. | Parte no seleccionable requiere nueva Proposal Version previa a Acceptance; resto no contratado ni rechazado implícitamente. | D018; SM §5.1; SM-AC-01–02. |
| SPEC-FR-ACC-004 | Con error acreditado y revisión humana, enlazar rectificación/anulación por error, original, motivo y reevaluación de dependencias. | Cambio de opinión sigue modificación/cancelación; rectificar no revierte proveedor o banco. | SM-AC-03; DM-INV-008–010. |
| SPEC-FR-ACC-005 | Si un anticipo sustenta aceptación y pago, vincular la misma evidencia y verificar cada hecho por separado; guardar términos/mandato solo efectivamente existentes y aceptados. | Human Approval, pago o confirmación del proveedor no reemplazan Acceptance ni crean mandato. | BR-DOC-005; SM §14.2; D013/D018. |

### 10.6. Conversión y Booking

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-BOOK-001 | Con Opportunity aceptada, Proposal/Version, términos y Acceptance válidos, crear una Booking Pendiente de preparación con únicamente alcance aceptado y procedencia/certidumbre intactas. | E1/E3; nunca Booking visible con cadena obligatoria ausente. | D018; SM-BK-01; DM-INV-012. |
| SPEC-FR-BOOK-002 | Reserva directa del Administrador genera/registra o reutiliza cadena completa según hechos reales; evita Lead, pasos, fechas, envíos y aceptaciones ficticios. | Sin evidencia comercial, preparar cadena pero no completar alta como venta aceptada. | SM §6.1; D018. |
| SPEC-FR-BOOK-003 | Ante intentos equivalentes, también concurrentes, reconocer la Booking existente para Opportunity; N modalidades/servicios/noches/cantidades permanecen en esa Booking. | Clave con contenido distinto es E2; no segunda Booking, split/merge ni nueva por modificación ordinaria. | SM-BK-01; ARCH §12; D018. |
| SPEC-FR-BOOK-004 | Evaluar preparación/cobertura parcial/completa desde servicios críticos necesarios justificados y condiciones económicas aplicables, revisiones y requisitos imprescindibles; excepción económica autorizada conserva motivo. | Sin confirmación crítica no se confirma conjunto; excepción de cobro no dispensa seguridad/capacidad. | SM-BK-02–05; DM-INV-023/031. |
| SPEC-FR-BOOK-005 | Registrar inicio/finalización/cancelación con evidencia por alcance; ejecución sobrevenida sin confirmación se conserva con revisión/incidencia, sin permiso retroactivo; Incidencia se superpone a fase real. | Fecha prevista no prueba ejecución; parte ejecutada no se borra con cancelación total ni se restaura confirmación perdida. | SM-BK-06–11; DM-INV-006/038/041. |

### 10.7. Prestaciones, cantidades y operación

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-SVC-001 | Crear Booking Service por prestación con origen aceptado/modificación válida, servicio/variante, naturaleza, fecha, lugar, proveedor externo si aplica y versiones propias; catálogo repetido no une prestaciones incompatibles. | E3 sobre alcance incierto; no copiar certeza o estado de otra prestación. | SM-BS-01; DM §§4.3/6; DM-INV-013. |
| SPEC-FR-SVC-002 | Mantener cantidades/unidades y Booking Participant Allocation estimadas/confirmadas propias; cambio conserva antes/después y reevalúa dependencias materiales. | Total del grupo o de otra prestación no sobrescribe detalle; asistencias no suman personas distintas. | BR-PAX-001–003/005–006; DM-INV-014/017. |
| SPEC-FR-SVC-003 | Mantener Booking Night y Night Occupancy propias; admitir entradas/salidas diferentes y casa completa sin distribución obligatoria de habitaciones; coste/capacidad según unidad real. | Una noche no sobrescribe/confirma otra ni impone personas × noches como precio. | BR-NIGHT-001–004; DM-INV-016. |
| SPEC-FR-SVC-004 | Asociar lista nominal parcial/completa al recuento del servicio/noche sin sumarla otra vez; justificar diferencias y revisar contradicción entre lista y agregado. | E7/E8; no personas ficticias, lista universal ni duplicado nominal en el mismo alcance. | DM §§4.3/10.2; DM-INV-015. |
| SPEC-FR-SVC-005 | Con fuente, conservar horarios solicitados, franjas, preferencias, alternativas, hora final, duración, llegada y lugar/encuentro aplicados; emitir aviso por incompatibilidad obvia de agenda. | Alternativa no definitiva; excepción justificada del Administrador no dispensa elegibilidad/capacidad. | BR-SVC-007–009; DM-INV-019. |
| SPEC-FR-SVC-006 | Registrar Availability Evidence con consulta/respuesta, fuente, momentos, alcance/unidad, certeza y vigencia informada; verificar cobertura antes del compromiso. | Sin respuesta, negativa, vencimiento o discrepancia abren revisión; disponibilidad no es reserva firme. | SM-AV-01–04; DM-INV-020. |
| SPEC-FR-SVC-007 | Registrar Capacity Hold concedido y su ciclo de vigencia, aviso, prórroga y liberación con evidencia; puede preceder a Booking y conservar vínculo al convertir. | Sin vencimiento, tarea de revalidación; caducidad/petición/aviso no prueban liberación ni opción confirmada. | SM-HO-01–07; DM-INV-021. |
| SPEC-FR-SVC-008 | Verificar Provider Confirmation por respuesta inequívoca de canal admitido o llamada registrada sin escrito posterior obligatorio; fijar hecho y cobertura material exactos. | Mensaje ambiguo es revisión; cambio/corrección enlaza nueva evidencia sin editar original ni ampliar cobertura. | SM-PC-01–03; SM-BS-04; DM-INV-022. |
| SPEC-FR-SVC-009 | En servicio propio, incluido Tararí, documentar capacidad, confirmación, preparación y ejecución separadas con responsable interno. | Naturaleza interna no confirma nada automáticamente ni exige Provider/suplido/factura externa ficticios. | SM §7; BR-TAR-001; DM-INV-036. |
| SPEC-FR-SVC-010 | Ante cambio material o caducidad, conservar último hecho confirmado y abrir Pendiente de revalidación solo sobre lo afectado; ratificar, confirmar nuevo alcance, rechazar o mantener incertidumbre según prueba. | Resolver horario no valida precio/capacidad; rechazo no restaura cobertura anterior sin comprobarla. | SM-RV-01–04; SM-BS-05/06/10; DM-INV-017. |
| SPEC-FR-SVC-011 | Registrar preparación, dependencias, ejecución y cancelación por partes con evidencia; solo marcar Ejecutado/Cancelado en alcance cubierto y conservar prestación restante/incidencias. | No convertir fecha prevista o confirmación en prestación ni borrar parte ejecutada al cancelar resto. | SM-BS-07–11; BR-SVC-004. |

### 10.8. Modificaciones y cancelaciones

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-CHG-001 | Registrar Booking Modification solicitada por cliente/proveedor/interno, facultad contextual, causa, alcance y antes/después deseado; evaluar impacto comercial, operativo y económico separado. | Solicitud no cambia cantidades, acuerdo ni proveedor; E3/E7. | SM-MO-01–02; DM-INV-038. |
| SPEC-FR-CHG-002 | Para efecto dependiente del proveedor, conservar solicitud enviada, respuesta, alternativa y revisión; volver a evaluación solo con información suficiente. | Respuesta ambigua mantiene pendiente; petición del cliente no confirma al proveedor. | SM-MO-03–04; BR-SUP-004. |
| SPEC-FR-CHG-003 | Administrador aprueba aplicación concreta con impactos/evidencias conocidos, acuerdo del cliente y confirmación externa cuando el efecto los requiere; aplicar solo partes cubiertas y registrar resultado parcial. | Aprobada no es Aplicada; importe indeterminado no bloquea efecto operativo independiente ni autoriza ajuste económico. | SM-MO-05–06; D019. |
| SPEC-FR-CHG-004 | Rechazar con motivo o retirar antes de aplicación tras verificar efectos pendientes; cambio material vuelve a evaluación; lo aplicado se corrige por actuación enlazada. | No ocultar aplicación parcial/resultado externo incierto ni restaurar cobertura antigua por rechazo. | SM-MO-07–10; C P07. |
| SPEC-FR-CHG-005 | Cancelación delimita Booking/servicio/personas/modalidad/noches y conserva lo no cancelado; acreditar proveedor o responsable interno para efecto operativo correspondiente. | Cancelación del conjunto no se deduce de petición total; no Refund automático ni borrado de ejecución previa. | SM §12.1; SM-BS-09; DM-INV-038/040. |
| SPEC-FR-CHG-006 | Determinar derecho contractual por causa y política aceptada: causa Huescaventura/proveedor devuelve 100 % del alcance; voluntaria ≥7 días devolución correspondiente, ≥3 y <7 retención 50 %, <3 retención/cobro 100 %. | No reembolsable solo prevalece en voluntaria si fue expresamente aceptada; no-show/supuestos BR-CHANGE-007 sin devolución, con evidencia; sin recargos inventados. | BR-CHANGE-005–007; SM §12.2; DM-INV-039. |
| SPEC-FR-CHG-007 | Para cancelación total individual por persona, usar precio real de su modalidad; fijo/grupal permanece salvo regla contractual aprobada, reducción real verificada o ajuste comercial explícito aprobado y trazable. | No media del grupo ni división automática entre asistentes. | D019; SM §12.2; SM-FORB-26. |
| SPEC-FR-CHG-008 | Para componente parcial usar valor comercial atribuible verificable; si falta, exigir determinación económica explícita del Administrador antes de devolución/retención/nueva obligación/ajuste, con base y evidencia reproducibles. | E3 solo sobre economía dependiente; ubicación/consumo de fondos no determina el derecho ni permite prorrateo implícito. | D019; SM-MO-05–06; SM-RF-02; SM-RC-02. |
| SPEC-FR-CHG-009 | Evaluar intervalos con fechas locales/días naturales y referencia por alcance según §11.2; conservar política, fechas, cálculo y reevaluación ante cambio de fecha. | No cortes por hora ni 168/72 horas; cambiar solo hora no cambia intervalo ni decisiones históricas ejecutadas. | D020; SM §2.4/12.2; SM-FORB-33. |

### 10.9. Economía operativa y reservada

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-ECON-001 | Aplicar Payment Policy Version configurable por servicio, proveedor, tipo y caso a Payment Schedule y Expected Payments con base, importe, alcance y referencia: 50 % al confirmar y 50 % a 7 días; a menos de 7 días, 100 % antes de confirmar salvo excepción autorizada con actor/momento/motivo. | Previsión no crea movimiento; fecha/importe desconocidos bloquean solo obligación dependiente. | BR-PAY-002; SM-EP-01/04; D020. |
| SPEC-FR-ECON-002 | Evaluar cobertura pendiente/parcial/completa desde porciones verificadas; saldo general y cifra final global usan primer servicio contratado; vencimiento tras concluir día límite completo. | No declarar vencido por hora del servicio ni cancelar/cobrar automáticamente por vencer. | SM-EP-02–03; SM §13.2; D020. |
| SPEC-FR-ECON-003 | Detectar Customer Payment una vez por movimiento y conservar pagador/contexto, importe, fecha, método, referencia y fuente conocidos; recepción verificada requiere contraste autorizado. | Aviso/promesa/justificante no certifica recepción; dos transferencias reales iguales siguen siendo dos movimientos. | SM-CP-01–03/05–06; DM-INV-030. |
| SPEC-FR-ECON-004 | Proponer Reconciliation y validarla solo con recepción y correspondencia de identidad/contexto, importes, referencias y obligaciones; duda requiere revisión humana; parte comprobada no concilia el resto. | E3/E7/E8 mantienen porción dudosa sin uso; no cuadrar cifras silenciosamente. | SM-CP-04–06; SM-RC-01–04. |
| SPEC-FR-ECON-005 | Payment Allocation identifica porción, destino y finalidad dentro del expediente, prevista o comprobada; permitir varios pagos por vencimiento y destinos por pago sin sobreasignar/consumir dos veces. | Saldo no asignado no acredita obligación; sin financiación supuesta ni compensación entre reservas/clientes. | DM §11.2–11.3; SM §9.3; ARCH §12.2. |
| SPEC-FR-ECON-006 | Corregir pagos/conciliaciones/asignaciones con original y ajuste; conservar bruto recibido, devuelto, consumido y disponible por finalidad; reevaluar obligación y cierres según causa. | No deshacer transferencia con estado ni crear deuda automáticamente por devolución. | SM-CP-07–08; SM-RC-03–04; SM-EP-04. |
| SPEC-FR-ECON-007 | Registrar Refund solicitada o debida sin petición previa, determinar derecho/importe D019/D020 y autorizar importe/destinatario/medio/porción concretos, normalmente por el mismo medio del cobro; acreditar ejecución total/parcial con movimiento. | Cancelación/aprobación/Incident resuelta no ejecutan; incertidumbre obliga verificar; retirada no extingue derecho debido. | SM-RF-01–07; DM-INV-040. |
| SPEC-FR-ECON-008 | Con condiciones verificadas, distinguir fianza No aplica/Requerida, entrega/receptor, resolución, retención efectiva motivada y devolución real por porciones; enlazar Refund si representa el mismo movimiento. | Desconocida no es cero; entregada no es anticipo; retención parcial no devuelve resto ni duplica movimiento. | SM-DE-01–08; DM-INV-037. |
| SPEC-FR-ECON-009 | Gestionar Suplido/Managed Client Funds por cliente/proveedor/servicio con importe, fondos asignados, documento y pago separados; mandato solo si existe y fue aceptado. | Modelo operativo pendiente de validación profesional; fondos ajenos no son ingreso/coste propio por defecto. | D013; SM-SU-01–04; DM-INV-032–033/052. |
| SPEC-FR-ECON-010 | Registrar Provider Invoice dirigida al cliente: necesidad, recepción, revisión de emisor/destinatario/importe/alcance y vinculación comprobada; discrepancia reabre revisión; conservar original/corrección. | Archivo/enlace preliminar no acredita revisión/pago; varios servicios requieren porciones verificables, no un archivo = un pago. | SM-PI-01–05; DM-INV-034. |
| SPEC-FR-ECON-011 | Provider Payment distingue pendiente/programado/pagado e incidencia; antes de ejecutar verificar fondos/asignaciones y autorización; registrar pagos reales parciales, saldo y evidencia aun si falta factura. | Falta de factura deja abierto cierre documental; programar no mueve fondos; resultado incierto impide repetición peligrosa. | SM-PP-01–06; SM-SU-02–04. |
| SPEC-FR-ECON-012 | Promoción novio/a gratis exige despedida, mínimo 15 asistentes y pack completo con alojamiento, actividad, restaurante y 2 copas Tararí; gratuidad igual al precio final por persona de la modalidad identificada del/de la novi@. | Sin modalidad, no efecto definitivo; no medias, selección automática ni reducción de asistentes/cantidades/deudas externas. | BR-PROMO-001–002; SM §5.2; D019. |
| SPEC-FR-ECON-013 | Conservar Fee/Honorarium e Internal Cost por regla y alcance, previsto/confirmado/real; admitir mecanismos aprobados fijos, por persona, por reserva o variables. El snapshot reconstruye cantidades/unidades, tarifas, promociones, precio calculado/final manual y rentabilidad operativa principal: honorarios propios menos costes propios atribuibles. | Coste desconocido no es cero ni rentabilidad definitiva; no usar total gestionado como ingreso propio ni reinterpretar tarifa histórica. | BR-ECON-001–007; DM-INV-026/028/035; C P20. |
| SPEC-FR-ECON-014 | Usar EUR e indicación IVA incluida/excluida explícita, base/impuestos/total cuando necesarios y 2 decimales visibles/cobrados; conservar precisión interna pertinente y Tararí como propio con cifras aprobadas versionables. | Sin tipos fiscales inventados, redondeo comercial automático ni coste de extras extrapolado; sin factura interna por defecto. | D010/D013; BR-ECON-007; BR-TAR-001–003; DM-INV-029/036. |

Las cifras Tararí aprobadas son configuración histórica identificada, no tarifa externa actual verificada por esta Spec: conjunto de 2 copas, valor comercial 15 EUR y coste interno estándar 3,80 EUR; extra 25 copas, 25 × 7 = 175 EUR; extra 50 copas, 50 × 6,50 = 325 EUR. Los costes de los extras siguen desconocidos. El conjunto de dos no expresa un valor por copa; extras e incluidos se conservan separados (BR-TAR-002–003).

### 10.10. Cierres

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-CLOSE-001 | Evaluar Commercial Closure y Operational Closure por separado dentro de Booking: condiciones finales resueltas; prestación/cancelación acreditadas y sin pendientes críticos respectivamente; conservar criterios, evidencia, actor y momento. | Ganada/Finalizada no resuelven automáticamente una evaluación; No aplica se justifica por criterio. | SM-CL-01–02; BR-CLOSE-001. |
| SPEC-FR-CLOSE-002 | Resolver Economic Closure solo con lo debido pagado, suplidos conciliados/documentados, honorarios registrados, Refund y fianzas resueltas y sin incidencia económica abierta cuando aplican. | Pagado sin factura, devolución pendiente o coste desconocido no se ocultan; no fabricar factura para Tararí. | SM §15; SM-SU-03; DM-INV-034–042. |
| SPEC-FR-CLOSE-003 | Declarar Closed / Historical solo con las tres evaluaciones resueltas y guarda de críticas; excepción crítica requiere justificación explícita auditada del Administrador con alcance/motivo/responsable. | Excepción no suple documentos, pagos/devoluciones ni incidencia económica abierta; archivado no acredita cierre. | SM-CL-04; BR-INC-002; DM-INV-041–042/051. |
| SPEC-FR-CLOSE-004 | Ante evidencia posterior que invalida criterio, reabrir solo evaluación afectada y retirar cierre conjunto actual; conservar fundamento del cierre anterior y causa de reapertura. | No reescribir aceptación/ejecución ni activar por ello un contrato nuevo. | SM-CL-03/05; C P07. |

## 11. Common Guards and Invariants

### 11.1. Guardas de toda operación material

| Guarda SM | Comprobación exigida por SPEC 001 | Resultado observable si no se satisface |
|---|---|---|
| G1 — Identidad/alcance | Actor habilitado, entidad y porciones afectadas; permisos por acción/finalidad/destinatario, también en lecturas. | E1 o E3 sin efecto autorizado ni divulgación; registrar causa mínima y contexto permitido. |
| G2 — Veracidad | Fuente, momento, certeza y vigencia suficientes para cada decisión material; estimación solo con regla aprobada. | E3/E7/E8 y parte dependiente pendiente; desconocido no es cero ni hecho confirmado. |
| G3 — Supervisión | Human Approval humana, exacta y vigente para efecto sensible IA; guardas actuales siguen satisfechas. | No ejecución; rechazo o nueva revisión según la causa. |
| G4 — Conservación | Identidad, versión, antes/después, motivo, actores, momentos, evidencia y resultado enlazados. | No confirmar una unidad interna sin su historia necesaria; corrección conserva original. |
| G5 — Independencia | Solo dependencias aprobadas de SM §16; cada destino evalúa guardas propias y alcance. | Ninguna confirmación, conciliación o cierre por arrastre. |
| G6 — Repetición/incertidumbre | Reconocer efecto previo, distinguir conflicto de duplicado, comprobar incertidumbre antes de repetir. | Resultado previo autorizado, E2 o revisión; nunca duplicación sensible. |

DM-INV-001–052 se aplican íntegros dentro del alcance de esta Spec, interpretando D018–D020 conforme a §3. La matriz §28 permite localizar su requisito y criterio. No se autoriza transición adicional por analogía; los datos o decisiones faltantes se localizan sin impedir registrar hechos sobrevenidos acreditados.

### 11.2. Referencias y días naturales — D020

| Evaluación | Referencia por defecto | Guarda verificable |
|---|---|---|
| Saldo general y política de reserva a menos de 7 días | Fecha del primer servicio contratado de Booking. | Saldo admite todo el día situado 7 días antes; solo después está vencido. |
| Cifra final global | Primer servicio contratado de Booking. | 7 días configurables, sin transformar estimación en confirmación. |
| Cifra final específica | Fecha del servicio/alcance correspondiente. | No propagar cifra, deadline ni confirmación a otras prestaciones/noches. |
| Cancelación total de Booking | Primer servicio contratado de Booking. | Aplicar causa, base y política al alcance cancelado. |
| Cancelación de modalidad/participación completa de una persona | Primer servicio incluido en su modalidad. | Precio real de esa modalidad si es por persona. |
| Cancelación de Booking Service | Fecha de ese servicio. | No tomar otra prestación por ser anterior. |
| Noche/alojamiento u otro alcance específico | Fecha de inicio del alcance afectado. | No extender a noches no canceladas. |

Prevalece una referencia contractual expresa, válida y conservada diferente. La zona horaria determina la fecha local pertinente; no se inventa una zona universal ni un corte a las 00:00/check-in/hora de actividad. Las fechas locales separadas exactamente 7 o 3 días reciben completo su intervalo. Cambiar la hora dentro de la misma fecha no afecta estos cálculos; cambiar fecha reevalúa únicamente dependencias y conserva decisiones históricas. Vigencias explícitas de proveedores se respetan según su propia evidencia, sin convertir todos los vencimientos externos en la política D020.

## 12. State / Transition Requirements

El Core debe poder evaluar las tablas completas de las familias de SM que siguen, respetando sus orígenes, guardas, hechos y efectos. Los requisitos concretan el resultado comprobable; no copian ni sustituyen la máquina normativa. Una condición Incidencia o Pendiente de revalidación conserva fase y último hecho acreditado. No se fuerza un estado global ni una entidad por cada estado.

| Ámbito | Transiciones fuente | Requisitos verificables |
|---|---|---|
| Comercial | SM-OP-01–11 | SPEC-FR-COM-001–005; estados aprobados, pausa/pérdida/reactivación con contexto y Ganada por Acceptance. |
| Propuestas y aceptación | SM-PV-01–08; SM-AC-01–03 | SPEC-FR-PROP-001–007, SPEC-FR-ACC-001–005; contenido fijado, envío, vigencia, respuesta y sustitución separados. |
| Booking | SM-BK-01–11 | SPEC-FR-BOOK-001–005; preparación, parcial/completa, inicio, finalización y cancelación acreditados. |
| Prestaciones y revisión | SM-BS-01–11; SM-RV-01–04 | SPEC-FR-SVC-001–005/009–011; solo el alcance cubierto cambia. |
| Disponibilidad y compromisos | SM-AV-01–04; SM-HO-01–07; SM-PC-01–03 | SPEC-FR-SVC-006–008; petición, opción, cobertura, prórroga y liberación diferenciadas. |
| Obligaciones y movimientos | SM-EP-01–04; SM-CP-01–08; SM-RC-01–04 | SPEC-FR-ECON-001–006; Esperado no es fase de un cobro inexistente. |
| Proveedor y fondos | SM-PI-01–05; SM-PP-01–06; SM-SU-01–04 | SPEC-FR-ECON-009–011; documento, programación, pago y cierre documental separados. |
| Devolución y fianza | SM-RF-01–07; SM-DE-01–08 | SPEC-FR-ECON-007–008; derecho, autorización, entrega/ejecución y resolución por porciones. |
| Cambios | SM-MO-01–10 | SPEC-FR-CHG-001–009; solicitud, evaluación, proveedor, aprobación, aplicación, rechazo y retirada. |
| Coordinación | SM-DO-01–05; SM-TA-01–05; SM-IN-01–06 | SPEC-FR-COORD-001–006; Task Pendiente/Completada/Cancelada, vencimiento aparte; Incident Abierta/En gestión/Resuelta/Cerrada, gravedad aparte. |
| Comunicación y aprobación | SM-CO-01–06; SM-HA-01–03 | SPEC-FR-COORD-007, SPEC-FR-HA-001–005; no secuencia ficticia de borrador para entrada recibida. |
| Cierre | SM-CL-01–05 | SPEC-FR-CLOSE-001–004; Pendiente/Resuelto por dimensión, cierre conjunto y reapertura. |

Las prohibiciones SM-FORB-01–33 forman parte del contrato negativo (§23 y §28.3). Un proceso puede registrar evidencia de ejecución excepcional conforme a SM-BK-07, SM-BS-08, SM-PP-04 y SM §11.1 sin inventar una autorización previa ni habilitar por ello el camino irregular.

## 13. Conceptual Data Requirements

Los requisitos de información son lógicos; no definen campos físicos ni hacen obligatorios todos los datos en todas las etapas.

| Grupo | Información mínima necesaria para reconstruir el comportamiento | Autoridad / límites |
|---|---|---|
| Identidades y contexto | Identidad estable, relaciones/facultades contextuales, procedencia y cambios; datos conocidos y pendientes diferenciados. | Contact, Organization, Group y CRM Actor conservan sus identidades. SPEC-FR-ID-001–005. |
| Compromiso comercial | Cadena Lead cuando exista → Opportunity → Proposal/Version → modalidades/composición/términos → Acceptance verificada → Booking; alcance exacto e historial de alternativas. | Versiones fijadas/snapshots, sin referencias vivas que reinterpreten lo aceptado. SPEC-FR-PROP y SPEC-FR-ACC. |
| Catálogo aplicado | Identidad y versión de servicio/variante, clasificación, unidades, forma de precio, fuente, vigencia, tarifa, pack, promoción y requisitos utilizados. | Cambiar maestros no actualiza prestaciones/cálculos históricos. SPEC-FR-CAT-001–007. |
| Operación | Prestación, cantidades/unidades y certeza, asignaciones nominales opcionales, noches y ocupaciones, horario/lugar, dependencias, cobertura de evidencia, progreso y revisión. | Booking Service/Night gobiernan detalle; grupo/calendario son referencias/proyecciones. SPEC-FR-SVC. |
| Economía | Política/vencimientos, movimientos/porciones/destinos, obligación vs fondos reales, derecho de devolución, facturas externas, pagos, garantía, remuneración/coste propios y snapshots. | No duplicar un movimiento por sus estados, por vínculos o por representar Refund/fianza. SPEC-FR-ECON. |
| Evidencia y cambios | Original/derivado, finalidad/permisos, fuente, momento del hecho y registro, registrador/solicitante/aprobador/ejecutor, antes/después, motivo y resultado. | Conservación sujeta a política autorizada; no historial destruido ni retención ilimitada. SPEC-FR-HIST. |
| Efecto y trabajo técnico | Identidad de operación/intención/evento, contenido/alcance, relación de aprobación, ejecución/intentos, resultado previo o incertidumbre y revisión. | Persistencia conceptual independiente de memoria de proceso; sin diseño de almacenamiento. SPEC-FR-IDEMP/CONC/HA. |

Toda lectura derivada debe poder identificar si proviene de dato canónico, externo, evidencia o cálculo/proyección. El objeto privado y sus metadatos pueden tener estados de conservación distintos; una referencia no demuestra que el original esté disponible. Las cantidades económicas y operativas mantienen unidades/fuentes y nunca compiten con totales globales editables.

## 14. Versions, Snapshots, History and Evidence

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-HIST-001 | Para cambio material registrar entidad/alcance, hecho/intención, antes/después, motivo, fuente, momentos de hecho/registro y actores diferenciados; creación indica ausencia de valor previo. | No inventar secuencia temporal ni atribuir ejecución automática al aprobador humano. | C P06/P07; BR-HIST-001–005; SM §18. |
| SPEC-FR-HIST-002 | Conservar versiones/snapshots exactos aplicados de propuesta/términos/catálogo/cálculo y referencias al original en correcciones, recálculos, fusiones, cancelaciones o reaperturas. | No mutación retrospectiva ni evento que sustituya el registro original; sin event sourcing obligatorio. | DM §8; ARCH-DEC-016; DM-INV-028/047. |
| SPEC-FR-HIST-003 | Conservar Document/Evidence original autorizado/viable y sus derivados con finalidad, procedencia, revisión, permisos y vínculos múltiples sin duplicación por contexto; llamada manual puede ser evidencia sin archivo/audio. | Adjunto/resumen no verifica negocio ni reemplaza original; sin audio por defecto. | BR-DOC-001–005; BR-COMM-001/005; ARCH §9. |
| SPEC-FR-HIST-004 | Si carga, metadatos u objeto fallan, exponer exactamente qué está conservado y permitir reparación/conciliación manteniendo historia y permisos. | E4/E5/E6; no presentar evidencia ausente como íntegra ni simular atomicidad objeto/registro. | ARCH §9/12.3; ARCH-DEC-010/014. |
| SPEC-FR-HIST-005 | IA conserva Provenance/Review y origen automático al extraer datos claros; dato ambiguo queda candidato; dato confirmado manualmente no se sobrescribe, se abre revisión y tarea. | Confianza de extracción no es aceptación/confirmación; E7/E8 con dato anterior preservado. | BR-AI-001/004–005; DM-INV-046. |
| SPEC-FR-HIST-006 | Ofrecer timeline conceptual reconstruible con referencias autorizadas a hechos originales; archivado recuperable conserva historia/identificadores y no acredita cierre. | Vista unificada no amplía permisos; sin eliminación/anonimización importante por regla no aprobada. | BR-HIST-002–004; BR-SEC-005; DM-INV-047/051. |

## 15. Tasks, Alerts, Incidents and Operational Calendar

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-COORD-001 | Crear/actualizar Task del negocio con causa/contexto, responsable Administrador, prioridad y deadline conocido o pendiente; completar con resultado o cancelar con motivo; reapertura explícita conserva cierre anterior. | Tarea completada/cancelada no acredita hecho ni cancela reserva; deadline desconocido no es vencido. | SM-TA-01–05; BR-TASK-001/003. |
| SPEC-FR-COORD-002 | Con disparador aprobado aplicable, generar seguimiento de bloqueo, anticipo/saldo, proveedor, factura, suplido, documentos, lista necesaria, disponibilidad, modificación, cancelación, propuesta o cifra final. | Misma causa/efecto no duplica tarea; cambios revisan alcance/plazos y conservan origen/versionado. | BR-TASK-004–005; SM-TA-01; D020. |
| SPEC-FR-COORD-003 | Seguimiento de propuesta: recordatorio a 2–3 días y antes de caducar con parámetros conocidos; preparar mensaje supervisado. Cifra final: 7 días configurables, referencia por alcance y día completo. | Parámetro ausente no genera hora/adelanto ficticios; aviso no confirma participantes ni habilita envío comercial autónomo. | BR-PROP-007; BR-PAX-008; SM §13.2. |
| SPEC-FR-COORD-004 | Alert expresa causa/alcance/urgencia; Notification distingue intención, canal/destinatario y entrega. Todas en CRM al Administrador; Críticas/Importantes con intención WhatsApp, ninguna por email. | Proveedor WhatsApp pendiente/no disponible deja entrega externa pendiente y aviso CRM visible; fallo de aviso no crea ciclo de avisos duplicados. | D016; BR-TASK-002/006; ARCH §10. |
| SPEC-FR-COORD-005 | Aplicar Required Document desde requisito versionado y necesidad real; recibido, revisado, no aplica motivado e incidencia diferenciados; cambio de alcance reabre solo exigencia afectada. | Sin revisión suficiente no satisface requisito; no aplica no dispensa requisito imprescindible por conveniencia. | SM-DO-01–05; DM-INV-043. |
| SPEC-FR-COORD-006 | Incident conserva detector, hechos/hipótesis, gravedad, acciones/evidencias y causa final; resolver/cerrar requiere comprobación; reapertura/gravedad revisada conserva motivo e historia. | Crítica En gestión sigue no resuelta; resolver no ejecuta Refund ni cierra Booking; excepción de cierre solo en alcance aprobado. | SM-IN-01–06; BR-INC-001–002. |
| SPEC-FR-COORD-007 | Communication conserva original/contexto y separa borrador/preparada/aprobada de envío, recepción, lectura y respuesta; entrada puede comenzar recibida sin preparación interna; respuesta se evalúa por máquina pertinente. | E3/E4/E7; plantilla no dispensa aprobación sensible ni capacidad externa aún sin verificar. | SM-CO-01–06; BR-COMM-001–006. |
| SPEC-FR-COORD-008 | Derivar calendario operacional de servicios, reservas, horarios, opciones, pagos, tareas/documentos y vencimientos canónicos con fuente/certeza; cambio externo crítico entra como revisión. | Proyección retrasada no autoriza efecto sobre estado obsoleto; Google Calendar no gobierna reserva ni cálculo D020. | BR-TASK-007; ARCH-DEC-007; D020. |

Los disparadores anteriores son automatizaciones específicas internas previstas por el Core, sujetas a aprobación posterior de esta Spec y a datos/configuración verificados. No se activa ningún automatismo aquí. No se fija fecha concreta dentro de 2–3 días, adelanto universal ni cadencia de ejecución. La entrega WhatsApp pertenece a una integración posterior; el Core conserva la intención y su limitación sin afirmar entrega. Las recomendaciones de IA/packs pueden aportar candidatos conforme BR-AI-006, pero no incorporan automáticamente servicios ni amplían el alcance a un motor avanzado de recomendaciones.

## 16. Human Approval

Flujo exigido: **propuesta sensible → revisión humana → aprobación/rechazo → correspondencia exacta de contenido/alcance → intento → ejecución acreditada o incertidumbre/fallo**.

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-HA-001 | Presentar conceptualmente propuesta identificada y revisable con acción, contenido, destinatario, importe, alcance, condiciones y efecto; Administrador autorizado aprueba o rechaza con momento y motivo/contexto. | IA no se autoaprueba; pendiente/rechazada no autoriza efecto. | C P15; SM-HA-01; ARCH §11. |
| SPEC-FR-HA-002 | Antes del efecto verificar correspondencia exacta con versión/alcance aprobados y datos/permisos/estado actuales; cambio material requiere nueva revisión/aprobación conservando la anterior. | Aprobación de contenido obsoleto, destinatario o importe distinto: E1/E2, sin efecto. | SM-HA-02; ARCH-DEC-012. |
| SPEC-FR-HA-003 | Vincular aprobación e intención con cada intento y su ejecución/resultado; identificar ejecutor automático distinto del humano; acreditar solo lo realmente ejecutado. | Aprobada no equivale a ejecutada; E4 sigue pendiente de comprobar. | SM-HA-03; DM-INV-046–048. |
| SPEC-FR-HA-004 | Impedir que reintento/concurrencia consuma dos veces el mismo efecto autorizado; reconocer resultado previo o incertidumbre, permitiendo continuación segura de la parte restante sin repetir la ya ejecutada. | Misma aprobación no es permiso de múltiples cobros/envíos; sin repetición peligrosa, incluso manual. | ARCH §11/12; SM G6. |
| SPEC-FR-HA-005 | Aplicar supervisión a acciones sensibles IA de reserva, cambios, precio, condiciones de proveedor, comunicación vinculante, pagos/reembolsos, revelación personal y permisos; separar Acceptance y Provider Confirmation. | Human Approval no crea acuerdo externo, pago, permiso futuro ni autorización fiscal P16. | D009/D016; BR-AI-002–003; SM §14.3. |

No se prescribe UI, algoritmo de huella ni firma legal. Identidad de versión y contenido/alcance deben permitir comprobar la correspondencia; el diseño físico corresponde a una fase posterior. Las informativas basadas en plantilla no reciben aquí permiso genérico de envío externo automático; el seguimiento de propuestas conserva supervisión V1.

## 17. Idempotency and Duplicate Prevention

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-IDEMP-001 | Identificar operación y efecto por fuente/contexto/alcance; repetición equivalente reconoce/reutiliza resultado previo sujeto a permisos, sin duplicar hechos ni atribuir éxito a pendiente/incierto. | Misma identidad/clave con contenido material diferente: E2 y revisión, sin reutilización silenciosa. | ARCH §12.1; ARCH-DEC-013; SM G6. |
| SPEC-FR-IDEMP-002 | Aplicar lo anterior a Booking, External Events, comunicaciones/acciones externas, pagos, conciliaciones/asignaciones, Refund, Notifications, jobs, automatizaciones y Human Approval/ejecución. | Doble recepción/ejecución no duplica efectos; no promesa de exactly once entre sistemas externos. | ARCH §10–12; BR-AUTO-002; SM-FORB-15/27/31. |
| SPEC-FR-IDEMP-003 | Si falta identificador fiable, conservar señales/evidencias para revisión; distinguir mismo registro repetido de dos hechos reales con datos similares. | Importe/fecha/teléfono iguales no bastan para eliminar pago, fusionar identidad o confirmar duplicado. | ARCH §12.1; SM-CP-06; BR-CON-005. |
| SPEC-FR-IDEMP-004 | Distinguir evento recibido/persistido, efecto pendiente, aplicado, rechazado o incierto; enlazar recepciones repetidas con procesamiento previo y retomar solo lo pendiente seguro. | Evento antiguo/fuera de orden no sobrescribe hecho vigente; eco de cambio propio no reaplica efecto. | ARCH §§6/8.3–8.4/12.1; DM-INV-048. |

El contenido material incluye al menos operación, entidad/alcance, destinatario, importe, versión/condiciones y efecto cuando intervengan. Un intento técnico nuevo no crea derecho a un efecto de negocio nuevo. La deduplicación no sustituye a la fusión humana, la verificación del movimiento ni sus guardas.

## 18. Concurrency and Consistency

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-CONC-001 | Ante solicitudes/jobs/automatismos/eventos simultáneos, comprobar estado/versión material al aplicar; si cambió, detectar conflicto y reevaluar con datos actuales, conservando cambio concurrente. | E2; no overwrite, ni transición no aprobada por éxito de comprobación técnica. | ARCH §12.2; SM G1–G6. |
| SPEC-FR-CONC-002 | Proteger fijación de versiones/Acceptance, creación única Booking, porciones de pagos/asignaciones/conciliaciones/Refund y consumo de Human Approval; resultados concurrentes coherentes con identidades/alcance autorizados. | No dos efectos incompatibles a partir del mismo estado/fondos/aprobación; cada perdedor reconoce resultado o conflicto. | ARCH §12.2; D018/D019. |
| SPEC-FR-CONC-003 | Confirmar juntos o ninguno los cambios internos de una unidad material: hecho vigente, historia necesaria, resultado idempotente e intención externa asociada cuando corresponda. | Fallo intermedio no deja Booking incompleta ni porciones incoherentes; preparación válida previa puede persistir como preparación. | ARCH §12.3; ARCH-DEC-014. |
| SPEC-FR-CONC-004 | Separar consistencia interna de efectos externos/objetos: conservar intención, intento, resultado y conciliación; compensación es nueva actuación autorizada/auditada. | No transacción distribuida ni cambio interno que pruebe entrega; no espera externa dentro de unidad interna. | ARCH §§9/12.3; SM G6. |
| SPEC-FR-CONC-005 | Persistir trabajo/jobs/outbox y reclamarlo de forma segura; ejecución identificada, acotada y reanudable con intentos/resultado; reclamaciones simultáneas no aplican el mismo efecto dos veces. | Caída tras contactar proveedor: retomar comprobando efecto; no depender de memoria o solicitud web viva. | ARCH §10; ARCH-DEC-015. |
| SPEC-FR-CONC-006 | Automatización identifica responsable, trigger, versión, entradas, permisos, efectos y registros; permitir detener/revisar/reintentar seguro o compensar, con límites/pausas configurados y fallo persistente visible. | Sin parámetros verificados, no reintentos ilimitados ni silenciosos; aviso Importante/Crítico en CRM con política externa pertinente. | BR-AUTO-001–002; ARCH §10/13. |

Las unidades materiales se delimitan por el efecto real. Crear Booking íntegra no obliga a confirmar/pagar todos sus servicios. Una modificación puede aplicar su efecto operativo independiente y mantener determinación económica pendiente conforme D019. No se especifican columnas de versión, locks, índices, mecanismo SQL, scheduler, frecuencia, proveedor ni tablas físicas.

## 19. Errors, Revalidation and Uncertainty

| Clase | Cómo distinguirla | Resultado verificable y continuidad |
|---|---|---|
| E1 — Rechazo por guardas/permisos | Se conoce qué precondición o autorización no se satisface. | No aplicar el efecto; causa y acción corregible en contexto autorizado. No reintentar sin subsanar/revisar. |
| E2 — Conflicto de concurrencia/versión | Estado o contenido material difiere del evaluado/aprobado, o misma clave tiene contenido distinto. | Conservar ambos contextos relevantes, no sobrescribir; reevaluación con estado vigente. |
| E3 — Pendiente de revisión por insuficiencia | Falta dato, facultad o evidencia necesaria para decidir. | Identificar lo que falta y la parte dependiente; permitir registro e investigación independientes. |
| E4 — Resultado incierto tras intento | No se sabe si el efecto ocurrió, incluso por timeout o caída del ejecutor. | Conservar intento/alcance, impedir repetición peligrosa, verificar con fuente autorizada y conciliar antes de reintentar. No declarar éxito ni fracaso del efecto. |
| E5 — Error técnico confirmado | Hay evidencia del fallo técnico; su alcance y cualquier efecto acreditado se conocen. | Registrar fallo/causa; reintento limitado solo si seguro. Si se desconoce efecto externo, clasificar ese efecto E4 aunque exista excepción técnica. |
| E6 — Dependencia externa no disponible | Fuente/canal no accesible o capacidad aún no habilitada/verificada. | Mantener pendiente lo dependiente; no afirmar entrega ni inventar respuesta. Si hubo intento de efecto, evaluar además E4. |
| E7 — Dato ambiguo | Varias interpretaciones/identidades/alcances posibles del dato recibido. | Conservar original, alternativas y revisión; no convertir extracción en dato confirmado. |
| E8 — Discrepancia externa | Nueva evidencia contradice importe, documento, disponibilidad o condición antes conocida. | Conservar anterior/nueva y fuente; revisar alcance afectado sin reescribir acuerdo aceptado. |

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-ERR-001 | Cada operación no satisfecha distingue E1–E8 por causa y efecto, con parte afectada, estado conocido y revisión/continuidad posible; admite causas coexistentes sin confundirlas. | No un único resultado genérico que esconda ejecución incierta o cierre como éxito; mantener independientes fuera del bloqueo material. | C P05; ARCH §13.1; SM G2/G6. |
| SPEC-FR-ERR-002 | Tras timeout/intento sensible incierto, consultar/contrastar efecto previo por medios disponibles y autorizados; reintentar solo si se acredita seguridad e idempotencia y siguen válidas autorización/guardas. | Si proveedor no permite verificar o sigue ambiguo, mantener intervención pendiente; ni espera ni permiso manual convierten incertidumbre en fracaso. | BR-AUTO-002; ARCH §§10/13.1; SM-FORB-27. |

Pendiente de revalidación utiliza SPEC-FR-SVC-010 y SM-RV-01–04: conserva último hecho, causa, dependencias, prueba nueva y resultado por alcance. Un error no revierte un hecho económico externo por editar estado. La realidad sobrevenida se registra con revisión/incidencia según sus máquinas, sin dar aprobación retroactiva.

## 20. Security, Privacy and Authorization

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-SEC-001 | Identificar al único Administrador/Propietario por Supabase Auth y relacionarlo con CRM Actor; verificar en servidor autenticación y habilitación vigente en cada lectura/acción. | Autenticado no implica autorizado; rol declarado por solicitante, identificador conocido o relación comercial no conceden acceso. | ARCH §5; ARCH-DEC-004; D015. |
| SPEC-FR-SEC-002 | Aplicar denegación por defecto, mínimo privilegio y controles de servidor complementados por controles de base de datos, incluida RLS en lo expuesto mediante Supabase antes de exponer datos. | Cliente, job o adaptador no eluden permisos; esta obligación no define políticas físicas ni activa roles futuros. | C P10; ARCH §§5/14. |
| SPEC-FR-SEC-003 | Restringir economía interna —costes, márgenes, beneficios, comisiones, honorarios/desgloses— en consultas, documentos, búsquedas, exportaciones, timeline, contexto IA y cualquier salida según finalidad/destinatario. | Acceso total del propietario no autoriza contexto externo; pack comercial respeta BR-PACK-003 incluso si conserva desglose interno. | C P11; BR-SEC-002–004; DM-INV-025/050. |
| SPEC-FR-SEC-004 | Production exige al Administrador MFA cuando la capacidad seleccionada lo soporte; comprobarlo en frontera de autorización pertinente; mantener factores, sesiones y recuperación para diseño posterior. | No declarar Production preparada omitiendo el requisito ni inventar configuración; Development/Staging política proporcional y separada. | ARCH §§5/14; ARCH-DEC-004. |
| SPEC-FR-SEC-005 | Proteger sesiones/transporte, secretos por entorno y objetos privados; acceso a documento/URL temporal exige autorización; limitar entradas/adjuntos a finalidad necesaria y proteger entradas contra abuso/origen no verificado. | No secretos/service-role en cliente, Git, ejemplos o logs; no URLs temporales como identidad permanente; sin límites numéricos inventados. | C P10/P12; ARCH §§6/9/14. |
| SPEC-FR-SEC-006 | Minimizar datos personales por servicio/finalidad/destinatario; archivado recuperable, conservación/anonimización/eliminación solo con política autorizada y auditoría; mantener originales/derivados diferenciados. | No audio por defecto, consentimiento inferido, retención ilimitada ni borrado automático importante sin regla; DM-PENDING-005 vigente. | D016/D017; BR-SEC-003/005; ARCH §14. |
| SPEC-FR-SEC-007 | Mantener fuera del Core la emisión legal/numeración/motor fiscal; documentos externos o borradores autorizados no fiscales conservan su naturaleza y validaciones pendientes. | Ni Administrador, Human Approval o integración levantan P16; sin conclusión nueva de suplidos/Tararí ni mandato supuesto. | C P16; D008/D013; BR-BILL-001–005. |

Los requisitos de seguridad se verifican conceptualmente mediante intentos autorizados y no autorizados (§24), sin diseñar matrices finas, endpoints, esquemas API, políticas RLS, almacenamiento físico o configuración de proveedores.

## 21. Audit and Functional Observability

SPEC-FR-HIST-001–006 y SPEC-FR-CONC-005–006 exigen que una revisión autorizada pueda responder: qué efecto se pretendía; con qué versión/evidencia/permiso; quién aprobó y ejecutó; qué intentos hubo; qué está efectivamente acreditado; qué falta; qué parte puede continuar y por qué.

Para reconstruirlo se relacionan identidad de petición/correlación, evento externo, operación, ejecución y expediente con historia funcional. Los logs técnicos sirven para localizar un fallo, no como sustituto de Acceptance, movimiento o Provider Confirmation. La causa de una alerta y su entrega permanecen separadas; el fallo persistente y los trabajos pendientes de intervención deben ser localizables en contexto autorizado.

Nunca se copian secretos, URLs temporales ni cuerpos completos de comunicaciones/documentos al log. Se minimizan datos personales y se usan referencias con acceso autorizado. No se selecciona plataforma de observabilidad ni se fija volumen, latencia o retención. Fuentes: ARCH §13.2–13.3; C P06/P07/P10/P12/P14; SPEC-NFR-010.

## 22. Core Integration Boundaries

| ID | Precondición, comportamiento y resultado verificable | Fallo / incertidumbre | Fuente |
|---|---|---|---|
| SPEC-FR-INT-001 | Conservar Integration Source, External Reference y External Event con origen, referencia cuando exista, alcance, momento de hecho/recepción, evidencia y resultado de revisión; identidad canónica independiente. | No referencia externa como identidad única ni noticia recibida como confirmación; capacidades sin verificar pendientes. | DM §13; ARCH-DEC-003/006. |
| SPEC-FR-INT-002 | Entrada futura pasa por verificación de origen/alcance, normalización, deduplicación y persistencia coordinada antes de evaluar efecto con guardas; registrar técnicamente recibido separado de aplicado. | Entrada no verificada se rechaza/aísla para revisión de seguridad sin evidencia válida ni efecto; E2/E7/E8 no sobrescriben hechos. | ARCH §6/12.1; SM G1–G6. |
| SPEC-FR-INT-003 | Salida expresa intención genérica, destinatario, contenido/alcance y autorización; futuro adaptador aporta intento/referencia/resultado comprobable y admite sustitución/desactivación conservando historia. | Sin capacidad de verificar entrega, no afirmar recepción; canal caído no bloquea trabajo independiente ni autoriza más efectos. | C P17; ARCH §§7/10/12.3. |
| SPEC-FR-INT-004 | Telefonía y WhatsApp comparten contexto/timeline por vínculos, con adaptadores desacoplados; originales/transcripciones/resúmenes separados; PLAUD es fuente admisible manual cuando autorizada. | ARCH-PENDING-001 sigue PENDING; sin selección de proveedor común/separado ni capacidades asumidas, audio o consentimiento por defecto. | D014/D016; ARCH §8.1/18.1. |
| SPEC-FR-INT-005 | Google Calendar aporta referencias/eventos auxiliares; pagos conservan medio genérico y transferencia actual; futuros email/formularios públicos aportan comunicaciones/señales bajo sus guardas. | Sin integración física, tarjeta elegida ni cambio silencioso de reserva; web/app/repositorio separados sin acceso interno. | D007/D014; ARCH §§8.2–8.4/8.6. |
| SPEC-FR-INT-006 | Frontera Avaibook V1 admite solo consultas/referencias de capacidades verificadas y revisión de discrepancias, respetando autoridad del proveedor. | Rechazar toda intención de crear/modificar/cancelar en Avaibook; no resolver discrepancia escribiendo en él o silenciosamente en CRM. | BR-INT-006; ARCH-DEC-009; SM-FORB-28. |

Este contrato es semántico, sin transporte, endpoint, payload definitivo ni credenciales. La verificación de cada API/conector queda en BR-PENDING-035. La prioridad de D014 no modifica la frontera: las integraciones reales, incluso email, Google Calendar y Avaibook, requieren trabajo posterior. Ningún envío externo se declara implementado por estos requisitos.

## 23. Edge Cases and Forbidden Behaviors

- Identidad dudosa, nueva persona responsable o pagador distinto: conservar contexto y revisar facultad; no fusionar por email/teléfono ni reatribuir aceptación anterior.
- Versión caducada, sustituida/rechazada o aceptación registrada tarde: acreditar contenido y vigencia del acto real, sin revalidación retroactiva ni edición histórica. Selección parcial no prevista exige versión previa nueva.
- Grupo multimodal y precio grupal: una Booking con cantidades/noches propias; gratuidad no reduce asistencia ni obligaciones del proveedor; base D019 sin media/prorrateo implícito.
- Evidencia con cobertura parcial: no ampliar disponibilidad, opción, confirmación, revisión de documento, conciliación o ejecución al resto por el estado general.
- Servicio iniciado excepcionalmente, pago externo sin aprobación registrada o cancelación después de ejecutar una parte: preservar realidad con revisión/incidencia; no falsear confirmación previa ni borrar ejecución.
- Dos transferencias similares y evento duplicado: conservar movimientos reales distintos, reconocer repetición del mismo hecho y evitar consumo concurrente de una porción.
- Documento ausente tras carga/restauración y timeout de efecto sensible: mantener ausencia/incertidumbre explícitas; no éxito técnico presentado como evidencia de negocio ni reenvío ciego.
- Fianza parcialmente retenida, factura pendiente y cancelación con Refund autorizada: cada obligación sigue su prueba propia; Task/Incident/cierre comercial no la satisfacen.
- Crítica en gestión, archivado o Booking Finalizada: no acreditan cierre conjunto. Justificación de crítica no dispensa pagos, documentos ni devolución debidos.
- Conector fuera de orden, calendario externo o Avaibook: no regresión por orden de recepción, cambio silencioso ni escritura Avaibook. No capacidades de envío/lectura/conciliación supuestas.
- Cliente autenticado hipotético, rol futuro o contexto IA: no autorización interna ni acceso a economía por relación; no facturación legal, audio por defecto o eliminación importante por conveniencia.

SM-FORB-01–33 siguen íntegros como fuente normativa; §28.3 enlaza todas sus prohibiciones con criterios negativos concretos. Estas reglas no habilitan operaciones extraordinarias ni añaden una vía de elusión por excepción técnica.

## 24. Acceptance Scenarios / Acceptance Criteria

**Estado de todos los criterios: definidos para revisión; pruebas de implementación NO EJECUTADAS.** Cada fila se comprueba antes de implementar recorriendo sus datos de entrada, guardas y resultado contra las fuentes. Tras aprobación, el plan deberá derivar pruebas proporcionales al riesgo sin cambiar estos resultados. Los números de ejemplo son datos sintéticos de contraste, no tarifas, capacidades o clientes reales nuevos. Todos los casos asumen las restantes guardas satisfechas salvo la que se pone a prueba.

En casos de efecto material, además del resultado indicado se exige verificar historial, alcance, actor, evidencia y ausencia de efectos colaterales no autorizados. Los casos concurrentes deben contemplar ambos órdenes posibles y solapamiento, así como repetición después de perder la respuesta.

### 24.1. Identidad, comercial y aceptación

| ID | Dado / cuando | Entonces: resultado y límite comprobables | Requisitos |
|---|---|---|---|
| AC-001 | Falta coste verificable de S1, pero existe necesidad/contacto y datos suficientes de S2; se prepara la venta y se intenta comprometer precio de S1. | La venta/S2 pueden continuar; compromiso de S1 pendiente por dato identificado, sin convertir coste desconocido en cero. | SPEC-FR-ID-001, SPEC-FR-COM-001, SPEC-FR-PROP-005, SPEC-FR-ERR-001. |
| AC-002 | Una organización cambia de interlocutor y el pagador no participa; se actualiza Primary Contact. | Se mantienen identidades/funciones separadas, historia de organización/personas y aceptante anterior; nuevo interlocutor sin permisos internos. | SPEC-FR-ID-001–002. |
| AC-003 | Dos contactos comparten email/teléfono; se propone fusión y después el Administrador verifica la identidad y la ejecuta. | Primero solo candidatos; tras acción humana se conservan ambas identidades/historias/relaciones y procedencia, sin fusión automática. | SPEC-FR-ID-003, SPEC-FR-IDEMP-003. |
| AC-004 | Lead con contacto válido, necesidad identificable y posibilidad real, sin fecha/cantidad final ni scoring; se convierte. | Opportunity Nueva enlazada al origen; si falta cualquiera de esos tres mínimos queda pendiente de completarlo. | SPEC-FR-COM-001, SPEC-FR-ID-001. |
| AC-005 | Se intenta marcar Perdida sin motivo y luego con desconocido explícito; se rechaza solo una alternativa distinta. | Primer intento rechazado; segundo conserva pérdida/contexto; rechazo de alternativa no pierde toda venta. | SPEC-FR-COM-003–004, SPEC-FR-PROP-007. |
| AC-006 | Venta pausada o perdida se reactiva con interés nuevo y tarifa antigua caducada. | Conserva pausa/pérdida/motivo y destino sustentado; precio se revalida antes del compromiso, sin volver directamente a Ganada. | SPEC-FR-COM-005. |
| AC-007 | Proposal tiene versión fijada v1 aún no aceptada; se cambia precio/composición/términos. | v1 permanece idéntica; existe nueva preparación/v2 enlazada con motivo; alternativas previas siguen disponibles. | SPEC-FR-PROP-001–002, SPEC-FR-HIST-002. |
| AC-008 | Validez ordinaria 7 días, pero opción material vence antes; cliente responde tras ese vencimiento sin revalidación. | Prevalece límite más restrictivo; respuesta conservada pendiente, sin Acceptance válida. Revalidación posterior permite nuevo acto, sin prorrogar v1 silenciosamente. | SPEC-FR-PROP-004, SPEC-FR-ACC-002. |
| AC-009 | Se registra tarde una aceptación: caso A acredita acto dentro de vigencia; B no acredita vigencia del acto. | A distingue fecha real y registro y permite verificar; B conserva candidato y exige nueva aceptación válida tras revisar, sin fecha/revalidación retroactiva. | SPEC-FR-ACC-001–002, SPEC-FR-HIST-001. |
| AC-010 | Oferta definitiva depende de coste hotelero incierto; otro precio se conoce por tarifa verificable. | No compromete importe dependiente hasta confirmar coste; conserva fuentes/unidades y estimación solo si regla aprobada, sin impedir trabajo independiente. | SPEC-FR-CAT-002–004, SPEC-FR-PROP-005. |
| AC-011 | Pack con componente fijo y precio final manual diferente al calculado se prepara para cliente. | Por modalidad salen precio final/persona, participantes e incluidos; dentro quedan unidad fija, cálculo, ajuste/autor/motivo y desglose reservado. | SPEC-FR-PROP-003/005, SPEC-FR-SEC-003, SPEC-FR-CAT-005. |
| AC-012 | Versión vigente contiene A/B expresamente seleccionables; cliente acepta A inequívocamente. | Acceptance fija A y sus términos; no exige v2 por elegir A ni contrata/rechaza B por inferencia. | SPEC-FR-ACC-001–003. |
| AC-013 | Versión contiene un pack cuyo componente no es seleccionable y cliente pide solo ese componente. | Se conserva petición; primero nueva Proposal Version y después Acceptance real; no aceptación de v1 reparada retrospectivamente. | SPEC-FR-ACC-003, SPEC-FR-PROP-002. |
| AC-014 | Administrador registra reserva directa con evidencia real de llamada/condiciones exactas; segundo caso carece de Acceptance del cliente. | Primero genera/reutiliza Opportunity → Proposal/Version/términos → Acceptance → Booking; sin Lead/envío ficticios. Segundo puede preparar, pero no completar Booking aceptada. | SPEC-FR-COM-002, SPEC-FR-BOOK-001–002, SPEC-FR-ACC-002/005. |
| AC-015 | Dos intentos equivalentes, simultáneos o repetidos tras perder respuesta, crean Booking para la misma Opportunity aceptada. | Existe una sola Booking con sus vínculos; segundo reconoce resultado/operación en curso sin duplicar; contenido material diferente produce conflicto. | SPEC-FR-BOOK-003, SPEC-FR-IDEMP-001–002, SPEC-FR-CONC-002. |
| AC-016 | Acceptance válida sin pago ni Provider Confirmation habilita Ganada y conversión. | Ganada solo en alcance aceptado; Booking Pendiente de preparación, sin conciliación ni confirmación operativa implícitas. Anticipo como evidencia exige verificaciones separadas. | SPEC-FR-COM-003, SPEC-FR-BOOK-001/004, SPEC-FR-ACC-005. |

### 24.2. Operación y economía

| ID | Dado / cuando | Entonces: resultado y límite comprobables | Requisitos |
|---|---|---|---|
| AC-017 | Modalidad A: 10 con rafting/2 noches; B: 2 sin rafting/1 noche; cena común; se convierte lo aceptado. | Una Booking: rafting 10, cena 12, noche 1: 12 y noche 2: 10; procedencia de cada contribución, sin servicios/noches adicionales. | SPEC-FR-BOOK-003, SPEC-FR-SVC-001–003, SPEC-FR-PROP-003. |
| AC-018 | Grupo pasa de 12 a 14; rafting conserva 10 confirmados; se pide cambiar cena. | Ningún global sobrescribe rafting/noches; cena conserva antes/después y revisa solo capacidad/precio/confirmación materialmente dependientes. | SPEC-FR-SVC-002/010. |
| AC-019 | Noche 1 tiene 12 y noche 2 tiene 10; se cambia noche 2. Solo 4 asistentes de noche 1 están identificados nominalmente. | Noche 1 no cambia; lista parcial no suma 4 a 12 ni crea 8 personas ficticias; casa completa no exige reparto de habitaciones por defecto. | SPEC-FR-ID-004, SPEC-FR-SVC-003–004. |
| AC-020 | Consulta y respuesta «hay sitio» acreditan disponibilidad para 12, sin compromiso firme. | Se conserva fuente/momento/alcance; no Provider Confirmation, servicio confirmado ni capacidad para 16; sin respuesta no se declara disponible. | SPEC-FR-SVC-006/008, SPEC-FR-CAT-003. |
| AC-021 | Opción concedida sin vencimiento; se envía petición de liberación; después hay respuesta de liberación parcial/prórroga explícita. | Primero revalidación sin fecha inventada; petición no libera; respuesta cambia solo alcance acreditado y conserva resto y condiciones anteriores. | SPEC-FR-SVC-007. |
| AC-022 | Proveedor confirma S1 por llamada inequívoca registrada, no S2; S3 es propio. | Solo S1 confirmado, sin escrito adicional obligatorio; S2 pendiente; S3 exige evidencia interna separada, sin proveedor ficticio. | SPEC-FR-SVC-008–009, SPEC-FR-BOOK-004. |
| AC-023 | Reserva a 10 días con crítico confirmado y 50 % debido verificado/asignado; casos alternativos: crítico pendiente, justificante sin verificar o reserva a 6 días con solo 50 %. | Primer caso satisface guarda de cobro inicial; alternativos no confirman conjunto. A 6 días exige 100 % salvo excepción económica documentada, que nunca dispensa crítico/capacidad. | SPEC-FR-BOOK-004, SPEC-FR-ECON-001–002. |
| AC-024 | Confirmación para 18; llega «creo que 16» o nueva fecha; respuesta posterior solo ratifica horario. | Conserva 18/hecho anterior, abre revisión acotada y tarea; horario no ratifica cantidad/precio/capacidad; no aplica 16 automáticamente. | SPEC-FR-SVC-010, SPEC-FR-HIST-005. |
| AC-025 | Expected Payment de 500 sin entrada y luego aviso de transferencia. | Previsión no crea dinero; aviso crea detección sin recepción/conciliación verificadas ni pago de reserva. | SPEC-FR-ECON-001/003. |
| AC-026 | Transferencia recibida verificada pero destino dudoso; después solo 200 de 500 quedan comprobados. | Recepción separada de conciliación; propuesta requiere revisión humana, 300 siguen pendientes y no se usa su porción para acreditar obligación. | SPEC-FR-ECON-004–005. |
| AC-027 | Fondos comprobados disponibles 100; dos operaciones intentan consumir 80 cada una, incluyendo caso asignación frente a Refund. | No se aplican ambas por 160; tras primer efecto, segundo detecta insuficiencia/conflicto y reevalúa. Misma porción no financia dos efectos. | SPEC-FR-ECON-005/007, SPEC-FR-CONC-002. |
| AC-028 | Aviso duplicado de una transferencia y otra transferencia real con mismo importe/fecha; un vencimiento se cubre con pagos parciales. | Duplicado no suma; segunda transferencia real se conserva; parciales muestran saldo, sin convertir toda Booking en pagada ni forzar asignación de excedente. | SPEC-FR-ECON-003–006, SPEC-FR-IDEMP-003. |
| AC-029 | Cliente pide cambio horario/cantidad; proveedor responde ambiguo y luego ofrece alternativa. | Modificación Solicitada/En evaluación/Pendiente de proveedor según prueba; alternativa conserva petición previa y requiere evaluación comercial, sin aplicación por recepción. | SPEC-FR-CHG-001–002, SPEC-FR-SVC-005. |
| AC-030 | Se aprueba modificación de S1; solo una parte se aplica, luego cambia materialmente lo restante o se pide retirada. | Aprobación y aplicación separadas, parte aplicada histórica; nuevo alcance vuelve a evaluación; retirada no oculta efectos ni restituye confirmación inválida. | SPEC-FR-CHG-003–004. |
| AC-031 | Cliente cancela S1 de tres servicios; proveedor confirma solo S1; otra parte ya se prestó. | Cancela únicamente S1 acreditado, conserva demás y ejecución previa; no toda Booking Cancelada ni Refund ejecutada. | SPEC-FR-CHG-005, SPEC-FR-SVC-011, SPEC-FR-BOOK-005. |
| AC-032 | Servicio de valor atribuible 200 se cancela por meteorología/proveedor, con condición no reembolsable aceptada. | Derecho de devolución de 200 por esa parte, no del resto; fondos ya pagados al proveedor no reducen el derecho. | SPEC-FR-CHG-006/008. |
| AC-033 | Cancelación voluntaria sobre base verificada 200 a 7, 3 y 2 días naturales. | Respectivamente devolución correspondiente, retención/cobro 100 y retención/cobro 200; no porcentajes sobre partes no canceladas. | SPEC-FR-CHG-006/009. |
| AC-034 | Se invoca no reembolsable sin aceptación expresa, y en otro caso hay no-show/retraso impeditivo/alcohol-drogas/exclusión de seguridad acreditados. | Primer caso no aplica excepción; segundo no genera devolución de parte afectada conforme política, sin inventar causa ni cargo adicional. | SPEC-FR-CHG-006. |
| AC-035 | Refund debida/autorizada por 200; solo hay salida acreditada de 80; se cierra Incident o cliente retira solicitud. | Devuelto 80 y resto debido/autorizado pendiente, con medio normalmente igual al del cobro; ninguna acción acredita 200 ejecutados ni extingue obligación real; conservar cobro bruto y ajustes. | SPEC-FR-ECON-006–007. |
| AC-036 | Fianza 100 entregada al proveedor; retención acreditada 20 y devolución restante no ejecutada. | Custodia real identificada; no anticipo, quedan 80 por devolver y cierre económico pendiente; Refund enlazada no duplica movimiento. Fianza desconocida no se convierte en cero. | SPEC-FR-ECON-008. |
| AC-037 | Una persona cancela de un alojamiento con precio grupal 900 y no hay regla/reducción verificada/ajuste aprobado. | No divide 900 entre participantes ni rebaja compromiso automáticamente; exige base admisible para ajuste. | SPEC-FR-CHG-007–008. |
| AC-038 | Despedida elegible: 10 en A a 150 y 5 en B a 120, novi@ en A; caso alternativo sin modalidad asignada o público no elegible. | Gratuidad 150, sin media, 15 asistentes reales y deudas externas intactas; falta de modalidad bloquea efecto definitivo; público no elegible no recibe promoción automática. | SPEC-FR-CAT-006, SPEC-FR-ECON-012. |
| AC-039 | Cancelación completa de una persona de modalidad B a 120, a 4 días del primer servicio de B. | Base 120 y retención/cobro 60; no promedio de grupo ni fecha de otra modalidad. | SPEC-FR-CHG-007/009. |
| AC-040 | Componente de pack cancelado sin valor comercial atribuible verificable; proveedor ya canceló operación. | Puede registrar cancelación operativa; devolución/retención/nueva obligación/asignación quedan pendientes hasta determinación explícita y reproducible del Administrador. | SPEC-FR-CHG-003/008, SPEC-FR-ECON-004–007. |
| AC-041 | Booking con primer servicio día 20, modalidad B comienza 22 y noche afectada 23; se calculan saldo/cifra global, cancelación B y noche. | Referencias 20, 22 y 23 respectivamente; servicio individual usa su fecha; una referencia contractual expresa válida diferente prevalece solo en su alcance. | SPEC-FR-CHG-009, SPEC-FR-ECON-001–002, §11.2. |
| AC-042 | Servicio día 20 a cualquier hora; actos durante los días 13 y 17 locales; saldo general debido día 13. | Todo día 13 es ≥7, todo 17 es ≥3 y <7; saldo no vencido durante 13, vencido desde 14 si impagado. No 168/72 horas ni corte por hora del servicio. | SPEC-FR-CHG-009, SPEC-FR-ECON-002. |
| AC-043 | Se cambia primero hora dentro del día 20, después fecha al 22; cifra final específica de servicio posterior. | Hora no cambia intervalo; nueva fecha reevalúa plazos afectados con antes/después; cifra específica no se propaga ni reescribe evaluación histórica ejecutada. | SPEC-FR-CHG-009, SPEC-FR-COORD-003. |
| AC-044 | Cliente aporta fondos para externo y honorarios; se asigna parte al suplido, otra a Fee. | Gestión externa, factura al cliente, pago y remuneración propia separados; asignación no acredita salida ni convierte total gestionado en ingreso/coste propio; mandato ausente no aceptado. | SPEC-FR-ECON-005/009/013, SPEC-FR-ACC-005. |
| AC-045 | Factura externa recibida y pago programado; en otro caso factura corresponde a cliente/importe diferente. | Recibida no significa Revisada/Vinculada ni Pagado; diferencia queda en incidencia/revisión sin ajustar importes para cuadrar. | SPEC-FR-ECON-010–011. |
| AC-046 | Pago al proveedor acreditado sin factura; luego llega documento correcto, se revisa/vincula y concilia. | Primero registra pago real y alerta/cierre documental pendiente; después puede resolver suplido con sus evidencias, sin cerrar Booking por inferencia. Nueva discrepancia reabre evaluación. | SPEC-FR-ECON-009–011, SPEC-FR-CLOSE-002/004. |
| AC-047 | Se recalcula con versiones conservadas de cantidades, tarifas, descuentos, Fee y costes; coste real de una parte desconocido. | Resultado reproducible: honorarios propios menos costes propios atribuibles, con previsto/confirmado/real diferenciados; no rentabilidad definitiva de alcance incierto ni modificación histórica silenciosa. | SPEC-FR-ECON-013, SPEC-FR-HIST-002. |
| AC-048 | Se usan conjunto Tararí de 2 copas y extras de 25/50 según datos aprobados. | Conjunto 15 comercial/3,80 coste, extras 175/325 comerciales separados; sin extrapolar coste de extras, factura interna, Provider o Suplido ficticios. | SPEC-FR-ECON-014, SPEC-FR-SVC-009. |
| AC-049 | Tarifa/coste tienen unidad y tratamiento IVA explícitos; otro coste no tiene tipo fiscal verificado. | EUR y 2 decimales visibles/cobrados, componentes conservados; no se inventa tipo del segundo ni se redondea comercialmente un pack de forma automática. | SPEC-FR-CAT-002/004, SPEC-FR-ECON-014. |

### 24.3. Coordinación, supervisión y cierres

| ID | Dado / cuando | Entonces: resultado y límite comprobables | Requisitos |
|---|---|---|---|
| AC-050 | Disparador de Task se procesa dos veces; se completa con resultado o cancela con motivo y luego se acredita cierre erróneo. | Una tarea de misma causa, resultado histórico y reapertura explícita; completar no confirma pago/proveedor/aceptación; deadline desconocido no es vencido. | SPEC-FR-COORD-001–003. |
| AC-051 | Documento imprescindible de S1 recibido sin revisar; S2 no lo necesita; luego cambia alcance. | S1 no satisface requisito hasta revisión; S2 sigue; No aplica requiere fundamento; cambio reabre solo exigencia afectada sin borrar revisión anterior. | SPEC-FR-COORD-005, SPEC-FR-CAT-007. |
| AC-052 | Incident pasa de Abierta a En gestión, luego Resuelta/Cerrada con evidencia y reaparece misma causa. | Gravedad independiente; en gestión sigue abierta para guarda crítica; resolución no ejecuta Refund; reapertura conserva solución y revisa impactos. | SPEC-FR-COORD-006. |
| AC-053 | IA prepara propuesta sensible y Administrador aprueba contenido exacto; no existe intento/resultado. | Aprobación identificada y trazable, efecto aún no ejecutado; ejecutor humano/automático distinguible cuando actúe. | SPEC-FR-HA-001/003. |
| AC-054 | Tras aprobar se cambia destinatario, precio, alcance, condiciones o efecto; variante sin cambio de contenido pero evidencia caducada. | Cada cambio material exige nueva Human Approval; evidencia caducada exige revalidación aunque contenido coincida; ninguna ejecución automática con contexto obsoleto. | SPEC-FR-HA-002. |
| AC-055 | Dos ejecutores o reintentos usan misma aprobación para el mismo efecto sensible. | Como máximo un efecto acreditado; el otro reconoce resultado/pendiente o conflicto, sin doble consumo; parte ya ejecutada no se repite. | SPEC-FR-HA-004, SPEC-FR-CONC-002. |
| AC-056 | IA intenta aprobarse, usar plantilla sensible sin revisión, sustituir Acceptance/Provider Confirmation o emitir factura con aprobación interna. | Todos rechazados en su parte dependiente; IA solo prepara y Human Approval no crea acuerdo del cliente, confirmación del proveedor ni dispensa P16. | SPEC-FR-HA-001/005, SPEC-FR-ACC-005, SPEC-FR-SEC-007. |
| AC-057 | Timeout después de intentar reembolso/envío sensible; se pide reintento incluso manual. | Resultado incierto, intento conservado; no fracaso/éxito supuestos ni repetición peligrosa. Verificar efecto previo y guardas antes de repetir; si no verificable, sigue pendiente. | SPEC-FR-ERR-002, SPEC-FR-HA-003–004. |
| AC-058 | Booking Finalizada pero factura/fianza/devolución siguen pendientes. | Finalización real conservada; Economic Closure y cierre conjunto no resueltos por finalizar. | SPEC-FR-BOOK-005, SPEC-FR-CLOSE-001–003. |
| AC-059 | Comercial resuelto, operación pendiente y economía resuelta; después se acreditan las partes operativas restantes. | Evaluaciones independientes; solo después de resolver las tres con criterios aplicables puede declararse Closed / Historical; dimensión sin requisitos exige evaluación explícita. | SPEC-FR-CLOSE-001–003. |
| AC-060 | Crítica Abierta/En gestión, con y sin justificación del Administrador; además hay devolución debida pendiente. | Sin justificación bloquea cierre; con justificación solo salva ese bloqueo admisible, pero devolución/otra incidencia económica sigue bloqueando economía. | SPEC-FR-CLOSE-002–003, SPEC-FR-COORD-006. |
| AC-061 | Tras cierre conjunto aparece nueva discrepancia material de pago. | Reabre evaluación económica y retira cierre conjunto actual; conserva cierre previo/causa, sin modificar ejecución comercial/operativa por inferencia. | SPEC-FR-CLOSE-004. |
| AC-062 | Se archiva/anula un expediente o se fusionan humanamente identidades Contact/Organization con historia; después se recupera el contexto y crea otro expediente anual. | Recuperación conserva vínculos/códigos y no presenta archivado como cierre; nuevo identificador no reutiliza el anterior. No se fusionan Opportunities/Bookings. | SPEC-FR-ID-005, SPEC-FR-HIST-006, SPEC-FR-CLOSE-003. |
| AC-063 | Evidencia prueba servicio ejecutado o devolución hecha sin autorización previa registrada. | Registrar realidad/momento y revisión/incidencia; no fabricar aprobación/confirmación retroactiva ni habilitar ese camino irregular; cierres evalúan sus pendientes. | SPEC-FR-BOOK-005, SPEC-FR-SVC-011, SPEC-FR-ECON-007/011, SPEC-FR-HIST-001. |

### 24.4. Controles técnicos y fronteras

| ID | Dado / cuando | Entonces: resultado y límite comprobables | Requisitos |
|---|---|---|---|
| AC-064 | Actor no autenticado, autenticado no habilitado, Contact/Provider o rol futuro intenta leer/mutar con identificador conocido; administrador habilitado realiza operación permitida. | Primeros denegados en servidor/datos con mínimo detalle; último autorizado solo tras guardas. No permisos por metadata declarada, relación o UI. | SPEC-FR-SEC-001–002, SPEC-NFR-002. |
| AC-065 | Se prepara consulta/exportación/documento/timeline/contexto IA para tercero desde expediente que contiene costes/márgenes/beneficios/honorarios internos. | Salida autorizada excluye economía interna y datos personales innecesarios; propiedad del expediente o acceso del Administrador no permiten divulgación. | SPEC-FR-SEC-003/006, SPEC-NFR-003. |
| AC-066 | External Event equivalente llega dos veces o fuera de orden; misma clave llega con importe distinto; dos hechos similares sin ID fiable. | Primero reutiliza resultado sin doble efecto, antiguo no sobrescribe actual; contenido distinto es conflicto; sin ID se revisa sin deduplicar por semejanza. | SPEC-FR-IDEMP-001–004, SPEC-FR-INT-001–002, SPEC-NFR-006. |
| AC-067 | Dos operaciones leen v1: una fija versión/modifica dato; otra intenta aceptar/aplicar basándose en v1 obsoleta. | Detecta cambio material y conflicto/revisión, sin overwrite; versión histórica permanece; no aceptación de contenido sustituido silenciosamente. | SPEC-FR-CONC-001–002, SPEC-NFR-007. |
| AC-068 | Falla unidad interna durante creación Booking, conciliación o registro de intención asociada. | O quedan juntos hecho/vínculos/historia/resultado/intención requeridos o no se confirma esa unidad; sin Booking incompleta ni porciones incoherentes. Preparación previa válida no finge conversión. | SPEC-FR-CONC-003–004, SPEC-NFR-008. |
| AC-069 | Dos ejecutores reclaman mismo trabajo persistido; uno cae antes/después de contactar proveedor. | No dos efectos; trabajo/intentos identificados y reanudables; después del contacto se verifica resultado antes de reenviar. | SPEC-FR-CONC-005, SPEC-FR-ERR-002. |
| AC-070 | Automatización falla persistentemente y WhatsApp también falla; Administrador la detiene/revisa. | Fallo Importante/Crítico visible en CRM, intentos/versiones conservados, sin bucle de avisos ni reintento ilimitado; email no recibe aviso interno. | SPEC-FR-CONC-006, SPEC-FR-COORD-004, SPEC-NFR-014. |
| AC-071 | Canal/fuente externa indisponible durante operación de S1 y trabajo independiente de S2. | S1 dependiente pendiente, S2 puede continuar; intención interna no prueba entrega; sustitución conserva originales/referencias y significado del Core. | SPEC-FR-INT-001/003–005, SPEC-FR-CONC-004, SPEC-NFR-011. |
| AC-072 | Se presentan ocho casos: sin permiso; versión cambiada; dato ausente; timeout tras efecto; fallo técnico confirmado sin efecto; fuente caída; identidad ambigua; documento externo contradictorio. | Se distinguen E1–E8, causa/alcance/estado conocido y siguiente revisión; excepción técnica con resultado desconocido sigue E4 para el efecto, sin bloqueo indiscriminado. | SPEC-FR-ERR-001–002, SPEC-NFR-014. |
| AC-073 | Restauración de punto anterior a pago/envío ya ejecutado externamente; objeto privado aún ausente. | Automatismos sensibles suspendidos hasta conciliar efecto externo; no pago/envío duplicado ni original declarado recuperado; objetivos RPO/RTO siguen pendientes, sin cifras inventadas. | SPEC-FR-IDEMP-002, SPEC-FR-HIST-004, SPEC-NFR-005. |
| AC-074 | Carga de objeto logra binario pero falla metadata, o existe referencia sin objeto; se solicita documento por tercero con URL conocida. | Estado de conservación exacto y reparación trazable; no evidencia completa ni acceso por referencia conocida; no atomicidad externa simulada. | SPEC-FR-HIST-003–004, SPEC-FR-SEC-005. |
| AC-075 | Se registra manualmente llamada aceptada y luego se acredita error de atribución; se consulta cadena completa. | Conserva momentos/registrador/aceptante, versión y términos, original y rectificación; reevaluación de dependientes sin reversión bancaria/externa implícita. | SPEC-FR-ACC-004, SPEC-FR-HIST-001–003/006, SPEC-NFR-001/009/012. |
| AC-076 | Google Calendar cambia fecha crítica y emite eco de actualización propia; proyección CRM está retrasada. | Entrada en revisión, eco sin efecto duplicado; solo guardas/cambio aprobado modifican Core; mutación usa estado actual y cálculo D020, no vista obsoleta. | SPEC-FR-COORD-008, SPEC-FR-IDEMP-004, SPEC-FR-INT-005. |
| AC-077 | Llega discrepancia Avaibook y se intenta crear/modificar/cancelar allí. | Consulta/referencia solo si capacidad verificada; toda escritura excluida/rechazada, discrepancia revisada sin cambiar silenciosamente CRM. | SPEC-FR-INT-006. |
| AC-078 | Se pide factura legal/numeración fiscal desde pago conciliado, documento externo o aprobación humana. | No emisión ni numeración/motor fiscal; documento externo conserva emisor y borrador autorizado está inequívocamente marcado no fiscal. | SPEC-FR-SEC-007. |
| AC-079 | Validación en Development/Staging intenta usar datos, secretos o recursos de Production por conveniencia. | Separación exigida; datos sintéticos/minimizados y recursos/secretos propios; no efectos reales externos sin alcance autorizado. | SPEC-NFR-004, SPEC-FR-SEC-005. |
| AC-080 | Se evalúa acceso del Administrador a Production con soporte MFA disponible y sin satisfacerlo. | No cumple requisito de acceso; control no delegado únicamente a UI; factores/sesiones/recuperación no se consideran configurados por esta Spec. | SPEC-FR-SEC-004, SPEC-NFR-002. |
| AC-081 | Revisor autorizado investiga operación fallida usando referencia de petición/ejecución/evento. | Localiza alcance, intento, historia, aprobación y resultado sin usar log como prueba sustitutiva ni copiar secretos, URLs temporales o cuerpos completos al log. | SPEC-FR-HIST-001/006, SPEC-NFR-009–010. |
| AC-082 | Entrada no verificada, adjunto innecesario o petición de contexto/secretos ajenos intenta atravesar frontera del Core. | Rechazo/aislamiento sin efectos ni evidencia válida; secreto no aparece en cliente/Git/logs y documento solo se entrega con autorización/finalidad. | SPEC-FR-INT-002, SPEC-FR-SEC-005–006. |
| AC-083 | No está configurado adelanto de aviso, fecha dentro de 2–3 días o límite/pausa de reintento; se solicita automatismo. | Dato pendiente localizado; no fecha/frecuencia/número universal inventados; tareas y revisión independientes pueden continuar. | SPEC-FR-COORD-002–003, SPEC-FR-CONC-006. |
| AC-084 | Se revisa el alcance publicado de SPEC 001 y se solicita dar por iniciado plan/tasks/implementación por haberse publicado. | Sigue DRAFT/NOT APPROVED; ninguna siguiente fase iniciada; no UI/SQL/RLS concreta/endpoints/proveedor/configuración/despliegue definidos. | SPEC-NFR-015; §§1/6/29–30. |
| AC-085 | Se actualizan servicio, categoría/atributo, recomendación, unidad, forma de precio, Tariff/Pack/Promotion Version tras fijar propuesta; recomendación alta incumple requisito de elegibilidad. | Histórico sigue reproducible con versiones aplicadas; recomendación no permite compromiso objetivamente inelegible; personalización no obliga a maestro. | SPEC-FR-CAT-001–007, SPEC-FR-ECON-013, SPEC-NFR-013. |
| AC-086 | Se intenta aceptar una versión sustituida/rechazada como actual y otra respuesta solo indica leído/silencio. | Revisión de contenido y cobertura antes de compromiso; cambio requiere nueva versión; leído/silencio no aceptación ni rechazo. | SPEC-FR-PROP-006–007, SPEC-FR-ACC-002. |
| AC-087 | Communication aprobada carece de evidencia de envío; entra una respuesta por canal externo. | No Enviada/Recibida inferidas; entrada conserva original/vínculos sin borrador ficticio ni duplicación por contexto; respuesta se evalúa por alcance. | SPEC-FR-PROP-006, SPEC-FR-COORD-007, SPEC-FR-HIST-003. |
| AC-088 | Transcripción PLAUD autorizada y resumen generado se vinculan a persona/Booking; IA detecta dato tentativo contra confirmación manual. | Original y resumen separados, fuente/actor/momentos/revisión y dato confirmado preservados; sin audio/consentimiento por defecto ni conector supuesto. | SPEC-FR-HIST-003/005, SPEC-FR-INT-004, SPEC-FR-SEC-006. |
| AC-089 | Revisor recorre E2E-01 y matrices, luego cambia un comportamiento previsto. | Cada efecto importante tiene fuente, guarda y criterio; validaciones futuras se registran sin afirmar ejecutadas; desviación requiere actualizar/aprobar Spec antes de implementar. | SPEC-NFR-001/015; §28. |
| AC-090 | Se revisan pendientes heredados frente a D018–D021 y aprobación de Architecture. | ARCH-PENDING-001/002 y heredados siguen en sus ámbitos; SM-PENDING históricos resueltos no reaparecen como bloqueos ni SPEC-PENDING nuevos. | §§3/26–27; SPEC-NFR-015. |
| AC-091 | Fecha prevista de inicio/fin alcanzada sin prueba de ejecución, y después evidencia parcial de prestación. | Fecha sola no marca En curso/Ejecutado/Finalizada; hecho parcial conserva resto por prestar/cancelar, sin finalización total hasta evidencia suficiente. | SPEC-FR-BOOK-005, SPEC-FR-SVC-011. |
| AC-092 | Proveedor ofrece 10:00/12:30/16:00 para petición 11:00; Administrador justifica conflicto de agenda, pero hay restricción objetiva de capacidad incumplida. | Alternativas y petición conservadas; solo acuerdo verificable fija hora final; aviso V1 no bloquea por sí solo, pero excepción de agenda no dispensa restricción objetiva. | SPEC-FR-SVC-005, SPEC-FR-CAT-007. |

## 25. Non-Functional Requirements

Son requisitos conceptuales, sin SLA, RPO, RTO, latencia, volumen o frecuencia inventados. El resultado observable define cómo podrán verificarse después de aprobar la Spec.

| ID | Requisito y condición verificable | Fuente | Criterios |
|---|---|---|---|
| SPEC-NFR-001 | Trazabilidad de extremo a extremo: partiendo de Booking se reconstruye necesidad, versiones, Acceptance, operación, economía, decisiones y validación pertinente sin sustituir hechos por resúmenes. | C P02/P06/P18/P19; ARCH §13/16. | AC-075/089. |
| SPEC-NFR-002 | Seguridad: rechazar acceso/efecto sin identidad y autorización vigente en servidor/datos; mínimo privilegio, MFA Production según capacidad aprobada y protección aun fuera de UI. | C P10/P11; ARCH §§5/14. | AC-064/080/082. |
| SPEC-NFR-003 | Privacidad/minimización: cada dato/salida tiene finalidad y destinatario autorizado; política de conservación pendiente no se sustituye por retención indefinida ni audio por defecto. | C P07/P10; ARCH §14/18.2. | AC-019/065/088. |
| SPEC-NFR-004 | Aislamiento Development/Staging/Production con Supabase, datos, secretos e integraciones separados; Work Local Mac permanece entorno principal, sin recursos productivos usados por comodidad. | D002/D005; ARCH-DEC-017 y §16.2. | AC-079. |
| SPEC-NFR-005 | Recuperación: exigir procedimiento, responsable, comprobación de copias y restauración periódica probada en entorno aislado que abarque datos, historia, objetos, identidades/configuración, referencias e idempotencia/ejecuciones. Conciliar efectos externos antes de reanudar; aceptación/configuración definitiva Production bloqueada por ARCH-PENDING-002. | ARCH §15; C P07/P10/P13/P14. | AC-073/074. |
| SPEC-NFR-006 | Idempotencia: repeticiones equivalentes conservan identidad/resultado sin duplicar efectos; contenido material diferente no se reutiliza silenciosamente; lectura de resultado respeta permisos. | ARCH-DEC-013; SM G6. | AC-015/028/055/066. |
| SPEC-NFR-007 | Concurrencia: solicitudes/jobs/eventos simultáneos mantienen versiones, Booking única, porciones de fondos y aprobación coherentes; cambio material concurrente exige reevaluación. | ARCH §12.2. | AC-027/055/067/069. |
| SPEC-NFR-008 | Consistencia: unidad material interna todo o nada con historia/resultado/intención; externos y objetos admiten consistencia eventual visible, sin transacciones distribuidas ni éxito por intención. | ARCH-DEC-014; ARCH §12.3. | AC-030/068/071/074. |
| SPEC-NFR-009 | Auditabilidad: actor humano/automático, motivo, momentos, antes/después y evidencia verificables en cambios y excepciones; corrección conserva original y permisos. | C P06/P07/P14; ARCH-DEC-016. | AC-063/075/081. |
| SPEC-NFR-010 | Observabilidad funcional: localizar intentos, jobs, errores, pendientes e incertidumbre por referencias correlacionadas; fallos persistentes visibles y logs minimizados sin secretos/URLs temporales/cuerpos completos. | ARCH §13.3; BR-AUTO-001. | AC-070/081. |
| SPEC-NFR-011 | Sustitución de integraciones: desactivar/reemplazar adaptador conserva identidad, evidencia y reglas centrales; operaciones independientes siguen disponibles, lo dependiente pendiente explícito. | C P01/P17; ARCH-DEC-001/006 y §7. | AC-066/071/076–077. |
| SPEC-NFR-012 | Preservación histórica: versiones/confirmaciones/aceptaciones originales y rectificaciones reconstruibles; archivado/fusión no reutilizan identidad ni eliminan historia, con privacidad autorizada. | C P07; D017; ARCH-DEC-016. | AC-007/061–063/075/085. |
| SPEC-NFR-013 | Reproducibilidad económica: cantidades/unidades, reglas y versiones, precios, descuentos, fondos ajenos y costes/honorarios propios permiten reconstruir cada importe y ajuste dentro de su certeza; D019/D020 conservados. | C P20; D010/D013/D019/D020; ARCH §3.1/12. | AC-037–049/085. |
| SPEC-NFR-014 | Comportamiento ante fallos: E1–E8 distinguibles, interrupción/recuperación segura y resultados parciales explícitos; timeout no habilita repetición sensible ni bloqueo de partes independientes. | C P05/P14; ARCH §§10/13.1. | AC-057/069–073. |
| SPEC-NFR-015 | Disciplina documental: monolito modular y Next.js App Router/Vercel/Supabase como decisiones aprobadas, sin congelar versiones ni implementar interfaces; cambios importantes siguen Spec aprobada → plan → tasks → implementación, migraciones revisables futuras según P13 y su excepción constitucional intacta. No declarar completada funcionalidad sin evidencia de criterios/pruebas. | C P02–P04/P13/P18/P19; D003/D005/D006/D021; ARCH-DEC-005/018 y §16. | AC-084/089–090. |

El requisito de recuperación conserva la necesidad de cubrir objetos privados y comprobar su coherencia con metadatos por separado, conforme ARCH §15; no afirma backups/PITR activos. No se fija una cadencia de prueba ni objetivos numéricos. Límites reales de ejecución deberán comprobarse posteriormente para el entorno elegido; esta Spec no garantiza rendimiento no medido ni configura un scheduler.

## 26. Dependencies and Inherited Pending Items

### 26.1. Pendientes localizados, sin duplicación de identificadores

| Pendiente heredado y localización | Estado / parte afectada | Trabajo que puede continuar |
|---|---|---|
| ARCH-PENDING-001, [ARCH §18.1](../../docs/architecture.md#181-pendientes-arquitectónicos-activos); origen BR-PENDING-001/035 y D014 | PENDING. Elección humana tras comparación verificable de ElevenLabs y al menos una alternativa real para Telefonía IA; WhatsApp requiere análisis propio, sin forzar proveedor común. Bloquea selección/implementación dependiente. | Core, Source/Reference/Event/Communication, contexto compartido, originales e intenciones genéricas; sin comparativa realizada ni proveedores seleccionados. |
| ARCH-PENDING-002, [ARCH §18.1 y §15](../../docs/architecture.md#15-backup-y-recuperación) | PENDING. Decisión humana RPO/RTO y coste/complejidad; bloquea aceptación/configuración definitiva de recuperación/continuidad Production, sin objetivos ni garantías inventados. | Requisitos de copia/restauración/coherencia y suspensión/conciliación de efectos; no bloquea redacción/revisión del Core. |
| DM-PENDING-002, [DM §15](../../docs/domain-model.md#15-open-questions--dm-pending--límites-pendientes); BR-PENDING-021/022/033, [BR — Pendientes activos](../../docs/business-rules.md#pendientes-activos); ARCH §18.2 | PENDING / validación profesional. Fiscalidad/suplidos/Tararí, tipos no verificados y mandato efectivo. Impide conclusiones/emisión legal, tipos supuestos y acreditar mandato inexistente. | Gestión operativa separada de fondos, documentos externos, honorarios/costes y snapshots de términos efectivamente aceptados; cálculo dependiente espera dato/validación. |
| DM-PENDING-005, DM §15; BR-PENDING-014/015/019/020, BR — Pendientes activos; ARCH §18.2 | PENDING. Retención/anonimización/eliminación, consentimiento y tratamiento de transcripciones/metadatos/audio excepcional. Detiene tratamiento/borrado dependiente sin autorización o política válida. | Minimización, permisos, fuentes/originales autorizados, archivado y auditoría compatibles con futura política; sin audio por defecto. |
| DM-PENDING-006, DM §15; BR-PENDING-012/013, BR — Pendientes activos; ARCH §18.2 | PENDING. Matriz fina de permisos de futuros usuarios. | Único Administrador/Propietario, controles de servidor/datos y economía reservada; ningún rol nuevo activo. |
| BR-PENDING-034, BR — Pendientes activos; ARCH §18.2 | PENDING. Proveedor definitivo de tarjeta antes de activar dicho cobro. | Transferencia actual registrada/verificada y modelo económico genérico. |
| BR-PENDING-035, BR — Pendientes activos; [DM §13](../../docs/domain-model.md#13-external-integration-boundaries--límites-de-integración); ARCH §18.2 | PENDING. Capacidades reales de cada API/conector, incluidas lectura, importación, envío, consulta de resultado y sincronización. ARCH-PENDING-001 no resuelve todos los conectores. | Contrato conceptual del Core, registro manual autorizado, idempotencia y errores; no integración real. |

### 26.2. Antecedentes resueltos y datos aún no aportados

| Referencia histórica | Interpretación vigente |
|---|---|
| BR-PENDING-027 / DM-PENDING-001 / SM-PENDING-001 | D018 y SM §19.2 resuelven selección parcial, reserva directa y una Booking por Opportunity aceptada V1. Split/merge extraordinario permanece excluido; no se reabre el alcance aprobado. |
| BR-PENDING-023 / DM-PENDING-003 / SM-PENDING-002 | D019 y SM §19.2 resuelven modalidad/base individual, fijo/grupal y determinación explícita del componente sin valor verificable. Un importe concreto por determinar se gestiona por esa regla, no por nuevo pendiente de política. |
| BR-PENDING-036 / DM-PENDING-004 / SM-PENDING-003 | D020 y SM §19.2 resuelven días naturales, día completo y referencias por alcance; no se pospone nuevamente su especificación. |

La tabla maestra completa, capacidades, vigencias, fianzas, costes de upsells, parámetros de avisos/reintentos y restricciones concretas no aportadas son datos/configuración que deben verificarse antes del efecto dependiente. No son decisiones SPEC-PENDING nuevas ni autorizan valores por defecto inventados. La definición física de sesiones, factores MFA, contratos, mecanismos de concurrencia y ejecución sigue en las fases posteriores autorizadas; no constituye un permiso para iniciarlas.

## 27. SPEC-PENDING

**Ninguno creado en esta redacción.** No se ha identificado una decisión nueva imprescindible para especificar el comportamiento interno que no pueda derivarse de las fuentes. Los pendientes heredados permanecen en §26 con sus identificadores originales y su alcance de bloqueo; los datos particulares faltantes siguen pendientes de verificación, sin reglas inventadas.

Si la revisión humana identifica una decisión nueva imprescindible, se registrará como SPEC-PENDING con cuestión, razón por la que no se deriva de las fuentes, alcance afectado, trabajo independiente que continúa y decisión humana necesaria. Solo se detendrá esa parte y no se resolverá mediante edición de DECISIONS sin decisión humana. Esta descripción del procedimiento no crea un pendiente ni aprueba la Spec.

## 28. Traceability Matrix

Las filas son agrupaciones de requisitos **derivados**, no decisiones nuevas. Cada requisito mantiene su fuente concreta en su propia fila; esta matriz proporciona recorridos de revisión manejables. Rangos como SPEC-FR-SVC-001–011 incluyen todos los identificadores intermedios; las barras finales conservan el prefijo anterior. Las referencias SM/BR/DM/ARCH se encuentran en los documentos de §3.

### 28.1. Product, familias BR, DM y transiciones

| Fuente | Requisitos derivados / sección | Criterios relacionados |
|---|---|---|
| Product §§1–6/19–20; BR-GOV/GEN; DM-INV-001; SM G1–G6 | §§1–7/11/19/29; SPEC-FR-ERR-001–002; SPEC-NFR-001/015. | AC-001/064/072/084/089–090. |
| Product §§3/6/9; BR-CON/ID; DM-INV-002–004; SM G1/G4 | SPEC-FR-ID-001–005; SPEC-FR-HIST-006. | AC-002–004/019/062. |
| Product §§6–7; BR-LEAD/CONV/DIM; DM-INV-005–007; SM-OP-01–11 | SPEC-FR-COM-001–005; SPEC-FR-BOOK-001–004. | AC-004–006/014–016. |
| Product §7; BR-PROP/CONV/DOC; DM-INV-008–012; SM-PV-01–08/SM-AC-01–03/SM-BK-01 | SPEC-FR-PROP-001–007; SPEC-FR-ACC-001–005; SPEC-FR-BOOK-001–003; D018. | AC-007–016/075/086–087. |
| Product §§8–10; BR-BOOK/SVC/PAX/NIGHT/DIM; DM-INV-013–019; SM-BS-01–11/SM-RV-01–04 | SPEC-FR-SVC-001–005/009–011; SPEC-FR-CAT-007; SPEC-FR-BOOK-005. | AC-017–024/029/031/051/063/085. |
| Product §10; BR-SUP/AVAIL/CONV; DM-INV-020–023; SM-AV-01–04/SM-HO-01–07/SM-PC-01–03/SM-BK-02–05 | SPEC-FR-SVC-006–010; SPEC-FR-CAT-003; SPEC-FR-BOOK-004. | AC-020–024/071. |
| Product §§7/9/11; BR-SVC/PACK/PROMO/ECON; DM-INV-024–029; SM §5/5.2 | SPEC-FR-CAT-001–007; SPEC-FR-PROP-003/005; SPEC-FR-ECON-012–014; D019. | AC-010–011/017/038/047–049/085. |
| Product §11; BR-PAY; DM-INV-030–031; SM-EP-01–04/SM-CP-01–08/SM-RC-01–04 | SPEC-FR-ECON-001–006; SPEC-FR-CONC-001–003; D020. | AC-023/025–028/041–043/066–068. |
| Product §11; BR-SUPL/PAY/ECON/TAR/BILL; DM-INV-032–036; SM-PI-01–05/SM-PP-01–06/SM-SU-01–04 | SPEC-FR-ECON-005/009–014; SPEC-FR-SEC-007. | AC-027/044–049/078. |
| Product §§8/11; BR-CHANGE/PAY/NIGHT; DM-INV-037–040; SM-MO-01–10/SM-RF-01–07/SM-DE-01–08 | SPEC-FR-CHG-001–009; SPEC-FR-ECON-007–008; D019/D020. | AC-029–043/055/057/063. |
| Product §§12/15; BR-CLOSE/INC/DOC/TASK; DM-INV-041–044; SM-CL-01–05/SM-DO-01–05/SM-TA-01–05/SM-IN-01–06 | SPEC-FR-CLOSE-001–004; SPEC-FR-COORD-001–006. | AC-046/050–052/058–063/070/083. |
| Product §§13–15; BR-COMM/AI/AUTO/HIST; DM-INV-045–048; SM-CO-01–06/SM-HA-01–03 y §18 | SPEC-FR-COORD-007; SPEC-FR-HIST-001–006; SPEC-FR-HA-001–005; SPEC-FR-IDEMP-001–004; SPEC-FR-CONC-005–006. | AC-024/053–057/066/069–075/081/087–088. |
| Product §§16/18–19; BR-INT/SEC/ID/BILL; DM-INV-049–052; SM §§16–19 | SPEC-FR-COORD-008; SPEC-FR-INT-001–006; SPEC-FR-SEC-001–007; SPEC-FR-ID-005; §26. | AC-062/064–066/071/076–082/090. |

Todas las familias BR aplicables están cubiertas: GOV, GEN, CON, LEAD, PROP, CONV, BOOK, SVC, PAX, NIGHT, SUP, AVAIL, DIM, PAY, ECON, CHANGE, TASK, COMM, AI, AUTO, DOC, HIST, SEC, BILL, INT, PACK, PROMO, TAR, SUPL, CLOSE, ID e INC. BR-AI-006 se mantiene como asistencia/recomendación supervisada en §15, sin convertir el Core en motor de analítica o campañas.

### 28.2. Constitution P01–P20

| Principio | Requisito derivado / frontera | Criterios |
|---|---|---|
| P01 | SPEC-FR-INT-001–006; SPEC-FR-COORD-008: Supabase canónico, proveedor conserva autoridad externa. | AC-020/066/076–077. |
| P02 | SPEC-NFR-001/015; §§1/3: base GitHub, publicación y trazabilidad documental. | AC-084/089. |
| P03 | SPEC-NFR-015; §§6/29: secuencia SDD sin avance automático. | AC-084/089. |
| P04 | SPEC-NFR-015; §§1/29–30: aprobación humana previa a plan e implementación. | AC-084/089. |
| P05 | SPEC-FR-ERR-001; SPEC-FR-CAT-004/007; SPEC-FR-SVC-006/010. | AC-001/010/020/024/040/072. |
| P06 | SPEC-FR-HIST-001–002; SPEC-NFR-001/009. | AC-063/075/081/089. |
| P07 | SPEC-FR-HIST-002–006; SPEC-FR-CLOSE-004; SPEC-NFR-012. | AC-007/061–063/075/085. |
| P08 | SPEC-FR-COM-003; SPEC-FR-BOOK-004–005; SPEC-FR-CLOSE-001–004. | AC-016/022–023/058–061. |
| P09 | SPEC-FR-SVC-001–004; SPEC-FR-PROP-003. | AC-017–019/043. |
| P10 | SPEC-FR-SEC-001–006; SPEC-NFR-002–004. | AC-019/064–065/074/079–080/082. |
| P11 | SPEC-FR-SEC-003; SPEC-FR-PROP-003; SPEC-FR-ECON-013. | AC-011/065. |
| P12 | SPEC-FR-SEC-005; SPEC-NFR-010. | AC-079/081–082. |
| P13 | SPEC-NFR-005/015; §6: futuras migraciones versionadas y excepción constitucional intacta; ninguna aquí. | AC-073/079/084/089. |
| P14 | SPEC-FR-CONC-005–006; SPEC-FR-IDEMP-001–004; SPEC-FR-ERR-002. | AC-055/057/066/069–073/081/083. |
| P15 | SPEC-FR-HA-001–005; SPEC-FR-HIST-005; SPEC-FR-COORD-007. | AC-024/053–057/087–088. |
| P16 | SPEC-FR-SEC-007; SPEC-FR-ECON-009/014; §26. | AC-044/048/056/078. |
| P17 | SPEC-FR-INT-001–006; SPEC-NFR-011/015. | AC-066/071/076–078/084. |
| P18 | §24; SPEC-NFR-001/015; no pruebas de aplicación ejecutadas. | AC-084/089. |
| P19 | §§1/3/26–30; SPEC-NFR-015. | AC-084/089–090. |
| P20 | SPEC-FR-CHG-006–009; SPEC-FR-ECON-001–014; SPEC-NFR-013. | AC-025–049/085. |

### 28.3. SM-FORB-01–33 como criterios negativos

| Prohibición fuente | Criterios que la contrastan |
|---|---|
| SM-FORB-01 | AC-008–009. |
| SM-FORB-02 | AC-007/013/075. |
| SM-FORB-03 | AC-020/086–087. |
| SM-FORB-04 | AC-016/023/025–026. |
| SM-FORB-05 | AC-020/022. |
| SM-FORB-06 | AC-023. |
| SM-FORB-07 | AC-020–021/063/091. |
| SM-FORB-08 | AC-018/024/030. |
| SM-FORB-09 | AC-024/088. |
| SM-FORB-10 | AC-017–019/038. |
| SM-FORB-11 | AC-029/085; comprobación adicional de AC-092. |
| SM-FORB-12 | AC-021. |
| SM-FORB-13 | AC-029–031. |
| SM-FORB-14 | AC-025–026. |
| SM-FORB-15 | AC-027–028. |
| SM-FORB-16 | AC-045–046. |
| SM-FORB-17 | AC-044/046. |
| SM-FORB-18 | AC-031/035/052. |
| SM-FORB-19 | AC-036. |
| SM-FORB-20 | AC-050–051. |
| SM-FORB-21 | AC-087. |
| SM-FORB-22 | AC-053–056/078. |
| SM-FORB-23 | AC-058–059/062. |
| SM-FORB-24 | AC-052/060. |
| SM-FORB-25 | AC-047–048. |
| SM-FORB-26 | AC-032–040/044. |
| SM-FORB-27 | AC-027/055/057/066/069–073. |
| SM-FORB-28 | AC-076–077. |
| SM-FORB-29 | AC-064–065/082. |
| SM-FORB-30 | AC-005–006. |
| SM-FORB-31 | AC-012–017/084. |
| SM-FORB-32 | AC-003/062/075. |
| SM-FORB-33 | AC-039/041–043/076. |

### 28.4. Architecture / ARCH-DEC-001–018

| Decisión aprobada / sección ARCH | Requisitos derivados | Criterios |
|---|---|---|
| ARCH-DEC-001, §§2–3: monolito modular | SPEC-NFR-011/015; §§4/6/22: núcleo y adaptadores con responsabilidades delimitadas. | AC-071/084. |
| ARCH-DEC-002, §§4–5/9–10: Supabase | SPEC-FR-SEC-001–002; SPEC-FR-HIST-004; SPEC-FR-CONC-003/005. | AC-064/068–069/074. |
| ARCH-DEC-003, §4: clases de información | SPEC-FR-INT-001; SPEC-FR-HIST-003/005; §13. | AC-020/066/088. |
| ARCH-DEC-004, §§5/14: Auth, permisos, MFA | SPEC-FR-SEC-001–004; SPEC-NFR-002. | AC-064–065/080. |
| ARCH-DEC-005, §6: interfaces subordinadas | SPEC-FR-INT-002; SPEC-FR-CONC-001/003; SPEC-NFR-015, sin diseño físico. | AC-064/067–068/082/084. |
| ARCH-DEC-006, §§7–8: adaptadores sustituibles | SPEC-FR-INT-001–005; SPEC-NFR-011. | AC-066/071/088. |
| ARCH-DEC-007, §8.3: calendario | SPEC-FR-COORD-008; SPEC-FR-IDEMP-004. | AC-043/076. |
| ARCH-DEC-008, §8.6: web separada | SPEC-FR-INT-005; SPEC-FR-SEC-003; §6. | AC-065/084. |
| ARCH-DEC-009, §8.5: Avaibook | SPEC-FR-INT-006. | AC-077. |
| ARCH-DEC-010, §9: objetos privados | SPEC-FR-HIST-003–004; SPEC-FR-SEC-005. | AC-073–074/082. |
| ARCH-DEC-011, §10: automatismos específicos | SPEC-FR-COORD-001–004; SPEC-FR-CONC-006. | AC-050/070/083. |
| ARCH-DEC-012, §11: aprobación exacta | SPEC-FR-HA-001–005. | AC-053–057. |
| ARCH-DEC-013, §12.1: idempotencia | SPEC-FR-IDEMP-001–004; SPEC-NFR-006. | AC-015/027–028/055/066. |
| ARCH-DEC-014, §12: concurrencia/consistencia | SPEC-FR-CONC-001–004; SPEC-NFR-007–008. | AC-027/030/055/067–068/074. |
| ARCH-DEC-015, §10: jobs/outbox | SPEC-FR-CONC-005–006; SPEC-FR-IDEMP-002. | AC-057/069–070/073. |
| ARCH-DEC-016, §13: historia/auditoría | SPEC-FR-HIST-001–006; SPEC-NFR-009–010/012. | AC-007/061–063/075/081/085/088. |
| ARCH-DEC-017, §16.2: entornos | SPEC-NFR-004; SPEC-FR-SEC-005. | AC-079. |
| ARCH-DEC-018, §§2/6: Next.js App Router | SPEC-NFR-015; §§6/20/22: lógica sensible en servidor, sin versión concreta/UI/API física. | AC-064/082/084. |
| ARCH §§13–15/18: fallos, privacidad, recuperación y pendientes | SPEC-FR-ERR-001–002; SPEC-FR-SEC-005–007; SPEC-NFR-003/005/010/014; §26. | AC-057/065/070–074/078–082/088/090. |

### 28.5. D001–D021

| Decisiones vigentes | Aplicación en SPEC 001 | Criterios |
|---|---|---|
| D001 — Nombre | Título/§1. | AC-084/089. |
| D002 — Work Local | SPEC-NFR-004/015; sin cambios del entorno. | AC-079/084. |
| D003 — GitHub | §1/3; SPEC-NFR-001/015; publicación documental verificable. | AC-084/089. |
| D004 — Supabase | §§7/13/20/22; SPEC-FR-SEC-001, SPEC-FR-INT-001. | AC-064/066. |
| D005 — Vercel | SPEC-NFR-015; sin configuración ni despliegue. | AC-084. |
| D006 — SDD | §§1/6/29–30; SPEC-NFR-015. | AC-084/089. |
| D007 — Aplicaciones separadas | SPEC-FR-INT-005; §6. | AC-065/084. |
| D008 — Facturación | SPEC-FR-SEC-007; §26. | AC-056/078. |
| D009 — Supervisión | SPEC-FR-HA-001–005. | AC-053–057. |
| D010 — Catálogo/cantidades/precio | SPEC-FR-CAT-001–007; SPEC-FR-PROP-003/005; SPEC-FR-ECON-014. | AC-010–011/017–019/049/085. |
| D011 — Comercial/cobros/cancelación | SPEC-FR-COM/PROP/ACC/CHG; SPEC-FR-ECON-001–007/012. | AC-004–016/023–043. |
| D012 — Operación y cierres | SPEC-FR-BOOK/SVC/CLOSE; SPEC-FR-COORD-006. | AC-017–024/029–031/052/058–063. |
| D013 — Fondos/honorarios/Tararí | SPEC-FR-ECON-009–014; SPEC-FR-ACC-005; §26. | AC-044–049/078. |
| D014 — Fronteras/prioridad | SPEC-FR-INT-001–006; SPEC-FR-COORD-008; §26. | AC-066/071/076–077/088/090. |
| D015 — Usuario V1 | SPEC-FR-SEC-001–004; §7. | AC-064–065/080. |
| D016 — Comunicación/IA/automatización | SPEC-FR-COORD-001–004/007; SPEC-FR-HIST-003/005; SPEC-FR-HA; SPEC-FR-CONC-006. | AC-024/050/053–057/070/083/087–088. |
| D017 — Identidad/documentos/historia | SPEC-FR-ID; SPEC-FR-HIST; SPEC-FR-SEC-006. | AC-002–003/019/062/075/088. |
| D018 — Selección/directa/unidad V1 | SPEC-FR-ACC-003; SPEC-FR-COM-002; SPEC-FR-BOOK-001–003. | AC-012–017/090. |
| D019 — Bases económicas | SPEC-FR-CHG-007–008; SPEC-FR-ECON-005–007/012–013. | AC-027/032/037–040/044/047/090. |
| D020 — Días naturales/referencia | SPEC-FR-CHG-009; SPEC-FR-ECON-001–002; SPEC-FR-COORD-003/008; §11.2. | AC-033/039/041–043/076/090. |
| D021 — Architecture APPROVED | §§1/3/26/28.4; no aprobación nueva de Spec. | AC-084/090. |

## 29. Exit Criteria — Ready for plan.md

La revisión documental del borrador no sustituye aprobación humana. Para declarar Ready for plan.md deben satisfacerse y revisarse todos los puntos siguientes; después hará falta autorización para iniciar esa fase.

| Criterio de salida | Evidencia del DRAFT / comprobación requerida |
|---|---|
| Alcance y exclusiones explícitos | §§4–6; Core interno sin convertir la Spec en todo el producto. |
| Actores y confianza definidos | §§7/20; un Administrador V1 y facultades externas delimitadas. |
| Requisitos funcionales verificables | §§10/14–20/22 con precondiciones, resultado, error y fuente. |
| Guardas e invariantes cubiertos | §11 y §28.1–28.2; G1–G6 y DM-INV-001–052. |
| Transiciones y prohibiciones cubiertas | §12/23/28.3; máquinas fuente y criterios positivos/negativos. |
| Idempotencia, concurrencia y consistencia | §§17–18; Booking, fondos, versiones, eventos, aprobación y jobs. |
| Human Approval cubierta | §16; contenido exacto, intento/resultado y no doble efecto. |
| Errores, revalidación e incertidumbre | §19 y SPEC-FR-SVC-010; bloqueo material sin repetición peligrosa. |
| Seguridad y privacidad | §20; autorización servidor/datos, economía, MFA, minimización y secretos. |
| Historia, evidencia y auditoría | §§13–14/21; preservación con límites de privacidad. |
| Core frente a proveedor delimitado | §22; sin proveedores, API física ni capacidades no verificadas. |
| Criterios positivos, negativos y riesgos comprobables | §24 y §28.3; revisar guiones antes de derivar pruebas posteriores. |
| Pendientes localizados sin reglas inventadas | §§26–27; D018–D020 resueltos y ARCH-PENDING conservados. |
| Trazabilidad suficiente | §28 hacia P01–P20, Product, familias BR, 52 invariantes, SM, ARCH-DEC y D001–D021. |
| Sin contradicciones conocidas con APPROVED | Contraste documental completo; cualquier hallazgo posterior debe resolverse humanamente en su parte. |
| Aprobación humana explícita posterior | **PENDIENTE. No otorgada por esta ejecución, commit ni publicación.** |

Resultado actual: **NO READY FOR plan.md**. SPEC 001 sigue IN PROGRESS / DRAFT a la espera de revisión humana. Los pendientes heredados bloquean solo sus ámbitos, pero tampoco su carácter no bloqueante convierte el borrador en aprobado. plan.md y tasks.md conservan sus placeholders sin iniciar; no hay implementación.

## 30. Final Spec Status

**SPEC 001 Core CRM — DRAFT v0.1 / IN PROGRESS / NOT APPROVED.** Borrador completo para revisión humana, publicado sin aprobarlo. No se detectan contradicciones sustantivas conocidas con las fuentes APPROVED tras el contraste documental; las menciones históricas resueltas se interpretan conforme a D018–D020 y SM §19.2. Los riesgos/dependencias pendientes son los localizados en §26 y los datos/configuración aún por verificar, sin proveedores ni garantías inventadas.

Architecture v0.1 y ARCH-DEC-001–018 siguen APPROVED; D001–D021 siguen vigentes e intactas. ARCH-PENDING-001/002 siguen PENDING. SPEC-PENDING nuevos: ninguno. No se han ejecutado pruebas de software, integración, seguridad ni recuperación; los criterios son guiones verificables previos a implementación.

**No se ha iniciado ni modificado plan.md, tasks.md ni implementación. No se autoriza avanzar a ninguna otra fase.**
