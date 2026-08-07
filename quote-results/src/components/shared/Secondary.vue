<script setup lang="ts">
  import { useUserSessionStore } from '@/store/userSession';
  import { useContentStore } from '@/store/content';
  import { computed } from 'vue';

  const contentStore = useContentStore();
  const sessionStore = useUserSessionStore();
  const secondaryText = contentStore.getSecondaryText;
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
      @click="sessionStore.setSecondaryToolTipModal(true)"
      class="cursor-pointer text-xs qr-text-secondary"
    >
      Secondary
    </span>
  </div>
  <p
    v-else-if="isMobile"
    class="secondary-mobile daisy-tooltip inline text-xs font-normal qr-text-secondary cursor-help"
    :data-tip="secondaryText.toolTipText"
  >
    {{ secondaryText.label }}
  </p>
  <p v-else class="w-full text-lg leading-5 flex items-center text-[#F7966F] font-mono">*</p>
  <!-- <span
    v-else
    class="daisy-tooltip md:daisy-tooltip-right inline text-xs font-normal qr-text-secondary cursor-help"
    :data-tip="secondaryText.toolTipText"
  >
    {{ secondaryText.label }}
  </span> -->
</template>
<style lang="scss" scoped>
  #quote-results-app {
    .secondary-mobile.daisy-tooltip::before {
      transform: translateX(0);
      left: 0;
    }
    .daisy-tooltip::before {
      font-size: 0.75rem;
    }
  }
</style>
