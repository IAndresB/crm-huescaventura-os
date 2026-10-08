// Loopback-only PostgreSQL wire fault, outside the TTE facade. Never logs SQL,
// envelopes, keys or credentials. Withholds the real COMMIT acknowledgement
// and substitutes a simulated transport error, after PostgreSQL has committed.
import {createServer,connect,type Socket} from 'node:net';
export async function commitResponseLoss(targetPort:number){
 const sockets=new Set<Socket>();let dropped=false;
 const server=createServer(client=>{
  const upstream=connect(targetPort,'127.0.0.1');sockets.add(client);sockets.add(upstream);
  let front=Buffer.alloc(0),back=Buffer.alloc(0),startup=true,pending=false;
  const close=()=>{client.destroy();upstream.destroy();sockets.delete(client);sockets.delete(upstream);};
  client.on('error',close);upstream.on('error',close);client.on('close',close);upstream.on('close',close);
  client.on('data',chunk=>{
   front=Buffer.concat([front,chunk]);
   if(startup&&front.length>=4){const size=front.readInt32BE(0);if(front.length<size)return;upstream.write(front.subarray(0,size));front=front.subarray(size);startup=false;}
   while(!startup&&front.length>=5){const size=1+front.readInt32BE(1);if(front.length<size)break;const packet=front.subarray(0,size);front=front.subarray(size);
    if(packet[0]===81&&packet.subarray(5).toString('utf8').includes('b08_work_finalize')&&!dropped)pending=true;
    upstream.write(packet);
   }
  });
  upstream.on('data',chunk=>{
   back=Buffer.concat([back,chunk]);
   while(back.length>=5){const size=1+back.readInt32BE(1);if(back.length<size)break;const packet=back.subarray(0,size);back=back.subarray(size);
    if(pending&&packet[0]===67&&packet.subarray(5).toString('utf8')==='COMMIT\0'){dropped=true;pending=false;const body=Buffer.from('SERROR\0C08006\0Msimulated-commit-acknowledgement-loss\0\0');const header=Buffer.alloc(5);header[0]=69;header.writeInt32BE(body.length+4,1);client.write(Buffer.concat([header,body]));continue;}
    client.write(packet);
   }
  });
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address();if(!address||typeof address==='string')throw new Error('WORK_RELAY_START_FAILED');
 return {port:address.port,dropped:()=>dropped,close:async()=>{for(const socket of sockets)socket.destroy();await new Promise<void>(resolve=>server.close(()=>resolve()));}};
}
