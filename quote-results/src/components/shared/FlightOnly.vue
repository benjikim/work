<script setup lang="ts">
  import { useUserSessionStore } from '@/store/userSession';
  import { useContentStore } from '@/store/content';
  import { computed } from 'vue';

  const contentStore = useContentStore();
  const sessionStore = useUserSessionStore();
  const flightOnlyText = contentStore.getFlightOnlyText;
  const isMobile = computed(() => sessionStore.isMobileView);

  defineProps({
    modalView: {
      type: Boolean,
      required: false,
    },
  });
</script>
<template>
  <div v-if="modalView" class="pl-2">
    <span
      class="cursor-pointer text-xs qr-text-secondary"
    >
      Flight Only
    </span>
  </div>
  <p
    v-else-if="isMobile"
    class="secondary-mobile daisy-tooltip inline text-[0.625rem] qr-text-secondary"
  >
    {{ flightOnlyText.label }}
  </p>
  <span
    v-else
    class="daisy-tooltip md:daisy-tooltip-right inline text-[0.625rem] qr-text-secondary"
  >
    {{ flightOnlyText.label }}
  </span>
</template>
<style lang="scss" scoped>
  #quote-results-app {
    .secondary-mobile.daisy-tooltip::before {
      transform: translateX(0);
      left: 0;
    }
  }
</style>
