// Origin checks prevent cross-site browser calls; they are not authentication.
export function betaOriginAllowed(request, appOrigin) {
 const url=new URL(request.url);
 const local=['localhost','127.0.0.1'].includes(url.hostname);
 return request.headers.get('origin')===url.origin && (local || (url.protocol==='https:' && url.origin===appOrigin));
}
export const betaLimits={research:{daily:3,total:5},competitors:{daily:2,total:3},chat:{daily:100,total:300}};
// One atomic SQLite statement: parallel requests cannot exceed either counter.
export const reserveBetaSql=`INSERT INTO beta_usage (action,created_at)
 SELECT ?,? WHERE
 (SELECT count(*) FROM beta_usage WHERE action=?) < ? AND
 (SELECT count(*) FROM beta_usage WHERE action=? AND created_at>=?) < ?
 RETURNING id`;
