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





export const search=async (query: string) => {
  const results:any = await firecrawlFree.search(query, {
    limit: 5,
    scrapeOptions: { formats: ['markdown'] } // true for search with scraping 
  });
  const cleanedResults: CleanedScrapedContent[]  = results.web.map((i: any) => {    
        return {
            url: i.url,
            title: i.title,
            markdown: i.markdown || ''
        }
    })
    return cleanedResults;
}