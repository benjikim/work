<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { reactive, computed } from 'vue';

const contentStore = useContentStore();
const formStore = useFormStore();
const props = defineProps({
  /**
   * ModelId to determine what content to display
   */
  modelId: {
    type: String,
    required: true,
  },
  /**
   * Index used to determine which traveler
   */
  index: {
    type: Number,
    required: true,
  },
});

const inputField = contentStore.getInput(props.modelId);
const value = computed(() => formStore.getTravelerMiddleInitial(props.index));

const state = reactive({
  [props.modelId]: '',
});

const handleBlur = (data) => {
  state[props.modelId] = data;
  formStore.setTravelerMiddleInitial(data, props.index);
};

</script>
<template>
  <BaseFormTextInput
    :id="`${inputField.id}-${props.index}`"
    v-model="state[props.modelId]"
    :value="value"
    :hint="inputField.hint"
    :label="inputField.label"
    :disabled="inputField.disabled"
    :required="inputField.required"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
    :mask="inputField.mask"
    @update:blur="handleBlur"
  >
  </BaseFormTextInput>
</template>
