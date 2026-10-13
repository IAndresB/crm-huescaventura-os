# Protocolo de cierre separado — H5-009/010 local/aislado

Adaptación autorizada tras detectar que el cierre exigía modificar un inventario
C12 congelado por F16. El inventario original y los ocho archivos del expediente
F16 permanecen intactos. El comparador F16 no cambia.

## Cadena de confianza

El predecesor Git es `a39c6062f9738441f8627f4ae88005846ac9ab9a`.
Su auditor SHA-256 es `15278ae39c423e47645c5fd312b03580632254c433801e23ad4c8e1b04704387`.
El sello externo original F16 sigue siendo
`de7f4b38f061dccac0f6a290f0a555f1454e815cf16bf4941fdb0be0bf110e82`.

El revisor debe comprobar el diff exacto y suministrar separadamente el nuevo
sello de `trust.json`. El hash calculado durante desarrollo es una propuesta;
no equivale a una aceptación externa. Antes de ejecutar `verify.py`, comprobar
con una herramienta independiente el sello de `trust.json` y, contra ese
registro autenticado, el tamaño, tipo, modo y hash de `verify.py`. Esto evita
que un ejecutable manipulado se dé por válido a sí mismo. No obtener el sello
esperado calculándolo del mismo expediente que se pretende aceptar.

El lanzador autentica el auditor antes de ejecutarlo. La guarda dentro del
auditor es defensa adicional, no la raíz de confianza. Todos los comandos se
limitan al checkout local y a datos archivados; no requieren PostgreSQL.

```sh
python3 -B tests/fixtures/h5-009/f09/closure-protocol-20261013/verify.py \
  --seal "$F09_PROTOCOL_SHA256" --historical-f16
```

`--root` permite indicar cualquier checkout. Git debe contener el predecesor;
Node y las dependencias del lockfile deben estar disponibles para el auditor.
No se requieren rutas privadas de ejecuciones en `.git`. El F16 histórico se
ejecuta intacto sobre archivos obtenidos de Git en un temporal, con contexto
explícito del predecesor. Antes se comprueba que sus entradas siguen idénticas
en el checkout actual. Sus 43 contrapruebas y comparaciones archivadas no se
atribuyen a una nueva ejecución de PostgreSQL. El auditor actual se ejecuta
separadamente sobre los archivos reales del checkout.

## Inventario futuro

`tests/fixtures/h5-009/f09/c12-20261013/closure-inventory.json` tendrá exactamente
30 entradas: `closure.json`, `closure-originals.tar.gz` y los recibos `.status.json`
y logs `.log.gz` de los 14 gates que ya exige el auditor. Son rutas literales,
con procedencia, propósito, archivo regular, modo 0644, tamaño y SHA-256.
No se añade a `final-inventory.json` ni se cambia el sello C12.

El sello de cierre se suministra independientemente mediante `--closure-seal`.
Sin cierre no hace falta ese sello. Un inventario huérfano, parcial o con rutas
adicionales se rechaza. Se mantienen las comprobaciones existentes del SHA
probado, auditor exacto, siete transiciones documentales, originales y gates.
No se aceptan recibos del predecesor como pruebas del sucesor.

## Validación y límites

`counterproofs.py` usa únicamente una copia desechable y preserva los resultados,
incluidos los rechazos esperados. No ejecutar sus mutaciones en el checkout de
trabajo. El éxito del protocolo no cierra F09 ni acredita los gates de un nuevo
commit. Los cambios documentales de cierre requieren su validación posterior.

Los dos logs históricos siguen ORIGINAL NO RECUPERADO. Sus hashes y sustitución
autorizada no cambian. Las 69 diferencias y R67/R030 conservan su clasificación
histórica independiente. No se autoriza push, H5-011/012, H6 ni conectores reales.
