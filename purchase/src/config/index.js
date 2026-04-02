const getQuoteUrl = () => {
  const quoteBaseUrl = window.quoteBaseUrl;
  return quoteBaseUrl || import.meta.env.VITE_QUOTE_API_BASE_URL;
};

const getOrderUrl = () => {
  const orderBaseUrl = window.orderBaseUrl;
  return orderBaseUrl || import.meta.env.VITE_ORDER_API_BASE_URL;
};

const PURCHASE_MODULES_URL = import.meta.env.VITE_MODULES_PURCHASE_URL;

const WORDPRESS_PLUGIN_URL = import.meta.env.VITE_WORDPRESS_PLUGIN_URL;

const ADDRESS_LOOKUP_URL = import.meta.env.VITE_ADDRESS_LOOKUP_URL;

/**
 * @module DATE_FORMAT
 */
export const DATE_FORMAT = {
  INPUT_FIELD: 'MM/DD/YYYY',
  QUOTE: 'MMM D, YYYY',
  INPUT_FIELD_MASK: '##/##/####',
  API: 'YYYY-MM-DD',
};

/**
 * @module HTTP_REQUEST_STATES
 */
export const HTTP_REQUEST_STATES = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR',
};

/**
 * @module IMT_SUB_FLOW
 */
export const IMT_SUB_FLOW = {
  edu: 'edu',
  annual: 'annual',
  default: 'default',
};

/**
 * @module LOCAL_STORAGE Keys that are used in local storage
 */
export const LOCAL_STORAGE_KEYS = {
  ORDER_ID: 'imt.order.id',
  ORDER_TOKEN: 'imt.order.token',
  QUOTE_ID: '_imtActiveQuoteId',
  DISPLAY_RESELLER: 'imt.display.rrES',
};

/**
 * @module ONE_TRUST_COOKIE_CATEGORIES Categories that are defined in OneTrust.
 * These IDs are associated with OnetrustActiveGroups, see IMTOneTrustWrapper in Wordpress repository for more info on implementation.
 */
export const ONE_TRUST_COOKIE_CATEGORIES = {
  STRICTLY_NECESSARY: 'C0001',
  PERFORMANCE: 'C0002',
  FUNCTIONAL: 'C0003',
  TARGETING: 'C0004',
  SOCIAL_MEDIA: 'C0005',
};

/**
 * @module SESSION_STORAGE Keys that are used in session storage
 */
export const SESSION_STORAGE_KEYS = {
  USER_FORM_DATA: 'imt.purchase.formData',
  HTTP_REQUEST_PAYLOAD_DATA: 'imt.purchase.requestPayloads',
};

/**
 * @module TRACKING_PROVIDERS Tracking provider names
 */
export const TRACKING_PROVIDERS = {
  CRIMTAN: 'crimtan',
};

/**
 * @module RE_SELLER_RATINGS Re-seller ratings variables.
 */
export const RE_SELLER_RATINGS = {
  insuremytrip: {
    SELLER_ID: 93597,
  },
  soventure: {
    SELLER_ID: 880789,
  },
};

/**
 * @module PARTNER_EVENT_TYPES Types of partner events
 */
export const PARTNER_EVENT_TYPES = {
  CONFIRMATION_PAGE: 'CONFIRMATION_PAGE',
  VERIFY_PAGE: 'VERIFY_PAGE',
};

/**
 * @module KNOWN_CREDIT_CARD_TYPES Accepted CC types
 * Naming convention is as follows:
 *  KNOWN_CREDIT_CARD_TYPES[Key] - the IMT2 CC name as defined in CC Constants
 *  KNOWN_CREDIT_CARD_TYPES[Value] - name used by the CC validation package 'credit-card'
 *
 * This dataset allows us to marry the two datasets together for
 * necessary CC type validation
 *
 * @see purchase/src/components/input/Payment/CreditCardNumber.vue
 */
export const KNOWN_CREDIT_CARD_TYPES = {
  'American Express': 'american-express',
  'Diners Club': 'diners-club',
  Discover: 'discover',
  JCB: 'jcb',
  MasterCard: 'mastercard',
  Visa: 'visa',
};

/**
 * @module PARTNER_REQUEST_STATUS Request status.
 */
export const PARTNER_REQUEST_STATUS = {
  LOADING: 'LOADING',
  INIT: 'INIT',
  ERROR: 'ERROR',
};

/**
 * @module API_ENDPOINTS
 */
export const API_ENDPOINTS = {
  quote: {
    getQuote: (id) => `${getQuoteUrl()}/quote/${id}`,
  },
  order: {
    createOrder: `${getOrderUrl()}/order`,
    getOrder: (id) => `${getOrderUrl()}/order/${id}`,
    addPartnerEventForOrder: (id) =>
      `${getOrderUrl()}/order/${id}/events/partner`,
    addProduct: (id) => `${getOrderUrl()}/order/${id}/products`,
    addProductInputs: (orderId, productId) =>
      `${getOrderUrl()}/order/${orderId}/products/${productId}/inputs`,
    addProductOptions: (orderId, productId) =>
      `${getOrderUrl()}/order/${orderId}/products/${productId}/options`,
    addPayment: (id) => `${getOrderUrl()}/order/${id}/payments`,
    getProductsFromOrder: (id) => `${getOrderUrl()}/order/${id}/products`,
    removeProductFromOrder: (orderId, productId) =>
      `${getOrderUrl()}/order/${orderId}/products/${productId}`,
    processPayment: (id) => `${getOrderUrl()}/order/${id}/payments/process`,
    verifyCaptchaToken: (id) => `${getOrderUrl()}/verifycaptchatoken/${id}`,
    verifyEmail: (id) => `${getOrderUrl()}/verifyEmail/${id}`,
    verifySubmission: (id) => `${getOrderUrl()}/verifySubmission/${id}`,
  },
  modules: {
    purchase: (options) => `${PURCHASE_MODULES_URL}${options}`,
  },
  wordpress: {
    attribution: `${WORDPRESS_PLUGIN_URL}/attribution-submit`,
    content:
    process.env.NODE_ENV === 'development'
      ? '/wp-json/plans/v1/content'
      : `https://${window.location.hostname}/wp-json/plans/v1/content`,
    refreshNonce: `${WORDPRESS_PLUGIN_URL}/refresh-nonce`,
  },
  address: {
    autocomplete: `${ADDRESS_LOOKUP_URL}/autocomplete`,
    verify: `${ADDRESS_LOOKUP_URL}/verify`,
  },
};

/**
 * @module WEBSITE_URLS Website URLs
 */
export const WEBSITE_URLS = {
  quoteForm: '/travel-insurance/quote',
  quoteResults: '/quote-compare/index.html',
  contactUs: '/contact',
};

/**
 * @module ORDER_STATE Order State
 */
export const ORDER_STATE = {
  EMPTY: 'EMPTY',
  MISSING_INFORMATION: 'MISSING_INFORMATION',
  VALIDATION_PENDING: 'VALIDATION_PENDING',
  NO_LONGER_AVAILABLE: 'NO_LONGER_AVAILABLE',
  READY_FOR_PURCHASE: 'READY_FOR_PURCHASE',
  PROCESSING: 'PROCESSING',
  DELAYED: 'DELAYED',
  COMPLETED: 'COMPLETED',
};

/**
 * @module PAYMENT_STATE Payment States
 */
export const PAYMENT_STATE = {
  PAYMENT_METHOD_REQUIRED: 'PAYMENT_METHOD_REQUIRED',
  NOT_SUBMITTED: 'NOT_SUBMITTED',
  AUTH_PENDING: 'AUTH_PENDING',
  AUTH_DECLINED: 'AUTH_DECLINED',
  AUTH_FAILED: 'AUTH_FAILED',
  SANCTIONS_PENDING: 'SANCTIONS_PENDING',
  SANCTIONS_HOLD: 'SANCTIONS_HOLD',
  CAPTURE_PENDING: 'CAPTURE_PENDING',
  CAPTURE_DECLINED: 'CAPTURE_DECLINED',
  CAPTURE_FAILED: 'CAPTURE_FAILED',
  SUCCESS: 'SUCCESS',
};

/**
 * @module VALIDATION_MESSAGES Common validation messages.
 */
export const VALIDATION_MESSAGES = {
  required: 'Required',
  adjacentNumsCity: 'Enter a valid city name',
  adjacentNumsAddress: 'Enter a valid address',
  creditCardType(types) {
    return `Allowed credit card types are ${types}.`;
  },
  minLength(number) {
    return `Minimum length of ${number} please`;
  },
  maxLength(number) {
    return `Maximum length of ${number} please`;
  },
  validType(type) {
    return `Please enter a valid ${type}`;
  },
  zipFormat(country) {
    return `Please enter a valid ${country} formatted zip code.`;
  },
};

export const isLocal = import.meta.env.VITE_DEV_MODE === 'true';
