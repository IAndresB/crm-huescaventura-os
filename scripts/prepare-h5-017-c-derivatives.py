"""Explicit byte-preserving successors: harness import only; original assertions frozen."""
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1];rows=[]
for source,harness in [
 ('postgres-h5-018-audit.test.ts','h5-018-audit-isolated.ts'),
 ('postgres-h5-018-causes.test.ts','h5-018-audit-isolated.ts'),
 ('postgres-h5-017.test.ts','h5-diagnostic-isolated.ts'),
 ('postgres-h5-017-security.test.ts','h5-diagnostic-isolated.ts'),
]:
 p=root/'tests/integration'/source;b=p.read_bytes();before=b"from '../support/"+harness.encode()+b"'";after=b"from '../support/h5-diagnostic-corrected-isolated.ts'";assert b.count(before)==1
 changed=b.replace(before,after,1);name='postgres-h5-017-c-'+source.removeprefix('postgres-h5-').replace('018-','independent-').replace('017-','regression-');q=p.with_name(name)
 if q.exists():assert q.read_bytes()==changed
 else:q.write_bytes(changed)
 rows.append({'source':str(p.relative_to(root)),'sourceSha256':hashlib.sha256(b).hexdigest(),'derived':str(q.relative_to(root)),'derivedSha256':hashlib.sha256(changed).hexdigest(),'change':'one harness import; assertions byte-identical'})
(root/'tests/fixtures/h5-017-c/derived-tests.json').write_text(json.dumps(rows,indent=2)+'\n');print(json.dumps(rows,indent=2))
