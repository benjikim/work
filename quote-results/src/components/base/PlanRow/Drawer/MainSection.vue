<script setup lang="ts">
  import { QuoteResult } from '@/types';
  import { computed, PropType, onMounted } from 'vue';
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';
  import AdditionalOptions from '@/components/options/AdditionalOptions.vue';
  import IncludedBenefitsTableRows from '@/components/base/Compare/IncludedBenefitsTableRows.vue';
  import CoverageLabelToolTip from '@/components/shared/CoverageLabelToolTip.vue';
  import BaseCoverageMarker from '@/components/base/PlanRow/BaseCoverageMarker.vue';
  import UtilityHTMLRenderer from '@/components/utility/UtilityHTMLRenderer.vue';
  import CoveredActivitiesTableRow from '@/components/shared/CoveredActivitiesTableRow.vue';
  import AccordionHeader from '@/components/base/PlanRow/Drawer/AccordionHeader.vue';
  import AccordionContentValues from '@/components/base/PlanRow/Drawer/AccordionContentValues.vue';

  const contentStore = useContentStore();
  const userSessionStore = useUserSessionStore();
  const props = defineProps({
    plan: {
      type: Object as PropType<QuoteResult>,
      required: false,
    },
  });

  const coverageLimitMap = computed(() => {
    // Ben wants the table order to be:
    // 1. Medical
    // 2. Trip Protection
    // 3. Pre-Existing Conditions
    // 4. Evacuation
    // 5. Accidental Death
    // 6. Optional Coverages
    // 7. Included Benefits
    // 8. Covered Activities
    // 9. Description
    // 10. Plan Info
    return contentStore.getPlanDetailsCoverageLimitMap;
  });

  const evacuationSpecificSection = contentStore.getEvacuationSpecificMap;

  const medicalSpecificSection = contentStore.getMedicalSpecificMap;

  const planDescription = computed(() => {
    if (props.plan && props.plan.code) {
      return contentStore.getPlanDescription(props.plan.code);
    }
  });

  // Initialize Medical and Trip Protection as open by default
  onMounted(() => {
    if (props.plan && props.plan.code) {
      const sectionHeaders = coverageLimitMap.value.map(
        (section) => section.header
      );
      userSessionStore.initializeSectionStates(sectionHeaders, props.plan.code);
    }
  });

  const isSecondary = (plan: QuoteResult, coverageKey: string) => {
    // check if any coverages are secondary for current plan
    return plan.coverages.find((c) => c.id === coverageKey)?.secondary ?? false;
  };

  const isSectionOpen = userSessionStore.isSectionOpen;

  const hasSectionContent = (section: { header: string; coverages: { key: string }[] }) => {
    if (!props.plan) return false;

    if (section.header === 'Optional Coverages') {
      const optionKeys = Object.keys(
        userSessionStore.getOptionsOfSelectedPlan(props.plan.code) || {}
      ).filter(
        (option) =>
          ![
            'medical',
            'deductible',
            'vacationRentalDamage',
            'cancelForAnyReason',
            'accidentalDeath24Hour',
            'accidentalDeathCommonCarrier',
            'accidentalDeathFlight',
            'interruptionForAnyReason',
          ].includes(option)
      );

      return optionKeys.length > 0;
    }

    if (section.header === 'Included Benefits') {
      return (props.plan.includedBenefits?.length || 0) > 0;
    }

    if (section.header === 'Covered Activities') {
      return (props.plan.coveredActivities?.length || 0) > 0;
    }

    if (section.header === 'Description') {
      return !!planDescription.value;
    }

    if (
      props.plan.type === 'Evacuation' &&
      section.header === 'Evacuation'
    ) {
      return evacuationSpecificSection.length > 0;
    }

    if (
      props.plan.type === 'Travel Medical' &&
      section.header === 'Pre-Existing Conditions'
    ) {
      return medicalSpecificSection.length > 0;
    }

    return section.coverages.length > 0;
  };
</script>
<template>
  <div class="px-3">
    <template
      v-if="plan"
      v-for="section in coverageLimitMap"
      :key="section.header"
    >
      <div
        class="grid transition-[grid-template-rows] duration-300 ease-in-out mb-4"
        :class="[
          isSectionOpen(section.header, plan.code)
            ? 'grid-rows-[min-content_1fr]'
            : 'grid-rows-[min-content_0fr]',
          section.header === 'Plan Info' ? 'block md:display-none' : '',
        ]"
      >
        <AccordionHeader
          :plan="plan"
          :section="section"
          :has-content="hasSectionContent(section)"
        />
        <!-- Accordion Content -->
        <Transition
          enter-active-class="transition-opacity duration-200 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div class="min-h-0" v-if="isSectionOpen(section.header, plan.code)">
            <table class="daisy-table w-full border-collapse table-fixed">
              <colgroup
                v-if="
                  ![
                    'Included Benefits',
                    'Description',
                    'Covered Activities',
                    'Optional Coverages',
                  ].includes(section.header)
                "
              >
                <col class="w-2/5" />
                <col class="w-3/5" />
              </colgroup>
              <tbody>
                <tr
                  v-if="
                    plan.type === 'Evacuation' &&
                    section.header === 'Evacuation'
                  "
                  v-for="evacCoverage in evacuationSpecificSection"
                  :key="`${evacCoverage.key}-${plan.code}`"
                  class="border-b border-[#EFF2F5]"
                >
                  <td class="font-normal text-[#878787] text-xs align-top pr-4">
                    {{ evacCoverage.label }}
                  </td>
                  <AccordionContentValues
                    :plan-code="plan.code"
                    :coverage="evacCoverage"
                    optionLocation="planRowDetails"
                  />
                </tr>
                <tr
                  v-else-if="
                    plan.type === 'Travel Medical' &&
                    section.header === 'Pre-Existing Conditions'
                  "
                  v-for="preExCoverage in medicalSpecificSection"
                  :key="`${preExCoverage.key}-${plan.code}`"
                  class="border-b border-[#EFF2F5]"
                >
                  <td
                    class="font-normal text-[#878787] uppercase text-xs align-top pr-4"
                  >
                    {{ preExCoverage.label }}
                  </td>
                  <AccordionContentValues
                    :plan-code="plan.code"
                    :coverage="preExCoverage"
                    optionLocation="planRowDetails"
                  />
                </tr>
                <tr
                  v-else-if="section.coverages.length > 0"
                  v-for="coverage in section.coverages"
                  :key="coverage.key"
                  class="border-b border-[#EFF2F5]"
                >
                  <td
                    v-if="coverage.key !== 'certificate'"
                    class="text-xs align-top pr-4"
                  >
                    <div class="flex items-center flex-nowrap">
                      <CoverageLabelToolTip
                        :tool-tip-text="coverage.toolTipText"
                        :mobile-modal-heading="coverage.label"
                        tool-tip-position="right"
                        underline-label
                      >
                        <span class="font-normal text-[#878787] uppercase">
                          {{ coverage.label }}
                        </span>
                      </CoverageLabelToolTip>
                      <div
                        v-if="isSecondary(plan, coverage.key)"
                        class="ml-1 flex flex-col items-center flex-shrink-0"
                      >
                        <BaseCoverageMarker marker-type="Secondary" />
                      </div>
                    </div>
                  </td>
                  <AccordionContentValues
                    :plan-code="plan.code"
                    :coverage="coverage"
                    optionLocation="planRowDetails"
                  />
                </tr>
                <tr v-else-if="section.header === 'Optional Coverages'">
                  <td class="font-normal text-xs">
                    <AdditionalOptions
                      :plan-code="plan.code"
                      option-location="planRowDetails"
                    />
                  </td>
                </tr>
                <tr v-else-if="section.header === 'Included Benefits'">
                  <IncludedBenefitsTableRows :plan-code="plan.code" />
                </tr>
                <tr v-else-if="section.header === 'Description'">
                  <UtilityHTMLRenderer
                    is="p"
                    class="utility-html-renderer p-5 font-normal text-xs md:text-sm"
                    v-if="plan?.code"
                    :content="planDescription"
                  ></UtilityHTMLRenderer>
                </tr>
                <tr v-else-if="section.header === 'Covered Activities'">
                  <td class="font-normal text-xs md:text-sm">
                    <CoveredActivitiesTableRow
                      :plan-code="plan.code"
                      :covered-activities-array="plan.coveredActivities"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Transition>
      </div>
    </template>
  </div>
</template>
<style lang="scss">
  .daisy-table {
    border-collapse: separate;
    border-spacing: 0 0.5em;
  }
</style>
