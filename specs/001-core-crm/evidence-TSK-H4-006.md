# Evidencia — TSK-H4-006

**COMPLETED local/aislado — 2026-10-05.** Verificación independiente del [expected congelado](expected-TSK-H4-005-006.md); no se modificó para acomodar producto.

Base inicial `139edbed8ffd25cd093722d76479b10fee0c053c`; corrección documental previa publicada `c5f891a93d221236968df316fbe2f2a360d72772`; expected independiente `70dce887e73f74bb3e67d99d87806123c4b4b488`; SHA exacto de producto/verificador probado `2f83122d1cbaedb5116f8ae5da69ac6598592807`. El commit documental de cierre solo añade evidencia, logs y coordinación: producto/migración/lógica de pruebas no cambian después del SHA probado. La cadena y el SHA final publicado se identifican en el informe final y Git; no se atribuye al commit documental una nueva prueba de producto.

Entorno: Node 24.21.0, pnpm 11.19.0, PostgreSQL 17.11 nativo (Postgres.app), CLI Supabase 2.118.0; Storage oficial fijado a `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, backend de archivos privado y loopback. Fixtures sintéticos, clústeres efímeros, rol de migración separado del runtime. Sin hosted, Production, datos reales ni efectos externos.

Regresión sobre SHA probado: **1399/1399 PostgreSQL**, **118/118 unitarias**, **0 FAIL/skipped/cancelled**. Los **55 casos del bloque** están incluidos en1399: 1 focal,34 grupos normativos,1 matriz de guardas,6 reproducers materiales persistentes y13 complementos. Health-check independiente **1/1**, separado del cómputo PostgreSQL. Instalación congelada, typecheck, lint/boundaries, build, auditoría de producción, diff-check, V-MIG y advisors loopback PASS; auditoría sin vulnerabilidades conocidas y advisors sin hallazgos.

Resultados recuperables: [summary](../../tests/fixtures/h4-006/regression-summary.json), [logs originales y hashes](../../tests/fixtures/h4-006/raw-manifest.json), [preservación](../../tests/fixtures/h4-006/preservation.json), [defectos y cronología](../../tests/fixtures/h4-006/defects.md). Los .log.gz conservan bytes completos, incluidas salidas FAIL. Dos logs históricos que el runner H2 regenera se archivaron en este bloque y se restauraron a su versión histórica; no cambia ninguna expectativa ni resultado antiguo.

Pendientes: **H4-007+; H4-021 (integración futura no acreditada); H4-023; H5–H6** y sus integraciones; opciones/Capacity Hold, Provider Confirmation y reserva firme; preparación/ejecución/revalidación/modificación completas; Refund/fianza; cierres/Closure Assessment; coordinación/avisos/jobs H5; conectores, audio, datos reales, política definitiva de retención/anonimización/eliminación DM-PENDING-005, hosted y Production. H0 COMPLETED técnico/local/aislado; H1/H2/H3 y H4-001–004 COMPLETED local/aislado conservados. Hosted H2/H3 no acreditados; Production no autorizada.

**H4 IN PROGRESS; H4-005/006 COMPLETED local/aislado; H4-007+ y H5–H6 NOT STARTED. STOP tras publicar H4-006.** No se inicia ni prepara continuidad; vuelve al hilo de dirección H4 y requiere autorización humana.

## Matriz ejecutada y observado

| Casos/fuente | Fixture y acción | Expected / observado | Resultado y evidencia |
|---|---|---|---|
| R01–R06; SM-BS-02/AV-01/02 | Booking/servicio reales; consulta, recepción espontánea/negativa/ambigua y guardas retiradas | Consulta identificada con respuesta pendiente; respuesta no verificada; sin registro/alcance no se inventa recepción | PASS; postgres-h4-006 + matriz adicional de cada header/guarda de respuesta |
| R07–R10; AC-020/AV-03/CAT-003 | Capacidad para12 personas,16/otra fecha/noche/unidad/variante/proveedor; Offering real | Solo acto y cobertura explícitamente verificados; Offering no acredita disponibilidad ni servicio confirmado | PASS; focal H4-005, R07–10, F07/S11 |
| R11–R18; AV-04/SVC-010/E8/DM-INV-020 | Expiración con offset Europe/Madrid, vigencia desconocida, prueba nueva/antigua/contradictoria, ratificación parcial/completa | Histórico conservado; incertidumbre/revisión localizada; no prioridad por llegada ni cobertura retroactiva; nueva prueba no reescribe acuerdo | PASS; R11–18, F10–12, S07/08/13 |
| R19–R21; G5/SM-FORB-03/05/07 | S1/S2 y noches12/10 con4 nominales; fuente interna; intentar confirmación/reserva/ejecución/silencio | Solo parte dependiente pendiente; no personas ficticias/doble cómputo, proveedor ficticio ni capacidades posteriores | PASS; R19–21, S09/11/12, F05/06 |
| R22–R24/R32; G1/G3/F1/F2/D039/privacidad | Actor/contexto falso/ausente, inhabilitado, sesión revocada, IA no aprobada; UUIDs ajenos/CRUD/ACL/proyección | Fail closed, reautorización, RLS/FORCE, helpers privados, search_path seguro; sin datos económicos/participantes/textos innecesarios | PASS; R22–24/R32, S01–03/S12 |
| R25–R30; G6/T04/V-AT | Clave/material equivalente y distinto, factId fiable, stale revision; dos sesiones/ambos órdenes/overlap; fallos antes/durante escritura y COMMIT | Sin duplicar raíz/respuesta/Review/Task/historia; E2; sin overwrite; rollback completo y resultado durable tras respuesta perdida | PASS; R25–30, F10, S04–10 |
| R31–R34; V-MIG/PT-03/PLAN-B04 | Fresh40 y upgrade39 poblado: Requirement Revisado, Incident En gestión con INC/historia y original privado; fallo DDL/reintento | Identidad, cantidades, códigos, snapshots, objetos, fondos/economía/historia y catálogo previo de seguridad conservados; health intacto | PASS; snapshots SQL de todas las tablas privadas y owners/ACL/funciones/policies/triggers/roles anteriores; hashes de39 migraciones |

El verificador inspecciona SQL directamente para fases, historia, cantidades, permisos, catálogos, rollback y preservación; no llama a helpers del dominio como oráculo. Todo estado material se alcanza con contratos vigentes y hechos sintéticos reales de la fixture; no se siembran opciones/confirmación/ejecución futuras. La futura modificación y evaluación operativa integrada H4-021 permanece pendiente.

Código recuperable: [matriz](../../tests/integration/postgres-h4-006.test.ts), [reproducers](../../tests/integration/postgres-h4-006-scope-reproducer.test.ts), [complementos](../../tests/integration/postgres-h4-006-supplement.test.ts), [focal](../../tests/integration/postgres-h4-005.test.ts), [fixtures](../../tests/support/h4-availability-fixtures.ts) y [entorno](../../tests/support/h4-availability-isolated.ts).

## Comandos y resultados

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm test:postgres
pnpm build
pnpm audit --prod
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test tests/operations/supabase-health.test.mjs
git diff 139edbed8ffd25cd093722d76479b10fee0c053c --check
```

Todos PASS en el SHA probado. Focal/matriz/reproducers/complementos están literalmente incluidos en la suite completa, sin doble cómputo. Advisors: `npx --yes supabase@2.118.0 db advisors --db-url <loopback efímero> --type all --fail-on error`, catálogo real cargado hasta40; results[]/No issues found. La frase genérica del CLI «remote database» se refiere aquí exclusivamente a127.0.0.1, nunca hosted.

**H4-006-F01–F12 CLOSED**:7 materiales (F02/F05/F06/F07/F10/F11/F12) y5 técnicos del entorno/verificador (F01/F03/F04/F08/F09). Cada FAIL, mínimo reproducer, fuente, causa, corrección y retest conserva cronología en defects.md y logs comprimidos íntegros. El excerpt de typecheck se identifica expresamente como extracto de salida de herramienta, sin presentarlo como log completo. Cero materiales abiertos; expected byte a byte igual al commit independiente.

Frontera histórica: H4-004 R35 conserva su expected de39 hasta incidentMigration. No se cambia ninguna migración previa ni expectativa normativa; el verificador nuevo verifica40. H0–H3/H4-001–004, AC-019/051, SM-DO/SM-IN, INC/D040, T05/T07, PM-03/08, fondos/economía exactos, linaje y D039/TTE pasan en regresión acumulada.
