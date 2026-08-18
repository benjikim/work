<script setup lang="ts">
  import dayjs from 'dayjs';
  import { useApiStore } from '@/store/api';
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';
  import { useThemeStore } from '@/store/theme';
  import { computed } from 'vue';
  import { event } from 'vue-gtag';
  import { GAObject } from '@/types';

  const apiStore = useApiStore();
  const contentStore = useContentStore();
  const sessionStore = useUserSessionStore();
  const themeStore = useThemeStore();

  const travelDestination = computed(() => apiStore.getTravelDestination);
  const travelDates = computed(() => {
    const departureDate = apiStore.getDepartureDate;
    const returnDate = apiStore.getReturnDate;

    if (departureDate && returnDate) {
      return `${dayjs(departureDate).format('MMM D, YYYY')} - ${dayjs(returnDate).format('MMM D, YYYY')}`;
    }

    return apiStore.getTravelDates;
  });
  const travelerAges = computed(() => apiStore.getTravelerAges);
  const tripCostAndITP = computed(() => {
    const travelerTripCost = apiStore.getQuoteDetails?.travelers?.[0]?.tripCost;
    const initialTripPaymentDate =
      apiStore.getQuoteDetails?.trip?.initialTripPaymentDate;

    if (travelerTripCost && initialTripPaymentDate) {
      return `$${travelerTripCost} on ${dayjs(initialTripPaymentDate).format('MMM D, YYYY')}`;
    }

    return apiStore.getTripCostAndITP;
  });
  const tripCost = computed(() => apiStore.getTripCost);
  const loading = computed(() => apiStore.getLoaderState);
  const isThemeSoventure = computed(() => themeStore.isThemeSoventure);
  const isSoventureUpdateTripCostHidden = computed(
    () => sessionStore.isSoventureUpdateTripCostHidden
  );

  const numberOfTravelers = computed(
    () => apiStore.getQuoteDetails?.travelers?.length
  );

  /**
   * Method to open edit trip details modal.
   */
  const openEditTripDetailsModal = () => {
    sessionStore.setEditTripModalIsOpen(true);
    event('edit_quote_details', {
      hierarchical_layer_1: 'Quote Details Link Clicked',
    } as GAObject);
  };
</script>

<template>
  <div
    class="justify-center gap-3 lg:justify-normal lg:gap-0"
    :class="{ 'lg:gap-5': themeStore.isModeAnnual }"
  >
    <template v-if="!themeStore.isModeAnnual">
      <div class="mr-0 lg:mr-3">
        <div
          class="lg:block display-none lg:text-[0.6875rem] lg:uppercase lg:font-normal lg:text-[#878787] lg:tracking-wide lg:pb-1"
        >
          {{ contentStore.getQuoteDetailsContentByKey('destination') || '' }}:
        </div>
        <span
          :class="[
            'text-sm md:text-sm font-semibold quote-details-link cursor-pointer text-imt-black',
          ]"
          v-if="travelDestination !== null"
          @click="openEditTripDetailsModal"
          data-cy="travelDestination-quoteDetails"
        >
          {{ travelDestination }}
        </span>
        <span
          class="w-28 bg-imt-grey h-3.5 rounded-md animate-pulse inline-block"
          v-else
        ></span>
      </div>
      <div
        class="display-none border-r border-[#DEDEDE] h-12 mr-3 lg:block"
      ></div>
      <div class="mr-0 lg:mr-3">
        <div
          class="display-none lg:block lg:text-[0.6875rem] lg:uppercase lg:font-normal lg:text-[#878787] lg:tracking-wide lg:pb-1"
        >
          {{ contentStore.getQuoteDetailsContentByKey('travelDates') || '' }}:
        </div>
        <span
          :class="[
            'text-sm md:text-sm font-semibold quote-details-link cursor-pointer text-imt-black',
          ]"
          v-if="travelDates"
          @click="openEditTripDetailsModal"
          data-cy="travelDates-quoteDetails"
        >
          {{ travelDates }}
        </span>
        <span
          class="w-28 bg-imt-grey h-3.5 rounded-md animate-pulse inline-block"
          v-else
        ></span>
      </div>
      <div
        class="display-none border-r border-[#DEDEDE] h-12 mr-3 lg:block"
      ></div>
    </template>
    <template v-else>
      <div class="mr-0 lg:mr-3">
        <div
          class="display-none lg:block lg:text-[0.6875rem] lg:uppercase lg:font-normal lg:text-[#878787] lg:tracking-wide lg:pb-1"
        >
          Coverage Dates:
        </div>
        <span
          :class="[
            'text-sm md:text-sm font-semibold quote-details-link cursor-pointer text-imt-black',
          ]"
          v-if="travelDates"
          @click="openEditTripDetailsModal"
          data-cy="travelDates-quoteDetails"
        >
          {{ travelDates }}
        </span>
        <span
          class="w-28 bg-imt-grey h-3.5 rounded-md animate-pulse inline-block"
          v-else
        ></span>
      </div>
      <div
        class="display-none border-r border-[#DEDEDE] h-12 mr-3 lg:block"
      ></div>
    </template>
    <div class="mr-0 display-none lg:mr-3 lg:block">
      <div
        class="display-none lg:block lg:text-[0.6875rem] lg:uppercase lg:font-normal lg:text-[#878787] lg:tracking-wide lg:pb-1"
      >
        {{ contentStore.getQuoteDetailsContentByKey('ages') || '' }}:
      </div>
      <span
        :class="[
          'text-sm font-semibold quote-details-link cursor-pointer text-imt-black',
        ]"
        v-if="travelerAges"
        @click="openEditTripDetailsModal"
        data-cy="travelerAges-quoteDetails"
      >
        {{ travelerAges }}
      </span>
      <span
        class="w-28 bg-imt-grey h-3.5 rounded-md animate-pulse inline-block"
        v-else
      ></span>
    </div>
    <template v-if="!themeStore.isModeAnnual">
      <div
        class="display-none border-r border-[#DEDEDE] h-12 mr-3 lg:block"
      ></div>
      <div class="mr-0 display-none lg:mr-3 lg:block">
        <div
          class="display-none lg:block lg:text-[0.6875rem] lg:uppercase lg:font-normal lg:text-[#878787] lg:tracking-wide lg:pb-1"
        >
          {{ contentStore.getQuoteDetailsContentByKey('tripCost') || '' }}:
        </div>
        <span
          :class="[
            'text-sm font-semibold quote-details-link cursor-pointer text-imt-black',
          ]"
          v-if="
            isThemeSoventure &&
            tripCost === numberOfTravelers &&
            !isSoventureUpdateTripCostHidden
          "
          @click="openEditTripDetailsModal"
        >
          $0
        </span>
        <span
          :class="[
            'text-sm font-semibold quote-details-link cursor-pointer text-imt-black',
          ]"
          v-else-if="tripCostAndITP"
          @click="openEditTripDetailsModal"
          data-cy="tripCostAndITP-quoteDetails"
        >
          {{ tripCostAndITP }}
        </span>
        <span
          :class="[
            'text-sm font-semibold quote-details-link cursor-pointer text-imt-black',
          ]"
          v-else-if="tripCost >= 0 && !loading"
          @click="openEditTripDetailsModal"
          data-cy="tripCost-quoteDetails"
        >
          ${{ tripCost }}
        </span>
        <span
          class="w-28 bg-imt-grey h-3.5 rounded-md animate-pulse inline-block"
          v-else
        ></span>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .quote-details-link {
    text-decoration: none;
  }
</style>
