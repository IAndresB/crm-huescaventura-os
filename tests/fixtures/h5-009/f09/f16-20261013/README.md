# Expediente F16 reproducible — H5-009/010 local/aislado

Esta incorporación conserva el comparador validado y sus evidencias, antes
disponibles únicamente en `.git/f16-corrective/20261013T001249Z/`.
No cierra F09 ni H5-009/010 y no acredita una nueva ejecución de PostgreSQL.

## Fuentes inmutables

- Paquete F16: SHA-256 `0c6427cdc75dfba29c815140761cfc08ddb5522c376ec9f37e6f8a0124e9251a`.
- Comparador incluido, sin cambios: `fd85642e0df6fd387781d813d0b0e2469efc5adb6ac95881b87430a82f80baf0`.
- Candidato anterior: base `eda8b0becb3daa2dff1baa02be53cec914750f13`,
  huella `e55e6b06fefcf3591eee71b02f96e5d2cafebbae8579fcbac93fce75908ed2c9`.
- Auditor anterior conservado en gzip exacto:
  `6a744a03d5aa8598c4a3c5f7fdd90e5fa6c634012513f225341ca86f350b3afa`.

Los registros, inventarios y ejecuciones C12 siguen intactos. La nueva versión
del auditor tiene una transición independiente en `trust.json`; sus bytes y los
de cada ruta suplementaria se validan con un sello suministrado por el revisor.
No obtener automáticamente ese sello calculando el hash del archivo que se
pretende validar: usar el sello entregado en la revisión humana o su registro
externo de confianza. El verificador independiente comprueba todo antes de
invocar el auditor modificado.

## Uso desde un entorno limpio

Requisitos: Python 3.9+, Git con el commit base accesible y Node compatible con
`--experimental-strip-types` (validación original: Node 24). El comparador y
sus contrapruebas no requieren instalar dependencias. La opción `--auditor`
sí requiere las dependencias exactas del lockfile: el control histórico F12
consulta versiones instaladas. Prepararlas en la copia aislada con
`pnpm install --frozen-lockfile --offline --ignore-scripts` cuando la caché
local esté disponible; una caché ausente es una precondición pendiente, no un
PASS. No requiere arrancar PostgreSQL ni usar Supabase CLI, datos reales o
servicios externos.
Ejecutar desde una copia que incluya las modificaciones C12 aprobadas y este
suplemento. Mientras no se autorice el commit, dicha copia es un snapshot del
árbol de trabajo; no es el árbol de HEAD sin sus cambios pendientes.

```sh
python3 -B tests/fixtures/h5-009/f09/f16-20261013/verify.py \
  --seal "$F16_TRUST_SHA256" --auditor
```

`--root /ruta/al/repositorio` permite ubicar el checkout explícitamente. El
verificador usa rutas relativas y directorios temporales. No necesita archivos
privados de `.git`; solo consulta blobs del commit base mediante Git. Para
ejecutar intacto el script original de contrapruebas reconstruye su antigua
ruta relativa de entrada dentro de un sandbox temporal, usando exclusivamente
el paquete C12 ya conservado en el repositorio. No lee el antiguo directorio
privado de ejecución ni escribe en el checkout.

Comprueba los 212 archivos del paquete, reproduce las comparaciones F16 sobre
las salidas archivadas, ejecuta las 43 contrapruebas originales sin cambios y,
con `--auditor`, verifica la preservación histórica. Un fallo produce salida
distinta de cero. Los resultados se imprimen en stdout; conservar cada nueva
salida en una ruta exclusiva, sin sobrescribir evidencias anteriores.

## Alcance y límites

Solo pueden variar los OID de las dos funciones autorizadas. El comparador,
los originales F16, los expected y los manifiestos históricos no se modifican.
Las 69 diferencias de hashes de tablas se evalúan separadamente con la prueba
C16 de preservación dentro de cada ejecución; no equivalen a una comparación
fila a fila entre bases históricas independientes.

`build.log` y `health-independent.log` siguen como **ORIGINAL NO RECUPERADO**;
los hashes originales y la sustitución documental autorizada permanecen
intactos. R67/R030 sigue como anomalía independiente de causa no demostrada.
Los PASS archivados conservan su candidato anterior. La incorporación actual
no modifica los estados de cierre ni autoriza commits, publicación, H5-011/012,
H6, Hosted, Production o conectores reales.

`portability-evidence.tar.gz`, cuando conste en el registro sellado, contiene
los resultados de la prueba de incorporación y sus rechazos esperados. Los
sellos de cada fase constan en los recibos; no se relabelan como pruebas del
último candidato.
