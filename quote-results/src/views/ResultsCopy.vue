<script setup lang="ts">
  import { computed, watch, onMounted, ref, onBeforeMount } from 'vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { useContentStore } from '@/store/content';
  import SectionMain from '@/components/section/SectionMain.vue';
  import SectionSidebarCopy from '@/components/section/SectionSidebarCopy.vue';
  import HeaderContainer from '@/components/header/HeaderContainer.vue';
  import ComparePageHeader from '@/components/base/Compare/ComparePageHeader.vue';
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

  onMounted(async () => {
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

  watch(displayLoader, (newVal, oldVal) => {
    if (!newVal && oldVal) {
      setTimeout(initResellerRatings, 500);
    }
  });
</script>

<template>
  <HeaderContainer v-if="isMobile"></HeaderContainer>
  <ComparePageHeader v-if="!isMobile" />
  <div
    class="quote-results-container grid md:grid-cols-10 gap-3 sm:gap-0 lg:gap-x-14 lg:gap-y-5"
  >
    <HeaderContainer v-if="!isMobile"></HeaderContainer>
    <SectionSidebarCopy></SectionSidebarCopy>
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
