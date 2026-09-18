import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {env} from 'cloudflare:workers';
// Authentication is paused at the owner's request. No provider calls until re-enabled.
const AUTH_ENABLED = false;
export function authConfig(){
 if(!AUTH_ENABLED)return null;
 const vars=env as unknown as Record<string,string>;
 const url=vars.SUPABASE_URL||process.env.SUPABASE_URL;
 const key=vars.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return null;
 try{if(new URL(url).protocol!=='https:')return null;}catch{return null;}
 return {url,key};
}
export async function authClient(){
 const config=authConfig();if(!config)return null;
 const store=await cookies();
 return createServerClient(config.url,config.key,{cookieOptions:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/'},cookies:{getAll:()=>store.getAll(),setAll(values){try{values.forEach(({name,value,options})=>store.set(name,value,options));}catch{/* Page cookies are refreshed by proxy. */}}}});
}
export async function currentUser(){const client=await authClient();if(!client)return null;try{const {data,error}=await client.auth.getUser();return error?null:data.user;}catch{return null;}}
export function callbackOrigin(request:Request){
 const vars=env as unknown as Record<string,string>;const configured=vars.APP_ORIGIN||process.env.APP_ORIGIN;
 if(configured){const u=new URL(configured);if(u.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(u.hostname))throw Error('Invalid application origin');return u.origin;}
 const u=new URL(request.url);if(['localhost','127.0.0.1'].includes(u.hostname))return u.origin;
 throw Error('Set APP_ORIGIN before enabling hosted authentication.');
}
