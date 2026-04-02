<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { reactive, computed } from 'vue';
import { useAppDataStore } from 'src/store/modules/preloadedData.js';
import { event } from 'vue-gtag';


const contentStore = useContentStore();
const formStore = useFormStore();
const preloadedData = useAppDataStore();
const modelId = 'tourOperator';

const inputField = contentStore.getInput(modelId);
const tourOperator = computed(() => formStore.getTourOperator);

const supplierData = preloadedData.getTourOperators;

// Set default value to the 'None' entry
const noneEntry = Object.keys(supplierData).find(key => supplierData[key] === 'None');
if (!tourOperator.value && noneEntry) {
  formStore.setTourOperator(noneEntry);
}

const state = reactive({
  [modelId]: formStore.getTourOperator,
});

if (!noneEntry) {
  contentStore.setFieldsetOptional('form-travel-suppliers', false);
}

const handleSelect = (data) => {
  state[modelId] = data;
  formStore.setTourOperator(data);
  event('additional_trip_options', {
    hierarchical_layer_1: 'Trip Options Tour Selected',
    hierarchical_layer_2: supplierData[data.value]
  });
};

</script>
<template>
  <BaseFormDropDownInput
    :id="inputField.id"
    v-model="state[modelId]"
    :value="tourOperator"
    :hint="inputField.hint"
    :label="inputField.label"
    :disabled="inputField.disabled"
    :required="!noneEntry || inputField.required"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
    :options="preloadedData.getTourOperatorOptions"
    @update:select="handleSelect"
  >
  </BaseFormDropDownInput>
</template>
