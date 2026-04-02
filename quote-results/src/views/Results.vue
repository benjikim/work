<script setup lang="ts">
  import { computed, watch, onMounted, ref, onBeforeMount } from 'vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { useContentStore } from '@/store/content';
  import SectionMain from '@/components/section/SectionMain.vue';
  import SectionSidebar from '@/components/section/SectionSidebar.vue';
  import HeaderContainer from '@/components/header/HeaderContainer.vue';
  import { useApiStore } from '@/store/api';
  import Loader from '@/components/shared/Loader.vue';
  import { initResellerRatings } from '@/utility';
  import { previousRoute } from '@/router/previousRoute';

  const apiStore = useApiStore();
  const contentStore = useContentStore();

  onBeforeMount(async () => {
    if (!apiStore.getDataLoadedState) {
      await apiStore.init();
    }
  });

  const sessionStore = useUserSessionStore();
  const displayLoader = computed(() => apiStore.getLoaderState);
  const determinedTheme = ref<boolean>(false);
  const isMobile = computed(() => sessionStore.isMobileView);

  // Call on component mount
  onMounted(async () => {
    // Unless we are coming from the compare page, lets make sure we have no plans selected for compare
    const fromCompare = previousRoute.value?.name === 'Compare';
    if (!fromCompare) {
      sessionStore.deselectPlansForCompare();
    }

    window.addEventListener('pageshow', (e) => {
      const nav = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;

      const isBFCache = e.persisted || nav?.type === 'back_forward';

      if (isBFCache) {
        sessionStore.setPBMCurrentState(false);
      }
    });

    contentStore.setWPPlanContent();
    initResellerRatings();
    contentStore.setCoverageLimitMap();
    contentStore.setPlanDetailsCoverageLimitMap();
    determinedTheme.value = true;
  });

  // Reinitialize when loader state changes
  watch(displayLoader, (newVal, oldVal) => {
    if (!newVal && oldVal) {
      // When loader finishes
      setTimeout(initResellerRatings, 500); // Small delay to ensure DOM is ready
    }
  });
</script>

<template>
  <HeaderContainer v-if="isMobile"></HeaderContainer>
  <div
    class="quote-results-container grid md:grid-cols-10 gap-3 sm:gap-0 lg:gap-14"
  >
    <HeaderContainer v-if="!isMobile"></HeaderContainer>
    <SectionSidebar></SectionSidebar>
    <SectionMain></SectionMain>
    <Loader v-if="displayLoader && determinedTheme" />
  </div>
</template>

<style scoped lang="scss">
  .quote-results-container {
    max-width: $base-content-max-width;
    margin: 0 auto;
    padding-top: 20px;
  }
</style>
