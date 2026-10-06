# Diseño mínimo y fronteras de runners — F06

La autoridad es D015/D038 y el criterio expreso de dirección, no una ampliación de actores. Una migración49 creada por CLI2.119.0 cambia solo el bloqueo de actor en crm_f2.admit(bytea,bytea,bytea,text,text). Se obtiene la definición vigente con pg_get_functiondef, exige exactamente una ocurrencia del bloqueo antiguo y emite CREATE OR REPLACE sustituyendo esa ocurrencia. Así se conservan las ampliaciones de finalidad/operaciones de H1–H4. Firma, OID, owner, ACL, configuración y atributos permanecen; se compara todo el catálogo. No nueva tabla, rol, permiso, protocolo, key, API o superficie TTE.

Actor FOR SHARE se conserva hasta fin de transacción y excluye mutadores FOR UPDATE. Sesión/epoch FOR UPDATE siguen exclusivos; sesiones distintas pueden entrar. Establecimiento/reidentificación/revoke_one/revoke_all/disable conservan bloqueos exclusivos actor primero. Mapping sigue único y no reemplazable por runtime; recovery y generación conservan cuerpos/guardas y suites actuales. No KEY SHARE, admisión separada o liberación anticipada.

## Orden y ciclos

Admisión: actor→sesión→epoch. Core conserva sus advisory/row locks originales. Allocation adquiere payment-root antes de cobertura Booking; Refund/Deposit adquieren Opportunity padre antes de sus raíces y payment-root; Provider Payment adquiere raíces de su compromiso y fuentes ordenadas antes de representar gasto. La barrera observacional solo bloquea payment-root y nunca escribe negocio. Los snapshots de pg_locks y pg_blocking_pids identifican cada frontera, incluido padre Opportunity. No se retiran padres para forzar overlap.

Los adaptadores ordinarios ejecutan una operación estrecha por unidad. Admit reentra SHARE compatible y sesión/epoch propios; no introduce upgrade del actor a UPDATE en esas rutas. Mutaciones de autoridad corren en su unidad propia y esperan; no se mezclan con callbacks arbitrarios de Core. D039/TTE no cambia: conexión/COMMIT exclusivos, last check obligatorio tras trabajos y esperas. Los grafos observados deben ser acíclicos y el conjunto conserva rollback exacto; un error/aborto no concede efecto ni autoridad residual. La prueba no promete ausencia universal de deadlocks bajo SQL privilegiado arbitrario.

## Adaptaciones explícitas

- postgres-h0-005: después de su bootstrap M03, instala el tail actual49 antes de los recorridos funcionales. Bases secundarias de V-MIG permanecen en fronteras originales; aserciones originales intactas.
- postgres-h0-006 N11: misma extensión antes de fixtures ordinarios. Su R22 de upgrade anterior mantiene su propia frontera.
- postgres-h0-012: conserva todas las pruebas originales de upgrade/DDL de F03/F04/F05 en before y después instala tail49 antes de casos funcionales/TTE. No cambia aserciones de caducidad ni finalización.
- postgres-h0-014/016/017 ya instalan todas las migraciones para funcionales y ahora incluyen49; sus subbases de upgrade permanecen explícitamente históricas.
- postgres-h4-019: después de fixture48 aplica49 y conserva las aserciones anteriores; el observador ahora exige dos admisiones que alcancen advisory de negocio y guarda PID/xid/sesión/locks/cadena. Añade J07/T08 en ambos órdenes, con obligación legítima restante.
- postgres-h4-019-preservation: mantiene byte checks de48 previas y su fresh48/catalog/advisors histórico. Cuenta49 archivos totales y exactamente48 anteriores. A10 nuevo cubre upgrade48→49 poblado y catálogo completo, incluyendo crm_f2; A12 cubre advisors actual49.

F07 del borrador, F08–F12 del nuevo verificador conservan originales. Ningún expected previo ni aserción histórica se adapta a producto. El reproducer deliberadamente FAIL sobre48 se archiva fuera de test discovery tras ejecutarlo; no se convierte en PASS histórico.

Documentación consultada: https://supabase.com/docs/reference/cli/supabase-migration-new ; https://www.postgresql.org/docs/17/explicit-locking.html ; changelog íntegro conservado. Entorno ya PostgreSQL17.11; sin upgrade, hosted o Production.
