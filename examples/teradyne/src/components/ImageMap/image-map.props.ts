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

export type ImageMapHotspotItemProps = {
  id?: string;
  name?: string;
  Label?: { jsonValue: Field<string> };
  Link?: { jsonValue: LinkField };
  'X-pct'?: { jsonValue: Field<string> };
  'Y-pct'?: { jsonValue: Field<string> };
  Width?: { jsonValue: Field<string> };
  Height?: { jsonValue: Field<string> };
};

export interface ImageMapProps extends ComponentProps {
  params: ImageMapParams;
  fields?: ImageMapFields;
}