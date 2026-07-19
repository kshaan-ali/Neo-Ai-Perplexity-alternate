import { Firecrawl } from 'firecrawl';
import { firecrawlApiKey } from './lib';
import type { CleanedScrapedContent } from './types';

const firecrawlFree = new Firecrawl({
  // No API key needed to get started — add one for higher rate limits:
  // apiKey: "fc-YOUR-API-KEY",
});

const firecrawlPro = new Firecrawl({
  
  apiKey: firecrawlApiKey 
});





export const search=async (query: string, limit = 5) => {
  const client = firecrawlApiKey ? firecrawlPro : firecrawlFree;
  const results:any = await client.search(query, {
    limit,
    scrapeOptions: { formats: ['markdown'] } // true for search with scraping 
  });
  const webResults = Array.isArray(results?.web) ? results.web : [];
  const cleanedResults: CleanedScrapedContent[]  = webResults.map((i: any) => {    
        return {
            url: i.url || '',
            title: i.title || i.url || 'Untitled',
            markdown: (i.markdown || '').slice(0, 8000)
        }
    })
    return cleanedResults;
}
