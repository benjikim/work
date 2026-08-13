<script setup lang="ts">
  import { computed } from 'vue';
  import { useThemeStore } from '@/store/theme';
  import BaseFilterContainerCopy from '@/components/base/Filters/BaseFilterContainerCopy.vue';

  const themeStore = useThemeStore();
  const isModeEdu = computed(() => themeStore.isModeEdu);
  const isModeAnnual = computed(() => themeStore.isModeAnnual);
</script>

<template>
  <aside
    v-if="!isModeEdu && !isModeAnnual"
    class="col-span-full lg:col-span-3 block lg:m-0"
  >
    <BaseFilterContainerCopy display-type="desktop" />
  </aside>
</template>

<style scoped lang="scss"></style>
