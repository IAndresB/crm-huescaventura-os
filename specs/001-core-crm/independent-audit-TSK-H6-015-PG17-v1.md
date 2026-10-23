# H6-015 — Auditoría independiente del correctivo PostgreSQL 17, v1

Fecha: 22 de octubre de 2026. Base `971c55d5ce5770c71284d106d3c0deecca9514b5`. Worktree exclusivo del auditor: `/Users/andres/.codex/worktrees/h6-pg17-audit/crm-huescaventura-os`.

**Dictamen: causa reproducida independientemente; 26/26 comprobaciones satisfactorias del mecanismo. No se acredita un correctivo compatible con r3 ni restauración Core/Storage.** H6-015 sigue IN PROGRESS; cierre y S11 no autorizados.

## Independencia, expected y alcance

El auditor no ha escrito en candidatos del ejecutor ni reutilizado su harness. Se creó un instrumento Python propio que invoca los binarios PostgreSQL 17.11 de Postgres.app. El [expected v1](../../tests/fixtures/h6-pg17-independent/expected-v1.json), SHA-256 `9f7fd3923553852dc9af9747051cf04e561d1fee4f73cf5a15196e9060224e83`, fue guardado antes de ejecutar ninguna prueba. Incluye hashes de Constitution, Spec, Plan, Tasks, Architecture, Decisions y r3. Las restricciones del director actual prevalecen sobre estados de preparación históricos.

El [instrumento independiente](../../scripts/audit-h6-pg17-grantor.py) creó dos clusters nuevos mínimos, exclusivamente sintéticos, accesibles mediante sockets Unix privados. `listen_addresses` vacío se comprobó en ambos. Logs del motor dirigidos a `/dev/null`; los errores originales no se imprimen ni se incluyen en el informe: solo SQLSTATE, función/archivo/línea y códigos de salida. No se usan credenciales ni datos reales. No se ejecutó código de integración Core/Auth/Storage.

[Recibo de ejecución](../../tests/fixtures/h6-pg17-independent/mechanism-1792677784912825000.json): 26/26; todos los clusters propios detenidos. Recursos conservados en `/tmp/h6pg-audit-w3564rmo`; globals SHA-256 `b42f145d8812270baae3f249c8e95fd1fd5ebc14ee820738237e6dd8f971487f`. Su eventual custodia persistente se acredita mediante un recibo separado; este informe no presume que ya exista.

## Causa acreditada

1. El origen tiene el rol `audit_origin` con OID 10. Concede una membresía a `audit_actor` sobre `audit_group`, con ADMIN=false, INHERIT=false, SET=true. El catálogo registra grantor `audit_origin`.
2. Se captura el globals completo mediante `pg_dumpall --globals-only --no-role-passwords`. No se filtran, sustituyen ni eliminan instrucciones.
3. El destino tiene bootstrap `audit_dest`, OID 10. La carga íntegra del globals en una transacción falla con **42501 / check_role_grantor**. La consulta posterior acredita rollback: ninguno de los tres roles importados queda creado.
4. En una contraprueba mínima separada se crean todos los roles antes del GRANT. El nombre importado `audit_origin` recibe un OID distinto de 10, aunque su atributo SUPERUSER sea verdadero. Ejecutar como bootstrap destino, SET ROLE al superusuario importado o SET SESSION AUTHORIZATION a este reproduce 42501. No es un problema de orden de CREATE ROLE ni de falta de superusuario ejecutor.
5. Un GRANT sin `GRANTED BY`, ejecutado por ese superusuario, sí funciona, pero se atribuye a `audit_dest`. Esta diferencia aparece en catálogo y el comparador la rechaza: éxito SQL no equivale a preservar el grantor.
6. Dar ADMIN OPTION al grantor importado permite la concesión explícita, pero añade una arista ajena al grafo del origen. REVOKE ADMIN OPTION ... RESTRICT falla con **2BP01** y conserva el grafo. CASCADE elimina la concesión dependiente. El resultado final no equivale al origen.

PostgreSQL separa permiso del ejecutor e integridad de la atribución. Para una membresía, el grantor explícito debe ser el bootstrap OID 10 o poseer ADMIN OPTION; ser otro superusuario no sustituye esa condición. Los grants explícitos no bootstrap dependen de la ADMIN OPTION que los sostiene. [GRANT PG17](https://www.postgresql.org/docs/17/sql-grant.html), [REVOKE PG17](https://www.postgresql.org/docs/17/sql-revoke.html), [implementación PG17.11](https://raw.githubusercontent.com/postgres/postgres/REL_17_11/src/backend/commands/user.c).

El nombre de un rol no transporta su OID. Una restauración lógica tampoco conserva por defecto esa identidad interna. El conflicto particular es que r3 S05 exige un bootstrap destino distinto de todos los roles fuente, carga íntegra de globals y no ignorar colisiones; S09 no permite normalizar grantors/membresías. La única equivalencia de OID10 autorizada es para miembros C no SECURITY DEFINER de pgcrypto con ACL inicial, no para grants del CRM. Estas restricciones son del procedimiento aprobado; PostgreSQL no prohíbe de forma general recuperar en un cluster cuyo bootstrap conserve el nombre fuente.

## Alternativas evaluadas

| Alternativa | Viabilidad y autoridad resultante | Equivalencia / riesgo | Cambio de procedimiento y reproducibilidad | Core / Storage / Auth |
|---|---|---|---|---|
| Mantener r3 y usar superuser, SET ROLE o SESSION AUTH | Reproducido: 42501; grantor importado sigue sin ser OID10 ni tener ADMIN | No supera S05; no otorga permisos extras | No cambia r3, pero falla en cluster nuevo | Bloquea grants afectados; Auth dedicado sin ese grafo no depende de ello |
| Cambiar solo orden de roles/grants | Todos los roles ya existían en la contraprueba; falla igual | El orden no crea la autoridad ausente | No basta un ajuste de orden | Mismo problema para cada grafo con grantor bootstrap importado |
| Añadir ADMIN y retirarla al final | GRANT funciona; RESTRICT falla y CASCADE borra descendientes | No conserva grafo exacto; una arista permanente mantiene administración y afecta revocación/democión futura | Exige admitir otra membresía o perder concesiones; no seleccionado | No aceptable como correctivo Core/Storage; tampoco debe generalizarse a Auth |
| Omitir o sustituir GRANTED BY | El GRANT implícito funciona y queda atribuido al bootstrap destino | Cambia grantor, raíz de concesión y futura revocación; falla igualdad | Requiere otra política de equivalencia y SQL de globals modificado | Técnicamente posible, normativamente no admisible ahora |
| Preservar bootstrap fuente como OID10 y nombre original | Propuesta técnica razonada, **no implementada** | Evita traducir raíz del grafo; exige comparar atributos, configuraciones y todas las membresías sin normalización | Revisar bootstrap distinto y tratamiento estricto de CREATE ROLE preexistente; diseñar variante nueva con verificador antes de ejecutar | Evaluar por cluster Core y Storage; Auth compartido debe cotejarse, PASS dedicado anterior se preserva |
| Restauración física / otra herramienta de copia | Conserva potencialmente identidades de catálogo, pero no se ensayó | Tiene otras exigencias de versión, plataforma, aislamiento y configuración | Sustituye el mecanismo lógico de r3 y necesita captura/receta aprobada propia | No deducir compatibilidad ni recuperación de objetos Storage separados |
| Modificar catálogos, forzar OIDs o silenciar errores | No ejecutado | Manipulación fuera de garantías de recuperación lógica; posibles catálogos incoherentes | Fuera de esta autorización y de r3 | Rechazado |

La vía preferible para una **decisión posterior** es preservar la raíz bootstrap original y revisar explícitamente el tratamiento de su CREATE ROLE; no añadir privilegios ni normalizar el grafo. Esto no constituye autorización para implementar esa variante y no prueba todavía su seguridad de extremo a extremo.

## Seguridad, contrapruebas y límites de la conclusión

Ocho mutaciones instrumentales separadas comprueban que se detectan cambios de rol concedido, miembro, grantor, ADMIN, INHERIT y SET, así como concesiones omitidas o añadidas. Las capturas del motor verifican los grafos antes/después de ADMIN y REVOKE. Son pruebas del mecanismo de autorización y del comparador: **no prueban RLS de actores, ACL de objetos, dueños, datos, versiones, extensiones ni compatibilidad integrada Auth R2 sobre Core/Storage restaurados**. Esas comprobaciones dependen de una restauración permitida y siguen pendientes.

No se afirma una imposibilidad absoluta de todas las estrategias PostgreSQL imaginables. Se acredita que las soluciones ordinarias examinadas no cumplen simultáneamente la receta r3 y el grafo exacto del origen. Una estrategia de nombre/OID diferente o una normalización exige una decisión del director según su instrucción expresa de no implementar cambios de restricciones normativas.

## Continuidad y cierre

La auditoría permite mantener el diagnóstico y proponer una revisión concreta del procedimiento. No habilita ejecutar S06–S10 sobre un Core/Storage incompleto ni convertir los PASS Auth independientes anteriores en aceptación integral. AC-073/AC-074 siguen pendientes. ARCH-PENDING-002 y DM-PENDING-005 siguen OPEN. No se han editado r3, expected previos, manifests, FAIL históricos, evidencias Auth ni dictámenes anteriores. No hay staging, commit, push, publicación o Drive.

**STOP limitado a la variante de recuperación que requeriría modificar r3.** Custodia y análisis independientes autorizados pueden continuar.

## Adenda de cotejo del ejecutor y custodia persistente

Se revisó el código `scripts/h6-015-pg17-diagnosis.py` del worktree ejecutor nuevo y su recibo `diagnosis-1792678004452660000.json`. Los hashes del script y expected se verificaron de forma independiente. El expected ejecutor es `6901d4027685963fdd2e93eac2d009c64b2e44bac07dd366e0062f488aeec83f`.

Sus **42 comprobaciones** son de diagnóstico: cargan globals históricos completos Core/Storage en dos destinos nuevos, observan 42501 y rollback; en otros dos recursos separados cargan exclusivamente el prefijo previo al primer GRANT para observar el rol importado y volver a emitir esa concesión literal. Los prefijos se etiquetan correctamente como diagnóstico, no restauración aceptada. Core importado tiene OID 16396 y Storage importado OID 16387 frente al bootstrap destino OID 10. No se cargaron las bases después del fallo de globals. El auditor ha cotejado código, recibos y hashes de inputs, y ha reproducido separadamente el mecanismo con su instrumento mínimo; no presenta como ejecución propia los cuatro recursos del ejecutor.

**Custodia persistente v1: 17/17 comprobaciones independientes PASS.** El [lector propio](../../scripts/audit-h6-pg17-custody.py) congeló un [expected separado](../../tests/fixtures/h6-pg17-independent/custody-expected-v1.json) antes de adquirir datos. El [recibo independiente](../../tests/fixtures/h6-pg17-independent/custody-and-diagnosis-review-v1.json) acredita:

- Relectura completa de **32.754 archivos originales y sus copias**, **1.172.113.768 bytes**; igualdad individual de tamaño y SHA-256 con el inventario.
- Inventario privado SHA-256 `7cd26c6f47df84ec41aac22171c2a502ff0a404e428fd204f7481b627719bdc9`, íntegro y exhaustivo para el paquete v1.
- Archivos de copia 0600, directorios 0700, propietario del usuario actual, sin symlinks ni entradas ACL allow; se usó lectura nativa de ACL sin exportar contenido o líneas.
- Raíz fuera de Git/Drive: `/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-pg17`. Los originales temporales siguen presentes e íntegros.
- Ningún valor de dumps, claves, factores, tokens o configuración se incorpora a estos recibos: únicamente hashes, contadores y resultados de control.

Este cotejo se refiere al paquete v1 cerrado de 14 recursos históricos. Los clusters diagnósticos nuevos del ejecutor y auditor se custodiarán en una adenda separada; su cobertura no se presume en estos 32.754 archivos. La custodia mejora la conservación, pero no cambia el resultado S05 ni constituye publicación, réplica externa o ensayo de recuperabilidad del soporte físico.
