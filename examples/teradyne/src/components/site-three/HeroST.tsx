'use client';

import { useContainerOffsets } from '@/hooks/useContainerOffsets';
import {
  Text as ContentSdkText,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  ImageField,
  Field,
  LinkField,
} from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import {
  normalizeHeroColorScheme,
  getHeroImageTypography,
  getHeroImageButtons,
  getHeroSolidContentClasses,
  isHeroDefaultGradientScheme,
  HERO_DEFAULT_GRADIENT_CSS,
} from '@/components/site-three/hero-st-theme';

interface Fields {
  Eyebrow: Field<string>;
  Title: Field<string>;
  Image1: ImageField;
  Image2: ImageField;
  Link1: LinkField;
  Link2: LinkField;
}

type PageHeaderSTProps = {
  params: {
    styles?: string;
    colorScheme?: string;
    ColorScheme?: string;
    [key: string]: string | undefined;
  };
  fields: Fields;
};

export const Default = (props: PageHeaderSTProps) => {
  const { containerRef, rightOffset } = useContainerOffsets();
  const scheme = normalizeHeroColorScheme(props.params);
  const imageTypo = getHeroImageTypography(scheme);
  const imageBtns = getHeroImageButtons(scheme);
  const isGradientOnly = isHeroDefaultGradientScheme(scheme);

  return (
    <section
      className={cn(
        'relative flex items-center border-8 lg:border-16 border-background',
        isGradientOnly && 'min-h-[24rem] lg:min-h-[34rem]',
        props?.params?.styles || ''
      )}
      style={isGradientOnly ? { background: HERO_DEFAULT_GRADIENT_CSS } : undefined}
      data-class-change
    >
      {!isGradientOnly && (
        <div className="absolute inset-0 z-10">
          <ContentSdkImage
            field={props?.fields?.Image1}
            width={1920}
            height={1080}
            priority={true}
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div
        className={cn(
          'relative lg:container w-full lg:flex mx-auto z-20',
          isGradientOnly && 'justify-center'
        )}
        ref={containerRef}
      >
        <div
          className={cn(
            'flex flex-col justify-center mt-6 lg:mt-0 px-4 py-6 lg:p-6',
            isGradientOnly
              ? 'w-full min-h-[24rem] lg:min-h-[34rem] max-w-3xl mx-auto'
              : 'lg:w-2/3 lg:min-h-[34rem]'
          )}
        >
          <div
            className={cn(
              !isGradientOnly && 'lg:max-w-3xl',
              /* Default gradient: Sitecore Text often sets text-foreground on inner nodes — force white on headings only (not sibling CTAs). */
              isGradientOnly && '[&_h1]:!text-white [&_h1_*]:!text-white'
            )}
          >
            <h1 className="text-xl lg:text-3xl pb-3">
              <ContentSdkText
                field={props?.fields?.Eyebrow}
                className={cn(imageTypo.eyebrow)}
              />
            </h1>
            <h1 className="text-4xl lg:text-6xl">
              <ContentSdkText field={props?.fields?.Title} className={cn(imageTypo.title)} />
            </h1>
            <div className="mt-6">
              <ContentSdkLink
                field={props?.fields?.Link1}
                prefetch={false}
                className={imageBtns.first}
              />
              <ContentSdkLink
                field={props?.fields?.Link2}
                prefetch={false}
                className={imageBtns.second}
              />
            </div>
          </div>
        </div>
        {!isGradientOnly && (
          <div
            className={`lg:absolute top-0 bottom-0 left-2/3`}
            style={{ right: `-${rightOffset - 16}px` }}
          >
            <ContentSdkImage
              field={props?.fields?.Image1}
              width={1920}
              height={1080}
              priority={true}
              fetchPriority="high"
              className="aspect-[2/1] lg:aspect-auto w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export const Right = (props: PageHeaderSTProps) => {
  const { containerRef, leftOffset } = useContainerOffsets();
  const scheme = normalizeHeroColorScheme(props.params);
  const imageTypo = getHeroImageTypography(scheme);
  const imageBtns = getHeroImageButtons(scheme);
  const isGradientOnly = isHeroDefaultGradientScheme(scheme);

  return (
    <section
      className={cn(
        'relative flex items-center border-8 lg:border-16 border-background',
        isGradientOnly && 'min-h-[24rem] lg:min-h-[34rem]',
        props?.params?.styles || ''
      )}
      style={isGradientOnly ? { background: HERO_DEFAULT_GRADIENT_CSS } : undefined}
      data-class-change
    >
      {!isGradientOnly && (
        <div className="absolute inset-0 z-10">
          <ContentSdkImage
            field={props?.fields?.Image1}
            width={1920}
            height={1080}
            priority={true}
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div
        className={cn(
          'relative lg:container w-full lg:flex lg:flex-row-reverse mx-auto z-20',
          isGradientOnly && 'justify-center'
        )}
        ref={containerRef}
      >
        <div
          className={cn(
            'flex flex-col justify-center mt-6 lg:mt-0 px-4 py-6 lg:p-6',
            isGradientOnly
              ? 'w-full min-h-[24rem] lg:min-h-[34rem] max-w-3xl mx-auto'
              : 'lg:w-2/3 lg:min-h-[34rem]'
          )}
        >
          <div
            className={cn(
              'text-right',
              !isGradientOnly && 'lg:max-w-3xl lg:ml-auto',
              isGradientOnly && '[&_h1]:!text-white [&_h1_*]:!text-white'
            )}
          >
            <h1 className="text-xl lg:text-3xl pb-3">
              <ContentSdkText
                field={props?.fields?.Eyebrow}
                className={cn(imageTypo.eyebrow)}
              />
            </h1>
            <h1 className="text-4xl lg:text-6xl">
              <ContentSdkText field={props?.fields?.Title} className={cn(imageTypo.title)} />
            </h1>
            <div className="mt-6">
              <ContentSdkLink
                field={props?.fields?.Link1}
                prefetch={false}
                className={imageBtns.first}
              />
              <ContentSdkLink
                field={props?.fields?.Link2}
                prefetch={false}
                className={imageBtns.second}
              />
            </div>
          </div>
        </div>
        {!isGradientOnly && (
          <div
            className={`lg:absolute top-0 bottom-0 right-2/3`}
            style={{ left: `-${leftOffset - 16}px` }}
          >
            <ContentSdkImage
              field={props?.fields?.Image1}
              width={1920}
              height={1080}
              className="aspect-[2/1] lg:aspect-auto w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export const Centered = (props: PageHeaderSTProps) => {
  const { containerRef, rightOffset } = useContainerOffsets();
  const scheme = normalizeHeroColorScheme(props.params);
  const imageTypo = getHeroImageTypography(scheme);
  const imageBtns = getHeroImageButtons(scheme);
  const isGradientOnly = isHeroDefaultGradientScheme(scheme);

  return (
    <section
      className={cn(
        'relative flex items-center border-8 lg:border-16 border-background',
        isGradientOnly && 'min-h-[24rem] lg:min-h-[34rem]',
        props?.params?.styles || ''
      )}
      style={isGradientOnly ? { background: HERO_DEFAULT_GRADIENT_CSS } : undefined}
      data-class-change
    >
      {!isGradientOnly && (
        <div className="absolute inset-0 z-10">
          <ContentSdkImage
            field={props?.fields?.Image1}
            width={1920}
            height={1080}
            priority={true}
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div
        className={cn(
          'relative lg:container w-full lg:flex mx-auto z-20',
          isGradientOnly && 'justify-center'
        )}
        ref={containerRef}
      >
        <div
          className={cn(
            'flex flex-col justify-center mt-6 lg:mt-0 px-4 py-6 lg:p-6 text-center',
            isGradientOnly
              ? 'w-full min-h-[24rem] lg:min-h-[34rem] max-w-3xl mx-auto'
              : 'lg:relative lg:left-1/6 lg:w-2/3 lg:min-h-[34rem]'
          )}
        >
          <div
            className={cn(
              !isGradientOnly && 'lg:max-w-3xl lg:mx-auto',
              isGradientOnly && '[&_h1]:!text-white [&_h1_*]:!text-white'
            )}
          >
            <h1 className="text-xl lg:text-3xl pb-3">
              <ContentSdkText
                field={props?.fields?.Eyebrow}
                className={cn(imageTypo.eyebrow)}
              />
            </h1>
            <h1 className="text-4xl lg:text-6xl">
              <ContentSdkText field={props?.fields?.Title} className={cn(imageTypo.title)} />
            </h1>
            <div className="mt-6">
              <ContentSdkLink
                field={props?.fields?.Link1}
                prefetch={false}
                className={imageBtns.first}
              />
              <ContentSdkLink
                field={props?.fields?.Link2}
                prefetch={false}
                className={imageBtns.second}
              />
            </div>
          </div>
        </div>
        {!isGradientOnly && (
          <div
            className={`lg:absolute top-0 bottom-0 left-5/6`}
            style={{ right: `-${rightOffset - 16}px` }}
          >
            <ContentSdkImage
              field={props?.fields?.Image1}
              width={1920}
              height={1080}
              className="aspect-[2/1] lg:aspect-auto w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export const SplitScreen = (props: PageHeaderSTProps) => {
  const scheme = normalizeHeroColorScheme(props.params);
  const solid = getHeroSolidContentClasses(scheme);
  const isGradientOnly = isHeroDefaultGradientScheme(scheme);

  return (
    <section
      className={cn(
        'relative border-8 lg:border-16 border-background',
        !isGradientOnly && 'bg-primary',
        isGradientOnly && 'min-h-[34rem]',
        props?.params?.styles || ''
      )}
      style={isGradientOnly ? { background: HERO_DEFAULT_GRADIENT_CSS } : undefined}
      data-class-change
    >
      <div
        className={cn(
          'flex flex-col lg:flex-row lg:min-h-[34rem]',
          isGradientOnly && 'items-center justify-center'
        )}
      >
        <div
          className={cn(
            'p-6 lg:p-10 w-full max-w-4xl mx-auto',
            !isGradientOnly && 'lg:basis-full lg:self-center',
            solid.wrapper,
            isGradientOnly && '[&_h1]:!text-white [&_h1_*]:!text-white'
          )}
        >
          <h1 className="text-xl lg:text-3xl pb-3">
            <ContentSdkText field={props?.fields?.Eyebrow} className={cn(solid.eyebrow)} />
          </h1>
          <h1 className="text-4xl lg:text-6xl">
            <ContentSdkText field={props?.fields?.Title} className={cn(solid.title)} />
          </h1>
          <div className="mt-6">
            <ContentSdkLink
              field={props?.fields?.Link1}
              prefetch={false}
              className={solid.first}
            />
            <ContentSdkLink
              field={props?.fields?.Link2}
              prefetch={false}
              className={solid.second}
            />
          </div>
        </div>
        {!isGradientOnly && (
          <div className="relative aspect-[2/1] lg:basis-full lg:aspect-auto">
            <ContentSdkImage
              field={props?.fields?.Image1}
              width={1920}
              height={1080}
              priority={true}
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative h-full z-20">
              <div className="absolute inset-6 lg:inset-10">
                <ContentSdkImage
                  field={props?.fields?.Image1}
                  width={1920}
                  height={1080}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export const Stacked = (props: PageHeaderSTProps) => {
  const scheme = normalizeHeroColorScheme(props.params);
  const solid = getHeroSolidContentClasses(scheme);
  const isGradientOnly = isHeroDefaultGradientScheme(scheme);

  return (
    <section
      className={cn(
        'relative flex flex-col lg:flex-row lg:items-center lg:min-h-[34rem]',
        !isGradientOnly && 'bg-primary lg:bg-transparent',
        isGradientOnly && 'min-h-[34rem]',
        props?.params?.styles || ''
      )}
      style={isGradientOnly ? { background: HERO_DEFAULT_GRADIENT_CSS } : undefined}
      data-class-change
    >
      <div className={cn('container px-4 mx-auto', isGradientOnly && 'w-full flex justify-center')}>
        <div
          className={cn(
            'relative z-20 px-6 py-8',
            !isGradientOnly && 'lg:w-1/2 bg-primary',
            isGradientOnly && 'max-w-4xl w-full text-center',
            solid.wrapper,
            isGradientOnly && '[&_h1]:!text-white [&_h1_*]:!text-white'
          )}
        >
          <h1 className="text-xl lg:text-3xl pb-3">
            <ContentSdkText field={props?.fields?.Eyebrow} className={cn(solid.eyebrow)} />
          </h1>
          <h1 className="text-4xl lg:text-6xl">
            <ContentSdkText field={props?.fields?.Title} className={cn(solid.title)} />
          </h1>
          <div className="mt-6">
            <ContentSdkLink
              field={props?.fields?.Link1}
              prefetch={false}
              className={solid.first}
            />
            <ContentSdkLink
              field={props?.fields?.Link2}
              prefetch={false}
              className={solid.second}
            />
          </div>
        </div>
      </div>
      {!isGradientOnly && (
        <div className="relative aspect-[2/1] lg:absolute lg:aspect-auto inset-0 flex z-10">
          <div className="relative w-1/3">
            <ContentSdkImage
              field={props?.fields?.Image2}
              width={1920}
              height={1080}
              className="absolute w-full h-full inset-0 object-cover"
            />
          </div>
          <div className="relative w-2/3">
            <ContentSdkImage
              field={props?.fields?.Image1}
              width={1920}
              height={1080}
              className="absolute w-full h-full inset-0 object-cover z-10"
            />
            <div className="absolute inset-0 z-20">
              <ContentSdkImage
                field={props?.fields?.Image1}
                width={1920}
                height={1080}
                className="absolute w-[calc(100%-5rem)] h-full left-20 top-0 right-0 bottom-0 object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
