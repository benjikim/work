<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { computed } from 'vue';


const contentStore = useContentStore();
const formStore = useFormStore();

const modelId = contentStore.isThemeSoventure
    ? 'marketingOptInSoventureCheckbox'
    : 'marketingOptInCheckbox';

const marketingCheckbox = computed(() => formStore.getMarketingOptIn);
const inputField = contentStore.getInput(modelId);

const handleChecked = (data) => {
    formStore.setMarketingOptIn(data.target.checked);
};

const handleRowClick = () => {
    formStore.setMarketingOptIn(!marketingCheckbox.value);
};

</script>

<template>
    <div class="marketing-opt-in">
        <BaseCheckBox
            :id="inputField.id"
            :label="inputField.label"
            :checked="marketingCheckbox"
            :disabled="inputField.disabled"
            :required="inputField.required"
            @input="handleChecked"
            @row:clicked="handleRowClick"
        >
        </BaseCheckBox>
    </div>

</template>

<style lang="scss" scoped>
.marketing-opt-in {
    display: flex;
    flex-direction: row;
    align-items: center;

    label {
      white-space: normal;
      display: block;
    }
}
</style>
