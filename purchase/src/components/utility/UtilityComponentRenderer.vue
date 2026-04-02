<script setup>
import * as Modal from 'src/components/modal';

defineProps({
  name: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <!-- eslint-disable -->
  <component :is="Modal[name]" ></component>
  <!-- eslint-enable -->
</template>
