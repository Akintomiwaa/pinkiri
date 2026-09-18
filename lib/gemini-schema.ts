import {z} from 'zod';
// Keep the provider's output contract aligned with the application's validator.
export function geminiSchema(schema:z.ZodTypeAny):Record<string,unknown>{
 if(schema instanceof z.ZodOptional)return geminiSchema(schema.unwrap());
 if(schema instanceof z.ZodDefault)return geminiSchema(schema.removeDefault());
 if(schema instanceof z.ZodEffects)return geminiSchema(schema.innerType());
 if(schema instanceof z.ZodObject){
   const shape=schema.shape;
   const properties:Record<string,unknown>={};
   const required:string[]=[];
   for(const [key,val] of Object.entries(shape)){
     properties[key]=geminiSchema(val as z.ZodTypeAny);
     if(!(val instanceof z.ZodOptional))required.push(key);
   }
   return {type:'object',properties,required:required.length?required:Object.keys(shape)};
 }
 // Gemini rejects some nested report schemas with bounded arrays (HTTP 400).
 // Enforce cardinality with Zod after generation, not in the wire schema.
 if(schema instanceof z.ZodArray)return {type:'array',items:geminiSchema(schema.element)};
 if(schema instanceof z.ZodNullable)return {anyOf:[geminiSchema(schema.unwrap()),{type:'null'}]};
 if(schema instanceof z.ZodEnum)return {type:'string',enum:schema.options};
 if(schema instanceof z.ZodString)return {type:'string'};
 if(schema instanceof z.ZodNumber)return {type:schema.isInt?'integer':'number'};
 if(schema instanceof z.ZodBoolean)return {type:'boolean'};
 if(schema instanceof z.ZodUnion)return {anyOf:schema.options.map(geminiSchema)};
 return {type:'string'};
}

