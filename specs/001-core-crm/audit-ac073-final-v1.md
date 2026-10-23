# Dictamen independiente definitivo sobre AC-073 y N03

Fecha: 2026-10-22. Base: `971c55d5ce5770c71284d106d3c0deecca9514b5`. Revisión exclusivamente documental y de evidencia sellada. H6-015 permanece IN PROGRESS. No se ejecutaron SQL, servicios, restauraciones, N03 o S11 en este bloque.

**N03 es innecesario para satisfacer AC-073 en el ensayo local en cuarentena.** Sería una ampliación opcional para otra capacidad: reconocer/aplicar en B08 un resultado cuyo intento original no existe en el punto restaurado. La conveniencia de esa capacidad no la convierte en requisito del criterio aprobado. Su implementación exigiría autorización y especificación propias; no se autoriza mediante este dictamen.

La evidencia examinada permite valorar **AC-073 SATISFACTORIO en su alcance local en cuarentena**, manteniendo explícitamente el resultado de negocio no aplicado y la incertidumbre no resuelta. Esta conclusión no acepta ni cierra toda H6-015, no activa S11 y no acredita continuidad Production.

## Jerarquía y obligaciones comprobables

1. La Constitución obliga a derivar tareas y código de las Specs aprobadas, impide inventar excepciones y limita los bloqueos a las acciones materialmente dependientes. Sus P18/P19 exigen criterios cumplidos y documentación fiel. No habilita convertir una elección técnica posterior en requisito retroactivo. [Constitución:9–13](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/docs/constitution.md:9), [P05:35](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/docs/constitution.md:35), [P18/P19:85–91](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/docs/constitution.md:85). Architecture desarrolla ese orden sin introducir negocio nuevo. [Architecture:12 y 26](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/docs/architecture.md:26).

2. AC-073 establece: «Automatismos sensibles suspendidos hasta conciliar efecto externo; no pago/envío duplicado ni original declarado recuperado; objetivos RPO/RTO siguen pendientes, sin cifras inventadas». No prescribe un resultado B08 para cada discrepancia ni la reanudación del sistema. [SPEC:566](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/spec.md:566).

3. SPEC-NFR-005 dice «Conciliar efectos externos antes de reanudar»; Architecture §15 y Plan §11.3 mantienen la misma condición. Es una guarda de continuación del efecto, no una obligación de resolver artificialmente la incertidumbre para validar que la suspensión funciona. [SPEC:597](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/spec.md:597), [Architecture:395–403](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/docs/architecture.md:395), [Plan:571–575](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/plan.md:571).

4. H6-015 exige restauración coherente, acta y mediciones, conciliación verificada con límites; su esperado concreta ausencia de duplicado, objeto ausente no recuperado, reservas/aprobaciones no liberadas, sesión revocada no reactivada y recuperación protegida. «Conciliación verificada» obliga a contrastar y documentar por alcance qué se resolvió y qué permanece pendiente. No permite llamar conciliado a todo el negocio, pero tampoco ordena una transición inexistente en B08. [Tasks:2464–2477](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/tasks.md:2464).

5. SPEC-FR-ERR-002 exige consultar por medios disponibles/autorizados y mantener intervención pendiente cuando la fuente no permite verificar o sigue ambigua. G6 y SM-FORB-27 prohíben transformar esa incertidumbre en éxito o repetición sensible. Una prueba que conserva unknown y bloquea el efecto cumple ese tratamiento; la fuente desconocida no tiene que convertirse en conocida para que la prueba negativa sea satisfactoria. [SPEC:404–414](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/spec.md:404), [SM:G6:33](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/docs/state-machines.md:33), [SM-FORB-27:742](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/docs/state-machines.md:742).

6. C04 conserva evidencia candidata o revisada, sin confirmación por adjuntar; B07 la relaciona y protege. B08/C05 separan intención, intento y resultado, y T08 mantiene la reserva ante incertidumbre. HA exige la evidencia del hecho y no una aprobación retrospectiva. [Plan:B07/B08:104–106](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/plan.md:104), [C04/C05:294–295](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/plan.md:294), [T08/T09:315–316](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/plan.md:315), [SM-HA:629–635](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/docs/state-machines.md:629).

7. El procedimiento r4 aprobado resuelve expresamente el caso: «Si el intento posterior no existe en Core t0, no fabricar un intento ni una transición aplicada: conservar evidencia/revisión por C04 y mantener el efecto suspendido hasta disponer de una vía legítima». La salida S10 es una tabla de estado restaurado, fuente, discrepancia y decisión trazada. Sus paradas —identidad ambigua, fuente incompleta o resultado incierto sin protección— mantienen el bloqueo dependiente y prohíben declarar no-efecto. S11 exige conciliación completa **para el efecto cuya continuación se estudie** y autorización expresa; admite mantener cuarentena. [r4:S10:683–691](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/procedure-TSK-H6-014-r4.md:683), [r4:S11:695–701](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/procedure-TSK-H6-014-r4.md:695).

El marcador instrumental `external_reconciled` del esquema S10/S11 no se interpreta como permiso para borrar esas limitaciones expresas. No se declaran todos los efectos conciliados ni se satisface una autorización de reentrada por superar AC-073.

## Limitación real del código y su alcance normativo

B08 result selecciona estrictamente el intento existente y comprueba reserva, estado y prueba vinculada; HA reconcile requiere una reserva uncertain y un evento attempted coincidente. Por tanto, el contrato actual no permite aplicar sin más el resultado de un intento ausente. Esto acredita una limitación funcional real, **no que AC-073 obligue a ampliar ese contrato**. [B08:211–225](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/supabase/migrations/20261008143617_h5_persisted_work_recovery.sql:211), [HA:278–287](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/supabase/migrations/202609270000_h0_m04_human_approval.sql:278).

N03 no figura como obligación en Constitución, Architecture, SPEC, Plan o Tasks examinados. Su nombre corresponde al expediente técnico posterior. Si se decide desarrollar ese reconocimiento, necesitará su diseño y aprobación antes de implementarlo, conforme a P03/P04; tampoco resolverá por sí solo una fuente externa incierta. [Constitución:27–31](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/docs/constitution.md:27).

## Evidencia focal y cuatro resultados distintos

Se revisaron los informes históricos del ensayo PG17 v2 `2026-10-22T14-52-59-084Z` y C04 R2 `2026-10-22T16-46-33.825Z`, junto con la adquisición SQL independiente del paquete auditor anterior. No se sustituyen las pruebas runtime por la presente lectura.

| Caso | Hecho acreditado y disposición | ¿Resultado definitivo aplicado? | Protección acreditada |
|---|---|---|---|
| executed | Intento restaurado existente; fuente confirma ejecución; succeeded y replay. | Sí, por contratos existentes. | Trabajo pausado y claim denegado. |
| absence-proven | Fuente prueba ausencia de efecto, distinta de timeout; failed y replay. | Sí, por contratos existentes. | Pausa mantenida; ningún nuevo contacto autorizado. |
| absent-t0-attempt | Fuente t1 acredita ejecución; intento ausente en t0; evidencia conservada/revisada mediante C04→B07. | No; cero intentos fabricados. | Pausa y claim denegado; negocio pendiente expresamente. |
| uncertain | Fuente insuficiente; estado uncertain y observación candidata unknown. | No resultado definitivo inventado. | Reserva/suspensión conservadas, start y claim denegados. |

El ensayo restaurado probó esas denegaciones, no solo que no se llamara a un proveedor: [harness v2:182–190](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/scripts/run-h6-bootstrap-variant.ts:182). Esto satisface la exigencia V-NEG de intentar la transición prohibida. [Tasks:247](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/tasks.md:247).

El contador externo simulado sigue en tres; el ledger no cambia. El objeto ausente sigue missing, con descarga denegada; no hay objetivos RPO/RTO inventados. C04 no aplica negocio y conserva los estados anteriores, como acreditó el readback SQL independiente. Registrar siete evidencias del ensayo no representa siete efectos externos nuevos.

En este bloque se ejecutó un readback independiente de **41 controles documentales**, con **174 payloads** verificados frente a los hashes históricos fijados (106 + 35 + 33), los 20 controles focales históricos y las disposiciones anteriores. Resultado: PASS. [Recibo independiente](../../tests/fixtures/h6-ac073-independent/readback-v2.json).

Se revisó además el instrumento ejecutor final y `verification-v4.json`: 20 controles históricos y 12 contrapruebas sobre copias en memoria, correctamente declaradas como instrumentales. Detectan, entre otros, éxito inventado, intento fabricado, objeto falsamente recuperado, pérdida de pausa, efecto adicional y estado global falso. No constituyen 20 o 12 ejecuciones nuevas del producto.

Se conservó un FAIL de mi primer readback por asumir una clave status común: bootstrap utiliza `state=TECHNICAL_SCOPE_EXECUTED_REVIEW_PENDING`; C04 usa `status=PASS` y un contador entero `externalBusinessEffects=0`, no un booleano. El readback corregido respeta esos esquemas. No se corrigieron datos ni expected históricos para obtener PASS. [FAIL instrumental](../../tests/fixtures/h6-ac073-independent/readback-instrumental-failure-v1.json).

## Rectificación de mi interpretación anterior y trabajo restante

La frase del dictamen anterior que dejaba pendiente «la conciliación integral del resultado sin intento y la resolución sustentada de la incertidumbre» describía correctamente dos limitaciones del negocio. **Interpretarlas como impedimentos necesarios para AC-073 fue excesivo.** Confundía la prueba de recuperación segura con la capacidad de aplicar todos los resultados y reanudar. Esta adenda rectifica esa valoración normativa sin alterar el dictamen anterior, su manifiesto de 33 archivos, los FAIL ni las observaciones válidas.

No falta una implementación N03 ni un nuevo ensayo que fuerce B08 result sin intento para acreditar AC-073. Los controles focales exigibles —clasificación por identidad, contraste, denegación de repetición, pausa, ausencia de duplicado y falsa recuperación, evidencia/mediciones sin garantías inventadas— ya constan en las ejecuciones y readbacks examinados. No se justifica repetir SQL/Auth/Storage sin cambio afectado o discrepancia material nueva.

Queda incorporar este dictamen y el acta de cuatro casos a la valoración integral de H6-015, conservando la diferencia entre negocio pendiente y prueba satisfactoria. Esta auditoría focal no evalúa de nuevo todas las asignaciones de H6-015 ni concede su aceptación integral. Una eventual reentrada de un efecto requiere su conciliación suficiente, guardas y autorización S11; una futura ampliación B08 requiere su decisión contractual propia.

ARCH-PENDING-002 y DM-PENDING-005 siguen OPEN. No son una obligación de inventar RPO/RTO ni bloquean por sí mismos el ensayo aislado. [Tasks:3327](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/tasks.md:3327). No hay nueva adquisición privada, cambio normativo, commit, publicación o modificación de candidatos sellados en esta revisión.

**STOP antes de N03, S11, cierre integral o cualquier operación reservada.**
