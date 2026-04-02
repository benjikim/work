<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, helpers } from '@vuelidate/validators';

const contentStore = useContentStore();
const formStore = useFormStore();
const props = defineProps({
  /**
   * ModelId to determine what content to display
   */
   modelId: {
    type: String,
    required: true,
  },
  /**
   * Index used to determine which traveler
   */
  index: {
    type: Number,
    required: true,
  },
});

const inputField = contentStore.getInput(props.modelId);
const value = computed(() => formStore.getTravelerDob(props.index));

const state = reactive({
  [props.modelId]: '',
});

const validationMessages = {
  [props.modelId]: inputField?.messages?.validation,
};

const rules = computed(() => {
  return {
    [props.modelId]: {
      required: helpers.withMessage(validationMessages[props.modelId].required, required),
      minLength: helpers.withMessage(validationMessages[props.modelId].minLength, minLength(10)),
      maxValue: helpers.withMessage(validationMessages[props.modelId].maxValue, value => new Date(value) > new Date().setFullYear(new Date().getFullYear() - 100)),
      minValue:  helpers.withMessage(validationMessages[props.modelId].minValue, value => new Date(value) < new Date().setFullYear(new Date().getFullYear())),
    },
  };
});

const handleBlur = (data) => {
  state[props.modelId] = data;
  v$.value[props.modelId].$validate();
  if (!v$.value[props.modelId].$error) {
    formStore.setTravelerDOB(data, props.index);
  } else {
    formStore.setTravelerDOB(null, props.index);
  }
};

const v$ = useVuelidate(rules, state);

</script>
<template>
  <BaseFormTextInput
    :id="`${inputField.id}-${props.index}`"
    v-model="state[props.modelId]"
    :value="value"
    :hint="inputField.hint"
    :label="inputField.label"
    :disabled="inputField.disabled"
    :required="inputField.required"
    :errors="v$[props.modelId]?.$errors.map(error => error.$message)"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
    :mask="inputField.mask"
    @update:blur="handleBlur"
  >
  </BaseFormTextInput>
</template>
