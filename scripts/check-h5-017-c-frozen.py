from pathlib import Path
from tempfile import TemporaryDirectory
import shutil,subprocess,hashlib
r=Path(__file__).resolve().parents[1]
with TemporaryDirectory(prefix='crm-h5017-c-frozen-')as d:
 for name in ['package.json','pnpm-lock.yaml']:
  shutil.copy2(r/name,Path(d)/name)
 before=hashlib.sha256((r/'pnpm-lock.yaml').read_bytes()).hexdigest()
 subprocess.run(['pnpm','install','--frozen-lockfile','--ignore-scripts'],cwd=d,check=True)
 assert hashlib.sha256((Path(d)/'pnpm-lock.yaml').read_bytes()).hexdigest()==before
 print('C frozen install lock unchanged',before)
