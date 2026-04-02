<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { DATE_FORMAT } from 'src/config/index.js';
import dayjs from 'dayjs';

const contentStore = useContentStore();
const formStore = useFormStore();
const modelId = 'firstTripPaymentDate';

const inputField = contentStore.getInput(modelId);
const initialValue = computed(() => formStore.getInitialTripPaymentDate);

const state = reactive({
  [modelId]: formStore.getInitialTripPaymentDate,
});

const validationMessages = {
  [modelId]: inputField?.messages?.validation,
};

const rules = computed(() => {
  // MaxDate Tomorrows date
  const validateMaxDate = () => {
    const today = dayjs().startOf('day');
    const tomorrow = today.add(1, 'day');
    const format = DATE_FORMAT.INPUT_FIELD;
    const date = dayjs(state[modelId], {format,});

     // If an invalid date was entered, return true
     if (!dayjs(state[modelId], {format,}, true).isValid()) {
      return true;
    }

    return date.isBefore(tomorrow);
  };

  // MinDate Five years ago from tomorrows date
  const validateMinDate = () => {
    const today = dayjs().startOf('day');
    const tomorrow = today.add(1, 'day');
    const format = DATE_FORMAT.INPUT_FIELD;
    const date = dayjs(state[modelId], {format,});

    // If an invalid date was entered, return true
    if (!dayjs(state[modelId], {format,}, true).isValid()) {
      return true;
    }

    const minDate = tomorrow.subtract(5, 'year');
    return date.isAfter(minDate);
  };

  const validDate = () => {
    // If an incomplete date was entered, return true
    if (!state[modelId]) {
      return true;
    }

    const format = DATE_FORMAT.INPUT_FIELD;
    const date = dayjs(state[modelId], {format,});

    return dayjs(date, {format,}).isValid();
  };

  return {
    [modelId]: {
      required: helpers.withMessage(validationMessages[modelId].required, required),
      minDate: helpers.withMessage(validationMessages[modelId].minDate, validateMinDate),
      maxDate: helpers.withMessage(validationMessages[modelId].maxDate, validateMaxDate),
      validDate: helpers.withMessage(validationMessages[modelId].validDate, validDate),
    },
  };
});

const handleBlur = (data) => {
  state[modelId] = data;
  v$.value[modelId].$validate();
  if (v$.value[modelId].$error) {
    formStore.setInitialTripPaymentDate(null);
  } else {
    formStore.setInitialTripPaymentDate(data);
  }
};

const handleFocus = () => {
  formStore.setInitialTripPaymentDate(null);
};

const v$ = useVuelidate(rules, state);

</script>
<template>
  <BaseFormTextInput
    :id="inputField.id"
    v-model="state[modelId]"
    :value="initialValue"
    :hint="inputField.hint"
    :label="inputField.label"
    :disabled="inputField.disabled"
    :required="inputField.required"
    :errors="v$[modelId]?.$errors.map(error => error.$message)"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
    :mask="inputField.mask"
    @update:blur="handleBlur"
    @update:focus="handleFocus"
  >
  </BaseFormTextInput>
</template>
