# CRM HUESCAVENTURA OS — Constitution

Status: APPROVED
Version: 1.0
Approved: 2026-09-05

## Autoridad y alcance

Esta Constitución establece las reglas permanentes del proyecto. Toda Spec, plan, tarea, implementación, migración e integración DEBE respetarla. DEBE expresa una obligación y NO DEBE expresa una prohibición.

La jerarquía del proyecto es: Constitución → Specs aprobadas → planes y tareas → código. Ante contradicciones o información insuficiente, el agente DEBE señalar el conflicto y solicitar una decisión del responsable del proyecto antes de ejecutar la parte afectada. No puede inventar una excepción ni resolverla silenciosamente.

El estado DRAFT identifica una propuesta pendiente de aprobación explícita del responsable del proyecto; no acredita su aprobación. Una vez aprobada, su cumplimiento será obligatorio para todo desarrollo posterior.

## Principios no negociables

### P01. Supabase como fuente de verdad de los datos

Supabase DEBE conservar el registro canónico de los datos del CRM. Interfaces, cachés y exportaciones DEBEN derivar de ese registro. Cada integración DEBE especificar qué datos gobierna el proveedor externo, cómo se verifican y cómo se concilian en Supabase; almacenar una copia no convierte al CRM en autoridad sobre disponibilidad, pagos o documentos fiscales externos.

### P02. GitHub como fuente de verdad del código y la documentación

El repositorio GitHub del proyecto DEBE contener las versiones oficiales del código, documentación, Specs y migraciones. Las decisiones tomadas en conversaciones o herramientas externas DEBEN incorporarse al repositorio para formar parte de la referencia del proyecto. Los cambios locales pendientes de publicación DEBEN identificarse como tales.

### P03. SDD obligatorio para cambios importantes

Toda funcionalidad o modificación que afecte a reglas de negocio, datos, permisos, estados, integraciones o automatizaciones DEBE seguir Specification-Driven Development (SDD), con spec.md, plan.md y tasks.md trazables. Una corrección menor puede usar un registro reducido únicamente si no cambia esos contratos y documenta su alcance y verificación.

### P04. Especificación antes de implementación

Antes de implementar un cambio importante, su Spec DEBE definir objetivos, alcance, exclusiones, actores, reglas, casos de error y criterios de aceptación, y contar con aprobación explícita del responsable del proyecto. El plan y las tareas DEBEN derivarse de ella. Si cambia el comportamiento previsto, la Spec DEBE actualizarse y aprobarse antes de implementar la desviación.

### P05. Datos de negocio verificables

NO DEBEN inventarse precios, disponibilidad, capacidades, costes, políticas ni datos de clientes o reservas. Todo valor utilizado para una decisión DEBE tener una fuente identificable y, cuando corresponda, fecha de vigencia. Los datos desconocidos DEBEN marcarse como pendientes de verificación y bloquear únicamente las decisiones o acciones que dependan materialmente de ellos; las partes del flujo que no dependan de esos datos pueden continuar. Las estimaciones requieren una regla aprobada y una etiqueta explícita.

### P06. Trazabilidad de cambios importantes

Cada cambio importante DEBE poder relacionarse con su necesidad, Spec, tareas, decisión de aprobación, cambios de código o datos y evidencias de validación. Los cambios materiales en registros DEBEN identificar actor humano o automático, fecha, motivo y valores afectados. Los despliegues DEBEN identificar la versión publicada y las migraciones aplicadas.

### P07. Conservación del historial comercial y operativo

Las correcciones NO DEBEN destruir ni sobrescribir silenciosamente hechos históricos. DEBEN registrarse mediante versiones, eventos o ajustes que permitan reconstruir lo ocurrido, incluidos valores anteriores, motivo y responsable. La eliminación o anonimización exigida por privacidad DEBE seguir una política autorizada y auditada; conservar historial no justifica retener datos personales indefinidamente.

### P08. Separación de estados comerciales y operativos

El estado comercial y el operativo DEBEN modelarse por separado, con transiciones, permisos y condiciones explícitas. Un cambio comercial NO DEBE modificar automáticamente el estado operativo, ni viceversa, salvo mediante una regla especificada, probada y auditable. Ningún estado único puede sustituir ambas dimensiones.

### P09. Participantes por servicio y por noche

Cada servicio DEBE permitir configurar sus propios participantes y su cantidad. En alojamiento, esa configuración DEBE existir para cada noche, sin imponer una ocupación idéntica durante toda la estancia. Los totales generales NO DEBEN sobrescribir ese detalle; precios, capacidad y resúmenes DEBEN usar la granularidad y las reglas aprobadas para cada servicio.

### P10. Seguridad y privacidad desde el diseño

El acceso DEBE aplicar mínimo privilegio y denegación por defecto, con controles en servidor y base de datos, incluida RLS en las tablas expuestas mediante Supabase. La interfaz no constituye una barrera de seguridad. Cada tratamiento DEBE justificar los datos necesarios, destinatarios y conservación; los entornos, registros, exportaciones e integraciones DEBEN evitar accesos o divulgaciones no autorizados.

### P11. Información económica interna reservada

Costes, márgenes y beneficios, incluidos sus desgloses y cálculos, DEBEN ser accesibles únicamente a administradores autorizados. La restricción DEBE verificarse en consultas, API, informes, exportaciones y contexto de IA. Ocultar campos en pantalla es insuficiente: esos datos NO DEBEN enviarse a clientes o usuarios sin autorización.

### P12. Secretos fuera de Git

Credenciales, tokens, contraseñas y API keys secretas NO DEBEN guardarse en Git, documentación, ejemplos ni registros. DEBEN gestionarse mediante secretos protegidos por entorno; las plantillas solo pueden contener marcadores. Ante una exposición se DEBE revocar o rotar el secreto y registrar el incidente; borrar el archivo no elimina la exposición del historial.

### P13. Evolución de base de datos mediante migraciones

Todo cambio estructural o administrativo de base de datos DEBE ejecutarse mediante una migración versionada y revisable: esquema, restricciones, índices, funciones, disparadores, permisos, RLS y transformaciones de datos. NO DEBEN aplicarse cambios manuales fuera de este mecanismo, salvo mediante la excepción break-glass para emergencias críticas: solo un administrador autorizado puede realizar la intervención manual mínima necesaria, con registro obligatorio del motivo, actor y cambios realizados. Inmediatamente después DEBE crearse y registrarse en Git una migración equivalente que refleje los cambios, para que Git vuelva a representar el estado real de la base de datos. Cada migración DEBE verificarse previamente y definir recuperación y protección de datos. Las operaciones ordinarias del CRM sobre registros siguen los flujos autorizados de la aplicación y no requieren una migración por operación.

### P14. Automatizaciones auditables

Cada automatización DEBE definir responsable, disparador, permisos, entradas, efectos, tratamiento de errores, reintentos y prevención de duplicados. Cada ejecución DEBE registrar identificador, versión, fechas, registros afectados y resultado, sin exponer secretos. DEBEN existir mecanismos para detectar fallos, detener la ejecución y recuperar o compensar efectos de forma controlada.

### P15. IA supervisada en la primera fase

Las comunicaciones informativas basadas en plantillas previamente aprobadas pueden automatizarse si una Spec aprobada lo autoriza, dentro de las condiciones y límites que esta defina. Durante la primera fase, la IA DEBE obtener aprobación humana explícita antes de ejecutar comunicaciones o acciones sensibles o vinculantes: comprometer precios o disponibilidad, confirmar o cancelar reservas, enviar comunicaciones vinculantes, cobrar, reembolsar, revelar datos personales o modificar permisos. Usar una plantilla no exime de aprobación humana cuando la comunicación sea sensible o vinculante. La aprobación DEBE corresponder a una propuesta concreta y quedar vinculada a su ejecución; cualquier cambio material requiere nueva aprobación. Ampliar la autonomía exige una Spec aprobada con riesgos, límites y controles verificables.

### P16. Facturación legal condicionada a validación

El CRM NO DEBE emitir facturas legales ni asignar numeración fiscal hasta que su arquitectura de facturación haya sido validada conforme a la normativa española aplicable por profesionales competentes y aprobada por el responsable del proyecto. La evidencia y el alcance de esa validación DEBEN documentarse. Mientras tanto, cualquier borrador autorizado DEBE identificarse inequívocamente como no fiscal y sin validez como factura.

### P17. Integraciones modulares

ElevenLabs, WhatsApp, web, pagos, Avaibook y facturación DEBEN conectarse mediante módulos con contratos explícitos y responsabilidades delimitadas. Las reglas centrales NO DEBEN depender de formatos exclusivos de un proveedor. Cada módulo DEBE definir intercambio de datos, autenticación, fallos y conciliación, permitiendo su sustitución o desactivación sin perder historial ni alterar silenciosamente las reglas del CRM.

### P18. Aceptación y pruebas como condición de finalización

Los criterios de aceptación DEBEN existir antes de implementar y ser comprobables. Una funcionalidad solo puede declararse terminada cuando los criterios se cumplen y las pruebas proporcionales a su riesgo pasan, incluidas reglas, permisos, transiciones y fallos relevantes. La evidencia DEBE quedar registrada; las comprobaciones no ejecutadas DEBEN declararse pendientes y nunca presentarse como satisfactorias.

### P19. Documentación coherente con el comportamiento

Todo cambio de comportamiento DEBE actualizar las Specs y documentos afectados dentro del mismo conjunto de cambios. La documentación DEBE distinguir comportamiento implementado, propuestas y limitaciones pendientes. Una funcionalidad con documentación contradictoria o desactualizada NO DEBE considerarse terminada.

### P20. Cálculos económicos reproducibles

Todo importe DEBE poder reconstruirse a partir de sus datos y reglas de cálculo. DEBEN conservarse las cantidades, precios unitarios, reglas, descuentos y costes previstos y reales utilizados, diferenciando estos últimos entre sí. Los totales derivados NO DEBEN sustituir a sus componentes. Todo recálculo material DEBE ser trazable, conservando los valores anteriores y nuevos, el motivo, el actor y la fecha. Las reglas y los precios aplicados DEBEN estar versionados cuando corresponda para reproducir el cálculo histórico.

## Cumplimiento y evolución

Cada Spec y plan DEBE identificar los principios aplicables y cómo verificará su cumplimiento. Los incumplimientos bloquean la aceptación del cambio; los agentes DEBEN comunicarlos y mantener explícitas las decisiones pendientes.

Modificar esta Constitución requiere aprobación explícita del responsable del proyecto, incremento de versión y registro del motivo, impacto y adaptación necesaria de las Specs existentes. Una Spec, una instrucción de un proveedor o una decisión de implementación no puede modificarla implícitamente. Su historial DEBE preservarse en Git.
