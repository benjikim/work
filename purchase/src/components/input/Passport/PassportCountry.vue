<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { useAppDataStore } from 'src/store/modules/preloadedData.js';
import { useVuelidate } from '@vuelidate/core';
import { computed, reactive, watch } from 'vue';
import { required, helpers } from '@vuelidate/validators';

const contentStore = useContentStore();
const formStore = useFormStore();
const preloadedData = useAppDataStore();
const modelId = 'passportCountry';
const inputField = contentStore.getInput(modelId);

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
});

const state = reactive({
  [modelId]: '',
});

const validationMessages = {
  [modelId]: inputField?.messages?.validation,
};

const passportCountryName = computed(() => preloadedData.getCountryNameFromCode(formStore.getPassportCountry(props.index)));

const handleSelect = (html) => {
  formStore.setPassportCountry(html.getAttribute('data-val'), props.index);
  state[modelId] = html.getAttribute('data-name');
};

const isPassportKnown = computed(() => formStore.getPassportCheckbox(props.index));

const options = computed(() => Object.keys(preloadedData.getCountries).map(key => ({name: preloadedData.getCountries[key], code: key, })));

const rules = computed(() => {
  return {
    [modelId]: {
      required: helpers.withMessage(validationMessages[modelId].required, required),
    },
  };
});

const v$ = useVuelidate(rules, state);

const handleBlur = (inputStarted) => {
  if (inputStarted) {
    state[modelId] = '';
    formStore.setPassportCountry(null, props.index);
  }
  v$.value[modelId].$validate();
};

watch(() => passportCountryName.value, (newPassportCountryName) => {
  state[modelId] = newPassportCountryName;
});

</script>
<template>
  <BaseFormAutoComplete 
    :id="`${inputField.id}-${props.index}`"
    v-model="state[modelId]"
    :value="passportCountryName"
    :hint="inputField.hint"
    :label="inputField.label"
    :disabled="isPassportKnown"
    :required="inputField.required"
    :placeholder="inputField.placeholder"
    :errors="v$[modelId]?.$errors.map(error => error.$message)"
    :type="inputField.type"
    :options="options"
    @update:select="handleSelect"
    @update:blur="handleBlur"
  >
  </BaseFormAutoComplete>
</template>
