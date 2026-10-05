# Suplemento correctivo independiente — H4-012-F16

Base publicada: `7ca140ac4e3b3793d4aa49e7dbd9743d79191102`. Alcance exclusivo H4-011/012 local/aislado. El expected original permanece byte a byte intacto; este suplemento no reinterpreta final3 como cobertura de estos casos. Observación de dirección inicialmente ESTÁTICA, material pendiente de reproducción. F16 está libre.

## Autoridad y delimitación

Jerarquía vigente conservada. Tasks fichas H4-011/012 y unión de65 filas asignadas §6, protocolos §2.2 y bloqueos §7; Plan §§5.1–5.2,7.1–7.3,8, C01–C06 yT06/T04/T08. SPEC §10.8 FR-CHG-001/002/003/004; State Machines §12.1 MO01/02/04/05/06/09, §7 BS05/06/10, §2.3 RV01–04; Domain Model §5.1 Provider/Offering, §9.3 Modification y §14 INV017/038. BR-SUP001–004 yBR-CHANGE001–004: fuente, contraparte, alcance, antes/después, facultad yefectos independientes; historia/versiones/aprobación exacta yF1/F2/D039 vigentes. Las tablas normativas prevalecen.

Una petición utiliza la facultad del proveedor pertinente al alcance operativo actual; propuesta/aprobación sin aplicación no cambia esa relación. El snapshot aceptado no sustituye el alcance vigente para una nueva actuación. Una respuesta debe identificar el efecto: comprobar/resolver el compromiso anterior (base before), o aceptar/rechazar el compromiso nuevo propuesto (base desired). La prueba de A sobre before no acredita B en desired, ni viceversa. Se conservarán ambas como evidencia separada, sin inferir liberación de Hold, confirmación, aplicación o efectos económicos. Este selector explicita una relación exigida por las fuentes, no concede una facultad nueva.

Offering conserva proveedor y servicio/variante versionados pertinentes. Offering para otra variante o servicio no cubre el objeto evaluado. Servicio sin proveedor fijado puede conservar una relación legítima demostrada mediante Offering; no se fabrica asignación. Un Offering del servicio no demuestra por sí solo aceptación: sigue siendo necesaria respuesta y cobertura inequívoca.

La base material de una actuación dependiente no puede cambiar silenciosamente mientras espera respuesta. Una revisión posterior rechaza la actuación obsoleta o conserva pendiente localizado, sin borrar el hecho/comunicación real ni resultados históricos. Una prueba antigua puede conservarse en B07 como historia, sin hacerse prueba del nuevo compromiso.

## Matriz congelada

En cada caso: fixture sintético por contratos H2/B07/catálogo/modificación reales. No se siembran versiones ni estados de negocio privilegiados. Comparación independiente SQL/contratos con snapshots y resultado normativo; helper de producto no es oráculo.

### C01

- Fuente: MO01/02/05/06;INV017/038.
- Fixture/precondiciones: Booking H2 real con A fijado, Offering de A, originales privados yS2.
- Acción/retirada de guardas: Solicitar/evaluar/aprobar A→B sin aplicar, y después aplicar.
- Expected: Hasta aplicación sigue A; después lector vigente B y snapshot aceptado A. Before/desired/aprobación/historia recuperables; S2 intacto.
- Conservación/prohibiciones: No proveedor vigente B por petición/aprobación; no borrar A ni sustituir aceptación H2.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C02

- Fuente: MO01;BR-CHANGE001;BR-SUP001.
- Fixture/precondiciones: C01 aplicado B, Offering versionado B para servicio real.
- Acción/retirada de guardas: Registrar nueva petición de B en el alcance vigente.
- Expected: Solicitada con before B y facultad contextual legítima, sin aplicación automática.
- Conservación/prohibiciones: No exigir asignación ficticia ni usar A histórico como vigente.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C03

- Fuente: MO03/04;BR-SUP002–004.
- Fixture/precondiciones: C02 evaluada, compromiso de B identificado.
- Acción/retirada de guardas: Registrar respuesta inequívoca de B, Offering/canal/contraparte/alcance exactos.
- Expected: En evaluación; fuente B y cobertura deseada conservadas; no Aplicada/Confirmado por recepción.
- Conservación/prohibiciones: Offering no es respuesta ni confirmación; no efectos en S2.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C04

- Fuente: MO01/04;INV017.
- Fixture/precondiciones: B vigente, A histórico; nuevas actuaciones sobre B.
- Acción/retirada de guardas: Intentar petición de A y respuesta de A como sustituto de B.
- Expected: Rechazo E3/contexto pertinente sin efecto, historia yB vigentes intactos.
- Conservación/prohibiciones: No facultad automática por vínculo histórico A.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C05

- Fuente: Provider/Offering §5.1;BR-SUP001/003;MO04.
- Fixture/precondiciones: B vigente, Offering otros proveedores/variantes/servicio/Booking.
- Acción/retirada de guardas: Retirar cada guarda fuente: proveedor, Offering, servicio, variante, contraparte, canal yrecord.
- Expected: Rechazo/pendiente localizado, sin cambiar resultado anterior; no enumeración de ajenos.
- Conservación/prohibiciones: No cubrir otra variante/servicio porque se conoce UUID o proveedor.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C06

- Fuente: MO06/09;BS05/06/10;INV017.
- Fixture/precondiciones: Variante V1 fijada, Offering V1; nueva V2 autorizada.
- Acción/retirada de guardas: Aplicar V1→V2 y registrar petición/respuesta posteriores con Offering V2.
- Expected: V2 vigente, V1 histórica; relación V2 legítima pasa; Offering exclusivo V1 no sustituye V2.
- Conservación/prohibiciones: No reescribir snapshot/Offering ni inferir nueva cobertura desde V1.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C07

- Fuente: BR-SUP001;MO01;corrección anterior F13.
- Fixture/precondiciones: Snapshot sin proveedor, Offering real pertinente.
- Acción/retirada de guardas: Petición y respuesta de proveedor legítimo con esa relación real.
- Expected: Pasan guardas contextuales sin crear proveedor asignado ficticio.
- Conservación/prohibiciones: No regresar a exigir proveedor fijado por defecto.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C08

- Fuente: MO02/04/05;BR-SUP004;INV038.
- Fixture/precondiciones: Modificación A→B pendiente, before A ydesired B.
- Acción/retirada de guardas: Registrar prueba de A del compromiso anterior yprueba de B del nuevo, retirando cruce de cada base.
- Expected: A válida solo para before; B solo para desired B. Registros diferenciados; usar record anterior como prueba de aprobación nueva rechaza.
- Conservación/prohibiciones: No aceptación de B por A, ni prueba sobre A por fuente B; no liberar Hold por arrastre.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C09

- Fuente: MO02/05/06;G4/G5.
- Fixture/precondiciones: S1 A→B oV1→V2, S2/noche independiente cubiertos.
- Acción/retirada de guardas: Leer/cambiar S1 yvolver a evaluar S2/noche independiente.
- Expected: Relaciones, cobertura, quantities yoriginales independientes conservados.
- Conservación/prohibiciones: No invalidación por revisión global ni aplicación en otro scope.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C10

- Fuente: MO07/08;RV04;G6.
- Fixture/precondiciones: B aplicado, petición nueva pendiente; historia A ypruebas previas.
- Acción/retirada de guardas: Rechazar/retirar yreplay equivalente; usar respuesta antigua para nuevo alcance.
- Expected: B continúa; historia/progress explícitos; cobertura inválida no restaurada; prueba antigua no satisface nueva.
- Conservación/prohibiciones: No revertir proveedor/variante por rechazo, retirada o replay.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C11

- Fuente: G1;F1/F2;D039/TTE;V-DAT.
- Fixture/precondiciones: Contexto emitido, rol runtime noowner/BYPASSRLS.
- Acción/retirada de guardas: Contexto falso/ausente, F1/F2 falsos, revocación, actor inhabilitado yreplay sin autoridad.
- Expected: Denegación antes de lectura/escritura/replay; final check preservado; no permisos nuevos.
- Conservación/prohibiciones: No enumeración ni resultados previos accesibles sin autoridad.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C12

- Fuente: G1;V-DAT;D016/D017.
- Fixture/precondiciones: Helpers privados yscope ajeno.
- Acción/retirada de guardas: CRUD directo, ejecución helper, UUID/Offering/evidence ajenos yproyección por finalidad.
- Expected: Denegado o lectura mínima autorizada; FORCE RLS/owners/ACL/search_path seguros.
- Conservación/prohibiciones: No economía interna, datos personales, originales privados o secretos innecesarios.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C13

- Fuente: G6;E2;T06.
- Fixture/precondiciones: Operación durable de petición/respuesta en B.
- Acción/retirada de guardas: Replay misma clave/material ymisma clave con material distinto.
- Expected: Resultado durable sin duplicar raíz/revisión/Task; E2 por conflicto yreauthorización.
- Conservación/prohibiciones: No identidad inferida por texto parecido ni reducción repetida.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C14

- Fuente: CONC001;T04/T06/T08;V-AT.
- Fixture/precondiciones: Dos sesiones independientes, misma base actual A/V1.
- Acción/retirada de guardas: Cambio aplicado a B/V2 frente a petición/respuesta dependiente; ambos órdenes con overlap observado.
- Expected: Antes del cambio puede registrar hecho contextual válido; tras él no admite fuente vieja para nuevo ni respuesta sobre before obsoleto. Revision/resultado claros.
- Conservación/prohibiciones: No lost update ni revisión v1 sobre v2, ni propagación a S2/noche independiente.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C15

- Fuente: V-AT;G4/G6;T06.
- Fixture/precondiciones: Petición/respuesta yefecto vigente por contratos.
- Acción/retirada de guardas: Fallar escritura de raíz/revisión/resultado yCOMMIT, reintentar, perder respuesta después de COMMIT real.
- Expected: Rollback exacto de efecto/historia/resultado/Task, retry válido; replay durable después de COMMIT sin duplicar.
- Conservación/prohibiciones: No parciales ni éxito externo inventado.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C16

- Fuente: V-MIG;Plan §5.1;V-EVI.
- Fixture/precondiciones: 43 migraciones publicadas, base poblada A→B yV1→V2, originales privados, catálogos.
- Acción/retirada de guardas: Fresh, upgrade, fallo DDL/rollback/retry; comparar datos ycatálogo.
- Expected: 43 anteriores yhealth-check intactos; owners/ACL/firmas/config/policies/triggers/roles conservados. Cuerpos modificados identificados expresamente.
- Conservación/prohibiciones: No editar migración publicada ni afirmar preservación de bytes de funciones cambiadas.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

### C17

- Fuente: V-EVI;PT03/PT05;NFR008.
- Fixture/precondiciones: Producto/verificador congelados en SHA exacto.
- Acción/retirada de guardas: Matriz correctiva, focales anteriores,70 casos H4-012, regresión completa ytodos gates.
- Expected: Conteos reales sin doble cómputo;1558 anteriores/118 unit/health1 preservados; logs completos/status/signal/error; expected original inalterado.
- Conservación/prohibiciones: No reinterpretar final3 ni debilitar verificadores.
- Evidencia necesaria: before/desired/vigente, SQL ycontratos reales, resultados por intento, log completo ySHA exacto; positivo ycada negativa por separado.

## Límites

H4 IN PROGRESS; H4-013+ yH5–H6 NOT STARTED. H4-014/023,H5-016,H6-003/004 NO ACREDITADAS. DM-PENDING-005 abierto. Sin hosted/Cloud/Production, datos reales, audio, conectores o efectos externos. No Refund/fianza/cierres ni integraciones futuras. STOP tras publicar el cierre correctivo.
