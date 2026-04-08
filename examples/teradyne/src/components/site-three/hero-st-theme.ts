/**
 * `unset` — no Color Scheme in Sitecore (legacy: image hero, primary eyebrow).
 * `default` — explicit "Default" scheme: gradient fill, no images, light text.
 */
export type HeroColorSchemeName =
  | 'unset'
  | 'default'
  | 'dark'
  | 'light'
  | 'primary'
  | 'secondary';

/** Left-to-right gradient for Hero "Default" color scheme (no image). */
export const HERO_DEFAULT_GRADIENT_CSS =
  'linear-gradient(to right, rgb(13, 29, 59) 0%, rgb(0, 47, 135) 32%, rgb(25, 124, 144) 71%, rgb(88, 194, 173) 100%)';

/** Resolves Sitecore styling parameter (camelCase or PascalCase). */
export function normalizeHeroColorScheme(
  params?: Record<string, string | undefined>
): HeroColorSchemeName {
  if (!params) return 'unset';
  const raw = params.colorScheme ?? params.ColorScheme ?? '';
  const v = String(raw).trim().toLowerCase();
  if (v === '') return 'unset';
  if (v === 'default') return 'default';
  if (v === 'dark') return 'dark';
  if (v === 'light') return 'light';
  if (v === 'primary') return 'primary';
  if (v === 'secondary') return 'secondary';
  return 'unset';
}

export function isHeroDefaultGradientScheme(scheme: HeroColorSchemeName): boolean {
  return scheme === 'default';
}

const heroDarkImageButtonPrimary =
  'btn mr-4 inline-block text-sm font-medium transition-all rounded-full py-3 px-5 bg-white text-[var(--color-brand-navy)] hover:bg-white/90';
const heroDarkImageButtonSecondary =
  'btn inline-block text-sm font-medium transition-all rounded-full py-3 px-5 border-2 border-white text-white bg-transparent hover:bg-white/10';

const heroDarkSolidButtonPrimary =
  'btn mr-4 inline-block text-sm font-medium transition-all rounded-full py-3 px-5 bg-white text-[var(--color-brand-navy)] hover:bg-white/90';
const heroDarkSolidButtonSecondary =
  'btn inline-block text-sm font-medium transition-all rounded-full py-3 px-5 border-2 border-white text-primary-foreground bg-transparent hover:bg-white/10';

export function getHeroImageTypography(scheme: HeroColorSchemeName): {
  eyebrow: string;
  title: string;
} {
  switch (scheme) {
    case 'dark':
    case 'default':
      return { eyebrow: '!text-white', title: '!text-white' };
    case 'light':
      return {
        eyebrow: 'text-[var(--color-brand-navy)]',
        title: 'text-[var(--color-brand-black)]',
      };
    case 'primary':
      return { eyebrow: 'text-primary', title: 'text-[var(--color-brand-navy)]' };
    case 'secondary':
      return { eyebrow: 'text-muted-foreground', title: 'text-foreground' };
    case 'unset':
      return { eyebrow: 'text-primary', title: '' };
  }
}

export function getHeroImageButtons(scheme: HeroColorSchemeName): {
  first: string;
  second: string;
} {
  if (scheme === 'dark' || scheme === 'default') {
    return { first: heroDarkImageButtonPrimary, second: heroDarkImageButtonSecondary };
  }
  return {
    first: 'btn btn-primary mr-4',
    second: 'btn btn-secondary',
  };
}

export type HeroSolidContentClasses = {
  wrapper: string;
  eyebrow: string;
  title: string;
  first: string;
  second: string;
};

/** Typography and buttons for SplitScreen / Stacked panels (primary or light surfaces). */
export function getHeroSolidContentClasses(scheme: HeroColorSchemeName): HeroSolidContentClasses {
  const onPrimarySurface: HeroSolidContentClasses = {
    wrapper: '',
    eyebrow: 'text-primary-foreground',
    title: 'text-primary-foreground',
    first: 'btn btn-secondary mr-4',
    second: 'btn btn-secondary',
  };

  switch (scheme) {
    case 'light':
      return {
        wrapper: 'bg-background',
        eyebrow: 'text-primary',
        title: 'text-foreground',
        first: 'btn btn-primary mr-4',
        second: 'btn btn-secondary',
      };
    case 'dark':
      return {
        ...onPrimarySurface,
        first: heroDarkSolidButtonPrimary,
        second: heroDarkSolidButtonSecondary,
      };
    case 'default':
      return {
        wrapper: '',
        eyebrow: '!text-white',
        title: '!text-white',
        first: heroDarkSolidButtonPrimary,
        second: heroDarkSolidButtonSecondary,
      };
    case 'primary':
      return {
        ...onPrimarySurface,
        first: 'btn btn-primary mr-4',
        second: 'btn btn-secondary',
      };
    case 'secondary':
      return {
        wrapper: 'bg-secondary',
        eyebrow: 'text-secondary-foreground',
        title: 'text-secondary-foreground',
        first: 'btn btn-primary mr-4',
        second: 'btn btn-secondary',
      };
    case 'unset':
      return onPrimarySurface;
  }
}
