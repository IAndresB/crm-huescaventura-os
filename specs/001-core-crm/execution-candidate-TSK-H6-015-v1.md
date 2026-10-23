# TSK-H6-015 — Candidato documental concreto de ensayo sintético v1

22 de octubre de 2026. **NOT STARTED / NO EJECUTADA.** Diseño para autorización futura; ningún recurso operativo, backup, clave ni servicio H6-015 ha sido preparado. Se añade al expediente original y a la adenda Auth sin modificar sus bytes, r3 ni contratos.

## 1. Definición, dependencias y fuentes

Tasks define «Restaurar en aislamiento y conciliar antes de reanudar»: restauración coherente del inventario y efectos posteriores al punto recuperado, sin reactivar sesiones ni repetir efectos externos. La ficha literal y sus 15 asignaciones están en `tests/fixtures/h6-local-validation/normative-source-lock.json`. Siguen siendo SPEC-FR-HIST-004, SPEC-FR-IDEMP-002, SPEC-FR-ERR-002, AC-073, AC-074, SPEC-NFR-005, SPEC-NFR-014, SM-FORB-27, ARCH-DEC-010, ARCH-DEC-017, P13, PLAN-DEC-008, PLAN-B10, PT-12 y D017; no se crean requisitos normativos nuevos.

Las cuatro dependencias directas están satisfechas **en alcance local**: H5-019 aceptada, H6-014 r3 aceptada como preparación, H6-006 cerrada y aceptada nuevamente por el director, H6-008 cerrada mediante el acta de este paquete. [Recibo de dependencias](../../tests/fixtures/h6-local-closure/dependencies-H6-015.json). El cierre de dependencias no autoriza ejecutar H6-015. H6-009/010/011 no son dependencias directas adicionales.

Base del ensayo propuesto: commit `971c55d5ce5770c71284d106d3c0deecca9514b5` más candidato R2 exacto `23419baa5d5ddb985ce4ac42d1d408d510ffad89959b1154fb0e6f147e30f14f` y esta documentación sucesora. Antes de una ejecución futura se congelarán también el harness nuevo, fixtures y expected concretos. No existe hoy un ejecutable de restauración H6-015 aceptado.

## 2. Compatibilidad con H6-014 r3

**Compatible como procedimiento marco, con adaptación técnica documentada pendiente de verificación antes de ejecutar. No es un runner listo para ejecutar sin cambios.** El manifiesto r3 y sus 20 payloads permanecen exactos. Core no ha cambiado de esquema: siguen las 68 migraciones, los contratos F1/F2 y el mecanismo de revocación. Se conservan cuarentena, corte coordinado, owners/ACL, variantes separadas Core/Storage, testigo t1 y prohibición de reenvío ciego.

| Punto r3 | Aplicación al candidato futuro |
|---|---|
| S02, PostgreSQL solo socket privado | El fixture H6-008 usó TCP loopback. No reutilizarlo literalmente como infraestructura de restauración: adaptar su transporte a sockets privados y demostrarlo en el preflight autorizado. Auth/HTTP/Storage mantienen listeners únicamente loopback. Si un componente no admite ese transporte, parar esa composición y revisar la alternativa; no abrir Core TCP por conveniencia. |
| S04/S05 Core | Mantener archivo custom completo, particiones TOC íntegras/disjuntas y receta pgcrypto 1.3 en crm_crypto. Igualdad origen/archivo/destino y propiedades/ACL; no reejecutar migraciones sobre la base restaurada. |
| S05 Storage | Mantener su variante propia de archivo completo y backend de bytes separado. No imponerle la receta pgcrypto/owners de Core. |
| Auth real añadido | R3 inventaría Auth, pero no valida una tercera variante concreta de su archivo. Diseñar y revisar la variante Auth descrita debajo; no etiquetarla como probada por el verificador Core/Storage r3. |
| S06 | Generaciones y claves F1/F2 nuevas antes de servir; antiguas deshabilitadas y conservadas, con lectura privada independiente. No confundirlas con access_generation del actor. |
| S07 | Sustituir únicamente en el nuevo harness el ejemplo de proveedor simulado por SupabaseAuthProvider + HumanAuthSessions de R2. Login captura generación después de password y antes de TOTP, y establece con esa generación. No usar establish sin esa condición ni un callback ficticio. |
| S07 y fuente externa | Conservar una instancia Auth t1 independiente del rollback para la contraprueba, además del Auth recuperado. Cada instancia tiene inventario de sesiones y barrera de revocación propia; un éxito en una no acredita la otra. |
| S09 | Ampliar el comparador: crm% no cubre Auth, roles/globals, settings ni metadata/bytes Storage. |
| S11–S13 | S11 requiere decisión expresa. Mientras no exista, conservar cuarentena; las mediciones y el informe describen solo fases anteriores observadas, sin afirmar reentrada ni H6-015 COMPLETED. El control JSON r3 exige explicit_reentry para completar su cadena: no falsificar ese flag para producir PASS. |

La fuente pública fijada de Auth distingue el comando raíz, que ejecuta migrate y después serve, del subcomando serve, que abre el API sin llamar a migrate (`cmd/root_cmd.go`, `cmd/serve_cmd.go`, commit `4eee58f296d9698a1c2c0ae14d7a0b379c7622d3`). Por tanto, después de restaurar no se usará el comando raíz ni migrate. El arranque tendrá que acreditar además catálogo y registro de migraciones exactos; no se presume que serve sea de solo lectura porque incluye trabajadores internos del proveedor. Se comparará la foto antes de arrancar, aislando y enumerando después cualquier escritura legítima del proveedor.

## 3. Topología propuesta, sin aprovisionar

No se asignan puertos, directorios ni credenciales actuales. El futuro recibo de recursos fijará identificadores únicos, propietario, versiones, raíz privada, sockets, puertos libres, procesos y pertenencia exclusiva al ensayo antes de crear nada.

| Recurso lógico | Concreción futura y separación |
|---|---|
| Origen Core + Auth | Cluster PostgreSQL 17.11 exclusivo; base Core y base Auth distintas. Reutilizar la composición R2; Auth tiene owner ordinario propio, sin superuser/BYPASSRLS ni autoridad Core. H6-008 utiliza crm_h6008_auth y el rol h6008_auth_admin; los nombres finales se fijarán y preservarán en el recibo, no se darán por existentes. |
| Origen Storage | Cluster y base propios conforme al runner fijado, metadata y backend de bytes privados separados del Core. |
| Destino Core + Auth | Cluster nuevo vacío, sin TCP, socket privado; bootstrap temporal distinto de los roles capturados. Globals una sola vez por cluster, dos bases restauradas por separado conservando sus nombres exactos. |
| Destino Storage | Segundo cluster nuevo exclusivo y backend de bytes nuevo, sin tocar origen ni cachés. |
| Auth t1 | Instancia de origen conservada fuera del rollback, detenida durante el corte y accesible después solo para controles del ensayo. No comparte conexión ni directorio con Auth restaurado. |
| HTTP y proveedor | Auth v2.197.0, frontera HTTP R2, dos instancias lógicas para carreras, proxy local de fallos. Storage commit 5def1dfc15ab7f08fe271c7d1e70542424524e4e. Sin datos, cuentas o endpoints Hosted. |
| Testigo y doble externo | Proceso/almacén durable sintético de H6-006 fuera de ambos destinos. IDs de operación/parte/intento, importe exacto/moneda, destinatario simulado, estado y cobertura de fuente t1. |
| Área sensible | Copias completas, configuración, claves, tokens y factores solo en recinto privado fuera de Git/Drive; evidencia pública separada. No se asigna aquí una política de retención. |
| Interceptores | SMTP y demás canales exclusivamente locales, signup público apagado, SMS/OAuth/hooks externos desactivados. Comprobar conexiones SMTP reales del interceptor; el contador HTTP histórico no basta. |

El ensayo necesita adaptar el transporte y ciclo de vida del harness; no nuevas tecnologías ni cambios contractuales. No llamar directamente al helper que siempre crea base/roles y migra Auth para abrir una base recuperada. Separar preparación de origen, captura, restauración y arranque sin migración. Es implementación futura, hoy no realizada.

## 4. Variante Auth propuesta y controles previos

En origen nuevo, instalar únicamente las migraciones oficiales de la versión fijada y crear identidades sintéticas con TOTP auténtico. Congelar su catálogo, registro de migraciones, roles, ACL/RLS, owners, settings, versiones y todas sus tablas durante t0. La lectura estática del paquete fijado no detectó CREATE EXTENSION en las migraciones Auth; eso no sustituye comprobar el catálogo real y el archivo antes de seleccionar receta.

Propuesta: copia lógica custom completa de la base Auth, globals del cluster compartido capturados una sola vez, restauración con nombre original y owners/ACL/settings, sin listas que omitan sesiones o factores. Comparar la foto completa **antes** de cualquier arranque o revocación. No importar la excepción de pgcrypto de Core ni los supuestos de PUBLIC de Storage. Si aparece extensión, propiedad o variante no revisada, la carga Auth se detiene hasta ajustar y revisar su receta técnica. No se modifica r3 para que su instrumento acepte una variante desconocida.

El archivo Auth contiene hashes de contraseña, factores, refresh tokens y material de sesión: es sensible aun siendo sintético. Se conserva fuera de la entrega pública. Las comprobaciones sensibles producen únicamente indicadores, IDs admisibles y digests del archivo/catálogo; no hashes individuales de contraseñas ni valores de factores en logs. No hay recuperación de contraseña, TOTP o cuenta real.

## 5. Bloques de ejecución propuestos y puertas

1. **Autorización y congelación — S01.** Recibir autorización delimitada para crear origen/destinos y ejecutar el ensayo, incluida revisión independiente. Confirmar cuatro dependencias, base+R2, versiones y permisos. Congelar expected independientes por caso, inventario completo y código del harness antes de observados. No arrancar por mera disponibilidad de binarios.
2. **Aislamiento y origen — S02.** Crear solo recursos exclusivos autorizados. Verificar sockets/permisos/listeners, red/canales y ausencia de procesos externos; origen sintético con roles ordinarios para negocio y autoridad administrativa separada para copia/provisión. Registrar la identidad sin secretos.
3. **Corte coherente — S03/S04.** Preparar sesiones/objetos/operaciones en t0; detener todos los escritores Core/Auth/Storage y bytes durante la captura completa. Registrar el intervalo UTC y monotónico real, sin fingir transacción distribuida. Conservar inventario privado y copias con tamaño/hash. Reactivar solo el origen sintético autorizado para producir t1; su testigo y doble quedan fuera del rollback.
4. **Hechos t1 y destino — S03/S05.** Producir en el origen revocaciones, efectos ejecutados con respuesta perdida, ausencias acreditadas y fuentes incompletas. Sellar el testigo. Restaurar únicamente destinos nuevos en cuarentena; comparar estructura/datos/permisos exactos antes de escrituras de seguridad. Error de restore preserva destino fallido y exige otro destino para la repetición; no limpiar ni continuar sobre la carga incompleta.
5. **Autoridad nueva — S06/S07.** Deshabilitar todas las claves F1/F2 restauradas, conservar historia, provisionar generaciones y claves independientes nuevas por cauce administrativo autorizado, confirmar y leer antes de crear nuevos firmantes. Usar login R2 completo para la sesión de control; ejecutar revokeAll y exigir completed/auth=revoked. Contrastar por separado Auth recuperado y Auth t1; revocar las sesiones del origen t1 con sus propios medios de ensayo autorizados. Probar JWT aún firmado/vigente, refresh, Core, objetos, prueba previamente verificada y capacidades antiguas. Solo una segunda identificación nueva admite positivos. Si falla Auth, la parte afectada permanece en cuarentena aunque Core esté cerrado.
6. **Integridad y objetos — S08/S09.** Comparar todos los datos canónicos y permisos, Auth y Storage; inventariar diferencias de seguridad exactas posteriores al restore, nunca exclusiones amplias. Probar objetos presentes, ausentes, corruptos y huérfanos, y bytes tardíos tras revocar. Roles runtime sin DDL/ownership/BYPASSRLS ni acceso a tablas Auth/claves. Reutilizar 105 entradas Core y sus seis estados negativos, preservando límites instrumentales.
7. **Conciliación — S10.** Cruzar operación/parte/intento con testigo completo t1: ejecutado, ausencia acreditada, incierto y fuente incompleta. Efecto ejecutado no se repite; desconocido conserva reserva. Intento t1 ausente en t0 no se fabrica por SQL; se conserva discrepancia y revisión por contrato existente. Si falta vía legítima, bloquear esa continuación, no inventar API o cambiar contrato.
8. **Medición, auditoría y decisión — S11/S12/S13.** Comparar pérdida de IDs/hechos/objetos/porciones por moneda exacta, duración monotónica por fase, pausas y espera humana. Desconocido se informa NO DETERMINADO. Revisor separado examina fuentes/expected y reconstruye controles sin modificar el candidato. Entregar acta, FAIL/correctivos y manifiestos saneados; S11/reentrada permanece pendiente de decisión independiente. Ninguna medida aislada aprueba RPO/RTO/coste productivos.

## 6. Contrapruebas y expected documentales

Se mantienen R01–R10 del expediente original. Se concretan estas contrapruebas del futuro harness; todavía no tienen observado ni resultado PASS:

| Caso futuro | Expected previo |
|---|---|
| Auth completa sin generación previa / login detenido antes TOTP o establish | No adoptar generación posterior; denegar identificación antigua entre dos instancias. |
| F2 firmada antes del cierre que llega después al SQL | SQL42501, sin nueva sesión ni efectos Core. |
| Establish confirmado antes del cierre, respuesta tardía | El handle tardío no concede acceso después de revocar. |
| Auth503, caída o refresh tardío | Core cerrado; resultado parcial explícito; no reentrada ni resurrección. |
| JWT válido de t0/t1 o URL conocida | Firma puede seguir válida; sesión/refresh/autoridad Core y descarga denegados separadamente. |
| Capacidad F1/F2 de generación restaurada/t1 | Rechazo aun controlando otros campos; generación nueva no basta sin permiso vigente. |
| Owner/ACL/settings alterados, archivo incompleto o clave antigua habilitada | Puerta de seguridad/integridad FAIL y cuarentena, sin normalizar para obtener igualdad. |
| Objeto sin bytes, corrupto o huérfano | Missing/inconsistent/revisión explícitos; no recuperado ficticio ni limpieza automática. |
| Pago/envío simulado ejecutado después de t0 | Contador durable de efectos no aumenta tras restaurar/conciliar. |
| Testigo incompleto o intento ausente en t0 | No inferir ausencia de efecto, no liberar reserva ni fabricar intento. |
| Reentrada sin autorización o con fallo material | Permanece bloqueada; no iniciar worker/scheduler/canal. |

## 7. Autorizaciones necesarias y salida actual

La siguiente decisión debe autorizar expresamente **implementar y ejecutar** este candidato sintético: clusters/bases/objetos nuevos; capturas y restauraciones protegidas; material efímero de Auth y F1/F2; rotación y revocación de autoridades exclusivamente sintéticas; procesos loopback/interceptores; testigo durable y efectos simulados; pruebas y revisión independiente en recursos separados. Debe preservar FAIL y detener solo la operación materialmente bloqueada.

Esa autorización no incluye reentrada S11 salvo que el director la defina explícitamente con alcance y condiciones; no permite dar por completada la cadena r3 sin esa puerta. Las cuentas, secretos, backups/datos y autoridades reales; Hosted/Production; comunicaciones/cobros/envíos reales; cambios normativos o contractuales; despliegue; commit/push/publicación y Drive siguen necesitando decisión separada.

ARCH-PENDING-002 y DM-PENDING-005 siguen OPEN. El ensayo aislado puede aportar medidas sin cerrarlos; no fija objetivos productivos ni retención. La adaptación Auth y su catálogo se verifican antes de cargar en la futura ejecución autorizada; hoy quedan como diseño técnico explícito, no capacidad observada.

**STOP: no ejecutar H6-015, no aprovisionar sus recursos y no publicar este candidato.**
