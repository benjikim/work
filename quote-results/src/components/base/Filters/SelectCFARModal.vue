<script setup lang="ts">
  import { useUserSessionStore } from '@/store/userSession';
  import { event } from 'vue-gtag';
  import { GAObject } from '@/types';

  const sessionStore = useUserSessionStore();

  /**
   * Closes the modal by setting toolTip to false.
   */
  const closeModal = () => {
    sessionStore.setCfarDetailsModal(false);
  };

  const cfarDetailsAccept = () => {
    // Event fired when user clicks I understand
    event('accepts_cfar_details_modal', {
      hierarchical_layer_1: 'User Selected I understand on CFAR Modal',
    } as GAObject);
    sessionStore.setCfarDetailsModal(false);
  };
</script>
<template>
  <dialog class="daisy-modal daisy-modal-open" @close="closeModal()">
    <div
      class="daisy-modal-box w-dvw max-w-xs p-4 rounded-none overflow-hidden shadow-black"
    >
      <p class="text-2xl font-bold text-center mb-4">
        Cancel For Any Reason Details
      </p>
      <p class="mb-4 text-base">
        This coverage's eligibility is based on the initial payment/deposit for
        the originally scheduled trip, for which cash was paid, and not the date
        the Future Travel Credit (FTC) was applied towards this trip. I agree
        that the initial trip payment date that I have entered is the date which
        I first paid money toward the originally scheduled trip.
      </p>
      <button
        class="w-full bg-[white] border-imt-blue border-2 my-2 p-3 flex justify-center text-imt-blue font-semibold rounded-lg uppercase"
        title="Continue"
        @click="cfarDetailsAccept"
        data-cy="cfar-details-accept-button"
      >
        I Understand
      </button>
    </div>
  </dialog>
</template>
