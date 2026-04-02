<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, helpers } from '@vuelidate/validators';

const contentStore = useContentStore();
const formStore = useFormStore();
const modelId = 'creditCardCVV';

const inputField = contentStore.getInput(modelId);

const state = reactive({
  [modelId]: '',
});

const validationMessages = {
  [modelId]: inputField?.messages?.validation,
};

const rules = computed(() => {
  return {
    [modelId]: {
      required: helpers.withMessage(validationMessages[modelId].required, required),
      minLength: helpers.withMessage(validationMessages[modelId].minLength, minLength(3)),
    },
  };
});

const handleBlur = (data) => {
  state[modelId] = data;
  v$.value[modelId].$validate();
  if (!v$.value[modelId].$error) {
    formStore.setCreditCardCVV(data);
  } else {
    formStore.setCreditCardCVV(null);
  }
};

const v$ = useVuelidate(rules, state);

</script>
<template>
  <BaseFormTextInput
    :id="inputField.id"
    v-model="state[modelId]"
    :value="state[modelId]"
    :hint="inputField.hint"
    :label="inputField.label"
    :disabled="inputField.disabled"
    :required="inputField.required"
    :errors="v$[modelId]?.$errors.map(error => error.$message)"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
    :mask="inputField.mask"
    @update:blur="handleBlur"
  >
  </BaseFormTextInput>
</template>
