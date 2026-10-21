# TSK-H6-014 — cierre consolidado local/aislado

**COMPLETED exclusivamente local/aislado. Aceptación técnica del director y cierre documental autorizado el 2026-10-21. Custodia externa y publicación pendientes.**

## 1. Autoridad y alcance satisfecho

[Recibo de aceptación](acceptance-TSK-H6-014.md). Se cierra “Preparar inventario y procedimiento de restauración aislada”: datos, objetos, historia, Auth/actor, configuración, credenciales protegidas, referencias, idempotencia, aprobaciones y ejecuciones. Responsable: Andrés. El procedimiento contiene condiciones para una ejecución futura; ningún paso de restauración se ejecutó en H6-014 ni en este cierre.

Se releen las identidades aceptadas antes de anotar estado. [Integridad inicial](../../tests/fixtures/h6-014-closure/initial-integrity.json). El candidato r3 de 21 archivos (20 payloads y manifiesto) permanece intacto; solo cambian Tasks, PROJECT-STATUS y NEXT-STEPS mediante anotaciones de coordinación, además de los nueve nuevos documentos/registros de cierre. Ninguna fila normativa cambia.

## 2. Entregables y trazabilidad

| Entregable | Referencia recuperable |
|---|---|
| Inventario R01–R15 | [Inventario](inventory-TSK-H6-014.json) |
| Procedimiento S01–S13, variantes Core/Storage | [Procedimiento](procedure-TSK-H6-014.md) |
| Seis asignaciones y límites por requisito | [Matriz normativa](matrix-TSK-H6-014.json) |
| Oráculo original y sellos | [Expected](expected-TSK-H6-014.json), [sello](../../tests/fixtures/h6-014/expected-seal.json) |
| Instrumento de preparación | [Verificador](../../scripts/verify-h6-014-preparation.py) |
| Evidencia original y correctivos | [Informe original](evidence-TSK-H6-014.md), [correctivo r3](corrective-TSK-H6-014-M1-m1.md) |
| Historial de resultados | [Original](../../tests/fixtures/h6-014/results.json), [correctivo append-only](../../tests/fixtures/h6-014-corrective/results.json) |
| Identidad aceptada | [Manifiesto r3](../../tests/fixtures/h6-014-corrective/manifest.json) |
| Auditorías, manifiestos y TAR externos | [Índice exacto, ubicación local y destino lógico](../../tests/fixtures/h6-014-closure/evidence-index.json) |

Las seis filas de Tasks §6 son AC-073, SPEC-NFR-005, ARCH-DEC-017, P13, PLAN-B10 y PT-12. Sus literales y obligaciones permanecen intactos; el índice registra línea de base y línea actual, hash completo de la fuente aprobada y hash del fragmento. AC-073 prepara suspensión/testigo/conciliación sin duplicados; NFR-005 cubre recursos y medición; ARCH-DEC-017 delimita aislamiento; P13 conserva estructura/permisos versionados; B10 y PT-12 acreditan evidencia y selección de continuidad. Ninguna fuente compartida se declara satisfecha globalmente. H5-019 y H6-013 ya constan COMPLETED local/aislado en la base; la aceptación no convierte sus cierres en acreditación Hosted o Production.

## 3. Cronología y cinco hallazgos

| Revisión | Manifiesto SHA-256 | Dictamen y tratamiento |
|---|---|---|
| r1 | `f17b39cb3e0b3e6fd357659866910ee9e7971fdf9b3b3830a458488351e578ef` | STOP independiente: A01 generación F1/F2 y A02 owner de extensión, mayores; A03 opciones Bash, menor. Candidato e informe preservados. |
| r2 | `0e003f9fe982ac7065d111d32add53c8aceb7d4aa852461e3eb5004d9cadd8ac` | STOP independiente: R2-A04 receta Core impuesta a Storage, mayor; R2-A05 guardas tardías aceptadas, menor. Candidato e informe preservados. |
| r3 | `1352361f1bf22ffb3670d8a7f36ca15b583ccf11bef9d6c4bd0d94adf1b7c065` | PASS independiente de preparación. Cinco hallazgos resueltos, sin defecto material abierto; aceptado por el director. |

El informe independiente r3 tiene SHA-256 `3e610a7c2e276a33cc262d2818691a31429b73120a0db70c51dc2932ecf33f88`. Los tres auditores se crearon con fork_turns=none, sin historial de implementación, reconstruyeron criterios desde fuentes aprobadas y examinaron candidatos congelados. Es independencia de contexto con filesystem compartido de lectura, no auditoría humana ni aislamiento del SO. Los informes originales y sus tamaños/hashes constan en el índice; este cierre no modifica sus conclusiones.

## 4. Resultados heredados y comprobación documental nueva

R3: 22/22 controles, 18/18 contrapruebas originales, 63/63 focales y 20/20 payloads PASS, cero errores. El auditor reprodujo el instrumento sin escritura y realizó 72/72 comprobaciones propias en memoria. Son evidencias técnicas previas, no pruebas funcionales repetidas por este cierre ni una restauración observada.

Este cierre comprueba identidades, contenido/tamaño/modo, lectura completa de cuatro TAR en memoria, seis filas normativas, enlaces, anotaciones, nueve límites, ausencia de secretos, diferencia autorizada y conjunto exacto propuesto. [Verificación final](../../tests/fixtures/h6-014-closure/closure-verification.json). No hay batería funcional nueva.

Los textos históricos que dicen auditoría/aceptación pendiente y los flags task_closed=false describen sus momentos de sellado. Este registro autorizado y la aceptación añaden el estado vigente sin cambiar aquellos bytes. El verificador técnico original está ligado al commit base y a la protección íntegra previa al cierre: después de las tres anotaciones de coordinación no debe ejecutarse en este checkout ni relajarse para obtener PASS. Una futura reproducción exige reconstruir la base en un destino propio autorizado, preservando los originales; aquí se verifica por hashes y comparación de las anotaciones contra la base.

## 5. Preservación y custodia

Se conservaron los 39.940 archivos versionados antes del cierre, las 14.954 evidencias históricas excluidas y las 68 migraciones. Después del cierre, las únicas excepciones son tres documentos de coordinación autorizados; los otros 39.937 versionados permanecen idénticos. Los 21 archivos r3, expected, criterios, sellos, resultados y ocho archivos del sobre externo mantienen sus descriptores iniciales. Los cuatro TAR de 11/19/20/21 miembros se leen sin extracción ni sobrescritura.

No se copian los tres TAR externos al repositorio. La propuesta conserva allí auditorías y candidatos, y utiliza los TAR existentes; el original-candidate.tar.gz de 53.258 bytes ya forma parte de r3 y se mantiene porque su verificador lo necesita. El [inventario de entrega](../../tests/fixtures/h6-014-closure/delivery-inventory.json) separa las 33 rutas Git propuestas, los 21 archivos Drive propuestos y las 14.954 exclusiones históricas. Una ruta local es recuperabilidad actual, no prueba de entrega remota ni garantía futura.

## 6. Límites y próxima puerta

Restauración integrada NO EJECUTADA; AC-073 global NO ACREDITADO; Hosted/Production NO ACREDITADOS. ARCH-PENDING-002 y DM-PENDING-005 OPEN. H6 global IN PROGRESS; otras 16 tareas H6 NOT STARTED. No objetivos RPO/RTO, cadencia, coste ni reentrada inventados. No datos reales, SQL, migraciones, recursos de producción ni operaciones de Drive ejecutados.

Cierre local registrado. Se entrega para evaluación y autorización independiente de custodia y publicación. El [plan de publicación](publication-TSK-H6-014.md) exige readback y recuperación desde Drive antes de presentar Git como expediente distribuible completo. No hay staging, commit, push, rama, tag, deploy ni inicio de H6-015 autorizados. **STOP.**
