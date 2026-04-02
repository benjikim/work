<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { useAppDataStore } from 'src/store/modules/preloadedData.js';
import { computed } from 'vue';

const contentStore = useContentStore();
const formStore = useFormStore();
const preloadedData = useAppDataStore();

const modelId = 'residenceCitizenship';

const inputField = contentStore.getInput(modelId);
const value = computed(() => formStore.getResidenceCitizenship);

const handleSelect = (code) => {
  formStore.setResidenceCitizenship(code);
};

</script>
<template>
  <BaseFormDropDownInput
    :id="inputField.id"
    :value="value"
    :hint="inputField.hint"
    :label="inputField.label"
    :disabled="inputField.disabled"
    :required="inputField.required"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
    :options="preloadedData.getCountries"
    @update:select="handleSelect"
  >
  </BaseFormDropDownInput>
</template>
