import { useContentStore } from '@/store/content';
import { useUserSessionStore } from '@/store/userSession';
import { HTTP_REQUEST_STATES } from '@/config';

export type Location = {
  country: string | null;
  stateProvince: string | null;
};

export type Traveler = {
  primary: boolean;
  dateOfBirth: string;
  residence: Location[];
  tripCost: number;
};

export type TravelServices = 'hotel' | 'airline' | 'vacationRental' | 'cruise';

export type Cost = {
  base: number;
  amount: MoneyCost;
  taxes: Taxes;
};

export type Taxes = {
  type: string;
  amount: number;
};

export type Fees = {
  type: string;
  amount: number;
};

export type MoneyCost = {
  type: string;
  amount: number;
};

export type UrlResource = {
  url: string;
};

export type Provider = {
  code: string;
  name: string;
  logo: UrlResource;
};

export type Option = {
  id: string;
  displayName: string;
  value: string;
  cost: number;
  selected: boolean;
};

export type ClickThrough = {
  id: string;
  validation: string;
  messages: string[];
  notes: string[];
  type: string;
  values: string[];
  modalKey?: string;
  modalContent?: string;
};

export type ClickThroughValidationMap = {
  [key: string]: string;
};

export type CoverageLimit = {
  coverageValue: string;
  valueType: string;
  valuePerTrip: number;
  valuePerPerson: number;
};

export type CoverageDetail = {
  value: string;
  description: string;
  optionKey?: string;
};

export type Coverage = {
  id: string;
  secondary: boolean;
  limits?: CoverageLimit[];
  details: CoverageDetail[];
};

export type CoveredActivity = {
  id: string;
};

export type CoverageText = {
  label: string;
  value: string | boolean | string[];
  secondary: boolean;
};

export type IncludedBenefits = {
  secondary: boolean;
  details: CoverageDetail;
};
export type CoveredActivities = string[];

export type PlanType =
  | 'Comprehensive'
  | 'Evacuation'
  | 'Vacation Rental'
  | 'Accidental Death'
  | 'Travel Medical'
  | 'Travel Visa'
  | 'Adventure Sports'
  | 'Hidden'
  | 'EDU';

export type LTCMessage = {
  id: string;
  message: string;
};

/**
 * @todo We need to define types for all attributes in a QuoteResults.
 * In addition we need to conditionally type for plans that are not available,
 * f.e. available === false
 */
export type QuoteResult = {
  available: boolean;
  name: string;
  code: string;
  cost: Cost;
  fees: MoneyCost;
  provider: Provider;
  revision: number;
  certificate: UrlResource;
  type: PlanType;
  options: Option[];
  clickthroughs: ClickThrough[];
  coverages: Coverage[];
  popularityRank: number;
  includedBenefits: IncludedBenefits[];
  ltc: LTCMessage[];
  additionalOptions: AdditionalOptions;
  reviewPeriod: CoverageDetail[];
  rules?: PNSRules[];
  availability?: CoverageDetail[];
  coveredActivities: string[];
};

export type PNSRules = {
  id: string;
  message: string;
};

export type AdditionalOptions = {
  secondary: boolean;
  details: CoverageDetail[];
};

export type QuoteResults = {
  requestStatus: HTTP_REQUEST_STATES;
  metadata: object;
  products: QuoteResult[];
};

export type CostAndSelected = Pick<Option, 'cost' | 'selected'>;

export type FormattedOptionItem = {
  displayName: string;
  values: {
    [key: string]: CostAndSelected;
  };
};

export type UserPlan = {
  [key: string]: {
    currentCost: Cost;
    fees: Fees;
    options: FormattedOption;
    coverages: FormattedCoverage;
    clickthroughs: ClickThrough[];
  };
};

export type AvailablePlan = {
  productCode: string;
  options: Option[];
  clickthroughs: ClickThrough[];
  coverages: Coverage[];
};

/**
 * This Option type can have either a key or an id
 * Option is used for Requote => id
 * Option is used to Add Option to ProductOrder => key
 */
export type PlanParamOption = {
  key?: string;
  id?: string;
  value: string;
};

export type PlanParameter = {
  code: string;
  options: PlanParamOption[];
};

export type FormattedOption = {
  [key: string]: FormattedOptionItem;
};

export type FormattedCoverage = {
  [key: string]: Pick<Coverage, 'limits' | 'details' | 'secondary'>;
};

export type SortOptions = 'popular' | 'price-low' | 'price-high';

export type ActivePlanDetailsTab =
  | 'description'
  | 'coverageLimits'
  | 'coveredActivities';

export type TrustFactor = {
  heading: string;
  content: string;
  image: string;
};

export type DestinationTrustFactors = {
  [destinationCode: string]: TrustFactor;
};

export type TrustFactorCollection = {
  [key: string]: TrustFactor | DestinationTrustFactors;
};

export type PlanReview = {
  stars: number;
  numberOfReviews: number;
};

export type CMSImage = {
  data: string;
  url: string;
  created: string;
  modified: string;
  description: string;
  width: string | number;
  height: string | number;
  tags: string;
};

export type CMSReviewSEO = {
  seo_title: string;
  seo_keywords: string;
  seo_description: string;
  seo_canonical: string;
};

export type CMSHighlights = {
  content: string;
};

export type CMSProvider = {
  name: string;
  code: string;
  title?: string;
  summary?: string;
  summaryListing?: string;
  contentReviews?: string;
  logoSvg?: CMSImage[];
  logo?: CMSImage[];
};

type CMSPopup = {
  tag: string;
  content: string;
};

type CMSPopups = {
  [key: string]: CMSPopup | undefined;
};

export type CMSPlan = {
  path: string;
  url: string;
  name: string;
  title: string;
  productCode: string;
  content: string;
  highlights: CMSHighlights[];
  contentReviews: string;
  seo_title: string;
  seo_keywords: string;
  seo_description: string;
  reviewsSEO: CMSReviewSEO;
  popups?: CMSPopups;
  coveredActivities?: string;
};

export type ContentStore = ReturnType<typeof useContentStore>;
export type UserSessionStore = ReturnType<typeof useUserSessionStore>;

export type EmailAQuote = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  message: string;
  friendsEmail: string[];
  marketingOptin: boolean;
  quoteUrl: string | null;
  plans: object[];
};

export type Filters = {
  [key: string]: Set<string>;
};

export type Destination = {
  code: string;
  value: string;
  alias: string;
  lemma: string;
};

export type FFValues = {
  [key: string]: string | boolean | number;
};

export type ErrorModalTypes =
  | ''
  | 'noQuoteId'
  | 'httpServerError'
  | 'noAvailablePlans';

export type QuoteResultsPlan = QuoteResult & {
  showPlan: boolean;
};

export type GAObject = {
  hierarchical_layer_1: string;
  hierarchical_layer_2?: string;
  hierarchical_layer_3?: string;
  hierarchical_layer_4?: string;
};

export type Site = 'insuremytrip' | 'soventure';
export type Mode = 'edu' | 'annual' | 'cruise' | 'default';
export type ThemeName = 'insuremytrip' | 'soventure';
export type ThemeMode = 'default' | 'edu' | 'annual' | 'cruise';

export type FilterContent = {
  label: string;
  toolTipText: string;
  checkBoxLabels: string[];
  radioButtonLabels: string[];
  toolTipSecondaryText: string;
  toolTipSecondaryPlans: string;
};

export type CoverageLabel = {
  label: string;
};

export type CoverageItem = {
  key: string;
  label: string;
  toolTipText: string;
  check_box_labels: CoverageLabel[];
  radio_button_labels: CoverageLabel[];
  toolTipSecondaryText: string;
  toolTipSecondaryPlans: string;
};

export type QuoteShortCodePayload = {
  qid: string | null;
  comparePlans: string[];
  departureDate: string | void;
};

export interface IMTQuoteFormModulesType {
  quoteFormJs: string;
  quoteFormCss?: string;
}

export interface AcfPageDataResultsType {
  loaders: object[];
  plans_content?: object;
  providers_content: CMSProvider[];
  quote_results_content: object[];
  plan_labels?: {
    [key: string]: {
      content: string;
      plan_type: string;
    };
  };
}

declare global {
  interface Window {
    IMTQuoteFormModules?: IMTQuoteFormModulesType;
    ACF_PAGE_DATA_RESULTS?: AcfPageDataResultsType;
  }
}

export type LoaderData = {
  key: string;
  animation: string;
  heading: string;
  random_message: boolean;
  messages: [
    {
      message: string;
    },
  ];
};

export type LoaderDataMap = {
  [key: string]: LoaderData;
};

export type PlanTagData = {
  text: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  modal: boolean;
  modalContent: string;
  modalKey?: string;
};

export type PlanTagWP = {
  plans: string[];
  plan_type: string;
} & PlanTagData;

export type PlanTagDataStore = {
  [key: string]: PlanTagData[];
};

export type PlanTagModalStore = {
  [key: string]: string;
};

export type PlanTagModalImage = {
  url: string;
  alt: string;
};

export type PlanTagsTypeExclude = {
  [key: string]: string[];
};

export type HighlightedCoverageInformation = {
  iconColor: string | null;
  heading: string;
  description: string | null;
};

export type PlanRowMarkerType =
  | 'Secondary'
  | 'AdditionalInfo'
  | 'OptionAvailable'
  | 'FlightOnly'
  | 'PreEx'
  | 'TripInterruption'
  | 'AD&D';

  export type PartnerTrustFactor = {
    heading: string;
    content: string;
    icon: {
      url: string;
      alt: string;
    };
  };

export type Logo = {
  url: string;
  alt: string;
};

export type Brand = {
  logo: Logo;
  primaryColor: string;
  secondaryColor: string;
};

export type AdvertisementImage = {
  url: string;
  alt: string;
};

export type Partner = {
  brand: Brand;
  advertisementImage: AdvertisementImage;
  trustFactors: TrustFactor;
};

export type ImtPartnerObject = {
  partner?: Partner;
};
