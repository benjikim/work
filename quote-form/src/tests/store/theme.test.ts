import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useThemeStore } from '@/store/theme';

describe('useThemeStore', () => {
  // Create a fresh Pinia instance before each test
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('Initial State', () => {
    it('should initialize with default IMT theme values', () => {
      const store = useThemeStore();

      expect(store.currentTheme.name).toBe('insuremytrip');
      expect(store.currentTheme.tripCostLimit).toBe(200000);
      expect(store.currentTheme.currentMode).toBe('default');
      expect(store.currentTheme.modeFeatures.destinationSection).toBe(true);
      expect(store.currentTheme.modeFeatures.travelDatesSection).toBe(true);
      expect(store.currentTheme.modeFeatures.numberOfTravelers).toBe(10);
      expect(store.currentTheme.modeFeatures.citizenshipSection).toBe(true);
      expect(store.currentTheme.modeFeatures.citizenshipCountry).toBe(true);
      expect(store.currentTheme.modeFeatures.residenceCountry).toBe(true);
      expect(store.currentTheme.modeFeatures.residenceState).toBe(true);
      expect(store.currentTheme.modeFeatures.tripCostSection).toBe(true);
      expect(store.isInitialized).toBe(false);
    });
  });

  describe('Getters', () => {
    it('getCurrentTheme should return the current theme name', () => {
      const store = useThemeStore();
      expect(store.getCurrentTheme).toBe('insuremytrip');

      store.currentTheme.name = 'soventure';
      expect(store.getCurrentTheme).toBe('soventure');
    });

    it('isThemeIMT should return true for insuremytrip theme', () => {
      const store = useThemeStore();
      store.currentTheme.name = 'insuremytrip';
      expect(store.isThemeIMT).toBe(true);

      store.currentTheme.name = 'soventure';
      expect(store.isThemeIMT).toBe(false);
    });

    it('isThemeSoventure should return true for soventure theme', () => {
      const store = useThemeStore();
      store.currentTheme.name = 'soventure';
      expect(store.isThemeSoventure).toBe(true);

      store.currentTheme.name = 'insuremytrip';
      expect(store.isThemeSoventure).toBe(false);
    });

    it('getTripCostLimit should return the trip cost limit', () => {
      const store = useThemeStore();
      expect(store.getTripCostLimit).toBe(200000);

      store.currentTheme.tripCostLimit = 150000;
      expect(store.getTripCostLimit).toBe(150000);
    });

    it('isDestinationSectionEnabled should return the destination section state', () => {
      const store = useThemeStore();
      expect(store.isDestinationSectionEnabled).toBe(true);

      store.currentTheme.modeFeatures.destinationSection = false;
      expect(store.isDestinationSectionEnabled).toBe(false);
    });

    it('isTravelDatesSectionEnabled should return the travel dates section state', () => {
      const store = useThemeStore();
      expect(store.isTravelDatesSectionEnabled).toBe(true);

      store.currentTheme.modeFeatures.travelDatesSection = false;
      expect(store.isTravelDatesSectionEnabled).toBe(false);
    });

    it('getNumberOfTravelers should return the number of travelers', () => {
      const store = useThemeStore();
      expect(store.getNumberOfTravelers).toBe(10);

      store.currentTheme.modeFeatures.numberOfTravelers = 1;
      expect(store.getNumberOfTravelers).toBe(1);
    });

    it('isCitizenshipSectionEnabled should return the citizenship section state', () => {
      const store = useThemeStore();
      expect(store.isCitizenshipSectionEnabled).toBe(true);

      store.currentTheme.modeFeatures.citizenshipSection = false;
      expect(store.isCitizenshipSectionEnabled).toBe(false);
    });

    it('isCitizenshipCountryEnabled should return the citizenship country', () => {
      const store = useThemeStore();
      expect(store.isCitizenshipCountryEnabled).toBe(true);

      store.currentTheme.modeFeatures.citizenshipCountry = false;
      expect(store.isCitizenshipCountryEnabled).toBe(false);
    });

    it('isResidenceCountryEnabled should return the residence country', () => {
      const store = useThemeStore();
      expect(store.isResidenceCountryEnabled).toBe(true);

      store.currentTheme.modeFeatures.residenceCountry = false;
      expect(store.isResidenceCountryEnabled).toBe(false);
    });

    it('isResidenceStateEnabled should return the residence state', () => {
      const store = useThemeStore();
      expect(store.isResidenceStateEnabled).toBe(true);

      store.currentTheme.modeFeatures.residenceState = false;
      expect(store.isResidenceStateEnabled).toBe(false);
    });

    it('isTripCostSectionEnabled should return the trip cost section state', () => {
      const store = useThemeStore();
      expect(store.isTripCostSectionEnabled).toBe(true);

      store.currentTheme.modeFeatures.tripCostSection = false;
      expect(store.isTripCostSectionEnabled).toBe(false);
    });

    it('getCurrentThemeMode should return the theme mode', () => {
      const store = useThemeStore();
      expect(store.getCurrentThemeMode).toBe('default');

      store.currentTheme.currentMode = 'annual';
      expect(store.getCurrentThemeMode).toBe('annual');
    });
  });

  describe('Actions - setSoventureTheme', () => {
    it('should set theme to soventure and mode to default', () => {
      const store = useThemeStore();
      store.setSoventureTheme();

      expect(store.currentTheme.name).toBe('soventure');
      expect(store.currentTheme.currentMode).toBe('default');
    });
  });

  describe('Actions - setInsuremytripTheme', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      // Create a mock element
      mockElement = document.createElement('div');
      mockElement.id = 'quote-form-v2';
      document.body.appendChild(mockElement);
    });

    afterEach(() => {
      // Clean up
      document.body.removeChild(mockElement);
    });

    it('should set theme to insuremytrip with default mode when no data-mode attribute', () => {
      const store = useThemeStore();
      store.setInsuremytripTheme();

      expect(store.currentTheme.name).toBe('insuremytrip');
      expect(store.currentTheme.currentMode).toBe('default');
    });

    it('should set mode to edu and numberOfTravelers to 1 when data-mode is "edu"', () => {
      const store = useThemeStore();
      mockElement.setAttribute('data-mode', 'edu');
      store.setInsuremytripTheme();

      expect(store.currentTheme.name).toBe('insuremytrip');
      expect(store.currentTheme.currentMode).toBe('edu');
      expect(store.currentTheme.modeFeatures.numberOfTravelers).toBe(1);
    });

    it('should set mode to annual and disable sections when data-mode is "annual"', () => {
      const store = useThemeStore();
      mockElement.setAttribute('data-mode', 'annual');
      store.setInsuremytripTheme();

      expect(store.currentTheme.name).toBe('insuremytrip');
      expect(store.currentTheme.currentMode).toBe('annual');
      expect(store.currentTheme.modeFeatures.destinationSection).toBe(false);
      expect(store.currentTheme.modeFeatures.travelDatesSection).toBe(false);
      expect(store.currentTheme.modeFeatures.citizenshipSection).toBe(true);
      expect(store.currentTheme.modeFeatures.citizenshipCountry).toBe(false);
      expect(store.currentTheme.modeFeatures.residenceCountry).toBe(false);
      expect(store.currentTheme.modeFeatures.residenceState).toBe(true);
      expect(store.currentTheme.modeFeatures.tripCostSection).toBe(false);
    });

    it('should set mode to cruise when data-mode is "cruise"', () => {
      const store = useThemeStore();
      mockElement.setAttribute('data-mode', 'cruise');
      store.setInsuremytripTheme();

      expect(store.currentTheme.name).toBe('insuremytrip');
      expect(store.currentTheme.currentMode).toBe('cruise');
    });

    it('should handle case-insensitive mode values', () => {
      const store = useThemeStore();
      mockElement.setAttribute('data-mode', 'EDU');
      store.setInsuremytripTheme();

      expect(store.currentTheme.currentMode).toBe('edu');
      expect(store.currentTheme.modeFeatures.numberOfTravelers).toBe(1);
    });

    it('should default to default mode for unknown mode values', () => {
      const store = useThemeStore();
      mockElement.setAttribute('data-mode', 'unknown');
      store.setInsuremytripTheme();

      expect(store.currentTheme.currentMode).toBe('default');
    });
  });

  describe('Actions - initializeTheme', () => {
    afterEach(() => {
      // Restore original location by deleting the mock
      delete (window as any).location;
    });

    it('should initialize with IMT theme when hostname does not include soventure', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'insuremytrip.com',
        },
        writable: true,
        configurable: true,
      });

      // Mock document.getElementById
      const mockElement = document.createElement('div');
      mockElement.id = 'quote-form-v2';
      document.body.appendChild(mockElement);

      const store = useThemeStore();
      store.initializeTheme();

      expect(store.currentTheme.name).toBe('insuremytrip');
      expect(store.isInitialized).toBe(true);

      document.body.removeChild(mockElement);
    });

    it('should initialize with soventure theme when hostname includes soventure', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'soventure.com',
        },
        writable: true,
        configurable: true,
      });

      const store = useThemeStore();
      store.initializeTheme();

      expect(store.currentTheme.name).toBe('soventure');
      expect(store.currentTheme.currentMode).toBe('default');
      expect(store.isInitialized).toBe(true);
    });

    it('should not re-initialize if already initialized', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'insuremytrip.com',
        },
        writable: true,
        configurable: true,
      });

      const mockElement = document.createElement('div');
      mockElement.id = 'quote-form-v2';
      document.body.appendChild(mockElement);

      const store = useThemeStore();
      store.initializeTheme();
      store.currentTheme.name = 'soventure'; // Change after initialization

      // Try to initialize again
      store.initializeTheme();

      // Should remain as soventure (not re-initialized)
      expect(store.currentTheme.name).toBe('soventure');
      expect(store.isInitialized).toBe(true);

      document.body.removeChild(mockElement);
    });
  });

  describe('Integration Tests', () => {
    it('should handle full initialization flow for IMT with edu mode', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'insuremytrip.com',
        },
        writable: true,
        configurable: true,
      });

      const mockElement = document.createElement('div');
      mockElement.id = 'quote-form-v2';
      mockElement.setAttribute('data-mode', 'edu');
      document.body.appendChild(mockElement);

      const store = useThemeStore();
      store.initializeTheme();

      expect(store.currentTheme.name).toBe('insuremytrip');
      expect(store.currentTheme.currentMode).toBe('edu');
      expect(store.currentTheme.modeFeatures.numberOfTravelers).toBe(1);
      expect(store.isInitialized).toBe(true);
      expect(store.isThemeIMT).toBe(true);
      expect(store.getCurrentTheme).toBe('insuremytrip');

      document.body.removeChild(mockElement);
    });

    it('should handle full initialization flow for Soventure', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'soventure.com',
        },
        writable: true,
        configurable: true,
      });

      const store = useThemeStore();
      store.initializeTheme();

      expect(store.currentTheme.name).toBe('soventure');
      expect(store.currentTheme.currentMode).toBe('default');
      expect(store.isInitialized).toBe(true);
      expect(store.isThemeSoventure).toBe(true);
      expect(store.getCurrentTheme).toBe('soventure');
    });
  });
});
