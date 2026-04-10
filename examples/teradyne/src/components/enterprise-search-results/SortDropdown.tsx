'use client';

import type { SortOption } from './types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const SORT_LABELS: Record<SortOption, string> = {
  relevance: 'Relevance',
  recent: 'Most Recent',
  views: 'Most Viewed',
};

export interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  id?: string;
  className?: string;
}

export function SortDropdown({ value, onChange, id = 'search-sort', className }: SortDropdownProps) {
  return (
    <div className={cn('flex flex-col gap-1.5 sm:min-w-[200px]', className)}>
      <Label htmlFor={id} className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        Sort by
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
        <SelectTrigger id={id} className="h-10 w-full rounded-lg bg-background">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <SelectItem key={key} value={key}>
              {SORT_LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
