export type ModeFeatures = {
  destinationSection: boolean;
  travelDatesSection: boolean;
  numberOfTravelers: number;
  citizenshipSection: boolean;
  citizenshipCountry: boolean;
  residenceCountry: boolean;
  residenceState: boolean;
  tripCostSection: boolean;
};
export type ThemeName = 'insuremytrip' | 'soventure';
export type ThemeMode = 'default' | 'edu' | 'annual' | 'cruise';
export type QuoteDetails = {
  destination: string | null;
  destinationState: string | null;
  travelDates: Date[] | null;
  numberOfTravelers: number;
  travelerAges: Array<number | null>;
  citizenshipCountry: string | null;
  residence: {
    residenceCountry: string | null;
    residenceState: string | null;
  }
  tripCost: number | null;
  itp: Date | null;
  willProtectTripCost: boolean;
};
export type InputField = {
  placeholder: string;
  label: string;
  error_message: string;
};

export type QuoteFormGeographyDestination = {
  code: string;
  value: string;
  alias: string;
  lemma: string;
};
export type QuoteFormGeographyResidence = {
  code: string;
  value: string;
  countryCode: string | null;
};
export type QuoteFormGeographyCitizenship = {
  code: string;
  value: string;
  countryCode: string | null;
};

export type TripData = {
    destinations: { country: string; stateProvince: string|null }[];
    departureDate?: string;
    returnDate?: string;
    initialTripPaymentDate?: string | null;
    finalTripPaymentDate?: string;
}

export type TravelerInfo = {
  primary: boolean;
  dateOfBirth: string;
  residence: { country: string | null; stateProvince: string };
  citizenship: string,
  tripCost: number;
}

export type MetaData = {
  impactClickId: string | null;
  agentEmail: string | undefined;
  travelerHasLeftOnTrip: boolean | null;
  coverTripCost: boolean | null;
}

export type PlanParameter = {
  code: string;
  options: PlanParamOption[];
};

export type PlanParamOption = {
  key?: string;
  id?: string;
  value: string;
};