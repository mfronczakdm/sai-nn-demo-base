'use client';

import type React from 'react';
import { useEffect, useMemo } from 'react';
import NextLink from 'next/link';
import {
  NextImage as ContentSdkImage,
  useSitecore,
  type ImageField,
  type LinkField,
} from '@sitecore-content-sdk/nextjs';

import { NoDataFallback } from '@/utils/NoDataFallback';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ImageMapHotspotItemProps, ImageMapParams, ImageMapProps } from './image-map.props';

export type {
  ImageMapFields,
  ImageMapHotspotItemProps,
  ImageMapParams,
  ImageMapProps,
} from './image-map.props';

type ResolvedHotspot = {
  id: string;
  label: string;
  link: LinkField | undefined;
  left: number;
  top: number;
  width: number;
  height: number;
};

type ResolvedLink = {
  href: string;
  linktype: string;
};

type DatasourceShape = NonNullable<ImageMapProps['fields']>['data']['datasource'];

function getComponentFields(props: ImageMapProps): ImageMapProps['fields'] | undefined {
  return props.fields ?? (props.rendering?.fields as ImageMapProps['fields'] | undefined);
}

/** GraphQL `data.datasource` first, then layout-service field bags (see ImageBlock). */
function getDatasource(fields: ImageMapProps['fields'] | undefined): DatasourceShape | undefined {
  if (!fields || typeof fields !== 'object') return undefined;

  const record = fields as unknown as Record<string, unknown>;
  const data = record.data;

  if (data && typeof data === 'object') {
    const dataRecord = data as Record<string, unknown>;
    if (dataRecord.datasource && typeof dataRecord.datasource === 'object') {
      return dataRecord.datasource as DatasourceShape;
    }
    if ('Image' in dataRecord || 'image' in dataRecord || 'children' in dataRecord) {
      return dataRecord as DatasourceShape;
    }
  }

  if ('Image' in record || 'image' in record || 'children' in record) {
    return record as DatasourceShape;
  }

  return undefined;
}

function getImageField(datasource: DatasourceShape | undefined): ImageField | undefined {
  const record = datasource as Record<string, unknown> | undefined;
  if (!record) return undefined;

  const candidate = record.Image ?? record.image;
  if (!candidate || typeof candidate !== 'object') return undefined;

  if ('jsonValue' in candidate) {
    return (candidate as { jsonValue: ImageField }).jsonValue;
  }

  return candidate as ImageField;
}

function getHotspotItems(datasource: DatasourceShape | undefined): ImageMapHotspotItemProps[] {
  return datasource?.children?.results ?? [];
}

function parsePercentage(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null) return null;
  const raw = String(value).trim().replace(/%$/, '');
  if (!raw) return null;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function readHotspotFieldValue(
  item: ImageMapHotspotItemProps,
  ...keys: string[]
): string | number | undefined {
  const record = item as Record<string, unknown>;
  for (const key of keys) {
    const raw = record[key];
    if (raw == null || typeof raw !== 'object') continue;

    const field = raw as Record<string, unknown>;
    if ('jsonValue' in field) {
      const jsonValue = field.jsonValue as { value?: string | number } | undefined;
      if (jsonValue?.value != null) return jsonValue.value;
    }
    if ('value' in field && field.value != null) {
      return field.value as string | number;
    }
  }
  return undefined;
}

function resolveHotspots(items: ImageMapHotspotItemProps[]): ResolvedHotspot[] {
  const resolved: ResolvedHotspot[] = [];

  items.forEach((item, index) => {
    const left = parsePercentage(readHotspotFieldValue(item, 'X-pct', 'xPct', 'x-pct'));
    const top = parsePercentage(readHotspotFieldValue(item, 'Y-pct', 'yPct', 'y-pct'));
    const width = parsePercentage(readHotspotFieldValue(item, 'Width', 'width'));
    const height = parsePercentage(readHotspotFieldValue(item, 'Height', 'height'));
    const id = item.id ?? item.name ?? `hotspot-${index}`;

    if (left === null || top === null || width === null || height === null) {
      console.warn(
        `[ImageMap] Skipping hotspot "${id}" — missing or invalid X-pct, Y-pct, Width, or Height.`
      );
      return;
    }

    const label = String(readHotspotFieldValue(item, 'Label', 'label') ?? '').trim();
    const linkRaw = (item as Record<string, unknown>).Link ?? (item as Record<string, unknown>).link;
    const link =
      linkRaw && typeof linkRaw === 'object' && 'jsonValue' in linkRaw
        ? (linkRaw as { jsonValue: LinkField }).jsonValue
        : (linkRaw as LinkField | undefined);

    resolved.push({
      id,
      label,
      link,
      left,
      top,
      width,
      height,
    });
  });

  return resolved;
}

function debugLogHotspots(
  hotspotItems: ImageMapHotspotItemProps[],
  resolvedHotspots: ResolvedHotspot[],
  isEditing: boolean
): void {
  console.group('[ImageMap] Hotspot debug');
  console.log('Raw hotspot items from CMS:', hotspotItems.length, '(expect 2 if two children are configured)');
  console.log('Resolved hotspots (overlays rendered):', resolvedHotspots.length);
  console.log('Pages editing mode (blue boxes):', isEditing);

  if (!hotspotItems.length) {
    console.warn(
      '[ImageMap] No hotspot children in fields.data.datasource.children.results. Check component datasource query.'
    );
  }

  hotspotItems.forEach((item, index) => {
    console.log(`Hotspot #${index + 1}`, {
      id: item.id ?? item.name ?? `hotspot-${index}`,
      name: item.name,
      rawFields: {
        Label: readHotspotFieldValue(item, 'Label', 'label'),
        'X-pct': readHotspotFieldValue(item, 'X-pct', 'xPct', 'x-pct'),
        'Y-pct': readHotspotFieldValue(item, 'Y-pct', 'yPct', 'y-pct'),
        Width: readHotspotFieldValue(item, 'Width', 'width'),
        Height: readHotspotFieldValue(item, 'Height', 'height'),
      },
      parsedPercentages: {
        left: parsePercentage(readHotspotFieldValue(item, 'X-pct', 'xPct', 'x-pct')),
        top: parsePercentage(readHotspotFieldValue(item, 'Y-pct', 'yPct', 'y-pct')),
        width: parsePercentage(readHotspotFieldValue(item, 'Width', 'width')),
        height: parsePercentage(readHotspotFieldValue(item, 'Height', 'height')),
      },
    });
  });

  if (resolvedHotspots.length) {
    console.table(
      resolvedHotspots.map((hotspot) => ({
        id: hotspot.id,
        label: hotspot.label || '(no label)',
        left: `${hotspot.left}%`,
        top: `${hotspot.top}%`,
        width: `${hotspot.width}%`,
        height: `${hotspot.height}%`,
        hasLink: Boolean(hotspot.link?.value?.href),
      }))
    );
  }

  console.groupEnd();
}

function resolveGeneralLink(linkField: LinkField | undefined): ResolvedLink | null {
  const value = linkField?.value;
  const href = value?.href?.trim();
  if (!href || href === 'http://' || href === '#') {
    return null;
  }
  return {
    href,
    linktype: (value?.linktype ?? 'internal').toLowerCase(),
  };
}

function aspectRatioClass(params?: ImageMapParams): string | undefined {
  const raw = params?.AspectRatio?.trim();
  if (!raw) return undefined;
  const normalized = raw.replace(':', '/');
  return `aspect-[${normalized}]`;
}

function readImageDimensions(imageField: ImageField): { width?: number; height?: number } {
  const value = imageField.value;
  if (!value) return {};

  const toNumber = (n: unknown): number | undefined => {
    if (typeof n === 'number' && Number.isFinite(n) && n > 0) return n;
    if (typeof n === 'string') {
      const parsed = Number.parseInt(n, 10);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    return undefined;
  };

  return {
    width: toNumber(value.width),
    height: toNumber(value.height),
  };
}

function mapStageClassName(params?: ImageMapParams): string {
  const aspect = aspectRatioClass(params);
  if (aspect) {
    return cn('relative w-full max-w-full', aspect);
  }
  return 'relative inline-block w-fit max-w-none';
}

function hotspotPositionStyle(hotspot: ResolvedHotspot): React.CSSProperties {
  return {
    left: `${hotspot.left}%`,
    top: `${hotspot.top}%`,
    width: `${hotspot.width}%`,
    height: `${hotspot.height}%`,
  };
}

const hotspotHighlightClass =
  'absolute z-10 cursor-pointer rounded-sm border-2 border-amber-500/55 bg-amber-400/35 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)] transition-[background-color,border-color,box-shadow] hover:border-amber-500 hover:bg-amber-400/55 hover:shadow-[0_0_0_2px_rgba(251,191,36,0.35)] focus-visible:border-amber-600 focus-visible:bg-amber-400/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-600/80';

const hotspotEditingClass =
  'absolute z-10 flex cursor-default items-center justify-center rounded-sm border-2 border-primary bg-primary/30 p-1 text-center text-xs font-medium text-foreground shadow-sm';

type HotspotOverlayProps = {
  hotspot: ResolvedHotspot;
  isEditing: boolean;
};

function HotspotOverlay({ hotspot, isEditing }: HotspotOverlayProps): React.ReactElement {
  const style = hotspotPositionStyle(hotspot);
  const ariaLabel = hotspot.label || 'Hotspot';
  const resolved = resolveGeneralLink(hotspot.link);

  if (isEditing) {
    return (
      <div
        className={cn(hotspotEditingClass, 'text-foreground')}
        style={style}
        aria-label={ariaLabel}
        title={ariaLabel}
        data-hotspot-id={hotspot.id}
      >
        <span className="line-clamp-3 text-[10px] leading-tight sm:text-xs">
          {hotspot.label || hotspot.id}
        </span>
      </div>
    );
  }

  const regionClass = resolved ? hotspotHighlightClass : cn(hotspotHighlightClass, 'cursor-default');

  const region = !resolved ? (
    <div
      className={regionClass}
      style={style}
      aria-label={ariaLabel}
      title={ariaLabel}
      data-hotspot-id={hotspot.id}
    />
  ) : resolved.linktype === 'internal' ? (
    <NextLink
      href={resolved.href}
      prefetch={false}
      className={hotspotHighlightClass}
      style={style}
      aria-label={ariaLabel}
      title={ariaLabel}
      data-hotspot-id={hotspot.id}
    />
  ) : (
    <a
      href={resolved.href}
      target="_blank"
      rel="noopener noreferrer"
      className={hotspotHighlightClass}
      style={style}
      aria-label={ariaLabel}
      title={ariaLabel}
      data-hotspot-id={hotspot.id}
    />
  );

  if (!hotspot.label) {
    return region;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{region}</TooltipTrigger>
      <TooltipContent side="top">{hotspot.label}</TooltipContent>
    </Tooltip>
  );
}

function ImageMapImage({
  imageField,
  alt,
  constrainToAspectRatio,
  isEditing,
}: {
  imageField: ImageField | undefined;
  alt: string;
  constrainToAspectRatio: boolean;
  isEditing: boolean;
}): React.ReactElement | null {
  if (!imageField?.value?.src && !isEditing) {
    return null;
  }

  const { width, height } = readImageDimensions(imageField ?? { value: {} });

  if (constrainToAspectRatio) {
    return (
      <ContentSdkImage
        field={imageField}
        fill
        className="object-contain"
        alt={alt}
        sizes="100vw"
      />
    );
  }

  if (imageField?.value?.src && width && height) {
    return (
      <ContentSdkImage
        field={imageField}
        width={width}
        height={height}
        className="block h-auto w-auto max-w-none"
        alt={alt}
        style={{ width, height, maxWidth: 'none' }}
        unoptimized
      />
    );
  }

  return (
    <ContentSdkImage
      field={imageField}
      className="block h-auto w-auto max-w-none"
      alt={alt}
      style={{ maxWidth: 'none', width: 'auto', height: 'auto' }}
      unoptimized
    />
  );
}

export const Default: React.FC<ImageMapProps> = (props) => {
  const { params } = props;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  const fields = getComponentFields(props);
  const datasource = getDatasource(fields);
  const imageField = getImageField(datasource);
  const hotspotItems = useMemo(() => getHotspotItems(datasource), [datasource]);
  const resolvedHotspots = useMemo(() => resolveHotspots(hotspotItems), [hotspotItems]);

  useEffect(() => {
    debugLogHotspots(hotspotItems, resolvedHotspots, isEditing);
    console.debug('[ImageMap] fields source:', {
      fromComponentProps: Boolean(props.fields),
      fromRendering: Boolean(props.rendering?.fields),
      hasDatasource: Boolean(datasource),
      datasourceKeys: datasource ? Object.keys(datasource as Record<string, unknown>) : [],
    });
  }, [props.fields, props.rendering?.fields, datasource, hotspotItems, resolvedHotspots, isEditing]);

  if (fields !== undefined && fields !== null) {
    const altText = String(imageField?.value?.alt ?? '').trim() || 'Image map';
    const id = params?.RenderingIdentifier;
    const useAspectRatioLayout = Boolean(params?.AspectRatio?.trim());

    return (
      <section
        className={cn('image-map w-full overflow-x-auto', params?.styles)}
        id={id || undefined}
        data-component="ImageMap"
        data-hotspot-count={resolvedHotspots.length}
        data-hotspot-raw-count={hotspotItems.length}
      >
        <TooltipProvider delayDuration={200}>
          <div className={cn('mx-auto w-fit max-w-none', mapStageClassName(params))}>
            {(imageField || isEditing) && (
              <ImageMapImage
                imageField={imageField}
                alt={altText}
                constrainToAspectRatio={useAspectRatioLayout}
                isEditing={isEditing}
              />
            )}

            {resolvedHotspots.map((hotspot) => (
              <HotspotOverlay key={hotspot.id} hotspot={hotspot} isEditing={isEditing} />
            ))}
          </div>
        </TooltipProvider>
      </section>
    );
  }

  return <NoDataFallback componentName="ImageMap" />;
};
