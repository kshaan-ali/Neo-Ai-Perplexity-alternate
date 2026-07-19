import { config } from 'dotenv';

config({ path: new URL('../.env', import.meta.url) });

export const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
export const openrouterApiKey = process.env.OPENROUTER_API_KEY; // for now using openrouter api key for chatgpt api calls, will change later to use openai/anthropic api key
