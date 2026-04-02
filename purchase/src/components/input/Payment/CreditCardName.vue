<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { threeAdjacentNumPattern } from '/src/utility/index.js';
import { required, minLength, helpers } from '@vuelidate/validators';

const contentStore = useContentStore();
const formStore = useFormStore();
const modelId = 'creditCardName';

const inputField = contentStore.getInput(modelId);
const value = computed(() => formStore.getPaymentName);

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
        /** This was added due to users on prod putting their credit card info into billing name and the purchase not validating
        * Validates adjacent numbers to see if there are an excess of numbers potentially being a credit card 
        */
        threeAdjacentNumbers: helpers.withMessage(validationMessages[modelId].threeAdjacentNums, threeAdjacentNumPattern
      ),
    },
  };
});

const handleBlur = (data) => {
  state[modelId] = data;
  v$.value[modelId].$validate();
  if (!v$.value[modelId].$error) {
    formStore.setCreditCardName(data);
  } else {
    formStore.setCreditCardName(null);
  }
};

const v$ = useVuelidate(rules, state);

</script>
<template>
  <BaseFormTextInput
:id="inputField.id" v-model="state[modelId]" :value="value" :hint="inputField.hint"
    :label="inputField.label" :disabled="inputField.disabled" :required="inputField.required"
    :errors="v$[modelId]?.$errors.map(error => error.$message)" :placeholder="inputField.placeholder"
    :type="inputField.type" @update:blur="handleBlur">
  </BaseFormTextInput>
</template>
