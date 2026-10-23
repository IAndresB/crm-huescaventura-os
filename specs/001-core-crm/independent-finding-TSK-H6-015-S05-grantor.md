# H6-015 — Hallazgo independiente S05: grantor del bootstrap

22 de octubre de 2026. **MATERIAL / RECETA R3 BLOQUEADA EN EL ALCANCE AFECTADO. Sin PASS de restauración.** Investigación de solo lectura; no se ha ejecutado SQL ni creado un cluster por el auditor.

## Evidencia recibida y grado de comprobación

El ejecutor comunica fallo real de la importación de globals PostgreSQL 17.11 sobre destino nuevo: SQLSTATE `42501`, función `check_role_grantor`, archivo `user.c`, línea diagnóstica 2259. Su [recibo](</Users/andres/.codex/worktrees/h6-restore-execution/crm-huescaventura-os/tests/fixtures/h6-015-execution/globals-diagnostic-1792669484667.json>) identifica el archivo privado mediante SHA-256 `e5f061a18134206087a41888a70347449b5c6a4741fa243a097ed2d0736d5ac5` y el primer fallo en la línea 62.

He leído ese recibo saneado; no he leído el dump sensible ni asumido sus conclusiones como prueba independiente de runtime. El ejecutor identifica grants `GRANTED BY h2_bootstrap`, capturados cuando ese nombre correspondía al bootstrap del origen. La causa se contrasta independientemente con la documentación PG17 y el código de la versión `REL_17_11`.

## Causa independiente

En un GRANT de membresía, el grantor registrado debe ser el bootstrap o poseer ADMIN OPTION sobre el rol concedido. Esta condición preserva la integridad de la cadena de concesiones; no desaparece por ejecutar como superusuario. [PostgreSQL 17 GRANT](https://www.postgresql.org/docs/17/sql-grant.html).

`check_role_grantor` comprueba la identidad OID del bootstrap, no su nombre ni el atributo SUPERUSER. Si el grantor explícito no es OID10, exige que sea un administrador válido del rol. Sin grantor explícito, una ejecución superuser se atribuye al bootstrap destino. Por tanto, `SET ROLE` o `SET SESSION AUTHORIZATION` al nombre importado no restablecen su antigua identidad OID10. [Código PG 17.11, user.c](https://raw.githubusercontent.com/postgres/postgres/REL_17_11/src/backend/commands/user.c).

R3 exige bootstrap destino distinto de todos los roles capturados, importación íntegra de globals, conservación de nombres/atributos/membresías/grantors y ninguna normalización general. El antiguo bootstrap se recrea entonces como otro rol; el OID10 pertenece al bootstrap nuevo. La correspondencia limitada de miembros C de pgcrypto no cubre esta situación.

## Alternativas descartadas dentro de la autorización vigente

| Alternativa | Motivo |
|---|---|
| Más privilegios del ejecutor, SET ROLE o SESSION AUTHORIZATION | No cambian el grantor explícito ni su identidad OID10. |
| ADMIN OPTION temporal al antiguo bootstrap | Añade una arista no existente en origen. Las concesiones hechas por él dependen de esa arista; eliminarla con RESTRICT falla si hay dependientes, y CASCADE elimina dichos grants. No recupera el grafo exacto. |
| ADMIN OPTION circular para retirar la arista adicional | PostgreSQL comprueba también circularidad entre miembro y grantor. |
| Omitir GRANTED BY o sustituirlo por el bootstrap nuevo | Cambia la atribución/membresía capturada; excede r3. |
| Reutilizar nombre del bootstrap origen como OID10 | Exige otra receta de aprovisionamiento/importación y tratamiento explícito del CREATE ROLE existente; contradice la exigencia r3 de bootstrap distinto. No se ejecuta como arreglo tácito. |
| Forzar OID o cambiar pg_authid/pg_auth_members | Manipulación de catálogo fuera de alcance; no es recuperación lógica r3. |

La dependencia y revocación de ADMIN OPTION se conservan en PostgreSQL 17, incluidas membresías desde PostgreSQL 16. [PostgreSQL 17 REVOKE](https://www.postgresql.org/docs/17/sql-revoke.html). El tratamiento de circularidad y la excepción exclusiva del bootstrap aparecen también en `AddRoleMems` del código fijado.

## Dictamen y continuidad permitida

Con las restricciones simultáneas vigentes, **no se identifica una solución técnica que conserve el grafo exacto mediante la receta r3 sin cambiar esa receta o añadir/normalizar privilegios**. Es una incompatibilidad material de la variante de restauración, no una razón para debilitar el expected o reintentar el mismo destino.

Una variante que preserve la identidad del bootstrap de origen podría investigarse tras revisión expresa del procedimiento; eso sería una adaptación técnica nueva, no una regla de negocio nueva. Aquí solo se identifica esa frontera, sin proponer comandos ejecutables ni concederse su aprobación.

Conservar FAIL, dump protegido, destino fallido y diagnósticos. Mantener bloqueado el restore Core afectado; Storage necesita comprobar su propio grafo y no se declara fallido solo por analogía. Auth puede continuar como actividad separable si su recurso y globals son independientes y no dependen de la importación fallida; un PASS Auth aislado no cierra Core, Storage, AC-073 global ni H6-015. S11 sigue prohibida y los dos pendientes globales siguen OPEN.

Para acreditar definitivamente la causa en runtime faltaría una contraprueba independiente con recursos/SQL autorizados o una lectura independiente de catálogo/roles bajo autorización. La concordancia documentación/código/diagnóstico es fuerte, pero este dictamen no se presenta como esa ejecución.
