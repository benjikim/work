import { useApiStore } from '@/store/api';
import { useUserSessionStore } from '@/store/userSession';
import { useContentStore } from '@/store/content';
import {
  QuoteResult,
  ContentStore,
  UserSessionStore,
  LTCMessage,
  FormattedOption,
  PlanParamOption,
  Filters,
  QuoteResultsPlan,
  CoverageDetail,
  TrustFactor,
  LoaderData,
  PlanTagModalStore,
  PlanTagData,
  PlanTagDataStore,
  PlanRowMarkerType,
  PlanParameter,
  UserPlan,
} from '@/types';
import dayjs from 'dayjs';
import axios, { AxiosError } from 'axios';
import { API_ENDPOINTS } from '@/config';
import { CoverageItem } from '@/types';
import { event } from 'vue-gtag';
import { useThemeStore } from '@/store/theme';

/**
 * Helper function to Format Currency
 *
 * @param {string} value
 * @param {number|undefined} maximumFractionDigits
 * @returns string
 */
export function formatCurrency(
  value: string | false | number,
  maximumFractionDigits: number | undefined
) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: maximumFractionDigits,
  }).format(Number(value));
}

/**
 * Generate a random number between min and max with specified decimal places
 * @param {number} min
 * @param {number} max
 * @param {number} decimalPlaces - The number of decimal places
 * @returns {number} - The generated random number
 */
export function getRandomNumber(
  min: number,
  max: number,
  decimalPlaces: number = 0
) {
  const random = Math.random() * (max - min) + min;
  return parseFloat(random.toFixed(decimalPlaces));
}

/**
 * Returns key by first value of map.
 *
 * @param {any} obj
 * @param {any} value
 * @returns {string | null}
 */
export function findKeyByValue(obj: any, value: any): string | null {
  for (const key in obj) {
    if (obj[key] === value) {
      return key;
    }
  }

  return null;
}

/**
 * Checks to see if string is numeric.
 *
 * @param {string} str
 * @returns {boolean}
 */
export function isNumeric(str: string) {
  if (typeof str !== 'string') return false; // we only process strings!
  return !isNaN(Number(str)) && !isNaN(parseFloat(str));
}
/**
 * Helper method to see if string has a number
 * @param {string} str
 * @returns {boolean}
 */
export function hasNumber(str: string): boolean {
  return /\d/.test(str);
}

/**
 * Helper method that extracts currency
 * @param {string} str
 * @returns {string}
 */
export function extractCurrency(str: string): string {
  const match = str.match(/\$[\d,]+(\.\d+)?/);
  return match ? match[0] : '-';
}

/**
 * Gets all coverage data details and flatten / joins
 *
 * @param {QuoteResult} plan
 * @param {string} coverageId
 * @returns {string[]}
 */
export function getCoverageDataDetails(
  plan: QuoteResult,
  coverageId: string
): string[] {
  const currentCoverage = plan.coverages.find(
    (coverage) => coverage.id === coverageId
  );

  // Retrieve the specific coverage details
  const coverageDetails = currentCoverage?.details || [];
  // Flatten and join object values into strings
  const joinedDetails = coverageDetails.flatMap((detail) =>
    Object.values(detail).join(' ')
  );

  return joinedDetails;
}

/**
 * Gets coverage details
 *
 * @param {QuoteResult} plan
 * @param {string} coverageId
 * @returns {CoverageDetail[]}
 */
export function getCoverageDetails(
  plan: QuoteResult,
  coverageId: string
): CoverageDetail[] {
  const currentCoverage = plan.coverages.find(
    (coverage) => coverage.id === coverageId
  );

  return currentCoverage?.details || [];
}

/**
 * Returns coverage data of first details.
 * This is used to reduce coverages to a single line of text.
 * @param {QuoteResult} plan
 * @param {string} coverageId
 * @returns string
 */
export function getPlanRowCoverageDisplay(
  plan: QuoteResult,
  coverageId: string
): string {
  const details = getCoverageDataDetails(plan, coverageId);
  if (coverageId === 'emergencyMedicalEvacuation') {
    // Some coverages has a value of non numeric, f.e. 'Unlimited'
    if (!hasNumber(details[0])) {
      return details[0];
    }
    return extractCurrency(details[0]);
  }
  return details[0];
}

/**
 * Checks to see if there are multiple medical options
 * @param {string} planCode
 * @returns {boolean}
 */
export function areThereMultipleMedicalOptions(planCode: string): boolean {
  const userSession = useUserSessionStore();
  const planOptions = userSession.getOptionsOfSelectedPlan(planCode);
  const medicalOptions = planOptions?.medical;
  return medicalOptions && Object.keys(medicalOptions.values).length > 1;
}

/**
 * Checks to see if accidental death contains flight only.
 * @param {string} planCode
 * @returns {boolean}
 */
export function isPlanFlightOnly(planCode: string): boolean {
  const userSession = useUserSessionStore();
  const coverages = userSession.getCoveragesOfSelectedPlan(planCode);
  return (
    coverages?.hasOwnProperty('accidentalDeathFlight') &&
    !coverages?.hasOwnProperty('accidentalDeath24Hour') &&
    !coverages?.hasOwnProperty('accidentalDeathCommonCarrier') &&
    !coverages?.hasOwnProperty('accidentalDeathRider')
  );
}

/**
 * Checks to see if plan has any type of accidental death.
 *
 * @param {string} planCode
 * @returns {boolean}
 */
export function areADDOptionsAvailable(planCode: string): boolean {
  const sessionStore = useUserSessionStore();
  const options = sessionStore.getOptionsOfSelectedPlan(planCode);
  return (
    options.hasOwnProperty('accidentalDeathFlight') ||
    options.hasOwnProperty('accidentalDeath24Hour') ||
    options.hasOwnProperty('accidentalDeathRider') ||
    options.hasOwnProperty('accidentalDeathUpgrade')
  );
}

/**
 * Get Grid Coverage Content
 *
 * @param plan QuoteResult
 * @param coverageId string
 * @returns string
 */
export function getCoverageData(plan: QuoteResult, coverageId: string): string {
  const currentCoverage = plan.coverages.find(
    (coverage) => coverage.id === coverageId
  );

  // Retrieve the specific coverage details
  const coverageDetails = currentCoverage?.details || [];

  // Flatten and join object values into strings
  const joinedDetails = coverageDetails.flatMap((detail) =>
    Object.values(detail).join(' ')
  );

  // Concatenate the details with '<br>' between them
  const formattedDetails = joinedDetails.reduce((acc, item, index) => {
    let separator;

    if (index >= 0) {
      item = `${item}`;
    }

    if (
      index < joinedDetails.length - 1 &&
      ['baggage', 'baggageDelay', 'travelDelay'].includes(coverageId)
    ) {
      separator = ' / ';
    } else if (index < joinedDetails.length - 1) {
      separator = '<br>';
    } else {
      separator = ' ';
    }

    return acc + item + separator;
  }, '');

  // Provide a fallback if no details are found
  return formattedDetails;
}

/**
 * A helper method to determine the displayed label for option.
 *
 * @param {FormattedOptionValue} option
 * @param {string} displayName
 */
export function displayLabel(
  contentStore: ContentStore,
  sessionStore: UserSessionStore,
  planCode: string,
  value: string,
  cost: number,
  displayName: string,
  optionId: string
) {
  const coverageOptionMap = contentStore.getCoverageOptionMap;
  let label = `${displayName} (${formatCurrency(cost, 2)})`;

  const coverageKey = coverageOptionMap[optionId] ?? optionId;

  if (coverageKey) {
    const coverage = sessionStore.getPlanCoverageByKey(planCode, coverageKey);
    // Check the actual value of the option.
    // If the option value does not exist in limits result to [0] index.
    if (value === 'on') {
      if (coverage.details.length > 0) {
        label = `${coverage.details[0].value} ${coverage.details[0].description} (+${formatCurrency(cost, 2)})`;
      }
    } else if (coverage.details.length > 0) {
      const curr = coverage?.details.find(
        (element) => element?.optionKey === optionId + '.' + value
      );

      if (curr != undefined) {
        label = `${curr?.value} ${curr?.description} (${formatCurrency(cost, 2)})`;
      }
    }
  } else if (isNumeric(value)) {
    label = `${formatCurrency(value, 0)} (${formatCurrency(cost, 2)})`;
  } else if (value === 'off') {
    label = `Off (${formatCurrency(cost, 2)})`;
  }
  return label;
}

/**
 * Display the additional option label
 * @param planCode string
 * @param optionId string
 * @param cost number
 * @param value string | number
 * @param displayName string
 * @returns string
 */
export function displayAdditionalOptionLabel(
  planCode: string,
  optionId: string,
  cost: number | null,
  value: string | number,
  displayName: string
) {
  const apiStore = useApiStore();
  const optionLabels = apiStore.getPlanByPlanCode(planCode);
  const additionalOptions = optionLabels?.additionalOptions;
  const currentOption = additionalOptions?.details.find(
    (element: CoverageDetail) => element?.optionKey === optionId + '.' + value
  );
  if (currentOption != undefined) {
    return `${currentOption?.value} ${currentOption?.description} ${cost !== null ? `(${formatCurrency(cost, 2)})` : ''}`;
  } else {
    return `${displayName} ${cost !== null ? `(${formatCurrency(cost, 2)})` : ''}`;
  }
}

/**
 * Get Options In Key Value Format to be sent for Requote or creating a product
 * for an Order.
 *
 * @param {FormattedOption} options
 * @param {boolean} isIdSetAsKey
 * @returns {PlanParamOption}
 */
export function getOptionsInKeyValueFormat(
  options: FormattedOption,
  isIdSetAsKey: boolean = false
): PlanParamOption[] {
  const selectedOptions: PlanParamOption[] = [];

  Object.keys(options).forEach((optionKey) => {
    Object.entries(options[optionKey].values).forEach(([valueKey, value]) => {
      if (value.selected) {
        // This is silly but when we add options to a product, we need them as
        // key. When we are generating a new quote, the 'key' needs to be called id.
        if (isIdSetAsKey) {
          selectedOptions.push({ key: optionKey, value: valueKey });
        } else {
          selectedOptions.push({ id: optionKey, value: valueKey });
        }
      }
    });
  });

  return selectedOptions;
}

/**
 * Used to get LTC messages depending on messages
 *
 * @param {string[]} coverages
 * @param {QuoteResult} plan
 * @returns {LTCMessage | undefined}
 */
export function getCoverageLTCMessage(
  coverages: string[],
  plan: QuoteResult
): LTCMessage | undefined {
  const ltcItems = plan?.ltc?.filter((element) =>
    coverages?.some((coverage) => element?.message.includes(coverage))
  );

  return ltcItems != undefined && ltcItems.length > 0 ? ltcItems[0] : undefined;
}

/**
 * Format Date to use the Start of the date that has been passed in
 * This resolves any potential issues with dates
 *
 * @param {dateToFormat} string
 * @returns string
 */
export const formatDate = (dateToFormat: string): string => {
  return dayjs(dateToFormat).startOf('date').format();
};

/**
 * Helper function to display a given date to the user.
 *
 * @param {dateToDisplay} string
 * @returns string
 */
export const displayDate = (dateToDisplay: string): string => {
  const formattedDate = formatDate(dateToDisplay);

  const dateObj = new Date(formattedDate);

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Gets the intersection between to string arrays.
 *
 * @param {string[]} array1
 * @param {string[]} array2
 * @returns {string[]}
 */
export function intersect(array1: string[], array2: string[]) {
  return array1.filter(Set.prototype.has, new Set(array2));
}

const coverageToOptionMap: { [key: string]: string[] } = {
  cancelForAnyReasonOption: ['cancelForAnyReason', 'cancelForFortuitousReason'],
  tripInterruptionForAnyReason: [
    'interruptionForAnyReason',
    'interruptionForFortuitousReason',
  ],
};
/**
 * Gets an option key from coverage map.
 * We have different option keys for certain coverages
 * and this method gets the correct option key.
 *
 * @param {string} coverageKey
 * @param {FormattedOption | undefined} options
 * @returns {null|string}
 */
export function getOptionKeyFromCoverageMap(
  coverageKey: string,
  options: FormattedOption | undefined
) {
  const optionKeys = coverageToOptionMap[coverageKey];

  if (!optionKeys || !options) {
    return null;
  }

  for (const key of Object.keys(options)) {
    if (optionKeys.includes(key)) {
      return key;
    }
  }

  return null;
}

/**
 * Formats our ITP value to yyyy-MM-dd
 * @param dateString
 * @returns {string}
 */
export function formatItp(dateString: string): string {
  const date = new Date(dateString);
  const formattedDate = date.toISOString().split('T')[0];

  return formattedDate;
}

/**
 * Removes HTML tags from a string.
 *
 * @param str
 * @returns {string}
 */
export function removeHTMLTags(str: string) {
  return str.replace(/<\/?[^>]+(>|$)/g, '');
}

/**
 *
 * Helper Functions for Filtering Plans
 *
 */

export function sortBasedOnUserSelection(
  a: QuoteResult,
  b: QuoteResult,
  sortSelection: string
) {
  const userSession = useUserSessionStore();

  const productA = userSession.getCurrentPlanCostUnformatted(a.code);
  const productB = userSession.getCurrentPlanCostUnformatted(b.code);

  if (sortSelection === 'price-high') {
    return productB - productA;
  } else if (sortSelection === 'price-low') {
    return productA - productB;
  } else {
    return a.popularityRank - b.popularityRank;
  }
}

/**
 * Process filters to plans.
 *
 * @param {string[]} selectedFilters
 * @param {QuoteResults[]} plans
 * @param {Filters} productFilters
 */
export function handleFilters(
  selectedFilters: string[],
  plans: QuoteResult[],
  productFilters: Filters
) {
  const userSession = useUserSessionStore();
  const themeStore = useThemeStore();
  const apiStore = useApiStore();

  const plansToBeShown = [] as QuoteResultsPlan[];
  const listOfPlansIndex = {} as { [key: string]: number };

  const plansFullyLoaded = apiStore.getPlansFullyLoadedStatus;
  plans.forEach((ele, index) => {
    const temp = ele as QuoteResultsPlan;
    temp.showPlan = !plansFullyLoaded ? true : false;
    plansToBeShown.push(temp);
    listOfPlansIndex[temp.code] = index;
  });

  if (!plansFullyLoaded) {
    return plansToBeShown;
  }

  // If product filters is empty there are no plans.
  if (Object.keys(productFilters).length === 0) {
    return [];
  }

  // Create an array of strings of plan codes
  // for each filter in user session.
  // f.e. [['aigd', 'tifpax'], ['aigd']]
  let arr = [] as string[][];
  const providerFiltersArr = [] as string[][];
  const tripInterruptionFiltersArr = [] as string[][];

  const filterMap: Record<string, string[][]> = {
    medical: [],
    emergencyMedicalEvacuation: [],
    travelDelay: [],
    tripInterruption: [],
    baggage: [],
  };

  selectedFilters.forEach((filter: string) => {
    const [category] = filter.split('-');
    const filterValues = Array.from(productFilters[filter]);

    if (filter.split('-')[0] === 'provider') {
      // Storing all provider filter into multi dimensional array.
      providerFiltersArr.push(Array.from(productFilters[filter]));
      return;
    }

    if (
      !themeStore.isThemeSoventure &&
      window.location.pathname.includes('/QRPOCCopy') &&
      category === 'tripInterruption'
    ) {
      tripInterruptionFiltersArr.push(filterValues);
      return;
    }

    // We want to be able to multi select all out filters for soventure, store them in multidimensional array
    if (themeStore.isThemeSoventure) {
      const targetFilterArray = filterMap[category];
      if (targetFilterArray) {
        targetFilterArray.push(filterValues);
        return;
      }
    }

    if (filter in productFilters) {
      arr.push(Array.from(productFilters[filter]));
    }
  });

  // Join all provider filter into arr since these can be multi selected.
  if (providerFiltersArr.length > 0) {
    arr.push(providerFiltersArr.reduce((acc, val) => acc.concat(val), []));
  }

  if (tripInterruptionFiltersArr.length > 0) {
    arr.push(
      tripInterruptionFiltersArr.reduce(
        (acc, val) => acc.concat(val),
        [] as string[]
      )
    );
  }

  if (themeStore.isThemeSoventure) {
    Object.values(filterMap)
      .filter((group) => group.length)
      .forEach((group) => arr.push(group.flat()));
  }

  // This loops through the array and
  // gets the intersection between them.
  let setFilters = arr[0];
  while (arr.length > 1) {
    const lastSet = arr.pop() as string[];
    setFilters = intersect(setFilters, lastSet);
  }

  setFilters.forEach((planCode: string) => {
    const index = listOfPlansIndex[planCode];

    if (index !== undefined) {
      plansToBeShown[index].showPlan = true;
    }
  });

  userSession.setNumberOfFilterPlans(setFilters.length);
  return plansToBeShown;
}

export function getShownPlans() {
  const apiStore = useApiStore();
  const userSession = useUserSessionStore();
  const themeStore = useThemeStore();
  const products = JSON.parse(
    JSON.stringify(apiStore.getQuoteResults?.products)
  );
  const selectedFilters = JSON.parse(
    JSON.stringify(userSession.getSelectedFilters)
  );
  const productFilters = apiStore.getFilters;
  const sortSelection = userSession.getSortSelection;

  const availablePlans = products?.filter(
    (plan: any) => plan.available === true
  );
  const filteredPlans = handleFilters(
    selectedFilters,
    availablePlans,
    productFilters
  );
  let sortedPlans = filteredPlans.sort((a, b) =>
    sortBasedOnUserSelection(a, b, sortSelection)
  );

  if (themeStore.isThemeIMT && !isInternal() && sortSelection === 'popular') {
    const isLuxuryPlansAbTestEnabled = apiStore.getFFValue(
      'sb_20250805_insuremytrip_enable_luxury_ab_test_us_release'
    );

    if (!isLuxuryPlansAbTestEnabled) {
      return sortedPlans;
    }

    const areLuxuryPlansHighlighted = apiStore.getFFValue(
      'sb_20250805_insuremytrip_luxury_plans_ab_test_us_release'
    );

    if (areLuxuryPlansHighlighted) {
      event('ab_test_variant_for_luxury_plans', {
        test_name: 'sb_20250805_insuremytrip_luxury_plans_ab_test_us_release',
        variant_name: 'variant',
        value: areLuxuryPlansHighlighted,
      });
    } else {
      event('ab_test_control_for_luxury_plans', {
        test_name: 'sb_20250805_insuremytrip_luxury_plans_ab_test_us_release',
        variant_name: 'control',
        value: areLuxuryPlansHighlighted,
      });
    }

    if (areLuxuryPlansHighlighted) {
      const luxuryPlanCodes = apiStore.getFFValue(
        'sb_20250805_insuremytrip_luxury_plan_codes_us_release'
      );
      // if luxury plans are enabled, ensure the luxury plans are at the top of the list
      if (luxuryPlanCodes !== '' && typeof luxuryPlanCodes === 'string') {
        const luxuryPlans = sortedPlans.filter((plan) =>
          luxuryPlanCodes.includes(plan.code)
        );

        if (luxuryPlans.length === 0) {
          return sortedPlans;
        }

        sortedPlans = [
          ...luxuryPlans,
          ...sortedPlans.filter((plan) => !luxuryPlans.includes(plan)),
        ];
      }
    }
  }

  return sortedPlans;
}

export function getNumberOfPlans(filterKey: string) {
  const apiStore = useApiStore();
  const sessionStore = useUserSessionStore();
  let selectedFilters = [...sessionStore.getSelectedFilters];
  const productFilters = apiStore.getFilters;

  // Things might be loading still so just we shouldn't display yet.
  if (Object.keys(productFilters).length === 0) {
    return '';
  }

  // If plan is selected we do not show.
  if (selectedFilters.includes(filterKey)) {
    return '';
  }

  // If default filters are selected, show filter amount form store.
  if (
    selectedFilters.length === 2 &&
    selectedFilters.includes('emergencyMedicalEvacuation-0') &&
    selectedFilters.includes('medical-0')
  ) {
    return `${productFilters[filterKey]?.size} plans`;
  }

  // For our multi-select categories, filter out plans that share the same category when displaying our number of plans
  // This will show the number of plans that fit a specific filter
  const filterCategory = filterKey.split('-')[0];
  if (
    [
      'medical',
      'emergencyMedicalEvacuation',
      'travelDelay',
      'tripInterruption',
      'baggage',
    ].includes(filterCategory)
  ) {
    selectedFilters = selectedFilters.filter(
      (key) => key.split('-')[0] !== filterCategory
    );
  }

  const filterMap: Record<string, string[][]> = {
    medical: [],
    emergencyMedicalEvacuation: [],
    travelDelay: [],
    tripInterruption: [],
    baggage: [],
  };

  selectedFilters.push(filterKey);

  let arr = [] as string[][];

  selectedFilters.forEach((filter: string) => {
    const [category] = filter.split('-');
    const filterValues = Array.from(productFilters[filter]);

    // Join all filters into one since these can be multi selected
    const targetFilterArray = filterMap[category];
    if (targetFilterArray) {
      targetFilterArray.push(filterValues);
      return;
    }

    if (filter in productFilters) {
      arr.push(Array.from(productFilters[filter]));
    }
  });

  // Join all filters into arr since these can be multi selected.
  Object.values(filterMap)
    .filter((group) => group.length)
    .forEach((group) => arr.push(group.flat()));

  // This loops through the array and
  // gets the intersection between them.
  let setFilters = arr[0];
  while (arr.length > 1) {
    const lastSet = arr.pop() as string[];
    setFilters = intersect(setFilters, lastSet);
  }

  return `${setFilters.length} plans`;
}

/**
 * Checks if submitted date is during the holiday season
 *
 * @param date
 * @returns {Boolean}
 */
export function isDuringHolidaySeason(date: string) {
  const dateOfTrip = new Date(date + 'T00:00:00');

  // Start (January 1) and end (March 31) of the date range
  const yearOfDate = dateOfTrip.getFullYear();
  const startDate = new Date(`${yearOfDate}-01-01T00:00:00`);
  const endDate = new Date(`${yearOfDate}-03-31T23:59:59`);

  return dateOfTrip >= startDate && dateOfTrip <= endDate;
}

/**
 * Checks if submitted date is during the hurricane season
 *
 * @param date
 * @returns {Boolean}
 */
export function isDuringHurricaneSeason(date: string) {
  const dateOfTrip = new Date(date + 'T00:00:00');

  // Start (June 1) and end (November 30) of the date range
  const yearOfDate = dateOfTrip.getFullYear();
  const startDate = new Date(`${yearOfDate}-06-01T00:00:00`);
  const endDate = new Date(`${yearOfDate}-11-30T00:00:00`);

  return dateOfTrip >= startDate && dateOfTrip <= endDate;
}

export async function initResellerRatings() {
  const themeStore = useThemeStore();

  // Remove any existing RR scripts first
  const existingScripts = document.querySelectorAll(
    'script[src*="resellerratings.com"]'
  );
  existingScripts.forEach((script) => script.remove());
  const isSoventure = themeStore.isThemeSoventure;

  // Create and add new script
  const resellerRatingsScript = document.createElement('script');
  resellerRatingsScript.setAttribute(
    'src',
    `https://www.resellerratings.com/productreviews/category/${isSoventure ? 'Soventure_Insurance' : 'InsureMyTrip'}.js`
  );
  resellerRatingsScript.setAttribute('defer', '');

  document.head.appendChild(resellerRatingsScript);
}

export async function loadScript(src: string): Promise<void> {
  if (document.querySelector(`script[src="${src}"]`)) return;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

export function loadStyle(href: string): void {
  if (document.querySelector(`link[href="${href}"]`)) return;

  const link = document.createElement('link');
  link.href = href;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

export async function loadAssets(
  jsUrl: string,
  cssUrl?: string
): Promise<void> {
  if (cssUrl) loadStyle(cssUrl);
  await loadScript(jsUrl);
}

export async function retrieveLoaderData(key: string[]) {
  const contentStore = useContentStore();
  try {
    let loaders = [];
    if (window.ACF_PAGE_DATA_RESULTS?.loaders) {
      loaders = window.ACF_PAGE_DATA_RESULTS.loaders;
    } else {
      const loadersContent = await axios.get(
        API_ENDPOINTS.cms.getLoaderData(key.join(','))
      );
      loaders = loadersContent.data;
    }

    const loadersData = loaders?.loaders;
    loadersData?.forEach((loader: LoaderData) => {
      contentStore.setLoaderData(loader.key, loader);
    });
  } catch (error) {
    handleWordpressContentError(
      error,
      `Error fetching loader data on ${window.location.hostname}`
    );
  }
}

export async function determineTheme() {
  const themeStore = useThemeStore();
  const apiStore = useApiStore();

  if (themeStore.isThemeSoventure) {
    themeStore.setSoventureTheme();
    await setSoventureContent();
  } else {
    themeStore.setInsuremytripTheme();
  }

  if (
    apiStore.getFFValue('crm_20250806_enable_imt_wordpress_content') &&
    !themeStore.isThemeSoventure
  ) {
    await setIMTContent();
  }
}

export async function determineMode() {
  const themeStore = useThemeStore();
  const userSession = useUserSessionStore();
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');

  switch (mode) {
    case 'edu':
    case 'annual':
      themeStore.setMode(mode);
      // We don't need to handle the compare plans for annual or edu mode atm
      // So we can remove comparePlans from the store.
      userSession.deselectPlansForCompare();
      break;
    case 'cruise':
      themeStore.setMode(mode);
      break;
    default:
      themeStore.setMode('default')
      break
  }
}

export async function setSoventureContent() {
  const contentStore = useContentStore();
  let data = [];
  try {
    if (window.ACF_PAGE_DATA_RESULTS?.quote_results_content) {
      data = window.ACF_PAGE_DATA_RESULTS.quote_results_content;
    } else {
      const quoteResultsContent = await axios.get(
        API_ENDPOINTS.cms.getQuoteResultsContent()
      );
      data = quoteResultsContent.data;
    }

    const trustFactors = data?.trust_factors;
    const soventureTrustFactors: { [key: string]: TrustFactor } = {};
    if (Array.isArray(trustFactors)) {
      trustFactors.forEach((ele: any) => {
        soventureTrustFactors[ele.key] = {
          heading: ele.heading,
          content: ele.content,
          image: ele.icon.url,
        } as TrustFactor;
      });
      contentStore.setSoventureTrustFactor(soventureTrustFactors);
    }

    const redirectToMainSiteHeading =
      data?.redirect_to_main_site?.heading;
    const redirectToMainSiteImages =
      data?.redirect_to_main_site?.images;

    const formattedImages: { [key: string]: { url: string; alt: string } } = {};

    if (redirectToMainSiteHeading && Array.isArray(redirectToMainSiteImages)) {
      redirectToMainSiteImages.forEach((ele: any) => {
        formattedImages[ele.key] = {
          url: ele.image.url,
          alt: ele.image.alt,
        };
      });

      contentStore.setRedirectToIMTContent({
        header: redirectToMainSiteHeading,
        images: formattedImages,
      });
    }

    const coverageModalImages = data?.coverage_modal;
    const soventureCoverageModalImages: {
      [key: string]: { url: string; alt: string };
    } = {};
    if (Array.isArray(coverageModalImages)) {
      coverageModalImages.forEach((ele: any) => {
        soventureCoverageModalImages[ele.key] = {
          url: ele.image.url,
          alt: ele.image.alt,
        };
      });
      contentStore.setCoverageModalImages(soventureCoverageModalImages);
    }

    const planTagModalImages = data?.plantag_modal;
    const soventurePlanTagModalImages: {
      [key: string]: { url: string; alt: string };
    } = {};
    if (Array.isArray(planTagModalImages)) {
      planTagModalImages.forEach((ele: any) => {
        soventurePlanTagModalImages[ele.key] = {
          url: ele.image.url,
          alt: ele.image.alt,
        };
      });
      contentStore.setPlanTagModalImages(soventurePlanTagModalImages);
    }

    // Plan Tags and modals
    const planTagData = data?.plantags_content;

    if (planTagData) {
      const planTags = {} as PlanTagDataStore;
      const planModals = {} as PlanTagModalStore;
      const planTagsExclude: Record<string, string[]> = {};

      planTagData.forEach((tag: any) => {
        if (Array.isArray(tag?.plans)) {
          tag?.plans?.forEach((ele: string, index: number) => {
            const data: PlanTagData = {
              text: tag.text,
              textColor: tag.text_color,
              backgroundColor: tag.background_color,
              borderColor: tag.border_color,
              modal: tag.modal,
              modalContent: tag.modal_content,
            };
            if (data.modal) {
              data.modalKey = `${ele}-${index}`;
              planModals[data.modalKey] = data.modalContent;
            }

            if (planTags[ele]) {
              planTags[ele].push(data);
            } else {
              planTags[ele] = [data];
            }
          });
        }

        // For selection default value is ''
        if (tag?.plan_type !== '') {
          const data: PlanTagData = {
            text: tag.text,
            textColor: tag.text_color,
            backgroundColor: tag.background_color,
            borderColor: tag.border_color,
            modal: tag.modal,
            modalContent: tag.modal_content,
          };

          const key = tag.plan_type;

          if (data.modal && key) {
            data.modalKey = key;
            planModals[key] = data.modalContent;
          }

          if (planTags[key]) {
            planTags[key].push(data);
          } else {
            planTags[key] = [data];
          }
          if (tag?.plans_to_exclude) {
            planTagsExclude[key] = tag?.plans_to_exclude;
          }
        }
      });

      contentStore.setPlanTagModals(planModals);
      contentStore.setPlanTags(planTags);
      contentStore.setPlanTypeTagsExclude(planTagsExclude);
    }

    // Set our soventure filter list
    const filters = data
      ?.coverage_filters as CoverageItem[];
    const output: Record<
      string,
      {
        label: string;
        toolTipText: string;
        checkBoxLabels: string[];
        radioButtonLabels: string[];
        toolTipSecondaryText: string;
        toolTipSecondaryPlans: string;
      }
    > = {};
    filters.forEach((item) => {
      output[item.key] = {
        label: item.label,
        toolTipText: item.toolTipText,
        checkBoxLabels: item.check_box_labels
          ? item.check_box_labels.map((opt) => opt.label)
          : [],
        radioButtonLabels: item.radio_button_labels
          ? item.radio_button_labels.map((opt) => opt.label)
          : [],
        toolTipSecondaryText: item.toolTipSecondaryText,
        toolTipSecondaryPlans: item.toolTipSecondaryPlans,
      };
    });
    contentStore.setFilters('soventure', output);

    const shareContent = data?.share_content;

    if (shareContent) {
      const shareButtonLabel = shareContent.button_label;
      const shareMessageContent = {
        heading: shareContent.message_heading,
        body: shareContent.message_body,
      };
      const shareEmailContent = {
        heading: shareContent.email_heading,
        body: shareContent.email_body,
      };
      const shareOptions = shareContent.options?.map(
        (opt: {
          key: string;
          label: string;
          icon: { url: string; alt: string };
        }) => {
          return {
            type: opt.key,
            label: opt.label,
            icon: {
              url: opt.icon.url,
              alt: opt.icon.alt,
            },
          };
        }
      );
      contentStore.setShareButtonLabel(shareButtonLabel);
      contentStore.setShareMessageContent(shareMessageContent);
      contentStore.setShareEmailContent(shareEmailContent);
      contentStore.setShareOptions(shareOptions);
    }
  } catch (error) {
    handleWordpressContentError(
      error,
      'Error fetching soventure quote results content'
    );
  }
}

export async function setIMTContent() {
  const contentStore = useContentStore();
  const themeStore = useThemeStore();

  try {
    let data = [];
    if (window.ACF_PAGE_DATA_RESULTS?.quote_results_content) {
      data = window.ACF_PAGE_DATA_RESULTS.quote_results_content;
    } else {
      const quoteResultsContent = await axios.get(
        API_ENDPOINTS.cms.getQuoteResultsContent()
      );
      data = quoteResultsContent.data;
    }

    if (window.ACF_PAGE_DATA_RESULTS?.plan_labels) {
      const planLabels = window.ACF_PAGE_DATA_RESULTS.plan_labels;
      contentStore.setPlanLabels(planLabels);
    }

    // Trust Factors
    const trustFactors = data?.trust_factors;
    if (Array.isArray(trustFactors) && trustFactors.length > 0) {
      const imtTrustFactors: { [key: string]: TrustFactor } = {};
      trustFactors.forEach((ele: any) => {
        if (ele?.key && ele?.heading && ele?.content && ele?.icon?.url) {
          imtTrustFactors[ele.key] = {
            heading: ele.heading,
            content: ele.content,
            image: ele.icon.url,
          };
        }
      });
      if (Object.keys(imtTrustFactors).length > 0) {
        const existingTrustFactors = contentStore.getTrustFactorContent;
        const imtExistingTrustFactors = existingTrustFactors.insuremytrip || {};
        const mergedTrustFactors = {
          ...imtExistingTrustFactors,
          ...imtTrustFactors,
        };
        contentStore.setIMTTrustFactor(mergedTrustFactors);
      }
    }

    const subflowContent = data?.subflow_content;

    if (Array.isArray(subflowContent) && subflowContent.length > 0) {
      const imtSubflowContents: {
        [key: string]: { content: string };
      } = {};
      subflowContent.forEach((ele: any) => {
        if (ele?.subflow_key && ele?.subflow_content_text) {
          imtSubflowContents[ele.subflow_key] = {
            content: ele.subflow_content_text,
          };
        }
      });
      if (Object.keys(imtSubflowContents).length > 0) {
        contentStore.setSubflowContents(imtSubflowContents);
      }
    }

    // Redirect to site cta
    let redirectToMainSiteHeading = '';
    let redirectToMainSiteSubheading = '';

    if (themeStore.isModeEdu) {
      redirectToMainSiteHeading = data?.redirect_to_quote_flow_heading_edu;
      redirectToMainSiteSubheading =
        data?.redirect_to_quote_flow_subheading_edu;
    } else {
      redirectToMainSiteHeading = data?.redirect_to_main_site?.heading;
      redirectToMainSiteSubheading = data?.redirect_to_main_site?.subheading;
    }

    const redirectToMainSiteImages = data?.redirect_to_main_site?.images;

    const formattedImages: { [key: string]: { url: string; alt: string } } = {};

    if (redirectToMainSiteHeading && Array.isArray(redirectToMainSiteImages)) {
      redirectToMainSiteImages.forEach((ele: any) => {
        formattedImages[ele.key] = {
          url: ele.image.url,
          alt: ele.image.alt,
        };
      });

      contentStore.setRedirectToIMTContent({
        header: redirectToMainSiteHeading,
        subheading: redirectToMainSiteSubheading,
        images: formattedImages,
      });
    }

    // Coverage Modal Images
    const coverageModalImages = data?.coverage_modal;

    if (Array.isArray(coverageModalImages) && coverageModalImages.length > 0) {
      const imtCoverageModalImages: {
        [key: string]: { url: string; alt: string };
      } = {};
      coverageModalImages.forEach((ele: any) => {
        if (ele.image?.url) {
          imtCoverageModalImages[ele.key] = {
            url: ele.image?.url,
            alt: ele.image?.alt,
          };
        }
      });

      if (Object.keys(imtCoverageModalImages).length > 0) {
        contentStore.setCoverageModalImages(imtCoverageModalImages);
      }
    }

    // Plan Tag Modal Images
    const planTagModalImages = data?.plantag_modal;
    if (Array.isArray(planTagModalImages) && planTagModalImages.length > 0) {
      const imtPlanTagModalImages: {
        [key: string]: { url: string; alt: string };
      } = {};
      planTagModalImages.forEach((ele: any) => {
        if (ele?.key && ele?.image?.url && ele?.image?.alt) {
          imtPlanTagModalImages[ele.key] = {
            url: ele.image.url,
            alt: ele.image.alt,
          };
        }
      });
      if (Object.keys(imtPlanTagModalImages).length > 0) {
        contentStore.setPlanTagModalImages(imtPlanTagModalImages);
      }
    }

    // Plan Tags and modals
    const planTagData = data?.plantags_content;

    if (planTagData) {
      const planTags = {} as PlanTagDataStore;
      const planModals = {} as PlanTagModalStore;
      const planTagsExclude: Record<string, string[]> = {};

      planTagData.forEach((tag: any) => {
        if (Array.isArray(tag?.plans)) {
          tag?.plans?.forEach((ele: string, index: number) => {
            const data: PlanTagData = {
              text: tag.text,
              textColor: tag.text_color,
              backgroundColor: tag.background_color,
              borderColor: tag.border_color,
              modal: tag.modal,
              modalContent: tag.modal_content,
            };
            if (data.modal) {
              data.modalKey = `${ele}-${index}`;
              planModals[data.modalKey] = data.modalContent;
            }

            if (planTags[ele]) {
              planTags[ele].push(data);
            } else {
              planTags[ele] = [data];
            }
          });
        }

        // For selection default value is ''
        if (tag?.plan_type !== '') {
          const data: PlanTagData = {
            text: tag.text,
            textColor: tag.text_color,
            backgroundColor: tag.background_color,
            borderColor: tag.border_color,
            modal: tag.modal,
            modalContent: tag.modal_content,
          };

          const key = tag.plan_type;

          if (data.modal && key) {
            data.modalKey = key;
            planModals[key] = data.modalContent;
          }

          if (planTags[key]) {
            planTags[key].push(data);
          } else {
            planTags[key] = [data];
          }
          if (tag?.plans_to_exclude) {
            planTagsExclude[key] = tag?.plans_to_exclude;
          }
        }
      });

      contentStore.setPlanTagModals(planModals);
      contentStore.setPlanTags(planTags);
      contentStore.setPlanTypeTagsExclude(planTagsExclude);
    }

    // Coverage Filters
    const filters = data?.coverage_filters;
    if (Array.isArray(filters) && filters.length > 0) {
      const output: Record<
        string,
        {
          label: string;
          toolTipText: string;
          checkBoxLabels: string[];
          radioButtonLabels: string[];
          toolTipSecondaryText: string;
          toolTipSecondaryPlans: string;
        }
      > = {};

      filters.forEach((item) => {
        if (item?.key && item?.label) {
          output[item.key] = {
            label: item.label,
            toolTipText: item.toolTipText || '',
            checkBoxLabels: item.check_box_labels
              ? item.check_box_labels.map((opt: { label: string }) => opt.label)
              : [],
            radioButtonLabels: item.radio_button_labels
              ? item.radio_button_labels.map(
                  (opt: { label: string }) => opt.label
                )
              : [],
            toolTipSecondaryText: item.toolTipSecondaryText || '',
            toolTipSecondaryPlans: item.toolTipSecondaryPlans || '',
          };
        }
      });

      if (Object.keys(output).length > 0) {
        contentStore.setFilters('insuremytrip', output);
      }
    }

    // Share Content
    const shareContent = data?.share_content;
    if (shareContent) {
      if (shareContent.button_label) {
        contentStore.setShareButtonLabel(shareContent.button_label);
      }

      if (shareContent.message_heading || shareContent.message_body) {
        contentStore.setShareMessageContent({
          heading: shareContent.message_heading,
          body: shareContent.message_body,
        });
      }

      if (shareContent.email_heading || shareContent.email_body) {
        contentStore.setShareEmailContent({
          heading: shareContent.email_heading,
          body: shareContent.email_body,
        });
      }

      if (
        Array.isArray(shareContent.options) &&
        shareContent.options.length > 0
      ) {
        const shareOptions = shareContent.options.map(
          (opt: {
            key: string;
            label: string;
            icon: { url: string; alt: string };
          }) => ({
            type: opt.key,
            label: opt.label,
            icon: {
              url: opt.icon.url,
              alt: opt.icon.alt,
            },
          })
        );

        if (shareOptions.length > 0) {
          contentStore.setShareOptions(shareOptions);
        }
      }
    }
  } catch (error) {
    handleWordpressContentError(
      error,
      'Error fetching insuremytrip quote results content'
    );
  }
}

export const isInternal = () => {
  return document.cookie
    .split('; ')
    .some((cookie) => cookie.trim() === 'isInternal=true');
};

export const getCookie = (name: string) => {
  const cookieString = document.cookie;
  const cookies = cookieString.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();

    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
};

export const getAgentEmailFromQuoteResultsContainer = () => {
  const quoteResultsContainer = document.querySelector(
    '#quote-results-app'
  ) as HTMLElement;
  return quoteResultsContainer?.getAttribute('data-agent-email') ?? null;
};

export const handleWordpressContentError = (
  error: AxiosError | Error | any,
  errorMessage: string
) => {
  if (axios.isAxiosError(error)) {
    console.error(
      `${errorMessage}: HTTP ${error.response?.status} - Data ${error.response?.data} - headers ${error.response?.headers}`
    );
  } else if (error instanceof Error) {
    console.error(`${errorMessage}: ${error.message}`);
  } else {
    console.error(`${errorMessage}: ${error as string}`);
  }
};

/**
 * Helper method to determine color for marker
 * @param markerType PlanRowMarkerType | null
 * @param color string
 * @returns string
 */
export const resolveCoverageMarkerColor = (
  markerType: PlanRowMarkerType | null,
  color: string = 'F7966F'
) => {
  if (markerType === 'Secondary') {
    return '#F7966F';
  } else if (markerType === 'OptionAvailable') {
    return '#77BB33';
  } else if (markerType === 'FlightOnly') {
    return '#F4B649';
  } else if (markerType === 'AdditionalInfo') {
    return '#6633CC';
  } else if (markerType === 'PreEx' || markerType === 'AD&D') {
    return '#0354D6';
  } else if (markerType === 'TripInterruption') {
    return '#0454D6';
  }
  return color;
};

export const handlePlanParameters = (
  planCode: string,
  planParameters: PlanParameter[],
  plans: UserPlan
) => {
  const existingParamIndex = planParameters.findIndex(
    (param: PlanParameter) => param.code === planCode
  );
  const selectedOptions = getOptionsInKeyValueFormat(plans[planCode].options);
  if (existingParamIndex !== -1) {
    planParameters[existingParamIndex].options = selectedOptions;
  } else {
    planParameters.push({
      code: planCode,
      options: selectedOptions,
    });
  }
  return planParameters;
};

/**
 * Gets compare coverage data
 * @param {QuoteResult} plan
 * @param {string} coverageId
 * @param {boolean} isModal - whether the coverage data is for modal
 * @returns {string}
 */
export function getCompareCoverageData(plan: QuoteResult, coverageId: string, isModal: boolean = false): string {
  const currentCoverage = plan.coverages.find(
    (coverage) => coverage.id === coverageId
  );

  // Retrieve the specific coverage details
  let coverageDetails = currentCoverage?.details || [];

  if (coverageId === 'availability' && isPlanAvailabilityDescriptionLong(plan) && !isModal) {
    // get only first item, will show link to open modal
    coverageDetails = coverageDetails.slice(0, 1);
  } else if (coverageId === 'availability' && isPlanAvailabilityDescriptionLong(plan) && isModal) {
    // exclude title for modal description since title is displayed in grid
    coverageDetails = coverageDetails.slice(1);
  }

  // Flatten and join object values into strings
  const joinedDetails = coverageDetails.flatMap((detail) =>
    Object.values(detail).join(' ')
  );

  // Concatenate the details with '<br>' between them
  const formattedDetails = joinedDetails.reduce((acc, item, index) => {
    let separator;

    if (index < joinedDetails.length - 1) {
      separator = '<br>';
    } else {
      separator = ' ';
    }

    return acc + item + separator;
  }, '');

  // Provide a fallback if no details are found
  return formattedDetails || 'N/A';
}

/**
 * Check if a plan has a long availability description
 * @param {QuoteResult} plan QuoteResult data
 * @returns {boolean} true if the plan has a long description, false otherwise
 */
export const isPlanAvailabilityDescriptionLong = (plan: QuoteResult): boolean => {
  return !!plan?.availability && plan.availability.length > 1;
}
