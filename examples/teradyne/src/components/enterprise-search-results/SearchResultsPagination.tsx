'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface SearchResultsPaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Up to 5 contiguous page numbers centered on `page`, clamped to [1, pageCount]. */
function slidingWindow(page: number, pageCount: number, width = 5): number[] {
  if (pageCount <= 0) return [];
  const half = Math.floor(width / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(pageCount, start + width - 1);
  start = Math.max(1, end - width + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function SearchResultsPagination({
  page,
  pageCount,
  onPageChange,
  className,
}: SearchResultsPaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  const window = slidingWindow(page, pageCount, 5);
  const showFirst = window[0] > 1;
  const showLast = window[window.length - 1] < pageCount;
  const showLeftEllipsis = window[0] > 2;
  const showRightEllipsis = window[window.length - 1] < pageCount - 1;

  return (
    <nav
      className={cn('flex flex-col items-center gap-3 sm:flex-row sm:justify-between', className)}
      aria-label="Pagination"
    >
      <p className="text-muted-foreground order-2 text-sm sm:order-1">
        Page <span className="text-foreground font-medium">{page}</span> of{' '}
        <span className="text-foreground font-medium">{pageCount}</span>
      </p>
      <div className="order-1 flex flex-wrap items-center justify-center gap-1 sm:order-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="hidden items-center gap-0.5 sm:flex">
          {showFirst && (
            <>
              <Button
                type="button"
                variant={page === 1 ? 'default' : 'ghost'}
                size="icon"
                className="h-9 w-9"
                onClick={() => onPageChange(1)}
                aria-label="Page 1"
                aria-current={page === 1 ? 'page' : undefined}
              >
                1
              </Button>
              {showLeftEllipsis && (
                <span className="text-muted-foreground px-1 text-sm" aria-hidden>
                  …
                </span>
              )}
            </>
          )}

          {window.map((p) => (
            <Button
              key={p}
              type="button"
              variant={p === page ? 'default' : 'ghost'}
              size="icon"
              className="h-9 w-9"
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </Button>
          ))}

          {showLast && (
            <>
              {showRightEllipsis && (
                <span className="text-muted-foreground px-1 text-sm" aria-hidden>
                  …
                </span>
              )}
              <Button
                type="button"
                variant={page === pageCount ? 'default' : 'ghost'}
                size="icon"
                className="h-9 w-9"
                onClick={() => onPageChange(pageCount)}
                aria-label={`Page ${pageCount}`}
                aria-current={page === pageCount ? 'page' : undefined}
              >
                {pageCount}
              </Button>
            </>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
