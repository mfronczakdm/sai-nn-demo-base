'use client';

import type React from 'react';
import { useMemo } from 'react';
import NextImage from 'next/image';
import NextLink from 'next/link';
import {
  NextImage as ContentSdkImage,
  useSitecore,
  type Field,
  type ImageField,
  type LinkField,
} from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/** Parent ImageMap datasource fields (GraphQL aliases should match these keys). */
export type ImageMapFields = {
  data: {
    datasource?: {
      id?: string;
      image?: { jsonValue: ImageField };
      altText?: { jsonValue: Field<string> };
      children?: {
        results: ImageMapHotspotItem[];
      };
    };
  };
};

/** Child ImageMapHotspot item fields. */
export type ImageMapHotspotFields = {
  label?: { jsonValue: Field<string> };
  link?: { jsonValue: LinkField };
  /** Maps from Sitecore field `X-pct`. */
  xPct?: { jsonValue: Field<string> };
  /** Maps from Sitecore field `Y-pct`. */
  yPct?: { jsonValue: Field<string> };
  width?: { jsonValue: Field<string> };
  height?: { jsonValue: Field<string> };
};

/** One hotspot child item with Sitecore id and field bundle. */
export type ImageMapHotspotItem = ImageMapHotspotFields & {
  id: string;
  name?: string;
};

export type ImageMapParams = {
  /** Tailwind aspect ratio fraction, e.g. `16/9` (default) or `4/3`. */
  AspectRatio?: string;
  styles?: string;
  RenderingIdentifier?: string;
};

export type ImageMapProps = ComponentProps & {
  params?: ImageMapParams;
  fields?: ImageMapFields | null;
  /** Optional pre-resolved hotspots (e.g. from a data fetch); falls back to datasource children. */
  hotspots?: ImageMapHotspotItem[];
};

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

function parsePercentage(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null) return null;
  const raw = String(value).trim().replace(/%$/, '');
  if (!raw) return null;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function resolveHotspotItems(props: ImageMapProps): ImageMapHotspotItem[] {
  if (props.hotspots?.length) {
    return props.hotspots;
  }
  return props.fields?.data?.datasource?.children?.results ?? [];
}

function resolveHotspots(items: ImageMapHotspotItem[]): ResolvedHotspot[] {
  const resolved: ResolvedHotspot[] = [];

  for (const item of items) {
    const left = parsePercentage(item.xPct?.jsonValue?.value);
    const top = parsePercentage(item.yPct?.jsonValue?.value);
    const width = parsePercentage(item.width?.jsonValue?.value);
    const height = parsePercentage(item.height?.jsonValue?.value);

    if (left === null || top === null || width === null || height === null) {
      console.warn(
        `[ImageMap] Skipping hotspot "${item.id}" — missing or invalid X-pct, Y-pct, Width, or Height.`
      );
      continue;
    }

    resolved.push({
      id: item.id,
      label: (item.label?.jsonValue?.value ?? '').trim(),
      link: item.link?.jsonValue,
      left,
      top,
      width,
      height,
    });
  }

  return resolved;
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

function aspectRatioClass(params?: ImageMapParams): string {
  const raw = params?.AspectRatio?.trim();
  if (!raw) return 'aspect-video';
  const normalized = raw.replace(':', '/');
  return `aspect-[${normalized}]`;
}

function hotspotPositionStyle(hotspot: ResolvedHotspot): React.CSSProperties {
  return {
    left: `${hotspot.left}%`,
    top: `${hotspot.top}%`,
    width: `${hotspot.width}%`,
    height: `${hotspot.height}%`,
  };
}

const hotspotInteractiveClass =
  'absolute cursor-pointer bg-transparent transition-colors hover:bg-primary/15 hover:outline hover:outline-2 hover:outline-primary/60 focus-visible:bg-primary/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

const hotspotEditingClass =
  'absolute flex cursor-default items-center justify-center border-2 border-primary bg-primary/25 p-1 text-center text-xs font-medium text-primary-foreground shadow-sm';

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

  const region = !resolved ? (
    <div
      className={cn(hotspotInteractiveClass, 'cursor-default')}
      style={style}
      aria-label={ariaLabel}
      title={ariaLabel}
      data-hotspot-id={hotspot.id}
    />
  ) : resolved.linktype === 'internal' ? (
    <NextLink
      href={resolved.href}
      prefetch={false}
      className={hotspotInteractiveClass}
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
      className={hotspotInteractiveClass}
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
  isEditing,
}: {
  imageField: ImageField;
  alt: string;
  isEditing: boolean;
}): React.ReactElement | null {
  const src = imageField.value?.src;

  if (isEditing) {
    return (
      <ContentSdkImage
        field={imageField}
        fill
        className="object-contain"
        alt={alt}
        sizes="(max-width: 768px) 100vw, min(1200px, 100vw)"
      />
    );
  }

  if (!src) {
    return null;
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      fill
      className="object-contain"
      sizes="(max-width: 768px) 100vw, min(1200px, 100vw)"
    />
  );
}

export const Default: React.FC<ImageMapProps> = (props) => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  const datasource = fields?.data?.datasource;
  const imageField = datasource?.image?.jsonValue;

  const hotspots = useMemo(() => resolveHotspotItems(props), [props]);
  const resolvedHotspots = useMemo(() => resolveHotspots(hotspots), [hotspots]);

  if (fields == null) {
    return null;
  }

  const altText =
    String(datasource?.altText?.jsonValue?.value ?? '').trim() ||
    String(imageField?.value?.alt ?? '').trim() ||
    'Image map';

  const hasImage = Boolean(imageField?.value?.src) || isEditing;

  if (!hasImage) {
    return null;
  }

  const id = params?.RenderingIdentifier;

  return (
    <section
      className={cn('image-map w-full', params?.styles)}
      id={id || undefined}
      data-component="ImageMap"
    >
      <TooltipProvider delayDuration={200}>
        <div className={cn('relative mx-auto w-full max-w-7xl', aspectRatioClass(params))}>
          {imageField ? (
            <ImageMapImage imageField={imageField} alt={altText} isEditing={isEditing} />
          ) : null}

          {resolvedHotspots.map((hotspot) => (
            <HotspotOverlay key={hotspot.id} hotspot={hotspot} isEditing={isEditing} />
          ))}
        </div>
      </TooltipProvider>
    </section>
  );
};
