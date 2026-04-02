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

  defineOptions({
    inheritAttrs: false,
  });

  const props = defineProps<{
    isValid: boolean;
  }>();

  const emits = defineEmits<{
    (e: 'update:residence', value: string | null): void;
    (e: 'update:residenceState', value: string | null): void;
    (e: 'update:residenceFocus'): void;
  }>();

  const contentStore = useContentStore();
  const formStore = useFormStore();
  const residenceOptions = computed(() => contentStore.getResidenceCountries);

  const state = ref({
    selectedOption: null as { code: string; value: string } | null,
    initializedResidenceBlur: false,
    autoCompleteFilterResidence: null as AutoCompleteFilter | null,
    // Filtered options for autocomplete (kept in sync with store)
    filteredOptions: [] as Array<{ code: string; value: string }>,
  });

  const onBlur = () => {
    emits('update:residenceFocus');
    state.value.initializedResidenceBlur = true;
  };

  // keep filteredOptions in sync with the source list
  watch(
    residenceOptions,
    (val) => {
      if (val?.length) {
        // Deep clone to remove Vue reactivity (same as destination)
        const data: DataItem[] = JSON.parse(JSON.stringify(val));
        state.value.autoCompleteFilterResidence = new AutoCompleteFilter(data);

        // initial suggestions
        state.value.filteredOptions = data;
      }
    },
    { immediate: true }
  );

  const onResidenceUpdate = (v: any) => {
    if (v === null || v === '') {
      formStore.setResidenceCountry(null);
      state.value.selectedOption = null;
      emits('update:residence', null);
      return;
    }
    if (v?.code) {
      formStore.setResidenceCountry(v?.code);
      state.value.selectedOption = v;
      emits('update:residence', v?.code);
    }
  };

  // Filter options as user types
  const onComplete = (event: { query: string }) => {
    if (state.value.autoCompleteFilterResidence) {
      state.value.filteredOptions = generateResidenceSuggestions(
        event?.query?.trim(),
        // cast to the expected type to avoid structural mismatch errors
        state.value.autoCompleteFilterResidence as unknown as AutoCompleteFilter
      );
    }
  };

  const generateResidenceSuggestions = (
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
      residenceOptions
    ],
    ([hasQuote, isLoading, options]) => {
      if (isLoading) return;
      if (!options?.length) return;

      if (hasQuote) {
        const residence = options.find(
          (ele) => ele.code === formStore.getResidenceCountry
        );
        if (residence) {
          onResidenceUpdate(residence);
          onBlur();
        }
      } else {
        // No active quote → default to USA
        const residence = residenceOptions.value.find(
          (ele) => ele.code === 'USA'
        );
        if (residence) {
          onResidenceUpdate(residence);
          onBlur();
        }
      }
    },
    { immediate: true }
  );

  watch(
    () => state.value.selectedOption?.value,
    (newCountry) => {
      if (newCountry !== 'United States') {
        formStore.setResidenceState(null);
        emits('update:residenceState', null);
      }
    }
  );

  const onSelectResidenceCountry = (v: AutoCompleteOptionSelectEvent) => {
    sendGtagEvent('residence_country_updated', [v.value?.value ?? '']);
  };
</script>

<template>
  <label class="text-sm">{{
    contentStore.getQuoteFormContentByKey('residence').country.placeholder
  }}</label>
  <div
    class="input-with-left-icon mt-[5px]"
    :class="{ 'with-icon': state.initializedResidenceBlur && isValid }"
  >
    <img
      v-if="state.initializedResidenceBlur && isValid"
      :src="CheckIcon"
      class="left-icon"
      alt="valid"
    />
    <Autocomplete
      v-bind="$attrs"
      v-model="state.selectedOption"
      @update:modelValue="onResidenceUpdate"
      :suggestions="state.filteredOptions"
      @option-select="onSelectResidenceCountry"
      @complete="onComplete"
      option-label="value"
      show-clear
      auto-option-focus
      fluid
      force-selection
      @keydown.enter.prevent
      @hide="onBlur"
      :invalid="!props.isValid"
      :pt="{
        pcInputText: {
          root: { 'data-cy': 'residence-country-input' },
        },
      }"
    >
      <template #option="{ option }">
        <div :data-cy="`residence-country-option-${option?.code}`">
          {{ option?.value }}
        </div>
      </template>
      <template #clearicon="slotProps">
        <XCircleIcon stroke-width="2" :class="['w-6 !right-2 !top-2/5 !text-[#D4D9DE]', (slotProps as any).class]" @click="slotProps.clearCallback" />
      </template>
    </Autocomplete>
  </div>
</template>
