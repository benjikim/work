<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { reactive, computed } from 'vue';
import { useAppDataStore } from 'src/store/modules/preloadedData.js';
import { useApiStore } from 'src/store/modules/api.js';
import { event } from 'vue-gtag';


const apiStore = useApiStore();
const contentStore = useContentStore();
const formStore = useFormStore();
const preloadedData = useAppDataStore();
const modelId = 'cruiseLine';

const inputField = contentStore.getInput(modelId);
const cruiseline = computed(() => formStore.getCruiseLine);

const supplierData = preloadedData.getCruiselines;

// Set default value to the 'None' entry
const noneEntry = Object.keys(supplierData).find(key => supplierData[key] === 'None');
if (!cruiseline.value && noneEntry) {
  formStore.setCruiseLine(noneEntry);
}

if (!noneEntry) {
  contentStore.setFieldsetOptional('form-travel-suppliers', false);
}

const state = reactive({
  [modelId]: formStore.getCruiseLine,
});

const handleSelect = (data) => {
  state[modelId] = data;
  formStore.setCruiseLine(data);
  event('additional_trip_options', {
    hierarchical_layer_1: 'Trip Options Cruise Selected',
    hierarchical_layer_2: supplierData[data.value]
  });
};

const cruiseLineOptions = computed(() => {
  const cruiseList = {...preloadedData.getCruiselineOptions};
  const isNWCruisePlan = apiStore.isNWCruisePlan();
  
  // This is removing Other for Nation Wide Cruise Plans. 
  if (isNWCruisePlan) {  
    const keyIndex = Object.keys(cruiseList?.groups[0]?.items).filter(key => cruiseList.groups[0].items[key] === 'Other').pop();
    if (keyIndex) {
      delete cruiseList.groups[0].items[keyIndex];
    }
  }
  return cruiseList;
})

</script>
<template>
  <BaseFormDropDownInput
    :id="inputField.id"
    v-model="state[modelId]"
    :value="cruiseline"
    :hint="inputField.hint"
    :label="inputField.label"
    :disabled="inputField.disabled"
    :required="!noneEntry || inputField.required"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
    :options="cruiseLineOptions"
    @update:select="handleSelect"
  >
  </BaseFormDropDownInput>
</template>
