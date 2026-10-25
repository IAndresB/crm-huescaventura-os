# TSK-H6-007 — Matriz normativa y evidencia local

Base `9c15e6d143822f7fcc84f29744194554630f4ac4`. Expected propio32 casos congelado antes del ejecutable: SHA-256 `49bd0f2417002f0be1f567cd6795f5b9e3e5d59ff683a9279b6e207570542a31`. Expected independiente anterior: `0c859b5eed9f0960a7616fb1159b853f8b5f56993ddcb50fa99109d8697c83c3`. No se modifican criterios para resolver un FAIL.

| Asignación directa | Obligación exacta | Comprobación ejecutada |
|---|---|---|
| SPEC-FR-CLOSE-004 | Evidencia que invalida criterio: solo evaluación afectada Pendiente; retirada del cierre vigente; cierre/fundamento anterior y causa conservados; no reescribir aceptación/ejecución ni nuevo contrato. | P01, A01–A04, F11; snapshots comerciales/operativos, invalidaciones y cierre previo exactos. |
| AC-061 | Discrepancia material de pago tras cierre conjunto reabre economía y retira cierre actual, conservando pasado/causa y otras dimensiones. | A01 con instante/evidencia posteriores, A02/A03 y recuperación F11; lectura canónica A04. |
| PT-10 | Tres cierres, excepciones acotadas y reapertura fundada, dentro del recorrido H6-007. | P01/D04/F01–F07/F11 y49 regresiones dirigidas; incluyen insuficiencia, fianza/Refund y críticas sin dispensa económica. |
| E2E-07 | Nuevo documento o discrepancia material invalida criterio; condición vigente separada de cierre histórico y operación realizada. | Focal32 casos A–F; X01 y H5-013 N02 para AC-046; H01 y antecedentes H5-012 para cláusulas AC-062; prestación excepcional revisada AC-063 explícita. |
| G5, SM §2.1/§16 | Solo dependencias aprobadas habilitan reevaluación; no satisfacen guardas de otra dimensión por arrastre. | A01/A03, B01/B02, F09/F10/F12: independencia de dimensiones y raíces; no efectos comerciales/operativos/económicos añadidos por una lectura. |

G1/G2/G4/G6 tienen negativos propios E01–E04/D01–D05/C01–C03 y atomicidad F01–F12. G3 se conserva en los contratos sensibles reutilizados de proveedor/Refund; el recorrido principal de discrepancia/cierre es un acto humano autorizado, no una ejecución sensible de IA sin aprobación.

La correspondencia literal por32 ID, expected, observado y línea de log está en [traceability-v1.json](../../tests/fixtures/h6-007/traceability-v1.json). Las19 posiciones fallidas y sus sucesores están en [failure-successors-v1.json](../../tests/fixtures/h6-007/failure-successors-v1.json). La réplica y los10 controles ejecutables propios del auditor, su matriz36 y su grado de independencia están en el dictamen del paquete independiente.

## Cobertura transversal y límites

| Referencia | Alcance efectivo |
|---|---|
| AC-046 | X01 y N02 de H5-013: pago real sintético, documento posterior revisado/vinculado, suplido y nueva discrepancia, sin cierre por arrastre. No venta externa completa con tres cierres. |
| AC-058–060 | P01 y cuerpos H5-013/H5-014/H5-015 reejecutados: condiciones independientes, pendientes económicos y excepción crítica acotada; no se cambian sus aserciones. |
| AC-062 | H01 nuevo: archivo de identidad, recuperación, vínculos/código e historia de cierre. Fusión/otro expediente/no reutilización de códigos: evidencia H5-012 candidate61 H06–H08 aceptada y preservada por identidad, no ejecución nueva ni AC completo atribuido a H01. |
| AC-063 | Prestación sobrevenida excepcional revisada con evidencia y original preservados; no start/finish ordinario ni aprobación retroactiva. |
| P06/P07/P08; SM-CL-01–05 | Actor, fecha del hecho/registro, fundamento, historia, dimensiones y causa; cierre antiguo inmutable, actual retirado y nuevo cierre explícito. |
| P10/P11; G1–G6 | Guardas reales de servidor/PostgreSQL, deny-by-default, contexto F1/F2, actor revocado, replay reautorizado y DML directo rechazado. Datos sintéticos; no ampliación de roles/permisos. |
| Architecture §12; Plan T09/T10/§10.1 | Origen+historia+resultado+invalidación atómicos, fallo diferido COMMIT con testigo, pérdida de acuse tras commit real, ambos órdenes y raíz independiente con sesiones reales. No acredita T01–T11 integradas ni H6-016. |
| P13 / V-MIG |68 migraciones históricas intactas; ningún cambio estructural de producto. El caso M02 reejecuta explícitamente un61→62 histórico, no se presenta como upgrade68 completo nuevo. |
| P18 / V-EVI | Inputs por ejecución, logs crudos recuperables por hash, snapshots anteriores y fallos/sucesores. Sin regresión global limpia ni inflación por sumar replays. |

La única dependencia formal H5-019 se acredita en [H5-dependency-readback-v1.json](../../tests/fixtures/h6-007/H5-dependency-readback-v1.json), con sello D01 recalculado y recibos D01–D03. No se acredita Hosted/Production ni se resuelven DM-PENDING-005/ARCH-PENDING-002 por esta matriz.
