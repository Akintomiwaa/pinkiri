/**
 * Retry only explicit server failures. Quota/auth errors and ambiguous network
 * timeouts stop immediately to avoid repeated billable requests.
 * @param {() => Promise<Response>} request
 * @param {(ms:number) => Promise<void>} sleep
 */
export async function requestWithRetry(request, sleep = ms => new Promise(resolve => setTimeout(resolve, ms))) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await request();
    if (![500, 502, 503, 504].includes(response.status) || attempt === 2) return response;
    await response.body?.cancel();
    await sleep(2000 * 2 ** attempt + Math.floor(Math.random() * 500));
  }
  throw new Error('Retry limit reached.');
}
/** @template T */
export class ResearchCache {
  /** @type {Map<string, {at:number, value:T}>} */
  entries = new Map();
  /** @param {number} limit @param {number} ttl @param {()=>number} now */
  constructor(limit = 20, ttl = 3600000, now = Date.now) { this.limit = limit; this.ttl = ttl; this.now = now; }
  /** @param {string} key */
  get(key) {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (this.now() - entry.at >= this.ttl) { this.entries.delete(key); return undefined; }
    return entry.value;
  }
  /** @param {string} key @param {T} value */
  set(key, value) {
    this.entries.delete(key);
    if (this.entries.size >= this.limit) this.entries.delete(this.entries.keys().next().value ?? '');
    this.entries.set(key, {at:this.now(), value});
  }
}
/**
 * Each model is called at most once. Auth/quota failures stop the whole run.
 * A temporarily unavailable model is skipped for five minutes.
 */
export class GeminiRouter {
  /** @type {Map<string,number>} */
  unavailableUntil = new Map();
  /** @param {string[]} models @param {()=>number} now */
  constructor(models = ['gemini-3.5-flash-lite','gemini-3.1-flash-lite'], now = Date.now) {this.models=models;this.now=now;}
  /** @param {(model:string)=>Promise<Response>} request */
  async run(request) {
    for(const model of this.models) {
      if((this.unavailableUntil.get(model)||0)>this.now()) continue;
      let response;
      try {response=await request(model);} catch(error) {
        if(!(error instanceof Error) || !['TimeoutError','AbortError','TypeError'].includes(error.name)) throw error;
        this.unavailableUntil.set(model,this.now()+300000);
        continue;
      }
      if([500,502,503,504].includes(response.status)) {
        await response.body?.cancel();
        this.unavailableUntil.set(model,this.now()+300000);
        continue;
      }
      return {response,model};
    }
    return null;
  }
}
