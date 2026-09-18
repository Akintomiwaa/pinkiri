/**
 * Resilient web scraping and search utility using Jina AI Reader & Search (free / generous allowance)
 * with native fallback capabilities.
 */

function stripHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Scrape a webpage and convert it to clean, LLM-ready markdown or text.
 * @param {string} url
 * @param {string} [apiKey]
 * @returns {Promise<{markdown: string, title?: string, publishedTime?: string | null}>}
 */
export async function scrapePage(url, apiKey) {
  const targetUrl = url.startsWith('http') ? url : `https://${url}`;
  
  // 1. Primary strategy: Jina Reader API
  try {
    const headers = {
      'Accept': 'application/json',
      'X-Return-Format': 'markdown',
      'X-Target-Selector': 'body',
      'X-Timeout': '25'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const res = await fetch(`https://r.jina.ai/${encodeURI(targetUrl)}`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(30000)
    });

    if (res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (json.data?.content && json.data.content.trim().length > 50) {
          return {
            markdown: json.data.content,
            title: json.data.title || targetUrl,
            publishedTime: json.data.publishedTime || null
          };
        }
      } catch {
        if (text && text.trim().length > 50) {
          return {
            markdown: text,
            title: targetUrl,
            publishedTime: null
          };
        }
      }
    }
  } catch (err) {
    console.warn(`[web-reader] Jina Reader scrape failed for ${targetUrl}:`, err instanceof Error ? err.message : err);
  }

  // 2. Resilient fallback: Direct HTTP fetch with HTML stripping
  try {
    const directRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(20000)
    });

    if (directRes.ok) {
      const html = await directRes.text();
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : targetUrl;
      const cleanText = stripHtml(html);

      if (cleanText.length > 50) {
        return {
          markdown: `# ${title}\n\n${cleanText.slice(0, 20000)}`,
          title,
          publishedTime: null
        };
      }
    }
  } catch (err) {
    console.warn(`[web-reader] Direct fetch fallback failed for ${targetUrl}:`, err instanceof Error ? err.message : err);
  }

  throw new Error(`Could not read website content for ${targetUrl}`);
}

/**
 * Perform a web and social search using Jina AI Search.
 * @param {string} query
 * @param {string} [apiKey]
 * @param {number} [limit=5]
 * @returns {Promise<Array<{title: string, url: string, description: string, content: string}>>}
 */
export async function searchWeb(query, apiKey, limit = 5) {
  try {
    const headers = {
      'Accept': 'application/json',
      'X-Timeout': '30'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const res = await fetch(`https://s.jina.ai/${encodeURIComponent(query)}`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(35000)
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return json.data.slice(0, limit).map(item => ({
          title: item.title || item.url || '',
          url: item.url || '',
          description: item.description || '',
          content: item.content || item.description || ''
        }));
      }
    }
  } catch (err) {
    console.warn(`[web-reader] Jina search failed for query "${query}":`, err instanceof Error ? err.message : err);
  }

  return [];
}
