<script setup lang="ts">
  import { ChevronRightIcon } from '@heroicons/vue/24/solid';
  import { useUserSessionStore } from '@/store/userSession';
  import BaseFilterContainer from '@/components/base/Filters/BaseFilterContainer.vue';
  import { computed, watchEffect } from 'vue';
  import { useThemeStore } from '@/store/theme';

  const sessionStore = useUserSessionStore();
  const themeStore = useThemeStore();

  const isMobile = computed(() => sessionStore.isMobileView);
  const isThemeIMT = computed(() => themeStore.isThemeIMT);

  watchEffect(() => {
    const navHeader = document.querySelector('.header');

    if (isMobile.value && navHeader && navHeader instanceof HTMLElement) {
      if (!navHeader.classList.contains('hidden')) {
        navHeader.classList.add('hidden');
      }
    } else if (navHeader && navHeader.classList.contains('hidden')) {
      navHeader.classList.remove('hidden');
    }
  });
</script>
<template>
  <dialog
    class="daisy-modal daisy-modal-open filter-mobile-modal"
    @close="sessionStore.setMobileFilterModalOpen(false)"
  >
    <div
      class="daisy-modal-box p-0 rounded-none overflow-hidden max-h-full h-full max-w-full w-full sm:w-dvw sm:max-w-3xl box"
    >
      <div
        class="daisy-modal-action mt-0 h-20"
        :class="[isThemeIMT ? 'bg-[#0c233c]' : 'bg-[#274452]']"
      >
        <form method="dialog">
          <div
            class="left-0 top-0 absolute text-[white] w-full p-5 flex justify-between items-center"
          >
            <p class="font-bold align-middle">Filter Results By:</p>
            <button
              @click="sessionStore.setMobileFilterModalOpen(false)"
              class="whitespace-nowrap inline-flex text-center font-normal text-base"
            >
              <ChevronRightIcon
                aria-label="back"
                class="size-10 stroke-[white]"
              />
            </button>
          </div>
        </form>
      </div>

      <BaseFilterContainer display-type="mobile" class="w-full p-5 content" />
    </div>
    <!-- This creates a backdrop for the modal to enable us to close when clicked outside -->
    <div
      class="daisy-modal-backdrop"
      @click="sessionStore.setMobileFilterModalOpen(false)"
    ></div>
  </dialog>
</template>
<style lang="scss">
  #quote-results-app {
    .filter-mobile-modal {
      .box {
        @media (min-width: 640px) {
          max-height: calc(100vh - 5em - 5rem);
        }
      }

      .content {
        overflow: hidden;
        max-height: 100%;
        position: relative;
        @media (min-width: 640px) {
          max-height: calc(100vh - 5em - 5rem);
        }
      }
    }
  }
</style>
