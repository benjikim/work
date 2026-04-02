<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import dayjs from 'dayjs';
  import { useApiStore } from '@/store/api';
  import { useThemeStore } from '@/store/theme';
  import UtilityHTMLRenderer from '@/components/utility/UtilityHTMLRenderer.vue';
  import {
    isDuringHolidaySeason,
    isDuringHurricaneSeason,
  } from '@/utility/index.ts';
  import { useContentStore } from '@/store/content';
  import { DestinationTrustFactors, TrustFactor } from '@/types';

  const contentStore = useContentStore();
  const apiStore = useApiStore();
  const themeStore = useThemeStore();

  const trustFactors = contentStore.getTrustFactorContent;
  const isThemeSoventure = computed(() => themeStore.isThemeSoventure);
  const isModeEdu = computed(() => themeStore.isModeEdu);
  const isModeAnnual = computed(() => themeStore.isModeAnnual);

  type TrustFactorType =
    | 'generic'
    | 'tripCost'
    | 'age'
    | 'destination'
    | 'holidaySeason'
    | 'hurricaneSeason'
    | 'nonUSResident'
    | 'soventure'
    | 'edu'
    | 'annual'
    | 'luxury'
    | 'partner';

  type SoventureTFType =
    | 'soventureTripCan'
    | 'soventureMedicalEvac'
    | 'soventureEmergencyMedical'
    | 'soventureAdventureCoverage'
    | 'soventureComprehensive'
    | 'soventureEmergencyMedicalLonger'
    | 'soventureNomad'
    | 'partner';

  const trustFactorKey = ref<TrustFactorType>('generic');
  const soventureTFK = ref<SoventureTFType>('soventureAdventureCoverage');

  // Get quote details and alter our trustFactorKey state based on details
  const tripCost = computed(() => apiStore.getTripCost);
  const departureDate = computed(() => apiStore.getDepartureDate);
  const returnDate = computed(() => apiStore.getReturnDate);
  const highestAge = computed(() => apiStore.getHighestTravelerAge);
  const residence = computed(() => apiStore.getResidence);
  const displayLoader = computed(() => apiStore.getLoaderState);
  const partnerId = computed(() => apiStore.getPartnerId);
  const itp = computed(() => apiStore.getITP);

  const destination = computed(() => apiStore.getTravelDestinationCode);
  const destinationName = computed(() => apiStore.getTravelDestination);
  const destinationTrustFactors = [
    'ABW',
    'AUS',
    'BHS',
    'CRI',
    'CAN',
    'DOM',
    'FRA',
    'DEU',
    'GRC',
    'ISL',
    'IRL',
    'ITA',
    'JPN',
    'MEX',
    'NLD',
    'PRT',
    'ESP',
    'GBR',
  ];

  // Our trust factor data that will be used in our template, this is altered based on the trustFactorKey state and the partner trust factor if it exists
  const trustFactorData = computed<TrustFactor>(() => {
    if (themeStore.getPartnerTrustFactor) {
      return {
        heading: themeStore.getPartnerTrustFactor.heading,
        content: themeStore.getPartnerTrustFactor.content,
        image: themeStore.getPartnerTrustFactor.icon.url,
      };
    }

    if (isThemeSoventure.value && trustFactors.soventure[soventureTFK.value]) {
      return trustFactors.soventure[soventureTFK.value] as TrustFactor;
    }

    if (trustFactorKey.value === 'destination' && destination.value) {
      return (
        trustFactors.insuremytrip[
          trustFactorKey.value
        ] as DestinationTrustFactors
      )[destination.value] as TrustFactor;
    }

    return trustFactors.insuremytrip[trustFactorKey.value] as TrustFactor;
  });

  // Set our heading, content, and image based on the trust factor data we pulled
  const heading = computed(() => trustFactorData.value.heading);
  const content = computed(() => {
    let content = trustFactorData.value.content;

    if (isThemeSoventure.value) {
      content = content.replace(
        '[country name]',
        destinationName.value as string
      );
    }

    return content;
  });
  const image = computed(() => trustFactorData.value.image);

  const waitForTrustFactorLoad = computed(() => apiStore.getDataLoadedState);

  const isLuxuryPlanShown = computed(() => {
    const luxuryPlanCodes = apiStore.getFFValue(
      'sb_20250805_insuremytrip_luxury_plan_codes_us_release'
    );
    if (luxuryPlanCodes && typeof luxuryPlanCodes === 'string') {
      // get plans from apiStore
      const plans = apiStore.getQuoteResults?.products;
      if (plans) {
        return plans.some(
          (plan) =>
            luxuryPlanCodes.includes(plan.code) && plan.available === true
        );
      }
      return false;
    }
    return false;
  });

  // Because our quote info may not be fetched yet at the time this is ran, we wait until we are no longer loading and then pick the trust factor to use
  watch(displayLoader, () => {
    // Priority = Partner > EDU > TripCost > age > destination > travel dates > generic
    if (themeStore.getPartnerTrustFactor) {
      trustFactorKey.value = 'partner';
      return;
    }

    switch (themeStore.getCurrentThemeMode) {
      case 'edu':
        trustFactorKey.value = 'edu';
        break;
      case 'annual':
        trustFactorKey.value = 'annual';
        break;
      default:
        if (isLuxuryPlanShown.value) {
          trustFactorKey.value = 'luxury';
          break;
        } else if (tripCost.value > 10000 && !partnerId.value) {
          trustFactorKey.value = 'tripCost';
        } else if (highestAge.value > 60 && !partnerId.value) {
          trustFactorKey.value = 'age';
        } else if (
          destination.value !== null &&
          destinationTrustFactors.includes(destination.value) &&
          !partnerId.value
        ) {
          trustFactorKey.value = 'destination';
        } else if (
          departureDate.value &&
          isDuringHolidaySeason(departureDate.value) &&
          !partnerId.value
        ) {
          trustFactorKey.value = 'holidaySeason';
        } else if (
          departureDate.value &&
          isDuringHurricaneSeason(departureDate.value) &&
          !partnerId.value
        ) {
          trustFactorKey.value = 'hurricaneSeason';
        } else if (
          residence.value &&
          residence.value.stateProvince === 'OT' &&
          !partnerId.value
        ) {
          trustFactorKey.value = 'nonUSResident';
        }
        if (isThemeSoventure.value) {
          trustFactorKey.value = 'soventure';
          const returnDateFormat = dayjs(returnDate.value as string);
          const departureDateFormat = dayjs(departureDate.value as string);
          const isLessThanTwoWeeks =
            returnDateFormat.diff(departureDateFormat, 'day') < 14;

          if (isLessThanTwoWeeks) {
            if (tripCost.value > 10000) {
              soventureTFK.value = 'soventureTripCan';
            } else if (highestAge.value > 60) {
              soventureTFK.value = 'soventureMedicalEvac';
            } else {
              soventureTFK.value = 'soventureEmergencyMedical';
            }
          } else {
            if (itp.value && tripCost.value > 0) {
              soventureTFK.value = 'soventureComprehensive';
            } else {
              soventureTFK.value = 'soventureNomad';
            }
          }
        }
        break;
    }
  });

  onMounted(() => {
    if (themeStore.isModeEdu) {
      trustFactorKey.value = 'edu';
    } else if (themeStore.isModeAnnual) {
      trustFactorKey.value = 'annual';
    }
  });
</script>
<template>
  <div
    v-if="waitForTrustFactorLoad"
    class="flex space-x-2 h-full"
    :data-cy="`trustFactor-${trustFactorKey}`"
    :class="[isThemeSoventure || isModeEdu || isModeAnnual ? 'mb-[-5px]' : '']"
  >
    <!-- Header/Body Column -->
    <div class="flex flex-col max-w-96 justify-center pl-3">
      <!-- Header Row -->
      <div>
        <h2 class="font-bold text-base">{{ heading }}</h2>
      </div>
      <!-- Body Text Row -->
      <div class="mt-1">
        <UtilityHTMLRenderer
          is="div"
          class="text-xs flex-grow"
          :content="content"
        />
      </div>
    </div>

    <!-- Image Column -->
    <div
      class="flex-shrink-0 w-[131px] flex items-center justify-center h-full"
    >
      <img
        :src="image"
        class="w-[131px] h-[131px]"
        :class="[
          isThemeSoventure || isModeEdu || isModeAnnual ? 'mr-[-11px]' : '',
        ]"
      />
    </div>
  </div>

  <!-- Loading State -->
  <div
    v-else
    class="flex space-x-2 h-full animate-pulse"
    :class="[isThemeSoventure ? 'mb-[-5px]' : '']"
  >
    <div class="flex flex-col max-w-96 min-w-64 justify-center pl-3">
      <div class="h-4 bg-imt-grey rounded w-3/4 mb-2"></div>
      <div class="h-3 bg-imt-grey rounded w-full mb-1"></div>
      <div class="h-3 bg-imt-grey rounded w-5/6 mb-1"></div>
      <div class="h-3 bg-imt-grey rounded w-2/3"></div>
    </div>

    <div
      class="flex-shrink-0 w-[131px] flex items-center justify-center h-full"
    >
      <div class="bg-imt-grey w-[131px] h-[131px] rounded"></div>
    </div>
  </div>
</template>
