/**
 * Linkify plain text — detect URLs / emails and render them as clickable
 * anchors. Web mirror of align-app's src/utils/linkify.tsx.
 *
 * Safety: only http/https/mailto are rendered as links. Unknown schemes stay
 * plain text, so a malicious `javascript:…` string can never be clicked.
 */

import React from 'react';

// Match: http(s)://… | www.… | bare-domain.tld/… | mailto:…
// Order matters — longer / more specific patterns come first so they win.
const URL_RE =
  /(\bhttps?:\/\/[^\s<>"']+|\bwww\.[^\s<>"']+|\bmailto:[^\s<>"']+|\b[a-z0-9-]+\.(?:com|net|org|io|app|co|dev|ai|me|us|gg|xyz|link)(?:\/[^\s<>"']*)?)/gi;

// Trailing punctuation that reads as part of the sentence, not the URL.
const TRAILING_PUNCT = /[.,!?;:)\]}'"»]+$/;

function normalizeUrl(raw: string): string {
  let url = raw.replace(TRAILING_PUNCT, '');
  if (/^www\./i.test(url)) url = `https://${url}`;
  else if (/^[a-z0-9-]+\.[a-z]{2,}/i.test(url) && !/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

function isSafeScheme(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('mailto:');
}

/** Split text into plain segments and <a> elements for any URLs found. */
export function renderTextWithLinks(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  URL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = URL_RE.exec(text)) !== null) {
    const raw = m[0];
    const start = m.index;
    const display = raw.replace(TRAILING_PUNCT, '');
    const url = normalizeUrl(raw);
    if (!isSafeScheme(url) || !display) continue;
    if (start > last) nodes.push(text.slice(last, start));
    nodes.push(
      <a
        key={`lnk-${key++}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-secondary hover:text-accent-primary underline underline-offset-2 break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {display}
      </a>
    );
    last = start + display.length; // trailing punctuation stays as plain text
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
