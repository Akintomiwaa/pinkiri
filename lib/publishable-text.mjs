const markers=()=>/[\[{(]\s*sources?\s*#?\s*\d+(?:\s*(?:,|;|and|&)\s*(?:sources?\s*#?\s*)?\d+)*\s*[\]})]/gi;
export function citationIds(text){return [...new Set([...text.matchAll(markers())].flatMap(m=>(m[0].match(/\d+/g)||[]).map(Number)))];}
export function cleanDraft(text){return text.replace(markers(),'').replace(/[ \t]+([.,!?;:])/g,'$1').replace(/[ \t]{2,}/g,' ').replace(/[ \t]+\n/g,'\n');}
export function safePostUrl(value){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}}
