# TSK-H6-006 — Evidencia del candidato local

2026-10-22. Base probada `971c55d5ce5770c71284d106d3c0deecca9514b5` más fuentes nuevas sin commit. Las fuentes exactas de cada ejecución constan en su `source-manifest.json`; no se atribuye a la base intacta código aún no publicado.

**Resultado: candidato técnico local PASS, 62/62 pruebas; propuesta de aceptación pendiente, no se marca COMPLETED.** H5-019 satisface la dependencia local. La autorización posterior de implementación procede expresamente del director en esta conversación. No se cierra PT-09, H6 global, acceso real o Production por este resultado.

## Oráculo y reproducción

Expected derivado de normativa y sellado antes de instrumentar/observar: [expected-TSK-H6-006.json](expected-TSK-H6-006.json), SHA-256 `031dbfa4d9e3155a48ba909ebfe369d596acb9b020040cad3a24cd253e282809`. Las once asignaciones exactas de Tasks §6 están cubiertas por [matrix-TSK-H6-006.json](matrix-TSK-H6-006.json). Fuentes, ficha literal, autorizaciones y dependencias en `tests/fixtures/h6-local-validation/{preflight,normative-source-lock,expected-freeze}.json`.

Ejecutar desde este worktree `node scripts/run-h6-local-validation.mjs h6-006`. El runner comprueba base, normativa y expected, crea un directorio nuevo y usa un entorno sin variables heredadas de conexión o captura. PostgreSQL 17.11, Node 24.21.0, pnpm 11.19.0; Storage oficial fijado a `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, backend de archivos, PostgreSQL propio y loopback. Los firmantes F1/F2 y JWT son sintéticos y efímeros; no se escriben a evidencias. No se ejecuta H6-015.

Ejecución válida: [h6-006-2026-10-21T22-25-23-170Z](../../tests/fixtures/h6-local-validation/h6-006-2026-10-21T22-25-23-170Z/run.json). Los timestamps de archivos están en UTC; la fecha local es 22 de octubre. 62 PASS, 0 FAIL, 0 skipped; 40 observaciones JSON adicionales. Los tests históricos se conservan: dos archivos H6 reutilizan las comprobaciones H5 con fixture de cadena completa y puertos exclusivos. El recorrido nuevo usa otro proceso y un ledger propio del proveedor simulado.

## Contrastes observados

| Expected | Observado y evidencia |
|---|---|
| E01/E13: efecto incierto y continuación parcial | El hijo escribe un efecto simulado y recibe SIGKILL; el nuevo proceso observa contacted. Recuperación conserva uncertain/reserva. Fuente durable concilia una vez; misma identidad hace replay; segunda parte continúa y el hecho comercial original no cambia. Diagnóstico del test nuevo en stdout. |
| E02/E05: ejecutor obsoleto | Caída antes de contacto, reclaim con nueva generación, intentos anteriores conservados. Resultado viejo no sobrescribe sucesor exitoso: `fencing`, `old-generation-late-result`, `process-*`. |
| E03/E04/E11: falta/discordancia/indisponibilidad | Prueba inventada o tuple discordante denegada; fuente no disponible o efecto previo impide contacto. `uncertain-recovery`, `late-result`, `restore-barrier` y tests W40/W44. |
| E06: aprobación material | Siete modificaciones materiales, cambio de versión, retirada de aprobación y carreras start/withdraw/revise denegadas o serializadas; no reserva con aprobación inaplicable. |
| E07: autoridad | Contexto/propósito incorrectos, autoridad ausente/falsificada, SQL directo y replay tras deshabilitar actor rechazados. `security` y recorrido nuevo. |
| E08: unidad interna | Ocho puntos de fallo claim/start/result, fallo diferido y caducidad de evidencia al final revierten efecto/historia/resultado/intención juntos; reintento equivalente pasa. `rollback-*`, `deferred-rollback`, `expired-final-check`. |
| E09: concurrencia | Reclamación A/B, recuperación/resultado y controles en ambos órdenes con dos PID y espera Lock real; consumo único. `claim-race-*`, `recovery-result-race-*` y demás intercalaciones. |
| E10: respuesta perdida tras COMMIT | Proxy local retiene la respuesta real de PostgreSQL; el resultado permanece durable y se reconoce por identidad sin nueva inspección/contacto. `commit-response-loss`. |
| E12: control persistido | Pausa/revisión/parada no liberan incertidumbre. Resultado tardío conciliado conserva stopped y no habilita resume: `stop-after-contact`, `control-*`. |
| PLAN-B09/C05/T09 | Diez pruebas sobre recepción canónica, deduplicación, echo de efecto B08, discordancia, revisión, rollback, SQL directo, concurrencia y conectores que permanecen solo revisión. `postgres-h6-006-boundary.test.ts`, resultados en stdout. |

G1 queda contrastada por identidad/ámbito/rol; G2 por evidencia ausente/caducada/discordante; G3 por aprobación exacta/retirada/cambios; G4 por historia, rollback e inmutabilidad; G5 por partes independientes y ausencia de inferencia de envío/pago; G6 por incertidumbre, replay, concurrencia y pérdida de respuesta. SM-HA-03 se cubre con resultado acreditado, fallo/incertidumbre y retirada individual de guardas aplicables. Los dobles representan solo canales externos; PostgreSQL, permisos, locks, rollback, procesos y Storage son reales aislados.

## Fallos conservados y correcciones

1. `h6-006-2026-10-21T22-20-28-087Z`: 52 errores de setup `ISOLATED_STORAGE_REQUIRED`. El runner inicial no levantaba Storage aunque el fixture completo lo necesita. Corrección: utilizar el runner oficial aislado también para H6-006. No fueron 52 defectos del producto.
2. `h6-006-2026-10-21T22-21-39-378Z`: setup npm falló porque el cache temporal histórico tenía sus archivos versionados eliminados, incluido package-lock. Se preservó ese cache y se creó un recinto temporal propio; se obtuvo/buildó el mismo commit público fijado. No se relajó la comprobación de identidad del servicio.
3. `h6-006-2026-10-21T22-24-02-783Z`: 61 PASS/1 FAIL. La aserción nueva comparaba UUID B08 sin el prefijo HA `a-`. El adaptador aprobado enlaza ambos mediante ese namespace (`persisted-work-executor.ts`, intento y resultado). Se corrigió la comparación exacta del instrumento, conservando el requisito de identidad y el FAIL. No cambió el expected normativo ni código productivo.

El caso histórico W41 solo construye estado previo a contacto y contrasta la barrera del efecto simulado. **No restaura backup ni acredita H6-015**; su propia evidencia contiene `integralH6RestoreAccredited:false`.

## Auditoría y límites

`scripts/audit-h6-local-validation.py` contrasta las observaciones con invariantes independientes, hashes congelados, roles, locks, identidad y conservación; no importa el verificador TypeScript. Detecta cuatro contrapruebas en copias en memoria: duplicado de claim, sobrescritura tardía, incertidumbre convertida en éxito y dos supuestos ejecutores con el mismo PID. No se manipula el candidato real ni se debilitan verificadores.

La independencia es **instrumental**, con conexión observadora y comparador separado, dentro del trabajo del mismo agente. No se afirma revisión por un segundo auditor humano o agente. La aceptación del director no se fabrica. Propuesta: aceptar este candidato exclusivamente como salida técnica local de H6-006 tras revisar expediente; mantener separadas aceptación, publicación y avance de H6-015.
