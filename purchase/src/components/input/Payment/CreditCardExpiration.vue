<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, helpers } from '@vuelidate/validators';
import dayjs from 'dayjs';

const contentStore = useContentStore();
const formStore = useFormStore();
const modelId = 'creditCardExpiry';

const inputField = contentStore.getInput(modelId);

const state = reactive({
  [modelId]: '',
});

const validationMessages = {
  [modelId]: inputField?.messages?.validation,
};

const rules = computed(() => {

  const expiryDateValidator = () => {
    const [month, year] = state[modelId].split('/').map(Number);

    return !(isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 0);
  };

  const cardExpiredValidator = () => {
    // We only want to display 1 error at a time, so we check to see if our other validation is true
    if (expiryDateValidator()) {
      const [month, year] = state[modelId].split('/').map(Number);

      // Get the current year and month
      const currentYear = dayjs().year();
      const currentMonth = dayjs().month() + 1; // Months are zero-based so we add 1

      // Check if the year is in the past or if it's the current year but the month is in the past
      return year > currentYear || (year === currentYear && month >= currentMonth);
    }

    return true;
  };

  return {
    [modelId]: {
      required: helpers.withMessage(validationMessages[modelId].required, required),
      minLength: helpers.withMessage(validationMessages[modelId].minLength, minLength(7)),
      validExpiry: helpers.withMessage(validationMessages[modelId].validExpiry, expiryDateValidator),
      cardExpired: helpers.withMessage(validationMessages[modelId].cardExpired, cardExpiredValidator),
    },
  };
});

const handleBlur = (data) => {
  state[modelId] = data;
  v$.value[modelId].$validate();
  if (!v$.value[modelId].$error) {
    formStore.setCreditCardExpiry(data);
  } else {
    formStore.setCreditCardExpiry(null);
  }
};

// Only display one error.
const errors = computed(() => {
  const errors = v$.value[modelId]?.$errors.map(error => error.$message);
  return errors.slice(0,1);
})

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
    :errors="errors"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
    :mask="inputField.mask"
    @update:blur="handleBlur"
  >
  </BaseFormTextInput>
</template>
