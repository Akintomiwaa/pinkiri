import test from 'node:test';
import assert from 'node:assert/strict';
import {SocialResearch,socialPlatform,validateEvidence} from '../lib/social-research.mjs';
test('accepts only supported public individual posts',()=>{
 assert.equal(socialPlatform('https://www.reddit.com/r/test/comments/abc/topic'),null);
 assert.equal(socialPlatform('https://x.com/person/status/123'),'X');
 for(const u of ['https://x.com/person','https://reddit.com.evil.com/r/x/comments/123','https://127.0.0.1/comments/x','https://instagram.com/accounts/login','https://user:pass@x.com/a/status/123'])assert.equal(socialPlatform(u),null);
});
test('collects actual page text, applies recent search filter and caches collection',async()=>{
 let calls=0;const collector=new SocialResearch();
 const call=async(endpoint,body)=>{calls++;if(endpoint==='search'){assert.equal(body.tbs,'qdr:m');return {data:{web:[{url:'https://x.com/example/status/123',description:'not evidence'}]}};}return {data:{markdown:'Actual community discussion '.repeat(10),metadata:{title:'Community'}}};};
 const result=await collector.collect({name:'Brand',category:'Task software'},call);
 assert.equal(result.sources.length,1);assert.match(result.sources[0].content,/Actual community/);assert.equal(result.sources[0].publishedAt,null);assert.equal(result.coverage.length,9);
 const count=calls;await collector.collect({name:'Brand',category:'Task software'},call);assert.equal(calls,count);
});
test('quota stops remaining collection and failed calls are not cached',async()=>{
 const collector=new SocialResearch();let calls=0;
 const call=async()=>{calls++;throw Object.assign(Error('quota'),{quota:true})};
 const result=await collector.collect({name:'Brand',category:'Software'},call);
 assert.equal(calls,1);assert.equal(result.sources.length,0);assert.match(result.coverage[1].status,/Skipped/);
 await collector.collect({name:'Brand',category:'Software'},call);assert.equal(calls,2);
});
test('search snippets and unreadable pages never become evidence',async()=>{
 const collector=new SocialResearch();const result=await collector.collect({name:'Brand',category:'Software'},async endpoint=>endpoint==='search'?{data:{web:[{url:'https://x.com/u/status/123',description:'Invented amazing customer quote'}]}}:{data:{markdown:'Login',metadata:{statusCode:403}}});assert.equal(result.sources.length,0);
});
test('rejects invented source IDs and homepage-only social claims; removes fabricated quotes',()=>{
 const sources=[{id:1,kind:'homepage',content:'Product'},{id:2,kind:'social',content:'I need better offline access.'}];
 const result={signals:[{sourceId:2,quote:'Not actually said'}],strategy:[{basis:'social evidence',sourceIds:[2]}],drafts:[]};
 validateEvidence(result,sources);assert.equal(result.signals[0].quote,'');
 assert.throws(()=>validateEvidence({...result,strategy:[{basis:'social evidence',sourceIds:[1]}]},sources));
 assert.throws(()=>validateEvidence({...result,drafts:[{basis:'homepage hypothesis',sourceIds:[99]}]},sources));
 assert.throws(()=>validateEvidence({...result,signals:[{sourceId:1,quote:''}]},sources));
});
test('unrelated namesakes cannot become findings or support a strategy',()=>{
 const sources=[{id:2,kind:'social',content:'A different Ploy'}];
 const signals=[{sourceId:2,relevance:'unrelated',finding:'A personal namesake',quote:''}];
 assert.equal(validateEvidence({signals,strategy:[],drafts:[]},sources).signals.length,0);
 assert.throws(()=>validateEvidence({signals,strategy:[{basis:'social evidence',sourceIds:[2]}],drafts:[]},sources));
});

test('topic-first research covers customer jobs without requiring a brand mention',async()=>{
 const queries=[];
 const collector=new SocialResearch();
 const plan={name:'Ploy',category:'WhatsApp back office',topics:[{keyword:'bookkeeping',query:'marketing copy should not be searched'},{keyword:'unpaid invoices',query:'freelancers chasing unpaid invoices'},{keyword:'multi currency',query:'multi currency invoice fees'}]};
 await collector.collect(plan,async(endpoint,body)=>{if(endpoint==='search')queries.push(body.query);return {data:{web:[]}}});
 assert.equal(queries.length,9);
 assert.match(queries[0],/bookkeeping/);assert.match(queries[2],/multi currency/);
 assert.ok(queries.every(q=>!q.includes('reddit.com')));assert.ok(queries.every(q=>!q.includes('marketing copy')));assert.ok(queries.slice(0,8).every(q=>!q.includes('Ploy')));assert.ok(queries[8].includes('Ploy'));
});
test('a competitor-backed recommendation needs an actual competitor document',()=>{
 const result={signals:[],strategy:[{basis:'competitor evidence',sourceIds:[1]}],drafts:[]};
 assert.throws(()=>validateEvidence(result,[{id:1,kind:'homepage',scope:'brand',content:'Brand'}]));
 assert.doesNotThrow(()=>validateEvidence(result,[{id:1,kind:'homepage',scope:'competitor',content:'Competitor'}]));
});


test('expanded collection bounds requests, covers competitors and removes identical text',async()=>{
 const collector=new SocialResearch();let searches=0,reads=0;
 const result=await collector.collect({name:'Brand',category:'Software',topics:Array.from({length:5},(_,i)=>({keyword:'job '+i,query:'job'})),competitors:[{name:'Rival'}]},async(endpoint,body)=>{
  if(endpoint==='search'){searches++; const platform=body.query.includes('instagram.com')?'ig':body.query.includes('tiktok.com')?'tt':'x';return {data:{web:Array.from({length:5},(_,i)=>({url:platform==='ig'?`https://instagram.com/p/${searches}-${i}`:platform==='tt'?`https://tiktok.com/@u/video/${searches}${i}`:`https://x.com/u/status/${searches}${i}`}))}};}
  reads++;return {data:{markdown:'The same repeated community conversation with enough content to meet the readable page minimum. '.repeat(3)}};
 });
 assert.ok(searches<=12);assert.ok(reads<=18);assert.equal(result.sources.length,1);
 assert.ok(result.coverage.some(c=>c.scope==='competitor'));
 assert.ok(result.coverage.some(c=>c.scope==='competitor'&&!c.status.includes('Skipped')));
});

test('regional searches include the market and never reuse global cached evidence',async()=>{
 const queries=[];const collector=new SocialResearch();
 const call=async(endpoint,body)=>{queries.push(body.query);return {data:{web:[]}}};
 const plan={name:'Example',category:'Scheduling',topics:[{keyword:'appointments',query:'missed appointments'}]};
 await collector.collect(plan,call);const globalCount=queries.length;
 await collector.collect({...plan,region:'Nigeria'},call);
 assert.ok(queries.length>globalCount);
 assert.ok(queries.slice(globalCount).every(query=>query.endsWith('"Nigeria"')));
 const regionalCount=queries.length;await collector.collect({...plan,region:'Nigeria'},call);assert.equal(queries.length,regionalCount);
});
