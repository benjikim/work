<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { computed } from 'vue';

const contentStore = useContentStore();
const modelId = 'tripCost';

const inputField = contentStore.getInput(modelId);

const tripCost = computed(() => {
  const quoteDetails = contentStore.getQuoteDetails;
  return quoteDetails?.tripCost;
});

</script>
<template>
  <BaseFormTextInput
    :id="inputField.id"
    :value="tripCost"
    :hint="inputField.hint"
    :label="inputField.label"
    :required="inputField.required"
    :read-only="inputField.readOnly"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
    :mask="inputField.mask"
    :disabled="inputField.disabled"
  >
  </BaseFormTextInput>
</template>
