# CRM HUESCAVENTURA OS — Plan de SPEC 001 Core CRM

## 1. Estado, autoridad y prerrequisitos

Status: DRAFT
Version: 0.1
Created: 2026-09-11
Last updated: 2026-09-11
Phase: 7 — Plan
Progress: IN PROGRESS — borrador completo, pendiente de revisión humana
Approval: NOT APPROVED
Ready for tasks.md: NO
Implementation: NOT STARTED

Este plan propone cómo implementar el Core interno definido por [SPEC 001](spec.md). Su publicación permite revisarlo; no aprueba el plan ni inicia [tasks.md](tasks.md), código, migraciones, infraestructura o despliegues. Los hitos de §9 son trabajo futuro, no tareas ejecutadas. Las Task del negocio no son las tareas SDD.

### 1.1. Base verificada

Repositorio: IAndresB/crm-huescaventura-os. Rama de trabajo: main. Base inicial: 346707ee484cd10e777be830dd4cc77762bd876b, coincidente con origin/main después de actualizar referencias, sin cambios previos en el árbol de trabajo. No se encontró AGENTS.md en el repositorio ni en sus directorios superiores.

| Fuente vigente, leída y contrastada | Versión / evidencia |
|---|---|
| [Constitution](../../docs/constitution.md) | APPROVED v1.0; P01–P20. |
| [Product](../../docs/product.md) | APPROVED v0.1. |
| [Business Rules](../../docs/business-rules.md) | APPROVED v0.2; BR-GOV-001 establece autoridad y precedencia. |
| [Domain Model](../../docs/domain-model.md) | APPROVED v0.1; DM-INV-001–DM-INV-052. |
| [State Machines](../../docs/state-machines.md) | APPROVED v0.1; G1–G6, 148 transiciones y SM-FORB-01–SM-FORB-33. |
| [Architecture](../../docs/architecture.md) | APPROVED v0.1, 2026-09-10; ARCH-DEC-001–ARCH-DEC-018. Aprobación [7d3a63f](https://github.com/IAndresB/crm-huescaventura-os/commit/7d3a63ff47f841fc288cce63f1d5263d6a9975ac), D021; registro d128292363f7664fc821f1999a7884aaa3870ca7 y limpieza editorial posterior 70921fa7a2407043bc7f4e3099cfeebe5590fc3f. |
| [SPEC 001](spec.md) | APPROVED / COMPLETED v0.1, 2026-09-10, Ready for plan.md: YES. Aprobación [91fc752](https://github.com/IAndresB/crm-huescaventura-os/commit/91fc7527af9fd529e475116d1d212fd2328994d9), D022; coordinación 346707ee484cd10e777be830dd4cc77762bd876b. |
| [DECISIONS](../../docs/DECISIONS.md) | D001–D022 APPROVED; sin nuevas decisiones aprobadas por este plan. |
| [PROJECT-STATUS](../../docs/PROJECT-STATUS.md), [NEXT-STEPS](../../docs/NEXT-STEPS.md), [README](../../README.md), plan anterior | Coordinación y placeholder contrastados; no sustituyen aprobación ni crean reglas. |

La instrucción humana de 2026-09-11 autoriza preparar, revisar y publicar esta fase documental. Rigen Constitución → decisiones aprobadas / Product → Business Rules → DM / SM / Architecture → SPEC aprobada → plan y tareas. Las tablas normativas de SM prevalecen sobre sus diagramas. Una propuesta técnica de este DRAFT no modifica ninguna fuente APPROVED.

D018, D019 y D020 concretan respectivamente selección parcial/directa/unidad V1, bases económicas y días naturales. SM-PENDING-001/002/003 son históricos resueltos; BR-PENDING-027/023/036 y DM-PENDING-001/003/004 se leen con esas resoluciones. No se reabren sus alcances ni se habilita split/merge extraordinario.

### 1.2. Observación de coherencia previa a redactar

**PLAN-OBS-001:** AC-084 conserva literalmente «Sigue DRAFT/NOT APPROVED», mientras D022 y SPEC §§1/29/30 acreditan APPROVED. También quedan frases históricas sobre plan no iniciado o aprobación futura en SPEC §§1/6/15/27/29/30 y referencias de fin de fase en fuentes anteriores.

La aprobación está acreditada; esas frases no anulan D022 ni esta autorización posterior. No bloquean redactar este DRAFT. Se conserva la observación para que Andrés confirme el tratamiento documental de AC-084 antes de cerrar la revisión del plan (§12, PLAN-PENDING-001). No se modifica la SPEC ni se declara satisfactorio AC-084 en su literal desactualizado. Su control permanente de no avanzar por mera publicación se mantiene en §13.

## 2. Objetivo, alcance y exclusiones

El resultado previsto es un Core que, mediante operaciones internas autorizadas, permita reconstruir una oportunidad real hasta una Booking cerrada: qué se propuso y aceptó, qué alcance se convirtió, qué se prestó/canceló, cómo se justificó cada importe, qué sigue pendiente y por qué se resuelve o reabre cada cierre.

Se incluyen los ámbitos de SPEC §§4–5 y sus controles transversales: identidades, catálogo mínimo versionado, comercial, cantidades por servicio/noche, operación, economía operativa, modificaciones, coordinación, evidencias, supervisión y fronteras genéricas. La entrada manual autorizada permite acreditar hechos externos sin conector. La salida puede ser una intención pendiente; nunca equivale a entrega, pago o aceptación externos.

El plan desarrolla mecanismos, responsabilidades, contratos lógicos, secuencia y verificación. No contiene SQL/DDL, esquema físico de tablas/columnas/índices, políticas RLS concretas, payloads o endpoints definitivos, pantallas/componentes UI ni configuración ejecutable. Esos detalles solo se derivarán después de aprobar el plan y autorizar las fases siguientes, mediante cambios revisables que respeten la SPEC.

Se mantienen las exclusiones de SPEC §6:

- Conectores reales o selección/configuración de Telefonía IA, WhatsApp, email, Google Calendar, pagos, Avaibook y PLAUD; web pública, formularios, portales y atención omnicanal completa. Tampoco se integra un proveedor de IA por este plan.
- Usuarios operativos adicionales, permisos granulares futuros, autonomía sensible de IA o envíos comerciales automáticos genéricos.
- Facturación legal/numeración/motor fiscal, conclusiones jurídicas de suplidos/Tararí, texto del mandato, política RGPD definitiva y audio por defecto.
- División/agrupación extraordinaria de Opportunities/Bookings, ERP, analítica avanzada, campañas, catálogo avanzado y aplicación móvil nativa.
- En esta fase: desarrollar tasks.md, instalar dependencias, implementar código, ejecutar migraciones, crear recursos o desplegar.

La aceptación técnica del Core no acreditará interfaces físicas, conectores ni un producto completo listo para uso real. El despliegue previsto de §11 es una condición futura, con autorización y dependencias propias.

## 3. Decisiones aprobadas y propuestas del plan

### 3.1. Base obligatoria ya aprobada

| Base arquitectónica | Aplicación en el plan |
|---|---|
| ARCH-DEC-001, ARCH-DEC-005, ARCH-DEC-018 | Una aplicación modular Next.js App Router en Vercel; interfaces subordinadas a aplicación/dominio. |
| ARCH-DEC-002, ARCH-DEC-003, ARCH-DEC-004 | Supabase canónico y clases de información con fuente/certidumbre; Auth aprobado, identidad CRM separada, autorización servidor/datos y MFA Production. |
| ARCH-DEC-006, ARCH-DEC-007, ARCH-DEC-008, ARCH-DEC-009 | Adaptadores sustituibles; calendario CRM canónico; web separada; Avaibook solo consulta V1. |
| ARCH-DEC-010, ARCH-DEC-016 | Objetos privados, metadatos canónicos, estado vigente e historia/versiones; sin event sourcing. |
| ARCH-DEC-011, ARCH-DEC-012, ARCH-DEC-015 | Automatismos específicos, aprobación exacta y jobs/outbox persistidos; sin motor genérico ni broker. |
| ARCH-DEC-013, ARCH-DEC-014 | Idempotencia, concurrencia, unidad interna atómica y consistencia eventual externa. |
| ARCH-DEC-017 | Development, Staging y Production separados; Work Local Mac permanece como entorno principal. |

### 3.2. PLAN-DEC — propuestas técnicas para revisión

**Todas las filas son PROPOSED, no APPROVED.** Son elecciones del plan; sus fundamentos de negocio ya aprobados no se someten de nuevo a elección. No se copian como decisiones aprobadas a DECISIONS.md.

| ID | Propuesta y motivo | Verificación / límite |
|---|---|---|
| PLAN-DEC-001 | TypeScript estricto y runtime Node.js para la capa servidor; dominio sin dependencias de Next.js, SDK o transporte. Interfaces de persistencia y adaptadores estrechas, sin framework de dominio adicional. | H0 comprueba compatibilidad de versiones soportadas, build y frontera servidor. Versiones exactas y lockfile se fijarán al iniciar la implementación autorizada; ninguna dependencia instalada ahora. |
| PLAN-DEC-002 | Acceso a PostgreSQL desde repositorios de servidor con transacciones explícitas y un rol técnico limitado, distinto del propietario de tablas y sin BYPASSRLS. Datos Core en ámbito no expuesto a acceso directo del navegador; Auth no concede CRUD arbitrario. | §6 define contexto confiable por transacción y controles de datos. H0 debe demostrar que el canal API directo no elude reglas; no usar postgres/service_role como identidad ordinaria de negocio. |
| PLAN-DEC-003 | Identidades técnicas estables, relaciones estructuradas y versiones inmutables. Snapshots para contenido aplicado; estado vigente con historial añadido en cada cambio material. | §5; ninguna bolsa JSON sustituye relaciones, cantidades, fondos o restricciones verificables. Sin cascadas destructivas de historia. |
| PLAN-DEC-004 | Versión esperada para detectar edición obsoleta, restricciones de unicidad y serialización corta en PostgreSQL para fondos, conversión, aprobación y cierre. | §7; bloquear también la raíz compartida que protege un cálculo agregado, no solo filas hijas existentes. Sin locks distribuidos. |
| PLAN-DEC-005 | Human Approval refiere una versión inmutable del contenido/efecto y su alcance; identidad de efecto separada de cada intento. | §8; no hace falta una firma legal ni un hash para sustituir la evidencia. Cambio material crea nueva revisión; aprobación no es reutilizable para otro efecto. |
| PLAN-DEC-006 | Aritmética decimal exacta y cantidades con unidad explícita; preservar precisión interna y materializar importes visibles/cobrados a 2 decimales conforme a una política reproducible. | D010/P20; no usar coma flotante binaria para importes definitivos. Regla de desempate y punto de redondeo aún requieren PLAN-PENDING-002; no se inventa reparto de céntimos. |
| PLAN-DEC-007 | Acceso provisionado para el único Administrador, sin registro público; propuesta de contraseña con MFA TOTP. Sesión verificada en servidor y habilitación vigente del CRM Actor consultada en cada operación. | §6; proveedor Auth y obligación MFA ya aprobados. Perfil de sesión y recuperación del único usuario requieren PLAN-PENDING-003 antes de uso real. |
| PLAN-DEC-008 | Pruebas de dominio deterministas, integración con PostgreSQL/Auth/Storage aislados y pruebas de contratos de aplicación; dobles controlados para canales externos. | §10; no sustituir pruebas de permisos, concurrencia o rollback por mocks. Sin exigir UI/conectores fuera de alcance para verificar el Core. |
| PLAN-DEC-009 | Proyecciones consultables desde datos canónicos; empezar con lecturas autorizadas y reconstruibles, sin caché compartida de expedientes o sesiones. Jobs acotados e intenciones externas conservadas pero sin ejecutores de conectores reales. | §8; optimización solo tras medir. El scheduler y sus parámetros operativos se verificarán en la fase autorizada; no se presupone entrega ni frecuencia. |

## 4. Bloques, componentes y responsabilidades

Los PLAN-B identifican bloques de implementación lógica, no microservicios ni tablas. Cada bloque usa G1–G6, el contrato de §7 y las pruebas de §10.

| Bloque | Componentes / responsabilidad | Colaboración y límite |
|---|---|---|
| PLAN-B01 — Base y seguridad | Adaptación Next.js, contexto Auth/CRM Actor, autorización, persistencia transaccional, permisos, configuración y errores. | Server Actions internas y futuros handlers HTTP delegan en aplicación. No decisiones de negocio en UI ni permisos derivados de parámetros del cliente. |
| PLAN-B02 — Identidades y catálogo mínimo | Contact/Organization/Group, relaciones, duplicados, códigos humanos; versiones de catálogo, proveedores/ofertas, unidades, reglas y tarifas. | Mantiene referencias estables para comercial/operación. No confirma disponibilidad por catálogo ni fusiona personas automáticamente. |
| PLAN-B03 — Contratación | Lead/Opportunity, alternativas, preparación/fijación, modalidad, términos, Acceptance, conversión normal/directa. | Compone una Booking con alcance aceptado y cantidades de origen. No paga ni confirma servicios. |
| PLAN-B04 — Operación | Booking Service, asignaciones/noches, horario/lugar, disponibilidad, opciones, confirmación interna/externa, preparación, ejecución y revalidación. | Evalúa confirmación de Booking con economía y requisitos actuales; no los crea por arrastre. |
| PLAN-B05 — Economía | Obligaciones, recepciones, conciliación/asignaciones, fondos ajenos, factura/pago externo, Fee/costes, cálculo, Refund y fianza. | Determina y conserva porciones; consume bases comerciales verificadas. No motor fiscal ni transferencia bancaria real. |
| PLAN-B06 — Cambios y cierres | Booking Modification y cancelación por alcance; evaluación de derecho D019/D020; Closure Assessment dentro de Booking. | Coordina B03/B04/B05 y evidencia; aplica partes independientes. No absorbe sus estados ni borra hechos. |
| PLAN-B07 — Evidencia y coordinación | Document/Required Document, Communication, originales/derivados, Review, Task, Incident, Alert/Notification, timeline/calendario. | B01 protege datos; B08 agenda efectos. Cerrar trabajo no acredita el hecho que lo motivó. |
| PLAN-B08 — Supervisión y ejecución | Human Approval, registro idempotente, Definition/Execution Record, jobs/outbox, reclamación y recuperación. | Reutiliza aplicación y permisos específicos del efecto; IA no se autoaprueba. |
| PLAN-B09 — Fronteras externas | Source/Reference/Event, entrada normalizada y salida genérica con resultados/evidencias. | Contratos de prueba/manuales, sin conectores. Conserva autoridad externa, intención/resultado separados y rechazo de escritura Avaibook. |
| PLAN-B10 — Validación y entrega futura | Trazabilidad de pruebas, migraciones revisadas, observabilidad, recuperación y criterios de release. | No declara Production lista sin dependencias resueltas ni autoriza despliegue por sí solo. |

Dependencia de código propuesta: interfaces → servicios de aplicación → dominio y puertos; adaptadores implementan puertos. El dominio no importa adaptadores. La composición de la aplicación conecta los módulos. Una lectura puede reunir contexto permitido, pero ninguna escritura salta la responsabilidad del módulo propietario.

## 5. Datos, integridad, histórico y migraciones

### 5.1. Representación prevista

| Área | Estrategia de conservación / integridad |
|---|---|
| Identidad | IDs estables independientes de email/teléfono y proveedor. Designaciones contextuales con vigencia/historia. Fusión humana conserva identidades de origen, relaciones y acceso a ambos historiales. |
| Códigos humanos | Asignación serializada por tipo y año para Opportunity, Proposal, Booking e Incident; unicidad y registro de códigos emitidos no reutilizables. La convención de año se documentará al configurar la serie; no se usa un cálculo concurrente de máximo más uno sin protección. |
| Contratación | Relación obligatoria Proposal → Opportunity y Version → Proposal; Acceptance conserva versión/términos/alcance exactos y verificación separada. Preparación editable distinta de versión fijada. Booking referencia cadena válida y conserva la unicidad V1 por Opportunity. |
| Catálogo aplicado | Versionar definición y asignación de categorías, atributos, públicos/recomendaciones, unidades, formas de precio, tarifas, packs, promociones y requisitos materiales. Conservar referencias a versiones retenidas y snapshot cuando sea necesario para reconstruir el uso. |
| Cantidades | Separar cantidad/unidad de cobro, asistentes estimados/confirmados y asignación nominal opcional. Detalle nocturno único dentro de la asignación; lista parcial explica el agregado, no se suma. Cada contribución de modalidad conserva su origen. |
| Operación | Progreso base separado de Incidencia y Review. Evidencia y cobertura actual distintas. Versionar cambios y mantener fecha/hora/localización solicitadas, alternativas y resultado acreditado. |
| Economía | Relaciones explícitas de obligación, movimiento, porción, destino/finalidad, asignación y comprobación. Precisión decimal, moneda y tratamiento IVA conocidos; incertidumbre nunca almacenada como cero. Fianza/Refund pueden referir el mismo movimiento sin duplicarlo. |
| Historia y evidencia | Registro vigente más versiones, cambios, momentos de hecho/registro, causa y actores diferenciados. Originales, derivados y estado real de conservación enlazados. Sin event sourcing ni datos personales repetidos indiscriminadamente. |
| Trabajo técnico | Identidad de operación/efecto, versión de contenido, resultado conocido, intentos, aprobación e incertidumbre persistidos. Su retención debe preservar deduplicación y respetar la política de privacidad aprobada. |

Las relaciones cuya ausencia invalida un hecho se protegerán con integridad referencial y restricciones en la futura base. Los borradores incompletos no tienen las mismas precondiciones que el compromiso definitivo. No se exigen datos finales al captar un Lead. Los vínculos entre cliente/proveedor/servicio/fondos se verifican además en aplicación.

La inmutabilidad debe resistir una escritura directa con el rol ordinario: las futuras restricciones/permisos impedirán actualizar o borrar versiones fijadas, Acceptance y confirmaciones históricas. Una corrección añade relación al original y reevaluación; no vuelve mutable el hecho. Los cambios administrativos seguirán P13, incluso permisos, funciones, restricciones y RLS.

### 5.2. Importes y tiempo

El cálculo de dominio recibe cantidades/unidades, versiones y datos verificados; devuelve componentes, resultado, certeza y bloqueos. El snapshot aplicado conserva entradas y versión del cálculo, precio calculado/final manual y motivo. Tararí utiliza únicamente la configuración histórica aprobada de SPEC §10.9; los costes de extras y la tabla maestra ausente no se rellenan.

D019 determina la base antes de ajustar fondos: modalidad concreta del/de la novi@ o de la persona cancelada; fijo/grupal sin prorrateo; componente sin valor verificable espera determinación explícita del Administrador. La capa de cálculo no escoge distribución ni usa saldo disponible como derecho contractual.

Para D020 se utilizará un concepto de fecha civil local distinto de un instante. La zona aplicable y su procedencia permiten convertir momentos a fecha local; no se fija Europe/Madrid universalmente por el entorno del desarrollador. SPEC §11.2 gobierna las referencias de Booking, modalidad, servicio y noche. La diferencia es entre fechas, no milisegundos/horas. Cambio de hora no cambia intervalo; cambio de fecha reevalúa solo dependencias. Un vencimiento horario explícito de proveedor conserva su propio significado.

PLAN-PENDING-002 se limita a desempates/punto de redondeo numérico: no reabre D019, D020, EUR, 2 decimales ni la ausencia de redondeo comercial automático. Hasta su resolución se pueden verificar cálculos exactos sin ese supuesto; un resultado dependiente no se presenta definitivo.

### 5.3. Objetos y metadatos

Se propone Supabase Storage privado dentro de la frontera aprobada de object storage. Metadatos, finalidad, relaciones y estado de conservación residen en el Core. Preparar carga, acreditar objeto y vincularlo son pasos recuperables; no una transacción ACID entre servicios. La referencia privada no se publica ni equivale a autorización.

Una carga incompleta, objeto ausente o fallo de metadatos conserva su situación y permite reparación idempotente. Sustituir un original relevante crea versión; no sobrescribe la evidencia de una aceptación. La limpieza de objetos huérfanos o datos personales no se ejecuta sin política autorizada. La eliminación de identidad Auth no debe arrastrar el historial del CRM Actor.

### 5.4. Evolución mediante migraciones

Toda futura estructura, permiso, RLS, función, índice o transformación de datos se incorporará mediante migración versionada y revisable. La secuencia será: base de acceso/auditoría → identidades y catálogo → contratación/operación → economía y cambios → coordinación/ejecución, siguiendo las dependencias de H0–H5. No se crean archivos de migración aquí.

Cada paquete deberá especificar propósito e IDs de origen, precondiciones, impacto de bloqueo, compatibilidad con aplicación anterior/nueva, validación de datos y recuperación. Se comprobará en base vacía y actualización desde la versión anterior con fixtures sintéticos: conservación de identidades, snapshots, porciones, historial y permisos.

Los cambios futuros preferirán expansión compatible, transformación comprobada y retirada posterior solo si es segura y autorizada. No se borran datos para lograr que una restricción pase; inconsistencias quedan diagnosticadas. Un rollback de aplicación solo es válido si sigue siendo compatible con el esquema. Para datos con nuevos hechos se prefiere reparación hacia delante; una restauración se ensaya y concilia antes de reanudar efectos.

Los valores de prueba no se convierten en catálogo real. Cargas iniciales de tarifas/capacidad requieren fuente, vigencia y revisión; las ausencias se mantienen pendientes. No se importa una base histórica ni se presupone su existencia.

P13 conserva íntegra su excepción break-glass: intervención mínima de administrador autorizado en emergencia crítica, registro de motivo/actor/cambios y migración equivalente inmediata en Git. No se utiliza como vía ordinaria de configuración.

## 6. Autenticación, autorización y protección de datos

Supabase Auth identifica al usuario; un CRM Actor estable y su habilitación vigente autorizan el uso interno. Cada consulta, búsqueda, exportación, acción y lectura de resultado idempotente comprueba identidad, acción, alcance y finalidad. Un job conserva identidad técnica limitada y responsable, sin hacerse pasar por el Administrador ni recibir todas sus facultades.

La propuesta de sesión usa el mecanismo soportado de Supabase para servidor, verificando token y expiración; no confía en una sesión aportada por el cliente sin verificación. El estado vigente del actor se consulta independientemente de claims antiguos. No se usan metadatos editables por el usuario como permiso. Logout, deshabilitación, revocación, expiración y recuperación deberán probarse conforme al perfil de PLAN-PENDING-003; verificar una firma no demuestra por sí solo que una sesión no haya sido revocada. Referencia técnica: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs).

Para Production se propone exigir nivel MFA acreditado antes de dar acceso al Core, con un ámbito mínimo separado para autenticación/enrolamiento/recuperación, sin lectura de expedientes. Factores, pérdida de dispositivo y recuperación requieren revisión de Andrés, sin crear otro usuario operativo. Development/Staging probarán también rechazo sin MFA. [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa) documenta su aplicación en servidor y datos; no se da por configurado.

PLAN-DEC-002 requiere:

- Conexión de servidor con rol de datos no propietario, sin BYPASSRLS ni capacidad ordinaria de administrar esquema/permisos; rol de migración separado. Consultas parametrizadas y secretos protegidos por entorno.
- Contexto de identidad/efecto inyectado únicamente por servidor tras verificar sesión o identidad técnica. Su alcance es la transacción; se limpia al terminar y nunca se hereda entre conexiones reutilizadas. Parámetros del cliente no pueden seleccionar ese contexto.
- Controles de base de datos que validen actor habilitado, alcance del ejecutor y contexto requerido; ausencia de contexto deniega. RLS obligatoria en cualquier tabla expuesta mediante Supabase y defensa adicional en datos privados; permisos y RLS se verifican conjuntamente.
- El navegador y los roles API genéricos no reciben DML directo sobre tablas Core ni funciones arbitrarias para saltar guardas. Los mecanismos de objetos/Auth conservan sus permisos específicos. Si una futura interfaz expone datos, necesita grants y políticas deliberados antes de exponerlos.
- Prueba de vistas, funciones y canales de acceso directo con identidad no autorizada, también fuera de la UI. No resolver un fallo de permisos introduciendo privilegios globales.

RLS restringe filas y se complementa con permisos, controles de escritura y proyecciones por finalidad; no sustituye guardas de negocio ni protege por sí sola cada campo de una salida. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) distingue permisos de acceso y políticas. La exposición por defecto ha cambiado; se inspeccionará la configuración real sin apoyarse en defaults: [cambio de Data API](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).

Las respuestas al Administrador y las salidas destinadas a terceros son proyecciones distintas con lista explícita de información permitida. Packs comerciales respetan BR-PACK-003. Costes, margen, beneficios, comisiones, honorarios/desgloses no se serializan hacia terceros, documentos externos, búsquedas/exportaciones o contexto IA sin autorización de esa finalidad. No se envía un objeto completo para ocultar campos en cliente.

Las interfaces futuras validarán entrada, origen y alcance; las solicitudes que modifican estado tendrán protección contra CSRF/replay según su transporte y autenticación. Se limitarán adjuntos y abuso con parámetros verificados, sin límites numéricos inventados. Las Server Actions también son invocables fuera de los controles visuales: [Next.js Authentication](https://nextjs.org/docs/app/guides/authentication).

Secretos y URLs temporales se excluyen de Git, documentación, logs y contexto IA. Credenciales privilegiadas no llegan al navegador. Los accesos a objetos requieren autorización y, cuando corresponda, URL temporal limitada; no se entrega una URL por conocer un ID. Se evitará caché compartida de sesiones o respuestas personales.

Minimización y conservación se aplican a originales, derivados, referencias, logs, copias y backups. DM-PENDING-005 y BR-PENDING-014/015/019/020 impiden activar tratamiento/borrado dependiente sin política o autorización válida. Se trabajará con datos sintéticos o material expresamente autorizado mientras corresponda. Archivado recuperable no acredita cumplimiento de retención ni cierre de Booking. P16 se mantiene: ninguna operación, aprobación o documento externo habilita emisión fiscal.

## 7. Flujos, contratos lógicos y límites transaccionales

### 7.1. Contrato común de aplicación

Cada operación material declara intención, entidad/alcance, versión esperada cuando corresponda, identidad de operación, datos y evidencias disponibles. El servidor aporta actor/autorización, origen confiable y momento de registro; no los acepta como facultades declaradas por el solicitante.

Flujo: autenticar y autorizar → validar entrada → reconocer operación previa → leer estado/evidencia actuales → evaluar G1–G6 y transición → confirmar unidad interna → devolver resultado permitido. Si existe un resultado previo, también se verifican permisos antes de leerlo. Una repetición equivalente reutiliza su resultado real; misma clave con contenido material distinto produce E2.

El resultado distingue efecto aplicado, resultado previo, parte pendiente y E1–E8 de SPEC §19, con referencias y causa permitidas. No añade estados de negocio. Se separan intento, persistencia, ejecución acreditada y resultado incierto. Un rechazo no revela información económica/personal al solicitante no autorizado.

| Contrato | Entrada y responsabilidad | Salida / control |
|---|---|---|
| PLAN-C01 — Consulta autorizada | Actor, finalidad, alcance/filtros; B01 coordina lectura de B02–B09. | Proyección mínima con procedencia/certidumbre, paginación cuando proceda y referencias; no autoridad sobre mutaciones. |
| PLAN-C02 — Decisión de dominio | Intención, estado actual, versiones, datos/evidencias y alcance; módulo propietario evalúa reglas. | Cambios permitidos o bloqueos específicos con IDs normativos; sin llamadas externas ni escritura oculta. |
| PLAN-C03 — Unidad de persistencia | Contexto confiable, cambios validados y precondiciones concurrentes; B01 ejecuta §7.2. | Hecho/historia/resultado/intención juntos o rollback; ninguna sucesión de peticiones REST independientes simula esa atomicidad. |
| PLAN-C04 — Registro de evidencia | Original o registro manual autorizado, fuente, momentos, identidad/alcance y revisión; B07/B09. | Evidencia recibida y conservación comprobada, candidata/verificada según acto; no confirmación por adjuntar. |
| PLAN-C05 — Intención y resultado externos | Efecto, destinatario, contenido/versiones, aprobación y referencia; B08/B09. | Intención persistida e intento/resultado acreditados por separado. Canal sin conector permanece pendiente. |
| PLAN-C06 — Evaluación y reevaluación | Hechos actuales y dependencias materiales de SM §16; B04/B05/B06/B07. | Evaluación por alcance, revisión y cambios permitidos; nunca confirmación o cierre por arrastre. |

Son contratos semánticos para diseñar y probar el Core; no son rutas, schemas API ni payloads definitivos.

### 7.2. Unidades internas

Cada unidad siguiente incluye historia material, resultado idempotente e intención persistida asociada cuando aplique. Las fuentes y permisos se revalidan antes de confirmar. Las referencias PLAN-T nombran límites de transacción, no tareas de tasks.md.

| Unidad | Cambios que deben confirmarse juntos | Concurrencia y separación |
|---|---|---|
| PLAN-T01 — Fijar versión | Nueva versión y composición/términos/snapshots, vínculo a preparación y relación de sustitución pertinente. | Proteger revisión de preparación y numeración de versión; la antigua permanece inmutable. Fijar no envía. |
| PLAN-T02 — Registrar/verificar Acceptance | Hecho identificado y términos; verificación como acto explícito, junto con Ganada si se solicita y cumplen SM-AC/SM-OP. | Puede conservarse Acceptance registrada pendiente de verificación si su identidad material existe. Candidata ambigua queda en Review. Conversión es acto separado. |
| PLAN-T03 — Convertir normal/directa | Booking con cadena comercial válida, servicios/modalidades/noches/cantidades de origen y referencias obligatorias. La vía directa compone los hechos reales faltantes de T01/T02. | Unicidad V1 por Opportunity más serialización sobre su identidad; un reintento recupera Booking existente. Preparación válida puede existir antes; nunca Booking visible incompleta. |
| PLAN-T04 — Cambiar alcance operativo | Efecto autorizado por servicio/noche, antes/después, evidencia, Review y reevaluaciones materialmente afectadas. | Proteger versión del alcance y evaluación padre pertinente; no modificar otras noches ni ratificar aspectos no cubiertos. |
| PLAN-T05 — Conciliar/asignar/ajustar | Correspondencia verificada, porciones/destinos, consumos/disponibles y cobertura de obligaciones afectadas. | Serializar sobre movimiento/fondos compartidos, no solo asignaciones hijas. Evitar 80 + 80 sobre 100, también frente a Refund. Sin transferencia real. |
| PLAN-T06 — Determinar y aplicar cambio | Evaluación D019/D020, autorización y cada conjunto de efectos internos dependientes de la misma base; nueva obligación/ajuste con fundamento cuando proceda. | Separar efecto operativo independiente de importe aún pendiente. El resultado parcial conserva qué falta; no toda modificación es una transacción gigante. |
| PLAN-T07 — Registrar salida económica real | Movimiento verificado y porciones de Provider Payment/Refund/fianza, referencias comunes, ajustes y reevaluaciones. | No duplicar una devolución por aparecer en Refund y Deposit. La ejecución externa precede a su registro acreditado; una anomalía abre revisión, sin aprobación retroactiva. |
| PLAN-T08 — Autorizar/reservar efecto | Aprobación exacta y, en el acto posterior de ejecución, consumo/reserva de la parte autorizada, intención y registro del intento pertinente. | Una misma parte no se reserva para dos efectos. Cambio material invalida aplicabilidad; aprobación histórica permanece. Resultado incierto conserva reserva hasta conciliar. |
| PLAN-T09 — Recibir o reclamar trabajo | Recepción + deduplicación + evento/evidencia; o reclamación exclusiva + identidad/generación de intento, según operación. | Recepción y aplicación separables. Reclamar no prueba ejecución. Una concesión vencida no autoriza reenviar si pudo ocurrir un efecto. |
| PLAN-T10 — Cierre y reapertura | Evaluación de cada dimensión solicitada, fundamentos y condición conjunta; evidencia posterior invalida solo evaluación afectada y retira cierre actual. | Los comandos que cambian insumos del cierre y el cierre mismo comparten versión/serialización de Booking. No puede cerrar sobre una factura/Refund que cambió concurrentemente. |
| PLAN-T11 — Fusión/archivado/corrección | Resolución humana, referencias de origen, vínculos y cambio de vista vigente con ambos historiales preservados. | Identidades/códigos no se liberan. Fusión no reatribuye hechos ni agrupa Opportunities/Bookings. |

Se propone aislamiento transaccional con lectura actual, restricciones y bloqueos de filas/raíces en orden estable. Las reglas sobre sumas o ausencia de filas se protegen mediante una raíz común o restricción adecuada; una comprobación previa fuera de la transacción no basta. H0/H3/H6 deberán ensayar intercalaciones que intenten vulnerar esas condiciones. Los bloqueos de PostgreSQL y el orden consistente reducen conflictos y deadlocks: [PostgreSQL Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html).

Un conflicto de versión vuelve a evaluación; no se reintenta ciegamente una decisión de negocio. Un fallo de serialización/deadlock solo permite repetir una unidad interna que se sabe abortada, con límites configurados y reevaluación. Si se perdió la respuesta a un commit, se consulta la misma identidad de operación; no se asume rollback. Nada de esto repite una acción externa incierta.

La transacción no permanece abierta esperando al humano, a un proveedor o a Storage. La conexión se gestiona de forma compatible con el entorno serverless y su pool; el contexto no depende de estado de sesión persistente. Se verificará el modo real y el soporte del driver antes de fijarlo: [Supabase conexiones y pool](https://supabase.com/docs/guides/database/connecting-to-postgres). Ninguna credencial de conexión se escribe en el plan.

### 7.3. Recorridos principales

- **Venta y conversión:** B02 identifica contexto → B03 prepara/fija versión → C04 conserva acuerdo real → T02 verifica Acceptance → T03 crea una Booking Pendiente de preparación. Selección parcial solo si ya seleccionable; en otro caso nueva versión previa. La vía directa reutiliza el mismo recorrido con hechos reales, sin Lead/envíos ficticios.
- **Preparación y prestación:** B04 conserva consulta/opción/confirmación por alcance. C06 combina cobertura crítica, economía B05 y requisitos B07 para evaluar Booking, sin fabricar ninguno. Hora alternativa/agenda avisa; fecha prevista no inicia ni termina prestación.
- **Fondos y documentos:** B05 registra detección, recepción, conciliación y asignación como hechos distintos. Factura externa, pago y cierre documental del suplido se comprueban por separado; honorarios/costes propios siguen reservados. Un pago real sin factura puede registrarse y sigue dejando pendiente el cierre.
- **Cambio o cancelación:** B06 conserva petición y evalúa impactos; confirma partes con evidencia del proveedor o responsable interno. D019/D020 determinan derecho antes de T05/T06/T07. Puede aplicar operación independiente y dejar economía pendiente; una cancelación no ejecuta Refund.
- **Cierre y evidencia tardía:** T10 evalúa comercial/operativo/económico independientemente. Solo las tres resueltas y las guardas permiten cierre conjunto. Evidencia posterior retira la condición actual si invalida un criterio, manteniendo cierre previo, operación y aceptación históricas.

## 8. Coordinación, supervisión, jobs y fronteras

Task/Incident/Required Document conservan las máquinas aprobadas. Las fechas/causas de Task provienen de BR-TASK-005 y SPEC-FR-COORD; se actualiza o reabre la misma necesidad con historia, sin duplicación por reintentos. Task no incorpora un estado En curso adicional; vencimiento y gravedad de Incident son dimensiones separadas.

La evaluación de avisos recibe fecha local y parámetros versionados. Sin fecha dentro de 2–3 días, adelanto o límite/pausa verificados se mantiene pendiente esa programación; no se inventan valores. Al superar completo un día límite D020 se puede generar revisión/aviso, nunca cobro/cancelación o cifra confirmada automática.

Todas las notificaciones internas se conservan en CRM para el Administrador. Las Críticas/Importantes generan intención WhatsApp; ningún aviso interno va a email. Sin conector WhatsApp, la intención sigue pendiente de entrega y la limitación visible. El fallo del propio aviso no genera recursivamente más avisos equivalentes.

B08 persiste Definition/version, operación e intentos, responsable, permisos, entradas mínimas, efecto y resultado. Reclamación atómica, trabajo acotado, pausa/detención y recuperación no dependen de memoria de proceso. Se distingue caída antes del efecto, efecto acreditado y resultado incierto tras contacto. Recuperar una reclamación vencida no constituye evidencia de que el intento anterior no ejecutó.

La aprobación humana fija acción, versión/contenido, destinatario, importe, condiciones, alcance y efecto. Antes de consumir su parte pendiente se revalidan datos/estado/permisos y correspondencia. Dos ejecutores comparten la identidad del efecto; no obtienen dos permisos por dos intentos. Una respuesta tardía se concilia con el intento original; un ejecutor obsoleto no puede sobrescribir un resultado nuevo. No se promete exactly once externo.

Las comunicaciones entrantes pueden registrarse recibidas sin borrador ficticio. Llamada manual autorizada y transcripción original PLAUD son evidencias distintas del resumen/IA. B07 registra extracción clara con procedencia y revisión; discrepancia contra dato manual confirmado conserva ambos y crea seguimiento. La asistencia recibe solo contexto autorizado; no se implementa motor avanzado ni se conecta un modelo externo.

B09 prepara contratos internos de entrada: verificación de origen/alcance → normalización → deduplicación/persistencia → evaluación. En esta SPEC se comprueban mediante registro manual y dobles de prueba; no se instalan webhooks o formularios reales. Entradas no verificadas se rechazan/aíslan sin efecto ni evidencia válida; eventos antiguos/ecos no hacen retroceder hechos actuales.

Los adaptadores futuros conservarán capacidad verificada, Source/Reference/Event y contrato de resultado; no se supone consulta, firma o deduplicación disponibles. D014 mantiene su prioridad de canales para otra fase. Avaibook no admite intención de escritura V1; Google Calendar solo aporta referencia/revisión y no gobierna la reserva. Un tercero no adquiere acceso al Core por aportar evidencia.

## 9. Secuencia de hitos, dependencias y criterios de salida

**Todos los hitos están NOT STARTED.** Antes de implementar cualquiera hacen falta aprobación del plan, autorización de tasks.md y de la implementación correspondiente. Cada salida exige pruebas de su alcance y evidencia registrada; una parte pendiente no se declara terminada.

Los controles B01/B07/B08 se incorporan desde el primer efecto, aunque su integración completa se verifique después. No existe una etapa funcional sin autorización, historial o idempotencia.

| Hito | Resultado previsto y bloques | Dependencias | Criterio de salida / bloqueo específico |
|---|---|---|---|
| H0 — Base técnica y seguridad | B01/B08/B10: composición modular, contexto Auth/actor, contratos C01–C06, unidad transaccional, permisos, historia y registro de efectos; estrategia de migraciones y entorno aislado. | Plan/tasks/implementación autorizados; compatibilidad técnica verificada. | Acceso denegado por defecto incluso fuera de UI; rol ordinario sin privilegio global; commit/rollback con historia; identidad no filtrada por pool. Perfil real de sesión/recuperación pendiente de PLAN-PENDING-003; las pruebas aisladas no habilitan Production. |
| H1 — Identidades, catálogo y cálculo base | B02/B05/B07: contexto, fusión humana, códigos; configuración/versiones, unidades, tarifas/packs y cálculo exacto con fuentes. | H0. | Casos de identidad/catálogo/cálculo de PT-01/PT-03/PT-07; los recorridos que requieren contratación/economía se completan en sus hitos posteriores. Histórico reproducible tras cambiar maestros; sin catálogo real inventado. PLAN-PENDING-002 bloquea completar la cuantización dependiente, no guardar catálogo ni probar aritmética exacta. |
| H2 — Contratación y conversión | B03/B04: oportunidades, propuestas, Acceptance, reserva directa/normal y detalle inicial por servicio/noche. | H1; T01–T03 y supervisión base H0. | PT-02 y cantidades de PT-03: una Booking íntegra bajo carrera/reintento; sin pago ni confirmación por Ganada. Precio definitivo dependiente de redondeo requiere PLAN-PENDING-002. |
| H3 — Economía operativa | B05: política/vencimientos, recepciones, conciliación/porciones, suplidos/documentos/pagos registrados, honorarios/costes y promoción. | H2 y evidencias B07; servicios identificados, sin exigir que ya estén confirmados. | Casos de recepciones/suplidos/cálculo de PT-04/PT-07 y T05/T07: fondos no duplicados, factura/pago separados y economía reservada. Fiscalidad/tipos/mandato y datos ausentes bloquean solo su efecto; emisión fiscal excluida. Refund/fianza completos se integran en H4. |
| H4 — Operación, cambios y cancelación | B04/B06/B05: disponibilidad/opciones/confirmación, preparación/ejecución, revalidación, modificación, D019/D020, Refund y fianza. | H2 + H3; requisitos/documentos/incidencias mínimos B07. | PT-03/PT-05/PT-06; confirma Booking con economía real integrada; cancelación parcial mantiene resto/historia; cobro/devolución externos solo registrados con prueba. Base incierta exige determinación humana por expediente. |
| H5 — Coordinación y cierre integrado | B06/B07/B08/B09: seguimiento/avisos, timeline/calendario, supervisión/intenciones/jobs completos y tres cierres/reapertura. | H3 + H4; fundamentos de seguridad e historia ya presentes. | PT-08/PT-09/PT-10/PT-12; causas/avisos y aprobación/ejecución separados; sin envío real por mocks. Parámetros de automatismo y tratamiento de comunicaciones bloquean exclusivamente lo dependiente. |
| H6 — Validación y preparación de entrega | B10 y todos los bloques: E2E-01–E2E-07 del Core, regresión, seguridad, migración, concurrencia, fallos y ensayo de recuperación aislado; informe de limitaciones. | H0–H5 completos en su alcance verificable. | Matrices §10, ninguna prueba obligatoria sin evidencia. Para declarar preparación de Production: PLAN-PENDING-003, ARCH-PENDING-002 y políticas/datos necesarios resueltos. UI/conectores y despliegue no quedan ejecutados ni acreditados. |

Secuencia principal: H0 → H1 → H2 → H3 → H4 → H5 → H6. Dentro de cada hito pueden prepararse pruebas y contratos de partes independientes. La confirmación completa de Booking se integra en H4 porque consume economía H3; no se valida definitivamente en H2 con un sustituto. El cierre conjunto espera H5 porque depende de modificaciones, obligaciones, documentos e incidencias. No se alteran prioridades de integraciones externas al ordenar dependencias internas.

## 10. Estrategia de pruebas y trazabilidad

### 10.1. Niveles y evidencia exigida

- Dominio: casos tabulados y propiedades de cálculo, unidades, días naturales, guardas y dependencias, usando reloj y fuentes controlados. Los oráculos salen de SPEC/SM/D/BR, no de volver a ejecutar la implementación como expectativa.
- Aplicación y persistencia: PostgreSQL real aislado, transacciones, restricciones, permisos/RLS, inmutabilidad, concurrencia, migraciones y pérdida de respuesta. Dobles de repositorio no acreditan estos controles.
- Auth/objetos: sesión válida/no válida, actor inhabilitado, MFA, revocación/recuperación; carga parcial, referencia sin objeto, acceso indebido y coherencia de restauración. Configuración equivalente en las propiedades que se pretenden verificar.
- Contratos de frontera: entradas duplicadas/antiguas/ambiguas/no verificadas, capacidad ausente, respuesta tardía y timeout; simulación de proveedor con estado propio para comprobar que no se repite un efecto. Ninguna prueba afirma integración real.
- Recorridos completos del Core: E2E-01–E2E-07 a través de aplicación/persistencia, sin sustituir guardas por estado sembrado arbitrariamente. La futura interfaz física requerirá su alcance y verificación propios; no está cubierta por estos recorridos internos.

Cada resultado futuro registrará commit, entorno/versiones, IDs FR/NFR/AC/DM/SM, datos sintéticos, ejecución, esperado/observado y limitaciones. Estados de evidencia: NO EJECUTADA, SATISFACTORIA, FALLIDA o BLOQUEADA con causa. No se aceptará cobertura nominal como prueba pasada.

Se ensayarán ambos órdenes y solapamiento de operaciones concurrentes, reintento tras perder respuesta y fallo antes/después de cada frontera crítica de T01–T11. Los casos negativos comprobarán ausencia de efectos colaterales, historia conservada y que el rechazo no filtra datos. Cambiar un hecho que alimenta un cierre se probará en carrera con el propio cierre.

### 10.2. Familias de pruebas y los 92 criterios

Cada AC tiene una familia principal abajo; las pruebas transversales se aplican además cuando correspondan. Rangos con prefijo completo incluyen todos sus identificadores intermedios.

| Familia | AC de la SPEC | Propósito / hitos |
|---|---|---|
| PT-01 | AC-001–AC-006, AC-062 | Identidad/contexto, mínimos comerciales, fusión, pérdida/reactivación, archivado/códigos. H1/H2/H5. |
| PT-02 | AC-007–AC-016, AC-075, AC-086 | Inmutabilidad, vigencia, aceptación, selección, cadena directa/conversión y rectificación. H2. |
| PT-03 | AC-017–AC-024, AC-085, AC-091–AC-092 | Modalidades/noches, catálogo, capacidad/confirmación, revisión y ejecución/agenda. H1/H2/H4. |
| PT-04 | AC-025–AC-028 | Obligación, recepción, correspondencia, concurrencia de fondos y duplicados. H3/H4. |
| PT-05 | AC-029–AC-034, AC-037, AC-039–AC-043 | Modificación/cancelación, base individual/fija/parcial y fechas D019/D020. H4. |
| PT-06 | AC-035–AC-036, AC-063 | Devolución/fianza parcial, hecho sobrevenido y ausencia de aprobación retroactiva. H4. |
| PT-07 | AC-038, AC-044–AC-049 | Promoción, suplidos/documentos, rentabilidad, Tararí, unidades y precisión. H1/H3/H4. |
| PT-08 | AC-050–AC-052, AC-070, AC-076, AC-083, AC-087–AC-088 | Task/documentos/incidencias, avisos, calendario, parámetros y originales/derivados. H5. |
| PT-09 | AC-053–AC-057 | Aprobación exacta, estado actual, consumo único e incertidumbre sensible. H0/H5. |
| PT-10 | AC-058–AC-061 | Tres cierres, límites de excepción y reapertura fundada. H5. |
| PT-11 | AC-064–AC-065, AC-078–AC-082 | Autorización/datos, prohibición fiscal, entornos, MFA, logs y entradas/objetos protegidos. H0–H6. |
| PT-12 | AC-066–AC-069, AC-071–AC-074, AC-077 | Eventos, versión, atomicidad, jobs, continuidad, restauración/objetos y frontera Avaibook. H0/H3/H5/H6. |
| PT-13 | AC-084, AC-089–AC-090 | Disciplina documental, aprobación y pendientes. Revisión de este plan y H6; AC-084 mantiene PLAN-OBS-001/PLAN-PENDING-001. |

### 10.3. Cobertura de los 116 requisitos funcionales

| Requisitos de SPEC | Bloques / desarrollo del plan | Hito principal / pruebas |
|---|---|---|
| SPEC-FR-ID-001–SPEC-FR-ID-005 | B02/B07; §5.1, T11. | H1; PT-01/PT-03. |
| SPEC-FR-COM-001–SPEC-FR-COM-005 | B03; §7.3, C02, T02. | H2; PT-01/PT-02. |
| SPEC-FR-CAT-001–SPEC-FR-CAT-007 | B02/B05; §§5.1–5.2. | H1; PT-02/PT-03/PT-07/PT-08. |
| SPEC-FR-PROP-001–SPEC-FR-PROP-007 | B03/B05/B07; T01, C04, §7.3. | H2; PT-01/PT-02/PT-03/PT-07/PT-08/PT-11. |
| SPEC-FR-ACC-001–SPEC-FR-ACC-005 | B03/B07; T02/T03, §7.3. | H2; PT-02/PT-07/PT-09. |
| SPEC-FR-BOOK-001–SPEC-FR-BOOK-005 | B03/B04/B06; T03/T04, C06. | H2/H4; PT-02/PT-03/PT-05/PT-06/PT-10. |
| SPEC-FR-SVC-001–SPEC-FR-SVC-011 | B04; §§5.1/7.3, T04, C04/C06. | H2/H4; PT-03/PT-05/PT-06/PT-07. |
| SPEC-FR-CHG-001–SPEC-FR-CHG-009 | B06/B04/B05; §5.2, T06. | H4; PT-05/PT-06. |
| SPEC-FR-ECON-001–SPEC-FR-ECON-014 | B05/B06; §§5.2/7.3, T05/T06/T07. | H3/H4; PT-03/PT-04/PT-05/PT-06/PT-07. |
| SPEC-FR-CLOSE-001–SPEC-FR-CLOSE-004 | B06; T10, C06, §7.3. | H5; PT-07/PT-10/PT-01. |
| SPEC-FR-HIST-001–SPEC-FR-HIST-006 | B07/B01; §§5/6/8/11, C04 y T01–T11. | H0–H5; PT-01/PT-02/PT-03/PT-06/PT-07/PT-08/PT-11/PT-12. |
| SPEC-FR-COORD-001–SPEC-FR-COORD-008 | B07/B08; §8, C04/C06. | H5; PT-05/PT-08/PT-10. |
| SPEC-FR-HA-001–SPEC-FR-HA-005 | B08/B01; §§6/8, T08. | H0/H5; PT-09/PT-11. |
| SPEC-FR-IDEMP-001–SPEC-FR-IDEMP-004 | B08/B09; §§7–8, T03/T05/T08/T09. | H0–H6; PT-01/PT-02/PT-04/PT-08/PT-09/PT-12. |
| SPEC-FR-CONC-001–SPEC-FR-CONC-006 | B01/B08; §§7.1–7.2/8, T01–T11. | H0–H6; PT-02/PT-04/PT-05/PT-09/PT-12/PT-08. |
| SPEC-FR-ERR-001–SPEC-FR-ERR-002 | B01/B08/B09; §§7.1/7.2/8/11. | H0–H6; PT-01/PT-09/PT-12. |
| SPEC-FR-SEC-001–SPEC-FR-SEC-007 | B01/B07/B09; §§5–6/11–12. | H0–H6; PT-02/PT-03/PT-07/PT-08/PT-09/PT-11/PT-12. |
| SPEC-FR-INT-001–SPEC-FR-INT-006 | B09; C04/C05, §8. | H5; PT-08/PT-11/PT-12. |

B01–B10 abrevia los PLAN-B01–PLAN-B10; T01–T11, las unidades PLAN-T01–PLAN-T11; C01–C06, los contratos PLAN-C01–PLAN-C06. Las filas agrupan requisitos sin reducirlos: cada requisito mantiene su contenido y AC en SPEC. Esta matriz asigna responsables y mecanismo, no vuelve a definirlos.

### 10.4. Requisitos no funcionales

| Requisito | Mecanismo y evidencia prevista |
|---|---|
| SPEC-NFR-001 | §§5/7/10; reconstrucción E2E y PT-02/PT-13. |
| SPEC-NFR-002 | §6; PT-11 y pruebas reales de permisos/RLS/MFA. |
| SPEC-NFR-003 | §§5.3/6/12; PT-03/PT-08/PT-11, finalidad y datos mínimos. |
| SPEC-NFR-004 | §11; PT-11, aislamiento y ausencia de secretos/datos productivos en pruebas. |
| SPEC-NFR-005 | §§5.4/11; PT-12 y ensayo documentado de restauración, con ARCH-PENDING-002. |
| SPEC-NFR-006 | §§7–8; PT-02/PT-04/PT-09/PT-12, identidad de efecto y repetición. |
| SPEC-NFR-007 | §7.2; PT-04/PT-09/PT-10/PT-12 y cierre concurrente PT-10. |
| SPEC-NFR-008 | §§5.3/7.2; PT-05/PT-12, rollback y efectos externos separados. |
| SPEC-NFR-009 | §§5/7/8; PT-02/PT-06/PT-11, antes/después y actores diferenciados. |
| SPEC-NFR-010 | §11; PT-08/PT-11, fallos localizables y logs mínimos. |
| SPEC-NFR-011 | §8; PT-08/PT-12, sustitución/caída con identidades preservadas. |
| SPEC-NFR-012 | §§5/7.2; PT-01/PT-02/PT-03/PT-06/PT-10, originales y reapertura. |
| SPEC-NFR-013 | §5.2; PT-03/PT-05/PT-07, versiones, D019/D020 y PLAN-PENDING-002. |
| SPEC-NFR-014 | §§7.1/7.2/8; PT-08/PT-09/PT-12, E1–E8 y recuperación segura. |
| SPEC-NFR-015 | §§1–3/5.4/9/12–13; PT-13, aprobaciones y límites de fase. |

### 10.5. Conservación de los 52 invariantes

Las agrupaciones cubren todos los DM-INV; las formulaciones normativas permanecen en DM §14, interpretadas con D018–D020. Cada grupo tiene mecanismo y pruebas verificables.

| Invariantes | Mecanismo del plan | Pruebas |
|---|---|---|
| DM-INV-001–DM-INV-004 | Certeza, identidades/facultad contextual, fusión humana y Review; §§5–7. | PT-01/PT-02/PT-11. |
| DM-INV-005–DM-INV-007 | Comercial B03 con mínimos y transiciones propias; §§4/7.3. | PT-01/PT-02. |
| DM-INV-008–DM-INV-012 | Versiones, Acceptance y conversión íntegras; T01–T03. | PT-02. |
| DM-INV-013–DM-INV-017 | Alcance por servicio/noche, agregado/lista sin doble cómputo y revalidación; §5.1/T04. | PT-03/PT-05. |
| DM-INV-018–DM-INV-023 | Elegibilidad, cobertura de evidencia, opciones y confirmación con economía/requisitos; B02/B04/C06. | PT-03. |
| DM-INV-024–DM-INV-029 | Modalidades/versiones, proyección comercial, cálculo histórico, promoción y precisión; §§5–6. | PT-02/PT-03/PT-07/PT-11. |
| DM-INV-030–DM-INV-031 | Obligación/recepción/conciliación separadas, porciones y D020; T05. | PT-03/PT-04/PT-05. |
| DM-INV-032–DM-INV-036 | Fondos ajenos, documento/pago, honorarios/costes y Tararí; B05/T05/T07. | PT-07. |
| DM-INV-037–DM-INV-040 | Fianza, modificación, derecho y Refund separados; T06–T07. | PT-05/PT-06/PT-09. |
| DM-INV-041–DM-INV-042 | Evaluaciones separadas, excepción acotada y reapertura; T10. | PT-10/PT-07. |
| DM-INV-043–DM-INV-044 | Exigencia/revisión documental y Task con hechos independientes; §8. | PT-08. |
| DM-INV-045–DM-INV-048 | Original/derivado, Human Approval, historia e idempotencia; §§5/7–8. | PT-02/PT-08/PT-09/PT-12. |
| DM-INV-049–DM-INV-050 | Frontera externa, calendario y permisos; §§6/8. | PT-08/PT-11/PT-12. |
| DM-INV-051–DM-INV-052 | Archivado/historia/privacidad y prohibición fiscal; §§5–6/12. | PT-01/PT-11. |

### 10.6. Transiciones y prohibiciones

Las 148 transiciones se derivarán de las tablas de SM, con origen válido, evento, guardas, destino/condición y efectos. No se generan enums globales desde los diagramas. Cada prueba de transición incluirá caso permitido y rechazo de guarda material; Incidencia, revisión, vigencia, gravedad y progreso parcial se comprobarán de forma independiente.

| Transiciones | Bloque / unidad | Familias de prueba |
|---|---|---|
| SM-OP-01–SM-OP-11 | B03, C02/T02. | PT-01/PT-02. |
| SM-PV-01–SM-PV-08, SM-AC-01–SM-AC-03 | B03/B07, T01/T02. | PT-02/PT-08. |
| SM-BK-01–SM-BK-11 | B03/B04/B06, T03/T04/C06. | PT-02/PT-03/PT-06/PT-10. |
| SM-BS-01–SM-BS-11, SM-RV-01–SM-RV-04 | B04/B06, T04/T06. | PT-03/PT-05/PT-06. |
| SM-AV-01–SM-AV-04, SM-HO-01–SM-HO-07, SM-PC-01–SM-PC-03 | B04/B07, C04/T04. | PT-03. |
| SM-EP-01–SM-EP-04, SM-CP-01–SM-CP-08, SM-RC-01–SM-RC-04 | B05, T05/T07. | PT-03/PT-04/PT-05. |
| SM-PI-01–SM-PI-05, SM-PP-01–SM-PP-06, SM-SU-01–SM-SU-04 | B05/B07, T05/T07. | PT-07/PT-12. |
| SM-RF-01–SM-RF-07, SM-DE-01–SM-DE-08 | B05/B06, T06/T07. | PT-04/PT-05/PT-06/PT-09. |
| SM-MO-01–SM-MO-10 | B06, T04/T06. | PT-05/PT-06. |
| SM-DO-01–SM-DO-05, SM-TA-01–SM-TA-05, SM-IN-01–SM-IN-06 | B07/B08, C04/C06. | PT-08/PT-10. |
| SM-CO-01–SM-CO-06, SM-HA-01–SM-HA-03 | B07/B08, T08/C04/C05. | PT-02/PT-08/PT-09. |
| SM-CL-01–SM-CL-05 | B06, T10. | PT-10/PT-01/PT-07. |

SM-FORB-01–SM-FORB-33 se contrastarán individualmente mediante la correspondencia normativa de SPEC §28.3 y los AC de §10.2. No se reemplaza esa matriz por otra definición. La cobertura negativa incluye:

| Prohibiciones | Defensa y pruebas |
|---|---|
| SM-FORB-01–SM-FORB-09 | Versiones/vigencia/evidencia, independencia y Review; PT-02/PT-03/PT-08. |
| SM-FORB-10–SM-FORB-13 | Cantidades, promociones, agenda, opciones y alcance de cambios; PT-03/PT-05/PT-07. |
| SM-FORB-14–SM-FORB-19 | Porciones, recepción, documento/pago, Refund/fianza; PT-04/PT-06/PT-07. |
| SM-FORB-20–SM-FORB-24 | Documentación, trabajo, comunicación/aprobación y tres cierres; PT-08/PT-09/PT-10/PT-11. |
| SM-FORB-25–SM-FORB-28 | Economía propia, derecho previo, incertidumbre y límites externos; PT-05/PT-07/PT-09/PT-12. |
| SM-FORB-29–SM-FORB-33 | Permisos, reactivación, cadena única, historia y fechas civiles; PT-01/PT-02/PT-03/PT-05/PT-08/PT-11/PT-13. |

### 10.7. Constitución y revisión documental

| Principios | Aplicación y verificación en el plan |
|---|---|
| P01, P02 | §§1/5/8/13: Supabase canónico, autoridad externa y referencia Git verificable. PT-12/PT-13. |
| P03, P04 | §§1–3/9/13: fase aislada, Spec aprobada y autorización posterior de tareas/implementación. PT-13. |
| P05, P06 | §§5/7/8: dato verificable, bloqueo material, historia/actores y trazabilidad. PT-01/PT-02/PT-11/PT-12. |
| P07, P08 | §§5/7: originales preservados, correcciones y dimensiones separadas. PT-02/PT-03/PT-10. |
| P09 | §§5.1/7.3: detalle por prestación/noche y agregado/lista sin doble cómputo. PT-03. |
| P10, P11, P12 | §6/11: mínimo privilegio, economía/privacidad, secretos y entornos. PT-11. |
| P13 | §5.4/11: migraciones y recuperación verificadas; break-glass constitucional intacto. H0–H6. |
| P14, P15 | §§7–8: idempotencia, ejecución, recuperación y aprobación exacta. PT-08/PT-09/PT-12. |
| P16, P17 | §§2/6/8/12: prohibición fiscal, proveedores sustituibles y fronteras limitadas. PT-11/PT-12. |
| P18, P19, P20 | §§5.2/10/12–13: criterios, documentación real, límites y cálculos reproducibles. PT-05/PT-07/PT-13. |

Revisión de esta versión: cobertura documental de 116/116 FR, 15/15 NFR, 92/92 AC, 52/52 DM-INV, 148/148 transiciones, 33/33 SM-FORB y 18/18 ARCH-DEC. Los recuentos expresan trazabilidad, no pruebas aprobadas. AC-084 conserva la observación explícita de §1.2.

Se han contrastado selección parcial/directa/unicidad (D018), bases económicas (D019), fechas locales/días completos (D020), confirmación crítica/económica, dato nominal opcional, historial, tres cierres, aprobación sensible e incertidumbre. No se identifica una contradicción de negocio adicional que impida este DRAFT. Los detalles técnicos propuestos y pendientes de §12 todavía requieren la revisión indicada.

## 11. Entornos, configuración, observabilidad y entrega prevista

### 11.1. Entornos y configuración

| Entorno futuro | Finalidad y preparación exigida |
|---|---|
| Development | Work Local Mac; aplicación y Supabase aislados, fixtures sintéticos, secretos propios y pruebas deterministas. Ninguna copia indiscriminada de Production. |
| Staging | Ensayar cambios/migraciones/roles/objetos y recuperación con separación de recursos y secretos. Dobles de proveedores para SPEC 001; una futura prueba externa exige capacidad y alcance autorizados. |
| Production | Vercel y Supabase separados, acceso del único Administrador con MFA, políticas de sesión/privacidad y recuperación aceptadas. No se habilita por completar documentación ni por pasar mocks. |

La configuración distinguirá parámetros técnicos y versiones de reglas/datos de negocio. Tendrá responsable, finalidad, entorno, validación y condición de ausencia. Incluye autenticación/sesión, conexión y pool, límite de trabajo/reintentos, tipo/tamaño de adjuntos, diagnóstico, recuperación y parámetros de avisos. Un parámetro material ausente deja inactiva su función dependiente; no se rellena con un valor comercial supuesto.

Las versiones de aplicación, esquema/migraciones, automatismos, reglas/catálogo, términos y contratos se registran separadas. Se fijarán dependencias soportadas y lockfile al autorizar implementación, tras comprobar compatibilidad y avisos de seguridad. La revisión técnica de documentación oficial realizada el 2026-09-11 no sustituye ese control posterior ni garantiza límites/costes de un plan contratado.

### 11.2. Observabilidad

Logs estructurados con referencias de petición, operación, ejecución y evento permitirán localizar errores E1–E8, intentos, conflictos, trabajo pendiente y resultado incierto. Se observarán fallos persistentes, antigüedad del trabajo pendiente, reclamaciones atascadas, conflictos de concurrencia y evidencia/objetos incompletos, sin fijar umbrales o SLA no medidos.

Los logs técnicos no contienen secretos, URLs temporales, cuerpos completos de documentos/comunicaciones ni economía interna innecesaria. Historia de negocio y diagnósticos son distintos: un log de éxito no acredita aceptación, pago ni entrega. Alertas relevantes se mantienen visibles en CRM según D016; sin conector no se declara aviso WhatsApp entregado.

### 11.3. Recuperación

El procedimiento futuro inventariará base canónica, versiones/historia, objetos, identidades y configuración, referencias externas, idempotencia, aprobaciones y ejecuciones. Responsable, objetivos y coste se concretarán mediante ARCH-PENDING-002. No se afirma que existan backups o PITR.

Objetos y metadatos necesitan recuperación coherente por separado; las copias de base no incluyen los objetos de Storage ni las contraseñas de roles personalizados. Debe existir recuperación protegida de credenciales sin guardarlas en Git: [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups).

El ensayo H6 restaurará en entorno aislado, verificará vínculos/objetos/snapshots/porciones y medirá pérdida/tiempo observados sin convertirlos en RPO/RTO aprobados. Los efectos externos sensibles permanecerán suspendidos hasta conciliar qué ocurrió después del punto restaurado; una restauración no deshace pagos/envíos ni permite repetirlos. La periodicidad deberá quedar verificada y acordada antes de aceptar la continuidad de Production.

### 11.4. Despliegue futuro, sin ejecución en esta fase

La entrega candidata deberá identificar commit/versiones, migraciones requeridas, resultados de pruebas, datos/configuración necesarios, pendientes y plan de recuperación. Primero se verificará compatibilidad y actualización en Staging; después la autorización de uso/despliegue y sus bloqueos. Migración y release conservarán orden y evidencia; no se publicará una aplicación incompatible con su esquema.

Se contemplarán validación de acceso, lectura autorizada y operación controlada, diagnóstico y procedimiento de detener/reparar. Un retorno a versión anterior de aplicación no elimina nuevos hechos ni revierte transferencias. No se diseña aquí un pipeline ejecutable ni se vinculan proyectos a Vercel: publicar estos Markdown en GitHub no constituye desplegar CRM.

## 12. Riesgos, decisiones y bloqueos pendientes

### 12.1. PLAN-PENDING nuevos

| ID / estado | Decisión o revisión necesaria de Andrés | Bloquea / trabajo independiente |
|---|---|---|
| PLAN-PENDING-001 — PENDING | Resolver el tratamiento documental de PLAN-OBS-001 / AC-084: confirmar su contexto histórico y autorizar, si corresponde, una corrección editorial expresa de SPEC aprobada. Este plan no la realiza. | Bloquea cerrar sin salvedades la revisión documental del plan y marcar AC-084 satisfactorio; no bloquea redactar/publicar este DRAFT. D022 no se reabre. |
| PLAN-PENDING-002 — PENDING | Confirmar la regla exacta de desempate y el punto de cuantización a 2 decimales cuando importes intermedios tengan mayor precisión; conservar componentes y diferencias sin reparto implícito. Ejemplo sintético a decidir: tratamiento de 1,005 EUR y de varios componentes cuyo redondeo individual difiera del total. | Bloquea la parte dependiente de cálculo definitivo en H1–H4 y su aceptación H6. No bloquea catálogo, cálculo exacto, casos sin esa ambigüedad ni operación independiente. No modifica D019 ni abre redondeo comercial automático. |
| PLAN-PENDING-003 — PENDING | Revisar la propuesta de acceso de PLAN-DEC-007 y fijar perfil de sesiones: expiración/inactividad, revocación efectiva y procedimiento de recuperación ante pérdida del factor del único Administrador, con responsable y verificación. Sin valores por defecto asumidos ni segundo usuario operativo. | Bloquea configuración/aceptación de acceso real y preparación de Production H6. H0 puede probar mecanismos con configuración de prueba explícita, sin declarar el perfil productivo resuelto. |

Las PLAN-DEC están propuestas y se revisan al aprobar el plan. Las elecciones rutinarias de separación modular, contexto transaccional, inmutabilidad, tipos decimales, control de versión y dobles de prueba quedan concretadas aquí; no se elevan a pendientes adicionales. Si una verificación técnica futura demuestra incompatibilidad, se revisará la propuesta y solo la parte afectada.

### 12.2. Pendientes heredados, sin renumerar ni resolver

| Referencias | Bloqueo real / hito afectado | Qué continúa |
|---|---|---|
| ARCH-PENDING-001; BR-PENDING-001/035 | Selección/implementación dependiente de Telefonía IA/WhatsApp, fuera de estos hitos. Comparar ElevenLabs y alternativa real, y analizar WhatsApp por separado, antes de elegir. | B07/B08/B09, contexto y registro manual autorizado, pruebas de contratos e intenciones. No se exige un proveedor común ni se afirma comparación realizada. |
| ARCH-PENDING-002 | Aceptación/configuración definitiva de recuperación y continuidad de Production, H6. | Diseño/ensayo de copia y restauración aislada, sin objetivos/costes inventados. |
| DM-PENDING-002; BR-PENDING-021/022/033 | Validación profesional fiscal/suplidos/Tararí, tipos no verificados y mandato efectivo; afecta solo cálculo/tratamiento dependiente H1/H3/H4/H6. Emisión fiscal sigue fuera de alcance. | Modelo operativo, documentos externos, honorarios/costes y términos realmente existentes. No se acredita mandato por recibir fondos. |
| DM-PENDING-005; BR-PENDING-014/015/019/020 | Tratamiento y conservación de datos/comunicaciones, anonimización/eliminación y eventual audio; partes dependientes H1/H4/H5 y uso real H6. | Datos sintéticos, minimización, acceso, evidencia manual/original autorizado, archivado recuperable y diseño compatible con política futura. |
| DM-PENDING-006; BR-PENDING-012/013 | Roles/permisos finos adicionales, fuera de V1; no bloquea estos hitos con único Administrador. | Seguridad V1 y protección económica completa. |
| BR-PENDING-034 | Tarjeta/otros cobros dependientes, fuera de SPEC 001. | Transferencias registradas/verificadas y economía genérica H3/H4. |
| BR-PENDING-035, en el resto de conectores | Capacidad real de APIs, lectura/importación/envío/consulta de resultado y sincronización; fuera de implementación del Core. | Fronteras B09, casos de fallo y registro manual; no confundir contrato probado con conector disponible. |

Datos/configuración todavía ausentes: tarifas completas, capacidades/restricciones, vigencias, fianzas, costes de extras, parámetros de avisos/reintentos y zona/fecha de referencia pertinente. Bloquean únicamente su decisión o automatismo material en H1–H5 y el uso real correspondiente, con responsable de aportación/verificación Administrador. No son nuevos pendientes de política ni reciben valores ficticios.

D018–D020 y los tres SM-PENDING históricos continúan resueltos. No se crea SPEC-PENDING ni una aprobación D023 por redactar este plan.

### 12.3. Riesgos y respuesta prevista

| Riesgo | Prevención / evidencia de salida | Hito |
|---|---|---|
| Convertir el plan del Core en todo el producto | Frontera §2, contratos manuales/dobles B09 y limitaciones explícitas del informe final. | Todos/H6. |
| Eludir negocio por acceso directo a datos | Rol ordinario limitado, controles de datos y pruebas por canales ajenos a la UI; sin credencial global para cada acción. | H0 y regresión. |
| Conflicto concurrente que duplica Booking, fondos, aprobación o cierre | Raíces/porciones compartidas, unicidad, control de versión y pruebas intercaladas T03/T05/T08/T10. | H2–H6. |
| Perder historia al modificar catálogo, fusionar o migrar | Versiones fijadas, ajustes enlazados, integridad y validación de migración/restauración. | H1–H6. |
| Cálculo no reproducible o cron que cambia política | Decimal exacto, PLAN-PENDING-002, fechas civiles D020 y parámetros explícitos; pruebas de límites completos. | H1/H3/H4/H5. |
| Timeout/reclamación vencida/restauración que repite efecto | Identidad de efecto, intención/intento/resultado y conciliación previa; caso de proveedor simulado que ya ejecutó. | H0/H5/H6. |
| Filtrar economía o datos personales mediante salida/IA/logs | Proyecciones por finalidad, pruebas negativas de serialización/acceso y política de datos antes del tratamiento. | Todos/H6. |
| Bloqueo del único Administrador o continuidad insuficiente | Perfil de recuperación de acceso y ensayo de datos/objetos, con pendientes explícitos. | H0/H6. |

## 13. Salida de esta fase y circuito de coordinación

Este documento queda **DRAFT v0.1, completo para revisión humana, NOT APPROVED**. La revisión de cobertura es documental; todas las pruebas de aplicación, datos, seguridad, integración y recuperación siguen NO EJECUTADAS.

Antes de aprobar el plan se revisarán alcance, PLAN-DEC, hitos, matrices y pendientes. PLAN-PENDING-001 requiere tratamiento explícito; los demás pendientes podrán conservarse únicamente con aceptación expresa de su bloqueo localizado. Aprobar el plan no resuelve automáticamente una decisión económica, jurídica, de acceso o continuidad todavía abierta.

El circuito de esta entrega modifica solo plan.md, PROJECT-STATUS.md y NEXT-STEPS.md. DECISIONS.md conserva D001–D022: registra decisiones aprobadas, no propuestas del plan. Last Approved Commit permanece en 91fc7527af9fd529e475116d1d212fd2328994d9, porque publicar un DRAFT no es aprobarlo.

Se revisarán diff, alcance, estado y log antes del commit documental; después se verificará contenido del commit, publicación sin force push y correspondencia con origin/main. Si el remoto cambia, se detendrá únicamente la publicación para integrar/revisar sin sobrescribir trabajo ajeno. El enlace al commit publicado será la referencia inmutable de revisión.

La siguiente acción es **revisar este plan y sus pendientes con Andrés**. tasks.md permanece como placeholder sin modificar e implementación no iniciada. La fase siguiente solo se abrirá después de aprobación humana del plan y la instrucción correspondiente.
