<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useFormStore } from 'src/store/modules/form.js';
import { computed } from 'vue';

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
const travelerAge = computed(() => formStore.getTravelerAge(props.index));

</script>

<template>
  <BaseFormTextInput
    :id="`${inputField.id}-${props.index}`"
    class="traveler-age-container"
    :value="travelerAge"
    :hint="inputField.hint"
    :label="inputField.label"
    :disabled="inputField.disabled"
    :required="inputField.required"
    :placeholder="inputField.placeholder"
    :type="inputField.type"
  >
  </BaseFormTextInput>
</template>

<style lang="scss" scoped>
.traveler-age-container {
  max-width: 70px;
}
</style>

