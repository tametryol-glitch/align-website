'use client';

import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';

/**
 * Renders assistant chat text as markdown, sized for a chat bubble.
 *
 * Every element is styled explicitly rather than via `prose` — the
 * `@tailwindcss/typography` plugin is not installed in this project, so those
 * classes are inert and Tailwind's preflight has already stripped list markers
 * and heading sizes.
 *
 * Raw HTML is not enabled (react-markdown escapes it by default), so model
 * output cannot inject markup.
 */
export function ChatMarkdown({ children }: { children: string }) {
  const router = useRouter();

  return (
    <div className="text-sm text-text-primary space-y-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-text-primary">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1 marker:text-accent-primary">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1 marker:text-accent-primary">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => (
            <h1 className="text-base font-semibold text-text-primary">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-semibold text-text-primary">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-text-primary">{children}</h3>
          ),
          code: ({ children }) => (
            <code className="rounded bg-white/10 px-1 py-0.5 text-[0.8em]">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg bg-white/5 p-2 text-xs">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent-primary/40 pl-3 text-text-secondary">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-border-primary" />,
          a: ({ href, children }) => {
            const url = String(href || '');
            // In-app routes stay in the SPA; anything else opens in a new tab
            // with rel guards, since the text came from a model.
            if (url.startsWith('/')) {
              return (
                <button
                  type="button"
                  onClick={() => router.push(url)}
                  className="text-accent-primary underline underline-offset-2 hover:text-accent-secondary"
                >
                  {children}
                </button>
              );
            }
            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-accent-primary underline underline-offset-2 hover:text-accent-secondary"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
