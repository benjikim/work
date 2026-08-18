<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { event } from 'vue-gtag';
  import { ChevronDownIcon } from '@heroicons/vue/24/solid';
  import { ChevronUpIcon } from '@heroicons/vue/24/solid';
  import { InformationCircleIcon } from '@heroicons/vue/24/outline';
  import { useContentStore } from '@/store/content';
  import { useApiStore } from '@/store/api';
  import { useUserSessionStore } from '@/store/userSession';
  import { getNumberOfPlans } from '@/utility/index.ts';
  import BaseCheckBox from '@/components/base/BaseCheckBox.vue';
  import { GAObject } from '@/types';

  const contentStore = useContentStore();
  const sessionStore = useUserSessionStore();
  const apiStore = useApiStore();

  const props = defineProps({
    filterKey: {
      type: String,
      required: true,
    },
    displayType: {
      type: String,
      required: true,
    },
  });

  const hide = ref(true);
  const loading = ref(false);
  const isFilterOneOfOtherCoverages = props.filterKey === 'otherCoverages';
  const isMobile = computed(() => sessionStore.isMobileView);

  const filterData = computed(() =>
    contentStore.getFilterData(props.filterKey)
  );

  const orderedCoveredActivities = computed(() => {
    if (props.filterKey === 'coveredActivities') {
      const selectedActivities = sessionStore.orderedCoveredActivities;
      const allActivities = filterData.value.checkBoxLabels.slice(0, 10);

      // Map selected activity keys back to their labels based on the full label list
      const selectedActivityLabels = selectedActivities.map(filterKey => {
        const index = Number(filterKey.split('-').pop());
        return filterData.value.checkBoxLabels[index];
      });

      const unselectedActivitiesLabels = allActivities.filter(
        (activity) => !selectedActivityLabels.includes(activity)
      );

      return [...selectedActivityLabels, ...unselectedActivitiesLabels];
    }
    return filterData.value.checkBoxLabels;
  });

  const defaultOpenFilters = [
    'medical',
    'emergencyMedicalEvacuation',
    'tripProtection',
    'travelDelay',
    'tripInterruption',
    'baggage',
    'otherCoverages',
    'coveredActivities'
  ];

  if (defaultOpenFilters.includes(props.filterKey)) {
    hide.value = false;
  }

  const openCoveredActivitiesModal = () => {
    sessionStore.setCoveredActivitiesModalOpen(true);
  }

  const hasExpandableContent = computed(() => {
    const data = filterData.value;
    if (!data) {
      return false;
    }

    return (data.checkBoxLabels?.length || 0) > 0;
  });

  /**
   * Sets tooltip id in session store.
   */
  const handleClick = () => {
    sessionStore.setFilterToolTipId(props.filterKey);
    sessionStore.setFilterToolTipModalPlanShow(false);
    sessionStore.setFilterToolTipModalOpen(true);
    // Removing any existing highlighted coverage information.
    contentStore.removeHighlightedCoverageInformation();
    
    // Fire Event For ToolTip
    event('filter_tool_tip', {
      hierarchical_layer_1: 'Filter Tool Tip Selected',
      hierarchical_layer_2: props.filterKey,
    } as GAObject);
  };

  /**
   * Toggles the accordion state.
   */
  const handleAccordion = () => {
    hide.value = !hide.value;
  };

  const filterIncludedHandler = (e: InputEvent, filterKey: string) => {
    const target = e.target as HTMLInputElement;
    const checked = target.checked;

    // Added CFAR logic here since modifying the store in a computed
    // property causes multiple execution.
    const cfarFilters = apiStore.getFilters['tripProtection-1'];
    const rentalCarFilters = apiStore.getFilters['otherCoverages-0'];

    

    const searchAndRescueFilters =
      apiStore.getFilters['otherCoverages-2'] || [];
    const hospitalOfChoiceFilters =
      apiStore.getFilters['otherCoverages-3'] || [];

    if (checked) {
      sessionStore.addFilter(filterKey);
    } else {
      sessionStore.removeFilter(filterKey);
      if (props.filterKey === 'coveredActivities') {
        sessionStore.reorderCoveredActivities(filterKey, 'remove');
      }
    }

    // We have a default filter selected to display all medical and emergency evac plans - remove it when a filter is selected
    const selectedFilters = sessionStore.getSelectedFilters;
    const filtersToCheck = ['medical-1', 'medical-2', 'medical-3', 'emergencyMedicalEvacuation-1', 'emergencyMedicalEvacuation-2', 'emergencyMedicalEvacuation-3'];

    if (filtersToCheck.some(filter => selectedFilters.includes(filter))) {
      sessionStore.removeFilter('medical-0');
      sessionStore.removeFilter('emergencyMedicalEvacuation-0');
    }

    if (!selectedFilters.includes('medical-0')){
      sessionStore.addFilter('medical-0');
    }
    
    if (!selectedFilters.includes('emergencyMedicalEvacuation-0')) {
      sessionStore.addFilter('emergencyMedicalEvacuation-0');
    }

    // Display CFAR details modal when filter is selected
    if (checked && sessionStore.getSelectedFilters.includes('tripProtection-1')) {
      sessionStore.setCfarDetailsModal(true);
    }

    // Adding loading to prevent multiple execution when selecting cfar.
    if (sessionStore.getSelectedFilters.includes('tripProtection-1') && loading.value === false) {
      loading.value = true;
      sessionStore.setPlanCFAR(Array.from(cfarFilters), checked);
      loading.value = false;
    }

    const filterIndex = Number(filterKey.split('-').pop());
    const filterLabel = filterData.value.checkBoxLabels[filterIndex];

    if (
      isFilterOneOfOtherCoverages &&
      filterIndex === 0 &&
      loading.value === false
    ) {
      loading.value = true;
      sessionStore.setPlanRentalCar(Array.from(rentalCarFilters), checked);
      loading.value = false;
    }

    if (
      isFilterOneOfOtherCoverages &&
      filterIndex === 2 &&
      loading.value === false
    ) {
      loading.value = true;
      sessionStore.setPlanSearchAndRescue(
        Array.from(searchAndRescueFilters),
        checked
      );
      loading.value = false;
    }

    if (
      isFilterOneOfOtherCoverages &&
      filterIndex === 3 &&
      loading.value === false
    ) {
      loading.value = true;
      sessionStore.setPlanHospitalOfChoice(
        Array.from(hospitalOfChoiceFilters),
        checked
      );
      loading.value = false;
    }

    event('filter_handle', {
      hierarchical_layer_1: `Filter Handle Selected ${filterKey}`,
      hierarchical_layer_2: `${filterKey} ${filterLabel}`,
    } as GAObject);
  };
</script>

<template>
  <div
    :class="`pb-5 grid transition-[grid-template-rows] duration-500 ease-in-out overflow-hidden ${hide ? 'grid-rows-[min-content_0fr]' : 'grid-rows-[min-content_1fr]'}`"
     v-if="
          props.filterKey === 'medical' ||
          props.filterKey === 'emergencyMedicalEvacuation' ||
          props.filterKey === 'tripProtection' ||
          props.filterKey === 'travelDelay' ||
          props.filterKey === 'tripInterruption' ||
          props.filterKey === 'baggage' ||
          props.filterKey === 'otherCoverages' ||
          props.filterKey === 'coveredActivities'
        "
  >
    <div class="flex justify-between border-b-2 border-[#A7A7A7] pb-2">
      <div
        class="flex"
        :class="[
          hasExpandableContent
            ? 'cursor-pointer daisy-tooltip daisy-tooltip-right'
            : 'cursor-default opacity-50',
        ]"
        :data-tip="hasExpandableContent ? 'Click to expand' : null"
        @click="hasExpandableContent ? handleAccordion() : undefined"
      >
        <ChevronUpIcon
          v-if="hide"
          class="size-6 stroke-action-primary"
        />
        <ChevronDownIcon v-else class="size-6 stroke-action-primary" />
        <p class="pl-2 text-base font-bold tracking-wide text-[#212629]">
          {{ filterData?.label }}
        </p>
      </div>
      <button @click="handleClick" aria-label="coverage-info" class="text-action-primary">
        <InformationCircleIcon
          :class="[
            'size-5',
          ]"
        />
      </button>
    </div>
    <div :class="`mt-2 overflow-hidden`">
      <!-- Here is where we conditionally render coverage filters. -->

      <div
        v-if="
          props.filterKey === 'medical' ||
          props.filterKey === 'emergencyMedicalEvacuation' ||
          props.filterKey === 'tripProtection' ||
          props.filterKey === 'travelDelay' ||
          props.filterKey === 'tripInterruption' ||
          props.filterKey === 'baggage' ||
          props.filterKey === 'otherCoverages' ||
          (isMobile && props.filterKey === 'coveredActivities')
        "
      >
        <BaseCheckBox
          v-for="(label, index) in filterData.checkBoxLabels"
          :key="`${label}-${index}`"
          :id="`${props.filterKey}-${index}`"
          :name="`${props.filterKey}`"
          :render-label-html="true"
          @input="filterIncludedHandler($event, `${props.filterKey}-${index}`)"
          :label="`${filterData.checkBoxLabels[index]} <span class='text-xs'>${getNumberOfPlans(`${props.filterKey}-${index}`)}</span>`"
          :checked="
            sessionStore.getSelectedFilters.includes(
              `${props.filterKey}-${index}`
            )
          "
          :disabled="
            loading ||
            getNumberOfPlans(`${props.filterKey}-${index}`) === '0 plans'
          "
          :class="[
            'pb-2',
            `${props.filterKey}-${index}` === 'medical-0' || `${props.filterKey}-${index}` === 'emergencyMedicalEvacuation-0' ? 'display-none' : ''
          ]"
          :required="false"
        />
        </div>
        <div
          v-if="
            props.filterKey === 'coveredActivities' && !isMobile
          "
        >
          <BaseCheckBox
            v-for="(label, index) in orderedCoveredActivities"
            :key="`coveredActivities-${filterData.checkBoxLabels.indexOf(label)}-${index}`"
            :id="`${props.filterKey}-${filterData.checkBoxLabels.indexOf(label)}`"
            :name="`${props.filterKey}`"
            :render-label-html="true"
            @input="filterIncludedHandler($event, `${props.filterKey}-${filterData.checkBoxLabels.indexOf(label)}`)"
            :label="`${label} <span class='text-xs'>${getNumberOfPlans(`${props.filterKey}-${filterData.checkBoxLabels.indexOf(label)}`)}</span>`"
            :checked="
              sessionStore.getSelectedFilters.includes(
                `${props.filterKey}-${filterData.checkBoxLabels.indexOf(label)}`
              )
            "
            :disabled="
              loading ||
              getNumberOfPlans(`${props.filterKey}-${filterData.checkBoxLabels.indexOf(label)}`) === '0 plans'
            "
            :class="'pb-2'"
            :required="false"
          />
          
        <button v-if="!isMobile" @click="openCoveredActivitiesModal" class="text-sm text-action-primary font-bold mt-2">
          See Full Activity List
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
