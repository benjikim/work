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
  import Option from '@/components/options/Option.vue';
  import { useContentStore } from '@/store/content';
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

  const isCoverageAvailable = (planCode: string, coverage: string) => {
    return sessionStore.getCoveragesOfSelectedPlan(planCode)?.[coverage];
  };

  const options = computed(() => {
    if (props.planCode)
      return sessionStore.getOptionsOfSelectedPlan(props.planCode);
  });

  const plan = computed(() => {
    if (props.planCode) return apiStore.getPlanByPlanCode(props.planCode);
  });

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

    const coverageType = coverage?.limits[0]?.valueType ?? false;
    let value = coverage?.limits[0]?.coverageValue ?? false;

    if (coverageType === 'limit') {
      value = formatCurrency(value, 0);
    } else if (coverageType === 'percentage') {
      value = `${value}%`;
    } else {
      value = '-';
    }

    return `${value}`;
  };

  const numberOfTravelers = computed(
    () => apiStore.getQuoteDetails?.travelers?.length
  );

  const isTripCostLessThanOrEqualTo1 = computed(() => {
    return apiStore.getTripCost <= numberOfTravelers.value;
  });
</script>
<template>
  <td
    v-if="coverage.key === 'certificate'"
    colspan="2"
    class="text-xs snap-center text-center"
  >
    <CertificateLink
      v-if="plan && plan.certificate.url"
      :plan-code="plan.code"
      :certificate-url="plan.certificate.url"
      label="View Certificate"
      class="text-xs text-action-primary font-bold"
      data-cy="plan-details__certificate_link"
      :track-certificate-click="trackCertificateClick"
    />
  </td>
  <td v-else class="text-sm font-normal normal-case text-left align-top">
    <span
      v-if="optionLocation !== 'planRowDetails'"
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
      class="text-sm font-normal normal-case text-left"
      :data-cy="`coverage-${coverage.key}__${optionLocation}-${planCode}`"
    >
      {{
        plan.availability[0] != undefined
          ? `${plan.availability[0]?.value} ${plan.availability[0]?.description}`
          : '-'
      }}
    </div>

    <div
      v-else-if="plan && coverage.key === 'refundWindow' && plan?.reviewPeriod"
      class="text-sm font-normal normal-case text-left"
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
          class="utility-html-renderer inline text-sm font-normal normal-case text-left"
          :data-cy="`coverage-${coverage.key}__${optionLocation}-${planCode}`"
          :content="displayTripInterruptionAndTripCancellation(coverage.key)"
        ></UtilityHTMLRenderer>
      </div>
    </template>

    <template v-else-if="plan && isCoverageAvailable(planCode, coverage.key)">
      <div class="flex">
        <UtilityHTMLRenderer
          is="span"
          class="utility-html-renderer inline text-sm font-normal normal-case text-left"
          :data-cy="`coverage-${coverage.key}__${optionLocation}-${planCode}`"
          :content="getCoverageData(plan, coverage.key)"
        ></UtilityHTMLRenderer>
      </div>
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
      <a class="text-sm font-normal normal-case text-color-action-alt-primary">N/A*</a>
    </div>

    <span
      class="text-sm font-normal normal-case"
      :data-cy="`coverage-${coverage.key}__${optionLocation}-${planCode}`"
      v-else
      >N/A
    </span>
  </td>
</template>
