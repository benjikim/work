<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
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
   * Index used to determine which traveler
   */
  index: {
    type: Number,
    required: true,
  },
});

const contentStore = useContentStore();
const formStore = useFormStore();

const inputField = contentStore.getInput(props.modelId);
const value = computed(() => formStore.getTravelerFirstName(props.index));

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
      minLength: helpers.withMessage(validationMessages[props.modelId].minLength, minLength(1)),
      valid: helpers.withMessage(
        validationMessages[props.modelId].valid,
        helpers.regex(/^[A-Za-z ,.'-]+$/)
      ),
    },
  };
});

const handleBlur = (data) => {
  state[props.modelId] = data;
  v$.value[props.modelId].$validate();
  if (!v$.value[props.modelId].$error) {
    formStore.setTravelerFirstName(data, props.index);
  } else {
    formStore.setTravelerFirstName(null, props.index);
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
    @update:blur="handleBlur"
  >
  </BaseFormTextInput>
</template>
