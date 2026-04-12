export type ContentTypeFilter = 'article' | 'pdf' | 'video' | 'documentation' | 'faq';

/** Stored on items; guides map to the Documentation facet in the UI. */
export type ResultContentType = ContentTypeFilter | 'guide';

export type ProductCategory =
  | 'semiconductor-test'
  | 'system-diagnostics'
  | 'calibration'
  | 'automation';

export type DateRangeFilter = '7d' | '30d' | '1y' | null;

export type SortOption = 'relevance' | 'recent' | 'views';

export type ResultBadge = 'recommended' | 'popular' | 'new';

export interface SearchResultItem {
  id: string;
  title: string;
  snippet: string;
  contentType: ResultContentType;
  category: ProductCategory;
  lastUpdated: string;
  author: string;
  tags: string[];
  badges: ResultBadge[];
  viewCount: number;
  relevance: number;
}

export interface SearchFilterState {
  contentTypes: Set<ContentTypeFilter>;
  categories: Set<ProductCategory>;
  dateRange: DateRangeFilter;
  tags: Set<string>;
  recommendedOnly: boolean;
}

export const CONTENT_TYPE_LABELS: Record<ContentTypeFilter, string> = {
  article: 'Article',
  pdf: 'PDF',
  video: 'Video',
  documentation: 'Documentation',
  faq: 'FAQ',
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'semiconductor-test': 'Semiconductor Test',
  'system-diagnostics': 'System Diagnostics',
  calibration: 'Calibration',
  automation: 'Automation',
};

export const ALL_TAG_OPTIONS = [
  'UltraFLEX',
  'IG-XL',
  'J750',
  'DFT',
  'ATE',
  'Thermal',
  'Signal integrity',
  'Diagnostics',
  'Best practices',
  'Release notes',
  'UR5e',
  'MiR',
] as const;
