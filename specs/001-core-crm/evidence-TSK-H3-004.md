# Evidencia — TSK-H3-004: Verificación normativa independiente

**COMPLETED local/aislado.**

Base inicial `a127da1b736844237d04d691f265b2cee214531e`, comprobada tras `git fetch origin`: main, árbol limpio, HEAD==origin/main y SHA exigido exactos. Documentos vigentes: H0 COMPLETED técnico/local/aislado; H1/H2 COMPLETED local/aislado; H3 IN PROGRESS; H3-001/002 COMPLETED local/aislado; H3-003+ y H4–H6 NOT STARTED antes de este bloque. F01–F04 anteriores CLOSED, cero materiales abiertos; hosted H2/H3 no acreditado, Production no autorizada y health-check independiente fuera de H0–H6 conservado. Corrección documental a127da1 incorporada. Autorización humana del bloque únicamente 003/004; sin reset ni reescritura de historia.

Expected independiente [expected-TSK-H3-003-004.md](expected-TSK-H3-003-004.md), **78 casos y 31 filas Tasks §6**, congelado en `4909f63936c9079b5e9b6981f41a21089e0ab50d` antes del producto `ff26473`. SHA256 `6c5fc44529df479ea19c618ea89238a83767466367f1811ba6f4f1692dce85e9`, idéntico tras todas las correcciones. Fuentes: fichas completas 003/004; Tasks §2.2/6/7; Plan §§5.1/7.1/7.2/7.3/9, B05/B07/C01/C02/C03/C04/C06/T05/PT04; SPEC-FR-ECON003/004/006, IDEMP003, ACC005; AC025/026/028; DM §11/INV030 y fronteras económicas pertinentes; SM-CP01–08/RC01–04/FORB04/14/15, G1–G6, E2/E3/E7/E8, E2E05 solo alcance local; BR-PAY001/003/006, P05, Architecture §12.1 y H1 D023. Las 31 filas asignadas de §6 están copiadas en expected. No producto como oráculo ni expected adaptado.

**Commit exacto de producto/verificación probado:** `b4f26877a3be3877852129471719cd6dfb512c15`. Producto/dominio/adaptador/migración idénticos a `0ff184ae1e873ec7319358af11f850b682aeb8c2`; b4f2687 corrige el inventario del reproducer histórico F08. El commit posterior de evidencia/coordinación y su SHA final publicado se distinguen en Git/informe final. Node 24.21.0, pnpm 11.19.0, PostgreSQL 17.11 y CLI Supabase 2.118.0. Clusters efímeros locales en 55680–55685, sesiones/conexiones independientes, Auth/fuentes/evidencias exclusivamente sintéticos; Storage oficial aislado por runner completo con backend de archivos/loopback para preservar H1. Sin conexión bancaria ni hosted.

## Implementado

[Dominio](../../src/domain/customer-payment.ts), [adaptador estrecho](../../src/infrastructure/postgres/h3-payment-adapter.ts) y [migración forward](../../supabase/migrations/20261003093202_h3_customer_payment_reconciliation.sql). Customer Payment tiene identidad interna estable, detección original y datos conocidos/nulls; identidad fiable compuesta fuente+identificador del movimiento, conservada separadamente de señales repetidas. No se deduplica por importe/fecha/pagador/referencia parcial. Sin identificador fiable se conservan señales pendientes; el contraste posterior puede enlazar una señal duplicada al movimiento acreditado sin sumar ingreso.

Recepción es hecho separado, original inmutable, con importe bruto exacto, identidad, fuente autorizada comprobada, evidencia específica del contraste, actor y momentos. La admisión de una fuente local exige registro B07 manual/externo reviewed del Administrador vinculado a la raíz, y la comprobación del hecho exige otra evidencia reviewed ligada al contenido concreto. Un booleano del payload, mensaje/justificante, coincidencia de referencia o registro candidate no conceden autoridad. Fuentes bancarias reales/Production siguen sin determinar ni acreditar. Datos desconocidos permanecen null; el movimiento puede existir sin Booking/Expected/Acceptance y sin inventar pagador/fecha/método/referencia.

Reconciliation conserva propuesta y comprobación como actos identificados distintos, candidato Booking/schedule/slot originales, porción reconstruible por inicio e importe, revisión, fuente/evidencia/actor/momentos, discrepancia y rectificación enlazada con antes/después. La IA solo puede proponer; la validación/corrección necesita actuación manual autorizada y contraste material. Porciones de correspondencia son la frontera mínima exigida para parcialidad y no doble cómputo: **no Payment Allocation, consumo, distribución por finalidad ni cobertura integrada**. La porción sin destino no se reasigna ni financia otra reserva.

Incidencia superpuesta por porción, con causa y evidencia: preserva fase base, recepción y correspondencia históricas. Las suspensiones solapadas se evalúan por unión, sin descontar dos veces; la parte independiente conserva su verificación. Una rectificación agrega acto/historia/revisión con original y resultado; no modifica ni borra banco, detección, recepción o actos previos. Ejemplo: 200 comprobados y 100 dudosos conserva 200 históricos y 100 actualmente comprobados fuera de la suspensión, sin inventar destino para los 300 restantes. Una devolución/rectificación no crea deuda nueva ni Refund ejecutado. Una evidencia presentada puede vincularse mediante B07 a Acceptance y pago; cada hecho conserva comprobación separada.

Persistencia append-only: b05_customer_payments, b05_movement_keys, b05_payment_revisions, b05_payment_receipts, b05_reconciliations, b05_reconciliation_acts, b05_payment_operations y b05_payment_history. Operación/historia/revisión/hecho juntos o rollback. PLAN-T05 serializa operación, identidad del movimiento y raíz compartida; conserva además locks F2 ya acreditados. Misma identidad/material recupera resultado; misma clave/material distinto E2; permiso se comprueba también al replay. No garantía exactly-once externa.

RLS/FORCE RLS, owners/executor NOLOGIN/NOBYPASSRLS, ACL mínimas y triggers de inmutabilidad; runtime sin DML/lectura directa/TRUNCATE ni PUBLIC/anon/authenticated con acceso. SECURITY DEFINER solo en payment_apply/read bajo el patrón estrecho F1/F2 existente, propietario executor sin bypass, search_path explícito pg_catalog,pg_temp, admisión y comprobación final obligatorias. Helpers privados sin EXECUTE PUBLIC. C01 solo raíz exacta con finalidad/actor internos autorizados; búsqueda por importe/referencia y proyecciones de terceros denegadas. Sin exposición de costes/honorarios/margen/beneficio/datos bancarios no necesarios ni evidencias ajenas. No políticas de retención inventadas.

Importes definitivos son strings EUR materializados a dos decimales y núcleo exact-money H1; moneyDifference/remainingRight se reutilizan, sin floats/number como autoridad ni segundo redondeo. Snapshot/actos conservan algoritmo/fuentes/importes; obligación histórica no se recalcula desde cobros ni configuración vigente.

## Verificado

**87/87 pruebas del bloque:** matriz 78/78 + 8/8 reproducers históricos + 1/1 focal. V-DOM/V-DAT/V-MIG/V-AT/V-SM/V-NEG/V-EVI. Caso normativo: recibido 500.00, comprobado 200.00, restante 300.00; estado Pendiente de conciliar. Duplicado/señal/replay no suma; dos movimientos fiables iguales conservan dos Customer Payments y bruto 500+500=1000. Falta de ID conserva revisión; discrepancia suspende solo su porción. Expected sigue sin recepción; Acceptance/pago/mandato/Booking/proveedor independientes.

Sesiones PostgreSQL reales independientes y solapamiento observado: misma identidad/clave, propuestas, validaciones y rectificaciones concurrentes, ambos órdenes donde corresponde y revisión obsoleta. Un efecto/revisión o conflicto/replay, sin historia parcial ni doble recepción/correspondencia. C01 puede esperar el lock de actor F2 establecido por H0: inspección independiente muestra únicamente ledger confirmado anterior mientras la escritura espera antes de COMMIT; tras COMMIT C01 devuelve el estado íntegro. No cambiar ese lock ni inventar otros humanos para simular concurrencia (singleton D025 conservado).

Fallos inyectados antes de primera escritura y en cada insert material de detección/recepción/propuesta/validación/rectificación/historia/resultado, más trigger diferido en COMMIT: rollback conjunto. Respuesta perdida después de COMMIT recupera resultado durable, sin duplicar bruto/hechos; replay forjado/no autorizado denegado. Ningún efecto externo ejecutado.

**V-MIG PASS:** migración creada por `pnpm dlx supabase@2.118.0 migration new h3_customer_payment_reconciliation` tras `--help`. Fresh chain, upgrade de H3-002 poblado con fixtures anteriores, error/rollback y roles opcionales ausentes. IDs, relaciones, snapshots, importes, historia, OIDs/definiciones/owners/ACL/RLS/policies/triggers/roles previos conservados. 31 migraciones históricas byte a byte, incluida 20261002233922_h3_expected_obligations.sql; ningún cambio hosted ni operativo de health-check.

**Regresión final: 769/769 PostgreSQL y 94/94 unitarias; total 863 pruebas, sin sumar otra vez los 87 casos H3 incluidos en PostgreSQL.** 0 FAIL/skipped/cancelled. Instalación congelada, typecheck, lint/import boundaries, build, production dependency audit (sin vulnerabilidades conocidas), diff-check y preservación H0–H3-002 PASS. Logs en [tests/fixtures/h3-004](../../tests/fixtures/h3-004), [resumen](../../tests/fixtures/h3-004/regression-summary.json) y [manifest](../../tests/fixtures/h3-004/raw-log-manifest.json). El log de build se conserva comprimido byte a byte porque termina con una línea en blanco; no se normaliza el raw. Los dos logs históricos H2 que regenera el harness se guardaron fuera y restauraron byte a byte; no sustituyen sus FAIL originales.

Comandos reproducibles: `pnpm install --frozen-lockfile`; `pnpm run typecheck`; `pnpm run lint`; `pnpm test`; `pnpm run build`; `pnpm audit --prod`; `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres`. Focal/matriz/reproducers: misma variable y `node --test --experimental-strip-types tests/integration/postgres-h3-003.test.ts tests/integration/postgres-h3-004.test.ts tests/integration/postgres-h3-004-defects.test.ts`. Repetición F08 afectada 90/90 incluye las 4 reproducciones anteriores H3-002, las 8 nuevas y matriz 78.

## Defectos

**F01–F08 CLOSED local/aislado; 2 de producto y 6 del verificador; cero materiales abiertos.** [Registro y reproducciones mínimas](../../tests/fixtures/h3-004/defects.md). Producto inicial: F01 evidencia presentada común omitida; F02 expresión SQL ambigua al repetir recepción. Verificador: F03 helper restablecía evidenceId retirada; F04 consulta/estado Booking incorrectos; F05 segundo Admin incompatible con singleton; F06 conexiones/inspección/espera del harness; F07 inventario histórico H3-002; F08 inventario de su reproducer anterior. Primer intento interrumpido por F06 conservado, diagnóstico 44/54, tercer completo 75/78, revalidación 78/78 y afectada 146/146, primera regresión 767/768 por F08, segunda 769/769. Ningún FAIL borrado/acomodado; archivos raw comprimidos sin alterar bytes y verificados contra Git 0ff184a.

## Pendiente de integración posterior y no acreditado

**H3-005/H3-006/H4-019/H6-005 permanecen pendientes** hasta sus dependencias y nueva autorización. También se conserva la integración previa de obligaciones H4-021 y todos los pendientes globales: PLAN-AUTH-001–006; PLAN-PENDING-003 en parte abierta; ARCH-PENDING/DM-PENDING/BR-PENDING vigentes, incluidos DM-PENDING-005 y BR-PENDING-022/033/034, datos reales y políticas de privacidad/retención.

No Payment Allocation completa, consumo/disponible por finalidad, cobertura integrada, Refund completo, Provider Payment, facturación, banco/conector real, fondos reales, proveedor/operación confirmados ni hosted H2/H3/Production acreditados. Ninguna deuda por mera devolución. Fuentes bancarias autorizadas reales/Production no decididas. No modificación de health-check independiente ni de normativa/expected/evidencias anteriores.

**H3 IN PROGRESS; H3-001–004 COMPLETED local/aislado; H3-005+ y H4–H6 NOT STARTED. STOP obligatorio tras H3-004; continuidad exige nueva autorización humana.**

## Comparación observada por ID

Expected/precondición/acción/prohibiciones/estado posterior: matriz congelada en 4909f63. Cada caso ejecutó las aserciones exactas del verificador independiente y su línea PASS está conservada en postgres-b4f2687.log.

|ID|Observado verificado|Resultado|
|---|---|---|
|R01|Expected exists independently, no movement created|PASS|
|R02|notice or promise detection is not money|PASS|
|R03|customer proof alone cannot receive|PASS|
|R04|unknown movement data stays unknown without invalidating signal|PASS|
|R05|detection each missing source/evidence/material rejects without effects|PASS|
|R06|repeated identical signal links prior without double money|PASS|
|R07|reliable movement retry other key keeps one root|PASS|
|R08|same reliable identity different material conflicts E2|PASS|
|R09|two real transfers same amount date payer reference remain two|PASS|
|R10|no reliable identity retains similar signals for review|PASS|
|R11|authorized receipt separate from correspondence|PASS|
|R12|missing authorized source blocks receipt|PASS|
|R13|he pagado or expected reference is not source authority|PASS|
|R14|wrong root source/evidence rejected|PASS|
|R15|discrepancy receipt retains detected and gross amounts explicitly|PASS|
|R16|repeated receipt other operation does not add money or revision|PASS|
|R17|changed receipt never overwrites original|PASS|
|R18|later contrast links duplicated unidentified signal without second receipt|PASS|
|R19|proposal before receipt is distinct pending act|PASS|
|R20|proposal guards missing candidate/amount/source block only dependent scope|PASS|
|R21|AI may propose only|PASS|
|R22|proposal without receipt cannot verify|PASS|
|R23|reference match alone not correspondence check|PASS|
|R24|each material verification guard necessary|PASS|
|R25|AI cannot verify or rectify|PASS|
|R26|normative 500 received 200 identified 300 unresolved|PASS|
|R27|complete correspondence500 does not confirm Booking|PASS|
|R28|known context cannot transfer correspondence to another Booking|PASS|
|R29|wrong obligation or slot cannot fabricate destination|PASS|
|R30|overlapping correspondence cannot count same portion twice|PASS|
|R31|excessive/negative portion rejected preserving receipt|PASS|
|R32|incident suspends only100 of verified200|PASS|
|R33|incident on unresolved300 leaves200 verified|PASS|
|R34|discrepancy preserves prior proposal and checked correspondence|PASS|
|R35|discrepancy each material guard without side effect|PASS|
|R36|human linked rectification preserves original and checked result|PASS|
|R37|rectification all authority cause evidence context guards required|PASS|
|R38|later error preserves bank receipt and reconciliation history|PASS|
|R39|Refund remains explicit unavailable boundary|PASS|
|R40|common evidence can link Acceptance and payment with separate verification|PASS|
|R41|H2 states remain independent|PASS|
|R42|forbidden paid/covered/allocation/Refund inference attempted and denied|PASS|
|R43|verified correspondence still no integrated obligation coverage|PASS|
|R44|odd cents exactly0.03 received0.01 reconciled0.02 pending|PASS|
|R45|direct signed definitive number/nondecimal authority rejected|PASS|
|R46|equivalent same identity key-order replay no new history|PASS|
|R47|same operation different material E2|PASS|
|R48|lost committed response replays without duplicate receipt|PASS|
|R49|replay actor/scope unauthorized denied|PASS|
|R50|absent forged disabled and MFA-less contexts fail closed|PASS|
|R51|narrow authorized projection only exact root|PASS|
|R52|third parties no economic read or reference search enumeration|PASS|
|R53|direct DML and historical alteration unavailable ordinary roles|PASS|
|R54|owner ACL RLS FORCE RLS search_path narrowly controlled|PASS|
|R55|same movement simultaneous different keys one root both orders|PASS|
|R56|simultaneous same operation exactly one durable result|PASS|
|R57|simultaneous similar real transfers stay separate|PASS|
|R58|proposal concurrent same revision one conflict both orders|PASS|
|R59|same proposal concurrent validation one fact and conflict/replay|PASS|
|R60|obsolete root revision detected without overwrite|PASS|
|R61|rectification concurrent same revision one result both orders|PASS|
|R62|read another session during receipt written before COMMIT sees prior snapshot|PASS|
|R63|fail before first movement write rolls all back|PASS|
|R64|fail after movement before history no incomplete root|PASS|
|R65|receipt writes fail atomically at every insert|PASS|
|R66|proposal rollback all dependent writes|PASS|
|R67|validation rollback act revision history result together|PASS|
|R68|rectification rollback retains original and pending review|PASS|
|R69|deferred COMMIT fault no durable result|PASS|
|R70|fresh install least objects triggers ACL roles|PASS|
|R71|upgrade from populated H3-002 preserves all old data objects and privileges|PASS|
|R72|failed migration rollback restores preceding schema grants and roles|PASS|
|R73|optional roles absent installs with no implicit PUBLIC grant|PASS|
|R74|exact prior migrations health-check and expected preserved; future absent|PASS|
|R75|payload authorized boolean cannot certify source contrast|PASS|
|R76|overlapping doubts suspend union not sum twice|PASS|
|R77|human resolution only affected receipt portion, no bank reversal|PASS|
|R78|retained movement acts survive changed catalog/policy versions|PASS|
