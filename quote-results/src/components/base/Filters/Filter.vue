<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { event } from 'vue-gtag';
  import { ChevronDownIcon } from '@heroicons/vue/24/solid';
  import { ChevronUpIcon } from '@heroicons/vue/24/solid';
  import { InformationCircleIcon } from '@heroicons/vue/24/outline';
  import { useContentStore } from '@/store/content';
  import { useApiStore } from '@/store/api';
  import { useUserSessionStore } from '@/store/userSession';
  import { intersect } from '@/utility/index.ts';
  import BaseCheckBox from '@/components/base/BaseCheckBox.vue';
  import BaseRadio from '@/components/base/BaseRadio.vue';
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
    availablePlans: {
      type: Number,
      required: true,
    },
  });

  const hide = ref(true);
  const loading = ref(false);
  const isFilterCFAR = props.filterKey === 'cancelForAnyReasonOption';
  const isFilterOneOfOtherCoverages = props.filterKey === 'otherCoverages';

  const filterData = computed(() =>
    contentStore.getFilterData(props.filterKey)
  );

  const defaultOpenFilters = [
    'medical',
    'emergencyMedicalEvacuation',
    'tripCancellation',
    'cancelForAnyReasonOption',
    'preExWaiver',
  ];

  if (defaultOpenFilters.includes(props.filterKey)) {
    hide.value = false;
  }

  /**
   * Sets tooltip id in session store.
   */
  const handleClick = () => {
    sessionStore.setFilterToolTipId(props.filterKey);
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
    const cfarFilters = apiStore.getFilters['cancelForAnyReasonOption-0'];
    const rentalCarFilters = apiStore.getFilters['otherCoverages-0'];

    if (checked) {
      sessionStore.addFilter(filterKey);
    } else {
      sessionStore.removeFilter(filterKey);
    }

    // Display CFAR details modal when filter is selected
    if (checked && isFilterCFAR) {
      sessionStore.setCfarDetailsModal(true);
    }

    // Adding loading to prevent multiple execution.
    if (isFilterCFAR && loading.value === false) {
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

    event('filter_handle', {
      hierarchical_layer_1: `Filter Handle Selected ${filterKey}`,
      hierarchical_layer_2: `${filterKey} ${filterLabel}`,
    } as GAObject);
  };

  const filterRadioHandler = (index: number) => {
    const filterKey = `${props.filterKey}-${index}`;
    const userFilters = sessionStore.getSelectedFilters;

    if (userFilters.includes(filterKey)) {
      return;
    }

    for (let i = 0; i < filterData.value.radioButtonLabels.length; i++) {
      sessionStore.removeFilter(`${props.filterKey}-${i}`);
    }

    sessionStore.addFilter(filterKey);

    // If filter is now selected, we can fire this event
    const filterLabel = filterData.value.radioButtonLabels[index];
    event('filter_handle', {
      hierarchical_layer_1: `Filter Handle Selected ${filterKey}`,
      hierarchical_layer_2: `${filterKey} ${filterLabel}`,
    } as GAObject);
  };

  const getNumberOfPlans = (filterKey: string) => {
    let selectedFilters = [...sessionStore.getSelectedFilters];
    const productFilters = apiStore.getFilters;

    // Things might be loading still so just we shouldn't display yet.
    if (Object.keys(productFilters).length === 0) {
      return '';
    }

    // If plan is selected we do not show.
    if (selectedFilters.includes(filterKey)) {
      return '';
    }

    // If default filters are selected, show filter amount form store.
    if (sessionStore.areSelectedFiltersDefault) {
      return `${productFilters[filterKey]?.size} plans`;
    }

    const radioMedicalIndex = selectedFilters.findIndex((filter: string) => {
      const splitFilter = filter.split('-');
      return (
        splitFilter.length === 2 &&
        splitFilter[0] === 'medical' &&
        splitFilter[1] !== '0' &&
        splitFilter[1] !== 'primary'
      );
    });

    // Remove any medical-[0...5] selected since these are radio buttons.
    if (
      radioMedicalIndex !== -1 &&
      filterKey.split('-')[0] === 'medical' &&
      filterKey.split('-')[1] !== 'primary'
    ) {
      selectedFilters.splice(radioMedicalIndex, 1);
    }

    const radioMedicalEvacuationIndex = selectedFilters.findIndex(
      (filter: string) => {
        const splitFilter = filter.split('-');
        return (
          splitFilter.length === 2 &&
          splitFilter[0] === 'emergencyMedicalEvacuation' &&
          splitFilter[1] !== '0' &&
          splitFilter[1] !== 'primary'
        );
      }
    );
    // Remove any emergencyMedicalEvacuation-[0...5] selected since these are radio buttons.
    if (
      radioMedicalEvacuationIndex !== -1 &&
      filterKey.split('-')[0] === 'emergencyMedicalEvacuation' &&
      filterKey.split('-')[1] !== 'primary'
    ) {
      selectedFilters.splice(radioMedicalEvacuationIndex, 1);
    }

    // Removing any provider keys if current key is provider
    // since they can be multi selected.
    if (filterKey.split('-')[0] === 'provider') {
      selectedFilters = selectedFilters.filter((filterKey) => {
        const splitFilter = filterKey.split('-');
        if (splitFilter[0] !== 'provider') {
          return filterKey;
        }
      });
    }

    const providerFiltersArr = [] as string[][];

    selectedFilters.push(filterKey);

    let arr = [] as string[][];

    selectedFilters.forEach((filter: string) => {
      // Join all provider filter into one since these can be multi selected
      if (filter.split('-')[0] === 'provider') {
        providerFiltersArr.push(Array.from(productFilters[filter]));
        return;
      }

      if (filter in productFilters) {
        arr.push(Array.from(productFilters[filter]));
      }
    });

    if (providerFiltersArr.length > 0) {
      arr.push(providerFiltersArr.reduce((acc, val) => acc.concat(val), []));
    }

    // This loops through the array and
    // gets the intersection between them.
    let setFilters = arr[0];
    while (arr.length > 1) {
      const lastSet = arr.pop() as string[];
      setFilters = intersect(setFilters, lastSet);
    }

    return `${setFilters.length} plans`;
  };

  const arePlansFullyLoaded = computed(
    () => apiStore.getPlansFullyLoadedStatus
  );
</script>

<template>
  <div
    :class="`pb-5 grid transition-[grid-template-rows] duration-500 ease-in-out overflow-hidden ${hide ? 'grid-rows-[min-content_0fr]' : 'grid-rows-[min-content_1fr]'}`"
  >
    <div
      class="flex justify-between border-b-2 border-[#A7A7A7] pb-2"
      :data-cy="props.filterKey"
    >
      <div class="flex" @click="handleAccordion">
        <ChevronUpIcon
          v-if="hide"
          class="size-6 stroke-action-primary cursor-pointer"
        />
        <ChevronDownIcon
          v-else
          class="size-6 stroke-action-primary cursor-pointer"
        />
        <p class="pl-2 text-base font-bold tracking-wide text-[#212629]">
          {{ filterData?.label }}
        </p>
      </div>
      <button @click="handleClick" aria-label="coverage-info">
        <InformationCircleIcon :class="['size-5', 'stroke-action-primary']" />
      </button>
    </div>
    <div :class="`mt-2 overflow-hidden`">
      <!-- Here is where we conditionally render coverage filters. -->

      <div
        v-if="
          props.filterKey === 'tripCancellation' ||
          props.filterKey === 'tripInterruption' ||
          props.filterKey === 'cancelForAnyReasonOption' ||
          props.filterKey === 'preExWaiver' ||
          props.filterKey === 'baggage' ||
          props.filterKey === 'baggageDelay' ||
          props.filterKey === 'travelDelay' ||
          props.filterKey === 'provider' ||
          props.filterKey === 'accidentalDeath24Hour' ||
          props.filterKey === 'otherCoverages'
        "
      >
        <BaseCheckBox
          v-if="arePlansFullyLoaded"
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
            props.filterKey === 'cancelForAnyReasonOption' &&
            apiStore.getITP === null
              ? 'display-none'
              : 'pl-1 text-sm',
            'pb-2',
          ]"
          :required="false"
        />
        <span
          v-else
          class="w-full bg-imt-grey h-8 rounded-md animate-pulse inline-block"
        ></span>
        <p
          v-if="
            props.filterKey === 'cancelForAnyReasonOption' &&
            apiStore.getITP === null
          "
          class="font-bold text-sm"
        >
          To view plans with this coverage option, enter your Trip Cost and
          First Payment Date
        </p>
      </div>
      <div v-else-if="props.filterKey === 'medical'">
        <BaseRadio
          v-if="arePlansFullyLoaded"
          v-for="(label, index) in filterData.radioButtonLabels"
          :key="`${label}-${index}`"
          :id="`${props.filterKey}-${index}`"
          class="py-1 text-sm"
          :disabled="
            loading ||
            getNumberOfPlans(`${props.filterKey}-${index}`) === '0 plans'
          "
          :name="`${props.filterKey}-${displayType}`"
          :render-label-html="true"
          @input="filterRadioHandler(index)"
          :label="`${label} <span class='text-xs'>${getNumberOfPlans(`${props.filterKey}-${index}`)}</span>`"
          :checked="
            sessionStore.getSelectedFilters.includes(
              `${props.filterKey}-${index}`
            )
          "
          :required="false"
        />
        <span
          v-else
          class="w-full bg-imt-grey h-8 rounded-md animate-pulse inline-block"
        ></span>
        <div class="border-b-2 border-[#A7A7A7] my-1"></div>
        <BaseCheckBox
          v-if="arePlansFullyLoaded"
          :id="props.filterKey"
          class="pl-1 py-1 text-sm"
          :disabled="
            loading ||
            getNumberOfPlans(`${props.filterKey}-primary`) === '0 plans'
          "
          :name="props.filterKey"
          :render-label-html="true"
          @input="filterIncludedHandler($event, `${props.filterKey}-primary`)"
          :label="`${filterData.checkBoxLabels[0]} <span class='text-xs'>${getNumberOfPlans(`${props.filterKey}-primary`)}</span>`"
          :checked="
            sessionStore.getSelectedFilters.includes(
              `${props.filterKey}-primary`
            )
          "
          :required="false"
        />
        <span
          v-else
          class="w-full bg-imt-grey h-8 rounded-md animate-pulse inline-block"
        ></span>
      </div>
      <div v-else-if="props.filterKey === 'emergencyMedicalEvacuation'">
        <BaseRadio
          v-if="arePlansFullyLoaded"
          v-for="(label, index) in filterData.radioButtonLabels"
          :key="`${label}-${index}`"
          :id="`${props.filterKey}-${index}`"
          class="py-1 text-sm"
          :disabled="
            loading ||
            getNumberOfPlans(`${props.filterKey}-${index}`) === '0 plans'
          "
          :name="`${props.filterKey}-${displayType}`"
          :render-label-html="true"
          @input="filterRadioHandler(index)"
          :label="`${label} <span class='text-xs'>${getNumberOfPlans(`${props.filterKey}-${index}`)}</span>`"
          :checked="
            sessionStore.getSelectedFilters.includes(
              `${props.filterKey}-${index}`
            )
          "
          :required="false"
        />
        <span
          v-else
          class="w-full bg-imt-grey h-8 rounded-md animate-pulse inline-block"
        ></span>
        <div class="border-b-2 border-[#A7A7A7] my-1"></div>
        <BaseCheckBox
          v-if="arePlansFullyLoaded"
          :id="props.filterKey"
          class="pl-1 py-1 text-sm"
          :disabled="
            loading ||
            getNumberOfPlans(`${props.filterKey}-primary`) === '0 plans'
          "
          :name="props.filterKey"
          :render-label-html="true"
          @click="filterIncludedHandler($event, `${props.filterKey}-primary`)"
          :label="`${filterData.checkBoxLabels[0]} <span class='text-xs'>${getNumberOfPlans(`${props.filterKey}-primary`)}</span>`"
          :checked="
            sessionStore.getSelectedFilters.includes(
              `${props.filterKey}-primary`
            )
          "
          :required="false"
        />
        <span
          v-else
          class="w-full bg-imt-grey h-8 rounded-md animate-pulse inline-block"
        ></span>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
