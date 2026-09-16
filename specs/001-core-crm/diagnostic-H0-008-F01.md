# Diagnóstico H0-008-F01

**DIAGNOSTIC / NOT APPROVED / NOT IMPLEMENTED**

Fecha: 2026-09-16. Work Local, mismo Mac y repositorio, rama main.
Base y origin/main: `ef452459f477ac3c78b08595312e869770259d44`.
Defecto: OPEN. TSK-H0-008: FAILED / H0 BLOCKED.
Salida propuesta: **B — PROPUESTA QUE REQUIERE DECISIÓN HUMANA**.

Este documento analiza alternativas; no aprueba un diseño, no corrige migraciones/código ni cierra la verificación. Los cinco archivos pendientes de H0-008 se conservan byte por byte. No se creó D037.

## 1. Causa confirmada y alcance de la evidencia

Las políticas de `202609150001_h0_m01_context.sql` aceptan identidad no vacía, clase `technical` y coincidencia de scope leídos de GUC. Runtime puede escribir esos valores sin pasar por el servidor. La marca privada de `trusted-context.ts` solo opera en el proceso TypeScript. `SET LOCAL` limita duración; no autentica procedencia.

Reproducción de diagnóstico, con el test existente intacto:

`POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/integration/postgres-h0-008-verification.test.ts`

PostgreSQL 17.11 (Postgres.app), Node 24.21.0. Resultado: **1 test, 0 PASS, 1 FAIL esperado al reproducir el defecto**. El test normativo esperaba `[]`; obtuvo `[{ probe_id: 'probe-protected-008' }]`. Usó clúster efímero, migraciones existentes, datos sintéticos y socket Unix sin TCP; se detuvo/eliminó al terminar. No se implementó ni ensayó una solución alternativa.

El ataque puede satisfacerse con SQL de esta forma, ya contenido en la reproducción:

```sql
BEGIN;
SELECT set_config('crm.identity_id', 'self-declared-runtime-008', true);
SELECT set_config('crm.identity_kind', 'technical', true);
SELECT set_config('crm.scope', 'scope-protected-008', true);
SELECT probe_id FROM crm_private.access_probe;
ROLLBACK;
```

No requiere SUPERUSER, BYPASSRLS ni modificar políticas. Satisface fraudulentamente la condición de una política que sigue ejecutándose. También pone en duda la autorización de la función de escritura; la nueva ejecución de este diagnóstico reprodujo lectura, no un segundo ataque de escritura.

## 2. Fuentes y criterio normativo

Lectura selectiva: Tasks TSK-H0-007/008, §§2.2/2.3, asignaciones §6 y puerta PLAN-AUTH-006 de §7; Plan §§3.2/6.5/7.1/7.2/5.4, B01, C01/C03; SPEC-FR-SEC-001/002/005, SPEC-FR-INT-002, AC-064/079/082. P10/P12, DM-INV-050, G1/SM-FORB-29 y ARCH-DEC-002/004/005 precisan mínimo privilegio, finalidad, ausencia de permisos implícitos y subordinación del transporte. Las evidencias H0-007/008 y el código son objetos examinados, no oráculos.

Plan §6.5 exige contexto inyectado únicamente por servidor, dentro de la transacción, sin herencia por pool y controles de datos que denieguen sin contexto. Ninguna fuente selecciona una clave MAC, un emisor SQL independiente, un protocolo de capacidades ni su rotación. La exigencia M2 de la autorización humana hace explícita la necesidad de una autoridad independiente de la contraseña runtime.

- **M1:** atacante controla todo el input HTTP. El proceso servidor y sus secretos permanecen confiables. Debe autorizar antes de emitir contexto y no funcionar como firmador de lo que pida el cliente.
- **M2:** atacante posee la contraseña runtime, conoce todos los objetos/IDs y puede emitir cualquier SQL permitido en conexiones propias. No posee una clave emisora separada, credenciales de migración, control del proceso servidor, del sistema operativo o de una conexión autenticada ajena ya abierta.

La identidad SQL compartida no permite diferenciar por sí sola al servidor legítimo del atacante M2. Es necesaria una prueba independiente o una identidad SQL realmente distinta. Esto es una deducción del modelo de amenaza, no una limitación de TypeScript que pueda arreglarse cambiando tipos.

## 3. Alternativas y comparación

Dos tablas forman la misma matriz para conservar legibilidad. «Cond.» significa viable conceptualmente bajo condiciones descritas, nunca PASS de implementación.

| Alternativa | Resiste M2 | Autoridad no fabricable | Deny-by-default | Aislamiento scope | Pool | C01 | C03 | PostgreSQL 17 | Supabase |
|---|---|---|---|---|---|---|---|---|---|
| A: GUC con MAC y vínculo transaccional, conservando lectura directa | Cond. | Clave separada de runtime | Si cada acceso valida MAC | Scope autenticado; finalidad limitada por grants | Sí, sin estado de sesión | Sí; expone más SQL de lectura | Sí, dentro de transacción | pgcrypto disponible según instalación | Soporte pgcrypto documentado; ensayo pendiente |
| B: solo funciones DEFINER, actor/scope libres | **No** | Ninguna prueba independiente | Insuficiente | Caller selecciona otro scope | Sí | Forma compatible, permiso inseguro | Atomicidad posible, permiso inseguro | Sí | Sí; no resuelve F01 |
| C1: login privilegiado seguido de SET ROLE runtime | **No como solución completa** | La contraseña del login superior es autoridad total | Runtime aislado puede denegar, pero se desplaza el problema | RESET ROLE recupera facultades del login | Frágil si se confía en degradación de sesión | Posible | Posible | Sí | Configuración concreta pendiente |
| C2: emisor SQL separado + permiso protegido ligado a transacción | Cond. | Credencial del emisor, inaccesible a runtime | Si solo emisor registra autorizaciones | Sí, cotejando identidad real de transacción | Sí, dos conexiones y visibilidad a resolver | Sí | Sí; emisión separada no es efecto Core | SQL ordinario, sin criptografía adicional | Roles custom documentados; ensayo pendiente |
| D: JWT validado criptográficamente en DB | Cond. | Clave del emisor; claims por sí solos no bastan | Si verificación completa y sin fallback | Si scope/operación/audiencia están autenticados | Sí con vínculo a transacción | Sí | Sí | No hay verificador JWT general en el núcleo | No basar PG17 en pgjwt; verificador pendiente |
| E: identidad PostgreSQL exclusiva por scope | Parcial | Login separado y mapeo protegido | No acredita autorización por petición con credencial robada | Protege otros logins, no scopes concedidos al login robado | Fragmenta pools | Solo autorización estática | Posible | Sí | Roles custom; no equivale a actor humano |
| F: A + funciones estrechas + grants mínimos + RLS | **Cond.; preferida** | MAC emitido fuera de SQL runtime | Verificación en cada acceso y sin acceso de tabla | Scope y operación/batch autenticados | Una conexión, contexto local | Proyección explícita | Batch interno atómico | Funciones, roles y pgcrypto | Compatible conceptualmente; puertas pendientes |
| G: GUC protegido por extensión nativa SUSET | Cond. | Capacidad reservada del setter | Solo si el setter autentica al emisor | Depende del setter | Carga de extensión en todo backend | Posible | Posible | Requiere código/extensión nativa | No garantizado para extensión propia; descartada aquí |

| Alternativa | Secretos adicionales | Superficie privilegiada | Complejidad | Migración desde H0-007 | Riesgos residuales |
|---|---|---|---|---|---|
| A | Una clave MAC por entorno en servidor y DB | Verificador con acceso exclusivo a clave | Protocolo, custodia, rotación y comparación segura | Clave protegida y políticas verificadoras | Lectura SQL amplia dentro del alcance; filtración/replay si se omiten vínculos |
| B | Ninguno | Funciones que elevan permisos | Baja aparente | Revocar SELECT; añadir funciones | Confunde ejecución privilegiada con autorización |
| C1 | Credencial superior | Login/membresías privilegiadas | Cambio de pools/identidad | Nuevos logins y grants | Recuperar privilegio del login original; mayor credencial ordinaria |
| C2 | Segunda credencial SQL de emisión | Emisor limitado y registro técnico protegido | Dos conexiones, transacción de emisión, limpieza y MVCC | Nuevo rol, tabla técnica, funciones, composición | Permisos huérfanos tras rollback; TTL/limpieza; snapshot previo; emisor comprometido |
| D | Clave privada y claves públicas o secreto compartido | Verificador y distribución de claves | Mayor superficie de parsing/algoritmos/rotación | Verificador no fijado, adaptación y controles | JWT bearer sin vínculo transaccional se reproduce; confusión de algoritmos |
| E | Credenciales por partición | Provisionamiento y mapeo login/scope | Escala con scopes/pools | Rediseña identidad de conexión | Contraseña robada sigue autorizando su partición sin autorización servidor |
| F | Una clave MAC separada, dos custodias | Verificador NOLOGIN y ejecutor NOLOGIN acotados | Más funciones que A; una sola transacción, sin registro de tokens | Política, grants, funciones, clave y adaptador | Emisor/DB admin comprometidos, replay dentro de una transacción ya autorizada, canales laterales |
| G | Depende de cómo autentique el setter | Extensión y carga privilegiada | Alta, portabilidad condicionada | Nueva extensión y configuración | No elimina necesidad de prueba independiente; dependencia hosted |

### Refutación de las familias

- **A:** intentaría cambiar scope en el paquete, calcular otro MAC, llamar un firmador SQL, leer la clave de `pg_proc`, `pg_settings`, tablas o Vault, copiar un paquete observado y ejecutar `set_config(..., false)` o `ALTER ROLE ... SET`. Si basta la posesión de un secreto estático enviado como campo, o basta un MAC sin vínculo transaccional, descartar. MAC completo sin oráculo de firma y con comparación segura es viable; la lectura directa conserva una superficie mayor que F.
- **B:** llamaría directamente a `api.read(actor_B, scope_B)` o fijaría GUC antes de `record_probe`. Sin autorización independiente, conocer la función basta. Un owner NOLOGIN no autentica los argumentos.
- **C1:** probaría `SET ROLE issuer`, `RESET ROLE` y `SET ROLE NONE`. Sin membresía, el runtime independiente no escala; pero si el servidor se conecta como emisor y luego baja a runtime, cualquier SQL en esa conexión puede recuperar al session_user. NOINHERIT no reemplaza controlar las opciones SET/ADMIN de todas las membresías. C1 no sirve como separación fuerte.
- **C2:** intentaría `SET ROLE issuer`, llamar a la función emisora, insertar/alterar el registro técnico, copiar el identificador de otro permiso o presentar el xid/backend de una víctima. Es viable solo sin membresías ni EXECUTE de emisión y cotejando datos reales de la transacción actual; el ID conocido no debe ser bearer. Un GUC establecido en la conexión del emisor no se transmite mágicamente a la conexión runtime. Hace falta un registro protegido u otra prueba.
- **D:** fijaría `request.jwt.claims`, falsificaría un JWT, usaría `alg=none`, cambiaría algoritmo/kid/audiencia, repetiría un token válido en otra conexión. Decodificar claims o consultar `auth.uid()` no verifica un JWT introducido por SQL directo. Un verificador real puede ser válido, pero añade problemas de formato y capacidades no fijadas para PG17.
- **E:** intentaría `SET ROLE scope_B` y modificar el mapeo. Sin grants no cruzaría a B; con el login de A accedería a A sin autorización de petición. Un login runtime común con membresías de todos los scopes vuelve a permitir elegirlos. No satisface el criterio completo.
- **F:** llamaría cada función directamente con GUC inventados, paquete modificado, paquete ajeno, argumentos distintos, `search_path` hostil y rol del verificador. Debe denegar todo salvo una capacidad emitida para esa transacción y operación exactas. La función nunca puede limitarse a comprobar `verified=true` en otro GUC.
- **G:** intentaría SET/SET_CONFIG antes de cargar la extensión o llamar al setter expuesto. Un REVOKE sobre un placeholder USERSET no equivale a definir un parámetro SUSET. Una extensión nativa propia no está garantizada en Supabase hosted.

PostgreSQL documenta que acepta placeholders con nombres de dos partes; el permiso SET no restringe parámetros normalmente modificables por usuarios. Por ello **ni ocultar el nombre ni REVOKE SET ON PARAMETER constituyen la corrección**. [Opciones personalizadas](https://www.postgresql.org/docs/17/runtime-config-custom.html), [privilegio SET](https://www.postgresql.org/docs/17/ddl-priv.html).

## 4. Propuesta preferida F: capacidad autenticada por transacción

Preferencia técnica condicionada: **HMAC-SHA-256 sobre una envoltura versionada y estricta, emitida por el servidor, funciones estrechas y RLS con contexto autenticado**. HMAC es un código de autenticación con secreto compartido; no es cifrado ni identidad humana ni firma legal. Es una aplicación propuesta de primitivas conocidas, pendiente de revisión del protocolo y su implementación.

Motivo: conserva la conexión y transacción PostgreSQL existentes y evita un registro persistente de permisos y otra conexión de emisión. Frente a B añade la prueba que falta; frente a D no incorpora un sistema JWT previo a Auth. C2 es una alternativa válida si Andrés prefiere otra credencial SQL y estado técnico a custodiar una clave MAC.

### Roles conceptuales (nombres nuevos solo descriptivos)

| Identidad | Facultad mínima propuesta | No tendría |
|---|---|---|
| Migración | DDL versionado y gestión deliberada de ownership/grants; conexión administrativa separada | Uso ordinario del Core |
| crm_h0_runtime | LOGIN, CONNECT, USAGE de interfaz, EXECUTE de funciones públicas del puerto | SELECT/DML directo Core, clave, DDL, CREATE/TEMP, membresías de owners/verificador/ejecutor, roles de lectura global/estadísticas/archivos, SUPERUSER/BYPASSRLS/CREATEROLE/CREATEDB |
| Ejecutor de datos | NOLOGIN; owner de funciones estrechas; solo columnas/operaciones requeridas sobre tabla y EXECUTE de verificador | Ownership de tabla, lectura de clave, roles globales o cambios de privilegios |
| Verificador | NOLOGIN; owner del verificador; SELECT de la clave protegida y metadatos necesarios | DML Core, firmador público, retorno de clave/MAC calculado o administración de esquema |
| Genérico/PUBLIC | Ninguna facultad sobre interfaz o Core salvo concesión explícita necesaria | EXECUTE implícito, tabla, clave, membresías |
| Emisor en proceso servidor | Autoriza y calcula MAC con clave de entorno independiente de contraseña DB | Endpoint para firmar libremente paquetes del cliente o emisión por SQL runtime |

La clave viviría en un secreto servidor y en almacenamiento DB protegido de verificación, provisionada por canal administrativo separado. Nunca en GUC, URL runtime, definiciones/comentarios de funciones, defaults de roles ni tablas consultables por runtime. El proceso de peticiones no necesita llevar credenciales de migración. El administrador DB pertenece expresamente a la base de confianza: este esquema no lo protege de sí mismo.

### Flujo conceptual mínimo

1. El servidor valida entrada y autoriza identidad técnica, finalidad, scope y operación. La marca TypeScript conserva su utilidad de programación; la autorización necesita hechos confiables previos.
2. Abre BEGIN mediante el pool runtime. Obtiene en esa misma transacción el xid8 real y backend real mediante funciones de `pg_catalog`.
3. Emite una capacidad con versión, identificador de clave, audiencia/entorno y generación de seguridad, login esperado, xid8/backend, identidad técnica, finalidad, scope, operación, huella del input/batch autorizado y caducidad. El cliente no elige el vínculo de transacción ni la autoridad. Formato canónico, tipos/límites/encoding estrictos y campos obligatorios deben especificarse antes de implementar; no concatenación ambigua.
4. Parametriza la capacidad hacia la función autorizada y, si se usa un GUC para transportar contexto a RLS, guarda solo la envoltura autenticada con alcance LOCAL. Los tres GUC actuales dejan de ser una fuente de autoridad.
5. El verificador obtiene la clave internamente, verifica autenticidad y compara la envoltura con xid8/backend/login reales, audiencia protegida, tiempo DB y operación real. Fallos, nulos, campos incompletos o clave no configurada deniegan.
6. Funciones estrechas de C01/C03 validan argumentos y huella, ejecutan SQL parametrizado y retornan la proyección mínima. RLS del ejecutor usa el mismo contexto autenticado y predicados de scope, con FORCE RLS en las tablas. Nunca un booleano/GUC de «ya verificado» fabricable.
7. COMMIT o ROLLBACK termina el contexto efectivo; el siguiente uso tiene otra transacción. Un paquete fijado a nivel SESSION por un atacante no adquiere validez en la nueva transacción.

`pg_current_xact_id()` devuelve el identificador de la transacción superior incluso dentro de subtransacciones. Puede asignar xid también a una lectura, con coste y uso del primario que habrá que medir. El binding se compara con valores consultados por DB, no con otro GUC recibido. [Identidad de transacción PostgreSQL](https://www.postgresql.org/docs/17/functions-info.html).

### Replay, caducidad y rotación

- Un token A copiado no sirve en transacción B, otra conexión activa, otro entorno o generación. Ni PID solo ni TTL solo bastan. Usar xid8 completo; la audiencia/generación deben cambiar al restaurar/clonar una base para evitar revalidar capacidades antiguas si se repite historia de transacciones.
- En la misma transacción autorizada, la capacidad puede reutilizarse para su alcance exacto. No se afirma uso único ni idempotencia durable. Si se exige una sola invocación C03 por transacción, debe decidirse y diseñarse un consumo protegido; un GUC `used=true` no sirve. Repetir tras rollback-to-savepoint no es repetir entre transacciones. Esta cuestión debe quedar explícita en la aceptación, sin implementar H0-009.
- Vincular el batch completo evita que una autorización de lectura se use para escribir o que se cambie una escritura dentro del scope. No aceptar nombres SQL libres ni expresiones del cliente como «operación».
- La caducidad se comprueba con tiempo DB actual, no con tiempo del cliente ni solo la hora congelada de inicio de transacción. No se promete caducidad exacta en COMMIT; deben fijarse semántica de admisión, límites de duración y revalidación que correspondan. No se inventa TTL numérico en este diagnóstico.
- Rotación mediante key-id y conjunto limitado de claves admitidas, alta primero del verificador y luego del emisor, retirada deliberada y revocación de emergencia fail-closed. La clave no viaja en las consultas runtime. Rotación, restauración y errores de configuración requieren prueba.
- La comparación del MAC no puede asumirse de tiempo constante por usar `bytea =`. Debe revisarse una comparación resistente a temporización y errores indistinguibles; pgcrypto no ofrece una garantía general de ausencia de canales laterales. Si no se acredita un verificador adecuado y portable, F permanece condicionada; no desplegar una comparación improvisada. [HMAC y límites de pgcrypto](https://www.postgresql.org/docs/17/pgcrypto.html).

### SECURITY DEFINER: requisitos inseparables

Owner NOLOGIN distinto del owner de tabla, sin membresías asumibles por runtime; revocar EXECUTE de PUBLIC y conceder por firma exacta en la misma migración transaccional. `search_path` explícito `pg_catalog, pg_temp`, objetos/tipos/helpers cualificados en schemas no escribibles, sin SQL dinámico ni objetos temporales como autoridad. Runtime no crea, reemplaza ni altera funciones, operadores o auxiliares. NOLOGIN por sí solo no impide SET ROLE: se inspeccionará el grafo de membresías.

RLS aplica al ejecutor sin BYPASSRLS; FORCE protege ante cambios de ownership pero no neutraliza superusuarios. Helpers no crean ciclos RLS ni devuelven secretos. El `current_user` dentro de DEFINER identifica al owner ejecutor; `session_user` identifica el login, no al actor técnico. El actor sale exclusivamente del contexto autenticado. Retorno acotado, errores sanitizados, sin query/params/DETAIL/stack público. La función vive en la transacción de C03, sin COMMIT autónomo ni efectos externos. [Funciones seguras](https://www.postgresql.org/docs/17/sql-createfunction.html), [SET ROLE](https://www.postgresql.org/docs/17/sql-set-role.html), [RLS y owner](https://www.postgresql.org/docs/17/ddl-rowsecurity.html).

## 5. Matriz de amenazas T1–T15

Es análisis de refutación, no resultados de tests de una solución implementada. A/F se consideran con MAC completo; D con verificación real, no claims decodificados. B y C1 se descartan como solución autónoma. E solo ofrece aislamiento estático. G depende de autoridad externa al runtime y capacidad hosted no garantizada.

| Amenaza / SQL a intentar | A/F: condición de resistencia | C2: condición de resistencia | D: condición de resistencia | B / C1 / E / G |
|---|---|---|---|---|
| T1: conocer schemas/tablas/funciones/GUC | Nada depende de ocultar nombres | IDs del permiso no son bearer | No depender de ocultar issuer/claims | B falla; E depende de grants; G depende de registro real del parámetro |
| T2: contraseña runtime robada | No incluye clave emisora | No incluye credencial emisora | No incluye clave privada/secreto JWT | C1 desplaza riesgo a login superior; E permite su alcance estático |
| T3: SQL arbitrario | F: solo EXECUTE acotado, sin tabla/clave; A conserva más lectura | Runtime no escribe registros de autorización | Verificación completa en cada superficie SQL | B puede invocarse fuera de aplicación |
| T4: IDs/scopes válidos conocidos | Scope/operación cubiertos por MAC | El permiso solo lo crea emisor | Scope en claims verificados | B acepta argumentos; E no distingue petición autorizada |
| T5: SET_CONFIG / SET / ALTER ROLE SET | GUC no autenticado se ignora/deniega | La tabla protegida decide, no el GUC | Claims libres no se aceptan | B falla si confía en GUC; G exige SUSET y setter auténtico |
| T6: SET ROLE / RESET ROLE / SET SESSION AUTHORIZATION | Sin membresías transitivas a owners; session_user real | Sin membresía a emisor/owners | Igual | C1 no puede tratar descenso de rol como irreversible; E sin grants a B |
| T7: llamar funciones directamente | MAC, scope, huella y tx cotejados dentro de la función | EXECUTE de emisión denegado; ejecución ligada a permiso | Token verificado dentro de DB | DEFINER sin proof falla; G setter público que acepta claims también |
| T8: search_path / pg_temp / sobrecargas | Paths fijos, cualificación y ausencia CREATE/TEMP; helpers revisados | Igual | Igual | Afecta toda función privilegiada, sea B, C o G |
| T9: error/rollback/pool/savepoint | Binding xid8/backend; ningún estado SESSION aceptado como autoridad | Registro ligado a tx terminada inerte; limpieza de huérfanos | Binding idéntico; JWT de sesión no basta | C1 frágil si confía en estado de sesión; E login no autentica petición |
| T10: clave por catálogo/SHOW/tablas/Vault/estadísticas | Clave fuera de SQL runtime, prosrc y settings; solo verifier la lee | Solo verificador de contraseña del emisor en catálogo protegido | Pública legible es válida; privada inaccesible | C1 no expone credencial superior; B no tiene prueba independiente |
| T11: replay token/capacidad | No entre tx/backend/audiencias; uso intratx expresamente acotado | Cotejo de tx real; consumo protegido; basura inerte tras rollback | TTL no basta; mismo binding y política de uso | B/C1 sin prueba; E reutiliza contraseña sin distinguir petición |
| T12: cruzar scopes | MAC del nuevo scope no fabricable | Emisor no acepta target desde input no autorizado | Claim cambiado invalida prueba | B falla; E solo si login/membresías no abarcan otro scope |
| T13: owner/FORCE RLS/DEFINER | Ejecutor no owner de tabla, no BYPASS, policies y helpers no eludibles | Mismas condiciones | Mismas condiciones | FORCE no corrige origen de claims; NOLOGIN no corrige EXECUTE |
| T14: HTTP totalmente hostil | Emisor autoriza; no firma tx/scope/body autodeclarados | Emisor no registra permisos a petición arbitraria | No emitir JWT por claims del cliente | Todas requieren servidor correcto; buena protección M1 no prueba M2 |
| T15: secreto en navegador/datos runtime | Clave solo servidor/almacén DB protegido; capacidad minimizada y sin logs | Credencial emisor solo servidor, nunca runtime | Clave privada solo emisor, o secreto compartido protegido | C1 aumenta credencial sensible; G depende de su diseño |

PostgreSQL permite a usuarios consultar detalles de sesiones de su mismo rol. No se puede basar el sistema en que otro login runtime nunca vea una consulta o capacidad. Por eso se usan parámetros, se excluyen secretos de registros y se liga toda capacidad a una transacción que otra conexión no puede adoptar. Los administradores y la telemetría privilegiada siguen siendo parte de la confianza. [Visibilidad de estadísticas](https://www.postgresql.org/docs/17/monitoring-stats.html).

### C2, alternativa viable con coste diferente

Un login emisor de servidor independiente podría registrar un permiso técnico para `(audiencia/generación, login runtime, backend, xid8, actor, scope, operación/huella, vencimiento)`. Runtime no recibiría EXECUTE de emisión, DML de ese registro ni membresía del emisor. La interfaz de datos contrastaría el permiso con la transacción real y consumiría el permiso junto a los cambios.

La emisión debe confirmarse por la conexión separada antes de leerla en runtime. READ COMMITTED permite verla en una sentencia posterior; un snapshot ya fijado por REPEATABLE READ/SERIALIZABLE no ve necesariamente esa emisión. Si la transacción runtime aborta después de emitirse el permiso, la autorización almacenada puede quedar huérfana: el vínculo a la transacción terminada impide usarla, pero requiere caducidad y eliminación posterior segura. No afirmar que desaparece físicamente por el rollback de la otra conexión. El registro es seguridad técnica, no historia/idempotencia comercial; aun así introduce estado nuevo y una decisión material. [Aislamiento y snapshots](https://www.postgresql.org/docs/17/transaction-iso.html).

### JWT y firma asimétrica

Un JWT técnico independiente de Auth puede ser autenticado con un emisor controlado; necesita issuer/audience/expiry/algoritmo fijo/kid y vínculo a tx/operación. JWT es contenedor, no una garantía por sí mismo. Una firma asimétrica reduce la custodia DB a una clave pública, pero no hay una primitiva SQL general de verificación JWT asimétrica en el núcleo PostgreSQL. No se da por disponible una extensión o lenguaje capaz de verificarla en hosted.

HMAC emplea la misma clave para emitir/verificar; un verificador comprometido con acceso a ella podría emitir. La alternativa asimétrica es atractiva si se acredita un verificador mantenido y admitido por la plataforma. Hoy no se selecciona ni se introduce JWT/Auth por este diagnóstico. El futuro JWT de Auth no elimina la validación de sesión/habilitación ni autoriza scope comercial por sí solo.

## 6. Compatibilidad PostgreSQL 17 y Supabase

| Propiedad | Documentado | Pendiente antes de aceptar la corrección |
|---|---|---|
| Roles custom, NOLOGIN, ownership, grants y DEFINER | PostgreSQL 17 admite esas piezas | Ensayar bootstrap como autoridad disponible, evitando asumir SUPERUSER |
| RLS + FORCE | PostgreSQL los aplica según rol ejecutor/owner | Catálogo, helpers, políticas SELECT/INSERT, denegación y no retorno sensible |
| HMAC-SHA-256 | pgcrypto ofrece HMAC; Supabase publica pgcrypto en su esquema PG17 | Extensión, schema, privilegios y comparación segura reales; no basta «soportado» |
| JWT | pgjwt figura deprecated para PG17 en documentación específica | No depender de él; otro verificador sería selección pendiente |
| Pool transaccional | Supabase documenta roles custom y transaction mode; desactivar prepared statements | BEGIN→obtener xid/backend→emitir→verificar→fin en mismo backend; caída/reconexión/retry y role mapping |
| Secretos | Una tabla privada puede restringir lectura; Vault ofrece almacenamiento cifrado y vista descifrada | ACL de tabla/vista/helpers, provisión, rotación, backup y logs; Vault no sustituye permisos |
| Migración | SQL/PLpgSQL y roles propios compatibles en principio | `postgres` hosted no es un superusuario general; comprobar transferencias de ownership y grants reales |
| Réplicas/restauración | El binding usa primario y generación de entorno | Invalidar capacidades al clonar/restaurar; no reutilizar claves/generación productiva en tests |

La evidencia de disponibilidad procede del [esquema PG17 oficial de Supabase](https://github.com/supabase/postgres/blob/develop/migrations/schema-17.sql), no de haber creado un proyecto. La página genérica de extensiones menciona pgjwt, pero prevalece la [advertencia específica de pgjwt para PG17](https://supabase.com/docs/guides/database/extensions/pgjwt).

El [pooler de Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres) permite la estrategia conceptualmente; este diagnóstico no ensaya ese pooler. La restricción de [superusuario hosted](https://supabase.com/docs/guides/database/postgres/roles-superuser) descarta asumir una extensión nativa propia o permisos globales. [Vault](https://supabase.com/docs/guides/database/vault) no impide que quien tenga permiso de lectura de su vista obtenga el secreto descifrado. No guardar la clave MAC donde runtime pueda consultarla.

No hay datos suficientes para declarar preparada Production. También deberán verificarse identidad del servidor TLS y certificados: cifrado requerido por el runtime actual no debe confundirse automáticamente con verificación completa del servidor remoto.

## 7. Riesgos residuales y límites de la recomendación

- Robo de la clave emisora, control del proceso servidor o autoridad DB/migración quedan fuera de M2 y comprometen la garantía. No usar la misma clave que la contraseña runtime ni el secreto Auth.
- La firma autentica la decisión del emisor; no comprueba que sus reglas de negocio sean correctas. Debe firmar únicamente después de autorización real, sin API arbitraria de firma.
- Canonicalización, parsing, comparación del MAC, selección de clave, auxiliares privilegiados, logs y errores son superficie crítica. La recomendación no equivale a código auditado.
- Un actor M2 puede intentar agotamiento de conexiones, consultas costosas o cancelación de sesiones del mismo rol. La solución propuesta es de autorización/confidencialidad, no una garantía integral de disponibilidad ante credenciales robadas. Su revocación sigue siendo necesaria.
- Un token vinculado a la transacción no es idempotencia durable y no acredita «una sola llamada dentro de la transacción». Si el ataque incluyese inyección dentro de una conexión legítima ya autorizada, se amplía el modelo: hay que limitar cada llamada y decidir consumo protegido, no alegar que el token por sí solo lo resuelve.
- TTL, cambios de clave y aislamiento de snapshots necesitan semántica explícita: no prometer revocación instantánea de todas las transacciones abiertas. Ausencia/configuración inválida siempre deniega.
- Los GUC antiguos no validan purpose/request/time ni habilitación de una identidad concreta. Se observa en código, sin clasificar aquí nuevos defectos: el futuro mecanismo debe validar el paquete completo y derivar la autoridad del emisor.

## 8. Impacto propuesto y migración futura, sin implementar

**C01:** conservar `AuthorizedQueryPort` y su proyección mínima. El repositorio llamaría a una función de lectura acotada, con capacidad para query/scope/finalidad concretos. No hay driver en domain/application ni decisiones de permisos en transporte.

**C03:** conservar `TransactionPort` y BEGIN/COMMIT/ROLLBACK en infraestructura. La envoltura cubriría los cambios técnicos validados y precondiciones del batch; la función ejecutaría ese batch sin SQL dinámico. Las reglas de negocio siguen en dominio/aplicación. Este cambio no implementa historia/resultado/intención durables ni T01–T11.

**H0-007:** cambios materiales aunque concentrados: modo de establecer/verificar contexto, lectura por función, owners acotados, custodia de clave, políticas y grants; pruebas deben adaptarse sin borrar el contraejemplo original.

Secuencia futura que necesitaría autorización:

1. Aprobar el mecanismo y sus límites; especificar formato, rotación/replay/comparación segura y responsabilidades de custodia.
2. Añadir migración correctiva hacia delante, preservando ambas H0-M01 como historia. Añadir roles NOLOGIN/almacén de claves/funciones de acceso verificadas, revocar SELECT runtime y EXECUTE del camino antiguo, reemplazar políticas que confían en GUC libres. Bootstrap de roles separado del runtime.
3. Provisionar clave por canal administrativo fuera de Git. Migraciones sin secreto; función inactiva si falta clave.
4. Adaptar infraestructura y composición servidor para emitir capacidad; mantener contratos públicos de aplicación y límites de transporte.
5. Cambiar esquema y aplicación de forma coordinada fail-closed: no mantener temporalmente una ruta insegura como fallback. Una aplicación antigua puede quedar denegada; no reabrir grants para hacerla funcionar. No realizar despliegues como parte de la reparación local.
6. Ejecutar V-MIG desde vacío y desde H0-007, conservar datos/identificadores/permisos esperados y repetir H0-008 completa, más regresiones. Recuperación hacia delante; no rollback al diseño vulnerable.

## 9. Pruebas futuras exigibles

No se añaden ni implementan tests ahora; lista para una autorización posterior:

1. H0-008-F01 original permanece como regresión; denegación por falta de grant o falta de autenticidad, no por error de montaje del test.
2. Positivo real C01/C03 con capacidad válida; sin capacidad, campo ausente, null, bytes mal formados, codificación ambigua o versión/kid desconocidos → deny.
3. Manipular actor, kind, scope, purpose, operación, query/batch/huella, audiencia, xid/backend y caducidad; no firma válida accidental.
4. Repetir entre conexiones, mismo pool max:1, actor A→B, commit, rollback, error SQL, excepción callback, savepoints y múltiples transacciones. Identificador/capacidad de A conocido por B no sirve.
5. Usar SET LOCAL, SET SESSION, ALTER ROLE SET, RESET, parámetros de conexión y GUC `verified` falsos. Autoridad solo procede de la capacidad validada.
6. Enumerar membresías, owners, PUBLIC, grants y EXECUTE. Ataques SET ROLE/RESET ROLE/SET SESSION AUTHORIZATION, CREATE/ALTER/DROP/GRANT/REVOKE, desactivar RLS y modificar función/policy.
7. SQL directo y llamadas a toda función auxiliar/expuesta. Sin capacidad no se obtiene proyección ni efecto. Con capacidad de lectura no se escribe; otra huella/batch no pasa.
8. `search_path`, pg_temp, tipos, operadores, sobrecargas e input SQL hostil. Cero SQL dinámico controlado por caller.
9. Secreto canario en almacén privado; intentar pg_proc/proconfig/pg_settings/defaults/catálogos/tablas/vistas/Vault/estadísticas/diagnósticos. Errores SQL/driver no exponen clave, token ni valores sensibles; la huella no permite consultar contenido ajeno.
10. Clave ausente, clave equivocada, rotación escalonada, revocación, viejo kid, restore/clone de otra generación; todo fail-closed. Revisar comparación de MAC y oráculos de errores/tiempo antes de aceptarla.
11. C03 falla antes/durante escrituras y no deja parciales. Decidir y ensayar reutilización dentro de la misma transacción; no etiquetar estos casos como idempotencia durable.
12. V-MIG desde vacío/versión anterior, ownership efectivo con autoridad compatible con hosted y regresión H0-003/004/007. Después typecheck, lint/boundaries, tests, audit y build. Pooler hosted solo cuando exista autorización específica.

## 10. Decisión humana requerida

**Salida B.** Las fuentes exigen la garantía, pero no derivan inequívocamente un mecanismo. Se recomienda F condicionada, sin declarar que ya sea segura ni conforme.

Andrés debe decidir si aprueba:

- Una capacidad técnica autenticada por transacción y operación con clave MAC independiente de runtime, almacenada en servidor y DB protegida; o C2 con credencial SQL emisora separada y registro técnico de permisos.
- Revocar SELECT directo runtime y limitar C01/C03 a funciones con verificador/ejecutor NOLOGIN separados, conservando los contratos de aplicación.
- La custodia/rotación/recuperación y límites de confianza; el criterio de replay intratransacción, caducidad y condiciones de aceptación del verificador. Sin verificador portable y revisado, F no se acepta.

Una decisión nueva, D037 o identificador equivalente que corresponda, sería apropiada para registrar el modelo de confianza antes de implementar. **No se crea ni se da por reservado ese ID.** Tampoco se presupone que aprobar este diagnóstico autorice automáticamente la corrección o el cierre de H0-008.

PLAN-AUTH-006 sigue **PENDING / NO EJECUTADA globalmente**. La propuesta no une todavía Auth/sesión humana al contexto técnico. No requiere cambiar reglas comerciales ni abandonar el monolito modular, pero sí una selección material de seguridad y autoridad.

## 11. Preservación y cierre del diagnóstico

La única creación de este turno es este archivo. No se modificaron código, migraciones, dependencias, los cinco archivos pendientes de H0-008 ni fuentes APPROVED. No se generaron secretos ni se probó una solución. El único ensayo volvió a ejecutar la reproducción existente sobre un clúster efímero que se eliminó.

Huellas SHA-256 iniciales de los cinco archivos protegidos, para comparar al terminar:

| Archivo | SHA-256 |
|---|---|
| tests/integration/postgres-h0-008-verification.test.ts | 5effe84d286cfcb8f70834c84dd00ac20efef2668126790e23d1de090538ad70 |
| specs/001-core-crm/evidence-TSK-H0-008.md | 10b1329802cb80c8ddd067af4c1b573ca9e0e70cec58d4cfd88cf07d0cb8c7c3 |
| specs/001-core-crm/tasks.md | 8d9a14a1e14147b573c75d21fdddc1ef757ba4854254e052908aeae64a934e63 |
| docs/PROJECT-STATUS.md | 35501c5727836151c5c364b2791541cfb11fa75a10308f6d1164912b4b58c6e2 |
| docs/NEXT-STEPS.md | 09f2fbd01114260ae68e927cabe705dd9bedebbff227ca639614045c2a93f150 |

No commit ni push. H0-008 FAILED/BLOCKED, H0-008-F01 OPEN, H0-009/010 y H0-005/006 NOT STARTED. Ningún recurso remoto creado.

## 12. PROTOCOL REVIEW — NOT APPROVED / NOT IMPLEMENTED

Fecha: 2026-09-16. Clasificación: **NOT READY — REDESIGN REQUIRED**.

Se diseña exclusivamente F para su revisión. No se aprueba F ni D037, no se implementa un verificador, no se reparan H0-007/F01 y no se ejecuta otra tarea. Las secciones 1–11 se preservan como diagnóstico previo; esta sección precisa y revisa su propuesta, no cambia fuentes APPROVED.

### 12.1. Conclusión y cuestión técnica abierta

El bootstrap de una sola conexión y la defensa ante copia del token son coherentes: el servidor puede obtener el identificador real de su transacción runtime, autenticarlo y presentar la capacidad en esa misma transacción. El vínculo no es secreto. Una copia vista desde otra conexión no corresponde a su xid/backend. Tampoco se necesita hacer confiables los GUC: transportarían bytes que se autentican de nuevo.

**PR-F-01 OPEN:** falta seleccionar y justificar una implementación de comparación/verificación de MAC resistente a un oráculo temporal bajo SQL arbitrario, portable sin superuser a PostgreSQL 17/Supabase. No se acepta `hmac(...) = supplied_mac` como sustituto de esa justificación. El código oficial PostgreSQL 17 de `byteaeq` usa `memcmp`; no ofrece contrato de comparación criptográfica en tiempo constante. Esto acredita una garantía ausente, **no una falsificación práctica demostrada**. Tampoco la advertencia general de pgcrypto sobre canales laterales demuestra por sí sola un ataque contra HMAC-SHA-256. [Código oficial REL_17_STABLE, byteaeq](https://raw.githubusercontent.com/postgres/postgres/REL_17_STABLE/src/backend/utils/adt/varlena.c), [pgcrypto, notas de seguridad](https://www.postgresql.org/docs/17/pgcrypto.html).

Candidatos que requieren una revisión específica antes de recomendar aprobación:

1. Comparador de trabajo fijo: exigir dos entradas de 32 bytes, recorrer siempre los 32 índices, acumular OR de XOR de cada par y decidir solo al final. No retornar por primer byte diferente, no comparar prefijos, no usar comparaciones secretas en SQL/indexes, no realizar accesos de memoria dependientes del secreto. Es un diseño plausible, pero escribir ese pseudocódigo no acredita automáticamente las propiedades del intérprete, compilación y expresiones PostgreSQL elegidas. No se ha implementado ni certificado aquí.
2. Una primitiva nativa documentada de verificación/comparación constante, disponible sin extensión propia/superuser y garantizada en el hosted objetivo. No se ha identificado esa garantía en las interfaces SQL consultadas. No se selecciona pgsodium como atajo: Supabase lo documenta pendiente de deprecación. [pgsodium](https://supabase.com/docs/guides/database/extensions/pgsodium).
3. Un esquema de comparación cegada con análisis criptográfico independiente, no un hash adicional inventado como prueba de seguridad. No se recomienda sin concretar construcción, supuesto y revisión.

Si ninguna opción se justifica, habría que reconsiderar C2 del diagnóstico (autoridad emisora SQL separada), **fuera de esta autorización de diseño F**. No se implementa ni se amplía ahora esa alternativa.

El protocolo candidato siguiente deja PR-F-01 visible en el paso `VERIFY_MAC`. Por ello sus controles criptográficos son **CONDICIONALES**, no PASS de implementación ni una afirmación de que F ya resista íntegramente M2. Los pendientes hosted de despliegue son distintos de este punto técnico previo a la decisión.

### 12.2. Fuentes normativas y alcance de confianza

Se mantiene la trazabilidad selectiva de §2: Tasks TSK-H0-007/008, §§2.2/2.3/6/7; Plan §§3.2/6.5/7.2, B01/C01/C03; SPEC-FR-SEC-001/002/005, SPEC-FR-INT-002 y AC-064/079/082. No se deriva de esas fuentes un algoritmo de capacidades: lo que sigue es propuesta técnica, no norma aprobada. Las migraciones H0-M01, transaction.ts, runtime.ts, h0-m01-adapter.ts, postgres-composition.ts y evidencia H0-008 determinan los puntos que habría que reemplazar, no el permiso que debería existir.

- M1 controla HTTP, incluidos campos de autoridad, anidados, desconocidos y variantes. El servidor valida, obtiene su contexto técnico autorizado y materializa el input antes de firmar. **Nunca firma un envelope/binding/scope que le entregue el cliente sin autorización independiente.** La capacidad no se devuelve al navegador ni al cliente HTTP.
- M2 tiene exclusivamente credenciales runtime, SQL arbitrario permitido, conocimiento completo del protocolo y puede observar información que PostgreSQL exponga al mismo rol. La seguridad se analiza incluso suponiendo que copia un paquete válido. No puede inyectar comandos en una conexión ajena ya autenticada solo por conocer su contraseña; el secuestro de esa conexión sería una capacidad adicional. R6 se protege aun si consigue repetir llamadas dentro de una transacción autorizada.
- Robo de clave HMAC, proceso servidor comprometido, administrador/migrador/owner comprometido o acceso al sistema operativo/backup están fuera de la propiedad A (robo de contraseña runtime). Son autoridades de confianza, no riesgos solucionados por F.

### 12.3. Protocolo candidato F1 y bootstrap exacto

Una unidad usa una conexión reservada por `sql.begin` de Postgres.js. Se proponen READ COMMITTED y protocolo extendido parametrizado, `prepare:false`. No se usa sesión nueva como defensa.

1. El servidor valida input y autorización técnica en application/domain; conserva un objeto inmutable de autorización y sus bytes materiales. No genera una identidad humana ni implementa Auth.
2. `BEGIN ISOLATION LEVEL READ COMMITTED` en conexión **crm_h0_runtime**.
3. En esa transacción obtiene, mediante funciones de catálogo cualificadas, `pg_current_xact_id()::text`, `pg_backend_pid()`, `pg_postmaster_start_time()`, OID de la base actual, `session_user` y reloj DB. Los convierte sin pérdida a los tipos binarios de §12.4. La generación/audiencia esperada y el key_id proceden de configuración confiable del servidor, no de input HTTP.
4. El servidor comprueba el login esperado, construye el cuerpo C01 o C03, calcula su fingerprint, añade binding/plazo/capability_id y firma el payload **en memoria del servidor** con la clave separada. No hay función SQL de firma ni segunda conexión emisora.
5. Invoca una de dos funciones estrechas conceptuales, `read_probe(capability_bytea, request_bytea)` o `apply_probe_batch(capability_bytea, request_bytea)`. Son nombres propuestos, no funciones creadas.
6. El ejecutor exige READ COMMITTED y session_user runtime, verifica paquete/binding/operación/input/plazo con el helper privado y, para C03, registra el consumo técnico. Establece solamente envelope/input locales para RLS; no un flag confiable.
7. Ejecuta SQL estático sobre la superficie autorizada con RLS y devuelve la proyección/resultados mínimos. No acepta callbacks SQL, nombres de tablas/funciones ni sentencias del caller.
8. El servidor confirma la transacción o hace rollback ante cualquier error. No entrega éxito C03 antes de confirmar COMMIT. Si se pierde confirmación, conserva incertidumbre; no reintenta como si fuera un fallo conocido.

No hay círculo lógico: obtener un binding público no concede acceso a filas ni exige un contexto previo. La autenticación viene del MAC posterior. La función vuelve a leer **su binding real**; no compara dos valores enviados por el caller. [Postgres.js, transacciones](https://github.com/porsager/postgres#transactions).

### 12.4. Serialización canónica propuesta

Se elige **binario de orden fijo con enteros big-endian y strings UTF-8 length-prefixed**. No se firma JSON, `jsonb::text`, texto SQL, representaciones locales de fechas ni cadenas separadas por caracteres escapables.

Convenciones: `U8/U16/U32/U64` son enteros sin signo de 1/2/4/8 bytes en red; `B16/B32` son exactamente 16/32 bytes; `S` es U32(longitud en bytes) seguido de UTF-8 válido, sin NUL. No hay campos opcionales ni NULL. Strings de identidad/scope/purpose/rol/operationId/probeId no admiten vacío; publicValue sí admite vacío, distinto de ausencia. Se rechazan UTF-8 inválido, surrogates sin pareja antes de codificar en JS, longitudes inconsistentes, campos sobrantes y overflow. No se normaliza Unicode silenciosamente: bytes diferentes son valores diferentes. Igualdad de IDs/scope en datos debe ser exacta, con colación determinista o comparación de bytes, no colación que equipare formas diferentes.

Payload firmado P, **en este orden**:

| Campo | Representación y regla |
|---|---|
| Separador de dominio | 8 bytes ASCII exactos `CRM-H0F1` |
| protocol_version | U16 = 1; otro valor denegado, sin negociación |
| key_id | B16 público; identifica versión, no secreto |
| environment/audience | B16 identifica la base/entorno lógico permitido |
| generation | B16 independiente; cambia antes de servir tras clone/restore/reset de línea temporal |
| database_oid | U32 de base efectiva |
| backend_start_binding | U64: microsegundos Unix de `pg_postmaster_start_time()` |
| transaction_id | U64 de xid8 completo, nunca xid32 truncado |
| backend_pid | U32 del backend efectivo |
| login | S = `crm_h0_runtime`; cotejar contra session_user real |
| authorized_identity | S, identidad técnica emitida por servidor |
| identity_kind | U8 = 1, exclusivamente technical en F1 |
| purpose | S, valor autorizado por servidor y permitido en configuración privada para F1 |
| scope | S, scope autorizado; no scope inferido de conocer un ID |
| operation | U8: 1=C01, 2=C03 |
| resource | U8 = 1, superficie técnica access_probe; no recurso comercial genérico |
| action | U8: 1=read_probe, 2=apply_probe_batch; pares 1/1 y 2/2 exclusivamente |
| material_fingerprint | B32 = SHA-256 del cuerpo canónico Q |
| not_before | U64, microsegundos Unix del reloj DB obtenido en bootstrap |
| expires_at | U64, not_before + 30 000 000 microsegundos, máximo F1 propuesto |
| capability_id | B16 aleatorio generado por servidor; no es secreto ni basta para autorizar |

Wire capability = `P || HMAC-SHA-256(K[key_id], P)`; tag de 32 bytes, sin truncar. El parser conoce el orden/tamaños, consume exactamente todo el paquete y separa los últimos 32 bytes. Solo HMAC-SHA-256: ningún campo permite cambiar algoritmo. U64 se procesa con BigInt/decimal exacto, nunca Number que pierda precisión.

Cuerpo Q: 8 bytes ASCII `CRM-INP1`, U8(operation), seguido de:

- C01: S(probeId).
- C03: S(operationId), U8(historyRequired)=1, U8(resultRequired)=1, U8(expectedVersion_present)=0, U8(intent_present)=0, U32(número de records), y por cada record en orden: U8(kind)=1 para `record-technical-probe`, S(probeId), S(publicValue). No ordenar/eliminar duplicados después de firmar. Las banderas representan el contrato existente; no afirman que H0-009 esté implementada. F1 cubre el subconjunto técnico sin expectedVersion/intent: si se proporcionan, se rechazan como no soportados, nunca se omiten silenciosamente al firmar. La interfaz general AtomicCommit conserva esos campos; su semántica futura no queda acreditada por este adaptador técnico.

F1 propone límites técnicos: P y Q de hasta 64 KiB cada uno y cada S de hasta 16 KiB, comprobados antes de trabajo criptográfico/decodificación costosa. No son límites de negocio APPROVED; deberán aceptarse o ajustarse expresamente en una decisión futura. El ejecutor decodifica y ejecuta **Q**, y calcula por sí mismo su hash. No acepta un fingerprint declarado como sustituto de Q. Cualquier nueva forma de operación necesitaría un codec completo y revisión; F1 no habilita un intérprete CRUD general.

Comparación de formatos: binario fijo es compacto pero por sí solo no delimita strings; length-prefix resuelve límites inequívocos; JSON canónico necesitaría una especificación y dos implementaciones consistentes; texto delimitado exigiría escapes/canonicalización adicional. El formato elegido elimina concatenación ambigua, reordenación de campos, null/empty confusion y dependencia de locale. PublicValue idéntico visualmente pero con bytes distintos cuenta como input distinto.

### 12.5. Binding, tiempo, savepoints y pool

`pg_current_xact_id()` asigna un XID si aún no existe; por ello una lectura C01 deja de ser una transacción sin xid, aunque no escriba datos Core. El xid8 es estable para la transacción superior y contiene época; no debe sustituirse por el xid32 ni tratarse como nonce secreto. PID solo se reutiliza y no distingue transacciones; un nonce servidor solo es bearer; capability_id solo tampoco impide copia. Se elige xid8 + PID, acotados por base, arranque y generación. [Funciones de información PostgreSQL 17](https://www.postgresql.org/docs/17/functions-info.html).

El binding se obtiene después de BEGIN, antes de firmar. Reconexión/nueva transacción requieren una nueva capacidad y autorización vigente. Savepoint no crea una autoridad nueva ni cambia el top-level binding; rollback-to-savepoint puede deshacer conjuntamente escrituras y consumo técnico. Tras commit/rollback/error, aunque un GUC de sesión restaure un paquete viejo, su xid no coincide. Debe eliminarse contexto temporal también por higiene; la seguridad no depende de que quede una cadena vacía.

En transaction pooling se conserva el backend durante BEGIN…COMMIT/ROLLBACK, no entre unidades. Todas las consultas deben usar el objeto transaccional reservado, nunca el pool raíz entre binding y operación. `prepare:false` no equivale a interpolación: se mantienen parámetros del protocolo extendido. No usar capacidades a través de PostgREST/RPC que ejecuten binding y operación en transacciones independientes. [Conexiones/pooling Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).

Plazo propuesto: `not_before <= clock_timestamp < expires_at`, duración firmada exactamente 30 segundos, sin tolerancia horaria adicional en DB. Se toma el reloj DB para evitar depender de sincronización Node/DB. Se comprueba el plazo en la admisión, en los accesos RLS y al final del ejecutor: caducidad produce error y rollback de la sentencia, nunca una lectura parcialmente filtrada presentada como éxito. No se almacena un instante supuestamente confiable en GUC ni se acepta tiempo aportado por runtime. No se promete un temporizador que interrumpa exactamente al vencer ni una fecha límite de COMMIT: confirmar después una operación ya terminada dentro de plazo sigue estando permitido.

READ COMMITTED se exige para que una operación nueva tenga snapshot reciente de claves/revocación. La revocación durante una sentencia ya admitida no constituye cancelación instantánea: sus efectos pueden terminar bajo la versión visible a esa sentencia. No se promete que MVCC desaparezca, ni se usa `now()` congelado al inicio de transacción para ampliar el plazo. Una revocación de emergencia que deba detener operaciones en curso requiere además retirar el emisor/terminar sesiones de forma administrativa y autorizada.

### 12.6. Custodia, verificador y autoridades

Custodio autorizado genera 32 bytes criptográficamente aleatorios por clave, fuera del repositorio. Dos copias: almacén de secretos exclusivo del proceso servidor y fila protegida DB. Nunca password runtime como clave. HMAC es simétrico: **el verificador que lee K podría firmar**, aunque no se exponga una función de firma. Por eso esa identidad NOLOGIN y su owner/migrador pertenecen al perímetro privilegiado. No se presenta verificación como si usara una clave pública.

Key store conceptual: key_id, clave de 32 bytes, audience/generation, ventana de aceptación y estado enabled/revoked. Schema privado no expuesto a Data API; sin grants a runtime/PUBLIC/anon/authenticated/service_role. Owner administrativo; verificador solo SELECT. No secretos en DDL, cuerpo de funciones (`pg_proc` es inspeccionable), GUC, role settings, migraciones versionadas, diagnostics ni respuestas. El aprovisionamiento se hace por un canal administrativo autorizado y sin logs de parámetros. Backups/WAL contienen material sensible y necesitan su propia custodia; cifrar el dato con otra clave igualmente legible no resuelve M2.

Rotación: provisionar K2 habilitada para verificación; distribuir K2 al servidor; cambiar key_id de emisión; mantener K1 solo para la ventana autorizada de capacidades en vuelo; deshabilitar/revocar K1 y retirarla de servidor. El payload incluye key_id y no hay fallback a otra clave. Ausencia, error de lookup, múltiples filas o clave revocada: deny, nunca clave vacía/de prueba. Durante coexistencia cada paquete usa exclusivamente su key_id. Revocación y plazo siguen la semántica MVCC de §12.5. Un restore/clone exige generación nueva y claves de entorno propias antes de aceptar tráfico.

| Identidad propuesta | Ownership / capacidades |
|---|---|
| crm_h0_runtime | LOGIN; sin SUPERUSER/BYPASSRLS/CREATEROLE/CREATEDB/REPLICATION; ningún ownership técnico/Core; CONNECT/USAGE mínimo y EXECUTE de dos ejecutores. Ningún SELECT/DML de tablas, ni CREATE de schemas, ni membresías SET/INHERIT/ADMIN en roles privilegiados. No privilegios de lectura de archivos, estadísticas privadas ni administración. |
| Autoridad de migración existente | Separada de runtime; administra los objetos propios y grants necesarios. Puede alterar el código privilegiado, por tanto es autoridad de confianza. No se usa en solicitudes. |
| Owner de tablas/schemas | NOLOGIN cuando sea viable; distinto de ejecutor y verificador. Administra estructura/políticas. No heredable/asumible por runtime. |
| Verifier owner | NOLOGIN, sin bypass/administración; propietario de helpers privados y SELECT del key store, sin SELECT/DML Core. No concede claves/MAC calculado al caller. |
| Executor owner | NOLOGIN, sin bypass/administración; propietario de dos ejecutores; no owner de tablas. Grants de columnas SELECT/INSERT estrictamente requeridos; EXECUTE de helpers y acceso mínimo al registro de consumo. No lectura de claves. |
| Rol genérico/PUBLIC/roles Data API | Ningún EXECUTE privilegiado ni acceso a tablas técnicas/Core/key store. Revocaciones explícitas; verificar defaults de la plataforma. |

No se crea una credencial de login verifier/executor. La administración necesita poder asignar esos owners; ello se comprobaría sin superuser local y posteriormente hosted, no se presupone por usar bootstrap superuser en un ensayo.

`verify_capability(P, tag, Q, expected_operation)` conceptual: SECURITY DEFINER del verifier NOLOGIN, EXECUTE solo executor/owner administrativo; lee clave y metadatos públicos de la conexión/transacción, valida formato/campos, realiza **VERIFY_MAC pendiente PR-F-01**, rehash Q y valida binding/tiempo/audience/generation/login/purpose/operación/recurso/acción. Devuelve únicamente claims ya validados al ejecutor, no MAC esperado ni bytes de clave. No firma, no recibe nombres SQL ni consulta datos Core.

`row_allows(...)` conceptual: helper privado del mismo verifier, accesible al executor para políticas; obtiene envelope/Q locales, repite autenticación/binding/tiempo y comprueba scope y operación/recurso/acción, probeId y, para INSERT, que valores pertenecen al manifest firmado. Devuelve booleano de alcance; credencial inválida produce denegación. No confía en claims planos, flag verified ni hash sin MAC.

### 12.7. Funciones ejecutoras, SECURITY DEFINER y RLS

Las dos funciones PL/pgSQL conceptuales son SECURITY DEFINER del executor NOLOGIN. Requisitos comunes:

- `search_path` fijo `pg_catalog, pg_temp`, con todos los schemas/objetos privados, helpers, tipos y primitivas de extensión cualificados. `pg_temp` no se usa para almacenar autoridad ni para resolver objetos. Operadores/casts resueltos en schemas confiables; no sobrecargas del caller.
- Revocar EXECUTE de PUBLIC al crearlas dentro de la misma migración transaccional; conceder únicamente signatures exactas. Helpers en schema no expuesto, sin CREATE runtime. No overloads/defaults que amplíen interfaz.
- Sin SQL dinámico, callbacks, funciones elegibles por usuario, rutas, nombres de objetos, creación de temporales ni DDL. Datos materializados como parámetros/variables de tipos nativos; no concatenar SQL.
- Solo migración/owners autorizados pueden ALTER/REPLACE. Runtime no pertenece al owner ni tiene privilegios sobre su schema. NOLOGIN por sí solo no basta: comprobar membresías transitivas y opciones SET/ADMIN.
- `session_user` verifica el login original; `current_user` cambia al entrar en DEFINER y no representa al humano ni autentica claims. La confianza de identidad/scope procede del MAC.
- Variables locales para claves; nunca enviarlas a GUC. Para RLS, envelope y Q se transportan localmente y siempre se vuelven a verificar. Una cláusula SET de función/restauración explícita debe acotar esos valores a la llamada; ningún valor anterior restaurado otorga autoridad por sí solo.
- Resultados de lista blanca; errores de autorización con SQLSTATE/mensaje fijo. No retornar SQLERRM/DETAIL/HINT/CONTEXT ni stack crudo. Errores inesperados viajan a la frontera de servidor y se convierten en diagnóstico mínimo sin serializar objetos del driver. Un error fuera del cuerpo de función no queda mágicamente saneado por DEFINER.
- Funciones VOLATILE/PARALLEL UNSAFE cuando corresponda; no marcar verificación como IMMUTABLE ni LEAKPROOF, ni cachear autorización entre llamadas. La revisión de planes/privilegios deberá evitar constantes de autorización congeladas.

El SELECT/INSERT efectivo se ejecuta como **executor**, no como runtime ni owner de tabla. Executor no tiene BYPASSRLS; tabla mantiene ENABLE y FORCE ROW LEVEL SECURITY. Policies TO executor emplean helpers autenticadores y predicates sobre la fila, con USING/WITH CHECK adecuados. FORCE no neutraliza SUPERUSER/BYPASSRLS ni impide a un owner administrativo cambiar la política. Por ello la separación de owners es obligatoria. [CREATE FUNCTION y seguridad DEFINER](https://www.postgresql.org/docs/17/sql-createfunction.html), [RLS PostgreSQL](https://www.postgresql.org/docs/17/ddl-rowsecurity.html).

RLS no sustituye grants ni el manifest de operación. Runtime sin permiso SQL no accede a tabla aunque tenga GUC correctos. Executor con permiso SQL tampoco puede leer/escribir otra fila fuera del paquete. No mantener la policy anterior que confía en crm.scope/identity_id por sí solos; una policy permisiva adicional podría reabrir el bypass. No exponer vistas owner-bypass, RPC genérico, pg_read_all_data, funciones auxiliares con grants excesivos ni DEFAULT PRIVILEGES heredados que reabran superficie.

### 12.8. C01, C03 y replay R1–R7

**C01:** read_probe recibe capability/Q parametrizados, valida operación=1/recurso=1/acción=1 y probeId exacto, instala el paquete local y consulta solo probe_id/public_value. La fila debe satisfacer RLS por scope y probeId autenticados. Un ID fuera de scope produce ausencia/denegación conforme al contrato, nunca proyección privada. El executor no tiene SELECT private_value. Verificar antes y después de SELECT evita que cero filas omitan la validación o que una caducidad se presente como lectura parcial exitosa. El resultado se materializa dentro de la función, sin cursor que sobreviva a la unidad.

**C03:** una capacidad autoriza **un manifest completo ordenado**, no todo un scope ni escrituras futuras elegibles por caller. apply_probe_batch valida operation=2/recurso=1/acción=2, Q y precondiciones estructurales; ejecuta todos sus records estáticos dentro de la misma transacción. Cada fila queda limitada por RLS al manifest autenticado. Primer fallo, fallo intermedio, excepción o caducidad deshacen toda la sentencia/unidad. El servidor continúa usando el puerto C03; transporte no implementa la transacción ni reglas de negocio. No se implementan historia, resultado/intención durable ni T01–T11; las ampliaciones H0-009 necesitarían revisión del codec/manifest, no se consideran autorizadas hoy.

**Precisión frente al diagnóstico preliminar:** no se considera suficiente decir «replay intratransacción es idempotencia futura» para una función que puede escribir. La variante F1 aquí diseñada añade un **registro técnico protegido de consumo**, distinto del key store y de la idempotencia de negocio. Es coste/estado adicional propuesto, no existente ni derivado inequívocamente de APPROVED.

Para C03, el executor inserta antes de escribir una marca única por `(generation, database_oid, transaction_id, capability_id)`, con fingerprint y expires_at, en tabla técnica no accesible a runtime. Si ya existe, la segunda aplicación se deniega. La marca se confirma o revierte **junto con** las escrituras. Runtime no puede borrarla/alterarla. Rollback a un savepoint anterior a la llamada deshace marca y efectos: repetir entonces permite otra ejecución, pero no conserva dos ejecuciones. Un savepoint posterior no elimina la marca anterior. No es una garantía «se consume incluso si falla», que requeriría persistencia independiente.

Las marcas confirmadas quedan inertes por binding al xid terminado. Requieren limpieza administrativa posterior, sin implantar jobs: solo marcas de transacciones finalizadas y plazo vencido; no borrar marcas de transacciones activas ni usar solo un GUC/tabla temporal descartable como consumo. Esta persistencia **no** almacena resultado comercial, no reconoce operaciónId equivalente en otra transacción y no resuelve H0-009. Retención/limpieza y carga operativa requieren decisión/revisión propia del mecanismo. C01 no consume: permite releer exactamente el mismo objeto dentro de su autorización y plazo; READ COMMITTED no promete snapshot idéntico entre consultas.

| Replay | Política exacta propuesta | Mecanismo / límite |
|---|---|---|
| R1 otra transacción | Rechazar | xid8 real distinto; generación/arranque/base también vinculados |
| R2 otra conexión | Rechazar | xid8 + PID efectivos; copia no permite adoptar transacción ajena |
| R3 otro scope | Rechazar | scope firmado, comparado en RLS |
| R4 otra operación | Rechazar | operation/resource/action firmados y función con expected_operation fijo |
| R5 input modificado | Rechazar | Q rehasheado; manifest ejecutado es el mismo Q autenticado |
| R6 misma transacción | C01: misma lectura permitida; C03: segunda aplicación superviviente denegada | Marca técnica protegida; rollback de marca implica rollback de efectos |
| R7 varias consultas legítimas C03 | Permitir las instrucciones internas del único manifest | No una capacidad por INSERT ni permiso abierto para futuras consultas del caller |

### 12.9. Transporte y observación M2

| Vía | Observación/copia/modificación/repetición por M2 | Decisión |
|---|---|---|
| Parámetro bytea de función mediante protocolo extendido | El ensayo no mostró valor en pg_stat_activity, pero driver/tracing/logs de parámetros pueden mostrarlo. Se asume copia posible. Puede cambiar su argumento, no el MAC válido | **Elegida**; binding y verificación protegen autoridad, no invisibilidad |
| Literal/argumento incrustado en texto SQL | Mismo rol puede ver/copy query text y contenido; errores/prepared statements/logs también pueden retenerlo | Prohibir interpolación; no sostener seguridad en que el literal no se vea |
| GUC | Caller puede SET/set_config/ALTER ROLE SET donde permitido, inspeccionar su conexión y retener baseline; no puede modificar otra conexión solo por nombre GUC | Solo transporte interno de envelope/Q autenticados, nunca fuente independiente de autoridad |
| Tabla temporal | Mismo backend y ciclo de sesión; no un canal secreto, puede crear sombras/descartar estado propio; pooling complica persistencia | No usar para clave ni consumo confiable |
| Tabla protegida | ACL separada puede impedir lectura/DML runtime; si insertar capacidad exige emisor SQL distinto cambia bootstrap | Usar para claves/consumo, no para enviar la capacidad del servidor con una segunda conexión |
| Prepared statements / pooler | No constituyen almacén secreto. Query text, Bind, instrumentation y configuración hosted deben auditarse | prepare:false, una transacción reservada, TLS autenticado en hosted; no depende de ocultación |

Clave HMAC no cruza nunca la conexión runtime. Si se filtra **capacidad**, el binding limita reutilización pero sus claims/material input pueden revelar metadatos: se debe minimizar/redactar. Si se filtra **clave**, M2 podría firmar su propio binding y el objetivo deja de cumplirse. El rol compartido también puede causar DoS/cancelaciones donde PostgreSQL lo permita; F no promete disponibilidad ante credenciales robadas.

Logs PostgreSQL pueden incluir parámetros y el mensaje del error puede contener el valor incluso sin imprimir parámetros. No basta con `log_parameter_max_length=0`; hay que revisar logging de errores, extensiones, tracing y el saneamiento de la frontera. No se promete confidencialidad frente a administradores que controlen esos canales. [Logging PostgreSQL 17](https://www.postgresql.org/docs/17/runtime-config-logging.html), [visibilidad de actividad](https://www.postgresql.org/docs/17/monitoring-stats.html).

### 12.10. Refutación A01–A30

Resultado de **análisis de diseño**, no tests del protocolo. «Cond.» depende de cerrar VERIFY_MAC/PR-F-01 y de implementar correctamente los controles; no significa PASS. En cada fila se conserva precondición, ataque, resultado esperado, defensa y límite residual.

| ID / precondición → acción | Expected | Mecanismo propuesto | Resultado de revisión / riesgo residual |
|---|---|---|---|
| A01: paquete conocido → cambiar identity | Denegar | P completo autenticado; identity no procede de GUC plano | Cond.; emisor que firme identidad no autorizada sigue siendo fallo M1 |
| A02: paquete conocido → cambiar scope | Denegar | MAC y predicate RLS exacto | Cond.; colación no debe equiparar scopes distintos |
| A03: C01 válido → cambiar operation a C03 | Denegar | MAC + expected_operation fijo por ejecutor | Cond.; no función genérica que acepte cualquier acción |
| A04: paquete conocido → reemplazar fingerprint | Denegar | fingerprint dentro de P | Cond.; resistencia criptográfica SHA-256 |
| A05: paquete de otro entorno → cambiar audience/generation | Denegar | MAC + cotejo con configuración privada local | Cond.; clones no deben conservar generación/clave activa |
| A06: paquete conocido → cambiar key_id | Denegar | key_id firmado; lookup exacto sin fallback | Cond.; no generar diagnósticos que expongan claves |
| A07: SQL directo → capability NULL/vacía/truncada | Denegar antes de efectos | Parser estricto y límites | Diseño cerrado; no dejar función STRICT devolver NULL como aparente éxito |
| A08: binding propio conocido → probar MACs y medir tiempos/prefijos | Denegar sin facilitar falsificación | HMAC + comparación segura requerida | **OPEN PR-F-01**; igualdad bytea ordinaria no acredita defensa temporal |
| A09: token previo → nueva transacción mismo PID | Denegar | xid8 efectivo diferente | Binding verificado en propiedades; protocolo no ejecutado |
| A10: token observado en conexión A → invocar en B | Denegar | xid8/PID actuales, no supplied values | Cond.; secuestro de conexión ajena no equivale a robo de contraseña |
| A11: token scope A válido → pedir fila scope B | Denegar/ausencia sin filtración | Q autenticado + RLS scope/probeId | Cond.; no IDOR por conocer IDs |
| A12: token lectura válido → llamar ejecutor escritura | Denegar | action/operation/resource y firma | Cond.; grants no sustituyen esta comprobación |
| A13: capacidad C03 válida en su tx → repetir llamada | Segunda ejecución superviviente denegada | Marca técnica única transaccional protegida | Cond.; añade persistencia; rollback de marca también revierte efectos |
| A14: runtime → llamar verifier/helper directamente | Permiso denegado | Sin EXECUTE/USAGE privados; sin membresía | Diseño cerrado; acceso por executor no devuelve MAC/clave |
| A15: runtime → llamar ejecutor directamente | Solo paquete correcto y exactamente acotado puede pasar | Verificación obligatoria en entrada, no confianza en caller aplicación | Cond.; la llamada directa es parte del modelo, no anomalía |
| A16: runtime → SELECT key store, catálogo, settings, backups | No obtener K | ACL, no secretos en pg_proc/GUC, sin privilegio archivos/backups | Cond.; administradores/backups fuera de M2, auditar vistas/stats |
| A17: runtime → INSERT/UPDATE/DELETE key store | Denegar | Sin DML/ownership ni funciones de mantenimiento expuestas | Diseño cerrado; migrador sigue siendo autoridad privilegiada |
| A18: runtime → SET ROLE verifier/executor/migration | Denegar | Ninguna membresía transitiva SET/ADMIN/INHERIT | Diseño cerrado; NOLOGIN solo no basta |
| A19: runtime → set_config identity/scope/verified/token falso | Sin autoridad | RLS acepta solo envelope reautenticado y binding real | Cond.; SET LOCAL no se presenta como autenticación |
| A20: runtime → search_path hostil | Sin escalada | SET fijo en cada DEFINER y nombres cualificados | Diseño cerrado; incluir operadores/casts y helpers |
| A21: caller puede crear temporal → objeto homónimo | Sin shadowing útil | Nada sensible sin schema; pg_temp no usado para autoridad | Diseño cerrado; revocar TEMP donde viable reduce superficie pero no es defensa única |
| A22: caller crea función homónima/overload | Sin interceptar helper | Signatures y schema cualificados, sin CREATE en schema confiable | Diseño cerrado; auditar defaults y funciones futuras |
| A23: caller induce cast/error/timeout → observar error | Ninguna clave ni resultado público con token/input sensible | Errores fijos + saneamiento de driver/logs | **Pendiente implementación**; experimento confirma que error bruto filtra canario |
| A24: mismo rol → leer pg_stat_activity/query | Copia no concede autoridad en su tx | Se asume token observado; binding manda | Propiedad de observación confirmada; metadatos/DoS siguen siendo riesgo |
| A25: tx válida → SAVEPOINT, operar, ROLLBACK TO, repetir | Nunca dos aplicaciones supervivientes | Xid top-level estable; marca y efectos rollback juntos | Propiedad xid ensayada; consumo no implementado |
| A26: pool max:1 → reusar conexión con GUC viejo | Denegar autoridad vieja | Nueva tx, nuevo xid; helper no acepta baseline | Propiedad básica ensayada; protocolo/pooler hosted pendientes |
| A27: operación enviada → perder conexión antes de conocer COMMIT | No presumir éxito/fallo ni reejecutar ciegamente | Rollback si desconexión antes de commit; si commit pudo llegar, resultado incierto | No resuelve idempotencia durable H0-009 |
| A28: paquete válido → demorar hasta caducidad | Rechazar nueva admisión; error si vence durante función | clock_timestamp, comprobaciones por acceso/final | No impone deadline de COMMIT ni protege contra reloj administrativo manipulado |
| A29: K1 vigente → rotación/revocación concurrente | K2 nueva emisión; K1 solo ventana/estado permitido | key_id exacto, READ COMMITTED, verificación por llamada | MVCC permite sentencia en vuelo según snapshot; no revocación instantánea retroactiva |
| A30: token válido → cambiar/reordenar records, IDs/valores o usar SQL en strings | Denegar diferencia; string nunca SQL | Codec Q exacto, rehash, manifest ejecutado, parámetros, SQL estático | Cond.; cambios futuros de codec/operación requieren revisión |

### 12.11. Experimentos de propiedades PostgreSQL 17.11

Ejecutados en este turno con binarios Postgres.app existentes, Node/Postgres.js instalados y un script por stdin no guardado. Clúster temporal independiente `crm-protocol-properties-*`, base vacía, solo socket Unix, TCP deshabilitado, auth local trust únicamente dentro del directorio temporal privado, rol sintético property_runtime no privilegiado. **Ningún HMAC, clave, función de solución, migración nueva ni modificación de tests.**

| Experimento | Expected | Observed |
|---|---|---|
| `pg_current_xact_id_if_assigned` antes de asignar | NULL | NULL |
| `pg_current_xact_id` + SAVEPOINT + ROLLBACK TO | Asigna y mantiene xid superior | Confirmado |
| Siguiente `begin` usando max:1 | Mismo backend, xid nuevo | Confirmado |
| GUC de sesión baseline + SET LOCAL + COMMIT | Restaura baseline, no necesariamente vacío | Confirmado |
| Mismo caso + excepción callback/rollback | Restaura baseline | Confirmado |
| Mismo caso + división por cero/rollback | Restaura baseline | Confirmado |
| Dos conexiones mismo rol; literal TOKEN_CANARY_H0_008 en query activa | Otra conexión puede verlo | Confirmado |
| Mismo caso con parámetro Postgres.js | Query muestra placeholder, no valor en este canal | `$1` visible; canario no visible en pg_stat_activity del ensayo |
| Parámetro SECRET_CANARY_H0_008 convertido a integer inválido | Error bruto puede incluir valor | Canario presente en message del driver |

El script terminó con `EPHEMERAL_CLUSTER_STOPPED_AND_REMOVED`; se cerraron conexiones, se detuvo PostgreSQL y se eliminó el directorio temporal completo con su log. Se destruyeron solo objetos/datos sintéticos desechables, sin datos del proyecto. Estos ensayos no acreditan F, un comparador constante, single-use, políticas nuevas, logging hosted ni un pentest. No se ejecutó suite H0-008 ni se cambió su evidencia fallida. No se hizo benchmark temporal: ausencia de señal en una muestra no demostraría ausencia de canal lateral.

### 12.12. PostgreSQL/Supabase, cambios futuros y decisión

PostgreSQL 17 ofrece xid8, transacciones, funciones DEFINER, roles NOLOGIN, grants, RLS/FORCE y pgcrypto HMAC; no hace falta un runtime superuser. Sin embargo, su existencia no resuelve PR-F-01. Supabase documenta pgcrypto, roles custom, funciones y transaction pooling; no entrega superuser y no se propone una extensión C propia. Esto fundamenta **compatibilidad conceptual**, no aceptación hosted. [Extensiones Supabase](https://supabase.com/docs/guides/database/extensions), [roles](https://supabase.com/docs/guides/database/postgres/roles), [funciones](https://supabase.com/docs/guides/database/functions), [restricciones de superuser](https://supabase.com/docs/guides/database/postgres/roles-superuser).

Pendientes hosted bajo autorización PLAN-AUTH: versión/extensión y schema de pgcrypto efectivos; ownership/SET de migrador a roles NOLOGIN sin privilegios extraordinarios; ACL/membresías/default grants completos, incluidas integraciones administradas; no exposición Data API; key store y backup/restore con generación nueva; logs y parámetros; TLS con autenticación del endpoint; session_user efectivo con login custom en pooler; BEGIN/binding/función/COMMIT en backend fijado; prepare:false y tratamiento de reconexiones. No se asume que instalar una extensión propia esté permitido. La guía `supabase` motivó contrastar docs vigentes y la separación de grants/RLS; sus patrones Auth/GUC no son la autoridad normativa de M2 y no se incorporaron. El índice changelog.md falló; se consultó el changelog público y las páginas oficiales pertinentes, sin crear proyecto.

Si posteriormente se autoriza la corrección, H0-007 requeriría una migración revisable de endurecimiento: revocar SELECT runtime, sustituir políticas basadas en claims planos, establecer owners/grants/funciones/key store y, si se mantiene la política de consumo F1, su tabla técnica. Se conservaría historia de migraciones, ensayando vacío y actualización desde H0-M01, sin reescritura silenciosa de evidencia. El material secreto se aprovisionaría fuera de migraciones/Git. transaction.ts/adapter/composition pasarían de inyectar claims a obtener binding, firmar en servidor y llamar funciones estrechas; application/domain no importarían driver/crypto. No se cambia C01/C03 a SQL genérico ni se implementa H0-009.

Pruebas futuras: vectores canónicos compartidos Node/PG (UTF-8, empty/null, máximos, overflow, U64, campos sobrantes); HMAC/comparador y revisión de canal lateral; A01–A30 completos; SQL directo con runtime/rol ajeno; catálogo, membresías, default grants, ownership y migración sin superuser; key store/secretos/rotación/snapshots; C01 mínimo y aislamiento; C03 consumo, atomicidad y savepoints; commit/rollback/error/pool reutilizado; canarios en errores/diagnósticos/logging; migración desde vacío y H0-M01; regresiones H0-003/004/007/008, typecheck, lint/boundaries, audit y build. No se añaden esos tests ahora.

**F sigue siendo una candidata preferida, no una recomendación de aprobación.** El diseño exige más que «HMAC en GUC»: binding real, verificación no falsificable, ejecutores mínimos, RLS, custodia y consumo C03 explícito. No se propone texto de aprobación D037 mientras PR-F-01 esté abierto. Después de cerrarlo, la decisión humana tendría que seleccionar protocolo/codec, comparador, autoridades, custodia/rotación, semántica de expiración/revocación y persistencia/limpieza de consumo; aceptar pruebas y pendientes hosted, y autorizar por separado cualquier implementación. No se crea ni reserva D037.

PLAN-AUTH-006: **PENDING / NO EJECUTADA globalmente**. H0-008: FAILED/BLOCKED. H0-008-F01: OPEN. H0-005/006/009/010: NOT STARTED. No Auth/UI/Production/Staging, recursos remotos, commit ni push.

### 12.13. Preservación del trabajo local

Único archivo ampliado por esta revisión: este diagnóstico; se conserva su prefijo original de 258 líneas y los otros cinco archivos pendientes de §11. El árbol esperado sigue conteniendo exactamente esos seis archivos, sin implementación guardada ni recursos experimentales. Base esperada inalterada: HEAD = origin/main = `ef452459f477ac3c78b08595312e869770259d44`.

La comparación SHA-256 posterior confirmó los cinco hashes de §11 y el hash del prefijo original del diagnóstico `309843a2b5b4d200912d426cf5922fa2c9dd2af313b82cc47468466cd67015b9`. Los chequeos Git confirmaron main, el remoto SSH IAndresB/crm-huescaventura-os y ambos SHA base iguales; ningún archivo staged ni commit nuevo. `git diff --name-only` enumera solo los tres modificados tracked; `git status` incluye además los tres untracked esperados. No se confunde esa diferencia de presentación con archivos desaparecidos.

## 13. PR-F-01 REVIEW — NOT APPROVED / NOT IMPLEMENTED

Fecha: 2026-09-16. **PR-F-01 CLOSED — COMPARATOR ACCEPTABLE**.

Este cierre es exclusivamente técnico, respecto del comparador bajo M2 y los criterios de esta autorización. No aprueba F1, no crea D037, no implementa F1/CRM, no resuelve H0-008-F01 ni cierra H0-008. Las secciones 1–12 se conservan íntegramente como cronología: sus referencias a PR-F-01 OPEN reflejan la revisión anterior y quedan actualizadas, solo para este punto, por esta sección. Ninguna fuente APPROVED se modifica.

### 13.1. Amenaza real: qué podría aprender M2

Sea E = HMAC-SHA-256(K, P), para un payload conocido P y clave K inaccesible. El atacante elige S de 32 bytes, invoca la ruta verificadora permitida y mide duración, repitiendo consultas. Si el comparador inspeccionase bytes secuencialmente y se detuviese ante la primera diferencia con una señal observable, podría probar 256 candidatos al siguiente byte y conservar el que prolonga la comparación. Eso sería un oráculo de prefijo de E, no una rotura matemática de HMAC. Cambiar de P no mejora el ataque si HMAC se comporta como PRF; el ataque relevante mantiene P fijo y adapta S.

En PostgreSQL real M2 puede amortizar viajes de red con muchas invocaciones SQL, medir desde DB, calentar planes/cachés o cambiar parámetros de ejecución permitidos. No se acepta «la red introduce ruido» como defensa. Ruido: plan/caché, intérprete, alocación/detoast, pgcrypto/OpenSSL, scheduler, reloj, protocolo/driver/pooler y logging. Su existencia no prueba imposibilidad de extracción estadística.

**Respuesta sobre bytea =:** (a) está acreditada su falta de garantía constant-time; (b) no se ha demostrado aquí un oráculo de prefijos explotable con tags de 32 bytes en esta máquina. El uso de memcmp puede producir diferencias por posición/bloques según libc/CPU, pero PostgreSQL no implementa en ese punto un bucle byte a byte cuya salida anticipada podamos atribuir a todos los sistemas. Con 32 bytes una libc vectorizada puede comparar bloques completos sin gradiente byte a byte. El experimento no permite afirmar ni explotación práctica ni seguridad universal. La construcción elegida evita depender de resolver esa incertidumbre de libc.

### 13.2. Código PostgreSQL 17.11 y primitivas

Se revisó el tag **REL_17_11**, no únicamente una rama mutable:

- `byteaeq` en varlena.c obtiene longitudes con `toast_raw_datum_size`; si difieren retorna false sin comparar contenido; si coinciden detoasta y llama `memcmp(..., len1 - VARHDRSZ) == 0`. Para dos MAC de 32 bytes, la llamada compara 32 bytes. PostgreSQL delega el algoritmo/early exit a libc. Las longitudes inválidas son conocidas por el caller y su rechazo rápido no revela un prefijo secreto.
- `byteaGetByte` comprueba índice contra longitud y devuelve el byte indexado. Tras validar 32 bytes, índices 0…31 no generan excepciones dependientes del prefijo.
- `exec_stmt_fori` de PL/pgSQL evalúa límites, ejecuta el cuerpo con `exec_stmts`, incrementa el índice y vuelve a comprobar el límite. Un FOR fijo sin EXIT/RETURN interno procesa las 32 posiciones. No se encontró una transformación del intérprete que reemplace ese bucle por memcmp. No es una promesa para cualquier versión futura ni una certificación del tiempo de cada instrucción CPU.
- pgcrypto expone `hmac(bytea,bytea,text) -> bytea`, y `gen_random_bytes(integer) -> bytea`. El primero calcula, **no verifica**, un MAC. El segundo usa `pg_strong_random`; en la ruta OpenSSL revisada usa RAND_bytes y falla si no obtiene aleatoriedad. No es `random()`/`setseed()`.
- La implementación HMAC de pgcrypto procesa ipad/opad y digest; con clave de 32 bytes y mensajes de blinding de longitud fija no hay búsqueda del primer byte correcto. No se extrapola a todo OpenSSL una garantía de ausencia de canales laterales.

Fuentes primarias: [byteaeq/get_byte](https://raw.githubusercontent.com/postgres/postgres/REL_17_11/src/backend/utils/adt/varlena.c), [intérprete FOR](https://raw.githubusercontent.com/postgres/postgres/REL_17_11/src/pl/plpgsql/src/pl_exec.c), [pgcrypto API y RNG](https://raw.githubusercontent.com/postgres/postgres/REL_17_11/contrib/pgcrypto/pgcrypto.c), [HMAC interno](https://raw.githubusercontent.com/postgres/postgres/REL_17_11/contrib/pgcrypto/px-hmac.c), [RNG fuerte](https://raw.githubusercontent.com/postgres/postgres/REL_17_11/src/port/pg_strong_random.c), [API SQL pgcrypto](https://raw.githubusercontent.com/postgres/postgres/REL_17_11/contrib/pgcrypto/pgcrypto--1.3.sql).

No se identificó una función SQL pública del núcleo/pgcrypto equivalente a `timingSafeEqual` o `hmac_verify`. Las primitivas C internas no se convierten en API SQL autorizada por conocer su nombre.

Sí existe un candidato nativo en **pgsodium**: `crypto_auth_hmacsha256_verify(hash bytea, message bytea, key bytea) -> boolean`. Su wrapper valida hash/clave de 32 bytes y llama a libsodium; la API C documenta verificación constant-time (0 éxito, -1 fallo), convertida a booleano por el wrapper. No se instaló ni seleccionó: Supabase lo lista, pero mantiene advertencia de deprecación pendiente, y no se necesita añadir esa dependencia para este cierre. Su disponibilidad efectiva/versiones/grants en un proyecto hosted requerirían ensayo. [Wrapper pgsodium](https://github.com/michelp/pgsodium/blob/main/src/hmac.c), [libsodium HMAC-SHA-2](https://doc.libsodium.org/advanced/hmac-sha2), [estado oficial Supabase](https://supabase.com/docs/guides/database/extensions/pgsodium).

### 13.3. Evaluación de las construcciones

| Construcción | Evaluación para M2 |
|---|---|
| E = S con bytea | No seleccionada; depende del comportamiento libc/CPU y no elimina estructuralmente un posible prefijo observable. No se afirma que esté explotada. |
| Bucle fijo sobre E/S originales | Defendible frente al early exit clásico en el código PG17 revisado: 32 índices, XOR/OR enteros, sin ramas por contenido. No exige certificación CPU; no obstante, el elegido añade blinding para no depender de que toda microvariación del intérprete sea independiente de E. |
| SHA-256(E) frente a SHA-256(S) | Destruye la relación simple de prefijos, pero crea un objetivo transformado estable y necesita un argumento de preimagen/fugas distinto. No se adopta ni se afirma que un hash adicional por sí solo demuestre seguridad. |
| hash(E || S) frente a hash(S || S) | Requeriría justificar preimagen/correlaciones de entradas relacionadas; no basta invocar «efecto avalancha». No es la construcción seleccionada. |
| Double-HMAC con clave fija pública | No conserva prefijos del MAC original, pero permite trabajo offline contra un objetivo transformado estable. Necesita otro análisis; no cumple la prueba de clave fresca elegida aquí. |
| Double-HMAC con clave fija secreta independiente | Puede ser defendible bajo supuestos PRF, pero mantiene un objetivo/oráculo estable y añade custodia/rotación innecesarias. No se elige ni se reutiliza K. |
| Double-HMAC con clave aleatoria privada nueva por comparación | **Elegida**, con bucle XOR/OR fijo sobre los dos tags cegados. Bajo PRF, para E distinto de S la distribución observada en la comparación no informa sobre el prefijo original y cambia en cada intento. Sin secreto persistente nuevo. |

El patrón cuenta además con un precedente de implementación **oficial de Supabase**: `@supabase/server` utiliza clave efímera aleatoria de 32 bytes, dos HMAC-SHA-256 y bucle XOR final. No es una función DB preinstalada ni certifica nuestro port SQL; respalda que la familia no es una receta ad hoc. Se consultó el commit `66b31ecec21bb2e159a1b453ac096dd0c4dbfbbb`. [Implementación oficial fijada](https://github.com/supabase/server/blob/66b31ecec21bb2e159a1b453ac096dd0c4dbfbbb/src/core/utils/timing-safe-equal.ts), [explicación oficial](https://github.com/supabase/server/blob/66b31ecec21bb2e159a1b453ac096dd0c4dbfbbb/docs/security.md).

### 13.4. Construcción seleccionada: fórmula y algoritmo exactos

Notación HMAC-SHA-256(K, M): primero clave, después mensaje. En SQL pgcrypto el orden es **hmac(M, K, 'sha256')**; no invertir argumentos.

- P: payload canónico F1 ya definido, incluido su dominio `CRM-H0F1`.
- K: clave HMAC F1 de 32 bytes, obtenida exclusivamente del key store protegido mediante key_id válido.
- E = HMAC-SHA-256(K, P), exactamente 32 bytes.
- S: MAC recibido, bytes crudos, exactamente 32 bytes. No comparar hex/texto ni aceptar padding, truncamiento o prefijos.
- D: los **15 bytes ASCII exactos** `CRM-H0F1-CMP-v1`, sin NUL ni longitud añadida. Hex `43524d2d483046312d434d502d7631`.
- B = gen_random_bytes(32), generado **dentro del verificador**, nuevo en cada comparación, no aportado por el caller, nunca almacenado en GUC ni devuelto. Distinto e independiente de K.
- L = HMAC-SHA-256(B, D || E).
- R = HMAC-SHA-256(B, D || S).
- L y R tienen 32 bytes; ambos mensajes de blinding tienen exactamente 47 bytes.
- `acc = OR_{i=0..31}(get_byte(L,i) XOR get_byte(R,i))`.
- Aceptar el MAC solo si `acc == 0`; nunca evaluar adicionalmente E = S como comparación temprana.

Algoritmo conceptual preciso — documento, no función instalada en CRM:

```text
si P/K no están disponibles o K no mide 32 bytes: denegar
si S es NULL o no mide 32 bytes: denegar
E := pgcrypto.hmac(P, K, 'sha256')
si E es NULL o no mide 32 bytes: denegar
B := pgcrypto.gen_random_bytes(32)      // una llamada por comparación
si B es NULL o no mide 32 bytes: denegar
L := pgcrypto.hmac(D || E, B, 'sha256')
R := pgcrypto.hmac(D || S, B, 'sha256')
si L/R son NULL o no miden 32 bytes: denegar
acc := 0                              // integer, no booleano AND/OR
para i desde 0 hasta 31 inclusive:
    acc := acc OR (get_byte(L,i) XOR get_byte(R,i))
devolver (acc = 0)
```

Las comprobaciones de NULL son explícitas; no depender de `STRICT` para devolver NULL y que el caller lo confunda con éxito. Cualquier excepción RNG/crypto/parser deniega; ningún fallback a clave fija, random() o comparación cruda. Los fallos de autorización exponen solo el error genérico del protocolo, no E/B/L/R/K ni diferencias de prefijo. La diferencia temporal por longitud pública o por resultado válido/inválido no es extracción del MAC.

En una futura realización PL/pgSQL: `FOR i IN 0..31 LOOP acc := acc | (pg_catalog.get_byte(l,i) # pg_catalog.get_byte(r,i)); END LOOP; RETURN acc = 0;`. Los operandos/acc permanecen entre 0 y 255: sin overflow. Índices fijos válidos; no EXIT, no RETURN ni excepciones por diferencia de byte dentro del bucle; no `bool_and`, condiciones por prefijo ni comparación SQL agregada susceptible de cortocircuito. Tipos/operadores/helpers deben resolverse en schemas confiables con search_path fijo. La función verificadora sería VOLATILE/PARALLEL UNSAFE y no IMMUTABLE, con B calculada dentro, no una constante de plan/sesión/transacción.

**Importante:** el helper de comparación no es una API autorizadora que acepte E del runtime. Un caller podría entregar E=S y obtener true de cualquier comparador correcto. En F1, E se calcula internamente con K sobre P y el resultado solo participa en el verificador privado; runtime no elige E, B, algoritmo ni función hash. Nada de la presente construcción concede lectura del key store ni una función de firma con K.

### 13.5. Justificación criptográfica específica

Se usa el supuesto criptográfico habitual de que HMAC-SHA-256 con clave aleatoria secreta se comporta como una función pseudoaleatoria para adversarios factibles, y que el CSPRNG produce B impredecible. No es una afirmación incondicional sobre SHA-256 ni una prueba del entorno hosted. [Definición y supuestos HMAC, RFC 2104](https://www.rfc-editor.org/rfc/rfc2104), [investigación primaria sobre PRF de HMAC, Bellare](https://citeseerx.ist.psu.edu/document?doi=29e7479e9e4ee1f1174a25a4225dbf1ecb29aca5&repid=rep1&type=pdf).

Argumento en el modelo ideal de función aleatoria, cuya sustitución por HMAC introduce el supuesto PRF:

1. Si E=S, las dos entradas D||E y D||S coinciden y L=R. Se acepta correctamente.
2. Si E≠S, son dos entradas diferentes de longitud fija. Para B fresca, L y R son dos salidas pseudoaleatorias de 256 bits, sin correspondencia entre sus prefijos y el prefijo compartido por E/S.
3. Incluso si se concediera al atacante una medida perfecta del primer byte/bloque distinto de **L/R**, su distribución para E≠S sería la misma tanto si S acierta 0 bytes de E como si acierta 31. El prefijo coincidente de j bytes tiene probabilidad ideal 256^(-j), no una recompensa por acertar el siguiente byte de E.
4. Se reemplaza B en cada intento, también dentro de una misma transacción o tras savepoint/rollback. Repetir S no permite acumular información de un objetivo transformado fijo. La aleatoriedad criptográfica no se rebobina con un rollback SQL.
5. Un simulador que solo conozca si E=S puede reproducir la comparación de salidas aleatorias en los casos negativos: el transcript de esa comparación no entrega el prefijo original. El atacante conserva el oráculo booleano de validez propio de cualquier verificador, no un aprendizaje incremental del MAC.
6. Una colisión accidental L=R con E≠S tiene probabilidad ideal 2^-256 por intento, y a lo sumo q/2^256 por unión de q intentos, más ventajas contra PRF/RNG. No se promete que todo MAC alterado sea rechazado con certeza matemática absoluta; se ofrece la garantía criptográfica de probabilidad despreciable, y los ensayos de mutaciones se rechazan todos.

**¿Usar bytea = sobre L/R trasladaría el problema?** Bajo estas condiciones de B fresca secreta, no trasladaría un prefijo útil de E: mediría una relación pseudoaleatoria renovada. Aun así, la realización elegida **no lo usa**: procesa los 32 bytes con XOR/OR para retirar también el early exit explícito como defensa adicional.

El argumento se refiere a fuga de la **comparación**. No transforma una implementación de HMAC/RNG que filtra claves, un administrador hostil o un debugger con acceso a memoria en componentes seguros. La longitud fija de B y de D||E/D||S y el código de flujo revisado eliminan búsquedas de prefijo en la preparación. No se reclama certificación microarquitectónica total de PostgreSQL/OpenSSL/CPU.

### 13.6. Gestión de B, permisos y rotación

B es un secreto efímero interno durante la llamada, no una credencial persistente: no se provisiona, distribuye, versiona ni almacena; no añade key_id ni variable de entorno. Su «rotación» ocurre en cada comparación. No se reutiliza por transacción, backend, clave K o pool. Si la aleatoriedad falla, denegación. El caller no puede influir con `setseed()` porque no se utiliza el PRNG SQL de `random()`.

La rotación de K/key_id mantiene el diseño F1 existente; B es independiente tanto para K1 como K2. El comparador no cambia semántica de expiración/revocación/replay. No precisa estado de sesión ni afecta pooling transaccional.

La custodia previa sigue siendo obligatoria: verificador privado NOLOGIN, EXECUTE no público, clave accesible únicamente mediante su autoridad, SQL estático, primitivas cualificadas. E/B/L/R/K no se retornan ni forman mensajes, tracing, GUC, tablas o argumentos de una llamada runtime. La lectura del código de función revela algoritmo/dominio, no estos valores locales. No prometer borrado seguro físico de variables PL/pgSQL: el acceso a memoria/backup/administrador pertenece a las exclusiones explícitas de M2.

### 13.7. Experimento local autorizado: método y resultados

Entorno: mismo Mac Apple M1/arm64, Node 24.21.0, PostgreSQL 17.11 Postgres.app, pgcrypto 1.3. Clúster independiente `crm-prf01-comparator-*`, solo socket Unix, TCP deshabilitado, datos sintéticos. El rol bootstrap creó un autor **no SUPERUSER, no CREATEROLE, no CREATEDB, no BYPASSRLS**, al que concedió CREATE en la base de laboratorio. Ese autor creó schema, instaló pgcrypto como extensión trusted y creó exclusivamente funciones de laboratorio SECURITY INVOKER. Esto acredita que el comparador/pgcrypto no requieren superuser para instalarse/usarse en ese PostgreSQL; no acredita los grants de un hosted todavía no ensayado.

El laboratorio comparó tres realizaciones: igualdad cruda con guardas de longitud; XOR/OR fijo sobre los originales; double-HMAC fresco + XOR/OR. Ninguna consultaba key store, verificaba capacidades F1 o accedía a tablas CRM. E era un valor sintético conocido de 32 bytes; no se creó una clave F1 ni un firmador. El script viajó por stdin y no se guardó en el repositorio.

**Funcional:** 1.856 aserciones PASS, 0 FAIL, entre comparador fijo y cegado con `jit=off/on`: iguales, 256 mutaciones de un bit cubriendo todos los bytes, 200 MAC aleatorios por modo, longitudes 0/31/33, NULL y ambos valores inválidos. Esto no demuestra que JIT compilara todas las expresiones ni constituye certificación de tiempo constante.

**Benchmark:** 3 métodos × 10 casos × 120 grupos × 100 comparaciones = **360.000 comparaciones medidas**, más 15.000 de calentamiento. Orden de casos/métodos mezclado en cada ronda. Se midió tiempo de reloj **dentro de PostgreSQL por lote**, no latencia HTTP/TCP ni F1 completo: no incluye cálculo E con K/payload, key lookup, RLS o COMMIT. Las estadísticas siguientes son microsegundos por comparación, calculados sobre los promedios de 100 llamadas de cada grupo; P95 no es P95 de llamadas individuales.

| Caso | Crudo media / mediana / P95 | Fijo media / mediana / P95 | Double-HMAC+fijo media / mediana / P95 |
|---|---|---|---|
| Iguales | 0.497 / 0.480 / 0.520 | 2.383 / 2.310 / 2.580 | 4.570 / 4.420 / 5.440 |
| Primer byte distinto, prefijo 0 | 0.491 / 0.480 / 0.510 | 2.371 / 2.320 / 2.460 | 4.513 / 4.440 / 4.820 |
| Prefijo 1 | 0.495 / 0.490 / 0.520 | 2.371 / 2.320 / 2.510 | 4.552 / 4.440 / 5.060 |
| Prefijo 8 | 0.499 / 0.490 / 0.570 | 2.412 / 2.320 / 2.660 | 4.520 / 4.440 / 4.730 |
| Prefijo 16 | 0.491 / 0.490 / 0.530 | 2.361 / 2.320 / 2.490 | 4.573 / 4.450 / 5.090 |
| Prefijo 24 | 0.497 / 0.490 / 0.540 | 2.391 / 2.330 / 2.470 | 4.595 / 4.440 / 5.040 |
| Prefijo 31 | 0.489 / 0.490 / 0.510 | 2.358 / 2.320 / 2.510 | 4.591 / 4.440 / 5.190 |
| MAC aleatorio | 0.498 / 0.490 / 0.530 | 2.439 / 2.350 / 2.560 | 4.589 / 4.450 / 5.130 |
| Longitud 31 | 0.480 / 0.460 / 0.520 | 0.539 / 0.510 / 0.560 | 0.521 / 0.520 / 0.540 |
| Longitud 33 | 0.470 / 0.460 / 0.490 | 0.523 / 0.510 / 0.570 | 0.548 / 0.520 / 0.570 |

No aparece una progresión clara con la longitud del prefijo en estas distribuciones, **tampoco en la comparación cruda**. No se convierte esto en prueba de igualdad constante ni en descarte de un ataque mejor medido en otra CPU/libc. El fundamento de aceptación es el análisis de fuente + argumento de blinding, no «no veo señal». Las diferencias grandes por longitud son deliberadas y públicas. El coste medido del elegido es mayor y deberá medirse dentro de RLS/F1 antes de optimizar; no se permite cachear B para reducirlo.

Limpieza completada: conexiones cerradas, pg_ctl stop, directorio temporal completo eliminado (funciones/schema/extensión de ensayo, roles, datos y logs). Salida `COMPARATOR_CLUSTER_STOPPED_AND_REMOVED`. No código de laboratorio, secreto ni implementación quedan guardados. No se ejecutó la suite CRM ni se modificaron sus tests.

### 13.8. Criterios de cierre y límites

| Criterio autorizado | Evidencia/justificación |
|---|---|
| 1. No aprendizaje progresivo del HMAC | PRF con B privada fresca elimina distribución dependiente del prefijo original; bucle final fijo |
| 2. Longitud 32 | Guardas explícitas para S/E/B/L/R; negativos locales |
| 3. Todos los bytes relevantes | HMAC procesa ambos mensajes completos; FOR 0…31 inspecciona todos los bytes de L/R |
| 4. MAC modificado falla | Todas las mutaciones ensayadas denegadas; probabilidad criptográfica residual de colisión declarada |
| 5. Ningún firmador runtime | E/K permanecen internos al verificador F1; no API de firma ni expected elegido por caller; precondición de integración, no test del laboratorio |
| 6. Key store inaccesible | El comparador no cambia grants ni expone claves; se conserva la frontera F1, a verificar cuando se implemente |
| 7. Sin extensión no disponible | Solo PL/pgSQL, operaciones nativas y pgcrypto; no pgsodium ni extensión propia |
| 8. Sin superuser | Creación/uso del experimento por autor sin superuser; bootstrap separado |
| 9. Supabase conceptual | pgcrypto y funciones documentados; sin estado por sesión, credencial extra ni capacidad privilegiada nueva |
| 10. Reproducible posteriormente | Fórmula/algoritmo, matriz de mutaciones, longitudes, JIT y método de medición explicitados; se convertirán en tests mantenibles solo bajo autorización |

Garantía afirmada: comparador concreto defendible bajo M2 frente al oráculo de prefijo, basado en HMAC-SHA-256/CSPRNG y en mantener privados los valores internos; no exige «CPU constant-time perfecto». Garantías NO afirmadas: seguridad incondicional; ausencia de todo canal lateral; zeroization de memoria; infalsificabilidad ante robo de K/proceso/admin; performance hosted; seguridad de parsing/keys/grants de una implementación F1 inexistente; cierre del defecto material.

Supabase documenta pgcrypto y su provisión de funciones, pero la versión/schema/EXECUTE efectivos y OpenSSL/configuración se comprobarán en el entorno futuro autorizado. El skill Supabase motivó esa comprobación de vigencia: changelog.md falló y se consultaron el índice público y docs relevantes; no se configuró ningún recurso. [Extensiones](https://supabase.com/docs/guides/database/extensions), [funciones](https://supabase.com/docs/guides/database/functions), [pgcrypto PostgreSQL](https://www.postgresql.org/docs/17/pgcrypto.html).

No es necesario abandonar HMAC por PR-F-01. Firma asimétrica o una primitiva de extensión no eliminan por sí solas obligaciones de implementación y portabilidad. Capacidad opaca/C2 trasladarían custodia/estado/autoridad y solo merecerían evaluación si cambiaran los supuestos o se rechazara este mecanismo; no se rediseñan aquí.

### 13.9. Impacto en F1, decisión y preservación

El único hueco VERIFY_MAC de §12 queda concretado por §13.4. No cambia payload wire, K/key_id, transacción, pooling, C01/C03, RLS ni política de consumo. Añade dentro del verificador dos HMAC, una extracción CSPRNG y 32 iteraciones por comprobación. B no es un secreto operacional nuevo.

**F1 puede pasar a decisión humana respecto del bloqueo PR-F-01 ahora cerrado.** Esto no revalida automáticamente toda F1 ni aprueba sus decisiones: quedan la selección humana de F1, custodia/rotación, plazo y límites, consumo técnico C03/limpieza y aceptación de pendientes hosted ya documentados. Procede preparar una propuesta D037 en un siguiente bloque **solo con autorización humana**, no crearla ni aprobarla ahora. Después serían necesarias autorización de implementación y verificación adversarial H0-008 completas.

PLAN-AUTH-006 sigue **PENDING / NO EJECUTADA globalmente**. H0-008 **FAILED/BLOCKED**; H0-008-F01 **OPEN hasta aprobación/implementación/verificación**; H0-009 y H0-005/006 **NOT STARTED**.

Único archivo ampliado: este diagnóstico. Huella inicial de sus 510 líneas anteriores: `99f704a6255468b8340581da4b10a3fec6d164e61c0da959d247483c7773a782`; se preservan como prefijo íntegro y los cinco hashes de §11. El árbol mantiene los mismos seis paths, sin archivos nuevos. HEAD/origin/main base: `ef452459f477ac3c78b08595312e869770259d44`, rama main y remoto IAndresB/crm-huescaventura-os. Sin implementación CRM/F1, D037, commit, push ni recursos remotos.

## 14. Propuesta D037 — revisión humana pendiente

Fecha: 2026-09-16. Se prepara [D037](../../docs/DECISIONS.md#d037--propuesta-f1-capacidad-autenticada-por-transacción-para-corregir-h0-008-f01) con **Status: PROPOSED**, por autorización exclusiva de preparación documental. No es aprobación. Las referencias anteriores a «no D037» y PR-F-01 OPEN se conservan como cronología de sus turnos respectivos.

Estado vigente: **PR-F-01 CLOSED técnicamente; F1 READY FOR HUMAN DECISION / NOT APPROVED / NOT IMPLEMENTED; H0-008-F01 OPEN; H0-008 FAILED/BLOCKED; PLAN-AUTH-006 PENDING / NO EJECUTADA globalmente; H0-009/010 y H0-005/006 NOT STARTED.** Este diagnóstico continúa siendo no normativo. Preparar o aprobar la selección no autoriza implementar ni cerrar la verificación.

Refutación documental de la propuesta (no prueba de implementación):

| Intento o confusión | Restricción explícita en D037 | Resultado documental |
|---|---|---|
| GUC autodeclarado concede autoridad | Condiciones 1/3/11: autenticación obligatoria, no flags/claims planos | No permitido |
| Runtime firma o lee clave | 2/5/6: sin key store/firmador; E y B internos | No permitido |
| Runtime asume verifier/executor/migration | 2: sin membresías privilegiadas transitivas ni capacidad de asumir roles | No permitido |
| Runtime hace SELECT/DML directo Core | 2/8/11: solo interfaz estrecha, sin grants directos | No permitido |
| Cambiar scope conservando MAC | 3/6: todos los campos autenticados y comparación seleccionada | No permitido |
| Reutilizar en otra transacción/conexión | 4/10: binding real comprobado en DB | No permitido |
| Cambiar input ejecutado | 3/9/10: fingerprint recalculado y manifest exacto | No permitido |
| Helper privilegiado fabrica autoridad | 2/6/11: sin emisión libre, E/B no elegibles, helpers y rutas indirectas revisados | No permitido |
| search_path/temporales/overloads hostiles | 11: resolución fija/cualificada y sin ownership/CREATE runtime | No permitido |
| Consumo técnico se interpreta como idempotencia durable | 9/10: distinción expresa; incertidumbre no permite retry ciego | No permitido |
| Aprobación se interpreta como verificación hosted | 12/Impact: pendientes conservados, autorización separada | No permitido |
| Aprobación inicia implementación/tareas/commit/push | 12/Impact: prohibición expresa y autorización posterior separada | No permitido |

Resultado: propuesta **lista para revisión APPROVE o REJECT / REQUEST CHANGES**, sin hueco permisivo identificado en esta revisión textual. No equivale a acreditar ausencia de esos fallos en código. D037 explicita los límites iniciales ya propuestos (30 segundos, 64 KiB por payload/input y 16 KiB por string); no los presenta como reglas de negocio previas ni los oculta entre detalles de implementación.

Solo se amplían docs/DECISIONS.md y este diagnóstico. Los cinco archivos protegidos de §11 se preservan byte-for-byte; D001–D036 y las 677 líneas anteriores del diagnóstico permanecen intactas. No nueva investigación, SQL, código, migraciones, tests, recursos, secretos, commit ni push.

## 15. Aprobación formal D037 — diseño aprobado, no implementado

Fecha: 2026-09-16. Andrés aprueba formalmente [D037](../../docs/DECISIONS.md#d037--f1-capacidad-autenticada-por-transacción-para-corregir-h0-008-f01) tal como fue propuesta. F1 queda **APPROVED AS DESIGN / NOT IMPLEMENTED**. PR-F-01 permanece **CLOSED técnicamente**.

La aprobación documental no altera el resultado de la verificación: **H0-008-F01 OPEN**, **TSK-H0-008 FAILED/BLOCKED** y **PLAN-AUTH-006 PENDING / NO EJECUTADA globalmente**. TSK-H0-007 conserva su ejecución histórica COMPLETED, sin que ello acredite el aislamiento refutado. TSK-H0-005/006/009/010 permanecen **NOT STARTED**.

El siguiente paso requiere una nueva autorización humana delimitada para implementar la corrección H0-008-F01 conforme a D037 y, después, repetir íntegramente H0-008. Esta aprobación no implementa F1, no crea claves/secretos ni recursos, y no autoriza Auth, UI, hosted, Staging o Production.
