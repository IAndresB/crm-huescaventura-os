# F09 — STOP en preflight del auditor

Fecha UTC: 2026-10-12T20:42:28.567086+00:00. Ámbito exclusivamente local/aislado.

La autorización humana excepcional para sustituir documentalmente dos logs queda registrada en `authorization.json`. La sustitución no se ha implementado ni validado. Los dos originales siguen en estado **ORIGINAL NO RECUPERADO**.

## Estado e integridad comprobados

- Rama main, HEAD 8c1109426a8e85effeda6c2bb59c08ac0693c032, origin/main fdbd08bafdc6651d1ad6867242cd71791a25deb6, divergencia 7/0 e índice vacío.
- 233 rutas pendientes al inicio: las 223 del inventario previo y los 10 documentos de recuperación. Las 223 conservan bytes, tipos y permisos; los 10 documentos se conservan íntegros.
- Expected independiente: 24.417 bytes, SHA256 b9f5beaa45c3d4a08f101694115724a6569a43fd590e965f28f9a1ab79c5e639.
- F01: 904 bytes, SHA256 3d123ac41cf6a9da845dd89518fff92c4012db3ede9da6b90f44e69839821ccc.
- F02: 1.917 bytes, SHA256 e5edcf607bde904fc25e5f9665dc45922a96443f7762f97ce6bac4484d54b8ae.
- F16: 1.858.702 bytes, SHA256 8b6c0298b17b7ede0fabb58a264953f0ccfa5e880e89a8d472b3644e870003d7.
- 50 rutas versionadas con manifiestos/snapshots: idénticas a HEAD, archivos regulares, permisos 0644.

## Pérdida documental

- build.log: original 545 bytes, SHA256 063f7ffad5445d9b2a45a17aceb16a01a6dfbbe70032787c0fdd02ea690fd0fa, tomado directamente del inventario previo F02.
- health-independent.log: original 202 bytes, SHA256 2794076bee6b763f2a15c62a692735addf3e6b08e4fa296266b92953489f6f30.

La traza original acredita comandos completados con exit 0, pero carece de sus streams originales. Las ejecuciones posteriores sobrescribieron los nombres mediante tee. Se conservan las copias sobrescritas del directorio de recuperación; sus hashes no se aceptan como originales. La búsqueda documentada no localizó copias exactas en fuentes accesibles y mantiene su limitación de acceso a respaldos externos. `loss-record.json` registra referencias, causa, búsqueda, autorización y límites. No hay nuevas evidencias sustitutorias.

## Revisión suplementaria y bloqueo

Las 94 rutas de supplemental-inventory.json coinciden individualmente en hash, tamaño, tipo y permisos: 8 ya admitidas, 86 pendientes de incorporación literal y 50 nuevas respecto al inventario de 175. Procedencias verificadas: 69 referencias de sesión y 25 referencias al wrapper/status; ninguna desconocida. audit-production.json es JSON válido de auditoría de dependencias local, 277 bytes y SHA256 11124a8c8cd76328bb93c913c49494fd2f63d7a4193871141c812f5b1cffc655. **Rutas incorporadas en esta tarea: 0**. La conformidad con un inventario no convierte su contenido en un PASS histórico.

El comando `node --experimental-strip-types scripts/verify-h5-008-evidence.mjs` terminó con exit 1: `unlisted posterior path: supabase/.temp/cli-latest`, línea 45. La ruta tiene 8 bytes, modo 0644, SHA256 2f99ec07bad208b0108748390c2fe80fb0a91b1784a8f7bf1d303efda7deeaee. Es una de las 223 rutas que deben preservarse y el diagnóstico previo la clasifica expresamente fuera del alcance suplementario F09. No se borra, mueve, excluye ni añade automáticamente a la lista permitida.

Además se registra una incompatibilidad estática posterior: el bucle del auditor contra ff109036 compara R52 con su versión antigua sin rama para la transición exacta autorizada. La ejecución real no alcanzó esa guarda. No se presenta como un segundo fallo ejecutado ni se modifica tras STOP.

## Gates, cambios y siguiente decisión

Preflight Git e integridad, verificación de las 223 rutas y revisión de las 94: PASS en sus respectivos ámbitos. Preflight del auditor: FAIL. Build nuevo, health independiente nuevo, contrapruebas de excepción y preservación global: NO EJECUTADOS tras STOP. No se reutilizan resultados de candidatos anteriores.

Solo se crean cinco archivos nuevos de diagnóstico en este directorio: authorization.json, loss-record.json, verification.json, report.md y created-routes.json. Ninguna ruta previa cambia. Auditor, producto, migraciones, dependencias, contratos normativos, expected y manifiestos permanecen intactos respecto al inicio de esta tarea.

Hace falta una decisión específica sobre la ruta literal de caché compatible con conservar las 223 rutas y mantener el rechazo de rutas ajenas; no basta la autorización de sustituir los dos logs. Después corresponderá resolver/verificar la guarda R52 dentro de su transición exacta autorizada, implementar la sustitución y admisiones literales, ejecutar build/health en rutas exclusivas y demostrar todas las contrapruebas.

F09 sigue OPEN. F06–F08 mantienen pendiente su cierre global. H5-009/010 no se cierran. R67/R030 sigue registrada separadamente, sin causa atribuida. Sin commit, push, publicación, operaciones externas ni tareas posteriores. **Clasificación final: STOP**.
