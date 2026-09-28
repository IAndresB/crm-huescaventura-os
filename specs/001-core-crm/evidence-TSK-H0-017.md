# TSK-H0-017 — matriz formal independiente

Matriz fijada antes de escribir las assertions formales. Fuentes exclusivamente APPROVED: Tasks H0-017/§2.2/§6.9, Plan §§5.3/6.3–6.4, D025/D027/D031, SPEC-FR-SEC-004/AC-080 y PLAN-AUTH-005/006. La salida de H0-016 no es oráculo. Base de verificación: pendiente de publicar H0-016.

| Fila | Estímulo independiente | Expected normativo |
|---|---|---|
| R01 | Contraseña restablecida por email previamente verificado; MFA aún no satisfecho. | Core denegado; sesión nueva solo tras identificación completa con TOTP. |
| R02 | Email sin verificación previa, enlace inválido/usado o recuperación interrumpida. | No se abre Core ni se acepta como recuperación completada. |
| R03 | Copia del factor vigente restaurada sin iCloud en dispositivo distinto. | Sirve para el mismo TOTP, junto a contraseña; no constituye bypass general. Copia antigua tras reinscripción deniega. |
| R04 | Propietario independiente no acreditado o medio perdido compartido. | Break-glass denegado; no se fabrica segundo Administrador. |
| R05 | Propietario acreditado inicia D031. | Revocación global efectiva, incidente/acciones trazados sin secretos, Core cerrado hasta factor nuevo, anterior revocado y nueva copia verificada. |
| R06 | Respuesta de revocación Auth fallida, incierta o tardía. | Estado parcial explícito; Core no se reabre ni se afirma éxito. |
| R07 | Sesiones/epochs/generations anteriores y JWT vigente tras completar. | Denegados; actor e historia conservados; nueva identificación completa crea autoridad nueva. |
| R08 | Dos recuperaciones concurrentes, duplicado y replay. | Una transición de generation; sin doble incidente/efecto ni ampliación de autoridad. |
| R09 | Rol runtime, genéricos/Data API, acceso SQL directo. | Sin DML Core/recuperación ni EXECUTE público útil; F1/F2 siguen autenticados, RLS/FORCE y ownership separados. |
| R10 | Base anterior con actor/sesiones/historia y migración nueva; base vacía. | Migración forward-only aplica en ambas, preserva relaciones, permisos y datos previos. |
| R11 | 7/30 días, actividad humana y reloj servidor alrededor de recuperación. | No se renuevan por reset, refresh, otro dispositivo ni nueva generation; plazo nuevo solo por identificación completa nueva. |
| R12 | Recuperación de datos distinta de acceso y estado parcial. | No revive revocaciones; P13 rige intervención administrativa de datos. Hosted/real queda pendiente H6. |

Se intentará falsar cada fila con PostgreSQL efímero nuevo, claves y sujetos sintéticos nuevos, conexión independiente para persistencia. Resultado observado, comandos, versiones, defectos y límites se completarán tras la ejecución; un doble no acredita entrega/autoridad reales.

## Ejecución formal publicada

Base comprobada tras `git fetch origin`: `8c29421b1e66e230c82c311df814f05065d3355c`, coincidente con `origin/main`, rama `main` y árbol limpio antes de esta comprobación. PostgreSQL 17.11 local efímero nuevo (`crm_h0_017_formal`), Node 24.21.0, pnpm 11.19.0; nuevo sujeto, actor, sesiones, F1/F2 y clave de cada tipo generados al ejecutar. Conexión bootstrap independiente leyó persistencia; runtime ordinario intentó accesos directos. Comando: `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/integration/postgres-h0-017.test.ts`.

| Fila | Observado independiente | Resultado local |
|---|---|---|
| R01 | Sin TOTP verificado, la finalización se rechaza; con prueba completa, nueva identificación crea sesión/epoch nuevos. | PASS |
| R02 | Email no verificado o enlace no consumido: denegación antes de mutar generation. Interrupción deja Core cerrado. | PASS |
| R03 | La prueba sintética de nueva copia/factor incompleta deniega D031; la restauración física del factor vigente desde papel está asignada a H6-009. | PASS de contrato local; H6 pendiente |
| R04 | Propietario no independiente: denegación; tras recorrido válido persiste un solo CRM Actor. | PASS |
| R05 | D031 deja Core cerrado durante todos los faltantes y persiste incidente, estado Auth y acciones de factor/copia sin secretos. | PASS local |
| R06 | Revocación Auth incierta queda `partial/uncertain`, Core denegado y finalización imposible. | PASS |
| R07 | Generación anterior incrementada exactamente una vez; sesión/epoch viejos denegados tras terminar, historia persistente. | PASS |
| R08 | Dos aperturas simultáneas: una sola gana; un duplicado no incrementa generation ni crea segundo incidente. | PASS |
| R09 | DML runtime directo denegado, EXECUTE a `anon`/`authenticated` denegado, owner separado y FORCE RLS confirmados. F1/F2 permanecen en el recorrido de Core. | PASS |
| R10 | Nueva base del predecessor M05 con actor/sesión/epoch sintéticos: M06 aplica y conserva IDs, relaciones, generation y estado; base vacía verificada en el montaje principal. | PASS |
| R11 | Sesión nueva tras recuperación, al superar 7 días de inactividad o 30 absolutos según reloj DB, deniega Core. | PASS |
| R12 | Recuperación de datos sigue separada: M06 no restaura objetos ni altera P13; ensayo de backups/hosted queda en H6/ARCH-PENDING-002. | PASS de límite local; H6 pendiente |

6/6 pruebas formales PASS, 0 FAIL/skipped/cancelled, en base independiente. Las filas R01–R12 alcanzan el expected de H0-017 **en alcance local**; R03 y R12 conservan explícitamente el ensayo real posterior. No se halló H0-017-F01+ material y no hubo corrección ni reverificación adicional. La regresión de implementación H0-016 previa fue 259/259 PostgreSQL y 31/31 unitarios, más audit, typecheck, lint y build PASS; no se hereda como prueba formal.

No se usaron secretos, correos, Auth, factores, papel, dispositivos ni cuenta propietaria reales. No se tocó hosted. PLAN-AUTH-002/003/005/006 permanecen PENDING globalmente; H0-018 sigue NOT STARTED.
