from pathlib import Path
import hashlib,json
r=Path(__file__).resolve().parents[1];out=r/'tests/fixtures/h6-003';rows=[]
plans=[('h2-011','h2011',{'55487':'61511','55490':'61515'}, {'../fixtures/h2-011/preservation-run.ts':'../fixtures/h6-003/regression-preservation-run.ts','../fixtures/h2-011/preservation.log':'../fixtures/h6-003/regression-preservation-v1.log'}),('h4-012','h4012',{'56601':'61512'},{}),('h3-014','h3014',{'55932':'61520','55933':'61521','55934':'61522','55937':'61523','55938':'61524','55939':'61525','55940':'61526'},{}),('h5-002','h5002',{'58701':'61513'}, {})]
for original,label,ports,paths in plans:
 a=r/f'tests/integration/postgres-{original}.test.ts';s=a.read_text()
 for before,after in ports.items():s=s.replace(before,after)
 for before,after in paths.items():assert before in s;s=s.replace(before,after)
 b=r/f'tests/integration/postgres-h6-003-regression-{label}.test.ts';assert not b.exists();b.write_text('// H6003 successor: exact original assertions; exclusive ports and relocated generated evidence only.\n'+s)
 rows.append({'original':str(a.relative_to(r)),'originalSHA256':hashlib.sha256(a.read_bytes()).hexdigest(),'successor':str(b.relative_to(r)),'successorSHA256':hashlib.sha256(b.read_bytes()).hexdigest(),'portSubstitutions':ports,'generatedEvidenceRelocations':paths,'assertionChanges':0})
p=out/'regression-provenance-v1.json';assert not p.exists();p.write_text(json.dumps(rows,indent=2)+'\n');print(len(rows))
