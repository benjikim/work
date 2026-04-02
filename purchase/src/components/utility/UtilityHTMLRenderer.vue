<script setup>
defineProps({
  content: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    default: 'div',
  },
});
</script>

<template>
  <!-- eslint-disable -->
  <component :is="tag" v-html="content"></component>
  <!-- eslint-enable -->
</template>