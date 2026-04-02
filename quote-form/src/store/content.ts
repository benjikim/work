// src/stores/contentStore.ts
import { defineStore } from 'pinia';
import { useThemeStore } from '@/store/theme';
import type { InputField } from '@/types';
import axios from 'axios';

interface GeographyItem {
  code: string;
  value: string;
  countryCode: string | null;
}

interface DestinationItem {
  code: string;
  value: string;
  alias: string;
  lemma: string;
}

interface GeographyData {
  citizenships: GeographyItem[];
  destinations: DestinationItem[];
  residences: GeographyItem[];
  residenceCountries: GeographyItem[];
}

interface ToolTipStatusItem {
  id: string;
  status: boolean;
}

interface State {
  cmsContent: {
    quoteFormHeading: {
      headline: string;
      help_text_header: string;
      help_text_content: string;
    };
    quoteFormContent: {
      destination: {
        header: string;
        help_content: string;
        help_content_mobile: string;
        country: InputField;
        state: InputField;
        tool_tip: {
          header: string;
          text: string;
          secondary_text: string;
        };
      };
      travel_dates: {
        header: string;
        help_content: string;
        help_content_mobile: string;
        departure_date: InputField;
        return_date: InputField;
        tool_tip: {
          header: string;
          text: string;
          secondary_text: string;
        };
      };
      citizenship: {
        header: string;
        help_content: string;
        help_content_mobile: string;
        placeholder: string,
        label: string,
        error_message: string,
        tool_tip: {
          header: string;
          text: string;
          secondary_text: string;
        };
      };
      residence: {
        header: string;
        help_content: string;
        help_content_mobile: string;
        country: InputField;
        state: InputField;
        tool_tip: {
          header: string;
          text: string;
          secondary_text: string;
        };
      };
      traveler_info: {
        header: string;
        help_content: string;
        help_content_mobile: string;
        age: InputField;
        number_of_travelers: InputField;
        tool_tip: {
          header: string;
          text: string;
          secondary_text: string;
        };
      };
      coverage_info: {
        header: string;
        help_content: string;
        help_content_mobile: string;
        initial_trip_payment_date: InputField;
        trip_cost: InputField;
        tool_tip: {
          header: string;
          text: string;
          secondary_text: string;
        };
      };
    };
  };
  geographyData: GeographyData;
  filterToolTipOpen: boolean;
  activeToolTip: {
    header: string;
    text: string;
    secondary_text: string;
  };
  toolTipStatus: ToolTipStatusItem[];
}

export const useContentStore = defineStore('content', {
  state: (): State => ({
    cmsContent: {
      quoteFormContent: {
        destination: {
          header: '',
          help_content: '',
          help_content_mobile: '',
          country: {
            placeholder: '',
            label: '',
            error_message: '',
          },
          state: {
            placeholder: '',
            label: '',
            error_message: '',
          },
          tool_tip: {
            header: '',
            text: '',
            secondary_text: '',
          }
        },
        travel_dates: {
          header: '',
          help_content: '',
          help_content_mobile: '',
          departure_date: {
            placeholder: '',
            label: '',
            error_message: '',
          },
          return_date: {
            placeholder: '',
            label: '',
            error_message: '',
          },
          tool_tip: {
            header: '',
            text: '',
            secondary_text: '',
          },
        },
        citizenship: {
          header: '',
          help_content: '',
          help_content_mobile: '',
          placeholder: '',
          label: '',
          error_message: '',
          tool_tip: {
            header: '',
            text: '',
            secondary_text: '',
          },
        },
        residence: {
          header: '',
          help_content: '',
          help_content_mobile: '',
          country: {
            placeholder: '',
            label: '',
            error_message: '',
          },
          state: {
            placeholder: '',
            label: '',
            error_message: '',
          },
          tool_tip: {
            header: '',
            text: '',
            secondary_text: '',
          },
        },
        traveler_info: {
          header: '',
          help_content: '',
          help_content_mobile: '',
          age: {
            placeholder: '',
            label: '',
            error_message: '',
          },
          number_of_travelers: {
            placeholder: '',
            label: '',
            error_message: '',
          },
          tool_tip: {
            header: '',
            text: '',
            secondary_text: '',
          },
        },
        coverage_info: {
          header: '',
          help_content: '',
          help_content_mobile: '',
          initial_trip_payment_date: {
            placeholder: '',
            label: '',
            error_message: '',
          },
          trip_cost: {
            placeholder: '',
            label: '',
            error_message: '',
          },
          tool_tip: {
            header: '',
            text: '',
            secondary_text: '',
          },
        },
      },
      quoteFormHeading: {
        headline: '',
        help_text_header: '',
        help_text_content: '',
      },
    },
    geographyData: {
      citizenships: [],
      destinations: [],
      residences: [],
      residenceCountries: [],
    },
    filterToolTipOpen: false,
    activeToolTip: {
      header: '',
      text: '',
      secondary_text: '',
    },
    toolTipStatus: [
      { id: 'destination', status: false },
      { id: 'travel_dates', status: false },
      { id: 'traveler_info', status: false },
      { id: 'citizenship', status: false },
      { id: 'coverage_info', status: false },
    ] as ToolTipStatusItem[],
  }),
  getters: {
    /**
     * Get the Quote Form Headline
     *
     * @returns string
     */
    getQuoteFormHeadline(): State['cmsContent']['quoteFormHeading']['headline'] {
      return this.cmsContent.quoteFormHeading?.headline ?? '';
    },
    /**
     * Get Quote form content such as destination, travel_dates, citizenship,
     * residence, traveler_info, coverage_info
     *
     * @param key string
     *
     * @returns {State['cmsContent']['quoteFormContent'][keyof State['cmsContent']['quoteFormContent']]}
     */
    getQuoteFormContentByKey(): <
      K extends keyof State['cmsContent']['quoteFormContent'],
    >(
      key: K
    ) => State['cmsContent']['quoteFormContent'][K] {
      return <K extends keyof State['cmsContent']['quoteFormContent']>(
        key: K
      ) => this.cmsContent.quoteFormContent[key];
    },

    getCitizenshipList(): GeographyItem[] {
      return this.geographyData.citizenships;
    },

    getDestinationList(): DestinationItem[] {
      return this.geographyData.destinations;
    },

    getStatesList(): GeographyItem[] {
      return this.geographyData.residences.filter(
        item => item.countryCode !== "CAN"
      );
    },

    isToolTipOpen(): State['filterToolTipOpen'] {
      return this.filterToolTipOpen;
    },

    getActiveToolTip(): State['activeToolTip'] {
      return this.activeToolTip;
    },

    getResidenceCountries(): GeographyItem[] {
      return this.geographyData.residenceCountries;
    }
  },
  actions: {
    /**
     * initialize CMS content from wordpress using an api call to get the contents
     *
     * @returns {void}
     */
    async initializeCmsContentFromWordpress() {
      // If we are on local, lets grab content from imtqa, otherwise use current hostname
      const themeStore = useThemeStore();

      const wpHost = import.meta.env.DEV
        ? themeStore.getCurrentTheme === 'soventure'
          ? 'soventure.localhost'
          : 'insuremytrip.localhost'
        : window.location.hostname;

      try {
        const wordpressCmsContent = await axios.get(
          `https://${wpHost}/wp-json/imt-blocks/v1/quote-form`
        );
        const themeStore = useThemeStore();
        const mode =
          themeStore.getCurrentThemeMode !== 'default'
            ? themeStore.getCurrentThemeMode
            : false;
        const subflowContent = mode
          ? wordpressCmsContent?.data?.quote_form_subflow_content.find(
              (subflow: { subflow_type: string }) =>
                subflow.subflow_type === mode
            )
          : '';
        const quoteFormContent = mode
          ? subflowContent?.quote_form_content
          : wordpressCmsContent?.data?.quote_form_content;
        if (quoteFormContent && Object.keys(quoteFormContent).length > 0) {
          this.cmsContent.quoteFormContent = quoteFormContent;
        }
        const quoteFormHeading = mode
          ? subflowContent?.quote_form_heading
          : wordpressCmsContent?.data?.quote_form_heading;
        if (quoteFormHeading && Object.keys(quoteFormHeading).length > 0) {
          this.cmsContent.quoteFormHeading = quoteFormHeading;
        }
      } catch (error) {
        console.error(error);
      }
    },

    /**
     * Set all geography data at once
     */
    setGeographyData(payload: Partial<GeographyData>) {
      if (payload.citizenships) {
        this.geographyData.citizenships = payload.citizenships;
      }

      if (payload.destinations) {
        this.geographyData.destinations = payload.destinations;
      }

      if (payload.residences) {
        this.geographyData.residences = payload.residences;
      }

      if (payload.residenceCountries) {
        this.geographyData.residenceCountries = payload.residenceCountries;
      }
    },

    setToolTipModalOpen(val: boolean) {
      this.filterToolTipOpen = val;
    },

    setActiveToolTip(val: any) {
      this.activeToolTip = val;
    },

    setToolTipStatusById(id: string, toolTipNewStatus: boolean) {
      this.toolTipStatus.forEach(item => {
        if (item.id === id) {
          item.status = toolTipNewStatus
        } else {
          item.status = false
        }
      })
    },

    getToolTipStatusById(id: string): boolean {
      return this.toolTipStatus.find(item => item.id === id)?.status ?? false;
    },

    hasAnyContent(content: Record<string, string>): boolean {
      return Object.values(content).some(
        value => value.trim().length > 0
      )
    }
  },
});
