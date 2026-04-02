<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { reactive } from 'vue';
import { useAppDataStore } from 'src/store/modules/preloadedData.js';

const contentStore = useContentStore();
const formStore = useFormStore();
const preloadedData = useAppDataStore();
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

const state = reactive({
  [props.modelId]: '',
});



const handleSelect = (data) => {
  state[props.modelId] = data;
  formStore.setTravelerSuffix(data, props.index);
};

</script>
<template>
  <BaseFormDropDownInput
    :id="`${inputField.id}-${props.index}`"
    :value="state[props.modelId]"
    :hint="inputField.hint"
    :label="inputField.label"
    :disabled="inputField.disabled"
    :required="inputField.required"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
    :options="preloadedData.getSuffixTypes"
    @update:select="handleSelect"
  >
  </BaseFormDropDownInput>
</template>
