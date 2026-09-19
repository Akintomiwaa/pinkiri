import {betaOriginError,reserveBetaRequest} from '../../../lib/beta-access';
import {discoverCompetitors} from '../../../lib/competitor-discovery';
import {env} from 'cloudflare:workers';
import {z} from 'zod';

export async function POST(request:Request){
 const denied=betaOriginError(request);if(denied)return denied;
 const raw=await request.text();if(raw.length>12000)return Response.json({error:'Brand context too large.'},{status:413});
 let input;try{input=z.object({url:z.string().url(),name:z.string().max(200),summary:z.string().max(5000),audience:z.string().max(2000),region:z.string().max(60).optional()}).parse(JSON.parse(raw));}catch{return Response.json({error:'Valid brand context is required.'},{status:400});}
 const google=(typeof env!=='undefined'&&env?(env as unknown as Record<string,string>).GEMINI_API_KEY:undefined)||(typeof process!=='undefined'&&process.env?process.env.GEMINI_API_KEY:undefined)||(typeof globalThis!=='undefined'?(globalThis as Record<string,string>).GEMINI_API_KEY:undefined);
 const jinaKey=(typeof env!=='undefined'&&env?(env as unknown as Record<string,string>).JINA_API_KEY:undefined)||(typeof process!=='undefined'&&process.env?process.env.JINA_API_KEY:undefined)||(typeof globalThis!=='undefined'?(globalThis as Record<string,string>).JINA_API_KEY:undefined);
 if(!google)return Response.json({error:'Gemini API key is not configured.'},{status:503});
 const allowance=await reserveBetaRequest(request,'competitors');if(allowance)return allowance;
 try{const {pages,...result}=await discoverCompetitors(input,google,jinaKey);return Response.json(result)}catch(e){return Response.json({error:e instanceof Error?e.message:'Discovery failed.'},{status:502})}
}
