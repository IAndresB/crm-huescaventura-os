# TSK-H6-008 — Integración Auth y frontera HTTP local

Candidato local sin commit sobre `971c55d5ce5770c71284d106d3c0deecca9514b5`. Fecha local 2026-10-22. El director autoriza expresamente Auth/servidor locales, identidades sintéticas y correcciones ordinarias; quedan reservados normativa/contratos, autoridades/datos reales, Hosted/Production, efectos externos, publicación y Drive.

## Diseño aplicado

Se conservan los contratos `AuthVerificationPort`, `AuthGlobalRevocationPort`, la marca opaca `VerifiedAuthEvidence`, clasificación de interacción, adaptadores Core y autoridades F1/F2. Se añaden tres módulos: proveedor Supabase Auth, coordinador de sesiones en servidor y frontera HTTP componible. No se modifica esquema/migraciones Core ni se introduce framework o SDK nuevo. Los handlers de ensayo llaman las dieciséis superficies ya documentadas a través de sus adaptadores reales; no hay UI, despliegue ni conector de negocio nuevo.

`SupabaseAuthProvider` verifica online el JWT exacto mediante `/user` antes de leer sus claims. El endpoint/issuer están fijados por servidor, sin redirects; subject, session_id, issuer, audience, role, exp, password, TOTP y factor verificado se contrastan. Metadata editable no concede autoridad. Cada alta de sesión Core exige un password grant nuevo y challenge/verify TOTP auténticos; no existe endpoint que convierta JWT aportado por el cliente en sesión Core nueva.

El servidor conserva un handle aleatorio de 256 bits vinculado a subject + session_id de Auth + session_id Core. El cliente no elige esos valores. Access/refresh tokens solo permanecen en memoria del proceso durante su sesión; password y OTP no se conservan tras la petición. No se almacenan JWT, factores o secretos en Core ni evidencias. Refresh se serializa por sesión y conserva la vinculación; no crea epochs ni toca actividad. Un reinicio invalida los handles y exige identificación completa, manteniendo la historia Core. Esta opción prioriza cierre seguro; no acredita continuidad de sesión entre procesos, despliegue multinodo ni una UI de almacenamiento de credenciales.

La frontera recibe operaciones concretas registradas por composición confiable; clasifica lectura/acción en servidor y conserva F1/F2/admisión en la misma transacción de los adaptadores. Exige origen exacto, POST, JSON y entrada acotada por configuración. El ensayo fija 8192 bytes como límite instrumental, no como requisito contractual del CRM. HTTP sin TLS solo se habilita expresamente para 127.0.0.1; no se acredita transporte Hosted/Production. Los errores no devuelven detalles privados, respuestas no se cachean y `human=true`/rol/sesión cliente no conceden autoridad.

La revocación global reutiliza el coordinador H0-013: primero cierre durable Core/generación, después Auth y registro del resultado. Logout de una sesión también cierra Core antes del proveedor. Una respuesta refresh tardía no reabre un binding cerrado. La descarga de objetos conserva el segundo control Core después de leer bytes de Storage.

## Proveedor y aislamiento

Supabase Auth oficial `v2.197.0`, fuente `4eee58f296d9698a1c2c0ae14d7a0b379c7622d3`; archivo darwin-arm64 SHA-256 `3fb7998e7061e2c14f3f9555b1d94d447358c965395728e0d81eac82e0e5868b`, coincidente con digest de release. Binario SHA-256 `54a5afe7997bd16ab5244ab12c02905048b270a8f76eebf95739a6d364ffe01f`. [Preparación reproducible](../../scripts/prepare-h6-auth-tools.mjs) verifica ambos; no usa proyecto ni credencial Supabase real.

Auth usa base desechable propia, login propietario sin superuser/BYPASSRLS y sin acceso Core. Su esquema se instala con las migraciones oficiales incorporadas en el binario. El rol `postgres` requerido por esas migraciones es NOLOGIN e inerte en el fixture. Registro público desactivado; SMS/OAuth/hooks externos sin activar; correo dirigido exclusivamente al interceptor local. Entorno del proceso construido explícitamente, sin heredar secretos. Secretos aleatorios solo para el ensayo. Auth y Storage comparten únicamente una clave sintética de ensayo para que el JWT auténtico atraviese la autenticación Storage antes de su rechazo por permisos; F1/F2 siguen separados.

Un proxy loopback transmite las peticiones al proveedor auténtico y permite únicamente provocar HTTP503 en logout o retener una respuesta refresh ya emitida. No fabrica identidad, password, factores, tokens ni AAL. Las barreras de PostgreSQL observan waits Lock y PID reales; el retardo Storage ocurre después de obtener realmente los bytes.

## Expected y resultados

[Expected complementario](expected-TSK-H6-008-auth.json), SHA-256 `be0a6c39ebe4ad12808352d93fd9587a59a9b6ce91353bbcb5c8c93d0e65103c`, congelado antes de implementar y ejecutar. No sustituye ni altera los expected históricos. Catorce grupos A01–A14 cubren el faltante S10 y refuerzan S01–S09.

Ejecución `integrated-2026-10-21T23-04-41-380Z`: **17 PASS / 0 FAIL / 0 skipped**, 19,59 segundos. Incluye positivos de las dieciséis superficies; rechazos transversales por 7 días, 30 días, disabled, recovery, enrollment, logout; refresh real sin actividad ni nuevo epoch; origen/entrada; identidad ajena; registro público; password/TOTP inválidos; claims manipulados; logout/global y nueva identificación; Storage real; solapamiento en ambos órdenes; revocación parcial; refresh tardío; tres sesiones y cambio real de contraseña. Consultar [fuente](../../tests/integration/postgres-h6-008-auth.test.ts) y [registro](../../tests/fixtures/h6-auth-integration/integrated-2026-10-21T23-04-41-380Z/run.json).

**Semántica efectiva de logout:** un JWT ya emitido conserva firma correcta y exp futura. La versión fijada de Auth consulta `auth.sessions` en `/user`, que rechaza la sesión eliminada; el refresh anterior también falla. Core mantiene además su propia revocación/generación, y rechaza una prueba previamente verificada incluso si falla el logout real. No se afirma revocación criptográfica inmediata de JWT en cualquier consumidor o URL.

## Fallos históricos preservados

1. Preparación Auth sin migraciones oficiales: alta administrativa HTTP500; después se confirmó `identities` ausente. Configuración corregida con `auth migrate`, esquema `auth` y search_path propios.
2. Preflight de migraciones oficiales detectó esquema `auth` ausente, y después el rol nominal `postgres` requerido. Se añadieron únicamente a la base/cluster desechables con privilegio mínimo; no se editaron migraciones del proveedor ni Core.
3. Primer recorrido funcional 13/14: el test retrocedía actividad seis días sin retroceder identified_at y PostgreSQL rechazó correctamente el fixture. Instrumento corregido conservando la restricción.
4. Ampliación 16/17: el test intentaba actualizar la contraseña a su valor actual; el proveedor la rechazó 422. Se usa contraseña sintética nueva y se verifica AAL1 denegado/AAL2 admitido.
5. Errores de TypeScript iniciales en tipos de headers/entorno corregidos. Los logs de ejecuciones, snapshots de fuentes y errores se conservan; expected no cambia.

## Alcance y puertas

Este documento registra un candidato técnico, pendiente de revisión independiente final y matriz de aceptación consolidada. No declara COMPLETED a partir del resultado parcial o instrumental. Los documentos históricos H6-008 conservan su anterior S10 pendiente como hechos de su fecha, sin reescribirlos. La nueva evidencia deberá reconciliar explícitamente ese faltante.

H6-015 **NOT STARTED**, solo preparación documental; ningún recurso o restauración. ARCH-PENDING-002 y DM-PENDING-005 **OPEN**. PLAN-PENDING-003 conserva los ensayos reales, dispositivos físicos, entrega/recuperación y preparación Production no incluidos aquí. No se heredan esos resultados por un PASS local.

Fuentes técnicas consultadas: [sesiones](https://supabase.com/docs/guides/auth/sessions), [MFA](https://supabase.com/docs/guides/auth/auth-mfa), [release fijada](https://github.com/supabase/auth/releases/tag/v2.197.0), `internal/api/auth.go`, `logout.go`, `mfa.go` y OpenAPI de esa fuente. Esas referencias explican al proveedor y no modifican normativa aprobada del proyecto.
