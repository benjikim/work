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
        class="flex w-full max-w-[215px] items-center justify-center gap-[5px] rounded-md border border-[#DEDEDE] bg-white p-1 text-center transition-colors duration-150 hover:bg-[#F6FAFD] h-9"
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

      <Share />
    </div>

  </div>
</template>

<style scoped lang="scss">

</style>
