import {z} from 'zod';
import {authClient,callbackOrigin} from '../../../../lib/auth/server';
import {safeNext,sameOrigin} from '../../../../lib/auth/paths.mjs';
export const dynamic='force-dynamic';
const inputSchema=z.object({email:z.string().email().max(254).optional(),password:z.string().max(128).optional(),next:z.string().max(3000).optional()});
const reply=(body:object,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request,{params}:{params:Promise<{action:string}>}){
 if(!sameOrigin(request))return reply({error:'Please submit this form from Pinkiri.'},403);
 const {action}=await params;if(!['login','signup','google','forgot','reset','logout'].includes(action))return reply({error:'Unknown action.'},404);
 const raw=await request.text();if(raw.length>5000)return reply({error:'Request too large.'},413);
 let input;try{input=inputSchema.parse(JSON.parse(raw));}catch{return reply({error:'Enter a valid email and password.'},400);}
 const client=await authClient();if(!client)return reply({error:'Sign-in is not connected yet. Please try again once account setup is complete.'},503);
 try{
 const next=safeNext(input.next),origin=callbackOrigin(request);
 const callback=origin+'/auth/callback?next='+encodeURIComponent(next);
 if(action==='logout'){const {error}=await client.auth.signOut({scope:'local'});if(error)return reply({error:'Could not sign out. Please retry.'},502);return reply({redirect:'/login?message=signed-out'});}
 if(action==='google'){const {data,error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:callback,skipBrowserRedirect:true}});if(error||!data.url)return reply({error:'Google sign-in is unavailable. Try email or contact the site owner.'},502);return reply({redirect:data.url});}
 if(action==='forgot'){
  if(!input.email)return reply({error:'Enter your email address.'},400);
  const {error}=await client.auth.resetPasswordForEmail(input.email,{redirectTo:origin+'/auth/callback?next=/reset-password'});
  if(error)return reply({error:'We could not send a reset email. Please try again later.'},429);
  return reply({message:'If an account exists for this email, you’ll receive a password reset link.'});
 }
 if(!input.password||(['signup','reset'].includes(action)&&input.password.length<12))return reply({error:'Use a password of at least 12 characters.'},400);
 if(action==='reset'){
  const {data:{user},error:identityError}=await client.auth.getUser();if(identityError||!user)return reply({error:'This reset link has expired. Request a new one.'},401);
  const {error}=await client.auth.updateUser({password:input.password});if(error)return reply({error:'Could not update your password. Try a different password or request a new link.'},400);
  await client.auth.signOut({scope:'local'});return reply({redirect:'/login?message=password-updated'});
 }
 if(!input.email)return reply({error:'Enter your email address.'},400);
 if(action==='signup'){
  const {data,error}=await client.auth.signUp({email:input.email,password:input.password,options:{emailRedirectTo:callback}});
  if(error)return reply({error:'Could not create an account. Try signing in, or try again later.'},400);
  if(data.session)return reply({redirect:next});
  return reply({message:'Check your email to confirm your account. If you already have an account, sign in or reset your password.'});
 }
 const {error}=await client.auth.signInWithPassword({email:input.email,password:input.password});
 if(error)return reply({error:'Unable to sign in. Check your email and password, and confirm your email first.'},401);
 return reply({redirect:next});
 }catch{return reply({error:'Sign-in is temporarily unavailable. Please try again.'},503);}
}
