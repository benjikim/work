/**
 * @module HTTP_REQUEST_STATES
 */
export enum HTTP_REQUEST_STATES {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export enum LOADER_KEYS {
  QR_INIT = 'qr_init',
  QR_UPDATE = 'qr_update',
  QR_TO_BUY = 'qr_to_buy',
}

/**
 * Qoute results total inital records to be loaded
 * @module QUOTE_RESULT_API_SETTING
 */
export enum QUOTE_RESULT_API_SETTING {
  INITIAL_RESULTS_COUNT = '10',
  INITIAL_STARTING_OFFSET = '0',
}

/**
 * @module API_ENDPOINTS
 */
export const API_ENDPOINTS =
  import.meta.env.MODE === 'development'
    ? {
        quote: {
          createQuote: () => `/quote`,
          getQuote: (id: string) => `/quote/${id}`,
          getResults: (id: string) => `/quote/${id}/result?USPlans=true`,
          getResultsForSpecificPlans: (id: string, planCodes: string) =>
            `/quote/${id}/result?USPlans=true&planCode=${planCodes}`,
          getResultsByOffset: (id: string, offset: string) =>
            `/quote/${id}/result?USPlans=true&offset=${offset}`,
          getResultsByOffsetAndLength: (
            id: string,
            offset: string,
            length: string
          ) =>
            `/quote/${id}/result?USPlans=true&offset=${offset}&length=${length}`,
        },
        order: {
          createOrder: () => `/order`,
          addProduct: (id: string) => `/order/${id}/products`,
          addProductInputs: (orderId: string, productId: string) =>
            `/order/${orderId}/products/${productId}/inputs`,
        },
        email: {
          emailAQuote: (id: string) => `/quote/${id}/email`,
        },
        modules: {
          getQuoteResults: () => `/modules`,
        },
        cms: {
          getQuoteResultsContent: () =>
            `/wp-json/imt-blocks/v1/quote-results-content`,
          getPlanContent: () => `/wp-json/plans/v1/content`,
          getProviderContent: () => `/wp-json/providers/v1/content`,
          getQuoteShortCode: () => `/wp-json/quote-reference/v1/generate-code`,
          getLoaderData: (key: string) =>
            `/wp-json/imt-blocks/v1/loader?key=${key}`,
        },
      }
    : {
        quote: {
          createQuote: () => `${import.meta.env.VITE_QUOTE_API_BASE_URL}/quote`,
          getQuote: (id: string) =>
            `${import.meta.env.VITE_QUOTE_API_BASE_URL}/quote/${id}`,
          getResults: (id: string) =>
            `${import.meta.env.VITE_QUOTE_API_BASE_URL}/quote/${id}/result?USPlans=true`,
          getResultsForSpecificPlans: (id: string, planCodes: string) =>
            `${import.meta.env.VITE_QUOTE_API_BASE_URL}/quote/${id}/result?USPlans=true&planCode=${planCodes}`,
          getResultsByOffset: (id: string, offset: string) =>
            `${import.meta.env.VITE_QUOTE_API_BASE_URL}/quote/${id}/result?USPlans=true&offset=${offset}`,
          getResultsByOffsetAndLength: (
            id: string,
            offset: string,
            length: string
          ) =>
            `${import.meta.env.VITE_QUOTE_API_BASE_URL}/quote/${id}/result?USPlans=true&offset=${offset}&length=${length}`,
        },
        order: {
          createOrder: () => `${import.meta.env.VITE_ORDER_API_BASE_URL}/order`,
          addProduct: (id: string) =>
            `${import.meta.env.VITE_ORDER_API_BASE_URL}/order/${id}/products`,
          addProductInputs: (orderId: string, productId: string) =>
            `${import.meta.env.VITE_ORDER_API_BASE_URL}/order/${orderId}/products/${productId}/inputs`,
        },
        email: {
          emailAQuote: (id: string) =>
            `${import.meta.env.VITE_QUOTE_API_BASE_URL}/quote/${id}/email`,
        },
        modules: {
          getQuoteResults: () =>
            `${import.meta.env.VITE_MODULES_API_BASE_URL}/quote-results`,
        },
        cms: {
          getQuoteResultsContent: () =>
            `https://${window.location.hostname}/wp-json/imt-blocks/v1/quote-results-content`,
          getPlanContent: () =>
            `https://${window.location.hostname}/wp-json/plans/v1/content`,
          getProviderContent: () =>
            `https://${window.location.hostname}/wp-json/providers/v1/content`,
          getQuoteShortCode: () =>
            `https://${window.location.hostname}/wp-json/quote-reference/v1/generate-code`,
          getLoaderData: (key: string) =>
            `https://${window.location.hostname}/wp-json/imt-blocks/v1/loader?key=${key}`,
        },
      };

/**
 * @module calculateAge
 */
export const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};
