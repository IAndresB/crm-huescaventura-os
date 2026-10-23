# H6-015 — Dictamen independiente de adopción r4 e integración C04→B07

Fecha: 2026-10-22. Base Git: `971c55d5ce5770c71284d106d3c0deecca9514b5`. Auditor: worktree separado `h6-c04-audit`. Ejecutor: `h6-c04-integration`.

**Dictamen favorable para el alcance local autorizado del candidato R2. No es aceptación integral ni cierre de H6-015, que permanece IN PROGRESS.** N01/N02 y adopción controlada r4 están aprobadas. N03, S11, datos y autoridades reales, Hosted/Production, publicación y despliegue siguen fuera de este alcance.

Candidato exacto del ejecutor: manifiesto de 35 archivos `768b3fb290f3d564df5f6fdce637fbb4f6ae2e4c804fa168fa9e9bd1361bacdf`, con run final `2026-10-22T16-46-33.825Z`. Se verificaron los 35 payloads y su identidad con las fuentes ensayadas. También siguen íntegros los 14 archivos del paquete auditor anterior, manifiesto `0aac3c814a4fe58e5613e4a89c82538ae069f7c9a7b9fb88880ccfd6ccd03316`.

## Independencia y método

Revisión realizada por un agente auditor distinto, con worktree, expected y herramientas propios. No se modificaron archivos del ejecutor. Es separación instrumental y de contexto en el mismo equipo; no equivale a certificación humana externa.

Los 22 criterios iniciales se congelaron antes de examinar el candidato. Las interpretaciones y adendas posteriores están versionadas; la política de datos se derivó de las operaciones autorizadas y migraciones antes de la adquisición SQL propia. Ningún FAIL se sobrescribió. Los resultados esperados de metadatos se derivaron del testigo original y de los contratos, sin adoptar el snapshot del ejecutor como autoridad única.

Se crearon dos copias frías propias desde custodia persistente verificada. Solo se arrancaron las copias, mediante sockets Unix y sandbox de red local. Las consultas se ejecutaron en modo lectura. Se adquirieron datos tipados, indicadores SQL NULL, roles, grantors, membresías y opciones, configuración de roles, esquema con restrict-key fijo, catálogos adicionales y privilegios efectivos. Los payloads completos permanecen en custodia privada.

## Resultado técnico

- Las 175 tablas Core conservaron identidad y tipos. Las filas aumentaron de 817 a 875 exclusivamente por las operaciones identificadas.
- 164 tablas permanecen exactamente iguales; las otras 11 contienen los cambios autorizados de B07 y seguridad. El subconjunto de negocio del ejecutor comprende 163 tablas sin alteraciones. B08, HA, finanzas e historial previo se conservaron íntegramente.
- Siete registros B07 nuevos corresponden a siete enlaces, siete operaciones y siete entradas de historia, cada conjunto relacionado 1:1. Son cinco candidatos y dos revisados. **No son siete efectos externos.**
- Los siete registros conservan la observación exacta del ledger, su identidad y ocurrencia, fuente con hash, contexto existente, cobertura, recepción, preservación manual, revisión cuando procede y actor efectivo. Se distinguieron las fechas del hecho y del nuevo registro. El ledger permanece byte a byte idéntico.
- No se creó el intento ausente de t1 ni se aplicó resultado B08. El efecto incierto continúa unknown; cuatro trabajos siguen pausados. No se liberaron reservas ni reactivaron automatismos.
- Se añadieron nueve sesiones/epochs y cinco revocaciones con cinco intentos de revocación. Las filas anteriores permanecen exactas. Un actor cambió únicamente generación y fecha de actualización; el incremento coincide con las cinco revocaciones.
- F1/F2 mantienen las claves antiguas deshabilitadas y una nueva clave/generación independiente habilitada por familia. No se publicaron sus valores.
- Roles, grantors, ADMIN/INHERIT/SET, configuración de roles, esquema Core y catálogos resultaron iguales. Coinciden **255.510 celdas de privilegios efectivos**, incluidos permisos de concesión y columnas.
- La generación Core final deja cero sesiones efectivas. Auth tiene cero sesiones del subject revocado. La única sesión de otra identidad sintética conserva exactamente su estado anterior; logout global del usuario no significa borrar todas las sesiones de todos los usuarios.

La adquisición independiente del estado final coincide también con el snapshot del ejecutor. No se reiniciaron los originales custodiados.

## Fallos y correcciones

**C07, defecto real de implementación, corregido.** La primera contraprueba independiente demostró que modificar request.input durante la espera podía devolver verified después de persistir candidate. El resultado FAIL original se conserva. C04 ahora captura input y revisión anidada antes del await y usa esa misma captura al registrar y devolver el estado. Se mantienen firma, contrato y significado de estados.

Seis contrapruebas propias posteriores pasan: añadir, retirar o sustituir revisión; reemplazar input; mutar revisión anidada, tanto desde candidate como reviewed. Son pruebas unitarias del límite asíncrono, no pruebas SQL/Auth. El ejecutor añadió dos casos con locks SQL reales y dos regresiones permanentes. Su ensayo final tiene 27/27 PASS y la regresión focal 22/22, sin skips; hashes de fuentes, TypeScript y límites se cotejaron con sus recibos.

**Dos errores instrumentales del auditor conservados.** La adquisición general completó 375 controles PASS, pero la consulta final utilizó closed_at en crm_sessions; el esquema coloca ese campo en identification_epochs y utiliza revoked_at en crm_sessions. La adenda focal corrigió la consulta conforme a la migración, sin repetir ni alterar la adquisición sellada. De sus 77 controles, 76 pasaron y el restante exigió incorrectamente que Auth no tuviera sesiones de ningún usuario. Esa condición excedía la política congelada, que decía «para el subject». Otra adenda verificó cuatro controles PASS: lectura aislada de ambos destinos, ausencia de sesiones del subject y conservación exacta de la sesión ajena. Los dos informes FAIL permanecen intactos y no se contabilizan como PASS íntegros.

Los FAIL del ejecutor y candidatos anteriores también permanecen conservados. No se encontraron defectos pendientes del producto dentro del alcance auditado.

## Revisión de contratos, fuentes y límites

La composición usa EvidencePort y el adaptador B07 existentes. Conserva metadata C04 serializada en el campo claim permitido, exige identidad/sesión/MFA y contexto vinculado, y deja la autoridad durable a B07/C03/F1/F2. Rechaza afirmar preservación original de bytes cuando solo ha registrado una observación manual. La certeza reviewed y el estado C04 verified expresan revisión del registro, no éxito de un efecto ni adopción de un resultado de negocio.

Se revisaron las dos carreras SQL con revocación, replay equivalente y conflictivo, lectura sin vínculo, contexto no ligado, fuente incorrecta, falsa revisión, preservación original no sustentada, incertidumbre y sesión revocada. La integración usa Auth local real y TOTP; esta auditoría comprobó su código y evidencia, y obtuvo readback SQL propio, sin repetir por separado el proveedor HTTP. Tampoco se acredita una nueva ejecución HTTP de las 16 superficies ni de Storage, ni un nuevo cotejo completo de catálogos Auth. Se conservan sus pruebas históricas con su alcance original.

El cuerpo operativo del r4 adoptado coincide exactamente con el borrador aprobado; solo cambia la cabecera de vigencia. r3 conserva SHA-256 `906cf7a451d0c85f6d5bc0ff91ce776ef9cec786d896a3620b7019cfc667ba70`. No hay modificación de Constitución, Architecture, SPEC, Plan o contratos aprobados por este correctivo.

La matriz de 22 criterios y la revisión de 18 controles de fuentes están en `tests/fixtures/h6-c04-independent/acceptance-matrix-v1.json` y `source-review-v1.json`. Sus PASS se limitan expresamente a la evidencia indicada.

## Custodia y estado final

Se rehashearon independientemente **10.437 archivos privados del ejecutor, 369.092.969 bytes**, incluidas sus copias originales temporales. Los inventarios previos y final coinciden con `02471dcf9c06f1e6b3e67386f2a5d2aa0713868531202c4e84c942156768c0b0` y `0d4ea99915d1a20edfe57670dfe250d0be3440dfc047cf975e054ac5cd82ec04`.

Los recursos del auditor se copiaron y rehashearon en `/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-c04-independent`: **5.222 archivos, 256.675.523 bytes**, inventario `c381e67a6ec183c48e65f1f69dafacf78bd9c8d1e2be294c416c5ea3daf7133e`. Directorios 700, archivos 600, propietario comprobado, cero ACL permisivas. Se conservaron los originales. No se afirma cifrado ni WORM. Todos los clústeres del auditor y los recursos del ejecutor revisados están detenidos.

El manifiesto público del auditor contiene únicamente documentos, instrumentos, expected y resultados sin payloads privados. Quedan fuera clústeres, tablas completas, configuración, claves, tokens, secretos y datos de identidad detallados. Git base y ausencia de staging/modificaciones de archivos rastreados se comprobaron; no se hizo commit, push, publicación ni carga a Drive.

AC-073 avanza en conservación y asociación persistente de t1. Sigue pendiente la conciliación integral del resultado sin intento y la resolución sustentada de la incertidumbre. AC-074 mantiene su cobertura local previa; este bloque no la amplía mediante una prueba Storage nueva. ARCH-PENDING-002 y DM-PENDING-005 continúan OPEN.

**STOP antes de N03, S11, recursos reales, cierre integral o publicación.**
