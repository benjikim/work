<script setup>
  import { useContentStore } from 'src/store/modules/content.js';
  import { useFormStore } from 'src/store/modules/form.js';
  import { useApiStore } from 'src/store/modules/api.js';
  import { computed, reactive } from 'vue';
  import { useVuelidate } from '@vuelidate/core';
  import { ccAdjacentNumPattern } from '/src/utility/index.js';
  import { required, minLength, helpers } from '@vuelidate/validators';
  import { useDebounceFn } from '@vueuse/core';
  import { event } from 'vue-gtag';

  const props = defineProps({
    /**
     * ModelId to determine what content to display
     */
    modelId: {
      type: String,
      required: true,
    },
    /**
     * Key used to determine billing or residence
     */
    type: {
      type: String,
      required: true,
    },
  });

  const contentStore = useContentStore();
  const formStore = useFormStore();
  const apiStore = useApiStore();
  const inputField = contentStore.getInput(props.modelId);
  const value = computed(() => formStore.getAddress(props.type));

  const state = reactive({
    [props.modelId]: '',
    suggestions: computed(() => apiStore.addressSuggestions.suggestions),
    loadingSuggestions: computed(() => apiStore.addressSuggestions.loading),
    showSuggestions: computed(
      () => apiStore.addressSuggestions.showSuggestions
    ),
  });

  // When user selects a suggestion
  const selectSuggestion = (suggestion) => {
    state[props.modelId] =
      suggestion.address.formattedStreetAddress || suggestion.text || '';
    apiStore.setShowSuggestions(false);
    apiStore.setAddressSuggestions([]);

    formStore.setAddress(props.type, state[props.modelId]);
    formStore.setCity(props.type, suggestion.address.city.longName);
    formStore.setZip(props.type, suggestion.address.postalCode);

    // Required when componenet is used in some contexts, such as `billing`.
    formStore.setState(props.type, suggestion.address.admin1.shortName);

    // Kill current transaction after selection
    apiStore.resetAddressAutocompleteTransaction();

    event(`${props.modelId}_address_line_interacted`, {
      hierarchical_layer_1: `${props.modelId} address line interacted typed`,
      hierarchical_layer_2: `${props.modelId} address line address selected from drop down`,
    });
  };

  // Debounced function for fetching suggestions
  const debouncedFetchSuggestions = useDebounceFn(
    (query, type) => apiStore.fetchAddressSuggestions(query, type),
    300
  );

  // On input, fetch suggestions
  const handleInput = (val) => {
    formStore.setAddress(props.type, val.target.value);
    debouncedFetchSuggestions(val.target.value, props.type);
    v$.value[props.modelId].$reset();
  };

  const validationMessages = {
    [props.modelId]: inputField?.messages?.validation,
  };

  const addressFormat = (address) => {
    const regex = new RegExp(/([a-zA-Z].|.[a-zA-Z])/);
    return regex.test(address);
  };

  const rules = computed(() => {
    return {
      [props.modelId]: {
        required: helpers.withMessage(
          validationMessages[props.modelId].required,
          required
        ),
        minLength: helpers.withMessage(
          validationMessages[props.modelId].minLength,
          minLength(3)
        ),
        format: helpers.withMessage(
          validationMessages[props.modelId].adjacentNumsAddress,
          addressFormat
        ),
        sixteenAdjacentNumbers: helpers.withMessage(
          validationMessages[props.modelId].adjacentNumsAddress,
          ccAdjacentNumPattern
        ),
      },
    };
  });

  const handleBlur = (data) => {
    state[props.modelId] = data;
    v$.value[props.modelId].$validate();
    if (!v$.value[props.modelId].$error) {
      formStore.setAddress(props.type, data);
    } else {
      formStore.setAddress(props.type, null);
    }

    apiStore.setShowSuggestions(false);
    apiStore.setAddressSuggestions([]);

    // Kill current transaction after moving out of field
    apiStore.resetAddressAutocompleteTransaction();
  };

  const handleFocus = () => {
    event(`${props.modelId}_address_line_interacted`, {
      hierarchical_layer_1: `${props.modelId} address line interacted typed`,
      hierarchical_layer_2: '',
    });
  };

  const v$ = useVuelidate(rules, state);
</script>
<template>
  <div class="address-container">
    <BaseFormTextInput
      :id="inputField.id"
      v-model="state[modelId]"
      :value="value"
      :hint="inputField.hint"
      :label="inputField.label"
      :disabled="inputField.disabled"
      :required="inputField.required"
      :errors="v$[modelId]?.$errors.map((error) => error.$message)"
      :placeholder="inputField.placeholder"
      :type="inputField.type"
      :autocomplete="'off'"
      @update:blur="handleBlur"
      @input="handleInput"
      @update:focus="handleFocus"
    />
    <!-- Suggestions Dropdown -->
    <ul
      v-if="state.showSuggestions && state.suggestions.length"
      class="autocomplete-suggestions"
    >
      <li
        v-for="(suggestion, idx) in state.suggestions"
        :key="idx"
        class="autocomplete-suggestion-item"
        @mousedown.prevent="selectSuggestion(suggestion)"
      >
        {{ suggestion.address.formattedAddress || suggestion.text }}
      </li>
    </ul>
    <div
      v-if="state.loadingSuggestions && state.suggestions.length === 0"
      class="loading-indicator"
    >
      Loading...
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .address-container {
    position: relative;
  }
  .autocomplete-suggestions {
    position: absolute;
    z-index: 10;
    border: 1px solid $imt-border-color-dark;
    border-radius: $base-input-border-radius;
    background-color: $imt-input-color-default;
    width: 100%;
    max-height: 225px;
    overflow-y: auto;
  }

  .autocomplete-suggestion-item {
    padding: 8px;
    cursor: pointer;
    padding: 10px 15px;
    border-bottom: 1px solid $imt-border-color-light;
    line-height: 20px;
    transition: all 0.1s ease;

    &:hover {
      background-color: $imt-blue;
      color: #fff;
    }
  }

  .loading-indicator {
    position: absolute;
    z-index: 11;
    border: 1px solid $imt-border-color-dark;
    border-radius: $base-input-border-radius;
    background-color: $imt-input-color-default;
    width: 100%;
    text-align: center;
  }
</style>
