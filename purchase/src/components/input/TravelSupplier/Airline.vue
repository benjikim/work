<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { reactive, computed } from 'vue';
import { useAppDataStore } from 'src/store/modules/preloadedData.js';
import { event } from 'vue-gtag';

const contentStore = useContentStore();
const formStore = useFormStore();
const preloadedData = useAppDataStore();
const modelId = 'airline';


const supplierData = preloadedData.getAirlines;

// Set default value to the 'None' entry
const airline = computed(() => formStore.getAirline);
const noneEntry = Object.keys(supplierData).find(key => supplierData[key] === 'None');
if (!airline.value && noneEntry) {
  formStore.setAirline(noneEntry);
}

if (!noneEntry) {
  contentStore.setFieldsetOptional('form-travel-suppliers', false);
}

const inputField = contentStore.getInput(modelId);

const state = reactive({
  [modelId]: formStore.getAirline,
});

const handleSelect = (data) => {
  state[modelId] = data;
  formStore.setAirline(data);
  event('additional_trip_options', {
    hierarchical_layer_1: 'Trip Options Airline Selected',
    hierarchical_layer_2: supplierData[data.value]
  });
};

</script>

<template>
  <BaseFormDropDownInput
    :id="inputField.id"
    v-model="state[modelId]"
    :value="airline"
    :hint="inputField.hint"
    :label="inputField.label"
    :disabled="inputField.disabled"
    :required="!noneEntry || inputField.required"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
    :options="preloadedData.getAirlineOptions"
    @update:select="handleSelect"
  >
  </BaseFormDropDownInput>
</template>
