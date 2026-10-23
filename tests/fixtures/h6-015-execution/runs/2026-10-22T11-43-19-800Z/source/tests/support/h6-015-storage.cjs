// Official provider composition: migration is a separate, source-only command.
const path=require('node:path');
const root=process.env.H6015_STORAGE_SOURCE;
if(!root||process.env.SERVER_HOST!=='127.0.0.1'||process.env.PG_QUEUE_ENABLE!=='false')process.exit(3);
(async()=>{
 if(process.argv[2]==='migrate'){
  const {runMigrationsOnTenant}=require(path.join(root,'dist/internal/database/migrations'));
  await runMigrationsOnTenant({databaseUrl:process.env.DATABASE_URL});process.exit(0);
 }
 if(process.argv[2]!=='serve')process.exit(4);
 const {PgTenantConnection}=require(path.join(root,'dist/internal/database'));
 PgTenantConnection.poolManager.setNumWorkers(1);
 const build=require(path.join(root,'dist/app')).default;
 const app=build({logger:false,routerOptions:{maxParamLength:2500}});
 await app.listen({host:'127.0.0.1',port:Number(process.env.SERVER_PORT)});
 process.on('SIGTERM',()=>app.close().finally(()=>process.exit(0)));
})().catch(()=>process.exit(5));
