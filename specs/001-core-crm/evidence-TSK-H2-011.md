# Evidencia TSK-H2-011 — cantidades iniciales/lista nominal

Estado actual: matriz36/36 +2/2 reproducciones PASS; regresión final pendiente. No cierre todavía.

Base H2 aprobada `b94bdb10e7182a7affe2738f2a7277bc25ea23a3`; base efectiva `d9d76363f5589f83093aff9b802280408b2e890b`. Fetch/main limpio=origin y ancestro PASS antes de modificar. Commits independientesc65e87e/d9d7636 inspected: únicamenteSupabaseoperations health-check/test/documentación, sin semánticaH2, no acreditanhostedH2.

Expected original congelado antes de ejecución en706c1e4: [expected](expected-TSK-H2-011-012.md),24filasTasks§6,36Rxx+20Sxx. [Erratum](expected-TSK-H2-011-012-erratum.md) explícito independiente corrige aritmética de contribuciones (A4+B2=6), no acomoda un defecto de producto. Expected originalintacto. No migrations/productchanges.

Verificador independiente `tests/integration/postgres-h2-011.test.ts`, helpers únicamentesetup sintético decontratos. PostgreSQL17.11 realefímero crm_h2011:55487; reproducers55488, V-MIG55490. Node24.21.0,pnpm11.19.0,Postgres.js3.4.9. Runtime `crm_h0_runtime` noowner/BYPASSRLS; provision/migration/observer separados. Authdobleúnicamenteaislado,noAuthreal. Sin datosreales/hosted/Production.

## Historia completa de fallos

- Desarrollo typecheck: castreadonlymutable rechazado; corregidoverificador, logs typecheck-development.log ycorrected.log conservados.
- Primeraformal36:32PASS/4FAIL. F01: R01/R02/R04 esperaban7contribuciones erróneamente; AC017/BRPACK002/DM10.2 derivan4+2=6. Cantidades10/12/12/10 yaPASS. F02:R13 consulta columnainexistente l.snapshot (42703); usar service_date de la línea real. Materialidad: erroresdelverificador bloquean cierre. Producto no requiriócorrección. Original completo verifier-first-original.ts.txt+first-formal.log conservados.
- Segundaformal:36RxxPASS,2historicalFAILporherencia NODE_TEST_CONTEXT de Node24: childnode skips recursive runner. Logs second-formal.log yreproducer-F01/F02.log conservados. Corregido soloenvdelharnesshijo,noassertsoriginales.
- Terceraformal:36/36Rxx+2/2reproducers PASS,0FAIL/skipped/cancelled; third-formal.log. Reproducers eliminan NODE_TEST_CONTEXT y usanpuertoaislado; mantienenassertsoriginales yrequieren6!=7/42703. Capturas reproducers-corrected.log no reemplazan anteriores.
- F01/F02 FIXED/PENDING FINALREGRESSION; no productoFxxobservado. CLOSEDsolo después de fresh matriz+regresión encommitexacto.

V-DOM R36; V-DAT R01–30/R35; V-SM SM-BS01 R01–04/R16–21 conguardasretiradas yG1–G6/R23/R24/R31–34; V-NEG SM-FORB10R17 yFORB31R22; V-AT R31–34; V-MIG R35+freshR44–47/R66H2010; V-EVI evidencia/logs/expectedprevio.24filas asignadassemapearánindividualmente al resultadofinal.

No atribución H4: cambiosmateriales posteriores/confirmación/capacidad/disponibilidad quedanreservados; baselineinicialappend-only y noautoriza modificarnoches. Cantidadnominal explica agregado; sameContact único, nombresparecidos nofusión. Catálogo/posteriorPrimaryContact no reescribe cadena. No economía/operación/externos/identidadesficticias.
