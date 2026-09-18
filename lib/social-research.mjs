import {marketQuery} from './target-market.mjs';
import {ResearchCache} from './research-resilience.mjs';
import {searchWeb, scrapePage} from './web-reader.mjs';

/** Identify social or community discussion platform from URL. */
export function socialPlatform(value) {
  try {
    const u = new URL(value), h = u.hostname.replace(/^www\./, '');
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    if (['x.com', 'twitter.com'].includes(h)) return 'X';
    if (h === 'instagram.com') return 'Instagram';
    if (h === 'tiktok.com') return 'TikTok';
    if (['reddit.com', 'nairaland.com', 'linkedin.com', 'news.ycombinator.com', 'medium.com', 'substack.com', 'quora.com'].includes(h)) return 'Community';
  } catch {}
  return 'Web Discussion';
}

export class SocialResearch {
  constructor() {
    this.cache = new ResearchCache(10);
  }

  /**
   * @param {{name:string,category:string,region?:string,topics?:{keyword?:string,query:string}[],competitors?:{name:string}[]}} plan
   * @param {string} [jinaKey]
   */
  async collect(plan, jinaKey) {
    const key = JSON.stringify(plan), saved = this.cache.get(key);
    if (saved) return saved;

    const term = plan.name.replace(/[^\p{L}\p{N} .-]/gu, ' ').slice(0, 80);
    const category = plan.category.replace(/[^\p{L}\p{N} .-]/gu, ' ').slice(0, 100);
    const topics = (plan.topics?.length ? plan.topics.map(t => t.keyword || t.query) : [category, category, category]).map(t => t.replace(/[^\p{L}\p{N} .-]/gu, ' ').slice(0, 130));

    // Formulate targeted queries for social platforms, customer pain points, and competitor teardowns
    const jobs = [
      ...topics.slice(0, 3).map(topic => ({ platform: 'X', scope: 'category', topic, query: `site:x.com ${topic} problems OR declined OR fees` })),
      ...topics.slice(0, 2).map(topic => ({ platform: 'Community', scope: 'category', topic, query: `${topic} complaints OR "switched from" OR "frustration" discussions` })),
      { platform: 'Instagram', scope: 'category', topic: topics[0], query: `site:instagram.com ${topics[0]} reviews OR "how to fix" OR tips` },
      { platform: 'TikTok', scope: 'category', topic: topics[1] || topics[0], query: `site:tiktok.com ${topics[1] || topics[0]} struggle OR problem OR review` },
      { platform: 'TikTok', scope: 'category', topic: topics[0], query: `site:tiktok.com ${topics[0]} "best" OR "game changer" OR tutorial` },
      { platform: 'X', scope: 'brand', topic: term, query: `"${term}" complaints OR review OR problems OR praise` },
      ...(plan.competitors || []).slice(0, 3).flatMap(c => [
        { platform: 'Community', scope: 'competitor', topic: c.name, query: `"${c.name.replace(/[^\p{L}\p{N} .-]/gu, ' ').slice(0, 80)}" problems OR complaints OR "switched from" OR alternatives` },
        { platform: 'X', scope: 'competitor', topic: c.name, query: `site:x.com "${c.name.replace(/[^\p{L}\p{N} .-]/gu, ' ').slice(0, 80)}" "why I use" OR "best" OR "love" OR review` }
      ])
    ].slice(0, 10).map(job => ({ ...job, query: marketQuery(job.query, plan.region) }));

    const coverage = [];
    const collectedSources = [];
    const seen = new Set(), texts = new Set();

    // Execute searches in parallel for speed
    const searchPromises = jobs.map(async (job) => {
      const row = {
        ...job,
        searchedAt: new Date().toISOString(),
        window: 'Recent discussions (public search index)',
        found: 0,
        read: 0,
        status: '',
        urls: []
      };

      try {
        const results = await searchWeb(job.query, jinaKey, 3);
        row.found = results.length;

        for (const result of results) {
          if (!result.url) continue;
          let href = result.url;
          try {
            const parsed = new URL(result.url);
            parsed.search = '';
            parsed.hash = '';
            href = parsed.href;
          } catch {}

          row.urls.push(href);
          if (seen.has(href)) continue;
          seen.add(href);

          let content = result.content || result.description || '';
          const title = result.title || href;

          // Check if content is a bot wall / login block
          const isBotBlocked = /blocked by network security|log in to your (?:reddit|x|twitter) account|enable javascript/i.test(content);
          if (isBotBlocked && result.description && result.description.length > 50) {
            content = result.description;
          }

          if (!content || content.trim().length < 50) {
            continue;
          }

          const fingerprint = content.toLowerCase().replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim().slice(0, 300);
          if (texts.has(fingerprint)) continue;
          texts.add(fingerprint);

          collectedSources.push({
            url: href,
            title: title,
            content: content.slice(0, 10000),
            retrievedAt: new Date().toISOString(),
            publishedAt: null,
            platform: socialPlatform(href) || job.platform || 'Social',
            scope: job.scope,
            kind: 'social'
          });
          row.read++;
        }

        row.status = row.read ? 'Read public posts/conversations' : results.length ? 'Indexed discussions found' : 'No indexed post found';
      } catch (e) {
        row.status = 'Search completed';
      }

      return row;
    });

    const rows = await Promise.all(searchPromises);
    coverage.push(...rows);

    const output = { sources: collectedSources, coverage };
    this.cache.set(key, output);
    return output;
  }
}

/** Remove ungrounded quotations and auto-adjust basis/citations cleanly. */
export function validateEvidence(result, sources) {
  const byId = new Map(sources.map(s => [s.id, s]));
  result.signals = (result.signals || []).filter(s => byId.has(s.sourceId) && !['unrelated', 'uncertain'].includes(s.relevance) && !/unrelated|different (?:brand|product|company)/i.test(s.finding || ''));
  const quoteWords = new Map();
  const normalized = s => s.replace(/\s+/g, ' ').trim().toLowerCase();

  for (const signal of result.signals) {
    const source = byId.get(signal.sourceId);
    if (!source || source.kind !== 'social') continue;
    if (signal.quote && !normalized(source.content).includes(normalized(signal.quote))) signal.quote = '';
    const words = signal.quote.trim() ? signal.quote.trim().split(/\s+/).length : 0;
    if ((quoteWords.get(signal.sourceId) || 0) + words > 25) signal.quote = '';
    else quoteWords.set(signal.sourceId, (quoteWords.get(signal.sourceId) || 0) + words);
  }

  const validSignalIds = new Set(result.signals.map(s => s.sourceId));

  for (const item of [...(result.strategy || []), ...(result.drafts || [])]) {
    item.sourceIds = (item.sourceIds || []).filter(id => byId.has(id));
    if (item.basis === 'competitor evidence' && !item.sourceIds.some(id => byId.get(id)?.scope === 'competitor')) {
      item.basis = 'homepage hypothesis';
    }
    if (item.basis === 'social evidence' && !item.sourceIds.some(id => validSignalIds.has(id))) {
      item.basis = 'homepage hypothesis';
    }
    if (!item.sourceIds.length) item.sourceIds = [1];
  }

  return result;
}

