<script setup lang="ts">
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
  const travelDates = computed(() => apiStore.getTravelDates);
  const travelerAges = computed(() => apiStore.getTravelerAges);
  const tripCostAndITP = computed(() => apiStore.getTripCostAndITP);
  const tripCost = computed(() => apiStore.getTripCost);
  const loading = computed(() => apiStore.getLoaderState);
  const isThemeIMT = computed(() => themeStore.isThemeIMT);
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
          class="lg:block display-none lg:font-bold lg:text-xs lg:uppercase lg:pb-1"
        >
          {{ contentStore.getQuoteDetailsContentByKey('destination') || '' }}:
        </div>
        <span
          :class="[
            'text-sm md:text-xs font-bold underline decoration-dotted',
            isThemeIMT
              ? 'text-action-primary cursor-pointer'
              : '',
            isThemeSoventure ? 'text-black cursor-pointer' : '',
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
        class="display-none border-r border-imt-grey h-12 mr-3 lg:block"
      ></div>
      <div class="mr-0 lg:mr-3">
        <div
          class="display-none lg:font-bold lg:text-xs lg:block lg:uppercase lg:pb-1"
        >
          {{ contentStore.getQuoteDetailsContentByKey('travelDates') || '' }}:
        </div>
        <span
          :class="[
            'text-sm md:text-xs font-bold underline decoration-dotted',
            isThemeIMT
              ? 'text-action-primary cursor-pointer'
              : '',
            isThemeSoventure ? 'text-black cursor-pointer' : '',
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
        class="display-none border-r border-imt-grey h-12 mr-3 lg:block"
      ></div>
    </template>
    <template v-else>
      <div class="mr-0 lg:mr-3">
        <div
          class="display-none lg:font-bold lg:text-xs lg:block lg:uppercase lg:pb-1"
        >
          Coverage Dates:
        </div>
        <span
          :class="[
            'text-sm md:text-xs font-bold underline decoration-dotted',
            isThemeIMT
              ? 'text-action-primary cursor-pointer'
              : '',
            isThemeSoventure ? 'text-black cursor-pointer' : '',
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
        class="display-none border-r border-imt-grey h-12 mr-3 lg:block"
      ></div>
    </template>
    <div class="mr-0 display-none lg:mr-3 lg:block">
      <div
        class="display-none lg:font-bold lg:text-xs lg:block lg:uppercase lg:pb-1"
      >
        {{ contentStore.getQuoteDetailsContentByKey('ages') || '' }}:
      </div>
      <span
        :class="[
          'text-xs font-bold underline decoration-dotted',
          isThemeIMT
            ? 'text-action-primary cursor-pointer'
            : '',
          isThemeSoventure ? 'text-black cursor-pointer' : '',
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
        class="display-none border-r border-imt-grey h-12 mr-3 lg:block"
      ></div>
      <div class="mr-0 display-none lg:mr-3 lg:block">
        <div
          class="display-none lg:font-bold lg:text-xs lg:block lg:uppercase lg:pb-1"
        >
          {{ contentStore.getQuoteDetailsContentByKey('tripCost') || '' }}:
        </div>
        <span
          :class="[
            'text-xs font-bold underline decoration-dotted',
            isThemeIMT
              ? 'text-action-primary cursor-pointer'
              : '',
            isThemeSoventure ? 'text-black cursor-pointer' : '',
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
            'text-xs font-bold underline decoration-dotted',
            isThemeIMT
              ? 'text-action-primary cursor-pointer'
              : '',
            isThemeSoventure ? 'text-black cursor-pointer' : '',
          ]"
          v-else-if="tripCostAndITP"
          @click="openEditTripDetailsModal"
          data-cy="tripCostAndITP-quoteDetails"
        >
          {{ tripCostAndITP }}
        </span>
        <span
          :class="[
            'text-xs font-bold underline decoration-dotted',
            isThemeIMT
              ? 'text-action-primary cursor-pointer'
              : '',
            isThemeSoventure ? 'text-black cursor-pointer' : '',
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
