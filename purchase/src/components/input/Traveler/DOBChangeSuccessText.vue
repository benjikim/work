<script setup>
import { useContentStore } from 'src/store/modules/content.js';

const contentStore = useContentStore();
const inputField = contentStore.getInput('DOBChangeMessages');

</script>
<template>
  <p :class="`md:pt-5 md: pl-3 text-[#212629]`">{{ inputField.success }}</p>
</template>
