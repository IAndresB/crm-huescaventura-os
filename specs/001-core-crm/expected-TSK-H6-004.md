# Expected previo a ejecución — TSK-H6-004

Fuente: Tasks ficha TSK-H6-004 y correspondencia E2E-04 de §6; SPEC §9, AC-029–043 y AC-060–063; Architecture §§3.1/12/13/16; Plan §§9–10.1 y T04/T06/T07/T10. Única asignación directa en la matriz Tasks: E2E-04. Se aplican guardas y obligaciones transversales pertinentes. Dependencia: H5-019, no H6-001 ni los candidatos no publicados. Base Git 971c55d5ce5770c71284d106d3c0deecca9514b5.

Expected fijado antes de implementar o ejecutar los casos nuevos. No se deriva del resultado observado ni se cambia para hacer pasar un caso. Los AC con ramas distintas del recorrido se contrastarán mediante regresiones identificadas, sin atribuirlas a una misma Booking.

| ID | Estímulo | Resultado exigido |
|---|---|---|
| A01/B01 | Booking sintética con tres servicios, otra parte ya prestada y otra vigente | Cancelar solo S1 mantiene S2/S3, cantidades, noches, términos y prestación histórica; no cancela toda Booking. |
| A02/B02 | Solicitud, evaluación, petición al proveedor, respuesta ambigua y respuesta exacta | Ninguna recepción aplica el cambio; se conserva cada hecho, origen y decisión; la respuesta ambigua mantiene pendiente. |
| A03/B03 | Aplicar sin aprobación o con aprobación incompleta/obsoleta | Rechazo sin efecto de negocio; permiso, revisión y alcance se comprueban antes de aplicar. |
| A04/B04 | Aprobación exacta y aplicación parcial | La aprobación por sí sola no aplica; aplicación afecta solo la parte autorizada; reintento no duplica historial/operación. |
| A05 | Base atribuible verificada 200, cancelación por proveedor | Derecho 200, retención 0; determinación D019/D020 conserva política, alcance, fecha civil y evidencia. No depende del saldo ni crea un movimiento. |
| B05 | Componente fijo/grupal sin base atribuible, con operación cancelada | Derecho e importes dependientes pendientes, no cero ni prorrateo; rechazo de obligación/Refund dependientes. |
| B06 | Determinación posterior explícita del Administrador sobre base 200 | Derecho 200; conserva la revisión pendiente anterior y fundamento; solo entonces se permite el ajuste económico concreto. |
| A06/B07 | Ajuste de obligación y Refund debida | Ajuste requiere determinación y autorización exactas; no equivale a salida; no modifica obligaciones de partes ajenas. |
| A07/B08 | Autorizar 200 mediante TTE y acreditar salida 80 | Devuelto 80, pendiente 120; cobro bruto intacto; aprobación interna y evidencia externa son hechos distintos. |
| A08/B09 | Repetir movimiento, cambiar material bajo misma identidad, exceso o cruce de Booking | Reutilización o rechazo según contrato, nunca segundo efecto; guardas no filtran evidencia de otra raíz. |
| A09/B10 | Acreditar los 120 restantes y reevaluar cierre afectado | Devuelto 200, pendiente 0; criterio Refund puede resolverse explícitamente, sin cerrar automáticamente otras dimensiones o pendientes. |
| A10/B11 | Lecturas de persistencia e historia después de cada frontera | Originales, decisiones, actores, pruebas, antes/después y porciones reconstruibles; demás servicios y su ejecución intactos. |
| N01 | Día local completo a 7/3/2 días y cambio de hora/fecha | 200/100/0 de devolución voluntaria sobre base200, por fecha civil y alcance, nunca 168/72h; historia preservada. |
| N02 | Acceso runtime directo, actor/sesión ilegítimos, origen IA sin aprobación | Rechazo sin efecto; aprobación posterior no convierte una salida irregular en previamente autorizada. |
| N03 | Fallo transaccional y respuesta perdida tras COMMIT | Rollback íntegro en el primer caso; resultado durable recuperado sin duplicación en el segundo. |
| N04 | Cierre frente a cambio material | Estado/versión anterior no autoriza cierre; invalida solo dependencias afectadas y conserva cierre histórico. |

PostgreSQL real aislado con cadena68; negocio por adaptadores/contratos ordinarios y evidencia B07. SQL privilegiado solo para bootstrap, lectura independiente y fallo técnico deliberado identificado. Autenticación sintética del contrato, sin acreditar proveedor Auth externo nuevo. Sistemas externos dobles o hechos manuales sintéticos, sin banco, comunicaciones, factura real, Hosted o Production. Regresiones ejecutadas se registran por archivo/ID; una reconciliación jamás se presenta como completa limpia.

Cierre local condicionado autorizado por el director únicamente con criterios satisfechos, pruebas pertinentes PASS, sin defectos materiales abiertos y auditoría independiente satisfactoria. H6 global IN PROGRESS. H6-001/H6-015 sellados intactos, H6-015 en cuarentena y cuatro trabajos suspendidos sin reentrada. Sin publicación Git, Drive, main, deploy ni nuevas decisiones normativas.
