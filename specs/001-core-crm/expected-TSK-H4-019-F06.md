# Expected independiente — continuación H4-019 / F06

Base autorizada: `f8318fad8bf8a7b6d8224330dc1b8840288dba60`. Derivado antes del producto. El expected H4-019 original y sus J01–J23 permanecen íntegros. Sus 19 filas normativas siguen aplicables; este suplemento concreta la acreditación pendiente, sin reinterpretar los 1995 PASS anteriores.

## Autoridad y fixture

D015: único Administrador. D038 §§8–9: actor único y sesiones independientes; §§13–16: admisión antes de actividad, misma transacción Core, orden actor→sesión→epoch, generación y revocación. D039 §§1–2/6–10: binding real, TTE exclusivo, final check tras trabajos/esperas antes de COMMIT, resultado durable y replay autorizado. Plan §7.2 T05/T07/T08, SPEC-FR-CONC-002, AC-027, SPEC-FR-HA-004 y SPEC-FR-IDEMP-002 conservan sus resultados. La precisión humana de dirección autoriza exclusivamente actor FOR SHARE y mantiene sesión/epoch FOR UPDATE.

Fixture sintético por contratos ordinarios H2/H3/H4: un actor, dos sesiones humanas distintas, capacidades F1/F2 vinculadas individualmente a conexiones/PID/xid PostgreSQL distintos. SQL privilegiado solo instala, observa catálogo/locks o inyecta fallos técnicos identificados. Las barreras no crean hechos de negocio ni otorgan facultades runtime.

## Compatibilidad exigida

| Recurso | Admisión | Mutación de autoridad | Resultado |
|---|---|---|---|
| Actor | FOR SHARE | FOR UPDATE | SHARE/SHARE compatible; SHARE/UPDATE incompatible hasta COMMIT/ROLLBACK |
| Sesión | FOR UPDATE | FOR UPDATE | Misma sesión se coordina exclusivamente; sesiones distintas independientes |
| Epoch | FOR UPDATE | FOR UPDATE | Mismo epoch exclusivo, actividad solo tras guardas válidas |
| Raíz económica/porción | Locks existentes | Locks existentes | Autoridad compatible no elimina exclusión económica ni versiones |

No FOR KEY SHARE, lectura desbloqueada, admisión separada, liberación anticipada ni nuevos permisos. Solo cuerpo `crm_f2.admit` previsto; firma/OID/owner/ACL/configuración/atributos conservados. Establecimiento, reidentificación, revoke_session, revocación global, mapping, disable/recovery mantienen bloqueos exclusivos.

## Matriz autoridad / conservación

Cada caso conserva estado antes/después, PID/xid/sesión, fuente, resultado autorizado y locks observados.

| ID | Fuente / precondición / acción | Expected y prohibiciones |
|---|---|---|
| A00 | D038 §15; cadena48; primera unidad admitida espera negocio, segunda sesión solicita acceso | Reproducción de F06: segunda bloqueada en actor F2. Falta de acreditación; no afirma sobreconsumo |
| A01 | D015/D038 §§8/9/13–15; sesiones distintas | Ambas admitidas en transacciones distintas; locks actor compatibles; concurrencia posterior observable |
| A02 | D038 §§9/13–15; misma sesión/epoch | Segunda admisión espera exclusión sesión/epoch; nunca autoridad residual |
| A03 | D038 §§13/15/16; disable/revoke confirma primero | Acceso/replay posteriores denegados; actividad no revive autoridad; no efecto económico |
| A04 | D038 §15; admisiones primero, luego disable/revoke/reidentify/establish | Mutación incompatible espera; unidades admitidas pueden completar; autoridad vieja denegada tras revocación |
| A05 | D038 §§8/16/18; mapping/generación/recovery | Exclusión y estado vigentes; no modificación runtime ni retroceso de generación |
| A06 | D038 §§6/13, D039 §8; capability/evidencia expira esperando | Revalidación final deniega y rollback total; no renovación silenciosa ni requisito de terminar físicamente COMMIT antes del vencimiento |
| A07 | D038 §§5/11–13; 7/30 días, refresh, input/contexto/binding cruzados | Límites exactos deniegan antes de actividad; refresh no mueve tiempos; F1/F2 falsos/cruzados rechazados |
| A08 | D038 §§2/3/19, D039 §§1–3; M2 | No role escalation, CRUD, helpers privados, conexión TTE o finalización arbitraria; RLS/FORCE y ACL intactos |
| A09 | D039 §§7–10; aprobación/material obsoletos, espera, fallo/COMMIT/respuesta perdida | Autorización exacta vigente obligatoria; rollback interno total; replay durable autorizado sin repetir efecto |

## Matriz económica

Por cada fila: ambos órdenes; ambos PID/xid/sesión; raíz/porciones explícitas; locks granted/wait, pg_blocking_pids y cadena; admisiones F2 completadas antes de contención. Distinguir padre Opportunity/Booking/Refund/Deposit/Provider Payment/aprobación de payment-root; no atribuir un lock a otro. Deben existir casos directos payment-root sin hijos previos. Un padre legítimo puede serializar; explicar su efecto y no retirarlo.

| ID | Fixture / acción | Expected exacto / conservación |
|---|---|---|
| J01 | 100 disponibles, Allocation80/Refund80, sin hijos previos | Un consumo válido; perdedor conflicto/insuficiencia/stale; nunca160 |
| J02 | 100, dos primeras Allocation80 | Una asignación80; raíz de fondos protege aunque no haya hijos |
| J03 | Fondos internos legítimos, Refund contractual/rest itución Deposit80 | Una salida80 sobre misma porción; garantía no fabrica Cancellation Right ni fondos |
| J04 | Refund80/Provider Payment80 sobre100 legítimos | Un consumo80; derecho independiente de ubicación/pago |
| J05 | Retención o restitución interna80/consumo80 | No doble consumo; retención determinada distinta de aplicada |
| J06 | Porciones disjuntas20/20 | Versiones obsoletas se rechazan; reevaluación segura permite ambas si guardas actuales válidas; no propagación a independientes |
| J07 | Reserva/autorización/material cambiante | Material/aprobación exactos; stale rechazado; TTE final check tras espera; no reserva/effect parcial |
| J08 | Mismo movimiento Deposit/Refund concurrente | Identidad canónica única; una salida y una suma, replay otra operación/revisión válido; material diferente E2 |
| J13 | Incierto80, salida20, reserva60; competidores | 20 ejecutado/180 pendiente/60 reserva; otros no consumen reserva. Resto no ocurrido:20/180/0; otra salida60:80/120/0. F13 porción[100,120) no resuelve[0,80); F24 record attemptId no evade resolución |

Resultados derivan de aritmética exacta independiente y fuentes del expected original. No usar helpers para producir expected. PM-08 y PM-11/12/13, AC-040/SM-FORB-26 y restantes J14–J23 conservan sus oráculos congelados.

## Atomicidad / migración / cierre

Fallas en efecto, porciones, historia, resultado, reserva/movimiento y COMMIT revierten la unidad completa; reintento válido. Respuesta perdida después de COMMIT real recupera resultado durable. No rollback externo ni exactly-once externo.

V-MIG fresh49 y upgrade48 poblado por contratos: fallo DDL/rollback/reintento; datos, privados, relaciones, porciones/snapshots/historia y catálogo preservados. Bytes de48 migraciones, expected históricos, fuentes, dependencias y health-check intactos. Solo cuerpo admit previsto cambia; cualquier cuerpo adicional requiere defecto inequívoco y evidencia.

Seguridad F2/M03, HA/TTE/M04, revocación global y recovery se prueban también sobre cadena nueva; adaptaciones de runner explícitas conservan aserciones y FAIL históricos. Analizar ciclos/upgrades/deadlocks; abortos no dejan parciales; no ocultar nuevos conflictos.

F06 CLOSED únicamente con matriz observada y regresión completa sobre nuevo SHA exacto publicado: frozen, typecheck, lint/boundaries, build, audit prod, PostgreSQL, unitarias, health separado, V-MIG, advisors loopback y diff-check. No heredar PASS anteriores. Cierre posterior exclusivamente evidencia/logs/coordinación. H4-020+/H5/H6 NOT STARTED; hosted/Production/efectos externos/datos reales prohibidos. STOP tras cierre H4-019.
