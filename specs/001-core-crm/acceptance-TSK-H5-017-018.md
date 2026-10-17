# H5-017/H5-018 — Evidencia consolidada y aceptación técnica local

**ACEPTACIÓN EXPRESA D01. TSK-H5-017 y TSK-H5-018 COMPLETED, exclusivamente local/aislado.** El director ha autorizado el cierre documental y la publicación controlada D02–D04. La publicación efectiva requiere el recibo del commit/push y la lectura posterior en GitHub; no se presume por este texto. No se acredita producción.

## Identidad aceptada

Base publicada `9649a2773530ea8a43237b4e1f2034f80e34136f`. El candidato G consta de producto F íntegro más instrumentación G:38.388 archivos. La sexta auditoría añade129 propios:38.517 recibidos íntegros en la preparación. La transición documental definitiva y sus preimágenes son un sucesor separado; sus nuevos bytes no se atribuyen a la ejecución funcional del candidato ensayado.

| Identidad | SHA-256 |
|---|---|
| Inventario G, contenido descomprimido | `fba4398a24834213c2fe08d2033663c08f5b26488ddfc49c5fd205a265d4f53b` |
| Sello G | `6774c3335650a5adfbf32228a220cc9051b4def0715167866ff94a7893af4df6` |
| Inventario sexta auditoría | `a13850e3316a2b39106d5a5bb7a0814c9516bb19b84cf18bf367f7f08c90bfdf` |
| Sello sexta auditoría | `65d44e660965e3e59bc9d9c71c7727743213e08d9930584ffda1b25e048d74fc` |

## Evidencia de aceptación técnica

[Sexta auditoría independiente](evidence-TSK-H5-018-sixth.md):PASS técnico local/aislado, cero defectos materiales abiertos en alcance. PostgreSQL2.945/2.945 PASS,196 archivos y15 fases disjuntas, cero fallos/cancelados/omitidos. Los303 fallos de quinta tienen correspondencia única y PASS actual. Ocho casos especiales reproducidos con fixture original y G; dos esperas PostgreSQL reales, plazo15 segundos intacto. Reproductores protegidos71/71 PASS en repetición adicional. Unitarias208/208 y health1/1 separados.

V-DOM/V-DAT/V-MIG acreditados en sexta:instalación limpia68,67poblada→68, rollback provocado, recuperación y reaplicación;175 tablas,305 funciones,487 relaciones,332 políticas y565 dependencias; solo tres cuerpos previstos cambian en68. Filas/ACL/propietarios/roles/RLS/FORCE preservados.20 intentos directos propios denegados. Instalación congelada, tipos, lint, build y auditoría de dependencias de producción PASS;0 vulnerabilidades conocidas en esa captura. La preparación documental verifica esos recibos y hashes; no reejecuta ni se atribuye estas pruebas.

## Cierre autorizado por ficha

H5-017: el director acepta el producto F más la adaptación G de pruebas como implementación técnica local del diagnóstico, con causa/incertidumbre, permisos y correlación protegidos. COMPLETED exclusivamente local/aislado, conforme a D01 y al cierre documental expresamente autorizado.

H5-018: el director acepta la sexta auditoría como comprobación técnica local del candidato G. COMPLETED exclusivamente local/aislado. Se preservan los cinco dictámenes FAIL, sus reproductores, expected y sellos. El PASS de sexta no reescribe sus resultados ni acredita aceptación de candidatos anteriores.

PROJECT-STATUS, NEXT-STEPS y Tasks incorporan el cierre definitivo autorizado. Sus bytes recibidos se conservan en las tres preimágenes del registro de transición. Se construye un manifiesto sucesor exacto y se verifica su árbol por dos procedimientos antes del único commit y push normal autorizados. No se reutiliza como identidad definitiva el árbol de preparación.

## Relación histórica de defectos

| Hallazgo histórico | Disposición técnica observada sobre G | Evidencia conservada |
|---|---|---|
| F01 — mezcla de tipos de contexto | No se reproduce; aislamiento y tipo/UUID pasan | [Primera auditoría](evidence-TSK-H5-018.md), [correctivo C](evidence-TSK-H5-017-C.md) |
| F02 — operación canónica ajena | No se reproduce; propiedad canónica y referencias pasan | Primera auditoría y C; variantes posteriores intactas |
| F03 — incertidumbre degradada a E5 | No se reproduce; E4/pending conservado | Primera auditoría y transición exacta de composition en C |
| H5-018-2-F01 — pérdida temporal de petición | Reproductores y variantes PASS | [Segunda auditoría](evidence-TSK-H5-018-second.md), [D](evidence-TSK-H5-017-D.md) |
| H5-018-3-F01 — operación/ejecución incompatibles | No se reproduce | [Tercera auditoría](evidence-TSK-H5-018-third.md), [E](evidence-TSK-H5-017-E.md) |
| H5-018-3-F02 — contexto padre | No se reproduce | Tercera auditoría y E; consultas históricas explícitas |
| H5-018-4-F01 — procedencia A→B→A | No se reproduce | [Cuarta auditoría](evidence-TSK-H5-018-fourth.md), [F](evidence-TSK-H5-017-F.md) |
| H5-018-4-F02 — replay histórico | No se reproduce; repetición reautoriza sin duplicar | Cuarta auditoría y F |
| H5-018-5-F01 — fixture temporal | Resuelto por instrumentación G, producto F intacto | [Quinta auditoría](evidence-TSK-H5-018-fifth.md), [G](evidence-TSK-H5-017-G.md), sexta |

Cada dictamen histórico permanece FAIL. El registro vigente de alcance es [defectos de sexta](defects-TSK-H5-018-sixth.md), con cero materiales abiertos y sus dos incidencias propias resueltas conservadas. Este cierre no cambia retroactivamente estados históricos OPEN/CLOSED.

## Limitaciones y alcance no acreditado

Solo datos sintéticos y PostgreSQL/Auth/Storage locales aislados. La independencia de sexta es metodológica dentro del mismo chat; no una firma de otro profesional. Los logs no acreditan pagos, aceptación comercial ni entrega externa. G conserva el acto fijo; las evidencias auxiliares para otros actos requieren cronología explícita coherente.27 exclusiones heredadas están explicadas; no se proclaman PASS de instrumentos históricos normativamente excesivos. Pruebas solapadas, nuevas y repeticiones no se suman a2.945.

DM-PENDING-005 OPEN. No se fijan conservación/anonimización/eliminación ni parámetros operativos definitivos. H5 global IN PROGRESS. Hosted/Production, H6-015 y H6-017 no acreditados. H5-019/H6 NOT STARTED. El despliegue sigue excluido. Commit y push son actos autorizados cuya ejecución y resultado constan en el recibo independiente posterior; sin comprobación remota no se declara publicado.

## Autorización y condiciones de publicación

D01 acepta técnicamente G; D02 autoriza las 341 rutas exactas y la exposición identificada de usuario local, rutas, herramientas, cachés y fechas; D03 autoriza el archivo histórico de 90.706.957 bytes en Git normal, sin LFS ni transformación; D04 autoriza exactamente un commit y un push normal del conjunto final verificado. Esta resolución sustituye expresamente la negativa anterior a D02. No autoriza secretos, datos reales adicionales, nuevos cambios funcionales, normas, despliegues ni futuras tareas. La autorización y las 341 identidades constan en [publication-authorization.json](../../tests/fixtures/h5-017-018-acceptance/publication-authorization.json).

El control de formato, el manifiesto exacto, ambas verificaciones del árbol, las identidades de todas las fuentes y la preservación histórica son puertas obligatorias. La revisión pública conserva inventario `598a13a8e8c39cfb73e876aa259d3fbf3fd67b9667ce8ee03a76e25727a0ec73` y sello `ff4751ecee17023a38e8c20e48e1e7f9028aa1e38553a6105e127835c7daee03`; sus originales externos no se sobrescriben ni se incorporan automáticamente al commit. No se normalizan evidencias ni se amplían excepciones de formato. Tras verificación remota: STOP.
