<script setup lang="ts">
  import { useApiStore } from '@/store/api';
  import { useThemeStore } from '@/store/theme';
  import { useUserSessionStore } from '@/store/userSession';
  import useVuelidate from '@vuelidate/core';
  import { computed, ref } from 'vue';
  import { minValue, maxValue } from '@vuelidate/validators';
  import BaseTextInput from '../BaseTextInput.vue';
  import { event } from 'vue-gtag';
  import { GAObject } from '@/types';

  defineProps<{
    numberOfPlansWithTripCost: number;
  }>();

  const apiStore = useApiStore();
  const sessionStore = useUserSessionStore();
  const themeStore = useThemeStore();

  const newTripCost = ref<string>('');
  const maxTripCost = computed(() =>
    themeStore.isThemeSoventure ? 150000 : 200000
  );

  const numberOfTravelers = computed(
    () => apiStore.getQuoteDetails?.travelers?.length
  );

  const missingTripCost = computed(
    () =>
      apiStore.getTripCost === null ||
      apiStore.getTripCost <= numberOfTravelers.value
  );

  const handleSubmit = async () => {
    if (newTripCost.value === '') {
      return;
    }

    event('plan_action_soventure_update_trip_cost', {
      hierarchical_layer_1: 'Soventure Update Trip Cost',
      hierarchical_layer_2: newTripCost.value,
    } as GAObject);

    if (missingTripCost.value && v$.value.newTripCost.$invalid) {
      if (v$.value.newTripCost.$invalid) {
        v$.value.newTripCost.$touch();
      }
      return;
    }

    if (missingTripCost.value) {
      apiStore.setCoverTripCostMetadata();
      if (newTripCost.value === numberOfTravelers.value.toString()) {
        sessionStore.setHideSoventureUpdateTripCost(true);
        sessionStore.silentQuoteUpdate();
        return;
      }
      apiStore.setTripCost(Number(newTripCost.value));
    }

    await apiStore.createQuote();
  };
  const filterInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    // Remove all non-numeric characters
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    newTripCost.value = sanitizedValue;
    (e.target as HTMLInputElement).value = sanitizedValue;
  };

  const rules = computed(() => ({
    newTripCost: {
      minValue: minValue(1),
      maxValue: maxValue(maxTripCost.value),
    },
  }));

  const validate = (val: string) => {
    if (val === 'tripCost') {
      v$.value.newTripCost.$validate();
    }
  };

  const v$ = useVuelidate(rules, { newTripCost });
</script>

<template>
  <div class="flex flex-col justify-center items-center my-8">
    <div
      class="text-base font-bold text-center mb-4 capitalize tracking-wide my-4 max-w-96 md:max-w-full"
    >
      {{ numberOfPlansWithTripCost }} more plans available but require a trip
      cost of ${{ numberOfTravelers }} or more
    </div>
    <div
      class="flex flex-col md:flex-row justify-center items-center gap-2 pb-4"
    >
      <div class="trip-cost-wrapper">
        <span class="dollar-sign">$</span>
        <BaseTextInput
          id="soventure-update-trip-cost-input"
          v-model.number="newTripCost"
          class="w-full md:w-36 trip-cost-input"
          :hint="''"
          step="any"
          :disabled="false"
          :placeholder="''"
          :type="'tel'"
          data-cy="soventure-update-trip-cost-input"
          @update:blur="validate('tripCost')"
          @input="filterInput"
        >
        </BaseTextInput>
      </div>
      <div
        id="updateTripCostButton"
        class="w-full flex justify-center md:justify-start md:block md:w-44"
      >
        <button
          class="daisy-btn hover:action-primary bg-action-primary border-action-primary rounded-lg w-48 h-10 flex justify-center items-center uppercase"
          data-cy="soventure-update-trip-cost-button"
          @click="handleSubmit"
        >
          <p class="text-base font-semibold text-white tracking-wide">
            Update Trip Cost
          </p>
        </button>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
  .trip-cost-wrapper {
    position: relative;
    display: inline-block;

    .form-input__label {
      margin: 0;
    }
    input {
      border-radius: 6px;
      border: 1px solid #000;
      padding-left: 20px;
      font-weight: 700;
    }
  }

  .dollar-sign {
    position: absolute;
    left: 12px;
    top: 12px;
    color: #374151;
    font-weight: 700;
    z-index: 2;
    pointer-events: none;
  }

  .trip-cost-input input {
    padding-left: 24px;
  }
</style>
