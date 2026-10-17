# Correctivo D — matriz normativa y superficies de comprobación

Oráculo: expected-TSK-H5-017-D.md sellado antes del cambio; Constitución P06/P07/P10/P11/P12/P13/P18/P19; Tasks H5-017/018, §§2.2/6/7; SPEC HIST-001/ERR-001, AC070/072/081; Plan §§4/7.1/8/11.2 B01/B07/B08/B10 C01/C04; BR-HIST-001/002/004, DM-INV-047 y SM-FORB-27. Sin reinterpretar ni modificar normas aprobadas. Resultados finales detallados en evidence-TSK-H5-017-D.md.

| Escenario del encargo | Casos / contraste | Resultado exigido |
|---|---|---|
| A sin revisión; H operación válida | D01 y R01 estado inicial | Proyección vigente idéntica, paginación sin duplicados, operación canónica localizada. |
| B revisión; C consulta original; D consulta nueva | R01/R02 originales, D02/D03 | Recorrido histórico válido en origen, sin visibilidad universal ni definición/estado/evidencia actuales del destino. |
| E autorizado; F no autorizado | D06,9 negativos heredados sobre66, D09 | Auth/MFA/interacción/sesión/actor/scope actuales obligatorios; privados denegados a runtime/TTE/API. |
| G tipo+UUID | D02 contacto y booking con mismo UUID; C02/C03 sobre66 | No arista por UUID solo; cada relación histórica deriva de su versión/contexto real. |
| I operación incompatible | D05/D07/D10; C04/C06 sobre66; original F02 | Ajena desde el inicio o canonizada ajena después no adquiere autoridad histórica. Legado falso conservado pero filtrado. |
| J revisión adicional | D02 A→B→C y regresoA con nuevas aprobaciones | Operaciones por versión/contexto correctos, observaciones originales sin cambio. |
| K historia conservada | D02/D03/D07/D08 y preservación | IDs/valores/fechas/ACL y filas anteriores iguales; ninguna duplicación de persistencia. |
| L evidencia restringida | D02/D03; A11/A14 y seguridad sobre66 | Vínculo original autorizado requerido; sin cuerpos/canarios/economía innecesaria ni evidencia actual ajena. |
| M inexistentes; N rechazos sin efectos | D04; D05/D07; negativos originales | Rechazo constante, conteo de observaciones sin incremento, original intacto. |
| ERR-001; AC072; SM-FORB-27 |25 casos independientes originales y composición existente sobre66 | E4/pending desconocido tras efecto durable, E5 conocido, sin retry ni duplicación ni éxito de negocio inferido. |
| AC070; B08; trabajo incompleto | A12/A13, D04 de seguridad y regresión de dependencias | Pendientes/incertidumbre/avisos visibles; CRM distinto de canal no disponible; no scheduler/efecto externo. |
| V-MIG / P13 | D08/D09 |65→66 con datos, limpio, rollback/reintento,175 tablas/305 funciones/332 políticas/1037 restricciones preservados; solo1 cuerpo cambia. |
| V-DOM/V-DAT/V-EVI | Reproductor original,10 propios,66 regresiones, dependencias y cobertura completa consolidada | Datos sintéticos, PostgreSQL/Auth/Storage aislados, expected previo, resultados y entradas identificados; sin sumar solapamientos. |
| Preservación | Preflight37.229, inventario C37.167 y auditoría62; sellos y SHA actuales | FAIL originales, expected y65 migraciones intactos.455 H5-016 idénticos y composition.ts en su transición C exacta, sin cambio nuevo D. |
| Límites | Documentación D y coordinación | DM-PENDING-005 abierto; H5-017/018 IN PROGRESS; no H5-019/H6, servicios reales, Hosted, commits/push/deploy. |

Tercera auditoría: revisar especialmente el predicado de pertenencia histórica B08, los casos con UUID de tipos distintos, las referencias opcionales, los intentos que después se canonizan en otro contexto, el esquema de errores/ACL, la equivalencia de aserciones originales y la selección única del completo. Esta lista identifica superficies de revisión; no ejecuta la tercera auditoría.

Cierre D final:207/207 actuales en20 suites cargadas con66 o afectadas por su registro;2641 casos de156 suites no afectadas reutilizados de20-complete, con fuentes verificadas. Total2848/2848 únicos en176 archivos. La ejecución completa previa20 conserva2847/2847; se excluyen de la reutilización sus206 casos repetidos. D10 (operación/ejecución con UUID igual pero sujetos distintos) prueba la igualdad exacta del subject, no pertenencia genérica a referencias. Ver complete-coverage.json.
