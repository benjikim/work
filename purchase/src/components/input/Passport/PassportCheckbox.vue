<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import BaseCheckBox from '../../base/BaseCheckBox.vue';
import { computed } from 'vue';


const contentStore = useContentStore();
const formStore = useFormStore();
const modelId = 'passportCheckbox';

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
});

const passportCheckbox = computed(() => formStore.getPassportCheckbox(props.index) );

const inputField = contentStore.getInput(modelId);

const handleChecked = (data) => {
    formStore.setPassportCheckbox(data.target.checked, props.index);
};

const handleRowClick = () => {
    formStore.setPassportCheckbox(!passportCheckbox.value, props.index);
};
</script>

<template>
    <BaseCheckBox
        :id="`${inputField.id}-${props.index}`"
        :label="inputField.label"
        :checked="passportCheckbox"
        :disabled="inputField.disabled"
        :required="inputField.required"
        @input="handleChecked"
        @row:clicked="handleRowClick"
    >
    </BaseCheckBox>
</template>