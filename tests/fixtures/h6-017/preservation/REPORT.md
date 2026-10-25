# H6-017 — Integridad de antecedentes y cuatro dependencias formales

Resultado de este instrumento: **PASS de integridad documental y custodia de antecedentes**, exclusivamente local/aislado. No es el dictamen funcional H6-017 ni una auditoría humana externa. Los resultados históricos se autentican en su versión, no se presentan como ejecución funcional nueva.

## Base y preservación

`readback-v3.json` compara cada archivo heredado de la base `0cd5f06d2efec9741906d4927318734451b01d4a`, árbol `8b184d1d470a3bf190dee14499369fe9c665ab3d`, con su blob Git y modo, y registra SHA-256 de sus bytes observados. **45.783 archivos,1.040.864.923 bytes, cero discrepancias**. Incluye110 archivos de producto,68 migraciones, fuentes normativas/decisiones, antecedentes H0–H5 y candidatos/evidencias publicados H6-001/004/007/008/016. Inventario completo comprimido sin pérdida en `base-inventory-v3.json.gz`; hash del JSON descomprimido `9b1dc57aefe0d9c955cab772e240ba6ccd06c8ef6bfb2abd0c55cd81723eacc1`.

Además de la igualdad integral con la base, se contrastaron los manifiestos originales H6-007 técnico116 entradas, independiente258 y aceptación18; H6-016 técnico38 y cierre21; H6-008 R2,4.055 payloads. La revisión independiente H6-007 usa los miembros de `audit-package-v1.tar.gz`, sin extraer ni ejecutar el paquete.

La verificación de igualdad de base comprende los antecedentes incorporados a esa base. No acredita por sí misma la presencia de todo archivo privado o remoto mencionado por un histórico; las rutas adicionales consultadas y resoluciones exactas están en los recibos. La conservación íntegra del checkout principal y su inventario privado corresponde al guardián general de la ejecución, separado de esta comparación del worktree.

## H6-015:16 manifiestos y4.568 entradas

Se reconstruyó la lista literal del recibo histórico H6-007 `C10_H6015_16_4568` y se releyeron sus16 manifiestos contra el SHA esperado. Cada payload se cotejó nuevamente por bytes/SHA-256, y modo cuando constaba y se leía de archivo. **4.568/4.568 entradas PASS**. Los duplicados entre manifiestos conservan su identidad; son entradas, no4.568 archivos únicos.

Algunas raíces documentales originales ya habían sido retiradas. Se resolvieron a bytes idénticos publicados o snapshots locales específicos, registrando procedencia por entrada. No se restauró ningún worktree ni recurso. El manifiesto de cierre formal usa el snapshot `8ec91602a3bf813cf01ffbc6b2ac1a2862fe10d0`; adopción independiente conserva `fc68a90cd555a83388d5b166ff86adeda70110b8`.

Dos metadatos expresamente excluidos de publicación (`git-before.bin` y `preservation-baseline.json`) no estaban en esas copias publicadas. `git log --all -- <ruta>` localizó el snapshot de archivo automático `772a70296828fd117bc27eda1ece9cc636b2fd9a`. La lectura `git show` devolvió los SHA originales `ad22824bfeb4fc3fe7e4b3a0f76b84ddc2e0eb686ecf02a790b153c21f7f472d` y `530b8b0c428b7027bb6c3c4f2b5ac164c66b5df6461d45a915bddcdd1e1ca254`. Solo se conservan sus hashes/procedencia en este paquete; no se copian sus bytes privados ni se cambia su exclusión de publicación.

**H6-015 conserva cuarentena.** Ningún runtime, PostgreSQL, S11, reentrada o trabajo suspendido se consultó, inició o modificó. Los cuatro trabajos permanecen fuera de este instrumento. La lectura fue exclusivamente de documentos, manifiestos, miembros de archivo y blobs Git.

## Cuatro dependencias formales

`dependencies-readback-v2.json`: **17 controles PASS**, con observación propia de entradas/salidas y hashes, no solo casillas de estado.

| Dependencia | Autenticación efectuada | Límites históricos conservados |
|---|---|---|
| H5-019 | Sello técnico aceptado D01; inventario gzip; informe, matriz, sello e inventario de auditoría independiente externa originales;414 payloads de ese inventario rehashados. | Su cierre es documental/integrador.25 AC locales y AC-073 reservado en su fecha; cero ejecución funcional nueva. Los estados anteriores a aceptación siguen siendo antecedentes. |
| H6-008 | Manifiesto R2 SHA `23419baa5d5ddb985ce4ac42d1d408d510ffad89959b1154fb0e6f147e30f14f`;4.055 entradas originales verificadas contra su raíz documental; aceptación R2 consultada directamente. | F01/M02 pertenecen al sucesor aceptado. R1 adverso y expected permanecen intactos; Hosted/Production no acreditados. |
| H5-012 | Expected congelado67.346 bytes SHA `669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b`; inventario de428 inputs probado;8 recibos y logs originales contrastados por SHA. | Se conserva la excepción humana exacta de27 avisos/17 evidencias; formato global histórico exit2 sigue NO PASS. No normalización de originales. |
| H5-018 | Inventario G descomprimido y sello; inventario/sello sexta;127 payloads propios rehashados;15 fases disjuntas y30 logs originales descomprimidos con nuevos hashes; sumas2.945 PASS,0 fail/cancel/skip. | Las cinco auditorías adversas siguen FAIL. Resultados del candidato G y sexta, sin atribuirlos al producto actual por analogía. |

DM-PENDING-005 continúa OPEN; fiscalidad, tratamiento y conservación mantienen sus puertas. Ningún nuevo permiso, regla de exposición o capacidad fiscal se deriva de esta autenticación.

## Fallos de instrumento y sucesores

Se conservan los originales completos:

- `readback-v1.json` y `instrument-original-v1.py`: FAIL de resolución de raíces retiradas y namespace relativo del archivo independiente; la base, producto,68 migraciones y R2 ya eran íntegros.
- `readback-v2.json` y `instrument-v2.py`: FAIL de resolución de los dos metadatos privados no publicados; localizado después su snapshot íntegro.
- `readback-v3.json`: sucesor PASS, con resolución explícita por entrada y originales anteriores intactos.
- `dependencies-readback-v1.json` y `dependencies-instrument-original-v1.py`: FAIL instrumental porque se comparó el inventario H5-019 descomprimido con un hash que identifica su gzip. El informe independiente original identifica expresamente «Inventario gzip»; se corrigió la representación del cotejo.
- `dependencies-readback-v2.json`:17 controles PASS. No se alteró ningún byte de dependencia ni se cambió un expected para admitir contenido diferente.

Los logs originales/sucesores acompañan los recibos. Ninguno de estos FAIL instrumentales es un defecto reproducido del producto. No se declara una prueba funcional PASS a partir de este informe documental.

## Continuidad, formato y custodia

[Recomendación de continuidad](../../../../specs/001-core-crm/continuity-after-H6-017.md): H6-002 y H6-005 pueden prepararse/ejecutarse en paralelo cuando reciban mandato futuro, con worktrees/PG/sesiones/fixtures propios; H6-003 después de fijar T03 de H6-002 y con revisión conjunta si comparte cambios. H5-019 es la única dependencia formal de cada una; H6-002 no se inventa como dependencia normativa de H6-003. No se inició ninguna de las tres. H6 global **IN PROGRESS**.

El paquete se sella mediante inventario SHA-256 propio, excluyendo únicamente el manifiesto y su sello para evitar autorreferencia. El sello identifica integridad local, no firma criptográfica del director ni autorización de publicación. Las comprobaciones de sintaxis Python, whitespace/EOF y relectura del manifiesto quedan registradas aparte. No hubo cambios de producto, fuentes protegidas, migraciones, checkout principal, commit, push, merge, Drive, despliegue, credenciales reales o efectos externos.
