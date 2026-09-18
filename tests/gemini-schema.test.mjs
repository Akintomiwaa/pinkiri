import test from 'node:test';
import assert from 'node:assert/strict';
import {z} from 'zod';
import {geminiSchema} from '../lib/gemini-schema.ts';
test('provider schema preserves required fields, enums, nullable profiles while avoiding unsupported nested array bounds',()=>{
 const schema=geminiSchema(z.object({drafts:z.array(z.object({format:z.enum(['X','Video']),sourceId:z.number().int()})).length(3),competitor:z.object({name:z.string()}).nullable()}));
 assert.deepEqual(schema.required,['drafts','competitor']);
 assert.equal(schema.properties.drafts.minItems,undefined);assert.equal(schema.properties.drafts.maxItems,undefined);
 assert.equal(z.array(z.string()).length(3).safeParse(['one']).success,false);
 assert.deepEqual(schema.properties.drafts.items.properties.format.enum,['X','Video']);
 assert.equal(schema.properties.competitor.anyOf[1].type,'null');
});
