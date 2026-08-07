<script setup lang="ts">
  import { event } from 'vue-gtag';
  import { useUserSessionStore } from '@/store/userSession';
  import { useApiStore } from '@/store/api';
  import { HTTP_REQUEST_STATES } from '@/config';
  import { computed, watchEffect } from 'vue';
  import PlanDetailsTable from '@/components/shared/PlanDetailsTable.vue';
  import BaseReview from '@/components/base/PlanRow/BaseReview.vue';
  import BasePlanRow from '@/components/base/PlanRow/BasePlanRow.vue';
  import { getShownPlans } from '@/utility';
  import ReturnToSiteContainer from '@/components/base/PlanRow/ReturnToSiteContainer.vue';
  import { GAObject } from '@/types';
  import { useContentStore } from '@/store/content';
  const sessionStore = useUserSessionStore();
  const apiStore = useApiStore();
  const contentStore = useContentStore();
  const loadingPlans = 3;

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

  const plans = computed(() => {
    if (displayLoader.value) {
      return [];
    }
    return getShownPlans();
  });

  const currentCost = computed(() =>
    sessionStore.getCurrentPlanCostFormatted(plans.value[0]?.code)
  );

  const currentCostParts = computed(() => {
    return currentCost.value.split('.');
  });

  const getPlanLogo = (planCode: string) => {
    return contentStore.getPlanLogo(planCode);
  };

  const handleBuyButtonSelection = (planCode: string) => {
    event('plan_action_plan_details_modal', {
      hierarchical_layer_1: 'Selected Clicked',
      hierarchical_layer_2: `Plan Code ${planCode}`,
      hierarchical_layer_4: 'Quote Results Page',
    } as GAObject);

    sessionStore.setPBMCurrentState(true);
    sessionStore.setPBMPlan(planCode);
  };

  // Watching if user should see no available plans modal.
  watchEffect(() => {
    if (apiStore.getDataLoadedState) {
      const products = apiStore.getQuoteResults?.products;
      const availablePlans = products?.filter(
        (plan) => plan.available === true
      );
      if (availablePlans.length === 0) {
        sessionStore.setErrorModalState('noAvailablePlans');
      }
    }
  });
</script>
<template>
  <div v-if="displayLoader" class="plan-row-container">
    <BasePlanRow v-for="index in loadingPlans" :key="index" />
  </div>
  <div v-else class="flex flex-col gap-4">
    <div
      v-if="plans[0]?.code"
      class="flex flex-row justify-between items-center"
    >
      <div class="flex flex-col md:flex-row items-center justify-between">
        <div class="flex-shrink-0 px-3">
          <img
            v-if="plans[0]?.code"
            :src="getPlanLogo(plans[0]?.code)"
            class="w-auto h-12 object-contain"
            :alt="`${plans[0]?.provider.name} Logo`"
          />
        </div>
        <div class="flex flex-col items-center">
          <div class="flex-1 text-lg font-bold text-center px-3">
            {{ plans[0]?.name }}
          </div>
          <div class="flex-shrink-0 px-3">
            <BaseReview
              :plan-code="plans[0]?.code"
              :manually-get-reviews="false"
            />
          </div>
        </div>
      </div>
      <div class="flex flex-col items-center space-y-3">
        <div class="text-center">
          <p v-if="currentCost" class="font-bold">
            <span class="inline-flex items-start">
              <span class="text-md">$</span>
              <span class="text-4xl leading-none">{{
                currentCostParts[0]
              }}</span>
              <span class="inline-flex flex-col items-start">
                <span class="text-xs">.{{ currentCostParts[1] }}</span>
                <span class="text-[0.625rem] font-normal uppercase">Total</span>
              </span>
            </span>
          </p>
        </div>
        <button
          :data-cy="`plan-action__select__button-details-${plans[0]?.code}`"
          class="rounded-md px-6 py-2 color-white btn-primary text-white border-none min-w-[190px]"
          @click="handleBuyButtonSelection(plans[0]?.code)"
        >
          SELECT
        </button>
      </div>
    </div>
    <hr />
    <PlanDetailsTable :plan="plans[0]" />
  </div>
  <ReturnToSiteContainer />
</template>

<style lang="scss">
  .plan-row-container {
    width: 100%;
  }
</style>
