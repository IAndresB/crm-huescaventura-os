# H6-015 — Dictamen independiente de aceptación integral local

Fecha: 2026-10-22. Auditor: contexto separado `bootstrap_variant_audit`, worktree `h6-c04-audit`. Base Git `971c55d5ce5770c71284d106d3c0deecca9514b5`. **Dictamen favorable a la aceptación de la ficha en alcance local/aislado y cuarentena. H6-015 continúa IN PROGRESS; este informe no registra su cierre.**

Se recomienda al director autorizar el registro de COMPLETED exclusivamente local/aislado. No se identifica una obligación técnica local pendiente después de la integración focal de diagnóstico y su comprobación independiente. La recomendación no significa recuperación operativa íntegra, reentrada, conciliación de todos los efectos, preparación de Production ni cierre global de H6.

## Criterios y separación del auditor

Los [expected propios](../../tests/fixtures/h6-015-acceptance-independent/expected-v1.json), SHA-256 `38fd8f1c7858a9aaa2317116840b311478974e355c9c8a77da1ded31ac68d5bd`, se congelaron a las 20:47:25 UTC, antes de observar la matriz del ejecutor. Extraen literalmente las quince asignaciones de Tasks §6, cuatro dependencias, seis integraciones entrantes, S01–S13 y catorce controles transversales. Las fuentes normativas conservan los hashes congelados. No se importó el generador del ejecutor para validar su matriz.

La independencia es de contexto, expected, instrumentos, worktree y adquisición SQL. Auditor y ejecutor usan la misma máquina y familia de herramientas; no se afirma una auditoría organizativa externa. Los paquetes anteriores sellados de 33 y 3 archivos permanecen intactos. Los recursos privados del ejecutor solo se leyeron; la adquisición nueva arrancó una copia fría propia, exclusiva y sin escucha TCP, con transacciones de solo lectura. No se invocaron operaciones de negocio ni se repitieron Auth/Storage o baterías generales desde el auditor.

## Alcance normativo íntegro

La ficha exige integridad y conciliación verificadas, pérdidas/tiempos observados y límites documentados ([Tasks:2464](tasks.md:2464), especialmente 2473–2476). El esperado incluye suspensión de automatismos sensibles, no duplicación, original ausente no recuperado, reservas/aprobaciones no liberadas y sesiones revocadas no revividas. La jerarquía documental se conserva ([Constitución:9](../../docs/constitution.md:9)).

| Asignación exacta de Tasks §6 | Conclusión de auditoría en el tramo H6-015 |
|---|---|
| SPEC-FR-HIST-004 — 2706 | SATISFACTORIA LOCAL: metadata/bytes separados, objetos incompletos visibles, historia y permisos conservados. |
| SPEC-FR-IDEMP-002 — 2723 | SATISFACTORIA LOCAL: identidad estable, replay y contraste de contador externo; ningún intento ausente fabricado. |
| SPEC-FR-ERR-002 — 2733 | SATISFACTORIA LOCAL: resultado incierto protegido; denegación real de reintento y fallo diagnóstico sin alterar negocio. |
| AC-073 — 2824 | SATISFACTORIA LOCAL: cuatro casos conciliados o mantenidos en cuarentena según evidencia; N03 innecesario. |
| AC-074 — 2825 | SATISFACTORIA LOCAL: bytes/metadata/permisos, missing/corrupt/MIME, enlace incompleto y huérfano explícitos. |
| SPEC-NFR-005 — 2848 | SATISFACTORIA LOCAL: procedimiento, responsables, copia recuperable, restauración real, mediciones y límites documentados. |
| SPEC-NFR-014 — 2857 | SATISFACTORIA LOCAL: integración restaurada H5-017 ahora acreditada con E1–E8 y excepción E4, lectura protegida y recuperación segura. |
| SM-FORB-27 — 3100 | SATISFACTORIA LOCAL: intentos prohibidos rechazados; incertidumbre no transformada en éxito ni reintento sensible. |
| ARCH-DEC-010 — 3121 | SATISFACTORIA LOCAL: Storage privado y autoridad efectiva al entregar; no se infiere permiso de conocer identificador/URL. |
| ARCH-DEC-017 — 3128 | SATISFACTORIA LOCAL: clústeres/servicios exclusivos, secretos sintéticos y aislamiento; ninguna autoridad real. |
| P13 — 3142 | SATISFACTORIA LOCAL: 68 migraciones idénticas a la base, r4 aceptado; esquema/ACL y roles sin modificación adicional. |
| PLAN-DEC-008 — 3162 | SATISFACTORIA LOCAL: PostgreSQL/Auth/Storage reales en los recorridos afectados; dobles reservados a frontera externa y entradas semánticas declaradas. |
| PLAN-B10 — 3173 | SATISFACTORIA LOCAL: diagnóstico recuperado, referencias minimizadas, evidencia y límites de entrega. |
| PT-12 — 3207 | SATISFACTORIA LOCAL: recuperación, continuidad protegida, historia, objetos y no duplicación del tramo asignado. |
| D017 — 3280 | SATISFACTORIA LOCAL: identidades/versiones/relaciones e historia recuperadas; sin limpieza ni retención inventada. |

La [matriz del ejecutor](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/tests/fixtures/h6-015-acceptance/acceptance-matrix-v1.json) queda vinculada por SHA en el recibo independiente; se consulta en su worktree identificado. Las quince filas tienen referencias a controles ejecutados y hashes contrastados. No se extiende su satisfacción al requisito global compartido con otras tareas.

Las cuatro actas de H5-019, H6-006, H6-008 y H6-014 conservan sus hashes y cierre local. La aceptación vigente de N01/N02, r4, C04→B07, C07, AC-073 local y AC-074 local se respeta: no se reabren como decisiones pendientes. Se verifican las integraciones adicionales de H0-009 (Tasks:433), H1-013 (822), H1-015 (857), H5-007 (2003), H5-009 (2038) y H5-017 (2181). Estas remisiones no crean dependencias globales circulares ni obligan a repetir sus baterías completas; Tasks:234 distingue dependencias e integraciones posteriores.

V-DOM/V-DAT/V-AT/V-NEG/V-EVI se apoyan en expected independientes, evidencia real vigente y contrapruebas conservadas. V-MIG se acredita con cadena68 y catálogos, sin nueva modificación estructural; no se exige una migración para cada registro ordinario autorizado. SM-FORB-27 es la prohibición concreta asignada ([State machines:742](../../docs/state-machines.md:742)). PLAN-DEC-008 ([Plan:89](plan.md:89)) impide sustituir permisos/concurrencia/rollback por mocks; aquí no se sustituyeron. P13 ([Constitución:67](../../docs/constitution.md:67)) no se interpreta como permiso general para intervenciones administrativas.

## Comprobaciones nuevas e integridad

- **4.515 controles documentales/hash PASS**, incluyendo 4.390 entradas de payload en ocho manifiestos históricos, 68 migraciones y diez contrapruebas del verificador en memoria. No son 4.515 pruebas funcionales nuevas ni un inventario deduplicado.
- **2.834 controles independientes de custodia/adquisición/SQL PASS** en una copia propia. Incluyen rehash de los 2.610 archivos del último recurso focal custodiado, 175 tablas leídas en SQL y comparación completa con la foto final. No son 2.834 escenarios de negocio.
- La focal del ejecutor conserva **20/20 controles integrados PASS**. Sus cinco fuentes capturadas y hashes se contrastan; el comportamiento revisado es el código efectivamente ejecutado. Las pruebas anteriores B (64), C04 R2 (27) y C07 (22 regresiones), así como los FAIL, no se sobrescriben ni se vuelven a presentar como nuevos ensayos.

La lectura independiente de las 175 tablas encontró **167 idénticas** desde recepción de la copia hasta el final; solo cambian ocho: claves F1/F2, actor, sesiones, epochs, revocaciones, intentos de revocación y observaciones B10. Se conservan todas las filas previas, salvo desactivación de claves anteriores y aumento explícito de generación/fecha del actor. Hay una nueva clave distinta por familia, dos sesiones/epochs y dos revocaciones/intentos, y nueve observaciones diagnósticas. No hay cambio de B08, HA, finanzas, evidencia C04 ni relaciones de negocio.

Roles, bootstrap, grantors, membresías ADMIN/INHERIT/SET, configuración por rol/base y ACL de parámetros coinciden con la adquisición independiente C04 anterior. El dump de esquema/ACL final coincide con el anterior de esta focal, excluyendo únicamente las directivas aleatorias soportadas `\restrict`/`\unrestrict` de pg_dump. Cuatro trabajos permanecen pausados, el sujeto de prueba tiene cero sesiones Core efectivas y cero sesiones Auth. La garantía Core se verifica por generación y epoch; no se presupone invalidación universal inmediata de todo JWT emitido.

El comparador del ejecutor informa 169 tablas iguales durante el lote diagnóstico, entre revocaciones. El recuento independiente 175/167 cubre toda la focal y ambas familias de claves; son denominadores e intervalos distintos, no una discrepancia de integridad.

## Diagnóstico y límite de su cobertura

La laguna histórica era real: H5-017 exige integración con H6-015 ([Tasks:2178](tasks.md:2178)–2181), y NFR-014 exige E1–E8 distinguibles y recuperación segura ([SPEC:606](spec.md:606)). Las dieciséis superficies HTTP anteriores no probaban este puerto.

El nuevo recorrido utiliza Auth/TOTP real, F1/F2 nuevas, runtime ordinario, escritor y lector H5017 existentes sobre Core recuperado. Las nueve observaciones se leen por requestRef y referencian una ejecución restaurada existente; códigos, estados conocidos y siguiente paso conservan su semántica. La excepción con resultado desconocido permanece E4; el registrador indisponible no transforma el resultado ni repite el efecto. Identidad inválida/revocada y raíz no disponible son denegadas; logs y filas diagnósticas no conservan el canario ni campos libres ajenos.

E7/E8 son entradas semánticas controladas al puerto; el estado unknown/inconsistent restaurado es contexto, no un clasificador nuevo ni prueba de que unknown equivalga a ambigüedad de identidad. E6 usa un doble de canal indisponible. Se acredita integración de persistencia/lectura diferenciada; se reutiliza cobertura de dominio inalterada. No se pretende un ensayo nuevo de Storage, una nueva frontera HTTP ni una segunda restauración lógica S05. Con estos límites explícitos la obligación local NFR-014 y la integración H5-017 quedan satisfechas.

## Mediciones, procedimiento y decisiones pendientes

S01–S09 y el contraste S10 se apoyan en restauración PG17 v2 y comprobaciones afectadas posteriores. **S11 permanece reservada y no ejecutada.** S12 solo acredita mediciones antes de S11, sin declarar ejecutado el nodo JSON que requiere `explicit_reentry`; S13 acredita este expediente y STOP, sin fingir recorrer toda la cadena instrumental. El texto de r4 distingue el catálogo instrumental de nuevas obligaciones; Tasks exige medir el ensayo, no reentrar para aceptar su protección local.

Las medidas monotónicas y UTC coinciden con el informe histórico: S05 3,023 s; total 215,661 s, que incluye 187,153 s de espera de auditoría. La ventana interna de corte es 1,152 s; la fase corte/copia, 1,197 s. El conjunto medido comprende Core 175 tablas/529 filas, Auth 27/120 y Storage 10/81; cinco objetos copiados, 110 bytes, y 2.361.619 bytes de los tres dumps. Versiones: PostgreSQL 17.11, Auth v2.197.0 y commit Storage registrado. Volumen mínimo sintético: no se extrapola capacidad productiva.

Cero pérdida respecto del conjunto t0 capturado no significa cero pérdida de todo t0–t1. Se conserva un intento ausente y un efecto incierto identificados; la pérdida exterior al testigo es NO DETERMINADA. Las porciones de 500,00/200,00/300,00 EUR sintéticos se mantienen exactas; objeto ausente no declarado recuperado. No se inventan RPO/RTO, cadencia ni capacidad Production ([r4:707](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/procedure-TSK-H6-014-r4.md:707), [Tasks:3327](tasks.md:3327)).

N03 sigue innecesario para AC-073 local; solo sería una decisión distinta para una futura capacidad B08 sin intento original. El efecto incierto necesita evidencia suficiente, no una ampliación contractual por sí sola. Se mantienen bloqueadas las continuaciones dependientes, S11, datos/secretos/autoridades reales, Hosted/Production, efectos externos, publicación, despliegue y Drive. ARCH-PENDING-002 y DM-PENDING-005 permanecen OPEN. El único paso propuesto ahora es la decisión expresa del director sobre el cierre local; el auditor no la aplica.

## Custodia y conservación de fallos

La custodia nueva del ejecutor contiene 5.219 archivos de ambos ensayos; este auditor rehashó directamente los **2.610 archivos / 92.025.279 bytes del recurso final** y verificó propietario, modos 0700/0600 y ausencia de ACL allow. La comprobación del conjunto de ambos ensayos se atribuye al recibo del ejecutor, sin afirmar un rehash independiente mayor.

Los dos clústeres privados propios quedan detenidos y preservados, también los del FAIL instrumental. [Custodia del auditor](../../tests/fixtures/h6-015-acceptance-independent/custody-v1.json): **5.210 archivos / 179.876.380 bytes**, originales conservados, copia persistente rehasheada, dueño comprobado, directorios0700/archivos0600, sin ACL allow. Inventario privado SHA-256 `6135a6330035c27e9cc81bf0786969c3e48fa006c1d6e723ef2bbc9f4632ec59`. No se afirma cifrado adicional, almacenamiento WORM ni política Production. Secretos, snapshots y dumps quedan fuera de Git y del manifiesto público.

FAIL conservados en este bloque: el ejecutor esperaba página vacía ante raíz no disponible; el contrato deniega. El auditor usó un alias SQL que sombreaba el alias del lector y serializaba un escalar, y su primer verificador documental esperaba Path pero recibió `__file__` como texto. Los instrumentos originales y sus recibos permanecen; revisiones v2 corrigen únicamente esas equivocaciones. No hay cambio de producto, de autoridad ni del esperado normativo para obtener PASS.

**Recomendación definitiva independiente: aceptar la matriz integral y autorizar el registro de H6-015 como COMPLETED exclusivamente local/aislado y en cuarentena. Estado actual IN PROGRESS, cierre no aplicado. STOP antes de cierre formal, reentrada, publicación o cualquier operación reservada.**
