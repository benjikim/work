import { defineStore } from 'pinia';
import {
  HTTP_REQUEST_STATES,
  API_ENDPOINTS,
  calculateAge,
  QUOTE_RESULT_API_SETTING,
  LOADER_KEYS,
} from '@/config';
import {
  Traveler,
  Location,
  TravelServices,
  QuoteResults,
  CMSPlan,
  CMSProvider,
  QuoteResult,
  PlanParamOption,
  ClickThroughValidationMap,
  Filters,
  CoverageLimit,
  EmailAQuote,
  Destination,
  FFValues,
  IncludedBenefits,
} from '@/types';
import axios, { AxiosError } from 'axios';
import { useUserSessionStore } from '@/store/userSession.ts';
import { useContentStore } from '@/store/content';
import { useThemeStore } from '@/store/theme';
import {
  displayDate,
  getCookie,
  determineTheme,
  retrieveLoaderData,
  isInternal,
  determineMode,
  getAgentEmailFromQuoteResultsContainer,
  handleWordpressContentError,
} from '@/utility';
import * as configcat from 'configcat-js';

interface State {
  quote: {
    dataLoaded: boolean;
    id: string | null;
    details: {
      requestStatus: HTTP_REQUEST_STATES;
      metadata: Record<string, string | null | boolean>;
      travelers: Traveler[];
      trip: {
        destinations: Location[];
        travelServices: TravelServices[];
        departureDate: string | null;
        returnDate: string | null;
        initialTripPaymentDate: string | null;
        finalTripPaymentDate: string | null;
      };
    };
    results: QuoteResults;
    filters: Filters;
  };
  soventure: {
    adventureSportsPlanCodes: Set<string>;
  };
  cms: {
    providers: CMSProvider[];
    plans: CMSPlan[];
  };
  displayLoader: boolean;
  order: {
    id: string | null;
    token: string | null;
    productId: string | null;
  };
  destinationList: Destination[];
  hideMarketing: boolean;
  featureFlags: FFValues;
  coveredActivitiesMap: Record<string, number>;
  silentQuote: boolean;
  quoteReferenceCode: string | null;
  plansFullyLoaded: boolean;
}

export const useApiStore = defineStore('api-store', {
  state: (): State => ({
    quote: {
      dataLoaded: false,
      id: null,
      details: {
        requestStatus: HTTP_REQUEST_STATES.NOT_STARTED,
        metadata: {
          partners_api_id: null,
        },
        travelers: [],
        trip: {
          destinations: [
            {
              country: null,
              stateProvince: null,
            },
          ],
          travelServices: [],
          departureDate: null,
          returnDate: null,
          initialTripPaymentDate: null,
          finalTripPaymentDate: null,
        },
      },
      results: {
        requestStatus: HTTP_REQUEST_STATES.NOT_STARTED,
        metadata: {},
        products: [],
      },
      filters: {},
    },
    soventure: {
      adventureSportsPlanCodes: new Set(),
    },
    cms: {
      providers: [],
      plans: [],
    },
    displayLoader: false,
    order: {
      id: null,
      token: null,
      productId: null,
    },
    destinationList: [],
    hideMarketing: false,
    featureFlags: {},
    coveredActivitiesMap: {
      'mountain climbing with use of equipment': 0,
      skydiving: 1,
      surfing: 2,
      'mountain biking': 3,
      hiking: 4,
      'white or black water rafting (grades 1-3)': 5,
      paragliding: 6,
      snorkeling: 7,
      'scuba diving': 7,
      'downhill skiing': 8,
      'cross country skiing': 8,
      snowboarding: 8,
      ziplining: 9,
      abseiling: 10,
      backpacking: 11,
      'base jumping': 12,
      bmx: 13,
      bobsledding: 14,
      boating: 15,
      'bungee jumping': 16,
      camping: 17,
      canoeing: 18,
      canyoning: 19,
      caving: 20,
      'cliff diving': 21,
      'diving below 10m': 22,
      fishing: 23,
      freefalling: 24,
      'hang gliding': 25,
      'hot air ballooning': 26,
      'ice skating': 27,
      'jungle zip lining': 28,
      kayaking: 29,
      'kite surfing': 30,
      'mountaineering below 7,000ft': 31,
      paddleboarding: 32,
      parachuting: 33,
      parasailing: 34,
      parascending: 35,
      powerlifting: 36,
      rappelling: 37,
      'river tubing': 38,
      'rock climbing': 39,
      safari: 40,
      sailing: 41,
      sandboarding: 42,
      'sledding or tobogganing': 43,
      snowmobiling: 44,
      snowtubing: 45,
      spelunking: 46,
      swimming: 47,
      'water skiing': 48,
      windsurfing: 49,
      'free climbing with use of equipment': 50,
    },
    silentQuote: false,
    quoteReferenceCode: null,
    plansFullyLoaded: false,
  }),
  getters: {
    /**
     * Get Quote Id
     *
     * @returns {State['quote']['id']}
     */
    getQuoteId(): State['quote']['id'] {
      return this.quote.id;
    },
    /**
     * Get Quote Details
     *
     * @returns {State['quote']['details']}
     */
    getQuoteDetails(): State['quote']['details'] {
      return this.quote.details;
    },
    /**
     * Returns our Travel Destination country code
     *
     * @returns {string | null}
     */
    getTravelDestinationCode(): string | null {
      if (
        this.quote.details.trip.destinations[0].country &&
        this.destinationList.length > 0
      ) {
        return this.quote.details.trip.destinations[0].country;
      }
      return null;
    },
    /**
     * Display travel destination
     *
     * @returns {string | null}
     */
    getTravelDestination(): string | null {
      if (
        this.quote.details.trip.destinations[0].country &&
        this.destinationList.length > 0
      ) {
        const countryCode = this.quote.details.trip.destinations[0].country;
        const countryFromList = this.getDestinationNameFromList(countryCode);

        if (countryFromList) return countryFromList;
      }
      return null;
    },
    /**
     * Retrieve Destination Name from GeographyData's Destination List
     *
     * @returns {Destination['value] | undefined}
     */
    getDestinationNameFromList(): (
      code: string
    ) => Destination['value'] | undefined {
      return (code: string) => {
        const result = this.destinationList.find(
          (destination: Destination) => destination?.code === code
        );

        return result ? result.value : undefined;
      };
    },
    /**
     * Display travel dates from quote details
     *
     * @returns {string | void}
     */
    getTravelDates(): string | void {
      if (
        this.quote.details.trip.departureDate &&
        this.quote.details.trip.returnDate
      ) {
        return `${displayDate(this.quote.details.trip.departureDate)} - ${displayDate(this.quote.details.trip.returnDate)}`;
      }
    },
    /**
     * Get our quote's departure date
     *
     * @returns {string | void}
     */
    getDepartureDate(): string | void {
      if (this.quote.details.trip.departureDate) {
        return this.quote.details.trip.departureDate;
      }
    },
    /**
     * Get our quote's return date
     *
     * @returns {string | void}
     */
    getReturnDate(): string | void {
      if (this.quote.details.trip.returnDate) {
        return this.quote.details.trip.returnDate;
      }
    },
    /**
     * Display traveler ages from quote details
     *
     * @returns {string | void}
     */
    getTravelerAges(): string | void {
      if (this.quote.details.travelers) {
        const ages = this.quote.details.travelers.map((traveler: Traveler) =>
          calculateAge(traveler.dateOfBirth)
        );
        return ages.join(', ');
      }
    },
    /**
     * Returns the highest age in our list of travelers
     *
     * @returns {number}
     */
    getHighestTravelerAge(): number {
      if (this.quote.details.travelers) {
        const ages = this.quote.details.travelers.map((traveler: Traveler) =>
          calculateAge(traveler.dateOfBirth)
        );
        return Math.max(...ages);
      }
      return 0;
    },
    /**
     * Display trip cost and ITP from quote details
     *
     * @returns {string | void}
     */
    getTripCostAndITP(): string | void {
      if (
        this.quote.details.travelers &&
        this.quote.details.trip.initialTripPaymentDate
      ) {
        return `$${this.quote.details.travelers[0].tripCost} on ${displayDate(this.quote.details.trip.initialTripPaymentDate)}`;
      }
    },
    /**
     * Gets our trip cost from our quote details
     * @returns {number | null}
     */
    getTripCost(): number {
      const travelers = this.quote?.details?.travelers;

      // Ensure travelers is an array and has at least one item
      if (Array.isArray(travelers) && travelers.length > 0) {
        return travelers[0]?.tripCost ?? 0;
      } else {
        return 0;
      }
    },
    /**
     * Gets our ITP from our quote details
     * @returns {string | null}
     */
    getITP(): string | null {
      return this.quote.details.trip.initialTripPaymentDate;
    },
    /**
     * Gets our primary traveler's residence
     */
    getResidence(): any {
      if (this.quote.details.travelers[0]?.residence) {
        return this.quote.details.travelers[0].residence;
      }
    },
    /**
     * Get Quote Results
     *
     * @returns {State['quote']['results']}
     */
    getQuoteResults(): State['quote']['results'] {
      return this.quote.results;
    },
    /**
     * Get Plan by Plan Code
     *
     * @returns {QuoteResult}
     */
    getPlanByPlanCode(): (planCode: string) => QuoteResult | undefined {
      return (planCode: string) =>
        this.quote.results.products.find((plan) => plan.code === planCode);
    },
    /**
     * Get Product Content
     *
     * @param {string} planCode
     * @return {CMSPlan|undefined}
     */
    getPlanContent(): (planCode: string) => CMSPlan | undefined {
      return (planCode: string) =>
        this.cms.plans.find((plan) => plan.productCode === planCode);
    },
    /**
     * Returns status of displayLoader.
     *
     * @returns {Boolean}
     */
    getLoaderState(): State['displayLoader'] {
      return this.displayLoader;
    },
    /**
     * Gets the status of data loaded state.
     *
     * @returns {Boolean} State['quote']['dataLoaded']
     */
    getDataLoadedState(): State['quote']['dataLoaded'] {
      return this.quote.dataLoaded;
    },
    /* Gets our current order id
     *
     * @returns {State['order']['id']}
     */
    getOrderId(): State['order']['id'] {
      return this.order.id;
    },
    /**
     * Gets our current order token associated with our order id
     *
     * @returns {State['order']['token']}
     */
    getOrderToken(): State['order']['token'] {
      return this.order.token;
    },
    /**
     * Gets the quote's filter
     *
     * @returns {State['quote']['filters']}
     */
    getFilters(): State['quote']['filters'] {
      return this.quote.filters;
    },
    /**
     * Get Available plans
     *
     * @returns {State['quote']['results']['products']}
     */
    getAvailablePlans(): State['quote']['results']['products'] {
      return this.quote.results.products?.filter(
        (plan) => plan.available === true
      );
    },
    /**
     * Get PNSd plans
     *
     * @returns {State['quote']['results']['products']}
     */
    getPNSPlans(): State['quote']['results']['products'] {
      return this.quote.results?.products?.filter(
        (plan) => plan.available === false
      );
    },
    /**
     * Check if we should hide marketing checkbox for emails
     *
     * @returns {State['hideMarketing']}
     */
    isMarketingHidden(): State['hideMarketing'] {
      return this.hideMarketing;
    },
    /**
     * Gets the quote result status.
     *
     * @returns {State['quote']['results']['requestStatus']}
     */
    getQuoteResultsRequestStatus(): State['quote']['results']['requestStatus'] {
      return this.quote.results.requestStatus;
    },
    /**
     * Gets the quote result status.
     *
     * @returns {State['quote']['results']['requestStatus']}
     */
    getQuoteDetailsRequestStatus(): State['quote']['details']['requestStatus'] {
      return this.quote.details.requestStatus;
    },
    /**
     * Gets partner ID
     *
     * @returns {State['quote']['details']['metadata']['partners_api_id']}
     */
    getPartnerId(): State['quote']['details']['metadata']['partners_api_id'] {
      return this.quote.details.metadata.partners_api_id;
    },
    /**
     * Gets the FF value of a string
     * @param key string
     * @returns boolean|string|number
     */
    getFFValue(): (key: string) => boolean | string | number | undefined {
      return (key: string) => this.featureFlags[key];
    },
    /**
     * Gets the reference code.
     * @returns string | null
     */
    getQuoteReferenceCode(): State['quoteReferenceCode'] {
      return this.quoteReferenceCode;
    },
    /**
     * Gets the status if the plan is fully loaded.
     * @returns boolean | null
     */
    getPlansFullyLoadedStatus(): State['plansFullyLoaded'] {
      return this.plansFullyLoaded;
    },
    /**
     * Gets the agent email from the quote details metadata
     * @returns string | null
     */
    isAgentEmailSet(): boolean {
      return this.quote.details.metadata.agentEmail !== null;
    },
    /**
     * Checks if the traveler cover trip cost is set
     *
     * @returns Boolean
     */
    isCoverTripCost(): boolean {
      return Boolean(this.quote.details.metadata.coverTripCost);
    },
  },
  actions: {
    /**
     * initializer for the API Store
     *
     * @returns {void}
     */
    async init(): Promise<void> {
      const urlParams = new URLSearchParams(window.location.search);
      const quoteId = urlParams.get('_qid');
      const sessionStore = useUserSessionStore();
      determineMode();

      try {
        // This gets called in multiple places (results/compare)
        // So we want to reset the data whenever it gets called.
        await this.retrieveFFValues();
        this.resetQuoteResultsData();
        await retrieveLoaderData([LOADER_KEYS.QR_INIT]);
        sessionStore.setLoaderKey(LOADER_KEYS.QR_INIT);
        await determineTheme();

        if (quoteId) {
          console.info('Setting quote ID from query params: ', quoteId);
          this.setQuoteId(quoteId);
          await Promise.all([
            this.fetchQuoteDetails(),
            this.fetchProviderContent(),
            this.fetchModuleData(),
          ]);
          const data = await this.fetchQuoteResults();
          // Making a deep copy because changes made in session store
          // are changing quote.results.products data directly.
          if (data !== false && 'products' in data) {
            sessionStore.setPlans(JSON.parse(JSON.stringify(data.products)));
            sessionStore.invokeFilterOptionUpdates();
          }
        } else {
          sessionStore.setErrorModalState('noQuoteId');
        }
      } catch (error) {
        console.error('Failed to initialize API store: ', error);
        sessionStore.setErrorModalState('httpServerError');
        this.setLoaderState(false);
      } finally {
        const localJsonStorage = await import('@/store/local.json');
        this.setCMSPlans(localJsonStorage?.plans);
        retrieveLoaderData([LOADER_KEYS.QR_UPDATE, LOADER_KEYS.QR_TO_BUY]);
      }
    },

    async retrieveFFValues(): Promise<void> {
      const themeStore = useThemeStore();

      let sessionId = getCookie('PHPSESSID');
      if (!sessionId) {
        sessionId =
          localStorage.getItem('ab_session_id') ?? crypto.randomUUID();
        localStorage.setItem('ab_session_id', sessionId);
      }
      const user: configcat.User = {
        identifier: sessionId,
        custom: { domain: window.location.hostname },
      };

      const flags: {
        key: string;
        defaultValue: string | boolean | number;
        user?: configcat.User;
      }[] = [
        { key: 'cms_20250303_soventure_theme_us_release', defaultValue: false },
        {
          key: 'cms_20250314_soventure_plans_to_quote_us_release',
          defaultValue: '',
        },
        { key: 'cms_20250325_soventure_plans_hide_plan_tag', defaultValue: '' },
        {
          key: 'cms_20250522_soventure_covered_activities',
          defaultValue: false,
        },
        { key: 'cms_20250609_soventure_share_results', defaultValue: false },
        {
          key: 'crm_20250806_enable_imt_wordpress_content',
          defaultValue: false,
        },
        {
          key: 'sb_20250805_insuremytrip_luxury_plan_codes_us_release',
          defaultValue: '',
        },
        {
          key: 'sb_20250805_insuremytrip_enable_luxury_ab_test_us_release',
          defaultValue: false,
        },
        {
          key: 'sb_20250808_insuremytrip_luxury_banner_text_us_release',
          defaultValue: '',
        },
        {
          key: 'sb_20250826_insuremytrip_epic_luxury_banner_text_us_release',
          defaultValue: '',
        },
        {
          key: 'cms_20250812_imt_edu_plans_to_quote_us_release',
          defaultValue: '',
        },
        {
          key: 'cms_20250915_plans_without_trip_cost_us_release',
          defaultValue: '',
        },
        { key: 'sb_20250818_annual_plans_release_us', defaultValue: '' },
        { key: 'web_20251113_qr_number_of_compare', defaultValue: 3 },
        {
          key: 'website_20260121_enable_new_plan_row_details_us_release',
          defaultValue: false,
        },
        {
          key: 'imt_20260121_pbm_clickthrough_buy_modal',
          defaultValue: false,
        },
      ];

      if (themeStore.isThemeIMT && !isInternal()) {
        flags.push({
          key: 'sb_20250805_insuremytrip_luxury_plans_ab_test_us_release',
          defaultValue: false,
          user,
        });
      }
      if (!themeStore.isModeAnnual) {
        flags.push({
          key: 'cms_20250618_insuremytrip_plans_to_exclude_quote_results_us_release',
          defaultValue: '',
        });
      }

      try {
        const configCatClient = configcat.getClient(
          import.meta.env.VITE_CONFIG_CAT_SDK_KEY
        );

        const entries = await Promise.all(
          flags.map(async ({ key, defaultValue, user }) => {
            const value = await configCatClient.getValueAsync(
              key,
              defaultValue,
              user
            );
            return [key, value] as const;
          })
        );

        this.setFFValues(Object.fromEntries(entries));
      } catch (err) {
        console.error('Error retrieving feature flags:', err);

        // Build defaults from the flags array and set them so callers have safe values
        const defaults = Object.fromEntries(
          flags.map(({ key, defaultValue }) => [key, defaultValue])
        );
        this.setFFValues(defaults);
      }
    },

    setFFValues(val: FFValues) {
      this.featureFlags = val;
    },
    async updatePlans(): Promise<void> {
      const sessionStore = useUserSessionStore();
      const plansToRequote = sessionStore.getPlansToRequote;

      try {
        await this.fetchQuoteDetails();

        if (plansToRequote.length > 0) {
          await this.fetchSpecificPlans();
        } else {
          this.resetFilterData();
          this.resetQuoteResultsData();
          const data = await this.fetchQuoteResults();
          if (data && 'products' in data) {
            sessionStore.setPlans(JSON.parse(JSON.stringify(data.products)));
            sessionStore.invokeFilterOptionUpdates();
          } else {
            // If fetchQuoteResults returned false or unexpected data
            sessionStore.setErrorModalState('httpServerError');
          }
        }
      } catch (err) {
        console.error('Error updating plans: ', err);
        sessionStore.setErrorModalState('httpServerError');
        this.setLoaderState(false);
      }
    },
    setCMSProvider(providers: CMSProvider[]) {
      this.cms.providers = providers;
    },
    setCMSPlans(plans: CMSPlan[]) {
      this.cms.plans = plans;
    },
    /**
     * Set the quote ID
     *
     * @param {string} id
     * @returns {void}
     */
    setQuoteId(id: string): void {
      this.quote.id = id;
      // Whenever we set Quote Id in the store, let's make sure localStorage has it too
      localStorage.setItem('_imtActiveQuoteId', id);
    },
    setProductId(id: string): void {
      this.order.productId = id;
    },
    /**
     * Set the Trip Cost for our current quote
     * @param {number} cost
     * @returns {void}
     */
    setTripCost(cost: number): void {
      this.quote.details.travelers[0].tripCost = cost;
    },
    /**
     * Set the cover trip cost metadata for our current quote
     * @returns {void}
     */
    setCoverTripCostMetadata(): void {
      this.quote.details.metadata.coverTripCost = true;
    },
    /**
     * Sets our ITP for our current quote
     * @param {string} date
     * @returns {void}
     */
    setITP(date: string): void {
      this.quote.details.trip.initialTripPaymentDate = date;
    },
    async createQuote(redirectToIMT: boolean = false): Promise<void | string> {
      let res;

      // Set request state
      this.quote.details.requestStatus = HTTP_REQUEST_STATES.PENDING;
      this.setLoaderState(true);

      const sessionStore = useUserSessionStore();
      const themeStore = useThemeStore();

      const tripDetails: any = {};
      tripDetails.destinations = this.quote.details.trip.destinations;
      tripDetails.travelServices = this.quote.details.trip.travelServices;
      tripDetails.departureDate = this.quote.details.trip.departureDate;
      tripDetails.returnDate = this.quote.details.trip.returnDate;
      tripDetails.finalTripPaymentDate =
        this.quote.details.trip.finalTripPaymentDate;
      if (this.quote.details.trip.initialTripPaymentDate !== null) {
        tripDetails.initialTripPaymentDate =
          this.quote.details.trip.initialTripPaymentDate;
      }

      const currentMetadata = this.quote.details.metadata;
      const agentEmail = getAgentEmailFromQuoteResultsContainer();
      if (agentEmail) {
        currentMetadata.agentEmail = agentEmail;
      }

      let metadataForSoventure = currentMetadata;

      if (redirectToIMT) {
        // To avoid updating the API, let's just requote but pop off the impactClickId
        if ('impactClickId' in metadataForSoventure) {
          delete metadataForSoventure['impactClickId'];
        }

        if ('travelerHasLeftOnTrip' in metadataForSoventure) {
          delete metadataForSoventure['travelerHasLeftOnTrip'];
        }
      }

      // set up quote details
      const currentDetails = {
        metadata:
          themeStore.isThemeSoventure && redirectToIMT
            ? metadataForSoventure
            : currentMetadata,
        travelers: this.quote.details.travelers,
        trip: tripDetails,
        planParameters: sessionStore.getPlanParameters,
        site:
          themeStore.isThemeIMT || redirectToIMT
            ? 'insuremytrip'
            : 'soventure',
        originatingSource: '',
      };

      if (themeStore.isModeAnnual || themeStore.isModeEdu) {
        currentDetails.originatingSource = themeStore.getCurrentThemeMode;
      }

      try {
        res = await axios.post(
          API_ENDPOINTS.quote.createQuote(),
          currentDetails,
          {
            withCredentials: true,
          }
        );

        if (redirectToIMT) {
          return res.data.id;
        }

        this.setQuoteId(res.data.id);

        console.info('Quote successfully created. ID: ', res.data.id);

        // Create a new URL object based on the current window URL
        const currentUrl = new URL(window.location.href);

        // Update or add the query parameter
        currentUrl.searchParams.set('_qid', res.data.id);

        // Update the browser's URL without refreshing the page
        history.pushState(null, '', currentUrl.toString());

        await this.updatePlans();
      } catch (err) {
        const axiosError = err as AxiosError;

        this.quote.details.requestStatus = HTTP_REQUEST_STATES.ERROR;
        this.quote.dataLoaded = false;
        this.setLoaderState(false);
        console.error('An error occurred while creating a quote: ', err);

        if (axiosError?.response?.status) {
          switch (axiosError.response.status) {
            case 400:
            case 404:
              sessionStore.setErrorModalState('noQuoteId');
              break;
            default:
              sessionStore.setErrorModalState('httpServerError');
              break;
          }
        } else {
          sessionStore.setErrorModalState('httpServerError');
        }
      }
    },
    /**
     * Fetch quote details from remote API
     *
     * @return {Object|Boolean}
     */
    async fetchQuoteDetails(): Promise<boolean> {
      const sessionStore = useUserSessionStore();
      let res;
      this.quote.dataLoaded = false;
      if (!this.quote.id) {
        console.error('Could not call for quote. No quote ID available');
        this.quote.details.requestStatus = HTTP_REQUEST_STATES.ERROR;
        sessionStore.setErrorModalState('noQuoteId');
        return false;
      }

      // Set request state
      this.quote.details.requestStatus = HTTP_REQUEST_STATES.PENDING;
      this.setLoaderState(true);

      try {
        console.info(`Fetching quote by id ${this.quote.id}...`);
        res = await axios.get(API_ENDPOINTS.quote.getQuote(this.quote.id), {
          withCredentials: true,
        });

        // Set raw quote details in api store
        this.setQuoteDetails(res.data);

        this.quote.details.requestStatus = HTTP_REQUEST_STATES.COMPLETE;
        console.info('Quote details loaded.');
        return true;
      } catch (err) {
        const axiosError = err as AxiosError;

        this.quote.details.requestStatus = HTTP_REQUEST_STATES.ERROR;
        this.quote.dataLoaded = false;
        this.setLoaderState(false);
        console.error(err);

        if (axiosError?.response?.status) {
          switch (axiosError.response.status) {
            case 400:
            case 404:
              sessionStore.setErrorModalState('noQuoteId');
              return false;
            default:
              sessionStore.setErrorModalState('httpServerError');
              return false;
          }
        } else {
          sessionStore.setErrorModalState('httpServerError');
          return false;
        }
      }
    },
    /**
     * Set quote details
     *
     * @param {Object} data Quote details response data
     */
    setQuoteDetails(data: State['quote']['details']) {
      this.quote.details = data;
    },
    /**
     * Fetch quote results from remote API
     *
     * @return {Object|Boolean}
     */
    async fetchQuoteResults() {
      const sessionStore = useUserSessionStore();
      const themeStore = useThemeStore();
      let res;

      if (!this.quote.id) {
        console.error(
          'Could not call for quote results. No quote ID available'
        );
        this.quote.results.requestStatus = HTTP_REQUEST_STATES.NOT_STARTED;

        this.setLoaderState(false);
        sessionStore.setErrorModalState('noQuoteId');

        return false;
      }

      // Set request state
      this.quote.results.requestStatus = HTTP_REQUEST_STATES.PENDING;

      try {
        console.info(`Fetching quote results by id ${this.quote.id}...`);

        const soventurePlanCodes = this.getFFValue(
          'cms_20250314_soventure_plans_to_quote_us_release'
        );

        const eduPlanCodes = this.getFFValue(
          'cms_20250812_imt_edu_plans_to_quote_us_release'
        );

        this.setPlansFullyLoadedStatus(false);
        if (
          themeStore.isThemeSoventure &&
          soventurePlanCodes !== '' &&
          typeof soventurePlanCodes === 'string'
        ) {
          res = await axios.get(
            API_ENDPOINTS.quote.getResultsForSpecificPlans(
              this.quote.id,
              soventurePlanCodes.replace(/\s+/g, '')
            ),
            {
              data: {},
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          this.setPlansFullyLoadedStatus(true);
        } else if (
          themeStore.isModeEdu &&
          eduPlanCodes !== '' &&
          typeof eduPlanCodes === 'string'
        ) {
          res = await axios.get(
            API_ENDPOINTS.quote.getResultsForSpecificPlans(
              this.quote.id,
              eduPlanCodes.replace(/\s+/g, '')
            ),
            {
              data: {},
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        } else {
          if (sessionStore.isMobileView) {
            res = await axios.get(
              API_ENDPOINTS.quote.getResultsByOffsetAndLength(
                this.quote.id,
                QUOTE_RESULT_API_SETTING.INITIAL_STARTING_OFFSET,
                QUOTE_RESULT_API_SETTING.INITIAL_RESULTS_COUNT
              ),
              {
                data: {},
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            this.getResultsAfterInitialResults();
          } else {
            res = await axios.get(
              API_ENDPOINTS.quote.getResults(this.quote.id),
              {
                data: {},
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
          }
        }

        const insuremytripPlanCodesToExclude = this.getFFValue(
          'cms_20250618_insuremytrip_plans_to_exclude_quote_results_us_release'
        );
        const soventureHiddenPlanTagPlans = this.getFFValue(
          'cms_20250325_soventure_plans_hide_plan_tag'
        );

        if (
          soventurePlanCodes !== '' &&
          typeof soventurePlanCodes === 'string'
        ) {
          sessionStore.setPlanCodesForSoVenture(soventurePlanCodes.split(','));
        }

        if (
          soventureHiddenPlanTagPlans !== '' &&
          typeof soventureHiddenPlanTagPlans === 'string'
        ) {
          sessionStore.setSoventureHiddenPlanTagPlans(
            soventureHiddenPlanTagPlans.split(',')
          );
        }

        if (
          themeStore.isThemeSoventure &&
          sessionStore.getSoventurePlanCodes.length > 0
        ) {
          let currProducts = res.data.products;

          if (
            'travelerHasLeftOnTrip' in this.quote.details.metadata &&
            this.quote.details.metadata.travelerHasLeftOnTrip
          ) {
            currProducts = currProducts.filter(
              (plan: { type: string }) => plan.type !== 'Comprehensive'
            );
          }

          res.data.products = currProducts.filter((plan: { code: string }) =>
            sessionStore.getSoventurePlanCodes.includes(plan.code)
          );
        } else {
          if (
            insuremytripPlanCodesToExclude !== '' &&
            typeof insuremytripPlanCodesToExclude === 'string'
          ) {
            const planCodesArr = insuremytripPlanCodesToExclude.split(',');
            res.data.products = res.data.products.filter(
              (plan: { code: string }) => !planCodesArr.includes(plan.code)
            );
          }
        }

        // Set raw quote details in api store
        this.setQuoteResults(res.data);

        // Set CMS providers

        if (themeStore.isThemeSoventure) {
          this.setSoventureFilterResults();
        } else if (!sessionStore.isMobileView || themeStore.isModeEdu) {
          this.setFilterResults();
        }

        this.quote.results.requestStatus = HTTP_REQUEST_STATES.COMPLETE;
        this.setLoaderState(false);
        this.quote.dataLoaded = true;
        console.info('Quote results loaded.');

        return res.data;
      } catch (err) {
        const axiosError = err as AxiosError;

        this.quote.results.requestStatus = HTTP_REQUEST_STATES.ERROR;
        this.quote.dataLoaded = false;
        this.setLoaderState(false);
        console.error(err);

        if (axiosError?.response?.status) {
          switch (axiosError.response.status) {
            case 400:
            case 404:
              sessionStore.setErrorModalState('noQuoteId');
              return false;

            default:
              // Show global modal error
              sessionStore.setErrorModalState('httpServerError');
              return false;
          }
        } else {
          // Show global modal error
          sessionStore.setErrorModalState('httpServerError');
          return false;
        }
      }
    },
    async fetchModuleData() {
      const sessionStore = useUserSessionStore();
      try {
        console.info(`Fetching destination list...`);

        const partnerId = this.quote.details.metadata.partners_api_id;
        const queryParams: { _imtPetId?: string } = {};

        if (typeof partnerId === 'string' && partnerId.trim() !== '') {
          queryParams._imtPetId = partnerId;
        }

        const response = await axios.get(
          API_ENDPOINTS.modules.getQuoteResults(),
          { params: queryParams }
        );

        if (response.data?.geographyData.destinations) {
          this.destinationList = response.data?.geographyData.destinations;
        }

        if (response.data?.partnerSettings?.hideMarketing) {
          this.hideMarketing = true;
        }
      } catch (err) {
        console.error(err);
        sessionStore.setErrorModalState('httpServerError');
      }
    },
    async fetchSpecificPlans(): Promise<void> {
      let res;
      const sessionStore = useUserSessionStore();
      const plansToRequote = sessionStore.getPlansToRequote;

      if (!this.quote.id) {
        console.error(
          'Could not call for quote results. No quote ID available'
        );
        this.quote.results.requestStatus = HTTP_REQUEST_STATES.NOT_STARTED;

        return;
      }

      // Set request state
      this.quote.results.requestStatus = HTTP_REQUEST_STATES.PENDING;

      try {
        console.info(`Fetching quote results by id ${this.quote.id}...`);
        res = await axios.get(
          API_ENDPOINTS.quote.getResultsForSpecificPlans(
            this.quote.id,
            plansToRequote.join()
          ),
          {
            data: {},
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        for (const currProduct of res.data.products) {
          const productIndex = this.quote.results.products.findIndex(
            (product) => product.code === currProduct.code
          );
          this.quote.results.products[productIndex] = currProduct;
        }

        sessionStore.setPlans(res.data.products);

        this.quote.results.requestStatus = HTTP_REQUEST_STATES.COMPLETE;
        this.setLoaderState(false);
        this.quote.dataLoaded = true;
        console.info('Quote results specific plans loaded.');
        sessionStore.clearPlansToRequote();
        return res.data;
      } catch (err) {
        this.quote.results.requestStatus = HTTP_REQUEST_STATES.ERROR;
        this.quote.dataLoaded = false;
        this.setLoaderState(false);
        console.error('Error fetching specific plans: ', err);
        sessionStore.setErrorModalState('httpServerError');
      }
    },
    filterResults(filters: any, plans: any, providers: any) {
      const contentStore = useContentStore();
      Object.keys(filters).forEach((key) => {
        filters[key] = new Set();
      });
      plans.forEach((plan: any) => {
        // Loop through coverages once instead of multiple findIndex calls
        plan.coverages.forEach((coverage: any) => {
          switch (coverage.id) {
            case 'tripCancellation':
              if (coverage.limits?.some((ele: any) => ele.valuePerTrip > 0)) {
                filters['tripCancellation-0'].add(plan.code);
              }
              break;

            case 'tripInterruption':
              if (coverage.limits?.[0]?.valueType === 'percentage') {
                const tripInterruptionPercent = Number(
                  coverage.limits?.[0]?.coverageValue
                );

                if (tripInterruptionPercent === 100) {
                  filters['tripInterruption-0'].add(plan.code);
                } else if (tripInterruptionPercent === 125) {
                  filters['tripInterruption-1'].add(plan.code);
                } else if (tripInterruptionPercent === 150) {
                  filters['tripInterruption-2'].add(plan.code);
                } else if (tripInterruptionPercent === 200) {
                  filters['tripInterruption-3'].add(plan.code);
                }
              }
              break;

            case 'preExWaiver':
              if (
                coverage.limits?.some(
                  (ele: any) => Number(ele.coverageValue) > 0
                )
              ) {
                filters['preExWaiver-0'].add(plan.code);
              }
              break;

            case 'baggageDelay':
              if (
                coverage.limits?.some(
                  (ele: any) => Number(ele.coverageValue) > 0
                )
              ) {
                filters['baggageDelay-0'].add(plan.code);
              }
              break;

            case 'baggage':
              if (coverage.limits?.[0]?.valueType === 'limit') {
                const baggageLossLimit = Number(
                  coverage.limits?.[0]?.coverageValue
                );

                if (baggageLossLimit <= 750) {
                  filters['baggage-0'].add(plan.code);
                } else if (baggageLossLimit === 1000) {
                  filters['baggage-1'].add(plan.code);
                } else if (
                  baggageLossLimit >= 1500 &&
                  baggageLossLimit <= 2000
                ) {
                  filters['baggage-2'].add(plan.code);
                } else if (baggageLossLimit >= 2500) {
                  filters['baggage-3'].add(plan.code);
                }
              }
              break;

            case 'travelDelay':
              if (
                coverage.limits?.some(
                  (ele: any) => Number(ele.coverageValue) > 0
                )
              ) {
                filters['travelDelay-0'].add(plan.code);
              }
              break;
            case 'cancelForAnyReasonOption':
              if (coverage.limits && coverage.limits.length > 0) {
                filters['cancelForAnyReasonOption-0'].add(plan.code);
              }
              break;

            case 'rentalCar':
              if (coverage.limits && coverage.limits?.length > 0) {
                filters['otherCoverages-0'].add(plan.code);
              }
              break;

            case 'vacationRentalDamage':
              if (coverage.limits && coverage.limits?.length > 0) {
                filters['otherCoverages-1'].add(plan.code);
              }
              break;

            case 'medical':
              const hasMedicalOption = plan?.options.find(
                (option: any) => option.id === 'medical' && option.selected
              );

              const medicalValue = hasMedicalOption
                ? Number(hasMedicalOption.value)
                : Number(coverage.details[0]?.value.replace(/[$,]/g, ''));

              if (medicalValue <= 50000) {
                filters['medical-1'].add(plan.code);
              }

              if (medicalValue >= 50000) {
                filters['medical-2'].add(plan.code);
              }

              if (medicalValue >= 100000) {
                filters['medical-3'].add(plan.code);
              }

              if (medicalValue >= 250000) {
                filters['medical-4'].add(plan.code);
              }

              if (!coverage.secondary) {
                filters['medical-primary'].add(plan.code);
              }

              break;

            case 'emergencyMedicalEvacuation':
              const isUnlimited = coverage.details[0]?.value === 'Unlimited';

              if (isUnlimited) {
                filters['emergencyMedicalEvacuation-5'].add(plan.code);
              } else {
                const medicalValue = Number(
                  coverage.details[0]?.value.replace(/[^0-9]/g, '')
                );

                if (medicalValue <= 150000) {
                  filters['emergencyMedicalEvacuation-1'].add(plan.code);
                } else if (medicalValue === 250000) {
                  filters['emergencyMedicalEvacuation-2'].add(plan.code);
                } else if (medicalValue === 500000) {
                  filters['emergencyMedicalEvacuation-3'].add(plan.code);
                } else if (medicalValue === 1000000) {
                  filters['emergencyMedicalEvacuation-4'].add(plan.code);
                }
              }

              if (!coverage.secondary) {
                filters['emergencyMedicalEvacuation-primary'].add(plan.code);
              }

              break;
            case 'accidentalDeath24Hour':
            case 'accidentalDeathCommonCarrier':
            case 'accidentalDeathFlight':
              if (coverage.limits && coverage.limits?.length > 0) {
                filters['accidentalDeath24Hour-0'].add(plan.code);
              }
              break;
          }
        });

        // Setting for all amounts
        filters['medical-0'].add(plan.code);
        filters['emergencyMedicalEvacuation-0'].add(plan.code);
        if (contentStore.getPlanTypeByKey(plan.code) == 'Cruise') {
          // add plan type conditional
          filters['otherCoverages-2'].add(plan.code);
        }

        // Handle provider filters outside the coverage loop since it's not coverage-related
        const providerIndex = providers.findIndex(
          (provider: any) => plan.provider.code === provider.code
        );
        if (providerIndex !== -1) {
          filters[`provider-${providerIndex}`].add(plan.code);
        }
      });
      return filters;
    },
    /**
     * @TODO let's define the expected Responses
     */
    setQuoteResults(data: QuoteResults) {
      this.quote.results = data;
    },
    /**
     * This method sets the filter results for multiple filters.
     */
    async setFilterResults() {
      const themeStore = useThemeStore();
      this.initFilters();

      const plans = JSON.parse(JSON.stringify(this.getAvailablePlans));
      const initFilters = JSON.parse(JSON.stringify(this.getFilters));
      const providers = JSON.parse(JSON.stringify(this.cms.providers));

      this.setFilterData(this.filterResults(initFilters, plans, providers));

      const sessionStore = useUserSessionStore();
      if (sessionStore.getSelectedFilters.length === 0) {
        sessionStore.addFilter('medical-0');
        sessionStore.addFilter('emergencyMedicalEvacuation-0');

        if (themeStore.isModeDefault && this.isTripCancellationFilterPreSelected()) {
          sessionStore.addFilter('tripCancellation-0');
        }
      }

      // If coming in through the cruise subflow, add our cruise filter (otherCoverages-2) by default
      if (themeStore.isModeCruise) {
        sessionStore.addFilter('otherCoverages-2');
      }
      sessionStore.invokeFilterOptionUpdates();
      this.setPlansFullyLoadedStatus(true);
    },
    async setSoventureFilterResults() {
      this.initSoventureFilters();

      const availableProducts = this.getAvailablePlans;

      // Loop through each available plan and set our list of filters.
      availableProducts.forEach((plan: QuoteResult) => {
        // Loop through coverages once instead of multiple findIndex calls
        plan.coverages.forEach((coverage) => {
          switch (coverage.id) {
            case 'medical':
              const medicalValue = Number(
                coverage.details[0]?.value.replace(/[$,]/g, '')
              );

              if (medicalValue <= 150000) {
                this.setFilterByIndex('medical-1', plan.code);
              } else if (medicalValue == 250000) {
                this.setFilterByIndex('medical-2', plan.code);
              } else if (medicalValue >= 500000) {
                this.setFilterByIndex('medical-3', plan.code);
              }

              break;
            case 'emergencyMedicalEvacuation':
              const emergencyMedicalValue = Number(
                coverage.details[0]?.value.replace(/[^0-9]/g, '')
              );

              if (emergencyMedicalValue == 250000) {
                this.setFilterByIndex(
                  'emergencyMedicalEvacuation-1',
                  plan.code
                );
              } else if (emergencyMedicalValue === 750000) {
                this.setFilterByIndex(
                  'emergencyMedicalEvacuation-2',
                  plan.code
                );
              } else if (emergencyMedicalValue === 1000000) {
                this.setFilterByIndex(
                  'emergencyMedicalEvacuation-3',
                  plan.code
                );
              }

              break;
            case 'tripCancellation':
              if (
                coverage.limits?.some(
                  (ele: CoverageLimit) => ele.valuePerTrip > 0
                )
              ) {
                this.setFilterByIndex('tripProtection-0', plan.code);
              }
              break;
            case 'cancelForAnyReasonOption':
              if (coverage.limits && coverage.limits.length > 0) {
                this.setFilterByIndex('tripProtection-1', plan.code);
              }
              break;
            case 'cancelForWorkReasonOption':
              if (coverage.limits && coverage.limits.length > 0) {
                this.setFilterByIndex('tripProtection-2', plan.code);
              }
              break;
            case 'travelDelay':
              const travelDelayValue = Number(
                coverage.limits?.[0]?.coverageValue.replace(/[^0-9]/g, '')
              );

              if (travelDelayValue <= 1000) {
                this.setFilterByIndex('travelDelay-0', plan.code);
              } else if (travelDelayValue === 2000) {
                this.setFilterByIndex('travelDelay-1', plan.code);
              }
              break;
            case 'tripInterruption':
              if (coverage.limits?.[0]?.valueType === 'percentage') {
                const tripInterruptionPercent = Number(
                  coverage.limits?.[0]?.coverageValue
                );

                if (tripInterruptionPercent <= 150) {
                  this.setFilterByIndex('tripInterruption-0', plan.code);
                } else if (tripInterruptionPercent > 150) {
                  this.setFilterByIndex('tripInterruption-1', plan.code);
                }
              }
              break;
            case 'baggage':
              if (coverage.limits?.[0]?.valueType === 'limit') {
                const baggageLossLimit = Number(
                  coverage.limits?.[0]?.coverageValue
                );

                if (baggageLossLimit <= 1500) {
                  this.setFilterByIndex('baggage-0', plan.code);
                } else if (baggageLossLimit >= 2000) {
                  this.setFilterByIndex('baggage-1', plan.code);
                }
              }
              break;
            case 'rentalCar':
              if (coverage.limits && coverage.limits?.length > 0) {
                this.setFilterByIndex('otherCoverages-0', plan.code);
              }
              break;
            case 'vacationRentalDamage':
              if (coverage.limits && coverage.limits?.length > 0) {
                this.setFilterByIndex('otherCoverages-1', plan.code);
              }
              break;
            case 'searchAndRescue':
              this.setFilterByIndex('otherCoverages-2', plan.code);
              break;
            case 'hospitalOfChoice':
              this.setFilterByIndex('otherCoverages-3', plan.code);
              break;
            case 'emergencySportsEquipmentRental':
              this.setFilterByIndex('otherCoverages-4', plan.code);
              break;
            case 'adventureSports':
              this.soventure.adventureSportsPlanCodes.add(plan.code);
          }
        });
        // Setting for all amounts
        this.setFilterByIndex('medical-0', plan.code);
        this.setFilterByIndex('emergencyMedicalEvacuation-0', plan.code);

        plan.coveredActivities?.forEach((activity) => {
          let currentActivity = activity.toLowerCase();
          // To ensure scuba diving is picked up for it's filter, we check if this
          // activity includes "scuba diving".
          if (currentActivity.includes('scuba diving')) {
            currentActivity = 'scuba diving';
          }
          const index = this.coveredActivitiesMap[currentActivity];
          if (index !== undefined) {
            this.setFilterByIndex(`coveredActivities-${index}`, plan.code);
          }
        });
      });

      // Setting default filters.
      const sessionStore = useUserSessionStore();

      // Only set these default filters if there are no filters
      if (sessionStore.getSelectedFilters.length === 0) {
        sessionStore.addFilter('medical-0');
        sessionStore.addFilter('emergencyMedicalEvacuation-0');
        if (this.isTripCancellationFilterPreSelected()) {
          sessionStore.addFilter('tripProtection-0');
        }
      }
    },
    /**
     * Resets filter data.
     */
    resetFilterData() {
      this.quote.filters = {};
    },
    /**
     * Set filter data
     * @param data
     */
    setFilterData(data: any) {
      this.quote.filters = data;
    },
    /**
     * Resets the results in our api state for quote.
     */
    resetQuoteResultsData() {
      this.quote.results = {
        requestStatus: HTTP_REQUEST_STATES.NOT_STARTED,
        metadata: {},
        products: [],
      };
    },
    /**
     * Sets the loader state.
     *
     * @param {boolean} val
     */
    setLoaderState(val: boolean) {
      if (this.silentQuote) return;

      this.displayLoader = val;
    },
    /**
     * Creates an order via our order API
     *
     * @returns {Object|Boolean}
     */
    async createOrder() {
      const themeStore = useThemeStore();
      let res;
      let payload: Record<string, any> = {};

      payload.site = themeStore.getCurrentTheme;
      if (!themeStore.isModeDefault) {
        payload.originatingSource = themeStore.getCurrentThemeMode;
      }
      try {
        res = await axios.post(API_ENDPOINTS.order.createOrder(), payload, {
          withCredentials: true,
        });

        // Set API store data
        this.setOrderId(res.data.orderId);
        this.setOrderToken(res.data.token);

        localStorage.setItem('imt.order.id', res.data.orderId);
        localStorage.setItem('imt.order.token', res.data.token);

        console.info('Order successfully created. ID: ', res.data.orderId);
        return res.data;
      } catch (err) {
        console.error(err);

        return false;
      }
    },
    /**
     * Sets our order id
     *
     * @param orderId
     * @returns {void}
     */
    setOrderId(orderId: string): void {
      this.order.id = orderId;
    },
    /**
     * Sets our order token
     *
     * @param token
     * @returns {void}
     */
    setOrderToken(token: string): void {
      this.order.token = token;
    },
    /**
     * Add a product to an order
     *
     * @param {string} productCode
     * @param {string} quoteId
     * @param {PlanParamOption[]} options
     *
     * @return {Boolean}
     */
    async addProductToOrder(
      productCode: string,
      quoteId: string,
      options: PlanParamOption[]
    ) {
      if (!this.order.token) {
        console.error('Could not fetch order. No auth token available.');
        return;
      }

      if (!productCode || !quoteId) {
        console.error(
          'Could not add product to order. Must provide product code and quote ID'
        );
      }

      console.info('Adding product to order.');

      const payload = {
        products: [
          {
            productCode,
            quoteId,
            options,
          },
        ],
      };

      try {
        if (!this.order.id) return false;

        const res = await axios.post(
          API_ENDPOINTS.order.addProduct(this.order.id),
          payload,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${this.order.token}`,
            },
          }
        );

        if (res.data.products.length > 0) {
          this.setProductId(res.data.products[0].productId);
        } else {
          return false;
        }

        return true;
      } catch (err) {
        console.error(err);

        return false;
      }
    },
    /**
     * Add product inputs to a product
     *
     * @returns {Promise<void>} Pass/fail status
     */
    async addProductInputsToProduct(
      clickthroughs: ClickThroughValidationMap
    ): Promise<void> {
      const requestPayload = {
        clickthrough: clickthroughs,
      };

      if (!this.order.id || !this.order.productId) return;

      try {
        console.info('Adding inputs to product...');

        await axios.put(
          API_ENDPOINTS.order.addProductInputs(
            this.order.id,
            this.order.productId
          ),
          requestPayload,
          {
            headers: {
              Authorization: `Bearer ${this.order.token}`,
            },
          }
        );

        console.info('Product update complete.');
      } catch (err) {
        console.error(err);
      }
    },
    /**
     * Takes our payload and submits it to our Email a Quote endpoint
     *
     * @param {EmailAQuote} payload
     * @returns boolean
     */
    async emailAQuote(payload: EmailAQuote) {
      if (!this.quote.id) {
        console.error('Could not email a quote. No quote ID available');
        return false;
      }

      try {
        await axios.post(
          API_ENDPOINTS.email.emailAQuote(this.quote.id),
          payload
        );
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    initFilters() {
      const contentStore = useContentStore();

      this.quote.filters['tripCancellation-0'] = new Set();
      this.quote.filters['preExWaiver-0'] = new Set();
      this.quote.filters['cancelForAnyReasonOption-0'] = new Set();
      this.quote.filters['tripInterruption-0'] = new Set();
      this.quote.filters['tripInterruption-1'] = new Set();
      this.quote.filters['tripInterruption-2'] = new Set();
      this.quote.filters['tripInterruption-3'] = new Set();
      this.quote.filters['medical-0'] = new Set();
      this.quote.filters['medical-1'] = new Set();
      this.quote.filters['medical-2'] = new Set();
      this.quote.filters['medical-3'] = new Set();
      this.quote.filters['medical-4'] = new Set();
      this.quote.filters['medical-primary'] = new Set();
      this.quote.filters['emergencyMedicalEvacuation-0'] = new Set();
      this.quote.filters['emergencyMedicalEvacuation-1'] = new Set();
      this.quote.filters['emergencyMedicalEvacuation-2'] = new Set();
      this.quote.filters['emergencyMedicalEvacuation-3'] = new Set();
      this.quote.filters['emergencyMedicalEvacuation-4'] = new Set();
      this.quote.filters['emergencyMedicalEvacuation-5'] = new Set();
      this.quote.filters['emergencyMedicalEvacuation-primary'] = new Set();
      this.quote.filters['baggageDelay-0'] = new Set();
      this.quote.filters['travelDelay-0'] = new Set();
      // Rental Car
      this.quote.filters['otherCoverages-0'] = new Set();
      // Vacation Rental Liability
      this.quote.filters['otherCoverages-1'] = new Set();
      // Cruise
      this.quote.filters['otherCoverages-2'] = new Set();

      // Baggage
      this.quote.filters['baggage-0'] = new Set();
      this.quote.filters['baggage-1'] = new Set();
      this.quote.filters['baggage-2'] = new Set();
      this.quote.filters['baggage-3'] = new Set();

      // Accidental Death
      this.quote.filters['accidentalDeath24Hour-0'] = new Set();

      this.cms.providers.forEach((provider: CMSProvider, index) => {
        this.quote.filters[`provider-${index}`] = new Set();
        contentStore.addFilterButton(
          'provider',
          'checkBoxLabels',
          provider.name
        );
      });
    },
    initSoventureFilters() {
      this.quote.filters['medical-0'] = new Set();
      this.quote.filters['medical-1'] = new Set();
      this.quote.filters['medical-2'] = new Set();
      this.quote.filters['medical-3'] = new Set();

      this.quote.filters['emergencyMedicalEvacuation-0'] = new Set();
      this.quote.filters['emergencyMedicalEvacuation-1'] = new Set();
      this.quote.filters['emergencyMedicalEvacuation-2'] = new Set();
      this.quote.filters['emergencyMedicalEvacuation-3'] = new Set();

      // Trip Cancellation
      this.quote.filters['tripProtection-0'] = new Set();
      // Cancel for any reason
      this.quote.filters['tripProtection-1'] = new Set();
      // Cancel for any work reason
      this.quote.filters['tripProtection-2'] = new Set();

      this.quote.filters['travelDelay-0'] = new Set();
      this.quote.filters['travelDelay-1'] = new Set();

      this.quote.filters['tripInterruption-0'] = new Set();
      this.quote.filters['tripInterruption-1'] = new Set();

      this.quote.filters['baggage-0'] = new Set();
      this.quote.filters['baggage-1'] = new Set();

      // Rental Car
      this.quote.filters['otherCoverages-0'] = new Set();
      // Vacation Rental Liability
      this.quote.filters['otherCoverages-1'] = new Set();
      // Search and Rescue
      this.quote.filters['otherCoverages-2'] = new Set();
      // Hospital of Choice
      this.quote.filters['otherCoverages-3'] = new Set();
      // Sports Equipment Coverage Filter
      this.quote.filters['otherCoverages-4'] = new Set();

      this.quote.filters['otherCoverages-5'] = new Set();

      const uniqueCoveredActivityIndices = new Set(
        Object.values(this.coveredActivitiesMap)
      );
      uniqueCoveredActivityIndices.forEach((i) => {
        this.quote.filters[`coveredActivities-${i}`] = new Set();
      });
    },
    setFilterByIndex(index: string, planCode: string) {
      this.quote.filters[index].add(planCode);
    },
    /**
     * Adds a CoverageDetail to includedBenefits
     * via a planCode
     * @param planCode string
     * @param val string
     */
    addIncludedBenefit(planCode: string, val: string) {
      const plan = this.getPlanByPlanCode(planCode);
      if (Array.isArray(plan?.includedBenefits)) {
        plan?.includedBenefits?.push({
          secondary: false,
          details: {
            value: '',
            description: val,
          },
        } as IncludedBenefits);
      }
    },
    setSilentQuote(silentQuote: boolean) {
      this.silentQuote = silentQuote;
    },

    setQuoteReferenceCode(code: string | null) {
      this.quoteReferenceCode = code
        ? `${code.slice(0, 3)}-${code.slice(3)}`
        : null;
    },
    /**
     * Set the status of the plans if its loaded fully
     * @param val
     */
    setPlansFullyLoadedStatus(val: boolean) {
      this.plansFullyLoaded = val;
    },
    /**
     * Get the rest of the plans after the top ten plans are loaded
     */
    async getResultsAfterInitialResults() {
      const sessionStore = useUserSessionStore();
      const themeStore = useThemeStore();
      if (!themeStore.isThemeSoventure && this.quote.id !== null) {
        try {
          const response = await axios.get(
            API_ENDPOINTS.quote.getResultsByOffset(
              this.quote.id,
              QUOTE_RESULT_API_SETTING.INITIAL_RESULTS_COUNT
            ),
            {
              data: {},
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          const insuremytripPlanCodesToExclude = this.getFFValue(
            'cms_20250618_insuremytrip_plans_to_exclude_quote_results_us_release'
          );

          if (
            insuremytripPlanCodesToExclude !== '' &&
            typeof insuremytripPlanCodesToExclude === 'string'
          ) {
            const planCodesArr = insuremytripPlanCodesToExclude
              .trim()
              .split(',');
            response.data.products = response.data.products.filter(
              (plan: { code: string }) => !planCodesArr.includes(plan.code)
            );
          }

          sessionStore.setPlans(
            JSON.parse(JSON.stringify(response.data.products))
          );

          // Set raw quote details in api store
          this.quote.results.products.push(...response.data.products);
          this.setFilterResults();
        } catch (err) {
          console.error('Error fetching results after initial batch: ', err);
          this.setLoaderState(false);
          sessionStore.setErrorModalState('httpServerError');
        }
      }
    },
    async fetchProviderContent() {
      try {
        if (window.ACF_PAGE_DATA_RESULTS?.providers_content) {
          const data = window.ACF_PAGE_DATA_RESULTS.providers_content;
          this.setCMSProvider(data);
        } else {
          const res = await axios.get(API_ENDPOINTS.cms.getProviderContent());
          this.setCMSProvider(res.data);
        }
      } catch (error) {
        handleWordpressContentError(
          error,
          `Error fetching provider content on ${window.location.hostname}`
        );
      }
    },
    isTripCancellationFilterPreSelected() {
      const quoteDetails = this.getQuoteDetails;
      const initialTripPaymentDate = quoteDetails?.trip?.initialTripPaymentDate;
      const residenceCountry = this.getResidence.country;

      if (!initialTripPaymentDate || residenceCountry !== 'USA') {
        return false;
      }

      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      return quoteDetails.trip.departureDate !== todayString;
    },
  },
});
