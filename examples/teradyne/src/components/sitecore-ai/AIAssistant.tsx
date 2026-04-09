'use client';

import type React from 'react';
import { useCallback, useState } from 'react';
import { Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  parsePreferredDownloadType,
  scorePortfolioMatch,
  type MatchTarget,
} from '@/data/teradyne-products';

export type AIAssistantProps = {
  className?: string;
  onMatch: (target: MatchTarget, preferredType: ReturnType<typeof parsePreferredDownloadType>) => void;
  onClearHighlight?: () => void;
};

export const AIAssistant: React.FC<AIAssistantProps> = ({
  className,
  onMatch,
  onClearHighlight,
}) => {
  const [query, setQuery] = useState('');
  const [lastResult, setLastResult] = useState<{
    target: MatchTarget;
    preferredType: ReturnType<typeof parsePreferredDownloadType>;
  } | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const handleApply = useCallback(() => {
    onClearHighlight?.();
    const trimmed = query.trim();
    if (!trimmed) {
      setHint('Describe what you need—for example firmware for UltraFLEX or MiR600 software.');
      setLastResult(null);
      return;
    }

    const preferredType = parsePreferredDownloadType(trimmed);
    const target = scorePortfolioMatch(trimmed);

    if (!target) {
      setHint(
        'No strong match yet. Try a product name (e.g. J750Ex, UR10e, Spectrum-9100) or division keywords.'
      );
      setLastResult(null);
      return;
    }

    setLastResult({ target, preferredType });
    setHint(null);
    onMatch(target, preferredType);
  }, [onClearHighlight, onMatch, query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <Card
      className={cn(
        'border-border/80 bg-card/95 shadow-sm backdrop-blur-sm',
        className
      )}
    >
      <CardHeader className="space-y-1 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <Sparkles className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Sitecore AI Assistant
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Natural-language pathing (demo). No external AI services—keyword scoring only.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-download-query">What do you need?</Label>
          <Input
            id="ai-download-query"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (hint) setHint(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder='e.g. "UltraFLEX firmware" or "driver for MiR250"'
            autoComplete="off"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground file:text-foreground"
          />
        </div>
        <Button type="button" className="w-full" onClick={handleApply}>
          Find downloads
        </Button>

        {hint && (
          <p
            className="text-muted-foreground border-border/60 rounded-md border bg-muted/30 px-3 py-2 text-sm"
            role="status"
          >
            {hint}
          </p>
        )}

        {lastResult && (
          <ScrollArea className="max-h-48 rounded-md border border-emerald-500/25 bg-emerald-500/5">
            <div className="space-y-2 p-3 pr-4">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Match applied
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="font-normal">
                  Score {lastResult.target.score}
                </Badge>
                {lastResult.preferredType && (
                  <Badge variant="outline" className="font-normal">
                    Type hint: {lastResult.preferredType}
                  </Badge>
                )}
              </div>
              <ul className="text-muted-foreground space-y-1 text-xs leading-relaxed">
                <li>
                  <span className="text-foreground font-medium">Division:</span>{' '}
                  {lastResult.target.divisionName}
                </li>
                <li>
                  <span className="text-foreground font-medium">Category:</span>{' '}
                  {lastResult.target.categoryName}
                </li>
                <li>
                  <span className="text-foreground font-medium">Product:</span>{' '}
                  {lastResult.target.productName}
                </li>
              </ul>
            </div>
          </ScrollArea>
        )}

        <p className="text-muted-foreground text-xs leading-snug">
          Matching prioritizes product names, then category and division text. Short acronyms (UR,
          MiR, IQ) work best when paired with a model number.
        </p>
      </CardContent>
    </Card>
  );
};
