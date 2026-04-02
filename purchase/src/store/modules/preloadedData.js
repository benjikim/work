import axios from 'axios';
import { defineStore } from 'pinia';
import { API_ENDPOINTS, HTTP_REQUEST_STATES, isLocal } from '../../config';

export const useAppDataStore = defineStore('app-data-store', {
  state: () => {
    return {
      isDataLoaded: false,
      requestStatus: HTTP_REQUEST_STATES.NOT_STARTED,
      selectedOptions: [], // only used with legacy quote id
      clickthroughArray: [], // only used with legacy quote id
      qid: '',
      errors: [],
      travelSuppliers: {
        airlines: {},
        cruiselines: {},
        tourOperators: {},
      },
      countries: {},
      countrySubdivisions: {
        us: {
            states: {},
            territories: {},
        },
        ca: {
            provinces: {},
        },
        other: {
            OT: {},
        },
      },
      suffixTypes: {},
      partner: {},
      trackingProviders: {},
    };
  },

  getters: {
    getQuoteId() {
      return this.qid;
    },
    getSelectedOptions() {
      return this.selectedOptions;
    },
    getClickthroughArray() {
      return this.clickthroughArray;
    },
    getErrors() {
      return this.errors;
    },
    getCountries() {
      return this.countries;
    },
    /**
     * Return the country display name from code
     *
     * @param {String} code Country code
     */
    getCountryNameFromCode() {
      return (code) => this.countries[code] ?? null;
    },

    getStates() {
      return this.countrySubdivisions?.us.states;
    },

    getStateProvinceList() {
      return {
        groups: [
          {
            label: 'United States',
            items: this.countrySubdivisions.us.states,
          },
          {
            label: 'United States Territories',
            items: this.countrySubdivisions.us.territories,
          },
          {
            label: 'Canadian Provinces',
            items: this.countrySubdivisions.ca.provinces,
          },
          {
            label: 'Other',
            items: this.countrySubdivisions.other,
          }
        ],
      };
    },

    getUnitedStateAndTerritories() {
      return {
        groups: [
          {
            label: 'United States',
            items: this.countrySubdivisions.us.states,
          },
          {
            label: 'United States Territories',
            items: this.countrySubdivisions.us.territories,
          }
        ],
      };
    },

    getCanadaProvinces() {
      return {
        groups: [
          {
            label: 'Canadian Provinces',
            items: this.countrySubdivisions.ca.provinces,
          }
        ],
      };
    },

    getState() {
      return (key) => this.countrySubdivisions?.us.states[key];
    },
    getTerritories() {
      return this.countrySubdivisions?.us.territories;
    },
    getProvinces() {
      return this.countrySubdivisions?.us.provinces;
    },

    /**
     * Checks if marketing optin is available
     */
    getHideMarketingOptin() {
      return this.partner?.settings?.hideMarketing;
    },

    /**
     * Get list of airlines
     *
     * @return {Object}
     */
    getAirlines() {
      return this.travelSuppliers.airlines;
    },

    /**
     * Get list of cruislines
     *
     * @return {Object}
     */
    getCruiselines() {
      return this.travelSuppliers.cruiselines;
    },

    /**
     * Get list of tour operators
     *
     * @return {Object}
     */
    getTourOperators() {
      return this.travelSuppliers.tourOperators;
    },

    /**
     * Get airline option group list for form display
     *
     * @returns {Object}
     */
    getAirlineOptions() {
      const list = {...this.travelSuppliers.airlines,};
      return this.sortList(list);
    },

    /**
     * Get cruiseline option group list for form display
     *
     * @returns {Object}
     */
    getCruiselineOptions() {
      const list = {...this.travelSuppliers.cruiselines,};
      return this.sortList(list);
    },

    /**
     * Get tour operator option group list for form display
     *
     * @returns {Object}
     */
    getTourOperatorOptions() {
      const list = {...this.travelSuppliers.tourOperators,};
      return this.sortList(list);
    },

    getSuffixTypes() {
      return this.suffixTypes;
    },
    getAirlineName() {
      // These 3 keys were sorted out of our property to bring them to the top, so we make sure we return the right value
      return (key) => {
        switch (key) {
          case "11478":
            return 'None';
          case "10001":
            return 'Not Listed';
          case "1236":
            return 'Unknown';
          default:
            return this.travelSuppliers.airlines[key];
        }
      };
    },
    getCruiseLineName() {
      return (key) => {
        switch (key) {
          case "11479":
            return 'None';
          case "10002":
            return 'Not Listed';
          case "10083":
            return 'Unknown';
          default:
            return this.travelSuppliers.cruiselines[key];
        }
      };
    },
    getTourOperatorName() {
      return (key) => {
        switch (key) {
          case "11480":
            return 'None';
          case "10003":
            return 'Not Listed';
          case "10085":
            return 'Unknown';
          default:
            return this.travelSuppliers.tourOperators[key];
        }
      };
    },
    getTrackingProvider() {
      return (provider) => this.trackingProviders?.[provider];
    },
    getRequestStatus() {
      return this.requestStatus;
    },
    getIsDataLoaded() {
      return this.isDataLoaded;
    },
  },

  actions: {
    setPreloadedData(preloadedData) {
      this.errors = preloadedData?.errors;
      this.travelSuppliers = preloadedData?.travelSuppliers;
      this.countries = preloadedData?.geography?.countries;
      this.countrySubdivisions = preloadedData?.geography?.countrySubdivisions;
      this.suffixTypes = preloadedData?.suffixTypes;
      this.trackingProviders = preloadedData?.trackingProviders;

      if (preloadedData.partner) {
        this.partner = preloadedData.partner;
      }
    },

    /**
     * Loads all preloaded data from modules api.
     *
     * @param {String} productCode
     * @param {String} legacyQuoteId
     * @param {String} orderId
     */
    async loadData(productCode) {
      let options = `?_pc=${productCode}`;
      // to test partner information locally
      if (isLocal) {
        const localRes = await import('src/store/local.json');
        options += `&_imtPetId=${localRes?._imtPetId}`;
        this.clickthroughArray = localRes?.clickthroughArray ?? []; // legacy
        this.selectedOptions = localRes?.selectedOptions ?? []; // legacy
        this.qid = localRes?.qid;
      }

      try {
        // set withCredentials to true to include all cookies from browser
        const response = await axios.get(API_ENDPOINTS.modules.purchase(options), { withCredentials: true, });
        if (response.data) {
          this.setPreloadedData(response.data);
          if (!isLocal) {
            this.qid = window.preloadedData?.qid;
            this.clickthroughArray = window.preloadedData?.clickthroughArray ?? []; // legacy
            this.selectedOptions = window.preloadedData?.selectedOptions ?? []; // legacy
          }
          this.setIsDataLoaded(true);
          this.setRequestStatus(HTTP_REQUEST_STATES.COMPLETE);
        }
      } catch (err) {
        this.setIsDataLoaded(false);
        this.setRequestStatus(HTTP_REQUEST_STATES.ERROR);
        console.error('Could not load preloaded data. ', err);
      }
    },

    /**
     * Sets qid in appDataStore (preloadedData)
     * @param {String} qid
     */
    setQuoteId(qid) {
      if (qid) {
        this.qid = qid;
      }

    },

    /**
     * Sets isDataLoaded for preloadedData
     * @param {boolean} isLoaded
     */
    setIsDataLoaded(isLoaded) {
      this.isDataLoaded = isLoaded;
    },

    /**
     * Set order status
     *
     * @param {String} status
     */
    setRequestStatus(status) {
      this.requestStatus = status;
    },

    /**
     * Helper method used to sort out our travel supplier
     * drop down lists, separating it out into groups
     *
     * @param {Object} list List of option key/values
     *
     * @return {Object} our groups of options
     */
    sortList(list) {
      let topItems = {};
      let otherItems = {};

      // Separate items into topItems and otherItems based on their values
      Object.keys(list).forEach(key => {
        if (['None', 'Not Listed', 'Unknown', 'Other'].includes(list[key])) {
          topItems[key] = list[key];
        } else {
          otherItems[key] = list[key];
        }
      });

      return {
        groups: [
          {
            label: '',
            items: topItems,
          },
          {
            label: '---',
            items: otherItems,
          }
        ],
      };
    },

  },
});
