# H5-019 — Correctivo final y candidato sucesor

18 de octubre de 2026. **PASS interno propuesto, exclusivamente local/aislado.** AI-019-01 y AI-019-02 corregidas instrumentalmente; AI-019-03 reconciliada documentalmente. Cero defectos materiales abiertos detectados en el alcance del correctivo. El sucesor queda pendiente de auditoría independiente del delta y aceptación del director. H5-019 y H5 IN PROGRESS, H6 NOT STARTED. No se declara COMPLETED.

## Identidades y preservación

Base publicada, HEAD/main/origin/main: `1e7822c11be817e4f2d4791338284aa825ad1a24`; árbol `bbc8b1f1219201a8425e55a5cde6ce873cdc4006`; main, divergencia0/0, índice sin cambios preparados. Se verificaron38.524 blobs publicados,68 migraciones y122 altas originales mediante rutas, tipos regulares, modos, tamaños y SHA-256 antes de actuar. El sello original coincide exactamente con `aefd0f129e57e3324b5bc4a2ea0dd485bb340f1d57ff8810f209c0871bc00626`.

La auditoría independiente original está en `/Users/andres/Developer/crm-h5-019-independent-audit-20261018T035950Z/`, sello SHA-256 `649565d21191f585d57038c4ef1ee9c3f86f817db8c32dbc92d820285af8a2ab`. Sus152 artefactos se contrastaron íntegramente; no se modifica ninguno. Sus clones temporales excluidos no son artefactos152 ni se reutilizan para escribir ensayos.

La conservación externa está en `/Users/andres/Developer/crm-h5-019-corrective-20261018/`:

- `original-candidate.tar.gz`:38.646 archivos originales, SHA-256 `a94dd87c451b41c34577c1d445195539556dd0b509d5dcd17dbce0712c305e1a`.
- `independent-audit.tar.gz`:152 artefactos, SHA-256 `987fc22055f2505946c6396aaa1ce0f10926c2fe6390d00ee33f39315a09f95e`.
- `original-candidate-preservation.json` e `independent-audit-preservation.json`: manifiestos completos de ruta/tipo/modo/tamaño/hash; archivos y manifiestos con permisos0444 y marca UF_IMMUTABLE. Cada miembro tar fue leído y contrastado antes de fijar esa protección.
- `HANDOFF.json`: recibo externo final con el nuevo hash del sello, inventario, bootstrap y postcontrol. Se entrega fuera del conjunto para evitar autorreferencia.

[Referencias de conservación con hashes](../../tests/fixtures/h5-019-corrective/preservation-references.json). Solo cambian dos rutas de las122 originales: los dos instrumentos. Sus preimágenes exactas están en el archivo inmutable y en [original-instruments](../../tests/fixtures/h5-019-corrective/original-instruments/). Los otros120 archivos mantienen sus bytes. Los38.524 publicados, expected congelados,68 migraciones y todas las evidencias históricas permanecen intactos. El PASS original y los cinco dictámenes FAIL de H5-018 conservan su identidad y procedencia.

## Hallazgos y correctivos

| Hallazgo | Causa raíz y solución aplicada | Estado interno |
|---|---|---|
| AI-019-01, instrumental/media | El verificador omitía validar campos de su propio sello y no exigía raíz externa. Ahora exige hash externo del sello; contrato estricto de claves/tipos/estados/cantidades; correspondencia completa con inventario, alcance y metadatos; deniega rutas o exclusiones indebidas, symlinks y cambios de archivos; postcontrol doble. Un bootstrap externo autentica incluso el código del verificador antes de ejecutarlo. | CORREGIDA INTERNAMENTE; nueva auditoría pendiente. |
| AI-019-02, instrumental/documental/media | El generador elevaba coincidencias regex a SATISFACTORIA y copiaba expected al observado. Ahora ensambla exclusivamente la revisión independiente original autenticada, con casos ejecutados, fuentes y aserciones, expected/observed separados y procedencia histórica. Rechaza atribuciones distintas y estados ambiguos; mantiene los estados no satisfactorios y H6 pendiente; no sobrescribe resultados. | CORREGIDA INTERNAMENTE; no es oráculo semántico ni acredita una nueva ejecución integrada. |
| AI-019-03, documental/baja | Las fichas011/013/015 conservan estados anteriores a sus sucesores publicados. La [reconciliación](reconciliation-TSK-H5-019.md) contrasta implementación, manifiestos, auditorías, aceptaciones y ancestros. Se propone actualizar coordinación publicada mediante autorización posterior; no se toca Tasks ni documentación publicada. | RECONCILIADA en el ámbito autorizado; actualización de fichas propuesta. |

[Contrato instrumental](integrity-contract-TSK-H5-019.md). La confianza completa se ancla en el hash externo del sello sucesor, suministrado explícitamente por el llamante desde el recibo separado. El inventario completo solo excluye sus dos nodos finales; el sello protege inventario y metadatos, y la raíz externa protege el sello. `--prepare-seal` dice UNVERIFIED; no se trata de una aceptación propia.

## Contrapruebas antes y después

Los [resultados anteriores](../../tests/fixtures/h5-019-corrective/before/before-results.json) conservan12 ensayos con códigos de retorno, stdout/stderr, identidad instrumental y oráculo. Se ejecutaron en una copia completa, sin tocar el candidato original. Tres mutaciones de sello —semántica, campo obligatorio ausente y campo no admitido— devolvieron exit0: falsos PASS instrumentales. El generador produjo SATISFACTORIA para una prueba ajena, un observado vacío y un esperado artificial copiado. Los fallos originales se conservan íntegramente.

| Control de ensamblado | Antes | Después |
|---|---|---|
| Evidencia correcta | SATISFACTORIA. |25 SATISFACTORIA heredadas yAC-073 NO EJECUTADA. |
| Prueba ajena a AC-050 | SATISFACTORIA indebida mediante F-P01. | BLOQUEADA, exit1. |
| Observado ausente/vacío | SATISFACTORIA con texto vacío. | NO EJECUTADA; no se eleva el estado. |
| Expected copiado artificialmente | SATISFACTORIA sin observación. | NO EJECUTADA. |
| Prueba fallida | Rechazo por aserción global; no genera matriz. | FALLIDA preservada, exit1; no se presenta como una nueva prueba de negocio realmente fallida. |
| Procedencia histórica presentada como nueva | Los campos inyectados se ignoraron; el output retuvo su base fija. No se cuenta como un fallo de producto. | BLOQUEADA por procedencia distinta, exit1. |
| Verificación futura H6 | Rechazo por contador rígido del generador anterior. | AC-073 NO EJECUTADA, sin error ni falso negativo del tramo local. |
| Referencia inexistente | Rechazo al intentar leer el archivo. | BLOQUEADA explícitamente, exit1. |

La regresión final de instrumentos es **89/89 SATISFACTORIA**,0 FALLIDA. Incluye eliminación de cada campo obligatorio del sello, alteración de cada valor semántico fijo con hash de prueba recalculado, sustitución de hashes, claves adicionales/duplicadas, valores de tipo erróneo, inventario alterado, tipo/modo/tamaño/contenido, archivo ausente/adicional, archivo ignorado en evidencia, symlink, traversal, exclusión indebida y extensión de producto declarada y resellada. El candidato íntegro y el postcontrol restaurado deben pasar; así no basta rechazar todas las entradas. El generador añade11 variantes y rechazo de sobrescritura. [Recibos finales89](../../tests/fixtures/h5-019-corrective/instrument-regression.json).

El bootstrap externo añade **5/5 controles satisfactorios**: identidad íntegra, programa adulterado capaz de imprimir FORGED PASS, rechazo externo de ese programa, rechazo de archivo ignorado adicional y postcontrol restaurado. El exit0 del programa falsificado es la conducta adversarial esperada; el oráculo externo lo rechaza. Total del correctivo: **94/94 controles**, sin sumarlos a casos de negocio. [Recibos5](../../tests/fixtures/h5-019-corrective/bootstrap-regression.json).

La serie intermedia r02 dio87/87; la final r03 añade las dos guardas de alcance y JSON duplicado y acredita los hashes finales de los cuatro instrumentos. No sustituye r02. Las salidas originales de r01, r02, r03, los ensayos de bootstrap, las puertas y sus fuentes están en el [archivo recuperable](../../tests/fixtures/h5-019-corrective/corrective-raw-evidence.tar.gz), SHA-256 `5d0b59d8f03bf21a781e8844ccc0ca4a32f19768b1a8797cde38b06723470de9`.

## Regresión y alcance real

Instalación limpia congelada `pnpm install --frozen-lockfile --ignore-scripts`, typecheck, lint/fronteras, build y auditoría de dependencias: exit0. Auditoría:0 vulnerabilidades en esa captura. Unitarias: primera ejecución207/208 por copia sin contexto Git; repetición con índice independiente y objetos de lectura **208/208 PASS**,0 fail/skipped/cancelled. No se cambió ninguna prueba, producto o expected. Node24.21.0, pnpm11.19.0, Python3.9; datos sintéticos y copias locales. [Comandos, resultados e identidad de inputs](../../tests/fixtures/h5-019-corrective/gate-regression.json).

El snapshot de esas puertas precede a la última guarda Python de alcance. Todos los inputs de producto, configuración y dependencias son idénticos al sucesor; esos comandos no consumen el instrumento Python. La regresión89 verifica por separado sus bytes finales. No se presenta un snapshot anterior como el inventario sucesor definitivo.

**No reejecutados en este correctivo:** PostgreSQL2945, health1, integración adicional3, temporalidad14 y V-MIG/V-DAT68(2). Son resultados del candidato original y de su auditoría independiente, no resultados nuevos del sucesor. Su identidad se preserva y el producto permanece idéntico. El diferencial116, la reconstrucción303 y V-MIG66 mantienen su condición histórica; no se suman a ninguna ejecución actual. No se repite PostgreSQL completo porque solo cambia instrumentación documental, fuera de cualquier dependencia del producto o de su runner. No hay una migración nueva que requiera V-MIG adicional.

Se preservan tres incidencias propias ordinarias: incompatibilidad de argumento tarfile en Python3.9, preparación incompleta del primer ensayo y contexto Git ausente en la primera unitaria. Se investigaron como entorno/instrumentación propia y se corrigieron sin producto. [Diagnóstico, originales y repetición](../../tests/fixtures/h5-019-corrective/instrument-incidents.json).

## Normativa, dependencias y límites

La [matriz final26](matrix-TSK-H5-019-corrective.md) reconstruye las asignaciones vigentes de Plan/SPEC/Tasks y mantiene expected/observed/procedencia distintos. Los25 resultados locales se heredan de la revisión independiente autenticada; AC-073 conserva H6-015 NO EJECUTADA. [19 dependencias revalidadas](../../tests/fixtures/h5-019-corrective/dependency-revalidation.json): evidencias y ancestros actuales contrastados, tres diferencias de manifiestos históricos reproducidas; ninguna dependencia aceptada solo por su estado textual.

Se mantienen las27 exclusiones justificadas, dos logs históricos no recuperados de H5-009 con sustitución autorizada,69 diferencias históricas de tablas/R67/R030 y límites temporales de auxiliaresG. No se inventa recuperación de originales ni PASS de los instrumentos excluidos. Las capacidades originales local/aislado, simuladas mediante dobles o dependientes de configuración siguen distinguidas.

**DM-PENDING-005 OPEN.** Conservados Tasks §7 y Plan §12: PLAN-PENDING-003 y PLAN-AUTH globales; ARCH-PENDING-001/002; DM-PENDING-002/006; BR-PENDING-001/012/013/014/015/019/020/021/022/033/034/035 en sus ámbitos. No se fijan políticas de conservación, anonimización, eliminación, audio, acceso real, continuidad o parámetros de negocio. Hosted/Production, restauración real, entrega externa, cobros y conectores reales no acreditados. H6 y sus E2E NO EJECUTADOS. Ninguna PT recibe PASS global.

## Reproducción, entrega y STOP

El [delta exacto respecto a122 altas](../../tests/fixtures/h5-019-corrective/delta-original.json) identifica dos rutas alteradas,120 preservadas y las altas adicionales. El inventario completo gzip y sello sucesor están en `tests/fixtures/h5-019-corrective/`. Sus hashes finales y el postcontrol están en el recibo externo `HANDOFF.json`; no se incluye el hash final dentro de un archivo que forma parte del propio conjunto.

Primero autenticar usando el hash exacto del recibo externo, sin ejecutar código del candidato. Después:

```text
python3 /Users/andres/Developer/crm-h5-019-corrective-20261018/authenticate-successor.py /Users/andres/Developer/crm-huescaventura-os <SHA256_EXTERNO_DEL_SELLO_SUCESOR>
python3 scripts/verify-h5-019.py --expected-seal-sha256 <SHA256_EXTERNO_DEL_SELLO_SUCESOR> --audit-root /Users/andres/Developer/crm-h5-019-independent-audit-20261018T035950Z --audit-seal-sha256 649565d21191f585d57038c4ef1ee9c3f86f817db8c32dbc92d820285af8a2ab
```

Para reejecutar ataques, crear otra copia completa verificada, con índice Git independiente y objetos de lectura; conservar el original sellado y usar outputs nuevos fuera de la copia:

```text
python3 scripts/test-h5-019-corrective.py --copy <COPIA_COMPLETA_DESECHABLE> --audit-root /Users/andres/Developer/crm-h5-019-independent-audit-20261018T035950Z --output-directory <DIRECTORIO_NUEVO_EXTERNO>
```

El ensayo crea un sello sintético propio únicamente en esa copia; no lo identifica como el sucesor aceptado. Los recibos conservan comandos y rutas exactas ejecutadas; el archivo raw incluye herramientas de preparación y reproducción anterior. El ensamblador usa `--audit-root`, `--audit-seal-sha256`, `--request` y `--output` nuevo; jamás regenerar sobre las evidencias originales.

No existe un commit nuevo probado. El código de producto probado sigue siendo la base publicada, con instrumentos y documentación nuevos identificados por el sello sucesor. Recomendación: auditar independientemente este delta, contrastar los hashes externos y decidir después su aceptación. **STOP al entregar. Sin H6, commit, push ni despliegue.**
