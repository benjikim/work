import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useContentStore } from '@/store/content';
import axios from 'axios';
import { useThemeStore } from '@/store/theme';

// Mock the entire axios module
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);;

describe('useContentStore', () => {
  // Create a fresh Pinia instance before each test
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('Initial State', () => {
    it('should initialize with default IMT content values', () => {
      const store = useContentStore();
      expect(store.cmsContent.quoteFormHeading).toEqual({
        headline: '',
        help_text_header: '',
        help_text_content: ''
      });
      expect(store.cmsContent.quoteFormContent).toEqual({
        destination: {
          header: '',
          help_content: '',
          help_content_mobile: '',
          country: {
            placeholder: '',
            label: '',
            error_message: ''
          },
          state: {
            placeholder: '',
            label: '',
            error_message: ''
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
            error_message: ''
          },
          return_date: {
            placeholder: '',
            label: '',
            error_message: ''
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
            error_message: ''
          },
          state: {
            placeholder: '',
            label: '',
            error_message: ''
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
            error_message: ''
          },
          number_of_travelers: {
            placeholder: '',
            label: '',
            error_message: ''
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
            error_message: ''
          },
          trip_cost: {
            placeholder: '',
            label: '',
            error_message: ''
          },
          tool_tip: {
            header: '',
            text: '',
            secondary_text: '',
          },
        }
      });

      expect(store.filterToolTipOpen).toEqual(false);

      expect(store.activeToolTip).toEqual({
      header: '',
      text: '',
      secondary_text: '',
    });

      expect(store.toolTipStatus).toEqual([
        { id: 'destination', status: false },
        { id: 'travel_dates', status: false },
        { id: 'traveler_info', status: false },
        { id: 'citizenship', status: false },
        { id: 'coverage_info', status: false },
      ]);
    });
  });

  describe('Getters', () => {
    it('getQuoteFormHeadline should return the Headline', () => {
      const store = useContentStore();
      expect(store.getQuoteFormHeadline).toBe('');

      store.cmsContent.quoteFormHeading.headline = "Let's Find The Right Plan For You";
      expect(store.getQuoteFormHeadline).toBe("Let's Find The Right Plan For You");
    });

    it('getQuoteFormContentByKey should return row contents', () => {
      const store = useContentStore();
      const content = {
        destination: {
          header: 'Destination',
          help_content: '',
          help_content_mobile: '',
          country: {
            placeholder: '',
            label: '',
            error_message: ''
          },
          state: {
            placeholder: '',
            label: '',
            error_message: ''
          },
          tool_tip: {
            header: '',
            text: '',
            secondary_text: '',
          },
        },
        travel_dates: {
          header: '',
          help_content: '',
          help_content_mobile: '',
          departure_date: {
            placeholder: '',
            label: '',
            error_message: ''
          },
          return_date: {
            placeholder: '',
            label: '',
            error_message: ''
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
            error_message: ''
          },
          state: {
            placeholder: '',
            label: '',
            error_message: ''
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
            error_message: ''
          },
          number_of_travelers: {
            placeholder: '',
            label: '',
            error_message: ''
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
            error_message: ''
          },
          trip_cost: {
            placeholder: '',
            label: '',
            error_message: ''
          },
          tool_tip: {
            header: '',
            text: '',
            secondary_text: '',
          },
        }
      };

      store.cmsContent.quoteFormContent = content;
      expect(store.getQuoteFormContentByKey('destination')).toStrictEqual(content.destination);
    });

    it('isToolTipOpen should return open status tool tip modal', () => {
      const store = useContentStore();

      expect(store.isToolTipOpen).toBe(false);

      store.filterToolTipOpen = true;
      expect(store.isToolTipOpen).toBe(true);
    });

    it('getActiveToolTip should return activce selected tool tip object', () => {
      const store = useContentStore();

      expect(store.getActiveToolTip).toStrictEqual({
        header: '',
        text: '',
        secondary_text: '',
      });

      store.activeToolTip = {
        header: 'testing',
        text: '',
        secondary_text: '',
      }

      expect(store.getActiveToolTip).toStrictEqual({
        header: 'testing',
        text: '',
        secondary_text: '',
      });
    });
  });

  describe('Actions - initializeCmsContentFromWordpress', () => {
    it('should set qoute form headings and quote form content', async () => {
      const store = useContentStore();
      const heading = {
          headline: "Let's Find The Right Plan For You",
          help_text_header: '',
          help_text_content: ''
      };

      const content = {
        destination: {
          header: 'Destination',
          help_content: '',
          help_content_mobile: '',
          country: {
            placeholder: '',
            label: '',
            error_message: ''
          },
          state: {
            placeholder: '',
            label: '',
            error_message: ''
          }
        },
        travel_dates: {
          header: '',
          help_content: '',
          help_content_mobile: '',
          departure_date: {
            placeholder: '',
            label: '',
            error_message: ''
          },
          return_date: {
            placeholder: '',
            label: '',
            error_message: ''
          }
        },
        citizenship: {
          header: '',
          help_content: '',
          help_content_mobile: '',
          country: {
            placeholder: '',
            label: '',
            error_message: ''
          }
        },
        residence: {
          header: '',
          help_content: '',
          help_content_mobile: '',
          country: {
            placeholder: '',
            label: '',
            error_message: ''
          },
          state: {
            placeholder: '',
            label: '',
            error_message: ''
          }
        },
        traveler_info: {
          header: '',
          help_content: '',
          help_content_mobile: '',
          age: {
            placeholder: '',
            label: '',
            error_message: ''
          },
          number_of_travelers: {
            placeholder: '',
            label: '',
            error_message: ''
          }
        },
        coverage_info: {
          header: '',
          help_content: '',
          help_content_mobile: '',
          initial_trip_payment_date: {
            placeholder: '',
            label: '',
            error_message: ''
          },
          trip_cost: {
            placeholder: '',
            label: '',
            error_message: ''
          }
        }
      };

      const mockCmsContent = { 'quote_form_heading': heading, 'quote_form_content': content };

      mockedAxios.get.mockResolvedValue({ data: mockCmsContent });

      await store.initializeCmsContentFromWordpress();

      const themeStore = useThemeStore();
      const wpHost = import.meta.env.DEV
        ? themeStore.getCurrentTheme === 'soventure'
          ? 'soventure.localhost'
          : 'insuremytrip.localhost'
        : window.location.hostname;

      expect(mockedAxios.get).toHaveBeenCalledWith(`https://${wpHost}/wp-json/imt-blocks/v1/quote-form`);
      expect(store.cmsContent.quoteFormHeading).toStrictEqual(heading);
      expect(store.cmsContent.quoteFormContent).toStrictEqual(content);
    });

    it('setToolTipModalOpen should set the tool tip modal status', async () => {
      const store = useContentStore();
      expect(store.filterToolTipOpen).toBe(false);

      store.setToolTipModalOpen(true);
      expect(store.filterToolTipOpen).toBe(true);
    });

    it('setActiveToolTip should set the active tool tip object', async () => {
      const store = useContentStore();

      const toolTip = {
        header: 'testing',
        text: '',
        secondary_text: '',
      }

      expect(store.activeToolTip).toStrictEqual({
        header: '',
        text: '',
        secondary_text: '',
      });

      store.setActiveToolTip(toolTip);
      
      expect(store.activeToolTip).toStrictEqual(toolTip);
    });

    it('setToolTipStatusById should set the individual tool tip status to true and set the other to false', async () => {
      const store = useContentStore();

      const toolTipStatus = [
        { id: 'destination', status: true },
        { id: 'travel_dates', status: false },
        { id: 'traveler_info', status: false },
        { id: 'citizenship', status: false },
        { id: 'coverage_info', status: false },
      ]

      store.setToolTipStatusById('destination', true);

      expect(store.toolTipStatus).toStrictEqual(toolTipStatus);
    });

    it('getToolTipStatusById should get the tool tip by key id', async () => {
      const store = useContentStore();

      store.getToolTipStatusById('destination');

      expect(store.getToolTipStatusById('destination')).toBe(false);

      store.setToolTipStatusById('destination', true);

      expect(store.getToolTipStatusById('destination')).toBe(true);

    });

    it('hasAnyContent should return boolean if there is content or not', async () => {
      const store = useContentStore();

      expect(store.hasAnyContent({
        header: '',
        text: '',
        secondary_text: '',
      })).toBe(false);

      expect(store.hasAnyContent({
        header: 'Testing header',
        text: '',
        secondary_text: '',
      })).toBe(true);

    });
  });
});
