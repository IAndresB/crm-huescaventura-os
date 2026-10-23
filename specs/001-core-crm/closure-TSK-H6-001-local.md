# H6-001 — Cierre formal local/aislado

**TSK-H6-001 COMPLETED — exclusivamente local/aislado. H6 global IN PROGRESS.** Decisión expresa del director ratificada el 23 de octubre de 2026. [Acta de aceptación](acceptance-TSK-H6-001-local.md) y [recibo de decisión](../../tests/fixtures/h6-001-local-closure/decision-receipt.json).

## Identidad y criterio de cierre

Repositorio `IAndresB/crm-huescaventura-os`; base local `971c55d5ce5770c71284d106d3c0deecca9514b5`; worktree `h6-001-local`, HEAD separado y sin índice. La URL origin se leyó de la configuración local, sin acceso al remoto. No hay commit nuevo ni integración en main.

El candidato técnico aceptado sigue identificado por el manifiesto SHA-256 `d97ab86cd4d78c001f5a5e29f3ce501c0c6b44cf592a7b22e78589c26569c435`, 305 archivos / 52.932.020 bytes; 14 antecedentes independientes y paquete funcional de 173 archivos. La nueva identidad documental es el [manifiesto de cierre](../../tests/fixtures/h6-001-local-closure/delivery-manifest-v1.json) y su [sello](../../tests/fixtures/h6-001-local-closure/delivery-seal-v1.json). La [lectura final independiente](../../tests/fixtures/h6-001-local-closure-readback/README.md) se conserva fuera del conjunto que verifica, para evitar autorreferencia.

Se consultaron directamente Tasks §6/ficha H6-001, SPEC §9/AC-089/SPEC-NFR-001, Architecture §§6/13/16, Plan §§9–10.1, README, PROJECT-STATUS, NEXT-STEPS y las evidencias de H5-019. Permanecen exactamente las tres asignaciones **AC-089, SPEC-NFR-001 y E2E-01**, con B01–B10, C01–C06 y T01/T02/T03/T04/T05/T07/T10. No se modifica ninguna fila normativa, guarda, criterio o política.

H5-019 queda ratificado por D01–D03, sello `31fd4ac89aea684f2155a4365cb5870a0c0163838cbfd543d2ad98d0db1ea619` y commit publicado histórico `8a5f1408777b81b760a02646fa414a34dc17983e`, ancestro de la base local. La auditoría del cierre comprueba 180 miembros contra los blobs de ese commit y 177 miembros actuales, excluyendo las tres cabeceras de coordinación evolucionadas. No se usa su casilla COMPLETED como sustituto de evidencia.

## Alcance acreditado

Recorrido continuo interno sintético: Contexto → Lead/Opportunity → modalidades/versiones → Acceptance verificable → una Booking → servicios, cantidades y noches → recepción/conciliación/asignación de fondos y confirmaciones → ejecución y documentos → tres cierres explícitos. La persistencia usa contratos ordinarios y PostgreSQL real aislado; no se siembran por SQL estados de éxito de negocio. Desde la Booking se reconstruyen originales, vínculos, movimientos, porciones, decisiones y fundamento de cada cierre.

El [informe técnico original](evidence-TSK-H6-001.md), la [matriz local](matrix-TSK-H6-001.md) y el [dictamen independiente](../../tests/fixtures/h6-001/independent/independent-verdict.md) se conservan completos. Sus estados IN PROGRESS y recomendaciones corresponden al momento anterior a la decisión actual; no se reescriben para aparentar aceptación previa.

No se acredita una misma Booking mixta con proveedor externo integrado; esas ramas tienen regresión y contrapruebas separadas. Tampoco se cierran E2E-02–07, todos los AC compartidos, UI, conectores reales, SMTP/entrega, fiscalidad, Hosted/Production, RPO/RTO o recuperación operativa nueva. Los binarios/cachés locales siguen siendo una precondición de reproducción, sin descarga independiente comprobada en otra máquina.

## Ratificación de resultados

| Evidencia histórica sellada | Resultado preservado |
|---|---|
| Focal del ejecutor y repetición independiente | 22/22 PASS cada uno, sin sumarlos como 44 casos únicos. |
| Unitarias | 212/212 PASS. |
| Contrapruebas independientes A01–A06 | 7/7 PASS, incluidos seis casos y contenedor. |
| H5-019 I01–I03 sobre cadena68 | 3/3 PASS. |
| Typecheck, lint, build y diff-check | PASS en las ejecuciones originales. |
| Matriz independiente | 34 AC y 105 referencias ejecutadas exactas. |
| Regresión amplia original | 2.899 PASS y 46 FAIL de 2.945; 0 cancelados/skips. |
| Reconciliación | 46 sucesores PASS identificados; ningún hallazgo material pendiente dentro de cobertura. Sin nueva completa limpia. |

En este cierre **se reejecutan verificaciones de identidad, logs, fuentes, coherencia, inventario y diff; no pruebas funcionales**. El verificador original sigue dando 557 controles PASS. El nuevo [verificador del cierre](../../scripts/verify-h6-001-local-closure.py) dio [5.575 controles PASS](../../tests/fixtures/h6-001-local-closure/verification-r1.json), incluyendo original331, referencias de resultados, reversibilidad documental y selección idempotente de rutas. Los recuentos son comprobaciones instrumentales, no escenarios de negocio nuevos. La lectura final añade la verificación del manifiesto documental y su recibo separado.

Los 46 FAIL permanecen en [AF001–AF046](../../tests/fixtures/h6-001/independent/reconciliation.json): 29 de formato de salida CLI, cuatro guardas históricas de bytes, doce arranques impedidos por puerto ocupado y un fixture temporal. Se contrastan nuevamente sus líneas FAIL y las líneas PASS de los sucesores, con identidades de fuente. El primer W53 sucesor fallido y el primer intento de contrapruebas también permanecen. No se afirma 2.945/2.945 PASS ni se certifica verde el runner histórico sin sus adaptaciones documentadas.

## Preservación y coordinación documental

Los **331 paths originales** del candidato y sus envolturas conservan tamaño y SHA. Las 68 migraciones y los 14 antecedentes mantienen su identidad. No hay modificación nueva de producto, seguridad, dependencias, configuración o semántica. Los tres documentos compartidos son parte de los 305 sellados; por ello permanecen intactos.

Se entregan tres [variantes documentales](../../tests/fixtures/h6-001-local-closure/documentary-variant-manifest.json) con preimagen/postimagen y un [parche no aplicado](../../tests/fixtures/h6-001-local-closure/documentary-variant.patch). Añaden el estado vigente H6-001, cambian únicamente su línea de ejecución y conservan literalmente los bloques de cierre H6-015 procedentes del snapshot `8ec91602a3bf813cf01ffbc6b2ac1a2862fe10d0`, junto con todo el histórico H6-001 y las filas normativas. Son resolución propuesta del solapamiento, **pendiente de autorización de publicación conjunta**, no integración ni sustitución de los lotes originales. Los enlaces internos de las variantes mantienen el contexto de su ruta canónica futura.

La verificación de H6-015 es exclusivamente documental: **16 manifiestos y 4.568 entradas**, sin discrepancias. Cuatro trabajos suspendidos por recibos sellados preservados; sin runtime, SQL, restore, S11 o levantamiento de bloqueos. La aprobación de H6-001 no formaliza otra decisión H6-015. Sus snapshots y R1/R2 siguen intactos; R1 es histórico excluido y R2 es antecedente local aceptado identificado por hash, nunca una selección implícita para publicar.

La comprobación de coordinación encontró el otro hilo CRM visible en estado idle. El trabajo se limita a rutas nuevas de cierre y su auditor escribe solo en su directorio propio; el control por hashes de originales y la lectura final delimitan cualquier interferencia. No se confunde el estado de un hilo con el estado del runtime suspendido.

**Aclaración documental aditiva:** existe `/Users/andres/.codex/AGENTS.md`, SHA-256 `d1e8a26ea3d4d10c5674a2c2ea3bc7f0b5ef4b3618362eac07f0f3308f093721`. Su contenido reproduce las instrucciones del usuario aplicables. El informe técnico anterior indicó que no se había encontrado AGENTS en los ancestros consultados; esa observación se conserva, y esta lectura la corrige para el cierre sin alterar el expediente sellado ni sus resultados.

## Custodia y siguiente operación

La [ratificación independiente previa](../../tests/fixtures/h6-001-local-closure/independent-preflight/preflight-closure-v1.md) es PASS; sus expectativas C01–C15 se congelaron antes de recibir el nuevo candidato. El [recibo final independiente](../../tests/fixtures/h6-001-local-closure-readback/README.md) consigna el dictamen sobre los bytes finales del cierre. El principal conserva su HEAD e índice, sin cambios versionados; sus 14.954 históricos se contrastan por rutas/tamaños, sin inventar hashes antiguos no registrados.

La [propuesta de publicación](publication-TSK-H6-001-local-closure.md) detalla lotes A/B/C/D1/D2/E, dependencias, rutas, hashes, conflictos, comprobaciones posteriores y recuperación. Nada se publica. La siguiente autorización imprescindible, si el director decide avanzar por esa vía, es sobre los lotes y rutas exactos que se quieran integrar/publicar, incluida la resolución documental combinada. Drive, despliegue, conectores reales y reentrada conservan sus autorizaciones independientes; no se requieren para este cierre ya formalizado.
