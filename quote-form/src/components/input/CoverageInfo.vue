<script setup lang="ts">
  import { useFormStore } from '@/store/form';
  import { useThemeStore } from '@/store/theme';
  import { useContentStore } from '@/store/content';
  import { computed, ref, watch } from 'vue';
  import DatePicker from 'primevue/datepicker';
  import Checkbox from 'primevue/checkbox';
  import InputNumber from 'primevue/inputnumber';
  import vInputmask from '@/utils/vInputmask';
  import CheckIcon from '@/assets/images/ProgressIndicatorIcon.svg';
  import { formatMeta } from '@/utils';
  import { sendGtagEvent } from '@/utils/analytics';
  import { formatDate } from '@/utils/commonUtils';
  import { XCircleIcon } from '@heroicons/vue/24/outline';
import dayjs from 'dayjs';

  const props = defineProps<{
    form: any;
    isValid: boolean;
  }>();

  const state = ref({
    willProtectTripCost: true,
    tripCost: null as number | null,
    itp: null as Date | null,
  });

  const emit = defineEmits<{
    (e: 'update:itp', value: Date | null): void;
    (e: 'update:tripCost', value: number | null): void;
    (e: 'update:itpFocus', value: boolean): void;
    (e: 'update:tripCostFocus', value: boolean): void;
  }>();
  const formStore = useFormStore();
  const themeStore = useThemeStore();
  const contentStore = useContentStore();
  const isThemeIMT = computed(() => themeStore.isThemeIMT);
  const isMobile = computed(() => themeStore.getIsMobile);
  const isOnResultsPage = computed(() => themeStore.isOnResultPage);

  formStore.setWillProtectTripCost(state.value.willProtectTripCost);

  const coverageInfoContent = computed(() =>
    contentStore.getQuoteFormContentByKey('coverage_info')
  );

  const helpText = computed(() => {
    return isMobile
      ? coverageInfoContent.value.help_content_mobile
      : coverageInfoContent.value.help_content;
  });

  const onTripCostUpdate = (v: number | string | null) => {
    if (v === null || v === '') {
      formStore.setTripCost(null);
      state.value.tripCost = null;
      // for trip cost we want to send an empty string if user clears it intentionally
      sendGtagEvent('trip_cost_updated', ['']);
      emit('update:tripCost', null);
      return;
    }
    const newValue = Number(v);

    if (!Number.isNaN(newValue)) {
      formStore.setTripCost(newValue);
      state.value.tripCost = newValue;

      emit('update:tripCost', newValue);
      sendGtagEvent('trip_cost_updated', [newValue]);
    }
  };

  const onBlurITP = () => {
    emit('update:itpFocus', true);
  };

  const onBlurTripCost = () => {
    emit('update:tripCostFocus', true);
  }

  const onITPUpdate = (
    v: Date | Date[] | (Date | null)[] | null | undefined
  ) => {
    if (v === null) {
      formStore.setITP(null);
      state.value.itp = null;
      emit('update:itp', null);
      sendGtagEvent('itp_updated', ['']);
      return;
    }
    if (v && v instanceof Date) {
      const date = formatDate(new Date(v));
      formStore.setITP(date);
      state.value.itp = new Date(v);
      emit('update:itp', v);
      sendGtagEvent('itp_updated', [date ?? '']);
    }
  };

  const hasActiveQuoteTripCost = computed(
    () => formStore.hasActiveQuote && !formStore.getIsLoading
  );

  const hadActiveQuoteTripCost = ref(false);
  const hadActiveQuoteITP = ref(false);
  watch(hasActiveQuoteTripCost, (val) => {
    if (val && formStore.getTripCost !== null) {
      state.value.tripCost = formStore.getTripCost;
      hadActiveQuoteTripCost.value = true;
      state.value.willProtectTripCost = true;
      if (formStore.getWillProtectTripCost) {
        onTripCostUpdate(state.value.tripCost);
        onBlurTripCost();
      }
    }
  });

  const hasActiveQuoteITP = computed(
    () => formStore.hasActiveQuote && !formStore.getIsLoading
  );

  watch(hasActiveQuoteITP, (val) => {
    if (val && formStore.getITP !== null) {
      state.value.itp = dayjs(formStore.getITP).toDate();
      hadActiveQuoteITP.value = true;
      state.value.willProtectTripCost = true;
      if (formStore.getWillProtectTripCost) {
        onITPUpdate(state.value.itp);
        onBlurITP();
      }
    }
  });

  const numberOfTravelers = computed(() => formStore.getNumberOfTravelers);

  const isTripCostValid = computed(() => {
    const travelers = numberOfTravelers.value;
    const tripCost = state.value.tripCost;

    return (
      (
        props.form?.tripCost?.valid &&
        props.form?.tripCost?.touched &&
        tripCost !== null &&
        tripCost > 0 &&
        travelers !== null &&
        tripCost <= travelers * themeStore.getTripCostLimit
      ) ||
      (props.form?.tripCost?.valid && hadActiveQuoteTripCost.value)
    );
  });


  const isTripCostError = computed(() => {
    return (formStore.getTripCost === null || formStore.getTripCost === undefined) && 
    formStore.getWillProtectTripCost && props.form?.tripCost?.touched === true;
  });

  const onWillProtectTripCostUpdate = (v: boolean) => {
    formStore.setWillProtectTripCost(v);
    if (!v) {
      formStore.setITP(null);
      state.value.itp = null;
      emit('update:itp', null);
      emit('update:itpFocus', false);
      
      formStore.setTripCost(null);
      state.value.tripCost = null;
      emit('update:tripCost', null);
      emit('update:tripCostFocus', false);
      props.form.tripCost.value = null;
      props.form.tripCost.invalid = false;
      props.form.tripCost.touched = undefined;
    }

    sendGtagEvent('will_protect_trip_cost_updated', [v]);
    if (!v) {
      // Clear trip cost
      formStore.setTripCost(null);
      sendGtagEvent('trip_cost_updated', ['']);

      // Clear initial trip payment date (ITP)
      formStore.setITP(null);
      emit('update:itp', null);
      sendGtagEvent('itp_updated', ['']);
    }
  };
</script>

<template>
  <div>
    <p v-if="!isOnResultsPage" class="text-sm text-[#333333] pb-[10px]">
      {{ helpText }}
    </p>
    <div class="flex flex-col gap-2">
      <div class="flex flex-row gap-2">
        <Checkbox
          name="willProtectTripCost"
          v-model="state.willProtectTripCost"
          @update:modelValue="onWillProtectTripCostUpdate"
          binary
          class="mb-2"
          :pt="{
            input: {
              'data-cy': 'protect-trip-cost-checkbox',
            },
          }"
        />
        <label for="willProtectTripCost" class="ml-[5px]">Yes, cover my trip cost</label>
      </div>
    </div>
    <div
      v-if="state.willProtectTripCost"
      class="flex flex-col md:flex-row gap-[10px]"
    >
      <div class="flex flex-col w-full">
        <label for="tripCost" class="font-light text-sm mb-2 block">{{
          coverageInfoContent.trip_cost.label
        }}</label>
        <div
          class="flex-1 input-with-left-icon"
          :class="{
            'with-icon': isTripCostValid && state.tripCost,
          }"
        >
          <img
            v-if="isTripCostValid && state.tripCost"
            :src="CheckIcon"
            class="left-icon"
            alt="valid"
          />
          <InputNumber
            v-model="state.tripCost"
            @update:modelValue="onTripCostUpdate"
            @blur="onBlurTripCost"
            name="tripCost"
            mode="currency"
            currency="USD"
            locale="en-US"
            fluid
            :allow-empty="false"
            :show-clear="state.tripCost !== null"
            :class="{
              'p-invalid': props.form.tripCost?.invalid,
            }"
            :minFractionDigits="0"
            :maxFractionDigits="0"
            :pt="{
              pcInputText: {
                root: { 'data-cy': 'trip-cost-input', autocomplete: 'off', 'class': (isTripCostError ? 'p-invalid' : '') },
              },
            }"
          >
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
          </InputNumber>
        </div>
      </div>

      <div class="flex flex-col w-full">
        <label for="itp" class="font-light text-sm mb-2 block">{{
          coverageInfoContent.initial_trip_payment_date.label
        }}</label>
        <div
          class="flex-1 input-with-left-icon"
          :class="{
            'with-icon': props.isValid && state.itp,
          }"
        >
          <img
            v-if="props.isValid && state.itp"
            :src="CheckIcon"
            class="left-icon"
            alt="valid"
          />
          <DatePicker
            v-model="state.itp"
            @update:modelValue="onITPUpdate"
            @hide="onBlurITP"
            v-inputmask="{
              mask: '99/99/9999',
              placeholder: 'MM/DD/YYYY',
            }"
            :manualInput="isMobile ? false : true"
            fluid
            :show-clear="state.itp !== null"
            auto-option-focus
            :maxDate="new Date()"
            :panelClass="[
              !isThemeIMT ? 'soventure-date-picker' : 'imt-date-picker',
            ]"
            :class="{ 'p-invalid': !props.isValid }"
            :invalid="!props.isValid"
            :pt="{
              pcInputText: {
                root: { 'data-cy': 'itp-input' },
              },
            }"
          >
            <template #date="slotProps">
              <div :data-test-id="formatMeta(slotProps.date)">
                {{ slotProps.date.day }}
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
          </DatePicker>
        </div>
      </div>
    </div>
  </div>
</template>
