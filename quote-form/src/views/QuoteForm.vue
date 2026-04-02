<script setup lang="ts">
  import { useThemeStore } from '@/store/theme';
  import { computed, ref, reactive, onMounted, watch } from 'vue';
  import { Form } from '@primevue/forms';
  import { zodResolver } from '@primevue/forms/resolvers/zod';
  import type {
    QuoteDetails,
    QuoteFormGeographyDestination,
    QuoteFormGeographyResidence,
  } from '@/types';
  import Message from 'primevue/message';
  import Button from 'primevue/button';
  import { useStorage } from '@vueuse/core';
  import { IMTAPIClient } from '@insuremytrip/imt-com-apps-api-client';
  import { useContentStore } from '@/store/content';
  import { useFormStore } from '@/store/form';
  import CoverageDates from '@/components/CoverageDates.vue';
  import Destination from '@/components/input/Destination.vue';
  import CoverageInfo from '@/components/input/CoverageInfo.vue';
  import { quoteFormSchema } from '@/validation/quoteForm.schema';
  import SelectNumberOfTravelers from '@/components/SelectNumberOfTravelers.vue';
  import TravelerAge from '@/components/TravelerAge.vue';
  import Citizenship from '@/components/Citizenship.vue';
  import ResidenceCountry from '@/components/ResidenceCountry.vue';
  import ResidenceState from '@/components/ResidenceState.vue';
  import {
    redirectToQuoteResults,
    formatDate,
    getErrorMessage,
    getAgeFromDateString,
    validateITPDate,
    parseLocalDate,
  } from '@/utils/commonUtils';
  import { sendGtagEvent } from '@/utils/analytics';
  import { InformationCircleIcon } from '@heroicons/vue/24/outline';
  import ToolTipModal from '@/components/ToolTipModal.vue';
  import ErrorMessage from '@/components/ErrorMessage.vue';

  const themeStore = useThemeStore();
  const contentStore = useContentStore();
  const formStore = useFormStore();

  const isToolTipModalOpen = computed(() => contentStore.isToolTipOpen);

  // Set if we are on mobile for mobile specific help text
  const windowWidth = ref(window.innerWidth);
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth;
  });
  const isMobile = computed(() => windowWidth.value < 768);
  themeStore.setIsMobile(isMobile.value);
  // Keep store synced:
  watch(isMobile, (value) => themeStore.setIsMobile(value));

  const activeQuoteId = useStorage<string | null>('_imtActiveQuoteId', null);

  const getThemeName = computed(() => {
    return themeStore.getCurrentTheme;
  });
  const isOnResultsPage = computed(() => themeStore.isOnResultPage);

  const isAnnual = computed(() => themeStore.getCurrentThemeMode === 'annual');

  const imtComAppsApiClient = new IMTAPIClient({
    apiBaseUrl: import.meta.env.VITE_IMT_COM_APPS_API_BASE_URL,
  });
  const imtComAppsApiAttributionClient = new IMTAPIClient({
    apiBaseUrl: import.meta.env.VITE_WORDPRESS_PLUGIN_URL,
  });
  const initialValues = JSON.parse(JSON.stringify(formStore.getQuoteData));
  const formValues = reactive<QuoteDetails>(initialValues);

  const destinationContent = computed(() =>
    contentStore.getQuoteFormContentByKey('destination')
  );

  const citizenshipContent = computed(() =>
    contentStore.getQuoteFormContentByKey('citizenship')
  );

  const residenceContent = computed(() =>
    contentStore.getQuoteFormContentByKey('residence')
  );

  const state = ref({
    hasDestinationBlur: false,
    hasDestinationStateBlur: false,
    hasCitizenshipBlur: false,
    hasResidenceBlur: false,
    hasResidenceStateBlur: false,
    hasItpBlur: false,
    hasTripCostBlur: false,
    hasTravelDateBlur: false,
  });

  const isDestinationValid = computed(() => {
    if (!state.value.hasDestinationBlur) return true;
    return (
      formValues.destination !== null && formValues.destination !== undefined
    );
  });

  const isDestinationStateValid = computed(() => {
    if (!state.value.hasDestinationStateBlur) return true;
    if (formValues.destination === 'USA') {
      return (
        formValues.destinationState !== null &&
        formValues.destinationState !== undefined
      );
    }
    return true;
  });

  const isCitizenshipValid = computed(() => {
    if (!state.value.hasCitizenshipBlur) return true;
    return (
      formValues.citizenshipCountry !== null &&
      formValues.citizenshipCountry !== undefined
    );
  });

  const isResidenceValid = computed(() => {
    if (!state.value.hasResidenceBlur) return true;
    return (
      formValues.residence.residenceCountry !== null &&
      formValues.residence.residenceCountry !== undefined
    );
  });

  const isResidenceStateValid = computed(() => {
    if (!state.value.hasResidenceStateBlur) return true;
    if (formValues.residence.residenceCountry === 'USA' || isAnnual.value) {
      return (
        formValues.residence.residenceState !== null &&
        formValues.residence.residenceState !== undefined
      );
    }
    return true;
  });

  const isTripCostValid = computed(() => {
    if (!state.value.hasTripCostBlur) return true;
    return formValues?.tripCost !== null && formValues?.tripCost !== undefined && formValues?.tripCost > 0;
  });

  const numberOfTravelers = computed (() => formStore.getNumberOfTravelers);
  const isTripCostLimitValid = computed(() => {
    if (!state.value.hasTripCostBlur) return true;

    const tripCost = formValues?.tripCost ?? 0;
    const travelers = numberOfTravelers.value ?? 1;

    return (
      (tripCost <= travelers * themeStore.getTripCostLimit)
    );
  });

  const travelDatesValid = computed(() => {
    if (!state.value.hasTravelDateBlur) return true;
    return (
      formValues?.travelDates !== null && formValues?.travelDates !== undefined
    );
  });

  const extraFormFieldsValid = computed(() => {
    if (themeStore.getCurrentThemeMode !== 'annual') {
      const destinationIsUSA = formValues.destination === 'USA';
      const residenceIsUSA = formValues.residence.residenceCountry === 'USA';

      const destinationStateOk =
        !destinationIsUSA || state.value.hasDestinationStateBlur;

      const residenceStateOk =
        !residenceIsUSA || state.value.hasResidenceStateBlur;

      const tripCostOk =
        !formStore.getWillProtectTripCost ||
        (state.value.hasTripCostBlur && isTripCostValid.value && isTripCostLimitValid.value);

      const itpOk =
        !formStore.getWillProtectTripCost ||
        (state.value.hasItpBlur && isITPValid.value);

      const travelDatesOk =
        state.value.hasTravelDateBlur && travelDatesValid.value;

      return (
        isDestinationValid.value &&
        isDestinationStateValid.value &&
        isCitizenshipValid.value &&
        isResidenceValid.value &&
        isResidenceStateValid.value &&
        state.value.hasDestinationBlur &&
        destinationStateOk &&
        state.value.hasCitizenshipBlur &&
        state.value.hasResidenceBlur &&
        residenceStateOk &&
        tripCostOk &&
        itpOk &&
        travelDatesOk
      );
    } else {
      const residenceStateOk = state.value.hasResidenceStateBlur;

      return (
        isDestinationValid.value &&
        isDestinationStateValid.value &&
        isCitizenshipValid.value &&
        isResidenceValid.value &&
        isResidenceStateValid.value &&
        residenceStateOk &&
        isITPValid
      );
    }
  });

  onMounted(async () => {
    await contentStore.initializeCmsContentFromWordpress();

    // @TODO: Utilize Quote Form Modules data to get residence, citizenship and destination data
    try {
      const response =
        await imtComAppsApiClient.modules.getQuoteFormModulesData();
      if (response.geographyData && response.geographyData !== null) {
        contentStore.setGeographyData(response.geographyData);
        countries.value = contentStore.getDestinationList;
        states.value = contentStore.getStatesList;
      } else {
        console.error('No geography data found');
      }
    } catch (error) {
      console.error(error);
    }

    formStore.setIsLoading(true);

    // If Quote ID is present in local storage, get quote details
    // Otherwise, mark loading finished (new quote)
    if (activeQuoteId.value) {
      formStore.setQuoteId(activeQuoteId.value);
      try {
        const response = await imtComAppsApiClient.quote.getQuoteDetails(
          activeQuoteId.value
        );

        const originatingSource = response.originatingSource;
        const themeMode = themeStore.getCurrentThemeMode;
        // We do not want to prefill data if our quote was made in a differing subflow, so instead we will just clear the loading state and let the user fill out the form
        if (
          (originatingSource && originatingSource !== themeMode) ||
          (!originatingSource && themeMode !== 'default')
        ) {
          formStore.setIsLoading(false);
          formStore.setActiveQuoteId(null);
          return;
        }

        if (response.trip && response.trip !== null) {
          formStore.setDestinationCountry(
            response.trip.destinations[0]?.country ?? null
          );
          formStore.setDestinationState(
            response.trip.destinations[0]?.stateProvince ?? null
          );
          // Only prefill travel dates if departure date is today or in the future.
          if (response.trip.departureDate && response.trip.returnDate) {
            const dep = parseLocalDate(response.trip.departureDate);
            const ret = parseLocalDate(response.trip.returnDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dep >= today) {
              formValues.travelDates = [dep, ret];
              formStore.setDepartureDate(formatDate(dep));
              formStore.setReturnDate(formatDate(ret));
            }
          } else {
            formValues.travelDates = null;
          }
          formValues.numberOfTravelers = response.travelers.length;
          formStore.setNumberOfTravelers(response.travelers.length);

          const travelerAges = response.travelers.map(
            (traveler) => traveler.dateOfBirth
          );

          formStore.setTravelers(travelerAges);

          formStore.setCitizenship(response.travelers[0]?.citizenship ?? null);
          formStore.setResidenceCountry(
            response.travelers[0]?.residence?.country ?? null
          );
          formStore.setResidenceState(
            response.travelers[0]?.residence?.stateProvince ?? null
          );

          // Same logic as old quote form - if user entered $0 or blank trip cost on soventure we set the trip cost to be $1 per traveler, we set it back to 0          
          if (
            themeStore.isThemeSoventure &&
            response.travelers[0]?.tripCost === response.travelers.length &&
            'coverTripCost' in response.metadata &&
            !response.metadata.coverTripCost
          ) {
            formStore.setTripCost(null);
          } else {
            formStore.setTripCost(response.travelers[0]?.tripCost ?? null);
          }

          formStore.setITP(response.trip?.initialTripPaymentDate ?? null);

          if (response.planParameters) {
            formStore.setPlanParameters(response.planParameters);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        // Ensure loading is cleared in all cases after attempting to load the quote
        formStore.setIsLoading(false);
      }
    } else {
      // No active quote — loading finished for new quote
      formStore.setIsLoading(false);
    }
  });

  const states = ref<QuoteFormGeographyResidence[]>([]);
  const countries = ref<QuoteFormGeographyDestination[]>([]);

  // True if all traveler ages are filled
  const areTravelerAgesValid = computed(() => {
    if (!formValues.travelerAges) return false;

    const ages = Object.values(formValues.travelerAges);
    // Make sure there’s one age for each traveler
    return (
      ages.length === formValues.numberOfTravelers &&
      ages.every((age) => age !== null && age !== undefined)
    );
  });

  // Validate our ITP if it exists, otherwise valid is true as this is optional
  const isITPValid = computed(() => {
    if (!state.value.hasItpBlur || !formStore.getWillProtectTripCost)
      return true;
    return formValues.itp ? validateITPDate(formValues.itp) : false;
  });

  // Show traveler info help text only when any input inside this component is focused
  const travelerAgeContainer = ref<HTMLElement | null>(null);
  const isAnyFocused = ref(false);

  function onFocusIn() {
    isAnyFocused.value = true;
  }

  function onFocusOut(e: FocusEvent) {
    // If focus moved to another element inside the container, keep it visible
    const related = e.relatedTarget as Node | null;
    if (
      related &&
      travelerAgeContainer.value &&
      travelerAgeContainer.value.contains(related)
    )
      return;
    isAnyFocused.value = false;
  }

  const travelerInfoHelpText = computed(() => {
    return isMobile.value
      ? contentStore.getQuoteFormContentByKey('traveler_info')
          .help_content_mobile
      : contentStore.getQuoteFormContentByKey('traveler_info').help_content;
  });

  // Show traveler info help text only when any input inside this component is focused
  const ResidenceStateContainer = ref<HTMLElement | null>(null);
  const isResidenceStateAnyFocused = ref(false);

  function onResidenceStateFocusIn() {
    isResidenceStateAnyFocused.value = true;
  }

  function onResidenceStateFocusOut(e: FocusEvent) {
    // If focus moved to another element inside the container, keep it visible
    const related = e.relatedTarget as Node | null;
    if (
      related &&
      ResidenceStateContainer.value &&
      ResidenceStateContainer.value.contains(related)
    )
      return;
    isResidenceStateAnyFocused.value = false;
  }

  const ResidenceInfoHelpText = computed(() => {
    return isMobile.value
      ? contentStore.getQuoteFormContentByKey('residence').help_content_mobile
      : contentStore.getQuoteFormContentByKey('residence').help_content;
  });

  // Handle form submission
  // Event contains validated values
  const formSubmitAttempted = computed(() => formStore.getFormSubmissionState);

  const onFormSubmit = async () => {
    if (formSubmitAttempted.value) return;

    formStore.setFormSubmission(true);
    formStore.setErrors([]);
    try {
      const quoteRequest = formStore.transformFormToQuoteRequest();
      localStorage.setItem('quoteFormEventData', JSON.stringify(quoteRequest));

      const response =
        await imtComAppsApiClient.quote.createQuote(quoteRequest);
      if (
        response &&
        typeof response.id === 'string' &&
        response.id.length > 0
      ) {
        const primaryTraveler = quoteRequest.travelers[0];
        const citizenship = primaryTraveler?.citizenship ?? '';
        const residenceCountry = primaryTraveler?.residence?.country ?? '';
        const residenceState = primaryTraveler?.residence?.stateProvince ?? '';
        const tripCost = primaryTraveler?.tripCost ?? '';
        const trip = quoteRequest.trip;
        const departureDate = trip?.departureDate ?? '';
        const returnDate = trip?.returnDate ?? '';
        const destinationCountry = trip?.destinations[0]?.country ?? '';
        const destinationState = trip?.destinations[0]?.stateProvince ?? '';
        const initialTripPaymentDate = trip?.initialTripPaymentDate ?? '';
        const travelerAges = quoteRequest.travelers
          .map((traveler) => {
            return getAgeFromDateString(traveler.dateOfBirth);
          })
          .toString();

        sendGtagEvent('quote_form_submitted', [
          response.id,
          citizenship,
          residenceCountry,
          residenceState,
          departureDate,
          returnDate,
          destinationCountry,
          destinationState,
          travelerAges,
          tripCost,
          initialTripPaymentDate,
        ]);

        localStorage.setItem('_imtActiveQuoteId', response.id);
        await imtComAppsApiAttributionClient.attribution.sendQuoteAttribution(
          false,
          response.id,
          window.imtQuoteAttributionLogging?.nonce ?? ''
        );
        await redirectToQuoteResults(
          themeStore.getCurrentThemeMode,
          response.id
        );
      }
    } catch (error: any) {
      const message = getErrorMessage(error);
      sendGtagEvent('quote_form_submit_failed', [message]);
      const validationErrors = error?.response?.data?.errors;
      // Show properties causing error or a default error message.
      const errorMessages = validationErrors?.length
        ? validationErrors.map((e: any) => `"${e?.property}" ${e?.message}`)
        : [
            'An error has occured when processing your request. Please try again.',
          ];

      formStore.setErrors(errorMessages);
    } finally {
      formStore.setFormSubmission(false);
    }
  };

  /**
   * Sets tooltip id in session store.
   */
  const handleClick = (toolTip: any, type: string) => {
    contentStore.setActiveToolTip(toolTip);
    contentStore.setToolTipModalOpen(true);

    // Fire Event For ToolTip
    sendGtagEvent('quote_form_tool_tip', [type]);
  };
</script>

<template>
  <ErrorMessage />
  <!--
    PrimeVue Form component uses a slot that exposes $form object
    Validation state is accessed via $form.fieldName
  -->
  <Form
    v-slot="$form"
    :resolver="
      zodResolver(quoteFormSchema(contentStore, themeStore))
    "
    :initialValues="formValues"
    @submit="onFormSubmit"
    :class="`quote-form__container ${getThemeName} flex flex-col justify-center`"
  >
    <h2 v-if="!isOnResultsPage" class="quote-form__header">
      <!-- Header -->
      {{ contentStore.getQuoteFormHeadline }}
    </h2>

    <!-- Destination Section -->
    <div
      class="quote-form__section-destination w-full"
      v-if="themeStore.isDestinationSectionEnabled"
    >
      <Message
        v-if="!isDestinationValid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ destinationContent.country.error_message }}
      </Message>
      <Message
        v-if="!isDestinationStateValid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ destinationContent.state.error_message }}
      </Message>
      <label class="quote-form__label">
        <span class="font-bold">{{ destinationContent.header }}</span>
        <button
          v-if="
            contentStore.getToolTipStatusById('destination') &&
            contentStore.hasAnyContent(
              contentStore.getQuoteFormContentByKey('destination').tool_tip
            )
          "
          @click.prevent="
            handleClick(destinationContent.tool_tip, 'destination')
          "
          class="icon-button"
          aria-label="coverage-info"
        >
          <InformationCircleIcon :class="['size-5', 'stroke-action-primary']" />
        </button>
      </label>
      <Destination
        @update:destination="
          (v: QuoteFormGeographyDestination | null) => {
            return (formValues.destination = v?.code ?? null);
          }
        "
        @update:destinationState="
          (v: QuoteFormGeographyResidence | null) => {
            return (formValues.destinationState = v?.code ?? null);
          }
        "
        @update:destinationFocus="() => (state.hasDestinationBlur = true)"
        @update:destinationStateFocus="
          () => (state.hasDestinationStateBlur = true)
        "
        :destinations="countries"
        :destination-states="states"
        :is-destination-valid="isDestinationValid"
        :is-destination-state-valid="isDestinationStateValid"
      >
      </Destination>
    </div>

    <!-- Travel Dates Section -->
    <div
      class="quote-form__section-travel-dates"
      v-if="themeStore.isTravelDatesSectionEnabled"
    >
      <Message
        v-if="$form?.travelDates?.invalid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ $form.travelDates?.error.message }}
      </Message>
      <label class="quote-form__label">
        <span class="font-bold">{{
          contentStore.getQuoteFormContentByKey('travel_dates').header
        }}</span>
        <button
          v-if="
            contentStore.getToolTipStatusById('travel_dates') &&
            contentStore.hasAnyContent(
              contentStore.getQuoteFormContentByKey('travel_dates').tool_tip
            )
          "
          @click.prevent="
            handleClick(
              contentStore.getQuoteFormContentByKey('travel_dates').tool_tip,
              'travel_dates'
            )
          "
          class="icon-button"
          aria-label="coverage-info"
        >
          <InformationCircleIcon :class="['size-5', 'stroke-action-primary']" />
        </button>
      </label>
      <CoverageDates
        v-model="formValues.travelDates"
        :form="$form"
        name="travelDates"
        @update:travelDatesFocus="() => (state.hasTravelDateBlur = true)"
        :is-valid="!!formValues.travelDates && !$form?.travelDates?.invalid"
      />
    </div>

    <!-- Citizenship Section Annual -->
    <div
      class="quote-form__section-citizenship"
      v-if="themeStore.isCitizenshipSectionEnabled && isAnnual"
    >
      <Message
        v-if="!isResidenceStateValid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ residenceContent.state.error_message }}
      </Message>

      <label class="quote-form__label">
        <span class="font-bold">{{
          contentStore.getQuoteFormContentByKey('citizenship').header
        }}</span>
        <button
          v-if="
            contentStore.getToolTipStatusById('citizenship') &&
            contentStore.hasAnyContent(
              contentStore.getQuoteFormContentByKey('citizenship').tool_tip
            ) &&
            themeStore.getCurrentThemeMode !== 'annual'
          "
          @click.prevent="
            handleClick(
              contentStore.getQuoteFormContentByKey('citizenship').tool_tip,
              'citizenship'
            )
          "
          class="icon-button"
          aria-label="coverage-info"
        >
          <InformationCircleIcon :class="['size-5', 'stroke-action-primary']" />
        </button>
      </label>
      <div @focusin="contentStore.setToolTipStatusById('citizenship', true)">
        <div
          class="flex md:flex-row flex-col items-center gap-[10px] mt-[10px]"
        >
          <div class="flex-1 w-full">
            <label class="quote-form__label">
              <span class="font-bold">{{
                contentStore.getQuoteFormContentByKey('residence').header
              }}</span>
              <button
                v-if="
                  contentStore.getToolTipStatusById('citizenship') &&
                  contentStore.hasAnyContent(
                    contentStore.getQuoteFormContentByKey('citizenship')
                      .tool_tip
                  )
                "
                @click.prevent="
                  handleClick(
                    contentStore.getQuoteFormContentByKey('citizenship')
                      .tool_tip,
                    'citizenship'
                  )
                "
                class="icon-button"
                aria-label="coverage-info"
              >
                <InformationCircleIcon
                  :class="['size-5', 'stroke-action-primary']"
                />
              </button>
            </label>
            <p
              v-if="isResidenceStateAnyFocused"
              class="text-sm text-[#333333] pb-[10px]"
            >
              {{ ResidenceInfoHelpText }}
            </p>
            <div
              class="flex flex-col items-start md:flex-col gap-0"
              ref="ResidenceStateContainer"
              @focusin="onResidenceStateFocusIn"
              @focusout="onResidenceStateFocusOut"
            >
              <ResidenceState
                @update:residenceState="
                  (v: string | null) => {
                    return (formValues.residence.residenceState = v ?? null);
                  }
                "
                @update:residenceCountry="
                  (v: string | null) => {
                    return (formValues.residence.residenceCountry = v ?? null);
                  }
                "
                @update:residenceStateFocus="
                  () => (state.hasResidenceStateBlur = true)
                "
                :is-valid="isResidenceStateValid"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Number of Travelers Section -->
    <div
      class="quote-form__section-number-of-travelers"
    >
      <Message
        v-if="formSubmitAttempted && !areTravelerAgesValid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{
          contentStore.getQuoteFormContentByKey('traveler_info').age
            .error_message
        }}
      </Message>
      <label class="quote-form__label">
        <span class="font-bold">{{
          contentStore.getQuoteFormContentByKey('traveler_info').header
        }}</span>
        <button
          v-if="
            contentStore.getToolTipStatusById('traveler_info') &&
            contentStore.hasAnyContent(
              contentStore.getQuoteFormContentByKey('traveler_info').tool_tip
            )
          "
          @click.prevent="
            handleClick(
              contentStore.getQuoteFormContentByKey('traveler_info').tool_tip,
              'traveler_info'
            )
          "
          class="icon-button"
          aria-label="coverage-info"
        >
          <InformationCircleIcon :class="['size-5', 'stroke-action-primary']" />
        </button>
      </label>
      <p v-if="isAnyFocused" class="text-sm text-[#333333] pb-[10px]">
        {{ travelerInfoHelpText }}
      </p>
      <div
        class="flex md:flex-row flex-col items-start gap-[15px]"
        ref="travelerAgeContainer"
        @focusin="
          onFocusIn();
          contentStore.setToolTipStatusById('traveler_info', true);
        "
        @focusout="onFocusOut"
      >
        <SelectNumberOfTravelers
          v-model="formValues.numberOfTravelers"
          :invalid="$form.numberOfTravelers?.invalid"
          :errorMessage="$form.numberOfTravelers?.error?.message"
        />
        <TravelerAge
          :number-of-travelers="formValues.numberOfTravelers"
          v-model="formValues.travelerAges"
          :submitAttempted="formSubmitAttempted"
        />
      </div>
    </div>

    <!-- Citizenship Section -->
    <div
      class="quote-form__section-citizenship"
      v-if="themeStore.isCitizenshipSectionEnabled"
    >
      <Message
        v-if="!isCitizenshipValid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ citizenshipContent.error_message }}
      </Message>
      <Message
        v-if="!isResidenceValid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ residenceContent.country.error_message }}
      </Message>
      <Message
        v-if="!isResidenceStateValid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ residenceContent.state.error_message }}
      </Message>

      <label class="quote-form__label">
        <span class="font-bold">{{
          contentStore.getQuoteFormContentByKey('citizenship').header
        }}</span>
        <button
          v-if="
            contentStore.getToolTipStatusById('citizenship') &&
            contentStore.hasAnyContent(
              contentStore.getQuoteFormContentByKey('citizenship').tool_tip
            ) &&
            themeStore.getCurrentThemeMode !== 'annual'
          "
          @click.prevent="
            handleClick(
              contentStore.getQuoteFormContentByKey('citizenship').tool_tip,
              'citizenship'
            )
          "
          class="icon-button"
          aria-label="coverage-info"
        >
          <InformationCircleIcon :class="['size-5', 'stroke-action-primary']" />
        </button>
      </label>
      <div @focusin="contentStore.setToolTipStatusById('citizenship', true)">
        <div v-if="themeStore.isCitizenshipCountryEnabled">
          <Citizenship
            @update:citizenship="
              (v: string | null) => {
                return (formValues.citizenshipCountry = v ?? null);
              }
            "
            @update:citizenshipFocus="() => (state.hasCitizenshipBlur = true)"
            :is-valid="isCitizenshipValid"
          />
        </div>

        <div
          class="flex md:flex-row flex-col items-center gap-[10px] mt-[10px]"
        >
          <div
            class="flex-1 w-full"
            v-if="themeStore.isResidenceCountryEnabled"
          >
            <ResidenceCountry
              @update:residence="
                (v: string | null) => {
                  return (formValues.residence.residenceCountry = v ?? null);
                }
              "
              @update:residenceState="
                (v: string | null) => {
                  return (formValues.residence.residenceState = v ?? null);
                }
              "
              @update:residenceFocus="() => (state.hasResidenceBlur = true)"
              :is-valid="isResidenceValid"
              :input-class="
                formValues.residence.residenceCountry === 'USA'
                  ? 'min-w-54'
                  : 'w-full'
              "
            />
          </div>

          <div
            v-if="
              formValues.residence.residenceCountry &&
              formValues.residence.residenceCountry === 'USA' &&
              themeStore.isResidenceStateEnabled
            "
            class="flex-1 w-full"
          >
            <ResidenceState
              @update:residenceState="
                (v: string | null) => {
                  return (formValues.residence.residenceState = v ?? null);
                }
              "
              @update:residenceCountry="
                (v: string | null) => {
                  return (formValues.residence.residenceCountry = v ?? null);
                }
              "
              @update:residenceStateFocus="
                () => (state.hasResidenceStateBlur = true)
              "
              :is-valid="isResidenceStateValid"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Coverage Info Section -->
    <div
      class="quote-form__section-coverage-info"
      v-if="themeStore.isTripCostSectionEnabled"
    >
      <Message
        v-if="!isTripCostLimitValid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ `Maximum cannot exceed ${themeStore.getFormattedTripCostLimit} per traveler.` }}
      </Message>
      <Message
        v-else-if="!isTripCostValid && formStore.getWillProtectTripCost"
        severity="error"
        size="small"
        variant="simple"
      >
        {{
          contentStore.getQuoteFormContentByKey('coverage_info').trip_cost
            .error_message
        }}
      </Message>
      <Message
        v-if="!isITPValid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{
          contentStore.getQuoteFormContentByKey('coverage_info')
            .initial_trip_payment_date.error_message
        }}
      </Message>
      <label class="quote-form__label">
        <span class="font-bold">{{
          contentStore.getQuoteFormContentByKey('coverage_info').header
        }}</span>
        <button
          v-if="
            contentStore.getToolTipStatusById('coverage_info') &&
            contentStore.hasAnyContent(
              contentStore.getQuoteFormContentByKey('coverage_info').tool_tip
            )
          "
          @click.prevent="
            handleClick(
              contentStore.getQuoteFormContentByKey('coverage_info').tool_tip,
              'coverage_info'
            )
          "
          class="icon-button"
          aria-label="coverage-info"
        >
          <InformationCircleIcon :class="['size-5', 'stroke-action-primary']" />
        </button>
      </label>
      <div @focusin="contentStore.setToolTipStatusById('coverage_info', true)">
        <CoverageInfo
          :form="$form"
          @update:itp="(v: Date | null) => (formValues.itp = v)"
          @update:tripCost="(v: number | null) => (formValues.tripCost = v)"
          @update:itpFocus="(v: boolean) => (state.hasItpBlur = v)"
          @update:tripCostFocus="(v: boolean) => (state.hasTripCostBlur = v)"
          :is-valid="isITPValid"
        />
      </div>
    </div>

    <!-- Submit Button Section -->
    <div
      class="quote-form__section-submit-button"
    >
      <Button
        type="submit"
        label="See Plans & Prices"
        class="quote-form-submit cursor-pointer"
        fluid
        data-cy="quote-form-submit-btn"
        :disabled="
          !extraFormFieldsValid ||
          !$form.valid ||
          !areTravelerAgesValid ||
          formSubmitAttempted
        "
        :loading="formSubmitAttempted"
      />
    </div>
  </Form>
  <ToolTipModal v-if="isToolTipModalOpen" />
</template>

<style scoped>
  .quote-form__section-destination,
  .quote-form__section-travel-dates,
  .quote-form__section-number-of-travelers,
  .quote-form__section-citizenship,
  .quote-form__section-residence,
  .quote-form__section-coverage-info {
    margin-bottom: 1.5rem;
  }

  @media (max-width: 768px) {
    .quote-form__section-destination,
    .quote-form__section-travel-dates,
    .quote-form__section-number-of-travelers,
    .quote-form__section-citizenship,
    .quote-form__section-residence,
    .quote-form__section-coverage-info {
      margin-bottom: 0.5rem;
    }
  }

  .quote-form__label {
    display: flex;
    margin-bottom: 0.5rem;
    font-weight: 500;
    justify-content: space-between;
  }

  .icon-button {
    width: 1.25rem;
    color: #8c8c8c;
    hover {
      cursor: pointer;
    }
  }

  .icon-button:hover {
    cursor: pointer;
  }
</style>
