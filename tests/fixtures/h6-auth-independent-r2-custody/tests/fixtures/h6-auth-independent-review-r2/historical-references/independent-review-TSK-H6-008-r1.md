# Revisión independiente H6-008 — R1

Fecha: 2026-10-22 Europe/Madrid. Dictamen: **NO ACEPTABLE en su integridad; F01 material ALTO y M02 de cobertura abiertos**. Ninguna declaración COMPLETED.

## Identidad y aislamiento

Base exacta `971c55d5ce5770c71284d106d3c0deecca9514b5`. Entrada `tests/fixtures/h6-auth-integration/audit-input-manifest.json`, SHA-256 `b674ac9ac035371fd2175a0ac22744f6c60c1b0f58b7538cb0d9af2e30d1d3b5`, 1423 archivos verificados por tamaño/SHA-256 antes de copiar. Solo se copiaron esas entradas más el manifiesto sobre un managed worktree limpio en la base. El candidato original no fue modificado ni ejecutado por el revisor.

Worktree revisor: `/Users/andres/.codex/worktrees/h6-auth-independent/crm-huescaventura-os`. PostgreSQL 17.11, 68 migraciones Core; Supabase Auth oficial v2.197.0 con hashes fijados y comprobados; Storage oficial fijado `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, caché pública intacta reutilizada en lectura. Identidades, contraseñas, TOTP, JWT y objetos sintéticos; procesos loopback con entorno explícito. Instalación `pnpm --frozen-lockfile --offline --ignore-scripts`. Sin Hosted, Production, credenciales reales, correo externo, commit, push, deploy, Drive ni restore.

Se leyeron Constitución, README, ficha H6-008, Spec/Plan/Architecture, D015/D025/D026/D038 y filas de dominio/SM asignadas. Los 10 documentos normativos coinciden con el lock. La matriz de 23 asignaciones se derivó nuevamente de la columna de verificación de Tasks y coincide literalmente con la matriz recibida. Coincidencia de IDs no equivale a cumplimiento íntegro.

## F01 — Identificación anterior al cierre se autoriza con generación posterior

**ALTO / MATERIAL / OPEN.** Ubicación principal: `src/server/human-auth-session.ts:23` y `:60`; dependencia existente `src/infrastructure/postgres/h0-005-adapter.ts:78`.

Secuencia reproducida I04:

1. Dos dispositivos A/B poseen sesión Core válida mediante password y TOTP reales.
2. Un login adicional completa password, TOTP y `/user` auténticos. Se retiene la continuación inmediatamente antes de delegar `Access.establish` a PostgreSQL. No se fabrica identidad ni se cambia manualmente generación/estado.
3. B revoca globalmente. La generación Core se incrementa y las sesiones previas conocidas se cierran; el proxy provoca HTTP503 real en logout. Resultado confirmado: `partial`, `auth=uncertain`.
4. Se libera el login anterior. Como aún no estaba en `bindings`, el cierre no lo marcó; `establish` consulta la generación ya nueva y crea autoridad usando la identificación terminada antes del cierre.
5. Observado: **login HTTP200 y lectura timeline HTTP200**. Esperado independiente: **403** y nueva identificación posterior.

Violación: Plan §6.3 exige carreras con nuevas identificaciones y que un resultado anterior tardío no vuelva válida una sesión; PLAN-AUTH-003 exige cierre efectivo pese a fallo parcial. D038 conserva generación/revocación como autoridad persistente. El resultado parcial del proveedor no autoriza regenerar autoridad Core de una identificación anterior.

Corrección necesaria: vincular el intento de identificación a generación obtenida antes de completar la identificación y rechazar cambio bajo la unidad transaccional de establecimiento; no basta recorrer bindings ya creados ni un fence únicamente local al proceso. Verificar también orden inverso, nueva identificación posterior válida y coordinación entre instancias. El revisor no cambia producto.

Evidencia: `tests/fixtures/h6-auth-independent-review/contraprobes-2026-10-21T23-10-53-177Z/`. Expected independiente SHA-256 `f3364214290b0770624449fa2f753c244c94fe2d6fd565b3fcc66921fee6024a`, congelado antes del ensayo. El FAIL y fuente exacta se conservan.

## M02 — Cobertura de superficies completas no acreditada

**MATERIAL DE ACEPTACIÓN / OPEN; no es una vulnerabilidad adicional demostrada.** Las dieciséis rutas del ensayo corresponden a nueve métodos distintos: comercial read/apply, trabajo read/apply, evidencia read, proyección read, objetos metadata/download/prepare. Hay otros tres métodos de objetos usados en preparación positiva y tres operaciones de ciclo de sesión. Esto no acredita por sí solo cada método/acción restante.

Inventario independiente: **110 entrypoints humanos**, 108 métodos de 40 clases y dos del factory `createPersistedWorkExecutor`. Incluye gestión de sesión y probes históricos, por lo que no debe presentarse como 110 rutas de producto distintas. Cada método dispatcher puede contener varias acciones; contar métodos tampoco prueba esas ramas. Ejemplos sin denegación transversal del ensayo integrado: evidencia apply, diagnóstico record/read, identities/catalog, Booking y confirmaciones.

`public-human-adapter-inventory.json` contiene archivo/línea/hash, helpers, guardias, clasificación de cobertura, delegaciones revisadas y referencias concretas para localizar invocaciones históricas. Los pointers históricos no se presentan como tests ejecutados ni como resolución de tipos. La inspección live de 127 funciones crm_api/f1/f2 encuentra 116 nombres API y 87 con referencia directa/indirecta a `crm_f2.admit`. Es un grafo de referencias: no demuestra ejecución obligatoria, orden ni todas las ramas. Los 29 restantes incluyen gestión de sesión, recovery y finalización TTE/técnica; no se señalan como bypass por no usar admit.

La guardia común live verifica firma/binding, clase humana, actor/mapping/enabled/ready, generación, sesión/revocación, epoch/MFA, 30/7 días y después actividad, con locks actor→sesión→epoch. Delegaciones comprobadas: Booking.direct conserva adaptadores sobre misma TX; H5001.apply/read delegan H1017, balanceNeeds delega lectura H3001. Puede utilizarse equivalencia documentada para métodos que delegan exactamente la misma ruta protegida, pero las rutas SQL/ramas diferentes exigen prueba o justificación explícita, sin transformar muestreo en cobertura total.

## Resultados propios

| Grupo | Resultado | Evidencia |
|---|---|---|
| Integrados del candidato | 17 PASS, 0 FAIL, 0 skip | `h6-auth-integration/integrated-2026-10-21T23-08-58-116Z/` |
| Regresión H6-008/H0-006/H0-014/H1-016 | 60 PASS, 0 FAIL, 1 skip histórico S10 | `h6-auth-integration/regression-2026-10-21T23-11-43-544Z/` |
| I01, ACL conectado a base Auth real | PASS: users/sessions/mfa_factors existen, runtime recibe 42501 en las tres | `h6-auth-independent-review/contraprobes-2026-10-21T23-10-53-177Z/` |
| I02, cierre global real | PASS: Auth sessions 4→0; JWT aún firmado; user y refresh denegados | mismo run |
| I03, logout individual con Auth503 | PASS: handle y proof anteriores rechazados en 16 superficies; B sigue válido | mismo run |
| I04, login tardío con revocación parcial | FAIL: Core HTTP200 frente a 403 esperado | mismo run |
| I05, inventario SQL live | PASS de extracción, 127 funciones; no prueba funcional adicional | `h6-auth-independent-review/contraprobes-2026-10-21T23-15-29-816Z/` |

No se altera S10 histórico para ocultar su skip. Los integrados nuevos prueban el proveedor local; no eliminan F01/M02. Lint/typecheck/build y 210 unitarias figuran PASS en evidencias del candidato leídas, pero no fueron reejecutadas por este revisor en R1; los resultados propios se limitan a la tabla. Los 1423 inputs, 10 fuentes normativas y Git tracked permanecen intactos tras los ensayos, comprobado en `preservation-r1.json`.

## Cobertura de asignaciones

Todas conservan límite global F01/M02. A=ensayo Auth integrado; S=regresión H6 histórica. Los criterios Production/dispositivos/recuperación externa no se dan por satisfechos por equivalencia local.

| Asignación | Evidencia local y límite |
|---|---|
| SPEC-FR-SEC-001 | A01/A02/A03/A12; I01; F01 |
| SPEC-FR-SEC-002 | A03/A11/A12 + S07; I01; F01 |
| SPEC-FR-SEC-004 | A01/A12; límite local sin Production |
| SPEC-FR-SEC-005 | A02/A06/A07/A10/A11/A14; I02/I03; F01 |
| AC-064 | A01/A03/A12 + S06/S07; I01; F01 |
| AC-080 | A01/A12; límite local sin Production |
| SPEC-NFR-002 | A01–A12 + S07; F01 |
| DM-INV-050 | A12 + S06/S07; permisos sin roles futuros; privacidad H5 no reaceptada |
| SM-FORB-29 | A12 + S06/S07; no permisos por metadata/relación; H5 privacidad conserva alcance |
| ARCH-DEC-004 | A01/A02/A06/A07; I02/I03; F01 |
| ARCH-DEC-010 | A10 + S07/S08 + H1-016; objeto privado/reautorización |
| P10 | A01–A12 + S07; I01; F01 |
| PLAN-DEC-002 | S07/S09 + A09; I01; guardias transaccionales |
| PLAN-DEC-007 | A01–A12; I02/I03; F01 |
| PLAN-B01 | A01/A02/A03/A11/A12; F01 |
| PLAN-C01 | A03/A09/A11; F01 |
| PT-11 | S01–S09 + A01–A12; F01 |
| PLAN-AUTH-002 | A03/A04/A05 + S02/S03 |
| PLAN-AUTH-003 | A06–A10; I02/I03; I04 FAIL F01 |
| PLAN-AUTH-006 | A01/A03/A12 + S06/S07 |
| D015 | A12 + S06/S07 |
| D025 | A01/A04/A06/A07; I02/I03; F01 |
| D026 | A03/A04/A05 + S02/S03 |

## Límites y precisión documental

El handle en memoria exige nueva identificación tras reinicio y no acredita continuidad multinodo. Password/TOTP se verifican de verdad, pero los dispositivos son sesiones lógicas sintéticas. La documentación oficial de Supabase confirma que firma/exp del JWT no cambian al logout y para cierre inmediato se comprueba la sesión: https://supabase.com/docs/guides/auth/sessions. En la versión fijada, se contrastó `/user` y eliminación real de auth.sessions. No se infiere el comportamiento de otros consumidores JWT.

`mailAttempts()` del helper cuenta peticiones HTTP al interceptor; no cuenta por sí solo conexiones SMTP ni constituye auditoría exhaustiva de egress. El aislamiento se sustenta en configuración local explícita, proveedores externos desactivados y ámbito de estos ensayos. No se afirma monitorización universal de salida.

H6-015 permanece NOT STARTED. ARCH-PENDING-002 y DM-PENDING-005 OPEN. PLAN-PENDING-003 conserva dispositivos físicos, recuperación/entrega real y Production. R1 propone corregir F01 y resolver M02 antes de nueva revisión, sin declarar H6-008 ni H6 COMPLETED.
