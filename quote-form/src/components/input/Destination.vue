<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import AutoComplete, {
    type AutoCompleteOptionSelectEvent,
  } from 'primevue/autocomplete';
  import CheckIcon from '@/assets/images/ProgressIndicatorIcon.svg';
  import type { DataItem } from '@/utils/autoComplete';
  import type {
    QuoteFormGeographyDestination,
    QuoteFormGeographyResidence,
  } from '@/types';
  import { useFormStore } from '@/store/form';
  import { useContentStore } from '@/store/content';
  import { useThemeStore } from '@/store/theme';
  import AutoCompleteFilter from '@/utils/autoComplete';
  import { sendGtagEvent } from '@/utils/analytics';
  import { XCircleIcon } from '@heroicons/vue/24/outline';

  const props = defineProps<{
    destinations: QuoteFormGeographyDestination[];
    destinationStates: QuoteFormGeographyResidence[];
    isDestinationValid: boolean;
    isDestinationStateValid: boolean;
  }>();

  const formStore = useFormStore();
  const contentStore = useContentStore();
  const themeStore = useThemeStore();

  const destinationContent = computed(() =>
    contentStore.getQuoteFormContentByKey('destination')
  );

  const emit = defineEmits<{
    (
      e: 'update:destination',
      value: QuoteFormGeographyDestination | null
    ): void;
    (
      e: 'update:destinationState',
      value: QuoteFormGeographyResidence | null
    ): void;
    (e: 'update:destinationFocus'): void;
    (e: 'update:destinationStateFocus'): void;
  }>();

  const state = ref({
    initializedDestinationBlur: false,
    initializedDestinationStateBlur: false,
    selectedDestination: null as QuoteFormGeographyDestination | null,
    selectedDestinationState: null as QuoteFormGeographyResidence | null,
    filteredDestinations: [] as DataItem[],
    filteredStates: [] as DataItem[],
    isFocused: false,
    autoCompleteFilterDestination: null as AutoCompleteFilter | null,
    autoCompleteFilterDestinationState: null as AutoCompleteFilter | null,
  });

  const hasActiveQuote = computed(
    () =>
      formStore.hasActiveQuote &&
      !formStore.getIsLoading &&
      props.destinations.length > 0
  );

  const isMobile = computed(() => themeStore.getIsMobile);

  const isOnResultsPage = computed(() => themeStore.isOnResultPage);

  const helpText = computed(() => {
    return isMobile
      ? contentStore.getQuoteFormContentByKey('destination')
          ?.help_content_mobile
      : contentStore.getQuoteFormContentByKey('destination')?.help_content;
  });

  watch(hasActiveQuote, async (val) => {
    if (val) {
      const destination = props.destinations.find(
        (ele) => ele.code === formStore.getDestinationCountry
      );
      if (destination) {
        onDestinationUpdate(destination);
        onBlur();
      }

      if (destination?.code === 'USA') {
        const destinationState = props.destinationStates.find(
          (ele) => ele.code === formStore.getDestinationState
        );
        if (destinationState) {
          onDestinationStateUpdate(destinationState);
          onBlurState();
        }
      }
    }
  });

  /**
   * Populate our results with suggestions using the AutoComplete utility
   *
   * @see autoComplete.js
   * @param {String} search The search string in the input
   * @param {AutoCompleteFilter} autoComplete Instance of AutoCompleteFilter
   */
  const generateDestinationSuggestions = (
    search: string,
    autoComplete: AutoCompleteFilter | null
  ): DataItem[] => {
    if (autoComplete === null) return [];

    const autoCompleteResults = autoComplete
      .setQuery(search)
      .filterSuggestions()
      .sortSuggestionsByQuality();

    // If the search starts with the letter `s`, do not prioritize
    // `United States` presuming that a user would not enter the
    // word `States` when searching for `United States`
    if (!search.toLowerCase().startsWith('s')) {
      autoCompleteResults.prioritizeCode('USA');
    }

    return autoCompleteResults.suggestions.slice(0, 6);
  };

  /**
   * Populate our results with suggestions using the AutoComplete utility
   *
   * @see autoComplete.js
   * @param {String} search The search string in the input
   * @param {AutoCompleteFilter} autoComplete Instance of AutoCompleteFilter
   */
  const generateDestinationStateSuggestions = (
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

  const isDestinationsUpdated = computed(() => props.destinations.length > 0);
  const isDestinationStatesUpdated = computed(
    () => props.destinationStates.length > 0
  );

  // Watch for changes to destinations prop to update AutoCompleteFilter
  watch(isDestinationsUpdated, (val) => {
    if (val) {
      // Deep clone to remove reactivity
      const destinations: DataItem[] = JSON.parse(
        JSON.stringify(props.destinations)
      );
      state.value.autoCompleteFilterDestination = new AutoCompleteFilter(
        destinations
      );
    }
  });

  // Watch for changes to destinationStates prop to update AutoCompleteFilter
  watch(isDestinationStatesUpdated, (val) => {
    if (val) {
      // Deep clone to remove reactivity
      const destinationStates: DataItem[] = JSON.parse(
        JSON.stringify(props.destinationStates)
      );
      state.value.autoCompleteFilterDestinationState = new AutoCompleteFilter(
        destinationStates
      );
    }
  });

  const searchListDestinations = (event: { query: string }) => {
    if (
      state.value.autoCompleteFilterDestination instanceof AutoCompleteFilter
    ) {
      state.value.filteredDestinations = generateDestinationSuggestions(
        event?.query?.trim(),
        state.value.autoCompleteFilterDestination
      );
    }
  };

  const searchListDestinationStates = (event: { query: string }) => {
    if (
      state.value.autoCompleteFilterDestinationState instanceof
      AutoCompleteFilter
    ) {
      state.value.filteredStates = generateDestinationStateSuggestions(
        event?.query?.trim(),
        state.value.autoCompleteFilterDestinationState
      );
    }
  };

  const onDestinationUpdate = (v: any) => {
    if (v === null || v === '') {
      formStore.setDestinationCountry(null);
      state.value.selectedDestination = null;
      emit('update:destination', null);
      return;
    }
    if (v?.code) {
      formStore.setDestinationCountry(v?.code);
      state.value.selectedDestination = v;
      emit('update:destination', v);
    }
  };

  const onDestinationStateUpdate = (v: any) => {
    if (v === null || v === '') {
      formStore.setDestinationState(null);
      state.value.selectedDestinationState = null;
      emit('update:destinationState', null);
      return;
    }

    if (v?.code) {
      formStore.setDestinationState(v?.code);
      state.value.selectedDestinationState = v;
      emit('update:destinationState', v);
    }
  };

  const isDestinationUSA = computed(
    () => formStore.getDestinationCountry === 'USA'
  );

  function onFocus() {
    state.value.isFocused = true;
    contentStore.setToolTipStatusById('destination', true);
  }

  function onBlur() {
    emit('update:destinationFocus');
    state.value.initializedDestinationBlur = true;
    state.value.isFocused = false;
  }

  function onFocusState() {
    state.value.isFocused = true;
    contentStore.setToolTipStatusById('destination', true);
  }

  function onBlurState() {
    emit('update:destinationStateFocus');
    state.value.initializedDestinationStateBlur = true;
    state.value.isFocused = false;
  }

  const onSelectCountry = (v: AutoCompleteOptionSelectEvent) => {
    sendGtagEvent('destination_country_updated', [v.value?.value ?? null]);
  };

  const onSelectState = (v: AutoCompleteOptionSelectEvent) => {
    sendGtagEvent('destination_state_updated', [v.value?.value ?? null]);
  };

  watch(
    () => formStore.getDestinationCountry,
    (newCountry) => {
      if (newCountry !== 'USA') {
        // 1. Clear store
        formStore.setDestinationState(null);

        // 2. Clear local component state
        state.value.selectedDestinationState = null;

        // 3. Clear PrimeVue Form state
        emit('update:destinationState', null);
      }
    }
  );

</script>

<template>
  <p v-if="state.isFocused && !isOnResultsPage" class="text-sm text-[#333333] pb-[10px]">
    {{ helpText }}
  </p>
  <div
    class="quote-form__section-destination w-full flex flex-col md:flex-row gap-[10px]"
  >
    <div
      class="input-with-left-icon w-full"
      :class="{
        'with-icon':
          state.initializedDestinationBlur && props.isDestinationValid,
      }"
    >
      <img
        v-if="state.initializedDestinationBlur && props.isDestinationValid"
        :src="CheckIcon"
        class="left-icon"
        alt="valid"
      />
      <AutoComplete
        v-model="state.selectedDestination"
        @update:modelValue="onDestinationUpdate"
        optionLabel="value"
        @option-select="onSelectCountry"
        showClear
        fluid
        autoOptionFocus
        forceSelection
        @focus="onFocus"
        @hide="onBlur"
        :suggestions="state.filteredDestinations"
        @keydown.enter.prevent
        @complete="searchListDestinations"
        :class="{
          'p-invalid': !props.isDestinationValid,
          'p-valid': props.isDestinationValid,
        }"
        :invalid="!props.isDestinationValid"
        :pt="{
          pcInputText: {
            root: { 'data-cy': 'destination-input' },
          },
        }"
      >
        <template #option="{ option }">
          <div :data-cy="`destination-option-${option?.code}`">
            {{ option?.value }}
          </div>
        </template>
        <template #clearicon="slotProps">
          <XCircleIcon stroke-width="2" :class="['w-6 !right-2 !top-2/5 !text-[#D4D9DE]', (slotProps as any).class]" @click="slotProps.clearCallback" />
        </template>
      </AutoComplete>
    </div>

    <div
      v-if="isDestinationUSA"
      class="input-with-left-icon w-full"
      :class="{
        'with-icon':
          state.initializedDestinationStateBlur &&
          props.isDestinationStateValid,
      }"
    >
      <img
        v-if="
          state.initializedDestinationStateBlur && props.isDestinationStateValid
        "
        :src="CheckIcon"
        class="left-icon"
        alt="valid"
      />
      <AutoComplete
        v-model="state.selectedDestinationState"
        @update:modelValue="onDestinationStateUpdate"
        optionLabel="value"
        @option-select="onSelectState"
        showClear
        fluid
        autoOptionFocus
        forceSelection
        @focus="onFocusState"
        @hide="onBlurState"
        :suggestions="state.filteredStates"
        @keydown.enter.prevent
        @complete="searchListDestinationStates"
        :class="{
          'p-invalid': !props.isDestinationStateValid,
          'p-valid': props.isDestinationStateValid,
        }"
        :pt="{
          pcInputText: {
            root: { 'data-cy': 'destination-state-input' },
          },
        }"
        :invalid="!props.isDestinationStateValid"
        :placeholder="destinationContent.state.placeholder"
      >
        <template #option="{ option }">
          <div :data-cy="`destination-state-option-${option?.code}`">
            {{ option?.value }}
          </div>
        </template>
        <template #clearicon="slotProps">
          <XCircleIcon stroke-width="2" :class="['w-6 !right-2 !top-2/5 !text-[#D4D9DE]', (slotProps as any).class]" @click="slotProps.clearCallback" />
        </template>
      </AutoComplete>
    </div>
  </div>
</template>
