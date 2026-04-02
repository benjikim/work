<script setup>
import { computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';

import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { useAppDataStore } from 'src/store/modules/preloadedData.js';

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
const preloadedData = useAppDataStore();

const inputField = contentStore.getInput(props.modelId);
const value = computed(() => formStore.getCountry(props.type));

const handleSelect = (code) => {
  formStore.setCountry(props.type, code);
};

const state = reactive({
  [props.modelId]: value,
});

const validationMessages = {
  [props.modelId]: inputField?.messages?.validation,
};

const rules = computed(() => {
  return {
    [props.modelId]: {
      required: helpers.withMessage(validationMessages[props.modelId].required, required),
    },
  };
});

const handleBlur = () => {
  v$.value[props.modelId].$validate();
};

const v$ = useVuelidate(rules, state);


</script>
<template>
  <BaseFormDropDownInput
    :id="inputField.id"
    v-model="state[modelId]"
    :value="value"
    :hint="inputField.hint"
    :label="inputField.label"
    :disabled="inputField.disabled"
    :required="inputField.required"
    :errors="v$[modelId]?.$errors.map(error => error.$message)"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
    :options="preloadedData.getCountries"
    @update:select="handleSelect"
    @update:blur="handleBlur"
  >
  </BaseFormDropDownInput>
</template>
