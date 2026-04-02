import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFormStore } from '@/store/form';
import { getBirthDateFromAge } from '@/utils/commonUtils';

describe('useFormStore', () => {
  // Create a fresh Pinia instance before each test
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('Initial State', () => {
    it('should initialize with default form values', () => {
      const store = useFormStore();

      // top-level
      expect(store.quoteId).toBe(null);
      expect(store.isLoading).toBe(true);
      expect(store.isUserInternal).toBe(false);

      // quoteData defaults
      expect(store.quoteData.destination).toBeNull();

      expect(store.quoteData.citizenshipCountry).toBeNull();

      expect(store.quoteData.itp).toBeNull();

      expect(store.quoteData.residence.residenceCountry).toBeNull();
      expect(store.quoteData.residence.residenceState).toBeNull();

      expect(store.quoteData.returnDate).toBeNull();
      expect(store.quoteData.departureDate).toBeNull();

      expect(store.quoteData.travelers).toEqual([]);
      expect(store.quoteData.tripCost).toBeNull();

      // getters (optional but nice to verify)
      expect(store.getActiveQuoteId).toBeNull();
      expect(store.hasActiveQuote).toBe(false);

      expect(store.getDestinationCountry).toEqual(store.quoteData.destination);
      expect(store.getDestinationState).toBeNull();
      expect(store.getCitizenshipCountry).toEqual(
        store.quoteData.citizenshipCountry
      );
      expect(store.getResidenceCountry).toEqual(
        store.quoteData.residence.residenceCountry
      );

      expect(store.getTravelers).toEqual([]);
      expect(store.getTripCost).toBeNull();
      expect(store.getITP).toBeNull();

      expect(store.getIsLoading).toBe(true);
      expect(store.getIfUserInternal).toBe(false);
    });
  });

  describe('FormStore - Getters & Setters', () => {
    beforeEach(() => {
      setActivePinia(createPinia());
    });

    describe('Getters', () => {
      it('should return destination country object', () => {
        const store = useFormStore();

        const destination: typeof store.quoteData.destination = 'FR';

        store.quoteData.destination = destination;

        expect(store.getDestinationCountry).toEqual(destination);
      });

      it('should return destination state', () => {
        const store = useFormStore();

        store.quoteData.destinationState = 'CA';
        expect(store.getDestinationState).toBe('CA');

        store.quoteData.destinationState = null;
        expect(store.getDestinationState).toBeNull();
      });

      it('should return citizenship', () => {
        const store = useFormStore();

        const citizenship: typeof store.quoteData.citizenshipCountry = 'USA';

        store.quoteData.citizenshipCountry = citizenship;

        expect(store.getCitizenshipCountry).toEqual(citizenship);
      });

      it('should return residence', () => {
        const store = useFormStore();

        const residence: typeof store.quoteData.residence.residenceCountry = 'USA';

        store.quoteData.residence.residenceCountry = residence;

        expect(store.getResidenceCountry).toEqual(residence);
      });

      it('should return travel dates', () => {
        const store = useFormStore();

        store.quoteData.departureDate = '2026-01-10';
        store.quoteData.returnDate = '2026-01-20';

        expect(store.getDepartureDate).toBe('2026-01-10');
        expect(store.getReturnDate).toBe('2026-01-20');

      });

      it('should return travelers', () => {
        const store = useFormStore();
        const travelers = [22, 23, 24];
        store.setTravelerAges(travelers);
        expect(store.getTravelers).toEqual(
          store.quoteData.travelerAges.map((age) => Number.isFinite(age as number) ? getBirthDateFromAge(age as number) : '')
        );
      });

      it('should return trip cost and initial trip payment', () => {
        const store = useFormStore();

        store.quoteData.tripCost = 1500;
        store.quoteData.itp = '2026-01-01';

        expect(store.getTripCost).toBe(1500);
        expect(store.getITP).toStrictEqual('2026-01-01');
      });

      it('should return loading, active quote id, active quote status, and internal user flag', () => {
        const store = useFormStore();

        store.isLoading = true;
        store.quoteId = 'q-123';
        store.isUserInternal = true;

        expect(store.getIsLoading).toBe(true);
        expect(store.getActiveQuoteId).toBe('q-123');
        expect(store.hasActiveQuote).toBe(true);
        expect(store.getIfUserInternal).toBe(true);

        store.quoteId = '';
        expect(store.hasActiveQuote).toBe(false);
      });
    });

    describe('Setters (Actions)', () => {
      it('setDestinationCountry should update destination', () => {
        const store = useFormStore();

        const destination: typeof store.quoteData.destination = 'MXC';

        store.setDestinationCountry(destination);

        expect(store.quoteData.destination).toEqual(destination);
        expect(store.getDestinationCountry).toEqual(destination);
      });

      it('setDestinationState should update destination.state', () => {
        const store = useFormStore();

        store.setDestinationState('TX');
        expect(store.quoteData.destinationState).toBe('TX');
        expect(store.getDestinationState).toBe('TX');

        store.setDestinationState(null);
        expect(store.quoteData.destinationState).toBeNull();
        expect(store.getDestinationState).toBeNull();
      });

      it('setCitizenship should update citizenship', () => {
        const store = useFormStore();

        const citizenship: typeof store.quoteData.citizenshipCountry = 'CAN';

        store.setCitizenship(citizenship);

        expect(store.quoteData.citizenshipCountry).toEqual(citizenship);
        expect(store.getCitizenshipCountry).toEqual(citizenship);
      });

      it('setResidence should update residence', () => {
        const store = useFormStore();

        const residence: typeof store.quoteData.residence.residenceCountry = 'CAN';

        store.setResidenceCountry(residence);

        expect(store.quoteData.residence.residenceCountry).toEqual(residence);
        expect(store.getResidenceCountry).toEqual(residence);
      });

      it('setTripCost should update tripCost', () => {
        const store = useFormStore();

        store.setTripCost(999);
        expect(store.quoteData.tripCost).toBe(999);
        expect(store.getTripCost).toBe(999);

        store.setTripCost(null);
        expect(store.quoteData.tripCost).toBeNull();
        expect(store.getTripCost).toBeNull();
      });

      it('setInitialTripPaymentDate should update initialTripPayment', () => {
        const store = useFormStore();

        store.setITP('2026-01-05');
        expect(store.quoteData.itp).toStrictEqual('2026-01-05');
        expect(store.getITP).toStrictEqual('2026-01-05');

        store.setITP(null);
        expect(store.quoteData.itp).toBeNull();
        expect(store.getITP).toBeNull();
      });

      it('setQuoteId should update quoteId and affect hasActiveQuote', () => {
        const store = useFormStore();

        store.setQuoteId('1f0ea63f-5afd-6080-9ba8-c732cd2ea929');
        expect(store.quoteId).toBe('1f0ea63f-5afd-6080-9ba8-c732cd2ea929');
        expect(store.getActiveQuoteId).toBe(
          '1f0ea63f-5afd-6080-9ba8-c732cd2ea929'
        );
        expect(store.hasActiveQuote).toBe(true);
      });

      it('setIsUserInternal should update isUserInternal', () => {
        const store = useFormStore();

        store.setIsUserInternal(true);
        expect(store.isUserInternal).toBe(true);
        expect(store.getIfUserInternal).toBe(true);

        store.setIsUserInternal(false);
        expect(store.isUserInternal).toBe(false);
        expect(store.getIfUserInternal).toBe(false);
      });

      it('clearPlanParameters should reset quoteData and quoteId', () => {
        const store = useFormStore();

        // dirty the store
        store.setQuoteId('1f0ea63f-5afd-6080-9ba8-c732cd2ea929');
        store.setDestinationCountry('JAP');
        store.setCitizenship('USA');
        store.setResidenceCountry('CA');
        store.setDepartureDate('2026-03-01');
        store.setReturnDate('2026-03-10');
        store.setTravelerAges([25]);
        store.setTripCost(1234);
        store.setITP('2026-01-01');

        store.clearPlanParameters();

        expect(store.quoteId).toBe('');
        expect(store.hasActiveQuote).toBe(false);

        expect(store.quoteData.destination).toBeNull();

        expect(store.quoteData.citizenshipCountry).toBeNull();

        expect(store.quoteData.itp).toBeNull();

        expect(store.quoteData.residence.residenceCountry).toBeNull();

        expect(store.quoteData.departureDate).toBeNull();
        expect(store.quoteData.returnDate).toBeNull();

        expect(store.quoteData.travelers).toEqual([]);
        expect(store.quoteData.tripCost).toBeNull();
      });
    });
  });
});
