import { defineStore } from 'pinia';
import { getBirthDateFromAge } from '@/utils/commonUtils';
import type { MetaData, PlanParameter, TravelerInfo, TripData } from '@/types';
import { useThemeStore } from './theme';

interface State {
  quoteData: {
    destination: string | null;
    destinationState: string | null;
    departureDate: string | null;
    returnDate: string | null;
    numberOfTravelers: number | null;
    travelers: Array<string>;
    citizenshipCountry: string | null;
    residence: {
      residenceCountry: string | null;
      residenceState: string | null;
    }
    tripCost: number | null;
    itp: string | null;
    willProtectTripCost: boolean;
    travelerAges: Array<number | null>;
  };
  quoteId: string | null;
  isLoading: boolean;
  isUserInternal: boolean;
  planParameters: Array<PlanParameter>;
  errors: string[];
  formSubmitted: boolean;
}

const emptyQuoteData = (): State['quoteData'] => ({
  destination: null,
  destinationState: null,
  departureDate: null,
  returnDate: null,
  numberOfTravelers: 1,
  travelers: [],
  citizenshipCountry: null,
  residence: {
    residenceCountry: null,
    residenceState: null,
  },
  tripCost: null,
  itp: null,
  willProtectTripCost: false,
  travelerAges: [],
});

export const useFormStore = defineStore('form', {
  state: (): State => ({
    quoteData: emptyQuoteData(),
    quoteId: null,
    isLoading: true,
    isUserInternal: false,
    planParameters: [],
    errors: [],
    formSubmitted: false,
  }),

  getters: {
    getQuoteData(): State['quoteData'] {
      return this.quoteData;
    },

    getDestinationCountry(): State['quoteData']['destination'] {
      return this.quoteData.destination;
    },

    getDestinationState(): string | null | undefined {
      return this.quoteData.destinationState;
    },

    getCitizenshipCountry(): State['quoteData']['citizenshipCountry'] {
      return this.quoteData.citizenshipCountry;
    },

    getResidenceCountry(): State['quoteData']['residence']['residenceCountry'] {
      return this.quoteData.residence.residenceCountry;
    },

    getResidenceState(): State['quoteData']['residence']['residenceState'] {
      return this.quoteData.residence.residenceState;
    },

    getDepartureDate(): State['quoteData']['departureDate'] {
      return this.quoteData.departureDate;
    },

    getReturnDate(): State['quoteData']['returnDate'] {
      return this.quoteData.returnDate;
    },

    getTravelers(): State['quoteData']['travelers'] {
      return this.quoteData.travelers;
    },

    getNumberOfTravelers(): State['quoteData']['numberOfTravelers'] {
      return this.quoteData.numberOfTravelers;
    },

    getTripCost(): State['quoteData']['tripCost'] {
      return this.quoteData.tripCost;
    },

    getITP(): State['quoteData']['itp'] {
      return this.quoteData.itp;
    },

    getIsLoading(): boolean {
      return this.isLoading;
    },

    getActiveQuoteId(): string | null {
      return this.quoteId;
    },

    hasActiveQuote(): boolean {
      return Boolean(this.quoteId);
    },

    getIfUserInternal(): boolean {
      return this.isUserInternal;
    },

    getErrors(): State['errors'] {
      return this.errors;
    },

    getWillProtectTripCost():  State['quoteData']['willProtectTripCost'] {
      return this.quoteData.willProtectTripCost;
    },

    getFormSubmissionState(): State['formSubmitted'] {
      return this.formSubmitted;
    }
  },

  actions: {
    setActiveQuoteId(id: string | null): void {
      this.quoteId = id;
    },

    setDestinationCountry(country: State['quoteData']['destination']): void {
      this.quoteData.destination = country;
    },

    setDestinationState(state: string | null): void {
      this.quoteData.destinationState = state;
    },

    setCitizenship(
      citizenship: State['quoteData']['citizenshipCountry']
    ): void {
      this.quoteData.citizenshipCountry = citizenship;
    },

    setResidenceCountry(residenceCountry: State['quoteData']['residence']['residenceCountry']): void {
      this.quoteData.residence.residenceCountry = residenceCountry;
    },

    setResidenceState(residenceState: State['quoteData']['residence']['residenceState']): void {
      this.quoteData.residence.residenceState = residenceState;
    },

    setDepartureDate(departureDate: string): void {
      this.quoteData.departureDate = departureDate;
    },

    setReturnDate(returnDate: string): void {
      this.quoteData.returnDate = returnDate;
    },

    setTravelers(travelers: Array<string>): void {
      this.quoteData.travelers = travelers;
    },

    setTravelerAges(travelers: Array<number | null>): void {
      this.quoteData.travelerAges = travelers;
      // Only map finite numeric ages to birthdates; otherwise set empty string
      this.quoteData.travelers = travelers.map((age) =>
        Number.isFinite(age as number) ? getBirthDateFromAge(age as number) : ''
      );
    },

    setNumberOfTravelers(num: number): void {
      this.quoteData.numberOfTravelers = num;
    },

    setTripCost(tripCost: State['quoteData']['tripCost']): void {
      this.quoteData.tripCost = tripCost;
    },

    setITP(date: State['quoteData']['itp']): void {
      this.quoteData.itp = date;
    },

    setQuoteId(id: string): void {
      this.quoteId = id;
    },

    setIsUserInternal(userInternalState: boolean): void {
      this.isUserInternal = userInternalState;
    },

    setIsLoading(loading: State['isLoading']): void {
      this.isLoading = loading;
    },

    clearPlanParameters(): void {
      this.quoteData = emptyQuoteData();
      this.quoteId = '';
    },

    setPlanParameters(params: Array<PlanParameter>): void {
      this.planParameters = params;
    },

    transformFormToQuoteRequest() {
      const themeStore = useThemeStore();
      const quoteData = this.quoteData;
      const quoteFormBlock = document.getElementById('quote-form-v2');
      const agentEmail = quoteFormBlock?.getAttribute('data-agent-email');
      const impactClickId = quoteFormBlock?.getAttribute('data-impact-click-id');
      const planParameters = this.planParameters;

      // Map our traveler section for our quote request
      let travelers: TravelerInfo[] = []
      if (quoteData.travelerAges.length > 0) {
        travelers = quoteData.travelers.map<TravelerInfo>((birthDate, index) => ({
          primary: index === 0,
          dateOfBirth: birthDate,
          residence: {
            country: quoteData.residence.residenceCountry ?? '',
            stateProvince: quoteData.residence.residenceState ?? 'OT',
          },
          citizenship: quoteData.citizenshipCountry ?? '',
          tripCost: quoteData.tripCost ?? 0,
        }));
      }

      let trip: TripData = {
        destinations: [],
          departureDate: '',
          returnDate: '',
      };

      if (themeStore.getCurrentThemeMode !== 'annual') {
        if (!quoteData.destination) {
          throw new Error('Destination country is required to build the quote request.');
        }
        if (!quoteData.departureDate) {
          throw new Error('Departure date is required to build the quote request.');
        }
        if (!quoteData.returnDate) {
          throw new Error('Return date is required to build the quote request.');
        }

        trip.destinations.push({country: quoteData.destination,
          stateProvince: quoteData.destinationState});

        trip.departureDate = quoteData.departureDate;
        trip.returnDate = quoteData.returnDate;
      } else {
        const departureDate = new Date();
        const returnDate = new Date();
        departureDate.setDate(departureDate.getDate() + 1);
        returnDate.setDate(returnDate.getDate() + 365);

        trip.destinations.push({ country: 'Other', stateProvince: null });

        trip.departureDate = departureDate.toISOString().split('T')[0];
        trip.returnDate = returnDate.toISOString().split('T')[0];
      }

      if (quoteData.itp) {
        trip = {
          ...trip,
          initialTripPaymentDate: quoteData.itp,
        }
      }

      const metadata = {} as MetaData;

      if (agentEmail) {
        metadata.agentEmail = agentEmail;
      }

      if (impactClickId) {
        metadata.impactClickId = impactClickId;
      }
      
      if (quoteData.willProtectTripCost !== undefined) {
        metadata.coverTripCost = quoteData.willProtectTripCost;
      }

      const originatingSource = themeStore.getCurrentThemeMode;
      const site = themeStore.getCurrentTheme;

      if (site === 'soventure' && travelers[0]?.tripCost === 0) {
        travelers[0].tripCost = travelers.length;
      }

      return { metadata, travelers, trip, planParameters, site, ...(originatingSource !== 'default' && {originatingSource})};
    },

    setErrors(errors: State['errors']) {
      this.errors = errors;
    },

    setFormSubmission(val: State['formSubmitted']) {
      this.formSubmitted = val;
    },

    setWillProtectTripCost(val: State['quoteData']['willProtectTripCost']) {
      this.quoteData.willProtectTripCost = val;
    }
  },
});
