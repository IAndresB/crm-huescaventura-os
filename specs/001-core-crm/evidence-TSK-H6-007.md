# TSK-H6-007 — Evidencia posterior al cierre

**Ejecución técnica local/aislada: PASS. H6 global IN PROGRESS.** El estado formal se registra en el acta posterior `acceptance-TSK-H6-007-local.md`; este expediente técnico conserva sus propios resultados y no modifica las fuentes selladas.

Base verificada mediante fetch y lectura de GitHub: `9c15e6d143822f7fcc84f29744194554630f4ac4`, árbol `fe7cabb05e44462121c70ad52405765e2c94fcd2`. Worktree exclusivo: `/Users/andres/.codex/worktrees/h6-007-local/crm-huescaventura-os`. No commit, staging, push, merge, Drive ni despliegue. Solo PostgreSQL17.11 aislado, Node24.21.0, pnpm11.19.0, datos sintéticos y Storage oficial fijado al commit `5def1dfc15ab7f08fe271c7d1e70542424524e4e` mediante el runner ya publicado. No se activó ningún conector real.

## Alcance normativo

Tasks §4.7 define cierre conjunto seguido de discrepancia económica y reapertura fundada; B01–B10, C01–C06, T09/T10. Su única dependencia formal H5-019 está satisfecha: el sello aceptado D01 tiene SHA-256 `31fd4ac89aea684f2155a4365cb5870a0c0163838cbfd543d2ad98d0db1ea619`, recalculado directamente, y D01–D03 aceptan H5-019/H5 solo local/aislado. Los estados antiguos de esos recibos se conservan fechados; no acreditan el estado actual de H6 por sí solos.

Las cinco asignaciones directas comprobadas en Tasks §6 son **SPEC-FR-CLOSE-004, AC-061, PT-10, E2E-07 y G5 de SM §2.1/§16**. Se contrastaron también Constitución P05–P08/P10–P15/P18–P20; SPEC §§11/17/18 y referencias AC-046/058–063; SM G1–G6, CL-01–05 y conservación; DM-INV-041/042/047/051; BR-CLOSE-001/002, historia y permisos; Architecture §12 y Plan §§7.1–7.3/9/10.1. No se añadieron reglas, contratos, permisos ni transiciones.

## Implementación y componentes reutilizados

No se modificó código de producto, configuración, dependencias ni migraciones. Se añadieron un orquestador de ensayo H6-007, la focal, un suplemento de historia y envolturas de regresión. La base real usa `fifthDatabase` con las68 migraciones y los adapters publicados de contratación, Booking, economía, pagos, cierres, evidencia y proyecciones. Todos los hechos de negocio se persisten mediante sus contratos de aplicación; SQL de observador solo comprueba resultados. Los triggers y secuencias de fallo se crean y retiran únicamente en bases efímeras propias como instrumentación de ensayo.

El fixture reutilizado registra prestación excepcional real sintética con documento y revisión explícitos (`exceptional:true`, AC-063). No se presenta como start→perform→finish ordinario, ni fabrica aprobación retroactiva. Los servicios internos justifican No aplica para suplido/factura externa; el tramo externo AC-046 se ejecuta separadamente.

## Recorrido acreditado

P01 construye hechos suficientes mediante aplicación: cadena contractual/Acceptance y versiones, servicios, recepción de pago, conciliaciones/asignaciones, economía propia y prestación revisada. Abre y resuelve por separado las tres evaluaciones y después realiza un cierre conjunto explícito. Tres evaluaciones resueltas todavía no equivalen a cierre conjunto.

A01 registra una discrepancia de100,00 EUR sobre una porción identificada del pago de esa Booking, con fecha/evidencia nuevas posteriores al cierre y registro de base comprobado. La evaluación económica histórica continúa Resuelto, su condición actual es Pendiente y el cierre conjunto deja de estar vigente. Comercial y operacional, Acceptance, versiones, ejecución, Booking/servicios y Booking ajena permanecen iguales. La invalidación conserva fundamentos anterior/actual, tabla y registro causante, actor/evidencia e instantes.

A02 añade reapertura explícita económica Pendiente y reconoce su replay. A03 reconstruye evaluaciones y cierre histórico sin sustitución. A04 contrasta lectura canónica y proyecciones sin autoridad de mutación. F11 resuelve después la discrepancia con evidencia: el cierre antiguo no resucita. La nueva evaluación y el segundo cierre son actos explícitos, manteniendo intacto el primero.

## Escenarios A–F y límites

| Escenario | Resultado observado y evidencia |
|---|---|
| A — contradicción económica | P01/A01–A04/F11 PASS: invalida economía y vigencia conjunta; conserva historia y las otras dimensiones; nuevo cierre solo explícito. |
| B — evidencia no contradictoria | B01/B02 PASS: nota ajena al fundamento e incidencia leve no material conservan evaluaciones, invalidaciones y cierre. La nueva incidencia sí aparece como hecho en inputs; no se borra para hacer coincidir una vista anterior. |
| C — duplicados | C01–C03/A02 PASS: misma identidad recupera resultado sin mutación adicional; identidad con material distinto es conflicto; el original de evidencia no se duplica. |
| D — insuficiencia | D01–D05 PASS: reapertura infundada, evidencia inexistente/ajena y material obsoleto no se aplican; revisiones insuficientes no convierten economía pendiente en resuelta. |
| E — permisos | E01–E04 PASS: auth copiada, interacción incorrecta, SQL directo y actor inhabilitado no pueden mutar ni recuperar lecturas/replay protegidos. La revocación se ensaya en una base exclusiva. |
| F — fallos/recuperación | F01–F12 PASS: fallo antes de revisión/resultado/invalidación y fallo diferido en COMMIT revierten unidad; secuencia acredita alcance de frontera. Respuesta perdida después de COMMIT real recupera una sola operación; ambos órdenes de cierre/pago y otra Booking usan sesiones PostgreSQL reales y locks observados. |

El corte de respuesta F08 es una simulación de acuse después de un COMMIT PostgreSQL real; no afirma un corte TCP real ni exactly-once externo. Las esperas F09/F10/F12 registran locks y bloqueadores; los comandos siguen siendo contratos reales. La Booking independiente usa una tercera sesión: reutilizar una sesión F2 que ya tiene una operación en espera comprobaría serialización de sesión, no aislamiento entre raíces. Estos ensayos dirigidos de T09/T10 no acreditan H6-016/T01–T11.

X01 y H5-013 N02 de la regresión ejercitan AC-046: pago a proveedor acreditado sin factura, pendiente documental, recepción/revisión/vínculo posterior, suplido documentalmente resuelto y nueva discrepancia que conserva el pago real y devuelve revisión. No se atribuye a ese caso auxiliar una venta externa completa con los tres cierres satisfechos.

H01 comprueba las cláusulas aplicables de AC-062: archivo de identidad mediante contrato publicado, visibilidad, recuperación del contexto, Booking/código/vínculos e historia de cierre conservados. Las cláusulas de fusión humana/nuevo expediente/códigos no reutilizados permanecen como antecedente aceptado H5-012 candidate61 H06–H08, identificadas en `H5-dependency-readback-v1.json`; no se atribuyen como ejecuciones nuevas de H01. No se inventó API de archivo de Booking. H6-007 acredita su recorrido E2E-07, no repite íntegramente todas las familias de identidad ni amplía sus contratos.

## Pruebas y trazabilidad

| Ejecución | Resultado | Alcance |
|---|---|---|
| focal-04 | 32/32 PASS | Todos los casos del expected previo;0 FAIL/skipped/cancelled. |
| regression-02 | 49/49 PASS | 48 controles actuales de cierres/historia y un caso histórico61→62, claramente identificado; no regresión global. Incluye H01 una vez. |
| quality-02 | 212/212 unitarias; typecheck/lint/build PASS | Fuentes finales de pruebas, producto y configuración sin cambios. |
| Repetición independiente | 32/32 y H01 1/1 PASS | Ejecución y recursos propios del auditor; no se suma como cobertura nueva. |
| Contrapruebas independientes | 10/10 PASS,8 familias | Expected/instrumento propios; estado, historia, permisos, atomicidad, replay y locks reales. |

La matriz es [matrix-TSK-H6-007.md](matrix-TSK-H6-007.md); la correspondencia por caso y línea está en `tests/fixtures/h6-007/traceability-v1.json`. El índice de captura conserva hashes de bytes crudos y representaciones gzip sin pérdida. Las nueve fuentes finales de ensayo se congelaron en `candidate-test-inputs-v1.json`, SHA-256 `4178b9b7c40c7bd9e2dce18875cfe6ef40457fec0222a99e663671ebd85b504e`. Los cuatro cuerpos de regresión conservan literalmente sus aserciones; solo cambian imports de bootstrap/cronología declarados en `regression-provenance-v2.json`.

## Fallos conservados y correctivos

focal-02 conserva17 PASS/15 FAIL de32. Se corrigieron instrumentos: fecha heredada anterior al cierre (hallazgo independiente H6007-AUD-01), nombres de columnas de invalidación, comparación de vista completa que no admitía un hecho no material y contaminación de sesión de catálogo por revocación. focal-03 conserva31 PASS/1 FAIL de32 por reutilización de sesión en F12; se guardó el grafo y se canceló solo el read bloqueado del verificador en su base para liberar su guard. focal-04 es una ejecución posterior completa32/32.

regression-01 conserva46 PASS/3 FAIL de49. Dos fixtures de Refund importaban una cronología antigua de cancelación; sus envolturas reutilizan el builder publicado H5-017-G, sin cambiar las aserciones. La prueba M02 necesitaba su bootstrap histórico61; se restauró ese recorrido en recurso propio, manteniéndolo separado de la base68 del recorrido principal. regression-02 es una ejecución posterior49/49. Las19 posiciones fallidas tienen sucesor nominal en `failure-successors-v1.json`; las fuentes anteriores están archivadas. Se conservan también errores de preflight/cache/monitor y los del auditor con sus sucesores.

La historia H6-001 sigue2.899 PASS/46 FAIL de2.945 y H6-004 sigue1.006 PASS/117 FAIL de1.123, con sus reconciliaciones originales intactas. No se reescriben ni se convierten en completos limpios. No se suman repeticiones ni se declara regresión global nueva.

## Auditoría, custodia y exclusiones

Auditor separado del mismo modelo, con expected previo, instrumentos, copia y recursos propios; sin auditor humano ni auditoría externa institucional. El dictamen, matriz de36 controles y originales/sucesores se incorporan al paquete técnico. La custodia independiente verifica antecedentes y candidato, y el acta local se formaliza después de su recepción satisfactoria. Los manifiestos SHA-256 son sellos de integridad; no firmas criptográficas de dirección.

Protegidos: H6-001376 rutas, H6-004701, producto110 archivos,68 migraciones, normativa/decisiones y16 manifiestos/4.568 entradas previas de H6-015. Principal conservado en `971c55d5ce5770c71284d106d3c0deecca9514b5`, con14.954 históricos no seguidos; índice y archivos seguidos intactos. No se accedió a runtime H6-015, S11 ni cuatro trabajos suspendidos. H6-015 continúa formalmente local/aislado y en cuarentena.

Hosted/Production, disponibilidad/cobros/facturas/entregas reales, comunicaciones y conectores, nuevas políticas o seguridad, publicación GitHub y subida a Drive quedan excluidos. H6-016 solo recibe una propuesta documental de continuidad, con sus dependencias y publicación pendiente diferenciadas; no se inicia mediante esta ejecución.
