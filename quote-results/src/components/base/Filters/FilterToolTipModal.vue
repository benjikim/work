<script setup lang="ts">
  import { useContentStore } from '@/store/content';
  import UtilityHTMLRenderer from '@/components/utility/UtilityHTMLRenderer.vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { computed } from 'vue';

  const sessionStore = useUserSessionStore();
  const contentStore = useContentStore();

  /**
   * Closes the modal by setting toolTip to false.
   */
  const closeModal = () => {
    sessionStore.setFilterToolTipModalOpen(false);
  };

  const toolTipData = computed(() =>
    contentStore.getFilterData(sessionStore.getFilterToolTipId)
  );

  const coverageModalImages = computed(
    () => contentStore.getCoverageModalImages
  );

  const isFilterToolTipPlanShow = computed(
    () => sessionStore.isFilterToolTipPlanShow
  );

  const HighlightedCoverageInformation = computed(
    () => contentStore.getHighlightedCoverageInformation
  );
</script>
<template>
  <dialog class="daisy-modal daisy-modal-open z-[1000]" @close="closeModal()">
    <div
      class="daisy-modal-box w-dvw max-w-xs p-4 rounded-none overflow-auto shadow-black flex flex-col items-center"
    >
      <p class="text-2xl font-bold text-center mb-4">
        {{ toolTipData.label }}
      </p>
      <img
        class="w-[50%]"
        v-if="coverageModalImages"
        :src="coverageModalImages[sessionStore.getFilterToolTipId]?.url"
      />
      <UtilityHTMLRenderer
        is="p"
        class="text-base"
        :content="toolTipData.toolTipText"
      ></UtilityHTMLRenderer>

      <UtilityHTMLRenderer
        v-if="
          toolTipData.toolTipSecondaryText !== null && isFilterToolTipPlanShow
        "
        is="p"
        class="mb-4 text-base"
        :content="toolTipData.toolTipSecondaryText"
      ></UtilityHTMLRenderer>

      <!-- Adding dynamic text here for plans gather via API (f.e secondary, coverage messages and etc) -->
      <div
        class="w-full"
        v-for="(coverageInfo, index) in HighlightedCoverageInformation"
        :key="index"
      >
        <br/>
        <div class="flex content-center">
          <p
            v-if="coverageInfo.iconColor"
            :style="{ color: coverageInfo.iconColor }"
            class="text-2xl leading-none"
          >
            •
          </p>
          <p class="font-bold">{{ coverageInfo.heading }}</p>
        </div>
        <p v-if="coverageInfo.description">{{ coverageInfo.description }}</p>
      </div>

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
