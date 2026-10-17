# H5-018 — cuarta auditoría — matriz normativa independiente

El oráculo es [expected congelado](expected-TSK-H5-018-fourth.md) y las fuentes aprobadas, cuyas 13 asignaciones literales de Tasks §6 están en `tests/fixtures/h5-018-fourth/normative-sources.json`. El candidato E y sus pruebas son objetos auditados. Solo evidencia local/aislada; ningún cierre global H6.

| Asignación | Verificación independiente y regresión | Resultado del alcance |
|---|---|---|
| SPEC-FR-HIST-001 | Q02/Q03/Q04/Q06: versiones, actor, contexto, observación exacta, upgrade; originales A/R/T. | FAIL: F01/F02; preservación de filas PASS. |
| SPEC-FR-ERR-001 | A01–A09 originales, Q01/Q05: E4 permanece pendiente, sin nuevo efecto. | PASS del alcance local probado. |
| AC-070 | Regresión original A13 y completa actual: detención, fallo persistente, canal simulado indisponible. | PASS focal y regresión completa actual. |
| AC-072 | F03/A04 original: efecto durable/excepción conserva incertidumbre; Q05 retirada aprobación. | PASS. |
| AC-081 | Referencias múltiples, secuencias A→B→A, padres, replay histórico y páginas 1/2. | FAIL F01/F02. |
| SPEC-NFR-009 | Procedencia/versionado y reautorización, V-MIG exacto. | FAIL F01/F02; V-MIG PASS. |
| SPEC-NFR-010 | Localización mínima y límites de referencias, Q02/C01. | FAIL F01. |
| SPEC-NFR-014 | E1–E8 originales, control de incertidumbre y repetición sin efectos. | FAIL localizado F02; no acredita H6-015. |
| DM-INV-047 | Propiedad y contexto por versión; conservación y actores. | FAIL F01/F02. |
| SM-FORB-27 | Q05 y F03: aprobación retirada no autoriza ejecución, sin retry/duplicación. | PASS. |
| P12 | Canarios originales, referencias mínimas y V-MIG/roles. | Secretos/cuerpos/URL: PASS; metadatos fuera de alcance: F01. |
| PLAN-B08 | Q01/Q02/Q05 y originales: define/claim/revise/withdraw; propietario, versiones e historia. | FAIL F01/F02. |
| PT-11 | Q04 revocación por contratos B01, nueva sesión, F1/F2 y 12 denegaciones directas V-MIG. | Autenticación/privilegios PASS; confidencialidad por alcance F01. H6-017 no acreditado. |

## Casos nuevos: precondiciones, transición y evidencia

Todos usan datos sintéticos. Los IDs concretos y salidas están en los logs de cada captura; cada `.status.json` fija orden, entradas y hashes. La repetición 13 ejecuta exactamente estas 17 aserciones sin modificar sus fuentes.

| Casos | Norma/esperado previo | Datos y transición permitida | Observado inicial | Evidencia |
|---|---|---|---|---|
| Q02 historia, booking | C01/HIST003/006: no incorporar fuente B denegada desde A | Trabajo A, observación, revise B, revise A; fuente B07 como control | FAIL: definición/aprobación/operación/historia B | 02-history |
| Q02 historia, servicio→reserva | Igual, con padre canónico | Servicio real sintético de reserva; secuencia A→B→A | FAIL mismo defecto | 02-history |
| Q02 historia, servicio→oportunidad | Igual, recorrido de dos niveles | Servicio→reserva→oportunidad; secuencia A→B→A | FAIL mismo defecto | 02-history |
| Q03 pendiente sin operación | HIST001/006/AC081: conservar petición y contexto | Ejecución explícita, versiones A→B→C→A, páginas 1 | PASS | 02-history |
| Q04 revokeOne | SEC001/002/C01: denegar sesión revocada, recuperar con nueva | Padre reserva/hijo servicio, evento, revisión, revokeOne y establish | PASS, otras sesiones legítimas siguen válidas | 03-permissions |
| Q04 revokeAll | Mismos límites, también otras sesiones previas | revokeAll, nueva identificación; sesión vieja sigue denegada | PASS | 03-permissions |
| Q04 replay operación+ejecución | Plan7.1/V-AT: recuperar resultado previo equivalente | Observación A, revise B, sesión nueva, consulta autorizada y replay | FAIL DIAGNOSTIC_DENIED | 03-permissions |
| Q01 evento/ejecución UUID distintos | Identidad tipada y propietario reales | Evento y trabajo autorizados; operación desconocida→claim→pause | PASS, fila original intacta | 04-identity |
| Q01 evento/ejecución UUID iguales | Igualdad entre tipos no impide relación legítima acreditada | Mismo caso con evento y ejecución que comparten UUID | PASS | 04-identity |
| Q03 evento con múltiples vínculos | HIST003: original único y permisos por contexto | Evento A, link ordinario B, observaciones propias, páginas 1 | PASS, un original, observaciones separadas | 04-identity |
| Q05 retirada de aprobación | B08/SM-FORB27: no ejecutar ni borrar historia | claim→withdraw_approval; intentos start/resume; consulta histórica | PASS, efecto bloqueado, E4/historia intactos | 04-identity |
| Q02 escritura de operación B desde A | C01/C04: propietario no sustituye contexto original | A→B→A y nueva observación A con operación de revisión B | FAIL, inserta y presenta canonical | 04-identity |
| Q06 upgrade/rollback/recuperación | V-MIG: tres cuerpos, sin cambios de datos/privilegios | Base 66 poblada, DDL fallido, 67, recuperar 66, reaplicar 67 | PASS | 05-migration |
| Q06 instalación limpia/roles | V-DAT/V-MIG: mínimo privilegio y FORCE RLS | Clúster nuevo, cadena 67, roles API posteriores, 12 accesos prohibidos | PASS | 05-migration |
| Q04 replay solo operación | Plan7.1/V-AT | Observación A, revise B, consulta autorizada y replay exacto | FAIL DIAGNOSTIC_DENIED | 12-replay-controls |
| Q04 replay solo ejecución | Plan7.1/V-AT | Mismo recorrido, sin operationId | FAIL DIAGNOSTIC_DENIED | 12-replay-controls |
| Q04 replay sin referencia opcional | Control positivo Plan7.1/V-AT | Mismo recorrido, solo identidad/petición/contexto | PASS replayed true | 12-replay-controls |

## Protocolos y contabilidad

V-DOM/V-DAT/V-NEG: **FAIL funcional** por los casos materiales anteriores; no se convierten en PASS por pasar los controles de infraestructura. V-MIG: **PASS independiente**. V-EVI: integridad de las 16 capturas, fuentes/hash y preservación PASS; el sello tiene verificación independiente de solo lectura. Los FAIL permanecen registrados como resultados de producto.

Primeras ejecuciones nuevas: 17 casos distintos, 10 PASS/7 FAIL; los 7 FAIL corresponden a 2 defectos materiales. La repetición 13 confirma 10 PASS/7 FAIL y no se suma. Regresión focal 06: 44/44 PASS, solapa la selección completa de 184 archivos/2.884 casos, reejecutada en 01 con 2.884/2.884 PASS. Las 17 contrapruebas de cuarta auditoría son adicionales: conjunto disjunto de 2.901 casos, 2.894 PASS/7 FAIL. Unitarias 208/208 y health 1/1 se contabilizan por separado. Se excluyen 54 nombres de casos históricos incrustados en subprocess.

La revocación por evidencia mediante unlink no existe en B07. No se inventa: Q04 comprueba la autoridad real B01 para todas las superficies indicadas, y las perturbaciones SQL privilegiadas de E se clasifican como regresiones sintéticas de fuente, no como flujo ordinario de revocación.
