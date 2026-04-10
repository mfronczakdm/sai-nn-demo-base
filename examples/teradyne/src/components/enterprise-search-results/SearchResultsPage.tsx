'use client';

import * as React from 'react';
import { Filter, Search as SearchIcon, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { FiltersSidebar } from './FiltersSidebar';
import { MOCK_SEARCH_RESULTS } from './mock-data';
import { ResultCard } from './ResultCard';
import { SearchBar } from './SearchBar';
import { SearchResultsPagination } from './SearchResultsPagination';
import { SortDropdown } from './SortDropdown';
import type {
  ContentTypeFilter,
  DateRangeFilter,
  ProductCategory,
  SearchFilterState,
  SearchResultItem,
  SortOption,
} from './types';

const PAGE_SIZE = 10;

const DID_YOU_MEAN: Record<string, string> = {
  'thermaly calibration': 'thermal calibration',
  'thermal calibretion': 'thermal calibration',
  'therml calibration': 'thermal calibration',
};

function emptyFilterState(): SearchFilterState {
  return {
    contentTypes: new Set(),
    categories: new Set(),
    dateRange: null,
    tags: new Set(),
    recommendedOnly: false,
  };
}

function facetContentType(item: SearchResultItem): ContentTypeFilter {
  return item.contentType === 'guide' ? 'documentation' : item.contentType;
}

function withinDateRange(isoDate: string, range: DateRangeFilter): boolean {
  if (!range) return true;
  const t = new Date(isoDate).getTime();
  if (Number.isNaN(t)) return true;
  const now = Date.now();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 365;
  return t >= now - days * 86400000;
}

function queryTokens(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function matchesQuery(item: SearchResultItem, query: string): boolean {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return true;
  const hay = `${item.title} ${item.snippet}`.toLowerCase();
  return tokens.every((tok) => hay.includes(tok));
}

function sortItems(items: SearchResultItem[], sort: SortOption): SearchResultItem[] {
  const copy = [...items];
  if (sort === 'recent') {
    copy.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  } else if (sort === 'views') {
    copy.sort((a, b) => b.viewCount - a.viewCount);
  } else {
    copy.sort((a, b) => b.relevance - a.relevance);
  }
  return copy;
}

function applyFilters(items: SearchResultItem[], query: string, filters: SearchFilterState): SearchResultItem[] {
  return items.filter((item) => {
    if (!matchesQuery(item, query)) return false;
    if (filters.contentTypes.size > 0 && !filters.contentTypes.has(facetContentType(item))) {
      return false;
    }
    if (filters.categories.size > 0 && !filters.categories.has(item.category)) {
      return false;
    }
    if (!withinDateRange(item.lastUpdated, filters.dateRange)) {
      return false;
    }
    if (filters.tags.size > 0) {
      const hit = item.tags.some((t) => filters.tags.has(t));
      if (!hit) return false;
    }
    if (filters.recommendedOnly && !item.badges.includes('recommended')) {
      return false;
    }
    return true;
  });
}

function ResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border/80">
          <CardContent className="space-y-3 p-5">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 max-w-xl w-full" />
                <Skeleton className="h-3 w-full max-w-2xl" />
                <Skeleton className="h-3 w-full max-w-xl" />
                <Skeleton className="h-3 max-w-md w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AiAnswerSummary({ query }: { query: string }) {
  const q = query.trim() || 'your search';
  return (
    <Card className="border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-background dark:border-violet-900/50 dark:from-violet-950/40">
      <CardContent className="flex gap-3 p-4 sm:p-5">
        <div className="bg-background/80 text-violet-700 dark:text-violet-300 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-violet-950 dark:text-violet-100 text-sm font-semibold">AI-assisted summary</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Top matches for <span className="text-foreground font-medium">“{q}”</span> emphasize calibration
            procedures on UltraFLEX, thermal verification cadence, and diagnostics tied to signal integrity. Start
            with the recommended guides, then narrow by product line or content type using filters.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export interface SearchResultsPageProps {
  /** Initial text in the search field (e.g. thermal calibration). */
  initialQuery?: string;
  className?: string;
}

export function SearchResultsPage({ initialQuery = 'thermal calibration', className }: SearchResultsPageProps) {
  const [query, setQuery] = React.useState(initialQuery);
  const [sort, setSort] = React.useState<SortOption>('relevance');
  const [filters, setFilters] = React.useState<SearchFilterState>(() => emptyFilterState());
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const toggleContentType = React.useCallback((value: ContentTypeFilter) => {
    setFilters((prev) => {
      const next = new Set(prev.contentTypes);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...prev, contentTypes: next };
    });
  }, []);

  const toggleCategory = React.useCallback((value: ProductCategory) => {
    setFilters((prev) => {
      const next = new Set(prev.categories);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...prev, categories: next };
    });
  }, []);

  const setDateRange = React.useCallback((value: DateRangeFilter) => {
    setFilters((prev) => ({ ...prev, dateRange: value }));
  }, []);

  const toggleTag = React.useCallback((tag: string) => {
    setFilters((prev) => {
      const next = new Set(prev.tags);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return { ...prev, tags: next };
    });
  }, []);

  const setRecommendedOnly = React.useCallback((value: boolean) => {
    setFilters((prev) => ({ ...prev, recommendedOnly: value }));
  }, []);

  const clearAllFilters = React.useCallback(() => {
    setFilters(emptyFilterState());
  }, []);

  const filtered = React.useMemo(
    () => sortItems(applyFilters(MOCK_SEARCH_RESULTS, query, filters), sort),
    [query, filters, sort]
  );

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  React.useEffect(() => {
    setPage(1);
  }, [query, sort, filters]);

  React.useEffect(() => {
    setIsLoading(true);
    const id = window.setTimeout(() => setIsLoading(false), 480);
    return () => window.clearTimeout(id);
  }, [query, sort, filters]);

  React.useEffect(() => {
    setPage((p) => Math.min(p, pageCount));
  }, [pageCount]);

  const safePage = Math.min(Math.max(1, page), pageCount);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);
  const start = total === 0 ? 0 : startIndex + 1;
  const end = startIndex + pageItems.length;

  const didYouMean = DID_YOU_MEAN[query.trim().toLowerCase()] ?? null;

  const filterPanel = (
    <FiltersSidebar
      filters={filters}
      onToggleContentType={toggleContentType}
      onToggleCategory={toggleCategory}
      onDateRangeChange={setDateRange}
      onToggleTag={toggleTag}
      onRecommendedOnlyChange={setRecommendedOnly}
      onClearAll={clearAllFilters}
    />
  );

  return (
    <div className={cn('bg-muted/20 min-h-screen', className)}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">Search</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Enterprise knowledge portal — articles, PDFs, videos, and guides.
            </p>
          </div>
        </div>

        <SearchBar value={query} onChange={setQuery} className="mb-6" />

        {didYouMean && (
          <div className="border-border bg-background/80 mb-4 flex flex-wrap items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-sm">
            <SearchIcon className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
            <span>
              Did you mean{' '}
              <button
                type="button"
                className="text-primary font-semibold underline-offset-4 hover:underline"
                onClick={() => setQuery(didYouMean)}
              >
                “{didYouMean}”
              </button>
              ?
            </span>
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="hidden w-full shrink-0 lg:block lg:w-72 lg:max-w-xs">
            <div className="border-border bg-card lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] space-y-1 overflow-y-auto rounded-xl border p-4 shadow-sm">
              {filterPanel}
            </div>
          </aside>

          <main className="min-w-0 flex-1 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-muted-foreground text-sm">
                {total === 0 ? (
                  <>No results for &lsquo;{query}&rsquo;</>
                ) : (
                  <>
                    Showing{' '}
                    <span className="text-foreground font-medium">
                      {start.toLocaleString()}–{end.toLocaleString()}
                    </span>{' '}
                    of <span className="text-foreground font-medium">{total.toLocaleString()}</span> results for
                    &lsquo;{query}&rsquo;
                  </>
                )}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button type="button" variant="outline" className="h-10 gap-2 lg:hidden">
                      <Filter className="h-4 w-4" aria-hidden />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[min(100%,22rem)] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">{filterPanel}</div>
                  </SheetContent>
                </Sheet>
                <SortDropdown value={sort} onChange={setSort} />
              </div>
            </div>

            <AiAnswerSummary query={query} />

            <Separator className="opacity-60" />

            {isLoading ? (
              <ResultsSkeleton />
            ) : total === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                  <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                    <SearchIcon className="text-muted-foreground h-6 w-6" aria-hidden />
                  </div>
                  <div className="max-w-md space-y-1">
                    <p className="text-lg font-semibold">No results found</p>
                    <p className="text-muted-foreground text-sm">
                      Try clearing filters, checking spelling, or broadening your search terms.
                    </p>
                  </div>
                  <Button type="button" variant="secondary" onClick={clearAllFilters}>
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <ul className="space-y-4">
                  {pageItems.map((item) => (
                    <li key={item.id}>
                      <ResultCard item={item} query={query} />
                    </li>
                  ))}
                </ul>
                <SearchResultsPagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
