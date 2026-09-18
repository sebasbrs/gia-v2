// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';


import sitemap from '@astrojs/sitemap';


// Los TTF originales son fuentes coreanas de ~8 MB; se sirven subseteadas a latín/cirílico (ver scripts/subset-fonts.py)
const atomyUnicodeRange = [
  'U+0000-00FF', 'U+0100-024F', 'U+0259', 'U+02B0-02FF', 'U+0300-036F', 'U+0370-03FF',
  'U+0400-052F', 'U+1E00-1EFF', 'U+2000-206F', 'U+20A0-20CF', 'U+2100-214F',
  'U+2190-21BB', 'U+2212', 'U+2215', 'U+25A0-25FF',
];

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://www.globalimperialsatomy.com',

  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Atomy',
      cssVariable: '--font-atomy',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [300, 500, 700].map((weight) => ({
          weight,
          style: 'normal',
          display: 'swap',
          unicodeRange: atomyUnicodeRange,
          src: [`./src/assets/fonts/Atomy-${{ 300: 'Light', 500: 'Medium', 700: 'Bold' }[weight]}.woff2`],
        })),
      },
    },
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()],
});