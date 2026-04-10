'use client';

import type React from 'react';
import { useCallback, useMemo } from 'react';
import {
  Archive,
  Download,
  FileText,
  FileType,
  FolderOpen,
  Package,
  Presentation,
  Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

/** File types supported by the hub (maps to icons and badges for Sitecore-driven content). */
export type DownloadFileType = 'PDF' | 'PPT' | 'PPTX' | 'DOC' | 'DOCX' | 'ZIP';

/** Category keys for filtering — align with CMS taxonomy when integrating. */
export type DownloadCategoryId = 'presentations' | 'guides' | 'tools';

export interface DownloadAsset {
  id: string;
  title: string;
  description: string;
  fileType: DownloadFileType;
  /** Human-readable size label, e.g. "2.4 MB". */
  fileSizeLabel: string;
  category: DownloadCategoryId;
  isFeatured: boolean;
  isNew?: boolean;
}

export const DOWNLOAD_HUB_CATEGORY_LABELS: Record<DownloadCategoryId, string> = {
  presentations: 'Presentations',
  guides: 'Guides',
  tools: 'Tools',
};

const TAB_VALUES = ['all', 'presentations', 'guides', 'tools'] as const;
export type DownloadHubTabValue = (typeof TAB_VALUES)[number];

export interface DownloadHubProps {
  /** Section heading — override for localized / Sitecore copy. */
  heading?: string;
  /** Supporting text under the heading. */
  description?: string;
  /** Resource rows; defaults to built-in Teradyne Automotive TUGx sample set. */
  items?: DownloadAsset[];
  className?: string;
  /** Called when a single asset download is triggered (wire to analytics or blob URL). */
  onDownloadAsset?: (asset: DownloadAsset) => void;
  /** Called for “Download all” (bundle or zip workflow in production). */
  onDownloadAll?: (assets: DownloadAsset[]) => void;
}

/** Curated mock data: Teradyne Automotive / TUGx-style technical collateral (8 items). */
export const TUGX_AUTOMOTIVE_SAMPLE_DOWNLOADS: DownloadAsset[] = [
  {
    id: 'tugx-auf-01',
    title: 'High-Voltage EV Inverter Characterization on ETS: TUGx Munich Workbook',
    description:
      'Waveform planning, guardbanding, and repeatability tips for traction-inverter power-semiconductor validation at production speeds.',
    fileType: 'PPTX',
    fileSizeLabel: '18.2 MB',
    category: 'presentations',
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'tugx-auf-02',
    title: 'UltraFLEX Multisite Sequencing for Automotive PMICs: Tuning Lab Notes',
    description:
      'Site-to-site balancing, instrument sharing patterns, and constraint-aware scheduling for mixed-signal PMIC lanes on automotive SoCs.',
    fileType: 'PDF',
    fileSizeLabel: '4.7 MB',
    category: 'guides',
    isFeatured: true,
  },
  {
    id: 'tugx-auf-03',
    title: 'SLT Stress Paths for Safety-Critical ECUs: Reliability Playbook',
    description:
      'System-level test recipes that mirror field mission profiles for ADAS compute modules, including datalog triggers and stop-on-fail strategies.',
    fileType: 'PDF',
    fileSizeLabel: '6.1 MB',
    category: 'guides',
    isFeatured: false,
    isNew: true,
  },
  {
    id: 'tugx-auf-04',
    title: 'Throughput Levers on UltraFLEX: Automotive Test-Time Reduction Checklist',
    description:
      'Prioritized checklist for index time, parallelism, intelligent binning, and handler integration in high-volume automotive lines.',
    fileType: 'PDF',
    fileSizeLabel: '1.9 MB',
    category: 'tools',
    isFeatured: false,
  },
  {
    id: 'tugx-auf-05',
    title: 'IG-XL Automation Patterns for Recurring Automotive Regression Suites',
    description:
      'Starter flows, naming conventions, and reusable blocks for nightly regression on platform builds across multiple vehicle programs.',
    fileType: 'ZIP',
    fileSizeLabel: '12.4 MB',
    category: 'tools',
    isFeatured: true,
  },
  {
    id: 'tugx-auf-06',
    title: 'Mixed-Signal Automotive SoC Debugging: Intermittent Failure Field Notes',
    description:
      'Yield-closure workflows from recent TUGx sessions—correlating datalog signatures, shmoo interpretation, and multisite isolation tactics.',
    fileType: 'PDF',
    fileSizeLabel: '5.3 MB',
    category: 'guides',
    isFeatured: false,
  },
  {
    id: 'tugx-auf-07',
    title: 'Production Board-Test Coverage Planning for Variant-Heavy Automotive ECUs',
    description:
      'Structured approach to BOM deltas, fixture reuse, and test-point budgeting when a single line supports multiple ECU derivatives.',
    fileType: 'DOC',
    fileSizeLabel: '892 KB',
    category: 'guides',
    isFeatured: false,
  },
  {
    id: 'tugx-auf-08',
    title: 'Protocol-Aware Bring-Up for Automotive SerDes Lanes on UltraFLEX',
    description:
      'Desk-level checklist for margining, deskew, and BER-oriented loops when validating high-speed links prior to full vehicle integration.',
    fileType: 'PPT',
    fileSizeLabel: '22.8 MB',
    category: 'presentations',
    isFeatured: false,
    isNew: true,
  },
];

function filterAssetsByTab(assets: DownloadAsset[], tab: DownloadHubTabValue): DownloadAsset[] {
  if (tab === 'all') return assets;
  return assets.filter((a) => a.category === tab);
}

function FileTypeIcon({ fileType, className }: { fileType: DownloadFileType; className?: string }) {
  const common = cn('size-5 shrink-0', className);
  switch (fileType) {
    case 'PDF':
      return <FileText className={cn(common, 'text-red-600 dark:text-red-400')} aria-hidden />;
    case 'PPT':
    case 'PPTX':
      return <Presentation className={cn(common, 'text-orange-600 dark:text-orange-400')} aria-hidden />;
    case 'DOC':
    case 'DOCX':
      return <FileType className={cn(common, 'text-blue-600 dark:text-blue-400')} aria-hidden />;
    case 'ZIP':
      return <Archive className={cn(common, 'text-violet-600 dark:text-violet-400')} aria-hidden />;
    default: {
      const _exhaustive: never = fileType;
      return _exhaustive;
    }
  }
}

export interface DownloadCardProps {
  asset: DownloadAsset;
  onDownload: (asset: DownloadAsset) => void;
  style?: React.CSSProperties;
  className?: string;
}

export function DownloadCard({ asset, onDownload, style, className }: DownloadCardProps) {
  const categoryLabel = DOWNLOAD_HUB_CATEGORY_LABELS[asset.category];

  return (
    <Card
      style={style}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300',
        'hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-lg',
        asset.isFeatured &&
          'border-primary/25 bg-gradient-to-b from-primary/[0.06] to-card ring-1 ring-primary/15'
      )}
    >
      {asset.isFeatured && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0"
          aria-hidden
        />
      )}
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex size-11 items-center justify-center rounded-xl border bg-muted/60 shadow-inner"
            aria-hidden
          >
            <FileTypeIcon fileType={asset.fileType} />
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide">
              {asset.fileType}
            </Badge>
            {asset.isNew && (
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90 dark:bg-emerald-500">
                New
              </Badge>
            )}
            {asset.isFeatured && (
              <Badge variant="secondary" className="gap-0.5 pr-2">
                <Sparkles className="size-3" aria-hidden />
                Featured
              </Badge>
            )}
          </div>
        </div>
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">
            {categoryLabel}
          </p>
          <CardTitle className="text-lg leading-snug tracking-tight">{asset.title}</CardTitle>
          <CardDescription className="mt-2 line-clamp-3 text-pretty">{asset.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end pb-4 pt-0">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Package className="size-3.5 shrink-0" aria-hidden />
          <span>{asset.fileSizeLabel}</span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto border-t bg-muted/30 pt-4">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="w-full rounded-xl shadow-sm transition-transform group-hover:shadow-md"
          onClick={() => onDownload(asset)}
          aria-label={`Download ${asset.title} (${asset.fileType}, ${asset.fileSizeLabel})`}
        >
          <Download className="size-4" aria-hidden />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}

export interface DownloadGridProps {
  items: DownloadAsset[];
  onDownloadAsset: (asset: DownloadAsset) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DownloadGrid({
  items,
  onDownloadAsset,
  emptyTitle = 'No downloads in this view',
  emptyDescription = 'Try another category or clear filters to see Teradyne Automotive TUGx materials.',
  className,
}: DownloadGridProps) {
  if (items.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center shadow-inner',
          className
        )}
      >
        <FolderOpen className="text-muted-foreground mb-4 size-12" aria-hidden />
        <h3 className="text-foreground text-lg font-semibold tracking-tight">{emptyTitle}</h3>
        <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <ul
      className={cn(
        'grid list-none gap-5 sm:grid-cols-2 xl:grid-cols-3',
        '[&>li]:animate-in [&>li]:fade-in [&>li]:slide-in-from-bottom-2 [&>li]:fill-mode-both [&>li]:duration-500',
        className
      )}
      aria-label="Downloadable resources"
    >
      {items.map((asset, index) => (
        <li
          key={asset.id}
          className="h-full"
          style={{ animationDelay: `${index * 55}ms` }}
        >
          <DownloadCard asset={asset} onDownload={onDownloadAsset} />
        </li>
      ))}
    </ul>
  );
}

export interface CategoryFilterProps {
  className?: string;
}

/** Tabs aligned with `DownloadHubTabValue` — pair with matching `TabsContent` values. */
export function CategoryFilter({ className }: CategoryFilterProps) {
  return (
    <TabsList
      className={cn(
        'grid h-auto w-full max-w-full grid-cols-2 gap-1 rounded-xl p-1.5 sm:inline-flex sm:max-w-2xl sm:grid-cols-none',
        className
      )}
      role="tablist"
      aria-label="Filter downloads by category"
    >
      <TabsTrigger value="all" className="rounded-lg px-4 py-2 text-sm">
        All
      </TabsTrigger>
      <TabsTrigger value="presentations" className="rounded-lg px-4 py-2 text-sm">
        Presentations
      </TabsTrigger>
      <TabsTrigger value="guides" className="rounded-lg px-4 py-2 text-sm">
        Guides
      </TabsTrigger>
      <TabsTrigger value="tools" className="rounded-lg px-4 py-2 text-sm">
        Tools
      </TabsTrigger>
    </TabsList>
  );
}

const DEFAULT_HEADING = 'Automotive download hub';
const DEFAULT_DESCRIPTION =
  'Teradyne Automotive TUGx collateral—UltraFLEX, ETS, and system-level test strategies, software depth, and productivity patterns for your eKnowledge workspace.';

export default function DownloadHub({
  heading = DEFAULT_HEADING,
  description = DEFAULT_DESCRIPTION,
  items = TUGX_AUTOMOTIVE_SAMPLE_DOWNLOADS,
  className,
  onDownloadAsset,
  onDownloadAll,
}: DownloadHubProps) {
  const handleDownloadAsset = useCallback(
    (asset: DownloadAsset) => {
      if (onDownloadAsset) {
        onDownloadAsset(asset);
        return;
      }
      // Mock download — replace with blob URL or CMS asset link.
      console.info('[DownloadHub] mock download:', asset.id, asset.title);
    },
    [onDownloadAsset]
  );

  const handleDownloadAll = useCallback(() => {
    if (onDownloadAll) {
      onDownloadAll(items);
      return;
    }
    if (items.length === 0) {
      console.info('[DownloadHub] mock download all: no items in hub');
      return;
    }
    console.info('[DownloadHub] mock download all:', items.map((a) => a.id).join(', '));
  }, [items, onDownloadAll]);

  const featuredCount = useMemo(() => items.filter((a) => a.isFeatured).length, [items]);

  return (
    <section
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500',
        className
      )}
      aria-labelledby="download-hub-heading"
    >
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-md font-normal">
              Teradyne Automotive
            </Badge>
            <Badge variant="secondary" className="rounded-md">
              TUGx / eKnowledge
            </Badge>
          </div>
          <h2 id="download-hub-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            {heading}
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed md:text-lg">{description}</p>
          {featuredCount > 0 && (
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium">{featuredCount}</span> featured resources in this
              collection.
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-dashed"
            onClick={handleDownloadAll}
            aria-label="Download all resources in this hub (mock action)"
          >
            <Package className="size-4" aria-hidden />
            Download all
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <CategoryFilter />
        {TAB_VALUES.map((tab) => {
          const filtered = filterAssetsByTab(items, tab);
          return (
            <TabsContent key={tab} value={tab} className="mt-8 focus-visible:outline-none">
              <DownloadGrid items={filtered} onDownloadAsset={handleDownloadAsset} />
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}
