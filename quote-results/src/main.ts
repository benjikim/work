import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from '@/router/index';
import VueGtag from 'vue-gtag';
import '@/assets/scss/main.scss';
import App from '@/App.vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { datadogRum } from '@datadog/browser-rum';
import packageJson from '../package.json';
import { useThemeStore } from '@/store/theme';

const pinia = createPinia();
const app = createApp(App);
app.component('VueDatePicker', VueDatePicker);
app.use(pinia);

const sessionSampleRate =
  Number(
    document
      .getElementById('quote-results-app')
      ?.getAttribute('data-datadog-session-sample-rate')
  ) || 0;
const sessionReplaySampleRate =
  Number(
    document
      .getElementById('quote-results-app')
      ?.getAttribute('data-datadog-session-replay-sample-rate')
  ) || 0;
const isDatadogEnabled = document
  .getElementById('quote-results-app')
  ?.getAttribute('data-is-datadog-enabled');

if (isDatadogEnabled) {
  datadogRum.init({
    applicationId: import.meta.env.VITE_DATADOG_APPLICATION_ID,
    clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service: 'quote-results',
    version: packageJson.version,
    env: import.meta.env.MODE,
    sessionSampleRate: sessionSampleRate,
    sessionReplaySampleRate: sessionReplaySampleRate,
    trackBfcacheViews: true,
    defaultPrivacyLevel: 'mask-user-input',
  });
} else {
  console.log('Datadog is disabled');
}

const themeStore = useThemeStore();
themeStore.initializeTheme();

app
  .use(router)
  .use(VueGtag, {
    config: {
      id:
        document
          .getElementById('quote-results-app')
          ?.getAttribute('data-ga4-id') ||
        import.meta.env.VITE_GOOGLE_ANALYTICS_4_ID,
    },
  })
  .mount('#quote-results-app');
