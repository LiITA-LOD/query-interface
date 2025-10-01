import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    base: '/query-interface/',
  },
  html: {
    title: 'LiITA Query Interface',
    meta: {
      ...(process.env.SPARQL_URL && { 'sparql-url': process.env.SPARQL_URL }),
    },
  },
});
