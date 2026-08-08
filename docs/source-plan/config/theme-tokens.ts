/** Palette contract for the Ramadan Journey app (tokens only). */
export type ThemeMode = 'light' | 'dark' | 'system';
export type AppLocale = 'ar' | 'en';

export const palette = {
  light: {
    background: '#F8FAF7',
    surface: '#FFFFFF',
    primary: '#176B57',
    accent: '#C99A42',
    text: '#172D27',
  },
  dark: {
    background: '#0B1323',
    surface: '#15223A',
    primary: '#9ABCEB',
    accent: '#E4BC74',
    text: '#F2F5FC',
  },
} as const;

/** Arabic is the default independent of the phone's system language. */
export const DEFAULT_LOCALE: AppLocale = 'ar';
export const LOCALE_DIRECTION: Record<AppLocale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
};
