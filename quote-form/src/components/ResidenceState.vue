<script setup lang="ts">
  import Autocomplete, {
    type AutoCompleteOptionSelectEvent,
  } from 'primevue/autocomplete';
  import { useContentStore } from '@/store/content';
  import { computed, ref, watch, onMounted } from 'vue';
  import { useFormStore } from '@/store/form';
  import CheckIcon from '@/assets/images/ProgressIndicatorIcon.svg';
  import AutoCompleteFilter from '@/utils/autoComplete';
  import type { DataItem } from '@/utils/autoComplete';
  import { sendGtagEvent } from '@/utils/analytics';
  import { useThemeStore } from '@/store/theme';
  import { XCircleIcon } from '@heroicons/vue/24/outline';

  const props = defineProps<{
    isValid: boolean;
  }>();

  const emits = defineEmits<{
    (e: 'update:residenceState', value: string | null): void;
    (e: 'update:residenceStateFocus'): void;
  }>();

  const contentStore = useContentStore();
  const formStore = useFormStore();
  const themeStore = useThemeStore();
  const stateOptions = computed(() => contentStore.getStatesList);
  const isAnnual = computed(() => themeStore.getCurrentThemeMode === 'annual');

  const state = ref({
    selectedOption: null as { code: string; value: string } | null,
    initializedResidenceStateBlur: false,
    autoCompleteFilterState: null as AutoCompleteFilter | null,
    // Filtered options for autocomplete (kept in sync with store)
    filteredOptions: [] as Array<{ code: string; value: string }>,
  });

  const onBlur = () => {
    emits('update:residenceStateFocus');
    state.value.initializedResidenceStateBlur = true;
  };

  // keep filteredOptions in sync with the source list
  watch(
    stateOptions,
    (val) => {
      if (val?.length) {
        // Deep clone to remove Vue reactivity (same as destination)
        const data: DataItem[] = JSON.parse(JSON.stringify(val));
        state.value.autoCompleteFilterState = new AutoCompleteFilter(data);

        // initial suggestions
        state.value.filteredOptions = data;
      }
    },
    { immediate: true }
  );

  const hasActiveQuote = computed(
    () => formStore.hasActiveQuote && !formStore.getIsLoading
  );

  // This has to be on mounted since we conditionally render this component.
  onMounted(() => {
    if (hasActiveQuote.value) {
      loadResidenceState();
    }
  });

  watch(hasActiveQuote, (val) => {
    if (val) {
      loadResidenceState();
    }
  });

  const loadResidenceState = () => {
    const residenceState = stateOptions.value.find(
      (ele) => ele.code === formStore.getResidenceState
    );
    if (residenceState) {
      onResidenceUpdate(residenceState);
      onBlur();
    }
  };

  const onResidenceUpdate = (v: any) => {
    if (v === null || v === '') {
      formStore.setResidenceState(null);
      state.value.selectedOption = null;
      emits('update:residenceState', null);
      return;
    }
    if (v?.code) {
      formStore.setResidenceState(v?.code);
      state.value.selectedOption = v;
      if (themeStore.getCurrentThemeMode === 'annual') {
        const result = stateOptions.value.find((item) => item.code === v?.code);
        if (result && result.countryCode) {
          formStore.setResidenceCountry(result.countryCode);
        }
      }
      emits('update:residenceState', v?.code);
    }
  };

  // Filter options as user types
  const onComplete = (event: { query: string }) => {
    if (state.value.autoCompleteFilterState) {
      state.value.filteredOptions = generateStateSuggestions(
        event?.query?.trim(),
        // cast to the expected type to avoid structural mismatch errors
        state.value.autoCompleteFilterState as unknown as AutoCompleteFilter
      );
    }
  };

  /**
   * Populate our results with suggestions using the AutoComplete utility
   *
   * @see autoComplete.js
   * @param {String} search The search string in the input
   * @param {AutoCompleteFilter} autoComplete Instance of AutoCompleteFilter
   */
  const generateStateSuggestions = (
    search: string,
    autoComplete: AutoCompleteFilter
  ): DataItem[] => {
    const autoCompleteResults = autoComplete
      .setQuery(search)
      .filterSuggestions({
        includeCode: true,
      })
      .sortSuggestionsByQuality()
      .prioritizeCode(search);

    return autoCompleteResults.suggestions.slice(0, 6);
  };

  if (formStore.getResidenceState) {
    const residenceState = stateOptions.value.find(
      (ele) => ele.code === formStore.getResidenceState
    );
    if (residenceState) {
      state.value.selectedOption = residenceState;
      formStore.setResidenceState(residenceState.code);
    }
  }

  const onSelectResidenceState = (v: AutoCompleteOptionSelectEvent) => {
    sendGtagEvent('residence_state_updated', [v.value?.value ?? null]);
  };
</script>

<template>
  <label class="text-sm">{{
    contentStore.getQuoteFormContentByKey('residence').state.placeholder
  }}</label>
  <div
    class="input-with-left-icon mt-[5px]"
    :class="{
      'with-icon': state.initializedResidenceStateBlur && isValid,
      'w-full': isAnnual,
    }"
  >
    <img
      v-if="state.initializedResidenceStateBlur && isValid"
      :src="CheckIcon"
      class="left-icon"
      alt="valid"
    />
    <Autocomplete
      v-model="state.selectedOption"
      @update:modelValue="onResidenceUpdate"
      :suggestions="state.filteredOptions"
      @complete="onComplete"
      @option-select="onSelectResidenceState"
      option-label="value"
      show-clear
      auto-option-focus
      fluid
      @keydown.enter.prevent
      force-selection
      @hide="onBlur"
      :invalid="!props.isValid"
      :pt="{
        pcInputText: {
          root: { 'data-cy': 'residence-state-input' },
        },
      }"
    >
      <template #option="{ option }">
        <div :data-cy="`residence-state-option-${option?.code}`">
          {{ option?.value }}
        </div>
      </template>
      <template #clearicon="slotProps">
        <XCircleIcon
          stroke-width="2"
          :class="[
            'w-6 !right-2 !top-2/5 !text-[#D4D9DE]',
            (slotProps as any).class,
          ]"
          @click="slotProps.clearCallback"
        />
      </template>
    </Autocomplete>
  </div>
</template>
