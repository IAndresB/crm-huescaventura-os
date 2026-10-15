# F14 — solicitud de autenticación externa del expediente sucesor

Estado: PREPARADO; NO APROBADO EXTERNAMENTE. Esta solicitud no genera un sello de aprobación.

## Acción humana necesaria

Revisar por un canal independiente de esta ejecución el expediente completo
`tests/fixtures/h5-011/f14-successor-20261015/`, en particular el diff de la guarda,
verify.py, audit.py, counterproofs.mjs y manifest.json. Calcular con una herramienta
independiente el SHA-256 de trust.json y comprobar que sus nueve entradas
identifican los bytes revisados del lanzador y auditor antes de ejecutarlos.
El bootstrap de README.md permite esa comprobación sin ejecutar el expediente.

Si la revisión resulta conforme, el revisor debe suministrar expresamente el
sello obtenido y su aprobación de este alcance por un mensaje humano o registro
externo de confianza. Copiar el checksum de esta solicitud no demuestra que se
haya realizado la revisión. Una frase genérica como «continúa» sin autenticar
los artefactos no satisface esa puerta. No se necesita una credencial secreta:
el protocolo publicado admite un sello SHA-256 revisado y suministrado externamente.

El checksum siguiente es únicamente el valor de preparación a contrastar.
No se ha utilizado como argumento aceptado del lanzador, no es una firma y no
se declara aprobado por calcularlo en esta ejecución.

## Valores exactos para la revisión

| Artefacto | Bytes | SHA-256 |
|---|---:|---|
| trust.json, checksum candidato para revisión | 5458 | `517619e94784ffbbf6267db25ba270d200927c3be1d3b2a998b11b2ef5ce2d97` |
| README.md | 8091 | `2dbd47cfcb5fed6c35d0a20eca50d9e0867ff0c767094bfabd4b11d6b16236cb` |
| guard-before.ts.txt | 11370 | `8a422285bd817982eeb9c8785616aed07a209121ea7290b9075a1348f3ba49f5` |
| guard.candidate.ts.txt | 13983 | `722780f466a8d1f490ad3a4b993dfc1cda49bb1ee09242c1c7bbc192d09f8aa2` |
| guard-transition.diff | 3443 | `c15dde7184c22f97e813ed874e4b6ba54d54de0d905dd5859248c8381f364f41` |
| transition.record.candidate.json | 640 | `33797865bfebaf7e19649a805d47eafb232afff424d87aad6874d9a4a3eb4bcb` |
| manifest.json | 13474602 | `308a194b8c1fc62f952f47e93440b3d1b14695d579eb334abf9fa194b10c79c8` |
| verify.py | 4238 | `20de46fa028829c3f3bf33482876a799a3fec2fbdb3f26df2de294e2ea3816be` |
| audit.py | 11116 | `5bc238a279cf7d69ecbc4dbbfaa0c249c2ced99a2be61b4c9e5bcce7c22e748d` |
| counterproofs.mjs | 7645 | `5e7fd33c3dd77033c2e8442adbc2e9146701c72f7bb727160f8656f946dad7f1` |

Todas las entradas deben ser archivos regulares0644. El registro de confianza
es la raíz del NUEVO expediente únicamente cuando su sello sea aceptado por el
revisor externo; no sustituye ninguna raíz histórica.

## Alcance literal que debe aprobarse

- Publicado:71906987f9b74241cc4583e51498759829cded73; HEAD:1346dd64ec2e9e804be23b17ea5f62f64515339c.
- Fixture:tests/support/h4-modification-fixtures.ts; histórico7739f5603d576a41855c0d1238f1f2535568e2dd34f4a8fd0f48d35fec8d75ed; candidato5cb28867ff6bbba211ff04fd65dc39f8d00c26727957bcc3d827e37708cd14d2. No modificarlo nuevamente.
- Guarda:tests/support/h5-006-dependency-preservation.ts; original8a422285bd817982eeb9c8785616aed07a209121ea7290b9075a1348f3ba49f5; sucesor722780f466a8d1f490ad3a4b993dfc1cda49bb1ee09242c1c7bbc192d09f8aa2. Aplicar exclusivamente guard-transition.diff autenticado.
- Copiar transition.record.candidate.json, sin alterar su contenido, a tests/fixtures/h5-011/f14-20261014/transition.authorized.json después de autenticación. Antes, esa ruta no existe.
- Expected intacto67346bytes/SHA256669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b.
- F09, sus sellos, los expedientes C12/F16, los manifiestos y logs antiguos permanecen inmutables. El auditor F09 histórico conserva su hash76cc03c62286a9cb9c2659dad8d3475e847f63fa861b98d0e2aabc0256ff0ec2.
- Auditor original sobre copia del snapshot publicado71906987; auditor sucesor separado sobre los archivos actuales. No atribuir resultados históricos al producto actual.
- Contrapruebas previstas:31 resultados exigidos, entre aceptaciones legítimas y rechazos de manipulación. NO EJECUTADAS antes de la autenticación.
- Después: guardas/contrapruebas/auditoría, R06/H4-012/consumidores y regresión integral autorizada con runner aislado. No modificar contratos normativos, expected, seguridad ni pruebas para conseguir PASS.
- Sin staging, commit, push, Hosted/Production, operaciones externas o H5-012. F14 solo cerrará tras todas las comprobaciones exigidas.

## Comprobaciones ya realizadas y límites

Hashlib estándar contrastó las nueve entradas, objetos Git35942, entradas H5-011135,
manifestación de las125 evidencias anteriores (incluidas36 iniciales), predecesores,
diff y registro literal. Sintaxis Python/JavaScript y TypeScript de la guarda
comprobada sin ejecutar el auditor ni la guarda. Los intentos de comprobación
TypeScript con API no disponible y --check antes de stripping se conservaron;
el análisis sintáctico corregido pasó, sin cambiar dependencias o código.
El lanzador rechazó ausencia de sello (exit2) y sello incorrecto (exit1) antes
del auditor. No se ha probado una aceptación con el checksum generado aquí.

R06/suplemento45/45 anterior conserva el inventarioa88f185697b7bc4a7727ec768af758e4aaabfae52bc8a59d5c40afacea85fea3.
La regresión anterior2492/2493 conserva su FAIL. No nuevas suites funcionales,
no auditor sucesor ejecutado, no contrapruebas futuras declaradas PASS.
H5-011 aún tiene comprobaciones integrales y contrastes de cobertura pendientes;
la preparación de confianza no acredita41/41 ni la revisión independienteH5-012.

No consta un firmante independiente configurado y autorizado en el procedimiento
accesible. El protocolo F09 remite al revisor humano; la configuración Git no
identifica signingkey/gpg.format y la herramienta Code Review disponible solo
lee diagnósticos CI de PR. No se han buscado claves privadas, accedido a un
keychain ni invocado un servicio de firma o publicado mensajes externos.

STOP exclusivamente en la puerta de autenticación externa. F14 OPEN; H5-011
IN PROGRESS; H5-012 NOT STARTED. Tras recibir un sello externo válido no será
necesario rehacer esta investigación; se seguirá README.md sobre estos bytes.
