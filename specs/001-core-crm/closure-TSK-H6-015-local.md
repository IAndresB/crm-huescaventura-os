# TSK-H6-015 — Acta formal de cierre local/aislado y en cuarentena

**Estado formal: COMPLETED — exclusivamente local/aislado y en cuarentena.** Registro del 2026-10-22 por autorización expresa del director en esta conversación. **H6 global IN PROGRESS, no COMPLETED.**

## Autoridad, alcance y cronología

El director aprueba expresamente el cierre y acepta la matriz integral y el dictamen independiente presentados. El [registro de autorización](../../tests/fixtures/h6-015-formal-closure/director-authorization-v1.json) transcribe la decisión de cierre y delimita las operaciones autorizadas; su fecha de registro no inventa firma ni instante de aprobación. Este acto es posterior a los candidatos que dicen IN PROGRESS o cierre pendiente; sus bytes y conclusiones históricas no cambian.

Se registra el cierre en Tasks, PROJECT-STATUS y NEXT-STEPS mediante una cabecera vigente y una anotación de estado en la ficha H6-015. Se conserva íntegra la definición anterior como antecedente. No cambian requisitos, contratos, expected ni las filas de asignación normativa. Las menciones históricas NOT STARTED/IN PROGRESS no gobiernan el estado actual del cierre local.

La base Git es `971c55d5ce5770c71284d106d3c0deecca9514b5`. Este worktree documental separado no sustituye el candidato ejecutable aceptado ni incorpora su código no versionado. La identidad técnica sigue siendo el commit base más los manifiestos y archivos de los candidatos recuperables indicados abajo; el commit por sí solo no contiene toda la implementación local aceptada. No hay commit ni publicación nuevos. **Registro local pendiente de publicación; no constituye una nueva versión oficial en GitHub.**

## Evidencia aceptada e identidad exacta

| Evidencia | Referencia y SHA-256 |
|---|---|
| Candidato integral, 31 archivos | [Manifiesto ejecutor](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/tests/fixtures/h6-015-acceptance/delivery-manifest-v1.json), `542321de105ab58d2ba662c4e4936ce0a057e6c83beb7aca2d3a8c1eb550e499` |
| Matriz integral, 15 asignaciones | [Matriz](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/tests/fixtures/h6-015-acceptance/acceptance-matrix-v1.json); hash exacto en el índice adjunto |
| Informe técnico final | [Informe](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/acceptance-assessment-TSK-H6-015-local-v1.md), `3bb6ccd9907957f6b78b80fe31cc2f046b8a4060b6e6ee8fb3a18d511bf2640b` |
| Auditoría integral, 15 archivos | [Manifiesto auditor](/Users/andres/.codex/worktrees/h6-c04-audit/crm-huescaventura-os/tests/fixtures/h6-015-acceptance-independent/delivery-manifest-v1.json), `047bf131fb54945409d03ed260eec3f0b754e8b866af3ead4f58db3ac5a3097e` |
| Dictamen independiente favorable | [Dictamen](/Users/andres/.codex/worktrees/h6-c04-audit/crm-huescaventura-os/specs/001-core-crm/audit-TSK-H6-015-acceptance-independent-v1.md), `a8e3e65bf8bb408c5f73c85b82766643c1a19063842caac9b44e132a1a9be14e` |

El [índice exacto de evidencia](../../tests/fixtures/h6-015-formal-closure/accepted-evidence-index-v1.json) añade tamaños y hashes de matriz, r3, r4, adopción, cuarentena y focal. La [integridad inicial](../../tests/fixtures/h6-015-formal-closure/initial-integrity-v1.json) revalida diez manifiestos, **4.436 entradas de payload** y **44.293 archivos protegidos** del candidato fuente. Son verificaciones de integridad, no escenarios funcionales nuevos ni recuentos de archivos únicos entre paquetes.

Las cuatro dependencias H5-019, H6-014, H6-006 y H6-008 estaban cerradas en alcance local; seis integraciones remitidas a H6-015 quedan acreditadas por la matriz aceptada. No se declaran completadas las obligaciones globales compartidas de esas fuentes.

## Criterios y decisiones conservados

Las quince asignaciones de Tasks §6 son satisfactorias dentro del tramo local acreditado. **AC-073 y AC-074 están satisfechos exclusivamente en ese alcance local/aislado y en cuarentena.** No se afirma continuidad Production, pérdida máxima, capacidad ni tiempo objetivo.

N01 y N02 siguen resueltos; se mantiene la adopción local de r4 y la aceptación C04→B07/C07. R3 se conserva como antecedente íntegro; r4 no se vuelve a editar. N03 es innecesario para AC-073 y no implementado. El intento ausente conserva evidencia externa trazable sin un resultado B08 aplicado ni reconstrucción artificial de su historia.

Resultados heredados sin repetición funcional: restauración PG17 v2 64 controles; integración C04 R2 27; regresión C07 22; focal diagnóstica 20/20. Dictamen integral: 4.515 controles documentales/hash con diez contrapruebas y 2.834 controles de custodia/adquisición/SQL. Se conservan los FAIL instrumentales, revisiones y expected separados. Estas cifras no se suman como escenarios nuevos de negocio. La focal E7/E8 acredita persistencia/diferenciación de entradas semánticas controladas, no clasificador nuevo.

## Cuarentena y límites que el cierre no levanta

Cuatro trabajos siguen suspendidos en la evidencia final protegida. El intento t1 continúa ausente, el efecto incierto continúa incierto y el objeto no recuperado continúa ausente y sin acceso dependiente. Ningún cierre documental libera reservas, aprobaciones ni automatismos. No se arrancan recursos ni se ejecuta SQL en este acto; la conservación se verifica por integridad de las evidencias y ausencia de operaciones sobre los recursos, no se presenta una nueva lectura funcional.

**S11 no ejecutada y no autorizada.** S12 acredita únicamente mediciones pre-S11 y S13 el expediente local; no se declara una cadena operativa completa. Los efectos no conciliados mantienen bloqueadas sus continuaciones. La pérdida fuera del testigo sigue NO DETERMINADA; los tiempos medidos no son RPO/RTO aprobados.

**ARCH-PENDING-002 y DM-PENDING-005 permanecen OPEN.** No hay N03, nueva modificación normativa, datos/credenciales reales, Hosted/Production, efectos externos, despliegue, commit, push, publicación GitHub ni carga a Drive autorizados. La custodia sintética protegida y sus originales permanecen donde estaban; este cierre no copia secretos ni dumps al repositorio.

## Coordinación siguiente y revisión

La [preparación documental siguiente](preparation-next-H6-after-H6-015.md) distingue H6-016, sucesora numérica, de H6-001, primera pendiente propuesta con su dependencia directa satisfecha. H6-016 mantiene pendientes H6-001/H6-004/H6-007. Ninguna comienza: ambas siguen NOT STARTED. No se asigna dependencia H6-015→H6-016 inexistente en Tasks.

La revisión documental independiente de este registro se añadirá mediante un recibo separado, sin cambiar el acta aceptada ni sus fuentes. El cierre está autorizado por el director; la revisión verifica la corrección del registro, no sustituye su decisión. El [expediente de control](../../tests/fixtures/h6-015-formal-closure/expected-v1.json) fija identidades y límites antes del registro.

**Cierre local registrado. STOP ante ejecución funcional nueva, reentrada o publicación.**
