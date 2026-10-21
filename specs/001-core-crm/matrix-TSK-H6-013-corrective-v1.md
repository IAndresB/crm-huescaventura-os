# H6-013 — matriz adicional del correctivo v1

La asignación original de13 filas normativas permanece íntegra. Este suplemento vincula los hallazgos de auditoría a instrumentos nuevos o corregidos; no declara cierre global de ninguna fila.

| Hallazgo propio de auditoría | Fuente aplicable | Instrumento | Expected |
|---|---|---|---|
| AUD-H6013-01 | V-DAT, AC-079, P13, PLAN-B10 | h6-013-security.ts y negativas H6-013 | Inventario completo e identidad exacta, propietarios compatibles, permisos efectivos; omisión y función inesperada detectadas. |
| AUD-H6013-02 | V-DAT, V-EVI y política de esta base verificada en la primera auditoría | mismo verificador y siete controles transaccionales | Solo pg_catalog,pg_temp explícito en ese orden; public, orden inverso y ausencia rechazados. |
| AUD-H6013-03 | V-MIG, SPEC-FR-HIST-002, DM-INV-028/051, PLAN-DEC-003, G4 | postgres-h6-013-h1-preservation.test.ts y h6-013-preservation.ts | Ocho predecesores poblados18–25; columnas y relaciones conservadas, pérdidas deliberadas detectadas, rollback/restauración. |
| AUD-H6013-04 | V-EVI y Tasks2.3 | suplemento de evidencia del correctivo |2950 son resultados Node; no criterios de negocio únicos. FAIL históricos y pruebas reales R091/R092 se conservan. |

Los estados observados se consignan en el suplemento de evidencia después de las ejecuciones. Expected ejecutable y sello previos: tests/fixtures/h6-013/corrective-v1/expected.json y expected-seal.json.
