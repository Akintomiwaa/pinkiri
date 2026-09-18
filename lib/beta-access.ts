import {env} from 'cloudflare:workers';
import {betaOriginAllowed,betaLimits,reserveBetaSql} from './beta-access.mjs';
type Action=keyof typeof betaLimits;
export function betaOriginError(request:Request){
 const vars=env as unknown as Record<string,string>;
 return betaOriginAllowed(request,vars.APP_ORIGIN||process.env.APP_ORIGIN)?null:Response.json({error:'Open Pinkiri on its published website to use this feature.'},{status:403});
}
export async function reserveBetaRequest(request:Request,action:Action){
 // Local development keeps its existing throttles, without using the launch budget.
 if(['localhost','127.0.0.1'].includes(new URL(request.url).hostname))return null;
 const db=(env as unknown as {DB?:D1Database}).DB;
 if(!db)return Response.json({error:'Testing is temporarily unavailable. Please try again later.'},{status:503});
 const now=Date.now(),day=Math.floor(now/86400000)*86400000,limits=betaLimits[action];
 try{
 const result=await db.prepare(reserveBetaSql).bind(action,now,action,limits.total,action,day,limits.daily).first();
 return result?null:Response.json({error:'The shared early-access testing allowance has been reached. Your saved work is still available. Please contact the Pinkiri team for the next testing slot.'},{status:429});
 }catch{console.error('Beta usage reservation unavailable');return Response.json({error:'Testing is temporarily unavailable. Your saved work is still available.'},{status:503});}
}
