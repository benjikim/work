<script setup lang="ts">
  import { computed, onMounted, watch, ref, onBeforeMount } from 'vue';
  import { useRoute } from 'vue-router';
  import { useApiStore } from '@/store/api';
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';
  import HeaderContainer from '@/components/header/HeaderContainer.vue';
  import PlansTable from '@/components/base/Compare/PlansTable.vue';
  import Loader from '@/components/shared/Loader.vue';
  import { initResellerRatings } from '@/utility';
  import CompareFooter from '@/components/base/Compare/CompareFooter.vue';
  import CompareHeader from '@/components/base/Compare/CompareHeader.vue';
  import ComparePageHeader from '@/components/base/Compare/ComparePageHeader.vue';
  import { useThemeStore } from '@/store/theme';

  const route = useRoute();
  const apiStore = useApiStore();
  const themeStore = useThemeStore();
  onBeforeMount(async () => {
    if (!apiStore.getDataLoadedState) {
      await apiStore.init();
      // we are retrieving FF values from setSelectedPlanForCompare
      // so we should run this code after init is done.
      if (sessionStore.getSelectedPlansForCompare.length === 0) {
        const routePlanCodes = (route.query?.planCodes as string).split(',');
        routePlanCodes.forEach((code: string) =>
          sessionStore.setSelectedPlanForCompare(code)
        );
      }
    }
  });

  const sessionStore = useUserSessionStore();
  const contentStore = useContentStore();

  const displayLoader = computed(() => apiStore.getLoaderState);
  const determinedTheme = ref<boolean>(false);

  const planCodes = computed(() => sessionStore.getSelectedPlansForCompare);

  const isThemeIMT = computed(() => themeStore.isThemeIMT);
  const isMobile = computed(() => sessionStore.isMobileView);

  // Call on component mount
  onMounted(async () => {
    contentStore.setWPPlanContent();
    initResellerRatings();
    determinedTheme.value = true;
    // There is a FF for covered activities soventure
    // Run this method if theme is IMT or data is already loaded
    if (apiStore.getDataLoadedState || isThemeIMT.value) {
      contentStore.setCoverageLimitMap();
    }
  });

  // Reinitialize when loader state changes
  watch(displayLoader, (newVal, oldVal) => {
    if (!newVal && oldVal) {
      // When loader finishes
      setTimeout(initResellerRatings, 500); // Small delay to ensure DOM is ready
    }
  });
  const FFCoveredActivitiesSoventure = computed(
    () =>
      Boolean(
        apiStore.getFFValue('cms_20250522_soventure_covered_activities')
      ) ?? false
  );

  watch(FFCoveredActivitiesSoventure, () => {
    contentStore.setCoverageLimitMap();
  });

  // Watch route query changes to sync store when plans are removed
  watch(
    () => route.query.planCodes,
    (newPlanCodes, oldPlanCodes) => {
      // Only sync if we're on the Compare route and data is loaded
      if (
        route.name === 'Compare' &&
        apiStore.getDataLoadedState &&
        newPlanCodes !== oldPlanCodes
      ) {
        const routePlanCodes = newPlanCodes
          ? (newPlanCodes as string).split(',').filter((code) => code.trim())
          : [];

        // Clear current plans and sync from route
        sessionStore.clearPlansToCompare();
        routePlanCodes.forEach((code: string) => {
          sessionStore.setSelectedPlanForCompare(code);
        });
      }
    },
    { immediate: false }
  );
</script>

<template>
  <div class="quote-results-container compare-page-shell">
    <ComparePageHeader v-if="!isMobile" />
    <HeaderContainer v-if="isMobile" :is-compare="true" />
    <CompareHeader v-if="!isMobile" />
    <PlansTable v-if="planCodes.length > 0" />
    <Loader v-if="displayLoader && determinedTheme" />
    <CompareFooter v-if="isMobile" />
  </div>
</template>

<style scoped lang="scss">
  .quote-results-container {
    max-width: $base-content-max-width;
    margin: 0 auto;
  }

  .compare-page-shell {
    padding-top: 0;
  }
</style>
