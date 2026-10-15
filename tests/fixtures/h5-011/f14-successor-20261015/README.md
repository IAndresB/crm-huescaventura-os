# H5-011-F14 — expediente sucesor pendiente de autenticación externa

Preparación autorizada de2026-10-15. No es una aprobación independiente, no aplica
la guarda y no cierra F14. H5-011 IN PROGRESS; H5-012 NOT STARTED.

## Autoridad y alcance

Constitution P02/P06/P07/P18; precedente F12; protocolo F09 publicado en
`tests/fixtures/h5-009/f09/closure-protocol-20261013/README.md`. Ese protocolo
exige revisar el diff y suministrar separadamente el sello del registro de
confianza; el hash calculado durante desarrollo no equivale a aceptación externa.
La instrucción humana actual autoriza este expediente y su futura aplicación
únicamente después de autenticación independiente. No se cambia ninguna raíz
histórica de confianza ni se reutiliza un sello antiguo para archivos nuevos.

Predecesor publicado:71906987f9b74241cc4583e51498759829cded73.
HEAD de trabajo:1346dd64ec2e9e804be23b17ea5f62f64515339c, congelación local del
expected. El fixture ya corregido permanece en su hash autorizado candidato.
La guarda activa y el auditor F09 histórico permanecen sin modificar.

## Contenido sellable

`trust.json` registra nueve entradas literales, cada una regular0644, tamaño,
SHA-256, procedencia y finalidad:

- `verify.py`: lanzador que exige el sello externo antes de ejecutar el auditor.
- `audit.py`: auditor sucesor de preservación, sin mutaciones de producto.
- `counterproofs.mjs`: contrapruebas futuras, únicamente sobre copias temporales.
- `guard-before.ts.txt`: guarda original, conservada por bytes.
- `guard.candidate.ts.txt`: versión candidata inerte, idéntica al diff propuesto.
- `guard-transition.diff`: parche exacto a aplicar después de autenticación.
- `transition.record.candidate.json`: registro exacto que se copiará al destino
  `tests/fixtures/h5-011/f14-20261014/transition.authorized.json` tras aprobación.
- `manifest.json`: inventario exacto de Git HEAD, entradas H5-011 y evidencias previas.
- Este `README.md`.

No hay autorización efectiva dentro de estos archivos hasta que el revisor
externo acepte y suministre el sello de `trust.json`. Su digest de preparación
se entrega únicamente como candidato para contraste independiente. Los recibos
de preparación no son recibos de autenticación ni resultados funcionales.

## Revisión independiente antes de ejecutar cualquier código del expediente

El revisor debe leer el diff, lanzador, auditor, manifiesto y contrapruebas,
calcular SHA-256 de `trust.json` mediante una herramienta independiente y
suministrar el sello aceptado por un canal externo a esta ejecución.
Debe verificar también que ese registro autentica el lanzador y el auditor.
No basta con ejecutar `verify.py`: un lanzador manipulado no puede validarse
a sí mismo. El siguiente bootstrap usa solo Python estándar y el sello que el
revisor haya suministrado; no importa ni ejecuta el código del expediente.
Ejecutar desde la raíz del repositorio, sustituyendo el literal indicado solo
después de la revisión externa:

```sh
python3 -B - <<'PY'
import hashlib,json,stat
from pathlib import Path,PurePosixPath
root=Path.cwd().resolve()
prefix='tests/fixtures/h5-011/f14-successor-20261015/'
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
       'manifest.json','verify.py','audit.py','counterproofs.mjs'}
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

Este bootstrap y la aprobación humana no deben obtener el sello esperado
leyéndolo automáticamente de un archivo generado por el desarrollador.
No usar el digest propuesto como argumento aceptado para probar el éxito del
lanzador durante la preparación. Cualquier modificación posterior de una de
las nueve entradas exige un nuevo registro y autenticación independiente.

## Operación después de recibir el sello, nunca durante la preparación

1. Conservar la aprobación y el sello externos en la evidencia de ejecución.
2. Ejecutar el bootstrap independiente anterior antes de invocar el lanzador.
3. Ejecutar `python3 -B tests/fixtures/h5-011/f14-successor-20261015/verify.py
   --seal SELLO_EXTERNO --phase preapply`. Este modo comprueba la guarda activa
   original y el inventario; no aplica el parche ni importa la guarda candidata.
4. Comprobar `git apply --check` del parche; aplicar exactamente ese parche y
   copiar el registro candidato a su destino autorizado. Verificar hashes reales.
   No usar staging, commit o push. El fixture no necesita otro cambio.
5. Ejecutar el lanzador con `--phase applied` y el mismo sello externo. Este
   modo exige la guarda corregida, el registro exacto, las contrapruebas de ambas
   entradas de comparación y la auditoría histórica. El lanzador vuelve a
   verificar todos sus artefactos después de retornar el auditor.
6. Conservar cada stdout/stderr/estado en una ruta nueva bajo
   `tests/fixtures/h5-011/f14-successor-runs/`, con hojas `.log`, `.json` o
   `.log.gz`, regulares0644. Ese permiso solo admite informes no ejecutables:
   no autoriza nuevas fuentes, SQL, scripts, fixtures o contratos.
7. Solo después, ejecutar las verificaciones funcionales autorizadas de R06,
   H4-012, consumidores, regresión completa, unitarias y gates. Reutilizar el
   runner aislado existente. No contar preservación como aceptación funcional.

## Garantías y límites

La única transición de fixture admite el hash histórico
7739f5603d576a41855c0d1238f1f2535568e2dd34f4a8fd0f48d35fec8d75ed y el candidato
5cb28867ff6bbba211ff04fd65dc39f8d00c26727957bcc3d827e37708cd14d2. Guarda original
8a422285bd817982eeb9c8785616aed07a209121ea7290b9075a1348f3ba49f5; candidata
722780f466a8d1f490ad3a4b993dfc1cda49bb1ee09242c1c7bbc192d09f8aa2.
Todas las demás entradas históricas mantienen sus bytes, modos y objetos Git.
El expected H5-011/012 mantiene67346bytes y su hash congelado.

El auditor original F09 se ejecutará intacto sobre una copia local desechable
del snapshot publicado71906987, con sus propios sellos históricos. Esa ejecución
no se atribuye al árbol de producto actual. El auditor sucesor verifica por
separado los bytes actuales contra Git y el inventario autenticado, admitiendo
solo fixture/guarda F14 y las nuevas rutas H5-011 literales. F06–F09 y F16 no
se reabren ni se reescriben. Los resultados históricos mantienen su SHA;
dos logs ORIGINAL NO RECUPERADO,69 diferencias históricas y R67/R030 conservan
sus límites. La comprobación de archivos no sustituye V-DOM/V-DAT/V-MIG.

Solo los dos documentos existentes de evidencia/defectos H5-011 admiten anexos
que preserven íntegro su prefijo congelado en este manifiesto. Las nuevas fuentes
de producto y pruebas están fijadas por hash: un correctivo adicional exige
actualizar el inventario y revisar la autenticación afectada. Los informes de
preparación/solicitud están fuera de la raíz de confianza y no autorizan nada.

STOP sin sello independiente. No Hosted/Production, datos reales, integraciones,
H5-012, staging, commit, push o despliegue. F14 no cierra por preparar este paquete.
