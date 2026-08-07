<script setup lang="ts">
  import { reactive } from 'vue';
  import { useUserSessionStore } from '@/store/userSession';
  import BaseSubflow from '../base/Subflow/BaseSubflow.vue';

  const sessionStore = useUserSessionStore();

  const state = reactive({
    pageIndex: 0,
    isLoading: false,
    hideModal: false,
  });

  /**
   * Closes the modal by setting PBM plan to null.
   */
  const closeModal = () => {
    sessionStore.setAnnualEligibilityModalOpen(false);
  };
</script>
<template>
  <dialog
    class="daisy-modal annual-eligibility-modal daisy-modal-open z-[999999] md:z-[998]"
    :class="{
      'display-none': state.hideModal,
    }"
    @close="closeModal()"
  >
    <div
      class="daisy-modal-box h-fit w-full md:w-11/12 md:max-w-[60vw] lg:max-w-[40rem] p-0 overflow-y-auto"
    >
      <div class="grid grid-cols-12 w-full pb-4 px-6 pt-6">
        <div class="col-span-12 flex items-center flex-col">
          <button
            type="button"
            class="close-btn"
            @click="closeModal()"
            aria-label="close"
          >
            ×
          </button>
          <div class="col-span-6 md:col-span-8 text-xl font-bold my-3">
            Annual Eligibility
          </div>
        </div>
      </div>
      <div
        class="grid h-full w-full base-border-t p-6 annual-eligibility-modal__content"
      >
        <BaseSubflow />
      </div>
      <div class="daisy-modal-action px-6 pb-6">
        <button
          class="daisy-btn daisy-btn-block text-white font-semibold disabled:opacity-60 bg-action-primary hover:bg-action-primary uppercase tracking-wider"
          data-cy="annual-eligibility-modal-close-button"
          @click="closeModal()"
        >
          Close
        </button>
      </div>
    </div>
    <div class="daisy-modal-backdrop" @click="closeModal()"></div>
  </dialog>
</template>

<style lang="scss">
  .close-btn {
    font-size: 30px;
    position: fixed;
    right: 30px;
    font-size: 32px;
    line-height: 1;
    color: #757575;
  }

  .annual-eligibility-modal {
    &__content {
      max-height: 30vh;
      overflow-y: scroll;
      position: relative;
    }
  }
</style>
