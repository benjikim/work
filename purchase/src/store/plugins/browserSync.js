/**
 * Plugin to sync data from various store modules
 * into browser storage (session, local, etc.). Used
 * to hydrate the application with any captured user data.
 */

import { SESSION_STORAGE_KEYS } from 'src/config/index.js';
import { useFormStore } from 'src/store/modules/form.js';
import { useApiStore } from 'src/store/modules/api';
import { deepCopy } from 'src/utility/index.js';
import { useContentStore } from 'src/store/modules/content.js';

export function browserSyncPlugin({ store, }) {
  const formStore = useFormStore();
  const apiStore = useApiStore();
  const contentStore = useContentStore();

  store.$onAction(async (action) => {
    const appInitialized = apiStore.getAppInitializationStatus;

    if (action.store.$id === 'form-store') {
      // Sync all the form data to `sessionStorage`. This
      // is preferred over local storage so that it only persists
      // in the current tab/window.
        action.after(() => {
          // Check to be sure the app has already
          // been loaded before allowing writing to
          // browser data. Also be sure action is not in
          // those we do not want to store in browser.
          if (appInitialized) {
            const formState = deepCopy(action.store.$state);
            const httpRequestsState = deepCopy(apiStore.requestPayloads);

            // Don't store CC information
            formState.payment.cvv = null;
            formState.payment.number = null;
            formState.payment.expiry = null;
            httpRequestsState.payment.details.cvv2 = null;
            httpRequestsState.payment.details.number = null;
            httpRequestsState.payment.details.expirationMonth = null;
            httpRequestsState.payment.details.expirationYear = null;

            // Don't store any "Trip Information" data. The fields
            // are either conditionally displayed or not displayed
            // at all to the user.
            delete formState.trip;
            delete httpRequestsState.inputs.trip;

            // delete all captcha information
            delete formState.captchaIsValid;
            delete formState.captchaToken;
            delete formState.showCaptcha;
            delete formStore.resetCaptchaFlag;

            // Sync User entered form data
            sessionStorage.setItem(
              SESSION_STORAGE_KEYS.USER_FORM_DATA,
              JSON.stringify(formState)
            );

            // Sync data for HTTP request payloads. This
            // data is bound to user entered form data
            sessionStorage.setItem(
              SESSION_STORAGE_KEYS.HTTP_REQUEST_PAYLOAD_DATA,
              JSON.stringify(httpRequestsState)
            );
          }
        });
    }

    if (action.store.$id === 'api-store') {
      switch (action.name) {
        // Sync browser storage to form store once the init()
        // operation has been completed
        // If we are displaying any errors, we do not need to sync
        case 'init':
          action.after(() => {
            let success = false;

            if (!contentStore.getShowModal) {
              success = formStore.syncBrowserStorage();
            }

            if (!success) {
              console.info('Did not sync browser storage.');
            }

            apiStore.initializationComplete = true;

            // Run post initialization clearing of lingering
            // user data they are required to interact with
            formStore.clearUserAcknowlegments();
            formStore.clearPaymentDetails();
          });

          break;
      }
    }

  });
};
