import type { ThemeName, ThemeMode, ModeFeatures } from '@/types';
export const themeConfig: Record<
  ThemeName,
  { default: ModeFeatures } & Partial<
    Record<Exclude<ThemeMode, 'default'>, ModeFeatures>
  >
> = {
  insuremytrip: {
    default: {
      destinationSection: true,
      travelDatesSection: true,
      numberOfTravelers: 10,
      citizenshipSection: true,
      citizenshipCountry: true,
      residenceCountry: true,
      residenceState: true,
      tripCostSection: true,
    },
    edu: {
      destinationSection: true,
      travelDatesSection: true,
      numberOfTravelers: 1,
      citizenshipSection: true,
      citizenshipCountry: true,
      residenceCountry: true,
      residenceState: true,
      tripCostSection: true,
    },
    annual: {
      destinationSection: false,
      travelDatesSection: false,
      numberOfTravelers: 10,
      citizenshipSection: true,
      citizenshipCountry: false,
      residenceCountry: false,
      residenceState: true,
      tripCostSection: false,
    },
    cruise: {
      destinationSection: true,
      travelDatesSection: true,
      numberOfTravelers: 10,
      citizenshipSection: true,
      citizenshipCountry: true,
      residenceCountry: true,
      residenceState: true,
      tripCostSection: true,
    },
  },

  soventure: {
    default: {
      destinationSection: true,
      travelDatesSection: true,
      numberOfTravelers: 10,
      citizenshipSection: true,
      citizenshipCountry: true,
      residenceCountry: true,
      residenceState: true,
      tripCostSection: true,
    },
  },
};
