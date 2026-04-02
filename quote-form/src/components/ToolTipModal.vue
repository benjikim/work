<script setup lang="ts">
  import { useContentStore } from '@/store/content';
  import { computed } from 'vue';

  const contentStore = useContentStore();

  const toolTipData = computed(() =>
    contentStore.getActiveToolTip
  );

  const closeModal = () => {
    contentStore.setToolTipModalOpen(false);
  };


</script>
<template>
  <dialog class="modal-open modal" @close="closeModal()">
    <div class="modal-box bg-white w-dvw max-w-xs p-4 rounded-none overflow-auto shadow-black flex flex-col !opacity-100">
      <p class="text-2xl font-bold text-center mb-4">
        {{ toolTipData.header }}
      </p>

      <p class="mb-4 p-2 text-base">
        {{ toolTipData.text }}
      </p>

      <p v-if="toolTipData.secondary_text" class="mb-4 p-2 text-base">
        {{ toolTipData.secondary_text }}
      </p>

      <button
        class="w-full bg-[white] border-2 my-2 p-3 flex justify-center font-semibold rounded-lg uppercase text-[#0270C0] border-action-primary"
        title="Continue"
        @click="closeModal"
      >
        Close
      </button>
    </div>
    <div class="modal-backdrop" @click="closeModal()"></div>
  </dialog>
</template>
