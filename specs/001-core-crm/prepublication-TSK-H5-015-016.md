# H5-015/H5-016 — Prepublicación controlada

2026-10-16. **Dictamen: READY TO PUBLISH.** Aceptación técnica preliminar exclusivamente del candidato corregido auditado por H5-016. El candidato original mantiene FAIL. Esta fase prepara una publicación íntegra y reproducible; no crea commit, push ni despliegue, ni acredita Hosted/Production. H5-017 y H6 no se inician.

## Base y preflight sin modificación del candidato

`git fetch origin` terminó con exit0 contra el remoto autorizado `git@github.com:IAndresB/crm-huescaventura-os.git`. Rama main; **HEAD = main = origin/main = `ff0ad6c6e505914f31eb15d56725179c9f065426`**, divergencia0/0 e índice real vacío. La base publica H5-013/H5-014 con el asunto `feat(crm): evaluar cierres Booking con auditoría H5-014`.

Antes de escribir se verificaron los112 archivos recibidos: seis modificados,106 nuevos, cero eliminados, cero extras y modos/tamaños/hashes correctos. Los111 registros del inventario más su propia ruta excluida forman112; no se interpreta su autoexclusión como un archivo ausente. El índice real tiene SHA256 `d9c770b38e1914efa94792bdcca6997e765cb3711f39baf927d9282866394092`; se conserva byte a byte.

[Preflight y detalle independiente de los112 archivos](../../tests/fixtures/h5-016/prepublication-20261016/preflight.json). Los11.232 archivos ignorados se inventarían separadamente con tipo/modo/tamaño/hash:245 bajo `.next`,10.986 bajo `node_modules` y `tsconfig.tsbuildinfo`. Son cachés, instalación y compilación; quedan fuera del árbol propuesto. No hay `.env` ignorados ni inputs requeridos ocultos. El inventario comprimido de ignorados es evidencia de exclusión; no incorpora sus contenidos.

## Identidad exacta y definición de hashes

| Objeto | SHA256 de los bytes del archivo |
|---|---|
| Manifiesto recibido `tests/fixtures/h5-016/final-inputs.json` | `f72596dafa448cbba1d3ddb1525aab57097a4992f40bc0712da2eb444008f30d` |
| Inventario recibido `tests/fixtures/h5-016/candidate-inventory.json` | `b794a70d60ed68f4b07f275287c24b5a6588bad7b4657e819a6a4725d960d555` |
| Migración63 corregida | `a58cb35c5a6fad3c78580377218bc6e8839bdeb0ac62cbe68cfd3919e38043b0` |

Se recalcula SHA256 de los bytes de cada uno de los456 inputs, sin normalizar JSON, finales de línea ni texto y sin concatenar entradas. **456/456 idénticos**:103 de producto,63 migraciones (62 históricas y63 nueva),280 pruebas/soporte, seis verificadores/runners y cuatro de configuración. Los fixtures/evidencias archivados, recibos, documentos e inventarios tienen control adicional mediante el inventario de entrega. No se confunde el hash de un gzip con el de su contenido descomprimido: se verifican ambos conforme a cada recibo.

El correctivo del evaluador compartido permanece idéntico: rechaza condiciones finales JSON null/vacías, datos incompletos de fianza y modificaciones sin partes. También se conservan exactamente invalidación persistida, reapertura fundada, raíz transaccional Booking, evidencia e historial y revalidación de permisos. No se altera producto, migración ni prueba para superar integridad.

[Detalle de456 inputs y categorías](../../tests/fixtures/h5-016/prepublication-20261016/inputs-verification.json). El nuevo verificador de prepublicación es una herramienta de empaquetado separada, no un input funcional que se atribuya retrospectivamente a H5-016.

## Preservación y transición documental

Se contrastan los36.657 archivos publicados con sus objetos Git y modos; solo difieren los seis archivos modificados ya declarados por el candidato. Quedan intactas las62 migraciones históricas, incluida62, los42 expected congelados, los36.008 archivos históricos de fixtures, DECISIONS, Constitución, Business Rules, Domain Model, State Machines, arquitectura, Spec y Plan. La única migración nueva es63. No se amplían excepciones de formato ni se reescriben contratos económicos.

Los informes, FAIL, manifiestos y recibos de H5-015/H5-016 se conservan sin modificación. Se añade estado de coordinación a PROJECT-STATUS, NEXT-STEPS y Tasks: H5-013/H5-014 publicadas; H5-015 implementada y auditada local con aceptación preliminar; H5-016 completada local; publicación H5-015/H5-016 pendiente; H5-017/H6 no iniciadas. Hosted/Production y pendientes globales mantienen sus límites. En Tasks solo se añade el encabezado de estado y se precisa la frase de ejecución H5-015; ninguna fila normativa ni criterio cambia en esta fase.

Las tres versiones documentales auditadas se conservan completas en gzip, con hashes antes/después en [document-transition.json](../../tests/fixtures/h5-016/prepublication-20261016/document-transition.json). El inventario original permanece intacto: sus tres discrepancias documentales actuales están explicadas por esa transición sucesora. [Preservación contra base](../../tests/fixtures/h5-016/prepublication-20261016/preservation.json).

## Seguridad y alcance del conjunto

Examen de contenido plano, gzip y tar anidados, integridad CRC y revisión de fuentes/rutas: no se detectan credenciales, tokens de proveedor, claves privadas ni datos personales/económicos de clientes reales. Los únicos endpoints del material auditado son loopback y documentación de Supabase. Las rutas absolutas históricas identifican el entorno local de ejecución y PostgreSQL; se conservan como procedencia técnica, sin exponer secretos. Los documentos nuevos no incorporan rutas personales adicionales. Solo hay archivos regulares100644 en el conjunto; gzip/tar son evidencia declarada, sin binarios ejecutables ni dependencias vendorizadas añadidas.

La migración63 conserva RLS/FORCE RLS, roles sin privilegios de superusuario/bypass, ACL limitadas, search_path fijo, inmutabilidad y doble revalidación comprobados en H5-016. La inspección actual verifica sus bytes y el catálogo/evidencia auditados; no se presenta como una nueva ejecución de la base ni cambia seguridad funcional. [Control de contenido](../../tests/fixtures/h5-016/prepublication-20261016/content-screen.json).

## Correspondencia con las pruebas existentes

No se repite regresión funcional: los456 inputs son idénticos y las evidencias finales son suficientes. Se comprueban los resúmenes superiores finales, hashes de logs comprimidos/descomprimidos y vínculo al manifiesto; los FAIL históricos anidados no se interpretan como resultados del completo final.

| Ejecución H5-016 conservada | Resultado verificado en esta fase |
|---|---|
| PostgreSQL completo final | **2756/2756 PASS**, cero FAIL/cancelados/omitidos; una ejecución limpia. |
| Focal conjunta | **78/78 PASS**:41 H5-015 +37 contrapruebas H5-016. |
| Evaluadores sobre63 | **66/66 PASS**; regresión adicional que se solapa con otros recuentos. |
| Unitarias / health independiente | **197/197 y1/1 PASS**. |
| Concurrencia real |13 escenarios nuevos identificados por nombre;25 existentes reejecutados en la focal. |
| Instalación, typecheck, lint, build | Recibos exit0 del candidato exacto; no reejecutados aquí. |
| Dependencias | Audit registrado:0 vulnerabilidades; no se cambian dependencias. |
| V-DOM/V-DAT/V-MIG | Auditoría local PASS; fresh63, upgrade62 poblado, rollback/retry, permisos y atomicidad conservados. |

2756 =2678 históricos +41 H5-015 +37 H5-016. No se suman78 ni66 al completo; health se mantiene separado. El original FAIL incluye la reproducción de dos cierres indebidamente persistidos con JSON null y `{}`. El correctivo mínimo permanece en63; los16 fallos anteriores se conservan como2700/2716 y se explican por14 preparaciones con puerto compartido y dos fixtures incompletos. No se relabelan como PASS. [Reconciliación de casos, logs y recibos](../../tests/fixtures/h5-016/prepublication-20261016/receipts.json).

## Conjunto de publicación, índice y árbol

**127 archivos propuestos: seis modificados,121 nuevos y cero eliminados.** Son los112 recibidos, con solo las tres transiciones documentales descritas, más15 archivos nuevos de esta fase: este informe, el verificador, ocho JSON, el estado Git en texto, el inventario de ignorados gzip y tres originales documentales gzip. El detalle literal de rutas lo gobierna el inventario sucesor.

[Inventario final propuesto](../../tests/fixtures/h5-016/prepublication-20261016/inventory.json): ruta exacta, tipo, estado A/M, modo, bytes, SHA256, procedencia y categoría. Enumera126 entradas y excluye explícitamente su propia ruta; total127. No modifica retrospectivamente el inventario112.

Se prepara el conjunto completo con `GIT_INDEX_FILE` y `GIT_OBJECT_DIRECTORY` temporales; los objetos de base se leen por alternates. Se comprueban rutas, estados, modos y SHA1 de cada blob staged contra sus bytes reales, evitando filtros o normalizaciones silenciosas. **Control completo de formato: `git diff --cached --check` exit0, sin diagnósticos.** No se usa el índice real ni se escriben objetos persistentes nuevos. No se aplica ninguna excepción histórica de formato.

El árbol se calcula dos veces en índices y almacenes de objetos independientes. El SHA256 del inventario y el SHA1 del árbol se entregan en un recibo externo al árbol y en el dictamen final: incluir un identificador de árbol dentro de un archivo del propio árbol crearía una autorreferencia imposible. Este informe y todos los recibos versionables sí pertenecen al árbol sellado. El futuro SHA del commit todavía no existe.

Reproducción desde este workspace sin modificarlo:

```sh
python3 scripts/verify-h5-015-016-prepublication.py
```

El verificador vuelve a comprobar identidad,456 inputs,112 archivos recibidos salvo transiciones documentales archivadas, inventario sucesor, conjunto completo, formato, blobs y dos árboles. No hace fetch ni pruebas funcionales; antes de una publicación futura se debe revalidar el remoto. [Control del índice](../../tests/fixtures/h5-016/prepublication-20261016/format.json) y [estado Git final](../../tests/fixtures/h5-016/prepublication-20261016/git-final.txt).

## Recomendación y parada

Propuesta de un único commit atómico, **sin ejecutarlo**:

```text
feat(crm): cierre conjunto Booking y auditoría H5-016
```

Debe incluir implementación corregida, migración63, pruebas, FAIL originales, auditoría y sucesores documentales completos del inventario final. No aceptar/publicar la versión original defectuosa. La publicación definitiva requiere una instrucción posterior referida al árbol e inventario sellados.

Riesgos residuales conservados: local/sintético; las carreras de factura, servicio y cancelación prueban exclusión/rechazo sobre Bookings pendientes, no una venta externa integral liquidada; sin acreditación Hosted/Production, H6 ni carga productiva. Cualquier cambio posterior exige verificar otra vez el conjunto y, si afecta inputs funcionales, detener esta vía ordinaria de prepublicación.

**STOP tras el dictamen.** Sin commit, push, despliegue, datos reales ni tareas posteriores.
