/**
 * Full-Text Search Engine
 *
 * Provides enhanced search capabilities beyond simple ILIKE.
 * Uses Supabase/Postgres text search features.
 *
 * Supports:
 * - Multi-word search with AND/OR logic
 * - Fuzzy matching via trigrams
 * - Result scoring and ranking
 * - Search across multiple entity types
 *
 * PURE function module -- no store imports, no supabase, no side effects.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Searchable entity types in the app */
export type SearchEntityType = 'users' | 'posts' | 'communities' | 'reels';

/** Structured search query */
export interface SearchQuery {
  /** Raw user input text */
  text: string;
  /** Entity types to search across */
  types: SearchEntityType[];
  /** Max results to return (default 20) */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/** A single search result */
export interface SearchResult {
  /** Entity ID */
  id: string;
  /** Entity type */
  type: SearchEntityType;
  /** Primary display text */
  title: string;
  /** Secondary display text */
  subtitle?: string;
  /** Avatar or thumbnail URL */
  avatar_url?: string;
  /** Relevance score 0-1 */
  score: number;
  /** Matched text snippet with surrounding context */
  highlight?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Characters that have special meaning in Postgres tsquery syntax */
const TSQUERY_SPECIAL_CHARS = /[!|&():*\\]/g;

/** SQL wildcards and injection-risky characters */
const UNSAFE_CHARS = /[%_'";\-]{1,2}/g;

/** Double-dash specifically (SQL comment) */
const SQL_COMMENT = /--/g;

/** Maximum allowed search input length */
const MAX_INPUT_LENGTH = 100;

/** Default context characters for highlight extraction */
const DEFAULT_CONTEXT_CHARS = 100;

// ---------------------------------------------------------------------------
// Public Functions
// ---------------------------------------------------------------------------

/**
 * Build a Postgres full-text search query string from user input.
 *
 * Handles: multiple words, special characters, empty input.
 * Returns a tsquery-compatible string with prefix matching.
 */
export function buildSearchQuery(input: string): string {
  if (!input || !input.trim()) {
    return '';
  }

  const sanitized = input.replace(TSQUERY_SPECIAL_CHARS, ' ');
  const terms = sanitized
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (terms.length === 0) {
    return '';
  }

  return terms.map((term) => `${term}:*`).join(' & ');
}

/**
 * Build a trigram similarity query for fuzzy matching.
 *
 * Returns a sanitized pattern safe for Supabase `.ilike()` or `.textSearch()`.
 */
export function buildFuzzyPattern(input: string): string {
  if (!input) {
    return '%%';
  }

  const stripped = input.replace(/[%_]/g, '').trim();
  return `%${stripped}%`;
}

/**
 * Score a search result based on query match quality.
 *
 * Used for client-side re-ranking after fetching results from Supabase.
 */
export function scoreSearchResult(
  query: string,
  fields: { title: string; description?: string; tags?: string[] },
): number {
  if (!query || !query.trim()) {
    return 0;
  }

  const q = query.trim().toLowerCase();
  const title = fields.title.toLowerCase();
  let maxScore = 0;

  // Title scoring (highest priority)
  if (title === q) {
    maxScore = Math.max(maxScore, 1.0);
  } else if (title.startsWith(q)) {
    maxScore = Math.max(maxScore, 0.9);
  } else if (title.includes(q)) {
    maxScore = Math.max(maxScore, 0.7);
  }

  // Tag scoring
  if (fields.tags && fields.tags.length > 0) {
    for (const tag of fields.tags) {
      if (tag.toLowerCase().includes(q)) {
        maxScore = Math.max(maxScore, 0.5);
        break;
      }
    }
  }

  // Description scoring
  if (fields.description) {
    const desc = fields.description.toLowerCase();
    if (desc.includes(q)) {
      maxScore = Math.max(maxScore, 0.3);
    }
  }

  return maxScore;
}

/**
 * Sanitize search input -- strip SQL wildcards and special chars.
 *
 * Prevents injection while preserving meaningful search terms.
 */
export function sanitizeSearchInput(input: string): string {
  if (!input) {
    return '';
  }

  let result = input;

  // Remove SQL comment sequences first
  result = result.replace(SQL_COMMENT, '');

  // Remove unsafe characters: %, _, ', ", ;
  result = result.replace(/[%_'";]/g, '');

  // Trim whitespace
  result = result.trim();

  // Collapse multiple spaces into one
  result = result.replace(/\s+/g, ' ');

  // Enforce max length
  if (result.length > MAX_INPUT_LENGTH) {
    result = result.slice(0, MAX_INPUT_LENGTH);
  }

  return result;
}

/**
 * Extract a highlight snippet from text around the matched query.
 *
 * Returns approximately `contextChars` characters centered on the first
 * occurrence of the query in the text (case-insensitive).
 */
export function extractHighlight(
  text: string,
  query: string,
  contextChars: number = DEFAULT_CONTEXT_CHARS,
): string {
  if (!text || !query || !query.trim()) {
    return '';
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.trim().toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return '';
  }

  // Calculate window around the match
  const halfContext = Math.floor(contextChars / 2);
  let start = Math.max(0, matchIndex - halfContext);
  let end = Math.min(text.length, matchIndex + lowerQuery.length + halfContext);

  // Try to break at word boundaries
  if (start > 0) {
    const spaceIndex = text.indexOf(' ', start);
    if (spaceIndex !== -1 && spaceIndex < matchIndex) {
      start = spaceIndex + 1;
    }
  }
  if (end < text.length) {
    const spaceIndex = text.lastIndexOf(' ', end);
    if (spaceIndex !== -1 && spaceIndex > matchIndex + lowerQuery.length) {
      end = spaceIndex;
    }
  }

  let snippet = text.slice(start, end);

  // Add ellipsis
  if (start > 0) {
    snippet = '...' + snippet;
  }
  if (end < text.length) {
    snippet = snippet + '...';
  }

  return snippet;
}
