<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { useAppDataStore } from 'src/store/modules/preloadedData.js';
import { computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength, helpers } from '@vuelidate/validators';

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
const appDataStore = useAppDataStore();

const inputField = contentStore.getInput(props.modelId);
const value = computed(() => formStore.getZip(props.type));
const country = computed(() => formStore.getCountry(props.type));
const countryDisplayName = computed(() => appDataStore.getCountryNameFromCode(country.value));

const state = reactive({
  [props.modelId]: '',
});

const validationMessages = {
  [props.modelId]: inputField?.messages?.validation,
};

const getMaxLength = computed(() => {
  if (country.value === 'USA') {
    return 10;
  } else if (country.value === 'CAN') {
    return 7;
  }
  return 12;
});

/**
 * Format Validation for CAN Zip.
 *
 * @param {String} zip
 *
 * @return {Boolean}
 */
const zipFormatCanada = (zip) => {
  const regex = new RegExp(/^[a-zA-Z]\d[a-zA-Z] ?\d[a-zA-Z]\d$/);
  return regex.test(zip);
};

/**
 * Format Validation for USA Zip.
 *
 * @param {String} zip
 *
 * @return {Boolean}
 */
const zipFormatUSA = (zip) => {
  const regex = new RegExp(/^\d{5}(-?\d{4})?$/);
  return regex.test(zip);
};

/**
 * Format Validation for non usa nor canada Zip.
 *
 * @param {String} zip
 *
 * @return {Boolean}
 */
const zipFormatOther = (zip) => {
  const regex = new RegExp(/^[a-zA-Z0-9\s\\-]*$/);
  return regex.test(zip);
};

const rules = computed(() => {
  const obj = {
    [props.modelId]: {
      required: helpers.withMessage(validationMessages[props.modelId].required, required),
      minLength: helpers.withMessage(validationMessages[props.modelId].minLength(3), minLength(3)),
      maxLength: helpers.withMessage(validationMessages[props.modelId].maxLength(12), maxLength(12)),
    },
  };

  // Dynamically adding validations based on country value.
  const countryMessage = validationMessages[props.modelId].zipFormat(countryDisplayName.value);
  
  if (country.value === 'CAN') {  
    obj[props.modelId].zipFormatCanada = helpers.withMessage(countryMessage, zipFormatCanada);
    obj[props.modelId].minLength = helpers.withMessage(validationMessages[props.modelId].minLength(6), minLength(6)),
    obj[props.modelId].maxLength = helpers.withMessage(validationMessages[props.modelId].maxLength(7), maxLength(7));
  } else if (country.value === 'USA') {
    obj[props.modelId].zipFormatUSA = helpers.withMessage(countryMessage, zipFormatUSA);
    obj[props.modelId].minLength = helpers.withMessage(validationMessages[props.modelId].minLength(5), minLength(5)),
    obj[props.modelId].maxLength = helpers.withMessage(validationMessages[props.modelId].maxLength(10), maxLength(10));
  } else {
    obj[props.modelId].zipFormatOther = helpers.withMessage(countryMessage, zipFormatOther);
  }
  
  return obj;
});

const mask = computed(() => {
  if (country.value === 'USA') {
    return inputField.maskUSA;
  } else if (country.value === 'CAN') {
    return inputField.maskCAN;
  }
  return null;
});

const handleBlur = (data) => {
  state[props.modelId] = data;
  v$.value[props.modelId].$validate();
  if (!v$.value[props.modelId].$error) {
    formStore.setZip(props.type, data);
  } else {
    formStore.setZip(props.type, null);
  }
};

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
    :maxlength="getMaxLength"
    :mask="mask"
    @update:blur="handleBlur"
  >
  </BaseFormTextInput>
</template>
