import {createHash} from "node:crypto";

export interface StoredBytes {readonly bytes:Uint8Array;readonly media:string}
export interface PrivateStorage {
  put(reference:string,bytes:Uint8Array,media:string):Promise<void>;
  get(reference:string):Promise<StoredBytes|null>;
  inventory(prefix:string):Promise<readonly string[]>;
}
export function digest(bytes:Uint8Array):string {
  return createHash("sha256").update(bytes).digest("hex");
}

// Server-only credential. This adapter never returns an object URL or token.
export class SupabasePrivateStorage implements PrivateStorage {
  private readonly endpoint:string;
  private readonly bucket:string;
  private readonly credential:string;
  constructor(endpoint:string,bucket:string,credential:string) {
    const url=new URL(endpoint);
    if((url.protocol!=="https:" && !(url.protocol==="http:" && ["127.0.0.1","localhost"].includes(url.hostname)))
      ||url.username||url.password||url.search||url.hash||!bucket||!credential) throw new Error("STORAGE_CONFIGURATION_INVALID");
    this.endpoint=url.origin;this.bucket=bucket;this.credential=credential;
  }
  private path(reference:string):string {
    if(!/^[0-9a-f-]{36}\/[0-9a-f-]{36}$/.test(reference)) throw new Error("STORAGE_REFERENCE_INVALID");
    return `${encodeURIComponent(this.bucket)}/${reference}`;
  }
  async put(reference:string,bytes:Uint8Array,media:string):Promise<void> {
    const existing=await this.get(reference);
    if(existing) {
      if(digest(existing.bytes)!==digest(bytes)||existing.media!==media) throw new Error("STORAGE_CONTENT_CONFLICT");
      return;
    }
    const response=await fetch(`${this.endpoint}/object/${this.path(reference)}`,{
      method:"POST",headers:{Authorization:`Bearer ${this.credential}`,"Content-Type":media},
      body:Buffer.from(bytes)});
    if(!response.ok) {
      const raced=await this.get(reference);
      if(!raced||digest(raced.bytes)!==digest(bytes)||raced.media!==media) throw new Error("STORAGE_WRITE_FAILED");
    }
  }
  async get(reference:string):Promise<StoredBytes|null> {
    const response=await fetch(`${this.endpoint}/object/authenticated/${this.path(reference)}`,{
      headers:{Authorization:`Bearer ${this.credential}`},cache:"no-store"});
    if(response.status===404||response.status===400) {
      const failure=await response.json().catch(()=>null) as {code?:string}|null;
      if(failure?.code==="NoSuchKey"||failure?.code==="NotFound") return null;
    }
    if(!response.ok) throw new Error("STORAGE_READ_FAILED");
    return {bytes:new Uint8Array(await response.arrayBuffer()),media:response.headers.get("content-type")??""};
  }
  async inventory(prefix:string):Promise<readonly string[]> {
    if(!/^[0-9a-f-]{36}$/.test(prefix)) throw new Error("STORAGE_REFERENCE_INVALID");
    const result:string[]=[];
    for(let offset=0;;offset+=100) {
      const response=await fetch(`${this.endpoint}/object/list/${encodeURIComponent(this.bucket)}`,{
        method:"POST",headers:{Authorization:`Bearer ${this.credential}`,"Content-Type":"application/json"},
        body:JSON.stringify({prefix,limit:100,offset,sortBy:{column:"name",order:"asc"}})});
      if(!response.ok) throw new Error("STORAGE_INVENTORY_FAILED");
      const rows=await response.json() as {name:string;id:string|null}[];
      result.push(...rows.filter(r=>r.id!==null).map(r=>`${prefix}/${r.name}`));
      if(rows.length<100) return result;
    }
  }
}
