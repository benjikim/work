<script setup lang="ts">
  import { computed, watchEffect, watch } from 'vue';
  import { event } from 'vue-gtag';
  import BasePlanRow from '@/components/base/PlanRow/BasePlanRow.vue';
  import BaseSoventurePlanRow from '@/components/base/PlanRow/BaseSoventurePlanRow.vue';
  import { useApiStore } from '@/store/api';
  import { useUserSessionStore } from '@/store/userSession';
  import { useThemeStore } from '@/store/theme';
  import { HTTP_REQUEST_STATES } from '@/config';
  import { getShownPlans } from '@/utility/index.ts';
  import ReturnToSiteContainer from '@/components/base/PlanRow/ReturnToSiteContainer.vue';
  import BaseSubflow from '@/components/base/Subflow/BaseSubflow.vue';
  import SoventureUpdateTripCost from './SoventureUpdateTripCost.vue';
  import { GAObject } from '@/types';

  const apiStore = useApiStore();
  const userSession = useUserSessionStore();
  const themeStore = useThemeStore();
  const displayLoader = computed(() => {
    if (
      apiStore.getQuoteResultsRequestStatus === HTTP_REQUEST_STATES.ERROR ||
      apiStore.getQuoteDetailsRequestStatus === HTTP_REQUEST_STATES.ERROR
    ) {
      return false;
    }

    if (!apiStore.getDataLoadedState && plans.value.length === 0) {
      return true;
    }
    return false;
  });

  const hideSoventureUpdateTripCost = computed(
    () => userSession.isSoventureUpdateTripCostHidden
  );

  const plans = computed(() => {
    if (displayLoader.value) {
      return [];
    }
    return getShownPlans();
  });

  const visiblePlans = computed(() =>
    plans.value.filter((plan) => plan.showPlan !== false)
  );

  const isThemeSoventure = computed(() => themeStore.isThemeSoventure);
  const isModeEdu = computed(() => themeStore.isModeEdu);
  const isViewLG = computed(() => userSession.isViewLG);

  // Watching if user should see no available plans modal.
  watchEffect(() => {
    if (apiStore.getDataLoadedState) {
      const products = apiStore.getQuoteResults?.products;
      const availablePlans = products?.filter(
        (plan) => plan.available === true
      );
      if (availablePlans.length === 0) {
        userSession.setErrorModalState('noAvailablePlans');
      }
    }
  });

  const planCodesWithoutTripCost = computed(() =>
    apiStore.getFFValue('cms_20250915_plans_without_trip_cost_us_release')
  );

  const currentTripCost = computed(() => apiStore.getTripCost);

  const planCodesWithoutTripCostArray = computed(() => {
    if (
      planCodesWithoutTripCost.value !== '' &&
      typeof planCodesWithoutTripCost.value === 'string'
    ) {
      return planCodesWithoutTripCost.value.split(',');
    }
    return [];
  });

  const plansWithoutTripCost = computed(() => {
    if (themeStore.isThemeSoventure) {
      return plans.value.filter((plan) =>
        planCodesWithoutTripCostArray.value.includes(plan.code)
      );
    }
    return [];
  });

  const plansWithTripCost = computed(() => {
    if (themeStore.isThemeSoventure) {
      return plans.value.filter(
        (plan) => !planCodesWithoutTripCostArray.value.includes(plan.code)
      );
    }
    return [];
  });

  // used for loading loading plans
  const loadingPlans = [1, 2, 3, 4, 5];

  // If we add more sites in the future, we should be able to just add them here
  // I assume this component will be used for all sites other than IMT.
  const isMultiSite = computed(() => themeStore.isThemeSoventure);

  const numberOfTravelers = computed(
    () => apiStore.getQuoteDetails?.travelers?.length
  );

  watch(
    [currentTripCost, numberOfTravelers, planCodesWithoutTripCostArray],
    ([
      newCurrentTripCost,
      newNumberOfTravelers,
      newPlanCodesWithoutTripCostArray,
    ]) => {
      if (
        (newCurrentTripCost < newNumberOfTravelers ||
          newCurrentTripCost === 0) &&
        newPlanCodesWithoutTripCostArray.length > 0 &&
        themeStore.isThemeSoventure
      ) {
        userSession.setHideSoventureUpdateTripCost(false);
      } else {
        userSession.setHideSoventureUpdateTripCost(true);
      }
    },
    { immediate: true }
  );

  watch(
    [currentTripCost, numberOfTravelers, planCodesWithoutTripCostArray],
    ([
      newCurrentTripCost,
      newNumberOfTravelers,
      newPlanCodesWithoutTripCostArray,
    ]) => {
      if (
        newCurrentTripCost === newNumberOfTravelers &&
        newPlanCodesWithoutTripCostArray.length > 0 &&
        themeStore.isThemeSoventure &&
        !apiStore.isCoverTripCost
      ) {
        userSession.setHideSoventureUpdateTripCost(false);
      } else {
        userSession.setHideSoventureUpdateTripCost(true);
      }
    },
    { immediate: true }
  );

  const arePlansFullyLoaded = computed(
    () => apiStore.getPlansFullyLoadedStatus
  );

  const showNoFilteredPlansMessage = computed(
    () =>
      !displayLoader.value &&
      apiStore.getDataLoadedState &&
      arePlansFullyLoaded.value &&
      apiStore.getAvailablePlans.length > 0 &&
      visiblePlans.value.length === 0
  );

  const resetFilters = () => {
    userSession.resetFilters();
    event('filters__reset', {
      hierarchical_layer_1: 'Reset Filters Link Clicked',
    } as GAObject);
  };
</script>

<template>
  <div class="w-full plan-row-container">
    <template v-if="displayLoader">
      <BasePlanRow v-for="index in loadingPlans" :key="index" />
    </template>
    <div
      v-else-if="showNoFilteredPlansMessage"
      class="rounded-[6px] border border-[#DEDEDE] bg-white p-4 md:p-5 text-left"
    >
      <p class="text-sm md:text-base text-[#27364A]">
        There are no plans available based on your filter selections,
        <button
          type="button"
          class="text-action-primary underline decoration-dotted underline-offset-2"
          @click="resetFilters"
        >
          click here to show all plans
        </button>
      </p>
    </div>
    <template v-else-if="plans?.length > 0 && !isThemeSoventure">
      <BasePlanRow
        v-for="plan in plans"
        v-show="plan.showPlan"
        :key="plan?.code"
        :plan="plan"
      />
      <BaseSubflow v-if="isModeEdu && !isViewLG" class="px-4" />
      <div
        v-if="!arePlansFullyLoaded"
        class="flex items-center justify-center gap-2 w-full"
      >
        <span
          class="daisy-loading daisy-loading-spinner daisy-loading-sm"
        ></span>
        Loading More Plans
      </div>
    </template>
    <template v-else-if="plans?.length > 0 && isThemeSoventure">
      <div
        v-if="
          currentTripCost === numberOfTravelers &&
          planCodesWithoutTripCostArray.length > 0
        "
      >
        <!-- If Plans in Configcat, are present in plans -->
        <!-- $0 Plans -->
        <BaseSoventurePlanRow
          v-for="plan in plansWithoutTripCost"
          v-show="plan.showPlan"
          :key="plan?.code"
          :plan="plan"
        />
        <!-- Allow users to update trip cost -->
        <SoventureUpdateTripCost
          v-show="!hideSoventureUpdateTripCost"
          :numberOfPlansWithTripCost="plansWithTripCost.length"
        />

        <!-- Plans with trip cost -->
        <div class="display-flex justify-center">
          <BaseSoventurePlanRow
            v-for="plan in plansWithTripCost"
            :key="plan?.code"
            v-show="plan.showPlan"
            :plan="plan"
          />
        </div>
      </div>
      <BaseSoventurePlanRow
        v-else
        v-for="plan in plans"
        v-show="plan.showPlan"
        :key="plan?.code"
        :plan="plan"
      />
    </template>
    <ReturnToSiteContainer v-if="isMultiSite || isModeEdu" />
  </div>
</template>

<style lang="scss">
  .plan-row-container {
    width: 100%;
  }
</style>
