# H5-011-F14 V3 — Informe de preparación

PROPUESTA PENDIENTE DE AUTENTICACIÓN INDEPENDIENTE. F14 OPEN; H5-011 IN PROGRESS;
H5-012 NOT STARTED. Checkout principal conserva fixture y guarda V2.

## Resultados reales en copia desechable

- H4-012 original completo, tres archivos: 95/95 PASS (24 principal, 45 suplemento, 26 F16).
- MO01: tres comprobaciones originales PASS; comando sin at rechazado por producto.
- R06: dos comprobaciones originales PASS, incluidos los instantes históricos explícitos.
- Comprobaciones temporales adicionales revisadas: 12/12 PASS.
- Consumidores ampliados: 31 archivos, 733 pruebas, 732 PASS / 1 FAIL.
- Único FAIL: H4-024 preservación, guarda V2 rechaza candidato V3 como tercera versión.
  Se conserva íntegro el FAIL. No se activa V3 ni se reduce la prueba para evitarlo.
- Unitarias completas: 194/194 PASS. Build, typecheck y lint/límites: PASS.
- No se ha ejecutado regresión PostgreSQL completa ni auditor sucesor V3.
  Las 37 contrapruebas V3 están preparadas, NO EJECUTADAS.
- V2 applied y 31 contrapruebas son evidencia anterior, contrastada en esta revisión,
  no nueva ejecución ni autenticación de V3.

Copia: /var/folders/yl/gkcr80ts3q78l9tnv5943flc0000gn/T/crm-f14-v3-candidate-pc797fj7/repo
Inventario exacto de inputs revisado SHA-256:
10f61370ca1b8ba59066e991e7c919f2a2611852e50d44ca0d066b72310ef4fe
No se atribuyen resultados al HEAD sin cambios locales ni a H5-012.
Los logs y los códigos de salida constan en results.json; recibos individuales
constan en individual-receipts.json. Los outputs generados por suites en la copia
fueron archivados con sus hashes y restaurados solo en esa copia.

La primera tanda adicional tuvo 5 FAIL de aserción nueva por exigir mayúsculas
SYNTHETIC en source_ref, cuyo literal existente es synthetic-manual. Se corrigió
solo esa aserción adicional, tras leer h.req, y los 12 límites pasan. Se conservan
el test inicial y el revisado, los dos inventarios y todos los logs. Las 95 pruebas
originales H4-012 ya pasaron en esa primera tanda; no se modificaron.

## Inventario completo y límites

Cierre de importaciones estáticas: 36 rutas, fixture + cinco supports + 30 archivos
de integración. Se ejecutaron esos 30 más postgres-h5-011.test.ts (31).
consumer-inventory.json conserva ruta, hash y usos temporales/incompletos, incluido
h4-cancellation-fixtures que vuelve a atestar la solicitud original sin cambiar at.
La guarda por hash es consumidor de preservación separado y se mantiene V2.
No hay otro import de ejecución de scripts/src fuera del cierre encontrado.

| Escenario | Resultado y fundamento |
|---|---|
| Por defecto / mismo f.at | f.proof sin cambios; occurred_at=f.at; request válido |
| Histórico explícito | occurred_at=q.at; R06 conserva interpretación civil D020 |
| Futuro explícito | conserva q.at; request permitido por contrato existente; no regla global nueva |
| Offset / fracciones | conserva representación enviada y mismo instante en PostgreSQL |
| at undefined / ausente en JSON | evidencia válida en f.at, comando sigue incompleto y producto lo rechaza |
| at null | fuera de ModificationCommand; preparación B07 y comando con prueba válida se rechazan |
| Cadena inválida / fecha imposible | preparación y producto rechazan; no normalización ni reparación |
| Evidencia anterior | admisible por guarda occurred_at<=at |
| Evidencia simultánea | admisible, preserva procedencia y actor |
| Evidencia posterior | MODIFICATION_EVIDENCE_REQUIRED:E3; sin cambio de estado |
| Otros comandos incompletos | MO01 y demás guardas originales preservadas; sin completar campos |

La corrección es determinista respecto a q.at/f.at. No añade reloj ni altera UUID;
el fixture existente conserva sus UUID sintéticos y su instante por defecto.
Fuentes exactas:
- docs/business-rules.md:253, BR-HIST-002 (hecho y registro diferenciados).
- docs/domain-model.md:187–202 (§5.2) y §7 (identidad, evidencia, responsabilidad).
- docs/constitution.md:37–44, P06/P07.
- docs/DECISIONS.md:157–163 D020; no modificación de referencia civil ni economía.
- src/domain/operational-modification.ts:3, at:string obligatorio.
- src/domain/civil-time.ts:71–78, instant.
- tests/support/h4-confirmation-fixtures.ts:18, proof sintético con occurredAt=at.
- tests/support/h4-modification-fixtures.ts:10–17, atestación y hash excluyen undefined.
- tests/integration/postgres-h4-012.test.ts:12, prueba negativa MO01 original.
- tests/integration/postgres-h4-012-supplement.test.ts:22, R06.
- supabase/migrations/202609300001_h1_evidence_communications.sql:11–22,135–141, B07.
- supabase/migrations/20261005055658_h4_availability_evidence.sql:54–56, availability_time.
- supabase/migrations/20261005202444_h4_operational_modification.sql:86, modification_proof.
- supabase/migrations/20261003093202_h3_customer_payment_reconciliation.sql:73–78, occurred_at<=at_time.
- supabase/migrations/20261005215404_h4_modification_counterparty.sql:40–48, validación y prueba temporal.
- tests/fixtures/h5-009/f09/closure-protocol-20261013/README.md, sucesor con sello externo.

## Transición propuesta V2 → V3

Único diff funcional: if(q.at===f.at) → if(q.at===f.at||q.at===undefined).
Fixture 3177→3195 bytes; SHA candidato 1dd453597648051e727efd2d394f2e248ab50fed3ed81e046ef7ba95fbe8d01b.
Se crean archivos nuevos de expediente; ningún archivo preexistente del checkout
cambia durante este bloque. No se aplica ninguno de los dos parches.
La guarda candidata cambia únicamente el bloque F14; el resto conserva bytes.
Admite original Git y candidato V3, conserva V2 como antecedente, exige su trust y
su registro exactos y rechaza V2 como tercera versión activa al estar vigente V3.
Nuevo registro en ruta nueva, sin reescritura del anterior. Manifiesto sucesor
sella fuentes/evidencias actuales y todos los artefactos V2. Lanzador/auditor se
adaptan a preapply=V2 y applied=V3, con fixture y guarda exactos en cada fase.
Las 31 contrapruebas se amplían a 37 para cubrir nuevos artefactos y cadena V2.
Bootstrap, parches, guardas y auditor solo se ejecutarán tras sello externo nuevo.
La revisión estática propia no equivale a esa aprobación.

## Integridad y pendientes

36139 archivos preexistentes del checkout preservados por hash/tamaño/modo.
Inventario histórico: 35942 entradas, con solo las dos
transiciones V2 ya autorizadas. 135 entradas previas
H5-011 preservadas, con prefijos documentales intactos. Expected intacto.
F09/F06–F08 siguen CLOSED local/aislado; limitaciones históricas no reabiertas.

Pendiente imprescindible: revisión externa del trust V3 y sello aceptado.
Después: preapply autenticado, aplicación exacta, applied y 37 contrapruebas,
repetición de preservación y regresión integral. No se declara F14 CLOSED ni
H5-011 completada. No se modifican contratos, expected o expedientes históricos.
Sin staging, commit, push, H5-012, despliegues u operaciones externas.
