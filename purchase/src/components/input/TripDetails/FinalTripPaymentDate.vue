<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { DATE_FORMAT } from 'src/config/index.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import dayjs from 'dayjs';

dayjs.extend(isSameOrBefore);

const props = defineProps({
  minDate: {
      type: [String, null],
      default: null,
      required: true,
  },
});

const contentStore = useContentStore();
const formStore = useFormStore();
const modelId = 'finalTripPaymentDate';

const inputField = contentStore.getInput(modelId);

const state = reactive({
  [modelId]: '',
});

const validationMessages = {
  [modelId]: inputField?.messages?.validation,
};

const rules = computed(() => {
  // MaxDate 10 years from today
  const validateMaxDate = () => {
    const today = dayjs().startOf('day');;
    const maxDate = today.add(10, 'year');
    const format = DATE_FORMAT.INPUT_FIELD;
    const date = dayjs(state[modelId], {format,});

    // If an invalid date was entered, return true
    if (!dayjs(state[modelId], {format,}, true).isValid()) {
      return true;
    }

    return date.isBefore(maxDate);
  };

  // MinDate 5 years ago from tomorrow
  const validateMinDate = () => {
    const today = dayjs().startOf('day');;
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

  const validateAfterPropMindate = () => {
    if (!props.minDate) {
      return true;
    }

    const date = dayjs(state[modelId], DATE_FORMAT.INPUT_FIELD);

    // If an invalid date was entered, return true
    if (!dayjs(state[modelId], DATE_FORMAT.INPUT_FIELD, true).isValid()) {
      return true;
    }

    const providedDate = dayjs(props.minDate, DATE_FORMAT.INPUT_FIELD);

    return providedDate.isSameOrBefore(date);
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
      afterPropDate: helpers.withMessage(validationMessages[modelId].afterFirstPayment, validateAfterPropMindate),
      validDate: helpers.withMessage(validationMessages[modelId].validDate, validDate),
    },
  };
});

const handleBlur = (data) => {
  state[modelId] = data;
  v$.value[modelId].$validate();
  if (v$.value[modelId].$error) {
    formStore.setFinalTripPaymentDate(null);
  } else {
    formStore.setFinalTripPaymentDate(data);
  }

};

const handleFocus = () => {
  formStore.setFinalTripPaymentDate(null);
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
    @update:focus="handleFocus"
  >
  </BaseFormTextInput>
</template>
