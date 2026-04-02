<script setup lang="ts">
  import Autocomplete, {
    type AutoCompleteOptionSelectEvent,
  } from 'primevue/autocomplete';
  import { useContentStore } from '@/store/content';
  import { computed, ref, watch } from 'vue';
  import { useFormStore } from '@/store/form';
  import CheckIcon from '@/assets/images/ProgressIndicatorIcon.svg';
  import AutoCompleteFilter from '@/utils/autoComplete';
  import type { DataItem } from '@/utils/autoComplete';
  import { sendGtagEvent } from '@/utils/analytics';
  import { XCircleIcon } from '@heroicons/vue/24/outline';

  const props = defineProps<{
    isValid: boolean;
  }>();

  const emits = defineEmits<{
    (e: 'update:citizenship', value: string | null): void;
    (e: 'update:citizenshipFocus'): void;
  }>();

  const contentStore = useContentStore();
  const formStore = useFormStore();
  const citizenshipOptions = computed(() => contentStore.getCitizenshipList);

  const state = ref({
    selectedOption: null as { code: string; value: string } | null,
    initializedCitizenshipBlur: false,
    autoCompleteFilterCitizenship: null as AutoCompleteFilter | null,
    // Filtered options for autocomplete (kept in sync with store)
    filteredOptions: [] as Array<{ code: string; value: string }>,
  });

  const onBlur = () => {
    emits('update:citizenshipFocus');
    state.value.initializedCitizenshipBlur = true;
  };

  const onCitizenshipUpdate = (v: any) => {
    if (v === null || v === '') {
      formStore.setCitizenship(null);
      state.value.selectedOption = null;
      emits('update:citizenship', null);
      return;
    }
    if (v?.code) {
      formStore.setCitizenship(v?.code);
      state.value.selectedOption = v;
      emits('update:citizenship', v?.code);
    }
  };
  // keep filteredOptions in sync with the source list
  watch(
    citizenshipOptions,
    (val) => {
      if (val?.length) {
        // Deep clone to remove Vue reactivity (same as destination)
        const data: DataItem[] = JSON.parse(JSON.stringify(val));
        state.value.autoCompleteFilterCitizenship = new AutoCompleteFilter(
          data
        );

        // initial suggestions
        state.value.filteredOptions = data;
      }
    },
    { immediate: true }
  );

  // Filter options as user types
  const onComplete = (event: { query: string }) => {
    if (state.value.autoCompleteFilterCitizenship) {
      state.value.filteredOptions = generateCitizenshipSuggestions(
        event?.query?.trim(),
        // cast to the expected type to avoid structural mismatch errors
        state.value
          .autoCompleteFilterCitizenship as unknown as AutoCompleteFilter
      );
    }
  };

  const generateCitizenshipSuggestions = (
    search: string,
    autoComplete: AutoCompleteFilter | null
  ): DataItem[] => {
    if (!autoComplete) return [];

    const results = autoComplete
      .setQuery(search)
      .filterSuggestions()
      .sortSuggestionsByQuality();

    if (!search.toLowerCase().startsWith('s')) {
      results.prioritizeCode('USA');
    }

    return results.suggestions.slice(0, 6);
  };

  watch(
    [
      () => formStore.hasActiveQuote,
      () => formStore.getIsLoading,
      citizenshipOptions
    ],
    ([hasQuote, isLoading, options]) => {
      if (isLoading) return;
      if (!options?.length) return;

      if (hasQuote) {
        const citizenship = options.find(
          (ele) => ele.code === formStore.getCitizenshipCountry
        );
        if (citizenship) {
          onCitizenshipUpdate(citizenship);
          onBlur();
        }
      } else {
        // No active quote → default to USA
        const citizenship = citizenshipOptions.value.find(
          (ele) => ele.code === 'USA'
        );
        if (citizenship) {
          onCitizenshipUpdate(citizenship);
          onBlur();
        }
      }
    },
    { immediate: true }
  );

  const onSelectCitizenshipCountry = (v: AutoCompleteOptionSelectEvent) => {
    sendGtagEvent('citizenship_country_updated', [v.value?.value ?? null]);
  };
</script>

<template>
  <label class="text-sm">{{
    contentStore.getQuoteFormContentByKey('citizenship').placeholder
  }}</label>
  <div
    class="input-with-left-icon mt-[5px]"
    :class="{ 'with-icon': state.initializedCitizenshipBlur && isValid }"
  >
    <img
      v-if="state.initializedCitizenshipBlur && isValid"
      :src="CheckIcon"
      class="left-icon"
      alt="valid"
    />
    <Autocomplete
      v-model="state.selectedOption"
      @update:modelValue="onCitizenshipUpdate"
      :suggestions="state.filteredOptions"
      @option-select="onSelectCitizenshipCountry"
      @complete="onComplete"
      option-label="value"
      show-clear
      auto-option-focus
      fluid
      force-selection
      @hide="onBlur"
      @keydown.enter.prevent
      :invalid="!props.isValid"
      :pt="{
        pcInputText: {
          root: { 'data-cy': 'citizenship-input' },
        },
      }"
    >
      <template #option="{ option }">
        <div :data-cy="`citizenship-option-${option?.code}`">
          {{ option?.value }}
        </div>
      </template>
      <template #clearicon="slotProps">
        <XCircleIcon stroke-width="2" :class="['w-6 !right-2 !top-2/5 !text-[#D4D9DE]', (slotProps as any).class]" @click="slotProps.clearCallback" />
      </template>
    </Autocomplete>
  </div>
</template>
