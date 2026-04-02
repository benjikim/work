<script setup lang="ts">
  import { computed } from 'vue';
  import { useUserSessionStore } from '@/store/userSession';
  import BaseFilterContainer from '../base/Filters/BaseFilterContainer.vue';
  import BaseSubflow from '../base/Subflow/BaseSubflow.vue';
  import { useThemeStore } from '@/store/theme';

  const themeStore = useThemeStore();

  const sessionStore = useUserSessionStore();
  const isViewLG = computed(() => sessionStore.isViewLG);
  const isModeEdu = computed(() => themeStore.isModeEdu);
  const isModeAnnual = computed(() => themeStore.isModeAnnual);
</script>

<template>
  <aside
    v-if="!isModeEdu && !isModeAnnual"
    class="lg:col-span-3 lg:block display-none lg:m-0"
  >
    <BaseFilterContainer v-if="isViewLG" display-type="desktop" />
  </aside>
  <aside v-else class="lg:col-span-3 lg:block display-none lg:m-0">
    <BaseSubflow v-if="isViewLG" />
  </aside>
</template>

<style lang="scss"></style>
