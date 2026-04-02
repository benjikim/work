<script setup>
import { useFormStore } from 'src/store/modules/form.js';
import { ref, onMounted, watch, toRef } from 'vue';

const props = defineProps({
  siteKey: { type: String, required: true, },
  appearance: {
    type: String,
    default: 'interaction-only',
    validator: v => ['always', 'execute', 'interaction-only'].includes(v),
  },
  action: { type: String, default: '', required: false, },
  cData: { type: String, default: '', },
  execution: {
    type: String,
    default: 'render',
    validator: v => ['execute', 'render'].includes(v),
  },
  theme: {
    type: String,
    default: 'light',
    validator: v => ['light', 'dark', 'auto'].includes(v),
  },
  language: { type: String, default: 'auto', },
  tabindex: { type: Number, default: 0, },
  responseField: { type: Boolean, default: true, },
  responseFieldName: { type: String, default: 'cf-turnstile-response', },
  size: {
    type: String,
    default: 'normal',
    validator: v => ['normal', 'flexible', 'compact'].includes(v),
  },
  retry: {
    type: String,
    default: 'auto',
    validator: v => ['auto', 'never'].includes(v),
  },
  retryInterval: { type: Number, default: 8000, },
  refreshExpired: {
    type: String,
    default: 'auto',
    validator: v => ['auto', 'manual', 'never'].includes(v),
  },
  refreshTimeout: {
    type: String,
    default: 'auto',
    validator: v => ['auto', 'manual', 'never'].includes(v),
  },
  feedbackEnabled: { type: Boolean, default: true, },
  showCaptcha: { type: Boolean, required: true, default: true, },
  resetCaptchaFlag: { type: Boolean, required: true, default: false, },
  handleResetCaptcha: { type: Function, required: true, },
});

const emit = defineEmits([
  'callback',
  'expiredCallback',
  'errorCallback',
  'beforeInteractiveCallback',
  'afterInteractiveCallback',
  'unsupportedCallback',
  'timeoutCallback'
]);

const cloudflareWidgetId = ref(null);
const isCaptchaShown = toRef(props, 'showCaptcha'); // Reactive ref for captcha visibility

/**
 * Load the turnstile script.
 * 
 * @returns {Promise<void>}
 */
function loadTurnstileScript() {
  return new Promise(resolve => {
    if (window.turnstile) return resolve();
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=turnstileOnLoad';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
}

/**
 * Reset the turnstile widget.
 * 
 * @returns {void}
 */
function resetTurnstile() {
  if (cloudflareWidgetId.value !== null && window.turnstile) {
    window.turnstile.reset(cloudflareWidgetId.value);
  }
}

/**
 * Remove the turnstile widget from DOM.
 * 
 * @returns {void}
 */
function removeTurnstile() {
  if (cloudflareWidgetId.value !== null && window.turnstile) {
    window.turnstile.remove(cloudflareWidgetId.value);
    cloudflareWidgetId.value = null;
  }
}

/**
 * Loads the cloudflare turnstile. Attempts to find div for turnstile, 
 * and if found, renders the cloudflare turnstile with
 * appropriate options and callbacks.
 */
window.turnstileOnLoad = function retryableTurnstileInit(retryCount = 0) {
  if (!window.turnstile) {
    if (retryCount < 5) {
      console.warn(`Turnstile not loaded yet. Retrying... (${retryCount + 1})`);
      setTimeout(() => window.turnstileOnLoad(retryCount + 1), 500); // Retry after 500ms
    } else {
      const formStore = useFormStore();
      console.warn("Failed to load Turnstile after several attempts.");
      formStore.setShowCaptcha(false);
      formStore.setCaptchaToken('');
      formStore.setCaptchaStatus(false);
    }
    return;
  }

  const container = document.getElementById('cf-turnstile');
  if (!container) {
    console.warn("Turnstile container not found");
    const formStore = useFormStore();
    formStore.setShowCaptcha(false);
    formStore.setCaptchaToken('');
    formStore.setCaptchaStatus(false);
    return;
  }

  cloudflareWidgetId.value = window.turnstile.render(container, {
    sitekey: props.siteKey,
    theme: props.theme,
    appearance: props.appearance,
    action: props.action,
    cData: props.cData,
    execution: props.execution,
    language: props.language,
    tabindex: props.tabindex,
    'response-field': props.responseField,
    'response-field-name': props.responseFieldName,
    size: props.size,
    retry: props.retry,
    'retry-interval': props.retryInterval,
    'refresh-expired': props.refreshExpired,
    'refresh-timeout': props.refreshTimeout,
    'feedback-enabled': props.feedbackEnabled,
    'callback': token => emit('callback', token),
    'expired-callback': () => {
      emit('expiredCallback');
      resetTurnstile();
    },
    'timeout-callback': () => {
      emit('timeoutCallback');
      resetTurnstile();
    },
    'error-callback': err => {
      emit('errorCallback', err);
    },
    'before-interactive-callback': () => emit('beforeInteractiveCallback'),
    'after-interactive-callback': () => emit('afterInteractiveCallback'),
    'unsupported-callback': () => emit('unsupportedCallback'),
  });
};

/**
 * Load the turnstile script and render the turnstile.
 */
onMounted(async () => {
  await loadTurnstileScript();
});

/**
 * Watcher for if captcha is enabled when showCaptcha value updates.
 * If showCaptcha is false, try to remove cloudflare turnstile from DOM.
 * If showCaptcha is true, try to remove cloudflare turnstile for cleanip
 * and then reload the turnstile.
 */
watch(
  isCaptchaShown,
  async (newVal) => {
    if (!newVal) {
      removeTurnstile();
    } else {
      removeTurnstile();
      window.turnstileOnLoad();
    }
  }
);

/**
 * Watcher for if resetCaptchaFlag is true. If true, reset the turnstile.
 */
watch(
  () => props.resetCaptchaFlag,
  (newVal) => {
    if (newVal) {
      resetTurnstile();
      props.handleResetCaptcha();
    }
  }
);
</script>

<template>
  <div id="cf-turnstile"></div>
</template>
