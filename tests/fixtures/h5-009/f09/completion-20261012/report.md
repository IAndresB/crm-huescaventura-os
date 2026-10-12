# H5-009/010 — validación local tras las cinco conversiones autorizadas

Estado: controles locales PASS; cierre documental pendiente. Base `8c1109426a8e85effeda6c2bb59c08ac0693c032`, fingerprint `888a789f2097a91bfc3f213c2682a648500074ef3340a5a4ddd014946ee2bb40`, auditor SHA256 `dd1c3c3bd8e690defe3461a5efea07a3d774a6388ae903d00c90d50b56e81b37`. Resultados sobre el estado de trabajo identificado; todavía no son pruebas de un nuevo commit.

Las cinco representaciones de representation.json conservan exactamente los bytes descomprimidos y sus hashes. Los manifiestos e inventarios anteriores permanecen intactos. El auditor reconoce solo las cinco parejas literales y rechaza ausencia, alteración, symlink, permisos o coexistencia raw no autorizada. Las demás rutas anteriores conservan sus bytes, tipos y permisos, salvo el correctivo autorizado del auditor.

R52 PASS en cuatro órdenes y fallo inducido; grupo H3 75/75; focal H4/H5 70/70; PostgreSQL completa2473/2473 sin FAIL/skipped/cancelled; unitarias171/171; health1/1; build, frozen install, typecheck, lint, auditoría producción y V-MIG PASS. Advisors oficiales sobre57 migraciones por loopback PASS, ambas tablas B09 comprobadas. F01 12, F05 18, F08/F09 40, clasificación29, recuperación13, gzip26 y wrapper14 contrapruebas esperadas. F10/F12 y H5-008 preservados. Staging íntegro en índice separado PASS; índice real vacío.

F16:131 tablas,69 hashes distintos entre ejecuciones, exactamente las mismas tablas de la comparación previa; sin diferencias en el resto del documento. C16 acredita preservación dentro de la ejecución, rollback y retry. El wrapper restauró los cuatro artefactos y no detectó cambios tracked ajenos. R67/R030 no reaparece; su causa histórica continúa sin atribuirse.

Se conservan tres FAIL de preparación y sus retests. F01 montaba R52 como symlink; solo en el arnés desechable se añadió R52 a la lista copyFile, sin cambiar aserciones ni el archivo protegido. Advisors: primer nombre temporal excedía103 bytes del socket macOS; segundo intento directo carecía del Storage local requerido. El retest utiliza el runner aislado existente, un nombre corto y la misma CLI oficial. Estos FAIL no se borran ni se presentan como ejecuciones exitosas.

build.log y health-independent.log históricos: ORIGINAL NO RECUPERADO. Sus referencias originales siguen inmutables. La salida observada de build empaquetada no adquiere el hash del original perdido. La sustitución documental autorizada queda verificada mediante nuevas ejecuciones y su sello independiente.

Este paquete conserva logs, scripts de montaje, estados, comparaciones y el FAIL de cada intento. No cierra aún F09 ni H5-009/010. Antes de cerrar: candidato commit exacto, comprobaciones atribuibles a ese SHA y cierre de los documentos permitidos por el contrato histórico. Sin tareas posteriores ni conectores reales.
