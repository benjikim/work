import { defineStore } from 'pinia';
import {
  ThemeName,
  ThemeMode,
  PartnerTrustFactor,
  ImtPartnerObject,
} from '@/types';
import { useApiStore } from './api';
import * as configcat from 'configcat-js';

declare global {
  interface Window {
    imtPartnerObject?: ImtPartnerObject;
  }
}

interface State {
  currentTheme: {
    name: ThemeName;
    currentMode: ThemeMode;
    primaryColor: string;
    secondaryColor: string;
    partnerTrustFactor?: PartnerTrustFactor;
  };
  isInitialized: boolean;
  isMobile: boolean;
}

export const useThemeStore = defineStore('theme', {
  state: (): State => ({
    currentTheme: {
      name: 'insuremytrip',
      currentMode: 'default',
      primaryColor: '#77bb33',
      secondaryColor: '#C9E3AD',
    },
    isInitialized: false,
    isMobile: false,
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
      return (
        this.currentTheme.name === 'soventure' ||
        window.location.hostname.includes('soventure') ||
        this.isLocalThemeSoventure ||
        this.isProductQAThemeSoventure
      );
    },
    getIsMobile(): boolean {
      return this.isMobile;
    },
    isModeEdu(): boolean {
      return this.currentTheme.currentMode === 'edu';
    },
    isModeAnnual(): boolean {
      return this.currentTheme.currentMode === 'annual';
    },
    isModeCruise(): boolean {
      return this.currentTheme.currentMode === 'cruise';
    },
    isModeDefault(): boolean {
      return this.currentTheme.currentMode === 'default';
    },
    /**
     * Check to see if local theme is SOVENTURE
     * @returns {boolean}
     */
    isLocalThemeSoventure(): boolean {
      return (
        import.meta.env.MODE === 'development' &&
        import.meta.env.VITE_THEME_APP === 'soventure'
      );
    },
    /**
     * Checks to see if hostname is a qaBox[XX] and if
     * soventure flag is on.
     * @returns Boolean
     */
    isProductQAThemeSoventure() {
      const hostname = window.location.hostname;
      const apiStore = useApiStore();

      return (
        Boolean(hostname.match(/^qa([1-9][0-9]?)\./)) &&
        Boolean(apiStore.getFFValue('cms_20250303_soventure_theme_us_release'))
      );
    },
    getPartnerTrustFactor(): PartnerTrustFactor | undefined | null {
      return this.currentTheme.partnerTrustFactor;
    },
  },

  actions: {
    /**
     * Initialize the theme based on the hostname.
     * If the hostname includes 'soventure', set the theme to 'soventure'.
     * Otherwise, set the theme to 'insuremytrip'.
     * Set isInitialized to true after initialization.
     */
    async initializeTheme(): Promise<void> {
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

      // TODO: When partern data is available on WP remove this
      const configCatClient = configcat.getClient(
        import.meta.env.VITE_CONFIG_CAT_SDK_KEY
      );
      let imtPartnerObject = '';

      try {
        if (
          !window?.imtPartnerObject &&
          import.meta.env.MODE !== 'production'
        ) {
          imtPartnerObject = await configCatClient?.getValueAsync(
            'imt_20260320_partner_placeholder_data',
            ''
          );
          window.imtPartnerObject =
            imtPartnerObject.trim().length > 0
              ? JSON.parse(imtPartnerObject) || {}
              : {};
        }
      } catch (error) {
        console.error('Error fetching partner data feature flag:', error);
      }

      // Allow partner payload to override brand colors if present
      this.setPartnerTheme();

      this.isInitialized = true;
    },

    /**
     * Sets the current theme to 'soventure' and current mode to 'default'.
     */
    setSoventureTheme(): void {
      this.currentTheme.name = 'soventure';
      this.currentTheme.currentMode = 'default';
      this.currentTheme.primaryColor = '#F78403';
      this.currentTheme.secondaryColor = '#F9A342';
      document.documentElement.classList.add(this.currentTheme.name);
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
        const trustFactor = partner?.trustFactors;
        const root = document.documentElement;

        if (!brand) return;

        const primary = brand.primaryColor;
        const secondary = brand.secondaryColor;

        if (primary && typeof primary === 'string') {
          this.currentTheme.primaryColor = primary;
          root.style.setProperty('--color-primary-btn', primary);
          root.style.setProperty('--brand-primary', primary);
        }
        if (secondary && typeof secondary === 'string') {
          this.currentTheme.secondaryColor = secondary;
          root.style.setProperty('--brand-secondary', secondary);
        }

        if (trustFactor) {
          this.currentTheme.partnerTrustFactor = trustFactor;
        }
      } catch (e) {
        console.error('Error setting partner theme:', e);
      }
    },

    /**
     * Sets the current theme to 'insuremytrip'
     */
    setInsuremytripTheme(): void {
      this.currentTheme.name = 'insuremytrip';
      document.documentElement.classList.add(this.currentTheme.name);
    },
    setMode(mode: ThemeMode): void {
      this.currentTheme.currentMode = mode;
    },

    setIsMobile(isMobile: boolean): void {
      this.isMobile = isMobile;
    },
  },
});
