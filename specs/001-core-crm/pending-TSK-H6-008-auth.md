# H6-008 — Cobertura de Auth y frontera de ingreso pendiente

2026-10-22. Investigación y diseño local; no configuración ni uso operativo de Auth real.

## Qué falta exactamente

`src/application/verified-auth.ts` define un `AuthVerificationPort`; `src/server/human-postgres-composition.ts:13` declara que el adaptador Supabase Auth real aún debe implementarse. La composición recibe además `AuthGlobalRevocationPort`, hoy sustituido por un doble en estas pruebas. `src/app/` solo contiene la ruta de salud: no hay una frontera HTTP de uso humano que permita acreditar origen, autenticación de peticiones y clasificación de interacción de extremo a extremo.

La matriz nueva sí usa autorización, transacciones, roles, RLS, reloj y revocación **Core reales**, además de Storage oficial real. El port de identidad es sintético. El JWT de la contraprueba Storage está firmado localmente para un sujeto sintético; no procede de un login/MFA Supabase real. No acredita login, renovación, cierre o MFA del proveedor.

Se ha comprobado que `docker`, `go`, `supabase` y `gotrue` no están disponibles en PATH. Esto identifica una carencia del entorno actual, no una imposibilidad técnica. No se ha configurado una plataforma Auth alternativa ni se ha contactado un proyecto Hosted para suplirla.

## Contraste con fuentes aprobadas y documentación oficial

D038.1–20 exige autoridad Auth verificada, F2 separada, binding por transacción y comprobación vigente de actor/sesión/epoch. D038.11–13 exige 30 días absolutos y 7 de **actividad humana** por sesión, antes de actualizar actividad; un refresh no cuenta. D038.15 permite completar una transacción autorizada antes de la revocación, pero deniega peticiones posteriores. D038.17 advierte que Auth/aal2 no equivalen a autorización Core. No se cambia ninguna de estas decisiones.

La documentación oficial consultada el 2026-10-22 distingue el `session_id` del proveedor y sus límites de sesión. Su inactividad se relaciona con renovación de sesión; por ello no sustituye la medición humana Core aprobada. MFA requiere enrolamiento y desafío/verificación; el nivel de garantía del token debe proceder del proveedor, no de JSON del cliente. Fuentes: [sesiones Supabase](https://supabase.com/docs/guides/auth/sessions), [MFA Supabase](https://supabase.com/docs/guides/auth/auth-mfa). Son referencias técnicas, no prueba de configuración realizada ni autorización para usar una cuenta real.

## Próximo bloque propuesto

1. Delimitar una instancia **Auth real del software**, aislada y con identidades/factores exclusivamente sintéticos, o identificar el entorno de ensayo expresamente autorizado. No usar cuentas, factores, credenciales ni autoridades reales. Cualquier acceso Hosted, propietario de plataforma, correo/SMS externo o recuperación real conserva la autorización especial exigida por el director.
2. Preparar el adaptador real de verificación y revocación, manteniendo D038 y los contratos actuales. Precisar y verificar la vinculación entre sesión Auth y sesión/epoch Core; ni un `sessionId` aportado por el cliente ni `aal2` por sí solos bastan. No persistir JWT o secretos sin necesidad técnica aprobada; cualquier cambio persistente requiere migración V-MIG y actualización de fixture anterior.
3. Componer una frontera de servidor comprobable para las operaciones Core autorizadas, con origen y clasificación humana verificados. La prueba del WeakSet interno no acredita esta frontera HTTP. No se necesita desarrollar UI para comprobar contratos de servidor.
4. Congelar casos independientes de login contraseña+TOTP, falta/falsificación de factor, refresh/polling, límites/dispositivos, revocación global parcial/completa, JWT todavía vigente, descarga tardía, recuperación incompleta y alta pública prohibida. Ejecutarlos contra el proveedor real de ensayo y repetir la matriz Core sin sustituirla por mocks.
5. Conciliar la cobertura por las 23 asignaciones de Tasks §6 y por cada adaptador/superficie expuesta. La matriz actual de 16 superficies representa lecturas/mutaciones/replay/proyecciones/objetos; no prueba por mera extrapolación cada método público de todos los adaptadores.

Este documento deja preparada la continuación técnica. No declara completado PLAN-AUTH-002/003/006, no acredita dispositivos personales, copia TOTP, recuperación de propietario, acceso real o Production. H6-009/010/011 conservan su propio alcance; no se inventan como dependencias directas de H6-015.

## Resultado de cierre

**H6-008 IN PROGRESS / PARTIAL, no COMPLETED.** El caso S10 queda explícitamente sin ejecutar. H6-015 no puede comenzar ni cerrar mientras esta dependencia no satisfaga íntegramente su salida; su autorización actual sigue siendo exclusivamente documental.
