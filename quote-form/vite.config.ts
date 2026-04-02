import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    cssCodeSplit: false, // Using iife, we need to specify this to build our css file
    rollupOptions: {
      output: {
        format: 'iife', // Encapsulates our code when built to not pollute global namespace of imt
        entryFileNames: `assets/quote-form-app.js`,
        assetFileNames: (assetInfo) => {
          // Rename our css file to what imt expects, and include our other assets in the asset folder
          if (assetInfo.name == 'style.css') return 'assets/quote-form-app.css';
          return `assets/${assetInfo.name}`;
        },
      },
    },
    sourcemap: true,
  },
  css: {
    preprocessorOptions: {
      less: {
        additionalData: '@import "./src/assets/theme/variables.less";',
      },
    },
  },
});
