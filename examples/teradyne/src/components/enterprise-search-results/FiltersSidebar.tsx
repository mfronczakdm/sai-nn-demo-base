'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ALL_TAG_OPTIONS,
  CATEGORY_LABELS,
  CONTENT_TYPE_LABELS,
  type ContentTypeFilter,
  type DateRangeFilter,
  type ProductCategory,
  type SearchFilterState,
} from './types';

export interface FiltersSidebarProps {
  filters: SearchFilterState;
  onToggleContentType: (value: ContentTypeFilter) => void;
  onToggleCategory: (value: ProductCategory) => void;
  onDateRangeChange: (value: DateRangeFilter) => void;
  onToggleTag: (tag: string) => void;
  onRecommendedOnlyChange: (value: boolean) => void;
  onClearAll: () => void;
  className?: string;
}

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="hover:bg-muted/60 flex w-full items-center justify-between rounded-md px-1 py-2 text-left text-sm font-semibold">
        {title}
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 transition-transform', open ? 'rotate-180' : '')}
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-2 pt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function FiltersSidebar({
  filters,
  onToggleContentType,
  onToggleCategory,
  onDateRangeChange,
  onToggleTag,
  onRecommendedOnlyChange,
  onClearAll,
  className,
}: FiltersSidebarProps) {
  const hasActiveFilters =
    filters.contentTypes.size > 0 ||
    filters.categories.size > 0 ||
    filters.dateRange !== null ||
    filters.tags.size > 0 ||
    filters.recommendedOnly;

  const dateRadioValue = filters.dateRange ?? 'any';

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">Filters</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-8 px-2 text-xs"
          disabled={!hasActiveFilters}
          onClick={onClearAll}
        >
          Clear all
        </Button>
      </div>

      <FilterSection title="Content type">
        <div className="space-y-2.5 pl-0.5">
          {(Object.keys(CONTENT_TYPE_LABELS) as ContentTypeFilter[]).map((key) => (
            <label
              key={key}
              className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md px-1 py-1"
            >
              <Checkbox
                checked={filters.contentTypes.has(key)}
                onCheckedChange={() => onToggleContentType(key)}
                aria-label={CONTENT_TYPE_LABELS[key]}
              />
              <span className="text-sm">{CONTENT_TYPE_LABELS[key]}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Product / category">
        <div className="space-y-2.5 pl-0.5">
          {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((key) => (
            <label
              key={key}
              className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md px-1 py-1"
            >
              <Checkbox
                checked={filters.categories.has(key)}
                onCheckedChange={() => onToggleCategory(key)}
                aria-label={CATEGORY_LABELS[key]}
              />
              <span className="text-sm">{CATEGORY_LABELS[key]}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Date range">
        <RadioGroup
          value={dateRadioValue}
          onValueChange={(v) => {
            if (v === 'any') onDateRangeChange(null);
            else onDateRangeChange(v as Exclude<DateRangeFilter, null>);
          }}
          className="space-y-2 pl-0.5"
        >
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm">
            <RadioGroupItem value="any" id="dr-any" />
            <span>Any time</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm">
            <RadioGroupItem value="7d" id="dr-7" />
            <span>Last 7 days</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm">
            <RadioGroupItem value="30d" id="dr-30" />
            <span>Last 30 days</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm">
            <RadioGroupItem value="1y" id="dr-1y" />
            <span>Last year</span>
          </label>
        </RadioGroup>
      </FilterSection>

      <Separator />

      <FilterSection title="Tags">
        <div className="flex flex-wrap gap-1.5">
          {ALL_TAG_OPTIONS.map((tag) => {
            const selected = filters.tags.has(tag);
            return (
              <Button
                key={tag}
                type="button"
                size="sm"
                variant={selected ? 'secondary' : 'outline'}
                className="h-8 rounded-full px-3 text-xs font-normal"
                onClick={() => onToggleTag(tag)}
                aria-pressed={selected}
              >
                {tag}
              </Button>
            );
          })}
        </div>
      </FilterSection>

      <Separator />

      <div className="bg-muted/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-3">
        <div className="space-y-0.5">
          <Label htmlFor="recommended-only" className="text-sm font-medium">
            Recommended only
          </Label>
          <p className="text-muted-foreground text-xs">Only show recommended content</p>
        </div>
        <Switch
          id="recommended-only"
          checked={filters.recommendedOnly}
          onCheckedChange={onRecommendedOnlyChange}
        />
      </div>
    </div>
  );
}
