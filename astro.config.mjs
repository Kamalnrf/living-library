// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  adapter: vercel({
    webAnalytics: {
      enabled: true
    },
  }),

  integrations: [react()],

  vite: {
    server: {
      allowedHosts: ['.e2b.app', '.onamp.dev'],
    },
  },
});
