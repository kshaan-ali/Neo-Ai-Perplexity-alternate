import express from 'express';
import type { Request, Response } from 'express';
import { search } from './sub/firecrawl';
import { mainChat, queryDecompositionChat } from './sub/openrouter';
import type { CleanedScrapedContent, QueryDecompositionResult, SearchBundle } from './sub/types';

const app = express();
app.use(express.json());

const searchResultsPerQuery = 2;


const extractMessageContent = (response: any): string => {
    return response?.choices?.[0]?.message?.content || '';
};

const parseJsonResponse = <T>(content: string, fallback: T): T => {
    const cleanedContent = content
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '');

    try {
        return JSON.parse(cleanedContent) as T;
    } catch {
        return fallback;
    }
};

const buildScrapedContextPrompt = (query: string, searchBundles: SearchBundle[]) => {
    let citationNumber = 1;
    const sources = searchBundles.flatMap((bundle) => {
        return bundle.results.map((result) => {
            return {
                marker: citationNumber++,
                searchQuery: bundle.query,
                ...result,
            };
        });
    });

    const context = sources.map((source) => {
        return [
            `[${source.marker}]`,
            `Search query: ${source.searchQuery}`,
            `Title: ${source.title}`,
            `URL: ${source.url}`,
            `Content: ${source.markdown || 'No markdown content returned.'}`,
        ].join('\n');
    }).join('\n\n---\n\n');

    return `User question:
${query}

Scraped web context:
${context || 'No scraped content was returned.'}

Answer the user question using only the scraped web context above.`;
};

app.post('/chat', async (req: Request, res: Response) => {
    try {
        const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';

        if (!query) {
            res.status(400).json({ error: 'query is required' });
            return;
        }

        const decompositionResponse = await queryDecompositionChat(query);
        const decompositionText = extractMessageContent(decompositionResponse);
        const decomposition = parseJsonResponse<QueryDecompositionResult>(decompositionText, {
            sub_queries: [query],
            reasoning: 'Fallback to the original query because decomposition JSON could not be parsed.',
        });

        const subQueries = Array.isArray(decomposition.sub_queries) && decomposition.sub_queries.length > 0
            ? decomposition.sub_queries
            : [query];

        const searches: SearchBundle[] = await Promise.all(
            subQueries.map(async (subQuery) => {
                const results: CleanedScrapedContent[] = await search(subQuery, searchResultsPerQuery);
                return { query: subQuery, results };
            })
        );

        const answerPrompt = buildScrapedContextPrompt(query, searches);
        const answerResponse = await mainChat(answerPrompt);
        const answerText = extractMessageContent(answerResponse);
        const answer = parseJsonResponse(answerText, {
            answer: answerText || 'No answer was returned from the model.',
            citations: [],
            confidence: 'low',
            follow_up_questions: [],
        });

        res.json({
            query,
            decomposition: {
                sub_queries: subQueries,
                reasoning: decomposition.reasoning || '',
            },
            searches,
            search_results_per_query: searchResultsPerQuery,
            result: answer,
        });
    } catch (error) {
        console.error('Chat API error:', error);
        res.status(500).json({
            error: 'Failed to process chat request',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

const port = 3000;

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
const keepAlive = setInterval(() => undefined, 1 << 30);

process.on('SIGTERM', () => {
    server.close();
});

server.on('close', () => {
    clearInterval(keepAlive);
});
