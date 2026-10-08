# Evidencia parcial — TSK-H5-007/008

**Continuación F01: IN PROGRESS / STOP por F03.** La línea autorizada está aplicada localmente; F01 no se cierra al fallar una contraprueba requerida. Preflight `bd683059…`/origin`ae7f3b0…`, main limpio2/0. Expected congelado intacto. Diagnóstico y salidas en [defectos](defects-TSK-H5-008.md) y [F03](../../tests/fixtures/h5-008/f03/result.json).

| Contraprueba de continuación | Observado | Resultado respecto a instrucción humana |
|---|---|---|
| 55 originales, guarda aplicada | PASS | Satisfactorio para recuento |
| Archivo56 inerte posterior | PASS | Satisfactorio para adición |
| Alterar original1 | FAIL esperado | Satisfactorio |
| Eliminar original intermedia | FAIL esperado | Satisfactorio |
| Sustituir original55 por comentario | PASS indebido | **FAIL material; F03** |
| Añadir comentario a original55 | PASS indebido | **FAIL material; F03** |
| F10/F12 sin cambios | PASS | Alcance original conservado; no cubre55 |

El caso histórico de comparación de bytes protege54 migraciones del baseline anterior y no incluye la55 propia. En copias temporales, su alteración por comentario pasa también F10/F12. No se ejecutó SQL ni PostgreSQL; las55 reales siguen intactas. No se ha cambiado otra guarda ni ampliado excepción. Implementación y toda verificación funcional H5-007/008 siguen NO EJECUTADAS. Reutilización HA/TTE/D039 pendiente de implementación. Sin SHA de producto definitivamente probado ni publicado.

Se conserva el patch autorizado y este diagnóstico en un checkpoint local posterior; no push. F01 OPEN por cierre condicionado a contrapruebas completas; F03 OPEN/MATERIAL. No se puede acreditar «ninguna otra incompatibilidad histórica» ante el bypass observado. STOP conforme al mandato humano de continuación, sin correctivo adicional ni tareas posteriores.

### Antecedente local bd683059 conservado

**IN PROGRESS / STOP por F01. No implementado ni acreditado localmente.** Fecha: 2026-10-08. Solo expected independiente publicado; diagnóstico y checkpoint posteriores locales. Sin producto, migración nueva, conector ni cambio de permisos.

## Preflight

Fetch de origin ejecutado. Rama main; HEAD = origin/main = `ff109036e3bb08a1d61e948693bc622bb10f240e`, divergencia 0/0 y árbol limpio. Cierres H0–H4 y H5-001–006 locales/aislados conservados; fichas H5-007/008 NOT STARTED antes de esta ejecución. Baseline documental: PostgreSQL 2408, unitarias 150, health independiente 1, migraciones 55, Next.js 16.3.8. No se vuelve a acreditar esa regresión por lectura documental.

## Expected publicado antes de producto

[Expected](expected-TSK-H5-007-008.md): commit exclusivo/publicado `ae7f3b02745f3011bf3b324f2a5b3420f22a0a79`; 26.621 bytes; SHA-256 `39eb753f8a2fc57a33d827a7980640256fd16d96ec7f2b70a27bf49a6841c40d`. Contiene 45 filas literales Tasks §6 y 56 casos W01–W56 con fuentes, expected y trazabilidad. No hay filas DM-INV asignadas literalmente a estas tareas; se conservan sus fundamentos derivados. AC-073 y E2E-06 mantienen obligaciones integrales futuras, no acreditadas aquí.

Fuentes localizadas: Tasks §§2.2/5/6/7 y fichas 007/008; Plan §§7.1/7.2/8/11.2; requisitos y AC solicitados; Constitution, Business Rules, Domain Model, State Machines, Architecture, D009/D016/D039. B08, C02/C03/C05/C06 y T08/T09. README leído; no AGENTS.md físico encontrado dentro del repositorio, se aplican las instrucciones AGENTS aportadas por el usuario.

## Hallazgo y verificación efectuada

[F01](defects-TSK-H5-008.md) impide añadir una migración manteniendo PASS del verificador histórico sin corregir su cuenta global fija de 55. Original sin cambios: baseline55 PASS; copia temporal con archivo56 inerte FAIL `56 !== 55`. Propuesta de una línea probada solo en copia: PASS con 56 y rechazo efectivo de alteración histórica. Original, FAIL, comandos y código del reproductor conservados. Es una prueba de filesystem de un verificador histórico, **no una prueba PostgreSQL ni funcional H5**.

Cadena F10/F12 original reejecutada PASS, con siete verificadores, cuatro snapshots y 800 entradas efectivas; contrapruebas excluidas de contadores PostgreSQL/unitarios. No se han modificado las excepciones. [Resultados](../../tests/fixtures/h5-008/f01/f12-historical-negatives.json).

## Trabajo no ejecutado

Implementación persistente, concurrencia real, recuperación, fencing, resultados tardíos, T08/T09, RLS/FORCE RLS y V-MIG nuevos: NO EJECUTADOS. HA/TTE/D039 se han revisado para reutilización; no se ha añadido ninguna segunda autoridad ni integración de producto. No hay un SHA de producto definitivamente probado.

Regresión PostgreSQL completa, unitarias completas, health, frozen install, typecheck, lint/import boundaries, build, auditoría producción y advisors del bloque: NO EJECUTADOS por STOP previo a producto. El PASS histórico de 2408/150/1 pertenece al cierre H5-006. La verificación limitada actual no lo sustituye. Diff-check y preservación de bytes sí se comprueban para este checkpoint.

## Cadena y límites

Base `ff109036…` → expected publicado `ae7f3b0…` → checkpoint documental local posterior (SHA consultable en Git). El único push de este bloque publica el expected, autorizado antes de implementar. No se publica este checkpoint ni producto sin PASS completo. El repositorio queda main con commit local pendiente respecto a origin; no se reclama 0/0 de cierre ni COMPLETED.

H5 IN PROGRESS, H5-007/008 IN PROGRESS; H0–H4 y H5-001–006 conservan COMPLETED local/aislado. H5-009/010, posteriores y H6 NOT STARTED y no preparados. DM-PENDING-005, BR-PENDING-035, capacidad/límites/pausas/reanudación/reintentos del scheduler y puertas Hosted/Production pendientes. No datos reales, IA, PLAUD, audio, scheduler externo, WhatsApp/email, cobros/envíos ni conectores. AC-073 integral/H5-010/H6-006/015/016/E2E-06 no acreditados. **STOP.**
