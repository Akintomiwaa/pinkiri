import {z} from 'zod';
const profile=z.object({name:z.string(),summary:z.string(),audience:z.string(),pricing:z.string(),strengths:z.array(z.string())});
const basis=z.enum(['social evidence','homepage hypothesis','competitor evidence']);
export const researchPlanSchema=z.object({name:z.string(),category:z.string(),summary:z.string(),audience:z.string(),topics:z.array(z.object({keyword:z.string(),painPoint:z.string(),query:z.string(),homepageEvidence:z.string()})).min(3).max(5)});
export type ResearchPlan=z.infer<typeof researchPlanSchema>;
export const customerPainPointSchema=z.object({
 category:z.string(),
 painPoint:z.string(),
 severity:z.enum(['High','Medium','Low']),
 emotionalTrigger:z.string(),
 frequency:z.string(),
 quote:z.string(),
 sourceId:z.number().int().optional(),
 competitorVulnerability:z.string()
});
export type CustomerPainPoint=z.infer<typeof customerPainPointSchema>;

export const competitorTeardownSchema=z.object({
 name:z.string(),
 whatWorksWell:z.array(z.string()),
 topFormats:z.array(z.string()),
 messagingHooks:z.array(z.string()),
 vulnerabilities:z.array(z.string()),
 counterPositioningAngle:z.string()
});
export type CompetitorTeardown=z.infer<typeof competitorTeardownSchema>;

export const resultSchema=z.object({
 brand:profile,competitor:profile.nullable(),
 signals:z.array(z.object({sourceId:z.number().int(),relevance:z.enum(['direct product match','relevant category','unrelated','uncertain']),scope:z.enum(['brand','category','competitor']),speaker:z.enum(['customer/community','brand/creator','unclear']),theme:z.string(),finding:z.string(),quote:z.string(),sentiment:z.enum(['positive','negative','mixed','neutral','unclear'])})).max(15),
 customerPainPoints:z.array(customerPainPointSchema).optional().default([]),
 competitorTeardown:z.array(competitorTeardownSchema).optional().default([]),
 strategy:z.array(z.object({area:z.enum(['Product strategy','Marketing direction','Content strategy','Content structure']),title:z.string(),why:z.string(),actions:z.array(z.string()).min(1).max(5),measure:z.string(),priority:z.enum(['Now','Next','Later']),basis,sourceIds:z.array(z.number().int())})).min(4).max(12),
 drafts:z.array(z.object({format:z.string(),title:z.string(),content:z.string(),basis,sourceIds:z.array(z.number().int())})).min(2).max(6),
 calendar:z.array(z.object({day:z.string(),channel:z.string(),topic:z.string(),goal:z.string(),strategyIndex:z.number().int().nonnegative(),time:z.string().optional(),format:z.string().optional()})).min(4).max(10),
 unknowns:z.array(z.string())
});
export type ResearchSource={id:number;url:string;title:string;content:string;retrievedAt:string;publishedAt:string|null;kind:'homepage'|'social';platform:string;scope:string};
export type Coverage={platform:string;scope:string;query:string;searchedAt:string;window:string;found:number;read:number;status:string;urls:string[]};
export type Report=z.infer<typeof resultSchema>&{pipelineVersion?:number;targetMarket?:string;researchPlan?:ResearchPlan;discovery?:{competitors:{name:string;fit:string;reason:string;difference:string;url:string;sourceTitle:string}[];gaps:string[];query:string;searchedAt:string};sources:ResearchSource[];coverage:Coverage[];model:string;createdAt:string;cached:boolean};

