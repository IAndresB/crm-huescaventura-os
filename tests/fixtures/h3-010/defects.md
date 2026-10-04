# Defectos H3-010

Expected60848d0 intacto. Producto inicial93a1432, verificador iniciala94bcca. FAIL originales separados de ejecuciones corregidas; local/aislado sintético.

|ID|Fuente|FAIL/reproducción|Causa y corrección|Estado|
|---|---|---|---|---|
|H3-010-F01|V-DAT/V-EVI/G4; SM-SU-04|first-matrix-original R32; F01-original-reproducer; F01-first-correction-fail; defects test F01|Fixture de evaluación histórica enviada como string JSON al codec JSONB, conservaba escalar en vez de objeto. Parámetro explícito text::jsonb; prueba reproduce codec y verifica objeto histórico/revisión actual. Producto no cambia por el harness.|CORREGIDO, pendiente regresión completa|
|H3-010-F02|G6/E2/V-AT; independencia SM-SU-02|first-matrix-original R41; defects test F02|Comando de componente construido antes de otra mutación tenía revisión obsoleta. Reatestiguar sobre revisión actual; conservar rechazo obsoleto, no debilitar producto.|CORREGIDO, pendiente regresión completa|
|H3-010-F03|V-MIG upgrade poblado anterior|first-matrix-original R67; defects test F03|Fixture consultaba API Suplido antes de instalar migración. Preparar datos H3-008 anteriores sin consultar API futura; revisión explícita0. Reproducer prueba ausencia previa y fixture compatible.|CORREGIDO, pendiente regresión completa|
|H3-010-F04|G2/G4/G5, SM-SU-02/04; fondos utilizables, C06|F04-original-fail; defects test F04|Lectura histórica no señalaba cambio en pagos/porciones fuente. Proyección actual revalidada bajo raíces compartidas, fuente pendiente explícita y estado Revisión; snapshots/componentes/evaluación histórica intactos. Reevaluación añade nuevo fundamento, no altera dinero.|CORREGIDO, pendiente regresión completa|
|H3-010-F05|V-MIG/V-EVI; preservación de verificadores históricos|F05-first-full-postgres-original:1002 tests/1001PASS/1FAIL; defects test F05|Reproducer histórico H3-008-F06 contaba todas las migraciones como34. Acotar inventario a invoiceMigration: conserva34 de H3-008 y33 de H3-006; nueva cadena35 no altera expected ni migraciones históricas.|CORREGIDO, pendiente regresión completa|
