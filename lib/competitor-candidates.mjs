export function isCompetitorCandidate(value,brandUrl){
 try{const u=new URL(value),own=new URL(brandUrl).hostname.replace(/^www\./,'');const h=u.hostname.toLowerCase();return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&h.replace(/^www\./,'')!==own&&h.includes('.')&&/[a-z]/.test(h)&&!h.includes(':')&&!/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)&&!h.endsWith('.local')&&!h.endsWith('.internal');}catch{return false}
}
export function verifiedMatches(matches,pages){
 const seen=new Set();return matches.filter(m=>{if(!Number.isInteger(m.index)||!pages[m.index]||seen.has(m.index))return false;seen.add(m.index);return true}).map(m=>({name:m.name,fit:m.fit,reason:m.reason,difference:m.difference,url:pages[m.index].url,sourceTitle:pages[m.index].title}));
}
