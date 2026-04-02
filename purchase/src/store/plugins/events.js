import { useApiStore } from 'src/store/modules/api.js';
import { useFormStore } from '../modules/form';
import { PARTNER_EVENT_TYPES, PARTNER_REQUEST_STATUS } from 'src/config/index.js';

export function eventsPlugin({ store, }) {
  const apiStore = useApiStore();
  const formStore = useFormStore();
  const { VERIFY_PAGE, } = PARTNER_EVENT_TYPES;
  const { LOADING, INIT, ERROR, } = PARTNER_REQUEST_STATUS;

  store.$onAction(async (action) => {
    // Be sure to only fire the partner event for verify
    // page one time. Events are tracked in localStorage
    if (
      localStorage.getItem('partnerEvents') === VERIFY_PAGE ||
      localStorage.getItem('partnerEvents') === LOADING
    ) {
      return;
    }

    if (action.args[0]) {
      action.after(async () => {
        // "Verified Hit" event fires under the following
        // conditions:
        // - Event has not yet been triggered
        // - Form sections for travelers, passport and trip details are complete
        // - User has entered their billing name
        if (
          localStorage.getItem('partnerEvents') === INIT &&
          formStore.getFormSectionCompleted('travelers') &&
          formStore.getFormSectionCompleted('passport') &&
          formStore.getFormSectionCompleted('tripDetails') &&
          formStore.getPaymentName !== null
        ) {
          localStorage.setItem('partnerEvents', LOADING);
          let response;
          try {
            response = await apiStore.handlePartnerEvent(VERIFY_PAGE);
          } catch (error) {
            console.error('Error handling partner event:', error.message);
          }
          if (response) {
            localStorage.setItem('partnerEvents', VERIFY_PAGE);
          } else {
            localStorage.setItem('partnerEvents', ERROR);
          }
        }
      });
    }

  });
}
