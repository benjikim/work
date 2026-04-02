import { createApp } from 'vue';
import '@/style.css';
import { createPinia } from 'pinia';
import { useThemeStore } from '@/store/theme';
import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import App from '@/App.vue';
import './assets/theme/variables.less';
import './assets/theme/main.less';
import '@primeuix/styles';
import { createGtag } from 'vue-gtag';
import './assets/main.css';
import { datadogRum } from '@datadog/browser-rum';
import packageJson from '../package.json';

const quoteFormApp =
  document.getElementById('quote-form-v2') ||
  document.getElementById('mini-quote-form');
const sessionSampleRate =
  Number(quoteFormApp?.getAttribute('data-datadog-session-sample-rate')) || 0;
const sessionReplaySampleRate =
  Number(
    quoteFormApp?.getAttribute('data-datadog-session-replay-sample-rate')
  ) || 0;
const isDatadogEnabled = quoteFormApp?.getAttribute('data-is-datadog-enabled');

if (isDatadogEnabled) {
  datadogRum.init({
    applicationId: import.meta.env.VITE_DATADOG_APPLICATION_ID,
    clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service: 'quote-form',
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

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);

const themeStore = useThemeStore();
themeStore.initializeTheme();

const primaryColor = themeStore.getPrimaryColor;
const secondaryColor = themeStore.getSecondaryColor;

const QuoteFormPreset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          50: secondaryColor,
          500: primaryColor,
          600: primaryColor,
          700: '#000',
        },
        red: {
          // This is our error text / border color
          500: '#CC1414',
          600: '#CC1414',
        },
        formField: {
          focusBorderColor: '#0280A7',
          focusRingColor: '#0280A7',
          borderRadius: '10px',
        },
      },
    },
  },
});

app.use(PrimeVue, {
  theme: {
    preset: QuoteFormPreset,
    options: {
      prefix: 'p',
      cssLayer: false,
      darkModeSelector: '',
    },
  },
});

const gtagId =
  document.getElementById('quote-form-v2')?.getAttribute('data-ga4-id') ||
  (themeStore.getCurrentTheme === 'insuremytrip'
    ? import.meta.env.VITE_IMT_GOOGLE_ANALYTICS_4_ID
    : import.meta.env.VITE_SOVENTURE_GOOGLE_ANALYTICS_4_ID);

if (gtagId) {
  app.use(createGtag({ tagId: gtagId }));
} else {
  console.error('Missing GA tag id.');
}

app.mount('#quote-form-v2');
