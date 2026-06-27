import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative base path './' so assets load properly on GitHub Pages repository subpaths
  base: './',
  build: {
    assetsInlineLimit: 4096,
  }
});
