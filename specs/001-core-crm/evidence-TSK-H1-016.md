# TSK-H1-016 — verificación formal independiente de objetos privados

2026-09-30. Derivada de las mismas fuentes APPROVED enumeradas en H1-015 y de la ficha H1-016 antes de assertions formales; no hereda PASS focal. V-DOM/V-DAT/V-MIG/V-EVI y V-AT/V-NEG aplicables. Estado inicial: clúster Core efímero, servicio oficial Supabase Storage aislado en loopback, bucket privado, Document sintético y sesión F1/F2 vigente. Cada rechazo debe contrastar desde otra conexión ausencia de efectos indebidos. Cada fila usa referencias y bytes sintéticos distintos.

| ID | Expected previo / falsación |
|---|---|
| R01 | Prepare sin bytes permanece prepared, no conservado. |
| R02 | Upload sin acreditación permanece present_unverified y sin vínculo. |
| R03 | Bytes correctos: digest/tamaño/media observados, verified_unlinked; vínculo explícito → stored. |
| R04 | Objeto ausente/referencia sola → missing; reparación no inventa bytes. |
| R05 | Mismo path con bytes/tamaño/media distintos → inconsistent, acceso denegado. |
| R06 | Fallo después upload antes metadata/vínculo no borra bytes ni finge rollback distribuido; repair converge. |
| R07 | Metadata anterior a objeto se repara después de carga real. |
| R08 | Replay tras respuesta perdida no duplica; mismo operation/material distinto conflict. |
| R09 | Sustitución usa expected version, nuevo path/version, preserva original e historia. |
| R10 | Dos contextos conservan una versión/binario; tercero/scope ajeno no lee por ID/path. |
| R11 | Autorización incluye finalidad/contexto; sin sesión/MFA/actividad/generación actual deniega. |
| R12 | Revocación antes o durante download impide entrega; permiso no se hereda de URL previa. |
| R13 | Servicio Storage real: bucket privado, petición anónima/directa sin autoridad denegada. |
| R14 | URL nativa firmada separada: observar comportamiento real tras revocación sin declarar revocable si sigue válida. Aplicación usa acceso reautorizado aprobado, no entrega esa URL. |
| R15 | Huérfano real diagnosticado needs_review, sin asignación/inferencia/borrado automático. |
| R16 | Carreras prepare/accredit/link/replace/repair producen un solo efecto consistente. |
| R17 | Fallo historia revierte todo el Core, conservando el estado Storage que realmente exista. |
| R18 | V-MIG base vacía/upgrade, fallo inyectado y retry; fixtures anteriores intactos; RLS/FORCE/owner/ACL comprobados. |
| R19 | Sin secretos/URL temporal persistidos; ningún fixture configura límite/retención comercial. |
| R20 | Regresión H0/H1-001–014 completa PASS; PLAN-AUTH-003/DM-PENDING-005, hosted/Production pendientes. |

## Observed final independiente

**R01–R20 PASS local/aislado, 7/7 pruebas agrupadas.** Matriz anterior fijada antes de inspeccionar las assertions relevantes; no se hereda el PASS de H1-015. Archivo ejecutable `tests/integration/postgres-h1-016.test.ts`, clúster Core independiente del focal, conexión `second` separada para contraste persistido, bucket privado distinto y servicio oficial Storage real. Detalles/commit del servicio y reproducibilidad en [H1-015](evidence-TSK-H1-015.md#entorno-real-aislado-reproducible).

| Filas | Observed comprobado | Resultado |
|---|---|---|
| R01/R02 | Prepare sin bytes; upload presente no acredita ni vincula; rechazo de descarga previa. | PASS |
| R03 | Digest SHA-256 sobre bytes obtenidos, tamaño/media exactos en Core; acreditación separada y link explícito; binario descargado idéntico. | PASS |
| R04/R07 | Referencia sin bytes → missing; no falsa conservación, carga posterior + reconciliación reparan. | PASS |
| R05 | Corrupción real mediante inyección de fixture sobre mismo path, tamaño/media incompatibles → inconsistent; descarga denegada. Borrado entre acreditar/link rechaza link sin operación/linked_at; reparación posterior segura. | PASS |
| R06/R17 | Trigger fault historia tras upload/link: efecto Core/resultado no persisten desde otra conexión; bytes Storage sí sobreviven; mismo retry después del fault completa. | PASS |
| R08 | Resultado post-COMMIT descartado y retry devuelve replay; operationId con material diferente rechaza, una versión/operación/historia. No se afirma inyección física de corte de red. | PASS |
| R09 | Competencia por sucesor esperado tiene único ganador; nuevo path/predecessor; original conserva bytes accesibles. Evidence original fijada a versión precisa; rebind a sucesor rechazado sin reatribución. | PASS |
| R10/R11 | Dos contextos autorizados reutilizan objeto; tercero/finalidad ajena no leen; F1/F2 firmadas independientemente con scope falso rechazan. Los negativos de MFA/sesión/generación y guardas F1/F2 se ejecutan además en regresión H0, sin cambiar sus contratos. | PASS |
| R12 | revokeAll con autoridad aún emitida deniega descarga y prepare; revokeOne durante get real impide entregar bytes por segunda comprobación; nueva identificación legítima permite acceso. | PASS |
| R13 | Bucket privado real: service credential sintética accede, petición anónima/public/direct/sign sin credencial no; JWT anon/authenticated firmado con clave sintética tampoco accede. | PASS |
| R14 | Signed URL nativa de fixture: 200 antes y después de revocar Core; rechaza tras 3 s de expiración. No es revocable por Core. Contrato de aplicación no emite esta URL: acceso reautorizable de Plan §6.3. Validez técnica diferenciada de permiso CRM. | PASS con límite nativo explícito |
| R15 | Bytes sin metadata Core: inventario y diagnóstico needs_review repetibles; binario conservado, sin inferir dueño/Document ni limpiar. | PASS |
| R16 | Prepare, accredit, link y repair equivalentes concurrentes convergen/replay; sustituciones incompatibles tienen único ganador. | PASS |
| R18 | Tres tablas owner separado, RLS/FORCE; runtime directo/SET ROLE denegados; no table grants PUBLIC/anon/authenticated/runtime. Cadena vacía y upgrade previo, fixture conservado, fault DDL revierte, reapply correcto. H1-013/014 sigue PASS. | PASS |
| R19 | Referencia estable sin signed URL; revisión focal sin claves privadas/secretos reales/URLs firmadas en logs; tamaños/MIME/3 s solo fixtures. No TTL/límite/borrado operativo implementado. | PASS |
| R20 | Regresión 321/321 PostgreSQL y 67/67 unitarias, build/typecheck/fronteras/audit/install/diff PASS. H1 previa/H0 intactas; pendientes globales conservados. | PASS |

## Historial de defecto material

### H1-016-F01 — vínculo tras acreditación obsoleta — CLOSED localmente

- **Fuente/expected previo:** E02/E03 y R03/R05; SPEC-FR-HIST-004, SPEC-FR-CONC-004, AC-074. Objeto ausente/diferente no debe presentarse conservado.
- **Observed inicial / FAIL de revisión:** la primera implementación de `link` confiaba solo en el estado Core acreditado anteriormente y no volvía a leer bytes. La revisión formal identificó la ventana acreditar → desaparición/corrupción → vínculo. Este antecedente es un FAIL de inspección; no se presenta como una ejecución histórica de test que no se realizó.
- **Reproducer conservado:** R05 acredita, elimina el objeto por la API real únicamente como inyección adversarial del fixture, intenta link, comprueba rechazo, `linked_at` null y operación ausente desde otra conexión. Después observa missing/repara. La aplicación no incorpora delete/upsert.
- **Materialidad/alcance:** podría registrar conservación usando una observación obsoleta; defecto localizado en H1-015, sin decisión nueva.
- **Corrección:** link realiza get real y compara digest/tamaño/media antes de la unidad Core y su revisión esperada; no se abre transacción durante Storage.
- **Reverificación:** matriz completa independiente 7/7 PASS y regresión completa 321/321 PASS, incluido R05. Expected original conservado. Ningún Fxx material abierto.

Dos fallos de preparación del harness se preservan como antecedentes separados: F2_REVOKE_DENIED al omitir `session-revocation` de la configuración sintética; F2_DENIED al intentar provisionar segundo Administrador, prohibido por el modelo aprobado. Se corrigió únicamente el harness: propósito sintético requerido y prueba cross-scope con capabilities firmadas independientes, sin segundo Administrador. No se debilitó expected ni se alteró autorización productiva.

## Alcance y pendientes

V-DOM/V-DAT/V-MIG/V-EVI y V-AT/V-NEG pertinentes acreditados localmente. Core y Storage reales aislados, Auth sintética H0; no mock acredita existencia/integridad. La instrumentación de revocación durante get invoca la lectura real antes de revocar.

PLAN-AUTH-003 permanece **PENDING globalmente**; el subset objetos local acredita acceso reautorizable, no revocación Auth/hosted ni todas las superficies H6. PLAN-AUTH-001–006, DM-PENDING-005 y límites/privacidad reales conservan pendientes. Sin hosted, Staging real, Production, documentos/PII reales ni secretos productivos nuevos. H1 IN PROGRESS; H1-017 y posteriores NOT STARTED.


## Resultado y regresión final — 2026-09-30

**COMPLETED exclusivamente local/aislado.** Expected anterior intacto; focales H1-015 4/4 PASS; verificación independiente H1-016 7/7 pruebas agrupadas / R01–R20 PASS. H1-016-F01 cerrado localmente; ver detalle/historial en evidencia independiente.

| Comprobación real | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | PASS; lockfile sin cambios |
| `pnpm audit --prod` | PASS; sin vulnerabilidades conocidas |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` | PASS; fronteras |
| `pnpm test` | 67/67 PASS |
| `POSTGRES_H0_BIN=… pnpm run test:postgres` | 321/321 PASS, 0 failed/skipped/cancelled; 398729.818125 ms; cadena H0 y H1 previa más nuevas focales/formales |
| `pnpm run build` | PASS |
| `git diff --check` | PASS |
| Búsqueda focal de claves privadas, secretos productivos, endpoint hosted y logging token/URL firmada | Sin coincidencias en archivos del bloque |

No se modifica expected para conseguir PASS. Último Approved Commit documental `3e3f47a1692290412a03cf14087c2c470b8cab90` conservado; los commits técnicos de este bloque no lo sustituyen. H1 IN PROGRESS; H1-017 y posteriores NOT STARTED.
