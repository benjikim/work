<script setup lang="ts">
  import { computed } from 'vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { useThemeStore } from '@/store/theme';
  import BaseFilterContainerCopy from '@/components/base/Filters/BaseFilterContainerCopy.vue';

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
    <BaseFilterContainerCopy v-if="isViewLG" display-type="desktop" />
  </aside>
</template>

<style scoped lang="scss"></style>
