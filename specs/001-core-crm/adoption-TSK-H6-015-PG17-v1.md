# H6-015 — Expediente de adopción PG17 y conciliación, v1

2026-10-22. **PROPUESTO; NO APROBACIÓN NORMATIVA. H6-015 IN PROGRESS.** Responsable de decisión: Andrés. No S11, cierre, publicación ni modificación de fuentes aprobadas. Base Git: `971c55d5ce5770c71284d106d3c0deecca9514b5`. Worktree separado: `h6-adoption-reconciliation`.

## Resultado y alcance

La aceptación técnica del director de PG17 v2 permite preparar la adopción, no promulgarla. Se propone [r4](procedure-TSK-H6-014-r4-proposed.md), copia sucesora diferenciada de r3 con [cambios exactos y hashes](changes-TSK-H6-014-r4-proposed.json) y [diff completo](changes-TSK-H6-014-r4-proposed.patch). El original, expected, manifiestos, FAIL y dictámenes no se modifican. Ningún código de producto ni contrato cambia en este bloque.

La vía vigente para t1 ausente es conservar evidencia y revisión con suspensión. No existe en B08 un comando de adopción del resultado sin su intento/reserva. No hace falta inventar ese comando para documentar la discrepancia; sí requeriría decisión y especificación previa si se pretende convertirla en resultado aplicado al trabajo restaurado.

## Contraste con fuentes superiores

Los hashes consultados quedan congelados en [expected previo](../../tests/fixtures/h6-adoption-reconciliation/expected-v1.json).

| Fuente | Obligación y efecto sobre la propuesta |
|---|---|
| Constitución P04/P06/P07 | Especificación antes de implementación contractual, trazabilidad y conservación de historia. r4 es borrador; no fabricar un intento t1 ni reemplazar evidencia. |
| Constitución P10/P12 | Identidad y autoridad preservadas, sin ampliación; secretos fuera de Git. Globals derivados y dumps siguen privados. |
| Constitución P13 | No modificar estructura CRM por atajos. initdb soportado y restauración de SQL aprobado no son una migración correctiva de negocio. Una evolución contractual/esquema futura requerirá su proceso de migración. |
| Constitución P14/P18/P19 | Automatismos auditables, aceptación con pruebas y documentación fiel. Pendiente protegido no equivale a conciliación íntegra ni COMPLETED. |
| Architecture §15 | Datos, objetos, identidades/configuración, referencias e idempotencia recuperables; efectos suspendidos hasta conciliación. ARCH-PENDING-002 sigue abierto. |
| SPEC-FR-HIST-004 | Conservación y reparación trazables; sin falsa atomicidad entre metadata y bytes. |
| SPEC-FR-IDEMP-002 y SPEC-FR-ERR-002 | No repetir ante incertidumbre; timeout no acredita fracaso; revisión/aprobación manual no constituye prueba de ausencia. |
| SPEC-FR-INT-003 | Resultado externo verificable vinculado a su ámbito, conservando referencias e historial. |
| Plan §§10.1, 11.3 y PLAN-C04 | Copia/recuperación verificable y evidencia con fuente, tiempos, alcance y revisión; adjuntar evidencia no confirma hechos automáticamente. |
| Tasks TSK-H6-015 y §6/§7 | Dependencias H5-019/H6-014/H6-006/H6-008; B01/B05/B07/B08/B09/B10, C01/C03/C04/C05, T05/T07/T08/T09. No se reduce esta asignación con los tests focales. La ficha histórica NOT STARTED no se altera: IN PROGRESS es el estado operativo autorizado separado. |
| D037/D038/D039 | Generaciones F1/F2 y autoridad de ejecución/finalización se conservan; ninguna clave o identidad restaurada autoriza por sí sola. |
| H6-014 r3 S05/S07/S10/S11 | Dos restricciones S05 necesitan adopción expresa; S07 debe reflejar composición R2; S10 ya prescribe C04 y suspensión para intento ausente; S11 queda reservado. |

Las dependencias localmente aceptadas no se reabren ni se vuelven a declarar completadas mediante estas pruebas. El expediente hereda la trazabilidad del candidato PG17 v2, aceptado solo en cobertura demostrada.

## Decisiones propuestas exactas

**N01 — Identidad bootstrap.** Aprobar que, en un destino nuevo y exclusivo PostgreSQL 17 compatible, initdb cree el bootstrap con el nombre fuente y que una lectura independiente acredite OID 10. La exclusividad corresponde al recurso/directorio/socket, no a un nombre de rol diferente. No forzar OID ni escribir catálogos. Core y Storage conservan cada uno su identidad fuente; no se mezclan globals.

**N02 — CREATE ya satisfecho.** Aprobar únicamente la sustitución de una sentencia exacta CREATE ROLE del bootstrap por una aserción bloqueante de identidad/OID/superusuario. Exigir original inmutable, coincidencia única, derivación reversible y hashes de bytes no sustituidos. ON_ERROR_STOP y transacción. Todos los ALTER, configuraciones, membresías y grants se ejecutan. Preflight sin roles adicionales; comparación final íntegra sin excluir autoridades residuales. Cualquier otra colisión, formato no admitido o diferencia bloquea, no se ignora.

**E01/E02 — Alineaciones de propuesta.** Aclarar que la antigua equivalencia acotada pgcrypto OID10 no permite renombrar el bootstrap en r4; la ACL NULL se compara semánticamente con su default y se distingue de ACL vacía. Referenciar la composición Auth R2 vigente en lugar del ejemplo histórico que omitía expectedGeneration y usaba flags sintéticos. No cambiar el contrato de Auth ni equiparar logout a invalidación inmediata universal de JWT. Se conservan pruebas de proveedor, Core, HTTP, carreras y operaciones tardías.

**N03 — Solo si se requiere resultado aplicado sin intento. NO implementada.** Aprobar o rechazar una futura especificación de reconocimiento externo post-recuperación, distinta de result/claim/start. Debe registrar un acto nuevo de conciliación con ID nuevo y fecha actual; enlazar operación/parte/versiones reales y evidencia independiente; referenciar el identificador histórico ausente sin insertar un intento retrospectivo; conservar estado previo y revisión; exigir correspondencia exacta, idempotencia/replay y conflictos; mantener bloqueo de efectos y reservas hasta decisión trazable. No debe implicar envío, pago, reintento, desbloqueo ni éxito por timeout. Es necesario definir antes las transiciones, autoridad, impacto en B08/HA/B07, negativos y migración. Esta propuesta no crea una API ni una capacidad vigente.

N03 no es condición para conservar evidencia por los contratos actuales. La decisión sobre su necesidad depende de si se pretende reconocer el resultado en B08 o mantener la incidencia protegida. Ninguna de ambas opciones autoriza S11.

## Criterios de aceptación del sucesor

1. Hash r3 y manifiestos históricos idénticos; diff limitado a cambios declarados y estado propuesto.
2. initdb soportado; origen/destino mismo bootstrap nombre/OID10; sin rol auxiliar ni nuevas autoridades.
3. CREATE único satisfecho explícitamente; positivos y negativos de derivación; original íntegro y resto de globals exacto.
4. Roles/atributos/configuraciones, grantors, membresías y ADMIN/INHERIT/SET iguales; owners, ACL efectivas, RLS, extensiones, datos/relaciones/historia comprobados contra origen.
5. Denegaciones y pruebas capaces de detectar permisos ausentes o ampliados; exit 0 no basta.
6. Integración Auth R2/F1/F2, objetos y conciliación con testigo independiente; incertidumbres conservadas.
7. Revisión independiente identifica alcance real y no usa esperado reconstruido desde destino.
8. Adopción final expresa del director antes de sustituir la normativa vigente. S11 y cierre separados.

Los puntos técnicos cuentan con evidencia v2 aceptada y auditoría separada, no con una nueva restauración en este bloque. La adopción normativa final y el reconocimiento de t1 ausente continúan pendientes. El candidato para aceptación es condicionado y no afirma cumplimiento íntegro de H6-015.

## Conciliación t1: capacidad real

| Necesidad | Contrato/implementación actual | Límite |
|---|---|---|
| Conservar testigo externo | C04 semántico (`invokeC04`, EvidencePort); B07 persistente (`H1013EvidenceAdapter`, b07_apply) | No se ha demostrado en este bloque una composición C04→B07 persistente integrada. |
| Vincular operación de negocio | B07 contextKind/contextId y sourceRef; fuente/referencia/evento/evidencia con cobertura | Identidad exacta existente y permiso vigente; nunca similitud de importe/fecha. |
| Registrar revisión | Evidencia candidate/reviewed y diagnóstico técnico pending; tiempos de ocurrencia y registro distintos | Reviewed significa revisión de la evidencia, no resultado B08 aplicado. Diagnóstico no ejecuta negocio. |
| Reconocer resultado B08 | Result exige intento existente y reservation_id, prueba fiable coincidente | SELECT INTO STRICT rechaza intento ausente. Esta conclusión se apoya en lectura SQL, no en nueva prueba SQL. La conciliación HA exige además reserva uncertain y evento attempted del mismo intento; B08 uncertain por sí solo no basta. |
| Evitar duplicación | verifyWorkEffect bloquea succeeded/uncertain; r3 S10 mantiene suspensión | None acreditado solo supera esa guarda; no es autorización de claim/start ni S11. |
| Historia legítima | Nuevos registros de evidencia/revisión identificados como nuevos, con referencia al testigo anterior | No insertar retrospectivamente attempt/reserva, no inventar ID histórico ni marcar éxito por documentación adjunta. |

`ManualExternalBoundaryDouble.reconcile` exige intención previa y resultado uncertain del doble en memoria. No ofrece una reparación durable de B08 ni una vía para inventar la intención perdida. Para una comunicación manual, B07 communication_fact exige original existente, evidencia, ámbito/recipient y cobertura pertinentes; tampoco sustituye B08.result ni acredita entrega por asociación automática.

El diagnóstico puede conservar operationId ausente como unverified_attempt según su contrato, pero executionId debe existir y corresponder al contexto. No admite un attemptId inventado ni payload arbitrario. La evidencia t1 se conserva en custodia y en este análisis; **no se ha escrito una conciliación B07 ni modificado Core en este bloque**.

## Clasificación obligatoria

| Caso | Qué se puede concluir | Tratamiento |
|---|---|---|
| Efecto confirmado | Fuente independiente acredita efecto, identidad, destinatario/material/versión y alcance | Conservar prueba, bloquear repetición; si falta intento, revisión separada y resultado B08 pendiente. |
| Efecto fallido acreditado | Fuente fiable acredita fallo del intento exacto | Registrar por contrato aplicable si existe; no deducir ausencia total de otros efectos ni autorizar reintento automáticamente. |
| Efecto incierto | Resultado desconocido o ambiguo | Mantener incertidumbre y suspensión; no convertir timeout en failed. |
| Intento ausente | Core t0 no conserva ese intento t1 | Describe persistencia, no resultado externo. Puede coexistir con cualquiera de los estados anteriores. |
| Evidencia insuficiente | Falta identidad/cobertura/autoridad o fuente comprobable | No adjudicar éxito, fallo o no-efecto; revisión pendiente. |

Para resolver el incierto haría falta una observación independiente autorizada y completa del proveedor simulado que vincule inequívocamente operación/intento/efecto con destinatario, material, versión, alcance, resultado y tiempos, junto con integridad/procedencia y control de duplicados. Una referencia, contador, timeout o ausencia en Core no basta. La ausencia de efecto exige además cobertura exhaustiva del intervalo/identidad investigados, no una consulta parcial vacía. No se obtiene esa evidencia ejecutando otra vez el efecto. Si no existe, el resultado permanece incierto y protegido.

## Cobertura AC-073 / AC-074

**AC-073: parcial y protegida.** Se mantiene la cobertura v2 aceptada: restore previo al efecto, testigo externo, suspensión, conciliación donde existe intento, no repetición y objeto ausente reconocido como ausente. El t1 sin intento no tiene resultado aplicado; el incierto sigue sin resolverse. Los tests actuales comprueban guardas, no completan conciliación ni miden pérdida total del período. No se declaran RPO/RTO objetivos ni aceptación Production.

**AC-074: cobertura local heredada de v2.** Metadata/bytes separados, ausencia, corrupción, formato incorrecto, vínculo incompleto, huérfano y URL conocida denegada. Los FAIL históricos y corrección MIME permanecen. No se repiten Storage/Auth porque este bloque no cambia su implementación. No se atribuye al ensayo actual una nueva ejecución integrada ni una garantía general de almacenamiento.

## Pruebas adicionales y auditoría

[Instrumento focal](../../scripts/verify-h6-adoption-reconciliation.ts): 12 checks sobre los verificadores reales de aplicación, expected congelado antes del observado. Confirmado/incierto/indisponible/prueba ausente/material distinto bloquean; éxito/fallo exactos son aceptados solo por el puerto; timeout se propaga sin fabricar fallo de negocio. No se llama al ejecutor, no se crea intento, no se ejecuta SQL y no hay efectos externos. Se conserva cada resultado en runs sin sobrescritura.

La revisión independiente utiliza worktree `h6-adoption-audit`, expected propio y vectores distintos; su dictamen y sello se enlazarán en el acta de este paquete. La lectura contractual y las pruebas de puertos se distinguen de la integración C04/B07/SQL que no se ha ejecutado. No se repiten las 210 pruebas históricas ni las restauraciones completas sin una modificación que lo justifique.

## Siguiente bloque y reservas

Dentro de los contratos vigentes puede diseñarse e integrar una composición focal C04/B07 que registre evidencia y revisión con permisos reales, replay/conflictos y denegación entre contextos; debe mantener B08/HA/finanzas intactos y trabajos suspendidos. Esto no resolvería por sí solo el resultado B08 ausente. En este expediente se entrega el diseño contractual y no se declara esa integración realizada.

El director debe decidir N01/N02 y la adopción de r4 con E01/E02. N03 requiere una decisión distinta si se desea ampliar el contrato. Mientras tanto se conserva el bloqueo dependiente y el incierto. ARCH-PENDING-002 y DM-PENDING-005 siguen OPEN. No S11, cierre H6-015, commit, push, publicación, Drive ni despliegue.

STOP ante adopción normativa definitiva, ampliación contractual o reentrada.
