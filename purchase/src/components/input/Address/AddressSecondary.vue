<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { reactive, computed } from 'vue';

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
const value = computed(() => formStore.getAddressSecondary(props.type));

const state = reactive({
  [props.modelId]: '',
});

const handleBlur = (data) => {
  state[props.modelId] = data;
  formStore.setAddressSecondary(props.type, data);
};

</script>
<template>
  <BaseFormTextInput
    :id="inputField.id"
    v-model="state[modelId]"
    :value="value"
    :hint="inputField.hint"
    :label="inputField.label"
    :disabled="inputField.disabled"
    :required="inputField.required"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
    @update:blur="handleBlur"
  >
  </BaseFormTextInput>
</template>
