<script setup lang="ts">
  import { computed } from 'vue';
  import router from '@/router';
  import { event } from 'vue-gtag';
  import { GAObject } from '@/types';
  import { useUserSessionStore } from '@/store/userSession';
  import { useApiStore } from '@/store/api';
  import Share from '@/components/base/DropDown/Share.vue';
  import { ChevronLeftIcon } from '@heroicons/vue/24/solid';

  const sessionStore = useUserSessionStore();
  const apiStore = useApiStore();

  const quoteId = computed(() => apiStore.getQuoteId);


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
  <div class="fixed bottom-0 left-0 right-0 py-3 bg-[#EFF2F5]">
    
    <div class="flex justify-between gap-2 w-full px-4">
      <button
        type="button"
        class="flex-1 inline-flex flex-row items-center justify-center daisy-btn rounded-3xl bg-white border-2 border-[#DEDEDE] font-normal max-w-[215px]"
        @click="handleBack"
        aria-label="Back to Quote Results"
      >
        <ChevronLeftIcon
          class="size-[10px] font-bold ml-[-5px] text-[--action-primary]"
        />
        <span class="font-bold text-xs ml-[-5px] text-[--action-primary]">
          <span class="block">Back to Quote Results</span>
        </span>
      </button>

      <Share />
    </div>

  </div>
</template>

<style scoped lang="scss">

</style>
