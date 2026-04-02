<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { computed } from 'vue';

const props = defineProps({
  /**
   * ModelId to determine what content to display
   */
   modelId: {
    type: String,
    required: true,
  },
  /**
   * Key used to determine billing or residence
   */
  type: {
    type: String,
    required: true,
  },
});

const contentStore = useContentStore();
const formStore = useFormStore();

const inputField = contentStore.getInput(props.modelId);
const value = computed(() => formStore.getState(props.type));

</script>
<template>
  <BaseFormTextInput
    :id="inputField.id"
    :value="value"
    :hint="inputField.hint"
    :label="inputField.label"
    :disabled="inputField.disabled"
    :required="inputField.required"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
  >
  </BaseFormTextInput>
</template>
