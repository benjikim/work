<script setup lang="ts">
  import { computed } from 'vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { QuoteResult } from '@/types';
  import { PropType } from 'vue';
  import { ChevronUpIcon } from '@heroicons/vue/24/solid';

  const userSessionStore = useUserSessionStore();

  const props = defineProps({
    plan: {
      type: Object as PropType<QuoteResult>,
      required: true,
    },
    section: {
      type: Object as PropType<{
        header: string;
        coverages: {
          key: string;
          label: string;
          toolTipText: string;
        }[];
      }>,
      required: true,
    },
  });

  const toggleSection = (header: string) => {
    if (props.plan.code) {
      userSessionStore.toggleSection(header, props.plan.code);
    }
  };

  const numberOfOptionalCoverages = computed(() => {
    if (props.plan?.code) {
      const optionalCoverages = Object.keys(
        userSessionStore.getOptionsOfSelectedPlan(props.plan?.code)
      ).filter(
        (option) =>
          // These are the optional coverages that are displayed in other sections
          // To ensure we are only counting the options in this section, I am filtering them out.
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
      return optionalCoverages.length;
    }
    return 0;
  });
</script>

<template>
  <!-- Accordion Header -->
  <div
    class="flex items-center justify-between border-b border-[#A7A7A7] pb-2 mb-2 cursor-pointer select-none"
    @click="toggleSection(section.header)"
  >
    <div
      class="flex items-center gap-2"
      :id="`plan-row-details-accordion-header-${section.header.toLocaleLowerCase().split(' ').join('_')}-${plan.code}`"
      :data-cy="`plan-row-details-accordion-header-${section.header.toLocaleLowerCase().split(' ').join('_')}-${plan.code}`"
    >
      <ChevronUpIcon
        class="size-5 text-black cursor-pointer transition-transform duration-200 ease-in-out"
        :class="{
          'rotate-180': userSessionStore.isSectionOpen(
            section.header,
            plan.code
          ),
        }"
      />
      <p
        :class="`tr_${section.header.toLocaleLowerCase().split(' ').join('_')} text-xs md:text-sm text-imt-black`"
      >
        {{ section.header }}
      </p>
    </div>

    <span
      v-if="
        userSessionStore.isSectionOpen(section.header, plan.code) &&
        ![
          'Covered Activities',
          'Description',
          'Included Benefits',
          'Optional Coverages',
        ].includes(section.header)
      "
      key="coverage-limits"
      class="text-xs md:text-sm text-[#999999] uppercase mr-2 inline-block"
      >Coverage Limits Below are per person</span
    >
    <span
      v-else-if="
        userSessionStore.isSectionOpen(section.header, plan.code) &&
        section.header === 'Covered Activities'
      "
      key="covered-activities"
      class="text-xs md:text-sm text-[#999999] uppercase mr-2 inline-block"
      >{{ plan?.coveredActivities?.length }} Covered Activities</span
    >
    <span
      v-else-if="
        userSessionStore.isSectionOpen(section.header, plan.code) &&
        section.header === 'Included Benefits'
      "
      key="included-benefits"
      class="text-xs md:text-sm text-[#999999] uppercase mr-2 inline-block"
      >{{ plan?.includedBenefits?.length }} Included</span
    >
    <span
      v-else-if="
        userSessionStore.isSectionOpen(section.header, plan.code) &&
        section.header === 'Optional Coverages'
      "
      key="optional-coverages"
      class="text-xs md:text-sm text-[#999999] uppercase mr-2 inline-block"
      >{{ numberOfOptionalCoverages }} Available</span
    >
  </div>
</template>
