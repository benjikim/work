<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, helpers } from '@vuelidate/validators';

import BaseFormTextInput from '../base/BaseFormTextInput.vue';

const contentStore = useContentStore();
const formStore = useFormStore();
const modelId = 'phoneNumber';

const inputField = contentStore.getInput(modelId);
const value = computed(() => formStore.getPhoneNumber);

const state = reactive({
  [modelId]: '',
  useInternationalMask: false,
});

const validationMessages = {
  [modelId]: inputField?.messages?.validation,
};

const rules = computed(() => {
  return {
    [modelId]: {
      required: helpers.withMessage(validationMessages[modelId].required, required),
      minLength: helpers.withMessage(validationMessages[modelId].minLength, minLength(10)),
    },
  };
});

const handleBlur = (data) => {
  state[modelId] = data;
  
  if (data.length > 10) {
    state.useInternationalMask = true;
  } else {
    state.useInternationalMask = false;
  }
  
  v$.value[modelId].$validate();
  if (!v$.value[modelId].$error) {
    formStore.setPhoneNumber(data);
  } else {
    formStore.setPhoneNumber(null);
  }
};

const handleFocus = () => {
  state.useInternationalMask = true;
};

const mask = computed(() => {
  if (state.useInternationalMask) {
    return inputField.internationalMask;
  }
  return inputField.domesticMask;
});

const v$ = useVuelidate(rules, state);

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
    :errors="v$[modelId]?.$errors.map(error => error.$message)"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
    :mask="mask"
    @update:blur="handleBlur"
    @update:focus="handleFocus"
  >
  </BaseFormTextInput>
</template>
