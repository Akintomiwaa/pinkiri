import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {betaOriginAllowed,reserveBetaSql} from '../lib/beta-access.mjs';
test('only configured live origin or same-origin localhost is allowed',()=>{
 const check=(url,origin,configured='https://pinkiri.test')=>betaOriginAllowed(new Request(url,{headers:origin?{Origin:origin}:{}}),configured);
 assert.equal(check('https://pinkiri.test/api/research','https://pinkiri.test'),true);
 assert.equal(check('http://localhost:5173/api/research','http://localhost:5173'),true);
 for(const origin of [null,'https://evil.test','null'])assert.equal(check('https://pinkiri.test/api/research',origin),false);
 assert.equal(check('https://evil.test/api/research','https://evil.test'),false);
 assert.equal(check('https://pinkiri.test/api/research','https://pinkiri.test',''),false);
});
test('durable allowances enforce daily and lifetime caps without consuming denied requests',()=>{
 const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE beta_usage(id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL, created_at INTEGER NOT NULL)');
 const stmt=db.prepare(reserveBetaSql);
 const reserve=(action,now,day)=>stmt.get(action,now,action,3,action,day,2);
 assert.ok(reserve('research',10,0));assert.ok(reserve('research',20,0));assert.equal(reserve('research',30,0),undefined);
 assert.ok(reserve('chat',30,0));
 assert.ok(reserve('research',86400010,86400000));assert.equal(reserve('research',86400020,86400000),undefined);
 assert.equal(db.prepare("SELECT count(*) AS n FROM beta_usage WHERE action='research'").get().n,3);db.close();
});
