# TSK-H1-011 — expected previo de fechas civiles

Fecha: 2026-09-29. Base `207b5e1f6377773106a4969ddd30a83bc77218f8`, rama `main` limpia. Esta matriz se fijó antes de escribir el cálculo. Implementación publicada en `f79beca9fdd686715a894c69bae961bc7fabd7ee`. Estado final: **COMPLETED en alcance de dominio local/aislado** tras [H1-012](evidence-TSK-H1-012.md), R01–R18 PASS.

Fuentes APPROVED: Constitution P05–P07/P20; D020 (D040 solo fija la zona del año de códigos, no la contractual); Plan §§5.2/8/10.8; SPEC-FR-CHG-009, ECON-002, COORD-003, SPEC §11.2, AC-033/039/041/042/043/076; BR-PAY-002, PAX-008, TASK-004/005, CHANGE-007; DM-INV-031/038/039 y DM-PENDING-004 interpretado por D020; SM §2.4, EP-01/03, TA-04, RF-02, FORB-33; Tasks H1-011/012 y §6–7.

| ID | Expected normativo local/aislado |
|---|---|
| E01 | Servicio fecha 20: acto fecha 13 tiene 7 días civiles y pertenece completo a ≥7; fecha 17 tiene 3 y pertenece completo a ≥3 y <7. Días vecinos cambian intervalo solo al cambiar fecha. |
| E02 | Saldo con referencia 20 y límite 13 sigue no vencido durante todo el 13; está vencido desde fecha 14 si continúa impagado. Ninguna hora de servicio crea corte. |
| E03 | Instantes distintos de un mismo día en zona acreditada dan el mismo resultado; cruzar medianoche local puede revaluar. Ni 168/72 horas ni zona ambiental sustituyen fechas civiles. |
| E04 | Referencias explícitas separadas: global 20, modalidad B 22, servicio y noche 23 según su propio alcance. Selección exacta; una cifra específica no se propaga. Una referencia contractual expresa válida reemplaza únicamente su alcance. |
| E05 | Cambio de referencia 20→22 crea una evaluación nueva con antes/después, fuente, versión, actor/motivo/momento; no muta evaluación histórica. Cambio de hora sin cambio de fecha no cambia intervalo. |
| E06 | Zona desconocida bloquea la conversión dependiente. Fecha civil, instante, zona, referencia y alcance son tipos diferenciados. Fechas imposibles se rechazan; fin de mes/año y bisiesto funcionan. |
| E07 | Cruces DST de primavera/otoño no alteran la diferencia entre fechas civiles aunque transcurran 23/25 horas. Europe/Madrid solo en fixture con fuente explícita. |
| E08 | Deadline horario externo explícito conserva fecha/hora/zona/fuente/alcance e instante correspondiente; no se inventa uno cuando el límite es por día civil completo. |
| E09 | Núcleo sin persistencia ni reglas de sesión D025/D026 (30/7). No concede cobro, cancelación, cifra confirmada ni efecto externo por calcular un plazo. |

Datos de ensayo: fechas sintéticas de 2026 con zona sintética acreditada `Europe/Madrid`; otras zonas explícitas para falsar dependencia ambiental. No se acredita zona ni referencia contractual real. Las integraciones persistidas H3-002/H4-014/H5-012 siguen pendientes.

## Observado de implementación

`src/domain/civil-time.ts` distingue `LocalDate`, `Instant` y `TimeZone`; calcula días por ordinal gregoriano sin duraciones horarias. La conversión de instantes utiliza la zona explícita con fuente/versionado. `CivilReference` conserva alcance e ID, fecha, zona/procedencia, base contractual y versión. La selección es exacta por alcance, con prevalencia de una referencia contractual expresa solo en ese mismo alcance. Las evaluaciones conservan referencia, fecha, días, intervalo y versión de algoritmo; `reevaluateCivil` devuelve antes/después sin mutar el anterior. El deadline civil usa el día límite completo; el deadline horario externo exige fecha/hora/zona/instante/fuente compatibles. No hay lectura de zona ambiental, persistencia ni política de sesiones.

Focal `tests/civil-time-h1-011.test.ts`: **5/5 PASS** para E01–E09, incluidos 13/17/20, vencimiento desde 14, modalidad 22/noche 23, medianoche, DST, fechas inválidas y deadline horario explícito. `pnpm run typecheck` PASS. La regresión acumulada y la matriz formal independiente constan en [H1-012](evidence-TSK-H1-012.md).
