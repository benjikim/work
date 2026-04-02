<script setup lang="ts">
  import { useContentStore } from '@/store/content';
  import UtilityHTMLRenderer from '@/components/utility/UtilityHTMLRenderer.vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { computed } from 'vue';

  const sessionStore = useUserSessionStore();
  const contentStore = useContentStore();

  /**
   * Closes the modal by setting to false.
   */
  const closeModal = () => {
    sessionStore.setPlanTagModalOpen(false);
  };

  const planTagModalData = computed(() =>
  {
    return contentStore.getPlanTagModalData(sessionStore.getPlanTagId);
  }
  );
</script>
<template>
  <dialog class="daisy-modal daisy-modal-open z-[1050]" @close="closeModal()">
    <div
      class="daisy-modal-box w-dvw max-w-xs p-4 rounded-none overflow-hidden shadow-black flex flex-col items-center"
    >
      <UtilityHTMLRenderer
        is="div"
        :content="planTagModalData"
      ></UtilityHTMLRenderer>
      <button
        class="w-full bg-[white] border-2 my-2 p-3 flex justify-center font-semibold rounded-lg uppercase text-action-primary border-action-primary"
        title="Continue"
        @click="closeModal"
      >
        Close
      </button>
    </div>
    <div class="daisy-modal-backdrop" @click="closeModal()"></div>
  </dialog>
</template>
