import {
  SortOptions,
  TrustFactor,
  QuoteResult,
  ThemeName,
  FilterContent,
  LoaderDataMap,
  LoaderData,
  TrustFactorCollection,
  PlanTagData,
  PlanTagDataStore,
  PlanTagModalImage,
  PlanTagModalStore,
  PlanTagsTypeExclude,
  HighlightedCoverageInformation,
  PlanRowMarkerType,
} from '@/types';
import { defineStore } from 'pinia';
import { useUserSessionStore } from '@/store/userSession.ts';
import { useApiStore } from '@/store/api';
import { useThemeStore } from '@/store/theme';
import { API_ENDPOINTS } from '@/config';
import axios from 'axios';
import {
  handleWordpressContentError,
  resolveCoverageMarkerColor,
} from '@/utility';

interface State {
  heading: string;
  trustFactors: {
    insuremytrip: TrustFactorCollection;
    soventure: Record<string, TrustFactor>;
  };
  emailQuote: {
    button: {
      img: {
        src: string;
      };
      label: string;
    };
  };
  quoteDetails: {
    key: string;
    label: string;
  }[];
  sort: {
    label: string;
    options: {
      type: SortOptions;
      label: string;
    }[];
  };
  share: {
    label: string;
    message: {
      heading: string;
      body: string;
    };
    email: {
      heading: string;
      body: string;
    };
    options: {
      type: string;
      label: string;
      icon: {
        url: string;
        alt: string;
      };
    }[];
  };
  coverageLabels: {
    medical: string;
    emergencyMedicalEvacuation: string;
    evacFrom: string;
    evacTo: string;
    evacCriteria: string;
    includedBenefits: string;
    coveredActivities: string;
    crisisAssistancePlus: string;
    duration: string;
    tripInterruption: string;
    tripCancellation: string;
    travelDelay: string;
    baggageDelay: string;
    baggage: string;
    accidentalDeath24Hour: string;
    preExPeriod: string;
    preExWaiver: string;
  };
  optionHeaderMap: {
    [key: string]: string;
  };
  coverageOptionMap: {
    [key: string]: string;
  };
  planDetailModal: {
    plan: QuoteResult | null;
  };
  planTagModal: PlanTagModalStore;
  inputs: {
    pbm_checkbox: {
      label: string;
      mobileLabel: string;
      agreeLabel: string;
      disabled: boolean;
      required: boolean;
      hint: string;
      placeholder: string;
    };
    checkboxOption: {
      disabled: boolean;
      required: boolean;
      hint: string;
      placeholder: string;
    };
    pbm_radio: {
      disabled: boolean;
      required: boolean;
    };
  };
  filters: {
    [key in ThemeName]: Record<string, FilterContent>;
  };
  coverageLimitMap: {
    header: string;
    coverages: {
      key: string;
      label: string;
      toolTipText: string;
    }[];
  }[];
  evacuationSpecificMap: {
    key: string;
    label: string;
    toolTipText: string;
  }[];
  medicalSpecificMap: {
    key: string;
    label: string;
    toolTipText: string;
  }[];
  secondary: {
    label: string;
    header: string;
    toolTipText: string;
  };
  flightOnly: {
    label: string;
  };
  coverageTermMapForLTC: {
    [key: string]: string[];
  };
  nonAdditionalOptionKeys: string[];
  additionalDetails: {
    headerOne: string;
    headerTwo: string;
    tripCostPlaceholder: string;
    itpPlaceholder: string;
    submitButton: string;
    openModalButton: string;
    modalHeaderOne: string;
    modalHeaderTwo: string;
    tripCostError: string;
    tripCostMaxError: string;
    itpError: string;
  };
  errorModals: {
    [key: string]: {
      header: string;
      subHeader: string;
      contentType: 'text' | 'html';
      content: string;
      buttonText: string;
      buttonMethod: Function;
    };
  };
  redirectToIMTContent?: {
    header: string;
    subheading?: string;
    images: {
      [key: string]: {
        url: string;
        alt: string;
      };
    };
  };
  coverageModalImages?: {
    [key: string]: {
      url: string;
      alt: string;
    };
  };
  planTagModalImages?: Record<string, PlanTagModalImage>;
  planWPContent: {
    [key: string]: {
      permalink: string;
      logo: string;
      description: string;
      moreInfo:
        | {
            key: string;
            heading: string;
            content: string;
          }[]
        | null;
    };
  };
  LoaderDataMap: LoaderDataMap;
  subflowContent?: {
    [key: string]: {
      content: string;
    };
  };
  planTags?: PlanTagDataStore;
  planTagsTypeExclude?: PlanTagsTypeExclude;
  highlightedCoverageInformation?: HighlightedCoverageInformation[];
  planLabels?: {
    [key: string]: {
      content: string;
      plan_type: string;
    };
  };
  planDetailsCoverageLimitMap: {
    header: string;
    coverages: {
      key: string;
      label: string;
      toolTipText: string;
    }[];
  }[];
}

export const useContentStore = defineStore('content-store', {
  state: (): State => {
    return {
      heading: 'Your Quote Results',
      trustFactors: {
        insuremytrip: {
          edu: {
            heading: 'Academic Plans',
            content:
              'Our Educational Travel coverage offers specialized insurance plans designed for students, educators, schools, and lifelong learners traveling within or out of the U.S. for academic enrichment.',
            image:
              'https://assets.insuremytrip.com/wp-content/uploads/2025/08/13145406/6df26750e938442f115ef7c5c1d7e3d27f0fcb3e.jpg',
          },
          tripCost: {
            heading: 'Trip Cancellation / Interruption',
            content:
              'For expensive trips, travel insurance is vital to protect against financial losses. Trip Cancellation or Interruption coverage can help reimburse for non-refundable costs if unexpected events like illness or a family emergency disrupt your plans.',
            image:
              'https://assets.insuremytrip.com/wp-content/uploads/2025/08/26103351/trustfactor_tripcost-1.svg',
          },
          generic: {
            heading: "We're Here for You",
            content:
              'Our Anytime Advocates® can help if you have concerns with your claim. If a claim is denied, an advocate will work with the customer to learn why or help with the appeal process.',
            image:
              'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145332/trustfactor_generic_02.svg',
          },
          age: {
            heading: 'Pre-Existing Conditions',
            content:
              'Most policies exclude pre-existing conditions unless you qualify for a waiver on specific plans. Check the look-back period, typically 60 to 180 days before buying the policy.',
            image:
              'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145248/trustfactor_age.svg',
          },
          destination: {
            ABW: {
              heading: 'Aruba',
              content:
                "Aruba's white sand beaches and relaxed Caribbean vibe make it a perfect getaway. While travel insurance is optional, it's recommended to cover unexpected issues like illness, weather disruptions, or transit problems. Options are available to fit various budgets and needs.",
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145420/destination_ABW.png',
            },
            AUS: {
              heading: 'Australia',
              content:
                'A top reason to get travel insurance for Australia is to cover healthcare costs if you fall ill or are injured. With a variety of activities and landscapes, accidents can happen—even a simple misstep. Coverage offers protection against unexpected medical events, including evacuation if needed.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145442/destination_AUS.png',
            },
            BHS: {
              heading: 'Bahamas',
              content:
                'When visiting the Bahamas, travel insurance is recommended with coverage for illness, interruption, baggage loss, and other travel mishaps.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16150840/destination_bhs.png',
            },
            CRI: {
              heading: 'Costa Rica',
              content:
                'Travel insurance is recommended for all travelers to Costa Rica, especially cruisers, to cover disruptions like delays and lost baggage. Given cruise complexities, insurance helps manage risks from ship issues and canceled excursions, with plans to suit various needs.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145513/destination_CRI.png',
            },
            CAN: {
              heading: 'Canada',
              content:
                "Protecting against unexpected hospital bills is a key reason to get Canada trip insurance, but there are more benefits too. Coverage can help with travel delays, evacuation, repatriation, and baggage loss or theft. Whether you're flying, driving, or cruising, consider the events that could impact your trip when comparing plans.",
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145534/destination_CAN.png',
            },
            DOM: {
              heading: 'Dominican Republic',
              content:
                'Visitors to the Dominican Republic may face travel delays, baggage issues, or disruptions due to weather or mechanical problems, which can impact their trip.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145640/destination_DOM.png',
            },
            FRA: {
              heading: 'France',
              content:
                'France offers endless excitement, but experienced travelers know the value of travel insurance. Comprehensive plans cover medical needs, baggage, and trip cancellations, saving you time and money.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145702/destination_FRA.png',
            },
            DEU: {
              heading: 'Germany',
              content:
                'Germany offers endless excitement, but experienced travelers know the value of travel insurance. Comprehensive plans cover medical needs, baggage, and trip cancellations, saving you time and money.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145720/destination_DEU.png',
            },
            GRC: {
              heading: 'Greece',
              content:
                'When visiting Greece, travelers should consider a comprehensive travel insurance plan with coverage for illness, interruption, baggage loss, and other travel mishaps.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145735/destination_GRC.png',
            },
            ISL: {
              heading: 'Iceland',
              content:
                'When visiting Iceland, travelers should consider a comprehensive travel insurance plan with coverage for illness, interruption, baggage loss, and other travel mishaps.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145752/destination_ISL.png',
            },
            IRL: {
              heading: 'Ireland',
              content:
                'When visiting Ireland, travelers should consider a comprehensive travel insurance plan with coverage for illness, interruption, baggage loss, and other travel mishaps.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145814/destination_IRL.png',
            },
            ITA: {
              heading: 'Italy',
              content:
                'Comprehensive travel insurance plans are recommended for travelers to Italy to protect against common travel issues like delays, lost luggage, and other trip disruptions.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145829/destination_ITA.png',
            },
            JPN: {
              heading: 'Japan',
              content:
                'Comprehensive travel insurance plans are recommended for travelers to Japan to protect against common travel issues like cancellations, delays, lost luggage, and more.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145844/destination_JPN.png',
            },
            MEX: {
              heading: 'Mexico',
              content:
                'Ready to fiesta? Comprehensive plans are recommended for travelers to Mexico to protect against common travel issues like delays, lost luggage, and other trip disruptions.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145908/destination_MEX.png',
            },
            NLD: {
              heading: 'Netherlands',
              content:
                'Between vibrant tulip gardens and cities filled with rich heritage, there is so much to explore in the Netherlands. Comprehensive plans are recommended for travelers to protect against common travel issues like cancellations, delays, lost luggage, and more.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145923/destination_NLD.png',
            },
            PRT: {
              heading: 'Portugal',
              content:
                'When visiting Portugal, travelers should consider a comprehensive travel insurance plan with coverage for illness, interruption, baggage loss, and other travel mishaps.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145939/destination_PRT.png',
            },
            ESP: {
              heading: 'Spain',
              content:
                'Comprehensive travel insurance plans are recommended for travelers to Spain to protect against common travel issues like cancellations, delays, lost luggage, and more.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16145954/destination_ESP.png',
            },
            GBR: {
              heading: 'UK',
              content:
                'Comprehensive travel insurance plans are recommended for travelers to the United Kingdom to protect against common travel issues like cancellations, delays, lost luggage, and more.',
              image:
                'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16150012/destination_GBR.png',
            },
          },
          hurricaneSeason: {
            heading: 'If You Want The Most Flexibility',
            content:
              'The popular Cancel for Any Reason (CFAR) benefit is typically an add-on to some comprehensive plans that allows you to cancel your trip for reasons not covered by your policy. These may include fear of travel, political strife, etc. This additional benefit is time-sensitive and has additional requirements, so not all travelers will qualify.',
            image:
              'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16150050/trustfactor_hurricane_season.svg',
          },
          holidaySeason: {
            heading: 'Purchase Early For More Options',
            content:
              'Buying travel insurance early (usually within 10-21 days of your first trip payment) may provide access to additional benefits such as coverage for pre-existing medical conditions or the Cancel For Any Reason (CFAR) option.',
            image:
              'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16150050/trustfactor_holiday_season.svg',
          },
          nonUSResident: {
            heading: 'For Non-US residents',
            content:
              'Focus on healthcare coverage, trip cancellation, emergency evacuation, and planned activities in the U.S. Carefully review policy terms and exclusions, and consider supplemental or specialized insurance for specific needs.',
            image:
              'https://assets.insuremytrip.com/wp-content/uploads/2026/03/16150121/trustfactor_non_us_resident.svg',
          },
        },
        soventure: {},
      },
      emailQuote: {
        button: {
          img: {
            src: 'https://cdn.insuremytrip.com/resources/4499/icon_share.svg',
          },
          label: 'Email Quote',
        },
      },
      quoteDetails: [
        {
          key: 'destination',
          label: 'Destination',
        },
        {
          key: 'travelDates',
          label: 'Travel Dates',
        },
        {
          key: 'ages',
          label: 'Traveler Ages',
        },
        {
          key: 'tripCost',
          label: 'Total Trip Cost',
        },
      ],
      sort: {
        label: 'Sort By:',
        options: [
          {
            type: 'popular',
            label: 'Most Popular',
          },
          {
            type: 'price-low',
            label: 'Price (Low to High)',
          },
          {
            type: 'price-high',
            label: 'Price (High to Low)',
          },
        ],
      },
      share: {
        label: '',
        message: {
          heading: '',
          body: '',
        },
        email: {
          heading: '',
          body: '',
        },
        options: [],
      },
      coverageLabels: {
        medical: 'Medical Limits',
        emergencyMedicalEvacuation: 'Evacuation',
        evacFrom: 'Evacuation From',
        evacTo: 'Evacuation To',
        evacCriteria: 'Evacuation Criteria',
        includedBenefits: 'Included Benefits',
        coveredActivities: 'Covered Activities',
        crisisAssistancePlus: 'Crisis Assistance Plus',
        duration: 'Duration',
        tripInterruption: 'Trip Interruption',
        tripCancellation: 'Trip Cancellation',
        travelDelay: 'Travel Delay',
        baggageDelay: 'Baggage Delay',
        baggage: 'Baggage Loss',
        accidentalDeath24Hour: 'Accidental Death',
        preExPeriod: 'Lookback Period',
        preExWaiver: 'Pre-Ex Waiver',
      },
      optionHeaderMap: {
        tripCancellation: 'Trip Cancellation',
        tripInterruption: 'Trip Interruption',
        financialDefault: 'Financial Default',
        terrorism: 'Terrorism in Itinerary City',
        interruptionForAnyReason: 'Interrupt For Any Reason',
        tripInterruptionForAnyReason: 'Interrupt for Any Reason',
        cancelForAnyReason: 'Cancel for Any Reason',
        cancelForAnyReasonOption: 'Cancel for Any Reason',
        baggage: 'Baggage Loss',
        baggageDelay: 'Baggage Delay',
        travelDelay: 'Travel Delay',
        supplierDefault: 'Supplier Default',
        vacationRentalDamage: 'Vacation Rental Damage',
        medical: 'Medical Limit',
        complicationsOfPregnancy: 'Complications of Pregnancy',
        terrorismMedical: 'Terrorism',
        dental: 'Dental',
        emergencyMedicalExpenses: 'Emergency Medical Expenses',
        recurrence: 'Sudden Recurrence',
        preExWaiver: 'Waiver',
        preExPeriod: 'Lookback Period',
        tripInteruptionPreExistingConditionPeriod:
          'Pre-Existing Condition Period',
        accidentalDeath24Hour: 'Accidental Death: 24-Hr Full Coverage',
        accidentalDeathCommonCarrier: 'Accidental Death: Common Carrier',
        accidentalDeathFlight: 'Accidental Death: Flight Only',
        emergencyMedicalEvacuation: 'Medical Evacuation',
        evacFrom: 'Evacuation from',
        evacTo: 'Evacuation to',
        evacCriteria: 'Evacuation criteria',
        emergencyAssistance: '24-Hour Emergency Assistance',
        // This is the default in pre buy modal.
        optionalCoverages: 'Optional Coverages',
        notes: 'Notes',
      },
      coverageOptionMap: {
        cancelForFortuitousReason: 'cancelForFortuitousReasonOption',
        cancelForAnyReason: 'cancelForAnyReasonOption',
        cancelForWorkReasons: 'cancelForWorkReasonOption',
        interruptionForAnyReason: 'tripInterruptionForAnyReason',
      },
      filters: {
        insuremytrip: {
          tripCancellation: {
            label: 'Trip Cancellation',
            toolTipText:
              'If you need to cancel a trip prior to departure for a specific, unforeseen, covered reason, the plans offer reimbursement up to 100% of the pre-paid, non-refundable trip costs you insured and have documented.',
            checkBoxLabels: ['Included'],
            radioButtonLabels: [],
            toolTipSecondaryText: '',
            toolTipSecondaryPlans: '',
          },
          tripInterruption: {
            label: 'Trip Interruption',
            toolTipText:
              'Trip Cancellation and Trip Interruption coverage can reimburse you for eligible, non-refundable expenses if you have to cancel your trip before departure or cut your trip short after it has started due to a covered reason.\n\nThe percentage represents the maximum amount of coverage available based on the insured trip cost. For example, 100% covers eligible expenses up to the trip cost, while 125% or 150% provides additional coverage above the trip cost for eligible expenses that may come up if the trip is interrupted.\n\nCancel for Any Reason (CFAR) provides additional flexibility by allowing you to cancel your trip for reasons that may not be covered under standard Trip Cancellation coverage. If eligibility requirements are met, it can reimburse a percentage of your insured, non-refundable trip cost.',
            checkBoxLabels: [
              '100% of Trip Cost',
              'Trip Cost + 25%',
              'Trip Cost + 50%',
              'Trip Cost + 100%',
            ],
            radioButtonLabels: [],
            toolTipSecondaryText: '',
            toolTipSecondaryPlans: '',
          },
          cancelForAnyReasonOption: {
            label: 'Cancel for Any Reason',
            toolTipText:
              'CFAR coverage allows you to cancel your trip for any reason within a certain timeframe before departure, and offers reimbursement between 50% - 75% (depending on the plan chosen) of the pre-paid, non-refundable trip costs you insured and have documented.  Depending on the plan, coverage must be purchased within 10 to 21 days after making your initial trip payment, and other requirements must be met.  See plan for full details.',
            checkBoxLabels: ['Included'],
            radioButtonLabels: [],
            toolTipSecondaryText: '',
            toolTipSecondaryPlans: '',
          },
          medical: {
            label: 'Medical Coverage',
            toolTipText:
              'If you require emergency medical treatment due to a covered illness or injury during your trip, the plans offer reimbursement according to the policy limits for covered medical care costs.',
            checkBoxLabels: ['Primary Only'],
            radioButtonLabels: [
              'All Amounts',
              'up to $25,000',
              '$50,000 to $75,000',
              '$100,000 to $150,000',
              '$250,000 and more',
            ],
            toolTipSecondaryText: '',
            toolTipSecondaryPlans: '',
          },
          preExWaiver: {
            label: 'PRE-EX Waivers',
            toolTipText:
              'If you have a pre-existing condition, and purchase travel insurance within a certain timeframe after making a deposit for the trip and meet all other requirements, you may be eligible for a pre-existing conditions waiver. This would waive the pre-existing condition exclusion which usually applies to many of the coverages such as trip cancellation, trip interruption and medical.',
            checkBoxLabels: ['Included'],
            radioButtonLabels: [],
            toolTipSecondaryText: '',
            toolTipSecondaryPlans: '',
          },
          emergencyMedicalEvacuation: {
            label: 'Emergency Evacuation',
            toolTipText:
              'If you are hospitalized during your trip due to a covered illness or injury, and the attending physician deems it necessary  to evacuate you to another location to receive treatment, the assistance company will make arrangements to get you to the nearest appropriate hospital and cover costs up to the plan limit.  Some plans do offer Hospital of Choice coverage, allowing you to choose where you are taken if further treatment is deemed necessary.  See full plan details for further information.',
            checkBoxLabels: ['Primary Only'],
            radioButtonLabels: [
              'All Amounts',
              'up to $150,000',
              '$250,000',
              '$500,000',
              '$1,000,000',
              'Unlimited',
            ],
            toolTipSecondaryText: '',
            toolTipSecondaryPlans: '',
          },
          provider: {
            label: 'Insurance Providers',
            toolTipText:
              "InsureMyTrip works with only the top travel insurance providers in the industry, all backed by A.M. Best ratings, to ensure our customers' satisfaction. We don't accept just any travel insurance company that wants to offer plans on our site. We partner only with providers that offer our customers the right coverage, great service, reliability and best value; that's the basis for our Best Plans Guarantee.",
            checkBoxLabels: [],
            radioButtonLabels: [],
            toolTipSecondaryText: '',
            toolTipSecondaryPlans: '',
          },
          baggageDelay: {
            label: 'Baggage Delay',
            toolTipText:
              'If your baggage is delayed by a common carrier, this coverage will reimburse you for the purchase of necessary personal effects.',
            checkBoxLabels: ['Included'],
            radioButtonLabels: [],
            toolTipSecondaryText: '',
            toolTipSecondaryPlans: '',
          },
          travelDelay: {
            label: 'Travel Delay',
            toolTipText:
              'If you experience a delay while traveling and the delay is caused by a covered reason, you can be reimbursed for the unused part of your prepaid expenses, or for meals, accommodation, and transportation expenses required by the delay.',
            checkBoxLabels: ['Included'],
            radioButtonLabels: [],
            toolTipSecondaryText: '',
            toolTipSecondaryPlans: '',
          },
          accidentalDeath: {
            label: 'Accidental Death',
            toolTipText:
              'This coverage provides a benefit if you are involved in an accident that results in death or a covered loss while on your trip, including while boarding or riding as a passenger on a common carrier conveyance, such as a bus, train, or airplane.',
            checkBoxLabels: ['Included'],
            radioButtonLabels: [],
            toolTipSecondaryText: '',
            toolTipSecondaryPlans: '',
          },
          otherCoverages: {
            label: 'Other Coverages',
            toolTipText: `<strong>Rental Car</strong><br/>
                          If the rental car is damaged in an accident, the cost of repairs and replacements on a rental car may be reimbursable with this benefit.<br/><br/>
                          <strong>Vacation Rental Liability</strong><br/>
                          This property damage coverage helps protect from expenses should accidental damage occur to your rental property during your trip.`,
            checkBoxLabels: ['Rental Car', 'Vacation Rental Liability'],
            radioButtonLabels: [],
            toolTipSecondaryText: '',
            toolTipSecondaryPlans: '',
          },
          baggage: {
            label: 'Baggage',
            toolTipText:
              'Coverage for baggage if it is lost, damaged, or stolen.',
            checkBoxLabels: [
              'up to $750 total',
              '$1000 total',
              '$1500 to $2000 total',
              '$2,500 total and more',
            ],
            radioButtonLabels: [],
            toolTipSecondaryText: '',
            toolTipSecondaryPlans: '',
          },
        },
        soventure: {},
      },
      planDetailModal: {
        plan: null,
      },
      planTagModal: {},
      inputs: {
        pbm_checkbox: {
          label: 'CLICK HERE TO AGREE',
          mobileLabel: 'TAP HERE TO AGREE',
          agreeLabel: 'I AGREE',
          disabled: false,
          required: true,
          hint: '',
          placeholder: '',
        },
        checkboxOption: {
          disabled: false,
          required: false,
          hint: '',
          placeholder: '',
        },
        pbm_radio: {
          disabled: false,
          required: false,
        },
      },
      coverageLimitMap: [],
      evacuationSpecificMap: [
        {
          key: 'emergencyMedicalEvacuation',
          label: 'Evacuation',
          toolTipText:
            'If you become injured or ill during your trip and you are unable to get adequate medical care where you are, this coverage provides transportation to a facility that can treat your medical needs.',
        },
        {
          key: 'evacTo',
          label: 'Evacuation To',
          toolTipText:
            'The nearest suitable hospital or a hospital of your choice depending on the policy terms and conditions',
        },
        {
          key: 'evacFrom',
          label: 'Evacuation From',
          toolTipText:
            'The initial treatment facility or point of injury based on the policy terms and conditions',
        },
        {
          key: 'evacCriteria',
          label: 'Evacuation Criteria',
          toolTipText:
            'Who determines if you will be medically evacuated after an injury or illness during your trip.',
        },
      ],
      medicalSpecificMap: [
        {
          label: 'waiver',
          key: 'preExWaiver',
          toolTipText:
            'Most plans have exclusions for medical problems that result from pre-existing conditions. If you purchase this waiver, you will not be subject to exclusions based on pre-existing conditions.',
        },
        {
          key: 'recurrence',
          label: 'Sudden Recurrence',
          toolTipText:
            'Medical coverage for a sudden and unexpected recurrence of a pre-existing condition that requires immediate treatment.',
        },
        {
          label: 'lookback period',
          key: 'preExPeriod',
          toolTipText:
            'The amount of time that the insurance company will look back to see if you were receiving treatment or had symptoms of an illness or injury.  For some plans, this look-back period may apply also to traveling companions or family members.',
        },
      ],
      secondary: {
        label: 'Secondary',
        header: 'Secondary Coverage',
        toolTipText:
          'This coverage will be paid after any other Primary collectible insurance has paid the claim and the Primary policy limits have been exhausted.',
      },
      flightOnly: {
        label: 'Flight Only',
      },
      coverageTermMapForLTC: {
        cancelForAnyReasonOption: [
          'Cancel For Any Reason',
          'Cancel For Fortuitous Reason',
        ],
        interruptionForAnyReason: [
          'Interrupt For Any Reason',
          'Interrupt For Fortuitous Reason',
        ],
        preExWaiver: [
          'Pre-Existing Condition Waiver',
          'Pre-Existing Conditions Waiver',
        ],
        financialDefault: ['Financial Default'],
      },
      nonAdditionalOptionKeys: [
        'cancelForAnyReason',
        'cancelForFortuitousReason',
        'medical',
        'dental',
        'tripInterruption',
        'tripCancellation',
        'financialDefault',
        'interruptionForAnyReason',
        'interruptionForFortuitousReason',
        'travelDelay',
        'baggageDelay',
        'baggage',
        'vacationRentalDamage',
        'preExWaiver',
        'preExPeriod',
        'emergencyMedicalEvacuation',
        'accidentalDeath24Hour',
        'accidentalDeathCommonCarrier',
        'accidentalDeathFlight',
        'deductible',
      ],
      additionalDetails: {
        headerOne:
          'Looking for Cancel For Any Reason or other time-sensitive benefits?',
        headerTwo:
          'We need a few more details to determine if your trip is eligible',
        tripCostPlaceholder: 'Trip Cost',
        itpPlaceholder: 'First Deposit Date',
        submitButton: 'See More Plans',
        openModalButton: 'Add Trip Details',
        modalHeaderOne: 'Add Trip Details',
        modalHeaderTwo:
          'We Need A Few More Details To Determine If Your Trip Is Eligible',
        tripCostError:
          'Total Trip Cost is required in order to display accurate plan pricing and benefits',
        tripCostMaxError: 'Total Trip Cost cannot exceed $200,000',
        itpError:
          'Initial Trip Payment Date is required in order to display accurate plan pricing and benefits',
      },
      errorModals: {
        noQuoteId: {
          header: 'Quote not found',
          subHeader: '',
          contentType: 'html',
          content:
            "<p>We're sorry, but we could not find your quote.<br/><br/>Please get a new quote and try again.</p>",
          buttonText: 'Get a new Quote',
          buttonMethod: () => {
            const sessionStore = useUserSessionStore();
            sessionStore.setErrorModalState('');
            window.location.href =
              window.location.origin + '/travel-insurance/quote/';
          },
        },
        httpServerError: {
          header: 'Something Went Wrong',
          subHeader: '',
          contentType: 'html',
          content:
            '<p>An unexpected error has occurred.<br/><br/>Please try again later.</p>',
          buttonText: 'Get a new Quote',
          buttonMethod: () => {
            const sessionStore = useUserSessionStore();
            sessionStore.setErrorModalState('');
            window.location.href =
              window.location.origin + '/travel-insurance/quote/';
          },
        },
        noAvailablePlans: {
          header:
            'There are no plans available for your trip based on your quote details',
          subHeader:
            "We're sorry, there are no plans available based on the quote criteria you've entered. Please check your quote details in the form to be sure they are correct.",
          contentType: 'html',
          content:
            'This could be due to U.S. economic and embargo sanctions and/or other applicable trade sanction laws that affect our ability to sell a plan for certain destinations for some travelers. Our team of fully licensed customer care agents are here to help, please contact us via chat, e-mail or call us at 800-487-4722.',
          buttonText: '',
          buttonMethod: () => {},
        },
      },
      planWPContent: {},
      LoaderDataMap: {},
      highlightedCoverageInformation: [],
      planLabels: {},
      planDetailsCoverageLimitMap: [],
    };
  },
  getters: {
    /**
     * Get Header text
     *
     * @returns {State['heading']}
     */
    getHeaderContent(): State['heading'] {
      return this.heading;
    },
    /**
     * Get Quote Details Content
     *
     * @returns {string}
     */
    getQuoteDetailsContentByKey(): (key: string) => string | undefined {
      return (key: string) => {
        const current = this.quoteDetails.find(
          (element) => key === element.key
        );
        return current?.label;
      };
    },
    /**
     * Get coverage labels.
     *
     * @returns {State['coverageLabels']}
     */
    getCoverageLabels(): State['coverageLabels'] {
      const themeStore = useThemeStore();
      if (themeStore.isThemeSoventure) {
        this.coverageLabels.emergencyMedicalEvacuation = 'Evacuation';
      }
      return this.coverageLabels;
    },
    /**
     * Get Trust Factor Content
     *
     * @returns {State['trustFactors']}
     */
    getTrustFactorContent(): State['trustFactors'] {
      return this.trustFactors;
    },
    /**
     * Get Email Quote Content
     *
     * @returns {State['emailQuote']}
     */
    getEmailQuoteContent(): State['emailQuote'] {
      return this.emailQuote;
    },
    /**
     * Get Sort Controller Content
     *
     * @returns {State['sort']}
     */
    getSortContent(): State['sort'] {
      return this.sort;
    },

    getShareContent(): State['share'] {
      return this.share;
    },

    getPlanDetailPlan(): State['planDetailModal']['plan'] {
      return this.planDetailModal.plan;
    },

    /**
     * Gets input content.
     *
     * @returns {State['inputs']}
     */
    getInput(): State['inputs'] {
      return this.inputs;
    },
    /**
     * Gets Option Header Map.
     *
     * @returns {State['optionHeaderMap']}
     */
    getOptionHeaderMap(): State['optionHeaderMap'] {
      return this.optionHeaderMap;
    },
    /**
     * Get Coverage Limit Map
     *
     * @returns {State['coverageLimitMap']}
     */
    getCoverageLimitsMap(): State['coverageLimitMap'] {
      return this.coverageLimitMap;
    },
    /**
     * Get Evacuation Specific Map
     *
     * @returns {State['evacuationSpecificMap']}
     */
    getEvacuationSpecificMap(): State['evacuationSpecificMap'] {
      return this.evacuationSpecificMap;
    },
    /**
     * Get Evacuation Specific Map
     *
     * @returns {State['medicalSpecificMap']}
     */
    getMedicalSpecificMap(): State['medicalSpecificMap'] {
      return this.medicalSpecificMap;
    },
    /**
     * Gets Coverage Option Map.
     *
     * @returns {State['coverageOptionMap']}
     */
    getCoverageOptionMap(): State['coverageOptionMap'] {
      return this.coverageOptionMap;
    },
    getFilterData(): (key: string) => FilterContent {
      const themeStore = useThemeStore();
      return (key: string) => {
        return this.filters[themeStore.getCurrentTheme][key];
      };
    },
    /**
     *
     * @returns {State['secondary']}
     */
    getSecondaryText(): State['secondary'] {
      return this.secondary;
    },
    /**
     *
     * @returns {State['flightOnly']}
     */
    getFlightOnlyText(): State['flightOnly'] {
      return this.flightOnly;
    },
    getLTCSearchTerms(): (coverageKey: string) => string[] {
      return (coverageKey: string) => this.coverageTermMapForLTC[coverageKey];
    },
    /**
     * To avoid rendering options within the "Optional Coverages" Section
     * We will check if this option is an optional coverage
     *
     * @returns {boolean}
     */
    isOptionAnOptionalCoverage(): (optionKey: string) => boolean {
      return (optionKey: string) =>
        !this.nonAdditionalOptionKeys.includes(optionKey);
    },
    /**
     *
     * @returns {string}
     */
    getCoverageKeyByLabel(): (coverageLabel: string) => string {
      return (coverageLabel: string) => {
        const result = Object.entries(this.coverageLabels).find(
          ([_key, value]) => coverageLabel === value
        );

        return result && result?.length > 0 ? result[0] : '';
      };
    },
    /**
     * Gets additional quote details content
     * @returns {State['additionalDetails']}
     */
    getAdditionalDetailsContent(): State['additionalDetails'] {
      return this.additionalDetails;
    },

    /**
     * Gets error modal content.
     *
     * @returns {State['errorModals']}
     */
    getErrorModalContent(): State['errorModals'] {
      return this.errorModals;
    },

    /**
     * @returns {State['redirectToIMTContent']}
     *
     */
    getRedirectToIMTContent(): State['redirectToIMTContent'] {
      return this.redirectToIMTContent;
    },

    getCoverageModalImages(): State['coverageModalImages'] {
      return this.coverageModalImages;
    },

    getPlanTagModalImages(): State['planTagModalImages'] {
      return this.planTagModalImages;
    },

    /**
     * Get Plan Tag Modal Content
     *
     * @returns {string}
     */
    getPlanTagModalImagesByKey(): (key: string) => PlanTagModalImage | null {
      return (key: string) => {
        if (this.planTagModalImages) {
          return this.planTagModalImages[key] ?? null;
        }
        return null;
      };
    },

    getPlanTags(): State['planTags'] {
      return this.planTags;
    },

    getPlanTagsTypeExclude(): State['planTagsTypeExclude'] {
      return this.planTagsTypeExclude;
    },

    getPlanTagsByCode(): (planCode: string) => PlanTagData[] | null {
      return (planCode: string) => {
        if (this.planTags && this.planTags[planCode])
          return this.planTags[planCode];
        return null;
      };
    },
    /**
     * Gets our coverage tool tip by id
     *
     * @param key
     * @returns {string | null}
     */
    getToolTipTextByKey(): (key: string) => string | null {
      return (key: string) => {
        for (const coverageMap of this.coverageLimitMap) {
          for (const coverage of coverageMap.coverages) {
            if (coverage.key === key) {
              return coverage.toolTipText;
            }
          }
        }
        return null;
      };
    },
    /**
     * Get Plan Tag Modal Content
     *
     * @returns {string}
     */
    getPlanTagModalData(): (key: string) => string | null {
      return (key: string) => this.planTagModal[key];
    },
    getFiltersByKey(): (
      key: 'insuremytrip' | 'soventure'
    ) => Record<string, FilterContent> {
      return (key: 'insuremytrip' | 'soventure') => {
        return this.filters[key];
      };
    },
    getOrderedFilterList(): (key: 'insuremytrip' | 'soventure') => string[] {
      return (key: 'insuremytrip' | 'soventure') => {
        return Object.keys(this.filters[key]);
      };
    },
    getShareMessage(): State['share']['message'] {
      return this.share.message;
    },
    getShareEmailContent(): State['share']['email'] {
      return this.share.email;
    },
    getContentToShare(): (
      key: string
    ) =>
      | { type: string; label: string; icon: { url: string; alt: string } }
      | undefined {
      return (key: string) => {
        return this.share.options.find((option) => option.type === key);
      };
    },
    getPermaLinkViaCode(): (planCode: string) => string {
      return (planCode: string) => {
        return this.planWPContent[planCode].permalink;
      };
    },
    getPlanLogo(): (planCode: string) => string | undefined {
      return (planCode: string) => {
        if (planCode in this.planWPContent)
          return this.planWPContent[planCode].logo;

        const apiStore = useApiStore();
        const plan = apiStore.getPlanByPlanCode(planCode);
        return plan?.provider?.logo?.url;
      };
    },
    getPlanDescription(): (planCode: string) => string | undefined {
      return (planCode: string) => {
        if (
          planCode in this.planWPContent &&
          this.planWPContent[planCode].description
        ) {
          return this.planWPContent[planCode].description;
        }

        const apiStore = useApiStore();
        const plan = apiStore.getPlanContent(planCode);
        return plan?.content;
      };
    },
    getLoaderData(): (key: string) => LoaderData {
      return (key: string) => {
        return this.LoaderDataMap[key];
      };
    },
    getSubflowContents(): State['subflowContent'] {
      return this.subflowContent;
    },
    getMoreInfoText(): (
      key: string,
      contentKey: string
    ) => { key: string; heading: string; content: string } | undefined {
      return (key: string, contentKey: string) => {
        if (key in this.planWPContent) {
          const content = this.planWPContent[key].moreInfo?.find(
            (item) => item.key === contentKey
          );
          return content;
        }
        return undefined;
      };
    },
    getHighlightedCoverageInformation(): State['highlightedCoverageInformation'] {
      return this.highlightedCoverageInformation;
    },
    getPlanLabelsByKey(): (key: string) => string | null {
      return (key: string) => {
        if (this.planLabels && key in this.planLabels) {
          return this.planLabels[key].content;
        }
        return null;
      };
    },
    getPlanTypeByKey(): (key: string) => string | null {
      return (key: string) => {
        if (this.planLabels && key in this.planLabels) {
          return this.planLabels[key].plan_type;
        }
        return null;
      };
    },
    getPlanDetailsCoverageLimitMap(): State['planDetailsCoverageLimitMap'] {
      return this.planDetailsCoverageLimitMap;
    },
  },
  actions: {
    setPlanDetailModal(plan: QuoteResult | null) {
      this.planDetailModal.plan = plan;
    },
    addFilterButton(
      filterKey: string,
      typeOfButton: 'checkBoxLabels' | 'radioButtonLabels',
      label: string
    ) {
      const themeStore = useThemeStore();
      if (filterKey in this.filters[themeStore.getCurrentTheme]) {
        this.filters[themeStore.getCurrentTheme][filterKey][typeOfButton].push(label);
      }
    },
    setSoventureTrustFactor(
      trustFactors: State['trustFactors']['soventure']
    ): void {
      this.trustFactors.soventure = trustFactors;
    },
    setIMTTrustFactor(
      trustFactors: State['trustFactors']['insuremytrip']
    ): void {
      this.trustFactors.insuremytrip = trustFactors;
    },
    setRedirectToIMTContent(content: State['redirectToIMTContent']): void {
      this.redirectToIMTContent = content;
    },
    setCoverageLimitMap(): void {
      const apiStore = useApiStore();
      const themeStore = useThemeStore();
      this.coverageLimitMap = [
        {
          header: 'Plan Info',
          coverages: [
            {
              label: 'availability',
              key: 'availability',
              toolTipText: 'Who this plan is available to.',
            },
            {
              label: 'review period',
              key: 'refundWindow',
              toolTipText:
                'The number of days after you have purchased your plan during which you can cancel the plan and receive a full refund, minus any policy fee.',
            },
          ],
        },
        {
          header: 'Medical',
          coverages: [
            {
              label: 'medical limit',
              key: 'medical',
              toolTipText:
                'Coverage for an unforeseen illness or injury that occurs during your trip that requires immediate treatment by a doctor.',
            },
            {
              label: 'dental',
              key: 'dental',
              toolTipText:
                'Coverage for a dental injury or infection that occurs during your trip that requires immediate treatment.',
            },
          ],
        },
        {
          header: 'Trip Protection',
          coverages: [
            {
              label: 'trip interruption',
              key: 'tripInterruption',
              toolTipText:
                'Coverage for non-refundable trip costs in the event you are unable to continue your trip due to a covered reason. This is a post-departure benefit.',
            },
            {
              label: 'trip cancellation',
              key: 'tripCancellation',
              toolTipText:
                'Coverage for the payments and deposits you made before your trip was canceled due to a covered reason. This is a pre-departure benefit.',
            },
            {
              label: 'financial default',
              key: 'financialDefault',
              toolTipText:
                'Coverage for trip cancellation or interruption that is due to the bankruptcy of your travel supplier.',
            },
            {
              label: 'cancel for any reason',
              key: 'cancelForAnyReasonOption',
              toolTipText:
                'Coverage that allows you to cancel your trip for any reason, provided you meet all the requirements of the benefit. This is a pre-departure benefit.',
            },
            {
              label: 'interrupt for any reason',
              key: 'tripInterruptionForAnyReason',
              toolTipText:
                'Coverage that allows you to interrupt your trip for any reason, provided you meet all the requirements of the benefit. This is a post-departure benefit.',
            },
            {
              label: 'travel delay',
              key: 'travelDelay',
              toolTipText:
                'If you experience a delay while traveling and the delay is caused by a covered reason, you can be reimbursed for the unused part of your prepaid expenses, or for meals, accommodation, and transportation expenses required by the delay.',
            },
            {
              label: 'baggage delay',
              key: 'baggageDelay',
              toolTipText:
                'If your baggage is delayed by a common carrier, this coverage will reimburse you for the purchase of necessary personal effects.',
            },
            {
              label: 'baggage loss',
              key: 'baggage',
              toolTipText:
                'Coverage for baggage if it is lost, damaged, or stolen.',
            },
            {
              label: 'vacation rental damage',
              key: 'vacationRentalDamage',
              toolTipText:
                'Property damage protection while renting a vacation home.',
            },
          ],
        },
        {
          header: 'Pre-Existing Conditions',
          coverages: [
            {
              label: 'waiver',
              key: 'preExWaiver',
              toolTipText:
                'Most plans have exclusions for medical problems that result from pre-existing conditions. If you purchase this waiver, you will not be subject to exclusions based on pre-existing conditions.',
            },
            {
              label: 'lookback period',
              key: 'preExPeriod',
              toolTipText:
                'The amount of time that the insurance company will look back to see if you were receiving treatment or had symptoms of an illness or injury.  For some plans, this look-back period may apply also to traveling companions or family members.',
            },
          ],
        },
        {
          header: 'Evacuation',
          coverages: [
            {
              label: 'evacuation',
              key: 'emergencyMedicalEvacuation',
              toolTipText:
                'If you become injured or ill during your trip and you are unable to get adequate medical care where you are, this coverage provides transportation to a facility that can treat your medical needs.',
            },
          ],
        },
        {
          header: 'Accidental Death',
          coverages: [
            {
              label: '24-hr full coverage',
              key: 'accidentalDeath24Hour',
              toolTipText:
                'Provides coverage if you are involved in an accident that causes death or if you suffer a covered loss while on your trip.',
            },
            {
              label: 'common carrier',
              key: 'accidentalDeathCommonCarrier',
              toolTipText:
                'This coverage pays a benefit if you are involved in an accident that causes death or if you suffer a covered loss while boarding or riding as a passenger on a common carrier conveyance, such as a bus or train.',
            },
            {
              label: 'flight',
              key: 'accidentalDeathFlight',
              toolTipText:
                'This coverage pays a benefit if you are involved in an accident that causes death or if you suffer a covered loss while boarding or riding as a passenger on an airplane.',
            },
          ],
        },
        {
          header: 'Optional Coverages',
          coverages: [],
        },
        {
          header: 'Included Benefits',
          coverages: [],
        },
      ];

      if (
        window.location.pathname.includes('compare') &&
        themeStore.isThemeSoventure &&
        Boolean(
          apiStore.getFFValue('cms_20250522_soventure_covered_activities')
        )
      ) {
        this.coverageLimitMap.push({
          header: 'Covered Activities',
          coverages: [],
        });
      }
    },
    setPlanDetailsCoverageLimitMap(): void {
      this.planDetailsCoverageLimitMap = [
        {
          header: 'Medical',
          coverages: [
            {
              label: 'medical limit',
              key: 'medical',
              toolTipText:
                'Coverage for an unforeseen illness or injury that occurs during your trip that requires immediate treatment by a doctor.',
            },
            {
              label: 'dental',
              key: 'dental',
              toolTipText:
                'Coverage for a dental injury or infection that occurs during your trip that requires immediate treatment.',
            },
          ],
        },
        {
          header: 'Trip Protection',
          coverages: [
            {
              label: 'trip interruption',
              key: 'tripInterruption',
              toolTipText:
                'Coverage for non-refundable trip costs in the event you are unable to continue your trip due to a covered reason. This is a post-departure benefit.',
            },
            {
              label: 'trip cancellation',
              key: 'tripCancellation',
              toolTipText:
                'Coverage for the payments and deposits you made before your trip was canceled due to a covered reason. This is a pre-departure benefit.',
            },
            {
              label: 'financial default',
              key: 'financialDefault',
              toolTipText:
                'Coverage for trip cancellation or interruption that is due to the bankruptcy of your travel supplier.',
            },
            {
              label: 'cancel for any reason',
              key: 'cancelForAnyReasonOption',
              toolTipText:
                'Coverage that allows you to cancel your trip for any reason, provided you meet all the requirements of the benefit. This is a pre-departure benefit.',
            },
            {
              label: 'interrupt for any reason',
              key: 'tripInterruptionForAnyReason',
              toolTipText:
                'Coverage that allows you to interrupt your trip for any reason, provided you meet all the requirements of the benefit. This is a post-departure benefit.',
            },
            {
              label: 'travel delay',
              key: 'travelDelay',
              toolTipText:
                'If you experience a delay while traveling and the delay is caused by a covered reason, you can be reimbursed for the unused part of your prepaid expenses, or for meals, accommodation, and transportation expenses required by the delay.',
            },
            {
              label: 'baggage delay',
              key: 'baggageDelay',
              toolTipText:
                'If your baggage is delayed by a common carrier, this coverage will reimburse you for the purchase of necessary personal effects.',
            },
            {
              label: 'baggage loss',
              key: 'baggage',
              toolTipText:
                'Coverage for baggage if it is lost, damaged, or stolen.',
            },
            {
              label: 'vacation rental damage',
              key: 'vacationRentalDamage',
              toolTipText:
                'Property damage protection while renting a vacation home.',
            },
          ],
        },
        {
          header: 'Pre-Existing Conditions',
          coverages: [
            {
              label: 'waiver',
              key: 'preExWaiver',
              toolTipText:
                'Most plans have exclusions for medical problems that result from pre-existing conditions. If you purchase this waiver, you will not be subject to exclusions based on pre-existing conditions.',
            },
            {
              label: 'lookback period',
              key: 'preExPeriod',
              toolTipText:
                'The amount of time that the insurance company will look back to see if you were receiving treatment or had symptoms of an illness or injury.  For some plans, this look-back period may apply also to traveling companions or family members.',
            },
          ],
        },
        {
          header: 'Evacuation',
          coverages: [
            {
              label: 'evacuation',
              key: 'emergencyMedicalEvacuation',
              toolTipText:
                'If you become injured or ill during your trip and you are unable to get adequate medical care where you are, this coverage provides transportation to a facility that can treat your medical needs.',
            },
          ],
        },
        {
          header: 'Accidental Death',
          coverages: [
            {
              label: '24-hr full coverage',
              key: 'accidentalDeath24Hour',
              toolTipText:
                'Provides coverage if you are involved in an accident that causes death or if you suffer a covered loss while on your trip.',
            },
            {
              label: 'common carrier',
              key: 'accidentalDeathCommonCarrier',
              toolTipText:
                'This coverage pays a benefit if you are involved in an accident that causes death or if you suffer a covered loss while boarding or riding as a passenger on a common carrier conveyance, such as a bus or train.',
            },
            {
              label: 'flight',
              key: 'accidentalDeathFlight',
              toolTipText:
                'This coverage pays a benefit if you are involved in an accident that causes death or if you suffer a covered loss while boarding or riding as a passenger on an airplane.',
            },
          ],
        },
        {
          header: 'Optional Coverages',
          coverages: [],
        },
        {
          header: 'Included Benefits',
          coverages: [],
        },
        {
          header: 'Covered Activities',
          coverages: [],
        },
        {
          header: 'Description',
          coverages: [],
        },
        {
          header: 'Plan Info',
          coverages: [
            {
              label: 'availability',
              key: 'availability',
              toolTipText: 'Who this plan is available to.',
            },
            {
              label: 'review period',
              key: 'refundWindow',
              toolTipText:
                'The number of days after you have purchased your plan during which you can cancel the plan and receive a full refund, minus any policy fee.',
            },
            {
              label: 'certificate',
              key: 'certificate',
              toolTipText: 'Certificate of Coverage',
            },
          ],
        },
      ];
    },
    setCoverageModalImages(images: State['coverageModalImages']): void {
      this.coverageModalImages = images;
    },
    setPlanTagModalImages(images: State['planTagModalImages']): void {
      this.planTagModalImages = images;
    },
    setPlanTags(planTags: PlanTagDataStore): void {
      this.planTags = planTags;
    },
    setPlanTypeTagsExclude(planTagsTypeExclude: PlanTagsTypeExclude): void {
      this.planTagsTypeExclude = planTagsTypeExclude;
    },
    setPlanTagModals(planTagModals: PlanTagModalStore): void {
      this.planTagModal = planTagModals;
    },
    setLoaderData(key: string, data: LoaderData) {
      this.LoaderDataMap[key] = data;
    },
    setFilters(key: 'insuremytrip' | 'soventure', filters: any): void {
      this.filters[key] = filters;
    },
    setShareButtonLabel(label: State['share']['label']): void {
      this.share.label = label;
    },
    setShareMessageContent(message: State['share']['message']): void {
      this.share.message = message;
    },
    setShareEmailContent(email: State['share']['email']): void {
      this.share.email = email;
    },
    setShareOptions(options: State['share']['options']): void {
      this.share.options = options;
    },
    setShareOptionLabel(optionType: string, label: string) {
      const index = this.share.options.findIndex(
        (ele) => ele.type === optionType
      );
      if (index !== -1) {
        this.share.options[index].label = label;
      }
    },
    async setWPPlanContent() {
      try {
        let dataCollection = {};
        if (window.ACF_PAGE_DATA_RESULTS?.plans_content) {
          dataCollection = window.ACF_PAGE_DATA_RESULTS.plans_content;
        } else {
          const { data } = await axios.get(API_ENDPOINTS.cms.getPlanContent());
          dataCollection = data;
        }
        for (const [code, entries] of Object.entries(dataCollection)) {
          const entry = entries as {
            logo: string;
            permalink: string;
            description: string;
            more_info_modal: {
              key: string;
              heading: string;
              content: string;
            }[];
          };
          this.planWPContent[code] = {
            logo: entry.logo,
            permalink: entry.permalink,
            description: entry.description,
            moreInfo: entry.more_info_modal,
          };
        }
      } catch (error) {
        handleWordpressContentError(
          error,
          `Error fetching plan content on ${window.location.hostname}`
        );
      }
    },
    setSubflowContents(Content: State['subflowContent']): void {
      this.subflowContent = Content;
    },
    setHighlightedCoverageInformation(data: {
      heading: string;
      description: string | null;
      markerType: PlanRowMarkerType | null;
      defaultColor?: string;
    }): void {
      const { heading, description, markerType, defaultColor } = data;
      this.highlightedCoverageInformation?.push({
        heading: heading,
        description: description,
        iconColor: resolveCoverageMarkerColor(markerType, defaultColor),
      });
    },
    removeHighlightedCoverageInformation(): void {
      this.highlightedCoverageInformation = [];
    },
    setPlanLabels(planLabels: State['planLabels']): void {
      this.planLabels = planLabels;
    },
  },
});
