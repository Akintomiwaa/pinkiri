import {NextResponse} from 'next/server';
import {authClient} from '../../../lib/auth/server';
import {safeNext} from '../../../lib/auth/paths.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const url=new URL(request.url),client=await authClient();
 let destination='/login?message=invalid-link';
 if(client){try{
  const code=url.searchParams.get('code'),token=url.searchParams.get('token_hash'),type=url.searchParams.get('type');
  let success=false;
  if(code){const {error}=await client.auth.exchangeCodeForSession(code);success=!error;}
  else if(token&&(type==='signup'||type==='recovery')){const {error}=await client.auth.verifyOtp({token_hash:token,type});success=!error;}
  if(success)destination=type==='recovery'||url.searchParams.get('next')==='/reset-password'?'/reset-password':safeNext(url.searchParams.get('next'));
 }catch{}}
 const response=NextResponse.redirect(new URL(destination,url.origin),303);response.headers.set('Cache-Control','no-store');response.headers.set('Referrer-Policy','no-referrer');return response;
}
