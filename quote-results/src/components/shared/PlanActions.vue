<script setup lang="ts">
  import { PropType, computed } from 'vue';
  import { event } from 'vue-gtag';
  import { useUserSessionStore } from '@/store/userSession';
  import { useApiStore } from '@/store/api';
  import { useThemeStore } from '@/store/theme';
  import { QuoteResult } from '@/types';
  import { getOptionKeyFromCoverageMap, formatCurrency } from '@/utility';
  import { GAObject } from '@/types';
  import CertificateLink from '@/components/shared/CertificateLink.vue';
  import { ChevronUpIcon } from '@heroicons/vue/24/solid';

  const props = defineProps({
    plan: {
      type: Object as PropType<QuoteResult>,
      required: true,
    },
    modal: {
      type: Boolean,
      required: true,
    },
    isComparePage: {
      type: Boolean,
      required: false,
      default: false,
    },
    onSeeDetailsClick: {
      type: Function as PropType<() => void>,
      required: false,
      default: undefined,
    },
    isDetailsOpen: {
      type: Boolean,
      required: false,
      default: false,
    },
  });
  const sessionStore = useUserSessionStore();
  const apiStore = useApiStore();
  const themeStore = useThemeStore();
  const isThemeSoventure = computed(() => themeStore.isThemeSoventure);
  const isMobile = computed(() => sessionStore.isMobileView);
  const isModeEdu = computed(() => themeStore.isModeEdu);
  const handleCheckboxSelect = () => {
    sessionStore.setSelectedPlanForCompare(props.plan.code);
  };

  const isComparePage = window.location.pathname.includes('compare');

  const trackCertificateClick = (planCode: string) => {
    event('plan_action_plan_details_modal', {
      hierarchical_layer_1: 'View Certificate Clicked',
      hierarchical_layer_2: `Plan Code ${planCode}`,
      hierarchical_layer_4: isComparePage
        ? 'Compare Page'
        : 'Quote Results Page',
    } as GAObject);
  };

  /**
   * Determines of checkbox is disabled.
   */
  const isCheckboxDisabled = computed(() => {
    const plansToCompare = sessionStore.getSelectedPlansForCompare;
    let compareLimit = Number(
      apiStore.getFFValue('web_20251113_qr_number_of_compare')
    );

    if (isNaN(compareLimit) || compareLimit <= 0) {
      compareLimit = 3;
    }

    if (plansToCompare.includes(props.plan.code)) {
      return false;
    }

    if (sessionStore.getSelectedPlansForCompare.length < compareLimit) {
      return false;
    }
    return true;
  });

  const currentCost = computed(() =>
    sessionStore.getCurrentPlanCostFormatted(props.plan?.code)
  );

  const currentCostParts = computed(() => {
    return currentCost.value.split('.');
  });

  const handleBuyButtonSelection = async (planCode: string) => {
    // Fire Event when Buy Button has been selected.
    event('plan_action_plan_details_modal', {
      hierarchical_layer_1: 'Selected Clicked',
      hierarchical_layer_2: `Plan Code ${planCode}`,
      hierarchical_layer_4: isComparePage
        ? 'Compare Page'
        : 'Quote Results Page',
    } as GAObject);

    sessionStore.setPBMCurrentState(true);
    sessionStore.setPBMPlan(props.plan?.code);
  };

  const displayModal = () => {
    sessionStore.setPlanCodeForModal(props.plan.code);
    sessionStore.setModalCurrentState(true);

    event('plan_action_plan_details_modal', {
      hierarchical_layer_1: 'Plan Details Clicked',
      hierarchical_layer_2: `Plan Code ${props.plan.code}`,
      hierarchical_layer_4: isComparePage
        ? 'Compare Page'
        : 'Quote Results Page',
    } as GAObject);
  };

  const displayAdditionalText = computed(() => {
    const isCFARSelected = sessionStore.getSelectedFilters.includes(
      'cancelForAnyReasonOption-0'
    );

    if (!isCFARSelected) {
      return '';
    }

    const currentCost = sessionStore.getCurrentPlanCostUnformatted(
      props.plan.code
    );
    const currentOptions = sessionStore.getOptionsOfSelectedPlan(
      props.plan.code
    );
    const optionKey = getOptionKeyFromCoverageMap(
      'cancelForAnyReasonOption',
      currentOptions
    );

    // To handle the case where the user has selected the CFAR Filter but has removed the option,
    // we want to hide the additional text.
    if (optionKey) {
      const selectedCFAROption = sessionStore.getSelectedCFAROption(
        props.plan.code
      );

      // We check if the cfar option is 'on' in the case of it being boolean,
      // or if the option is not 'off' in the case of it being multiple choice, (e.g. 'off', '50%', '75%').
      if (
        selectedCFAROption &&
        (currentOptions[optionKey].values?.on?.selected ||
          !currentOptions[optionKey].values?.off?.selected)
      ) {
        return formatCurrency(currentCost - selectedCFAROption.cost, 2);
      }
    }

    return '';
  });

  const planCodesWithoutTripCost = computed(() =>
    apiStore.getFFValue('cms_20250915_plans_without_trip_cost_us_release')
  );

  const isNewPlanRowDetailsEnabled = computed(() =>
    apiStore.getFFValue(
      'website_20260121_enable_new_plan_row_details_us_release'
    )
  );

  const planCodesWithoutTripCostArray = computed(() => {
    if (
      planCodesWithoutTripCost.value !== '' &&
      typeof planCodesWithoutTripCost.value === 'string'
    ) {
      return planCodesWithoutTripCost.value.split(',');
    }
    return [];
  });

  const isSoventureUpdateTripCostHidden = computed(
    () => sessionStore.isSoventureUpdateTripCostHidden
  );

  const numberOfTravelers = computed(
    () => apiStore.getQuoteDetails?.travelers?.length
  );

  const showUpdateTripCostText = computed(() => {
    return (
      apiStore.getTripCost === numberOfTravelers.value &&
      themeStore.isThemeSoventure &&
      !planCodesWithoutTripCostArray.value.includes(props.plan.code)
    );
  });

  const isBuyButtonAndCompareButtonHidden = computed(() => {
    return (
      !showUpdateTripCostText.value || isSoventureUpdateTripCostHidden.value
    );
  });
  const isComparing = computed(() =>
    sessionStore.isPlanSelectedForCompare(props.plan.code)
  );

</script>

<template>
  <div
    class="plan-actions grid grid-cols-12 gap-2"
    :class="{ 'flex flex-col items-center justify-center': isThemeSoventure }"
  >
    <div
      class="mt-2.5 md:mt-0 md:col-span-12"
      :class="{
        'col-span-12': (modal && isMobile) || isComparePage,
        'col-span-3 flex xs:block xs:col-span-3': !modal && !isComparePage,
        'justify-around': displayAdditionalText.length,
      }"
    >
      <!-- Cost -->
      <p
        v-if="showUpdateTripCostText && !isSoventureUpdateTripCostHidden"
        class="text-sm text-center capitalize text-[#F7966F] py-1"
      >
        Update total trip cost to see prices
      </p>
      <p
        v-else-if="Array.isArray(currentCostParts)"
        class="font-bold flex justify-center"
      >
        <span
          v-if="!isComparePage"
          class="inline-flex items-start text-imt-black"
        >
          <span class="text-sm md:text-2xl">$</span>
          <span
            class="md:text-[2.5rem] leading-none"
            :class="{
              'pt-[0.188rem] text-[0.875rem] xs:text-[0.938rem] [@media(min-width:500px)]:text-[1.25rem] [@media(min-width:565px)]:text-[1.75rem] md:text-[2.5rem] xs:pt-0':
                Number(currentCostParts[0].replace(/,/g, '')) > 999,
              'text-[1.4rem] xs:text-[1.75rem]':
                Number(currentCostParts[0].replace(/,/g, '')) <= 999,
            }"
            >{{ currentCostParts[0] }}
          </span>
          <span class="inline-flex flex-col items-start pt-[0.188rem]">
            <span
              class="text-[0.625rem]/[1.5] md:text-[0.75rem]/[1.5] font-bold"
              >.{{ currentCostParts[1] }}</span
            >
            <span
              class="text-[0.5rem]/[1.5] md:text-[0.75rem]/[1.5] font-normal uppercase"
              >Total</span
            >
          </span>
        </span>
        <span v-else class="inline-flex items-start text-imt-black cap-trim">
          <span class="text-sm md:text-[1.750rem]/[1.5]">$</span>
          <span
            class="md:text-[1.875rem]/[1.5] leading-none"
            :class="{
              'pt-[0.188rem] text-[0.875rem] xs:text-[0.938rem] [@media(min-width:500px)]:text-[1.25rem] [@media(min-width:565px)]:text-[1.75rem] md:text-[2.5rem] xs:pt-0':
                Number(currentCostParts[0].replace(/,/g, '')) > 999,
              'text-[1.4rem] xs:text-[1.75rem]':
                Number(currentCostParts[0].replace(/,/g, '')) <= 999,
            }"
            >{{ currentCostParts[0] }}
          </span>
          <span
            class="inline-flex flex-col items-start pt-[0.188rem] md:pt-2.5"
          >
            <span
              class="text-[0.625rem]/[1.5] md:text-[0.8125re]/[1.5] font-bold"
              >.{{ currentCostParts[1] }}</span
            >
            <span
              class="text-[0.5rem]/[1.5] md:text-[0.65rem]/[1.5] font-normal uppercase"
              >Total</span
            >
          </span>
        </span>
      </p>
      <span
        v-else
        class="w-32 bg-imt-grey h-8 rounded-md animate-pulse inline-block"
      ></span>
      <!-- Additional Info Text f.e. CFAR -->
      <div
        v-if="displayAdditionalText.length > 0"
        class="display-none md:flex flex-row sm:mt-2 mt-0"
        :data-cy="`plan-action__cfar-additional-text-${plan.code}`"
      >
        <p class="font-bold text-lg">{{ displayAdditionalText }}</p>
        <p class="ml-1 text-[0.5rem] uppercase">
          <span class="font-bold">without </span><br />cancel for any reason
        </p>
      </div>
    </div>
    <button
      v-if="isBuyButtonAndCompareButtonHidden"
      :data-cy="
        modal
          ? `plan-action__select__button-details-${plan.code}`
          : `plan-action__select__button-results-${plan.code}`
      "
      class="rounded-md mt-2.5 md:mt-2 p-1 color-white btn-primary text-[white] w-full border-none font-bold text-[0.85rem] h-9 mr-2 md:col-span-12"
      :class="{
        'col-span-12': (modal && isMobile) || isComparePage,
        'col-span-3': !modal && !isComparePage,
      }"
      @click="handleBuyButtonSelection(plan.code)"
    >
      SELECT
    </button>
    <button
      v-if="
        !modal &&
        !isModeEdu &&
        isBuyButtonAndCompareButtonHidden &&
        !isComparePage
      "
      class="md:mb-2 w-full bg-[white] border-2 rounded-md flex p-1 items-center text-center mt-2.5 cursor-pointer relative gap-[5px] justify-center border-action-alt-primary mr-2 h-9 col-span-3 md:col-span-6"
      :class="{
        'daisy-tooltip': isCheckboxDisabled,
        'bg-action-primary': isComparing,
        'col-span-12': modal,
      }"
      :for="`toggle-${plan.code}`"
      title="Select this plan to compare it with other plans."
      :data-cy="`plan-action__compare__button-${plan.code}`"
      data-tip="To compare this plan, please uncheck one of the other selected plans."
      @click="handleCheckboxSelect"
    >
      <input
        v-if="isComparing"
        type="checkbox"
        :checked="isComparing"
        class="display-none sm:block form-checkbox h-[0.625rem] w-[0.625rem] text-white rounded accent-action-primary focus:ring-action-primary"
        :class="{
          'bg-action-primary': isComparing,
        }"
        :disabled="isCheckboxDisabled"
      />
      <span
        :id="`button-${plan.code}`"
        :checked="isComparing"
        class="uppercase bg-[white] text-action-alt-primary text-[0.625rem] font-bold"
        :class="{
          'bg-action-primary text-imt-input-color-default': isComparing,
        }"
        >Compare
      </span>
    </button>
    <CertificateLink
      v-else-if="modal"
      :plan-code="plan.code"
      :data-cy="`plan-action__certificate__link-details-${plan.code}`"
      class="col-span-12 text-action-primary text-sm display-none md:block pt-3"
      :track-certificate-click="() => trackCertificateClick(plan.code)"
    />
    <button
      v-else-if="!isComparePage && !modal"
      class="md:mb-2 w-full bg-[white] border-2 rounded-md flex p-1 items-center text-center mt-2.5 cursor-pointer relative gap-[5px] justify-center border-action-alt-primary h-9 col-span-3"
      :class="{
        'md:col-span-10 md:col-start-2': !isBuyButtonAndCompareButtonHidden,
        'md:col-span-6': isBuyButtonAndCompareButtonHidden,
      }"
      :data-cy="`plan-action__plan-details__button-${plan.code}`"
      @click="
        isNewPlanRowDetailsEnabled ? onSeeDetailsClick?.() : displayModal()
      "
    >
      <span
        class="uppercase bg-[white] text-action-alt-primary font-bold text-[0.625rem] flex items-center justify-center gap-1"
        >{{ isNewPlanRowDetailsEnabled ? 'Details' : 'See Details' }}
        <ChevronUpIcon
          v-if="isNewPlanRowDetailsEnabled"
          class="size-5 text-action-alt-primary cursor-pointer transition-transform duration-200 ease-in-out"
          :class="{ 'rotate-180': isDetailsOpen }"
        />
      </span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
  #quote-results-app {
    .plan-actions {
      .daisy-tooltip::before {
        left: 0%;
      }
    }
    .input-checkbox:checked {
      background-color: var(--action-alt-primary);
    }
    .input-checkbox:checked::before {
      appearance: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      color: white;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .input-checkbox:checked::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 1px;
      width: 6px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
  .cap-trim {
    display: inline-flex; /* so we can center things nicely */
    align-items: center; /* centers text visually inside the box */
    line-height: 1; /* kill extra leading */
  }
</style>
