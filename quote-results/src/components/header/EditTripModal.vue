<script setup lang="ts">
  import { useUserSessionStore } from '@/store/userSession';
  import { useThemeStore } from '@/store/theme';
  import { event } from 'vue-gtag';
  import { onMounted, onUnmounted, computed, ref } from 'vue';
  import { ChevronLeftIcon } from '@heroicons/vue/24/solid';
  import { GAObject } from '@/types';
  import { loadAssets } from '@/utility/index';

  const sessionStore = useUserSessionStore();
  const themeStore = useThemeStore();

  const isThemeSoventure = computed(() => themeStore.isThemeSoventure);
  const isModeAnnual = computed(() => themeStore.isModeAnnual);

  let originalElement: HTMLElement | null = null;
  let originalParent: HTMLElement | null = null;
  const formLoaded = ref(false);
  const formMoved = ref(false);

  const moveQuoteFormToModal = () => {
    if (formMoved.value) return;

    originalElement =
      document.querySelector('#minimal-quote-form') ??
      document.querySelector('#quote-form-v2');
      
    if (originalElement) {
      originalElement.style.display = 'block';
      originalParent = originalElement.parentElement;

      const targetLocation = document.querySelector('#quote-form-modal');
      if (targetLocation) {
        targetLocation.append(originalElement);
        formMoved.value = true;
      }
    }
  };

  onMounted(async () => {
    try {
      const { quoteFormJs, quoteFormCss } = window.IMTQuoteFormModules || {};

      if (!quoteFormJs) {
        console.warn('Quote form asset URLs are missing.');
        return;
      }

      await loadAssets(quoteFormJs, quoteFormCss);
      formLoaded.value = true;

      moveQuoteFormToModal();
    } catch (err) {
      console.error('Failed to load quote form assets:', err);
    }
  });

  onUnmounted(() => {
    // Move the element back to its original location when the component is destroyed
    if (originalElement && originalParent) {
      originalElement.style.display = 'none';
      originalParent.appendChild(originalElement);
      formMoved.value = false;
    }
  });

  /**
   * Closes the modal by setting toolTip to false.
   */
  const closeModal = () => {
    // Event fired when user closed Edit Quote Details Modal
    event('edit_quote_details', {
      hierarchical_layer_1: 'User Closed Edit Quote Details Modal',
    } as GAObject);

    sessionStore.setEditTripModalIsOpen(false);
  };
</script>
<template>
  <dialog
    class="daisy-modal filter-mobile-modal daisy-modal-open"
    @close="closeModal()"
  >
    <div
      class="daisy-modal-box p-0 rounded-none w-full max-h-full h-full max-w-full md:h-auto"
      :class="[!isModeAnnual ? 'md:w-auto' : 'md:w-[470px]']"
    >
      <div
        ref="nav"
        class="daisy-modal-action mt-0 h-20 sticky top-0 md:static z-50"
        :class="isThemeSoventure ? 'bg-[#274452]' : 'bg-[#0c233c]'"
      >
        <form method="dialog" class="mb-0">
          <div class="left-2 top-8 absolute text-[white]">
            <button
              @click="closeModal()"
              class="whitespace-nowrap inline-flex text-center font-normal text-base"
            >
              <ChevronLeftIcon
                aria-label="back"
                class="size-6 stroke-[white]"
              />
              Back
            </button>
          </div>
        </form>
      </div>

      <div id="quote-form-modal">
        <div v-if="!formLoaded" class="text-center p-6 text-gray-500 text-sm">
          <p>Loading Quote Form...</p>
          <span
            class="daisy-loading daisy-loading-spinner daisy-loading-sm"
          ></span>
        </div>
      </div>
    </div>
    <!-- This creates a backdrop for the modal to enable us to close when clicked outside -->
    <div class="daisy-modal-backdrop" @click="closeModal()"></div>
  </dialog>
</template>
