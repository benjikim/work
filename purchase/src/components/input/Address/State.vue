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

  displayCountry: {
    type: String,
    default: '',
  },
});

const contentStore = useContentStore();
const formStore = useFormStore();
const preloadedData = useAppDataStore();

const inputField = contentStore.getInput(props.modelId);
const value = computed(() => formStore.getState(props.type));

const state = reactive({
  [props.modelId]: value,
});

const validationMessages = {
  [props.modelId]: inputField?.messages?.validation,
};

const options = computed(() => {
  if (props.displayCountry === 'USA') {
    return preloadedData.getUnitedStateAndTerritories;
  } else if (props.displayCountry === 'CAN') {
    return preloadedData.getCanadaProvinces;
  } else {
    return preloadedData.getStateProvinceList;
  }
});

const rules = computed(() => {
  return {
    [props.modelId]: {
      required: helpers.withMessage(validationMessages[props.modelId].required, required),
    },
  };
});

const handleSelect = (code) => {
  formStore.setState(props.type, code);
};

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
    :options="options"
    @update:select="handleSelect"
    @update:blur="handleBlur"
  >
  </BaseFormDropDownInput>
</template>
