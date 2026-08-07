<script setup lang="ts">
  import { useApiStore } from '@/store/api';
  import { computed, ref } from 'vue';
  import BaseTextInput from '@/components/base/BaseTextInput.vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { required, helpers, minValue, maxValue } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import BaseDatePicker from '@/components/base/BaseDatePicker.vue';
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

  // Info that will be used to update our current quote details
  const newTripCost = ref();
  const newItp = ref();

  /**
   * Closes the modal by setting toolTip to false.
   */
  const closeModal = () => {
    sessionStore.setAdditionalDetailsModal(false);
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

    sessionStore.setAdditionalDetailsModal(false);
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
  <dialog class="daisy-modal daisy-modal-open" @close="closeModal">
    <div
      class="daisy-modal-box w-11/12 max-w-3xl overflow-visible rounded-none p-5"
    >
      <div class="flex flex-row items-center">
        <h2 class="font-bold text-2xl pt-2.5">
          {{ additionDetailContent.modalHeaderOne }}
        </h2>
        <button
          type="button"
          class="close-btn mr-[-10px]"
          @click="closeModal()"
          aria-label="close"
        >
          ×
        </button>
      </div>

      <div class="mt-5 mb-5">
        <h2 class="font-bold text-base">
          {{ additionDetailContent.modalHeaderTwo }}
        </h2>
      </div>

      <div class="item-group flex flex-col">
        <div v-if="missingTripCost" id="tripCost-container-modal">
          <BaseTextInput
            :id="'tripCost-modal'"
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
        <div v-if="missingItp" id="itp-container-modal">
          <BaseDatePicker
            id="itp-modal"
            :hint="''"
            v-model="newItp"
            :placeholder="additionDetailContent.itpPlaceholder"
            @update:blur="validate('itp')"
            @update:modelValue="newItp = $event"
            :errors="v$.newItp?.$errors.map((error) => error.$message)"
          ></BaseDatePicker>
        </div>
        <div id="additionalDetails-modal-submitButton-container" class="pt-1.5">
          <button
            class="daisy-btn hover:bg-action-primary bg-action-primary border-action-primary w-full h-12 flex justify-center items-center mt-5"
            @click="handleSubmit"
          >
            <p class="text-lg font-semibold text-white uppercase">
              {{ additionDetailContent.submitButton }}
            </p>
          </button>
        </div>
      </div>
    </div>

    <!-- This creates a backdrop for the modal to enable us to close when clicked outside -->
    <div class="daisy-modal-backdrop" @click="closeModal"></div>
  </dialog>
</template>
