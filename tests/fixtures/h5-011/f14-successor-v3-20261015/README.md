# H5-011-F14 — Sucesor V3 propuesto para revisión independiente

Estado: PROPUESTA NO AUTENTICADA / NO APLICADA. No es una aprobación externa.
Alcance local/aislado. H5-011 IN PROGRESS; H5-012 NOT STARTED; F14 OPEN.
Los resultados funcionales previos y actuales se conservan sin reatribuirlos.

## Correctivo y contrato

MO01 retira deliberadamente `at`. V2 intentaba crear evidencia B07 con ese
instante ausente y fallaba antes del intento de comando que debía rechazarse.
El candidato añade únicamente `||q.at===undefined` al uso de `f.proof`.
La prueba conserva `at` ausente. La evidencia utiliza el instante válido del
fixture; la guarda del producto rechaza el comando incompleto sin mutación.
Los instantes explícitos válidos siguen produciendo `occurredAt=q.at`, incluido
R06 histórico. `recorded_at` continúa siendo el registro real de PostgreSQL.
No se cambia el reloj global, el producto ni las pruebas originales.

`ModificationCommand.at` es string obligatorio. Null y fechas inválidas no son
entradas admitidas por ese contrato: el fixture no las repara. Las pruebas
adicionales verifican el rechazo de preparación y, con evidencia válida creada
separadamente, el rechazo del comando por producto. La aceptación del request
sintético con fecha futura explícita no establece una política general para
acciones futuras. Evidencia anterior y simultánea se admiten; posterior se
rechaza por la guarda temporal existente. Fuentes: BR-HIST-002 §21,
Domain Model §§5.2/7, constitución P06/P07, D020; contrato de modificación,
`confirmationFixture.proof`, B07 y `availability_time` / `modification_proof`.
Las fuentes exactas y líneas están en el informe de revisión del ZIP.

## Cadena y versiones

Git publicado: 71906987f9b74241cc4583e51498759829cded73.
HEAD local: 1346dd64ec2e9e804be23b17ea5f62f64515339c; main; 1/0; índice vacío.
Expected congelado: 67346 bytes;
669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b.

Fixture original Git: 7739f5603d576a41855c0d1238f1f2535568e2dd34f4a8fd0f48d35fec8d75ed (2856 bytes).
Fixture V2: 5cb28867ff6bbba211ff04fd65dc39f8d00c26727957bcc3d827e37708cd14d2 (3177 bytes).
Fixture V3: 1dd453597648051e727efd2d394f2e248ab50fed3ed81e046ef7ba95fbe8d01b (3195 bytes).
Guarda original Git: 8a422285bd817982eeb9c8785616aed07a209121ea7290b9075a1348f3ba49f5.
Guarda activa V2: 722780f466a8d1f490ad3a4b993dfc1cda49bb1ee09242c1c7bbc192d09f8aa2.
Guarda propuesta V3: 8c0aeab42167b9a6f8c819d35311de2455ca70040754a8a93b77120abbeb7ade (14798 bytes).
Sello externo V2: bfc239e6f462d9aaef0a8700ef4e4777504efedb781aebe0a70be68cdb44f17d.
Auditor V2: 47d0eadfcb89c30036317b321223dbf9f7319841c3b57d99a907a00bc67a4088.
El sello V2 autentica exclusivamente sus bytes previos. No autentica V3.
V1/V2 y el registro aplicado anterior permanecen intactos, inventariados.

La guarda propuesta admite solo original Git y candidato V3 para esta ruta.
La versión V2 queda archivada como predecesor exacto, sin convertirse en tercera
versión activa admitida. El nuevo registro incorpora hashes y tamaños anteriores,
el sello V2 y el hash de su registro. La guarda exige integridad de esos dos
predecesores al admitir V3. No modifica F06/F07/F08/F09/F16 ni otras excepciones.
El auditor valida todos los objetos Git del manifiesto y todos los archivos
previos, incluidos V2. F09/F16 se ejecutarán intactos sobre su snapshot publicado,
con copia física de dependencias como en V2; sus resultados no son regresión
actual. Se conservan los dos logs ORIGINAL NO RECUPERADO, 69 diferencias y R67/R030.

## Contenido y revisión

Doce artefactos regulares0644 más trust.json: README, lanzador, auditor,
contrapruebas, manifiesto, dos versiones de guarda, diff de guarda, dos versiones
de fixture, diff de fixture y registro candidato. Cualquier cambio posterior a
una de las doce entradas requiere nuevo trust y nueva revisión externa.
El manifiesto conserva el inventario Git original y sella el estado actual de
fuentes, pruebas y evidencias. Solo evidencia/defectos admiten anexos con prefijo
íntegro. Los informes nuevos .json/.log/.log.gz bajo `f14-v3-runs/` no son entradas
de confianza ni autorizan fuentes ejecutables. Los doce artefactos son de revisión;
no se instala ni ejecuta el auditor V3 durante la preparación.
Las contrapruebas V3 previstas son 37: las 31 anteriores adaptadas, rechazo de
V2 como tercera versión activa, dos manipulaciones de la cadena V2 y tres
alteraciones de los nuevos artefactos de fixture. Su ejecución exige el sello.

## Bootstrap independiente obligatorio

El revisor examina cambios y código, verifica el inventario y suministra por un
canal independiente el sello aceptado de trust.json. El digest calculado por el
desarrollador es candidato y nunca autorización. Antes de ejecutar verify.py,
contrastar todos sus bytes, tamaño, tipo y permisos mediante este bootstrap
estándar, sin importar ni ejecutar código del expediente:

```sh
python3 -B - <<'PY'
import hashlib,json,stat
from pathlib import Path,PurePosixPath
root=Path.cwd().resolve()
prefix='tests/fixtures/h5-011/f14-successor-v3-20261015/'
seal='SELLO_SHA256_SUMINISTRADO_POR_EL_REVISOR'
def regular(name):
    rel=PurePosixPath(name)
    assert not rel.is_absolute() and str(rel)==name and '..' not in rel.parts
    path=root
    for part in rel.parts:
        path=path/part
        assert not path.is_symlink()
    info=path.lstat()
    assert stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode)==0o644
    return path.read_bytes()
raw=regular(prefix+'trust.json')
assert len(seal)==64 and hashlib.sha256(raw).hexdigest()==seal
trust=json.loads(raw)
names={'README.md','guard-before.ts.txt','guard.candidate.ts.txt',
       'guard-transition.diff','transition.record.candidate.json',
       'manifest.json','verify.py','audit.py','counterproofs.mjs',
       'fixture-before.ts.txt','fixture.candidate.ts.txt','fixture-transition.diff'}
assert len(trust['entries'])==len(names)
assert {e['path'] for e in trust['entries']}=={prefix+n for n in names}
assert {p.name for p in (root/prefix).iterdir()}==names|{'trust.json'}
assert trust['auditorPath']==prefix+'audit.py'
assert trust['launcherPath']==prefix+'verify.py'
for e in trust['entries']:
    assert e['type']=='regular' and e['mode']=='0644'
    data=regular(e['path'])
    assert len(data)==e['bytes'] and hashlib.sha256(data).hexdigest()==e['sha256']
print('Expediente, lanzador y auditor autenticados contra el sello externo')
PY
```

No introducir como sello aceptado el hash leído automáticamente del expediente.
No generar una aprobación externa durante desarrollo.

## Activación posterior, exclusivamente tras aprobación externa

1. Conservar el sello y aprobación externos; ejecutar el bootstrap anterior.
2. Ejecutar `python3 -B tests/fixtures/h5-011/f14-successor-v3-20261015/verify.py --seal SELLO_EXTERNO --phase preapply`.
   Exige fixture V2, guarda V2, registro V3 ausente, todos los inputs intactos y
   ambos parches aplicables. No importa ni ejecuta la guarda candidata.
3. Revisar y comprobar ambos parches con `git apply --check`. Aplicar exactamente
   fixture-transition.diff y guard-transition.diff, sin staging. Comparar bytes
   con ambos candidatos autenticados. Crear únicamente el directorio del registro
   V3 y copiar transition.record.candidate.json sin modificar un byte a:
   `tests/fixtures/h5-011/f14-v3-applied-20261015/transition.authorized.json`.
   No reescribir ni copiar otra vez el registro V1/V2 existente.
4. Ejecutar el lanzador con el mismo sello y `--phase applied`. Exige hashes V3,
   registro byte-exacto, 37 contrapruebas e histórico F09/F16; revalida al acabar.
   Cada contraprueba conserva ID/resultado individual en el recibo JSON.
5. Conservar stdout/stderr/exit/hashes en hojas nuevas bajo f14-v3-runs/.
6. Ejecutar regresión integral autorizada en copia aislada, runner oficial,
   sin excluir pruebas. Preservar salidas generadas en esa copia y restablecer
   únicamente esos outputs de copia desde la fuente preservada antes del auditor.
   Las pruebas de preservación que rechazan V3 bajo guarda V2 no se cuentan PASS;
   requieren repetición después de activar la transición autenticada.

STOP sin sello externo. No aplicación durante la revisión; sin H5-012, staging,
commit, push, despliegues, integraciones reales, datos reales ni Hosted/Production.
Preparar y probar el candidato no cierra F14 ni acredita los 41 casos del expected.
