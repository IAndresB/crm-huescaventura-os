# Preparación documental TSK-H6-016 tras H6-007

**H6-016 NOT STARTED; propuesta preparada, no ejecutada. H6 global IN PROGRESS.**

Las seis dependencias formales son H5-019, H6-013, H6-001, H6-004, H6-006 y H6-007. Las cinco primeras tienen aceptación en la base publicada `9c15e6d143822f7fcc84f29744194554630f4ac4`; H6-007 queda ahora COMPLETED exclusivamente local/aislado mediante acta y core `9864633972785547891c97658471f77a6c1ce47c8e9c604ad48589892b445fc6`, todavía sin integración ni publicación. La diferencia documental con el corte anterior de la propuesta se resuelve en `H6016-dependency-binding-v1.json`, conservando el original. La evidencia H6-007 no se supone incluida en Git: un futuro mandato debe identificar expresamente base y candidato local exactos o esperar su integración autorizada.

La matriz completa de25 asignaciones y11 unidades, tres órdenes y cinco ejes de fallo se conserva en `tests/fixtures/h6-007-local-acceptance/H6016-documentary-proposal-original-v1.json` y en el paquete de custodia documental. Son expected propuestos, no resultados. Se consultaron Tasks, SPEC, Architecture, Plan y State Machines directamente. La ficha remite a Tasks§6.5, que contiene SM-FORB; las unidades se identifican por Tasks§6.7 y Plan§7.2, aplicando también sus prohibiciones. No se modifica la fuente.

| Unidad | Composición futura que debe acreditarse |
|---|---|
| T01 | Fijación de versión y composición inmutable frente a competidor con base obsoleta. |
| T02 | Acceptance frente a sustitución/repetición, sin verificación ni conversión implícitas. |
| T03 | Conversión de la misma Opportunity, sin hijos previos y sin Booking duplicada/parcial. |
| T04 | Cambio de alcance por servicio/noche y reevaluación afectada, sin arrastre ajeno. |
| T05 | Conciliación/asignación/ajuste y fondos compartidos; no doble consumo. |
| T06 | Determinación D019/D020 y aplicación ante cambio de base/Approval, economía pendiente fundada. |
| T07 | Salida acreditada y porciones de Provider Payment/Refund/fianza, sin operación real ni doble registro. |
| T08 | Approval/reserva/intención/consumo y TTE frente a revocación y espera. |
| T09 | Recepción/reclamación de trabajo con identidades nuevas sintéticas; claim no acredita ejecución. |
| T10 | Cierre frente a factura/Refund/Incident y evidencia posterior, historia y dimensiones independientes. |
| T11 | Fusión/archivo/corrección humana con dos historiales, referencias y códigos preservados. |

Para cada unidad: A→B, B→A y solapamiento observado, incluidos hijos inicialmente ausentes. Identificar fronteras reales mediante inspección antes de inyectar fallos: antes de escritura, entre escrituras y antes de COMMIT, fallo durante COMMIT, confirmación con respuesta perdida y conflicto material. Ante acuse incierto, leer identidad/resultado/historia antes de cualquier replay; no retry ciego. D039 exige comprobación final del TTE después de esperas y trabajos e inicio de COMMIT sin SQL/control del solicitante entre ambos; no se promete deadline físico de durabilidad.

Recursos futuros: worktree nuevo desde base expresamente fijada, PostgreSQL real aislado con puerto/directorio/socket/roles propios, sesiones distintas y barreras observables, identidades y raíces sintéticas exclusivas, dobles de canales, clocks y fallos controlados; expected previo, logs originales y manifiestos. Verificar pool sin contexto/falsificado/inhabilitado, permisos actuales incluso en replay, atomicidad de hecho/resultado/historia y conservación de intentos. La existencia de pruebas históricas no acredita cobertura integrada nueva.

Riesgos: asumir el candidato local dentro de la base publicada, compartir raíz o sesión de ensayo, bloquear solo hijos existentes, confundir aborto con respuesta perdida, mantener contexto del actor anterior y extender indebidamente los ensayos T09/T10 de H6-007. La preparación contempla inspección y regresión por impacto, unitarias/typecheck/lint/build, contrapruebas propias, auditoría y custodia. Cualquier necesidad material fuera de contratos deberá delimitarse sin cambiar normativa.

**Siguiente tarea técnicamente preparada: H6-016, previa autorización expresa de ejecución.** Ese mandato puede permitir el ciclo técnico autónomo sobre recursos nuevos y la composición exacta, sin necesidad de repetir aprobaciones ordinarias. Esta preparación no inicia pruebas, procesos, worktree ni SQL de H6-016; no publica H6-007. H6-015 y S11 no son recursos de ensayo y permanecen excluidos, con sus cuatro trabajos suspendidos y cuarentena intactos. Hosted/Production, datos/efectos reales, cambios normativos/seguridad, Drive y publicación requieren sus autorizaciones separadas.
