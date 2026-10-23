import json,re
from pathlib import Path
R=Path(__file__).resolve().parent.parent;j=json.loads((R/'tests/fixtures/h6-004/verification-v2.json').read_text());latest={}
for p in j['allExecutedCases']:
 if p['status']=='PASS':latest[p['file'].replace('h6004compat-','')]=p
m={
29:[('h4-012','MO03'),('h4-012','MO04'),('h6-004','A02|A03')],
30:[('h4-012','MO09'),('h4-012','MO08'),('h4-012-supplement','R14 change')],
31:[('h6-004','A01|A04|A13|B04|B13'),('h4-012-supplement','R11 cancelS1')],
32:[('h6-004','A06'),('h4-014','C01/C05'),('h6-004-ac032','S01 AC032')],
33:[('h6-004','N01'),('h4-014','AC-033')],
34:[('h4-014','C01/C05'),('h4-014','C01/C06')],
35:[('h6-004','A08|A09|A10|A12|B10|B12'),('h4-016','R15 AC035|R32|R08 normally')],
36:[('h4-018','.*'),('h5-013','N04')],
37:[('h4-014','C07 PM07 fixed900 partial')],
38:[('h3-013','A150/B120'),('h3-014','^R0(?:25|26|30|31|43|46|47)$')],
39:[('h4-014','C08 AC039')],
40:[('h6-004','B04|B05|B06|B07|B08'),('h4-014','C09/C10')],
41:[('h4-014','C11 AC041|C13 express'),('h4-012-supplement','R06 default Booking')],
42:[('h6-004','N01'),('h4-014','C12 AC042'),('h3-002','^R(?:08|09|10|11|12) ')],
43:[('h4-012-supplement','R06 AC043'),('h4-014','C16/C28 S2|C28 determination')],
60:[('h5-013','N05/N15|N15: operational|N03:'),('h5-015','J02 critical exception'),('h6-004','A10|B10')],
61:[('h5-015','J04/J05'),('h5-015-concurrency','.*')],
62:[('h1-003','I01-I03'),('h1-004','R01-R04|R05-R07|R06:'),('h5-013','N01: canonical')],
63:[('h4-023','C exceptional|HA exact|J actual|L linked correction'),('h4-016','R13 AC063|R13 actual')]
}
rows=[]
for ac,patterns in m.items():
 refs=[]
 for short,pat in patterns:
  p=latest['postgres-'+short+'.test.ts'];matches=[v for n,v in p['passCases'].items() if re.search(pat,n)]
  assert matches,(ac,short,pat)
  refs += [{**v,'sourceTest':'tests/integration/'+p['file'],'inputManifest':p['inputManifest'],'kind':'integrated' if short=='h6-004' else 'targeted-regression'} for v in matches]
 rows.append({'ac':f'AC-{ac:03}','status':'PASS','executedReferences':refs,'boundary':'Regressions keep their own fixture/version/root; not all branches are the same A/B Booking.'})
out=R/'tests/fixtures/h6-004/coverage-matrix-v2.json';out.write_text(json.dumps({'directTaskAssignment':'E2E-04','primaryACCount':len(rows),'executedReferencePositions':sum(len(r['executedReferences']) for r in rows),'rows':rows},indent=2,ensure_ascii=False)+'\n')
print(len(rows),sum(len(r['executedReferences']) for r in rows))
