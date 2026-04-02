<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { computed } from 'vue';

const contentStore = useContentStore();
const modelId = 'destination';

const inputField = contentStore.getInput(modelId);

const value = computed(() => {
  const quoteDetails = contentStore.getQuoteDetails;
  return quoteDetails?.destination;
});


</script>
<template>
  <BaseFormTextInput
    :id="inputField.id"
    :value="value"
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
