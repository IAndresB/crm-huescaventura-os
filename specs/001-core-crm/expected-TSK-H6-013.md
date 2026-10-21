# TSK-H6-013 — expected anterior a observación

Base exclusiva `8a5f1408777b81b760a02646fa414a34dc17983e`, árbol `758e871c7ad621dcbdb69516cccd175e529dbd6e`. Autoriza únicamente ensayos locales sintéticos. No se modifica Tasks ni normas; H6-013 queda candidato a revisión, sin aceptación unilateral.

Fuentes: los nueve documentos normativos están identificados por SHA-256 en `base-inventory.json`; extracción literal de las 13 filas en `normative-rows.json`. Constitución P10–P13/P18, Plan 5.4/10.1/11.4 y Tasks 2.2–2.3/6/7 gobiernan el resultado. Los expected históricos permanecen intactos. Inventario estructural independiente: análisis estático del SQL autorizado, nunca catálogo observado convertido en expected.

| Caso | Expected previo y fuente |
|---|---|
| A01/A02 | Dos clústeres nuevos aplican exactamente la cadena ordenada identificada; misma estructura normalizada; todo objeto esperado presente. P13, V-MIG. |
| A03 | Repetir una migración no introduce duplicados: o rechazo transaccional o resultado idéntico. No se presume idempotencia universal de DDL. |
| B01 | Hecho sintético anterior H0 access_probe sobrevive cada migración posterior exactamente. Fixture auténtico H0-010. |
| B02 | Desde esquema26: identidades y relaciones reales del fixture H1 sobreviven27–68. |
| B03 | Desde30: Booking, Acceptance, versiones y términos fijados sobreviven31–68; mismos IDs/relaciones/snapshots/historia. Fixture `h2-booking-fixtures.ts`. |
| B04 | Desde33: recepción/conciliación/asignación de porciones reales del fixture histórico sobreviven34–68, importes exactos. Fixture `h3-allocation-fixtures.ts`. |
| B05 | Desde52: hechos anteriores de preparación conservados53–68; expansión53 solo añade last_closure nulo en Task, no altera columnas anteriores. |
| B06 | Desde63: tres cierres y su historia conservados64–68; fixture auténtico jointFixture. |
| B07 | Desde67: diagnósticos/trabajo anteriores conservados68, replay reautorizado y mismos ACL/OID; suite histórica S6 y Q/V de migración. |
| C01 | Runtime/HA son logins distintos del migrador: NO superuser/BYPASSRLS/CREATEROLE/CREATEDB ni escalada al migrador; propietarios internos NOLOGIN. Plan6.5/V-DAT. |
| C02 | Tablas protegidas RLS+FORCE RLS; sin lectura/escritura directa runtime; llamadas sin contexto/falsificadas y actor inhabilitado rechazadas; contexto no migra entre operaciones. Suites H0 y ensayo directo. |
| C03 | UPDATE/DELETE sobre historia y objetos fijados rechazados por identidad ordinaria y sin datos cambiados. G4/HIST-002/DM-INV-028/051. |
| D01 | Fallo SQL inyectado antes de COMMIT revierte catálogo/datos sin estado híbrido; reintento hacia delante converge. Instrumentación solo en memoria/copia de ensayo, SQL oficial intacto. |
| D02 | Incompatibilidad/constraint: rechazo real preserva datos, nunca DELETE/relajación para pasar. Suites históricas y ensayo FK/UNIQUE. |
| D03 | Dependencia fuera de orden rechazada; estado parcialmente aplicado solo en clúster desechable, recuperación explícita. No fingir que aplicación rollback revierte esquema. |
| E01 | Regresión seleccionada oficial H5-019 en réplica íntegra; assertions originales sin editar. Pruebas heredadas/repetidas no se suman como nuevas. |
| E02 | Compatibilidad aplicación/esquema por versiones concretas: solo la versión/adapter realmente ejecutado puede acreditarse. Las combinaciones no ejecutadas quedan NO ACREDITADAS y bloquean PASS si exigibles. |
| E03 | Evidencia recuperable con hashes, logs originales y verificación de toda ruta base; cero cambios históricos. V-EVI/NFR-015. |

Los casos nuevos se ejecutarán tras sellar este archivo; un error del instrumento se registra antes de corregirlo. No se modifica un expected tras observar para hacerlo pasar. Una suite histórica con fixture corregido usa su hook oficial explícito; no convierte un FAIL histórico en PASS. El éxito de una instalación vacía no acredita por sí solo una actualización con datos.

SPEC-NFR-005/PLAN-B10: alcance de migración y recuperación transaccional; ensayo integral de restauración de objetos/servicios, RPO/RTO y procedimiento corresponden a H6-014/015, no iniciados. Hosted/Production no acreditados; DM-PENDING-005 OPEN.
