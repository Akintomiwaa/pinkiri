import test from 'node:test';
import assert from 'node:assert/strict';
import {isCompetitorCandidate,verifiedMatches} from '../lib/competitor-candidates.mjs';
test('discovery excludes own brand, credentials, private targets and invalid URLs',()=>{
 for(const url of ['https://www.brand.com','https://u:p@other.com','http://other.com','https://10.1.1.1','https://box.internal','https://box.local','not-a-url'])assert.equal(isCompetitorCandidate(url,'https://brand.com'),false,url);
 assert.equal(isCompetitorCandidate('https://competitor.com/invoicing','https://brand.com'),true);
});
test('competitors can only link to verified pages, with duplicate and invented indexes removed',()=>{
 const pages=[{url:'https://verified.com',title:'Official product'}];
 const result=verifiedMatches([{index:0,name:'Product',url:'https://invented.com'},{index:0,name:'duplicate'},{index:7,name:'invented'},{index:-1,name:'invalid'}],pages);
 assert.equal(result.length,1);assert.equal(result[0].url,pages[0].url);assert.equal(result[0].sourceTitle,'Official product');
 assert.deepEqual(verifiedMatches([{index:0}],[]),[]);
});
