<script setup lang="ts">
  import { QuoteResult, GAObject } from '@/types';
  import { computed, PropType } from 'vue';
  import { useContentStore } from '@/store/content';
  import { useThemeStore } from '@/store/theme';
  import { useUserSessionStore } from '@/store/userSession';
  import AdditionalOptions from '@/components/options/AdditionalOptions.vue';
  import CoverageTableRows from '@/components/shared/CoverageTableRows.vue';
  import IncludedBenefitsTableRows from './IncludedBenefitsTableRows.vue';
  import CoverageLabelToolTip from './CoverageLabelToolTip.vue';
  import { event } from 'vue-gtag';
  import CertificateLink from '@/components/shared/CertificateLink.vue';

  const contentStore = useContentStore();
  const sessionStore = useUserSessionStore();
  const themeStore = useThemeStore();
  const isComparePage = window.location.pathname.includes('compare');

  const props = defineProps({
    plan: {
      type: Object as PropType<QuoteResult>,
      required: false,
    },
  });

  const isModeAnnual = computed(() => themeStore.isModeAnnual);

  const coverageLimitMap = computed(() => {
    // Annual Specific Logic for how we display the table
    if (isModeAnnual.value) {
      const annualCoverageLimitsMap = [...contentStore.getCoverageLimitsMap];

      annualCoverageLimitsMap[0].coverages.push({
        label: 'certificate',
        key: 'certificate',
        toolTipText: 'Certificate of Coverage',
      });

      if (sessionStore.isMobile) {
        annualCoverageLimitsMap[0].coverages.push({
          label: 'annual eligibility',
          key: 'annualEligibility',
          toolTipText: 'Eligibility for annual coverage.',
        });
      }

      // Ben wants the table order to be:
      // 1. Plan Info
      // 2. Optional Coverages
      // 3. Medical
      // 4. Trip Protection
      // 5. Pre-Existing Conditions
      // 6. Evacuation
      // 7. Included Benefits(If Any)
      // Take Optional Coverages and put it under plan info
      const optionalCoverages = annualCoverageLimitsMap.splice(6, 1)[0];
      annualCoverageLimitsMap.splice(1, 0, optionalCoverages);

      // If there are no included benefits, remove the included benefits section
      if (props.plan?.includedBenefits?.length === 0) {
        annualCoverageLimitsMap.pop();
      }

      return annualCoverageLimitsMap;
    }
    // If not annual, return the original coverage limits map
    return contentStore.getCoverageLimitsMap;
  });

  const evacuationSpecificSection = contentStore.getEvacuationSpecificMap;

  const medicalSpecificSection = contentStore.getMedicalSpecificMap;

  const trackCertificateClick = (planCode: string) => {
    event('plan_action_plan_details_modal', {
      hierarchical_layer_1:
        'Certificate selected on Details Modal above coverage limits',
      hierarchical_layer_2: `Plan Code ${planCode}`,
      hierarchical_layer_4: isComparePage
        ? 'Compare Page'
        : 'Quote Results Page',
    } as GAObject);
  };
</script>
<template>
  <div
    v-if="!isModeAnnual"
    class="w-full bg-white border-b-1 uppercase z-10 top-0 pl-6 pt-3 pb-1"
  >
    <p class="font-bold text-xs text-[#878787]">
      coverage limits below are per person
    </p>

    <p class="pt-2 text-xs">
      <CertificateLink
        v-if="plan && plan.certificate.url"
        :plan-code="plan.code"
        :certificate-url="plan.certificate.url"
        label="Please see certificate for full plan information"
        class="text-xs text-action-primary font-bold"
        data-cy="plan-details__certificate_link"
        :track-certificate-click="trackCertificateClick"
      />
    </p>
  </div>
  <table class="daisy-table px-3">
    <template
      v-if="plan"
      v-for="section in coverageLimitMap"
      :key="section.header"
      v-memo="[section, isModeAnnual]"
    >
      <thead v-if="!isModeAnnual || section.header !== 'Included Benefits'">
        <tr
          :class="`tr_${section.header.toLocaleLowerCase().split(' ').join('_')}`"
        >
          <th class="font-bold text-sm text-imt-black">
            {{
              isModeAnnual && section.header === 'Optional Coverages'
                ? 'Coverage Upgrades'
                : section.header
            }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          class="bg-[#F6FAFD]"
          v-if="plan.type === 'Evacuation' && section.header === 'Evacuation'"
          v-for="evacCoverage in evacuationSpecificSection"
          :key="`${evacCoverage.key}-${plan.code}`"
        >
          <td class="font-bold text-[#878787] uppercase text-xs snap-center">
            {{ evacCoverage.label }}
          </td>
          <CoverageTableRows
            :plan-code="plan.code"
            :coverage="evacCoverage"
            optionLocation="detailsModal"
          />
        </tr>
        <tr
          class="bg-[#F6FAFD]"
          v-else-if="
            plan.type === 'Travel Medical' &&
            section.header === 'Pre-Existing Conditions'
          "
          v-for="preExCoverage in medicalSpecificSection"
          :key="`${preExCoverage.key}-${plan.code}`"
        >
          <td class="font-bold text-[#878787] uppercase text-xs snap-center">
            {{ preExCoverage.label }}
          </td>
          <CoverageTableRows
            :plan-code="plan.code"
            :coverage="preExCoverage"
            optionLocation="detailsModal"
          />
        </tr>
        <tr
          class="bg-[#F6FAFD]"
          v-else-if="section.coverages.length > 0"
          v-for="coverage in section.coverages"
          :key="coverage.key"
        >
          <td class="text-xs flex justify-between snap-center">
            <span class="font-bold text-[#878787] uppercase pr-1"
              >{{ coverage.label }}
            </span>
            <CoverageLabelToolTip :tool-tip-text="coverage.toolTipText" />
          </td>
          <CoverageTableRows
            :plan-code="plan.code"
            :coverage="coverage"
            optionLocation="detailsModal"
          />
        </tr>
        <tr
          class="bg-[#F6FAFD]"
          v-else-if="section.header === 'Optional Coverages'"
        >
          <td
            class="font-bold text-[#878787] uppercase text-xs snap-center"
          ></td>
          <td class="font-bold text-xs snap-center">
            <AdditionalOptions
              :plan-code="plan.code"
              option-location="detailsModal"
            />
          </td>
        </tr>
        <tr
          class="bg-[#F6FAFD]"
          v-else-if="section.header === 'Included Benefits' && !isModeAnnual"
        >
          <td
            class="font-bold text-[#878787] uppercase text-xs snap-center"
          ></td>
          <IncludedBenefitsTableRows :plan-code="plan.code" />
        </tr>
      </tbody>
    </template>
  </table>
</template>
<style lang="scss">
  .daisy-table {
    border-collapse: separate;
    border-spacing: 0 0.5em;
  }
</style>
