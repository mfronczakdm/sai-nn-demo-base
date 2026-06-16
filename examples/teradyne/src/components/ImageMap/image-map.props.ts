import type { ComponentProps } from '@/lib/component-props';
import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

export interface ImageMapParams {
  /** Optional Tailwind aspect ratio (e.g. `16/9`). Omit to use the image's intrinsic pixel size. */
  AspectRatio?: string;
  styles?: string;
  RenderingIdentifier?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface ImageMapFields {
  data: {
    datasource?: {
      id?: string;
      Image?: { jsonValue: ImageField };
      children?: {
        results: ImageMapHotspotItemProps[];
      };
    };
  };
}

export type ImageMapHotspotField<T> = {
  jsonValue?: T;
  value?: T extends LinkField ? string | LinkField['value'] : string;
};

export type ImageMapHotspotItemProps = {
  id?: string;
  name?: string;
  /** GraphQL / layout service field bag (lowercase matches Edge field aliases). */
  label?: ImageMapHotspotField<Field<string>>;
  link?: ImageMapHotspotField<LinkField>;
  x?: ImageMapHotspotField<Field<string>>;
  y?: ImageMapHotspotField<Field<string>>;
  width?: ImageMapHotspotField<Field<string>>;
  height?: ImageMapHotspotField<Field<string>>;
  /** PascalCase fallbacks for layout-service payloads. */
  Label?: ImageMapHotspotField<Field<string>>;
  Link?: ImageMapHotspotField<LinkField>;
  X?: ImageMapHotspotField<Field<string>>;
  Y?: ImageMapHotspotField<Field<string>>;
  Width?: ImageMapHotspotField<Field<string>>;
  Height?: ImageMapHotspotField<Field<string>>;
};

export interface ImageMapProps extends ComponentProps {
  params: ImageMapParams;
  fields?: ImageMapFields;
}