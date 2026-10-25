# Dictamen técnico independiente — TSK-H6-017

**PASS exclusivamente local/aislado. 35/35 asignaciones acreditadas en este ámbito.** No quedan defectos materiales de producto demostrados abiertos. La independencia es metodológica entre agentes del mismo modelo, con oráculo, instrumentos, worktree y recursos propios; no constituye auditoría humana externa.

El dictamen vincula el candidato técnico congelado SHA-256 `93d8bece86fd8ba8a6e6fa6bb0d3d33f850c6ae47dc583c55018515437c44d7b`:145 payloads/22.790.337 bytes. Todos se releyeron mediante verificador propio; la matriz conserva las 35 asignaciones literales y sus fuentes exactas. La [matriz independiente](assignment-independent-final.json) enlaza cada obligación con contrapruebas propias y revisión de los casos funcionales. Este dictamen y sus anexos son posteriores al candidato y no modifican sus bytes.

## Oráculo e independencia

Se reconstruyeron directamente Tasks §6, ficha H6-017 y fuentes referenciadas: SPEC, Architecture, Plan, Constitution, Domain Model, State Machines y decisiones aprobadas. El expected propio de 35 filas quedó congelado antes de los resultados con SHA-256 `c49f5ee0db66ec98394ee1f3a1d8846fa66da66e7a436dca0fe5b7e15d57725b`. Los suplementos Auth, identidad/economía y aprobación se fijaron antes de sus respectivas ejecuciones; ninguna aclaración borra el original.

Las cuatro dependencias H5-019, H6-008 R2, H5-012 y H5-018 se reconstruyeron desde sus cierres vigentes, matrices, sellos y recibos, preservando sus estados históricos. El revisor comprobó fuentes, entradas y salidas del candidato y los instrumentos de preservación. La base publicada es `0cd5f06d2efec9741906d4927318734451b01d4a`, árbol `8b184d1d470a3bf190dee14499369fe9c665ab3d`.

El worktree auditor independiente es `h6-017-independent-audit/crm-huescaventura-os`. Su PostgreSQL17.11 se creó en bases/puertos propios59791/59796/59797/59798, sin compartir escritura con el implementador. Auth oficial v2.197.0 se descargó a una ruta nueva propia y se verificó contra archivo `3fb7998e7061e2c14f3f9555b1d94d447358c965395728e0d81eac82e0e5868b` y binario `54a5afe7997bd16ab5244ab12c02905048b270a8f76eebf95739a6d364ffe01f`. Auth empleó su propia base y puertos59792–59795, contraseña/TOTP reales sintéticos y sumidero local que impide entrega. Storage oficial se ejecutó nuevo en loopback mediante el runner explícito de archivos del auditor. Los recursos efímeros se cerraron después del ensayo; no se custodian credenciales, factores ni binarios.

## Contrapruebas propias observadas

Se ejecutaron diez grupos AUD01–AUD10 en un pase final10/10 PASS,0FAIL/SKIP/canceladas. Un suplemento separado AUD11 obtuvo1/1 PASS. Son once grupos originales; no se suman como casos distintos las repeticiones históricas.

| Grupo | Observación independiente |
|---|---|
| AUD01 |21 combinaciones de finalidad/superficie,147 búsquedas de campos reservados y63 intentos de cruce de cursor; salida comercial exacta y estado canónico intacto. |
| AUD02 |Administrador positivo; prueba falsificada, identidad ajena, job pasivo, segundo actor V1 y cambios de atributos protegidos denegados. El rechazo del segundo actor respeta el singleton V1. |
| AUD03 |165 tablas privadas ×3 roles ×4 acciones:1.980 denegaciones reales SQLSTATE42501. SELECT/INSERT/UPDATE/DELETE emplearon tablas/columnas existentes. |
| AUD04 |Storage real entrega binario únicamente a finalidad/contexto autorizados; tres cruces de contexto/finalidad, identidad ajena y sesión revocada denegados. Nueva sesión conserva SHA del original. |
| AUD05 |Original/derivado/tentativo separados; confirmado18 intacto; ocho capacidades de audio/consentimiento/retención/borrado denegadas. Fallo diferido controlado revierte y reintento equivalente produce un único resultado. |
| AUD06 |Documento externo llega a Vinculada conservando emisor; once intentos fiscales/atributos de dispensa rechazados incluso tras aprobación interna; Booking/economía intactos. |
| AUD07 |Diagnóstico conserva causas/referencias, elimina propiedades hostiles de secreto/URL/cuerpo/economía y persiste minimizado; búsqueda indirecta en otro Booking devuelve cero nodos. |
| AUD08 |Entrada recibida y deduplicada no aplica Booking/pago/cierre; origen/finalidad ajenos denegados. Atributos top-level ajenos se descartan de forma explícita, sin crear una política nueva de esquema. |
| AUD09 |Contact verificado asociado positivamente; necesidad nominal ausente e identidad no verificada rechazadas sin Booking parcial; cuatro personas nominales conservan ocupaciones12/10 por noche. |
| AUD10 |EUR e IVA included/excluded/unknown explícitos; Tararí15/175/325 comerciales,3,80 coste incluido y costes de extras desconocidos. Versión/historia conservadas; tres negativas de tipo/decimales/extrapolación; sin factura propia/Provider/Suplido inferidos. |
| AUD11 |Aprobación humana exacta no crea intentos, Acceptance, Provider Confirmation, pago o factura. IA y job no deciden; tres cambios materiales no reutilizan decisión; replay exacto y sesión revocada se reautorizan correctamente. |

Auth real acredita contraseña/TOTP y rechaza contraseña incorrecta; AAL1 no acredita MFA. El bootstrap sintético de fixtures se usa únicamente para preparar hechos autorizados; las invocaciones nuevas AUD01–AUD08 emplean evidencia proveniente del Auth local real. No se afirma haber repetido en estas once pruebas cada método de admisión cubierto en R2 ni todas las ramas del producto.

## Revisión del candidato e intentos de refutación

Se leyeron los originales de24/24 focales PASS y regresión dirigida74PASS,0FAIL,1SKIP de75, con SHA de logs comprobados independientemente. Las18 familias cubren Booking, proyección, objetos, diagnósticos, autorización, documentos, economía, aprobación y composición con pago conciliado y cierre conjunto. El casoF18 utiliza el fixture de H6-007 que ejecuta cierre por el adaptador real, comprueba pago conciliado y niega atajos fiscales sin alterar ambos hechos.

El SKIP es el placeholder histórico H6-008 S10 de Auth/ingress real. Permanece SKIP. Las contrapruebas propias de Auth real y el antecedente R2 cubren las obligaciones locales pertinentes; no se necesita convertir ese placeholder histórico en PASS y no se acredita acceso real/Hosted/Production por ello.

Se contrastaron los recibos y logs de212 unitarias, tipos de la fuente final24, lint y build PASS. El producto y sus68 migraciones son idénticos a la base, por lo que el build anterior al último suplemento de prueba no se atribuye a un producto distinto. El auditor ejecutó además typecheck de sus fuentes finales con exit0.

El verificador independiente rechazó tres candidatos adversos en memoria: hash alterado, omisión y ruta que escapa de raíz. Ningún control modificó el candidato. La revisión de rutas públicas confirma únicamente health y contratos de frontera con autorización: no se ha creado una web pública o API fiscal. Los escáneres propios no encontraron JWT, Bearer materializado o contraseñas en URI en los logs/recibos del auditor ni en los payloads textuales del candidato.

## Hallazgos y correcciones conservados

No hubo corrección de producto ni modificación de normativa, permisos o migraciones. Los17 FAIL Node del auditor se conservan:5 del primer instrumento,8 de setup Auth ausente,3 por oráculos excesivos y1 por nombre incorrecto de una tabla del suplemento de aprobación. Se corrigieron los instrumentos después de comprobar los contratos y esquema reales. Otro FAIL del verificador comparaba bloques normativos multilínea contra una sola línea; su original se conserva y el sucesor compara el tramo literal completo.

Las aclaraciones no reducen una obligación: V1 prohíbe un segundo actor operativo; un root desconocido puede denegarse; descartar atributos ajenos de una recepción sin efecto cumple el contrato existente. Ningún supuesto del auditor se convirtió en una política nueva. Los9 FAIL funcionales del implementador y sus sucesores permanecen en el candidato. Otro primer verificador del archivo de custodia supuso el sufijo de sello `.json.sha256`; el archivo real usa `.sha256`. Se conserva ese resultado instrumental y el sucesor comprueba el nombre existente sin cambiar el sello. No se reetiqueta un FAIL histórico como PASS retrospectivo.

## Integridad y límites de aceptación

El auditor reconstruyó directamente los45.783 blobs Git de la base y SHA-256 de1.040.864.923 bytes del candidato: cero diferencias. Esto conserva producto,68 migraciones, fuentes normativas, evidencias y candidatos históricos. El inventario independiente tiene SHA-256 `97761d85d8f010fc4f2450090da3851a0174a4b43c4f9ecc12551534f359b029`.

La refutación propia de custodia verificó16 manifiestos H6-015 y4.568 payloads contra los hashes originales anclados en la aceptación H6-007. Los localizadores del custodio se usaron solo para localizar bytes, nunca como oráculo de PASS; se releyeron archivos documentales y snapshots Git. Cero problemas, sin acceder a runtime, SQL, S11, reentrada o los cuatro trabajos suspendidos.

El archivo técnico local de custodia también se verificó independientemente por streaming de sus147 miembros,145 payloads más manifiesto/sello, sin extracción:10.855.423 bytes, SHA-256 `105834592356543bfdfac2cedc0a5d6d442a6598ba065a713615163735db7dcf`, cero diferencias.

La auditoría permite formalizar **TSK-H6-017 COMPLETED exclusivamente local/aislado**, conforme al mandato del director, con este candidato y custodia técnica comprobados. El cierre documental y su inventario sucesor deben verificar que no alteran el candidato. H6 global permanece **IN PROGRESS**; H6-015 conserva cuarentena. DM-PENDING-002/005, seguridad y fiscalidad aprobadas permanecen vigentes. No se autoriza ni acredita publicación GitHub/Drive, commit/push/merge, despliegue, datos/credenciales reales, operaciones externas o inicio de H6-002/003/005.
