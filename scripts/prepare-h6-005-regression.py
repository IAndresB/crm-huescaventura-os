from pathlib import Path
import re,json,hashlib
sources=['postgres-h3-004.test.ts','postgres-h3-006.test.ts','postgres-h3-008.test.ts','postgres-h3-010.test.ts','postgres-h3-012.test.ts','postgres-h3-014.test.ts','postgres-h4-019.test.ts']
ports={};n=61204;rows=[]
for src in sources:
 p=Path('tests/integration')/src;s=p.read_text()
 for port in sorted(set(re.findall(r'\b5[5-9][0-9]{3}\b',s))):
  if port not in ports:ports[port]=str(n);n+=1
 s=re.sub(r'\b5[5-9][0-9]{3}\b',lambda m:ports[m[0]],s)
 assert n<=61250
 dest=Path('tests/integration')/('h6005-regression-'+src)
 dest.write_text('// H6005 isolated port-only derivative; normative assertions preserved.\n'+s)
 rows.append({'source':str(p),'sourceSHA256':hashlib.sha256(p.read_bytes()).hexdigest(),'derivative':str(dest),'derivativeSHA256':hashlib.sha256(dest.read_bytes()).hexdigest()})
Path('tests/fixtures/h6-005/regression-selection.json').write_text(json.dumps({'portMap':ports,'files':rows,'executed':False},indent=2)+'\n')
print(' '.join(Path(r['derivative']).name for r in rows))
