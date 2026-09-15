# Evidencia — TSK-H0-002

Estado: COMPLETED en su alcance de delimitación/preparación
Fecha: 2026-09-15
Entorno: Work Local Mac, repositorio `IAndresB/crm-huescaventura-os`, rama `main`
Base inicialmente comprobada: `6b0b8ba8b6c09e9e939c1f9ae5725752aba5d767`
Commit finalmente probado: el commit único que contiene este archivo, recuperable con `git log -1 --format=%H -- specs/001-core-crm/evidence-TSK-H0-002.md`; su igualdad con `origin/main` se comprueba después del push.

## 1. Alcance y trazabilidad

Solo se delimita el paquete técnico futuro de H0. No se crea aplicación, código, SQL, migraciones, dependencias, Auth, infraestructura, UI, DNS ni recursos externos.

Fuentes directas de la ficha: Plan §§3–7/9–11; B01/B07/B08/B10; C01–C06; T01–T11; AC-079/084/089; D024/D030/D032–D035 y autoridad vigente D036. Filas de `tasks.md` asignadas a TSK-H0-002: AC-079/084/089, SPEC-NFR-004/015, SM-FORB-31, ARCH-DEC-001/017/018, P02/P03/P04/P13/P17/P18/P19, PLAN-DEC-001/008, PLAN-B10, PT-13 y D001/D002/D003/D005/D006/D021/D022/D024/D030/D032/D033/D034/D035.

Límites conservados: monolito modular; dominio independiente de framework/SDK; una Booking por Opportunity aceptada en V1; D030 reservado a futura Spec de interfaz; D033 solo dirección prevista; los PLAN-AUTH, PLAN-PENDING-003, ARCH-PENDING y pendientes heredados no cambian.

## 2. Mapa de módulos

| Módulo técnico | Responsabilidad derivada | Frontera / dueño futuro |
|---|---|---|
| Dominio | Reglas, invariantes, decisiones y modelos conceptuales de identidad/relaciones, comercial, catálogo, operación, economía reservada, coordinación/evidencia e integraciones canónicas | No importa Next.js, Supabase SDK, persistencia ni transporte. Cada área propietaria decide sus cambios; TSK-H0-003 protege la frontera. |
| Aplicación | Orquestar casos de uso y C01–C06; aportar intención, autorización, contexto, idempotencia, lectura actual, resultado y coordinación de efectos | Depende de dominio y puertos, no de adaptadores. TSK-H0-003; verificación TSK-H0-004. |
| Acceso e identidad | Traducir identidad autenticada/técnica a contexto confiable, comprobar CRM Actor/habilitación/finalidad/alcance y límites por sesión | Contexto solo servidor; nunca desde parámetros del cliente. TSK-H0-005/013/016; verificaciones 006/014/017. |
| Persistencia | Implementar unidad transaccional, repositorios, versión/concurrencia, rol ordinario y contexto por transacción | PostgreSQL detrás de puertos; rol no propietario/sin BYPASSRLS. TSK-H0-007/009; verificaciones 008/010. |
| Historia y auditoría | Conservar cambio material, antes/después, actor/origen, motivo, momentos, evidencia y resultado idempotente | Historia de negocio no se sustituye por logs. TSK-H0-009; verificación 010. |
| Efectos, intenciones y jobs | Separar aprobación, intención, reserva/consumo, intento, ejecución, resultado e incertidumbre | No ejecuta proveedores dentro de transacción; TSK-H0-011/013 y base B08; verificaciones 012/014. |
| Adaptadores | Auth, PostgreSQL, objetos, jobs y futuros proveedores traducen contratos externos a puertos internos | Ningún formato/SDK dicta el dominio; dobles no acreditan proveedor real. Implementación según ficha autorizada. |
| Servidor y composición | Conectar aplicación, puertos y adaptadores; adaptar Server Actions/HTTP ingress; validar origen/entrada y configuración | Next.js es borde, no propietario de reglas. TSK-H0-003; verificación 004. |
| Validación/entrega | Fixtures, pruebas, migraciones verificadas, evidencia V-EVI, recuperación y release | B10; cada comprobación es dueña de su evidencia y TSK-H0-018 reúne H0 sin habilitar Production. |

Los módulos son límites internos de una sola aplicación, no microservicios. B07 y B08 atraviesan áreas mediante contratos de aplicación; no permiten escritura directa sobre otro módulo.

## 3. Estructura física propuesta

```text
src/
  domain/
    identity/ commercial/ catalog/ operations/ economics/ coordination/ integrations/
  application/
    contracts/ access/ use-cases/ history/ effects/ ports/
  infrastructure/
    auth/supabase/ persistence/postgres/ objects/supabase/ jobs/ integrations/ observability/
  server/
    composition/ actions/ ingress/
tests/
  domain/ contracts/ integration/ fixtures/h0/ fault-scenarios/
supabase/
  migrations/
specs/001-core-crm/
  evidence-TSK-H0-NNN.md
```

Reglas de dependencia: `domain` solo depende de sí mismo; `application` depende de dominio y puertos propios; `infrastructure` implementa esos puertos; `server/composition` ensambla dependencias; `actions` e `ingress` solo adaptan transporte. `tests` puede atravesar capas para verificar contratos. Las rutas se acuerdan para trabajo futuro, pero no se crean en esta tarea.

## 4. Matriz C01–C06

Todos los contratos reciben una identidad/contexto confiable creado por servidor, una identidad de operación cuando proceda y devuelven un resultado semántico que distingue efecto, previo, pendiente y E1–E8 aplicable. No son endpoints, payloads ni schemas API.

| Contrato | Responsabilidad, entrada y salida | Efectos / prohibiciones / transacción | Capa y evidencia futura |
|---|---|---|---|
| C01 Consulta autorizada | Actor o identidad técnica, finalidad, alcance/filtros → proyección mínima con procedencia, certeza, paginación/referencias | Solo lectura autorizada; no concede mutación ni filtra economía/datos. Lectura consistente, sin unidad material de escritura | Aplicación `contracts/access` + puertos de consulta. TSK-H0-003/004; V-DOM/V-DAT según fuente |
| C02 Decisión de dominio | Intención, estado/versiones actuales, datos/evidencias y alcance → cambios permitidos o bloqueos con IDs | Evalúa sin llamada externa ni escritura oculta. Sin transacción de persistencia; aplicar exige C03 | Caso de uso + módulo de dominio propietario. TSK-H0-003/004; casos positivos/negativos contra fuente |
| C03 Unidad de persistencia | Contexto transaccional confiable, cambios validados y precondiciones concurrentes → resultado aplicado, previo, conflicto o rollback | Efecto + historia + resultado + intención aplicable juntos o ninguno; no simularlo con REST independientes | Aplicación `contracts`/puerto transaccional + adaptador PostgreSQL. TSK-H0-007–010; V-DAT/V-MIG/V-AT |
| C04 Registro de evidencia | Original o registro manual autorizado, fuente, momentos, identidad/alcance y revisión → evidencia recibida/conservada y estado candidato/verificado | Adjuntar no confirma; objeto externo se carga fuera de transacción y metadata se confirma/compensa visiblemente mediante C03 | Aplicación `history`, dominio coordinación y adaptador de objetos. Base H0, desarrollo H1; pruebas de fallo objeto/metadata |
| C05 Intención y resultado externos | Efecto, destinatario, contenido/versiones, aprobación y referencia → intención, intento, resultado acreditado o incertidumbre | Persistir intención/reserva vía C03; ejecutar fuera; no declarar entrega por intención ni repetir resultado incierto | Aplicación `effects` + jobs/adaptador externo. TSK-H0-009–012; V-AT y dobles, proveedor real posterior |
| C06 Evaluación/reevaluación | Hechos actuales y dependencias materiales → evaluación por alcance, revisión y cambios permitidos | No confirma/cierra por arrastre; evaluación pura y aplicación separada vía C03 | Caso de uso + módulos propietarios B04–B07. Contrato base TSK-H0-003/004; escenarios integrados posteriores |

Fallos relevantes comunes: entrada/origen inválido, ausencia de identidad o permiso, versión obsoleta/conflicto, evidencia insuficiente, dependencia caída, resultado externo incierto y lectura no autorizada de resultado previo. El rechazo conserva el alcance pendiente y no revela información sensible.

## 5. Matriz T01–T11

Regla común: la decisión humana, llamada externa, proveedor, API, comunicación u objeto ocurre antes o después de la unidad; nunca se espera dentro de la transacción. Cada unidad confirma el efecto interno, historia, resultado idempotente e intención aplicable, o ninguno.

| Unidad / inicio | Escrituras atómicas e historia | Fuera de transacción / fallo | Prueba y dueño futuro |
|---|---|---|---|
| T01 Fijar versión | Versión, composición/términos/snapshots, vínculo y sustitución; historia e inmutabilidad | No envía. Conflicto de revisión/número aborta y reevalúa | Comercial; TSK-H0-009/010 para patrón, H2 para caso; concurrencia/reintento |
| T02 Registrar/verificar Acceptance | Hecho/términos, acto explícito de verificación y Ganada solo si se solicita y cumplen guardas; historia/resultado | Evidencia se obtiene antes; ambigüedad queda Review; conversión separada | Comercial/evidencia; patrón 009/010, H2; candidata/confirmada/repetida |
| T03 Convertir normal/directa | Booking completa, cadena real, servicios/modalidades/noches/cantidades/referencias; historia/resultado | Ninguna Booking parcial visible; no espera hechos humanos; conflicto recupera existente | Comercial/operación; patrón 009/010, H2; unicidad/carrera/SM-FORB-31 |
| T04 Cambiar alcance operativo | Antes/después por servicio/noche, evidencia, Review y reevaluaciones afectadas | Evidencia/proveedor fuera; fallo revierte solo conjunto interno; no ratifica otros alcances | Operación; patrón 009/010, H4; versión padre/alcance independiente |
| T05 Conciliar/asignar/ajustar | Correspondencia, porciones/destinos, consumos/disponibles y cobertura; historia/resultado | Sin transferencia real; conflicto sobre raíz compartida aborta y reevalúa | Economía; patrón 009/010, H3/H4; concurrencia 80+80/100 y Refund |
| T06 Determinar/aplicar cambio | Evaluación D019/D020, autorización y cada conjunto interno que comparte base; obligación/ajuste fundado | Efectos independientes en unidades distintas; valor pendiente no bloquea operación independiente | Cambios/economía/operación; patrón 009/010, H4; parcialidad y reevaluación |
| T07 Registrar salida económica real | Movimiento ya verificado, porciones, referencias, ajustes y reevaluaciones; historia/resultado | Ejecución externa precede al registro; anomalía abre Review, sin aprobación retroactiva | Economía/evidencia; patrón 009/010, H3/H4; duplicidad Refund/fianza |
| T08 Autorizar/reservar efecto | Aprobación exacta; después, consumo/reserva, intención e intento de la parte autorizada; historia/resultado | Humano decide antes; ejecutor externo después; incertidumbre conserva reserva | Efectos/aprobación; TSK-H0-011/012; doble ejecución/cambio material/respuesta perdida |
| T09 Recibir o reclamar trabajo | Recepción+deduplicación+evento/evidencia, o reclamación exclusiva+identidad de intento | Aplicación y ejecución separadas; lease vencido no autoriza reenviar efecto incierto | Jobs/integraciones; patrón 009/010, H5; dos reclamantes/duplicado/timeout |
| T10 Cierre/reapertura | Evaluaciones solicitadas, fundamentos, condición conjunta e invalidación afectada; historia/resultado | Evidencia se obtiene antes; fallo/concurrencia no deja cierre sobre insumo obsoleto | Booking/cierres; patrón 009/010, H5; carrera con factura/Refund |
| T11 Fusión/archivado/corrección | Resolución humana previa, orígenes/vínculos, vista vigente y ambos historiales; resultado | Humano decide antes; no reatribuye hechos ni libera IDs | Identidad/coordinación; patrón 009/010, H1; corrección/fusión repetida y preservación |

Fallo antes o durante escrituras: rollback total de la unidad. Respuesta perdida después de commit: consultar la misma identidad de operación y reautorizar la lectura del resultado. Serialización/deadlock confirmado como abortado: reevaluar antes de reintentar. Efecto externo incierto: conciliar antes de cualquier repetición.

## 6. Estrategia de migraciones

Ruta futura: `supabase/migrations/`; verificación en `tests/integration/`. Cada migración tendrá propósito, IDs fuente, precondiciones, impacto/bloqueo, compatibilidad aplicación anterior/nueva, validación y recuperación. Roles: migración separado de runtime ordinario.

Secuencia H0 propuesta, siempre cambio + comprobación local antes del siguiente:

1. Sin migración necesaria: composición y contratos C01–C06 — TSK-H0-003/004.
2. H0-M01: rol ordinario, permisos y contexto transaccional — TSK-H0-007/008.
3. H0-M02: historia, operación/efecto, resultado idempotente e intención — TSK-H0-009/010.
4. H0-M03: CRM Actor, sesión y actividad controlada — TSK-H0-005/006.
5. H0-M04: aprobación exacta y reserva/consumo de efecto — TSK-H0-011/012.
6. H0-M05: revocación de acceso Core y coordinación Auth — TSK-H0-013/014.
7. H0-M06: ámbito mínimo de enrolamiento/recuperación — TSK-H0-016/017.

Cada paquete se prueba sobre base vacía y versión inmediatamente anterior con fixtures previos; conserva IDs, vínculos, snapshots, historia, resultados y permisos. Preferir expandir → transformar/verificar → retirar solo con autorización. No borrar datos para pasar restricciones. Rollback de aplicación solo si el esquema sigue compatible; datos con hechos nuevos se reparan hacia delante. Restauración y break-glass mantienen P13 y ARCH-PENDING-002.

## 7. Separación de identidades

| Identidad/contexto | Facultad y límite |
|---|---|
| Identidad Auth humana | Prueba de autenticación; se relaciona con CRM Actor, pero no concede por sí sola facultad de negocio |
| CRM Actor | Identidad interna estable y habilitación vigente del único Administrador V1; distinta de Contact/Provider y de credenciales |
| Identidad técnica | Job/ingress/adaptador con permisos mínimos, origen y responsable; no suplanta al Administrador ni crea actividad humana |
| Contexto de ejecución | Construido por servidor: identidad, finalidad, alcance, operación/efecto y momento confiable; vive solo en la unidad/transacción y no se hereda por pool |
| Rol ordinario de datos | No propietario, sin BYPASSRLS ni administración de esquema; solo operaciones previstas a través de aplicación/contexto válido |
| Rol de migración | Cambios estructurales versionados; no se usa en runtime ni como actor CRM |
| Credencial privilegiada/service role/propietario | Solo operación administrativa o recuperación expresamente autorizada; nunca navegador, actor ordinario ni atajo de pruebas |

## 8. Datos sintéticos de H0

Usar identificadores opacos y etiquetas no personales; ningún nombre, teléfono, email o dato de cliente real.

| Familia | Casos mínimos |
|---|---|
| Actores | CRM Actor habilitado, inhabilitado, inexistente y relación Auth sin actor |
| Sesiones | Dos sesiones independientes; vigente, límite 7/30, revocada, MFA incompleto y recuperación incompleta; reloj controlado |
| Identidades técnicas | Job limitado, ingress verificado/no verificado y ejecutor sin facultad humana |
| Contextos/roles | Contexto válido, ausente, falsificado por cliente, de otro alcance; rol ordinario, migración y privilegiado usados solo en su prueba negativa |
| Operaciones | Misma identidad+contenido, misma identidad+contenido distinto, operación nueva y resultado previo con lectura no autorizada |
| Atomicidad | Efecto/historia/resultado/intención mínimos, raíz compartida, dos versiones y dos operaciones concurrentes |
| Evidencia/externos | Referencia sintética, evidencia candidata/verificada, intención pendiente, intento, resultado conocido e incierto |
| Entornos | Marcadores Development/Staging/Production incompatibles entre sí para detectar mezcla de recursos/secretos |

## 9. Puntos de fallo verificables

| Punto controlado | Resultado esperado / dueño de prueba |
|---|---|
| Antes de abrir/escribir la unidad | Sin escrituras; aplicación/contrato |
| Después de la primera escritura y antes de historia/resultado/intención | Rollback completo; persistencia V-AT |
| Entre historia, resultado e intención | Ningún parcial tras rollback; persistencia V-AT |
| Después del commit y antes de responder | Repetición recupera resultado previo tras reautorizar; idempotencia |
| Versión/raíz cambia concurrentemente | Conflicto, rollback y reevaluación; dominio+persistence |
| Serialización/deadlock | Solo reintento de unidad confirmada abortada y tras reevaluación; persistencia |
| Intención persistida, adaptador no invocado o caído | Pendiente visible; effects/jobs |
| Proveedor ejecuta pero respuesta se pierde | Resultado incierto, reserva conservada y conciliación antes de repetir; adaptador+effects |
| Evento/ingress duplicado o con mismo ID y contenido distinto | Reutilización o conflicto, nunca efecto duplicado; ingress/idempotencia |
| Objeto cargado sin metadata o metadata sin objeto | Estado incompleto/reparable, no evidencia confirmada; objects+history |
| Conexión reutilizada tras commit/rollback/error | Sin contexto/identidad anterior; access+persistence |
| Recurso marcado para otro entorno | Rechazo antes de efecto; composición/configuración |

No se implementa fault injection aquí. Cada punto se habilitará solo en fixtures/adaptadores de prueba, nunca mediante flags accesibles en Production.

## 10. Protocolo de evidencia H0

Un archivo `specs/001-core-crm/evidence-TSK-H0-NNN.md` por tarea ejecutada; no duplicar requisitos: referenciar ID/sección y registrar contraste.

Contenido mínimo: estado y fecha; commit probado; entorno/versiones; tarea/IDs/casos; datos sintéticos; pasos/comandos; esperado; observado; PASS/FAIL/BLOCKED; limitaciones/pendientes; artefactos recuperables y dueño de cambio/prueba. La comprobación enlazada es dueña del resultado: 004 para 003, 006 para 005, 008 para 007, 010 para 009, 012 para 011, 014 para 013 y 017 para 016. TSK-H0-018 agrega referencias, no transforma fallos en éxito.

V-DOM prueba decisiones; V-DAT permisos/Auth/PostgreSQL reales aislados; V-MIG base vacía+versión anterior; V-AT atomicidad/fallos/concurrencia; V-SM/V-NEG filas asignadas. Dobles solo acreditan contratos externos. Excluir secretos, TOTP/QR, tokens, credenciales, URLs temporales y cuerpos sensibles; resumir logs técnicos sin sustituir historia.

## 11. Pendientes y bloqueos localizados

- PLAN-PENDING-003 y PLAN-AUTH-001–006: PENDING / NO EJECUTADAS; bloquean acceso real/Production, no esta delimitación.
- ARCH-PENDING-001/002 y pendientes heredados: sin cambios; solo bloquean sus partes dependientes.
- D030: no incorporado como UI. D033: sin DNS, proyecto ni despliegue.
- Rutas y paquetes quedan acordados documentalmente; creación, instalación, build, SQL, RLS, Auth y pruebas requieren autorización de sus fichas.
- No apareció decisión material no derivable. No se crea D037.

## 12. Criterio de salida

Esperado: paquete revisable con módulos/rutas, C01–C06, T01–T11, migraciones, identidades, fixtures, fallos, dueños y protocolo V-EVI, sin implementación anticipada.

Observado: los doce elementos quedan delimitados; el dominio no depende de Next.js/Supabase SDK; identidad humana/técnica, roles y contextos están separados; cada unidad conserva atomicidad interna y excluye esperas externas; migraciones y datos son solo diseño/sintéticos; pendientes globales permanecen abiertos.

Resultado: **PASS / TSK-H0-002 COMPLETED exclusivamente en preparación**. C01–C06 y T01–T11 no están implementados. TSK-H0-003 permanece NOT STARTED.
