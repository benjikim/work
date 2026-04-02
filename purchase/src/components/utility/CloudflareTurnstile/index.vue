<script setup>
import { useFormStore } from 'src/store/modules/form.js';
import Turnstile from './CloudflareTurnstile.vue';
import { useContentStore } from '../../../store/modules/content';
import { event } from 'vue-gtag';
import { computed } from 'vue';

/**
 * Configurations:
 * @see https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#configurations
 *
 * Testing locally:
 * @see https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 *
 * +--------------------------+-------------------------------+-----------+
 * |           id             |           behavior            | visibility|
 * +--------------------------+-------------------------------+-----------+
 * | 1x00000000000000000000AA | Always passes                 | visible   |
 * | 2x00000000000000000000AB | Always blocks                 | visible   |
 * | 1x00000000000000000000BB | Always passes                 | invisible |
 * | 2x00000000000000000000BB | Always blocks                 | invisible |
 * | 3x00000000000000000000FF | Force interactive challenge   | visible   |
 * +--------------------------+-------------------------------+-----------+
 */

/**
 * Collection of codes to stop user. Possible attacker / bot.
 *
 * @var {Array} userBlockingErrorCodes
 */
const userBlockingErrorCodes = [
  '110200', // unknown domain, domain not allowed
  '110510', // visitor may have browser extensions or settings to spoof their user-agent and should disable them
  '300', // potentially an automated visitor
  '600' // potentially an automated visitor
];

/**
 * Collection of codes to disable Captcha. Will require further
 * investigation to check our configurations.
 *
 * @var {Array} configurationErrorCodes
 */
const configurationErrorCodes = [
  '102', // invalid parameters, advised to retry the callenge
  '103', // invalid parameters, advised to retry the callenge
  '104', // invalid parameters, advised to retry the callenge
  '106', // invalid parameters, advised to retry the callenge
  '105', // turnstile was invoked in a deprecated or invalid way
  '110100', // invalid sitekey for turnstile
  '110110', // invalid sitekey for turnstile
  '110420', // invalid action for turnstile
  '110430', //invalid cData
  '110500', // unsupported browser, encourage visitor to use supported browser
  '200010', // invalid caching, encourage visitor to clear their cache
  '200100', // encourage vistor to set their clock to the correct time
  '200500', // loading error, iframe under challenges.cloudflare.com could not be loaded
  '400020', // invalid sitekey for turnstile
  '400030', // invalid size for turnstile
  '400040' // invalid theme for turnstile
];

/**
 * Collection of codes to ignore when an error occurs and to not throw a warning. 
 * @var {Array} ignoredErrorCodes 
 */
const ignoredErrorCodes = [
  '120' // encountered by Cloudflare support engineers while debugging
];

/**
 * Collection of codes to reset Captcha.
 * @var {Array} triggerCaptchaResetErrorCodes
 */
const triggerCaptchaResetErrorCodes = [
  '100', // initialization problems, could be caused by old instance that was solved. Reload page and restart turnstile, on cotinuous failures, possibly might be bot
  '11062', // challenge timed out
  '11060' // challenge timed out, visitor also may have a system clock set to wrong date
];

/**
 * @const {String} siteKey Cloudflare sitekey
 */
const siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITEKEY;

/**
 * @var {Object} formStore
 */
const formStore = useFormStore();

/**
 * @var {Object} contentStore
 */
const contentStore = useContentStore();
/**
 * @var {Boolean} showCaptcha Captcha visibility status
*/
const showCaptcha = computed(() => formStore.getShowCaptcha);

/**
 * @var {Boolean} resetCaptchaFlag Captcha reset status on whether or not to reset captcha to obtain a new token
 */
const resetCaptchaFlag = computed(() => formStore.getResetCaptchaFlag);

/**
 * Update form store data on captcha success
 *
 * @param {String} token Captcha token
 */
const setCaptchaSuccess = (token) => {
  formStore.setCaptchaToken(token);
  formStore.setCaptchaStatus(true);
};

/**
 * Update form store data on captcha error
 *
 * @param {String} errorCode Error code response
 */
const setCaptchaError = (errorCode) => {
  const isIgnoredError = ignoredErrorCodes.some(prefix => errorCode.startsWith(prefix));

  if (isIgnoredError) {
    return;
  }

  formStore.setCaptchaToken('');
  formStore.setCaptchaStatus(false);
  formStore.setShowCaptcha(false);

  console.warn('Configuration error code returned from Cloudflare turnstile: ', errorCode);

  event('buy-page_cloudflare_non_user_blocking_error', {
      hierarchical_layer_1: `Error Code ${errorCode}`,
      hierarchical_layer_2: contentStore.getTheme.toUpperCase(),
  });
};

/**
 * Called when the Cloudflare turnstile token has expired. Resets the form
 * store state for the captcha, and triggers a re-render of the captcha
 * component.
 */
const onCaptchaExpired = () => {
  formStore.setCaptchaToken('');
  formStore.setCaptchaStatus(false);
  formStore.triggerCaptchaReset(true);
};

/**
 * Sets the Cloudflare Turnstile token flag to false. This is called when the user has successfully undergone
 * the verification process for the cloudflare token after a reset has been triggered for the captcha.
 */
const onCaptchaResetResolve = () => {
  formStore.triggerCaptchaReset(false); // reset flag for captcha reset
};

</script>

<template>
  <Turnstile
    v-model="formStore.captchaToken"
    :site-key="siteKey"
    :show-captcha="showCaptcha"
    :reset-captcha-flag="resetCaptchaFlag"
    :handle-reset-captcha="onCaptchaResetResolve"
    @callback="setCaptchaSuccess"
    @error-callback="setCaptchaError"
    @expired-callback="onCaptchaExpired"
    @timeout-callback="onCaptchaExpired"
  />
</template>