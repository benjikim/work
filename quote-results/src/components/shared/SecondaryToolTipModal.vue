<script setup lang="ts">
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';

  const sessionStore = useUserSessionStore();
  const contentStore = useContentStore();

  const secondaryText = contentStore.getSecondaryText;
</script>
<template>
  <dialog
    class="daisy-modal daisy-modal-open z-[998]"
    @close="sessionStore.setSecondaryToolTipModal(false)"
  >
    <div
      class="daisy-modal-box w-dvw max-w-xs p-4 overflow-hidden shadow-black rounded"
    >
      <p class="text-lg font-bold text-center mb-4">
        {{ secondaryText.header }}
      </p>
      <p class="mb-4 text-base">{{ secondaryText.toolTipText }}</p>
      <button
        class="w-full bg-action-primary border-action-primary border-2 my-2 p-3 flex justify-center text-white rounded-lg font-semibold uppercase"
        title="Continue"
        @click="sessionStore.setSecondaryToolTipModal(false)"
      >
        Back
      </button>
    </div>
    <div
      class="daisy-modal-backdrop"
      @click="sessionStore.setSecondaryToolTipModal(false)"
    ></div>
  </dialog>
</template>
