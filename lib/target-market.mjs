export function normalizeMarket(value){return typeof value==='string'?value.replace(/[^\p{L}\p{N} ,.-]/gu,'').replace(/\s+/g,' ').trim().slice(0,60)||'Global':'Global';}
export function marketQuery(query,market){const value=normalizeMarket(market);return value.toLowerCase()==='global'?query:query+' "'+value+'"';}
export function marketStorageSuffix(market){const value=normalizeMarket(market);return value.toLowerCase()==='global'?'':':market:'+encodeURIComponent(value.toLowerCase());}
