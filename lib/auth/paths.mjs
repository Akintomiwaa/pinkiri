/** Keep post-auth navigation inside product routes, including the submitted website. */
export function safeNext(value) {
 if(typeof value!=='string'||/[\\\x00-\x20]/.test(value)||!value.startsWith('/')||value.startsWith('//'))return '/';
 try{const u=new URL(value,'https://pinkiri.invalid');if(u.origin!=='https://pinkiri.invalid'||!['/','/workspace','/account'].includes(u.pathname))return '/';return u.pathname+u.search;}catch{return '/';}
}
export function sameOrigin(request){return request.headers.get('origin')===new URL(request.url).origin;}
export function accountWorkspaceKey(userId,url,competitor){return 'pinkiri-account:'+encodeURIComponent(userId)+':workspace:'+url+':'+competitor;}
