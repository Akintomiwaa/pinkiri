import {sqliteTable,integer,text,index} from 'drizzle-orm/sqlite-core';
// Small durable counters protect the no-login testing release across Worker instances.
export const betaUsage=sqliteTable('beta_usage',{
 id:integer('id').primaryKey({autoIncrement:true}),
 action:text('action').notNull(),
 createdAt:integer('created_at').notNull(),
},table=>[index('beta_usage_action_time').on(table.action,table.createdAt)]);
