
<script setup lang="ts">
import Select from 'primevue/select';
import CheckIcon from '@/assets/images/ProgressIndicatorIcon.svg';
import { computed } from 'vue';
import { useContentStore } from '@/store/content';
import { useFormStore } from '../store/form';
import { useThemeStore } from '@/store/theme';

const props = defineProps<{
  modelValue: number | null,
  invalid?: boolean,
  errorMessage?: string,
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>();

function onUpdateValue(value: number | null) {
  if (value) {
    formStore.setNumberOfTravelers(value);
  }
  emits('update:modelValue', value);
}

const contentStore = useContentStore();
const formStore = useFormStore();
const themeStore = useThemeStore();

// Check to make sure each age input has been filled out - the input itself will validate that it is a valid age
const isValid = computed(() => {
  const count = props.modelValue;
  if (!count || count <= 0) return false;

  const travelers = formStore.getTravelers ?? [];
  if (travelers.length < count) return false;

  for (let i = 0; i < count; i++) {
    const t = travelers[i];
    if (!t || String(t).trim() === '') return false;
  }

  return true;
});
</script>

<template>
  <div class="flex flex-col w-full md:w-auto">
    <label class="text-sm pb-[6px]">{{ contentStore.getQuoteFormContentByKey('traveler_info').number_of_travelers.placeholder }}</label>
    <div
      class="input-with-left-icon"
      :class="{ 'with-icon': isValid }"
    >
      <img
        v-if="isValid"
        :src="CheckIcon"
        class="left-icon"
        alt="valid"
      />
      <Select
        name="numberOfTravelers"
        :options="Array.from({ length: themeStore.getNumberOfTravelers }, (_, i) => i + 1)"
        :modelValue="modelValue"
        @update:modelValue="onUpdateValue"
        :class="{ 'p-invalid': invalid }"
        class="max-w-[155px] w-full md:w-[155px]"
        :disabled="themeStore.getNumberOfTravelers <= 1 ? true : false"
        data-cy="quote-form-select-travelers"
        :pt="{
            option: (options) => ({
                'data-cy': 'select-option-' + options.context.option
            })
          }"
      />
    </div>
  </div>
</template>
