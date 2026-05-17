'use client';

import React from 'react';

export function InlineBold({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i} className="font-bold text-text-primary">{part}</strong>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </span>
  );
}
