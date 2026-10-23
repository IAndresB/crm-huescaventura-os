# H6-015 / PostgreSQL 17 — Adenda independiente v2

22 de octubre de 2026. Complementa el dictamen v1 sin sustituirlo. **El manifiesto v1 y sus nueve payloads permanecen íntegros**, SHA-256 del manifiesto `abcbbfc053a574648390f3dec5b15b8dacb949a2382cbe0a3fa25d0bdc5d0b28`.

## Custodia de los recursos diagnósticos nuevos

El ejecutor creó la custodia adicional en `/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-pg17-corrective`, separada del paquete histórico v1. El auditor no escribió en esa custodia ni en el worktree ejecutor.

Se congeló [expected adicional](../../tests/fixtures/h6-pg17-independent/custody-addendum-expected-v1.json) y se ejecutó el [lector independiente](../../scripts/audit-h6-pg17-custody-addendum.py). [Resultado: 17/17 PASS](../../tests/fixtures/h6-pg17-independent/custody-addendum-review-v1.json).

- **5.829 archivos originales y sus copias / 243.212.913 bytes** releídos íntegramente, comparando tamaño y SHA-256 de cada uno con el inventario.
- Inventario privado SHA-256 `620593987eb68b1231760fd4a3ac02c59a42daed2499b562f3b36d7b453291eb`, cobertura exhaustiva del directorio de adenda.
- Directorios 0700, archivos 0600, propietario del usuario actual; sin symlinks ni entradas ACL allow según lectura nativa. Ninguna salida de valores o líneas privadas.
- Incluye `/tmp/h6pg-audit-w3564rmo` (dos clusters mínimos del auditor) y `/tmp/h6pg-exec-5jlsnrmr` (cuatro destinos diagnósticos del ejecutor). Originales presentes y verificados, sin borrado.

El paquete histórico y esta adenda suman **38.583 archivos / 1.415.326.681 bytes**. La revisión acredita integridad y acceso local por permisos; no acredita cifrado, respaldo externo, política de retención Production ni una restauración desde esas copias persistentes.

## Revisión documental final del correctivo

[Recibo de revisión](../../tests/fixtures/h6-pg17-independent/documentary-review-v2.json): **PASS de alcance documental, sin sobrerreclamación material**. Se revisaron los documentos completos del ejecutor, con dos precisiones menores incorporadas antes del sello: el desglose propio es 17 controles del motor/grafo, ocho mutaciones instrumentales y una comprobación agregada; ADMIN persistente añade una membresía/dependencia que modifica la revocación o democión futura, sin atribuir un incremento inmediato de acceso a quien ya es SUPERUSER.

Documentos finales revisados:

| Documento del ejecutor | SHA-256 |
|---|---|
| `specs/001-core-crm/corrective-assessment-TSK-H6-015-PG17-v1.md` | `fe85a1f9342a7168c1d09c293e2fe06bbf7056e794ac499ffdb159d34f3ea0e2` |
| `specs/001-core-crm/proposal-TSK-H6-015-PG17-bootstrap-v1.md` | `d9ecc10bfe92cb077d031bf246a0508ab2eb6aef5e8811f4e2403ed979cb9822` |

La propuesta identifica como DRAFT y no implementada una variante que cambiaría el requisito de bootstrap distinto y trataría explícitamente el CREATE ROLE ya satisfecho por initdb. No modifica r3 ni autoriza esa variante por sí misma. Mantiene los grants, atributos y configuración como objetos de futuras verificaciones, sin sustituirlos por éxito de comandos. El informe distingue los diagnósticos satisfactorios del fracaso de restauración Core/Storage y conserva pendientes sus owners/ACL, datos, relaciones, RLS, aislamiento y compatibilidad Auth integrada.

## Dictamen consolidado

El diagnóstico del ejecutor de 42 comprobaciones y la reproducción mínima independiente de 26 comprobaciones sustentan la causa S05. Las dos revisiones exhaustivas de custodia, 17 comprobaciones cada una, sustentan la conservación local. **Ninguno de estos resultados constituye PASS de restauración Core/Storage, AC-073/AC-074 ni cierre H6-015.**

No hay hallazgo material nuevo que impida entregar el expediente de investigación y custodia. Sigue siendo necesaria una decisión expresa para revisar las dos condiciones de S05 descritas en la propuesta. H6-015 permanece IN PROGRESS; S06–S10 integrados pendientes y S11 no autorizado. ARCH-PENDING-002 y DM-PENDING-005 OPEN. No hay cambio normativo, commit, push, publicación, Drive, Hosted/Production ni efectos externos.

**STOP ante la revisión reservada del procedimiento.**
