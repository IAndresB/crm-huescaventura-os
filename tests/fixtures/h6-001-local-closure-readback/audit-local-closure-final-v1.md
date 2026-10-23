# Dictamen independiente del cierre local autorizado TSK-H6-001

**PASS documental y de custodia.** El paquete nuevo de cierre conserva la identidad del candidato funcional aceptado y formaliza la decisión del director exclusivamente en local/aislado. **TSK-H6-001 COMPLETED local/aislado; H6 global IN PROGRESS; H6-015 COMPLETED local/aislado y en cuarentena.** No se ha detectado discrepancia material que impida este cierre documental.

Este dictamen corresponde al manifiesto `tests/fixtures/h6-001-local-closure/delivery-manifest-v1.json`, SHA-256 `8db429b6cc7e81cb2b6f9391711c2795a478ad3f536245c48294edc1b145a369`: **28 payloads / 8.616.571 bytes**. Su sello conserva SHA-256 `d70e3795ff941e681c8574d6d95bbfec7e0d93f05f92f843367180f53db68063`. El dictamen y su manifiesto selectivo permanecen fuera de esos 28 payloads.

## Resultado contra las expectativas congeladas

| Control | Dictamen | Evidencia y límite |
|---|---|---|
| C01 | PASS | El recibo identifica aceptación expresa del director y la distingue de firma criptográfica y autorización de publicación. La autorización humana se recibió mediante el encargo del agente principal. |
| C02 | PASS | Estados locales coherentes en actas, manifiesto, recibo y variantes. H6 global continúa IN PROGRESS y H6-015 mantiene su cuarentena. |
| C03 | PASS | Los 331 originales conservan bytes y SHA; delta exacto previo al recibo: 331 + 28 payloads + dos envolturas = 361 paths. Los estados anteriores quedan históricos e intactos. |
| C04 | PASS | Tres variantes aisladas con pre/postimagen exactas. El patch coincide byte por byte con la reconstrucción independiente en memoria y no se aplicó. |
| C05 y C05a/C05b | PASS | Las inserciones H6-015 coinciden literalmente con el snapshot formal 8ec91602a3bf813cf01ffbc6b2ac1a2862fe10d0. Al retirar las nuevas cabeceras, las inserciones históricas y revertir la única línea H6-001 autorizada, los tres cuerpos son exactos a sus originales sellados. |
| C06 | PASS | Se preservan 2.899 PASS y 46 FAIL originales de 2.945, las 46 referencias a sucesores PASS y cero hallazgos materiales pendientes dentro de cobertura. No existe una completa limpia nueva. |
| C07 | PASS | 16 manifiestos H6-015 y 4.568 entradas de payload revalidadas directamente, además de los dos refs de snapshots preservados. Los cuatro trabajos suspendidos se acreditan solo documentalmente. |
| C08 | PASS | H5-019 ratificado por sello, aceptación y origen Git local: 180 miembros contra el commit histórico y 177 miembros actuales, excluidos los tres documentos de coordinación evolucionados. |
| C09 y C09a | PASS | Catálogo literal de 4.899 rutas / 4.902 posiciones path+hash, con todos sus orígenes contrastados y reconstrucción determinista exacta. Los lotes permanecen separados y la combinación documental sigue pendiente de autorización expresa de publicación conjunta. |
| C10 | PASS en sucesor | 14 antecedentes exactos: ocho de producto y seis de pruebas/soporte. Universo correcto de 178 archivos: 110 fuentes y 68 migraciones. Ningún cambio nuevo de producto, seguridad o normativa. |
| C11 | PASS | 28 payloads, dos envolturas, copias del preflight y expected exactas; sin autorreferencia. Lectura final exterior separada. |
| C12 | PASS acotado | Principal con mismo HEAD, sin cambios versionados ni índice. Sus 14.954 históricos mantienen rutas/tamaños; no se atribuyen hashes antiguos de contenido no registrados. |
| C13 | PASS | Esta auditoría solo revalida identidades y evidencia documental. No ejecuta pruebas funcionales, DB, runtime ni llamadas de red. |
| C14 | PASS | Expected y candidatos congelados sin modificación. El único FAIL instrumental de esta auditoría se conserva y tiene sucesor trazable, sin reparación silenciosa. |
| C15 | PASS | Se incorpora la aclaración sobre /Users/andres/.codex/AGENTS.md con su hash exacto, conservando la observación anterior en el informe sellado. |

Las expectativas se fijaron antes de recibir este candidato: `expected-closure-v1.json`, SHA `18634fa3aa54c11bdb00006ae7ddddd36d520d480901958cc7d86b285f87c7ab`, y su aclaración documental SHA `f010c65c3ff6ee2ae10cf3199dec09e3de0bdf3d0734eeb1a509102552987f76`. Ambos están conservados en el preflight del propio paquete verificado.

## Trazabilidad del pase y su corrección instrumental

El primer pase independiente, `final-closure-readback-v1.json`, conserva **30 controles agregados PASS y un FAIL**. Su C10 enumeró solo las 174 rutas de producto/migración presentes en el árbol de la base Git y omitió cuatro altas heredadas que ya estaban en el candidato sellado. No hubo discrepancia de bytes. Las cuatro altas son `src/infrastructure/auth/supabase-auth-provider.ts`, `src/server/b07-evidence-port.ts`, `src/server/human-auth-session.ts` y `src/server/human-http-boundary.ts`.

Se verificó independientemente su pertenencia a `inherited-inputs.json` y la igualdad de hashes. El instrumento v2 une las rutas de la base con las altas heredadas y exige igualdad con el conjunto actual: **178 archivos**. Se preservan instrumento y salida v1 sin sobrescribir. `audit-instrument-correction-v1.json` identifica la causa, sus hashes y la corrección; no cambia el expected ni el candidato.

El sucesor `final-closure-readback-v2.json` da **31/31 controles agregados PASS**, cero FAIL pendientes, SHA `ef99415e3a39000c757ec51bfc4e5e169a5b071df3458f2ee104d400018ae73f`. Estos controles agrupan verificaciones de múltiples archivos; no son casos de negocio ni cobertura funcional adicional. Tras completar las observaciones se volvieron a verificar los 28 payloads y los 331 originales, sin variación.

## Custodia, alcance funcional y publicación pendiente

El candidato funcional anterior conserva manifiesto SHA `d97ab86cd4d78c001f5a5e29f3ce501c0c6b44cf592a7b22e78589c26569c435`, 305 payloads / 52.932.020 bytes, 14 antecedentes y paquete independiente de 173 payloads, SHA `dff39c22bde4a56e42af7d811df69a8438f8ed24b02f790e43360d13dc5d29e6`. Sus logs, resultados FAIL y sucesores PASS permanecen originales. Los resultados focales 22/22 del ejecutor y auditor, 212 unitarias, contrapruebas y calidad se citan como evidencia histórica sellada; no se reejecutaron aquí.

El catálogo prepara **4.862 propuestas exactas**, excluye **34 rutas de metadatos locales** y reserva **tres resoluciones documentales combinadas**. Verifica por separado las versiones históricas Auth R1 y las aceptadas localmente R2. Los lotes A/B/C/D1/D2/E, las dependencias exactas y las envolturas posteriores se mantienen identificados. Ninguna propuesta autoriza copiar, integrar, stage, commit, push, Drive o desplegar. La variante combinada es solo una postimagen documental preparada; no fusiona la publicación H6-001/H6-015.

La auditoría operó mediante lectura local, hashes, inspección Git y el generador de inventario previamente revisado, que solo escribe JSON en stdout. No aplicó patches, no ejecutó SQL, no inició o inspeccionó runtime H6-015, no restauró snapshots, no reentró en S11 ni levantó suspensiones. Las únicas escrituras propias fueron instrumentos y recibos nuevos dentro de `/tmp/h6-001-local-closure-audit`. La ausencia de operaciones remotas se refiere a esta auditoría; no pretende observar acciones ajenas o estados remotos que no se consultaron.

El paquete de recibo final se entrega con manifiesto selectivo y sello propios para copia exacta a `tests/fixtures/h6-001-local-closure-readback/`. Esa copia y su README envolvente deben quedar fuera del payload de cierre ya verificado. La siguiente operación de publicación requiere autorización expresa posterior por lotes y rutas, independiente del cierre local formalizado.
