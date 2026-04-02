/**
 * API Store
 * This store should handle all interactions with the various
 * APIs. The responsibility of this store is to:
 * - Make API requests
 * - Handle the responses appropriately
 * - Set any global error states
 * - Translate and set any display content in the content store
 * - Translate and set any form data in the form store
 * - Handle extracting information from the form store and formatting
 *   request objects appropriately to make additional requests to
 *   supporting APIs
 * - Rinse and repeat all the above as necessary
 */
import { defineStore } from 'pinia';
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { event } from 'vue-gtag';
import {
  HTTP_REQUEST_STATES,
  API_ENDPOINTS,
  LOCAL_STORAGE_KEYS,
  DATE_FORMAT,
  ORDER_STATE,
  PAYMENT_STATE,
  SESSION_STORAGE_KEYS,
  PARTNER_EVENT_TYPES,
  IMT_SUB_FLOW
} from 'src/config/index.js';
import {
  isCaptchaEnabled,
  removeUnknownProperties
} from 'src/utility/index.js';
import { useAppDataStore } from './preloadedData';
import axios from 'axios';
import dayjs from 'dayjs';
import * as configcat from 'configcat-js';

export const useApiStore = defineStore('api-store', {
  state: () => {
    return {
      quote: {
        requestStatus: HTTP_REQUEST_STATES.NOT_STARTED,
        dataLoaded: false,
        id: null,
        details: {
          metadata: {
            partnerId: null,
            referenceId: null,
          },
          travelers: [],
          trip: {
            destinations: [
              {
                country: null,
                stateProvince: null,
              }
            ],
            travelServices: [],
            departureDate: null,
            returnDate: null,
            initialTripPaymentDate: null,
            finalTripPaymentDate: null,
          },
          clickthroughs: [],
        },
      },
      order: {
        id: null,
        dataLoaded: false,
        number: null,
        payStatus: null,
        details: {
          products: [],
          state: null,
          token: null,
          requiredInputs: [],
          missingInputs: [],
        },
        totalProducts: 0,
        displayFields: {},
        requestStatus: HTTP_REQUEST_STATES.NOT_STARTED,
      },
      product: {
        // options for a product; selected by user before entering purchase page
        // currently only used in legacy way, but set in both legacy (?quoteId=...&productCode=...) and v1 way (?_oid=...&productCode=...)
        options: [],
      },
      requestPayloads: {
        inputs: {
          travelers: [],
          passport: [],
          residence: {
            street: null,
            street2: null,
            city: null,
            postalCode: null,
            country: null,
            citizenship: null,
            stateProvince: null,
          },
          contact: {
            email: null,
            phone: null,
          },
          trip: {
            firstTripPayment: null,
            finalTripPayment: null,
            cost: null,
            destination: null,
            school: null,
          },
          travelSupplier: {
            tourOperator: null,
            airline: null,
            cruiseline: null,
          },
          clickthrough: {},
        },
        payment: {
          paymentType: 'CREDIT_CARD',
          details: {
            name: null,
            number: null,
            cvv2: null,
            expirationMonth: null,
            expirationYear: null,
            billingAddress: {
              city: null,
              stateProvince: null,
              country: null,
              postalCode: null,
              street1: null,
              street2: null,
            },
          },
        },
        events: {},
        options: [],
        mode: 'default',
      },
      apiResponseMessages: {
        errors: [],
        missingInputs: [],
        coverageChanges: [],
        planCostChanges: [],
        pns: [],
      },
      initializationComplete: false,
      finalizingPurchase: false,
      addressSuggestions: {
        suggestions: [],
        loading: false,
        showSuggestions: false,
      },
      addressLookupTransaction: {
        id: crypto.randomUUID(),
        callCount: 0,
        lastCallTime: Date.now(),
      },
      addressLookupPayload: {
        preferences: {
          maxResults: 5,
          returnAllInfo: true,
          factoryDescription: {
            label: '',
            featureSpecific: {},
          },
          clientLocale: '',
          clientCoordSysName: '',
          distance: {
            value: 150,
            distanceUnit: 'METER',
          },
          streetOffset: {
            value: 7,
            distanceUnit: 'METER',
          },
          cornerOffset: {
            value: 7,
            distanceUnit: 'METER',
          },
          fallbackToGeographic: false,
          fallbackToPostal: false,
          matchMode: '',
          returnOfAdditionalFields: false,
          originXY: [],
          customPreferences: {},
        },
        address: {
          addressLines: [''],
          country: '',
          addressNumber: '',
          admin1: '',
          admin2: '',
          city: '',
          borough: '',
          neighborhood: '',
          suburb: '',
          postalCode: '',
          postalCodeExt: '',
          placeName: '',
          street: '',
          building: '',
          floor: '',
          room: '',
          unit: '',
          unitType: '',
        },
      },
      productCode: '',
    };
  },
  getters: {
    getFinalizingPurchase() {
      return this.finalizingPurchase;
    },

    getPartnerId() {
      return this.quote.details.metadata.partnerId;
    },

    /**
     * Get the product being purchased
     *
     * @returns {String|null}
     */
    getProduct() {
      if (this.order.details.products.length) {
        return this.order.details.products[0];
      }

      return null;
    },

    /**
     * Get the product code being purchased
     *
     * @returns {String|null}
     */
    getProductCode() {
      if (this.order.details.products.length) {
        return this.order.details.products[0].productCode;
      }

      return null;
    },

    /**
     * Get the product premium
     *
     * @returns {String|null}
     */
    getProductPremium() {
      if (this.order.details.products.length) {
        return this.order.details?.products[0]?.quoteResult?.premium ?? null;
      }
    },

    /**
     * Get the product total cost
     *
     * @returns {String|null}
     */
    getProductTotalCost() {
      if (this.order.details.products.length) {
        const cost =
          this.order.details?.products[0]?.quoteResult?.totalCost ?? null;

        if (!cost || typeof cost !== 'number') {
          // Adding error log info for debugging when no total cost is found
          const totalProducts = this.order.details.products.length;
          const totalCost =
            this.order.details?.products[0]?.quoteResult?.totalCost;
          const totalCostType =
            typeof this.order.details?.products[0]?.quoteResult?.totalCost;
          console.error(
            `No total cost for product found. Total products: '${totalProducts}'. Order ID: '${this.order.id}'. Total cost: '${totalCost}'. Total cost type: '${totalCostType}'.`
          );
        }

        // Return whatever this is as normal
        return cost;
      }

      // Log error if there are no products when trying to get total cost
      console.error(
        "No products found when trying to get total cost calling 'getProductTotalCost()'."
      );
    },

    /**
     * Get the product policy fee
     *
     * @returns {String|null}
     */
    getProductPolicyFee() {
      if (this.order.details.products.length) {
        return this.order.details?.products[0]?.quoteResult?.policyFee ?? null;
      }
    },

    /**
     * Get the product tax
     *
     * @returns {String|null}
     */
    getProductTax() {
      if (this.order.details.products.length) {
        return this.order.details?.products[0]?.quoteResult?.tax ?? null;
      }
    },

    /**
     * Gets the order id.
     *
     * @returns { String|Null }
     */
    getOrderId() {
      return this.order.id;
    },

    /**
     * Gets the order details.
     *
     * @returns { Object|Null }
     */
    getOrderDetails() {
      return this.order.details;
    },

    /**
     * Return whether we have ITP or not in Quote Details
     *
     * @returns { Boolean }
     */
    checkIfITPInQuoteDetails() {
      return this.quote.details?.trip?.initialTripPaymentDate ?? false;
    },

    /**
     * Return whether we have FTP or not in Quote Details
     *
     * @returns { Boolean }
     */
    checkIfFTPInQuoteDetails() {
      return this.quote.details?.trip?.finalTripPaymentDate ?? false;
    },

    /**
     * Gets display fields for order.
     *
     * @returns { Object }
     */
    getOrderDisplayFields() {
      return this.order.displayFields;
    },

    /**
     * Gets order detail state
     *
     * @returns { Object }
     */
    getOrderDetailState() {
      return this.order.details.state;
    },

    /**
     * Get the order request status
     *
     * @returns {String}
     */
    getOrderRequestStatus() {
      return this.order.requestStatus;
    },

    /**
     * Return list of API response messages
     *
     * @returns {Object}
     */
    getApiResponseMessages() {
      return this.apiResponseMessages;
    },

    /**
     * Helper to see if there are any API
     * response messages that have been collected
     *
     * @returns {Boolean}
     */
    hasApiResponseMessages() {
      return Object.values(this.apiResponseMessages).some(
        (arr) => arr.length > 0
      );
    },

    /**
     * Get quote metadata item by key
     *
     * @returns {String|null}
     */
    getQuoteMetadataValue() {
      return (key) => this.quote.details.metadata[key] ?? null;
    },

    /**
     * Tracker for app init status
     *
     * @returns {Boolean}
     */
    getAppInitializationStatus() {
      return this.initializationComplete;
    },

    /**
     * If we should generate a new transaction ID for
     * address autocomplete request
     *
     * @link https://help.cloud.precisely.com/r/t/1009843844/2025-07-10/Precisely-Data-Integrity-Suite/disapi/Latest/en-US/API-Help/Address-Autocomplete
     * @returns {Boolean}
     */
    shouldRegenerateAddressTransactionId() {
      const now = Date.now();
      const inactiveTime = now - this.addressLookupTransaction.lastCallTime;
      return (
        this.addressLookupTransaction.callCount >= 8 || inactiveTime > 15000
      );
    },

    /**
     * Gets the current pay status of our order
     * @returns {String}
     */
    getPayStatus() {
      return this.order.payStatus;
    },
  },
  actions: {
    /**
     * Initialize application - this does all the things.
     *
     * If there is no order created by the time the application is loaded,
     * at minimum, the following data points need to be
     * available to the application:
     * - Quote ID, found in local storage by key `_imtActiveQuoteId`
     * - Product Code to purchase, can be passed in via URL
     *   query param `productCode`
     *
     * The primary goal is that an order exists with a product
     * attached and is ready for purchase. For initial launch,
     * this may not be the case. This app will handle some of the
     * heavy lifting until all the entry points into the purchase
     * process are updated to handle this.
     *
     * @return {Void}
     */
    async init() {
      const contentStore = useContentStore();
      const appDataStore = useAppDataStore();
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('_oid');
      const mode = urlParams.get('mode');

      contentStore.setPageLoaderData(contentStore.getPageLoader('initialLoad'));

      if (mode && Object.values(IMT_SUB_FLOW).includes(mode)) {
        this.requestPayloads.mode = mode;
        contentStore.setMode(mode);
      }

      if (window.ACF_PAGE_DATA_BUY) {
        contentStore.setWPContent(window.ACF_PAGE_DATA_BUY);
      }

      if (orderId) {
        // loads order and product information
        const order = await this.loadOrderByOid();
        if (!order) {
          console.error(`Could not get order for id '${this.order.id}'`);
          contentStore.setShowPageLoader(false);
          return false;
        }

        if (!this.order.details.token) {
          console.error(
            `Could not get order id '${this.order.id}'. Missing or expired auth token.`
          );

          contentStore.setModalData(contentStore.getModal('tokenNotFound'));
          contentStore.setShowModal(true);

          return false;
        }

        // Fetch quote details
        await this.fetchQuoteDetails();

        // load new purchase page
        contentStore.setShowPageLoader(false);
      } else {
        this.product.options = appDataStore.getSelectedOptions;
        this.requestPayloads.options = appDataStore.getSelectedOptions;

        // Sync any local storage data to store
        this.syncLocalStorage();

        // Check to see if we already have an order ID.
        // If not, create new order
        if (!this.order.id) {
          const createOrderResponse = await this.createOrder();

          if (!createOrderResponse) {
            console.error('Could not create order');
            contentStore.setShowPageLoader(false);
            return false;
          }
        }

        // We should have an order ID either from newly
        // created order or from local storage. Fetch the order.
        const order = await this.fetchOrder();

        if (!order) {
          console.error(`Could not get order for id '${this.order.id}'`);
          contentStore.setShowPageLoader(false);
          return false;
        }

        // If we have entered with a different productCode from the product associated with the order
        // or we have entered with a different quoteId from localStorage, let's remove them!
        if (
          this.order.details?.products.length > 0 &&
          (this.order.details?.products[0].productCode !==
            this.getProductCodeFromUrl() ||
            this.order.details?.products[0].quoteId !== this.quote.id)
        ) {
          try {
            // Since we have an order, we get any products related to that order and remove them
            const productsToRemove = await this.getProductsFromOrder();
            // Typically, orders should only have 1 product associated with it, since our API allows multiple products for an order we can loop through to assure there is only 1 product
            await Promise.all(
              productsToRemove?.map(async (product) => {
                await this.removeProductFromOrder(product.productId);
              })
            );
          } catch (err) {
            console.error(
              `An error occurred while attempting to remove all products from order with the following id: ${this.order.id}`,
              err
            );
          }

          const addProductRes = await this.addProductToOrder(
            this.getProductCodeFromUrl(),
            this.quote.id,
            this.product.options
          );

          if (!addProductRes) {
            console.error('Could not add product order.');

            contentStore.setModalData(
              contentStore.getModal('noProductToPurchase')
            );
            contentStore.setShowModal(true);
            contentStore.setShowPageLoader(false);

            return false;
          }

          // We have an order with products. Fetch the order to rehydrate the store.
          const order = await this.fetchOrder();
          if (!order) {
            console.error(`Could not get order for id '${this.order.id}'`);
            contentStore.setShowPageLoader(false);
            return false;
          }
        }

        // Check to see if the order already has products
        // attached to it. If not, check to see if we
        // have any product information available.
        let productCode = null;

        if (this.order.details?.products.length === 0) {
          console.info(
            'No products found with order. Searching for product code.'
          );
          productCode = this.getProductCodeFromUrl();

          if (!productCode) {
            console.error(
              'Could not load order. No product code provided to purchase.'
            );

            contentStore.setModalData(
              contentStore.getModal('noProductToPurchase')
            );
            contentStore.setShowModal(true);
            contentStore.setShowPageLoader(false);

            return false;
          }

          console.info(`Product code ${productCode} found.`);

          // Quote ID should be available in this case via local storage.
          // If not, we cannot add the product to the order because
          // it cannot be quoted without quote ID.
          if (!this.quote.id) {
            console.error(
              'Could not add product to order. No quote ID provided to purchase.'
            );

            contentStore.setModalData(contentStore.getModal('quoteNotFound'));
            contentStore.setShowModal(true);
            contentStore.setShowPageLoader(false);

            return false;
          }

          const addProductRes = await this.addProductToOrder(
            productCode,
            this.quote.id,
            this.product.options
          );

          if (!addProductRes) {
            console.error('Could not add product order.');

            contentStore.setModalData(
              contentStore.getModal('noProductToPurchase')
            );
            contentStore.setShowModal(true);
            contentStore.setShowPageLoader(false);

            return false;
          }

          // We have an order with products. Fetch the order to rehydrate the store.
          const order = await this.fetchOrder();
          if (!order) {
            console.error(`Could not get order for id '${this.order.id}'`);
            contentStore.setShowPageLoader(false);
            return false;
          }
        }

        // Fetch quote details
        await this.fetchQuoteDetails();

        // Whew! Should be good to go!
        contentStore.setShowPageLoader(false);
      }
    },

    handleErrorsInForm(err, contentStore) {
      this.setOrderRequestStatus(HTTP_REQUEST_STATES.ERROR);
      this.setOrderDataLoaded(false);

      console.error(err);

      if (err?.response?.status) {
        switch (err.response.status) {
          case 400:
          case 403:
            contentStore.setModalData(contentStore.getModal('notAuthorized'));
            contentStore.setShowModal(true);

            return false;

          case 404:
            contentStore.setModalData(contentStore.getModal('orderNotFound'));
            contentStore.setShowModal(true);

            return false;

          default:
            // Show global modal error
            contentStore.setModalData(contentStore.getModal('httpServerError'));
            contentStore.setShowModal(true);

            return false;
        }
      } else {
        if (!contentStore.getShowModal) {
          // Show global modal error
          contentStore.setModalData(contentStore.getModal('httpServerError'));
          contentStore.setShowModal(true);
        }

        return false;
      }
    },

    /**
     * Handle loading data for if new quote result page is being used. If _oid is set in the url, we know to use this function
     * to load all the data we will need for the New Purchase Page. From the New Quote Results page, all we need is the _oid, which is passed in the url, and
     * the order token, which is being stored in Local Storage.
     * Info like the product code and quote id will be handled by retrieving neccessary information from the order.
     *
     * @return {Object|Boolean}
     */
    async loadOrderByOid() {
      const urlParams = new URLSearchParams(window.location.search);
      const contentStore = useContentStore();
      const orderId = urlParams.get('_oid');
      const orderToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDER_TOKEN);

      this.setOrderId(orderId);
      this.setOrderToken(orderToken);

      try {
        const order = await this.fetchOrder();
        if (!order) {
          console.error(`Could not get order for id '${this.order.id}'`);
          contentStore.setShowPageLoader(false);
          return false;
        }

        if (this.order.details.products.length !== 0) {
          this.setQuoteId(this.order.details.products[0].quoteId);
          // setting product options in api store
          this.product.options = this.order.details.products[0].options;
          // setting requestPayload options to clickthroughs
          this.requestPayloads.options =
            this.order.details.products[0].clickthroughs;
        }

        return true;
      } catch (err) {
        return this.handleErrorsInForm(err, contentStore);
      }
    },

    /**
     * Sync local storage to store data
     *
     * @return {Void}
     */
    syncLocalStorage() {
      const urlParams = new URLSearchParams(window.location.search);
      // Adding temporary feature to allow quoteId to come in via
      // URL query param. This is for testing purposes and easy
      // access to the app
      const quoteId = urlParams.get('qid');

      if (localStorage.getItem(LOCAL_STORAGE_KEYS.ORDER_ID)) {
        console.info(
          'Setting order ID from local storage: ',
          localStorage.getItem(LOCAL_STORAGE_KEYS.ORDER_ID)
        );
        this.setOrderId(localStorage.getItem(LOCAL_STORAGE_KEYS.ORDER_ID));
      }

      if (localStorage.getItem(LOCAL_STORAGE_KEYS.ORDER_TOKEN)) {
        console.info(
          'Setting order token from local storage: ',
          localStorage.getItem(LOCAL_STORAGE_KEYS.ORDER_TOKEN)
        );
        this.setOrderToken(
          localStorage.getItem(LOCAL_STORAGE_KEYS.ORDER_TOKEN)
        );
      }

      if (localStorage.getItem(LOCAL_STORAGE_KEYS.QUOTE_ID)) {
        console.info(
          'Setting quote ID from local storage: ',
          localStorage.getItem(LOCAL_STORAGE_KEYS.QUOTE_ID)
        );
        this.setQuoteId(localStorage.getItem(LOCAL_STORAGE_KEYS.QUOTE_ID));
      }

      if (quoteId) {
        console.info('Setting quote ID from query params: ', quoteId);
        this.setQuoteId(quoteId);
      }

      this.clearLocalStorage();
    },

    /**
     * Create a new order
     *
     * @return {Object|Boolean}
     */
    async createOrder() {
      const contentStore = useContentStore();
      let res;

      // Set request state
      this.setOrderRequestStatus(HTTP_REQUEST_STATES.PENDING);

      console.info('Creating order...');

      try {
        res = await axios.post(API_ENDPOINTS.order.createOrder, {});
        this.setOrderRequestStatus(HTTP_REQUEST_STATES.COMPLETE);

        // Set API store data
        this.setOrderId(res.data.orderId);
        this.setOrderToken(res.data.token);
        this.setOrderState(res.data.state);

        console.info('Order successfully created. ID: ', res.data.orderId);
        return res.data;
      } catch (err) {
        this.setOrderRequestStatus(HTTP_REQUEST_STATES.ERROR);

        // Show global modal error
        contentStore.setModalData(contentStore.getModal('httpServerError'));
        contentStore.setShowModal(true);

        console.error(err);

        return false;
      }
    },

    /**
     * Fetch order from API
     *
     * @return {Object|Boolean}
     */
    async fetchOrder() {
      const contentStore = useContentStore();
      const formStore = useFormStore();
      let res;

      if (!this.order.id) {
        console.error('Could not fetch order. No order ID available.');
        this.setOrderRequestStatus(HTTP_REQUEST_STATES.NOT_STARTED);

        // Let the user know to try again
        contentStore.setModalData(contentStore.getModal('orderNotFound'));
        contentStore.setShowModal(true);

        return false;
      }

      if (!this.order.details.token) {
        console.error('Could not fetch order. No auth token available.');
        this.setOrderRequestStatus(HTTP_REQUEST_STATES.NOT_STARTED);

        // Let the user know to try again
        contentStore.setModalData(contentStore.getModal('notAuthorized'));
        contentStore.setShowModal(true);

        return false;
      }

      // Set request state
      this.setOrderRequestStatus(HTTP_REQUEST_STATES.PENDING);

      try {
        res = await axios.get(API_ENDPOINTS.order.getOrder(this.order.id), {
          headers: {
            Authorization: `Bearer ${this.order.details.token}`,
          },
        });
        this.setOrderState(res.data.state);

        if (res.data.payStatus) {
          this.setPayStatus(res.data.payStatus);
        }

        if (res.data.orderNumber) {
          contentStore.setOrderNumber(res.data.orderNumber);
        }

        if (res.data.products.length !== 0) {
          this.setOrderProducts(res.data.products);
        }

        if (res.data?.missingInputs) {
          this.setOrderMissingInputs(res.data.missingInputs);
        }

        if (res.data?.requiredInputs) {
          this.setOrderRequiredInputs(res.data.requiredInputs);
          formStore.initRequiredInputsState(res.data.requiredInputs);
          this.setExistingClickThrough();
          this.setOrderDisplayFields();
        }

        this.setOrderDataLoaded(true);
        this.setOrderRequestStatus(HTTP_REQUEST_STATES.COMPLETE);

        return true;
      } catch (err) {
        return this.handleErrorsInForm(err, contentStore);
      }
    },

    /**
     * Add a product to an order
     *
     * @param {String} productCode
     * @param {String} quoteId
     * @param {Array} options
     *
     * @return {Boolean}
     */
    async addProductToOrder(productCode, quoteId, options = []) {
      const contentStore = useContentStore();

      if (!this.order.details.token) {
        console.error('Could not fetch order. No auth token available.');
        this.setOrderRequestStatus(HTTP_REQUEST_STATES.NOT_STARTED);

        // Let the user know to try again
        contentStore.setModalData(contentStore.getModal('notAuthorized'));
        contentStore.setShowModal(true);

        return false;
      }

      if (!productCode || !quoteId) {
        console.error(
          'Could not add product to order. Must provide product code and quote ID'
        );
        return false;
      }

      console.info('Adding product to order.');

      const payload = {
        products: [
          {
            productCode,
            quoteId,
            options,
          }
        ],
      };

      this.setOrderRequestStatus(HTTP_REQUEST_STATES.PENDING);

      try {
        await axios.post(
          API_ENDPOINTS.order.addProduct(this.order.id),
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.order.details.token}`,
            },
          }
        );

        this.setOrderRequestStatus(HTTP_REQUEST_STATES.COMPLETE);
        return true;
      } catch (err) {
        console.error(err);
        this.setOrderRequestStatus(HTTP_REQUEST_STATES.ERROR);

        return false;
      }
    },

    /**
     * Fetch quote details from remote API
     *
     * @return {Object|Boolean}
     */
    async fetchQuoteDetails() {
      const contentStore = useContentStore();
      let res;

      if (!this.quote.id) {
        console.error('Could not call for quote. No quote ID available');
        this.quote.requestStatus = HTTP_REQUEST_STATES.NOT_STARTED;

        contentStore.setModalData(contentStore.getModal('quoteNotFound'));
        contentStore.setShowModal(true);

        return false;
      }

      // Set request state
      this.quote.requestStatus = HTTP_REQUEST_STATES.PENDING;

      try {
        console.info(`Fetching quote by id ${this.quote.id}...`);
        res = await axios.get(API_ENDPOINTS.quote.getQuote(this.quote.id));

        // Set raw quote details in api store
        this.setQuoteDetails(res.data);

        // Set quote details related content in content store
        this.setQuoteDetailsContent(res.data);
        this.setQuoteDetailsFormContent(res.data);
        this.setOrderDisplayFields();

        this.quote.requestStatus = HTTP_REQUEST_STATES.COMPLETE;
        this.quote.dataLoaded = true;
        console.info('Quote details loaded.');
        return res.data;
      } catch (err) {
        this.quote.requestStatus = HTTP_REQUEST_STATES.ERROR;
        this.quote.dataLoaded = false;

        console.error(err);

        if (err?.response?.status) {
          switch (err.response.status) {
            case 400:
            case 404:
              contentStore.setModalData(contentStore.getModal('quoteNotFound'));
              contentStore.setShowModal(true);

              return false;

            default:
              // Show global modal error
              contentStore.setModalData(
                contentStore.getModal('httpServerError')
              );
              contentStore.setShowModal(true);

              return false;
          }
        } else {
          // Show global modal error
          contentStore.setModalData(contentStore.getModal('httpServerError'));
          contentStore.setShowModal(true);

          return false;
        }
      }
    },

    /**
     * Get the product code from URL
     *
     * @return {String}
     */
    getProductCodeFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('_pc') ?? urlParams.get('productCode') ?? '';
    },

    /**
     * Check to see if current productCode is a nation wide cruise plan.
     *
     * @return {Boolean}
     */
    isNWCruisePlan() {
      const productCode = this.getProductCodeFromUrl();
      return ['NWC1', 'NWC2', 'NWC3'].includes(productCode);
    },

    /**
     * Set order ID
     *
     * @param {String|null} id Order ID
     */
    setOrderId(id) {
      this.order.id = id;
    },

    /**
     * Set the quote ID
     *
     * @param {String|null} id
     */
    setQuoteId(id) {
      this.quote.id = id;
    },

    /**
     * Set order token, used to make
     * any API calls aside from creating the
     * order
     *
     * @param {String|null} token
     */
    setOrderToken(token) {
      this.order.details.token = token;
    },

    /**
     * Set order state
     *
     * @param {String} state
     */
    setOrderState(state) {
      this.order.details.state = state;
    },

    /**
     * Set order pay status
     * @param {String} status
     */
    setPayStatus(status) {
      this.order.payStatus = status;
    },

    /**
     * Set order products
     *
     * @param {Array} products
     */
    setOrderProducts(products) {
      const formStore = useFormStore();
      const [product] = products;

      this.order.details.products = products;
      this.setProductForContent(product.quoteResult);
      this.order.totalProducts = products.length;

      if (product.acceptedPaymentMethods.type === 'creditCard') {
        formStore.setAcceptedCreditCardTypes(
          product.acceptedPaymentMethods.options.acceptedCardTypes
        );
      }

      if (products.length > 1) {
        console.debug(
          `Multiple products found on order. Found '${products.length}' products.`
        );
      }

      // Setting products clickthrough for form store.
      product?.quoteResult?.clickthroughs?.forEach((ct) =>
        formStore.addClickthrough(ct)
      );
    },

    /**
     * Update order with incoming product data. Check rules
     * to notify the user of any changes that may have
     * happened with the policy they are trying to purchase
     *
     * @param {Object} product
     */
    updateProduct(product) {
      const formStore = useFormStore();

      if (product?.state === ORDER_STATE.NO_LONGER_AVAILABLE) {
        const eventObject = {
          hierarchical_layer_1: `Product no longer available`,
          hierarchical_layer_2: `Order id: ${product?.orderId}`,
          hierarchical_layer_3: `Product id: ${product?.productId}`,
          hierarchical_layer_4: `Quote id: ${product?.quoteId}`,
        };
        this.setOrderState(product.state);
        if ('rules' in product) {
          this.apiResponseMessages.pns = product.rules;
          eventObject.pnsMessage = product.rules;
        }
        this.order.details.products[0] = null;
        event('productNoLongerAvailable', eventObject);
      } else {
        const existingSelectedOptions =
          this.order.details.products[0].quoteResult.options.filter(
            (option) => option.selected
          );
        const updatedOptions = product.quoteResult.options;
        const existingLTCRules = this.order.details.products[0].quoteResult.ltc;
        const updatedLTCRules = product.quoteResult.ltc;
        const currentCost =
          this.order.details.products[0].quoteResult.totalCost;
        const updatedCost = product.quoteResult.totalCost;
        const currentRequiredInputs =
          this.order.details.products[0].requiredInputs;
        const updatedRequiredInputs = product.requiredInputs;

        // Check to see if we have clickthroughs to add/remove
        // from required field tracking
        if (currentRequiredInputs.length > updatedRequiredInputs.length) {
          const ids = currentRequiredInputs.filter(
            (item) => !updatedRequiredInputs.includes(item)
          );

          // Remove the non-required inputs
          formStore.removeRequiredInputs(ids);

          // Sniff out the clickthroughs and handle those since
          // we have the delta already
          const clickthroughIds = ids
            .filter((item) => item.startsWith('clickthrough.'))
            .map((item) => item.split('.')[1]);

          // Remove the clickthroughs from the form store
          // and order display fields
          if (clickthroughIds.length) {
            clickthroughIds.forEach((id) => {
              formStore.removeClickthrough(id);

              if (`clickthrough.${id}` in this.order.displayFields) {
                this.order.displayFields[`clickthrough.${id}`] = false;
              }
            });
          }
        } else if (
          currentRequiredInputs.length < updatedRequiredInputs.length
        ) {
          const ids = updatedRequiredInputs.filter(
            (item) => !currentRequiredInputs.includes(item)
          );

          // Sniff out the clickthroughs and handle those since
          // we have the delta already
          const clickthroughs = ids
            .filter((item) => item.startsWith('clickthrough.'))
            .map((item) => ({ id: item.split('.')[1], }));

          // Add clickthrough into form store and order required inputs
          if (clickthroughs.length) {
            clickthroughs.forEach((clickthrough) => {
              formStore.addClickthrough(clickthrough);
              this.order.details.requiredInputs.push(
                `clickthrough.${clickthrough.id}`
              );
              this.order.displayFields[
                `clickthrough.${clickthrough.id}`
              ] = true;
            });
          }

          // Add incoming new required inputs
          formStore.initRequiredInputsState(ids);
        }

        // Check to see if any previously selected options
        // are no longer available with the updated product
        existingSelectedOptions.forEach((option) => {
          const id = option.id;
          const match = updatedOptions.find((option) => option.id === id);
          if (!match) {
            this.apiResponseMessages.coverageChanges.push({
              type: 'coverageChange',
              ...option,
            });
          }
        });

        // Check to see if we have any new LTC
        // rules that need to be displayed to the user
        updatedLTCRules.forEach((updatedRule) => {
          const match = existingLTCRules.find(
            (existingRule) => existingRule.id === updatedRule.id
          );
          if (!match) {
            this.apiResponseMessages.coverageChanges.push({
              type: 'ltc',
              ...updatedRule,
            });
          }
        });

        // Check if there is a difference in current
        // cost vs. the incoming cost
        if (currentCost !== updatedCost) {
          const direction =
            currentCost < updatedCost ? 'increased' : 'decreased';
          this.apiResponseMessages.planCostChanges.push({
            cost: updatedCost,
            direction,
          });
        }

        this.order.details.products[0] = product;
        this.setProductForContent(product.quoteResult);

        // If we have any available API response messages to
        // relay to the user, check and show here
        if (this.hasApiResponseMessages) {
          const contentStore = useContentStore();

          // Because this action is triggered from multiple points
          // when filling out the form, check to see if we are in the
          // middle of finalizing the purchase (hit submit button). This
          // will change the content of the modal to display as the user will
          // be presented with different actions
          const modalData = this.finalizingPurchase
            ? contentStore.getModal('policyChangePurchaseInterruption')
            : contentStore.getModal('reviewPolicyChanges');

          contentStore.setModalData(modalData);
          contentStore.setShowModal(true);
        }
      }
    },

    /**
     * Helper Method to Set build Product as content.js is expecting
     *
     * @param {Object} product
     */
    setProductForContent(product) {
      const contentStore = useContentStore();

      const contentProduct = {
        provider: product?.provider,
        product: {
          name: product?.name,
          code: product?.productCode,
          certificateUrl: product?.certificate?.url,
          premium: '',
          totalCost: '',
          policyFee: product?.policyFee,
          tax: product?.tax,
          clickthroughs: product?.clickthroughs,
          options: product?.options,
          ltc: product?.ltc,
        },
      };

      contentStore.setProductDetails(contentProduct);
      contentStore.setPremium(product?.premium);
      contentStore.setTotalCost(product?.totalCost);
    },

    setOrderDisplayFields() {
      const formStore = useFormStore();
      const numberOfTravelers = formStore.getNumberOfTravelers;
      let displayFields = {};

      const product = this.order.details.products[0];
      const clickthroughsWithNoInput = product?.quoteResult?.clickthroughs?.map(
        (ct) => {
          if (ct.type === '') {
            return ct.id;
          }
        }
      );

      this.order.details.requiredInputs.reduce((pre, curr) => {
        // Remove any clickthroughs that are in requestPayloads inputs
        const [type, id] = curr.split('.');
        if (
          type === 'clickthrough' &&
          id in this.requestPayloads.inputs.clickthrough &&
          !clickthroughsWithNoInput.includes(id)
        ) {
          pre[curr] = false;
        } else {
          pre[curr] = true;
        }

        return pre;
      }, displayFields);

      // Logic below is to decided if we should display a whole section.
      // We must set all optional displays false since BaseFormGroup does not support undefined.
      displayFields.displayTravelSupplier = false;
      displayFields.displayPassportFields = false;
      displayFields.displayTripDetails = false;

      for (let i = 0; i < numberOfTravelers; i++) {
        if (
          Object.prototype.hasOwnProperty.call(
            displayFields,
            `passport.${i}.number`
          ) ||
          Object.prototype.hasOwnProperty.call(
            displayFields,
            `passport.${i}.issuingCountry`
          )
        ) {
          displayFields.displayPassportFields = true;
          break;
        }
      }

      if (
        (Object.prototype.hasOwnProperty.call(
          displayFields,
          'trip.firstTripPayment'
        ) &&
          this.quote?.details?.trip?.initialTripPaymentDate === null) ||
        Object.prototype.hasOwnProperty.call(
          displayFields,
          'trip.finalTripPayment'
        ) ||
        Object.prototype.hasOwnProperty.call(displayFields, 'trip.school')
      ) {
        displayFields.displayTripDetails = true;
      }

      // Setting these section to complete
      // since we are not displaying them.
      if (!displayFields.displayPassportFields) {
        formStore.trackSectionCompletion('passport', true, true);
      }

      if (!displayFields.displayTripDetails) {
        formStore.trackSectionCompletion('tripDetails', true, true);
      }

      this.order.displayFields = displayFields;
    },

    /**
     * Set required inputs
     *
     * @param {Array} inputs
     */
    setOrderRequiredInputs(inputs) {
      this.order.details.requiredInputs = inputs;
    },

    /**
     * Set missing inputs
     *
     * @param {Array} inputs
     */
    setOrderMissingInputs(inputs) {
      this.order.details.missingInputs = inputs;
    },

    /**
     * Set Accepted Payment Methods
     *
     * @param {Array} paymentMethods
     */
    setAcceptedPaymentMethods(paymentMethods) {
      this.order.acceptedPaymentMethods = paymentMethods;
    },

    /**
     * Set order status
     *
     * @param {String} status
     */
    setOrderRequestStatus(status) {
      this.order.requestStatus = status;
    },

    /**
     * Set order data loaded
     *
     * @param {Boolean} bool
     */
    setOrderDataLoaded(bool) {
      this.order.dataLoaded = bool;
    },

    /**
     * Set option
     *
     * @param {Boolean} bool
     */
    setOption(key, value) {
      const index = this.requestPayloads.options.findIndex(
        (option) => option.key === key
      );

      if (index !== -1) {
        this.requestPayloads.options[index].value = value;
      } else {
        this.requestPayloads.options.push({ key, value, });
      }
    },

    /**
     * Remove option
     *
     * @param {String} key Option/clickthrough key
     */
    deleteOption(key) {
      const index = this.requestPayloads.options.findIndex(
        (option) => option.key === key
      );

      if (index !== -1) {
        this.requestPayloads.options.splice(index, 1);
      }
    },

    /**
     * Set existing clickthrough from api.
     *
     * When we go to this product
     * the user might accept certain clickthroughs via the pre-buy-modal
     * in quote results. This gets a collection of missing clickthroughs, required
     * clickthroughs and gets the difference and sets the clickthrough value to its validation since
     * they are no longer required.
     */
    setExistingClickThrough() {
      const appDataStore = useAppDataStore();
      const formStore = useFormStore();
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('_oid');

      if (appDataStore.getClickthroughArray?.length > 0) {
        appDataStore.getClickthroughArray.forEach((val) => {
          formStore.setClickthrough(val.key, val.value);
        });
      }

      // if an _oid is passed in the url, we are doing the new way of making a purchase via the v1 api, if not, use legacy way
      if (orderId) {
        const product = this.order.details.products.find(
          (product) =>
            product.productCode ===
            this.order.details.products[0].quoteResult.productCode
        );
        const clickthroughs = product?.clickthroughs;
        const otherClickthroughs = product?.quoteResult?.clickthroughs;
        const clickthroughsWithNoInput = otherClickthroughs?.filter(
          (ct) => ct.type === ''
        );

        clickthroughsWithNoInput?.forEach((ct) => {
          if (ct?.id) {
            formStore.setClickthrough(ct.id, ct.validation);
          }
        });

        clickthroughs?.forEach((ct) => {
          if (ct?.id) {
            formStore.setClickthrough(ct.id, ct.value);
          }
        });
      } else {
        // Our apis make clickthrough notes that are display only as a required input.
        // We are setting them as completed here.
        const clickthroughs = this.order.details.products.find(
          (product) => product.productCode === this.getProductCodeFromUrl()
        )?.quoteResult?.clickthroughs;
        const clickthroughsWithNoInput = clickthroughs?.filter(
          (ct) => ct.type === ''
        );
        clickthroughsWithNoInput?.forEach((ct) => {
          formStore.setClickthrough(ct.id, ct.validation);
        });
      }
    },

    /**
     * Set quote details
     *
     * @param {Object} data Quote details response data
     */
    setQuoteDetails(data) {
      this.quote.details = data;
    },

    /**
     * Set quote details data display content
     * in content store
     *
     * @param {Object} data Quote details response data
     */
    setQuoteDetailsContent(data) {
      const contentStore = useContentStore();
      const { trip, travelers, clickthroughs, } = data;

      // Set content store with display data.
      if (trip.destinations.length) {
        // Quote can have multiple destination, but this
        // is not something we are concerned with right now.
        // This is forward thinking for a change in
        // quote/purchase process that we will not support
        // immediately
        contentStore.setQuoteDestination(trip.destinations[0].country);
      }

      if (Array.isArray(clickthroughs) && clickthroughs.length) {
        contentStore.setClickthroughs(clickthroughs);
      }

      if (trip.departureDate) {
        contentStore.setQuoteDepartureDate(trip.departureDate);
      }
      if (trip.returnDate) {
        contentStore.setQuoteReturnDate(trip.returnDate);
      }
      if (travelers.length) {
        const primaryTraveler = travelers.find(({ primary, }) => primary);

        if (primaryTraveler && 'tripCost' in primaryTraveler) {
          contentStore.setQuoteTripCost(primaryTraveler.tripCost);
        }

        this.setInitialTravelerApiRequestData(travelers.length);
      }
    },

    /**
     * Translate quote details data and set appropriately
     * in the form store
     *
     * @param {Object} data Quote details response data
     */
    setQuoteDetailsFormContent(data) {
      const formStore = useFormStore();
      const contentStore = useContentStore();

      data.travelers.forEach((traveler, index) => {
        let travelerAge = null;

        // Determine age based on the provided
        // quote data. Age support is not fully implemented
        // in the quote API, so calculate accordignly
        if (traveler?.age) {
          travelerAge = traveler.age;
          formStore.setTravelerAge(traveler.age, index);
        } else if (traveler?.dateOfBirth) {
          const now = dayjs();
          const dob = dayjs(traveler.dateOfBirth);
          travelerAge = now.diff(dob, 'year');
        }

        if (traveler.primary) {
          formStore.setTripCost(traveler.tripCost);
          formStore.setTravelerAge(travelerAge, index);

          if ('citizenship' in traveler) {
            formStore.setResidenceCitizenship(traveler.citizenship);
          }
          // Primary traveler residence info rules all travelers.
          // This would be the information that was originally
          // quoted with.
          formStore.setCountry('residence', traveler.residence.country);
          formStore.setState('residence', traveler.residence.stateProvince);
          formStore.setCountry('billing', traveler.residence.country);
          formStore.setState('billing', traveler.residence.stateProvince);

          // Allowing for residence change if user is not USA.
          if (
            traveler.residence.country !== 'USA'
          ) {
            contentStore.setFormInput('residenceState', {
              disabled: false,
              readOnly: false,
            });
            
            // Allowing for residence country change if user is not CAN.
            if (traveler.residence.country !== 'CAN') {
              contentStore.setFormInput('residenceCountry', {
                disabled: false,
                readOnly: false,
              });
            }
            contentStore.setAllowResidenceChange(true);
          }
        } else {
          formStore.addAdditionalTraveler(travelerAge, index);
        }

        if (traveler.residence.country) {
          formStore.setPassportCountry(traveler.residence.country, index);
        }
      });

      // Set content store with display data.
      if (data.trip.destinations.length) {
        // Quote can have multiple destination, but this
        // is not something we are concerned with right now.
        // This is forward thinking for a change in
        // quote/purchase process that we will not support
        // immediately
        formStore.setDestination(data.trip.destinations[0].country);
      }

      if (data.trip?.initialTripPaymentDate) {
        const formattedDate = dayjs(data.trip.initialTripPaymentDate).format(
          DATE_FORMAT.INPUT_FIELD
        );
        formStore.setInitialTripPaymentDate(formattedDate);
      }
    },

    /**
     * Sets the traveler related API request data reliant on
     * number of travelers
     *
     * @param {Integer} count
     */
    setInitialTravelerApiRequestData(count) {
      for (let i = 0; i < count; i++) {
        // Set empty traveler objects
        this.requestPayloads.inputs.travelers.push({
          name: {
            first: null,
            last: null,
            middle: null,
            suffix: null,
          },
          dob: null,
        });

        // Set empty passport objects
        this.requestPayloads.inputs.passport.push({
          number: null,
          issuingCountry: null,
        });
      }
    },
    translateTurnstileErrors(errorCodes) {
      const errorMap = {
        'missing-input-secret':
          'Cloudflare Verification failed: Secret key is missing.',
        'invalid-input-secret':
          'Cloudflare Verification failed: Secret key is invalid or malformed.',
        'missing-input-response':
          'Cloudflare Verification failed: Response token is missing. Please complete the CAPTCHA.',
        'invalid-input-response':
          'Cloudflare Verification failed: Response token is invalid or malformed.',
        'bad-request':
          'Cloudflare Verification failed: The request was malformed.',
        'timeout-or-duplicate':
          'Cloudflare Verification failed: The token has expired or was already used.',
        'internal-error':
          'Cloudflare Verification failed: An internal error occurred. Please try again later.',
        'imt-http-error':
          'An issue occurred while trying to process payment within IMT for Cloudflare Turnstile token verification',
      };

      return errorCodes.map(
        (code) =>
          errorMap[code] ||
          `Cloudflare Verification failed: Unknown error code '${code}'.`
      );
    },
    /**
     * Handles Cloudflare Turnstile verification, carding block, and repeating purchase block checks
     * for the purchase process
     *
     * @param {String} email - The email of the user making the purchase
     * @param {String} orderId - The unique identifier of the order
     * @returns {Boolean} True if the user is blocked by any of the verification checks.
     */
    async handleVerification(orderId) {
      // handling customer email verification to make sure not on blocklist
      console.info('Processing email...');

      const isCardingBlocked = await this.handleVerifyEmailCheck(orderId);

      if (isCardingBlocked) {
        return true;
      }

      // handles verification so customer is not making too many repeated purchases with same details
      console.info('Processing purchase for submission...');

      const isUserMakingTooManyRepeatedPurchases =
        await this.handleVerifySubmissionCheck(orderId);

      if (isUserMakingTooManyRepeatedPurchases) {
        return true;
      }

      return false;
    },
    /**
     * Verifies if user is making too many repeated purchases.
     * @param {String} orderId - The unique identifier of the order
     * @returns {Boolean} True if the user is blocked by submission verification.
     */
    async handleVerifySubmissionCheck(orderId) {
      const contentStore = useContentStore();
      const formStore = useFormStore();
      const quoteDetails = contentStore.getQuoteDetails;
      const email = formStore.getEmailAddress.toLowerCase();

      const submissionData = {
        firstName: formStore.getTravelerFirstName(0),
        lastName: formStore.getTravelerLastName(0),
        email: email,
        phone: formStore.getPhoneNumber,
        dob: formStore.getTravelerDob(0),
        destinationCountry: quoteDetails['destination'],
        tripCost: quoteDetails['tripCost'],
        departureDate: quoteDetails['departureDate'],
        returnDate: quoteDetails['returnDate'],
        productCode: this.getProductCode,
      };

      let res;
      try {
        res = await axios.post(
          `${API_ENDPOINTS.order.verifySubmission(orderId)}`,
          submissionData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.order.details.token}`,
            },
          }
        );
      } catch (error) {
        console.error('Error verifying submission check:', {
          error: error.message,
        });
        // If verification request failed, do not block by default — return explicit false
        return false;
      }

      const responseData = res?.data ?? {};
      const isUserBlocked = !!responseData['blocked'];

      if (isUserBlocked) {
        contentStore.setShowPageLoader(false);
        this.finalizingPurchase = false;

        contentStore.setModalData(
          contentStore.getModal('repeatedSubmissionError')
        );
        contentStore.setShowModal(true);

        // if customer making too many submissions with the same trip and quote details, block them
        event('buy-page_block_user_multiple_submissions', {
          hierarchical_layer_1: `Email: ${email}`,
          hierarchical_layer_2: contentStore.isThemeSoventure
            ? 'SOVENTURE'
            : 'IMT',
        });
      }
      return isUserBlocked;
    },
    /**
     * Verify the Cloudflare turnstile token by sending a request to the API and handle appropriate responses.
     * If the response indicates an error, this function will log the error and either block the user from making a purchase
     * or log the error and still allow the customer to purchase their policy.
     * @param {String} orderId
     * @returns {Promise<Boolean>} true if the user was blocked
     */
    async handleCloudflareTurnstileVerification(orderId) {
      const contentStore = useContentStore();
      const formStore = useFormStore();
      const token = formStore.getCaptchaToken;

      let res;
      try {
        res = await axios.post(
          `${API_ENDPOINTS.order.verifyCaptchaToken(orderId)}`,
          {
            token,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.order.details.token}`,
            },
          }
        );
      } catch (error) {
        console.error('Error handling cloudflare turnstile verification:', {
          error: error.message,
        });
        // If captcha verification request failed, allow the flow to continue but do not block
        return false;
      }

      const responseData = res?.data ?? {};
      const responseErrorCodes = responseData['error-codes'] ?? [];
      const isUserBlocked = !!responseData['blocked'];

      if (isUserBlocked) {
        contentStore.setShowPageLoader(false);
        this.finalizingPurchase = false;

        contentStore.setModalData(contentStore.getModal('captchaError'));
        contentStore.setShowModal(true);

        const messages = this.translateTurnstileErrors(responseErrorCodes);
        event('buy-page_cloudflare_block_user', {
          hierarchical_layer_1: `Error Code ${messages.toString()}`,
          hierarchical_layer_2: contentStore.getTheme.toUpperCase(),
        });
      }

      return isUserBlocked;
    },
    /**
     * Verifies if email is blocked on Carding block list,
     * if true we want to block the user from making a purchase.
     * @param {String} orderId
     * @returns {Boolean} true if the user was blocked
     */
    async handleVerifyEmailCheck(orderId) {
      const contentStore = useContentStore();
      const formStore = useFormStore();
      const email = formStore.getEmailAddress.toLowerCase();

      let res;
      try {
        res = await axios.post(
          `${API_ENDPOINTS.order.verifyEmail(orderId)}`,
          {
            email,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.order.details.token}`,
            },
          }
        );
      } catch (error) {
        console.error('Error verifying email check:', {
          error: error.message,
          email: formStore.getEmailAddress.toLowerCase(),
        });
        // If email verification fails due to network issue, do not block by default
        return false;
      }

      const responseData = res?.data ?? {};
      const isUserBlocked = !!responseData['blocked'];

      if (isUserBlocked) {
        contentStore.setShowPageLoader(false);
        this.finalizingPurchase = false;

        contentStore.setModalData(contentStore.getModal('emailBlockedError'));
        contentStore.setShowModal(true);

        event('buy-page_cloudflare_user_on_blocklist', {
          hierarchical_layer_1: `Email: ${email}`,
          hierarchical_layer_2: contentStore.isThemeSoventure
            ? 'SOVENTURE'
            : 'IMT',
        });
      }

      return isUserBlocked;
    },
    /**
     * Facilitates the remaining steps to complete
     * an order. Triggered when a user clicks the
     * form submit button.
     *
     * @return {Void}
     */
    async processSubmit() {
      const contentStore = useContentStore();
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('_oid');

      if (!this.order.id) {
        this.setOrderRequestStatus(HTTP_REQUEST_STATES.NOT_STARTED);
        console.error('No order id available');
      }

      if (!this.order.details.token) {
        console.error(
          `Could not get order id '${this.order.id}'. Missing or expired auth token.`
        );

        contentStore.setModalData(contentStore.getModal('tokenNotFound'));
        contentStore.setShowModal(true);

        return false;
      }

      contentStore.setPageLoaderData(contentStore.getPageLoader('processForm'));
      contentStore.setShowPageLoader(true);
      this.finalizingPurchase = true;

      // handle verification for order
      const isUserBlocked = await this.handleVerification(orderId);

      if (isUserBlocked) {
        return false;
      }

      // if no _oid passed in url, assume we are doing the legacy way of making a purchase
      // and thus we do not need to overwrite any options selected
      if (!orderId) {
        // Add options to product
        const addOptionsToProduct = await this.addOptionsToProduct();
        if (!addOptionsToProduct || this.hasApiResponseMessages) {
          contentStore.setShowPageLoader(false);
          this.finalizingPurchase = false;

          return false;
        }
      }

      // Check to make sure this is not an existing order with a sanctions hold
      const order = await this.fetchOrder();
      if (!order) {
        console.error(`Could not get order for id '${this.order.id}'`);
        contentStore.setShowPageLoader(false);
        return false;
      }
      if (this.getPayStatus === "SANCTIONS_HOLD") {
        contentStore.setShowPageLoader(false);
        this.finalizingPurchase = false;
        return false;
      }

      // Add the inputs to the product
      const addInputsToProduct = await this.addProductInputsToProduct();

      // Cannot continue, error occured adding product
      // inputs, the order is somehow not in `READY_TO_PURCHASE` state,
      // or there needs to be some messaging relayed to the user
      if (!addInputsToProduct || this.hasApiResponseMessages) {
        contentStore.setShowPageLoader(false);
        this.finalizingPurchase = false;

        return false;
      }

      const product = this.order.details.products[0];

      // Product is not ready for purchase
      if (product.state !== ORDER_STATE.READY_FOR_PURCHASE) {
        // Cannot continue with completing the order. Grab the
        // order and update data in store
        await this.fetchOrder();

        // Since the product is not ready for purchase for some reason,
        // broadcast missing information message to user.
        if (this.order.details.missingInputs) {
          this.order.details.missingInputs.forEach((input) => {
            this.apiResponseMessages.missingInputs.push(input);
          });

          contentStore.setModalData(
            contentStore.getModal('apiResponseMessages')
          );
          contentStore.setShowModal(true);
        }

        contentStore.setShowPageLoader(false);
        this.finalizingPurchase = false;
        return false;
      }

      contentStore.setPageLoaderData(
        contentStore.getPageLoader('processPayment')
      );

      // Add the payment to the order
      const addPayment = await this.addPaymentToOrder();

      // Cannot continue, error occured adding payment
      if (!addPayment) {
        contentStore.setShowPageLoader(false);
        this.finalizingPurchase = false;
        return false;
      }

      // Process the order
      const processOrder = await this.processPaymentOnOrder();

      if (!processOrder) {
        contentStore.setShowPageLoader(false);
        this.finalizingPurchase = false;
        return false;
      }

      // Great success!!
      contentStore.setPageLoaderData(
        contentStore.getPageLoader('orderComplete')
      );

      // Fire any success event tracking, always return true if tracking fails.
      try {
        await this.sendPurchaseSuccessEventTracking();
      } catch (e) {
        return true;
      }

      return true;
    },

    /**
     * Add product inputs to a product
     *
     * @returns {Boolean} Pass/fail status
     */
    async addProductInputsToProduct() {
      const contentStore = useContentStore();
      const requestPayload = removeUnknownProperties(
        this.requestPayloads.inputs
      );
      let res;

      this.setOrderRequestStatus(HTTP_REQUEST_STATES.PENDING);

      if (!this.order.details.token) {
        console.error(
          `Could not get order id '${this.order.id}'. Missing or expired auth token.`
        );

        contentStore.setModalData(contentStore.getModal('tokenNotFound'));
        contentStore.setShowModal(true);

        return false;
      }

      try {
        console.info('Adding inputs to product...');

        res = await axios.put(
          API_ENDPOINTS.order.addProductInputs(
            this.order.id,
            this.order.details.products[0].productId
          ),
          requestPayload,
          {
            headers: {
              Authorization: `Bearer ${this.order.details.token}`,
            },
          }
        );

        this.updateProduct(res.data);
        this.setOrderRequestStatus(HTTP_REQUEST_STATES.COMPLETE);

        console.info('Product update complete.');
        return true;
      } catch (err) {
        this.setOrderRequestStatus(HTTP_REQUEST_STATES.ERROR);
        this.setOrderDataLoaded(false);

        console.error(err);

        return this.handleErrorCodes(err);
      }
    },

    /**
     * Add options to a product
     *
     * @returns {Boolean} Pass/fail status
     */
    async addOptionsToProduct() {
      const contentStore = useContentStore();
      const requestPayload = {
        options: removeUnknownProperties(this.requestPayloads.options),
      };

      this.setOrderRequestStatus(HTTP_REQUEST_STATES.PENDING);

      try {
        console.info('Adding options to product...');
        await axios.put(
          API_ENDPOINTS.order.addProductOptions(
            this.order.id,
            this.order.details.products[0].productId
          ),
          requestPayload,
          {
            headers: {
              Authorization: `Bearer ${this.order.details.token}`,
            },
          }
        );

        this.setOrderRequestStatus(HTTP_REQUEST_STATES.COMPLETE);

        console.info('Product update complete.');
        return true;
      } catch (err) {
        this.setOrderRequestStatus(HTTP_REQUEST_STATES.ERROR);
        this.setOrderDataLoaded(false);

        console.error(err);

        return this.handleErrorCodes(err);
      }
    },

    /**
     * Add a payment to an order
     *
     * @returns {Boolean} Pass/fail of the request
     */
    async addPaymentToOrder() {
      const contentStore = useContentStore();
      const requestPayload = removeUnknownProperties(
        this.requestPayloads.payment
      );

      this.setOrderRequestStatus(HTTP_REQUEST_STATES.PENDING);

      try {
        console.info('Adding payment information to order...');
        await axios.post(
          API_ENDPOINTS.order.addPayment(this.order.id),
          requestPayload,
          {
            headers: {
              Authorization: `Bearer ${this.order.details.token}`,
            },
          }
        );

        this.setOrderRequestStatus(HTTP_REQUEST_STATES.COMPLETE);
        console.info('Payment successfully added.');

        return true;
      } catch (err) {
        this.setOrderRequestStatus(HTTP_REQUEST_STATES.ERROR);
        this.setOrderDataLoaded(false);

        console.error('Error occured while adding payment information:', err);

        return this.handleErrorCodes(err);
      }
    },

    /**
     * Process the payment on order
     *
     * @return {Void}
     */
    async processPaymentOnOrder() {
      const contentStore = useContentStore();
      const formStore = useFormStore();
      const optinMarketing = formStore.getMarketingOptIn;
      const params = new URLSearchParams();

      // get the payment request payload to get the cvv to be process by our merchants
      const requestPayload = removeUnknownProperties(
        this.requestPayloads.payment
      );

      // extract the cvv
      const cvv = requestPayload.details.cvv2;
      if (optinMarketing) {
        params.set('optin', true);
      }

      // set the payload
      const payload = {
        cvv: cvv,
        insureMyTripSubFlow: this.requestPayloads.mode,
      };

      this.setOrderRequestStatus(HTTP_REQUEST_STATES.PENDING);

      try {
        console.info('Processing payment on order...');
        const res = await axios.post(
          `${API_ENDPOINTS.order.processPayment(
            this.order.id
          )}?${params.toString()}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.order.details.token}`,
            },
          }
        );

        this.setOrderRequestStatus(HTTP_REQUEST_STATES.COMPLETE);
        this.order.details.state = res.data.state;

        // A `200` success doesn't mean the order was completed.
        // Handle payment issues accordingly if order status is not
        // COMPLETE or DELAYED
        if (
          ![ORDER_STATE.COMPLETED, ORDER_STATE.DELAYED].includes(
            res.data.state
          ) ||
          !res.data?.orderNumber
        ) {
          this.handleProcessPaymentFailure(res.data);
          return false;
        }

        contentStore.setOrderNumber(res.data.orderNumber);

        this.order.number = res.data.orderNumber;
        this.order.details.state = res.data.state;

        console.info('Payment processed.');

        return true;
      } catch (err) {
        this.setOrderRequestStatus(HTTP_REQUEST_STATES.ERROR);

        console.error(err);

        if (err?.response?.status) {
          switch (err.response.status) {
            case 400:
              if ('errors' in err.response.data) {
                err.response.data.errors.forEach((error) => {
                  this.apiResponseMessages.errors.push(
                    `"${error.property}" ${error.message}`
                  );
                });

                contentStore.setModalData(
                  contentStore.getModal('apiResponseMessages')
                );
                contentStore.setShowModal(true);
              }

              return false;

            case 403:
              contentStore.setModalData(contentStore.getModal('notAuthorized'));
              contentStore.setShowModal(true);

              return false;

            case 404:
              contentStore.setModalData(
                contentStore.getModal('paymentNotProcessed')
              );
              contentStore.setShowModal(true);

              return false;

            default:
              // Show global modal error
              contentStore.setModalData(
                contentStore.getModal('httpServerError')
              );
              contentStore.setShowModal(true);

              return false;
          }
        } else {
          // Show global modal error
          contentStore.setModalData(contentStore.getModal('httpServerError'));
          contentStore.setShowModal(true);

          return false;
        }
      }
    },

    /**
     * Handler for payment processing failure
     *
     * @param {Object} data Response data from process payment request
     * @return {Void}
     */
    handleProcessPaymentFailure(data) {
      const contentStore = useContentStore();

      switch (data.payStatus) {
        case PAYMENT_STATE.AUTH_DECLINED:
        case PAYMENT_STATE.CAPTURE_DECLINED:
          contentStore.setModalData(
            contentStore.getModal('paymentMethodDeclined')
          );
          break;

        case PAYMENT_STATE.AUTH_FAILED:
        case PAYMENT_STATE.CAPTURE_FAILED:
          contentStore.setModalData(
            contentStore.getModal('paymentProviderFailed')
          );
          break;

        default:
          contentStore.setModalData(
            contentStore.getModal('paymentNotProcessed')
          );
          break;
      }

      contentStore.setShowModal(true);
    },

    /**
     * Send analytics events upon successful purchase
     *
     * @return {Void}
     */
    async sendPurchaseSuccessEventTracking() {
      const appDataStore = useAppDataStore();
      const formStore = useFormStore();
      const contentStore = useContentStore();

      // Track which options are selected in our optional section when submitting a purchase
      event('buy-page_options-selected', {
        hierarchical_layer_1: `Airline selected: ${appDataStore.getAirlineName(
          formStore.getAirline
        )}`,
        hierarchical_layer_2: `Cruise line selected: ${appDataStore.getCruiseLineName(
          formStore.getCruiseLine
        )}`,
        hierarchical_layer_3: `Tour operator selected: ${appDataStore.getTourOperatorName(
          formStore.getTourOperator
        )}`,
      });

      // Purchase event tracking
      await this.sendAttributionTracking();

      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');

      // vue-gtag is wrapping our event() data in a non-standard format, putting our values in an eventModel object.
      // This is not compatible with our TikTok pixel so we can also push up the correct dataLayer structure expected
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'ecommerceEvent',
        ecommerce: {
          transaction_id: this.order.number,
          currency: 'USD',
          value: this.getProductTotalCost,
          items: [
            {
              id: contentStore.productDetails.product.code,
              name: contentStore.productDetails.product.name,
              price: this.getProductTotalCost,
              quantity: 1,
            }
          ],
        },
        item_purchased_with_npp: true,
        eduPurchase: mode === 'edu'
      });
    },

    /**
     * Submits our attribution tracking data to our WP table
     * @param {boolean} hasRetried
     * @returns boolean
     */
    async sendAttributionTracking(hasRetried = false) {
      try {
        // Guard against undefined imtAttributionLogging
        // eslint-disable-next-line no-undef
        if (
          typeof imtAttributionLogging === 'undefined' ||
          !imtAttributionLogging?.nonce
        ) {
          console.error(
            'imtAttributionLogging configuration is missing or invalid'
          );
          return false;
        }

        // Guard against missing order ID
        if (!this.order?.id) {
          console.error(
            'Cannot send attribution tracking - order ID is missing'
          );
          return false;
        }

        console.info('Sending attribution tracking data...');

        const response = await axios.post(
          API_ENDPOINTS.wordpress.attribution,
          {
            sales_transaction_id: this.order.id,
          },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              // eslint-disable-next-line no-undef
              'X-WP-Nonce': imtAttributionLogging.nonce,
            },
          }
        );

        // Check response status
        if (response.status !== 200) {
          console.warn(
            'Attribution tracking request completed but returned non-200 status:',
            response.status
          );
        }

        return true;
      } catch (err) {

        // If we failed to send attribution, lets fresh our nonce and try again
        if (!hasRetried) {
          console.warn('Failed to send attribution, retrying: ', err.response?.data?.message);
          const refreshed = await this.fetchNewNonce();
          if (refreshed) {
            return this.sendAttributionTracking(true); // retry
          }
        }

        // Log detailed error info
        console.error('Error occurred sending attribution tracking:', {
          message: err.response?.data?.message,
          status: err.response?.status,
          data: err.response?.data,
          orderId: this.order?.id,
        });

        return false;
      }
    },

    /**
     * Hits our WP endpoint to fetch a new nonce
     */
    async fetchNewNonce() {
      try {
        const res = await axios.get(API_ENDPOINTS.wordpress.refreshNonce);
        if (res.status === 200 && res.data?.nonce) {
          // eslint-disable-next-line no-undef
          imtAttributionLogging.nonce = res.data.nonce;
          console.info('Fetched new nonce:', res.data.nonce);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Failed to refresh nonce:', err);
        return false;
      }
    },

    /**
     * Clears any errors from API responses
     */
    clearApiResponseMessages() {
      this.apiResponseMessages = {
        errors: [],
        missingInputs: [],
        coverageChanges: [],
        planCostChanges: [],
        pns: [],
      };
    },

    /**
     * Clear out local storage data
     *
     * @return {Void}
     */
    clearLocalStorage() {
      for (let item in LOCAL_STORAGE_KEYS) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS[item]);
      }
    },

    /**
     * Clear out session storage data
     *
     * @return {Void}
     */
    clearSessionStorage() {
      for (let item in SESSION_STORAGE_KEYS) {
        sessionStorage.removeItem(SESSION_STORAGE_KEYS[item]);
      }
    },

    /**
     * Removes our product from our order
     *
     * @param {Void}
     */
    async getProductsFromOrder() {
      try {
        const res = await axios.get(
          API_ENDPOINTS.order.getProductsFromOrder(this.order.id),
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.order.details.token}`,
            },
          }
        );

        this.order.requestStatus = HTTP_REQUEST_STATES.COMPLETE;
        this.order.dataLoaded = true;

        if (res.status === 200) {
          return res.data.products;
        }
      } catch (err) {
        this.order.requestStatus = HTTP_REQUEST_STATES.ERROR;
        this.order.dataLoaded = false;

        console.error(err);
        return {};
      }
    },

    /**
     * Removes our product from our order
     *
     * @param {String} productId - our product id
     */
    async removeProductFromOrder(productId) {
      try {
        await axios.delete(
          API_ENDPOINTS.order.removeProductFromOrder(this.order.id, productId),
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.order.details.token}`,
            },
          }
        );

        this.order.requestStatus = HTTP_REQUEST_STATES.COMPLETE;
        this.order.dataLoaded = true;

        return true;
      } catch (err) {
        this.order.requestStatus = HTTP_REQUEST_STATES.ERROR;
        this.order.dataLoaded = false;

        console.error(err);
        return false;
      }
    },

    /**
     * Handler for a partner event
     *
     * @param {String} event Event name
     * @returns {Object|Boolean}
     */
    async handlePartnerEvent(event) {
      const referenceId = this.getQuoteMetadataValue('referenceId');
      const impactClickId =
        this.getQuoteMetadataValue('impactClickId') ||
        document
          .getElementById('purchase-app')
          ?.getAttribute('data-impact-click-id');

      let res;

      if (!this.order.id) {
        console.error('Can not call for order. No order ID available');
        return false;
      }

      if (!this.quote.id) {
        console.error(
          'Cannot add an event to an order. No quote ID is available.'
        );
        return false;
      }

      const data = {
        eventType: event,
        productCode: this.getProductCode,
      };

      if (referenceId) {
        data.referenceId = referenceId;
      }

      if (impactClickId && document.location.hostname.includes('soventure')) {
        data.impactClickId = impactClickId;
      }

      if (event === PARTNER_EVENT_TYPES.VERIFY_PAGE) {
        data.quoteId = this.quote.id;
        data.orderId = this.order.id;
      } else if (event === PARTNER_EVENT_TYPES.CONFIRMATION_PAGE) {
        data.quoteReferenceId =
          this.getQuoteMetadataValue('quoteId') ?? this.quote.id;
        data.orderId = this.order.number;
      }

      try {
        res = await axios.post(
          API_ENDPOINTS.order.addPartnerEventForOrder(this.order.id),
          data,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${this.order.details.token}`,
            },
          }
        );

        this.order.requestStatus = HTTP_REQUEST_STATES.COMPLETE;
        this.order.dataLoaded = true;

        return res.data;
      } catch (err) {
        this.order.requestStatus = HTTP_REQUEST_STATES.ERROR;
        this.order.dataLoaded = false;

        console.error('Could not add partner event. ', err);

        switch (err.response.status) {
          case 400:
          case 403:
          case 404:
            this.order.dataLoaded = false;
            this.order.requestStatus = HTTP_REQUEST_STATES.ERROR;

            return false;

          default:
            this.order.requestStatus = HTTP_REQUEST_STATES.ERROR;
            this.order.dataLoaded = false;

            return false;
        }
      }
    },

    /**
     * Get suggestions from autocomplete API
     *
     * @param {String} query Searchable text
     * @param {String} type Field type, e.g. billing or residence
     *
     * @returns {Void}
     */
    async fetchAddressSuggestions(query, type) {
      if (!query || query.length < 5) {
        this.addressSuggestions.suggestions = [];
        this.addressSuggestions.showSuggestions = false;
        return false;
      }

      this.addressSuggestions.loading = true;

      this.addressLookupPayload.address.addressLines[0] = query;

      const formStore = useFormStore();
      const countryCode = formStore.getCountry(type);
      const stateCode = formStore.getState(type);
      const postalCode = formStore.getZip(type);
      const city = formStore.getCity(type);

      // Include State and Country codes if they are available
      if (countryCode) {
        this.addressLookupPayload.address.country = countryCode;
      }

      if (stateCode) {
        this.addressLookupPayload.address.admin1 = stateCode;
      }

      if (postalCode) {
        this.addressLookupPayload.address.postalCode = postalCode;
      }

      if (city) {
        this.addressLookupPayload.address.city = city;
      }

      const configCatClient = configcat.getClient(
        import.meta.env.VITE_CONFIG_CAT_SDK_KEY
      );

      const addressLookupUrl = await configCatClient?.getValueAsync(
        'imt_20250815_address_lookup_url_us_release',
        ''
      );

      if (!addressLookupUrl) {
        console.error('No address lookup URL found');
        return false;
      }

      try {
        const res = await axios.post(
          `${addressLookupUrl}/autocomplete`,
          this.addressLookupPayload,
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'X-Transaction-Id': this.getAddressAutocompleteTransactionId(),
            },
          }
        );

        const data = JSON.parse(res.data);

        this.addressSuggestions.suggestions = data.response.predictions || [];
        this.addressSuggestions.showSuggestions = true;
      } catch (e) {
        this.addressSuggestions.suggestions = [];
        this.addressSuggestions.showSuggestions = false;
      } finally {
        this.addressSuggestions.loading = false;
        this.addressLookupPayload.address.country = '';
        this.addressLookupPayload.address.admin1 = '';
        this.addressLookupPayload.address.postalCode = '';
        this.addressLookupPayload.address.city = '';
      }
    },

    /**
     * Gets autocomplete request transaction ID
     *
     * @returns {String}
     */
    getAddressAutocompleteTransactionId() {
      if (this.shouldRegenerateAddressTransactionId) {
        this.addressLookupTransaction.id = crypto.randomUUID();
        this.addressLookupTransaction.callCount = 0;
      }

      this.addressLookupTransaction.callCount++;
      this.addressLookupTransaction.lastCallTime = Date.now();

      return this.addressLookupTransaction.id;
    },

    /**
     * Reset autocomplete transaction request value
     *
     * @returns {Void}
     */
    resetAddressAutocompleteTransaction() {
      this.addressLookupTransaction.id = crypto.randomUUID();
      this.addressLookupTransaction.callCount = 0;
      this.addressLookupTransaction.lastCallTime = Date.now();
    },

    setShowSuggestions(showSuggestions) {
      this.addressSuggestions.showSuggestions = showSuggestions;
    },
    setAddressSuggestions(suggestions) {
      this.addressSuggestions.suggestions = suggestions;
    },
    setLoadingSuggestions(loading) {
      this.addressSuggestions.loading = loading;
    },
    async setWPPlanContent() {
      try {
        const contentStore = useContentStore();
        const productCode = this.getProductCodeFromUrl();
        const { data, } = await axios.get(API_ENDPOINTS.wordpress.content);
        if (productCode in data && data[productCode].logo) {
          contentStore.setPlanLogo(data[productCode].logo);
        }
      } catch (error) {
        console.error(`Error fetching plan content: ${error}`);
      }
    },
    handleErrorCodes(err) {
      const contentStore = useContentStore();

      if (err?.response?.status) {
        switch (err.response.status) {
          case 400:
            if ('errors' in err.response.data) {
              err.response.data.errors.forEach((error) => {
                this.apiResponseMessages.errors.push(
                  `"${error.property}" ${error.message}`
                );
              });

              contentStore.setModalData(
                contentStore.getModal('apiResponseMessages')
              );
              contentStore.setShowModal(true);
            }

            return false;

          case 403:
            contentStore.setModalData(contentStore.getModal('notAuthorized'));
            contentStore.setShowModal(true);

            return false;

          case 404:
            contentStore.setModalData(contentStore.getModal('orderNotFound'));
            contentStore.setShowModal(true);

            return false;
          
          case 429:
            contentStore.setModalData(contentStore.getModal('repeatedSubmissionError'));
            contentStore.setShowModal(true);
            return false;

          default:
            // Show global modal error
            contentStore.setModalData(
              contentStore.getModal('httpServerError')
            );
            contentStore.setShowModal(true);

            return false;
        }
      } else {
        // Show global modal error
        contentStore.setModalData(contentStore.getModal('httpServerError'));
        contentStore.setShowModal(true);

        return false;
      }
    },
  },
});
