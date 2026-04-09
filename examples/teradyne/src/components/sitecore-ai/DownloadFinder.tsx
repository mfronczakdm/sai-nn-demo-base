'use client';

import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppPlaceholder, Text, type Field } from '@sitecore-content-sdk/nextjs';
import { Download as DownloadIcon } from 'lucide-react';

import { AIAssistant } from '@/components/sitecore-ai/AIAssistant';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TERADYNE_PORTFOLIO,
  type Download as DownloadRow,
  type DownloadType,
  type MatchTarget,
  parsePreferredDownloadType,
} from '@/data/teradyne-products';
import type { ComponentProps } from '@/lib/component-props';
import { cn } from '@/lib/utils';

const NONE = '__none__';

const TYPE_ORDER: DownloadType[] = ['Firmware', 'Software', 'Driver', 'Documentation'];

function sortDownloads(downloads: DownloadRow[], preferred?: DownloadType): DownloadRow[] {
  return [...downloads].sort((a, b) => {
    if (preferred) {
      if (a.type === preferred && b.type !== preferred) return -1;
      if (b.type === preferred && a.type !== preferred) return 1;
    }
    return TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type);
  });
}

function badgeClassForType(t: DownloadType): string {
  switch (t) {
    case 'Firmware':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100';
    case 'Driver':
      return 'border-sky-500/40 bg-sky-500/10 text-sky-900 dark:text-sky-100';
    case 'Software':
      return 'border-violet-500/40 bg-violet-500/10 text-violet-900 dark:text-violet-100';
    case 'Documentation':
    default:
      return 'border-muted-foreground/30 bg-muted/40 text-foreground';
  }
}

export type DownloadFinderFields = {
  title?: Field<string>;
  subtitle?: Field<string>;
};

export type DownloadFinderProps = ComponentProps & {
  fields?: DownloadFinderFields;
};

function StepShell({
  step,
  title,
  description,
  children,
  disabled,
  active,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <Card
      className={cn(
        'border-border/80 transition-shadow duration-300',
        active && 'ring-primary/20 shadow-md ring-2',
        disabled && 'opacity-60'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
              active
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {step}
          </span>
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

export const Default: React.FC<DownloadFinderProps> = (props) => {
  const { rendering, params, fields, page } = props;
  const placeholderName = params?.PlaceholderName ?? params?.placeholderName ?? 'download-finder-aux';

  const [divisionIndex, setDivisionIndex] = useState(-1);
  const [categoryIndex, setCategoryIndex] = useState(-1);
  const [productIndex, setProductIndex] = useState(-1);
  const [preferredType, setPreferredType] = useState<DownloadType | undefined>();
  const [aiHighlight, setAiHighlight] = useState({ division: false, category: false, product: false });
  const [isLoading, setIsLoading] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);
  const skipLoadingRef = useRef(true);
  const [auxComponentMap, setAuxComponentMap] = useState<
    typeof import('.sitecore/component-map').default | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    void import('.sitecore/component-map').then((mod) => {
      if (!cancelled) setAuxComponentMap(mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (skipLoadingRef.current) {
      skipLoadingRef.current = false;
      return;
    }
    setIsLoading(true);
    const t = window.setTimeout(() => setIsLoading(false), 420);
    return () => window.clearTimeout(t);
  }, [divisionIndex, categoryIndex, productIndex]);

  const division = divisionIndex >= 0 ? TERADYNE_PORTFOLIO[divisionIndex] : undefined;
  const category =
    division && categoryIndex >= 0 ? division.categories[categoryIndex] : undefined;
  const product = category && productIndex >= 0 ? category.products[productIndex] : undefined;

  const sortedDownloads = useMemo(
    () => (product ? sortDownloads(product.downloads, preferredType) : []),
    [product, preferredType]
  );

  const recommended = sortedDownloads.slice(0, 2);

  const clearHighlight = useCallback(() => {
    setAiHighlight({ division: false, category: false, product: false });
  }, []);

  const handleSelectChange = useCallback(() => {
    clearHighlight();
    setPreferredType(undefined);
  }, [clearHighlight]);

  const handleDivisionChange = (v: string) => {
    handleSelectChange();
    if (v === NONE) {
      setDivisionIndex(-1);
      setCategoryIndex(-1);
      setProductIndex(-1);
      return;
    }
    setDivisionIndex(Number(v));
    setCategoryIndex(-1);
    setProductIndex(-1);
  };

  const handleCategoryChange = (v: string) => {
    handleSelectChange();
    if (v === NONE) {
      setCategoryIndex(-1);
      setProductIndex(-1);
      return;
    }
    setCategoryIndex(Number(v));
    setProductIndex(-1);
  };

  const handleProductChange = (v: string) => {
    handleSelectChange();
    if (v === NONE) {
      setProductIndex(-1);
      return;
    }
    setProductIndex(Number(v));
  };

  const handleAIMatch = useCallback(
    (target: MatchTarget, typeHint: ReturnType<typeof parsePreferredDownloadType>) => {
      setDivisionIndex(target.divisionIndex);
      setCategoryIndex(target.categoryIndex);
      setProductIndex(target.productIndex);
      setPreferredType(typeHint);
      setAiHighlight({ division: true, category: true, product: true });
    },
    []
  );

  const handleDemoDownload = (row: DownloadRow) => {
    setDemoNotice(`Demo: "${row.name}" (${row.version}) would download in production.`);
    window.setTimeout(() => setDemoNotice(null), 4500);
  };

  const titleField = fields?.title;
  const subtitleField = fields?.subtitle;

  return (
    <section
      className={cn('bg-background text-foreground', params?.styles)}
      data-component="download-finder"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
        <header className="mb-8 space-y-2">
          {titleField?.value ? (
            <Text
              field={titleField}
              tag="h1"
              className="text-3xl font-semibold tracking-tight md:text-4xl"
            />
          ) : (
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Download Finder</h1>
          )}
          {subtitleField?.value ? (
            <Text
              field={subtitleField}
              tag="p"
              className="text-muted-foreground max-w-3xl text-base"
            />
          ) : (
            <p className="text-muted-foreground max-w-3xl text-base">
              Select your division, product family, and platform to view firmware, drivers,
              software, and documentation—similar to a guided support download experience.
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <AIAssistant onMatch={handleAIMatch} onClearHighlight={clearHighlight} />
          </div>

          <div className="space-y-6 lg:col-span-8">
            <div
              key={`flow-${divisionIndex}-${categoryIndex}-${productIndex}`}
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both space-y-6 duration-300"
            >
              <StepShell
                step={1}
                title="Division"
                description="Choose your business unit."
                active={divisionIndex >= 0}
              >
                <div className="space-y-2">
                  <Label htmlFor="df-division">Division</Label>
                  <Select
                    value={divisionIndex >= 0 ? String(divisionIndex) : NONE}
                    onValueChange={handleDivisionChange}
                  >
                    <SelectTrigger
                      id="df-division"
                      className={cn(
                        'bg-background w-full',
                        aiHighlight.division &&
                          'ring-2 ring-emerald-500/70 ring-offset-2 ring-offset-background'
                      )}
                    >
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Select division</SelectItem>
                      {TERADYNE_PORTFOLIO.map((d, i) => (
                        <SelectItem key={d.name} value={String(i)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </StepShell>

              <StepShell
                step={2}
                title="Category"
                description="Narrow down to a solution family."
                disabled={divisionIndex < 0}
                active={categoryIndex >= 0}
              >
                <div
                  key={`cat-${divisionIndex}`}
                  className="animate-in fade-in slide-in-from-left-2 duration-300"
                >
                  <div className="space-y-2">
                    <Label htmlFor="df-category">Category</Label>
                    <Select
                      value={categoryIndex >= 0 ? String(categoryIndex) : NONE}
                      onValueChange={handleCategoryChange}
                      disabled={divisionIndex < 0}
                    >
                      <SelectTrigger
                        id="df-category"
                        className={cn(
                          'bg-background w-full',
                          aiHighlight.category &&
                            'ring-2 ring-emerald-500/70 ring-offset-2 ring-offset-background'
                        )}
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>Select category</SelectItem>
                        {(division?.categories ?? []).map((c, i) => (
                          <SelectItem key={c.name} value={String(i)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </StepShell>

              <StepShell
                step={3}
                title="Product"
                description="Pick your platform or system."
                disabled={categoryIndex < 0}
                active={productIndex >= 0}
              >
                <div
                  key={`prod-${divisionIndex}-${categoryIndex}`}
                  className="animate-in fade-in slide-in-from-left-2 duration-300"
                >
                  <div className="space-y-2">
                    <Label htmlFor="df-product">Product</Label>
                    <Select
                      value={productIndex >= 0 ? String(productIndex) : NONE}
                      onValueChange={handleProductChange}
                      disabled={categoryIndex < 0}
                    >
                      <SelectTrigger
                        id="df-product"
                        className={cn(
                          'bg-background w-full',
                          aiHighlight.product &&
                            'ring-2 ring-emerald-500/70 ring-offset-2 ring-offset-background'
                        )}
                      >
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>Select product</SelectItem>
                        {(category?.products ?? []).map((p, i) => (
                          <SelectItem key={p.name} value={String(i)}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </StepShell>
            </div>

            {product && (
              <div
                key={product.name}
                className="animate-in fade-in zoom-in-95 slide-in-from-bottom-2 space-y-4 duration-300"
              >
                <Card className="border-border/80 overflow-hidden">
                  <CardHeader className="border-border/60 border-b bg-muted/20">
                    <CardTitle className="text-lg">Downloads</CardTitle>
                    <CardDescription>
                      {product.name}
                      {preferredType && (
                        <span className="text-foreground mt-1 block text-sm font-medium">
                          AI type preference: {preferredType} (sorted first below)
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {demoNotice && (
                      <p
                        className="bg-primary/10 text-foreground rounded-md border border-primary/20 px-3 py-2 text-sm"
                        role="status"
                      >
                        {demoNotice}
                      </p>
                    )}

                    {isLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <>
                        <div>
                          <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">
                            Recommended downloads
                          </h3>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {recommended.map((row) => (
                              <div
                                key={row.id}
                                className="border-border/80 flex flex-col rounded-lg border bg-card p-4 shadow-sm"
                              >
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={cn('font-medium', badgeClassForType(row.type))}
                                  >
                                    {row.type}
                                  </Badge>
                                  <span className="text-muted-foreground text-xs">{row.version}</span>
                                </div>
                                <p className="text-sm font-medium leading-snug">{row.name}</p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                  {row.size} · {row.date}
                                </p>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="mt-3 w-full sm:w-auto"
                                  variant="secondary"
                                  onClick={() => handleDemoDownload(row)}
                                >
                                  <DownloadIcon className="mr-2 h-4 w-4" aria-hidden />
                                  Download
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">
                            All files
                          </h3>
                          <ScrollArea className="max-h-[min(28rem,55vh)] rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                  <TableHead className="w-[32%]">Name</TableHead>
                                  <TableHead>Version</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Size</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sortedDownloads.map((row) => (
                                  <TableRow key={row.id}>
                                    <TableCell className="font-medium">{row.name}</TableCell>
                                    <TableCell>{row.version}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          'font-medium',
                                          badgeClassForType(row.type)
                                        )}
                                      >
                                        {row.type}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{row.size}</TableCell>
                                    <TableCell className="text-muted-foreground">{row.date}</TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDemoDownload(row)}
                                      >
                                        <DownloadIcon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                                        Download
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="border-border/60 rounded-lg border border-dashed p-4">
              <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                Authoring zone
              </p>
              {auxComponentMap ? (
                <AppPlaceholder
                  name={placeholderName}
                  rendering={rendering}
                  page={page}
                  componentMap={auxComponentMap}
                />
              ) : (
                <div
                  className="bg-muted/20 text-muted-foreground flex min-h-16 items-center justify-center rounded-md text-sm"
                  data-placeholder={placeholderName}
                >
                  Loading placeholder…
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
