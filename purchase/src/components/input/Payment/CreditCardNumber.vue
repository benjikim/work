<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { KNOWN_CREDIT_CARD_TYPES } from 'src/config/index.js';
import ccValidator from 'card-validator';

const contentStore = useContentStore();
const formStore = useFormStore();
const modelId = 'creditCardNumber';

const inputField = contentStore.getInput(modelId);
const state = reactive({
  [modelId]: '',
});

const validationMessages = {
  [modelId]: inputField?.messages?.validation,
};

const allowedCreditCardTypes = computed(() => formStore.getAcceptedCreditCards);

const rules = computed(() => {
  /**
   * Check that the credit card type is allowed
   */
  const ccTypeIsValid = () => {
    const ccValidationData = ccValidator.number(state[modelId]);
    const ccList = allowedCreditCardTypes.value.map(type => KNOWN_CREDIT_CARD_TYPES[type]);

    return ccList.includes(ccValidationData.card.type);
  };

  /**
   * Check that the credit card number is valid
   */
  const ccNumberIsValid = () => {
    const ccValidationData = ccValidator.number(state[modelId]);
    return ccValidationData.isValid;
  };

  return {
    [modelId]: {
      required: helpers.withMessage(validationMessages[modelId].required, required),
      validCardNumber: helpers.withMessage(validationMessages[modelId].validCardNumber, ccNumberIsValid),
      validCardType: helpers.withMessage(
        validationMessages[modelId].validCardType(allowedCreditCardTypes.value.join(', ')),
        ccTypeIsValid
      ),
    },
  };
});

const handleBlur = (data) => {
  state[modelId] = data;

  v$.value[modelId].$validate();
  if (!v$.value[modelId].$error) {
    formStore.setCreditCardNumber(data);
  } else {
    formStore.setCreditCardNumber(null);
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
