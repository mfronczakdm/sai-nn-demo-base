'use client';

import type { SearchResultItem } from './types';
import { BookOpen, CircleHelp, FileText, GraduationCap, Video } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { HighlightMatch } from './highlight-match';

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function ContentTypeIcon({ type }: { type: SearchResultItem['contentType'] }) {
  const iconClass = 'h-4 w-4 shrink-0';
  switch (type) {
    case 'pdf':
      return <FileText className={iconClass} aria-hidden />;
    case 'article':
      return <BookOpen className={iconClass} aria-hidden />;
    case 'video':
      return <Video className={iconClass} aria-hidden />;
    case 'faq':
      return <CircleHelp className={iconClass} aria-hidden />;
    case 'documentation':
    case 'guide':
      return <GraduationCap className={iconClass} aria-hidden />;
    default:
      return <FileText className={iconClass} aria-hidden />;
  }
}

function contentTypeLabel(type: SearchResultItem['contentType']): string {
  if (type === 'guide') return 'Guide';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

const BADGE_COPY: Record<string, string> = {
  recommended: 'Recommended',
  popular: 'Popular',
  new: 'New',
};

export interface ResultCardProps {
  item: SearchResultItem;
  query: string;
  className?: string;
}

export function ResultCard({ item, query, className }: ResultCardProps) {
  return (
    <Card
      className={cn(
        'border-border/80 transition-shadow duration-200 hover:shadow-md',
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div
            className="bg-muted text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
            title={contentTypeLabel(item.contentType)}
          >
            <ContentTypeIcon type={item.contentType} />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="#"
                className="text-foreground hover:text-primary text-base font-semibold leading-snug underline-offset-4 hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                <HighlightMatch text={item.title} query={query} />
              </a>
              {item.badges.map((b) => (
                <Badge
                  key={b}
                  variant={b === 'recommended' ? 'default' : 'secondary'}
                  className="text-xs font-medium"
                >
                  {BADGE_COPY[b]}
                </Badge>
              ))}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              <HighlightMatch text={item.snippet} query={query} />
            </p>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="capitalize">{contentTypeLabel(item.contentType)}</span>
              <span aria-hidden>·</span>
              <span>Updated {formatDate(item.lastUpdated)}</span>
              <span aria-hidden>·</span>
              <span className="max-w-[220px] truncate" title={item.author}>
                {item.author}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
