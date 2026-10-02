# Evidencia TSK-H2-011 — cantidades iniciales/lista nominal

**Estado vigente: COMPLETED local/aislado.** Commit exacto probado `226b53559dc0786dd14dead0039eed394144fade`. 36/36 casos +2/2 reproducciones PASS;279/279 revalidación H2;617/617 PostgreSQL17.11 y81/81 unitarias, gates completos PASS. F01/F02 del verificador CLOSED; cero materiales abiertos.

Estado inicial antes de regresión: matriz36/36 +2/2 reproducciones PASS; regresión final pendiente. No cierre todavía.

Base H2 aprobada `b94bdb10e7182a7affe2738f2a7277bc25ea23a3`; base efectiva `d9d76363f5589f83093aff9b802280408b2e890b`. Fetch/main limpio=origin y ancestro PASS antes de modificar. Se inspeccionaron los commits independientes c65e87e/d9d7636: únicamente health-check en supabase/operations, su prueba y documentación. No cambian semántica H2 ni acreditan hosted H2.

Expected original congelado antes de ejecución en706c1e4: [expected](expected-TSK-H2-011-012.md),24filas Tasks§6,36Rxx+20Sxx. [Erratum](expected-TSK-H2-011-012-erratum.md) explícito independiente corrige aritmética de contribuciones (A4+B2=6), no acomoda un defecto de producto. El expected original permanece intacto. No hay cambios de producto ni migraciones nuevas.

Verificador independiente `tests/integration/postgres-h2-011.test.ts`, helpers únicamentesetup sintético decontratos. PostgreSQL17.11 realefímero crm_h2011:55487; reproducers55488, V-MIG55490. Node24.21.0,pnpm11.19.0,Postgres.js3.4.9. Runtime `crm_h0_runtime` noowner/BYPASSRLS; provision/migration/observer separados. Authdobleúnicamenteaislado,no Authreal. Sin datosreales/hosted/Production.

## Historia completa de fallos

- Desarrollo typecheck: castreadonlymutable rechazado; corregidoverificador, logs typecheck-development.log ycorrected.log conservados.
- Primeraformal36:32PASS/4FAIL. F01: R01/R02/R04 esperaban7contribuciones erróneamente; AC017/BRPACK002/DM10.2 derivan4+2=6. Cantidades10/12/12/10 yaPASS. F02:R13 consulta columnainexistente l.snapshot (42703); usar service_date de la línea real. Materialidad: erroresdelverificador bloquean cierre. Producto no requirió corrección. Original completo verifier-first-original.ts.txt+first-formal.log conservados.
- Segundaformal:36RxxPASS,2historicalFAILporherencia NODE_TEST_CONTEXT de Node24: childnode skips recursive runner. Logs second-formal.log yreproducer-F01/F02.log conservados. Corregido soloenvdelharnesshijo,noassertsoriginales.
- Terceraformal:36/36Rxx+2/2reproducers PASS,0FAIL/skipped/cancelled; third-formal.log. Reproducers eliminan NODE_TEST_CONTEXT y usanpuertoaislado; mantienenassertsoriginales yrequieren6!=7/42703. Capturas reproducers-corrected.log no reemplazan anteriores.
- F01/F02 FIXED/PENDING FINAL REGRESSION; no producto Fxxobservado. CLOSEDsolo después de fresh matriz+regresión encommitexacto.

V-DOM R36; V-DAT R01–30/R35; V-SM SM-BS01 R01–04/R16–21 conguardasretiradas yG1–G6/R23/R24/R31–34; V-NEG SM-FORB10R17 yFORB31R22; V-AT R31–34; V-MIG R35+freshR44–47/R66H2010; V-EVI evidencia/logs/expectedprevio.24filas asignadassemapearánindividualmente al resultadofinal.

No atribución H4: cambiosmateriales posteriores/confirmación/capacidad/disponibilidad quedanreservados; baselineinicialappend-only y noautoriza modificarnoches. Cantidadnominal explica agregado; same Contact único, nombresparecidos nofusión. Catálogo/posterior Primary Contact no reescribe cadena. No economía/operación/externos/identidadesficticias.

## Nueva ejecución sobre commit exacto candidato

Commit `226b53559dc0786dd14dead0039eed394144fade`, producto sin cambios frente a la base efectiva. FreshH2completo279/279 PASS:266casos de matrices (20+39+43+62+66+36) y13 reproducciones/complementos ejecutables.36/36 Rxx011 y2/2reproducers actualesPASS,0FAIL/skipped/cancelled. `tests/fixtures/h2-012/formal-candidate.log`. Regresión final aún pendiente; no cierreH2hastaPASS.

## Matriz individual H2-011 expected/observed

| ID | Fuente y operación/expected congelados | Observed por ensayo independiente | Resultado |
|---|---|---|---|
| R01 | AC-017;BR-PACK-002;Convertir A10 rafting/2noches+B2 sinrafting/1noche,cena común;Una Booking:rafting10,cena12,noche1=12,noche2=10;6contribuciones (A4+B2,erratumF01) exactas | AC017 exact 10/12/12/10, one Booking; rafting10,cena12,noches12/10,6contribuciones | PASS |
| R02 | SPEC-FR-CAT-002;BR-SVC-006;Inspeccionar cobro vsasistentes;Unidad grupo/casa completa quantity1 distinta de10/12personas | payment unit not attendance | PASS |
| R03 | DM-INV-014;BR-PAX-001;Inspeccionar certeza;estimated conservado sin confirmación por Acceptance/Ganada | estimated never confirmed by Ganada | PASS |
| R04 | DM-INV-013/016;SPEC-FR-SVC-001/003;Reconstruir origen de contribuciones/noches;IDs,line,modality,unit,version,Acceptance,verification,fechas exactos | provenance exact full chain per contribution | PASS |
| R05 | AC-019;DM-INV-015;Convertir4nominales en12;12total,4nominales,8anónimos;no16 ni8Participant ficticios | four names explain twelve, not sixteen or eight invented;4Participant,4assignments,noche12,8restantes no ficticios | PASS |
| R06 | DM-INV-015;SPEC-FR-SVC-004;Dos Participant mismo Contact verificado;Rechazo atómico sin reescribir total | same verified Contact two Participant IDs rejected | PASS |
| R07 | SPEC-FR-ID-004;BR-PAX-004;Asignación sin necesidad;Rechazo atómico | missing nominal necessity | PASS |
| R08 | SPEC-FR-ID-004;Contact noverificado;Rechazo atómico | unverified Contact rejects association | PASS |
| R09 | DM-INV-015;BR-ID-001;Dos desconocidos con mismo nombre;No fusión inferida;IDs distintos,total12 intacto | same name unknown people not fused | PASS |
| R10 | DM-INV-015;Asignación duplicada misma Persona/noche;Rechazo atómico | duplicate assignment rejects | PASS |
| R11 | SPEC-FR-SVC-004;Lista13 en12;Rechazo/revisión sin ajustar total | thirteen nominal on twelve rejects without total change | PASS |
| R12 | AC-019;BR-NIGHT-004;Casa completa sin habitaciones/distribución;Permitir sin inventar camas/huéspedes | whole house needs no invented rooms | PASS |
| R13 | DM-INV-016;BR-NIGHT-001/002;Reconstruir12/10;Noche2 no copia12;contribuciones/certeza propias | separate night origins and certainty | PASS |
| R14 | BR-NIGHT-003;SPEC-FR-CAT-002;Inspeccionar preciofijo;No personas×noches ni disponibilidad/capacidad inferidas | fixed house quantity remains fixed, no inferred capacity | PASS |
| R15 | DM-INV-013;SPEC-FR-SVC-001;Mismo catálogo/revisión,horario/proveedor/lugar/variante distintos;Dos prestaciones/IDs propios,metadata exacta,no fusión | same revision distinct prestation factors preserved | PASS |
| R16 | SM-BS-01 G2;Service Revision ajena;Rechazo atómico | wrong Service Revision | PASS |
| R17 | SM-FORB-10;SM-BS-01;Global12/gratuidad sobrescribe rafting10;Rechazo sin cambiar asistentes/deuda | global/free counts cannot overwrite service | PASS |
| R18 | SM-BS-01;SPEC-FR-CAT-002;Cambiar cantidad/unidad;Rechazo atómico | quantity or unit mutation denied | PASS |
| R19 | SM-BS-01;PLAN-T03;Omitir contribución aceptada;Rechazo atómico | missing accepted contribution | PASS |
| R20 | SM-BS-01;DM-INV-016;Noche de fecha ajena;Rechazo atómico | wrong night date rejects | PASS |
| R21 | SM-BS-01;Proveedor externo en serviciointerno;Rechazo atómico | internal service cannot carry external provider | PASS |
| R22 | SM-FORB-31;D018;Alcance noseleccionado/split/merge;Rechazo,una Booking exacta | forbidden split/merge/nonselected part | PASS |
| R23 | G1;C01/C03;SPEC-NFR-003;Sincontexto/falsificado/actorinhabilitado/ordinarySQL;Failclosed,ACL/FORCERLS,runtime noowner/BYPASSRLS | context actor ACL FORCE RLS fail closed | PASS |
| R24 | G4;C03;UPDATE/DELETE directSQL;Rechazo,historia append-only visibleindependiente | direct mutation of historical facts denied | PASS |
| R25 | C01;BR-PACK-003;SPEC-FR-PROP-003;Consulta comercial;Preciofinal/persona,participantes,incluidos;sin internaleconomy/nominalinnecesario | commercial projection minimal and no nominal list | PASS |
| R26 | G4;DM-INV-013;Cambiar revisióncatálogo después;Snapshot/IDs/aplicado histórico exactos | changing actual master retains historic chain | PASS |
| R27 | G4;SPEC-FR-ID-004;Cambiar Primary Contact;Acceptance/cadena conservados;sin Participant inferido | Primary Contact cannot rewrite accepter or participants | PASS |
| R28 | G5;P08;Intentar Payment/fondos/anticipo/saldo/conciliación/Refund/factura/Provider Payment;Campos rechazados,sin efectos económicos | explicit prohibited economic operational external fields | PASS |
| R29 | G5;PLAN-B03;Intentar proveedor/disponibilidad/capacidad/ejecución/Booking Confirmada;Rechazar;Booking Pendiente,services Pendiente | explicit prohibited economic operational external fields | PASS |
| R30 | G5;C05;Intentar email/Whats App/telefonía/Avaibook/conectores;Rechazo,sin hechos externos/ficticios | explicit prohibited economic operational external fields | PASS |
| R31 | PLAN-T03;G6;Dos altas simultáneas misma/distinta key,ambosórdenes;Una íntegra,mismo resultado,sinparciales | concurrent same/different keys both orders | PASS |
| R32 | PLAN-T03;G6;Pérdidarespuesta postCOMMIT,replay,keydistinta;MismoID/código/detalle;contenido distinto conflicto | postCOMMIT lost response/replay/distinct key | PASS |
| R33 | PLAN-T03;G4/G6;Carrera rectificación/revisión ambosórdenes;Máximo una íntegra,obsoleto rechaza,originalpreservado | rectification race both orders rejects obsolete versions | PASS |
| R34 | PLAN-T03;V-AT;Fault temprano/intermedio/noches/nominal/historia/COMMIT;Rollback completo;preparaciones previas conservadas | early intermediate nights nominal history late COMMIT rollback | PASS |
| R35 | V-MIG;G4;Fresh/predecesor/fixtures/fallo/rolesopcionales;Datos, IDs, permisos y objetos preservados,históricasbyteidénticas | preservation predecessor and published chain byte identical | PASS |
| R36 | C02;D010;SM-BS-01;Decisión dominio,retirar guardas unaauna;Solo cadenaexacta/autorizada/vigente/completa;bloqueosconIDs,sinI/O | pure domain permission and each material guard blocked | PASS |

## Correspondencia individual de24filas Tasks§6

| Fila | Ensayo y límite |
|---|---|
| SPEC-FR-ID-004 | R05–R11/R27 |
| SPEC-FR-CAT-002 | R02/R14/R18 |
| SPEC-FR-PROP-003 | R01/R04/R25 |
| SPEC-FR-BOOK-003 | R01/R22/R31–R34 |
| SPEC-FR-SVC-001 | R04/R15–R16/R21 |
| SPEC-FR-SVC-002 | R01/R03/R17–R18 |
| SPEC-FR-SVC-003 | R12–R14/R20 |
| SPEC-FR-SVC-004 | R05–R11 |
| AC-017 | R01/R04 |
| AC-019 | R05/R12–R14 |
| SPEC-NFR-003 | R23–R25/R05–R11 |
| DM-INV-013 | R04/R15–R16/R29 |
| DM-INV-014 | R02–R03/R17 |
| DM-INV-015 | R05–R11 |
| DM-INV-016 | R12–R14/R20 |
| SM-BS-01 | R01–R04/R16–R21/R23–R24/R31–R34 |
| SM-FORB-10 | R17/R18; promociónpositivaH1conservada,noH3 |
| SM-FORB-31 | R22+H2010R13–R16/R50/R64 |
| P09 | R01/R04–R05/R13/R17 |
| PLAN-B03 | R01/R04/R28–R30 |
| PLAN-T03 | R31–R35+H2010fresh |
| PLAN-T04 | solo inicialinmutable R13/R20/R24; cambiooperativoH4NOACREDITADO |
| PT-03 | AC017/019 cantidadesiniciales;capacidad/confirmación/ejecuciónH4NOACREDITADAS |
| D010 | R01/R02/R14/R25–R26/R36 |

V-MIG/preservación freshR35: fixturesH1/H2previos Communication/Task/identidades/códigos/Acceptance/Version y58tables/71functions/118policies/478triggers previos idénticos;36nuevos RI-FK comprobados.30migraciones publicadas byteidénticas. FreshH2010R44–47/R66 prueba cadena desdevacío/predecesor/fallo/rolesopcionales. Complemento H2004 distinct-services/priorH1application freshPASS en modalities-preservation-candidate.log. Sin migraciónnueva ni modificaciones productivas.

## Cierre final y ejecución recuperable — 2026-10-03

Fresh matriz independiente y regresión ejecutadas sobre `226b53559dc0786dd14dead0039eed394144fade`: todas PASS. F01/F02 de verificación **CLOSED local/aislado** sólo tras estas repeticiones; no defecto productivo nuevo. No modificación de producto, no nueva migración; las 30 migraciones previas y src quedan idénticos a la base efectiva.

| Gate | Observed final |
|---|---|
| H2-011 | R01–R36 36/36 PASS +2/2 reproducers |
| Revalidación formal H2 completa | 266 casos +13 reproducciones/complementos =279/279 PASS |
| Runner PostgreSQL completo | 617/617 PASS,0FAIL/skipped/cancelled,395320.802791ms |
| Unitarias completas | 81/81 PASS,0FAIL/skipped/cancelled |
| Instalación congelada/typecheck/lint/fronteras/build/audit prod | PASS; audit sin vulnerabilidades conocidas |
| V-MIG/preservación | R35+H2-010R44–47/R66 y complementoH2-004 PASS; sin nueva migración |
| Salida H2-012 | S01–S20 20/20 PASS |

Comandos exactos y exit codes en `tests/fixtures/h2-012/gates.json`; logs por comando `*-candidate.log`, matriz de salida `milestone-exit-matrix.json`, versiones reales `versions.json`. PostgreSQL bin `/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin`; formal: `POSTGRES_H0_BIN=... node --test --experimental-strip-types tests/integration/postgres-h2-002*.test.ts tests/integration/postgres-h2-004*.test.ts tests/integration/postgres-h2-006*.test.ts tests/integration/postgres-h2-008*.test.ts tests/integration/postgres-h2-010*.test.ts tests/integration/postgres-h2-011*.test.ts`; regresión: misma variable + `pnpm run test:postgres`; complemento: misma variable + `node --experimental-strip-types tests/support/h2-004-modalities.mjs`; cierre: `node tests/support/h2-milestone-exit.mjs`.

Los bytes originales de logs se conservan comprimidos con SHA-256 en manifiestos raw-log-manifest. La presentación textual sólo elimina whitespace al final de líneas/EOF para diff-check; no se alteran FAIL, mensajes, causas ni assertions. Verificador y expected originales quedan íntegros. El erratum de6 contribuciones deriva A4+B2, no cambia el expected normativo10/12/12/10 ni acomoda un defecto del producto.

H2 COMPLETED sólo local/aislado por H2-012. H3–H6 NOT STARTED; no iniciados ni preparados. Pendientes PLAN-AUTH/PLAN-PENDING/ARCH-PENDING/DM-PENDING/BR-PENDING vigentes conservados; hostedH2/Production/datos reales/economía/operación/proveedores/conectores/envíos reales no acreditados ni autorizados. STOP tras012.

## Comprobación final de coordinación

`tests/fixtures/h2-012/coordination-check.json`: PASS.125 fichas; únicamente estados/evidencia de H2-011/012 cambiados.76 tareas H3–H6 NOT STARTED, sin preparación. Tasks§§6–7 y fuentes APPROVED intactos;30 migraciones funcionales, producto, evidencias/expected anteriores001–010 y health-check independiente sin cambios. Expected original011/012 conserva su SHA-256 inicial. Producto y fuentes de ensayos idénticos al commit probado226b535. Hashes de logs crudos conservados: PASS. `git diff --check` y diff agregado contra d9d7636: PASS. El cierre documental se publica separado; SHA final exacto se informa tras push y comprobación HEAD=origin/main limpio.
