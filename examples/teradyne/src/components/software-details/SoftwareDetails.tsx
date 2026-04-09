import type React from 'react';
import { Text as ContentSdkText, Link as ContentSdkLink, Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { Share2 } from 'lucide-react';
import type { ComponentProps } from '@/lib/component-props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

/** Sitecore field bundle for the Software Details panel (flat fields shape). */
export interface SoftwareDetailsFields {
  ProductNumber: Field<string>;
  ProductType: Field<string>;
  ContentType: Field<string>;
  SoftwareVersion: Field<string>;
  SoftwareDescription: Field<string>;
  PrimaryFile: Field<string>;
  RelevantFiles: Field<string>;
  DownloadLink: LinkField;
}

export type SoftwareDetailsProps = ComponentProps & {
  fields?: SoftwareDetailsFields;
};

function hasTextValue(field: Field<string> | undefined): boolean {
  const v = field?.value;
  return typeof v === 'string' && v.trim().length > 0;
}

function hasValidDownloadLink(field: LinkField | undefined): boolean {
  const href = field?.value?.href;
  return !!(href && href !== '#' && !href.startsWith('http://#'));
}

/** Suggested filename for the `download` attribute (same-origin / permissive URLs save locally; cross-origin may still navigate). */
function getSuggestedDownloadFilename(
  primaryFile: Field<string> | undefined,
  link: LinkField | undefined
): string | undefined {
  const primary = typeof primaryFile?.value === 'string' ? primaryFile.value.trim() : '';
  if (primary) {
    const token = primary.split(/\s+/)[0]?.replace(/[,;)]$/, '') ?? '';
    if (token && /\.[a-z0-9]{2,10}$/i.test(token)) {
      return token;
    }
  }
  const href = link?.value?.href;
  if (!href) return undefined;
  try {
    const u = href.startsWith('http') ? new URL(href) : new URL(href, 'https://placeholder.local');
    const segment = u.pathname.split('/').filter(Boolean).pop();
    if (segment?.includes('.')) {
      return decodeURIComponent(segment.split('?')[0] ?? segment);
    }
  } catch {
    const noQuery = href.split('?')[0] ?? '';
    const segment = noQuery.split('/').filter(Boolean).pop();
    if (segment?.includes('.')) {
      return decodeURIComponent(segment);
    }
  }
  return undefined;
}

function SectionTitle({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 id={id} className={cn('text-foreground mb-3 text-sm font-semibold tracking-tight', className)}>
      {children}
    </h3>
  );
}

function MetaRow({ label, field }: { label: string; field: Field<string> | undefined }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(8rem,35%)_1fr] sm:items-baseline sm:gap-4">
      <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{label}</dt>
      <dd className="text-foreground min-w-0 text-sm">
        {hasTextValue(field) ? (
          <ContentSdkText field={field} tag="span" />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </dd>
    </div>
  );
}

/**
 * Enterprise-style “Software Details” panel driven entirely by Sitecore fields.
 * Server-safe: no data fetching; uses Content SDK `Text` and `Link` for field rendering.
 */
export const Default: React.FC<SoftwareDetailsProps> = ({ fields, params }) => {
  if (!fields) {
    return <NoDataFallback componentName="SoftwareDetails" />;
  }

  const { ProductNumber, ProductType, ContentType, SoftwareVersion, SoftwareDescription, PrimaryFile, RelevantFiles, DownloadLink } =
    fields;

  const showRelevantFallback = !hasTextValue(RelevantFiles);
  const downloadName = getSuggestedDownloadFilename(PrimaryFile, DownloadLink);

  return (
    <section
      className={cn('w-full', params?.styles)}
      data-rendering={params?.RenderingIdentifier}
      aria-label="Software details"
    >
      <Card className="border-neutral-200 bg-white shadow-sm">
        <CardHeader className="border-b border-neutral-200 bg-[#f5f5f5] pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              {hasTextValue(ProductNumber) ? (
                <ContentSdkText
                  field={ProductNumber}
                  tag="h1"
                  className="text-foreground text-2xl font-bold leading-tight tracking-tight md:text-3xl"
                />
              ) : (
                <h1 className="text-muted-foreground text-2xl font-bold md:text-3xl">—</h1>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="border-neutral-300 bg-white shrink-0 hover:bg-neutral-100"
              aria-label="Share (coming soon)"
              title="Share (placeholder)"
            >
              <Share2 className="size-4 opacity-70" aria-hidden />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid md:grid-cols-2">
            {/* Metadata column */}
            <div className="border-b border-neutral-200 bg-[#fafafa] p-6 md:border-b-0 md:border-r md:border-neutral-200">
              <dl className="space-y-4">
                <MetaRow label="Product type" field={ProductType} />
                <MetaRow label="Content type" field={ContentType} />
                <MetaRow label="Software version" field={SoftwareVersion} />
              </dl>
            </div>

            {/* Details column */}
            <div className="space-y-6 p-6">
              <section className="rounded-md border border-neutral-200 bg-[#f5f5f5] p-4" aria-labelledby="software-desc-heading">
                <SectionTitle id="software-desc-heading">Software description</SectionTitle>
                <div className="text-foreground text-sm leading-relaxed">
                  {hasTextValue(SoftwareDescription) ? (
                    <ContentSdkText field={SoftwareDescription} tag="div" />
                  ) : (
                    <p className="text-muted-foreground">No description provided.</p>
                  )}
                </div>
              </section>

              <Separator className="bg-neutral-200" />

              <section className="rounded-md border border-neutral-200 bg-[#f5f5f5] p-4" aria-labelledby="primary-file-heading">
                <SectionTitle id="primary-file-heading">Primary file</SectionTitle>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-foreground min-w-0 flex-1 text-sm">
                    {hasTextValue(PrimaryFile) ? (
                      <ContentSdkText field={PrimaryFile} tag="p" className="break-words" />
                    ) : (
                      <p className="text-muted-foreground">No primary file specified.</p>
                    )}
                  </div>
                  <div className="flex shrink-0 sm:justify-end">
                    {hasValidDownloadLink(DownloadLink) ? (
                      <Button
                        asChild
                        variant="default"
                        className="transition-all hover:brightness-[0.96] active:brightness-[0.92]"
                      >
                        <ContentSdkLink
                          field={DownloadLink}
                          prefetch={false}
                          aria-label="Download primary file"
                          className="no-underline"
                          download={downloadName ?? true}
                        >
                          Download
                        </ContentSdkLink>
                      </Button>
                    ) : (
                      <Button type="button" variant="secondary" disabled aria-label="Download link not configured">
                        Download unavailable
                      </Button>
                    )}
                  </div>
                </div>
              </section>

              <Separator className="bg-neutral-200" />

              <section className="rounded-md border border-neutral-200 bg-[#f5f5f5] p-4" aria-labelledby="relevant-files-heading">
                <SectionTitle id="relevant-files-heading">Relevant files</SectionTitle>
                <div className="text-sm leading-relaxed">
                  {showRelevantFallback ? (
                    <p className="text-muted-foreground">No file available</p>
                  ) : (
                    <ContentSdkText field={RelevantFiles} tag="div" className="text-foreground break-words" />
                  )}
                </div>
              </section>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
