<script setup lang="ts">
  import { QuoteResult } from '@/types';
  import { PropType, computed } from 'vue';
  import { getCoverageData } from '@/utility';
  import { useContentStore } from '@/store/content';
  import CertificateLink from '@/components/shared/CertificateLink.vue';
  import CoverageLabelToolTip from '@/components/shared/CoverageLabelToolTip.vue';
  import UtilityHTMLRenderer from '@/components/utility/UtilityHTMLRenderer.vue';
  import { event } from 'vue-gtag';
  import { GAObject } from '@/types';

  const contentStore = useContentStore();

  defineProps({
    plan: {
      type: Object as PropType<QuoteResult>,
      required: true,
    },
  });

  const coverageLimitMap = computed(() => {
    return contentStore.getPlanDetailsCoverageLimitMap;
  });

  const planInfoSection = computed(() => {
    return coverageLimitMap.value.find(
      (section) => section.header === 'Plan Info'
    );
  });

  const trackCertificateClick = (planCode: string) => {
    event('plan_action_plan_details', {
      hierarchical_layer_1:
        'Certificate selected on Details Modal above coverage limits',
      hierarchical_layer_2: `Plan Code ${planCode}`,
      hierarchical_layer_4: 'Annual Plan Details Page',
    } as GAObject);
  };
</script>

<template>
  <!-- Plan Info -->
  <h3
    v-if="planInfoSection"
    :class="`tr_${planInfoSection.header.toLocaleLowerCase().split(' ').join('_')} text-xs md:text-sm border-b border-[#A7A7A7] pb-2 mb-2 text-imt-black`"
  >
    {{ planInfoSection.header }}
  </h3>
  <div
    v-if="planInfoSection"
    v-for="(coverage, index) in planInfoSection.coverages"
    :key="coverage.key"
  >
    <div
      class="flex items-center gap-2 pb-2 mb-2"
      :class="{
        'border-b border-[#EFF2F5] pb-2 mb-2':
          index !== planInfoSection.coverages.length - 1,
      }"
    >
      <CertificateLink
        v-if="coverage.key === 'certificate' && plan && plan.certificate.url"
        :plan-code="plan.code"
        :certificate-url="plan.certificate.url"
        label="View Certificate"
        class="text-xs text-action-primary font-bold text-left"
        data-cy="plan-details__certificate_link"
        :track-certificate-click="() => trackCertificateClick(plan.code)"
      />
      <div v-else>
        <CoverageLabelToolTip
          :tool-tip-text="coverage.toolTipText"
          :mobile-modal-heading="coverage.label"
          underline-label
        >
          <span
            class="text-sm font-normal text-[#878787] uppercase whitespace-nowrap"
            >{{ coverage.label }}
          </span>
        </CoverageLabelToolTip>
        <div
          v-if="plan && coverage.key === 'refundWindow' && plan?.reviewPeriod"
          class="pt-2 text-sm font-normal text-black"
          :data-cy="`coverage-${coverage.key}__details-${plan.code}`"
        >
          {{
            plan.reviewPeriod[0] != undefined
              ? `${plan.reviewPeriod[0]?.value} ${plan.reviewPeriod[0]?.description}`
              : '-'
          }}
        </div>
        <div v-else-if="getCoverageData(plan, coverage.key)">
          <UtilityHTMLRenderer
            is="span"
            class="utility-html-renderer inline pt-2 text-sm font-normal text-black"
            :data-cy="`coverage-${coverage.key}__details-${plan.code}`"
            :content="getCoverageData(plan, coverage.key)"
          ></UtilityHTMLRenderer>
        </div>
      </div>
    </div>
  </div>
</template>
