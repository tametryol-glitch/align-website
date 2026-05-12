'use client';

import React from 'react';

export function MarkdownText({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="text-text-primary font-semibold">{part}</strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}
