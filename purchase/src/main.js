import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { vMaska } from 'maska/vue';
import { createGtag } from 'vue-gtag';
import dayjs from 'dayjs';
import { eventsPlugin } from './store/plugins/events';
import router from './router/index';
import { apiPlugin } from './store/plugins/api';
import { browserSyncPlugin } from './store/plugins/browserSync';
import { datadogRum } from '@datadog/browser-rum';
import packageJson from '../package.json';
import 'vue-material-design-icons/styles.css';
import './assets/scss/main.scss';

import App from './App.vue';

const store = createPinia();
const app = createApp(App);

const sessionSampleRate = Number(document.getElementById('purchase-app')?.getAttribute('data-datadog-session-sample-rate')) || 0;
const sessionReplaySampleRate = Number(document.getElementById('purchase-app')?.getAttribute('data-datadog-session-replay-sample-rate')) || 0;
const isDatadogEnabled = document.getElementById('purchase-app')?.getAttribute('data-is-datadog-enabled');

if (isDatadogEnabled === 'true') {
  datadogRum.init({
      applicationId: import.meta.env.VITE_DATADOG_APPLICATION_ID,
      clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
      site: 'datadoghq.com',
      service: 'purchase',
      env: import.meta.env.MODE,
      version: packageJson.version,
      sessionSampleRate: sessionSampleRate,
      sessionReplaySampleRate: sessionReplaySampleRate,
      trackBfcacheViews: true,
      defaultPrivacyLevel: 'mask-user-input',
  });
} else {
  console.log('Datadog is disabled');
}


// Autoload all the base components so they don't need
// to be imported manually. Include nested files as well.
const allComponents = import.meta.glob('./components/**/*.vue', { eager: true });

Object.entries(allComponents).forEach(([path, definition]) => {
  const componentName = path
    .split('/')
    .pop()
    .replace(/\.[^/.]+$/, '');

  const component = definition?.default ?? definition;

  if (import.meta.env.VITE_DEV_MODE === 'true') {
    try {
      const keys = Object.keys(definition || {});
      console.log(`${componentName} loaded`, keys);
    } catch (e) {
      console.log(`${componentName} loaded`);
    }
  }

  app.component(componentName, component);
});



/**
 * Expose dayjs for global consumption
 *
 * @example Example usage in component
 *
 * import { inject } from 'vue';
 * const dayJs = inject('dayJs');
 * const today = dayJs().format();
 */
app.provide('dayJs', dayjs);

// Add API plugin to pinia
store.use(apiPlugin);
store.use(eventsPlugin);
store.use(browserSyncPlugin);

app.directive('maska', vMaska);

app
  .use(store)
  .use(router)
  .use(createGtag, {
    property: {
      id:
        document.getElementById('purchase-app')?.getAttribute('data-ga4-id') ||
        import.meta.env.VITE_GOOGLE_ANALYTICS_4_ID,
    },
  })
  .mount('#purchase-app');
