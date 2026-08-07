import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import vueDevTools from 'vite-plugin-vue-devtools';

const normalizeBasePath = (value?: string): string | undefined => {
  if (!value) return undefined;

  if (/^https?:\/\//.test(value)) {
    return value.endsWith('/') ? value : `${value}/`;
  }

  if (value === '.' || value === './') {
    return './';
  }

  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const publicBasePath =
    normalizeBasePath(env.VITE_PUBLIC_BASE_PATH) ||
    (process.env.APP_BASE_URL
      ? `https://${process.env.APP_BASE_URL}/${process.env.npm_package_version}/`
      : './');

  let wpJsonProxyTarget = null;
  if (process.env.NODE_ENV === 'development' && env.VITE_THEME_APP) {
    if (env.VITE_THEME_APP === 'insuremytrip') {
      wpJsonProxyTarget = `https://www.${env.VITE_THEME_APP}.com.imtqa.us`;
    } else {
      wpJsonProxyTarget = `https://${env.VITE_THEME_APP}.com.imtqa.us`;
    }
  }

  return {
    base: publicBasePath,
    // We shall proxy our requests to QA environment for local development
    ...(process.env.NODE_ENV === 'development' && {
      server: {
        proxy: {
          '/quote': {
            target: 'https://api.insuremytrip.com.imtqa.us/api/quote/v1',
            changeOrigin: true,
            secure: false,
          },
          '/order': {
            target: 'https://api.insuremytrip.com.imtqa.us/api/order/v1',
            changeOrigin: true,
            secure: false,
          },
          '/modules': {
            target:
              'https://api.insuremytrip.com.imtqa.us/api/modules/v1/quote-results',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/modules/, ''),
          },
          '/wp-json/imt-blocks/v1/quote-results-content': {
            target: wpJsonProxyTarget,
            changeOrigin: true,
            secure: false,
          },
          '/wp-json/plans/v1/content': {
            target: wpJsonProxyTarget,
            changeOrigin: true,
            secure: false,
          },
          '/wp-json/providers/v1/content': {
            target: wpJsonProxyTarget,
            changeOrigin: true,
            secure: false,
          },
          '/wp-json/quote-reference/v1/generate-code': {
            target: wpJsonProxyTarget,
            changeOrigin: true,
            secure: false,
          },
          '/wp-json/imt-blocks/v1/loader': {
            target: wpJsonProxyTarget,
            changeOrigin: true,
            secure: false,
          },
        },
      },
    }),
    plugins: [vue(), vueDevTools({ launchEditor: 'code' })],
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
          entryFileNames: `assets/quote-results-app.js`,
          assetFileNames: (assetInfo) => {
            // Rename our css file to what imt expects, and include our other assets in the asset folder
            if (assetInfo.name == 'style.css')
              return 'assets/quote-results-app.css';
            return `assets/${assetInfo.name}`;
          },
        },
      },
      sourcemap: true,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @import "./src/assets/scss/_variables.scss";
          @import "./src/assets/scss/_colors.scss";
          @import "./src/assets/scss/_typography.scss";
          @import "./src/assets/scss/_base.scss";
          @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;600;700&display=swap');
        `,
        },
      },
    },
  };
});
