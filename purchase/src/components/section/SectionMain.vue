<script setup>
  import { useContentStore } from 'src/store/modules/content.js';
  import { computed, watch, ref, onMounted } from 'vue';
  import { useFormStore } from 'src/store/modules/form.js';
  import { useApiStore } from 'src/store/modules/api.js';
  import { useAppDataStore } from 'src/store/modules/preloadedData.js';
  import * as Input from 'src/components/input';
  import BaseFormGroup from 'src/components/base/BaseFormGroup.vue';
  import CloudflareTurnstile from 'src/components/utility/CloudflareTurnstile/index.vue';
  import { ORDER_STATE, PARTNER_REQUEST_STATUS } from 'src/config/index.js';
  import { getRandomNumber } from 'src/utility/index.js';
  import * as configcat from 'configcat-js';
  import { useRouter } from 'vue-router';

  const contentStore = useContentStore();
  const formStore = useFormStore();
  const apiStore = useApiStore();
  const preloadedData = useAppDataStore();
  const router = useRouter();

  const configCatClient = configcat.getClient(
    import.meta.env.VITE_CONFIG_CAT_SDK_KEY
  );

  const addressLookupEnabled = ref(false);
  const clickthroughsInLink = ref(false);

  const initializeClickthroughsInLink = async () => {
    try {
      clickthroughsInLink.value = await configCatClient?.getValueAsync(
        'imt_20260121_pbm_clickthrough_buy_modal',
        false
      );
    } catch (error) {
      console.error(
        'Error fetching clickthroughs in link feature flag:',
        error
      );
      clickthroughsInLink.value = false;
    }
  };

  // Initialize the address lookup feature flag
  const initializeAddressLookup = async () => {
    try {
      addressLookupEnabled.value = await configCatClient?.getValueAsync(
        'imt_20250807_enable_address_lookup_buy_page_us_release',
        false
      );

      const enableAddressLookupByOrderId = await configCatClient?.getValueAsync(
        'imt_20250812_enable_address_by_orderid_us_release',
        ''
      );

      const disableAddressLookupByPlanCode =
        await configCatClient?.getValueAsync(
          'imt_20250814_disable_address_lookup_by_plan_code_us_release',
          ''
        );

      // Get the order id from the url
      const urlParams = new URLSearchParams(window.location.search);

      // If the plan code is in the disabled list, disable address lookup
      // This is a temporary solution if we learn specific plans are causing transmit issues
      // from the address lookup service selections.
      if (disableAddressLookupByPlanCode !== '') {
        const disabledPlanCodes = disableAddressLookupByPlanCode
          .trim()
          .split(',');

        const currentProductCode = urlParams.get('_pc');

        if (disabledPlanCodes.includes(currentProductCode)) {
          addressLookupEnabled.value = false;
        }
      }

      const currentOrderId = urlParams.get('_oid');

      if (
        enableAddressLookupByOrderId !== '' &&
        enableAddressLookupByOrderId === currentOrderId
      ) {
        addressLookupEnabled.value = true;
      }
    } catch (error) {
      console.error('Error fetching address lookup feature flag:', error);
      addressLookupEnabled.value = false;
    }
  };

  const isUSResident = computed(() => {
    return formStore.getCountry('residence') === 'USA';
  });

  const isBillingUSResident = computed(() => {
    return formStore.getCountry('billing') === 'USA';
  });

  // Call the initialization function when the component is mounted
  onMounted(() => {
    initializeAddressLookup();
    initializeClickthroughsInLink();
  });

  const creditCardDisplayData = computed(() => {
    const allowedTypes = formStore.getAcceptedCreditCards;
    return contentStore.getCreditCardDisplayData(allowedTypes);
  });

  const loaderIdentifier = 'form-loader';
  const loaderFieldSet = computed(() =>
    contentStore.getFieldSet(loaderIdentifier)
  );

  const travelersIdentifier = 'form-travelers';
  const travelerFieldSet = computed(() =>
    contentStore.getFieldSet(travelersIdentifier)
  );

  const passportsIdentifier = 'form-passports';
  const passportFieldSet = computed(() =>
    contentStore.getFieldSet(passportsIdentifier)
  );

  const paymentIdentifier = 'form-payment';
  const paymentFieldSet = computed(() =>
    contentStore.getFieldSet(paymentIdentifier)
  );

  const tosIdentifier = 'form-terms-of-service';
  const tosFieldSet = computed(() => contentStore.getFieldSet(tosIdentifier));

  const marketingIdentifier = 'form-marketing-opt-in';
  const marketingFieldSet = computed(() =>
    contentStore.getFieldSet(marketingIdentifier)
  );
  const hideMarketingOptin = computed(
    () => preloadedData.getHideMarketingOptin
  );

  const travelSupplierIdentifier = 'form-travel-suppliers';
  const travelSupplierFieldSet = computed(() =>
    contentStore.getFieldSet(travelSupplierIdentifier)
  );

  const tripDetailsIdentifier = 'form-trip-details';
  const tripDetailsFieldSet = computed(() =>
    contentStore.getFieldSet(tripDetailsIdentifier)
  );

  const numberOfTravelers = computed(() => formStore.getNumberOfTravelers);

  const clickthroughs = computed(() => contentStore.getClickThroughs);

  const clickthroughsVerbose = computed(() =>
    clickthroughs.value.filter((clickthrough) => clickthrough.modalTag)
  );

  const clickthroughsToDisplayOnForm = computed(() => {
    if (clickthroughsInLink.value) {
      return clickthroughs.value.filter(
        (clickthrough) =>
          !clickthrough.modalTag &&
          (clickthrough.type === 'text' || clickthrough.type === 'multi')
      );
    }
    return clickthroughs.value.filter((clickthrough) => !clickthrough.modalTag);
  });

  const clickthroughsNonModalTagNoSignature = computed(() =>
    clickthroughs.value.filter(
      (clickthrough) =>
        !clickthrough.modalTag &&
        clickthrough.type !== 'text' &&
        clickthrough.type !== 'multi'
    )
  );

  /**
   * @var {Object} privacyPolicyData
   */
  const privacyPolicyData = contentStore.getPrivacyPolicyLink;

  /**
   * @var {String} legalText
   */
  const legalText = contentStore.getLegalText;

  /**
   * @var {Boolean} showCaptcha Captcha visibility status
   */
  const showCaptcha = computed(() => formStore.getShowCaptcha);

  // We want to trigger an event to track whenever a section of the buy page has been completed
  const watchSection = (sectionName) => {
    let sectionCompleted = computed(() =>
      formStore.isSectionComplete(sectionName)
    );
    watch(sectionCompleted, (completed) => {
      if (completed) {
        if (sectionName === 'tripDetails')
          formStore.setTripDetailsChanged(true);
      }
      formStore.trackSectionCompletion(sectionName, completed);
    });
  };

  // We are watching order detail state and presenting a modal if product is no longer available.
  const orderDetailState = computed(() => apiStore.getOrderDetailState);
  watch(orderDetailState, (newState) => {
    if (newState === ORDER_STATE.NO_LONGER_AVAILABLE) {
      const productNoLongerAvailable = contentStore.getModal(
        'productNoLongerAvailable'
      );
      contentStore.setModalData(productNoLongerAvailable);
      contentStore.setShowModal(true);
      contentStore.setShowPageLoader(false);
    }
  });

  watchSection('travelers');
  watchSection('passport');
  watchSection('payment');
  watchSection('billing');
  watchSection('termsOfService');
  watchSection('tripDetails');

  const displayAgeChangeStatus = computed(() =>
    Array(numberOfTravelers.value)
      .fill()
      .map((_, index) => formStore.getAgeChangedStatus(index))
  );

  const displayField = computed(() => apiStore.getOrderDisplayFields);
  const isITPInQuoteDetails = computed(() => apiStore.checkIfITPInQuoteDetails);
  const helpTextContent = computed(() =>
    contentStore.getInput('tripDetailsHelpText')
  );
  const hideForm = computed(
    () =>
      contentStore.getPageLoaderData?.id === 'initial-load' &&
      contentStore.getIsPageLoaderDisplayed
  );
  const residenceCountry = computed(() => formStore.getResidenceCountry);

  const allowResidenceChange = computed(() => {
    return contentStore.getAllowResidenceChange;
  });

  const showEditableResidenceState = computed(() => {
    return (
      displayField.value['residence.stateProvince'] &&
      allowResidenceChange.value &&
      (residenceCountry.value === 'USA' || residenceCountry.value === 'CAN')
    );
  });

  if (localStorage.getItem('partnerEvents') === null) {
    localStorage.setItem('partnerEvents', PARTNER_REQUEST_STATUS.INIT);
  }

  const displayTravelSupplierField = computed(
    () => !contentStore.isFieldOptional('form-travel-suppliers')
  );
  // We are watching order pay status state and redirecting the user if there is a sanction hold
  const orderPayStatus = computed(() => apiStore.getPayStatus);
  watch(orderPayStatus, (newState) => {
    if (newState === 'SANCTIONS_HOLD') {
      const pageType = 'delay';
      router.push({
        name: 'Confirmation',
        query: {
          pageType,
          productCode: apiStore.getProductCodeFromUrl(),
        },
      });
    }
  });
</script>

<template>
  <section v-if="hideForm">
    <!-- Basic skeleton loader -->
    <BaseFormGroup
      v-for="index in 5"
      :key="index"
      :identifier="loaderIdentifier"
      :title="loaderFieldSet.title"
      :hint="loaderFieldSet.hint"
    >
      <template #inner>
        <div class="w-2/4 bg-gray-300 h-5 rounded-md animate-pulse mb-5"></div>
        <div
          v-for="colIndex in getRandomNumber(4, 8)"
          :key="colIndex"
          class="grid grid-cols-12 gap-4 mb-2"
        >
          <div
            v-for="col in getRandomNumber(1, 3)"
            :key="col"
            :class="`col-span-${getRandomNumber(
              3,
              4
            )} bg-gray-300 h-3 rounded-md animate-pulse mb-5`"
          ></div>
        </div>
      </template>
    </BaseFormGroup>
  </section>

  <section v-else class="purchase-form">
    <!-- Trip Details -->
    <BaseFormGroup
      :identifier="tripDetailsIdentifier"
      :title="tripDetailsFieldSet.title"
      :hint="tripDetailsFieldSet?.hint"
      :display="displayField.displayTripDetails"
    >
      <template #inner>
        <div class="grid grid-cols-12 sm:grid-cols-10 gap-4 gap-y-8 mt-2">
          <template
            v-if="displayField['trip.firstTripPayment'] && !isITPInQuoteDetails"
          >
            <div class="col-span-12 sm:col-span-5">
              <Input.FirstTripPaymentDate />
            </div>
            <div class="trip-details__help-text col-span-12 sm:col-span-5 p-6">
              <p>{{ helpTextContent.helpTextFirstRow }}</p>
            </div>
          </template>
          <template v-if="displayField['trip.finalTripPayment']">
            <div class="col-span-12 sm:col-span-5">
              <Input.FinalTripPaymentDate
                :min-date="formStore.getInitialTripPaymentDate"
              />
            </div>
            <div class="trip-details__help-text col-span-12 sm:col-span-5 p-6">
              <p>{{ helpTextContent.helpTextSecondRow }}</p>
            </div>
          </template>
          <template v-if="displayField['trip.school']">
            <div class="col-span-12 sm:col-span-5">
              <Input.SchoolName />
            </div>
            <div class="trip-details__help-text col-span-12 sm:col-span-5 p-6">
              <p>{{ helpTextContent.helpTextThirdRow }}</p>
            </div>
          </template>
        </div>
      </template>
    </BaseFormGroup>

    <BaseFormGroup
      :identifier="travelersIdentifier"
      :title="travelerFieldSet.title"
      :hint="travelerFieldSet.hint"
      class="base-form-group"
    >
      <template #inner>
        <p class="mt-2 purchase-form__subtext">Traveler 1 (Primary Traveler)</p>
        <div class="grid grid-cols-12 sm:grid-cols-10 gap-4 gap-y-10 mt-2">
          <div
            v-if="displayField[`travelers.${0}.name.first`]"
            class="col-span-12 sm:col-span-5"
          >
            <Input.TravelerFirstName model-id="travelerFirstName" :index="0" />
          </div>
          <div
            v-if="displayField[`travelers.${0}.name.last`]"
            class="col-span-12 sm:col-span-5"
          >
            <Input.TravelerLastName model-id="travelerLastName" :index="0" />
          </div>
          <div
            v-if="displayField[`travelers.${0}.dob`]"
            class="col-span-5 sm:col-span-3 base-form-group__travelerDOB"
          >
            <Input.TravelerDOB model-id="travelerDOB" :index="0" />
          </div>
          <div
            class="col-span-3 md:col-span-1 min-[1024px]:col-span-2 min-[1160px]:col-span-1"
          >
            <Input.TravelerAge model-id="travelerAge" :index="0" />
          </div>
          <div
            :class="`col-span-12 md:col-span-6 lg:col-span-6 items-center ${
              displayAgeChangeStatus[0] ? 'flex' : 'display-none'
            }`"
          >
            <Input.DOBChangeSuccessText />
          </div>
          <div
            v-if="displayField['residence.citizenship']"
            class="col-span-12 sm:col-span-5 sm:col-start-1"
          >
            <Input.ResidenceCitizenship />
          </div>
        </div>

        <!-- Residency -->
        <div
          class="grid grid-cols-12 lg:grid-cols-10 gap-4 gap-y-10 pt-10 base-form-group__residence"
        >
          <div
            v-if="displayField['residence.street']"
            class="col-span-12 lg:col-span-5"
          >
            <Input.AddressAutoComplete
              v-if="addressLookupEnabled && isUSResident"
              model-id="residenceAddress"
              type="residence"
            />
            <Input.Address
              v-else
              model-id="residenceAddress"
              type="residence"
            />
          </div>
          <div class="col-span-12 md:col-span-6 lg:col-span-5">
            <Input.AddressSecondary
              model-id="residenceAddressSecondary"
              type="residence"
            />
          </div>
          <div
            v-if="displayField['residence.city']"
            class="col-span-6 lg:col-span-4 sm:col-span-6"
          >
            <Input.City model-id="residenceCity" type="residence" />
          </div>
          <div
            v-if="
              displayField['residence.stateProvince'] && !allowResidenceChange
            "
            class="col-span-3 lg:col-span-1 base-form-group__residence__state"
          >
            <Input.ResidenceState model-id="residenceState" type="residence" />
          </div>
          <div
            v-if="showEditableResidenceState"
            class="col-span-6 lg:col-span-2 sm:col-span-8"
          >
            <Input.State
              model-id="residenceState"
              type="residence"
              :display-country="residenceCountry"
            />
          </div>
          <div
            v-if="displayField['residence.postalCode']"
            class="col-span-4 lg:col-span-2 base-form-group__residence__zip"
          >
            <Input.Zip model-id="residenceZip" type="residence" />
          </div>
          <div
            v-if="displayField['residence.country'] && !allowResidenceChange"
            class="col-span-5 lg:col-span-2 base-form-group__residence__country"
          >
            <Input.ResidenceCountry
              model-id="residenceCountry"
              type="residence"
            />
          </div>
          <div
            v-if="displayField['residence.country'] && allowResidenceChange"
            class="col-span-6 lg:col-span-2 base-form-group__residence__country"
          >
            <Input.Country model-id="residenceCountry" type="residence" />
          </div>
        </div>

        <!-- Email / Phone Number -->
        <div class="grid grid-cols-12 lg:grid-cols-12 gap-4 pt-10">
          <div
            v-if="displayField['contact.email']"
            class="col-span-6 lg:col-span-6"
          >
            <Input.EmailAddress />
          </div>
          <div
            v-if="displayField['contact.phone']"
            class="col-span-6 lg:col-span-6"
          >
            <Input.PhoneNumber />
          </div>
        </div>

        <template v-if="numberOfTravelers > 0">
          <div
            v-for="(item, index) in numberOfTravelers - 1"
            :key="index"
            class="mt-10 border-t-[#AAA] border-t border-solid"
          >
            <p class="mt-10 purchase-form__subtext">Traveler {{ item + 1 }}</p>
            <div class="grid grid-cols-12 sm:grid-cols-10 gap-4 gap-y-4 mt-2">
              <div
                v-if="displayField[`travelers.${item}.name.first`]"
                class="col-span-12 sm:col-span-5"
              >
                <Input.TravelerFirstName
                  model-id="travelerFirstName"
                  :index="item"
                />
              </div>
              <div
                v-if="displayField[`travelers.${item}.name.last`]"
                class="col-span-12 sm:col-span-5"
              >
                <Input.TravelerLastName
                  model-id="travelerLastName"
                  :index="item"
                />
              </div>
              <div
                v-if="displayField[`travelers.${0}.dob`]"
                class="col-span-5 sm:col-span-3 base-form-group__travelerDOB"
              >
                <Input.TravelerDOB model-id="travelerDOB" :index="item" />
              </div>
              <div
                class="col-span-3 md:col-span-1 min-[1024px]:col-span-2 min-[1160px]:col-span-1"
              >
                <Input.TravelerAge model-id="travelerAge" :index="item" />
              </div>
              <div
                :class="`col-span-12 md:col-span-6 lg:col-span-6 items-center ${
                  displayAgeChangeStatus[item] ? 'flex' : 'display-none'
                }`"
              >
                <Input.DOBChangeSuccessText />
              </div>
            </div>
          </div>
        </template>
      </template>
    </BaseFormGroup>

    <!-- Passport -->
    <BaseFormGroup
      v-if="formStore.getIfPassportInfoRequired"
      :identifier="passportsIdentifier"
      :title="passportFieldSet.title"
      :hint="passportFieldSet?.hint"
      :display="displayField.displayPassportFields"
    >
      <template #inner>
        <div
          v-for="(item, index) in numberOfTravelers"
          :key="index"
          :class="[
            index > 0 ? 'mt-10 border-t-[#AAA] border-t border-solid' : '',
          ]"
        >
          <div
            class="grid grid-cols-12 sm:grid-cols-12 md:grid-cols-11 gap-4 gap-y-10 mt-8"
          >
            <div
              v-if="displayField[`passport.${index}.number`]"
              class="col-span-12 sm:col-span-6 lg:col-span-6"
            >
              <Input.PassportNumber :index="index" />
            </div>
            <div
              v-if="displayField[`passport.${index}.issuingCountry`]"
              class="col-span-12 sm:col-span-6 lg:col-span-6 pt-2 sm:pt-0"
            >
              <Input.PassportCountry :index="index" />
            </div>
            <div class="col-span-12 lg:col-span-12 pt-2 sm:pt-0">
              <Input.PassportCheckbox :index="index" />
            </div>
          </div>
        </div>
      </template>
    </BaseFormGroup>

    <!-- Travel Supplier -->
    <BaseFormGroup
      :identifier="travelSupplierIdentifier"
      :title="travelSupplierFieldSet?.title"
      :hint="travelSupplierFieldSet?.hint"
      :optional="travelSupplierFieldSet.optional"
      :display="displayTravelSupplierField"
    >
      <template #inner>
        <div
          class="grid grid-cols-12 sm:grid-cols-12 md:grid-cols-11 lg:grid-cols-12 gap-4 gap-y-10 mt-5"
        >
          <div
            class="col-span-12 lg:col-span-6 sm:col-span-12 order-last lg:order-first"
          >
            <div class="flex flex-col gap-4 gap-y-10">
              <Input.Airline v-if="displayField['travelSupplier.airline']" />
              <Input.CruiseLine
                v-if="displayField['travelSupplier.cruiseline']"
              />
              <Input.TourOperator
                v-if="displayField['travelSupplier.tourOperator']"
              />
            </div>
          </div>
          <div
            class="col-span-12 lg:col-span-6 sm:col-span-12 lg:mt-4 order-first lg:order-last"
          >
            <Input.HelpText />
          </div>
        </div>
      </template>
    </BaseFormGroup>

    <!-- Payment Info -->
    <BaseFormGroup
      :identifier="paymentIdentifier"
      :title="paymentFieldSet.title"
      :hint="paymentFieldSet?.hint"
    >
      <template #inner>
        <div
          class="grid grid-cols-12 sm:grid-cols-12 md:grid-cols-12 gap-4 gap-y-10 mt-5"
        >
          <div v-if="creditCardDisplayData" class="col-span-12">
            <p class="pb-3">The following payment methods are accepted:</p>
            <div class="flex w-12 sm:w-20">
              <img
                v-for="(card, index) in creditCardDisplayData"
                :key="index"
                :src="card.logoUrl"
                :alt="`We accept ${card.displayName}`"
                :title="`We accept ${card.displayName}`"
                class="pr-2"
              />
            </div>
          </div>

          <div
            v-if="displayField['creditCard.name']"
            class="col-span-12 lg:col-span-4 sm:col-span-12"
          >
            <Input.CreditCardName />
          </div>
          <div
            v-if="displayField['creditCard.number']"
            class="col-span-12 lg:col-span-4 sm:col-span-12 pt-2 sm:pt-0"
          >
            <Input.CreditCardNumber />
          </div>
          <div
            v-if="displayField['creditCard.expiry']"
            class="col-span-4 lg:col-span-2 sm:col-span-4 pt-2 sm:pt-0"
          >
            <Input.CreditCardExpiration />
          </div>
          <div
            v-if="displayField['creditCard.CVV']"
            class="col-span-4 lg:col-span-2 sm:col-span-4 pt-2 sm:pt-0"
          >
            <Input.CreditCardCVV />
          </div>
        </div>
        <div
          class="grid grid-cols-12 sm:grid-cols-12 md:grid-cols-12 gap-4 mt-10"
        >
          <div class="col-span-12">
            <Input.BillingCheckbox />
          </div>
        </div>
        <div
          v-if="!contentStore.getUseResidenceAddress"
          class="grid grid-cols-12 lg:grid-cols-12 gap-4 gap-y-10 mt-2 pt-5"
        >
          <div
            v-if="displayField['billing.street']"
            class="col-span-12 lg:col-span-6"
          >
            <Input.AddressAutoComplete
              v-if="addressLookupEnabled && isBillingUSResident"
              model-id="billingAddress"
              type="billing"
            />
            <Input.Address v-else model-id="billingAddress" type="billing" />
          </div>
          <div class="col-span-12 lg:col-span-6 pt-2 sm:pt-0">
            <Input.AddressSecondary
              model-id="billingAddressSecondary"
              type="billing"
            />
          </div>
          <div
            v-if="displayField['billing.city']"
            class="col-span-12 lg:col-span-4 pt-2 sm:pt-0"
          >
            <Input.City model-id="billingCity" type="billing" />
          </div>
          <div
            v-if="displayField['billing.stateProvince']"
            class="col-span-8 lg:col-span-2 sm:col-span-8 pt-2 sm:pt-0"
          >
            <Input.State model-id="billingState" type="billing" />
          </div>
          <div
            v-if="displayField['billing.postalCode']"
            class="col-span-4 lg:col-span-2 sm-col-span-4 pt-2 sm:pt-0"
          >
            <Input.Zip model-id="billingZip" type="billing" />
          </div>
          <div
            v-if="displayField['billing.country']"
            class="col-span-12 lg:col-span-4 sm-col-span-12 pt-2 sm:pt-0"
          >
            <Input.Country model-id="billingCountry" type="billing" />
          </div>
        </div>
      </template>
    </BaseFormGroup>

    <!-- Terms of Service -->
    <BaseFormGroup
      :identifier="tosIdentifier"
      :title="tosFieldSet?.title"
      :hint="tosFieldSet?.hint"
      :mobile-background-color="tosFieldSet?.mobileBackgroundColor"
      :hide-mobile-title="tosFieldSet?.hideMobileTitle"
      :class="'terms-of-service__fieldset'"
    >
      <template #inner>
        <div class="grid grid-cols-12 sm:grid-cols-12 md:grid-cols-11 gap-4">
          <div class="col-span-12">
            <Input.TermsOfService
              :clickthroughs="clickthroughsVerbose"
              :clickthroughs-non-modal-tag="clickthroughsNonModalTagNoSignature"
              :clickthroughs-in-link="clickthroughsInLink"
            />
          </div>
          <div
            v-if="clickthroughsToDisplayOnForm.length > 0"
            class="col-span-12"
          >
            <div
              v-for="clickthrough in clickthroughsToDisplayOnForm"
              :key="clickthrough.id"
            >
              <Input.ClickThrough
                v-if="displayField[`clickthrough.${clickthrough.id}`]"
                :id="clickthrough.id"
                :validation="clickthrough.validation"
                :messages="clickthrough.messages"
                :notes="clickthrough.notes"
                :data-type="clickthrough.type"
                :values="clickthrough.values"
              />
            </div>
          </div>
        </div>
      </template>
    </BaseFormGroup>

    <!-- Marketing -->
    <BaseFormGroup
      :identifier="marketingIdentifier"
      :title="marketingFieldSet?.title"
      :hint="marketingFieldSet?.hint"
      :mobile-background-color="marketingFieldSet?.mobileBackgroundColor"
      :hide-mobile-title="marketingFieldSet?.hideMobileTitle"
      :display="!hideMarketingOptin"
    >
      <template #inner>
        <div
          class="grid grid-cols-12 sm:grid-cols-12 md:grid-cols-11 gap-4 mt-5"
        >
          <div class="col-span-12">
            <Input.MarketingOptIn />
          </div>
        </div>
      </template>
    </BaseFormGroup>

    <div
      class="grid grid-cols-12 sm:grid-cols-12 md:grid-cols-11 gap-4 mt-5 mb-4"
    >
      <div v-if="showCaptcha" class="col-span-12">
        <CloudflareTurnstile />
      </div>
    </div>

    <div class="form-actions">
      <Input.SubmitButton class="w-full sm:w-auto" />
    </div>
  </section>

  <!-- eslint-disable -->
  <div class="purchase-summary__footer-mobile lg:hidden mt-5 text-center">
    <p>
      <a
        :href="privacyPolicyData.url"
        :title="privacyPolicyData.text"
        :target="privacyPolicyData.target"
      >
        {{ privacyPolicyData.text }}
      </a>
    </p>
    <p>
      {{ legalText }}
    </p>
    <!-- /.purchase-summary__footer-->
  </div>
  <!-- ./purchase-form -->
</template>

<style lang="scss">
  .purchase-form {
    &__subtext {
      font-size: 18px;
      font-weight: 700;
      line-height: 28px;
      letter-spacing: 0px;
    }

    .base-form-group {
      &__travelerDOB {
        @media (min-width: 1170px) {
          grid-column: span 2 / span 2;
        }
      }
      &__residence {
        @media (min-width: 1024px) {
          &__state {
            grid-column: span 2 / span 2;
          }
          &__select-state {
            grid-column: span 5 / span 5;
          }
          &__zip {
            grid-column-start: 1;
          }
          &__country {
            grid-column: span 3 / span 3;
          }
        }
        @media (min-width: 1190px) {
          &__state {
            grid-column: span 1 / span 1;
          }
          &__select-state {
            grid-column: span 5 / span 5;
          }
          &__zip {
            grid-column-start: auto;
          }
          &__country {
            grid-column: span 2 / span 2;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .terms-of-service__fieldset {
        margin-bottom: 20px;
        padding-bottom: 0;
      }
    }

    @media (max-width: 640px) {
      .trip-details__help-text {
        padding: 0;
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
      }
    }
  }

  .purchase-summary__footer-mobile {
    margin-bottom: 1.25rem;
  }
</style>
