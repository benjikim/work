<script setup lang="ts">
  import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
  import { useUserSessionStore } from '@/store/userSession';
  import type { QuoteResult } from '@/types';
  import { removeHTMLTags, getCompareCoverageData } from '@/utility/index.ts';

  const { plan, dataCy } = defineProps<{
    plan: QuoteResult;
    dataCy: string;
  }>();

  const sessionStore = useUserSessionStore();
  const header = 'Availability';
  const description = removeHTMLTags(
    getCompareCoverageData(plan, 'availability', true)
  );
  const dialogRef = ref<HTMLDialogElement | null>(null);

  /**
   * Closes the availability modal.
   */
  const closeDialog = () => {
    sessionStore.setAvailabilityModalOpen(false);
  };

  /**
   * Syncs the open state of the availability modal with the session store.
   * If open is true, opens the modal if it is not already open.
   * If open is false, closes the modal if it is open.
   * @param {boolean} open - Whether to open or close the modal
   */
  const syncOpenState = (open: boolean) => {
    const el = dialogRef.value;
    if (!el) return;

    const canModal = typeof el.showModal === 'function';

    if (open) {
      if (canModal) {
        if (!el.open) el.showModal();
      } else {
        el.setAttribute('open', '');
      }
      return;
    }

    // closing
    if (canModal) {
      if (el.open) el.close();
    } else {
      el.removeAttribute('open');
    }
  };

  // keep store -> dialog in sync
  watch(() => sessionStore.isAvailabilityModalOpen, syncOpenState, {
    immediate: true,
  });

  /**
   * Handles the closing of the availability dialog.
   * If the availability modal is open, this function calls closeDialog()
   * to close the dialog.
   */
  const handleDialogClose = () => {
    if (sessionStore.isAvailabilityModalOpen) {
      closeDialog();
    }
  };

  /**
   * Adds an event listener to the availability dialog to handle the closing of the dialog.
   */
  onMounted(() => {
    dialogRef.value?.addEventListener('close', handleDialogClose);
  });

  /**
   * Removes the event listener from the availability dialog.
   */
  onBeforeUnmount(() => {
    dialogRef.value?.removeEventListener('close', handleDialogClose);
  });
</script>

<template>
  <dialog ref="dialogRef" class="daisy-modal z-[998]" @click.self="closeDialog">
    <div
      class="daisy-modal-box w-dvw max-w-md p-4 overflow-hidden shadow-black rounded"
      :data-cy="dataCy"
    >
      <button
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        aria-label="Close"
        @click="closeDialog"
      >
        ✕
      </button>

      <p class="text-lg font-bold text-center mb-4">{{ header }}</p>

      <p class="mb-4 text-base availability__modal" v-html="description"></p>

      <button
        class="w-full text-sm bg-action-primary border-action-primary border-2 my-2 p-3 flex justify-center text-white rounded-lg font-semibold uppercase"
        title="Continue"
        @click="closeDialog"
      >
        Close
      </button>
    </div>

    <form method="dialog" class="daisy-modal-backdrop">
      <button aria-label="Close"></button>
    </form>
  </dialog>
</template>

<style lang="scss">
  .availability__modal {
    table {
      border-collapse: collapse;
      border: 1px solid #000;
    }
    td {
      padding: 0.5rem;
      border: 1px solid #000;
      text-align: center;
    }
  }
</style>
