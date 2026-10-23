# H6-015 — Continuidad autorizada, adopción r4 e integración C04→B07

Fecha: 2026-10-22. **H6-015 IN PROGRESS. Candidato local R2; no cierre ni S11.** Base Git `971c55d5ce5770c71284d106d3c0deecca9514b5`; worktree exclusivo `h6-c04-integration`.

## Estado efectivo frente al informe anterior

El paquete anterior de adopción (manifiesto `3706b515db4671f5f1fdeda47d2c8d6564e90a94deba62dbebff118b871bce78`) documentaba r4 como propuesta y C04→B07 persistente como no ejecutado. Sus archivos sellados no contenían una adopción posterior ni esa integración. El director ratificó expresamente N01/N02 y autorizó adopción controlada e integración. No hay que volver a pedir esos permisos ni tratar el STOP histórico como bloqueo actual.

Se registra la decisión en [adopción local r4](adoption-TSK-H6-014-r4-local.md) y queda disponible el [procedimiento r4 adoptado](procedure-TSK-H6-014-r4.md). El original r3, el borrador r4 y los expedientes anteriores permanecen íntegros. El cambio respecto del borrador auditado se limita a su cabecera de vigencia; el contenido operativo aprobado se conserva. [Identidad documental](../../tests/fixtures/h6-c04-integration/adoption-seal-v1.json). No se reescriben Constitución, Architecture, SPEC, Plan ni contratos aprobados.

## Implementación y alcance

`createManualB07EvidencePort` compone EvidencePort de C04 con el adaptador persistente B07 existente. Vincula el contexto a identidad autenticada, exige una sesión con MFA, conserva fuente/recepción/preservación/revisión y delega autorización durable, replay, historia y finalización a B07/C03/F1/F2. No introduce SQL, tablas, permisos, migraciones ni operaciones B08 nuevas.

Esta composición admite registro manual autorizado. No afirma haber preservado bytes originales: rechaza `preservation=original`, pues no dispone de un puerto de conservación de originales. La fuente íntegra permanece en custodia. Los datos de registro C04 se serializan dentro del campo claim admitido por B07; no se añaden claves incompatibles al material SQL. La revisión debe pertenecer al subject autenticado; B07 conserva además el actor efectivo en recorded_by.

El estado C04 `verified` corresponde al registro revisado (`certainty=reviewed` en B07). **No significa que un efecto incierto haya pasado a éxito ni que se haya aplicado un resultado B08.** La vinculación usa el contexto de negocio existente y los identificadores reales del testigo sintético. Todos los UUID nuevos corresponden a nuevos actos de registro, nunca a un intento retrospectivo.

No se ha añadido ruta HTTP ni desplegado interfaz. La integración focal ejercita la composición servidor→C04→B07→PostgreSQL bajo autenticación real local. La cobertura HTTP/Storage v2 se conserva como histórica, sin atribuirla a una nueva ejecución en este bloque.

## Ensayo integrado final

[Run final](../../tests/fixtures/h6-c04-integration/runs/2026-10-22T16-46-33.825Z/report.json): **27/27 PASS** con expected previo y adendas explícitas. Cada ejecución conserva copia y hash de sus instrumentos antes del observado.

Se usa una copia fría del clúster completo Core/Auth v2 ya detenido, verificada contra custodia y byte a byte antes de arrancar. No es una nueva restauración lógica S05 ni modifica sus resultados; permite aislar la integración afectada. El método de copia completa detenida corresponde a [PostgreSQL 17, filesystem backup](https://www.postgresql.org/docs/17/backup-file.html). Destino y socket propios; sin listener PostgreSQL TCP. Auth v2.197.0 local, password y TOTP reales, correo/SMS sin salida real y sandbox de red solo localhost/Unix. No migraciones Auth nuevas.

Antes de servir se renuevan F1/F2, con claves/generaciones independientes, deshabilitación de las anteriores y readback. Se obtiene una identificación completa nueva y se ejecuta revocación global coordinada antes de comenzar C04. Los datos de negocio se mantienen en cuarentena.

| Grupo | Evidencia observable |
|---|---|
| Registro candidato y revisado | Persistencia SQL, lectura autorizada, fuente y ocurrencia t1, recepción nueva y fecha de registro SQL separadas; actor y revisión comprobados. |
| Replay | Repetición equivalente y dos conexiones concurrentes producen un único registro por operación. |
| Conflicto | Cambio de contenido con la operación previa rechaza B07_REPLAY_CONFLICT. |
| Fronteras | Contexto sin vínculo no devuelve datos; fuente distinta, falsa revisión, original no preservado y contexto diferente se rechazan. |
| Incertidumbre | Guarda de repetición incierta rechaza; observación externa unknown puede conservarse como evidencia candidata sin convertirla en resultado de negocio. |
| Sesión revocada | Rechazo B07 real con control positivo posterior y conexión operativa. |
| Concurrencia con revocación | Locks PostgreSQL observados en ambos órdenes: revocación primero impide el registro; registro primero conserva su commit y después revoca. |
| Solicitud mutable | Dos esperas SQL reales permiten alterar el objeto del llamante; estado devuelto y contenido persistido conservan la captura original, tanto candidate como reviewed. |
| Conservación | 163 tablas del conjunto de negocio intactas, incluyendo B08/HA/finanzas; filas B07 y de revocación previas preservadas; esquema normalizado idéntico. |
| Resultado de cuarentena | Intento t1 ausente sigue ausente, cuatro trabajos pausados, testigo sin modificación, revocación final completada y recursos detenidos. |

El ensayo final genera siete registros nuevos de evidencia como casos de prueba, **no siete efectos externos**. No escribe un resultado B08, no crea intento, no libera reservas ni activa automatismos. El testigo independiente mantiene su hash y ninguna acción de negocio se repite.

## Fallos y correcciones conservados

1. **Run1, FAIL tras 20 comprobaciones.** El comparador incluía `global_access_revocation_attempts` entre los datos de negocio inmutables. Una copia diagnóstica separada mostró únicamente las nuevas observaciones B07 y actividad de seguridad esperada. Se corrigió la clasificación y se exigió conservación exacta de las filas anteriores de ambas tablas de revocación. [Adenda previa al segundo run](../../tests/fixtures/h6-c04-integration/expected-addendum-v1.json). B08/HA/finanzas mantuvieron el mismo expected.
2. **Run2, 25/25 PASS de su cobertura, sin aceptación final.** La auditoría independiente encontró C07: mientras esperaba persistencia, el llamante podía alterar o sustituir request.input; C04 podía devolver verified tras persistir candidate. El FAIL auditor se conserva en su paquete.
3. **Correctivo de implementación C04.** Captura inmutable de EvidenceRegistration y su revisión anidada antes del await; el puerto y el estado devuelto usan la misma captura. Firma, contrato y significado de estados no cambian. No es N03. [Expected adicional previo](../../tests/fixtures/h6-c04-integration/expected-mutation-v1.json); run3 prueba ambos sentidos mediante locks SQL reales.

Se añadieron dos regresiones permanentes en tests/contracts.test.ts. La regresión focal final contiene **22/22 PASS**, cero skips; TypeScript, límites de importación y git diff --check PASS. La batería anterior de 20 pruebas se conserva separada. No se repiten restauraciones completas ni pruebas Storage no afectadas.

## Conciliación y criterios obligatorios

| Elemento | Estado efectivo |
|---|---|
| N01/N02 y adopción r4 | Aprobados y registrados. No son decisiones pendientes nuevas. |
| Conservación y asociación t1 mediante C04→B07 | Implementada y probada persistentemente con identidad sintética real local. |
| Resultado B08 del intento ausente | No aplicado; requiere una vía distinta que no existe en el contrato actual. N03 sigue reservado. |
| Efecto incierto | Evidencia candidata preservada, resultado sigue unknown, automatismos suspendidos. No hay prueba nueva suficiente para concluir éxito/fallo/no-efecto. |
| AC-073 | Cobertura ampliada con registro persistente y protección; sigue parcial para conciliación integral del intento ausente y efecto incierto. |
| AC-074 | Cobertura local v2 conservada. Esta integración no altera objetos, metadata Storage ni su contrato; no hay nueva prueba de bytes en este bloque. |
| S11 / cierre | No ejecutados. H6-015 IN PROGRESS. |
| ARCH-PENDING-002 / DM-PENDING-005 | OPEN; ninguna garantía Production o tratamiento de datos reales deducidos. |

Para resolver la incertidumbre se necesita evidencia independiente completa de la operación/efecto correspondiente. No se puede fabricar desde un timeout ni obtener repitiendo el efecto. Para aplicar el resultado B08 sin intento, N03 debe definir de antemano autoridad, identidad, transiciones, conflictos, idempotencia y conservación; no se implementa implícitamente mediante C04.

## Custodia, identidad y publicación

Los originales temporales, FAIL y candidatos anteriores se conservan. Custodia del primer bloque: 7.825 archivos / 274.751.219 bytes, inventario `02471dcf9c06f1e6b3e67386f2a5d2aa0713868531202c4e84c942156768c0b0`. Custodia del run final: 2.612 archivos / 94.341.750 bytes, inventario `0d4ea99915d1a20edfe57670dfe250d0be3440dfc047cf975e054ac5cd82ec04`. Copias rehasheadas, permisos privados y originales preservados; ninguna afirmación de cifrado/WORM.

[Integridad](../../tests/fixtures/h6-c04-integration/integrity-v1.json): 4.275 archivos heredados íntegros y repositorio original con el mismo estado, incluidos sus 14.954 untracked. Sin staging, commit, push ni publicación.

El manifiesto de entrega enumera solo el delta nuevo: composición, correctivo C04, regresiones, r4 adoptado, actas e instrumentos/evidencias redactadas. Fuera de Git/Drive: dependencias, clústeres, snapshots de tablas, dumps, configuración, credenciales, factores, tokens y claves, aunque sean sintéticos. La auditoría conserva su propio paquete separado; no se mezcla con las pruebas del ejecutor.

## Frontera restante

El trabajo autorizado de adopción e integración focal queda preparado para valoración del director con su auditoría independiente. N01/N02 no requieren nueva autorización. El bloqueo de N03 afecta únicamente al reconocimiento B08 sin intento; no impidió registrar la evidencia ni terminar las verificaciones independientes. No se declara aceptación integral de H6-015.

STOP exclusivamente antes de N03, otros cambios normativos no aprobados, S11, recursos reales, producción, despliegue, publicación o Drive.
