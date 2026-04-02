<script setup lang="ts">
  import { useContentStore } from '@/store/content';
  import QuoteDetails from '@/components/header/QuoteDetails.vue';
  const contentStore = useContentStore();
</script>
<template>
  <div
    class="flex justify-center align-center md:mb-2 lg:justify-normal flex-col items-center lg:flex-row"
  >
    <div class="display-none md:flex flex-col">
      <h2 class="text-center mt-0 font-bold text-base lg:text-2xl pb-0 mr-3">
        {{ contentStore.getHeaderContent }}
        <span class="display-none sm:inline-block lg:display-none">:</span>
      </h2>
      <QuoteDetails class="flex lg:display-none" />
    </div>
    <div class="flex flex-row md:display-none items-baseline gap-1">
      <p class="text-sm">Quotes for:</p>
      <QuoteDetails class="flex flex-row" />
    </div>
  </div>
</template>
