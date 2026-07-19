export type CleanedScrapedContent = {
  url: string;
  title: string;
  markdown: string;
};

export type SearchBundle = {
  query: string;
  results: CleanedScrapedContent[];
};

export type QueryDecompositionResult = {
  sub_queries: string[];
  reasoning: string;
};
