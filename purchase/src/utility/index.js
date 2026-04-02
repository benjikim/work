import * as configcat from 'configcat-js';
import { isLocal } from '../config';

/**
 * Determines if the user is on a mobile device depending on screen size.
 *
 * @returns {Boolean}
 */
export function isMobileView () { return window.matchMedia("(max-width: 768px)").matches; };

/**
 * Makes a deep copy of different types
 *
 * @param {Object|Date|Array} obj
 * @returns {Object|Date|Array}
 */
export function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.reduce((arr, item, i) => {
      arr[i] = deepCopy(item);
      return arr;
    }, []);
  }

  if (obj instanceof Object) {
    return Object.keys(obj).reduce((newObj, key) => {
      newObj[key] = deepCopy(obj[key]);
      return newObj;
    }, {});
  }
}

/**
 * A helper method that replaces content with given object.
 * F.E, content: "I need to be <replaced> <replaced>"
 * objectOfValues: { "<replaced>": "changed"}
 * will change to "I need to be changed changed"
 * @param {Object} objectOfValues An object of key/values string replacements
 * @param {String} content A string that needs template changes
 * @returns String
 */
export function replaceContentVariables(objectOfValues, content) {
  Object.keys(objectOfValues).forEach(key => {
    content = content.replace(new RegExp(key, "g"), objectOfValues[key]);
  });
  return content;
};

/**
 * Given an object, return object ommitting entries
 * with null values or empty data sets
 *
 * @param {Object} obj
 * @returns {Object}
 */
export function removeUnknownProperties(obj) {
  // Determine if the current input is an
  // array or an object and process accordingly
  if (Array.isArray(obj)) {

    // Process each item in the array, recursively applying the cleaning logic.
    // Filter out null values and empty objects
    return obj.map(item => removeUnknownProperties(item))
      .filter(item =>
        item !== null
        && !(typeof item === 'object'
        && Object.keys(item).length === 0)
      );
  } else {
    const newObj = {};

    Object.keys(obj).forEach(key => {
      const value = obj[key];

      if (value !== null) {

        // Recursively clean the value if it's an object or an array
        if (typeof value === 'object') {
          const cleanedValue = removeUnknownProperties(value);

          // Check if the cleaned value is not an empty object before assigning it
          if (Object.keys(cleanedValue).length > 0 || Array.isArray(cleanedValue)) {
            newObj[key] = cleanedValue;
          }
        } else {
          newObj[key] = value;
        }
      }
    });

    return newObj;
  }
};

/**
 * Returns a random number from min - max value
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Waits for an element to be available.
 * @param {String} selector
 * @returns {Element}
 */
export function waitForElm(selector) {
  return new Promise(resolve => {
      if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(() => {
          if (document.querySelector(selector)) {
              observer.disconnect();
              resolve(document.querySelector(selector));
          }
      });

      observer.observe(document.body, {
          childList: true,
          subtree: true,
      });
  });
}

/**
 * Dynamically injects JS to page.
 *
 * @param {String} url
 */
export function dynamicLoadJS(url) {
  const firstScriptTag = document.getElementsByTagName('script')[0];
  const newScriptElement = document.createElement('script');

  newScriptElement.type = 'text/javascript';
  newScriptElement.async = true;
  newScriptElement.src = url;
  firstScriptTag.parentNode.insertBefore(newScriptElement, firstScriptTag);
}

export function threeAdjacentNumPattern(purchaseInput = '') {
  const adjacentNumPattern = /\d{3,}/;

  return !adjacentNumPattern.test(purchaseInput);
}

export function ccAdjacentNumPattern(purchaseInput = '') {
  const adjacentNumPattern = /\d{16,}/;

  return !adjacentNumPattern.test(purchaseInput);
}

/**
 * Checks if the captcha feature is enabled for the purchase page.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the captcha
 * is enabled, otherwise false.
 */

export async function isCaptchaEnabled() {
  const configCatClient = configcat.getClient(import.meta.env.VITE_CONFIG_CAT_SDK_KEY);

  let captchaEnabled = false;

  try {
    captchaEnabled = await configCatClient?.getValueAsync(
      'imt_20250602_enablebuypagecaptcha_release',
      false
    );
  } catch (error) {
    console.error('Error fetching captcha feature flag:', error);
  }

  return captchaEnabled;
}

/**
 * Determine if the captcha should be visible based on the config cat feature flag
 *
 * @param {Object} formStore
 */
export async function determineCaptchaVisibility(formStore) {
  const captchaEnabled = await isCaptchaEnabled();

  formStore.setShowCaptcha(captchaEnabled);
}

export async function isLocalThemeSoventure() {
  if (isLocal) {
    const localRes = await import('src/store/local.json');
    return (import.meta.env.MODE === 'development' && localRes?.theme === 'soventure');
  }
  return false;
}

export async function isProductQAThemeSoventure() {
  const hostname = window.location.hostname;

  const configCatClient = configcat.getClient(import.meta.env.VITE_CONFIG_CAT_SDK_KEY);
  let soventureThemeEnable = false;

  try {
    soventureThemeEnable = await configCatClient?.getValueAsync(
      'cms_20250303_soventure_theme_us_release',
      false
    );

  } catch (error) {
    console.error('Error fetching soventure theme feature flag:', error);
  }

  return Boolean(hostname.match(/^qa([1-9][0-9]?)\./)) && soventureThemeEnable;
}

export async function determineTheme(contentStore) {
  if (window.location.hostname.includes("soventure") || await isProductQAThemeSoventure() || await isLocalThemeSoventure()) {
    contentStore.setTheme("soventure");
  }
}

/**
 * Checks if we should hide our review period content block
 *
 * @returns {Promise<boolean>} A promise that resolves to true if review period content should be hidden
 */

export async function hideReviewPeriodContent() {
  const configCatClient = configcat.getClient(import.meta.env.VITE_CONFIG_CAT_SDK_KEY);

  return await configCatClient?.getValueAsync(
    'cms_20251009_hide_reviewperiod_buypage',
    false
  );
}
