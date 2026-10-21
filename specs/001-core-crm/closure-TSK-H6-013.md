# TSK-H6-013 — cierre consolidado local/aislado

**COMPLETED — local/aislado. Aceptación técnica del director registrada el 2026-10-20. Publicación pendiente.** Este documento consolida evidencia aceptada; no constituye otra ejecución de la batería técnica.

## 1. Autoridad, base y alcance

[Autorización y aceptación](acceptance-TSK-H6-013.md). Base `8a5f1408777b81b760a02646fa414a34dc17983e`, árbol `758e871c7ad621dcbdb69516cccd175e529dbd6e`. Se releen y verifican la identidad técnica V2, la auditoría final y la preservación antes de actualizar exclusivamente documentación de estado. [Preflight del cierre](../../tests/fixtures/h6-013-closure/initial-integrity.json).

Las 38.702 rutas de base estaban intactas; V2 contiene 16.104 archivos y 239.090.845 bytes, con tres cambios y 567 incorporaciones respecto a V1. El cierre mantiene íntegros esos 16.104 archivos; las únicas excepciones documentales a la base son Tasks, PROJECT-STATUS y NEXT-STEPS. Las fuentes normativas, sus criterios y las otras fichas no cambian.

## 2. Las 13 asignaciones normativas

Fuentes del commit oficial: Constitución, DECISIONS, reglas de negocio, modelo de dominio, máquinas de estados, arquitectura, SPEC, Plan y Tasks. Tasks §§2.2–2.3, 6 y 7; Plan §§5.4, 10.1 y 11.4. La [extracción independiente](../../tests/fixtures/h6-013-closure/audits/final/normative-13-final.json) y la [cobertura independiente](../../tests/fixtures/h6-013-closure/audits/final/normative-coverage.json) confirman exactamente estas filas; las líneas corresponden a la base anterior a este cierre.

| ID | Evidencia aceptada y límite |
|---|---|
| SPEC-FR-HIST-002 | Versiones, snapshots e historia conservados en H1, recorridos largos y S6 histórico. |
| AC-079 | Recursos propios, datos sintéticos y pruebas aisladas; no uso real. |
| SPEC-NFR-004 | Separación de entorno, roles y recursos; Hosted no acreditado. |
| SPEC-NFR-005 | Rollback/reintento y reparación de migración; recuperación integral H6-014/015 pendiente. |
| SPEC-NFR-012 | Identificadores, referencias y hechos históricos preservados; sin política de eliminación inferida. |
| SPEC-NFR-015 | Expected, FAIL, resultados, versiones y referencias recuperables. |
| DM-INV-028 | Maestros versionados, snapshots e importes históricos no recalculados. |
| DM-INV-051 | Archivo, identidad, relaciones e historia conservados. |
| ARCH-DEC-017 | Aislamiento y separación migrador/runtime. |
| P13 | 68 SQL auténticos, orden y prefijos canónicos, instalación y actualización verificadas. |
| PLAN-DEC-003 | Identidades estables, relaciones estructuradas y snapshots inmutables. |
| PLAN-B10 | Migración, herramientas y calidad de H6-013; no acreditación del resto de H6. |
| G4 | Conservación de hechos/historia; cambios indebidos detectados. |

Estas son satisfacciones parciales asignadas a H6-013; ninguna fuente global compartida se marca satisfecha sin sus otras verificaciones.

## 3. Instalación, actualización y conservación

[Informe original](evidence-TSK-H6-013.md), [inventario SQL](../../tests/fixtures/h6-013/migrations.json) y [orígenes canónicos](../../tests/fixtures/h6-013/version-origins.json). Las 68 migraciones mantienen bytes oficiales; huella ordenada `139c5cfb7bbfb94e18739e82af6f7d7eec0f7c4fb30ca39e5bc575611b945941`.

Las dos instalaciones completas y 410 resultados de cadena son evidencia técnica anterior verificada, no una ejecución del cierre. Se contrastaron estructuras/dumps, restricciones, funciones, índices, triggers, permisos, RLS, reaplicación y recuperación; la auditoría final reconstruyó 410 resultados satisfactorios. Los prefijos internos no se presentan como releases separados.

| Recorrido | Transiciones | Procedencia vigente |
|---|---:|---|
| H1 18→26 | 8 | V1 reforzó contenido; V2 y auditoría final lo repitieron con precisión exacta. |
| 26→68 | 42 | V2 y auditor final; identidad y relación contextual. |
| 30→68 | 38 | V2 y auditor final; Booking, Acceptance y snapshots. |
| 33→68 | 35 | V2 y auditor final; importes, asignación 125.00 y consumo 25.00 sobre 500.00. |
| 52→68 | 16 | V2 y auditor final; preparación y hechos económicos. |
| 63→68 | 5 | V2 y auditor final; tres cierres e historia. |
| 67→68 | 1 | Fixture S6 histórico, mantenido como evidencia anterior; no repetido por V2/cierre. |

Los cinco recorridos largos suman 136 transiciones. H1 comprueba todas las columnas anteriores, identidades, referencias, snapshots, historia y restricciones. Detecta 23 alteraciones: 8 valores, 8 pérdidas y 7 referencias válidas cambiadas; 8 fallos DDL previos a COMMIT se revierten y recuperan. La auditoría final añadió, fuera del candidato, comparación de texto/hashes dentro de PostgreSQL y repitió H1 y los cinco recorridos.

Los adaptadores históricos se extraen de commits auténticos; en tres casos preceden al SQL canónico corregido del paquete, diferencia declarada y contrastada separadamente. La compatibilidad cubre esos contratos y las ampliaciones previstas; no releases completos arbitrarios ni downgrade. Nuevos hechos requieren reparación hacia delante cuando proceda.

## 4. Seguridad y correctivos

[Correctivo V1](evidence-TSK-H6-013-corrective-v1.md): inventario completo de SECURITY DEFINER, validación estricta de search_path y conservación H1, sin cambios de producto. Se mantiene la precisión de contadores AUD-H6013-04.

[Correctivo V2](evidence-TSK-H6-013-corrective-v2.md):

- AUD2-H6013-01: identidad de parámetros sin distinguir capitalización, examen de todas las entradas y rechazo de duplicados/ambigüedad. PostgreSQL aplica public en el contraejemplo mixto; V1 lo aceptaba y V2 lo rechaza.
- AUD2-H6013-02: texto PostgreSQL, tokens numéricos exactos, etiquetas de tipo y máscara SQL NULL; evita la pérdida de precisión del decodificador JSON. Los cinco recorridos largos usan el helper corregido.
- AUD2-H6013-03: conciliación actual de copias sueltas y recuperación exacta por TAR, sin reparar originales.

La auditoría final reconstruye 132 funciones desde el catálogo completo sin filtro de esquemas, verifica propietarios/atributos/EXECUTE, ausencia de EXECUTE público y separación de roles. Incluye las cuatro omisiones antiguas de crm_ha/crm_internal. Se comprueban 175 tablas × 4 roles × 4 operaciones: 2.800 intentos únicos rechazados con SQLSTATE 42501. Los contratos legítimos también funcionan; denegar todo no es el oráculo.

El auditor ejecuta 10 configuraciones adicionales, 20 pares contrastados por igualdad JSONB en PostgreSQL y 10 mutaciones/equivalencias contrastadas con EXCEPT ALL. V1 igualaba 9007199254740992 y 9007199254740993; V2 distingue identidades y hashes. Se cubren negativos, extremos bigint, decimales, escala, NULL, anidación, referencias, orden y multiplicidad. Los 55 valores del fixture en 53 tablas mantienen sus resultados; máximo entero 2026. [Contrapruebas independientes](../../tests/fixtures/h6-013-closure/audits/final/h6-013/auditor-independent/independent.json).

## 5. Auditorías y cronología preservada

1. Primera auditoría: PASS CON RESERVAS, tres defectos menores de instrumentos y observación de contadores, según el antecedente aceptado por el director y el informe V1. Su evidencia original permanece en las custodias verificadas; no se inventa una firma o informe externo adicional.
2. Segunda auditoría: tres hallazgos AUD2-H6013-01/02/03 MENOR y 04 OBSERVACIÓN. [Hallazgos originales copiados sin cambios](../../tests/fixtures/h6-013-closure/audits/second/findings.json). Motivaron V2; no demostraron un defecto material del producto.
3. Auditoría final: **PASS**, con reproducción independiente y recomendación expresa de aceptación local/aislada y cierre documental. [Conclusiones exactas](../../tests/fixtures/h6-013-closure/audits/final/audit-conclusions.json), manifiesto/sello enlazados en la aceptación.
4. Director: acepta técnicamente V2 y autoriza este cierre. Publicación separada y pendiente.

Los tres sellos del expected original, V1/suplemento temporal y V2 están intactos. Expected V2 SHA-256 `c7c65eb596bd9b2548b84177dd4ab9c066659123abf7219ea1f8c5f9c850b121`; preparado/sellado el 20/10/2026 a las 16:29:58 UTC, antes de las 16:31:19 UTC. La auditoría contrastó archivos, hashes, logs, copias de ejecución y metadatos locales; no es sellado temporal externo.

Los FAIL históricos permanecen FAIL: ajustes estructurales del expected original documentados; errores de fixture/runner; ensayo final V1 con 17 PASS/12 FAIL frente a 29/29 V2. AUD2-H6013-04 mantiene el fallo del recolector exterior del intento 16 aunque los tests de fase 15 terminaran con código 0. Los 33 archivos recuperados y el hook capturado durante la ejecución no se presentan como captura retroactiva. La segunda auditoría repitió fase 15 íntegra: 2.751/2.751, proceso 0 y recolección completa. [Reconstrucción histórica](../../tests/fixtures/h6-013-closure/audits/second/results-reconstruction.json).

## 6. Contadores y regresiones, sin sumas impropias

| Comprobación | Ejecutor V2 | Auditoría final | Este cierre |
|---|---:|---:|---|
| Focales PostgreSQL |29/29|29/29|Heredado verificado|
| H1 |9/9|9/9 y oráculo SQL adicional|Heredado verificado|
| Seguridad/negativas |13/13|13/13|Heredado verificado|
| Recorridos largos |5/5|5/5 y oráculo SQL adicional|Heredado verificado|
| Unitarias |210/210|210/210|Heredado verificado|
| Tipos, lint, build |PASS|PASS|No repetidos; solo documentación|
| Cadena 410 y PostgreSQL general 2.950 |Heredados|Reconstruidos de logs|Heredados, no nuevos|
| Fase 15 independiente 2.751 |Auditoría segunda|Procedencia revisada|Heredado, no nuevo|
| Temporal 2, S6 e instalación congelada |Heredados|Fuentes/dependencias verificadas|No repetidos|

29 incluye 28 hijos y padre;9 incluye 8 pasos y padre. 2.950 son resultados del runner, no 2.950 criterios de negocio independientes. Suites, subtests, transiciones, intentos CRUD y unitarias se mantienen separados. R091/R092 y sus pruebas reales continúan preservados. No hay nueva batería funcional en este cierre; sus resultados nuevos son únicamente verificaciones documentales/de integridad.

## 7. Custodias e identidades

V1: 15.537 miembros recuperables en candidate-v1.tar, SHA-256 `3467890fc314517659eace66909d4147bff8d3573f9cc499fa0d611886a931bb`.

Original: 9.658 rutas; auditor original: 53.211. La conciliación y la auditoría final observan 20/98 diferencias de modo en las copias sueltas, sin diferencias de contenido/tipo/tamaño; causa no demostrada. El TAR `0ce0d6f83f1affdd9002b23676bc7daf0fb7c160257d696cac8f287676449f0f` permite recuperar todos los descriptores originales. La auditoría final efectuó esa recuperación en un destino nuevo. [Conciliación independiente](../../tests/fixtures/h6-013-closure/audits/final/custody-independent.json).

El cierre verifica los archivos y recibos referenciados sin modificar las custodias. También lee los 15.537 miembros del TAR V1 y compara tipos, modos, tamaños y hashes; las 14.954 rutas excluidas de Git propuesto se recuperan de él sin discrepancias. La composición V1 + delta V2 reconstruye exactamente las 16.104 rutas aceptadas. [Verificación de recuperación documental](../../tests/fixtures/h6-013-closure/publication-recovery-check.json). No se ha creado ni extraído otro archivo masivo. Se distingue integridad presente, copia suelta mutable y disponibilidad futura; no WORM ni custodia externa garantizada. Las identidades completas y las ubicaciones/destinos lógicos figuran en el inventario propuesto.

## 8. Publicación y límites

[Inventario y plan de publicación](publication-TSK-H6-013.md). No se propone incorporar automáticamente los 16.104 archivos a Git. El conjunto mínimo práctico separa instrumentos, fuentes/expected, evidencia seleccionada, FAIL históricos, custodias externas y copias auxiliares. No se borra ni compacta evidencia.

Una publicación verificable deberá dar acceso a los archivos externos indispensables por sus identidades; una ruta local por sí sola no lo garantiza. Hasta que se aprueben destinos y entrega comprobable, la propuesta no se presenta como un paquete autónomo recuperable desde GitHub. El inventario concreta esos requisitos y conserva la reconstrucción completa V1 + delta V2.

H6 global NO COMPLETADO; otras 17 tareas H6 NOT STARTED, H6-014 sin iniciar; DM-PENDING-005 OPEN; Hosted/Production NO ACREDITADOS. No se acreditan backups operativos, restauración productiva, todas las combinaciones de releases, acceso real o despliegue. El comparador conserva semántica JSONB y requiere Node 24 fijado; no promete identidad léxica original de JSON ni ausencia universal de defectos.

**Cierre documental preparado para revisión independiente. Publicación pendiente de autorización. STOP.**
