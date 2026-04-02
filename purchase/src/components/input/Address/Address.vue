<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { ccAdjacentNumPattern } from '/src/utility/index.js';
import { required, minLength, helpers } from '@vuelidate/validators';

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

const inputField = contentStore.getInput(props.modelId);
const value = computed(() => formStore.getAddress(props.type));

const state = reactive({
  [props.modelId]: '',
});

const validationMessages = {
  [props.modelId]: inputField?.messages?.validation,
};

const addressFormat = (address) => {
  const regex = new RegExp(/([a-zA-Z].|.[a-zA-Z])/);
  return regex.test(address);
};

const rules = computed(() => {
  return {
    [props.modelId]: {
      required: helpers.withMessage(validationMessages[props.modelId].required, required),
      minLength: helpers.withMessage(validationMessages[props.modelId].minLength, minLength(3)),
      format: helpers.withMessage(validationMessages[props.modelId].adjacentNumsAddress, addressFormat),
      sixteenAdjacentNumbers: helpers.withMessage(validationMessages[props.modelId].adjacentNumsAddress, ccAdjacentNumPattern),
    },
  };
});

const handleBlur = (data) => {
  state[props.modelId] = data;
  v$.value[props.modelId].$validate();
  if (!v$.value[props.modelId].$error) {
    formStore.setAddress(props.type, data);
  } else {
    formStore.setAddress(props.type, null);
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
    @update:blur="handleBlur"
  >
  </BaseFormTextInput>
</template>
