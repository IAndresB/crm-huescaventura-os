# TSK-H0-018 — salida técnica aislada de H0

Fecha: 2026-09-29. Base tras `git fetch origin`: `HEAD = origin/main = 9d9a616e119b671f1b7a2f0abaf4b6eabb59dc7d`, rama `main`, árbol limpio. Last Approved Commit: `3e3f47a1692290412a03cf14087c2c470b8cab90` (D039). El commit de este cierre se obtiene con `git log -1 --format=%H -- specs/001-core-crm/evidence-TSK-H0-018.md` tras publicarlo; no sustituye al Last Approved Commit. Entorno: Work Local, mismo equipo, PostgreSQL local efímero y datos/identidades sintéticos. No se ha conectado a Supabase ni Vercel para H0-018.

## Criterio y matriz de cierre

Plan §9 y Tasks §§2.2–2.3/4.1 permiten la salida **técnica aislada** al concluir las fichas locales y probar denegación por defecto, rol ordinario limitado, unidad con historia y rollback, y ausencia de fuga de identidad por pool. PLAN-PENDING-003 y PLAN-AUTH-001–006 conservan sus pruebas reales; no se acreditan por dobles. Las obligaciones integradas de H6 siguen abiertas. En la tabla, `sí` significa acreditación en el alcance indicado, no aprobación de la fuente global. El commit citado es la referencia recuperable de la evidencia; cuando procede se añade el commit productivo probado.

| Tarea | Estado | Commit(s) relevante(s) | Evidencia | Alcance acreditado | Entorno y tests/resultados | Limitación / pendiente futuro | PLAN-AUTH | Local | Hosted | H6 |
|---|---|---|---|---|---|---|---|---|---|---|
| H0-001 | COMPLETED preparación | `6b0b8ba` | [001](evidence-TSK-H0-001.md) | Compatibilidad, recursos y coste calculado | Documental/local; inventario PASS | Capacidad/configuración/coste aceptado no probados | 001 parcial | Sí, preparación | No | Sí, H6-010/012 |
| H0-002 | COMPLETED preparación | `d51fd20` | [002](evidence-TSK-H0-002.md) | Paquetes, C01–C06, T01–T11, migraciones y protocolo delimitados | Documental/local; matriz revisada | No implementa ni prueba contratos | 001/006 preparación | Sí, preparación | No | Sí, integración |
| H0-003 | COMPLETED implementación | `eff54d7` | [003](evidence-TSK-H0-003.md) | Servidor modular, C01–C06, G1–G6, E1–E8 | Local; typecheck, boundaries, 13 tests y build PASS | Puertos/dobles no acreditan PostgreSQL/Auth | 001 parcial | Sí | No | Sí, H6-017 |
| H0-004 | COMPLETED verificación | `d328ae7` | [004](evidence-TSK-H0-004.md) | Contratos y denegaciones formalmente contrastados | Local; 27/27 tests, audit/typecheck/build PASS | Sin persistencia o proveedor real | 001 parcial | Sí | No | Sí, H6-017 |
| H0-005 | COMPLETED implementación | `600ae3b` | [005](evidence-TSK-H0-005.md) | CRM Actor, F2, sesión/epoch/generation, límites 7/30 | PostgreSQL local; focales PASS | F01/F02 posteriores cerrados por H0-006; Auth/M03 hosted pendientes | 002/006 parcial | Sí tras 006 | No | Sí, H6-008–011 |
| H0-006 | COMPLETED verificación | `48cc932` | [006](evidence-TSK-H0-006.md) | R01–R24, F01/F02 CLOSED localmente | PostgreSQL local; 151/151 y 27/27 PASS al cierre | Dos ejecuciones FAILED conservadas; Auth/dispositivos reales pendientes | 002/006 parcial | Sí | No | Sí, H6-008–011 |
| H0-007 | COMPLETED implementación histórica | `ef45245`, `c208b9f` | [007](evidence-TSK-H0-007.md) | H0-M01 y corrección forward F1 | PostgreSQL local; V-DAT/V-MIG, focales PASS | F01 original de H0-008 cerrada tras reverificación; M01 sola no es segura | 006 parcial | Sí tras 008 | M01/F1 sí | Sí, integración |
| H0-008 | COMPLETED reverificación | `841064d` | [008](evidence-TSK-H0-008.md) | F1, ownership/ACL/RLS, SQL directo, pool, C01/C03 | PostgreSQL local; 84 resultados PASS | FAILED original por GUC autodeclarado preservado; Auth pendiente | 006 parcial | Sí | M01/F1 sí | Sí, integración |
| H0-009 | COMPLETED implementación | `f628a39` | [009](evidence-TSK-H0-009.md) | H0-M02, historia, resultado e intención atómicos | PostgreSQL local; focales PASS | Efecto externo no ejecutado | 006 parcial | Sí tras 010 | M02 sí | Sí, integración |
| H0-010 | COMPLETED verificación | `2945a9c` | [010](evidence-TSK-H0-010.md) | Historia, replay, concurrencia y rollback | PostgreSQL local; 21/21 independientes, 120/120 regresión PASS | Hosted acreditado después en evidencia separada; sin proveedor real | 006 parcial | Sí | M02 sí | Sí, integración |
| H0-011 | COMPLETED implementación histórica | `efe217b`, `08fc36b` | [011](evidence-TSK-H0-011.md) | H0-M04, aprobación y reserva exacta | PostgreSQL local; 12/12 focales iniciales PASS | F01–F05 detectados después; cierre formal en H0-012; sin envío | 002/006 parcial | Sí tras 012 | No | Sí, H6/proveedor |
| H0-012 | COMPLETED verificación | `08fc36b`, `45fc635` | [012](evidence-TSK-H0-012.md) | R01–R25, F01–F05 CLOSED, D039/TTE | PostgreSQL local; 25/25 filas, 32/32 tests PASS | Cinco fallos históricos conservados; M03/M04 hosted y efecto externo pendientes | 002/006 parcial | Sí | No | Sí, H6/proveedor |
| H0-013 | COMPLETED implementación | `ddfaaf8`, `fab39eb` | [013](evidence-TSK-H0-013.md) | H0-M05, cierre Core global y coordinación Auth | PostgreSQL local + doble Auth; 6/6 focales PASS | Revocación Auth real/JWT/dispositivos no acreditada | 003/006 parcial | Sí tras 014 | No | Sí, H6-008 |
| H0-014 | COMPLETED verificación | `fab39eb` | [014](evidence-TSK-H0-014.md) | R01–R23, fallo parcial/concurrencia | PostgreSQL local + doble Auth; 23/23, 8/8 PASS | No Supabase Auth real ni M05 hosted | 003/006 parcial | Sí | No | Sí, H6-008 |
| H0-015 | COMPLETED preparación | `52b1c69` | [015](evidence-TSK-H0-015.md) | Procedimientos y límites de recuperación | Documental/local; matriz preparada | Sin email, papel, dispositivo o propietario real | 004/005/006 preparación | Sí, preparación | No | Sí, H6-009–011 |
| H0-016 | COMPLETED implementación | `8c29421`, `9d9a616` | [016](evidence-TSK-H0-016.md) | H0-M06, recuperación Core cerrada hasta prueba completa | PostgreSQL local + dobles; 5/5 focales, 259/259 regresión PASS | Tres FAIL de arnés conservados; recuperación real/hosted pendiente | 005/006 parcial | Sí tras 017 | No | Sí, H6-008/010/011 |
| H0-017 | COMPLETED verificación | `f4247dd` | [017](evidence-TSK-H0-017.md) | R01–R12 independientes, ACL, race y límites | PostgreSQL local + dobles; 6/6 PASS | R03 papel y R12 restauración real quedan expresamente en H6 | 005/006 parcial | Sí | No | Sí, H6-009–011/014 |
| H0-018 | COMPLETED cierre documental | commit de este archivo | Este informe | Salida técnica aislada de Plan §9 | Regresión acumulada y revisión de evidencias/migraciones, abajo | Ninguna prueba real/global adicional se infiere | 001–006 siguen PENDING globalmente | Sí, hito aislado | Solo M01/F1/M02 previos | Sí, H6 integrado |

## Resultado normativo observado

- Base modular B01/B08/B10 y C01–C06, G1–G6, E1–E8: H0-003/004 y regresión unitaria. C03 no se considera transaccional hasta H0-009/010.
- Actor/sesión/epoch, F1 y F2 separados, 7 días inactivos y 30 absolutos: H0-005/006, incluidos refresh/polling pasivos, dispositivos sintéticos independientes y denegación por sesión vencida. F1 deniega GUC falsificado y acceso SQL directo: H0-007/008. M1/M2, keys, binding por transacción y pool se verificaron localmente; M01/F1/M02 disponen además de pruebas hosted específicas.
- Historia/idempotencia, replay, resultado durable, intención, rollback, fallos post-COMMIT y concurrencia: H0-009/010. Human Approval, reserva exacta y separación decisión/ejecución: H0-011/012; F01–F05 y D039/TTE cerrados **localmente**, con comprobación final autoritativa antes de iniciar COMMIT, sin imponer deadline físico al durable.
- Revocación individual y global, generación de acceso monotónica, fallos Auth parciales, enrolamiento/recuperación incompletos y Core cerrado: H0-006/013/014/016/017. El puerto Auth y email/factor/propietario son dobles; no se reclama invalidación real de JWT, dispositivo o entrega.
- Ownership separado, ACL mínimas, RLS/FORCE en tablas Core pertinentes, ausencia de privilegio global runtime, migrador separado, funciones estrechas, atomicidad y pool sin identidad residual: evidencias H0-008/010/012/014/017 y regresión PostgreSQL. Las tablas privadas de claves/consumo F1 tienen protección por grants, sin afirmar RLS universal. La revisión independiente conserva las ejecuciones FAILED previas y sus fixes forward.
- Recuperación local de **acceso**: H0-015–017; recuperación real de factor/email/propietario y restauración de **datos/objetos** siguen en H6 y ARCH-PENDING-002. No se confunden ambos procedimientos.

**Veredicto:** H0 satisface la salida aprobada del Plan §9 exclusivamente en alcance técnico/local/aislado. TSK-H0-018 y H0 pueden declararse COMPLETED en ese alcance. Esto no declara Auth completo, acceso real aceptado, aplicación completa ni preparación de Production.

## Migraciones H0 y compatibilidad

Orden por nombre/version: H0-M01 (roles/contexto) → F1 (autoridades/capabilities) → H0-M02 (historia) → H0-M03 (autoridades/actor-sesión y F01/F02 forward) → H0-M04 (Human Approval y F01–F04 forward, después D039/TTE en dos migraciones) → H0-M05 (revocación global) → H0-M06 (recuperación). Son los 18 archivos de `supabase/migrations/`; cada uno tiene un único commit en `git log -- <archivo>`. No se editaron migraciones retrospectivamente en H0-018 ni hay down-migration aplicada.

Las suites V-MIG de H0-008/010/006/012/014/017 prueban cadena desde base vacía y upgrade desde predecessor con fixtures donde corresponde, migrador correcto frente a runtime, fallo DDL/rollback y reintento. H0-017 comprueba upgrade M05→M06 con actor, sesiones y epoch conservados. H0-008/010/012/014/017 inspeccionan owners, grants/revokes, RLS/FORCE, EXECUTE/SECURITY DEFINER y superficies runtime; H0-012 comprueba los logins/pools exclusivos TTE. El forward F04 tiene el fracaso histórico F05 preservado; D039 lo resuelve con un forward ulterior. La regresión acumulada actual vuelve a ejecutar estas suites sobre PostgreSQL efímero, no despliega migraciones hosted.

Hosted acreditado previamente: H0-M01/F1 y H0-M02 en Staging técnico por [PLAN-AUTH-006 database/F1](evidence-PLAN-AUTH-006-hosted.md) y [H0-M02](evidence-PLAN-AUTH-006-h0-m02-hosted.md), con 10/10 y 12/12 pruebas hosted respectivamente. H0-M03/M04/M05/M06 **no acreditados hosted**. Supabase Production no creada ni autorizada según coordinación vigente. La compatibilidad local de PostgreSQL 17.11 no acredita compatibilidad de esas migraciones en Supabase hosted.

## PLAN-AUTH y puertas futuras

| Puerta | Estado global | Parte H0 acreditada | Pendiente y tarea futura | Bloquea H0 aislado |
|---|---|---|---|---|
| 001 | PENDING | Inventario, compatibilidad local y coste calculado H0-001/003 | Capacidad y coste concretos aceptados, configuración y entrega real: H6-010/012 | No |
| 002 | PENDING | Modelo 7/30 por sesión, actividad humana y dispositivos sintéticos H0-005/006 | Sesiones/dispositivos reales, refresh, iPhone/Mac/iPad y retorno con contraseña+TOTP: H6-008 | No |
| 003 | PENDING | Revocación Core individual/global y fallo parcial con doble Auth H0-006/013/014 | Supabase Auth real, JWT vigente, dispositivos y objeto/acceso directo: H6-008 | No |
| 004 | PENDING | Guion y denegaciones de contrato H0-015/017 | Contraseña/TOTP en otro dispositivo y copia en papel protegida/verificada: H6-009 | No |
| 005 | PENDING | Estados y denegaciones de recuperación H0-015–017 | Email verificado entregado, TOTP real, propietario independiente, factor/copia nuevos y procedimiento probado: H6-009/011 | No |
| 006 | PENDING | F1, F2, ACL/RLS y recuperación local; subset hosted database/F1/M02 VALIDATED | Auth/MFA/sesiones/recuperación real, M03–M06 hosted, Vercel/SMTP, backups/restore/continuidad y Production: H6-008/011/014 y puertas Production | No |

PLAN-PENDING-003 sigue PARTIALLY RESOLVED. PLAN-AUTH PENDING global no se convierte en PASS por suites locales o dobles. H1–H6 permanecen NOT STARTED. El siguiente paso recomendado es planificar **por separado** H1-001, sujeto a su propia autorización y sin ejecutarlo en H0-018. Ningún H0-018-F01+ material se detectó. Se corrigieron solo dos incoherencias editoriales de `tasks.md`: H0-005 aún decía que la reverificación F01 estaba pendiente pese al cierre H0-006, y el resumen §3 decía en presente que todos los hitos estaban NOT STARTED. No se cambió producto, esquema ni fuente normativa superior.

## Regresión final acumulada

| Comando | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | PASS; lockfile ya actualizado, pnpm 11.19.0 |
| `pnpm audit --prod` | PASS; ninguna vulnerabilidad conocida |
| `pnpm run typecheck` | PASS; Next typegen y TypeScript |
| `pnpm run lint` | PASS; import boundaries |
| `pnpm test` | 31/31 PASS, 0 omitidos |
| `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres` | 265/265 PASS, 0 fallos/omitidos/cancelados, 396112 ms; cadena y suites formales H0 incluidas |
| `pnpm run build` | PASS; Next.js 16.3.5, rutas `/_not-found` y `/health` |
| `git diff --check` | PASS, sin errores de whitespace |

Versiones observadas: Node.js 24.21.0, pnpm 11.19.0, PostgreSQL local 17.11 (Postgres.app, según binario y ejecución de suites), Next.js 16.3.5, TypeScript 7.0.2, Postgres.js 3.4.9. No hay script agregado H0 distinto de `test:postgres` en `package.json`; este ejecuta todas las pruebas `tests/integration/*.test.ts`. El commit de cierre y la igualdad final `HEAD == origin/main` se verifican después de publicar.
