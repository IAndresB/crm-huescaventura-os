import os,sys,subprocess,json,pathlib,time,secrets,urllib.request,shutil,hashlib
root=pathlib.Path.cwd();out=root/'audit/h6-005/runs'/('attempt-'+sys.argv[1]);out.mkdir(parents=True,exist_ok=False)
base=pathlib.Path('/tmp/h65a');run=base/('run'+sys.argv[1]);run.mkdir();(run/'socket').mkdir();bin='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin';node='/Users/andres/.openclaw/bin/node';env={'PATH':'/Users/andres/.openclaw/bin:/usr/bin:/bin','TMPDIR':str(run),'LANG':'C','POSTGRES_H0_BIN':bin,'AUDIT_OUT':str(out)}
def native(args):
 p=subprocess.run([bin+'/'+args[0],*args[1:]],env=env,capture_output=True,text=True);(out/(args[0]+'.stdout')).write_text(p.stdout);(out/(args[0]+'.stderr')).write_text(p.stderr);assert p.returncode==0,(p.stdout,p.stderr)
started=False;server=None
try:
 native(['initdb','-D',str(run/'data'),'--username=postgres','--auth-local=trust','--auth-host=trust','--no-locale','--encoding=UTF8']);native(['pg_ctl','-D',str(run/'data'),'-l',str(run/'postgres.log'),'-o',f'-k {run}/socket -h 127.0.0.1 -p 61400','-w','start']);started=True
 cfg={'SERVER_HOST':'127.0.0.1','SERVER_PORT':'61401','SERVER_ADMIN_PORT':'61402','DATABASE_URL':'postgresql://postgres@127.0.0.1:61400/postgres','DB_INSTALL_ROLES':'true','AUTH_JWT_SECRET':secrets.token_hex(32),'AUTH_ENCRYPTION_KEY':secrets.token_hex(16),'STORAGE_BACKEND':'file','STORAGE_FILE_BACKEND_PATH':str(run/'objects'),'STORAGE_S3_BUCKET':'synthetic-private','STORAGE_S3_REGION':'local','SERVER_REGION':'local','PG_QUEUE_ENABLE':'false','S3_PROTOCOL_ENABLED':'false','VECTOR_ENABLED':'false','ICEBERG_ENABLED':'false','IMAGE_TRANSFORMATION_ENABLED':'false','LOG_LEVEL':'silent','NODE_ENV':'production'}
 config=run/'runtime.env';config.write_text('\n'.join(k+'='+v for k,v in cfg.items()));config.chmod(0o600)
 log=open(out/'storage.log','w');server=subprocess.Popen([node,'dist/start/server.js'],cwd=base/'storage',env={**env,**cfg},stdout=log,stderr=log)
 for i in range(150):
  assert server.poll() is None,'STORAGE_EXITED'
  try:
   if urllib.request.urlopen('http://127.0.0.1:61401/status').status==200:break
  except Exception:time.sleep(.15)
 else:raise Exception('STORAGE_UNREADY')
 testenv={**env,'STORAGE_H1_ENDPOINT':'http://127.0.0.1:61401','STORAGE_H1_RUNTIME':str(base/'storage'),'STORAGE_H1_CONFIG':str(config)}
 shutil.copy2(root/'tests/integration/audit-h6005-original.test.ts',out/'instrument.ts')
 cmd=[node,'--test','--experimental-strip-types','tests/integration/audit-h6005-original.test.ts'];p=subprocess.run(cmd,cwd=root,env=testenv,capture_output=True,text=True)
 (out/'test.stdout.log').write_text(p.stdout);(out/'test.stderr.log').write_text(p.stderr);(out/'status.json').write_text(json.dumps({'command':cmd,'status':p.returncode,'environmentNames':sorted(testenv),'resources':[61400,61401,61402,61403],'originalInstrumentSHA256':hashlib.sha256((root/cmd[-1]).read_bytes()).hexdigest()},indent=2)+'\n');print(p.stdout[-10000:]);print(p.stderr[-2000:]);sys.exit(p.returncode)
finally:
 if server:
  server.terminate()
  try:server.wait(10)
  except subprocess.TimeoutExpired:server.kill();server.wait()
 if started:native(['pg_ctl','-D',str(run/'data'),'-m','fast','-w','stop'])
 if (run/'postgres.log').exists():shutil.copy2(run/'postgres.log',out/'storage-postgres.log')
 if (run/'runtime.env').exists():(run/'runtime.env').unlink()
