import express from 'express';

const app = express();
app.use(express.json());
import { search } from './sub/firecrawl';
import type { ScrapeOptions, SearchData, SearchResultWeb } from 'firecrawl';
import type { Document } from 'firecrawl';
import type { CleanedScrapedContent } from './sub/types';
import { queryDecompositionChat } from './sub/openrouter';






app.post('/chat', async (req, res) => {

    // Handle chat request here
    const  query  = req.body.query;
    const querydecompositionResponse:any = await queryDecompositionChat(query);
    const querydecompositionResponseText = querydecompositionResponse.choices[0]?.message?.content;
    const querydecompositionResponseJson = JSON.parse(querydecompositionResponseText || '{}');
    const sub_queries = querydecompositionResponseJson.sub_queries || [];
    const reasoning = querydecompositionResponseJson.reasoning || '';
    

    for (const sub_query of sub_queries) {
        const results: CleanedScrapedContent[] = await search(sub_query);
        console.log(`Results for sub-query "${sub_query}":`, results);
    }
    res.json({ sub_queries, reasoning });
    


});

const port = 3000;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
