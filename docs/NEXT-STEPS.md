# CRM HUESCAVENTURA OS — Next Steps

Actualización 2026-09-29: [TSK-H0-018](../specs/001-core-crm/evidence-TSK-H0-018.md) COMPLETED; H0 COMPLETED exclusivamente en alcance técnico/local/aislado aprobado. PLAN-AUTH-001–006 PENDING globalmente; H0-M01/F1/M02 hosted acreditados previamente, M03/M04/M05/M06 NO ACREDITADOS hosted; Auth y recuperación reales pendientes. H1–H6 NOT STARTED. Los puntos de parada anteriores se conservan como historia.

## Current Step

**Estado vigente:** H0 cerrado en su salida técnica aislada. La siguiente tarea de la secuencia aprobada es TSK-H1-001, sujeta a autorización separada; no se inicia aquí. Antes de acceso real o preparación de Production deben satisfacerse PLAN-PENDING-003, PLAN-AUTH-001–006 y las puertas de H6/ARCH-PENDING-002 que correspondan. No se ejecutó hosted, Auth real, servicio real ni despliegue durante H0-018.

**Los párrafos siguientes conservan la coordinación y los puntos de parada históricos de H0.**

**Fase 08 — Tasks SPEC 001: COMPLETED.** [tasks.md](../specs/001-core-crm/tasks.md) v0.1 está **APPROVED** por D036, sobre el borrador `04a98a81720dd02892b12c67fbcede69e5ae7787` y la coordinación revisada `f267e2c02d3c920dc385a73a6a0cc0f0e8c6dc5f`. COMPLETED corresponde exclusivamente a la fase documental.

**TSK-H0-013 y TSK-H0-014: COMPLETED en alcance local.** H0-M05 implementa el cierre Core global y la coordinación Auth con fallo parcial explícito. La verificación formal independiente R01–R23 queda 23/23 PASS, 8/8 pruebas formales; regresión 254/254 PostgreSQL + 31/31 unitarios. [Evidencia de implementación](../specs/001-core-crm/evidence-TSK-H0-013.md) y [evidencia formal](../specs/001-core-crm/evidence-TSK-H0-014.md). Sin H0-014-F01+ material. Hosted M03/M04/M05 NO ACREDITADOS; PLAN-AUTH-002/003/005/006 PENDING globalmente; Supabase Staging/Production intactos.

**Punto de parada histórico tras H0-013/014.** La continuidad autorizada H0-013/014 queda completada: implementación, H0-M05, focales, regresión y reverificación formal independiente. H0 continúa IN PROGRESS; no se amplió el alcance a H0-015, hosted, Auth real ni efectos externos.

**D038 APPROVED** en `6248820e3253a9d88755ed0a4996fff8f865690e`: F2 resolvió el bloqueo de diseño F1/humano sin modificar D037/F1. Autorizaciones posteriores permitieron H0-005 local, dos intentos FAILED de H0-006 por F01/F02 y una tercera reverificación local completa PASS. TSK-H0-009/010 y H0-008 permanecen COMPLETED en sus alcances; PLAN-AUTH-002 y PLAN-AUTH-006 permanecen PENDING globalmente.

La fase 07 permanece COMPLETED: [Plan SPEC 001](../specs/001-core-crm/plan.md) v0.3 APPROVED / COMPLETED por D034 el 2026-09-14; Ready for tasks.md: YES. D035 conserva su contexto histórico de autorización de preparación/publicación. Last Approved Commit corresponde a `3e3f47a1692290412a03cf14087c2c470b8cab90`, commit documental de aprobación formal D039, registrado mediante un segundo commit exclusivo de coordinación, sin modificar el Plan aprobado.

Architecture v0.1 y sus 18 ARCH-DEC, SPEC 001 v0.1 por D022, D023–D039 y PLAN-DEC-001–PLAN-DEC-009 permanecen APPROVED. Los commits del borrador, aprobación y coordinación se registran por separado en [PROJECT-STATUS](PROJECT-STATUS.md).

## Preserved Scope

### Authorized hosted continuation — 2026-09-17

The subsequent human authorization permits only PLAN-AUTH-006 hosted database/F1
validation on `wrcrhbdbydkchxxlcacb`. This supersedes the earlier authorization
boundary below only for that isolated subset; no new H0 task is authorized.
Current result is **VALIDATED for the hosted database/F1 subset**: runtime login,
both poolers, affinity, F01/M2, F1, C01/C03, key lifecycle, Data API, advisors and
bounded performance passed. Temporary JIT/runtime/K were removed and Temporary
Access disabled. Do not replay the five applied migrations. H0-M02 is now applied
and validated on Staging under the separate human authorization of 2026-09-26;
TSK-H0-009/010 remain COMPLETED and no new task was started.
Before any hosted application deployment, replace/configure the current
Postgres.js `ssl:"require"` path with explicit CA/hostname verification and
validate Vercel secret injection/concurrency; those are not part of this DB/F1
closure.

- Se conservan las 125 fichas, dependencias, protocolos y 618 correspondencias aprobadas; TSK-H0-001–018 COMPLETED en sus alcances históricos/locales tras el cierre H0-018.
- PLAN-PENDING-001/002/004 permanecen resueltos en sus alcances. PLAN-PENDING-003 sigue PARTIALLY RESOLVED y PLAN-AUTH-001–006 permanecen PENDING globalmente; solo el subset hosted database/F1 de PLAN-AUTH-006 está VALIDATED.
- Los bloqueos localizados de Tasks §7 y los pendientes heredados permanecen vigentes en sus ámbitos.
- La aprobación documental no sustituye evidencia técnica ni resuelve pendientes por suposición.

PLAN-PENDING-001/002/004 permanecen resueltos en sus alcances. PLAN-PENDING-003 sigue PARTIALLY RESOLVED; PLAN-AUTH-001–006 permanecen PENDING globalmente, con el subset hosted database/F1 de PLAN-AUTH-006 ya VALIDATED. D025/D026/D027/D031 completan la política: varios dispositivos, 30 días absolutos y 7 de inactividad por sesión, uso humano validado, revocación efectiva, email de seguridad verificado, TOTP y recuperación independiente del propietario/papel. Las capacidades y ensayos restantes aún deben acreditarse; refresh no es uso humano.

ARCH-PENDING-001/002 y los demás pendientes heredados conservan sus ámbitos; el segundo condiciona aceptación/configuración definitiva de recuperación y continuidad de Production, sin impedir ensayos aislados futuros autorizados. D018–D020 y SM-PENDING-001/002/003 mantienen sus resoluciones históricas; BR-PENDING-023/027/036 y DM-PENDING-001/003/004 se interpretan en esos alcances.

D030 queda exclusivamente para futura SPEC de interfaz. D033 conserva crm.huescaventura.com como dirección prevista, separada de la web pública; sin DNS, recursos ni despliegue configurados.

## Approved Order

Precedido por Constitution v1.0 APPROVED.

1. product.md
2. business-rules.md
3. domain-model.md
4. state-machines.md
5. architecture.md
6. SPEC 001 Core CRM
7. plan.md — COMPLETED, v0.3 APPROVED por D034.
8. tasks.md — COMPLETED, v0.1 APPROVED por D036.
9. implementación — H0 COMPLETED en alcance técnico/local/aislado: TSK-H0-001–018 COMPLETED en sus respectivos alcances; F01–F05 de H0-012 CLOSED localmente, D039 IMPLEMENTED LOCALLY. H1–H6 NOT STARTED.

## Working Rule

Work solo debe ejecutar el siguiente paso aprobado.

La aprobación documental D038 resolvió el modelo de confianza F2; H0-005, las etapas H0-006, H0-011 y H0-012 recibieron autorizaciones separadas. Se conservan las ejecuciones FAILED, fixes F01–F04, quinta ejecución F05 y puerta experimental PostgreSQL 17.11. La primera autorización de 2026-09-28 aprobó y publicó únicamente D039 y coordinación; una autorización posterior cerró F05/H0-012. La autorización actual cubrió exclusivamente H0-013/014, incluidas migración forward-only, correcciones localizadas, commits y push local/remoto. No alteró D037/D038/D039, no inició H0-015 y no autorizó Auth real, secretos, Supabase hosted, Vercel, dispositivos ni Production. Los bloques hosted anteriores conservan sus autorizaciones y evidencia históricas.

Regla del punto de parada anterior a la autorización H0-015/016/017: no iniciar las tareas posteriores, Auth real, UI, esquema comercial, endpoints de negocio, configuración Supabase/Vercel adicional, proveedores/dispositivos, DNS, infraestructura externa o despliegues sin nueva autorización. La autorización actual cierra solo H0-015/016/017 localmente; no iniciar H0-018 ni aplicar H0-M03/M04/M05/M06 hosted.

Si aparece una decisión de negocio, arquitectura, seguridad, datos o cumplimiento no resuelta:

- detener únicamente la parte afectada;
- registrarla como pendiente sin reabrir políticas ya resueltas;
- solicitar decisión antes de continuar esa parte;
- completar el trabajo independiente autorizado.

La continuidad H0-013/H0-014 termina con su cierre local y este punto de parada. H0-015 requiere una nueva autorización y no se inicia aquí.
