<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { computed, watch } from 'vue';


const contentStore = useContentStore();
const formStore = useFormStore();
const modelId = 'paymentCheckbox';
const isChecked = computed(() => contentStore.getUseResidenceAddress);

const inputField = contentStore.getInput(modelId);

const residenceAddress = computed(() => formStore.getResidenceAddress);
const residenceAddressSecondary = computed(() => formStore.getResidenceAddressSecondary);
const residenceCity = computed(() => formStore.getResidenceCity);
const residenceState = computed(() => formStore.getState('residence'));
const residenceZip = computed(() => formStore.getResidenceZip);
const residenceCountry = computed(() => formStore.getResidenceCountry);

const handleChecked = (data) => {
  // If we are modifying our residence address while this is checked, we do not need to check again
  if (data) {
    contentStore.setUseResidenceAddress(data.target.checked);
  }
  if (isChecked.value) {
    formStore.setAddress('billing', residenceAddress.value);
    formStore.setAddressSecondary('billing', residenceAddressSecondary.value);
    formStore.setCity('billing', residenceCity.value);
    formStore.setState('billing', residenceState.value);
    formStore.setCountry('billing', residenceCountry.value);
    formStore.setZip('billing', residenceZip.value);
  } else {
    formStore.setAddress('billing', null);
    formStore.setAddressSecondary('billing', null);
    formStore.setCity('billing', null);
    formStore.setState('billing', null);
    formStore.setZip('billing', null);
    const country = formStore.getResidenceCountry === 'USA' ? 'USA' : null;
    formStore.setCountry('billing', country);
  }
};

const handleRowClick = () => {
  contentStore.setUseResidenceAddress(!isChecked.value);
  handleChecked();
};

// Watch for changes in all residence fields, and trigger handleChecked
watch([residenceAddress, residenceAddressSecondary, residenceCity, residenceState, residenceZip, residenceCountry], () => {
  handleChecked();
});
</script>

<template>
    <div v-if="isChecked && residenceAddress && residenceCity && residenceState && residenceZip">
      <p class="mb-2 font-bold">
        {{ residenceAddress }},
        <span v-if="residenceAddressSecondary">{{ residenceAddressSecondary }},</span>
        {{ residenceCity }},
        {{ residenceState }},
        {{ residenceZip }}
      </p>
    </div>
    <BaseCheckBox
        :id="inputField.id"
        :label="inputField.label"
        :checked="isChecked"
        :disabled="inputField.disabled"
        :required="inputField.required"
        @input="handleChecked"
        @row:clicked="handleRowClick"
    >
    </BaseCheckBox>
</template>
