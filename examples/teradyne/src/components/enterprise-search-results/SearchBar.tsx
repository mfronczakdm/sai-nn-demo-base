'use client';

import type React from 'react';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search knowledge base…',
  className,
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex w-full flex-col gap-2 sm:flex-row sm:items-center', className)}
    >
      <div className="relative flex-1">
        <Search
          className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 rounded-lg border-border/80 bg-background pl-10 pr-4 shadow-sm"
          aria-label="Search"
        />
      </div>
      <Button type="submit" className="h-11 shrink-0 sm:w-auto">
        Search
      </Button>
    </form>
  );
}
