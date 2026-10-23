# Evidencias H6-004 — exclusivamente local/aislado

Índice de lectura: `specs/001-core-crm/evidence-TSK-H6-004.md`, acta `acceptance-TSK-H6-004.md`, dictamen `independent/independent-verdict.md`, manifiesto/sello de entrega y recibo exterior `../h6-004-delivery-readback/`.

- `expected-freeze.json` y `preflight-v1.json`: oráculo previo, base, fuentes normativas y 376 rutas protegidas H6-001.
- `focal-*`: seis intentos preservados; final 31/31, dos Bookings A/B y cuatro controles N. Los dos padres de subpruebas cuentan en el total Node.
- `supplement-*`: pruebas aditivas S01 y sucesor cronológico S02 para el hallazgo AC-032, 1/1; mismo Booking/servicio con pago previo al proveedor y derecho íntegro200.
- `coverage-matrix-v1.json`: antecedente con atribución insuficiente de AC-032; `coverage-matrix-v3.json`: sucesor con19 AC/210 posiciones ejecutadas. No se modifica v1.
- `verification-v1.json`, `verification-v2.json`, `verification-v3.json` y lectura final: resultados, hashes y correspondencias individuales de los117 FAIL con sucesores exactos. El corte v1 precede al suplemento.
- `corrective-register.md`, `independent-finding-AC032.md`, `setup-attempt-01`, `typecheck-attempt-01`, `matrix-attempt-01`: fallos, diagnóstico y correctivos preservados.
- `compatibility-v1`: dos copias históricas añaden formato JSON explícito al CLI, sin cambiar aserciones/producto. `generated-artifact-custody-v1` conserva el JSON sintético que F16 regeneró antes de restituir la preimagen HEAD.
- `quality-*`: unitarias210/210 y typecheck/lint/build; última ejecución posterior al suplemento.
- `independent`: expected anterior, fuentes congeladas, ejecución propia, contrapruebas, hallazgos, reconciliación y dictamen. Sus fallos instrumentales se conservan aparte de los117 del autor.
- `documentary-variant`, `documentary-overlay-v1.json` y patch: tres postimágenes aisladas posteriores al candidato de prepublicación v2. Ninguna escritura sobre los coordinadores canónicos o las fuentes protegidas.

Cada ejecución PostgreSQL tiene `inputs.json` (hash de las entradas), fuentes propias capturadas, `phase-NN.json`, stdout y stderr originales y `run.json`. Las lecturas A/B y S01 contienen únicamente datos sintéticos. Las suites históricas tienen su alcance de versión; no todas arrancan cadena68. Focal y suplemento sí usan PostgreSQL17.11 real y cadena68. Las ramas puras de las suites se identifican por su fuente, sin convertirlas en persistencia.

Repetición local, solo con recursos sintéticos propios: `node scripts/run-h6-004.mjs focal` y `supplement_temporal` producen directorios nuevos; el runner verifica expected y requiere el software Storage compilado fijado, PG17 y el runtime propio configurado. Los otros grupos están enumerados literalmente en el runner; no ejecutar suites con puertos históricos iguales en paralelo. No ejecutar estos comandos contra H6-015 ni modificar su entorno. Las fuentes congeladas y logs anteriores no se regeneran.

Verificación sin runtime: `python3 scripts/verify-h6-004.py` emite una lectura nueva por stdout; `python3 scripts/verify-h6-004-package.py` verifica el candidato sellado. No redirigir encima de una evidencia sellada. Los manifiestos excluyen sus propias envolturas para evitar autorreferencia; sus hashes quedan en el sello y recibo exterior. Son huellas de integridad local, no firmas criptográficas de terceros ni custodia remota.

Regresión actual dirigida seleccionada837/837, focal31/31, suplemento1/1. Historia autor1.006 PASS/117 FAIL de1.123 registros; no completa global limpia. H6-001 mantiene su propia historia2.899 PASS/46 FAIL de2.945 y sus originales. H6 global IN PROGRESS; H6-015 en cuarentena y cuatro trabajos suspendidos; ninguna publicación, Drive, deploy o efecto real.
