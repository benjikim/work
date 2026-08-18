<script setup lang="ts">
  import { computed } from 'vue';
  import router from '@/router';
  import { useApiStore } from '@/store/api';
  import { useUserSessionStore } from '@/store/userSession';
  import { ChevronLeftIcon } from '@heroicons/vue/24/solid';
  import { event } from 'vue-gtag';
  import { GAObject } from '@/types';
  import Share from '@/components/base/DropDown/Share.vue';
  import { useThemeStore } from '@/store/theme';

  const apiStore = useApiStore();
  const sessionStore = useUserSessionStore();
  const themeStore = useThemeStore();
  const travelDestination = computed(() => apiStore.getTravelDestination);
  const quoteId = computed(() => apiStore.getQuoteId);
  const isThemeIMT = computed(() => themeStore.isThemeIMT);
  const isMobile = computed(() => sessionStore.isMobileView);

  /**
   * This function is used to handle the back button on the compare page.
   * It first checks if there are any plans that need to be re-quoted.
   * If there are plans, it calls the setPlanParameters function to make sure the current state of plans.
   * It then fires an event to track the back button click.
   * Finally, it pushes the user to the results page with the current quote id.
   */
  const handleBack = async () => {
    const plansToRequote = sessionStore.getPlansToRequote;
    // we shall make sure that we have the current state of plans.
    // if the users adjusts these plans, we can make sure the options selected stick
    if (plansToRequote.length > 0) {
      await sessionStore.setPlanParameters();
    }

    // Fire Event when back button is selected on compare page.
    event('back_to_results', {
      hierarchical_layer_1:
        'User selected back to results button on Compare Page',
    } as GAObject);

    router.push({
      name: 'Results',
      query: {
        _qid: quoteId.value,
      },
    });
  };
</script>

<template>
  <!-- Sticky wrapper -->
  <div v-if="!isMobile" class="sticky top-0 z-30 mt-[50px] px-0 bg-white pl-0">
    <div class="grid grid-cols-3 items-center">
      <button
        type="button"
        class="flex w-full max-w-[215px] items-center justify-center gap-[5px] rounded-md border border-[#DEDEDE] bg-white p-1 text-center transition-colors duration-150 hover:bg-[#F6FAFD] ml-[10px] h-9"
        @click="handleBack"
        aria-label="Back to Quote Results"
      >
        <ChevronLeftIcon
          class="size-4 text-action-alt-primary"
        />
        <span class="text-[0.625rem] font-bold uppercase text-action-alt-primary">
          <span class="block">Back to Quote Results</span>
        </span>
      </button>
      <!-- Center -->
      <div class="text-center text-sm py-1 bg-white font-normal">
        Coverage Limits Are Per-Person Unless Otherwise Noted
      </div>

      <!-- Right -->
      <div class="justify-self-end mr-[10px]">
        <Share v-if="!isThemeIMT" class="max-w-fit share-result" />
        <Share
          v-if="travelDestination !== null && isThemeIMT"
          :destination="travelDestination"
          class="share-result"
        />
      </div>
    </div>
  </div>
</template>
