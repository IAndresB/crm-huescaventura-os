# H6-015 — Variante experimental bootstrap PG17, v2

Fecha: 2026-10-22. Estado: **EXPERIMENTAL AUTORIZADA; NO ADOPCIÓN NORMATIVA**. H6-015 **IN PROGRESS**. No sustituye H6-014 r3, no abre S11 y no declara COMPLETED. La decisión del director de este hilo permite investigar dos restricciones concretas de S05; los documentos anteriores conservan su estado histórico.

## Alcance y fuentes

Base `971c55d5ce5770c71284d106d3c0deecca9514b5`. Ejecutor: worktree `h6-bootstrap-variant`; auditor independiente: `h6-bootstrap-audit`. Ambos son recursos separados. [Preflight](../../tests/fixtures/h6-bootstrap-variant/preflight-v1.json) verifica 4.148 payloads heredados y la custodia privada anterior antes de operar. Los expected históricos y todos los FAIL permanecen intactos.

Fuentes superiores: Constitución P07/P10/P12/P13/P14; Spec, Plan, Tasks, Architecture, Decisions y contratos ya fijados por el expected correctivo. No se modifican. La ficha Tasks sigue siendo la foto normativa histórica; el estado operativo IN PROGRESS deriva de las autorizaciones expresas del director y se registra en este expediente separado.

## Causa raíz y alternativa elegida

La investigación anterior reprodujo `42501` en `check_role_grantor`: el nombre del bootstrap importado no conserva su identidad OID 10 cuando `initdb` crea otro bootstrap. Un superusuario ejecutor distinto no elimina la condición del grantor explícito. Añadir ADMIN o cambiar GRANTED BY altera el grafo o sus dependencias de revocación. Véase el [dictamen histórico](corrective-assessment-TSK-H6-015-PG17-v1.md).

La variante crea cada destino con `initdb --username` y el nombre del bootstrap fuente: `h2_bootstrap` para Core/Auth y `postgres` para Storage. `initdb` asigna la identidad bootstrap; el harness verifica OID 10 mediante lectura, sin forzar OID ni escribir catálogos internos. La opción es soportada por [initdb PG17](https://www.postgresql.org/docs/17/app-initdb.html); las condiciones del grantor y ADMIN se contrastan con [GRANT PG17](https://www.postgresql.org/docs/17/sql-grant.html).

## Diferencias exactas respecto de r3

| Elemento | r3 preservado | Variante experimental y justificación |
|---|---|---|
| Bootstrap destino | Nombre diferente de todos los roles fuente | Nombre fuente y OID 10. Conserva la raíz original de los GRANT sin introducir ADMIN adicional. |
| CREATE ROLE bootstrap | Se esperaba que ningún CREATE colisionara | Una única sentencia exacta se satisface mediante `initdb` verificado. En un derivado privado se sustituye por una aserción transaccional de OID/nombre/superusuario. |
| Resto de globals | Carga completa, sin tolerar errores | Idéntico byte a byte: ALTER, atributos, configuración, membresías y GRANT. Reversibilidad del reemplazo, offsets y hashes acreditados. |
| Preflight | Destino nuevo exclusivo | Además, el único rol no builtin preexistente debe ser el bootstrap esperado. Tras cargar se comparan todos los roles y membresías, sin eliminar un bootstrap auxiliar de la comparación. |
| Adquisición ACL del instrumento | El snapshot heredado recoge `relacl` textual; r3 ya canonicaliza `datacl` | Se expande la ACL de relaciones por grantor/grantee/privilegio/opción. NULL se interpreta según `acldefault`; ACL vacía sigue vacía. No modifica grants ni se atribuye a r3 una exigencia general de igualdad textual. Se contrasta con schema SQL y permisos mediante instrumento independiente. |
| Auth | Fragmento orientativo anterior a la integración R2 | Interfaces actuales aceptadas R2, proveedor local real y generación capturada antes de TOTP. No se cambia su contrato ni se presenta un callback como autenticación. |

El derivado de globals es privado y no sustituye el original. Se ejecuta con `ON_ERROR_STOP`, transacción y error bloqueante. La aserción no ignora `duplicate_object`. En su posición pueden haberse creado ya otros roles del archivo: la exclusividad se comprueba antes de cargar y el grafo completo al terminar, evitando una precondición falsa a mitad del archivo.

Permanecen la reserva del nombre de mantenimiento, la partición completa del TOC Core, la provisión de pgcrypto 1.3 bajo su propietario exacto, las cargas Auth/Storage completas, las propiedades de cada base y las prohibiciones de omitir owners/ACL, limpiar destinos o continuar con errores. No se reaplican migraciones sobre bases restauradas.

## Garantías superiores

No se introduce DDL correctivo de aplicación ni una autoridad nueva. El SQL restaurado procede de las migraciones aprobadas; `initdb` provisiona el recurso vacío. La sustitución únicamente acredita una creación ya satisfecha por el motor. Esto no utiliza la excepción break-glass de P13. Las operaciones posteriores de seguridad y conciliación usan los contratos aprobados y el aprovisionamiento F1/F2 previsto por D037/D038.

La adopción permanente exige una revisión y aprobación documental posterior. Si se pretendiera modificar permisos, contratos o esquema para lograr el resultado, esta autorización no lo cubre.

## Instrumentos y expected

- [Ejecutor nuevo](../../scripts/run-h6-bootstrap-variant.ts): recurso nuevo por intento, corte t0, testigo t1 fuera del rollback, restauración y puerta independiente antes de S06.
- [Comprobaciones de bootstrap](../../tests/support/h6-bootstrap-variant.ts): derivación mínima, globals y privilegios efectivos; sin modificación de los instrumentos históricos.
- [Integración restaurada](../../tests/support/h6-bootstrap-integration.ts): Auth real, 16 superficies, ambas órdenes de concurrencia PG, logout, refresh y respuestas tardías, F01 en dos instancias y prueba de identidad ajena.
- [Expected base de variante](../../tests/fixtures/h6-bootstrap-variant/expected-v1.json), [expected integrado](../../tests/fixtures/h6-bootstrap-variant/integration-expected-v1.json) y adendas de adquisición conservadas. Las adendas explican correcciones instrumentales sin rebajar el esperado normativo.

Cada ejecución conserva copia de sus fuentes y sus hashes antes del observado. Un PASS de S05 no autoriza automáticamente el conjunto de integración. Los fallos de instrumento, las puertas rechazadas y el hallazgo de formato de objeto se conservan incluso cuando no implican un defecto en el producto.

## Decisión definitiva propuesta, no aplicada

Si el director decide adoptar el resultado, preparar una revisión sucesora de H6-014 que permita preservar la identidad bootstrap fuente comprobada y satisfaga explícitamente su único CREATE mediante aprovisionamiento. Mantener obligatoriamente: destino exclusivo, aserción OID/nombre, igualdad íntegra de atributos/configuración/grafo, archivo original intacto, derivación reversible, comparación independiente y denegaciones reales. No generalizar la excepción a otros CREATE ni aceptar grants cambiados o autoridades residuales.

Actualizar también el ejemplo de composición Auth a las interfaces R2 ya aceptadas, sin ampliar su alcance; aclarar la representación canónica de ACL predeterminada frente a vacía. Estas propuestas no son modificaciones normativas vigentes.

S11, la aceptación definitiva del procedimiento, cualquier cierre H6-015, publicación y operaciones reales quedan reservados. ARCH-PENDING-002 y DM-PENDING-005 permanecen OPEN.
