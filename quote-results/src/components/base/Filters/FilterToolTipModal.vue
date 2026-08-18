<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue';
  import { useContentStore } from '@/store/content';
  import UtilityHTMLRenderer from '@/components/utility/UtilityHTMLRenderer.vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { useApiStore } from '@/store/api';
  import { initResellerRatings } from '@/utility';

  const sessionStore = useUserSessionStore();
  const contentStore = useContentStore();
  const apiStore = useApiStore();

  /**
   * Closes the modal by setting toolTip to false.
   */
  const closeModal = () => {
    sessionStore.setFilterToolTipModalOpen(false);
  };

  const filterToolTipOverrides: Record<
    string,
    { contentKey: string; label?: string; toolTipText?: string }
  > = {
    'tripInterruption-0': {
      contentKey: 'tripInterruption',
      label: '100% of trip cost',
      toolTipText:
        'Trip Cancellation and Trip Interruption coverage can reimburse you for eligible, non-refundable expenses if you have to cancel your trip before departure or cut your trip short after it has started due to a covered reason.\n\n100% of trip cost covers eligible expenses up to the insured trip cost.',
    },
    'tripInterruption-1': {
      contentKey: 'tripInterruption',
      label: '125% of trip cost',
      toolTipText:
        'Trip Cancellation and Trip Interruption coverage can reimburse you for eligible, non-refundable expenses if you have to cancel your trip before departure or cut your trip short after it has started due to a covered reason.\n\n125% of trip cost provides coverage above the insured trip cost for eligible interruption-related expenses that can arise during travel.',
    },
    'tripInterruption-2': {
      contentKey: 'tripInterruption',
      label: '150% of trip cost',
      toolTipText:
        'Trip Cancellation and Trip Interruption coverage can reimburse you for eligible, non-refundable expenses if you have to cancel your trip before departure or cut your trip short after it has started due to a covered reason.\n\n150% of trip cost provides additional coverage above the insured trip cost for eligible interruption-related expenses that can arise during travel.',
    },
    'cancelForAnyReasonOption-0': {
      contentKey: 'cancelForAnyReasonOption',
      label: 'Cancel for Any Reason (CFAR)',
    },
    'medical-0': {
      contentKey: 'medical',
      label: 'All Amounts',
    },
    'medical-1': {
      contentKey: 'medical',
      label: 'Minimum — up to $50,000',
    },
    'medical-2': {
      contentKey: 'medical',
      label: 'Basic — $50,000 and up',
    },
    'medical-3': {
      contentKey: 'medical',
      label: 'Recommended — $100,000+',
    },
    'medical-4': {
      contentKey: 'medical',
      label: 'Maximum — $250,000 and up',
    },
    'medical-primary': {
      contentKey: 'medical',
      label: 'Primary Only',
      toolTipText:
        'Primary medical coverage can pay eligible covered medical expenses first, before other collectible insurance, up to the plan limit.',
    },
    'preExWaiver-0': {
      contentKey: 'preExWaiver',
      label: 'PRE-EX Waivers',
    },
    'emergencyMedicalEvacuation-0': {
      contentKey: 'emergencyMedicalEvacuation',
      label: 'All Amounts',
    },
    'emergencyMedicalEvacuation-1': {
      contentKey: 'emergencyMedicalEvacuation',
      label: 'up to $150,000',
    },
    'emergencyMedicalEvacuation-2': {
      contentKey: 'emergencyMedicalEvacuation',
      label: '$250,000',
    },
    'emergencyMedicalEvacuation-3': {
      contentKey: 'emergencyMedicalEvacuation',
      label: '$500,000',
    },
    'emergencyMedicalEvacuation-4': {
      contentKey: 'emergencyMedicalEvacuation',
      label: '$1,000,000',
    },
    'emergencyMedicalEvacuation-5': {
      contentKey: 'emergencyMedicalEvacuation',
      label: 'Unlimited',
    },
    'emergencyMedicalEvacuation-primary': {
      contentKey: 'emergencyMedicalEvacuation',
      label: 'Primary Only',
      toolTipText:
        'Primary evacuation coverage can provide eligible transportation benefits up to the plan limit without first depending on other collectible insurance.',
    },
    'travelDelay-0': {
      contentKey: 'travelDelay',
      label: 'Travel Delay',
    },
    'baggageDelay-0': {
      contentKey: 'baggageDelay',
      label: 'Baggage Delay',
    },
    'baggage-0': {
      contentKey: 'baggage',
      label: 'Baggage Loss up to $750',
    },
    'baggage-1': {
      contentKey: 'baggage',
      label: 'Baggage Loss $1000',
    },
    'baggage-2': {
      contentKey: 'baggage',
      label: 'Baggage Loss $1500 to $2000',
    },
    'baggage-3': {
      contentKey: 'baggage',
      label: 'Baggage Loss $2,500 and more',
    },
    'otherCoverages-0': {
      contentKey: 'otherCoverages',
      label: 'Rental Car',
      toolTipText:
        'If the rental car is damaged in an accident, the cost of repairs and replacements on a rental car may be reimbursable with this benefit.',
    },
    'otherCoverages-1': {
      contentKey: 'otherCoverages',
      label: 'Vacation',
      toolTipText:
        'Vacation Rental Liability coverage helps protect from expenses should accidental damage occur to your rental property during your trip.',
    },
    'otherCoverages-2': {
      contentKey: 'otherCoverages',
      label: 'Cruise',
      toolTipText:
        'Cruise-focused coverage can help travelers compare plans that better align with cruise-related travel needs and disruptions.',
    },
    'accidentalDeath24Hour-0': {
      contentKey: 'accidentalDeath',
      label: 'Accidental Death',
    },
  };

  const toolTipData = computed(() => {
    const rawKey = sessionStore.getFilterToolTipId;
    const override = filterToolTipOverrides[rawKey];
    const base = contentStore.getFilterData(override?.contentKey || rawKey);
    const label = sessionStore.getFilterToolTipLabel || override?.label || base?.label;

    return {
      ...base,
      label,
      toolTipText: override?.toolTipText || base?.toolTipText || '',
      toolTipSecondaryText: base?.toolTipSecondaryText ?? '',
      toolTipSecondaryPlans: base?.toolTipSecondaryPlans ?? '',
    };
  });

  const providerTooltipData = computed(() => {
    const rawKey = sessionStore.getFilterToolTipId;
    if (!rawKey.startsWith('provider-')) {
      return null;
    }

    const providerIndex = Number(rawKey.split('-')[1]);
    const provider = apiStore.cms.providers[providerIndex];

    if (!provider) {
      return null;
    }

    const representativePlan = apiStore.getAvailablePlans.find(
      (plan) => plan.provider?.code === provider.code
    );

    const plainSummary =
      provider.summaryListing ||
      provider.summary ||
      provider.contentReviews?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ||
      '';

    const firstSentenceMatch = plainSummary.match(/[^.!?]+[.!?]?/);
    const description = firstSentenceMatch?.[0]?.trim() || plainSummary;

    return {
      name: provider.title || sessionStore.getFilterToolTipLabel || toolTipData.value.label,
      description,
      logo:
        provider.logoSvg?.[0]?.url ||
        provider.logo?.[0]?.url ||
        representativePlan?.provider?.logo?.url ||
        '',
      reviewPlanCode: representativePlan?.code || '',
    };
  });

  const loadProviderRatings = () => {
    if (providerTooltipData.value?.reviewPlanCode) {
      initResellerRatings();
    }
  };

  onMounted(() => {
    loadProviderRatings();
  });

  watch(
    () => providerTooltipData.value?.reviewPlanCode,
    () => {
      loadProviderRatings();
    }
  );

  const coverageModalImages = computed(
    () => contentStore.getCoverageModalImages
  );

  const isFilterToolTipPlanShow = computed(
    () => sessionStore.isFilterToolTipPlanShow
  );

  const HighlightedCoverageInformation = computed(
    () => contentStore.getHighlightedCoverageInformation
  );
</script>
<template>
  <dialog class="daisy-modal daisy-modal-open z-[1000]" @close="closeModal()">
    <div
      class="daisy-modal-box w-dvw max-w-xs p-4 rounded-none overflow-auto shadow-black flex flex-col items-center"
    >
      <template v-if="providerTooltipData">
        <img
          v-if="providerTooltipData.logo"
          class="provider-tooltip__logo"
          :src="providerTooltipData.logo"
          :alt="`${providerTooltipData.name} logo`"
        />
        <p class="text-2xl font-bold text-center mb-3">
          {{ providerTooltipData.name }}
        </p>
        <p
          v-if="providerTooltipData.description"
          class="provider-tooltip__description"
        >
          {{ providerTooltipData.description }}
        </p>
        <div
          v-if="providerTooltipData.reviewPlanCode"
          class="provider-tooltip__reviews"
        >
          <p class="provider-tooltip__reviews-label">Average review</p>
          <div
            class="rr_cat_ratings provider-tooltip__review-stars"
            :data-rr-product-id="providerTooltipData.reviewPlanCode"
          ></div>
        </div>
      </template>

      <p v-if="!providerTooltipData" class="text-2xl font-bold text-center mb-4">
        {{ toolTipData.label }}
      </p>
      <img
        class="w-[50%]"
        v-if="coverageModalImages"
        :src="coverageModalImages[sessionStore.getFilterToolTipId]?.url"
      />
      <UtilityHTMLRenderer
        is="p"
        class="text-base"
        :content="toolTipData.toolTipText"
      ></UtilityHTMLRenderer>

      <UtilityHTMLRenderer
        v-if="
          toolTipData.toolTipSecondaryText !== null && isFilterToolTipPlanShow
        "
        is="p"
        class="mb-4 text-base"
        :content="toolTipData.toolTipSecondaryText"
      ></UtilityHTMLRenderer>

      <!-- Adding dynamic text here for plans gather via API (f.e secondary, coverage messages and etc) -->
      <div
        class="w-full"
        v-for="(coverageInfo, index) in HighlightedCoverageInformation"
        :key="index"
      >
        <br/>
        <div class="flex content-center">
          <p
            v-if="coverageInfo.iconColor"
            :style="{ color: coverageInfo.iconColor }"
            class="text-2xl leading-none"
          >
            •
          </p>
          <p class="font-bold">{{ coverageInfo.heading }}</p>
        </div>
        <p v-if="coverageInfo.description">{{ coverageInfo.description }}</p>
      </div>

      <button
        class="w-full bg-[white] border-2 my-2 p-3 flex justify-center font-semibold rounded-lg uppercase text-action-primary border-action-primary"
        title="Continue"
        @click="closeModal"
      >
        Close
      </button>
    </div>
    <div class="daisy-modal-backdrop" @click="closeModal()"></div>
  </dialog>
</template>

<style scoped>
  .provider-tooltip__logo {
    max-width: 148px;
    max-height: 56px;
    width: auto;
    height: auto;
    margin-bottom: 12px;
    object-fit: contain;
  }

  .provider-tooltip__description {
    margin: 0 0 16px;
    text-align: center;
    font-size: 0.95rem;
    line-height: 1.45;
  }

  .provider-tooltip__reviews {
    width: 100%;
    margin: 0 0 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .provider-tooltip__reviews-label {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .provider-tooltip__review-stars {
    min-width: 120px;
    min-height: 20px;
  }
</style>
