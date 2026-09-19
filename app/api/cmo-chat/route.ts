import {betaOriginError,reserveBetaRequest} from '../../../lib/beta-access';
import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {GeminiRouter} from '../../../lib/research-resilience.mjs';
const router=new GeminiRouter();
export async function POST(request:Request){
 const denied=betaOriginError(request);if(denied)return denied;
 const raw=await request.text();if(raw.length>80000)return Response.json({error:'Context is too large.'},{status:413});
 let input;try{input=z.object({question:z.string().min(1).max(2000),context:z.string().max(60000),history:z.array(z.object({role:z.enum(['user','assistant']),text:z.string().max(6000)})).max(8)}).parse(JSON.parse(raw));}catch{return Response.json({error:'Enter a shorter question.'},{status:400});}
 const key=(typeof env!=='undefined'&&env?(env as unknown as Record<string,string>).GEMINI_API_KEY:undefined)||(typeof process!=='undefined'&&process.env?process.env.GEMINI_API_KEY:undefined)||(typeof globalThis!=='undefined'?(globalThis as Record<string,string>).GEMINI_API_KEY:undefined);
 if(!key)return Response.json({error:'Gemini is not configured on the server.'},{status:503});
 const allowance=await reserveBetaRequest(request,'chat');if(allowance)return allowance;
 try{
  const systemPrompt = `You are Pinkiri CMO — an elite, evidence-led fractional CMO and growth strategist.
Your mission is to help the founder/marketer deeply understand their customers, dissect competitors (both what works well and their hidden vulnerabilities), uncover psychological pain points, and craft high-converting campaigns.

CRITICAL BEHAVIOR:
1. Deep Probing & Customer Psychology: When analyzing customer problems, uncover the root emotional triggers (e.g. status anxiety, fear of looking unprofessional, cash flow paralysis, subscription lockouts), not just surface features.
2. Balanced Competitor Analysis: Recognize what competitors do well (so the brand respects the benchmark) while pinpointing exact gaps, pricing traps, or support failures where the brand can win.
3. Grounded in Workspace: Reference customerPainPoints, competitorTeardown, brand documents, and verified sources using [Source N]. Separate proven evidence from hypotheses.
4. Actionable & High-Impact: Provide concrete hooks, scene breakdowns, positioning angles, and validation experiments rather than generic advice.
5. Follow-Up Probing Suggestions: End substantive responses with 2-3 short, high-value suggested follow-up questions formatted as:
💡 **Suggested Probes:**
- [Question 1]
- [Question 2]
- [Question 3]

Maintain an authoritative, sharp, and encouraging executive tone. Plain text/markdown formatting.`;

  const result=await router.run(model=>fetch('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent',{method:'POST',headers:{'x-goog-api-key':key,'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:systemPrompt}]},contents:[{role:'user',parts:[{text:JSON.stringify(input)}]}],generationConfig:{maxOutputTokens:4000}}),signal:AbortSignal.timeout(60000)}));
 if(!result)return Response.json({error:'Gemini is temporarily unavailable. Your workspace is saved; try again later.'},{status:503});
 if(!result.response.ok)return Response.json({error:result.response.status===429?'Gemini quota reached. Try again when your quota resets.':'Gemini could not answer right now.'},{status:502});
 const d=await result.response.json() as {candidates?:{content?:{parts?:{text?:string}[]}}[]};
 const answer=d.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('');if(!answer)throw Error();
 return Response.json({answer});
 }catch{return Response.json({error:'The CMO could not answer. Please try again.'},{status:502});}
}
