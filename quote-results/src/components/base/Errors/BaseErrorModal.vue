<script setup lang="ts">
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';

  import UtilityHTMLRenderer from '@/components/utility/UtilityHTMLRenderer.vue';

  const sessionStore = useUserSessionStore();
  const contentStore = useContentStore();

  const errorModalType = sessionStore.getErrorModalType;
  const modalContent = contentStore.getErrorModalContent[errorModalType];

  /**
   * Closes the modal by setting toolTip to false.
   */
  const closeModal = () => {
    sessionStore.setErrorModalState('');
  };

  /**
   * Handles contact us button.
   */
  const handleContactUs = () => {
    sessionStore.setErrorModalState('');
    window.location.href = window.location.origin + '/contact/';
  };

  /**
   * Handles update quote button.
   */
  const handleUpdateQuote = () => {
    sessionStore.setErrorModalState('');
    window.location.href = window.location.origin + '/travel-insurance/quote/';
  };

</script>
<template>
  <dialog class="daisy-modal daisy-modal-open" @close="closeModal()">
    <div
      v-if="errorModalType !== 'noAvailablePlans'"
      class="daisy-modal-box w-dvw max-w-xs p-4 rounded-none overflow-hidden shadow-black"
    >
      <p class="text-2xl font-bold text-center mb-4">
        {{ modalContent.header }}
      </p>
      <p v-if="modalContent.contentType === 'text'">
        {{ modalContent.content }}
      </p>
      <UtilityHTMLRenderer
        v-else-if="modalContent.contentType === 'html'"
        is="p"
        :content="modalContent.content"
      ></UtilityHTMLRenderer>
      <button
        class="w-full bg-[white] border-imt-blue border-2 my-2 p-3 flex justify-center text-imt-blue font-semibold"
        title="Continue"
        @click="modalContent.buttonMethod()"
      >
        {{ modalContent.buttonText }}
      </button>
    </div>
    <div
      v-else
      class="daisy-modal-box w-dvw max-w-lg p-4 rounded-none overflow-hidden shadow-black"
    >
      <p class="text-2xl font-bold text-center mb-4 capitalize">
        {{ modalContent.header }}
      </p>
      <p>
        {{ modalContent.content }}
      </p>
      <div class="flex pt-2">
        <button
          class="w-full bg-[white] border-imt-blue border-2 my-2 p-3 mr-4 flex justify-center text-imt-blue font-semibold"
          title="Continue"
          @click="handleContactUs"
        >
          Contact Us
        </button>
        <button
          class="w-full bg-[white] border-imt-blue border-2 my-2 p-3 flex justify-center text-imt-blue font-semibold"
          title="Continue"
          @click="handleUpdateQuote"
        >
          Update Your Quote
        </button>
      </div>
    </div>
  </dialog>
</template>