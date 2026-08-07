<script setup lang="ts">
import { computed } from 'vue';
import BaseCheckBox from '@/components/base/BaseCheckBox.vue';
import { useUserSessionStore } from '@/store/userSession';
import { useContentStore } from '@/store/content';
import { GAObject } from '@/types';
import { event } from 'vue-gtag';
import { getNumberOfPlans } from '@/utility/index.ts';


const sessionStore = useUserSessionStore();
const contentStore = useContentStore();
const filterData = computed(() =>
  contentStore.getFilterData('coveredActivities')
);

const slicedCoveredActivities = computed(() =>
  filterData.value.checkBoxLabels
    .map((label, index) => ({ label, index }))
    .sort((coverage_one, coverage_two) => coverage_one.label.localeCompare(coverage_two.label))
);

const filterIncludedHandler = (e: InputEvent, filterKey: string) => {
  const target = e.target as HTMLInputElement;
  const checked = target.checked;

  if (checked) {
    sessionStore.addFilter(filterKey);
    sessionStore.reorderCoveredActivities(filterKey, 'add');
  } else {
    sessionStore.removeFilter(filterKey);
    sessionStore.reorderCoveredActivities(filterKey, 'remove');
  }

  const filterIndex = Number(filterKey.split('-').pop());
  const filterLabel = filterData.value.checkBoxLabels[filterIndex];

  event('filter_handle', {
    hierarchical_layer_1: `Filter Handle Selected ${filterKey}`,
    hierarchical_layer_2: `${filterKey} ${filterLabel}`,
  } as GAObject);
};


const closeModal = () => {
sessionStore.setCoveredActivitiesModalOpen(false);
};
</script>

<template>
  <dialog class="daisy-modal daisy-modal-open z-[998]" @close="closeModal()">
    <div
      class="daisy-modal-box p-4 rounded-none overflow-hidden shadow-black flex flex-col items-center"
    >
      <h2 class="text-md font-semibold mb-5 mt-2 text-center">Filter By Covered Activities</h2>
      <div class="h-[300px] w-full overflow-y-auto p-2 border-[1px] border-[#D4DADC]">
        <BaseCheckBox
          v-for="(item) in slicedCoveredActivities"
          :key="`coveredActivities-${item.index}`"
          :id="`coveredActivities-${item.index}`"
          :name="'coveredActivities'"
          :label="`${item.label} <span class='text-xs'>${getNumberOfPlans(`coveredActivities-${item.index}`)}</span>`"
          :checked="sessionStore.getSelectedFilters.includes(`coveredActivities-${item.index}`)"
          @input="filterIncludedHandler($event, `coveredActivities-${item.index}`)"
          :required="false"
          :render-label-html="true"
          :disabled="getNumberOfPlans(`coveredActivities-${item.index}`) === '0 plans'"
          class="pb-1"
        />
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