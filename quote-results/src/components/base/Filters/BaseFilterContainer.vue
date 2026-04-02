<script setup lang="ts">
  import { computed } from 'vue';

  import Filter from './Filter.vue';
  import SoventureFilter from './SoventureFilter.vue';
  import PNSDropDown from '@/components/base/DropDown/PNSDropDown.vue';
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';
  import { useApiStore } from '@/store/api';
  import { event } from 'vue-gtag';
  import { useThemeStore } from '@/store/theme';
  import { GAObject } from '@/types';

  defineProps({
    displayType: {
      type: String,
      required: true,
    },
  });

  const sessionStore = useUserSessionStore();
  const apiStore = useApiStore();
  const themeStore = useThemeStore();
  const contentStore = useContentStore();
  const availablePlans = computed(() => apiStore.getAvailablePlans);
  const arePlansFullyLoaded = computed(
    () => apiStore.getPlansFullyLoadedStatus
  );
  const numberOfPlansShown = computed(() => sessionStore.getFilteredPlansCount);
  const areSelectedFiltersDefault = computed(
    () => sessionStore.areSelectedFiltersDefault || !apiStore.getDataLoadedState
  );
  const isThemeSoventure = computed(() => themeStore.isThemeSoventure);

  const resetDefaultFilters = () => {
    sessionStore.resetFilters();

    // Fire Event to track Reset Filters Link
    event('filters__reset', {
      hierarchical_layer_1: 'Reset Filters Link Clicked',
    } as GAObject);
  };

  const isInternal = computed(() =>
    document.cookie
      .split('; ')
      .some((cookie) => cookie.trim() === 'isInternal=true')
  );

  const imtCoverageOrder = [
      'medical',
      'emergencyMedicalEvacuation',
      'tripCancellation',
      'cancelForAnyReasonOption',
      'tripInterruption',
      'preExWaiver',
      'baggage',
      'baggageDelay',
      'travelDelay',
      'provider',
      'accidentalDeath24Hour',
      'otherCoverages',
    ];

  const soventureCoverageOrder = computed(() =>
    contentStore.getOrderedFilterList('soventure')
  );
</script>
<template>
  <div
    class="max-w-screen-md w-full top-0 overflow-y-auto flex flex-col filter-container"
  >
    <div>
      <p v-if="arePlansFullyLoaded" class="text-base display-none lg:block">
        Showing {{ numberOfPlansShown }} Plans
      </p>
      <p v-else>Loading Plans</p>
      <p
        v-if="areSelectedFiltersDefault && arePlansFullyLoaded"
        class="text-sm font-bold pb-6 display-none lg:block"
      >
        Filter Plans By:
      </p>
      <p
        v-else-if="!areSelectedFiltersDefault && arePlansFullyLoaded"
        class="text-sm font-bold pb-6 cursor-pointer text-action-primary"
        @click="resetDefaultFilters"
      >
        RESET FILTERS (Show all {{ availablePlans.length }} Plans)
      </p>
      <SoventureFilter
        v-if="isThemeSoventure"
        v-for="soventureCoverage in soventureCoverageOrder"
        :key="soventureCoverage"
        :filter-key="soventureCoverage"
        :display-type="displayType"
      />
      <Filter
        v-else
        v-for="imtCoverage in imtCoverageOrder"
        :key="imtCoverage"
        :filter-key="imtCoverage"
        :display-type="displayType"
        :available-plans="availablePlans.length"
      />
      <PNSDropDown v-if="isInternal" />
    </div>
    <div class="flex justify-center items-center">
      <button
        class="daisy-btn daisy-btn-block results-btn hover:bg-imt-blue bg-imt-blue text-white font-semibold lg:display-none w-4/5 sm:w-full sm:max-w-lg xs:max-w-[4/5] shadow-black border-none"
        @click="sessionStore.setMobileFilterModalOpen(false)"
        data-cy="mobile-filters-see-results-button"
      >
        See Results
      </button>
    </div>
  </div>
</template>
<style lang="scss">
  #quote-results-app {
    .filter-container {
      @media (max-width: 1024px) {
        // Removing the height of header nav (h-20)
        height: calc(100% - 5rem);

        > div:first-child {
          height: 85%;
          overflow-y: scroll;
        }

        > div:last-child {
          height: 15%;
        }

        @media (min-width: 640px) {
          > div:first-child {
            height: 90%;
          }

          > div:last-child {
            height: 10%;
          }
        }
      }
    }
  }
</style>
