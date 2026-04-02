import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig(({ mode, }) => {
  const env = loadEnv(mode, process.cwd());

  let wpJsonProxyTarget = null;
  if (process.env.NODE_ENV === 'development') {
    // @NOTE: For local development for Mathlogic to hit stage
    if (env.VITE_THEME_APP === 'insuremytrip') {
      // If you want to hit local wordpress, you can use this:
      // wpJsonProxyTarget = `https://${env.VITE_THEME_APP}.localhost`;
      wpJsonProxyTarget = `https://www.${env.VITE_THEME_APP}.com.imtqa.us`;
    } else {
      // For soventure, we don't use WWW on imtqa.us....
      wpJsonProxyTarget = `https://${env.VITE_THEME_APP}.com.imtqa.us`;
    }
  }
  
  return {
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
            target: 'https://api.insuremytrip.com.imtqa.us/api/modules/v1/purchase',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/modules/, ''),
          },
          '/wp-json/imt/v1/attribution-submit': {
            target: wpJsonProxyTarget,
            changeOrigin: true,
            secure: false,
          },
          '/wp-json/plans/v1/content': {
            target: wpJsonProxyTarget,
            changeOrigin: true,
            secure: false,
          },
        },
      },}),
      preview: {
        host: 'localhost',
        port: 5175,
      },
      base: process.env.APP_BASE_URL ? `https://${process.env.APP_BASE_URL}/${process.env.npm_package_version}/` : './',
      plugins: [
        vue(),
      ],
      resolve: {
        alias: {
          src: "/src",
        },
      },
      build: {
        cssCodeSplit: false, // Using iife, we need to specify this to build our css file
        rollupOptions: {
          output: {
            format: 'iife', // Encapsulates our code when built to not pollute global namespace of imt
            entryFileNames: `assets/[name].js`,
            chunkFileNames: `assets/[name].js`,
            assetFileNames: (assetInfo) => { // Rename our css file to what imt expects, and include our other assets in the asset folder
              if (assetInfo.name == 'style.css')
                return 'assets/index.css';
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
              @use "sass:color";
              @use "./src/assets/scss/_variables.scss" as *;
              @use "./src/assets/scss/_colors.scss" as *;
              @use "./src/assets/scss/_typography.scss" as *;
              @use "./src/assets/scss/_base.scss" as *;
              @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');
            `,
          },
        },
      },
    };
  }
);
