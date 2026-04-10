import type { ReactNode } from 'react';
import { Fragment } from 'react';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tokenizeQuery(query: string): string[] {
  return query
    .trim()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
}

/**
 * Highlights all query tokens in text (case-insensitive). Returns React nodes.
 */
export function HighlightMatch({
  text,
  query,
  className,
}: {
  text: string;
  query: string;
  className?: string;
}): ReactNode {
  const tokens = tokenizeQuery(query);
  if (!text || tokens.length === 0) {
    return text;
  }

  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const isMatch = tokens.some(
      (t) => part.toLowerCase() === t.toLowerCase()
    );
    if (isMatch) {
      return (
        <mark
          key={`${part}-${i}`}
          className={
            className ??
            'rounded-sm bg-amber-200/90 px-0.5 text-inherit dark:bg-amber-400/35'
          }
        >
          {part}
        </mark>
      );
    }
    return <Fragment key={`${part}-${i}`}>{part}</Fragment>;
  });
}
