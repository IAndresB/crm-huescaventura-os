# H6-015 — Resultado local de la variante bootstrap PG17

Fecha: 2026-10-22. **IN PROGRESS. No COMPLETED. S11 NO EJECUTADA.** Documento de evidencia; no modifica normativa ni sustituye r3.

## Resultado técnico

La variante elimina el bloqueo S05 conservando la identidad bootstrap original mediante `initdb`, sin ADMIN adicional, sustitución de grantors ni manipulación de catálogos. La carga Core/Auth/Storage se compara contra t0 antes de arrancar servicios. El nuevo candidato realiza S06–S10 en cuarentena con proveedor Auth real y datos sintéticos. La [descripción de diferencias](variant-TSK-H6-015-PG17-bootstrap-v2.md) contiene su justificación y la propuesta normativa aún no aprobada.

Ejecución final: [2026-10-22T14-52-59-084Z](../../tests/fixtures/h6-bootstrap-variant/runs/2026-10-22T14-52-59-084Z/report.json). **64 comprobaciones PASS del ejecutor**, sin errores de ejecución ni limpieza; servicios y clústeres detenidos conservando sus archivos. Esta cifra cuenta grupos identificados, no 64 criterios normativos ni aceptación integral de H6.

## Restauración y seguridad

| Recurso | Volumen t0 | Resultado previo al arranque |
|---|---:|---|
| Core | 175 tablas / 529 filas | Datos tipados, multiplicidad, NULL, decimales, historia, relaciones, catálogos y permisos coincidentes. |
| Auth | 27 tablas / 120 filas | Copia íntegra, identidad/configuración y proveedor iniciado sin migrar. |
| Storage | 10 tablas / 81 filas | Metadata íntegra y backend de bytes copiado y comprobado por separado. |

Todos los roles, atributos, grantors y opciones ADMIN/INHERIT/SET coinciden. Se conserva OID 10 y nombre fuente en cada recurso. La comparación independiente amplía la matriz efectiva con columnas, GRANT OPTION, roles builtin y privilegios de base. El rol ordinario sigue sin SUPERUSER/BYPASSRLS/CREATEROLE/CREATEDB; consultas a claves, tablas privadas/Auth y DDL no autorizado reciben SQLSTATE 42501.

Las generaciones restauradas F1/F2 se conservan deshabilitadas y se añaden generaciones propias con claves separadas, comprobadas antes de emitir. Se acredita denegación con claves antiguas y aceptación con las nuevas. No se amplían propósitos ni se confunde esta renovación con la generación de acceso del actor.

## Integración S06–S10

Auth v2.197.0 y Storage del commit `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, en loopback y con PostgreSQL por socket privado. La salida de red externa se deniega mediante aislamiento del proceso; los escenarios usan identidades `example.invalid` y canales de negocio simulados.

- Contraseña y TOTP auténticos del proveedor; sesión t0 restaurada presente antes de invalidación, después rechazada online y al renovar. Revocación del testigo t1 independiente verificada por separado.
- Un JWT antiguo conserva firma válida y plazo no vencido, pero eso no le da autoridad: el proveedor y el Core lo rechazan por sus controles respectivos.
- Dieciséis superficies HTTP positivas y denegaciones de handles cerrados, JWT importado y pruebas previamente verificadas. Los controles directos clasifican la causa y contrastan las mismas operaciones con identidad nueva y conexión viva; la denegación no modifica el testigo de datos/historia/actividad.
- Renovación concurrente sin extender actividad Core, logout local conservando otra sesión y revocación global incluyendo al emisor.
- Ambas órdenes reales de bloqueo PostgreSQL: lectura antes de revocación autorizada; revocación antes de lectura denegada. Toda lectura posterior al cierre se deniega.
- Bytes privados ya obtenidos y respuesta real de refresh retenida se deniegan tras revocar. F01 repite los tres intercalados con dos instancias de servidor y fallo HTTP503 local de logout: antes de TOTP, antes de establecer y establecimiento ya confirmado. El proveedor sigue siendo real.
- Identidad sintética real no mapeada denegada. La petición a URL Storage conocida con JWT ordinario recibe respuesta no exitosa sin bytes privados; el ejecutor no conserva su código HTTP y no lo presenta como 403 específico. Las denegaciones SQL se comprueban por separado. No se entregan URLs firmadas.

Los errores de logout provocados para las contrapruebas quedan registrados como incertidumbre; no se presentan como revocaciones exitosas. El cierre real posterior se acredita por separado y la cuarentena no se levanta.

La invalidación Core se acredita por la generación efectiva del actor: las tres sesiones/epochs t0 conservan sus filas históricas y pueden conservar `current_epoch=true` o `revoked_at=NULL`, pero su generación ya no autoriza. No se afirma borrado físico ni actualización de esos campos. La auditoría comprobó además que las cuatro sesiones antiguas del proveedor Auth ya no existen en su conjunto final.

## Objetos, importes y conciliación

| Caso | Observación comprobada | Consecuencia |
|---|---|---|
| Completo | `stored`, bytes exactos | Descarga con autoridad nueva; reautorización al entregar. |
| Ausente | `missing` | Descarga denegada; no se declara original recuperado. |
| Corrupto | `inconsistent` | Descarga denegada. |
| Formato distinto | Diferencia real MIME verificada antes de t0; `inconsistent` después | Descarga denegada. |
| Binario sin enlace completo | `verified_unlinked` al observar | Enlace explícito trazado; después `stored` y bytes exactos. |
| Huérfano | Bytes conservados, diagnóstico separado | No se inventa propietario ni se borran bytes. |

Importes y porciones recuperados exactamente: **500,00 EUR recibidos, 200,00 EUR de correspondencia verificada y 300,00 EUR pendientes de conciliación**. Son datos sintéticos; no constituyen cobros reales ni validación de conectores financieros.

El testigo t1 conserva tres contactos/efectos simulados. Tras restaurar y conciliar sigue en tres. No se ejecuta un despachador externo ni S11. Las consultas del verificador se basan en el registro independiente; una cobertura ausente no se convierte en `priorEffect=none`.

| Caso de trabajo | Estado observado | Protección final |
|---|---|---|
| Ejecución anterior acreditada | Resultado `succeeded` conciliado, replay idempotente | Pausado; nueva reclamación denegada. |
| Efecto incierto | `uncertain`, sin inferir éxito o ausencia | Pausado; repetición/start y nueva reclamación denegados. |
| Intento posterior no incluido en t0 | Cero intentos restaurados; evidencia t1 conservada | `PENDING_LEGITIMATE_RECONCILIATION_UNAVAILABLE`; pausado. No se fabrica intento/transición. |
| Ausencia de efecto acreditada | Resultado `failed` conciliado y replay idempotente | Pausado; no se autoriza reintento. |

El caso sin intento necesita una vía legítima por contratos vigentes o una decisión contractual separada. No se convierte este límite en una falta de efecto, en pérdida cero ni en permiso para reenviar. Cualquier reentrada seguirá siendo decisión del director y deberá tratar las partes pendientes por separado.

## AC-073 y AC-074

**AC-073: evidencia local parcial sustancial, sin aceptación global.** Se acredita restauración anterior al efecto, testigo externo simulado independiente, suspensión, conciliación idempotente donde existe intento, denegación de reintentos y objeto ausente mantenido como tal. El intento nacido después de t0 y el efecto incierto siguen pendientes, protegidos. El ensayo no acredita un pago/envío real, pérdida total del período t0–t1 ni continuidad Production. No se inventan objetivos RPO/RTO.

**AC-074: escenarios locales de conservación/acceso ejercitados.** Metadata/binario se tratan por separado; hay ausencia, corrupción, formato incorrecto, enlace incompleto, huérfano y URL conocida denegada. La reparación del enlace es trazable y no afirma atomicidad externa. La aceptación definitiva de la variante y de H6-015 permanece pendiente; no se generaliza a datos o infraestructura reales.

## Fallos históricos y correcciones

Todos los intentos se conservan en `tests/fixtures/h6-bootstrap-variant/runs/`, con fuentes congeladas por ejecución:

1. Alias SQL reservado en el instrumento de privilegios: 42601; corregido el alias.
2. Precondición de único rol aplicada erróneamente a mitad de globals: 42501; comprobación desplazada al preflight, sin omitir instrucciones.
3. ACL explícita por defecto frente a NULL: desigualdad textual; adquisición semántica con grantor/grantee/opción y comparación independiente.
4. Código de tipo de secuencia incorrecto al calcular ACL: gate rechazado antes de S06; corregido a `s` y preservada ACL vacía como distinta de default.
5. Denegación genérica podía confundir transporte con autoridad: gate rechazado antes de S06; clasificación y controles positivos de las mismas operaciones.
6. Ensayo de 63 checks con formato incorrecto no ejercitado realmente: [hallazgo BOOT-F06](../../tests/fixtures/h6-bootstrap-variant/review-finding-media-v1.json). Se conserva el reporte y se invalida expresamente esa cobertura. El ensayo final exige precondición MIME y estado exacto.

No se modificó código de producto, contrato, motor o proveedor para obtener PASS. Los seis diffs tracked frente a la base son heredados; el correctivo añade instrumentos, documentación y evidencia separada.

## Auditoría independiente

Otro agente y worktree, con instrumentos y expected propios, restauró las copias históricas, ejecutó contrapruebas y examinó en vivo los checkpoints del ejecutor antes de S06. La última puerta S05 dio **44/44 PASS**. La revisión final reconstruyó t0 y arrancó copias frías propias del destino parado: **254 comprobaciones válidas de adquisición más 17 de adenda**, incluidas las 175 tablas, historia conservada, campos protegidos, esquema/globals y 301.280 decisiones de privilegio. No tocó el destino original.

Su [dictamen final](../../../../h6-bootstrap-audit/crm-huescaventura-os/tests/fixtures/h6-bootstrap-independent/final-completion-1792681299653539000.json), SHA-256 `264de0a69af80b46095a956f8e69234772829462025c2eef6d540714a358fb0e`, es PASS local. La referencia exacta y el manifiesto del paquete auditor se registran también en la evidencia de esta variante. Los resultados HTTP/Auth integrados fueron revisados independientemente; no se afirma que la batería del proveedor se haya ejecutado una segunda vez por el auditor.

El auditor conservó sus propios FAIL instrumentales: uso inicial de `aclexplode` sobre ACL vacía; expectativa errónea de revocación física por `revoked_at`; expectativa incorrecta de dos referencias de intento NULL cuando el contrato conserva la del intento fallido. Las adendas se justifican contra PostgreSQL y las migraciones aprobadas, preservan el esperado anterior y no alteran el candidato para forzar PASS.

Una contraprueba focal de Storage en copia independiente dio **4/4 PASS**: el mismo objeto/URL devuelve 200 con la autoridad de servicio antes y después; con JWT ordinario sintético firmado y no vencido devuelve HTTP400 legado y cuerpo `statusCode=404`, `error=not_found`, sin bytes. Se distingue ocultación de objeto de fallo de transporte y no se inventa un 403. Esta prueba de Storage no se presenta como otra ejecución de la autenticación real del proveedor.

## Mediciones y límites

En la ejecución final: corte/copia **1,197 s**, restauración S05 **3,023 s**, verificación Auth/revocación **2,305 s**, objetos/permisos **0,301 s**, integración HTTP/concurrencia **9,252 s** y conciliación **0,178 s**. El total observado fue **215,661 s**, incluyendo **187,153 s** de espera de auditoría. No son RTO/RPO ni cifras operativas de Production.

Pérdida del conjunto capturado t0 antes de servir: cero filas y bytes respecto a esa copia, según comparación exacta. Hechos posteriores: un intento conocido no presente en t0 y un efecto incierto. La pérdida total fuera de la cobertura del testigo queda **NO DETERMINADA**; no se extrapola cero.

La [regresión](../../tests/fixtures/h6-bootstrap-variant/regression-receipt-v1.json) registra 210/210 unitarias, cero skips, typecheck y límites de importación PASS. No se repite build al no cambiar producto, dependencias o configuración de build; el build histórico no se presenta como ejecución nueva.

## Custodia y fronteras

La [custodia nueva](../../tests/fixtures/h6-bootstrap-variant/custody-receipt-v1.json) contiene **47.276 archivos / 1.801.849.702 bytes**, directorios 0700, archivos 0600, dueño comprobado, sin enlaces ni ACL allow. Inventario privado SHA-256 `8fc4c53cbb8e8340865a7f0643eac6476c4b6fd5c02f391055c196c015f269e3`. Se conserva cada original temporal; ni dumps ni configuraciones, tokens, factores o claves se incorporan a Git/Drive. Se acredita protección por permisos locales, no cifrado adicional ni política Production.

[Integridad histórica](../../tests/fixtures/h6-bootstrap-variant/historical-integrity-final-v1.json): 4.148 payloads heredados exactos y los 4.055 del R2 original verificados; el repositorio inicial conserva su estado y el inventario histórico ajeno. Candidatos y dictámenes permanecen separados.

Las auditorías del proyecto se custodiarán en el futuro en la estructura empresarial existente de Drive, cuando exista autorización expresa; no se ha subido nada ni creado carpetas remotas. El inventario de esta variante identifica por separado archivos publicables y material privado excluido.

Pendientes: adopción normativa definitiva de la variante, vía legítima del intento t1 ausente, incertidumbre del efecto, objeto faltante, decisión S11, aceptación de H6-015 y decisiones ARCH-PENDING-002/DM-PENDING-005. No se solicita intervención para un fallo técnico ordinario: el trabajo permitido llega a revisión, custodia y propuesta, conservando la cuarentena.

**STOP antes de adopción normativa, reentrada, cierre o publicación.**
