# Evidencias propias TSK-H5-017 — Bloque A

Todos los datos son sintéticos. No ejecución de H5-018/H6 ni servicios externos de negocio.
`preflight` recoge la base y los hashes antes del primer cambio; los manifiestos `*.inputs.json` identifican producto y verificadores de cada ejecución. Cada captura posterior al arranque inicial incluye comando, fechas, salida, errores y estado real. Los FAIL y snapshots originales se conservan; un retest no los sustituye.

`01` falla en la preparación de Storage antes de iniciar pruebas: caché efímera incompleta. `02` y `07` son fallos de tipos de fixtures nuevos. `03` detecta correlación incompleta de historia; `05` confirma el enlace corregido y descubre una expectativa de recuento demasiado estrecha del verificador. `06` conserva los fallos del verificador de sesión y comando. `08` conserva la expectativa incorrecta de excepción para propietario bajo FORCE RLS. `10` es la primera focal completa PASS26/26. `11` amplía las contrapruebas funcionales y de seguridad; no se suma a `10` como pruebas nuevas distintas.

Los snapshots comprimidos son únicamente candidatos originales H5-017. No se cambia ningún artefacto anterior. Los hashes SHA-256 son de bytes sin comprimir salvo cuando el nombre indique el fichero gzip.

El candidato corregido acredita `26-corrective`57/57 (32 nuevas y25 H0 repetidas), `27-regression-on64-final`104/104, `28-unit-final`201/201 y `31-health-final`1/1. La primera completa16 permanece FAIL2762/2787 por F02. La completa corregida36 es una ejecución limpia2788/2788. El verificador interno recupera los originales de las dos versiones preparatorias de sí mismo y reconstruye las cuatro copias temporales exactas a partir de los fuentes protegidos; no omite comparaciones de producto.
