# TSK-H6-001 — Informe consolidado local/aislado

Estado: **IN PROGRESS. Aceptación local pendiente del director. H6 global IN PROGRESS.** Verificación técnica consolidada el 2026-10-23, Europe/Madrid. Los timestamps de los instrumentos son UTC. Base Git local `971c55d5ce5770c71284d106d3c0deecca9514b5`; worktree aislado `h6-001-local`, sin staging ni nuevos commits.

## 1. Alcance normativo y puerta de entrada

Lectura directa de [Tasks](tasks.md#tsk-h6-001), [SPEC §9 y §§24–25](spec.md), [Architecture §§6/13/16](../../docs/architecture.md) y [Plan §§9–10.1](plan.md). README es una entrada general DRAFT; no se encontró AGENTS.md local en el repositorio ni sus ancestros consultados. Las instrucciones y la autorización del director gobiernan este encargo.

Las **tres asignaciones directas exactas** de Tasks §6 son:

| Fuente | Obligación H6-001 | Evidencia local |
|---|---|---|
| AC-089 | Fuente, guarda y criterio de cada efecto importante; futuras verificaciones distinguidas de las ejecutadas; ninguna desviación sin decisión normativa. | Expected independiente previo, entradas y resultados por operación, [matriz de cobertura](matrix-TSK-H6-001.md), fallos conservados y límites de este informe. |
| SPEC-NFR-001 | Partiendo de Booking, reconstruir necesidad, versiones, Acceptance, operación, economía, decisiones y validaciones sin sustituir hechos por resúmenes. | P14, consultas de lectura por raíz, referencias persistentes, documentos y objeto íntegro, evaluaciones y fuentes en `observed.json`. |
| E2E-01 | Contexto → Lead mínimo → Opportunity → modalidades/versiones → Acceptance verificable → una Booking → cantidades/noches → fondos y críticos → ejecución/documentos → tres cierres. | P01–P14 y N01–N07, PostgreSQL real y contratos de aplicación; repetición independiente separada. |

La ficha identifica B01–B10, C01–C06 y T01/T02/T03/T04/T05/T07/T10. Los 34 AC principales de SPEC §9 son AC-001–019, AC-023–028, AC-044–046 y AC-058–063. La matriz distingue tramo integrado, contrapruebas y regresión de componentes; mencionar un AC no lo acredita globalmente. E2E-02–07 y otras tareas H6 conservan sus puertas propias.

**H5-019: dependencia SATISFECHA en local/aislado.** Se contrastaron Tasks, [aceptación D01–D03](acceptance-TSK-H5-019.md), [cierre](closure-TSK-H5-019.md) y el sello `31fd4ac89aea684f2155a4365cb5870a0c0163838cbfd543d2ad98d0db1ea619`. La publicación histórica `8a5f1408777b81b760a02646fa414a34dc17983e` es ancestro de la base local; no se consultó el remoto. No se trasladan sus pruebas históricas como ejecuciones nuevas. H6-015 no es una dependencia normativa adicional de esta ficha; sus antecedentes técnicos aceptados se declaran explícitamente.

## 2. Implementación y reutilización

La nueva implementación es **de verificación**, sin cambios nuevos de producto ni migraciones: [recorrido integrado](../../tests/integration/postgres-h6-001.test.ts), [runner](../../scripts/run-h6-001.mjs), [verificador de integridad](../../scripts/verify-h6-001.mjs), expected, evidencia y documentación. No se amplían APIs, contratos, tablas, reglas de negocio ni variables de entorno de producto.

Se reutilizan los adaptadores existentes de identidad/comercial, propuesta/versiones, oferta/Acceptance, Booking, obligaciones, cobros/conciliación/asignación, confirmaciones, preparación, requisitos/objetos privados, realidad, economía propia, cierres y proyecciones. Los helpers existentes aportan construcción de entradas, no estados de éxito sembrados. Las operaciones del recorrido atraviesan los contratos y persistencia ordinarios. Las lecturas SQL corroboran fuentes, cantidades e invariantes; SQL administrativo solo prepara actor/roles/clave técnica y deshabilita/restaura al actor en la contraprueba de autorización.

El checkout hereda **14 archivos exactos** del candidato local aceptado `h6-c04-integration`: ocho de producto y seis de tests/soporte. [Inventario de antecedentes](../../tests/fixtures/h6-001/inherited-inputs.json) registra fuente, tamaño y SHA-256. Entre ellos están Auth R2, sesión humana, frontera HTTP/B07, congelación del contrato de invocación y soporte aislado. Son antecedentes pendientes de publicación, no cambios nuevos atribuibles a H6-001. Las 68 migraciones y todo producto fuera de esos ocho archivos coinciden con la base.

Escenario sintético: dos modalidades A=10 y B=2; rafting 10, cena 12; dos noches con 12 y 10 asistentes. Los tres servicios son internos, posibilidad expresamente admitida por SPEC-FR-SVC-009/SM-BS-04: requieren responsable interno y confirmación propia. No se inventa proveedor, suplido o factura externa para servicios internos. Obligación de cliente 1.200,12 EUR, recepción, correspondencia y asignación separadas. Economía propia explícita: tres componentes de honorarios de 100 EUR y tres costes de 20 EUR; resultado real 240 EUR, sin validación fiscal y sin equipararlo al total gestionado.

Se confirman cuatro alcances (dos servicios y dos noches); una necesidad documental indispensable bloquea la preparación hasta recibir y revisar el original privado. La ejecución usa `start → perform → finish`, sin ruta excepcional ni aprobación retroactiva. Comercial, Operacional y Económica se evalúan por separado y se cierra conjuntamente mediante un acto explícito. El original de ejecución es distinto del permiso documental.

## 3. Pruebas, fallos y regresiones

[Expected independiente](expected-TSK-H6-001-independent.md) congelado antes del ejecutable: SHA-256 `ecaf8a7ffc942493c5d7fc7606f0c15a6af8d85aba766e1117d0cb901d544eb2`. Sus IA01–IA30 son controles instrumentales, no normas nuevas. El runner verifica ese hash y los 14 heredados antes de ejecutar, guarda fuentes y hash de inputs y nunca sustituye un intento anterior.

| Comprobación ejecutada | Resultado | Referencia |
|---|---|---|
| Focal del ejecutor | **PASS 22/22**: 21 subcasos y contenedor; 0 fallos/cancelados/skips. | `tests/fixtures/h6-001/focal-2026-10-22T22-00-10-476Z/` |
| Unitarias | **PASS 212/212**, 0 fallos/cancelados/skips. | `tests/fixtures/h6-001/quality-r1/unit.stdout.log` |
| Typecheck, lint/boundaries, build y diff-check | **PASS**; comandos, salidas y hashes conservados. | `tests/fixtures/h6-001/quality-r1/results.json` |
| Integridad documental/producto inicial | **PASS 251 controles**, 68 migraciones, 14 heredados; no acceso a red ni bases. | `node scripts/verify-h6-001.mjs` |
| Repetición independiente del focal | **PASS 22/22**, 0 fallos/cancelados/skips; mismo SHA ejecutable. | [Dictamen independiente](../../tests/fixtures/h6-001/independent/independent-verdict.md). |
| Regresión histórica amplia, resultado bruto | **2.899 PASS / 46 FAIL de 2.945**, 196 archivos; 0 cancelados/skips. Se conserva FAIL. | [Reconciliación AF001–AF046](../../tests/fixtures/h6-001/independent/reconciliation.md). |
| Reconciliación de los 46 FAIL | **46/46 con sucesor PASS; 0 hallazgos materiales pendientes**. F-replay intacto 12/12; sucesores seleccionados 33/34 y W53 v3 1/1. No hubo nueva ejecución completa limpia. | [Reconciliación por caso](../../tests/fixtures/h6-001/independent/reconciliation.json). |
| Contrapruebas independientes A01–A06 | **PASS 7/7**, seis casos y contenedor; T07 parcial, replay/reautorización, rollback en COMMIT, factura, acceso y advisors locales. | [Dictamen y fuentes ejecutadas](../../tests/fixtures/h6-001/independent/independent-verdict.md). |
| Regresión adicional H5-019 I01–I03 | **PASS 3/3** sobre la cadena de 68 migraciones. | [Dictamen independiente](../../tests/fixtures/h6-001/independent/independent-verdict.md). |
| Integridad final independiente | **PASS 822 controles**: inputs originales, producto, migraciones, heredados y fuentes congeladas. | [Readback funcional](../../tests/fixtures/h6-001/independent/final-integrity.json). |

N01–N07 comprueban conversión sin aceptación/falsa identidad, fechas o Ganada sin confirmación, repetición y sobreasignación de fondos, finalización sin ejecución, ausencia de cierre implícito, rechazo de acceso directo y actor deshabilitado/sesión cerrada. Se comparan hashes de tablas de negocio antes y después de rechazos/replays. P14 comprueba fuentes de propuesta/aceptación, vínculos de pago/porciones y sus evidencias, las cuatro confirmaciones y originales, objeto privado y digest, documento revisado, tres hechos de realidad, criterios/evidencias de cierres y proyecciones sin autoridad de mutación.

**Siete ejecuciones focales FAIL se conservan** antes del PASS: contexto de grupo ausente; valor `undefined` no canónico; evidencia de obligación con contexto incorrecto; `bookingId` extra en orden de cobro; base comercial de noche sin filtrar contribuciones; fuente de realidad incompleta; y aplicabilidad económica de tres servicios con honorario aportado solo al primero. Se corrigió exclusivamente el instrumento contra los contratos vigentes. El primer source se recuperó del prototipo conservado: coincide exactamente con su SHA contemporáneo; el intento de reconstrucción no coincidente también permanece. No se corrige el producto para hacer pasar el test ni se reescriben resultados fallidos.

Los 46 fallos históricos se distribuyen en 29 salidas de advisors CLI sin JSON bajo el entorno restringido, cuatro guardas antiguas de bytes anteriores a C07/Auth R2, doce casos impedidos por un puerto ocupado y una fecha fija que dejó de ser futura. Los sucesores añaden únicamente JSON explícito, reconocimiento exacto de los antecedentes declarados, aislamiento del puerto o reloj fijo con fecha futura derivada, según el caso. Se conservan los comparadores originales y nuevas contrapruebas rechazan bytes desconocidos o alterados. El primer sucesor W53 y el primer intento de contrapruebas independientes también conservan sus FAIL. El runner histórico sin esas adaptaciones **no se certifica verde**; las 2.945 posiciones reconciliadas se cuentan una sola vez y no representan 2.945 escenarios de negocio distintos.

## 4. Dictamen independiente

Auditor funcional `/root/h6_001_auditor`: **PASS_TECHNICAL_LOCAL_WITH_EXPLICIT_RECONCILED_REGRESSION**, sin hallazgos materiales pendientes dentro de la cobertura. Expected propio previo, réplica y ejecución propias, contrapruebas de T07/rollback/permisos y regresión completa seleccionada. Su [dictamen](../../tests/fixtures/h6-001/independent/independent-verdict.md) recomienda aceptación local por el director. La [matriz de 34 AC](../../tests/fixtures/h6-001/independent/ac-matrix.md) aporta 105 referencias ejecutadas exactas; la [matriz IA01–IA30](../../tests/fixtures/h6-001/independent/ia-matrix.json) distingue PASS instrumental, documental, local y solo preparado. [Atomicidad, replay y concurrencia](../../tests/fixtures/h6-001/independent/atomicity-replay-concurrency.json) identifica los casos T01/T02/T03/T04/T05/T07/T10.

El [manifiesto independiente](../../tests/fixtures/h6-001/independent/audit-manifest-v1.json), SHA-256 `dff39c22bde4a56e42af7d811df69a8438f8ed24b02f790e43360d13dc5d29e6`, contiene **173 payloads / 14.044.516 bytes** y tres envolturas separadas; readback 173/173 PASS. Se han copiado solo esos miembros, sin réplica, runtime, bases, claves, dependencias ni cachés.

Auditor de custodia `/root/custody_publication_audit`: lectura/hash e inventario por su propio instrumento. Comparten máquina y ficheros accesibles; la independencia es de contexto y ejecución, no una auditoría organizativa externa. La lectura del sello exterior se entrega como [recibo independiente separado](../../tests/fixtures/h6-001-delivery-readback/README.md), fuera del payload que verifica, para evitar autorreferencia. Su resultado se consulta en ese recibo, no se anticipa dentro del manifiesto sellado.

## 5. Integridad, cuarentena y seguridad

Principal `/Users/andres/Developer/crm-huescaventura-os` preservado: base `971c55d5`, sin cambios versionados ni índice; 14.954 untracked históricos observados por custodia. El trabajo propio está en `/Users/andres/.codex/worktrees/h6-001-local/crm-huescaventura-os`.

Primera auditoría de custodia: **16 manifiestos / 4.568 entradas verificadas, cero discrepancias**; diez paquetes aceptados principales contienen 4.436 entradas. Son archivos, con solapamientos, no casos funcionales. Inventario H6-006/H6-008: 4.067 payloads + 3 envolturas, 4.070 paths. 4.200 rutas de fixture duplicadas en 29.765 copias no presentaron divergencias. Originales y sello están en `tests/fixtures/h6-001/custody-initial/`. El pase sucesor `custody-successor/` revalida los mismos 16 manifiestos/4.568 entradas y aporta 252 controles independientes PASS. Las 14.954 rutas históricas del principal conservan nombres y tamaños respecto al primer inventario; no se inventa un hash previo de sus bytes.

La app archivó los worktrees de cierre/adopción durante el encargo. Se localizaron, sin restaurarlos, los snapshots `8ec91602a3bf813cf01ffbc6b2ac1a2862fe10d0` (cierre formal, 18 paths) y `fc68a90cd555a83388d5b166ff86adeda70110b8` (auditoría de adopción, 15 paths). El manifiesto formal sigue siendo `991d14013efd0f2527dea48bdc50dd426747a6089d15fc54745eac8140b15ada`. No son commits de publicación creados por este trabajo.

**H6-015 COMPLETED local/aislado, en cuarentena; cuatro trabajos suspendidos preservados.** La constatación de suspensión es documental, por el recibo sellado previamente aceptado, más ausencia de acciones de este encargo sobre esos recursos. No se presenta como una nueva consulta funcional/SQL. No se ha restaurado su base, reentrado en S11 ni arrancado sus ejecutores.

Las pruebas generan una base y claves efímeras propias, aisladas de H6-015. PostgreSQL 17.11 real; Supabase Auth 2.197.0 real con contraseña/TOTP sintéticos; Storage local sobre fuente fijada `5def1dfc15ab7f08fe271c7d1e70542424524e4e`. Auth/Storage se limitan a loopback. Cuentas `example.invalid`, hechos marcados SYNTHETIC, cero intentos de correo en el focal. El entorno del runner está en allowlist; solo transmite la configuración efímera propia de `runtime.env`, sin cargar configuración del usuario ni claves reales. Fixtures de catálogo usan la precondición técnica de autenticación ordinaria del harness; no se presenta una UI ni un usuario de negocio real. Roles de migración y lectura observadora están separados de los efectos ordinarios. Se eliminan únicamente los recursos efímeros propios al cerrar cada harness.

## 6. Publicación pendiente

[Inventario y propuesta de lotes](publication-TSK-H6-001.md), apoyados por el inventario acumulado independiente. Nada ejecutado. H6-001 se identifica como base + antecedentes exactos + paquete propio; no se fusiona con la publicación de H6-015. Los conflictos documentales y variantes históricas R1/R2 se declaran, no se resuelven mediante copias globales. Staging, commit, push, GitHub, Drive y despliegue siguen reservados.

## 7. Límites y recomendación

La evidencia acredita la venta completa **interna sintética** por contratos y PostgreSQL aislado; las ramas de proveedor/pago externo/factura se verifican como regresiones y contrapruebas separadas. No se declara una misma Booking mixta externa integrada, E2E-05 global, todas las transiciones H6, UI, conectores reales, SMTP/entrega, validez fiscal, Hosted/Production, RPO/RTO ni disponibilidad operativa futura. Los snapshots recuperables no prueban una restauración ejecutada en este encargo. La reproducción requiere los binarios y cachés locales fijados (Node 24.21.0, PostgreSQL 17.11, Auth y Storage); no se han empaquetado ni probado una descarga independiente en otra máquina.

**Recomendación: aceptar técnicamente H6-001 exclusivamente en local/aislado**, con las tres asignaciones directas y los límites anteriores, condicionado a que el readback exterior independiente confirme la identidad del paquete. El dictamen funcional y la reconciliación no requieren cambios normativos ni de producto. **H6-001 permanece IN PROGRESS y requiere decisión del director para declararlo COMPLETED.** Esta recomendación no autoriza publicación ni levanta la cuarentena. H6 global permanece **IN PROGRESS**.
