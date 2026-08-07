<script setup lang="ts">
  import { computed } from 'vue';
  import { ChevronDownIcon } from '@heroicons/vue/24/solid';
  import { useUserSessionStore } from '@/store/userSession';

  const userSession = useUserSessionStore();

  const openMobileFilter = () => {
    userSession.setMobileFilterModalOpen(true);
  };

  const numberOfFilterPlans = computed(() => userSession.getFilteredPlansCount);
</script>

<template>
  <div>
    <details
      @click="openMobileFilter"
      data-cy="mobile-see-filters-button"
      class="daisy-dropdown"
    >
      <summary
        class="text-xs h-[36px] md:h-12 min-h-8 md:min-h-12 sm:text-base m-1 daisy-btn mb-1 sm:mb-5 md:rounded-3xl border-none bg-base-bg-color font-normal h-[20px]"
      >
        Filter Results:
        <span
          class="md:font-bold"
          v-if="userSession.getSelectedFilters?.length > 0"
          >{{ numberOfFilterPlans }}</span
        ><ChevronDownIcon class="size-3 sm:size-5 stroke-imt-black" />
      </summary>
    </details>
  </div>
</template>
<style lang="scss" scoped>
  #quote-results-app {
    .daisy-dropdown summary {
      padding-right: 0.8rem;
      padding-right: 0.8rem;
      @media (min-width: 400px) {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
  }
</style>
