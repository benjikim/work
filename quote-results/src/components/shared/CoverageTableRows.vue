<script setup lang="ts">
  import { useUserSessionStore } from '@/store/userSession';
  import { computed } from 'vue';
  import UtilityHTMLRenderer from '@/components/utility/UtilityHTMLRenderer.vue';
  import {
    getCoverageData,
    getOptionKeyFromCoverageMap,
    getCoverageLTCMessage,
    formatCurrency,
  } from '@/utility';
  import { useApiStore } from '@/store/api';
  import Option from '../options/Option.vue';
  import { useContentStore } from '@/store/content';
  import { useThemeStore } from '@/store/theme';
  import { QuoteResult } from '@/types';
  import Secondary from '@/components/shared/Secondary.vue';
  import { event } from 'vue-gtag';
  import { GAObject } from '@/types';
  import CertificateLink from '@/components/shared/CertificateLink.vue';

  const props = defineProps({
    planCode: {
      type: String,
      required: true,
    },
    coverage: {
      type: Object,
      required: true,
    },
    optionLocation: {
      type: String,
      required: true,
    },
  });

  const sessionStore = useUserSessionStore();
  const apiStore = useApiStore();
  const contentStore = useContentStore();
  const themeStore = useThemeStore();
  const isModeAnnual = computed(() => themeStore.isModeAnnual);

  const isCoverageAvailable = (planCode: string, coverage: string) => {
    return sessionStore.getCoveragesOfSelectedPlan(planCode)?.[coverage];
  };

  const annualSingleTripAvailabilityKeys = new Set([
    'financialDefault',
    'cancelForAnyReasonOption',
    'tripInterruptionForAnyReason',
    'vacationRentalDamage',
    'preExWaiver',
  ]);

  const options = computed(() => {
    if (props.planCode)
      return sessionStore.getOptionsOfSelectedPlan(props.planCode);
  });

  const plan = computed(() => {
    if (props.planCode) return apiStore.getPlanByPlanCode(props.planCode);
  });

  const isSecondary = (plan: QuoteResult, coverageId: string) => {
    const currentCoverage = plan.coverages.find(
      (coverage) => coverage.id === coverageId
    );
    return currentCoverage?.secondary;
  };

  const trackCertificateClick = (planCode: string) => {
    event('plan_action_plan_details_modal', {
      hierarchical_layer_1:
        'Certificate selected on Details Modal above coverage limits',
      hierarchical_layer_2: `Plan Code ${planCode}`,
      hierarchical_layer_4: 'Annual Plan Details Page',
    } as GAObject);
  };

  const displayTripInterruptionAndTripCancellation = (coverageKey: string) => {
    const coverage = plan.value?.coverages.find(
      (coverage) => coverage.id === coverageKey
    );
    if (!coverage || !coverage.limits) return;

    if (
      isModeAnnual.value &&
      coverage.details &&
      coverage.details.length > 0 &&
      coverage.details[0].description.length > 0
    ) {
      return `<strong>${coverage.details[0].description}</strong>`;
    }

    const coverageType = coverage?.limits[0]?.valueType ?? false;
    let value = coverage?.limits[0]?.coverageValue ?? false;

    if (coverageType === 'limit') {
      value = formatCurrency(value, 0);
    } else if (coverageType === 'percentage') {
      value = `${value}%`;
    } else {
      value = '-';
    }

    return `<strong>${value}</strong>`;
  };

  const numberOfTravelers = computed(
    () => apiStore.getQuoteDetails?.travelers?.length
  );

  const isTripCostLessThanOrEqualTo1 = computed(() => {
    return apiStore.getTripCost <= numberOfTravelers.value;
  });

  const isEligibilityContentAvailable = computed(() => {
    return (
      contentStore.getMoreInfoText(props.planCode, 'eligibility') !== undefined
    );
  });

  const handleAvailabilityMoreInfoClick = () => {
    event('plan_action_annual_eligibility_click', {
      hierarchical_layer_1: 'Annual Eligibility',
      hierarchical_layer_2: `Plan Code ${props.planCode}`,
      hierarchical_layer_3: 'Annual Quote Results',
    } as GAObject);

    sessionStore.setMoreInfoModalKey('eligibility');
    sessionStore.setMoreInfoModalOpen(true);
  };
</script>
<template>
  <td class="font-bold text-xs bg-[#F6FAFD] snap-center">
    <span
      v-if="optionLocation !== 'detailsModal'"
      class="font-bold text-[#878787] uppercase text-xs text-left table-cell relative right-2 md:display-none"
    >
      {{ coverage.label }}
    </span>

    <div
      v-if="
        plan &&
        coverage.key === 'availability' &&
        plan.type === 'Evacuation' &&
        plan?.availability
      "
      :data-cy="`coverage-${coverage.key}__${optionLocation}-${planCode}`"
    >
      {{
        plan.availability[0] != undefined
          ? `${plan.availability[0]?.value} ${plan.availability[0]?.description}`
          : '-'
      }}
    </div>

    <div v-else-if="coverage.key === 'certificate' && isModeAnnual">
      <CertificateLink
        v-if="plan && plan.certificate.url"
        :plan-code="plan.code"
        :certificate-url="plan.certificate.url"
        label="See Full Plan Information"
        class="text-xs text-action-primary font-bold"
        data-cy="plan-details__certificate_link"
        :track-certificate-click="trackCertificateClick"
      />
    </div>

    <div v-else-if="coverage.key === 'annualEligibility' && isModeAnnual">
      <button
        :data-cy="`coverage-${coverage.key}__${optionLocation}-${planCode}`"
        class="text-xs text-action-primary font-bold btn btn-link capitalize p-0 tracking-normal"
        @click="sessionStore.setAnnualEligibilityModalOpen(true)"
      >
        View Annual Eligibility
      </button>
    </div>

    <div
      v-else-if="plan && coverage.key === 'refundWindow' && plan?.reviewPeriod"
      :data-cy="`coverage-${coverage.key}__${optionLocation}-${planCode}`"
    >
      {{
        plan.reviewPeriod[0] != undefined
          ? `${plan.reviewPeriod[0]?.value} ${plan.reviewPeriod[0]?.description}`
          : '-'
      }}
    </div>

    <div
      v-else-if="
        options?.[coverage.key] ||
        getOptionKeyFromCoverageMap(coverage.key, options)
      "
    >
      <Option
        :plan-code="planCode"
        :option-key="
          getOptionKeyFromCoverageMap(coverage.key, options) ?? coverage.key
        "
        :option-location="optionLocation"
      />
    </div>

    <template
      v-else-if="
        plan &&
        isTripCostLessThanOrEqualTo1 &&
        ['tripInterruption', 'tripCancellation'].includes(coverage.key) &&
        plan.type === 'Comprehensive'
      "
    >
      <div class="flex">
        <UtilityHTMLRenderer
          is="span"
          class="utility-html-renderer inline"
          :data-cy="`coverage-${coverage.key}__${optionLocation}-${planCode}`"
          :content="displayTripInterruptionAndTripCancellation(coverage.key)"
        ></UtilityHTMLRenderer>
      </div>
    </template>

    <template v-else-if="plan && isCoverageAvailable(planCode, coverage.key)">
      <div class="flex">
        <UtilityHTMLRenderer
          is="span"
          class="utility-html-renderer inline"
          :data-cy="`coverage-${coverage.key}__${optionLocation}-${planCode}`"
          :content="getCoverageData(plan, coverage.key)"
        ></UtilityHTMLRenderer>
        <Secondary
          v-if="plan && isSecondary(plan, coverage.key)"
          :data-cy="`coverage-${coverage.key}__${optionLocation}-${planCode}-secondary`"
          modal-view
        />
      </div>
      <template
        v-if="
          isModeAnnual &&
          coverage.key === 'availability' &&
          isEligibilityContentAvailable
        "
      >
        <button
          :data-cy="`coverage-${coverage.key}__${optionLocation}-${planCode}-more-info`"
          class="text-xs text-action-primary font-bold btn btn-link capitalize p-0 tracking-normal"
          @click="handleAvailabilityMoreInfoClick"
        >
          More Information on Annual Eligibility
        </button>
      </template>
    </template>

    <div
      v-else-if="
        plan &&
        getCoverageLTCMessage(
          contentStore.getLTCSearchTerms(coverage.key),
          plan
        )
      "
      class="daisy-tooltip"
      :data-tip="
        getCoverageLTCMessage(
          contentStore.getLTCSearchTerms(coverage.key),
          plan
        )?.message
      "
      :data-cy="`coverage-${coverage.key}__${optionLocation}-${planCode}`"
    >
      <a class="text-xs text-color-action-alt-primary">N/A*</a>
    </div>

    <span
      :data-cy="`coverage-${coverage.key}__${optionLocation}-${planCode}`"
      :class="
        isModeAnnual && annualSingleTripAvailabilityKeys.has(coverage.key)
          ? 'text-[rgba(42,42,42,0.5)]'
          : ''
      "
      v-else
    >
      {{
        isModeAnnual && coverage.annualBottomLabel
          ? coverage.annualBottomLabel
          : isModeAnnual && annualSingleTripAvailabilityKeys.has(coverage.key)
            ? 'Available on select single-trip plans'
          : '-'
      }}
    </span>
  </td>
</template>
