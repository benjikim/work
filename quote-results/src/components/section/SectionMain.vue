<script setup lang="ts">
  import BasePlanRowContainer from '@/components/base/PlanRow/BasePlanRowContainer.vue';
  import DropDownContainer from '../base/DropDown/DropDownContainer.vue';
  import BasePlanDetailsModal from '../base/BasePlanDetailsModal.vue';
  import AdditionalDetails from '../base/AdditionalDetails/AdditionalDetails.vue';
  import BaseErrorModal from '@/components/base/Errors/BaseErrorModal.vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { useApiStore } from '@/store/api';
  import { computed } from 'vue';
  import { useThemeStore } from '@/store/theme';
  import AnnualPlanContainer from '@/components/base/PlanContainer/AnnualPlanContainer.vue';

  const apiStore = useApiStore();

  const sessionStore = useUserSessionStore();
  const themeStore = useThemeStore();
  const isThemeIMT = computed(() => themeStore.isThemeIMT);
  const isModalOpen = computed(() => sessionStore.isModalOpen);
  const isErrorModalOpen = computed(
    () => sessionStore.getErrorModalType !== ''
  );

  const showPlanDetailCoveredActivities = computed(() =>
    apiStore.getFFValue('cms_20250522_soventure_covered_activities')
  );
  const isModeAnnual = computed(() => themeStore.isModeAnnual);
  const isMobile = computed(() => sessionStore.isMobileView);
</script>

<template>
  <section class="lg:col-span-7 col-span-full">
    <AdditionalDetails
      v-if="isThemeIMT && !isModeAnnual && !isMobile"
    />
    <DropDownContainer v-if="!isMobile" />
    <BasePlanRowContainer v-if="!isModeAnnual" />
    <AnnualPlanContainer v-else />
    <BasePlanDetailsModal
      v-if="isModalOpen"
      :show-modal="isModalOpen"
      :showPlanDetailCoveredActivities="
        Boolean(showPlanDetailCoveredActivities)
      "
    />
    <BaseErrorModal v-if="isErrorModalOpen" />
  </section>
</template>

<style lang="scss"></style>
