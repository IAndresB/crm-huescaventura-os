# Candidato de aceptación y cierre local — TSK-H6-008

Fecha local: 2026-10-22. **Dictamen técnico PASS / revisión independiente PASS. Candidato preparado; aceptación formal pendiente. H6-008 no se registra COMPLETED.**

La autorización del director permite implementar y ensayar Auth/servidor reales exclusivamente locales, con identidades sintéticas, y preparar el candidato de aceptación y cierre si supera todos sus criterios y revisión independiente. Se ha alcanzado esa salida. Este documento no extiende la autorización a Hosted/Production, publicación ni ejecución H6-015.

## Identidad y alcance aceptable

Base `971c55d5ce5770c71284d106d3c0deecca9514b5`; árbol `8b43af1acc0d4be40321de1c5bc303129cdb47cd`. Candidato local sin commit en `/Users/andres/.codex/worktrees/h6-auth-corrective/crm-huescaventura-os`. Checkpoint ejecutable de 13 archivos: `tests/fixtures/h6-auth-corrective/r2-review-checkpoint.json`, SHA-256 `c71b34b195cb922b2b7e3945f176b78cb279063f2b0fbe50c5da08dceb02ee9e`. El manifiesto de entrega final es `tests/fixtures/h6-auth-corrective/delivery-manifest-r2.json`.

Las dependencias expresas H5-019, H0-006, H0-014, H1-016 y H5-012 mantienen su salida local acreditada. La [matriz R2](matrix-TSK-H6-008-r2.json) conserva las 23 asignaciones literales y relaciona sus pruebas. Las diez fuentes normativas y los expected históricos permanecen exactos. No se cambia SQL ni la cadena aprobada de 68 migraciones Core.

Se propone aceptar la verificación de autenticación password/TOTP real, renovación, logout, revocación global, sesión/autoridad Core y frontera HTTP. Se incluyen las 16 superficies documentadas y el inventario ampliado de 105 entradas Core; cinco operaciones de ciclo de sesión y una de metadatos completan el mapa de 111 filas. El resultado acredita la admisión común de todas las entradas enumeradas; no equivale a probar todas las ramas funcionales del producto.

## Evidencia que sustenta la propuesta

| Grupo | Resultado final |
|---|---|
| Integración Auth/HTTP/PostgreSQL/Storage | 17 PASS, sin skip |
| Corrección de identificación en vuelo F01 | 3 PASS, dos instancias y ambos órdenes |
| Cobertura M02 | 7 PASS: 105 positivos y 1.260 denegaciones, sin cambios Core ni llamadas Storage durante rechazo |
| Revisor en contexto y checkout separados | 32 PASS: 17 integrados + 3 F01 + 7 M02 + 5 contrapruebas propias |
| Regresión H6-006 sobre el candidato final | 62 PASS, sin skip |
| Regresión histórica H6-008/H0/H1 | 60 PASS y 1 skip histórico S10 conservado |
| Unitarias / lint / typecheck / build | 210 PASS / exit 0 / exit 0 / exit 0 |

Los resultados repetidos del revisor demuestran reproducibilidad y no se suman como escenarios diferentes. El faltante histórico S10 se acredita por separado con la integración Auth real nueva. Logs, recibos y límites están en [evidence-TSK-H6-008-r2.md](evidence-TSK-H6-008-r2.md).

El [informe independiente R2](../../tests/fixtures/h6-auth-independent-r2-custody/specs/001-core-crm/independent-review-TSK-H6-008-r2.md) recomienda aceptar este candidato y no identifica defecto material abierto adicional dentro del alcance. Manifiesto independiente: 564 payloads, SHA-256 `63fb482b12b44672db1abd948970a7ae2ec682788b9e02f3a59822baad086af9`. La contraprueba original que detectó F01 se conserva y pasa sin cambiar su expectativa; una prueba adicional confirma rechazo SQL42501 después de revocar una capacidad F2 ya firmada.

## Límites que acompañan la aceptación

- Supabase Auth v2.197.0, PostgreSQL 17.11 y Storage reales locales, con datos y autoridades efímeras sintéticas. No proveedor Hosted, usuarios reales ni efectos externos de negocio.
- Una firma JWT válida después de logout no implica acceso válido. El proveedor fijado rechaza `/user` y refresh de sesión eliminada; Core mantiene su revocación durable independiente, incluso ante fallo Auth503. El fallo parcial no se presenta como éxito global.
- Los handles se almacenan en memoria del servidor. La pérdida de ese estado exige identificación nueva; no se acredita continuidad multinodo ni persistencia de esos handles. H6-008 ensaya reemplazo del gestor, no crash de proceso HTTP. H6-006 sí ensaya caída real del ejecutor.
- Las dos entradas Work tienen cobertura funcional directa/HTTP y revisión de guardias, sin afirmar observación interna de SQL que su encapsulación no permite. Las otras 103 entradas presentan la traza SQL real exigida.
- La interfaz anterior de `establish` conserva compatibilidad. El único llamador de producto revisado pasa la generación previa al TOTP; futuras integraciones deben mantener esta condición.
- Sin UI completa, dispositivos físicos, recuperación real, RPO/RTO productivo ni cierre global de H6. ARCH-PENDING-002 y DM-PENDING-005 siguen OPEN; PLAN-PENDING-003 conserva sus límites.

## Decisión propuesta al director

Aceptar este candidato exacto y autorizar el registro de H6-008 como COMPLETED exclusivamente local/aislado. Después, revisar las cuatro dependencias de H6-015 y conceder una autorización separada y delimitada para su ensayo sintético en cuarentena, si procede. La presente propuesta no inicia ese ensayo, no prepara recursos H6-015 y no autoriza reentrada, commit, push, publicación, despliegue ni Drive.
