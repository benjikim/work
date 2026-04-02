<script setup lang="ts">
  import { computed } from 'vue';
  import { useContentStore } from '@/store/content';
  import { useThemeStore } from '@/store/theme';

  const contentStore = useContentStore();
  const themeStore = useThemeStore();

  const subFlowContent = computed(() => contentStore.getSubflowContents);

  console.log('subFlowContent', subFlowContent.value);

  const mode = computed(() => themeStore.getCurrentThemeMode);
</script>

<template>
  <div v-if="subFlowContent" v-html="subFlowContent[mode]['content']"></div>
</template>

<style lang="scss"></style>
