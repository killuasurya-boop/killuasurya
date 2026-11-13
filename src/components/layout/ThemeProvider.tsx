'use client';

import { ThemeProvider as NextThemes } from 'next-themes';

/** Light / Dark / System. Dark is the primary foundation. No flash: next-themes injects the theme before paint. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes attribute="data-theme" defaultTheme="dark" enableSystem themes={['dark', 'light']} disableTransitionOnChange={false}>
      {children}
    </NextThemes>
  );
}
