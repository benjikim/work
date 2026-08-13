import { defineStore } from 'pinia';
import {
  QuoteResult,
  FormattedCoverage,
  UserPlan,
  FormattedOption,
  SortOptions,
  ClickThrough,
  ClickThroughValidationMap,
  FormattedOptionItem,
  EmailAQuote,
  PlanParameter,
  ErrorModalTypes,
  GAObject,
  ActivePlanDetailsTab,
  CostAndSelected,
} from '@/types';
import { event } from 'vue-gtag';
import { useApiStore } from './api';
import {
  getOptionKeyFromCoverageMap,
  displayAdditionalOptionLabel,
  displayLabel,
  handlePlanParameters,
  initResellerRatings,
} from '@/utility';
import { useContentStore } from '@/store/content';
import { useThemeStore } from '@/store/theme';
import { LOADER_KEYS } from '@/config';
import router from '@/router';

interface State {
  plansToCompare: string[];
  sortSelection: SortOptions;
  // @TODO we still need a list of filters but this is a placeholder for future filter work
  filters: string[];
  plans: UserPlan;
  numberOfFilterPlans: number;
  modalOpen: boolean;
  filterToolTipId: string;
  filterToolTipOpen: boolean;
  filterToolTipPlanShow: boolean;
  errorModalType: ErrorModalTypes;
  mobileFilterModalOpen: boolean;
  editTripModalIsOpen: boolean;
  additionalDetailsModalOpen: boolean;
  cfarDetailsModalOpen: boolean;
  planTagId: string;
  planTagModalOpen: boolean;
  planToDisplayInModal: string;
  scrollToPlanDetailSection: string | null;
  scrollPlanCode: string;
  clickThroughAccepted: ClickThroughValidationMap;
  pbmOpen: boolean;
  pbmPlanCode: string;
  clickThroughValid: boolean;
  emailAQuote: EmailAQuote;
  planParameters: PlanParameter[];
  plansToRequote: string[];
  isSMView: boolean;
  isMobile: boolean;
  isLGView: boolean;
  secondaryToolTipModal: boolean;
  soventurePlanCodes: string[];
  soventureHiddenTagPlans: string[];
  plansUpdating: boolean;
  movingToPurchase: boolean;
  activePlanDetailsTab: ActivePlanDetailsTab;
  coveredActivitiesModalOpen: boolean;
  orderedCoveredActivities: string[];
  loaderKey: string;
  annualEligibilityModalOpen: boolean;
  moreInfoModalOpen: boolean;
  hideSoventureUpdateTripCost: boolean;
  moreInfoModalKey: string;
  availabilityModalOpen: boolean;
  sectionOpenStates: Record<string, Record<string, boolean>>;
}

export const useUserSessionStore = defineStore('user-session-store', {
  state: (): State => ({
    plansToCompare: [],
    sortSelection: 'popular',
    filters: [],
    plans: {},
    errorModalType: '',
    numberOfFilterPlans: 0,
    filterToolTipId: '',
    filterToolTipOpen: false,
    filterToolTipPlanShow: false,
    mobileFilterModalOpen: false,
    editTripModalIsOpen: false,
    modalOpen: false,
    additionalDetailsModalOpen: false,
    cfarDetailsModalOpen: false,
    planTagId: '',
    planTagModalOpen: false,
    planToDisplayInModal: '',
    scrollToPlanDetailSection: null,
    scrollPlanCode: '',
    clickThroughAccepted: {},
    pbmOpen: false,
    pbmPlanCode: '',
    clickThroughValid: false,
    emailAQuote: {
      firstName: null,
      lastName: null,
      email: null,
      marketingOptin: false,
      quoteUrl: null,
    } as EmailAQuote,
    planParameters: [],
    plansToRequote: [],
    isSMView: false,
    isMobile: false,
    isLGView: false,
    secondaryToolTipModal: false,
    soventurePlanCodes: [],
    soventureHiddenTagPlans: [],
    plansUpdating: false,
    movingToPurchase: false,
    activePlanDetailsTab: 'coverageLimits',
    coveredActivitiesModalOpen: false,
    orderedCoveredActivities: [],
    loaderKey: '',
    annualEligibilityModalOpen: false,
    availabilityModalOpen: false,
    moreInfoModalOpen: false,
    hideSoventureUpdateTripCost: true,
    moreInfoModalKey: '',
    sectionOpenStates: {},
  }),
  getters: {
    /**
     * Get Available Plans
     *
     * @returns {State['plans']['available']}
     */
    getAvailablePlans(): State['plans']['available'] {
      return this.plans.available;
    },
    /**
     * Get Sort Selection
     *
     * @returns {State['sortSelection']}
     */
    getSortSelection(): State['sortSelection'] {
      return this.sortSelection;
    },
    /**
     * Gets active plan details tab view
     *
     * @returns {ActivePlanDetailsTab}
     */
    getActivePlanDetailsTab(): ActivePlanDetailsTab {
      return this.activePlanDetailsTab;
    },
    /**
     * Get Selected Plans for Compare
     *
     * @returns {State['plansToCompare']}
     */
    getSelectedPlansForCompare(): State['plansToCompare'] {
      return this.plansToCompare;
    },
    /**
     * Check if given planCode was selected to be compared.
     *
     * @param {string} planCode
     * @returns {boolean}
     */
    isPlanSelectedForCompare(): (planCode: string) => boolean {
      return (planCode: string) => this.plansToCompare.includes(planCode);
    },
    /**
     * Get Clickthroughs of a given plan
     *
     * @param {string} planCode
     * @returns {ClickThrough[]}
     */
    getClickthroughsOfSelectedPlan(): (planCode: string) => ClickThrough[] {
      return (planCode: string) => this.plans[planCode]?.clickthroughs || [];
    },
    /**
     * Get Options of a given plan
     *
     * @param {string} planCode
     * @returns {FormattedOption}
     */
    getOptionsOfSelectedPlan(): (planCode: string) => FormattedOption {
      return (planCode: string) => this.plans[planCode]?.options;
    },
    /**
     * Get Coverages of a given plan
     *
     * @param {string} planCode
     * @returns {FormattedOption}
     */
    getCoveragesOfSelectedPlan(): (planCode: string) => FormattedCoverage {
      return (planCode: string) => this.plans[planCode]?.coverages;
    },
    /**
     * Gets a plan via planCode.
     *
     * @returns {UserPlan[string]}
     */
    getPlanByPlanCode(): (planCode: string) => UserPlan[string] {
      return (planCode: string) => this.plans[planCode];
    },
    /**
     * Gets coverages by plan code and coverageId.
     *
     * @returns FormattedCoverage[string]
     */
    getPlanCoverageByKey(): (
      planCode: string,
      coverageId: string
    ) => FormattedCoverage[string] {
      return (planCode: string, coverageId: string) =>
        this.plans[planCode].coverages[coverageId];
    },
    /**
     * Check If Modal is Open
     *
     * @returns {boolean}
     */
    isModalOpen(): State['modalOpen'] {
      return this.modalOpen;
    },
    /**
     * Get Currently Selected Plan to Display in Modal
     *
     * @returns {State['planToDisplayInModal']}
     */
    getPlanCodeForModal(): State['planToDisplayInModal'] {
      return this.planToDisplayInModal;
    },
    /**
     * Gets scroll plan section
     *
     * @returns {State['scrollToPlanDetailSection']}
     */
    getScrollToPlanDetailSection(): State['scrollToPlanDetailSection'] {
      return this.scrollToPlanDetailSection;
    },
    /**
     * Get clickThrough value of a given noteId.
     *
     * @param {string} noteId
     * @returns {String}
     */
    getClickthroughValue(): (noteId: string) => string {
      return (noteId: string) => this.clickThroughAccepted[noteId] || '';
    },
    /**
     * Checks to see if modal is open.
     *
     * @returns {boolean}
     */
    isPBMOpen(): State['pbmOpen'] {
      return this.pbmOpen;
    },
    /**
     * Get pre buy modal plan code.
     *
     * @returns {State['preBuyModal']}
     */
    getPBMPlan(): State['pbmPlanCode'] {
      return this.pbmPlanCode;
    },
    /**
     * Get clickthrough validation status.
     *
     * @returns {State['clickThroughValid']}
     */
    getClickThroughValidationStatus(): State['clickThroughValid'] {
      return this.clickThroughValid;
    },
    /**
     * Get Currently Selected Plan Cost
     *
     * @returns {string}
     */
    getCurrentPlanCost(): (planCode: string) => string | undefined {
      return (planCode: string) => {
        const currentCost = this.getCurrentPlanCostUnformatted(planCode);
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        });

        return formatter.format(currentCost);
      };
    },
    /**
     * Gets a plan's base cost.
     *
     * @returns {number}
     */
    getCurrentPlanCostUnformatted(): (planCode: string) => number {
      return (planCode: string) => {
        let currentCost = this.plans[planCode]?.currentCost.base;
        currentCost += this.plans[planCode]?.currentCost.taxes.amount;
        currentCost += this.plans[planCode]?.fees.amount;
        return Number(currentCost.toFixed(2));
      };
    },
    getCurrentPlanCostFormatted(): (planCode: string) => string {
      return (planCode: string) => {
        let currentCost = this.plans[planCode]?.currentCost.base;
        currentCost += this.plans[planCode]?.currentCost.taxes.amount;
        currentCost += this.plans[planCode]?.fees.amount;
        const formatter = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        return formatter.format(currentCost);
      };
    },
    /**
     * Gets the tool tip id.
     *
     * @returns {string|null}
     */
    getFilterToolTipId(): State['filterToolTipId'] {
      return this.filterToolTipId;
    },
    /**
     * Get the status of the tool tip modal.
     *
     * @returns {boolean}
     */
    isFilterToolTipOpen(): State['filterToolTipOpen'] {
      return this.filterToolTipOpen;
    },
    /**
     * Get the status of the tool tip to show plan related info.
     *
     * @returns {boolean}
     */
    isFilterToolTipPlanShow(): State['filterToolTipPlanShow'] {
      return this.filterToolTipPlanShow;
    },
    /**
     * Get the status of the tool tip modal.
     *
     * @returns {boolean}
     */
    isMobileFilterModalOpen(): State['mobileFilterModalOpen'] {
      return this.mobileFilterModalOpen && !this.isLGView;
    },
    /**
     * Gets the status of the edit trip details modal.
     *
     * @returns {boolean}
     */
    isEditTripDetailsOpen(): State['editTripModalIsOpen'] {
      return this.editTripModalIsOpen;
    },
    /**
     * Gets the status of the additional details modal
     *
     * @returns {boolean}
     */
    isAdditionalDetailsModalOpen(): State['additionalDetailsModalOpen'] {
      return this.additionalDetailsModalOpen;
    },
    /**
     * Gets the status of the cfar details modal
     *
     * @returns {boolean}
     */
    isCfarDetailsModalOpen(): State['cfarDetailsModalOpen'] {
      return this.cfarDetailsModalOpen;
    },
    /**
     * Gets the status of the plan tag modal
     * @returns {boolean}
     */
    isPlanTagModalOpen(): State['planTagModalOpen'] {
      return this.planTagModalOpen;
    },
    /**
     * Gets the status of the annual eligibility modal
     * @returns {boolean}
     */
    isAnnualEligibilityModalOpen(): State['annualEligibilityModalOpen'] {
      return this.annualEligibilityModalOpen;
    },
    /**
     * Gets the status of the availability modal.
     *
     * @returns {boolean} true if the availability modal is open, false otherwise
     */
    isAvailabilityModalOpen(): State['availabilityModalOpen'] {
      return this.availabilityModalOpen;
    },
    /**
     * Gets the plan tag id.
     *
     * @returns {string|null}
     */
    getPlanTagId(): State['planTagId'] {
      return this.planTagId;
    },
    /**
     * Gets the email a quote object
     *
     * @returns {EmailAQuote}
     */
    getEmailAQuoteObject(): State['emailAQuote'] {
      return this.emailAQuote;
    },
    /**
     * Gets the first name from EmailAQuote
     *
     * @returns {string|null}
     */
    getEmailAQuoteFirstName(): string | null {
      return this.emailAQuote.firstName;
    },
    /**
     * Gets the last name from EmailAQuote
     *
     * @returns {string|null}
     */
    getEmailAQuoteLastName(): string | null {
      return this.emailAQuote.lastName;
    },
    /**
     * Gets the email from EmailAQuote
     *
     * @returns {string|null}
     */
    getEmailAQuoteEmail(): string | null {
      return this.emailAQuote.email;
    },
    /**
     * Gets the message from EmailAQuote
     *
     * @returns {string}
     */
    getEmailAQuoteMessage(): string {
      return this.emailAQuote.message;
    },
    /**
     * Gets friendsEmail from EmailAQuote
     *
     * @returns {string|null}
     */
    getEmailAQuoteFriendsEmail(): string[] {
      return this.emailAQuote.friendsEmail;
    },
    getEmailAQuotePlans(): object[] {
      return this.emailAQuote.plans;
    },
    /**
     * Returns the list of selected filters.
     *
     * @returns {string[]}
     */
    getSelectedFilters(): string[] {
      return this.filters;
    },
    /**
     * Checks to see if filters are set to default.
     *
     * @returns {boolean}
     */
    areSelectedFiltersDefault(): boolean {
      const themeStore = useThemeStore();
      if (themeStore.isThemeSoventure) {
        return (
          this.filters.length === 2 &&
          this.filters.includes('medical-0') &&
          this.filters.includes('emergencyMedicalEvacuation-0')
        );
      }
      return (
        this.filters.length === 2 &&
        this.filters.includes('medical-0') &&
        this.filters.includes('emergencyMedicalEvacuation-0')
      );
    },
    /**
     * Gets the number of filter plans
     *
     * @returns {UserPlan}
     */
    getFilteredPlansCount(): State['numberOfFilterPlans'] {
      return this.numberOfFilterPlans;
    },
    /**
     * Get Plan Parameters to use for Requote
     *
     * @returns {State['planParameters']}
     */
    getPlanParameters(): State['planParameters'] {
      return this.planParameters;
    },
    /**
     * Get Array of Plans used to know what plan to Requote
     *
     * @returns {State['plansToRequote']}
     */
    getPlansToRequote(): State['plansToRequote'] {
      return this.plansToRequote;
    },
    /**
     * Get Accepted Clickthroughs to set to Product Order
     * This will allow the buy page to skip some clickthroughs
     * that the user has already interracted with.
     *
     * @returns {State['clickThroughAccepted']}
     */
    getAcceptedClickthroughs(): State['clickThroughAccepted'] {
      return this.clickThroughAccepted;
    },
    /**
     * Returns error modal type
     *
     * @returns {boolean}
     */
    getErrorModalType(): State['errorModalType'] {
      return this.errorModalType;
    },
    /**
     * Checks to see if view is SM.
     *
     * @returns {boolean}
     */
    isViewSM(): State['isSMView'] {
      return this.isSMView;
    },
    /**
     * Checks to see if mobile.
     *
     * @returns {boolean}
     */
    isMobileView(): State['isMobile'] {
      return this.isMobile;
    },
    /**
     * Checks to see if view is Lg.
     *
     * @returns {boolean}
     */
    isViewLG(): State['isLGView'] {
      return this.isLGView;
    },
    /**
     * Checks to see if secondary tool tip is open.
     *
     * @returns {boolean}
     */
    isSecondaryToolTipOpen(): State['secondaryToolTipModal'] {
      return this.secondaryToolTipModal;
    },
    getSoventurePlanCodes(): State['soventurePlanCodes'] {
      return this.soventurePlanCodes;
    },
    /**
     * Gets our list of soventure plans to remove plan tag from
     * @returns {Array}
     */
    getSoventureHiddenPlanTagPlans(): State['soventureHiddenTagPlans'] {
      return this.soventureHiddenTagPlans;
    },
    arePlansUpdating(): State['plansUpdating'] {
      return this.plansUpdating;
    },
    isUserMovingToPurchase(): State['movingToPurchase'] {
      return this.movingToPurchase;
    },
    isCoveredActivitiesModalOpen(): State['coveredActivitiesModalOpen'] {
      return this.coveredActivitiesModalOpen;
    },
    getLoaderKey(): string {
      return this.loaderKey;
    },
    isMoreInfoModalOpen(): State['moreInfoModalOpen'] {
      return this.moreInfoModalOpen;
    },
    getSelectedCFAROption(): (planCode: string) => CostAndSelected | null {
      return (planCode: string) => {
        const currentOptions = this.plans[planCode].options;
        const optionKey = getOptionKeyFromCoverageMap(
          'cancelForAnyReasonOption',
          currentOptions
        );

        if (!optionKey) {
          return null;
        }

        // find the option key that has the values.[someValue].selected
        const selectedOptionKey = Object.keys(
          currentOptions[optionKey].values
        ).find((key) => currentOptions[optionKey].values[key].selected);

        if (!selectedOptionKey) {
          return null;
        }

        return currentOptions[optionKey].values[selectedOptionKey];
      };
    },
    isSoventureUpdateTripCostHidden(): State['hideSoventureUpdateTripCost'] {
      return this.hideSoventureUpdateTripCost;
    },
    getMoreInfoModalKey(): State['moreInfoModalKey'] {
      return this.moreInfoModalKey;
    },
    /**
     * Checks if a section is open by header name
     *
     * @param {string} header
     * @returns {boolean}
     */
    isSectionOpen(): (header: string, planCode: string) => boolean {
      return (header: string, planCode: string) =>
        this.sectionOpenStates[planCode] &&
        this.sectionOpenStates[planCode][header];
    },

    getScrollPlanCode(): State['scrollPlanCode'] {
      return this.scrollPlanCode;
    },
  },
  actions: {
    /**
     * This will gather all the plans returned from the API and set them in this store if they are available
     * This will be used to handle clickthroughs and options later.
     *
     * @param {QuoteResult[]} plans
     * @returns {void}
     */
    setPlans(plans: QuoteResult[]): void {
      plans?.forEach((plan: QuoteResult) => {
        if (plan.available === true) {
          const planOptions = Array.isArray(plan.options) ? plan.options : [];
          const planCoverages = Array.isArray(plan.coverages)
            ? plan.coverages
            : [];

          const currOptions = planOptions.reduce(
            (result: FormattedOption, option) => {
              const { id, value, displayName, ...rest } = option;

              if (!(id in result)) {
                result[id] = {
                  displayName: displayName,
                  values: {},
                } as FormattedOptionItem;
              }

              if (!(value in result[id]['values'])) {
                result[id]['values'][value] = rest;
              }

              return result;
            },
            {} as FormattedOption
          );

          const currCoverages = planCoverages.reduce(
            (result: FormattedCoverage, coverage) => {
              const { id, ...rest } = coverage;

              if (!(id in result)) {
                result[id] = rest;
              }

              return result;
            },
            {} as FormattedCoverage
          );

          this.plans[plan.code] = {
            currentCost: plan.cost,
            fees: plan.fees,
            options: currOptions,
            coverages: currCoverages,
            clickthroughs: plan.clickthroughs,
          };
        }
      });
    },
    /**
     * Invokes a series of updates on options based on theme
     * and state of filters.
     *
     * @returns {void}
     */
    invokeFilterOptionUpdates(): void {
      const themeStore = useThemeStore();
      const apiStore = useApiStore();

      if (themeStore.isThemeSoventure) {
        // We can go back to this page and rerun the init, so this is
        if (this.getSelectedFilters.includes('tripProtection-1')) {
          this.setPlanCFAR(
            Array.from(apiStore.getFilters['tripProtection-1']),
            true
          );
        }
        this.setPlanAdventureSports(
          Array.from(apiStore.soventure.adventureSportsPlanCodes),
          true
        );
      } else if (themeStore.isThemeIMT) {
        // We can go back to this page and rerun the init, so this is
        // removing CFAR filter and allowing the watch event in plan actions
        if (this.getSelectedFilters.includes('cancelForAnyReasonOption-0')) {
          this.setPlanCFAR(
            Array.from(apiStore.getFilters['cancelForAnyReasonOption-0']),
            true
          );
        }
      }
    },
    /**
     * Once we have requoted, we no longer need this list of plans
     *
     * @returns {void}
     */
    clearPlansToRequote(): void {
      this.plansToRequote = [];
    },
    /**
     * Once we have requoted, we no longer need this list of plans
     *
     * @returns {void}
     */
    clearPlansToCompare(): void {
      this.plansToCompare = [];
    },
    removePlanFromCompare(planCode: string): void {
      this.plansToCompare = this.plansToCompare.filter(
        (code) => code !== planCode
      );
      const apiStore = useApiStore();
      // Update URL with new plans to compare
      if (this.plansToCompare.length > 0) {
        const planCodesJoined = this.plansToCompare.join(',');
        router.push({
          name: 'Compare',
          query: {
            planCodes: planCodesJoined,
            _qid: apiStore.getQuoteId,
          },
        });
        // after pushing new route, we need to reinit reseller ratings
        initResellerRatings();
      } else {
        router.push({
          name: 'Results',
          query: {
            _qid: apiStore.getQuoteId,
          },
        });
      }
      localStorage.setItem('plansToCompare', this.plansToCompare.join(','));
    },
    /**
     * @TODO this needs to be updated with future work. This is just enabling compare selections to the max
     * Then it allows you to compare the selections if that's what you want... this sucks. I hate it
     *
     * @param {string} planCode
     * @returns {void}
     */
    setSelectedPlanForCompare(planCode: string): void {
      const apiStore = useApiStore();
      let compareLimit = Number(
        apiStore.getFFValue('web_20251113_qr_number_of_compare')
      );

      if (isNaN(compareLimit) || compareLimit <= 0) {
        compareLimit = 3;
      }

      if (this.plansToCompare.includes(planCode)) {
        const results = this.plansToCompare.filter((code) => code !== planCode);
        this.plansToCompare = results;
      } else if (this.plansToCompare.length < compareLimit) {
        this.plansToCompare.push(planCode);
      }
      localStorage.setItem('plansToCompare', this.plansToCompare.join(','));
    },
    /**
     * Deselect plans for compare.
     */
    deselectPlansForCompare(): void {
      this.plansToCompare = [];
      localStorage.removeItem('plansToCompare');
    },

    /**
     * Sets the value of a clickthrough.
     *
     * @param {string} noteId
     */
    setClickThroughValue(noteId: string, value: string): void {
      if (value.length === 0) {
        delete this.clickThroughAccepted[noteId];
      } else {
        this.clickThroughAccepted[noteId] = value;
      }
    },
    /**
     * Set Sort Selection When User Changes Sort
     *
     * @param {SortOptions} sortType
     * @returns {void}
     */
    setSortSelection(sortType: SortOptions): void {
      if (sortType !== this.sortSelection) {
        this.sortSelection = sortType;
      }
    },
    /**
     * Sets active plan details tab value
     *
     * @param {ActivePlanDetailsTab} val
     * @returns {void}
     */
    setActivePlanDetailsTab(val: ActivePlanDetailsTab): void {
      this.activePlanDetailsTab = val;
    },
    /**
     * Set Modal Current State
     *
     * @param {boolean} modalState
     * @returns {void}
     */
    setModalCurrentState(modalState: boolean): void {
      this.modalOpen = modalState;
    },
    /**
     * Set Plan Code for Modal to Display
     *
     * @param {string} planCode
     * @returns {void}
     */
    setPlanCodeForModal(planCode: string): void {
      this.planToDisplayInModal = planCode;
    },
    setScrollToPlanDetailSection(section: string | null): void {
      this.scrollToPlanDetailSection = section;
    },
    /**
     * Update option in store and update cost.
     *
     * @param {string} planCode
     * @param {string} optionKey
     * @param {string | number} optionVal
     * @param {boolean} optionState
     */
    updateOption(
      planCode: string,
      optionKey: string,
      optionVal: string | number,
      optionState: boolean,
      omitEventCall = false
    ): void {
      const currentOptions = Object.entries(
        this.plans[planCode].options[optionKey].values
      );

      // Return early if option is already selected.
      // (this occurs if someone selects CFAR via PBM/Plan Details and then adds a CFAR filter)
      if (
        this.plans[planCode].options[optionKey].values[optionVal].selected ===
        optionState
      ) {
        return;
      }

      if (!omitEventCall) {
        const isComparePage = window.location.pathname.includes('compare');
        const contentStore = useContentStore();
        const sessionStore = useUserSessionStore();

        const label =
          contentStore.isOptionAnOptionalCoverage(optionKey) ||
          optionKey === 'deductible'
            ? displayAdditionalOptionLabel(
                planCode,
                optionKey,
                this.plans[planCode].options[optionKey].values[optionVal].cost,
                String(optionVal),
                this.plans[planCode].options[optionKey].displayName
              )
            : displayLabel(
                contentStore,
                sessionStore,
                planCode,
                String(optionVal),
                this.plans[planCode].options[optionKey].values[optionVal].cost,
                this.plans[planCode].options[optionKey].displayName,
                optionKey
              );

        event('plan_action_plan_details_modal', {
          hierarchical_layer_1: 'Optional Coverages Clicked',
          hierarchical_layer_2: `Plan Code ${planCode}`,
          hierarchical_layer_3: `${optionKey} | ${label} | ${optionState}`,
          hierarchical_layer_4: isComparePage
            ? 'Compare Page'
            : 'Quote Results Page',
        } as GAObject);
      }

      this.addPlanCodeForRequote(planCode);

      if (currentOptions.length > 1) {
        currentOptions.forEach(([key, val]) => {
          if (val.selected && optionState && key !== optionKey) {
            this.plans[planCode].options[optionKey].values[key].selected =
              false;
            this.plans[planCode].currentCost.base -=
              this.plans[planCode].options[optionKey].values[key].cost;
          }
        });
      }

      if (!optionState) {
        this.plans[planCode].options[optionKey].values[optionVal].selected =
          false;
        this.plans[planCode].currentCost.base -=
          this.plans[planCode].options[optionKey].values[optionVal].cost;
      } else {
        this.plans[planCode].options[optionKey].values[optionVal].selected =
          true;
        this.plans[planCode].currentCost.base +=
          this.plans[planCode].options[optionKey].values[optionVal].cost;
      }

      // Because these plans have options that are dynamic... unfortunately.
      // Let's just make it so we requote whenever these options are updated on these plans.
      // Just to add... I hate this.
      if (
        (['IMTAEA', 'IMTAED'].includes(planCode) &&
          ['cancelForAnyReason', 'interruptionForAnyReason'].includes(
            optionKey
          )) ||
        'NWAPDPIMT' === planCode
      ) {
        this.setPlanParameters();
      }
    },
    /**
     * Sets PBM Current State
     *
     * @param {boolean} open
     */
    setPBMCurrentState(open: boolean): void {
      this.pbmOpen = open;
    },
    /**
     * Sets Pre Buy Modal plan.
     *
     * @param {QuoteResult | null} plan
     */
    setPBMPlan(planCode: string) {
      this.pbmPlanCode = planCode;
    },
    /**
     * Sets validation status for clickthroughs.
     *
     * @param {Boolean} val
     */
    setClickThroughValidation(val: boolean) {
      this.clickThroughValid = val;
    },
    /**
     * Sets the tool tip id.
     *
     * @param {string|null} val
     */
    setFilterToolTipId(val: string) {
      this.filterToolTipId = val;
    },
    /**
     * Sets the tool tip modal status
     *
     * @param {boolean} val
     */
    setFilterToolTipModalOpen(val: boolean) {
      this.filterToolTipOpen = val;
    },
    /**
     * Sets the tool tip modal status
     *
     * @param {boolean} val
     */
    setFilterToolTipModalPlanShow(val: boolean) {
      this.filterToolTipPlanShow = val;
    },
    /**
     * Sets the tool tip modal status
     *
     * @param {boolean} val
     */
    setMobileFilterModalOpen(val: boolean) {
      this.mobileFilterModalOpen = val;
    },
    /**
     * Sets the edit trip details modal status
     *
     * @param {boolean} val
     */
    setEditTripModalIsOpen(val: boolean) {
      this.editTripModalIsOpen = val;
    },
    /**
     * Sets the additional details modal status
     *
     * @param {boolean} val
     */
    setAdditionalDetailsModal(val: boolean) {
      this.additionalDetailsModalOpen = val;
    },
    /**
     * Sets the cfar details modal status
     *
     * @param {boolean} val
     */
    setCfarDetailsModal(val: boolean) {
      this.cfarDetailsModalOpen = val;
    },
    /**
     * Sets the plan tag modal status
     *
     * @param {boolean} val
     */
    setPlanTagModalOpen(val: boolean) {
      this.planTagModalOpen = val;
    },
    /**
     * Sets the plan tag id.
     *
     * @param {string|null} val
     */
    setPlanTagId(val: string) {
      this.planTagId = val;
    },
    /**
     * Sets the firstName for emailQuote object
     *
     * @param {string|null} name
     */
    setEmailAQuoteFirstName(name: string | null) {
      this.emailAQuote.firstName = name;
    },
    /**
     * Sets the lastName for emailQuote object
     *
     * @param {string|null} name
     */
    setEmailAQuoteLastName(name: string | null) {
      this.emailAQuote.lastName = name;
    },
    /**
     * Sets the email for emailQuote object
     *
     * @param {string|null} email
     */
    setEmailAQuoteEmail(email: string | null) {
      this.emailAQuote.email = email;
    },
    /**
     * Sets the message for emailQuote object
     *
     * @param {string} message
     */
    setEmailAQuoteMessage(message: string) {
      this.emailAQuote.message = message;
    },
    /**
     * Sets the friendsEmail for emailQuote object
     *
     * @param {string|null} friendsEmail
     */
    setEmailAQuoteFriendsEmail(friendsEmail: string[]) {
      this.emailAQuote.friendsEmail = friendsEmail;
    },
    /**
     * Sets the marketingOptIn for emailQuote object
     *
     * @param {boolean} val
     */
    setEmailAQuoteMarketingOptIn(val: boolean) {
      this.emailAQuote.marketingOptin = val;
    },
    /**
     * Sets the quoteUrl for emailQuote object
     * @param {string} val
     */
    setEmailAQuoteUrl(val: string) {
      this.emailAQuote.quoteUrl = val;
    },
    setEmailAQuotePlans(plans: object[]) {
      this.emailAQuote.plans = plans;
    },
    /**
     * Add Plan Code to our Array of plans to requote.
     *
     * @param {string} planCode
     * @returns {void}
     */
    addPlanCodeForRequote(planCode: string): void {
      this.plansToRequote.push(planCode);
    },
    /**
     * Set Plan Parameters
     *
     * @returns {Promise<void>}
     */
    async setPlanParameters(silentQuote: boolean = false): Promise<void> {
      if (this.plansToRequote.length === 0) return;
      this.setArePlansUpdating(true);
      const apiStore = useApiStore();
      apiStore.setSilentQuote(silentQuote);
      for (const code of this.plansToRequote) {
        this.planParameters = handlePlanParameters(
          code,
          this.planParameters,
          this.plans
        );
      }

      await apiStore.createQuote();
      this.planParameters = [];
      this.plansUpdating = false;
      apiStore.setSilentQuote(false);
    },
    /**
     * Create a silent quote update without triggering loading state or events
     *
     */
    async silentQuoteUpdate() {
      const apiStore = useApiStore();
      apiStore.setSilentQuote(true);
      await apiStore.createQuote();
      this.planParameters = [];
      this.plansUpdating = false;
      apiStore.setSilentQuote(false);
    },
    /**
     *
     * Adds a filter
     *
     * @param {string} val
     */
    addFilter(val: string) {
      this.filters.push(val);
    },
    /**
     * Removes a filter
     *
     * @param {string} val
     */
    removeFilter(val: string) {
      this.filters = this.filters.filter((filter: string) => filter !== val);
    },
    /**
     * Resets filters
     *
     */
    resetFilters() {
      const themeStore = useThemeStore();
      if (themeStore.isThemeSoventure) {
        this.filters = ['medical-0', 'emergencyMedicalEvacuation-0'];
      } else {
        this.filters = ['medical-0', 'emergencyMedicalEvacuation-0'];
      }
    },
    /**
     * Sets the number of filter plans.
     *
     * @param {number} val
     */
    setNumberOfFilterPlans(val: number) {
      this.numberOfFilterPlans = val;
    },
    /**
     * Sets a list of plan code's CFAR value <'50','75'>
     * to a specific val <true/false>. The CFAR value will
     * be the lowest optional coverage.
     *
     * @param {string[]} planCodes
     * @param {boolean} val
     */
    setPlanCFAR(planCodes: string[], val: boolean) {
      planCodes.forEach((planCode: string) => {
        const options = this.getOptionsOfSelectedPlan(planCode);
        const optionKey = getOptionKeyFromCoverageMap(
          'cancelForAnyReasonOption',
          options
        );
        if (optionKey !== null) {
          const value = Object.keys(options[optionKey].values)[0];
          this.updateOption(planCode, optionKey, value, val, true);
        }
      });
    },
    /**
     * Sets a list of plan code's Rental Car Value On
     *
     * @param {string[]} planCodes
     * @param {void}
     */
    setPlanRentalCar(planCodes: string[], val: boolean): void {
      planCodes.forEach((planCode: string) => {
        const options = this.getOptionsOfSelectedPlan(planCode);
        if (Object.keys(options).includes('rentalCar')) {
          this.updateOption(planCode, 'rentalCar', 'on', val);
        }
      });
    },
    /**
     * Sets a list of plan code's Adventure Sports Value On
     *
     * @param {string[]} planCodes
     * @param {void}
     */
    setPlanAdventureSports(planCodes: string[], val: boolean): void {
      const optionKey = 'adventureSportsRider';
      const optionVal = 'on';
      const apiStore = useApiStore();
      planCodes.forEach((planCode: string) => {
        const options = this.getOptionsOfSelectedPlan(planCode);
        if (Object.keys(options).includes('adventureSportsRider')) {
          const getLabel = displayAdditionalOptionLabel(
            planCode,
            optionKey,
            null,
            String(optionVal),
            this.plans[planCode].options[optionKey].displayName
          );
          apiStore.addIncludedBenefit(
            planCode,
            getLabel.includes('Adventure Sports')
              ? getLabel
              : `Adventure Sports - ${getLabel}`
          );
          this.updateOption(planCode, 'adventureSportsRider', 'on', val);
        }
      });
    },
    /**
     * Sets a list of plan code's Search and Rescue Value On
     *
     * @param {string[]} planCodes
     * @param {boolean} val
     * @returns {void}
     */
    setPlanSearchAndRescue(planCodes: string[], val: boolean): void {
      planCodes.forEach((planCode: string) => {
        const options = this.getOptionsOfSelectedPlan(planCode);
        // In this case, we need to select Adventure Sports Rider for TXADV and TXULT
        // to get the benefit of Search and Rescue
        if (
          ['TXADV', 'TXULT'].includes(planCode) &&
          Object.keys(options).includes('adventureSportsRider')
        ) {
          this.updateOption(planCode, 'adventureSportsRider', 'on', val);
        }
        if (Object.keys(options).includes('searchAndRescue')) {
          this.updateOption(planCode, 'searchAndRescue', 'on', val);
        }
      });
    },
    /**
     * Sets a list of plan code's Hospital of Choice Value On
     *
     * @param {string[]} planCodes
     * @param {boolean} val
     * @returns {void}
     */
    setPlanHospitalOfChoice(planCodes: string[], val: boolean): void {
      planCodes.forEach((planCode: string) => {
        const options = this.getOptionsOfSelectedPlan(planCode);
        if (Object.keys(options).includes('hospitalOfChoice')) {
          this.updateOption(planCode, 'hospitalOfChoice', 'on', val);
        }
      });
    },
    /**
     * Set Error Modal State
     *
     * @param {boolean} modalState
     * @returns {void}
     */
    setErrorModalState(modalState: ErrorModalTypes): void {
      this.errorModalType = modalState;
    },
    /**
     * Sets isSMView boolean.
     *
     * @param val
     */
    setIsSM(val: boolean) {
      this.isSMView = val;
    },
    /**
     * Sets isMobile boolean.
     *
     * @param val
     */
    setIsMobile(val: boolean) {
      this.isMobile = val;
    },
    /**
     * Sets isLGView boolean.
     *
     * @param val
     */
    setIsLG(val: boolean) {
      this.isLGView = val;
    },
    /**
     * Sets status of tool tip modal.
     * @param val
     */
    setSecondaryToolTipModal(val: boolean) {
      this.secondaryToolTipModal = val;
    },
    /**
     * Sets plan codes to quote for SoVenture
     *
     * @param {string[]} planCodes
     */
    setPlanCodesForSoVenture(planCodes: string[]) {
      this.soventurePlanCodes = planCodes;
    },
    /**
     * Sets plans to hide plan tag for SoVenture
     *
     * @param {string[]} planCodes
     */
    setSoventureHiddenPlanTagPlans(planCodes: string[]) {
      this.soventureHiddenTagPlans = planCodes;
    },
    setArePlansUpdating(val: State['plansUpdating']) {
      if (val) {
        this.setLoaderKey(LOADER_KEYS.QR_UPDATE);
      }
      this.plansUpdating = val;
    },
    setMovingToPurchase(val: State['movingToPurchase']) {
      const apiStore = useApiStore();
      if (val) {
        apiStore.setLoaderState(true);
        this.setLoaderKey(LOADER_KEYS.QR_TO_BUY);
      } else {
        apiStore.setLoaderState(false);
      }

      this.movingToPurchase = val;
    },
    setCoveredActivitiesModalOpen(val: boolean) {
      this.coveredActivitiesModalOpen = val;
    },
    reorderCoveredActivities(filterKey: string, action: 'add' | 'remove') {
      if (action === 'add') {
        // Add to the front if not already present
        if (!this.orderedCoveredActivities.includes(filterKey)) {
          this.orderedCoveredActivities.unshift(filterKey);
        }
      } else {
        // Remove if present
        this.orderedCoveredActivities = this.orderedCoveredActivities.filter(
          (key) => key !== filterKey
        );
      }
    },
    setLoaderKey(key: string) {
      this.loaderKey = key;
    },
    setAnnualEligibilityModalOpen(val: boolean) {
      this.annualEligibilityModalOpen = val;
    },
    setMoreInfoModalOpen(val: boolean) {
      this.moreInfoModalOpen = val;
    },
    setMoreInfoModalKey(key: string) {
      this.moreInfoModalKey = key;
    },
    setHideSoventureUpdateTripCost(val: boolean) {
      this.hideSoventureUpdateTripCost = val;
    },
    setAvailabilityModalOpen(val: boolean) {
      this.availabilityModalOpen = val;
    },
    /**
     * Toggles a section's open/closed state
     *
     * @param {string} header
     */
    toggleSection(header: string, planCode: string): void {
      const currentValue =
        (this.sectionOpenStates[planCode] &&
          this.sectionOpenStates[planCode][header]) ??
        false;
      if (this.sectionOpenStates[planCode]) {
        this.sectionOpenStates[planCode][header] = !currentValue;
      } else {
        this.sectionOpenStates[planCode] = { [header]: !currentValue };
      }
    },
    /**
     * Initializes section states, setting Medical and Trip Protection as open by default
     *
     * @param {string[]} sectionHeaders
     */
    initializeSectionStates(sectionHeaders: string[], planCode: string): void {
      // Initialize the planCode object if it doesn't exist
      if (!(planCode in this.sectionOpenStates)) {
        this.sectionOpenStates[planCode] = {};
      }

      sectionHeaders.forEach((header) => {
        // Only initialize if not already set
        if (this.sectionOpenStates[planCode][header] === undefined) {
          if (header === 'Medical' || header === 'Trip Protection') {
            this.sectionOpenStates[planCode][header] = true;
          } else {
            this.sectionOpenStates[planCode][header] = false;
          }
        }
      });
    },

    // When a user is opening the plan row drawer, this is helping determine which plan we are scrolling to for our list of benefits/activities
    setScrollPlanCode(planCode: string): void {
      this.scrollPlanCode = planCode;
    },
  },
});
