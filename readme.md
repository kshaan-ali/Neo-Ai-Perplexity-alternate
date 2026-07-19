# Neo AI

An open-source Perplexity-style answer engine backend. Neo AI takes a user question, decomposes it into focused search queries, scrapes live web results with Firecrawl, and asks an OpenRouter-powered chat model to produce a JSON answer with citations.

## Current Status

This repository currently contains the backend service. The main endpoint is `POST /chat`.

## How It Works

1. The user sends a natural-language question to `/chat`.
2. OpenRouter runs a query decomposition prompt and returns focused `sub_queries`.
3. Each sub-query is sent to Firecrawl search.
4. Firecrawl returns up to 5 scraped web results per sub-query.
5. The scraped markdown content is passed back into the main OpenRouter chat prompt.
6. The API returns JSON containing the answer, citations, decomposition data, and scraped search bundles.

Example: if decomposition returns 3 sub-queries, Firecrawl can return up to 15 total results because each sub-query has its own limit of 5.

## Tech Stack

- Bun
- TypeScript
- Express
- OpenRouter
- Firecrawl

## Project Structure

```txt
backend/
  index.ts              # Express server and /chat pipeline
  sub/
    firecrawl.ts        # Firecrawl search wrapper
    openrouter.ts       # OpenRouter chat helpers
    prompts.ts          # System and query decomposition prompts
    types.ts            # Shared backend types
    lib.ts              # Environment variable loading
```

## Setup

Install dependencies:

```bash
cd backend
bun install
```

Create a backend environment file:

```bash
cp .env.example .env
```

If there is no `.env.example` yet, create `backend/.env` manually:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

`OPENROUTER_API_KEY` is required for query decomposition and final answer generation. `FIRECRAWL_API_KEY` is recommended for higher Firecrawl limits.

## Run

```bash
cd backend
bun run index.ts
```

The server starts on:

```txt
http://localhost:3000
```

## API

### `POST /chat`

Request:

```json
{
  "query": "What are the latest updates in AI regulation?"
}
```

Example:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"What are the latest updates in AI regulation?"}'
```

Response shape:

```json
{
  "query": "What are the latest updates in AI regulation?",
  "decomposition": {
    "sub_queries": [
      "latest AI regulation updates",
      "AI regulation 2026",
      "EU AI Act latest updates"
    ],
    "reasoning": "Split into current updates, year-specific regulation, and EU-specific policy."
  },
  "searches": [
    {
      "query": "latest AI regulation updates",
      "results": [
        {
          "url": "https://example.com/article",
          "title": "Example Article",
          "markdown": "Scraped page content..."
        }
      ]
    }
  ],
  "search_results_per_query": 5,
  "result": {
    "answer": "Plain-language answer with citation markers like [1].",
    "citations": [
      {
        "marker": "1",
        "url": "https://example.com/article",
        "title": "Example Article",
        "supporting_text": "Claim supported by this source"
      }
    ],
    "confidence": "high",
    "follow_up_questions": []
  }
}
```

## Development

Type-check the backend:

```bash
cd backend
bunx tsc --noEmit
```

## Notes

- The backend asks Firecrawl for 5 results per decomposed sub-query.
- The final answer prompt instructs the model to use only scraped context as source material.
- Model responses are expected to be JSON. The server includes fallback parsing so a malformed model response does not crash the request.

## Contributing

Contributions are welcome. Useful areas to improve include:

- Better error handling for provider failures
- Streaming responses
- Request rate limiting
- Configurable model names and search limits
- Tests for the `/chat` pipeline
- Frontend integration

Please keep changes focused, readable, and easy for new contributors to understand.
