# Correctivo H5-005/006-F10 — diagnóstico y excepción controlada

Autoridad: decisión humana explícita del 08/10/2026 en este hilo. Continuación exclusiva H5-005/006. Preflight: HEAD32888cebda0f85f5cc98df5e4d1a1112dd1cb215,origin/mainb14396627cbadfc4a99dd3b158b47c3562d3f08f,main,árbol limpio,7/0; expected22889bytes/hash congelado intacto. [Captura](../../tests/fixtures/h5-006/f10/preflight.json).

Parche/verificadores: `9be76f010f27f35e20dd806aafbd6f57f69b9a17`. Estado tras verificación: regresión2404PASS/4FAIL de2408; F12 OPEN. F10 técnicamente corregido en audit pero sin cierre formal al no pasar todos los gates. H5-005/006 IN PROGRESS. STOP sin publicación. No se reutilizan pruebas de86f90461 para acreditar el correctivo.

## Diagnóstico reproducido

`pnpm audit --prod` en32888ceb vuelve a fallar exit1. Seis avisos, todos module_name=next, ruta directa. Sin avisos de otras dependencias. [Original íntegro](../../tests/fixtures/h5-006/f10/audit-original.log), [JSON original](../../tests/fixtures/h5-006/f10/audit-original.json), [status](../../tests/fixtures/h5-006/f10/audit-original.status.json). F10 anterior y resultados de86f90461 se conservan en Git32888ceb y [archivo previo](../../tests/fixtures/h5-006/f10/pre-corrective/verification.json).

| Aviso oficial | Severidad | Condición del aviso | Observado en el repositorio | Versión corregida |
|---|---|---|---|---|
| [GHSA-cjq9-62q9-8jv4](https://github.com/advisories/GHSA-cjq9-62q9-8jv4) — SSRF en optimización de imagen | high | images.remotePatterns con URL remota permitida no fiable | No hay next.config ni imágenes/rutas de UI en src/app; no se observa precondición |16.3.8|
| [GHSA-3w37-wq28-93x7](https://github.com/advisories/GHSA-3w37-wq28-93x7) — Fuga de Draft Mode mediante use cache | moderate | Cache Components/useCache y contenido draft dependiente | No hay cacheComponents/useCache/use cache/draftMode en el código |16.3.8|
| [GHSA-4jqv-mc3x-m676](https://github.com/advisories/GHSA-4jqv-mc3x-m676) — Cache poisoning SSG/ISR Pages Router | moderate | Pages Router con SSG/ISR self-hosted | No hay src/pages ni pages; app solo tiene health |16.3.8|
| [GHSA-f87g-xv8r-7p7x](https://github.com/advisories/GHSA-f87g-xv8r-7p7x) — Metadata images ignoran dynamicParams | moderate | App Router webpack con metadata image y segmentos excluidos | No hay opengraph-image/twitter-image ni generateImageMetadata/dynamicParams |16.3.8|
| [GHSA-mcj8-r9mp-w47p](https://github.com/advisories/GHSA-mcj8-r9mp-w47p) — Cache poisoning con catch-all raíz | moderate | Catch-all raíz y rutas SSG/ISR | No hay catch-all raíz ni rutas SSG/ISR de negocio |16.3.8|
| [GHSA-39w2-rjm5-chcv](https://github.com/advisories/GHSA-39w2-rjm5-chcv) — Endpoint MCP de servidor next dev expone datos | low | Servidor next dev; no afecta endpoint en producción | No se ejecutó next dev; build/typegen no prueban explotación. Pin vulnerable también contempla dev futuro |16.3.8|

Las condiciones observadas son una evaluación de superficie por código/configuración; no una prueba de explotación ni una dispensa de audit. El pin16.3.6 es vulnerable según los seis avisos y el gate sigue siendo obligatorio aunque algunas precondiciones no estén presentes. No se acredita seguridad de un despliegue Hosted/Production.

## Parche mínimo y compatibilidad

Next16.3.6→16.3.8. Solo `package.json` y `pnpm-lock.yaml` en dependencias. Lockfile cambia Next y su familia @next/env/@next/swc, conservando las otras versiones y el grafo ajeno. Sin --force, actualización masiva, dependencias nuevas ni cambios de producto funcional. [Diff exacto](../../tests/fixtures/h5-006/f10/dependency.patch).

Node24.21.0 cumple >=20.9.0; React/ReactDOM19.3.0 cumplen ^19.0.0; TypeScript7.0.2,postgres3.4.9,pnpm11.19.0 y demás paquetes permanecen. [Metadata oficial de npm](../../tests/fixtures/h5-006/f10/next-16.3.8-metadata.json). Typecheck/build y unitarias se ejecutaron sobre el SHA nuevo. La auditoría postparche devuelve advisories={} y severidades cero, sin avisos restantes de otros paquetes; el gate definitivo conserva su comando/exit/SHA por separado.

## Adaptación individual de verificadores

Los tres originales son recuperables mediante `git show 32888ceb:<ruta>` y copias exactas no compilables en fixtures. [Manifest de originales](../../tests/fixtures/h5-006/f10/original-manifest.json). No se modifica su inventario protegido ni se elimina ninguna aserción de migraciones,fuentes,expected,catálogo,datos o health.

| Verificador | Invariante original | Adaptación imprescindible | Contraprueba de alteración prohibida |
|---|---|---|---|
| postgres-h4-018-migration.test.ts, D19 |47 migraciones previas,fuentes aprobadas,expected históricos,dependencias y health byte exactos respecto50dedbdb| Única comparación delegada a assertHistoricalBytes; igualdad exacta para toda ruta ajena a los dos archivos de dependencia. Histórico de dependencias por SHA256 congelado y paquete actual por SHA256 del correctivo.| Copia física de migración histórica alterada: rechazada. También rechazados cambios adicionales de manifiesto/lockfile y manipulación de bytes históricos de dependencias. |
| postgres-h4-019-preservation.test.ts, J22 |48 migraciones previas y límite49,expected,fuentes,dependencias y health respectoae1f3c3| Mismo helper y misma excepción exacta; restantes pruebas V-MIG/datos/advisors conservadas.| Copia física de constitution alterada: rechazada. Negativos de dependencias corrientes/históricas rechazados. |
| postgres-h4-019-f06.test.ts, A11 |48 migraciones y todas fuentes/expected/health respectof8318fad; expectedF06 exacto respecto6c1f060| Mismo helper; aserción adicional del expectedF06 permanece intacta. Concurrencia/autoridad/V-MIG/advisors del archivo intactos.| Copia física de health independiente alterada: rechazada. Negativos de dependencias corrientes/históricas rechazados. |

Helper exclusivo: `tests/support/h5-006-dependency-preservation.ts`. Solo dos rutas exactas y cuatro hashes cerrados, sin prefijos, comodines, variable de entorno ni allowlist extensible:

- package.json: histórico `28b6223e2a3e8e414eaacc54c2f21cc73f3ceeb041dce1d3b3ebfe10201a1258`; actual autorizado `135c5c52046f92d70fa6c77c9e5fc9014a7e24fa2d6d20867b0e325de490cb3c`.
- pnpm-lock.yaml: histórico `1380c6afde70f15ca12514a9989dd314b462de9cd4e87cfb92274e943083fcdf`; actual autorizado `a97d77d529c30b46f5f6cd100d0ab8e2b8e2393e1365cdd0caad563e29044a15`.

Cualquier otra ruta exige igualdad de buffers byte a byte. Cambiar otro paquete,añadir una dependencia,alterar históricos o ampliar el lockfile vuelve a fallar. Seguridad actual se valida con audit producción independiente; el helper no sustituye ni silencia esa auditoría.

Las contrapruebas de `scripts/verify-h5-006-f10-preservation.mjs` escriben y leen archivos en un directorio temporal descartable, invocan la misma comparación ejecutada por cada verificador y exigen rechazo; no alteran archivos históricos del repositorio. [Resultados](../../tests/fixtures/h5-006/definitive/f10-historical-negatives.json). Las20 pruebas de los tres archivos históricos adaptados vuelven a pasar y están incluidas en la regresión, sin sumarlas como pruebas nuevas.

[Preservación funcional193 archivos](../../tests/fixtures/h5-006/f10/functional-preservation.json). Las55 migraciones,src,health,fuentes aprobadas y expected permanecen byte exactos respecto al checkpoint. Expected H5-005/006 y expected históricos no se acomodan al parche. La excepción es solo de dependencias y está autorizada por este mensaje humano.

## Verificación y condición de cierre

Los gates finales sobre el nuevo SHA tienen sus `*-final.status.json`, nunca reutilizan los status previos de86f90461. PostgreSQL esperado2370+38=2408; unitarias146+4=150; health1 separado. Los38 focales,20 históricos,contrapruebas y reejecuciones no aumentan esos totales.

La regresión completa falla por cuatro guardas adicionales de preservación. F12 OPEN y F10 sin cierre formal; no completar ni publicar. Health posterior y auditor final no reejecutados por STOP. Originales ydiagnósticoF12: [fixture](../../tests/fixtures/h5-006/f10/f12/diagnosis.json). STOP tras H5-005/006, H5-007+ y H6 NOT STARTED. DM-PENDING-005 permanece abierto; sin IA/PLAUD/audio/datos personales/envíos/conectores reales,retención/consentimiento supuestos,scheduler,Hosted/Production.

## F12 — cuatro guardas adicionales, sin corrección

La identificación inicial fue incompleta. Fallan postgres-h4-021-f23-migration.test.ts C19,postgres-h4-021-migration.test.ts B68,postgres-h4-023-migration.test.ts ypostgres-h4-024.test.ts por hashes congelados de manifiesto/lockfile. No se tocaron esos verificadores ni sus manifiestos. H4-024 además protege los tres verificadores adaptados; no se supone que exceptuar dependencias resuelva todas las comprobaciones restantes. [Logoriginal](../../tests/fixtures/h5-006/f10/f12/postgres-original.log), [diagnóstico](../../tests/fixtures/h5-006/f10/f12/diagnosis.json). STOP solicitado; continuidad a dirección sin ampliar este correctivo.
