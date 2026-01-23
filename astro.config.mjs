import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://Brun0West.github.io',
  base: '/Brun0West',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
