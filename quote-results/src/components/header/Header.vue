<script setup lang="ts">
  import QuoteDetails from '@/components/header/QuoteDetails.vue';
</script>
<template>
  <div
    class="flex align-center md:mb-2 flex-col items-start lg:justify-normal lg:items-center lg:flex-row"
  >
    <div class="display-none md:flex flex-col items-start">
      <h2 class="text-left mt-0 font-bold text-base pb-0 mr-3">
        <span>Trip Details</span>
        <span class="ml-2 text-[0.625rem] uppercase font-bold text-action-primary invisible group-hover:visible">
          Update
        </span>
        <span class="display-none sm:inline-block lg:display-none">:</span>
      </h2>
      <QuoteDetails class="flex lg:display-none" />
    </div>
    <div class="flex flex-row md:display-none items-baseline gap-1 self-start">
      <p class="text-sm">Quotes for:</p>
      <QuoteDetails class="flex flex-row" />
    </div>
  </div>
</template>
