# TSK-H6-001 — Dictamen técnico independiente local

**PASS técnico local del candidato funcional congelado, con regresión reconciliada y límites explícitos. Recomendación favorable de aceptación exclusivamente local/aislada por el director.** Este dictamen no declara H6-001 COMPLETED, no cierra H6 global, no publica ni levanta la cuarentena de H6-015. H6-001 continúa IN PROGRESS, pendiente de decisión del director; H6 global continúa IN PROGRESS.

La ejecución original amplia conserva **FAIL: 2.899 PASS / 2.945 pruebas reportadas, 46 FAIL**. Los 46 fallos tienen sucesores PASS trazables. No existe una segunda ejecución completa limpia y no se presenta como tal. No hay hallazgo funcional material pendiente dentro de la cobertura identificada.

Auditor: `/root/h6_001_auditor`, contexto e instrumentos propios. Mismo equipo y acceso a los mismos archivos; independencia técnica respecto del ejecutor, no auditoría organizativa externa. Fecha de consolidación: 2026-10-23 Europe/Madrid; marcas temporales de ejecución en UTC.

## Candidato, norma y dependencia

Base local `971c55d5ce5770c71284d106d3c0deecca9514b5`. Réplica de auditoría `/tmp/h6-001-audit/replica`, sin commits ni staging. Origen de candidato `/Users/andres/.codex/worktrees/h6-001-local/crm-huescaventura-os`.

Expected independiente congelado antes de implementar: `ecaf8a7ffc942493c5d7fc7606f0c15a6af8d85aba766e1117d0cb901d544eb2`, conservado byte a byte. Derivado de lectura directa de Tasks, SPEC, Architecture y Plan. Sus IA01–IA30 son controles instrumentales; no añaden normas.

Las tres asignaciones directas son **AC-089, SPEC-NFR-001 y E2E-01**. La ficha exige comprobar Contexto → Lead/Opportunity → modalidades/versiones/Acceptance → Booking/cantidades → fondos y críticos → ejecución/documentos → tres cierres, mediante contratos y PostgreSQL aislado. UI y conectores externos no son requisitos de esta ficha. La matriz de 34 AC principales de SPEC §9 se acredita únicamente en las ramas ejecutadas citadas: AC-001–019, AC-023–028, AC-044–046 y AC-058–063; no se declara cumplimiento global de esos AC ni de todas sus tareas H6.

**H5-019 satisface su dependencia local.** Se verificaron aceptación D01–D03, cierre, recibo y sello de candidato `31fd4ac89aea684f2155a4365cb5870a0c0163838cbfd543d2ad98d0db1ea619`, y ancestro Git local publicado `8a5f1408777b81b760a02646fa414a34dc17983e`. Se distinguen sus 25 AC satisfactorios locales y la AC-073 entonces reservada a H6-015. Los PASS de H5-019 no se arrastraron al nuevo candidato: las baterías consignadas aquí se ejecutaron ahora.

La prueba actual tiene SHA-256 `8baba979531801a1dda47559a52026871b829e0ae36b6d8966a1c659019561bb`; runner del ejecutor `c7ff5edf5f0dd10c5cf0a53cb6d7a26024b1117fd722c3330c7c4a6c0847682a`. Copias en `focal-independent-01/source/`; ambas seguían idénticas al candidato en `final-integrity.json`.

## Alcance material observado

La venta continua sintética usa dos modalidades A=10 y B=2, rafting10, cena12 y noches12/10. Las operaciones de negocio pasan por contratos ordinarios; no se siembran por SQL Ganada, Acceptance verificada, Booking, confirmación, asignación/pago, ejecución ni cierre. El bootstrap de actor/roles/identidades técnicas y las contrapruebas controladas de revocación se distinguen de dichos efectos.

La evidencia registra 139 comandos ordinarios. Hay recepción, conciliación y asignación separadas, cuatro confirmaciones de responsable interno, requisito documental que bloquea hasta recepción y revisión del objeto privado original, ejecución normal `start → perform → finish`, fuentes explícitas de economía propia y tres evaluaciones de cierre. El acto conjunto es explícito. Desde la Booking cerrada se reconstruyen fuentes, objetos y decisiones, no solo un resumen de Timeline.

Se revisaron y corrigieron en el instrumento, por el ejecutor, dos carencias señaladas por esta auditoría: cantidades exactas por servicio en P03 y reconstrucción material de fuentes en P14. Sus versiones iniciales se conservan. P14 actual verifica Booking→Acceptance→Opportunity→Lead/contacto, porción→conciliación→vencimiento→recibo/fuente, cuatro confirmaciones→originales, documento/revisión, objeto/digest, tres hechos de realidad y criterios/evidencias de los tres cierres. Los originales de permiso documental y ejecución son distintos. Calendar/Timeline no mutan los hechos originales.

Los tres servicios son internos, posibilidad normativa admitida por SPEC-FR-SVC-009/SM-BS-04. No hay obligación literal de fabricar proveedor externo, mandato o factura para un servicio interno. Las ramas T07/proveedor/factura se comprobaron por regresión de componentes y controles independientes sobre cadena68; no se afirma que sean parte de esa misma Booking ni que constituyan E2E-05. Los escenarios especializados E2E-02–07 conservan sus tareas y puertas propias.

## Ejecuciones y resultados

| Ejecución independiente | Resultado real | Evidencia |
|---|---|---|
| Focal exacto del candidato | **PASS 22/22**: 21 subcasos y contenedor, cero fallos/cancelados/skips; 2026-10-22T22:02:23–22:04:02Z. | `focal-independent-01/run.json`, fuentes, stdout/stderr comprimidos, `observed.json`. |
| Selección completa histórica de 196 archivos, 15 fases | **FAIL bruto: 2.899 PASS / 2.945, 46 FAIL**, cero cancelados/skips; inputs funcionales originales sin deriva. | `regression-01/selection.json`, `report.json`, 15 pares de logs, índice de casos. |
| F-replay aislado, fuente intacta | **PASS 12/12**, cero fallos/cancelados/skips. | `freplay-isolated-01/`. |
| 34 sucesores instrumentales seleccionados, secuenciales | **33 PASS / 34; 1 FAIL W53 anidado**, cero cancelados/skips. El filtro solo contó los 34 seleccionados. | `compatibility-02/`: fuentes, cambios literales, selección, runner, resultados. |
| Sucesor W53 anidado v3 | **PASS 1/1**, cero fallos/cancelados/skips. | `compatibility-03/`: mantiene las contrapruebas ajenas y añade rechazo de alteración de bytes heredados. |
| Controles nuevos independientes A01–A06 sobre cadena68 | **PASS 7/7**: seis controles y contenedor, cero fallos/cancelados/skips. | `independent-02/`. El intento `independent-01/` conserva 4 PASS / 7 y 3 FAIL incluyendo contenedor. |
| Regresión adicional actual H5-019 I01–I03, cadena68 | **PASS 3/3**, cero fallos/cancelados/skips. | `integrated-68/`. |
| Identidad/integridad final propia | **PASS 822 controles** de bytes/identidad, sin índice ni cambio de HEAD. | `final-integrity.json`. |

Son recuentos de pruebas/controles del instrumento, con contenedores donde se indica; no equivalen a escenarios únicos de negocio. La cobertura de la selección amplia conserva sus **2.945 posiciones una sola vez**: 2.899 PASS originales y 46 posiciones con sucesor PASS. No sumar las 12 + 34 + 1 repeticiones como nueva cobertura. Los seis controles nuevos y tres casos adicionales se informan por separado. La repetición focal tampoco suma una segunda venta normativa.

PostgreSQL 17.11 real; Node 24.21.0; Supabase Auth 2.197.0 real con contraseña/TOTP sintéticos; Storage real local fijado al commit `5def1dfc15ab7f08fe271c7d1e70542424524e4e`. El focal usa toda la cadena68. Las regresiones históricas conservan sus fronteras de migración fijadas; no se afirma que todos sus casos ejecuten cadena68. Los controles independientes y H5-019 I01–I03 sí usan cadena68.

A01 registra pago real sintético parcial80 de500, saldo420, ningún cierre completo ni factura inferidos, replay sin segundo movimiento y conflicto material denegado. A02 verifica reautorización del replay tras deshabilitar actor. A03 provoca fallo real diferido a COMMIT; un testigo no transaccional prueba que se alcanzó el disparador, mientras pago, historia y resultado permanecen sin cambios; retry aplica una sola vez. A04 registra salida500, conserva factura pendiente, recibe original en Storage, revisa/vincula/evalúa hasta resolver solo su parte documental; no infiere cierre de Booking ni mandato. A05 rechaza contexto ausente/falsificado y acceso SQL directo. A06 ejecuta advisors oficiales2.119.0 contra loopback con JSON explícito, sin hallazgos.

La primera versión independiente tenía dos fallos de instrumento conservados: esperaba el error SQL interno en lugar del error público sanitizado y omitía el estado programado que el contrato exige antes de resolver documentalmente una salida ordinaria. Se corrigieron solo esas precondiciones/aserciones, manteniendo los originales.

## Reconciliación explícita de los 46 FAIL

`reconciliation.json` y `reconciliation.md` contienen **AF001–AF046** con archivo/SHA/línea del original, log/línea FAIL, causa, sucesor y log/línea PASS. No se reescriben los originales.

- **29: formato CLI.** Con el entorno allowlist, advisors2.119.0 termina correctamente sin hallazgos pero stdout es vacío en formato humano; los comparadores JSON antiguos fallan. Los sucesores añaden exclusivamente `--output-format json`; mismos flags de destino loopback y mismas aserciones de resultados. No se sustituye la salida del CLI.
- **4: byteguards previos a antecedentes aceptados.** Los originales comparan contra bytes anteriores a C07/Auth R2. La nueva variante exige que el hash histórico coincida con la base vigente y el actual con uno de los 14 antecedentes declarados; todo path ajeno conserva su verificación original. Las 68 migraciones siguen idénticas. W53 tenía además un subverificador antiguo: el primer sucesor conserva FAIL y v3 aplica la misma comprobación exacta a ese subverificador. Las contrapruebas contra cambios ajenos siguen presentes; cuatro nuevas contrapruebas rechazan cualquier modificación adicional o hash histórico adulterado en los archivos modificados heredados.
- **12: arranque con puerto fijo60202 ocupado.** El `before` no arrancó PostgreSQL; el log prueba `Address already in use`. Repetición aislada de la fuente exacta:12/12. No se atribuye cobertura al arranque fallido.
- **1: fixture temporal H4-006 F12.** El hecho fijado al20-10 dejó de ser futuro cuando el instante de acción usaba la fecha actual22-10. El sucesor fija el instante del caso y deriva el hecho a +1día; mantiene la misma expectativa de rechazo, sin debilitarla.

El original complete196 permanece FAIL. La explicación y los sucesores permiten dictamen favorable sobre los controles materiales aplicables, sin ocultar el coste y las limitaciones de mantener instrumentos históricos dependientes de entorno.

## Criterios, seguridad y trazabilidad

`ac-matrix.json` conserva el literal de cada uno de los 34 AC, su fuente normativa, observación, límites y **105 referencias ejecutadas** con SHA del test y líneas de fuente/log. `ac-matrix.md` es su lectura humana. `atomicity-replay-concurrency.json` enlaza controles exactos T01/T02/T03/T04/T05/T07/T10, incluyendo fallo antes/después de escrituras y a COMMIT, pérdida de respuesta, reautorización y carreras con sesiones PostgreSQL reales en ambos órdenes pertinentes.

`ia-matrix.json` responde a los 30 controles previos sin cambiar el expected. IA01–IA27 tienen PASS dentro de su alcance citado. IA28 es PASS documental de custodia; IA29 PASS del ámbito local/sintético y límites de conectividad observados; IA30 PASS del inventario preparado, sin publicación. Ninguna etiqueta sustituye la aceptación humana.

El candidato no introduce cambios nuevos de producto o SQL. Reutiliza 14 archivos de antecedente exactos, ocho de producto y seis de tests/soporte. `compatibility-delta-r2.json` enumera cuatro modificaciones y cuatro archivos nuevos respecto de la base, todos heredados y comprobados contra su origen. El primer inventario que no contaba altas nuevas se conserva y está explícitamente supersedido. El pase final comprueba 613 inputs funcionales originales inalterados, los 14 antecedentes contra candidato y origen, los 178 archivos de producto/migración, las dos fuentes focales y el expected.

Auth, Storage y PostgreSQL de las pruebas son locales y efímeros; los efectos usan roles ordinarios y guardas actuales, separados de migración/observador. No se cargan credenciales reales ni `.env` operativos. El registro focal no contiene claves de credencial, JWT ni correos distintos de `client@example.invalid`. Se excluyen del paquete runtime, bases, dumps, caches y `node_modules`. No se ejecutó comunicación de negocio, S11, despliegue, commit/push/GitHub ni Drive. No se realizó captura de paquetes de red: las herramientas pueden emitir avisos de versión; la configuración observada de DB/Auth/Storage es explícitamente loopback.

## Custodia e inventario pendiente

Se verificaron los hashes de los 17 miembros del sello de custodia v2 indicado en `custody-reference.json`. Su auditor revalidó16 manifiestos y4.568 entradas de payload de H6-015, sin discrepancias;252 controles propios de contexto;14 antecedentes y68 migraciones; snapshots archivados y cuerpos documentales. Los cuatro trabajos suspendidos se acreditan por **recibo sellado conservado**, sin nueva consulta SQL ni ejecución de H6-015. El principal sigue en la base, sin índice ni cambios versionados. Sus14.954 históricos fueron comparados por rutas/tamaños entre observaciones; los payloads sellados de H6-015 sí fueron rehasheados.

El cierre formal archivado permanece recuperable en `8ec91602a3bf813cf01ffbc6b2ac1a2862fe10d0`, con manifiesto original intacto; no se restauró. Se conserva también la auditoría de adopción `fc68a90cd555a83388d5b166ff86adeda70110b8`. Son snapshots locales de la app, no una publicación creada por esta auditoría.

El inventario preparado distingue A=H6-006/H6-008, B=H6-015 técnico, C=cierre formal, D=H6-001 propio y E=históricos/FAIL. Identifica antecedentes, manifiestos, variantes R1/R2 y conflictos textuales Tasks/PROJECT-STATUS/NEXT-STEPS. H6-001 no se mezcla con publicación de H6-015; un delta bruto incluiría antecedentes pendientes y no sería una lista publicable autorizada. Los metadatos de preservación local, runtime y archivos privados quedan excluidos de cualquier propuesta remota. No se consultó el estado remoto actual.

La identidad funcional y los artefactos de esta auditoría quedan congelados por su manifiesto selectivo. La envoltura final del ejecutor se arma después de incorporar este dictamen y requiere su lectura final de custodia; ese paso no se anticipa como ejecutado aquí.

## Recomendación y cobertura no acreditada

Se recomienda al director **aceptar localmente la comprobación H6-001** sobre la identidad congelada descrita: AC-089 por fuentes/guardas/criterios y honestidad de resultados; SPEC-NFR-001 por reconstrucción durable de la Booking; E2E-01 por recorrido continuo ordinario interno y cobertura complementaria ejecutada. La decisión de marcar COMPLETED corresponde exclusivamente al director.

No se acredita una misma Booking mixta con proveedor externo integrado, E2E-02–07 completos, todas las transiciones/prohibiciones H6, UI, conectores reales, validez fiscal, correo entregado, datos/credenciales reales, Hosted/Production, RPO/RTO, recuperación operativa nueva ni disponibilidad futura de recursos. No se garantiza ausencia universal de defectos: el dictamen se limita a fuentes, guardas y ejecuciones documentadas. H6 global permanece IN PROGRESS y H6-015 en cuarentena con sus cuatro trabajos suspendidos.
