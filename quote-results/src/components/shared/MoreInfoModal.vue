<script setup lang="ts">
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';
  import { useApiStore } from '@/store/api';
  import { computed } from 'vue';

  const sessionStore = useUserSessionStore();
  const contentStore = useContentStore();
  const apiStore = useApiStore();

  const planCode = computed(() =>
    apiStore.getFFValue('sb_20250818_annual_plans_release_us')
  );
  const optionKey = computed(() => sessionStore.getMoreInfoModalKey);
  const customHeading = computed(() => sessionStore.getMoreInfoModalHeading);
  const customContent = computed(() => sessionStore.getMoreInfoModalContent);

  const moreInfoContent = computed(() => {
    if (customContent.value) {
      return {
        heading: customHeading.value,
        content: customContent.value,
      };
    }

    if (planCode.value && typeof planCode.value === 'string') {
      return contentStore.getMoreInfoText(planCode.value, optionKey.value);
    }
    return undefined;
  });
</script>
<template>
  <dialog
    class="daisy-modal daisy-modal-open z-[998]"
    @close="
      sessionStore.setMoreInfoModalOpen(false);
      sessionStore.setMoreInfoModalKey('');
      sessionStore.setMoreInfoModalContent({ heading: '', content: '' });
    "
  >
    <div
      class="daisy-modal-box w-dvw max-w-md p-4 overflow-hidden shadow-black rounded"
    >
      <p class="text-lg font-bold text-center mb-4">
        {{ moreInfoContent?.heading ?? '' }}
      </p>
      <p
        class="mb-4 text-base more-info__modal"
        v-html="moreInfoContent?.content ?? ''"
      ></p>
      <button
        class="w-full bg-action-primary border-action-primary border-2 my-2 p-3 flex justify-center text-white rounded-lg font-semibold uppercase"
        title="Continue"
        @click="
          sessionStore.setMoreInfoModalOpen(false);
          sessionStore.setMoreInfoModalKey('');
          sessionStore.setMoreInfoModalContent({ heading: '', content: '' });
        "
      >
        Back
      </button>
    </div>
    <div
      class="daisy-modal-backdrop"
      @click="
        sessionStore.setMoreInfoModalOpen(false);
        sessionStore.setMoreInfoModalKey('');
        sessionStore.setMoreInfoModalContent({ heading: '', content: '' });
      "
    ></div>
  </dialog>
</template>
<style lang="scss">
  .more-info__modal {
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
