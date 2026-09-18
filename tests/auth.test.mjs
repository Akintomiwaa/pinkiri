import test from 'node:test';
import assert from 'node:assert/strict';
import {safeNext,sameOrigin,accountWorkspaceKey} from '../lib/auth/paths.mjs';
test('auth returns only to allowed local product routes',()=>{
 assert.equal(safeNext('/workspace?url=https%3A%2F%2Fexample.com&competitor='),'/workspace?url=https%3A%2F%2Fexample.com&competitor=');
 for(const value of ['https://evil.test','//evil.test','/\\evil.test','/auth/callback','/api/auth/logout','/login','/\nevil','/%2f%2fevil.test',null])assert.equal(safeNext(value),'/');
});
test('mutating authentication calls require an exact origin',()=>{
 const request=origin=>new Request('https://pinkiri.test/api/auth/login',{method:'POST',headers:origin?{Origin:origin}:{}});
 assert.equal(sameOrigin(request('https://pinkiri.test')),true);
 assert.equal(sameOrigin(request('https://evil.test')),false);
 assert.equal(sameOrigin(request(null)),false);
});
test('browser workspaces are namespaced by validated account ID',()=>{
 assert.notEqual(accountWorkspaceKey('a','https://example.com',''),accountWorkspaceKey('b','https://example.com',''));
 assert.notEqual(accountWorkspaceKey('a:workspace:x','y',''),accountWorkspaceKey('a','x:workspace:y',''));
});
