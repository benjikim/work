<script setup lang="ts">
  import { useApiStore } from '@/store/api';
  import { computed, ref } from 'vue';
  import BaseTextInput from '@/components/base/BaseTextInput.vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { required, helpers, minValue, maxValue } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import BaseDatePicker from '@/components/base/BaseDatePicker.vue';
  import { HTTP_REQUEST_STATES } from '@/config';
  import { formatItp } from '@/utility';
  import { useContentStore } from '@/store/content';
  import { useThemeStore } from '@/store/theme';

  const apiStore = useApiStore();
  const sessionStore = useUserSessionStore();
  const contentStore = useContentStore();
  const themeStore = useThemeStore();
  const additionDetailContent = contentStore.getAdditionalDetailsContent;

  // Info from our quote details
  const missingTripCost = computed(
    () => apiStore.getTripCost === 0 || apiStore.getTripCost === null
  );
  const missingItp = computed(() => apiStore.getITP === null);
  const doesQuoteHaveError = computed(
    () =>
      apiStore.getQuoteResultsRequestStatus === HTTP_REQUEST_STATES.ERROR ||
      apiStore.getQuoteDetailsRequestStatus === HTTP_REQUEST_STATES.ERROR
  );

  // Info that will be used to update our current quote details
  const newTripCost = ref();
  const newItp = ref();

  const openAdditionalDetailsModal = () => {
    sessionStore.setAdditionalDetailsModal(true);
  };

  const handleSubmit = async () => {
    // Check if the form is valid, return early if either validation fails
    if (
      (missingItp.value && v$.value.newItp.$invalid) ||
      (missingTripCost.value && v$.value.newTripCost.$invalid)
    ) {
      if (v$.value.newItp.$invalid) {
        v$.value.newItp.$touch();
      }

      if (v$.value.newTripCost.$invalid) {
        v$.value.newTripCost.$touch();
      }
      return;
    }

    if (missingTripCost.value) {
      apiStore.setTripCost(Number(newTripCost.value));
    }

    if (missingItp.value) {
      apiStore.setITP(formatItp(newItp.value));
    }

    await apiStore.createQuote();
  };

  const filterInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    // Remove all non-numeric characters
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    newTripCost.value = sanitizedValue;
    (e.target as HTMLInputElement).value = sanitizedValue; // Update the input field
  };

  const maxTripCost = computed(() =>
    themeStore.isThemeSoventure ? 150000 : 200000
  );

  const rules = computed(() => ({
    newTripCost: {
      required: helpers.withMessage(
        additionDetailContent.tripCostError,
        required
      ),
      minValue: helpers.withMessage(
        additionDetailContent.tripCostError,
        minValue(1)
      ),
      maxValue: helpers.withMessage(
        additionDetailContent.tripCostMaxError,
        maxValue(maxTripCost.value)
      ),
    },
    newItp: {
      required: helpers.withMessage(additionDetailContent.itpError, required),
    },
  }));

  const validate = (val: string) => {
    if (val === 'tripCost') {
      v$.value.newTripCost.$validate();
    }

    if (val === 'itp') {
      v$.value.newItp.$validate();
    }
  };

  const v$ = useVuelidate(rules, { newTripCost, newItp });
</script>

<template>
  <div
    v-if="(missingTripCost || missingItp) && !doesQuoteHaveError"
    class="flex flex-col md:flex-row content-center gap-2 md:gap-5 md:block mb-5 quote-results__additional-details px-4 md:px-0"
  >
    <div
      class="additional-details__header block md:flex flex-row md:flex-col items-center px-8 md:px-0 py-2 md:py-0"
    >
      <h2 class="text-base md:ml-0 md:text-xl font-bold text-center md:text-left mb-0">
        {{ additionDetailContent.headerOne }}
      </h2>
      <h2 class="display-none md:block text-xl font-bold text-left mb-0">
        {{ additionDetailContent.headerTwo }}
      </h2>
    </div>
    <div
      class="display-none md:flex flex-auto flex-row gap-5 justify-center items-start"
    >
      <div v-if="missingTripCost" id="trip-cost" class="w-64">
        <BaseTextInput
          :id="'tripCost'"
          v-model.number="newTripCost"
          min="0"
          :hint="''"
          step="any"
          :disabled="false"
          :placeholder="additionDetailContent.tripCostPlaceholder"
          :type="'tel'"
          @update:blur="validate('tripCost')"
          @input="filterInput"
          :errors="v$.newTripCost?.$errors.map((error) => error.$message)"
        >
        </BaseTextInput>
      </div>
      <div v-if="missingItp" id="itp" class="w-64 py-0.5">
        <BaseDatePicker
          id="itp"
          :hint="''"
          v-model="newItp"
          :placeholder="additionDetailContent.itpPlaceholder"
          @update:blur="validate('itp')"
          @update:modelValue="newItp = $event"
          :errors="v$.newItp?.$errors.map((error) => error.$message)"
        ></BaseDatePicker>
      </div>
      <div id="button" class="w-44 pt-[0.5rem]">
        <button
          class="daisy-btn hover:action-primary bg-action-primary border-action-primary rounded-lg w-48 h-10 flex justify-center items-center uppercase"
          @click="handleSubmit"
        >
          <p class="text-lg font-semibold text-white tracking-wide">
            {{ additionDetailContent.submitButton }}
          </p>
        </button>
      </div>
    </div>
    <div class="flex md:display-none justify-center w-full md:ml-0">
      <div id="button" class="w-44 pt-0.5 md:pt-1.5">
        <button
          class="hover:bg-action-primary bg-action-primary border-action-primary rounded-lg w-48 h-12 flex justify-center items-center uppercase"
          @click="openAdditionalDetailsModal"
        >
          <p class="text-lg font-semibold text-white tracking-wide">
            {{ additionDetailContent.openModalButton }}
          </p>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .quote-results__additional-details {
    .dp__input {
      height: 48px;
      width: 100%;
      padding: 8px 16px;
      border: 1px solid $imt-border-color-dark;
      border-radius: $base-input-border-radius;
      background-color: $imt-input-color-default;
      margin-top: 6px;
    }
    .dp__input::placeholder {
      font-size: 16px;
      font-weight: 400;
      color: grey;
    }
    .dp__icon {
      margin-top: 6px;
    }
    .disabled {
      background: linear-gradient(
          0deg,
          $imt-border-color-light,
          $imt-border-color-light
        ),
        linear-gradient(0deg, $imt-border-color-dark, $imt-border-color-dark);
    }
    .has-errors {
      border-color: $imt-red;
    }
  }
</style>
