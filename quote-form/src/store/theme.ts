import { defineStore } from 'pinia';
import type { ThemeName, ThemeMode, ModeFeatures } from '@/types';
import { themeConfig } from '@/config';

interface State {
  currentTheme: {
    name: ThemeName;
    tripCostLimit: number;
    currentMode: ThemeMode;
    modeFeatures: ModeFeatures;
    primaryColor: string;
    secondaryColor: string;
  };
  isInitialized: boolean;
  isMobile: boolean;
  isOnResultsPage: boolean;
}

export const useThemeStore = defineStore('theme', {
  state: (): State => ({
    currentTheme: {
      name: 'insuremytrip',
      tripCostLimit: 200000,
      currentMode: 'default',
      modeFeatures: themeConfig.insuremytrip.default,
      primaryColor: '#77BB33',
      secondaryColor: '#C9E3AD',
    },
    isInitialized: false,
    isMobile: false,
    isOnResultsPage: false,
  }),

  getters: {
    getCurrentTheme(): State['currentTheme']['name'] {
      return this.currentTheme.name;
    },
    getCurrentThemeMode(): State['currentTheme']['currentMode'] {
      return this.currentTheme.currentMode;
    },
    isThemeIMT(): boolean {
      return this.currentTheme.name === 'insuremytrip';
    },
    isThemeSoventure(): boolean {
      return this.currentTheme.name === 'soventure';
    },
    getTripCostLimit(): State['currentTheme']['tripCostLimit'] {
      return this.currentTheme.tripCostLimit;
    },
    getPrimaryColor(): State['currentTheme']['primaryColor'] {
      return this.currentTheme.primaryColor;
    },
    getSecondaryColor(): State['currentTheme']['secondaryColor'] {
      return this.currentTheme.secondaryColor;
    },
    isDestinationSectionEnabled(): State['currentTheme']['modeFeatures']['destinationSection'] {
      return this.currentTheme.modeFeatures.destinationSection;
    },
    isTravelDatesSectionEnabled(): State['currentTheme']['modeFeatures']['travelDatesSection'] {
      return this.currentTheme.modeFeatures.travelDatesSection;
    },
    getNumberOfTravelers(): State['currentTheme']['modeFeatures']['numberOfTravelers'] {
      return this.currentTheme.modeFeatures.numberOfTravelers;
    },
    isCitizenshipSectionEnabled(): State['currentTheme']['modeFeatures']['citizenshipSection'] {
      return this.currentTheme.modeFeatures.citizenshipSection;
    },
    isCitizenshipCountryEnabled(): State['currentTheme']['modeFeatures']['citizenshipCountry'] {
      return this.currentTheme.modeFeatures.citizenshipCountry;
    },
    isResidenceCountryEnabled(): State['currentTheme']['modeFeatures']['residenceCountry'] {
      return this.currentTheme.modeFeatures.residenceCountry;
    },
    isResidenceStateEnabled(): State['currentTheme']['modeFeatures']['residenceState'] {
      return this.currentTheme.modeFeatures.residenceState;
    },
    isTripCostSectionEnabled(): State['currentTheme']['modeFeatures']['tripCostSection'] {
      return this.currentTheme.modeFeatures.tripCostSection;
    },
    getIsMobile(): boolean {
      return this.isMobile;
    },
    isOnResultPage(): boolean {
      return this.isOnResultsPage;
    },
    getFormattedTripCostLimit(): string {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(this.getTripCostLimit);
    },
  },

  actions: {
    /**
     * Initialize the theme based on the hostname.
     * If the hostname includes 'soventure', set the theme to 'soventure'.
     * Otherwise, set the theme to 'insuremytrip'.
     * Set isInitialized to true after initialization.
     */
    initializeTheme(): void {
      if (this.isInitialized) return;

      if (
        window.location.hostname.includes('soventure') ||
        (import.meta.env.MODE === 'development' &&
          import.meta.env.VITE_THEME_APP === 'soventure')
      ) {
        this.setSoventureTheme();
      } else {
        this.setInsuremytripTheme();
      }

      // Allow partner payload to override brand colors if present
      this.setPartnerTheme();

      this.isInitialized = true;
    },

    /**
     * If a partner payload exists on window.imtPartnerObject, use its
     * brand primary/secondary colors to override the current theme colors.
     */
    setPartnerTheme(): void {
      try {
        const payload = (window as any).imtPartnerObject; // example name, this might change once we actually have a partner payload to work with
        const partner = payload?.partner;
        const brand = partner?.brand;

        if (!brand) return;

        const primary = brand.primaryColor;
        const secondary = brand.secondaryColor;

        if (primary && typeof primary === 'string') {
          this.currentTheme.primaryColor = primary;
        }
        if (secondary && typeof secondary === 'string') {
          this.currentTheme.secondaryColor = secondary;
        }
      } catch (e) {
        console.error('Error setting partner theme:', e);
      }
    },

    /**
     * Sets the current theme to 'soventure' and current mode to 'default'.
     */
    setSoventureTheme(): void {
      this.currentTheme.name = 'soventure';
      this.currentTheme.tripCostLimit = 150000;
      this.currentTheme.primaryColor = '#F78403';
      this.currentTheme.secondaryColor = '#F9A342';
      this.currentTheme.currentMode = 'default';
    },

    /**
     * Sets the current theme to 'insuremytrip' and current mode to 'default' or specific mode based on the data-mode attribute of the quote-form-v2 element.
     * If the mode is 'edu', sets numberOfTravelers to 1.
     * If the mode is 'annual', sets destinationSection, travelDatesSection, citizenshipSection, residenceCountry and tripCostSection to false.
     * If the mode is 'cruise', sets current mode to 'cruise' and technically works the same as 'default'.
     * If the mode is not 'edu', 'annual' or 'cruise', sets current mode to 'default'.
     */
    setInsuremytripTheme(): void {
      this.currentTheme.name = 'insuremytrip';

      const queryParams = new URLSearchParams(window.location.search);

      const mode =
        document
          .getElementById('quote-form-v2')
          ?.getAttribute('data-mode')
          ?.toLowerCase() || queryParams.get('mode')?.toLowerCase();

      if (mode && themeConfig.insuremytrip[mode as ThemeMode]) {
        this.currentTheme.currentMode = mode as ThemeMode;
        this.currentTheme.modeFeatures =
          themeConfig.insuremytrip[this.currentTheme.currentMode] ??
          themeConfig.insuremytrip.default;
      } else {
        this.currentTheme.currentMode = 'default';
        this.currentTheme.modeFeatures = themeConfig.insuremytrip.default;
      }
    },

    setIsMobile(isMobile: boolean): void {
      this.isMobile = isMobile;
    },
    setIsOnResultsPage(isOnResultsPage: boolean): void {
      this.isOnResultsPage = isOnResultsPage;

      if (isOnResultsPage) {
        document.body.classList.add('qf-v2-in-qr');
      }
    },
  },
});
