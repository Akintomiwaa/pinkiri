import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanDraft,citationIds,safePostUrl} from '../lib/publishable-text.mjs';
test('removes internal source markers and preserves readable copy',()=>{
 const text='A useful idea {source 1}. More detail [Source 2, 3].\n\nKeep going (Source 4).';
 assert.equal(cleanDraft(text),'A useful idea. More detail.\n\nKeep going.');
 assert.deepEqual(citationIds(text),[1,2,3,4]);
});
test('does not remove normal brackets, prices, numbered steps or trailing typing space',()=>{
 const text='1. Budget [estimate]: $100\n2. Hello ';
 assert.equal(cleanDraft(text),text);
 assert.deepEqual(citationIds('Sources reviewed: 2. [Source 1] {source 1}'),[1]);
});
test('published links reject script schemes and embedded credentials',()=>{
 for(const value of ['javascript:alert(1)','data:text/html,x','https://user:pass@example.com','not a link'])assert.equal(safePostUrl(value),null);
 assert.equal(safePostUrl('https://x.com/u/status/123'),'https://x.com/u/status/123');
});
