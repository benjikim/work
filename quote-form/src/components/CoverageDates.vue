<script setup lang="ts">
  import { useFormStore } from '../store/form';
  import { useThemeStore } from '../store/theme';
  import { reactive, computed, ref, watch } from 'vue';
  import dayjs from 'dayjs';
  import DatePicker from 'primevue/datepicker';
  import type { DatePickerDateSlotOptions } from 'primevue/datepicker';
  import { formatDate } from '../utils/commonUtils';
  import vInputmask from '../utils/vInputmask';
  import { useContentStore } from '@/store/content';
  import CheckIcon from '@/assets/images/ProgressIndicatorIcon.svg';
  import { parseMDY } from '@/utils';
  import { sendGtagEvent } from '@/utils/analytics';
  import { XCircleIcon } from '@heroicons/vue/24/outline';

  const props = defineProps<{
    modelValue?: (Date | null)[] | null;
    name?: string;
    isValid: boolean;
    form: any;
  }>();

  const emit = defineEmits(['update:modelValue', 'update:travelDatesFocus']);

  interface TravelDates {
    departureDate: string;
    returnDate: string;
  }

  const state: TravelDates = reactive({
    departureDate: '',
    returnDate: '',
  });

  const isMobile = computed(() => themeStore.getIsMobile);
  const travelDatesRef = ref();
  const formStore = useFormStore();
  const themeStore = useThemeStore();
  const contentStore = useContentStore();
  const isOnResultsPage = computed(() => themeStore.isOnResultPage);
  const isThemeIMT = computed(() => themeStore.isThemeIMT);
  const isFocused = ref(false);
  const helpText = computed(() => {
    return isMobile
      ? contentStore.getQuoteFormContentByKey('travel_dates')
          .help_content_mobile
      : contentStore.getQuoteFormContentByKey('travel_dates').help_content;
  });

  const minDepartureDate = new Date(dayjs().toDate());

  const maxReturnDate = computed(() => {
    if (state.departureDate) {
      return dayjs(state.departureDate)
        .add(1, 'year')
        .subtract(1, 'day')
        .format('YYYY-MM-DD');
    }

    return dayjs().add(10, 'year').subtract(1, 'day').format('YYYY-MM-DD');
  });

  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const departureDates = computed<[Date | null, Date | null] | null>({
    get() {
      // If parent provided a modelValue (via v-model), respect it first
      if (props.modelValue && Array.isArray(props.modelValue)) {
        return [props.modelValue[0] ?? null, props.modelValue[1] ?? null];
      }

      const start = parseMDY(state.departureDate);
      const end = parseMDY(state.returnDate);
      // If nothing is set, let the picker be empty
      if (!start && !end) {
        return null;
      }

      // Allow partial range: [start, null] or [null, end]
      return [start ?? null, end ?? null];
    },
    set(v) {
      if (!v) {
        state.departureDate = '';
        state.returnDate = '';
        // notify parent that value cleared
        emit('update:modelValue', null);
        return;
      }
      const [a, b] = v;

      state.departureDate = a ? formatter.format(a) : '';
      state.returnDate = b ? formatter.format(b) : '';

      emit('update:modelValue', [a ?? null, b ?? null]);
    },
  });

  const datepickerPtTravelDates = {
    pcInputText: {
      root: {
        'data-cy': 'quote-form-travel-dates',
      },
    },
    pcNextButton: {
      root: {
        'aria-label': 'Next month',
      },
    },
    pcPrevButton: {
      root: {
        'aria-label': 'Previous month',
      },
    },
  };

  // Local UI state: whether the datepicker input is focused.
  function onFocus() {
    isFocused.value = true;
    contentStore.setToolTipStatusById('travel_dates', true)
  }

  function onBlur() {
    isFocused.value = false;
    emit('update:travelDatesFocus');
  }

  /**
   * formatMeta
   * Create a stable string used for `data-test-id` attributes for each date cell.
   * Example output: `dp-2026-01-05`.
   * @param {DatePickerDateSlotOptions} meta - slot metadata provided by PrimeVue
   * @returns {string} formatted id string for the date cell
   */
  function formatMeta(meta: DatePickerDateSlotOptions): string {
    // meta.month is 0–11 in PrimeVue; adjust if needed (it usually is 0-based)
    const y = meta.year;
    const m = String(meta.month + 1).padStart(2, '0');
    const d = String(meta.day).padStart(2, '0');
    return `dp-${y}-${m}-${d}`;
  }

  /**
   * Method to handle travel dates input.
   *
   * @return void
   */
  const handleTravelDates = (): void => {
    const departureDate = dayjs(state.departureDate);
    const returnDate = dayjs(state.returnDate);
    // How long to keep the range calendar open after selecting the end date selection
    const closeDelayMs = 350;

    // We want to make sure that if the user selects a departure date that is after
    // the return date, we clear this field so the user will have to enter a valid date
    // before submission
    if (state.returnDate !== '' && departureDate.isAfter(returnDate)) {
      state.returnDate = '';
      formStore.setReturnDate('');
      sendGtagEvent('return_date_updated', ['']);
    }

    // If the user enters a return date, we would need to make sure the departureDate
    // is within a year from the return date and not before today's date
    if (state.returnDate !== '') {
      const minValidDeparture = returnDate
        .subtract(1, 'year')
        .format('YYYY-MM-DD');
      if (departureDate.isBefore(minValidDeparture)) {
        state.departureDate = '';
        formStore.setDepartureDate('');
        sendGtagEvent('departure_date_updated', ['']);
      }
    }

    formStore.setDepartureDate(formatDate(state.departureDate));
    formStore.setReturnDate(formatDate(state.returnDate));

    const newDepartureDate = dayjs(state.departureDate);
    const newReturnDate = dayjs(state.returnDate);

    if (newDepartureDate.isValid())
      sendGtagEvent('departure_date_updated', [
        formatDate(state.departureDate) ?? '',
      ]);
    if (newReturnDate.isValid()) {
      sendGtagEvent('return_date_updated', [
        formatDate(state.returnDate) ?? '',
      ]);
    }

    if (
      state.returnDate !== '' &&
      state.returnDate !== null &&
      state.departureDate !== '' &&
      state.departureDate !== null
    ) {
      requestAnimationFrame(() => {
        const input = travelDatesRef.value?.$el?.querySelector(
          'input'
        ) as HTMLInputElement | null;
        if (input) {
          input.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Escape',
              code: 'Escape',
              bubbles: true,
            })
          );

          setTimeout(() => {
            travelDatesRef.value.overlayVisible = false;
          }, closeDelayMs);
        }
      });
    }
  };

  const hasActiveQuote = computed(
    () =>
      formStore.hasActiveQuote &&
      !formStore.getIsLoading &&
      formStore.getDepartureDate &&
      formStore.getReturnDate
  );

  watch(hasActiveQuote, (val) => {
    if (val) {
      if (formStore.getDepartureDate && formStore.getReturnDate) {
        props.form.travelDates.value = [
          new Date(formStore.getDepartureDate),
          new Date(formStore.getReturnDate),
        ];
        onBlur();
      }
    }
  });
</script>

<template>
  <p v-if="isFocused && !isOnResultsPage" class="text-sm text-[#333333] pb-[10px]">
    {{ helpText }}
  </p>
  <div class="input-with-left-icon" :class="{ 'with-icon': props.isValid }">
    <img v-if="props.isValid" :src="CheckIcon" class="left-icon" alt="valid" />
    <DatePicker
      ref="travelDatesRef"
      v-model="departureDates"
      @focus="onFocus"
      @hide="onBlur"
      v-inputmask="{
        mask: '99/99/9999 - 99/99/9999',
        placeholder: 'MM/DD/YYYY - MM/DD/YYYY',
      }"
      selectionMode="range"
      :manualInput="isMobile ? false : true"
      :numberOfMonths="isMobile ? 1 : 2"
      size="normal"
      :class="[
        formStore.getDepartureDate !== '' &&
        formStore.getDepartureDate !== 'Invalid Date'
          ? 'quote-form-section__date-selected'
          : '',
      ]"
      :minDate="new Date(minDepartureDate)"
      :maxDate="new Date(maxReturnDate)"
      :preventMinMaxNavigation="true"
      :firstDayOfWeek="0"
      :pt="datepickerPtTravelDates"
      inputId="in_label"
      :show-clear="departureDates !== null"
      fluid
      :panelClass="[!isThemeIMT ? 'soventure-date-picker' : 'imt-date-picker']"
      :viewDate="state.departureDate"
      v-bind="$attrs"
      :name="props.name"
      @update:model-value="handleTravelDates()"
    >
      <template #date="slotProps">
        <div :data-test-id="formatMeta(slotProps.date)">
          {{ slotProps.date.day }}
        </div>
      </template>
      <template #clearicon="slotProps">
        <XCircleIcon stroke-width="2" :class="['w-6 !right-2 !top-2/5 !text-[#D4D9DE]', (slotProps as any).class]" @click="slotProps.clearCallback" />
      </template>
    </DatePicker>
  </div>
</template>
