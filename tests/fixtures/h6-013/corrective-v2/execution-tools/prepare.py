import pathlib,json,shutil,subprocess,tempfile,datetime
O=pathlib.Path(__file__).parent;R=pathlib.Path('/Users/andres/Developer/crm-huescaventura-os');C=pathlib.Path('/Users/andres/Documents/CRM_HUESCAVENTURA_AUDIT_CUSTODY/H6-013-pre-v2-20261020T162705Z');W=pathlib.Path(tempfile.mkdtemp(prefix='h6013-v2-',dir='/private/tmp'));P=W/'repo';P.mkdir()
files={**json.loads((O/'tracked-before.json').read_text()),**json.loads((C/'v1-inventory.json').read_text())}
for rel in files:
 d=P/rel;d.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/rel,d)
(P/'.git').mkdir()
for f in ['HEAD','config','index','packed-refs','shallow']:
 if (R/'.git'/f).exists():shutil.copy2(R/'.git'/f,P/'.git'/f)
shutil.copytree(R/'.git/refs',P/'.git/refs');(P/'.git/objects').symlink_to(R/'.git/objects',target_is_directory=True)
def clone(s,d):subprocess.run(['/bin/cp','-cR',str(s),str(d)],check=True)
clone(R/'node_modules',P/'node_modules')
for f in ['home','tmp']:(W/f).mkdir()
prior=pathlib.Path('/private/tmp/h6013-audit2-2hzmuc3q');clone(prior/'npm-cache',W/'npm-cache');st='crm-supabase-storage-5def1dfc15ab7f08fe271c7d1e70542424524e4e';clone(prior/'tmp'/st,W/'tmp'/st)
profile='(version 1)\n(allow default)\n(deny file-write*)\n(allow file-write* (subpath '+json.dumps(str(W))+') (subpath '+json.dumps(str(O))+') (literal "/dev/null") (literal "/dev/tty"))\n(deny network-outbound)\n(allow network-outbound (remote ip "localhost:*"))\n(allow network-outbound (remote unix-socket))\n';(W/'sandbox.sb').write_text(profile)
env={'PATH':'/Users/andres/.openclaw/bin:/usr/bin:/bin:/usr/sbin:/sbin','HOME':str(W/'home'),'TMPDIR':str(W/'tmp'),'LC_ALL':'C','CI':'1','AI_AGENT':'codex','GIT_OPTIONAL_LOCKS':'0','COREPACK_HOME':'/Users/andres/.cache/node/corepack','COREPACK_ENABLE_NETWORK':'0','POSTGRES_H0_BIN':'/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin','npm_config_cache':str(W/'npm-cache'),'npm_config_offline':'true','npm_config_update_notifier':'false'}
(O/'replica-plan.json').write_text(json.dumps({'createdUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'workspace':str(W),'replica':str(P),'environment':env,'sandbox':profile},indent=2)+'\n');print(W,flush=True)
