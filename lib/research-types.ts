import {z} from 'zod';
const profile=z.object({name:z.string(),summary:z.string(),audience:z.string(),pricing:z.string(),strengths:z.array(z.string())});
const basis=z.string().catch('homepage hypothesis');
export const researchPlanSchema=z.object({name:z.string(),category:z.string(),summary:z.string(),audience:z.string(),topics:z.array(z.object({keyword:z.string(),painPoint:z.string(),query:z.string(),homepageEvidence:z.string()})).min(1).max(8)});
export type ResearchPlan=z.infer<typeof researchPlanSchema>;
export const customerPainPointSchema=z.object({
 category:z.string().catch('General'),
 painPoint:z.string().catch(''),
 severity:z.string().catch('Medium').transform(s=>['High','Low','Medium'].find(x=>x.toLowerCase()===s.toLowerCase())||'Medium'),
 emotionalTrigger:z.string().catch(''),
 frequency:z.string().catch(''),
 quote:z.string().catch(''),
 sourceId:z.number().int().optional(),
 competitorVulnerability:z.string().catch('')
});
export type CustomerPainPoint=z.infer<typeof customerPainPointSchema>;

export const competitorTeardownSchema=z.object({
 name:z.string().catch('Competitor'),
 whatWorksWell:z.array(z.string()).catch([]),
 topFormats:z.array(z.string()).catch([]),
 messagingHooks:z.array(z.string()).catch([]),
 vulnerabilities:z.array(z.string()).catch([]),
 counterPositioningAngle:z.string().catch('')
});
export type CompetitorTeardown=z.infer<typeof competitorTeardownSchema>;

export const resultSchema=z.object({
 brand:profile,competitor:profile.nullable().catch(null),
 signals:z.array(z.object({sourceId:z.number().int().catch(1),relevance:z.string().catch('relevant category'),scope:z.string().catch('category'),speaker:z.string().catch('customer/community'),theme:z.string().catch(''),finding:z.string().catch(''),quote:z.string().catch(''),sentiment:z.string().catch('neutral')})).catch([]),
 customerPainPoints:z.array(customerPainPointSchema).optional().default([]),
 competitorTeardown:z.array(competitorTeardownSchema).optional().default([]),
 strategy:z.array(z.object({area:z.string().catch('Marketing direction'),title:z.string().catch(''),why:z.string().catch(''),actions:z.array(z.string()).catch([]),measure:z.string().catch(''),priority:z.string().catch('Next').transform(s=>['Now','Next','Later'].find(x=>x.toLowerCase()===s.toLowerCase())||'Next'),basis,sourceIds:z.array(z.number().int()).catch([])})).min(1),
 drafts:z.array(z.object({format:z.string().catch('Post'),title:z.string().catch(''),content:z.string().catch(''),basis,sourceIds:z.array(z.number().int()).catch([])})).min(1),
 calendar:z.array(z.object({day:z.string().catch('Day 1'),channel:z.string().catch('Social'),topic:z.string().catch(''),goal:z.string().catch(''),strategyIndex:z.number().int().catch(0),time:z.string().optional(),format:z.string().optional()})).catch([]),
 unknowns:z.array(z.string()).catch([])
});
export type ResearchSource={id:number;url:string;title:string;content:string;retrievedAt:string;publishedAt:string|null;kind:'homepage'|'social';platform:string;scope:string};
export type Coverage={platform:string;scope:string;query:string;searchedAt:string;window:string;found:number;read:number;status:string;urls:string[]};
export type Report=z.infer<typeof resultSchema>&{pipelineVersion?:number;targetMarket?:string;researchPlan?:ResearchPlan;discovery?:{competitors:{name:string;fit:string;reason:string;difference:string;url:string;sourceTitle:string}[];gaps:string[];query:string;searchedAt:string};sources:ResearchSource[];coverage:Coverage[];model:string;createdAt:string;cached:boolean};

