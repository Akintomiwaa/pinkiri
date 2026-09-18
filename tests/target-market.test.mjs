import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMarket,marketQuery,marketStorageSuffix} from '../lib/target-market.mjs';
test('target market defaults to Global and cannot inject search operators',()=>{
 assert.equal(normalizeMarket('  '),'Global');assert.equal(marketQuery('site:x.com invoices','Global'),'site:x.com invoices');
 assert.equal(marketQuery('site:x.com invoices','West Africa'),'site:x.com invoices "West Africa"');
 assert.equal(normalizeMarket('Nigeria" OR site:evil.test'),'Nigeria OR siteevil.test');
});
test('global browser workspaces keep existing keys; regional workspaces are separate',()=>{
 assert.equal(marketStorageSuffix('Global'),'');assert.equal(marketStorageSuffix('global'),'');
 assert.notEqual(marketStorageSuffix('Nigeria'),marketStorageSuffix('Ghana'));
});
